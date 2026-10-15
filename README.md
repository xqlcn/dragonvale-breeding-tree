# Candy Bash XIII — Breeding Trees

An interactive planner for the DragonVale **Candy Bash XIII: FEAR** event. It covers all 106 dragons in the event
market, and lets you keep a **⭐ My list** of the dragons you're going for. A switch at the top picks **My list** or
**All event dragons**, and everything below follows it:

- **Trees & prices**: a card per dragon with its full, collapsible breeding tree, Candy market prices, special
  conditions (night, Rift, evolution, cloning), search / sort / "obtained" filters, a list of shared ingredients and a
  price summary table.
- **Breeding graph**: every dragon involved, auto-laid-out with ELK. You can pan, zoom (wheel or pinch) and
  click a box to highlight what it needs (orange) and what uses it (blue).
- **Progress tracking**: tick the ✓ on any dragon to mark it obtained. Progress is stored in your browser and shared
  across both views and both lists.
- **My list**: press ☆ on a card (or in the price table) to add a dragon, ★ to remove it. It starts as the original
  23-dragon list; "Reset my list" restores that. The list and the selected view are saved in your browser.

The original single-file version is kept for reference in [`legacy/`](legacy/candy-bash-xiii-breeding-tree.html).

## Tech stack

| Tool | Why |
| --- | --- |
| **React 19** | Most of the original code kept one piece of state (the "obtained" set) in sync across 5 different DOM regions by hand. Components that derive their UI from state remove that whole class of bugs, and new views just read the same state. |
| **TypeScript** (strict) | The recipe data is the heart of the app. Typed data plus a parsed `Ingredient` union replace ad-hoc `startsWith("el:")` checks. |
| **Vite** | Instant dev server with hot module replacement and a small production build. Code-splits ELK so it only downloads when the graph tab opens. |
| **elkjs 0.9.3** (npm, pinned) | Same graph-layout engine and version as the original, so the graph layout is identical. Now bundled locally instead of loaded from a CDN. |
| **Vitest + Testing Library** | Fast tests that share Vite's config. |

Not used, deliberately: a meta-framework (Next.js / SvelteKit), because this is a single static page with no server or
routing needs; a state library, because one React context is enough; CSS-in-JS or CSS modules, because the original
global CSS is kept verbatim so the look is pixel-identical.

## Project structure

```
├── index.html                 Vite HTML entry (meta tags, #root)
├── vite.config.ts             Vite + Vitest config
├── tsconfig.json
├── legacy/                    The original single-file page (reference only, not built)
├── src/
│   ├── main.tsx               Mounts <App/> and the global stylesheet
│   ├── App.tsx                Page shell: header, stats, legend, tabs, footer
│   ├── config.ts              External asset URLs, localStorage keys
│   ├── assets/egg.svg         Placeholder shown when a sprite fails to load
│   ├── data/                  ← edit these to change dragons / prices
│   │   ├── types.ts           Dragon + recipe-notation types, element list
│   │   ├── dragons.ts         Every dragon: price, recipe / evolution, flags, notes
│   │   └── targets.ts         All event-market dragons + the default "My list"
│   ├── lib/                   Pure, framework-free logic (unit tested)
│   │   ├── ingredients.ts     Parse "el:fire" / "epic:X" / "special:4"; text helpers
│   │   ├── breeding.ts        Tree walking, upstream/downstream, shared ingredients
│   │   ├── pricing.ts         Totals, cheapest / most expensive, parent subtotals
│   │   ├── targetList.ts      Card sort / search / filter rules
│   │   ├── assets.ts          Sprite / flag URLs
│   │   └── format.ts          Number formatting
│   ├── state/
│   │   ├── ObtainedContext.tsx  "Obtained" set shared by every view (useObtained())
│   │   ├── obtainedStorage.ts   localStorage persistence
│   │   ├── TargetListContext.tsx "My list" + list switch; `targets` = the active list (useTargetList())
│   │   └── targetListStorage.ts localStorage persistence for the list and switch
│   ├── hooks/useHashTab.ts    Active tab ↔ URL hash (#graph)
│   ├── components/
│   │   ├── common/            Reusable bits: Price, DragonSprite, ElementFlag, ObtainedToggle, DragonTags…
│   │   ├── layout/            Header, Footer, Legend, StatsBar, Tabs
│   │   ├── cards/             "Trees & prices" tab: toolbar, grid, card, breeding tree, shared, table
│   │   └── graph/             "Breeding graph" tab: ELK layout, pan/zoom hook, focus logic, SVG nodes
│   └── styles/                Global CSS split by feature, imported in order by index.css
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

It does load images from third-party hosts at runtime, so an internet connection is needed for pictures:

| Asset | Host | Offline behaviour |
| --- | --- | --- |
| Dragon sprites, element flags | `dvboxcdn.com` | Falls back to a local "?" egg placeholder |
| Candy icon | `static.wikia.nocookie.net` (Fandom) | Shows as a missing image |

The graph layout engine is bundled locally, so the app itself (data, trees, graph, progress tracking) works offline
once installed. The URLs live in `src/config.ts`. `index.html` sets `<meta name="referrer" content="no-referrer">`
because Fandom rejects hot-linked images that carry a third-party `Referer`.

## Extending the app

- **Change prices, recipes or add a dragon**: edit `src/data/dragons.ts`. Recipe notation is documented on
  `RecipeItem` in `src/data/types.ts`. Run `npm test`: `tests/data.test.ts` catches typos such as unknown dragon names
  or elements.
- **Change the event dragon list or the default "My list"**: edit `src/data/targets.ts`. Your own list is edited in
  the app (☆/★) and lives in localStorage, so changing `DEFAULT_FAVORITES` only affects people who haven't
  customized theirs (or who press "Reset my list").
- **Logic that depends on the list**: functions in `src/lib/` take the target list as a parameter; components get the
  active one from `useTargetList().targets`.
- **New dragon attribute** (e.g. a new tag): add the field to `Dragon` in `src/data/types.ts`, render it in
  `src/components/common/DragonTags.tsx` (cards) and/or `src/components/graph/GraphNode.tsx` (graph).
- **New derived numbers / rules**: put pure functions in `src/lib/` and test them in `tests/lib.test.ts`. Keep React
  out of `lib/`.
- **New component**: put it in the feature folder that uses it (`components/cards`, `components/graph`), or in
  `components/common` if both tabs use it. Read obtained state with `useObtained()`.
- **New tab / page**: add an id to `TabId` and an entry to `TABS` in `components/layout/Tabs.tsx`, then render its panel
  in `App.tsx`. If you need real multi-page routing later, add `react-router` at that point.
- **Styles**: add rules to the file for that feature in `src/styles/`. For a new area, create a new numbered file and
  import it at the **end** of `src/styles/index.css`. Order matters there because a few rules rely on source order to
  break specificity ties. Colours are CSS variables in `01-tokens.css`.

## Notes on the migration

Behaviour, markup and CSS were preserved. An automated comparison of the rendered DOM against the original matched all
2,683 elements (tag, classes, attributes, text and size), and the graph produces identical node positions, edge paths
and zoom transforms. Intentional changes:

1. **Bug fix: rainbow requirement.** Under Corrupticorn → Chromacorn → Rainbow / Double Rainbow, the "two parents with
   at least 4 different elements" requirement was rendered as a fake dragon named `special:4`, with a broken sprite
   and a ✓ button. It now shows the intended 🌈 requirement row, as the original code clearly meant to.
2. **Candy icon works when served over HTTP.** See the referrer note above. It only worked in the original when the
   file was opened directly from disk.
3. **ELK is bundled** instead of loaded from jsDelivr, and lazy-loaded with the graph tab. Its error message no longer
   mentions needing an internet connection.
4. Tiny tidy-ups: an empty favicon (removes a console 404), and dead code removed (unused `EL_COLORS` map and `order`
   variable).
