import { z } from "zod";

/**
 * Schemas for exactly what the Shanhaijing API returns.
 *
 * The multi-work ancestor of this file declared schemas for characters,
 * events, locations, routes, relations, artworks, compositions and score
 * fragments — none of which this atlas has. Parsing is the contract, so the
 * contract is kept to what actually exists.
 */
export const LocaleSchema = z.enum(["zh-CN", "en"]);
export type Locale = z.infer<typeof LocaleSchema>;
export const EntityTypeSchema = z.enum(["creature", "passage", "textual_place"]);

const TranslationMetaSchema = z.object({
  resolvedLocale: LocaleSchema,
  fallbackUsed: z.boolean(),
  translationStatus: z.enum(["draft", "reviewed", "published"]),
});

const WorkCoreSchema = z.object({
  slug: z.string(), authorName: z.string(), publicationYear: z.number().nullable().optional(),
  contentMode: z.enum(["documented_record", "literary_narrative"]), mapLayer: z.enum(["real", "fictional"]),
  category: z.enum(["mythography"]), originRegion: z.string(),
  chronologyStartYear: z.number().nullable(), chronologyEndYear: z.number().nullable(),
  themeColor: z.string(), themeColorDark: z.string(), themeColorLight: z.string(),
  title: z.string(), summary: z.string(),
}).and(TranslationMetaSchema);

export const WorksResponseSchema = z.object({
  locale: LocaleSchema,
  items: z.array(WorkCoreSchema.and(z.object({
    alternateTitle: z.string().nullable(),
    uniqueCreatureConceptCount: z.number().optional(),
    textualOccurrenceCount: z.number().optional(),
    corpusCoverage: z.object({ reviewed: z.number(), total: z.number() }).optional(),
    textualPlaceCount: z.number().optional(),
  }))),
});

const SourceSchema = z.object({
  id: z.string().uuid(), title: z.string(), url: z.string().nullable(), citation: z.string(),
  evidenceGrade: z.string(),
  sourceType: z.enum(["primary_text", "scholarly", "historical", "reference", "map", "image"]),
});

const SectionSchema = z.object({
  id: z.string().uuid(), slug: z.string(), sequence: z.number(), referenceLabel: z.string(),
  title: z.string(), summary: z.string(), reviewStatus: z.enum(["draft", "reviewed", "published"]),
});

const PassageSchema = z.object({
  id: z.string().uuid(), slug: z.string(), referenceKey: z.string(), sequence: z.number(), sectionSlug: z.string(),
  textZh: z.string(), sourceUrl: z.string().url(), checksumSha256: z.string().regex(/^[0-9a-f]{64}$/u),
  reviewStatus: z.enum(["draft", "reviewed", "published"]), title: z.string(), summary: z.string(), editorialNote: z.string(),
  creatureSlugs: z.array(z.string()), placeSlugs: z.array(z.string()),
}).and(TranslationMetaSchema);

const TaxonomySchema = z.object({
  axis: z.string(), term: z.string(), confidence: z.enum(["high", "medium", "low", "unknown"]), evidenceNote: z.string(),
});

const CreatureSchema = z.object({
  id: z.string().uuid(), slug: z.string(), conceptStatus: z.enum(["resolved", "provisional", "disputed", "superseded"]),
  importance: z.number(), iconKey: z.string(), name: z.string(), aliases: z.array(z.string()), summary: z.string(), detail: z.string(),
  passageSlugs: z.array(z.string()), placeSlugs: z.array(z.string()), taxonomy: z.array(TaxonomySchema),
}).and(TranslationMetaSchema);

const OccurrenceSchema = z.object({
  id: z.string().uuid(), creatureSlug: z.string(), passageSlug: z.string(), placeSlug: z.string().nullable(),
  surfaceForm: z.string(), quoteZh: z.string(), occurrenceOrder: z.number(),
  sourceAttestation: z.enum(["text_direct", "commentary", "research", "none"]),
  interpretationClass: z.enum(["transcription", "editorial_summary", "scholarly_hypothesis", "artistic_interpretation"]),
  confidence: z.enum(["high", "medium", "low", "unknown"]), evidenceNote: z.string(),
  reviewStatus: z.enum(["draft", "reviewed", "published"]),
});

const PlaceSchema = z.object({
  id: z.string().uuid(), slug: z.string(),
  placeKind: z.enum(["mountain", "mountain_range", "river", "water_source", "marsh", "sea", "region", "route_node", "unknown"]),
  layoutX: z.coerce.number(), layoutY: z.coerce.number(), layoutSpace: z.string(),
  reviewStatus: z.enum(["draft", "reviewed", "published"]), name: z.string(), aliases: z.array(z.string()), summary: z.string(),
  passageSlugs: z.array(z.string()), creatureSlugs: z.array(z.string()),
}).and(TranslationMetaSchema);

const TopologyEdgeSchema = z.object({
  id: z.string().uuid(), fromSlug: z.string(), toSlug: z.string(), passageSlug: z.string(),
  relationKind: z.enum(["next_in_route", "distance_direction", "source_of", "flows_into", "surrounds", "passes_through", "adjacent_to", "unresolved_relation"]),
  directionText: z.string(), distanceValue: z.coerce.number().nullable(), distanceUnit: z.string(), sequence: z.number(),
  interpretationClass: z.enum(["transcription", "editorial_summary", "scholarly_hypothesis", "artistic_interpretation"]),
  conflictStatus: z.enum(["none", "disputed", "unresolved"]), reviewStatus: z.enum(["draft", "reviewed", "published"]),
});

const OverviewSchema = z.object({
  id: z.string().uuid(), slug: z.string(),
  status: z.enum(["planned", "blocked_missing_api_key", "generated", "reviewed", "published", "withdrawn"]),
  interpretationClass: z.literal("artistic_interpretation"), coordinateSpace: z.string(), assetUrl: z.string().nullable(),
  promptPath: z.string(), promptSha256: z.string().regex(/^[0-9a-f]{64}$/u),
  title: z.string(), description: z.string(), disclosure: z.string(),
});

const ShanhaijingDomainSchema = z.object({
  sections: z.array(SectionSchema),
  passages: z.array(PassageSchema),
  creatures: z.array(CreatureSchema),
  occurrences: z.array(OccurrenceSchema),
  places: z.array(PlaceSchema),
  topologyEdges: z.array(TopologyEdgeSchema),
  artisticOverview: OverviewSchema.nullable(),
  coverage: z.object({
    passagesTotal: z.number(), passagesReviewed: z.number(),
    passagesWithRequestedLocale: z.number(), passagesWithFallbackLocale: z.number(),
    creatureConcepts: z.number(), textualOccurrences: z.number(),
  }),
});

export const AtlasResponseSchema = z.object({
  requestedLocale: LocaleSchema, detail: z.enum(["lite", "full"]),
  work: WorkCoreSchema.and(z.object({ id: z.string().uuid(), default_locale: LocaleSchema })),
  sources: z.array(SourceSchema),
  shanhaijing: ShanhaijingDomainSchema,
});

export const EntityDetailSchema = z.object({
  requestedLocale: LocaleSchema, kind: z.string(), slug: z.string(), fields: z.record(z.string(), z.string()),
});

export const SearchResponseSchema = z.object({
  locale: LocaleSchema, query: z.string(),
  items: z.array(z.object({
    kind: EntityTypeSchema, slug: z.string(), label: z.string(),
    context: z.string().nullable(), workSlug: z.string(),
  })),
});

export type WorksResponse = z.infer<typeof WorksResponseSchema>;
export type Atlas = z.infer<typeof AtlasResponseSchema>;
export type AtlasSource = Atlas["sources"][number];
export type ShanhaijingDomain = Atlas["shanhaijing"];
export type ShanhaijingSection = ShanhaijingDomain["sections"][number];
export type ShanhaijingCreature = ShanhaijingDomain["creatures"][number];
export type ShanhaijingPassage = ShanhaijingDomain["passages"][number];
export type ShanhaijingPlace = ShanhaijingDomain["places"][number];
export type ShanhaijingOccurrence = ShanhaijingDomain["occurrences"][number];
export type ShanhaijingTopologyEdge = ShanhaijingDomain["topologyEdges"][number];
export type EntityDetail = z.infer<typeof EntityDetailSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
