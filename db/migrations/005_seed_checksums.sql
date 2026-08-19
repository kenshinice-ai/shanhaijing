-- 005: seed 按内容记账，不按文件名

-- 迁移前 seed_history 只记文件名，于是**改过的 seed 永不重跑**。这不是理论问题：
-- 007 依赖 005 新增的分类词条，而 005 在既有库上被判为「已应用」跳过，
-- 007 遂被外键挡下——空库能装、既有库装不上，两条路径的结果不一样。
--
-- migration 仍然是只进不改的：schema 变更不可重放。seed 不同，每一条都写成
-- ON CONFLICT DO UPDATE，本就可重入；因此改判为按内容记账——
-- 文件字节变了就重跑，没变就跳过（CI 的「重放不产生第二次写入」照旧成立）。

ALTER TABLE seed_history
  ADD COLUMN IF NOT EXISTS checksum_sha256 text;

COMMENT ON COLUMN seed_history.checksum_sha256 IS
  'seed 文件内容的 SHA-256；为空表示记录早于本迁移，下次运行会重放一次并补上。';
