import { DRAGONS } from "../data/dragons";
import { TARGETS } from "../data/targets";
import type { RecipeItem } from "../data/types";
import { isDragonItem } from "./ingredients";

/** Direct requirements of a dragon: its evolution source, or its recipe items. */
export function requirementsOf(name: string): readonly RecipeItem[] {
  const d = DRAGONS[name];
  if (!d) return [];
  if (d.evolvesFrom) return [d.evolvesFrom];
  return d.recipe ?? [];
}

/** Direct requirements that are specific dragons (element requirements excluded). */
export const dragonRequirementsOf = (name: string): string[] => requirementsOf(name).filter(isDragonItem);

/** Every specific dragon anywhere in `name`'s breeding tree, excluding `name` itself. */
export function treeDragons(name: string, into = new Set<string>()): Set<string> {
  for (const k of dragonRequirementsOf(name)) {
    into.add(k);
    treeDragons(k, into);
  }
  return into;
}

/** `name` plus everything needed (transitively) to breed it. */
export function upstreamOf(name: string, into = new Set<string>()): Set<string> {
  into.add(name);
  for (const k of dragonRequirementsOf(name)) if (!into.has(k)) upstreamOf(k, into);
  return into;
}

let usedByIndex: Record<string, string[]> | null = null;
/** Dragons that list `name` directly as a requirement. */
export function usedBy(name: string): readonly string[] {
  if (!usedByIndex) {
    const index: Record<string, string[]> = {};
    for (const m of Object.keys(DRAGONS)) for (const c of dragonRequirementsOf(m)) (index[c] ??= []).push(m);
    usedByIndex = index;
  }
  return usedByIndex[name] ?? [];
}

/** `name` plus everything that (transitively) uses it. */
export function downstreamOf(name: string, into = new Set<string>()): Set<string> {
  into.add(name);
  for (const m of usedBy(name)) if (!into.has(m)) downstreamOf(m, into);
  return into;
}

/** Every dragon reachable from the targets, targets first in list order (graph node set). */
export function allTreeDragons(): string[] {
  const seen = new Set<string>();
  const walk = (n: string) => {
    if (seen.has(n)) return;
    seen.add(n);
    dragonRequirementsOf(n).forEach(walk);
  };
  TARGETS.forEach(walk);
  return [...seen];
}

export interface SharedIngredient { name: string; usedInTargets: string[] }

/** Dragons appearing in 2+ target trees, most-shared first, then A→Z. */
export function sharedIngredients(): SharedIngredient[] {
  const usage: Record<string, string[]> = {};
  for (const t of TARGETS) for (const n of treeDragons(t)) (usage[n] ??= []).push(t);
  return Object.entries(usage)
    .filter(([, v]) => v.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([name, usedInTargets]) => ({ name, usedInTargets }));
}

export const isTarget = (name: string): boolean => TARGETS.includes(name);
