/** One section of the event market, as the game groups it. */
export interface MarketSection {
  name: string;
  dragons: readonly string[];
}

/**
 * Every dragon sold in the event market, by market section and in market order.
 * Each must be priced in `DRAGONS`. Pedestals and decorations are left out.
 */
export const EVENT_SECTIONS: readonly MarketSection[] = [
  { name: "Limited", dragons: ["Magni", "Muspel", "Kraka & Krummi"] },
  {
    name: "Branching",
    dragons: [
      "Fubuki", "Drak-E", "Onsen", "Jawny", "Kitse", "Iceere", "Om", "Thaw",
      "Reindeer", "Gift", "Coal", "Trinket", "Regift", "Mistletoe", "Holly",
      "Snowflake 1", "Snowflake 2", "Snowflake 3", "Snowflake 4", "Snowflake 5", "Snowflake 6", "Snowflake 7",
      "Sleighbell", "Candlecrown", "Snowpocalypse", "Jingle", "Eve", "Tusk", "Shiver", "Festive", "Chaiko",
      "Grandeur", "Icecarade", "Shaper", "Snopaw", "Gingerbread", "Eaves", "Tectonic", "Iceclaw",
      "Flamegobbler", "Pyros & Glacius", "Earthcore", "Volcano",
    ],
  },
  {
    name: "Wisdom",
    dragons: [
      "Ornamental", "Winter", "Nibwhip", "Burglehoo", "Libretto", "Gulletail", "Sugarplum", "Avarice",
      "Trepak", "Lokilure", "Saccharine", "Jadice", "Neoteric", "Lyuba", "Neyvee", "Longcicle", "Ketu",
      "Snowball", "Jamjam", "Yanghis", "Yeti", "Chorister", "Angler", "Weaver", "Liveloch", "Everfrost",
      "Igluit", "Sugarmitten", "Toboggan", "Snowdrop", "Cubicle", "Dancey",
    ],
  },
  {
    name: "Voyage",
    dragons: [
      "Icy Torrent", "Mountain Sun", "Hidden Bolt", "Blazing Gale", "Iron Blossom", "Flicker", "Ribbon",
      "Verglace", "Tinsel", "Flurry", "Thundersnow", "Lace", "Snowbrush", "Kringle", "Krampus", "Dazzling",
      "Harmony", "Yule", "Spellmason", "Venture", "Reminiscence", "Twinkle", "Glitz", "Zumi", "Zero", "Aisa",
      "Elkar", "Greenge", "Nature", "Kotun",
    ],
  },
  { name: "Runic", dragons: ["Icebound", "Woolen", "Starshine"] },
];

/** The "All event dragons" list: every market section, in order. */
export const EVENT_DRAGONS: readonly string[] = EVENT_SECTIONS.flatMap((s) => s.dragons);

/**
 * "My list" for someone who hasn't customized it yet: the three Limited dragons and the eight
 * headline Branching dragons (the first 11 in market order).
 */
export const DEFAULT_FAVORITES: readonly string[] = EVENT_DRAGONS.slice(0, 11);
