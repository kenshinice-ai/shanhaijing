# 《山海经 Atlas》独立仓库迁移方案

- 状态：`proposed`（等待主负责人批准后执行）
- 日期：2026-08-18
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 相关决策：SJ-D010、SJ-D011、SJ-D012；本方案获批后登记为 SJ-D013

## 1. 结论

**迁移可行且成本低。** 实测山海经的数据层与共享内核几乎解耦：四个 seed（`064–067`）只写入 `works`、`work_translations`、`sources`、`source_translations` 和 17 张 `shj_*` 表，**没有任何一行依赖 characters / events / locations / artworks / compositions 等其他作品的数据**。因此迁移不是"拆解纠缠的代码"，而是"复制一个很薄的内核 + 平移已经独立的领域模块"。

主要工作量在前端：共享 `types.ts` / `App.tsx` / `styles.css` 需要按 profile 裁剪，而不是整体复制。

## 2. 为什么现在迁移（可核验的证据）

| 问题 | 实测证据 |
|---|---|
| API payload 污染 | `/api/works/shanhaijing/atlas` 返回 24 个集合，其中 **21 个恒为空**（characters、artworks、compositions、scoreFragments…）。真正有内容的只有 `work`、`sources`(3)、`shanhaijing`(8 keys)。 |
| 构建产物混入 | 山海经静态构建 `dist` 约 **86MB**，其中绝大部分是美术史与音乐史的媒体；`apps/web/public/data/` 是各 profile 共用暂存目录，`deploy-static.sh` 不清空它。 |
| 迁移号竞争 | 本轮工作期间，另一条工作线在同一目录新增了 `022_bible_emblems_scripture_music.sql`。共享编号空间下，两条线并行必然抢号。 |
| 数据库耦合 | 单库 `literary_atlas` 已 **40MB / 66 个 seed**；山海经的一次 fresh bootstrap 必须先跑完其他五部作品的全部 migration 与 seed。 |
| 门禁互相牵连 | `npm test`、`typecheck`、`build` 覆盖全部 profile；山海经的一次改动要等其他作品一起验证。 |

## 3. 迁移边界

### 3.1 直接带走（原样平移，无需改写）

| 类别 | 文件 | 说明 |
|---|---|---|
| 领域 schema | `db/migrations/020_shanhaijing_domain.sql`、`021_shanhaijing_release_hardening.sql` | 合并重编为新库的 `002` |
| 领域数据 | `db/seeds/064–067` | 重编为新库的 `002–005`，内容不变 |
| API 领域模块 | `apps/api/src/shanhaijing.ts` | 233 行，零跨域引用 |
| 前端工作区 | `apps/web/src/components/ShanhaijingWorkspace.tsx` | 约 290 行，自包含 |
| 生成器与校验器 | `scripts/generate_shanhaijing_overview.ts`、`generate_shanhaijing_nanshan_full.ts`、`verify_shanhaijing.ts`、`verify_shanhaijing_docs.ts` | 仅需改 `ROOT` 与库名默认值 |
| 冻结语料 | `scripts/data/shanhaijing_nanshan_corpus_v2.json` | 60K，底本真源 |
| 资产 | `apps/web/public/media/shanhaijing/artistic-overview-v1.svg` | 84K，项目自绘 |
| 全部文档 | `docs/shanhaijing/**` | 512K，含本方案 |

### 3.2 抽取薄内核（从共享代码中裁剪，非整体复制）

新库只需要以下核心对象，可压平为一个 `001_core.sql`（预计 120–160 行，替代现有 `001–019` 共 19 个 migration）：

- 枚举：`locale_code`、`translation_status`、`content_mode`、`world_layer`、`work_category`（直接含 `mythography`）、`source_type`；
- 表：`schema_migrations`、`seed_history`、`works`、`work_translations`、`sources`、`source_translations`；
- **不带**：characters、events、locations、routes、relations、chronologies、media_assets、artists、artworks、music_*、PostGIS 扩展。

> PostGIS 可以整体去掉：山海经的坐标是 `layout_x/layout_y` 布局坐标，刻意不经过 PostGIS（见 `GEOGRAPHY_AND_MAPS.md` 三层地理规则）。这同时省掉 `verify:postgis` 门禁和数据库扩展依赖。

前端同理裁剪：
- `types.ts`：300 行 → 保留 work/source/locale 基础 schema + `Shanhaijing*` 共 24 行相关定义，删除 art/music/bible 的 zod 定义；
- `styles.css`：1607 行 → 保留设计令牌 + `shj-*` 共 136 行，删除地图/关系图/时间轴/乐谱等未使用样式；
- `App.tsx`：485 行 → 删除 Leaflet 地图、d3 关系图、时间轴、多作品切换；山海经 profile 不使用这些；
- `profile.ts` / `profile-meta.ts` / `epigraphs.ts`：退化为单作品常量，删除 PROFILES 多档机制；
- `i18n.ts`：保留通用 key 与山海经用到的 ENUMS。

**依赖收益**：可从 `package.json` 移除 `leaflet`、`d3-force`、`react-leaflet`、`supercluster`（如存在）等地图/图论依赖。

### 3.3 留在原仓库（不带走）

`EntityDrawer.tsx`、`GlobalSearch.tsx`、`RelationGraph.tsx`、`TimelineRibbon.tsx`、`hierarchy.ts`、`bake-static.ts` 的多作品分支等，均为共享内核，原仓库继续使用。新库按需重写精简版（抽屉与搜索需要重写，但只服务 creature/passage/place 三种实体，比现版简单得多）。

## 4. 目标仓库结构

```
shanhaijing-atlas/
├── apps/
│   ├── api/src/{index,app,db,config,shanhaijing,bake-static}.ts
│   └── web/src/{App,types,i18n,state,profile}.ts(x)
│       └── components/{ShanhaijingWorkspace,EntityDrawer,GlobalSearch}.tsx
│       └── public/media/shanhaijing/
├── db/
│   ├── migrations/001_core.sql, 002_shanhaijing_domain.sql
│   └── seeds/001_work.sql … 004_nanshan_full.sql
├── scripts/{generate_overview,generate_nanshan_full,verify_domain,verify_docs}.ts
│   └── data/nanshan_corpus_v2.json
├── docs/            ← 现 docs/shanhaijing/** 整体上移
├── deploy/deploy-static.sh   ← 单 profile，无分支判断
└── package.json     ← 脚本名去掉 :shanhaijing 后缀
```

数据库名：`shanhaijing_atlas`（与 `literary_atlas` 完全隔离）。

## 5. 分阶段执行方案

每阶段结束都必须有可核验产物；未通过不进入下一阶段。

### 阶段 0：冻结与备份（前置，约 15 分钟）

1. 原仓库推送当前 11 个未推送 commit，或至少确认工作区干净；
2. `pg_dump literary_atlas > backup/literary_atlas_pre_migration_2026-08-18.sql`；
3. 记录迁移基线：当前 verifier 报告的 43/43、23、24、39、36 六项计数与母图 SHA-256，作为迁移后的比对基准。

**验收**：备份文件存在且可 `pg_restore --list` 读出；基线数字写入本文件第 9 节。

### 阶段 1：新仓库骨架 + 内核 SQL（约半天）

1. `git init shanhaijing-atlas`（**放在 iCloud 同步目录之外**，见第 7 节风险）；
2. 复制 `package.json` / `tsconfig.base.json` / vite 配置并裁剪依赖；
3. 手写 `db/migrations/001_core.sql`（第 3.2 节对象清单），`002_shanhaijing_domain.sql` = 现 `020+021` 合并；
4. 新建 `shanhaijing_atlas` 库，跑 migration。

**验收**：fresh + repeat bootstrap 均退出 0；`\dt` 只列出 6 张核心表 + 17 张 `shj_*` 表。

### 阶段 2：数据平移（约半天）

1. seed `001_work.sql`（现 064 的 works/sources 部分 + 065 元数据）、`002_domain_v1.sql`、`003_svg_overview.sql`、`004_nanshan_full.sql`；
2. 平移 `scripts/data/nanshan_corpus_v2.json` 与两个生成器，改路径常量；
3. 平移 `verify_shanhaijing.ts` → `verify_domain.ts`，默认库名改为 `shanhaijing_atlas`。

**验收**：`npm run verify:domain` 在新库上 196 检查 0 错误；六项计数与阶段 0 基线**逐项相等**；重跑生成器产出的 SVG SHA-256 与基线一致（确定性未被破坏）。

### 阶段 3：API 与前端裁剪（1–2 天，工作量主要在这里）

1. `app.ts` 精简为单作品：`/api/works`、`/api/works/shanhaijing/atlas`、`/detail`、`/search`，删除 21 个空集合与其他领域分支；
2. `types.ts` 按 3.2 裁剪，zod schema 只保留实际返回的 8 个 key；
3. `App.tsx` 去掉地图/关系图/时间轴；`ShanhaijingWorkspace` 成为主视图；
4. 重写精简版 `EntityDrawer`（creature / passage / textual_place 三种）与 `GlobalSearch`；
5. `styles.css` 裁剪至令牌 + `shj-*`。

**验收**：`typecheck` 干净；`/atlas` 返回的 `shanhaijing` 域与旧仓库**逐 key 相同**（复用本轮 parity 脚本）；浏览器验收复跑本轮四项——39 标签零重叠、三张路线表 9/17/13、1280 与 390px 无横向溢出、console 零 error/warn。

### 阶段 4：静态构建与部署链（约半天）

1. `bake-static.ts` 去掉 `--works` 多值逻辑，固定单作品；
2. `deploy-static.sh` 去掉 profile 分支，CF 项目固定 `shanhaijing-atlas`；
3. **验证 dist 体积**——这是本次迁移的核心收益指标。

**验收**：`dist` 只含山海经数据与 `media/shanhaijing/`，**体积应从 86MB 降到 1MB 量级**；零 localhost 残留；dynamic/static parity 双语零差异。

### 阶段 5：文档收口与老仓库处理（约半天）

1. `docs/shanhaijing/**` 上移为新库 `docs/`，修正内部相对链接；
2. `verify_docs.ts` 的 `DOCS_ROOT` 改为新路径；HANDOFF 增加"迁移完成"章节，记录新仓库路径、commit、六项计数与 dist 体积；
3. 新库 `DECISION_LOG` 追加 SJ-D013（迁移决策，含本方案链接）；
4. 老仓库处理**另行授权**（见第 8 节）。

**验收**：`verify:docs` 通过；新库 HANDOFF 可独立读懂，不依赖老仓库上下文。

## 6. 工作量估计

| 阶段 | 估计 | 风险 |
|---|---|---|
| 0 冻结备份 | 15 min | 低 |
| 1 骨架 + 内核 SQL | 0.5 天 | 低 |
| 2 数据平移 | 0.5 天 | 低（seed 自包含，已验证） |
| 3 API + 前端裁剪 | 1–2 天 | **中**（抽屉与搜索需重写） |
| 4 构建与部署链 | 0.5 天 | 低 |
| 5 文档收口 | 0.5 天 | 低 |

合计约 **3–4 个工作日**。若接受阶段 3 先"整体复制再逐步裁剪"，可压缩到 2 天，代价是暂时保留死代码。

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| **iCloud 同步目录的 git 风险** | 2026-08-09 曾出现 `.git/refs` 权限错误导致无法建检查点（本轮已恢复，但根因是 iCloud）。**新仓库建议放在 `~/Projects/` 等非同步路径**，用 GitHub 远程做备份而非 iCloud。 |
| 裁剪时误删仍被引用的代码 | 每次裁剪后立即 `typecheck`；阶段 3 验收要求 payload 与旧仓库逐 key 相同，能捕获遗漏。 |
| 确定性被破坏 | 阶段 2 验收强制比对 SVG SHA-256 与六项计数，任何漂移立即暴露。 |
| 迁移期间双写 | 迁移窗口内**冻结老仓库的山海经改动**；老仓库该目录只读，所有新工作进新库。 |
| 老仓库删除过早 | 老仓库的山海经代码在迁移验收通过前**一律不删**；删除是独立授权的第 8 节动作。 |
| 语料底本丢失溯源 | `nanshan_corpus_v2.json` 的 note 字段已含底本、交叉核对源与两处校核裁定，随文件平移即可。 |

## 8. 老仓库清理（独立授权，不含在本方案执行范围内）

迁移验收通过并稳定运行一段时间后，可在老仓库执行（**需另行明确授权**）：

- 删除 `docs/shanhaijing/`、`scripts/*shanhaijing*`、`scripts/data/shanhaijing_*`、`apps/api/src/shanhaijing.ts`、`ShanhaijingWorkspace.tsx`、`apps/web/public/media/shanhaijing/`；
- 从 `app.ts`、`types.ts`、`profile.ts`、`profile-meta.ts`、`epigraphs.ts`、`styles.css`、`App.tsx`、`GlobalSearch.tsx`、`EntityDrawer.tsx` 移除 shanhaijing 分支；
- `deploy-static.sh` 移除 shanhaijing profile；
- `package.json` 移除两个 verify 脚本；
- **保留** `db/migrations/020/021` 与 `db/seeds/064–067`：它们已在 `schema_migrations` / `seed_history` 登记，删除会破坏老库的 bootstrap 幂等性。正确做法是保留文件并在文件头加注"已迁出，勿再演进"。

红楼梦（`blueprint/dream-of-the-red-chamber/`、`RedChamberPrototype.tsx`、`red-chamber-fixture.ts`）已由用户单开项目，可在同一次清理中一并移除，其历史保留在 commit `36c92ad`。

## 9. 迁移基线（阶段 0 填写，迁移后逐项比对）

| 指标 | 迁移前基线 | 迁移后实测 |
|---|---|---|
| corpus coverage | 43 / 43 | `pending` |
| unique creature concepts | 23 | `pending` |
| textual occurrences | 24 | `pending` |
| textual places | 39 | `pending` |
| topology edges | 36 | `pending` |
| sections | 3 | `pending` |
| 母图 SHA-256 | `6e6b4eee30d40944420e8c72f3ed5d09fd6d97ab8f548a9ad433d58b1d89b5b3` | `pending` |
| domain verifier | 196 检查 0 错误 | `pending` |
| dist 体积 | 86 MB（含其他 profile 资产） | `pending`（目标 < 2 MB） |

## 10. 本方案的批准

本文件为 `proposed`。执行前需要主负责人确认三件事：

1. 新仓库路径（建议非 iCloud 同步目录）与是否立即建 GitHub 远程；
2. 阶段 3 采用"精简重写"（更干净，1–2 天）还是"整体复制后裁剪"（更快，但暂留死代码）；
3. 老仓库清理是否在本次一并执行，还是等新库稳定后另行授权（建议后者）。

批准后在 `DECISION_LOG.md` 登记 SJ-D013，并把本文件状态改为 `accepted`。
