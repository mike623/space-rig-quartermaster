import { describe, expect, it } from "vitest";
import {
  activePlayers,
  createCampaign,
  currentMission,
  defaultEnabledContent,
  defaultHouseRules,
  type CreateCampaignOptions
} from "./campaign";
import type { DwarfClass } from "./types";

const NOW = "2026-01-01T00:00:00.000Z";

function opts(
  over: Partial<CreateCampaignOptions> = {}
): CreateCampaignOptions {
  return {
    name: "Test Campaign",
    mode: "economy",
    playerCount: 4,
    difficulty: "regular",
    seed: "SEED-1",
    now: NOW,
    ...over
  };
}

describe("defaultHouseRules", () => {
  it("economy mode loses unspent gold and nitra with soft penalty", () => {
    const r = defaultHouseRules("economy");
    expect(r.loseUnspentGold).toBe(true);
    expect(r.loseUnspentNitra).toBe(true);
    expect(r.leftBehindPenalty).toBe("soft");
    expect(r.dynamicSwarm).toBe(false);
  });

  it("official mode keeps unspent resources", () => {
    const r = defaultHouseRules("official");
    expect(r.loseUnspentGold).toBe(false);
    expect(r.loseUnspentNitra).toBe(false);
  });

  it("hardcore mode is harsh and enables dynamic swarm", () => {
    const r = defaultHouseRules("hardcore");
    expect(r.leftBehindPenalty).toBe("harsh");
    expect(r.dynamicSwarm).toBe(true);
    // still loses unspent resources (not official)
    expect(r.loseUnspentGold).toBe(true);
    expect(r.loseUnspentNitra).toBe(true);
  });
});

describe("defaultEnabledContent", () => {
  it("enables base game, space rig, and custom content by default", () => {
    expect(defaultEnabledContent()).toEqual({
      baseGame: true,
      spaceRig: true,
      biomeExpansion: false,
      customContent: true
    });
  });
});

describe("createCampaign", () => {
  it("initializes core fields and zeroed resources", () => {
    const c = createCampaign(opts());
    expect(c.name).toBe("Test Campaign");
    expect(c.mode).toBe("economy");
    expect(c.seed).toBe("SEED-1");
    expect(c.difficulty).toBe("regular");
    expect(c.currentMissionIndex).toBe(0);
    expect(c.resources).toEqual({ teamGold: 0, teamNitra: 0 });
    expect(c.history).toEqual([]);
    expect(c.createdAt).toBe(NOW);
    expect(c.updatedAt).toBe(NOW);
    expect(c.id).toMatch(/^campaign_/);
  });

  it("clamps player count to the 1..4 range", () => {
    expect(createCampaign(opts({ playerCount: 0 })).players).toHaveLength(1);
    expect(createCampaign(opts({ playerCount: 1 })).players).toHaveLength(1);
    expect(createCampaign(opts({ playerCount: 4 })).players).toHaveLength(4);
    expect(createCampaign(opts({ playerCount: 9 })).players).toHaveLength(4);
    expect(createCampaign(opts({ playerCount: -5 })).players).toHaveLength(1);
  });

  it("assigns the default class rotation when none provided", () => {
    const c = createCampaign(opts({ playerCount: 4 }));
    expect(c.players.map((p) => p.dwarfClass)).toEqual([
      "scout",
      "engineer",
      "gunner",
      "driller"
    ]);
  });

  it("honors a custom class assignment", () => {
    const classes: DwarfClass[] = ["gunner", "gunner"];
    const c = createCampaign(opts({ playerCount: 2, classes }));
    expect(c.players.map((p) => p.dwarfClass)).toEqual(["gunner", "gunner"]);
  });

  it("falls back to 'custom' for slots beyond the provided classes", () => {
    const classes: DwarfClass[] = ["scout"];
    const c = createCampaign(opts({ playerCount: 3, classes }));
    expect(c.players.map((p) => p.dwarfClass)).toEqual([
      "scout",
      "custom",
      "custom"
    ]);
  });

  it("applies hardcore restrictions to created characters", () => {
    const c = createCampaign(opts({ mode: "hardcore", playerCount: 2 }));
    for (const p of c.players) {
      expect(p.grenades).toBe(0);
      expect(p.weapons.some((w) => w.slot === "secondary")).toBe(false);
    }
    expect(c.houseRules.leftBehindPenalty).toBe("harsh");
  });

  it("does not strip secondary/grenade in non-hardcore modes", () => {
    const c = createCampaign(opts({ mode: "economy", playerCount: 1 }));
    expect(c.players[0].weapons.some((w) => w.slot === "secondary")).toBe(true);
  });

  it("uses provided enabledContent or falls back to default", () => {
    const def = createCampaign(opts());
    expect(def.enabledContent).toEqual(defaultEnabledContent());

    const custom = createCampaign(
      opts({
        enabledContent: {
          baseGame: true,
          spaceRig: false,
          biomeExpansion: true,
          customContent: false
        }
      })
    );
    expect(custom.enabledContent.biomeExpansion).toBe(true);
    expect(custom.enabledContent.spaceRig).toBe(false);
  });

  it("generates a recipe with missions and house rules matching the mode", () => {
    const c = createCampaign(opts({ mode: "official" }));
    expect(c.recipe.missions.length).toBeGreaterThan(0);
    expect(c.houseRules.loseUnspentGold).toBe(false);
  });

  it("is reproducible: same seed yields the same recipe", () => {
    const a = createCampaign(opts({ seed: "REPRO" }));
    const b = createCampaign(opts({ seed: "REPRO" }));
    expect(a.recipe.missions.map((m) => m.name)).toEqual(
      b.recipe.missions.map((m) => m.name)
    );
  });
});

describe("activePlayers", () => {
  it("returns only active players", () => {
    const c = createCampaign(opts({ playerCount: 3 }));
    c.players[1].active = false;
    const active = activePlayers(c);
    expect(active).toHaveLength(2);
    expect(active.every((p) => p.active)).toBe(true);
  });
});

describe("currentMission", () => {
  it("returns the mission at the current index", () => {
    const c = createCampaign(opts());
    expect(currentMission(c)).toBe(c.recipe.missions[0]);
    c.currentMissionIndex = 1;
    expect(currentMission(c)).toBe(c.recipe.missions[1]);
  });
});
