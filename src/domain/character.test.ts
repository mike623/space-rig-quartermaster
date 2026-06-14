import { describe, expect, it } from "vitest";
import {
  adjustAmmo,
  adjustHp,
  applyLeftBehindPenalty,
  createCharacter,
  resolvePenaltyFlags
} from "./character";
import { defaultHouseRules } from "./campaign";

describe("hp/ammo adjustments", () => {
  it("clamps hp between 0 and maxHp", () => {
    const c = createCharacter({ dwarfClass: "scout" });
    expect(adjustHp(c, -999).hp).toBe(0);
    expect(adjustHp(c, 999).hp).toBe(c.maxHp);
  });

  it("clamps ammo per weapon", () => {
    const c = createCharacter({ dwarfClass: "gunner" });
    const w = c.weapons[0];
    const drained = adjustAmmo(c, w.id, -999);
    expect(drained.weapons[0].ammo).toBe(0);
    const refilled = adjustAmmo(drained, w.id, 999);
    expect(refilled.weapons[0].ammo).toBe(w.maxAmmo);
  });
});

describe("left-behind penalties", () => {
  it("soft penalty heals, reloads, and strips consumables but keeps weapons", () => {
    let c = createCharacter({ dwarfClass: "driller" });
    c = {
      ...c,
      hp: 1,
      grenades: 2,
      rockNStoneCards: 3,
      uninstalledUpgrades: 1,
      personalGold: 5,
      weapons: c.weapons.map((w) => ({ ...w, ammo: 0, overclocked: true }))
    };
    const flags = resolvePenaltyFlags(defaultHouseRules("economy"));
    const { character, effects } = applyLeftBehindPenalty(c, flags);

    expect(character.hp).toBe(character.maxHp);
    expect(character.grenades).toBe(0);
    expect(character.rockNStoneCards).toBe(0);
    expect(character.uninstalledUpgrades).toBe(0);
    expect(character.personalGold).toBe(5); // soft keeps gold
    expect(character.weapons.some((w) => w.overclocked)).toBe(true); // soft keeps OC
    expect(character.weapons[0].ammo).toBe(character.weapons[0].maxAmmo);
    expect(character.leftBehindLastMission).toBe(true);
    expect(effects.length).toBeGreaterThan(0);
  });

  it("harsh penalty also strips overclocks, extra weapons, and personal gold", () => {
    let c = createCharacter({ dwarfClass: "gunner" });
    c = {
      ...c,
      personalGold: 5,
      weapons: [
        { ...c.weapons[0], overclocked: true, equipped: true },
        { ...c.weapons[1], equipped: false }
      ]
    };
    const flags = resolvePenaltyFlags(defaultHouseRules("hardcore"));
    const { character } = applyLeftBehindPenalty(c, flags);

    expect(character.personalGold).toBe(0);
    expect(character.weapons.every((w) => !w.overclocked)).toBe(true);
    expect(character.weapons.every((w) => w.equipped)).toBe(true);
    expect(character.weapons.length).toBe(1);
  });
});

describe("hardcore character creation", () => {
  it("drops starting secondary and grenade", () => {
    const c = createCharacter({
      dwarfClass: "scout",
      noStartingSecondary: true,
      noStartingGrenade: true
    });
    expect(c.grenades).toBe(0);
    expect(c.weapons.some((w) => w.slot === "secondary")).toBe(false);
  });
});
