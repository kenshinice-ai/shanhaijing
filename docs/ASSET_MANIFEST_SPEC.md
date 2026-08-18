# 《山海经 Atlas》资产 Manifest 规范

- 文档状态：`review_ready`
- 阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 上游规范：[MEDIA_ICON_ILLUSTRATION_POLICY.md](MEDIA_ICON_ILLUSTRATION_POLICY.md)、[SOUND_RECONSTRUCTION_POLICY.md](SOUND_RECONSTRUCTION_POLICY.md)、[GEOGRAPHY_AND_MAPS.md](GEOGRAPHY_AND_MAPS.md)、[REFERENCE_MAP_AUDIT.md](REFERENCE_MAP_AUDIT.md)、[API_CONTRACT.md](API_CONTRACT.md)
- 当前阻断：Pilot 资产、source workspace、枚举、Web profiles、licence allowlist、预算、schema、生成工具和 reviewers 尚未冻结

> 本文件定义候选目录、身份、manifest、衍生、发布和验证契约，不证明任何《山海经》资产生成器、manifest、文件、checksum、数据库记录或 verifier 已实现或通过。本文出现的路径、字段、版本和命令均不得被描述为现有发布证据。

## 1. 目的与边界

本规范为图像、异兽图标、地图、音频、波形及其 manifest 建立同一套可追溯资产链。目标是让每个公开字节都能回答：它是什么、从何而来、如何生成、适用于什么知识对象、为什么允许发布、展示时应如何披露，以及撤回时必须删除哪些衍生物。

本文件负责：

- source/master 与 Web derivative 的物理边界；
- 路径安全命名、稳定身份、内容版本和不可变文件规则；
- 文件技术元数据、来源、权利、解释与双语可访问文本；
- crop、resize、transcode、生成和人工处理的衍生 DAG；
- 图像、图标、地图、声音与波形的领域专属字段；
- DB、API、static artifact 与 manifest 的单一 provenance 来源；
- missing、stale、orphan、duplicate、superseded 和 withdrawn 状态；
- fail-closed 发布、public 清除、验证输出与 Gate 0 冻结条件。

本文件不负责：

- 决定底本、concept 归并、地望候选或声音推演是否学术成立；
- 因文件存在或 checksum 正确而提高 `source_attestation`、`interpretation_class` 或 `geographic_confidence`；
- 因内容可信而自动授予再发布权；
- 冻结尚未经过 Pilot、性能测试和人工评审的格式或字节阈值；
- 把内部参考文件、source master 或 denied asset 变成可公开 URL。

## 2. 核心原则

1. **一个逻辑资产，一个稳定身份**：文件路径、数据库主键和公开 URL 都不是资产语义身份的替代品。
2. **内容变化产生新版本**：不得覆盖原路径并沿用旧 checksum、provenance 或 review 结论。
3. **每个公开文件都必须被 manifest 覆盖**：目录扫描发现的 orphan 文件阻断发布。
4. **每个 manifest 声明的公开文件都必须存在且匹配**：missing、MIME mismatch 或 checksum mismatch 阻断发布。
5. **来源事实、解释等级、地理置信度和权利状态彼此独立**：任何一项不能从另一项推导。
6. **衍生链完整可审计**：每个输出指向直接 parent；每个 parent 以稳定 asset/version 与 SHA-256 锁定。
7. **发布视图 fail closed**：不满足全部门槛时不暴露本地路径；合法来源页可按政策单独保留为 external link。
8. **manifest 是规范 provenance 记录**：API 和 static artifact 引用同一 manifest 投影，不复制出会漂移的来源副本。
9. **缺少媒体不是内容缺失**：有效文本实体可显示明确空状态，不用占位图伪装覆盖率。
10. **机器报告不人工改数**：counts、bytes、missing、stale、rights 和 checksum 结果由 verifier 生成。

## 3. 存储区域与信任边界

### 3.1 Source workspace

原始下载、高分辨率母版、无 Web 发布许可的内部参考、生成中间文件和工具锁文件必须位于受控 source workspace，不进入 `apps/web/public/`，也不进入 static bake 输入的公开目录。

source workspace 的具体位置、加密/备份、访问控制、Git/LFS 策略和保留周期尚未冻结。其路径不得写入公开 API、客户端 bundle 或 public manifest；公开记录仅保留无敏感信息的 source identity、provenance、checksum 和必要审计字段。

`maps/reference/` 默认属于内部 source workspace。未完成 [REFERENCE_MAP_AUDIT.md](REFERENCE_MAP_AUDIT.md) 的地图不得复制到公开根目录。

### 3.2 Public derivative root

候选公开根目录：

```text
apps/web/public/media/shanhaijing/
  icons/creatures/
  illustrations/historical/
  illustrations/reconstructions/
  folios/
  maps/derived/
  audio/creatures/
  audio/ambience/
  audio/ritual/
  audio/narration/
  waveforms/
  manifests/images/
  manifests/icons/
  manifests/maps/
  manifests/audio/
  manifests/waveforms/
  manifests/releases/
```

这些目录是候选契约，不表示它们已经创建。只有 publication view 纳入且 verifier 通过的 Web derivative 才可进入该根目录。

### 3.3 Build/staging/production

local public root、built static artifact、staging 和 production 是四个不同证据边界。某文件在本地存在，不证明它已经进入 build；build 中存在，不证明 staging 或 production 已发布。release manifest 必须分别记录目标环境和已验证 artifact identity。

## 4. 路径安全与命名

### 4.1 路径组件

所有公开路径组件只允许：

- 小写 ASCII `a-z`；
- 数字 `0-9`；
- 单个连字符 `-` 作为词分隔；
- 最后一个点仅用于扩展名。

禁止空格、Unicode、反斜杠、连续点、前导点、URL 编码绕过、query token、用户输入原样拼接、绝对路径和 `..`。路径必须在规范化后仍位于冻结 public root 内；manifest parser 和 verifier 都必须拒绝越界。

### 4.2 候选文件名

```text
<asset-slug>--<role>--v<content-version>--<profile>.<ext>
```

示例只表达形状，不代表已有文件：

```text
jiuweihu--creature-depiction--v1--drawer-1600.webp
jiuweihu--creature-icon--v2--map-48.png
nanshanjing-route--reconstruction-map--v1--desktop.webp
jiuweihu-call--creature-vocalization--v1--web.opus
jiuweihu-call--waveform--v1--web.json
```

`asset-slug` 不得直接等同于 entity slug，避免实体更名迫使资产换身份。`content-version` 只在输出字节或语义发生变化时递增；profile 变化也必须产生独立 derivative/version 记录。

### 4.3 扩展名与 MIME

扩展名、声明 MIME、文件 signature/container 和解码结果必须一致。仅改扩展名不构成转码。允许格式、profile、色彩空间、音频 codec/container 和波形结构由 [PERFORMANCE_BUDGETS.md](PERFORMANCE_BUDGETS.md) 与 Pilot 冻结。

## 5. 身份、版本与不可变性

### 5.1 三层身份

| 身份 | 含义 | 不可用于替代 |
|---|---|---|
| `assetId` | 逻辑资产的稳定 UUID | 某一具体文件版本 |
| `assetVersionId` | 某一来源/解释/权利上下文下的不可变版本 UUID | derivative 文件 identity |
| `fileId` | 某个具体字节输出的稳定 UUID | concept、occurrence 或 subject identity |

建议另有稳定、可读但非主键的 `assetKey`。UUID/slug 算法、namespace 和 collision 处理需与 [ENTITY_AND_DATA_DICTIONARY.md](ENTITY_AND_DATA_DICTIONARY.md) 一起冻结。

### 5.2 版本触发条件

以下任一变化必须创建新 `assetVersionId` 或 `fileId`，不得原位覆盖：

- 文件字节、crop、尺寸、色彩空间、codec、响度或 loop point；
- creator、source object、licence、attribution 或 rights 适用范围；
- media role、depiction/interpretation、地图 candidate set 或声音 recipe；
- 与 entity、occurrence、passage、place 或 ritual 的适用关系；
- 双语 alt、caption、disclosure 中影响解释或无障碍含义的修订；
- generator/model/tool/version、seed、prompt、参数或输入；
- reviewer 否决后重新发布的替代内容。

纯审计状态更新可通过不可变 review event 和 `publicationRevision` 表达，但不能改写历史 manifest。具体 canonicalization 与签名方式待 schema 评审。

### 5.3 内容寻址与去重

SHA-256 相同表示字节相同，不表示语义、权利或适用关系相同。Verifier 可报告 duplicate bytes，但不得自动合并不同 provenance 或 rights context。若去重为同一物理文件，所有逻辑引用仍须保留独立可审计关系，且最严格的撤回要求必须可执行。

## 6. Manifest 分层

候选 manifest 分为：

1. **Asset manifest**：逻辑资产、来源、权利、解释、适用对象和本地化文本。
2. **Derivative manifest**：parent/input、转换/生成步骤和具体输出文件。
3. **Release manifest**：某次 publication view 实际允许公开的 manifest/file 集合及聚合 checksum。
4. **Verifier report**：对输入、规则和输出的机器检查结果；它是证据，不是 manifest 真源。

可采用每个资产一个 JSON、按类别分片，或规范化数据库后生成 JSON；最终选择必须证明 canonical serialization、稳定排序、增量撤回和 dynamic/static parity。禁止同时维护无法自动比对的“DB provenance”和“JSON provenance”。

## 7. 通用 Asset Manifest 字段

以下为候选最低字段，具体 JSON Schema 与枚举尚未实现：

```ts
type AssetManifest = {
  schemaVersion: string;
  assetId: string;
  assetKey: string;
  assetVersionId: string;
  contentVersion: string;
  status: "draft" | "review" | "publishable" | "superseded" | "withdrawn";
  mediaKind: "image" | "icon" | "map" | "audio" | "waveform";
  mediaRole: string;
  title: LocalizedPublishedText;
  caption: LocalizedPublishedText;
  alt: LocalizedPublishedText;
  disclosure?: LocalizedPublishedText;
  provenance: Provenance;
  rights: RightsDecision;
  interpretation: InterpretationMetadata;
  appliesTo: SubjectLink[];
  files: FileRecord[];
  derivatives: DerivativeRecord[];
  reviews: ReviewReference[];
  createdAt: string;
  updatedAt: string;
};
```

`status=publishable` 只是候选资格。只有 release derivation 再次核验 rights、translations、files、links、profile 和 withdrawal 后，文件才进入公开 view。

## 8. 文件技术元数据

每个 source/master、input 和 output file 至少记录：

- `fileId`；
- 相对于所属 root 的规范化路径；
- `sha256`：64 位小写十六进制；
- 精确 byte size；
- 扩展名与 IANA MIME；
- container 与 codec/profile（适用时）；
- 创建/获取时间和 checksum 计算时间；
- 文件角色：`source`、`master`、`input`、`intermediate`、`public_derivative` 或 `manifest`；
- 是否允许进入 public root；
- verifier 实际探测的技术字段。

图像/图标另需：

- pixel width/height；
- orientation；
- bit depth；
- color space/profile；
- alpha 状态；
- animation/frame count；
- density/profile 用途。

音频另需：

- container、codec、sample rate、channels；
- bit depth 或 bitrate；
- duration；
- integrated LUFS、true peak；
- clipping、DC offset、silence 检测结果；
- loop start/end 和边界检测（若可循环）。

波形另需：

- schema version、sample/window strategy、channel aggregation；
- point count、duration、关联 audio `fileId` 与 checksum；
- 数值范围和 normalization 方法。

技术 profile 与预算值必须由真实编码/浏览器基准冻结，不直接继承 music 模块的 22050 Hz、WAV 或固定时长。

## 9. Provenance 与权利

### 9.1 Provenance 最低字段

- creator/author/organization，未知时显式为 unknown 并禁止 bundled 发布；
- source object title 与 source page；
- original file URL（若存在）；
- owning/hosting institution；
- creation date 或 interval 及其精度；
- retrieval date/time；
- source identifier/accession/catalogue ID；
- source file checksum（获得文件时）；
- provenance notes 与适用 source record IDs。

source page 与 original URL 不可混为一个字段。优先 HTTPS；重定向、页面消失和内容变化由 stale 检查报告，不静默替换来源。

### 9.2 Rights 最低字段

- licence 名称与准确版本；
- licence URL；
- rights statement；
- attribution 原文与双语显示策略；
- rights holder（适用时）；
- 允许的使用模式：bundled、derived、commercial、modified 等；
- 地区、期限或用途限制；
- `rightsStatus`：候选 `verified`、`pending`、`rejected`、`unknown`；
- reviewer、review date、decision reference；
- withdrawal/contact procedure。

`rightsStatus=verified` 只表示冻结使用方式获得批准，不表示历史真实性。所有生成/衍生输出的 rights 必须独立审核，不能仅继承输入状态。

## 10. 角色、解释与适用对象

每个资产必须独立记录：

- `mediaRole`；
- `depictionStatus`（图像/图标适用时）；
- `sourceAttestation`；
- `interpretationClass`；
- `geographicConfidence`（地图主张适用时）；
- 解释理由和 source/passage references；
- 适用 subject 的 kind、稳定 ID、link role、范围和 review 状态。

`appliesTo` 可指向 concept、occurrence、passage、textual place、candidate set、deity、tribe、plant、ritual 等冻结 kind。一个 concept 图像不能自动适用于它的每个 occurrence；一个 occurrence 的声描写也不能自动证明整类异兽具有同一声音。

视觉相似、同一 slug 或相邻 passage 都不能自动创建适用关系。每条关联必须可追溯到编辑决定或来源。

## 11. 双语可访问文本与披露

首版候选 locale 为 `zh-CN` 和 `en`。每个公开资产至少具有达到冻结门槛的：

- title；
- alt；
- caption；
- disclosure（现代示意、生成内容、学术假说和声音推演适用）；
- attribution/rights display；
- 音频文字替代、transcript 或 sound description。

每个本地化字段记录 locale、value、translation status、translator/editor、reviewer 和 revision。只允许 `published` 文本进入 publication view；API fallback 遵循 [API_CONTRACT.md](API_CONTRACT.md)，不得回退到 draft/reviewed。

装饰图可使用空 alt，但知识资产不得为绕过翻译门槛而标为装饰。alt 描述可感知内容；caption 解释角色、来源、年代、interpretation 和关键不确定性；attribution 与 licence 保持可单独访问。披露必须在首次展示处可见，不能只埋在 manifest 或来源页。

## 12. 衍生 DAG

### 12.1 通用 Derivative Record

每次 crop、resize、format conversion、transcode、normalization、waveform extraction、地图渲染、生成或人工后期必须记录：

- derivative ID 和 operation kind；
- 直接 parent/input 的 `fileId`、version 和 SHA-256；
- output `fileId`、path、MIME、bytes 和 SHA-256；
- tool/generator/model 与准确 version；
- 全部参数和 profile ID；
- execution environment/lock reference；
- generated/processed timestamp；
- operator；
- 人工步骤与不可重建部分；
- reproducibility status；
- input/output rights review references。

DAG 必须无环、无缺失 parent，且从任一公开 derivative 可追溯到 source/master。输入 checksum 改变时，旧输出即为 stale；不得只更新 parent checksum 而保留未经重建或复核的输出。

### 12.2 Crop、resize 与图像处理

记录 crop 坐标及坐标系、orientation 修正、resize kernel、目标尺寸、color conversion、压缩器、quality、alpha 和 metadata stripping。对 text folio 还须记录页面/区域引用，不能通过裁切改变文本语境而不披露。

### 12.3 Transcode 与音频处理

记录输入/输出 container、codec、sample rate、channels、bit depth/bitrate、trim、fade、loop、EQ、dynamics、normalization 和 loudness measurement 工具。任何人工剪辑都必须成为明确步骤，不可只写“cleaned”。

### 12.4 可重复性

确定性工具应保存命令/recipe、版本、参数和 environment lock，使同一输入可重建同一输出 checksum。模型或平台无法保证字节级复现时，必须保存当时可获得的 model version、seed、prompt、原始输出 checksum 和 `reproducibilityStatus=limited`，不得声称确定性。

## 13. 图像与异兽图标 Manifest

图像沿用 [MEDIA_ICON_ILLUSTRATION_POLICY.md](MEDIA_ICON_ILLUSTRATION_POLICY.md) 的 role、depiction、interpretation 和 disclosure 边界，并补充：

- historical illustration 的 object/page/plate/folio identity；
- reconstruction 的设计 brief、参考输入、方法和人工修改；
- text folio 的 edition、page/leaf、crop region 和 passage link；
- 适用 concept/occurrence 的编辑关联及 reviewer；
- source/master 与各 Web profile 的完整 derivative 链。

异兽图标是独立资产类别，至少记录：

- `iconKey`、icon version 和 designer；
- taxonomy hints 仅作为设计输入，不作为 taxonomy assignment；
- monochrome/multicolor、stroke/fill、view box 或 raster dimensions；
- 目标尺寸、底图、selected/disabled/high-contrast states；
- readability test report；
- 与 drawer illustration 的独立 provenance、rights 和 interpretation。

禁止从历史图像或 drawer 大图自动裁成地图图标，除非许可允许、衍生链完整、语义评审通过且新图标有独立 identity。

## 14. 地图 Manifest

每个参考或 derived map 还需记录：

- map role：视觉参考、数据来源候选、学术地望主张或 derived presentation；
- source map/audit ID；
- candidate set ID、version、claimant 和 source references；
- spatial extent 与 coordinate reference system；
- projection、datum、axis order 和单位；
- transformation/reprojection pipeline 与工具/version；
- scale/resolution、tile/partition/profile（适用时）；
- textual topology layout algorithm、seed/version 和输入 checksum（适用时）；
- basemap/style/provider、licence、attribution 和离线/在线边界；
- generator、参数、人工修订和 output checksum；
- geographic reviewer 与 review result。

文本拓扑 layout 坐标不得标为 WGS84。学术候选、现代底图和原文拓扑的输入与输出不得在单一无类型 geometry 中合并。由多个 candidate set 拼接出的地图必须显式标为新的编辑组合，不可冒充某一学说。

未知来源或 rights 未核验的参考地图不得进入 public root、derived input 或 release manifest；视觉参考资格不授予数据提取或衍生权。

## 15. 音频与波形 Manifest

每个生成或处理音频除通用字段外，至少记录：

- semantic role；
- `text_attested` 声描写对应的 passage IDs 与文本 checksum；
- analog species/material/environment、来源和适用限制；
- output interpretation：`inferred_analogy` 或 `artistic_interpretation` 等冻结值；
- synthesis recipe/profile 或 prompt；
- generator/model/tool 与准确 version；
- seed（支持时）、全部参数和 environment lock；
- 每个输入资产的 creator、source、licence、rights decision 和 SHA-256；
- 原始生成输出与每次后期步骤；
- output technical profile、path、SHA-256 和 bytes；
- 双语 title、description、disclaimer 和文字替代；
- operator、sound reviewer 和 rights reviewer。

不得把 `text_attested` 解释为真实叫声录音或确定复原。所有 input rights 和 output rights 必须分别为 verified，才能暴露播放路径。

波形是音频 derivative，不是独立证据。它必须锁定直接 audio checksum；音频换版后旧波形立即 stale。波形 JSON/SVG/图片是否允许、采样点和字节预算由性能评审冻结。

## 16. Release Manifest 与 publication derivation

Release manifest 是某个 artifact version/locale/profile 的不可变发布清单，候选字段包括：

- schema、artifact 和 publication revision；
- work/profile、locale、target environment；
- generated timestamp、source revision 和 generator version；
- 纳入的 `assetVersionId`、`fileId`、相对 public path、SHA-256、bytes、MIME；
- 被排除项的机器原因分类，但不暴露敏感 source path；
- 分类别 counts/bytes；
- aggregate manifest checksum；
- verifier report identity 和 evidence level。

发布 derivation 必须从 canonical manifest/DB 生成 API、static index 和 release manifest。API/static 只携带展示所需字段与 canonical manifest reference；不得各自复制 creator/licence/interpretation 后独立编辑。

动态和静态 transport 对同一 publication revision 必须在以下方面 parity：

- asset identity/version；
- 路径、checksum、MIME 和 bytes；
- rights eligibility；
- role/interpretation/subject links；
- locale resolution 与 published text；
- withdrawal 和 supersession 状态；
- 聚合 counts/bytes。

缺失 static partition 不是“零资产”；客户端必须能区分 not generated、withdrawn、unavailable 和 valid empty。

## 17. Fail-Closed 发布规则

只有同时满足以下条件，bundled/local path 才能进入 API、static artifact 或 public root：

- asset、subject link 和 locale text 均在 publication view；
- rights status 为冻结 allowlist 中允许 bundled/derived 的 verified 状态；
- creator、source page、licence、attribution 和 retrieval metadata 完整；
- role、depiction/interpretation 及适用 subject 已审核；
- 文件存在，real path 未越界，signature/MIME/profile 合法；
- SHA-256 与 byte size 完全匹配；
- derivative DAG 完整、无环、无 stale input；
- source/input/output rights 均通过；
- 双语 alt/caption/disclosure 或音频文字替代达到冻结门槛；
- profile registry 允许该 kind/role；
- verifier 与 release derivation 对当前 revision 通过；
- 文件未被 superseded 或 withdrawn。

失败行为：

1. 不返回本地路径或可推测 URL；
2. 不复制文件到 static build；
3. 若文件已在 `public/`，构建前必须物理移除或隔离；
4. 合法 source page 可按政策降级为 external link；
5. UI 显示无媒体或不可用状态，不用占位资产伪装覆盖；
6. 记录机器可读 exclusion reason 和审计事件。

仅从 JSON 隐藏 denied 路径不充分：只要文件仍可通过已知/猜测 URL 从 `public/` 或 CDN 获取，fail-closed 即失败。

## 18. 异常、重复与生命周期

### 18.1 Missing

manifest 或 DB 声明文件存在，但文件不可读。立即排除该文件及依赖它的 descendants；发布阻断。

### 18.2 Stale

parent/input checksum、generator contract、rights decision、translation revision 或 subject link 已变化，但 derivative/review 未重建或复核。立即排除受影响 branch；不得只改时间戳消除 stale。

### 18.3 Orphan

public root 中存在未被当前 canonical manifest/release manifest 覆盖的文件。即使文件看似无害也阻断 build，避免 denied、旧版或测试 fixture 被直接访问。

### 18.4 Duplicate

相同 SHA-256 出现在多个 file/asset 记录。Verifier 报告重复及 provenance/rights 差异；只有经审核后才能物理去重，不自动合并逻辑 identity。

### 18.5 Superseded

新版本替代旧版本，但旧版审计记录保留。旧文件不得留在当前 public build；历史 artifact 是否保留取决于 rights、retention 与 rollback policy。

### 18.6 Withdrawn

因许可、来源、学术关联、隐私/伦理或 checksum 异常停止公开：

1. 更新 withdrawal event 与 reason category；
2. 增加 `publicationRevision`；
3. 从 API、static index、release manifest、build 和 CDN/public root 移除；
4. 递归排除所有依赖 derivative；
5. 保留不公开的最小审计记录；
6. 重跑 verifier、static build、staging/production smoke；
7. 按 [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) 执行回滚或撤回。

不得用另一文件静默替换被撤回内容并沿用旧 `assetVersionId`、checksum、来源或 attribution。

## 19. Verifier 契约

计划命令（当前均未实现）：

- `npm run verify:shanhaijing-media`
- `npm run verify:shanhaijing-sound`
- 可由上述命令共享 asset-manifest core，是否增加独立 `verify:shanhaijing-assets` 待 Gate 0 决定。

Verifier 至少检查：

- manifest schema、canonical serialization、稳定 identity 和合法枚举；
- 路径 normalization、root containment、命名、扩展名、MIME/signature；
- SHA-256、bytes、图像尺寸/profile、音频/波形技术字段；
- provenance、licence allowlist、attribution、retrieval 和 reviewer；
- role、depiction、interpretation、geography 与 rights 状态相互独立；
- subject/link 存在、work/profile ownership 与 publication eligibility；
- `zh-CN`、`en` published alt/caption/disclosure/text alternative；
- derivative DAG 无断链、环路或 stale parent；
- generation tool/model/version/seed/prompt/recipe/input-rights；
- map audit/candidate set/projection/transformation/generator；
- sound profile、LUFS、peak、clipping、DC、silence、loop 和 disclaimer；
- missing、stale、orphan、duplicate、superseded、withdrawn files；
- DB/canonical manifest/API/static/release manifest parity；
- denied/unknown/pending asset 无公开路径且 public/build 中无残留文件；
- 分类别和总 bytes 对冻结预算的符合性。

必须包含故意失败 fixtures：路径穿越、错 checksum、伪 MIME、缺 creator、rights denied、input rights pending、缺双语 alt、环状 DAG、stale waveform、orphan public file、拓扑坐标伪装 WGS84、模型生成缺 prompt/seed 说明、withdrawn file 仍可访问。

Verifier 失败退出非零。不得因单个字段解析失败而跳过其余检查并误报 PASS。

## 20. 生成报告

机器输出写入 `docs/shanhaijing/generated/`，至少包括 JSON 与 Markdown 摘要，并记录：

- report schema/version；
- 生成命令、工具版本、时间和 evidence level；
- 输入 manifest/revision/checksums；
- 目标 profile、locale 和环境；
- checked、included、excluded、missing、stale、orphan、duplicate、superseded、withdrawn counts；
- 分 media kind/role 的 files 和 bytes；
- rights/translation/interpretation 状态分布；
- error/warning code、asset/file identity 和修复 owner；
- 输出报告自身 checksum。

Markdown 统计区从 JSON 生成，禁止人工修改。HANDOFF、coverage 和 release checklist 只引用报告及其 checksum，不手抄易漂移数字。报告为 `local_candidate` 时不得描述成 build、staging 或 production 证据。

## 21. 安全、隐私与供应链边界

- manifest 不存访问 token、cookie、私有 source URL、绝对本地路径或操作者敏感信息；
- 外部 URL 仅作为 provenance 数据，不由构建器无 allowlist 地自动抓取；
- 解码/转码在受控工具链执行，锁定工具/version 并限制输入大小；
- SVG、HTML、metadata 和字幕需防脚本/外部引用注入；
- 文件名和 MIME 不可信，必须检查 signature 和实际解码；
- generator/model 许可、输入上传条款与输出使用权独立审核；
- checksum 用于完整性和身份，不替代数字签名、访问控制或备份；
- source workspace 泄漏检查必须覆盖 Git、static build、source maps 和部署清单。

是否需要签名 release manifest、SBOM、恶意文件扫描和可复现容器，由 Gate 0 风险评审决定。

## 22. 与现有仓库基线的关系

European Classical Music 现有 manifest/verifier 提供以下可复用方法：

- generator/profile/version 明确记录；
- 输出 checksum 与文件字节核对；
- manifest、SQL seed 和数据库交叉验证；
- 文件头与技术 profile 检查；
- 总媒体字节预算阻断。

该基线不等于《山海经》契约已实现，也不能直接复用其固定数量、WAV profile、22050 Hz、目录或领域表。Shanhaijing 还必须覆盖 provenance、rights、解释、适用对象、双语可访问文本、衍生 DAG、地图 metadata、声音输入权利、撤回和 public orphan 清除。

## 23. Gate 0 未决事项

- source workspace 的位置、权限、备份和 retention；
- asset/file UUID 与 `assetKey` 生成规则；
- manifest JSON Schema、canonical serialization 和 schema migration；
- media role、depiction、interpretation、rights 与 lifecycle 最终枚举；
- image/icon/map/audio/waveform Web/master profiles；
- 每文件、每 role、首屏和整包字节预算；
- licence allowlist、地区/用途限制和 attribution 模板；
- 首批 Pilot source、source page、creator 与 rights decisions；
- crop/transcode/map/audio/waveform 工具及版本锁；
- AI/算法生成工具允许清单和不可复现记录标准；
- bilingual alt/caption/disclosure/text alternative 发布门槛；
- API/static manifest reference 与 release manifest 粒度；
- stale 传播、duplicate 去重和 historical artifact retention；
- CDN purge、withdrawal SLA 和 rollback 流程；
- rights、图像史、历史地理、声音、无障碍和安全 reviewers；
- verifier fixtures、报告 schema 和批准的豁免流程。

## 24. 本文件冻结条件

只有同时满足以下条件，本文才可从 `draft` 改为 `frozen`：

- Pilot 为历史插图、现代示意、异兽图标、folio、derived map、音频、波形或明确空状态提供代表样本；
- source/master 与 public derivative 的存储及访问边界获批准；
- schema、identity、version、path、MIME、checksum 和 derivative DAG 规则实现并评审；
- licence allowlist、attribution、input/output rights 和撤回流程获 rights reviewer 批准；
- role、depiction、interpretation、geography 和 rights 可在 fixture 中独立解释；
- 地图 reviewer 批准 candidate set、projection、transformation 和拓扑坐标边界；
- sound reviewer 批准 recipe/input/profile/disclaimer 契约；
- accessibility reviewer 批准双语 alt/caption/disclosure 和音频文字替代；
- [PERFORMANCE_BUDGETS.md](PERFORMANCE_BUDGETS.md) 冻结各 profile 与 aggregate 预算；
- verifier 用故意失败 fixtures 证明 missing、stale、orphan、rights denied、路径越界和 withdrawal 均 fail closed；
- API 与 static publication projection 通过 identity/path/checksum/rights/locale parity；
- 所有决定写入 [DECISION_LOG.md](DECISION_LOG.md)，并在 [HANDOFF.md](HANDOFF.md) 引用实际报告与 checksum；
- Gate 0 的其他停止条件全部解除。

在此之前，Gate 0 保持 `blocked`，不得因目录、样例 manifest 或本地文件存在而开始大规模资产采集或声称资产管线完成。
