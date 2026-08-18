import { describe, expect, it } from "vitest";
import { circleBox, estimateTextWidth, overlapArea, placeNodeLabels, placeRouteLabels, textBox, type RouteLabelInput } from "./map-labels";

const distance = (id: string, x1: number, y1: number, x2: number, y2: number, text = "東300里"): RouteLabelInput =>
  ({ id, x1, y1, x2, y2, text });

describe("text measurement", () => {
  it("gives Han characters a full em and Latin less", () => {
    expect(estimateTextWidth("東", 12)).toBe(12);
    expect(estimateTextWidth("M", 12)).toBeCloseTo(7.44);
    expect(estimateTextWidth("東300里", 12)).toBeCloseTo(12 + 3 * 7.44 + 12);
  });

  it("counts a surrogate pair as one full-width character, not two", () =>
    expect(estimateTextWidth("𪁺𩿧", 14)).toBe(28));

  it("pads every box by the halo stroke the label is painted with", () => {
    const box = textBox(100, 50, "東", 12);
    expect(box.width).toBeCloseTo(17);
    expect(textBox(100, 50, "東", 12, "middle").x).toBeCloseTo(91.5);
  });
});

describe("overlapArea", () => {
  it("is zero for boxes that only touch", () =>
    expect(overlapArea({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })).toBe(0));

  it("measures the shared rectangle", () =>
    expect(overlapArea({ x: 0, y: 0, width: 10, height: 10 }, { x: 6, y: 5, width: 10, height: 10 })).toBe(20));
});

describe("placeRouteLabels", () => {
  it("keeps a label on the curve apex when nothing is in the way", () => {
    const placed = placeRouteLabels([distance("e1", 100, 300, 300, 300)], []);
    const at = placed.get("e1")!;
    expect(at.x).toBe(200);
    // apex of the quadratic sits half the lift above the endpoints, then the
    // first candidate nudges the baseline clear of the stroke.
    expect(at.y).toBe(300 - 12 - 9);
  });

  it("moves a label off a node name it would otherwise sit on", () => {
    const edge = distance("e1", 100, 300, 300, 300);
    const clash = textBox(160, 279, "Mount Niuyang", 14);
    const free = placeRouteLabels([edge], [])!.get("e1")!;
    const moved = placeRouteLabels([edge], [clash])!.get("e1")!;
    expect(overlapArea(textBox(free.x, free.y, edge.text, 12, "middle"), clash)).toBeGreaterThan(0);
    expect(overlapArea(textBox(moved.x, moved.y, edge.text, 12, "middle"), clash)).toBe(0);
  });

  it("never drops a distance, even where every candidate is crowded", () => {
    const walls = Array.from({ length: 40 }, (_, row) => ({ x: 0, y: 200 + row * 4, width: 1000, height: 4 }));
    const placed = placeRouteLabels([distance("e1", 100, 300, 300, 300)], walls);
    expect(placed.size).toBe(1);
  });

  it("separates labels that share an edge midpoint", () => {
    const placed = placeRouteLabels([distance("e1", 100, 300, 300, 300), distance("e2", 100, 300, 300, 300, "東400里")], []);
    const a = textBox(placed.get("e1")!.x, placed.get("e1")!.y, "東300里", 12, "middle");
    const b = textBox(placed.get("e2")!.x, placed.get("e2")!.y, "東400里", 12, "middle");
    expect(overlapArea(a, b)).toBe(0);
  });

  it("is deterministic: the same input always lands in the same place", () => {
    const edges = [distance("e1", 100, 300, 300, 300), distance("e2", 300, 300, 520, 340), distance("e3", 520, 340, 700, 300)];
    const obstacles = [textBox(300, 344, "青丘之山", 14), circleBox(300, 300, 19), textBox(520, 300, "箕尾之山", 14)];
    const first = placeRouteLabels(edges, obstacles);
    const second = placeRouteLabels(edges, obstacles);
    expect([...second]).toEqual([...first]);
  });

  it("clears a whole route band: nodes, counts and distances stop colliding", () => {
    // Six nodes on one band, labels staggered above and below as the overlay
    // does, each carrying a creature count in the ring.
    const nodes = Array.from({ length: 6 }, (_, i) => ({ x: 120 + i * 140, y: 300, labelY: i % 2 === 0 ? 44 : -40, name: `Mount Number${i}` }));
    const obstacles = nodes.flatMap((node) => [
      textBox(node.x, node.y + node.labelY, node.name, 14),
      circleBox(node.x, node.y, 19),
      textBox(node.x, node.y + 5, "3", 12, "middle"),
    ]);
    const edges = nodes.slice(0, -1).map((node, i) => distance(`e${i}`, node.x, node.y, nodes[i + 1]!.x, nodes[i + 1]!.y));
    const placed = placeRouteLabels(edges, obstacles);
    const boxes = edges.map((edge) => textBox(placed.get(edge.id)!.x, placed.get(edge.id)!.y, edge.text, 12, "middle"));
    for (const box of boxes) for (const other of obstacles) expect(overlapArea(box, other)).toBe(0);
    for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) expect(overlapArea(boxes[a]!, boxes[b]!)).toBe(0);
  });
});

describe("obstacle weight", () => {
  it("prefers clipping a node ring over covering a name", () => {
    // Both slots are blocked; the ring is a circle whose bounding-box corners
    // are empty, so it should lose to the name.
    const edge = distance("e1", 100, 300, 300, 300);
    const free = placeRouteLabels([edge], []).get("e1")!;
    const name = textBox(free.x - 20, free.y, "Mount Somewhere", 14, "middle");
    const ring = circleBox(free.x, free.y + 19 + 8, 19);
    const at = placeRouteLabels([edge], [name, ring]).get("e1")!;
    const box = textBox(at.x, at.y, edge.text, 12, "middle");
    expect(overlapArea(box, name)).toBe(0);
  });
});

describe("placeNodeLabels", () => {
  const node = (id: string, x: number, text: string, preferBelow: boolean) =>
    ({ id, x, y: 300, text, fontSize: 14, preferBelow });

  it("honours the band's alternating side when nothing is in the way", () => {
    const placed = placeNodeLabels([node("a", 100, "青丘之山", true), node("b", 400, "箕尾之山", false)], []);
    expect(placed.get("a")).toEqual({ dx: 0, dy: 44 });
    expect(placed.get("b")).toEqual({ dx: 0, dy: -40 });
  });

  it("moves a name off the creature count of a node in the band below", () => {
    // A long name reaching right from x=100 crosses the ring of a node sitting
    // one band lower — exactly the case that put "Mount Tianyu" on a "2".
    const long = node("a", 100, "Mount Yaoguang", true);
    const below = { x: 190, y: 344 };
    const obstacles = [circleBox(below.x, below.y, 19), textBox(below.x, below.y + 5, "2", 12, "middle")];
    const asked = textBox(long.x, long.y + 44, long.text, 14);
    expect(obstacles.some((box) => overlapArea(asked, box) > 0)).toBe(true);
    const at = placeNodeLabels([long], obstacles).get("a")!;
    expect(at).not.toEqual({ dx: 0, dy: 44 });
    const moved = textBox(long.x + at.dx, long.y + at.dy, long.text, 14);
    for (const box of obstacles) expect(overlapArea(moved, box)).toBe(0);
  });

  it("gives every node a slot and never two names the same box", () => {
    const nodes = Array.from({ length: 8 }, (_, i) => node(`n${i}`, 100 + i * 60, `Mount Number${i}`, i % 2 === 0));
    const placed = placeNodeLabels(nodes, []);
    expect(placed.size).toBe(8);
    const boxes = nodes.map((n) => textBox(n.x + placed.get(n.id)!.dx, n.y + placed.get(n.id)!.dy, n.text, n.fontSize));
    for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) expect(overlapArea(boxes[a]!, boxes[b]!)).toBe(0);
  });
});
