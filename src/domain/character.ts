// Character/dwarf factories and state mutations.
// All generic class labels; no copyrighted names or stats.

import { newId } from "./ids";
import type {
  Character,
  CustomPenaltyFlags,
  DwarfClass,
  HouseRules,
  Weapon,
  WeaponSlot
} from "./types";

const DEFAULT_MAX_HP = 10;

export interface WeaponTemplate {
  name: string;
  slot: WeaponSlot;
  maxAmmo: number;
}

/** Generic, user-editable starting loadouts per role. */
export const CLASS_TEMPLATES: Record<
  DwarfClass,
  { nickname: string; weapons: WeaponTemplate[] }
> = {
  scout: {
    nickname: "Scout",
    weapons: [
      { name: "Primary Rifle", slot: "primary", maxAmmo: 6 },
      { name: "Sidearm", slot: "secondary", maxAmmo: 4 }
    ]
  },
  engineer: {
    nickname: "Engineer",
    weapons: [
      { name: "Shotgun", slot: "primary", maxAmmo: 5 },
      { name: "Platform Tool", slot: "secondary", maxAmmo: 4 }
    ]
  },
  gunner: {
    nickname: "Gunner",
    weapons: [
      { name: "Heavy Gun", slot: "primary", maxAmmo: 8 },
      { name: "Revolver", slot: "secondary", maxAmmo: 4 }
    ]
  },
  driller: {
    nickname: "Driller",
    weapons: [
      { name: "Flame Weapon", slot: "primary", maxAmmo: 6 },
      { name: "Pistol", slot: "secondary", maxAmmo: 4 }
    ]
  },
  custom: {
    nickname: "Dwarf",
    weapons: [{ name: "Weapon", slot: "primary", maxAmmo: 6 }]
  }
};

export function createWeapon(t: WeaponTemplate): Weapon {
  return {
    id: newId("wpn"),
    name: t.name,
    slot: t.slot,
    equipped: true,
    active: true,
    ammo: t.maxAmmo,
    maxAmmo: t.maxAmmo,
    overclocked: false,
    upgrades: []
  };
}

export interface CreateCharacterOptions {
  playerName?: string;
  dwarfClass?: DwarfClass;
  nickname?: string;
  /** Hardcore mode strips starting secondary/grenade. */
  noStartingSecondary?: boolean;
  noStartingGrenade?: boolean;
}

export function createCharacter(opts: CreateCharacterOptions = {}): Character {
  const dwarfClass = opts.dwarfClass ?? "custom";
  const template = CLASS_TEMPLATES[dwarfClass];
  let weapons = template.weapons.map(createWeapon);
  if (opts.noStartingSecondary) {
    weapons = weapons.filter((w) => w.slot !== "secondary");
  }
  return {
    id: newId("char"),
    playerName: opts.playerName ?? "",
    dwarfClass,
    nickname: opts.nickname ?? template.nickname,
    active: true,
    maxHp: DEFAULT_MAX_HP,
    hp: DEFAULT_MAX_HP,
    escapedLastMission: true,
    leftBehindLastMission: false,
    personalGold: 0,
    rockNStoneCards: 0,
    grenades: opts.noStartingGrenade ? 0 : 1,
    weapons,
    uninstalledUpgrades: 0,
    temporaryEffects: [],
    notes: ""
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function adjustHp(c: Character, delta: number): Character {
  return { ...c, hp: clamp(c.hp + delta, 0, c.maxHp) };
}

export function healToFull(c: Character): Character {
  return { ...c, hp: c.maxHp };
}

export function adjustAmmo(
  c: Character,
  weaponId: string,
  delta: number
): Character {
  return {
    ...c,
    weapons: c.weapons.map((w) =>
      w.id === weaponId
        ? { ...w, ammo: clamp(w.ammo + delta, 0, w.maxAmmo) }
        : w
    )
  };
}

export function reloadWeapon(c: Character, weaponId: string): Character {
  return {
    ...c,
    weapons: c.weapons.map((w) =>
      w.id === weaponId ? { ...w, ammo: w.maxAmmo } : w
    )
  };
}

// --- Left-behind penalties -------------------------------------------------

const SOFT_PENALTY: CustomPenaltyFlags = {
  healToFull: true,
  reloadEquipped: true,
  loseGrenades: true,
  loseRockNStoneCards: true,
  loseUninstalledUpgrades: true,
  loseOverclocks: false,
  loseNonEquippedWeapons: false,
  losePersonalGold: false
};

const HARSH_PENALTY: CustomPenaltyFlags = {
  healToFull: true,
  reloadEquipped: true,
  loseGrenades: true,
  loseRockNStoneCards: true,
  loseUninstalledUpgrades: true,
  loseOverclocks: true,
  loseNonEquippedWeapons: true,
  losePersonalGold: true
};

export function resolvePenaltyFlags(rules: HouseRules): CustomPenaltyFlags {
  switch (rules.leftBehindPenalty) {
    case "soft":
      return SOFT_PENALTY;
    case "harsh":
      return HARSH_PENALTY;
    case "custom":
      return rules.customPenalty;
  }
}

export interface PenaltyPreview {
  character: Character;
  effects: string[];
}

/** Pure preview/apply of a left-behind penalty. Returns the new character and
 * a human-readable list of effects applied. */
export function applyLeftBehindPenalty(
  c: Character,
  flags: CustomPenaltyFlags
): PenaltyPreview {
  const effects: string[] = [];
  let next: Character = { ...c, weapons: c.weapons.map((w) => ({ ...w })) };

  if (flags.healToFull && next.hp < next.maxHp) {
    next.hp = next.maxHp;
    effects.push("Healed to full HP");
  }
  if (flags.reloadEquipped) {
    next.weapons = next.weapons.map((w) =>
      w.equipped ? { ...w, ammo: w.maxAmmo } : w
    );
    effects.push("Equipped weapons reloaded");
  }
  if (flags.loseGrenades && next.grenades > 0) {
    next.grenades = 0;
    effects.push("Lost grenades");
  }
  if (flags.loseRockNStoneCards && next.rockNStoneCards > 0) {
    next.rockNStoneCards = 0;
    effects.push("Lost Rock N Stone cards");
  }
  if (flags.loseUninstalledUpgrades && next.uninstalledUpgrades > 0) {
    next.uninstalledUpgrades = 0;
    effects.push("Lost uninstalled upgrades");
  }
  if (flags.loseOverclocks) {
    const had = next.weapons.some((w) => w.overclocked);
    next.weapons = next.weapons.map((w) => ({ ...w, overclocked: false }));
    if (had) effects.push("Lost overclocked state");
  }
  if (flags.loseNonEquippedWeapons) {
    const before = next.weapons.length;
    next.weapons = next.weapons.filter((w) => w.equipped);
    if (next.weapons.length < before) effects.push("Lost non-equipped weapons");
  }
  if (flags.losePersonalGold && next.personalGold > 0) {
    next.personalGold = 0;
    effects.push("Lost personal Gold");
  }

  next.leftBehindLastMission = true;
  next.escapedLastMission = false;
  return { character: next, effects };
}
