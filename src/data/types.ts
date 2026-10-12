/** The ten basic DragonVale elements that appear in recipes (flags exist for each). */
export const ELEMENTS = [
  "plant", "fire", "earth", "cold", "lightning",
  "water", "air", "metal", "light", "dark",
] as const;
export type ElementName = (typeof ELEMENTS)[number];

/**
 * One entry of a breeding recipe, written in a compact string notation:
 *  - `"Scourge"`         a specific dragon (must be a key of `DRAGONS`)
 *  - `"el:fire"`         any dragon with that element
 *  - `"epic:Treasure"`   any dragon with that epic element
 *  - `"special:4"`       two parents with at least N different elements between them
 *
 * Use `parseIngredient()` (src/lib/ingredients.ts) instead of string matching.
 */
export type RecipeItem = string;

export interface Dragon {
  /** Price in Candy in the event market. Omitted = not sold in the market. */
  price?: number;
  /** Breeding recipe (parents / element requirements). */
  recipe?: readonly RecipeItem[];
  /** Name of the dragon this one evolves from (mutually exclusive with `recipe`). */
  evolvesFrom?: string;
  /** What the evolution needs, shown as "needs …". */
  evolveRequirement?: string;
  /** Sprite file name on the CDN when it differs from the dragon name. */
  sprite?: string;
  /** Display name when it differs from the key. */
  label?: string;
  /** Free-form note shown as a tag / tooltip. */
  note?: string;
  /** Must be bred at night. */
  breedAtNight?: boolean;
  /** Rift-only, limited. */
  riftOnly?: boolean;
  /** Co-op single-clone chance, e.g. "10%", when cloning beats breeding. */
  cloneChance?: string;
}

export type DragonCatalog = Readonly<Record<string, Dragon>>;
