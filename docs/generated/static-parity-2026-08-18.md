# 静态烘焙 parity 证据（2026-08-18）

- 命令：`npm run bake:static -w @literary-atlas/api -- --api http://localhost:4000 --works shanhaijing`
- 比对方式：对 `zh-CN` 与 `en` 分别取 `/api/works/shanhaijing/atlas?detail=full` 的 dynamic 响应，与烘焙出的 `atlas.shanhaijing.<locale>.json` 逐 key 做规范化 JSON 比较。
- 结果：**PASS**。两个 locale 的 `shanhaijing` 域各 8 个 key 全部逐字一致，`diffs=[]`。
- 计数（双语一致）：43 passages / 23 creatures / 24 occurrences / 39 places / 36 topology edges / 3 sections；coverage `43/43`；`artisticOverview.status = published`。
- 静态构建：`VITE_WORK_PROFILE=shanhaijing VITE_DATA_MODE=static vite build --base=./` 成功；`dist/media/shanhaijing/artistic-overview-v1.svg` 存在（82,732 bytes）；`dist/assets` 与 `dist/index.html` 中 `localhost` 引用为 0。
- 浏览器验收（dev server，`VITE_WORK_PROFILE=shanhaijing`）：
  - 总览：39 个热点节点、39 个地名标签，程序化碰撞检测 **0 处重叠**；母图以 `<image>` 形式作底层加载成功。
  - 山川路线：按三列山系分为 3 张表，行数 9 / 17 / 13。
  - 响应式：1280px 与 390px 均无文档级横向溢出；390px 下路线表在自身容器内横向滚动（视口 362 / 内容 680）。
  - console：新开标签页加载后 0 error / 0 warning。

## 已知问题（不阻断本轮，留给发布前处理）

`apps/web/public/data/` 是各 profile 共用的烘焙暂存目录，`deploy/deploy-static.sh` 未在烘焙前清空它，因此 `dist/data/` 会带上其他作品的 atlas JSON，`dist/media/` 也会带上美术史与音乐史的媒体资产（本次 `dist` 约 86MB）。这是仓库既有行为，影响所有 profile 的发布体积，不是本轮引入。发布山海经前应先决定：清空暂存目录后重新烘焙，或在部署脚本中按 profile 过滤 `data/` 与 `media/`。
