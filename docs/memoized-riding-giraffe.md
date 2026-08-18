# 《山海经 Atlas》文档优先实施计划

## Context

当前仓库已经证明“一套 Atlas 引擎，多套一方产品”的路线可行：Bible Atlas 提供地图、时间轴、关系图、搜索、抽屉、双语、PostGIS、静态烘焙与部署基础；European Art History 把图像、来源、许可和展示语义提升为一等知识证据；European Classical Music History 建立了 MEI/SVG/timing/WAV/manifest 的可重复生成、校验和 rights-gated 播放链路。

《山海经 Atlas》需要在这个基础上形成独立的一方 profile 与领域模块，而不是复制仓库，也不是塞进现有 `character/event/location` 模型勉强表达。产品目标是覆盖文本中的大量异兽、山川、水系、矿植、神人、部族、仪式、药用、灾异与征兆，并同时呈现原文拓扑、历代注本、现代研究候选地、图像传统和明确标注为推演的声音模拟。

本项目采用 **文档优先、语料先于名物、证据先于表现、门槛先于扩量** 的实施顺序。获批后首先创建全部蓝图和规范 Markdown；在数据字典、证据语义、地图规则、媒体/声音权利规则、验收指标和 HANDOFF 模板冻结前，不开始 schema、seed 或 UI 实现。

本轮规划不把现有 dirty worktree 中的 Bible visual pilot 及其他未提交更改视为本项目可覆盖内容；实施时必须在可写分支或明确检查点上工作，并保留这些既有更改。

## 1. 推荐边界与基本决策

### 1.1 仓库与产品边界

- 保留现有 monorepo，以共享 Atlas Core 为核心。
- 新增 `shanhaijing` 一方 profile、独立领域 loader、领域数据表、领域组件和资产目录。
- `VITE_WORK_PROFILE=shanhaijing` 生成独立产品；默认中文，提供英文已发布翻译回退。
- 先补一个轻量的 **一方领域注册契约**，统一注册实体类型、计数、搜索、序列化、抽屉、媒体、静态烘焙与可见性派生，防止继续在 `app.ts`、`EntityDrawer.tsx` 等处添加互不一致的硬编码分支。
- 注册契约只服务本 monorepo 内的一方模块，不建设第三方插件市场、动态代码加载或过度抽象的扩展平台。

### 1.2 明确不采用

- 不复制 Bible Atlas 成为断开的第二仓库。
- 不把所有异兽降格为 `characters`，也不把文本段落伪装成公元纪年 `events`。
- 不只做几十个“著名异兽”精选册。
- 不把单一现代坐标当作古代地望定论。
- 不为异兽编造 BCE/CE 生卒年。
- 不把插图的展示角色、史实置信度、地望置信度、版权状态混成一个字段。
- 不把地图小图标与抽屉大图共用同一种资产职责。
- 不把声音模拟包装成古代真实录音、考据结论或确定复原。

## 2. 产品原则、受众与成功指标

### 2.1 产品原则

1. **原文可追溯**：每个可发布事实都能回到版本、篇章、段落、引文范围和来源。
2. **提及与概念分离**：文本 occurrence 是证据，creature concept 是编辑归并结果；两者都可浏览。
3. **不确定性可见**：原文拓扑、学术候选、现代地图三层并列，不暗示错误确定性。
4. **分类可组合**：鸟兽只是形态轴的一部分，允许多标签、多值和“未定”。
5. **媒体是知识入口**：图像、图标、历史版画、示意复原和声音都带来源、解释层级、权利状态和替代文本。
6. **规模可核验**：覆盖量由 verifier 生成，不手工抄写容易漂移的数字。
7. **优雅但不牺牲可读性**：黄金比例用于构图起点，不作为机械公式；移动端、键盘、低性能和无音频情境优先可用。

### 2.2 主要受众

- 普通读者：按异兽、篇章、路线、主题探索。
- 学生与教师：比较原文、注本、分类、地望候选和时间层。
- 研究者与编辑：检查 occurrence、归并依据、来源和争议。
- 设计/声音创作者：在不混淆证据层级的前提下理解形态、图像史和声学推演。

### 2.3 核心成功指标

每次发布必须分别报告，禁止合并成一个“异兽数”：

- **unique creature concepts**：编辑归并后的独立异兽概念数。
- **textual occurrences**：逐次文本提及记录数，同一异兽多次出现分别计数。
- **corpus coverage**：已校勘段落数 / 冻结语料总段落数，并按篇章列出缺口。
- 另报：有原文引文的 occurrence 比例、有至少一个分类的 concept 比例、有拓扑位置关系的 occurrence 比例、有候选地的地点比例、有图像/图标/声音的概念比例、双语 published 比例、争议项比例。
- Phase 0 不预设未经语料盘点的“正确总数”；Pilot 只有在冻结篇章内达到 100% 段落核查，才可声称该篇章覆盖完成。
- Scale 阶段目标是冻结所选底本的全篇段落 inventory 达到 100%，所有疑似生物/异常实体提及均被标为“收录、排除或待裁决”，而不是用名气列表替代语料审计。

## 3. 文档优先交付物

实施第一批只创建/评审 Markdown 与机器可读模板，不改业务行为。建议目录 `docs/shanhaijing/`：

1. `README.md`：文档导航、当前阶段、证据层级、负责人和下一动作。
2. `PRODUCT_BLUEPRINT.md`：目标、受众、信息架构、用户旅程、非目标、成功指标。
3. `CORPUS_AND_EDITORIAL_POLICY.md`：底本/版本选择、段落切分、短引文边界、异文、翻译、归并/拆分与排除规则。
4. `CONTENT_COVERAGE_MATRIX.md`：篇章、山经/海经序列、段落总数、审核状态、occurrence/concept 统计；统计区由脚本生成。
5. `ENTITY_AND_DATA_DICTIONARY.md`：全部实体、字段、枚举、约束、关系、稳定 slug/UUID 策略。
6. `TAXONOMY.md`：形态、栖息地、行为、食性、声音、征兆、人神关系、药用/仪式等多轴词表与编辑规则。
7. `GEOGRAPHY_AND_MAPS.md`：文本拓扑、候选地、现代底图三层模型，地图模式、缩放、符号、LOD 与不确定性表达。
8. `REFERENCE_MAP_AUDIT.md`：用户提供及后续收集的参考地图逐张登记来源、权利、投影、范围、山系/水系表达、符号、标签密度、可借鉴点和不可照搬点；只作设计参考，不自动成为地望证据。
9. `CHRONOLOGY_MODEL.md`：内部序列、成书/编订、注本/版本、图像/研究资产四条时间轴。
10. `VISUAL_DESIGN_SYSTEM.md`：色彩、排版、黄金比例构图原则、网格、地图视觉层级、图标系统、响应式、可访问性和减少动态/数据模式。
11. `MEDIA_ICON_ILLUSTRATION_POLICY.md`：图片角色、depiction status、图标与大图分离、来源/权利、双语 alt、AI/人工重绘披露、尺寸和格式。
12. `SOUND_RECONSTRUCTION_POLICY.md`：文本证据、声学类比、推演配方、生成 manifest、免责声明、响度、播放和无障碍规则。
13. `ARCHITECTURE.md`：Atlas Core 注册契约、Shanhaijing 模块、API、前端、静态 bake、搜索和缓存边界。
14. `API_CONTRACT.md`：lite/full payload、详情、搜索、地图分片/视口查询、音频 rights gate、错误契约。
15. `ASSET_MANIFEST_SPEC.md`：图像、图标、地图、音频、波形、manifest 的目录、命名、checksum 和衍生关系。
16. `PERFORMANCE_BUDGETS.md`：100/500/1000+ 要素基准、payload、解析、DOM、FPS、内存、媒体预算和阻断阈值。
17. `TEST_AND_VERIFICATION_PLAN.md`：数据库、契约、内容、权利、地图、声音、可访问性、响应式和静态部署测试矩阵。
18. `HANDOFF.md`：当前总状态与证据索引，只引用生成报告，不手抄易漂移统计。
19. `HANDOFF_TEMPLATE.md`：所有阶段和协作者统一的八段交接格式。
20. `DECISION_LOG.md`：日期、决策、依据、被替代决策、影响范围与负责人。
21. `RISK_REGISTER.md`：风险、概率、影响、缓解、触发器、owner 和状态。
22. `EXPERT_REVIEW_QUESTIONS.md`：古籍、历史地理、动物学/神话学、版权、声学、无障碍待审问题。
23. `RELEASE_CHECKLIST.md`：local candidate、isolated DB、static artifact、staging、production 五层证据门禁。

机器生成报告建议放 `docs/shanhaijing/generated/`，文件首部写明生成命令与输入 checksum；禁止人工编辑统计区。

## 4. 信息架构与关键用户旅程

### 4.1 首屏工作区

- 首屏就是可用 Atlas，不做营销 landing page。
- 桌面端以大地图为主要工作区，初始可从约 61.8% 地图 / 38.2% 知识面板起步；地图必须明显大于现有紧凑画布。
- 顶部提供 profile 品牌、全局搜索、语言、地图模式、时间轴模式和辅助设置。
- 左/下方为时间与篇章导航，右侧为筛选/列表；选中实体后打开 drawer，不以多层卡片嵌套挤压地图。
- 移动端改为单列：全宽地图 + 底部 sheet/抽屉；不强行维持黄金比例。

### 4.2 主导航

- 异兽 / 生灵：concept 浏览与多轴筛选。
- 文本提及：occurrence 浏览，按篇章和段落定位。
- 山川水系：textual topology 与候选地。
- 路线与篇章：山经/海经序列及方向距离链。
- 人神部族：神、人、部族、仪式与关系。
- 图像志：历代图像、现代示意和资产时间线。
- 声音志：只显示可发布且已披露解释等级的模拟/环境/仪式/叙述音频。

### 4.3 代表性旅程

1. 搜索“九尾狐” → 概念页 → 查看所有原文提及 → 比较篇章上下文、形态标签、征兆、候选地、历史图像和声音推演。
2. 从《南山经》序列进入 → 沿文本方向/里距浏览山链水链 → 切换候选地层 → 明确看到多个学说及置信度。
3. 按“鸟形 + 食人 + 其声如…”组合筛选 → 地图和列表同步 → 逐条查看分类证据。
4. 在时间轴切换“内部顺序 / 成书编订 / 注本版本 / 图像研究”，不会把不同时间语义画在同一条伪统一年表上。
5. 点击声音按钮 → 阅读原文声描写、类比来源和推演说明 → 主动播放；切换另一条时全局停止前一条。

## 5. 语料、实体和分类模型

### 5.1 语料层

- `text_editions`：底本/版本、编辑者、年代区间、出版信息、权利状态、来源 URL、checksum。
- `text_sections`：篇、山系/水系序列、层级、稳定顺序、父节点。
- `text_passages`：段落、稳定 reference、原文短引文或可存文本、规范化文本、版本、顺序、审核状态。
- `text_variants`：异文、适用版本、校勘说明与来源。
- `passage_translations`：中/英说明，`draft/reviewed/published`。
- `editorial_decisions`：提及收录/排除、概念归并/拆分、理由、reviewer、时间与来源。

### 5.2 概念与 occurrence 分离

- `creature_concepts`：稳定 slug、规范名、concept status、重要度、默认 icon key；不含虚构生卒年。
- `creature_concept_translations`：名称、别名、摘要、编辑说明。
- `creature_occurrences`：concept、passage、原文表记、出现顺序、语法角色、是否命名、描述范围、编辑置信度。
- 同名不同物允许拆分；异名同物允许归并；每次归并/拆分必须有 decision 和来源。
- occurrence 可暂时指向 `unresolved` concept，避免为完成数量而过早确定。
- 非异兽但应进入 Atlas 的山、水、植物、矿物、神、人、部族、器物、疾病/效应分别建领域实体或受控 kind，不把它们塞进 creature。

### 5.3 多轴分类

每个分类 assignment 保存：`axis`、`term`、适用 concept/occurrence、`attestation`、`interpretation_class`、source、passage、editor note、confidence。分类不是互斥树。

- 正典定位轴：篇章、山序、水序、文本段。
- 形态轴：兽、鸟、鱼/水生、蛇/虫、人形、植物/矿物异常、复合、未定。
- 身体构成：头、肢、尾、翼、角、鳞、毛、色彩、数量异常、混合物种类比。
- 栖息地：山、林、洞、河、海、泽、荒漠、地下、空中、聚落及未定。
- 食性与行为：草食、肉食、食人、食矿、守护、迁徙、攻击、驯服、群居等。
- 声音：原文声描写、拟声、类人/类兽/器物/自然类比、发声情境。
- 征兆/效应：旱、涝、兵、疫、丰年、治愈、梦兆等，并区分“出现即兆”与“食用/佩带产生效果”。
- 人神关系：神、人、部族、祭祀、医药、食用、服饰、器物和禁忌。
- 证据轴：直接原文、注本解释、现代研究、编辑推断、艺术演绎。

### 5.4 四个独立状态维度

- `source_attestation`：文本直接、注本、研究、无直接文本等。
- `interpretation_class`：文本事实转录、编辑归纳、学术假说、艺术演绎。
- `geographic_confidence`：候选地自身的 high/medium/low/unknown，并带理由；不由图像或实体重要度推导。
- `rights_status/license_status`：verified/pending/rejected/unknown；只控制发布与资产暴露，不提高内容可信度。

## 6. 地理模型和大地图

### 6.1 三层地理严格分离

**A. 原文拓扑层**

- `textual_places` 表示山、海、荒、国、水、泽、路径节点等文本实体。
- `topology_edges` 保存 from/to、方向、原文里距、距离单位、顺序、关系类型（发源、流入、相距、又东、环绕等）、passage/source 和解释等级。
- 原文没有绝对坐标时只展示拓扑坐标；布局坐标是渲染结果，不是历史地理事实。
- 原文互相冲突或环路不得被算法静默修正，必须标注冲突。

**B. 历史/现代学术候选层**

- `place_candidates`：textual place、GeoJSON point/line/polygon、候选名称、主张者、来源、年代、证据摘要、反证、confidence、candidate status。
- 一个文本地点允许 0..N 个候选；默认不替用户选定唯一答案。
- 支持同一学者/地图体系形成 candidate set，以便整套切换，而不是拼成不一致的“共识地图”。

**C. 现代底图比较层**

- 现代地形、行政与水系只用于空间参照。
- 显示候选覆盖和偏差，不以底图精细度暗示古籍记载精确度。
- 底图来源、样式许可和离线/在线策略写入 manifest。

### 6.2 地图模式

- 文本路线图：山系/水系顺序、方向和里距，支持路线逐段高亮。
- 候选地比较：单学说、并列学说、差异模式，候选点/线/面均可。
- 现代对照图：受控叠加现代底图。
- 异兽分布：按 occurrence 而非仅按 concept 聚合；地图计数可回溯到文本。
- 生态/征兆/声音专题：多轴筛选后生成专题分布。
- 不确定性图例始终可见；形状/线型与颜色共同编码，不能只靠颜色。

### 6.3 技术演进与性能门槛

复用 `AtlasMap.tsx` 的 Leaflet、Supercluster、`AutoFitController` 与地图交互思路，但当前 `FictionalCanvas` 的 0–100 React SVG 仅适合小样本，不作为长期大图基础。

- 100 features：验证交互、标签、drawer lookup、文本拓扑布局。
- 500 features：测 payload、Zod parse、DOM、聚类、缩放和筛选延迟。
- 1000+ features：测主线程、FPS、内存、label placement 和静态包体。
- Leaflet/Supercluster 保留用于中等规模真实候选坐标。
- 文本拓扑优先采用预计算布局 + Canvas/WebGL 或经过验证的分层 SVG；大量候选面/线达到门槛时评估 MapLibre + vector tiles。
- 决策必须由基准报告触发，不能仅凭技术偏好迁移。
- 支持视口分片、区域 partition、cluster、LOD、标签优先级、懒加载 drawer detail 与媒体。

建议阻断预算在 Phase 0 基准后冻结；初始候选值：交互首屏 gzip JS 不继续显著放大现有约 666 KiB 主包，地图切换 p95 < 200 ms，已加载视口平移维持约 50+ FPS，移动端长任务 < 200 ms，lite atlas Zod 解析 p95 < 150 ms，任何超限都必须有书面豁免和后续 owner。

### 6.4 参考地图审计

- 将用户提供的地图及其链接/图片逐项登记到 `REFERENCE_MAP_AUDIT.md`。
- 记录：作者/机构、年代、URL/本地参考路径、版权、投影、范围、比例尺、方向/里距表达、山水层级、标签、图标、颜色、密度、交互启发。
- 分别标记“视觉参考”“数据来源候选”“学术地望主张”；三者不可互相替代。
- 未知来源或权利不明的图只能内部参考，不打包、不临摹独特图形、不作为数据库证据。

## 7. 四轴时间模型

- **内部旅程/篇章序列**：section/passages/occurrences 的 ordinal，用于文本导航，不映射 BCE/CE。
- **成书与编订区间**：研究观点可有多个 claim，每个 claim 带来源、起止区间、confidence 和解释。
- **注本与版本年表**：版本、注家、刊刻/出版、收藏和数字化时间。
- **图像/研究/资产年表**：插图创作、地图出版、现代研究、数字资产生成和审校时间。

`TimelineRibbon.tsx` 的 dated/undated、碰撞 lane 和层级思路可复用，但新增四个明确模式；禁止把异兽当作有生卒年的 character，也禁止默认把内部 sequence 当公元年份。

## 8. 视觉、图像、图标与插画

### 8.1 UI UX Pro Max Phase 0

- 在退出规划模式且建立可写检查点后，审查 `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` 的实际内容、MIT 许可、依赖和安装文件。
- 经审查后按用户授权进行项目级安装到 `.claude/skills/ui-ux-pro-max`，不做全局安装。
- 在 `VISUAL_DESIGN_SYSTEM.md` 记录来源 commit/tag、安装清单、许可、采用/拒绝的规则。
- 将其作为设计评审辅助，不视为自动正确；黄金比例、领域语义、地图可读性和现有设计系统仍由本项目规范裁决。

### 8.2 设计系统

- 构图：桌面主要工作区可从 61.8/38.2 起步；地图、筛选和 drawer 的实际可用性优先。
- 色彩：建立至少中性背景、墨色文字、山林绿、水系青、警示朱/赭、学术候选辅助色的平衡体系；避免米棕、紫蓝或任何单一色族统治全站。
- 对比：正文和控件达到 WCAG AA；地图符号在浅/深底图上均有可测轮廓。
- 排版：中文正文优先可读性与古籍气质，英文有兼容 fallback；不使用随 viewport 连续缩放的字体。
- 图标：优先现有 icon library 的通用操作图标；异兽/山水专用图标进入独立 registry。
- 状态：hover/focus/selected/disabled/loading/error/empty/right-denied 均有规范。
- 响应式：至少验证 390×844、768×1024、1280×800 和宽屏；无页面级横向溢出。
- 无障碍：键盘全流程、可见 focus、地图表格/列表替代、图像 alt、音频文字描述、字幕/转录、reduced motion、reduced data、非颜色编码。

### 8.3 媒体语义

扩展 `media_role`，至少包括：`creature_depiction`、`historical_illustration`、`text_folio`、`scholarly_map`、`reconstruction_map`、`habitat_reference`，保留已有角色。扩展 depiction/interpretation 语义，但不要让 role 暗示史实确定性。

每个资产必须有：source page、original URL、creator、creation date/interval、licence、licence URL、attribution、retrieved_at、SHA-256、双语 alt、caption、media role、depiction status、interpretation class、适用实体/occurrence、crop/derivative 信息。

### 8.4 图标与大图区分

- `creature_icon_registry`：小尺寸地图符号，保存 icon key、taxonomy hints、设计者、来源、许可、版本、checksum 和可读性测试。
- drawer illustration：独立媒体资产，可展示历史版画、开放许可图像或明确标注的现代示意。
- map icon 不从大图自动裁切充当；大图也不因共享图标就继承其解释等级。
- 视觉同一性是编辑关联，不是“古代真实外貌”。

### 8.5 建议资产目录

```text
apps/web/public/media/shanhaijing/
  icons/creatures/
  illustrations/historical/
  illustrations/reconstructions/
  maps/reference/
  maps/derived/
  audio/creatures/
  audio/ambience/
  audio/ritual/
  audio/narration/
  waveforms/
  manifests/images/
  manifests/audio/
  manifests/maps/
```

源码/高分辨率母版如不适合 Web 发布，放受控 source workspace，不直接进入 `public/`；manifest 记录衍生链。

## 9. 声音模拟与声景

### 9.1 独立领域模型

不复用 `score_fragments` 表。新增通用声音契约：

- `sound_assets`：semantic role（`creature_vocalization`、`environment_ambience`、`ritual_reconstruction`、`narration`）、rights status、路径、codec、sample rate、channels、duration、loop points、integrated LUFS、true peak、transcript/description、disclaimer。
- `sound_links`：关联 concept、occurrence、place、passage 或 ritual，带 sort order 和适用范围。
- `sound_evidence`：原文声描写、passage、注本/研究、analog species/material/environment、证据等级。
- `sound_generation_manifests`：generator/model/version、seed、prompt 或 DSP recipe、素材及许可、参数、输入/输出 checksums、生成时间、人工后期、reviewer。
- `sound_translations`：标题、说明、文本替代与免责声明。

### 9.2 解释等级

每条声音公开显示且机器可读地标注：

- `text_attested`：原文直接描述的内容，仅表示文本证据存在。
- `inferred_analogy`：依据现代物种、材料或环境类比推演。
- `artistic_interpretation`：为体验创作的艺术演绎。

一条音频可有原文证据，但生成波形本身仍通常属于推演或艺术演绎；不得将 `text_attested` 错写为“真实发声已被记录”。

### 9.3 生成与播放

- 先用可重复 DSP/合成 recipe 验证管线，再决定是否引入生成模型；模型输出也必须保留版本、prompt、seed（若可用）和素材权利。
- verifier 检查路径、manifest、checksum、采样率、声道、duration、LUFS、true peak、loop 无爆音、文字替代和 rights gate。
- Phase 1 仅显式点击播放、全局单轨、无 autoplay；切换音频先停止上一条。
- Phase 2 才考虑循环、淡入淡出和场景声景。
- Phase 3 只有在数据契约稳定、性能和可访问性通过后，才评估混音和空间音频。
- `prefers-reduced-motion` 不等于静音；另设 mute/reduced-audio/reduced-data 控制并持久化用户选择。

## 10. 共享架构与关键代码改动

### 10.1 一方实体注册契约

在 API/Web 共享可验证 descriptor（具体目录按现有 TypeScript workspace 边界决定），每种实体注册：

- kind、collection key、slug/id getter、label/context getter；
- profile tab 和可见性策略；
- lite/full schema；
- search provider；
- drawer renderer；
- media eligibility；
- static bake inclusion；
- count/coverage reporter；
- map/timeline/graph adapters（如适用）。

优先消除下列静默遗漏风险：

- `apps/web/src/types.ts` 的 `EntityTypeSchema`、Atlas/Search response 联合。
- `apps/web/src/profile.ts` 的 specialization/tabs 硬编码。
- `apps/web/src/components/EntityDrawer.tsx` 的领域分支。
- `apps/web/src/components/GlobalSearch.tsx` 的实体映射。
- `apps/api/src/app.ts` 的 Atlas、详情、搜索和 media UNION 手写分支；当前 media 聚合甚至未覆盖 music specialist 实体，需先用测试锁定再改。
- `apps/api/src/bake-static.ts` 的 profile 全量 bake。

注册契约实施后加入 completeness test：任何已注册 kind 若缺少 schema、搜索、drawer、media、bake 或 selection handler，构建失败。

### 10.2 Shanhaijing 领域模块

- API 新建类似 `apps/api/src/music.ts::loadMusicAtlas()` 的 `shanhaijing.ts::loadShanhaijingAtlas()`，避免继续膨胀 `app.ts`。
- Web 新建领域 adapter 与组件：creature explorer、occurrence list、taxonomy filter、text topology map、candidate comparison、four-axis timeline、sound panel。
- 复用 `hierarchy.ts` 的 `visible*` 和 `buildGraph` 思路，将 Shanhaijing 选择和筛选逻辑做成纯函数并单测。
- 复用 `RelationGraph.tsx` 的层级/表格 fallback，但建立通用关系 endpoint，允许 creature/place/deity/tribe/plant 等多 kind 节点，不局限 character relation。
- 复用 `EntityDrawer` 的 drawer shell、lazy detail、媒体署名与来源 UI；领域内容由注册 renderer 提供。

### 10.3 API 契约

- Atlas lite payload：首屏导航、concept 摘要、occurrence 索引、地图可见数据、计数、分类词表和可发布媒体缩略信息。
- Atlas full/static：可按 profile bake；若全量过大，输出版本化分片索引（section、region、entity kind）。
- Entity detail：按需返回完整引文上下文、分类证据、候选地、媒体、声音和争议说明。
- Search：跨 concept、occurrence 表记、别名、place、deity/tribe、passage、taxonomy；返回 kind 与命中上下文。
- Map viewport/partition：动态模式按 bbox、zoom、layer、filters 查询；静态模式读取对应分片。
- 音频路径只在 rights verified、manifest verified、interpretation disclosure 完整时暴露，复用 music 的 fail-closed 原则。
- 所有 response 先经 Zod contract；locale fallback 只允许 published。

## 11. 数据库迁移与种子策略

按功能拆分可回滚迁移，编号在实施时基于仓库最新迁移确认：

1. Atlas domain registry / 通用多 kind relation 和 media link 完整性。
2. Shanhaijing corpus/edition/section/passage/variant/editorial decision。
3. creature concept/occurrence/translation。
4. taxonomy axes/terms/assignments/evidence。
5. textual geography/topology/candidate sets/claims。
6. four-axis chronology claims。
7. icon registry 和扩展 media roles。
8. sound assets/evidence/links/manifests。
9. 搜索索引、空间索引和性能索引。

种子分层：

- reference vocabulary（枚举/词表）；
- edition + corpus inventory；
- occurrence inventory；
- concept editorial mapping；
- taxonomy/evidence；
- geography claims；
- media/icon/sound manifests。

稳定 UUID/slug、复合外键、work/domain ownership、published translation 和 source linkage 必须在 DB 层约束。所有生成 seed 由确定性脚本产生，输出 checksum 和输入版本；不得把人工编辑的巨大 SQL 当唯一真源。

## 12. 来源、版权和解释政策

- 优先公开领域古籍影印、明确开放许可的机构数据和可核验学术来源。
- 现代翻译只存原创短摘要与必要短引文，不批量复制受版权保护译文。
- 来源类型扩展古籍版本、注本、校勘、考古/历史地理、博物馆、图像、地图、声学/物种类比。
- 每个主张引用具体 passage 或 source；“来源列表”不能替代字段级证据。
- 公开可访问不等于可再发布。rights/provenance/checksum/双语 alt 任一不完整：bundled fail closed；可在政策允许时降级为 external link。
- AI/算法生成图像或声音记录模型、版本、prompt/recipe、输入权利、人工修改和解释等级。
- 专家意见与编辑判断分开；争议项并列显示，不伪造共识。

## 13. 测试与 fail-closed verifier

### 13.1 自动测试

- Migration fresh/repeat bootstrap、FK、enum/check、索引和删除行为。
- Corpus completeness：每个冻结 passage 有审计状态；疑似提及都有收录/排除/待裁决。
- Occurrence/concept：无孤儿、归并决策齐全、slug/UUID 稳定、数量三分法正确。
- Taxonomy：axis/term 有效，assignment 有证据/解释等级，不强制单选。
- Geography：edge passage 完整、候选有 claimant/source/confidence、GeoJSON 合法、坐标范围正确、candidate set 一致。
- Chronology：四轴类型不混用，creature 无伪生卒年。
- Media/icon：rights、provenance、checksum、alt、role/status、文件尺寸/格式、缺失/陈旧资产 fail closed。
- Sound：manifest/recipe/checksum/WAV profile/LUFS/peak/duration/loop/disclaimer/rights 一致。
- Registry completeness：每个 kind 覆盖 Atlas、search、selection、drawer、media、bake 和测试。
- API contract：lite/full、locale、fallback、详情、搜索、bbox/partition、错误状态。
- Static parity：dynamic API 与 baked static 的 schema、counts 和搜索抽样一致。

### 13.2 浏览器与人工验证

可观察 UI 变更必须用 preview 工具启动应用并直接验证：

- console/server/network 无错误；动态与 static 两种模式。
- 首屏、搜索、筛选、选择、drawer、深链、刷新和语言切换。
- 三地图层、候选比较、图例、路线逐段高亮、列表/表格替代。
- 四时间轴切换与 undated/interval 表达。
- 音频显式播放、全局单轨、rights-denied、无音频和 reduced-data。
- 键盘、focus、screen-reader labels、颜色对比、alt/transcript。
- 390×844、768×1024、1280×800、宽屏；无重叠和页面级溢出。
- 100/500/1000+ 特征基准，记录 payload、parse、DOM、FPS、memory 和长任务。
- 最终用 screenshot、network 或 server logs 形成可见证据，但 screenshot 不替代精确样式/无障碍检查。

### 13.3 验证命令族（实施时落地）

- `verify:shanhaijing-corpus`
- `verify:shanhaijing-taxonomy`
- `verify:shanhaijing-geography`
- `verify:shanhaijing-media`
- `verify:shanhaijing-sound`
- `benchmark:shanhaijing-map`
- 根级 `typecheck`、`test`、`build`、`verify:postgis`、`bake:static`

所有 verifier 输出 JSON + Markdown 摘要，由 HANDOFF 引用；统计、媒体总字节、rights 状态、missing/stale 和 coverage 不手抄。

## 14. 分阶段路线与硬门槛

每个 Gate 都必须有：冻结输入、交付物、自动检查、人工评审、停止条件、证据 artifact、decision log、下一 owner/action。

### Phase 0 — 文档与基线冻结

**输入**：本计划、现有 Atlas 代码、既有 dirty worktree 清单、用户参考地图、候选底本/来源。

**交付**：创建第 3 节全部 Markdown；参考地图审计；数据字典；UI UX Pro Max 项目级审查/安装记录；现有 bundle/API/map 基准；分支/检查点和证据边界说明。

**自动检查**：文档链接、必填章节、枚举一致性、生成区标记、reference URL；不得运行会改生产数据的动作。

**人工评审**：产品、古籍编辑、历史地理、版权、设计、声学问题清单。

**停止条件**：底本未冻结；occurrence 定义不清；三地理层或四时间轴仍混淆；rights/interpretation 状态未分离；无法建立不覆盖现有 dirty changes 的工作方式。

**Gate 0 通过后才允许写 schema/code。**

### Phase 1 — Corpus inventory 与垂直 pilot

选择一个有代表性的冻结篇章/山系，完成 100% passage 审计；样本应包含重复出现异兽、未定实体、方向/里距链、至少两个地望候选、历史图像与声描写。

**交付**：corpus → occurrence → concept → taxonomy → topology → candidate → media/icon → sound 的完整垂直链；Shanhaijing profile；注册契约最小实现；动态 API 与基础 UI。

**停止条件**：任何 occurrence 无 passage；归并无决策；候选地被写成唯一事实；图像/声音缺 provenance 或 disclosure；profile 在静态 bake/search/drawer 任一处遗漏。

### Phase 2 — 语料扩展与大地图

按篇章批次扩大 inventory，不按“著名程度”选怪；先补齐段落审计，再补媒体。实现 topology layout、候选集切换、viewport partition/LOD，并跑 100/500/1000+ gate。

**交付**：覆盖矩阵、批次生成 seed、地图基准报告、专题筛选、四轴时间线、通用 relation graph。

**停止条件**：覆盖统计不能重现；1000+ 基准越界且无技术决策；标签/图例无法区分不确定性；移动端不可用。

### Phase 3 — 图像志、图标体系与声音 Phase 1

扩展历史插图、开放媒体、专用图标 registry 和解释性声音；播放器保持显式点击、全局单轨、无 autoplay。

**交付**：媒体/icon/audio manifests、rights verifiers、批量资产预算、drawer gallery、图像时间线、音频文本替代。

**停止条件**：rights 未核验仍暴露本地路径；地图图标与历史图像语义混淆；声音模拟被描述成真实录音；响度/peak/manifest 不合格。

### Phase 4 — 全语料覆盖候选与专家评审

完成冻结底本 100% passage inventory；将所有待裁决项明确列出；逐轴审计分类、地望、翻译、图像和声音，不以“媒体覆盖不足”阻止无媒体实体公开，但必须明确空状态。

**交付**：生成 coverage 报告、专家 review 结论、争议清单、修订 migration/seed、完整静态候选。

**停止条件**：仍以手工数字声称全量；重大专家争议未披露；中英文 published 状态错误；静态/动态 parity 不一致。

### Phase 5 — 性能、可访问性、staging 与发布

完成 code splitting、分片 bake、缓存、资源压缩、浏览器矩阵、无障碍审计和 staging soak。

**证据层级必须分别记录**：

1. local candidate；
2. isolated database；
3. built static artifact；
4. staging；
5. production。

低层证据不得写成高层完成。生产发布需单独明确授权、回滚方案、版本 manifest 和 production smoke；本计划不自动授权部署。

### Phase 6 — 可选高级声景

仅在声音数据契约、性能、无障碍和版权稳定后考虑循环、crossfade、混音与空间声；任何功能均有关闭和文本替代。该阶段不属于首个 release 的 Definition of Done。

## 15. HANDOFF 纪律

每个阶段、每个协作者、每个中断点都必须及时提交同一结构：

1. Scope / completed。
2. Evidence：路径、symbol、命令、报告链接。
3. Findings。
4. Assumptions / unverified。
5. Risks。
6. Recommended decisions。
7. Next steps + 明确 owner。
8. Explicit incomplete items。

额外规则：

- 报告开头写 evidence level 和输入版本/checksum。
- 自动生成 counts/coverage/media bytes/rights/missing/stale，不人工复述数字。
- Gate 未通过必须写“blocked”，不能用“基本完成”绕过停止条件。
- 子任务停滞不阻塞主线；主负责人接管文档并明确记录未采用的子任务输出。
- 每次 migration/seed/editorial correction 更新 `DECISION_LOG.md` 和 HANDOFF evidence index。
- 参考现有 `docs/HANDOFF_DECISIONS_2026-08-09.md` 对 local/isolated/static/production 的分层方式，但扩为五层。

## 16. 风险登记

- **语料总数争议**：不同版本、切分和归并规则会改变数量。缓解：冻结 edition/passages，分别报告 concept/occurrence/coverage。
- **著名异兽偏差**：媒体易得性驱动内容选择。缓解：inventory first，按 passage 缺口排期。
- **现代坐标伪确定性**：精美地图掩盖争议。缓解：三层分离、多候选、可见置信度与来源。
- **分类过度简化**：鸟/兽二分损失复合、植物/矿物异常。缓解：多轴、多值、未定和 assignment evidence。
- **API/前端静默遗漏**：现有硬编码 union/branch 扩展风险。缓解：registry completeness test。
- **大图性能**：SVG/DOM 与全量 payload 随规模失控。缓解：基准门槛、分片、LOD、Canvas/WebGL/MapLibre 条件决策。
- **媒体版权与语义误导**：古图、现代插图、AI 图混用。缓解：role/status/interpretation/rights 独立、fail closed。
- **声音真实性误导**：模拟被听成历史复原。缓解：证据与输出解释等级分离、持续免责声明、manifest。
- **包体继续增长**：现有主 JS 已有约 666 KiB 文档证据。缓解：Phase 0 baseline、route/component/media lazy load、分片。
- **双语质量漂移**：fallback 掩盖未发布文本。缓解：published-only、coverage report、语言专家抽查。
- **参考地图权利不明**：视觉借鉴变成未经许可复制。缓解：逐图审计、只抽象布局原则、未知权利不打包。
- **dirty worktree 冲突**：覆盖 Bible pilot 等现有工作。缓解：先记录状态和建立可写检查点；逐文件理解后改，不回退用户内容。

## 17. 需要专家评审的问题

- 采用哪个底本/校勘体系作为 passage inventory 基线，如何标识异文而不建立伪权威文本？
- 对同名异物、异名同物、群体称谓和疑似普通动物，归并/拆分的最低证据是什么？
- “怪物/异兽/神祇/人/部族/植物矿物异常”的编辑边界如何双语表达，避免现代分类强加古籍？
- 里制、方向词、发源/注入关系在各篇中的语义差异，哪些可计算，哪些只能原样呈现？
- 哪些地望研究可作为独立 candidate set，confidence 由谁评定？
- 古籍影印、历代图像、博物馆数字对象、现代研究地图的发布权利边界是什么？
- 动物声学类比是否可能造成错误物种认同，免责声明和审稿流程应多严格？
- 哪些英文译名可使用，哪些必须保留拼音 + 解释以避免伪确定分类？

## 18. Definition of Done（首个正式版本）

- 冻结底本的 passage inventory 100% 有审计状态，覆盖报告可重现。
- concept、occurrence、coverage 三个数量独立生成并与 API/静态 artifact 一致。
- 每个 occurrence 可回到 passage；每个归并/拆分有 editorial decision。
- 多轴 taxonomy 可筛选、可解释、允许多值/未定。
- 文本拓扑、学术候选和现代底图三层独立且 UI 不误导。
- 四条时间轴独立，异兽无伪 BCE/CE 生卒年。
- registry completeness 覆盖所有 Shanhaijing kind；search、drawer、media、bake、selection 无静默遗漏。
- 图片、图标、地图和声音通过 rights/provenance/checksum/interpretation verifier；缺失媒体是正常可用状态。
- 声音仅显式播放、全局单轨、无 autoplay，并提供文字替代和解释等级。
- 100/500/1000+ 地图基准通过冻结预算或有批准豁免；移动端、键盘、对比度、reduced modes 通过。
- dynamic API 与 static bake parity 通过；typecheck、tests、build、PostGIS、所有 Shanhaijing verifier 通过。
- local、isolated DB、static、staging、production 证据分别记录；只有实际 production smoke 后才能标记线上完成。
- HANDOFF、decision log、risk register、生成报告和下一 owner/action 完整。

## 19. 关键复用文件与 symbols

- `apps/web/src/profile.ts`：`WorkProfile`、`PROFILES`；新增 profile 和领域注册接点。
- `apps/web/src/types.ts`：`AtlasResponseSchema`、`EntityTypeSchema`、`MediaSchema`；扩展契约并拆分领域 schema。
- `apps/web/src/hierarchy.ts`：`visibleEvents`、`visibleCharacters`、`visibleLocations`、`visibleRelations`、`buildGraph`；复用纯派生模式。
- `apps/web/src/components/AtlasMap.tsx`：`AtlasMap`、`RealMap`、`FictionalCanvas`、`ClusteredMarkers`、`AutoFitController`；保留可复用交互，替换大规模虚构地图实现。
- `apps/web/src/components/TimelineRibbon.tsx`：时间模式、undated、collision lanes；扩为四轴。
- `apps/web/src/components/RelationGraph.tsx`：graph levels 与表格 fallback；泛化多 kind relation。
- `apps/web/src/components/EntityDrawer.tsx`：drawer shell、lazy detail 和媒体显示；改为领域 renderer。
- `apps/web/src/components/GlobalSearch.tsx`：搜索映射；接入 registry。
- `apps/api/src/app.ts`：Atlas/detail/search/media 聚合；缩小为 core + domain loader，并修复 media kind completeness。
- `apps/api/src/music.ts`：`loadMusicAtlas()`；作为独立领域 loader 模式参考。
- `apps/api/src/bake-static.ts`、`deploy/deploy-static.sh`：静态 bake/deploy 证据链。
- `db/migrations/011_artwork_media_rights.sql`、`019_media_visual_context.sql`：media provenance、rights、role/status 基础。
- `db/migrations/014_music_score_assets.sql`：生成 manifest、checksum、audio profile 约束参考，不直接复用 score 表。
- `scripts/verify_artwork_media.ts`、`verify_bible_visual_media.ts`、`verify_european_music.ts`：fail-closed verifier 与机器生成报告模式。
- `docs/DATA_SOURCE_POLICY_v3.1.md`、`ARTWORK_MEDIA_RIGHTS.md`、`HANDOFF.md`、`HANDOFF_DECISIONS_2026-08-09.md`：来源、证据边界与交接基线。

## 20. 首轮实施顺序

1. 建立安全分支/检查点并记录现有 dirty worktree，绝不回退用户更改。
2. 创建 `docs/shanhaijing/` 全部文档骨架、HANDOFF 模板、decision/risk log 和 reference map audit；先完成内容，再动代码。
3. 审查并项目级安装 UI UX Pro Max，记录 provenance 和采用规则。
4. 冻结底本、passage segmentation、occurrence/concept 编辑规则和 Pilot 篇章。
5. 建立机器可读数据字典与 verifier 输出 schema，生成 Phase 0 baseline。
6. 实现领域注册契约及 completeness tests，先修复现有 media/search/bake 静默遗漏风险。
7. 按迁移分层实现 corpus、concept/occurrence、taxonomy、geography、chronology、media/icon、sound。
8. 完成一个 100% passage-audited 垂直 Pilot，再扩篇章，不从著名怪物清单倒推数据。
9. 实现大地图和四时间轴，跑 100/500/1000+ benchmark 后选择长期渲染技术。
10. 接入图像、图标和声音 Phase 1，逐批 fail-closed 验证。
11. 完成全语料候选、专家评审、性能/无障碍、静态 parity 与 staging。
12. 仅在单独发布授权后部署 production，并记录 production smoke 与回滚证据。
