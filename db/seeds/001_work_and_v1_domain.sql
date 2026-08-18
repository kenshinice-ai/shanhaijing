BEGIN;

-- Shanhaijing Atlas V1: the first mountain chain of the Nanshan Jing.
-- Ancient Chinese excerpts are public-domain source text. English copy is an
-- original editorial summary, not a borrowed modern translation.

INSERT INTO works(
  id,slug,author_name,publication_year,content_mode,map_layer,default_locale,
  launch_rank,mode_reason,category,origin_region,chronology_start_year,
  chronology_end_year,theme_color,theme_color_dark,theme_color_light
) VALUES (
  '10000000-0000-4000-8000-000000000011',
  'shanhaijing',
  'Anonymous compilers; transmitted and annotated across many periods',
  NULL,
  'documented_record',
  'fictional',
  'zh-CN',
  11,
  'A text-first mythographic atlas. Textual topology, scholarly candidates, modern comparison and artistic interpretation remain distinct.',
  'mythography',
  'Ancient China / textual cosmography',
  NULL,
  NULL,
  '#B86B3D',
  '#2A2E29',
  '#E6C98D'
) ON CONFLICT (id) DO UPDATE SET
  author_name=EXCLUDED.author_name,
  content_mode=EXCLUDED.content_mode,
  map_layer=EXCLUDED.map_layer,
  default_locale=EXCLUDED.default_locale,
  launch_rank=EXCLUDED.launch_rank,
  mode_reason=EXCLUDED.mode_reason,
  category=EXCLUDED.category,
  origin_region=EXCLUDED.origin_region,
  theme_color=EXCLUDED.theme_color,
  theme_color_dark=EXCLUDED.theme_color_dark,
  theme_color_light=EXCLUDED.theme_color_light;

INSERT INTO work_translations(work_id,locale,title,summary,status) VALUES
('10000000-0000-4000-8000-000000000011','zh-CN','山海经 Atlas','以原文段落为根，分离异兽概念、文本提及、山川拓扑、学术候选与艺术总览。首版完整审计《南山经》鹊山首列。','published'),
('10000000-0000-4000-8000-000000000011','en','Shanhaijing Atlas','A passage-rooted atlas separating creature concepts, textual occurrences, mountain-and-water topology, scholarly candidates, and an artistic overview. V1 audits the first Queshan route of the Nanshan Jing.','published')
ON CONFLICT (work_id,locale) DO UPDATE SET title=EXCLUDED.title,summary=EXCLUDED.summary,status=EXCLUDED.status;

INSERT INTO sources(id,work_id,title,url,citation,evidence_grade,source_type) VALUES
('19000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000011','Chinese Text Project: Nanshan Jing','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','Shanhaijing, Nanshan Jing digital transcription; used for passage-level cross-checking.','primary','primary_text'),
('19000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000011','National Library of China Shanhaijing Knowledge Base','https://www.nlc.cn/pcab/xctg/bd/20240624_2640158.shtml','National Library of China release describing the Shanhaijing knowledge base and its multi-edition holdings.','reference','reference'),
('19000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000011','Shanhaijing Atlas V1 editorial collation','https://www.nlc.cn/pcab/xctg/bd/20241216_2642340.shtml','Project-authored V1 collation and summaries, with the National Library knowledge-base method used as an authority baseline.','scholarly','reference')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,url=EXCLUDED.url,citation=EXCLUDED.citation,evidence_grade=EXCLUDED.evidence_grade,source_type=EXCLUDED.source_type;

INSERT INTO source_translations(source_id,locale,title,citation,status) VALUES
('19000000-0000-4000-8000-000000000001','zh-CN','中国哲学书电子化计划：《南山经》','《山海经·南山经》数字文本，用于逐段交叉核对。','published'),
('19000000-0000-4000-8000-000000000001','en','Chinese Text Project: Nanshan Jing','Digital transcription of the Nanshan Jing, used for passage-level cross-checking.','published'),
('19000000-0000-4000-8000-000000000002','zh-CN','国家图书馆《山海经》知识库','国家图书馆《山海经》知识库发布说明及多版本馆藏方法。','published'),
('19000000-0000-4000-8000-000000000002','en','National Library of China Shanhaijing Knowledge Base','National Library of China release describing the knowledge base and its multi-edition method.','published'),
('19000000-0000-4000-8000-000000000003','zh-CN','山海经 Atlas V1 编辑校核','项目原创的 V1 校核、摘要与证据分层。','published'),
('19000000-0000-4000-8000-000000000003','en','Shanhaijing Atlas V1 editorial collation','Project-authored V1 collation, summaries, and evidence-layer decisions.','published')
ON CONFLICT (source_id,locale) DO UPDATE SET title=EXCLUDED.title,citation=EXCLUDED.citation,status=EXCLUDED.status;

INSERT INTO shj_text_editions(
  id,work_id,slug,title,source_url,source_note,rights_status,
  checksum_sha256,is_baseline,review_status
) VALUES (
  '11000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000011',
  'nanshan-v1-public-domain-collation',
  '《南山经》鹊山首列 V1 公版文本校核',
  'https://ctext.org/shan-hai-jing/nan-shan-jing/zh',
  'Nine passage excerpts cross-checked against the Chinese Text Project; National Library of China multi-edition resources remain the authority baseline for later full collation.',
  'verified',
  'b7f10866a49bfb0ef118228af0230511806c078e339381708f8afa1797666644',
  true,
  'published'
) ON CONFLICT (id) DO UPDATE SET
  source_note=EXCLUDED.source_note,
  rights_status=EXCLUDED.rights_status,
  checksum_sha256=EXCLUDED.checksum_sha256,
  is_baseline=EXCLUDED.is_baseline,
  review_status=EXCLUDED.review_status;

INSERT INTO shj_text_sections(
  id,edition_id,parent_id,slug,sequence,reference_label,title_zh,title_en,
  summary_zh,summary_en,review_status
) VALUES (
  '12000000-0000-4000-8000-000000000001',
  '11000000-0000-4000-8000-000000000001',
  NULL,
  'queshan-first-route',
  1,
  '南山经·鹊山首列',
  '南山经·鹊山首列',
  'Nanshan Jing · First Queshan Route',
  '从招摇之山向东至箕尾之山的首条山系序列；V1 保留方向、里距、异兽与水流关系，不映射现代经纬度。',
  'The first mountain sequence from Mount Zhaoyao eastward to Mount Jiwei. V1 preserves direction, li-distance, creatures, and water relations without assigning modern coordinates.',
  'published'
) ON CONFLICT (id) DO UPDATE SET
  title_zh=EXCLUDED.title_zh,title_en=EXCLUDED.title_en,
  summary_zh=EXCLUDED.summary_zh,summary_en=EXCLUDED.summary_en,
  review_status=EXCLUDED.review_status;

INSERT INTO shj_text_passages(
  id,section_id,slug,reference_key,sequence,text_zh,normalized_text_zh,
  source_url,checksum_sha256,review_status
) VALUES
('13000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','zhaoyao','南山经·招摇之山',1,'南山經之首曰䧿山。其首曰招搖之山，臨于西海之上，多桂，多金玉。有獸焉，其狀如禺而白耳，伏行人走，其名曰狌狌，食之善走。','南山經之首曰䧿山。其首曰招搖之山，臨于西海之上，多桂，多金玉。有獸焉，其狀如禺而白耳，伏行人走，其名曰狌狌，食之善走。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','d3a7933c6a540fa837c492d950f91222aaac4f212b4fede131cbd5d2eee202ae','published'),
('13000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000001','tangting','南山经·堂庭之山',2,'又東三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黃金。','又東三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黃金。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','4e278da88b10cfa5bbe8cce6a86170582a1dca1462ff0f717e2ee7397afbdcfc','published'),
('13000000-0000-4000-8000-000000000003','12000000-0000-4000-8000-000000000001','yuanyi','南山经·猨翼之山',3,'又東三百八十里，曰猨翼之山，其中多怪獸，水多怪魚，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。','又東三百八十里，曰猨翼之山，其中多怪獸，水多怪魚，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','8ff7a8946e38004a4880fb9201274d33312fad027ad6f4c7707e3f3eb36441b1','published'),
('13000000-0000-4000-8000-000000000004','12000000-0000-4000-8000-000000000001','niuyang','南山经·杻阳之山',4,'又東三百七十里，曰杻陽之山，其陽多赤金，其陰多白金。有獸焉，其狀如馬而白首，其文如虎而赤尾，其音如謠，其名曰鹿蜀，佩之宜子孫。怪水出焉，而東流注于憲翼之水。其中多玄龜，其狀如龜而鳥首虺尾，其名曰旋龜，其音如判木，佩之不聾，可以為底。','又東三百七十里，曰杻陽之山，其陽多赤金，其陰多白金。有獸焉，其狀如馬而白首，其文如虎而赤尾，其音如謠，其名曰鹿蜀，佩之宜子孫。怪水出焉，而東流注于憲翼之水。其中多玄龜，其狀如龜而鳥首虺尾，其名曰旋龜，其音如判木，佩之不聾，可以為底。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','60e917191611bc7711d521e8cb7f5ef754fafaf61152c430716dd9be72d6bef9','published'),
('13000000-0000-4000-8000-000000000005','12000000-0000-4000-8000-000000000001','dishan','南山经·柢山',5,'又東三百里，曰柢山，多水，無草木。有魚焉，其狀如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而夏生，食之無腫疾。','又東三百里，曰柢山，多水，無草木。有魚焉，其狀如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而夏生，食之無腫疾。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','76f7c8c251ad2270259e55f93323f7d90c85e2082565294fa09008a960cb97dd','published'),
('13000000-0000-4000-8000-000000000006','12000000-0000-4000-8000-000000000001','danyuan','南山经·亶爰之山',6,'又東四百里，曰亶爰之山，多水，無草木，不可以上。有獸焉，其狀如狸而有髦，其名曰類，自為牝牡，食者不妒。','又東四百里，曰亶爰之山，多水，無草木，不可以上。有獸焉，其狀如狸而有髦，其名曰類，自為牝牡，食者不妒。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','e48f923370eeeed0b03bbeb9122b5cfc387cb6536c444cccdd06461bb1dcbda3','published'),
('13000000-0000-4000-8000-000000000007','12000000-0000-4000-8000-000000000001','jishan','南山经·基山',7,'又東三百里，曰基山，其陽多玉，其陰多怪木。有獸焉，其狀如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。','又東三百里，曰基山，其陽多玉，其陰多怪木。有獸焉，其狀如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','185d48fbc0292630ec586cdbe43d3152f493317ef6340f78bc1f5481098034fd','published'),
('13000000-0000-4000-8000-000000000008','12000000-0000-4000-8000-000000000001','qingqiu','南山经·青丘之山',8,'又東三百里，曰青丘之山，其陽多玉，其陰多青雘。有鳥焉，其狀如鳩，其音若呵，名曰灌灌，佩之不惑。有獸焉，其狀如狐而九尾，其音如嬰兒，能食人，食者不蠱。英水出焉，南流注于即翼之澤。其中多赤鱬，其狀如魚而人面，其音如鴛鴦，食之不疥。','又東三百里，曰青丘之山，其陽多玉，其陰多青雘。有鳥焉，其狀如鳩，其音若呵，名曰灌灌，佩之不惑。有獸焉，其狀如狐而九尾，其音如嬰兒，能食人，食者不蠱。英水出焉，南流注于即翼之澤。其中多赤鱬，其狀如魚而人面，其音如鴛鴦，食之不疥。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','bf310872e668629975875ef24646d95af2146712e9e695b701564789c4f55578','published'),
('13000000-0000-4000-8000-000000000009','12000000-0000-4000-8000-000000000001','jiwei','南山经·箕尾之山',9,'又東三百五十里，曰箕尾之山，其尾踆于東海，多沙石。汸水出焉，而南流注于淯，其中多白玉。','又東三百五十里，曰箕尾之山，其尾踆于東海，多沙石。汸水出焉，而南流注于淯，其中多白玉。','https://ctext.org/shan-hai-jing/nan-shan-jing/zh','71b10ce46e42cd59355788e5e636ee56872c5c84453391c8fbce73e93bce260c','published')
ON CONFLICT (id) DO UPDATE SET
  text_zh=EXCLUDED.text_zh,normalized_text_zh=EXCLUDED.normalized_text_zh,
  source_url=EXCLUDED.source_url,checksum_sha256=EXCLUDED.checksum_sha256,
  review_status=EXCLUDED.review_status;

INSERT INTO shj_passage_translations(passage_id,locale,title,summary,editorial_note,status) VALUES
('13000000-0000-4000-8000-000000000001','zh-CN','招摇之山','鹊山首列起点，临于西海；狌狌在此被直接描述。','V1 只发布经核对的短段落。','published'),
('13000000-0000-4000-8000-000000000001','en','Mount Zhaoyao','The first stop of the Queshan route, overlooking the Western Sea; the Xingxing is directly described here.','V1 publishes a checked short passage, not a complete modern translation.','published'),
('13000000-0000-4000-8000-000000000002','zh-CN','堂庭之山','沿首列东行三百里，记录棪木、白猿、水玉与黄金。','','published'),
('13000000-0000-4000-8000-000000000002','en','Mount Tangting','Three hundred li eastward, with yan trees, white apes, water-jade, and gold.','','published'),
('13000000-0000-4000-8000-000000000003','zh-CN','猨翼之山','继续向东的险峻节点，文本集中列出怪兽、怪鱼、怪蛇与怪木。','','published'),
('13000000-0000-4000-8000-000000000003','en','Mount Yuanyi','A difficult eastern stop whose passage gathers strange beasts, fish, snakes, and trees.','','published'),
('13000000-0000-4000-8000-000000000004','zh-CN','杻阳之山','鹿蜀、旋龟与怪水共同出现的山水节点。','','published'),
('13000000-0000-4000-8000-000000000004','en','Mount Niuyang','A mountain-and-water node where the Lushu, Xuangui, and Guai River appear.','','published'),
('13000000-0000-4000-8000-000000000005','zh-CN','柢山','多水而无草木；鯥被描述为牛形、蛇尾、有翼的陵居之鱼。','','published'),
('13000000-0000-4000-8000-000000000005','en','Mount Di','A watery, treeless mountain where the Lu is described as a land-dwelling fish with bovine form, a serpent tail, and wings.','','published'),
('13000000-0000-4000-8000-000000000006','zh-CN','亶爰之山','不可攀登的多水之山；类在此出现。','','published'),
('13000000-0000-4000-8000-000000000006','en','Mount Danyuan','A watery, unscalable mountain where the Lei appears.','','published'),
('13000000-0000-4000-8000-000000000007','zh-CN','基山','猼訑被描述为羊形、九尾、四耳、目在背。','','published'),
('13000000-0000-4000-8000-000000000007','en','Mount Ji','The Boyi is described with a sheep-like body, nine tails, four ears, and eyes on its back.','','published'),
('13000000-0000-4000-8000-000000000008','zh-CN','青丘之山','灌灌、九尾狐与赤鱬集中出现，也是首版异兽最密集的段落。','','published'),
('13000000-0000-4000-8000-000000000008','en','Mount Qingqiu','The densest V1 passage, bringing together the Guanguan, Nine-tailed Fox, and Chiru.','','published'),
('13000000-0000-4000-8000-000000000009','zh-CN','箕尾之山','首列末端踆于东海；汸水由此南流。','','published'),
('13000000-0000-4000-8000-000000000009','en','Mount Jiwei','The route ends at the Eastern Sea, with the Fang River flowing southward.','','published')
ON CONFLICT (passage_id,locale) DO UPDATE SET
  title=EXCLUDED.title,summary=EXCLUDED.summary,
  editorial_note=EXCLUDED.editorial_note,status=EXCLUDED.status;

INSERT INTO shj_textual_places(
  id,work_id,slug,place_kind,layout_x,layout_y,layout_space,sort_order,review_status
) VALUES
('15000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000011','zhaoyao','mountain',8,68,'textual-layout-v1',1,'published'),
('15000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000011','tangting','mountain',19,58,'textual-layout-v1',2,'published'),
('15000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000011','yuanyi','mountain',31,66,'textual-layout-v1',3,'published'),
('15000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000011','niuyang','mountain',43,54,'textual-layout-v1',4,'published'),
('15000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000011','dishan','mountain',54,62,'textual-layout-v1',5,'published'),
('15000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000011','danyuan','mountain',65,48,'textual-layout-v1',6,'published'),
('15000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000011','jishan','mountain',75,56,'textual-layout-v1',7,'published'),
('15000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000011','qingqiu','mountain',86,42,'textual-layout-v1',8,'published'),
('15000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000011','jiwei','mountain',95,50,'textual-layout-v1',9,'published')
ON CONFLICT (id) DO UPDATE SET
  place_kind=EXCLUDED.place_kind,layout_x=EXCLUDED.layout_x,layout_y=EXCLUDED.layout_y,
  sort_order=EXCLUDED.sort_order,review_status=EXCLUDED.review_status;

INSERT INTO shj_textual_place_translations(place_id,locale,name,aliases,summary,status) VALUES
('15000000-0000-4000-8000-000000000001','zh-CN','招摇之山',ARRAY['招摇山'],'鹊山首列起点，临于西海。','published'),
('15000000-0000-4000-8000-000000000001','en','Mount Zhaoyao',ARRAY['Zhaoyao'],'The opening mountain of the first Queshan route, overlooking the Western Sea.','published'),
('15000000-0000-4000-8000-000000000002','zh-CN','堂庭之山',ARRAY['堂庭山'],'招摇之山东三百里的山。','published'),
('15000000-0000-4000-8000-000000000002','en','Mount Tangting',ARRAY['Tangting'],'A mountain three hundred li east of Zhaoyao.','published'),
('15000000-0000-4000-8000-000000000003','zh-CN','猨翼之山',ARRAY['猿翼山'],'堂庭之山东三百八十里的险峻山地。','published'),
('15000000-0000-4000-8000-000000000003','en','Mount Yuanyi',ARRAY['Yuanyi'],'A difficult mountain three hundred and eighty li east of Tangting.','published'),
('15000000-0000-4000-8000-000000000004','zh-CN','杻阳之山',ARRAY['杻阳山'],'鹿蜀、旋龟与怪水所在的山。','published'),
('15000000-0000-4000-8000-000000000004','en','Mount Niuyang',ARRAY['Niuyang'],'The mountain associated with the Lushu, Xuangui, and Guai River.','published'),
('15000000-0000-4000-8000-000000000005','zh-CN','柢山',ARRAY[]::text[],'多水无草木，鯥所在。','published'),
('15000000-0000-4000-8000-000000000005','en','Mount Di',ARRAY['Di'],'A watery, treeless mountain associated with the Lu.','published'),
('15000000-0000-4000-8000-000000000006','zh-CN','亶爰之山',ARRAY['亶爰山'],'多水无草木且不可上，类所在。','published'),
('15000000-0000-4000-8000-000000000006','en','Mount Danyuan',ARRAY['Danyuan'],'A watery, treeless, unscalable mountain associated with the Lei.','published'),
('15000000-0000-4000-8000-000000000007','zh-CN','基山',ARRAY[]::text[],'阳面多玉，阴面多怪木，猼訑所在。','published'),
('15000000-0000-4000-8000-000000000007','en','Mount Ji',ARRAY['Ji'],'A mountain of jade and strange trees, associated with the Boyi.','published'),
('15000000-0000-4000-8000-000000000008','zh-CN','青丘之山',ARRAY['青丘山'],'灌灌、九尾狐、赤鱬及英水所在。','published'),
('15000000-0000-4000-8000-000000000008','en','Mount Qingqiu',ARRAY['Qingqiu'],'A mountain associated with the Guanguan, Nine-tailed Fox, Chiru, and Ying River.','published'),
('15000000-0000-4000-8000-000000000009','zh-CN','箕尾之山',ARRAY['箕尾山'],'鹊山首列东端，山尾抵近东海。','published'),
('15000000-0000-4000-8000-000000000009','en','Mount Jiwei',ARRAY['Jiwei'],'The eastern end of the first Queshan route, reaching the Eastern Sea.','published')
ON CONFLICT (place_id,locale) DO UPDATE SET
  name=EXCLUDED.name,aliases=EXCLUDED.aliases,summary=EXCLUDED.summary,status=EXCLUDED.status;

INSERT INTO shj_place_mentions(place_id,passage_id,surface_form,mention_order) VALUES
('15000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','招搖之山',0),
('15000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000002','堂庭之山',0),
('15000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000003','猨翼之山',0),
('15000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000004','杻陽之山',0),
('15000000-0000-4000-8000-000000000005','13000000-0000-4000-8000-000000000005','柢山',0),
('15000000-0000-4000-8000-000000000006','13000000-0000-4000-8000-000000000006','亶爰之山',0),
('15000000-0000-4000-8000-000000000007','13000000-0000-4000-8000-000000000007','基山',0),
('15000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','青丘之山',0),
('15000000-0000-4000-8000-000000000009','13000000-0000-4000-8000-000000000009','箕尾之山',0)
ON CONFLICT DO NOTHING;

INSERT INTO shj_creatures(id,work_id,slug,concept_status,importance,icon_key,sort_order) VALUES
('14000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000011','xingxing','resolved',4,'primate-white-ears',1),
('14000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000011','lushu','resolved',4,'horse-tiger-tail',2),
('14000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000011','xuangui','resolved',4,'turtle-bird-head',3),
('14000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000011','lu','resolved',4,'fish-bovine-winged',4),
('14000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000011','lei','resolved',3,'feline-maned',5),
('14000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000011','boyi','resolved',4,'sheep-nine-tails',6),
('14000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000011','guanguan','resolved',3,'bird-confusion-ward',7),
('14000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000011','nine-tailed-fox','resolved',5,'fox-nine-tails',8),
('14000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000011','chiru','resolved',4,'fish-human-face',9)
ON CONFLICT (id) DO UPDATE SET
  concept_status=EXCLUDED.concept_status,importance=EXCLUDED.importance,
  icon_key=EXCLUDED.icon_key,sort_order=EXCLUDED.sort_order;

INSERT INTO shj_creature_translations(creature_id,locale,name,aliases,summary,detail,status) VALUES
('14000000-0000-4000-8000-000000000001','zh-CN','狌狌',ARRAY['猩猩'],'白耳、伏行而又能像人一样奔走的兽。','原文把形态、行动方式与食用效果并列；V1 不将其直接等同于现代物种。','published'),
('14000000-0000-4000-8000-000000000001','en','Xingxing',ARRAY['狌狌'],'A white-eared creature that moves crouched yet can run like a person.','The passage combines form, locomotion, and an eating effect; V1 does not identify it as a modern species.','published'),
('14000000-0000-4000-8000-000000000002','zh-CN','鹿蜀',ARRAY[]::text[],'马形白首、虎纹赤尾，声音如歌谣。','佩其皮毛“宜子孙”属于原文效应描述，不作为现代功效声明。','published'),
('14000000-0000-4000-8000-000000000002','en','Lushu',ARRAY['鹿蜀'],'Horse-shaped, white-headed, tiger-patterned, red-tailed, with a song-like voice.','The text’s descendant-related effect is recorded as an ancient claim, not a modern efficacy statement.','published'),
('14000000-0000-4000-8000-000000000003','zh-CN','旋龟',ARRAY['玄龟'],'龟形、鸟首、虺尾，声音像劈木。','V1 同时保留玄龟表记与旋龟概念名的校勘差异。','published'),
('14000000-0000-4000-8000-000000000003','en','Xuangui',ARRAY['旋龟','玄龟'],'Turtle-bodied, bird-headed, serpent-tailed, with a sound compared to split wood.','V1 preserves the textual naming variation rather than silently normalising it away.','published'),
('14000000-0000-4000-8000-000000000004','zh-CN','鯥',ARRAY['Lu'],'牛形、蛇尾、有翼，虽属鱼却在陆地栖居。','“冬死而夏生”按原文记录，不推演现代生物学机制。','published'),
('14000000-0000-4000-8000-000000000004','en','Lu',ARRAY['鯥'],'A bovine-shaped, serpent-tailed, winged fish said to dwell on land.','Its winter death and summer return are preserved as textual description, not modern biology.','published'),
('14000000-0000-4000-8000-000000000005','zh-CN','类',ARRAY['類'],'狸形而有髦，自为牝牡。','V1 仅记录文本中的复合性别描述，不套用现代动物分类。','published'),
('14000000-0000-4000-8000-000000000005','en','Lei',ARRAY['類'],'A feline-like creature with a mane, described as being both female and male.','The ancient description is retained without forcing a modern zoological category.','published'),
('14000000-0000-4000-8000-000000000006','zh-CN','猼訑',ARRAY['博施'],'羊形、九尾、四耳，眼睛长在背上。','佩之不畏作为文本效应展示。','published'),
('14000000-0000-4000-8000-000000000006','en','Boyi',ARRAY['猼訑'],'Sheep-shaped, with nine tails, four ears, and eyes on its back.','The fear-averting effect is displayed as a textual claim.','published'),
('14000000-0000-4000-8000-000000000007','zh-CN','灌灌',ARRAY[]::text[],'鸠形之鸟，声音像呵斥。','佩之不惑作为古籍记载，不作现代功效声明。','published'),
('14000000-0000-4000-8000-000000000007','en','Guanguan',ARRAY['灌灌'],'A dove-like bird with a voice compared to a rebuking call.','Its confusion-averting effect is presented as an ancient claim, not modern advice.','published'),
('14000000-0000-4000-8000-000000000008','zh-CN','九尾狐',ARRAY['九尾之狐'],'狐形九尾，声音像婴儿，并被描述为能食人。','这是青丘段落的直接文本形态，不代表现代地望或物种鉴定。','published'),
('14000000-0000-4000-8000-000000000008','en','Nine-tailed Fox',ARRAY['Jiǔwěihú','九尾狐'],'A fox-shaped being with nine tails, an infant-like cry, and a man-eating description.','This is a direct textual form from the Qingqiu passage, not a modern species or location claim.','published'),
('14000000-0000-4000-8000-000000000009','zh-CN','赤鱬',ARRAY[]::text[],'鱼身人面，声音像鸳鸯。','食之不疥作为文本效应记录。','published'),
('14000000-0000-4000-8000-000000000009','en','Chiru',ARRAY['赤鱬'],'A fish-bodied being with a human face and a call compared to mandarin ducks.','The skin-related effect is retained as an ancient textual claim.','published')
ON CONFLICT (creature_id,locale) DO UPDATE SET
  name=EXCLUDED.name,aliases=EXCLUDED.aliases,summary=EXCLUDED.summary,
  detail=EXCLUDED.detail,status=EXCLUDED.status;

INSERT INTO shj_creature_occurrences(
  id,creature_id,passage_id,place_id,surface_form,quote_zh,occurrence_order,
  source_attestation,interpretation_class,confidence,evidence_note,review_status
) VALUES
('16000000-0000-4000-8000-000000000001','14000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000001','狌狌','其狀如禺而白耳，伏行人走，其名曰狌狌。',1,'text_direct','transcription','high','Named occurrence in the Zhaoyao passage.','published'),
('16000000-0000-4000-8000-000000000002','14000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000004','15000000-0000-4000-8000-000000000004','鹿蜀','其狀如馬而白首，其文如虎而赤尾，其音如謠，其名曰鹿蜀。',1,'text_direct','transcription','high','Named occurrence in the Niuyang passage.','published'),
('16000000-0000-4000-8000-000000000003','14000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000004','15000000-0000-4000-8000-000000000004','玄龜／旋龜','其狀如龜而鳥首虺尾，其名曰旋龜，其音如判木。',2,'text_direct','transcription','high','Surface-form variation is preserved for review.','published'),
('16000000-0000-4000-8000-000000000004','14000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000005','15000000-0000-4000-8000-000000000005','鯥','其狀如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥。',1,'text_direct','transcription','high','Named occurrence in the Di passage.','published'),
('16000000-0000-4000-8000-000000000005','14000000-0000-4000-8000-000000000005','13000000-0000-4000-8000-000000000006','15000000-0000-4000-8000-000000000006','類','其狀如狸而有髦，其名曰類，自為牝牡。',1,'text_direct','transcription','high','Named occurrence in the Danyuan passage.','published'),
('16000000-0000-4000-8000-000000000006','14000000-0000-4000-8000-000000000006','13000000-0000-4000-8000-000000000007','15000000-0000-4000-8000-000000000007','猼訑','其狀如羊，九尾四耳，其目在背，其名曰猼訑。',1,'text_direct','transcription','high','Named occurrence in the Ji passage.','published'),
('16000000-0000-4000-8000-000000000007','14000000-0000-4000-8000-000000000007','13000000-0000-4000-8000-000000000008','15000000-0000-4000-8000-000000000008','灌灌','其狀如鳩，其音若呵，名曰灌灌。',1,'text_direct','transcription','high','Named bird occurrence in the Qingqiu passage.','published'),
('16000000-0000-4000-8000-000000000008','14000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','15000000-0000-4000-8000-000000000008','狐而九尾','其狀如狐而九尾，其音如嬰兒，能食人。',2,'text_direct','transcription','high','The fox occurrence in the Qingqiu passage; the conventional name Nine-tailed Fox is an editorial concept label, so the surface form records the passage wording.','published'),
('16000000-0000-4000-8000-000000000009','14000000-0000-4000-8000-000000000009','13000000-0000-4000-8000-000000000008','15000000-0000-4000-8000-000000000008','赤鱬','其狀如魚而人面，其音如鴛鴦。',3,'text_direct','transcription','high','Named aquatic occurrence in the Qingqiu passage.','published')
ON CONFLICT (id) DO UPDATE SET
  surface_form=EXCLUDED.surface_form,quote_zh=EXCLUDED.quote_zh,
  evidence_note=EXCLUDED.evidence_note,
  confidence=EXCLUDED.confidence,review_status=EXCLUDED.review_status;

INSERT INTO shj_topology_edges(
  id,section_id,from_place_id,to_place_id,passage_id,relation_kind,
  direction_text,distance_value,distance_unit,sequence,interpretation_class,
  conflict_status,review_status
) VALUES
('17000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000002','distance_direction','東',300,'里',1,'transcription','none','published'),
('17000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000002','15000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000003','distance_direction','東',380,'里',2,'transcription','none','published'),
('17000000-0000-4000-8000-000000000003','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000003','15000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000004','distance_direction','東',370,'里',3,'transcription','none','published'),
('17000000-0000-4000-8000-000000000004','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000004','15000000-0000-4000-8000-000000000005','13000000-0000-4000-8000-000000000005','distance_direction','東',300,'里',4,'transcription','none','published'),
('17000000-0000-4000-8000-000000000005','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000005','15000000-0000-4000-8000-000000000006','13000000-0000-4000-8000-000000000006','distance_direction','東',400,'里',5,'transcription','none','published'),
('17000000-0000-4000-8000-000000000006','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000006','15000000-0000-4000-8000-000000000007','13000000-0000-4000-8000-000000000007','distance_direction','東',300,'里',6,'transcription','none','published'),
('17000000-0000-4000-8000-000000000007','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000007','15000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','distance_direction','東',300,'里',7,'transcription','none','published'),
('17000000-0000-4000-8000-000000000008','12000000-0000-4000-8000-000000000001','15000000-0000-4000-8000-000000000008','15000000-0000-4000-8000-000000000009','13000000-0000-4000-8000-000000000009','distance_direction','東',350,'里',8,'transcription','none','published')
ON CONFLICT (id) DO UPDATE SET
  direction_text=EXCLUDED.direction_text,distance_value=EXCLUDED.distance_value,
  distance_unit=EXCLUDED.distance_unit,review_status=EXCLUDED.review_status;

INSERT INTO shj_taxonomy_assignments(
  id,creature_id,passage_id,axis,term,source_attestation,
  interpretation_class,confidence,evidence_note,review_status
) VALUES
('18000000-0000-4000-8000-000000000001','14000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','morphology','primate_like','text_direct','editorial_summary','high','其狀如禺','published'),
('18000000-0000-4000-8000-000000000002','14000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','effect','swift_movement','text_direct','transcription','high','食之善走','published'),
('18000000-0000-4000-8000-000000000003','14000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000004','morphology','composite_mammal','text_direct','editorial_summary','high','馬形、虎文、赤尾','published'),
('18000000-0000-4000-8000-000000000004','14000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000004','sound','song_like','text_direct','transcription','high','其音如謠','published'),
('18000000-0000-4000-8000-000000000005','14000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000004','morphology','reptile_bird_composite','text_direct','editorial_summary','high','龜身、鳥首、虺尾','published'),
('18000000-0000-4000-8000-000000000006','14000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000004','sound','split_wood_like','text_direct','transcription','high','其音如判木','published'),
('18000000-0000-4000-8000-000000000007','14000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000005','morphology','aquatic_terrestrial_composite','text_direct','editorial_summary','high','魚而陵居、牛形、蛇尾、有翼','published'),
('18000000-0000-4000-8000-000000000008','14000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000005','seasonality','winter_summer_cycle','text_direct','transcription','high','冬死而夏生','published'),
('18000000-0000-4000-8000-000000000009','14000000-0000-4000-8000-000000000005','13000000-0000-4000-8000-000000000006','morphology','feline_like','text_direct','editorial_summary','high','其狀如狸而有髦','published'),
('18000000-0000-4000-8000-000000000010','14000000-0000-4000-8000-000000000005','13000000-0000-4000-8000-000000000006','body','dual_sex_description','text_direct','transcription','high','自為牝牡','published'),
('18000000-0000-4000-8000-000000000011','14000000-0000-4000-8000-000000000006','13000000-0000-4000-8000-000000000007','morphology','sheep_like','text_direct','editorial_summary','high','其狀如羊','published'),
('18000000-0000-4000-8000-000000000012','14000000-0000-4000-8000-000000000006','13000000-0000-4000-8000-000000000007','body','multiple_tails_ears','text_direct','transcription','high','九尾四耳，目在背','published'),
('18000000-0000-4000-8000-000000000013','14000000-0000-4000-8000-000000000007','13000000-0000-4000-8000-000000000008','morphology','bird_dove_like','text_direct','editorial_summary','high','其狀如鳩','published'),
('18000000-0000-4000-8000-000000000014','14000000-0000-4000-8000-000000000007','13000000-0000-4000-8000-000000000008','effect','confusion_ward','text_direct','transcription','high','佩之不惑','published'),
('18000000-0000-4000-8000-000000000015','14000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','morphology','fox_nine_tails','text_direct','transcription','high','其狀如狐而九尾','published'),
('18000000-0000-4000-8000-000000000016','14000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','sound','infant_like','text_direct','transcription','high','其音如嬰兒','published'),
('18000000-0000-4000-8000-000000000017','14000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','behavior','man_eating','text_direct','transcription','high','能食人','published'),
('18000000-0000-4000-8000-000000000018','14000000-0000-4000-8000-000000000009','13000000-0000-4000-8000-000000000008','morphology','fish_human_face','text_direct','transcription','high','其狀如魚而人面','published'),
('18000000-0000-4000-8000-000000000019','14000000-0000-4000-8000-000000000009','13000000-0000-4000-8000-000000000008','sound','mandarin_duck_like','text_direct','transcription','high','其音如鴛鴦','published')
ON CONFLICT (id) DO UPDATE SET
  term=EXCLUDED.term,evidence_note=EXCLUDED.evidence_note,
  confidence=EXCLUDED.confidence,review_status=EXCLUDED.review_status;

INSERT INTO shj_artistic_overviews(
  id,work_id,slug,status,interpretation_class,coordinate_space,asset_url,
  prompt_path,prompt_sha256,title_zh,title_en,description_zh,description_en,
  disclosure_zh,disclosure_en
) VALUES (
  '1a000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000011',
  'fantasy-composite-v1',
  'blocked_missing_api_key',
  'artistic_interpretation',
  'artistic-composite-v1',
  NULL,
  'docs/shanhaijing/prompts/fantasy-composite-map-v1.txt',
  'c73779d6d7c0c3ffc6fe186f46a22fd0ec6bc4bd6862239154447e31128a8cac',
  '山海经幻想总览',
  'Shanhaijing Fantasy Overview',
  '面向探索体验的超级幻想拼接母图。图像生成前，V1 使用结构化山系拓扑作为可访问替代。',
  'A spectacular artistic composite intended for exploration. Until image generation is available, V1 uses the structured mountain-route topology as its accessible substitute.',
  '艺术总览依据文本主题进行幻想拼接，不代表古代地望或现代坐标定论。',
  'The artistic overview is a fantasy synthesis of textual themes, not a conclusion about ancient geography or modern coordinates.'
) ON CONFLICT (id) DO UPDATE SET
  status=EXCLUDED.status,asset_url=EXCLUDED.asset_url,prompt_path=EXCLUDED.prompt_path,
  prompt_sha256=EXCLUDED.prompt_sha256,description_zh=EXCLUDED.description_zh,
  description_en=EXCLUDED.description_en,disclosure_zh=EXCLUDED.disclosure_zh,
  disclosure_en=EXCLUDED.disclosure_en;

COMMIT;
