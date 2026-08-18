# 《山海经 Atlas》性能预算

- 文档状态：`review_ready`
- 阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 上游规范：[ARCHITECTURE.md](ARCHITECTURE.md)、[API_CONTRACT.md](API_CONTRACT.md)、[GEOGRAPHY_AND_MAPS.md](GEOGRAPHY_AND_MAPS.md)、[VISUAL_DESIGN_SYSTEM.md](VISUAL_DESIGN_SYSTEM.md)、[ASSET_MANIFEST_SPEC.md](ASSET_MANIFEST_SPEC.md)
- 当前阻断：Pilot fixture、设备/网络矩阵、基线报告、观测 harness、首屏边界、静态分片和 reviewers 尚未冻结

> 本文件定义候选测量方法、预算维度、阻断语义和技术演进触发器，不证明任何《山海经》bundle、payload、地图、媒体或用户旅程已经被测量或通过。所有数值在标为 `frozen` 且有可复现报告前，只能称为候选预算。

## 1. 目的与原则

性能是发布正确性的一部分：超大 payload、阻塞解析、无法平移的地图、内存失控或媒体抢占带宽都会使证据不可访问。本规范用可重复的 100/500/1000+ fixture 和真实用户旅程约束 bundle、网络、解析、渲染、交互、内存与媒体。

原则：

1. **先测基线，再冻结预算**：不把蓝图中的初始候选值写成通过结果。
2. **按阶段和设备报告分布**：至少报告 median、p75、p95 和 worst；不只写一次最快结果。
3. **冷启动与暖交互分开**：首次访问、缓存命中、已加载视口、partition miss 不混算。
4. **主线程、网络和视觉流畅度分开**：单一“加载时间”不能代表全部风险。
5. **point、line、polygon 和 topology 分开**：相同 feature 数不代表相同成本。
6. **动态与静态都测**：二者共享预算目标，但分别记录传输、缓存和解析证据。
7. **可访问 fallback 也在预算内**：列表/表格不能因地图优化而退化为不可用全量 DOM。
8. **媒体懒加载不等于无预算**：首屏、drawer 首开、音频首次播放和整包分别核算。
9. **超限默认阻断**：只能由书面、限时、有 owner 的豁免解除，不能移动统计口径。
10. **技术选型由报告触发**：SVG、Canvas/WebGL、MapLibre/vector tiles 或 worker 的迁移必须对应明确越界。

## 2. 当前基线与证据边界

截至本文创建时，可观察的仓库机制包括：

- 真实坐标地图使用 Leaflet 与 Supercluster，在客户端建立聚类索引；
- fictional map 使用 0–100 viewBox 的 React SVG，并逐个渲染地点和标签；
- relation graph 使用 Canvas；
-实体列表使用虚拟化；
- drawer 图像使用 `loading="lazy"`，音频使用 `preload="none"`；
- 现有 static bake 以每 work/locale 单一 full Atlas JSON 为主；
- 尚无 Shanhaijing viewport endpoint、partition manifest、performance fixture 或 benchmark 命令。

核心蓝图记录现有主 JS 曾约为 666 KiB，但本文未重新生成并核对该 artifact。该数字仅是回归风险线索，不是当前 raw/gzip/brotli 基线，也不是冻结上限。Phase 0 必须在保留当前 dirty worktree 的前提下，以明确 commit/worktree state、profile、build command 和 checksum 重新生成基线。

## 3. 预算状态与判定

每个指标使用以下状态：

| 状态 | 含义 | 发布行为 |
|---|---|---|
| `candidate` | 待 Pilot/基线验证的初值 | 不可宣称通过 |
| `frozen` | 方法、fixture、阈值和 reviewer 已批准 | 作为 gate |
| `pass` | 当前 artifact 在冻结方法下通过 | 可作为对应证据层输入 |
| `warn` | 达到警戒线但未越过阻断线 | 需记录趋势与 owner |
| `fail` | 越过冻结阻断线或证据不完整 | 阻断晋级/发布 |
| `waived` | 有时限、有范围、有 owner 的批准豁免 | 不等同 pass |
| `not_measured` | 未执行或 harness 不可用 | 不得推断 pass |

预算至少定义：target、warning、blocking 三档。若只冻结 blocking，可先运行，但必须在 Gate 0 记录为何暂缺 target/warning。测试噪声不得通过放宽阈值处理，应先固定环境、增加重复次数并报告置信区间或离散程度。

## 4. 标准测试矩阵

### 4.1 Feature 规模

每种地图 fixture 至少包含：

| 规模 | 目的 | 不代表 |
|---|---|---|
| 100 | Pilot 交互、标签、选择、drawer lookup、拓扑布局 | 可扩展结论 |
| 500 | payload、Zod parse、聚类、筛选、DOM/绘制和标签压力 | 全语料上限 |
| 1000+ | 主线程、FPS、内存、分片、LOD、静态包体和长期渲染器决策 | 只需恰好 1000 |

`1000+` 必须至少包含冻结语料候选规模和一个高于预期规模的压力档；具体数量在 corpus inventory 后决定。不得把抽样 1000 项称为全量测试。

### 4.2 Geometry/内容形状

feature 数相同也必须分别测：

- WGS84 points；
- lines，记录 vertex 总数与分布；
- polygons/multipolygons，记录 rings、vertices 和简化级别；
- textual topology nodes/edges；
- mixed candidate-set viewport；
- label-heavy worst case；
- taxonomy/filter-heavy worst case；
- 双语中字符串较长的 locale；
- 媒体摘要有/无两种 payload。

fixture 必须可确定性生成或从冻结、可发布 Pilot 导出，保存 schema version、seed/source revision、counts、geometry complexity、字符串字节和 SHA-256。不得用随机分布掩盖真实聚集、重叠或长标签。

### 4.3 用户旅程

至少测量：

1. 冷启动进入默认 Shanhaijing workspace；
2. lite Atlas 获取、解压、JSON parse、Zod validation、state derivation 和首个可交互地图；
3. 地图模式切换；
4. 已加载视口平移/缩放；
5. 未加载 partition 的平移/缩放；
6. candidate set 切换与差异模式；
7. taxonomy 多条件筛选；
8. 搜索输入、结果返回、选中与 drawer 首开；
9. concept 与 occurrence 往返；
10. 四轴时间模式切换；
11. drawer 图像首开与 gallery 后续项；
12. 音频首次主动播放；
13. locale 切换；
14. static 模式同等旅程；
15. 键盘和列表/表格 fallback。

每个旅程定义开始/结束 mark、成功条件和超时。失败、空白画布、缺数据或错误响应不能作为更快样本计入。

## 5. 设备、浏览器与网络

冻结矩阵至少包括：

- 一台代表目标读者的中档移动设备或经校准的等效环境；
- 一台中档桌面/笔记本；
- 一台低性能或 reduced-data 风险设备；
- Chrome/Chromium、Safari/WebKit，以及产品支持策略要求的其他浏览器；
- 390×844、768×1024、1280×800 和宽屏 viewport；
- cold cache、warm cache；
- Wi-Fi/宽带候选和受控移动网络候选；
- `prefers-reduced-motion`、reduced-data、音频禁用等模式。

必须记录硬件、OS、browser/version、CPU/memory、devicePixelRatio、viewport、power mode、thermal state、network shaping、后台进程约束和测量工具。CI 虚拟机可做回归 gate，但不能替代至少一次真实设备审计。

## 6. Bundle 与静态资产预算

### 6.1 计量范围

按 profile 构建并分别记录：

- HTML、关键 CSS；
- entry JS；
- 首屏同步 chunks；
- 地图/搜索/drawer/timeline/audio 的异步 chunks；
- fonts；
- 首屏图像/icon/map assets；
- static data index 与默认 partitions；
- source maps（必须确认不进入生产公开预算/泄漏边界）。

每项同时报告 raw、gzip 和 brotli bytes，以及文件 checksum。禁止只报告 Vite warning 或 raw 文件大小。

### 6.2 初始候选纪律

蓝图提出“交互首屏 gzip JS 不继续显著放大约 666 KiB 旧主包”作为风险方向。Gate 0 应把它转换为：

- 当前各 profile 可复现 baseline；
- Shanhaijing profile 的首屏同步 JS blocking 值；
- shared Atlas Core regression allowance；
- domain chunks 的按需加载上限；
- 超限时必须拆分的 ownership。

在 baseline 未生成前，本文件不伪造具体 KiB 上限。Shanhaijing 新功能不得通过把代码移到一个仍在首屏加载的“异步”chunk 来规避预算。

### 6.3 阻断条件

以下任一情况默认 fail：

- 未记录压缩方式和首屏依赖图；
- Shanhaijing 代码进入其他 profile 首屏且导致冻结回归超限；
- 未使用的地图、声音或编辑器依赖进入首屏；
- source master、reference map、denied asset 或 source map 被打包；
- 单个 full JSON 为保持旧 bake 形式而越过 payload/parse/memory 预算；
- 字体或媒体在首屏无条件下载；
- build report 与实际 network transfer 无法对齐。

## 7. API 与 Static Payload 预算

分别测量 Works、Atlas lite、entity detail、search、map partition/viewport、sound metadata、manifest/index。每个 endpoint/artifact 记录：

- status/cache path；
- item/feature/count；
- raw/gzip/brotli bytes；
- server time 或 static fetch time；
- transfer time；
- JSON parse；
- Zod validation；
- publication derivation/client normalization；
- peak incremental memory；
- cache hit/miss；
- request/partition 数和重复 bytes。

候选原则：

- lite 只承担首屏导航、摘要、可见地图数据和索引；
- detail 按需获取，不把所有 passage/media/sound 细节塞回 lite；
- search 有分页/截断元数据，不靠固定巨大结果集；
- map 按 viewport/partition/LOD 传输，不为 1000+ 全量一律返回完整 GeoJSON；
- static artifacts 与 dynamic response 共享 schema 和预算口径；
- 缺 partition 与 valid empty 必须可区分。

核心蓝图中的 “lite Atlas Zod parse p95 < 150 ms” 是待验证候选值。最终预算需按设备档分别冻结；桌面通过不能替代移动端通过。

## 8. 服务端与生成时预算

动态 API 至少测：

- request p50/p75/p95/p99；
- database/query time 和 query count；
- serialization、compression、publication filtering；
- concurrent requests 下的 error rate 和 saturation；
- cold/warm cache；
- bbox、candidate set、taxonomy filters 与 locale 的代表组合；
- canceled/aborted request 是否释放资源。

static bake 至少测：

- 总 wall time、CPU time 和 peak RSS；
- 每 locale/profile/partition 的生成时间；
- artifact 数、总 raw/compressed bytes；
- manifest/checksum/verifier 时间；
- 增量 rebuild 的 invalidation 范围；
- deterministic rerun checksum parity。

具体并发数、数据库规模、CI timeout 和 bake blocking 值在 isolated DB fixture 后冻结。不得对未建立的生产容量做吞吐承诺。

## 9. Parse、Validation 与状态派生

网络完成后单独标记：

1. decompression（工具可观测时）；
2. `response.json()`/JSON parse；
3. Zod schema validation；
4. locale/publication normalization；
5. indexes、Supercluster/topology lookup 和 taxonomy maps 建立；
6. React state commit；
7. 首次绘制与可交互。

不得把 parse、validation 和 derivation 合并成不可诊断的“fetch duration”。每个阶段报告 p95 和 worst，并记录输入 bytes/items。

任何为通过预算而跳过 runtime validation 的决定必须有等价边界验证、风险分析和 reviewer；不能静默移除 Zod。可评估 worker、streaming、partition 或预计算，但必须保留错误可诊断性和 dynamic/static parity。

## 10. 地图渲染与交互预算

### 10.1 必测指标

- initial map ready；
- mode/candidate/filter switch latency；
- pan/zoom input latency；
- animation frame duration、FPS 和 dropped-frame ratio；
- long tasks 数量、总时长和最大值；
- main-thread busy time；
- DOM/SVG node count；
- Canvas/WebGL draw calls/objects（适用时）；
- cluster/index/layout build time；
- label placement time、显示数和碰撞/截断结果；
- heap baseline、峰值、操作后 retained growth；
- partition requests、aborts、cache hits 和 stale result suppression。

蓝图提出地图切换 p95 < 200 ms、已加载视口平移约 50+ FPS、移动端长任务 < 200 ms，均为 `candidate`。冻结时应避免只用平均 FPS：至少同时约束 p95 frame duration、dropped frames 和 input responsiveness。

### 10.2 冷/暖场景

- **Cold map**：代码、数据、字体/图标均未缓存；
- **Warm code/cold data**：组件 chunk 已加载，partition 未加载；
- **Warm viewport**：当前及邻近 partition 已加载；
- **Stress interaction**：连续 pan/zoom/filter，验证 abort、去抖和旧响应；
- **Return visit**：drawer/其他 tab 返回地图，验证状态恢复和内存。

“已加载视口平移”预算不能用于声称首次进入地图通过。

### 10.3 渲染器演进触发器

保留 Leaflet/Supercluster 的条件：中等规模 WGS84 point/有限 geometry 在冻结预算内，且无障碍 fallback 完整。

预计算 topology + Canvas/WebGL 的评估触发：React SVG 在 500 或 1000+ fixture 的 node count、switch、frame、long task 或 memory 任一阻断；迁移前仍须证明文本标签、选择、键盘和表格 fallback。

MapLibre/vector tiles 的评估触发：大量 line/polygon/candidate set 通过 partition、简化和 Leaflet 优化仍无法满足 payload、memory 或 frame 预算，或服务端 viewport contract 已稳定。不得只因地图看起来复杂而提前引入。

worker 的评估触发：cluster、topology layout、parse/validation 或 filter derivation造成冻结长任务/INP 越界，且 partition/预计算不足以解决。

每次迁移决策记录基准报告、失败指标、替代方案、可访问性、bundle 影响、回滚方式和 owner 至 [DECISION_LOG.md](DECISION_LOG.md)。

## 11. DOM、列表、Drawer、图谱与时间轴

即使列表已使用虚拟化，也必须测：

- mount/update DOM node count；
- 100/500/1000+ 行滚动 FPS、focus 保持和 screen-reader 可用性；
- filter 后 virtualizer 尺寸重算；
- drawer 首开、detail fetch、内容 layout 和关闭/重开；
- gallery lazy decode 与 layout shift；
- relation graph 的 node/edge 规模、layout、Canvas draw 和 table fallback；
- 四轴 timeline 的 item/lane 数、碰撞布局、模式切换和横向滚动；
- locale 切换后的长文本重排。

禁止通过把 1000+ 可访问 fallback 一次性渲染为隐藏 DOM 来满足“有表格”要求。需要分页、虚拟化或分区，但键盘、语义和可发现性必须保留。

## 12. Web Vitals 与响应性

候选用户体验指标包括：

- LCP；
- INP；
- CLS；
- TTFB（动态/静态分别）；
- first content/workspace render；
- time to atlas interactive；
- long tasks 和 total blocking time（实验室辅助）。

最终 target/warning/blocking 值应参考当时稳定 Web 标准，并结合产品旅程在真实设备冻结。本文件不将通用“good”阈值自动视为 Atlas 已通过；地图 ready、筛选、drawer 和播放等领域指标仍须单独达标。

CLS 必须覆盖地图/字体/图片加载、drawer 打开和 locale 切换。canvas/SVG 非空但无可用数据不算 LCP/ready 成功。

## 13. 内存与资源生命周期

每个 100/500/1000+ 场景记录：

- navigation baseline heap；
- Atlas data/indices 加载后 heap；
- 地图交互峰值；
- 连续十次模式/候选/locale 切换后的 retained heap；
- drawer/gallery/audio 打开关闭后的 retained heap；
- detached DOM、event listener、Web Audio node、object URL 和 tile/partition cache；
- page hidden/return 后的恢复。

预算必须包含绝对峰值和相对增长两类。若浏览器无法可靠读取精确 heap，使用同一工具/环境的相对回归，并明确 `measurement_limited`，不得填造数字。

cache 需定义最大 entries/bytes、eviction、revision invalidation 和 profile/locale isolation。rights withdrawal 必须能跳过或清除旧 cache；性能优化不能延长 denied asset 可访问时间。

## 14. 媒体预算

按 [ASSET_MANIFEST_SPEC.md](ASSET_MANIFEST_SPEC.md) 的 role/profile 分别冻结：

- 单个 map icon 与 icon atlas；
- thumbnail、drawer image、gallery image、folio、derived map；
- creature vocalization、ambience、ritual、narration；
- waveform；
- 首屏媒体总 bytes；
- drawer 首开总 bytes；
- 每个页面/旅程累计 bytes；
- 每 release media 总 bytes。

每项记录 raw 文件 bytes、实际 transfer bytes、decode time、decode memory、render dimensions 和 cache behavior。图片必须避免下载远大于实际显示尺寸的 profile；音频保持显式播放和 `preload="none"` 候选基线，未点击时不得下载完整音频。

reduced-data 模式至少：

- 不预取 drawer 大图、gallery 后续项、音频或高分辨率地图；
- 优先 text/list、低字节 icon 和必要 partition；
- 保留明确的按需加载命令；
- 不因资源降级隐藏来源、解释或权利文本。

具体格式、尺寸、duration、LUFS 与字节阈值在真实编码质量评审后冻结，不直接继承 music 资产预算。

## 15. Static Artifact、缓存与 CDN

static 模式至少验证：

- index/manifest 首取和缓存策略；
- immutable versioned partition 长缓存；
- publication manifest/withdrawal 的短缓存或主动失效；
- locale/profile/version 不串缓存；
- deep link 仅加载所需 detail/partition；
- stale service worker/browser/CDN cache 的更新路径；
- partition request waterfall 与并发上限；
- static/dynamic 相同旅程的 bytes/parse/interaction parity。

性能预算不能以无限长缓存掩盖冷启动，也不能因追求 cache hit 破坏 rights withdrawal。CDN purge SLA、manifest TTL 和 rollback artifact retention 必须与 release/rights policy 联合冻结。

## 16. 测量 Harness 与报告

计划命令（当前未实现）：

- `npm run benchmark:shanhaijing-map`
- 可拆分 `benchmark:shanhaijing-web`、`benchmark:shanhaijing-api`、`benchmark:shanhaijing-static`；具体命令在 test plan 冻结。

Harness 应：

- 固定 fixture、seed、profile、locale、viewport、browser 和 runs；
- 清楚区分 warmup 与计入统计的 runs；
- 使用 User Timing marks 对齐 fetch/parse/validate/derive/render/interactive；
- 采集 network、trace、Web Vitals、long tasks、frames、DOM 和 memory；
- 对失败 journey 记 fail，不删除慢样本；
- 输出原始 machine-readable samples 与汇总；
- 与 baseline 按相同环境比较；
- 对 nondeterminism、thermal throttling、GC 和 observer support 标注限制。

CI 可运行较小 deterministic regression suite；1000+、真实移动设备、Safari、媒体 decode 和长时间内存测试可以独立运行，但 release checklist 必须引用最近有效报告。

## 17. 报告格式与证据

输出放在 `docs/shanhaijing/generated/`，候选文件：

```text
performance-baseline.<profile>.<report-version>.json
performance-baseline.<profile>.<report-version>.md
performance-map.<fixture-version>.<report-version>.json
performance-map.<fixture-version>.<report-version>.md
```

每份报告至少记录：

- evidence level；
- source revision、dirty-worktree fingerprint 或隔离 worktree identity；
- build/artifact/fixture checksums；
- command、harness/version、runs 和 timestamps；
- 设备、OS、browser、viewport、network/cache/power 条件；
- 每指标单位、样本数、median/p75/p95/worst；
- target/warning/blocking 版本；
- pass/warn/fail/not_measured/waived；
- errors、excluded runs 及原因；
- regression delta；
- artifact links、owner 和下一动作；
- report checksum。

Markdown 汇总由 JSON 生成，禁止人工改统计区。截图可证明视觉状态，但不能替代 trace、network、DOM、memory 或精确 timing。local 报告不得称为 staging/production RUM。

## 18. 回归 Gate

实施后候选 gate 层级：

1. PR/本地：bundle diff、fixture schema、100/500 smoke、关键 journey timing；
2. isolated DB：动态 API/query/serialization、100/500/1000+ 数据；
3. built static artifact：真实 chunks、compressed bytes、partition 和 static journeys；
4. staging：目标浏览器/设备、cache/CDN、长时间交互和媒体；
5. production：单独授权后的 smoke 与受隐私约束的聚合观测。

任何层级失败不得由较低层级 PASS 覆盖。性能报告通过也不证明内容、rights、可访问性或功能正确；它们由 [TEST_AND_VERIFICATION_PLAN.md](TEST_AND_VERIFICATION_PLAN.md) 的联合矩阵裁决。

## 19. 豁免纪律

每个 `waived` 必须记录：

- metric、fixture、设备和超限幅度；
- 用户影响和为何当前仍可发布；
- 不能立即修复的证据；
- 临时缓解；
- owner；
- 到期日期或触发条件；
- 最大适用 artifact/publication revision；
- reviewer/approver；
- follow-up issue/decision reference；
- rollback/disable path。

豁免不得无限期、不得覆盖 missing measurement、不得把 blocking threshold 改名为 warning，也不得跨 staging 自动继承到 production。相同指标连续豁免必须升级评审。

## 20. 阻断规则

以下任一情况使相应 Gate 保持 `blocked`：

- fixture、设备、browser、network、runs 或 marks 未冻结；
- 只报告平均值、最佳值或截图；
- 基线与候选使用不同环境却直接比较；
- 100/500/1000+ 未按 geometry complexity 分层；
- journey 功能失败却仍计性能 PASS；
- bundle/payload 缺 raw 与 compressed bytes；
- parse、Zod、derive 和 render 无法区分；
- 地图 switch/pan/filter 越过冻结阻断线；
- 长任务、memory retained growth、DOM 或媒体越界；
- static full artifact 为规避分片而放宽预算；
- reduced-data、移动端或可访问 fallback 未测；
- denied/source asset 因优化进入 build/cache；
- 报告不是当前 artifact/revision，或 checksum 不一致；
- 无批准豁免仍越界。

## 21. Gate 0 候选预算清单

Gate 0 必须为下列指标冻结具体 target/warning/blocking，或记录有 owner 的延后决定：

| 类别 | 至少冻结的指标 |
|---|---|
| Bundle | 首屏同步 JS/CSS/fonts、domain chunks、其他 profile 回归 |
| Payload | Works、lite、detail、search、map、sound、manifest raw/compressed bytes |
| Parse | JSON parse、Zod validation、derivation p95/worst |
| Network | request 数、waterfall、cold/warm transfer、partition duplication |
| API | p95/p99、query count/time、serialization、error rate |
| Map | ready、switch、pan/zoom、filter、FPS/frame、long tasks、labels |
| DOM | initial/peak nodes、virtual list、fallback table |
| Memory | peak heap、retained growth、cache bounds |
| Web Vitals | LCP、INP、CLS、TTFB 及 Atlas-specific ready |
| Media | 单文件、首屏、drawer、音频首次播放、总 release bytes/decode |
| Bake | time、peak RSS、artifact count/bytes、determinism |
| Withdrawal | cache invalidation/CDN purge 的性能与最大暴露窗口 |

初始候选方向来自核心蓝图：地图切换 p95 < 200 ms、已加载视口约 50+ FPS、移动端单个长任务 < 200 ms、lite Zod parse p95 < 150 ms，以及首屏 gzip JS 不显著放大重测后的现有基线。这些均需通过 Phase 0 baseline/Pilot 修改或确认后才能成为 `frozen`。

## 22. Gate 0 未决事项

- 支持设备、浏览器、viewport 与网络矩阵；
- corpus-derived 100/500/1000+ fixture 和 stress 档；
- point/line/polygon/topology complexity 分布；
- baseline build/profile/commit/worktree evidence；
- User Timing marks、trace、FPS、memory 与 Web Vitals 工具；
- target/warning/blocking 具体数值；
- lite/full/detail/partition 字段与 bytes 边界；
- static partition、prefetch、cache 和 invalidation；
- SVG、Canvas/WebGL、Leaflet、MapLibre/vector tile 触发器的最终阈值；
- image/icon/map/audio/waveform profiles 和预算；
- CI 与真实设备测试分工；
- Safari/WebKit 自动化与手测方式；
- production RUM 的隐私、采样、保留和告警边界；
- performance reviewer、accessibility reviewer 和批准豁免人。

## 23. 本文件冻结条件

只有同时满足以下条件，本文才可从 `draft` 改为 `frozen`：

- 当前 Atlas 各 profile baseline 以可复现 build 和 checksums 生成；
- 100/500/1000+ 及 stress fixtures 冻结并可确定性重建；
- 设备、浏览器、viewport、network、cache 和 runs 矩阵获批准；
- bundle、payload、parse、API、map、DOM、memory、Web Vitals、media 和 bake 的 target/warning/blocking 均冻结；
- benchmark harness 证明能捕获故意注入的 bundle、long task、memory、DOM、payload 和 media 超限；
- dynamic/static 旅程使用同一成功条件并可对比；
- reduced-data、移动端和可访问 fallback 纳入矩阵；
- 渲染器、partition、worker 和 vector tile 的演进触发器获 architecture/performance/accessibility review；
- 豁免 schema、审批人、到期和升级规则写入 [DECISION_LOG.md](DECISION_LOG.md)；
- [TEST_AND_VERIFICATION_PLAN.md](TEST_AND_VERIFICATION_PLAN.md) 引用实际命令、fixtures 和报告；
- [HANDOFF.md](HANDOFF.md) 只引用生成统计和 checksum；
- Gate 0 其他停止条件全部解除。

在这些条件满足前，Gate 0 保持 `blocked`。100/500/1000+ 只是待执行的基准规模，任何候选阈值、旧 bundle 数字或单次本地测量都不得写成性能通过证据。
