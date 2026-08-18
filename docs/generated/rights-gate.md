# 《山海经 Atlas》权利闸门演练

- 生成命令：`npm run verify:rights`
- 生成时间：`2026-08-18T11:37:18.513Z`
- 数据库：`postgresql://localhost:5432/shanhaijing_atlas`
- 检查结果：`pass`（7 检查，0 错误）

每个非公开状态都在事务中真实写入、经同一事务调用 API loader、随后回滚；
因此这份报告断言的是行为，不是代码读后感。

## Findings

- [info] RIGHTS-BASELINE: published 母图正常返回:/media/shanhaijing/artistic-overview-v1.svg
- [info] RIGHTS-GATE: status=planned:未返回,闸门关闭
- [info] RIGHTS-GATE: status=blocked_missing_api_key:未返回,闸门关闭
- [info] RIGHTS-GATE: status=generated:未返回,闸门关闭
- [info] RIGHTS-GATE: status=reviewed:未返回,闸门关闭
- [info] RIGHTS-GATE: status=withdrawn:未返回,闸门关闭
- [info] RIGHTS-RESTORE: 演练后状态已复原为 published
