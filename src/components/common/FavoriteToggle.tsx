import type { MouseEvent } from "react";
import { labelOf } from "../../lib/ingredients";
import { useTargetList } from "../../state/TargetListContext";

/** The ☆/★ button that adds a dragon to (or removes it from) "My list". `big` is the pill variant on card headers. */
export function FavoriteToggle({ name, big = false }: { name: string; big?: boolean }) {
  const { isFavorite, toggleFavorite } = useTargetList();
  const on = isFavorite(name);
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(name);
  };
  return (
    <button
      type="button"
      className={big ? "fav big" : "fav"}
      aria-pressed={on}
      title={on ? `Remove ${labelOf(name)} from my list` : `Add ${labelOf(name)} to my list`}
      onClick={onClick}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
