// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createCampaign } from "../domain/campaign";
import {
  clearActiveCampaignId,
  deleteCampaign,
  getActiveCampaignId,
  listCampaigns,
  loadCampaign,
  saveCampaign,
  setActiveCampaignId
} from "./storage";

const FIXED_NOW = "2026-01-01T00:00:00.000Z";

function makeCampaign(overrides: Partial<Parameters<typeof createCampaign>[0]> = {}) {
  return createCampaign({
    name: "Test Dig",
    mode: "economy",
    playerCount: 4,
    difficulty: "regular",
    seed: "TEST-SEED-1",
    now: FIXED_NOW,
    ...overrides
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("saveCampaign / loadCampaign round-trip", () => {
  it("persists a campaign and reloads an equal value", () => {
    const campaign = makeCampaign();
    saveCampaign(campaign);

    const loaded = loadCampaign(campaign.id);
    expect(loaded).not.toBeNull();
    expect(loaded).toEqual(campaign);
  });

  it("returns null for an unknown id", () => {
    expect(loadCampaign("does-not-exist")).toBeNull();
  });
});

describe("listCampaigns multi-slot index", () => {
  it("starts empty", () => {
    expect(listCampaigns()).toEqual([]);
  });

  it("tracks multiple campaigns with summaries", () => {
    const a = makeCampaign({ name: "Alpha", seed: "A" });
    const b = makeCampaign({ name: "Bravo", mode: "hardcore", seed: "B" });
    saveCampaign(a);
    saveCampaign(b);

    const summaries = listCampaigns();
    expect(summaries).toHaveLength(2);
    const byId = Object.fromEntries(summaries.map((s) => [s.id, s]));
    expect(byId[a.id]).toMatchObject({
      id: a.id,
      name: "Alpha",
      mode: "economy",
      updatedAt: FIXED_NOW
    });
    expect(byId[b.id]).toMatchObject({
      id: b.id,
      name: "Bravo",
      mode: "hardcore"
    });
  });

  it("does not duplicate index entries when re-saving the same campaign", () => {
    const a = makeCampaign({ name: "Alpha" });
    saveCampaign(a);
    saveCampaign({ ...a, name: "Alpha Renamed" });

    const summaries = listCampaigns();
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ id: a.id, name: "Alpha Renamed" });
  });
});

describe("deleteCampaign", () => {
  it("removes the campaign body and its index entry", () => {
    const a = makeCampaign({ name: "Alpha" });
    const b = makeCampaign({ name: "Bravo", seed: "B" });
    saveCampaign(a);
    saveCampaign(b);

    deleteCampaign(a.id);

    expect(loadCampaign(a.id)).toBeNull();
    expect(listCampaigns().map((s) => s.id)).toEqual([b.id]);
  });

  it("clears the active id when the deleted campaign was active", () => {
    const a = makeCampaign();
    saveCampaign(a);
    setActiveCampaignId(a.id);

    deleteCampaign(a.id);

    expect(getActiveCampaignId()).toBeNull();
  });

  it("leaves the active id untouched when a different campaign is deleted", () => {
    const a = makeCampaign({ name: "Alpha" });
    const b = makeCampaign({ name: "Bravo", seed: "B" });
    saveCampaign(a);
    saveCampaign(b);
    setActiveCampaignId(b.id);

    deleteCampaign(a.id);

    expect(getActiveCampaignId()).toBe(b.id);
  });
});

describe("active id get/set/clear", () => {
  it("returns null when nothing is set", () => {
    expect(getActiveCampaignId()).toBeNull();
  });

  it("round-trips set then get", () => {
    setActiveCampaignId("camp-123");
    expect(getActiveCampaignId()).toBe("camp-123");
  });

  it("clears the active id", () => {
    setActiveCampaignId("camp-123");
    clearActiveCampaignId();
    expect(getActiveCampaignId()).toBeNull();
  });
});

describe("loadCampaign validation", () => {
  it("returns null on corrupt (non-JSON) data", () => {
    localStorage.setItem("srq.campaign.bad", "{not valid json");
    expect(loadCampaign("bad")).toBeNull();
  });

  it("returns null on JSON that fails Zod validation", () => {
    // Valid JSON, but missing required campaign fields.
    localStorage.setItem(
      "srq.campaign.invalid",
      JSON.stringify({ id: "invalid", name: "Broken" })
    );
    expect(loadCampaign("invalid")).toBeNull();
  });
});
