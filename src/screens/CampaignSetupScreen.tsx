import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { randomSeed } from "../domain/prng";
import { MODE_SHORT, ROLE_LABEL, ROLE_ORDER } from "../ui/labels";
import { RerollIcon } from "../components/icons";
import type { CampaignMode, Difficulty, DwarfClass } from "../domain/types";

const MODES: CampaignMode[] = ["official", "economy", "hardcore"];
const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "greenbeard", label: "Greenbeard" },
  { value: "regular", label: "Regular" },
  { value: "hazard4", label: "Hazard 4" },
  { value: "hazard5", label: "Hazard 5" },
  { value: "management", label: "Management Hates You" }
];
const DEFAULT_ROLES: DwarfClass[] = ["gunner", "scout", "engineer", "driller"];

export function CampaignSetupScreen() {
  const newCampaign = useStore((s) => s.newCampaign);
  const showToast = useStore((s) => s.showToast);
  const navigate = useNavigate();

  const [name, setName] = useState("New Expedition");
  const [mode, setMode] = useState<CampaignMode>("economy");
  const [playerCount, setPlayerCount] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>("regular");
  const [seed, setSeed] = useState(randomSeed());
  const [classes, setClasses] = useState<DwarfClass[]>(DEFAULT_ROLES);

  const cycleRole = (i: number) =>
    setClasses((prev) => {
      const next = [...prev];
      const cur = ROLE_ORDER.indexOf(next[i] ?? "custom");
      next[i] = ROLE_ORDER[(cur + 1) % ROLE_ORDER.length];
      return next;
    });

  const create = () => {
    newCampaign({
      name: name.trim() || "New Expedition",
      mode,
      playerCount,
      difficulty,
      seed: seed.trim() || randomSeed(),
      classes: classes.slice(0, playerCount)
    });
    showToast("Campaign created · crew assembled", "ok");
    navigate("/characters");
  };

  return (
    <>
      <div>
        <div className="eyebrow">Configure</div>
        <div className="screen-title">New Campaign</div>
      </div>

      <div>
        <label className="field-label">Campaign Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="display" style={{ fontWeight: 600, fontSize: 18 }} />
      </div>

      <div>
        <label className="field-label">Mode</label>
        <div className="pill-row">
          {MODES.map((m) => (
            <button key={m} className={`pill ${mode === m ? "sel" : ""}`} onClick={() => setMode(m)}>
              {MODE_SHORT[m]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Players</label>
        <div className="pill-row">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className={`pill ${playerCount === n ? "sel" : ""}`} style={{ fontSize: 17 }} onClick={() => setPlayerCount(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Difficulty</label>
        <div className="pill-row scroll qm-scroll">
          {DIFFICULTIES.map((d) => (
            <button key={d.value} className={`pill compact ${difficulty === d.value ? "sel" : ""}`} onClick={() => setDifficulty(d.value)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Seed</label>
        <div className="row" style={{ gap: 8 }}>
          <input value={seed} onChange={(e) => setSeed(e.target.value)} className="mono" style={{ letterSpacing: "0.06em" }} />
          <button className="icon-btn" style={{ width: 52, height: "auto", color: "var(--gold)" }} aria-label="Reroll seed" onClick={() => setSeed(randomSeed())}>
            <RerollIcon />
          </button>
        </div>
      </div>

      <div>
        <label className="field-label">Crew Roles</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className="row between" style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "11px 13px" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--muted-2)", letterSpacing: "0.04em" }}>Slot {i + 1}</span>
              <button
                className="display"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 15, color: "var(--text-2)", background: "var(--surface-3)", border: "1px solid #333a47", borderRadius: 9, padding: "7px 13px", cursor: "pointer" }}
                onClick={() => cycleRole(i)}
              >
                {ROLE_LABEL[classes[i] ?? "custom"]}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--muted-3)"><path d="M7 10l5 5 5-5z" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="btn primary full" onClick={create}>Assemble Crew</button>
      <button className="btn ghost full" onClick={() => navigate("/")}>Cancel</button>
    </>
  );
}
