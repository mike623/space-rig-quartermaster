// Management report builder + plain-text renderer. Flavour lines are original.

import type {
  ManagementReport,
  MissionResult,
  SpendingEntry
} from "./types";

// Deadpan corporate voice (~5/10 humor): passive-aggressive memo, not jokes.
const FLAVOUR_SUCCESS = [
  "Output logged. Performance: within acceptable parameters.",
  "Quota satisfied. No further action required at this time.",
  "Extraction noted. Your file has been updated accordingly."
];

const FLAVOUR_FAILURE = [
  "Objectives incomplete. A note has been added to your file.",
  "Yield below projection. Hazard pay remains under review.",
  "Results received. Management has no further comment."
];

export interface BuildReportInput {
  missionResult?: MissionResult;
  spending: SpendingEntry[];
  confiscatedGold: number;
  confiscatedNitra: number;
  penaltiesApplied: string[];
  notes?: string;
  /** 0..1 selector for a deterministic flavour line. */
  flavourSeed?: number;
}

export function buildManagementReport(
  input: BuildReportInput
): ManagementReport {
  const mr = input.missionResult;
  const success = mr?.success ?? false;
  const pool = success ? FLAVOUR_SUCCESS : FLAVOUR_FAILURE;
  const idx = Math.floor((input.flavourSeed ?? 0) * pool.length) % pool.length;

  return {
    missionResult: mr,
    goldRecovered: mr?.goldCollected ?? 0,
    nitraRecovered: mr?.nitraCollected ?? 0,
    escaped: mr?.escapedCharacterIds.length ?? 0,
    leftBehind: mr?.leftBehindCharacterIds.length ?? 0,
    spending: input.spending,
    confiscatedGold: input.confiscatedGold,
    confiscatedNitra: input.confiscatedNitra,
    penaltiesApplied: input.penaltiesApplied,
    notes: input.notes ?? "",
    flavour: pool[idx]
  };
}

export function reportToText(r: ManagementReport): string {
  const lines: string[] = [];
  lines.push("=== MANAGEMENT REPORT ===");
  if (r.missionResult) {
    lines.push(
      `Mission: ${r.missionResult.missionName} (${r.missionResult.missionType})`
    );
    lines.push(`Result: ${r.missionResult.success ? "SUCCESS" : "FAILURE"}`);
  }
  lines.push(`Gold recovered: ${r.goldRecovered}`);
  lines.push(`Nitra recovered: ${r.nitraRecovered}`);
  lines.push(`Dwarves escaped: ${r.escaped}`);
  lines.push(`Dwarves left behind: ${r.leftBehind}`);
  if (r.spending.length) {
    lines.push("Spending:");
    for (const s of r.spending) {
      lines.push(`  - ${s.label} (${s.cost} ${s.currency})`);
    }
  }
  if (r.confiscatedGold || r.confiscatedNitra) {
    lines.push(
      `Confiscated: ${r.confiscatedGold} Gold, ${r.confiscatedNitra} Nitra`
    );
  }
  if (r.penaltiesApplied.length) {
    lines.push("Penalties:");
    for (const p of r.penaltiesApplied) lines.push(`  - ${p}`);
  }
  if (r.notes) lines.push(`Notes: ${r.notes}`);
  lines.push(`> ${r.flavour}`);
  return lines.join("\n");
}
