import { useStore } from "../state/store";
import { Stepper } from "../components/Stepper";
import { clamp, createWeapon } from "../domain/character";
import type {
  Character,
  ItemCatalog,
  Weapon,
  WeaponSlot
} from "../domain/types";

export function CharactersScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const patchCharacter = useStore((s) => s.patchCharacter);
  const catalog = campaign.catalog;

  return (
    <div>
      {/* Predefined generic item suggestions, reusable across all dwarves. */}
      <datalist id="cat-weapon-names">
        {catalog.weapons.map((w) => (
          <option key={w.name} value={w.name} />
        ))}
      </datalist>
      <datalist id="cat-upgrades">
        {[...catalog.upgrades, ...catalog.overclocks].map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
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

      {campaign.players.map((ch) => (
        <CharacterCard
          key={ch.id}
          ch={ch}
          catalog={catalog}
          onChange={(fn) => patchCharacter(ch.id, fn)}
        />
      ))}
    </div>
  );
}

function CharacterCard({
  ch,
  catalog,
  onChange
}: {
  ch: Character;
  catalog: ItemCatalog;
  onChange: (fn: (c: Character) => Character) => void;
}) {
  const lowHp = ch.hp <= ch.maxHp * 0.34;

  const addWeaponFromCatalog = (name: string) => {
    const entry = catalog.weapons.find((w) => w.name === name) ?? {
      name: "New Weapon",
      slot: "other" as WeaponSlot,
      maxAmmo: 4
    };
    onChange((c) => ({ ...c, weapons: [...c.weapons, createWeapon(entry)] }));
  };

  const updateWeapon = (id: string, fn: (w: Weapon) => Weapon) =>
    onChange((c) => ({
      ...c,
      weapons: c.weapons.map((w) => (w.id === id ? fn(w) : w))
    }));

  const removeWeapon = (id: string) =>
    onChange((c) => ({ ...c, weapons: c.weapons.filter((w) => w.id !== id) }));

  return (
    <div className="card" style={{ opacity: ch.active ? 1 : 0.6 }}>
      <div className="row between">
        <input
          value={ch.nickname}
          onChange={(e) =>
            onChange((c) => ({ ...c, nickname: e.target.value }))
          }
          style={{ fontWeight: 700, fontSize: 18, width: "55%" }}
        />
        <span className="tag">{ch.dwarfClass}</span>
      </div>

      <input
        placeholder="Player name"
        value={ch.playerName}
        onChange={(e) => onChange((c) => ({ ...c, playerName: e.target.value }))}
        style={{ marginTop: 8 }}
      />

      <div className={`hp-bar${lowHp ? " low" : ""}`} style={{ marginTop: 12 }}>
        <div style={{ width: `${(ch.hp / ch.maxHp) * 100}%` }} />
      </div>
      <div className="row between">
        <span>
          HP <strong>{ch.hp}</strong> / {ch.maxHp}
        </span>
        <Stepper
          value={ch.hp}
          min={0}
          max={ch.maxHp}
          onChange={(hp) => onChange((c) => ({ ...c, hp }))}
        />
      </div>

      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          <label>Max HP</label>
          <Stepper
            value={ch.maxHp}
            min={1}
            max={50}
            onChange={(maxHp) =>
              onChange((c) => ({ ...c, maxHp, hp: clamp(c.hp, 0, maxHp) }))
            }
          />
        </div>
        <div>
          <label>Grenades</label>
          <Stepper
            value={ch.grenades}
            onChange={(grenades) => onChange((c) => ({ ...c, grenades }))}
          />
        </div>
        <div>
          <label>Rock N Stone cards</label>
          <Stepper
            value={ch.rockNStoneCards}
            onChange={(rockNStoneCards) =>
              onChange((c) => ({ ...c, rockNStoneCards }))
            }
          />
        </div>
        <div>
          <label>Uninstalled upgrades</label>
          <Stepper
            value={ch.uninstalledUpgrades}
            onChange={(uninstalledUpgrades) =>
              onChange((c) => ({ ...c, uninstalledUpgrades }))
            }
          />
        </div>
        <div>
          <label>Personal Gold</label>
          <Stepper
            value={ch.personalGold}
            onChange={(personalGold) =>
              onChange((c) => ({ ...c, personalGold }))
            }
          />
        </div>
      </div>

      <label>Weapons</label>
      {ch.weapons.map((w) => (
        <div key={w.id} className="weapon">
          <div className="row between">
            <input
              value={w.name}
              list="cat-weapon-names"
              onChange={(e) =>
                updateWeapon(w.id, (x) => ({ ...x, name: e.target.value }))
              }
              style={{ width: "55%", fontWeight: 600 }}
            />
            <select
              value={w.slot}
              onChange={(e) =>
                updateWeapon(w.id, (x) => ({
                  ...x,
                  slot: e.target.value as WeaponSlot
                }))
              }
              style={{ width: "38%" }}
            >
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
              <option value="other">other</option>
            </select>
          </div>

          <div className="row between" style={{ marginTop: 8 }}>
            <span>
              Ammo <strong>{w.ammo}</strong> / {w.maxAmmo}
            </span>
            <Stepper
              value={w.ammo}
              min={0}
              max={w.maxAmmo}
              onChange={(ammo) => updateWeapon(w.id, (x) => ({ ...x, ammo }))}
            />
          </div>

          <div className="row between" style={{ marginTop: 8 }}>
            <span className="muted">Max ammo</span>
            <Stepper
              value={w.maxAmmo}
              min={1}
              max={99}
              onChange={(maxAmmo) =>
                updateWeapon(w.id, (x) => ({
                  ...x,
                  maxAmmo,
                  ammo: clamp(x.ammo, 0, maxAmmo)
                }))
              }
            />
          </div>

          <div className="row wrap" style={{ marginTop: 8, gap: 6 }}>
            <button
              className={w.equipped ? "sel" : "ghost"}
              onClick={() =>
                updateWeapon(w.id, (x) => ({ ...x, equipped: !x.equipped }))
              }
            >
              {w.equipped ? "Equipped" : "Stowed"}
            </button>
            <button
              className={w.overclocked ? "sel" : "ghost"}
              onClick={() =>
                updateWeapon(w.id, (x) => ({
                  ...x,
                  overclocked: !x.overclocked
                }))
              }
            >
              {w.overclocked ? "Overclocked" : "Stock"}
            </button>
            <button
              className="ghost"
              onClick={() =>
                updateWeapon(w.id, (x) => ({
                  ...x,
                  upgrades: [...x.upgrades, catalog.upgrades[0] ?? "Upgrade"]
                }))
              }
            >
              + Upgrade ({w.upgrades.length})
            </button>
            <button className="danger" onClick={() => removeWeapon(w.id)}>
              Remove
            </button>
          </div>

          {w.upgrades.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {w.upgrades.map((u, i) => (
                <div key={i} className="row" style={{ gap: 6, marginTop: 4 }}>
                  <input
                    value={u}
                    list="cat-upgrades"
                    onChange={(e) =>
                      updateWeapon(w.id, (x) => ({
                        ...x,
                        upgrades: x.upgrades.map((v, j) =>
                          j === i ? e.target.value : v
                        )
                      }))
                    }
                  />
                  <button
                    className="danger"
                    onClick={() =>
                      updateWeapon(w.id, (x) => ({
                        ...x,
                        upgrades: x.upgrades.filter((_, j) => j !== i)
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="spacer" />
      <div className="row" style={{ gap: 6 }}>
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              addWeaponFromCatalog(e.target.value);
              e.target.value = "";
            }
          }}
          style={{ flex: 1 }}
        >
          <option value="">+ Add weapon from catalog…</option>
          {catalog.weapons.map((w) => (
            <option key={w.name} value={w.name}>
              {w.name} ({w.slot})
            </option>
          ))}
        </select>
        <button className="ghost" onClick={() => addWeaponFromCatalog("")}>
          + Blank
        </button>
      </div>

      {ch.temporaryEffects.length > 0 && (
        <>
          <label>Active effects (beer / temporary)</label>
          <div className="row wrap">
            {ch.temporaryEffects.map((fx, i) => (
              <span key={i} className="tag">
                🍺 {fx}{" "}
                <button
                  className="ghost"
                  style={{ minHeight: 0, padding: "0 6px", marginLeft: 4 }}
                  onClick={() =>
                    onChange((c) => ({
                      ...c,
                      temporaryEffects: c.temporaryEffects.filter(
                        (_, j) => j !== i
                      )
                    }))
                  }
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      <label>Notes</label>
      <textarea
        value={ch.notes}
        onChange={(e) => onChange((c) => ({ ...c, notes: e.target.value }))}
      />

      <div className="row wrap" style={{ marginTop: 10, gap: 6 }}>
        <button
          className={ch.leftBehindLastMission ? "sel" : "ghost"}
          onClick={() =>
            onChange((c) => ({
              ...c,
              leftBehindLastMission: !c.leftBehindLastMission
            }))
          }
        >
          {ch.leftBehindLastMission ? "Left behind" : "Escaped"}
        </button>
        <button
          className={ch.active ? "sel" : "ghost"}
          onClick={() => onChange((c) => ({ ...c, active: !c.active }))}
        >
          {ch.active ? "Active" : "Inactive"}
        </button>
      </div>
    </div>
  );
}
