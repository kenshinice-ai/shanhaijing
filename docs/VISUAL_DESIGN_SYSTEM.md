# 《山海经 Atlas》视觉设计系统

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：真实内容样本、地图基准、设计/无障碍评审及 UI UX Pro Max 审计尚未完成

## 1. 设计目标

《山海经 Atlas》首先是持续探索和核验文本证据的工作区，不是营销 landing page，也不是仿古画卷。视觉系统必须同时支持原文阅读、大地图、候选地比较、多轴筛选、媒体审阅和移动端使用。

原则：

- 文本、证据和不确定性优先于装饰；
- 领域气质来自排版、符号和内容，不来自大面积仿纸纹理；
- 地图是首屏主要工作区；
- 相同状态跨地图、列表、时间轴和 drawer 使用一致语义；
- 颜色只提供冗余提示，不承担唯一编码；
- 中英文都须在固定容器内完整可读。

## 2. 与现有 Atlas 的关系

可复用：

- CSS custom properties 的 profile theme 机制；
- drawer shell、全局搜索、focus-visible、screen-reader-only 基础；
- 地图、时间轴、关系图、列表共用状态 token 的思路；
- 离线安全字体 fallback；
- 已有 responsive breakpoint 作为测试输入。

不得直接继承为最终规范：

- 当前 profile 的领域硬编码；
- 连续按 viewport 缩放的标题字号；
- 以装饰性径向渐变塑造页面背景；
- 大于 8px 的通用卡片圆角；
- 将现有暗色主题的具体颜色视为已通过《山海经》内容评审。

实现时新增 `data-profile="shanhaijing"` token 覆盖，不重写其他 profile。

## 3. 首屏构图

### 桌面

初始比例候选为约 61.8% 地图 / 38.2% 知识工作区，仅作布局起点：

- 顶部：品牌、全局搜索、语言、地图模式、时间轴模式和辅助设置；
- 主区：地图明显大于侧栏；
- 侧栏：单层 tab/筛选/列表，不把页面 section 包成浮动卡片；
- 时间/篇章导航：置于地图下方或与主区共用稳定 track；
- drawer：覆盖或推移知识区，避免把地图压缩到不可用宽度。

在 1280×800 首屏需显示地图、主要控制与下一内容区线索，不使用巨大 hero 标题占据工作空间。

### 移动端

- 单列全宽地图；
- 列表与详情使用底部 sheet/drawer；
- 地图与 sheet 均有明确拖动/关闭控制及可访问名称；
- 不强制 61.8/38.2；
- 固定控件避开 safe area；
- 不出现页面级横向滚动。

## 4. 网格与间距

基础 4px 网格，推荐 token：

| token | 候选值 | 用途 |
|---|---:|---|
| `space-1` | 4px | 紧密图标/标签间隙 |
| `space-2` | 8px | 控件内部与紧密列表 |
| `space-3` | 12px | 常规控件间距 |
| `space-4` | 16px | panel 内部间距 |
| `space-6` | 24px | 主区域分隔 |
| `space-8` | 32px | 宽屏节奏 |

规则：

- 卡片仅用于重复项目、modal 与真正有边界的工具；
- 不允许卡片嵌套卡片；
- page section 为无框布局或全宽 band；
- 通用卡片圆角最大 8px；icon button 可为圆形；
- 地图、toolbar、tile 和图标定义稳定尺寸，内容变化不导致布局跳动。

## 5. 色彩系统

候选 palette 必须经实际组件与地图底图对比测试后冻结。颜色角色而非具体色值先冻结：

| 角色 | 候选方向 | 语义 |
|---|---|---|
| background/surface | 中性炭墨或低彩灰 | 主工作区与 panel |
| primary text | 高对比冷白/近白 | 正文和控制 |
| mountain | 克制山林绿 | 山系、陆地拓扑 |
| water | 青蓝 | 水系、海、泽 |
| selection/focus | 明亮金黄 | 选择和键盘 focus |
| warning/dispute | 朱红 | 冲突、阻断、rights denied |
| scholarly sets | 多组可辨辅助色 | 候选集比较 |
| artistic | 独立紫灰或品红候选 | 艺术演绎，不能与研究 claim 混用 |

禁止：

- 单一绿、米棕、暗蓝或紫蓝统治全站；
- 用“仿古黄色”表示全部内容；
- 仅凭透明度表示 confidence；
- 用同一颜色同时表示 selection、confidence 和 rights；
- 无边界的渐变光斑作为背景装饰。

正文与常规控件达到 WCAG AA。地图符号在浅/深底图均须有轮廓或 halo，并以形状/线型/纹理冗余编码。

## 6. 排版

- 默认中文：清晰的系统 sans 用于 UI；可读 serif 仅用于标题、短引文和展示性名称。
- 英文：与中文 x-height 和字重协调的离线 fallback。
- 原文引文与现代编辑说明在样式上可辨，但不使用极低对比或小字号区分。
- 字号使用离散 token，不按 viewport width 连续缩放。
- letter-spacing 为 0；仅语言惯例明确要求时例外并单独评审。
- panel、drawer、toolbar 使用紧凑标题，不使用 hero 尺寸。
- 长名称允许换行；按钮命令优先短标签，不能截断关键语义。

候选字号：12/14/16/18/22/28/36px；在真实中英文长词测试后冻结。

## 7. 地图视觉层级

显示顺序候选：

1. basemap；
2. textual topology；
3. candidate set geometry；
4. occurrence/creature symbols；
5. active route/selection；
6. labels、tooltip 与 controls。

### 三层语义

- textual topology：实线/稳定节点形状，布局坐标不得像真实坐标；
- scholarly candidates：candidate-set 色与独立形状，confidence 使用线型/纹理/label；
- modern basemap：作为参照降低视觉权重，并显示来源入口。

### 标签和 LOD

- label priority 由 section、selection、importance 与 zoom 决定；
- 不以遮挡方式强行显示所有标签；
- cluster 显示 occurrence 数，并可追溯列表；
- selected 项不因聚类消失；
- 100/500/1000+ 基准决定 SVG、Canvas/WebGL 或 vector tile 演进。

图例在所有地图模式可访问且可展开；模式切换同时更新标题、图例、说明和数据来源。

## 8. 图标与控制

- 通用操作使用项目已启用 icon library 中的标准图标；没有库时先评估再引入，禁止复制零散 SVG。
- icon-only button 必须有 tooltip、accessible name、44×44px 最小触控目标候选。
- 模式选择使用 segmented control 或 tabs；binary 设置使用 switch/checkbox；数量/范围使用 input、stepper 或 slider。
- 文字按钮保留给清晰命令，如“应用筛选”“查看原文”。
- 异兽/山水领域图标遵循 `MEDIA_ICON_ILLUSTRATION_POLICY.md` 和独立 registry，不与操作图标混用。

## 9. 状态系统

每类交互需定义：default、hover、focus-visible、selected、disabled、loading、error、empty、rights-denied、offline/static-unavailable。

数据状态另行显示：

- unresolved/editorial pending；
- disputed/conflicting claims；
- undated/unknown location；
- unpublished translation；
- media absent；
- reduced-data placeholder。

“无媒体”是正常内容状态，不得显示为系统错误。

## 10. 响应式基线

必须验证：

- 390×844；
- 768×1024；
- 1280×800；
- 至少一个 1440px 以上宽屏。

验证项：

- 页面无横向溢出；
- toolbar 可换行或进入 menu；
- 所有文本不覆盖前后内容；
- 地图保留可交互最小高度；
- drawer/sheet 可关闭且 focus 正确返回；
- 图例、搜索结果和 tooltip 不超出 viewport；
- 触控与键盘流程等价。

## 11. 无障碍

- 正文和控件 WCAG AA；
- 可见 focus；
- 跳转到地图替代列表的 skip link；
- 地图内容有表格/列表替代；
- 颜色编码有形状、线型或文字冗余；
- 图片有双语 alt/caption；
- 音频有文字描述/transcript 和独立静音控制；
- `prefers-reduced-motion` 停止非必要动画；
- reduced-data 不自动加载大图和音频；
- screen reader 的状态更新使用克制的 live region；
- focus order 与视觉顺序一致。

## 12. 动效和反馈

- 默认过渡候选 120–200ms；
- 只为状态连续性使用，不做持续漂浮、视差或背景动画；
- 地图 auto-fit 尊重用户手动视图，避免每次筛选强制跳动；
- loading 使用稳定占位，避免 layout shift；
- reduced motion 下取消平滑 fly-to、drawer 滑动和无必要旋转。

## 13. UI UX Pro Max 状态

当前状态：`待审查/待安装`，没有安装证据，不得声称已采用。

Gate 0 审查需记录：

- repository URL、commit/tag 和获取日期；
- licence；
- 安装文件与依赖；
- 是否写入项目级 `.claude/skills/ui-ux-pro-max`；
- 采用、修改和拒绝的规则；
- 与本规范冲突时以本规范、领域语义和可访问性测试为准。

该工具只能辅助设计评审，不能替代内容、版权、地图和无障碍判断。

## 14. 浏览器验证契约

UI 实现后使用 preview 工具验证：

- console/server/network 无相关错误；
- snapshot 核对文字、role、结构和状态；
- inspect 核对颜色、字号、间距、尺寸与 overflow；
- click/fill 验证搜索、筛选、tabs、drawer 和音频；
- resize 验证四类 viewport；
- screenshot 作为视觉证据，不替代精确检查。

动态 API 与 static artifact 都需走同一主要旅程。

## 15. Gate 0 未决事项

- 最终 palette 和 light/dark/basemap 组合；
- 首屏 panel 与 timeline 的具体布置；
- 字体 token 与古文引文样式；
- candidate set 可区分颜色/形状上限；
- map icon 视觉语言；
- mobile sheet 行为；
- reduced-data 默认策略；
- UI UX Pro Max 是否审查并项目级安装；
- 设计与无障碍 reviewer。

## 16. 本文件冻结条件

- 使用真实 Pilot 文本、长名称、空状态、争议项和媒体样本完成组件稿。
- palette 对比和地图符号在浅/深背景测试通过。
- 四类 viewport 无溢出、重叠和不可关闭层。
- 键盘、screen reader、reduced motion/data 流程获评审。
- 设计 token、组件状态和实现测试使用同一命名。
- 采用/拒绝决定写入 `DECISION_LOG.md`，方可标记 `frozen`。
