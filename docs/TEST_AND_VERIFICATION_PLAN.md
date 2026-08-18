# 《山海经 Atlas》测试与验证计划

- 状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- Gate 状态：`blocked`
- 证据层级：`local_candidate`
- 唯一实施蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)

## 1. 用途与证据边界

本文统一《山海经 Atlas》的数据库、语料、编辑、领域注册、API、静态产物、地图、媒体、声音、性能、浏览器、无障碍与发布验证。它把每一类检查绑定到冻结输入、执行环境、自动断言、人工复核、证据产物与停止条件，供后续各 Gate 使用。

当前仓库只有可借鉴的 Vitest、PostGIS 集成脚本、静态 bake 和其他领域资产 verifier。尚未实现任何 Shanhaijing schema、migration、seed、fixture、API、UI、静态分片、资产管线、测试命令、benchmark、生成报告、isolated database、staging 或 production 验证。本文件中的命令、矩阵、阈值和报告路径均为候选契约，不是已运行或已通过的证据。

文档存在、Markdown 链接通过、旧领域测试通过或单次本地观察，均不能使 Gate 0 通过，也不能升级为更高证据层级。

## 2. 验证原则

1. **同源验证**：dynamic API 与 static artifact 使用同一 publication view、schema family、identity、serializer、排序、计数与 rights gate。
2. **语料优先**：先验证冻结 edition、section 与 passage inventory，再验证 occurrence、concept 和媒体覆盖。
3. **数量分离**：`unique creature concepts`、`textual occurrences` 与 `corpus coverage` 分别计算、分别报告、分别比对。
4. **证据维度独立**：`source_attestation`、`interpretation_class`、`geographic_confidence`、`rights_status` 和 `review_status` 不互相推导。
5. **不确定性不丢失**：未知、争议、多候选、未翻译、无媒体和无坐标是可测试状态，不用伪造值消除空缺。
6. **fail closed**：rights、provenance、manifest、checksum、披露或发布条件不完整时，不暴露受限资产；仅从 JSON 隐藏路径不足以通过。
7. **负例优先**：每个 verifier 必须有应失败的 fixture，并证明自身会以非零状态退出，而不是只验证 happy path。
8. **自动与人工互补**：自动检查验证结构、约束、确定性和机器可测行为；古籍编辑、地望、语义误导、视觉质量、声学合理性与可访问体验仍需具名 reviewer。
9. **证据不可越级**：低层结果不能代表高层环境；截图不能替代 contract、trace、network、accessibility tree 或 production smoke。
10. **统计由机器生成**：JSON 为统计真源，Markdown 摘要从 JSON 生成；HANDOFF 和 release checklist 只引用报告与 checksum。

## 3. 状态与判定词汇

### 3.1 检查结果

| 值 | 含义 |
|---|---|
| `not_implemented` | 检查、fixture 或命令尚不存在 |
| `not_run` | 已实现但未在声明环境执行 |
| `pass` | 声明输入与环境下全部阻断断言通过 |
| `warn` | 非阻断项偏离目标，已有 owner 与期限 |
| `fail` | 至少一项阻断断言失败 |
| `blocked` | 前置输入、环境、reviewer 或授权不满足，禁止执行或晋级 |
| `waived` | 经批准的限时例外；不是 `pass` |

`not_implemented`、`not_run`、`warn`、`blocked` 和 `waived` 均不得表述为“验证通过”。

### 3.2 证据层级

| 层级 | 最低含义 | 禁止外推 |
|---|---|---|
| `local_candidate` | 本地文档、unit/contract fixture 或本地服务结果 | 不代表隔离数据库、构建产物或远端环境 |
| `isolated_database` | 从空库 bootstrap 的隔离 PostGIS 实例及其报告 | 不代表实际静态包或 CDN |
| `built_static_artifact` | 已构建、从独立目录提供并验证的 immutable static candidate | 不代表 staging 路由、缓存或平台行为 |
| `staging` | 版本锁定的 staging deployment、远端 smoke 与证据 | 不代表 production |
| `production` | 获得单独授权后，对已发布版本执行 production smoke | 不代表长期正确或免除监控 |

报告必须只声明其实际达到的最高层级，并保留所有较低层报告的引用。

## 4. 测试层级与责任边界

| 层级 | 主要对象 | 典型执行者 | 主要产物 |
|---|---|---|---|
| L0 文档/静态 lint | 链接、必填章节、枚举引用、生成区标记 | 工程 | 文档检查报告 |
| L1 unit/schema | 纯函数、Zod/JSON Schema、serializer、identity | 工程 | Vitest/JUnit/JSON |
| L2 component/contract | loader、registry、HTTP contract、rights derivation | 工程 | contract JSON + Markdown |
| L3 isolated integration | migration、seed、PostGIS、文件系统、bake | 工程/数据 | isolated DB 与 artifact 报告 |
| L4 browser/performance | 用户旅程、响应式、a11y、network、trace、memory | 工程/设计/a11y | 浏览器矩阵与 benchmark |
| L5 editorial/expert | 语料、归并、地望、权利、声学、双语 | 具名专家/reviewer | review disposition |
| L6 release smoke | staging/production 路由、缓存、撤回、回滚 | release owner | smoke 与版本 manifest |

自动检查不得自动批准 L5；L5 意见也不得替代数据库约束、checksum 或浏览器行为证据。

## 5. 冻结输入与可重复性

每次可晋级验证必须锁定并记录：

- repository commit 或候选 revision，以及 dirty-worktree 差异说明；
- blueprint、数据字典、API、asset manifest 和性能预算版本/checksum；
- edition、corpus inventory、segmentation 与 editorial rule set 版本/checksum；
- migration 集合、seed/generator 版本和输入 checksum；
- schema/publication revision、profile、locale 与 feature flags；
- Node/npm/PostgreSQL/PostGIS、浏览器、OS、device/network profile；
- dynamic base URL、static artifact root、staging/production release ID；
- asset release manifest、public-file inventory 和撤回列表；
- fixture ID、规模、seed、warm/cold cache 状态与重复次数；
- 执行时间、命令、退出码、报告 checksum 和 reviewer。

同一输入重复执行必须产生稳定 identity、排序、counts、canonical JSON 和文件 checksum；明确允许变化的 timestamp 必须隔离在非规范化元数据中。

## 6. Fixture 体系

### 6.1 最小正例 fixture

最小垂直 fixture 至少包含：

- 两个 section、多个 passage 和一个明确无异兽的 passage；
- 同一 concept 的多次 occurrence、异名归并、同名拆分和一个 `unresolved` concept；
- 一个被排除的疑似提及及其 editorial decision；
- 多轴、多值、`unknown` taxonomy assignment；
- 无绝对坐标的 topology chain、冲突 edge、0 个候选地点和多候选地点；
- 至少两个互相一致的 candidate set，以及点、线、面 GeoJSON；
- 四条 chronology axis，各含 dated、interval、ordinal 或 undated 代表项；
- published/draft/missing translation 和合法 fallback；
- verified media、无媒体实体、pending/denied media、withdrawn derivative；
- text-attested sound evidence 与明确属于推演/艺术演绎的音频输出；
- searchable alias、passage、place、taxonomy term 与跨 kind relation。

### 6.2 规模 fixture

按 [PERFORMANCE_BUDGETS.md](PERFORMANCE_BUDGETS.md) 生成确定性的 `100`、`500`、`1000+` 与 corpus-derived stress tier。每级分别提供：

- point-heavy、line-heavy、polygon-heavy；
- topology-heavy、label-heavy、filter-heavy；
- bilingual 与 fallback-heavy；
- media-rich 与 media-empty；
- cold/warm cache 变体。

不得只复制同一 feature 来制造规模；fixture 的 geometry、标签、关系、筛选和 detail 分布必须能触发真实工作路径。

### 6.3 强制失败 fixture

至少包含：

- passage 缺 audit status、occurrence 孤儿、concept 归并无 decision；
- 将 occurrence 数误报为 concept 数、分母更换后仍声称 coverage 完成；
- taxonomy term/axis 不存在、assignment 缺 evidence 或错误强制单选；
- topology edge 缺 passage、非法距离/方向、环路被静默修正；
- GeoJSON 非法、经纬度越界、candidate 缺 claimant/source/confidence、set 混搭；
- creature 使用伪 BCE/CE lifespan，或 internal ordinal 被序列化为公历年；
- registry kind 缺 search/drawer/media/bake/selection/schema 任一 required cell；
- unsupported locale、draft translation 被 fallback、未知 kind/slug、非法 bbox/filter/cursor；
- dynamic/static identity、排序、count、search hit、map feature 或 path 不一致；
- checksum 错误、DAG 环路、stale/orphan derivative、路径穿越、MIME/signature 不符；
- denied/withdrawn 文件仍可通过 public URL 获取；
- sound 缺 disclaimer、rights、文本替代、generator/recipe，或 profile/LUFS/peak/loop 不合格；
- autoplay、多轨并行、reduced-data 仍预取大媒体；
- performance blocking budget 超限且无有效 waiver。

CI/发布报告必须显示这些 fixture 确实被拒绝；若 verifier 对负例返回成功，verifier 自身判为 `fail`。

## 7. 数据库与迁移矩阵

| 对象 | 自动验证 | 人工/证据 | 阻断条件 |
|---|---|---|---|
| fresh bootstrap | 空 PostGIS 实例按编号执行全部 migration + seed | 保存版本、日志、schema dump checksum | 任一失败或依赖本机残留状态 |
| repeat bootstrap | 对已 bootstrap 的隔离库按约定重复执行 | 记录幂等策略与第二次结果 | 重复数据、非预期 mutation、不可解释失败 |
| migration ordering | 编号唯一、依赖存在、升级路径确定 | 审查 rollback/forward-fix 说明 | 顺序冲突或漏依赖 |
| FK/ownership | corpus、domain、source、translation、media、sound 复合外键 | schema report | 跨 work/domain 引用或孤儿可写入 |
| check/enum | status、axis、kind、geometry、chronology、rights 值域 | 与数据字典枚举 diff | DB 与 contract 枚举漂移 |
| uniqueness/identity | UUID/slug、edition reference、occurrence identity、manifest version | 重跑 checksum | 重跑改变稳定 identity 或产生重复 |
| indexes | FK、search、spatial、publication/filter 热路径索引存在 | `EXPLAIN` 样本与索引清单 | 缺关键索引或错误全表扫描越过预算 |
| delete/withdraw | restrict/cascade/soft-delete/withdrawal 行为逐项测试 | 数据保留与审计说明 | 删除来源导致无审计孤儿，或撤回文件仍公开 |
| transactionality | generator/seed 失败时无部分发布状态 | 故障注入日志 | 半完成 publication 可见 |

禁止在 production 数据库上进行 migration 探索或 destructive fixture。生产变更必须另有备份、回滚/forward-fix 方案与授权。

## 8. 语料、coverage 与编辑完整性

### 8.1 Corpus inventory

自动断言：

- 冻结 edition 的所有 section/passages 具有稳定 reference、ordinal、checksum 和 audit status；
- passage reference 在 edition 内唯一，父子顺序闭合；
- 每个疑似实体提及均为 `included`、`excluded` 或 `pending_adjudication`，不得静默消失；
- 引文范围落在对应 passage，variant 和 translation 指向明确 edition/passage；
- published translation 完整满足 locale contract，draft/reviewed 不可作为公开 fallback；
- 版本或 segmentation 改变会更新 denominator/version，而不是覆盖旧 coverage。

人工复核：古籍编辑 reviewer 抽查段落切分、短引文边界、异文、排除理由和翻译状态。抽样规模与风险分层在 corpus policy 冻结，不得由工程测试自行决定“语义正确”。

### 8.2 Occurrence、concept 与计数分离

必须独立生成并交叉验证：

- `textualOccurrences = count(published/audited occurrence rows under declared scope)`；
- `uniqueCreatureConcepts = count(distinct included concept identities under declared scope)`；
- `corpusCoverage = audited passages / frozen passage inventory`，并按 section 列缺口；
- unresolved、excluded、disputed 与 missing translation 另列，不能吞入完成数；
- 同一 concept 多次出现增加 occurrence，不增加 concept；
- 归并/拆分必须有 editorial decision、依据、reviewer 状态与生效 revision；
- API、static artifact、coverage report 和 UI label 使用相同定义与 scope。

任何把三种数量合并成“异兽总数”、更换 denominator 后继续声称 100%，或手抄统计与生成报告漂移，均阻断发布。

## 9. Taxonomy 与关系验证

| 范围 | 自动断言 | 专家/人工复核 |
|---|---|---|
| axis/term registry | key 唯一、双语 label 状态有效、deprecated replacement 可追踪 | 词表边界与双语表达 |
| assignment | axis/term 匹配、subject kind 允许、多值保留、source/passage 可追溯 | 分类是否过度现代化或过度确定 |
| evidence dimensions | attestation、interpretation、confidence、rights 分字段且无自动提升 | 显示语义是否误导 |
| unresolved/unknown | 可筛选、可序列化、不会被默认值抹除 | 待裁决优先级 |
| relations | from/to kind、direction、validity、evidence、revision 完整 | 神、人、部族、植物等边界 |

任一 assignment 缺 evidence/interpretation、无依据地强制互斥、或因 media/rights 状态改变内容证据等级，判为 `fail`。

## 10. 三层地理验证

### 10.1 原文拓扑层

- textual place 和 topology edge 必须回到 passage/source；
- from/to、关系类型、ordinal、方向、原文里距与单位按契约校验；
- layout coordinates 使用专用 discriminant，禁止序列化成经纬度；
- 冲突、环路、缺口和不可计算值显式保留，算法不得静默纠正；
- 同一输入的预计算布局 identity/checksum 稳定，视觉坐标变化不改变原文事实。

### 10.2 学术候选层

- 每个 candidate 具有 claimant、source、evidence summary、confidence rationale、status 与有效 geometry；
- point/line/polygon GeoJSON 结构、坐标范围、环方向和必要 SRID/projection 元数据有效；
- 地点允许 0..N candidates，0 不导致伪造默认坐标；
- candidate set 内主张属于同一明确体系/revision；切换时不拼接其他体系；
- 多候选并列、反证和低/未知 confidence 可被 API、static 与 UI 保留。

### 10.3 现代比较层

- basemap/source/style/licence/attribution 与离线/在线策略进入 manifest；
- modern layer 与 textual topology、candidate geometry 使用独立 layer/type；
- UI 图例用形状/线型与颜色共同编码，不能仅靠颜色；
- 地图列表/表格替代可访问同一 feature identity 与证据摘要。

专家复核按 [EXPERT_REVIEW_QUESTIONS.md](EXPERT_REVIEW_QUESTIONS.md) 记录候选体系、confidence 依据和不可计算关系。该文件已建立，但问题仍未分配 reviewer，Gate 0 仍保持 blocked。

## 11. 四轴 chronology 验证

四类记录必须使用明确 discriminant：

1. `internal_sequence`：section/passage/occurrence ordinal；
2. `composition_redaction_claim`：多来源区间与假说；
3. `edition_commentary`：版本、注家、刊刻、出版、收藏、数字化；
4. `visual_research_asset`：插图、地图、研究与数字资产事件。

自动断言：

- internal ordinal 不进入 BCE/CE formatter，不映射 year 0；
- creature concept/occurrence 不具有伪生卒年；
- claim interval 支持 uncertain/open/undated，不用假日期填空；
- 同轴排序稳定，跨轴只在明确 UI 模式下并列；
- dynamic/static 保留 axis、precision、source、interpretation 与 review status；
- 时间轴切换、undated 列表和表格 fallback 访问同一 identity。

任何四轴混合成单一伪年表或把成书假说显示为确定日期，阻断发布。

## 12. Registry completeness

领域注册表的每个 published kind 必须覆盖下列 required cells：

- stable kind/collection key 与 id/slug getter；
- locale-aware label/context getter；
- lite/full/detail schema 与 serializer；
- profile tab/visibility/selection handler；
- search provider 与 hit mapping；
- drawer renderer 与 accessible fallback；
- media/sound eligibility 与 rights derivation；
- dynamic loader 与 static bake inclusion；
- counts/coverage reporter；
- map/timeline/graph adapter，或显式 `not_applicable` 理由；
- positive、negative 和 unknown-kind fixture。

completeness test 从 registry 生成矩阵，不维护第二份手工 kind 清单。新增 kind 只改 schema、API、search、drawer 或 bake 中任一处都必须使 typecheck/test/build 失败。对 `not_applicable` 的使用须审查，不能用来隐藏未实现路径。

## 13. API contract 矩阵

以 [API_CONTRACT.md](API_CONTRACT.md) 为唯一 endpoint/payload 规范，验证至少覆盖：

| 契约 | 正例 | 负例/边界 |
|---|---|---|
| locales/profile metadata | `zh-CN`、`en` 与 published fallback metadata | unsupported locale、draft fallback |
| atlas lite | 首屏 identity、counts、taxonomy、map index、next links | 偷带长引文、完整大 GeoJSON、受限路径 |
| atlas full/index | 声明 scope 的完整集合或分片索引 | 超预算单体 payload、缺 partition |
| detail | concept/occurrence/place/其他 kind 的证据与争议 | unknown kind/slug、跨 profile lookup |
| search | 名称、别名、原文表记、passage、place、taxonomy、跨 kind | 非确定排序、locale 泄漏、隐藏 kind 漏检 |
| map viewport | bbox/zoom/layer/filter/candidate-set/partition | 非法 bbox、越界 zoom、混合 candidate sets |
| sound/media | verified publication metadata 与可用 URL | pending/denied/incomplete disclosure/path guessing |
| pagination | canonical cursor、稳定排序、无重漏 | tampered/stale cursor、limit 越界 |
| errors | 统一 code/message/details/request metadata | HTML 错误、内部路径/SQL/secret 泄漏 |
| cache/version | ETag/revision/cache key 隔离 locale/filter/rights | stale revision、withdrawn asset 仍命中 |

每个 response 在发送前以对应 Zod/schema family 验证；每个 static JSON 写入后以同一 family 验证。只检查 HTTP 200 或 JSON 可解析不算 contract pass。

## 14. Dynamic/static parity

相同 publication revision、locale、scope 和 fixture 下，规范化比较：

- work/profile/schema/publication identity；
- collection identity、kind、stable IDs、canonical ordering；
- concept、occurrence、coverage 及各分项 counts；
- lite/full/detail 字段语义与 published translation fallback；
- search query 的 hit identity、kind、context、排序与 total；
- map layer/partition/feature identity、geometry/layout discriminant 与 candidate set；
- media/sound eligibility、manifest/checksum、public URL 和 disclosure；
- pagination/partition linkage、error representation 和 withdrawn tombstone；
- public file inventory，不只比较 JSON 中出现的路径。

允许 dynamic URL 与 static relative path 的表示不同，但必须通过 canonical asset identity 映射到同一 file checksum。允许 transport/cache metadata 不同，但需维护显式 ignore list。未记录的差异一律 `fail`。

Static artifact 必须从空输出目录构建、以实际静态服务器提供，并证明没有回退到 dynamic API。抽样 parity 只能作为开发反馈；发布 Gate 必须覆盖全部 published identity，search/map 可在冻结全集与风险抽样规则之间由 Gate 决策冻结。

## 15. 媒体、图标、地图与 manifest 验证

依据 [MEDIA_ICON_ILLUSTRATION_POLICY.md](MEDIA_ICON_ILLUSTRATION_POLICY.md) 与 [ASSET_MANIFEST_SPEC.md](ASSET_MANIFEST_SPEC.md)：

- manifest schema、stable asset/version/file identity 与 canonical serialization；
- ASCII path-safe filename、root containment、无 path traversal/symlink escape；
- 文件存在、byte size、SHA-256、MIME、signature/container/profile 一致；
- creator、source page、original URL、institution、retrieval、licence、attribution、rights review 完整；
- media role、depiction status、source attestation、interpretation class、geographic confidence 独立；
- 双语 title/alt/caption/disclosure 的 published 状态与非空语义检查；
- icon 与 drawer illustration 职责、identity、版本和可读性 fixture 分离；
- crop/resize/transcode/map/waveform derivative DAG 无环、所有输入 checksum 可达；
- stale、orphan、duplicate、superseded、withdrawn 逐类报告；
- release manifest 只包含可发布版本，输出目录不得包含 source master 或未列文件；
- denied/withdrawn/incomplete asset 在 JSON、HTML、source map、precache manifest、public directory、built artifact 和可猜 URL 中均不可获取；
- dynamic/static 的 identity、path mapping、checksum、rights、locale 与 disclosure parity。

缺少媒体不阻断合法文本实体发布；错误占位、破损链接或用未核验资产填空会阻断。

## 16. Sound 验证

依据 [SOUND_RECONSTRUCTION_POLICY.md](SOUND_RECONSTRUCTION_POLICY.md)：

### 16.1 结构与权利

- semantic role、link subject、evidence、translation、rights 与 publication status 有效；
- 文本声描写回到 passage；analog species/material/environment 有来源和适用范围；
- generator/model/version/seed/prompt 或 DSP recipe、输入权利、人工后期和输入/输出 checksum 完整；
- `text_attested` 只描述文本证据，不把生成波形声明为真实古代录音或确定复原；
- 公共中英文 disclaimer、文字描述/transcript 与 interpretation disclosure 完整；
- rights/manifest/disclosure 任一不满足时，API、static 与 public artifact 均不暴露音频。

### 16.2 文件与声学

自动分析 codec/container、sample rate、channels、bit depth、duration、integrated LUFS、true peak、silence/clip、loop points 与 waveform checksum。具体 profile、响度、peak、duration 和 loop 阈值须经声学评审后冻结；当前不得声称通过。

loop 验证至少保存边界波形/数值检测与人工监听 disposition。自动无爆音指标不能替代听觉复核。

### 16.3 播放行为

浏览器验证：

- 仅用户明确动作播放，无 autoplay；
- 全局单轨，新轨开始前停止上一轨；
- pause/stop/ended/error 后状态和 focus 可预测；
- rights denied、文件缺失、网络失败和无音频实体呈现可理解空/错误状态；
- `preload="none"` 或冻结的 reduced-data 策略不预取完整音频；
- mute/reduced-audio/reduced-data 独立于 `prefers-reduced-motion` 并持久化；
- 键盘控制、accessible name、文字替代和非音频旅程完整。

## 17. 性能与规模验证

所有方法、候选预算、设备矩阵和报告字段以 [PERFORMANCE_BUDGETS.md](PERFORMANCE_BUDGETS.md) 为准。测试计划只规定通过流程：

1. 在冻结 `100`、`500`、`1000+` 和 corpus stress fixture 上执行 cold/warm journey；
2. 分别测 raw/gzip/brotli bundle、request count、payload、parse、Zod、derivation、memory；
3. 测 dynamic API query/serialization 与 static bake time/RSS/determinism；
4. 测 map ready/switch/pan/zoom、FPS、frame duration、dropped frames、long tasks、labels、DOM、memory、abort/cache；
5. 测列表 virtualization、drawer、relation graph 与四轴 timeline；
6. 测媒体分类总字节、单资产预算、并发、lazy load 和 reduced-data；
7. 至少重复冻结次数并报告 p50/p95/worst、样本数、设备和 cache 状态；
8. target/warning/blocking 分开判定；任何 blocking 超限须 `fail` 或有效 `waived`。

技术迁移只由报告触发：Leaflet/Supercluster、Canvas/WebGL、MapLibre/vector tiles、worker 或 partition 调整必须记录触发指标、候选比较与 decision。旧“约 666 KiB”仅为未经当前可重复 baseline 证实的回归线索。

waiver 必须具备 scope、metric、actual、budget、理由、风险、owner、批准者、创建/到期时间和 remediation；过期或跨 revision 的 waiver 无效。

## 18. 浏览器、响应式与兼容性

实现 UI 后，在 dynamic 与 static 两种数据模式执行以下 journey：

- 首屏 load、搜索、组合筛选、列表/地图同步、选择、drawer、关闭与返回；
- deep link、刷新恢复、history navigation、无效/过期 link；
- 中文/英文切换、published fallback 与无翻译状态；
- 文本拓扑、candidate comparison、modern comparison、路线逐段高亮；
- 四轴 chronology 切换、interval/undated；
- relation graph 与列表/表格 fallback；
- image/gallery、无媒体、rights denied、withdrawn；
- sound explicit play、单轨、stop/error/reduced-data；
- offline/static path、404、stale revision 与 cache invalidation。

最低 viewport 为 `390×844`、`768×1024`、`1280×800` 和一档冻结宽屏；浏览器/OS 版本矩阵在 release checklist 冻结。每档检查：

- 无页面级横向溢出、不可理解重叠或截断；
- 地图与主要工作区尺寸稳定，动态内容不造成结构跳变；
- drawer/sheet、toolbar、legend、labels、timeline 和音频控制可操作；
- touch target、zoom、orientation 与软键盘行为；
- console/server/network 无未解释 error，失败请求有预期断言。

使用浏览器 snapshot/inspect/network/log/trace 验证精确状态，screenshot 只作视觉证据，不单独构成通过。

## 19. 无障碍与 reduced modes

自动与人工组合检查：

- landmark、heading、label、name/role/value、dialog/sheet semantics；
- 全键盘旅程、逻辑 tab order、visible focus、focus trap/return、Escape 行为；
- 搜索结果、筛选变更、加载、错误与播放状态的适当 announcement；
- 地图 feature 的列表/表格替代，能访问同一 identity、label、证据和详情；
- 非颜色编码的不确定性、selected、route 和候选集；
- 正文、控件、focus 与地图符号在冻结底图上的 WCAG AA 对比；
- image alt 与 caption 分工，装饰图正确隐藏，folio/map 有长描述策略；
- sound transcript/text alternative/disclaimer 可访问，不以音频作为唯一信息；
- 200%/400% zoom、文本放大、中文长标签与英文长词不遮挡；
- `prefers-reduced-motion` 禁止非必要动画且不自动静音；
- reduced-data 不预取大图、音频、波形或非必要 map partitions；
- 用户 mute/reduced-audio/reduced-data 选择可撤销、可持久化、无暗模式依赖。

自动 a11y scanner 通过不等于键盘、screen reader 或认知可理解性通过。具名 reviewer、辅助技术版本、journey 和未解决问题必须写入报告。

## 20. 安全与隐私边界

本项目虽然不是认证系统，仍需验证：

- query/filter/cursor/slug/path 输入长度、字符集和 schema；
- SQL 参数化、bbox/GeoJSON 复杂度上限与资源预算；
- manifest/path root containment、symlink、MIME confusion、SVG/HTML injection；
- external source URL 只作数据，不在 build/verifier 中无约束抓取；
- error/report/source map 不泄漏数据库 DSN、token、本地绝对路径或受控 source workspace；
- public artifact inventory 排除母版、pending/denied assets、内部 review notes；
- checksum 验证不从不可信 manifest 决定任意文件读取路径；
- staging/production CORS、headers、cache 与 content type 符合部署契约。

DoS/渗透测试不属于本文默认授权范围；需要时另行定义受控环境、授权和停止条件。

## 21. 候选命令族

下列命令在当前均为 `not_implemented`，名称冻结前可调整：

```text
npm run verify:shanhaijing-docs
npm run verify:shanhaijing-corpus
npm run verify:shanhaijing-taxonomy
npm run verify:shanhaijing-geography
npm run verify:shanhaijing-registry
npm run verify:shanhaijing-api
npm run verify:shanhaijing-static-parity
npm run verify:shanhaijing-media
npm run verify:shanhaijing-sound
npm run verify:shanhaijing-accessibility
npm run benchmark:shanhaijing-map
npm run benchmark:shanhaijing-api
npm run benchmark:shanhaijing-static
```

后续组合 Gate 还需运行仓库真实命令：根级 `typecheck`、`test`、`build`、`verify:postgis`、`bake:static` 及适用的既有回归 verifier。既有命令通过只证明共享行为未发生相应回归，不证明 Shanhaijing 特有契约通过。

每个新 verifier 应支持：

- 显式输入/environment/profile/revision 参数；
- `--report-json` 与 `--report-markdown` 或等价稳定接口；
- 任一 blocking failure 返回非零退出码；
- deterministic sorting 与 machine-readable error code；
- `--fixture` 运行正/负例，不默默连接默认 production 服务；
- 不在报告中泄漏 secrets 或不稳定绝对路径。

## 22. 生成报告契约

报告写入 `docs/shanhaijing/generated/`；目录和文件当前均不因本文而创建。候选命名：

```text
verification-summary.json
verification-summary.md
corpus-coverage.json
corpus-coverage.md
static-parity.json
static-parity.md
asset-verification.json
asset-verification.md
sound-verification.json
sound-verification.md
performance-{fixture}-{environment}.json
performance-{fixture}-{environment}.md
accessibility-{environment}.json
accessibility-{environment}.md
release-evidence-index.json
release-evidence-index.md
```

每份 JSON 至少包含：

- `reportSchemaVersion`、`reportId`、`generatedAt`；
- `evidenceLevel`、`environmentId`、`publicationRevision`；
- repository/input/schema/corpus/asset manifest checksums；
- command、tool versions、fixture、locale、profile；
- overall result 与 `pass/warn/fail/blocked/waived/not_run/not_implemented` counts；
- 每项稳定 check ID、severity、result、expected、actual、subject identity；
- failure fixture results；
- artifact/report checksums；
- reviewer/waiver/disposition references；
- unresolved、limitations 和 next owner/action。

Markdown 摘要必须由 JSON 生成，标出“请勿人工编辑统计区”。手工 review 可作为带身份和日期的独立 disposition 输入，再由汇总器引用，不直接改机器结果。

## 23. 环境 Gate

### 23.1 Local candidate

最低要求：unit/schema/contract 正负例、文档一致性、确定性与本地 browser journey。报告仍只能是 `local_candidate`。

停止条件：fixture 不完整、verifier 未证明负例、输入未锁定、测试依赖开发者残留数据库/文件。

### 23.2 Isolated database

最低要求：空 PostGIS fresh/repeat bootstrap、全部 DB 约束、publication view、API contract、动态 counts/search/map/media/sound gate。

停止条件：需人工修库、seed 非确定、schema drift、isolated 与 local fixture identity 不一致。

### 23.3 Built static artifact

最低要求：空目录 bake、build、实际静态 server、全量 schema/identity/public-file inventory、dynamic/static parity、浏览器 static journey、withdrawal fixture。

停止条件：前端静默回退 dynamic API、绝对路径错误、受限文件残留、parity 漂移、artifact 不可重现。

### 23.4 Staging

最低要求：锁定 release/version manifest，验证远端 routing、headers、CORS、cache/CDN、locale/deep link、资产撤回、性能与 a11y 风险旅程，并执行 soak 计划。

停止条件：版本不一致、cache 无法失效、错误率/性能超冻结预算、回滚演练未完成或 reviewer 未签署。

### 23.5 Production

必须先获得单独明确授权，并具备回滚方案、版本 manifest、变更窗口、owner 与 production smoke 脚本。Smoke 至少验证 health/version、首屏、关键 detail/search/map、locale、rights-gated media/sound、static asset checksum 与 cache headers。

生产 smoke 只证明该版本在该时刻的有限旅程；失败立即按 release checklist 停止/回滚，不在现场修改数据掩盖问题。

## 24. 总体停止条件

以下任一项使相应 Gate 保持 `blocked`：

- edition、segmentation、occurrence/concept 规则或 coverage denominator 未冻结；
- 三层地理或四轴 chronology 在 schema/API/UI 任一层混淆；
- evidence、interpretation、geographic confidence、rights/review 状态互相推导；
- registry required cells 或负例 fixture 不完整；
- dynamic/static schema、identity、counts、search、map、path 或 rights parity 失败；
- denied/withdrawn 文件仍可公开访问；
- 声音缺 rights、manifest、disclaimer、文字替代或被描述为真实录音/确定复原；
- 100/500/1000+ blocking budget 失败且无有效 waiver；
- 键盘、地图替代、非颜色编码、响应式或 reduced-data 阻断项失败；
- 报告缺输入 checksum、环境、退出码、失败项或 evidence level；
- 专家 review 有未处置 blocking finding；
- 低层证据被写成 staging/production 完成；
- production 缺单独授权、rollback、version manifest 或 smoke。

不得用“基本完成”“仅少量问题”或截图代替阻断项 disposition。

## 25. Gate 0 未决事项

- 冻结底本、版本、passage segmentation、Pilot scope 与 corpus checksum；
- 冻结 occurrence 收录/排除、concept 归并/拆分和 reviewer 规则；
- 冻结 canonical enums、schema/report versions 与 registry required cells；
- 冻结 candidate set、GeoJSON/projection 与地望 reviewer 规则；
- 冻结 sound technical profile、LUFS/peak/duration/loop 阈值和声学 reviewer；
- 冻结浏览器、设备、network、viewport、重复次数和阻断性能预算；
- 冻结 accessibility 标准、辅助技术矩阵与具名 reviewer；
- 冻结 dynamic/static 全量 versus 抽样 parity 规则；
- 冻结报告生成器、artifact 保留、waiver 与签署流程；
- 确认不覆盖现有 dirty worktree 的分支/检查点方案；
- 完成后续 HANDOFF、decision log、risk register、expert questions 与 release checklist；
- 评审 UI UX Pro Max 的来源、许可和项目级安装边界；当前未安装。

## 26. 本文件冻结条件

本文件只有在以下条件全部满足后才可从 `draft` 进入 `review_ready` / `frozen`：

1. 与 corpus policy、coverage matrix、data dictionary、taxonomy、geography、chronology、media、sound、architecture、API、asset manifest 和 performance budgets 的术语/枚举一致；
2. 每个测试域具有 owner、正例、负例、环境、报告与明确 stopping rule；
3. 五层 evidence gate、waiver、review disposition 和报告 schema 获批；
4. Gate 0 所需输入、预算、reviewer 与授权边界已记录在 decision/risk/handoff 文件；
5. 文档链接与生成报告路径通过一致性检查；
6. 用户明确批准退出 Gate 0 并开始 schema/code。

在这些条件满足前，Gate 0 保持 `blocked`。本文不授权 schema、seed、API、UI、资产生成、staging 或 production 工作，也不证明任何 Shanhaijing 测试或验证已经实现、运行或通过。
