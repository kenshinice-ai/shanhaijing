-- 003: 分类词表
--
-- 迁移前 axis 与 term 是 shj_taxonomy_assignments 上的两列自由文本。后果有二:
-- 一是中文界面显示 `behavior / man eating` 这样的英文 slug——一个中文优先的图集,
-- 证据面板却是英文;二是没有任何东西阻止同义 term 各写各的("man_eating" 与
-- "maneating"),而 TAXONOMY.md §8 要求每个 term 都有定义、适用范围与双语评审。
--
-- 词表因此升为一等对象。约束 (axis, term) 的外键在 seed 005 装入词表之后建立,
-- 因为 bootstrap 先跑全部 migration 再跑 seed,此处建约束会让已有 assignment 先违约。

CREATE TABLE shj_taxonomy_axes (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  axis text NOT NULL CHECK (axis ~ '^[a-z][a-z0-9_]*$'),
  label_zh text NOT NULL CHECK (label_zh <> ''),
  label_en text NOT NULL CHECK (label_en <> ''),
  definition_zh text NOT NULL CHECK (definition_zh <> ''),
  definition_en text NOT NULL CHECK (definition_en <> ''),
  sequence integer NOT NULL,
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (axis),
  UNIQUE (work_id, sequence)
);

CREATE TABLE shj_taxonomy_terms (
  id uuid PRIMARY KEY,
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  axis text NOT NULL REFERENCES shj_taxonomy_axes(axis) ON UPDATE CASCADE,
  term text NOT NULL CHECK (term ~ '^[a-z][a-z0-9_]*$'),
  label_zh text NOT NULL CHECK (label_zh <> ''),
  label_en text NOT NULL CHECK (label_en <> ''),
  -- 定义写清"凭什么归到这一类",而不是把标签换个说法重说一遍。
  definition_zh text NOT NULL CHECK (definition_zh <> ''),
  definition_en text NOT NULL CHECK (definition_en <> ''),
  -- 该 term 至少需要何种证据才可指派;与 assignment 上的 source_attestation 对照。
  evidence_requirement text NOT NULL CHECK (evidence_requirement IN ('text_direct', 'commentary', 'research')),
  review_status text NOT NULL CHECK (review_status IN ('draft', 'reviewed', 'published')),
  UNIQUE (axis, term)
);

CREATE INDEX shj_taxonomy_terms_axis_idx ON shj_taxonomy_terms(axis, term);
