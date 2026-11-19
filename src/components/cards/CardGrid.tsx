import { cardMatches, emptyMessage, sortTargets, type ShowFilter, type SortMode } from "../../lib/targetList";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { DragonCard } from "./DragonCard";

interface Props { sort: SortMode; query: string; show: ShowFilter }

/** Grid of dragon cards. Non-matching cards stay mounted but hidden, so open trees stay open. */
export function CardGrid({ sort, query, show }: Props) {
  const { isOwned } = useObtained();
  const { targets } = useTargetList();
  const q = query.trim().toLowerCase();
  const list = sortTargets(targets, sort);
  const visible = new Set(list.filter((n) => cardMatches(n, q, show, isOwned)));
  return (
    <div className="grid" id="grid">
      {list.map((n) => <DragonCard key={n} name={n} hidden={!visible.has(n)} />)}
      <p className="empty" hidden={visible.size > 0}>{emptyMessage(q, show, list.length === 0)}</p>
    </div>
  );
}
