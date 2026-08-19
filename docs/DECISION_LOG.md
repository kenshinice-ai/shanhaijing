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

### SJ-D014：为语料实际使用的生僻字随站点分发子集字体

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户授权先修复再发布`
- 输入：烘焙产物中扫出的八个码位（Ext-A `U+437A,U+44D8,U+49FF,U+4A3C`；Ext-B `U+28D2F,U+29FE7,U+2A07A,U+2A2A8`）
- 决策：从 Jigmo（`Jigmo-20250912`，字体文件 CC0 1.0）子集出两枚仅含这八个字形的 woff2（合计 4 KB），
  以 `unicode-range` 精确挂在字体栈最前；其余字符仍走系统字体。
- 理由：macOS/iOS/Android 出厂字体均不含扩展 B 区这四个字，异兽概念「𪁺𩿧」在首版界面上是两个空框。
  以生僻异兽名为主体的图集不能在最该显示的地方丢字；整套 CJK 字体则违反性能预算。
- 影响：新增受权利约束的二进制资产一类，出处、上游与产物 checksum、重新生成命令登记于
  [RARE_GLYPH_FONT.md](RARE_GLYPH_FONT.md)；语料扩量后需重扫码位并重做子集。
- 证据：`RARE_GLYPH_FONT.md`；部署脚本对两枚 woff2 的产物断言。

### SJ-D015：授权发布首个公开版本

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户（仓库所有者）在迁移验证通过后授权`
- 输入：全新空库 fresh/repeat bootstrap、`verify:domain` 196 检查 0 错误、`verify:docs` 277 检查 0 错误、
  两个生成器 checksum 与迁移前逐字节一致、dynamic/static parity 双语零差异、根级 `npm test` 24 项通过
- 决策：以 v1.0.0 发布静态站点至 Cloudflare Pages 项目 `shanhaijing-atlas`，解除 SJ-D006 的发布封锁。
- 理由：迁移证据完整且可复现；发布前发现的三项缺陷（测试套件未随迁移带过来、扩展 B 区空框、
  地图标签重叠）已修复并各自留下机器可验证的证据。
- 影响：性能、无障碍与 reduced-data 报告仍未生成，属书面放行的例外，记在
  `RELEASE_CHECKLIST.md` 第 3 层；外部机构签署仍 `pending`（SJ-D012），对外文案不得声称机构或专家认可。
- 证据：`RELEASE_CHECKLIST.md` 的 release approval record。

### SJ-D016：不等待外部签署，改为在站点上声明其不存在

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户裁定：绕过签署，放免责声明`
- 输入：SJ-D012（主负责人内部签署，外部机构签署 `pending`）、`EXPERT_REVIEW_QUESTIONS.md`
- 决策：不再把外部机构签署作为发布前置条件；改为在界面上常驻双语无背书声明，
  明确本图集为项目自行编纂的候选成果，分类、地望候选、声音推演与艺术演绎均为编辑判断。
  声明文案由单元测试守护（不得出现"认证/权威结论/peer-reviewed/endorsed"等措辞），
  并由部署脚本断言其确实进入产物。
- 理由：外部签署是不可控的外部依赖，把发布无限期挂起并不会让读者更清楚证据等级；
  **未被声明的"没有背书"，在读者眼里与"有背书"无异**。主动披露比沉默等待更诚实，
  也与本项目一贯的分层证据规则一致。
- 影响：`RELEASE_CHECKLIST.md` 中"外部人工签署"由阻断项改为已披露事项；
  SJ-D012 保持 `pending` 但不再阻断发布；对外文案的约束不变——不得声称机构或专家认可。
- 证据：`apps/web/src/i18n.ts` 的 `NO_ENDORSEMENT`、`apps/web/src/i18n.test.ts`、
  `deploy/deploy-static.sh` 的产物断言。

### SJ-D017：冻结四项可复现性能预算，绘制与交互保持 candidate

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户授权本轮关闭发布例外`
- 输入：`generated/performance-baseline.json`（12 文件、每项 60 次测量）、
  `generated/performance-runtime-2026-08-18.md`（桌面/生产/移动模拟观测）
- 决策：冻结首屏 brotli、主 bundle brotli、单 locale payload 原始字节、Zod 校验 p95 四项预算，
  并在 CI 中以 `--check` 执行；绘制、长任务与交互延迟维持 `candidate`。
- 理由：这四项在任何机器上都能复现，具备成为 gate 的资格；paint 与交互依赖设备与网络，
  当前 harness 没有 CPU 降频与真机，任何冻结都会是伪证据。
- 影响：语料扩量触及 payload warning（200 KB）时触发分片/LOD 决策，而不是放宽阈值；
  移动端预算的冻结列入下一轮前置条件。
- 证据：`PERFORMANCE_BUDGETS.md` §3.1。

### SJ-D018：分类词表升为一等对象并双语化

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户列入本轮范围`
- 输入：使用中的 7 轴 44 词条及其原文证据（`shj_taxonomy_assignments.evidence_note`）
- 决策：新增 `shj_taxonomy_axes`／`shj_taxonomy_terms`（migration `003`），词表由
  `generate:taxonomy` 确定性产出 seed `005`，并在装入后对指派建立 `(axis, term)` 外键；
  API 以 INNER JOIN 返回本地化标签与定义，界面不再显示 slug。
- 理由：中文优先的图集在证据面板上显示 `behavior / man eating`，是把机器标识当成了读者界面；
  更实际的风险是自由文本没有唯一性约束，同一概念迟早写成两种拼法而统计无从发现。
- 影响：`TaxonomySchema` 的三个标签字段为**必填**——缺翻译即 payload 解析失败，
  比"英文兜底"更早暴露问题；词表随语料扩量增补，新词条必须同时给出双语定义。
- 证据：`TAXONOMY.md` §5.0、`verify:domain` 的 TAXONOMY-* 检查、`generated/domain-verification.json`。

### SJ-D019：X-2 裁定「异体字不算异文」，并据此冻结《西山经》语料

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户裁定 X-2；并授权据此冻结`
- 输入：`XISHAN_BASELINE_OPTIONS_2026-08-18.md`；ctext 白文与维基文库本（含郭璞注）当日抓取
- 决策：
  1. **异体字不算异文**。底本照 ctext 印出的字形录入，异体差异不产生 variant 记录。
  2. 据此冻结《西山经》语料为 `xishan-v1-public-domain-collation`，切分版本 `xishan-full-v1`，
     82 段、4 列山系，逐段 SHA-256 与 edition checksum 入库。
  3. 段落一律以 `draft` 入库：**文本已冻结 ≠ 内容已审核**，因此不进 API、不进产物、不计入覆盖率分子。
- 理由：X-2 若不先裁，这一篇会凭空产生数十条无意义 variant，把真正的分歧淹掉——
  实测 ctext 与维基文库有 52/82 段存在文字差异，其中 42 处属异体（33 对字形）。
  异体对照表逐条列出并附理由，**表外的一切差异一律进入待裁，不做猜测**：现存 50 处。
- 影响：
  - baseline 唯一性由「每作品一个」下沉为「每篇一个」（migration `004`），
    南山经底本除多一列 `scope` 外分毫未动，其 checksum 不受影响。
  - 两条验证不变量按状态收窄：双语齐备与逐段审核记录只约束**离开 draft 的段落**——
    对刚冻结的语料强求译文与审核记录是循环要求，且会训练人忽略这两条检查。
  - 郭璞注 280 条与维基文库「一作X」校语 10 条已登记，均不进 baseline。
- 证据：`scripts/data/xishan_corpus_v1.json`、`db/seeds/006_xishan_corpus.sql`、
  `generated/domain-verification.json`（286 检查 0 错误）、`CONTENT_COVERAGE_MATRIX.md` §5。

### SJ-D020：母图改用水墨画风

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户要求按最优解并作对比`
- 输入：三套画风同几何渲染（手卷／青绿／水墨）及其在标签落区的像素分布实测
- 决策：母图默认画风改为 `ink`（水墨），三套调色板全部保留在生成器中可随时重出比较。
- 理由：母图的职责是背景，其上要落 94 个标签。实测标签落区内「与标签抢对比的亮像素」占比：
  青绿 5.47%、手卷 2.30%、水墨 1.42%。**青绿单看最漂亮，也最不适合当背景**；
  水墨陆地最暗、噪声最低，山簇与水系仍清晰。
- 影响：母图 checksum 由 `6e6b4eee…` 变为 `b6b4baa1…`；几何、热点坐标与段落映射一字未动。
  生成器脚本 checksum 同步在 seed `003` 重新登记——`verify:domain` 的 `overview-prompt`
  闸门当场拦下了未登记的改动，这正是它存在的意义。
- 证据：`generated/map-variants-2026-08-18.md`。

### SJ-D021：性能预算按传输与计算重定，加载模型定为全量加载

- 状态：`accepted`
- 日期：2026-08-18
- 批准者：`用户要求按真实用户体验判定`
- 输入：`generated/loading-model.md`（把领域内容按真实《西山经》原文投影放大后实测）
- 决策：
  1. 预算改以**传输字节（brotli）与计算时间**为准，原始字节退为理智上限并大幅放宽；
  2. 新增「地图标签避让（全书规模）」预算；
  3. 加载模型定为**全量加载**，不做按需分片。
- 理由：全书外推的真实代价是 brotli 39 KB、解析加校验约 3.4 ms。为省下这点东西而引入
  分片，要付出路由、缓存失效、离线可用性与「切篇时白屏」的代价——**用户体验是变差而非变好**。
  真正随规模恶化的是标签避让（曾 625 ms），那已通过空间索引与 memo 解决并纳入预算。
- 影响：语料扩至全书无需改动加载架构；若标签避让越过 warning，反应是继续优化算法，
  不是削减地图内容。
- 证据：`PERFORMANCE_BUDGETS.md` §3.1、`generated/loading-model.md`、`generated/performance-baseline.md`。

### SJ-D022：《西山经》异文逐条裁决，未决者留白，并声明校勘无专家复核

- 状态：`accepted`
- 日期：2026-08-19
- 批准者：`用户指派本轮由 AI 裁决，并要求无法确认者标出、政策中作免责声明`
- 输入：50 处待裁差异；各山系结语里程与山数；`XISHAN_COLLATION_PLAN.md` 所定方法
- 决策：
  1. 逐条裁决 50 处差异：**23 处判定沿用底本、11 处采校核本、3 处归入异体、11 处标为未决**。
  2. 每条附依据类别与置信度，载于 `scripts/data/xishan_rulings_v1.json`，可逐条推翻。
  3. `CORPUS_AND_EDITORIAL_POLICY.md` §4.5 增设「校勘执行者资质与免责」：
     明确允许采信的四类依据、禁止采信的说法、依据不足时必须留白、以及对外披露义务。
  4. 站点无背书声明补入「原文校勘未经古籍专家复核」。
- 理由：无限期挂起不会让文本更可靠；有依据、可复核、明确标注不确定性的候选裁决，
  比一份「50 处待裁」的空白更有用，也比不加区分地采信任一版本更诚实。
  **执行者不是专家，所以规则比结论更重要**：禁止以「通行本作」这类无出处的记忆充当证据，
  正是为了防止非专业执行者把记忆包装成学术。
- 影响：
  - 语料 checksum 更新（`40468036…`）；11 处未决差异保留在册，随时可继续裁定。
  - **证据层级不因本轮上升**，仍为 `local_candidate`；段落仍为 `draft`，不进 API 与产物。
  - 算术副产物：四列山系的段内里程相加与其结语**在采纳任何异读之前即不相符**
    （−140、+530、−304、−95），此发现是 X-4 的直接输入。
- 证据：`scripts/data/xishan_rulings_v1.json`、`scripts/data/xishan_corpus_v1.json`、
  `CORPUS_AND_EDITORIAL_POLICY.md` §4.5。

### SJ-D023：增设 `provisional` 一档，《西山经》异文全部处置完毕

- 状态：`accepted`
- 日期：2026-08-19
- 批准者：`用户：11 处未决亦按同法尽量裁定；古书数字记载本难全书一致，取最优解即可`
- 输入：SJ-D022 留下的 11 处未决；南山经与西山经全文的内部频次与共现统计
- 决策：
  1. 结论由两档扩为三档，新增 `provisional`——证据有倾向但不足以定案者，
     取倾向读法作工作底本，置信度记 `low`，另一读留档，**不得上升为定案**。
  2. 据此处置全部 11 处：1 处升为定案（段59），10 处暂定，**未决归零**。
  3. 政策 §4.5.3a 明确：数字类差异不以能否弥合结语为标准，且一律不高于 `provisional`。
- 理由：结语与段内相加本就不符（−140／+530／−304／−95），这是文本自身的状态，
  不是校勘能消除的。把这类差异无限期挂起，既不使文本更可靠，也让读者无从使用。
  **档位本身承载信息**：把 10 处标成 `low`，比把它们藏进「已定案」诚实，
  也比继续留白有用。
- 新增内部证据（本轮才计算，此前缺失）：
  - 段59：同篇段10 作『其陽多嬰垣之玉』，『嬰垣』为本书已见玉名，『嬰短』全书仅一见 → 升为定案。
  - 段22：与『其陰多鐵』对举者为 銅1／金2／黃金1，**『其陽多玉』从不与之对举**。
  - 段24：『又西N里，曰X』48 见，『又西北』3 见；且维基此句同时脱『曰』。
  - 段38：『人面X身』3 见、『人面而X身』2 见，参差之读反较常见。
  - 段44、段23：维基读法（常從／多白珠）全书零见。
- 影响：语料 checksum 更新（`d02f3029…`）；段落仍为 `draft`，证据层级仍为 `local_candidate`。
- 证据：`scripts/data/xishan_rulings_v1.json`、`CORPUS_AND_EDITORIAL_POLICY.md` §4.5.3。

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
| `SJ-DLOG-006` | 2026-08-18 | 记录生僻字子集字体（SJ-D014）与首版发布授权（SJ-D015） | 主负责人 | `RARE_GLYPH_FONT.md`、`RELEASE_CHECKLIST.md` |
| `SJ-DLOG-007` | 2026-08-18 | 以无背书声明取代等待外部签署（SJ-D016）；冻结四项性能预算（SJ-D017） | 主负责人 | `PERFORMANCE_BUDGETS.md` §3.1、`i18n.ts` |
| `SJ-DLOG-008` | 2026-08-18 | 分类词表入库并双语化（SJ-D018） | 主负责人 | `TAXONOMY.md` §5.0 |
| `SJ-DLOG-009` | 2026-08-18 | 裁定 X-2 并冻结《西山经》语料（SJ-D019） | 主负责人 | `XISHAN_BASELINE_OPTIONS_2026-08-18.md`、`scripts/data/xishan_corpus_v1.json` |
| `SJ-DLOG-010` | 2026-08-18 | 母图改水墨（SJ-D020）；预算重定与全量加载裁决（SJ-D021） | 主负责人 | `generated/map-variants-2026-08-18.md`、`generated/loading-model.md` |
| `SJ-DLOG-011` | 2026-08-19 | 《西山经》异文逐条裁决，11 处留为未决；增设非专家校勘免责（SJ-D022） | 主负责人 | `xishan_rulings_v1.json`、`CORPUS_AND_EDITORIAL_POLICY.md` §4.5 |
| `SJ-DLOG-012` | 2026-08-19 | 增设 `provisional` 档，未决归零（SJ-D023） | 主负责人 | `xishan_rulings_v1.json`、政策 §4.5.3 |
| `SJ-DLOG-006` | 2026-08-18 | 抽出为独立仓库并压平共享内核（SJ-D013） | 主负责人 | `MIGRATION_RECORD_2026-08-18.md` |
