// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { HistoryScreen } from "./HistoryScreen";
import { useStore } from "../state/store";
import { renderRouted, resetStore, seedCampaign } from "../test/helpers";
import type { MissionResult } from "../domain/types";

function fileMission(campaign: ReturnType<typeof seedCampaign>) {
  const escapedIds = campaign.players.map((p) => p.id);
  const result: MissionResult = {
    missionIndex: 0,
    missionName: "Test Mission",
    missionType: "extraction",
    success: true,
    primaryComplete: true,
    secondaryComplete: false,
    goldCollected: 12,
    nitraCollected: 4,
    escapedCharacterIds: escapedIds,
    leftBehindCharacterIds: [],
    warnings: [],
    anomalies: [],
    biome: "Test Biome",
    notes: ""
  };
  useStore.getState().recordMissionResult(result);
}

describe("HistoryScreen", () => {
  beforeEach(() => {
    resetStore();
  });

  it("shows no mission log when history is empty", () => {
    seedCampaign();
    renderRouted(<HistoryScreen />);

    expect(screen.getByText("History")).toBeInTheDocument();
    // The recipe section always renders; the mission log only appears with
    // history entries.
    expect(screen.queryByText("Mission Log")).toBeNull();
    expect(screen.getByText(/Assignment Recipe/)).toBeInTheDocument();
  });

  it("renders mission log entries after a mission is recorded", () => {
    const campaign = seedCampaign();
    fileMission(campaign);

    renderRouted(<HistoryScreen />);

    expect(screen.getByText("Mission Log")).toBeInTheDocument();
    // recordMissionResult titles the entry "Mission 1: Success".
    expect(screen.getByText("Mission 1: Success")).toBeInTheDocument();
    // The entry's kind badge is rendered.
    expect(screen.getByText("mission")).toBeInTheDocument();
  });
});
