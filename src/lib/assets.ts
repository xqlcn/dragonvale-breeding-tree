import { DRAGON_SPRITE_BASE, ELEMENT_FLAG_BASE } from "../config";
import { DRAGONS } from "../data/dragons";
// Small SVG: Vite inlines it as a data URI, so the fallback never needs the network.
import eggPlaceholderUrl from "../assets/egg.svg";

/** Placeholder egg shown when a sprite or flag fails to load. */
export const EGG_PLACEHOLDER_URL: string = eggPlaceholderUrl;

const spriteName = (name: string): string => DRAGONS[name]?.sprite ?? name.replace(/ /g, "_");

export const dragonSpriteUrl = (name: string): string => `${DRAGON_SPRITE_BASE}/${spriteName(name)}.webp`;

export const elementFlagUrl = (element: string): string => `${ELEMENT_FLAG_BASE}/${element.toLowerCase()}.png`;
