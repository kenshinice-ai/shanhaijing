# 《山海经 Atlas》dynamic/static parity 报告

- 生成命令：`npm run verify:parity`
- 生成时间：`2026-08-19T10:55:17.644Z`
- 动态源：`http://localhost:4100`
- 比对产物：`apps/web/dist/data`
- 检查结果：`pass`（11 检查，0 错误）

## 逐文件

| 文件 | 字节 | SHA-256 | 差异 |
|---|---|---|---|
| `works.zh-CN.json` | 912 | `a19e0bddcbe97e28…` | 0 |
| `atlas.shanhaijing.zh-CN.json` | 92355 | `e99ba6ccbe5eb8a7…` | 0 |
| `works.en.json` | 992 | `4fd5250eb362ec04…` | 0 |
| `atlas.shanhaijing.en.json` | 95673 | `73d1f7fe177ee52a…` | 0 |

## Findings

- [info] PARITY-SIZE: zh-CN：43 段落、23 概念、39 地点
- [info] PARITY-SIZE: en：43 段落、23 概念、39 地点
