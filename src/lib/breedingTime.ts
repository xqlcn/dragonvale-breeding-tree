import { DRAGONS } from "../data/dragons";

/** An upgraded breeding cave breeds in 80% of the regular time (same rule DV Box uses). */
export const UPGRADED_CAVE_FACTOR = 0.8;

/** "22h 22m 22s", "24h", "2h 30m", "45m" (zero parts are left out). */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const parts = [[Math.floor(s / 3600), "h"], [Math.floor((s % 3600) / 60), "m"], [s % 60, "s"]] as const;
  return parts.filter(([n]) => n > 0).map(([n, unit]) => `${n}${unit}`).join(" ") || "0s";
}

/** Regular and upgraded breeding cave times in seconds, or null when unknown. */
export function breedingTimes(name: string): { regular: number; upgraded: number } | null {
  const t = DRAGONS[name]?.breedingTime;
  return t ? { regular: t, upgraded: Math.round(t * UPGRADED_CAVE_FACTOR) } : null;
}

/** Two-line hover text with both cave times, or "" when unknown. */
export function breedingTimeTooltip(name: string): string {
  const t = breedingTimes(name);
  return t ? `⏱ Breeding cave: ${formatDuration(t.regular)}\n⏱ Upgraded breeding cave: ${formatDuration(t.upgraded)}` : "";
}
