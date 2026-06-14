import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { randomSeed } from "../domain/prng";
import type {
  CampaignMode,
  Difficulty,
  DwarfClass
} from "../domain/types";

const MODES: { value: CampaignMode; label: string; hint: string }[] = [
  { value: "official", label: "Official Assistant", hint: "Minimal house rules" },
  { value: "economy", label: "Economy Campaign", hint: "Rig shop + carryover" },
  { value: "hardcore", label: "Deeper Dive", hint: "Harsher fan rules" }
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "greenbeard", label: "Greenbeard" },
  { value: "regular", label: "Regular" },
  { value: "hazard4", label: "Hazard 4" },
  { value: "hazard5", label: "Hazard 5" },
  { value: "management", label: "Management Hates You" }
];

const CLASS_CYCLE: DwarfClass[] = ["scout", "engineer", "gunner", "driller"];

export function CampaignSetupScreen() {
  const newCampaign = useStore((s) => s.newCampaign);
  const navigate = useNavigate();

  const [name, setName] = useState("New Campaign");
  const [mode, setMode] = useState<CampaignMode>("economy");
  const [playerCount, setPlayerCount] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>("hazard4");
  const [seed, setSeed] = useState(randomSeed());
  const [classes, setClasses] = useState<DwarfClass[]>(CLASS_CYCLE);

  const setClassAt = (i: number, c: DwarfClass) => {
    setClasses((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });
  };

  const create = () => {
    newCampaign({
      name: name.trim() || "New Campaign",
      mode,
      playerCount,
      difficulty,
      seed: seed.trim() || randomSeed(),
      classes: classes.slice(0, playerCount)
    });
    navigate("/characters");
  };

  return (
    <div>
      <div className="card">
        <h2>New Campaign</h2>

        <label>Campaign name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Mode</label>
        <div className="pill-toggle">
          {MODES.map((m) => (
            <button
              key={m.value}
              className={mode === m.value ? "sel" : ""}
              onClick={() => setMode(m.value)}
              title={m.hint}
            >
              {m.label}
            </button>
          ))}
        </div>

        <label>Players</label>
        <div className="pill-toggle">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={playerCount === n ? "sel" : ""}
              onClick={() => setPlayerCount(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <label>Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <label>Seed (for recipe randomization)</label>
        <div className="row">
          <input value={seed} onChange={(e) => setSeed(e.target.value)} />
          <button onClick={() => setSeed(randomSeed())}>🎲</button>
        </div>
      </div>

      <div className="card">
        <h3>Starting roles</h3>
        {Array.from({ length: playerCount }, (_, i) => (
          <div key={i} className="row between" style={{ marginBottom: 8 }}>
            <span>Dwarf {i + 1}</span>
            <select
              value={classes[i] ?? "custom"}
              onChange={(e) => setClassAt(i, e.target.value as DwarfClass)}
              style={{ width: "60%" }}
            >
              {["scout", "engineer", "gunner", "driller", "custom"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button className="primary full" onClick={create}>
        Create Campaign
      </button>
      <div className="spacer" />
      <button className="ghost full" onClick={() => navigate("/")}>
        Cancel
      </button>
    </div>
  );
}
