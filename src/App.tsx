import { useCallback, useState } from "react";
import { TreesView } from "./components/cards/TreesView";
import { GraphView } from "./components/graph/GraphView";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Summary } from "./components/layout/Summary";
import { ViewBar, type ViewControls } from "./components/layout/ViewBar";
import { TableView } from "./components/table/TableView";
import { useHashTab } from "./hooks/useHashTab";
import { ObtainedProvider } from "./state/ObtainedContext";
import { loadAdultSprites, saveAdultSprites, SpriteStageContext } from "./state/spriteStage";
import { TargetListProvider } from "./state/TargetListContext";

export function App() {
  const [tab, setTab] = useHashTab();
  const [controls, setControls] = useState<ViewControls>(() => ({
    query: "", sort: "list", show: "all", adultSprites: loadAdultSprites(),
  }));
  const update = useCallback((patch: Partial<ViewControls>) => {
    if (patch.adultSprites !== undefined) saveAdultSprites(patch.adultSprites);
    setControls((c) => ({ ...c, ...patch }));
  }, []);
  /**
   * "Ready to breed" is one switch shared by every view: the Show filter in Trees / Table, the spotlight in
   * the graph. The summary card and the graph's button both toggle it.
   */
  const readyActive = controls.show === "ready";
  const toggleReady = () => update(readyActive ? { show: "all" } : { show: "ready", query: "" });

  return (
    <ObtainedProvider>
    <TargetListProvider>
      <div className="app">
        <Header />
        <main>
          <Summary readyActive={readyActive} onToggleReady={toggleReady} />
          <ViewBar tab={tab} onTab={setTab} onChange={update} {...controls} />
          {/* All views stay mounted; hiding keeps open trees and the graph's pan / zoom. */}
          <SpriteStageContext.Provider value={controls.adultSprites}>
            <section id="view-trees" role="tabpanel" aria-labelledby="tab-trees" hidden={tab !== "trees"}>
              <TreesView controls={controls} onSearch={(query) => update({ query })} />
            </section>
            <section id="view-table" role="tabpanel" aria-labelledby="tab-table" hidden={tab !== "table"}>
              <TableView controls={controls} />
            </section>
          </SpriteStageContext.Provider>
          <section id="view-graph" role="tabpanel" aria-labelledby="tab-graph" hidden={tab !== "graph"}>
            <GraphView active={tab === "graph"} readyOnly={readyActive} onToggleReady={toggleReady} />
          </section>
        </main>
        <Footer />
      </div>
    </TargetListProvider>
    </ObtainedProvider>
  );
}
