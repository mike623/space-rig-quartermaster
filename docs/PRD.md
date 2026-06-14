# Product Requirements Document: Space Rig Quartermaster

## 1. Product Summary

**Space Rig Quartermaster** is a mobile-first companion web app for *Deep Rock Galactic: The Board Game* players using the **Space Rig Expansion**, with optional house-rule economy layers inspired by deeper campaign play.

The app helps players save campaign state, track dwarf condition between missions, run a between-mission economy phase, generate randomized assignments, and share campaign states or campaign recipes with other groups.

The app is **not** a replacement for the physical board game. It is a helper that reduces bookkeeping and forgotten rules while preserving table play.

## 2. Goals

1. Let players save and resume a Space Rig campaign/assignment across sessions.
2. Track dwarf/character state between missions, including HP, ammo, gear, upgrades, and left-behind status.
3. Add an optional economy layer where Gold/Nitra are spent at the rig on healing, reloads, beer, upgrades, and mission intel.
4. Support campaign randomization with balanced seeded assignments.
5. Support sharing campaign state and campaign recipes via export/import, links, or QR codes.
6. Keep the UI fast, mobile-friendly, offline-capable, and table-friendly.

## 3. Non-Goals

1. Do not reproduce copyrighted rulebooks, card text, artwork, or proprietary assets.
2. Do not require a user account for the MVP.
3. Do not enforce every official rule automatically; the app should assist, not replace player judgment.
4. Do not require a backend for MVP.
5. Do not implement real-time multiplayer sync in v1.

## 4. Target Users

### Primary User
A board game group playing *Deep Rock Galactic: The Board Game* with the Space Rig Expansion who wants campaign continuity and a more meaningful between-mission economy.

### Secondary Users
- Solo players running multi-mission campaigns.
- Groups creating custom seeded challenges.
- Players sharing house-rule campaign recipes on BGG, Discord, Reddit, or chat.

## 5. Key Concepts

### Campaign State
The current saved state of a running campaign: dwarves, resources, current mission, mission history, modifiers, and house-rule settings.

### Campaign Recipe
A reusable scenario definition without current HP/ammo/progression. Includes generated mission list, seed, difficulty, house rules, and enabled expansions. Useful for sharing a challenge from scratch.

### Economy Layer
An optional house-rule rig phase where collected Gold and Nitra can be spent before launching the next mission. Unspent resources are confiscated by Management.

### Character State
Per-dwarf condition and build: HP, ammo, weapons, upgrades, overclocks, grenades, Rock N Stone cards, left-behind status, and Space Rig progression.

## 6. Product Modes

### 6.1 Official Assistant Mode
For players who want minimal house rules.

Features:
- Campaign save/load.
- Dwarf state tracking.
- Mission log.
- Official expansion/component toggles.
- Optional random assignment generation using only selected components.

### 6.2 Economy Campaign Mode
Recommended house-rule mode.

Features:
- Dwarves carry HP/ammo/items between missions.
- Gold/Nitra tracked after missions.
- Rig shop spending.
- Unspent Gold/Nitra lost at launch.
- Left-behind penalty.
- Management report.

### 6.3 Deeper Dive Hardcore Mode
Harsher fan-campaign style.

Features:
- Optional no starting secondary.
- Optional no starting grenade.
- Dynamic swarm level.
- Harsher left-behind reset.
- Increased resource pressure.

## 7. MVP Scope

### Must Have
1. Create campaign.
2. Add 1–4 dwarf characters.
3. Save campaign automatically in browser storage.
4. Export/import campaign JSON.
5. Track dwarf HP, weapons, ammo, grenades, Rock N Stone cards, upgrades, overclocks, and left-behind status.
6. Enter end-of-mission Gold/Nitra and mission result.
7. Split Gold and track team pool.
8. Run rig shop spending with configurable costs.
9. Confiscate unspent Gold/Nitra when launching the next mission.
10. Maintain mission history and management reports.
11. Generate a simple seeded campaign recipe.
12. Export/import campaign recipe JSON.

### Should Have
1. QR code for campaign export/share.
2. Seeded random assignment generator with difficulty presets.
3. Character templates for Scout, Engineer, Gunner, and Driller.
4. Rules reminder notes for active modifiers, written as user-authored/custom notes rather than copied official card text.
5. Print-friendly campaign sheet.

### Could Have
1. Shareable compressed URL state.
2. Live table mode with host and read-only viewers.
3. PWA install/offline support.
4. Score/rating summary at campaign end.
5. Custom shop/rule editor.

## 8. Functional Requirements

## 8.1 Campaign Creation

Users can create a new campaign with:
- Campaign name.
- Mode: Official Assistant, Economy Campaign, Deeper Dive Hardcore.
- Player count: 1–4.
- Enabled content:
  - Base game.
  - Space Rig Expansion.
  - Biome Expansion.
  - Other expansions/custom content toggle.
- Difficulty preset:
  - Greenbeard.
  - Regular.
  - Hazard 4.
  - Hazard 5.
  - Management Hates You.
- Optional seed.

Acceptance criteria:
- A new campaign can be created in under 2 minutes.
- The campaign appears in local save slots.
- Reloading the page preserves the campaign.

## 8.2 Character Setup and Saving

Each campaign stores 1–4 dwarf records.

Character fields:
- `id`
- `playerName`
- `dwarfClass`: Scout, Engineer, Gunner, Driller, Custom
- `nickname`
- `active`
- `maxHp`
- `hp`
- `escapedLastMission`
- `leftBehindLastMission`
- `personalGold`
- `rockNStoneCards`
- `grenades`
- `weapons`
- `uninstalledUpgrades`
- `notes`

Weapon fields:
- `id`
- `name`
- `slot`: primary, secondary, other
- `equipped`
- `active`
- `ammo`
- `maxAmmo`
- `overclocked`
- `upgrades`

Acceptance criteria:
- Users can update HP and ammo with large +/- controls.
- Users can add/edit/remove weapons.
- Upgrades attach to weapons, not just character slots.
- Left-behind status can be toggled after a mission.
- Character state survives page refresh and export/import.

## 8.3 End Mission Flow

The app provides an End Mission screen where users enter:
- Mission number/name.
- Mission type.
- Mission success/failure.
- Primary objective completed.
- Secondary objective completed.
- Gold collected.
- Nitra collected.
- Dwarves escaped/left behind.
- Active warning/anomaly/biome names.
- Notes.

The app calculates:
- Even Gold split.
- Leftover Gold.
- Team Gold pool.
- Team Nitra pool.
- Left-behind penalties to apply.

Acceptance criteria:
- Gold split calculation is visible and editable.
- Nitra is stored as a team resource by default.
- Users can override the split manually.
- A mission log entry is created.

## 8.4 Rig Shop / Economy Phase

In Economy Campaign Mode, users spend resources before the next mission.

Default shop menu:

### Nitra
- 1 Nitra: restore 1 ammo to any weapon.

### 1 Gold
- Fully heal one dwarf.
- Fully reload one weapon.
- Buy grenade / record a grenade gained.
- Buy beer / record active beer.
- Install first upgrade on a weapon.
- Optional: overclock one secondary.

### 2 Gold
- Install second upgrade on a weapon.
- Gain Rock N Stone card.
- Reveal all `?` tokens.
- Gain an upgrade token.

### 3 Gold
- Beer round for team.
- Reveal hidden map sections.
- Redraw/remove one Warning.

All shop entries should be configurable.

Acceptance criteria:
- Spending updates Gold/Nitra immediately.
- The app prevents spending more than available unless override is enabled.
- Spending appears in the management report.
- Shop rules can be edited or disabled per campaign.

## 8.5 Launch Next Mission

Before launching the next mission, the app shows a checklist:
- Dwarf HP/ammo summary.
- Active gear/upgrades.
- Active beer or temporary effects.
- Current resources.
- Active mission modifiers.
- Resources that will be confiscated.

On confirmation:
- Unspent Gold is set to 0 if `loseUnspentGold` is enabled.
- Unspent Nitra is set to 0 if `loseUnspentNitra` is enabled.
- A Management confiscation entry is added to the log.
- Campaign advances to the next mission.

Acceptance criteria:
- Users must confirm before resource confiscation.
- The app clearly shows what will be lost.
- The action can be undone until another mission result is recorded.

## 8.6 Left-Behind Penalties

The app supports configurable penalties.

### Soft Penalty Default
- Left-behind dwarf returns to full HP.
- Equipped weapons fully reloaded.
- Lose grenades.
- Lose Rock N Stone cards.
- Lose uninstalled upgrades.
- Keep permanent Space Rig progression.

### Harsh Penalty
- All Soft penalties.
- Lose overclocked state.
- Lose non-equipped extra weapons.
- Lose personal Gold before spending.

### Custom Penalty
Users can toggle each penalty individually.

Acceptance criteria:
- Penalty preview appears before applying.
- Applied penalties are logged.
- Users can undo penalty application during the same rig phase.

## 8.7 Campaign Saving

The app saves:
- All campaign settings.
- All character settings/state.
- Current resources.
- Current mission.
- Mission history.
- House rules.
- Randomization seed and generated recipe.

Acceptance criteria:
- Auto-save happens after every change.
- Manual save slot can be renamed.
- Export creates valid JSON.
- Import restores campaign exactly.
- App version and schema version are included.

## 8.8 Campaign Sharing

The app supports two share types.

### Share Campaign State
Includes everything needed to continue a campaign:
- Character HP/ammo/builds.
- Resources.
- Mission progress.
- History.

### Share Campaign Recipe
Includes only the setup/challenge:
- Seed.
- Mission list.
- Difficulty.
- Enabled expansions.
- House rules.

Acceptance criteria:
- Users can export state JSON.
- Users can export recipe JSON.
- Import validates schema and warns before overwrite.
- QR/link sharing is optional but should be designed for future support.

## 8.9 Campaign Randomization

The app can generate campaigns from a seed.

Inputs:
- Assignment length: 3, 5, 7, endless.
- Difficulty preset.
- Enabled mission types.
- Enabled warnings.
- Enabled anomalies.
- Enabled biomes.
- Reward density.

Output:
- Ordered mission list.
- Modifiers per mission.
- Reward suggestions.
- Seed used.

Smart randomization rules:
- Avoid hardest combinations in Mission 1 unless high difficulty.
- Avoid repeated warnings unless enabled.
- Avoid stacking too many movement-punishing modifiers.
- Escalate difficulty toward the final mission.
- Allow manual reroll/edit per mission.

Acceptance criteria:
- Same seed/settings always produce same recipe.
- Generated recipe can be saved and shared.
- Users can manually edit generated missions.

## 8.10 Management Report

After each mission and rig phase, generate a thematic report.

Report fields:
- Mission result.
- Gold recovered.
- Nitra recovered.
- Dwarves escaped/left behind.
- Spending summary.
- Confiscated resources.
- Penalties applied.
- Notes.
- Optional flavour line.

Acceptance criteria:
- Report is shown on screen.
- Report is saved in mission history.
- Report can be copied as text.

## 9. Data Model Draft

```json
{
  "schemaVersion": 1,
  "appVersion": "0.1.0",
  "campaign": {
    "id": "campaign_123",
    "name": "Management Takes Its Cut",
    "mode": "economy",
    "seed": "ROCK-AND-STONE-42",
    "difficulty": "hazard4",
    "currentMissionIndex": 1,
    "enabledContent": {
      "baseGame": true,
      "spaceRig": true,
      "biomeExpansion": false,
      "customContent": true
    },
    "resources": {
      "teamGold": 0,
      "teamNitra": 0
    },
    "houseRules": {
      "carryHpAmmo": true,
      "loseUnspentGold": true,
      "loseUnspentNitra": true,
      "leftBehindPenalty": "soft",
      "dynamicSwarm": false
    },
    "players": [],
    "missions": [],
    "history": []
  }
}
```

## 10. UX Requirements

1. Mobile-first layout.
2. Large controls usable at a game table.
3. Dark, high-contrast UI.
4. Clear phase navigation:
   - Campaign
   - Mission
   - End Mission
   - Rig Shop
   - Launch
   - History
5. No account required for MVP.
6. Works offline once loaded.
7. Copy/export buttons available on every major summary.
8. Avoid copyrighted images/assets unless user supplies them locally and legally.

## 11. Technical Recommendations

Preferred stack:
- Next.js or Vite + React.
- TypeScript.
- Local-first persistence using IndexedDB or localStorage for MVP.
- Zod or similar schema validation for imports.
- Deterministic PRNG for seeded randomization.
- Optional PWA plugin.

Suggested project structure:

```text
src/
  app/ or pages/
  components/
  domain/
    campaign.ts
    character.ts
    economy.ts
    randomizer.ts
    sharing.ts
  storage/
  fixtures/
  tests/
docs/
  PRD.md
  RULES.md
```

## 12. Risks and Open Questions

1. Exact official Space Rig rules should not be copied verbatim into the app.
2. Need decide whether default resources are personal, team-only, or hybrid.
3. Need decide whether beer/grenade/card names are free-text or preloaded user-created lists.
4. Need avoid over-automation that slows table play.
5. Need decide if live multiplayer sync is worth backend complexity.
6. Need clarify whether the app should support multiple campaigns at once in MVP or immediately after.

## 13. Initial Implementation Plan

### Milestone 1: Repo + PRD + Skeleton
- Create app scaffold.
- Add PRD.
- Add basic domain types.
- Add local save/load.

### Milestone 2: Character and Campaign State
- Campaign creation.
- Character setup.
- HP/ammo/weapon tracking.
- Auto-save.
- Export/import state.

### Milestone 3: Economy Phase
- End mission form.
- Gold split.
- Rig shop.
- Launch next mission.
- Management report.

### Milestone 4: Randomizer and Recipe Sharing
- Seeded generator.
- Difficulty presets.
- Export/import recipe.

### Milestone 5: Polish
- PWA/offline.
- QR sharing.
- Print summary.
- Better mobile UI.

## 14. MVP Acceptance Test

A user can:
1. Create a 4-player Economy Campaign.
2. Set up Scout, Engineer, Gunner, and Driller.
3. Complete Mission 1 and enter 9 Gold, 4 Nitra, with Driller left behind.
4. App splits Gold, applies Driller penalty preview, and opens Rig Shop.
5. Team spends Gold/Nitra to heal, reload, and buy beer.
6. App generates a Management report.
7. User launches Mission 2 and confirms unspent resource confiscation.
8. User closes browser, reopens app, and campaign state is preserved.
9. User exports JSON and imports it in another browser/device.
10. User generates a seeded 5-mission recipe and exports it separately from current campaign state.
