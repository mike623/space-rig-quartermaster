// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { RigShopScreen } from "./RigShopScreen";
import { useStore } from "../state/store";
import { renderRouted, resetStore, seedCampaign } from "../test/helpers";

/** Seed a campaign, then give the team some gold/nitra to spend. */
function seedWithResources() {
  const campaign = seedCampaign();
  useStore.setState({
    campaign: { ...campaign, resources: { teamGold: 10, teamNitra: 10 } }
  });
  return useStore.getState().campaign!;
}

/** Find the shop row card containing a given item label and return its Buy button. */
function buyButtonFor(label: string): HTMLElement {
  const labelEl = screen.getByText(label);
  // Row card is: <div className="row">…<div>label…</div><button>Buy</button></div>
  let node: HTMLElement | null = labelEl;
  while (node && within(node).queryByRole("button", { name: /Buy|Short/ }) === null) {
    node = node.parentElement;
  }
  if (!node) throw new Error(`No buy button found near "${label}"`);
  return within(node).getByRole("button", { name: /Buy|Short/ });
}

describe("RigShopScreen", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders shop items grouped by tier", () => {
    seedWithResources();
    renderRouted(<RigShopScreen />);

    expect(screen.getByText("Rig Shop")).toBeInTheDocument();
    // Default shop labels (enabled items).
    expect(screen.getByText("Fully heal a dwarf")).toBeInTheDocument();
    expect(screen.getByText("Restore 1 ammo")).toBeInTheDocument();
    // Tier headers.
    expect(screen.getByText("1 Gold")).toBeInTheDocument();
    expect(screen.getByText("Nitra")).toBeInTheDocument();
  });

  it("buying an affordable dwarf item calls buyItem and spends gold", async () => {
    const user = userEvent.setup();
    seedWithResources();
    renderRouted(<RigShopScreen />);

    expect(useStore.getState().campaign!.resources.teamGold).toBe(10);
    expect(useStore.getState().campaign!.history).toHaveLength(0);

    // "Fully heal a dwarf" is a 1-gold dwarf-target item; the first dwarf is
    // selected by default, so the Buy click goes straight through.
    await user.click(buyButtonFor("Fully heal a dwarf"));

    const state = useStore.getState();
    expect(state.campaign!.resources.teamGold).toBe(9);
    expect(state.campaign!.history.some((h) => h.kind === "spending")).toBe(true);
    expect(state.toast?.kind).toBe("ok");
  });

  it("records the purchase in the recent spending log", async () => {
    const user = userEvent.setup();
    seedWithResources();
    renderRouted(<RigShopScreen />);

    await user.click(buyButtonFor("Buy grenade"));

    const spending = useStore
      .getState()
      .campaign!.history.filter((h) => h.kind === "spending");
    expect(spending.length).toBeGreaterThan(0);
    expect(spending[0].title).toMatch(/Bought:/);

    // The recent spending panel now shows the entry on screen.
    expect(screen.getByText("Recent Spending")).toBeInTheDocument();
  });
});
