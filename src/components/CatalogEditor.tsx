import { useStore } from "../state/store";
import { defaultCatalog } from "../domain/catalog";
import type { ItemCatalog, WeaponSlot } from "../domain/types";

type ListKey = Exclude<keyof ItemCatalog, "weapons">;

const LIST_FIELDS: { key: ListKey; label: string }[] = [
  { key: "upgrades", label: "Weapon upgrades" },
  { key: "overclocks", label: "Overclocks" },
  { key: "grenades", label: "Grenades" },
  { key: "beers", label: "Beers" },
  { key: "rockNStoneCards", label: "Rock N Stone cards" }
];

/** Editable predefined item lists (generic names only). Stored per campaign. */
export function CatalogEditor() {
  const campaign = useStore((s) => s.campaign)!;
  const patch = useStore((s) => s.patch);
  const cat = campaign.catalog;

  const setList = (key: ListKey, text: string) =>
    patch((c) => ({
      ...c,
      catalog: {
        ...c.catalog,
        [key]: text
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      }
    }));

  const updateWeapon = (
    i: number,
    field: "name" | "slot" | "maxAmmo",
    value: string
  ) =>
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
      catalog: {
        ...c.catalog,
        weapons: [
          ...c.catalog.weapons,
          { name: "New Weapon", slot: "other", maxAmmo: 4 }
        ]
      }
    }));

  const removeWeapon = (i: number) =>
    patch((c) => ({
      ...c,
      catalog: {
        ...c.catalog,
        weapons: c.catalog.weapons.filter((_, j) => j !== i)
      }
    }));

  return (
    <div className="card">
      <div className="row between">
        <h2>Item Catalog</h2>
        <button
          className="ghost"
          onClick={() =>
            patch((c) => ({ ...c, catalog: defaultCatalog() }))
          }
        >
          Reset
        </button>
      </div>
      <p className="muted" style={{ fontSize: 12 }}>
        Generic, editable lists reused across all dwarves. No official names are
        bundled — rename freely.
      </p>

      <label>Catalog weapons</label>
      {cat.weapons.map((w, i) => (
        <div key={i} className="row" style={{ gap: 6, marginBottom: 6 }}>
          <input
            value={w.name}
            onChange={(e) => updateWeapon(i, "name", e.target.value)}
            style={{ flex: 2 }}
          />
          <select
            value={w.slot}
            onChange={(e) => updateWeapon(i, "slot", e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="primary">primary</option>
            <option value="secondary">secondary</option>
            <option value="other">other</option>
          </select>
          <input
            type="number"
            value={w.maxAmmo}
            onChange={(e) => updateWeapon(i, "maxAmmo", e.target.value)}
            style={{ width: 64 }}
          />
          <button className="danger" onClick={() => removeWeapon(i)}>
            ✕
          </button>
        </div>
      ))}
      <button className="ghost full" onClick={addWeapon}>
        + Add catalog weapon
      </button>

      {LIST_FIELDS.map((f) => (
        <div key={f.key}>
          <label>{f.label} (one per line)</label>
          <textarea
            value={cat[f.key].join("\n")}
            onChange={(e) => setList(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
