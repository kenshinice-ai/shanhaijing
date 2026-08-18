# 《山海经 Atlas》专家评审问题

- 状态：`review_ready`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前 Gate：`Phase 0 / Gate 0 blocked`

每个问题必须有明确学科 reviewer、输入版本、问题范围、结论、遗留行动和 disposition。没有专家结论的候选规则不得写成 frozen contract。

Disposition：`unassigned` / `open` / `answered` / `accepted-with-actions` / `blocked` / `deferred`。

| ID | 学科 | 问题 | 所需输入 | reviewer | disposition | 证据/结论 |
|---|---|---|---|---|---|---|
| SJ-E001 | 古籍/校勘 | 采用哪个底本或校勘体系作为 passage inventory 基线？异文如何保存而不制造伪权威文本？ | candidate editions、版权和 checksum | `R-CLASSICS` | open | 国家图书馆知识库冻结为首要版本比对入口；baseline edition 仍待 sample collation 与外部签署 |
| SJ-E002 | 古籍编辑 | 段落切分、篇章层级、方向词和里距表达的最小可审计规则是什么？ | edition sample、segmentation proposal | `R-CLASSICS` | open | reviewer 已指定；依赖 E001 与 Pilot passage sample |
| SJ-E003 | 古籍编辑 | 同名异物、异名同物、群体称谓和疑似普通动物的归并/拆分最低证据是什么？ | occurrence inventory、editorial examples | `R-CLASSICS` | open | reviewer 已指定；需 Pilot occurrence/decision fixture |
| SJ-E004 | 神话学/宗教学 | “异兽/神祇/人/部族/植物/矿物异常”的边界如何表达，避免将现代分类强加到古籍？ | taxonomy draft、edge cases | `R-CLASSICS` | open | 由古籍 reviewer 牵头；最终需神话学/宗教学外部签署 |
| SJ-E005 | 历史地理 | 哪些地望研究可作为独立 candidate set？confidence 和反证由谁评定？ | claim bibliography、GeoJSON/projection contract | `R-GEO` | open | 复旦历史地理研究中心为首选外部签署方向；禁止无来源共识地图 |
| SJ-E006 | 历史地理 | 里制、方向、发源/注入关系在不同篇章中的语义差异，哪些可计算，哪些必须原样保留？ | topology examples、section inventory | `R-GEO` | open | 原文值优先保留；可计算边界依赖 Pilot 与外部签署 |
| SJ-E007 | 动物学/生态 | 现代物种类比如何标注，如何避免声音或形态类比被误解为实体定种？ | taxonomy and sound evidence proposals | `R-CLASSICS` + `R-AUDIO` | open | 类比只能为 research/editorial/artistic 层；仍需动物学外部 reviewer |
| SJ-E008 | 图像史/博物馆 | 古籍影印、历代图像、博物馆数字对象和现代研究地图的发布权利如何分别判断？ | source and rights samples | `R-RIGHTS` + `R-CLASSICS` | accepted-with-actions | 逐资产、逐数字化对象审核；IIIF 只作传输契约，MAP-001 仅内部参考 |
| SJ-E009 | 版权/媒体 | rights、provenance、撤回和 derivative chain 的最低发布证据是什么？ | asset manifest samples、licence terms | `R-RIGHTS` | accepted-with-actions | 最低证据已在 reviewer assignment 冻结；实际资产仍须逐项法律/许可复核 |
| SJ-E010 | 声学/声音设计 | 原文声描写、现代物种类比和艺术声音的 disclosure、响度、peak、loop 和审稿门槛是什么？ | sound recipe and profile samples | `R-AUDIO` | accepted-with-actions | ITU-R BS.1770-5 测量算法冻结；各类声音 target/tolerance 待 Pilot |
| SJ-E011 | 双语编辑 | 哪些英文译名可发布，哪些必须保留拼音加解释？published-only fallback 的 reviewer 流程是什么？ | translation samples、glossary | `R-BILINGUAL-ZH` + `R-BILINGUAL-EN` | accepted-with-actions | GB/T 16159-2012 + ALA-LC 为规范基线；发布采用中英双签 |
| SJ-E012 | 无障碍 | 地图拓扑、候选差异、图像和声音如何提供键盘、表格、alt、转录与 reduced modes 替代？ | UI prototype、screen-reader matrix | `R-A11Y` | accepted-with-actions | WCAG 2.2 AA 冻结；真实 AT/键盘/缩放/forced-colors 测试待原型 |
| SJ-E013 | 性能/前端 | 100/500/1000+ fixture、设备、浏览器、网络和重复次数如何冻结？哪些超限会阻断？ | performance budget proposal | `R-PERF` | accepted-with-actions | CWV p75 good threshold 为外部基线；Atlas 领域预算待真实 fixture |
| SJ-E014 | 发布/运维 | local、isolated DB、static、staging、production 的证据如何保留，rollback 和撤回如何演练？ | release checklist、deployment target | `R-RELEASE` | open | reviewer 已指定；目标平台、rollback 和 production authorization 未冻结 |

## 评审记录模板

复制以下块，为每个问题附上正式结论：

```text
questionId: SJ-E___
reviewer: <name/role>
reviewDate: <YYYY-MM-DD>
inputRevision: <revision/checksum>
answer: <answer or unresolved>
disposition: <answered/accepted-with-actions/blocked/deferred>
followUpOwner: <name/role>
followUpDue: <YYYY-MM-DD or not_assigned>
evidence: <path/report/decision id>
```

## Gate 0 评审结论

- 项目责任 reviewer：`assigned`，详见 `REVIEWER_ASSIGNMENTS_2026-08-15.md`
- 外部人工签署：`pending`
- 已形成候选结论：SJ-E008–SJ-E013，均为 `accepted-with-actions`
- 仍开放：SJ-E001–SJ-E007、SJ-E014
- 阻断问题：古籍底本/切分、历史地理 candidate set、外部法律/学术/母语/AT/性能签署
- Gate transition：`blocked`

## 修订记录

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `SJ-EXPERT-001` | 2026-08-14 | 建立 Phase 0 专家问题清单 | 主负责人 | `HANDOFF.md` |
| `SJ-EXPERT-002` | 2026-08-15 | 指定项目 reviewer、权威基线和外部签署候选 | 主负责人 | `REVIEWER_ASSIGNMENTS_2026-08-15.md`、`SJ-D007` |
