// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useStore } from "../state/store";
import { resetStore, seedCampaign, renderRouted } from "../test/helpers";
import { LaunchScreen } from "./LaunchScreen";

describe("LaunchScreen", () => {
  // The store is a module singleton; capture the real action so tests that
  // replace it with a spy don't leak the mock into later tests.
  const realLaunchNextMission = useStore.getState().launchNextMission;

  beforeEach(() => {
    resetStore();
    useStore.setState({ launchNextMission: realLaunchNextMission });
  });

  it("renders launch readiness for the seeded campaign", () => {
    seedCampaign();
    renderRouted(<LaunchScreen />);

    expect(screen.getByText("Launch Check")).toBeInTheDocument();
    expect(screen.getByText("Next Assignment")).toBeInTheDocument();
    expect(screen.getByText("Crew Readiness")).toBeInTheDocument();
    // Default crew rotation -> Surveyor (scout) is the first nickname.
    expect(screen.getByText("Surveyor")).toBeInTheDocument();
  });

  it("steps through review before showing the confirm action", async () => {
    const user = userEvent.setup();
    seedCampaign();
    renderRouted(<LaunchScreen />);

    // Step 0: the review trigger is shown, not the confirm button.
    expect(screen.getByRole("button", { name: /Review Launch/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Confiscate & Launch/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Review Launch/i }));

    // Step 1: the confirm action appears.
    expect(
      screen.getByRole("button", { name: /Confiscate & Launch/i })
    ).toBeInTheDocument();
  });

  it("calls launchNextMission when confirmed", async () => {
    const user = userEvent.setup();
    seedCampaign();
    const launchNextMission = vi.fn(() => ({
      confiscatedGold: 0,
      confiscatedNitra: 0
    }));
    useStore.setState({ launchNextMission });
    renderRouted(<LaunchScreen />);

    await user.click(screen.getByRole("button", { name: /Review Launch/i }));
    await user.click(screen.getByRole("button", { name: /Confiscate & Launch/i }));

    expect(launchNextMission).toHaveBeenCalledTimes(1);
  });

  it("advances the current mission index through the real store action", async () => {
    const user = userEvent.setup();
    const campaign = seedCampaign();
    expect(campaign.currentMissionIndex).toBe(0);
    renderRouted(<LaunchScreen />);

    await user.click(screen.getByRole("button", { name: /Review Launch/i }));
    await user.click(screen.getByRole("button", { name: /Confiscate & Launch/i }));

    expect(useStore.getState().campaign!.currentMissionIndex).toBe(1);
  });
});
