import { useState } from "react";
import { useStore } from "../state/store";
import { GoldIcon, NitraIcon, ShieldIcon, WarnIcon, CheckIcon, LaunchIcon } from "../components/icons";

export function LaunchScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const launchNextMission = useStore((s) => s.launchNextMission);
  const [step, setStep] = useState<0 | 1>(0);

  const willLoseGold = campaign.houseRules.loseUnspentGold ? campaign.resources.teamGold : 0;
  const willLoseNitra = campaign.houseRules.loseUnspentNitra ? campaign.resources.teamNitra : 0;
  const next = campaign.recipe.missions[campaign.currentMissionIndex + 1];
  const activeDwarves = campaign.players.filter((p) => p.active);

  const confirm = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    launchNextMission(); // store opens confiscation report
    setStep(0);
  };

  return (
    <>
      <div>
        <div className="eyebrow">Pre-Descent</div>
        <div className="screen-title">Launch Check</div>
      </div>

      {/* next assignment */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#1a1e26 0%,#15181e 100%)", border: "1px solid var(--border)", borderRadius: 16, padding: 15 }}>
        <div className="section-label">Next Assignment</div>
        {next ? (
          <>
            <div className="row" style={{ alignItems: "baseline", gap: 9, marginTop: 6 }}>
              <span className="display" style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", background: "rgba(255,176,0,.12)", border: "1px solid rgba(255,176,0,.3)", padding: "2px 8px", borderRadius: 6 }}>
                #{next.index + 1}
              </span>
              <span className="display" style={{ fontWeight: 700, fontSize: 23, color: "var(--text)" }}>{next.biome}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{next.missionType}</div>
            {(next.warnings.length > 0 || next.anomalies.length > 0) && (
              <div className="row wrap" style={{ gap: 6, marginTop: 11 }}>
                {next.warnings.map((w) => (
                  <span key={w} className="tag warn"><WarnIcon s={11} c="var(--warnText)" /> {w}</span>
                ))}
                {next.anomalies.map((a) => (
                  <span key={a} className="tag">✦ {a}</span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 16, color: "var(--text)", marginTop: 6 }} className="display">Campaign complete</div>
        )}
      </div>

      {/* crew readiness */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="section-label">Crew Readiness</span>
        {activeDwarves.map((d) => {
          const pct = d.maxHp > 0 ? d.hp / d.maxHp : 0;
          const lowHp = pct <= 0.25 || d.hp <= 1;
          const hpColor = lowHp ? "var(--danger)" : pct <= 0.5 ? "var(--gold)" : "var(--ok)";
          const totalAmmo = d.weapons.reduce((a, w) => a + w.ammo, 0);
          const maxAmmo = d.weapons.reduce((a, w) => a + w.maxAmmo, 0);
          const lowAmmo = d.weapons.some((w) => w.equipped && w.maxAmmo > 0 && w.ammo / w.maxAmmo <= 0.25);
          const ready = !lowHp && !lowAmmo && !d.leftBehindLastMission;
          const sc = d.leftBehindLastMission ? "var(--danger)" : ready ? "var(--ok)" : "var(--gold)";
          return (
            <div key={d.id} className="row" style={{ gap: 10, padding: "11px 12px", background: "var(--surface)", border: `1px solid ${d.leftBehindLastMission ? "#3a2a30" : "var(--border-soft)"}`, borderRadius: 12 }}>
              {d.leftBehindLastMission || !ready ? <WarnIcon s={14} c={sc} /> : <CheckIcon s={14} c={sc} />}
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div className="row" style={{ gap: 7 }}>
                  <span className="display" style={{ fontWeight: 600, fontSize: 16, color: "var(--text-2)" }}>{d.nickname}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: sc, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {d.leftBehindLastMission ? "Left behind" : ready ? "Ready" : "Check"}
                  </span>
                </div>
              </div>
              <div className="row mono" style={{ gap: 10, fontSize: 11 }}>
                <span style={{ color: hpColor, fontWeight: 600 }}>{d.hp}/{d.maxHp}</span>
                <span style={{ color: lowAmmo ? "var(--gold)" : "var(--muted-3)" }}>{totalAmmo}/{maxAmmo}</span>
                {d.grenades > 0 && <span style={{ color: "var(--muted-3)" }}>💣{d.grenades}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* confiscation */}
      <div className="card" style={{ background: "rgba(255,176,0,.06)", borderColor: "rgba(255,176,0,.3)", gap: 11 }}>
        <div className="row" style={{ gap: 8 }}>
          <ShieldIcon s={17} />
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--gold)", textTransform: "uppercase" }}>
            Management Confiscation
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#cdd4df", lineHeight: 1.55 }}>
          Anything left in the vault at launch becomes Company property. Spend it at the Rig Shop or kiss it goodbye.
        </p>
        <div className="row" style={{ gap: 10 }}>
          <div className="row" style={{ flex: "1 1 0", gap: 9, background: "var(--inset)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 12px" }}>
            <GoldIcon s={18} />
            <div style={{ lineHeight: 1 }}>
              <div className="display" style={{ fontWeight: 700, fontSize: 21, color: "var(--gold)" }}>{willLoseGold}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--muted-4)", textTransform: "uppercase", marginTop: 2 }}>Gold at risk</div>
            </div>
          </div>
          <div className="row" style={{ flex: "1 1 0", gap: 9, background: "var(--inset)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 12px" }}>
            <NitraIcon s={18} />
            <div style={{ lineHeight: 1 }}>
              <div className="display" style={{ fontWeight: 700, fontSize: 21, color: "var(--nitra)" }}>{willLoseNitra}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--muted-4)", textTransform: "uppercase", marginTop: 2 }}>Nitra at risk</div>
            </div>
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="card" style={{ borderColor: "#3a3220", gap: 12, animation: "qmPop .18s ease" }}>
          <div className="display" style={{ fontWeight: 700, fontSize: 18 }}>Confirm confiscation</div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
            Launching {next ? <b style={{ color: "var(--text-2)" }}>{next.biome}</b> : "the next mission"} will zero the vault: <b style={{ color: "var(--gold)" }}>{willLoseGold} Gold</b> and <b style={{ color: "var(--nitra)" }}>{willLoseNitra} Nitra</b> go to Management.
          </div>
          <div className="row" style={{ gap: 9 }}>
            <button className="btn ghost" style={{ flex: "0 0 auto" }} onClick={() => setStep(0)}>Cancel</button>
            <button className="btn primary" style={{ flex: 1, fontSize: 16 }} onClick={confirm}>
              <LaunchIcon s={18} /> Confiscate &amp; Launch
            </button>
          </div>
        </div>
      ) : (
        <button className="btn full" style={{ background: "var(--surface-3)", borderColor: "#3b4250", color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "0.04em", textTransform: "uppercase", padding: 16 }} onClick={confirm}>
          <LaunchIcon s={19} /> Review Launch
        </button>
      )}
    </>
  );
}
