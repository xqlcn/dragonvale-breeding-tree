import { describe, expect, it } from "vitest";
import { breedingTimes, breedingTimeTooltip, formatDuration } from "../src/lib/breedingTime";
import { DRAGONS } from "../src/data/dragons";

describe("breeding cave times", () => {
  it("formats durations without zero parts", () => {
    expect(formatDuration(86400)).toBe("24h");
    expect(formatDuration(80542)).toBe("22h 22m 22s");
    expect(formatDuration(9000)).toBe("2h 30m");
    expect(formatDuration(0)).toBe("0s");
  });

  it("the upgraded cave takes 80% of the regular time", () => {
    expect(breedingTimes("Jawny")).toEqual({ regular: 86400, upgraded: 69120 });
    expect(breedingTimes("Unknown")).toBeNull();
    expect(breedingTimeTooltip("Jawny")).toBe("⏱ Breeding cave: 24h\n⏱ Upgraded breeding cave: 19h 12m");
    expect(breedingTimeTooltip("Unknown")).toBe("");
  });

  it("every catalog dragon has a breeding time", () => {
    for (const [name, d] of Object.entries(DRAGONS)) expect(d.breedingTime, name).toBeGreaterThan(0);
  });
});
