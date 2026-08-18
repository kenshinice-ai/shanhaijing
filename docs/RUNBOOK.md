# 运行手册：回滚、撤回与联系人

- 状态：`review_ready`
- 证据层级：`production`
- 最后演练：2026-08-18（回滚与前滚各一次，见 [generated/rollback-rehearsal-2026-08-18.md](generated/rollback-rehearsal-2026-08-18.md)）

## 1. 联系人

| 角色 | 负责人 | 触发条件 |
|---|---|---|
| release owner | Lee Liu ｜ lee.liu.melbourne@gmail.com | 发布授权、回滚决策 |
| rights withdrawal | 同上 | 收到权利异议、来源撤稿、许可变更 |
| 监控与告警 | 同上（Cloudflare 账号所有者） | 站点不可达、部署失败 |

**监控现状要说实话**：没有外部探针，也没有告警。站点是纯静态、零 API 调用，
可用性等同于 Cloudflare Pages 本身；当前依赖的是 Cloudflare dashboard 的部署记录与分析面板。
接入独立探针是待办，不是既成事实。

## 2. 回滚（已演练）

Cloudflare Pages 保留每个 deployment 及其**不可变**专属域名，回滚即把分支别名指回旧的产物。

```bash
# 1. 找到目标 deployment
npx wrangler pages deployment list --project-name shanhaijing-atlas

# 2. 取回该 deployment 的产物（注意 -L：/index.html 会 308 跳到 /）
OLD=https://<deployment-id>.shanhaijing-atlas.pages.dev
curl -sSL -o dist-rollback/index.html "$OLD/"          # 不是 "$OLD/index.html"
# …其余文件按 dist 结构逐个取回…

# 3. 发到目标分支（main 即生产）
npx wrangler pages deploy dist-rollback --project-name shanhaijing-atlas --branch main

# 4. 逐文件核对线上与目标产物的 SHA-256，不要只看首页能打开
```

**演练里踩到的坑**：第 2 步若不带 `-L`，`/index.html` 的 308 跳转会让 curl 存下一个
**空文件**，回滚上去的站点根文档为空——而首页仍返回 200。所以第 4 步的逐文件校验不是仪式，
是这条流程唯一能发现该故障的地方。

实测耗时：回滚 13 秒、前滚 14 秒（含上传与传播），演练在 `staging` 分支进行，未触及生产。

## 3. 资产权利撤回

```sql
UPDATE shj_artistic_overviews SET status='withdrawn' WHERE slug='<slug>';
```

- **立即生效的部分**：API 只返回 `status='published'` 的母图，撤回后下一次请求即不再返回，
  连 `assetUrl` 都不给；界面自动退回结构化替代视图。由 `npm run verify:rights` 每次 CI 演练。
- **不会自动生效的部分**：**已发布的静态产物里那份文件仍在 CDN 上可直接访问**。
  真正的撤回必须重新烘焙并部署一次不含该文件的产物，必要时在 Cloudflare 侧清缓存。
  这一步没有自动化，属人工步骤。

顺序：先改数据库状态 → 重新烘焙并部署 → 核对线上该 URL 返回 404 → 记录于 `DECISION_LOG.md`。

## 4. 发布前必过

```bash
npm test && npm run typecheck
npm run verify:domain && npm run verify:rights && npm run verify:docs
bash deploy/deploy-static.sh          # 含产物断言与 dynamic/static parity
npm run measure:performance -- --check
```

CI 在 push 与 PR 上跑同一组，所以本地跳过不会让问题溜进主干——但会让你多等一轮。
