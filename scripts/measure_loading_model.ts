import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { AtlasResponseSchema } from "../apps/web/src/types.js";

/**
 * 按需加载还是全量加载:用投影后的真实载荷量一次,而不是靠直觉。
 *
 * 冻结预算时把「单 locale atlas payload 原始字节」定在 300 KB 封顶,是拿错了尺子:
 * 读者付出的是**传输字节**与**解析时间**,不是磁盘上的 JSON 大小。这份 JSON 里
 * 大量重复的 key 与枚举值让 brotli 压得极狠,原始字节因此严重高估了代价。
 *
 * 这里把《南山经》的领域内容按《西山经》的文字体量投影放大,量四件事:
 * 传输字节、解析时间、schema 校验时间、以及全书规模的外推。
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const DIST = join(ROOT, "apps/web/dist/data");
const REPORT_DIR = join(ROOT, "docs/generated");
const ITERATIONS = Number(process.env.PERF_ITERATIONS ?? 40);

const kb = (bytes: number): number => Number((bytes / 1024).toFixed(1));
const percentile = (values: number[], p: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return Number((sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)] ?? 0).toFixed(3));
};
const time = (run: () => void): { p50: number; p95: number } => {
  for (let i = 0; i < 8; i++) run();
  const samples: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const started = process.hrtime.bigint();
    run();
    samples.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  return { p50: percentile(samples, 50), p95: percentile(samples, 95) };
};

const sizes = (text: string) => ({
  raw: Buffer.byteLength(text),
  gzip: gzipSync(Buffer.from(text), { level: 9 }).byteLength,
  brotli: brotliCompressSync(Buffer.from(text), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).byteLength,
});

/**
 * 把领域集合按倍数放大。复制出来的条目改写 slug 与 id，避免被当成同一实体，
 * 但保留原有的字段形状与文本长度——这正是要测的东西。
 */
function project(atlas: Record<string, unknown>, factor: number, realText: string[]): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(atlas)) as Record<string, unknown>;
  const domain = clone.shanhaijing as Record<string, unknown[]>;
  const copies = Math.max(0, Math.round(factor) - 1);
  for (const key of ["passages", "creatures", "occurrences", "places", "topologyEdges"]) {
    const original = domain[key] as Record<string, unknown>[];
    const grown = [...original];
    for (let copy = 1; copy <= copies; copy++) {
      for (const [index, item] of original.entries()) {
        const duplicate = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;
        // 复制文本压缩得过于漂亮——brotli 最擅长重复。把真实《西山经》原文塞进
        // 长文本字段，让压缩率面对真正不同的字，否则这个数是自欺。
        for (const field of ["textZh", "quoteZh", "summary", "detail"]) {
          if (typeof duplicate[field] === "string" && (duplicate[field] as string).length > 12) {
            duplicate[field] = realText[(index + copy * 7) % realText.length]!;
          }
        }
        if (typeof duplicate.slug === "string") duplicate.slug = `${duplicate.slug}-x${copy}`;
        if (typeof duplicate.id === "string") duplicate.id = duplicate.id.replace(/^.{8}/u, String(copy).padStart(8, "0"));
        for (const ref of ["creatureSlug", "passageSlug", "placeSlug", "fromSlug", "toSlug"]) {
          if (typeof duplicate[ref] === "string") duplicate[ref] = `${duplicate[ref]}-x${copy}`;
        }
        for (const ref of ["passageSlugs", "placeSlugs", "creatureSlugs"]) {
          if (Array.isArray(duplicate[ref])) duplicate[ref] = (duplicate[ref] as string[]).map((slug) => `${slug}-x${copy}`);
        }
        void index;
        grown.push(duplicate);
      }
    }
    domain[key] = grown;
  }
  return clone;
}

async function main(): Promise<void> {
  const currentText = await readFile(join(DIST, "atlas.shanhaijing.zh-CN.json"), "utf8");
  const current = JSON.parse(currentText) as Record<string, unknown>;
  const realText = (JSON.parse(await readFile(join(ROOT, "scripts/data/xishan_corpus_v1.json"), "utf8")) as { paragraphs: string[] }).paragraphs;

  // 《西山经》正文 5,681 字对《南山经》2,304 字 —— 2.47 倍；
  // 五藏山经全篇约为南山经的 12 倍（按 ctext 全文字数粗估）。
  const scenarios = [
    { name: "现状（南山经）", factor: 1 },
    { name: "南山经 + 西山经", factor: 3.5 },
    { name: "五藏山经全篇（外推）", factor: 12 },
  ];

  const rows = scenarios.map((scenario) => {
    const payload = scenario.factor === 1 ? current : project(current, scenario.factor, realText);
    const text = JSON.stringify(payload);
    const parsed = JSON.parse(text) as unknown;
    const domain = (payload.shanhaijing as Record<string, unknown[]>);
    return {
      scenario: scenario.name,
      factor: scenario.factor,
      passages: domain.passages.length,
      places: domain.places.length,
      bytes: sizes(text),
      jsonParse: time(() => { JSON.parse(text); }),
      zod: time(() => { AtlasResponseSchema.parse(parsed); }),
    };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    generator: "scripts/measure_loading_model.ts",
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    iterations: ITERATIONS,
    scenarios: rows,
  };
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(join(REPORT_DIR, "loading-model.json"), `${JSON.stringify(summary, null, 2)}\n`);

  const lines = [
    "# 加载模型实测：按需加载还是全量加载", "",
    "- 生成命令：`npm run measure:loading`",
    `- 生成时间：\`${summary.generatedAt}\``,
    `- 环境：Node ${summary.node} · ${summary.platform} · 每项 ${ITERATIONS} 次`, "",
    "把《南山经》的领域内容按文字体量投影放大，量传输与解析的真实代价。",
    "复制条目改写了 slug 与 id，长文本字段替换为**真实的《西山经》原文**——",
    "否则 brotli 面对的是重复内容，压缩率会漂亮得不像话，据此定预算就是自欺。", "",
    "| 场景 | 段落 | 地点 | 原始 | gzip | **brotli** | JSON.parse p95 | Zod p95 |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.map((row) =>
      `| ${row.scenario} | ${row.passages} | ${row.places} | ${kb(row.bytes.raw)} KB | ${kb(row.bytes.gzip)} KB | **${kb(row.bytes.brotli)} KB** | ${row.jsonParse.p95} ms | ${row.zod.p95} ms |`),
    "",
    `压缩比：brotli 后仅为原始体积的 ${(rows[0]!.bytes.brotli / rows[0]!.bytes.raw * 100).toFixed(1)}%——`,
    "这份 JSON 的 key、枚举值与句式高度重复，原始字节严重高估了读者实际付出的代价。",
    "",
  ].join("\n");
  await writeFile(join(REPORT_DIR, "loading-model.md"), lines);
  console.log(lines);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
