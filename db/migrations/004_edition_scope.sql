-- 004: 底本的适用范围
--
-- 迁移前 baseline 是全作品唯一的:verify:domain 要求「有且仅有一个 is_baseline」。
-- 那在只有《南山经》时成立,一旦《西山经》以自己的底本、自己的来源、自己的 checksum
-- 冻结进来就不成立了——两篇各有底本,不是谁替换谁。
--
-- 因此 baseline 的唯一性下沉到 scope:每个 scope 有且仅有一个 baseline。
-- 已冻结的南山经底本除了多一列 scope 之外分毫未动,其 checksum 覆盖的是语料文本,
-- 不受加列影响。

ALTER TABLE shj_text_editions
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'nanshan'
    CHECK (scope ~ '^[a-z][a-z0-9_]*$');

COMMENT ON COLUMN shj_text_editions.scope IS
  '底本覆盖的篇目范围（nanshan / xishan / …）。baseline 唯一性按 scope 判定。';

-- 旧索引把 baseline 限制在每个作品一个,正是本次要放宽的那一条,必须先撤。
DROP INDEX IF EXISTS shj_text_editions_one_baseline_per_work;

-- 每个 scope 至多一个 baseline;不同 scope 之间互不排斥。
CREATE UNIQUE INDEX IF NOT EXISTS shj_text_editions_one_baseline_per_scope
  ON shj_text_editions(work_id, scope) WHERE is_baseline;
