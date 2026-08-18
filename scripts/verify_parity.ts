import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Dynamic/static parity verifier.
 *
 * The atlas ships as baked JSON with no API behind it, so the only thing
 * standing between a reader and a wrong number is that the bake matches what
 * the API would have answered. SJ-R013 rates a silent divergence critical.
 *
 * This compares every shipped payload against a live API response key by key,
 * and fails on the first difference rather than reporting a percentage. It
 * also refuses an artifact that carries files the bake did not produce — a
 * stale payload from an earlier run is exactly the kind of drift that looks
 * fine until someone cites it.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const REPORT_DIR = join(ROOT, "docs/generated");
const WORK_SLUG = "shanhaijing";
const LOCALES = ["zh-CN", "en"] as const;

const args = process.argv.slice(2);
const argValue = (name: string): string | undefined => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const API = (argValue("--api") ?? process.env.BAKE_API_URL ?? "http://localhost:4100").replace(/\/$/, "");
const DATA_DIR = resolve(argValue("--dist") ?? join(ROOT, "apps/web/dist/data"));

type Finding = { checkId: string; severity: "error" | "info"; message: string };
const findings: Finding[] = [];
let checks = 0;
const fail = (checkId: string, message: string): void => { findings.push({ checkId, severity: "error", message }); };
const note = (checkId: string, message: string): void => { findings.push({ checkId, severity: "info", message }); };

const sha256 = (data: string): string => createHash("sha256").update(data).digest("hex");

/** Sort keys everywhere so comparison sees content, not serialisation order. */
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value as Record<string, unknown>).sort()
      .map((key) => [key, stable((value as Record<string, unknown>)[key])]));
  }
  return value;
}

/** First differing paths, so a failure names the field instead of the file. */
function differences(live: unknown, baked: unknown, path = "$", found: string[] = []): string[] {
  if (found.length >= 12) return found;
  if (Array.isArray(live) && Array.isArray(baked)) {
    if (live.length !== baked.length) { found.push(`${path}: length ${live.length} (API) vs ${baked.length} (baked)`); return found; }
    for (const [index, item] of live.entries()) differences(item, baked[index], `${path}[${index}]`, found);
    return found;
  }
  if (live && baked && typeof live === "object" && typeof baked === "object") {
    const keys = new Set([...Object.keys(live), ...Object.keys(baked)]);
    for (const key of keys) {
      if (!(key in (live as object))) { found.push(`${path}.${key}: missing from the API response`); continue; }
      if (!(key in (baked as object))) { found.push(`${path}.${key}: missing from the baked artifact`); continue; }
      differences((live as Record<string, unknown>)[key], (baked as Record<string, unknown>)[key], `${path}.${key}`, found);
    }
    return found;
  }
  if (JSON.stringify(live) !== JSON.stringify(baked)) {
    found.push(`${path}: ${JSON.stringify(live)} (API) vs ${JSON.stringify(baked)} (baked)`);
  }
  return found;
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error(`GET ${path} → ${response.status}`);
  return response.json();
}

async function main(): Promise<void> {
  const targets = LOCALES.flatMap((locale) => [
    { file: `works.${locale}.json`, path: `/api/works?locale=${encodeURIComponent(locale)}` },
    { file: `atlas.${WORK_SLUG}.${locale}.json`, path: `/api/works/${WORK_SLUG}/atlas?locale=${encodeURIComponent(locale)}&detail=full` },
  ]);

  const present = new Set((await readdir(DATA_DIR)).filter((name) => name.endsWith(".json")));
  const comparisons: { file: string; bytes: number; sha256: string; differences: number }[] = [];

  for (const target of targets) {
    checks += 1;
    if (!present.delete(target.file)) { fail("PARITY-FILE", `烘焙产物缺少 ${target.file}`); continue; }
    const bakedRaw = await readFile(join(DATA_DIR, target.file), "utf8");
    const baked = stable(JSON.parse(bakedRaw));
    const live = stable(await fetchJson(target.path));
    checks += 1;
    const diff = differences(live, baked);
    if (diff.length > 0) {
      fail("PARITY-CONTENT", `${target.file}：${diff.length} 处差异 — ${diff.slice(0, 4).join("；")}`);
    }
    comparisons.push({ file: target.file, bytes: Buffer.byteLength(bakedRaw), sha256: sha256(bakedRaw), differences: diff.length });
  }

  checks += 1;
  if (present.size > 0) {
    fail("PARITY-EXTRA", `产物中含烘焙未产出的 JSON：${[...present].sort().join("、")}`);
  }

  // A payload that parses but carries nothing would pass a key-by-key
  // comparison against an equally empty API. Assert the corpus is actually there.
  for (const locale of LOCALES) {
    checks += 1;
    const raw = JSON.parse(await readFile(join(DATA_DIR, `atlas.${WORK_SLUG}.${locale}.json`), "utf8")) as
      { shanhaijing?: { passages?: unknown[]; creatures?: unknown[]; places?: unknown[] } };
    const domain = raw.shanhaijing;
    if (!domain?.passages?.length || !domain.creatures?.length || !domain.places?.length) {
      fail("PARITY-EMPTY", `atlas.${WORK_SLUG}.${locale}.json 的领域集合为空`);
    } else {
      note("PARITY-SIZE", `${locale}：${domain.passages.length} 段落、${domain.creatures.length} 概念、${domain.places.length} 地点`);
    }
  }

  const errors = findings.filter((finding) => finding.severity === "error");
  const summary = {
    generatedAt: new Date().toISOString(),
    generator: "scripts/verify_parity.ts",
    api: API,
    artifact: DATA_DIR.replace(`${ROOT}/`, ""),
    result: errors.length === 0 ? "pass" : "fail",
    checks,
    errors: errors.length,
    comparisons,
    findings,
  };
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(join(REPORT_DIR, "static-parity.json"), `${JSON.stringify(summary, null, 2)}\n`);
  const lines = [
    "# 《山海经 Atlas》dynamic/static parity 报告", "",
    "- 生成命令：`npm run verify:parity`",
    `- 生成时间：\`${summary.generatedAt}\``,
    `- 动态源：\`${summary.api}\``,
    `- 比对产物：\`${summary.artifact}\``,
    `- 检查结果：\`${summary.result}\`（${summary.checks} 检查，${summary.errors} 错误）`, "",
    "## 逐文件", "",
    "| 文件 | 字节 | SHA-256 | 差异 |",
    "|---|---|---|---|",
    ...comparisons.map((row) => `| \`${row.file}\` | ${row.bytes} | \`${row.sha256.slice(0, 16)}…\` | ${row.differences} |`),
    "",
    "## Findings", "",
    ...(findings.length === 0 ? ["无。"] : findings.map((finding) => `- [${finding.severity}] ${finding.checkId}: ${finding.message}`)),
    "",
  ];
  await writeFile(join(REPORT_DIR, "static-parity.md"), lines.join("\n"));
  console.log(`Shanhaijing parity ${summary.result}: ${checks} checks, ${errors.length} errors (${comparisons.length} files)`);
  console.log("Reports: docs/generated/static-parity.{json,md}");
  if (errors.length > 0) {
    for (const error of errors) console.error(`  [${error.checkId}] ${error.message}`);
    process.exitCode = 1;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
