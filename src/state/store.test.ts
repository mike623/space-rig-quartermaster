// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetStore, seedCampaign } from "../test/helpers";
import { useStore } from "./store";
import * as storage from "../storage/storage";
import type { MissionResult, ShopItem } from "../domain/types";

function st() {
  return useStore.getState();
}

/** Build a minimal MissionResult for the active campaign's players. */
function missionResult(overrides: Partial<MissionResult> = {}): MissionResult {
  return {
    missionIndex: 0,
    missionName: "Test Mission",
    missionType: "mining",
    success: true,
    primaryComplete: true,
    secondaryComplete: false,
    goldCollected: 0,
    nitraCollected: 0,
    escapedCharacterIds: [],
    leftBehindCharacterIds: [],
    warnings: [],
    anomalies: [],
    biome: "cave",
    notes: "",
    ...overrides
  };
}

/** Find an enabled gold shop item from the active campaign. */
function enabledGoldItem(): ShopItem {
  const item = st().campaign!.shop.find(
    (s) => s.enabled && s.currency === "gold"
  );
  if (!item) throw new Error("no enabled gold shop item");
  return item;
}

beforeEach(() => {
  resetStore();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("newCampaign", () => {
  it("creates a campaign, persists it, and refreshes summaries", () => {
    st().newCampaign({
      name: "Fresh Dig",
      mode: "economy",
      playerCount: 3,
      difficulty: "regular",
      seed: "NEW-1"
    });

    const c = st().campaign!;
    expect(c).not.toBeNull();
    expect(c.name).toBe("Fresh Dig");
    expect(c.players).toHaveLength(3);

    // Persisted to localStorage + indexed.
    expect(storage.loadCampaign(c.id)).not.toBeNull();
    expect(storage.getActiveCampaignId()).toBe(c.id);
    expect(st().summaries.map((s) => s.id)).toContain(c.id);
  });
});

describe("selectCampaign", () => {
  it("loads a previously saved campaign as active", () => {
    st().newCampaign({
      name: "A",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "A"
    });
    const a = st().campaign!;
    st().newCampaign({
      name: "B",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "B"
    });
    expect(st().campaign!.name).toBe("B");

    st().selectCampaign(a.id);
    expect(st().campaign!.id).toBe(a.id);
    expect(storage.getActiveCampaignId()).toBe(a.id);
  });

  it("is a no-op for an unknown id", () => {
    const c = seedCampaign();
    st().selectCampaign("nope");
    expect(st().campaign!.id).toBe(c.id);
  });
});

describe("removeCampaign", () => {
  it("deletes the campaign and clears it from state when active", () => {
    st().newCampaign({
      name: "Doomed",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "D"
    });
    const c = st().campaign!;

    st().removeCampaign(c.id);

    expect(st().campaign).toBeNull();
    expect(storage.loadCampaign(c.id)).toBeNull();
    expect(st().summaries.map((s) => s.id)).not.toContain(c.id);
  });

  it("keeps the active campaign when a different one is removed", () => {
    st().newCampaign({
      name: "Other",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "O"
    });
    const other = st().campaign!;
    st().newCampaign({
      name: "Active",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "X"
    });
    const active = st().campaign!;

    st().removeCampaign(other.id);

    expect(st().campaign!.id).toBe(active.id);
  });
});

describe("closeCampaign", () => {
  it("clears active campaign + active id without deleting it", () => {
    st().newCampaign({
      name: "Keep",
      mode: "economy",
      playerCount: 2,
      difficulty: "regular",
      seed: "K"
    });
    const c = st().campaign!;

    st().closeCampaign();

    expect(st().campaign).toBeNull();
    expect(storage.getActiveCampaignId()).toBeNull();
    // Body still persisted.
    expect(storage.loadCampaign(c.id)).not.toBeNull();
  });
});

describe("patch / patchCharacter autosave", () => {
  it("patch mutates, autosaves, and bumps updatedAt", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00.000Z"));
    const c = seedCampaign();
    const before = c.updatedAt;

    vi.setSystemTime(new Date("2026-02-01T00:00:05.000Z"));
    st().patch((camp) => ({
      ...camp,
      resources: { ...camp.resources, teamGold: 99 }
    }));

    const next = st().campaign!;
    expect(next.resources.teamGold).toBe(99);
    expect(next.updatedAt).not.toBe(before);

    // localStorage reflects the change.
    const persisted = storage.loadCampaign(next.id)!;
    expect(persisted.resources.teamGold).toBe(99);
    expect(persisted.updatedAt).toBe(next.updatedAt);
  });

  it("patchCharacter mutates a single player and autosaves", () => {
    const c = seedCampaign();
    const target = c.players[0];

    st().patchCharacter(target.id, (ch) => ({ ...ch, nickname: "Boomer" }));

    const next = st().campaign!;
    expect(next.players.find((p) => p.id === target.id)!.nickname).toBe(
      "Boomer"
    );
    // Other players untouched.
    expect(next.players[1].nickname).toBe(c.players[1].nickname);

    const persisted = storage.loadCampaign(next.id)!;
    expect(persisted.players.find((p) => p.id === target.id)!.nickname).toBe(
      "Boomer"
    );
  });
});

describe("buyItem", () => {
  it("succeeds when resources cover the cost and logs spending", () => {
    seedCampaign();
    const item = enabledGoldItem();
    st().patch((c) => ({
      ...c,
      resources: { ...c.resources, teamGold: 10 }
    }));

    const before = st().campaign!.resources.teamGold;
    const res = st().buyItem(item, { characterId: st().campaign!.players[0].id });

    expect(res.ok).toBe(true);
    const after = st().campaign!;
    expect(after.resources.teamGold).toBe(before - item.cost);
    expect(after.history.some((h) => h.kind === "spending")).toBe(true);
  });

  it("fails / overspends when resources are insufficient", () => {
    seedCampaign();
    const item = enabledGoldItem();
    // teamGold defaults to 0 and overspend is disabled in economy mode.
    const res = st().buyItem(item, { characterId: st().campaign!.players[0].id });

    expect(res.ok).toBe(false);
    expect(res.reason).toBeTruthy();
    // No spending entry recorded, resources unchanged.
    expect(st().campaign!.resources.teamGold).toBe(0);
    expect(st().campaign!.history.some((h) => h.kind === "spending")).toBe(
      false
    );
  });

  it("returns ok:false when there is no active campaign", () => {
    const res = st().buyItem(enabledGoldItemFallback());
    expect(res.ok).toBe(false);
  });
});

// A standalone shop item for the no-campaign case.
function enabledGoldItemFallback(): ShopItem {
  return {
    id: "shop_test",
    label: "Test",
    currency: "gold",
    cost: 1,
    enabled: true,
    effect: "none",
    note: ""
  };
}

describe("recordMissionResult", () => {
  it("banks nitra to the team pool, splits gold, sets report, appends history", () => {
    const c = seedCampaign();
    const ids = c.players.map((p) => p.id);

    const report = st().recordMissionResult(
      missionResult({
        goldCollected: 10,
        nitraCollected: 7,
        escapedCharacterIds: ids // 4 players
      })
    );

    const next = st().campaign!;
    // 10 gold / 4 players = 2 each, leftover 2 to the pool.
    expect(next.resources.teamGold).toBe(2);
    expect(next.resources.teamNitra).toBe(7);
    for (const p of next.players) {
      expect(p.personalGold).toBe(2);
    }

    // activeReport set + returned, history appended.
    expect(st().activeReport).toEqual(report);
    expect(report.nitraRecovered).toBe(7);
    expect(next.history.some((h) => h.kind === "mission")).toBe(true);
  });

  it("only gives personal gold to escaped characters", () => {
    const c = seedCampaign();
    const escaped = c.players[0];

    st().recordMissionResult(
      missionResult({
        goldCollected: 4,
        nitraCollected: 0,
        escapedCharacterIds: [escaped.id]
      })
    );

    const next = st().campaign!;
    expect(
      next.players.find((p) => p.id === escaped.id)!.personalGold
    ).toBe(4);
    for (const p of next.players.filter((p) => p.id !== escaped.id)) {
      expect(p.personalGold).toBe(0);
    }
  });
});

describe("launchNextMission", () => {
  it("confiscates unspent resources, advances the index, logs confiscation", () => {
    seedCampaign();
    // economy mode: loseUnspentGold/Nitra are true by default.
    st().patch((c) => ({
      ...c,
      resources: { teamGold: 5, teamNitra: 3 }
    }));
    const startIndex = st().campaign!.currentMissionIndex;

    const out = st().launchNextMission();

    expect(out.confiscatedGold).toBe(5);
    expect(out.confiscatedNitra).toBe(3);
    const next = st().campaign!;
    expect(next.resources).toEqual({ teamGold: 0, teamNitra: 0 });
    expect(next.currentMissionIndex).toBe(startIndex + 1);
    expect(next.history.some((h) => h.kind === "confiscation")).toBe(true);
    expect(st().activeReport).not.toBeNull();
  });
});

describe("regenerateRecipe", () => {
  it("regenerates the recipe and updates the seed", () => {
    seedCampaign();
    const before = st().campaign!.recipe;

    st().regenerateRecipe({
      difficulty: "hazard5",
      assignmentLength: 3,
      seed: "REGEN-1"
    });

    const next = st().campaign!;
    expect(next.seed).toBe("REGEN-1");
    expect(next.recipe.seed).toBe("REGEN-1");
    expect(next.recipe.difficulty).toBe("hazard5");
    expect(next.recipe).not.toEqual(before);
  });
});

describe("toasts", () => {
  it("showToast sets a toast and dismissToast clears it", () => {
    seedCampaign();
    st().showToast("Hello", "warn");
    expect(st().toast).toEqual({ msg: "Hello", kind: "warn" });

    st().dismissToast();
    expect(st().toast).toBeNull();
  });

  it("defaults toast kind to ok", () => {
    st().showToast("Default");
    expect(st().toast).toEqual({ msg: "Default", kind: "ok" });
  });
});

describe("report open/close", () => {
  it("openReport sets and closeReport clears the active report", () => {
    const fakeReport = {
      goldRecovered: 0,
      nitraRecovered: 0,
      escaped: 0,
      leftBehind: 0,
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied: [],
      notes: "",
      flavour: ""
    };
    st().openReport(fakeReport);
    expect(st().activeReport).toEqual(fakeReport);

    st().closeReport();
    expect(st().activeReport).toBeNull();
  });
});

describe("exportActive + importState round-trip", () => {
  it("exports the active campaign and imports it back", () => {
    const c = seedCampaign();
    // Persist it so export/import operates on a saved state.
    st().patch((camp) => ({
      ...camp,
      resources: { ...camp.resources, teamGold: 42 }
    }));
    const exported = st().exportActive();
    expect(exported).toBeTypeOf("string");

    // Wipe in-memory state and re-import.
    resetStore();
    const result = st().importState(exported!);

    expect(result.ok).toBe(true);
    const imported = st().campaign!;
    expect(imported.id).toBe(c.id);
    expect(imported.resources.teamGold).toBe(42);
    // Imported campaign is now active + persisted.
    expect(storage.getActiveCampaignId()).toBe(imported.id);
    expect(st().summaries.map((s) => s.id)).toContain(imported.id);
  });

  it("exportActive returns null with no active campaign", () => {
    expect(st().exportActive()).toBeNull();
  });

  it("importState reports an error for invalid input", () => {
    const result = st().importState("{not json");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
