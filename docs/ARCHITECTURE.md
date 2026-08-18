# 《山海经 Atlas》架构规范

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：领域实体边界、registry 结构、Pilot、分片键、性能预算与 reviewer 尚未冻结
- 实施状态：候选架构；尚无 Shanhaijing migration、seed、API、profile、UI、verifier、静态产物或部署实现

## 1. 目的与范围

本文件把核心蓝图中的“一个 monorepo、一个 Atlas Core、多个一方产品”落实为可评审的架构边界。目标是让《山海经 Atlas》成为现有仓库中的一方 profile 与领域模块，同时避免两类错误：

1. 复制现有 Atlas 成为断开的第二套应用；
2. 把异兽、文本段落、古籍拓扑和声学推演强塞进 `character`、`event`、`location` 或音乐领域表。

本架构只服务当前 monorepo 内受维护的一方模块。它不是第三方插件平台，不引入运行时远程代码、插件市场、任意 schema 注入或跨仓库动态加载。

本文件不表示 Gate 0 已通过。字段与枚举以 [ENTITY_AND_DATA_DICTIONARY.md](ENTITY_AND_DATA_DICTIONARY.md) 为候选基线，领域规则分别由语料、分类、地理、时间、媒体和声音专题政策约束；冲突时以核心蓝图为准，并在 `DECISION_LOG.md` 记录裁决。

## 2. 架构原则

1. **Core 管机制，domain 管语义**：共享层提供生命周期、传输、选择、可见性和验证机制；领域层拥有实体含义、证据规则和呈现适配。
2. **注册而非散落分支**：实体 kind 必须通过一方 registry 进入 schema、搜索、选择、drawer、媒体、静态 bake、计数、地图、时间线和关系图。
3. **服务端派生发布资格**：客户端不得把未验证资产或未发布翻译自行提升为可见内容。
4. **动态与静态同源**：动态 API 和静态 artifact 使用同一 schema、发布派生与序列化规则。
5. **语料先行**：corpus inventory、passage audit 与 occurrence 先于 concept 归并和专题表现。
6. **不确定性保真**：原文拓扑、学术候选和现代底图分层；四条时间轴分模式；独立状态维度不得互相推导。
7. **规模由基准驱动**：渲染器、分片、缓存和索引演进由 100/500/1000+ 基准触发，不凭技术偏好迁移。
8. **失败时收敛暴露面**：rights、provenance、checksum、translation 或 disclosure 不完整时 fail closed；内容本体不因缺媒体而失效。
9. **可重现**：seed、asset、统计和静态包均携带输入版本与 checksum；手工数字不是发布证据。
10. **工作区隔离**：不得覆盖、回退或误归因当前 dirty worktree 中既有 Bible visual pilot 等更改。

## 3. Atlas Core 与领域边界

### 3.1 Atlas Core 负责

共享 Core 应负责以下与具体作品语义无关的能力：

- work/profile 解析、locale 解析和 published-only fallback；
- 请求参数、响应和静态 artifact 的 schema 验证；
- 领域 descriptor 注册、启动期校验与构建期 completeness test；
- 通用选择引用、深链、列表/搜索结果到 drawer 的路由；
- drawer shell、loading/error/empty/right-denied 等通用状态；
- 媒体与声音发布资格的统一 fail-closed 执行接口；
- 动态 API 与 static transport 的客户端适配；
- cache key、artifact version、ETag/checksum 与失效边界；
- 通用 viewport/partition 请求形状、分页和错误契约；
- 可访问的列表/表格 fallback、focus 恢复和全局单轨音频协调；
- 计数、coverage、parity 和 registry completeness 的验证框架；
- 证据层级记录，不把 local 结果提升为 staging 或 production。

Core 不解释“异兽”“其声如”“又东三百里”或地望主张，也不决定 concept 的归并/拆分。

### 3.2 Shanhaijing domain 负责

Shanhaijing 领域模块应负责：

- edition、section、passage、variant、translation 与 passage audit；
- creature concept、occurrence、未决候选和 editorial decision；
- taxonomy axis、term、assignment 与字段级 evidence；
- textual place、topology edge、candidate set、place candidate 与现代底图比较语义；
- 四轴 chronology 的领域对象、claim 和 UI adapter；
- creature icon、历史插图、文本影页、学术地图、复原地图等角色与解释语义；
- sound evidence、sound asset、generation manifest、disclosure 与播放资格；
- 人、神、部族、植物、矿物、器物、仪式、疾病/效应等 Pilot 冻结后的领域实体；
- Shanhaijing loader、搜索 provider、详情 provider、地图/时间/关系 adapter；
- 领域 verifier、coverage reporter 和 deterministic seed 输入。

### 3.3 禁止的依赖方向

- Core 不得 import Shanhaijing 组件或枚举来决定通用行为。
- Shanhaijing domain 可依赖 Core 契约，但不得直接修改其他 profile 的领域数据。
- Web 展示不得直接查询数据库或重算 rights 发布资格。
- 静态 bake 不得绕过动态 serializer 另写一套领域 SQL。
- 媒体、声音和地图资产不得因位于 `public/` 就被视为可发布。
- `source_attestation`、`interpretation_class`、`geographic_confidence` 与 `rights_status` 不得相互推导。

## 4. 一方领域注册契约

### 4.1 设计边界

注册契约采用轻量、编译期可检查的一方 descriptor。它统一现有散落在 Web schema、profile tabs、search、drawer、API 查询、media `UNION` 和 static bake 中的实体清单，但不尝试把 SQL、Zod、React 和地图实现压成一个万能配置对象。

建议分为三个相互引用、由 completeness test 对齐的层次：

1. `DomainDescriptor`：领域级 identity、profile、loader、artifact 与版本策略；
2. `EntityDescriptor`：每种可选择/检索实体的跨层能力声明；
3. 具体 provider/adapter：API 查询、Web renderer、map/timeline/relation 等各自保留类型安全实现。

具体目录和 package 边界须在实施前依据现有 TypeScript workspace 冻结。本文件只冻结职责，不预先声称已有共享 package。

### 4.2 `DomainDescriptor` 最小候选字段

| 字段 | 含义 |
|---|---|
| `domain` | 稳定领域 ID，候选为 `shanhaijing` |
| `workSlugs` | 该领域负责的 work slug 集合 |
| `profileId` | 构建 profile ID |
| `schemaVersion` | 动态与静态 payload 的契约版本 |
| `artifactVersion` | 静态索引与分片版本 |
| `entityDescriptors` | 领域实体 descriptor 列表 |
| `loadAtlas` | lite/full 领域聚合 loader |
| `loadDetail` | kind + slug/ID 的详情 provider |
| `searchProviders` | 领域搜索 provider 列表 |
| `partitionProviders` | 地图/section/kind 分片 provider |
| `publicationPolicy` | 翻译、rights、review 与 disclosure 派生入口 |
| `countReporters` | concept、occurrence、coverage 等独立 reporter |
| `staticPlan` | 索引、分片、locale 和资产纳入规则 |

### 4.3 `EntityDescriptor` 最小候选字段

| 字段 | 含义 |
|---|---|
| `kind` | 稳定、全局唯一的机器 kind |
| `collectionKey` | Atlas payload 中的集合键 |
| `identity` | ID、slug、alias/redirect 读取规则 |
| `liteSchema` | 首屏、列表、地图和搜索需要的最小 schema |
| `fullSchema` | full/static 或详情所需 schema |
| `label` | locale 下 label 与 context 派生器 |
| `profileTab` | 是否进入主导航及 tab key |
| `visibility` | published、review、profile 与 filter 可见性策略 |
| `search` | searchable fields 与 provider ID |
| `selection` | URL、列表、地图和关系节点的 selection adapter |
| `drawer` | drawer renderer/section provider ID |
| `media` | 允许的 media role、link target 与空状态策略 |
| `sound` | 允许的 sound role 与播放资格；不适用时显式关闭 |
| `staticBake` | index/detail/partition 纳入方式 |
| `counting` | count/coverage reporter；不适用时说明原因 |
| `mapAdapter` | topology/candidate/modern/none 及 feature adapter |
| `timelineAdapter` | internal/composition/edition/visual/none |
| `relationAdapter` | 可作为关系端点、边或两者；不适用时为 none |

每个字段可以引用独立实现，不要求 descriptor 内嵌 React 组件或 SQL 字符串。`none` 必须是明确声明，不能用字段缺失掩盖遗漏。

### 4.4 Registry 完整性矩阵

每个注册 kind 必须在构建期生成并验证以下矩阵：

| 能力 | 必须证明的内容 |
|---|---|
| Schema | lite/full/detail 与搜索结果 kind 可解析 |
| Profile | tab、可见性和默认选择行为已声明 |
| Search | provider 存在或明确 `not_searchable` 及理由 |
| Selection | 列表、地图、搜索和深链可生成同一引用 |
| Drawer | renderer 存在或明确不允许直接选择 |
| Media | link target、角色 allowlist 和空状态已声明 |
| Sound | role/资格或明确 none |
| Static bake | index/detail/partition 的 inclusion 已声明 |
| Counting | count/coverage 归属明确，避免重复计数 |
| Map | adapter 或 none，并声明适用地理层 |
| Timeline | adapter 或 none，并声明适用时间轴 |
| Relations | 端点/边能力或 none |
| Tests | schema、provider 和至少一个正/负样例 |

任一 required cell 缺失时，typecheck/test/build 必须失败。新增 kind 不能只修改 `EntityTypeSchema` 或只在 drawer 中增加分支后通过。

### 4.5 当前硬编码基线

现有实现中的以下位置证明 registry 有必要，但不代表已完成重构：

- `apps/web/src/types.ts`：`EntityTypeSchema`、Atlas collection 与 Search kind 分别手写；
- `apps/web/src/profile.ts`：`specialization` 和 tabs 为封闭联合；
- `apps/web/src/components/GlobalSearch.tsx`：每种集合独立循环与 label 映射；
- `apps/web/src/components/EntityDrawer.tsx`：选择 kind、详情、媒体和展示分支手写；
- `apps/api/src/app.ts`：Atlas、详情、搜索和 media link 维护独立实体清单；
- `apps/api/src/bake-static.ts`：按 work/locale 烘焙单一 full atlas 文件；
- `apps/api/src/music.ts`：`loadMusicAtlas()` 展示了领域 loader 的可复用方向。

当前 API media 查询的手写 `UNION` 未覆盖全部 specialist kind；这是待测试锁定的基线风险，不在 Gate 0 文档阶段直接修复。

## 5. API 组合与领域 Loader

### 5.1 Loader 形态

Gate 0 通过后，API 应新增概念上类似 `loadMusicAtlas()` 的 `loadShanhaijingAtlas()`。它接收至少：

- database handle；
- `workId`；
- requested locale；
- fallback locale；
- `detail` 级别；
- 可选 partition/filter context。

它返回由 Shanhaijing schema 验证的领域 collections 和元数据。它不得把未发布 translation、rights 未通过的本地资产路径或未满足 disclosure 的声音路径交给调用方。

### 5.2 Core 聚合

Core route 负责：

1. 解析 work、locale、detail 与查询参数；
2. 根据 work/domain registry 找到 loader；
3. 并行加载共享 work/source 元数据与领域数据；
4. 应用统一 publication derivation；
5. 用最终 response schema 验证；
6. 返回动态响应，或把同一 serializer 的结果交给 static bake。

不得在 `app.ts` 中继续为每个 Shanhaijing kind 追加互不关联的大段查询和 `UNION ALL`。

### 5.3 Lite、full 与 detail

- `lite`：首屏导航、列表摘要、筛选词表、可见地图索引和生成计数；不携带长引文上下文、大型 GeoJSON、完整媒体或音频 manifest。
- `full`：用于受控静态生成或小型 Pilot 的完整读取；规模超预算后不得强制保持单文件。
- `detail`：按 kind + stable identity 获取完整 passage context、evidence、candidate、media、sound 与争议说明。

具体字段、错误和 endpoint 由 `API_CONTRACT.md` 冻结。

## 6. 动态 API 与静态 Artifact

### 6.1 同源契约

动态和静态模式必须共享：

- schema version；
- locale/fallback 规则；
- publication derivation；
- entity identity 与 redirect；
- lite/detail serializer；
- count/coverage 生成逻辑；
- media/sound fail-closed 规则；
- partition key 与排序；
- fixture 和 parity tests。

静态 artifact 是 API 发布视图的物化结果，不是第二套数据模型。

### 6.2 静态输出候选

规模基准冻结前，候选结构为：

```text
index.<work>.<locale>.<version>.json
section.<section-key>.<locale>.<version>.json
map.<layer>.<partition-key>.<locale>.<version>.json
entity.<kind>.<partition-key>.<locale>.<version>.json
manifest.<work>.<locale>.<version>.json
```

manifest 至少记录 schema/artifact version、输入数据库/seed 标识、生成时间、每个文件的 byte size 与 SHA-256、总计数和可用 partition。最终命名由 `API_CONTRACT.md` 与 `ASSET_MANIFEST_SPEC.md` 冻结。

### 6.3 Parity

Parity verifier 至少比较：

- 动态与静态 schema 均可解析；
- kind/slug/ID 集合一致；
- concept、occurrence、coverage 计数分别一致；
- locale resolved/fallback 结果一致；
- 抽样详情、搜索和地图 feature 等价；
- rights-denied 资产在两种模式都不暴露路径；
- stale/extra static files 被报告并阻断发布。

静态 artifact 通过不代表 staging 或 production 已完成。

## 7. 领域模块所有权

| 模块 | 主要所有权 | 关键边界 |
|---|---|---|
| Corpus | edition/section/passage/variant/audit | passage 是 occurrence 和 claim 的可追溯根 |
| Concept/Occurrence | concept、occurrence、candidate、editorial decision | 文本提及与编辑归并分别统计 |
| Taxonomy | axis、term、assignment、evidence | 多轴多值，不用单一树替代 |
| Geography | textual topology、candidate sets、modern comparison | 三层独立，layout coordinate 非史实 |
| Chronology | internal order 与三类 dated claims | 内部 ordinal 不转 BCE/CE |
| Media/Icon | asset、link、role、depiction、derivative、rights | 图标与 drawer 大图分责 |
| Sound | evidence、asset、link、manifest、translation | 文本声描写不等于真实录音 |
| Relations | 多 kind endpoint/edge/evidence | 不局限 character-to-character |
| Publication | translation/review/rights/disclosure 派生 | server/build fail closed |
| Reports | coverage、counts、rights、bytes、parity、performance | 仅工具生成 |

更详细语义分别见 [CORPUS_AND_EDITORIAL_POLICY.md](CORPUS_AND_EDITORIAL_POLICY.md)、[TAXONOMY.md](TAXONOMY.md)、[GEOGRAPHY_AND_MAPS.md](GEOGRAPHY_AND_MAPS.md)、[CHRONOLOGY_MODEL.md](CHRONOLOGY_MODEL.md)、[MEDIA_ICON_ILLUSTRATION_POLICY.md](MEDIA_ICON_ILLUSTRATION_POLICY.md) 和 [SOUND_RECONSTRUCTION_POLICY.md](SOUND_RECONSTRUCTION_POLICY.md)。

## 8. 数据库迁移分层

迁移编号必须在实施时依据仓库最新编号分配，不能在 Gate 0 预占。建议按可独立验证和回滚的能力分层：

1. 通用 domain registry ownership、多 kind identity/relation/media link 完整性；
2. corpus：edition、section、passage、variant、translation、audit、editorial decision；
3. creature concept、translation、alias、occurrence 与 unresolved candidate；
4. taxonomy axis、term、assignment 与 evidence；
5. textual geography、topology、candidate set、candidate claim 与空间索引；
6. chronology claims 与四轴适用约束；
7. icon registry、media role/status/provenance/derivative 扩展；
8. sound asset、link、evidence、generation manifest 与 translation；
9. 搜索、partition、visibility 和性能索引。

每层必须包含 fresh bootstrap、重复 bootstrap、FK/check/enum、跨 work ownership、删除/替代和回滚影响测试。若共享 migration 会改变既有 profile 行为，必须先补回归测试并在 `DECISION_LOG.md` 记录兼容策略。

## 9. Deterministic Seed 策略

### 9.1 输入分层

Seed 输入按以下依赖顺序生成：

1. reference vocabulary；
2. frozen edition 与 corpus inventory；
3. passage audit 与 occurrence inventory；
4. concept editorial mapping；
5. taxonomy assignment/evidence；
6. geography topology/candidate claims；
7. chronology claims；
8. media/icon/sound manifest references。

后层不得反向制造前层事实。例如，已有插图不能成为收录 occurrence 的理由。

### 9.2 稳定身份

- UUID 采用冻结 namespace + canonical key 的确定性算法；
- slug 可修订，但 UUID 不随显示名称改变；
- 旧 slug 进入 alias/redirect，不静默复用给其他实体；
- occurrence identity 必须包含 edition/passage 与稳定 occurrence ordinal 或冻结 anchor；
- seed 排序、序列化与 checksum 在相同输入下可重现。

具体算法、canonical key 和冲突规则仍待 Gate 0/Pilot 冻结。

### 9.3 生成证据

每个 seed batch 必须输出机器可读 manifest，至少记录：

- source input path/version/checksum；
- generator version；
- schema version；
- generated file checksum；
- record counts，按实体 kind 分列；
- warnings、pending decisions 和 excluded items；
- reviewer/freeze record 的引用。

大型人工 SQL 不得成为唯一真源。生成 SQL 可以作为迁移输入，但必须可由冻结源重新生成。

## 10. 搜索架构

### 10.1 Provider 边界

每种 searchable kind 通过 registry 声明字段、权重、locale normalization、label/context 和权限过滤。Shanhaijing 搜索至少计划覆盖：

- creature concept 规范名与 alias；
- occurrence 原文表记；
- textual place；
- 人、神、部族及 Pilot 冻结的其他 kind；
- passage reference 与可发布文本；
- taxonomy term；
- edition/commentary/visual research 条目。

### 10.2 规则

- 只检索允许发布的 locale 文本；fallback 行为与 Atlas/detail 一致；
- 搜索结果返回 stable kind + identity + work + label + context，不返回任意前端组件名；
- concept 命中与 occurrence 命中不可合并成无法追溯的单一结果；
- alias normalization、中文分词/字符匹配、拼音和英文策略须用 Pilot corpus 基准后冻结；
- 动态 SQL 搜索与静态搜索索引必须通过抽样 parity；
- 200 条固定截断之类的上限必须进入 API contract，并暴露分页/截断元数据。

## 11. Cache、分片与失效

### 11.1 Cache key

候选 cache key 至少包含：

- work/domain；
- schema/artifact version；
- locale 与 resolved fallback；
- detail level；
- entity kind 或 partition；
- map layer、candidate set、zoom bucket 与规范化 filters；
- publication revision。

rights、translation、editorial review 或 asset withdrawal 改变时必须更新 publication revision 或重新生成对应 artifact，不能依赖长 TTL 掩盖 stale 内容。

### 11.2 Viewport 与 partition

- 文本拓扑优先按 frozen section/route partition；
- 候选地层可按 candidate set + spatial partition/bbox；
- occurrence 分布按 occurrence feature 输出，不仅按 concept 聚合；
- detail 与媒体按选择懒加载；
- partition 边界必须稳定、可枚举，并由 manifest 描述；
- 同一实体跨 partition 重复时有 canonical identity，计数 reporter 负责去重。

### 11.3 HTTP 与客户端缓存

最终策略由 `API_CONTRACT.md` 和 `PERFORMANCE_BUDGETS.md` 冻结。候选机制包括 versioned immutable static files、manifest 短缓存、动态 ETag、请求去重和最近 partition 内存缓存。不得缓存未通过 publication policy 的原始数据库行。

## 12. LOD 与渲染器演进

### 12.1 起点

- 复用现有 Leaflet、Supercluster、fit/selection 交互模式处理适量真实候选坐标；
- 文本拓扑使用预计算布局，但 layout coordinate 必须标记为渲染数据；
- 现有 0–100 React SVG fictional canvas 只能作为小型 Pilot 参考，不作为长期 1000+ feature 结论。

### 12.2 LOD 责任

Domain map adapter 生成语义 feature 与优先级；Core renderer 处理 transport、viewport、cluster、hit testing 和选择。LOD 至少考虑：

- zoom/scale 下的 feature inclusion；
- label priority 和 collision；
- cluster 到 occurrence 的可追溯展开；
- point/line/polygon 的独立预算；
- selected/focused feature 不被 LOD 静默隐藏；
- 列表/表格替代与地图保持同一 filter set。

### 12.3 技术迁移触发器

只有冻结基准出现以下证据时，才评估 Canvas/WebGL、MapLibre 或 vector tiles：

- 500 或 1000+ feature 的 parse、主线程、FPS、内存或 DOM 预算越界；
- topology line/label 数量使 SVG 交互不可接受；
- candidate polygon/line payload 无法通过分片和简化满足预算；
- 移动端出现冻结定义的长任务或内存失败。

迁移决策须记录基准报告、替代方案、可访问 fallback、回滚方式和 owner。初始候选性能数值不是通过标准，最终以 `PERFORMANCE_BUDGETS.md` 为准。

## 13. Publication Derivation 与 Fail-Closed

### 13.1 内容发布

内容实体是否可见至少由以下独立条件派生：

- 属于当前 work/domain；
- corpus/editorial 状态允许公开；
- locale 文本为 `published` 或符合冻结 fallback；
- source/evidence 外键完整；
- registry 允许该 kind 进入对应 endpoint/artifact；
- unresolved/disputed 状态被如实保留。

缺少媒体不阻断符合内容政策的实体发布。

### 13.2 资产发布

本地或远程可嵌入资产只有在以下条件全部满足时才暴露可加载路径：

- rights 状态与 licence allowlist 通过；
- provenance、creator/source/retrieval 与 attribution 完整；
- 本地文件存在且 SHA-256 匹配；
- role、depiction/interpretation 与适用 kind 通过 registry；
- 双语 alt/caption/disclosure 达到冻结要求；
- derivative chain 和 manifest 完整；
- verifier 通过且未处于 withdrawal/rejected 状态。

否则 API/static serializer 必须隐藏加载路径；在政策允许且 URL/provenance 完整时可降级为 external link。

### 13.3 声音发布

除通用资产条件外，声音还必须具备 output interpretation、文字替代、免责声明、技术 profile 和听审状态。`text_attested` 只说明文字证据，不得把生成波形标为古代真实录音或确定复原。

## 14. 前端组合边界

- `shanhaijing` profile 负责品牌、默认中文、tabs、默认视图和 theme token；
- Core workspace 负责顶部工具、地图/面板布局、drawer shell、URL 状态和 transport；
- domain adapter 提供异兽、occurrence、文本拓扑、候选比较、taxonomy、四轴时间和声音面板；
- selection 使用 `{ workSlug, kind, id/slug }` 一类稳定引用，不传递组件实例；
- drawer renderer 从 registry 解析，通用 shell 不维护领域 kind 的长 `if/switch`；
- 全局搜索、地图、列表、时间线和关系图对同一 selection store 读写；
- 静态和动态 transport 对组件透明，但错误和证据模式可被诊断；
- 缺媒体、无候选地、未定 concept 和 undated claim 都是正常空/未决状态，不是前端异常。

## 15. 关系模型

现有 character relation 只能作为交互和 fallback 参考。Shanhaijing 需要多 kind `domain_relations` 或等价受控模型：

- 端点由 kind + stable ID 标识；
- DB 与 verifier 保证端点存在且属于同一 work；
- relation kind 词表声明允许的端点组合；
- 每条关系可链接 passage/source、interpretation class 和 editorial status；
- topology edge、taxonomy assignment 和 media link 保持各自专用表，不为“统一关系图”全部塞进通用 relation；
- API graph adapter 只投影当前视图需要的节点/边；
- Web 提供可访问表格 fallback，并能回到证据。

## 16. Verifier 与测试边界

架构实施后至少需要：

- registry uniqueness/completeness；
- schema/provider/collection key 一致性；
- API route 和 Web selection kind parity；
- dynamic/static schema、identity、counts 和抽样内容 parity；
- publication derivation 正负测试；
- media/sound denied path 不泄漏测试；
- deterministic seed 重跑 checksum；
- cross-work ownership 与 relation endpoint 完整性；
- partition 去重、manifest 完整性和 stale file 检查；
- search provider、drawer renderer、media adapter、map/timeline/relation adapter 覆盖；
- 现有 Bible、art、music profile 的回归测试。

计划中的 `verify:shanhaijing-*` 命令当前均未实现。文档不得把命令名写成已通过证据。

## 17. Dirty Worktree 与实施隔离

当前工作区在本项目前已包含 Bible visual pilot 等未提交更改。后续实施必须：

1. 在每次改动前读取目标文件并理解现有差异；
2. 只增加本任务所需内容，不重排或格式化无关文件；
3. 不用 reset/checkout 恢复用户更改；
4. 对共享文件采用小范围变更，并在 evidence 中区分既有与新增行；
5. migration 编号依据当时仓库真实状态分配；
6. 测试失败时区分基线失败、既有 dirty change 和本项目回归；
7. commit、push、Cloudflare 或其他外部动作遵循单独授权边界。

文档创建本身只形成 `local_candidate`。即使后续 typecheck/build 通过，也不能因此声称 isolated database、static artifact、staging 或 production 完成。

## 18. 证据层级边界

| 层级 | 最低架构证据 | 不代表 |
|---|---|---|
| `local_candidate` | 文档、local schema/code/test 输出 | 独立数据库或部署可用 |
| `isolated_database` | fresh/repeat migrations、seed、DB verifiers、API contract | 静态产物已构建 |
| `built_static_artifact` | versioned manifest、checksums、static parity、静态 smoke | staging 已上线 |
| `staging` | staging URL、版本、部署日志、浏览器/network smoke | production 完成 |
| `production` | 单独授权、版本 manifest、回滚方案、production smoke | 后续版本自动获批 |

任何 handoff 或 release checklist 必须保持这五级分离。

## 19. Gate 0 未决事项

以下问题未冻结前，本文件不能成为 schema/code 实施授权：

- Pilot 篇章、底本、passage segmentation、occurrence 与 concept 规则；
- creature 之外的实体采用独立表还是受控 `domain_entities` 的边界；
- registry 的实际 package/目录、共享类型方式和构建期检查实现；
- 首批注册 kind、tab 集合、默认视图与 selection URL 形状；
- lite/full/detail 的准确字段及 static partition keys；
- alias、中文搜索、拼音与英文 normalization；
- dynamic/static search parity 方法与分页上限；
- deterministic UUID namespace、canonical key 和 seed 源格式；
- publication revision、cache TTL、ETag 与 withdrawal 失效策略；
- 100/500/1000+ fixture、测量设备和性能阻断预算；
- topology renderer 与 candidate map 的 Pilot 技术选择；
- media/sound registry allowlist 与 reviewer 身份模型；
- shared migration 对现有 Bible/art/music profile 的兼容方案；
- architecture、data、rights、performance 与 accessibility reviewers。

## 20. 本文件冻结条件

本文件只有在以下条件全部满足并记录批准者、日期与输入版本后，才可标记为 `frozen`：

1. 核心蓝图、数据字典和所有领域专题政策完成内部术语一致性检查；
2. Gate 0 所需底本、Pilot、occurrence/concept 与实体边界已冻结；
3. registry descriptor、completeness matrix 和实际 TypeScript package 边界经评审；
4. API lite/detail/search/map/audio/static 契约在 `API_CONTRACT.md` 冻结；
5. static partition、manifest、checksum 和 cache invalidation 规则冻结；
6. migration 分层、deterministic identity/seed 和 rollback 规则冻结；
7. publication derivation、media/sound fail-closed 与 withdrawal 流程经 rights review；
8. 100/500/1000+ fixture、性能预算和渲染器演进触发器冻结；
9. registry、dynamic/static parity 和现有 profile 回归测试方案可执行；
10. dirty-worktree 隔离方式和五级证据记录方式获确认；
11. 所有未决裁决写入 `DECISION_LOG.md`，风险与 owner 写入 `RISK_REGISTER.md`；
12. Gate 0 人工评审明确批准进入 schema/code，而不是仅因文件存在自动放行。
