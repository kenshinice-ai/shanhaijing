# 《山海经 Atlas》交接模板

> 使用说明：每个阶段、每个协作者、每个中断点复制本模板为带日期或 revision 的交接记录，再填写真实证据。不要删除未完成项来让交接看起来完整。机器统计、覆盖量、媒体字节、rights 数量和性能结果必须引用生成报告，不得手工抄写。

- 状态：`draft` / `review_ready` / `frozen`
- 阶段：`Phase __ / Gate __`
- Gate 状态：`blocked` / `candidate` / `pass` / `waived`
- 证据层级：`local_candidate` / `isolated_database` / `built_static_artifact` / `staging` / `production`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- handoffRevision：`<stable revision or not_assigned>`
- updatedAt：`<YYYY-MM-DD>`
- currentOwner：`<name or role>`
- nextOwner：`<name or role>`
- reviewDisposition：`<blocked / pending / accepted-with-actions / accepted>`

## 1. Scope / completed

### 1.1 本次范围

- 阶段目标：
- 包含的 profile、domain、edition、section、fixture 或 release：
- 明确不包含的内容：
- 是否涉及代码、数据库、资产、部署或生产：

### 1.2 已完成

只列本次确实完成且可由下方证据复核的项目：

- [ ] `<deliverable or behavior>`：`<path/symbol/report reference>`
- [ ] `<deliverable or behavior>`：`<path/symbol/report reference>`
- [ ] `<deliverable or behavior>`：`<path/symbol/report reference>`

“文档已创建”不等于 schema、seed、API、UI、资产、测试、静态产物、staging 或 production 已完成。未实际执行的事项必须留在第 8 节。

## 2. Evidence

### 2.1 输入与版本

| 输入 | 路径/标识 | checksum/version | 状态 |
|---|---|---|---|
| blueprint | `<path>` | `<checksum or not_frozen>` | `<frozen/not_frozen>` |
| corpus/edition | `<path or edition id>` | `<checksum or not_frozen>` | `<frozen/not_frozen>` |
| schema/API contract | `<path>` | `<checksum or revision>` | `<draft/review_ready/frozen>` |
| asset/release manifest | `<path or id>` | `<checksum or not_implemented>` | `<status>` |
| repository | `<commit and dirty-worktree note>` | `<revision>` | `<status>` |

### 2.2 命令与报告

| 检查 | 命令 | 报告路径 | exit code | evidence level | 结果 |
|---|---|---|---:|---|---|
| `<check id>` | `<exact command or not_implemented>` | `<JSON/Markdown path>` | `<0/nonzero/not_run>` | `<level>` | `<pass/fail/blocked/...>` |
| `<check id>` | `<exact command or not_implemented>` | `<JSON/Markdown path>` | `<0/nonzero/not_run>` | `<level>` | `<pass/fail/blocked/...>` |

每份报告至少应能追溯命令、输入 checksum、environment、publication revision、fixture、失败项、报告 checksum 和 reviewer。没有报告路径的口头结果不能作为 release evidence。

### 2.3 证据索引

- 机器生成汇总：`<path or not_implemented>`
- coverage：`<path or not_implemented>`
- API/static parity：`<path or not_implemented>`
- asset/rights：`<path or not_implemented>`
- sound：`<path or not_implemented>`
- performance：`<path or not_implemented>`
- accessibility/browser：`<path or not_implemented>`
- staging/production smoke：`<path or not_applicable>`

证据层级必须与实际环境一致。`local_candidate` 不得写成 isolated database、built static artifact、staging 或 production。

## 3. Findings

记录自动检查和人工复核发现的事实，按阻断程度排序。不要把建议、猜测或未重现的问题写成事实。

| ID | 范围 | 事实/发现 | 严重度 | 状态 | 报告/来源 |
|---|---|---|---|---|---|
| `<finding-id>` | `<corpus/API/UI/media/...>` | `<reproducible finding>` | `<blocking/high/medium/low>` | `<open/fixed/accepted/waived>` | `<path#check-id>` |

若没有发现，写明“在声明的输入和环境下没有发现阻断项”，同时保留测试缺口和未运行项目。

## 4. Assumptions / unverified

列出本交接依赖、但尚未由证据证明的假设：

- `<assumption>`：owner `<role>`，验证方式 `<planned check>`，状态 `<unverified/blocked>`。
- `<assumption>`：owner `<role>`，验证方式 `<planned check>`，状态 `<unverified/blocked>`。
- `<assumption>`：owner `<role>`，验证方式 `<planned check>`，状态 `<unverified/blocked>`。

特别说明以下项目是否仍未验证：edition/segmentation、occurrence/concept 规则、candidate set、四轴 chronology、rights/public removal、dynamic/static parity、性能预算、a11y、staging、production。

## 5. Risks

正式风险以 [RISK_REGISTER.md](RISK_REGISTER.md) 为真源；这里仅索引与本次范围相关的条目，不重复维护另一套概率或状态。

| Risk ID | 触发器 | 当前影响 | owner | 缓解/下一检查 | 状态 |
|---|---|---|---|---|---|
| `<risk-id>` | `<trigger>` | `<impact>` | `<role>` | `<mitigation/check>` | `<open/monitoring/closed/waived>` |
| `<risk-id>` | `<trigger>` | `<impact>` | `<role>` | `<mitigation/check>` | `<open/monitoring/closed/waived>` |

任何未处置的 blocking risk 必须使 Gate 保持 `blocked`；waiver 必须有批准者、scope、理由、到期时间和 remediation。

## 6. Recommended decisions

只提出需要负责人或专家明确采纳/拒绝的决策。每项决策应链接 `DECISION_LOG.md` 的 ID；未决选择不要伪装成设计已冻结。

1. `<decision request>`：依据 `<evidence/source>`，建议 `<option>`，影响 `<scope>`，owner `<role>`。
2. `<decision request>`：依据 `<evidence/source>`，建议 `<option>`，影响 `<scope>`，owner `<role>`。
3. `<decision request>`：依据 `<evidence/source>`，建议 `<option>`，影响 `<scope>`，owner `<role>`。

明确记录：本交接是否授权进入下一 Gate。文档交接默认不授权 schema/code、资产生成、staging 或 production，除非用户/负责人另有明确授权并完成对应 release boundary。

## 7. Next steps + owner

| 顺序 | 下一动作 | owner | 前置条件 | 完成证据 | 状态 |
|---|---|---|---|---|---|
| 1 | `<action>` | `<role>` | `<dependency>` | `<report/path>` | `<pending/in_progress/blocked>` |
| 2 | `<action>` | `<role>` | `<dependency>` | `<report/path>` | `<pending/in_progress/blocked>` |
| 3 | `<action>` | `<role>` | `<dependency>` | `<report/path>` | `<pending/in_progress/blocked>` |

下一动作必须是可执行的单一责任项，不写“继续完善”。若下一 Gate 需要用户批准，明确标记为 approval dependency。

## 8. Explicit incomplete items

以下清单必须保留，即使它们不阻断本次范围：

- [ ] `<not implemented / not run / not reviewed item>`
- [ ] `<missing input, report, reviewer, or checksum>`
- [ ] `<known limitation or deferred scope>`
- [ ] `<environment not covered>`
- [ ] `<rollback, withdrawal, or release evidence still missing>`

不可用“基本完成”“少量问题”或未附报告的截图替代明确不完整项。缺失媒体可以是合法空状态，但必须区别于 rights、manifest 或发布路径不完整。

## 9. Handoff acceptance

- 输入 checksum：`<frozen/not_frozen>`
- 报告索引：`<path or not_implemented>`
- review questions：`<path or not_implemented>`
- reviewer：`<name/role or not_assigned>`
- reviewer date：`<YYYY-MM-DD or not_reviewed>`
- reviewer disposition：`<blocked/pending/accepted-with-actions/accepted>`
- handoff accepted by：`<name/role or not_accepted>`
- next owner acknowledged：`<yes/no/not_requested>`
- next action：`<single action>`
- Gate transition authorized：`<no/pending/yes with explicit authorization reference>`

交接只有在证据、未验证项、风险、owner 和下一动作完整后才可被接受。`accepted-with-actions` 不等于 Gate 通过；任何 blocking finding、缺失输入、过期 waiver、未完成专家审查或 evidence level 越级都必须保持 `blocked`。

## 10. Revision history

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `<revision>` | `<YYYY-MM-DD>` | `<change summary>` | `<role>` | `<report/decision id>` |
