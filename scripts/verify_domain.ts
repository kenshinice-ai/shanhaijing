import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import pg from "pg";

/**
 * Shanhaijing domain verifier.
 *
 * Fail-closed checks over the shj_* tables: corpus checksums, the three
 * independent coverage statistics, occurrence/topology/taxonomy integrity,
 * bilingual completeness, and the rights gate on artistic overview assets.
 * Results are written as machine reports; prose documents must cite these
 * reports instead of hand-copying counts.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://llmacbookpro@localhost:5432/shanhaijing_atlas";
const EVIDENCE_LEVEL = process.env.SHJ_EVIDENCE_LEVEL ?? "local_candidate";
const REPORT_DIR = join(ROOT, "docs/generated");
const PUBLIC_DIR = join(ROOT, "apps/web/public");
const WORK_SLUG = "shanhaijing";

const sha256 = (data: string | Buffer): string => createHash("sha256").update(data).digest("hex");

type Finding = { checkId: string; severity: "error" | "warning" | "info"; message: string };
const findings: Finding[] = [];
let checks = 0;
function fail(checkId: string, message: string): void {
  findings.push({ checkId, severity: "error", message });
}
function info(checkId: string, message: string): void {
  findings.push({ checkId, severity: "info", message });
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
async function rows<T extends object>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

async function main(): Promise<void> {
  const dbIdentity = (await rows<{ db: string; version: string }>(
    "SELECT current_database() AS db, version() AS version",
  ))[0];

  const work = (await rows<{ id: string }>("SELECT id FROM works WHERE slug=$1", [WORK_SLUG]))[0];
  checks += 1;
  if (!work) throw new Error(`work '${WORK_SLUG}' is missing`);
  const workId = work.id;

  // --- Corpus: edition and passage checksums --------------------------------
  const editions = await rows<{ id: string; slug: string; rights_status: string; checksum_sha256: string | null; is_baseline: boolean; review_status: string }>(
    "SELECT id, slug, rights_status, checksum_sha256, is_baseline, review_status FROM shj_text_editions WHERE work_id=$1",
    [workId],
  );
  checks += 1;
  if (editions.filter((edition) => edition.is_baseline).length !== 1) {
    fail("edition-baseline", `expected exactly one baseline edition, found ${editions.filter((e) => e.is_baseline).length}`);
  }
  for (const edition of editions) {
    checks += 1;
    if (edition.rights_status !== "verified") {
      fail("edition-rights", `edition ${edition.slug} rights_status=${edition.rights_status}; only verified editions may carry published passages`);
    }
    const passages = await rows<{ slug: string; text_zh: string; normalized_text_zh: string; checksum_sha256: string; sequence: number; review_status: string }>(
      `SELECT p.slug, p.text_zh, p.normalized_text_zh, p.checksum_sha256, p.sequence, p.review_status
         FROM shj_text_passages p JOIN shj_text_sections s ON s.id=p.section_id
        WHERE s.edition_id=$1 ORDER BY s.sequence, p.sequence`,
      [edition.id],
    );
    for (const passage of passages) {
      checks += 1;
      if (sha256(passage.normalized_text_zh) !== passage.checksum_sha256) {
        fail("passage-checksum", `passage ${passage.slug}: checksum does not match sha256(normalized_text_zh)`);
      }
    }
    checks += 1;
    const editionDigest = sha256(passages.map((passage) => passage.normalized_text_zh).join("\n"));
    if (edition.checksum_sha256 && editionDigest !== edition.checksum_sha256) {
      fail("edition-checksum", `edition ${edition.slug}: checksum does not match sha256 of newline-joined passages in order`);
    }
  }

  // --- Audits: every passage carries an audit whose input checksum matches ---
  const auditGaps = await rows<{ slug: string }>(
    `SELECT p.slug FROM shj_text_passages p
      LEFT JOIN shj_passage_audits a ON a.passage_id=p.id
      WHERE a.passage_id IS NULL OR a.input_checksum_sha256 <> p.checksum_sha256`,
  );
  checks += 1;
  for (const gap of auditGaps) fail("passage-audit", `passage ${gap.slug}: missing audit or audit input checksum mismatch`);

  // --- Three independent statistics ----------------------------------------
  const stats = (await rows<{ concepts: string; occurrences: string; passages_total: string; passages_reviewed: string }>(
    `SELECT
       (SELECT count(*) FROM shj_creatures WHERE work_id=$1) AS concepts,
       (SELECT count(*) FROM shj_creature_occurrences o JOIN shj_creatures c ON c.id=o.creature_id WHERE c.work_id=$1) AS occurrences,
       (SELECT count(*) FROM shj_text_passages p JOIN shj_text_sections s ON s.id=p.section_id
          JOIN shj_text_editions e ON e.id=s.edition_id WHERE e.work_id=$1) AS passages_total,
       (SELECT count(*) FROM shj_passage_audits a JOIN shj_text_passages p ON p.id=a.passage_id
          JOIN shj_text_sections s ON s.id=p.section_id JOIN shj_text_editions e ON e.id=s.edition_id
         WHERE e.work_id=$1 AND a.audit_status='reviewed') AS passages_reviewed`,
    [workId],
  ))[0];
  checks += 1;
  if (Number(stats.passages_total) === 0) fail("corpus-empty", "no passages loaded");

  // --- Occurrence integrity: quote and surface form live in their passage ---
  const occurrences = await rows<{ id: string; surface_form: string; quote_zh: string; text_zh: string; creature_slug: string; place_ok: boolean }>(
    `SELECT o.id, o.surface_form, o.quote_zh, p.text_zh, c.slug AS creature_slug,
            (o.place_id IS NULL OR EXISTS (
              SELECT 1 FROM shj_place_mentions m WHERE m.passage_id=o.passage_id AND m.place_id=o.place_id)) AS place_ok
       FROM shj_creature_occurrences o
       JOIN shj_text_passages p ON p.id=o.passage_id
       JOIN shj_creatures c ON c.id=o.creature_id`,
  );
  for (const occurrence of occurrences) {
    checks += 1;
    const forms = occurrence.surface_form.split("／");
    if (!forms.some((form) => occurrence.text_zh.includes(form))) {
      fail("occurrence-surface", `occurrence of ${occurrence.creature_slug}: no surface form '${occurrence.surface_form}' in its passage text`);
    }
    checks += 1;
    if (occurrence.quote_zh && !occurrence.text_zh.includes(occurrence.quote_zh.replace(/。$/u, ""))) {
      fail("occurrence-quote", `occurrence of ${occurrence.creature_slug}: quote_zh is not a substring of its passage`);
    }
    checks += 1;
    if (!occurrence.place_ok) {
      fail("occurrence-place", `occurrence of ${occurrence.creature_slug}: linked place is not mentioned in the same passage`);
    }
  }

  // --- Concepts must have at least one occurrence; occurrences one concept --
  const conceptGaps = await rows<{ slug: string }>(
    `SELECT c.slug FROM shj_creatures c
      WHERE c.work_id=$1 AND NOT EXISTS (SELECT 1 FROM shj_creature_occurrences o WHERE o.creature_id=c.id)`,
    [workId],
  );
  checks += 1;
  for (const gap of conceptGaps) fail("concept-orphan", `creature concept ${gap.slug} has zero textual occurrences`);

  // --- Taxonomy assignments must reference a passage where the creature occurs
  const taxonomyGaps = await rows<{ id: string; term: string }>(
    `SELECT t.id, t.term FROM shj_taxonomy_assignments t
      WHERE t.passage_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM shj_creature_occurrences o
         WHERE o.creature_id=t.creature_id AND o.passage_id=t.passage_id)`,
  );
  checks += 1;
  for (const gap of taxonomyGaps) fail("taxonomy-evidence", `taxonomy assignment '${gap.term}' cites a passage without a matching occurrence`);

  // --- Topology: sequential edges form a connected chain per section --------
  const sections = await rows<{ id: string; slug: string }>(
    `SELECT s.id, s.slug FROM shj_text_sections s JOIN shj_text_editions e ON e.id=s.edition_id WHERE e.work_id=$1`,
    [workId],
  );
  for (const section of sections) {
    const edges = await rows<{ from_place_id: string; to_place_id: string; sequence: number; distance_value: string | null }>(
      "SELECT from_place_id, to_place_id, sequence, distance_value FROM shj_topology_edges WHERE section_id=$1 ORDER BY sequence",
      [section.id],
    );
    for (let index = 1; index < edges.length; index += 1) {
      checks += 1;
      if (edges[index].from_place_id !== edges[index - 1].to_place_id) {
        fail("topology-chain", `section ${section.slug}: edge ${edges[index].sequence} does not continue from edge ${edges[index - 1].sequence}`);
      }
    }
    for (const edge of edges) {
      checks += 1;
      if (edge.from_place_id === edge.to_place_id) fail("topology-loop", `section ${section.slug}: self-loop at sequence ${edge.sequence}`);
    }
  }

  // --- Bilingual completeness on published entities -------------------------
  const translationGaps = await rows<{ kind: string; slug: string; locales: string }>(
    `SELECT 'creature' AS kind, c.slug, string_agg(tr.locale::text, ',' ORDER BY tr.locale::text) AS locales
       FROM shj_creatures c LEFT JOIN shj_creature_translations tr ON tr.creature_id=c.id AND tr.status='published'
      WHERE c.work_id=$1 GROUP BY c.slug HAVING count(DISTINCT tr.locale) < 2
     UNION ALL
     SELECT 'place', p.slug, string_agg(tr.locale::text, ',' ORDER BY tr.locale::text)
       FROM shj_textual_places p LEFT JOIN shj_textual_place_translations tr ON tr.place_id=p.id AND tr.status='published'
      WHERE p.work_id=$1 GROUP BY p.slug HAVING count(DISTINCT tr.locale) < 2
     UNION ALL
     SELECT 'passage', p.slug, string_agg(tr.locale::text, ',' ORDER BY tr.locale::text)
       FROM shj_text_passages p
       JOIN shj_text_sections s ON s.id=p.section_id JOIN shj_text_editions e ON e.id=s.edition_id
       LEFT JOIN shj_passage_translations tr ON tr.passage_id=p.id AND tr.status='published'
      WHERE e.work_id=$1 GROUP BY p.slug HAVING count(DISTINCT tr.locale) < 2`,
    [workId],
  );
  checks += 1;
  for (const gap of translationGaps) fail("bilingual", `${gap.kind} ${gap.slug}: published locales = ${gap.locales ?? "none"}`);

  // --- Artistic overview rights gate ----------------------------------------
  const overviews = await rows<{ slug: string; status: string; asset_url: string | null; prompt_path: string; prompt_sha256: string; disclosure_zh: string; disclosure_en: string }>(
    "SELECT slug, status, asset_url, prompt_path, prompt_sha256, disclosure_zh, disclosure_en FROM shj_artistic_overviews WHERE work_id=$1",
    [workId],
  );
  for (const overview of overviews) {
    checks += 1;
    if (!overview.disclosure_zh || !overview.disclosure_en) fail("overview-disclosure", `overview ${overview.slug}: missing bilingual disclosure`);
    const publiclyVisible = ["generated", "reviewed", "published"].includes(overview.status);
    checks += 1;
    if (publiclyVisible) {
      if (!overview.asset_url) {
        fail("overview-asset", `overview ${overview.slug}: status ${overview.status} requires an asset_url`);
      } else {
        const assetPath = join(PUBLIC_DIR, overview.asset_url.replace(/^\//u, ""));
        try {
          await readFile(assetPath);
        } catch {
          fail("overview-asset", `overview ${overview.slug}: asset_url ${overview.asset_url} does not resolve under apps/web/public`);
        }
      }
      // Reproducibility chain: the recorded generator input must exist and match.
      const promptPath = join(ROOT, overview.prompt_path);
      checks += 1;
      try {
        const prompt = await readFile(promptPath);
        if (sha256(prompt) !== overview.prompt_sha256) {
          fail("overview-prompt", `overview ${overview.slug}: prompt/generator checksum mismatch for ${overview.prompt_path}`);
        }
      } catch {
        fail("overview-prompt", `overview ${overview.slug}: prompt/generator file ${overview.prompt_path} is missing`);
      }
    } else if (overview.asset_url) {
      fail("overview-fail-closed", `overview ${overview.slug}: status ${overview.status} must not expose an asset_url`);
    }
  }

  // --- Report ----------------------------------------------------------------
  const errors = findings.filter((finding) => finding.severity === "error");
  const summary = {
    generatedAt: new Date().toISOString(),
    command: "npm run verify:domain",
    evidenceLevel: EVIDENCE_LEVEL,
    database: dbIdentity.db,
    postgres: dbIdentity.version.split(" on ")[0],
    result: errors.length === 0 ? "pass" : "fail",
    checks,
    errors: errors.length,
    statistics: {
      uniqueCreatureConcepts: Number(stats.concepts),
      textualOccurrences: Number(stats.occurrences),
      corpusCoverage: { passagesReviewed: Number(stats.passages_reviewed), passagesTotal: Number(stats.passages_total) },
    },
    findings,
  };
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(join(REPORT_DIR, "domain-verification.json"), `${JSON.stringify(summary, null, 2)}\n`);
  const lines = [
    "# 《山海经 Atlas》领域验证报告", "",
    `- 生成命令：\`npm run verify:domain\``,
    `- 生成时间：\`${summary.generatedAt}\``,
    `- 数据库：\`${summary.database}\`（${summary.postgres}）`,
    `- 证据层级：\`${summary.evidenceLevel}\``,
    `- 检查结果：\`${summary.result}\`（${summary.checks} 检查，${summary.errors} 错误）`, "",
    "## 三项独立统计", "",
    `- unique creature concepts：${summary.statistics.uniqueCreatureConcepts}`,
    `- textual occurrences：${summary.statistics.textualOccurrences}`,
    `- corpus coverage：${summary.statistics.corpusCoverage.passagesReviewed}/${summary.statistics.corpusCoverage.passagesTotal}`, "",
    "## Findings", "",
    ...(findings.length === 0 ? ["无。"] : findings.map((finding) => `- [${finding.severity}] ${finding.checkId}: ${finding.message}`)),
    "",
  ];
  await writeFile(join(REPORT_DIR, "domain-verification.md"), lines.join("\n"));
  console.log(`Shanhaijing domain verification ${summary.result}: ${checks} checks, ${errors.length} errors (${summary.database}, ${EVIDENCE_LEVEL})`);
  console.log("Reports: docs/generated/domain-verification.{json,md}");
  if (errors.length > 0) {
    for (const error of errors) console.error(`  [${error.checkId}] ${error.message}`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
