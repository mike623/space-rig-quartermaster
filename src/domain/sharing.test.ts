import { describe, expect, it } from "vitest";
import {
  exportCampaign,
  exportRecipe,
  importCampaign,
  importRecipe
} from "./sharing";
import { createCampaign } from "./campaign";
import { SCHEMA_VERSION } from "./types";

const sample = () =>
  createCampaign({
    name: "Roundtrip",
    mode: "economy",
    playerCount: 4,
    difficulty: "hazard4",
    seed: "ROUND-TRIP-1",
    now: "2026-01-01T00:00:00.000Z"
  });

describe("campaign export/import roundtrip", () => {
  it("imports exactly what was exported", () => {
    const c = sample();
    const json = exportCampaign(c);
    const result = importCampaign(json);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(c);
  });

  it("rejects invalid JSON", () => {
    const r = importCampaign("{not json");
    expect(r.ok).toBe(false);
  });

  it("rejects structurally invalid data", () => {
    const r = importCampaign(JSON.stringify({ schemaVersion: 1, foo: "bar" }));
    expect(r.ok).toBe(false);
  });

  it("warns on app/schema version mismatch but still imports", () => {
    const c = sample();
    const file = JSON.parse(exportCampaign(c));
    file.appVersion = "9.9.9";
    const r = importCampaign(JSON.stringify(file));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe("recipe export/import roundtrip", () => {
  it("imports exactly what was exported", () => {
    const c = sample();
    const json = exportRecipe(c.recipe);
    expect(JSON.parse(json).schemaVersion).toBe(SCHEMA_VERSION);
    const r = importRecipe(json);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual(c.recipe);
  });

  it("does not accept a state file as a recipe", () => {
    const c = sample();
    const r = importRecipe(exportCampaign(c));
    expect(r.ok).toBe(false);
  });
});
