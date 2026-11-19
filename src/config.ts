/** App-wide constants: the current event, external asset hosts and persistence keys. */

/** The event this planner covers. Shown in the header, footer and page title. */
export const EVENT_NAME = "Branches of Valedrasil";
/** Event currency, as shown in prose ("Prices are Iceberries…"). */
export const CURRENCY_NAME = "Iceberries";

/** Dragon sprites, e.g. `${DRAGON_SPRITE_BASE}/Kitse.webp`. */
export const DRAGON_SPRITE_BASE = "https://dvboxcdn.com/dragons";
/** Element flags, e.g. `${ELEMENT_FLAG_BASE}/dark.png`. */
export const ELEMENT_FLAG_BASE = "https://dvboxcdn.com/flags";
/** Event currency icon. */
export const CURRENCY_ICON_URL =
  "https://static.wikia.nocookie.net/dragonvale/images/e/e9/Iceberry_template.png/revision/latest/scale-to-width-down/17?cb=20141218203245";

/*
 * localStorage keys. Each event gets its own prefix so a new event starts with a fresh "obtained"
 * set and the new default "My list" instead of the previous event's.
 */
/** localStorage key for the "obtained" set. */
export const OBTAINED_STORAGE_KEY = "valedrasil-obtained";
/** localStorage key for "My list" (ordered array of dragon names). */
export const FAVORITES_STORAGE_KEY = "valedrasil-favorites";
/** localStorage key for which list is shown: "favorites" or "all". */
export const LIST_SCOPE_STORAGE_KEY = "valedrasil-list-scope";
/** localStorage key for the Trees & prices "show adult sprites" switch ("1" = adults). */
export const ADULT_SPRITES_STORAGE_KEY = "valedrasil-adult-sprites";
/** Adult-dragon art (Fandom wiki), e.g. `${ADULT_SPRITE_BASE}/8/89/JawnyDragonAdult.png/revision/latest/…`. */
export const ADULT_SPRITE_BASE = "https://static.wikia.nocookie.net/dragonvale/images";
