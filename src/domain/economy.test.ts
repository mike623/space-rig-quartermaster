import { describe, expect, it } from "vitest";
import {
  applyShopEffect,
  confiscate,
  defaultShop,
  purchase,
  shopEffectNeedsName,
  shopEffectTargetType,
  splitGold
} from "./economy";
import { createCampaign } from "./campaign";
import { createCharacter } from "./character";
import type { Character, Resources, ShopEffectKind, ShopItem } from "./types";

describe("splitGold", () => {
  it("splits evenly with leftover to the pool", () => {
    expect(splitGold(9, 4)).toEqual({
      perPlayer: 2,
      leftover: 1,
      playerCount: 4,
      total: 9
    });
  });

  it("handles exact division", () => {
    expect(splitGold(8, 4).leftover).toBe(0);
    expect(splitGold(8, 4).perPlayer).toBe(2);
  });

  it("puts everything in leftover when there are no players", () => {
    expect(splitGold(5, 0)).toEqual({
      perPlayer: 0,
      leftover: 5,
      playerCount: 0,
      total: 5
    });
  });
});

describe("purchase", () => {
  const res: Resources = { teamGold: 3, teamNitra: 2 };

  it("deducts gold and returns a log entry on success", () => {
    const item = defaultShop().find((i) => i.cost === 1 && i.currency === "gold")!;
    const result = purchase(res, item, { allowOverspend: false });
    expect(result.ok).toBe(true);
    expect(result.resources.teamGold).toBe(2);
    expect(result.entry?.label).toBe(item.label);
  });

  it("blocks overspend by default", () => {
    const item = { ...defaultShop()[0], currency: "gold" as const, cost: 99 };
    const result = purchase(res, item, { allowOverspend: false });
    expect(result.ok).toBe(false);
    expect(result.resources).toEqual(res); // unchanged
  });

  it("allows overspend (going negative) when enabled", () => {
    const item = { ...defaultShop()[0], currency: "gold" as const, cost: 99 };
    const result = purchase(res, item, { allowOverspend: true });
    expect(result.ok).toBe(true);
    expect(result.resources.teamGold).toBe(3 - 99);
  });

  it("refuses disabled items", () => {
    const item = { ...defaultShop()[0], enabled: false };
    expect(purchase(res, item, { allowOverspend: true }).ok).toBe(false);
  });

  it("spends nitra for nitra-priced items", () => {
    const item = defaultShop().find((i) => i.currency === "nitra")!;
    const result = purchase(res, item, { allowOverspend: false });
    expect(result.ok).toBe(true);
    expect(result.resources.teamNitra).toBe(2 - item.cost);
    expect(result.resources.teamGold).toBe(3);
  });
});

describe("shop effect targeting", () => {
  it("maps effects to the right target type", () => {
    expect(shopEffectTargetType("heal")).toBe("dwarf");
    expect(shopEffectTargetType("reload")).toBe("weapon");
    expect(shopEffectTargetType("ammo")).toBe("weapon");
    expect(shopEffectTargetType("beerTeam")).toBe("none");
    expect(shopEffectTargetType("flag")).toBe("none");
  });

  it("flags effects that need a free-text name", () => {
    expect(shopEffectNeedsName("installUpgrade")).toBe(true);
    expect(shopEffectNeedsName("beerOne")).toBe(true);
    expect(shopEffectNeedsName("heal")).toBe(false);
  });
});

describe("applyShopEffect", () => {
  const item = (effect: ShopEffectKind): ShopItem => ({
    id: "shop_x",
    label: effect,
    currency: "gold",
    cost: 1,
    enabled: true,
    effect,
    note: ""
  });

  function damagedTeam(): Character[] {
    const a = createCharacter({ dwarfClass: "scout", nickname: "Alpha" });
    const b = createCharacter({ dwarfClass: "gunner", nickname: "Bravo" });
    a.hp = 1;
    a.weapons = a.weapons.map((w) => ({ ...w, ammo: 0 }));
    return [a, b];
  }

  it("heals the targeted dwarf to full", () => {
    const team = damagedTeam();
    const out = applyShopEffect(team, item("heal"), { characterId: team[0].id });
    expect(out.players[0].hp).toBe(team[0].maxHp);
    expect(out.players[1].hp).toBe(team[1].hp); // untouched
    expect(out.description).toContain("Alpha");
  });

  it("reloads the targeted weapon to max", () => {
    const team = damagedTeam();
    const wid = team[0].weapons[0].id;
    const out = applyShopEffect(team, item("reload"), {
      characterId: team[0].id,
      weaponId: wid
    });
    const w = out.players[0].weapons[0];
    expect(w.ammo).toBe(w.maxAmmo);
  });

  it("adds exactly 1 ammo, clamped to max", () => {
    const team = damagedTeam();
    const wid = team[0].weapons[0].id;
    const once = applyShopEffect(team, item("ammo"), {
      characterId: team[0].id,
      weaponId: wid
    });
    expect(once.players[0].weapons[0].ammo).toBe(1);

    // Fill to max then ensure it cannot exceed.
    let full = team;
    const max = team[0].weapons[0].maxAmmo;
    for (let i = 0; i < max + 3; i++) {
      full = applyShopEffect(full, item("ammo"), {
        characterId: team[0].id,
        weaponId: wid
      }).players;
    }
    expect(full[0].weapons[0].ammo).toBe(max);
  });

  it("increments grenades, cards, and upgrade tokens", () => {
    const team = damagedTeam();
    const g = applyShopEffect(team, item("grenade"), {
      characterId: team[0].id
    }).players[0];
    expect(g.grenades).toBe(team[0].grenades + 1);

    const r = applyShopEffect(team, item("rockNStone"), {
      characterId: team[0].id
    }).players[0];
    expect(r.rockNStoneCards).toBe(team[0].rockNStoneCards + 1);

    const u = applyShopEffect(team, item("upgradeToken"), {
      characterId: team[0].id
    }).players[0];
    expect(u.uninstalledUpgrades).toBe(team[0].uninstalledUpgrades + 1);
  });

  it("installs a named upgrade on the targeted weapon", () => {
    const team = damagedTeam();
    const wid = team[0].weapons[0].id;
    const out = applyShopEffect(team, item("installUpgrade"), {
      characterId: team[0].id,
      weaponId: wid,
      name: "Extended Mag"
    });
    expect(out.players[0].weapons[0].upgrades).toContain("Extended Mag");
  });

  it("overclocks the targeted weapon", () => {
    const team = damagedTeam();
    const wid = team[0].weapons[0].id;
    const out = applyShopEffect(team, item("overclock"), {
      characterId: team[0].id,
      weaponId: wid
    });
    expect(out.players[0].weapons[0].overclocked).toBe(true);
  });

  it("adds a named beer to one dwarf and to the whole active team", () => {
    const team = damagedTeam();
    const one = applyShopEffect(team, item("beerOne"), {
      characterId: team[0].id,
      name: "Stout"
    });
    expect(one.players[0].temporaryEffects).toContain("Stout");
    expect(one.players[1].temporaryEffects).toHaveLength(0);

    const all = applyShopEffect(team, item("beerTeam"), { name: "Lager" });
    expect(all.players.every((p) => p.temporaryEffects.includes("Lager"))).toBe(
      true
    );
  });

  it("leaves players unchanged for flag/none and missing targets", () => {
    const team = damagedTeam();
    expect(applyShopEffect(team, item("flag"), {}).players).toEqual(team);
    // heal with no dwarf selected -> no change, explanatory description
    const out = applyShopEffect(team, item("heal"), {});
    expect(out.players).toEqual(team);
    expect(out.description).toMatch(/no dwarf/i);
  });
});

describe("confiscate", () => {
  const base = () =>
    createCampaign({
      name: "T",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "SEED-1",
      now: "2026-01-01T00:00:00.000Z"
    });

  it("removes unspent gold and nitra when both rules enabled", () => {
    const c = base();
    c.resources = { teamGold: 5, teamNitra: 3 };
    const out = confiscate(c);
    expect(out.confiscatedGold).toBe(5);
    expect(out.confiscatedNitra).toBe(3);
    expect(out.resources).toEqual({ teamGold: 0, teamNitra: 0 });
  });

  it("keeps resources when rules disabled (official mode)", () => {
    const c = base();
    c.houseRules.loseUnspentGold = false;
    c.houseRules.loseUnspentNitra = false;
    c.resources = { teamGold: 5, teamNitra: 3 };
    const out = confiscate(c);
    expect(out.confiscatedGold).toBe(0);
    expect(out.resources).toEqual({ teamGold: 5, teamNitra: 3 });
  });
});
