// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { EndMissionScreen } from "./EndMissionScreen";
import { useStore } from "../state/store";
import { renderRouted, resetStore, seedCampaign } from "../test/helpers";

describe("EndMissionScreen", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders the debrief with all active dwarves listed", () => {
    seedCampaign();
    renderRouted(<EndMissionScreen />);

    expect(screen.getByText("End Mission")).toBeInTheDocument();
    // "Who Escaped?" lists each active dwarf by nickname.
    expect(screen.getByText("Surveyor")).toBeInTheDocument();
    expect(screen.getByText("Driller")).toBeInTheDocument();
    // 4 escaped survivors at the start.
    expect(screen.getByText("Gold to each of 4 survivors")).toBeInTheDocument();
  });

  it("increments gold and nitra steppers", async () => {
    const user = userEvent.setup();
    seedCampaign();
    renderRouted(<EndMissionScreen />);

    await user.click(screen.getByRole("button", { name: "increase gold" }));
    await user.click(screen.getByRole("button", { name: "increase gold" }));
    await user.click(screen.getByRole("button", { name: "increase nitra" }));

    // Gold split preview reflects 2 gold / 4 survivors = 0 each, 2 leftover.
    const goldGroup = screen.getByRole("group", { name: "gold" });
    expect(goldGroup).toHaveTextContent("2");
    const nitraGroup = screen.getByRole("group", { name: "nitra" });
    expect(nitraGroup).toHaveTextContent("1");
  });

  it("filing the report calls recordMissionResult and opens an active report", async () => {
    const user = userEvent.setup();
    seedCampaign();
    renderRouted(<EndMissionScreen />);

    expect(useStore.getState().activeReport).toBeNull();

    // Collect 8 gold so the split is meaningful.
    const inc = screen.getByRole("button", { name: "increase gold" });
    for (let i = 0; i < 8; i++) await user.click(inc);

    await user.click(screen.getByRole("button", { name: "File Management Report" }));

    const state = useStore.getState();
    expect(state.activeReport).not.toBeNull();
    expect(state.activeReport!.goldRecovered).toBe(8);
    // A mission log entry was appended.
    expect(state.campaign!.history.some((h) => h.kind === "mission")).toBe(true);
  });

  it("marking a dwarf Left Behind reduces the gold-split survivor count", async () => {
    const user = userEvent.setup();
    seedCampaign();
    renderRouted(<EndMissionScreen />);

    expect(screen.getByText("Gold to each of 4 survivors")).toBeInTheDocument();

    // Each dwarf row has an "Escaped" toggle; clicking flips to Left Behind.
    const escapedToggles = screen.getAllByRole("button", { name: /Escaped/ });
    await user.click(escapedToggles[0]);

    expect(screen.getByText("Gold to each of 3 survivors")).toBeInTheDocument();
    // The left-behind penalty card now lists the dwarf name.
    expect(screen.getByText(/Left-Behind Penalty/)).toBeInTheDocument();
  });
});
