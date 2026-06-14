// Core domain types for Space Rig Quartermaster.
// NOTE: No official rulebook/card text. All flavour names are generic/custom
// and user-editable. Class names below are generic role labels.

export const SCHEMA_VERSION = 1;
export const APP_VERSION = "0.1.0";

export type CampaignMode = "official" | "economy" | "hardcore";

export type Difficulty =
  | "greenbeard"
  | "regular"
  | "hazard4"
  | "hazard5"
  | "management";

export type DwarfClass =
  | "scout"
  | "engineer"
  | "gunner"
  | "driller"
  | "custom";

export type WeaponSlot = "primary" | "secondary" | "other";

export type LeftBehindPenaltyMode = "soft" | "harsh" | "custom";

export interface Weapon {
  id: string;
  name: string;
  slot: WeaponSlot;
  equipped: boolean;
  active: boolean;
  ammo: number;
  maxAmmo: number;
  overclocked: boolean;
  /** User-authored upgrade notes attached to this weapon. */
  upgrades: string[];
}

export interface Character {
  id: string;
  playerName: string;
  dwarfClass: DwarfClass;
  nickname: string;
  active: boolean;
  maxHp: number;
  hp: number;
  escapedLastMission: boolean;
  leftBehindLastMission: boolean;
  personalGold: number;
  rockNStoneCards: number;
  grenades: number;
  weapons: Weapon[];
  /** Upgrade tokens held but not yet installed on a weapon. */
  uninstalledUpgrades: number;
  /** Active temporary effects (e.g. beer buffs). Free-text, user-named. */
  temporaryEffects: string[];
  notes: string;
}

export interface EnabledContent {
  baseGame: boolean;
  spaceRig: boolean;
  biomeExpansion: boolean;
  customContent: boolean;
}

export interface Resources {
  teamGold: number;
  teamNitra: number;
}

export interface CustomPenaltyFlags {
  healToFull: boolean;
  reloadEquipped: boolean;
  loseGrenades: boolean;
  loseRockNStoneCards: boolean;
  loseUninstalledUpgrades: boolean;
  loseOverclocks: boolean;
  loseNonEquippedWeapons: boolean;
  losePersonalGold: boolean;
}

export interface HouseRules {
  carryHpAmmo: boolean;
  loseUnspentGold: boolean;
  loseUnspentNitra: boolean;
  leftBehindPenalty: LeftBehindPenaltyMode;
  /** Used when leftBehindPenalty === "custom". */
  customPenalty: CustomPenaltyFlags;
  dynamicSwarm: boolean;
  /** Allow spending more resources than available. */
  allowOverspend: boolean;
}

/** A reusable weapon definition the user can add to any dwarf. */
export interface WeaponCatalogEntry {
  name: string;
  slot: WeaponSlot;
  maxAmmo: number;
}

/** Per-campaign predefined item lists. All names are generic and editable;
 * no official/copyrighted names are bundled. */
export interface ItemCatalog {
  weapons: WeaponCatalogEntry[];
  upgrades: string[];
  overclocks: string[];
  grenades: string[];
  beers: string[];
  rockNStoneCards: string[];
}

/** What pressing a shop CTA actually does to campaign state.
 * Target requirements:
 *  - dwarf:  heal, grenade, rockNStone, upgradeToken, beerOne
 *  - weapon: reload, ammo, installUpgrade, overclock
 *  - none:   beerTeam (all active dwarves), flag, none (log only)
 */
export type ShopEffectKind =
  | "heal"
  | "reload"
  | "ammo"
  | "grenade"
  | "rockNStone"
  | "installUpgrade"
  | "upgradeToken"
  | "overclock"
  | "beerOne"
  | "beerTeam"
  | "flag"
  | "none";

/** A configurable rig-shop purchase. All entries are user-editable. */
export interface ShopItem {
  id: string;
  label: string;
  /** Resource consumed by this purchase. */
  currency: "gold" | "nitra";
  cost: number;
  enabled: boolean;
  /** Mechanical effect applied when purchased. */
  effect: ShopEffectKind;
  /** Optional user note describing the in-game effect. */
  note: string;
}

export interface SpendingEntry {
  id: string;
  shopItemId: string;
  label: string;
  currency: "gold" | "nitra";
  cost: number;
  /** Optional target character id. */
  targetCharacterId?: string;
}

/** A generated mission within a campaign recipe. */
export interface Mission {
  id: string;
  index: number;
  name: string;
  missionType: string;
  warnings: string[];
  anomalies: string[];
  biome: string;
  rewardHint: string;
}

export interface MissionResult {
  missionIndex: number;
  missionName: string;
  missionType: string;
  success: boolean;
  primaryComplete: boolean;
  secondaryComplete: boolean;
  goldCollected: number;
  nitraCollected: number;
  escapedCharacterIds: string[];
  leftBehindCharacterIds: string[];
  warnings: string[];
  anomalies: string[];
  biome: string;
  notes: string;
}

export type LogEntryKind =
  | "mission"
  | "spending"
  | "confiscation"
  | "penalty"
  | "note";

export interface ManagementReport {
  missionResult?: MissionResult;
  goldRecovered: number;
  nitraRecovered: number;
  escaped: number;
  leftBehind: number;
  spending: SpendingEntry[];
  confiscatedGold: number;
  confiscatedNitra: number;
  penaltiesApplied: string[];
  notes: string;
  flavour: string;
}

export interface LogEntry {
  id: string;
  kind: LogEntryKind;
  missionIndex: number;
  /** ISO timestamp injected by the caller (domain stays pure). */
  at: string;
  title: string;
  report?: ManagementReport;
}

/** Recipe: reusable scenario definition without live progression. */
export interface CampaignRecipe {
  seed: string;
  difficulty: Difficulty;
  assignmentLength: 3 | 5 | 7 | 0; // 0 === endless
  enabledMissionTypes: string[];
  enabledWarnings: string[];
  enabledAnomalies: string[];
  enabledBiomes: string[];
  rewardDensity: "low" | "medium" | "high";
  missions: Mission[];
}

export interface Campaign {
  id: string;
  name: string;
  mode: CampaignMode;
  seed: string;
  difficulty: Difficulty;
  currentMissionIndex: number;
  enabledContent: EnabledContent;
  resources: Resources;
  houseRules: HouseRules;
  shop: ShopItem[];
  catalog: ItemCatalog;
  players: Character[];
  recipe: CampaignRecipe;
  history: LogEntry[];
  /** ISO timestamps injected by callers. */
  createdAt: string;
  updatedAt: string;
}

/** Top-level export envelope for a full campaign state. */
export interface CampaignSaveFile {
  schemaVersion: number;
  appVersion: string;
  kind: "campaign-state";
  campaign: Campaign;
}

/** Top-level export envelope for a shareable recipe only. */
export interface RecipeSaveFile {
  schemaVersion: number;
  appVersion: string;
  kind: "campaign-recipe";
  recipe: CampaignRecipe;
}
