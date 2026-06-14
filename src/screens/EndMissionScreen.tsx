import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { Stepper } from "../components/Stepper";
import { GoldIcon, NitraIcon, CheckIcon, WarnIcon } from "../components/icons";
import { splitGold } from "../domain/economy";
import { resolvePenaltyFlags } from "../domain/character";
import type { MissionResult } from "../domain/types";

export function EndMissionScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const recordMissionResult = useStore((s) => s.recordMissionResult);

  const mission = campaign.recipe.missions[campaign.currentMissionIndex];

  const [success, setSuccess] = useState(true);
  const [primary, setPrimary] = useState(true);
  const [secondary, setSecondary] = useState(false);
  const [gold, setGold] = useState(0);
  const [nitra, setNitra] = useState(0);
  const [notes, setNotes] = useState("");
  const [leftBehind, setLeftBehind] = useState<string[]>([]);

  const activeDwarves = campaign.players.filter((p) => p.active);
  const escapedIds = activeDwarves.filter((p) => !leftBehind.includes(p.id)).map((p) => p.id);
  const split = useMemo(() => splitGold(gold, escapedIds.length), [gold, escapedIds.length]);

  const penaltyFlags = resolvePenaltyFlags(campaign.houseRules);
  const leftNames = campaign.players.filter((p) => leftBehind.includes(p.id)).map((p) => p.nickname);

  const toggleLeftBehind = (id: string) =>
    setLeftBehind((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    const result: MissionResult = {
      missionIndex: campaign.currentMissionIndex,
      missionName: mission?.name ?? `Mission ${campaign.currentMissionIndex + 1}`,
      missionType: mission?.missionType ?? "",
      success,
      primaryComplete: primary,
      secondaryComplete: secondary,
      goldCollected: gold,
      nitraCollected: nitra,
      escapedCharacterIds: escapedIds,
      leftBehindCharacterIds: leftBehind,
      warnings: mission?.warnings ?? [],
      anomalies: mission?.anomalies ?? [],
      biome: mission?.biome ?? "",
      notes
    };
    recordMissionResult(result); // store opens the Management Report receipt
  };

  return (
    <>
      <div>
        <div className="eyebrow">Debrief</div>
        <div className="screen-title">End Mission</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          Recording Mission {campaign.currentMissionIndex + 1}
          {mission ? ` · ${mission.biome}` : ""}
        </div>
      </div>

      <div className="row" style={{ gap: 9 }}>
        <button className={`pill ${success ? "sel" : ""}`} onClick={() => setSuccess(true)}>Success</button>
        <button
          className="pill"
          style={!success ? { background: "var(--danger)", borderColor: "var(--danger)", color: "#1a0707" } : undefined}
          onClick={() => setSuccess(false)}
        >
          Failure
        </button>
      </div>

      <div className="card">
        <span className="section-label">Objectives</span>
        <div className="row between">
          <span style={{ fontSize: 13.5, color: "var(--text-2)", fontWeight: 500 }}>Primary objective</span>
          <button className={`mini-toggle ${primary ? "on-ok" : ""}`} onClick={() => setPrimary((v) => !v)}>
            {primary ? "Complete" : "Not done"}
          </button>
        </div>
        <div className="divider" />
        <div className="row between">
          <span style={{ fontSize: 13.5, color: "var(--text-2)", fontWeight: 500 }}>Secondary objective</span>
          <button className={`mini-toggle ${secondary ? "on-ok" : ""}`} onClick={() => setSecondary((v) => !v)}>
            {secondary ? "Complete" : "Skipped"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="section-label">Resources Recovered</span>
        <div className="card" style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: "11px 12px" }}>
          <div className="row" style={{ gap: 8, flex: "0 0 86px" }}>
            <GoldIcon s={18} /> <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>Gold</span>
          </div>
          <div style={{ flex: "1 1 auto" }}>
            <Stepper value={gold} max={999} tone="gold" size="md" label="gold" onChange={setGold} />
          </div>
        </div>
        <div className="card" style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: "11px 12px" }}>
          <div className="row" style={{ gap: 8, flex: "0 0 86px" }}>
            <NitraIcon s={18} /> <span style={{ fontSize: 13, fontWeight: 600, color: "var(--nitra)" }}>Nitra</span>
          </div>
          <div style={{ flex: "1 1 auto" }}>
            <Stepper value={nitra} max={999} tone="nitra" size="md" label="nitra" onChange={setNitra} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span className="section-label">Who Escaped?</span>
        {activeDwarves.map((p) => {
          const esc = !leftBehind.includes(p.id);
          return (
            <div
              key={p.id}
              className="row between"
              style={{ padding: "10px 12px", background: "var(--surface-2)", border: `1px solid ${esc ? "#28323a" : "#3a2a30"}`, borderRadius: 11 }}
            >
              <span className="display" style={{ fontWeight: 600, fontSize: 16, color: "var(--text-2)" }}>{p.nickname}</span>
              <button
                className="mini-toggle"
                style={{ color: esc ? "var(--ok-soft)" : "var(--danger-soft)", background: esc ? "rgba(74,222,128,.12)" : "rgba(255,93,93,.12)", borderColor: esc ? "rgba(74,222,128,.3)" : "rgba(255,93,93,.3)", padding: "9px 13px" }}
                onClick={() => toggleLeftBehind(p.id)}
              >
                {esc ? <CheckIcon s={13} c="var(--ok-soft)" /> : <WarnIcon s={13} c="var(--danger-soft)" />}
                {esc ? "Escaped" : "Left Behind"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ background: "linear-gradient(180deg,rgba(255,176,0,.06),rgba(255,176,0,0))", borderColor: "rgba(255,176,0,.25)", gap: 10 }}>
        <div className="row between">
          <span className="section-label gold">Gold Split Preview</span>
          <GoldIcon s={16} />
        </div>
        <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="display" style={{ fontWeight: 700, fontSize: 38, color: "var(--gold)", lineHeight: 1 }}>{split.perPlayer}</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Gold to each of {escapedIds.length} survivors</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-2)", borderTop: "1px dashed rgba(255,176,0,.25)", paddingTop: 9 }}>
          Leftover <b style={{ color: "var(--text-2)" }}>{split.leftover}</b> Gold rolls into the team vault.
        </div>
      </div>

      {leftNames.length > 0 && (
        <div className="card" style={{ background: "rgba(255,93,93,.05)", borderColor: "rgba(255,93,93,.25)", gap: 8 }}>
          <div className="row" style={{ gap: 7 }}>
            <WarnIcon s={15} c="var(--danger-soft)" />
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--danger-soft)", textTransform: "uppercase" }}>
              Left-Behind Penalty · {campaign.houseRules.leftBehindPenalty}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600 }}>{leftNames.join(", ")}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            {penaltyDescription(penaltyFlags)}
          </div>
        </div>
      )}

      <textarea placeholder="Notes…" aria-label="Mission notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <button className="btn primary full" onClick={submit}>
        File Management Report
      </button>
    </>
  );
}

function penaltyDescription(flags: ReturnType<typeof resolvePenaltyFlags>): string {
  const parts: string[] = [];
  if (flags.healToFull) parts.push("returns at full HP");
  if (flags.reloadEquipped) parts.push("weapons reloaded");
  const loses: string[] = [];
  if (flags.loseGrenades) loses.push("grenades");
  if (flags.loseRockNStoneCards) loses.push("rally cards");
  if (flags.loseUninstalledUpgrades) loses.push("uninstalled upgrades");
  if (flags.loseOverclocks) loses.push("overdrive");
  if (flags.loseNonEquippedWeapons) loses.push("stowed weapons");
  if (flags.losePersonalGold) loses.push("personal Gold");
  let s = parts.join(", ");
  if (loses.length) s += `. Loses ${loses.join(", ")}`;
  return s + ". Keeps permanent progression.";
}
