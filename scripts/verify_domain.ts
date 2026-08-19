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
  const editions = await rows<{ id: string; slug: string; scope: string; rights_status: string; checksum_sha256: string | null; is_baseline: boolean; review_status: string }>(
    "SELECT id, slug, scope, rights_status, checksum_sha256, is_baseline, review_status FROM shj_text_editions WHERE work_id=$1",
    [workId],
  );
  // baseline 的唯一性按 scope 判定：每篇各有底本，不是谁替换谁（migration 004）。
  const scopes = [...new Set(editions.map((edition) => edition.scope))].sort();
  for (const scope of scopes) {
    checks += 1;
    const baselines = editions.filter((edition) => edition.scope === scope && edition.is_baseline);
    if (baselines.length !== 1) {
      fail("edition-baseline", `scope ${scope} expected exactly one baseline edition, found ${baselines.length}`);
    }
  }
  info("edition-scope", `底本范围：${scopes.map((scope) => `${scope}（${editions.filter((e) => e.scope === scope).length} 个版本）`).join("、")}`);
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

  // --- Audits: every passage past draft carries an audit whose input checksum matches ---
  // 冻结的原文本身就是审核的输入，要求它在审核之前先有审核记录是循环的。
  // 一旦离开 draft，这条就必须成立。
  const auditGaps = await rows<{ slug: string }>(
    `SELECT p.slug FROM shj_text_passages p
      LEFT JOIN shj_passage_audits a ON a.passage_id=p.id
      WHERE p.review_status <> 'draft'
        AND (a.passage_id IS NULL OR a.input_checksum_sha256 <> p.checksum_sha256)`,
  );
  checks += 1;
  for (const gap of auditGaps) fail("passage-audit", `passage ${gap.slug}: missing audit or audit input checksum mismatch`);

  // --- Three independent statistics ----------------------------------------
  const stats = (await rows<{ concepts: string; occurrences: string; passages_total: string; passages_reviewed: string;
    concepts_published: string; occurrences_published: string }>(
    `SELECT
       (SELECT count(*) FROM shj_creatures WHERE work_id=$1) AS concepts,
       (SELECT count(*) FROM shj_creature_occurrences o JOIN shj_creatures c ON c.id=o.creature_id WHERE c.work_id=$1) AS occurrences,
       -- 覆盖率表的每一行都按 published 计；合计若按全部计，就会出现
       -- 「行行是 0、合计是 88」这种自相矛盾的表。两者必须同口径。
       (SELECT count(DISTINCT o.creature_id) FROM shj_creature_occurrences o JOIN shj_creatures c ON c.id=o.creature_id
         WHERE c.work_id=$1 AND o.review_status='published') AS concepts_published,
       (SELECT count(*) FROM shj_creature_occurrences o JOIN shj_creatures c ON c.id=o.creature_id
         WHERE c.work_id=$1 AND o.review_status='published') AS occurrences_published,
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
    // The route is the chain; hydrography edges hang off it and must not be
    // read as steps. Before the Xishan corpus every edge was a route step, so
    // this check could ignore relation_kind — it no longer can.
    const routeEdges = await rows<{ from_place_id: string; to_place_id: string; sequence: number; distance_value: string | null }>(
      `SELECT from_place_id, to_place_id, sequence, distance_value FROM shj_topology_edges
        WHERE section_id=$1 AND relation_kind='distance_direction' ORDER BY sequence`,
      [section.id],
    );
    for (let index = 1; index < routeEdges.length; index += 1) {
      checks += 1;
      if (routeEdges[index].from_place_id !== routeEdges[index - 1].to_place_id) {
        fail("topology-chain", `section ${section.slug}: edge ${routeEdges[index].sequence} does not continue from edge ${routeEdges[index - 1].sequence}`);
      }
    }
    const allEdges = await rows<{ from_place_id: string; to_place_id: string; sequence: number; relation_kind: string; from_kind: string; to_kind: string }>(
      `SELECT e.from_place_id, e.to_place_id, e.sequence, e.relation_kind, f.place_kind AS from_kind, t.place_kind AS to_kind
         FROM shj_topology_edges e
         JOIN shj_textual_places f ON f.id=e.from_place_id
         JOIN shj_textual_places t ON t.id=e.to_place_id
        WHERE e.section_id=$1 ORDER BY e.sequence`,
      [section.id],
    );
    const LAND = new Set(["mountain", "mountain_range", "region", "route_node", "unknown"]);
    const WATER = new Set(["river", "water_source", "marsh", "sea", "region", "unknown"]);
    for (const edge of allEdges) {
      checks += 1;
      if (edge.from_place_id === edge.to_place_id) fail("topology-loop", `section ${section.slug}: self-loop at sequence ${edge.sequence}`);
      checks += 1;
      if (edge.relation_kind === "source_of" && !(LAND.has(edge.from_kind) && WATER.has(edge.to_kind))) {
        fail("topology-kind", `section ${section.slug}: source_of at sequence ${edge.sequence} runs ${edge.from_kind}→${edge.to_kind}`);
      }
      checks += 1;
      if (edge.relation_kind === "flows_into" && !(WATER.has(edge.from_kind) && WATER.has(edge.to_kind))) {
        fail("topology-kind", `section ${section.slug}: flows_into at sequence ${edge.sequence} runs ${edge.from_kind}→${edge.to_kind}`);
      }
    }
  }

  // --- Bilingual completeness on published entities -------------------------
  const translationGaps = await rows<{ kind: string; slug: string; locales: string }>(
    // 同一条理由适用于概念与地点：约束的是「已经对外」的东西。
    // 概念表没有 review_status，其对外与否取决于它是否有已发布的出现。
    `SELECT 'creature' AS kind, c.slug, string_agg(tr.locale::text, ',' ORDER BY tr.locale::text) AS locales
       FROM shj_creatures c LEFT JOIN shj_creature_translations tr ON tr.creature_id=c.id AND tr.status='published'
      WHERE c.work_id=$1
        AND EXISTS (SELECT 1 FROM shj_creature_occurrences o WHERE o.creature_id=c.id AND o.review_status='published')
      GROUP BY c.slug HAVING count(DISTINCT tr.locale) < 2
     UNION ALL
     SELECT 'place', p.slug, string_agg(tr.locale::text, ',' ORDER BY tr.locale::text)
       FROM shj_textual_places p LEFT JOIN shj_textual_place_translations tr ON tr.place_id=p.id AND tr.status='published'
      WHERE p.work_id=$1 AND p.review_status='published' GROUP BY p.slug HAVING count(DISTINCT tr.locale) < 2
     UNION ALL
     -- 只约束已发布的段落。刚冻结、尚未逐段审核的语料（如《西山经》）本就没有译文，
     -- 把它算作"双语缺口"会把一个正常的中间状态报成错误，久而久之让人学会忽略这条检查。
     -- 真正的缺陷是：已经对外发布的段落却没有译文。
     SELECT 'passage', p.slug, string_agg(tr.locale::text, ',' ORDER BY tr.locale::text)
       FROM shj_text_passages p
       JOIN shj_text_sections s ON s.id=p.section_id JOIN shj_text_editions e ON e.id=s.edition_id
       LEFT JOIN shj_passage_translations tr ON tr.passage_id=p.id AND tr.status='published'
      WHERE e.work_id=$1 AND p.review_status='published'
      GROUP BY p.slug HAVING count(DISTINCT tr.locale) < 2`,
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
  // 分类词表：界面上的每一条分类主张都必须能用读者的语言读出来。
  // 词表缺项、缺翻译或轴未发布，都属于"证据存在但读者看不懂"，按 fail closed 处理。
  const vocabulary = await rows<{ axis: string; term: string; label_zh: string; label_en: string; definition_zh: string; definition_en: string; review_status: string }>(
    `SELECT t.axis, t.term, t.label_zh, t.label_en, t.definition_zh, t.definition_en, t.review_status FROM shj_taxonomy_terms t ORDER BY t.axis, t.term`,
  );
  const axes = await rows<{ axis: string; label_zh: string; label_en: string; review_status: string }>(
    `SELECT axis, label_zh, label_en, review_status FROM shj_taxonomy_axes ORDER BY sequence`,
  );
  const used = await rows<{ axis: string; term: string }>(
    `SELECT DISTINCT a.axis, a.term FROM shj_taxonomy_assignments a WHERE a.review_status='published' ORDER BY a.axis, a.term`,
  );
  const vocabularyKeys = new Set(vocabulary.map((row) => `${row.axis}:${row.term}`));
  const axisNames = new Set(axes.map((row) => row.axis));
  checks += 1;
  for (const row of used) {
    if (!vocabularyKeys.has(`${row.axis}:${row.term}`)) {
      fail("TAXONOMY-VOCABULARY", `指派引用了词表中不存在的词条：${row.axis}/${row.term}`);
    }
    if (!axisNames.has(row.axis)) fail("TAXONOMY-AXIS", `指派引用了未登记的轴：${row.axis}`);
  }
  checks += 1;
  for (const row of vocabulary) {
    if (!row.label_zh.trim() || !row.label_en.trim()) fail("TAXONOMY-BILINGUAL", `词条缺少双语标签：${row.axis}/${row.term}`);
    if (!row.definition_zh.trim() || !row.definition_en.trim()) fail("TAXONOMY-DEFINITION", `词条缺少双语定义：${row.axis}/${row.term}`);
    if (row.review_status !== "published") fail("TAXONOMY-STATUS", `词条未发布却被词表收录：${row.axis}/${row.term}（${row.review_status}）`);
    // 定义不能只是把标签换个说法重说一遍。
    if (row.definition_zh.trim() === row.label_zh.trim()) fail("TAXONOMY-DEFINITION", `词条定义与标签重复：${row.axis}/${row.term}`);
  }
  checks += 1;
  for (const row of axes) {
    if (!row.label_zh.trim() || !row.label_en.trim()) fail("TAXONOMY-BILINGUAL", `轴缺少双语标签：${row.axis}`);
    if (row.review_status !== "published") fail("TAXONOMY-STATUS", `轴未发布：${row.axis}`);
  }
  info("TAXONOMY-VOCABULARY", `分类词表：${axes.length} 轴、${vocabulary.length} 词条，覆盖 ${used.length} 组已发布指派`);

  // 覆盖矩阵：CONTENT_COVERAGE_MATRIX.md 里有一段标记区，声明只能由校验器重写。
  // 在此之前它一直写着"未生成"，而语料早已冻结——文档因此比数据落后了两个版本。
  // 三项统计分开出，不合并成一个"异兽数"，这是 SJ-R002 的要求。
  const coverageRows = await rows<{
    section_slug: string; section_title: string; scope: string; sequence: string;
    passages: string; reviewed: string; occurrences: string; concepts: string;
  }>(
    `SELECT s.slug AS section_slug,
            s.title_zh AS section_title,
            e.scope AS scope,
            s.sequence::text AS sequence,
            count(DISTINCT p.id)::text AS passages,
            count(DISTINCT p.id) FILTER (
              WHERE p.review_status='published' AND COALESCE(a.audit_status,'pending_review')='reviewed'
            )::text AS reviewed,
            count(DISTINCT o.id) FILTER (WHERE o.review_status='published')::text AS occurrences,
            count(DISTINCT o.creature_id) FILTER (WHERE o.review_status='published')::text AS concepts
       FROM shj_text_sections s
       JOIN shj_text_editions e ON e.id=s.edition_id AND e.work_id=$1 AND e.is_baseline
       LEFT JOIN shj_text_passages p ON p.section_id=s.id
       LEFT JOIN shj_passage_audits a ON a.passage_id=p.id
       LEFT JOIN shj_creature_occurrences o ON o.passage_id=p.id
      GROUP BY e.scope, s.slug, s.title_zh, s.sequence
      -- 两篇各有底本，按 scope 再按篇内次序排；否则表里南、西交错。
      ORDER BY e.scope <> 'nanshan', e.scope, s.sequence`,
    [workId],
  );
  const baselines = editions.filter((edition) => edition.is_baseline).sort((a, b) => a.scope.localeCompare(b.scope));
  const coverage = {
    generatedAt: new Date().toISOString(),
    command: "npm run verify:domain",
    evidenceLevel: EVIDENCE_LEVEL,
    editions: baselines.map((edition) => ({
      scope: edition.scope, slug: edition.slug, checksum: edition.checksum_sha256, reviewStatus: edition.review_status,
    })),
    totals: {
      uniqueCreatureConcepts: Number(stats.concepts_published),
      textualOccurrences: Number(stats.occurrences_published),
      passagesReviewed: Number(stats.passages_reviewed),
      passagesTotal: Number(stats.passages_total),
    },
    frozenNotDisplayed: {
      uniqueCreatureConcepts: Number(stats.concepts) - Number(stats.concepts_published),
      textualOccurrences: Number(stats.occurrences) - Number(stats.occurrences_published),
    },
    sections: coverageRows.map((row) => ({
      slug: row.section_slug,
      title: row.section_title,
      scope: row.scope,
      sequence: Number(row.sequence),
      passages: Number(row.passages),
      passagesReviewed: Number(row.reviewed),
      textualOccurrences: Number(row.occurrences),
      creatureConceptsMentioned: Number(row.concepts),
    })),
  };
  await writeFile(join(REPORT_DIR, "corpus-coverage.json"), `${JSON.stringify(coverage, null, 2)}\n`);

  const coverageTable = [
    "| 山系 | 段落 | 已审核 | 文本提及 | 出现的异兽概念 |",
    "|---|---|---|---|---|",
    ...coverage.sections.map((section) =>
      `| ${section.title} | ${section.passages} | ${section.passagesReviewed} | ${section.textualOccurrences} | ${section.creatureConceptsMentioned} |`),
    `| **合计** | **${coverage.totals.passagesTotal}** | **${coverage.totals.passagesReviewed}** | **${coverage.totals.textualOccurrences}** | **${coverage.totals.uniqueCreatureConcepts}（归并后独立概念）** |`,
  ].join("\n");
  const coverageBlock = [
    "",
    `> 由 \`${coverage.command}\` 于 \`${coverage.generatedAt}\` 生成；证据层级 \`${coverage.evidenceLevel}\`。`,
    "",
    "> 底本（每篇各一个 baseline）：",
    ...coverage.editions.map((edition) =>
      `> - \`${edition.scope}\` → \`${edition.slug}\`，checksum \`${(edition.checksum ?? "").slice(0, 16)}…\`，状态 \`${edition.reviewStatus}\``),
    "",
    coverageTable,
    "",
    "> 「已审核」为 0 的山系表示**文本已冻结、内容尚未逐段审核**——不进 API，也不计入覆盖率分子。",
    `> 另有 **${coverage.frozenNotDisplayed.textualOccurrences}** 处提及、**${coverage.frozenNotDisplayed.uniqueCreatureConcepts}** 个概念已入库但为 \`draft\`——抽取未经人复核，不进 API，故不计入上表。`,
    "> 合计列的「异兽概念」是**归并后的独立概念数**，不是各行相加——同一异兽在多个山系出现只计一次。",
    "> 三项统计彼此独立，禁止相加或互相替代。",
    "",
  ].join("\n");
  const matrixPath = join(ROOT, "docs/CONTENT_COVERAGE_MATRIX.md");
  const matrix = await readFile(matrixPath, "utf8");
  const begin = "<!-- SHANHAIJING_COVERAGE:BEGIN -->";
  const end = "<!-- SHANHAIJING_COVERAGE:END -->";
  checks += 1;
  if (!matrix.includes(begin) || !matrix.includes(end)) {
    fail("COVERAGE-MARKERS", "CONTENT_COVERAGE_MATRIX.md 缺少机器生成区标记");
  } else {
    const rewritten = `${matrix.slice(0, matrix.indexOf(begin) + begin.length)}${coverageBlock}${matrix.slice(matrix.indexOf(end))}`;
    if (rewritten !== matrix) await writeFile(matrixPath, rewritten);
    info("COVERAGE-MATRIX", `覆盖矩阵统计区已更新：${coverage.sections.length} 个山系`);
  }

  // 冻结与已审核是两件事。把「文本已冻结、内容未审核」的规模显式报出来，
  // 否则它既不出现在覆盖统计（那里只数已审核）也不出现在错误里，等于消失。
  const frozenNotReviewed = await rows<{ scope: string; total: string; drafted: string }>(
    `SELECT e.scope,
            count(p.id)::text AS total,
            count(p.id) FILTER (WHERE p.review_status='draft')::text AS drafted
       FROM shj_text_editions e
       JOIN shj_text_sections s ON s.edition_id=e.id
       JOIN shj_text_passages p ON p.section_id=s.id
      WHERE e.work_id=$1
      GROUP BY e.scope ORDER BY e.scope`,
    [workId],
  );
  checks += 1;
  for (const row of frozenNotReviewed) {
    if (Number(row.drafted) > 0) {
      info("corpus-frozen-unreviewed", `${row.scope}：${row.drafted}/${row.total} 段已冻结但未审核（不进 API、不计入覆盖率）`);
    }
  }

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
