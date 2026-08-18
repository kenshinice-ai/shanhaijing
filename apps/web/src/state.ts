import { EntityTypeSchema, LocaleSchema, type EntityType, type Locale } from "./types";

/**
 * Deep-linkable explore state.
 *
 * One atlas, four views: there is no work selection, no comparison mode, no
 * map layer set, no timeline range and no zoom tier to carry, so the state is
 * the four things a reader can actually change.
 */
export const WORK_SLUG = "shanhaijing";
export const TABS = ["overview", "creatures", "passages", "textualPlaces"] as const;
export type Tab = (typeof TABS)[number];
export type SelectionSource = "map" | "list" | "search" | "url";

export interface SelectedEntity { type: EntityType; id: string; workSlug: string }

export interface ExploreState {
  locale: Locale;
  tab: Tab;
  selectedEntity: SelectedEntity | null;
  selectionSource: SelectionSource;
  query: string;
}

const tabValues = new Set<Tab>(TABS);

function parseEntity(value: string | null): SelectedEntity | null {
  if (!value) return null;
  const [rawType, workSlug, ...idParts] = value.split(":");
  const type = EntityTypeSchema.safeParse(rawType);
  const id = idParts.join(":");
  if (!type.success || !workSlug || !id) return null;
  // Links from the multi-work era carried other works' slugs; normalise rather
  // than reject so an old URL still opens the right entity.
  return { type: type.data, workSlug: WORK_SLUG, id };
}

export function parseAtlasState(search: string): ExploreState {
  const q = new URLSearchParams(search);
  const tabValue = q.get("tab");
  const localeValue = LocaleSchema.safeParse(q.get("lang") ?? q.get("locale") ?? "zh-CN");
  const entity = parseEntity(q.get("entity"));
  return {
    locale: localeValue.success ? localeValue.data : "zh-CN",
    tab: tabValue && tabValues.has(tabValue as Tab) ? (tabValue as Tab) : "overview",
    selectedEntity: entity,
    selectionSource: entity ? "url" : "list",
    query: q.get("q") ?? "",
  };
}

export function serializeAtlasState(state: ExploreState): string {
  const q = new URLSearchParams();
  if (state.locale !== "zh-CN") q.set("lang", state.locale);
  if (state.tab !== "overview") q.set("tab", state.tab);
  if (state.selectedEntity) q.set("entity", `${state.selectedEntity.type}:${state.selectedEntity.workSlug}:${state.selectedEntity.id}`);
  if (state.query) q.set("q", state.query);
  const search = q.toString();
  return search ? `?${search}` : location.pathname;
}
