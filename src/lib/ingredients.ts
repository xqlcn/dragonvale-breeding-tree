import { DRAGONS } from "../data/dragons";
import type { RecipeItem } from "../data/types";

export type Ingredient =
  | { kind: "dragon"; name: string }
  | { kind: "element"; element: string }
  | { kind: "epic"; element: string }
  | { kind: "special"; elementCount: number };

/** Parses the compact recipe notation documented on `RecipeItem`. */
export function parseIngredient(item: RecipeItem): Ingredient {
  const colon = item.indexOf(":");
  if (colon === -1) return { kind: "dragon", name: item };
  const prefix = item.slice(0, colon);
  const value = item.slice(colon + 1);
  if (prefix === "el") return { kind: "element", element: value };
  if (prefix === "epic") return { kind: "epic", element: value };
  if (prefix === "special") return { kind: "special", elementCount: Number(value) };
  throw new Error(`Unknown recipe item "${item}"`);
}

/** True when the item names a specific dragon (as opposed to an element requirement). */
export const isDragonItem = (item: RecipeItem): boolean => !item.includes(":");

/** Display name: the dragon's `label` if it has one, otherwise its key. */
export const labelOf = (name: string): string => DRAGONS[name]?.label ?? name;

/** Short text for one recipe item, e.g. "fire", "any Treasure epic", "SCOURGE". */
export function ingredientText(item: RecipeItem): string {
  const ing = parseIngredient(item);
  switch (ing.kind) {
    case "element": return ing.element;
    case "epic": return `any ${ing.element} epic`;
    case "special": return `any ${ing.elementCount} different elements`;
    case "dragon": return labelOf(ing.name).toUpperCase();
  }
}

/** One-line description of how to obtain a dragon, e.g. "MACABRE + SCOURGE". */
export function howToObtainText(name: string): string {
  const d = DRAGONS[name];
  if (!d) return "";
  if (d.evolvesFrom) return `Evolve from ${d.evolvesFrom}`;
  if (d.recipe) return d.recipe.map(ingredientText).join(" + ");
  return "";
}
