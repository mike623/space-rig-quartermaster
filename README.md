# Space Rig Quartermaster

Mobile-first, local-first companion web app for *Deep Rock Galactic: The Board
Game* Space Rig campaigns, with an optional house-rule economy layer.

> Companion tool only — **no official rulebook/card text, artwork, or
> proprietary assets**. All item names are generic placeholders you can edit.
> See [`docs/RULES.md`](docs/RULES.md) and [`docs/PRD.md`](docs/PRD.md).

## Stack

- Vite + React + TypeScript
- Zustand (state) · Zod (import validation) · React Router (hash routing)
- `localStorage` persistence (multi-campaign slots), auto-save on every change
- `vite-plugin-pwa` (installable / offline)

## Commands

```bash
npm install      # install deps
npm run dev      # start dev server (http://localhost:5173)
npm run build    # typecheck (tsc -b) + production build
npm run test     # run vitest domain tests
npm run preview  # preview the production build
```

## Structure

```
src/
  domain/      campaign, character, economy, randomizer, report, sharing,
               catalog, prng, schema (+ *.test.ts)
  storage/     localStorage save/load + slot index
  state/       zustand store wiring domain -> UI + autosave
  components/  Stepper, CatalogEditor
  screens/     Home, CampaignSetup, Characters, EndMission, RigShop,
               Launch, History
docs/          PRD.md, RULES.md
```

## Save format

Exports are versioned envelopes (`schemaVersion`, `appVersion`, `kind`) and
validated with Zod on import. Two kinds: full `campaign-state` and
share-only `campaign-recipe`.
