# 《山海经 Atlas》媒体、图标与插画政策

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：首批资产清单、rights reviewer、图像 reviewer、最终枚举和 verifier 尚未冻结

## 1. 目的

本政策定义《山海经 Atlas》中图像、地图图标、历史插图、文本影印、地图与现代示意的角色、来源、权利、解释状态和发布门槛。

媒体可以帮助理解文本和图像传统，但不能自动证明：

- 异兽具有某种唯一“真实外貌”；
- 图中场景是目击记录；
- 历史插图与成书年代同时；
- 现代研究地图代表确定地望；
- 公开可访问的文件允许复制、裁切或再发布。

## 2. 独立状态维度

每个资产至少分别记录以下维度，不得互相推导：

| 维度 | 回答的问题 |
|---|---|
| `media_role` | 资产在产品中承担什么职责？ |
| `depiction_status` | 画面属于何种视觉记录/表现？ |
| `interpretation_class` | 资产与文本/研究证据的关系是什么？ |
| `source_attestation` | 其内容依据来自原文、注本、研究还是无直接文本？ |
| `rights_status` / `license_status` | 是否允许目标发布方式？ |
| `review_status` | 是否经过编辑、版权和无障碍审核？ |

`rights_status=verified` 不提高历史真实性；`text_attested` 也不授予图像版权。

## 3. 媒体角色

在保留现有 Atlas role 的基础上，首版候选包括：

- `creature_depiction`：异兽/生灵表现；
- `historical_illustration`：有年代和版本来源的历史图像；
- `text_folio`：古籍页面、影印或数字化文本对象；
- `scholarly_map`：代表特定作者/机构主张的研究地图；
- `reconstruction_map`：本项目或获许可来源制作的示意复原图；
- `habitat_reference`：现代环境、物种、材料等类比参考；
- `place_view`：明确标注年代/现代性的地点视图；
- `other`：只允许暂存，发布前必须补充可解释 role 或有书面豁免。

role 只描述用途。一个源文件如承担不同职责，应通过明确 link/context 表达，不复制出语义不明的记录。

## 4. Depiction 与解释等级

### Depiction status 候选

- `documentary`：对可核验现代对象/文献页面的记录；
- `historical_artwork`：历史时期形成的艺术表现；
- `illustrative`：说明性或编辑性图像；
- `cartographic`：地图或空间图示；
- `reconstructed`：依据明确输入重建；
- `generated`：算法或生成模型输出；
- `unknown`：未分类，仅可内部审阅，默认不可 bundled 发布。

### Interpretation class 候选

- `textual_transcription`：忠实呈现可核验文本/页面对象；
- `editorial_synthesis`：编辑团队基于多个证据形成的综合示意；
- `scholarly_hypothesis`：代表具体有来源的学术主张；
- `artistic_interpretation`：体验性艺术演绎；
- `reference_only`：仅作为类比或设计研究输入。

历史年代不等于文本权威；“古图”仍可能是后世诠释。

## 5. 图标与大图严格分离

### 地图图标

`creature_icon_registry` 保存小尺寸地图符号。图标必须：

- 在目标尺寸、浅/深底图、selected/disabled 状态下可辨；
- 使用稳定 `icon_key`、version、path 和 checksum；
- 记录 designer、source、licence、taxonomy hints 与 review status；
- 不以细节暗示未经证实的生物结构；
- 不从历史图像或现代插画自动裁切生成，除非许可和衍生链均允许。

### Drawer illustration

详情大图是独立媒体资产，可为历史图像、开放许可图像或现代示意。它拥有自己的 role、depiction、interpretation、rights、alt、caption 和 checksum。

### 关联规则

- 图标与大图共享 concept link，不共享真实性结论；
- 图标不能因 concept 有历史图像而自动变成“历史外貌”；
- 大图不能因使用同一 `icon_key` 而继承图标许可；
- 视觉同一性是编辑关联，必须可追溯到 decision。

## 6. 最低元数据

所有 public 候选资产至少记录：

- stable asset ID；
- media kind、role、depiction status、interpretation class；
- 适用 subject kind/ID 与展示范围；
- title、caption、alt text（`zh-CN`、`en` published）；
- creator/author；
- creation date/interval 与 date precision；
- source/provider；
- source page URL；
- original file URL 或受控 source reference；
- licence/rights statement；
- licence URL；
- attribution；
- rights status、reviewer 和 review date；
- retrieved_at；
- local/public path（如允许）；
- MIME、像素尺寸、文件大小；
- SHA-256；
- crop、resize、colour correction、transcode 等 derivative 记录；
- parent/input asset IDs 与 input checksums；
- AI/算法披露（如适用）；
- editorial reviewer、accessibility reviewer 与 review status。

缺少 provenance、rights、checksum、双语可访问文本或解释等级时，bundled 发布 fail closed。

## 7. Rights 与使用模式

使用模式候选：

- `bundled`：文件随应用发布；仅限 rights verified 且 manifest verified；
- `external_link`：只显示来源页链接，不嵌入远程图像；
- `internal_reference`：仅受控研究环境可见；
- `rejected`：不得展示或发布，但保留审计记录。

`remote` 图像默认禁用。若未来确有业务需求，需单独评审 provider 条款、隐私、可用性、CSP、性能和撤回机制。

Rights 状态：

- `verified`：许可、授权主体、适用范围和 attribution 可核验；
- `pending`：信息存在但审核未完成；
- `rejected`：许可或来源不满足目标用途；
- `unknown`：信息不足。

只有 `verified` 可进入 `public/` 与静态 artifact。其余状态不暴露本地路径。

## 8. 来源优先级与禁用来源方式

优先：

- 明确公共领域的古籍影印；
- 博物馆、图书馆等机构提供的明确开放许可对象；
- 作者或权利人明确授权的现代作品；
- 本项目可重复生成且输入权利完整的示意资产。

禁止：

- 将“可下载”“可截图”视为再发布许可；
- 从搜索结果页、社交媒体或聚合站直接取图；
- 去除水印、署名或权利标记；
- 只保存 CDN URL，不保留 source page；
- 将视觉上相似的现代插画标作历史图；
- 将多个研究地图拼成无来源“共识图”；
- 追踪权利不明地图的独特几何或图形语言。

参考地图另受 `REFERENCE_MAP_AUDIT.md` 约束。

## 9. 历史插图

每项历史插图必须明确：

- 作品/版本/卷页；
- 作者、刊刻者或责任者（未知则明确 unknown）；
- 形成或出版日期精度；
- 收藏/数字化机构；
- 页面/图版 locator；
- 是否为后世图像传统；
- 是否存在裁切、拼接、上色或修复；
- 与 creature concept/occurrence 的编辑关联依据。

UI 必须显示来源年代和 interpretation，不能仅以“古画”概括。

## 10. Text folio

文本页面可用于版本与段落定位，但：

- 影印权、底本权利和数字化页面使用权分别核验；
- 页面坐标/裁切范围记录到 derivative manifest；
- OCR 文本不因页面可见而自动正确；
- 图片 alt 简述页面结构，不把整页文字塞入 alt；
- 可读文字通过 transcript/OCR 区域另行提供并标注审核状态。

## 11. 学术地图与复原地图

- `scholarly_map` 代表具体 claimant/source/candidate set；
- `reconstruction_map` 明确展示输入、算法、编辑修订和不确定性；
- 地图图片不替代结构化 `place_candidates`；
- 投影、范围、比例尺、底图来源和许可进入 manifest；
- publication date 进入图像/研究时间轴，但不提升 geographic confidence；
- rights verified 与 geography reviewed 分别通过后才能作为相应模式发布。

## 12. AI 与算法生成图像

AI/算法生成输出必须记录：

- generator/model/tool 与准确 version；
- prompt/recipe；
- seed 和确定性参数（可用时）；
- 输入/reference 资产及权利；
- output checksum；
- generated_at；
- 人工修改步骤与工具；
- reviewer；
- `depiction_status=generated`；
- 通常为 `interpretation_class=artistic_interpretation` 或经批准的 `editorial_synthesis`。

不得声称生成图像是古代真实形象、考古复原结论或唯一正确解读。训练数据权利无法合理评估的工具不得自动进入发布管线。

## 13. 双语 Alt、Caption 与披露

### Alt

- 描述用户在当前上下文需要理解的视觉内容；
- 不重复邻近标题和 attribution；
- 装饰图使用空 alt，但不能把知识图像错误标作装饰；
- 中英文分别编辑并以 published 状态发布；
- 不把推断写成确定事实。

### Caption

caption 至少包含适用的角色、年代/版本、creator、interpretation 与关键不确定性。attribution 和 licence 链接独立可访问。

### Disclosure

现代示意、AI/算法生成、学术假说和重建图必须在首次展示处可见标注，不能藏在二级来源页。

## 14. 文件与衍生规范

最终目录由 `ASSET_MANIFEST_SPEC.md` 冻结。候选根目录：

```text
apps/web/public/media/shanhaijing/
  icons/creatures/
  illustrations/historical/
  illustrations/reconstructions/
  folios/
  maps/derived/
  manifests/images/
  manifests/maps/
```

`maps/reference/` 默认不进入 `public/`；内部参考文件放受控 workspace。

规则：

- 文件名仅使用安全 ASCII slug、version 和内容用途；
- Web derivative 与 source master 分离；
- 不覆盖已有文件来“更新”内容，需版本化并更新 manifest；
- 每次转换保存 parent checksum、工具/version、参数和 output checksum；
- stale、orphan 与 checksum mismatch 均阻断发布。

## 15. API 与 UI Fail-Closed

API 只有同时满足以下条件才返回 bundled asset path：

- subject/link 可发布；
- rights verified；
- role、depiction、interpretation 已分类；
- source page、licence、attribution 完整；
- checksum 与文件一致；
- `zh-CN`、`en` alt/caption 达到冻结发布规则；
- asset 和 derivative manifest verified；
- 当前 profile registry 允许该 kind/role。

失败时：

- 合法 source page 可降级为 external link；
- 否则显示无媒体状态；
- 不返回失效/未审核本地路径；
- 不以占位图伪装内容覆盖。

## 16. Verifier 契约

计划命令：`npm run verify:shanhaijing-media`，当前尚未实现。

至少检查：

- DB/manifest/path 一致；
- rights allowlist 和 licence URL；
- HTTPS provenance；
- 双语 published alt/caption/source；
- role/depiction/interpretation 独立且合法；
- creator/date/retrieved_at；
- SHA-256、MIME、尺寸、字节预算；
- derivative DAG 无断链/环路；
- stale、missing、orphan 文件；
- 图标尺寸/轮廓/readability test；
- generated asset 披露和 recipe/model metadata；
- API 未暴露 pending/rejected/unknown bundled path；
- dynamic/static parity。

输出 JSON 与 Markdown 摘要至 `docs/shanhaijing/generated/`，包含命令、输入 checksum 和 evidence level，不人工修改统计区。

## 17. 撤回与修订

当许可变化、来源撤回、checksum 异常或学术关联被否决：

1. 立即停止 API 暴露本地路径；
2. 保留审计记录并标记状态；
3. 移除或隔离 public derivative；
4. 更新 manifest、decision log 和 affected links；
5. 重跑 verifier、static build 与相应 smoke；
6. 如已发布，按 release checklist 执行撤回/回滚。

不得静默替换成另一张图并沿用原 asset ID、来源或 attribution。

## 18. Gate 0 未决事项

- media role、depiction status 与 interpretation class 最终枚举；
- 首批历史插图、folio、地图和现代示意来源；
- licence allowlist 与地区/用途边界；
- source master 的受控存储位置；
- Web 图像格式、尺寸和字节预算；
- 图标设计/采购/生成流程；
- 双语 alt/caption 发布门槛；
- AI/算法工具允许清单；
- rights、图像史、编辑和 accessibility reviewers；
- verifier 与 manifest schema。

## 19. 本文件冻结条件

- Pilot 至少覆盖历史插图、现代示意、图标、folio 或明确空状态中的代表样本；
- 每项样本的 role、depiction、interpretation、attestation、rights 可独立解释；
- rights reviewer 批准 licence allowlist 与撤回流程；
- 图像 reviewer 批准历史图像与 concept/occurrence 的关联方式；
- 图标在目标尺寸、底图和状态下通过可读性测试；
- 双语 alt/caption 获审；
- verifier 以故意缺字段、错 checksum、stale 文件和 rights denied fixture 证明 fail closed；
- 相关决定进入 `DECISION_LOG.md` 后，方可标记 `frozen`。
