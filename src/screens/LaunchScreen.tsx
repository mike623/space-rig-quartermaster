import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";

export function LaunchScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const launchNextMission = useStore((s) => s.launchNextMission);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<{ gold: number; nitra: number } | null>(
    null
  );

  const willLoseGold =
    campaign.houseRules.loseUnspentGold ? campaign.resources.teamGold : 0;
  const willLoseNitra =
    campaign.houseRules.loseUnspentNitra ? campaign.resources.teamNitra : 0;

  const nextMission =
    campaign.recipe.missions[campaign.currentMissionIndex + 1];

  const launch = () => {
    const res = launchNextMission();
    setDone({ gold: res.confiscatedGold, nitra: res.confiscatedNitra });
    setConfirming(false);
  };

  if (done) {
    return (
      <div>
        <div className="banner ok">
          Launched. Management confiscated {done.gold} Gold and {done.nitra}{" "}
          Nitra.
        </div>
        <div className="card">
          <p>
            Now on <strong>Mission {campaign.currentMissionIndex + 1}</strong>.
          </p>
          <button className="primary full" onClick={() => navigate("/characters")}>
            Go to Dwarves
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Launch Next Mission</h2>
        <h3>Dwarf readiness</h3>
        {campaign.players
          .filter((p) => p.active)
          .map((p) => (
            <div key={p.id} className="row between" style={{ fontSize: 14 }}>
              <span>{p.nickname}</span>
              <span className="muted">
                HP {p.hp}/{p.maxHp} · Ammo{" "}
                {p.weapons.reduce((a, w) => a + w.ammo, 0)}/
                {p.weapons.reduce((a, w) => a + w.maxAmmo, 0)}
                {p.grenades ? ` · 💣${p.grenades}` : ""}
              </span>
            </div>
          ))}
      </div>

      <div className="card">
        <h3>Current resources</h3>
        <div className="resource-bar">
          <div className="res gold">
            <div className="n">{campaign.resources.teamGold}</div>
            <div className="muted">Team Gold</div>
          </div>
          <div className="res nitra">
            <div className="n">{campaign.resources.teamNitra}</div>
            <div className="muted">Team Nitra</div>
          </div>
        </div>
      </div>

      {nextMission ? (
        <div className="card">
          <h3>Next: {nextMission.name}</h3>
          <p className="muted">
            {nextMission.missionType} · {nextMission.biome}
          </p>
          <div className="row wrap">
            {nextMission.warnings.map((w) => (
              <span key={w} className="tag">
                ⚠ {w}
              </span>
            ))}
            {nextMission.anomalies.map((a) => (
              <span key={a} className="tag">
                ✦ {a}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="banner warn">
          No further mission in the recipe. Launching advances the counter; add
          more missions on the History/Recipe area or regenerate.
        </div>
      )}

      <div className="card">
        <h3>Resources to be confiscated</h3>
        {willLoseGold || willLoseNitra ? (
          <div className="banner warn">
            Launching will remove <strong>{willLoseGold} Gold</strong> and{" "}
            <strong>{willLoseNitra} Nitra</strong> (Management's cut). Spend them
            first if you want to keep value.
          </div>
        ) : (
          <p className="muted">
            Confiscation disabled by house rules — resources carry over.
          </p>
        )}

        {!confirming ? (
          <button className="primary full" onClick={() => setConfirming(true)}>
            Launch Mission {campaign.currentMissionIndex + 2}
          </button>
        ) : (
          <div>
            <div className="banner err">
              Confirm: this confiscates unspent resources and advances the
              campaign.
            </div>
            <div className="row">
              <button className="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className="primary" onClick={launch}>
                Confirm Launch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
