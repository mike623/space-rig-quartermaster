// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildManagementReport } from "../domain/report";
import type { MissionResult } from "../domain/types";
import { useStore } from "../state/store";
import { resetStore } from "../test/helpers";
import { ReportSheet } from "./ReportSheet";

function missionResult(overrides: Partial<MissionResult> = {}): MissionResult {
  return {
    missionIndex: 0,
    missionName: "Deep Vein Run",
    missionType: "Mining Expedition",
    success: true,
    primaryComplete: true,
    secondaryComplete: true,
    goldCollected: 120,
    nitraCollected: 40,
    escapedCharacterIds: ["a", "b", "c"],
    leftBehindCharacterIds: ["d"],
    warnings: [],
    anomalies: [],
    biome: "Crystalline Caverns",
    notes: "",
    ...overrides
  };
}

function makeReport(overrides: Partial<MissionResult> = {}) {
  return buildManagementReport({
    missionResult: missionResult(overrides),
    spending: [],
    confiscatedGold: 0,
    confiscatedNitra: 0,
    penaltiesApplied: ["Greybeard: -1 HP"],
    flavourSeed: 0
  });
}

describe("ReportSheet", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders nothing when there is no active report", () => {
    const { container } = render(<ReportSheet />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the report title, lines and flavour when a report is active", () => {
    const report = makeReport();
    useStore.getState().openReport(report);
    render(<ReportSheet />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Title combines mission name + type.
    expect(
      screen.getByText("Deep Vein Run — Mining Expedition")
    ).toBeInTheDocument();
    // A few representative report lines.
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Gold recovered")).toBeInTheDocument();
    expect(screen.getByText("+120g")).toBeInTheDocument();
    expect(screen.getByText("Penalty")).toBeInTheDocument();
    // Flavour line (wrapped in typographic quotes). flavourSeed 0 -> first
    // success flavour line.
    expect(screen.getByText(/Output logged/)).toBeInTheDocument();
  });

  it("closes when the Done button is clicked", async () => {
    const user = userEvent.setup();
    useStore.getState().openReport(makeReport());
    render(<ReportSheet />);

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(useStore.getState().activeReport).toBeNull();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    useStore.getState().openReport(makeReport());
    render(<ReportSheet />);

    await user.keyboard("{Escape}");
    expect(useStore.getState().activeReport).toBeNull();
  });

  it("copies the report text to the clipboard when Copy is clicked", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true
    });

    useStore.getState().openReport(makeReport());
    render(<ReportSheet />);

    await user.click(screen.getByRole("button", { name: /Copy text/i }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("MANAGEMENT REPORT");
    // Shows a confirmation toast.
    expect(useStore.getState().toast?.msg).toMatch(/copied/i);
  });
});
