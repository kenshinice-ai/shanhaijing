# 《山海经 Atlas》地理与地图规范

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：底本、Pilot、参考地图、candidate sets 与性能基线尚未冻结

## 1. 目的

本规范定义文本地理如何进入数据、API 和地图体验。核心要求是严格分离三层：

1. 原文拓扑；
2. 历史地理/现代学术候选；
3. 现代底图比较。

任何视觉精度、坐标精度或默认选项都不得把候选主张包装成确定事实。

## 2. 三层地理

### 2.1 A 层：原文拓扑

原文拓扑回答文本如何连接地点，而非这些地点在现代地球上的确定位置。

`textual_places` 表示山、海、荒、国、水、泽、路径节点等文本实体；`topology_edges` 表示方向、里距、发源、流入、相距、环绕、顺序等关系。

每条 edge 必须保存：from/to、relation kind、原文方向、原文距离与单位、sequence ordinal、passage、source、attestation、interpretation、review status。

规则：

- 原文无绝对坐标时，不创建伪经纬度。
- 拓扑布局坐标是派生渲染数据，不是历史地理事实。
- 方向和里距保留原值；换算值只能作为有版本和依据的派生解释。
- 冲突、环路、缺口和重复链不得被算法静默修正。
- 同一地点的识别若有争议，保留 unresolved 或多个编辑主张。

### 2.2 B 层：学术候选

学术候选回答某个 textual place 可能对应何处、由谁主张、依据为何。

每个 `place_candidate` 至少保存：textual place、candidate set、GeoJSON point/line/polygon、候选名称、claimant、source、主张年代、证据摘要、反证、geographic confidence、status。

规则：

- 一个 textual place 允许 0..N 个候选。
- 默认不替用户选定唯一答案。
- confidence 只评价该候选论证，不从实体重要度或媒体精美度推导。
- point、line、polygon 都是合法候选形态。
- 未知或权利不明地图不能直接成为数据来源。

#### Candidate set

同一学者、地图或研究体系的候选组成完整 `candidate_set`。UI 优先整套切换，避免把互不兼容来源拼成伪共识。

Candidate set 必须记录：名称、claimant、source、日期、适用范围、方法说明、已知局限、rights/引用边界和审核状态。

比较模式可并列多个 set，但必须显示来源、差异和未覆盖地点。

### 2.3 C 层：现代底图

现代地形、行政、水系和影像只用于空间参照。

规则：

- 底图精细度不得暗示古籍记载同等精确。
- 现代行政边界不得成为古代地望证据。
- 底图来源、样式许可、在线/离线方式和 attribution 写入 manifest。
- 用户可关闭现代底图并回到纯文本拓扑。
- reduced-data、离线或底图失败时，拓扑和列表仍可用。

## 3. 地点与关系类型候选

### Textual place kinds

山、山系、水、水源、河流、海、泽、荒、国/聚落、路径节点、区域、未定。最终词表须由语料样本验证。

### Topology relation kinds

- `next_in_route`
- `distance_direction`
- `source_of`
- `flows_into`
- `surrounds`
- `passes_through`
- `located_at`
- `adjacent_to`
- `unresolved_relation`

以上为候选 key。每个 relation kind 必须定义方向性、允许端点、距离字段、是否可传递和 UI 表达。

## 4. 地图模式

### 4.1 文本路线图

展示篇章/山系/水系顺序、方向、里距和水流关系。支持逐段高亮，并显示当前 passage。

没有绝对坐标时使用预计算拓扑布局；图例明确“布局用于阅读，不代表现代坐标”。

### 4.2 候选地比较

支持单 candidate set、并列 set 和差异模式。用户可查看每个候选的 source、confidence、证据摘要与反证。

不同 set 使用形状、线型和颜色共同编码，不能只靠颜色。

### 4.3 现代对照

在明确开启时叠加现代底图，显示候选覆盖范围和偏差。不得默认隐藏候选来源或不确定性图例。

### 4.4 异兽分布

按 occurrence 映射到 textual place 或候选位置。Concept 聚合可作为切换视图，但计数必须回溯到 occurrence。

同一 occurrence 在多个候选位置下不得被误计为多个文本提及；地图 marker 数和 occurrence 数分别报告。

### 4.5 专题地图

生态、征兆、声音、药用/仪式等专题由 taxonomy/filter 派生。专题只改变可视化，不创造新事实。

## 5. 不确定性表达

图例在候选和现代对照模式中持续可见，至少说明：

- 当前地理层；
- 当前 candidate set；
- confidence；
- point/line/polygon 含义；
- disputed/unresolved；
- 派生拓扑布局；
- 无候选或未审核。

视觉编码必须同时使用形状、边框/线型、标签和颜色。详情 drawer 提供完整 source 与理由。

## 6. 冲突处理

- 文本边存在矛盾、环路或缺失时，保留原始 edge 并标 conflict。
- 多种文本解析各自关联 editorial decision，不覆盖原文。
- 多 candidate set 不计算无来源的“平均坐标”。
- 算法布局失败或重叠时只调整派生坐标，不改 topology edge。
- 候选更正保留 supersedes 关系和旧 claim 审计记录。

## 7. 地图交互

- 搜索、筛选、列表、地图和 drawer 共享稳定 selection。
- 深链包含 profile、模式、layer、candidate set 和 entity reference；不把临时布局坐标作为永久链接。
- Hover 只作辅助，所有操作可用键盘或明确控件完成。
- 地图必须有等价列表/表格视图，呈现地点、关系、来源和状态。
- Auto-fit 不得在用户手动平移后反复抢夺视口。
- 切换模式时保持可解释上下文；无法保持时明确重置选择。

## 8. 标签与 LOD

标签优先级候选：当前选择、当前路线节点、重要 textual place、筛选命中、其他地点。

- 缩放级别控制 geometry、label 和 media thumbnail 的载入。
- 低缩放只显示聚合或高优先级标签。
- 高缩放按视口加载 detail，不一次创建全部 DOM label。
- 遮挡处理规则必须确定性、可测试。
- 颜色之外必须有 icon/shape/line pattern。

## 9. 技术演进

实现细节以 [MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md](MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md) 为当前推荐。采用双轨制：一张明确标记为艺术演绎的幻想拼接总图负责视觉冲击；原文路线、候选地、现代对照、版本与图像四个权威证据视图负责可追溯结论。

Pilot 复用现有 Leaflet、Supercluster、D3 zoom/selection 和 Canvas 能力。原文拓扑使用 build-time 确定性布局与独立 coordinate space；学术候选使用 Leaflet/GeoJSON；版本书影在 rights-approved 时采用 IIIF/Web Annotation。现有 0–100 React SVG 虚构画布只适合小样本，不作为 1000+ 要素长期承诺。

### 基准级别

- 100 features：验证交互、标签、drawer lookup 与拓扑布局。
- 500 features：验证 payload、Zod parse、DOM、聚类、缩放和筛选延迟。
- 1000+ features：验证主线程、FPS、内存、标签放置和静态包体。

### 技术触发条件

- 中等规模真实候选坐标优先继续 Leaflet/Supercluster。
- 文本拓扑优先 build-time 预计算布局并使用 Canvas；SVG 只保留小样本/测试用途。
- 大量候选面/线达到冻结预算后，再迁移 MapLibre 与 PMTiles/vector tiles。
- 迁移决定必须由 `PERFORMANCE_BUDGETS.md` 的真实基准触发，并记录 decision；不凭偏好提前选型。

## 10. API 与分片边界

Lite payload 只包含首屏可见的节点、关系摘要、聚合计数、layer 状态和必要缩略信息。完整 passage、候选证据和媒体按详情加载。

动态模式候选查询参数：bbox、zoom、layer、candidate set、section、taxonomy filters、locale、cursor/version。

静态模式在数据量需要时按 section、region、entity kind 或 layer 输出版本化分片索引。动态与静态结果必须 schema/count parity。

## 11. 地图资产与权利

- 参考地图逐项进入 `REFERENCE_MAP_AUDIT.md`。
- 参考图必须区分视觉参考、数据来源候选和学术地望主张。
- 权利未知的地图只能内部参考，不打包、不临摹独特图形、不作为数据库证据。
- 新生成的幻想拼接总图必须标记 `artistic_interpretation`，不得从其像素反向提取 topology 或 candidate 数据。
- Derived map 记录输入 candidate set、投影、转换过程、generator version 与 checksum。
- 底图 attribution 在 UI 和 manifest 中均可访问。

## 12. 可访问性与响应式

- 提供完整列表/表格替代。
- 控件有可见 focus 和可读名称。
- 图例不只依赖色觉。
- 390×844、768×1024、1280×800 和宽屏均验证无页面级溢出。
- 移动端地图全宽，筛选与详情使用 sheet/drawer。
- reduced motion 禁用非必要动画；reduced data 可关闭底图与媒体。

## 13. 验证契约

规划命令：`npm run verify:shanhaijing-geography` 与 `npm run benchmark:shanhaijing-map`，当前均未实现。

至少检查：

- edge 均有 passage/source 与合法端点；
- distance/direction 原值完整；
- conflict 未被静默删除；
- candidate 有 claimant、source、confidence 理由；
- GeoJSON 合法且坐标范围正确；
- candidate set 一致且可整套切换；
- derived layout 与历史字段分离；
- API/static parity；
- 100/500/1000+ 基准；
- 键盘、列表替代、图例和响应式。

报告进入 `generated/`，本文不手抄通过数字。

## 14. Gate 0 未决事项

- textual place 和 topology relation 最终枚举；
- 原文里制与方向词的可计算边界；
- candidate set 候选来源与 reviewer；
- 参考地图清单及权利；
- 拓扑布局算法与缓存格式；
- 分片键与 dynamic/static API；
- 地图渲染技术选择；
- 性能预算和设备基线。

## 15. 本文件冻结条件

- Pilot 能表达路线、方向/里距、水流、冲突和至少两个 candidate set。
- 历史地理 reviewer 批准三层边界与 confidence 规则。
- 参考地图审计完成且无权利不明资产进入 public。
- 100/500/1000+ 基准方法与预算冻结。
- 地图、API、数据字典、测试计划使用相同 layer/kind key。
- 相关决策进入 `DECISION_LOG.md`。
