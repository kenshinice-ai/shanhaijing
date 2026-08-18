import { describe, expect, it } from "vitest";
import { NO_ENDORSEMENT } from "./i18n";

describe("no-endorsement notice", () => {
  it("exists in both locales", () => {
    expect(NO_ENDORSEMENT["zh-CN"].length).toBeGreaterThan(40);
    expect(NO_ENDORSEMENT.en.length).toBeGreaterThan(40);
  });

  it("states the absence rather than hedging around it", () => {
    expect(NO_ENDORSEMENT["zh-CN"]).toContain("未经任何学术机构或外部专家签署");
    expect(NO_ENDORSEMENT.en.toLowerCase()).toContain("no institutional or expert");
  });

  it("never claims endorsement, review or authority", () => {
    const forbidden = [/经.{0,4}认证/u, /权威(结论|认定)/u, /peer[- ]reviewed/i, /endorsed by/i, /certified/i];
    for (const locale of ["zh-CN", "en"] as const) {
      for (const pattern of forbidden) expect(NO_ENDORSEMENT[locale]).not.toMatch(pattern);
    }
  });
});
