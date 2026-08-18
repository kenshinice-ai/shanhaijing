# 《山海经 Atlas》时间模型

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：底本、成书研究来源、注本/版本 inventory 与 reviewer 尚未冻结

## 1. 目的

本规范定义《山海经 Atlas》的四条独立时间轴。不同时间语义不得合并为一条伪统一年表，也不得为异兽、神祇或文本地点编造 BCE/CE 生卒年。

四轴分别回答：

1. 文本内部按什么顺序展开；
2. 学者如何主张文本的成书与编订时间；
3. 注本、版本和数字化对象何时形成；
4. 图像、地图、研究与数字资产何时形成。

## 2. 轴一：内部旅程与篇章顺序

### 语义

该轴来自 edition、section、passage 和 occurrence 的稳定 ordinal，用于沿篇章、山系、水系和路线浏览。

### 数据来源

- `text_sections.parent_id` 与 `ordinal`；
- `text_passages.ordinal`；
- occurrence 在 passage 内的 ordinal；
- topology edge 的 sequence ordinal。

### 规则

- ordinal 不是年份。
- 不将内部顺序映射为 BCE/CE。
- 不以“更早出现”推导历史年代更早。
- 不把路线距离换算成时间，除非存在独立有来源的学术 claim。
- edition 或 segmentation 改变顺序时，记录版本与迁移 decision。

### UI 表达

使用篇章、段落、路线节点与进度导航。可采用带层级和碰撞处理的 ribbon，但标签显示 reference/ordinal，不显示伪年份。

## 3. 轴二：成书与编订主张

### 语义

该轴记录学者对文本片段、篇章、层次或整体成书/编订年代的主张。它是多来源、多候选的研究 claim，不是产品自行确定的唯一日期。

### 最低字段

- subject kind 与 ID；
- claim type（成书、编订、增补、层累等候选）；
- start/end；
- date precision；
- calendar/basis；
- claimant；
- source 与具体 locator；
- evidence summary 与 counterevidence；
- confidence；
- interpretation class；
- review status。

### 规则

- 一个 subject 允许 0..N 个相互冲突 claim。
- 日期区间优先于伪精确单年。
- 未提供可核验来源时不显示为研究 claim。
- 产品默认不得选取唯一“正确成书年”。
- BCE/CE 的存储与显示遵循现有无 year zero 契约，但实现前需测试边界。

## 4. 轴三：注本、版本与传播

### 语义

记录注家、版本、刊刻、出版、收藏、数字化和转录等可定位对象的时间。

### 对象候选

- commentary；
- edition；
- printing/publication；
- collection acquisition（有可靠来源时）；
- digitization；
- transcription/review release。

### 规则

- 创作/编订时间、刊刻时间、现代出版时间与数字化时间分别存储。
- 对不确定日期使用 interval/precision，不填虚构日期。
- 版本间关系另用 provenance/relation 表达，不能只靠时间排序推断继承。
- rights/retrieved_at 不等于作品形成日期。

## 5. 轴四：图像、地图、研究与数字资产

### 语义

记录历史插图、研究地图、论文/著作、现代示意以及本项目生成资产的形成与审校时间。

### 日期类型候选

- historical illustration creation/publication；
- scholarly map publication；
- research publication；
- museum digitization；
- reconstruction creation；
- asset generation；
- human review；
- release publication。

### 规则

- 历史作品日期与数字文件生成日期分开。
- 地图出版日期不提升其地望 confidence。
- 数字资产 `generated_at` 不成为《山海经》内容年代。
- AI/算法生成资产记录模型/生成器版本、seed/recipe 和输入 checksum。
- rights status 与时间字段相互独立。

## 6. 通用 chronology claim 契约

建议 `chronology_claims` 至少包含：

| 字段 | 含义 |
|---|---|
| `axis` | `composition_redaction`、`edition_commentary`、`visual_research_asset` 候选 |
| `subject_kind` / `subject_id` | 被描述对象 |
| `claim_kind` | 成书、编订、刊刻、出版、创作、数字化、生成等 |
| `start_year` / `end_year` | 可空区间 |
| `precision` | exact、year、decade、century、range、unknown 候选 |
| `date_label` | 原来源中的日期表述 |
| `calendar_basis` | 使用的纪年与换算依据 |
| `claimant` | 主张者 |
| `source_id` / `locator` | 具体来源 |
| `confidence` | 主张评审置信度 |
| `interpretation_class` | 研究假说、记录事实等 |
| `review_status` | 发布状态 |

内部顺序直接来自 ordinal，不应伪装成 `chronology_claims` 的年份记录。

## 7. 区间、精度与无日期项

- 无可靠日期时保持 `unknown`，不填 0 或当前年份。
- 世纪、朝代或约数保留原标签和换算依据。
- start/end 只表示来源允许的范围，不代表均匀概率。
- 互相冲突的区间并列显示。
- undated 项进入明确的“日期未定”分组，不从时间轴消失。
- 机器排序可使用派生 sort key，但 UI 必须显示原始精度与不确定性。

## 8. UI 模式

时间控件提供四个清晰模式：

- `sequence`：内部篇章/路线；
- `composition`：成书与编订主张；
- `editions`：注本与版本；
- `visual_research`：图像、地图、研究与数字资产。

每次只激活一个主时间语义。模式标题、图例和 drawer 都说明当前轴。

可复用现有 `TimelineRibbon.tsx` 的 dated/undated、collision lane 与层级思路，但不得复用其 character 生卒年假设。

## 9. 选择与筛选

- 选择时间项后定位对应 passage、edition、source 或 asset。
- 时间筛选只作用于当前轴。
- 切换轴时清除不兼容 filter，或明确转换规则。
- 地图与时间联动不能把内部 sequence 投影成历史年份。
- 深链保存 axis 与 claim/reference，不保存仅用于布局的像素位置。

## 10. 双语与日期显示

- 中文优先显示来源中的朝代、世纪或原日期标签，并提供必要的公历对照。
- 英文只使用 published translation。
- BCE/CE、约数、世纪和区间的格式由共享 formatter 统一。
- 译文不得将“约”“可能”“不晚于”等不确定语义删除。
- 内部顺序使用篇章 reference 和序号，不显示 BCE/CE 后缀。

## 11. 验证契约

Chronology 检查纳入 `verify:shanhaijing-corpus` 或独立 verifier，具体命令待冻结。

至少检查：

- 四轴 key 合法；
- sequence 记录无伪年份；
- creature/deity/place 无伪生卒年；
- chronology claim 有 claimant、source 和 precision；
- start/end 合法且 no-year-zero 转换通过测试；
- undated 项可见；
- 互相冲突 claim 未被覆盖；
- UI 模式不混用 label/formatter；
- dynamic/static parity。

## 12. Gate 0 未决事项

- 成书与编订研究来源清单；
- claim kind、precision 与 confidence 最终枚举；
- 朝代/传统纪年到显示区间的规则；
- 注本、版本和传播 inventory 范围；
- 图像/研究轴首版纳入哪些资产；
- chronology reviewer 与翻译 reviewer；
- verifier 归属和报告 schema。

## 13. 本文件冻结条件

- 四轴边界获古籍与产品评审批准。
- Pilot 对每轴至少有一个可验证样本或明确空状态。
- 时间 formatter、API schema 与 UI 模式使用同一 key。
- BCE/CE、区间、unknown、undated 和冲突测试通过。
- 所有来源与选择进入 `DECISION_LOG.md` 后，才可标记 `frozen`。
