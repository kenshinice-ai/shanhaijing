# 《山海经 Atlas》风险登记

- 状态：`review_ready`
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前 Gate：`Phase 0 / Gate 0 blocked`

概率与影响使用 `low` / `medium` / `high` / `critical`。风险关闭必须有报告或决定记录；`waived` 必须有批准者、范围、理由、到期时间和 remediation。

| Risk ID | 风险 | 概率 | 影响 | 触发器 | 缓解/下一检查 | owner | 状态 |
|---|---|---|---|---|---|---|---|
| SJ-R001 | 底本、版本或段落切分未冻结，coverage 不可比较 | high | critical | 输入版本或 segmentation 变化 | 冻结 edition、passage inventory、checksum；运行 corpus verifier | 古籍编辑 | open |
| SJ-R002 | occurrence 与 concept 被混为单一名物数量 | high | high | API 或报告只输出“异兽总数” | 分离三项统计并加入 completeness test | 数据编辑 | open |
| SJ-R003 | 同名异物/异名同物没有 editorial decision | high | high | concept mapping 无理由或来源 | 每次归并/拆分关联 decision、passage 和 reviewer | 古籍编辑 | open |
| SJ-R004 | 现代坐标被误读为古代地望定论 | medium | critical | UI 省略 geography layer 或 confidence | 艺术总览与四类证据视图分离；candidate set、图例和字段级来源 | `R-GEO` | open |
| SJ-R005 | 多轴 taxonomy 被实现为单选树 | medium | high | 复合实体或未定项无法表达 | axis/term 多值 assignment，保留 unknown 和 evidence | 内容模型 owner | open |
| SJ-R006 | registry 漏接 kind 导致 search/drawer/media/bake 静默缺口 | medium | critical | 新 kind 缺少 required cell | registry completeness contract + 构建失败测试 | Atlas Core owner | open |
| SJ-R007 | 未核权或 provenance 不全的媒体进入发布路径 | medium | critical | rights 为 pending/unknown 仍暴露 URL | manifest verifier fail closed；撤回并检查 build/precache/CDN | 媒体/版权 owner | open |
| SJ-R008 | 声音推演被描述成真实录音或确定复原 | medium | high | UI 缺少 interpretation/disclaimer/transcript | 三等级披露、显式单轨、音频 verifier 和专家审查 | 声学 owner | open |
| SJ-R009 | 100/500/1000+ 地图规模超过移动端性能预算 | medium | high | payload、长任务、FPS 或内存超限 | Phase 0 baseline；partition/LOD/cluster/renderer 决策并记录豁免 | 性能 owner | open |
| SJ-R010 | 双语 fallback 掩盖未审核或未发布翻译 | medium | high | locale 返回 draft translation | published-only fallback 与语言 coverage report | 双语编辑 | open |
| SJ-R011 | 参考地图来源或权利不明导致不当复制/再发布 | medium | high | audit 缺 URL、作者或 licence | MAP-001 只作内部参考；未知权利不进入 public，不复制轮廓/图标/路线 | `R-RIGHTS` | monitoring |
| SJ-R012 | dirty worktree 被新 migration/UI 改动覆盖 | medium | critical | 现有用户文件与本项目路径重叠 | 记录 checkpoint、逐文件审阅、不回退现有更改 | 主负责人 | open |
| SJ-R013 | dynamic API 与 static artifact counts/search 不一致 | medium | critical | parity 报告出现 schema/count/search 差异 | 版本化 bake、抽样和全量 parity verifier | API/static owner | open |
| SJ-R014 | 专家争议或未验证假设被文档措辞写成事实 | high | high | 文档无 reviewer/disposition/source | reviewer 角色与权威基线已指定；外部签署前保持 blocked/unverified | 主负责人 | monitoring |
| SJ-R015 | 未经授权的 staging/production 发布缺少回滚证据 | low | critical | 无 release authorization 或 version manifest | 五层 evidence gate、独立批准、rollback 和 smoke | 发布负责人 | open |
| SJ-R016 | 超级幻想拼接总图被误读为权威地望或原文事实 | high | critical | 母图无持续 disclosure，或从像素提取坐标/路线 | 固定 artistic_interpretation；程序叠加说明与热点；四类证据视图可一键切换；禁止反向抽取数据 | `R-CLASSICS` + `R-GEO` + `R-A11Y` | open |

## 当前阻断风险

`SJ-R001`、`SJ-R004`、`SJ-R006`、`SJ-R007`、`SJ-R012`、`SJ-R013`、`SJ-R014`、`SJ-R015` 和 `SJ-R016` 在没有对应证据或批准前不得标记 closed；其中与 Gate 0 输入冻结、dirty worktree 和艺术总览披露相关的风险保持 blocking。

## 修订记录

| Revision | 日期 | 修改 | 作者/owner | 证据 |
|---|---|---|---|---|
| `SJ-RISK-001` | 2026-08-14 | 建立 Phase 0 风险登记 | 主负责人 | `HANDOFF.md` |
| `SJ-RISK-002` | 2026-08-15 | 登记 MAP-001 与幻想拼接总图误读风险 | 主负责人 | `SJ-D008`、`SJ-D009` |
