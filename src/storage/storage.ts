// Local-first persistence over localStorage. Supports multiple campaign slots
// so the user can keep more than one campaign (MVP open question — see PRD §12).

import { campaignSchema } from "../domain/schema";
import type { Campaign } from "../domain/types";

const INDEX_KEY = "srq.campaigns.index";
const CAMPAIGN_PREFIX = "srq.campaign.";
const ACTIVE_KEY = "srq.activeCampaignId";

export interface CampaignSummary {
  id: string;
  name: string;
  mode: Campaign["mode"];
  updatedAt: string;
}

function safeGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* storage unavailable / quota — ignore in MVP */
  }
}

function safeRemove(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function listCampaigns(): CampaignSummary[] {
  const raw = safeGet(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CampaignSummary[];
  } catch {
    return [];
  }
}

function writeIndex(summaries: CampaignSummary[]): void {
  safeSet(INDEX_KEY, JSON.stringify(summaries));
}

export function saveCampaign(campaign: Campaign): void {
  safeSet(CAMPAIGN_PREFIX + campaign.id, JSON.stringify(campaign));
  const summaries = listCampaigns().filter((s) => s.id !== campaign.id);
  summaries.push({
    id: campaign.id,
    name: campaign.name,
    mode: campaign.mode,
    updatedAt: campaign.updatedAt
  });
  writeIndex(summaries);
}

export function loadCampaign(id: string): Campaign | null {
  const raw = safeGet(CAMPAIGN_PREFIX + id);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const result = campaignSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function deleteCampaign(id: string): void {
  safeRemove(CAMPAIGN_PREFIX + id);
  writeIndex(listCampaigns().filter((s) => s.id !== id));
  if (getActiveCampaignId() === id) clearActiveCampaignId();
}

export function getActiveCampaignId(): string | null {
  return safeGet(ACTIVE_KEY);
}

export function setActiveCampaignId(id: string): void {
  safeSet(ACTIVE_KEY, id);
}

export function clearActiveCampaignId(): void {
  safeRemove(ACTIVE_KEY);
}
