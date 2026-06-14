import { useEffect } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { useStore } from "./state/store";
import { MODE_LABEL } from "./ui/labels";
import {
  CrewIcon,
  EndIcon,
  GoldIcon,
  HomeIcon,
  LaunchIcon,
  LogIcon,
  NitraIcon,
  ShopIcon
} from "./components/icons";
import { Toast } from "./components/Toast";
import { ReportSheet } from "./components/ReportSheet";
import { HomeScreen } from "./screens/HomeScreen";
import { CampaignSetupScreen } from "./screens/CampaignSetupScreen";
import { CharactersScreen } from "./screens/CharactersScreen";
import { EndMissionScreen } from "./screens/EndMissionScreen";
import { RigShopScreen } from "./screens/RigShopScreen";
import { LaunchScreen } from "./screens/LaunchScreen";
import { HistoryScreen } from "./screens/HistoryScreen";

const NAV = [
  { to: "/characters", label: "Crew", Icon: CrewIcon },
  { to: "/end-mission", label: "End", Icon: EndIcon },
  { to: "/shop", label: "Shop", Icon: ShopIcon },
  { to: "/launch", label: "Launch", Icon: LaunchIcon },
  { to: "/history", label: "Log", Icon: LogIcon }
];

const MODE_CHIP_CLASS: Record<string, string> = {
  economy: "",
  official: "nitra",
  hardcore: "danger"
};

export function App() {
  const campaign = useStore((s) => s.campaign);
  const closeCampaign = useStore((s) => s.closeCampaign);
  const closeReport = useStore((s) => s.closeReport);
  const navigate = useNavigate();
  const location = useLocation();

  // Dismiss any open report when navigating between screens.
  useEffect(() => {
    closeReport();
  }, [location.pathname, closeReport]);

  const missionLabel = campaign
    ? `Mission ${campaign.currentMissionIndex + 1} / ${campaign.recipe.missions.length}`
    : "Local-first companion";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-row">
          <button
            className="icon-btn"
            aria-label="Campaigns"
            onClick={() => {
              closeCampaign();
              navigate("/");
            }}
          >
            <HomeIcon />
          </button>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div className="camp-name">
              {campaign ? campaign.name : "Space Rig Quartermaster"}
            </div>
            <div className="header-row" style={{ gap: 7, marginTop: 2 }}>
              {campaign && (
                <span className={`mode-chip ${MODE_CHIP_CLASS[campaign.mode] ?? ""}`}>
                  {MODE_LABEL[campaign.mode]}
                </span>
              )}
              <span className="mission-label">{missionLabel}</span>
            </div>
          </div>
        </div>

        {campaign && (
          <div className="res-pills">
            <div className="res-pill gold">
              <GoldIcon />
              <div className="stack">
                <span className="n">{campaign.resources.teamGold}</span>
                <span className="lbl">Gold</span>
              </div>
            </div>
            <div className="res-pill nitra">
              <NitraIcon />
              <div className="stack">
                <span className="n">{campaign.resources.teamNitra}</span>
                <span className="lbl">Nitra</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="app-main qm-scroll">
        <div className="app-main-inner">
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
        </div>
      </main>

      {campaign && (
        <nav className="bottom-nav">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  <span className="nav-indicator" />
                  <Icon s={22} c={isActive ? "var(--gold)" : "var(--muted-3)"} />
                  <span className="nav-label">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      <ReportSheet />
      <Toast />
    </div>
  );
}
