import { describe, expect, it } from "vitest";
import {
  allTreeDragons, downstreamOf, requirementsOf, sharedIngredients, treeDragons, upstreamOf, usedBy,
} from "../src/lib/breeding";
import { formatAmount } from "../src/lib/format";
import { howToObtainText, ingredientText, labelOf, parseIngredient } from "../src/lib/ingredients";
import {
  cheapestTarget, mostExpensiveTarget, parentPurchaseCost, remainingTargetPrice, totalTargetPrice,
} from "../src/lib/pricing";
import { cardMatches, cardSearchText, emptyMessage, isReadyToBreed, sortTargets } from "../src/lib/targetList";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../src/data/targets";

describe("ingredients", () => {
  it("parses every notation", () => {
    expect(parseIngredient("Zero")).toEqual({ kind: "dragon", name: "Zero" });
    expect(parseIngredient("el:fire")).toEqual({ kind: "element", element: "fire" });
    expect(parseIngredient("epic:Ornamental")).toEqual({ kind: "epic", element: "Ornamental" });
    expect(parseIngredient("special:4")).toEqual({ kind: "special", elementCount: 4 });
    expect(() => parseIngredient("bogus:x")).toThrow();
  });

  it("describes recipes", () => {
    expect(ingredientText("el:dark")).toBe("dark");
    expect(ingredientText("epic:Hidden")).toBe("any Hidden epic");
    expect(ingredientText("special:4")).toBe("any 4 different elements");
    expect(ingredientText("Drak-E")).toBe("Drak-E");
    expect(howToObtainText("Fubuki")).toBe("Sakura + Elkar");
    expect(howToObtainText("Drak-E")).toBe("Earthcore + metal + cold");
    expect(howToObtainText("Thaw")).toBe("Evolve from Cubicle");
    expect(howToObtainText("Dazzling")).toBe("any Ornamental epic + any Ornamental epic");
    expect(howToObtainText("Kraka & Krummi")).toBe(""); // buy / clone only
    expect(labelOf("Pyros & Glacius")).toBe("Pyros & Glacius");
  });
});

describe("breeding relationships", () => {
  it("requirements include evolution sources", () => {
    expect(requirementsOf("Muspel")).toEqual(["Volcano"]);
    expect(requirementsOf("Kraka & Krummi")).toEqual([]);
    expect(requirementsOf("Unknown")).toEqual([]);
  });

  it("collects every specific dragon in a tree", () => {
    expect([...treeDragons("Magni")].sort()).toEqual(
      ["Apocalypse", "Fulgurite", "Permafrost", "Snowpocalypse", "Winter", "Zero"],
    );
  });

  it("walks upstream and downstream", () => {
    expect(upstreamOf("Muspel")).toEqual(new Set(["Muspel", "Volcano", "Ragnarok", "Lava"]));
    expect(usedBy("Zero")).toEqual(["Magni", "Cubicle"]);
    expect(downstreamOf("Zero")).toEqual(new Set(["Zero", "Magni", "Cubicle", "Thaw"]));
  });

  it("graph nodes cover the given list's trees, targets first", () => {
    const all = allTreeDragons(EVENT_DRAGONS);
    expect(all).toHaveLength(135);
    expect(all[0]).toBe(EVENT_DRAGONS[0]);
    expect(allTreeDragons(DEFAULT_FAVORITES)).toHaveLength(41);
    expect(allTreeDragons(["Yeti"])).toEqual(["Yeti", "Kringle", "Trinket", "Krampus", "Coal"]);
    expect(allTreeDragons([])).toEqual([]);
  });

  it("ranks shared ingredients by usage then name", () => {
    expect(sharedIngredients(DEFAULT_FAVORITES)[0]).toEqual({ name: "Apocalypse", usedInTargets: ["Magni", "Thaw"] });
    expect(sharedIngredients(["Yeti"])).toEqual([]);
    const shared = sharedIngredients(EVENT_DRAGONS);
    expect(shared[0]).toEqual({
      name: "Coal",
      usedInTargets: [
        "Jawny", "Flamegobbler", "Burglehoo", "Gulletail", "Avarice", "Lokilure", "Jadice", "Yeti",
        "Angler", "Toboggan", "Dancey", "Lace", "Krampus", "Glitz", "Greenge", "Kotun",
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
    expect(totalTargetPrice(EVENT_DRAGONS)).toBe(834022);
    expect(remainingTargetPrice(EVENT_DRAGONS, new Set(["Magni"]))).toBe(816022);
    expect(mostExpensiveTarget(EVENT_DRAGONS)).toBe("Kraka & Krummi");
    expect(cheapestTarget(EVENT_DRAGONS)).toBe("Reindeer");
    expect(totalTargetPrice(DEFAULT_FAVORITES)).toBe(193822);
    expect(remainingTargetPrice(DEFAULT_FAVORITES, new Set(["Magni", "Reindeer"]))).toBe(175822);
    expect(cheapestTarget(DEFAULT_FAVORITES)).toBe("Iceere");
    expect(totalTargetPrice([])).toBe(0);
    expect(mostExpensiveTarget([])).toBeNull();
    expect(cheapestTarget([])).toBeNull();
    expect(formatAmount(193822)).toBe("193,822");
  });

  it("parent purchase subtotal only when every specific parent is buyable", () => {
    expect(parentPurchaseCost("Yeti")).toBe(4300 + 4300); // Kringle + Krampus
    expect(parentPurchaseCost("Jawny")).toBe(7900); // Yeti; the element requirements cost nothing
    expect(parentPurchaseCost("Magni")).toBeNull(); // Fulgurite not in market
    expect(parentPurchaseCost("Om")).toBeNull(); // elements only
    expect(parentPurchaseCost("Thaw")).toBeNull(); // evolution
  });
});

describe("card list", () => {
  it("sorts", () => {
    expect(sortTargets(EVENT_DRAGONS, "list")).toEqual([...EVENT_DRAGONS]);
    expect(sortTargets(EVENT_DRAGONS, "desc")[0]).toBe("Kraka & Krummi");
    expect(sortTargets(EVENT_DRAGONS, "asc")[0]).toBe("Reindeer");
    expect(sortTargets(EVENT_DRAGONS, "az").slice(0, 2)).toEqual(["Aisa", "Angler"]);
    expect(sortTargets(DEFAULT_FAVORITES, "az").slice(0, 2)).toEqual(["Drak-E", "Fubuki"]);
    expect(sortTargets(["Yeti", "Reindeer"], "list")).toEqual(["Yeti", "Reindeer"]);
  });

  const none = () => false;
  const owns = (...names: string[]) => (n: string) => names.includes(n);

  it("searches whole trees and raw recipe items", () => {
    expect(cardSearchText("Magni")).toContain("fulgurite");
    expect(EVENT_DRAGONS.filter((t) => cardMatches(t, "zero", "all", none))).toEqual(["Magni", "Thaw", "Cubicle", "Zero"]);
    expect(cardMatches("Om", "water", "all", none)).toBe(true);
  });

  it("filters by obtained / still needed / ready to breed", () => {
    expect(cardMatches("Magni", "", "have", owns("Magni"))).toBe(true);
    expect(cardMatches("Magni", "", "need", owns("Magni"))).toBe(false);
    expect(cardMatches("Magni", "", "ready", owns("Zero"))).toBe(false); // Fulgurite still missing
    expect(cardMatches("Magni", "", "ready", owns("Zero", "Fulgurite"))).toBe(true);
    expect(emptyMessage("", "need")).toMatch(/obtained every dragon/);
    expect(emptyMessage("", "ready")).toMatch(/Nothing is ready yet/);
    expect(emptyMessage("x", "need")).toBe("No dragons match your search.");
    expect(emptyMessage("", "all", true)).toMatch(/Your list is empty/);
  });

  it("ready to breed: every specific parent (or evolution source) obtained", () => {
    expect(isReadyToBreed("Jawny", owns("Yeti"))).toBe(true); // elements don't count
    expect(isReadyToBreed("Jawny", owns("Yeti", "Jawny"))).toBe(false); // already obtained
    expect(isReadyToBreed("Muspel", owns("Volcano"))).toBe(true); // evolution source
    expect(isReadyToBreed("Om", none)).toBe(true); // elements only
    expect(isReadyToBreed("Kraka & Krummi", none)).toBe(false); // buy / clone only
    expect(isReadyToBreed("Dancey", owns("Glitz"))).toBe(false);
  });
});
