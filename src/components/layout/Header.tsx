import { CURRENCY_NAME, EVENT_NAME } from "../../config";
import { EVENT_DRAGONS } from "../../data/targets";

export const Header = () => (
  <header>
    <h1>❄️ Branches of <span>Valedrasil</span> — Breeding Trees</h1>
    <p className="sub">
      Full breeding trees for your list or all {EVENT_DRAGONS.length} event dragons, with {CURRENCY_NAME} (event currency) market
      prices. Data from the DragonVale Tips forum {EVENT_NAME} thread. Breeding combos can change during the event.
    </p>
  </header>
);
