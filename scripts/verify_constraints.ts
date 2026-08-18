import pg from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { loadShanhaijingAtlas } from "../apps/api/src/shanhaijing.js";

/**
 * Delete, constraint and privilege drill.
 *
 * Bootstrap proves the insert path: every migration and seed loads. It proves
 * nothing about what the schema *refuses*, and a constraint nobody has ever
 * tripped is a constraint nobody knows works. Each case below performs the
 * forbidden thing for real inside a transaction and asserts the database
 * rejected it, then rolls back.
 *
 * The privilege case is the same idea one level up: the read path claims to
 * be read-only, so it is run through a role granted SELECT and nothing else.
 * If any query needed to write, this fails.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const REPORT_DIR = join(ROOT, "docs/generated");
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://llmacbookpro@localhost:5432/shanhaijing_atlas";
const WORK_SLUG = "shanhaijing";

type Finding = { checkId: string; severity: "error" | "info"; message: string };
const findings: Finding[] = [];
let checks = 0;

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

/** Run `sql` and require the database to refuse it. */
async function mustReject(client: pg.PoolClient, checkId: string, what: string, sql: string, params: unknown[] = []): Promise<void> {
  checks += 1;
  await client.query("BEGIN");
  try {
    await client.query(sql, params);
    findings.push({ checkId, severity: "error", message: `${what}：数据库接受了本应拒绝的写入` });
  } catch (error) {
    const code = (error as { code?: string }).code ?? "unknown";
    findings.push({ checkId, severity: "info", message: `${what}：已拒绝（SQLSTATE ${code}）` });
  } finally {
    await client.query("ROLLBACK");
  }
}

async function main(): Promise<void> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    const work = await client.query<{ id: string }>("SELECT id FROM works WHERE slug=$1", [WORK_SLUG]);
    const workId = work.rows[0]?.id;
    if (!workId) throw new Error(`work ${WORK_SLUG} not found`);

    // --- 删除行为:级联必须真的级联,否则孤儿记录会悄悄留在统计里 ---
    checks += 1;
    await client.query("BEGIN");
    try {
      const before = await client.query<{ occurrences: string; taxonomy: string }>(
        `SELECT (SELECT count(*) FROM shj_creature_occurrences)::text AS occurrences,
                (SELECT count(*) FROM shj_taxonomy_assignments)::text AS taxonomy`);
      const victim = await client.query<{ id: string; slug: string }>(
        `SELECT c.id, c.slug FROM shj_creatures c
          WHERE EXISTS (SELECT 1 FROM shj_creature_occurrences o WHERE o.creature_id=c.id)
            AND EXISTS (SELECT 1 FROM shj_taxonomy_assignments a WHERE a.creature_id=c.id)
          ORDER BY c.slug LIMIT 1`);
      const creature = victim.rows[0];
      if (!creature) throw new Error("no creature with both occurrences and taxonomy to test cascade on");
      await client.query("DELETE FROM shj_creatures WHERE id=$1", [creature.id]);
      const after = await client.query<{ occurrences: string; taxonomy: string; orphans: string }>(
        `SELECT (SELECT count(*) FROM shj_creature_occurrences)::text AS occurrences,
                (SELECT count(*) FROM shj_taxonomy_assignments)::text AS taxonomy,
                (SELECT count(*) FROM shj_creature_occurrences o
                  WHERE NOT EXISTS (SELECT 1 FROM shj_creatures c WHERE c.id=o.creature_id))::text AS orphans`);
      const removedOccurrences = Number(before.rows[0]!.occurrences) - Number(after.rows[0]!.occurrences);
      const removedTaxonomy = Number(before.rows[0]!.taxonomy) - Number(after.rows[0]!.taxonomy);
      if (removedOccurrences < 1 || removedTaxonomy < 1) {
        findings.push({ checkId: "DELETE-CASCADE", severity: "error", message: `删除 ${creature.slug} 未级联清除依赖行（提及 -${removedOccurrences}，分类 -${removedTaxonomy}）` });
      } else if (Number(after.rows[0]!.orphans) !== 0) {
        findings.push({ checkId: "DELETE-CASCADE", severity: "error", message: `删除后留下 ${after.rows[0]!.orphans} 条孤儿提及` });
      } else {
        findings.push({ checkId: "DELETE-CASCADE", severity: "info", message: `删除 ${creature.slug} 级联清除 ${removedOccurrences} 条提及、${removedTaxonomy} 条分类指派，无孤儿` });
      }
    } finally {
      await client.query("ROLLBACK");
    }

    // --- 拒绝面:每一条都真写一次,由数据库说不 ---
    await mustReject(client, "CONSTRAINT-FK", "指派引用词表外的词条",
      `INSERT INTO shj_taxonomy_assignments (id, creature_id, axis, term, source_attestation, interpretation_class, confidence, review_status)
       SELECT gen_random_uuid(), c.id, 'behavior', 'not_in_vocabulary', 'text_direct', 'transcription', 'high', 'published' FROM shj_creatures c LIMIT 1`);

    await mustReject(client, "CONSTRAINT-CHECK", "非法 review_status",
      `UPDATE shj_creatures SET concept_status='invented_status' WHERE id=(SELECT id FROM shj_creatures LIMIT 1)`);

    await mustReject(client, "CONSTRAINT-CHECK", "母图 status 为 published 却无 asset_url",
      `UPDATE shj_artistic_overviews SET asset_url=NULL WHERE work_id=$1`, [workId]);

    await mustReject(client, "CONSTRAINT-CHECK", "非法 slug 形态",
      `UPDATE shj_taxonomy_terms SET term='Not A Slug' WHERE term='man_eating'`);

    await mustReject(client, "CONSTRAINT-CHECK", "空的双语标签",
      `UPDATE shj_taxonomy_terms SET label_zh='' WHERE term='man_eating'`);

    await mustReject(client, "CONSTRAINT-UNIQUE", "同一轴下重复词条",
      `INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
       VALUES (gen_random_uuid(), $1, 'behavior', 'man_eating', '重复', 'Duplicate', '重复定义', 'Duplicate definition', 'text_direct', 'published')`, [workId]);

    await mustReject(client, "CONSTRAINT-ENUM", "枚举外的 locale",
      `UPDATE work_translations SET locale='fr' WHERE work_id=$1`, [workId]);

    await mustReject(client, "CONSTRAINT-FK", "指向不存在作品的异兽",
      `INSERT INTO shj_creatures (id, work_id, slug, concept_status, importance, icon_key)
       VALUES (gen_random_uuid(), gen_random_uuid(), 'ghost-creature', 'resolved', 1, 'x')`);

    // --- 权限:读路径声称只读,那就让它在只有 SELECT 的角色下跑一遍 ---
    checks += 1;
    await client.query("BEGIN");
    try {
      await client.query("CREATE ROLE atlas_readonly_drill NOLOGIN");
      await client.query("GRANT USAGE ON SCHEMA public TO atlas_readonly_drill");
      await client.query("GRANT SELECT ON ALL TABLES IN SCHEMA public TO atlas_readonly_drill");
      await client.query("SET LOCAL ROLE atlas_readonly_drill");
      const atlas = await loadShanhaijingAtlas(serialized(client), workId, "zh-CN", "en");
      const ok = atlas.passages.length > 0 && atlas.creatures.length > 0 && atlas.places.length > 0;
      if (!ok) {
        findings.push({ checkId: "PRIVILEGE-READONLY", severity: "error", message: "只读角色下 API loader 返回空集合" });
      } else {
        findings.push({
          checkId: "PRIVILEGE-READONLY",
          severity: "info",
          message: `只读角色下 API loader 正常返回（${atlas.passages.length} 段落、${atlas.creatures.length} 概念）——读路径不需要写权限`,
        });
      }
      // 同一角色下写入必须失败。
      let refused = false;
      try {
        await client.query("UPDATE shj_creatures SET importance=importance WHERE id=(SELECT id FROM shj_creatures LIMIT 1)");
      } catch { refused = true; }
      checks += 1;
      if (refused) findings.push({ checkId: "PRIVILEGE-READONLY", severity: "info", message: "只读角色的写入已被拒绝" });
      else findings.push({ checkId: "PRIVILEGE-READONLY", severity: "error", message: "只读角色竟然写入成功" });
    } finally {
      await client.query("ROLLBACK");
    }

    checks += 1;
    const leftover = await client.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM pg_roles WHERE rolname='atlas_readonly_drill'");
    if (leftover.rows[0]?.count !== "0") {
      findings.push({ checkId: "DRILL-RESTORE", severity: "error", message: "演练角色未随事务回滚清除" });
    } else {
      findings.push({ checkId: "DRILL-RESTORE", severity: "info", message: "演练未留下任何角色或数据变更" });
    }
  } finally {
    client.release();
    await pool.end();
  }

  const errors = findings.filter((finding) => finding.severity === "error");
  const summary = {
    generatedAt: new Date().toISOString(),
    generator: "scripts/verify_constraints.ts",
    database: DATABASE_URL.replace(/\/\/[^@]*@/u, "//"),
    result: errors.length === 0 ? "pass" : "fail",
    checks,
    errors: errors.length,
    findings,
  };
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(join(REPORT_DIR, "constraints-drill.json"), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(join(REPORT_DIR, "constraints-drill.md"), [
    "# 《山海经 Atlas》删除、约束与权限演练", "",
    "- 生成命令：`npm run verify:constraints`",
    `- 生成时间：\`${summary.generatedAt}\``,
    `- 数据库：\`${summary.database}\``,
    `- 检查结果：\`${summary.result}\`（${summary.checks} 检查，${summary.errors} 错误）`, "",
    "bootstrap 只证明写得进去，证明不了写不进去的东西真的写不进去。",
    "以下每一条都在事务中真实执行一次，由数据库拒绝，然后回滚。", "",
    "## Findings", "",
    ...findings.map((finding) => `- [${finding.severity}] ${finding.checkId}: ${finding.message}`),
    "",
  ].join("\n"));
  console.log(`Shanhaijing constraints drill ${summary.result}: ${checks} checks, ${errors.length} errors`);
  console.log("Reports: docs/generated/constraints-drill.{json,md}");
  if (errors.length > 0) {
    for (const error of errors) console.error(`  [${error.checkId}] ${error.message}`);
    process.exitCode = 1;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
