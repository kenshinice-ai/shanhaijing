import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import pg from "pg";

/**
 * Deterministic artistic-overview generator (SJ-D011).
 *
 * Renders the label-free Shanhaijing composite master as an original SVG from
 * the shj_* tables: mountain clusters at each textual place, rivers derived
 * from the passages' own "X水出焉，Y流" wording, seas, mist, and creature
 * auras. No external imagery, fonts, or model output is used, and the same
 * database state always yields byte-identical SVG, so the asset carries a
 * stable checksum. Text labels are intentionally absent: the workspace lays
 * hotspots, names, and distances over this art programmatically.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://llmacbookpro@localhost:5432/shanhaijing_atlas";
const OUT_DIR = join(ROOT, "apps/web/public/media/shanhaijing");
const OUT_SVG = join(OUT_DIR, "artistic-overview-v1.svg");
const MANIFEST = join(ROOT, "docs/generated/artistic-overview-v1.manifest.json");
const VERSION = "artistic-composite-svg-v1";

/**
 * 母图的三套画风。三者共用同一套几何——山簇、水系、海岸全部由语料推导，
 * 换的只是颜色与笔触，因此比较的是"哪一版更好看、标签更压得住"，
 * 而不是"哪一版把地理画对了"。
 *
 * `ink` 是采用版：叠加层要在母图上放 94 个标签，母图越安静，证据越读得清。
 * 另两版保留在生成器里可随时重出，比较记录见 generated/map-variants-2026-08-18.md。
 */
interface Palette {
  seaTop: string; seaMid: string; seaLow: string; glint: string;
  landInner: string; landMid: string; landOuter: string; landEdge: string;
  peakA: [string, string, string]; peakB: [string, string, string]; peakC: [string, string, string];
  riverFrom: string; riverTo: string; mist: string; aura: string;
  grainOpacity: string; contourOpacity: string; rangeOpacity: string;
}

const PALETTES: Record<string, Palette> = {
  // A · 手卷:现行版本,墨绿海面与土色大陆。
  handscroll: {
    seaTop: "#16333a", seaMid: "#10262c", seaLow: "#0a181d", glint: "#5da294",
    landInner: "#8a744d", landMid: "#6d6647", landOuter: "#48513c", landEdge: "#32402f",
    peakA: ["#d8c489", "#8f7c52", "#4c4a35"], peakB: ["#b9c9a0", "#6f815c", "#3a4736"], peakC: ["#a3b5b3", "#5f7674", "#33403f"],
    riverFrom: "#7fc0b2", riverTo: "#3f7a74", mist: "#e8e2cf", aura: "#f5c15d",
    grainOpacity: ".05", contourOpacity: ".16", rangeOpacity: ".5",
  },
  // B · 青绿:矿物石青石绿,层叠更重,近传统青绿山水。
  mineral: {
    seaTop: "#123c46", seaMid: "#0c2b34", seaLow: "#071a20", glint: "#6fc2ba",
    landInner: "#7d8f5f", landMid: "#5d7a55", landOuter: "#3c5c4c", landEdge: "#27423a",
    peakA: ["#cfe0b4", "#7fa46d", "#3d5a42"], peakB: ["#a8d3c4", "#4f8f84", "#27524f"], peakC: ["#8fc0cc", "#4a7f8e", "#254852"],
    riverFrom: "#9fdcd0", riverTo: "#46918a", mist: "#eef3e4", aura: "#f3cb6a",
    grainOpacity: ".04", contourOpacity: ".2", rangeOpacity: ".55",
  },
  // C · 水墨:近单色淡墨,纸色地面,留白最多——标签压上去最清楚。
  ink: {
    seaTop: "#1b2f33", seaMid: "#142529", seaLow: "#0d1a1d", glint: "#7d9c97",
    landInner: "#7c7358", landMid: "#5f5f4b", landOuter: "#454b3c", landEdge: "#2f382e",
    peakA: ["#cdc4a6", "#7d7663", "#42413a"], peakB: ["#b3bda8", "#68705f", "#383d36"], peakC: ["#a6b0ae", "#5c6664", "#333a39"],
    riverFrom: "#8fb5ad", riverTo: "#4a6f6b", mist: "#ece7d8", aura: "#efc978",
    grainOpacity: ".06", contourOpacity: ".12", rangeOpacity: ".42",
  },
};

const args = process.argv.slice(2);
const argValue = (name: string): string | undefined => {
  const hit = args.find((arg) => arg.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : undefined;
};
const VARIANT = argValue("--variant") ?? "ink";
const PALETTE = PALETTES[VARIANT] ?? PALETTES.ink!;

// Same projection as ShanhaijingWorkspace so overlay hotspots land on the art.
const X = (layoutX: number): number => layoutX * 8.6 + 65;
const Y = (layoutY: number): number => layoutY * 5 + 60;
const W = 1000;
const H = 600;

/** mulberry32: tiny deterministic PRNG so art varies per slug, never per run. */
function prng(seedText: string): () => number {
  let seed = 0;
  for (const ch of seedText) seed = Math.imul(seed ^ ch.codePointAt(0)!, 2654435761) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fixed = (value: number): string => (Math.round(value * 100) / 100).toString();

type Place = { slug: string; x: number; y: number; sort: number; creatures: number };
type River = { fromX: number; fromY: number; direction: string };

async function main(): Promise<void> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const placeRows = await pool.query<{ slug: string; layout_x: number; layout_y: number; sort_order: number; creatures: string }>(
      // 母图本身是 published 资产,只能画 published 的内容。少了这个条件,
      // 任何一篇刚入库的 draft 地点都会悄悄出现在对外的手卷上——
      // 《西山经》领域数据一装进来,CI 的确定性检查就是这样把它照出来的。
      `SELECT p.slug, p.layout_x, p.layout_y, p.sort_order,
              (SELECT count(*) FROM shj_creature_occurrences o
                WHERE o.place_id=p.id AND o.review_status='published') AS creatures
         FROM shj_textual_places p JOIN works w ON w.id=p.work_id
        WHERE w.slug='shanhaijing' AND p.review_status='published' ORDER BY p.sort_order`,
    );
    const passageRows = await pool.query<{ text_zh: string; place_slug: string | null }>(
      `SELECT p.text_zh, (SELECT pl.slug FROM shj_place_mentions m JOIN shj_textual_places pl ON pl.id=m.place_id
                           WHERE m.passage_id=p.id ORDER BY m.mention_order LIMIT 1) AS place_slug
         FROM shj_text_passages p JOIN shj_text_sections s ON s.id=p.section_id
         JOIN shj_text_editions e ON e.id=s.edition_id JOIN works w ON w.id=e.work_id
        WHERE w.slug='shanhaijing' AND e.review_status='published' AND p.review_status='published'
        ORDER BY s.sequence, p.sequence`,
    );

    const places: Place[] = placeRows.rows.map((row) => ({
      slug: row.slug, x: X(Number(row.layout_x)), y: Y(Number(row.layout_y)),
      sort: row.sort_order, creatures: Number(row.creatures),
    }));
    if (places.length === 0) throw new Error("no textual places; refusing to render an empty master");

    // Rivers straight from the corpus wording: 「…水出焉，而東流…」.
    const rivers: River[] = [];
    for (const row of passageRows.rows) {
      const source = places.find((place) => place.slug === row.place_slug);
      if (!source) continue;
      for (const match of row.text_zh.matchAll(/水出焉[，,]?而?(東|南|西|北)流/gu)) {
        rivers.push({ fromX: source.x, fromY: source.y, direction: match[1] });
      }
    }

    const svg = render(places, rivers);
    await mkdir(OUT_DIR, { recursive: true });
    const outPath = argValue("--out") ?? OUT_SVG;
    await writeFile(outPath, svg);
    const checksum = createHash("sha256").update(svg).digest("hex");
    const manifest = {
      version: VERSION,
      generator: "scripts/generate_overview.ts",
      generatedAt: new Date().toISOString(),
      deterministic: true,
      inputs: { textualPlaces: places.length, rivers: rivers.length },
      output: { path: "apps/web/public/media/shanhaijing/artistic-overview-v1.svg", bytes: Buffer.byteLength(svg), sha256: checksum },
      rights: { rights_status: "verified", note: "Project-authored procedural vector art; no third-party imagery, fonts, or model output." },
      interpretation_class: "artistic_interpretation",
      disclosure: "Composition is artistic; it is not ancient geography or modern coordinates.",
    };
    if (argValue("--out")) return;   // 比较用的产物不写 manifest,避免污染已发布资产的记录
    await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`artistic overview: ${Buffer.byteLength(svg)} bytes, sha256 ${checksum}`);
    console.log(`written: ${outPath}（画风 ${VARIANT}）`);
  } finally {
    await pool.end();
  }
}

function render(places: Place[], rivers: River[]): string {
  const parts: string[] = [];
  const emit = (part: string): void => { parts.push(part); };

  // No preserveAspectRatio override here: the consuming <image> element decides
  // how the master is fitted, and forcing "slice" on the root would crop the
  // composition in any standalone viewer.
  emit(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">`);
  const p = PALETTE;
  emit(`<defs>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.seaTop}"/><stop offset=".55" stop-color="${p.seaMid}"/><stop offset="1" stop-color="${p.seaLow}"/></linearGradient>
<linearGradient id="seaGlint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.glint}" stop-opacity=".22"/><stop offset=".5" stop-color="${p.glint}" stop-opacity="0"/><stop offset="1" stop-color="${p.glint}" stop-opacity=".18"/></linearGradient>
<radialGradient id="land" cx=".46" cy=".42" r=".78"><stop offset="0" stop-color="${p.landInner}"/><stop offset=".45" stop-color="${p.landMid}"/><stop offset=".78" stop-color="${p.landOuter}"/><stop offset="1" stop-color="${p.landEdge}"/></radialGradient>
<linearGradient id="peakA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.peakA[0]}"/><stop offset=".38" stop-color="${p.peakA[1]}"/><stop offset="1" stop-color="${p.peakA[2]}"/></linearGradient>
<linearGradient id="peakB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.peakB[0]}"/><stop offset=".4" stop-color="${p.peakB[1]}"/><stop offset="1" stop-color="${p.peakB[2]}"/></linearGradient>
<linearGradient id="peakC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.peakC[0]}"/><stop offset=".42" stop-color="${p.peakC[1]}"/><stop offset="1" stop-color="${p.peakC[2]}"/></linearGradient>
<linearGradient id="river" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.riverFrom}" stop-opacity=".85"/><stop offset="1" stop-color="${p.riverTo}" stop-opacity=".55"/></linearGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.mist}" stop-opacity="0"/><stop offset=".5" stop-color="${p.mist}" stop-opacity=".14"/><stop offset="1" stop-color="${p.mist}" stop-opacity="0"/></linearGradient>
<radialGradient id="aura"><stop offset="0" stop-color="${p.aura}" stop-opacity=".5"/><stop offset=".6" stop-color="${p.aura}" stop-opacity=".14"/><stop offset="1" stop-color="${p.aura}" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-100%" y="-400%" width="300%" height="900%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.93 0 0 0 0 0.89 0 0 0 0 0.78 0 0 0 ${p.grainOpacity} 0"/></filter>
</defs>`);

  // Sea and swell lines.
  emit(`<rect width="${W}" height="${H}" fill="url(#sea)"/><rect width="${W}" height="${H}" fill="url(#seaGlint)"/>`);
  const swell = prng("sea-swell");
  for (let row = 0; row < 16; row += 1) {
    const y = 24 + row * 37 + swell() * 12;
    const segments: string[] = [];
    for (let x = -40; x < W + 40; x += 84) {
      segments.push(`M${fixed(x + swell() * 26)} ${fixed(y + swell() * 8)} q21 -${fixed(5 + swell() * 5)} 42 0`);
    }
    emit(`<path d="${segments.join(" ")}" fill="none" stroke="#8fb7ac" stroke-opacity="${fixed(0.05 + swell() * 0.05)}" stroke-width="1.1"/>`);
  }

  // Landmass hull: inflate a smooth closed curve around the route nodes.
  const hull = landmassPath(places);
  const cx = places.reduce((sum, place) => sum + place.x, 0) / places.length;
  const cy = places.reduce((sum, place) => sum + place.y, 0) / places.length;
  emit(`<path d="${hull}" fill="#0d1f22" opacity=".55" filter="url(#soft)" transform="translate(0 14)"/>`);
  emit(`<path id="hull" d="${hull}" fill="url(#land)"/>`);
  emit(`<path d="${hull}" fill="none" stroke="#d8c489" stroke-opacity=".28" stroke-width="2"/>`);
  // Elevation-style inner contours: reuse the hull scaled about its centroid.
  for (const scale of [0.86, 0.7, 0.54]) {
    emit(`<use href="#hull" fill="none" stroke="${p.landEdge}" stroke-opacity="${p.contourOpacity}" stroke-width="1" transform="translate(${fixed(cx * (1 - scale))} ${fixed(cy * (1 - scale))}) scale(${scale})"/>`);
  }

  // Distant ranges hugging the inland horizon, clipped to the landmass so no
  // silhouette ever floats on the sea.
  emit(`<clipPath id="landClip"><path d="${hull}"/></clipPath>`);
  const far = prng("far-ranges");
  const minY = Math.min(...places.map((place) => place.y));
  const minX = Math.min(...places.map((place) => place.x));
  const maxX = Math.max(...places.map((place) => place.x));
  emit(`<g clip-path="url(#landClip)">`);
  for (let band = 0; band < 2; band += 1) {
    const baseY = minY - 74 + band * 22;
    const segments: string[] = [`M${fixed(minX - 60)} ${fixed(baseY + 26)}`];
    // Irregular ridgeline: varying summit spacing and height stops the row
    // from reading as a decorative sawtooth border.
    for (let x = minX - 60; x < maxX + 40; ) {
      const run = 26 + far() * 46;
      const rise = 6 + far() * 30 + band * 6;
      segments.push(`L${fixed(x + run * 0.45)} ${fixed(baseY + 26 - rise)} L${fixed(x + run)} ${fixed(baseY + 26 - far() * 8)}`);
      x += run;
    }
    emit(`<path d="${segments.join(" ")} L${fixed(maxX + 40)} ${fixed(baseY + 40)} L${fixed(minX - 60)} ${fixed(baseY + 40)} Z" fill="#414d38" opacity="${band === 0 ? ".38" : ".26"}"/>`);
  }
  emit(`</g>`);

  // Rivers derived from the corpus: flow from the source mountain toward the
  // stated direction, widening into the sea or an inland pool.
  for (const [index, river] of rivers.entries()) {
    const flow = prng(`river-${index}-${river.direction}`);
    const dx = river.direction === "東" ? 1 : river.direction === "西" ? -1 : 0.15;
    const dy = river.direction === "南" ? 1 : river.direction === "北" ? -1 : 0.2;
    let x = river.fromX;
    let y = river.fromY + 16;
    const points = [`M${fixed(x)} ${fixed(y)}`];
    for (let step = 0; step < 3; step += 1) {
      const bend = (flow() - 0.5) * 26;
      const nx = x + dx * (56 + flow() * 30) + (dy !== 0 ? bend : 0);
      const ny = y + dy * (52 + flow() * 26) + (dx !== 0 ? bend * 0.6 : 0);
      points.push(`Q${fixed((x + nx) / 2 + (flow() - 0.5) * 18)} ${fixed((y + ny) / 2 + (flow() - 0.5) * 14)} ${fixed(nx)} ${fixed(ny)}`);
      x = nx;
      y = ny;
    }
    // Clipped to the landmass: a watercourse ends at the coast rather than
    // trailing across open sea as a wire.
    emit(`<g clip-path="url(#landClip)">`);
    emit(`<path d="${points.join(" ")}" fill="none" stroke="url(#river)" stroke-width="5" stroke-linecap="round" opacity=".65"/>`);
    emit(`<path d="${points.join(" ")}" fill="none" stroke="#d9efe6" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>`);
    emit(`</g>`);
  }

  // Horizontal room per place: distance to the nearest neighbour on the same
  // route band. Routes vary from 9 to 17 mountains across the same width, so
  // cluster size has to follow the crowding or the bands turn into a hedge.
  const bandKey = (place: Place): number => Math.round(place.y / 70);
  const byBand = new Map<number, Place[]>();
  for (const place of places) {
    const key = bandKey(place);
    byBand.set(key, [...(byBand.get(key) ?? []), place]);
  }
  const roomBySlug = new Map<string, number>();
  for (const band of byBand.values()) {
    const sorted = [...band].sort((a, b) => a.x - b.x);
    sorted.forEach((place, index) => {
      const left = index > 0 ? place.x - sorted[index - 1].x : Number.POSITIVE_INFINITY;
      const right = index < sorted.length - 1 ? sorted[index + 1].x - place.x : Number.POSITIVE_INFINITY;
      const nearest = Math.min(left, right);
      roomBySlug.set(place.slug, Number.isFinite(nearest) ? nearest : 130);
    });
  }
  // Depth: southern (lower) routes read as nearer, so they run slightly larger
  // and fully saturated while northern routes recede.
  const minPlaceY = Math.min(...places.map((place) => place.y));
  const maxPlaceY = Math.max(...places.map((place) => place.y));
  const spanY = Math.max(maxPlaceY - minPlaceY, 1);

  // Mountain clusters, one per textual place; grandeur grows with creatures.
  const washes = ["url(#peakA)", "url(#peakB)", "url(#peakC)"];
  const drawOrder = [...places].sort((a, b) => a.y - b.y);
  for (const place of drawOrder) {
    const rand = prng(`mount-${place.slug}`);
    const grandeur = 1 + Math.min(place.creatures, 4) * 0.1;
    const depth = (place.y - minPlaceY) / spanY;
    // Fit the cluster inside its share of the band, then apply depth scaling.
    const fit = Math.max(0.42, Math.min(1, (roomBySlug.get(place.slug) ?? 130) / 118));
    const scale = fit * (0.84 + depth * 0.26);
    emit(`<g transform="translate(${fixed(place.x)} ${fixed(place.y)}) scale(${fixed(scale)})" opacity="${fixed(0.82 + depth * 0.18)}">`);
    emit(`<ellipse cx="0" cy="26" rx="50" ry="11" fill="#0d1f22" opacity=".35" filter="url(#soft)"/>`);
    const peaks = 3 + Math.floor(rand() * 2);
    for (let peak = peaks - 1; peak >= 0; peak -= 1) {
      const offset = (peak - (peaks - 1) / 2) * (16 + rand() * 8);
      const height = (30 + rand() * 26) * grandeur * (peak === Math.floor(peaks / 2) ? 1.35 : 0.82);
      const width = 20 + rand() * 14;
      const skew = (rand() - 0.5) * 10;
      const wash = washes[(place.sort + peak) % washes.length];
      emit(`<path d="M${fixed(offset - width)} 24 Q${fixed(offset - width * 0.35)} ${fixed(-height * 0.45)} ${fixed(offset + skew)} ${fixed(-height)} Q${fixed(offset + width * 0.5)} ${fixed(-height * 0.35)} ${fixed(offset + width)} 24 Z" fill="${wash}"/>`);
      emit(`<path d="M${fixed(offset + skew)} ${fixed(-height)} Q${fixed(offset + width * 0.18)} ${fixed(-height * 0.5)} ${fixed(offset + width * 0.42)} ${fixed(-height * 0.08)}" fill="none" stroke="#1f2a24" stroke-opacity=".5" stroke-width="1.3"/>`);
    }
    if (place.creatures > 0) {
      emit(`<circle r="${fixed(28 + place.creatures * 3)}" fill="url(#aura)"/>`);
      // A faint halo arc above the summit, one short spark per occurrence.
      const strokes = Math.min(place.creatures, 5);
      for (let ray = 0; ray < strokes; ray += 1) {
        const angle = -Math.PI / 2 + (ray - (strokes - 1) / 2) * 0.42;
        const inner = 46 + rand() * 4;
        const outer = inner + 7;
        emit(`<line x1="${fixed(Math.cos(angle) * inner)}" y1="${fixed(Math.sin(angle) * inner + 4)}" x2="${fixed(Math.cos(angle) * outer)}" y2="${fixed(Math.sin(angle) * outer + 4)}" stroke="#f5c15d" stroke-opacity=".32" stroke-width="1.6" stroke-linecap="round"/>`);
      }
    }
    // Vegetation skirt: small stylised trees at the foot of each cluster.
    const trees = 2 + Math.floor(rand() * 3);
    for (let tree = 0; tree < trees; tree += 1) {
      const tx = (rand() - 0.5) * 108;
      const ty = 22 + rand() * 16;
      const size = 3.4 + rand() * 2.4;
      emit(`<g transform="translate(${fixed(tx)} ${fixed(ty)})" opacity=".55">` +
        `<line x1="0" y1="0" x2="0" y2="${fixed(-size)}" stroke="#2c3527" stroke-width="1"/>` +
        `<circle cx="0" cy="${fixed(-size - 2)}" r="${fixed(size * 0.8)}" fill="#4f5c3c"/></g>`);
    }
    emit(`</g>`);
  }

  // Mist bands and grain.
  const mist = prng("mist");
  for (let band = 0; band < 3; band += 1) {
    const y = 180 + band * 120 + mist() * 40;
    emit(`<ellipse cx="${fixed(240 + mist() * 520)}" cy="${fixed(y)}" rx="${fixed(190 + mist() * 120)}" ry="22" fill="url(#mist)" filter="url(#soft)"/>`);
  }
  emit(`<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".6"/>`);

  // Vignette and double frame with plain corner marks.
  emit(`<rect width="${W}" height="${H}" fill="none" stroke="#0a1417" stroke-width="26" opacity=".5"/>`);
  emit(`<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#d8c489" stroke-opacity=".5" stroke-width="1.6"/>`);
  emit(`<rect x="17" y="17" width="${W - 34}" height="${H - 34}" fill="none" stroke="#d8c489" stroke-opacity=".22" stroke-width="1"/>`);
  for (const [cx, cy] of [[10, 10], [W - 10, 10], [10, H - 10], [W - 10, H - 10]] as const) {
    emit(`<path d="M${cx - 8} ${cy} H${cx + 8} M${cx} ${cy - 8} V${cy + 8}" stroke="#d8c489" stroke-opacity=".6" stroke-width="1.6"/>`);
  }

  emit(`</svg>`);
  return `${parts.join("\n")}\n`;
}

/** Smooth closed hull around all nodes, padded and wobbled deterministically. */
function landmassPath(places: Place[]): string {
  const cx = places.reduce((sum, place) => sum + place.x, 0) / places.length;
  const cy = places.reduce((sum, place) => sum + place.y, 0) / places.length;
  const wobble = prng("landmass");
  const samples = 26;
  const points: Array<[number, number]> = [];
  for (let index = 0; index < samples; index += 1) {
    const angle = (index / samples) * Math.PI * 2;
    // Support-function reach: already anisotropic, so the padded radius must be
    // used for both axes. Scaling the vertical component separately would pull
    // the coast inside the southernmost route.
    let reach = 0;
    for (const place of places) {
      const along = (place.x - cx) * Math.cos(angle) + (place.y - cy) * Math.sin(angle);
      reach = Math.max(reach, along);
    }
    // Headlands and bays: alternate the padding so the coast reads hand-drawn.
    // Layered octaves plus an occasional deep inlet keep the coast from
    // reading as a rounded rectangle once the hull is smoothed.
    const bay = Math.sin(index * 2.4) * 20 + Math.sin(index * 1.1 + 0.7) * 15 + Math.sin(index * 4.3) * 9;
    const inlet = index % 7 === 3 ? -34 : index % 5 === 0 ? 22 : 0;
    const radius = reach + 26 + wobble() * 26 + bay + inlet;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  const clamped = points.map(([x, y]): [number, number] => [Math.min(Math.max(x, 46), W - 46), Math.min(Math.max(y, 60), H - 40)]);
  const path: string[] = [];
  for (let index = 0; index < clamped.length; index += 1) {
    const current = clamped[index];
    const next = clamped[(index + 1) % clamped.length];
    const midX = (current[0] + next[0]) / 2;
    const midY = (current[1] + next[1]) / 2;
    if (index === 0) path.push(`M${fixed(midX)} ${fixed(midY)}`);
    else path.push(`Q${fixed(current[0])} ${fixed(current[1])} ${fixed(midX)} ${fixed(midY)}`);
  }
  const last = clamped[0];
  const first = clamped[1] ?? clamped[0];
  path.push(`Q${fixed(last[0])} ${fixed(last[1])} ${fixed((last[0] + first[0]) / 2)} ${fixed((last[1] + first[1]) / 2)}`);
  path.push("Z");
  return path.join(" ");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
