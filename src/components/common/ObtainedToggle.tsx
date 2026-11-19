import type { MouseEvent } from "react";
import { labelOf } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";
import { Icon } from "./Icon";

/** Check button that marks a dragon as obtained. `size` "lg" is the card-corner version. */
export function ObtainedToggle({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const { isOwned, toggle } = useObtained();
  const on = isOwned(name);
  const onClick = (e: MouseEvent) => {
    // Don't let the click also expand/collapse an enclosing <details>.
    e.preventDefault();
    e.stopPropagation();
    toggle(name);
  };
  const label = on ? `${labelOf(name)} is obtained (click to undo)` : `Mark ${labelOf(name)} as obtained`;
  return (
    <button type="button" className={`own ${size}`} aria-pressed={on} aria-label={label} title={label} onClick={onClick}>
      <Icon name="check" size={size === "lg" ? 18 : 14} strokeWidth={3} />
    </button>
  );
}
