# 《山海经 Atlas》产品蓝图

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 实施状态：仅文档；未实现 profile、数据、API 或 UI

## 1. 产品定义

《山海经 Atlas》是在现有 Atlas Core 上建设的一方知识产品。它以冻结版本的《山海经》语料为入口，把段落、文本提及、编辑归并后的概念、山川水系拓扑、历代注本、现代研究候选地、图像传统和明确披露为推演的声音资产连接起来。

产品不是异兽图鉴的简单扩充，也不是将《山海经》强行套入 Bible Atlas 的人物、事件和公元纪年模型。它必须同时支持普通探索和证据核查：用户既能按名称、形态、篇章、路线和主题浏览，也能回到具体底本、段落、引文、来源和编辑决定。

## 2. 产品目标

1. 为冻结语料建立可重现的逐段 inventory，而不是从知名名物清单倒推覆盖率。
2. 分别呈现 textual occurrence 与 editorial concept，保留重复提及、异名同物、同名异物和未决项。
3. 用多轴分类表达异兽、山川、水系、矿植、神人、部族、仪式、药用、灾异和征兆，不强制单一现代分类树。
4. 严格分离文本拓扑、学术候选地与现代底图，允许多个研究体系并列。
5. 提供内部顺序、成书编订、注本版本、图像研究四条独立时间轴。
6. 把图像、图标、地图和声音作为带 provenance、rights 与解释等级的知识入口。
7. 复用 Atlas Core 的地图、搜索、抽屉、双语、静态烘焙和部署能力，同时通过轻量领域注册契约避免继续堆叠硬编码分支。
8. 以可验证的 coverage、性能、可访问性、权利和静态一致性门槛控制扩量与发布。

## 3. 非目标

首个正式版本不承担以下目标：

- 不建立第三方插件市场或动态代码加载平台。
- 不宣称解决《山海经》底本、分类或历史地望的学术争议。
- 不把单一候选坐标标成古代地点定论。
- 不为异兽、神祇或文本段落编造 BCE/CE 生卒年。
- 不以媒体覆盖率决定文本实体是否可发布；无媒体必须有正常空状态。
- 不把历史插图、现代示意或 AI/算法生成资产描述为真实外貌证据。
- 不把声音模拟描述为古代录音或确定复原。
- 不在本阶段修改 schema、seed、API、UI 或 production。
- 不以 Pilot 或精选样本的数量声称全书覆盖。

## 4. 主要受众

### 4.1 普通读者

按异兽、篇章、路线、形态和主题探索；在不阅读完整学术 apparatus 的情况下，仍能看到来源和不确定性提示。

### 4.2 学生与教师

比较原文提及、注本解释、编辑分类、地望候选和不同时间层；可按篇章组织课堂或阅读路径。

### 4.3 研究者与编辑

核查 occurrence、concept 归并/拆分、段落覆盖、分类证据、候选地来源和争议状态；能定位待裁决项而非被统一结论遮蔽。

### 4.4 设计与声音创作者

理解形态描述、图像史、环境语境和声学推演，同时明确哪些是直接文本、现代类比或艺术演绎。

## 5. 信息架构

主导航候选如下，最终名称须经双语与领域评审后冻结：

| 区域 | 核心对象 | 主要能力 |
|---|---|---|
| 异兽 / 生灵 | creature concept | 名称、别名、多轴分类、全部提及、媒体与声音 |
| 文本提及 | occurrence | 按篇章和段落定位，查看原文范围与编辑状态 |
| 山川水系 | textual place / topology / candidate | 文本路线、方向里距、候选地比较、现代参照 |
| 路线与篇章 | section / passage sequence | 沿山经、海经及内部序列浏览 |
| 人神部族 | deity / person / tribe / ritual relation | 查看非 creature 的领域实体与关系 |
| 图像志 | media asset / visual chronology | 历代图像、文本页、地图与现代示意 |
| 声音志 | sound asset / evidence | 仅显示权利和披露完整的模拟、环境、仪式与叙述音频 |

导航不得暗示所有领域实体已经完成建模。实际 tab 只有在对应 schema、API、selection、drawer、search、media 和 static bake 都通过 completeness test 后才可启用。

## 6. 首屏工作区

首屏直接进入可用 Atlas，不建设营销 landing page。

### 桌面端

- 大地图为主要工作区；约 61.8% 地图 / 38.2% 知识面板只作为构图起点。
- 顶部提供品牌、全局搜索、语言、地图模式、时间轴模式和辅助设置。
- 篇章/时间导航位于地图邻近区域；筛选与结果列表保持可扫描。
- 选中实体后使用统一 drawer shell 展示详情，不以多层嵌套卡片压缩地图。
- 图例、不确定性与当前 candidate set 必须在地图交互时持续可见。

### 移动端

- 使用全宽地图与底部 sheet/drawer 的单列结构。
- 不强制维持黄金比例。
- 页面不得发生横向溢出；地图、筛选、结果和详情需可由键盘及辅助技术访问。
- 在 reduced-data 或无媒体环境下，文本、列表与证据链仍完整可用。

最终布局由 `VISUAL_DESIGN_SYSTEM.md` 冻结，本文件不规定具体像素和组件实现。

## 7. 代表性用户旅程

### 7.1 从概念回到原文

搜索“九尾狐”候选名称，进入 concept 详情，查看全部 textual occurrences，再比较篇章上下文、原文表记、形态标签、征兆、候选地、历史图像和声音推演。每条分类与媒体说明都可追到 passage 或 source。

### 7.2 沿文本路线浏览

从某一冻结篇章或山系进入，沿方向、里距、发源与流入关系逐段浏览文本拓扑。切换学术候选层时，可以整套选择 candidate set，并看见来源、置信度与反证；现代底图只作参照。

### 7.3 组合分类筛选

组合选择“鸟形”“食人”“其声如……”等不同轴条件。地图按 occurrence 分布，列表显示命中证据；同一 concept 的多次提及不会被静默压缩成一个点。

### 7.4 切换时间语义

分别查看内部篇章顺序、成书编订主张、注本版本、图像研究年表。界面明确当前轴，不把内部 ordinal 绘成公元年份。

### 7.5 主动播放声音

用户打开声音详情，先看到原文声描写、现代类比、生成说明和解释等级，再显式点击播放。开始另一条音频时停止前一条；无 autoplay，并提供文字替代。

## 8. 内容与证据呈现原则

- 每个可发布事实必须能够回到 version、section、passage、quote range 或具体 source。
- 直接文本、注本解释、现代研究、编辑归纳和艺术演绎使用不同机器可读状态。
- 争议主张并列显示，不把编辑默认选择包装成共识。
- 缺失媒体、未知候选地和 unresolved concept 是正常状态，不通过虚构内容补齐。
- 中文为默认语言；英文仅使用已发布翻译，未发布时按冻结的 fallback 规则处理。
- 权利状态只控制资产发布，不提高内容或地望可信度。

## 9. 成功指标

每次候选发布必须分别生成：

1. `unique creature concepts`：编辑归并后的独立概念数。
2. `textual occurrences`：逐次文本提及数。
3. `corpus coverage`：已审核段落数 / 冻结语料段落总数，并按篇章列缺口。

另行生成：

- 有原文定位的 occurrence 比例；
- 有至少一个有效分类 assignment 的 concept 比例；
- 有文本拓扑关系的 occurrence 比例；
- 有候选地的 textual place 比例；
- 有图像、图标和声音的 concept 比例，三者分别报告；
- 中英文 `published` 覆盖率；
- disputed、unresolved、excluded 与 pending-review 数量；
- rights verified/pending/rejected/unknown 数量；
- dynamic API 与 static artifact 的 counts parity。

所有数字由校验器写入 `generated/`。Phase 0 不预设未经语料盘点的正确总数；Pilot 只有在冻结范围内达到 100% passage audit，才可声称该范围覆盖完成。

## 10. 阶段门槛

### Gate 0：文档与基线

必须冻结底本选择方式、段落切分、occurrence/concept 规则、三层地理、四轴时间、权利/解释状态、测试矩阵和 handoff 模板。当前 Gate 0 为 `blocked`。

### Phase 1：垂直 Pilot

选择一个经批准的代表性篇章或山系，在冻结范围内完成 100% passage audit，并贯通 corpus、occurrence、concept、taxonomy、topology、candidate、media/icon 和 sound。

### Phase 2 以后

按核心蓝图扩大语料、地图、媒体、声音与性能验证。任何阶段不得使用较低证据层级声称 staging 或 production 完成。

## 11. Gate 0 未决事项

- 冻结哪个底本及其数字来源。
- passage segmentation 的最小稳定单位。
- occurrence 的收录、排除和待裁决边界。
- concept 归并/拆分的最低证据。
- Pilot 篇章或山系。
- 中文和英文命名、翻译及 fallback 规则。
- 参考地图清单及其权利。
- 专家评审人、owner 与批准流程。
- 性能和可访问性预算的最终阈值。

这些事项只能在对应专题文件和 `DECISION_LOG.md` 中冻结；本文件不自行补结论。

## 12. 本文件完成条件

- 目标、非目标、受众、信息架构和代表性旅程已获产品评审。
- 成功指标与 `CONTENT_COVERAGE_MATRIX.md`、测试计划一致。
- 未决事项均有 owner 与评审路径。
- 评审记录写入 `DECISION_LOG.md` 后，状态才可从 `draft` 改为 `frozen`。
