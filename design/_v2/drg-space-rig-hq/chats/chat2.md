# Character status semantics

_Started 2026-06-14 20:31 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "DRG - space rig HQ"
Project currently has 4 file(s)
User is viewing file: Space Rig Quartermaster.dc.html
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

<pasted_text name="Pasted text (21 lines)">
Design implementation summary — for designer feedback
Source: design/drg-space-rig-hq handoff. Recreated 1:1 in the live React app (logic untouched). Verified: tsc+vite build clean, 38 tests pass. Visual/browser render not yet confirmed (build ≠ pixels).
What was implemented faithfully
	•	Type system: Saira Condensed (display/numerals), IBM Plex Sans (body), IBM Plex Mono (labels/receipt).
	•	Tokens: dark radial bg, surfaces, Gold #ffb000 / Nitra #4aa3ff identity (always icon+color+label), danger/ok + soft variants.
	•	Signature Stepper: 58/46px targets, tabular numerals, integrated HP bar (green→amber→red at 50/25%), disabled-at-bounds, amber focus ring, press-scale.
	•	Shell: header (home btn, name, mode chip, mission counter, Gold/Nitra pills) + 5-tab bottom nav (Crew/End/Shop/Launch/Log) with active indicator bar.
	•	Signature moments: Management Report receipt bottom-sheet (perforated edge, dashed dividers, “ROCK &amp; STONE”), inline 2-step Launch confiscation, toast.
	•	All 7 screens + generic relabels (Integrity, Rally Cards, Overdrive, Brew, Surveyor).
Deviations from the mockup (designer should weigh in)
	1.	Numbers re-scaled to the real board game. Mockup used video-game values (HP 9–12, ammo 80/120). Shipped: HP 5, ammo 5/5. Steppers now span 0–5, not 0–120 — changes the visual weight of every stepper/HP bar. Designer impact: bars sit “fuller”, fewer digits.
	2.	Editable-in-place vs static. Mockup shows static text (nickname, player, weapon name, notes). Real app makes them inline-editable inputs — slightly different affordance/borders than the mockup’s display text.
	3.	Home screen lacks the mockup’s “Resume vs Open” + “Mission 3 of 5 · last played” line — my saved-campaign metadata only has updatedAt. Currently shows timestamp + mode only.
	4.	Weapon upgrade chips (“Mod I/II”) are free-text tags with ✕-to-remove rather than the static labeled chips in the mockup.
	5.	Status semantics: “Benched/On Duty” + “Left Behind” driven by real toggles; “Critical” from live HP ≤25%.
Open design questions to send back
	•	Stepper at 0–5 scale: keep the HP bar, or is a 5-pip/segment indicator clearer at small ranges?
	•	Inline-edit styling: want a dedicated “edit” affordance (pencil) vs always-editable fields?
	•	Home card: add richer metadata (mission progress, resume state)? Needs a small data-model add.
	•	Report receipt: mockup flavour lines lean humor-7; confirm tone is right at the table.
	•	Any screen need a collapsed/expanded dwarf card? (cards are tall with 4 weapons.)
</pasted_text>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: list_files]_

Thanks — this is a clean handoff. Here's my designer feedback, point by point, plus rulings on the open questions so you're unblocked.

## On the deviations

**1. 0–5 stepper scale — accept, with one change.** Shipping the real board-game values is correct; the prototype's 80/120 ammo was video-game cosplay. But at a 0–5 range the continuous HP *bar* loses its job — a thin fill that only ever shows 6 states reads as imprecise and slightly broken. **Switch the small-range steppers to discrete pips/segments** (see ruling below). Keep the green→amber→red semantics, just express them as filled vs empty pips.

**2. Inline-editable vs static — accept the editability, fix the affordance.** Always-on input borders on every field make the card noisy and shift it toward "form" when it should read as "dashboard." Keep them editable, but style them as display text by default and only reveal the input chrome (border/bg) on `:hover`/`:focus`. No pencil icons — see below.

**3. Home card metadata — accept the gap for now.** Timestamp + mode is a fine v1. The "Mission 3 of 5 · Resume" line is worth the small data-model add, but it's a fast-follow, not a launch blocker. Don't fake it from `updatedAt`.

**4. Weapon mod chips as free-text tags — accept.** Editable tags are *better* than my static labels for a tabletop tool; people house-rule constantly. Keep the ✕-to-remove.

**5. Status semantics from real toggles — accept, no notes.** Driving Critical from live HP ≤25% is exactly right.

## Rulings on the open questions

- **Stepper at 0–5:** **Pips, not a bar.** Five segments, fill left-to-right, color-shift on the fill at the 50%/25% thresholds. Clearer at a glance and it makes the tabletop "I have 3 left" read instant.
- **Inline-edit styling:** **No pencil.** Always-editable with a quiet hover/focus reveal. A dedicated edit mode adds a tap for the most common action (correcting a number mid-game).
- **Home card metadata:** **Yes, eventually** — add mission progress + resume state when the data model can carry it. Not now.
- **Report receipt tone:** Keep it dry/deadpan, dial the humor to ~5, not 7. It should feel like a passive-aggressive corporate memo, which is funnier than jokes.
- **Collapsed/expanded dwarf card:** **Yes — add a collapsed state.** Four weapons makes these very tall; default to a compact card (name, status, HP pips, ammo summary) that expands to the full loadout. Worth a real spec.

## One thing to flag back ⚠️

The receipt still says **"ROCK & STONE"** — that's a lift from a specific published game, and everything else was already relabeled to generic terms (Integrity, Rally Cards, Overdrive…). To stay consistent and clean, swap it for an original crew chant. I'd go with something like **"DIG DEEP"** or **"DEPTHS & DIVIDENDS"** as the receipt sign-off.

---

Want me to **mock up the pip-stepper** (next to the current bar, side by side) and the **collapsed dwarf card** so you've got a visual spec to build against rather than just this prose? Those two are the only changes here that really need pixels — I can add them to the prototype without touching anything else.

## User

Status semantics — full breakdown of CharacterCard (in CharactersScreen.tsx):
Driven by 3 real persisted fields (autosaved, in JSON export — not display-only):
	•	active (boolean)
	•	leftBehindLastMission (boolean)
	•	hp / maxHp → pct = hp/maxHp
Status chip — single value, precedence order:
	1.	leftBehindLastMission → “Left Behind” — red, warning-triangle icon, card gets red inset left-border + reddish border.
	2.	else !active → “Benched” — grey dot, card dims (bg darker, opacity 0.7).
	3.	else → “Active” — green check.
So precedence is Left Behind > Benched > Active. A left-behind dwarf shows Left Behind even if also benched.
“Critical” is separate, not part of the chip:
	•	critical = pct <= 0.25, rendered next to the Integrity label (red “⚠ CRITICAL”).
	•	Independent → a dwarf can be Active + Critical at once. Purely a live read of HP; no toggle, no persistence.
Toggles (card footer) write the booleans directly:
	•	“Mark Left Behind” / “Left Behind” → flips leftBehindLastMission.
	•	“On Duty” / “Benched” → flips active.
Set elsewhere too (not just manual):
	•	End Mission: recording a result sets leftBehindLastMission=true on every active non-escaped dwarf (+ applies the penalty).
	•	active filters everywhere: crew count, End-Mission escapee list, Launch readiness, Rig Shop targets — benched dwarves drop out.
	•	Launch readiness reuses the same fields: Ready = pct>0.25 && !lowAmmo && !leftBehind, else Check, else Left behind.
⚠ Calibration caveat worth a design call: with maxHp=5, the 25% Critical threshold = hp ≤ 1 (hp2/5 = 0.4, not critical). At the old maxHp 10 it meant hp ≤ 2. So Critical now fires very late. Options: bump threshold to pct <= 0.4 (≈ hp ≤ 2 of 5), or make it absolute (hp <= 1). Same applies to Launch “Check” (pct<=0.25) and the Stepper HP bar color stops (≤25% red, ≤50% amber) — at 0–5 the amber band is just hp=2–3, red is hp≤1. Want me to retune these thresholds for the 5-HP scale?

## Assistant

