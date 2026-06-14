import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";

export function HomeScreen() {
  const summaries = useStore((s) => s.summaries);
  const selectCampaign = useStore((s) => s.selectCampaign);
  const removeCampaign = useStore((s) => s.removeCampaign);
  const importState = useStore((s) => s.importState);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(
    null
  );

  const open = (id: string) => {
    selectCampaign(id);
    navigate("/characters");
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const result = importState(text);
    if (!result.ok) {
      setMsg({ kind: "err", text: result.error ?? "Import failed" });
      return;
    }
    setMsg({
      kind: "ok",
      text: ["Campaign imported.", ...(result.warnings ?? [])].join(" ")
    });
    navigate("/characters");
  };

  return (
    <div>
      {msg ? <div className={`banner ${msg.kind}`}>{msg.text}</div> : null}

      <div className="card">
        <h2>Campaigns</h2>
        {summaries.length === 0 ? (
          <p className="muted">No saved campaigns yet. Create one to start.</p>
        ) : (
          summaries
            .slice()
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((s) => (
              <div key={s.id} className="shop-item">
                <div onClick={() => open(s.id)} style={{ flex: 1 }}>
                  <strong>{s.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {s.mode} · {new Date(s.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button className="primary" onClick={() => open(s.id)}>
                  Open
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    if (confirm(`Delete "${s.name}"? This cannot be undone.`)) {
                      removeCampaign(s.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))
        )}
      </div>

      <button className="primary full" onClick={() => navigate("/setup")}>
        + New Campaign
      </button>
      <div className="spacer" />
      <button className="full" onClick={() => fileRef.current?.click()}>
        Import Campaign JSON
      </button>
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
    </div>
  );
}
