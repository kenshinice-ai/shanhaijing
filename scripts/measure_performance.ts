import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { readFile, readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { AtlasResponseSchema, WorksResponseSchema } from "../apps/web/src/types.js";

/**
 * Deterministic half of the performance baseline.
 *
 * `PERFORMANCE_BUDGETS.md` forbids freezing a threshold before a baseline
 * exists, and forbids calling a candidate value a pass. What can be measured
 * without a browser is measured here — every shipped byte, and the schema
 * validation the client must do before it can draw anything — with enough
 * repetitions to report a p95 rather than one lucky run.
 *
 * Runtime metrics (first paint, long tasks, interaction) need a real browser
 * and a stated device profile; they are recorded separately and must not be
 * inferred from these numbers.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const DIST = resolve(process.env.ATLAS_DIST ?? join(ROOT, "apps/web/dist"));
const REPORT_DIR = join(ROOT, "docs/generated");
const args = process.argv.slice(2);
const ITERATIONS = Number(process.env.PERF_ITERATIONS ?? 60);
const WARMUP = 10;

const percentile = (values: number[], p: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)] ?? 0;
};
const round = (value: number, digits = 2): number => Number(value.toFixed(digits));

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files.sort();
}

interface Timing { p50: number; p95: number; worst: number; runs: number }

/**
 * Frozen budgets, in the sense `PERFORMANCE_BUDGETS.md` §3 defines: measured
 * baseline first, then thresholds with room to grow. These four are frozen
 * because they are reproducible anywhere — bytes are bytes, and the parse
 * budget is a regression gate on this host, not a claim about anyone's phone.
 * Paint and interaction stay `candidate` until a real device profile exists.
 */
const BUDGETS = [
  { id: "first_load_brotli", unit: "KB", baseline: 105.6, target: 110, warning: 140, blocking: 180 },
  { id: "main_bundle_brotli", unit: "KB", baseline: 77.6, target: 80, warning: 100, blocking: 130 },
  { id: "atlas_payload_raw_per_locale", unit: "KB", baseline: 87.6, target: 120, warning: 200, blocking: 300 },
  { id: "zod_atlas_parse_p95", unit: "ms", baseline: 0.23, target: 1, warning: 5, blocking: 20 },
] as const;

function time(label: string, run: () => void): Timing {
  for (let i = 0; i < WARMUP; i++) run();
  const samples: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const started = process.hrtime.bigint();
    run();
    samples.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  void label;
  return { p50: round(percentile(samples, 50)), p95: round(percentile(samples, 95)), worst: round(Math.max(...samples)), runs: samples.length };
}

async function main(): Promise<void> {
  const files = await walk(DIST);
  const assets = [];
  let totalRaw = 0;
  let totalBrotli = 0;
  for (const file of files) {
    const bytes = await readFile(file);
    const gzip = gzipSync(bytes, { level: 9 }).byteLength;
    const brotli = brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).byteLength;
    totalRaw += bytes.byteLength;
    totalBrotli += brotli;
    assets.push({ path: relative(DIST, file), raw: bytes.byteLength, gzip, brotli });
  }

  // First-load set: what a browser must fetch before the atlas is usable in
  // the default locale. The English payload and the fonts are not in it —
  // fonts only download when a rare glyph is actually on screen.
  const firstLoad = ["index.html", "data/atlas.shanhaijing.zh-CN.json", "media/shanhaijing/artistic-overview-v1.svg"];
  const firstLoadAssets = assets.filter((asset) =>
    firstLoad.includes(asset.path) || asset.path.startsWith("assets/"));
  const firstLoadBrotli = firstLoadAssets.reduce((sum, asset) => sum + asset.brotli, 0);

  const payloads = [];
  for (const locale of ["zh-CN", "en"] as const) {
    const atlasRaw = await readFile(join(DIST, `data/atlas.shanhaijing.${locale}.json`), "utf8");
    const worksRaw = await readFile(join(DIST, `data/works.${locale}.json`), "utf8");
    const atlasParsed: unknown = JSON.parse(atlasRaw);
    const worksParsed: unknown = JSON.parse(worksRaw);
    payloads.push({
      locale,
      atlasBytes: Buffer.byteLength(atlasRaw),
      jsonParse: time(`json:${locale}`, () => { JSON.parse(atlasRaw); }),
      zodAtlas: time(`zod:atlas:${locale}`, () => { AtlasResponseSchema.parse(atlasParsed); }),
      zodWorks: time(`zod:works:${locale}`, () => { WorksResponseSchema.parse(worksParsed); }),
    });
  }

  const distStat = await stat(DIST);
  void distStat;
  const summary = {
    generatedAt: new Date().toISOString(),
    generator: "scripts/measure_performance.ts",
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    iterations: ITERATIONS,
    artifact: relative(ROOT, DIST),
    totals: { files: assets.length, raw: totalRaw, brotli: totalBrotli },
    firstLoad: {
      files: firstLoadAssets.map((asset) => asset.path),
      raw: firstLoadAssets.reduce((sum, asset) => sum + asset.raw, 0),
      brotli: firstLoadBrotli,
    },
    assets,
    payloads,
    budgets: BUDGETS,
  };

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(join(REPORT_DIR, "performance-baseline.json"), `${JSON.stringify(summary, null, 2)}\n`);
  const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} KB`;
  const lines = [
    "# 《山海经 Atlas》性能基线（确定性部分）", "",
    "- 生成命令：`npm run measure:performance`",
    `- 生成时间：\`${summary.generatedAt}\``,
    `- 环境：Node ${summary.node} · ${summary.platform} · 每项 ${ITERATIONS} 次（另有 ${WARMUP} 次预热）`,
    `- 产物：\`${summary.artifact}\``, "",
    "本报告只覆盖可离线复现的部分：产物字节与客户端必须完成的 schema 校验。",
    "首屏绘制、长任务与交互延迟需要真实浏览器与设备档位，另行记录，不得由本表推断。", "",
    "## 1. 产物体积", "",
    `- 全部产物：${summary.totals.files} 个文件，${kb(summary.totals.raw)}（brotli ${kb(summary.totals.brotli)}）`,
    `- 首屏必需集：${kb(summary.firstLoad.raw)}（brotli ${kb(summary.firstLoad.brotli)}）—— ${summary.firstLoad.files.join("、")}`,
    "",
    "| 文件 | 原始 | gzip | brotli |",
    "|---|---|---|---|",
    ...assets.map((asset) => `| \`${asset.path}\` | ${kb(asset.raw)} | ${kb(asset.gzip)} | ${kb(asset.brotli)} |`),
    "",
    "## 2. 解析与校验", "",
    "Zod 校验是客户端在能画出任何东西之前必须付出的代价，因此单列，不与 fetch 合并成一个数。", "",
    "| locale | payload | JSON.parse p50 / p95 | Zod atlas p50 / p95 | Zod works p95 |",
    "|---|---|---|---|---|",
    ...payloads.map((row) =>
      `| ${row.locale} | ${kb(row.atlasBytes)} | ${row.jsonParse.p50} / ${row.jsonParse.p95} ms | ${row.zodAtlas.p50} / ${row.zodAtlas.p95} ms | ${row.zodWorks.p95} ms |`),
    "",
    `最差单次：${payloads.map((row) => `${row.locale} Zod ${row.zodAtlas.worst} ms`).join("、")}。`,
    "",
  ];
  await writeFile(join(REPORT_DIR, "performance-baseline.md"), lines.join("\n"));
  console.log(`Performance baseline: ${assets.length} files, ${kb(totalRaw)} raw / ${kb(totalBrotli)} brotli; first load ${kb(firstLoadBrotli)} brotli`);
  for (const row of payloads) console.log(`  ${row.locale}: JSON.parse p95 ${row.jsonParse.p95} ms, Zod atlas p95 ${row.zodAtlas.p95} ms`);
  console.log("Reports: docs/generated/performance-baseline.{json,md}");

  // --check turns the report into a gate. Without it a budget is a wish.
  if (args.includes("--check")) {
    const mainBundle = assets.filter((asset) => asset.path.endsWith(".js")).reduce((max, asset) => Math.max(max, asset.brotli), 0);
    const measured: Record<string, number> = {
      first_load_brotli: firstLoadBrotli / 1024,
      main_bundle_brotli: mainBundle / 1024,
      atlas_payload_raw_per_locale: Math.max(...payloads.map((row) => row.atlasBytes)) / 1024,
      zod_atlas_parse_p95: Math.max(...payloads.map((row) => row.zodAtlas.p95)),
    };
    let breached = false;
    for (const budget of BUDGETS) {
      const value = round(measured[budget.id] ?? 0);
      const state = value > budget.blocking ? "fail" : value > budget.warning ? "warn" : "pass";
      if (state === "fail") breached = true;
      console.log(`  [${state}] ${budget.id}: ${value}${budget.unit} (target ${budget.target} / warn ${budget.warning} / block ${budget.blocking})`);
    }
    if (breached) {
      console.error("性能预算被越过:见上表。放宽阈值不是修复手段。");
      process.exitCode = 1;
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
