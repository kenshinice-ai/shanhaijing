import { label, t } from "../i18n";
import { circleBox, placeNodeLabels, placeRouteLabels, textBox } from "../map-labels";
import { prefersReducedData } from "../prefs";
import type { SelectedEntity, SelectionSource, Tab } from "../state";
import type { Atlas, Locale, ShanhaijingCreature, ShanhaijingPassage, ShanhaijingPlace } from "../types";

interface Props {
  atlas: Atlas;
  locale: Locale;
  tab: Tab;
  query: string;
  selected: SelectedEntity | null;
  onTab: (tab: Tab) => void;
  onQuery: (query: string) => void;
  onSelect: (entity: SelectedEntity, source: SelectionSource) => void;
}

function matches(query: string, ...values: (string | string[])[]): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLocaleLowerCase();
  return values.flat().some((value) => value.toLocaleLowerCase().includes(needle));
}

function LocaleNote({ locale, resolvedLocale, fallbackUsed }: { locale: Locale; resolvedLocale: Locale; fallbackUsed: boolean }) {
  if (!fallbackUsed) return null;
  return <small className="shj-fallback-note" lang={resolvedLocale}>
    {locale === "zh-CN"
      ? `当前显示默认语言内容（${resolvedLocale === "zh-CN" ? "中文" : "English"}）`
      : `Showing the default-language content (${resolvedLocale === "zh-CN" ? "中文" : "English"})`}
  </small>;
}

function CreatureGlyph({ creature }: { creature: ShanhaijingCreature }) {
  const icon = creature.iconKey;
  const tails = icon.includes("nine-tail") || icon.includes("nine-tails");
  const aquatic = icon.includes("fish") || icon.includes("turtle");
  const bird = icon.includes("bird");
  return <span className={`shj-creature-glyph${aquatic ? " aquatic" : ""}${bird ? " bird" : ""}`} aria-hidden="true">
    <i className="body" />
    <i className="head" />
    {tails && <i className="tails" />}
  </span>;
}

function ArtisticOverview({ atlas, locale, selected, onSelect }: Pick<Props, "atlas" | "locale" | "selected" | "onSelect">) {
  const domain = atlas.shanhaijing!;
  const overview = domain.artisticOverview;
  const placeBySlug = new Map(domain.places.map((place) => [place.slug, place]));
  const selectedPlaces = new Set(
    selected?.type === "creature"
      ? domain.creatures.find((item) => item.slug === selected.id)?.placeSlugs ?? []
      : selected?.type === "textual_place" ? [selected.id] : [],
  );
  // On a metered connection the 82 KB master is the one asset worth skipping;
  // the structured substitute carries the same topology without it.
  const reducedData = prefersReducedData();
  const artMaster = reducedData ? null : (overview?.assetUrl ?? null);
  // Rank each place within its own route band (west to east) so labels can be
  // staggered against their immediate neighbours rather than globally.
  const labelRank = new Map<string, number>();
  const bands = new Map<number, ShanhaijingPlace[]>();
  for (const place of domain.places) {
    const key = Math.round(place.layoutY / 14);
    bands.set(key, [...(bands.get(key) ?? []), place]);
  }
  for (const band of bands.values()) {
    [...band].sort((a, b) => a.layoutX - b.layoutX).forEach((place, index) => labelRank.set(place.slug, index));
  }
  const dense = domain.places.length > 20;
  const nodeLabelSize = dense ? 14 : 17;
  // Node geometry is computed once so the route-distance placement below sees
  // exactly the boxes the nodes will render into.
  const geometry = domain.places.map((place) => ({
    place,
    x: place.layoutX * 8.6 + 65,
    y: place.layoutY * 5 + 60,
    creatures: domain.creatures.filter((creature) => creature.placeSlugs.includes(place.slug)),
  }));
  // Rings and creature counts live inside the node group and cannot move, so
  // they are fixed obstacles; names and route distances are placed around them.
  const fixedObstacles = geometry.flatMap((node) => [
    circleBox(node.x, node.y, 19),
    ...(node.creatures.length > 0 ? [textBox(node.x, node.y + 5, String(node.creatures.length), 12, "middle")] : []),
  ]);
  // Names are offered their band-alternating slot first, so an uncrowded map
  // still reads the way it always has.
  const nodeSlots = placeNodeLabels(
    geometry.map((node) => ({
      id: node.place.slug,
      x: node.x,
      y: node.y,
      text: node.place.name,
      fontSize: nodeLabelSize,
      preferBelow: (labelRank.get(node.place.slug) ?? 0) % 2 === 0,
    })),
    fixedObstacles,
  );
  const nodes = geometry.map((node) => ({ ...node, labelAt: nodeSlots.get(node.place.slug) ?? { dx: 0, dy: 44 } }));
  const routeLabels = placeRouteLabels(
    domain.topologyEdges.flatMap((edge) => {
      const from = placeBySlug.get(edge.fromSlug);
      const to = placeBySlug.get(edge.toSlug);
      if (!from || !to) return [];
      return [{
        id: edge.id,
        x1: from.layoutX * 8.6 + 65, y1: from.layoutY * 5 + 60,
        x2: to.layoutX * 8.6 + 65, y2: to.layoutY * 5 + 60,
        text: `${edge.directionText}${edge.distanceValue ?? ""}${edge.distanceUnit}`,
      }];
    }),
    [...fixedObstacles, ...nodes.map((node) => textBox(node.x + node.labelAt.dx, node.y + node.labelAt.dy, node.place.name, nodeLabelSize))],
  );
  return <section className="shj-overview">
    <div className="shj-overview-heading">
      <div>
        <p className="eyebrow">{artMaster
          ? (locale === "zh-CN" ? "艺术总览 · 程序化母图 + 证据叠加" : "Artistic overview · procedural master with evidence overlay")
          : (locale === "zh-CN" ? "艺术总览 · 结构化替代视图" : "Artistic overview · structured substitute")}</p>
        <h2>{overview?.title ?? (locale === "zh-CN" ? "山海经幻想总览" : "Shanhaijing Fantasy Overview")}</h2>
        <p>{overview?.description}</p>
      </div>
      <span className={`shj-generation-state ${overview?.status ?? "planned"}`}>{label(overview?.status ?? "planned", locale)}</span>
    </div>
    {reducedData && overview?.assetUrl && <p className="shj-reduced-data" role="note">
      {locale === "zh-CN"
        ? "已按你的省流量偏好省略 82 KB 艺术母图，改用结构化替代视图；拓扑、热点与图例不受影响。"
        : "Your reduced-data preference is on, so the 82 KB artistic master was skipped in favour of the structured substitute. Topology, hotspots and legend are unaffected."}
    </p>}
    <div className="shj-atlas-frame">
      <svg className="shj-atlas-canvas" viewBox="0 0 1000 600" role="group" aria-labelledby="shj-map-title shj-map-desc">
        <title id="shj-map-title">{locale === "zh-CN" ? "南山经三列山系文本拓扑" : "Textual topology of the three Nanshan Jing routes"}</title>
        <desc id="shj-map-desc">{overview?.disclosure}</desc>
        <defs>
          <linearGradient id="shj-ocean" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#223d3d" /><stop offset="1" stopColor="#132726" /></linearGradient>
          <radialGradient id="shj-land"><stop stopColor="#92744c" /><stop offset=".62" stopColor="#665f43" /><stop offset="1" stopColor="#3e4d3d" /></radialGradient>
          <filter id="shj-glow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {artMaster
          ? <image href={artMaster} width="1000" height="600" preserveAspectRatio="xMidYMid slice" />
          : <>
            <rect width="1000" height="600" fill="url(#shj-ocean)" />
            <path className="shj-landmass" d="M80 390 Q110 170 275 95 Q430 16 585 100 Q720 50 900 170 Q970 280 904 440 Q760 540 548 520 Q310 570 126 490Z" fill="url(#shj-land)" />
            <path className="shj-river" d="M125 382 Q260 330 350 382 T560 360 T760 410 T930 330" />
            <path className="shj-river secondary" d="M340 120 Q410 230 380 390 T510 520" />
          </>}
        {domain.topologyEdges.map((edge) => {
          const from = placeBySlug.get(edge.fromSlug);
          const to = placeBySlug.get(edge.toSlug);
          if (!from || !to) return null;
          const x1 = from.layoutX * 8.6 + 65;
          const y1 = from.layoutY * 5 + 60;
          const x2 = to.layoutX * 8.6 + 65;
          const y2 = to.layoutY * 5 + 60;
          const at = routeLabels.get(edge.id);
          return <g key={edge.id}>
            <path className="shj-route-edge" d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 24} ${x2} ${y2}`} />
            {at && <text className="shj-route-distance" x={at.x} y={at.y}>{edge.directionText}{edge.distanceValue}{edge.distanceUnit}</text>}
          </g>;
        })}
        {nodes.map(({ place, x, y, labelAt, creatures }, index) => {
          const active = selectedPlaces.has(place.slug);
          return <g
            key={place.slug}
            className={`shj-map-node${active ? " active" : ""}`}
            transform={`translate(${x} ${y})`}
            role="button"
            tabIndex={0}
            aria-label={`${place.name}, ${place.summary}`}
            onClick={() => onSelect({ type: "textual_place", workSlug: atlas.work.slug, id: place.slug }, "map")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect({ type: "textual_place", workSlug: atlas.work.slug, id: place.slug }, "map");
              }
            }}
          >
            {!artMaster && <path className="shj-mountain" d={`M-28 20 L-4 -${42 + index % 3 * 8} L12 -12 L30 20Z`} />}
            <circle className="shj-node-ring" r={active ? 26 : 19} filter={active ? "url(#shj-glow)" : undefined} />
            <text className={`shj-node-label${dense ? " dense" : ""}`} x={labelAt.dx} y={labelAt.dy}>{place.name}</text>
            {creatures.length > 0 && <text className="shj-node-count" y="5">{creatures.length}</text>}
          </g>;
        })}
        <text className="shj-sea-label" x="54" y="38">{locale === "zh-CN" ? "西海" : "WESTERN SEA"}</text>
        <text className="shj-sea-label east" x="946" y="574">{locale === "zh-CN" ? "东海" : "EASTERN SEA"}</text>
      </svg>
      <div className="shj-map-legend">
        <strong>{locale === "zh-CN" ? "图层说明" : "Layer disclosure"}</strong>
        <span><i className="topology" />{locale === "zh-CN" ? "原文方向与里距" : "Textual direction and li-distance"}</span>
        <span><i className="artistic" />{locale === "zh-CN" ? "地形为艺术性背景" : "Terrain is artistic context"}</span>
        <span><i className="unresolved" />{locale === "zh-CN" ? "不代表现代经纬度" : "Not modern coordinates"}</span>
      </div>
    </div>
    <p className="shj-map-hint">{locale === "zh-CN" ? "移动端可左右滑动查看地图；路线表提供无需横向滚动的完整文字替代。" : "On mobile, swipe horizontally to inspect the map; the route table is the complete no-scroll text alternative."}</p>
    <p className="shj-disclosure">{overview?.disclosure}</p>
  </section>;
}

function CreatureCards({ atlas, locale, query, selected, onSelect }: Pick<Props, "atlas" | "locale" | "query" | "selected" | "onSelect">) {
  const domain = atlas.shanhaijing!;
  const items = domain.creatures.filter((creature) => matches(query, creature.name, creature.summary, creature.aliases, creature.taxonomy.map((item) => `${item.axis} ${item.term}`)));
  return <div className="shj-card-grid">
    {items.map((creature) => {
      const occurrence = domain.occurrences.find((item) => item.creatureSlug === creature.slug);
      const place = domain.places.find((item) => creature.placeSlugs.includes(item.slug));
      const selectedCreature = selected?.type === "creature" && selected.id === creature.slug;
      return <article key={creature.slug} className={`shj-creature-card${selectedCreature ? " selected" : ""}`}>
        <button
          type="button"
          className="shj-creature-hit"
          aria-label={`${creature.name} · ${locale === "zh-CN" ? "打开详情" : "Open detail"}`}
          onClick={() => onSelect({ type: "creature", workSlug: atlas.work.slug, id: creature.slug }, "list")}
        >
          <CreatureGlyph creature={creature} />
          <span><h3>{creature.name}</h3><p lang={creature.resolvedLocale}>{creature.summary}</p></span>
        </button>
        {occurrence && <blockquote>「{occurrence.quoteZh}」</blockquote>}
        <LocaleNote locale={locale} resolvedLocale={creature.resolvedLocale} fallbackUsed={creature.fallbackUsed} />
        <small>{place?.name ?? "—"} · {label(creature.conceptStatus, locale)} · {creature.taxonomy.length} {locale === "zh-CN" ? "项分类证据" : "taxonomy claims"}</small>
      </article>;
    })}
  </div>;
}

function PassageList({ atlas, locale, query, selected, onSelect }: Pick<Props, "atlas" | "locale" | "query" | "selected" | "onSelect">) {
  const items = atlas.shanhaijing!.passages.filter((passage) => matches(query, passage.title, passage.summary, passage.textZh));
  return <div className="shj-passage-list">
    {items.length === 0 && <p className="shj-empty" role="status">{locale === "zh-CN" ? "没有匹配的段落。" : "No matching passages."}</p>}
    {items.map((passage: ShanhaijingPassage) =>
      <article key={passage.slug} className={selected?.type === "passage" && selected.id === passage.slug ? "selected" : ""}>
        <button type="button" onClick={() => onSelect({ type: "passage", workSlug: atlas.work.slug, id: passage.slug }, "list")}>
          <span>#{passage.sequence}</span><strong>{passage.title}</strong><small>{passage.referenceKey}</small>
        </button>
        <p lang={passage.resolvedLocale}>{passage.summary}</p>
        <LocaleNote locale={locale} resolvedLocale={passage.resolvedLocale} fallbackUsed={passage.fallbackUsed} />
        <blockquote lang="zh-Hant">「{passage.textZh}」</blockquote>
        <footer><span>{passage.creatureSlugs.length} {locale === "zh-CN" ? "次异兽提及" : "creature occurrences"}</span><a href={passage.sourceUrl} target="_blank" rel="noreferrer">{locale === "zh-CN" ? "核对原始页面 ↗" : "Check source page ↗"}</a></footer>
      </article>,
    )}
  </div>;
}

function PlaceRoute({ atlas, locale, query, selected, onSelect }: Pick<Props, "atlas" | "locale" | "query" | "selected" | "onSelect">) {
  const domain = atlas.shanhaijing!;
  const items = domain.places.filter((place) => matches(query, place.name, place.summary, place.aliases));
  // A place belongs to the route section of the passage that mentions it.
  const sectionByPassage = new Map(domain.passages.map((passage) => [passage.slug, passage.sectionSlug]));
  const sectionOf = (place: ShanhaijingPlace): string =>
    place.passageSlugs.map((slug) => sectionByPassage.get(slug)).find(Boolean) ?? domain.sections[0]?.slug ?? "";
  const routes = domain.sections
    .map((section) => ({ section, places: items.filter((place) => sectionOf(place) === section.slug) }))
    .filter((route) => route.places.length > 0);
  return <div className="shj-route-table-wrap">
    {items.length === 0 && <p className="shj-empty" role="status">{locale === "zh-CN" ? "没有匹配的地点。" : "No matching places."}</p>}
    {routes.map(({ section, places }) => <table key={section.slug} className="shj-route-table" aria-label={`${section.title} · ${locale === "zh-CN" ? "路线表" : "route table"}`}>
      <caption>{section.title}<small>{places.length} {locale === "zh-CN" ? "座山" : places.length === 1 ? "mountain" : "mountains"}</small></caption>
      <thead><tr>
        <th scope="col">{locale === "zh-CN" ? "序号" : "No."}</th>
        <th scope="col">{locale === "zh-CN" ? "文本地点" : "Textual place"}</th>
        <th scope="col">{locale === "zh-CN" ? "方向与里距" : "Direction and li-distance"}</th>
        <th scope="col">{locale === "zh-CN" ? "异兽提及" : "Creature mentions"}</th>
      </tr></thead>
      <tbody>{places.map((place: ShanhaijingPlace, index) => {
        const edge = domain.topologyEdges.find((item) => item.toSlug === place.slug);
        const isSelected = selected?.type === "textual_place" && selected.id === place.slug;
        return <tr key={place.slug} className={isSelected ? "selected" : ""}>
          <td className="shj-route-index">{String(index + 1).padStart(2, "0")}</td>
          <th scope="row">
            <button type="button" onClick={() => onSelect({ type: "textual_place", workSlug: atlas.work.slug, id: place.slug }, "list")}>
              <strong>{place.name}</strong><small lang={place.resolvedLocale}>{place.summary}</small>
            </button>
            <LocaleNote locale={locale} resolvedLocale={place.resolvedLocale} fallbackUsed={place.fallbackUsed} />
          </th>
          <td>{edge ? `${edge.directionText} ${edge.distanceValue} ${edge.distanceUnit}` : (locale === "zh-CN" ? "本列起点" : "Route origin")}</td>
          <td>{place.creatureSlugs.length}</td>
        </tr>;
      })}</tbody>
    </table>)}
  </div>;
}

export function ShanhaijingWorkspace({ atlas, locale, tab, query, selected, onTab, onQuery, onSelect }: Props) {
  const domain = atlas.shanhaijing;
  if (!domain) return null;
  const tabs = ["overview", "creatures", "passages", "textualPlaces"] as const;
  const counts = {
    overview: domain.coverage.passagesTotal,
    creatures: domain.creatures.length,
    passages: domain.passages.length,
    textualPlaces: domain.places.length,
  };
  const active = tabs.includes(tab as (typeof tabs)[number]) ? tab as (typeof tabs)[number] : "overview";
  const resultCount = active === "creatures"
    ? domain.creatures.filter((creature) => matches(query, creature.name, creature.summary, creature.aliases, creature.taxonomy.map((item) => `${item.axis} ${item.term}`))).length
    : active === "passages"
      ? domain.passages.filter((passage) => matches(query, passage.title, passage.summary, passage.textZh)).length
      : active === "textualPlaces"
        ? domain.places.filter((place) => matches(query, place.name, place.summary, place.aliases)).length
        : 0;
  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const next = tabs[nextIndex]!;
    onTab(next);
    document.getElementById(`shj-tab-${next}`)?.focus();
  }
  return <section className="shj-workspace">
    <section className="shj-coverage" aria-label={locale === "zh-CN" ? "山海经 V1 覆盖统计" : "Shanhaijing V1 coverage"}>
      <div><strong>{domain.coverage.passagesReviewed}/{domain.coverage.passagesTotal}</strong><span>{locale === "zh-CN" ? "段落已审核" : "passages reviewed"}</span></div>
      <div><strong>{domain.coverage.creatureConcepts}</strong><span>{locale === "zh-CN" ? "异兽概念" : "creature concepts"}</span></div>
      <div><strong>{domain.coverage.textualOccurrences}</strong><span>{locale === "zh-CN" ? "文本提及" : "textual occurrences"}</span></div>
      <div><strong>{domain.places.length}</strong><span>{locale === "zh-CN" ? "文本地点" : "textual places"}</span></div>
    </section>
    <nav className="shj-tabs" role="tablist" aria-label={locale === "zh-CN" ? "山海经浏览模式" : "Shanhaijing views"}>
      {tabs.map((key, index) => <button
        key={key}
        id={`shj-tab-${key}`}
        type="button"
        role="tab"
        aria-selected={active === key}
        aria-controls={`shj-panel-${key}`}
        tabIndex={active === key ? 0 : -1}
        className={active === key ? "active" : ""}
        onClick={() => onTab(key)}
        onKeyDown={(event) => handleTabKeyDown(event, index)}
      >
        {t(key, locale)}<b>{counts[key]}</b>
      </button>)}
    </nav>
    {active !== "overview" && <div className="shj-search">
      <label htmlFor="shj-filter">{locale === "zh-CN" ? "筛选当前视图" : "Filter this view"}</label>
      <input id="shj-filter" type="search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder={locale === "zh-CN" ? "筛选名称、原文、形态或地点…" : "Filter names, text, forms, or places…"} />
      <span className="shj-search-status" role="status" aria-live="polite">
        {locale === "zh-CN" ? `找到 ${resultCount} 项` : `${resultCount} result${resultCount === 1 ? "" : "s"}`}
      </span>
    </div>}
    <div id={`shj-panel-${active}`} role="tabpanel" tabIndex={0} aria-labelledby={`shj-tab-${active}`}>
      {active === "overview"
        ? <ArtisticOverview atlas={atlas} locale={locale} selected={selected} onSelect={onSelect} />
        : active === "creatures"
          ? <CreatureCards atlas={atlas} locale={locale} query={query} selected={selected} onSelect={onSelect} />
          : active === "passages"
            ? <PassageList atlas={atlas} locale={locale} query={query} selected={selected} onSelect={onSelect} />
            : <PlaceRoute atlas={atlas} locale={locale} query={query} selected={selected} onSelect={onSelect} />}
    </div>
  </section>;
}
