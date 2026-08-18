import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Colour contrast, which jsdom cannot compute.
 *
 * The tokens carry a comment claiming "all pairs ≥ 4.5:1 on their surfaces".
 * A claim in a comment is not a check, and the palette has been edited since
 * it was written — so the pairs the interface actually uses are read straight
 * out of base.css and measured here.
 */
const CSS = readFileSync(join(__dirname, "base.css"), "utf8");

function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`, "u").exec(CSS);
  if (!match?.[1]) throw new Error(`token --${name} is not a plain hex colour in base.css`);
  return match[1];
}

function luminance(hex: string): number {
  const channel = (value: number): number => {
    const sRGB = value / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  };
  const int = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((int >> 16) & 255) + 0.7152 * channel((int >> 8) & 255) + 0.0722 * channel(int & 255);
}

export function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Every pair here is one the interface actually renders. */
const PAIRS: { fg: string; bg: string; min: number; where: string }[] = [
  { fg: "text", bg: "bg", min: 4.5, where: "正文" },
  { fg: "text", bg: "panel", min: 4.5, where: "卡片正文" },
  { fg: "text-dim", bg: "panel", min: 4.5, where: "抽屉与声明正文" },
  { fg: "text-dim", bg: "bg", min: 4.5, where: "无背书声明" },
  { fg: "muted", bg: "panel", min: 4.5, where: "卡片脚注" },
  { fg: "muted", bg: "bg", min: 4.5, where: "页脚说明" },
  { fg: "accent", bg: "bg", min: 4.5, where: "统计数字与强调" },
  { fg: "accent", bg: "panel", min: 4.5, where: "分类轴标签" },
  { fg: "violet-soft", bg: "panel", min: 4.5, where: "选中态" },
  { fg: "positive", bg: "panel", min: 4.5, where: "通过状态" },
  { fg: "faint", bg: "bg", min: 3, where: "装饰性弱文字（大字号）" },
];

describe("colour contrast", () => {
  for (const pair of PAIRS) {
    it(`${pair.where}: --${pair.fg} on --${pair.bg} ≥ ${pair.min}:1`, () => {
      const ratio = contrast(token(pair.fg), token(pair.bg));
      expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(pair.min);
    });
  }

  it("map labels stay legible against their own halo", () => {
    // Node names and route distances are painted with a near-black halo
    // stroke, so their effective background is the halo, not the terrain.
    expect(contrast("#FFF3CD", "#071615")).toBeGreaterThan(4.5);
    expect(contrast("#F9E7B5", "#071615")).toBeGreaterThan(4.5);
  });
});
