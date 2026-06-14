// Economy: gold split, default shop, spending, and resource confiscation.
// All shop entries are configurable; effect text is generic, user-editable.

import { newId } from "./ids";
import { clamp } from "./character";
import type {
  Campaign,
  Character,
  Resources,
  ShopEffectKind,
  ShopItem,
  SpendingEntry
} from "./types";

export interface GoldSplit {
  perPlayer: number;
  leftover: number;
  playerCount: number;
  total: number;
}

/** Even split of collected Gold across active players; remainder to the pool. */
export function splitGold(total: number, playerCount: number): GoldSplit {
  if (playerCount <= 0) {
    return { perPlayer: 0, leftover: total, playerCount: 0, total };
  }
  const perPlayer = Math.floor(total / playerCount);
  const leftover = total - perPlayer * playerCount;
  return { perPlayer, leftover, playerCount, total };
}

/** Default rig-shop menu. Generic effect notes; not copied from any rulebook. */
export function defaultShop(): ShopItem[] {
  const items: Omit<ShopItem, "id">[] = [
    {
      label: "Restore 1 ammo",
      currency: "nitra",
      cost: 1,
      enabled: true,
      effect: "ammo",
      note: "Restore 1 ammo to a selected weapon."
    },
    {
      label: "Fully heal a dwarf",
      currency: "gold",
      cost: 1,
      enabled: true,
      effect: "heal",
      note: "Restore a selected dwarf to full HP."
    },
    {
      label: "Fully reload a weapon",
      currency: "gold",
      cost: 1,
      enabled: true,
      effect: "reload",
      note: "Reload a selected weapon to max ammo."
    },
    {
      label: "Buy grenade",
      currency: "gold",
      cost: 1,
      enabled: true,
      effect: "grenade",
      note: "Add 1 grenade to a selected dwarf."
    },
    {
      label: "Buy beer",
      currency: "gold",
      cost: 1,
      enabled: true,
      effect: "beerOne",
      note: "Add a named beer effect to a selected dwarf."
    },
    {
      label: "Install first weapon upgrade",
      currency: "gold",
      cost: 1,
      enabled: true,
      effect: "installUpgrade",
      note: "Attach a named upgrade to a selected weapon."
    },
    {
      label: "Overclock a secondary",
      currency: "gold",
      cost: 1,
      enabled: false,
      effect: "overclock",
      note: "Mark a selected weapon overclocked."
    },
    {
      label: "Install second weapon upgrade",
      currency: "gold",
      cost: 2,
      enabled: true,
      effect: "installUpgrade",
      note: "Attach another named upgrade to a selected weapon."
    },
    {
      label: "Gain Rock N Stone card",
      currency: "gold",
      cost: 2,
      enabled: true,
      effect: "rockNStone",
      note: "Add 1 Rock N Stone card to a selected dwarf."
    },
    {
      label: "Gain an upgrade token",
      currency: "gold",
      cost: 2,
      enabled: true,
      effect: "upgradeToken",
      note: "Add 1 uninstalled upgrade token to a selected dwarf."
    },
    {
      label: "Beer round for team",
      currency: "gold",
      cost: 3,
      enabled: true,
      effect: "beerTeam",
      note: "Add a named beer effect to all active dwarves."
    },
    {
      label: "Remove a Warning",
      currency: "gold",
      cost: 3,
      enabled: true,
      effect: "flag",
      note: "Logged only — no per-dwarf state changes."
    }
  ];
  return items.map((i) => ({ ...i, id: newId("shop") }));
}

export interface PurchaseResult {
  ok: boolean;
  reason?: string;
  resources: Resources;
  entry?: SpendingEntry;
}

/** Attempt to purchase a shop item. Pure: returns new resources + log entry. */
export function purchase(
  resources: Resources,
  item: ShopItem,
  opts: { allowOverspend: boolean; targetCharacterId?: string }
): PurchaseResult {
  if (!item.enabled) {
    return { ok: false, reason: "Item disabled", resources };
  }
  const available =
    item.currency === "gold" ? resources.teamGold : resources.teamNitra;
  if (item.cost > available && !opts.allowOverspend) {
    return {
      ok: false,
      reason: `Not enough ${item.currency} (need ${item.cost}, have ${available})`,
      resources
    };
  }

  const next: Resources = { ...resources };
  if (item.currency === "gold") next.teamGold = next.teamGold - item.cost;
  else next.teamNitra = next.teamNitra - item.cost;

  const entry: SpendingEntry = {
    id: newId("spend"),
    shopItemId: item.id,
    label: item.label,
    currency: item.currency,
    cost: item.cost,
    targetCharacterId: opts.targetCharacterId
  };
  return { ok: true, resources: next, entry };
}

// --- Shop effect application ----------------------------------------------

export type ShopTargetType = "dwarf" | "weapon" | "none";

/** What kind of target a shop effect needs from the UI. */
export function shopEffectTargetType(kind: ShopEffectKind): ShopTargetType {
  switch (kind) {
    case "heal":
    case "grenade":
    case "rockNStone":
    case "upgradeToken":
    case "beerOne":
      return "dwarf";
    case "reload":
    case "ammo":
    case "installUpgrade":
    case "overclock":
      return "weapon";
    case "beerTeam":
    case "flag":
    case "none":
      return "none";
  }
}

/** True when this effect needs a free-text name (upgrade/beer name). */
export function shopEffectNeedsName(kind: ShopEffectKind): boolean {
  return kind === "installUpgrade" || kind === "beerOne" || kind === "beerTeam";
}

export interface ShopTarget {
  characterId?: string;
  weaponId?: string;
  /** Free-text name for installUpgrade / beer effects. */
  name?: string;
}

export interface AppliedEffect {
  players: Character[];
  /** Human-readable description of what changed (for the log). */
  description: string;
}

/** Apply a shop effect to the players list. Pure. Unknown/none effects and
 * missing targets leave players unchanged and describe why. */
export function applyShopEffect(
  players: Character[],
  item: ShopItem,
  target: ShopTarget
): AppliedEffect {
  const kind = item.effect;
  const char = players.find((p) => p.id === target.characterId);
  const mapChar = (fn: (c: Character) => Character): Character[] =>
    players.map((p) => (p.id === target.characterId ? fn(p) : p));
  const mapWeapon = (fn: (w: Character["weapons"][number]) => Character["weapons"][number]) =>
    mapChar((c) => ({
      ...c,
      weapons: c.weapons.map((w) => (w.id === target.weaponId ? fn(w) : w))
    }));
  const weaponName = () =>
    char?.weapons.find((w) => w.id === target.weaponId)?.name ?? "weapon";

  switch (kind) {
    case "heal":
      if (!char) return { players, description: "No dwarf selected" };
      return {
        players: mapChar((c) => ({ ...c, hp: c.maxHp })),
        description: `Healed ${char.nickname} to full HP`
      };
    case "reload":
      if (!char || !target.weaponId)
        return { players, description: "No weapon selected" };
      return {
        players: mapWeapon((w) => ({ ...w, ammo: w.maxAmmo })),
        description: `Reloaded ${weaponName()} (${char.nickname})`
      };
    case "ammo":
      if (!char || !target.weaponId)
        return { players, description: "No weapon selected" };
      return {
        players: mapWeapon((w) => ({
          ...w,
          ammo: clamp(w.ammo + 1, 0, w.maxAmmo)
        })),
        description: `+1 ammo to ${weaponName()} (${char.nickname})`
      };
    case "grenade":
      if (!char) return { players, description: "No dwarf selected" };
      return {
        players: mapChar((c) => ({ ...c, grenades: c.grenades + 1 })),
        description: `+1 grenade for ${char.nickname}`
      };
    case "rockNStone":
      if (!char) return { players, description: "No dwarf selected" };
      return {
        players: mapChar((c) => ({
          ...c,
          rockNStoneCards: c.rockNStoneCards + 1
        })),
        description: `+1 Rock N Stone card for ${char.nickname}`
      };
    case "upgradeToken":
      if (!char) return { players, description: "No dwarf selected" };
      return {
        players: mapChar((c) => ({
          ...c,
          uninstalledUpgrades: c.uninstalledUpgrades + 1
        })),
        description: `+1 upgrade token for ${char.nickname}`
      };
    case "installUpgrade": {
      if (!char || !target.weaponId)
        return { players, description: "No weapon selected" };
      const name = (target.name || "Upgrade").trim();
      return {
        players: mapWeapon((w) => ({ ...w, upgrades: [...w.upgrades, name] })),
        description: `Installed "${name}" on ${weaponName()} (${char.nickname})`
      };
    }
    case "overclock":
      if (!char || !target.weaponId)
        return { players, description: "No weapon selected" };
      return {
        players: mapWeapon((w) => ({ ...w, overclocked: true })),
        description: `Overclocked ${weaponName()} (${char.nickname})`
      };
    case "beerOne": {
      if (!char) return { players, description: "No dwarf selected" };
      const name = (target.name || "Beer").trim();
      return {
        players: mapChar((c) => ({
          ...c,
          temporaryEffects: [...c.temporaryEffects, name]
        })),
        description: `${char.nickname} drank ${name}`
      };
    }
    case "beerTeam": {
      const name = (target.name || "Beer").trim();
      return {
        players: players.map((p) =>
          p.active
            ? { ...p, temporaryEffects: [...p.temporaryEffects, name] }
            : p
        ),
        description: `Team beer round: ${name}`
      };
    }
    case "flag":
    case "none":
      return { players, description: item.label };
  }
}

export interface ConfiscationResult {
  resources: Resources;
  confiscatedGold: number;
  confiscatedNitra: number;
}

/** Confiscate unspent resources per house rules (run at next-mission launch). */
export function confiscate(campaign: Campaign): ConfiscationResult {
  const { resources, houseRules } = campaign;
  const confiscatedGold = houseRules.loseUnspentGold ? resources.teamGold : 0;
  const confiscatedNitra = houseRules.loseUnspentNitra
    ? resources.teamNitra
    : 0;
  return {
    resources: {
      teamGold: resources.teamGold - confiscatedGold,
      teamNitra: resources.teamNitra - confiscatedNitra
    },
    confiscatedGold,
    confiscatedNitra
  };
}
