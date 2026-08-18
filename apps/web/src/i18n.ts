import type { Locale } from "./types";

type Pair = readonly [string, string];
const pick = (pair: Pair, locale: Locale): string => pair[locale === "zh-CN" ? 0 : 1];

/**
 * API enum values that reach the interface.
 *
 * Only the enums this atlas actually returns are listed. A value with no entry
 * degrades to a readable form rather than showing a raw identifier.
 */
const ENUMS: Record<string, Pair> = {
  // work
  mythography: ["古籍博物志", "Ancient mythography"],
  documented_record: ["文献记录", "Documented record"],
  // sources
  primary_text: ["原始文本", "Primary text"], scholarly: ["学术研究", "Scholarly"],
  historical: ["历史记载", "Historical"], reference: ["参考资料", "Reference"],
  map: ["地图", "Map"], image: ["图像", "Image"], primary: ["一手", "Primary"],
  // creature concept status
  resolved: ["已归并", "Resolved"], provisional: ["暂定", "Provisional"],
  disputed: ["有争议", "Disputed"], superseded: ["已替代", "Superseded"],
  // place kinds
  mountain: ["山", "Mountain"], mountain_range: ["山系", "Mountain range"], river: ["水", "River"],
  water_source: ["水源", "Water source"], marsh: ["泽", "Marsh"], sea: ["海", "Sea"],
  region: ["地域", "Region"], route_node: ["路径节点", "Route node"], unknown: ["未定", "Undetermined"],
  // evidence layering
  text_direct: ["原文直证", "Direct text"], commentary: ["注疏", "Commentary"], research: ["研究", "Research"], none: ["无", "None"],
  transcription: ["原文转录", "Transcription"], editorial_summary: ["编辑归纳", "Editorial synthesis"],
  scholarly_hypothesis: ["学术假说", "Scholarly hypothesis"], artistic_interpretation: ["艺术演绎", "Artistic interpretation"],
  high: ["高", "High"], medium: ["中", "Medium"], low: ["低", "Low"],
  // artistic overview lifecycle
  planned: ["规划中", "Planned"],
  blocked_missing_api_key: ["待生成（缺少 API 密钥）", "Awaiting generation (API key missing)"],
  generated: ["已生成待审", "Generated, awaiting review"], withdrawn: ["已撤回", "Withdrawn"],
  // review + translation status
  draft: ["草稿", "Draft"], reviewed: ["已审阅", "Reviewed"], published: ["已发布", "Published"],
};

/** Translate one API enum value. Unknown values degrade to a readable form. */
export function label(value: string | null | undefined, locale: Locale): string {
  if (!value) return locale === "zh-CN" ? "未标注" : "Not recorded";
  const pair = ENUMS[value];
  return pair ? pick(pair, locale) : value.replaceAll("_", " ");
}

export const UI = {
  overview: ["艺术总览", "Artistic overview"],
  creatures: ["异兽与生灵", "Creatures"],
  passages: ["原文段落", "Passages"],
  textualPlaces: ["山川路线", "Mountains and routes"],
  sources: ["来源", "Sources"],
  error: ["加载失败", "Could not load"],
  loading: ["载入中", "Loading"],
  copy: ["复制此景链接", "Copy this view"],
  copied: ["已复制", "Copied"],
  close: ["关闭", "Close"],
  searchEverything: ["寻访异兽、原文与山川", "Search creatures, passages and mountains"],
  noResults: ["没有匹配结果", "No matches"],
  dataNote: [
    "本图集分层呈现原文段落、编辑归纳、学术候选与艺术演绎；层级在数据与界面中始终可区分。",
    "This atlas keeps textual passages, editorial synthesis, scholarly candidates and artistic interpretation as distinct layers, in the data and in the interface alike.",
  ],
} as const;

export type UIKey = keyof typeof UI;
export function t(key: UIKey, locale: Locale): string { return pick(UI[key], locale); }

/**
 * No external body has signed off on this atlas (SJ-D012 stayed `pending`).
 * Rather than wait for a signature that may never come, the site says so
 * itself — an absent endorsement that is never stated reads, to a visitor,
 * exactly like an endorsement that exists. Decision: SJ-D016.
 */
export const NO_ENDORSEMENT: Record<Locale, string> = {
  "zh-CN":
    "本图集为项目自行编纂的候选成果，未经任何学术机构或外部专家签署。分类、地望候选、" +
    "声音推演与艺术演绎均为本项目的编辑判断，不代表学术定论；引用时请一并注明其证据等级。",
  en:
    "This atlas is candidate work authored by the project. It carries no institutional or expert " +
    "endorsement: classifications, location candidates, sound reconstructions and artistic renderings " +
    "are the project's own editorial judgements, not scholarly conclusions. Cite them at that level.",
};

/** Origin region strings are authored in English in the database. */
export function originRegionLabel(region: string, locale: Locale): string {
  if (locale !== "zh-CN") return region;
  return region === "Ancient China / textual cosmography" ? "古代中国 / 文本宇宙志" : region;
}
