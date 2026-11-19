import { CURRENCY_NAME, EVENT_NAME } from "../../config";
import { DEFAULT_FAVORITES } from "../../data/targets";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";

/** Sources, plus the two "start over" actions (kept out of the way of everyday controls). */
export function Footer() {
  const { owned, clear } = useObtained();
  const { resetFavorites } = useTargetList();
  const resetProgress = () => {
    if (owned.size && confirm("Clear every obtained mark?")) clear();
  };
  const resetList = () => {
    if (confirm(`Reset My list to the default ${DEFAULT_FAVORITES.length} dragons?`)) resetFavorites();
  };
  return (
    <footer className="foot">
      <p>
        {EVENT_NAME} prices are in {CURRENCY_NAME}. Recipes and prices from the DragonVale Tips forum, checked against
        DV Box; pictures from DV Box and the DragonVale wiki. Combos can change during the event.
      </p>
      <p className="foot-actions">
        <button type="button" className="linkbtn" id="resetprogress" onClick={resetProgress}>Reset progress</button>
        <button type="button" className="linkbtn" id="resetfav" onClick={resetList}>Reset my list</button>
      </p>
    </footer>
  );
}
