import { dragonRequirementsOf, requirementsOf, treeDragons } from "./breeding";
import { labelOf } from "./ingredients";
import { priceOf } from "./pricing";

export type SortMode = "list" | "desc" | "asc" | "az";
/** "Show" filter: everything, still needed, ready to breed now, or already obtained. */
export type ShowFilter = "all" | "need" | "ready" | "have";

/** Targets in the requested order ("list" keeps the order they're given in). */
export function sortTargets(targets: readonly string[], mode: SortMode): string[] {
  const list = targets.slice();
  if (mode === "desc") list.sort((a, b) => priceOf(b) - priceOf(a));
  if (mode === "asc") list.sort((a, b) => priceOf(a) - priceOf(b));
  if (mode === "az") list.sort((a, b) => labelOf(a).localeCompare(labelOf(b)));
  return list;
}

/**
 * Not obtained yet, can be bred or evolved, and every specific parent (or the evolution source) is
 * obtained. Element / epic requirements ("any fire dragon") count as met, so element-only recipes
 * are always ready. Buy / clone-only dragons never are.
 */
export function isReadyToBreed(name: string, isOwned: (n: string) => boolean): boolean {
  if (isOwned(name) || requirementsOf(name).length === 0) return false;
  return dragonRequirementsOf(name).every(isOwned);
}

/** Lower-cased text a card is searchable by: its name, every dragon in its tree, and its direct recipe items. */
export function cardSearchText(name: string): string {
  return [name, ...treeDragons(name)].join(" ").toLowerCase() + " " + requirementsOf(name).join(" ").toLowerCase();
}

/** Whether a target passes the search box + Show filter. `query` must already be trimmed/lower-cased. */
export function cardMatches(name: string, query: string, filter: ShowFilter, isOwned: (n: string) => boolean): boolean {
  if (query && !cardSearchText(name).includes(query)) return false;
  if (filter === "have") return isOwned(name);
  if (filter === "need") return !isOwned(name);
  if (filter === "ready") return isReadyToBreed(name, isOwned);
  return true;
}

/** Message shown when no dragon matches. */
export function emptyMessage(query: string, filter: ShowFilter, listIsEmpty = false): string {
  if (listIsEmpty) return "Your list is empty. Use Edit list to add dragons.";
  if (query) return "No dragons match your search.";
  if (filter === "have") return "Nothing marked as obtained yet.";
  if (filter === "need") return "You've obtained every dragon on your list.";
  if (filter === "ready") return "Nothing is ready yet. Mark parents as obtained and dragons you can breed show up here.";
  return "No dragons match your search.";
}
