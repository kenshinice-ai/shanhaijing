import { afterEach, describe, expect, it, vi } from "vitest";
import { prefersReducedData, prefersReducedMotion } from "./prefs";

const withMatchMedia = (impl: ((query: string) => { matches: boolean }) | null) => {
  if (impl === null) vi.stubGlobal("matchMedia", undefined);
  else vi.stubGlobal("matchMedia", vi.fn(impl));
};

afterEach(() => vi.unstubAllGlobals());

describe("reader preferences", () => {
  it("reads the reduced-data query", () => {
    withMatchMedia((query) => ({ matches: query.includes("reduced-data") }));
    expect(prefersReducedData()).toBe(true);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("treats a browser that has never heard of the query as not opting in", () => {
    withMatchMedia(() => { throw new SyntaxError("unknown media feature"); });
    expect(prefersReducedData()).toBe(false);
  });

  it("survives an environment with no matchMedia at all", () => {
    withMatchMedia(null);
    expect(prefersReducedData()).toBe(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});
