// Seeded campaign recipe generator. Deterministic: same seed + settings yield
// identical output. All mission-type/warning/biome names are generic and
// user-editable — no copyrighted content.

import { newId } from "./ids";
import { Rng } from "./prng";
import type { CampaignRecipe, Difficulty, Mission } from "./types";

export const DEFAULT_MISSION_TYPES = [
  "Mining Op",
  "Egg Hunt",
  "Salvage",
  "Refinery",
  "Elimination",
  "Escort",
  "Point Extraction",
  "Sabotage"
];

export const DEFAULT_WARNINGS = [
  "Low Visibility",
  "Exploder Infestation",
  "Cave Leech Cluster",
  "Lethal Enemies",
  "Shield Disruption",
  "Regenerative Bugs",
  "Parasites",
  "Rival Presence"
];

export const DEFAULT_ANOMALIES = [
  "Gold Rush",
  "Mineral Mania",
  "Rich Atmosphere",
  "Low Gravity",
  "Critical Weakness",
  "Volatile Guts"
];

export const DEFAULT_BIOMES = [
  "Crystalline Caverns",
  "Salt Pits",
  "Fungus Bogs",
  "Dense Biozone",
  "Glacial Strata",
  "Magma Core",
  "Radioactive Zone"
];

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  greenbeard: 0,
  regular: 1,
  hazard4: 2,
  hazard5: 3,
  management: 4
};

export interface GenerateRecipeOptions {
  seed: string;
  difficulty: Difficulty;
  assignmentLength: 3 | 5 | 7 | 0;
  enabledMissionTypes?: string[];
  enabledWarnings?: string[];
  enabledAnomalies?: string[];
  enabledBiomes?: string[];
  rewardDensity?: "low" | "medium" | "high";
}

const ENDLESS_PREVIEW_LENGTH = 7;

export function generateRecipe(opts: GenerateRecipeOptions): CampaignRecipe {
  const missionTypes = opts.enabledMissionTypes ?? DEFAULT_MISSION_TYPES;
  const warnings = opts.enabledWarnings ?? DEFAULT_WARNINGS;
  const anomalies = opts.enabledAnomalies ?? DEFAULT_ANOMALIES;
  const biomes = opts.enabledBiomes ?? DEFAULT_BIOMES;
  const rewardDensity = opts.rewardDensity ?? "medium";

  const rng = new Rng(`${opts.seed}|${opts.difficulty}|${opts.assignmentLength}`);
  const baseRank = DIFFICULTY_RANK[opts.difficulty];

  const count =
    opts.assignmentLength === 0 ? ENDLESS_PREVIEW_LENGTH : opts.assignmentLength;

  const missions: Mission[] = [];
  let lastWarning = "";

  for (let i = 0; i < count; i++) {
    const isFirst = i === 0;
    const isFinal = i === count - 1;

    // Escalate modifier count toward the final mission.
    const progress = count > 1 ? i / (count - 1) : 1;
    const escalated = baseRank + Math.round(progress * 2);

    // Mission 1 avoids the hardest combos unless difficulty is already high.
    let warningCount = Math.max(0, Math.min(2, escalated - 1));
    if (isFirst && baseRank < DIFFICULTY_RANK.hazard4) warningCount = 0;
    if (isFinal) warningCount = Math.min(2, warningCount + 1);

    let missionWarnings = rng
      .sample(warnings, warningCount + 1)
      .slice(0, warningCount);

    // Avoid immediately repeated warnings unless the pool is tiny.
    if (
      lastWarning &&
      missionWarnings[0] === lastWarning &&
      warnings.length > 1
    ) {
      missionWarnings = rng
        .sample(
          warnings.filter((w) => w !== lastWarning),
          warningCount
        )
        .slice(0, warningCount);
    }
    lastWarning = missionWarnings[0] ?? "";

    const anomalyCount = escalated >= 3 ? rng.int(0, 1) : 0;
    const missionAnomalies = rng.sample(anomalies, anomalyCount);

    const rewardHint = pickRewardHint(rng, rewardDensity);

    missions.push({
      id: newId("mission"),
      index: i,
      name: `Mission ${i + 1}`,
      missionType: rng.pick(missionTypes),
      warnings: missionWarnings,
      anomalies: missionAnomalies,
      biome: rng.pick(biomes),
      rewardHint
    });
  }

  return {
    seed: opts.seed,
    difficulty: opts.difficulty,
    assignmentLength: opts.assignmentLength,
    enabledMissionTypes: missionTypes,
    enabledWarnings: warnings,
    enabledAnomalies: anomalies,
    enabledBiomes: biomes,
    rewardDensity,
    missions
  };
}

function pickRewardHint(rng: Rng, density: "low" | "medium" | "high"): string {
  const low = ["Small Gold cache", "Minor Nitra deposit"];
  const medium = ["Gold vein", "Nitra cluster", "Upgrade cache"];
  const high = ["Rich Gold vein", "Bonus upgrade token", "Beer stash", "Rare mineral"];
  const pool =
    density === "low" ? low : density === "high" ? [...medium, ...high] : medium;
  return rng.pick(pool);
}
