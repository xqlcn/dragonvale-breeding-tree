import type { MouseEvent } from "react";
import { labelOf } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";

/** The ✓ circle that marks a dragon as obtained. `big` is the pill variant used on card headers. */
export function ObtainedToggle({ name, big = false }: { name: string; big?: boolean }) {
  const { isOwned, toggle } = useObtained();
  const onClick = (e: MouseEvent) => {
    // Don't let the click also expand/collapse an enclosing <details>.
    e.preventDefault();
    e.stopPropagation();
    toggle(name);
  };
  return (
    <button
      type="button"
      className={big ? "own big" : "own"}
      aria-pressed={isOwned(name)}
      title={`Mark ${labelOf(name)} as obtained`}
      onClick={onClick}
    >
      ✓
    </button>
  );
}
