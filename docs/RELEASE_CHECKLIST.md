# 《山海经 Atlas》发布与证据门禁

- 状态：`review_ready`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前 Gate：`v1.0.1 已发布；第 1、2、4 层 passed，第 3、5 层各余一项明确跳过项`

本清单区分五层证据。低层证据不能宣称高层完成；文档、代码或 staging 交接不自动授权 production 发布。所有结果引用机器生成报告、输入 checksum、revision、环境和 reviewer。

## 通用 release identity

- release revision：`v1.0.0`
- source commit：见 tag `v1.0.0`
- input checksum set：语料 edition `824c1e36…4dc0a6a3`、母图 `b6b4baa1…d2950cece1`、
  子集字体 `831bffe3…9ea75a13` / `b1559655…96d1ae4e`
- static manifest checksum：`not_implemented`
- release owner：`R-RELEASE`
- reviewer：项目责任 reviewer matrix 已指定；外部机构签署 `pending`，按 SJ-D016 以常驻无背书声明披露，不再阻断发布
- rollback reference：[RUNBOOK.md](RUNBOOK.md) §2，已于 2026-08-18 演练
- authorization reference：SJ-D015（2026-08-18，用户在验证通过后授权首版发布）
- release disposition：`authorized`

## Evidence levels

### 1. local_candidate

用途：本地文档、代码或候选资产的可重复检查，不代表隔离数据库、静态产物或部署。

- [x] 独立仓库与 commit 边界已建立（`kenshinice-ai/shanhaijing`，默认分支 `main`）。
- [x] 输入版本和 checksum 已记录（语料 edition `824c1e36…4dc0a6a3`、母图 `b6b4baa1…d2950cece1`、
  生僻字子集两枚 woff2 见 [RARE_GLYPH_FONT.md](RARE_GLYPH_FONT.md)）。
- [x] 文档链接、术语、枚举和状态 consistency report 通过（276 检查 0 错误）。
- [x] 未把候选 fixture 或本地文件写成 release artifact。
- [x] 报告路径：`docs/generated/document-consistency.json`
- [x] Gate：`passed`。

### 2. isolated_database

用途：隔离数据库中的 migration、seed、约束和 verifier 证据。

- [x] fresh bootstrap 通过（2026-08-18，独立库 `shj_verify_20260818` 现建现删，migration 001–002 + seed 001–004）。
- [x] repeat bootstrap/idempotency 通过（同日同库，全部 already applied）。
- [x] FK、check、enum、唯一约束、级联删除与权限策略**已专项演练**（[generated/constraints-drill.md](generated/constraints-drill.md)）：
  八类违规写入逐条被数据库拒绝并记录 SQLSTATE；级联删除无孤儿；API 读路径在仅授予 SELECT 的角色下正常返回，写入被拒。
- [x] 资产权利闸门 fail closed 已由 `npm run verify:rights` 在事务中演练并进入 CI。
- [x] corpus、occurrence/concept、taxonomy completeness 通过（`verify:domain` 196 检查 0 错误；geography candidate、chronology 维度在 V1 范围内无数据，待 Scale 阶段补专项检查）。
- [x] 报告包含数据库、命令和结果（[generated/isolated-bootstrap-2026-08-18.md](generated/isolated-bootstrap-2026-08-18.md)、[generated/domain-verification.json](generated/domain-verification.json)）。
- [x] 报告路径：`docs/generated/domain-verification.json`
- [x] Gate：`passed`。

### 3. built_static_artifact

用途：可交付的版本化静态构建及 dynamic/static parity 证据。

- [x] registry completeness 通过（`verify:domain` 196 检查 0 错误，覆盖 corpus/occurrence/concept/taxonomy/topology/双语/权利门）。
- [x] API contract、locale published-only 通过（双语 published-only 过滤已由 parity 与 verifier 覆盖）；search/detail/map partition 专项未单测。
- [x] static bake 路径完整（4 文件，`atlas.shanhaijing.{en,zh-CN}.json` + `works.*`）；分片与 manifest 在当前体量下不适用。
- [x] dynamic 与 static parity 通过（双语逐 key 零差异，见 [generated/static-parity-2026-08-18.md](generated/static-parity-2026-08-18.md)）。
- [x] media rights/provenance/interpretation 检查通过（母图为项目自绘，生成器 checksum 由 verifier 复核；无外部媒体）；audio 尚未进入范围。
- [x] 单元测试通过（根级 `npm test`：API 契约 10 项、地图标签几何 14 项）。
- [x] performance 基线已生成并冻结四项预算（[generated/performance-baseline.md](generated/performance-baseline.md)、
  `PERFORMANCE_BUDGETS.md` §3.1）；运行时观测见
  [generated/performance-runtime-2026-08-18.md](generated/performance-runtime-2026-08-18.md)。
- [x] a11y 与 reduced-data 报告已生成（[generated/accessibility-2026-08-18.md](generated/accessibility-2026-08-18.md)）：
  axe serious/critical 归零（修复 2 处真实缺陷）、键盘全流程可用、11 组对比度达标、reduced-data 实装。
- [x] browser 抽检：桌面/390px 无文档级横向溢出、地图标签重叠中文 0 英文 1（2×2 px）、console 零输出、
  扩展 A/B 区八个生僻字全部成字。
- [x] `dist/` 跨 profile 资产混入问题已解决：烘焙前清空暂存目录，产物断言 `dist/data` 只含本图集数据，
  且产物中不含 Markdown。728 KB / 11 文件。
- [x] 构建报告路径：`docs/generated/static-parity-2026-08-18.md`
- [x] parity 报告路径：同上
- [x] 200% 缩放已复核（640×512 等效视口：无溢出、标签 0 重叠）；forced-colors 已实装——但**未在真实高对比环境实测**。
- [ ] Gate：`passed-with-exceptions`——两项**明确跳过**并记录理由：屏幕阅读器实机走查需人耳判断，不作机器门禁；移动端性能预算待真机降频档位。见 [generated/accessibility-2026-08-18.md](generated/accessibility-2026-08-18.md) §6.4。

### 4. staging

用途：目标部署环境中的候选发布、smoke、缓存和撤回验证。

- [x] staging deployment revision 与产物一致（`staging` 分支 deployment `bd62a8dc`，11/11 文件 SHA-256 与本地 `dist` 相同）。
- [x] 首屏、搜索、筛选、drawer、深链、刷新、语言和地图模式 smoke 通过（同一批字节的本地产物全项实测；
  线上复测首屏、深链刷新、生僻字与地图标签）。
- [ ] 音频：`not_applicable`，V1 无音频资产。
- [x] 390x844、768x1024 与 1280x800 均无文档级横向溢出；768 宽下地图标签重叠 0 处。
- [x] console/network 无未解释错误；线上 0 次 API 调用。
- [x] CDN 可达路径与 Content-Type 通过；rights withdrawal 行为**已演练**——五种非公开状态在事务中真实写入后，API 一律不返回母图（含 assetUrl），见 [generated/rights-gate.md](generated/rights-gate.md)。演练首跑即抓出闸门 fail open 并已修复。
- [x] rollback rehearsal 已完成并记录；artifact 保留期由 Cloudflare 逐 deployment 保存（v1.0.0 产物 11 文件仍可取回）。
- [x] soak：客户端 162 轮约 970 次交互，0 运行时错误，结束堆低于起始堆（无泄漏）；
  **源站长时 soak 判定不适用**——无自有源站、运行时零 API 调用，可压的只有 Cloudflare 边缘。
- [x] 报告路径：`docs/generated/production-smoke-2026-08-18.md`
- [x] Gate：`passed`。CDN 缓存清除**按设计不需要**：资源全部内容指纹化、`index.html` 为 `max-age=0, must-revalidate`，回滚演练实测传播 ≤ 14 秒。

### 5. production

用途：经明确授权的线上发布与 production smoke。没有单独授权不得执行。

- [x] production authorization：SJ-D015（2026-08-18）
- [x] 变更窗口和责任人：2026-08-18，主负责人
- [x] 版本 manifest、输入 checksum 和源码 commit 已冻结（tag `v1.0.0` → `c20af77`；`v1.0.1` → `9056e61`）。
- [x] rollback 已演练并留下记录（[generated/rollback-rehearsal-2026-08-18.md](generated/rollback-rehearsal-2026-08-18.md)）：
  回滚 13 秒、前滚 14 秒，逐文件校验；演练当场发现并修正了一处会导致「空白站点 + 200」的流程缺陷。步骤见 [RUNBOOK.md](RUNBOOK.md)。
- [x] production deployment result 已记录（v1.0.0 `a7597129` → v1.0.1 `47d555f9`，<https://shanhaijing-atlas.pages.dev>）。
- [x] production smoke、静态资源、深链、locale、媒体 rights gate 通过；API/error 路径不适用（纯静态，0 API 调用）。
- [x] 撤回与发布联系人已登记（[RUNBOOK.md](RUNBOOK.md) §1）。
- [x] 监控与告警已接入：`.github/workflows/uptime.yml` 每 6 小时探测生产站点（首页 200、内容确为本图集、数据载荷非空、无背书声明仍在产物、未命中路径仍 404），失败即通知仓库所有者。粒度限制写在 [RUNBOOK.md](RUNBOOK.md) §1。
- [x] smoke 报告路径：`docs/generated/production-smoke-2026-08-18.md`
- [ ] Gate：`passed-with-exceptions`——唯一未闭合项是移动端性能预算（待真机档位）；其余已闭合或明确判定不适用。

## Stop conditions

任一项成立时保持 `blocked`：

- 输入 edition、passage segmentation、checksum 或 release revision 未冻结；
- occurrence 无 passage，归并/拆分无 editorial decision；
- 三层地理或四轴 chronology 在数据/API/UI 中混用；
- rights、provenance、interpretation、alt 或 checksum 缺失；
- dynamic/static parity、registry completeness、coverage 或撤回检查失败；
- 专家 review 仍有 blocking 问题或 waiver 过期（外部机构签署的缺失本身不再是 stop condition，前提是无背书声明在产物中，见 SJ-D016）；
- 性能、a11y、浏览器或 reduced mode 超预算且无书面批准；
- staging/production 证据被低层报告替代；
- 没有明确的发布授权、rollback 和 version manifest。

## Release approval record

- requestedBy：项目主负责人
- approvedBy：用户（仓库所有者）
- approvedAt：2026-08-18
- scope：首个公开版本 v1.0.0，静态站点发布至 Cloudflare Pages 项目 `shanhaijing-atlas`；
  不含对外宣称机构或专家背书（SJ-D012 仍 `pending`）
- expiry：`not_applicable`
- decision：`authorized`
- evidence index：`docs/generated/`（domain-verification、document-consistency、static-parity）

## 修订记录

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `SJ-RELEASE-001` | 2026-08-14 | 建立五层证据发布清单 | 主负责人 | `HANDOFF.md` |
| `SJ-RELEASE-002` | 2026-08-18 | 迁出独立仓库后订正报告路径与库名；登记首版发布授权（SJ-D015） | 主负责人 | `MIGRATION_RECORD_2026-08-18.md`、`DECISION_LOG.md` |
