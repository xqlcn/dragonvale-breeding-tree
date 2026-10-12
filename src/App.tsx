import { CardsView } from "./components/cards/CardsView";
import { GraphView } from "./components/graph/GraphView";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Legend } from "./components/layout/Legend";
import { StatsBar } from "./components/layout/StatsBar";
import { Tabs } from "./components/layout/Tabs";
import { useHashTab } from "./hooks/useHashTab";
import { ObtainedProvider } from "./state/ObtainedContext";

export function App() {
  const [tab, setTab] = useHashTab();
  return (
    <ObtainedProvider>
      <Header />
      <main>
        <StatsBar />
        <Legend />
        <Tabs active={tab} onSelect={setTab} />
        {/* Both tabs stay mounted; hiding preserves tree expansion and graph pan/zoom. */}
        <div id="tab-cards" hidden={tab !== "cards"}>
          <CardsView />
        </div>
        <div id="tab-graph" hidden={tab !== "graph"}>
          <GraphView active={tab === "graph"} />
        </div>
      </main>
      <Footer />
    </ObtainedProvider>
  );
}
