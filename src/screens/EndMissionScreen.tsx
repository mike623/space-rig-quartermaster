import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { Stepper } from "../components/Stepper";
import { splitGold } from "../domain/economy";
import { resolvePenaltyFlags, applyLeftBehindPenalty } from "../domain/character";
import { reportToText } from "../domain/report";
import type { ManagementReport, MissionResult } from "../domain/types";

export function EndMissionScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const recordMissionResult = useStore((s) => s.recordMissionResult);
  const navigate = useNavigate();

  const mission = campaign.recipe.missions[campaign.currentMissionIndex];

  const [success, setSuccess] = useState(true);
  const [primary, setPrimary] = useState(true);
  const [secondary, setSecondary] = useState(false);
  const [gold, setGold] = useState(0);
  const [nitra, setNitra] = useState(0);
  const [notes, setNotes] = useState("");
  const [leftBehind, setLeftBehind] = useState<string[]>([]);
  const [report, setReport] = useState<ManagementReport | null>(null);

  const escapedIds = campaign.players
    .filter((p) => p.active && !leftBehind.includes(p.id))
    .map((p) => p.id);

  const split = useMemo(
    () => splitGold(gold, escapedIds.length),
    [gold, escapedIds.length]
  );

  const penaltyFlags = resolvePenaltyFlags(campaign.houseRules);
  const penaltyPreview = campaign.players
    .filter((p) => leftBehind.includes(p.id))
    .map((p) => ({
      name: p.nickname,
      effects: applyLeftBehindPenalty(p, penaltyFlags).effects
    }));

  const toggleLeftBehind = (id: string) =>
    setLeftBehind((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

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
    setReport(recordMissionResult(result));
  };

  if (report) {
    return (
      <div>
        <div className="banner ok">Mission recorded. Resources updated.</div>
        <div className="card">
          <h2>Management Report</h2>
          <pre className="report">{reportToText(report)}</pre>
          <div className="row">
            <button
              onClick={() =>
                navigator.clipboard?.writeText(reportToText(report))
              }
            >
              Copy
            </button>
            <button className="primary" onClick={() => navigate("/shop")}>
              Go to Rig Shop →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>End Mission {campaign.currentMissionIndex + 1}</h2>
        {mission ? (
          <p className="muted">
            {mission.missionType} · {mission.biome}
            {mission.warnings.length ? ` · ${mission.warnings.join(", ")}` : ""}
          </p>
        ) : null}

        <div className="pill-toggle">
          <button
            className={success ? "sel" : ""}
            onClick={() => setSuccess(true)}
          >
            Success
          </button>
          <button
            className={!success ? "sel" : ""}
            onClick={() => setSuccess(false)}
          >
            Failure
          </button>
        </div>

        <div className="pill-toggle" style={{ marginTop: 8 }}>
          <button
            className={primary ? "sel" : ""}
            onClick={() => setPrimary((v) => !v)}
          >
            Primary {primary ? "✓" : "✗"}
          </button>
          <button
            className={secondary ? "sel" : ""}
            onClick={() => setSecondary((v) => !v)}
          >
            Secondary {secondary ? "✓" : "✗"}
          </button>
        </div>

        <div className="grid-2" style={{ marginTop: 12 }}>
          <div>
            <label>Gold collected</label>
            <Stepper value={gold} max={999} onChange={setGold} />
          </div>
          <div>
            <label>Nitra collected</label>
            <Stepper value={nitra} max={999} onChange={setNitra} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Who escaped?</h3>
        <p className="muted">Tap a dwarf to mark them left behind.</p>
        <div className="pill-toggle">
          {campaign.players
            .filter((p) => p.active)
            .map((p) => (
              <button
                key={p.id}
                className={leftBehind.includes(p.id) ? "" : "sel"}
                onClick={() => toggleLeftBehind(p.id)}
              >
                {p.nickname}
                <br />
                <small>{leftBehind.includes(p.id) ? "Left behind" : "Escaped"}</small>
              </button>
            ))}
        </div>
      </div>

      <div className="card">
        <h3>Gold split preview</h3>
        <div className="row between">
          <span>Per escaped dwarf</span>
          <strong>{split.perPlayer} Gold</strong>
        </div>
        <div className="row between">
          <span>Leftover → team pool</span>
          <strong>{split.leftover} Gold</strong>
        </div>
        <div className="row between">
          <span>Nitra → team pool</span>
          <strong>{nitra}</strong>
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          Split is auto-calculated; you can adjust per-dwarf gold on the Dwarves
          screen after recording.
        </p>
      </div>

      {penaltyPreview.length > 0 && (
        <div className="card">
          <h3>Left-behind penalty preview</h3>
          {penaltyPreview.map((p) => (
            <div key={p.name} style={{ marginBottom: 8 }}>
              <strong>{p.name}</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                {p.effects.length ? p.effects.join(", ") : "No changes"}
              </div>
            </div>
          ))}
          <p className="muted" style={{ fontSize: 12 }}>
            Penalty mode: {campaign.houseRules.leftBehindPenalty}. Applied when
            you record the mission.
          </p>
        </div>
      )}

      <label>Notes</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="spacer" />
      <button className="primary full" onClick={submit}>
        Record Mission & Apply Penalties
      </button>
    </div>
  );
}
