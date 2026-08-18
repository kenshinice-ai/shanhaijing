# 《山海经 Atlas》领域验证报告

- 生成命令：`npm run verify:domain`
- 生成时间：`2026-08-18T23:32:57.263Z`
- 数据库：`shanhaijing_atlas`（PostgreSQL 18.6 (Homebrew)）
- 证据层级：`local_candidate`
- 检查结果：`pass`（286 检查，0 错误）

## 三项独立统计

- unique creature concepts：23
- textual occurrences：24
- corpus coverage：43/125

## Findings

- [info] edition-scope: 底本范围：nanshan（1 个版本）、xishan（1 个版本）
- [info] TAXONOMY-VOCABULARY: 分类词表：7 轴、44 词条，覆盖 44 组已发布指派
- [info] COVERAGE-MATRIX: 覆盖矩阵统计区已更新：7 个山系
- [info] corpus-frozen-unreviewed: xishan：82/82 段已冻结但未审核（不进 API、不计入覆盖率）
