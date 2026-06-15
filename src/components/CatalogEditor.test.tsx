// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useStore } from "../state/store";
import { resetStore, seedCampaign } from "../test/helpers";
import { CatalogEditor } from "./CatalogEditor";

describe("CatalogEditor", () => {
  beforeEach(() => {
    resetStore();
    seedCampaign();
  });

  it("renders collapsed by default (no inputs)", () => {
    render(<CatalogEditor />);
    expect(screen.getByText("Catalog Editor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.queryByLabelText("catalog weapon name")).not.toBeInTheDocument();
  });

  it("expands to show weapon rows and list fields when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<CatalogEditor />);
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const catalog = useStore.getState().campaign!.catalog;
    expect(screen.getAllByLabelText("catalog weapon name")).toHaveLength(
      catalog.weapons.length
    );
    expect(screen.getAllByLabelText("weapon slot")).toHaveLength(
      catalog.weapons.length
    );
    // One textarea per list field (upgrades, overclocks, grenades, beers, cards).
    expect(screen.getByLabelText(/Weapon upgrades, one per line/)).toBeInTheDocument();
  });

  it("renaming a weapon updates the campaign catalog via patch", async () => {
    const user = userEvent.setup();
    render(<CatalogEditor />);
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const firstInput = screen.getAllByLabelText("catalog weapon name")[0];
    await user.clear(firstInput);
    await user.type(firstInput, "Plasma Cutter");

    expect(useStore.getState().campaign!.catalog.weapons[0].name).toBe(
      "Plasma Cutter"
    );
  });

  it("changing a weapon slot writes the new slot into the catalog", async () => {
    const user = userEvent.setup();
    render(<CatalogEditor />);
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const firstSlot = screen.getAllByLabelText("weapon slot")[0];
    await user.selectOptions(firstSlot, "secondary");

    expect(useStore.getState().campaign!.catalog.weapons[0].slot).toBe(
      "secondary"
    );
  });

  it("adds and removes catalog weapons", async () => {
    const user = userEvent.setup();
    render(<CatalogEditor />);
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const before = useStore.getState().campaign!.catalog.weapons.length;
    await user.click(
      screen.getByRole("button", { name: "+ Add catalog weapon" })
    );
    expect(useStore.getState().campaign!.catalog.weapons).toHaveLength(
      before + 1
    );

    // The newly added weapon is named "New Weapon" — remove it.
    await user.click(screen.getByRole("button", { name: "Remove New Weapon" }));
    expect(useStore.getState().campaign!.catalog.weapons).toHaveLength(before);
  });

  it("editing a list textarea splits lines into catalog entries", async () => {
    const user = userEvent.setup();
    render(<CatalogEditor />);
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const grenades = screen.getByLabelText(/Grenades, one per line/);
    await user.clear(grenades);
    // Paste a multi-line value; the component splits on newlines, trims, and
    // drops empty lines.
    await user.click(grenades);
    await user.paste("Frag\nSticky\n  \nCryo  ");

    expect(useStore.getState().campaign!.catalog.grenades).toEqual([
      "Frag",
      "Sticky",
      "Cryo"
    ]);
  });
});
