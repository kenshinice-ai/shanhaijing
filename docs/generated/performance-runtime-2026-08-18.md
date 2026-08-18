# 运行时性能观测（首次）

- 日期：2026-08-18
- 证据层级：`built_static_artifact`（本地）+ `production`（线上）
- 配套报告：[performance-baseline.md](performance-baseline.md)（确定性部分，由 `npm run measure:performance` 生成）
- 被测产物：`main` @ `db58e57` 的 `apps/web/dist`

字节与 schema 校验可以离线复现，绘制与交互不行——它们取决于设备、网络与浏览器。
本文件记录**观测**，不是冻结预算：没有 CPU 降频档位就没有移动端结论，因此相关预算
在 `PERFORMANCE_BUDGETS.md` 中保持 `candidate`。

## 1. 桌面 · 本地静态服务（828×1217，Chromium，无网络延迟）

| 指标 | 观测值 |
|---|---|
| TTFB | 3 ms |
| load | 27 ms |
| First Contentful Paint | 80 ms |
| Largest Contentful Paint | 332 ms |
| 长任务（>50 ms） | **0** |
| 首屏请求数 | 4 |
| 解码字节 | 401 KB |
| 视图切换（艺术总览 ↔ 异兽 ↔ 路线） | 16.6 / 22.1 / 23.5 ms |
| JS 堆 | 5 MB |

蓝图候选值「地图切换 p95 < 200 ms」在此环境下有约一个数量级的余量，但这是桌面无降频的结果，
不能据此宣称移动端通过。

## 2. 生产 · 真实 Chrome 经 CDN（1357×896）

| 指标 | 观测值 |
|---|---|
| load | 945 ms |
| 首屏请求数 | 5 |
| 传输字节 | 128 KB |
| API 调用 | **0** |
| 地图标签重叠 | 0 |

## 3. 移动端 · 视口与 UA 模拟（375×812，dpr 2，touch 5）

| 指标 | 观测值 |
|---|---|
| load | 13 ms |
| 文档级横向溢出 | 无 |
| JS 堆 | 4 MB |
| FCP / LCP | `not_measured`（模拟切换后 paint 时间线不可信，不填数） |

**这不是移动端性能证据**：它只是视口与 UA 模拟，没有 CPU 降频、没有真实网络、没有真机 GPU。
移动端预算的冻结前置条件是接入设备档位与降频，属下一轮。

## 4. 已知最大杠杆

首屏 105.6 KB（brotli）里，主 JS 占 77.6 KB——**63%**。数据只占 11.8 KB。
若要继续压首屏，先看 bundle 而不是语料。
