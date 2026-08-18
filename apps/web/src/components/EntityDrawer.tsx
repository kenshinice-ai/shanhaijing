import { useEffect, useRef } from "react";
import { label, t } from "../i18n";
import type { SelectedEntity, SelectionSource } from "../state";
import type { Atlas, Locale } from "../types";

interface Props {
  atlas: Atlas;
  entity: SelectedEntity;
  locale: Locale;
  onClose: () => void;
  onSelect: (entity: SelectedEntity, source: SelectionSource) => void;
}

/**
 * Detail panel for the three entity kinds this atlas has.
 *
 * Every panel keeps the evidence layers visibly apart: the received text and
 * its checksum, the editorial synthesis, and the taxonomy claims each carry
 * their own attribution rather than blending into one description.
 */
export function EntityDrawer({ atlas, entity, locale, onClose, onSelect }: Props) {
  const domain = atlas.shanhaijing;
  const panel = useRef<HTMLElement>(null);
  const restoreTo = useRef<Element | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement;
    panel.current?.focus();
    return () => { (restoreTo.current as HTMLElement | null)?.focus?.(); };
  }, [entity.type, entity.id]);

  // Focus trap: a drawer that can be tabbed out of leaves the reader lost
  // behind an overlay they cannot see.
  function trap(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !panel.current) return;
    const focusable = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  const link = (target: SelectedEntity, text: string) =>
    <button type="button" className="drawer-link" onClick={() => onSelect(target, "list")}>{text}</button>;
  const ref = (type: SelectedEntity["type"], id: string): SelectedEntity => ({ type, id, workSlug: atlas.work.slug });

  let title = "";
  let eyebrow = "";
  let body: React.ReactNode = null;

  if (entity.type === "creature") {
    const creature = domain.creatures.find((item) => item.slug === entity.id);
    if (!creature) return null;
    const occurrences = domain.occurrences.filter((item) => item.creatureSlug === creature.slug);
    title = creature.name;
    eyebrow = `${t("creatures", locale)} · ${label(creature.conceptStatus, locale)}`;
    body = <>
      <p lang={creature.resolvedLocale}>{creature.summary}</p>
      {creature.detail && <p className="drawer-detail" lang={creature.resolvedLocale}>{creature.detail}</p>}
      {creature.aliases.length > 0 && <p className="drawer-aliases">{locale === "zh-CN" ? "别名" : "Also written"}: {creature.aliases.join(" · ")}</p>}

      <h4>{locale === "zh-CN" ? "文本提及" : "Textual occurrences"} <b>{occurrences.length}</b></h4>
      <ul className="drawer-occurrences">
        {occurrences.map((occurrence) => {
          const passage = domain.passages.find((item) => item.slug === occurrence.passageSlug);
          return <li key={occurrence.id}>
            <blockquote lang="zh-Hant">「{occurrence.quoteZh}」</blockquote>
            <small>
              {passage && link(ref("passage", passage.slug), passage.title)}
              {" · "}{locale === "zh-CN" ? "文中作" : "written"} {occurrence.surfaceForm}
              {" · "}{label(occurrence.sourceAttestation, locale)}
            </small>
          </li>;
        })}
      </ul>

      {creature.taxonomy.length > 0 && <>
        <h4>{locale === "zh-CN" ? "分类证据" : "Taxonomy claims"} <b>{creature.taxonomy.length}</b></h4>
        <ul className="drawer-taxonomy">
          {creature.taxonomy.map((claim) => <li key={`${claim.axis}-${claim.term}`}>
            <span className="axis">{claim.axisLabel}</span>
            {/* The slug stays in the markup for anyone reading the data, but
                the reader sees the vocabulary's own label and definition. */}
            <span className="term" data-axis={claim.axis} data-term={claim.term} title={claim.termDefinition}>
              {claim.termLabel}
            </span>
            <small className="term-definition">{claim.termDefinition}</small>
            <small lang="zh-Hant">{claim.evidenceNote}</small>
          </li>)}
        </ul>
      </>}
    </>;
  }

  if (entity.type === "passage") {
    const passage = domain.passages.find((item) => item.slug === entity.id);
    if (!passage) return null;
    const section = domain.sections.find((item) => item.slug === passage.sectionSlug);
    title = passage.title;
    eyebrow = `${passage.referenceKey}${section ? ` · ${section.title}` : ""}`;
    body = <>
      <blockquote className="drawer-passage" lang="zh-Hant">「{passage.textZh}」</blockquote>
      <p lang={passage.resolvedLocale}>{passage.summary}</p>
      {passage.editorialNote && <p className="drawer-detail">{passage.editorialNote}</p>}
      <dl className="drawer-meta">
        <dt>{locale === "zh-CN" ? "校验和" : "Checksum"}</dt>
        <dd><code>{passage.checksumSha256.slice(0, 16)}…</code></dd>
        <dt>{locale === "zh-CN" ? "审核状态" : "Review status"}</dt>
        <dd>{label(passage.reviewStatus, locale)}</dd>
      </dl>
      {passage.creatureSlugs.length > 0 && <>
        <h4>{t("creatures", locale)} <b>{passage.creatureSlugs.length}</b></h4>
        <p className="drawer-chips">{passage.creatureSlugs.map((slug) => {
          const creature = domain.creatures.find((item) => item.slug === slug);
          return creature ? <span key={slug}>{link(ref("creature", slug), creature.name)}</span> : null;
        })}</p>
      </>}
      <p><a href={passage.sourceUrl} target="_blank" rel="noreferrer">{locale === "zh-CN" ? "核对原始页面 ↗" : "Check the source page ↗"}</a></p>
    </>;
  }

  if (entity.type === "textual_place") {
    const place = domain.places.find((item) => item.slug === entity.id);
    if (!place) return null;
    const inbound = domain.topologyEdges.find((edge) => edge.toSlug === place.slug);
    const outbound = domain.topologyEdges.find((edge) => edge.fromSlug === place.slug);
    title = place.name;
    eyebrow = `${t("textualPlaces", locale)} · ${label(place.placeKind, locale)}`;
    body = <>
      <p lang={place.resolvedLocale}>{place.summary}</p>
      {place.aliases.length > 0 && <p className="drawer-aliases">{locale === "zh-CN" ? "别名" : "Also written"}: {place.aliases.join(" · ")}</p>}
      <dl className="drawer-meta">
        <dt>{locale === "zh-CN" ? "上一站" : "Previous"}</dt>
        <dd>{inbound
          ? <>{link(ref("textual_place", inbound.fromSlug), domain.places.find((item) => item.slug === inbound.fromSlug)?.name ?? inbound.fromSlug)}
            {` · ${inbound.directionText} ${inbound.distanceValue ?? ""} ${inbound.distanceUnit}`}</>
          : (locale === "zh-CN" ? "本列起点" : "Route origin")}</dd>
        <dt>{locale === "zh-CN" ? "下一站" : "Next"}</dt>
        <dd>{outbound
          ? <>{link(ref("textual_place", outbound.toSlug), domain.places.find((item) => item.slug === outbound.toSlug)?.name ?? outbound.toSlug)}
            {` · ${outbound.directionText} ${outbound.distanceValue ?? ""} ${outbound.distanceUnit}`}</>
          : (locale === "zh-CN" ? "本列末端" : "Route end")}</dd>
        <dt>{locale === "zh-CN" ? "布局坐标" : "Layout coordinates"}</dt>
        <dd><code>{place.layoutX}, {place.layoutY}</code> <small>{place.layoutSpace}</small></dd>
      </dl>
      <p className="drawer-disclosure">{locale === "zh-CN"
        ? "布局坐标只用于构图，不是古代地望，也不是现代经纬度。"
        : "Layout coordinates position the drawing only; they are neither an ancient location nor modern latitude and longitude."}</p>
      {place.creatureSlugs.length > 0 && <>
        <h4>{t("creatures", locale)} <b>{place.creatureSlugs.length}</b></h4>
        <p className="drawer-chips">{place.creatureSlugs.map((slug) => {
          const creature = domain.creatures.find((item) => item.slug === slug);
          return creature ? <span key={slug}>{link(ref("creature", slug), creature.name)}</span> : null;
        })}</p>
      </>}
    </>;
  }

  return <aside
    className="entity-drawer"
    ref={panel}
    role="dialog"
    aria-modal="false"
    aria-label={title}
    tabIndex={-1}
    onKeyDown={trap}
  >
    <header>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      <button type="button" className="drawer-close" onClick={onClose} aria-label={t("close", locale)}>×</button>
    </header>
    <div className="drawer-body">{body}</div>
  </aside>;
}
