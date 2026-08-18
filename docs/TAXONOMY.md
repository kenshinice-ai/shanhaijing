# 《山海经 Atlas》多轴分类规范

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：完整词表、术语定义和专家 reviewer 尚未冻结

## 1. 目的

本规范定义《山海经 Atlas》如何对 creature concept、textual occurrence 及相关领域实体进行可组合、可追溯的多轴分类。分类服务于检索、比较和解释，不宣称建立现代生物学意义上的唯一自然分类。

每个 taxonomy assignment 都是一个可审核主张，必须说明：分类轴、术语、适用对象、文本或来源证据、解释等级、置信度和编辑备注。

## 2. 核心规则

1. 分类不是单一互斥树。
2. 一个对象可在同一轴或不同轴具有多个 term，除非该轴经评审明确互斥。
3. `未定` 是合法状态，不得为填满筛选器强行分类。
4. occurrence 层证据优先保留；concept 汇总不得遮蔽不同 occurrence 的冲突。
5. 原文直接描述、注本解释、现代研究、编辑归纳和艺术演绎必须区分。
6. 分类 assignment 必须关联 passage 或 source；无证据的设计标签不能进入知识分类。
7. taxonomy term 的中文、英文、定义和适用范围分别审核。
8. “兽”“鸟”“鱼”等是文本/形态描述候选，不自动等于现代物种鉴定。
9. 分类变化必须保留 decision 和版本，不能静默改变历史统计。

## 3. Assignment 契约

每条 assignment 至少包含：

| 字段 | 要求 |
|---|---|
| `axis_key` | 已注册分类轴 |
| `term_key` | 该轴下稳定 term |
| `subject_kind` | concept、occurrence 或其他允许 kind |
| `subject_id` | 稳定 UUID |
| `passage_id` | 有原文依据时必填 |
| `source_id` | 注本、研究或其他依据 |
| `source_attestation` | 证据来源维度 |
| `interpretation_class` | 解释层级 |
| `confidence` | 编辑置信度；最终枚举待冻结 |
| `editor_note` | 解释边界、冲突或保留意见 |
| `review_status` | draft/reviewed/published/superseded 候选 |
| `decision_id` | 争议、归纳或变更时必填 |

`passage_id` 与 `source_id` 至少一项存在。艺术演绎标签若只服务资产展示，应进入媒体元数据，不得反向成为 concept 的文本分类证据。

## 4. Concept 与 occurrence 的适用规则

### Occurrence assignment

用于记录具体段落中可见的形态、行为、声音、栖息地、效果或关系。它是分类证据的首选粒度。

### Concept assignment

只在以下情形建立：

- 多个 occurrence 证据一致，可形成经审核的汇总；
- term 描述 concept 的编辑身份，而非某一次上下文；
- assignment 明确记录归纳范围和例外。

如果不同 occurrence 相互冲突，concept 不得选择其中一个并隐藏其余证据。可标 `disputed`、保留多个 assignment，或只在 occurrence 层展示。

## 5. 分类轴候选

以下是核心蓝图要求的最小候选轴，不是已冻结完整词表。

### 5.1 正典定位 `canonical_location`

描述出现于哪个 edition、section、山序、水序和 passage。其真源主要来自语料结构，不应手工复制成漂移标签。

候选维度：篇、卷、山系/水系序列、passage reference、occurrence ordinal。

### 5.2 形态 `morphology_form`

候选 term：

- `beast_like`
- `bird_like`
- `fish_or_aquatic_like`
- `serpent_or_crawling_like`
- `human_like`
- `plant_or_mineral_anomaly`
- `composite`
- `indeterminate`

这些术语表示文本形态类比，不表示现代分类鉴定。`plant_or_mineral_anomaly` 是否属于 creature 轴仍待专家评审，也可转入其他 kind。

### 5.3 身体构成 `body_features`

候选 term 组：头、面、目、耳、角、翼、肢、爪、尾、鳞、毛、甲、色彩、数量异常、尺寸异常、混合物种类比。

数量、颜色与类比物应尽量保存结构化值和原文，而不是创建无限 term。具体建模在 Pilot 后决定。

### 5.4 栖息地 `habitat`

候选 term：山、林、洞、河、溪、海、泽、荒漠、地下、空中、聚落、复合、未定。

文本地点关联与 habitat 分类分开：前者回答“在哪里被提及”，后者回答“文本如何描述其环境”。

### 5.5 食性 `diet`

候选 term：草食、肉食、食人、食兽、食鱼、食矿/食土、杂食、未知。所有现代归纳必须标 `editorial_summary` 或 `scholarly_hypothesis`。

### 5.6 行为 `behavior`

候选 term：攻击、守护、迁徙、群居、独居、驯服/可御、潜伏、飞行、游水、追逐、逃避、未定。

不得仅凭现代物种类比给文本实体增加行为。

### 5.7 声音 `sound_description`

保存：

- 是否有原文发声描述；
- 拟声表记；
- 类人、类兽、类鸟、类器物、类自然现象或未定；
- 发声情境与效果。

原文分类只描述文字证据。生成音频的解释等级由声音政策管理，不因存在声描写就标为真实复原。

### 5.8 征兆与灾异 `omen_effect`

候选 term 组：旱、涝、兵、疫、火、风、丰年、安宁、灾变、梦兆、治愈、伤害、未知。

必须区分：

- `appearance_omen`：出现即被描述为征兆；
- `consumption_effect`：食用产生效果；
- `wearing_effect`：佩带或使用产生效果；
- `ritual_effect`：仪式行为产生效果；
- `other_effect`。

不得将古籍陈述改写成现代医学事实。

### 5.9 人神关系 `human_divine_relation`

候选 relation：神属/神使、人类互动、部族关联、祭祀对象、医药使用、食用、服饰、器物、禁忌、守护、敌对、未定。

关系型内容最终优先进入 `domain_relations`；taxonomy 只提供筛选维度，避免重复存储事实。

### 5.10 证据层 `evidence_class`

该轴可用于筛选，但数据真源来自 assignment 的 `source_attestation` 与 `interpretation_class`，不手工重复。

用户可区分：直接原文、异文、注本、现代研究、编辑归纳、艺术演绎。

## 6. 其他领域实体分类

山、水、植物、矿物、神、人、部族、器物、仪式和疾病/效果应有适合自身的轴。不得为了复用 creature 筛选器，把它们标成 creature morphology。

每个新 axis 必须声明：

- 适用 subject kinds；
- term 是否互斥；
- 必需证据；
- 是否可在 concept 层汇总；
- 中文/英文定义；
- UI 控件与空状态；
- coverage 计算方式。

## 7. 术语生命周期

候选 term 状态：

- `draft`：正在定义；
- `reviewed`：领域审核完成；
- `published`：可进入产品筛选；
- `deprecated`：停止新 assignment；
- `superseded`：有明确替代 term。

稳定 `term_key` 不因显示名称变化而复用。合并或拆分 term 必须有映射、decision，并重新生成 coverage/search 索引。

## 8. 双语规则

- 中文术语应说明其是原文词、现代编辑标签还是学术术语。
- 英文不得为了简洁伪造现代物种或确定分类。
- 缺少 published 英文 term 时，按冻结 fallback 显示拼音或中文，不暴露 draft 翻译。
- 别名、拼音和搜索同义词不改变 canonical term key。

## 9. 筛选语义

- 不同轴默认使用 AND；同一轴多选的 AND/OR 行为必须在 UI 契约中明确。
- 筛选结果显示命中的 occurrence 证据，不只显示 concept 总数。
- 地图分布按 occurrence 计算；concept 聚合只作为可切换视图。
- `indeterminate`、无 assignment 和待审核必须区分。
- 筛选计数由当前数据生成，不能写死。
- 隐藏 rights-pending 媒体不得导致对应文本实体从筛选结果消失。

## 10. 冲突与不确定性

以下情形不得自动覆盖：

- 同一 occurrence 有互相冲突的注本或研究分类；
- 同一 concept 的不同 occurrence 展现不同形态或行为；
- 原文词义无法映射到现有 term；
- 英文译名带来强于中文原文的确定性；
- 艺术图像与文字描述不一致。

处理方式：并列 assignment、标记 disputed、保留 source 和 note，或创建新 term proposal。算法不得通过多数票静默决定学术结论。

## 11. Taxonomy verifier 契约

规划命令：`npm run verify:shanhaijing-taxonomy`，当前未实现。

至少检查：

- axis/term key 稳定且唯一；
- term 属于有效 axis；
- subject kind 在 axis 适用范围内；
- assignment 有 passage 或 source；
- attestation 与 interpretation 完整；
- published assignment 只引用有效 published/reviewed term；
- concept 汇总可回到 occurrence 或 decision；
- deprecated/superseded term 无新 assignment；
- 双语 published coverage 可重现；
- API、static 与生成报告计数一致。

输出进入 `generated/`，不得在本文手抄通过数量。

## 12. Pilot 冻结流程

1. 从已批准 Pilot 的全部 passage 提取候选描述，不先套 term。
2. 建立最小 axis/term 草案。
3. 对每条 occurrence 创建 assignment 或明确未定。
4. 检查同一术语在不同上下文是否保持定义一致。
5. 由古籍与相关领域 reviewer 评审冲突、现代分类偏差和英文表达。
6. 冻结 taxonomy version，并记录输入 passage checksum。
7. 运行 verifier 与 UI 筛选测试。
8. 扩篇章时新增 term proposal，不静默改变已冻结定义。

## 13. Gate 0 未决事项

- creature 与植物/矿物异常、神祇、普通动物的分类边界；
- axis 与 term 的最终中文/英文名称；
- confidence 枚举和判定责任；
- 哪些轴允许同轴多值；
- concept 层汇总规则；
- 数量、颜色和身体部件采用 term 还是结构化属性；
- 专家 reviewer 与 taxonomy version 方案。

## 14. 本文件冻结条件

- Pilot 全部 included occurrence 能被表达，未决项无需强行归类。
- 每个 term 有定义、适用 kind、证据要求和双语评审。
- occurrence 与 concept 冲突展示规则通过人工评审。
- 数据字典、API、coverage 和测试计划使用相同 key 与状态。
- taxonomy verifier 首次通过后，批准记录进入 `DECISION_LOG.md`。
