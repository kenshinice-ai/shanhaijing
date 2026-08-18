BEGIN;

/*
  SJ-D011: the artistic overview is an original, deterministic, procedurally
  generated SVG master.  The asset is project-authored vector art derived only
  from the shj_* tables; no third-party imagery, fonts, or model output is
  involved, so rights are verified by construction.

  Reproducibility chain: prompt_path points at the generator script and
  prompt_sha256 is the SHA-256 of that script.  verify:domain re-hashes
  both the script and the published asset location; regenerate with
  `npx tsx scripts/generate_overview.ts` after any data change.
*/

UPDATE shj_artistic_overviews SET
  status = 'published',
  coordinate_space = 'artistic-composite-svg-v1',
  asset_url = '/media/shanhaijing/artistic-overview-v1.svg',
  prompt_path = 'scripts/generate_overview.ts',
  prompt_sha256 = '9c4dc6736408b27af116fd4fb13da626af80a84897d56b0a6c3be1aab634affa',
  description_zh = '由项目自绘的确定性程序化 SVG 手卷母图：山簇、水流、海面与灵光全部从原文段落与拓扑数据推导，无标签，热点与图例由界面程序叠加。',
  description_en = 'An original, deterministic procedural SVG handscroll master: mountain clusters, rivers, seas, and auras are derived from the passage and topology data. The master is label-free; hotspots and legends are laid over it programmatically.',
  disclosure_zh = '艺术总览依据文本主题进行幻想拼接，不代表古代地望或现代坐标定论。',
  disclosure_en = 'The artistic overview is a fantasy synthesis of textual themes, not a conclusion about ancient geography or modern coordinates.'
WHERE slug = 'fantasy-composite-v1'
  AND work_id = '10000000-0000-4000-8000-000000000011';

COMMIT;
