# 《山海经 Atlas》独立仓库迁移记录

- 状态：`completed`
- 日期：2026-08-18
- 决策：SJ-D013
- 方案：`MIGRATION_PLAN_2026-08-18.md`
- 证据层级：`local_candidate`

## 1. 结果

《山海经 Atlas》已从多图集 monorepo「The Bible Atlas」抽出为独立仓库
`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/ShanHaiJing`，
数据库为独立的 `shanhaijing_atlas`。方案第 9 节的全部基线指标逐项达成或改善：

| 指标 | 迁移前基线 | 迁移后实测 | 结论 |
|---|---|---|---|
| corpus coverage | 43 / 43 | 43 / 43 | 一致 |
| unique creature concepts | 23 | 23 | 一致 |
| textual occurrences | 24 | 24 | 一致 |
| textual places | 39 | 39 | 一致 |
| topology edges | 36 | 36 | 一致 |
| sections | 3 | 3 | 一致 |
| 母图 SHA-256 | `6e6b4eee…d1d89b5b3` | `6e6b4eee…d1d89b5b3` | **逐字节一致** |
| 语料 seed edition checksum | `824c1e36…4dc0a6a3` | `824c1e36…4dc0a6a3` | **逐字节一致** |
| domain verifier | 196 检查 0 错误 | 196 检查 0 错误 | 一致 |
| dist 体积 | 86 MB（含其他图集资产） | **716 KB** | 目标 < 2 MB，达成 |
| 主 JS bundle | 605.7 KB | **298.5 KB** | 去掉地图/图论依赖 |
| atlas payload 顶层集合 | 24 个（21 个恒空） | **5 个（全部有内容）** | 污染消除 |
| migration 数量 | 21 个（共享） | **2 个** | 内核压平 |
| 数据库 | `literary_atlas` 40 MB / 66 seed | `shanhaijing_atlas` / 4 seed | 隔离 |

两个生成器在新仓库重跑后输出与迁移前**逐字节一致**，确定性在迁移中完好无损。

## 2. 结构

```
ShanHaiJing/
├── apps/api/src/    app.ts shanhaijing.ts bake-static.ts db-cli.ts config.ts db.ts index.ts locale.ts
├── apps/web/src/    App.tsx api.ts types.ts state.ts i18n.ts base.css styles.css
│                    components/{ShanhaijingWorkspace,EntityDrawer,GlobalSearch}.tsx
├── db/migrations/   001_core.sql  002_shanhaijing_domain.sql
├── db/seeds/        001_work_and_v1_domain … 004_nanshan_full
├── scripts/         generate_overview.ts generate_nanshan_full.ts
│                    verify_domain.ts verify_docs.ts data/nanshan_corpus_v2.json
├── docs/            本目录（原 docs/shanhaijing 整体上移）
└── deploy/          deploy-static.sh
```

## 3. 内核抽取

`001_core.sql`（约 80 行）取代原仓库的 19 个共享 migration，只保留领域实际引用的对象：
`locale_code`、`translation_status`、`content_mode`、`world_layer`、`work_category`、`source_type`
六个枚举，`schema_migrations`、`seed_history`、`works`、`work_translations`、`sources`、
`source_translations` 六张表。

**PostGIS 已整体移除**。领域坐标是 `layout_x/layout_y` 布局坐标，按 `GEOGRAPHY_AND_MAPS.md`
的三层地理规则刻意不经过 PostGIS，因此新库不再需要该扩展，`verify:postgis` 门禁一并去掉。

`002_shanhaijing_domain.sql` 是原 `020`（领域表）与 `021`（发布加固）的忠实合并；两处语句被
有意省略：向共享枚举添加 `mythography` 的 `ALTER TYPE`，以及修复 `works` 遗留 CHECK 的补丁——
内核已直接声明正确形态。

## 4. 迁移中发现并修复的缺陷

1. **跨山系段落排序未定义**。`shanhaijing.ts` 的段落与提及查询按 `p.sequence` 排序，而
   sequence 在每列山系内重新计数，因此 43 段的跨山系顺序取决于数据库返回顺序。迁移时的
   parity 比对暴露了它（旧库返回 zhaoyao → tianyu → jushan → daoguo…，新库返回按山系有序）。
   已修正为 `ORDER BY s.sequence, p.sequence`。**同一缺陷仍存在于原仓库**。
2. **烘焙暂存目录跨图集污染**。`apps/web/public/data/` 曾由所有图集共用且部署脚本从不清空，
   任一图集的 `dist` 都会带上其他图集的 JSON 与媒体。新部署脚本在烘焙前清空该目录，并断言
   `dist/data` 不含非山海经文件。

## 5. 旧库数据漂移（记录，不影响新库）

parity 比对同时发现旧 `literary_atlas` 库的两处漂移：section 摘要与旋龟 occurrence 的
`surface_form`/`evidence_note` 停留在 seed `064` 的值，而非 `065` 的最终值。原因是修复 V1 数据
缺陷时手动重放了 `064`，覆盖了 `065` 已写入的更新。**新库按 seed 顺序装载，是正确的最终状态**；
旧库若继续使用需重放 `065–067`。

## 6. 验收证据

- 数据库：fresh migration + 4 个 seed 装载，`verify:domain` 196 检查 0 错误。
- 生成器：母图与语料 seed 重跑后 checksum 与迁移前一致。
- API：`/api/works/shanhaijing/atlas` 返回 5 个顶层 key；与旧仓库烘焙产物逐 key 比对，
  差异仅三类且全部归因——生成器改名（有意）、旧库漂移（第 5 节）、段落排序修复（第 4 节）；
  段落内容按 slug 匹配后**零字段差异**。
- 前端：typecheck 干净；39 热点 / 39 标签**零重叠**；三张路线表 9/17/13；
  1280px 与 390px 均无文档级横向溢出；console 零 error/warn；抽屉、搜索、语言切换实测正常。
- 静态：dynamic/static parity 双语**零差异**；`dist` 716 KB，仅含本图集数据与媒体；
  预览站点网络请求只命中自身 `/data` 与 `/media`，**零 API 调用**。

## 7. 未随迁移改变的事项

- 外部机构签署仍 `pending`（SJ-D012），对外文案不得声称机构或专家认可。
- 生产发布仍需独立授权（SJ-D006）；Cloudflare 项目 `shanhaijing-atlas` **尚未创建、未部署**。
- 性能、无障碍与 reduced-data 报告仍未生成。
- 原仓库的山海经代码**未删除**，按方案第 8 节属独立授权动作；其 `db/migrations/020/021` 与
  `db/seeds/064–067` 已登记在该库的 `schema_migrations`/`seed_history`，删除会破坏其 bootstrap
  幂等性，正确做法是保留文件并加注「已迁出，勿再演进」。
