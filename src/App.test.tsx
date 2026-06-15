// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { App } from "./App";
import { useStore } from "./state/store";
import type { Campaign } from "./domain/types";
import { renderRouted, resetStore, seedCampaign } from "./test/helpers";

describe("App shell", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders the title without crashing when no campaign is active", () => {
    renderRouted(<App />);
    expect(screen.getByText("Space Rig Quartermaster")).toBeInTheDocument();
  });

  it("hides the resource pills when there is no active campaign", () => {
    const { container } = renderRouted(<App />);
    // The `campaign && ...` block (res-pills) and the bottom nav are gated on
    // an active campaign, so neither should be present.
    expect(container.querySelector(".res-pills")).toBeNull();
    expect(container.querySelector(".bottom-nav")).toBeNull();
    expect(screen.getByText("Local-first companion")).toBeInTheDocument();
  });

  it("renders without crashing and shows resource pills once a campaign is seeded", () => {
    const campaign = seedCampaign();
    const { container } = renderRouted(<App />);

    // Header reflects the campaign name and mode label (economy -> "Economy").
    expect(screen.getByText(campaign.name)).toBeInTheDocument();
    expect(screen.getByText("Economy")).toBeInTheDocument();

    // Resource pills are now visible.
    const pills = container.querySelector(".res-pills");
    expect(pills).not.toBeNull();
    expect(container.querySelector(".bottom-nav")).not.toBeNull();
  });

  it("shows teamGold and teamNitra values (both '0') for a fresh campaign", () => {
    seedCampaign();
    const { container } = renderRouted(<App />);

    const gold = container.querySelector(".res-pill.gold .n");
    const nitra = container.querySelector(".res-pill.nitra .n");
    expect(gold).toHaveTextContent("0");
    expect(nitra).toHaveTextContent("0");
  });

  it("renders '0' defensively when a campaign's resources are missing fields", () => {
    // Force a malformed campaign where teamGold/teamNitra are absent. The
    // defensive `teamGold ?? 0` / `teamNitra ?? 0` should still render "0".
    const campaign = seedCampaign();
    const malformed = {
      ...campaign,
      resources: {} as Campaign["resources"]
    } as Campaign;
    useStore.setState({ campaign: malformed });

    const { container } = renderRouted(<App />);

    const gold = container.querySelector(".res-pill.gold .n");
    const nitra = container.querySelector(".res-pill.nitra .n");
    expect(gold).toHaveTextContent("0");
    expect(nitra).toHaveTextContent("0");
  });
});
