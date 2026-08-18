import type pg from "pg";

type Database = Pick<pg.Pool, "query">;

/**
 * First-party Shanhaijing domain loader.
 *
 * The shared Atlas payload still carries the core collections, but this module
 * owns passage, occurrence, creature, textual-place and topology semantics.
 * Layout coordinates never pass through PostGIS and cannot be mistaken for
 * WGS84 geography.
 */
export async function loadShanhaijingAtlas(
  db: Database,
  workId: string,
  requestedLocale: string,
  fallbackLocale: string,
) {
  const args = [workId, requestedLocale, fallbackLocale];
  const [sections, passages, creatures, occurrences, places, topologyEdges, overview, coverage] = await Promise.all([
    db.query(
      `SELECT s.id,s.slug,s.sequence,s.reference_label AS "referenceLabel",
        CASE WHEN $2='zh-CN' THEN s.title_zh ELSE s.title_en END AS title,
        CASE WHEN $2='zh-CN' THEN s.summary_zh ELSE s.summary_en END AS summary,
        s.review_status AS "reviewStatus"
       FROM shj_text_sections s JOIN shj_text_editions e ON e.id=s.edition_id
       WHERE e.work_id=$1 AND e.is_baseline AND e.review_status='published'
         AND s.review_status='published'
       ORDER BY s.sequence`,
      [workId, requestedLocale],
    ),
    db.query(
      `SELECT p.id,p.slug,p.reference_key AS "referenceKey",p.sequence,s.slug AS "sectionSlug",
        p.text_zh AS "textZh",p.source_url AS "sourceUrl",p.checksum_sha256 AS "checksumSha256",
        p.review_status AS "reviewStatus",COALESCE(t.title,f.title,p.reference_key) AS title,
        COALESCE(t.summary,f.summary,'') AS summary,COALESCE(t.editorial_note,f.editorial_note,'') AS "editorialNote",
        CASE WHEN t.title IS NULL THEN $3::locale_code ELSE $2::locale_code END AS "resolvedLocale",
        (t.title IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus",
        COALESCE((SELECT json_agg(DISTINCT c.slug ORDER BY c.slug)
          FROM shj_creature_occurrences o JOIN shj_creatures c ON c.id=o.creature_id
          WHERE o.passage_id=p.id AND o.review_status='published'),'[]'::json) AS "creatureSlugs",
        COALESCE((SELECT json_agg(DISTINCT pl.slug ORDER BY pl.slug)
          FROM shj_place_mentions pm JOIN shj_textual_places pl ON pl.id=pm.place_id
          WHERE pm.passage_id=p.id),'[]'::json) AS "placeSlugs"
       FROM shj_text_passages p JOIN shj_text_sections s ON s.id=p.section_id
       JOIN shj_text_editions e ON e.id=s.edition_id
       LEFT JOIN shj_passage_translations t ON t.passage_id=p.id AND t.locale=$2 AND t.status='published'
       LEFT JOIN shj_passage_translations f ON f.passage_id=p.id AND f.locale=$3 AND f.status='published'
       WHERE e.work_id=$1 AND e.is_baseline AND e.review_status='published'
         AND s.review_status='published' AND p.review_status='published'
         AND (t.title IS NOT NULL OR f.title IS NOT NULL)
       ORDER BY s.sequence,p.sequence`,
      args,
    ),
    db.query(
      `SELECT c.id,c.slug,c.concept_status AS "conceptStatus",c.importance,c.icon_key AS "iconKey",
        COALESCE(t.name,f.name) AS name,COALESCE(t.aliases,f.aliases,'{}') AS aliases,
        COALESCE(t.summary,f.summary,'') AS summary,COALESCE(t.detail,f.detail,'') AS detail,
        CASE WHEN t.name IS NULL THEN $3::locale_code ELSE $2::locale_code END AS "resolvedLocale",
        (t.name IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus",
        COALESCE((SELECT json_agg(DISTINCT p.slug ORDER BY p.slug)
          FROM shj_creature_occurrences o JOIN shj_text_passages p ON p.id=o.passage_id
          WHERE o.creature_id=c.id AND o.review_status='published'),'[]'::json) AS "passageSlugs",
        COALESCE((SELECT json_agg(DISTINCT pl.slug ORDER BY pl.slug)
          FROM shj_creature_occurrences o JOIN shj_textual_places pl ON pl.id=o.place_id
          WHERE o.creature_id=c.id AND o.review_status='published'),'[]'::json) AS "placeSlugs",
        COALESCE((SELECT json_agg(json_build_object(
          'axis',a.axis,'term',a.term,'confidence',a.confidence,'evidenceNote',a.evidence_note
        ) ORDER BY a.axis,a.term) FROM shj_taxonomy_assignments a
          WHERE a.creature_id=c.id AND a.review_status='published'),'[]'::json) AS taxonomy
       FROM shj_creatures c
       LEFT JOIN shj_creature_translations t ON t.creature_id=c.id AND t.locale=$2 AND t.status='published'
       LEFT JOIN shj_creature_translations f ON f.creature_id=c.id AND f.locale=$3 AND f.status='published'
       WHERE c.work_id=$1 AND c.concept_status<>'superseded'
         AND (t.name IS NOT NULL OR f.name IS NOT NULL)
       ORDER BY c.importance DESC,c.sort_order`,
      args,
    ),
    db.query(
      `SELECT o.id,c.slug AS "creatureSlug",p.slug AS "passageSlug",pl.slug AS "placeSlug",
        o.surface_form AS "surfaceForm",o.quote_zh AS "quoteZh",o.occurrence_order AS "occurrenceOrder",
        o.source_attestation AS "sourceAttestation",o.interpretation_class AS "interpretationClass",
        o.confidence,o.evidence_note AS "evidenceNote",o.review_status AS "reviewStatus"
       FROM shj_creature_occurrences o
       JOIN shj_creatures c ON c.id=o.creature_id
       JOIN shj_text_passages p ON p.id=o.passage_id
       JOIN shj_text_sections s ON s.id=p.section_id
       JOIN shj_text_editions ed ON ed.id=s.edition_id
       LEFT JOIN shj_textual_places pl ON pl.id=o.place_id
       WHERE c.work_id=$1 AND ed.is_baseline AND ed.review_status='published'
         AND s.review_status='published' AND p.review_status='published'
         AND o.review_status='published'
       ORDER BY s.sequence,p.sequence,o.occurrence_order`,
      [workId],
    ),
    db.query(
      `SELECT pl.id,pl.slug,pl.place_kind AS "placeKind",pl.layout_x::float AS "layoutX",
        pl.layout_y::float AS "layoutY",pl.layout_space AS "layoutSpace",pl.review_status AS "reviewStatus",
        COALESCE(t.name,f.name) AS name,COALESCE(t.aliases,f.aliases,'{}') AS aliases,
        COALESCE(t.summary,f.summary,'') AS summary,
        CASE WHEN t.name IS NULL THEN $3::locale_code ELSE $2::locale_code END AS "resolvedLocale",
        (t.name IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus",
        COALESCE((SELECT json_agg(DISTINCT p.slug ORDER BY p.slug)
          FROM shj_place_mentions pm JOIN shj_text_passages p ON p.id=pm.passage_id
          WHERE pm.place_id=pl.id),'[]'::json) AS "passageSlugs",
        COALESCE((SELECT json_agg(DISTINCT c.slug ORDER BY c.slug)
          FROM shj_creature_occurrences o JOIN shj_creatures c ON c.id=o.creature_id
          WHERE o.place_id=pl.id AND o.review_status='published'),'[]'::json) AS "creatureSlugs"
       FROM shj_textual_places pl
       LEFT JOIN shj_textual_place_translations t ON t.place_id=pl.id AND t.locale=$2 AND t.status='published'
       LEFT JOIN shj_textual_place_translations f ON f.place_id=pl.id AND f.locale=$3 AND f.status='published'
       WHERE pl.work_id=$1 AND pl.review_status='published'
         AND (t.name IS NOT NULL OR f.name IS NOT NULL)
       ORDER BY pl.sort_order`,
      args,
    ),
    db.query(
      `SELECT e.id,fp.slug AS "fromSlug",tp.slug AS "toSlug",p.slug AS "passageSlug",
        e.relation_kind AS "relationKind",e.direction_text AS "directionText",
        e.distance_value::float AS "distanceValue",e.distance_unit AS "distanceUnit",
        e.sequence,e.interpretation_class AS "interpretationClass",
        e.conflict_status AS "conflictStatus",e.review_status AS "reviewStatus"
       FROM shj_topology_edges e
       JOIN shj_text_sections s ON s.id=e.section_id
       JOIN shj_text_editions ed ON ed.id=s.edition_id
       JOIN shj_textual_places fp ON fp.id=e.from_place_id
       JOIN shj_textual_places tp ON tp.id=e.to_place_id
       JOIN shj_text_passages p ON p.id=e.passage_id
       WHERE ed.work_id=$1 AND ed.is_baseline AND ed.review_status='published'
         AND s.review_status='published' AND p.review_status='published'
         AND e.review_status='published'
       ORDER BY e.sequence`,
      [workId],
    ),
    db.query(
      `SELECT id,slug,status,interpretation_class AS "interpretationClass",
        coordinate_space AS "coordinateSpace",asset_url AS "assetUrl",
        prompt_path AS "promptPath",prompt_sha256 AS "promptSha256",
        CASE WHEN $2='zh-CN' THEN title_zh ELSE title_en END AS title,
        CASE WHEN $2='zh-CN' THEN description_zh ELSE description_en END AS description,
        CASE WHEN $2='zh-CN' THEN disclosure_zh ELSE disclosure_en END AS disclosure
       FROM shj_artistic_overviews
        WHERE work_id=$1
          -- 权利闸门 fail closed:只有 published 的母图才对外可见。
          -- 撤回、未审、未生成的记录一律不出 API,连 asset_url 都不给——
          -- 撤回一张图的动作必须在下一次请求就生效,而不是等重新烘焙。
          AND status='published'
        ORDER BY slug LIMIT 1`,
      [workId, requestedLocale],
    ),
    db.query(
      `SELECT
         count(*)::int AS "passagesTotal",
         count(*) FILTER (
           WHERE p.review_status='published'
             AND COALESCE(a.audit_status,'pending_review')='reviewed'
         )::int AS "passagesReviewed",
         count(*) FILTER (
           WHERE t.title IS NOT NULL
             AND t.status='published'
         )::int AS "passagesWithRequestedLocale",
         count(*) FILTER (
           WHERE f.title IS NOT NULL
             AND f.status='published'
         )::int AS "passagesWithFallbackLocale"
       FROM shj_text_passages p
       JOIN shj_text_sections s ON s.id=p.section_id
       JOIN shj_text_editions e ON e.id=s.edition_id
       LEFT JOIN shj_passage_audits a ON a.passage_id=p.id
       LEFT JOIN shj_passage_translations t ON t.passage_id=p.id
         AND t.locale=$2 AND t.status='published'
       LEFT JOIN shj_passage_translations f ON f.passage_id=p.id
         AND f.locale=$3 AND f.status='published'
       WHERE e.work_id=$1 AND e.is_baseline`,
      args,
    ),
  ]);

  return {
    sections: sections.rows,
    passages: passages.rows,
    creatures: creatures.rows,
    occurrences: occurrences.rows,
    places: places.rows,
    topologyEdges: topologyEdges.rows,
    artisticOverview: overview.rows[0] ?? null,
    coverage: {
      passagesTotal: Number(coverage.rows[0]?.passagesTotal ?? 0),
      passagesReviewed: Number(coverage.rows[0]?.passagesReviewed ?? 0),
      passagesWithRequestedLocale: Number(coverage.rows[0]?.passagesWithRequestedLocale ?? 0),
      passagesWithFallbackLocale: Number(coverage.rows[0]?.passagesWithFallbackLocale ?? 0),
      creatureConcepts: creatures.rows.length,
      textualOccurrences: occurrences.rows.length,
    },
  };
}

export async function loadShanhaijingDetail(
  db: Database,
  workId: string,
  kind: "creature" | "passage" | "textual_place",
  slug: string,
  requestedLocale: string,
  fallbackLocale: string,
): Promise<Record<string, unknown> | undefined> {
  const args = [workId, requestedLocale, fallbackLocale, slug];
  const queries = {
    creature: `SELECT COALESCE(t.detail,f.detail,'') detail,COALESCE(t.summary,f.summary,'') summary,
        CASE WHEN t.name IS NULL THEN $3::locale_code ELSE $2::locale_code END AS "resolvedLocale",
        (t.name IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus"
      FROM shj_creatures c
      LEFT JOIN shj_creature_translations t ON t.creature_id=c.id AND t.locale=$2 AND t.status='published'
      LEFT JOIN shj_creature_translations f ON f.creature_id=c.id AND f.locale=$3 AND f.status='published'
      WHERE c.work_id=$1 AND c.slug=$4 AND c.concept_status<>'superseded'
        AND (t.name IS NOT NULL OR f.name IS NOT NULL)`,
    passage: `SELECT p.text_zh AS "textZh",p.source_url AS "sourceUrl",p.reference_key AS "referenceKey",
      COALESCE(t.editorial_note,f.editorial_note,'') AS "editorialNote",
      CASE WHEN t.title IS NULL THEN $3::locale_code ELSE $2::locale_code END AS "resolvedLocale",
      (t.title IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus"
      FROM shj_text_passages p JOIN shj_text_sections s ON s.id=p.section_id
      JOIN shj_text_editions e ON e.id=s.edition_id
      LEFT JOIN shj_passage_translations t ON t.passage_id=p.id AND t.locale=$2 AND t.status='published'
      LEFT JOIN shj_passage_translations f ON f.passage_id=p.id AND f.locale=$3 AND f.status='published'
      WHERE e.work_id=$1 AND e.is_baseline AND e.review_status='published'
        AND s.review_status='published' AND p.review_status='published'
        AND p.slug=$4 AND (t.title IS NOT NULL OR f.title IS NOT NULL)`,
    textual_place: `SELECT COALESCE(t.summary,f.summary,'') summary,pl.layout_space AS "layoutSpace",
      pl.layout_x::text AS "layoutX",pl.layout_y::text AS "layoutY",
      CASE WHEN t.name IS NULL THEN $3::locale_code ELSE $2::locale_code END AS "resolvedLocale",
      (t.name IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus"
      FROM shj_textual_places pl
      LEFT JOIN shj_textual_place_translations t ON t.place_id=pl.id AND t.locale=$2 AND t.status='published'
      LEFT JOIN shj_textual_place_translations f ON f.place_id=pl.id AND f.locale=$3 AND f.status='published'
      WHERE pl.work_id=$1 AND pl.slug=$4 AND pl.review_status='published'
        AND (t.name IS NOT NULL OR f.name IS NOT NULL)`,
  } as const;
  const result = await db.query(queries[kind], args);
  return result.rows[0] as Record<string, unknown> | undefined;
}
