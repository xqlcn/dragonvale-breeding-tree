import type { DragonCatalog } from "./types";

/**
 * Every dragon that appears in any target's breeding tree.
 * Source: DV Community Forum Candy Bash XIII thread (Oct 8, 2026).
 * Recipe notation is documented on `RecipeItem` in ./types.ts.
 */
export const DRAGONS: DragonCatalog = {
  // --- targets ---
  Reaper: { price: 15000, recipe: ["Macabre", "Scourge"] },
  Awoo: { price: 13500, recipe: ["Midnight", "Lycan"] },
  Yaga: { price: 15500, recipe: ["Etch", "Spirit"], cloneChance: "10%" },
  Bruntal: { price: 16000, recipe: ["Wrath", "el:dark"], cloneChance: "10%" },
  Dracomancy: {
    price: 1000, recipe: ["Bone", "Scourge"], sprite: "Dracomancy_1", label: "Dracomancy (1)",
    note: "Evolves through stages 2–4 as the Ominous Digsite is upgraded",
  },
  Kwall: { price: 5600, recipe: ["el:plant", "el:water", "el:light"] },
  Infernus: { price: 7680, recipe: ["el:fire", "el:cold", "el:water"], cloneChance: "10%" },
  Vampir: { price: 8320, recipe: ["Nosferatu", "Zombie"], cloneChance: "10%" },
  Fury: { price: 8560, recipe: ["Misfortune", "Snowpocalypse"] },
  Nightmare: { price: 2200, recipe: ["Howl", "Abyss"] },
  Spirit: { price: 6080, recipe: ["Ghost", "Spectre"] },
  Wendigo: { price: 7000, recipe: ["Macabre", "Bone"] },
  Nox: { price: 8760, recipe: ["Antumbra", "Voltaic"], riftOnly: true },
  Corrupticorn: { price: 9550, evolvesFrom: "Chromacorn", evolveRequirement: "all 10 different Flames of Corruption in your park" },
  Umbra: { price: 9550, evolvesFrom: "Scout", evolveRequirement: "all 10 different Tents in your park" },
  Punk: { price: 10000, recipe: ["Decay", "Lycan"] },
  Kage: { price: 13680, recipe: ["Eldritch", "Wrath"] },
  Hydnellum: { price: 14640, recipe: ["Wendigo", "epic:Apocalypse"] },
  Fortified: { price: 17500, recipe: ["Nosferatu", "Gatren"], cloneChance: "10%" },
  Exterrean: { price: 18500, recipe: ["Amalgamate", "Scourge"], cloneChance: "5%" },
  Charlatan: { price: 8100, recipe: ["Apocalypse", "Spirit"], note: "Also buildable from 6 summon parts (500 Candy each)" },
  Barbarous: { price: 9600, recipe: ["Oni", "Ragnarok"], note: "Also buildable from 6 summon parts (500 Candy each)" },
  Macabre: { price: 10400, recipe: ["Spectre", "Zombie"], note: "Also buildable from 6 summon parts (500 Candy each)" },

  // --- intermediates in the market ---
  Scourge: { price: 8900, recipe: ["Decay", "Misfortune"], note: "Also buildable from 6 summon parts" },
  Spectre: { price: 2150, recipe: ["el:cold", "el:earth"] },
  Zombie: { price: 6080, recipe: ["Meteor", "Pollen"] },
  Decay: { price: 6080, recipe: ["el:fire", "el:earth", "el:cold"] },
  Misfortune: {
    price: 2999, recipe: ["epic:Treasure", "epic:Apocalypse"], breedAtNight: true,
    note: "Breeding odds raised to 2.5% this event",
  },
  Midnight: { price: 3750, recipe: ["Moon", "el:dark"], breedAtNight: true },
  Lycan: { price: 6080, recipe: ["el:plant", "el:cold", "el:lightning"] },
  Etch: { price: 6720, recipe: ["el:dark", "el:plant"] },
  Ghost: { price: 1140, recipe: ["el:earth", "el:cold"], note: "3% second odds if you already own one" },
  Bone: { price: 760, recipe: ["el:earth", "el:fire"], note: "3% second odds if you already own one" },
  Wrath: { price: 7950, evolvesFrom: "Love", evolveRequirement: "all 10 different Tendrils of Wrath in your park" },
  Love: { price: 1140, recipe: ["Flower", "el:lightning"] },
  Nosferatu: { price: 2275, recipe: ["el:earth", "el:cold", "el:fire"], breedAtNight: true },
  Eldritch: { price: 11500, recipe: ["el:fire", "el:plant", "el:earth", "el:cold"] },
  Oni: { price: 2000, recipe: ["el:fire", "el:earth", "el:cold"] },
  Gatren: { price: 4800, recipe: ["Eldritch", "Oni"] },
  Amalgamate: { price: 12960, recipe: ["Bone", "el:earth", "el:fire", "el:dark"], cloneChance: "10%" },
  Scout: { price: 6480, recipe: ["Valor", "epic:Hidden"] },
  Valor: { price: 2200, recipe: ["el:plant", "el:metal", "el:air"] },
  Chromacorn: { price: 6100, recipe: ["Rainbow", "Double Rainbow"], riftOnly: true },

  // --- not in the market ---
  Apocalypse: { recipe: ["el:plant", "el:cold", "el:metal", "el:lightning"] },
  Snowpocalypse: { recipe: ["Winter", "Apocalypse"], note: "Breedable this event, not sold in the market" },
  Winter: { recipe: ["el:cold", "el:earth", "el:air"], note: "Breedable this event (needed for Snowpocalypse)" },
  Meteor: { recipe: ["el:air", "el:metal"] },
  Pollen: { recipe: ["el:plant", "el:air"] },
  Moon: { recipe: ["el:cold", "el:lightning"], breedAtNight: true },
  Flower: { recipe: ["el:fire", "el:plant"] },
  Howl: { recipe: ["el:dark", "el:air"] },
  Abyss: { recipe: ["el:water", "el:dark"] },
  Antumbra: { recipe: ["el:light", "el:dark"], note: "Rift dragon: breed in the Rift with it aligned to Earth" },
  Voltaic: { recipe: ["el:dark", "el:lightning"], note: "Rift dragon: breed in the Rift" },
  Rainbow: { recipe: ["special:4"] },
  "Double Rainbow": { recipe: ["special:4"] },
  Ragnarok: { recipe: ["el:fire", "el:earth", "el:cold", "el:dark"] },
};
