# 隔离库 bootstrap 证据（2026-08-18）

- 数据库：`literary_atlas_shj_iso_20260818`（PostgreSQL 本机实例，新建后执行）
- 命令：
  1. `createdb literary_atlas_shj_iso_20260818`
  2. `DATABASE_URL=postgresql://llmacbookpro@localhost:5432/literary_atlas_shj_iso_20260818 npx tsx src/db-cli.ts bootstrap`（fresh）
  3. 同命令第二次执行（repeat）
- fresh 结果：migration `001–021` 与 seed `001–065` 全部按序装载，退出码 0。
- repeat 结果：全部条目 `already applied`，无新写入，退出码 0（幂等通过）。
- 领域验证：`SHJ_EVIDENCE_LEVEL=isolated_database npm run verify:shanhaijing` 对隔离库运行，62 检查 0 错误；机器报告见 [domain-verification.json](domain-verification.json)。
- 本轮 verifier 首跑在本地共享库发现并修正 2 个 V1 数据缺陷（鯥的拼接引文、九尾狐 surface form 不在原文），修正已回写 seed `064` 并重放。
- 隔离库仅作证据用途，验证后可删除；本文件不声称 built_static_artifact、staging 或 production 证据。
