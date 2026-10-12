import { TARGETS } from "../../data/targets";

export const Header = () => (
  <header>
    <h1>🎃 Candy Bash XIII: <span>FEAR</span> — Breeding Trees</h1>
    <p className="sub">
      Full breeding trees for {TARGETS.length} dragons, with Candy (event currency) market prices. Data from the DV
      Community Forum Candy Bash XIII thread (Oct 8, 2026). Breeding combos can change during the event.
    </p>
  </header>
);
