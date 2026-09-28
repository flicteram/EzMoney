# Ez Money

Roblox game built with **roblox-ts** (TypeScript → Luau), **React** (`@rbxts/react`), **TopbarPlus**, and **Rojo**.

## Requirements

- [Node.js](https://nodejs.org) 20+
- [Rokit](https://github.com/rojo-rbx/rokit) (manages Rojo — already pinned in `rokit.toml`)
- Roblox Studio with the [Rojo plugin](https://create.roblox.com/store/asset/13916111004/Rojo)

## First-time setup

```sh
rokit install     # installs Rojo 7.7.0
npm install
npm run build     # compiles src/ -> out/ (needed before Rojo can sync)
```

## Daily workflow

```sh
npm run dev       # rbxtsc --watch + rojo serve, together
```

Then in Studio: **Rojo plugin → Connect** (localhost:34872). Edits to `.ts`/`.tsx` recompile and
sync into the open place automatically.

Individually:

| Command | What it does |
| --- | --- |
| `npm run build` | One-off TypeScript → Luau compile into `out/` |
| `npm run watch` | Recompile on change |
| `npm run serve` | Rojo server for Studio to connect to |
| `npm run build:rbxl` | Compile and write `build/ez-money.rbxl` (no Studio needed) |
| `npm run sourcemap` | Keep `sourcemap.json` fresh for luau-lsp autocomplete |
| `npm run fmt` | Prettier over `src/` |

## Layout

```
src/
  client/
    runtime.client.tsx        LocalScript entry — mounts React + <ReflexProvider>
    store/
      index.ts                client root producer (shared slices + ui slice)
      receiver.ts             applies the server's broadcast actions
      hooks.ts                useRootProducer / useRootSelector / LOCAL_PLAYER_ID
      slices/ui.ts            client-only state (MENU_IDS + which menu is open)
    ui/
      app.tsx                 Root component; derives topbar + panels from MENUS
      menus.tsx               Record<MenuId, MenuDef> — the one menu registry
      content/shop.tsx        Shop panel body (stats + claim button)
      content/settings.tsx    Settings panel body (placeholder)
      components/panel.tsx    Card with title bar + close button
      components/stat-row.tsx Label/value row (accepts animated bindings)
      hooks/use-px.ts         1080p-authored pixels -> current viewport
      hooks/use-topbar.ts     Creates/destroys TopbarPlus icons from React
  server/
    runtime.server.ts         Script entry — player lifecycle + reward remote
    data/
      collection.ts           Lapis collection + schema validation (mock in Studio)
      profiles.ts             Load/save/close documents, synced from the store
    store/
      index.ts                server root producer (shared slices + session slice)
      broadcaster.ts          replicates shared slices to clients
      slices/session.ts       server-only state (claim cooldown)
  shared/
    constants.ts              GAME_NAME + UI tokens (unscaled 1080p numbers)
    log.ts                    Studio-gated logging
    remotes.ts                Minimal RemoteEvent registry
    store/
      index.ts                sharedSlices + SharedState type
      selectors.ts            selectors usable on client and server
      slices/players.ts       replicated per-player data (coins, level)
```


Rojo mapping ([default.project.json](default.project.json)):

| Build output | Studio location |
| --- | --- |
| `out/client` | `StarterPlayer/StarterPlayerScripts/TS` |
| `out/server` | `ServerScriptService/TS` |
| `out/shared` | `ReplicatedStorage/TS` |
| `include/` + `node_modules/@rbxts` + `node_modules/@rbxts-js` | `ReplicatedStorage/rbxts_include` |

`@rbxts-js` must be mapped alongside `@rbxts`: `@rbxts/react` is a thin shim that requires
`@rbxts-js/react` at runtime. Without it Studio logs
`Infinite yield possible on 'ReplicatedStorage.rbxts_include.node_modules:WaitForChild("@rbxts-js")'`.

`out/`, `include/`, `build/` and `sourcemap.json` are generated — never edit them, never commit them.

## State management (Reflex)

[`@rbxts/reflex`](https://github.com/littensy/reflex) with [`@rbxts/react-reflex`](https://github.com/littensy/react-reflex) bindings.
There are **two stores** — one per boundary — built from the same slice definitions:

| Store | Slices | Notes |
| --- | --- | --- |
| [src/server/store/index.ts](src/server/store/index.ts) | `sharedSlices` + `session` | The only place shared state is ever mutated |
| [src/client/store/index.ts](src/client/store/index.ts) | `sharedSlices` + `ui` | Shared slices are read-only in practice; the receiver fills them |

Replication is one-way:

```
server dispatch  ->  broadcaster middleware  ->  StoreDispatch remote
                 ->  receiver middleware     ->  client store  ->  useRootSelector -> React
client intent    ->  ClaimReward remote      ->  server validates -> server dispatch
```

Only `sharedSlices` are broadcast. Anything in a server-only slice (`session`) never leaves the
server, so put cooldowns, secrets and anti-cheat bookkeeping there. To hide part of a *shared*
slice per player, use `beforeDispatch` / `beforeHydrate` in
[src/server/store/broadcaster.ts](src/server/store/broadcaster.ts).

Clients never dispatch shared actions themselves — they fire a remote and the server decides
(see the 5s-cooldown check in [src/server/runtime.server.ts](src/server/runtime.server.ts)).

### Reading state in a component

```tsx
const producer = useRootProducer();
const coins = useRootSelector(selectCoins(LOCAL_PLAYER_ID));

producer.setOpenMenu("shop");   // client-only action, safe to dispatch here
```

### Adding a slice

1. Replicated state → `src/shared/store/slices/<name>.ts`, then add it to `sharedSlices` in
   [src/shared/store/index.ts](src/shared/store/index.ts). Selectors go in
   [src/shared/store/selectors.ts](src/shared/store/selectors.ts) and take `SharedState`.
2. Client-only state → `src/client/store/slices/`, add to `combineProducers` in
   [src/client/store/index.ts](src/client/store/index.ts).
3. Server-only state → `src/server/store/slices/`, add to `combineProducers` in
   [src/server/store/index.ts](src/server/store/index.ts).

Log every dispatch while debugging: `.applyMiddleware(loggerMiddleware, receiverMiddleware)`.

## Persistence (Lapis)

[`@rbxts/lapis`](https://github.com/nezuo/lapis) owns the DataStore layer:
[src/server/data/collection.ts](src/server/data/collection.ts) defines the schema and
[src/server/data/profiles.ts](src/server/data/profiles.ts) drives the lifecycle.

- Join: `collection.load` -> `store.addPlayer(id, document.read())`
- Autosave + leave + `BindToClose`: a `beforeSave` hook writes the current store snapshot into
  the document, so the store stays the single source of truth
- **Studio uses `MockDataStoreService`** — saves are in-memory and live data is never touched.
  Set `USE_MOCK_IN_STUDIO = false` in `collection.ts` to test real persistence (requires
  Game Settings > Security > Enable Studio Access to API Services)
- A failed load kicks in live servers (never overwrite a real save with defaults) and falls back
  to unsaved defaults in Studio

Changing the shape of `PlayerData` means adding a migration to the `migrations` array in
`collection.ts` — old saves fail schema validation otherwise.

## UI conventions

- **Scaling**: author every pixel value at 1080p and wrap it in `px()` from
  [use-px.ts](src/client/ui/hooks/use-px.ts). Raw offsets break on phones and 4K displays.
- **Tokens**: sizes and radii in [constants.ts](src/shared/constants.ts) are plain numbers
  (`UI.panel.width`, `UI.radius.sm`), not `UDim`/`UDim2`. A baked `UDim2` cannot go through `px()`,
  so it would just push callers back to hardcoded offsets.
- **Animation**: `useMotion` from `@rbxts/pretty-react-hooks` (springs via
  [ripple](https://github.com/littensy/ripple)). Bind the motion value straight to properties with
  `.map()` — no re-render per frame. See [shop.tsx](src/client/ui/content/shop.tsx) for the rolling
  coin counter. Panels themselves open instantly and take a plain `visible` boolean.
- **Use `{ damping: 1, frequency: n }`, not `tension`/`friction`**, unless a bounce is wanted.
  `tension`/`friction` is easy to leave underdamped (ratio = `friction / (2 * sqrt(tension))` < 1),
  and a value that rings past its goal is very visible on text: driving `UIScale` or any size with
  it re-rasterizes every text child on each bounce, which looks like the text wobbling.
- Prefer animating transparency and position over size or `UIScale` for anything containing text.
- Panels flip `Visible` off when closed, so a hidden panel never swallows clicks. `Panel` is still
  a `CanvasGroup` (it clips children and gives the card a single raster); if you add a fade, spring
  `GroupTransparency` and keep `Visible` tied to the tail of the animation.

## Checks

```sh
npm run check     # tsc --noEmit + eslint + prettier --check
npm run lint:fix  # autofix lint
```

ESLint runs `eslint-plugin-roblox-ts`, which catches Luau-specific traps the compiler allows —
notably `lua-truthiness` (`0` and `""` are truthy in Luau, falsy in TS) and `no-null`.
CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs the same checks plus a place build.

## Adding a menu

Menus are derived from one registry, so there is no `<Panel>` to hand-write:

1. Add the id to `MENU_IDS` in [src/client/store/slices/ui.ts](src/client/store/slices/ui.ts).
2. Add its entry to `MENUS` in [src/client/ui/menus.tsx](src/client/ui/menus.tsx), pointing at a
   content component in [src/client/ui/content/](src/client/ui/content/).

`MENUS` is typed `Record<MenuId, MenuDef>`, so step 1 without step 2 is a compile error. The topbar
button and the panel both fall out of the registry. TopbarPlus owns selected/deselected state;
React owns what the panel shows.

## Adding a package

```sh
npm i @rbxts/<package>        # runtime dependency, synced via rbxts_include
```

Roblox-only Luau packages that have no `@rbxts/` wrapper need Wally instead — add
`wally` to `rokit.toml` and a `Packages` mapping to `default.project.json` at that point.
