import { useState } from "react";
import { useStore } from "../state/store";
import { defaultCatalog } from "../domain/catalog";
import { slotLabel } from "../ui/labels";
import type { ItemCatalog, WeaponSlot } from "../domain/types";

type ListKey = Exclude<keyof ItemCatalog, "weapons">;

const LIST_FIELDS: { key: ListKey; label: string }[] = [
  { key: "upgrades", label: "Weapon upgrades" },
  { key: "overclocks", label: "Overdrives" },
  { key: "grenades", label: "Grenades" },
  { key: "beers", label: "Brews" },
  { key: "rockNStoneCards", label: "Rally cards" }
];

/** Editable predefined item lists (generic names only), stored per campaign. */
export function CatalogEditor() {
  const campaign = useStore((s) => s.campaign)!;
  const patch = useStore((s) => s.patch);
  const [open, setOpen] = useState(false);
  const cat = campaign.catalog;

  const setList = (key: ListKey, text: string) =>
    patch((c) => ({
      ...c,
      catalog: { ...c.catalog, [key]: text.split("\n").map((s) => s.trim()).filter(Boolean) }
    }));

  const updateWeapon = (i: number, field: "name" | "slot" | "maxAmmo", value: string) =>
    patch((c) => ({
      ...c,
      catalog: {
        ...c.catalog,
        weapons: c.catalog.weapons.map((w, j) =>
          j === i
            ? {
                ...w,
                [field]:
                  field === "maxAmmo"
                    ? Math.max(1, Number(value) || 1)
                    : field === "slot"
                      ? (value as WeaponSlot)
                      : value
              }
            : w
        )
      }
    }));

  const addWeapon = () =>
    patch((c) => ({
      ...c,
      catalog: { ...c.catalog, weapons: [...c.catalog.weapons, { name: "New Weapon", slot: "other", maxAmmo: 5 }] }
    }));
  const removeWeapon = (i: number) =>
    patch((c) => ({ ...c, catalog: { ...c.catalog, weapons: c.catalog.weapons.filter((_, j) => j !== i) } }));

  return (
    <div className="card">
      <div className="row between">
        <span className="section-label">Catalog Editor</span>
        <button className="btn ghost" style={{ minHeight: 0, padding: "6px 11px", fontSize: 12 }} onClick={() => setOpen((v) => !v)}>
          {open ? "Done" : "Edit"}
        </button>
      </div>
      <p className="muted" style={{ fontSize: 12, margin: 0 }}>
        Generic, editable lists reused across all dwarves. No official names bundled — rename freely.
      </p>

      {open && (
        <>
          <label className="field-label">Catalog weapons</label>
          {cat.weapons.map((w, i) => (
            <div key={i} className="row" style={{ gap: 6 }}>
              <input value={w.name} aria-label="catalog weapon name" onChange={(e) => updateWeapon(i, "name", e.target.value)} style={{ flex: 2 }} />
              <select value={w.slot} aria-label="weapon slot" onChange={(e) => updateWeapon(i, "slot", e.target.value)} style={{ flex: 1 }}>
                <option value="primary">{slotLabel("primary")}</option>
                <option value="secondary">{slotLabel("secondary")}</option>
                <option value="other">{slotLabel("other")}</option>
              </select>
              <input type="number" value={w.maxAmmo} aria-label="max ammo" onChange={(e) => updateWeapon(i, "maxAmmo", e.target.value)} style={{ width: 64 }} />
              <button className="btn danger" style={{ minHeight: 0, padding: "8px 10px" }} aria-label={`Remove ${w.name}`} onClick={() => removeWeapon(i)}>✕</button>
            </div>
          ))}
          <button className="btn ghost full" onClick={addWeapon}>+ Add catalog weapon</button>

          {LIST_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="field-label">{f.label} (one per line)</label>
              <textarea value={cat[f.key].join("\n")} aria-label={`${f.label}, one per line`} onChange={(e) => setList(f.key, e.target.value)} />
            </div>
          ))}

          <button className="btn ghost full" onClick={() => patch((c) => ({ ...c, catalog: defaultCatalog() }))}>
            Reset catalog to defaults
          </button>
        </>
      )}
    </div>
  );
}
