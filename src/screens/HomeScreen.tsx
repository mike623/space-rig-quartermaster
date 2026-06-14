import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { MODE_LABEL } from "../ui/labels";
import { PlusIcon, ImportIcon, TrashIcon } from "../components/icons";

const MODE_CHIP: Record<string, string> = {
  economy: "",
  official: "nitra",
  hardcore: "danger"
};

export function HomeScreen() {
  const summaries = useStore((s) => s.summaries);
  const selectCampaign = useStore((s) => s.selectCampaign);
  const removeCampaign = useStore((s) => s.removeCampaign);
  const importState = useStore((s) => s.importState);
  const showToast = useStore((s) => s.showToast);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);

  const open = (id: string) => {
    selectCampaign(id);
    navigate("/characters");
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const result = importState(text);
    if (!result.ok) {
      setErr(result.error ?? "Import failed");
      return;
    }
    showToast(["Campaign imported", ...(result.warnings ?? [])].join(" · "), "ok");
    navigate("/characters");
  };

  const sorted = summaries
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <div className="row between end">
        <div>
          <div className="eyebrow">Saved Campaigns</div>
          <div className="screen-title">Pick a Dig</div>
        </div>
      </div>

      {err && <div className="banner err">{err}</div>}

      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty">No saved campaigns yet. Assemble a crew to start.</div>
        </div>
      ) : (
        sorted.map((c) => (
          <div className="card" key={c.id} style={{ gap: 12 }}>
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div className="display" style={{ fontWeight: 700, fontSize: 19, lineHeight: 1.1 }}>
                  {c.name}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted-3)", marginTop: 4 }}>
                  {new Date(c.updatedAt).toLocaleString()}
                </div>
              </div>
              <span className={`mode-chip ${MODE_CHIP[c.mode] ?? ""}`}>
                {MODE_LABEL[c.mode]}
              </span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn primary" style={{ flex: 1, fontSize: 13, padding: 11 }} onClick={() => open(c.id)}>
                Open
              </button>
              <button
                className="icon-btn"
                style={{ width: 42, height: "auto" }}
                aria-label="Delete campaign"
                onClick={() => {
                  if (confirm(`Delete "${c.name}"? This cannot be undone.`)) {
                    removeCampaign(c.id);
                    showToast("Campaign deleted", "warn");
                  }
                }}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))
      )}

      <div className="row" style={{ gap: 8 }}>
        <button
          className="btn primary"
          style={{ flex: 1, fontSize: 14, padding: 14, textTransform: "none" }}
          onClick={() => navigate("/setup")}
        >
          <PlusIcon /> New Campaign
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          <ImportIcon /> Import
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onImportFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
