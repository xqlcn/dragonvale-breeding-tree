/** Key for node borders, edge styles and interactions in the breeding graph. */
export const GraphLegend = () => (
  <div className="glegend">
    <span><i className="sw target"></i>Your target dragons</span>
    <span><i className="sw market"></i>In market (ingredient)</span>
    <span><i className="sw nomarket"></i>Not in market</span>
    <span>
      <svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="var(--muted)" strokeWidth="2" /></svg>breeds into
    </span>
    <span>
      <svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="var(--good)" strokeWidth="2" strokeDasharray="5 4" /></svg>evolves into
    </span>
    <span><i className="sw" style={{ borderColor: "var(--accent)" }}></i>When highlighting: needed to breed it</span>
    <span><i className="sw" style={{ borderColor: "var(--cold)" }}></i>When highlighting: uses it</span>
    <span><i className="sw" style={{ borderColor: "var(--good)" }}></i>Obtained (click the ✓ circle on a box)</span>
    <span>Flags inside a box = the extra elements its combo needs</span>
    <span>Drag to pan · scroll / pinch to zoom · click a box to highlight what it needs (orange) and what needs it (blue)</span>
  </div>
);
