# 《山海经 Atlas》性能基线（确定性部分）

- 生成命令：`npm run measure:performance`
- 生成时间：`2026-08-18T12:26:39.682Z`
- 环境：Node v26.7.0 · darwin/arm64 · 每项 60 次（另有 10 次预热）
- 产物：`apps/web/dist`

本报告只覆盖可离线复现的部分：产物字节与客户端必须完成的 schema 校验。
首屏绘制、长任务与交互延迟需要真实浏览器与设备档位，另行记录，不得由本表推断。

## 1. 产物体积

- 全部产物：12 个文件，592.6 KB（brotli 126.6 KB）
- 首屏必需集：490.9 KB（brotli 107.4 KB）—— assets/index-CPPWTQEV.css、assets/index-D65NlAK-.js、data/atlas.shanhaijing.zh-CN.json、index.html、media/shanhaijing/artistic-overview-v1.svg

| 文件 | 原始 | gzip | brotli |
|---|---|---|---|
| `404.html` | 1.6 KB | 0.9 KB | 0.7 KB |
| `assets/index-CPPWTQEV.css` | 22.6 KB | 5.8 KB | 5.1 KB |
| `assets/index-D65NlAK-.js` | 296.4 KB | 90.4 KB | 78.3 KB |
| `data/atlas.shanhaijing.en.json` | 93.4 KB | 17.9 KB | 13.2 KB |
| `data/atlas.shanhaijing.zh-CN.json` | 90.2 KB | 16.9 KB | 12.6 KB |
| `data/works.en.json` | 1.0 KB | 0.6 KB | 0.5 KB |
| `data/works.zh-CN.json` | 0.9 KB | 0.6 KB | 0.5 KB |
| `favicon.svg` | 0.8 KB | 0.5 KB | 0.4 KB |
| `fonts/shj-rare-han-ext-a.woff2` | 1.9 KB | 1.9 KB | 1.9 KB |
| `fonts/shj-rare-han-ext-b.woff2` | 2.1 KB | 2.1 KB | 2.1 KB |
| `index.html` | 0.9 KB | 0.6 KB | 0.4 KB |
| `media/shanhaijing/artistic-overview-v1.svg` | 80.8 KB | 14.0 KB | 11.0 KB |

## 2. 解析与校验

Zod 校验是客户端在能画出任何东西之前必须付出的代价，因此单列，不与 fetch 合并成一个数。

| locale | payload | JSON.parse p50 / p95 | Zod atlas p50 / p95 | Zod works p95 |
|---|---|---|---|---|
| zh-CN | 90.2 KB | 0.13 / 0.14 ms | 0.15 / 0.29 ms | 0 ms |
| en | 93.4 KB | 0.13 / 0.14 ms | 0.13 / 0.17 ms | 0 ms |

最差单次：zh-CN Zod 0.39 ms、en Zod 0.21 ms。
