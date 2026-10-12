import { describe, expect, it } from "vitest";
import { OBTAINED_STORAGE_KEY } from "../src/config";
import { loadObtained, saveObtained } from "../src/state/obtainedStorage";

describe("obtained persistence", () => {
  it("round-trips through localStorage using the original key", () => {
    saveObtained(new Set(["Reaper", "Bone"]));
    expect(localStorage.getItem(OBTAINED_STORAGE_KEY)).toBe('["Reaper","Bone"]');
    expect(loadObtained()).toEqual(new Set(["Reaper", "Bone"]));
  });

  it("ignores corrupt data", () => {
    localStorage.setItem(OBTAINED_STORAGE_KEY, "{not json");
    expect(loadObtained()).toEqual(new Set());
    localStorage.setItem(OBTAINED_STORAGE_KEY, '{"a":1}');
    expect(loadObtained()).toEqual(new Set());
  });
});
