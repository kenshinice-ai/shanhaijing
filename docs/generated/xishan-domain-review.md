# 《西山经》领域建模评审单

由 `scripts/extract_xishan_domain.ts` 生成，勿手改。**这份文件是本轮真正的产物**：
数据以 `draft` 入库、不上线，现在只对审的人有用；没有评审单，「已建模」就只是一句自述。

- 抽取执行：R-AI-EXTRACT（AI，未经人复核） ｜ 日期：2026-08-19
- 输入语料：82 段冻结本（`scripts/data/xishan_corpus_v1.json`）
- 规模：78 站（77 山）、65 水、183 边、62 概念、64 处出现、125 条分类

每条引文都由生成器断言为所属段落的**连续子串**；断言失败则生成器报错，不会产出。

## 0. 需要人来看的几处

### 0.1 读音存疑 14 字

英文专名由这些字拼出，读错则名字错：

| 字 | 拟音 | 出现于 |
|---|---|---|
| 㕄 | di | 㕄阳之山 |
| 䰷 | fu | 䰷魚 |
| 䲹 | pi | 欽䲹 |
| 愓 | ti | 符愓之山 |
| 磈 | wei | — |
| 𢓨 | yin | 𢕟𢓨 |
| 𢕟 | ao | 𢕟𢓨 |
| 𤛎 | min | 𤛎 |
| 𤣎 | lei | 𤣎如 |
| 𧔥 | yi | 肥𧔥 |
| 𩇯 | fei | 橐𩇯 |
| 𩳁 | chi | 神𩳁 |
| 𩶯 | tiao | 𩶯魮之魚 |
| 𪇱 | gu | — |

### 0.2 拼音相撞的水名

同音异名，slug 以序号区分：

- 漆水 → `xi-w-qishui-2`
- 禺水 → `xi-w-yushui-2`
- 觀水 → `xi-w-guanshui-2`
- 逐水 → `xi-w-zhushui-2`

### 0.3 未建概念的存疑之处

| 段 | 词 | 缘由 |
|---|---|---|
| 43 | 葆江 | 被鼓与欽䲹所杀之神，全篇仅此一见，无形貌描写；是否单立概念待编辑裁定 |
| 45 | 槐鬼離侖 | 见于「北望諸毗」的远望之辞，非本山所有，且无形貌描写 |
| 45 | 窮鬼 | 见于「東望恒山四成」的远望之辞，非本山所有 |
| 52 | 員神磈氏 | 文称「實惟員神磈氏之宮」，与白帝少昊是否同神，原文未言，不臆合 |
| 80 | （无名之鸟） | 「其狀如鴞而人面，蜼身犬尾，其名自號也」——原文未出其名，不代拟名 |

### 0.4 英文摘要一律留空

地点、异兽、段落的英文 summary 全为空串。写摘要是翻译，翻译要人负责——这是执行清单 1-2，未做，也没假装做了。

## 1. 路线与地点

### 西山经·华山首列（第 1–19 段，19 站）

| # | 段 | 名 | slug | 英文 | 段首所据 | 水 |
|---|---|---|---|---|---|---|
| 1 | 1 | 錢來之山 | `xi-qianlai` | Mount Qianlai | 之首，曰錢來之山 | — |
| 2 | 2 | 松果之山 | `xi-songguo` | Mount Songguo | 西四十五里，曰松果之山 | 濩水→渭水 |
| 3 | 3 | 太華之山 | `xi-taihua` | Mount Taihua | 又西六十里，曰太華之山 | — |
| 4 | 4 | 小華之山 | `xi-xiaohua` | Mount Xiaohua | 又西八十里，曰小華之山 | — |
| 5 | 5 | 符禺之山 | `xi-fuyu` | Mount Fuyu | 又西八十里，曰符禺之山 | 符禺之水→渭水 |
| 6 | 6 | 石脆之山 | `xi-shicui` | Mount Shicui | 又西六十里，曰石脆之山 | 灌水→禺水 |
| 7 | 7 | 英山 | `xi-ying` | Mount Ying | 又西七十里，曰英山 | 禺水→招水 |
| 8 | 8 | 竹山 | `xi-zhu` | Mount Zhu | 又西五十二里，曰竹山 | 竹水→渭水、丹水→洛水 |
| 9 | 9 | 浮山 | `xi-fu` | Mount Fu | 又西百二十里，曰浮山 | — |
| 10 | 10 | 羭次之山 | `xi-yuci` | Mount Yuci | 又西七十里，曰羭次之山 | 漆水→渭水 |
| 11 | 11 | 時山 | `xi-shi` | Mount Shi | 又西百五十里，曰時山 | 逐水→渭水 |
| 12 | 12 | 南山 | `xi-nan` | Mount Nan | 又西百七十里，曰南山 | 丹水→渭水 |
| 13 | 13 | 大時之山 | `xi-dashi` | Mount Dashi | 又西百八十里，曰大時之山 | 涔水→渭水、清水→漢水 |
| 14 | 14 | 嶓冡之山 | `xi-bozhong` | Mount Bozhong | 又西三百二十里，曰嶓冡之山 | 漢水→沔、囂水→湯水 |
| 15 | 15 | 天帝之山 | `xi-tiandi` | Mount Tiandi | 又西三百五十里，曰天帝之山 | — |
| 16 | 16 | 皋塗之山 | `xi-gaotu` | Mount Gaotu | 西南三百八十里，曰皋塗之山 | 薔水→諸資之水、塗水→集獲之水 |
| 17 | 17 | 黃山 | `xi-huang` | Mount Huang | 又西百八十里，曰黃山 | 盼水→赤水 |
| 18 | 18 | 翠山 | `xi-cui` | Mount Cui | 又西二百里，曰翠山 | — |
| 19 | 19 | 騩山 | `xi-gui` | Mount Gui | 又西二百五十里，曰騩山 | 淒水→海 |

### 西山经·西次二经（第 21–37 段，17 站）

| # | 段 | 名 | slug | 英文 | 段首所据 | 水 |
|---|---|---|---|---|---|---|
| 1 | 21 | 鈐山 | `xi-qian` | Mount Qian | 之首，曰鈐山 | — |
| 2 | 22 | 泰冒之山 | `xi-taimao` | Mount Taimao | 西二百里，曰泰冒之山 | 浴水→河水 |
| 3 | 23 | 數歷之山 | `xi-shuli` | Mount Shuli | 又西一百七十里，曰數歷之山 | 楚水→渭水 |
| 4 | 24 | 高山 | `xi-gao` | Mount Gao | 又西百五十里曰高山 | 涇水→渭水 |
| 5 | 25 | 女床之山 | `xi-nvchuang` | Mount Nvchuang | 西南三百里，曰女床之山 | — |
| 6 | 26 | 龍首之山 | `xi-longshou` | Mount Longshou | 又西二百里，曰龍首之山 | 苕水→涇水 |
| 7 | 27 | 鹿臺之山 | `xi-lutai` | Mount Lutai | 又西二百里，曰鹿臺之山 | — |
| 8 | 28 | 鳥危之山 | `xi-niaowei` | Mount Niaowei | 西南二百里，曰鳥危之山 | 鳥危之水→赤水 |
| 9 | 29 | 小次之山 | `xi-xiaoci` | Mount Xiaoci | 又西四百里，曰小次之山 | — |
| 10 | 30 | 大次之山 | `xi-daci` | Mount Daci | 又西三百里，曰大次之山 | — |
| 11 | 31 | 薰吳之山 | `xi-xunwu` | Mount Xunwu | 又西四百里，曰薰吳之山 | — |
| 12 | 32 | 㕄陽之山 | `xi-diyang` | Mount Diyang | 又西四百里，曰㕄陽之山 | — |
| 13 | 33 | 眾獸之山 | `xi-zhongshou` | Mount Zhongshou | 又西二百五十里，曰眾獸之山 | — |
| 14 | 34 | 皇人之山 | `xi-huangren` | Mount Huangren | 又西五百里，曰皇人之山 | 皇水→赤水 |
| 15 | 35 | 中皇之山 | `xi-zhonghuang` | Mount Zhonghuang | 又西三百里，曰中皇之山 | — |
| 16 | 36 | 西皇之山 | `xi-xihuang` | Mount Xihuang | 又西三百五十里，曰西皇之山 | — |
| 17 | 37 | 萊山 | `xi-lai` | Mount Lai | 又西三百五十里，曰萊山 | — |

### 西山经·西次三经（第 39–60 段，23 站）

| # | 段 | 名 | slug | 英文 | 段首所据 | 水 |
|---|---|---|---|---|---|---|
| 1 | 39 | 崇吾之山 | `xi-chongwu` | Mount Chongwu | 之首，曰崇吾之山 | — |
| 2 | 40 | 長沙之山 | `xi-changsha` | Mount Changsha | 西北三百里，曰長沙之山 | 泚水→泑水 |
| 3 | 41 | 不周之山 | `xi-buzhou` | Mount Buzhou | 又西北三百七十里，曰不周之山 | — |
| 4 | 42 | 峚山 | `xi-mi` | Mount Mi | 又西北四百二十里，曰峚山 | 丹水→稷澤 |
| 5 | 43 | 鍾山 | `xi-zhong` | Mount Zhong | 又西北四百二十里，曰鍾山 | — |
| 6 | 44 | 泰器之山 | `xi-taiqi` | Mount Taiqi | 又西百八十里，曰泰器之山 | 觀水→流沙 |
| 7 | 45 | 槐江之山 | `xi-huaijiang` | Mount Huaijiang | 又西三百二十里，曰槐江之山 | 丘時之水→泑水 |
| 8 | 46 | 崑崙之丘 | `xi-kunlun` | Kunlun Hill | 西南四百里，曰崑崙之丘 | 河水→無達、赤水→氾天之水、洋水→醜塗之水、黑水→大杅 |
| 9 | 47 | 樂游之山 | `xi-leyou` | Mount Leyou | 又西三百七十里，曰樂游之山 | 桃水→稷澤 |
| 10 | 48 | 流沙 | `xi-liusha` | Liusha | 西水行四百里，曰流沙 | — |
| 11 | 48 | 蠃母之山 | `xi-luomu` | Mount Luomu | 二百里至于蠃母之山 | — |
| 12 | 49 | 玉山 | `xi-yu` | Mount Yu | 又西三百五十里，曰玉山 | — |
| 13 | 50 | 軒轅之丘 | `xi-xuanyuan` | Xuanyuan Hill | 又西四百八十里，曰軒轅之丘 | 洵水→黑水 |
| 14 | 51 | 積石之山 | `xi-jishi` | Mount Jishi | 又西三百里，曰積石之山 | — |
| 15 | 52 | 長留之山 | `xi-changliu` | Mount Changliu | 又西二百里，曰長留之山 | — |
| 16 | 53 | 章莪之山 | `xi-zhange` | Mount Zhange | 又西二百八十里，曰章莪之山 | — |
| 17 | 54 | 陰山 | `xi-yin` | Mount Yin | 又西三百里，曰陰山 | 濁浴之水→蕃澤 |
| 18 | 55 | 符愓之山 | `xi-futi` | Mount Futi | 又西二百里，曰符愓之山 | — |
| 19 | 56 | 三危之山 | `xi-sanwei` | Mount Sanwei | 又西二百二十里，曰三危之山 | — |
| 20 | 57 | 騩山 | `xi-gui-r3` | Mount Gui | 又西一百九十里，曰騩山 | — |
| 21 | 58 | 天山 | `xi-tian` | Mount Tian | 又西三百五十里，曰天山 | 英水→湯谷 |
| 22 | 59 | 泑山 | `xi-you` | Mount You | 又西二百九十里，曰泑山 | — |
| 23 | 60 | 翼望之山 | `xi-yiwang` | Mount Yiwang | 西水行百里，至于翼望之山 | — |

### 西山经·西次四经（第 62–80 段，19 站）

| # | 段 | 名 | slug | 英文 | 段首所据 | 水 |
|---|---|---|---|---|---|---|
| 1 | 62 | 陰山 | `xi-yin-r4` | Mount Yin | 之首曰陰山 | 陰水→洛水 |
| 2 | 63 | 勞山 | `xi-lao` | Mount Lao | 北五十里，曰勞山 | 弱水→洛水 |
| 3 | 64 | 罷父之山 | `xi-bafu` | Mount Bafu | 西五十里，曰罷父之山 | 洱水→洛水 |
| 4 | 65 | 申山 | `xi-shen` | Mount Shen | 北百七十里，曰申山 | 區水→河水 |
| 5 | 66 | 鳥山 | `xi-niao` | Mount Niao | 北二百里，曰鳥山 | 辱水→河水 |
| 6 | 67 | 上申之山 | `xi-shangshen` | Mount Shangshen | 又北百二十里，曰上申之山 | 湯水→河水 |
| 7 | 68 | 諸次之山 | `xi-zhuci` | Mount Zhuci | 又北百八十里，曰諸次之山 | 諸次之水→河水 |
| 8 | 69 | 號山 | `xi-hao` | Mount Hao | 又北百八十里，曰號山 | 端水→河水 |
| 9 | 70 | 盂山 | `xi-yu-r4` | Mount Yu | 又北二百二十里，曰盂山 | 生水→河水 |
| 10 | 71 | 白於之山 | `xi-baiyu` | Mount Baiyu | 西二百五十里，曰白於之山 | 洛水→渭水、夾水→生水 |
| 11 | 72 | 申首之山 | `xi-shenshou` | Mount Shenshou | 西北三百里，曰申首之山 | 申水 |
| 12 | 73 | 涇谷之山 | `xi-jinggu` | Mount Jinggu | 又西五十五里，曰涇谷之山 | 涇水→渭水 |
| 13 | 74 | 剛山 | `xi-gang` | Mount Gang | 又西百二十里，曰剛山 | 剛水→渭水 |
| 14 | 75 | 剛山之尾 | `xi-gang-wei` | Tail of Mount Gang | 又西二百里，至剛山之尾 | 洛水→河水 |
| 15 | 76 | 英鞮之山 | `xi-yingdi` | Mount Yingdi | 又西三百五十里，曰英鞮之山 | 涴水→陵羊之澤 |
| 16 | 77 | 中曲之山 | `xi-zhongqu` | Mount Zhongqu | 又西三百里，曰中曲之山 | — |
| 17 | 78 | 邽山 | `xi-gui-r4` | Mount Gui | 又西二百六十里，曰邽山 | 濛水→洋水 |
| 18 | 79 | 鳥鼠同穴之山 | `xi-niaoshutongxue` | Mount Niaoshutongxue | 又西二百二十里，曰鳥鼠同穴之山 | 渭水→河水、濫水→漢水 |
| 19 | 80 | 崦嵫之山 | `xi-yanzi` | Mount Yanzi | 西南三百六十里，曰崦嵫之山 | 苕水→海 |

## 2. 异兽与神祇

| # | 段 | 名 | slug | 类 | 所在 | 原文引文 | 分类 |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 羬羊 | `qianyang` | 兽 | 錢來之山 | 有獸焉，其狀如羊而馬尾，名曰羬羊，其脂可以已腊。 | morphology/composite_mammal<br>effect/medicinal_claim |
| 2 | 2 | 䳋渠 | `tiaoqu` | 鸟 | 松果之山 | 有鳥焉，其名曰䳋渠，其狀如山雞，黑身赤足，可以已𦢊。 | effect/medicinal_claim |
| 3 | 3 | 肥𧔥 | `feiyi-serpent` | 蛇 | 太華之山 | 有蛇焉，名曰肥𧔥，六足四翼，見則天下大旱。 | morphology/serpentine<br>morphology/multiplied_limbs<br>omen/drought_omen |
| 4 | 5 | 葱聾 | `conglong` | 兽 | 符禺之山 | 其獸多葱聾，其狀如羊而赤鬣。 | morphology/sheep_like |
| 5 | 5 | 鴖 | `min-bird` | 鸟 | 符禺之山 | 其鳥多鴖，其狀如翠而赤喙，可以禦火。 | effect/protective_claim |
| 6 | 7 | 䰷魚 | `fuyu-fish` | 鱼 | 英山 | 其中多䰷魚，其狀如鱉，其音如羊。 | sound/animal_like_call |
| 7 | 7 | 肥遺 | `feiyi-bird` | 鸟 | 英山 | 有鳥焉，其狀如鶉，黃身而赤喙，其名曰肥遺，食之已癘，可以殺蟲。 | effect/medicinal_claim<br>effect/toxic_use |
| 8 | 8 | 人魚 | `renyu` | 鱼（暂定） | 竹山 | 其中多水玉，多人魚。 | — |
| 9 | 8 | 毫彘 | `haozhi` | 兽 | 竹山 | 有獸焉，其狀如豚而白毛，大如笄而黑端，名曰毫彘。 | morphology/bristled |
| 10 | 10 | 囂 | `xiao` | 兽 | 羭次之山 | 有獸焉，其狀如禺而長臂，善投，其名曰囂。 | morphology/primate_like |
| 11 | 10 | 橐𩇯 | `tuofei` | 鸟 | 羭次之山 | 有鳥焉，其狀如梟，人面而一足，曰橐𩇯，冬見夏蟄，服之不畏雷。 | morphology/human_faced<br>morphology/single_limbed<br>seasonality/winter_visible_summer_dormant<br>effect/protective_claim |
| 12 | 15 | 谿邊 | `xibian` | 兽 | 天帝之山 | 有獸焉，其狀如狗，名曰谿邊，席其皮者不蠱。 | effect/protective_claim |
| 13 | 15 | 櫟 | `li-bird` | 鸟 | 天帝之山 | 有鳥焉，其狀如鶉，黑文而赤翁，名曰櫟，食之已痔。 | effect/medicinal_claim |
| 14 | 16 | 𤣎如 | `leiru` | 兽 | 皋塗之山 | 有獸焉，其狀如鹿而白尾，馬足人手而四角，名曰𤣎如。 | morphology/hybrid_limbs<br>morphology/horned |
| 15 | 16 | 數斯 | `shusi` | 鸟 | 皋塗之山 | 有鳥焉，其狀如鴟而人足，名曰數斯，食之已癭。 | morphology/hybrid_limbs<br>effect/medicinal_claim |
| 16 | 17 | 𤛎 | `min-beast` | 兽 | 黃山 | 有獸焉，其狀如牛，而蒼黑大目，其名曰𤛎。 | — |
| 17 | 17 | 鸚䳇 | `yingwu` | 鸟 | 黃山 | 有鳥焉，其狀如鴞，青羽赤喙，人舌能言，名曰鸚䳇。 | behavior/human_speech |
| 18 | 18 | 鸓 | `lei-bird` | 鸟 | 翠山 | 其鳥多鸓，其狀如鵲，赤黑而兩首四足，可以禦火。 | morphology/multiplied_limbs<br>effect/protective_claim |
| 19 | 25 | 鸞鳥 | `luanniao` | 鸟 | 女床之山 | 有鳥焉，其狀如翟而五彩文，名曰鸞鳥，見則天下安寧。 | omen/peace_omen |
| 20 | 27 | 鳧徯 | `fuxi` | 鸟 | 鹿臺之山 | 有鳥焉，其狀如雄雞而人面，名曰鳧徯，其鳴自叫也，見則有兵。 | morphology/human_faced<br>behavior/self_naming_call<br>omen/war_omen |
| 21 | 29 | 朱厭 | `zhuyan` | 兽 | 小次之山 | 有獸焉，其狀如猿，而白首赤足，名曰朱厭，見則大兵。 | morphology/primate_like<br>omen/war_omen |
| 22 | 37 | 羅羅 | `luoluo` | 鸟（暂定） | 萊山 | 其鳥多羅羅，是食人。 | behavior/man_eating |
| 23 | 39 | 舉父 | `jufu` | 兽 | 崇吾之山 | 有獸焉，其狀如禺而文臂，豹虎而善投，名曰舉父。 | morphology/primate_like |
| 24 | 39 | 蠻蠻 | `manman-bird` | 鸟 | 崇吾之山 | 有鳥焉，其狀如鳧，而一翼一目，相得乃飛，名曰蠻蠻，見則天下大水。 | morphology/single_limbed<br>behavior/paired_flight<br>omen/flood_omen |
| 25 | 43 | 鼓 | `gu-deity` | 神 | 鍾山 | 其子曰鼓，其狀如人面而龍身，是與欽䲹殺葆江于崑崙之陽 | being_kind/deity<br>morphology/human_faced |
| 26 | 43 | 欽䲹 | `qinpi` | 神 | 鍾山 | 欽䲹化為大鶚，其狀如鵰而黑文白首，赤喙而虎爪，其音如晨鵠，見則有大兵 | being_kind/transformed_form<br>sound/animal_like_call<br>omen/war_omen |
| 27 | 44 | 文鰩魚 | `wenyaoyu` | 鱼 | 泰器之山 | 是多文鰩魚，狀如鯉魚，魚身而鳥翼，蒼文而白首，赤喙，常行西海，遊於東海，以夜飛。 | morphology/composite_fish<br>behavior/nocturnal_flight<br>sound/animal_like_call<br>effect/medicinal_claim<br>omen/harvest_omen |
| 28 | 45 | 蠃母 | `luomu` | 未定（暂定） | 槐江之山 | 其中多蠃母，其上多青雄黃 | — |
| 29 | 45 | 英招 | `yingzhao` | 神 | 槐江之山 | 神英招司之，其狀馬身而人面，虎文而鳥翼，徇于四海，其音如榴。 | being_kind/deity<br>morphology/human_faced<br>morphology/winged_quadruped |
| 30 | 45 | 天神 | `huaijiang-tianshen` | 神（暂定） | 槐江之山 | 有天神焉，其狀如牛，而八足二首馬尾，其音如勃皇，見則其邑有兵。 | being_kind/deity<br>morphology/multiplied_limbs<br>omen/war_omen |
| 31 | 46 | 陸吾 | `luwu-deity` | 神 | 崑崙之丘 | 神陸吾司之。其神狀虎身而九尾，人面而虎爪；是神也，司天之九部及帝之囿時。 | being_kind/deity<br>being_kind/divine_office<br>morphology/human_faced<br>body/multiple_tails_ears |
| 32 | 46 | 土螻 | `tulou` | 兽 | 崑崙之丘 | 有獸焉，其狀如羊而四角，名曰土螻，是食人。 | morphology/horned<br>behavior/man_eating |
| 33 | 46 | 欽原 | `qinyuan` | 鸟 | 崑崙之丘 | 有鳥焉，其狀如蜂，大如鴛鴦，名曰欽原，蠚鳥獸則死，蠚木則枯。 | effect/toxic_use |
| 34 | 46 | 鶉鳥 | `chunniao` | 鸟 | 崑崙之丘 | 有鳥焉，其名曰鶉鳥，是司帝之百服。 | being_kind/divine_office |
| 35 | 47 | 滑魚 | `huayu` | 鱼 | 樂游之山 | 其中多滑魚，其狀如蛇而四足，是食魚。 | morphology/composite_fish<br>behavior/preys_on_named |
| 36 | 48 | 長乘 | `changcheng` | 神 | 蠃母之山 | 神長乘司之，是天之九德也。其神狀如人而犳尾。 | being_kind/deity<br>morphology/composite_mammal |
| 37 | 49 | 西王母 | `xiwangmu` | 神 | 玉山 | 西王母其狀如人，豹尾虎齒而善嘯，蓬髮戴勝，是司天之厲及五殘。 | being_kind/deity<br>being_kind/divine_office<br>morphology/composite_mammal |
| 38 | 49 | 狡 | `jiao` | 兽 | 玉山 | 有獸焉，其狀如犬而豹文，其角如牛，其名曰狡，其音如吠犬，見則其國大穰。 | morphology/horned<br>sound/animal_like_call<br>omen/harvest_omen |
| 39 | 49 | 胜遇 | `shengyu` | 鸟 | 玉山 | 有鳥焉，其狀如翟而赤，名曰胜遇，是食魚，其音如錄，見則其國大水。 | behavior/preys_on_named<br>omen/flood_omen |
| 40 | 52 | 白帝少昊 | `shaohao` | 神 | 長留之山 | 其神白帝少昊居之。 | being_kind/deity<br>being_kind/divine_office |
| 41 | 53 | 猙 | `zheng` | 兽 | 章莪之山 | 有獸焉，其狀如赤豹，五尾一角，其音如擊石，其名如猙。 | body/multiple_tails_ears<br>morphology/horned<br>sound/object_like_call |
| 42 | 53 | 畢方 | `bifang` | 鸟 | 章莪之山 | 有鳥焉，其狀如鶴，一足，赤文青質而白喙，名曰畢方，其鳴自叫也，見則其邑有譌火。 | morphology/single_limbed<br>behavior/self_naming_call<br>omen/fire_omen |
| 43 | 54 | 天狗 | `tiangou` | 兽 | 陰山 | 有獸焉，其狀如狸而白首，名曰天狗，其音如榴榴，可以禦凶。 | morphology/feline_like<br>effect/protective_claim |
| 44 | 56 | 三青鳥 | `sanqingniao` | 鸟（暂定） | 三危之山 | 三青鳥居之。 | — |
| 45 | 56 | 𢕟𢓨 | `aoyin` | 兽 | 三危之山 | 其上有獸焉，其狀如牛，白身四角，其毫如披蓑，其名曰𢕟𢓨，是食人。 | morphology/horned<br>morphology/bristled<br>behavior/man_eating |
| 46 | 56 | 鴟 | `chi-bird` | 鸟 | 三危之山 | 有鳥焉，一首而三身，其狀如𪇱，其名曰鴟。 | morphology/multiplied_limbs |
| 47 | 57 | 耆童 | `qitong` | 神 | 騩山 | 神耆童居之，其音常如鍾磬。 | being_kind/deity<br>sound/object_like_call |
| 48 | 58 | 帝江 | `dijiang` | 神 | 天山 | 有神焉，其狀如黃囊，赤如丹火，六足四翼，渾敦無面目，是識歌舞，實惟帝江也。 | being_kind/deity<br>morphology/multiplied_limbs |
| 49 | 59 | 蓐收 | `rushou` | 神 | 泑山 | 神蓐收居之。 | being_kind/deity |
| 50 | 59 | 紅光 | `hongguang` | 神 | 泑山 | 神紅光之所司也 | being_kind/deity<br>being_kind/divine_office |
| 51 | 60 | 讙 | `huan-xishan` | 兽 | 翼望之山 | 有獸焉，其狀如狸，一目而三尾，名曰讙，其音如𡙸百聲，是可以禦凶，服之已癉。 | morphology/feline_like<br>body/multiple_tails_ears<br>effect/protective_claim<br>effect/medicinal_claim |
| 52 | 60 | 鵸鵌 | `qitu` | 鸟 | 翼望之山 | 有鳥焉，其狀如烏，三首六尾而善笑，名曰鵸鵌，服之使人不厭，又可以禦凶。 | morphology/multiplied_limbs<br>effect/protective_claim |
| 53 | 67 | 當扈 | `danghu` | 鸟 | 上申之山 | 其鳥多當扈，其狀如雉，以其髯飛，食之不眴目。 | effect/medicinal_claim |
| 54 | 74 | 神𩳁 | `shenchi` | 神 | 剛山 | 是多神𩳁，其狀人面獸身，一足一手，其音如欽。 | being_kind/deity<br>morphology/human_faced<br>morphology/single_limbed |
| 55 | 75 | 蠻蠻 | `manman-beast` | 兽 | 剛山之尾 | 其中多蠻蠻，其狀鼠身而鱉首，其音如吠犬。 | morphology/composite_mammal<br>sound/animal_like_call |
| 56 | 76 | 冉遺之魚 | `ranyiyu` | 鱼 | 英鞮之山 | 是多冉遺之魚，魚身蛇首、六足，其目如馬耳，食之使人不眯，可以禦凶。 | morphology/composite_fish<br>morphology/multiplied_limbs<br>effect/protective_claim |
| 57 | 77 | 駮 | `bo-beast` | 兽 | 中曲之山 | 有獸焉，其狀如馬而白身黑尾，一角，虎牙爪，音如鼓音，其名曰駮，是食虎豹，可以禦兵。 | morphology/horned<br>sound/object_like_call<br>behavior/preys_on_named<br>effect/protective_claim |
| 58 | 78 | 窮奇 | `qiongqi` | 兽 | 邽山 | 其上有獸焉，其狀如牛，蝟毛，名曰窮奇，音如獋狗，是食人。 | morphology/bristled<br>sound/animal_like_call<br>behavior/man_eating |
| 59 | 78 | 蠃魚 | `luoyu` | 鱼 | 邽山 | 蠃魚，魚身而鳥翼，音如鴛鴦，見則其邑大水。 | morphology/composite_fish<br>sound/animal_like_call<br>omen/flood_omen |
| 60 | 79 | 鰠魚 | `saoyu` | 鱼 | 鳥鼠同穴之山 | 其中多鰠魚，其狀如鱣魚，動則其邑有大兵。 | omen/war_omen |
| 61 | 79 | 𩶯魮之魚 | `tiaopiyu` | 鱼 | 鳥鼠同穴之山 | 多𩶯魮之魚，其狀如覆銚，鳥首而魚翼魚尾，音如磬石之聲，是生珠玉。 | morphology/composite_fish<br>sound/object_like_call |
| 62 | 80 | 孰湖 | `shuhu` | 兽 | 崦嵫之山 | 有獸焉，其狀馬身而鳥翼，人面蛇尾，是好舉人，名曰孰湖。 | morphology/winged_quadruped<br>morphology/human_faced<br>behavior/abducts_people |

### 2.1 另记的化身出现

| 概念 | 段 | 形 | 引文 |
|---|---|---|---|
| gu-deity | 43 | 鵔鳥 | 鼓亦化為鵔鳥，其狀如鴟，赤足而直喙，黃文而白首，其音如鵠，見則其邑大旱。 |
| qinpi | 43 | 欽䲹 | 是與欽䲹殺葆江于崑崙之陽 |

## 3. 不建为概念者

以下按既有裁定不建为概念，仍可经段落原文检索

- 草木矿物（13）：文莖、萆荔、黃雚、薰草、蓇蓉、杜衡、礜、無條、丹木、沙棠、薲草、櫰木、嘉果
- 无形貌描写的常兽常鸟（27）：㸲牛、赤鷩、白翰、猛豹、尸鳩、犀、兕、象、虎、豹、麢羊、麋鹿、白狼、白虎、白雉、白翟、白鹿、鴞、白豪、旄牛、麝、白猿、白蛇、眾蛇、文貝、黃貝、龜

## 4. 计数与里程

见 [xishan-arithmetic.md](xishan-arithmetic.md)。

