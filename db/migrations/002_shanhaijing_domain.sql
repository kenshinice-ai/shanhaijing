BEGIN;

/*
  Shanhaijing domain schema.

  Faithful merge of the source repository's migrations 020 (domain tables) and
  021 (release hardening). Two statements from those files are intentionally
  absent here: the ALTER TYPE that added 'mythography' to a shared enum, and
  the repair that dropped a legacy per-slug CHECK from `works` — 001_core.sql
  declares both correctly from the start.

  The hardening ALTERs are kept as ALTERs rather than folded into the CREATE
  TABLE bodies so this file stays a verbatim, reviewable merge of two audited
  migrations rather than a hand-retyped schema.
*/

CREATE TABLE shj_text_editions (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  title text NOT NULL,
  source_url text NOT NULL,
  source_note text NOT NULL DEFAULT '',
  rights_status text NOT NULL CHECK (rights_status IN ('verified', 'pending', 'rejected', 'unknown')),
  checksum_sha256 text CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[0-9a-f]{64}$'),
  is_baseline boolean NOT NULL DEFAULT false,
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (work_id, slug)
);

CREATE TABLE shj_text_sections (
  id uuid PRIMARY KEY,
  edition_id uuid NOT NULL REFERENCES shj_text_editions(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES shj_text_sections(id) ON DELETE SET NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  sequence integer NOT NULL CHECK (sequence > 0),
  reference_label text NOT NULL,
  title_zh text NOT NULL,
  title_en text NOT NULL,
  summary_zh text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (edition_id, slug),
  UNIQUE (edition_id, sequence)
);

CREATE TABLE shj_text_passages (
  id uuid PRIMARY KEY,
  section_id uuid NOT NULL REFERENCES shj_text_sections(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  reference_key text NOT NULL,
  sequence integer NOT NULL CHECK (sequence > 0),
  text_zh text NOT NULL,
  normalized_text_zh text NOT NULL,
  source_url text NOT NULL,
  checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (section_id, slug),
  UNIQUE (section_id, reference_key),
  UNIQUE (section_id, sequence)
);

CREATE TABLE shj_passage_translations (
  passage_id uuid NOT NULL REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  editorial_note text NOT NULL DEFAULT '',
  status translation_status NOT NULL DEFAULT 'draft',
  PRIMARY KEY (passage_id, locale)
);

CREATE TABLE shj_creatures (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  concept_status text NOT NULL CHECK (concept_status IN ('resolved', 'provisional', 'disputed', 'superseded')),
  importance smallint NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  icon_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (work_id, slug)
);

CREATE TABLE shj_creature_translations (
  creature_id uuid NOT NULL REFERENCES shj_creatures(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  summary text NOT NULL,
  detail text NOT NULL DEFAULT '',
  status translation_status NOT NULL DEFAULT 'draft',
  PRIMARY KEY (creature_id, locale)
);

CREATE TABLE shj_textual_places (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  place_kind text NOT NULL CHECK (place_kind IN ('mountain', 'mountain_range', 'river', 'water_source', 'marsh', 'sea', 'region', 'route_node', 'unknown')),
  layout_x numeric(7,3) NOT NULL CHECK (layout_x BETWEEN 0 AND 100),
  layout_y numeric(7,3) NOT NULL CHECK (layout_y BETWEEN 0 AND 100),
  layout_space text NOT NULL DEFAULT 'textual-layout-v1',
  sort_order integer NOT NULL DEFAULT 0,
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (work_id, slug)
);

CREATE TABLE shj_textual_place_translations (
  place_id uuid NOT NULL REFERENCES shj_textual_places(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  summary text NOT NULL,
  status translation_status NOT NULL DEFAULT 'draft',
  PRIMARY KEY (place_id, locale)
);

CREATE TABLE shj_place_mentions (
  place_id uuid NOT NULL REFERENCES shj_textual_places(id) ON DELETE CASCADE,
  passage_id uuid NOT NULL REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  surface_form text NOT NULL,
  mention_order integer NOT NULL DEFAULT 0 CHECK (mention_order >= 0),
  PRIMARY KEY (place_id, passage_id, mention_order)
);

CREATE TABLE shj_creature_occurrences (
  id uuid PRIMARY KEY,
  creature_id uuid NOT NULL REFERENCES shj_creatures(id) ON DELETE CASCADE,
  passage_id uuid NOT NULL REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  place_id uuid REFERENCES shj_textual_places(id) ON DELETE SET NULL,
  surface_form text NOT NULL,
  quote_zh text NOT NULL,
  occurrence_order integer NOT NULL CHECK (occurrence_order > 0),
  source_attestation text NOT NULL CHECK (source_attestation IN ('text_direct', 'commentary', 'research', 'none')),
  interpretation_class text NOT NULL CHECK (interpretation_class IN ('transcription', 'editorial_summary', 'scholarly_hypothesis', 'artistic_interpretation')),
  confidence text NOT NULL CHECK (confidence IN ('high', 'medium', 'low', 'unknown')),
  evidence_note text NOT NULL DEFAULT '',
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (passage_id, occurrence_order)
);

CREATE TABLE shj_topology_edges (
  id uuid PRIMARY KEY,
  section_id uuid NOT NULL REFERENCES shj_text_sections(id) ON DELETE CASCADE,
  from_place_id uuid NOT NULL REFERENCES shj_textual_places(id) ON DELETE CASCADE,
  to_place_id uuid NOT NULL REFERENCES shj_textual_places(id) ON DELETE CASCADE,
  passage_id uuid NOT NULL REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  relation_kind text NOT NULL CHECK (relation_kind IN ('next_in_route', 'distance_direction', 'source_of', 'flows_into', 'surrounds', 'passes_through', 'adjacent_to', 'unresolved_relation')),
  direction_text text NOT NULL DEFAULT '',
  distance_value numeric,
  distance_unit text NOT NULL DEFAULT '',
  sequence integer NOT NULL CHECK (sequence > 0),
  interpretation_class text NOT NULL CHECK (interpretation_class IN ('transcription', 'editorial_summary', 'scholarly_hypothesis', 'artistic_interpretation')),
  conflict_status text NOT NULL DEFAULT 'none' CHECK (conflict_status IN ('none', 'disputed', 'unresolved')),
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  CHECK (from_place_id <> to_place_id),
  UNIQUE (section_id, sequence)
);

CREATE TABLE shj_taxonomy_assignments (
  id uuid PRIMARY KEY,
  creature_id uuid NOT NULL REFERENCES shj_creatures(id) ON DELETE CASCADE,
  passage_id uuid REFERENCES shj_text_passages(id) ON DELETE SET NULL,
  axis text NOT NULL,
  term text NOT NULL,
  source_attestation text NOT NULL CHECK (source_attestation IN ('text_direct', 'commentary', 'research', 'none')),
  interpretation_class text NOT NULL CHECK (interpretation_class IN ('transcription', 'editorial_summary', 'scholarly_hypothesis', 'artistic_interpretation')),
  confidence text NOT NULL CHECK (confidence IN ('high', 'medium', 'low', 'unknown')),
  evidence_note text NOT NULL DEFAULT '',
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (creature_id, axis, term, passage_id)
);

CREATE TABLE shj_artistic_overviews (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  status text NOT NULL CHECK (status IN ('planned', 'blocked_missing_api_key', 'generated', 'reviewed', 'published', 'withdrawn')),
  interpretation_class text NOT NULL DEFAULT 'artistic_interpretation' CHECK (interpretation_class = 'artistic_interpretation'),
  coordinate_space text NOT NULL DEFAULT 'artistic-composite-v1',
  asset_url text,
  prompt_path text NOT NULL,
  prompt_sha256 text NOT NULL CHECK (prompt_sha256 ~ '^[0-9a-f]{64}$'),
  title_zh text NOT NULL,
  title_en text NOT NULL,
  description_zh text NOT NULL,
  description_en text NOT NULL,
  disclosure_zh text NOT NULL,
  disclosure_en text NOT NULL,
  UNIQUE (work_id, slug),
  CHECK ((status IN ('generated', 'reviewed', 'published') AND asset_url IS NOT NULL) OR status NOT IN ('generated', 'reviewed', 'published'))
);

CREATE INDEX shj_passages_section_sequence_idx ON shj_text_passages(section_id, sequence);
CREATE INDEX shj_occurrences_creature_idx ON shj_creature_occurrences(creature_id, occurrence_order);
CREATE INDEX shj_occurrences_passage_idx ON shj_creature_occurrences(passage_id);
CREATE INDEX shj_places_work_order_idx ON shj_textual_places(work_id, sort_order);
CREATE INDEX shj_edges_section_sequence_idx ON shj_topology_edges(section_id, sequence);
CREATE INDEX shj_taxonomy_creature_axis_idx ON shj_taxonomy_assignments(creature_id, axis);

-- ---- release hardening (was migration 021) ----

ALTER TABLE shj_text_editions
  ADD COLUMN IF NOT EXISTS edition_reference text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsible_editor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS retrieved_at date,
  ADD COLUMN IF NOT EXISTS source_file_checksum_sha256 text
    CHECK (source_file_checksum_sha256 IS NULL OR source_file_checksum_sha256 ~ '^[0-9a-f]{64}$'),
  ADD COLUMN IF NOT EXISTS transcription_checksum_sha256 text
    CHECK (transcription_checksum_sha256 IS NULL OR transcription_checksum_sha256 ~ '^[0-9a-f]{64}$'),
  ADD COLUMN IF NOT EXISTS license_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS segmentation_version text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewer_role text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewed_at date;

ALTER TABLE shj_text_editions
  DROP CONSTRAINT IF EXISTS shj_text_editions_one_baseline_per_work;

CREATE UNIQUE INDEX IF NOT EXISTS shj_text_editions_one_baseline_per_work
  ON shj_text_editions(work_id)
  WHERE is_baseline;

ALTER TABLE shj_text_passages
  ADD COLUMN IF NOT EXISTS source_locator text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS normalization_version text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS start_char integer
    CHECK (start_char IS NULL OR start_char >= 0),
  ADD COLUMN IF NOT EXISTS end_char integer
    CHECK (end_char IS NULL OR end_char >= 0);

ALTER TABLE shj_passage_translations
  ADD COLUMN IF NOT EXISTS translation_kind text NOT NULL DEFAULT 'original_editorial_summary',
  ADD COLUMN IF NOT EXISTS glossary_version text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS translator_or_editor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewer_role text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewed_at date;

ALTER TABLE shj_creature_translations
  ADD COLUMN IF NOT EXISTS translation_kind text NOT NULL DEFAULT 'original_editorial_summary',
  ADD COLUMN IF NOT EXISTS glossary_version text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS translator_or_editor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewer_role text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewed_at date;

ALTER TABLE shj_textual_place_translations
  ADD COLUMN IF NOT EXISTS translation_kind text NOT NULL DEFAULT 'original_editorial_summary',
  ADD COLUMN IF NOT EXISTS glossary_version text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS translator_or_editor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewer_role text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewed_at date;

ALTER TABLE shj_creature_occurrences
  ADD COLUMN IF NOT EXISTS start_char integer
    CHECK (start_char IS NULL OR start_char >= 0),
  ADD COLUMN IF NOT EXISTS end_char integer
    CHECK (end_char IS NULL OR end_char >= 0);

ALTER TABLE shj_place_mentions
  ADD COLUMN IF NOT EXISTS start_char integer
    CHECK (start_char IS NULL OR start_char >= 0),
  ADD COLUMN IF NOT EXISTS end_char integer
    CHECK (end_char IS NULL OR end_char >= 0);

/*
  The passage audit is the denominator authority for corpus coverage.  It is
  intentionally separate from public visibility and translation status.
*/
CREATE TABLE IF NOT EXISTS shj_passage_audits (
  passage_id uuid PRIMARY KEY REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  audit_status text NOT NULL CHECK (audit_status IN ('pending_review', 'reviewed', 'excluded')),
  segmentation_version text NOT NULL,
  input_checksum_sha256 text NOT NULL CHECK (input_checksum_sha256 ~ '^[0-9a-f]{64}$'),
  reviewer_role text NOT NULL,
  reviewed_at date,
  evidence_note text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS shj_editorial_decisions (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  decision_key text NOT NULL CHECK (decision_key ~ '^[a-z0-9-]+$'),
  decision_type text NOT NULL CHECK (decision_type IN ('canonical_name', 'merge', 'split', 'variant', 'occurrence', 'exclusion', 'topology')),
  subject_kind text NOT NULL CHECK (subject_kind IN ('passage', 'creature', 'occurrence', 'place', 'taxonomy', 'topology')),
  subject_ref text NOT NULL,
  decision_status text NOT NULL CHECK (decision_status IN ('provisional', 'accepted', 'superseded')),
  rationale text NOT NULL,
  evidence_note text NOT NULL DEFAULT '',
  reviewer_role text NOT NULL,
  decided_at date NOT NULL,
  UNIQUE (work_id, decision_key)
);

CREATE TABLE IF NOT EXISTS shj_occurrence_candidates (
  id uuid PRIMARY KEY,
  passage_id uuid NOT NULL REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  surface_form text NOT NULL,
  start_char integer CHECK (start_char IS NULL OR start_char >= 0),
  end_char integer CHECK (end_char IS NULL OR end_char >= 0),
  disposition text NOT NULL CHECK (disposition IN ('included', 'excluded', 'pending_review', 'not_applicable')),
  creature_id uuid REFERENCES shj_creatures(id) ON DELETE SET NULL,
  occurrence_id uuid REFERENCES shj_creature_occurrences(id) ON DELETE SET NULL,
  evidence_note text NOT NULL DEFAULT '',
  reviewer_role text NOT NULL,
  reviewed_at date
);

CREATE TABLE IF NOT EXISTS shj_text_variants (
  id uuid PRIMARY KEY,
  passage_id uuid NOT NULL REFERENCES shj_text_passages(id) ON DELETE CASCADE,
  occurrence_candidate_id uuid REFERENCES shj_occurrence_candidates(id) ON DELETE SET NULL,
  variant_form text NOT NULL,
  variant_type text NOT NULL CHECK (variant_type IN ('orthographic', 'edition_reading', 'editorial_normalization', 'unresolved')),
  source_note text NOT NULL,
  decision_key text,
  reviewer_role text NOT NULL,
  reviewed_at date
);

CREATE INDEX IF NOT EXISTS shj_passage_audits_status_idx
  ON shj_passage_audits(audit_status, segmentation_version);
CREATE INDEX IF NOT EXISTS shj_occurrence_candidates_passage_idx
  ON shj_occurrence_candidates(passage_id, disposition);
CREATE INDEX IF NOT EXISTS shj_editorial_decisions_subject_idx
  ON shj_editorial_decisions(work_id, subject_kind, subject_ref);
CREATE INDEX IF NOT EXISTS shj_text_variants_passage_idx
  ON shj_text_variants(passage_id, variant_type);

INSERT INTO schema_migrations(version) VALUES ('002_shanhaijing_domain');

COMMIT;
