# CLAUDE.md

Roblox game, **Ez Money**. roblox-ts (TypeScript -> Luau) + `@rbxts/react` + Reflex +
TopbarPlus + Lapis, synced to Studio with Rojo. Human-facing docs and file layout live in
[README.md](README.md) — read it before changing structure.

## Commands

```sh
npm run check     # tsc --noEmit + eslint + prettier --check  <- run before claiming done
npm run build     # rbxtsc: src/ -> out/
npm run dev       # rbxtsc --watch + rojo serve
npm run lint:fix
```

`npx rbxtsc` must also pass — it reports errors `tsc` does not (and vice versa: `tsc` sees
declaration errors rbxtsc filters out). Run both.

## Do not touch

- `out/`, `include/`, `build/`, `sourcemap.json` — generated. Edit `src/`.
- `typescript` is pinned to **5.5.3**; roblox-ts 3.0.0 depends on `=5.5.3`. Do not bump it.
- `skipLibCheck: true` in [tsconfig.json](tsconfig.json) — `@rbxts/types` is ahead of
  `@rbxts/compiler-types`, so the editor flags two errors inside `node_modules`. Remove only once
  compiler-types catches up.
- `jsx: "react"` + `jsxFactory: "React.createElement"`. `@rbxts/react` ships no `jsx-runtime`
  entry, so `react-jsx` breaks the build.
- [default.project.json](default.project.json) must map **both** `node_modules/@rbxts` and
  `node_modules/@rbxts-js`. `@rbxts/react` is a shim that requires `@rbxts-js/react` at runtime.
- Runtime packages go in `dependencies`, never `devDependencies` — dev deps are absent from a
  production place build.

## Luau-shaped TypeScript

ESLint (`eslint-plugin-roblox-ts`) enforces most of this; do not silence it to make code compile.

- `undefined`, never `null`.
- `0` and `""` are **truthy in Luau**, falsy in TS. Compare explicitly: `if (n !== 0)`, not `if (n)`.
- Arrays are 1-indexed Luau tables under the hood; do not `pairs` them or rely on `length` after
  holes appear.

## State (Reflex)

- Two stores from shared slice definitions: [server](src/server/store/index.ts) and
  [client](src/client/store/index.ts).
- **The server is the only writer of shared state.** A client that wants a change fires a remote;
  the server validates and dispatches. Never dispatch a shared action from client code.
- Replicated state -> `src/shared/store/slices/` and registered in `sharedSlices`. Selectors take
  `SharedState` so both stores accept them.
- Secrets, cooldowns, anti-cheat bookkeeping -> `src/server/store/slices/` (never broadcast).
  Client-only view state -> `src/client/store/slices/`.
- To hide part of a *shared* slice per player, use `beforeDispatch`/`beforeHydrate` in
  [broadcaster.ts](src/server/store/broadcaster.ts).

## Persistence (Lapis)

- The store is the source of truth; `beforeSave` in [profiles.ts](src/server/data/profiles.ts)
  writes the current store snapshot into the document.
- Changing the shape of `PlayerData` **requires** a migration in
  [collection.ts](src/server/data/collection.ts). Old saves fail schema validation otherwise.
- Studio uses `MockDataStoreService` (in-memory). Do not disable that default.
- A failed load kicks in live servers. Never "fix" that by starting the player on default data —
  it would overwrite a real save.

## UI

- Wrap every pixel value in `px()` from [use-px.ts](src/client/ui/hooks/use-px.ts). Values are
  authored at 1080p. Raw offsets are a bug.
- Dimension tokens in [constants.ts](src/shared/constants.ts) are **raw numbers**, never baked
  `UDim`/`UDim2` — a constructed `UDim2` cannot be rescaled, so it forces callers to bypass `px()`
  and re-type the magic number. Add sizes/radii there and `px()` them at the call site.
- Menus are a registry, not a hand-wired list. `MENU_IDS`/`MenuId` live in
  [ui.ts](src/client/store/slices/ui.ts); [menus.tsx](src/client/ui/menus.tsx) is typed
  `Record<MenuId, MenuDef>`, and the topbar buttons and panels are both derived from it. Adding a
  menu is one id + one entry — never a new `<Panel>` block or a `label === "..."` branch.
- Springs: `{ damping: 1, frequency: n }`. Settle ~`6.6 / (2*pi*n)` seconds. Underdamped springs
  ring, and driving `UIScale`/size with a ringing value re-rasterizes text — it looks like wobble.
  Animate transparency and position instead. The coin counter in
  [shop.tsx](src/client/ui/content/shop.tsx) is the live example.
- Panels open and close **instantly** — `Panel` takes a plain `visible` boolean. If a transition is
  ever wanted, spring `GroupTransparency`/`Position`; do not reintroduce a motion binding that
  calls `immediate()`, which is animation machinery that animates nothing.
- Drive properties from motion bindings with `.map()`; never re-render per frame.
- Hidden panels must stop receiving input (`Visible` false), or they eat clicks.

## Working style here

- I cannot playtest. `tsc`/`eslint`/`rbxtsc`/`rojo build` passing is **not** proof the game works —
  say what was verified and what still needs a Studio playtest.
- Animation timing and UI feel are the user's call; ask rather than guess a duration.
- Commits: Conventional Commits, subject <= 50 chars, body explains *why* when it is not obvious.
- Changing [default.project.json](default.project.json) requires a Rojo Disconnect/Connect in
  Studio; mention it.
