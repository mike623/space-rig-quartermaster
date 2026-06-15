import { describe, expect, it } from "vitest";
import { buildManagementReport, reportToText } from "./report";
import type { MissionResult, SpendingEntry } from "./types";

const SUCCESS_FLAVOUR = [
  "Output logged. Performance: within acceptable parameters.",
  "Quota satisfied. No further action required at this time.",
  "Extraction noted. Your file has been updated accordingly."
];

const FAILURE_FLAVOUR = [
  "Objectives incomplete. A note has been added to your file.",
  "Yield below projection. Hazard pay remains under review.",
  "Results received. Management has no further comment."
];

function missionResult(over: Partial<MissionResult> = {}): MissionResult {
  return {
    missionIndex: 0,
    missionName: "Deep Dive",
    missionType: "mining",
    success: true,
    primaryComplete: true,
    secondaryComplete: false,
    goldCollected: 12,
    nitraCollected: 4,
    escapedCharacterIds: ["c1", "c2"],
    leftBehindCharacterIds: ["c3"],
    warnings: [],
    anomalies: [],
    biome: "Glacial Strata",
    notes: "",
    ...over
  };
}

describe("buildManagementReport", () => {
  it("derives recovered/escaped/leftBehind counts from the mission result", () => {
    const r = buildManagementReport({
      missionResult: missionResult(),
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(r.goldRecovered).toBe(12);
    expect(r.nitraRecovered).toBe(4);
    expect(r.escaped).toBe(2);
    expect(r.leftBehind).toBe(1);
  });

  it("selects a success flavour line for a successful mission", () => {
    const r = buildManagementReport({
      missionResult: missionResult({ success: true }),
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(SUCCESS_FLAVOUR).toContain(r.flavour);
  });

  it("selects a failure flavour line for a failed mission", () => {
    const r = buildManagementReport({
      missionResult: missionResult({ success: false }),
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(FAILURE_FLAVOUR).toContain(r.flavour);
  });

  it("treats an undefined missionResult as a failure with zeroed stats", () => {
    const r = buildManagementReport({
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(r.missionResult).toBeUndefined();
    expect(r.goldRecovered).toBe(0);
    expect(r.nitraRecovered).toBe(0);
    expect(r.escaped).toBe(0);
    expect(r.leftBehind).toBe(0);
    expect(FAILURE_FLAVOUR).toContain(r.flavour);
  });

  it("uses flavourSeed to deterministically choose the line", () => {
    const make = (flavourSeed: number) =>
      buildManagementReport({
        missionResult: missionResult({ success: true }),
        spending: [],
        confiscatedGold: 0,
        confiscatedNitra: 0,
        penaltiesApplied: [],
        flavourSeed
      }).flavour;

    // floor(seed * 3) selects index 0, 1, 2.
    expect(make(0)).toBe(SUCCESS_FLAVOUR[0]);
    expect(make(0.4)).toBe(SUCCESS_FLAVOUR[1]);
    expect(make(0.9)).toBe(SUCCESS_FLAVOUR[2]);
  });

  it("defaults flavourSeed to 0 (first line) when omitted", () => {
    const r = buildManagementReport({
      missionResult: missionResult({ success: true }),
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(r.flavour).toBe(SUCCESS_FLAVOUR[0]);
  });

  it("defaults notes to an empty string when omitted", () => {
    const r = buildManagementReport({
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(r.notes).toBe("");
  });

  it("passes through spending, confiscations, penalties, and notes", () => {
    const spending: SpendingEntry[] = [
      {
        id: "s1",
        shopItemId: "item1",
        label: "Heal",
        currency: "gold",
        cost: 2
      }
    ];
    const r = buildManagementReport({
      spending,
      confiscatedGold: 5,
      confiscatedNitra: 3,
      penaltiesApplied: ["Lost grenades"],
      notes: "Tough run"
    });
    expect(r.spending).toEqual(spending);
    expect(r.confiscatedGold).toBe(5);
    expect(r.confiscatedNitra).toBe(3);
    expect(r.penaltiesApplied).toEqual(["Lost grenades"]);
    expect(r.notes).toBe("Tough run");
  });
});

describe("reportToText", () => {
  it("renders header, mission line, and result for a successful mission", () => {
    const r = buildManagementReport({
      missionResult: missionResult({ success: true }),
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    const text = reportToText(r);
    expect(text).toContain("=== MANAGEMENT REPORT ===");
    expect(text).toContain("Mission: Deep Dive (mining)");
    expect(text).toContain("Result: SUCCESS");
    expect(text).toContain("Gold recovered: 12");
    expect(text).toContain("Nitra recovered: 4");
    expect(text).toContain("Dwarves escaped: 2");
    expect(text).toContain("Dwarves left behind: 1");
    expect(text).toContain(`> ${r.flavour}`);
  });

  it("renders FAILURE result text for a failed mission", () => {
    const r = buildManagementReport({
      missionResult: missionResult({ success: false }),
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(reportToText(r)).toContain("Result: FAILURE");
  });

  it("omits the mission line when there is no mission result", () => {
    const r = buildManagementReport({
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    const text = reportToText(r);
    expect(text).not.toContain("Mission:");
    expect(text).not.toContain("Result:");
  });

  it("lists spending entries when present", () => {
    const spending: SpendingEntry[] = [
      {
        id: "s1",
        shopItemId: "item1",
        label: "Reload",
        currency: "nitra",
        cost: 1
      }
    ];
    const r = buildManagementReport({
      spending,
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    const text = reportToText(r);
    expect(text).toContain("Spending:");
    expect(text).toContain("  - Reload (1 nitra)");
  });

  it("shows confiscations only when nonzero", () => {
    const withConfiscation = reportToText(
      buildManagementReport({
        spending: [],
        confiscatedGold: 5,
        confiscatedNitra: 2,
        penaltiesApplied: []
      })
    );
    expect(withConfiscation).toContain("Confiscated: 5 Gold, 2 Nitra");

    const withoutConfiscation = reportToText(
      buildManagementReport({
        spending: [],
        confiscatedGold: 0,
        confiscatedNitra: 0,
        penaltiesApplied: []
      })
    );
    expect(withoutConfiscation).not.toContain("Confiscated:");
  });

  it("lists penalties and notes when present", () => {
    const r = buildManagementReport({
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: ["Lost overclocks"],
      notes: "Reviewed by management"
    });
    const text = reportToText(r);
    expect(text).toContain("Penalties:");
    expect(text).toContain("  - Lost overclocks");
    expect(text).toContain("Notes: Reviewed by management");
  });

  it("omits the notes line when notes are empty", () => {
    const r = buildManagementReport({
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: []
    });
    expect(reportToText(r)).not.toContain("Notes:");
  });
});
