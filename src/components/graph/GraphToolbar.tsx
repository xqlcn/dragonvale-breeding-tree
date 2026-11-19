import { useState } from "react";
import { labelOf } from "../../lib/ingredients";
import { Icon } from "../common/Icon";

interface Props {
  /** Graph nodes; the find box only suggests once the layout is ready. */
  nodes: readonly string[] | null;
  focus: string;
  onFocusChange: (name: string) => void;
}

/** "Find a dragon" box: typing an exact name (suggestions included) selects it in the graph. */
export function GraphToolbar({ nodes, focus, onFocusChange }: Props) {
  const [text, setText] = useState("");
  // Show the selected dragon's name when it's picked by clicking in the graph.
  const [prevFocus, setPrevFocus] = useState(focus);
  if (focus !== prevFocus) {
    setPrevFocus(focus);
    setText(focus ? labelOf(focus) : "");
  }
  const byLabel = new Map((nodes ?? []).map((n) => [labelOf(n).toLowerCase(), n]));
  const onChange = (value: string) => {
    setText(value);
    const hit = byLabel.get(value.trim().toLowerCase());
    if (hit) onFocusChange(hit);
    else if (!value) onFocusChange("");
  };
  return (
    <div className="gfind">
      <label className="search">
        <Icon name="search" />
        <input
          id="gfocus" type="search" list="gfocus-list" placeholder="Find a dragon…" aria-label="Find a dragon in the graph"
          value={text} onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <datalist id="gfocus-list">
        {(nodes ?? []).slice().sort((a, b) => labelOf(a).localeCompare(labelOf(b))).map((n) => <option key={n} value={labelOf(n)} />)}
      </datalist>
    </div>
  );
}
