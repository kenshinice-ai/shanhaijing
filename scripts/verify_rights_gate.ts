import pg from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { loadShanhaijingAtlas } from "../apps/api/src/shanhaijing.js";

/**
 * Rights-withdrawal drill.
 *
 * SJ-R007 rates an unwithdrawn asset critical: if pulling an image's rights
 * does not immediately stop the API from handing out its URL, then "we can
 * withdraw it" is a claim with nothing behind it. This drill proves the gate
 * by exercising it — each non-published state is applied for real inside a
 * transaction, the loader is called through that same transaction, and the
 * whole thing is rolled back. Nothing is left changed, and the check cannot
 * pass by reading the code rather than the behaviour.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const REPORT_DIR = join(ROOT, "docs/generated");
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://llmacbookpro@localhost:5432/shanhaijing_atlas";
const WORK_SLUG = "shanhaijing";

/** Every status the schema allows that is not a public one. */
const WITHHELD = ["planned", "blocked_missing_api_key", "generated", "reviewed", "withdrawn"] as const;

/**
 * The loader fires its queries in parallel. A pool hands each one its own
 * connection; a single client cannot, and pg deprecates the overlap. Queueing
 * them keeps every query inside the drill's transaction, which is the whole
 * point — a second connection would not see the uncommitted withdrawal.
 */
function serialized(client: pg.PoolClient): { query: pg.PoolClient["query"] } {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    query: ((...args: Parameters<pg.PoolClient["query"]>) => {
      const result = tail.then(() => (client.query as (...a: unknown[]) => Promise<unknown>)(...args));
      tail = result.catch(() => undefined);
      return result;
    }) as pg.PoolClient["query"],
  };
}

type Finding = { checkId: string; severity: "error" | "info"; message: string };
const findings: Finding[] = [];
let checks = 0;

async function main(): Promise<void> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    const work = await client.query<{ id: string; default_locale: string }>(
      "SELECT id, default_locale FROM works WHERE slug=$1", [WORK_SLUG]);
    const workId = work.rows[0]?.id;
    if (!workId) throw new Error(`work ${WORK_SLUG} not found in ${DATABASE_URL}`);

    // Baseline: published means served. Without this the drill could pass by
    // never returning anything at all.
    checks += 1;
    const published = await loadShanhaijingAtlas(serialized(client), workId, "zh-CN", "en");
    if (!published.artisticOverview?.assetUrl) {
      findings.push({ checkId: "RIGHTS-BASELINE", severity: "error", message: "published 母图未被 API 返回,闸门测试失去意义" });
    } else {
      findings.push({ checkId: "RIGHTS-BASELINE", severity: "info", message: `published 母图正常返回:${published.artisticOverview.assetUrl}` });
    }

    for (const status of WITHHELD) {
      checks += 1;
      await client.query("BEGIN");
      try {
        await client.query("UPDATE shj_artistic_overviews SET status=$2 WHERE work_id=$1", [workId, status]);
        const atlas = await loadShanhaijingAtlas(serialized(client), workId, "zh-CN", "en");
        const overview = atlas.artisticOverview;
        if (overview) {
          findings.push({
            checkId: "RIGHTS-GATE",
            severity: "error",
            message: `status=${status} 时母图仍被返回（assetUrl=${overview.assetUrl ?? "null"}）——权利闸门 fail open`,
          });
        } else {
          findings.push({ checkId: "RIGHTS-GATE", severity: "info", message: `status=${status}:未返回,闸门关闭` });
        }
      } finally {
        await client.query("ROLLBACK");
      }
    }

    // The drill must leave the database exactly as it found it.
    checks += 1;
    const after = await client.query<{ status: string }>(
      "SELECT status FROM shj_artistic_overviews WHERE work_id=$1", [workId]);
    const statuses = after.rows.map((row) => row.status);
    if (statuses.some((status) => status !== "published")) {
      findings.push({ checkId: "RIGHTS-RESTORE", severity: "error", message: `演练后状态未复原:${statuses.join("、")}` });
    } else {
      findings.push({ checkId: "RIGHTS-RESTORE", severity: "info", message: "演练后状态已复原为 published" });
    }
  } finally {
    client.release();
    await pool.end();
  }

  const errors = findings.filter((finding) => finding.severity === "error");
  const summary = {
    generatedAt: new Date().toISOString(),
    generator: "scripts/verify_rights_gate.ts",
    database: DATABASE_URL.replace(/\/\/[^@]*@/u, "//"),
    result: errors.length === 0 ? "pass" : "fail",
    checks,
    errors: errors.length,
    withheldStatuses: WITHHELD,
    findings,
  };
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(join(REPORT_DIR, "rights-gate.json"), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(join(REPORT_DIR, "rights-gate.md"), [
    "# 《山海经 Atlas》权利闸门演练", "",
    "- 生成命令：`npm run verify:rights`",
    `- 生成时间：\`${summary.generatedAt}\``,
    `- 数据库：\`${summary.database}\``,
    `- 检查结果：\`${summary.result}\`（${summary.checks} 检查，${summary.errors} 错误）`, "",
    "每个非公开状态都在事务中真实写入、经同一事务调用 API loader、随后回滚；",
    "因此这份报告断言的是行为，不是代码读后感。", "",
    "## Findings", "",
    ...findings.map((finding) => `- [${finding.severity}] ${finding.checkId}: ${finding.message}`),
    "",
  ].join("\n"));
  console.log(`Shanhaijing rights gate ${summary.result}: ${checks} checks, ${errors.length} errors`);
  console.log("Reports: docs/generated/rights-gate.{json,md}");
  if (errors.length > 0) {
    for (const error of errors) console.error(`  [${error.checkId}] ${error.message}`);
    process.exitCode = 1;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
