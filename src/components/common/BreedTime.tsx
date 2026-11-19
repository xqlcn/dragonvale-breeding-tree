import { breedingTimes, formatDuration } from "../../lib/breedingTime";
import { Icon } from "./Icon";

/** "⏱ 23h · 18h 24m upgraded": regular and upgraded breeding cave times. */
export function BreedTime({ name, compact = false }: { name: string; compact?: boolean }) {
  const t = breedingTimes(name);
  if (!t) return null;
  const title = `Breeding cave: ${formatDuration(t.regular)} · Upgraded breeding cave: ${formatDuration(t.upgraded)}`;
  return (
    <span className="btime" title={title}>
      <Icon name="clock" size={13} />
      {formatDuration(t.regular)}
      {!compact && <span className="up"> · {formatDuration(t.upgraded)} upgraded</span>}
    </span>
  );
}
