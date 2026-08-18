# 《山海经 Atlas》发布与证据门禁

- 状态：`review_ready`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前 Gate：`v1.0.0 已发布至 production；例外项见第 3–5 层`

本清单区分五层证据。低层证据不能宣称高层完成；文档、代码或 staging 交接不自动授权 production 发布。所有结果引用机器生成报告、输入 checksum、revision、环境和 reviewer。

## 通用 release identity

- release revision：`v1.0.0`
- source commit：见 tag `v1.0.0`
- input checksum set：语料 edition `824c1e36…4dc0a6a3`、母图 `6e6b4eee…d1d89b5b3`、
  子集字体 `831bffe3…9ea75a13` / `b1559655…96d1ae4e`
- static manifest checksum：`not_implemented`
- release owner：`R-RELEASE`
- reviewer：项目责任 reviewer matrix 已指定；外部机构签署 `pending`
- rollback reference：Cloudflare Pages 保留历史 deployment，回滚为重新指向上一个 deployment
- authorization reference：SJ-D015（2026-08-18，用户在验证通过后授权首版发布）
- release disposition：`authorized`

## Evidence levels

### 1. local_candidate

用途：本地文档、代码或候选资产的可重复检查，不代表隔离数据库、静态产物或部署。

- [x] 独立仓库与 commit 边界已建立（`kenshinice-ai/shanhaijing`，默认分支 `main`）。
- [x] 输入版本和 checksum 已记录（语料 edition `824c1e36…4dc0a6a3`、母图 `6e6b4eee…d1d89b5b3`、
  生僻字子集两枚 woff2 见 [RARE_GLYPH_FONT.md](RARE_GLYPH_FONT.md)）。
- [x] 文档链接、术语、枚举和状态 consistency report 通过（276 检查 0 错误）。
- [x] 未把候选 fixture 或本地文件写成 release artifact。
- [x] 报告路径：`docs/generated/document-consistency.json`
- [x] Gate：`passed`。

### 2. isolated_database

用途：隔离数据库中的 migration、seed、约束和 verifier 证据。

- [x] fresh bootstrap 通过（2026-08-18，独立库 `shj_verify_20260818` 现建现删，migration 001–002 + seed 001–004）。
- [x] repeat bootstrap/idempotency 通过（同日同库，全部 already applied）。
- [ ] FK、check、enum、索引、删除和权限策略通过（插入路径已由 bootstrap 覆盖；删除/权限策略专项未测）。
- [x] corpus、occurrence/concept、taxonomy completeness 通过（`verify:domain` 196 检查 0 错误；geography candidate、chronology 维度在 V1 范围内无数据，待 Scale 阶段补专项检查）。
- [x] 报告包含数据库、命令和结果（[generated/isolated-bootstrap-2026-08-18.md](generated/isolated-bootstrap-2026-08-18.md)、[generated/domain-verification.json](generated/domain-verification.json)）。
- [x] 报告路径：`docs/generated/domain-verification.json`
- [ ] Gate：`passed-with-exceptions`（删除/权限专项未测；外部机构签署仍 `pending`）。

### 3. built_static_artifact

用途：可交付的版本化静态构建及 dynamic/static parity 证据。

- [x] registry completeness 通过（`verify:domain` 196 检查 0 错误，覆盖 corpus/occurrence/concept/taxonomy/topology/双语/权利门）。
- [x] API contract、locale published-only 通过（双语 published-only 过滤已由 parity 与 verifier 覆盖）；search/detail/map partition 专项未单测。
- [x] static bake 路径完整（4 文件，`atlas.shanhaijing.{en,zh-CN}.json` + `works.*`）；分片与 manifest 在当前体量下不适用。
- [x] dynamic 与 static parity 通过（双语逐 key 零差异，见 [generated/static-parity-2026-08-18.md](generated/static-parity-2026-08-18.md)）。
- [x] media rights/provenance/interpretation 检查通过（母图为项目自绘，生成器 checksum 由 verifier 复核；无外部媒体）；audio 尚未进入范围。
- [x] 单元测试通过（根级 `npm test`：API 契约 10 项、地图标签几何 14 项）。
- [ ] performance、a11y 和 reduced-data 报告尚未生成；browser 抽检已完成（桌面/390px 无文档级横向溢出、
  地图标签重叠中文 0 处英文 2 处、console 零输出、扩展 A/B 区八个生僻字全部成字）。
- [x] `dist/` 跨 profile 资产混入问题已解决：烘焙前清空暂存目录，产物断言 `dist/data` 只含本图集数据，
  且产物中不含 Markdown。728 KB / 11 文件。
- [x] 构建报告路径：`docs/generated/static-parity-2026-08-18.md`
- [x] parity 报告路径：同上
- [ ] Gate：`passed-with-exceptions`（性能与无障碍报告仍缺失，按 SJ-D015 以书面授权放行首版）。

### 4. staging

用途：目标部署环境中的候选发布、smoke、缓存和撤回验证。

- [x] staging deployment revision 与产物一致（`staging` 分支 deployment `bd62a8dc`，11/11 文件 SHA-256 与本地 `dist` 相同）。
- [x] 首屏、搜索、筛选、drawer、深链、刷新、语言和地图模式 smoke 通过（同一批字节的本地产物全项实测；
  线上复测首屏、深链刷新、生僻字与地图标签）。
- [ ] 音频：`not_applicable`，V1 无音频资产。
- [x] 390x844 与 1280x800 无文档级横向溢出；768x1024 未单独抽检。
- [x] console/network 无未解释错误；线上 0 次 API 调用。
- [x] CDN 可达路径与 Content-Type 通过；rights withdrawal 行为未测。
- [ ] soak、rollback rehearsal 和 artifact retention 记录未完成。
- [x] 报告路径：`docs/generated/production-smoke-2026-08-18.md`
- [ ] Gate：`passed-with-exceptions`（rollback 未演练；768px 与 rights withdrawal 未测）。

### 5. production

用途：经明确授权的线上发布与 production smoke。没有单独授权不得执行。

- [x] production authorization：SJ-D015（2026-08-18）
- [x] 变更窗口和责任人：2026-08-18，主负责人
- [x] 版本 manifest、输入 checksum 和源码 commit 已冻结（tag `v1.0.0` → `c20af77`）。
- [ ] rollback 方案已记录但**未演练**（Cloudflare Pages 保留历史 deployment，回滚为重新指向上一个）。
- [x] production deployment result 已记录（deployment `a7597129`，<https://shanhaijing-atlas.pages.dev>）。
- [x] production smoke、静态资源、深链、locale、媒体 rights gate 通过；API/error 路径不适用（纯静态，0 API 调用）。
- [ ] 监控、日志、告警和撤回联系人未登记。
- [x] smoke 报告路径：`docs/generated/production-smoke-2026-08-18.md`
- [ ] Gate：`passed-with-exceptions`（rollback 未演练；监控与撤回联系人未登记）。

## Stop conditions

任一项成立时保持 `blocked`：

- 输入 edition、passage segmentation、checksum 或 release revision 未冻结；
- occurrence 无 passage，归并/拆分无 editorial decision；
- 三层地理或四轴 chronology 在数据/API/UI 中混用；
- rights、provenance、interpretation、alt 或 checksum 缺失；
- dynamic/static parity、registry completeness、coverage 或撤回检查失败；
- 专家 review 仍有 blocking 问题或 waiver 过期；
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
