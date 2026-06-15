// @vitest-environment jsdom
// Shared helpers for component/screen tests. Import these to seed the Zustand
// store with a real campaign and render a screen inside a router.
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { createCampaign, type CreateCampaignOptions } from "../domain/campaign";
import { useStore } from "../state/store";

/** Reset persisted state + the in-memory store between tests. */
export function resetStore(): void {
  localStorage.clear();
  useStore.setState({ campaign: null, summaries: [], toast: null, activeReport: null });
}

/** Create a campaign, set it active in the store, and return it. */
export function seedCampaign(
  overrides: Partial<Omit<CreateCampaignOptions, "now">> = {}
) {
  const campaign = createCampaign({
    name: "Test Dig",
    mode: "economy",
    playerCount: 4,
    difficulty: "regular",
    seed: "TEST-SEED-1",
    now: "2026-01-01T00:00:00.000Z",
    ...overrides
  });
  useStore.setState({ campaign, summaries: [] });
  return campaign;
}

/** Render a screen/component inside a MemoryRouter at the given path. */
export function renderRouted(ui: ReactElement, initialPath = "/") {
  return render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}
