# 《山海经 Atlas》幻想拼接总图美术方向

- 状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 地图策略：[MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md](MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md)
- 参考图审计：[REFERENCE_MAP_AUDIT.md](REFERENCE_MAP_AUDIT.md)

## 1. 资产定位

制作一张高分辨率、超级完整、视觉震撼的《山海经》幻想世界拼接总图，作为产品的“艺术总览”入口。

该资产是：

- `media_role=artistic_composite_map`；
- `interpretation_class=artistic_interpretation`；
- `source_attestation=editorial_synthesis`；
- `geographic_confidence=not_applicable`；
- 非历史地理定论；
- 非 candidate set；
- 非现代底图；
- 非原文路线拓扑的替代品。

## 2. 与权威证据的关系

母图负责氛围、探索感和视觉记忆。程序叠加层负责：

- 正确中文标签；
- 路线与篇章；
- 可选择热点；
- 原文引文；
- candidate set；
- modern comparison；
- 图例与免责声明。

AI/人工绘制母图不直接携带知识事实。任何结构化点位或路线都不能从母图像素反向提取。

## 3. 构图

推荐横向大地图，视觉上像一块被四海包围的神话大陆：

- 中部：多重山系、河谷、古森林、荒原和盆地；
- 北部：雪山、冰原、寒海、极昼雾光；
- 西部：高原、沙海、赤色峡谷、巨型神木；
- 南部：湿热山林、云海、沼泽、火山与奇花异草；
- 东部：海岸、群岛、扶桑意象、海中神山；
- 四海：漩涡、鲸鲲、海蛇、神龟、漂浮岛屿；
- 山路与水路形成可读的视觉流向，但不表现为现代公路；
- 大型地标控制在少量视觉锚点，细节向周边逐级展开。

画面要有“可连续探索数十分钟”的密度，但保留主要山水走向和视觉呼吸区。

## 4. 内容层

### 地景

- 山脉、峰群、悬崖、洞穴、火山、雪原；
- 河流、瀑布、湖泽、地下水、入海口；
- 森林、竹林、神木、花海、药草、矿脉；
- 荒漠、盐泽、黑土、赤水、云海、雷暴区；
- 古国、部族聚落、祭坛、神殿、关隘和遗迹。

### 生灵

- 异兽、神鸟、水族、蛇虫、复合生物；
- 神、人、部族、巫者与祭祀队列；
- 生灵大小服从构图需要，不暗示真实比例；
- 不把所有实体堆在同一视觉尺度；
- 重点生灵只作为视觉锚点，其余以小型剪影和生态场景分布。

### 叙事

- 山系行进；
- 水源与流向；
- 异兽栖息；
- 征兆、灾异、药用和祭祀意象；
- 天地边界、四海和远方奇观。

## 5. 风格

- 中国古代博物志、青绿山水、矿物颜料、壁画和现代高端奇幻地图的融合；
- 细密手绘、宣纸纤维、岩彩颗粒、克制金线；
- 深青绿、矿物蓝、赭石、朱砂、雾白和少量鎏金；
- 非游戏 UI 截图、非现代卫星图、非欧洲中世纪羊皮纸地图；
- 不复刻用户参考图的轮廓、图标、配色和标签布局；
- 不复制任何现代插画师的可识别个人风格。

## 6. 生成约束

- 母图中不生成中文或英文文字；
- 不生成水印、logo、图例文字或现代行政边界；
- 不生成规则网格、经纬网或精确比例尺；
- 不把单一现代中国轮廓作为大陆外形；
- 不使用用户参考图的具体海岸线、道路或装饰；
- 预留顶部、四角和边缘用于程序化方向标识与图例；
- 地标之间留出可放置 hotspot 和 label 的负空间；
- 画面边缘可无缝裁切或制作多分辨率切片。

## 7. ImageGen 生产 Prompt

```text
Use case: stylized-concept
Asset type: ultra-high-resolution zoomable fantasy atlas mother map for a web knowledge product
Primary request: create a spectacular, encyclopedic, extremely detailed fantasy composite world map inspired by the cosmology, mountains, seas, strange creatures, divine beings, tribes, plants, minerals, rituals and omens described in the ancient Chinese Classic of Mountains and Seas; this is an artistic overview, not a historical geography claim
Input images: Image 1 is mood and density reference only; do not copy its coastline, routes, icons, labels, palette arrangement or composition
Scene/backdrop: one vast mythic continent surrounded by four seas, with snowy northern ranges, western plateaus and deserts, central mountain chains and river basins, southern cloud forests and marshes, eastern coasts and island realms, deep-sea wonders around the perimeter
Subject: hundreds of small integrated environmental scenes with strange beasts, divine birds, serpents, aquatic creatures, giant sacred trees, ritual sites, ancient settlements, caves, waterfalls, volcanic regions, floating islands and celestial phenomena
Style/medium: masterfully hand-painted Chinese mineral-pigment fantasy cartography, refined gongbi detail, subtle silk and xuan-paper texture, restrained gold linework, museum-quality contemporary illustration
Composition/framing: wide panoramic top-down oblique atlas, strong readable mountain and river hierarchy, several large visual anchors, immense micro-detail, controlled negative space for programmatic labels and hotspots
Lighting/mood: mysterious, sacred, ancient, awe-inspiring, atmospheric mist and luminous mineral colors
Color palette: deep blue-green, mineral blue, malachite green, ochre, cinnabar accents, ink black, mist white, restrained antique gold
Constraints: no text, no labels, no watermark, no logo, no modern borders, no latitude-longitude grid, no roads resembling modern highways, no direct copy of the reference image, no claim of geographic accuracy
Avoid: European medieval parchment-map style, satellite imagery, game UI, excessive neon, clutter without hierarchy, repeated identical creatures, malformed large creatures, legible pseudo-Chinese text
```

## 8. 程序叠加说明

母图上方单独渲染：

- direction labels；
- section/route labels；
- candidate set markers；
- source badges；
- creature/concept hotspots；
- uncertainty and interpretation legend；
- zoom-dependent labels；
- accessibility focus rings。

热点记录至少包含：

- stable ID；
- mother-map normalized position；
- target kind/slug；
- visual role；
- editorial note；
- whether text-attested；
- whether linked to topology/candidate；
- label priority；
- alt/long description。

## 9. 用户可见说明

短说明：

> 艺术总览：本图依据《山海经》文本主题进行幻想拼接，用于探索世界观，不代表古代地望或现代坐标定论。

长说明：

> 这张总图将山川、海域、异兽、神人、部族、植物、矿物、祭祀与灾异意象组合成可探索的艺术世界。画面位置、距离和比例属于视觉编排，不作为历史地理证据。请切换“原文路线”“学术候选地”或“现代对照”查看可追溯的文本关系、来源和不同研究主张。

## 10. 发布门槛

- 生成 manifest、prompt、model/version、时间和 checksum；
- 人工检查畸形主体、重复内容、意外文字、水印和不当现代符号；
- `R-CLASSICS` 审核是否出现明显违背项目语义的组合；
- `R-RIGHTS` 审核参考图和生成资产边界；
- `R-A11Y` 完成 alt、long description、热点列表和 reduced-data fallback；
- 明示 AI/程序生成或人工后期方式；
- 不从母图反向生成学术数据；
- 只有 reviewer disposition 完成后才进入 public。

