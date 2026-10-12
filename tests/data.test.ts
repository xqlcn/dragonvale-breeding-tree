import { describe, expect, it } from "vitest";
import { DRAGONS } from "../src/data/dragons";
import { TARGETS } from "../src/data/targets";
import { ELEMENTS } from "../src/data/types";
import { parseIngredient } from "../src/lib/ingredients";

describe("dragon data integrity", () => {
  it("every target exists and has a market price", () => {
    for (const t of TARGETS) expect(DRAGONS[t]?.price, t).toBeGreaterThan(0);
  });

  it("targets are unique", () => {
    expect(new Set(TARGETS).size).toBe(TARGETS.length);
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
});
