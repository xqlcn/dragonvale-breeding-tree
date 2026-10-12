import { OBTAINED_STORAGE_KEY } from "../config";

/** Reads the persisted "obtained" names. Never throws (storage may be blocked). */
export function loadObtained(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(OBTAINED_STORAGE_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function saveObtained(owned: ReadonlySet<string>): void {
  try {
    localStorage.setItem(OBTAINED_STORAGE_KEY, JSON.stringify([...owned]));
  } catch {
    /* storage unavailable: progress just isn't persisted */
  }
}
