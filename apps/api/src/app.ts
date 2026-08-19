import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import type pg from "pg";
import { ZodError, z } from "zod";
import { resolveLocale, supportedLocales } from "./locale.js";
import { loadShanhaijingAtlas, loadShanhaijingDetail } from "./shanhaijing.js";

/**
 * Shanhaijing Atlas API.
 *
 * Single-work by construction. The multi-work ancestor of this file returned
 * twenty-one always-empty collections alongside the domain payload; here the
 * atlas response carries exactly what the atlas has: the work, its sources,
 * and the Shanhaijing domain.
 */
const WORK_SLUG = "shanhaijing";
const SlugSchema = z.string().regex(/^[a-z0-9-]+$/u);
const SearchSchema = z.object({ q: z.string().trim().min(1).max(100), locale: z.string().optional() });
const DetailSchema = z.enum(["lite", "full"]).catch("lite");
const EntityKindSchema = z.enum(["creature", "passage", "textual_place"]);
type Database = Pick<pg.Pool, "query">;

export function createApp(db: Database, corsOrigin: string = process.env.CORS_ORIGIN ?? "*") {
  const app = express();
  const origins = corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);
  app.use(cors(origins.length === 0 || origins.includes("*") ? {} : { origin: origins }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", async (_request, response, next) => {
    try { await db.query("SELECT 1"); response.json({ status: "ok", version: "1.0.0" }); } catch (error) { next(error); }
  });

  app.get("/api/locales", (_request, response) => response.json({
    locales: supportedLocales,
    defaultLocale: "zh-CN",
    fallbackPolicy: "requested published translation, then the work default locale; never silently substitute",
  }));

  app.get("/api/works", async (request, response, next) => {
    try {
      const locale = resolveLocale(request.query.locale);
      const result = await db.query(`
        SELECT w.slug,w.author_name AS "authorName",w.publication_year AS "publicationYear",w.content_mode AS "contentMode",w.map_layer AS "mapLayer",
          w.category,w.origin_region AS "originRegion",w.chronology_start_year AS "chronologyStartYear",w.chronology_end_year AS "chronologyEndYear",
          w.theme_color AS "themeColor",w.theme_color_dark AS "themeColorDark",w.theme_color_light AS "themeColorLight",
          COALESCE(req.title,fb.title) AS title,COALESCE(req.summary,fb.summary) AS summary,alt.title AS "alternateTitle",
          CASE WHEN req.title IS NULL THEN w.default_locale ELSE $1::locale_code END AS "resolvedLocale",(req.title IS NULL) AS "fallbackUsed",
          COALESCE(req.status,fb.status) AS "translationStatus",
          -- 只数读者够得着的概念。概念表没有 review_status,其对外与否取决于
          -- 是否有已发布的出现;不加这个条件,《西山经》一入库这里就报 85,
          -- 而图集里仍只有 23 个——同「43/125」是同一类缺陷。
          (SELECT count(*)::int FROM shj_creatures sc
            WHERE sc.work_id=w.id AND sc.concept_status<>'superseded'
              AND EXISTS (SELECT 1 FROM shj_creature_occurrences sco
                           WHERE sco.creature_id=sc.id AND sco.review_status='published')) AS "uniqueCreatureConceptCount",
          (SELECT count(*)::int
             FROM shj_creature_occurrences so
             JOIN shj_creatures soc ON soc.id=so.creature_id
             JOIN shj_text_passages sop ON sop.id=so.passage_id
             JOIN shj_text_sections sos ON sos.id=sop.section_id
             JOIN shj_text_editions soe ON soe.id=sos.edition_id
            WHERE soc.work_id=w.id AND soe.is_baseline
              AND soe.review_status='published' AND sos.review_status='published'
              AND sop.review_status='published' AND so.review_status='published') AS "textualOccurrenceCount",
          (SELECT json_build_object(
             'reviewed', count(*) FILTER (
               WHERE sp.review_status='published'
                 AND COALESCE(sa.audit_status,'pending_review')='reviewed'
             )::int,
             'total', count(*)::int
           )
             FROM shj_text_passages sp
             JOIN shj_text_sections ss ON ss.id=sp.section_id
             -- 与图集载荷同一条口径:分母只算已发布的底本。冻结未发布的篇目
             -- 属内部进度,归 CONTENT_COVERAGE_MATRIX,不归对外载荷。
             JOIN shj_text_editions se ON se.id=ss.edition_id AND se.review_status='published'
             LEFT JOIN shj_passage_audits sa ON sa.passage_id=sp.id
            WHERE se.work_id=w.id AND se.is_baseline) AS "corpusCoverage",
          (SELECT count(*)::int FROM shj_textual_places sl WHERE sl.work_id=w.id AND sl.review_status='published') AS "textualPlaceCount"
        FROM works w
        LEFT JOIN work_translations req ON req.work_id=w.id AND req.locale=$1 AND req.status='published'
        LEFT JOIN work_translations fb ON fb.work_id=w.id AND fb.locale=w.default_locale AND fb.status='published'
        LEFT JOIN work_translations alt ON alt.work_id=w.id AND alt.locale=CASE WHEN $1='zh-CN' THEN 'en'::locale_code ELSE 'zh-CN'::locale_code END AND alt.status='published'
        WHERE req.title IS NOT NULL OR fb.title IS NOT NULL ORDER BY w.launch_rank`, [locale.requestedLocale]);
      response.json({ locale: locale.requestedLocale, items: result.rows });
    } catch (error) { next(error); }
  });

  async function loadWork(slug: string, requestedLocale: string) {
    const result = await db.query(`SELECT w.id,w.slug,w.author_name AS "authorName",w.publication_year AS "publicationYear",w.content_mode AS "contentMode",w.map_layer AS "mapLayer",w.default_locale,
      w.category,w.origin_region AS "originRegion",w.chronology_start_year AS "chronologyStartYear",w.chronology_end_year AS "chronologyEndYear",w.theme_color AS "themeColor",w.theme_color_dark AS "themeColorDark",w.theme_color_light AS "themeColorLight",
      COALESCE(t.title,f.title) title,COALESCE(t.summary,f.summary) summary,CASE WHEN t.title IS NULL THEN w.default_locale ELSE $2::locale_code END AS "resolvedLocale",(t.title IS NULL) AS "fallbackUsed",COALESCE(t.status,f.status) AS "translationStatus"
      FROM works w
      LEFT JOIN work_translations t ON t.work_id=w.id AND t.locale=$2 AND t.status='published'
      LEFT JOIN work_translations f ON f.work_id=w.id AND f.locale=w.default_locale AND f.status='published'
      WHERE w.slug=$1`, [slug, requestedLocale]);
    return result.rows[0] as Record<string, unknown> | undefined;
  }

  app.get("/api/works/:slug/atlas", async (request, response, next) => {
    try {
      const slug = SlugSchema.parse(request.params.slug);
      const detail = DetailSchema.parse(request.query.detail);
      const { requestedLocale } = resolveLocale(request.query.locale);
      const work = await loadWork(slug, requestedLocale);
      if (!work) { response.status(404).json({ error: { code: "WORK_NOT_FOUND", message: `Unknown work: ${slug}` } }); return; }
      const workId = z.string().uuid().parse(work.id);
      const fallbackLocale = z.enum(supportedLocales).parse(work.default_locale);

      const sources = await db.query(
        `SELECT s.id,COALESCE(st.title,sf.title,s.title) AS title,s.url,
                COALESCE(st.citation,sf.citation,s.citation) AS citation,
                s.evidence_grade AS "evidenceGrade",s.source_type AS "sourceType"
           FROM sources s
           LEFT JOIN source_translations st ON st.source_id=s.id AND st.locale=$2 AND st.status='published'
           LEFT JOIN source_translations sf ON sf.source_id=s.id AND sf.locale=$3 AND sf.status='published'
          WHERE s.work_id=$1 ORDER BY s.title`,
        [workId, requestedLocale, fallbackLocale],
      );
      const shanhaijing = await loadShanhaijingAtlas(db, workId, requestedLocale, fallbackLocale);
      response.json({ requestedLocale, detail, work, sources: sources.rows, shanhaijing });
    } catch (error) { next(error); }
  });

  /** Full prose for a single entity, fetched only when a drawer opens. */
  app.get("/api/works/:slug/entities/:kind/:entitySlug", async (request, response, next) => {
    try {
      const slug = SlugSchema.parse(request.params.slug);
      const kind = EntityKindSchema.parse(request.params.kind);
      const entitySlug = SlugSchema.parse(request.params.entitySlug);
      const { requestedLocale } = resolveLocale(request.query.locale);
      const work = await loadWork(slug, requestedLocale);
      if (!work) { response.status(404).json({ error: { code: "WORK_NOT_FOUND", message: `Unknown work: ${slug}` } }); return; }
      const workId = z.string().uuid().parse(work.id);
      const fallbackLocale = z.enum(supportedLocales).parse(work.default_locale);
      const fields = await loadShanhaijingDetail(db, workId, kind, entitySlug, requestedLocale, fallbackLocale);
      if (!fields) { response.status(404).json({ error: { code: "ENTITY_NOT_FOUND", message: `Unknown ${kind}: ${entitySlug}` } }); return; }
      response.json({ requestedLocale, kind, slug: entitySlug, fields });
    } catch (error) { next(error); }
  });

  app.get("/api/search", async (request, response, next) => {
    try {
      const parsed = SearchSchema.parse(request.query);
      const { requestedLocale, fallbackLocale } = resolveLocale(parsed.locale);
      const result = await db.query(
        `SELECT kind,slug,label,context,"workSlug"
           FROM (
             SELECT 'creature'::text AS kind,c.slug,
                    COALESCE(rt.name,fb.name) AS label,
                    COALESCE(rt.summary,fb.summary) AS context,
                    w.slug AS "workSlug"
               FROM shj_creatures c
               JOIN works w ON w.id=c.work_id
               LEFT JOIN shj_creature_translations rt ON rt.creature_id=c.id AND rt.locale=$2 AND rt.status='published'
               LEFT JOIN shj_creature_translations fb ON fb.creature_id=c.id AND fb.locale=$3 AND fb.status='published'
              WHERE c.concept_status<>'superseded'
                AND (rt.name IS NOT NULL OR fb.name IS NOT NULL)
                AND (COALESCE(rt.name,fb.name)||' '||COALESCE(rt.summary,fb.summary)||' '||
                     array_to_string(COALESCE(rt.aliases,fb.aliases,'{}'),' ')) ILIKE '%'||$1||'%'
             UNION ALL
             SELECT 'passage'::text,p.slug,
                    COALESCE(rt.title,fb.title),
                    COALESCE(rt.summary,fb.summary),
                    w.slug
               FROM shj_text_passages p
               JOIN shj_text_sections s ON s.id=p.section_id
               JOIN shj_text_editions e ON e.id=s.edition_id
               JOIN works w ON w.id=e.work_id
               LEFT JOIN shj_passage_translations rt ON rt.passage_id=p.id AND rt.locale=$2 AND rt.status='published'
               LEFT JOIN shj_passage_translations fb ON fb.passage_id=p.id AND fb.locale=$3 AND fb.status='published'
              WHERE e.is_baseline AND e.review_status='published'
                AND s.review_status='published' AND p.review_status='published'
                AND (rt.title IS NOT NULL OR fb.title IS NOT NULL)
                AND (COALESCE(rt.title,fb.title)||' '||COALESCE(rt.summary,fb.summary)||' '||
                     p.text_zh||' '||p.reference_key) ILIKE '%'||$1||'%'
             UNION ALL
             SELECT 'textual_place'::text,p.slug,
                    COALESCE(rt.name,fb.name),
                    COALESCE(rt.summary,fb.summary),
                    w.slug
               FROM shj_textual_places p
               JOIN works w ON w.id=p.work_id
               LEFT JOIN shj_textual_place_translations rt ON rt.place_id=p.id AND rt.locale=$2 AND rt.status='published'
               LEFT JOIN shj_textual_place_translations fb ON fb.place_id=p.id AND fb.locale=$3 AND fb.status='published'
              WHERE p.review_status='published'
                AND (rt.name IS NOT NULL OR fb.name IS NOT NULL)
                AND (COALESCE(rt.name,fb.name)||' '||COALESCE(rt.summary,fb.summary)||' '||
                     array_to_string(COALESCE(rt.aliases,fb.aliases,'{}'),' ')) ILIKE '%'||$1||'%'
           ) shj
          LIMIT 200`,
        [parsed.q, requestedLocale, fallbackLocale],
      );
      response.json({ locale: requestedLocale, query: parsed.q, items: result.rows });
    } catch (error) { next(error); }
  });

  app.use((_request, response) => response.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } }));
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ZodError) { response.status(400).json({ error: { code: "INVALID_REQUEST", message: "Request validation failed", details: error.issues } }); return; }
    console.error(error);
    response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "The server could not complete the request" } });
  });

  return app;
}

export { WORK_SLUG };
