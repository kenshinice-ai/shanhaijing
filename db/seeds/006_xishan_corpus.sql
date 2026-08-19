-- 006:《西山经》冻结语料（由 scripts/generate_xishan_seed.ts 确定性生成，勿手改）
--
-- 底本:https://ctext.org/shan-hai-jing/xi-shan-jing/zh
-- 取回:2026-08-18    原始文件 SHA-256:913ef2534ea3cd9fe1b4ce4a121ae64ab99849944d4857ab7fad5b188510d664
-- 切分:xishan-full-v1    edition checksum:40468036bb53209ffd4f17330f447c0530237c3bebde31f98fc1eca44660388e
--
-- 依 X-2 裁定:异体字不算异文,底本照 ctext 印出的字形录入;
-- 已丢弃异体差异 45 处,登记待裁差异 11 处。
-- 段落以 draft 入库:文本已冻结,尚未逐段审核,因此不进 API 与产物。

BEGIN;

INSERT INTO shj_text_editions (id, work_id, scope, slug, title, source_url, source_note, rights_status, checksum_sha256, is_baseline, review_status)
SELECT '21000000-0000-4000-8000-000000000001', w.id, 'xishan', 'xishan-v1-public-domain-collation', '《西山经》公版校勘本 v1',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh',
  '白文底本取自 ctext（2026-08-18），与维基文库本（含郭璞注）逐段校核。依 X-2：异体字不算异文，底本照印出字形录入；待裁差异 11 处登记于 scripts/data/xishan_corpus_v1.json。',
  'verified', '40468036bb53209ffd4f17330f447c0530237c3bebde31f98fc1eca44660388e', true, 'reviewed'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (work_id, slug) DO UPDATE SET checksum_sha256=EXCLUDED.checksum_sha256, source_note=EXCLUDED.source_note;

INSERT INTO shj_text_sections (id, edition_id, slug, sequence, reference_label, title_zh, title_en, review_status)
VALUES ('22000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', 'xishan-first-route', 1, '西山经之首', '西山经·华山首列', 'Xishan Jing · Huashan first route', 'draft')
ON CONFLICT (id) DO UPDATE SET title_zh=EXCLUDED.title_zh, title_en=EXCLUDED.title_en;

INSERT INTO shj_text_sections (id, edition_id, slug, sequence, reference_label, title_zh, title_en, review_status)
VALUES ('22000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000001', 'xici2-route', 2, '西次二经', '西山经·西次二经', 'Xishan Jing · second route', 'draft')
ON CONFLICT (id) DO UPDATE SET title_zh=EXCLUDED.title_zh, title_en=EXCLUDED.title_en;

INSERT INTO shj_text_sections (id, edition_id, slug, sequence, reference_label, title_zh, title_en, review_status)
VALUES ('22000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000001', 'xici3-route', 3, '西次三经', '西山经·西次三经', 'Xishan Jing · third route', 'draft')
ON CONFLICT (id) DO UPDATE SET title_zh=EXCLUDED.title_zh, title_en=EXCLUDED.title_en;

INSERT INTO shj_text_sections (id, edition_id, slug, sequence, reference_label, title_zh, title_en, review_status)
VALUES ('22000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000001', 'xici4-route', 4, '西次四经', '西山经·西次四经', 'Xishan Jing · fourth route', 'draft')
ON CONFLICT (id) DO UPDATE SET title_zh=EXCLUDED.title_zh, title_en=EXCLUDED.title_en;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', 'xishan-p001', '西山经·錢來', 1,
  '《西山經》華山之首，曰錢來之山，其上多松，其下多洗石。有獸焉，其狀如羊而馬尾，名曰羬羊，其脂可以已腊。', '西山經華山之首曰錢來之山其上多松其下多洗石有獸焉其狀如羊而馬尾名曰羬羊其脂可以已腊',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 1 段', '7c87951dab25acc005707b56cd67ab9f5ddb49d772af8bd6ac3b62fa8a654e46', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', 'xishan-p002', '西山经·松果', 2,
  '西四十五里，曰松果之山，濩水出焉，北流注于渭，其中多銅。有鳥焉，其名曰䳋渠，其狀如山雞，黑身赤足，可以已𦢊。', '西四十五里曰松果之山濩水出焉北流注于渭其中多銅有鳥焉其名曰䳋渠其狀如山雞黑身赤足可以已𦢊',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 2 段', '97af4374430dc0f99ebb1e2b85818cc6cae5a5d72808efaebda3b9db4a2afea1', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000003', '22000000-0000-4000-8000-000000000001', 'xishan-p003', '西山经·太華', 3,
  '又西六十里，曰太華之山，削成而四方，其高五千仞，其廣十里，鳥獸莫居。有蛇焉，名曰肥𧔥，六足四翼，見則天下大旱。', '又西六十里曰太華之山削成而四方其高五千仞其廣十里鳥獸莫居有蛇焉名曰肥𧔥六足四翼見則天下大旱',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 3 段', '91de48dddbd4f26ead9d33981c991be431a84a359d475521ac86c5c87be6870b', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000004', '22000000-0000-4000-8000-000000000001', 'xishan-p004', '西山经·小華', 4,
  '又西八十里，曰小華之山，其木多荊杞，其獸多㸲牛，其陰多磬石，其陽多㻬琈之玉，鳥多赤鷩，可以禦火，其草有萆荔，狀如烏韭，而生於石上，亦緣木而生，食之已心痛。', '又西八十里曰小華之山其木多荊杞其獸多㸲牛其陰多磬石其陽多㻬琈之玉鳥多赤鷩可以禦火其草有萆荔狀如烏韭而生於石上亦緣木而生食之已心痛',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 4 段', '6b34be02a9fdf00df23c313f1a7c12a873800631c4773ef928c610274433abb6', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000005', '22000000-0000-4000-8000-000000000001', 'xishan-p005', '西山经·符禺', 5,
  '又西八十里，曰符禺之山，其陽多銅，其陰多鐵。其上有木焉，名曰文莖，其實如棗，可以已聾。其草多條，其狀如葵，而赤花黃實，如嬰兒舌，食之使人不惑。符禺之水出焉，而北流注于渭。其獸多葱聾，其狀如羊而赤鬣。其鳥多鴖，其狀如翠而赤喙，可以禦火。', '又西八十里曰符禺之山其陽多銅其陰多鐵其上有木焉名曰文莖其實如棗可以已聾其草多條其狀如葵而赤花黃實如嬰兒舌食之使人不惑符禺之水出焉而北流注于渭其獸多葱聾其狀如羊而赤鬣其鳥多鴖其狀如翠而赤喙可以禦火',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 5 段', '7dbdde59b10d810f5197a83f08940c905266d433b750e8fcf2aa06aecbac3c1e', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000006', '22000000-0000-4000-8000-000000000001', 'xishan-p006', '西山经·石脆', 6,
  '又西六十里，曰石脆之山，其木多椶柟，其草多條，其狀如韭，而白華黑實，食之已疥。其陽多㻬琈之玉，其陰多銅。灌水出焉，而北流注于禺水。其中有流赭，以塗牛馬無病。', '又西六十里曰石脆之山其木多椶柟其草多條其狀如韭而白華黑實食之已疥其陽多㻬琈之玉其陰多銅灌水出焉而北流注于禺水其中有流赭以塗牛馬無病',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 6 段', '0ef50c0d329e23ef5b129877e814dd694edd39dbba01a95f7e5442664bd22f62', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000007', '22000000-0000-4000-8000-000000000001', 'xishan-p007', '西山经·英', 7,
  '又西七十里，曰英山，其上多杻橿，其陰多鐵，其陽多赤金。禺水出焉，北流注于招水，其中多䰷魚，其狀如鱉，其音如羊。其陽多箭䉋，其獸多㸲牛、羬羊。有鳥焉，其狀如鶉，黃身而赤喙，其名曰肥遺，食之已癘，可以殺蟲。', '又西七十里曰英山其上多杻橿其陰多鐵其陽多赤金禺水出焉北流注于招水其中多䰷魚其狀如鱉其音如羊其陽多箭䉋其獸多㸲牛羬羊有鳥焉其狀如鶉黃身而赤喙其名曰肥遺食之已癘可以殺蟲',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 7 段', '5834452ed6e1fc35a1014e3bbf61464a3a471a50bfeec5c95720281c4d09d322', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000008', '22000000-0000-4000-8000-000000000001', 'xishan-p008', '西山经·竹', 8,
  '又西五十二里，曰竹山，其上多喬木，其陰多鐵。有草焉，其名曰黃雚，其狀如樗，其葉如麻，白花而赤實，其狀如赭，浴之已疥，又可以已胕。竹水出焉，北流注于渭，其陽多竹箭，多蒼玉。丹水出焉，東南流注于洛水，其中多水玉，多人魚。有獸焉，其狀如豚而白毛，大如笄而黑端，名曰毫彘。', '又西五十二里曰竹山其上多喬木其陰多鐵有草焉其名曰黃雚其狀如樗其葉如麻白花而赤實其狀如赭浴之已疥又可以已胕竹水出焉北流注于渭其陽多竹箭多蒼玉丹水出焉東南流注于洛水其中多水玉多人魚有獸焉其狀如豚而白毛大如笄而黑端名曰毫彘',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 8 段', '8f014a1d4764778ad8b983ea043eb14fcd7d7be4bcbb304b94496cf0b4ea0792', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000009', '22000000-0000-4000-8000-000000000001', 'xishan-p009', '西山经·浮', 9,
  '又西百二十里，曰浮山，多盼木，枳葉而無傷，木蟲居之。有草焉，名曰薰草，麻葉而方莖，赤華而黑實，臭如蘼蕪，佩之可以已癘。', '又西百二十里曰浮山多盼木枳葉而無傷木蟲居之有草焉名曰薰草麻葉而方莖赤華而黑實臭如蘼蕪佩之可以已癘',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 9 段', '678a5b87dada63a1154d0b0a3aa9bedabd1dc2dc8f912c0e8c8c24d8daf75579', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000010', '22000000-0000-4000-8000-000000000001', 'xishan-p010', '西山经·羭次', 10,
  '又西七十里，曰羭次之山，漆水出焉，北流注于渭。其上多棫橿，其下多竹箭，其陰多赤銅，其陽多嬰垣之玉。有獸焉，其狀如禺而長臂，善投，其名曰囂。有鳥焉，其狀如梟，人面而一足，曰橐𩇯，冬見夏蟄，服之不畏雷。', '又西七十里曰羭次之山漆水出焉北流注于渭其上多棫橿其下多竹箭其陰多赤銅其陽多嬰垣之玉有獸焉其狀如禺而長臂善投其名曰囂有鳥焉其狀如梟人面而一足曰橐𩇯冬見夏蟄服之不畏雷',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 10 段', 'a56adfbfd58f8539f1dba86dd1ceb80f0fea70820698fa2260b77cc777757739', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000011', '22000000-0000-4000-8000-000000000001', 'xishan-p011', '西山经·時', 11,
  '又西百五十里，曰時山，無草木。逐水出焉，北流注于渭，其中多水玉。', '又西百五十里曰時山無草木逐水出焉北流注于渭其中多水玉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 11 段', '41444f4654e96b9c53fdccc009ef735714962e80eb54dc04da7c0e720c707503', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000012', '22000000-0000-4000-8000-000000000001', 'xishan-p012', '西山经·南', 12,
  '又西百七十里，曰南山，上多丹粟。丹水出焉，北流注于渭。獸多猛豹，鳥多尸鳩。', '又西百七十里曰南山上多丹粟丹水出焉北流注于渭獸多猛豹鳥多尸鳩',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 12 段', 'b4e7f6d2c37d98c8a07811d2e7c37c8757955ba62092e57932f0674325e84b58', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000013', '22000000-0000-4000-8000-000000000001', 'xishan-p013', '西山经·大時', 13,
  '又西百八十里，曰大時之山，上多榖柞，下多杻橿，陰多銀，陽多白玉。涔水出焉，北流注于渭，清水出焉，南流注于漢水。', '又西百八十里曰大時之山上多榖柞下多杻橿陰多銀陽多白玉涔水出焉北流注于渭清水出焉南流注于漢水',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 13 段', '2e57f2b745769377e367cd27b49921d9ee235012f9867fb6c6626c2cb20862aa', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000014', '22000000-0000-4000-8000-000000000001', 'xishan-p014', '西山经·嶓冡', 14,
  '又西三百二十里，曰嶓冡之山，漢水出焉，而東南流注于沔；囂水出焉，北流注于湯水。其上多桃枝鉤端，獸多犀兕熊羆，鳥多白翰赤鷩。有草焉，其葉如蕙，其本如桔梗，黑華而不實，名曰蓇蓉，食之使人無子。', '又西三百二十里曰嶓冡之山漢水出焉而東南流注于沔囂水出焉北流注于湯水其上多桃枝鉤端獸多犀兕熊羆鳥多白翰赤鷩有草焉其葉如蕙其本如桔梗黑華而不實名曰蓇蓉食之使人無子',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 14 段', '5476b3834015f945a17b91897f08b6289129ba6381830f3d571a835493481288', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000015', '22000000-0000-4000-8000-000000000001', 'xishan-p015', '西山经·天帝', 15,
  '又西三百五十里，曰天帝之山，上多椶柟，下多菅蕙。有獸焉，其狀如狗，名曰谿邊，席其皮者不蠱。有鳥焉，其狀如鶉，黑文而赤翁，名曰櫟，食之已痔。有草焉，其狀如葵，其臭如蘼蕪，名曰杜衡，可以走馬，食之已癭。', '又西三百五十里曰天帝之山上多椶柟下多菅蕙有獸焉其狀如狗名曰谿邊席其皮者不蠱有鳥焉其狀如鶉黑文而赤翁名曰櫟食之已痔有草焉其狀如葵其臭如蘼蕪名曰杜衡可以走馬食之已癭',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 15 段', 'fffc68107ed222b9cebb8997f828c37ac09a95e166e57dd4ab8c1a5df86254e5', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000016', '22000000-0000-4000-8000-000000000001', 'xishan-p016', '西山经·皋塗', 16,
  '西南三百八十里，曰皋塗之山，薔水出焉，西流注于諸資之水，塗水出焉，南流注于集獲之水。其陽多丹粟，其陰多銀、黃金，其上多桂木。有白石焉，其名曰礜，可以毒鼠。有草焉，其狀如槀茇，其葉如葵而赤背，名曰無條，可以毒鼠。有獸焉，其狀如鹿而白尾，馬足人手而四角，名曰𤣎如。有鳥焉，其狀如鴟而人足，名曰數斯，食之已癭。', '西南三百八十里曰皋塗之山薔水出焉西流注于諸資之水塗水出焉南流注于集獲之水其陽多丹粟其陰多銀黃金其上多桂木有白石焉其名曰礜可以毒鼠有草焉其狀如槀茇其葉如葵而赤背名曰無條可以毒鼠有獸焉其狀如鹿而白尾馬足人手而四角名曰𤣎如有鳥焉其狀如鴟而人足名曰數斯食之已癭',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 16 段', '3e1a1bf1663938f34211e0cfc16f0a698ce814ce85b74d69ab37684b585826f8', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000017', '22000000-0000-4000-8000-000000000001', 'xishan-p017', '西山经·黃', 17,
  '又西百八十里，曰黃山，無草木，多竹箭。盼水出焉，西流注于赤水，其中多玉。有獸焉，其狀如牛，而蒼黑大目，其名曰𤛎。有鳥焉，其狀如鴞，青羽赤喙，人舌能言，名曰鸚䳇。', '又西百八十里曰黃山無草木多竹箭盼水出焉西流注于赤水其中多玉有獸焉其狀如牛而蒼黑大目其名曰𤛎有鳥焉其狀如鴞青羽赤喙人舌能言名曰鸚䳇',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 17 段', '7459ad0ed31de64463ca81b2399922e19f530638ea816fcf9a9e86361aa0788e', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000018', '22000000-0000-4000-8000-000000000001', 'xishan-p018', '西山经·翠', 18,
  '又西二百里，曰翠山，其上多椶枏，其下多竹箭，其陽多黃金、玉，其陰多旄牛，麢、麝；其鳥多鸓，其狀如鵲，赤黑而兩首四足，可以禦火。', '又西二百里曰翠山其上多椶枏其下多竹箭其陽多黃金玉其陰多旄牛麢麝其鳥多鸓其狀如鵲赤黑而兩首四足可以禦火',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 18 段', '02d4bdfcb9bbdb750810803f8c609e7d50e0fbcf1ff04e5051b746c2d4cdcb17', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000019', '22000000-0000-4000-8000-000000000001', 'xishan-p019', '西山经·騩', 19,
  '又西二百五十里，曰騩山，是錞于西海，無草木，多玉。淒水出焉，西流注于海，其中多采石、黃金，多丹粟。', '又西二百五十里曰騩山是錞于西海無草木多玉淒水出焉西流注于海其中多采石黃金多丹粟',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 19 段', '78944e810dc45181f7c56c45afb1ddb77bda12199f7f7217bfb32b8a959e8392', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000020', '22000000-0000-4000-8000-000000000001', 'xishan-p020', '西山经·西山经之首·祠礼', 20,
  '凡《西經》之首，自錢來之山至于騩山，凡十九山，二千九百五十七里。華山冢也，其祠之禮：太牢。羭山神也，祠之用燭，齋百日以百犧，瘞用百瑜，湯其酒百樽，嬰以百珪百璧。其餘十七山之屬，皆毛牷用一羊祠之。燭者百草之未灰，白席采等純之。', '凡西經之首自錢來之山至于騩山凡十九山二千九百五十七里華山冢也其祠之禮太牢羭山神也祠之用燭齋百日以百犧瘞用百瑜湯其酒百樽嬰以百珪百璧其餘十七山之屬皆毛牷用一羊祠之燭者百草之未灰白席采等純之',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 20 段', '9e7afec5a607022a6c78011202c9e71e746583bd33b2d8ae8f15a8c34f1159ba', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000021', '22000000-0000-4000-8000-000000000002', 'xishan-p021', '西山经·鈐', 1,
  '《西次二經》之首，曰鈐山，其上多銅，其下多玉，其木多杻橿。', '西次二經之首曰鈐山其上多銅其下多玉其木多杻橿',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 21 段', '2c99cbd6233143963c70b5ae2e5f8505ba0f00962aa7008426732a87ff3f9662', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000022', '22000000-0000-4000-8000-000000000002', 'xishan-p022', '西山经·泰冒', 2,
  '西二百里，曰泰冒之山，其陽多金，其陰多鐵。浴水出焉，東流注于河，其中多藻玉，多白蛇。', '西二百里曰泰冒之山其陽多金其陰多鐵浴水出焉東流注于河其中多藻玉多白蛇',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 22 段', '82d1ee86cb427e2b11868fe9e37517187bd8b57d3235a7502dd7c4eb6cc7aad5', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000023', '22000000-0000-4000-8000-000000000002', 'xishan-p023', '西山经·數歷', 3,
  '又西一百七十里，曰數歷之山，其上多黃金，其下多銀，其木多杻橿，其鳥多鸚䳇。楚水出焉，而南流注于渭，其中多珠。', '又西一百七十里曰數歷之山其上多黃金其下多銀其木多杻橿其鳥多鸚䳇楚水出焉而南流注于渭其中多珠',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 23 段', '07384f41b1348ad7e817e4a99b96ab109d8cc0294a9c6cc850ce65f47ada8e0d', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000024', '22000000-0000-4000-8000-000000000002', 'xishan-p024', '西山经·高', 4,
  '又西百五十里曰高山，其上多銀，其下多青碧、雄黃，其木多椶，其草多竹。涇水出焉，而東流注于渭，其中多磬石、青碧。', '又西百五十里曰高山其上多銀其下多青碧雄黃其木多椶其草多竹涇水出焉而東流注于渭其中多磬石青碧',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 24 段', '56116007cc7e83deb8f2548196035d8c06322d53ee2c62ebaadf5606ab1cd221', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000025', '22000000-0000-4000-8000-000000000002', 'xishan-p025', '西山经·女床', 5,
  '西南三百里，曰女床之山，其陽多赤銅，其陰多石涅，其獸多虎豹犀兕。有鳥焉，其狀如翟而五彩文，名曰鸞鳥，見則天下安寧。', '西南三百里曰女床之山其陽多赤銅其陰多石涅其獸多虎豹犀兕有鳥焉其狀如翟而五彩文名曰鸞鳥見則天下安寧',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 25 段', 'eedc9536bf803b6c689640330e955bd0f0281d1fd7ae4042fb44fe7794df84ee', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000026', '22000000-0000-4000-8000-000000000002', 'xishan-p026', '西山经·龍首', 6,
  '又西二百里，曰龍首之山，其陽多黃金，其陰多鐵。苕水出焉，東南流注于涇水，其中多美玉。', '又西二百里曰龍首之山其陽多黃金其陰多鐵苕水出焉東南流注于涇水其中多美玉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 26 段', '4b2fa4a62a3d871a6d5ed1edad3395ba31d08ec9209ff405345a8648defea361', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000027', '22000000-0000-4000-8000-000000000002', 'xishan-p027', '西山经·鹿臺', 7,
  '又西二百里，曰鹿臺之山，其上多白玉，其下多銀，其獸多㸲牛、羬羊、白豪。有鳥焉，其狀如雄雞而人面，名曰鳧徯，其鳴自叫也，見則有兵。', '又西二百里曰鹿臺之山其上多白玉其下多銀其獸多㸲牛羬羊白豪有鳥焉其狀如雄雞而人面名曰鳧徯其鳴自叫也見則有兵',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 27 段', '96c2d1de00fb03ffc7c6935d30a8552ac174b74d6f6d652f53044e8ffbd7930d', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000028', '22000000-0000-4000-8000-000000000002', 'xishan-p028', '西山经·鳥危', 8,
  '西南二百里，曰鳥危之山，其陽多磬石，其陰多檀楮，其中多女床。鳥危之水出焉，西流注于赤水，其中多丹粟。', '西南二百里曰鳥危之山其陽多磬石其陰多檀楮其中多女床鳥危之水出焉西流注于赤水其中多丹粟',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 28 段', '8056c5009a2e18450e57148c0a74c77e2721919dd06316190d4738a3879cf5b3', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000029', '22000000-0000-4000-8000-000000000002', 'xishan-p029', '西山经·小次', 9,
  '又西四百里，曰小次之山，其上多白玉，其下多赤銅。有獸焉，其狀如猿，而白首赤足，名曰朱厭，見則大兵。', '又西四百里曰小次之山其上多白玉其下多赤銅有獸焉其狀如猿而白首赤足名曰朱厭見則大兵',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 29 段', '1e7173a796a9cf3fafe61a2b850f96afe173b0cafee73c7f8d985e36748fae17', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000030', '22000000-0000-4000-8000-000000000002', 'xishan-p030', '西山经·大次', 10,
  '又西三百里，曰大次之山，其陽多堊，其陰多碧，其獸多㸲牛、麢羊。', '又西三百里曰大次之山其陽多堊其陰多碧其獸多㸲牛麢羊',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 30 段', '2216da5aa816fed4682aed17c823f7bfba2c87522d341fdb12c9fb6fba9448f8', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000031', '22000000-0000-4000-8000-000000000002', 'xishan-p031', '西山经·薰吳', 11,
  '又西四百里，曰薰吳之山，無草木，多金玉。', '又西四百里曰薰吳之山無草木多金玉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 31 段', '5e47a79ff3885b0949f74f0ca9d2bc40e2ae29483f630736806bdca08bd892d2', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000032', '22000000-0000-4000-8000-000000000002', 'xishan-p032', '西山经·㕄陽', 12,
  '又西四百里，曰㕄陽之山，其木多㮨、柟、豫章，其獸多犀、兕、虎、犳、㸲牛。', '又西四百里曰㕄陽之山其木多㮨柟豫章其獸多犀兕虎犳㸲牛',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 32 段', 'eefc1c7ecce86da43cbc9c13dc6582febd8160557fcd15c6b194e50c9ad0f247', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000033', '22000000-0000-4000-8000-000000000002', 'xishan-p033', '西山经·眾獸', 13,
  '又西二百五十里，曰眾獸之山，其上多㻬琈之玉，其下多檀楮，多黃金，其獸多犀、兕。', '又西二百五十里曰眾獸之山其上多㻬琈之玉其下多檀楮多黃金其獸多犀兕',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 33 段', 'bf70c71ce3be32c585339891d2bcf100d1037fcd27c2d1fc9724241f23bb226b', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000034', '22000000-0000-4000-8000-000000000002', 'xishan-p034', '西山经·皇人', 14,
  '又西五百里，曰皇人之山，其上多金玉，其下多青雄黃。皇水出焉，西流注于赤水，其中多丹粟。', '又西五百里曰皇人之山其上多金玉其下多青雄黃皇水出焉西流注于赤水其中多丹粟',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 34 段', 'f6eec05aa506944f36227e31ccd367122c57ab30682867cf8eb195b84779b426', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000035', '22000000-0000-4000-8000-000000000002', 'xishan-p035', '西山经·中皇', 15,
  '又西三百里，曰中皇之山，其上多黃金，其下多蕙、棠。', '又西三百里曰中皇之山其上多黃金其下多蕙棠',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 35 段', '0259b4f3671e0fbd2f35ab945248ea37d187cf1ae0eb13720b3628e664ae7b06', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000036', '22000000-0000-4000-8000-000000000002', 'xishan-p036', '西山经·西皇', 16,
  '又西三百五十里，曰西皇之山，其陽多金，其陰多鐵，其獸多麋鹿、㸲牛。', '又西三百五十里曰西皇之山其陽多金其陰多鐵其獸多麋鹿㸲牛',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 36 段', 'f7b423d5def5757d1c1a224ea49364f29c58fdce961c6bd0e7879c05d9578a6a', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000037', '22000000-0000-4000-8000-000000000002', 'xishan-p037', '西山经·萊', 17,
  '又西三百五十里，曰萊山，其木多檀楮，其鳥多羅羅，是食人。', '又西三百五十里曰萊山其木多檀楮其鳥多羅羅是食人',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 37 段', '3bccb37c18c6093ef0dae0016a8c152e1f8f77e66ef5122e973726cd9e27cefc', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000038', '22000000-0000-4000-8000-000000000002', 'xishan-p038', '西山经·西次二经·祠礼', 18,
  '凡《西次二經》之首，自鈐山至于萊山，凡十七山，四千一百四十里。其十神者，皆人面而馬身。其七神皆人面牛身，四足而一臂，操杖以行，是為飛獸之神；其祠之，毛用少牢，白菅為席。其十輩神者，其祠之，毛一雄鷄，鈐而不糈；毛采。', '凡西次二經之首自鈐山至于萊山凡十七山四千一百四十里其十神者皆人面而馬身其七神皆人面牛身四足而一臂操杖以行是為飛獸之神其祠之毛用少牢白菅為席其十輩神者其祠之毛一雄鷄鈐而不糈毛采',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 38 段', 'be8c4870b78e83c19ce58d308e6a9a4c16bae08108a54234813f7e3a643e7007', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000039', '22000000-0000-4000-8000-000000000003', 'xishan-p039', '西山经·崇吾', 1,
  '《西次三經》之首，曰崇吾之山，在河之南，北望冡遂，南望䍃之澤，西望帝之搏、獸之丘，東望䗡淵。有木焉，員葉而白柎，赤華而黑理，其實如枳，食之宜子孫。有獸焉，其狀如禺而文臂，豹虎而善投，名曰舉父。有鳥焉，其狀如鳧，而一翼一目，相得乃飛，名曰蠻蠻，見則天下大水。', '西次三經之首曰崇吾之山在河之南北望冡遂南望䍃之澤西望帝之搏獸之丘東望䗡淵有木焉員葉而白柎赤華而黑理其實如枳食之宜子孫有獸焉其狀如禺而文臂豹虎而善投名曰舉父有鳥焉其狀如鳧而一翼一目相得乃飛名曰蠻蠻見則天下大水',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 39 段', '8e177344457c2e959bfd6db78094b57eb4362ef3fb165332cc923f47521eb9b9', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000040', '22000000-0000-4000-8000-000000000003', 'xishan-p040', '西山经·長沙', 2,
  '西北三百里，曰長沙之山，泚水出焉，北流注于泑水，無草木，多青雄黃。', '西北三百里曰長沙之山泚水出焉北流注于泑水無草木多青雄黃',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 40 段', 'cb3991763eb602f88247789f4e054e0544e3357f66a9f071567a425b7a229c36', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000041', '22000000-0000-4000-8000-000000000003', 'xishan-p041', '西山经·不周', 3,
  '又西北三百七十里，曰不周之山。北望諸毗之山，臨彼嶽崇之山，東望泑澤，河水所潛也，其源渾渾泡泡。爰有嘉果，其實如桃，其葉如棗，黃華而赤柎，食之不勞。', '又西北三百七十里曰不周之山北望諸毗之山臨彼嶽崇之山東望泑澤河水所潛也其源渾渾泡泡爰有嘉果其實如桃其葉如棗黃華而赤柎食之不勞',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 41 段', 'c97229e6e8cbb4cbca787d1db5e8078606b9f229d13207cc7a233915b5500357', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000042', '22000000-0000-4000-8000-000000000003', 'xishan-p042', '西山经·峚', 4,
  '又西北四百二十里，曰峚山，其上多丹木，員葉而赤莖，黃華而赤實，其味如飴，食之不飢。丹水出焉，西流注于稷澤，其中多白玉，是有玉膏，其源沸沸湯湯，黃帝是食是饗。是生玄玉。玉膏所出，以灌丹木。丹木五歲，五色乃清，五味乃馨。黃帝乃取峚山之玉榮，而投之鍾山之陽。瑾瑜之玉為良，堅粟精密，濁澤有而光。五色發作，以和柔剛。天地鬼神，是食是饗；君子服之，以禦不祥。自峚山至于鍾山，四百六十里，其間盡澤也。是多奇鳥、怪獸、奇魚，皆異物焉。', '又西北四百二十里曰峚山其上多丹木員葉而赤莖黃華而赤實其味如飴食之不飢丹水出焉西流注于稷澤其中多白玉是有玉膏其源沸沸湯湯黃帝是食是饗是生玄玉玉膏所出以灌丹木丹木五歲五色乃清五味乃馨黃帝乃取峚山之玉榮而投之鍾山之陽瑾瑜之玉為良堅粟精密濁澤有而光五色發作以和柔剛天地鬼神是食是饗君子服之以禦不祥自峚山至于鍾山四百六十里其間盡澤也是多奇鳥怪獸奇魚皆異物焉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 42 段', 'b5cb1b114c30bb03cb032a937aa5b302b34fba78945c6448919708b8c88cef5b', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000043', '22000000-0000-4000-8000-000000000003', 'xishan-p043', '西山经·鍾', 5,
  '又西北四百二十里，曰鍾山，其子曰鼓，其狀如人面而龍身，是與欽䲹殺葆江于崑崙之陽，帝乃戮之鍾山之東曰𡺯崖，欽䲹化為大鶚，其狀如鵰而黑文白首，赤喙而虎爪，其音如晨鵠，見則有大兵；鼓亦化為鵔鳥，其狀如鴟，赤足而直喙，黃文而白首，其音如鵠，見則其邑大旱。', '又西北四百二十里曰鍾山其子曰鼓其狀如人面而龍身是與欽䲹殺葆江于崑崙之陽帝乃戮之鍾山之東曰𡺯崖欽䲹化為大鶚其狀如鵰而黑文白首赤喙而虎爪其音如晨鵠見則有大兵鼓亦化為鵔鳥其狀如鴟赤足而直喙黃文而白首其音如鵠見則其邑大旱',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 43 段', '47a3bbc6ad94eb3458c4514b8243d60bec482311c5bd1adddcb75231598698ec', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000044', '22000000-0000-4000-8000-000000000003', 'xishan-p044', '西山经·泰器', 6,
  '又西百八十里，曰泰器之山。觀水出焉，西流注于流沙。是多文鰩魚，狀如鯉魚，魚身而鳥翼，蒼文而白首，赤喙，常行西海，遊於東海，以夜飛。其音如鸞雞，其味酸甘，食之已狂，見則天下大穰。', '又西百八十里曰泰器之山觀水出焉西流注于流沙是多文鰩魚狀如鯉魚魚身而鳥翼蒼文而白首赤喙常行西海遊於東海以夜飛其音如鸞雞其味酸甘食之已狂見則天下大穰',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 44 段', 'e8e1b41d2ebff345ad46dd1cbed5aaddaf7c02b0c7925670cdfa9bc8be9c02d5', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000045', '22000000-0000-4000-8000-000000000003', 'xishan-p045', '西山经·槐江', 7,
  '又西三百二十里，曰槐江之山。丘時之水出焉，而北流注于泑水。其中多蠃母，其上多青雄黃，多藏琅玕、黃金、玉，其陽多丹粟，其陰多采黃金、銀。實惟帝之平圃，神英招司之，其狀馬身而人面，虎文而鳥翼，徇于四海，其音如榴。南望崑崙，其光熊熊，其氣魂魂。西望大澤，后稷所潛也；其中多玉，其陰多榣木之有若。北望諸毗，槐鬼離侖居之，鷹鸇之所宅也。東望恒山四成，有窮鬼居之，各在一搏。爰有淫水，其清洛洛。有天神焉，其狀如牛，而八足二首馬尾，其音如勃皇，見則其邑有兵。', '又西三百二十里曰槐江之山丘時之水出焉而北流注于泑水其中多蠃母其上多青雄黃多藏琅玕黃金玉其陽多丹粟其陰多采黃金銀實惟帝之平圃神英招司之其狀馬身而人面虎文而鳥翼徇于四海其音如榴南望崑崙其光熊熊其氣魂魂西望大澤后稷所潛也其中多玉其陰多榣木之有若北望諸毗槐鬼離侖居之鷹鸇之所宅也東望恒山四成有窮鬼居之各在一搏爰有淫水其清洛洛有天神焉其狀如牛而八足二首馬尾其音如勃皇見則其邑有兵',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 45 段', '4eda1dbfa996c0e5771ad9ebd38dd0628af69c0e4a8d16151a763e5221c00163', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000046', '22000000-0000-4000-8000-000000000003', 'xishan-p046', '西山经·崑崙', 8,
  '西南四百里，曰崑崙之丘，是實惟帝之下都，神陸吾司之。其神狀虎身而九尾，人面而虎爪；是神也，司天之九部及帝之囿時。有獸焉，其狀如羊而四角，名曰土螻，是食人。有鳥焉，其狀如蜂，大如鴛鴦，名曰欽原，蠚鳥獸則死，蠚木則枯。有鳥焉，其名曰鶉鳥，是司帝之百服。有木焉，其狀如棠，黃華赤實，其味如李而無核，名曰沙棠，可以禦水，食之使人不溺。有草焉，名曰薲草，其狀如葵，其味如葱，食之已勞。河水出焉，而南流東注于無達。赤水出焉，而東南流注于氾天之水。洋水出焉，而西南流注于醜塗之水。黑水出焉，而西流于大杅。是多怪鳥獸。', '西南四百里曰崑崙之丘是實惟帝之下都神陸吾司之其神狀虎身而九尾人面而虎爪是神也司天之九部及帝之囿時有獸焉其狀如羊而四角名曰土螻是食人有鳥焉其狀如蜂大如鴛鴦名曰欽原蠚鳥獸則死蠚木則枯有鳥焉其名曰鶉鳥是司帝之百服有木焉其狀如棠黃華赤實其味如李而無核名曰沙棠可以禦水食之使人不溺有草焉名曰薲草其狀如葵其味如葱食之已勞河水出焉而南流東注于無達赤水出焉而東南流注于氾天之水洋水出焉而西南流注于醜塗之水黑水出焉而西流于大杅是多怪鳥獸',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 46 段', 'e3efbfe5485134f2eede9911d3be28fc76dc9b86e228e58c3bea346c054b25fc', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000047', '22000000-0000-4000-8000-000000000003', 'xishan-p047', '西山经·樂游', 9,
  '又西三百七十里，曰樂游之山。桃水出焉，西流注于稷澤，是多白玉。其中多滑魚，其狀如蛇而四足，是食魚。', '又西三百七十里曰樂游之山桃水出焉西流注于稷澤是多白玉其中多滑魚其狀如蛇而四足是食魚',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 47 段', 'cea35db1a00cc3590efe3dddc84e17c2be2ac2a4d7a2d3f3bdd3db37d1a851e6', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000048', '22000000-0000-4000-8000-000000000003', 'xishan-p048', '西山经·蠃母', 10,
  '西水行四百里，曰流沙，二百里至于蠃母之山。神長乘司之，是天之九德也。其神狀如人而犳尾。其上多玉，其下多青石而無水。', '西水行四百里曰流沙二百里至于蠃母之山神長乘司之是天之九德也其神狀如人而犳尾其上多玉其下多青石而無水',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 48 段', '80931b4dc24b7be6a98383a138e2c7a29e67a4220055de6c59704aebdcfa690b', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000049', '22000000-0000-4000-8000-000000000003', 'xishan-p049', '西山经·玉', 11,
  '又西三百五十里，曰玉山，是西王母所居也。西王母其狀如人，豹尾虎齒而善嘯，蓬髮戴勝，是司天之厲及五殘。有獸焉，其狀如犬而豹文，其角如牛，其名曰狡，其音如吠犬，見則其國大穰。有鳥焉，其狀如翟而赤，名曰胜遇，是食魚，其音如錄，見則其國大水。', '又西三百五十里曰玉山是西王母所居也西王母其狀如人豹尾虎齒而善嘯蓬髮戴勝是司天之厲及五殘有獸焉其狀如犬而豹文其角如牛其名曰狡其音如吠犬見則其國大穰有鳥焉其狀如翟而赤名曰胜遇是食魚其音如錄見則其國大水',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 49 段', '9ba6e7bed137b09638f5e7a684ed56ea2e5e1584ad33228aafc9142b3d67d652', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000050', '22000000-0000-4000-8000-000000000003', 'xishan-p050', '西山经·軒轅', 12,
  '又西四百八十里，曰軒轅之丘，無草木。洵水出焉，南流注于黑水，其中多丹粟，多青雄黃。', '又西四百八十里曰軒轅之丘無草木洵水出焉南流注于黑水其中多丹粟多青雄黃',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 50 段', 'a5113bc52037905e5ff1e8c82f314506036fdddbbc8a2e7d0155f78513bf5d6d', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000051', '22000000-0000-4000-8000-000000000003', 'xishan-p051', '西山经·積石', 13,
  '又西三百里，曰積石之山，其下有石門，河水冒以西流。是山也，萬物無不有焉。', '又西三百里曰積石之山其下有石門河水冒以西流是山也萬物無不有焉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 51 段', '7a5960c88a78ee494f11788a9ead46fc98ef4b2544e000825fd3421112e9ed64', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000052', '22000000-0000-4000-8000-000000000003', 'xishan-p052', '西山经·長留', 14,
  '又西二百里，曰長留之山，其神白帝少昊居之。其獸皆文尾，其鳥皆文首。是多文玉石。實惟員神磈氏之宮。是神也，主司反景。', '又西二百里曰長留之山其神白帝少昊居之其獸皆文尾其鳥皆文首是多文玉石實惟員神磈氏之宮是神也主司反景',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 52 段', '32eae029ba30675d88043e1daa55aa05840b06b6512d6d3aa56b36bdc32feb1a', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000053', '22000000-0000-4000-8000-000000000003', 'xishan-p053', '西山经·章莪', 15,
  '又西二百八十里，曰章莪之山，無草木，多瑤碧。所為甚怪。有獸焉，其狀如赤豹，五尾一角，其音如擊石，其名如猙。有鳥焉，其狀如鶴，一足，赤文青質而白喙，名曰畢方，其鳴自叫也，見則其邑有譌火。', '又西二百八十里曰章莪之山無草木多瑤碧所為甚怪有獸焉其狀如赤豹五尾一角其音如擊石其名如猙有鳥焉其狀如鶴一足赤文青質而白喙名曰畢方其鳴自叫也見則其邑有譌火',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 53 段', 'd48b5cc743c2d77b7dd680ec8075368492008793dfcc017da025308589cac24c', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000054', '22000000-0000-4000-8000-000000000003', 'xishan-p054', '西山经·陰', 16,
  '又西三百里，曰陰山，濁浴之水出焉，而南流注于蕃澤，其中多文貝。有獸焉，其狀如狸而白首，名曰天狗，其音如榴榴，可以禦凶。', '又西三百里曰陰山濁浴之水出焉而南流注于蕃澤其中多文貝有獸焉其狀如狸而白首名曰天狗其音如榴榴可以禦凶',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 54 段', 'd9a1d1436148ab270ca89105b949120aae9bc629bdd3004a3fc586c5a0ace475', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000055', '22000000-0000-4000-8000-000000000003', 'xishan-p055', '西山经·符愓', 17,
  '又西二百里，曰符愓之山，其上多椶柟，下多金玉，神江疑居之。是山也，多怪雨，風雲之所出也。', '又西二百里曰符愓之山其上多椶柟下多金玉神江疑居之是山也多怪雨風雲之所出也',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 55 段', 'e7d14d224ecd751c76351d3fac0e981c3248a183fa63839c32a5eac5da3d6ff6', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000056', '22000000-0000-4000-8000-000000000003', 'xishan-p056', '西山经·三危', 18,
  '又西二百二十里，曰三危之山，三青鳥居之。是山也，廣員百里。其上有獸焉，其狀如牛，白身四角，其毫如披蓑，其名曰𢕟𢓨，是食人。有鳥焉，一首而三身，其狀如𪇱，其名曰鴟。', '又西二百二十里曰三危之山三青鳥居之是山也廣員百里其上有獸焉其狀如牛白身四角其毫如披蓑其名曰𢕟𢓨是食人有鳥焉一首而三身其狀如𪇱其名曰鴟',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 56 段', '9d3bb0e3630654becb1da160edc43dedb503acc0d671c5c22b78fec9a375f2d9', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000057', '22000000-0000-4000-8000-000000000003', 'xishan-p057', '西山经·騩', 19,
  '又西一百九十里，曰騩山，其上多玉而無石。神耆童居之，其音常如鍾磬。其下多積蛇。', '又西一百九十里曰騩山其上多玉而無石神耆童居之其音常如鍾磬其下多積蛇',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 57 段', 'a31cd0c9f89f0645c677c23456176d2099e050a915d9ebce08d613f46ec994a7', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000058', '22000000-0000-4000-8000-000000000003', 'xishan-p058', '西山经·天', 20,
  '又西三百五十里，曰天山，多金玉，有青雄黃。英水出焉，而西南流注于湯谷。有神焉，其狀如黃囊，赤如丹火，六足四翼，渾敦無面目，是識歌舞，實惟帝江也。', '又西三百五十里曰天山多金玉有青雄黃英水出焉而西南流注于湯谷有神焉其狀如黃囊赤如丹火六足四翼渾敦無面目是識歌舞實惟帝江也',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 58 段', '8642ad787b4b2f27e53ba3e36c5371505f3d9c500a3a596fdab562a96bc8b567', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000059', '22000000-0000-4000-8000-000000000003', 'xishan-p059', '西山经·泑', 21,
  '又西二百九十里，曰泑山，神蓐收居之。其上多嬰短之玉，其陽多瑾瑜之玉，其陰多青雄黃。是山也，西望日之所入，其氣員，神紅光之所司也。', '又西二百九十里曰泑山神蓐收居之其上多嬰短之玉其陽多瑾瑜之玉其陰多青雄黃是山也西望日之所入其氣員神紅光之所司也',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 59 段', 'ebdf555a23b3d7600beded6f9d0a795408701b62510ab381d3bbf653360e0abe', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000060', '22000000-0000-4000-8000-000000000003', 'xishan-p060', '西山经·翼望', 22,
  '西水行百里，至于翼望之山，無草木，多金玉。有獸焉，其狀如狸，一目而三尾，名曰讙，其音如𡙸百聲，是可以禦凶，服之已癉。有鳥焉，其狀如烏，三首六尾而善笑，名曰鵸鵌，服之使人不厭，又可以禦凶。', '西水行百里至于翼望之山無草木多金玉有獸焉其狀如狸一目而三尾名曰讙其音如𡙸百聲是可以禦凶服之已癉有鳥焉其狀如烏三首六尾而善笑名曰鵸鵌服之使人不厭又可以禦凶',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 60 段', '39de6a91d1929bbecbca565dbab28cb0645f3ef17a62c670abbb2470cea0d2b7', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000061', '22000000-0000-4000-8000-000000000003', 'xishan-p061', '西山经·西次三经·祠礼', 23,
  '凡《西次三經》之首，崇吾之山至于翼望之山，凡二十三山，六千七百四十四里。其神狀皆羊身人面。其祠之禮，用一吉玉瘞，糈用稷米。', '凡西次三經之首崇吾之山至于翼望之山凡二十三山六千七百四十四里其神狀皆羊身人面其祠之禮用一吉玉瘞糈用稷米',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 61 段', '78aa906a3b262b43cb12aee8ba950ea8c4321c137a36b888236f60a5649a5725', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000062', '22000000-0000-4000-8000-000000000004', 'xishan-p062', '西山经·陰', 1,
  '《西次四經》之首曰陰山，上多穀，無石，其草多茆蕃。陰水出焉，西流注于洛。', '西次四經之首曰陰山上多穀無石其草多茆蕃陰水出焉西流注于洛',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 62 段', 'dcdc5733ad3b7242c702230e4f1944856508b8ddfd4f73dd90a7c336bc4fd6b2', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000063', '22000000-0000-4000-8000-000000000004', 'xishan-p063', '西山经·勞', 2,
  '北五十里，曰勞山，多茈草。弱水出焉，而西流注于洛。', '北五十里曰勞山多茈草弱水出焉而西流注于洛',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 63 段', '5d8aaa516bca5644f6b624172091aa0e30556bd8accc272741c1b5e87023386f', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000064', '22000000-0000-4000-8000-000000000004', 'xishan-p064', '西山经·罷父', 3,
  '西五十里，曰罷父之山。洱水出焉，而西流注于洛，其中多茈、碧。', '西五十里曰罷父之山洱水出焉而西流注于洛其中多茈碧',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 64 段', 'cfb5cecb5b2f79ba8627a1183f4338e6a75aea96190db83ef142ba0251fb8e06', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000065', '22000000-0000-4000-8000-000000000004', 'xishan-p065', '西山经·申', 4,
  '北百七十里，曰申山，其上多榖柞，其下多杻橿，其陽多金玉。區水出焉，而東流注于河。', '北百七十里曰申山其上多榖柞其下多杻橿其陽多金玉區水出焉而東流注于河',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 65 段', 'a89eafc20d503fd57cf1db63fabf2e5ab2a791fb1064ffeb887d6ee28f9372c1', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000066', '22000000-0000-4000-8000-000000000004', 'xishan-p066', '西山经·鳥', 5,
  '北二百里，曰鳥山，其上多桑，其下多楮，其陰多鐵，其陽多玉。辱水出焉，而東流注于河。', '北二百里曰鳥山其上多桑其下多楮其陰多鐵其陽多玉辱水出焉而東流注于河',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 66 段', 'a44e01cc38cc58181bf2c4f3376142f65b4f75f89a4b91bc9d12159dbe53a59c', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000067', '22000000-0000-4000-8000-000000000004', 'xishan-p067', '西山经·上申', 6,
  '又北百二十里，曰上申之山，上無草木，而多硌石，下多榛楛，獸多白鹿。其鳥多當扈，其狀如雉，以其髯飛，食之不眴目。湯水出焉，東流注于河。', '又北百二十里曰上申之山上無草木而多硌石下多榛楛獸多白鹿其鳥多當扈其狀如雉以其髯飛食之不眴目湯水出焉東流注于河',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 67 段', 'c9374f038e8ab6d420e2c857f7d5686ad06e09e5ae5d0933a396adc2268fe224', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000068', '22000000-0000-4000-8000-000000000004', 'xishan-p068', '西山经·諸次', 7,
  '又北百八十里，曰諸次之山，諸次之水出焉，而東流注于河。是山也，多木無草，鳥獸莫居，是多眾蛇。', '又北百八十里曰諸次之山諸次之水出焉而東流注于河是山也多木無草鳥獸莫居是多眾蛇',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 68 段', 'e8607cb4d206668ef8731b9adb53f2e597265917dd0df4bf37f4132f3a04d0c2', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000069', '22000000-0000-4000-8000-000000000004', 'xishan-p069', '西山经·號', 8,
  '又北百八十里，曰號山，其木多漆、椶，其草多葯、虈、芎窮。多汵石。端水出焉，而東流注于河。', '又北百八十里曰號山其木多漆椶其草多葯虈芎窮多汵石端水出焉而東流注于河',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 69 段', '6ec826950d0b52b57ccd75271bcb698e566ae16cdce7891e1b1c41248c8586bd', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000070', '22000000-0000-4000-8000-000000000004', 'xishan-p070', '西山经·盂', 9,
  '又北二百二十里，曰盂山，其陰多鐵，其陽多銅，其獸多白狼白虎，其鳥多白雉白翟。生水出焉，而東流注于河。', '又北二百二十里曰盂山其陰多鐵其陽多銅其獸多白狼白虎其鳥多白雉白翟生水出焉而東流注于河',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 70 段', '9b43fdf192d7ac2302334ee4be3805431ba2f09f9ce0c22c2ebec4ec3a183616', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000071', '22000000-0000-4000-8000-000000000004', 'xishan-p071', '西山经·白於', 10,
  '西二百五十里，曰白於之山，上多松柏，下多櫟檀，其獸多㸲牛、羬羊，其鳥多鴞。洛水出于其陽，而東流注于渭；夾水出于其陰，東流注于生水。', '西二百五十里曰白於之山上多松柏下多櫟檀其獸多㸲牛羬羊其鳥多鴞洛水出于其陽而東流注于渭夾水出于其陰東流注于生水',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 71 段', '7e5c07a7b6a0afd18620165706e7d306cc298124383747b7d065b54755ecabf9', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000072', '22000000-0000-4000-8000-000000000004', 'xishan-p072', '西山经·申首', 11,
  '西北三百里，曰申首之山，無草木，冬夏有雪。申水出于其上，潛于其下，是多白玉。', '西北三百里曰申首之山無草木冬夏有雪申水出于其上潛于其下是多白玉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 72 段', '735046a790975e7b63865650f3210cfeae96de0e3b0db96daca50914564773d3', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000073', '22000000-0000-4000-8000-000000000004', 'xishan-p073', '西山经·涇谷', 12,
  '又西五十五里，曰涇谷之山，涇水出焉，東南流注于渭，是多白金白玉。', '又西五十五里曰涇谷之山涇水出焉東南流注于渭是多白金白玉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 73 段', 'fe349916893ada535bba7d62cc64445891ec6c913d5a7779e3068e59c8b014bc', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000074', '22000000-0000-4000-8000-000000000004', 'xishan-p074', '西山经·剛', 13,
  '又西百二十里，曰剛山，多柒木，多㻬琈之玉。剛水出焉，北流注于渭，是多神𩳁，其狀人面獸身，一足一手，其音如欽。', '又西百二十里曰剛山多柒木多㻬琈之玉剛水出焉北流注于渭是多神𩳁其狀人面獸身一足一手其音如欽',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 74 段', '5578e699f95d059d2f79da45024a5a8136f2e315fd0418881651a9baefc696e3', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000075', '22000000-0000-4000-8000-000000000004', 'xishan-p075', '西山经·剛山之尾', 14,
  '又西二百里，至剛山之尾，洛水出焉，而北流注于河。其中多蠻蠻，其狀鼠身而鱉首，其音如吠犬。', '又西二百里至剛山之尾洛水出焉而北流注于河其中多蠻蠻其狀鼠身而鱉首其音如吠犬',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 75 段', '31a7768ef889d99ad2473c094e1cdb070d3df556f39f842ecc625fac1154c3a8', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000076', '22000000-0000-4000-8000-000000000004', 'xishan-p076', '西山经·英鞮', 15,
  '又西三百五十里，曰英鞮之山，上多漆木，下多金玉，鳥獸盡白，涴水出焉，而北流注于陵羊之澤。是多冉遺之魚，魚身蛇首、六足，其目如馬耳，食之使人不眯，可以禦凶。', '又西三百五十里曰英鞮之山上多漆木下多金玉鳥獸盡白涴水出焉而北流注于陵羊之澤是多冉遺之魚魚身蛇首六足其目如馬耳食之使人不眯可以禦凶',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 76 段', '1afa12c30fd5f38cc4d40c59ad62761388a6a26d629783e058c90c7ee9534177', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000077', '22000000-0000-4000-8000-000000000004', 'xishan-p077', '西山经·中曲', 16,
  '又西三百里，曰中曲之山，其陽多玉，其陰多雄黃、白玉及金。有獸焉，其狀如馬而白身黑尾，一角，虎牙爪，音如鼓音，其名曰駮，是食虎豹，可以禦兵。有木焉，其狀如棠，而員葉赤實，實大如木瓜，名曰櫰木，食之多力。', '又西三百里曰中曲之山其陽多玉其陰多雄黃白玉及金有獸焉其狀如馬而白身黑尾一角虎牙爪音如鼓音其名曰駮是食虎豹可以禦兵有木焉其狀如棠而員葉赤實實大如木瓜名曰櫰木食之多力',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 77 段', '31353e2ae90f39ef6b5e6620b708435213e7607047da0fabe27b3a937a7b9dcb', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000078', '22000000-0000-4000-8000-000000000004', 'xishan-p078', '西山经·邽', 17,
  '又西二百六十里，曰邽山。其上有獸焉，其狀如牛，蝟毛，名曰窮奇，音如獋狗，是食人。濛水出焉，南流注于洋水，其中多黃貝，蠃魚，魚身而鳥翼，音如鴛鴦，見則其邑大水。', '又西二百六十里曰邽山其上有獸焉其狀如牛蝟毛名曰窮奇音如獋狗是食人濛水出焉南流注于洋水其中多黃貝蠃魚魚身而鳥翼音如鴛鴦見則其邑大水',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 78 段', '01de1cd423d5ec8aea85a9250efe5eb5271d7a90c421a250f8809d2aaf890ae1', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000079', '22000000-0000-4000-8000-000000000004', 'xishan-p079', '西山经·鳥鼠同穴', 18,
  '又西二百二十里，曰鳥鼠同穴之山，其上多白虎、白玉。渭水出焉，而東流注于河。其中多鰠魚，其狀如鱣魚，動則其邑有大兵。濫水出于其西，西流注于漢水。多𩶯魮之魚，其狀如覆銚，鳥首而魚翼魚尾，音如磬石之聲，是生珠玉。', '又西二百二十里曰鳥鼠同穴之山其上多白虎白玉渭水出焉而東流注于河其中多鰠魚其狀如鱣魚動則其邑有大兵濫水出于其西西流注于漢水多𩶯魮之魚其狀如覆銚鳥首而魚翼魚尾音如磬石之聲是生珠玉',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 79 段', '0dd41c05ab6095c2f6f85c0567053c288fabade783a71dc19a15cda2e4ec5a93', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000080', '22000000-0000-4000-8000-000000000004', 'xishan-p080', '西山经·崦嵫', 19,
  '西南三百六十里，曰崦嵫之山，其上多丹木，其葉如穀，其實大如瓜，赤符而黑理，食之已癉，可以禦火。其陽多龜，其陰多玉。苕水出焉，而西流注于海，其中多砥礪。有獸焉，其狀馬身而鳥翼，人面蛇尾，是好舉人，名曰孰湖。有鳥焉，其狀如鴞而人面，蜼身犬尾，其名自號也，見則其邑大旱。', '西南三百六十里曰崦嵫之山其上多丹木其葉如穀其實大如瓜赤符而黑理食之已癉可以禦火其陽多龜其陰多玉苕水出焉而西流注于海其中多砥礪有獸焉其狀馬身而鳥翼人面蛇尾是好舉人名曰孰湖有鳥焉其狀如鴞而人面蜼身犬尾其名自號也見則其邑大旱',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 80 段', 'cf5de61e91f0d5a15ba425d209bd2fd022c78fc4533cdf4c74ee19ac81f21732', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000081', '22000000-0000-4000-8000-000000000004', 'xishan-p081', '西山经·西次四经·祠礼', 20,
  '凡《西次四經》自陰山以下，至於崦嵫之山，凡十九山，三千六百八十里。其祠祀禮，皆用一白鷄祈。糈以稻米，白菅為席。', '凡西次四經自陰山以下至於崦嵫之山凡十九山三千六百八十里其祠祀禮皆用一白鷄祈糈以稻米白菅為席',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 81 段', '90f5eff3f1d045ea712483f4b9dabfa04b6c0e261d8761285bee2c2cf63373b5', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

INSERT INTO shj_text_passages (id, section_id, slug, reference_key, sequence, text_zh, normalized_text_zh, source_url, source_locator, checksum_sha256, review_status, normalization_version)
VALUES ('23000000-0000-4000-8000-000000000082', '22000000-0000-4000-8000-000000000004', 'xishan-p082', '西山经·结语', 21,
  '右西經之山，凡七十七山，一萬七千五百一十七里。', '右西經之山凡七十七山一萬七千五百一十七里',
  'https://ctext.org/shan-hai-jing/xi-shan-jing/zh', '第 82 段', '04b3842b08fdbbb36b055f60a15b4a8c1f0c9108aa9f1e3f9a01cfd3cf5e329a', 'draft', 'punctuation-stripped-v1')
ON CONFLICT (id) DO UPDATE SET text_zh=EXCLUDED.text_zh, normalized_text_zh=EXCLUDED.normalized_text_zh,
  reference_key=EXCLUDED.reference_key, checksum_sha256=EXCLUDED.checksum_sha256;

COMMIT;
