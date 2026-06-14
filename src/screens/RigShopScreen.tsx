import { useState } from "react";
import { useStore } from "../state/store";
import { Stepper } from "../components/Stepper";
import { EditIcon } from "../components/icons";
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
  { value: "rockNStone", label: "+1 rally card" },
  { value: "installUpgrade", label: "Install upgrade on weapon" },
  { value: "upgradeToken", label: "+1 upgrade token" },
  { value: "overclock", label: "Overdrive weapon" },
  { value: "beerOne", label: "Brew for one dwarf" },
  { value: "beerTeam", label: "Brew round for team" },
  { value: "flag", label: "Log only (reveal/intel)" },
  { value: "none", label: "Log only (generic)" }
];

interface Tier {
  label: string;
  match: (i: ShopItem) => boolean;
}
const TIERS: Tier[] = [
  { label: "Nitra", match: (i) => i.currency === "nitra" },
  { label: "1 Gold", match: (i) => i.currency === "gold" && i.cost === 1 },
  { label: "2 Gold", match: (i) => i.currency === "gold" && i.cost === 2 },
  { label: "3 Gold", match: (i) => i.currency === "gold" && i.cost === 3 },
  { label: "More", match: (i) => i.currency === "gold" && i.cost > 3 }
];

export function RigShopScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const buyItem = useStore((s) => s.buyItem);
  const patch = useStore((s) => s.patch);
  const showToast = useStore((s) => s.showToast);
  const [edit, setEdit] = useState(false);
  const [target, setTarget] = useState<string>(campaign.players[0]?.id ?? "");
  const [targetWeapon, setTargetWeapon] = useState<string>("");

  const isEconomy = campaign.mode !== "official";
  const selectedDwarf = campaign.players.find((p) => p.id === target);

  const suggestName = (item: ShopItem) =>
    item.effect === "installUpgrade"
      ? campaign.catalog.upgrades[0] ?? "Upgrade"
      : campaign.catalog.beers[0] ?? "Brew";

  const buy = (item: ShopItem) => {
    const tt = shopEffectTargetType(item.effect);
    if (tt === "dwarf" && !target) return showToast("Select a dwarf first", "err");
    if (tt === "weapon" && (!target || !targetWeapon)) return showToast("Select a dwarf and weapon", "err");
    let name: string | undefined;
    if (shopEffectNeedsName(item.effect)) {
      const entered = window.prompt(`Name for "${item.label}":`, suggestName(item));
      if (entered === null) return;
      name = entered;
    }
    buyItem(item, { characterId: target || undefined, weaponId: targetWeapon || undefined, name });
  };

  const updateItem = (id: string, fn: (i: ShopItem) => ShopItem) =>
    patch((c) => ({ ...c, shop: c.shop.map((i) => (i.id === id ? fn(i) : i)) }));

  const recentSpending = campaign.history.filter((h) => h.kind === "spending").slice(-6).reverse();

  return (
    <>
      {!isEconomy && (
        <div className="banner warn">
          Official mode: effects still apply, but resources are not confiscated at launch.
        </div>
      )}

      <div className="row between end">
        <div>
          <div className="eyebrow">Between Missions</div>
          <div className="screen-title">Rig Shop</div>
        </div>
        <button className="btn ghost" style={{ minHeight: 0, padding: "8px 11px", fontSize: 12 }} onClick={() => setEdit((v) => !v)}>
          <EditIcon /> {edit ? "Done" : "Edit"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span className="section-label">Spending On</span>
        <div className="pill-row scroll qm-scroll">
          {campaign.players.map((p) => (
            <button
              key={p.id}
              className={`pill compact ${p.id === target ? "sel" : ""}`}
              onClick={() => {
                setTarget(p.id);
                setTargetWeapon("");
              }}
            >
              {p.nickname}
            </button>
          ))}
        </div>
        {selectedDwarf && (
          <select value={targetWeapon} aria-label="target weapon" onChange={(e) => setTargetWeapon(e.target.value)} style={{ fontSize: 14 }}>
            <option value="">Weapon — for reload / ammo / upgrade / overdrive</option>
            {selectedDwarf.weapons.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.ammo}/{w.maxAmmo})
              </option>
            ))}
          </select>
        )}
      </div>

      {edit
        ? campaign.shop.map((item) => (
            <div key={item.id} className="weapon">
              <input value={item.label} onChange={(e) => updateItem(item.id, (i) => ({ ...i, label: e.target.value }))} style={{ fontWeight: 600 }} />
              <label className="field-label">Effect</label>
              <select value={item.effect} aria-label="effect" onChange={(e) => updateItem(item.id, (i) => ({ ...i, effect: e.target.value as ShopEffectKind }))}>
                {EFFECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="grid-2" style={{ marginTop: 8 }}>
                <div>
                  <label className="field-label">Currency</label>
                  <select value={item.currency} aria-label="currency" onChange={(e) => updateItem(item.id, (i) => ({ ...i, currency: e.target.value as "gold" | "nitra" }))}>
                    <option value="gold">Gold</option>
                    <option value="nitra">Nitra</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Cost</label>
                  <Stepper value={item.cost} min={0} max={99} size="md" label="cost" onChange={(cost) => updateItem(item.id, (i) => ({ ...i, cost }))} />
                </div>
              </div>
              <label className="field-label">Effect note</label>
              <input value={item.note} onChange={(e) => updateItem(item.id, (i) => ({ ...i, note: e.target.value }))} />
              <button className={`mini-toggle ${item.enabled ? "on-ok" : ""}`} style={{ marginTop: 8, alignSelf: "flex-start" }} onClick={() => updateItem(item.id, (i) => ({ ...i, enabled: !i.enabled }))}>
                {item.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))
        : TIERS.map((tier) => {
            const items = campaign.shop.filter((i) => i.enabled && tier.match(i));
            if (!items.length) return null;
            return (
              <div key={tier.label} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="section-label">{tier.label}</span>
                  <div style={{ flex: "1 1 auto", height: 1, background: "#21262f" }} />
                </div>
                {items.map((item) => {
                  const isGold = item.currency === "gold";
                  const accent = isGold ? "var(--gold)" : "var(--nitra)";
                  const bal = isGold ? campaign.resources.teamGold : campaign.resources.teamNitra;
                  const afford = bal >= item.cost || campaign.houseRules.allowOverspend;
                  return (
                    <div key={item.id} className="row" style={{ gap: 11, background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 13, padding: "12px 13px" }}>
                      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-2)" }}>{item.label}</span>
                          <span className="display" style={{ fontWeight: 700, fontSize: 14, color: accent, background: "rgba(255,255,255,.03)", border: `1px solid ${accent}44`, borderRadius: 7, padding: "3px 8px" }}>
                            {item.cost}
                            {isGold ? "G" : "N"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 3, lineHeight: 1.4 }}>{item.note}</div>
                      </div>
                      <button
                        className="btn"
                        style={{ flex: "0 0 auto", minHeight: 0, fontSize: 12.5, fontWeight: 700, padding: "9px 15px", color: afford ? "#1a1407" : "var(--muted-3)", background: afford ? accent : "var(--surface-2)", borderColor: afford ? accent : "var(--border)" }}
                        onClick={() => buy(item)}
                      >
                        {afford ? "Buy" : "Short"}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}

      {edit && (
        <button className="btn ghost full" onClick={() => patch((c) => ({ ...c, shop: defaultShop() }))}>
          Reset shop to defaults
        </button>
      )}

      {recentSpending.length > 0 && (
        <div className="card" style={{ background: "var(--inset)", borderColor: "var(--border-faint)", gap: 9 }}>
          <span className="section-label">Recent Spending</span>
          {recentSpending.map((h) => (
            <div key={h.id} className="row between" style={{ fontSize: 12.5 }}>
              <span style={{ color: "#cdd4df" }}>{h.title}</span>
              <span className="mono" style={{ color: "var(--muted-4)" }}>M{h.missionIndex + 1}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
