# 《山海经 Atlas》dynamic/static parity 报告

- 生成命令：`npm run verify:parity`
- 生成时间：`2026-08-18T13:10:50.802Z`
- 动态源：`http://localhost:4100`
- 比对产物：`apps/web/dist/data`
- 检查结果：`pass`（11 检查，0 错误）

## 逐文件

| 文件 | 字节 | SHA-256 | 差异 |
|---|---|---|---|
| `works.zh-CN.json` | 913 | `5da86b624e8ac619…` | 0 |
| `atlas.shanhaijing.zh-CN.json` | 92356 | `339eb636ac24049e…` | 0 |
| `works.en.json` | 993 | `5999629df2c03093…` | 0 |
| `atlas.shanhaijing.en.json` | 95674 | `36ea871bafdf821a…` | 0 |

## Findings

- [info] PARITY-SIZE: zh-CN：43 段落、23 概念、39 地点
- [info] PARITY-SIZE: en：43 段落、23 概念、39 地点
