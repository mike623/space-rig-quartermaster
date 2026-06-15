# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Space Rig Quartermaster — mobile-first, local-first companion web app for *Deep Rock Galactic: The Board Game* Space Rig campaigns, with an optional house-rule economy layer. Vite + React + TypeScript, Zustand state, Zod import validation, hash-routed SPA, `localStorage` persistence, installable PWA.

`docs/PRD.md` is the product source of truth for scope; `docs/RULES.md` covers the house-rule economy. Read PRD before changing product behavior.

## Commands

```bash
npm run dev                              # dev server, http://localhost:5173
npm run build                            # tsc -b typecheck + production build
npm run test                             # all vitest domain tests
npm run test -- src/domain/economy.test.ts   # single test file
npx vitest run -t "purchase"             # single test by name
npm run preview                          # serve the production build
```

`npm run build` typechecks first (`tsc -b`) — a type error fails the build (and the deploy). Tests run in a `node` environment and cover `src/domain` only; UI has no test harness.

## Architecture

Three layers, strict dependency direction `domain → state → screens`. Domain never imports state or React.

- **`src/domain/`** — all game logic as pure, framework-free functions, each transforming a value and returning a new one (no mutation, no I/O). Each module has a colocated `*.test.ts`. Key modules: `campaign` (create), `character` (HP/ammo/penalties), `economy` (purchase/confiscate/split — the shop+resupply flow), `randomizer` (seeded recipe generation), `report` (management report), `sharing` (import/export), `catalog` (editable item lists), `schema` (Zod), `types`, `prng`, `ids`.

- **`src/state/store.ts`** — single Zustand store and the **only** mutation gateway. Every change goes through `patch(fn)` / `patchCharacter(id, fn)`, which apply a pure domain transform and then call `persist()`. `persist()` stamps `updatedAt`, writes to `localStorage`, and sets the active-campaign id. **Autosave is a side effect of `persist()` — there is no separate save step. To add a mutation, write the pure transform in `domain/` and route it through `patch`; never write `localStorage` from a component.**

- **`src/storage/storage.ts`** — multi-slot `localStorage` persistence. Keys are `srq.`-prefixed: an index (`srq.campaigns.index`), one blob per campaign (`srq.campaign.<id>`), and the active id (`srq.activeCampaignId`). All access is wrapped in try/catch (quota/unavailable → silently ignored). `loadCampaign` Zod-validates on read and returns `null` on failure.

- **`src/screens/`** + **`src/components/`** — UI. Screens read from the store and call its actions; they hold transient form state only.

### Determinism (seeded recipes)

`prng.ts` is a deterministic seed→sequence PRNG (xfnv1a hash + mulberry32). `randomizer.ts` builds campaign recipes from a seed string, so the **same seed always yields the same recipe** — the seed is surfaced in the UI and embedded in shared recipes. Do not introduce `Math.random()` into recipe generation; it would break reproducibility and shared-recipe parity.

### Save / share format

Exports are versioned envelopes (`schemaVersion`, `appVersion`, `kind`) validated with Zod on import (`domain/sharing.ts`). Two kinds: full `campaign-state` and share-only `campaign-recipe`. When changing the campaign shape, update the Zod schema and consider schema-version migration — old blobs in `localStorage` are validated on load and dropped if they no longer parse.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`. Live at `https://mike623.github.io/space-rig-quartermaster/`.

- The app is served from a **subpath**, so `vite.config.ts` sets `base: "/space-rig-quartermaster/"` for `command === "build"` only (dev stays `/`). Routing uses `HashRouter` specifically so deep links work under the subpath without server rewrites — keep it.
- Pushing the workflow file requires a GitHub token with `workflow` scope.

## Content / legal constraint

Companion tool only. **No official rulebook text, card text, copyrighted artwork, or proprietary assets.** All item/card/modifier names are generic, user-editable placeholders (see `catalog`). Private source documents live under `docs/private-source-documents/` and are gitignored — never copy their contents into shipped code or commits.
