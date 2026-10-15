import { describe, expect, it } from "vitest";
import { DRAGONS } from "../src/data/dragons";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../src/data/targets";
import { ELEMENTS } from "../src/data/types";
import { parseIngredient } from "../src/lib/ingredients";
import { allTreeDragons } from "../src/lib/breeding";

describe("dragon data integrity", () => {
  it("every event dragon exists and has a market price", () => {
    for (const t of EVENT_DRAGONS) expect(DRAGONS[t]?.price, t).toBeGreaterThan(0);
  });

  it("event dragons are unique and the default list is a subset of them", () => {
    expect(new Set(EVENT_DRAGONS).size).toBe(EVENT_DRAGONS.length);
    expect(DEFAULT_FAVORITES).toHaveLength(23);
    for (const f of DEFAULT_FAVORITES) expect(EVENT_DRAGONS).toContain(f);
  });

  it("every recipe item and evolution source is valid", () => {
    for (const [name, d] of Object.entries(DRAGONS)) {
      expect(!!d.recipe && !!d.evolvesFrom, `${name} has both recipe and evolvesFrom`).toBe(false);
      if (d.evolvesFrom) {
        expect(DRAGONS[d.evolvesFrom], `${name} evolves from unknown ${d.evolvesFrom}`).toBeDefined();
        expect(d.evolveRequirement, `${name} missing evolveRequirement`).toBeTruthy();
      }
      for (const item of d.recipe ?? []) {
        const ing = parseIngredient(item);
        if (ing.kind === "dragon") expect(DRAGONS[ing.name], `${name} → unknown dragon "${ing.name}"`).toBeDefined();
        if (ing.kind === "element") expect(ELEMENTS, `${name} → unknown element "${ing.element}"`).toContain(ing.element);
        if (ing.kind === "special") expect(ing.elementCount).toBeGreaterThan(0);
      }
    }
  });

  it("every catalog dragon is a target or in some target's tree", () => {
    const reachable = new Set(allTreeDragons(EVENT_DRAGONS));
    for (const name of Object.keys(DRAGONS)) expect(reachable.has(name), `${name} is unused`).toBe(true);
  });
});
