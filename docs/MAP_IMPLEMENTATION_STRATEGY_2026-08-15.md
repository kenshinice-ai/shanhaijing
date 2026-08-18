# 《山海经 Atlas》地图实现策略

- 状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 上游规范：[GEOGRAPHY_AND_MAPS.md](GEOGRAPHY_AND_MAPS.md)、[ARCHITECTURE.md](ARCHITECTURE.md)、[API_CONTRACT.md](API_CONTRACT.md)、[PERFORMANCE_BUDGETS.md](PERFORMANCE_BUDGETS.md)
- reviewer：[REVIEWER_ASSIGNMENTS_2026-08-15.md](REVIEWER_ASSIGNMENTS_2026-08-15.md)

## 1. 最终推荐

采用“双轨制”：可以制作一张超级完整、足够震撼的幻想拼接总图，但它必须是明确标记的艺术入口，不能替代权威证据视图。

产品包含五个共享 selection、但证据与坐标系统彼此隔离的视图：

1. **艺术总览**：超级完整的幻想拼接母图，负责视觉冲击和世界探索；
2. **原文路线拓扑**：回答文本先后、方向、里距、水流和包含关系；
3. **学术候选地**：按 claimant/source 组成完整 candidate set，可单套查看或并列比较；
4. **现代对照**：只提供现代地形、水系和行政参照；
5. **古籍影像证据**：把版本书影、插图和局部区域关联到 edition、passage 或 concept。

用户提供的 `8259114179_29498.png` 只作为艺术总览的信息密度参考，不是数据源或最终设计稿。艺术母图规范见 [FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md](FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md)。

## 2. 权威实现参照

### 国家图书馆《山海经》知识库

- [发布说明](https://www.nlc.cn/pcab/xctg/bd/20240624_2640158.shtml)
- [数字化创新案例说明](https://www.nlc.cn/pcab/xctg/bd/20241216_2642340.shtml)

可借鉴：版本聚合、文本与图像/地理信息关联、知识检索和多入口浏览。

不可直接推导：本项目唯一底本、现代坐标、版权许可或可批量复制资产。

### China Historical GIS

- [Harvard China Historical GIS](https://chgis.fas.harvard.edu/)

可借鉴：历史地点与时间、来源、行政层级和 GIS 数据分层的方法。

使用边界：CHGIS 主要服务有历史行政与地点证据的时期，不得被当作《山海经》文本地点的自动 geocoder。若使用其数据，只能作为现代/历史参照或独立 source-backed candidate。

### IIIF 与 Web Annotation

- [IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/)
- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)

用于版本书影、页面/canvas、局部区域、标注、顺序和多语 metadata。图像 manifest 仍须经过项目 rights gate；支持 IIIF 不等于允许再发布。

### MapLibre 与 PMTiles

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [PMTiles specification](https://github.com/protomaps/PMTiles)

作为大量 line/polygon、candidate set 和静态 vector tile 的规模化路径。Pilot 不因“未来可能需要”而提前引入；只有基准越过冻结触发器时迁移。

## 3. Renderer 分层

### 3.1 `TopologyCanvasRenderer`

职责：原文路线拓扑，不接受 WGS84 坐标。

- section/route 级 JSON partition；
- build-time 确定性布局，输入为 sequence ordinal、direction token、distance text、edge kind 和 conflict branch；
- 布局坐标使用独立 discriminant，例如 `coordinateSpace: "textual-layout-v1"`；
- Canvas 绘制节点、边和 hit area；D3 zoom/selection 复用现有能力；
- D3 force 只可用于确定性 label collision 或局部避让，不能改写 route 顺序和关系；
- 同一输入与 generator version 必须产生相同 checksum；
- 环路、冲突、无法计算方向和缺失距离保留可见标记。

禁止把布局坐标包装成 latitude/longitude，也禁止运行时随机 force layout 导致刷新后位置变化。

### 3.2 `CandidateGeoRenderer`

职责：可定位的学术候选与现代对照。

Pilot：

- 复用仓库现有 Leaflet、React Leaflet 和 Supercluster；
- 每次默认激活一个 candidate set；
- compare mode 使用左右并列、小多图或可控叠加，不生成平均坐标；
- point/line/polygon 以 GeoJSON 传输，每个 feature 携带 candidate set、claimant、source、confidence reason 和 detail identity；
- occurrence 计数与 marker/geometry 数分开。

Scale：

- 大量 line/polygon 或多 candidate set 超过 payload、frame、memory 预算后，迁移到 MapLibre；
- static artifact 使用版本化 PMTiles/vector tiles；
- renderer 迁移不改变领域 schema、selection identity 或 evidence semantics。

### 3.3 `ModernComparisonRenderer`

- 默认关闭或降低视觉权重；
- 明确标识 provider、日期、style、licence 和 attribution；
- 与 scholarly candidate 使用不同 layer group 和图例；
- reduced-data/offline 时可完全关闭；
- 现代行政边界不得参与 historical confidence 计算。

### 3.4 `SourceImageViewer`

- 优先消费 rights-approved IIIF manifest；
- edition → canvas/page → region → passage/annotation 逐级关联；
- Web Annotation selector 保存局部区域和文本/实体关联；
- 原图不可公开时只保存 bibliographic/source metadata，不代理或缓存图像；
- 插图不能自动生成候选坐标或 taxonomy fact。

### 3.5 `ArtisticCompositeRenderer`

- 渲染一张高分辨率、可缩放的幻想拼接母图；
- 母图不烘焙文字，标签、热点、路线、图例和 disclosure 由程序叠加；
- 每个热点可跳转到原文路线、candidate set、现代对照或详情；
- 母图坐标使用 `coordinateSpace: "artistic-composite-v1"`，不得转成 WGS84；
- 资产固定为 `interpretation_class=artistic_interpretation`；
- reduced-data 模式可用低分辨率预览或纯列表替代；
- 母图像素不得反向成为 topology/candidate 数据。

## 4. UI 信息架构

顶部地图模式使用五段切换：

- `艺术总览`
- `原文路线`
- `候选地`
- `现代对照`
- `版本与图像`

切换模式时保留稳定 selection，但不强行保留不兼容 viewport。每个模式更新标题、coordinate/evidence disclosure、图例、active source/candidate set、可访问列表/表格和 URL state。

候选地比较优先顺序：

1. 单 candidate set；
2. 左右并列或 small multiples；
3. 用户主动选择的有限叠加；
4. 差异摘要表。

禁止默认叠加所有学说，禁止生成无来源“共识点”。

## 5. 数据与传输

### 文本拓扑 partition

按 edition + section/route 输出 nodes、edges、layout version、coordinate space、conflict summary、passage references 和 checksum。

### Candidate GeoJSON

按 candidate set + region/section 输出 stable feature identity、geometry、claimant/source、claim date、confidence + reason、counter-evidence summary、publication status 和 detail identity。

### Static scale path

1. Pilot：partitioned JSON/GeoJSON；
2. 中等规模：bbox/section partition + Supercluster；
3. 大规模：MapLibre style + PMTiles；
4. manifest 保存 schema version、publication revision、tile archive checksum、bounds、min/max zoom 和 source set。

动态 API 与静态 artifact 必须使用同一 serializer 和 publication filter。

## 6. 可访问性

- 地图不是唯一入口；
- 原文拓扑提供按 section/ordinal 排序的路线表；
- 候选地提供地点、candidate set、source、confidence 和反证表；
- 键盘可以进入节点列表、选择、打开详情并返回触发点；
- Canvas/WebGL 元素通过同步 DOM 列表提供 accessible name/state；
- 图例使用形状、线型、文字和 pattern，不只靠颜色；
- zoom/pan 不阻止浏览器缩放和屏幕阅读器导航。

## 7. 性能触发器

使用 100/500/1000+ fixture 测量 JSON/GeoJSON/PMTiles bytes、parse/schema validation、layout/index build、first interactive、switch/filter/pan、p95 frame duration、dropped frames、INP、memory/cache 和 accessible fallback DOM。

迁移条件：

- topology SVG/DOM 超限 → build-time layout + Canvas；
- Leaflet point/有限 geometry 达标 → 保持；
- line/polygon/candidate set 经 partition 后仍超限 → MapLibre + PMTiles；
- parse/layout/index 造成 long task/INP 越界 → worker 或预计算；
- 所有迁移都必须通过 `R-PERF` 和 `R-A11Y`。

## 8. 实施顺序

Gate 0 批准后：

1. 冻结一个 Pilot section 和 passage inventory；
2. 建立 topology/candidate schema 与正负 fixture；
3. 实现 renderer-neutral map adapter 和 selection contract；
4. 实现确定性 `TopologyCanvasRenderer`；
5. 用 Leaflet 实现一个独立 candidate set；
6. 加入第二 candidate set，验证并列比较和差异表；
7. 接入一个 rights-approved IIIF/source image fixture；
8. 生成一张带 manifest、disclosure 和 hotspot overlay 的艺术总览母图；
9. 执行 100/500/1000+ benchmark；
10. 只有报告触发时再做 MapLibre/PMTiles spike；
11. dynamic/static parity 后才进入 staging。

## 9. 当前结论

- 推荐方案：`accepted-with-actions`
- 用户参考图：`non_authoritative_visual_reference`
- Artistic overview：`high-impact fantasy composite with explicit disclosure`
- Pilot renderer：`D3/Canvas topology + Leaflet/Supercluster candidate map`
- Scale renderer：`MapLibre + PMTiles when benchmark-triggered`
- Source image：`IIIF Presentation 3 + Web Annotation when rights-approved`
- Gate 0：`blocked`
- schema/code：`not_authorized`
