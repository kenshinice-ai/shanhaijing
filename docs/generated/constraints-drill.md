# 《山海经 Atlas》删除、约束与权限演练

- 生成命令：`npm run verify:constraints`
- 生成时间：`2026-08-19T10:53:40.556Z`
- 数据库：`postgresql://localhost:5432/shanhaijing_atlas`
- 检查结果：`pass`（12 检查，0 错误）

bootstrap 只证明写得进去，证明不了写不进去的东西真的写不进去。
以下每一条都在事务中真实执行一次，由数据库拒绝，然后回滚。

## Findings

- [info] DELETE-CASCADE: 删除 aoyin 级联清除 1 条提及、3 条分类指派，无孤儿
- [info] CONSTRAINT-FK: 指派引用词表外的词条：已拒绝（SQLSTATE 23503）
- [info] CONSTRAINT-CHECK: 非法 review_status：已拒绝（SQLSTATE 23514）
- [info] CONSTRAINT-CHECK: 母图 status 为 published 却无 asset_url：已拒绝（SQLSTATE 23514）
- [info] CONSTRAINT-CHECK: 非法 slug 形态：已拒绝（SQLSTATE 23514）
- [info] CONSTRAINT-CHECK: 空的双语标签：已拒绝（SQLSTATE 23514）
- [info] CONSTRAINT-UNIQUE: 同一轴下重复词条：已拒绝（SQLSTATE 23505）
- [info] CONSTRAINT-ENUM: 枚举外的 locale：已拒绝（SQLSTATE 22P02）
- [info] CONSTRAINT-FK: 指向不存在作品的异兽：已拒绝（SQLSTATE 23503）
- [info] PRIVILEGE-READONLY: 只读角色下 API loader 正常返回（43 段落、23 概念）——读路径不需要写权限
- [info] PRIVILEGE-READONLY: 只读角色的写入已被拒绝
- [info] DRILL-RESTORE: 演练未留下任何角色或数据变更
