import type { MouseEvent } from "react";
import { labelOf } from "../../lib/ingredients";
import { useTargetList } from "../../state/TargetListContext";
import { Icon } from "./Icon";

/** Star button that adds a dragon to (or removes it from) "My list". */
export function FavoriteToggle({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const { isFavorite, toggleFavorite } = useTargetList();
  const on = isFavorite(name);
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(name);
  };
  const label = on ? `Remove ${labelOf(name)} from my list` : `Add ${labelOf(name)} to my list`;
  return (
    <button type="button" className={`fav ${size}`} aria-pressed={on} aria-label={label} title={label} onClick={onClick}>
      <Icon name="star" size={size === "lg" ? 18 : 14} filled={on} />
    </button>
  );
}
