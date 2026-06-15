// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useStore } from "../state/store";
import { resetStore, renderRouted } from "../test/helpers";
import { CampaignSetupScreen } from "./CampaignSetupScreen";

describe("CampaignSetupScreen", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders the setup form with defaults", () => {
    renderRouted(<CampaignSetupScreen />);
    expect(screen.getByText("New Campaign")).toBeInTheDocument();
    expect(screen.getByLabelText("Campaign name")).toHaveValue("New Expedition");
    // Default mode is economy -> its pill is selected.
    expect(screen.getByRole("button", { name: "Economy" })).toHaveClass("sel");
  });

  it("toggles the mode pill's sel class", async () => {
    const user = userEvent.setup();
    renderRouted(<CampaignSetupScreen />);

    const economy = screen.getByRole("button", { name: "Economy" });
    const official = screen.getByRole("button", { name: "Official" });
    expect(economy).toHaveClass("sel");
    expect(official).not.toHaveClass("sel");

    await user.click(official);
    expect(official).toHaveClass("sel");
    expect(economy).not.toHaveClass("sel");
  });

  it("toggles the player count pill's sel class", async () => {
    const user = userEvent.setup();
    renderRouted(<CampaignSetupScreen />);

    // Default playerCount is 4.
    expect(screen.getByRole("button", { name: "4" })).toHaveClass("sel");

    const two = screen.getByRole("button", { name: "2" });
    await user.click(two);
    expect(two).toHaveClass("sel");
    expect(screen.getByRole("button", { name: "4" })).not.toHaveClass("sel");
  });

  it("toggles the difficulty pill's sel class", async () => {
    const user = userEvent.setup();
    renderRouted(<CampaignSetupScreen />);

    // Default difficulty is regular.
    expect(screen.getByRole("button", { name: "Regular" })).toHaveClass("sel");

    const hazard5 = screen.getByRole("button", { name: "Hazard 5" });
    await user.click(hazard5);
    expect(hazard5).toHaveClass("sel");
    expect(screen.getByRole("button", { name: "Regular" })).not.toHaveClass("sel");
  });

  it("rerolls the seed to a new value", async () => {
    const user = userEvent.setup();
    renderRouted(<CampaignSetupScreen />);

    const seedInput = screen.getByLabelText("Seed") as HTMLInputElement;
    const before = seedInput.value;
    expect(before).not.toBe("");

    await user.click(screen.getByRole("button", { name: "Reroll seed" }));
    expect(seedInput.value).not.toBe(before);
  });

  it("calls newCampaign when Assemble Crew is clicked", async () => {
    const user = userEvent.setup();
    renderRouted(<CampaignSetupScreen />);

    // Pick a known mode + count so we can assert the payload.
    await user.click(screen.getByRole("button", { name: "Official" }));
    await user.click(screen.getByRole("button", { name: "3" }));

    expect(useStore.getState().campaign).toBeNull();
    await user.click(screen.getByRole("button", { name: "Assemble Crew" }));

    const campaign = useStore.getState().campaign;
    expect(campaign).not.toBeNull();
    expect(campaign!.mode).toBe("official");
    expect(campaign!.players).toHaveLength(3);
    expect(campaign!.name).toBe("New Expedition");
  });
});
