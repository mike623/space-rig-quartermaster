// Display label maps. Generic, IP-safe terms adopted from the design handoff.
// Data-model field names and JSON export keys are unchanged — UI text only.

import type { CampaignMode, DwarfClass, WeaponSlot } from "../domain/types";

export const ROLE_LABEL: Record<DwarfClass, string> = {
  scout: "Surveyor",
  engineer: "Engineer",
  gunner: "Gunner",
  driller: "Driller",
  custom: "Custom"
};

/** Roles offered in the setup cycler / pickers, in display order. */
export const ROLE_ORDER: DwarfClass[] = [
  "scout",
  "engineer",
  "gunner",
  "driller",
  "custom"
];

export const MODE_LABEL: Record<CampaignMode, string> = {
  official: "Official",
  economy: "Economy",
  hardcore: "Deeper Dive"
};

export const MODE_SHORT: Record<CampaignMode, string> = {
  official: "Official",
  economy: "Economy",
  hardcore: "Deeper"
};

export function slotLabel(slot: WeaponSlot): string {
  return slot === "other" ? "Support" : slot;
}

// Generic stat/section terms (adopted from the design).
export const TERMS = {
  hp: "Integrity",
  cards: "Rally Cards",
  tokens: "Upgrade Tokens",
  grenades: "Grenades",
  personalGold: "Personal Gold",
  overdrive: "Overdrive",
  brew: "Brew",
  effects: "Effects"
};
