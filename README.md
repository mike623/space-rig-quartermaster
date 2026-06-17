<div align="center">

<img src="public/icon.svg" alt="Space Rig Quartermaster" width="96" height="96" />

# Space Rig Quartermaster

Mobile-first, local-first companion web app for *Deep Rock Galactic: The Board Game* Space Rig campaigns — with an optional house-rule economy layer.

[Live app](https://mike623.github.io/space-rig-quartermaster/) · [Product spec](docs/PRD.md) · [House rules](docs/RULES.md)

</div>

> [!NOTE]
> Companion tool only. It contains **no official rulebook/card text, artwork, or proprietary assets** — every item, weapon, and modifier name is a generic placeholder you can rename. It assists play; it does not replace the official game.

## Overview

Quartermaster keeps the bookkeeping off the table. Spin up a campaign, manage your dwarves' health, ammo, weapons, and upgrades, then run an end-of-mission economy flow to spend resources at the Rig Shop. Everything is stored in your browser — no account, no server, works offline.

- **Local-first** — all data lives in `localStorage`. Auto-saves on every change.
- **Reproducible setups** — campaign recipes are generated from a seed, so the same seed always yields the same starting conditions. Share the seed, share the setup.
- **Installable PWA** — add to home screen and run offline.
- **Portable saves** — export/import versioned, schema-validated JSON; share a full campaign or just a recipe.

## Features

| Screen | What it does |
| --- | --- |
| Home | Pick up an existing campaign or start a new one |
| Campaign Setup | Mode, player count, difficulty, and a seed that drives the generated recipe |
| Characters | Track HP, ammo, weapons, upgrades, and penalty states for 1–4 dwarves |
| End Mission | Resolve mission results and feed the economy flow |
| Rig Shop | Spend resources — purchase, confiscate, split gold |
| Launch | Pre-mission readiness checks |
| History | Management reports and campaign log |

## Screens

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/screenshots/home-empty.png" alt="Home — saved campaigns" /><br /><sub><b>Home</b> · pick a dig</sub></td>
    <td align="center" width="33%"><img src="docs/screenshots/setup.png" alt="Campaign setup" /><br /><sub><b>Setup</b> · mode, players, seed</sub></td>
    <td align="center" width="33%"><img src="docs/screenshots/characters.png" alt="Characters roster" /><br /><sub><b>Characters</b> · HP, ammo, crew</sub></td>
  </tr>
  <tr>
    <td align="center" width="33%"><img src="docs/screenshots/end-mission.png" alt="End mission debrief" /><br /><sub><b>End Mission</b> · debrief &amp; resources</sub></td>
    <td align="center" width="33%"><img src="docs/screenshots/shop.png" alt="Rig Shop" /><br /><sub><b>Rig Shop</b> · spend resources</sub></td>
    <td align="center" width="33%"><img src="docs/screenshots/launch.png" alt="Launch readiness check" /><br /><sub><b>Launch</b> · readiness check</sub></td>
  </tr>
  <tr>
    <td align="center" width="33%"><img src="docs/screenshots/history.png" alt="History and reports" /><br /><sub><b>History</b> · recipe &amp; reports</sub></td>
    <td></td>
    <td></td>
  </tr>
</table>

> Screenshots are generated, not hand-pasted — `npm run e2e` drives the app through a real campaign (fixed seed `ROCKANDSTONE`) and captures every screen, so they never drift from the UI. See [`e2e/screens.spec.ts`](e2e/screens.spec.ts).

## Tech stack

- **Vite + React + TypeScript**
- **Zustand** — state, with centralized autosave
- **Zod** — schema validation on every import/load
- **React Router** — hash routing (works under a subpath, no server rewrites)
- **vite-plugin-pwa** — installable / offline

## Getting started

> [!NOTE]
> Requires Node.js 20+.

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
```

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck (`tsc -b`) + production build |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run the vitest domain test suite |
| `npm run e2e` | Playwright walkthrough — smoke-tests every screen and regenerates the screenshots above |

Run a single test file or match by name:

```bash
npm run test -- src/domain/economy.test.ts
npx vitest run -t "purchase"
```

## Architecture

Three layers with a strict dependency direction — `domain → state → screens`. Domain logic never imports state or React.

```
src/
  domain/      pure game logic (campaign, character, economy, randomizer,
               report, sharing, catalog, schema, prng, ids) + colocated *.test.ts
  storage/     localStorage save/load + multi-slot index
  state/       Zustand store — the single mutation gateway, wires domain → UI
  components/  Stepper, CatalogEditor, ReportSheet, Toast, icons
  screens/     Home, CampaignSetup, Characters, EndMission, RigShop, Launch, History
docs/          PRD.md, RULES.md
```

- **Domain** is framework-free and pure: every function takes a value and returns a new one, no mutation, no I/O. Tests cover this layer.
- **State** funnels *all* changes through `patch()` / `patchCharacter()`, which apply a pure domain transform and then persist. Autosave is a side effect of persisting — there is no separate save step.
- **Storage** keeps multiple campaign slots under `srq.`-prefixed keys and Zod-validates each campaign on load.

## Save format

Exports are versioned envelopes (`schemaVersion`, `appVersion`, `kind`) validated with Zod on import. Two kinds:

- `campaign-state` — a full campaign snapshot.
- `campaign-recipe` — a shareable setup (seed + options) only.

## Deployment

Pushes to `main` build and deploy to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

> [!IMPORTANT]
> The app is served from a subpath, so `vite.config.ts` sets `base` to `/space-rig-quartermaster/` for production builds only. Hash routing is used so deep links work without server-side rewrites.
