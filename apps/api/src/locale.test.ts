import { describe, expect, it } from "vitest";
import { resolveLocale, supportedLocales } from "./locale.js";

describe("resolveLocale", () => {
  it("defaults explicitly to zh-CN rather than to whatever arrives first", () =>
    expect(resolveLocale(undefined)).toEqual({ requestedLocale: "zh-CN", fallbackLocale: "en" }));

  it("declares the one permitted fallback for each locale", () => {
    expect(resolveLocale("en")).toEqual({ requestedLocale: "en", fallbackLocale: "zh-CN" });
    expect(resolveLocale("zh-CN")).toEqual({ requestedLocale: "zh-CN", fallbackLocale: "en" });
  });

  it("rejects an unsupported locale instead of substituting one", () => expect(() => resolveLocale("fr")).toThrow());

  it("publishes exactly the two locales the atlas ships", () => expect(supportedLocales).toEqual(["zh-CN", "en"]));
});
