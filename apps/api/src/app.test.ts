import { readFileSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";

/** A database stand-in: every query returns the rows the test hands it. */
function setup(rows: Record<string, unknown>[] = []) {
  const query = vi.fn(async () => ({ rows, command: "SELECT", rowCount: rows.length, oid: 0, fields: [] }));
  return { app: createApp({ query } as never), query };
}

describe("HTTP errors and the locale contract", () => {
  it("publishes the supported locales and the fallback policy", async () => {
    const { app } = setup();
    const response = await request(app).get("/api/locales");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ locales: ["zh-CN", "en"], defaultLocale: "zh-CN" });
    expect(response.body.fallbackPolicy).toContain("never silently substitute");
  });

  it("rejects an unsupported locale before it reaches the database", async () => {
    const { app, query } = setup();
    const response = await request(app).get("/api/works?locale=fr");
    expect(response.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({ error: { code: "INVALID_REQUEST" } });
  });

  it("returns a structured error for an unknown work", async () => {
    const { app } = setup([]);
    const response = await request(app).get("/api/works/unknown/atlas?locale=en");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: "WORK_NOT_FOUND", message: "Unknown work: unknown" } });
  });

  it("rejects an unknown entity kind rather than querying for it", async () => {
    const { app, query } = setup();
    const response = await request(app).get("/api/works/shanhaijing/entities/mountain/qingqiu");
    expect(response.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({ error: { code: "INVALID_REQUEST" } });
  });

  it("requires a search term instead of scanning the whole corpus", async () => {
    const { app, query } = setup();
    const response = await request(app).get("/api/search");
    expect(response.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("answers an unrouted path with the same error envelope", async () => {
    const { app } = setup();
    const response = await request(app).get("/api/nothing-here");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });
});

describe("coverage counts only what a reader can reach", () => {
  it("keeps a frozen-but-unpublished edition out of the atlas denominator", () => {
    // 回归防线：冻结《西山经》后首页一度显示「43/125」，而段落列表里只有 43 条。
    // 分母必须只数已发布底本——这条断言盯住那句 SQL 里的 review_status 过滤。
    const source = readFileSync(join(__dirname, "shanhaijing.ts"), "utf8");
    const coverageQuery = source.slice(source.indexOf('"passagesTotal"'));
    const fromClause = coverageQuery.slice(0, coverageQuery.indexOf("GROUP BY") + 1 || 2000);
    expect(fromClause).toContain("shj_text_editions e ON e.id=s.edition_id AND e.review_status='published'");
  });

  it("counts only creature concepts that have a published occurrence", () => {
    // 同一类缺陷的第二处：概念表没有 review_status,不加条件就会把草稿概念
    // 算进对外载荷。《西山经》入库后该数会从 23 跳到 85 而图集毫无变化。
    const source = readFileSync(join(__dirname, "app.ts"), "utf8");
    const query = source.slice(source.indexOf('AS "uniqueCreatureConceptCount"') - 600, source.indexOf('AS "uniqueCreatureConceptCount"'));
    expect(query).toContain("shj_creature_occurrences sco");
    expect(query).toContain("sco.review_status='published'");
  });

  it("keeps the works payload on the same denominator as the atlas", () => {
    const source = readFileSync(join(__dirname, "app.ts"), "utf8");
    const query = source.slice(source.indexOf('AS "corpusCoverage"') - 900, source.indexOf('AS "corpusCoverage"'));
    expect(query).toContain("shj_text_editions se ON se.id=ss.edition_id AND se.review_status='published'");
  });
});
