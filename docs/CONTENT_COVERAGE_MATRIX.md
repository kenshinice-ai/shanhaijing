# 《山海经 Atlas》内容覆盖矩阵

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 统计状态：尚无冻结语料，禁止填写或推断全书总数

## 1. 用途

本文件定义 coverage 报告的口径、矩阵结构和机器生成区。它不保存手工维护的完成数字。底本、section tree 和 passage segmentation 冻结后，校验器从结构化数据生成 JSON 真源与本页统计区。

覆盖率必须回答三个不同问题：

1. `unique creature concepts`：归并后的独立概念数；
2. `textual occurrences`：逐次文本提及数；
3. `corpus coverage`：已审核 passage 数 / 冻结 passage 总数。

三者禁止相加、互相替代或合并为“异兽数”。

## 2. 当前 Gate 0 状态

| 输入 | 状态 | 阻断原因 |
|---|---|---|
| baseline edition | `blocked` | 尚未由古籍专家冻结 |
| section hierarchy | `blocked` | 依赖 baseline edition |
| passage segmentation | `blocked` | 规则与 reviewer 未冻结 |
| occurrence inclusion policy | `draft` | 见 `CORPUS_AND_EDITORIAL_POLICY.md` |
| concept merge/split policy | `draft` | 尚未以 Pilot 演练 |
| Pilot scope | `blocked` | 篇章或山系尚未批准 |
| coverage verifier | `not_implemented` | Gate 0 后实现 |
| generated counts | `unavailable` | 不存在合法输入 |

## 3. 覆盖矩阵字段

每个冻结 section 至少生成以下字段：

| 字段 | 含义 |
|---|---|
| `edition_slug` | baseline edition 稳定标识 |
| `segmentation_version` | passage 切分规则版本 |
| `section_reference` | 稳定篇章/序列 reference |
| `section_title_zh` | 已审核中文标题 |
| `section_title_en` | 已发布英文标题；无则为空 |
| `passages_total` | 冻结 passage 总数 |
| `passages_reviewed` | 已完成 occurrence audit 的 passage 数 |
| `passages_pending` | 尚未完成审核的 passage 数 |
| `audit_included` | 至少有 included occurrence 的 passage 数 |
| `audit_excluded` | 含已记录 excluded 候选的 passage 数 |
| `audit_pending_review` | 含待裁决候选的 passage 数 |
| `creature_occurrences` | included creature occurrence 数 |
| `creature_concepts_referenced` | 本 section 引用的去重 concept 数 |
| `unresolved_occurrences` | 尚未归入已决 concept 的 occurrence 数 |
| `topology_occurrences` | 有有效 textual topology linkage 的 occurrence 数 |
| `candidate_places` | 有至少一个学术候选的 textual place 数 |
| `published_zh` | 中文 published translation/summary 覆盖数 |
| `published_en` | 英文 published translation/summary 覆盖数 |
| `media_linked` | 有可用图像的 concept/occurrence 数，口径必须随报告声明 |
| `icon_linked` | 有可用地图 icon 的 concept 数 |
| `sound_linked` | 有可发布声音的 concept/occurrence 数 |
| `rights_pending` | 关联资产中 rights 非 verified 数 |
| `updated_at` | 输入数据最后更新时间 |

媒体、图标和声音不得合并为一个 coverage 字段。每个计数都必须在 JSON schema 中写清分母与去重键。

## 4. 人工维护的篇章登记区

本区只登记冻结状态和 owner，不登记统计数字。具体篇章清单待 baseline edition 冻结后，由结构化 inventory 生成并替换。

| section / range | edition | owner | inventory status | review status | notes |
|---|---|---|---|---|---|
| 待冻结 | 待冻结 | 待指定 | `blocked` | `blocked` | 不推断篇章总数 |

## 5. 机器生成统计区

以下标记之间的内容只能由 coverage verifier 重写。当前无合法输入，因此保持明确的未生成状态。

<!-- SHANHAIJING_COVERAGE:BEGIN -->

> 未生成。baseline edition、segmentation version 与 Pilot scope 尚未冻结；`verify:shanhaijing-corpus` 尚未实现。

<!-- SHANHAIJING_COVERAGE:END -->

## 6. JSON 真源契约

建议输出路径：

```text
docs/shanhaijing/generated/corpus-coverage.json
docs/shanhaijing/generated/corpus-coverage.md
```

JSON 顶层至少包含：

```json
{
  "schema_version": "pending",
  "evidence_level": "local_candidate",
  "generated_at": null,
  "command": "npm run verify:shanhaijing-corpus",
  "generator_version": "not_implemented",
  "inputs": [],
  "edition": null,
  "segmentation_version": null,
  "summary": null,
  "sections": [],
  "gaps": [],
  "errors": ["Gate 0 inputs are not frozen"]
}
```

此代码块仅定义形状，不是生成报告，也不得复制为实际结果。

每个 `inputs` 项必须含路径、角色和 SHA-256。真实报告必须有确定的 `generated_at`、生成器版本及所有计数，且 Markdown 摘要与 JSON 来自同一次运行。

## 7. 计算规则

### 7.1 Passage coverage

```text
corpus_coverage = passages_reviewed / passages_total
```

- 分母只取冻结 edition 与 segmentation version 的 passage。
- `reviewed` 表示该 passage 已完成疑似提及审计，而不是仅录入文本。
- 含 `pending_review` 候选的 passage 可以算已审计，但 pending 数量必须独立公开。
- 分母为零时报告错误，不显示 100%。

### 7.2 Occurrence count

- 以稳定 occurrence ID 去重。
- 同一 concept 在不同 passage 的提及分别计数。
- 同一 passage 中可区分的多次提及按冻结规则计数。
- excluded 候选不进入 included occurrence 数，但单独报告。
- unresolved included occurrence 仍进入 occurrence 数，并单独报告 unresolved。

### 7.3 Concept count

- 只计算当前有效、非 superseded 的 concept ID。
- unresolved bucket 不伪装成一个正常 concept；其 occurrence 单独报告。
- merge/split 后必须依据 editorial decision 重算，不能手调数字。

### 7.4 附加 coverage

每项必须声明：对象、分母、去重键、published/verified 条件和空值处理。例如媒体 coverage 不得把 rights pending 的 bundled asset 算作可发布媒体。

## 8. 完整性断言

校验器至少检查：

- 每个冻结 passage 恰有一个 audit 状态；
- 每个疑似提及为 included、excluded 或 pending_review；
- included occurrence 有 passage 和范围；
- excluded 候选有理由；
- concept merge/split 有 editorial decision；
- section 汇总与全局汇总一致；
- JSON 与 Markdown checksum/运行标识一致；
- API、static artifact 与报告的 counts 一致；
- 未冻结输入、缺失 checksum 或 stale report 导致失败。

## 9. 允许的覆盖声明

### 可以声明

- “在 edition X、segmentation Y 的 Pilot 范围内，passage inventory 为 100%，仍有 N 个 pending-review 候选。”
- “本报告记录 A 个 occurrence 和 B 个 concept；归并规则见对应 decision。”

前提是所有变量都由同一份真实报告生成。

### 禁止声明

- “全书异兽共 N 个”，但未给 edition、segmentation 和归并规则。
- 用 concept 数替代 occurrence 数。
- 用精选列表完成度替代 corpus coverage。
- 把 100% passage audit 写成争议、翻译、媒体或地望 100% 完成。
- 将 local/isolated 统计描述为 production 状态。

## 10. Gate 0 未决事项

- baseline edition 与 section hierarchy；
- passage segmentation version；
- Pilot scope；
- 疑似提及发现流程；
- 各附加 coverage 的精确分母；
- verifier 输出 schema_version；
- 报告 owner 和 reviewer。

## 11. 本文件冻结条件

- 语料与编辑政策已冻结。
- 数据字典确认所有字段和状态。
- Pilot inventory 能生成首份 JSON/Markdown 报告。
- 人工抽样与自动汇总一致。
- HANDOFF 只链接生成报告，不复制数字。
