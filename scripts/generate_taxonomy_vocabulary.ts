import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Deterministic generator for the taxonomy vocabulary seed.
 *
 * Axis and term used to be free text on the assignment row, which meant the
 * Chinese interface displayed `behavior / man eating` and nothing stopped two
 * spellings of one concept. The curated table below is the source of truth:
 * every term carries both labels and a definition saying what earns the term,
 * not a restatement of the label.
 *
 * Same input, same bytes out — so the seed can be regenerated and diffed
 * rather than hand-edited.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const OUT = join(ROOT, "db/seeds/005_taxonomy_vocabulary.sql");
const q = (value: string): string => `'${value.replace(/'/gu, "''")}'`;
const uuid = (prefix: string, index: number): string => `${prefix}-4000-8000-${String(index).padStart(12, "0")}`;
const AX = (index: number): string => uuid("1d000000-0000", index);
const TM = (index: number): string => uuid("1e000000-0000", index);

interface Axis { axis: string; zh: string; en: string; defZh: string; defEn: string }
interface Term { axis: string; term: string; zh: string; en: string; defZh: string; defEn: string }

const AXES: Axis[] = [
  { axis: "morphology", zh: "形态", en: "Morphology",
    defZh: "原文对形貌的直接描述：像什么、有几首几足几尾、身体各部的组合。",
    defEn: "What the received text says the creature looks like: the animal it resembles, counts of heads, feet and tails, and how body parts combine." },
  { axis: "behavior", zh: "行为", en: "Behaviour",
    defZh: "原文所记的举动与习性，含食性、鸣叫方式与栖止节律。",
    defEn: "Recorded conduct and habit: what it eats, how it calls, how it dwells." },
  { axis: "body", zh: "体征", en: "Body",
    defZh: "无法归入单一形似的身体属性，如雌雄同体、不可杀、多尾多耳等整体性陈述。",
    defEn: "Whole-body attributes that resist a single resemblance: dual sex, unkillability, multiplied parts." },
  { axis: "sound", zh: "声音", en: "Sound",
    defZh: "原文以「其音如」句式给出的类比声描写；类比对象是听感参照，不是物种鉴定。",
    defEn: "Analogical sound descriptions in the form \"its call is like…\"; the referent is an auditory comparison, not a species identification." },
  { axis: "effect", zh: "服食效用", en: "Effect",
    defZh: "原文所述食之、佩之而生的效用；登记为文本主张，不作医药建议。",
    defEn: "Effects the text ascribes to eating or wearing the creature; recorded as textual claims, never as medical advice." },
  { axis: "omen", zh: "兆应", en: "Omen",
    defZh: "以「见则」句式记载的应验之兆；属文本的因果陈述，不是历史事件记录。",
    defEn: "Portents in the form \"when it appears, then…\"; a causal claim made by the text, not a record of events." },
  { axis: "seasonality", zh: "时序", en: "Seasonality",
    defZh: "与季节相系的生死或出没周期。",
    defEn: "Life, death or appearance cycles tied to the seasons." },
];

const TERMS: Term[] = [
  // morphology
  { axis: "morphology", term: "aquatic_terrestrial_composite", zh: "水陆复合", en: "Aquatic–terrestrial composite",
    defZh: "以鱼为名而居于陆，或兼具水陆两栖的部件组合。", defEn: "Named as a fish yet dwelling on land, or combining aquatic and terrestrial parts." },
  { axis: "morphology", term: "bird_dove_like", zh: "鸠形之鸟", en: "Dove-like bird",
    defZh: "以「其状如鸠」立形的鸟类。", defEn: "A bird whose shape the text gives as dove-like." },
  { axis: "morphology", term: "bird_human_face", zh: "人面之鸟", en: "Bird with a human face",
    defZh: "鸟身而具人面。", defEn: "A bird's body carrying a human face." },
  { axis: "morphology", term: "bird_human_hands", zh: "人手之鸟", en: "Bird with human hands",
    defZh: "鸟形而爪作人手。", defEn: "A bird whose claws are described as human hands." },
  { axis: "morphology", term: "composite_bird", zh: "多首多翼之鸟", en: "Multi-part composite bird",
    defZh: "首、目、足、翼数目超出常禽的复合鸟形。", defEn: "A bird with counts of heads, eyes, feet or wings beyond the ordinary." },
  { axis: "morphology", term: "composite_mammal", zh: "复合兽形", en: "Composite mammal",
    defZh: "兽形而杂取他物的纹、尾、首等部件。", defEn: "A mammal shape assembled from parts of other animals." },
  { axis: "morphology", term: "eagle_horned", zh: "有角之雕", en: "Horned eagle",
    defZh: "雕形而有角。", defEn: "An eagle-shaped creature bearing horns." },
  { axis: "morphology", term: "feline_like", zh: "狸形", en: "Feline-like",
    defZh: "以狸立形者。", defEn: "Shaped like a wildcat." },
  { axis: "morphology", term: "fish_bristled", zh: "有毛之鱼", en: "Bristled fish",
    defZh: "鱼形而生兽毛。", defEn: "A fish shape carrying animal bristles." },
  { axis: "morphology", term: "fish_human_face", zh: "人面之鱼", en: "Fish with a human face",
    defZh: "鱼身而具人面。", defEn: "A fish's body carrying a human face." },
  { axis: "morphology", term: "fish_serpent_composite", zh: "鱼身蛇尾", en: "Fish–serpent composite",
    defZh: "鱼身接蛇尾的复合体。", defEn: "A fish body joined to a serpent's tail." },
  { axis: "morphology", term: "fox_nine_tails", zh: "九尾之狐", en: "Nine-tailed fox",
    defZh: "狐形而九尾。", defEn: "A fox shape with nine tails." },
  { axis: "morphology", term: "humanoid_bristled", zh: "人形而鬣", en: "Bristled humanoid",
    defZh: "人形而生彘鬣一类的毛发。", defEn: "A human shape bearing boar-like bristles." },
  { axis: "morphology", term: "owl_human_face", zh: "人面四目", en: "Human-faced owl",
    defZh: "鸮类而具人面，目数超常。", defEn: "An owl-like creature with a human face and more eyes than usual." },
  { axis: "morphology", term: "pheasant_five_colours", zh: "五采之雉", en: "Five-coloured pheasant",
    defZh: "鸡雉之形而五采成文。", defEn: "A fowl shape patterned in five colours." },
  { axis: "morphology", term: "pig_like_spurred", zh: "有距之豚", en: "Spurred pig-like beast",
    defZh: "豚形而有距。", defEn: "A pig shape bearing spurs." },
  { axis: "morphology", term: "primate_four_ears", zh: "四耳之禺", en: "Four-eared primate",
    defZh: "禺形而四耳。", defEn: "A primate shape with four ears." },
  { axis: "morphology", term: "primate_like", zh: "禺形", en: "Primate-like",
    defZh: "以禺立形者。", defEn: "Shaped like a macaque." },
  { axis: "morphology", term: "reptile_bird_composite", zh: "龟身鸟首", en: "Reptile–bird composite",
    defZh: "龟身而鸟首、虺尾的复合体。", defEn: "A turtle body with a bird's head and a viper's tail." },
  { axis: "morphology", term: "sheep_like", zh: "羊形", en: "Sheep-like",
    defZh: "以羊立形者。", defEn: "Shaped like a sheep." },
  { axis: "morphology", term: "sheep_mouthless", zh: "无口之羊", en: "Mouthless sheep",
    defZh: "羊形而无口。", defEn: "A sheep shape without a mouth." },
  { axis: "morphology", term: "tiger_ox_tail", zh: "虎形牛尾", en: "Tiger with an ox tail",
    defZh: "虎形而牛尾。", defEn: "A tiger shape ending in an ox's tail." },
  // behavior
  { axis: "behavior", term: "burrowing_hibernation", zh: "穴居冬蛰", en: "Burrowing hibernation",
    defZh: "穴居而于冬季蛰伏。", defEn: "Dwelling in burrows and lying dormant through winter." },
  { axis: "behavior", term: "man_eating", zh: "食人", en: "Man-eating",
    defZh: "原文明言食人或能食人。", defEn: "The text states outright that it eats people." },
  { axis: "behavior", term: "self_naming_call", zh: "鸣声自呼其名", en: "Self-naming call",
    defZh: "鸣声即其名，以「其鸣自号」一类句式记载。", defEn: "Its call sounds its own name." },
  { axis: "behavior", term: "self_singing_dancing", zh: "自歌自舞", en: "Self-singing and dancing",
    defZh: "自歌自舞，不因外物。", defEn: "It sings and dances of its own accord." },
  // body
  { axis: "body", term: "dual_sex_description", zh: "自为牝牡", en: "Dual-sex description",
    defZh: "原文称其自为牝牡，兼具两性。", defEn: "The text describes it as being both sexes at once." },
  { axis: "body", term: "multiple_tails_ears", zh: "多尾多耳", en: "Multiplied tails and ears",
    defZh: "尾、耳等部件数目成倍于常，且位置异常。", defEn: "Tails, ears or other parts multiplied beyond the ordinary, sometimes in unusual places." },
  { axis: "body", term: "unkillable_description", zh: "不可杀", en: "Unkillable description",
    defZh: "原文称其不可杀。", defEn: "The text states it cannot be killed." },
  // sound
  { axis: "sound", term: "infant_like", zh: "声如婴儿", en: "Infant-like call",
    defZh: "以婴儿啼声为听感类比。", defEn: "Its call is compared to an infant's cry." },
  { axis: "sound", term: "mandarin_duck_like", zh: "声如鸳鸯", en: "Mandarin-duck-like call",
    defZh: "以鸳鸯之鸣为听感类比。", defEn: "Its call is compared to a mandarin duck's." },
  { axis: "sound", term: "song_like", zh: "声如歌谣", en: "Song-like call",
    defZh: "以歌谣为听感类比。", defEn: "Its call is compared to singing." },
  { axis: "sound", term: "split_wood_like", zh: "声如判木", en: "Splitting-wood call",
    defZh: "以劈木之声为听感类比。", defEn: "Its call is compared to wood being split." },
  // effect
  { axis: "effect", term: "anti_swelling", zh: "食之不肿", en: "Prevents swelling",
    defZh: "原文称食之者不肿。", defEn: "The text claims eating it prevents swelling." },
  { axis: "effect", term: "confusion_ward", zh: "佩之不惑", en: "Wards off confusion",
    defZh: "原文称佩之者不惑。", defEn: "The text claims wearing it keeps one from confusion." },
  { axis: "effect", term: "sleepless", zh: "食之无卧", en: "Removes the need for sleep",
    defZh: "原文称食之者无卧。", defEn: "The text claims eating it removes the need to sleep." },
  { axis: "effect", term: "swift_movement", zh: "食之善走", en: "Grants swiftness",
    defZh: "原文称食之者善走。", defEn: "The text claims eating it makes one swift of foot." },
  // omen
  { axis: "omen", term: "corvee_omen", zh: "大徭之兆", en: "Omen of forced labour",
    defZh: "见则其县有大徭。", defEn: "Its appearance portends heavy corvée." },
  { axis: "omen", term: "drought_omen", zh: "大旱之兆", en: "Omen of drought",
    defZh: "见则天下大旱。", defEn: "Its appearance portends drought." },
  { axis: "omen", term: "earthworks_omen", zh: "土功之兆", en: "Omen of earthworks",
    defZh: "见则其县多土功。", defEn: "Its appearance portends heavy earthworks." },
  { axis: "omen", term: "exile_omen", zh: "放士之兆", en: "Omen of exile",
    defZh: "见则其县多放士。", defEn: "Its appearance portends many exiles." },
  { axis: "omen", term: "flood_omen", zh: "大水之兆", en: "Omen of flood",
    defZh: "见则郡县大水。", defEn: "Its appearance portends flooding." },
  { axis: "omen", term: "peace_omen", zh: "安宁之兆", en: "Omen of peace",
    defZh: "见则天下安宁。", defEn: "Its appearance portends peace." },
  // seasonality
  { axis: "seasonality", term: "winter_summer_cycle", zh: "冬死夏生", en: "Winter-death, summer-life cycle",
    defZh: "冬死而夏生的往复周期。", defEn: "A cycle of dying in winter and living again in summer." },
];

async function main(): Promise<void> {
  const lines: string[] = [
    "-- 005: 分类词表（由 scripts/generate_taxonomy_vocabulary.ts 确定性生成，勿手改）",
    "--",
    "-- 词表装入之后再建 assignment → term 外键：bootstrap 先跑完 migration 才跑 seed，",
    "-- 若把外键放进 003，既有 assignment 会在词表存在之前就违约。",
    "",
    "BEGIN;",
    "",
  ];
  lines.push("-- 轴");
  AXES.forEach((axis, index) => {
    lines.push(
      `INSERT INTO shj_taxonomy_axes (id, work_id, axis, label_zh, label_en, definition_zh, definition_en, sequence, review_status)`,
      `SELECT ${q(AX(index + 1))}, w.id, ${q(axis.axis)}, ${q(axis.zh)}, ${q(axis.en)}, ${q(axis.defZh)}, ${q(axis.defEn)}, ${index + 1}, 'published'`,
      `  FROM works w WHERE w.slug='shanhaijing'`,
      `ON CONFLICT (axis) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,`,
      `  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en, sequence=EXCLUDED.sequence;`,
      "",
    );
  });
  lines.push("-- 词条");
  TERMS.forEach((term, index) => {
    lines.push(
      `INSERT INTO shj_taxonomy_terms (id, work_id, axis, term, label_zh, label_en, definition_zh, definition_en, evidence_requirement, review_status)`,
      `SELECT ${q(TM(index + 1))}, w.id, ${q(term.axis)}, ${q(term.term)}, ${q(term.zh)}, ${q(term.en)}, ${q(term.defZh)}, ${q(term.defEn)}, 'text_direct', 'published'`,
      `  FROM works w WHERE w.slug='shanhaijing'`,
      `ON CONFLICT (axis, term) DO UPDATE SET label_zh=EXCLUDED.label_zh, label_en=EXCLUDED.label_en,`,
      `  definition_zh=EXCLUDED.definition_zh, definition_en=EXCLUDED.definition_en;`,
      "",
    );
  });

  lines.push(
    "-- 词表齐备之后才立约束：此后任何指派都不可能引用词表里没有的 term。",
    "DO $$",
    "BEGIN",
    "  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='shj_taxonomy_assignments_term_fk') THEN",
    "    ALTER TABLE shj_taxonomy_assignments",
    "      ADD CONSTRAINT shj_taxonomy_assignments_term_fk",
    "      FOREIGN KEY (axis, term) REFERENCES shj_taxonomy_terms(axis, term) ON UPDATE CASCADE;",
    "  END IF;",
    "END $$;",
    "",
    "COMMIT;",
    "",
  );

  await writeFile(OUT, lines.join("\n"));
  console.log(`005 written: ${AXES.length} axes, ${TERMS.length} terms`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
