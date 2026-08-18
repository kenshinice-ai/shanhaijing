# 《山海经 Atlas》文档一致性报告

- 生成命令：`npm run verify:docs`
- 生成器版本：`1.0.0`
- 生成器 SHA-256：`af70a7d60ddab56e1891e6af969cfd5a131a94dd4552f50303d0e6fb3e2e1fa6`
- 生成时间：`2026-08-18T07:13:36.633Z`
- 证据层级：`local_candidate`
- 检查结果：`pass`
- 输入文件：30
- 检查数：278
- errors / warnings / info：0 / 0 / 1
- Gate 结论：`blocked`；本报告只证明机械一致性，不替代专家评审、输入冻结或 Gate 0 授权。

## 检查范围

- 必备文档 inventory；
- Markdown 本地链接；
- 文档状态、证据层级与核心蓝图元数据；
- 文档状态和五层 evidence 枚举；
- concept / occurrence / corpus coverage 三项独立统计术语；
- 四个独立证据维度；
- decision、risk 与 expert question ID 连续性；
- README 清单与真实文件一致性；
- 禁止用旧枚举 `static_artifact` 代替 `built_static_artifact`。

## Findings

| Check | Severity | File | Line | Message |
|---|---|---|---:|---|
| gate-blocker-external-signoff | info | docs/REVIEWER_ASSIGNMENTS_2026-08-15.md | — | 项目责任 reviewer 已指定，但外部人工签署仍待完成；Gate 0 必须继续 blocked |

## 输入与 checksum

| Path | Bytes | SHA-256 |
|---|---:|---|
| docs/memoized-riding-giraffe.md | 41872 | `76fa12e9ee9626fea899a1e60d5addfd5894cb9205c15c5623a726a8590eeff9` |
| docs/README.md | 6964 | `5d0d409d58e2df5fc6b53d74167f5e3ada1be8941bce249552297027985d79da` |
| docs/PRODUCT_BLUEPRINT.md | 9667 | `77f1e099f0c0f6569b8d14c3c37fbec46ebaec11896c3b990876fc38a2b13b79` |
| docs/CORPUS_AND_EDITORIAL_POLICY.md | 9308 | `fde5ebf08fd63e8d71bc7ab60b7b6e1af0495549bf144bb4ecdb822d8d6d6f22` |
| docs/CONTENT_COVERAGE_MATRIX.md | 7672 | `3819393d571c748e6d32872ff23d07e676c2a439165115743f6b976664be5253` |
| docs/ENTITY_AND_DATA_DICTIONARY.md | 15229 | `9435dfe990b2577c4121212fc1813e9fc0908faab51a1e4485d1d5ec439b9eba` |
| docs/TAXONOMY.md | 10218 | `7f9a4a468adc3499b8aacf84a4b31c0124615ac6c5553bc5e6b2b56699114df9` |
| docs/GEOGRAPHY_AND_MAPS.md | 10526 | `47bc6d6c057a42b36f6da277a57fc6a14d9820d2a1d7fe0a465ce4d0355bae73` |
| docs/REFERENCE_MAP_AUDIT.md | 12386 | `d8a6e2ce38918e2cade015e7ceebaf49e062784017cee5391ff5b437ac289dd4` |
| docs/CHRONOLOGY_MODEL.md | 7573 | `b0fe562d4ddd9492a7e015f7daef487afb3aee107d13450ebcc59357d89ba8de` |
| docs/VISUAL_DESIGN_SYSTEM.md | 10029 | `91dadc1821ec88f4a493e63dc3ecb2f95f1aae9a4b0c31b9eb3585a29f14564e` |
| docs/MEDIA_ICON_ILLUSTRATION_POLICY.md | 13018 | `553b010b5d889e708778cbd9b680c29483940c2ab9723d0351f5b11f24053532` |
| docs/SOUND_RECONSTRUCTION_POLICY.md | 12957 | `76f9d8de5548dbf9f34260cd9b6138eeeed9a4561f447b4256526795a2288f92` |
| docs/ARCHITECTURE.md | 28344 | `2d9bc13fcf92965a793de2fe20fa31a42545000481f99bd72de1e67e7eee178f` |
| docs/API_CONTRACT.md | 35045 | `8d834c1b6063ed0fcf67a725d02000a6bc50bb2d5ba2f3b83258558bda1bd334` |
| docs/ASSET_MANIFEST_SPEC.md | 30678 | `e40b28bfdc7a1b759019f09c89057e42fa75bad3b4e0c8e2e286cc6bb349bd5b` |
| docs/PERFORMANCE_BUDGETS.md | 25392 | `210cd0f2d773f1a5d0ecab01c27206b0ad11a79a75000c096a1ff49828fa01b4` |
| docs/TEST_AND_VERIFICATION_PLAN.md | 34936 | `f7e2d5faf312cdd41e57e0c0d2fee22d3fd60846e24d50de7869be69fa1cca64` |
| docs/HANDOFF.md | 23262 | `2dd1db78dbf6280c1e8e5bb3d4f9b7f7dc888c9b5eaa956e58a2768e48da6800` |
| docs/HANDOFF_TEMPLATE.md | 8060 | `5f5dcdb36f7b659b4710be10b9eb56e7a39c576bbbcf4dc7cbfe6b570dbc3a2e` |
| docs/DECISION_LOG.md | 17298 | `91514988450e7fd8836350edb1b89a3695e0068b8413d5716c30510de9bb39cd` |
| docs/RISK_REGISTER.md | 4701 | `9ae0ce9ac9f05dc806d1a067cd79bc70b3c35757eae078797ff1bd202a513500` |
| docs/EXPERT_REVIEW_QUESTIONS.md | 5779 | `08d14b6cd490694db13c1534103c3cc9148eb67047c9395a553197f8adf0045c` |
| docs/RELEASE_CHECKLIST.md | 8073 | `30d69365aa2c44f401ba6f728b4b07b8b4bbab670221f345fcc2e2f0abc1df8f` |
| docs/REVIEWER_ASSIGNMENTS_2026-08-15.md | 11314 | `966c83cd776b86f9dfe43f7ff5c3c0f53bf4e8c6f87d2a4eae61c7f0deabcad6` |
| docs/MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md | 9483 | `1a810a4d8022d028664fad9a0fd88bd89d2b2761415cc750a0783a28912ff43b` |
| docs/FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md | 7628 | `c3191b2aaba8a66519cfa1e9d34e0d31acf17d0eb05138905b4a5db23ebb7d46` |
| docs/FANTASY_COMPOSITE_MAP_GENERATION_STATUS.md | 3504 | `f13b92f0e31d40c709fdc18a4900223c31bb71f1e4cb4256ba3d45502425f6e0` |
| docs/generated/README.md | 1660 | `23cc700b75305566acc0cb61d91e580688c4f776b6c0eb2800da76c0717fd9c4` |
| docs/prompts/fantasy-composite-map-v1.txt | 3314 | `c73779d6d7c0c3ffc6fe186f46a22fd0ec6bc4bd6862239154447e31128a8cac` |

## 解释边界

`pass` 只表示以上机械检查在声明输入上通过。底本、段落切分、Pilot scope、枚举语义、学术结论、版权、声学、双语、无障碍和性能 reviewer 仍未由本报告批准；不得据此开始 schema、seed、API、UI、资产生成、staging 或 production。
