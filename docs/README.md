# 《山海经 Atlas》文档中心

## 核心蓝图

本目录所有规范与后续实施均以 [memoized-riding-giraffe.md](memoized-riding-giraffe.md) 为唯一核心蓝图。其他文件负责把蓝图中的规则拆成可评审、可执行、可验证的专题契约；若专题文档与核心蓝图冲突，以核心蓝图为准，并在 `DECISION_LOG.md` 记录修订，不静默改写方向。

## 当前状态

- 阶段：Phase 1 / V2（《南山经》全篇语料已实现并通过隔离库与领域验证）。
- 证据层级：`local_candidate`。
- 仓库：本项目已于 2026-08-18 从多图集 monorepo 抽出为独立仓库，详见 [MIGRATION_RECORD_2026-08-18.md](MIGRATION_RECORD_2026-08-18.md)。
- 已实现：领域 schema、全篇语料 seed、领域 verifier、API、Web 工作区、程序化 SVG 艺术总览、静态烘焙与 parity。
- 尚未开始：媒体与音频资产、性能与无障碍基准、staging 与 production 部署。
- 尚未冻结：其余篇目（西山经及以后）的底本与切分、权威地望 candidate set、性能预算、外部机构签署。
- 一致性状态：`npm run verify:docs` 已通过；报告见 [generated/document-consistency.md](generated/document-consistency.md)。
- 领域验证：`npm run verify:domain` 已通过；报告见 [generated/domain-verification.md](generated/domain-verification.md)。
- Gate 状态：内部工程门槛已由主负责人签署放行（SJ-D012）；外部机构签署仍 `pending`，生产发布另需授权（SJ-D006）。

## 不可变执行原则

1. 文档优先，Gate 0 通过前不改业务行为。
2. 语料先于名物，不以著名异兽清单代替逐段 inventory。
3. `unique creature concepts`、`textual occurrences`、`corpus coverage` 分别统计。
4. 文本提及是证据，概念归并是编辑决定；两者必须分离并可追溯。
5. 文本拓扑、学术候选地、现代底图严格分层。
6. 内部篇章顺序、成书编订、注本版本、图像研究四条时间轴不得混用。
7. `source_attestation`、`interpretation_class`、`geographic_confidence`、`rights_status` 相互独立。
8. 图片、图标、地图和声音必须有 provenance、rights、解释等级与 checksum；不完整时 fail closed。
9. 声音模拟不得描述为古代真实录音或确定复原。
10. 所有覆盖率、数量、媒体字节和验证结果由工具生成，不手工声称完成。
11. local candidate、isolated database、built static artifact、staging、production 五级证据分别记录。
12. production 部署必须取得单独明确授权。

## 必备文件清单

按以下顺序逐份检查和冻结。`review_ready` 只表示机械内部检查通过，不表示专家批准或实现已开始；相关实施必须保持阻断，直到 Gate 0 通过。

| 顺序 | 文件 | 目的 | 状态 |
|---:|---|---|---|
| 0 | [memoized-riding-giraffe.md](memoized-riding-giraffe.md) | 唯一核心实施蓝图 | 已建立 |
| 1 | `README.md` | 导航、状态、执行纪律 | 当前文件 |
| 2 | `PRODUCT_BLUEPRINT.md` | 产品目标、受众、信息架构、旅程、指标 | `review_ready` |
| 3 | `CORPUS_AND_EDITORIAL_POLICY.md` | 底本、段落、异文、翻译、归并与排除 | `review_ready` |
| 4 | `CONTENT_COVERAGE_MATRIX.md` | 篇章 inventory 与机器生成统计入口 | `review_ready` |
| 5 | `ENTITY_AND_DATA_DICTIONARY.md` | 实体、字段、枚举、约束、稳定标识 | `review_ready` |
| 6 | `TAXONOMY.md` | 多轴分类词表与 assignment 规则 | `review_ready` |
| 7 | `GEOGRAPHY_AND_MAPS.md` | 三层地理模型、地图模式与规模策略 | `review_ready` |
| 8 | `REFERENCE_MAP_AUDIT.md` | 参考地图来源、权利和可借鉴范围 | `review_ready` |
| 9 | `CHRONOLOGY_MODEL.md` | 四轴时间模型 | `review_ready` |
| 10 | `VISUAL_DESIGN_SYSTEM.md` | 布局、色彩、排版、响应式和无障碍 | `review_ready` |
| 11 | `MEDIA_ICON_ILLUSTRATION_POLICY.md` | 图像角色、图标职责、权利和披露 | `review_ready` |
| 12 | `SOUND_RECONSTRUCTION_POLICY.md` | 声音证据、推演、生成与播放规则 | `review_ready` |
| 13 | `ARCHITECTURE.md` | Atlas Core 注册契约与领域边界 | `review_ready` |
| 14 | `API_CONTRACT.md` | lite/detail/search/map/audio/static 契约 | `review_ready` |
| 15 | `ASSET_MANIFEST_SPEC.md` | 资产路径、命名、checksum 与衍生链 | `review_ready` |
| 16 | `PERFORMANCE_BUDGETS.md` | 基线、100/500/1000+ 基准与阻断阈值 | `review_ready` |
| 17 | `TEST_AND_VERIFICATION_PLAN.md` | 数据、契约、UI、权利和部署测试矩阵 | `review_ready` |
| 18 | `HANDOFF.md` | 当前状态、证据索引和明确未完成项 | `review_ready` |
| 19 | `HANDOFF_TEMPLATE.md` | 协作者统一八段交接格式 | 已建立 |
| 20 | `DECISION_LOG.md` | 决策、依据、替代关系与影响 | `review_ready` |
| 21 | `RISK_REGISTER.md` | 风险、触发器、缓解、owner 和状态 | `review_ready` |
| 22 | `EXPERT_REVIEW_QUESTIONS.md` | 各领域待专家裁决问题 | `review_ready` |
| 23 | `RELEASE_CHECKLIST.md` | 五级证据与发布门禁 | `review_ready` |
| 24 | `REVIEWER_ASSIGNMENTS_2026-08-15.md` | reviewer 责任、外部签署候选和权威网站基线 | `review_ready` |
| 25 | `MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md` | 艺术总览 + 四类权威证据视图、renderer 分层与规模演进 | `review_ready` |
| 26 | `FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md` | 超级幻想拼接总图、程序叠加与免责声明 | `review_ready` |
| 27 | `FANTASY_COMPOSITE_MAP_GENERATION_STATUS.md` | ImageGen 请求、环境阻断和可复现命令 | `review_ready` |
| 28 | [generated/README.md](generated/README.md) | 机器生成报告目录规则 | 已建立 |

## 文档状态词

- `draft`：已写入但尚未完成内部一致性检查。
- `review_ready`：内部检查通过，可交给相应专家评审。
- `frozen`：已记录批准者、日期与适用输入版本，可作为实现契约。
- `blocked`：存在停止条件，不得进入依赖步骤。
- `superseded`：已被 `DECISION_LOG.md` 中明确记录的新版本替代。

专题文件应在开头标明状态、证据层级、核心蓝图和未决事项。没有评审记录的文档不得标记为 `frozen`。

## 机器生成报告

所有 coverage、rights、missing/stale、媒体大小、性能和 static parity 报告进入 [generated/](generated/README.md)。文档一致性校验器已实现并生成 [JSON](generated/document-consistency.json) 与 [Markdown](generated/document-consistency.md) 报告；其余规划命令仍为待实现契约。

## 下一步

项目责任 reviewer 与权威来源基线已在 `REVIEWER_ASSIGNMENTS_2026-08-15.md` 指定。下一步逐项处理 `EXPERT_REVIEW_QUESTIONS.md`，取得外部人工签署，并冻结 edition、passage segmentation、Pilot scope、canonical enums 与报告 schema。Gate 0 获得明确授权前，不进入 schema/code。
