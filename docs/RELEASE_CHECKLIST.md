# 《山海经 Atlas》发布与证据门禁

- 状态：`review_ready`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前 Gate：`Phase 0 / Gate 0 blocked`

本清单区分五层证据。低层证据不能宣称高层完成；文档、代码或 staging 交接不自动授权 production 发布。所有结果引用机器生成报告、输入 checksum、revision、环境和 reviewer。

## 通用 release identity

- release revision：`not_assigned`
- source commit：`not_frozen`
- input checksum set：`not_frozen`
- static manifest checksum：`not_implemented`
- release owner：`R-RELEASE`
- reviewer：项目责任 reviewer matrix 已指定；外部人工签署 `pending`
- rollback reference：`not_implemented`
- authorization reference：`not_authorized`
- release disposition：`blocked`

## Evidence levels

### 1. local_candidate

用途：本地文档、代码或候选资产的可重复检查，不代表隔离数据库、静态产物或部署。

- [x] 工作区路径与 dirty-worktree 边界已记录；独立 commit/checkpoint 仍待建立。
- [ ] 输入版本和 checksum 已记录。
- [x] 文档链接、术语、枚举和状态 consistency report 通过。
- [ ] 未把候选 fixture 或本地文件写成 release artifact。
- [x] 报告路径：`docs/shanhaijing/generated/document-consistency.json`
- [ ] Gate：`blocked`，除非上升到下一层并满足前置条件。

### 2. isolated_database

用途：隔离数据库中的 migration、seed、约束和 verifier 证据。

- [x] fresh bootstrap 通过（2026-08-18，`literary_atlas_shj_iso_20260818`，migration 001–021 + seed 001–065）。
- [x] repeat bootstrap/idempotency 通过（同日，全部 already applied）。
- [ ] FK、check、enum、索引、删除和权限策略通过（插入路径已由 bootstrap 覆盖；删除/权限策略专项未测）。
- [x] corpus、occurrence/concept、taxonomy completeness 通过（`verify:shanhaijing` 62 检查 0 错误；geography candidate、chronology 维度在 V1 范围内无数据，待 Scale 阶段补专项检查）。
- [x] 报告包含数据库、命令和结果（[generated/isolated-bootstrap-2026-08-18.md](generated/isolated-bootstrap-2026-08-18.md)、[generated/domain-verification.json](generated/domain-verification.json)）。
- [x] 报告路径：`docs/shanhaijing/generated/domain-verification.json`
- [ ] Gate：`blocked`（删除/权限专项与外部签署未完成前不上升层级）。

### 3. built_static_artifact

用途：可交付的版本化静态构建及 dynamic/static parity 证据。

- [x] registry completeness 通过（`verify:shanhaijing` 196 检查 0 错误，覆盖 corpus/occurrence/concept/taxonomy/topology/双语/权利门）。
- [x] API contract、locale published-only 通过（双语 published-only 过滤已由 parity 与 verifier 覆盖）；search/detail/map partition 专项未单测。
- [x] static bake 路径完整（4 文件，`atlas.shanhaijing.{en,zh-CN}.json` + `works.*`）；分片与 manifest 在当前体量下不适用。
- [x] dynamic 与 static parity 通过（双语逐 key 零差异，见 [generated/static-parity-2026-08-18.md](generated/static-parity-2026-08-18.md)）。
- [x] media rights/provenance/interpretation 检查通过（母图为项目自绘，生成器 checksum 由 verifier 复核；无外部媒体）；audio 尚未进入范围。
- [ ] performance、a11y 和 reduced-data 报告尚未生成；browser 抽检已完成（桌面/390px 无横向溢出、39 标签零重叠、console 零错误）。
- [x] 构建报告路径：`docs/shanhaijing/generated/static-parity-2026-08-18.md`
- [x] parity 报告路径：同上
- [ ] Gate：`blocked`（性能与无障碍报告缺失；发布前还需处理 `dist/` 跨 profile 资产混入问题）。

### 4. staging

用途：目标部署环境中的候选发布、smoke、缓存和撤回验证。

- [ ] staging deployment revision 与 static manifest 一致。
- [ ] 首屏、搜索、筛选、drawer、深链、刷新、语言和地图模式 smoke 通过。
- [ ] 音频显式播放、全局单轨、rights-denied、无音频和文字替代通过。
- [ ] 390x844、768x1024、1280x800 和宽屏无溢出/重叠。
- [ ] console/server/network 无未解释错误。
- [ ] cache/precache/CDN 可达路径与 rights withdrawal 行为通过。
- [ ] soak、rollback rehearsal 和 artifact retention 记录完成。
- [ ] 报告路径：`not_implemented`
- [ ] Gate：`blocked`。

### 5. production

用途：经明确授权的线上发布与 production smoke。没有单独授权不得执行。

- [ ] production authorization：`not_authorized`
- [ ] 变更窗口和责任人：`not_assigned`
- [ ] 版本 manifest、输入 checksum 和源码 commit 已冻结。
- [ ] rollback 命令/方案已审核并演练。
- [ ] production deployment result 已记录。
- [ ] production smoke、静态资源、API/error、搜索、深链、locale、媒体 rights gate 通过。
- [ ] 监控、日志、告警和撤回联系人已登记。
- [ ] smoke 报告路径：`not_implemented`
- [ ] Gate：`blocked`。

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

- requestedBy：`not_assigned`
- approvedBy：`not_assigned`
- approvedAt：`not_assigned`
- scope：`not_authorized`
- expiry：`not_applicable`
- decision：`blocked`
- evidence index：`not_implemented`

## 修订记录

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `SJ-RELEASE-001` | 2026-08-14 | 建立五层证据发布清单 | 主负责人 | `HANDOFF.md` |
