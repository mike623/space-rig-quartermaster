import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { Stepper } from "../components/Stepper";
import { BoltIcon, CheckIcon, ChevronIcon, WarnIcon } from "../components/icons";
import { createWeapon } from "../domain/character";
import { ROLE_LABEL, TERMS, slotLabel } from "../ui/labels";
import type {
  Character,
  ItemCatalog,
  Weapon,
  WeaponSlot
} from "../domain/types";

/** Critical when at/below a quarter integrity, or down to the last point —
 * the absolute floor keeps it meaningful at the 5-HP board-game scale. */
function isCritical(hp: number, maxHp: number): boolean {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  return pct <= 0.25 || hp <= 1;
}

function pipFill(hp: number, maxHp: number): string {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  if (pct <= 0.25 || hp <= 1) return "var(--danger)";
  if (pct <= 0.5) return "var(--gold)";
  return "var(--ok)";
}

function SlotMark({ slot }: { slot: WeaponSlot }) {
  const c = "var(--muted)";
  return (
    <span className="slot-mark">
      {slot === "primary" ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill={c}>
          <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" />
        </svg>
      ) : slot === "secondary" ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill={c}>
          <path d="M6 1.5 10.5 10h-9z" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill={c}>
          <circle cx="6" cy="6" r="4.6" />
        </svg>
      )}
    </span>
  );
}

export function CharactersScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const patchCharacter = useStore((s) => s.patchCharacter);
  const navigate = useNavigate();
  const catalog = campaign.catalog;
  const activeCount = campaign.players.filter((p) => p.active).length;

  return (
    <>
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

      <div className="row between end">
        <div>
          <div className="eyebrow">Crew Roster</div>
          <div className="screen-title">{activeCount} Dwarves Active</div>
        </div>
        <button className="pill compact sel" style={{ flex: "0 0 auto" }} onClick={() => navigate("/end-mission")}>
          End Mission
        </button>
      </div>

      {campaign.players.map((ch) => (
        <CharacterCard key={ch.id} ch={ch} catalog={catalog} onChange={(fn) => patchCharacter(ch.id, fn)} />
      ))}
    </>
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
  const [open, setOpen] = useState(false); // default compact
  const critical = isCritical(ch.hp, ch.maxHp);
  const benched = !ch.active;

  let statusLabel = "Active";
  let statusColor = "var(--ok)";
  let statusIcon = <CheckIcon c="var(--ok)" />;
  if (ch.leftBehindLastMission) {
    statusLabel = "Left Behind";
    statusColor = "var(--danger)";
    statusIcon = <WarnIcon c="var(--danger)" />;
  } else if (benched) {
    statusLabel = "Benched";
    statusColor = "var(--muted-3)";
    statusIcon = <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--muted-3)", display: "block" }} />;
  }

  const updateWeapon = (id: string, fn: (w: Weapon) => Weapon) =>
    onChange((c) => ({ ...c, weapons: c.weapons.map((w) => (w.id === id ? fn(w) : w)) }));
  const removeWeapon = (id: string) =>
    onChange((c) => ({ ...c, weapons: c.weapons.filter((w) => w.id !== id) }));
  const addWeaponFromCatalog = (name: string) => {
    const entry =
      catalog.weapons.find((w) => w.name === name) ??
      ({ name: "New Weapon", slot: "other" as WeaponSlot, maxAmmo: 5 });
    onChange((c) => ({ ...c, weapons: [...c.weapons, createWeapon(entry)] }));
  };

  const totalAmmo = ch.weapons.reduce((a, w) => a + w.ammo, 0);
  const maxAmmo = ch.weapons.reduce((a, w) => a + w.maxAmmo, 0);

  const cardStyle: React.CSSProperties = {
    background: benched ? "#15171c" : "var(--surface)",
    borderColor: ch.leftBehindLastMission ? "#52303a" : benched ? "#23272f" : "var(--border-soft)",
    opacity: benched ? 0.7 : 1,
    boxShadow: ch.leftBehindLastMission ? "inset 3px 0 0 var(--danger)" : "none"
  };

  return (
    <div className={`card${open ? "" : " collapsed"}`} style={cardStyle}>
      {/* head */}
      <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <input
            value={ch.nickname}
            onChange={(e) => onChange((c) => ({ ...c, nickname: e.target.value }))}
            className="display inline-edit"
            aria-label="nickname"
            style={{ fontWeight: 700, fontSize: 21, width: "90%" }}
          />
          <div className="row" style={{ gap: 8, marginTop: 6 }}>
            <input
              value={ch.playerName}
              placeholder="player"
              onChange={(e) => onChange((c) => ({ ...c, playerName: e.target.value }))}
              className="mono inline-edit"
              aria-label="player name"
              style={{ fontSize: 11, width: 96, color: "var(--muted-3)" }}
            />
            <span className="tag">{ROLE_LABEL[ch.dwarfClass]}</span>
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            flex: "0 0 auto",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: statusColor,
            background: "rgba(255,255,255,.03)",
            border: `1px solid ${statusColor}55`,
            borderRadius: 7,
            padding: "5px 9px"
          }}
        >
          {statusIcon}
          <span>{statusLabel}</span>
        </div>
        <button
          className={`collapse-toggle${open ? " open" : ""}`}
          aria-label={open ? "Collapse" : "Expand"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronIcon s={16} />
        </button>
      </div>

      {!open ? (
        /* compact summary */
        <div className="row between" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", color: "var(--muted-2)", textTransform: "uppercase" }}>{TERMS.hp}</span>
            <div className="summary-pips">
              {Array.from({ length: ch.maxHp }, (_, i) => (
                <span key={i} className="pip" style={{ background: i < ch.hp ? pipFill(ch.hp, ch.maxHp) : "#20252f" }} />
              ))}
            </div>
            <span className="display" style={{ fontSize: 16, fontWeight: 700, color: pipFill(ch.hp, ch.maxHp) }}>{ch.hp}</span>
          </div>
          <div className="row mono" style={{ gap: 10, fontSize: 11, color: "var(--muted-3)" }}>
            <span>{totalAmmo}/{maxAmmo} ammo</span>
            {ch.grenades > 0 && <span>💣{ch.grenades}</span>}
            {critical && <span style={{ color: "var(--danger)", fontWeight: 700 }}>⚠</span>}
          </div>
        </div>
      ) : (
        <>
          {/* HP */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div className="row between">
              <span className="section-label">{TERMS.hp}</span>
              {critical && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--danger)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em" }}>
                  <WarnIcon s={13} c="var(--danger)" /> CRITICAL
                </span>
              )}
            </div>
            <Stepper value={ch.hp} min={0} max={ch.maxHp} tone="hp" size="lg" showMax label={`${ch.nickname} integrity`} onChange={(hp) => onChange((c) => ({ ...c, hp }))} />
          </div>

          {/* stat grid */}
          <div className="grid-2">
            <StatCell label={TERMS.grenades}>
              <Stepper value={ch.grenades} label="grenades" size="md" onChange={(grenades) => onChange((c) => ({ ...c, grenades }))} />
            </StatCell>
            <StatCell label={TERMS.cards}>
              <Stepper value={ch.rockNStoneCards} label="rally cards" size="md" onChange={(rockNStoneCards) => onChange((c) => ({ ...c, rockNStoneCards }))} />
            </StatCell>
            <StatCell label={TERMS.tokens}>
              <Stepper value={ch.uninstalledUpgrades} label="upgrade tokens" size="md" onChange={(uninstalledUpgrades) => onChange((c) => ({ ...c, uninstalledUpgrades }))} />
            </StatCell>
            <StatCell label={TERMS.personalGold} gold>
              <Stepper value={ch.personalGold} tone="gold" label="personal gold" size="md" onChange={(personalGold) => onChange((c) => ({ ...c, personalGold }))} />
            </StatCell>
          </div>

          {/* loadout */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="row between">
              <span className="section-label">Loadout</span>
              <span style={{ fontSize: 11, color: "var(--muted-4)" }}>{ch.weapons.filter((w) => w.equipped).length} equipped</span>
            </div>
            {ch.weapons.map((w) => {
              const lowAmmo = w.maxAmmo > 0 && w.ammo / w.maxAmmo <= 0.25;
              return (
                <div key={w.id} className="weapon">
                  <div className="row" style={{ gap: 8 }}>
                    <SlotMark slot={w.slot} />
                    <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                      <input
                        value={w.name}
                        list="cat-weapon-names"
                        onChange={(e) => updateWeapon(w.id, (x) => ({ ...x, name: e.target.value }))}
                        className="inline-edit"
                        aria-label="weapon name"
                        style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}
                      />
                      <select
                        value={w.slot}
                        aria-label="weapon slot"
                        onChange={(e) => updateWeapon(w.id, (x) => ({ ...x, slot: e.target.value as WeaponSlot }))}
                        className="mono"
                        style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-3)", background: "transparent", border: "none", padding: 0, width: "auto", marginTop: 1 }}
                      >
                        <option value="primary">{slotLabel("primary")}</option>
                        <option value="secondary">{slotLabel("secondary")}</option>
                        <option value="other">{slotLabel("other")}</option>
                      </select>
                    </div>
                    <button className={`mini-toggle ${w.equipped ? "on-ok" : ""}`} onClick={() => updateWeapon(w.id, (x) => ({ ...x, equipped: !x.equipped }))}>
                      {w.equipped ? "Equipped" : "Stowed"}
                    </button>
                    <button className={`mini-toggle ${w.overclocked ? "on-gold" : ""}`} onClick={() => updateWeapon(w.id, (x) => ({ ...x, overclocked: !x.overclocked }))}>
                      <BoltIcon s={12} /> OD
                    </button>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="mono" style={{ fontSize: 9.5, letterSpacing: "0.12em", color: "var(--muted-2)", textTransform: "uppercase", flex: "0 0 38px" }}>Ammo</span>
                    <div style={{ flex: "1 1 auto" }}>
                      <Stepper value={w.ammo} min={0} max={w.maxAmmo} tone={lowAmmo ? "danger" : "neutral"} size="md" showMax showPips label="ammo" onChange={(ammo) => updateWeapon(w.id, (x) => ({ ...x, ammo }))} />
                    </div>
                  </div>
                  <div className="row wrap" style={{ gap: 6 }}>
                    {w.upgrades.map((u, i) => (
                      <button key={i} type="button" className="tag" style={{ cursor: "pointer" }} aria-label={`Remove upgrade ${u}`} onClick={() => updateWeapon(w.id, (x) => ({ ...x, upgrades: x.upgrades.filter((_, j) => j !== i) }))}>
                        {u} ✕
                      </button>
                    ))}
                    <button className="mini-toggle" onClick={() => updateWeapon(w.id, (x) => ({ ...x, upgrades: [...x.upgrades, catalog.upgrades[0] ?? "Upgrade"] }))}>+ Mod</button>
                    <button className="mini-toggle" style={{ color: "var(--danger-soft)" }} onClick={() => removeWeapon(w.id)}>Remove</button>
                  </div>
                </div>
              );
            })}
            <select
              defaultValue=""
              aria-label="add weapon from catalog"
              onChange={(e) => {
                if (e.target.value) {
                  addWeaponFromCatalog(e.target.value);
                  e.target.value = "";
                }
              }}
              style={{ fontSize: 13 }}
            >
              <option value="">+ Add weapon from catalog…</option>
              {catalog.weapons.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name} ({slotLabel(w.slot)})
                </option>
              ))}
            </select>
          </div>

          {/* effects */}
          {ch.temporaryEffects.length > 0 && (
            <div className="row wrap" style={{ gap: 6 }}>
              <span className="section-label" style={{ marginRight: 2 }}>{TERMS.effects}</span>
              {ch.temporaryEffects.map((fx, i) => (
                <button key={i} type="button" className="tag ok" style={{ cursor: "pointer" }} aria-label={`Remove effect ${fx}`} onClick={() => onChange((c) => ({ ...c, temporaryEffects: c.temporaryEffects.filter((_, j) => j !== i) }))}>
                  🍺 {fx} ✕
                </button>
              ))}
            </div>
          )}

          {/* notes */}
          <textarea
            placeholder="Notes…"
            aria-label={`${ch.nickname} notes`}
            value={ch.notes}
            onChange={(e) => onChange((c) => ({ ...c, notes: e.target.value }))}
            className="inline-edit"
            style={{ fontSize: 12, fontStyle: ch.notes ? "italic" : "normal", minHeight: 44 }}
          />

          {/* footer toggles */}
          <div className="row" style={{ gap: 8, borderTop: "1px solid #21262f", paddingTop: 11 }}>
            <button
              className="btn"
              style={{ flex: 1, fontSize: 12, padding: 10, color: ch.leftBehindLastMission ? "var(--danger-soft)" : "var(--muted)", background: ch.leftBehindLastMission ? "rgba(255,93,93,.12)" : "var(--surface-2)", borderColor: ch.leftBehindLastMission ? "rgba(255,93,93,.3)" : "var(--border)" }}
              onClick={() => onChange((c) => ({ ...c, leftBehindLastMission: !c.leftBehindLastMission }))}
            >
              {ch.leftBehindLastMission ? "Left Behind" : "Mark Left Behind"}
            </button>
            <button
              className="btn"
              style={{ flex: 1, fontSize: 12, padding: 10, color: ch.active ? "var(--ok-soft)" : "var(--muted-3)", background: ch.active ? "rgba(74,222,128,.1)" : "var(--surface-2)", borderColor: ch.active ? "rgba(74,222,128,.28)" : "var(--border)" }}
              onClick={() => onChange((c) => ({ ...c, active: !c.active }))}
            >
              {ch.active ? "On Duty" : "Benched"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCell({ label, gold, children }: { label: string; gold?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", color: gold ? "var(--gold)" : "var(--muted-2)", textTransform: "uppercase" }}>
        {label}
      </span>
      {children}
    </div>
  );
}
