import { useState } from "react";
import { useStore } from "../state/store";
import { Stepper } from "../components/Stepper";
import {
  defaultShop,
  shopEffectNeedsName,
  shopEffectTargetType
} from "../domain/economy";
import type { ShopEffectKind, ShopItem } from "../domain/types";

const EFFECT_OPTIONS: { value: ShopEffectKind; label: string }[] = [
  { value: "heal", label: "Heal dwarf to full" },
  { value: "reload", label: "Reload weapon to full" },
  { value: "ammo", label: "+1 ammo to weapon" },
  { value: "grenade", label: "+1 grenade to dwarf" },
  { value: "rockNStone", label: "+1 Rock N Stone card" },
  { value: "installUpgrade", label: "Install upgrade on weapon" },
  { value: "upgradeToken", label: "+1 upgrade token" },
  { value: "overclock", label: "Overclock weapon" },
  { value: "beerOne", label: "Beer for one dwarf" },
  { value: "beerTeam", label: "Beer round for team" },
  { value: "flag", label: "Log only (reveal/intel)" },
  { value: "none", label: "Log only (generic)" }
];

export function RigShopScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const buyItem = useStore((s) => s.buyItem);
  const patch = useStore((s) => s.patch);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [target, setTarget] = useState<string>("");
  const [targetWeapon, setTargetWeapon] = useState<string>("");

  const isEconomy = campaign.mode !== "official";
  const selectedDwarf = campaign.players.find((p) => p.id === target);

  const flash = (kind: "ok" | "err", text: string) => {
    setMsg({ kind, text });
    window.setTimeout(() => setMsg(null), 3000);
  };

  const suggestName = (item: ShopItem): string => {
    if (item.effect === "installUpgrade")
      return campaign.catalog.upgrades[0] ?? "Upgrade";
    return campaign.catalog.beers[0] ?? "Beer";
  };

  const buy = (item: ShopItem) => {
    const tt = shopEffectTargetType(item.effect);
    if (tt === "dwarf" && !target) {
      flash("err", "Select a dwarf first.");
      return;
    }
    if (tt === "weapon" && (!target || !targetWeapon)) {
      flash("err", "Select a dwarf and a weapon first.");
      return;
    }
    let name: string | undefined;
    if (shopEffectNeedsName(item.effect)) {
      const entered = window.prompt(
        `Name for "${item.label}":`,
        suggestName(item)
      );
      if (entered === null) return; // cancelled
      name = entered;
    }
    const res = buyItem(item, {
      characterId: target || undefined,
      weaponId: targetWeapon || undefined,
      name
    });
    if (res.ok) flash("ok", res.description ?? `Bought ${item.label}`);
    else flash("err", res.reason ?? "Cannot buy");
  };

  const updateItem = (id: string, fn: (i: ShopItem) => ShopItem) =>
    patch((c) => ({ ...c, shop: c.shop.map((i) => (i.id === id ? fn(i) : i)) }));

  const resetShop = () => patch((c) => ({ ...c, shop: defaultShop() }));

  const recentSpending = campaign.history
    .filter((h) => h.kind === "spending")
    .slice(-6)
    .reverse();

  return (
    <div>
      {!isEconomy && (
        <div className="banner warn">
          Official Assistant mode: the shop still applies effects, but resources
          are not confiscated at launch.
        </div>
      )}
      {msg ? <div className={`banner ${msg.kind}`}>{msg.text}</div> : null}

      <div className="resource-bar" style={{ marginBottom: 14 }}>
        <div className="res gold">
          <div className="n">{campaign.resources.teamGold}</div>
          <div className="muted">Team Gold</div>
        </div>
        <div className="res nitra">
          <div className="n">{campaign.resources.teamNitra}</div>
          <div className="muted">Team Nitra</div>
        </div>
      </div>

      <div className="card">
        <h2>Target</h2>
        <label>Dwarf</label>
        <select
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setTargetWeapon("");
          }}
        >
          <option value="">— none —</option>
          {campaign.players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nickname} (HP {p.hp}/{p.maxHp})
            </option>
          ))}
        </select>

        {selectedDwarf && (
          <>
            <label>Weapon (for reload / ammo / upgrade / overclock)</label>
            <select
              value={targetWeapon}
              onChange={(e) => setTargetWeapon(e.target.value)}
            >
              <option value="">— none —</option>
              {selectedDwarf.weapons.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.ammo}/{w.maxAmmo})
                </option>
              ))}
            </select>
          </>
        )}
        <p className="muted" style={{ fontSize: 12 }}>
          Effects apply immediately to the selected dwarf/weapon. Team beer
          rounds and log-only items ignore the target.
        </p>
      </div>

      <div className="card">
        <div className="row between">
          <h2>Rig Shop</h2>
          <button className="ghost" onClick={() => setEdit((v) => !v)}>
            {edit ? "Done" : "Edit"}
          </button>
        </div>

        {campaign.shop.map((item) =>
          edit ? (
            <div key={item.id} className="weapon">
              <input
                value={item.label}
                onChange={(e) =>
                  updateItem(item.id, (i) => ({ ...i, label: e.target.value }))
                }
                style={{ fontWeight: 600 }}
              />
              <label>Effect</label>
              <select
                value={item.effect}
                onChange={(e) =>
                  updateItem(item.id, (i) => ({
                    ...i,
                    effect: e.target.value as ShopEffectKind
                  }))
                }
              >
                {EFFECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="grid-2" style={{ marginTop: 8 }}>
                <div>
                  <label>Currency</label>
                  <select
                    value={item.currency}
                    onChange={(e) =>
                      updateItem(item.id, (i) => ({
                        ...i,
                        currency: e.target.value as "gold" | "nitra"
                      }))
                    }
                  >
                    <option value="gold">Gold</option>
                    <option value="nitra">Nitra</option>
                  </select>
                </div>
                <div>
                  <label>Cost</label>
                  <Stepper
                    value={item.cost}
                    min={0}
                    max={99}
                    onChange={(cost) =>
                      updateItem(item.id, (i) => ({ ...i, cost }))
                    }
                  />
                </div>
              </div>
              <label>Effect note</label>
              <input
                value={item.note}
                onChange={(e) =>
                  updateItem(item.id, (i) => ({ ...i, note: e.target.value }))
                }
              />
              <div className="row" style={{ marginTop: 8 }}>
                <button
                  className={item.enabled ? "sel" : "ghost"}
                  onClick={() =>
                    updateItem(item.id, (i) => ({ ...i, enabled: !i.enabled }))
                  }
                >
                  {item.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          ) : (
            item.enabled && (
              <div key={item.id} className="shop-item">
                <div style={{ flex: 1 }}>
                  <strong>{item.label}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {item.note}
                  </div>
                </div>
                <button className="primary" onClick={() => buy(item)}>
                  {item.cost} {item.currency === "gold" ? "G" : "N"}
                </button>
              </div>
            )
          )
        )}

        {edit && (
          <>
            <div className="spacer" />
            <button className="ghost full" onClick={resetShop}>
              Reset shop to defaults
            </button>
          </>
        )}
      </div>

      <div className="card">
        <h3>Recent spending</h3>
        {recentSpending.length === 0 ? (
          <p className="muted">Nothing bought this campaign yet.</p>
        ) : (
          recentSpending.map((h) => (
            <div key={h.id} className="row between" style={{ fontSize: 14 }}>
              <span>{h.title}</span>
              <span className="muted">M{h.missionIndex + 1}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
