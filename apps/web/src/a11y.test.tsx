// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import axe from "axe-core";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "./App";

/**
 * Accessibility audit against the real application, not a fixture of it.
 *
 * The atlas puts thirty-nine map hotspots, a drawer and a search box in front
 * of the reader; `verify:shanhaijing-accessibility` was planned and never
 * written, so nothing has ever checked that any of it is reachable without a
 * mouse. This renders App with the baked payload behind it and runs axe.
 *
 * jsdom has no layout engine, so colour contrast cannot be computed here —
 * that rule is checked separately against the design tokens in
 * `contrast.test.ts`. Everything axe can decide from the tree is decided here.
 */
const DATA = join(__dirname, "../public/data");
const payload = (name: string): unknown => JSON.parse(readFileSync(join(DATA, name), "utf8"));

beforeAll(() => {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const locale = url.includes("en") && !url.includes("zh-CN") ? "en" : "zh-CN";
    const body = url.includes("/works") && !url.includes("/atlas")
      ? payload(`works.${locale}.json`)
      : payload(`atlas.shanhaijing.${locale}.json`);
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  }));
  // jsdom implements neither; the app only ever reads them.
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  })));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

async function renderAtlas() {
  const view = render(<App />);
  await waitFor(() => expect(screen.getByRole("tab", { name: /艺术总览|Artistic overview/u })).toBeTruthy(), { timeout: 8000 });
  return view;
}

async function audit(): Promise<axe.Result[]> {
  const results = await axe.run(document.body, {
    // No layout in jsdom: contrast and any rule that needs boxes would report
    // a false verdict rather than a finding.
    rules: { "color-contrast": { enabled: false }, "scrollable-region-focusable": { enabled: false } },
    resultTypes: ["violations"],
  });
  return results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
}

describe("accessibility", () => {
  it("has no serious or critical axe violations on the default view", async () => {
    await renderAtlas();
    const violations = await audit();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`)).toEqual([]);
  }, 30000);

  it("gives every map hotspot a name and keyboard focus", async () => {
    await renderAtlas();
    const hotspots = document.querySelectorAll("g.shj-map-node");
    expect(hotspots.length).toBeGreaterThan(30);
    for (const node of hotspots) {
      expect(node.getAttribute("tabindex")).toBe("0");
      expect(node.getAttribute("aria-label")?.length ?? 0).toBeGreaterThan(2);
    }
  }, 30000);

  it("labels the tab list and marks exactly one tab selected", async () => {
    await renderAtlas();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(4);
    expect(tabs.filter((tab) => tab.getAttribute("aria-selected") === "true").length).toBe(1);
  }, 30000);

  it("keeps the no-endorsement notice in the accessibility tree", async () => {
    await renderAtlas();
    const note = screen.getByRole("note");
    expect(within(note).getByText(/未经任何学术机构或外部专家签署/u)).toBeTruthy();
  }, 30000);

  it("never uses a positive tabindex, so tab order follows the document", async () => {
    await renderAtlas();
    const positive = [...document.querySelectorAll("[tabindex]")]
      .filter((element) => Number(element.getAttribute("tabindex")) > 0);
    expect(positive).toEqual([]);
  }, 30000);
});
