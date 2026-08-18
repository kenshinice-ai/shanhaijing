/**
 * Deterministic label placement for the atlas overlay.
 *
 * The master SVG is label-free; hotspots, node names and route distances are
 * laid over it at render time. Node names already stagger above and below
 * their own route band, but route distances used to sit at the raw edge
 * midpoint with no awareness of anything else, so they landed on top of node
 * names and creature counts (36 overlapping pairs in English, 27 in Chinese).
 *
 * Placement here is pure and order-stable: the same edges and obstacles always
 * produce the same coordinates, so the overlay stays as reproducible as the
 * master it sits on. Nothing is ever dropped — when no candidate is free the
 * least-colliding one wins, because a slightly crowded distance is still
 * evidence and a missing one is a silent data loss.
 */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RouteLabelInput {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
}

export interface PlacedRouteLabel {
  x: number;
  y: number;
}

/** Curve control point used by the route path, kept in sync with the edge `d`. */
const CURVE_LIFT = 24;

/**
 * Han, kana and full-width punctuation occupy one em; Latin and digits are
 * narrower. Measuring the real DOM would tie placement to fonts that load
 * late, so the estimate is intentionally font-independent and slightly
 * generous — over-estimating width only makes labels keep more distance.
 */
const FULL_WIDTH =
  /[ᄀ-ᅟ⺀-〿ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹏！-｠￠-￦]|[\u{20000}-\u{3FFFD}]/u;

const LATIN_RATIO = 0.62;

/**
 * Labels are painted with a 4–5px halo stroke, and a browser's own box is
 * taller than the em. Both are folded in here so the geometry this module
 * reasons about is at least as large as what the reader actually sees.
 */
const HALO = 2.5;

export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) width += FULL_WIDTH.test(char) ? fontSize : fontSize * LATIN_RATIO;
  return width;
}

export function textBox(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  anchor: "start" | "middle" = "start",
): Box {
  const width = estimateTextWidth(text, fontSize) + HALO * 2;
  return {
    x: (anchor === "middle" ? x - width / 2 : x - HALO),
    y: y - fontSize * 0.92 - HALO,
    width,
    height: fontSize * 1.24 + HALO * 2,
  };
}

export function circleBox(cx: number, cy: number, r: number): Box {
  return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
}

/** Overlapping area of two boxes; 0 when they merely touch. */
export function overlapArea(a: Box, b: Box): number {
  const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

/** Point on the quadratic the route edge is drawn with. */
function curvePoint(edge: RouteLabelInput, t: number): { x: number; y: number } {
  const cx = (edge.x1 + edge.x2) / 2;
  const cy = Math.min(edge.y1, edge.y2) - CURVE_LIFT;
  const m = 1 - t;
  return {
    x: m * m * edge.x1 + 2 * m * t * cx + t * t * edge.x2,
    y: m * m * edge.y1 + 2 * m * t * cy + t * t * edge.y2,
  };
}

/**
 * Candidates in preference order: on the curve apex first, then further along
 * the curve, then further away from it. Earlier entries also carry a small
 * tie-break penalty so a free apex always beats a free outlier.
 */
const CANDIDATES: { t: number; dy: number }[] = [
  { t: 0.5, dy: -9 },
  { t: 0.5, dy: 19 },
  { t: 0.36, dy: -9 },
  { t: 0.64, dy: -9 },
  { t: 0.36, dy: 19 },
  { t: 0.64, dy: 19 },
  { t: 0.5, dy: -26 },
  { t: 0.5, dy: 36 },
  { t: 0.28, dy: -26 },
  { t: 0.72, dy: -26 },
  { t: 0.5, dy: -43 },
  { t: 0.5, dy: 53 },
  { t: 0.22, dy: -9 },
  { t: 0.78, dy: -9 },
  { t: 0.22, dy: 19 },
  { t: 0.78, dy: 19 },
  { t: 0.5, dy: -60 },
  { t: 0.5, dy: 70 },
];

export interface NodeLabelOffset {
  dx: number;
  dy: number;
}

export interface NodeLabelInput {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  /** The side this node's band rank asks for; honoured whenever it is free. */
  preferBelow: boolean;
}

/**
 * Vertical slots for a node name, nearest the node first. Alternating strictly
 * by rank — the previous rule — kept same-band neighbours apart but was blind
 * to the creature counts sitting inside neighbouring rings, so a long name ran
 * straight through the digit next door.
 */
const VERTICAL_SLOTS_BELOW = [44, -40, 58, -54, 72, -68, 86, -82];
const VERTICAL_SLOTS_ABOVE = [-40, 44, -54, 58, -68, 72, -82, 86];

/**
 * Vertical room first — a name directly under or over its node reads as
 * belonging to it. Only once every band is taken does the name slide sideways,
 * and then by less than half its own width so the pairing still holds.
 */
function nodeSlots(preferBelow: boolean): { dx: number; dy: number }[] {
  const vertical = preferBelow ? VERTICAL_SLOTS_BELOW : VERTICAL_SLOTS_ABOVE;
  return [
    ...vertical.map((dy) => ({ dx: 0, dy })),
    ...vertical.slice(0, 4).flatMap((dy) => [{ dx: -26, dy }, { dx: 26, dy }]),
  ];
}

export function placeNodeLabels(nodes: NodeLabelInput[], obstacles: Box[]): Map<string, NodeLabelOffset> {
  const placed = new Map<string, NodeLabelOffset>();
  const taken: Box[] = [];
  for (const node of nodes) {
    let best: { offset: NodeLabelOffset; cost: number } | null = null;
    for (const [index, slot] of nodeSlots(node.preferBelow).entries()) {
      const box = textBox(node.x + slot.dx, node.y + slot.dy, node.text, node.fontSize);
      let cost = index * 0.5;
      for (const other of obstacles) cost += overlapArea(box, other);
      for (const other of taken) cost += overlapArea(box, other);
      if (!best || cost < best.cost) best = { offset: slot, cost };
      if (cost === index * 0.5) break;
    }
    if (!best) continue;
    placed.set(node.id, best.offset);
    taken.push(textBox(node.x + best.offset.dx, node.y + best.offset.dy, node.text, node.fontSize));
  }
  return placed;
}

export function placeRouteLabels(
  edges: RouteLabelInput[],
  obstacles: Box[],
  fontSize = 12,
): Map<string, PlacedRouteLabel> {
  const placed = new Map<string, PlacedRouteLabel>();
  const taken: Box[] = [];
  for (const edge of edges) {
    let best: { x: number; y: number; cost: number } | null = null;
    for (const [index, candidate] of CANDIDATES.entries()) {
      const point = curvePoint(edge, candidate.t);
      const y = point.y + candidate.dy;
      const box = textBox(point.x, y, edge.text, fontSize, "middle");
      let cost = index * 0.5;
      for (const other of obstacles) cost += overlapArea(box, other);
      for (const other of taken) cost += overlapArea(box, other);
      if (!best || cost < best.cost) best = { x: point.x, y, cost };
      if (cost === index * 0.5) break; // free slot; no later candidate can win
    }
    if (!best) continue;
    placed.set(edge.id, { x: best.x, y: best.y });
    taken.push(textBox(best.x, best.y, edge.text, fontSize, "middle"));
  }
  return placed;
}
