import { useEffect, useState } from "react";
import { getAtlas } from "./api";
import { EntityDrawer } from "./components/EntityDrawer";
import { GlobalSearch } from "./components/GlobalSearch";
import { ShanhaijingWorkspace } from "./components/ShanhaijingWorkspace";
import { label, originRegionLabel, t } from "./i18n";
import {
  WORK_SLUG, parseAtlasState, serializeAtlasState,
  type ExploreState, type SelectedEntity, type SelectionSource, type Tab,
} from "./state";
import type { Atlas, Locale } from "./types";

const WELCOME: Record<Locale, { line: string; ref: string }> = {
  "zh-CN": { line: "又東三百里，曰青丘之山。", ref: "《山海经·南山经》" },
  en: { line: "Three hundred li farther east lies Mount Qingqiu.", ref: "Shanhaijing · Nanshan Jing · project rendering" },
};

const FOOTER_NOTE: Record<Locale, string> = {
  "zh-CN": "凡图像位置与比例，皆为艺术编排；原文关系与学术候选另层可查。",
  en: "Image positions and scale are artistic composition; textual relations and scholarly candidates remain separately inspectable.",
};

function tabForEntity(entity: SelectedEntity): Tab {
  return entity.type === "creature" ? "creatures" : entity.type === "passage" ? "passages" : "textualPlaces";
}

export default function App() {
  const [explore, setExplore] = useState<ExploreState>(() => parseAtlasState(location.search));
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const locale = explore.locale;

  useEffect(() => {
    document.title = locale === "zh-CN" ? "山海经 Atlas · Shanhaijing Atlas" : "Shanhaijing Atlas · 山海经 Atlas";
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const restore = () => setExplore(parseAtlasState(location.search));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  useEffect(() => { history.replaceState(null, "", serializeAtlasState(explore)); }, [explore]);

  useEffect(() => {
    let current = true;
    setError(null);
    void getAtlas(WORK_SLUG, locale)
      .then((value) => { if (current) setAtlas(value); })
      .catch((cause: unknown) => { if (current) setError(cause instanceof Error ? cause.message : String(cause)); });
    return () => { current = false; };
  }, [locale]);

  useEffect(() => {
    if (!explore.selectedEntity) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExplore((current) => ({ ...current, selectedEntity: null }));
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [explore.selectedEntity]);

  function commit(next: ExploreState, push = false) {
    if (push) history.pushState(null, "", serializeAtlasState(next));
    setExplore(next);
  }

  function selectEntity(entity: SelectedEntity, source: SelectionSource) {
    commit({ ...explore, selectedEntity: entity, selectionSource: source, tab: tabForEntity(entity) }, true);
  }

  const welcome = WELCOME[locale];

  return <main className={explore.selectedEntity ? "has-drawer" : undefined}>
    <header className="topbar">
      <div className="brand">
        <p className="eyebrow">{locale === "zh-CN" ? "循山海原文，见万物异象" : "Follow the text; meet its creatures"}</p>
        <h1>{locale === "zh-CN" ? "山海经 Atlas" : "Shanhaijing Atlas"}</h1>
      </div>
      <div className="controls">
        <GlobalSearch locale={locale} atlas={atlas} onSelectEntity={(entity) => selectEntity(entity, "search")} />
        <div className="locale" role="group" aria-label="language">
          <button className={locale === "zh-CN" ? "active" : ""} aria-pressed={locale === "zh-CN"} onClick={() => commit({ ...explore, locale: "zh-CN" }, true)}>中文</button>
          <button className={locale === "en" ? "active" : ""} aria-pressed={locale === "en"} onClick={() => commit({ ...explore, locale: "en" }, true)}>EN</button>
        </div>
      </div>
    </header>

    {error ? <section className="error" role="alert"><strong>{t("error", locale)}</strong><p>{error}</p></section>
      : !atlas ? <Skeleton locale={locale} />
        : <>
          <section className="hero" style={{ borderColor: atlas.work.themeColor }}>
            <div>
              <span className="badge">{label(atlas.work.category, locale)}</span>
              <h2>{atlas.work.title}</h2>
              <p>{atlas.work.summary}</p>
              <small>
                {originRegionLabel(atlas.work.originRegion, locale)}
                {" · "}{atlas.shanhaijing.coverage.creatureConcepts} {t("creatures", locale)}
                {" · "}{atlas.shanhaijing.coverage.textualOccurrences} {locale === "zh-CN" ? "文本提及" : "textual occurrences"}
                {" · "}{atlas.shanhaijing.coverage.passagesReviewed}/{atlas.shanhaijing.coverage.passagesTotal} {t("passages", locale)}
              </small>
            </div>
            <button className="copy" onClick={() => void navigator.clipboard.writeText(location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}>
              {copied ? t("copied", locale) : t("copy", locale)}
            </button>
          </section>

          <figure className="epigraph">
            <blockquote lang={locale === "zh-CN" ? "zh-Hant" : "en"}>{locale === "zh-CN" ? `「${welcome.line}」` : `“${welcome.line}”`}</blockquote>
            <cite>{locale === "zh-CN" ? "——" : "— "}{welcome.ref}</cite>
          </figure>

          <ShanhaijingWorkspace
            atlas={atlas}
            locale={locale}
            tab={explore.tab}
            query={explore.query}
            selected={explore.selectedEntity}
            onTab={(tab) => commit({ ...explore, tab }, true)}
            onQuery={(query) => commit({ ...explore, query })}
            onSelect={selectEntity}
          />

          {atlas.sources.length > 0 && <footer>
            <h2>{t("sources", locale)}</h2>
            <p>{t("dataNote", locale)}</p>
            <p><small>{FOOTER_NOTE[locale]}</small></p>
            <div className="source-grid">
              {atlas.sources.map((source) => <details key={source.id}>
                <summary>
                  {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}
                  {" · "}{label(source.sourceType, locale)}{" · "}{label(source.evidenceGrade, locale)}
                </summary>
                <p>{source.citation}</p>
              </details>)}
            </div>
          </footer>}

          {explore.selectedEntity && <EntityDrawer
            atlas={atlas}
            entity={explore.selectedEntity}
            locale={locale}
            onClose={() => commit({ ...explore, selectedEntity: null })}
            onSelect={selectEntity}
          />}
        </>}

    <p className="production-credit">A&nbsp;PARADISE&nbsp;PRODUCTION&nbsp;·&nbsp;天域文创出品</p>
  </main>;
}

function Skeleton({ locale }: { locale: Locale }) {
  return <div className="skeleton" role="status" aria-live="polite">
    <span className="sr-only">{t("loading", locale)}…</span>
    <div className="skeleton-hero" />
    <div className="skeleton-workspace"><div className="skeleton-map" /></div>
  </div>;
}
