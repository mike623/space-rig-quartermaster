import { useStore } from "../state/store";
import { reportToText } from "../domain/report";
import { exportRecipe } from "../domain/sharing";
import { CatalogEditor } from "../components/CatalogEditor";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeName(s: string) {
  return s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

export function HistoryScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const exportActive = useStore((s) => s.exportActive);
  const regenerateRecipe = useStore((s) => s.regenerateRecipe);

  const exportState = () => {
    const json = exportActive();
    if (json) download(`${safeName(campaign.name)}-state.json`, json);
  };

  const exportRecipeFile = () => {
    download(
      `${safeName(campaign.name)}-recipe.json`,
      exportRecipe(campaign.recipe)
    );
  };

  const entries = campaign.history.slice().reverse();

  return (
    <div>
      <div className="card">
        <h2>Share & Export</h2>
        <button className="primary full" onClick={exportState}>
          Export campaign state JSON
        </button>
        <div className="spacer" />
        <button className="full" onClick={exportRecipeFile}>
          Export recipe-only JSON
        </button>
        <p className="muted" style={{ fontSize: 12 }}>
          State includes live HP/ammo/progress. Recipe is just the
          seed/missions/rules for sharing a fresh challenge.
        </p>
      </div>

      <div className="card">
        <div className="row between">
          <h2>Campaign Recipe</h2>
          <button
            className="ghost"
            onClick={() =>
              regenerateRecipe({
                difficulty: campaign.difficulty,
                assignmentLength: (campaign.recipe.assignmentLength || 5) as
                  | 3
                  | 5
                  | 7
                  | 0
              })
            }
          >
            Regenerate
          </button>
        </div>
        <p className="muted">
          Seed <strong>{campaign.recipe.seed}</strong> · {campaign.difficulty}
        </p>
        {campaign.recipe.missions.map((m) => (
          <div
            key={m.id}
            className="shop-item"
            style={{
              opacity: m.index < campaign.currentMissionIndex ? 0.5 : 1
            }}
          >
            <div style={{ flex: 1 }}>
              <strong>
                {m.index === campaign.currentMissionIndex ? "▶ " : ""}
                {m.name}: {m.missionType}
              </strong>
              <div className="muted" style={{ fontSize: 12 }}>
                {m.biome}
                {m.warnings.length ? ` · ⚠ ${m.warnings.join(", ")}` : ""}
                {m.anomalies.length ? ` · ✦ ${m.anomalies.join(", ")}` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CatalogEditor />

      <div className="card">
        <h2>Mission Log</h2>
        {entries.length === 0 ? (
          <p className="muted">No history yet.</p>
        ) : (
          entries.map((h) => (
            <div key={h.id} style={{ marginBottom: 12 }}>
              <div className="row between">
                <strong>{h.title}</strong>
                <span className="tag">{h.kind}</span>
              </div>
              {h.report ? (
                <pre className="report">{reportToText(h.report)}</pre>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
