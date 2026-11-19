# Branches of Valedrasil — Breeding Planner

A planner for the DragonVale **Branches of Valedrasil** event. It covers all 111 dragons in the event market and the
dragons in their breeding trees. Plan around **My list** (the dragons you are going for) or **All dragons**; everything
on the page follows that switch.

- **Summary**: how many you have obtained, the Iceberries still needed to buy the rest, and how many dragons are
  **ready to breed** (every parent obtained). Click that count to show just those.
- **Trees**: a card per dragon with its price, rarity, breeding time (regular and upgraded cave), cloning odds, notes
  and breeding tree. Trees open at the direct parents; click a parent to see its own parents. **Key parents** above the
  cards lists the parents shared by several of your dragons; click one to see which dragons need it.
- **Table**: the same dragons as a sortable shopping list with totals.
- **Graph**: every dragon involved, laid out with ELK. Pan, zoom, find a dragon by name, or click one to highlight what
  it needs and what it is used for, with a details panel (price, times, parents, obtained and list toggles).
- **Search, sort and Show** (all / still needed / ready to breed / obtained) apply to Trees and Table. **Baby / Adult**
  switches their pictures to adult art from the DragonVale wiki (the graph keeps babies).
- **Tracking**: the check marks a dragon obtained, the star adds it to My list, and **Edit list** opens a checklist of
  every event dragon by market section for adding or removing many at once. Everything is saved in your browser.
  **Reset progress** and **Reset my list** are in the footer.

The original single-file version (built for the earlier Candy Bash XIII event) is kept for reference in
[`legacy/`](legacy/candy-bash-xiii-breeding-tree.html).

## Tech stack

| Tool | Why |
| --- | --- |
| **React 19** | Most of the original code kept one piece of state (the "obtained" set) in sync across 5 different DOM regions by hand. Components that derive their UI from state remove that whole class of bugs, and new views just read the same state. |
| **TypeScript** (strict) | The recipe data is the heart of the app. Typed data plus a parsed `Ingredient` union replace ad-hoc `startsWith("el:")` checks. |
| **Vite** | Instant dev server with hot module replacement and a small production build. Code-splits ELK so it only downloads when the graph opens. |
| **elkjs 0.9.3** (npm, pinned) | Graph-layout engine, bundled locally instead of loaded from a CDN. |
| **Vitest + Testing Library** | Fast tests that share Vite's config. |

Not used, deliberately: a meta-framework (Next.js / SvelteKit), because this is a single static page with no server or
routing needs; a state library, because one React context is enough; CSS-in-JS or CSS modules, because a few plain
global stylesheets built on CSS variables are enough for one page. The UI font is Nunito (Google Fonts).

## Project structure

```
├── index.html                 Vite HTML entry (meta tags, font, #root)
├── vite.config.ts             Vite + Vitest config
├── tsconfig.json
├── legacy/                    The original single-file page (reference only, not built)
├── src/
│   ├── main.tsx               Mounts <App/> and the global stylesheet
│   ├── App.tsx                Page shell: header, summary, view bar, the three views, footer; owns search / sort / show
│   ├── config.ts              Event name / currency, external asset URLs, localStorage keys
│   ├── assets/egg.svg         Placeholder shown when a sprite fails to load
│   ├── data/                  ← edit these to change dragons / prices
│   │   ├── types.ts           Dragon + recipe-notation types, element list
│   │   ├── dragons.ts         Every dragon: price, rarity, breeding time, recipe / evolution, notes
│   │   ├── adultSprites.ts    Adult-art paths on the Fandom wiki (generated)
│   │   └── targets.ts         Event-market dragons by section + the default "My list"
│   ├── lib/                   Pure, framework-free logic (unit tested)
│   │   ├── ingredients.ts     Parse "el:fire" / "epic:X" / "special:4"; text helpers
│   │   ├── breeding.ts        Tree walking, upstream/downstream, shared ingredients
│   │   ├── breedingTime.ts    Regular / upgraded cave times and formatting
│   │   ├── pricing.ts         Totals, cheapest / most expensive, parent subtotals
│   │   ├── targetList.ts      Sort / search / Show rules, "ready to breed"
│   │   ├── assets.ts          Sprite, adult-art and flag URLs; rarity frame class
│   │   └── format.ts          Number formatting
│   ├── state/
│   │   ├── ObtainedContext.tsx  "Obtained" set shared by every view (useObtained())
│   │   ├── obtainedStorage.ts   localStorage persistence
│   │   ├── TargetListContext.tsx "My list" + list switch; `targets` = the active list (useTargetList())
│   │   ├── targetListStorage.ts localStorage persistence for the list and switch
│   │   └── spriteStage.ts       Baby / Adult pictures (context + persistence)
│   ├── hooks/useHashTab.ts    Active view ↔ URL hash (#table, #graph)
│   ├── components/
│   │   ├── common/            Reusable bits: Icon, Price, BreedTime, RarityLabel, DragonSprite, check / star toggles…
│   │   ├── layout/            Header (+ ListEditor), Summary, ViewBar, Footer
│   │   ├── cards/             Trees view: key parents, grid, card, breeding tree
│   │   ├── table/             Table view
│   │   └── graph/             Graph view: ELK layout, pan/zoom hook, focus logic, nodes, find box, details panel
│   └── styles/                Global CSS split by area, imported in order by index.css (tokens first)
└── tests/                     Vitest suites (data integrity, logic, components, graph layout)
```

## Prerequisites

- **Node.js 22.12 or newer** (Vite 8 / Vitest 5 requirement). Check with `node -v`.
- npm (bundled with Node).

## Install and run

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. Edits to any file under `src/` hot-reload in the browser.

Other commands:

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run build
```

```bash
npm run preview
```

`npm run build` type-checks and writes a static site to `dist/`. `npm run preview` serves that build at
http://localhost:4173. `dist/` can be hosted on any static file host. `npm run test:watch` re-runs tests on save.

## Environment variables and external services

**None are required**, so there is no `.env` file. The app has no backend, API keys or secrets.

It does load images and the font from third-party hosts at runtime, so an internet connection is needed for those:

| Asset | Host | Offline behaviour |
| --- | --- | --- |
| Dragon sprites, element flags | `dvboxcdn.com` | Falls back to a local "?" egg placeholder |
| Adult dragon art | `static.wikia.nocookie.net` (Fandom) | Falls back to the baby sprite, then the egg |
| Iceberries icon | `static.wikia.nocookie.net` (Fandom) | Shows as a missing image |
| Nunito font | `fonts.googleapis.com` | Falls back to the system font |

The graph layout engine is bundled locally, so the app itself (data, trees, graph, progress tracking) works offline
once installed. The URLs live in `src/config.ts`. `index.html` sets `<meta name="referrer" content="no-referrer">`
because Fandom rejects hot-linked images that carry a third-party `Referer`.

## Switching to a new event

1. Replace `src/data/dragons.ts` (every market dragon plus every dragon in their trees) and `src/data/targets.ts`
   (market sections + default "My list").
2. In `src/config.ts`, update `EVENT_NAME`, `CURRENCY_NAME`, `CURRENCY_ICON_URL`, and give the storage keys a new
   prefix so the new event starts with a fresh "obtained" set and the new default list.
3. Regenerate `src/data/adultSprites.ts` for the new dragons, update the `<title>` in `index.html`, and update the
   expected numbers in `tests/`. `npm test` flags unknown dragons, unknown elements and catalog dragons no tree uses.

## Extending the app

- **Change prices, recipes or add a dragon**: edit `src/data/dragons.ts`. Recipe notation is documented on
  `RecipeItem` in `src/data/types.ts`. Run `npm test`: `tests/data.test.ts` catches typos such as unknown dragon names
  or elements.
- **Change the event dragon list or the default "My list"**: edit `src/data/targets.ts`. Your own list is edited in
  the app and lives in localStorage, so changing `DEFAULT_FAVORITES` only affects people who haven't customized theirs
  (or who press "Reset my list").
- **Logic that depends on the list**: functions in `src/lib/` take the target list as a parameter; components get the
  active one from `useTargetList().targets`.
- **New dragon attribute**: add the field to `Dragon` in `src/data/types.ts`, then show it in
  `src/components/cards/DragonCard.tsx`, `src/components/table/TableView.tsx` and/or
  `src/components/graph/GraphDetails.tsx`.
- **New derived numbers / rules**: put pure functions in `src/lib/` and test them in `tests/lib.test.ts`. Keep React
  out of `lib/`.
- **New component**: put it in the folder of the view that uses it (`components/cards`, `components/table`,
  `components/graph`), or in `components/common` if several views use it. Read obtained state with `useObtained()`.
- **New view**: add an id to `TabId` (`hooks/useHashTab.ts`) and an entry to `TABS` in
  `components/layout/ViewBar.tsx`, then render its panel in `App.tsx`.
- **Styles**: add rules to the file for that area in `src/styles/`; for a new area, create a new numbered file and
  import it in `src/styles/index.css`. Use the variables in `01-tokens.css` (surfaces, text, accent, good, star,
  rarity) rather than new colours, and the shared pieces in `02-base.css` (`.btn`, `.seg`, `.iconbtn`, `.chip`).
