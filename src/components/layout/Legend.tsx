import { CandyIcon } from "../common/CandyIcon";
import { ElementFlag } from "../common/ElementFlag";

/** Explains price and element-flag notation. Shown above both tabs. */
export const Legend = () => (
  <div className="legend">
    <span><b style={{ color: "var(--warn)" }}><CandyIcon />15,000</b> = event market price</span>
    <span><b style={{ color: "var(--none)" }}>not in market</b> = must breed / own already</span>
    <span>Element flags = any dragon with that element, e.g. <ElementFlag element="dark" className="flag-sm" /> = any dark dragon</span>
  </div>
);
