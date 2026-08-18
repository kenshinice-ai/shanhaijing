# 《山海经 Atlas》参考地图审计

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前登记：4 项；MAP-001 为用户明确说明的随意网图参考，MAP-002 至 MAP-004 为 2026-08-16 提供的幻想总图候选，来源与可发布权仍待确认

## 1. 目的

本文件逐项登记用户提供或后续经批准收集的《山海经》相关地图，审核其来源、权利、学术主张和可借鉴范围。参考地图不会因为视觉上可信或公开可见，就自动成为可打包资产或地望证据。

## 2. 三种用途必须分开

每个条目可具有一种或多种用途，但必须分别裁决：

| 用途 | 含义 | 是否自动进入产品数据 |
|---|---|---|
| `visual_reference` | 研究布局、层级、符号、标签或交互 | 否 |
| `data_source_candidate` | 候选用于提取地点、线、面或关系 | 否，需单独验证与许可 |
| `scholarly_geography_claim` | 代表某位作者/机构的地望体系 | 否，需建立 candidate set 与具体 source |

三者不可互相替代。视觉参考不能证明地望；学术主张也不当然授予图像再发布权。

## 3. 当前登记表

| audit ID | 名称 | 作者/机构 | 年代 | 来源 | 权利 | 用途 | 状态 |
|---|---|---|---|---|---|---|---|
| MAP-001 | 用户提供的《山海经》综合插画地图参考图 | 未知 | 未知 | 本地 PNG；原始网页未提供且未核实 | `unknown` | `visual_reference` | `internal_reference_only` |
| MAP-002 | 幻想拼接总图候选 A（shanhaijing2） | 待用户确认 | 2026 | 本地 PNG | `pending_provenance` | `artistic_overview_candidate` | `internal_candidate_only` |
| MAP-003 | 幻想拼接总图候选 B（shanhaijing4k） | 待用户确认 | 2026 | 本地 PNG | `pending_provenance` | `artistic_overview_candidate` | `preferred_visual_candidate` |
| MAP-004 | 幻想拼接总图候选 C（山海经map） | 待用户确认 | 2026 | 本地 PNG | `pending_provenance` | `artistic_overview_candidate` | `internal_candidate_only` |

<a id="map-001"></a>

## 4. MAP-001

### 基本信息

- 标题、作者、机构、年代、版本和原始 URL：未知；
- 本地路径：`/Users/llmacbookpro/Downloads/8259114179_29498.png`；
- 提供者：用户；
- 提供日期：2026-08-15；
- 用户说明：随意从网上取得，仅供参考，不作为最终结论；
- 格式：PNG，1188 × 1080，8-bit colormap，non-interlaced；
- 文件大小：912466 bytes；
- SHA-256：`d3f65b6e0d5fc30b65cfc472a003bdf6950b1c625d1939f6816829465f87db37`；
- 来源检索：以文件名公开检索，未找到可核验的权威原始页面；不据此猜测作者或出处。

### 权利与用途裁决

- rights status：`unknown`；
- 是否允许打包、制作衍生图或提取点位：`no`；
- 是否仅内部参考：`yes`；
- visual reference：`accepted_internal_only`；
- data source candidate：`rejected_pending_new_evidence`；
- scholarly geography claim：`rejected_pending_new_evidence`；
- reviewer：`R-RIGHTS` + `R-GEO`。

理由：缺少作者、来源、许可、投影、比例尺、图例解释和地望方法；用户也明确该图不作为最终结论。该文件不复制到仓库 `public/`、build、precache、built static artifact 或 CDN。

### 视觉观察

- 大陆式整幅构图和四海方向文字具有强烈世界探索感；
- 山系、水系、生态、异兽和地名在同一平面高密度叠加；
- 海岸、雪地、荒漠、山地和水系形成明显视觉分区；
- 插画图标提供记忆点，但标签密度过高，低分辨率下难以辨认；
- 未见持续可读的图例、比例尺、投影、来源层级或不确定性表达；
- 精细插画可能让用户误以为点位与路线具有学术精度。

可借鉴“大世界探索”、地景分区、视觉锚点和层级展开；禁止复制海岸轮廓、图标、路线、配色组合、标签排布或从像素转录坐标。

### 最终结论

- status：`internal_reference_only`；
- 可用于：幻想拼接总图的信息密度、氛围和标签过载风险参考；
- 禁止用于：最终权威地图、公开资产、数据提取、地望主张、坐标或路线；
- decision：`SJ-D008`；
- 替代方案：[MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md](MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md)；
- 幻想总图规范：[FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md](FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md)。

<a id="map-002-map-004"></a>

## 5. MAP-002 至 MAP-004：幻想拼接总图候选

### 文件证据

| ID | 本地路径 | 像素 | 文件大小 | SHA-256 |
|---|---|---:|---:|---|
| MAP-002 | `/Users/llmacbookpro/Downloads/shanhaijing2.png` | 1672 × 941 | 3,673,562 bytes | `218b972b11a9fa0de2ced121643cdfdd36d73f54589a52b74f0b9d4c6d2b4a8c` |
| MAP-003 | `/Users/llmacbookpro/Downloads/shanhaijing4k.png` | 1672 × 941 | 3,581,154 bytes | `df2e732cedc4e528c6fdc03a80250686309750aeb4da0a2b9eea60d882cc3b6d` |
| MAP-004 | `/Users/llmacbookpro/Downloads/山海经map.png` | 1672 × 941 | 3,405,151 bytes | `40f5c02044fc468fec95ae401a16051783ac68b3d9e89735cee5ac9fe923bc3b` |

接收日期：2026-08-16。三项均为 16:9 横向 RGB PNG。文件名 `shanhaijing4k.png` 不代表实际 4K；经本地元数据检查，其真实尺寸仍为 1672 × 941。

### 视觉评审

- 三项都达到“超级幻想拼接总图”的核心方向：一张图内同时容纳雪山、荒漠、森林、水网、群岛、旋涡、火山、漂浮地景和大量异兽；
- MAP-002 的局部事件最多、视觉密度最高，但中央叙事锚点较分散，热点与程序标签容易与细节争夺；
- MAP-003 的大陆轮廓、明暗分区和由左上雪山/荒漠向中央绿洲、右侧海域展开的阅读路径最清楚，最适合作为 V1 艺术入口候选；
- MAP-004 的中央山水层次最稳定、留白相对更好，但大型异兽和奇观锚点较少，第一屏冲击力略低于 MAP-003；
- 三项均不包含可依赖的文字标签、比例尺、投影、原文路线或不确定性表达，因此只能作为 `artistic_interpretation`，不得作为历史地理或现代坐标结论。

### 分辨率裁决

- 1672 × 941 足以用于约 1440 CSS 像素宽的无深度缩放桌面首屏，以及 390–768 CSS 像素移动端裁切；
- 不足以支持 Retina 桌面全宽、4K 显示器、深度平移缩放或大幅印刷；
- 简单插值放大到 3840 × 2160 只增加像素数量，不产生新的真实细节，不得标记为“原生 4K”；
- 最终母图目标仍为原生 3840 × 2160，若要支持细节缩放，优先保留 7680 × 4320 或分区切片母版；
- V1 可在权利链确认后使用 MAP-003 的 1672 × 941 文件作为受限缩放的 Web 候选，并同时提供 AVIF/WebP 响应式衍生；真正 4K 母图作为后续无缝替换项。

### Rights / provenance 阻断

用户尚未说明三项是本人生成、委托生成、获得明确授权，还是来自第三方页面。因此当前统一：

- `rights_status=pending_provenance`；
- `depiction_status=generated_or_unknown_pending_confirmation`；
- `interpretation_class=artistic_interpretation`；
- `public/bundled=no`；
- `internal review=yes`；
- reviewer：`R-RIGHTS` + `R-CLASSICS` + `R-A11Y`。

公开发布前至少需要记录：creator/生成者、生成工具与模型（如适用）、生成日期、输入参考的权利边界、用户对项目公开发布与制作衍生格式的授权、AI/艺术演绎披露、双语 alt/caption、最终选定文件 checksum。

### 当前选择

- V1 构图首选：MAP-003；
- 备用：MAP-004；
- 高密度局部参考：MAP-002；
- 当前不得复制到 `apps/web/public/`、静态构建或 CDN；
- 如果 provenance 与发布授权确认，MAP-003 可进入受控资产管线；否则继续使用程序生成的结构化 SVG 替代视图，或生成全新的原生 4K 母图。

## 6. 单图审计模板

复制本节为每个独立条目；不得只在总表放一个 URL。

### `[MAP-000] 地图名称`

**基本信息**

- 作者/机构：
- 制作或出版年代：
- 版本/版次：
- 标题原文：
- URL 或书目：
- 本地参考路径（如有）：
- 获取日期：
- 文件 SHA-256（如有）：
- 提供者：

**权利与使用边界**

- rights status：`unknown`
- licence / rights statement：
- licence URL：
- attribution：
- 是否允许打包：`no`
- 是否允许制作衍生图：`unknown`
- 是否仅内部参考：`yes`
- rights reviewer / 日期：

**用途裁决**

- visual reference：`pending`
- data source candidate：`pending`
- scholarly geography claim：`pending`
- 裁决理由：

**地图结构**

- 覆盖范围：
- 投影/坐标系：
- 比例尺：
- 底图来源：
- 山系表达：
- 水系表达：
- 方向/里距表达：
- 路线与篇章结构：
- 地点与异兽关联：
- 候选地是否区分不同学说：
- 不确定性表达：

**视觉与交互观察**

- 色彩体系：
- 符号与图标：
- 标签层级与密度：
- 图例：
- 缩放/LOD：
- 可访问性：
- 可借鉴的抽象原则：
- 不可照搬的独特表达：

**学术审核**

- 主张者与方法：
- 具体 source：
- 可建立的 candidate set：
- 支持证据：
- 反证/局限：
- geographic confidence 评审：
- 历史地理 reviewer / 日期：

**最终结论**

- status：`pending_review`
- 可用于：
- 禁止用于：
- 后续 owner/action：
- decision log reference：

## 7. Rights 判定

- `verified`：许可和 attribution 可核验，使用方式在许可范围内。
- `pending`：已找到权利声明，但尚未完成审核。
- `rejected`：许可不允许目标用途，或来源明显不可靠。
- `unknown`：没有足够信息。

只有 `verified` 可进入 bundled/public 资产候选；`pending`、`rejected`、`unknown` 均 fail closed。

公开可访问、可截图或可下载都不等于允许复制、临摹独特图形、矢量化或再发布。

## 8. 视觉借鉴边界

允许评审的抽象原则包括：信息层级、地图/面板比例、标签密度策略、通用形状分类、图例位置和交互流程。

不得在未知或不兼容权利下：

- 复制独特图标、纹样、配色组合或版式细节；
- 追踪原图几何并作为 derived map 发布；
- 移除水印或 attribution；
- 将现代研究地图改色后声称原创；
- 将其地望点位合并为无来源“共识地图”。

## 9. 数据提取门槛

参考地图只有同时满足以下条件，才可成为 `data_source_candidate`：

- 作者、版本、日期和原始来源可核验；
- 数据提取与衍生使用获得许可；
- 投影、坐标和范围可解释；
- 每个地点/关系能回到具体主张或图例；
- 历史地理 reviewer 认可其作为独立 candidate set；
- 输入文件与提取结果均有 checksum；
- 转换工具和人工修订进入 manifest。

即使满足，也只能形成带来源的候选，不自动覆盖 textual topology。

## 10. 审计流程

1. 接收 URL、文件或完整书目信息。
2. 建立 audit ID，保存获取日期与 checksum。
3. 核验作者、版本、机构和原始页面。
4. 独立完成 rights 审核。
5. 分别裁决三种用途。
6. 分析投影、范围、山水、路线、标签、符号与不确定性。
7. 若为学术主张，建立 candidate set 评审记录。
8. 在 `DECISION_LOG.md` 记录采用、拒绝或仅内部参考。
9. 只有通过相应门槛后，才进入 asset manifest 或结构化数据。

## 11. Gate 0 未决事项

- MAP-001 的原始 URL、作者/机构、日期、许可和方法说明；
- MAP-002 至 MAP-004 的生成者、生成工具/模型、输入参考、授权与衍生许可确认；
- MAP-003 若获许可后的原生 4K/8K 母图或受限缩放发布策略；
- 外部 rights reviewer 与历史地理 reviewer 的人工签署；
- 内部参考文件的受控存储位置；
- candidate set 接纳标准；
- derived map 转换工具与 manifest schema。

## 12. 本文件冻结条件

- 所有 Gate 0 参考地图均有独立条目。
- 每项三种用途分别裁决。
- rights unknown 的资产未进入 `public/`。
- 可用地望主张已映射为独立 candidate set。
- 采用与拒绝决定进入 `DECISION_LOG.md`。
