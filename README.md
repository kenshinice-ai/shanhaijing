# 山海经 Atlas · Shanhaijing Atlas

以原文段落为根的《山海经》图集。异兽概念、文本提及、语料覆盖率、山川拓扑、学术候选与艺术演绎
分层建模、分层统计、分层呈现——任何一层都不会被另一层冒充。

- **当前范围**：《南山经》全篇三列山系，43 段已审核语料。
- **证据层级**：`local_candidate`。外部机构签署 `pending`；生产发布另需授权。
- **文档中心**：[docs/README.md](docs/README.md)；当前状态以 [docs/HANDOFF.md](docs/HANDOFF.md) 为准。

计数一律以生成报告为准，不在散文里手抄：
[domain-verification.md](docs/generated/domain-verification.md)。

## 快速开始

```bash
npm install
createdb shanhaijing_atlas
npm run db:bootstrap -w @shanhaijing/api   # 需要 DATABASE_URL
```

启动本地栈（API 4100 / Web 5180）：

```bash
cd apps/api && DATABASE_URL='postgresql://localhost:5432/shanhaijing_atlas' API_PORT=4100 npx tsx src/index.ts
```

```bash
cd apps/web && VITE_API_URL=http://localhost:4100 npx vite --port 5180
```

## 校验与生成

| 命令 | 作用 |
|---|---|
| `npm run verify:domain` | 领域校验：语料 checksum、三项独立统计、提及/拓扑/分类完整性、双语覆盖、资产权利门 |
| `npm run verify:docs` | 文档机械一致性：必备文件、链接、状态与证据枚举、治理 ID 连续性 |
| `npm run generate:overview` | 从数据库确定性重绘艺术总览 SVG 母图 |
| `npm run generate:corpus-seed` | 从冻结校核语料确定性重新产出 `db/seeds/004_nanshan_full.sql` |
| `npm run verify:parity` | dynamic 与 static 逐 key 比对，并拒绝产物里出现烘焙未产出的文件 |
| `npm run verify:rights` | 权利闸门演练：五种非公开状态在事务中真实写入，API 必须一律不返回该资产 |
| `npm run measure:performance -- --check` | 产物字节与 Zod 校验基线，越过已冻结预算即失败 |
| `npm run generate:taxonomy` | 从受控词表确定性重新产出 `db/seeds/005_taxonomy_vocabulary.sql` |
| `bash deploy/deploy-static.sh` | 烘焙 + 静态构建 + 产物断言 + parity |

两个生成器都是确定性的：同一数据库状态永远产出字节相同的结果，所以资产可以带稳定 checksum。

所有门禁在 push 与 PR 上由 GitHub Actions 跑一遍（空库装载、幂等重放、生成器确定性、
上述全部 verifier、构建与产物断言）。运行手册见 [docs/RUNBOOK.md](docs/RUNBOOK.md)。

## 三条不可让步的规则

1. **概念、提及、覆盖率分开统计。** 同一异兽多次出现、同名异物与待裁决实体，不能被一个「异兽数」掩盖。
2. **地理分三层。** 原文拓扑 ≠ 学术候选地 ≠ 现代底图；`layout_x/layout_y` 是构图坐标，
   既不是古代地望也不是经纬度，因此本项目**不使用 PostGIS**。
3. **权利与解释等级独立且 fail closed。** `rights_status`、`source_attestation`、
   `interpretation_class` 各自成列；不完整的资产不进入 public/build/CDN 路径。

## 线上

- 生产：<https://shanhaijing-atlas.pages.dev>（Cloudflare Pages 项目 `shanhaijing-atlas`，生产分支 `main`）
- 预览：<https://staging.shanhaijing-atlas.pages.dev>
- 首个版本 `v1.0.0` 的部署与 smoke 证据见
  [production-smoke-2026-08-18.md](docs/generated/production-smoke-2026-08-18.md)。
  站点是纯静态的：运行时零 API 调用，数据与母图随产物分发。

## 沿革

本项目于 2026-08-18 从多图集 monorepo 抽出为独立仓库，六项计数与全部资产 checksum 迁移前后
逐字节一致；见 [docs/MIGRATION_RECORD_2026-08-18.md](docs/MIGRATION_RECORD_2026-08-18.md)。

## 无背书声明

本图集为项目自行编纂的候选成果，**未经任何学术机构或外部专家签署**。分类、地望候选、
声音推演与艺术演绎均为本项目的编辑判断，不代表学术定论；引用时请一并注明其证据等级。
决策见 [DECISION_LOG.md](docs/DECISION_LOG.md) SJ-D016。

A PARADISE PRODUCTION · 天域文创出品
