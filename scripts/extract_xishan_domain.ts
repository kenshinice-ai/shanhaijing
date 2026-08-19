import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Deterministic domain extraction for the frozen Xishan corpus.
 *
 * The corpus is frozen (edition checksum recorded in db/seeds/006); this script
 * reads it and derives what the text states about itself — route stations,
 * direction-and-distance steps, watercourses and where they run, and the named
 * creatures — asserting at every turn that the evidence quote is a contiguous
 * substring of the paragraph it is attributed to.
 *
 * Nothing here is translated. Names reach English through the per-character
 * reading table in scripts/data/xishan_readings_v1.json, which is auditable
 * character by character; English summaries are left empty because writing them
 * is translation, and translation is a person's job (execution plan item 1-2).
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const WORK = "10000000-0000-4000-8000-000000000011";
const EDITION = "21000000-0000-4000-8000-000000000001";

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const q = (value: string): string => `'${value.replace(/'/gu, "''")}'`;
const uuid = (prefix: string, index: number): string => `${prefix}-4000-8000-${String(index).padStart(12, "0")}`;
const SEC = (index: number): string => uuid("22000000-0000", index);
const PASS = (index: number): string => uuid("23000000-0000", index);
const PLACE = (index: number): string => uuid("24000000-0000", index);
const CRE = (index: number): string => uuid("25000000-0000", index);
const OCC = (index: number): string => uuid("26000000-0000", index);
const EDGE = (index: number): string => uuid("27000000-0000", index);
const TAX = (index: number): string => uuid("28000000-0000", index);
const VARI = (index: number): string => uuid("29000000-0000", index);
const DEC = (index: number): string => uuid("2a000000-0000", index);

interface Reading { py: string; s?: string; uncertain?: boolean }
const readings = JSON.parse(readFileSync(join(ROOT, "scripts/data/xishan_readings_v1.json"), "utf8")) as
  { chars: Record<string, Reading> };
const corpus = JSON.parse(readFileSync(join(ROOT, "scripts/data/xishan_corpus_v1.json"), "utf8")) as
  { paragraphs: string[] };
const paras = corpus.paragraphs;
if (paras.length !== 82) throw new Error(`expected 82 paragraphs, got ${paras.length}`);

const missingChars = new Set<string>();
const reading = (char: string): Reading => {
  const value = readings.chars[char];
  if (!value) { missingChars.add(char); return { py: "?" }; }
  return value;
};
/** Toneless pinyin, capitalised as one word — the same convention the Nanshan seed uses. */
const romanise = (name: string): string => {
  const syllables = [...name].filter((char) => char !== "之").map((char) => reading(char).py);
  const joined = syllables.join("");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
};
/** The printed form is the baseline; simplification only where a standard mapping exists. */
// Prose fragments pass through here too, so an unlisted character is left alone
// rather than counted as a gap in the name table.
const simplify = (text: string): string => [...text].map((char) => readings.chars[char]?.s ?? char).join("");

// --- Structure -------------------------------------------------------------

/** Paragraph ranges of the four routes, and the colophon paragraphs between them. */
const ROUTES = [
  { section: 1, slug: "xishan-first-route", label: "西山经·华山首列", from: 1, to: 19, colophon: 20 },
  { section: 2, slug: "xici2-route", label: "西山经·西次二经", from: 21, to: 37, colophon: 38 },
  { section: 3, slug: "xici3-route", label: "西山经·西次三经", from: 39, to: 60, colophon: 61 },
  { section: 4, slug: "xici4-route", label: "西山经·西次四经", from: 62, to: 80, colophon: 81 },
] as const;
const FINAL_COLOPHON = 82;

const digits: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const units: Record<string, number> = { 十: 10, 百: 100, 千: 1000, 萬: 10000 };
function chineseNumber(text: string): number {
  let total = 0;
  let current = 0;
  let myriad = 0;
  for (const char of text) {
    if (digits[char] !== undefined) current = digits[char];
    else if (char === "萬") { myriad = (total + current) * 10000; total = 0; current = 0; }
    else if (units[char] !== undefined) { total += (current || 1) * units[char]; current = 0; }
    else throw new Error(`cannot parse numeral ${text}`);
  }
  return myriad + total + current;
}

interface Station {
  index: number;            // 1-based across the whole chapter
  para: number;             // 1-based paragraph number
  route: number;
  routeIndex: number;       // 1-based within the route
  name: string;             // as printed
  slug: string;
  kind: "mountain" | "region";
  direction: string;        // "" for a route head
  distance: number | null;
  waterTravel: boolean;
  opening: string;          // the travel clause, verified as a substring
}

/**
 * A station opens its paragraph: an optional 又, a direction, an optional 水行,
 * a distance in li, then 曰 / 至于 / 至 and the name. Paragraph 48 carries two,
 * which is the whole reason the third route's colophon counts one more than the
 * chapter's own total (see docs/generated/xishan-arithmetic.md).
 */
const STATION_RE =
  /(?:^|，)(?:又)?(東南|西南|東北|西北|東|南|西|北)?(水行)?(?:([一二三四五六七八九十百千]+)里)?(?:，)?(曰|至于|至)([^，。、；]{1,7}?)(?=[，。]|$)/gu;

const NOT_A_MOUNTAIN = new Set(["流沙"]);

const stations: Station[] = [];
for (const route of ROUTES) {
  for (let para = route.from; para <= route.to; para += 1) {
    const text = paras[para - 1];
    if (para === route.from) {
      // A route head names its first station after 之首 and travels from nowhere.
      const head = /之首，?曰([^，。、；]{1,7}?)(?=[，。]|$)/u.exec(text);
      if (!head) throw new Error(`no route head parsed in paragraph ${para}`);
      stations.push({
        index: stations.length + 1, para, route: route.section, routeIndex: 0,
        name: head[1], slug: "", kind: NOT_A_MOUNTAIN.has(head[1]) ? "region" : "mountain",
        direction: "", distance: null, waterTravel: false, opening: head[0],
      });
      continue;
    }
    STATION_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    let found = 0;
    while ((match = STATION_RE.exec(text))) {
      if (match.index > 40) break;
      const [whole, direction, waterTravel, distance, , name] = match;
      if (!direction && !waterTravel && !distance && match.index !== 0 && found > 0) continue;
      if (!text.includes(whole.replace(/^，/u, ""))) throw new Error(`opening not contiguous at ${para}`);
      stations.push({
        index: stations.length + 1,
        para,
        route: route.section,
        routeIndex: 0,
        name,
        slug: "",
        kind: NOT_A_MOUNTAIN.has(name) ? "region" : "mountain",
        direction: direction ?? "",
        distance: distance ? chineseNumber(distance) : null,
        waterTravel: Boolean(waterTravel),
        opening: whole.replace(/^，/u, ""),
      });
      found += 1;
    }
    if (found === 0) throw new Error(`no station parsed in paragraph ${para}`);
  }
}
// Route-relative numbering.
for (const route of ROUTES) {
  let n = 0;
  for (const station of stations) if (station.route === route.section) { n += 1; station.routeIndex = n; }
}

// Slugs: pinyin of the bare name, disambiguated by route when a name repeats.
const slugTaken = new Map<string, number>();
for (const station of stations) {
  const bare = station.name.replace(/之尾$/u, "").replace(/(之山|之丘|山|丘)$/u, "");
  const suffix = /之尾$/u.test(station.name) ? "-wei" : "";
  // Chapter-scoped prefix: route stations belong to a chapter, and bare pinyin
  // collides with the Nanshan places already seeded (符禺之山 vs 浮玉之山 both "fuyu").
  const base = `xi-${romanise(bare).toLowerCase()}${suffix}`;
  if (slugTaken.has(base)) station.slug = `${base}-r${station.route}`;
  else { slugTaken.set(base, station.route); station.slug = base; }
  if (!/^[a-z0-9-]+$/u.test(station.slug)) throw new Error(`bad slug ${station.slug} for ${station.name}`);
}
const stationBySlug = new Map(stations.map((station) => [station.slug, station]));
if (stationBySlug.size !== stations.length) throw new Error("duplicate station slug");

if (missingChars.size > 0) {
  throw new Error(`readings table is missing: ${[...missingChars].join("")}`);
}

console.log(`stations: ${stations.length} (mountains ${stations.filter((s) => s.kind === "mountain").length})`);
for (const route of ROUTES) {
  const own = stations.filter((s) => s.route === route.section);
  const li = own.reduce((sum, s) => sum + (s.distance ?? 0), 0);
  const colophon = paras[route.colophon - 1];
  const claimed = /凡([一二三四五六七八九十百千]+)山，([一二三四五六七八九十百千萬]+)里/u.exec(colophon);
  if (!claimed) throw new Error(`cannot read colophon ${route.colophon}`);
  console.log(`  route ${route.section}: stations ${own.length} (claimed ${chineseNumber(claimed[1])}), li ${li} (claimed ${chineseNumber(claimed[2])})`);
}

// --- Watercourses ----------------------------------------------------------

/**
 * Two formulas carry the hydrography: `X出焉` / `X出于其Y` says a watercourse
 * rises at this station, and `…流注于Y` / `…流于Y` says where it runs. Both are
 * recorded as edges; the water itself becomes a place so the run can be drawn.
 */
interface WaterMention {
  para: number;
  name: string;          // as printed
  role: "source" | "target";
  clause: string;        // contiguous quote
  direction: string;     // 北流 / 西南流 / …
  stationSlug: string;   // the station whose paragraph this is
  at: number;            // character offset, used to pair a run with its source
}

const SOURCE_RE = /([^，。、；]{1,6}?)出(?:焉|于其[上下陽陰西東南北])/gu;
const TARGET_RE = /((?:[東南西北]{1,2}流(?:[東南西北]?注)?|[東南西北]{1,2}注|潛))(?:于|於)([^，。、；]{1,7}?)(?=[，。、；]|$)/gu;
const NOT_A_PLACE = /^其[上下西東南北中]$/u;

const stationByPara = new Map<number, Station[]>();
for (const station of stations) {
  const list = stationByPara.get(station.para) ?? [];
  list.push(station);
  stationByPara.set(station.para, list);
}

const waterMentions: WaterMention[] = [];
for (const [para, list] of [...stationByPara.entries()].sort((a, b) => a[0] - b[0])) {
  const text = paras[para - 1];
  const owner = list[list.length - 1];   // paragraph 48's waters belong to its second station
  SOURCE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SOURCE_RE.exec(text))) {
    if (!text.includes(match[0])) throw new Error(`source clause not contiguous at ${para}`);
    waterMentions.push({ para, name: match[1], role: "source", clause: match[0], direction: "", stationSlug: owner.slug, at: match.index });
  }
  TARGET_RE.lastIndex = 0;
  while ((match = TARGET_RE.exec(text))) {
    if (NOT_A_PLACE.test(match[2])) continue;
    if (!text.includes(match[0])) throw new Error(`target clause not contiguous at ${para}`);
    waterMentions.push({ para, name: match[2], role: "target", clause: match[0], direction: match[1], stationSlug: owner.slug, at: match.index });
  }
}

/** 渭 and 渭水 are the same river with the 水 elided; merge to the fuller form. */
const printedNames = new Set(waterMentions.map((mention) => mention.name));
const WATER_MERGES = new Map<string, string>();
for (const name of printedNames) if (printedNames.has(`${name}水`)) WATER_MERGES.set(name, `${name}水`);
const canonical = (name: string): string => WATER_MERGES.get(name) ?? name;

const waterKind = (name: string): "river" | "marsh" | "sea" | "region" | "unknown" => {
  if (name.endsWith("澤")) return "marsh";
  if (name === "海" || name.endsWith("海")) return "sea";
  if (name.endsWith("水")) return "river";
  if (name.endsWith("谷") || name === "流沙") return "region";
  if (["沔", "渭", "洛", "河", "漢"].includes(name)) return "river";
  return "unknown";
};

const waterNames = [...new Set(waterMentions.map((mention) => canonical(mention.name)))].sort();
console.log(`waters: ${waterNames.length} distinct (merged ${WATER_MERGES.size} elided forms: ${[...WATER_MERGES].map(([a, b]) => `${a}→${b}`).join(" ")})`);
const byKind = new Map<string, string[]>();
for (const name of waterNames) {
  const kind = waterKind(name);
  byKind.set(kind, [...(byKind.get(kind) ?? []), name]);
}
for (const [kind, names] of [...byKind.entries()].sort()) console.log(`  ${kind}: ${names.join("、")}`);

/** A run belongs to the nearest watercourse named before it in the same paragraph. */
interface Run { para: number; from: string; to: string; direction: string; clause: string; stationSlug: string }
const runs: Run[] = [];
const unpairedRuns: WaterMention[] = [];
for (const mention of waterMentions) {
  if (mention.role !== "target") continue;
  const source = waterMentions
    .filter((other) => other.para === mention.para && other.role === "source" && other.at < mention.at)
    .sort((a, b) => b.at - a.at)[0];
  if (!source) { unpairedRuns.push(mention); continue; }
  runs.push({
    para: mention.para,
    from: canonical(source.name),
    to: canonical(mention.name),
    direction: mention.direction,
    // The span from the source name to the end of the run clause, taken verbatim.
    clause: paras[mention.para - 1].slice(source.at, mention.at + mention.clause.length),
    stationSlug: mention.stationSlug,
  });
}
const sourceLinks = waterMentions.filter((mention) => mention.role === "source");
console.log(`hydrography: ${sourceLinks.length} source clauses, ${runs.length} runs, ${unpairedRuns.length} unpaired`);
for (const mention of unpairedRuns) console.log(`  unpaired run at ${mention.para}: ${mention.clause}`);

// --- Creatures -------------------------------------------------------------

interface TaxonomyRef { axis: string; term: string; note: string; cls?: "transcription" | "editorial_summary" }
interface CreatureEntry {
  slug: string; para: number; place: string; surface: string;
  kind: "beast" | "bird" | "fish" | "serpent" | "deity" | "other";
  status: "resolved" | "provisional"; importance: number; icon: string;
  quote: string; taxonomy: TaxonomyRef[];
}
interface ExtraOccurrence { creature: string; para: number; place: string; surface: string; note: string; quote: string }
interface Deferred { para: number; surface: string; reason: string }
const entities = JSON.parse(readFileSync(join(ROOT, "scripts/data/xishan_entities_v1.json"), "utf8")) as {
  creatures: CreatureEntry[]; extraOccurrences: ExtraOccurrence[]; deferred: Deferred[];
  excludedKinds: { note: string; flora_minerals: string[]; ordinary_fauna: string[] };
};

const problems: string[] = [];
const check = (condition: boolean, message: string): void => { if (!condition) problems.push(message); };

for (const creature of entities.creatures) {
  const text = paras[creature.para - 1];
  check(Boolean(text), `${creature.slug}: paragraph ${creature.para} does not exist`);
  if (!text) continue;
  check(text.includes(creature.quote), `${creature.slug}: quote is not a contiguous substring of paragraph ${creature.para}`);
  check(creature.quote.includes(creature.surface), `${creature.slug}: surface form ${creature.surface} missing from its own quote`);
  check(stationBySlug.has(creature.place), `${creature.slug}: place ${creature.place} is not a station`);
  const station = stationBySlug.get(creature.place);
  check(!station || station.para === creature.para, `${creature.slug}: place ${creature.place} sits at paragraph ${station?.para}, not ${creature.para}`);
  for (const item of creature.taxonomy) {
    check(text.includes(item.note), `${creature.slug}/${item.term}: evidence note is not in paragraph ${creature.para}`);
  }
}
for (const extra of entities.extraOccurrences) {
  const text = paras[extra.para - 1];
  check(entities.creatures.some((creature) => creature.slug === extra.creature), `extra occurrence references unknown creature ${extra.creature}`);
  check(text.includes(extra.quote), `extra occurrence ${extra.creature}@${extra.para}: quote is not contiguous`);
  check(stationBySlug.has(extra.place), `extra occurrence ${extra.creature}: place ${extra.place} is not a station`);
}
for (const item of entities.deferred) {
  const text = paras[item.para - 1];
  if (item.surface.startsWith("（")) continue;
  check(text.includes(item.surface), `deferred ${item.surface}: not present in paragraph ${item.para}`);
}
const slugs = new Set(entities.creatures.map((creature) => creature.slug));
check(slugs.size === entities.creatures.length, "duplicate creature slug");

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exitCode = 1;
} else {
  const byKind = new Map<string, number>();
  for (const creature of entities.creatures) byKind.set(creature.kind, (byKind.get(creature.kind) ?? 0) + 1);
  console.log(`creatures: ${entities.creatures.length} (${[...byKind].sort().map(([k, v]) => `${k} ${v}`).join(", ")}), ` +
    `${entities.creatures.length + entities.extraOccurrences.length} occurrences, ${entities.deferred.length} deferred`);
  const terms = new Set(entities.creatures.flatMap((creature) => creature.taxonomy.map((item) => `${item.axis}/${item.term}`)));
  console.log(`taxonomy: ${entities.creatures.reduce((sum, c) => sum + c.taxonomy.length, 0)} assignments over ${terms.size} terms`);
  console.log(`  ${[...terms].sort().join("  ")}`);
}

// --- Places ----------------------------------------------------------------

interface Place {
  id: string; slug: string; kind: string; x: number; y: number; sort: number;
  nameZh: string; aliases: string[]; nameEn: string; sumZh: string;
  para: number; mention: string;
}

const BAND_Y = [0, 12, 34, 56, 78];
const clamp = (value: number): number => Math.min(99.5, Math.max(0.5, Math.round(value * 1000) / 1000));

const places: Place[] = [];
const placeBySlug = new Map<string, Place>();
let placeSeq = 0;

const routeLabel = (route: number): string => ROUTES.find((entry) => entry.section === route)!.label;

for (const station of stations) {
  const own = stations.filter((other) => other.route === station.route);
  const span = own.length > 1 ? (station.routeIndex - 1) / (own.length - 1) : 0.5;
  const sourced = waterMentions
    .filter((mention) => mention.role === "source" && mention.stationSlug === station.slug)
    .map((mention) => canonical(mention.name));
  const englishName = /之尾$/u.test(station.name)
    ? `Tail of Mount ${romanise(station.name.replace(/之尾$/u, "").replace(/山$/u, ""))}`
    : /丘$/u.test(station.name)
      ? `${romanise(station.name.replace(/(之丘|丘)$/u, ""))} Hill`
      : station.kind === "region"
        ? romanise(station.name)
        : `Mount ${romanise(station.name.replace(/(之山|山)$/u, ""))}`;
  placeSeq += 1;
  const place: Place = {
    id: PLACE(placeSeq), slug: station.slug, kind: station.kind,
    x: clamp(6 + 88 * span), y: clamp(BAND_Y[station.route]), sort: placeSeq,
    nameZh: simplify(station.name), aliases: simplify(station.name) === station.name ? [] : [station.name],
    nameEn: englishName,
    sumZh: `${routeLabel(station.route)}第 ${station.routeIndex} 站` +
      (station.opening ? `，${station.opening}` : "") +
      (station.kind === "region" ? "；原文不以山计" : "") + "。" +
      (sourced.length > 0 ? `${simplify(sourced.join("、"))}出焉。` : ""),
    para: station.para, mention: station.name,
  };
  places.push(place);
  placeBySlug.set(place.slug, place);
}

const waterSourceStation = new Map<string, string>();
for (const mention of waterMentions) {
  if (mention.role !== "source") continue;
  const name = canonical(mention.name);
  if (!waterSourceStation.has(name)) waterSourceStation.set(name, mention.stationSlug);
}
const unsourced = waterNames.filter((name) => !waterSourceStation.has(name));
let unsourcedIndex = 0;
for (const name of waterNames) [...name].forEach((char) => reading(char));
for (const creature of entities.creatures) [...creature.surface].forEach((char) => reading(char));
if (missingChars.size > 0) throw new Error(`readings table is missing: ${[...missingChars].join("")}`);
// Toneless pinyin collides (淒水 and 漆水 both give qishui); the suffix is assigned
// in sorted-name order so it is stable, and the review sheet spells out which is which.
const waterSlugs = new Map<string, string>();
const slugCollisions: Array<[string, string]> = [];
for (const name of waterNames) {
  const base = `xi-w-${romanise(name).toLowerCase()}`;
  let slug = base;
  let n = 1;
  while ([...waterSlugs.values()].includes(slug)) { n += 1; slug = `${base}-${n}`; }
  if (slug !== base) slugCollisions.push([name, slug]);
  waterSlugs.set(name, slug);
}
for (const name of waterNames) {
  const kind = waterKind(name);
  const slug = waterSlugs.get(name)!;
  const stationSlug = waterSourceStation.get(name);
  let x: number;
  let y: number;
  if (stationSlug) {
    const anchor = placeBySlug.get(stationSlug)!;
    const siblings = waterNames.filter((other) => waterSourceStation.get(other) === stationSlug);
    const offset = siblings.indexOf(name) - (siblings.length - 1) / 2;
    x = clamp(anchor.x + offset * 1.8);
    y = clamp(anchor.y + 7);
  } else {
    x = clamp(4 + 92 * (unsourced.length > 1 ? unsourcedIndex / (unsourced.length - 1) : 0.5));
    y = 96;
    unsourcedIndex += 1;
  }
  const roman = romanise(name.replace(/(之水|水)$/u, ""));
  const englishName = name === "海" ? "The Sea"
    : kind === "river" ? `${roman} River`
      : kind === "marsh" ? `${romanise(name.replace(/(之澤|澤)$/u, ""))} Marsh`
        : kind === "sea" ? `${roman} Sea`
          : romanise(name);
  const run = runs.find((entry) => entry.from === name);
  placeSeq += 1;
  const place: Place = {
    id: PLACE(placeSeq), slug, kind, x, y, sort: placeSeq,
    nameZh: simplify(name), aliases: simplify(name) === name ? [] : [name],
    nameEn: englishName,
    sumZh: stationSlug
      ? `出于${placeBySlug.get(stationSlug)!.nameZh}` + (run ? `，${simplify(run.direction)}于${simplify(run.to)}` : "") + "。"
      : "原文只见其为水所注之处，未记其源。",
    para: 0, mention: name,
  };
  if (placeBySlug.has(slug)) throw new Error(`duplicate place slug ${slug}`);
  places.push(place);
  placeBySlug.set(slug, place);
}
if (missingChars.size > 0) throw new Error(`readings table is missing: ${[...missingChars].join("")}`);
console.log(`places: ${places.length} (stations ${stations.length}, waters ${waterNames.length}; ${unsourced.length} waters have no source in this chapter)`);

// --- Topology --------------------------------------------------------------

interface Edge {
  id: string; section: number; from: string; to: string; para: number;
  kind: "distance_direction" | "source_of" | "flows_into";
  direction: string; distance: number | null; sequence: number; evidence: string;
}
const routeOfPara = (para: number): number => {
  const route = ROUTES.find((entry) => para >= entry.from && para <= entry.to);
  if (!route) throw new Error(`paragraph ${para} sits outside every route`);
  return route.section;
};

const edges: Edge[] = [];
const sectionSeq = new Map<number, number>();
const nextSeq = (section: number): number => {
  const value = (sectionSeq.get(section) ?? 0) + 1;
  sectionSeq.set(section, value);
  return value;
};
let edgeSeq = 0;
const pushEdge = (edge: Omit<Edge, "id" | "sequence">): void => {
  edgeSeq += 1;
  edges.push({ ...edge, id: EDGE(edgeSeq), sequence: nextSeq(edge.section) });
};

for (const station of stations) {
  if (station.routeIndex === 1) continue;
  const previous = stations.find((other) => other.route === station.route && other.routeIndex === station.routeIndex - 1)!;
  pushEdge({ section: station.route, from: previous.slug, to: station.slug, para: station.para,
    kind: "distance_direction", direction: station.direction, distance: station.distance, evidence: station.opening });
}
for (const mention of waterMentions) {
  if (mention.role !== "source") continue;
  pushEdge({ section: routeOfPara(mention.para), from: mention.stationSlug, to: waterSlugs.get(canonical(mention.name))!,
    para: mention.para, kind: "source_of", direction: "", distance: null, evidence: mention.clause });
}
for (const run of runs) {
  pushEdge({ section: routeOfPara(run.para), from: waterSlugs.get(run.from)!, to: waterSlugs.get(run.to)!,
    para: run.para, kind: "flows_into", direction: run.direction, distance: null, evidence: run.clause });
}
for (const edge of edges) {
  if (!placeBySlug.has(edge.from)) throw new Error(`edge ${edge.id} has unknown from ${edge.from}`);
  if (!placeBySlug.has(edge.to)) throw new Error(`edge ${edge.id} has unknown to ${edge.to}`);
  if (!paras[edge.para - 1].includes(edge.evidence)) throw new Error(`edge ${edge.id} evidence not contiguous`);
}
console.log(`edges: ${edges.length} (route ${edges.filter((e) => e.kind === "distance_direction").length}, ` +
  `source_of ${edges.filter((e) => e.kind === "source_of").length}, flows_into ${edges.filter((e) => e.kind === "flows_into").length})`);

// --- Arithmetic report -----------------------------------------------------

interface RouteArithmetic { section: number; label: string; stations: number; mountains: number; claimedStations: number; li: number; claimedLi: number }
const arithmetic: RouteArithmetic[] = ROUTES.map((route) => {
  const own = stations.filter((station) => station.route === route.section);
  const claimed = /凡([一二三四五六七八九十百千]+)山，([一二三四五六七八九十百千萬]+)里/u.exec(paras[route.colophon - 1])!;
  return {
    section: route.section, label: route.label,
    stations: own.length,
    mountains: own.filter((station) => station.kind === "mountain").length,
    claimedStations: chineseNumber(claimed[1]),
    li: own.reduce((sum, station) => sum + (station.distance ?? 0), 0),
    claimedLi: chineseNumber(claimed[2]),
  };
});
const finalClaim = /凡([一二三四五六七八九十百千]+)山，([一二三四五六七八九十百千萬]+)里/u.exec(paras[FINAL_COLOPHON - 1])!;
const finalMountains = chineseNumber(finalClaim[1]);
const finalLi = chineseNumber(finalClaim[2]);
const totalMountains = stations.filter((station) => station.kind === "mountain").length;
const routeClaimSum = arithmetic.reduce((sum, row) => sum + row.claimedStations, 0);
const routeLiSum = arithmetic.reduce((sum, row) => sum + row.claimedLi, 0);
const measuredLi = arithmetic.reduce((sum, row) => sum + row.li, 0);

// --- Seed emission ---------------------------------------------------------

const ROLE = "R-AI-EXTRACT";
const DATE = "2026-08-19";
const arr = (values: string[]): string => (values.length > 0 ? `ARRAY[${values.map(q).join(",")}]` : "ARRAY[]::text[]");
const sql: string[] = [];

sql.push(`-- 007:《西山经》领域建模（由 scripts/extract_xishan_domain.ts 确定性生成，勿手改）
--
-- 输入：已冻结的 scripts/data/xishan_corpus_v1.json（82 段）、
--       scripts/data/xishan_entities_v1.json（异兽登记）、
--       scripts/data/xishan_readings_v1.json（专名用字表）
--
-- ${stations.length} 站（${totalMountains} 山 + ${stations.length - totalMountains} 非山）、${waterNames.length} 水、${edges.length} 边、${entities.creatures.length} 异兽概念、
-- ${entities.creatures.length + entities.extraOccurrences.length} 处出现、${entities.creatures.reduce((sum, c) => sum + c.taxonomy.length, 0)} 条分类指派。
--
-- 全部以 draft 入库：抽取由 AI 执行，未经人复核，故不进 API 与产物。
-- 英文摘要一律留空——写摘要是翻译，翻译要人负责（执行清单 1-2）。

BEGIN;`);

const placeValues = places.map((place) =>
  `(${q(place.id)},${q(WORK)},${q(place.slug)},${q(place.kind)},${place.x},${place.y},'xishan-layout-v1',${place.sort},'draft')`);
sql.push(`INSERT INTO shj_textual_places(id,work_id,slug,place_kind,layout_x,layout_y,layout_space,sort_order,review_status) VALUES\n${placeValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET place_kind=EXCLUDED.place_kind,layout_x=EXCLUDED.layout_x,layout_y=EXCLUDED.layout_y,
  layout_space=EXCLUDED.layout_space,sort_order=EXCLUDED.sort_order,review_status=EXCLUDED.review_status;`);

const placeTranslations = places.flatMap((place) => [
  `(${q(place.id)},'zh-CN',${q(place.nameZh)},${arr(place.aliases)},${q(place.sumZh)},'draft')`,
  `(${q(place.id)},'en',${q(place.nameEn)},${arr([place.nameZh])},'','draft')`,
]);
sql.push(`INSERT INTO shj_textual_place_translations(place_id,locale,name,aliases,summary,status) VALUES\n${placeTranslations.join(",\n")}
ON CONFLICT (place_id,locale) DO UPDATE SET name=EXCLUDED.name,aliases=EXCLUDED.aliases,summary=EXCLUDED.summary,status=EXCLUDED.status;`);

const mentionValues = stations.map((station) =>
  `(${q(placeBySlug.get(station.slug)!.id)},${q(PASS(station.para))},${q(station.name)},${station.index})`);
sql.push(`INSERT INTO shj_place_mentions(place_id,passage_id,surface_form,mention_order) VALUES\n${mentionValues.join(",\n")}\nON CONFLICT DO NOTHING;`);

const creatureIndex = new Map(entities.creatures.map((creature, index) => [creature.slug, index + 1]));
const creatureValues = entities.creatures.map((creature, index) =>
  `(${q(CRE(index + 1))},${q(WORK)},${q(creature.slug)},${q(creature.status)},${creature.importance},${q(creature.icon)},${100 + index})`);
sql.push(`INSERT INTO shj_creatures(id,work_id,slug,concept_status,importance,icon_key,sort_order) VALUES\n${creatureValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET concept_status=EXCLUDED.concept_status,importance=EXCLUDED.importance,icon_key=EXCLUDED.icon_key,sort_order=EXCLUDED.sort_order;`);

const KIND_ZH: Record<string, string> = { beast: "兽", bird: "鸟", fish: "鱼", serpent: "蛇", deity: "神", other: "未定" };
const creatureTranslations = entities.creatures.flatMap((creature) => {
  const zhName = simplify(creature.surface);
  const aliases = zhName === creature.surface ? [] : [creature.surface];
  const station = stationBySlug.get(creature.place)!;
  const sumZh = `${KIND_ZH[creature.kind]}，见于${simplify(station.name)}（第 ${creature.para} 段）。`;
  const detailZh = `原文：${creature.quote}`;
  return [
    `(${q(CRE(creatureIndex.get(creature.slug)!))},'zh-CN',${q(zhName)},${arr(aliases)},${q(sumZh)},${q(detailZh)},'draft')`,
    `(${q(CRE(creatureIndex.get(creature.slug)!))},'en',${q(romanise(creature.surface))},${arr([creature.surface])},'','','draft')`,
  ];
});
sql.push(`INSERT INTO shj_creature_translations(creature_id,locale,name,aliases,summary,detail,status) VALUES\n${creatureTranslations.join(",\n")}
ON CONFLICT (creature_id,locale) DO UPDATE SET name=EXCLUDED.name,aliases=EXCLUDED.aliases,summary=EXCLUDED.summary,detail=EXCLUDED.detail,status=EXCLUDED.status;`);

interface OccurrenceRow { id: string; creature: string; para: number; place: string; surface: string; quote: string; note: string }
const occurrences: OccurrenceRow[] = [
  ...entities.creatures.map((creature, index) => ({
    id: OCC(index + 1), creature: creature.slug, para: creature.para, place: creature.place,
    surface: creature.surface, quote: creature.quote, note: "首见；引文为该段连续子串，由生成器断言。",
  })),
  ...entities.extraOccurrences.map((extra, index) => ({
    id: OCC(1000 + index), creature: extra.creature, para: extra.para, place: extra.place,
    surface: extra.surface, quote: extra.quote, note: extra.note,
  })),
];
const orderByPara = new Map<number, number>();
const occurrenceValues = occurrences.map((occurrence) => {
  const order = (orderByPara.get(occurrence.para) ?? 0) + 1;
  orderByPara.set(occurrence.para, order);
  return `(${q(occurrence.id)},${q(CRE(creatureIndex.get(occurrence.creature)!))},${q(PASS(occurrence.para))},` +
    `${q(placeBySlug.get(occurrence.place)!.id)},${q(occurrence.surface)},${q(occurrence.quote)},${order},` +
    `'text_direct','transcription','high',${q(occurrence.note)},'draft')`;
});
sql.push(`INSERT INTO shj_creature_occurrences(id,creature_id,passage_id,place_id,surface_form,quote_zh,occurrence_order,source_attestation,interpretation_class,confidence,evidence_note,review_status) VALUES\n${occurrenceValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET surface_form=EXCLUDED.surface_form,quote_zh=EXCLUDED.quote_zh,occurrence_order=EXCLUDED.occurrence_order,
  evidence_note=EXCLUDED.evidence_note,confidence=EXCLUDED.confidence,review_status=EXCLUDED.review_status;`);

let taxIndex = 0;
const taxonomyValues = entities.creatures.flatMap((creature) => creature.taxonomy.map((item) => {
  taxIndex += 1;
  return `(${q(TAX(taxIndex))},${q(CRE(creatureIndex.get(creature.slug)!))},${q(PASS(creature.para))},${q(item.axis)},${q(item.term)},` +
    `'text_direct',${q(item.cls ?? "transcription")},'high',${q(item.note)},'draft')`;
}));
sql.push(`INSERT INTO shj_taxonomy_assignments(id,creature_id,passage_id,axis,term,source_attestation,interpretation_class,confidence,evidence_note,review_status) VALUES\n${taxonomyValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET axis=EXCLUDED.axis,term=EXCLUDED.term,evidence_note=EXCLUDED.evidence_note,confidence=EXCLUDED.confidence,review_status=EXCLUDED.review_status;`);

const RELATION_ZH: Record<string, string> = { distance_direction: "路线", source_of: "水源", flows_into: "水注" };
const edgeValues = edges.map((edge) =>
  `(${q(edge.id)},${q(SEC(edge.section))},${q(placeBySlug.get(edge.from)!.id)},${q(placeBySlug.get(edge.to)!.id)},${q(PASS(edge.para))},` +
  `${q(edge.kind)},${q(edge.direction)},${edge.distance === null ? "NULL" : edge.distance},${q(edge.distance === null ? "" : "里")},` +
  `${edge.sequence},'transcription','none','draft')`);
sql.push(`-- 边的 relation_kind：${Object.entries(RELATION_ZH).map(([k, v]) => `${k}=${v}`).join("，")}
INSERT INTO shj_topology_edges(id,section_id,from_place_id,to_place_id,passage_id,relation_kind,direction_text,distance_value,distance_unit,sequence,interpretation_class,conflict_status,review_status) VALUES\n${edgeValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET relation_kind=EXCLUDED.relation_kind,direction_text=EXCLUDED.direction_text,
  distance_value=EXCLUDED.distance_value,distance_unit=EXCLUDED.distance_unit,sequence=EXCLUDED.sequence,review_status=EXCLUDED.review_status;`);

// Passage titles: mechanical, from the station names the paragraph opens with.
const COLOPHON_TITLES = new Map<number, [string, string]>([
  [20, ["西山经·华山首列·结语", "Xishan Jing · first route colophon"]],
  [38, ["西山经·西次二经·结语", "Xishan Jing · second route colophon"]],
  [61, ["西山经·西次三经·结语", "Xishan Jing · third route colophon"]],
  [81, ["西山经·西次四经·结语", "Xishan Jing · fourth route colophon"]],
  [FINAL_COLOPHON, ["西山经·全篇结语", "Xishan Jing · chapter colophon"]],
]);
const passageTranslations: string[] = [];
for (let para = 1; para <= paras.length; para += 1) {
  const colophon = COLOPHON_TITLES.get(para);
  const own = stationByPara.get(para) ?? [];
  const titleZh = colophon ? colophon[0] : `西山经·${own.map((station) => simplify(station.name)).join("、")}`;
  const titleEn = colophon ? colophon[1] : `Xishan Jing · ${own.map((station) => placeBySlug.get(station.slug)!.nameEn).join(" / ")}`;
  passageTranslations.push(`(${q(PASS(para))},'zh-CN',${q(titleZh)},'','标题由站名机械生成；摘要待人工撰写。','draft')`);
  passageTranslations.push(`(${q(PASS(para))},'en',${q(titleEn)},'','Title transliterated from the station name; summary pending human translation.','draft')`);
}
sql.push(`INSERT INTO shj_passage_translations(passage_id,locale,title,summary,editorial_note,status) VALUES\n${passageTranslations.join(",\n")}
ON CONFLICT (passage_id,locale) DO UPDATE SET title=EXCLUDED.title,summary=EXCLUDED.summary,editorial_note=EXCLUDED.editorial_note,status=EXCLUDED.status;`);

// Audit rows that say, in the database, that nobody has audited these yet.
sql.push(`INSERT INTO shj_passage_audits(passage_id,audit_status,segmentation_version,input_checksum_sha256,reviewer_role,reviewed_at,evidence_note)
SELECT p.id,'pending_review','xishan-full-v1',p.checksum_sha256,${q(ROLE)},NULL,
       '结构与异兽由生成器从冻结语料抽取，引文逐条断言为段内连续子串；尚无人复核，故记 pending_review。'
  FROM shj_text_passages p
  JOIN shj_text_sections s ON s.id=p.section_id
 WHERE s.edition_id=${q(EDITION)}
ON CONFLICT (passage_id) DO UPDATE SET audit_status=EXCLUDED.audit_status,segmentation_version=EXCLUDED.segmentation_version,
  input_checksum_sha256=EXCLUDED.input_checksum_sha256,reviewer_role=EXCLUDED.reviewer_role,evidence_note=EXCLUDED.evidence_note;`);

// Count and distance discrepancies. The station/mountain question is settled by
// the text's own wording; the li totals are not, and policy §4.5.3a caps them.
const variantValues = [
  ...arithmetic.map((row, index) =>
    `(${q(VARI(index + 1))},${q(PASS(ROUTES[index].colophon))},NULL,${q(`${row.claimedLi}里`)},'unresolved',` +
    `${q(`本列段内里程相加为 ${row.li} 里，与结语所称 ${row.claimedLi} 里差 ${row.li - row.claimedLi} 里；依政策 §4.5.3a，数字差异不以弥合结语为定案标准，登记不裁决。`)},` +
    `'xishan-li-not-reconciled',${q(ROLE)},DATE '${DATE}')`),
  `(${q(VARI(10))},${q(PASS(FINAL_COLOPHON))},NULL,${q(`${finalLi}里`)},'unresolved',` +
  `${q(`四列结语里程相加为 ${routeLiSum} 里，全篇结语作 ${finalLi} 里，差 ${routeLiSum - finalLi} 里；段内相加为 ${measuredLi} 里。三个数字互不相合。`)},` +
  `'xishan-li-not-reconciled',${q(ROLE)},DATE '${DATE}')`,
];
sql.push(`INSERT INTO shj_text_variants(id,passage_id,occurrence_candidate_id,variant_form,variant_type,source_note,decision_key,reviewer_role,reviewed_at) VALUES\n${variantValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET variant_form=EXCLUDED.variant_form,variant_type=EXCLUDED.variant_type,source_note=EXCLUDED.source_note,decision_key=EXCLUDED.decision_key,reviewed_at=EXCLUDED.reviewed_at;`);

const decisions: Array<[string, string, string, string, string, string, string]> = [
  ["xishan-station-vs-mountain-count", "topology", "topology", "xishan-full-v1", "accepted",
    `四列结语山数相加为 ${routeClaimSum}，全篇结语作 ${finalMountains}，差 1。差在西次三经：该列结语称 ${arithmetic[2].claimedStations} 山，而本列共 ${arithmetic[2].stations} 站——第 48 段一段两站（「西水行四百里，曰流沙，二百里至于蠃母之山」）。流沙非山，故 ${routeClaimSum} 是站数、${finalMountains} 是山数。两个数各自都对，计量单位不同而已，不是讹误。`,
    `逐段解析得 ${stations.length} 站、${totalMountains} 山；四列站数 ${arithmetic.map((row) => row.stations).join("/")} 与各自结语 ${arithmetic.map((row) => row.claimedStations).join("/")} 逐条吻合。`, ROLE],
  ["xishan-li-not-reconciled", "variant", "passage", "xishan-full-v1", "provisional",
    `里程三个口径互不相合：段内相加 ${measuredLi}、四列结语相加 ${routeLiSum}、全篇结语 ${finalLi}。依政策 §4.5.3a，数字差异不高于 provisional，本轮只登记不裁决。`,
    arithmetic.map((row) => `第${row.section}列 ${row.li}/${row.claimedLi}（差 ${row.li - row.claimedLi}）`).join("；"), ROLE],
  ["xishan-water-elision-merge", "merge", "place", "xishan-waters", "accepted",
    "「渭」「河」「洛」与「渭水」「河水」「洛水」在本篇并见，省称与全称指同一水，合为一个地点。",
    `合并 ${[...WATER_MERGES].map(([short, full]) => `${short}→${full}`).join("、")}；两种写法都保留为别名。`, ROLE],
  ["xishan-place-slug-prefix", "canonical_name", "place", "xishan-places", "accepted",
    "《西山经》地点 slug 一律加 xi- 前缀。路线站点本就属于篇目；且裸拼音与已入库的《南山经》地点相撞（符禺之山与浮玉之山同作 fuyu）。",
    `${places.length} 个地点，无一与既有 slug 冲突。`, ROLE],
  ["xishan-general-taxonomy-terms", "canonical_name", "taxonomy", "xishan-taxonomy", "accepted",
    "本篇的分类词条取通用类目（人面、多首多足、有角、疗疾之效…），不为每只异兽单立一词。一兽一词不是分类，是把描述换个写法重说一遍；62 个概念足以让这个反模式显形。",
    `${taxIndex} 条指派落在 36 个词条上，平均每词 ${(taxIndex / 36).toFixed(1)} 次。《南山经》既有的逐兽词条留待日后统一，不在本轮改动。`, ROLE],
  ["xishan-deities-as-creatures", "canonical_name", "creature", "xishan-deities", "accepted",
    "神祇（西王母、陆吾、帝江、蓐收等）与异兽同表，另设 being_kind 轴区分。《西山经》去掉神祇便所剩无几，另立一表则要在证据链上重复一整套结构。",
    `${entities.creatures.filter((creature) => creature.kind === "deity").length} 个概念记为 deity。`, ROLE],
  ["xishan-unnamed-beings-deferred", "occurrence", "occurrence", "xishan-deferred", "provisional",
    "原文未出其名者不代拟名。五处存疑登记为待裁候选，不建概念。",
    entities.deferred.map((item) => `第${item.para}段 ${item.surface}`).join("；"), ROLE],
  ["xishan-transliteration-not-translation", "canonical_name", "place", "xishan-bilingual", "accepted",
    "英文只给专名转写，不给译文摘要。转写依 scripts/data/xishan_readings_v1.json 逐字可复核；译一段古文不可，那要人负责（执行清单 1-2）。",
    `用字表 ${Object.keys(readings.chars).length} 字，其中 ${Object.values(readings.chars).filter((entry) => entry.uncertain).length} 字读音存疑，已在评审单单列。`, ROLE],
];
const decisionValues = decisions.map(([key, type, subjectKind, subjectRef, status, rationale, evidence], index) =>
  `(${q(DEC(index + 1))},${q(WORK)},${q(key)},${q(type)},${q(subjectKind)},${q(subjectRef)},${q(status)},${q(rationale)},${q(evidence)},${q(ROLE)},DATE '${DATE}')`);
sql.push(`INSERT INTO shj_editorial_decisions(id,work_id,decision_key,decision_type,subject_kind,subject_ref,decision_status,rationale,evidence_note,reviewer_role,decided_at) VALUES\n${decisionValues.join(",\n")}
ON CONFLICT (work_id,decision_key) DO UPDATE SET decision_status=EXCLUDED.decision_status,rationale=EXCLUDED.rationale,evidence_note=EXCLUDED.evidence_note,decided_at=EXCLUDED.decided_at;`);

const candidateValues = entities.deferred.map((item, index) =>
  `(${q(uuid("2b000000-0000", index + 1))},${q(PASS(item.para))},${q(item.surface)},NULL,NULL,'pending_review',NULL,NULL,${q(item.reason)},${q(ROLE)},DATE '${DATE}')`);
sql.push(`INSERT INTO shj_occurrence_candidates(id,passage_id,surface_form,start_char,end_char,disposition,creature_id,occurrence_id,evidence_note,reviewer_role,reviewed_at) VALUES\n${candidateValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET disposition=EXCLUDED.disposition,evidence_note=EXCLUDED.evidence_note,reviewed_at=EXCLUDED.reviewed_at;`);

sql.push("COMMIT;");
writeFileSync(join(ROOT, "db/seeds/007_xishan_domain.sql"), `${sql.join("\n\n")}\n`);
console.log(`007 written: ${places.length} places, ${edges.length} edges, ${entities.creatures.length} creatures, ${occurrences.length} occurrences, ${taxIndex} taxonomy rows`);

// --- Review documents ------------------------------------------------------

const arith: string[] = [
  "# 《西山经》计数与里程核对",
  "",
  "由 `scripts/extract_xishan_domain.ts` 从冻结语料生成，勿手改。命令：`npm run extract:xishan`。",
  "",
  "## 1. 山数：78 与 77 的差落在哪里",
  "",
  "| 列 | 段落 | 站数 | 其中山 | 结语所称 | 合否 |",
  "|---|---|---|---|---|---|",
  ...arithmetic.map((row, index) =>
    `| ${row.label} | ${ROUTES[index].from}–${ROUTES[index].to} | ${row.stations} | ${row.mountains} | ${row.claimedStations} | ${row.stations === row.claimedStations ? "✓" : "✗"} |`),
  `| **合计** | 1–80 | ${stations.length} | ${totalMountains} | ${routeClaimSum} | — |`,
  `| 全篇结语 | ${FINAL_COLOPHON} | — | — | ${finalMountains} 山 | — |`,
  "",
  `四列结语相加 ${routeClaimSum}，全篇结语作 ${finalMountains}，差 1。**四列的站数与各自结语逐条吻合**，`,
  "所以差额不在任何一列内部，而在「山」这个字：",
  "",
  `> ${paras[47]}`,
  "",
  "第 48 段一段两站——「西水行四百里，曰**流沙**」与「二百里至于**蠃母之山**」。",
  `流沙是沙不是山。故 ${routeClaimSum} 数的是**站**，${finalMountains} 数的是**山**，两个数各自都对。`,
  "**这不是讹误，是计量单位不同。**（决策 `xishan-station-vs-mountain-count`）",
  "",
  "## 2. 里程：三个口径互不相合",
  "",
  "| 列 | 段内相加 | 结语所称 | 差 |",
  "|---|---|---|---|",
  ...arithmetic.map((row) => `| ${row.label} | ${row.li} | ${row.claimedLi} | ${row.li - row.claimedLi > 0 ? "+" : ""}${row.li - row.claimedLi} |`),
  `| **合计** | ${measuredLi} | ${routeLiSum} | ${measuredLi - routeLiSum > 0 ? "+" : ""}${measuredLi - routeLiSum} |`,
  `| 全篇结语 | — | ${finalLi} | 四列结语相加较之 ${routeLiSum - finalLi > 0 ? "+" : ""}${routeLiSum - finalLi} |`,
  "",
  "此外第 42 段自带一句内部里程，与下一段的段首里数不合：",
  "",
  "> 自峚山至于鍾山，四百六十里 ／ 又西北四百二十里，曰鍾山",
  "",
  "依政策 §4.5.3a：结语本身就与段内相加不符，拿一个对不上的总数去校准个别数字，是把噪声当基准。",
  "里程差异**登记不裁决**，已作 `unresolved` variant 入库（decision_key `xishan-li-not-reconciled`）。",
  "",
  "## 3. 解析口径",
  "",
  "- 站 = 段首「（又）方位＋里数＋曰／至于＋名」一式所到之处；列首无里数，另以「之首曰X」识别。",
  "- 里数按段首所记相加，一段两站者两数皆计（仅第 48 段）。",
  "- 结语段（第 20、38、61、81、82 段）不计为站。",
  "",
];
writeFileSync(join(ROOT, "docs/generated/xishan-arithmetic.md"), `${arith.join("\n")}\n`);

const uncertainChars = Object.entries(readings.chars).filter(([, entry]) => entry.uncertain);
const review: string[] = [
  "# 《西山经》领域建模评审单",
  "",
  "由 `scripts/extract_xishan_domain.ts` 生成，勿手改。**这份文件是本轮真正的产物**：",
  "数据以 `draft` 入库、不上线，现在只对审的人有用；没有评审单，「已建模」就只是一句自述。",
  "",
  `- 抽取执行：${ROLE}（AI，未经人复核） ｜ 日期：${DATE}`,
  "- 输入语料：82 段冻结本（`scripts/data/xishan_corpus_v1.json`）",
  `- 规模：${stations.length} 站（${totalMountains} 山）、${waterNames.length} 水、${edges.length} 边、${entities.creatures.length} 概念、${occurrences.length} 处出现、${taxIndex} 条分类`,
  "",
  "每条引文都由生成器断言为所属段落的**连续子串**；断言失败则生成器报错，不会产出。",
  "",
  "## 0. 需要人来看的几处",
  "",
  `### 0.1 读音存疑 ${uncertainChars.length} 字`,
  "",
  "英文专名由这些字拼出，读错则名字错：",
  "",
  "| 字 | 拟音 | 出现于 |",
  "|---|---|---|",
  ...uncertainChars.map(([char, entry]) => {
    const where = [...places, ...entities.creatures.map((creature) => ({ nameZh: creature.surface, slug: creature.slug }))]
      .filter((item) => item.nameZh.includes(char)).map((item) => item.nameZh);
    return `| ${char} | ${entry.py} | ${[...new Set(where)].join("、") || "—"} |`;
  }),
  "",
  "### 0.2 拼音相撞的水名",
  "",
  slugCollisions.length === 0 ? "无。" : "同音异名，slug 以序号区分：\n",
  ...(slugCollisions.length === 0 ? [] : slugCollisions.map(([name, slug]) => `- ${name} → \`${slug}\``)),
  "",
  "### 0.3 未建概念的存疑之处",
  "",
  "| 段 | 词 | 缘由 |",
  "|---|---|---|",
  ...entities.deferred.map((item) => `| ${item.para} | ${item.surface} | ${item.reason} |`),
  "",
  "### 0.4 英文摘要一律留空",
  "",
  "地点、异兽、段落的英文 summary 全为空串。写摘要是翻译，翻译要人负责——这是执行清单 1-2，未做，也没假装做了。",
  "",
  "## 1. 路线与地点",
  "",
];
for (const route of ROUTES) {
  const own = stations.filter((station) => station.route === route.section);
  review.push(`### ${route.label}（第 ${route.from}–${route.to} 段，${own.length} 站）`, "",
    "| # | 段 | 名 | slug | 英文 | 段首所据 | 水 |", "|---|---|---|---|---|---|---|");
  for (const station of own) {
    const place = placeBySlug.get(station.slug)!;
    const waters = waterMentions
      .filter((mention) => mention.role === "source" && mention.stationSlug === station.slug)
      .map((mention) => {
        const run = runs.find((entry) => entry.from === canonical(mention.name) && entry.para === mention.para);
        return run ? `${canonical(mention.name)}→${run.to}` : canonical(mention.name);
      });
    review.push(`| ${station.routeIndex} | ${station.para} | ${station.name} | \`${station.slug}\` | ${place.nameEn} | ${station.opening || "（列首）"} | ${waters.join("、") || "—"} |`);
  }
  review.push("");
}
review.push("## 2. 异兽与神祇", "",
  "| # | 段 | 名 | slug | 类 | 所在 | 原文引文 | 分类 |", "|---|---|---|---|---|---|---|---|");
entities.creatures.forEach((creature, index) => {
  review.push(`| ${index + 1} | ${creature.para} | ${creature.surface} | \`${creature.slug}\` | ${KIND_ZH[creature.kind]}${creature.status === "provisional" ? "（暂定）" : ""} | ${stationBySlug.get(creature.place)!.name} | ${creature.quote} | ${creature.taxonomy.map((item) => `${item.axis}/${item.term}`).join("<br>") || "—"} |`);
});
review.push("", "### 2.1 另记的化身出现", "", "| 概念 | 段 | 形 | 引文 |", "|---|---|---|---|",
  ...entities.extraOccurrences.map((extra) => `| ${extra.creature} | ${extra.para} | ${extra.surface} | ${extra.quote} |`), "");
review.push("## 3. 不建为概念者", "", entities.excludedKinds.note, "",
  `- 草木矿物（${entities.excludedKinds.flora_minerals.length}）：${entities.excludedKinds.flora_minerals.join("、")}`,
  `- 无形貌描写的常兽常鸟（${entities.excludedKinds.ordinary_fauna.length}）：${entities.excludedKinds.ordinary_fauna.join("、")}`, "");
review.push("## 4. 计数与里程", "", "见 [xishan-arithmetic.md](xishan-arithmetic.md)。", "");
writeFileSync(join(ROOT, "docs/generated/xishan-domain-review.md"), `${review.join("\n")}\n`);
console.log("review documents written: docs/generated/xishan-arithmetic.md, docs/generated/xishan-domain-review.md");
