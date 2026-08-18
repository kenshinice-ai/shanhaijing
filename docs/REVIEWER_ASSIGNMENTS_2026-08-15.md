# 《山海经 Atlas》Reviewer 指定与权威基线

- 状态：`review_ready`
- 当前阶段：Phase 0 / Gate 0
- 证据层级：`local_candidate`
- 核心蓝图：[memoized-riding-giraffe.md](memoized-riding-giraffe.md)
- 授权来源：用户于 2026-08-15 要求“参考各大权威网站为准，指定 reviewer，按照最优解执行”
- 主负责人内部签署：`signed`（2026-08-18，SJ-D012）
- 外部签署状态：`external_human_signoff_pending`

> 本文件正式指定项目内 reviewer 责任角色，并登记首选外部机构或专家作为签署候选。机构名称或个人姓名出现在“外部签署候选”栏，不表示对方已接受委任、认可本项目或提供法律/学术背书；联系和接受状态必须另行记录。

## 1. Reviewer 治理模型

每个领域采用两层 reviewer：

1. **项目责任 reviewer**：对候选规则、fixture、报告和停止条件负责，可以把问题推进到 `accepted-with-actions`，但不能伪造外部学术、法律或合规背书。
2. **外部签署 reviewer**：由对应专业机构或具备相关资质/经验的个人进行最终人工签署。未联系或未接受时保持 `external_human_signoff_pending`。

自动校验、AI 辅助研究和权威网站只能形成证据包，不能取代古籍校勘、历史地理主张、法律意见、母语翻译、辅助技术实测或真实设备性能复核。

## 2. 正式指定

| Reviewer ID | 领域 | 项目责任 reviewer | 首选外部签署候选 | 当前状态 | 决策权限 |
|---|---|---|---|---|---|
| `R-CLASSICS` | 古籍、校勘、神话分类 | 项目古籍编辑负责人 | 国家图书馆《山海经》知识库团队；首选联系方向为古籍馆/知识库内容团队 | `assigned_internal / external_not_contacted` | edition candidate、passage、variant、occurrence/concept 规则候选；不能单独冻结学术争议 |
| `R-GEO` | 历史地理、古地图 | 项目历史地理负责人 | 复旦大学历史地理研究中心；首选专家候选李晓杰教授 | `assigned_internal / external_not_contacted` | textual topology 与 candidate set 审查；不能把候选地提升为唯一事实 |
| `R-RIGHTS` | 版权、媒体、许可 | 项目版权与媒体合规负责人 | 中国大陆执业版权律师或机构法务；监管/规范依据为国家版权局 | `assigned_internal / qualified_counsel_not_retained` | rights fail-closed、许可清单、撤回；不提供替代正式法律意见的结论 |
| `R-AUDIO` | 声学、声音设计 | 项目音频工程负责人 | 熟悉 ITU-R BS.1770 / EBU R 128 的广播或数字音频工程师 | `assigned_internal / external_not_contacted` | 测量算法、manifest、披露和播放门禁；推演真实性仍需学术 reviewer |
| `R-BILINGUAL-ZH` | 中文、拼音、术语 | 项目中文术语编辑 | 古籍中文编辑或国家语言文字规范专家 | `assigned_internal / external_not_contacted` | 中文规范名、拼音、分词、术语表 |
| `R-BILINGUAL-EN` | 英译、英文可读性 | 项目英文编辑 | 英语母语学术编辑，且具中国古籍/宗教神话翻译经验 | `assigned_internal / external_not_contacted` | 英文名称、摘要和 disclosure；不得单人发布未经中文 reviewer 对齐的译名 |
| `R-A11Y` | 无障碍 | 项目 accessibility 负责人 | 具 WCAG 2.2、屏幕阅读器和键盘测试经验的无障碍专家 | `assigned_internal / external_not_contacted` | WCAG/AT 测试矩阵、阻断缺陷和 waiver 建议 |
| `R-PERF` | 性能 | 项目前端性能负责人 | 具 field/lab Web 性能和移动端 profiling 经验的前端性能工程师 | `assigned_internal / external_not_contacted` | fixture、设备矩阵、性能预算、报告和技术演进触发器 |
| `R-RELEASE` | 发布与运维 | 项目发布负责人 | 目标托管平台 owner / 运维复核人 | `assigned_internal / target_not_selected` | evidence level、rollback、staging/production gate；production 仍需单独用户授权 |

## 3. 权威来源登记

### 3.1 古籍与校勘

**主基线**

- [国家图书馆《山海经》知识库发布说明](https://www.nlc.cn/pcab/xctg/bd/20240624_2640158.shtml)
- [国家图书馆《山海经》知识库入选数字化创新示范案例](https://www.nlc.cn/pcab/xctg/bd/20241216_2642340.shtml)
- [国家图书馆《山海经》专题目录](https://www.nlc.cn/web/yejiefuwu/gtqk/wjls/wjqcsy/wj2024/wjd87/index.shtml)

采用理由：

- 国家图书馆对馆藏 92 种《山海经》版本进行了数字化采集和版本比对支持；
- 可作为 edition inventory、书影、异体字、专名和图像核查入口；
- 数据库本身不自动决定本项目唯一底本，仍须 `R-CLASSICS` 输出版本比较表并由外部 reviewer 签署。

**冻结规则**

- Gate 0 只冻结“国家图书馆知识库为首要比对入口”；
- 不在尚未取得具体版本书影、版权/使用边界、文本 checksum 和 sample collation 前冻结 baseline edition；
- 不从知识库界面抓取或批量复制受限文本/图像进入产品。

### 3.2 历史地理

**主基线**

- [复旦大学历史地理研究中心](https://yugong.fudan.edu.cn/)
- [复旦大学历史地理研究中心：李晓杰教授](https://yugong.fudan.edu.cn/info/1113/3423.htm)
- [复旦大学历史地理研究中心：中国传统文化概论·地理](https://yugong.fudan.edu.cn/info/1025/2266.htm)

采用理由：

- 该中心长期从事中国历史地理、古代地理文献和历史 GIS 研究；
- 李晓杰教授的官方简介显示其从事中国历史地理与古代地理要籍研究，可作为首选外部签署候选；
- 方法上只允许把《山海经》地理解释建为可比较的 candidate set，不构造无来源“唯一正确地图”。

### 3.3 版权与媒体

**主基线**

- [中华人民共和国著作权法（国家版权局）](https://www.ncac.gov.cn/xxfb/flfg/flfg_532/202103/t20210309_50530.html)
- [Creative Commons：About CC Licenses](https://creativecommons.org/share-your-work/cclicenses/)
- [Creative Commons：许可人与使用者注意事项](https://creativecommons.org/share-your-work/licensing-considerations/version4/)

最低发布证据：

- 作者/权利人及其授权能力；
- 原始来源页、具体 licence/version、许可文本 URL；
- 复制、改编、翻译、网络传播、商业使用、地域和期限是否覆盖目标用途；
- attribution、获取日期、文件 checksum、衍生 DAG、撤回联系人；
- 第三方元素、版式、摄影、数据库和数字化成果是否另有权利。

任一项缺失均为 `pending` 或 `unknown`，不得进入 `public/`、build、precache 或 CDN。

### 3.4 声学

**主基线**

- [ITU-R BS.1770-5：节目响度和 true-peak 测量算法](https://www.itu.int/rec/R-REC-BS.1770-5-202311-I/en)
- [EBU R 128 v5.0：响度归一化与最大允许电平](https://tech.ebu.ch/publications/r128)

候选冻结：

- 响度与 true peak 测量实现采用 ITU-R BS.1770-5；
- 报告单位采用 LUFS/LKFS 与 dBTP，并记录 meter/version；
- EBU R 128 的 `-23 LUFS` 是广播节目基线，不直接硬套所有短异兽音效；
- narration、ambient loop、short effect 分 profile 冻结 target、tolerance、duration、loop 和 true-peak；
- 无 autoplay、显式播放、全局单轨、文字说明和 reduced-audio 保持阻断规则。

### 3.5 双语

**主基线**

- [GB/T 16159-2012《汉语拼音正词法基本规则》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=5645BD8DB9D8D73053AD3A2397E15E74)
- [Library of Congress ALA-LC Romanization Tables](https://www.loc.gov/catdir/cpso/roman)

候选冻结：

- 中文规范名优先，拼音作为检索、消歧和英文辅助，不替代汉字主名；
- 项目中文拼音正词法遵循现行 GB/T 16159-2012；
- bibliographic/authority interchange 可参考 ALA-LC Chinese table；
- 神名、异兽名和古地名默认采用“汉字 + Hanyu Pinyin + 英文释义/说明”，不强造英文物种名；
- 发布必须由 `R-BILINGUAL-ZH` 与 `R-BILINGUAL-EN` 双签；任一方未签时保持 draft/reviewed，不进入 published fallback。

### 3.6 无障碍

**主基线**

- [WCAG 2.2 W3C Recommendation](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WAI 键盘界面实践](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

候选冻结：

- 发布目标为 WCAG 2.2 Level AA；
- APG 只作为实现指导，不代替 WCAG normative success criteria；
- 地图必须有结构化列表/表格替代、键盘操作、可见 focus、选择状态与焦点状态分离；
- 图像必须有用途匹配的 alt/long description；声音必须有 transcript/description；
- 必测 reduced motion、forced colors/high contrast、200% zoom、屏幕阅读器、键盘-only 和触控目标；
- 自动扫描不能替代人工辅助技术测试。

### 3.7 性能

**主基线**

- [web.dev：Core Web Vitals 阈值方法](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [web.dev：Web Vitals](https://web.dev/articles/vitals)

外部基线：

- LCP `<= 2.5 s`、INP `<= 200 ms`、CLS `<= 0.1`；
- 以 field data 的第 75 百分位评估，移动和桌面分别观察；
- lab 结果用于诊断，不能冒充 field pass。

项目追加预算仍按 `PERFORMANCE_BUDGETS.md` 管理，包括 lite payload、Zod parse、地图切换、FPS、long task、内存、媒体和 100/500/1000+ fixture。Core Web Vitals 通过不等于 Atlas 地图/搜索/抽屉旅程自动通过。

## 4. 用户提供参考地图的 reviewer 分工

文件：`/Users/llmacbookpro/Downloads/8259114179_29498.png`

- `R-RIGHTS`：权利、作者、来源和衍生许可；当前 `unknown`。
- `R-GEO`：投影、比例尺、地望主张、candidate set 和不确定性；当前不可核验。
- `R-A11Y`：标签密度、色彩、低视力和结构化替代；只能评价抽象设计问题。
- 当前裁决：仅 `internal_visual_reference`；不得复制、矢量化、提取点位、进入 `public/` 或作为 scholarly geography claim。

## 5. Gate 结论

- 项目责任 reviewer：`assigned`
- 主负责人内部签署：`signed`（2026-08-18，见 `DECISION_LOG.md` SJ-D012）
- 外部人工签署：`pending`（未联系任何外部机构或个人；上表候选状态不变）
- 权威来源基线：`assigned`
- 用户提供地图：`internal_visual_reference_only`
- Gate 0：内部工程门槛已由主负责人签署放行；外部机构签署门槛仍 `blocked`
- schema/code 授权：`yes`（限 V1/V2 内部编辑候选范围，见 SJ-D010）

主负责人内部签署只覆盖：当前 reviewer 责任模型、V2 语料与领域实现的内部编辑结论、以及在 `local_candidate` / `isolated_database` 证据层继续推进的授权。它**不构成**古籍校勘、历史地理、法律、母语翻译、辅助技术或真实设备性能的外部专业背书；任何对外发布文案不得据此声称获得机构或专家认可。

下一步由各项目责任 reviewer 依据本文件更新 `EXPERT_REVIEW_QUESTIONS.md`；古籍底本、历史地理 candidate set、具体资产 rights、声音 target、双语 glossary、辅助技术矩阵和性能设备矩阵仍需实际输入与外部人工签署。

