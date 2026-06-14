// Zustand store: holds the active campaign, wires domain logic to UI, and
// auto-saves to localStorage after every change.

import { create } from "zustand";
import { createCampaign, type CreateCampaignOptions } from "../domain/campaign";
import {
  applyLeftBehindPenalty,
  resolvePenaltyFlags
} from "../domain/character";
import {
  applyShopEffect,
  confiscate,
  purchase,
  splitGold,
  type ShopTarget
} from "../domain/economy";
import { generateRecipe, type GenerateRecipeOptions } from "../domain/randomizer";
import { buildManagementReport } from "../domain/report";
import { exportCampaign, importCampaign } from "../domain/sharing";
import { newId } from "../domain/ids";
import type {
  Campaign,
  Character,
  LogEntry,
  ManagementReport,
  MissionResult,
  ShopItem
} from "../domain/types";
import * as storage from "../storage/storage";

function now(): string {
  return new Date().toISOString();
}

interface StoreState {
  summaries: storage.CampaignSummary[];
  campaign: Campaign | null;

  refreshSummaries: () => void;
  newCampaign: (opts: Omit<CreateCampaignOptions, "now">) => void;
  selectCampaign: (id: string) => void;
  removeCampaign: (id: string) => void;
  closeCampaign: () => void;

  /** Generic mutator: receives a draft-clone and returns a new campaign. */
  patch: (fn: (c: Campaign) => Campaign) => void;
  patchCharacter: (id: string, fn: (ch: Character) => Character) => void;

  buyItem: (
    item: ShopItem,
    target?: ShopTarget
  ) => { ok: boolean; reason?: string; description?: string };

  recordMissionResult: (result: MissionResult) => ManagementReport;
  launchNextMission: () => { confiscatedGold: number; confiscatedNitra: number };

  regenerateRecipe: (opts: Omit<GenerateRecipeOptions, "seed"> & { seed?: string }) => void;

  exportActive: () => string | null;
  importState: (
    text: string
  ) => { ok: boolean; error?: string; warnings?: string[] };
}

function persist(c: Campaign): Campaign {
  const stamped = { ...c, updatedAt: now() };
  storage.saveCampaign(stamped);
  storage.setActiveCampaignId(stamped.id);
  return stamped;
}

export const useStore = create<StoreState>((set, get) => ({
  summaries: storage.listCampaigns(),
  campaign: (() => {
    const id = storage.getActiveCampaignId();
    return id ? storage.loadCampaign(id) : null;
  })(),

  refreshSummaries: () => set({ summaries: storage.listCampaigns() }),

  newCampaign: (opts) => {
    const campaign = createCampaign({ ...opts, now: now() });
    storage.saveCampaign(campaign);
    storage.setActiveCampaignId(campaign.id);
    set({ campaign, summaries: storage.listCampaigns() });
  },

  selectCampaign: (id) => {
    const campaign = storage.loadCampaign(id);
    if (campaign) {
      storage.setActiveCampaignId(id);
      set({ campaign });
    }
  },

  removeCampaign: (id) => {
    storage.deleteCampaign(id);
    const active = get().campaign;
    set({
      summaries: storage.listCampaigns(),
      campaign: active?.id === id ? null : active
    });
  },

  closeCampaign: () => {
    storage.clearActiveCampaignId();
    set({ campaign: null });
  },

  patch: (fn) => {
    const c = get().campaign;
    if (!c) return;
    const next = persist(fn(c));
    set({ campaign: next, summaries: storage.listCampaigns() });
  },

  patchCharacter: (id, fn) => {
    get().patch((c) => ({
      ...c,
      players: c.players.map((p) => (p.id === id ? fn(p) : p))
    }));
  },

  buyItem: (item, target) => {
    const c = get().campaign;
    if (!c) return { ok: false, reason: "No active campaign" };
    const result = purchase(c.resources, item, {
      allowOverspend: c.houseRules.allowOverspend,
      targetCharacterId: target?.characterId
    });
    if (!result.ok || !result.entry) {
      return { ok: false, reason: result.reason };
    }

    // Apply the mechanical effect to the players.
    const applied = applyShopEffect(c.players, item, target ?? {});
    const title = `Bought: ${item.label} — ${applied.description}`;

    get().patch((camp) => ({
      ...camp,
      resources: result.resources,
      players: applied.players,
      history: [
        ...camp.history,
        {
          id: newId("log"),
          kind: "spending",
          missionIndex: camp.currentMissionIndex,
          at: now(),
          title
        } satisfies LogEntry
      ]
    }));
    return { ok: true, description: applied.description };
  },

  recordMissionResult: (result) => {
    const c = get().campaign!;
    const flags = resolvePenaltyFlags(c.houseRules);

    // Apply left-behind penalties to affected characters.
    const penaltiesApplied: string[] = [];
    const players = c.players.map((p) => {
      if (result.leftBehindCharacterIds.includes(p.id)) {
        const out = applyLeftBehindPenalty(p, flags);
        if (out.effects.length) {
          penaltiesApplied.push(`${p.nickname}: ${out.effects.join(", ")}`);
        }
        return out.character;
      }
      return {
        ...p,
        leftBehindLastMission: false,
        escapedLastMission: result.escapedCharacterIds.includes(p.id)
      };
    });

    // Add collected resources to the team pool, plus per-player gold split.
    const split = splitGold(result.goldCollected, result.escapedCharacterIds.length);
    const playersWithGold = players.map((p) =>
      result.escapedCharacterIds.includes(p.id)
        ? { ...p, personalGold: p.personalGold + split.perPlayer }
        : p
    );

    const report = buildManagementReport({
      missionResult: result,
      spending: [],
      confiscatedGold: 0,
      confiscatedNitra: 0,
      penaltiesApplied,
      flavourSeed: Math.random()
    });

    get().patch((camp) => ({
      ...camp,
      players: playersWithGold,
      resources: {
        teamGold: camp.resources.teamGold + split.leftover,
        teamNitra: camp.resources.teamNitra + result.nitraCollected
      },
      history: [
        ...camp.history,
        {
          id: newId("log"),
          kind: "mission",
          missionIndex: result.missionIndex,
          at: now(),
          title: `Mission ${result.missionIndex + 1}: ${
            result.success ? "Success" : "Failure"
          }`,
          report
        } satisfies LogEntry
      ]
    }));
    return report;
  },

  launchNextMission: () => {
    const c = get().campaign!;
    const conf = confiscate(c);
    get().patch((camp) => ({
      ...camp,
      resources: conf.resources,
      currentMissionIndex: camp.currentMissionIndex + 1,
      history: [
        ...camp.history,
        {
          id: newId("log"),
          kind: "confiscation",
          missionIndex: camp.currentMissionIndex,
          at: now(),
          title: `Management confiscated ${conf.confiscatedGold} Gold, ${conf.confiscatedNitra} Nitra`
        } satisfies LogEntry
      ]
    }));
    return {
      confiscatedGold: conf.confiscatedGold,
      confiscatedNitra: conf.confiscatedNitra
    };
  },

  regenerateRecipe: (opts) => {
    get().patch((c) => {
      const seed = opts.seed ?? c.seed;
      return {
        ...c,
        seed,
        recipe: generateRecipe({ ...opts, seed })
      };
    });
  },

  exportActive: () => {
    const c = get().campaign;
    return c ? exportCampaign(c) : null;
  },

  importState: (text) => {
    const result = importCampaign(text);
    if (!result.ok) return { ok: false, error: result.error };
    const campaign = persist(result.value);
    set({ campaign, summaries: storage.listCampaigns() });
    return { ok: true, warnings: result.warnings };
  }
}));
