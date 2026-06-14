# Space Rig Quartermaster UI

_Started 2026-06-14 15:55 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "DRG - space rig HQ"
Project is currently empty (no files)
Current date is now June 14, 2026
</system-info>

<default aesthetic_system_instructions>
The user has not attached a design system. If they have ALSO not attached references or art direction, and the project is empty, you must ASK the user what visual aesthetic they want. Use the questions_v2 tool to ask about preferred vibe, audience, colors, type, mood, etc. Do NOT just pick your own visual aesthetic without getting the user's aesthetic input -- this is how you get slop!

Once answered, use this guidance when creating designs:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic_system_instructions>

<pasted_text name="Pasted text (77 lines)">
PROJECT: Space Rig Quartermaster — visual + interaction design pass

CONTEXT
A mobile-first, local-first PWA companion for a co-op sci-fi mining board game
campaign (generic/original theming — this is NOT an official product). It tracks
campaign state, dwarf condition between missions, and an optional "rig economy"
where teams spend Gold/Nitra before launching the next mission. It is used AT A
TABLE, mid-game, often passed between 1–4 players. It is a bookkeeping reducer,
not a rules replacement. Implementation already exists in React + TypeScript;
this is a design layer over working screens, not a rebuild.

HARD CONSTRAINTS (do not violate)
- NO official/copyrighted art, logos, card text, weapon/character names, or
  fonts from any real board game or video game. All names are generic and
  user-editable. Use original iconography only.
- Mobile-first, single-column, max content width ~720px; must work one-handed.
- Dark, high-contrast theme (low-light tabletop). Current tokens to refine:
  bg #0f1115, surface #181b22, border #2c313c, text #f2f4f8, accent amber
  #ffb000 (Gold), blue #4aa3ff (Nitra), danger #ff5d5d, ok #4ade80.
- Touch targets &gt;= 44px. Steppers (+/-) are used constantly and must be big,
  fast, and thumb-reachable. Assume gloves/dim light/quick glances.
- Offline-capable PWA; no loading spinners for data (everything is local/instant).
- Accessible: WCAG AA contrast, visible focus, screen-reader labels on icon
  buttons, no color-only state (pair with icon/text).

USERS &amp; MINDSET
Board gamers mid-session. They want: glanceable dwarf status, fast HP/ammo edits,
a clear "what will I lose if I launch?" moment, and a satisfying management/economy
loop. Slightly gritty, industrial, blue-collar-in-space tone — wry corporate
"Management takes its cut" humor. Avoid sterile SaaS look; avoid cute/childish.

SCREENS TO DESIGN (routes already built; keep this IA)
1. Home — list of saved campaigns (name, mode, last-played), Open/Delete,
   "New Campaign", "Import JSON".
2. Campaign Setup — name, mode (Official / Economy / Deeper Dive), player count
   1–4, difficulty preset, seed (with reroll), per-slot role picker.
3. Dwarves (primary screen) — 1–4 character cards: editable nickname/player,
   HP bar + stepper, max-HP, grenades, cards, upgrade tokens, personal Gold,
   weapons list (name, slot, ammo/max steppers, equipped/overclock toggles,
   upgrade chips), active beer/temporary-effect chips, notes, left-behind &amp;
   active toggles. Team Gold/Nitra summary on top.
4. End Mission — success/fail, primary/secondary objective toggles, Gold/Nitra
   steppers, "who escaped vs left behind" picker, live Gold-split preview,
   left-behind penalty preview, notes → produces a "Management Report".
5. Rig Shop — Team Gold/Nitra header; target selectors (dwarf, then weapon);
   list of purchasable items each showing cost (Gold/Nitra) + effect note +
   buy button; edit mode to add/configure items; recent-spending log.
6. Launch — readiness checklist (per-dwarf HP/ammo/grenades), current resources,
   next mission preview (type/biome/warnings as tags), prominent "resources to
   be confiscated" warning, two-step confirm.
7. History — export campaign-state JSON / recipe JSON, recipe mission list with
   current-mission marker, editable item catalog, scrollable mission log with
   copyable management reports.

KEY INTERACTION MOMENTS TO ELEVATE
- The Stepper component (HP, ammo, counts) — make it the signature control.
- "Launch confiscation" — the emotional beat; make the loss feel deliberate and
  weighty without being alarming-error styling.
- Management Report — give it a printed-dispatch / receipt personality.
- Resource identity — Gold (amber) vs Nitra (blue) must be instantly distinct
  everywhere (icon + color + label).

DELIVERABLES
- Refined design tokens (color, type scale, spacing, radius, elevation, motion).
- One original icon set (nav: Dwarves/End/Shop/Launch/History + resource +
  weapon-slot + status icons).
- Hi-fi mockups of all 7 screens at 390px width, plus the Dwarf card and Stepper
  in all states (default, low-HP, disabled bounds, focus).
- Bottom-nav + header treatment; empty states; toast/banner styles
  (ok/warn/err); confirm-dialog pattern.
- Notes on motion (subtle, fast, &lt;150ms; respect prefers-reduced-motion) and
  print stylesheet for the campaign sheet.
- A short rationale tying the visual language to "industrial space mining crew."

OUT OF SCOPE
Backend, auth, multiplayer, real game assets. Keep it a single-player-device,
pass-the-phone table tool.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design.

Follow this general design process (use the todo list to remember):
(1) ask questions, (2) find existing UI kits and collect design context — copy ALL relevant components and read ALL relevant examples; ask the user if you can't find them, (3) start your file with assumptions + context + design reasoning (as if you are a junior designer and the user is your manager), with placeholders for the designs, and show it to the user early, (4) build out the designs and show the user again ASAP; append some next steps, (5) use your tools to check, verify and iterate on the design.

Good hi-fi designs do not start from scratch — they are rooted in existing design context. Ask the user to Import their codebase, or find a suitable UI kit / design resources, or ask for screenshots of existing UI. You MUST spend time trying to acquire design context, including components. If you cannot find them, ask the user for them. In the Import menu, they can link a local codebase, provide screenshots or Figma links; they can also link another project. Mocking a full product from scratch is a LAST RESORT and will lead to poor design. If stuck, try listing design assets and ls'ing design system files — be proactive! Some designs may need multiple design systems — get them all. Use the starter components (device frames and the like) to get high-quality scaffolding for free.

When presenting several options or explorations side-by-side, lay them out clearly: give the page a neutral gray background, put each option in its own labeled frame (a small heading + a white rounded card sized to its content), and group related options into sections.

When designing, asking many good questions is ESSENTIAL.

Give options: try to give 3+ variations across several dimensions. Mix by-the-book designs that match existing patterns with new and novel interactions, including interesting layouts, metaphors, and visual styles. Have some options that use color or advanced CSS; some with iconography and some without. Start your variations basic and get more advanced and creative as you go! Try remixing the brand assets and visual DNA in interesting ways — play with scale, fills, texture, visual rhythm, layering, novel layouts, type treatments. The goal is not the perfect option; it's exploring atomic variations the user can mix and match.

CSS, HTML, JS and SVG are amazing. Users often don't know what they can do. Surprise the user.

If you do not have an icon, asset or component, draw a placeholder: in hi-fi design, a placeholder is better than a bad attempt at the real thing.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>

<attached-skill name="Design Components">
This project uses Design Components: every design is a single streaming `Name.dc.html` file. The full authoring spec is in your system prompt under "Writing code — Design Components" — follow it. Author and edit `.dc.html` content with the `dc_write`, `dc_html_str_replace`, and `dc_js_str_replace` tools (not `write_file`; `str_replace_edit` works but won't stream); template edits stream into the live preview as you type.
</attached-skill>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

This is a meaty, well-specified brief — thank you. Before I start designing, I want to lock a few things down so I build the right thing. The most important one: this is described as a *design layer over working screens*, and good hi-fi work starts from real context, not a vacuum.

_[tool: questions_v2]_

## User

Questions answered:
- scope_first_pass: All 7 screens at lower polish, then iterate
- variation_count: Just one — follow my tokens closely
- variation_focus: Layout & information density of the Dwarf card, The Stepper control's form and feedback, Motion & interaction feel
- grit_level: 1
- icon_style: 2
- existing_context: https://github.com/mike623/space-rig-quartermaster
- type_pairing: Industrial: condensed/grotesk display + clean sans body
- humor_dial: 7
- deliverable_format: Clickable interactive prototype (real steppers, navigation)

## Assistant

Got it — clean dark UI (minimal grit), solid icons, condensed display + clean sans, loud-ish wry corporate voice, single direction following your tokens, all 7 screens, interactive prototype. And you gave me the repo — let me pull the real screens so I design against actual state and IA, not guesses.The GitHub tools aren't connected yet. Since the repo is public, let me try reading it directly first.This is a Deep Rock Galactic board-game companion — I'll keep everything original/generic per your brief and the repo's own disclaimer (no official names, art, or fonts). Let me ground myself in the two docs that cover the parts your brief specifies least: the economy math and the report format.I've got what I need — the PRD confirms the full data model (character/weapon fields, modes, economy math, report fields) and matches your brief. I'll keep everything original/generic per the repo's own disclaimer and your hard constraints (no official names, art, or fonts): roles, weapons, cards, and "overclock" become editable generic terms ("Overdrive," "Rally Cards," etc.), while I keep your specified Gold/Nitra resource identity and tokens.

Here's my plan and the system I'm committing to before building:

_[tool: update_todos]_

_[tool: tool_search_tool_bm25]_

_[tool: web_fetch]_

_[tool: web_fetch]_

Now building. First the signature Stepper as a child component, then the app shell with the Dwarves screen.

_[tool: dc_write]_

_[tool: dc_write]_

I noticed a typo in the role chip markup (`#1c2views`). Let me fix it and preview.

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: show_html]_

Rendering cleanly. Let me inspect more states — full dwarf card, the critical-HP dwarf, bottom nav, and the Home screen.

_[tool: multi_screenshot]_

The app works — Home navigation, steppers, resource header all render. The screenshot tool can't capture the inner scroll (it re-renders from top), so let me verify scroll + the critical-HP dwarf programmatically, and confirm that `@Mara` isn't actually overlapping.

_[tool: eval_js]_

The view had navigated to Home. Let me switch back to Crew and check overlap + scroll there.

_[tool: eval_js]_

_[tool: eval_js]_

Scroll works (28 steppers, content 3216px tall), `@Mara` sits 8px clear of the nickname — the screenshot "overlap" is just an html-to-image artifact. Solid foundation.

Now the economy screens. Let me wire in the logic (state, mutations for End Mission / Shop / Launch / Report), starting with data + methods.

_[tool: dc_js_str_replace]_

Now the methods for the economy flows:

_[tool: dc_js_str_replace]_

I have a paren typo in `adjEnd`. Let me fix it.

_[tool: dc_js_str_replace]_

Now the End Mission and Report view-models in `renderVals`:

_[tool: dc_js_str_replace]_

Update the stub map and expose the End + Report values:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the End Mission screen template and the Management Report overlay:

_[tool: dc_html_str_replace]_

Now the Management Report overlay (the receipt). Inserting before the toast:

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

End Mission works — Success/Failure, objectives, gold-split preview all render, and filing the report banked resources (Gold 9→18, Nitra 4→8) and popped the Management Report receipt. 

Now the Rig Shop. Adding its view-model:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: grep]_

_[tool: str_replace_edit]_

Now expose the Shop values in the return object and add the Shop template:

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

Now the Launch screen view-model (readiness + confiscation):

_[tool: dc_js_str_replace]_

_[tool: str_replace_edit]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

I referenced `isLaunchStep0` — need to expose it. Let me add it:

_[tool: dc_js_str_replace]_

Now History + Setup. First the setup state and the methods:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the History + Setup view-models:

_[tool: dc_js_str_replace]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: dc_js_str_replace]_

Now the History and Setup templates, replacing the stub block:

_[tool: dc_html_str_replace]_

All 7 screens are built. Let me check for console errors and capture each screen.

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

Let me capture the screens individually with safer navigation.

_[tool: save_screenshot]_

The Management Report overlay is lingering across navigation (it stays modal until dismissed) — switching screens should dismiss it. Let me fix `nav()` to clear it, then re-capture from a fresh load.

_[tool: dc_js_str_replace]_

_[tool: show_html]_

_[tool: save_screenshot]_

Shop, Launch, and History all look great. Setup didn't render in time (the New Campaign click fired before Home re-rendered). Let me capture Setup and the Launch confirmation step with proper sequencing.

_[tool: save_screenshot]_

Setup renders well (Economy mode selected). The pixel capture won't show scrolled content, so let me functionally verify the Launch two-step confiscation and the buy flow via the DOM.

_[tool: eval_js]_

Everything functions: Shop buy ("Reload Cell → Lowlight"), and the Launch two-step confiscation zeroed the vault (Gold/Nitra → 0/0) and popped the Confiscation Notice. One small chrome nit — the studio title wraps and overlaps the subtitle. Quick fix:

_[tool: dc_html_str_replace]_

_[tool: update_todos]_

The full prototype is built and verified. Handing it off:

_[tool: done]_

Delivered — a working, clickable prototype of all 7 screens in `Space Rig Quartermaster.dc.html`.

**The system I committed to**
- **Type:** Saira Condensed (condensed grotesk) for display/numbers, IBM Plex Sans for body, IBM Plex Mono for codes/labels/the receipt — industrial, glanceable in dim light.
- **Color:** your tokens, refined. Gold (amber) vs Nitra (blue) are always icon + color + label, never color alone. Status uses icon+text+color (Active ✓, Left Behind ▲, Critical ▲).
- **Signature Stepper** is its own component: 58px (HP) / 46px (counts) targets, tabular numerals, integrated HP bar that shifts green→amber→red, disabled-at-bounds (dimmed + `disabled`), amber focus ring, <100ms press feedback. Reused ~30× across screens.
- **Motion:** all transitions <150ms; a `prefers-reduced-motion` block kills animation.

**What works (real state, no mocks)**
- **Crew:** edit HP/ammo/grenades/cards/tokens/personal gold live; equip/overdrive toggles; left-behind & on-duty states restyle the card.
- **End Mission:** Success/Fail, objectives, Gold/Nitra entry, **live gold-split preview**, soft-penalty preview → files a **Management Report** receipt (perforated dispatch, wry corporate flavour, copy-to-clipboard).
- **Rig Shop:** target picker, tiered catalog, affordability-aware Buy, recent-spend log.
- **Launch:** next-mission preview, crew readiness, and the **two-step confiscation confirm** that zeroes the vault and issues a Confiscation Notice.
- **History / Home / Setup:** mission log (tap to reopen reports), recipe list with current marker, JSON export, campaign list, and an interactive setup form (mode/count/difficulty/seed reroll/role cycling).

**Caveats / honoring constraints:** everything is generic & original per your brief — roles, weapons, "Overdrive," "Rally Cards" are all editable placeholders (no official names/art/fonts). A few demo-only stubs toast instead of acting (catalog item editing, free-text name entry). Background verifier is running.

Want me to take a next pass on **densifying the Dwarf card** (it's tall — I can add a collapsed/expanded mode), wire up **inline text editing** for names/notes, or add the **print stylesheet** for the campaign sheet?

