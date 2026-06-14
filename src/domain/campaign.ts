// Campaign factory + defaults + high-level lifecycle helpers.

import { newId } from "./ids";
import { createCharacter } from "./character";
import { defaultCatalog } from "./catalog";
import { defaultShop } from "./economy";
import { generateRecipe } from "./randomizer";
import type {
  Campaign,
  CampaignMode,
  Difficulty,
  DwarfClass,
  EnabledContent,
  HouseRules
} from "./types";

export function defaultHouseRules(mode: CampaignMode): HouseRules {
  const base: HouseRules = {
    carryHpAmmo: true,
    loseUnspentGold: true,
    loseUnspentNitra: true,
    leftBehindPenalty: "soft",
    customPenalty: {
      healToFull: true,
      reloadEquipped: true,
      loseGrenades: true,
      loseRockNStoneCards: true,
      loseUninstalledUpgrades: true,
      loseOverclocks: false,
      loseNonEquippedWeapons: false,
      losePersonalGold: false
    },
    dynamicSwarm: false,
    allowOverspend: false
  };
  if (mode === "official") {
    return {
      ...base,
      loseUnspentGold: false,
      loseUnspentNitra: false
    };
  }
  if (mode === "hardcore") {
    return {
      ...base,
      leftBehindPenalty: "harsh",
      dynamicSwarm: true
    };
  }
  return base;
}

export function defaultEnabledContent(): EnabledContent {
  return {
    baseGame: true,
    spaceRig: true,
    biomeExpansion: false,
    customContent: true
  };
}

export interface CreateCampaignOptions {
  name: string;
  mode: CampaignMode;
  playerCount: number;
  difficulty: Difficulty;
  seed: string;
  enabledContent?: EnabledContent;
  /** Roles assigned per slot; defaults to a sensible rotation. */
  classes?: DwarfClass[];
  now: string; // ISO timestamp injected by caller
}

const DEFAULT_CLASS_ROTATION: DwarfClass[] = [
  "scout",
  "engineer",
  "gunner",
  "driller"
];

export function createCampaign(opts: CreateCampaignOptions): Campaign {
  const mode = opts.mode;
  const count = Math.max(1, Math.min(4, opts.playerCount));
  const classes = opts.classes ?? DEFAULT_CLASS_ROTATION;
  const hardcore = mode === "hardcore";

  const players = Array.from({ length: count }, (_, i) =>
    createCharacter({
      dwarfClass: classes[i] ?? "custom",
      noStartingSecondary: hardcore,
      noStartingGrenade: hardcore
    })
  );

  const recipe = generateRecipe({
    seed: opts.seed,
    difficulty: opts.difficulty,
    assignmentLength: 5
  });

  return {
    id: newId("campaign"),
    name: opts.name,
    mode,
    seed: opts.seed,
    difficulty: opts.difficulty,
    currentMissionIndex: 0,
    enabledContent: opts.enabledContent ?? defaultEnabledContent(),
    resources: { teamGold: 0, teamNitra: 0 },
    houseRules: defaultHouseRules(mode),
    shop: defaultShop(),
    catalog: defaultCatalog(),
    players,
    recipe,
    history: [],
    createdAt: opts.now,
    updatedAt: opts.now
  };
}

export function activePlayers(campaign: Campaign) {
  return campaign.players.filter((p) => p.active);
}

export function currentMission(campaign: Campaign) {
  return campaign.recipe.missions[campaign.currentMissionIndex];
}
