# 《山海经 Atlas》阶段交接

- 状态：`review_ready`
- 当前阶段：Phase 1 / V2 南山经全篇语料已实现；项目已迁出为独立仓库
- Gate 状态：内部工程门槛已由主负责人签署放行（SJ-D012）；外部机构签署仍 `pending`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 最后更新：2026-08-18

## 0.0 2026-08-18 仓库迁移：已抽出为独立仓库

本项目已从多图集 monorepo「The Bible Atlas」抽出为独立仓库 `ShanHaiJing`，数据库改为独立的
`shanhaijing_atlas`。六项计数、母图 SHA-256 与语料 seed checksum 迁移前后**逐字节一致**；
`dist` 从 86 MB 降至 716 KB，atlas payload 顶层集合从 24 个（21 个恒空）降至 5 个。
迁移中修复了跨山系段落排序未定义与烘焙目录跨图集污染两个真实缺陷。

完整证据与差异归因见 [MIGRATION_RECORD_2026-08-18.md](MIGRATION_RECORD_2026-08-18.md)；
决策为 SJ-D013。下文各节的文件路径按新仓库结构理解：`docs/shanhaijing/**` 现为 `docs/**`，
`db/migrations/020+021` 现为 `002_shanhaijing_domain.sql`，`db/seeds/064–067` 现为 `001–004`，
`verify:shanhaijing` 现为 `verify:domain`，`verify:shanhaijing-docs` 现为 `verify:docs`。

## 0.1 2026-08-18 发布前修复：测试、生僻字、地图标签

迁移完成后按用户「先修再发」的授权处理了三项：

1. **测试套件补回**。迁移把原仓库的 5 个 Vitest 套件全数落下，根级 `npm test` 直接 exit 1。
   已迁回并改写与本仓库相关的 API 契约测试（locale 解析、非法 locale 400、未知 work 404、
   未知实体类型 400、空搜索词 400、未路由 404），另为新的标签几何写了 14 项：
   共 24 项通过。
2. **扩展 B 区空框**（SJ-D014）。八个生僻字随站点分发 4 KB 子集字体，`𪁺𩿧` 等不再是空框。
3. **地图标签重叠**。路线距离与节点名此前各自按固定偏移落点，互不知情，实测重叠英文 36 对、
   中文 27 对。改为纯函数确定性避让（`apps/web/src/map-labels.ts`）：节点名先在自己的
   上下档位中挑不撞的，路线距离再沿曲线找空位，找不到就取重叠面积最小的一处——从不丢弃距离。
   实测降为中文 0 对、英文 2 对（最坏为两个长英文名擦边 18×6 px）。该缺陷同样存在于原仓库。

前两项与第三项均为**既有缺陷**而非迁移引入：字体栈与标签放置代码在两个仓库逐字节相同。

## 0. 2026-08-18 实现快照：V1 垂直试点（鹊山首列）

本节记录 2026-08-15 后按用户授权完成的实现，修正下文 2026-08-15 版本中"尚未实现 schema/code"的过时表述。下文第 1–9 节保留为 Gate 0 文档阶段的历史记录；凡与本节冲突处，以本节为准。

已实现并装载（本地共享库 `literary_atlas`，seed_history 登记于 2026-08-18 00:46）：

- `db/migrations/020_shanhaijing_domain.sql`：17 张 `shj_*` 领域表 + `mythography` 类目；
- `db/migrations/021_shanhaijing_release_hardening.sql`：移除 hobbit 特例约束、补版本溯源与审校字段；
- `db/seeds/064_shanhaijing_v1.sql` / `065_shanhaijing_release_metadata.sql`：《南山经》鹊山首列 9 段公版文本（逐段 SHA-256）、9 异兽概念、9 处文本地点、9 次提及、8 条拓扑边、19 条分类指派、9 条段落审计、10 条编辑决策、1 条异文记录；全部双语翻译 published（此处 published 指产品内部编辑候选通道，不代表外部学术背书）；
- `apps/api/src/shanhaijing.ts` + `app.ts` 接入：atlas/detail/search 域内加载；
- `apps/web/src/components/ShanhaijingWorkspace.tsx` + profile/搜索/题词/样式接入：`shanhaijing` profile 可运行，艺术总览暂以结构化拓扑替代（`shj_artistic_overviews.status='blocked_missing_api_key'`）；
- 实现检查点 commit：`5591228`（feat(shanhaijing): V1 vertical pilot for the first Queshan route）。

### 0.1 同日续做：V2 全篇语料、领域 verifier、SVG 母图与 parity

在上述 V1 快照之后，同日完成 V2 并全部落库：

- **语料扩量**：`db/seeds/067_shanhaijing_nanshan_full.sql` 覆盖《南山经》全部 43 段（三列山系 + 三段祠礼 + 结语），segmentation 升级为 `nanshan-full-v2`。底本校核冻结于 `scripts/data/shanhaijing_nanshan_corpus_v2.json`（ctext 底稿、维基文库交叉核对、两处校核裁定登记为异文），seed 由 `scripts/generate_shanhaijing_nanshan_full.ts` 确定性产出，构建时断言每条引文均为原文连续子串并从段首自解析方向与里距。
- **当前计数**（由 `verify:shanhaijing` 报告，勿手抄）：43/43 段落已审核、23 个异兽概念、24 次文本提及、39 个文本地点、36 条拓扑边、3 个山系 section。凤皇在丹穴与南禺两次出现，鹓鶵为「仅名无描述」的 provisional 概念——两者共同实证 concept/occurrence 分离。
- **领域 verifier**：`npm run verify:shanhaijing`（196 检查 0 错误）。首跑即抓出 V1 两处数据缺陷（鯥的拼接引文、九尾狐 surface form 不在原文），已修正并重放。
- **隔离库**：`literary_atlas_shj_iso_20260818` 上 migration `001–021` + seed `001–067` 的 fresh/repeat bootstrap 均通过，见 [generated/isolated-bootstrap-2026-08-18.md](generated/isolated-bootstrap-2026-08-18.md)。
- **艺术总览**：按 SJ-D011 改为项目自绘的确定性程序化 SVG 母图（`scripts/generate_shanhaijing_overview.ts` → `apps/web/public/media/shanhaijing/artistic-overview-v1.svg`），seed `066` 记录发布态与生成器 checksum；工作区以母图为底、程序叠加热点与图例。
- **静态 parity**：dynamic 与 static 双语逐 key 零差异，见 [generated/static-parity-2026-08-18.md](generated/static-parity-2026-08-18.md)；`deploy/deploy-static.sh` 已补 `shanhaijing` profile 分支（CF 项目名 `shanhaijing-atlas`，**未创建、未部署**）。
- **顺带修复的既有缺陷**：API 领域 loader 有两处查询传了 3 个绑定参数却只用 2 个占位符，导致 `/atlas` 动态接口此前从未成功返回过；SVG 母图的 `soft` 滤镜区域对扁椭圆过窄，被裁成硬边横带；`.shj-workspace` 的 grid 子项 `min-width:auto` 让路线表的窄屏 min-width 漏到文档层，造成 390px 横向溢出。

仍未实现/未运行：性能基准、无障碍与 reduced-data 报告、staging/production。外部机构签署仍 pending（主负责人内部签署见 SJ-D012）。发布前还需处理 `dist/` 混入其他 profile 资产的既有问题（见 parity 报告「已知问题」）。

数字来源：所有计数以 `generated/domain-verification.json` 为准；本文件不手抄会漂移的数值。

## 1. Scope / completed

本交接只描述《山海经 Atlas》文档优先阶段的真实范围。当前已创建、完成机械跨文档一致性检查并可送专家评审的文档包括：

- `README.md`：导航、Gate 0 原则和文档状态约定；
- `PRODUCT_BLUEPRINT.md`：产品边界、受众、旅程和成功指标；
- `CORPUS_AND_EDITORIAL_POLICY.md`：底本、段落、引文、异文和归并/排除规则；
- `CONTENT_COVERAGE_MATRIX.md`：篇章 inventory、occurrence/concept/coverage 分离与生成统计契约；
- `ENTITY_AND_DATA_DICTIONARY.md`：领域实体、字段、状态和关系候选；
- `TAXONOMY.md`：多轴分类、证据和未定项规则；
- `GEOGRAPHY_AND_MAPS.md`：文本拓扑、学术候选和现代对照三层地图规则；
- `REFERENCE_MAP_AUDIT.md`：参考地图的来源、权利、投影和借鉴边界登记框架；
- `CHRONOLOGY_MODEL.md`：内部序列、成书/编订、版本/注本、图像/研究/资产四轴时间模型；
- `VISUAL_DESIGN_SYSTEM.md`：构图、色彩、排版、地图符号、响应式和可访问性候选规范；
- `MEDIA_ICON_ILLUSTRATION_POLICY.md`：媒体角色、depiction、provenance、rights、alt 和 fail-closed 规则；
- `SOUND_RECONSTRUCTION_POLICY.md`：声音证据、推演等级、生成 manifest、披露、播放和无障碍规则；
- `ARCHITECTURE.md`：共享 Atlas Core、Shanhaijing 一方模块、registry、API、Web、static bake 和缓存边界；
- `API_CONTRACT.md`：lite/full/detail/search/map/media/sound/error/locale 与 dynamic/static parity 候选契约；
- `ASSET_MANIFEST_SPEC.md`：资产 identity、目录、checksum、衍生 DAG、发布清单和撤回处理；
- `PERFORMANCE_BUDGETS.md`：100/500/1000+ fixture、payload、地图、媒体、内存、浏览器和报告预算候选；
- `TEST_AND_VERIFICATION_PLAN.md`：数据库、语料、分类、地理、时间、registry、API、parity、媒体、声音、性能、响应式、无障碍和五层证据矩阵；
- `REVIEWER_ASSIGNMENTS_2026-08-15.md`：项目责任 reviewer、外部签署候选与权威网站/标准基线；
- `MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md`：艺术总览与四类权威证据视图、renderer 和 scale path；
- `FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md`：超级幻想拼接母图的构图、生成 prompt、程序叠加和免责声明；
- `FANTASY_COMPOSITE_MAP_GENERATION_STATUS.md`：ImageGen CLI 请求、目标输出和 `blocked_missing_api_key` 证据；
- `REFERENCE_MAP_AUDIT.md#map-001`：用户网图的内部参考限定、checksum 与 fail-closed 裁决；
- `scripts/verify_shanhaijing_docs.ts`：必备文件、链接、元数据、canonical 状态/证据枚举、核心统计术语、独立证据维度和治理 ID 校验器；
- `generated/document-consistency.json` 与 `.md`：文档机械一致性的 `local_candidate` 机器证据与可读摘要；
- 本文件：阶段状态、证据索引、风险和下一 owner/action。

以上专题文档现为 `review_ready`、`local_candidate`。机械一致性通过不等于专家批准，也不代表 schema、migration、seed、API、UI、资产、声音、领域 verifier、benchmark、built static artifact、staging 或 production 已实现。

## 2. Evidence

### 2.1 已存在的文档证据

| 证据 | 路径 | 当前解释 |
|---|---|---|
| 核心蓝图 | `docs/shanhaijing/memoized-riding-giraffe.md` | 唯一权威规划输入；不是实现证据 |
| 领域规范 | `docs/shanhaijing/*.md` | 候选 contracts/policies；机械一致性已通过，待专家评审 |
| 测试总矩阵 | `docs/shanhaijing/TEST_AND_VERIFICATION_PLAN.md` | 规划了正/负 fixture、环境 Gate、报告和停止条件；命令尚未实现 |
| 性能候选 | `docs/shanhaijing/PERFORMANCE_BUDGETS.md` | 候选指标和测量方法；没有 Shanhaijing baseline 或 pass |
| 资产契约 | `docs/shanhaijing/ASSET_MANIFEST_SPEC.md` | 候选资产/权利/撤回契约；没有 Shanhaijing manifest 或 verifier |
| API 契约 | `docs/shanhaijing/API_CONTRACT.md` | 候选 endpoint/schema/parity 契约；没有 Shanhaijing API |
| Reviewer 指定 | `docs/shanhaijing/REVIEWER_ASSIGNMENTS_2026-08-15.md` | 项目责任角色已指定；外部人工签署仍 pending |
| 地图实现策略 | `docs/shanhaijing/MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md` | 艺术总览 + 四类权威证据视图的候选实现 |
| 幻想总图美术方向 | `docs/shanhaijing/FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md` | 生成 prompt、热点叠加、disclosure 与发布门槛 |
| 幻想总图生成状态 | `docs/shanhaijing/FANTASY_COMPOSITE_MAP_GENERATION_STATUS.md` | CLI 可用；API key 缺失；图像尚未生成 |
| 参考图 MAP-001 | `docs/shanhaijing/REFERENCE_MAP_AUDIT.md#map-001` | 仅内部视觉参考；rights/source/geography 均不作为结论 |
| 文档一致性 JSON | `docs/shanhaijing/generated/document-consistency.json` | 机器真源；结果与 counts 以该报告为准 |
| 文档一致性摘要 | `docs/shanhaijing/generated/document-consistency.md` | 可读摘要；结果 `pass`，Gate 仍为 `blocked` |

### 2.2 可复用但不属于 Shanhaijing 证据的仓库基线

仓库已有 Vitest、PostGIS verifier、static bake、European art/media verifier、Bible visual media verifier 与 European music manifest verifier。这些文件只能作为工程方法和共享 Atlas 回归基线：

- `apps/api/src/app.test.ts`、`apps/api/src/locale.test.ts`；
- `apps/web/src/*.test.ts`；
- `scripts/verify_postgis.sh`；
- `scripts/verify_artwork_media.ts`；
- `scripts/verify_bible_visual_media.ts`；
- `scripts/verify_european_music.ts`；
- `apps/api/src/bake-static.ts`。

它们未覆盖 Shanhaijing 的 corpus inventory、occurrence/concept separation、三层地理、四轴 chronology、领域 registry、候选 API、媒体语义、声音推演或 100/500/1000+ 基准。现有命令若通过，不得写入本项目为 Shanhaijing pass。

### 2.3 当前不存在的证据

以下项目当前均为 `not_implemented` 或 `not_run`，没有真实报告：

- Shanhaijing corpus/taxonomy/geography/media/sound/domain migration/seed fresh/repeat isolated database；
- 冻结底本、篇章、passage inventory 与 coverage checksum；
- occurrence/concept/editorial decision 数据及 completeness report；
- taxonomy、geography、chronology 专项 verifier；
- domain registry completeness test；
- Shanhaijing API、static bake、built static artifact 与 parity report；
- Shanhaijing image/icon/map/audio manifest、公开文件清单与 rights verifier；
- sound generation/audio profile/loop/loudness/单轨浏览器证据；
- 100/500/1000+ performance、memory、browser、a11y 和 reduced-data report；
- staging deployment、production authorization、rollback、version manifest 与 production smoke。

报告生成后必须把路径、输入 checksum、命令、退出码、evidence level 和 reviewer 写入本文件或由生成的 evidence index 引用；不在此手抄会漂移的 counts、媒体字节或性能数值。

## 3. Findings

- 共享 monorepo + Atlas Core + first-party Shanhaijing domain module 的方向与现有架构兼容，但需要先建立可测试的领域 registry，避免 API、搜索、drawer、选择和 static bake 出现静默遗漏。
- 语料必须先于名物扩量；`unique creature concepts`、`textual occurrences` 和 `corpus coverage` 必须保持三个独立统计维度。
- 文本拓扑不等于经纬度，学术 candidate 不等于唯一历史地望，现代底图只作对照；三层必须在数据和 UI 同时可区分。
- 内部篇章 ordinal、成书/编订假说、注本/版本日期、视觉/研究/资产日期不能压成一条公元时间轴；异兽不得获得伪生卒年。
- 资产的 `rights_status`、`interpretation_class`、`source_attestation` 和 `geographic_confidence` 必须独立，缺失/拒绝资产必须 fail closed 并从 public/build/CDN 路径移除或隔离。
- 声音波形即使有原文声描写，也通常只是类比推演或艺术演绎；不得展示为古代真实录音、真实叫声或确定复原。
- 当前性能候选值没有基线支撑；旧文档中约 666 KiB 的主 JS 数字只能作为待复测回归线索。
- 文档一致性校验已于 2026-08-15 通过；具体输入、检查数、结果和 checksum 以 `generated/document-consistency.json` 为准。
- 项目责任 reviewer 已按权威网站/标准指定；外部学术、法律、母语、辅助技术和真实性能签署尚未完成，因此 Gate 0 继续 `blocked`。
- 用户提供的 MAP-001 已审计为 `internal_reference_only`；它可启发幻想总图的信息密度，但不是最终设计、资产权利、地望或坐标结论。
- 地图采用双轨制：超级幻想拼接总图负责震撼入口，原文路线、学术候选地、现代对照、版本与图像负责权威证据出口。
- ImageGen production prompt、3840×2160/high 请求和输出路径已固定，CLI dry-run 已通过；当前 `OPENAI_API_KEY` 缺失，因此真实 API 调用、图像、manifest 与视觉 QA 均未运行。
- UI UX Pro Max 当前未安装，须另行审查来源、许可、安装清单并取得项目级授权；它不是 Gate 0 自动批准条件。

## 4. Assumptions / unverified

- 尚未冻结作为 passage inventory 真源的底本、校勘体系、版本 checksum、切分规则和 Pilot 篇章。
- 尚未确认英译范围、可发布短引文边界和具体 glossary；中英文 reviewer 角色已指定，但外部人工签署 pending。
- 尚未确认 candidate set 的学术体系、地望 confidence 评定责任和 GeoJSON/projection contract。
- 尚未确认声音 Phase 1 的技术 profile、响度/peak/duration/loop 阈值、声学类比来源和审核人。
- 尚未确认 100/500/1000+ fixture 的生成器、设备/浏览器/network matrix、重复次数和 blocking budget。
- 尚未确认 dynamic/static parity 的全量比较范围、抽样规则、artifact 保留期限和撤回验证方式。
- 尚未确认领域 registry 的最终 required cells、`not_applicable` 允许范围与共享 API/Web 目录边界。
- 尚未建立 Shanhaijing 的独立 writable checkpoint；现有 dirty worktree 包含 Bible visual pilot 等用户更改，必须逐文件保留。
- 尚未执行本项目的 schema、code、asset generation、deployment 或 production smoke。

## 5. Risks

当前风险按 [RISK_REGISTER.md](RISK_REGISTER.md) 的正式条目维护；以下仅列与本次交接相关的阻断摘要，不替代风险登记：

- 底本或段落切分未冻结会使所有 coverage 数字失去可比性；
- 归并/拆分缺乏决策记录会使 concept 与 occurrence 统计不可审计；
- 精细现代地图可能制造古代地望确定性的错误印象；
- 多轴分类若被实现成单选树会丢失复合实体与未知状态；
- registry 漏接一个 kind 即可造成 search/drawer/static/media 的静默缺口；
- 未核权图像、地图或声音进入 public 目录会造成不可逆发布暴露；
- 声音推演、AI/程序生成资产和外部素材存在真实性误解与权利链风险；
- 1000+ 地图、标签、媒体和全量 payload 可能超过移动端预算；
- 双语 fallback 可能掩盖未审核或未发布翻译；
- 现有 dirty worktree 与未来 migration/UI 修改可能相互覆盖；
- 生产发布若无独立授权、rollback 和版本 manifest，无法形成可追责证据。

正式风险必须补充概率、影响、触发器、缓解、owner、状态、到期时间和 decision-log 引用后，才能解除对应阻断。

## 6. Recommended decisions

1. 维持 Gate 0 `blocked`；文档、机械一致性与项目 reviewer 指定已完成，下一门槛是外部人工签署和 Gate 0 输入冻结。
2. 在任何 schema/code 前冻结 edition、passage segmentation、occurrence/concept 规则、Pilot scope、reviewer、枚举和报告 schema。
3. 采用 inventory-first 的垂直 Pilot：冻结篇章 passage 100% 审计，再串通 occurrence → concept → taxonomy → topology → candidate → media/icon → sound。
4. 先实现可测试的 registry completeness contract，再扩展 API、Web、static bake 和媒体聚合；不在 `app.ts`、drawer 或搜索中继续添加孤立分支。
5. 先用确定性 DSP/合成 recipe 验证声音链路，保持显式播放、全局单轨、无 autoplay、持续 disclosure 和文字替代。
6. 先获取可重复的 100/500/1000+ baseline，再决定 Leaflet/Supercluster、Canvas/WebGL、MapLibre/vector tiles 或 worker/partition 演进。
7. 任何 rights denied/withdrawn asset 都从 JSON、public、build、precache 和 CDN 可达路径移除或隔离；合法文本实体仍可在无媒体状态下发布。
8. 生产部署另行授权；生产前必须有 isolated DB、built static artifact、staging、rollback、version manifest 和 smoke 证据。

## 7. Next steps + owner

| 顺序 | 下一动作 | owner | 完成证据 |
|---|---|---|---|
| 1 | 联系并取得古籍、历史地理、法律、母语、无障碍与性能外部 reviewer 签署 | 主负责人 + 外部专家 | `EXPERT_REVIEW_QUESTIONS.md` disposition 与具名记录 |
| 2 | 冻结 edition、passage segmentation、Pilot scope、枚举和报告 schema | 主负责人 + reviewer | `DECISION_LOG.md` 批准记录与输入 checksum |
| 3 | 配置可用的 `OPENAI_API_KEY` 后执行已批准的 ImageGen CLI 请求 | 主负责人 + `R-CLASSICS` + `R-RIGHTS` | 图像、manifest、prompt、checksum 与人工检查 |
| 4 | 建立独立 writable checkpoint，并记录 dirty worktree 边界 | 主负责人 | checkpoint、commit 和范围说明 |
| 5 | 仅在用户批准 Gate 0 退出后实现 schema/code | 主负责人 | 明确授权、branch/checkpoint、decision log |

当前不开始 migration、seed、API、UI、资产生成、benchmark 或 Cloudflare 部署。

## 8. Explicit incomplete items

- [ ] MAP-001 已登记为内部视觉参考，但其作者、来源和权利仍未知，不能作为数据或公开资产。
- [ ] 底本、段落 inventory、Pilot 篇章和 corpus checksum 未冻结。
- [ ] 所有 Shanhaijing migration、seed、schema、API、Web adapter、registry、static bake 尚未实现。
- [ ] 除文档一致性校验外，Shanhaijing 领域 verifier、fixture、benchmark 和对应生成报告尚未实现或运行。
- [ ] `HANDOFF_TEMPLATE.md`、`DECISION_LOG.md`、`RISK_REGISTER.md`、`EXPERT_REVIEW_QUESTIONS.md`、`RELEASE_CHECKLIST.md` 已创建并通过机械 consistency pass，但尚未完成专家评审或冻结。
- [ ] 幻想拼接总图美术方向、production prompt 和可复现命令已建立；因 API key 缺失，图像、热点 overlay、manifest 和视觉审核尚未生成。
- [ ] 领域媒体、图标、权威地图数据、音频、波形和 release manifest 尚不存在。
- [ ] 项目 reviewer 已指定，但外部专家签署、双语实样审校、逐资产版权审核、声学 profile 审核和辅助技术实测尚未进行。
- [ ] local candidate 之外的 isolated database、built static artifact、staging、production 证据尚不存在。
- [ ] 没有生产授权、回滚方案、版本 manifest、Cloudflare 项目或 production smoke 记录。
- [ ] 本文件未冻结，不得被引用为实现完成或发布完成证明。

## 9. Handoff acceptance

本文件由下一次交接更新时补充：

- `handoffRevision`：`SJ-HANDOFF-004`
- `inputChecksums`：文档输入 checksum 已记录于 `generated/document-consistency.json`；corpus/edition 输入仍为 `not_frozen`
- `evidenceIndex`：`docs/shanhaijing/generated/document-consistency.json`
- `reviewer`：项目责任角色已指定；主负责人内部签署 `signed`（2026-08-18，SJ-D012）；外部人工签署 `pending`
- `reviewDisposition`：内部工程门槛 `released`；外部机构签署门槛 `blocked`
- `imageGeneration`：production prompt 与 CLI dry-run 已完成；`blocked_missing_api_key`
- `nextOwner`：主负责人
- `nextAction`：性能与无障碍基准；《西山经》语料扩量；生产发布授权（SJ-D006）
- `updatedAt`：2026-08-18

在外部人工签署、冻结输入和明确 Gate 授权未填充前，本文件保持 `review_ready`、`local_candidate`、`blocked`。统计区必须由生成报告提供，禁止手工补写“已完成”数字。
