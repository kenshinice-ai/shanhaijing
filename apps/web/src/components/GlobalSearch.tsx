import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "../i18n";
import type { SelectedEntity } from "../state";
import type { Atlas, Locale } from "../types";

interface Props {
  locale: Locale;
  atlas: Atlas | null;
  onSelectEntity: (entity: SelectedEntity) => void;
}

interface Hit { type: SelectedEntity["type"]; slug: string; label: string; context: string }

/**
 * In-memory search over the loaded atlas.
 *
 * The whole corpus is already in the payload, so searching it locally keeps
 * the static build (which has no server) and the dynamic build on exactly one
 * code path instead of two behaviours that can drift apart.
 */
export function GlobalSearch({ locale, atlas, onSelectEntity }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && box.current && !box.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle || !atlas) return [];
    const domain = atlas.shanhaijing;
    const matches = (...values: (string | string[])[]) =>
      values.flat().some((value) => value.toLocaleLowerCase().includes(needle));
    const found: Hit[] = [
      ...domain.creatures
        .filter((item) => matches(item.name, item.summary, item.aliases))
        .map((item): Hit => ({ type: "creature", slug: item.slug, label: item.name, context: item.summary })),
      ...domain.places
        .filter((item) => matches(item.name, item.summary, item.aliases))
        .map((item): Hit => ({ type: "textual_place", slug: item.slug, label: item.name, context: item.summary })),
      ...domain.passages
        .filter((item) => matches(item.title, item.summary, item.textZh, item.referenceKey))
        .map((item): Hit => ({ type: "passage", slug: item.slug, label: item.title, context: item.summary })),
    ];
    return found.slice(0, 24);
  }, [query, atlas]);

  useEffect(() => setActive(0), [query]);

  function choose(hit: Hit) {
    onSelectEntity({ type: hit.type, id: hit.slug, workSlug: atlas?.work.slug ?? "shanhaijing" });
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") { setOpen(false); return; }
    if (hits.length === 0) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => (index + 1) % hits.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (index - 1 + hits.length) % hits.length); }
    else if (event.key === "Enter") { event.preventDefault(); const hit = hits[active]; if (hit) choose(hit); }
  }

  const kindLabel: Record<Hit["type"], string> = {
    creature: t("creatures", locale),
    passage: t("passages", locale),
    textual_place: t("textualPlaces", locale),
  };

  // The ARIA combobox pattern: focus stays in the input and
  // `aria-activedescendant` points at the highlighted option. Options are not
  // buttons — a control nested inside an option is both invalid and a second,
  // conflicting way to move focus.
  const expanded = open && query.trim().length > 0;
  const optionId = (index: number) => `search-option-${index}`;

  return <div className="global-search" ref={box}>
    <input
      type="search"
      role="combobox"
      value={query}
      aria-label={t("searchEverything", locale)}
      placeholder={t("searchEverything", locale)}
      aria-autocomplete="list"
      aria-expanded={expanded}
      aria-controls="search-results"
      aria-activedescendant={expanded && hits[active] ? optionId(active) : undefined}
      onFocus={() => setOpen(true)}
      onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
      onKeyDown={onKeyDown}
    />
    {expanded && <ul className="search-results" id="search-results" role="listbox" aria-label={t("searchEverything", locale)}>
      {hits.length === 0 && <li className="empty" role="status">{t("noResults", locale)}</li>}
      {hits.map((hit, index) => <li
        key={`${hit.type}:${hit.slug}`}
        id={optionId(index)}
        role="option"
        aria-selected={index === active}
        className={index === active ? "active" : ""}
        onPointerDown={(event) => { event.preventDefault(); choose(hit); }}
        onPointerEnter={() => setActive(index)}
      >
        <span className="kind">{kindLabel[hit.type]}</span>
        <strong>{hit.label}</strong>
        <small>{hit.context}</small>
      </li>)}
    </ul>}
  </div>;
}
