import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * 从冻结语料确定性产出《西山经》底本 seed。
 *
 * 本 seed **只装文本**:底本、四列山系、82 段原文与逐段 checksum。异兽、提及、
 * 地点、拓扑与分类一概不装——那些是逐条编辑判断，不是抓取所得，把它们混进
 * 「冻结语料」会让 coverage 统计分不清「文本已冻结」与「内容已审核」。
 *
 * 段落一律以 draft 入库:文本已冻结，但尚未逐段审核，因此不进 API、不进产物。
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const CORPUS = join(ROOT, "scripts/data/xishan_corpus_v1.json");
const OUT = join(ROOT, "db/seeds/006_xishan_corpus.sql");

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const q = (value: string): string => `'${value.replace(/'/gu, "''")}'`;
const uuid = (prefix: string, index: number): string => `${prefix}-4000-8000-${String(index).padStart(12, "0")}`;
const ED = uuid("21000000-0000", 1);
const SEC = (index: number): string => uuid("22000000-0000", index);
const PAS = (index: number): string => uuid("23000000-0000", index);

interface Corpus {
  retrievedAt: string;
  segmentation: string;
  sources: { role: string; url: string; sha256: string; note: string }[];
  collation: { orthographicPairs: unknown[]; orthographicOccurrences: number; pendingRulings: unknown[]; embeddedCollationNotes: unknown[]; guoPuAnnotations: number };
  paragraphs: string[];
}

const SECTIONS = [
  { slug: "xishan-first-route", zh: "西山经·华山首列", en: "Xishan Jing · Huashan first route", label: "西山经之首", marker: /^《西山經》|^《西經》/u },
  { slug: "xici2-route", zh: "西山经·西次二经", en: "Xishan Jing · second route", label: "西次二经", marker: /^《西次二經》/u },
  { slug: "xici3-route", zh: "西山经·西次三经", en: "Xishan Jing · third route", label: "西次三经", marker: /^《西次三經》/u },
  { slug: "xici4-route", zh: "西山经·西次四经", en: "Xishan Jing · fourth route", label: "西次四经", marker: /^《西次四經》/u },
];

/** 段落标题:原文自带的地名优先,取不到就明确标为待定,不编造。 */
function referenceKey(paragraph: string, sectionLabel: string, isFinalColophon: boolean, index: number): { key: string; named: boolean } {
  if (isFinalColophon) return { key: "西山经·结语", named: true };
  if (/^凡/u.test(paragraph)) return { key: `西山经·${sectionLabel}·祠礼`, named: true };
  const patterns = [
    // 「至X山之尾」说的是同一座山的另一端,不能和「曰X山」撞成同一个 key。
    /至([㐀-鿿\u{20000}-\u{2ffff}]{1,4}?)山之尾/u,
    /曰([㐀-鿿\u{20000}-\u{2ffff}]{1,4}?)之[山丘]/u,
    /曰([㐀-鿿\u{20000}-\u{2ffff}]{1,4}?)山/u,
    /至于([㐀-鿿\u{20000}-\u{2ffff}]{1,4}?)之[山丘]/u,
    /至([㐀-鿿\u{20000}-\u{2ffff}]{1,4}?)山/u,
    /曰([㐀-鿿\u{20000}-\u{2ffff}]{1,3})，/u,
  ];
  for (const [index_, pattern] of patterns.entries()) {
    const match = pattern.exec(paragraph);
    if (match?.[1]) return { key: `西山经·${match[1]}${index_ === 0 ? "山之尾" : ""}`, named: true };
  }
  return { key: `西山经·待定第${index}段`, named: false };
}

const slugify = (index: number): string => `xishan-p${String(index).padStart(3, "0")}`;

async function main(): Promise<void> {
  const corpus = JSON.parse(await readFile(CORPUS, "utf8")) as Corpus;
  const paragraphs = corpus.paragraphs;
  if (paragraphs.length !== 82) throw new Error(`语料应为 82 段,实得 ${paragraphs.length}`);

  // 山系边界由原文的篇题与结语决定,不硬编码段号。
  const bounds: number[] = [];
  paragraphs.forEach((paragraph, index) => {
    if (index === 0) { bounds.push(0); return; }
    if (SECTIONS.some((section) => section.slug !== "xishan-first-route" && section.marker.test(paragraph))) bounds.push(index);
  });
  if (bounds.length !== SECTIONS.length) throw new Error(`应识别出 ${SECTIONS.length} 列山系,实得 ${bounds.length}`);

  const base = corpus.sources.find((source) => source.role === "base")!;
  // edition checksum 的口径必须与 verify:domain 一致：按顺序换行连接**规范化后**的
  // 段落再取 sha256。两处各算各的，迟早会出现"校验通过但对不上"的假安全。
  const normalize = (text: string): string => text.replace(/[\s，。、；：「」『』（）《》〈〉？！·]/gu, "");
  const editionChecksum = sha256(paragraphs.map(normalize).join("\n"));
  const lines: string[] = [
    "-- 006:《西山经》冻结语料（由 scripts/generate_xishan_seed.ts 确定性生成，勿手改）",
    "--",
    `-- 底本:${base.url}`,
    `-- 取回:${corpus.retrievedAt}    原始文件 SHA-256:${base.sha256}`,
    `-- 切分:${corpus.segmentation}    edition checksum:${editionChecksum}`,
    "--",
    "-- 依 X-2 裁定:异体字不算异文,底本照 ctext 印出的字形录入;",
    `-- 已丢弃异体差异 ${corpus.collation.orthographicOccurrences} 处,登记待裁差异 ${corpus.collation.pendingRulings.length} 处。`,
    "-- 段落以 draft 入库:文本已冻结,尚未逐段审核,因此不进 API 与产物。",
    "",
    "BEGIN;",
    "",
    `INSERT INTO shj_text_editions (id, work_id, scope, slug, title, source_url, source_note, rights_status, checksum_sha256, is_baseline, review_status)`,
    `SELECT ${q(ED)}, w.id, 'xishan', 'xishan-v1-public-domain-collation', '《西山经》公版校勘本 v1',`,
    `  ${q(base.url)},`,
    `  ${q(`白文底本取自 ctext（${corpus.retrievedAt}），与维基文库本（含郭璞注）逐段校核。依 X-2：异体字不算异文，底本照印出字形录入；待裁差异 ${corpus.collation.pendingRulings.length} 处登记于 scripts/data/xishan_corpus_v1.json。`)},`,
    `  'verified', ${q(editionChecksum)}, true, 'reviewed'`,
    `  FROM works w WHERE w.slug='shanhaijing'`,
    `ON CONFLICT (work_id, slug) DO UPDATE SET checksum_sha256=EXCLUDED.checksum_sha256, source_note=EXCLUDED.source_note;`,
    "",
  ];

  SECTIONS.forEach((section, index) => {
    lines.push(
      `INSERT INTO shj_text_sections (id, edition_id, slug, sequence, reference_label, title_zh, title_en, review_status)`,
      `VALUES (${q(SEC(index + 1))}, ${q(ED)}, ${q(section.slug)}, ${index + 1}, ${q(section.label)}, ${q(section.zh)}, ${q(section.en)}, 'draft')`,
      `ON CONFLICT (id) DO UPDATE SET title_zh=EXCLUDED.title_zh, title_en=EXCLUDED.title_en;`,
      "",
    );
  });

  let unnamed = 0;
  const usedKeys = new Map<number, Set<string>>();
  const collisions: string[] = [];
  paragraphs.forEach((paragraph, index) => {
    const sectionIndex = bounds.filter((bound) => bound <= index).length - 1;
    const section = SECTIONS[sectionIndex]!;
    const sequenceInSection = index - bounds[sectionIndex]! + 1;
    const isFinal = index === paragraphs.length - 1;
    const { key, named } = referenceKey(paragraph, section.label, isFinal, index + 1);
    if (!named) unnamed += 1;
    // reference_key 在同一山系内唯一（schema 有此约束）。原文里同一座山确实会
    // 出现两段,兜底加序而不是让 seed 在装载时炸——但要记下来,因为它多半意味着
    // 抽取规则漏了一种写法。
    const seen = usedKeys.get(sectionIndex) ?? new Set<string>();
    let unique = key;
    let suffix = 2;
    while (seen.has(unique)) { unique = `${key}·其${["", "", "二", "三", "四"][suffix] ?? suffix}`; suffix += 1; }
    if (unique !== key) collisions.push(`${key} → ${unique}（第 ${index + 1} 段）`);
    seen.add(unique);
    usedKeys.set(sectionIndex, seen);
    lines.push(
      `INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)`,
      `VALUES (${q(PAS(index + 1))}, ${q(SEC(sectionIndex + 1))}, ${q(slugify(index + 1))}, ${q(unique)}, ${sequenceInSection},`,
      `  ${q(paragraph)}, ${q(normalize(paragraph))},`,
      `  ${q(base.url)}, ${q(`第 ${index + 1} 段`)}, ${q(sha256(normalize(paragraph)))}, 'draft', 'punctuation-stripped-v1')`,
      `ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,`,
      `  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;`,
      "",
    );
  });

  lines.push("COMMIT;", "");
  await writeFile(OUT, lines.join("\n"));
  const perSection = SECTIONS.map((section, index) => {
    const start = bounds[index]!;
    const end = index + 1 < bounds.length ? bounds[index + 1]! : paragraphs.length;
    return `${section.label} ${end - start} 段`;
  });
  console.log(`006 written: 82 段 / ${SECTIONS.length} 列（${perSection.join("、")}）`);
  console.log(`  edition checksum ${editionChecksum}`);
  console.log(`  未能从原文取到地名、以「待定」入库的段落:${unnamed}`);
  console.log(collisions.length === 0 ? "  同山系内无 reference_key 冲突" : `  同山系内 key 冲突并加序:${collisions.join("；")}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
