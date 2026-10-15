import { requirementsOf, treeDragons } from "./breeding";
import { priceOf } from "./pricing";

export type SortMode = "list" | "desc" | "asc" | "az";
export type OwnedFilter = "all" | "need" | "have";

/** Targets in the requested order ("list" keeps the order they're given in). */
export function sortTargets(targets: readonly string[], mode: SortMode): string[] {
  const list = targets.slice();
  if (mode === "desc") list.sort((a, b) => priceOf(b) - priceOf(a));
  if (mode === "asc") list.sort((a, b) => priceOf(a) - priceOf(b));
  if (mode === "az") list.sort((a, b) => a.localeCompare(b));
  return list;
}

/** Lower-cased text a card is searchable by: its name, every dragon in its tree, and its direct recipe items. */
export function cardSearchText(name: string): string {
  return [name, ...treeDragons(name)].join(" ").toLowerCase() + " " + requirementsOf(name).join(" ").toLowerCase();
}

/** Whether a target card passes the search box + obtained filter. `query` must already be trimmed/lower-cased. */
export function cardMatches(name: string, query: string, filter: OwnedFilter, owned: boolean): boolean {
  return (!query || cardSearchText(name).includes(query)) && (filter === "all" || (filter === "have") === owned);
}

/** Message shown when no card matches. */
export function emptyMessage(query: string, filter: OwnedFilter, listIsEmpty = false): string {
  if (listIsEmpty) return "Your list is empty. Switch to “All event dragons” and press ☆ on a card to add dragons to it.";
  if (filter === "have" && !query) return "You haven't marked any of your targets as obtained yet.";
  if (filter === "need" && !query) return "🎉 You've obtained every dragon on your list!";
  return "No dragons match your search.";
}
