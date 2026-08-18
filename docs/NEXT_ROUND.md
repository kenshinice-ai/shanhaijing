# v1.0.0 之后的一轮

- 状态：`review_ready`
- 日期：2026-08-18
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 上一轮：[production-smoke-2026-08-18.md](generated/production-smoke-2026-08-18.md)

v1.0.0 是带例外发布的：[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) 第 3–5 层各留了未闭合项。
本轮的主线不是加功能，是把那些例外还掉，并把只跑过一次的门禁固化成每次都会跑的东西。

## 1. 本轮范围

### 1.1 关闭发布例外

| # | 事项 | 为什么 | 完成判据 |
|---|---|---|---|
| P0-1 | 性能基线并冻结预算 | `PERFORMANCE_BUDGETS.md` 的规矩是先测基线再冻结，目前一个数未测；蓝图里的 p95 阈值全是 `candidate` | 确定性部分（bundle/payload 字节、gzip/brotli、Zod parse p95）由脚本产出；运行时指标记录测量方法与环境；报告落 `generated/` |
| P0-2 | 无障碍与 reduced-data 报告 | 计划命令 `verify:shanhaijing-accessibility` 从未实现；39 个地图热点的键盘可达性未验；SJ-R016 的缓解措施依赖它 | axe 审计双语零 critical/serious；键盘可遍历热点与抽屉；`prefers-reduced-motion` 实装并验证 |
| P0-3 | rollback 演练与联系人登记 | SJ-R015 把"无回滚证据的发布"列为 critical；命令写了但没演练过 | 在 preview 分支实测一次回滚并复原；生产回滚命令逐字记录；监控与撤回联系人登记 |
| P0-4 | 768×1024 与 rights withdrawal | 清单第 4 层剩下的两个未测项 | 768 宽下无溢出/重叠；撤回资产权利后 API 与烘焙产物 fail closed |

### 1.2 固化门禁

| # | 事项 | 为什么 | 完成判据 |
|---|---|---|---|
| P1-5 | GitHub Actions CI | 所有门禁目前只在本地手跑；没有它，修好的缺陷随时被下次改动推翻 | push 与 PR 上跑 bootstrap → verify:domain → verify:docs → typecheck → test → bake → parity，全绿才合并 |
| P1-6 | parity 脚本化 | 首版的 parity 是临时脚本，跑完即弃；SJ-R013 是 critical | `npm run verify:parity` 出机器报告并进 CI |
| P1-7 | soft 404 与英文标签重叠 | 未命中路径返回 200 + 整个应用，对爬虫是 soft 404；英文地图剩 2 对擦边重叠 | 未命中路径返回 404；双语标签重叠为 0 |
| P1-8 | LICENSE 与仓库元信息 | 公开仓库无 LICENSE，GitHub description/topics 为空；代码、语料与母图的授权口径不同，必须分开写 | 仓库根有 LICENSE 并区分三类；GitHub 元信息填好 |

### 1.3 产品缺口

| # | 事项 | 为什么 | 完成判据 |
|---|---|---|---|
| P2-9 | taxonomy 词表双语化 | `TAXONOMY.md` §8 要求双语与 term 定义，实现里只存裸 slug，中文界面显示 `behavior / man eating`；属 SJ-R005 | term 词表入库并带定义与双语；API 返回本地化标签；verifier 对缺翻译的 term fail closed |
| P2-10 | 覆盖矩阵订正 | 仍写"Phase 0 / Gate 0"与"尚无冻结语料"，而已有 43 段冻结语料 | 与现状一致，且统计区仍由生成报告供数、不手抄 |
| — | 免责声明（原 14） | 外部机构签署（SJ-D012）不再等待，改为在站点上明说其不存在 | 双语免责声明常驻界面；决策记 SJ-D016；清单相应条目从"等待签署"改为"已披露无签署" |

## 2. 本轮不做，但已裁决

**P2-11 语料扩量（Phase 2）**：暂缓，且**不是因为工作量**。蓝图 Phase 2 的停止条件之一是"覆盖统计不能重现"——
在 P1-5/P1-6 落地前扩量，等于在没有回归网的情况下改动语料基线。更关键的是下一批选哪一篇属于编辑决策
（西山经全篇 vs 先把南山经的媒体与图像层补厚），需要先定底本与 segmentation 再动代码。
**建议顺序**：本轮完成后先做一次编辑决策会，再开 Phase 2。

**P2-12 其余计划 verifier**（`verify:shanhaijing-{taxonomy,geography,media,sound,registry,api}`）：**不一次性铺开**。
理由是这些 verifier 的价值来自它们守护的数据，而 geography candidate、media、sound 三类当前都没有数据——
现在写出来只会得到六个恒真的检查，反而稀释门禁的可信度。
**建议规则**：哪一类数据首次入库，同一批就补它的 verifier；本轮只按 P2-9 的需要补 taxonomy 一项。

## 3. 已在别处完成

**原 13 旧仓库收尾**：已在「The Bible Atlas」侧执行——该仓库新增 `db/migrations/023_retire_shanhaijing_domain.sql`
退役领域表，`docs/shanhaijing/` 与领域源码已移除，仅余历史构建产物。本仓库无需再跟进。

## 4. 修订记录

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `SJ-NEXT-001` | 2026-08-18 | 建立 v1.0.0 之后一轮的范围与裁决 | 主负责人 | `RELEASE_CHECKLIST.md`、`generated/production-smoke-2026-08-18.md` |
