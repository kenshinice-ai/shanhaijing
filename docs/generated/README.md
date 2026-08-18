# 机器生成报告目录

本目录只存放《山海经 Atlas》校验器、基准工具和静态构建流程生成的报告。当前处于 Gate 0 文档阶段，尚无可发布统计或验证报告。

## 规则

- 报告不得人工编辑；修正输入数据或生成器后重新生成。
- 每份报告首部必须记录生成命令、生成器版本、生成时间、输入文件及 SHA-256。
- JSON 是统计真源；Markdown 仅为同一运行的可读摘要。
- 报告必须标明证据层级：`local_candidate`、`isolated_database`、`built_static_artifact`、`staging` 或 `production`。
- 缺失、陈旧、rights 未核验和未裁决项目必须显式计数，不能从报告中静默排除。
- `HANDOFF.md` 与 coverage 文档只链接报告，不手抄易漂移统计。
- 生成器尚未实现时，不创建占位结果冒充通过记录。

## 预期报告族

| 报告 | 建议命令 | 状态 |
|---|---|---|
| document consistency | `npm run verify:shanhaijing-docs` | 已实现；只产生 `local_candidate` 机械一致性证据 |
| corpus coverage | `npm run verify:shanhaijing-corpus` | 未实现 |
| taxonomy integrity | `npm run verify:shanhaijing-taxonomy` | 未实现 |
| geography integrity | `npm run verify:shanhaijing-geography` | 未实现 |
| media and icon rights | `npm run verify:shanhaijing-media` | 未实现 |
| sound manifests | `npm run verify:shanhaijing-sound` | 未实现 |
| map performance | `npm run benchmark:shanhaijing-map` | 未实现 |
| dynamic/static parity | 待架构冻结 | 未实现 |

Gate 0 通过前，上述命令名仅为契约候选，不代表 `package.json` 已提供对应脚本。
