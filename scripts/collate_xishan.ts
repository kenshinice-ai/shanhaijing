import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * 《西山经》语料校勘与冻结。
 *
 * 决策 X-2（2026-08-18）：**异体字不算异文**。因此底本照 ctext 印出的字形录入，
 * 异体差异不产生 variant 记录——否则这一篇会凭空多出几十条噪声，把真正的分歧淹掉。
 *
 * 但"不算异文"不等于"随手判定"。下面的异体对照表是逐条列出的，每条带理由；
 * **不在表内的差异一律进入 pendingRulings，不做猜测**。这样古籍编辑复核的是一张
 * 有限的、可逐条否决的表，而不是一个黑箱分类器。
 *
 * 输入是两个已下载的原始文件（记录 SHA-256），输出是冻结语料 JSON。
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const OUT = join(ROOT, "scripts/data/xishan_corpus_v1.json");

const RULINGS = join(ROOT, "scripts/data/xishan_rulings_v1.json");
const BASE_URL = "https://ctext.org/shan-hai-jing/xi-shan-jing/zh";
const CROSS_URL = "https://zh.wikisource.org/wiki/山海經/西山經";

/**
 * 异体字对照表：`ctext 字 → 维基文库字`，按 X-2 视为同一个词的不同写法。
 * 理由分三类：`variant`(异体/俗字)、`orthographic`(正字法差异)、`compound`(专名或联绵词内的写法差异)。
 */
const ORTHOGRAPHIC: Record<string, { with: string; kind: string; note: string }> = {
  "崙": { with: "昆", kind: "compound", note: "崑崙／昆侖，专名写法" },
  "花": { with: "華", kind: "orthographic", note: "華为古字，花为后起字" },
  "葱": { with: "蔥", kind: "variant", note: "同字异形" },
  "鱉": { with: "鼈", kind: "variant", note: "同字异形" },
  "囂": { with: "嚻", kind: "variant", note: "同字异形" },
  "柟": { with: "枏", kind: "variant", note: "楠木，同字异形" },
  "床": { with: "牀", kind: "variant", note: "牀为本字" },
  "鷄": { with: "雞", kind: "variant", note: "同字异形" },
  "鬣": { with: "鬛", kind: "variant", note: "同字异形" },
  "塗": { with: "涂", kind: "variant", note: "同字异形" },
  "槀": { with: "稾", kind: "variant", note: "稿之异体" },
  "泰": { with: "㤗", kind: "variant", note: "同字异形" },
  "彩": { with: "采", kind: "orthographic", note: "采为古字" },
  "㕄": { with: "厎", kind: "variant", note: "同字异形" },
  "輩": { with: "軰", kind: "variant", note: "俗字" },
  "間": { with: "閒", kind: "orthographic", note: "閒为本字" },
  "鼓": { with: "皷", kind: "variant", note: "俗字" },
  "鵰": { with: "雕", kind: "orthographic", note: "雕／鵰同词" },
  "鵔": { with: "鵕", kind: "variant", note: "鵔鸃／鵕鸃，专名写法" },
  "徇": { with: "狥", kind: "variant", note: "俗字" },
  "榴": { with: "橊", kind: "variant", note: "同字异形" },
  "淫": { with: "滛", kind: "variant", note: "俗字" },
  "蜂": { with: "蠭", kind: "orthographic", note: "蠭为古字" },
  "達": { with: "逹", kind: "variant", note: "俗字" },
  "游": { with: "遊", kind: "orthographic", note: "游／遊在此为同词" },
  "髮": { with: "髪", kind: "variant", note: "同字异形" },
  "蝟": { with: "猬", kind: "variant", note: "同字异形" },
  "獋": { with: "獆", kind: "variant", note: "同字异形" },
  "窮": { with: "藭", kind: "compound", note: "芎藭，联绵词内写法" },
  "冡": { with: "塚", kind: "variant", note: "冢之异体" },
  "滑": { with: "䱻", kind: "compound", note: "滑魚／䱻魚，鱼名写法" },
  // 以下两对由 SJ-D022 逐条裁定为同词异写，并入本表。
  "源": { with: "原", kind: "orthographic", note: "『原』为『源』之古字（SJ-D022）" },
  "瓜": { with: "𤓰", kind: "variant", note: "同字异形（SJ-D022）" },
};
/** 同一个 ctext 字在不同段落可能对到不止一种写法。 */
const ORTHOGRAPHIC_EXTRA: [string, string][] = [["冡", "冢"], ["柟", "㮨"], ["于", "於"], ["於", "于"]];

/**
 * 专名与联绵词的整词写法差异。逐字对齐会把「崑崙／昆侖」拆成一次替换加一次插入，
 * 看上去像两处异文,其实是一个词的两种写法——按 X-2 同属异体,先规范化再比对。
 */
const COMPOUND_FORMS: [string, string, string][] = [
  ["崑崙", "昆侖", "专名:崑崙山"],
  ["崙", "侖", "专名用字"],
  ["芎窮", "芎藭", "联绵词:芎藭"],
];

const sha256 = (data: string | Buffer): string => createHash("sha256").update(data).digest("hex");
const NORM = /[\s，。、；：「」『』（）《》〈〉？！·]/gu;
const norm = (text: string): string => {
  let out = text.replace(NORM, "");
  // 整词规范化在逐字对齐之前完成,两侧同样处理。
  for (const [a, b] of COMPOUND_FORMS) out = out.split(a).join(b);
  return out;
};

function extractCtext(html: string): string[] {
  return [...html.replace(/<script[\s\S]*?<\/script>/gu, "").matchAll(/<td class="ctext"[^>]*>([\s\S]*?)<\/td>/gu)]
    .map((match) => match[1]!.replace(/<[^>]+>/gu, "").replace(/&[a-z]+;/gu, "").trim())
    .filter((text) => text.length > 4);
}

function extractWikisource(html: string): { text: string; notes: string[]; collationNotes: string[] }[] {
  const cleaned = html.replace(/<script[\s\S]*?<\/script>/gu, "").replace(/<style[\s\S]*?<\/style>/gu, "");
  const body = cleaned.slice(cleaned.indexOf("mw-parser-output"));
  return [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gu)]
    .map((match) => {
      // 校语在结构里,不在文字里:维基文库用 <span class="variant-tooltip">一作「遂」</span>
      // 标注异文。必须先按标签摘走再压平——扁平化之后校语和正文粘成一片,
      // 每条校语都会伪装成一处异文。
      const raw = match[1]!;
      const collationNotes = [...raw.matchAll(/<span class="variant-tooltip">([\s\S]*?)<\/span>/gu)]
        .map((m) => m[1]!.replace(/<[^>]+>/gu, "").trim())
        .filter(Boolean);
      const text = raw
        .replace(/<span class="variant-tooltip">[\s\S]*?<\/span>/gu, "")
        .replace(/<[^>]+>/gu, "")
        .replace(/&#\d+;/gu, "")
        .replace(/&[a-z]+;/gu, "")
        .trim();
      const notes = [...text.matchAll(/〈([^〉]*)〉/gu)].map((m) => m[1]!);
      return { text: text.replace(/〈[^〉]*〉/gu, ""), notes, collationNotes };
    })
    .filter((entry) => entry.text.length > 8);
}

/**
 * 字符级对齐,取出替换、插入与删除。
 *
 * 按**码位**而非 UTF-16 码元切分:西山经有二十余个扩展 B 区字,按码元切会把代理对
 * 劈成两半,于是每个生僻字都凭空变成两处"异文",还会在报告里留下 U+FFFD。
 */
function align(source: string, target: string): { t: "same" | "sub" | "ins" | "del"; a?: string; b?: string }[] {
  const a = [...source]; const b = [...target];
  const n = a.length; const m = b.length;
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const ops: { t: "same" | "sub" | "ins" | "del"; a?: string; b?: string }[] = [];
  let i = 0; let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ t: "same" }); i++; j++; }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) { ops.push({ t: "del", a: a[i] }); i++; }
    else { ops.push({ t: "ins", b: b[j] }); j++; }
  }
  while (i < n) { ops.push({ t: "del", a: a[i++] }); }
  while (j < m) { ops.push({ t: "ins", b: b[j++] }); }
  // 相邻的 del+ins 合并为一次替换
  const merged: typeof ops = [];
  for (let k = 0; k < ops.length; k++) {
    if (ops[k]!.t === "del" && ops[k + 1]?.t === "ins") { merged.push({ t: "sub", a: ops[k]!.a, b: ops[k + 1]!.b }); k++; }
    else merged.push(ops[k]!);
  }
  return merged;
}

function isOrthographic(from: string, to: string): { kind: string; note: string } | null {
  const entry = ORTHOGRAPHIC[from];
  if (entry && entry.with === to) return { kind: entry.kind, note: entry.note };
  for (const [a, b] of ORTHOGRAPHIC_EXTRA) if (a === from && b === to) return { kind: "variant", note: "同字异形" };
  return null;
}

interface Ruling {
  paragraph: number;
  pair: string;
  decision: "keep_base" | "adopt_cross" | "unresolved" | "orthographic" | "provisional";
  basis: string;
  confidence: string;
  note: string;
  find?: string;
  replace?: string;
  signatures?: string[];
}


async function main(): Promise<void> {
  const [baseRaw, crossRaw] = await Promise.all([
    readFile(join(ROOT, process.env.XISHAN_BASE_HTML ?? "scripts/data/.cache/xishan-ctext.html")),
    readFile(join(ROOT, process.env.XISHAN_CROSS_HTML ?? "scripts/data/.cache/xishan-wikisource.html")),
  ]);
  const baseRawText = extractCtext(baseRaw.toString("utf8"));
  const cross = extractWikisource(crossRaw.toString("utf8"));
  const rulings = (JSON.parse(await readFile(RULINGS, "utf8")) as { rulings: Ruling[] }).rulings;

  /*
   * 裁决落地（SJ-D022）。
   *
   * `adopt_cross` 用显式的 find/replace 落到底本上，并断言在该段中恰好出现一次——
   * 位置靠上下文锚定，不靠字符偏移，因为偏移会随前面的改动漂移。
   */
  const base = [...baseRawText];
  for (const ruling of rulings) {
    if (ruling.decision !== "adopt_cross") continue;
    const index = ruling.paragraph - 1;
    const paragraph = base[index];
    if (paragraph === undefined) throw new Error(`裁决指向不存在的段落 ${ruling.paragraph}`);
    const hits = paragraph.split(ruling.find!).length - 1;
    if (hits !== 1) throw new Error(`段${ruling.paragraph} 的锚点「${ruling.find}」出现 ${hits} 次，无法安全替换`);
    base[index] = paragraph.replace(ruling.find!, ruling.replace!);
  }
  if (base.length !== 82) throw new Error(`底本段落数应为 82,实得 ${base.length}`);
  if (cross.length !== base.length) throw new Error(`校核本段落数 ${cross.length} 与底本 ${base.length} 不一致,无法逐段对齐`);

  const orthographic: Record<string, { count: number; kind: string; note: string }> = {};
  const embeddedNotes: { paragraph: number; note: string }[] = [];
  const embeddedCollationNotes: { paragraph: number; note: string }[] = [];
  const settled: { paragraph: number; signature: string; decision: string; basis: string; confidence: string; note: string }[] = [];
  const matchedSignatures = new Set<string>();
  const unmatched: string[] = [];
  const pendingRulings: { paragraph: number; base: string; cross: string; context: string }[] = [];

  for (const [index, paragraph] of base.entries()) {
    const a = norm(paragraph);
    const b = norm(cross[index]!.text);
    for (const note of cross[index]!.notes) embeddedNotes.push({ paragraph: index + 1, note });
    for (const note of cross[index]!.collationNotes) embeddedCollationNotes.push({ paragraph: index + 1, note });
    if (a === b) continue;
    const aPoints = [...a];
    let position = 0;
    for (const op of align(a, b)) {
      if (op.t === "same") { position++; continue; }
      const signature = op.t === "sub" ? `sub:${op.a}→${op.b}` : op.t === "ins" ? `ins:${op.b}` : `del:${op.a}`;
      if (op.t === "sub") {
        const known = isOrthographic(op.a!, op.b!);
        if (known) {
          const key = `${op.a}→${op.b}`;
          orthographic[key] = { count: (orthographic[key]?.count ?? 0) + 1, kind: known.kind, note: known.note };
          position++;
          continue;
        }
      }
      // 残留差异必须能对上一条裁决。对不上就是漏网,宁可让生成失败,
      // 也不能让一处未经裁决的异文悄悄留在册子里。
      const ruling = rulings.find((r) => r.paragraph === index + 1 && (r.signatures ?? []).includes(signature));
      if (!ruling) {
        unmatched.push(`段${index + 1} ${signature}`);
        position += op.t === "ins" ? 0 : 1;
        continue;
      }
      matchedSignatures.add(`${index + 1}|${signature}`);
      // `provisional` 取倾向读法作工作底本，但单独计数——它比 keep_base 弱，
      // 专家复核应当优先重看这一档，所以不能混进「已定案」里蒙混过去。
      if (ruling.decision === "unresolved") {
        pendingRulings.push({
          paragraph: index + 1, base: op.a ?? "", cross: op.b ?? "",
          context: aPoints.slice(Math.max(0, position - 10), position + 10).join(""),
          note: ruling.note,
        });
      } else {
        settled.push({ paragraph: index + 1, signature, decision: ruling.decision, basis: ruling.basis, confidence: ruling.confidence, note: ruling.note });
      }
      if (op.t !== "ins") position++;
    }
  }

  // 双向覆盖:既不许有差异没被裁决,也不许裁决表里有条目从未命中——
  // 后者说明裁决表已经与文本脱节。
  if (unmatched.length > 0) {
    console.error(`以下差异没有对应裁决（共 ${unmatched.length} 处）：`);
    for (const item of unmatched) console.error(`  ${item}`);
    throw new Error("裁决表未覆盖全部差异");
  }
  const unusedRulings = rulings.filter((r) =>
    r.decision !== "adopt_cross" && (r.signatures ?? []).length > 0
    && !(r.signatures ?? []).some((sig) => [...matchedSignatures].some((m) => m.endsWith(`|${sig}`) && m.startsWith(`${r.paragraph}|`))));
  if (unusedRulings.length > 0) {
    console.error("以下裁决从未命中任何差异（裁决表与文本脱节）：");
    for (const r of unusedRulings) console.error(`  段${r.paragraph} ${r.pair}`);
    throw new Error("裁决表存在失效条目");
  }

  const corpus = {
    work: "shanhaijing",
    scope: "xishan",
    segmentation: "xishan-full-v1",
    retrievedAt: "2026-08-18",
    policy: {
      decision: "X-2 (2026-08-18)：异体字不算异文；SJ-D022 (2026-08-19)：逐条裁决，未决者标明",
      rulings: "scripts/data/xishan_rulings_v1.json",
      caveat: "裁决由非古籍专家作出，未经专家复核；每条附依据与置信度，可被推翻",
      legacyDecision: "X-2 (2026-08-18)：异体字不算异文",
      baseline: "底本照 ctext 印出的字形录入；异体差异不产生 variant 记录",
      pending: "对照表之外的一切差异进入 pendingRulings，等待古籍编辑逐条裁定，不做猜测",
    },
    sources: [
      { role: "base", url: BASE_URL, sha256: sha256(baseRaw), note: "白文,无注" },
      { role: "cross_check", url: CROSS_URL, sha256: sha256(crossRaw), note: "含郭璞注,比对前已剥离〈〉夹注" },
    ],
    collation: {
      orthographicPairs: Object.entries(orthographic)
        .map(([pair, value]) => ({ pair, ...value }))
        .sort((a, b) => b.count - a.count || a.pair.localeCompare(b.pair)),
      orthographicOccurrences: Object.values(orthographic).reduce((sum, value) => sum + value.count, 0),
      compoundForms: COMPOUND_FORMS.map(([from, to, note]) => ({ from, to, note })),
      // 已裁决的差异连同依据与置信度留在册子里——裁决必须可复核、可推翻。
      settled,
      settledCount: settled.filter((x) => x.decision !== "provisional").length,
      provisionalCount: settled.filter((x) => x.decision === "provisional").length,
      guoPuAnnotations: embeddedNotes.length,
      embeddedCollationNotes,
      pendingRulings,
    },
    paragraphs: base,
  };

  await writeFile(OUT, `${JSON.stringify(corpus, null, 1)}\n`);
  const editionChecksum = sha256(base.join("\n"));
  console.log(`西山经语料:${base.length} 段,edition checksum ${editionChecksum}`);
  console.log(`  异体字差异:${corpus.collation.orthographicPairs.length} 对 / ${corpus.collation.orthographicOccurrences} 处 —— 按 X-2 丢弃,不入 variant`);
  console.log(`  郭璞注条目:${embeddedNotes.length}（不进 baseline）`);
  console.log(`  维基文库「一作X」校语:${embeddedCollationNotes.length} 条（登记,不改 baseline）`);
  const provisional = settled.filter((x) => x.decision === "provisional").length;
  console.log(`  已定案:${settled.filter((x) => x.decision === "keep_base").length} 沿用底本 + ${rulings.filter((r) => r.decision === "adopt_cross").length} 采校核本`);
  console.log(`  暂定（证据有倾向但不足以定案）:${provisional} 处`);
  console.log(`  仍未决:${pendingRulings.length} 处`);
  console.log(`written: ${OUT}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
