# 《山海经 Atlas》实体与数据字典

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 实施状态：候选契约；尚无 migration、schema、seed 或 API 实现

## 1. 设计原则

1. 所有领域记录归属于明确的 work/domain，禁止跨 profile 串联。
2. 底本、passage、occurrence、concept 分层，不能以 concept 代替文本证据。
3. 使用稳定 UUID 作为数据库标识，稳定 slug/reference 作为可读标识。
4. 来源、解释、地理置信度和权利状态独立。
5. 多轴分类使用 assignment，不向 concept 表增加不断扩张的布尔列。
6. 地理事实分为文本拓扑、学术候选和现代参照。
7. 未决项是一等状态，禁止用空字符串、伪坐标或临时 concept 隐藏。
8. 所有发布翻译、媒体和声音 fail closed。
9. 生成数据必须记录输入、生成器版本与 checksum。
10. 本字典中的名称与枚举在 Pilot 前均为候选；冻结后变更必须 migration + decision。

## 2. 通用字段约定

除纯连接表外，领域表应评估以下字段：

| 字段 | 类型候选 | 规则 |
|---|---|---|
| `id` | UUID | 稳定、不可复用 |
| `work_id` | UUID | 必须引用《山海经》work；参与复合外键 |
| `slug` | text | 小写 ASCII kebab-case；在 work 内唯一 |
| `status` | enum | 使用领域明确状态，不用自由文本 |
| `source_id` | UUID | 主来源；多来源用 evidence/link 表 |
| `created_at` | timestamptz | 记录建立时间 |
| `updated_at` | timestamptz | 内容变更时间 |
| `reviewed_by` | text/actor ID | 冻结前确定 reviewer 身份模型 |
| `reviewed_at` | timestamptz | 审核时间 |

稳定 UUID 候选采用确定性 namespace + canonical key 生成，但具体算法须在 seed 策略冻结后记录。slug 改名不能更换 UUID；旧 slug 需要 redirect/alias 记录。

## 3. 通用状态维度

### 3.1 Translation status

候选值：

- `draft`
- `reviewed`
- `published`
- `superseded`

API 只允许返回 `published` 或经冻结规则明确允许的 fallback。

### 3.2 Source attestation

候选值：

- `text_direct`：baseline passage 直接支持；
- `text_variant`：异文支持；
- `commentary`：注本或传统解释；
- `scholarly_source`：现代研究；
- `editorial_inference`：编辑推断；
- `none`：无直接文本证据，仅允许特定演绎资产使用。

### 3.3 Interpretation class

候选值：

- `text_transcription`
- `editorial_summary`
- `scholarly_hypothesis`
- `artistic_interpretation`

### 3.4 Geographic confidence

候选值：`high`、`medium`、`low`、`unknown`。每个值都必须有理由和 source；它只适用于候选地 claim。

### 3.5 Rights status

候选值：`verified`、`pending`、`rejected`、`unknown`。只有 `verified` 且 provenance 完整的 bundled asset 可由 API 暴露本地路径。

上述四个维度不得互相推导。

## 4. 语料实体

### 4.1 `text_editions`

表示一个可识别版本或底本。

关键字段：`id`、`work_id`、`slug`、名称、责任者、日期区间、出版信息、source URL、asset URL、rights status、retrieved_at、source checksum、transcription checksum、`is_inventory_baseline`、review status。

约束：

- 同一 work 至多一个 active baseline。
- URL 必须使用允许协议。
- checksum 为 64 位小写 SHA-256。
- baseline 必须 rights 与完整性审核通过。

### 4.2 `text_sections`

表示篇、卷、山系、水系或其他层级节点。

关键字段：`edition_id`、`parent_id`、`section_kind`、`reference`、`ordinal`、标题、层级深度。

约束：同一 edition 内 reference 唯一；父节点必须属于同 edition；ordinal 在同 parent 下稳定唯一。

### 4.3 `text_passages`

表示最小稳定审核与引用单位。

关键字段：`edition_id`、`section_id`、`reference`、`ordinal`、原文、规范化文本、source locator、segmentation version、checksum、audit status。

约束：reference 在 edition 内唯一；checksum 与文本一致；不能跨 edition 关联 section。

### 4.4 `text_variants`

记录 baseline passage 与其他版本的差异。

关键字段：`passage_id`、`edition_id`、variant text、locator、critical note、source、review status。

### 4.5 `passage_translations`

关键字段：`passage_id`、locale、translation/summary、translator、source、status。

主键候选：`(passage_id, locale)`。

### 4.6 `passage_audits`

记录逐段提及审核。

候选状态：`included_found`、`excluded_only`、`pending_review`、`not_applicable`。实际命名在 Pilot 后冻结。

关键字段：passage、policy version、reviewer、status、notes、reviewed_at。

## 5. 编辑决定

### 5.1 `editorial_decisions`

记录收录/排除、merge/split、reassign、canonical name、segmentation correction 等决定。

关键字段：

- `decision_kind`；
- subject kind 与 subject ID；
- adopted outcome；
- alternatives；
- rationale；
- source/evidence links；
- reviewer、decision date、status；
- `supersedes_decision_id`。

所有影响计数或稳定 reference 的决定必须存在，不允许只留在 commit message 或聊天记录。

## 6. Creature concept 与 occurrence

### 6.1 `creature_concepts`

表示编辑归并后的独立生灵概念。

关键字段：`id`、`work_id`、`slug`、canonical key、concept status、importance、default icon key。

候选 concept status：`resolved`、`disputed`、`provisional`、`superseded`。未决 occurrence 不应通过伪造正常 concept 解决。

不得包含虚构生卒年或单一“真实坐标”。

### 6.2 `creature_concept_translations`

关键字段：concept、locale、canonical name、aliases、summary、editorial note、translation status。

别名建议规范化为独立 alias 表，以支持来源、locale 和搜索；最终结构在 API/search 契约前冻结。

### 6.3 `creature_occurrences`

表示具体 passage 中的一次提及。

关键字段：

- `concept_id` 可空，用于 unresolved；
- `passage_id`；
- surface form；
- quote start/end 或稳定范围；
- occurrence ordinal；
- grammatical/narrative role；
- named flag；
- description scope；
- editorial confidence；
- review status。

约束：必须有 passage；范围合法；同一 passage 的稳定 occurrence key 唯一；concept 若存在必须属于同一 work。

### 6.4 `occurrence_candidates`

保存 included 前的疑似提及及 excluded/pending 裁决，避免排除记录丢失。

关键字段：passage、范围、surface form、proposed kind、decision status、exclusion reason、decision ID。

## 7. 其他领域实体

以下实体不得塞进 creature；具体独立表与通用 `domain_entities` 的边界需在 Pilot 后冻结。

| kind | 表达对象 | 最低要求 |
|---|---|---|
| `textual_place` | 山、海、荒、国、水、泽、路径节点 | passage、kind、名称、拓扑关系 |
| `deity` | 神祇或神性实体 | occurrence 与编辑边界 |
| `person` | 人物 | occurrence；不伪造生卒年 |
| `tribe` | 部族、群体、国人 | occurrence 与称谓范围 |
| `plant` | 植物及异常植物 | occurrence、效果证据 |
| `mineral` | 矿物、玉石等 | occurrence、地点关联 |
| `object` | 器物、服饰、祭器 | occurrence、用途证据 |
| `ritual` | 祭祀、禁忌、仪式行为 | passage、参与者、效果 |
| `condition_effect` | 疾病、药用、灾异、征兆、效果 | trigger、effect、evidence |

共享字段可以复用，但领域语义、搜索标签和 drawer 内容必须由注册 descriptor 明确提供。

## 8. Taxonomy 实体

### 8.1 `taxonomy_axes`

关键字段：axis key、双语名称、description、applies-to kinds、sort order、status。

### 8.2 `taxonomy_terms`

关键字段：axis、term key、父 term 可选、双语标签、definition、sort order、status。

分类不是全局互斥树；父子关系只用于导航，不自动排除其他 term。

### 8.3 `taxonomy_assignments`

关键字段：axis、term、subject kind/ID、适用 occurrence 或 concept、attestation、interpretation class、passage/source、editor note、confidence、review status。

约束：subject 与 term 适用 kind 一致；每个 assignment 必须有 passage 或 source；不得用 concept 的 assignment 静默覆盖相反的 occurrence 证据。

## 9. 文本地理实体

### 9.1 `textual_places`

表示文本中的地点概念，不要求绝对坐标。

关键字段：place kind、canonical key、concept status、default topology node key。

### 9.2 `place_occurrences`

连接 textual place 与 passage，保存表记、范围和上下文。

### 9.3 `topology_edges`

关键字段：from/to textual place、relation kind、direction、distance value、distance unit、sequence ordinal、passage/source、attestation、interpretation class、conflict status。

关系候选：`next_in_route`、`source_of`、`flows_into`、`distance_direction`、`surrounds`、`located_at`。最终枚举由地理政策冻结。

布局坐标不得存入历史地理字段；如需缓存，进入明确的 derived layout 表/manifest。

### 9.4 `candidate_sets`

表示同一学者、地图或研究体系的一组相互一致候选。

关键字段：名称、claimant、source、date interval、scope、review status。

### 9.5 `place_candidates`

关键字段：textual place、candidate set、GeoJSON geometry、candidate name、claimant、source、evidence summary、counterevidence、geographic confidence、status。

约束：合法 GeoJSON；一个 textual place 允许 0..N 候选；没有唯一候选的强制约束。

## 10. 四轴 chronology 实体

### 10.1 内部顺序

直接使用 section/passages/occurrences ordinal，不映射到公元年份。

### 10.2 `chronology_claims`

用于成书编订、注本版本、图像研究等有来源的日期主张。

关键字段：axis、subject kind/ID、start/end、precision、calendar/basis、claimant、source、confidence、interpretation、review status。

候选 axis：`composition_redaction`、`edition_commentary`、`visual_research_asset`。内部顺序不伪装为该表中的 BCE/CE claim。

## 11. Relation 实体

### 11.1 `domain_relations`

支持 creature、place、deity、person、tribe、plant、mineral、object、ritual、effect 等多 kind 节点。

关键字段：from kind/ID、to kind/ID、relation kind、passage/source、attestation、interpretation class、directionality、review status。

必须验证两端属于同一 work；关系 kind 的适用端点由 registry/词表约束。

## 12. Media 与 icon 实体

### 12.1 `media_assets` 扩展

沿用现有媒体 provenance/rights 基础，候选新增 role：

- `creature_depiction`
- `historical_illustration`
- `text_folio`
- `scholarly_map`
- `reconstruction_map`
- `habitat_reference`

保留已有 role。role 不得推导 interpretation 或历史真实性。

每项必须记录 source page、original URL、creator、date、licence、licence URL、attribution、retrieved_at、SHA-256、双语 alt/caption、media role、depiction status、interpretation class、crop/derivative 链。

### 12.2 `media_links`

使用多 kind subject 关联 asset、concept、occurrence、place、passage 等，保存 sort order、展示范围和 link note。

### 12.3 `creature_icon_registry`

关键字段：icon key、taxonomy hints、designer、source、licence、version、path、checksum、size/readability test status、review status。

地图 icon 与 drawer illustration 分离，不自动互相继承解释等级。

## 13. Sound 实体

### 13.1 `sound_assets`

关键字段：semantic role、rights status、path、codec、sample rate、channels、duration、loop points、integrated LUFS、true peak、description/transcript、disclaimer、checksum。

候选 role：`creature_vocalization`、`environment_ambience`、`ritual_reconstruction`、`narration`。

### 13.2 `sound_links`

关联 concept、occurrence、place、passage 或 ritual，保存 sort order 和适用范围。

### 13.3 `sound_evidence`

保存 passage 中的声描写、注本/研究、analog species/material/environment、attestation 与 interpretation class。

### 13.4 `sound_generation_manifests`

关键字段：generator/model/version、seed、prompt 或 DSP recipe、输入素材及许可、参数、输入/输出 checksums、generated_at、人工后期、reviewer。

声音解释等级候选：`text_attested`、`inferred_analogy`、`artistic_interpretation`。它描述依据/输出关系，不得把生成波形标成真实古代发声。

## 14. Source 与 evidence

现有 `sources` 应扩展或通过 subtype 支持：古籍版本、注本、校勘、历史地理研究、博物馆、图像、地图、声学类比和现代物种资料。

字段级主张通过 evidence/link 表连接具体 source；仅在页面底部列来源不足以满足追溯要求。

## 15. 发布与可见性派生

API 可见性至少同时检查：

- subject 本身未 superseded/rejected；
- locale 内容为 published 或符合冻结 fallback；
- bundled asset rights verified；
- provenance、checksum、alt/disclaimer 完整；
- 领域 registry 声明该 kind 可进入当前 endpoint/static bake；
- 未决内容以明确状态显示，而不是静默提升为已决事实。

## 16. 索引候选

实施前通过查询计划确认，候选包括：

- `(work_id, slug)` unique；
- passage `(edition_id, section_id, ordinal)`；
- occurrence `(passage_id, ordinal)`；
- taxonomy assignment `(subject_kind, subject_id, axis_id)`；
- topology `(from_place_id, to_place_id, relation_kind)`；
- candidate set + GiST geometry；
- translation/search `gin_trgm_ops`；
- media/sound rights 与 role；
- static partition keys。

不得仅因本文件列出就创建未经基准验证的冗余索引。

## 17. 删除与替代规则

- edition、passage、concept 等已被引用的稳定记录优先 supersede，不物理删除。
- 纯派生 layout、缓存和生成报告可重建，但必须与输入 checksum 关联。
- work 删除行为必须显式评审；领域表使用复合外键防止跨 work 引用。
- asset rights 变为 rejected 时，API 立即停止暴露本地路径，但保留审计记录。

## 18. Gate 0 未决事项

- 是否使用通用 `domain_entities` 基表或各 kind 独立表；
- UUID 确定性生成算法；
- 最终 enum 名称和值；
- occurrence 字符范围的存储方式；
- alias/search normalization 结构；
- reviewer identity 模型；
- relation endpoint 的 kind 约束；
- derived topology layout 的持久化方式。

## 19. 本文件冻结条件

- 与语料、taxonomy、地理、时间、媒体、声音专题文档逐字段核对。
- Pilot 样本能表达重复提及、unresolved、merge/split、多分类、拓扑冲突、多 candidate set、无媒体和 rights denied。
- 数据库 reviewer 确认复合外键、删除行为、唯一约束和索引策略。
- API/Web Zod contract 能映射全部已注册 kind。
- 所有最终决策进入 `DECISION_LOG.md`，再据此编写 migration。
