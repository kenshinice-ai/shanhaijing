# v1.0.0 部署与 smoke 记录

- 日期：2026-08-18
- 证据层级：`staging` + `production`
- 授权：SJ-D015（`RELEASE_CHECKLIST.md` release approval record）
- 源码：`main` @ `c20af77`，tag `v1.0.0`，仓库 <https://github.com/kenshinice-ai/shanhaijing>
- 托管：Cloudflare Pages 项目 `shanhaijing-atlas`（账号 `64e816c4…b76132`，生产分支 `main`）

## 部署

| 环境 | 分支 | Deployment | URL |
|---|---|---|---|
| preview | `staging` | `bd62a8dc` | <https://staging.shanhaijing-atlas.pages.dev> |
| production | `main` | `a7597129-49f6-4667-a514-c208b53c39f5` | <https://shanhaijing-atlas.pages.dev> |

先发 preview 分支做产物比对，通过后再发生产；两次上传的是同一批 11 个文件（第二次 0 新文件，
全部命中已上传内容），因此生产与 staging 在字节层面同源。

## 产物完整性

线上逐文件取回后与本地 `apps/web/dist` 计算 SHA-256 比对，**11/11 全部一致**：

```
/ (index.html)  639a279d99227262b981f16d9476975210681b04ff5f2303a171fd9e82837345
/assets/index-CPrlIziD.js        /assets/index-K4dRpTAB.css
/data/atlas.shanhaijing.{zh-CN,en}.json   /data/works.{zh-CN,en}.json
/fonts/shj-rare-han-ext-{a,b}.woff2
/media/shanhaijing/artistic-overview-v1.svg   /favicon.svg
```

Content-Type 正确（`application/json`、`font/woff2`、`image/svg+xml`）。

## 生产 smoke（真实 Chrome，1357×896）

| 项 | 结果 |
|---|---|
| 首屏渲染与四项计数 | 43/43、23、24、39，与 verifier 报告一致 |
| API 调用 | **0**——只请求自身 `/assets` `/data` `/media` `/fonts` |
| 首屏资源 | 5 个请求，128 KB 传输，`load` 945 ms |
| 地图标签重叠（中文·艺术总览） | **0** 对 |
| 文档级横向溢出 | 无 |
| 深链 `?tab=creatures&entity=…` 刷新恢复 | 通过 |
| 生僻字 | 两枚子集从 CDN 取回，扩展 A/B 区八字 `document.fonts.check` 全 true；`𪁺𩿧`、`䍺` 卡片成字 |

`/index.html` 会 308 跳到 `/`（Pages 行为）。未命中的路径返回 200 并渲染应用（Pages 的 SPA 回退），
本应用以查询参数寻址、无深层路径，功能上无碍，但对搜索引擎是 soft 404，记为后续项。

## 未覆盖

性能基准、无障碍与 reduced-data 报告仍未生成；rollback 未演练（Pages 保留历史 deployment，
回滚为在 dashboard 重新指向上一个 deployment）；监控、告警与撤回联系人未登记；外部机构签署仍 `pending`。
