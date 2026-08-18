# 生僻字子集字体

《南山经》语料里有八个字不在常见系统字体的覆盖范围内。四个属 CJK 扩展 A 区，四个属扩展 B 区；
macOS / iOS / Android 出厂字体都不含扩展 B 区这四个字，因此异兽概念「𪁺𩿧」在迁移前渲染为两个空框——
图集恰恰在它最该显示的地方丢字。这里的两个子集只带这八个字形，其余字符仍走系统字体栈。

| 码位 | 字 | 区段 | 出现处 |
|---|---|---|---|
| U+437A | 䍺 | Ext-A | 异兽提及 surface form、羭次之山段引文 |
| U+44D8 | 䓘 | Ext-A | 山川摘要（白䓘之木） |
| U+49FF | 䧿 | Ext-A | 段落引文 |
| U+4A3C | 䨼 | Ext-A | 段落引文 |
| U+28D2F | 𨴯 | Ext-B | 山川摘要（𨴯水） |
| U+29FE7 | 𩿧 | Ext-B | 异兽概念「𪁺𩿧」 |
| U+2A07A | 𪁺 | Ext-B | 异兽概念「𪁺𩿧」 |
| U+2A2A8 | 𪊨 | Ext-B | 山川摘要 |

## 来源与权利

- 上游：Jigmo（次未・字文）字体，版本 `Jigmo-20250912`，明朝体，覆盖扩展 A–G 区。
- 项目地址：<https://github.com/kamichikoichi/jigmo>（工具 MIT；发布的字体文件随包 `LICENSE.txt` 为 **CC0 1.0 Universal**）。
- 字形数据源自 GlyphWiki。CC0 对再分发与子集化无附加条件；本目录仍保留完整出处以符合本项目的资产溯源要求。
- 上游文件 SHA-256：
  - `Jigmo.ttf`（扩展 A 区）`c8f295b9bd8f9f117a76b3a454aaaa1bb5b4babc18e254978c6deb88464e40cf`
  - `Jigmo2.ttf`（扩展 B 区）`5da3582efe77e22073b86b3b86b556d7111148a76b957cfb53318a91da2efff0`
- 本目录产物 SHA-256：
  - `shj-rare-han-ext-a.woff2`（1,960 B）`831bffe330652078b428c9734fb2464f1cb792408a5dddca0af6db1c9ea75a13`
  - `shj-rare-han-ext-b.woff2`（2,116 B）`b1559655e1fe1cabf96fc540d65f5b52132c800a1a6cae19f7e4633396d1ae4e`

## 重新生成

码位表不是手抄的——它是从烘焙产物里扫出来的，语料扩量后应重新扫一遍再重做子集：

```bash
node -e 'const fs=require("fs");const s=fs.readdirSync("apps/web/dist/data").map(f=>fs.readFileSync("apps/web/dist/data/"+f,"utf8")).join("");
const r=new Set();for(const c of s){const p=c.codePointAt(0);if((p>=0x3400&&p<=0x4DBF)||(p>=0x20000&&p<=0x2FFFF))r.add(p);}
console.log([...r].sort((a,b)=>a-b).map(c=>"U+"+c.toString(16).toUpperCase()).join(","))'
```

```bash
pip install fonttools brotli
pyftsubset Jigmo.ttf  --unicodes="U+437A,U+44D8,U+49FF,U+4A3C" \
  --flavor=woff2 --layout-features='' --no-hinting --desubroutinize \
  --output-file=apps/web/public/fonts/shj-rare-han-ext-a.woff2
pyftsubset Jigmo2.ttf --unicodes="U+28D2F,U+29FE7,U+2A07A,U+2A2A8" \
  --flavor=woff2 --layout-features='' --no-hinting --desubroutinize \
  --output-file=apps/web/public/fonts/shj-rare-han-ext-b.woff2
```

`unicode-range` 与上面的码位表必须保持一致（见 `apps/web/src/base.css` 顶部的 `@font-face`）：
范围之外的字符不会触发下载，两个文件也只在页面真的出现这些字时才被取回。
