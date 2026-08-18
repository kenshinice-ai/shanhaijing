# 《山海经 Atlas》语料与编辑政策

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：底本、段落切分、Pilot 范围和专家 reviewer 尚未冻结

## 1. 目的

本政策定义语料如何进入 Atlas，以及 textual occurrence 如何被收录、排除、待裁决并映射到 editorial concept。它不决定采用哪个底本，也不提供未经审核的全书数量。

基本顺序不可倒置：

1. 冻结 edition；
2. 建立完整 section 与 passage inventory；
3. 逐 passage 审核疑似提及；
4. 记录 occurrence；
5. 依据证据归并或拆分 concept；
6. 添加分类、地理、媒体和声音解释。

## 2. 语料版本

每个 `text_edition` 必须记录：

- 稳定 ID 与 slug；
- 版本名称、编辑者或责任机构；
- 成书、刊刻或出版时间范围；
- 出版信息与版次；
- source page 与原始文件 URL；
- rights 状态、许可和使用边界；
- 获取日期；
- 原始文件 SHA-256；
- 转录方式与转录文件 SHA-256；
- 是否为当前 inventory baseline；
- 审核者、审核日期和状态。

一个时点只能有一个明确的 baseline edition。其他版本作为 variant 或 comparison source，不得静默混入 baseline 文本。

### Gate 0 冻结要求

底本决策必须记录候选、采用依据、权利、可获得性、文本完整度和已知局限。未完成前，禁止生成正式 passage 数量或声称全书覆盖。

## 3. Section 与 passage 切分

`text_sections` 保存篇、卷、山系/水系序列及父子关系；`text_passages` 保存最小可稳定引用和逐条审核的文本单位。

每个 passage 至少具有：

- 稳定 reference 与 UUID；
- edition、section 与 ordinal；
- 原文或合法短引文；
- 规范化检索文本；
- 原始字符范围或页/栏定位；
- segmentation 规则版本；
- 审核状态；
- checksum。

切分原则：

- 优先沿底本明确篇章与叙述边界切分。
- 单个 passage 应足以判断提及及其描述范围，又不能大到无法精确引用。
- 标点、现代分段或 OCR 行断不得自动成为权威边界。
- 切分规则一旦用于已发布 occurrence，修改时必须有迁移映射和 decision，不得复用旧 reference 指向新内容。
- 无法稳定切分时标 `pending_review`，不猜测。

具体切分粒度须由古籍专家在 Pilot 前冻结。

## 4. 原文、规范化文本与短引文

- 原文层忠实保存所选 edition 的合法内容，不为搜索方便直接改写。
- 规范化层可处理异体字、空白、标点或检索别名，但必须记录规则版本，且能回到原文。
- UI 引文必须定位到 passage 和范围，不以二手摘要冒充原文。
- 受版权限制的现代整理本或译本仅保留政策允许的必要短引文与原创摘要。
- OCR 或自动转录结果在人工审核前不得标记 `published`。

## 5. 异文与注本

`text_variants` 必须记录 baseline passage、适用版本、原文差异、位置、校勘说明、source 和审核状态。

- 异文不得直接覆盖 baseline。
- 注本解释是独立 evidence，不等于原文事实。
- 多种解释可以并列；默认显示不得删除争议状态。
- 若异文改变 occurrence 是否成立、名称或描述范围，必须建立独立 editorial decision。

## 6. Translation 政策

`passage_translations` 与实体翻译采用 `draft`、`reviewed`、`published` 状态。

- 中文默认展示 baseline 原文与经审核的现代说明，两者视觉区分。
- 英文只暴露 `published` 内容；fallback 不得把 draft 当成 published。
- 现代版权译文不批量复制；优先原创短摘要、必要短引文或合法开放版本。
- 专名翻译允许拼音、意译或保留原名加解释，但必须由统一术语表和 reviewer 冻结。
- 翻译不可悄悄消除原文歧义；必要时保留多种解释。

## 7. Occurrence 收录流程

`textual occurrence` 是某个实体在具体 passage 中的一次可定位提及。相同名称在不同 passage 重复出现，分别计数。

逐 passage 审核时，所有疑似相关提及必须获得一种裁决：

- `included`：满足冻结的收录规则；
- `excluded`：不纳入，并记录理由；
- `pending_review`：证据不足或需要专家判断；
- `not_applicable`：该 passage 经审核无目标提及。

收录记录至少保存：

- passage 与字符/引文范围；
- 原文表记；
- occurrence kind；
- 出现 ordinal；
- 是否具名；
- 语法或叙事角色；
- 描述范围；
- editor confidence；
- reviewer 与状态。

### Creature occurrence 候选边界

应进入审核范围的候选包括：具名异兽、复合生灵、异常动物、带明确异常能力或征兆的生灵，以及分类边界不清但可能属于 creature 的提及。

以下不自动成为 creature：普通动物泛称、比喻中的动物词、神、人、部族、植物、矿物、疾病、器物或地点。它们可进入各自领域 kind，或标记待裁决。最终边界须由专家冻结。

## 8. Concept 归并与拆分

`creature_concept` 是编辑归并结果，不是原文直接给出的永恒实体。

- 同名不同物允许拆分。
- 异名同物允许归并。
- 群体称谓、单体称谓和类别称谓不得仅凭字符串自动合并。
- occurrence 可暂时指向 `unresolved` concept。
- 不允许为完成数量而强制归并未决提及。
- 每次 merge、split、reassign 或 canonical-name 变更必须创建 `editorial_decision`。

Decision 至少记录：

- decision kind；
- 受影响 occurrence/concept；
- 采用结论与备选结论；
- passage、注本或研究来源；
- 理由与反证；
- reviewer、日期和状态；
- 被替代 decision（如有）。

## 9. 排除政策

排除不是删除。被排除候选仍保留 passage、范围、理由和审核记录，以证明 inventory 已检查并防止后续重复劳动。

允许的排除理由候选：

- 纯比喻或修辞；
- 普通动物且不符合冻结范围；
- OCR/转录错误；
- 名称误分词；
- 重复标注同一次提及；
- 属于其他领域 kind；
- 超出当前冻结 edition 或 section。

排除理由枚举须在 Pilot 审核后冻结。无法确定时使用 `pending_review`，不得使用模糊的“其他”掩盖问题。

## 10. 四个独立状态维度

任何编辑或展示实现都不得把以下维度合并：

| 维度 | 回答的问题 | 示例候选 |
|---|---|---|
| `source_attestation` | 主张直接来自哪类证据 | text_direct、commentary、research、none |
| `interpretation_class` | 当前陈述属于什么解释层 | transcription、editorial_summary、scholarly_hypothesis、artistic_interpretation |
| `geographic_confidence` | 某个候选地论证强度如何 | high、medium、low、unknown |
| `rights_status` | 内容或资产能否发布 | verified、pending、rejected、unknown |

最终枚举在 `ENTITY_AND_DATA_DICTIONARY.md` 冻结。rights verified 不代表历史解释可信；text direct 也不代表现代坐标确定。

## 11. 审核角色与状态

建议角色：

- transcriber：录入与定位；
- editor：初步 occurrence 与 concept 判断；
- domain reviewer：古籍、历史地理或分类审核；
- language reviewer：双语审核；
- rights reviewer：来源与许可审核；
- release approver：Gate 决策。

角色可以由同一协作者承担，但记录中必须标明其所执行的审核职责。owner 尚未指定时状态保持 `blocked`。

## 12. 覆盖声明

只有满足以下条件，才能对冻结范围声称 100% passage inventory：

- baseline edition 与 segmentation 版本已冻结；
- 每个 passage 均有审核状态；
- 每个疑似提及均为 included、excluded 或 pending_review；
- pending_review 数量单独公开；
- coverage 报告由校验器生成并带输入 checksum；
- occurrence、concept 与 coverage 数量分别报告。

100% inventory 不等于所有争议已解决，也不等于媒体、翻译或候选地覆盖 100%。

## 13. 变更控制

以下变化必须记录到 `DECISION_LOG.md` 并重新生成受影响报告：

- baseline edition 或 segmentation 变化；
- passage reference 或 checksum 变化；
- occurrence 收录边界变化；
- concept merge/split；
- 翻译发布状态变化；
- source 或 rights 更正。

已发布 reference 不得静默重用。需要更正时保留替代关系和迁移记录。

## 14. Gate 0 未决事项

- baseline edition 及合法数字来源；
- section/passages 的具体切分规则；
- creature 与 deity/person/tribe/plant/mineral 等边界；
- occurrence 排除理由最终枚举；
- concept merge/split 最低证据；
- Pilot 篇章与 reviewer；
- 英文专名策略和可用翻译来源。

## 15. 本文件冻结条件

- 古籍编辑 reviewer 批准 edition 与 segmentation 流程。
- occurrence、排除、unresolved、merge/split 规则用 Pilot 样本演练并记录结果。
- 字段与枚举和 `ENTITY_AND_DATA_DICTIONARY.md` 一致。
- coverage verifier 的输入/输出契约已在测试计划中定义。
- 决策与批准记录进入 `DECISION_LOG.md`。
