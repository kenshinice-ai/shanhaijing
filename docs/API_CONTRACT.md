# 《山海经 Atlas》API 契约

- 文档状态：`review_ready`
- 阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 上游规范：[ARCHITECTURE.md](ARCHITECTURE.md)、[ENTITY_AND_DATA_DICTIONARY.md](ENTITY_AND_DATA_DICTIONARY.md)、[GEOGRAPHY_AND_MAPS.md](GEOGRAPHY_AND_MAPS.md)、[SOUND_RECONSTRUCTION_POLICY.md](SOUND_RECONSTRUCTION_POLICY.md)
- 当前阻断：Pilot、实体 kind、locale normalization、分片键、搜索策略、publication revision、性能预算与 reviewers 尚未冻结

> 本文件定义候选接口与 artifact 契约，不证明任何 Shanhaijing endpoint、共享 schema、静态分片、搜索索引、音频接口或 verifier 已实现。当前仓库只有既有 Atlas API 与单文件 static bake 基线；不得将本文中的路径、类型名、状态码或缓存头描述为现有行为。

## 1. 目的与边界

本文件把核心蓝图中的 lite/detail/search/map/audio/static 要求落实为可评审的传输契约。动态 API 与静态 artifact 是同一 publication view 的两种传输方式，不是两套数据模型。

本文件负责：

- 请求参数、响应 envelope、错误 envelope 与版本元数据；
- Works、Atlas lite/full、entity detail、search、map 和 sound 的边界；
- locale normalization、published-only fallback 与可诊断结果；
- publication derivation、rights gate 和路径暴露规则；
- 分页、截断、partition、缓存、失效和静态命名；
- dynamic/static schema、identity、count 与抽样语义 parity。

本文件不负责：

- 决定底本、passage 切分、concept 归并或地望结论；
- 预先冻结尚未通过 Pilot 的实体 kind、分类词表或分片算法；
- 规定 UI 组件结构或地图渲染器；
- 绕过 rights、editorial review、translation status 或 verifier；
- 把接口规划当作 build、staging 或 production 证据。

## 2. 当前基线与差距

截至本文创建时，现有仓库行为包括：

- `GET /api/works`；
- `GET /api/works/:slug/atlas?detail=lite|full`；
- `GET /api/works/:slug/entities/:kind/:entitySlug`；
- `GET /api/search`，结果固定 `LIMIT 200`，没有 cursor 或截断元数据；
- Web 静态模式读取 `works.<locale>.json` 与单一 `atlas.<work>.<locale>.json`；
- static bake 获取 `detail=full`，没有 Shanhaijing section/map/entity partition manifest；
- 地图聚类在客户端完成，没有 bbox/viewport endpoint；
- music loader 仅在 rights verified 时暴露部分音频路径。

现有行为是迁移兼容基线，不是本契约已经实现的证据。实施时必须先用现有 fixture 锁定兼容行为，再逐步引入 registry、共享 schemas 与 Shanhaijing transport。

## 3. 通用请求约定

### 3.1 Base path 与版本

动态接口候选 base path 保持 `/api`，避免仅为 Shanhaijing 创建平行服务器。schema 版本通过响应元数据和 manifest 显式提供；是否将 major version 写入 URL，仍待 Gate 0 决定。

候选版本字段：

| 字段 | 含义 |
|---|---|
| `schemaVersion` | 响应结构版本；不随内容修订任意变化 |
| `artifactVersion` | 一组静态 artifact 的不可变版本标识 |
| `publicationRevision` | rights、translation、editorial review 或 withdrawal 变化时更新的发布修订 |
| `generatedAt` | artifact 生成时间；动态响应可省略或表示 publication view 生成时间 |
| `sourceRevision` | 非敏感 seed/database/corpus 输入版本标识，不暴露凭据或内部路径 |

版本值的格式、兼容窗口和 schema migration 纪律尚未冻结。客户端不得通过文件时间或 HTTP `Last-Modified` 猜测语义版本。

### 3.2 Locale

所有本地化 endpoint 接受 `locale`。候选 canonical locale 为 `zh-CN` 与 `en`，最终集合由 profile 与 corpus policy 冻结。

解析顺序：

1. 对输入执行已冻结的 trim、大小写与 alias normalization；
2. 不支持或格式非法的 locale 返回 `400 INVALID_LOCALE`，不得静默改成默认语言；
3. 请求语言存在 published 内容时使用该语言；
4. 否则只可回退到 work 的冻结默认 locale，且该内容也必须为 `published`；
5. 两者都不可发布时，实体不进入 publication view，或详情返回明确的不可用/不存在结果；
6. 不允许回退到 `draft`、`reviewed` 或未审翻译。

每个含本地化内容的 envelope 或 item 必须可诊断：

```ts
type LocaleResolution = {
  requestedLocale: Locale;
  resolvedLocale: Locale;
  fallbackUsed: boolean;
  translationStatus: "published";
};
```

是否在集合 envelope 只返回统一 locale resolution，或在可能混合 fallback 的 item 上重复返回，须由 Pilot fixture 冻结。static 与 dynamic 必须一致。

### 3.3 Stable identity

每个可选择实体至少返回：

- `kind`：registry 中冻结的稳定 kind；
- `id`：稳定 UUID，是否在所有 lite payload 暴露待 privacy/size review；
- `slug` 或等价稳定 public identity；
- `workSlug`；
- `domain`，候选值 `shanhaijing`；
- redirect/alias 情况下的 canonical identity。

API 不返回 React component 名、SQL table 名或临时数组索引作为 identity。occurrence identity 必须包含冻结 edition/passage anchor 与 occurrence ordinal 的稳定派生，不得仅依赖当前排序位置。

### 3.4 参数编码

- 多值 filters 使用重复 query key 或 canonical JSON/compact encoding，最终只选一种；
- filters 进入 cache key 前必须规范化顺序、去重和非法值处理；
- `bbox` 候选格式为 `west,south,east,north`，WGS84 层才允许地理坐标；文本拓扑画布不得伪装为 WGS84 bbox；
- cursor 为不透明字符串，客户端不得解析；
- boolean、enum、zoom 和 limit 由共享 request schema 校验；
- 未知参数默认返回 `400 INVALID_REQUEST` 或在冻结的兼容策略下明确忽略，不能因 endpoint 不同而随机处理。

## 4. 通用成功 Envelope

集合响应候选形态：

```ts
type CollectionEnvelope<T> = {
  schemaVersion: string;
  publicationRevision: string;
  requestedLocale: Locale;
  resolvedLocale: Locale;
  fallbackUsed: boolean;
  items: T[];
  page?: {
    nextCursor: string | null;
    limit: number;
    returned: number;
    truncated: boolean;
  };
};
```

单体响应候选形态：

```ts
type ItemEnvelope<T> = {
  schemaVersion: string;
  publicationRevision: string;
  requestedLocale: Locale;
  resolvedLocale: Locale;
  fallbackUsed: boolean;
  item: T;
};
```

具体字段是否按 endpoint 内联，须在共享 Zod schemas 实现前冻结。无论最终形态如何，以下信息不得丢失：schema version、publication revision、locale resolution、稳定 identity、分页/截断状态。

## 5. 错误 Envelope

所有动态 endpoint 使用同一错误结构：

```ts
type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Array<{
      path: Array<string | number>;
      code: string;
      message: string;
    }>;
    retryable?: boolean;
  };
};
```

`message` 面向诊断但不得暴露 SQL、文件系统路径、内部 host、stack、pending asset path 或未发布内容。`details` 只用于安全的字段级校验信息。

候选错误映射：

| HTTP | code | 条件 |
|---:|---|---|
| 400 | `INVALID_REQUEST` | query/path/body 不符合共享 request schema |
| 400 | `INVALID_LOCALE` | locale 非法或不支持 |
| 400 | `INVALID_CURSOR` | cursor 无法验证或不适用于当前 revision/filter |
| 404 | `WORK_NOT_FOUND` | work 不存在或不在 publication view |
| 404 | `ENTITY_NOT_FOUND` | kind/identity 不存在或不在 publication view |
| 404 | `PARTITION_NOT_FOUND` | manifest 未声明请求 partition |
| 409 | `REVISION_MISMATCH` | cursor/partition 与请求 revision 不一致 |
| 410 | `ARTIFACT_WITHDRAWN` | 已撤回版本不可继续读取，且政策允许公开该状态 |
| 413 | `REQUEST_TOO_BROAD` | bbox/filter/limit 超过冻结边界 |
| 429 | `RATE_LIMITED` | 部署环境启用限流；需返回安全重试提示 |
| 500 | `INTERNAL_ERROR` | 未分类服务器错误 |
| 503 | `PUBLICATION_UNAVAILABLE` | publication view 暂不可用且可重试 |

rights denied 通常不是通过猜测 asset URL 获得的独立 `403` endpoint；serializer 应先隐藏路径，并在允许时返回机器可读 unavailable reason。若未来提供受保护原文件下载，则另行安全设计，不属于本契约。

## 6. Works 契约

### 6.1 Endpoint

```text
GET /api/works?locale=<locale>&profile=<optional-profile>
```

### 6.2 响应边界

Works item 至少计划包含：

- work identity、domain/profile；
- title、summary、alternate title 的 published locale resolution；
- content/map capabilities；
- 可用 tab/layer/time-axis 摘要；
- schema/artifact compatibility；
- 由统一 reporter 生成的命名计数。

Shanhaijing 计数必须分开：

- `uniqueCreatureConceptCount`；
- `textualOccurrenceCount`；
- `corpusCoverage`，包含已审 passage、冻结总 passage 与明确分母版本；
- 其他 kind 数量按 registry reporter 命名。

不得提供一个含义模糊的 `creatureCount` 代替上述三项。媒体数量、音频数量和候选地数量也不得被解释为 corpus completeness。

### 6.3 Static 对应物

候选路径：

```text
works.<locale>.<artifact-version>.json
```

当前既有 `works.<locale>.json` 的兼容期和 alias/redirect 规则待实施计划冻结。versioned artifact 必须由 manifest 引用，客户端不得扫描目录猜文件名。

## 7. Atlas Lite 与 Full

### 7.1 Endpoint

```text
GET /api/works/:workSlug/atlas?locale=<locale>&detail=lite|full
```

`detail` 缺省值候选为 `lite`。非法值不得通过 catch 静默改为 lite；应返回 `400 INVALID_REQUEST`，除非兼容测试批准过渡行为。

### 7.2 Lite 边界

Lite 用于首屏、导航、筛选与选择。计划包含：

- work/profile 元数据和 capability descriptors；
- section/passages 的导航索引，但不含未预算长全文；
- creature concept 摘要；
- occurrence identity、passage reference、短表记和必要位置索引；
- textual place/topology 的 lite 节点与关系摘要；
- taxonomy axes/terms 与可复现聚合计数；
- map layer/partition index，而非超预算完整 GeoJSON；
- 四轴 chronology 的模式元数据与 lite claim index；
- sources 的可显示摘要；
- 可发布媒体缩略元数据；
- sound availability/disclosure 摘要，不默认包含可加载 path；
- generated counts 与 coverage denominator revision。

Lite 不应包含：

- 长 passage 上下文或完整版权受限文本；
- 每条 taxonomy assignment 的完整 evidence；
- 全部 candidate geometry、反证和长研究摘要；
- 高分辨率媒体、生成输入 manifest 或未发布原始 URL；
- 音频 generation recipe 的完整内部数据；
- 为绕过 detail endpoint 而无限增长的领域字段。

### 7.3 Full 边界

`full` 是受控读取模式，用于：

- 小型 Pilot 调试；
- static materialization 输入；
- parity fixture；
- 管理范围内的导出/验证。

Full 仍经过完全相同的 publication derivation，不是 raw database dump。它可以组合 detail 可发布字段，但不得暴露 rights denied 路径、draft translation、内部备注、凭据或未审原文。

当 full raw/gzip bytes、parse、memory 或静态构建超过 [PERFORMANCE_BUDGETS.md](PERFORMANCE_BUDGETS.md) 的冻结预算时，Shanhaijing static transport 必须使用 index + partitions；不得为了保持当前单文件 bake 而放宽预算。

是否允许生产动态客户端请求 `detail=full`、是否需要 build-only authorization，以及 response size 上限，均为 Gate 0 未决。

### 7.4 Atlas Envelope

候选附加元数据：

```ts
type AtlasMeta = {
  detail: "lite" | "full";
  counts: CountReport;
  coverage: CoverageReport;
  partitions: PartitionIndex[];
  capabilities: DomainCapabilities;
};
```

collection keys 由 registry `collectionKey` 生成并经 completeness test，不在 API handler 中重复维护一份手写列表。

## 8. Entity Detail

### 8.1 Endpoint

```text
GET /api/works/:workSlug/entities/:kind/:identity?locale=<locale>
```

`:kind` 必须来自 registry；`:identity` 接受冻结 public slug/UUID 规则。旧 slug 若有明确 redirect，可返回 canonical identity；不得把错误 kind 当作其他 kind 查询。

### 8.2 Detail 内容

按 kind 返回可发布完整视图，候选包括：

- identity、label、summary、状态与 locale resolution；
- passage/context 与引用范围；
- source/evidence links；
- taxonomy assignments 及各自 attestation/interpretation；
- editorial dispute、unresolved/provisional 状态和公开说明；
- textual topology 与 place candidate/candidate set；
- chronology claim，保持四轴独立；
- relations 与可追溯端点；
- media gallery metadata；
- sound availability、disclosure、text alternative 与通过 gate 的 source path；
- canonical links、aliases 和 supersession/redirect。

不同 kind 的 `item` 使用 discriminated union，由 registry 中的 full/detail schema 校验。通用 envelope 不允许把所有领域字段塞进 `Record<string, unknown>` 后绕过 schema。

### 8.3 Detail 正常空状态

以下情况是可表达状态，不是服务器错误：

- 内容有效但无媒体；
- 无学术候选地；
- occurrence 尚未归并到 resolved concept；
- chronology claim undated；
- sound 未制作或被 rights gate 隐藏；
- taxonomy assignment 明确为 unknown/pending review。

响应使用明确空数组、nullable 字段和状态/reason；不得伪造占位证据、坐标、年份或 asset path。

## 9. Search 契约

### 9.1 Endpoint

```text
GET /api/search?q=<query>&locale=<locale>&work=<optional-work>&kind=<repeatable-kind>&limit=<limit>&cursor=<cursor>
```

最小/最大 query 长度、默认 limit、最大 limit 和 rate policy 需通过中英文 Pilot fixture 冻结。当前固定 200 条截断不是未来契约。

### 9.2 Searchable kinds

Shanhaijing 至少计划覆盖：

- `creature_concept`：规范名、published aliases 和摘要；
- `creature_occurrence`：原文表记、passage reference 与可发布 context；
- `textual_place`；
- `passage`；
- `taxonomy_term`；
- 人、神、部族及 Pilot 冻结的其他 kind；
- edition、commentary、visual/research 条目中明确允许搜索的 kind。

最终 kind 枚举必须来自 registry，并与 Atlas、detail、selection、static index 和 tests 共用。concept 与 occurrence 命中必须保持不同 kind，不可折叠成不可追溯的“异兽”结果。

### 9.3 Search item

```ts
type SearchItem = {
  kind: EntityKind;
  id?: string;
  slug: string;
  workSlug: string;
  label: string;
  context: string;
  matchedField: SearchField;
  matchedText?: string;
  passageReference?: string;
  requestedLocale: Locale;
  resolvedLocale: Locale;
  fallbackUsed: boolean;
};
```

`context` 必须来自可发布内容并限制长度；不得泄漏 draft translation、内部 editorial note 或版权不允许的长文本。是否返回安全高亮 ranges 而非 HTML 字符串，待实现时冻结；禁止服务器返回未经转义的 markup。

### 9.4 Normalization 与排序

需用 fixture 冻结：

- Unicode normalization；
- 简繁、异体字和古字是否仅作为 alias 处理；
- 中文字符匹配/分词；
- 拼音及声调 normalization；
- 英文大小写、标点和复数；
- alias 权重；
- passage reference 精确匹配；
- concept、occurrence 与 place 的排序权重。

Normalization 不得篡改展示文本，也不得把编辑上不同的 concept 自动合并。排序应稳定，并以 canonical identity 作为最终 tie-breaker。

### 9.5 Pagination 与 truncation

搜索响应必须包含 `nextCursor`、`limit`、`returned` 和 `truncated`。cursor 至少绑定：

- normalized query；
- locale 与 resolved fallback policy；
- work/kind filters；
- publication revision；
- stable sort key。

revision 变化导致 cursor 失效时返回 `409 REVISION_MISMATCH`，不能静默继续产生重复或遗漏。

### 9.6 Static search parity

静态模式不得依赖 dynamic `/api/search`。候选方案为 versioned search index partitions，由相同 search providers 与 publication view 生成。

Parity 至少抽样比较：

- 命中 kind/identity 集合；
- label/context 与 locale resolution；
- normalization fixture；
- 排序与分页边界；
- rights/editorial withdrawal 后的不可见性。

若静态搜索采用能力更弱的算法，必须在 Gate 0 明确批准差异、UI 披露和测试范围；不得笼统声称与动态 ILIKE “一致”。

## 10. Map Viewport 与 Partition

### 10.1 动态 Endpoint 候选

```text
GET /api/works/:workSlug/map
  ?locale=<locale>
  &layer=<textual_topology|scholarly_candidates|modern_comparison|occurrence_distribution|thematic>
  &bbox=<west,south,east,north>
  &zoom=<zoom>
  &candidateSet=<candidate-set-slug>
  &section=<section-key>
  &filter=<canonical-filter>
  &limit=<limit>
  &cursor=<cursor>
  &revision=<publication-revision>
```

实际 `layer` key 必须与 [GEOGRAPHY_AND_MAPS.md](GEOGRAPHY_AND_MAPS.md)、profile、legend 和 static manifest 一致。上述长名称是候选语义，不是冻结 enum。

### 10.2 Layer-specific 参数

- `textual_topology`：优先使用 frozen section/route partition；使用渲染布局 extent，不接受或伪装 WGS84 历史坐标；
- `scholarly_candidates`：要求明确 candidate set 或冻结的 compare mode；bbox 为 WGS84，允许 point/line/polygon；
- `modern_comparison`：必须返回 basemap/style attribution 和 licence references；
- `occurrence_distribution`：feature identity 为 occurrence，不只返回 concept aggregate；
- `thematic`：filters 来自 taxonomy registry，并返回可复现 filter echo。

互斥或缺失参数返回 `400 INVALID_REQUEST`。候选地层不得默认拼接不同 candidate sets 形成伪共识。

### 10.3 Map 响应

候选形态：

```ts
type MapEnvelope = CollectionEnvelope<MapFeature> & {
  layer: MapLayer;
  candidateSet: string | null;
  partitionKey: string;
  request: {
    bbox: [number, number, number, number] | null;
    zoom: number | null;
    section: string | null;
    filters: CanonicalFilter[];
  };
  lod: {
    level: string;
    clustered: boolean;
    geometryPrecision: string;
  };
  attribution: AttributionRef[];
};
```

每个 feature 至少有 stable identity、kind、layer、geometry/layout kind、label priority、source/interpretation 摘要和 detail link identity。GeoJSON geometry 与 topology layout coordinates 使用不同 discriminant，防止误读。

### 10.4 Clusters、LOD 与计数

- cluster 可由服务器、预计算 artifact 或客户端生成，但算法/version 必须可诊断；
- cluster count 是当前 feature/occurrence 计数，不得冒充 unique concept count；
- LOD 可以简化 geometry/label，但不能删除争议状态或把多 candidate 合并为一个确定点；
-同一实体跨 partition 重复时保留 canonical identity，业务 count 由 reporter 去重；
- viewport limit 超出时必须 cursor/partition 继续或返回 `REQUEST_TOO_BROAD`，不可静默裁掉而不标 `truncated`。

### 10.5 Stable partitions

partition key 必须：

- 对同一 artifact version 稳定；
- 可由 manifest 枚举；
- 不依赖请求时间或数据库无序结果；
- 包含足够 layer/candidate-set/section/spatial 语义；
- 有 canonical sort 与 overlap/dedup 规则；
- revision 变化时生成新 artifact 或明确失效。

partition 算法、zoom buckets、bbox quantization、region grid 与最大 feature 数由 100/500/1000+ 基准冻结，不在本文伪定数值。

## 11. Sound 与 Audio 路径

### 11.1 Detail 内嵌摘要

Entity detail 可返回 sound links 摘要；只有通过 publication gate 的 sound item 才能返回可加载 path。候选 item：

```ts
type SoundPublicationItem = {
  id: string;
  slug: string;
  role: SoundRole;
  title: string;
  description: string;
  textAlternative: string;
  disclaimer: string;
  sourceAttestation: SourceAttestation;
  outputInterpretation: OutputInterpretation;
  durationSeconds: number;
  mimeType: string;
  byteSize: number;
  sha256: string;
  path: string;
};
```

`text_attested` 只描述文字证据，不能将生成 waveform 标为古代真实录音、真实异兽发声或确定复原。

### 11.2 独立 Sound Endpoint 候选

若性能基准证明 detail 不应携带全部 sound metadata，可使用：

```text
GET /api/works/:workSlug/entities/:kind/:identity/sounds?locale=<locale>
```

首版不规划公开 raw generation manifest、上传、转码或流式签名服务。静态部署优先直接引用 manifest 已验证的 versioned Web derivative。

### 11.3 Fail-closed path exposure

只有同时满足以下条件才暴露 `path`：

- sound asset、link 与 subject 可发布；
- rights 为 `verified`，且 licence/输入素材规则通过；
- output interpretation 合法并与 source attestation 分离；
- evidence、双语 published text alternative 与 disclaimer 完整；
- generation/input manifest verified；
- 文件存在，profile、byte size 与 SHA-256 验证通过；
- profile registry 允许该 role；
- 人工听审状态符合冻结政策；
- 对 static 模式，artifact 已包含对应文件且 parity 通过；
- 未处于 withdrawal、pending、rejected 或 stale 状态。

否则返回无 path 的 availability 状态，例如 `not_produced`、`rights_denied`、`review_pending`、`withdrawn` 或 `technical_invalid`；最终枚举由 sound policy 冻结。可返回的来源信息必须非敏感且符合 licence policy。

客户端不得通过可预测命名拼接被隐藏的 URL。静态构建也不得把 rights denied 文件留在 public 目录，即使 JSON 未引用。

## 12. Publication Derivation

所有 endpoint 和 artifact 必须调用同一个可测试 publication derivation。最小顺序：

1. 验证 work/domain ownership；
2. 应用 corpus/editorial visibility；
3. 解析 requested locale，只允许 published fallback；
4. 验证 source/evidence integrity；
5. 保留 unresolved/disputed/provisional 的真实状态；
6. 由 registry 判断 kind 是否进入当前 transport；
7. 对 media/sound 单独执行 rights、provenance、manifest、checksum 与 disclosure gate；
8. 运行 transport serializer 和共享 response schema；
9. 由统一 reporters 生成 counts/coverage，不从序列化数组长度临时猜业务统计。

内容和资产分别派生：缺少或拒绝媒体/声音不得阻断符合内容政策的文字实体。相反，文字实体可发布也不能自动授权其资产路径。

不得将未过滤数据库行放入共享 cache 后再由客户端隐藏。withdrawal 必须更新 `publicationRevision`、失效动态 cache，并重生成或撤回 static artifact。

## 13. Shared Schemas 与 Registry

实施时应建立共享、可版本化的 request/response schemas，但具体 package 位置需按现有 TypeScript workspace 边界决定。

每个 registered kind 必须提供或显式声明 `none`：

- lite schema；
- full/detail schema；
- search item/provider；
- map adapter；
- media/sound serializer；
- static inclusion/partition；
- count reporter；
- selection/drawer capability。

completeness test 应从 registry 生成 kind enum、collection union、search union 和 static plan，防止 API、Web 和 bake 各维护一份可漂移列表。

所有动态 response 在发送前、所有静态 JSON 在写入后均经相同 schema family 验证。只验证 JSON 可解析不算 contract pass。

## 14. Static Artifact 契约

### 14.1 候选命名

在性能和 manifest 评审冻结前，采用下列候选命名语义：

```text
works.<locale>.<artifact-version>.json
index.<work>.<locale>.<artifact-version>.json
section.<section-key>.<locale>.<artifact-version>.json
map.<layer>.<partition-key>.<locale>.<artifact-version>.json
entity.<kind>.<partition-key>.<locale>.<artifact-version>.json
search.<partition-key>.<locale>.<artifact-version>.json
manifest.<work>.<locale>.<artifact-version>.json
```

最终路径可加入 work 子目录以减少名称碰撞；一旦冻结，必须由 manifest 生成引用，不允许客户端散落手写模板。`section-key`、`partition-key` 和 slug 必须 path-safe，且不能用用户输入直接构造任意文件路径。

### 14.2 Manifest 最低字段

API/static manifest 至少计划记录：

- work/domain/profile；
- schema、artifact 与 publication revision；
- requested/resolved locale 与 fallback policy；
- source/seed/corpus revision；
- generator name/version；
- generated time；
- 每个 artifact 的 logical role、path、byte size、SHA-256、content type；
- partitions、layer、section、kind 与依赖关系；
- separately named concept/occurrence/coverage counts；
- asset bundles 与 rights verifier report reference；
- parity report reference；
- withdrawal/supersession 信息。

资产级衍生链由 [ASSET_MANIFEST_SPEC.md](ASSET_MANIFEST_SPEC.md) 进一步定义；API manifest 只引用已验证资产，不复制另一套不一致 provenance。

### 14.3 Static 获取失败

静态 host 可能只返回 HTML/404，无法生成动态 `ErrorEnvelope`。客户端必须：

- 先读取 manifest；
- 只请求 manifest 声明的文件；
- 检查 HTTP status、content type、schema、version 与 checksum policy；
- 将缺失、版本错配、解析失败和 checksum mismatch 映射为可诊断客户端错误；
- 不自动退回未知旧版本；
- 不把缺 partition 当作“该区域没有数据”。

### 14.4 Dynamic/static parity

Parity verifier 至少比较：

- 两种 transport 均通过相同 schema；
- work、kind、UUID/slug 和 redirect 集合一致；
- concept、occurrence、coverage 三项分别一致；
- locale resolution 与 fallback 一致；
- Atlas lite/full 或 partition 组合后的语义等价；
- 抽样 detail、search、map feature 与 chronology claim 等价；
- source/evidence 和 unresolved/disputed 状态一致；
- rights denied media/sound 均不暴露 path；
- stale、orphan、extra 和 missing static files 被报告并阻断；
- canonical sort、cursor/partition overlap 和 count dedup 一致。

字节级相等不是所有 transport 的必要条件，但 canonical fixture 可用于检测无意 serializer 漂移。允许差异必须有明确字段、理由、测试和 `DECISION_LOG.md` 记录。

## 15. Cache 与 HTTP Headers

### 15.1 Dynamic 候选

动态 GET 响应候选支持：

- `ETag`，绑定 schema version、publication revision、locale、detail、filters/partition；
- `If-None-Match` / `304`；
- `Cache-Control`，TTL 由内容类型和 withdrawal 要求冻结；
- `Vary` 只包含真实影响响应的 headers，locale 优先使用显式 query；
- `X-Request-Id` 或标准 trace header，值不得泄露内部信息。

ETag 不能只依据压缩字节或数据库更新时间，必须在 publication semantics 变化时改变。

### 15.2 Static 候选

- versioned immutable artifact：长缓存并可 `immutable`；
- manifest/entry pointer：短缓存或 revalidation；
- asset derivative：由 checksum/version 命名并使用 immutable cache；
- withdrawal 时发布新 manifest/revision，并按 release plan 处理旧 URL；高风险资产不能仅等待 TTL 自然过期。

最终 TTL、CDN purge、Cloudflare cache key 和 rollback 规则必须在 staging 验证后冻结。本文不授权任何 Cloudflare 配置或部署。

## 16. Fallback 与兼容策略

- Locale fallback 只到 work 默认 locale 的 `published` 内容；
- static transport 不可在文件缺失时静默改请求其他 locale；
- dynamic API 不可在非法 `detail`、kind、layer 或 cursor 时静默使用默认值；
-旧 slug 仅按冻结 redirect table 返回 canonical identity；
- 旧 schema major 不保证自动兼容，支持窗口需在 release checklist 记录；
- partition 缺失不等于空结果；
- media/sound path 缺失是正常 availability 状态，不能由客户端猜路径；
- API 不可用时是否允许自动切 static，只有在 version/schema/publication revision 完全匹配且产品明确支持时才可考虑。

## 17. Security、Privacy 与 Abuse 边界

- 只读 public API 不接受 raw SQL、任意 file path、任意 source URL fetch 或未约束 filter expression；
- 所有 path/query 经共享 schema 与 allowlist；
- cursor 需防篡改或可安全验证；
- error、manifest 与 source revision 不暴露凭据、内部路径或未发布素材；
- search context 限长并安全编码；
- CORS、rate limits、compression bomb/oversized response 与 CDN 行为在部署前验证；
- checksum 用于完整性与衍生追踪，不替代签名、授权或 licence review；
- public asset URL 不应承担访问控制；不允许发布的文件必须不进入 public artifact。

## 18. Verifier 与 Contract Tests

规划命令族：

- `npm run verify:shanhaijing-api`
- `npm run verify:shanhaijing-static-parity`
- `npm run verify:shanhaijing-geography`
- `npm run verify:shanhaijing-sound`

当前这些命令未实现，也没有真实通过报告。实现后的报告进入 `docs/shanhaijing/generated/`，写明命令、输入 checksum、schema/artifact/publication revision 与 evidence level。

最低测试矩阵：

### 请求与错误

- 合法/非法 work、slug、UUID、kind、locale、detail、layer、bbox、zoom、filters、limit、cursor；
- unknown query 参数策略；
- 404、409、413、429、500/503 envelope；
- error 不泄漏 SQL/path/未发布数据。

### Locale 与 publication

- requested published；
- default-locale published fallback；
- requested/default 都不可发布；
- draft/reviewed 不泄漏；
- unresolved/disputed 如实保留；
- 内容可发布但媒体/声音 denied。

### Works/Atlas/detail

- kind/collection registry completeness；
- lite 排除长字段；
- full 仍经过 publication gate；
- detail discriminated union；
- concept/occurrence/coverage 分别计数；
- empty media/candidate/sound/undated 正常表达。

### Search

- 中英文、alias、Unicode、passage reference、拼音候选策略 fixture；
- concept 与 occurrence 不合并；
- stable sort、limit、cursor、truncated；
- revision mismatch；
- context 不泄漏 unpublished prose；
- dynamic/static sampled parity。

### Map

- 三层 geography 不混用；
- topology layout 不伪装 WGS84；
- candidate set 完整切换；
- bbox/zoom/filter normalization；
- point/line/polygon schema；
- occurrence feature 与 concept count 区分；
- partition overlap/dedup、LOD 与 truncation；
- 100/500/1000+ fixture。

### Sound/media

- verified happy path；
- pending/rejected/unknown rights；
- missing disclaimer/alt/evidence/manifest/reviewer；
- missing file、bad checksum、stale derivative、withdrawal；
- JSON 不暴露 path，public artifact 也不包含文件；
- static/dynamic parity。

### Cache/version/static

- ETag 随 publication revision 改变；
- 304 不改变 envelope 语义；
- immutable path 与 manifest cache 分离；
- missing/extra/orphan/stale partition；
- schema/artifact version mismatch；
- manifest byte size/SHA-256 与真实文件一致；
- 回滚版本可枚举且不会引用已撤回资产。

## 19. Evidence 纪律

API 验证证据分五级记录：

1. `local_candidate`：文档、unit/contract fixture 或本地服务；
2. `isolated_database`：全新隔离数据库 migration/seed/API；
3. `built_static_artifact`：实际 bake/build、manifest、checksum 与 parity；
4. `staging`：真实托管、CDN/cache/CORS/network/smoke；
5. `production`：单独授权后发布、版本 manifest、rollback 与 production smoke。

低层证据不得被描述为高层完成。schema test 通过不等于 static file 存在；static parity 通过不等于 staging cache 正确；staging smoke 不等于 production 已部署。

## 20. Gate 0 未决事项

以下事项未冻结前，本文件不能作为 endpoint 实施授权：

- Shanhaijing 最终 entity/search kind 与 collection keys；
- shared schema package 边界、schema version 格式与兼容窗口；
- canonical locale、alias normalization 和 item/envelope fallback 表达；
- detail public identity、redirect 与 occurrence anchor；
- lite/full 字段清单、full endpoint 的生产可用性和 size limit；
- search normalization、权重、matched context、limit、cursor 与静态索引算法；
- map layer key、bbox/extent 语义、candidate set compare mode、zoom bucket 与 partition 算法；
- cluster/LOD 的服务端、静态与客户端责任；
- sound availability reason、独立 endpoint 与 path/version 命名；
- publication revision 生成、withdrawal、ETag、TTL、CDN purge 与 rollback；
- static 目录、文件命名、manifest schema 与旧单文件兼容期；
- error code 完整列表、rate policy 和 request ID 机制；
- 100/500/1000+ payload、parse、latency、memory 和 bytes 预算；
- corpus/editorial、历史地理、rights、sound、accessibility、API 与 operations reviewers。

## 21. 本文件冻结条件

本文件只有同时满足以下条件才可从 `draft` 进入 `frozen`：

1. 核心蓝图、数据字典、架构、地理、媒体和声音文档之间的 kind/status/layer/rights 枚举一致；
2. 冻结 Pilot 可构造 Works、lite、detail、search、map、sound 的正负 fixture；
3. concept、occurrence、coverage 三种计数由同一 reporters 生成并有 denominator revision；
4. locale normalization、published-only fallback 和无可发布翻译行为经双语 review；
5. registry 能生成共享 kind/collection/search/static completeness contract；
6. lite/full/detail 字段和 size boundary 通过性能预算评审；
7. search pagination/truncation、normalization 与 dynamic/static parity 规则冻结；
8. 三层 geography、candidate sets、bbox/extent、partition 和 LOD 规则经历史地理与性能评审；
9. sound/media fail-closed fixture 证明 JSON 与 public artifact 都不暴露 denied path；
10. manifest、artifact naming、SHA-256、cache invalidation、withdrawal 和 rollback 规则冻结；
11. error envelope、安全边界、CORS/rate/cache 候选经 API/operations review；
12. verifier 输出 schema、命令名、报告路径和五级 evidence 纪律冻结；
13. 所有未决裁决进入 `DECISION_LOG.md`，风险、owner 与 trigger 进入 `RISK_REGISTER.md`；
14. reviewer、批准日期、适用 corpus/schema/artifact version 与 checksum 被记录。

在上述条件完成前，本文件保持 `draft`，Gate 0 保持 `blocked`，不得据此宣称 Shanhaijing API、静态分片或 Cloudflare 发布已完成。
