# 无障碍与 reduced-data 报告（首次）

- 日期：2026-08-18
- 证据层级：`built_static_artifact`
- 自动化：`npm test`（`apps/web/src/a11y.test.tsx` 与 `contrast.test.ts`，随 CI 每次运行）
- 人工复核：Chromium，键盘与指针实测

计划中的 `verify:shanhaijing-accessibility` 一直未实现，因此在本轮之前，
39 个地图热点、抽屉与搜索**从未被验证过可否脱离鼠标使用**。

## 1. axe 审计

对真实 `App`（以烘焙 payload 作数据源）在 jsdom 中渲染后运行 axe-core，
门槛为 serious 与 critical **零容忍**。

首跑抓到两处真实缺陷，均已修复：

| 规则 | 影响 | 问题 | 修复 |
|---|---|---|---|
| `aria-allowed-attr` | critical | 搜索框是裸 `searchbox`，却带 `aria-expanded`/`aria-controls`——该属性在此角色上不合法，辅助技术无从得知列表状态 | 改为标准 ARIA combobox：`role="combobox"` + `aria-autocomplete="list"` + `aria-activedescendant` 指向高亮项 |
| `nested-interactive` | serious | 来源列表把 `<a>` 放进 `<summary>`，一个可交互控件套在另一个里面，键盘用户无法确定 Enter 会展开还是跳转 | 标题在 `summary` 中改为纯文本，链接移入展开区 |

修复后：**serious/critical 违规 0 条**。

顺带把搜索结果项从 `<button>` 改为 `role="option"` 的列表项——combobox 模式下焦点应始终留在输入框，
由 `aria-activedescendant` 标记高亮项；嵌在 option 里的按钮既不合法，也提供了第二条互相冲突的焦点路径。

## 2. 键盘实测

| 流程 | 结果 |
|---|---|
| 搜索：输入 → `ArrowDown` 移动高亮 → `Enter` 选中 | 通过（`aria-activedescendant` 由 `search-option-0` 移到 `search-option-1`，Enter 打开对应抽屉并写入深链） |
| 地图热点：`Tab` 可达、`Enter` 打开 | 通过（39 个热点均 `tabindex="0"` 且有描述性 `aria-label`，例：「招摇之山, 鹊山首列起点，临于西海；祝馀、迷谷与狌狌在此。」） |
| 正向 `tabindex` | 无（Tab 顺序跟随文档结构） |
| 标签页 | 4 个 `role="tab"`，任意时刻恰有 1 个 `aria-selected="true"` |
| 无背书声明 | 以 `role="note"` 常驻于无障碍树 |

## 3. 对比度

jsdom 没有布局引擎，无法算对比度，因此单独从 `base.css` 的 token 直接计算 WCAG 比值，
覆盖界面真实使用的 11 组配色 —— 全部达标（正文类 ≥ 4.5:1，装饰性弱文字 ≥ 3:1）。
地图标签另按其近黑描边光晕计算，亦 > 4.5:1。

设计 token 里那句「all pairs ≥ 4.5:1」此前只是注释里的声明；现在它是每次 CI 都会跑的断言。

## 4. reduced-motion 与 reduced-data

- **reduced-motion**：`base.css` 已有 `@media (prefers-reduced-motion: reduce)` 全局压制过渡与动画，本轮复核保留。
- **reduced-data**：本轮**新增实装**。开启省流量偏好时跳过 82 KB 艺术母图，改用同样由拓扑数据绘制的
  结构化替代视图，并在界面上说明这一取舍；拓扑、热点与图例不受影响。
  未知该媒体查询的浏览器一律按"未开启"处理，不做猜测（见 `apps/web/src/prefs.ts` 与 `prefs.test.ts`）。

首屏 105.6 KB（brotli）中母图约占 10 KB，数据 11.8 KB，主 JS 77.6 KB——
省流量模式省下的是母图，真正的大头仍是 bundle，见 `performance-baseline.md`。

## 5. 未覆盖

- 屏幕阅读器实机（VoiceOver / NVDA）朗读顺序未人工走查；本报告只覆盖可自动断言的结构与可操作性。
- 缩放至 200% 的重排、`forced-colors` 高对比模式未测。
- 移动端触屏手势与焦点管理未在真机上验证。
