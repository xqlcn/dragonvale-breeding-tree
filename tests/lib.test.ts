import { describe, expect, it } from "vitest";
import {
  allTreeDragons, downstreamOf, requirementsOf, sharedIngredients, treeDragons, upstreamOf, usedBy,
} from "../src/lib/breeding";
import { formatCandy } from "../src/lib/format";
import { howToObtainText, ingredientText, labelOf, parseIngredient } from "../src/lib/ingredients";
import {
  cheapestTarget, mostExpensiveTarget, parentPurchaseCost, remainingTargetPrice, totalTargetPrice,
} from "../src/lib/pricing";
import { cardMatches, cardSearchText, emptyMessage, sortTargets } from "../src/lib/targetList";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../src/data/targets";

describe("ingredients", () => {
  it("parses every notation", () => {
    expect(parseIngredient("Scourge")).toEqual({ kind: "dragon", name: "Scourge" });
    expect(parseIngredient("el:fire")).toEqual({ kind: "element", element: "fire" });
    expect(parseIngredient("epic:Treasure")).toEqual({ kind: "epic", element: "Treasure" });
    expect(parseIngredient("special:4")).toEqual({ kind: "special", elementCount: 4 });
    expect(() => parseIngredient("bogus:x")).toThrow();
  });

  it("describes recipes like the original", () => {
    expect(ingredientText("el:dark")).toBe("dark");
    expect(ingredientText("epic:Apocalypse")).toBe("any Apocalypse epic");
    expect(ingredientText("Dracomancy")).toBe("DRACOMANCY (1)");
    expect(howToObtainText("Reaper")).toBe("MACABRE + SCOURGE");
    expect(howToObtainText("Wrath")).toBe("Evolve from Love");
    expect(howToObtainText("Rainbow")).toBe("any 4 different elements");
    expect(labelOf("Dracomancy")).toBe("Dracomancy (1)");
  });
});

describe("breeding relationships", () => {
  it("requirements include evolution sources", () => {
    expect(requirementsOf("Umbra")).toEqual(["Scout"]);
    expect(requirementsOf("Unknown")).toEqual([]);
  });

  it("collects every specific dragon in a tree", () => {
    expect([...treeDragons("Reaper")].sort()).toEqual(
      ["Decay", "Macabre", "Meteor", "Misfortune", "Pollen", "Scourge", "Spectre", "Zombie"],
    );
  });

  it("walks upstream and downstream", () => {
    expect(upstreamOf("Gatren")).toEqual(new Set(["Gatren", "Eldritch", "Oni"]));
    expect(usedBy("Scourge")).toEqual(["Reaper", "Dracomancy", "Exterrean", "Malefice"]);
    expect(downstreamOf("Decay")).toEqual(new Set([
      "Decay", "Punk", "Scourge", "Reaper", "Dracomancy", "Exterrean", "Malefice", "Pit", "Dracabra", "Brood", "Greymatter", "Rotblossom",
    ]));
  });

  it("graph nodes cover the given list's trees, targets first", () => {
    const all = allTreeDragons(EVENT_DRAGONS);
    expect(all).toHaveLength(145);
    expect(all[0]).toBe(EVENT_DRAGONS[0]);
    expect(allTreeDragons(DEFAULT_FAVORITES)).toHaveLength(57);
    expect(allTreeDragons(["Gatren"])).toEqual(["Gatren", "Eldritch", "Oni"]);
    expect(allTreeDragons([])).toEqual([]);
  });

  it("ranks shared ingredients by usage then name", () => {
    expect(sharedIngredients(DEFAULT_FAVORITES)[0]).toEqual({
      name: "Spectre",
      usedInTargets: ["Reaper", "Yaga", "Spirit", "Wendigo", "Hydnellum", "Charlatan", "Macabre"],
    });
    expect(sharedIngredients(["Gatren"])).toEqual([]);
    const shared = sharedIngredients(EVENT_DRAGONS);
    expect(shared[0]).toEqual({
      name: "Spectre",
      usedInTargets: [
        "Reaper", "Yaga", "Spirit", "Wendigo", "Hydnellum", "Charlatan", "Macabre",
        "Sinking", "Dragpir", "Malefice", "Dortal", "Eww", "Iden", "Tickles",
      ],
    });
    for (const s of shared) expect(s.usedInTargets.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < shared.length; i++) {
      const [a, b] = [shared[i - 1]!, shared[i]!];
      expect(a.usedInTargets.length > b.usedInTargets.length || (a.usedInTargets.length === b.usedInTargets.length && a.name < b.name)).toBe(true);
    }
  });
});

describe("pricing", () => {
  it("totals and extremes", () => {
    expect(totalTargetPrice(EVENT_DRAGONS)).toBe(848209);
    expect(remainingTargetPrice(EVENT_DRAGONS, new Set(["Reaper"]))).toBe(833209);
    expect(mostExpensiveTarget(EVENT_DRAGONS)).toBe("Exterrean");
    expect(cheapestTarget(EVENT_DRAGONS)).toBe("Bone");
    expect(totalTargetPrice(DEFAULT_FAVORITES)).toBe(236720);
    expect(remainingTargetPrice(DEFAULT_FAVORITES, new Set(["Reaper", "Bone"]))).toBe(221720);
    expect(cheapestTarget(DEFAULT_FAVORITES)).toBe("Dracomancy");
    expect(totalTargetPrice([])).toBe(0);
    expect(mostExpensiveTarget([])).toBeNull();
    expect(cheapestTarget([])).toBeNull();
    expect(formatCandy(236720)).toBe("236,720");
  });

  it("parent purchase subtotal only when every specific parent is buyable", () => {
    expect(parentPurchaseCost("Reaper")).toBe(10400 + 8900);
    expect(parentPurchaseCost("Fury")).toBeNull(); // Snowpocalypse not in market
    expect(parentPurchaseCost("Kwall")).toBeNull(); // elements only
    expect(parentPurchaseCost("Umbra")).toBeNull(); // evolution
  });
});

describe("card list", () => {
  it("sorts", () => {
    expect(sortTargets(EVENT_DRAGONS, "list")).toEqual([...EVENT_DRAGONS]);
    expect(sortTargets(EVENT_DRAGONS, "desc")[0]).toBe("Exterrean");
    expect(sortTargets(EVENT_DRAGONS, "asc")[0]).toBe("Bone");
    expect(sortTargets(EVENT_DRAGONS, "az").slice(0, 2)).toEqual(["Amalgamate", "Ambrosia"]);
    expect(sortTargets(DEFAULT_FAVORITES, "az").slice(0, 2)).toEqual(["Awoo", "Barbarous"]);
    expect(sortTargets(["Spirit", "Bone"], "list")).toEqual(["Spirit", "Bone"]);
  });

  it("searches whole trees and raw recipe items", () => {
    expect(cardSearchText("Reaper")).toContain("scourge");
    expect(EVENT_DRAGONS.filter((t) => cardMatches(t, "scourge", "all", false))).toEqual(["Reaper", "Dracomancy", "Exterrean", "Malefice", "Scourge"]);
    expect(cardMatches("Infernus", "fire", "all", false)).toBe(true);
  });

  it("filters by obtained state", () => {
    expect(cardMatches("Reaper", "", "have", true)).toBe(true);
    expect(cardMatches("Reaper", "", "need", true)).toBe(false);
    expect(emptyMessage("", "need")).toMatch(/obtained every dragon/);
    expect(emptyMessage("x", "need")).toBe("No dragons match your search.");
    expect(emptyMessage("", "all", true)).toMatch(/Your list is empty/);
  });
});
