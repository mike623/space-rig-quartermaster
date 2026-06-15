// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CharactersScreen } from "./CharactersScreen";
import { useStore } from "../state/store";
import { renderRouted, resetStore, seedCampaign } from "../test/helpers";

describe("CharactersScreen", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders all four seeded dwarves and the active count", () => {
    seedCampaign();
    renderRouted(<CharactersScreen />);

    // Default class rotation: scout/engineer/gunner/driller.
    expect(screen.getByDisplayValue("Surveyor")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Engineer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Gunner")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Driller")).toBeInTheDocument();

    expect(screen.getByText("4 Dwarves Active")).toBeInTheDocument();
  });

  it("expands and collapses a character card", async () => {
    const user = userEvent.setup();
    seedCampaign();
    renderRouted(<CharactersScreen />);

    // Cards start collapsed, so every card exposes an "Expand" toggle and no
    // HP stepper is visible yet.
    expect(screen.queryByRole("group", { name: "Surveyor integrity" })).toBeNull();

    const expandButtons = screen.getAllByRole("button", { name: "Expand" });
    expect(expandButtons).toHaveLength(4);

    await user.click(expandButtons[0]);

    // First card (Surveyor) is now expanded -> its HP stepper is rendered and
    // the toggle flipped to "Collapse".
    expect(
      screen.getByRole("group", { name: "Surveyor integrity" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.queryByRole("group", { name: "Surveyor integrity" })).toBeNull();
  });

  it("HP stepper decrements drive a store update", async () => {
    const user = userEvent.setup();
    const campaign = seedCampaign();
    const surveyorId = campaign.players[0].id;
    renderRouted(<CharactersScreen />);

    await user.click(screen.getAllByRole("button", { name: "Expand" })[0]);

    expect(useStore.getState().campaign!.players[0].hp).toBe(5);

    await user.click(
      screen.getByRole("button", { name: "decrease Surveyor integrity" })
    );

    const updated = useStore
      .getState()
      .campaign!.players.find((p) => p.id === surveyorId)!;
    expect(updated.hp).toBe(4);
  });

  it("ammo stepper updates a weapon's ammo in the store", async () => {
    const user = userEvent.setup();
    const campaign = seedCampaign();
    const surveyorId = campaign.players[0].id;
    const firstWeaponId = campaign.players[0].weapons[0].id;
    renderRouted(<CharactersScreen />);

    await user.click(screen.getAllByRole("button", { name: "Expand" })[0]);

    expect(useStore.getState().campaign!.players[0].weapons[0].ammo).toBe(5);

    // The first weapon's ammo stepper is the first "decrease ammo" control.
    await user.click(screen.getAllByRole("button", { name: "decrease ammo" })[0]);

    const weapon = useStore
      .getState()
      .campaign!.players.find((p) => p.id === surveyorId)!
      .weapons.find((w) => w.id === firstWeaponId)!;
    expect(weapon.ammo).toBe(4);
  });
});
