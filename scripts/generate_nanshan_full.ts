import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Builder for seed 067: the full Nanshan Jing corpus (segmentation
 * nanshan-full-v2).
 *
 * Reads the frozen collation in scripts/data/nanshan_corpus_v2.json
 * (43 paragraphs: 9+1 Queshan route, 17+1 second route, 13+1 third route, and
 * the colophon), derives topology edges from each paragraph's own
 * direction-and-distance opening, verifies every occurrence quote is a
 * contiguous substring of its passage, computes all checksums, and emits
 * db/seeds/004_nanshan_full.sql deterministically.
 */
const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const WORK = "10000000-0000-4000-8000-000000000011";
const EDITION = "11000000-0000-4000-8000-000000000001";
const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const q = (value: string): string => `'${value.replace(/'/gu, "''")}'`;
const uuid = (prefix: string, index: number): string => `${prefix}-4000-8000-${String(index).padStart(12, "0")}`;
const P = (index: number): string => uuid("13000000-0000", index);
const PL = (index: number): string => uuid("15000000-0000", index);
const C = (index: number): string => uuid("14000000-0000", index);
const O = (index: number): string => uuid("16000000-0000", index);
const E = (index: number): string => uuid("17000000-0000", index);
const T = (index: number): string => uuid("18000000-0000", index);
const D = (index: number): string => uuid("19000000-0000", index);
const CAND = (index: number): string => uuid("1b000000-0000", index);
const VAR = (index: number): string => uuid("1c000000-0000", index);
const SEC = (index: number): string => uuid("12000000-0000", index);

const corpus = JSON.parse(readFileSync(join(ROOT, "scripts/data/nanshan_corpus_v2.json"), "utf8")) as { paragraphs: string[] };
const paras = corpus.paragraphs;
if (paras.length !== 43) throw new Error(`expected 43 paragraphs, got ${paras.length}`);

function chineseNumber(text: string): number {
  const digits: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const units: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };
  let total = 0;
  let current = 0;
  for (const ch of text) {
    if (digits[ch] !== undefined) current = digits[ch];
    else if (units[ch] !== undefined) {
      total += (current || 1) * units[ch];
      current = 0;
    } else throw new Error(`cannot parse numeral ${text}`);
  }
  return total + current;
}

function parseStep(text: string): { direction: string; distance: number } | null {
  const match = /^(?:又)?(東南|西南|東北|西北|東|南|西|北)([一二三四五六七八九十百千]+)里/u.exec(text);
  if (!match) return null;
  return { direction: match[1], distance: chineseNumber(match[2]) };
}

// --- Curated route metadata ------------------------------------------------

type Mountain = { slug: string; para: number; nameZh: string; aliases: string[]; nameEn: string; sumZh: string; sumEn: string };

const SEC1: Mountain[] = [
  { slug: "zhaoyao", para: 0, nameZh: "招摇之山", aliases: ["招摇山"], nameEn: "Mount Zhaoyao", sumZh: "鹊山首列起点，临于西海；祝馀、迷谷与狌狌在此。", sumEn: "The opening mountain of the Queshan route, overlooking the Western Sea; the Zhuyu herb, Migu tree, and Xingxing appear here." },
  { slug: "tangting", para: 1, nameZh: "堂庭之山", aliases: ["堂庭山"], nameEn: "Mount Tangting", sumZh: "招摇之山东三百里的山。", sumEn: "A mountain three hundred li east of Zhaoyao." },
  { slug: "yuanyi", para: 2, nameZh: "猨翼之山", aliases: ["猿翼山"], nameEn: "Mount Yuanyi", sumZh: "堂庭之山东三百八十里的险峻山地。", sumEn: "A difficult mountain three hundred and eighty li east of Tangting." },
  { slug: "niuyang", para: 3, nameZh: "杻阳之山", aliases: ["杻阳山"], nameEn: "Mount Niuyang", sumZh: "鹿蜀、旋龟与怪水所在的山。", sumEn: "The mountain associated with the Lushu, Xuangui, and Guai River." },
  { slug: "dishan", para: 4, nameZh: "柢山", aliases: [], nameEn: "Mount Di", sumZh: "多水无草木，鯥所在。", sumEn: "A watery, treeless mountain associated with the Lu." },
  { slug: "danyuan", para: 5, nameZh: "亶爰之山", aliases: ["亶爰山"], nameEn: "Mount Danyuan", sumZh: "多水无草木且不可上，类所在。", sumEn: "A watery, treeless, unscalable mountain associated with the Lei." },
  { slug: "jishan", para: 6, nameZh: "基山", aliases: [], nameEn: "Mount Ji", sumZh: "阳面多玉，阴面多怪木；猼訑与三首之鸟𪁺𩿧所在。", sumEn: "A mountain of jade and strange trees, associated with the Boyi and the three-headed Changfu bird." },
  { slug: "qingqiu", para: 7, nameZh: "青丘之山", aliases: ["青丘山"], nameEn: "Mount Qingqiu", sumZh: "九尾狐、灌灌、赤鱬及英水所在。", sumEn: "A mountain associated with the Nine-tailed Fox, Guanguan, Chiru, and Ying River." },
  { slug: "jiwei", para: 8, nameZh: "箕尾之山", aliases: ["箕尾山"], nameEn: "Mount Jiwei", sumZh: "鹊山首列东端，山尾抵近东海。", sumEn: "The eastern end of the first Queshan route, reaching the Eastern Sea." },
];

const SEC2: Mountain[] = [
  { slug: "jushan", para: 10, nameZh: "柜山", aliases: [], nameEn: "Mount Ju", sumZh: "南次二经起点，西临流黄；英水西南流注赤水；狸力与鴸在此。", sumEn: "The opening mountain of the second route; the Ying River flows southwest to the Red River, and the Lili and Zhu appear here." },
  { slug: "changyou", para: 11, nameZh: "长右之山", aliases: ["长右山"], nameEn: "Mount Changyou", sumZh: "无草木多水；同名之兽长右在此。", sumEn: "A treeless, watery mountain sharing its name with the four-eared Changyou." },
  { slug: "yaoguang", para: 12, nameZh: "尧光之山", aliases: ["尧光山"], nameEn: "Mount Yaoguang", sumZh: "猾褢穴居冬蛰之山。", sumEn: "The mountain where the burrowing, hibernating Huahuai lives." },
  { slug: "yushan", para: 13, nameZh: "羽山", aliases: [], nameEn: "Mount Yu", sumZh: "下多水，上多雨，多蝮虫。", sumEn: "A rain-soaked mountain with many fuchong vipers." },
  { slug: "qufu", para: 14, nameZh: "瞿父之山", aliases: ["瞿父山"], nameEn: "Mount Qufu", sumZh: "无草木，多金玉。", sumEn: "A bare mountain rich in metal and jade." },
  { slug: "juyu", para: 15, nameZh: "句馀之山", aliases: ["句馀山"], nameEn: "Mount Juyu", sumZh: "无草木，多金玉。", sumEn: "A bare mountain rich in metal and jade." },
  { slug: "fuyu", para: 16, nameZh: "浮玉之山", aliases: ["浮玉山"], nameEn: "Mount Fuyu", sumZh: "北望具区；食人之彘所在；苕水出其阴。", sumEn: "Overlooking Juqu to the north; home of the man-eating Zhi, with the Tiao River rising on its shaded side." },
  { slug: "chengshan", para: 17, nameZh: "成山", aliases: [], nameEn: "Mount Cheng", sumZh: "四方而三坛；𨴯水南流注于虖勺。", sumEn: "Square with three terraces; its river flows south to Hushao." },
  { slug: "kuaiji", para: 18, nameZh: "会稽之山", aliases: ["会稽山"], nameEn: "Mount Kuaiji", sumZh: "四方之山，勺水南流注于湨。", sumEn: "A square mountain whose Shao River flows south to the Ju." },
  { slug: "yishan", para: 19, nameZh: "夷山", aliases: [], nameEn: "Mount Yi", sumZh: "多沙石；湨水南流注于列涂。", sumEn: "A sandy mountain; the Ju River flows south to Lietu." },
  { slug: "pugou", para: 20, nameZh: "仆勾之山", aliases: ["仆勾山"], nameEn: "Mount Pugou", sumZh: "上多金玉，下多草木；无鸟兽，无水。", sumEn: "Metal and jade above, plants below; no birds, beasts, or water." },
  { slug: "xianyin", para: 21, nameZh: "咸阴之山", aliases: ["咸阴山"], nameEn: "Mount Xianyin", sumZh: "无草木，无水。", sumEn: "A bare, waterless mountain." },
  { slug: "xunshan", para: 22, nameZh: "洵山", aliases: [], nameEn: "Mount Xun", sumZh: "无口之兽䍺所在；洵水南流注于阏泽。", sumEn: "Home of the mouthless Huan; the Xun River flows south to the E Marsh." },
  { slug: "hushao", para: 23, nameZh: "虖勺之山", aliases: ["虖勺山"], nameEn: "Mount Hushao", sumZh: "上多梓柟，下多荆杞；滂水东流注于海。", sumEn: "Catalpa and nanmu above, brambles below; the Pang River flows east to the sea." },
  { slug: "quwu", para: 24, nameZh: "区吴之山", aliases: ["区吴山"], nameEn: "Mount Quwu", sumZh: "多砂石；鹿水南流注于滂水。", sumEn: "A gravelly mountain; the Lu River flows south into the Pang." },
  { slug: "luwu", para: 25, nameZh: "鹿吴之山", aliases: ["鹿吴山"], nameEn: "Mount Luwu", sumZh: "泽更之水所出；水中之兽蛊雕食人。", sumEn: "Source of the Zegeng waters, where the horned, man-eating Gudiao dwells." },
  { slug: "qiwu", para: 26, nameZh: "漆吴之山", aliases: ["漆吴山"], nameEn: "Mount Qiwu", sumZh: "处于海滨，望丘山，其光载出载入。", sumEn: "A coastal mountain facing Qiushan, where the light rises and sets." },
];

const SEC3: Mountain[] = [
  { slug: "tianyu", para: 28, nameZh: "天虞之山", aliases: ["天虞山"], nameEn: "Mount Tianyu", sumZh: "南次三经起点，下多水，不可以上。", sumEn: "The opening mountain of the third route; watery below and unscalable." },
  { slug: "daoguo", para: 29, nameZh: "祷过之山", aliases: ["祷过山"], nameEn: "Mount Daoguo", sumZh: "多犀兕象；瞿如与虎蛟所在；泿水南流注于海。", sumEn: "Rich in rhinoceros and elephant; home of the Quru and Hujiao, with the Yin River flowing south to the sea." },
  { slug: "danxue", para: 30, nameZh: "丹穴之山", aliases: ["丹穴山"], nameEn: "Mount Danxue", sumZh: "凤皇所在；丹水南流注于渤海。", sumEn: "The mountain of the Fenghuang; the Dan River flows south to the Bo Sea." },
  { slug: "fashuang", para: 31, nameZh: "发爽之山", aliases: ["发爽山"], nameEn: "Mount Fashuang", sumZh: "无草木，多水，多白猿。", sumEn: "A bare, watery mountain with many white apes." },
  { slug: "maoshan", para: 32, nameZh: "旄山", aliases: ["旄山之尾"], nameEn: "Mount Mao", sumZh: "其尾有育遗之谷，凯风自是出。", sumEn: "Its tail holds the Yuyi valley, from which the south wind rises." },
  { slug: "feishan", para: 33, nameZh: "非山", aliases: ["非山之首"], nameEn: "Mount Fei", sumZh: "其首多金玉，无水，下多蝮虫。", sumEn: "Metal and jade at its head, no water, and many fuchong vipers below." },
  { slug: "yangjia", para: 34, nameZh: "阳夹之山", aliases: ["阳夹山"], nameEn: "Mount Yangjia", sumZh: "无草木，多水。", sumEn: "A bare, watery mountain." },
  { slug: "guanxiang", para: 35, nameZh: "灌湘之山", aliases: ["灌湘山"], nameEn: "Mount Guanxiang", sumZh: "上多木无草，多怪鸟，无兽。", sumEn: "Wooded but grassless, with many strange birds and no beasts." },
  { slug: "jishan-3", para: 36, nameZh: "鸡山", aliases: [], nameEn: "Mount Ji (third route)", sumZh: "黑水所出；鱄鱼见则天下大旱。", sumEn: "Source of the Black River; the Zhuanyu portends great drought." },
  { slug: "lingqiu", para: 37, nameZh: "令丘之山", aliases: ["令丘山"], nameEn: "Mount Lingqiu", sumZh: "无草木多火；中谷条风所出；颙所在。", sumEn: "A fiery, bare mountain whose Zhong valley releases the northeast wind; home of the Yong." },
  { slug: "lunzhe", para: 38, nameZh: "仑者之山", aliases: ["仑者山"], nameEn: "Mount Lunzhe", sumZh: "有白䓘之木，其汗如漆，可以血玉。", sumEn: "Bears the Baigao tree, whose lacquer-like sap can stain jade." },
  { slug: "yugao", para: 39, nameZh: "禺槀之山", aliases: ["禺槀山"], nameEn: "Mount Yugao", sumZh: "多怪兽，多大蛇。", sumEn: "A mountain of strange beasts and great serpents." },
  { slug: "nanyu", para: 40, nameZh: "南禺之山", aliases: ["南禺山"], nameEn: "Mount Nanyu", sumZh: "有穴春入夏出；佐水东南流注于海；凤皇、鹓鶵所居。", sumEn: "Holds a seasonal cave and the Zuo River; the Fenghuang and Yuanchu dwell here." },
];

type Summary = { slug: string; para: number; refKey: string; titleZh: string; titleEn: string; sumZh: string; sumEn: string };
const SUMMARIES: Summary[] = [
  { slug: "queshan-summary", para: 9, refKey: "南山经·鹊山首列·祠礼", titleZh: "鹊山首列·祠礼", titleEn: "Queshan route rites", sumZh: "首列收束：凡十山、二千九百五十里；其神鸟身龙首，祠用璋玉与稌米。", sumEn: "Route closing: ten mountains over 2,950 li; bird-bodied, dragon-headed spirits with zhang-jade and glutinous rice rites." },
  { slug: "nanci2-summary", para: 27, refKey: "南山经·南次二经·祠礼", titleZh: "南次二经·祠礼", titleEn: "Second route rites", sumZh: "南次二经收束：凡十七山、七千二百里；其神龙身鸟首，祠毛用一璧瘗。", sumEn: "Second route closing: seventeen mountains over 7,200 li; dragon-bodied, bird-headed spirits with a buried bi-disc rite." },
  { slug: "nanci3-summary", para: 41, refKey: "南山经·南次三经·祠礼", titleZh: "南次三经·祠礼", titleEn: "Third route rites", sumZh: "南次三经收束：凡一十四山、六千五百三十里；其神龙身人面，祠皆一白狗祈。", sumEn: "Third route closing: fourteen mountains over 6,530 li; dragon-bodied, human-faced spirits with a white-dog rite." },
  { slug: "nanshan-colophon", para: 42, refKey: "南山经·结语", titleZh: "南山经·结语", titleEn: "Nanshan Jing colophon", sumZh: "南经之山志结语：大小凡四十山，万六千三百八十里。", sumEn: "The colophon of the southern mountains: forty mountains in all, over 16,380 li." },
];

type Creature = {
  slug: string; id: number; para: number; place: string | null; surface: string; quote: string;
  nameZh: string; aliases: string[]; nameEn: string; sumZh: string; sumEn: string; detailZh: string; detailEn: string;
  icon: string; importance: number; status: "resolved" | "provisional";
  taxonomy: Array<{ axis: string; term: string; note: string; cls?: "transcription" | "editorial_summary" }>;
};

const NEW_CREATURES: Creature[] = [
  { slug: "changfu", id: 10, para: 6, place: "jishan", surface: "𪁺𩿧", quote: "其狀如雞而三首六目，六足三翼，其名曰𪁺𩿧，食之無臥。", nameZh: "𪁺𩿧", aliases: [], nameEn: "Changfu", sumZh: "鸡形而三首六目、六足三翼之鸟。", sumEn: "A chicken-like bird with three heads, six eyes, six legs, and three wings.", detailZh: "食之无卧作为原文效应记录，不作现代功效声明。", detailEn: "Its sleep-banishing effect is preserved as an ancient claim, not modern advice.", icon: "bird-three-heads", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "composite_bird", note: "三首六目，六足三翼", cls: "editorial_summary" },
    { axis: "effect", term: "sleepless", note: "食之無臥" },
  ] },
  { slug: "lili", id: 11, para: 10, place: "jushan", surface: "狸力", quote: "其狀如豚，有距，其音如狗吠，其名曰狸力，見則其縣多土功。", nameZh: "狸力", aliases: [], nameEn: "Lili", sumZh: "豚形有距之兽，声音如狗吠。", sumEn: "A piglet-shaped beast with spurs and a bark-like call.", detailZh: "见则其县多土功，属原文征兆记载。", detailEn: "Its appearance portending earthworks is a textual omen claim.", icon: "pig-spurred", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "pig_like_spurred", note: "其狀如豚，有距", cls: "editorial_summary" },
    { axis: "omen", term: "earthworks_omen", note: "見則其縣多土功" },
  ] },
  { slug: "zhu-bird", id: 12, para: 10, place: "jushan", surface: "鴸", quote: "其狀如鴟而人手，其音如痺，其名曰鴸，其鳴自號也，見則其縣多放士。", nameZh: "鴸", aliases: ["鴸鸟"], nameEn: "Zhu", sumZh: "鸱形而人手之鸟，鸣声即其名。", sumEn: "An owl-like bird with human hands whose cry speaks its own name.", detailZh: "见则其县多放士，属原文征兆记载。", detailEn: "Its appearance portending banished scholars is a textual omen claim.", icon: "bird-human-hands", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "bird_human_hands", note: "其狀如鴟而人手", cls: "editorial_summary" },
    { axis: "behavior", term: "self_naming_call", note: "其鳴自號也" },
    { axis: "omen", term: "exile_omen", note: "見則其縣多放士" },
  ] },
  { slug: "changyou-beast", id: 13, para: 11, place: "changyou", surface: "長右", quote: "其狀如禺而四耳，其名長右，其音如吟，見則郡縣大水。", nameZh: "长右", aliases: [], nameEn: "Changyou", sumZh: "禺形四耳之兽，与所居之山同名。", sumEn: "A four-eared, ape-like beast sharing its mountain's name.", detailZh: "见则郡县大水，属原文征兆记载；概念与山各自建模。", detailEn: "Its flood omen is textual; the beast and the mountain are modelled separately.", icon: "primate-four-ears", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "primate_four_ears", note: "其狀如禺而四耳", cls: "editorial_summary" },
    { axis: "omen", term: "flood_omen", note: "見則郡縣大水" },
  ] },
  { slug: "huahuai", id: 14, para: 12, place: "yaoguang", surface: "猾褢", quote: "其狀如人而彘鬣，穴居而冬蟄，其名曰猾褢，其音如斲木，見則縣有大繇。", nameZh: "猾褢", aliases: [], nameEn: "Huahuai", sumZh: "人形彘鬣之兽，穴居冬蛰，声音如斲木。", sumEn: "A humanoid beast with boar bristles that burrows and hibernates, sounding like chopped wood.", detailZh: "见则县有大繇，属原文征兆记载。", detailEn: "Its corvee omen is preserved as a textual claim.", icon: "humanoid-bristled", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "humanoid_bristled", note: "其狀如人而彘鬣", cls: "editorial_summary" },
    { axis: "behavior", term: "burrowing_hibernation", note: "穴居而冬蟄" },
    { axis: "omen", term: "corvee_omen", note: "見則縣有大繇" },
  ] },
  { slug: "zhi-beast", id: 15, para: 16, place: "fuyu", surface: "彘", quote: "其狀如虎而牛尾，其音如吠犬，其名曰彘，是食人。", nameZh: "彘", aliases: [], nameEn: "Zhi", sumZh: "虎形牛尾之兽，声音如吠犬，食人。", sumEn: "A tiger-shaped, ox-tailed beast with a barking call, said to eat people.", detailZh: "是食人按原文记录。", detailEn: "The man-eating description is preserved from the text.", icon: "tiger-ox-tail", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "tiger_ox_tail", note: "其狀如虎而牛尾", cls: "editorial_summary" },
    { axis: "behavior", term: "man_eating", note: "是食人" },
  ] },
  { slug: "huan", id: 16, para: 22, place: "xunshan", surface: "䍺", quote: "其狀如羊而無口，不可殺也，其名曰䍺。", nameZh: "䍺", aliases: [], nameEn: "Huan", sumZh: "羊形而无口之兽，原文称不可杀。", sumEn: "A sheep-like beast with no mouth, said to be unkillable.", detailZh: "不可杀也按原文记录，不作生物学推演。", detailEn: "Its unkillable nature is preserved as text, not biology.", icon: "sheep-mouthless", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "sheep_mouthless", note: "其狀如羊而無口", cls: "editorial_summary" },
    { axis: "body", term: "unkillable_description", note: "不可殺也" },
  ] },
  { slug: "gudiao", id: 17, para: 25, place: "luwu", surface: "蠱雕", quote: "名曰蠱雕，其狀如雕而有角，其音如嬰兒之音，是食人。", nameZh: "蛊雕", aliases: ["蠱雕"], nameEn: "Gudiao", sumZh: "雕形有角之水兽，声音如婴儿，食人。", sumEn: "A horned, eagle-shaped water beast with an infant-like cry, said to eat people.", detailZh: "居泽更之水中，是食人按原文记录。", detailEn: "It dwells in the Zegeng waters; the man-eating description is textual.", icon: "eagle-horned", importance: 4, status: "resolved", taxonomy: [
    { axis: "morphology", term: "eagle_horned", note: "其狀如雕而有角", cls: "editorial_summary" },
    { axis: "sound", term: "infant_like", note: "其音如嬰兒之音" },
    { axis: "behavior", term: "man_eating", note: "是食人" },
  ] },
  { slug: "quru", id: 18, para: 29, place: "daoguo", surface: "瞿如", quote: "其狀如鵁，而白首、三足、人面，其名曰瞿如，其鳴自號也。", nameZh: "瞿如", aliases: [], nameEn: "Quru", sumZh: "鵁形白首、三足人面之鸟，鸣声即其名。", sumEn: "A white-headed, three-legged, human-faced bird whose cry speaks its own name.", detailZh: "鸣自号也按原文记录。", detailEn: "The self-naming call is preserved from the text.", icon: "bird-three-legs", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "bird_human_face", note: "白首、三足、人面", cls: "editorial_summary" },
    { axis: "behavior", term: "self_naming_call", note: "其鳴自號也" },
  ] },
  { slug: "hujiao", id: 19, para: 29, place: "daoguo", surface: "虎蛟", quote: "其中有虎蛟，其狀魚身而蛇尾，其音如鴛鴦，食者不腫，可以已痔。", nameZh: "虎蛟", aliases: [], nameEn: "Hujiao", sumZh: "鱼身蛇尾之水兽，声音如鸳鸯。", sumEn: "A fish-bodied, serpent-tailed water creature that calls like mandarin ducks.", detailZh: "食者不肿、可以已痔属原文效应记载，不作现代医学声明。", detailEn: "The healing effects are ancient claims, not modern medicine.", icon: "fish-serpent-tail", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "fish_serpent_composite", note: "魚身而蛇尾", cls: "editorial_summary" },
    { axis: "sound", term: "mandarin_duck_like", note: "其音如鴛鴦" },
    { axis: "effect", term: "anti_swelling", note: "食者不腫" },
  ] },
  { slug: "fenghuang", id: 20, para: 30, place: "danxue", surface: "鳳皇", quote: "有鳥焉，其狀如雞，五采而文，名曰鳳皇，首文曰德，翼文曰義，背文曰禮，膺文曰仁，腹文曰信。", nameZh: "凤皇", aliases: ["凤凰", "鳳凰"], nameEn: "Fenghuang", sumZh: "五采而文之鸟，纹章分别象德义礼仁信。", sumEn: "A five-coloured bird whose markings spell virtue, duty, ritual, humaneness, and trust.", detailZh: "饮食自然、自歌自舞、见则天下安宁均按原文记录；以鳳皇为正名，鳳凰为通行后起写法。", detailEn: "Its self-sufficiency, song, dance, and peace omen are textual; Fenghuang is the canonical form with 鳳凰 as the later common spelling.", icon: "phoenix-five-patterns", importance: 5, status: "resolved", taxonomy: [
    { axis: "morphology", term: "pheasant_five_colours", note: "其狀如雞，五采而文", cls: "editorial_summary" },
    { axis: "behavior", term: "self_singing_dancing", note: "自歌自舞" },
    { axis: "omen", term: "peace_omen", note: "見則天下安寧" },
  ] },
  { slug: "zhuanyu", id: 21, para: 36, place: "jishan-3", surface: "鱄魚", quote: "其中有鱄魚，其狀如鮒而彘毛，其音如豚，見則天下大旱。", nameZh: "鱄鱼", aliases: ["鱄魚"], nameEn: "Zhuanyu", sumZh: "鲋形而彘毛之鱼，声音如豚。", sumEn: "A carp-like fish with boar bristles and a pig-like call.", detailZh: "见则天下大旱，属原文征兆记载。", detailEn: "Its drought omen is preserved as a textual claim.", icon: "fish-bristled", importance: 3, status: "resolved", taxonomy: [
    { axis: "morphology", term: "fish_bristled", note: "其狀如鮒而彘毛", cls: "editorial_summary" },
    { axis: "omen", term: "drought_omen", note: "見則天下大旱" },
  ] },
  { slug: "yong", id: 22, para: 37, place: "lingqiu", surface: "顒", quote: "其狀如梟，人面四目而有耳，其名曰顒，其鳴自號也，見則天下大旱。", nameZh: "颙", aliases: ["顒"], nameEn: "Yong", sumZh: "枭形人面、四目有耳之鸟，鸣声即其名。", sumEn: "An owl-shaped, human-faced bird with four eyes and ears whose cry speaks its own name.", detailZh: "见则天下大旱，属原文征兆记载。", detailEn: "Its drought omen is preserved as a textual claim.", icon: "owl-human-face", importance: 4, status: "resolved", taxonomy: [
    { axis: "morphology", term: "owl_human_face", note: "人面四目而有耳", cls: "editorial_summary" },
    { axis: "behavior", term: "self_naming_call", note: "其鳴自號也" },
    { axis: "omen", term: "drought_omen", note: "見則天下大旱" },
  ] },
  { slug: "yuanchu", id: 23, para: 40, place: "nanyu", surface: "鵷鶵", quote: "佐水出焉，而東南流注于海，有鳳皇、鵷鶵。", nameZh: "鹓鶵", aliases: ["鵷鶵"], nameEn: "Yuanchu", sumZh: "与凤皇并举的仅名之鸟，原文无形态描述。", sumEn: "A name-only bird listed beside the Fenghuang, with no description in the text.", detailZh: "仅存名号，无形态记载，概念状态标为待定。", detailEn: "Only the name survives here, so the concept stays provisional.", icon: "phoenix-kin", importance: 2, status: "provisional", taxonomy: [] },
];

// Second Fenghuang occurrence at Nanyu: same concept, new occurrence.
const EXTRA_OCCURRENCES = [
  { creatureId: C(20), para: 40, place: "nanyu", surface: "鳳皇", quote: "有鳳皇、鵷鶵。", note: "Second textual occurrence of the Fenghuang concept, at Mount Nanyu." },
];

// --- Assemble passages -----------------------------------------------------

type Passage = { id: string; sectionId: string; slug: string; refKey: string; seq: number; para: number; titleZh: string; titleEn: string; sumZh: string; sumEn: string; edNote: string };
const passages: Passage[] = [];
const placeIdBySlug = new Map<string, string>();
const passageIdByPara = new Map<number, string>();

SEC1.forEach((m, i) => {
  passages.push({ id: P(i + 1), sectionId: SEC(1), slug: m.slug, refKey: `南山经·${m.nameZh}`, seq: i + 1, para: m.para, titleZh: m.nameZh, titleEn: m.nameEn, sumZh: m.sumZh, sumEn: m.sumEn, edNote: i === 0 ? "V2 起改用全段落切分（nanshan-full-v2）。" : "" });
  placeIdBySlug.set(m.slug, PL(i + 1));
});
passages.push({ id: P(10), sectionId: SEC(1), slug: SUMMARIES[0].slug, refKey: SUMMARIES[0].refKey, seq: 10, para: 9, titleZh: SUMMARIES[0].titleZh, titleEn: SUMMARIES[0].titleEn, sumZh: SUMMARIES[0].sumZh, sumEn: SUMMARIES[0].sumEn, edNote: "原文称凡十山而列名九山，差异登记为异文。" });
SEC2.forEach((m, i) => {
  passages.push({ id: P(11 + i), sectionId: SEC(2), slug: m.slug, refKey: `南山经·${m.nameZh}`, seq: i + 1, para: m.para, titleZh: m.nameZh, titleEn: m.nameEn, sumZh: m.sumZh, sumEn: m.sumEn, edNote: "" });
  placeIdBySlug.set(m.slug, PL(10 + i));
});
passages.push({ id: P(28), sectionId: SEC(2), slug: SUMMARIES[1].slug, refKey: SUMMARIES[1].refKey, seq: 18, para: 27, titleZh: SUMMARIES[1].titleZh, titleEn: SUMMARIES[1].titleEn, sumZh: SUMMARIES[1].sumZh, sumEn: SUMMARIES[1].sumEn, edNote: "" });
SEC3.forEach((m, i) => {
  passages.push({ id: P(29 + i), sectionId: SEC(3), slug: m.slug, refKey: `南山经·${m.nameZh}`, seq: i + 1, para: m.para, titleZh: m.nameZh, titleEn: m.nameEn, sumZh: m.sumZh, sumEn: m.sumEn, edNote: "" });
  placeIdBySlug.set(m.slug, PL(27 + i));
});
passages.push({ id: P(42), sectionId: SEC(3), slug: SUMMARIES[2].slug, refKey: SUMMARIES[2].refKey, seq: 14, para: 41, titleZh: SUMMARIES[2].titleZh, titleEn: SUMMARIES[2].titleEn, sumZh: SUMMARIES[2].sumZh, sumEn: SUMMARIES[2].sumEn, edNote: "原文称凡一十四山而列名十三山，差异登记为异文。" });
passages.push({ id: P(43), sectionId: SEC(3), slug: SUMMARIES[3].slug, refKey: SUMMARIES[3].refKey, seq: 15, para: 42, titleZh: SUMMARIES[3].titleZh, titleEn: SUMMARIES[3].titleEn, sumZh: SUMMARIES[3].sumZh, sumEn: SUMMARIES[3].sumEn, edNote: "" });
for (const passage of passages) passageIdByPara.set(passage.para, passage.id);
if (passages.length !== 43) throw new Error(`expected 43 passages, got ${passages.length}`);

// Section-2 mountain passage sequence check: 17 mountains then summary seq 18.
// (Section sequences restart per section; edges below rely on route order.)

// Layout bands per section.
function layout(sectionIndex: number, index: number, count: number): { x: number; y: number } {
  const bands = [
    { base: 14, spanStart: 8, spanEnd: 95 },
    { base: 46, spanStart: 4, spanEnd: 96 },
    { base: 76, spanStart: 6, spanEnd: 95 },
  ][sectionIndex - 1];
  const x = bands.spanStart + (count === 1 ? 0 : (index * (bands.spanEnd - bands.spanStart)) / (count - 1));
  const y = bands.base + (index % 2) * 8;
  return { x: Math.round(x * 10) / 10, y };
}

// --- Verify quotes and compute occurrence orders ---------------------------

const textOf = (para: number): string => paras[para];
for (const creature of NEW_CREATURES) {
  if (!textOf(creature.para).includes(creature.quote)) throw new Error(`quote for ${creature.slug} is not a substring of paragraph ${creature.para}`);
  const forms = creature.surface.split("／");
  if (!forms.some((form) => textOf(creature.para).includes(form))) throw new Error(`surface for ${creature.slug} missing`);
}
for (const extra of EXTRA_OCCURRENCES) if (!textOf(extra.para).includes(extra.quote)) throw new Error("extra occurrence quote missing");

// Existing V1 occurrences: recompute occurrence_order inside upgraded texts.
const V1_OCCURRENCES = [
  { id: O(1), para: 0, quote: "其狀如禺而白耳，伏行人走，其名曰狌狌。" },
  { id: O(2), para: 3, quote: "其狀如馬而白首，其文如虎而赤尾，其音如謠，其名曰鹿蜀。" },
  { id: O(3), para: 3, quote: "其狀如龜而鳥首虺尾，其名曰旋龜，其音如判木。" },
  { id: O(4), para: 4, quote: "其狀如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥。" },
  { id: O(5), para: 5, quote: "其狀如狸而有髦，其名曰類，自為牝牡。" },
  { id: O(6), para: 6, quote: "其狀如羊，九尾四耳，其目在背，其名曰猼訑。" },
  { id: O(7), para: 7, quote: "其狀如鳩，其音若呵，名曰灌灌。" },
  { id: O(8), para: 7, quote: "其狀如狐而九尾，其音如嬰兒，能食人。" },
  { id: O(9), para: 7, quote: "其狀如魚而人面，其音如鴛鴦。" },
];
type Occ = { id: string; para: number; position: number };
const allOccurrences: Occ[] = [];
for (const item of V1_OCCURRENCES) {
  const position = textOf(item.para).indexOf(item.quote.replace(/。$/u, ""));
  if (position < 0) throw new Error(`V1 quote not found in upgraded paragraph ${item.para}`);
  allOccurrences.push({ id: item.id, para: item.para, position });
}
const newOccurrenceRows: string[] = [];
let occIndex = 10;
const occurrenceRegistry: Array<{ occId: string; creature: Creature | null; creatureId: string; para: number; place: string | null; surface: string; quote: string; note: string }> = [];
for (const creature of NEW_CREATURES) {
  const occId = O(occIndex);
  occurrenceRegistry.push({ occId, creature, creatureId: C(creature.id), para: creature.para, place: creature.place, surface: creature.surface, quote: creature.quote, note: `Named occurrence in the ${creature.nameEn} passage.` });
  allOccurrences.push({ id: occId, para: creature.para, position: textOf(creature.para).indexOf(creature.quote) });
  occIndex += 1;
}
for (const extra of EXTRA_OCCURRENCES) {
  const occId = O(occIndex);
  occurrenceRegistry.push({ occId, creature: null, creatureId: extra.creatureId, para: extra.para, place: extra.place, surface: extra.surface, quote: extra.quote, note: extra.note });
  allOccurrences.push({ id: occId, para: extra.para, position: textOf(extra.para).indexOf(extra.quote) });
  occIndex += 1;
}
const orderById = new Map<string, number>();
const byPara = new Map<number, Occ[]>();
for (const occ of allOccurrences) {
  const list = byPara.get(occ.para) ?? [];
  list.push(occ);
  byPara.set(occ.para, list);
}
for (const list of byPara.values()) {
  list.sort((a, b) => a.position - b.position);
  list.forEach((occ, index) => orderById.set(occ.id, index + 1));
}

// --- Emit SQL ---------------------------------------------------------------

const sql: string[] = [];
sql.push("BEGIN;");
sql.push(`
/*
  Nanshan Jing full-corpus expansion (segmentation nanshan-full-v2).
  Generated by scripts/generate_nanshan_full.ts from the frozen
  collation in scripts/data/nanshan_corpus_v2.json. Regenerate with
  \`npx tsx scripts/generate_nanshan_full.ts\` instead of editing.
*/`);

// Sections 2 and 3.
sql.push(`INSERT INTO shj_text_sections(id,edition_id,parent_id,slug,sequence,reference_label,title_zh,title_en,summary_zh,summary_en,review_status) VALUES
(${q(SEC(2))},${q(EDITION)},NULL,'nanci2-route',2,'南山经·南次二经','南山经·南次二经','Nanshan Jing · Second Southern Route','自柜山东行至漆吴之山的十七山序列；其神龙身鸟首。','Seventeen mountains from Mount Ju east to Mount Qiwu; their spirits are dragon-bodied and bird-headed.','published'),
(${q(SEC(3))},${q(EDITION)},NULL,'nanci3-route',3,'南山经·南次三经','南山经·南次三经','Nanshan Jing · Third Southern Route','自天虞之山至南禺之山的山列；其神龙身人面。','The route from Mount Tianyu to Mount Nanyu; their spirits are dragon-bodied and human-faced.','published')
ON CONFLICT (id) DO UPDATE SET title_zh=EXCLUDED.title_zh,title_en=EXCLUDED.title_en,summary_zh=EXCLUDED.summary_zh,summary_en=EXCLUDED.summary_en,review_status=EXCLUDED.review_status;`);

// Passages.
const passageValues = passages.map((passage) => {
  const text = textOf(passage.para);
  return `(${q(passage.id)},${q(passage.sectionId)},${q(passage.slug)},${q(passage.refKey)},${passage.seq},${q(text)},${q(text)},'https://ctext.org/shan-hai-jing/nan-shan-jing/zh',${q(sha256(text))},'published')`;
});
sql.push(`INSERT INTO shj_text_passages(id,section_id,slug,reference_key,sequence,text_zh,normalized_text_zh,source_url,checksum_sha256,review_status) VALUES\n${passageValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET
  section_id=EXCLUDED.section_id,slug=EXCLUDED.slug,reference_key=EXCLUDED.reference_key,
  sequence=EXCLUDED.sequence,text_zh=EXCLUDED.text_zh,normalized_text_zh=EXCLUDED.normalized_text_zh,
  source_url=EXCLUDED.source_url,checksum_sha256=EXCLUDED.checksum_sha256,review_status=EXCLUDED.review_status;`);

// Passage translations.
const passageTranslations = passages.flatMap((passage) => [
  `(${q(passage.id)},'zh-CN',${q(passage.titleZh)},${q(passage.sumZh)},${q(passage.edNote)},'published')`,
  `(${q(passage.id)},'en',${q(passage.titleEn)},${q(passage.sumEn)},'','published')`,
]);
sql.push(`INSERT INTO shj_passage_translations(passage_id,locale,title,summary,editorial_note,status) VALUES\n${passageTranslations.join(",\n")}
ON CONFLICT (passage_id,locale) DO UPDATE SET title=EXCLUDED.title,summary=EXCLUDED.summary,editorial_note=EXCLUDED.editorial_note,status=EXCLUDED.status;`);

// Places with recomputed layout bands.
const allMountains: Array<Mountain & { placeId: string; sectionIndex: number; routeIndex: number; routeCount: number }> = [
  ...SEC1.map((m, i) => ({ ...m, placeId: PL(i + 1), sectionIndex: 1, routeIndex: i, routeCount: SEC1.length })),
  ...SEC2.map((m, i) => ({ ...m, placeId: PL(10 + i), sectionIndex: 2, routeIndex: i, routeCount: SEC2.length })),
  ...SEC3.map((m, i) => ({ ...m, placeId: PL(27 + i), sectionIndex: 3, routeIndex: i, routeCount: SEC3.length })),
];
const placeValues = allMountains.map((m, index) => {
  const { x, y } = layout(m.sectionIndex, m.routeIndex, m.routeCount);
  return `(${q(m.placeId)},${q(WORK)},${q(m.slug)},'mountain',${x},${y},'textual-layout-v2',${index + 1},'published')`;
});
sql.push(`INSERT INTO shj_textual_places(id,work_id,slug,place_kind,layout_x,layout_y,layout_space,sort_order,review_status) VALUES\n${placeValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET place_kind=EXCLUDED.place_kind,layout_x=EXCLUDED.layout_x,layout_y=EXCLUDED.layout_y,layout_space=EXCLUDED.layout_space,sort_order=EXCLUDED.sort_order,review_status=EXCLUDED.review_status;`);

const placeTranslations = allMountains.flatMap((m) => [
  `(${q(m.placeId)},'zh-CN',${q(m.nameZh)},${m.aliases.length ? `ARRAY[${m.aliases.map(q).join(",")}]` : "ARRAY[]::text[]"},${q(m.sumZh)},'published')`,
  `(${q(m.placeId)},'en',${q(m.nameEn)},ARRAY[]::text[],${q(m.sumEn)},'published')`,
]);
sql.push(`INSERT INTO shj_textual_place_translations(place_id,locale,name,aliases,summary,status) VALUES\n${placeTranslations.join(",\n")}
ON CONFLICT (place_id,locale) DO UPDATE SET name=EXCLUDED.name,aliases=EXCLUDED.aliases,summary=EXCLUDED.summary,status=EXCLUDED.status;`);

// Place mentions: the mountain's own name in its passage.
const mentionValues = allMountains.map((m) => {
  const passageId = passageIdByPara.get(m.para)!;
  const traditional = /曰([^，。]{1,6}之山)/u.exec(textOf(m.para))?.[1] ?? /曰([^，。]{1,4}山)/u.exec(textOf(m.para))?.[1] ?? m.nameZh;
  if (!textOf(m.para).includes(traditional)) throw new Error(`mention form for ${m.slug} missing`);
  return `(${q(m.placeId)},${q(passageId)},${q(traditional)},0)`;
});
sql.push(`INSERT INTO shj_place_mentions(place_id,passage_id,surface_form,mention_order) VALUES\n${mentionValues.join(",\n")}\nON CONFLICT DO NOTHING;`);

// Creatures.
const creatureValues = NEW_CREATURES.map((creature) => `(${q(C(creature.id))},${q(WORK)},${q(creature.slug)},${q(creature.status)},${creature.importance},${q(creature.icon)},${creature.id})`);
sql.push(`INSERT INTO shj_creatures(id,work_id,slug,concept_status,importance,icon_key,sort_order) VALUES\n${creatureValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET concept_status=EXCLUDED.concept_status,importance=EXCLUDED.importance,icon_key=EXCLUDED.icon_key,sort_order=EXCLUDED.sort_order;`);

const creatureTranslations = NEW_CREATURES.flatMap((creature) => [
  `(${q(C(creature.id))},'zh-CN',${q(creature.nameZh)},${creature.aliases.length ? `ARRAY[${creature.aliases.map(q).join(",")}]` : "ARRAY[]::text[]"},${q(creature.sumZh)},${q(creature.detailZh)},'published')`,
  `(${q(C(creature.id))},'en',${q(creature.nameEn)},ARRAY[${q(creature.nameZh)}],${q(creature.sumEn)},${q(creature.detailEn)},'published')`,
]);
sql.push(`INSERT INTO shj_creature_translations(creature_id,locale,name,aliases,summary,detail,status) VALUES\n${creatureTranslations.join(",\n")}
ON CONFLICT (creature_id,locale) DO UPDATE SET name=EXCLUDED.name,aliases=EXCLUDED.aliases,summary=EXCLUDED.summary,detail=EXCLUDED.detail,status=EXCLUDED.status;`);

// Occurrences.
const occurrenceValues = occurrenceRegistry.map((occ) => {
  const passageId = passageIdByPara.get(occ.para)!;
  const placeId = occ.place ? placeIdBySlug.get(occ.place)! : null;
  return `(${q(occ.occId)},${q(occ.creatureId)},${q(passageId)},${placeId ? q(placeId) : "NULL"},${q(occ.surface)},${q(occ.quote)},${orderById.get(occ.occId)},'text_direct','transcription','high',${q(occ.note)},'published')`;
});
sql.push(`INSERT INTO shj_creature_occurrences(id,creature_id,passage_id,place_id,surface_form,quote_zh,occurrence_order,source_attestation,interpretation_class,confidence,evidence_note,review_status) VALUES\n${occurrenceValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET surface_form=EXCLUDED.surface_form,quote_zh=EXCLUDED.quote_zh,occurrence_order=EXCLUDED.occurrence_order,evidence_note=EXCLUDED.evidence_note,confidence=EXCLUDED.confidence,review_status=EXCLUDED.review_status;`);

// Existing occurrences whose order shifted inside the upgraded passages.
// Two-phase swap: (passage_id, occurrence_order) is unique, so bump the
// changed rows out of range first, then assign the final order.
const V1_ORDER: Record<string, number> = { [O(7)]: 1, [O(8)]: 2, [O(9)]: 3 };
const shifted = V1_OCCURRENCES.filter((item) => orderById.get(item.id)! !== (V1_ORDER[item.id] ?? orderById.get(item.id)!));
for (const item of shifted) sql.push(`UPDATE shj_creature_occurrences SET occurrence_order=${orderById.get(item.id)! + 100} WHERE id=${q(item.id)};`);
for (const item of shifted) sql.push(`UPDATE shj_creature_occurrences SET occurrence_order=${orderById.get(item.id)!} WHERE id=${q(item.id)};`);

// Taxonomy.
let taxonomyIndex = 20;
const taxonomyValues: string[] = [];
for (const creature of NEW_CREATURES) {
  for (const item of creature.taxonomy) {
    if (!textOf(creature.para).includes(item.note)) throw new Error(`taxonomy note for ${creature.slug} (${item.term}) is not in its passage`);
    taxonomyValues.push(`(${q(T(taxonomyIndex))},${q(C(creature.id))},${q(passageIdByPara.get(creature.para)!)},${q(item.axis)},${q(item.term)},'text_direct',${q(item.cls ?? "transcription")},'high',${q(item.note)},'published')`);
    taxonomyIndex += 1;
  }
}
sql.push(`INSERT INTO shj_taxonomy_assignments(id,creature_id,passage_id,axis,term,source_attestation,interpretation_class,confidence,evidence_note,review_status) VALUES\n${taxonomyValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET term=EXCLUDED.term,evidence_note=EXCLUDED.evidence_note,confidence=EXCLUDED.confidence,review_status=EXCLUDED.review_status;`);

// Topology edges for sections 2 and 3.
let edgeIndex = 9;
const edgeValues: string[] = [];
for (const [sectionIndex, group] of [[2, SEC2], [3, SEC3]] as const) {
  for (let index = 1; index < group.length; index += 1) {
    const step = parseStep(textOf(group[index].para));
    if (!step) throw new Error(`no direction/distance at ${group[index].slug}`);
    edgeValues.push(`(${q(E(edgeIndex))},${q(SEC(sectionIndex))},${q(placeIdBySlug.get(group[index - 1].slug)!)},${q(placeIdBySlug.get(group[index].slug)!)},${q(passageIdByPara.get(group[index].para)!)},'distance_direction',${q(step.direction)},${step.distance},'里',${index},'transcription','none','published')`);
    edgeIndex += 1;
  }
}
sql.push(`INSERT INTO shj_topology_edges(id,section_id,from_place_id,to_place_id,passage_id,relation_kind,direction_text,distance_value,distance_unit,sequence,interpretation_class,conflict_status,review_status) VALUES\n${edgeValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET direction_text=EXCLUDED.direction_text,distance_value=EXCLUDED.distance_value,distance_unit=EXCLUDED.distance_unit,sequence=EXCLUDED.sequence,review_status=EXCLUDED.review_status;`);

// Audits for every passage at the new segmentation.
sql.push(`INSERT INTO shj_passage_audits(passage_id,audit_status,segmentation_version,input_checksum_sha256,reviewer_role,reviewed_at,evidence_note)
SELECT p.id,'reviewed','nanshan-full-v2',p.checksum_sha256,'R-CLASSICS',DATE '2026-08-18',
       'Full-paragraph collation audited against ctext with wikisource cross-check; checksum retained in the passage row.'
  FROM shj_text_passages p
  JOIN shj_text_sections s ON s.id=p.section_id
 WHERE s.edition_id=${q(EDITION)}
ON CONFLICT (passage_id) DO UPDATE SET
  audit_status=EXCLUDED.audit_status,segmentation_version=EXCLUDED.segmentation_version,
  input_checksum_sha256=EXCLUDED.input_checksum_sha256,reviewed_at=EXCLUDED.reviewed_at,
  evidence_note=EXCLUDED.evidence_note;`);

// Edition roll-up checksum over all 43 passages in route order.
const editionDigest = sha256(passages.map((passage) => textOf(passage.para)).join("\n"));
sql.push(`UPDATE shj_text_editions SET
  checksum_sha256=${q(editionDigest)},
  source_note='Forty-three full paragraphs covering the complete Nanshan Jing, collated from the Chinese Text Project transcription with wikisource cross-checks; two documented collation overrides (蝮虫, 柢山 opening).',
  edition_reference='Nanshan Jing, complete three-route corpus, forty-three-passage V2 segmentation',
  segmentation_version='nanshan-full-v2',
  source_file_checksum_sha256=${q(editionDigest)},
  transcription_checksum_sha256=${q(editionDigest)},
  retrieved_at=DATE '2026-08-18'
WHERE id=${q(EDITION)};`);

// Work summary metadata.
sql.push(`UPDATE works SET mode_reason='A text-first mythographic atlas. V2 publishes a reviewed internal candidate for the complete Nanshan Jing; textual water references, scholarly place candidates, modern comparison, and artistic interpretation remain explicitly separate.' WHERE id=${q(WORK)};`);
sql.push(`UPDATE work_translations SET summary=CASE locale
  WHEN 'zh-CN' THEN '以原文段落为根，分离异兽概念、文本提及、山系路线、水名证据、学术候选与艺术总览。V2 覆盖《南山经》全部三列山系与结语，异文与计数差异逐条登记。'
  ELSE 'A passage-rooted atlas separating creature concepts, textual occurrences, mountain-route topology, water-name evidence, scholarly candidates, and artistic interpretation. V2 covers all three routes and the colophon of the Nanshan Jing, with variants and count discrepancies recorded individually.'
END WHERE work_id=${q(WORK)};`);

// Variants: collation overrides and count discrepancies.
sql.push(`INSERT INTO shj_text_variants(id,passage_id,occurrence_candidate_id,variant_form,variant_type,source_note,decision_key,reviewer_role,reviewed_at) VALUES
(${q(VAR(2))},${q(P(3))},NULL,'腹虫','edition_reading','ctext prints 多腹虫; the collation retains the received reading 蝮虫.','collation-fuchong','R-CLASSICS',DATE '2026-08-18'),
(${q(VAR(3))},${q(P(5))},NULL,'東三百里祗山','edition_reading','ctext opens the passage 東三百里祗山; wikisource prints 又東三百里柢山. The collation reads 又東三百里，曰柢山.','collation-dishan','R-CLASSICS',DATE '2026-08-18'),
(${q(VAR(4))},${q(P(10))},NULL,'凡十山','unresolved','The closing counts ten mountains while nine are named in the received route; retained as an unresolved count discrepancy.','queshan-count','R-CLASSICS',DATE '2026-08-18'),
(${q(VAR(5))},${q(P(42))},NULL,'凡一十四山','unresolved','The closing counts fourteen mountains while thirteen are named in the received route; retained as an unresolved count discrepancy.','nanci3-count','R-CLASSICS',DATE '2026-08-18')
ON CONFLICT (id) DO UPDATE SET variant_form=EXCLUDED.variant_form,variant_type=EXCLUDED.variant_type,source_note=EXCLUDED.source_note,decision_key=EXCLUDED.decision_key,reviewed_at=EXCLUDED.reviewed_at;`);

// Editorial decisions.
sql.push(`INSERT INTO shj_editorial_decisions(id,work_id,decision_key,decision_type,subject_kind,subject_ref,decision_status,rationale,evidence_note,reviewer_role,decided_at) VALUES
(${q(D(111))},${q(WORK)},'resegmentation-nanshan-full-v2','variant','passage','nanshan-v1-public-domain-collation','accepted','Upgrade the nine V1 excerpts to full received paragraphs and extend the same segmentation to all three routes, so coverage counts audit whole paragraphs rather than excerpts.','Nine V1 passages re-checksummed; thirty-four passages added; occurrence order inside 青丘 recomputed from the received text.','R-CLASSICS',DATE '2026-08-18'),
(${q(D(112))},${q(WORK)},'flora-minerals-passage-level','exclusion','occurrence','plants-and-minerals','accepted','Plants, trees, and minerals (祝馀、迷谷、育沛、白䓘 and similar) remain passage-level content in V2; dedicated flora/mineral kinds are deferred to Scale.','They stay searchable through passage text without being forced into the creature model.','R-CLASSICS',DATE '2026-08-18'),
(${q(D(113))},${q(WORK)},'real-fauna-not-concepts','exclusion','occurrence','xi-si-xiang','accepted','犀、兕、象 at 祷过之山 are real-fauna abundance notes, not anomalous creature concepts, and are not modelled as creatures.','The passage lists them alongside metals as local products.','R-CLASSICS',DATE '2026-08-18'),
(${q(D(114))},${q(WORK)},'canonical-fenghuang','canonical_name','creature','fenghuang','accepted','Use 鳳皇 as the canonical concept label as printed in the passage, with 鳳凰 recorded as the later common spelling.','Named at 丹穴之山 and mentioned again at 南禺之山.','R-CLASSICS',DATE '2026-08-18'),
(${q(D(115))},${q(WORK)},'yuanchu-provisional','canonical_name','creature','yuanchu','provisional','鵷鶵 appears as a name beside 鳳皇 with no description, so the concept stays provisional pending commentary review.','Name-only mention at 南禺之山.','R-CLASSICS',DATE '2026-08-18'),
(${q(D(116))},${q(WORK)},'changyou-name-collision','canonical_name','creature','changyou-beast','accepted','The beast 長右 shares its mountain''s name; concept and place are modelled separately without inventing a distinct beast name.','Named at 長右之山.','R-CLASSICS',DATE '2026-08-18')
ON CONFLICT (id) DO UPDATE SET decision_status=EXCLUDED.decision_status,rationale=EXCLUDED.rationale,evidence_note=EXCLUDED.evidence_note,decided_at=EXCLUDED.decided_at;`);

// Occurrence candidates for the new named occurrences.
let candidateIndex = 11;
const candidateValues = occurrenceRegistry.map((occ) => {
  const value = `(${q(CAND(candidateIndex))},${q(passageIdByPara.get(occ.para)!)},${q(occ.surface)},NULL,NULL,'included',${q(occ.creatureId)},${q(occ.occId)},'Named occurrence selected for V2.','R-CLASSICS',DATE '2026-08-18')`;
  candidateIndex += 1;
  return value;
});
sql.push(`INSERT INTO shj_occurrence_candidates(id,passage_id,surface_form,start_char,end_char,disposition,creature_id,occurrence_id,evidence_note,reviewer_role,reviewed_at) VALUES\n${candidateValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET disposition=EXCLUDED.disposition,evidence_note=EXCLUDED.evidence_note,reviewed_at=EXCLUDED.reviewed_at;`);

sql.push("COMMIT;");

const output = `${sql.join("\n\n")}\n`;
writeFileSync(join(ROOT, "db/seeds/004_nanshan_full.sql"), output);
console.log(`004 written: ${passages.length} passages, ${allMountains.length} places, ${NEW_CREATURES.length} new creatures, ${occurrenceRegistry.length} new occurrences, ${edgeValues.length} new edges, ${taxonomyValues.length} taxonomy rows`);
console.log(`edition checksum ${editionDigest}`);
