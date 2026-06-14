# Agent Instructions: Space Rig Quartermaster

## Project
Build **Space Rig Quartermaster**, a mobile-first local-first companion web app for Deep Rock Galactic: The Board Game Space Rig campaigns with an optional economy layer.

## Primary product reference
Read `docs/PRD.md` before making product decisions. Treat it as the source of truth for MVP scope.

## Legal/content constraints
- Do not copy official rulebook text, card text, copyrighted images, or proprietary assets.
- Use user-editable/custom names and notes for cards/modifiers where needed.
- The app assists play; it must not replace the official game components or rules.

## Engineering preferences
- Prefer TypeScript.
- Prefer a simple local-first web app.
- Keep UI mobile-first and table-friendly.
- Add tests for domain logic where practical.
- Verify with real commands before reporting completion.

## Initial implementation target
Create an MVP skeleton that can:
1. Create/save a campaign locally.
2. Manage 1–4 dwarf character states.
3. Track HP/ammo/weapons/upgrades/resources.
4. Run an end-mission economy flow.
5. Export/import campaign JSON.

