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

/** DragonVale rarity tier. Rare and epic dragons get a coloured frame around their sprite. */
export type Rarity = "hybrid" | "rare" | "epic";

export interface Dragon {
  /** Rarity tier (from DV Box). Every catalog dragon has one; tests/data.test.ts checks it. */
  rarity?: Rarity;
  /** Breeding time in a regular breeding cave, in seconds (from DV Box). The upgraded cave takes 80% of it. */
  breedingTime?: number;
  /** Price in the event currency in the event market. Omitted = not sold in the market. */
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
