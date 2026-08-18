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
