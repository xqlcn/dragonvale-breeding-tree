import { TARGETS } from "../../data/targets";
import { labelOf } from "../../lib/ingredients";

interface Props {
  /** Graph nodes; options are only listed once the layout is ready. */
  nodes: readonly string[] | null;
  focus: string;
  onFocusChange: (name: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export function GraphToolbar({ nodes, focus, onFocusChange, onZoomIn, onZoomOut, onFit }: Props) {
  const ingredients = nodes ? nodes.filter((n) => !TARGETS.includes(n)).sort() : [];
  return (
    <div className="gbar">
      <label>
        Highlight a dragon
        <select id="gfocus" value={focus} onChange={(e) => onFocusChange(e.target.value)}>
          <option value="">— all dragons —</option>
          {nodes && (
            <>
              <optgroup label="Your targets">
                {TARGETS.slice().sort().map((n) => <option key={n} value={n}>{labelOf(n)}</option>)}
              </optgroup>
              <optgroup label="Ingredients">
                {ingredients.map((n) => <option key={n} value={n}>{n}</option>)}
              </optgroup>
            </>
          )}
        </select>
      </label>
      <span className="spacer"></span>
      <button id="gzin" title="Zoom in" onClick={onZoomIn}>＋</button>
      <button id="gzout" title="Zoom out" onClick={onZoomOut}>－</button>
      <button id="gfit" onClick={onFit}>Fit</button>
    </div>
  );
}
