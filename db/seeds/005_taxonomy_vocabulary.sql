-- 005: 分类词表（由 scripts/generate_taxonomy_vocabulary.ts 确定性生成，勿手改）
--
-- 词表装入之后再建 assignment → term 外键：bootstrap 先跑完 migration 才跑 seed，
-- 若把外键放进 003，既有 assignment 会在词表存在之前就违约。

BEGIN;

-- 轴
INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000001', w.id, 'morphology', '形态', 'Morphology', '原文对形貌的直接描述：像什么、有几首几足几尾、身体各部的组合。', 'What the received text says the creature looks like: the animal it resembles, counts of heads, feet and tails, and how body parts combine.', 1, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000002', w.id, 'behavior', '行为', 'Behaviour', '原文所记的举动与习性，含食性、鸣叫方式与栖止节律。', 'Recorded conduct and habit: what it eats, how it calls, how it dwells.', 2, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000003', w.id, 'body', '体征', 'Body', '无法归入单一形似的身体属性，如雌雄同体、不可杀、多尾多耳等整体性陈述。', 'Whole-body attributes that resist a single resemblance: dual sex, unkillability, multiplied parts.', 3, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000004', w.id, 'sound', '声音', 'Sound', '原文以「其音如」句式给出的类比声描写；类比对象是听感参照，不是物种鉴定。', 'Analogical sound descriptions in the form "its call is like…"; the referent is an auditory comparison, not a species identification.', 4, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000005', w.id, 'effect', '服食效用', 'Effect', '原文所述食之、佩之而生的效用；登记为文本主张，不作医药建议。', 'Effects the text ascribes to eating or wearing the creature; recorded as textual claims, never as medical advice.', 5, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000006', w.id, 'omen', '兆应', 'Omen', '以「见则」句式记载的应验之兆；属文本的因果陈述，不是历史事件记录。', 'Portents in the form "when it appears, then…"; a causal claim made by the text, not a record of events.', 6, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)
SELECT '1d000000-0000-4000-8000-000000000007', w.id, 'seasonality', '时序', 'Seasonality', '与季节相系的生死或出没周期。', 'Life, death or appearance cycles tied to the seasons.', 7, 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;

-- 词条
INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000001', w.id, 'morphology', 'aquatic_terrestrial_composite', '水陆复合', 'Aquatic–terrestrial composite', '以鱼为名而居于陆，或兼具水陆两栖的部件组合。', 'Named as a fish yet dwelling on land, or combining aquatic and terrestrial parts.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000002', w.id, 'morphology', 'bird_dove_like', '鸠形之鸟', 'Dove-like bird', '以「其状如鸠」立形的鸟类。', 'A bird whose shape the text gives as dove-like.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000003', w.id, 'morphology', 'bird_human_face', '人面之鸟', 'Bird with a human face', '鸟身而具人面。', 'A bird''s body carrying a human face.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000004', w.id, 'morphology', 'bird_human_hands', '人手之鸟', 'Bird with human hands', '鸟形而爪作人手。', 'A bird whose claws are described as human hands.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000005', w.id, 'morphology', 'composite_bird', '多首多翼之鸟', 'Multi-part composite bird', '首、目、足、翼数目超出常禽的复合鸟形。', 'A bird with counts of heads, eyes, feet or wings beyond the ordinary.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000006', w.id, 'morphology', 'composite_mammal', '复合兽形', 'Composite mammal', '兽形而杂取他物的纹、尾、首等部件。', 'A mammal shape assembled from parts of other animals.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000007', w.id, 'morphology', 'eagle_horned', '有角之雕', 'Horned eagle', '雕形而有角。', 'An eagle-shaped creature bearing horns.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000008', w.id, 'morphology', 'feline_like', '狸形', 'Feline-like', '以狸立形者。', 'Shaped like a wildcat.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000009', w.id, 'morphology', 'fish_bristled', '有毛之鱼', 'Bristled fish', '鱼形而生兽毛。', 'A fish shape carrying animal bristles.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000010', w.id, 'morphology', 'fish_human_face', '人面之鱼', 'Fish with a human face', '鱼身而具人面。', 'A fish''s body carrying a human face.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000011', w.id, 'morphology', 'fish_serpent_composite', '鱼身蛇尾', 'Fish–serpent composite', '鱼身接蛇尾的复合体。', 'A fish body joined to a serpent''s tail.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000012', w.id, 'morphology', 'fox_nine_tails', '九尾之狐', 'Nine-tailed fox', '狐形而九尾。', 'A fox shape with nine tails.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000013', w.id, 'morphology', 'humanoid_bristled', '人形而鬣', 'Bristled humanoid', '人形而生彘鬣一类的毛发。', 'A human shape bearing boar-like bristles.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000014', w.id, 'morphology', 'owl_human_face', '人面四目', 'Human-faced owl', '鸮类而具人面，目数超常。', 'An owl-like creature with a human face and more eyes than usual.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000015', w.id, 'morphology', 'pheasant_five_colours', '五采之雉', 'Five-coloured pheasant', '鸡雉之形而五采成文。', 'A fowl shape patterned in five colours.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000016', w.id, 'morphology', 'pig_like_spurred', '有距之豚', 'Spurred pig-like beast', '豚形而有距。', 'A pig shape bearing spurs.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000017', w.id, 'morphology', 'primate_four_ears', '四耳之禺', 'Four-eared primate', '禺形而四耳。', 'A primate shape with four ears.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000018', w.id, 'morphology', 'primate_like', '禺形', 'Primate-like', '以禺立形者。', 'Shaped like a macaque.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000019', w.id, 'morphology', 'reptile_bird_composite', '龟身鸟首', 'Reptile–bird composite', '龟身而鸟首、虺尾的复合体。', 'A turtle body with a bird''s head and a viper''s tail.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000020', w.id, 'morphology', 'sheep_like', '羊形', 'Sheep-like', '以羊立形者。', 'Shaped like a sheep.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000021', w.id, 'morphology', 'sheep_mouthless', '无口之羊', 'Mouthless sheep', '羊形而无口。', 'A sheep shape without a mouth.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000022', w.id, 'morphology', 'tiger_ox_tail', '虎形牛尾', 'Tiger with an ox tail', '虎形而牛尾。', 'A tiger shape ending in an ox''s tail.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000023', w.id, 'behavior', 'burrowing_hibernation', '穴居冬蛰', 'Burrowing hibernation', '穴居而于冬季蛰伏。', 'Dwelling in burrows and lying dormant through winter.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000024', w.id, 'behavior', 'man_eating', '食人', 'Man-eating', '原文明言食人或能食人。', 'The text states outright that it eats people.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000025', w.id, 'behavior', 'self_naming_call', '鸣声自呼其名', 'Self-naming call', '鸣声即其名，以「其鸣自号」一类句式记载。', 'Its call sounds its own name.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000026', w.id, 'behavior', 'self_singing_dancing', '自歌自舞', 'Self-singing and dancing', '自歌自舞，不因外物。', 'It sings and dances of its own accord.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000027', w.id, 'body', 'dual_sex_description', '自为牝牡', 'Dual-sex description', '原文称其自为牝牡，兼具两性。', 'The text describes it as being both sexes at once.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000028', w.id, 'body', 'multiple_tails_ears', '多尾多耳', 'Multiplied tails and ears', '尾、耳等部件数目成倍于常，且位置异常。', 'Tails, ears or other parts multiplied beyond the ordinary, sometimes in unusual places.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000029', w.id, 'body', 'unkillable_description', '不可杀', 'Unkillable description', '原文称其不可杀。', 'The text states it cannot be killed.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000030', w.id, 'sound', 'infant_like', '声如婴儿', 'Infant-like call', '以婴儿啼声为听感类比。', 'Its call is compared to an infant''s cry.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000031', w.id, 'sound', 'mandarin_duck_like', '声如鸳鸯', 'Mandarin-duck-like call', '以鸳鸯之鸣为听感类比。', 'Its call is compared to a mandarin duck''s.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000032', w.id, 'sound', 'song_like', '声如歌谣', 'Song-like call', '以歌谣为听感类比。', 'Its call is compared to singing.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000033', w.id, 'sound', 'split_wood_like', '声如判木', 'Splitting-wood call', '以劈木之声为听感类比。', 'Its call is compared to wood being split.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000034', w.id, 'effect', 'anti_swelling', '食之不肿', 'Prevents swelling', '原文称食之者不肿。', 'The text claims eating it prevents swelling.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000035', w.id, 'effect', 'confusion_ward', '佩之不惑', 'Wards off confusion', '原文称佩之者不惑。', 'The text claims wearing it keeps one from confusion.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000036', w.id, 'effect', 'sleepless', '食之无卧', 'Removes the need for sleep', '原文称食之者无卧。', 'The text claims eating it removes the need to sleep.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000037', w.id, 'effect', 'swift_movement', '食之善走', 'Grants swiftness', '原文称食之者善走。', 'The text claims eating it makes one swift of foot.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000038', w.id, 'omen', 'corvee_omen', '大徭之兆', 'Omen of forced labour', '见则其县有大徭。', 'Its appearance portends heavy corvée.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000039', w.id, 'omen', 'drought_omen', '大旱之兆', 'Omen of drought', '见则天下大旱。', 'Its appearance portends drought.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000040', w.id, 'omen', 'earthworks_omen', '土功之兆', 'Omen of earthworks', '见则其县多土功。', 'Its appearance portends heavy earthworks.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000041', w.id, 'omen', 'exile_omen', '放士之兆', 'Omen of exile', '见则其县多放士。', 'Its appearance portends many exiles.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000042', w.id, 'omen', 'flood_omen', '大水之兆', 'Omen of flood', '见则郡县大水。', 'Its appearance portends flooding.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000043', w.id, 'omen', 'peace_omen', '安宁之兆', 'Omen of peace', '见则天下安宁。', 'Its appearance portends peace.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)
SELECT '1e000000-0000-4000-8000-000000000044', w.id, 'seasonality', 'winter_summer_cycle', '冬死夏生', 'Winter-death, summer-life cycle', '冬死而夏生的往复周期。', 'A cycle of dying in winter and living again in summer.', 'text_direct', 'published'
  FROM works w WHERE w.slug='shanhaijing'
ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,
  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;

-- 词表齐备之后才立约束：此后任何指派都不可能引用词表里没有的 term。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='shj_taxonomy_assignments_term_fk') THEN
    ALTER TABLE shj_taxonomy_assignments
      ADD CONSTRAINT shj_taxonomy_assignments_term_fk
      FOREIGN KEY (axis, term) REFERENCES shj_taxonomy_terms(axis, term) ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
