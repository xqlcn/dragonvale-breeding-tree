/**
 * Every dragon sold in the event market: the "All event dragons" list, in its list order.
 * Each must be priced in `DRAGONS`. The original 23-dragon list comes first, then the rest in market order.
 */
export const EVENT_DRAGONS: readonly string[] = [
  "Reaper", "Awoo", "Yaga", "Bruntal", "Dracomancy", "Kwall", "Infernus", "Vampir",
  "Fury", "Nightmare", "Spirit", "Wendigo", "Nox", "Corrupticorn", "Umbra", "Punk",
  "Kage", "Hydnellum", "Fortified", "Exterrean", "Charlatan", "Barbarous", "Macabre",
  // Limited
  "Torment", "Eggony", "Hollowjaw",
  // Otherworldly
  "Mirhor", "Tartarus", "Sinking", "Brainiac", "Righteous", "Pit", "Dumi", "Dragpir", "Spooker",
  "Drack-o-Lantern", "Candycorn", "Bone", "Thicket", "Love", "Ghost", "Dracabra", "Oni", "Spectre",
  "Nether", "Nosferatu", "Bog", "Misfortune", "Ambrosia", "Delight", "Midnight", "Gatren", "Malefice",
  "Maw", "Scout", "Etch", "Narcis", "Funis", "Combustion", "Grimoire", "Dortal", "Magma", "Shackle",
  "Omen", "Eww",
  // Ominous
  "Valor", "Gourd", "Cerberus", "Decay", "Lycan", "Nesting", "Zombie", "Chromacorn", "Porcelain",
  "Plumpkin", "Ocular", "Wrath", "Iden", "Hyperion", "Heavy Metal", "Techno", "Brood", "Rotblossom",
  "Amalgamate", "Greymatter", "Machina", "Tickles",
  // Summons
  "Eldritch", "Scourge",
  // Haunted
  "Ghostly Plant", "Ghostly Fire", "Ghostly Earth", "Ghostly Cold", "Ghostly Lava", "Ghostly Obsidian",
  "Ghostly Mountain", "Ghostly Glacier", "Ghostly Nosferatu", "Ghostly Bone", "Ghostly Decay",
  "Ghostly Oni", "Ghostly Spectre", "Ghostly Spirit", "Ghostly Ghost",
  // Tricks & Treats
  "Trick", "Ortreat",
];

/** "My list" for someone who hasn't customized it yet: the original 23 targets, in their original order. */
export const DEFAULT_FAVORITES: readonly string[] = EVENT_DRAGONS.slice(0, 23);
