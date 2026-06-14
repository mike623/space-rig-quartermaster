import { useStore } from "../state/store";
import { reportToText } from "../domain/report";
import type { ManagementReport } from "../domain/types";
import { CopyIcon } from "./icons";

function reportLines(r: ManagementReport): [string, string][] {
  const lines: [string, string][] = [];
  const mr = r.missionResult;
  if (mr) {
    lines.push(["Result", mr.success ? "Success" : "Failure"]);
    lines.push(["Primary objective", mr.primaryComplete ? "Complete" : "Failed"]);
    lines.push([
      "Secondary objective",
      mr.secondaryComplete ? "Complete" : "Skipped"
    ]);
  }
  if (r.goldRecovered || mr) lines.push(["Gold recovered", `+${r.goldRecovered}g`]);
  if (r.nitraRecovered || mr) lines.push(["Nitra recovered", `+${r.nitraRecovered}n`]);
  if (mr) {
    lines.push(["Dwarves escaped", String(r.escaped)]);
    if (r.leftBehind) lines.push(["Left behind", String(r.leftBehind)]);
  }
  if (r.spending.length) lines.push(["Purchases", String(r.spending.length)]);
  if (r.confiscatedGold || r.confiscatedNitra) {
    lines.push([
      "Confiscated",
      `${r.confiscatedGold}g · ${r.confiscatedNitra}n`
    ]);
  }
  for (const p of r.penaltiesApplied) lines.push(["Penalty", p]);
  return lines;
}

export function ReportSheet() {
  const report = useStore((s) => s.activeReport);
  const close = useStore((s) => s.closeReport);
  const showToast = useStore((s) => s.showToast);
  if (!report) return null;

  const isConfisc =
    !report.missionResult &&
    (report.confiscatedGold > 0 || report.confiscatedNitra > 0);
  const accent = isConfisc
    ? "var(--gold)"
    : report.missionResult?.success
      ? "var(--ok)"
      : "var(--danger)";
  const kindLabel = isConfisc ? "Confiscation Notice" : "Management Report";
  const title = report.missionResult
    ? `${report.missionResult.missionName} — ${report.missionResult.missionType || "Debrief"}`
    : "Pre-Launch Dispatch";

  const copy = () => {
    try {
      void navigator.clipboard?.writeText(reportToText(report));
    } catch {
      /* clipboard unavailable */
    }
    showToast("Report copied to clipboard", "ok");
  };

  return (
    <div className="report-overlay" onClick={close}>
      <div className="report-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="report-perf" />
        <div className="report-body qm-scroll">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textAlign: "center",
              borderBottom: "2px solid var(--border)",
              paddingBottom: 13
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                color: accent,
                textTransform: "uppercase"
              }}
            >
              {kindLabel}
            </div>
            <div className="display" style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}>
              {title}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {reportLines(report).map(([k, v], i) => (
              <div className="report-line" key={i}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontStyle: "italic",
              fontSize: 12.5,
              color: "var(--muted)",
              lineHeight: 1.55,
              textAlign: "center",
              borderTop: "2px dashed var(--border)",
              paddingTop: 13
            }}
          >
            &ldquo;{report.flavour}&rdquo;
          </div>
          <div
            className="mono"
            style={{
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "#4a515d"
            }}
          >
            · · ROCK &amp; STONE · ·
          </div>

          <div className="row" style={{ gap: 9 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={copy}>
              <CopyIcon /> Copy text
            </button>
            <button className="btn primary" style={{ flex: 1, padding: 13, fontSize: 13 }} onClick={close}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
