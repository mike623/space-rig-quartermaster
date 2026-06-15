// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useStore } from "../state/store";
import { resetStore, renderRouted } from "../test/helpers";
import { HomeScreen } from "./HomeScreen";

describe("HomeScreen", () => {
  beforeEach(() => {
    resetStore();
  });

  it("shows the empty state when there are no saved campaigns", () => {
    renderRouted(<HomeScreen />);
    expect(
      screen.getByText("No saved campaigns yet. Assemble a crew to start.")
    ).toBeInTheDocument();
  });

  it("renders the New Campaign and Import controls", () => {
    renderRouted(<HomeScreen />);
    expect(screen.getByRole("button", { name: /New Campaign/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Import/i })).toBeInTheDocument();
  });

  it("lists saved campaign summaries when present", () => {
    useStore.setState({
      summaries: [
        { id: "c1", name: "Alpha Dig", mode: "economy", updatedAt: "2026-01-01T00:00:00.000Z" },
        { id: "c2", name: "Beta Dig", mode: "hardcore", updatedAt: "2026-02-01T00:00:00.000Z" }
      ]
    });
    renderRouted(<HomeScreen />);

    expect(screen.getByText("Alpha Dig")).toBeInTheDocument();
    expect(screen.getByText("Beta Dig")).toBeInTheDocument();
    // No empty state when campaigns exist.
    expect(
      screen.queryByText("No saved campaigns yet. Assemble a crew to start.")
    ).not.toBeInTheDocument();
    // Each card exposes an Open button and a Delete control.
    expect(screen.getAllByRole("button", { name: "Open" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Delete campaign" })).toHaveLength(2);
  });

  it("sorts summaries by most recently updated first", () => {
    useStore.setState({
      summaries: [
        { id: "old", name: "Older Dig", mode: "economy", updatedAt: "2026-01-01T00:00:00.000Z" },
        { id: "new", name: "Newer Dig", mode: "economy", updatedAt: "2026-03-01T00:00:00.000Z" }
      ]
    });
    renderRouted(<HomeScreen />);

    const names = [
      screen.getByText("Newer Dig"),
      screen.getByText("Older Dig")
    ];
    // The more recently updated campaign appears earlier in document order.
    expect(
      names[0].compareDocumentPosition(names[1]) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("selects a campaign when Open is clicked", async () => {
    const user = userEvent.setup();
    const selectCampaign = vi.fn();
    useStore.setState({
      summaries: [
        { id: "c1", name: "Alpha Dig", mode: "economy", updatedAt: "2026-01-01T00:00:00.000Z" }
      ],
      selectCampaign
    });
    renderRouted(<HomeScreen />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(selectCampaign).toHaveBeenCalledWith("c1");
  });
});
