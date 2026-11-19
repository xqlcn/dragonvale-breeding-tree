import { ADULT_SPRITE_BASE, DRAGON_SPRITE_BASE, ELEMENT_FLAG_BASE } from "../config";
import { ADULT_SPRITE_PATHS } from "../data/adultSprites";
import { DRAGONS } from "../data/dragons";
// Small SVG: Vite inlines it as a data URI, so the fallback never needs the network.
import eggPlaceholderUrl from "../assets/egg.svg";

/** Placeholder egg shown when a sprite or flag fails to load. */
export const EGG_PLACEHOLDER_URL: string = eggPlaceholderUrl;

const spriteName = (name: string): string => DRAGONS[name]?.sprite ?? name.replace(/ /g, "_");

export const dragonSpriteUrl = (name: string): string => `${DRAGON_SPRITE_BASE}/${spriteName(name)}.webp`;

export const elementFlagUrl = (element: string): string => `${ELEMENT_FLAG_BASE}/${element.toLowerCase()}.png`;

/** CSS class for a dragon's rarity frame ("r-rare" / "r-epic"), or "" for hybrids and unknown dragons. */
export function rarityFrameClass(name: string): string {
  const r = DRAGONS[name]?.rarity;
  return r === "rare" || r === "epic" ? `r-${r}` : "";
}

/** Adult-dragon art URL (scaled down for the page), or null when the wiki has no adult art for it yet. */
export function adultSpriteUrl(name: string): string | null {
  const path = ADULT_SPRITE_PATHS[name];
  return path ? `${ADULT_SPRITE_BASE}/${path}/revision/latest/scale-to-width-down/176` : null;
}
