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
  /**
   * How much overlapping this box costs, relative to overlapping text. A node
   * ring is a circle: the corners of its bounding box are empty, so a label
   * clipping one is far less harmful than a label crossing a name. Defaults
   * to 1 — full weight — for everything textual.
   */
  weight?: number;
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

const RING_WEIGHT = 0.3;

/** Improvement sweeps after the greedy pass. Two is where the maps stop moving. */
const REFINEMENT_PASSES = 2;

export function circleBox(cx: number, cy: number, r: number): Box {
  return { x: cx - r, y: cy - r, width: r * 2, height: r * 2, weight: RING_WEIGHT };
}

/** Weighted overlap: what a candidate position actually costs. */
function penalty(box: Box, other: Box): number {
  const area = overlapArea(box, other);
  return area === 0 ? 0 : area * (other.weight ?? 1);
}

/**
 * Uniform grid over the map, so a candidate position is scored against the
 * boxes near it instead of every box on the canvas.
 *
 * Scanning all obstacles is quadratic, which the Nanshan Jing's thirty-nine
 * nodes hide completely — 15 ms — and the whole 五藏山经's four hundred-odd
 * would not: measured at 625 ms, on every render. Boxes that cannot overlap
 * contribute exactly zero to the cost, so restricting the scan to overlapping
 * candidates changes the arithmetic not at all; it only stops doing the
 * multiplication for pairs that are nowhere near each other.
 */
const CELL = 64;

interface Entry { box: Box; owner: string }

class BoxIndex {
  private readonly cells = new Map<number, Entry[]>();
  /** The box each owner currently occupies; earlier ones are stale. */
  private readonly current = new Map<string, Box>();

  private *keys(box: Box): Generator<number> {
    const x0 = Math.floor(box.x / CELL); const x1 = Math.floor((box.x + box.width) / CELL);
    const y0 = Math.floor(box.y / CELL); const y1 = Math.floor((box.y + box.height) / CELL);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) yield x * 100000 + y;
  }

  /**
   * Placing an owner again supersedes its previous box rather than removing it.
   * Refinement runs a fixed number of passes, so each owner leaves at most a
   * handful of stale entries — cheaper than deleting from every cell it spans.
   */
  set(owner: string, box: Box): void {
    this.current.set(owner, box);
    for (const key of this.keys(box)) {
      const bucket = this.cells.get(key);
      if (bucket) bucket.push({ box, owner }); else this.cells.set(key, [{ box, owner }]);
    }
  }

  add(box: Box): void { this.set(`fixed:${this.current.size}`, box); }

  /** Total weighted overlap of `box` against everything indexed but `skipOwner`. */
  cost(box: Box, skipOwner?: string): number {
    let total = 0;
    const seen = new Set<Box>();
    for (const key of this.keys(box)) {
      const bucket = this.cells.get(key);
      if (!bucket) continue;
      for (const entry of bucket) {
        if (entry.owner === skipOwner) continue;
        if (this.current.get(entry.owner) !== entry.box) continue; // superseded
        if (seen.has(entry.box)) continue;
        seen.add(entry.box);
        total += penalty(box, entry.box);
      }
    }
    return total;
  }
}

function indexOf(boxes: Box[]): BoxIndex {
  const index = new BoxIndex();
  for (const box of boxes) index.add(box);
  return index;
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
const CANDIDATES: { t: number; dy: number; dx?: number }[] = [
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
  { t: 0.14, dy: -9 },
  { t: 0.86, dy: -9 },
  { t: 0.36, dy: -43 },
  { t: 0.64, dy: -43 },
  { t: 0.36, dy: 53 },
  { t: 0.64, dy: 53 },
  { t: 0.5, dy: -78 },
  { t: 0.5, dy: 88 },
  { t: 0.5, dy: -9, dx: -16 },
  { t: 0.5, dy: -9, dx: 16 },
  { t: 0.5, dy: 19, dx: -16 },
  { t: 0.5, dy: 19, dx: 16 },
  { t: 0.36, dy: -26, dx: -16 },
  { t: 0.64, dy: -26, dx: 16 },
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
    ...vertical.flatMap((dy) => [{ dx: -30, dy }, { dx: 30, dy }]),
    ...vertical.flatMap((dy) => [{ dx: -58, dy }, { dx: 58, dy }]),
  ];
}

export function placeNodeLabels(nodes: NodeLabelInput[], obstacles: Box[]): Map<string, NodeLabelOffset> {
  const boxes = new Map<string, Box>();
  const chosen = new Map<string, NodeLabelOffset>();
  const fixed = indexOf(obstacles);
  const peers = new BoxIndex();
  const pick = (node: NodeLabelInput): NodeLabelOffset => {
    let best: { offset: NodeLabelOffset; cost: number } | null = null;
    for (const [index, slot] of nodeSlots(node.preferBelow).entries()) {
      const box = textBox(node.x + slot.dx, node.y + slot.dy, node.text, node.fontSize);
      const cost = index * 0.5 + fixed.cost(box) + peers.cost(box, node.id);
      if (!best || cost < best.cost) best = { offset: slot, cost };
      if (cost === index * 0.5) break;
    }
    return best?.offset ?? { dx: 0, dy: 44 };
  };
  const place = (node: NodeLabelInput): void => {
    const offset = pick(node);
    chosen.set(node.id, offset);
    const box = textBox(node.x + offset.dx, node.y + offset.dy, node.text, node.fontSize);
    boxes.set(node.id, box);
    peers.set(node.id, box);
  };
  for (const node of nodes) place(node);
  // Greedy placement is order-dependent: an early name can take the slot a
  // later, more constrained one needed. Re-picking each name against the
  // finished layout lets those trades unwind. Two passes settle it; the order
  // is fixed, so the result stays reproducible.
  for (let pass = 0; pass < REFINEMENT_PASSES; pass++) for (const node of nodes) place(node);
  return chosen;
}

export function placeRouteLabels(
  edges: RouteLabelInput[],
  obstacles: Box[],
  fontSize = 12,
): Map<string, PlacedRouteLabel> {
  const placed = new Map<string, PlacedRouteLabel>();
  const boxes = new Map<string, Box>();
  const fixed = indexOf(obstacles);
  const peers = new BoxIndex();
  const pick = (edge: RouteLabelInput): PlacedRouteLabel | null => {
    let best: { x: number; y: number; cost: number } | null = null;
    for (const [index, candidate] of CANDIDATES.entries()) {
      const point = curvePoint(edge, candidate.t);
      const x = point.x + (candidate.dx ?? 0);
      const y = point.y + candidate.dy;
      const box = textBox(x, y, edge.text, fontSize, "middle");
      const cost = index * 0.5 + fixed.cost(box) + peers.cost(box, edge.id);
      if (!best || cost < best.cost) best = { x, y, cost };
      if (cost === index * 0.5) break; // free slot; no later candidate can win
    }
    return best;
  };
  const place = (edge: RouteLabelInput): void => {
    const at = pick(edge);
    if (!at) return;
    placed.set(edge.id, { x: at.x, y: at.y });
    const box = textBox(at.x, at.y, edge.text, fontSize, "middle");
    boxes.set(edge.id, box);
    peers.set(edge.id, box);
  };
  for (const edge of edges) place(edge);
  for (let pass = 0; pass < REFINEMENT_PASSES; pass++) for (const edge of edges) place(edge);
  return placed;
}
