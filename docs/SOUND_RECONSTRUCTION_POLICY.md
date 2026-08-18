# 《山海经 Atlas》声音推演政策

- 文档状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 当前阻断：Pilot 声描写、类比来源、rights/sound reviewers、音频 profile 和 verifier 尚未冻结

## 1. 目的与底线

本政策规范异兽发声、环境声、仪式声和叙述音频的证据、推演、生成、发布与播放。声音用于帮助读者比较文本描写与明确披露的现代类比，不是古代录音、确定复原或真实物种鉴定。

任何公开音频都必须让用户在播放前理解：

- 原文究竟说了什么；
- 哪部分来自注本或现代研究；
- 哪部分是现代声学类比；
- 哪部分是编辑或艺术创作；
- 音频如何生成、由谁审核、是否允许发布。

## 2. 不复用乐谱领域表

现有 European Classical Music 模块的可重复生成、manifest、checksum、rights gate 与静态路径验证可作为工程方法参考。

不得复用：

- `score_fragments`；
- `score_generation_manifests`；
- 乐谱小节、tempo 和 notation 语义；
- 固定的音乐学习片段时长或音频 profile。

《山海经》建立独立 `sound_assets`、`sound_links`、`sound_evidence`、`sound_generation_manifests` 和 `sound_translations` 契约。

## 3. 声音角色

首版候选角色：

- `creature_vocalization`：与 concept/occurrence 的发声描写相关；
- `environment_ambience`：山、林、水、海、泽等环境示意；
- `ritual_reconstruction`：有来源且明确披露的仪式声推演；
- `narration`：原文、译文或编辑说明朗读。

角色只定义用途，不定义真实性。环境声也需要地点/材料类比来源；叙述录音需单独处理表演权、录音权和文本权利。

## 4. 证据与输出解释等级

### Source attestation

- `direct_text`：原文直接含声描写、拟声或“其音/其声如”类表述；
- `commentary`：注本提供发声解释；
- `modern_research`：现代研究或声学资料；
- `no_direct_text`：无直接文本声证据。

### Output interpretation

- `text_attested`：仅说明某个文字描述有直接文本证据；
- `inferred_analogy`：依据现代物种、材料、器物或环境类比推演；
- `artistic_interpretation`：为体验创作的艺术演绎。

关键规则：

- 一条音频可以关联 `direct_text` 证据，但生成波形本身通常仍是 `inferred_analogy` 或 `artistic_interpretation`；
- 不得把音频文件本身标作“text attested recording”；
- 不得因“声如某物”就认定异兽属于该现代物种；
- 多种合理类比应并列，不强制混成一个权威版本；
- 无直接声描写时，不能为追求覆盖率伪造 `text_attested`。

## 5. Sound evidence 最低字段

每条证据至少包括：

- stable evidence ID；
- subject kind/ID；
- passage/occurrence ID；
- 原文声描写及 locator；
- edition/source；
- source attestation；
- interpretation note；
- analog kind（species/material/instrument/environment/human voice 等）；
- analog source 与具体 locator；
- 支持理由和局限；
- confidence；
- editorial reviewer、review date、review status。

原文引文、现代类比和生成配方必须可分别追溯。

## 6. Sound asset 最低字段

每个音频候选至少记录：

- stable asset ID 与 semantic role；
- title、description、text alternative、disclaimer（`zh-CN`、`en`）；
- output interpretation；
- rights status；
- file path、MIME、codec/container；
- sample rate、channels、bit depth/bitrate；
- duration；
- integrated LUFS 与 true peak；
- loop start/end 和 crossfade（如适用）；
- SHA-256 与文件字节数；
- creator/performer/recorder；
- source/master/derivative 关系；
- generation manifest ID（生成资产）；
- created/generated/reviewed timestamps；
- reviewer 和 review status。

缺少 rights、disclaimer、文字替代、音频技术检测或 checksum 时，不返回可播放路径。

## 7. 生成 manifest

每个生成音频必须有独立 manifest，至少记录：

- schema version；
- generator/model/tool 与准确 version；
- synthesis profile；
- prompt 或 DSP recipe；
- seed（工具支持时）；
- 全部参数；
- 输入资产、来源、许可和 SHA-256；
- 输入文本/passages 的稳定 ID 与 checksum；
- 输出音频 profile、path、SHA-256 和字节数；
- generated_at；
- 人工剪辑、混音、降噪、EQ、响度等后期步骤；
- 操作者和 reviewer；
- interpretation 与双语 disclaimer 版本；
- tool/environment lock 或可重建说明。

不可重复的模型输出也必须保留当时可用的 model version、prompt、seed 和原始输出 checksum；“无法完全复现”需明确记录，不能假装确定性。

## 8. 输入素材与权利

优先顺序：

1. 可重复程序化 DSP/合成；
2. 项目自产且授权清晰的录音；
3. 明确开放许可并允许衍生使用的素材；
4. 经审核的生成工具输出。

禁止：

- 商业录音、来源不明采样包或 SoundFont；
- 从视频/流媒体截取声音；
- 仅因文件可下载就视为可再发布；
- 无 creator、licence URL、attribution 或 input checksum 的外部素材；
- 未评估输入权利的模型生成内容自动入库；
- 用现代濒危动物录音等敏感素材而不评估伦理与许可。

所有输入 rights 必须 verified，输出 rights 也必须单独审核。

## 9. 生成方法分期

### Phase 1

先以确定性 DSP 或简单合成 recipe 验证：

- evidence → recipe → output → manifest → verifier → API → player 完整链；
- 不追求“逼真”；
- 每项短音频只表达一个可解释的声学假设；
- 播放前显示证据与披露。

### Phase 2

数据契约稳定后可评估：

- 循环环境声；
- 淡入淡出；
- 同一描写的多个可比较版本；
- 更复杂但仍可追溯的合成。

### Phase 3（首版非必需）

只有性能、rights 和无障碍通过后，才评估混音与空间音频。必须始终可关闭，并提供文字替代。

## 10. 音频技术 profile

最终数值需通过 Pilot 听审、浏览器兼容和字节基准冻结。候选要求：

- Web 分发格式：优先广泛兼容的压缩格式；是否同时保留 WAV 作为验证/master 另行决定；
- sample rate：不得直接继承音乐模块的 22050 Hz，依据内容与带宽测试选择；
- channels：发声可 mono，环境/空间用途需有明确理由；
- duration：短发声、环境 loop、仪式和 narration 分角色预算；
- integrated LUFS：按 role 定义目标范围和容差；
- true peak：必须低于冻结上限，防止削波；
- DC offset、silence、clipping、unexpected truncation 均检测；
- loop 需检测边界 click/pop，并记录 loop points/crossfade；
- metadata 不得含未审路径、用户名或隐私信息。

在 `PERFORMANCE_BUDGETS.md` 冻结总字节、单文件和首次交互预算前，不宣称音频 profile 已通过。

## 11. 播放器行为

Phase 1 硬规则：

- 仅用户显式点击播放；
- 无 autoplay；
- 全局单轨，播放新音频前停止上一条；
- `preload="none"` 或经 reduced-data 策略批准的最小 metadata；
- 显示播放/暂停、进度、时长和音量/静音；
- drawer 关闭、profile 切换或 route 失效时停止播放；
- rights-denied 或 manifest-invalid 时不渲染可播放元素；
- 网络失败显示可恢复错误，不循环请求；
- 深链不触发自动播放。

浏览器原生 `<audio>` 可作为最小实现，但全局单轨、错误、披露和状态同步需由共享 controller 保证。

## 12. 无障碍与用户偏好

- 每条音频提供等价的双语文字描述/transcript；
- 控件有可访问名称、键盘操作和可见 focus；
- 播放状态通过克制的 live region 表达；
- 不以声音作为唯一提示；
- mute、reduced-audio 和 reduced-data 分开；
- `prefers-reduced-motion` 不等于静音；
- 用户选择持久化，但不得覆盖浏览器对 autoplay 的限制；
- narration transcript 与音频语言明确标记；
- 环境 loop 默认关闭。

## 13. 文案与披露

首次播放前必须可见适用等级与简短声明。候选核心语义：

- `text_attested`：原文存在声音描述；该标签不表示录音真实存在；
- `inferred_analogy`：根据现代类比推演，不代表物种鉴定或唯一发声；
- `artistic_interpretation`：体验性创作，不是考据复原。

中英文文案分别审核。翻译不得删去“不确定”“推演”“艺术演绎”等限定词。

禁用表述包括：“真实叫声”“古代录音”“还原原声”“权威复原”“确定发声”，除非未来出现完全不同且可证明的证据类别并经过专家批准。

## 14. 文件与目录

最终目录由 `ASSET_MANIFEST_SPEC.md` 冻结。候选结构：

```text
apps/web/public/media/shanhaijing/
  audio/creatures/
  audio/ambience/
  audio/ritual/
  audio/narration/
  waveforms/
  manifests/audio/
```

source/master 不适合 Web 发布时放受控 workspace，不进入 `public/`。文件名使用安全 ASCII slug、role、variant 和 version；不得静默覆盖旧版本。

## 15. API Fail-Closed

API 只有同时满足以下条件才返回 audio path：

- sound asset/link/subject 可发布；
- rights verified；
- output interpretation 合法；
- evidence 与 disclaimer 完整；
- `zh-CN`、`en` 文字替代达到发布规则；
- generation/input manifest verified；
- 文件、profile 与 SHA-256 验证通过；
- profile registry 允许该 role；
- static artifact 包含对应文件并通过 parity。

否则可返回明确的不可用 reason 和非敏感来源信息，但不得暴露 pending/rejected/unknown 文件路径。

## 16. Verifier 契约

计划命令：`npm run verify:shanhaijing-sound`，当前尚未实现。

至少检查：

- role、attestation、output interpretation 不混用；
- passage/source/analog evidence 完整；
- rights 与输入素材许可；
- manifest schema、tool/version、recipe/prompt、seed 与 checksums；
- 文件头、container/codec、sample rate、channels、duration；
- integrated LUFS、true peak、clipping、DC offset 和 silence；
- loop points、边界 click/pop 与 crossfade；
- 双语 published title/description/text alternative/disclaimer；
- stale、missing、orphan、checksum mismatch；
- API rights gate；
- dynamic/static parity；
- 总字节与分角色预算。

Verifier 输出 JSON 与 Markdown 摘要到 `docs/shanhaijing/generated/`，写明命令、输入 checksum 和 evidence level。统计区不人工编辑。

## 17. 人工听审

自动检测不能判断语义是否误导。每个发布候选至少审查：

- 是否与文本声描写存在可解释关系；
- 类比是否造成错误物种认同；
- 是否把艺术选择包装成研究结论；
- 音量、突发峰值和循环是否令人不适；
- 手机扬声器、耳机和桌面设备是否基本可用；
- 中英文披露是否在播放前可理解；
- transcript/text alternative 是否提供等价信息。

听审记录包含 reviewer、设备、日期、版本/checksum 和结论。

## 18. 撤回与修订

当来源、许可、类比合理性或技术检测发生问题：

1. API 立即停止暴露路径；
2. asset 标记 pending/rejected 并保留审计记录；
3. 移除/隔离 public derivative；
4. 更新 evidence、manifest、decision log 和 links；
5. 重生成时创建新 version/checksum，不覆盖旧记录；
6. 重跑 verifier、static build 和相应 smoke；
7. 已发布内容按 release checklist 执行撤回/回滚。

## 19. Gate 0 未决事项

- Pilot 中有代表性的直接声描写和无声描写空状态；
- sound role、attestation、interpretation 与 confidence 最终枚举；
- 类比来源接纳标准；
- 允许的输入素材和生成工具；
- Web/master 格式、sample rate、channel 与时长；
- LUFS、true peak、silence、loop 和总字节阈值；
- 双语 disclaimer 固定文案；
- 全局播放器 controller 的归属；
- acoustics、古籍、rights 和 accessibility reviewers；
- verifier 与 manifest schema。

## 20. 本文件冻结条件

- Pilot 至少含一条直接声描写的可重复推演、一条多类比争议样本和一个明确无音频状态；
- evidence、waveform output 与 interpretation 三者在 DB/API/UI 中独立；
- 输入/输出 rights 获审核；
- 音频 profile 经自动检测、字节基准和人工听审冻结；
- 显式播放、全局单轨、无 autoplay、reduced-data 和文本替代通过浏览器验证；
- verifier 以故意错 checksum、缺 disclaimer、越界 peak、坏 loop 和 rights denied fixture 证明 fail closed；
- 相关决定进入 `DECISION_LOG.md` 后，方可标记 `frozen`。
