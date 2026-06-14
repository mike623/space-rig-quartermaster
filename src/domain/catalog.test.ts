import { describe, expect, it } from "vitest";
import { defaultCatalog } from "./catalog";
import { createCampaign } from "./campaign";

// Generic, original placeholder names that must NOT appear (sample of
// product-specific terms). Guards against accidentally bundling official names.
const FORBIDDEN = ["lead storm", "cryo cannon", "leadburster", "stubby"];

describe("defaultCatalog", () => {
  it("provides non-empty generic lists", () => {
    const c = defaultCatalog();
    expect(c.weapons.length).toBeGreaterThan(0);
    expect(c.upgrades.length).toBeGreaterThan(0);
    expect(c.grenades.length).toBeGreaterThan(0);
    expect(c.beers.length).toBeGreaterThan(0);
    expect(c.rockNStoneCards.length).toBeGreaterThan(0);
  });

  it("does not contain known product-specific names", () => {
    const all = JSON.stringify(defaultCatalog()).toLowerCase();
    for (const term of FORBIDDEN) {
      expect(all).not.toContain(term);
    }
  });

  it("is attached to a freshly created campaign", () => {
    const camp = createCampaign({
      name: "C",
      mode: "economy",
      playerCount: 1,
      difficulty: "regular",
      seed: "S",
      now: "2026-01-01T00:00:00.000Z"
    });
    expect(camp.catalog.weapons.length).toBeGreaterThan(0);
  });
});
