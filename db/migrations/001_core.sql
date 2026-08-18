BEGIN;

/*
  Shanhaijing Atlas core schema.

  This replaces the nineteen shared migrations of the multi-work monorepo the
  project was extracted from. Only the objects the Shanhaijing domain actually
  references are kept: the work identity, its bilingual translation, its
  sources, and the two history tables the migration runner needs.

  Deliberately absent: characters, events, locations, routes, relations,
  chronologies, media_assets, and the art/music domains — the Shanhaijing seeds
  never wrote a single row into any of them. PostGIS is absent too, because the
  domain's coordinates are layout coordinates that must never be mistaken for
  WGS84 geography (see docs/GEOGRAPHY_AND_MAPS.md).
*/

CREATE TABLE schema_migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE seed_history(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());

CREATE TYPE locale_code AS ENUM ('zh-CN', 'en');
CREATE TYPE translation_status AS ENUM ('draft', 'reviewed', 'published');
CREATE TYPE content_mode AS ENUM ('documented_record', 'literary_narrative');
CREATE TYPE world_layer AS ENUM ('real', 'fictional');
CREATE TYPE work_category AS ENUM ('mythography');
CREATE TYPE source_type AS ENUM ('primary_text', 'scholarly', 'historical', 'reference', 'map', 'image');

CREATE TABLE works (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  author_name text NOT NULL,
  publication_year integer,
  content_mode content_mode NOT NULL,
  map_layer world_layer NOT NULL,
  default_locale locale_code NOT NULL DEFAULT 'zh-CN',
  launch_rank integer NOT NULL UNIQUE,
  mode_reason text NOT NULL,
  category work_category NOT NULL DEFAULT 'mythography',
  origin_region text NOT NULL DEFAULT 'unknown',
  chronology_start_year integer,
  chronology_end_year integer,
  theme_color text NOT NULL DEFAULT '#B86B3D',
  theme_color_dark text NOT NULL DEFAULT '#2A2E29',
  theme_color_light text NOT NULL DEFAULT '#E6C98D',
  CONSTRAINT works_map_layer_valid CHECK (map_layer IN ('real', 'fictional')),
  CONSTRAINT works_chronology_years_nonzero CHECK (chronology_start_year IS NULL OR chronology_start_year <> 0),
  CONSTRAINT works_chronology_end_nonzero CHECK (chronology_end_year IS NULL OR chronology_end_year <> 0),
  CONSTRAINT works_chronology_order CHECK (chronology_start_year IS NULL OR chronology_end_year IS NULL OR chronology_end_year >= chronology_start_year),
  CONSTRAINT works_theme_color_format CHECK (theme_color ~ '^#[0-9A-Fa-f]{6}$' AND theme_color_dark ~ '^#[0-9A-Fa-f]{6}$' AND theme_color_light ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE work_translations (
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  status translation_status NOT NULL DEFAULT 'draft',
  PRIMARY KEY (work_id, locale)
);

CREATE TABLE sources (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text,
  citation text NOT NULL,
  evidence_grade text NOT NULL CHECK (evidence_grade IN ('primary', 'scholarly', 'reference')),
  source_type source_type NOT NULL DEFAULT 'reference'
);

CREATE TABLE source_translations (
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  locale locale_code NOT NULL,
  title text NOT NULL,
  citation text NOT NULL DEFAULT '',
  status translation_status NOT NULL DEFAULT 'draft',
  PRIMARY KEY (source_id, locale)
);

INSERT INTO schema_migrations(version) VALUES ('001_core');

COMMIT;
