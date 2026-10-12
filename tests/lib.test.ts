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
import { TARGETS } from "../src/data/targets";

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
    expect(usedBy("Scourge")).toEqual(["Reaper", "Dracomancy", "Exterrean"]);
    expect(downstreamOf("Decay")).toEqual(new Set(["Decay", "Punk", "Scourge", "Reaper", "Dracomancy", "Exterrean"]));
  });

  it("graph covers 57 dragons, targets first", () => {
    const nodes = allTreeDragons();
    expect(nodes).toHaveLength(57);
    expect(nodes[0]).toBe(TARGETS[0]);
  });

  it("ranks shared ingredients by usage then name", () => {
    const shared = sharedIngredients();
    expect(shared[0]).toEqual({
      name: "Spectre",
      usedInTargets: ["Reaper", "Yaga", "Spirit", "Wendigo", "Hydnellum", "Charlatan", "Macabre"],
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
    expect(totalTargetPrice()).toBe(236720);
    expect(remainingTargetPrice(new Set(["Reaper"]))).toBe(221720);
    expect(mostExpensiveTarget()).toBe("Exterrean");
    expect(cheapestTarget()).toBe("Dracomancy");
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
    expect(sortTargets("list")).toEqual([...TARGETS]);
    expect(sortTargets("desc")[0]).toBe("Exterrean");
    expect(sortTargets("asc")[0]).toBe("Dracomancy");
    expect(sortTargets("az").slice(0, 2)).toEqual(["Awoo", "Barbarous"]);
  });

  it("searches whole trees and raw recipe items", () => {
    expect(cardSearchText("Reaper")).toContain("scourge");
    expect(TARGETS.filter((t) => cardMatches(t, "scourge", "all", false))).toEqual(["Reaper", "Dracomancy", "Exterrean"]);
    expect(cardMatches("Infernus", "fire", "all", false)).toBe(true);
  });

  it("filters by obtained state", () => {
    expect(cardMatches("Reaper", "", "have", true)).toBe(true);
    expect(cardMatches("Reaper", "", "need", true)).toBe(false);
    expect(emptyMessage("", "need")).toMatch(/obtained every dragon/);
    expect(emptyMessage("x", "need")).toBe("No dragons match your search.");
  });
});
