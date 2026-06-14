// Zod schemas mirroring domain types. Used to validate imports.
// Kept in sync with types.ts by hand; the inferred types are asserted against
// the domain types in sharing.ts at compile time.

import { z } from "zod";

export const weaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  slot: z.enum(["primary", "secondary", "other"]),
  equipped: z.boolean(),
  active: z.boolean(),
  ammo: z.number(),
  maxAmmo: z.number(),
  overclocked: z.boolean(),
  upgrades: z.array(z.string())
});

export const characterSchema = z.object({
  id: z.string(),
  playerName: z.string(),
  dwarfClass: z.enum(["scout", "engineer", "gunner", "driller", "custom"]),
  nickname: z.string(),
  active: z.boolean(),
  maxHp: z.number(),
  hp: z.number(),
  escapedLastMission: z.boolean(),
  leftBehindLastMission: z.boolean(),
  personalGold: z.number(),
  rockNStoneCards: z.number(),
  grenades: z.number(),
  weapons: z.array(weaponSchema),
  uninstalledUpgrades: z.number(),
  temporaryEffects: z.array(z.string()),
  notes: z.string()
});

export const enabledContentSchema = z.object({
  baseGame: z.boolean(),
  spaceRig: z.boolean(),
  biomeExpansion: z.boolean(),
  customContent: z.boolean()
});

export const resourcesSchema = z.object({
  teamGold: z.number(),
  teamNitra: z.number()
});

export const customPenaltyFlagsSchema = z.object({
  healToFull: z.boolean(),
  reloadEquipped: z.boolean(),
  loseGrenades: z.boolean(),
  loseRockNStoneCards: z.boolean(),
  loseUninstalledUpgrades: z.boolean(),
  loseOverclocks: z.boolean(),
  loseNonEquippedWeapons: z.boolean(),
  losePersonalGold: z.boolean()
});

export const houseRulesSchema = z.object({
  carryHpAmmo: z.boolean(),
  loseUnspentGold: z.boolean(),
  loseUnspentNitra: z.boolean(),
  leftBehindPenalty: z.enum(["soft", "harsh", "custom"]),
  customPenalty: customPenaltyFlagsSchema,
  dynamicSwarm: z.boolean(),
  allowOverspend: z.boolean()
});

export const weaponCatalogEntrySchema = z.object({
  name: z.string(),
  slot: z.enum(["primary", "secondary", "other"]),
  maxAmmo: z.number()
});

export const itemCatalogSchema = z.object({
  weapons: z.array(weaponCatalogEntrySchema),
  upgrades: z.array(z.string()),
  overclocks: z.array(z.string()),
  grenades: z.array(z.string()),
  beers: z.array(z.string()),
  rockNStoneCards: z.array(z.string())
});

export const shopItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  currency: z.enum(["gold", "nitra"]),
  cost: z.number(),
  enabled: z.boolean(),
  effect: z.enum([
    "heal",
    "reload",
    "ammo",
    "grenade",
    "rockNStone",
    "installUpgrade",
    "upgradeToken",
    "overclock",
    "beerOne",
    "beerTeam",
    "flag",
    "none"
  ]),
  note: z.string()
});

export const missionSchema = z.object({
  id: z.string(),
  index: z.number(),
  name: z.string(),
  missionType: z.string(),
  warnings: z.array(z.string()),
  anomalies: z.array(z.string()),
  biome: z.string(),
  rewardHint: z.string()
});

export const recipeSchema = z.object({
  seed: z.string(),
  difficulty: z.enum([
    "greenbeard",
    "regular",
    "hazard4",
    "hazard5",
    "management"
  ]),
  assignmentLength: z.union([
    z.literal(3),
    z.literal(5),
    z.literal(7),
    z.literal(0)
  ]),
  enabledMissionTypes: z.array(z.string()),
  enabledWarnings: z.array(z.string()),
  enabledAnomalies: z.array(z.string()),
  enabledBiomes: z.array(z.string()),
  rewardDensity: z.enum(["low", "medium", "high"]),
  missions: z.array(missionSchema)
});

export const missionResultSchema = z.object({
  missionIndex: z.number(),
  missionName: z.string(),
  missionType: z.string(),
  success: z.boolean(),
  primaryComplete: z.boolean(),
  secondaryComplete: z.boolean(),
  goldCollected: z.number(),
  nitraCollected: z.number(),
  escapedCharacterIds: z.array(z.string()),
  leftBehindCharacterIds: z.array(z.string()),
  warnings: z.array(z.string()),
  anomalies: z.array(z.string()),
  biome: z.string(),
  notes: z.string()
});

export const spendingEntrySchema = z.object({
  id: z.string(),
  shopItemId: z.string(),
  label: z.string(),
  currency: z.enum(["gold", "nitra"]),
  cost: z.number(),
  targetCharacterId: z.string().optional()
});

export const managementReportSchema = z.object({
  missionResult: missionResultSchema.optional(),
  goldRecovered: z.number(),
  nitraRecovered: z.number(),
  escaped: z.number(),
  leftBehind: z.number(),
  spending: z.array(spendingEntrySchema),
  confiscatedGold: z.number(),
  confiscatedNitra: z.number(),
  penaltiesApplied: z.array(z.string()),
  notes: z.string(),
  flavour: z.string()
});

export const logEntrySchema = z.object({
  id: z.string(),
  kind: z.enum(["mission", "spending", "confiscation", "penalty", "note"]),
  missionIndex: z.number(),
  at: z.string(),
  title: z.string(),
  report: managementReportSchema.optional()
});

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  mode: z.enum(["official", "economy", "hardcore"]),
  seed: z.string(),
  difficulty: z.enum([
    "greenbeard",
    "regular",
    "hazard4",
    "hazard5",
    "management"
  ]),
  currentMissionIndex: z.number(),
  enabledContent: enabledContentSchema,
  resources: resourcesSchema,
  houseRules: houseRulesSchema,
  shop: z.array(shopItemSchema),
  catalog: itemCatalogSchema,
  players: z.array(characterSchema),
  recipe: recipeSchema,
  history: z.array(logEntrySchema),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const campaignSaveFileSchema = z.object({
  schemaVersion: z.number(),
  appVersion: z.string(),
  kind: z.literal("campaign-state"),
  campaign: campaignSchema
});

export const recipeSaveFileSchema = z.object({
  schemaVersion: z.number(),
  appVersion: z.string(),
  kind: z.literal("campaign-recipe"),
  recipe: recipeSchema
});
