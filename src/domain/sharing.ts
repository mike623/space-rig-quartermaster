// Export/import of campaign state and recipes, with schema-version handling
// and zod validation. Migrations live in `migrate` keyed by schemaVersion.

import {
  APP_VERSION,
  SCHEMA_VERSION,
  type Campaign,
  type CampaignRecipe,
  type CampaignSaveFile,
  type RecipeSaveFile
} from "./types";
import { campaignSaveFileSchema, recipeSaveFileSchema } from "./schema";

// Compile-time assertion that the zod schemas line up with the domain types.
// If a field drifts, these assignments fail to typecheck.
type _AssertCampaignFile = CampaignSaveFile extends import("zod").infer<
  typeof campaignSaveFileSchema
>
  ? true
  : never;
type _AssertRecipeFile = RecipeSaveFile extends import("zod").infer<
  typeof recipeSaveFileSchema
>
  ? true
  : never;
const _checks: [_AssertCampaignFile, _AssertRecipeFile] = [true, true];
void _checks;

export function exportCampaign(campaign: Campaign): string {
  const file: CampaignSaveFile = {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    kind: "campaign-state",
    campaign
  };
  return JSON.stringify(file, null, 2);
}

export function exportRecipe(recipe: CampaignRecipe): string {
  const file: RecipeSaveFile = {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    kind: "campaign-recipe",
    recipe
  };
  return JSON.stringify(file, null, 2);
}

export type ImportResult<T> =
  | { ok: true; value: T; warnings: string[] }
  | { ok: false; error: string };

/** Future schema migrations are applied here before validation. */
function migrate(raw: unknown): unknown {
  if (raw && typeof raw === "object" && "schemaVersion" in raw) {
    const v = (raw as { schemaVersion: number }).schemaVersion;
    // No migrations yet (only v1). Add stepwise migrations here as the
    // schema evolves: if (v < 2) raw = migrateV1toV2(raw); ...
    void v;
  }
  return raw;
}

function parseJson(text: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function importCampaign(text: string): ImportResult<Campaign> {
  const parsed = parseJson(text);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const migrated = migrate(parsed.data);
  const result = campaignSaveFileSchema.safeParse(migrated);
  if (!result.success) {
    return {
      ok: false,
      error: `Schema validation failed: ${result.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`
    };
  }

  const warnings: string[] = [];
  if (result.data.schemaVersion !== SCHEMA_VERSION) {
    warnings.push(
      `File schema v${result.data.schemaVersion} differs from app v${SCHEMA_VERSION}.`
    );
  }
  if (result.data.appVersion !== APP_VERSION) {
    warnings.push(
      `File created by app v${result.data.appVersion} (current v${APP_VERSION}).`
    );
  }
  return { ok: true, value: result.data.campaign, warnings };
}

export function importRecipe(text: string): ImportResult<CampaignRecipe> {
  const parsed = parseJson(text);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const migrated = migrate(parsed.data);
  const result = recipeSaveFileSchema.safeParse(migrated);
  if (!result.success) {
    return {
      ok: false,
      error: `Schema validation failed: ${result.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`
    };
  }

  const warnings: string[] = [];
  if (result.data.schemaVersion !== SCHEMA_VERSION) {
    warnings.push(
      `File schema v${result.data.schemaVersion} differs from app v${SCHEMA_VERSION}.`
    );
  }
  return { ok: true, value: result.data.recipe, warnings };
}
