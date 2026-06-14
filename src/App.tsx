import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "./state/store";
import { HomeScreen } from "./screens/HomeScreen";
import { CampaignSetupScreen } from "./screens/CampaignSetupScreen";
import { CharactersScreen } from "./screens/CharactersScreen";
import { EndMissionScreen } from "./screens/EndMissionScreen";
import { RigShopScreen } from "./screens/RigShopScreen";
import { LaunchScreen } from "./screens/LaunchScreen";
import { HistoryScreen } from "./screens/HistoryScreen";

const NAV = [
  { to: "/characters", label: "Dwarves", ico: "⛏" },
  { to: "/end-mission", label: "End", ico: "🏁" },
  { to: "/shop", label: "Rig Shop", ico: "🛒" },
  { to: "/launch", label: "Launch", ico: "🚀" },
  { to: "/history", label: "History", ico: "📜" }
];

export function App() {
  const campaign = useStore((s) => s.campaign);
  const closeCampaign = useStore((s) => s.closeCampaign);
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Space Rig Quartermaster</h1>
          <div className="sub">
            {campaign
              ? `${campaign.name} · Mission ${campaign.currentMissionIndex + 1}`
              : "Local-first campaign companion"}
          </div>
        </div>
        {campaign ? (
          <button
            className="ghost"
            onClick={() => {
              closeCampaign();
              navigate("/");
            }}
          >
            Switch
          </button>
        ) : null}
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/setup" element={<CampaignSetupScreen />} />
          <Route
            path="/characters"
            element={campaign ? <CharactersScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/end-mission"
            element={campaign ? <EndMissionScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/shop"
            element={campaign ? <RigShopScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/launch"
            element={campaign ? <LaunchScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/history"
            element={campaign ? <HistoryScreen /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {campaign ? (
        <nav className="bottom-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="ico">{n.ico}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
