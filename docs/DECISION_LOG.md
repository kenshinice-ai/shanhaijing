# 《山海经 Atlas》决策日志

- 状态：`review_ready`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 适用阶段：Phase 0 / Gate 0

本文件记录影响范围、数据语义、证据门禁和实施顺序的决策。候选方向不是已批准决策；没有批准者、日期和输入版本的条目不得作为冻结契约。被替代的决策保留记录，不静默删除。

## 决策状态

- `proposed`：已提出，尚未批准。
- `accepted`：已批准并在声明范围内生效。
- `accepted-with-actions`：原则已批准，但仍有明确前置动作，不代表 Gate 通过。
- `rejected`：已明确拒绝。
- `superseded`：被后续决策替代。

## 记录

### SJ-D001：采用文档优先、Gate 0 通过前不写业务实现

- 状态：`accepted-with-actions`
- 日期：2026-08-14
- 批准者：`主负责人，待正式复核签名`
- 输入：`memoized-riding-giraffe.md`，现有 dirty worktree 状态
- 决策：先完成并评审领域规范、证据契约、交接、风险、专家问题和发布门禁；Gate 0 通过前不开始 Shanhaijing migration、seed、API、UI、资产生成、benchmark 或部署。
- 理由：底本、段落切分、occurrence/concept 规则和证据层级尚未冻结。
- 影响：所有实现工作保持 blocked；现有 Bible visual pilot 等未提交变更不属于本项目成果。
- 前置动作：完成 `README.md` 清单中的全部文档并执行 cross-document consistency pass。
- 证据：`HANDOFF.md` 第 2、4、8 节。

### SJ-D002：分离 concept、occurrence 与 corpus coverage 三个统计维度

- 状态：`accepted-with-actions`
- 日期：2026-08-14
- 批准者：`待古籍编辑与产品负责人复核`
- 输入：核心蓝图第 2、5、18 节；`CORPUS_AND_EDITORIAL_POLICY.md`；`CONTENT_COVERAGE_MATRIX.md`
- 决策：unique creature concepts、textual occurrences、冻结语料段落 coverage 分别建模、分别统计、分别报告。
- 理由：同一名物多次提及、同名异物和待裁决实体不能通过一个“异兽数”掩盖。
- 影响：数据模型、verifier、API counts、static parity 和 release checklist 都必须保留三项独立结果。
- 未决：首个底本、切分和 Pilot 范围。

### SJ-D003：三层地理与四轴时间严格分离

- 状态：`accepted-with-actions`
- 日期：2026-08-14
- 批准者：`待历史地理专家复核`
- 输入：`GEOGRAPHY_AND_MAPS.md`；`CHRONOLOGY_MODEL.md`
- 决策：文本拓扑、学术候选、现代底图是不同证据层；内部篇章序列、成书/编订、注本/版本、图像/研究/资产分别建模。
- 理由：避免把布局坐标当成古代事实、把候选地当成定论，或给异兽生成伪 BCE/CE 生卒年。
- 影响：数据库、地图图例、时间轴模式、API payload 和 UI 文案均需显式携带层级。
- 未决：候选 set、confidence 责任人、投影和具体底图来源。

### SJ-D004：权利、来源和解释等级独立并 fail closed

- 状态：`accepted-with-actions`
- 日期：2026-08-14
- 批准者：`待版权/媒体专家复核`
- 输入：`MEDIA_ICON_ILLUSTRATION_POLICY.md`；`ASSET_MANIFEST_SPEC.md`；`SOUND_RECONSTRUCTION_POLICY.md`
- 决策：`rights_status`、`source_attestation`、`interpretation_class`、`geographic_confidence` 独立保存；权利或 provenance 不完整的资产不得进入 public/build/CDN 可达路径。
- 理由：可访问不等于可再发布，艺术演绎不等于文本事实，图像精度不提高地望置信度。
- 影响：manifest、media API、静态 bake、撤回流程和 verifier 必须默认拒绝不合规资产。
- 未决：实际媒体来源、许可、reviewer 和撤回演练。

### SJ-D005：声音 Phase 1 仅提供显式、单轨、可披露的推演

- 状态：`accepted-with-actions`
- 日期：2026-08-14
- 批准者：`待声学与无障碍专家复核`
- 输入：`SOUND_RECONSTRUCTION_POLICY.md`
- 决策：先用确定性 recipe 验证声音链路；首版无 autoplay，显式点击播放，全局单轨，并提供 transcript/description、解释等级和免责声明。
- 理由：原文声描写不等于保存下来的真实录音，模型或 DSP 输出不应伪装成确定复原。
- 影响：播放、rights gate、manifest、浏览器测试和 reduced-audio 控件必须覆盖这些状态。
- 未决：具体音频 profile、响度阈值、类比来源和审稿人。

### SJ-D006：生产部署需要独立授权

- 状态：`accepted-with-actions`
- 日期：2026-08-14
- 批准者：`待发布负责人复核`
- 输入：`RELEASE_CHECKLIST.md`；`HANDOFF.md`
- 决策：文档或代码交接不自动授权 staging、production、Cloudflare 或其他外部发布；生产必须另有明确授权、版本 manifest、rollback 和 smoke 证据。
- 理由：证据层级不能越级，且外部发布是不可逆或高影响动作。
- 影响：Release Gate 5 在缺少授权或 production evidence 时保持 blocked。
- 未决：部署目标、发布负责人、rollback 机制和 production smoke 命令。

### SJ-D007：采用“项目责任 reviewer + 权威基线 + 外部人工签署”模型

- 状态：`accepted-with-actions`
- 日期：2026-08-15
- 批准者：`用户明确授权；主负责人执行`
- 输入：`REVIEWER_ASSIGNMENTS_2026-08-15.md`；国家图书馆、复旦大学历史地理研究中心、国家版权局、ITU、EBU、国家标准全文公开系统、Library of Congress、W3C、web.dev 官方资料
- 决策：正式指定 `R-CLASSICS`、`R-GEO`、`R-RIGHTS`、`R-AUDIO`、`R-BILINGUAL-ZH`、`R-BILINGUAL-EN`、`R-A11Y`、`R-PERF` 与 `R-RELEASE` 项目责任角色；机构或个人只作为外部签署候选，未联系前不得写成已接受委任。
- 理由：项目可立即按权威标准执行内部审查，同时避免虚构外部专家背书。
- 影响：`EXPERT_REVIEW_QUESTIONS.md` 的 reviewer 从 unassigned 改为具体角色；外部签署未完成时 Gate 0 继续 blocked。
- 前置动作：为古籍、历史地理、法律、母语翻译、辅助技术和真实性能测试取得具名外部 reviewer 的接受与结论。
- 证据：`REVIEWER_ASSIGNMENTS_2026-08-15.md`。

### SJ-D008：用户提供地图仅作为内部视觉参考

- 状态：`accepted-with-actions`
- 日期：2026-08-15
- 批准者：`用户提供；主负责人按 fail-closed 政策裁决`
- 输入：`/Users/llmacbookpro/Downloads/8259114179_29498.png`；SHA-256 `d3f65b6e0d5fc30b65cfc472a003bdf6950b1c625d1939f6816829465f87db37`
- 决策：登记为 `MAP-001`，仅允许内部分析信息密度、视觉分区、山水层级和标签问题；在作者、来源、权利、投影、图例和地望方法未核验前，不得复制、打包、矢量化、提取点位或作为 scholarly geography claim。
- 理由：精细视觉表现不等于地望可信或获得再发布权；现有文件无可核验来源和许可。
- 影响：`REFERENCE_MAP_AUDIT.md` 从 0 项更新为 1 项；rights 保持 `unknown`，data/source claim fail closed。
- 前置动作：取得原始页面、作者/机构、发布日期、许可和方法说明；由 `R-RIGHTS` 与 `R-GEO` 独立复核。
- 证据：`REFERENCE_MAP_AUDIT.md#map-001`。

### SJ-D009：采用艺术总览与权威证据视图并行的双轨地图

- 状态：`accepted-with-actions`
- 日期：2026-08-15
- 批准者：`用户确认权威方向；主负责人执行`
- 输入：`MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md`；国家图书馆《山海经》知识库、Harvard CHGIS、IIIF、W3C Web Annotation、MapLibre 和 PMTiles 官方资料
- 决策：允许制作超级完整的幻想拼接总图作为 `艺术总览`，同时保留原文路线拓扑、学术候选地、现代对照、版本与图像四个权威证据视图。艺术母图不烘焙标签，由程序叠加热点、图例和说明；Pilot 使用确定性 D3/Canvas topology 与现有 Leaflet/Supercluster candidate map，只有性能报告触发时才迁移 MapLibre + PMTiles。
- 理由：大而全的幻想地图提供视觉冲击和探索感；独立证据视图确保艺术拼接不会被误读为古代地望或现代坐标结论。
- 影响：新增 artistic composite asset/renderer、renderer-neutral map adapter、独立 coordinate-space discriminant、candidate-set compare mode、IIIF/source image viewer 和 benchmark-triggered scale path。
- 前置动作：冻结 Pilot、topology/candidate schema、两个 candidate set fixture、rights-approved source image fixture 和性能预算。
- 证据：`MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md`。

### SJ-D010：授权 V1 垂直试点先于外部签署实现

- 状态：`accepted`
- 日期：2026-08-18（实现完成于 2026-08-16 至 2026-08-18；本条为补记）
- 批准者：`用户授权；主负责人执行`
- 输入：`memoized-riding-giraffe.md` 第 3 节 inventory-first Pilot 路线；SJ-D001 至 SJ-D005 的语义约束
- 决策：在外部专家签署完成前，按已冻结的领域语义先实现《南山经》鹊山首列的 V1 垂直试点（schema、seed、API、UI），证据层级保持 `local_candidate`，`published` 状态限定为产品内部编辑候选通道。
- 理由：垂直试点验证 occurrence/concept 分离、逐段 checksum、拓扑建模与 fail-closed 媒体门在真实代码中的可行性，是外部评审的最好输入；不实现则评审对象只有纸面契约。
- 影响：部分放宽 SJ-D001 的"Gate 0 前不写实现"约束，放宽范围仅限 V1 垂直切片；隔离库证据、领域 verifier、静态 parity、性能基准与部署仍受原门禁约束。外部签署仍是 Scale 阶段扩量与任何发布的前置条件。
- 证据：commit `5591228`；`HANDOFF.md` 第 0 节。

### SJ-D011：艺术总览采用原创程序化 SVG，光栅生成推迟

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户拍板`
- 输入：`FANTASY_COMPOSITE_MAP_GENERATION_STATUS.md`（`blocked_missing_api_key`）；`REFERENCE_MAP_AUDIT.md` MAP-002 至 MAP-004（provenance pending）；`FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md`
- 决策：V1 艺术总览不再等待外部图像生成或外来候选图确权，改为项目自绘的**确定性程序化 SVG 手卷式拼接总览**：从 `shj_textual_places`/`shj_topology_edges`/`shj_creatures` 数据驱动渲染，山形、水系、异兽标记与图例均为原创矢量绘制，免责声明常驻。ImageGen 光栅母图与 MAP-002/003/004 的确权推迟到 Scale 阶段，作为可选升级而非阻断项。
- 理由：原创 SVG 权利链零风险、完全可复现（无模型随机性）、随语料扩量自动生长、可访问性（DOM 文本、焦点、reduced-motion）优于位图热点方案；同时消除对外部 API key 与未确权图像的依赖。
- 影响：`shj_artistic_overviews` 状态从 `blocked_missing_api_key` 更新为程序化渲染态；`coordinate_space` 记为 `artistic-composite-svg-v1`；MAP-002 至 MAP-004 保持 `internal_candidate_only` 不阻断任何工作。艺术构图仍不得被解读为地望结论，disclosure 不变。
- 证据：seed `066_shanhaijing_svg_overview.sql`；`ShanhaijingWorkspace.tsx` 的 SVG 渲染实现。

### SJ-D012：主负责人内部签署,外部机构签署保持 pending

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`主负责人(用户)明确确认`
- 输入：`REVIEWER_ASSIGNMENTS_2026-08-15.md`；`generated/domain-verification.json`；`generated/isolated-bootstrap-2026-08-18.md`；SJ-D007
- 决策：主负责人以项目负责人身份签署确认当前 reviewer 责任模型与 V2 内部编辑结论，授权项目在 `local_candidate` / `isolated_database` 证据层继续推进。**不将其记为外部专家签署**：`REVIEWER_ASSIGNMENTS` 中所有外部机构与个人保持 `external_not_contacted`，外部签署状态保持 `pending`。
- 理由：SJ-D007 明确规定未联系的机构或个人不得写成已接受委任。以内部签署解除工程推进阻断，同时不制造任何虚构的学术、法律或无障碍背书，是唯一同时诚实且可执行的记录方式。
- 影响：Gate 0 的内部工程门槛解除，schema/code/语料扩量在 V1/V2 范围内获授权；涉及外部专业判断的结论（底本学术定论、地望主张、版权法律意见、母语审校、辅助技术实测、真实设备性能）仍受阻，不得在对外文案中声称机构或专家认可。生产发布仍按 SJ-D006 需独立授权。
- 前置动作（不阻断当前工作）：如需真正的外部签署，按 `REVIEWER_ASSIGNMENTS` 候选逐项联系并记录具名接受与结论。
- 证据：`REVIEWER_ASSIGNMENTS_2026-08-15.md` 第 5 节。

### SJ-D013：抽出为独立仓库

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户指定目标目录并授权执行`
- 输入：`MIGRATION_PLAN_2026-08-18.md`；迁移前基线（43/43、23、24、39、36、3 与母图 SHA-256）
- 决策：把《山海经 Atlas》从多图集 monorepo 抽出为独立仓库 `ShanHaiJing`，数据库改为
  `shanhaijing_atlas`；共享内核压平为一个 `001_core.sql`，PostGIS 整体移除；原仓库的山海经
  代码保留不删，其清理另需授权。
- 理由：领域 seed 与其他作品数据零耦合，抽出成本低；共享仓库带来 payload 污染、构建产物跨图集
  混入、migration 编号竞争与门禁互相牵连。
- 影响：`dist` 86 MB → 716 KB，payload 顶层集合 24 → 5，migration 21 → 2；迁移中修复了跨山系
  段落排序与烘焙目录污染两个缺陷，前者仍存在于原仓库。
- 证据：`MIGRATION_RECORD_2026-08-18.md`。

## 待裁决问题索引

- `EXPERT_REVIEW_QUESTIONS.md`：学科专家问题与 reviewer disposition。
- `RISK_REGISTER.md`：风险、触发器、owner、缓解和状态。
- `RELEASE_CHECKLIST.md`：五层证据与发布门禁。

## 修订记录

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `SJ-DLOG-001` | 2026-08-14 | 建立 Phase 0 决策记录 | 主负责人 | `HANDOFF.md` |
| `SJ-DLOG-002` | 2026-08-15 | 指定 reviewer 模型并裁决用户参考地图 | 主负责人 | `REVIEWER_ASSIGNMENTS_2026-08-15.md`、`REFERENCE_MAP_AUDIT.md` |
| `SJ-DLOG-003` | 2026-08-15 | 采用艺术总览 + 四类权威证据视图的双轨地图 | 主负责人 | `MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md`、`FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md` |
| `SJ-DLOG-004` | 2026-08-18 | 补记 V1 垂直试点授权（SJ-D010）；裁决艺术总览走原创 SVG（SJ-D011） | 主负责人 | `HANDOFF.md` 第 0 节、commit `5591228` |
| `SJ-DLOG-005` | 2026-08-18 | 记录主负责人内部签署，外部机构签署保持 pending（SJ-D012） | 主负责人 | `REVIEWER_ASSIGNMENTS_2026-08-15.md` 第 5 节 |
| `SJ-DLOG-006` | 2026-08-18 | 抽出为独立仓库并压平共享内核（SJ-D013） | 主负责人 | `MIGRATION_RECORD_2026-08-18.md` |
