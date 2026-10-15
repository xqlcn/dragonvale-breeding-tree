/** App-wide constants: external asset hosts and persistence keys. */

/** Dragon sprites, e.g. `${DRAGON_SPRITE_BASE}/Reaper.webp`. */
export const DRAGON_SPRITE_BASE = "https://dvboxcdn.com/dragons";
/** Element flags, e.g. `${ELEMENT_FLAG_BASE}/dark.png`. */
export const ELEMENT_FLAG_BASE = "https://dvboxcdn.com/flags";
/** Candy (event currency) icon. */
export const CANDY_ICON_URL =
  "https://static.wikia.nocookie.net/dragonvale/images/1/1d/Candy_template.png/revision/latest/scale-to-width-down/17?cb=20141009210348";

/** localStorage key for the "obtained" set. Kept identical to the original single-file version. */
export const OBTAINED_STORAGE_KEY = "cbxiii-obtained";
/** localStorage key for "My list" (ordered array of dragon names). */
export const FAVORITES_STORAGE_KEY = "cbxiii-favorites";
/** localStorage key for which list is shown: "favorites" or "all". */
export const LIST_SCOPE_STORAGE_KEY = "cbxiii-list-scope";
