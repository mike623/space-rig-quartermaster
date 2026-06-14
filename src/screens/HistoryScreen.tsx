import { useStore } from "../state/store";
import { exportRecipe } from "../domain/sharing";
import { CatalogEditor } from "../components/CatalogEditor";
import { ExportIcon, ChevronIcon } from "../components/icons";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
const safeName = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

export function HistoryScreen() {
  const campaign = useStore((s) => s.campaign)!;
  const exportActive = useStore((s) => s.exportActive);
  const openReport = useStore((s) => s.openReport);
  const showToast = useStore((s) => s.showToast);

  const exportState = () => {
    const json = exportActive();
    if (json) {
      download(`${safeName(campaign.name)}-state.json`, json);
      showToast("Campaign state exported", "ok");
    }
  };
  const exportRecipeFile = () => {
    download(`${safeName(campaign.name)}-recipe.json`, exportRecipe(campaign.recipe));
    showToast("Recipe exported", "ok");
  };

  const entries = campaign.history.slice().reverse();

  return (
    <>
      <div>
        <div className="eyebrow">Campaign Record</div>
        <div className="screen-title">History</div>
      </div>

      <div className="row" style={{ gap: 9 }}>
        <button className="btn" style={{ flex: 1, fontSize: 12.5, padding: 12 }} onClick={exportState}>
          <ExportIcon /> State JSON
        </button>
        <button className="btn" style={{ flex: 1, fontSize: 12.5, padding: 12 }} onClick={exportRecipeFile}>
          <ExportIcon /> Recipe JSON
        </button>
      </div>

      {/* recipe */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span className="section-label">Assignment Recipe · {campaign.recipe.seed}</span>
        {campaign.recipe.missions.map((m) => {
          const isCur = m.index === campaign.currentMissionIndex;
          const done = m.index < campaign.currentMissionIndex;
          const dotColor = done ? "var(--ok)" : isCur ? "var(--gold)" : "#3f4654";
          const numColor = done ? "var(--muted-3)" : isCur ? "var(--gold)" : "#5b626e";
          return (
            <div
              key={m.id}
              className="row"
              style={{ gap: 11, padding: "11px 12px", background: isCur ? "rgba(255,176,0,.06)" : "var(--surface)", border: `1px solid ${isCur ? "rgba(255,176,0,.3)" : "var(--border-soft)"}`, borderRadius: 12 }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor, flex: "0 0 auto", boxShadow: isCur ? "0 0 0 4px rgba(255,176,0,.18)" : "none" }} />
              <span className="display" style={{ fontWeight: 700, fontSize: 16, color: numColor, flex: "0 0 26px" }}>#{m.index + 1}</span>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>{m.biome}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{m.missionType}</div>
              </div>
              {isCur && <span className="mono" style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>Current</span>}
            </div>
          );
        })}
      </div>

      {/* mission log */}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <span className="section-label">Mission Log</span>
          {entries.map((h) => {
            const isConf = h.kind === "confiscation";
            const col = isConf ? "var(--gold)" : "var(--ok)";
            return (
              <button
                key={h.id}
                className="row"
                style={{ textAlign: "left", gap: 11, background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "12px 13px", cursor: h.report ? "pointer" : "default", width: "100%" }}
                onClick={() => h.report && openReport(h.report)}
              >
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="display" style={{ fontWeight: 600, fontSize: 15, color: "var(--text-2)" }}>{h.title}</span>
                    <span className="mono" style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: col, background: "rgba(255,255,255,.03)", border: `1px solid ${col}44`, borderRadius: 5, padding: "2px 6px" }}>
                      {h.kind}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted-3)", marginTop: 3 }}>
                    {new Date(h.at).toLocaleString()}
                  </div>
                </div>
                {h.report && <ChevronIcon />}
              </button>
            );
          })}
        </div>
      )}

      {/* catalog (read view + editor) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span className="section-label">Item Catalog</span>
        <div style={{ background: "var(--inset)", border: "1px solid var(--border-faint)", borderRadius: 13, overflow: "hidden" }}>
          {campaign.shop.filter((i) => i.enabled).map((i) => {
            const isGold = i.currency === "gold";
            return (
              <div key={i.id} className="row" style={{ gap: 10, padding: "10px 13px", borderBottom: "1px solid #1c212a" }}>
                <span className="display" style={{ fontWeight: 700, fontSize: 14, color: isGold ? "var(--gold)" : "var(--nitra)", flex: "0 0 34px" }}>
                  {i.cost}{isGold ? "G" : "N"}
                </span>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-2)" }}>{i.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)" }}>{i.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CatalogEditor />
    </>
  );
}
