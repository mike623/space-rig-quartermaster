import { test, expect } from "@playwright/test";

const SEED = "ROCKANDSTONE"; // fixed seed → reproducible recipe → stable screenshots

// Paths resolve from the project root (Playwright's cwd).
const shot = (name: string) => `docs/screenshots/${name}.png`;

// One walkthrough: build a campaign, then screenshot every screen.
// Doubles as a smoke e2e — a broken route fails the run.
test("capture all screens", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: shot("home-empty") });

  await page.getByRole("button", { name: "New Campaign" }).click();
  await expect(page.getByText("New Campaign")).toBeVisible();

  await page.getByLabel("Campaign name").fill("Hoxxes Deep Dive");
  await page.getByRole("textbox", { name: "Seed" }).fill(SEED);
  await page.screenshot({ path: shot("setup") });

  await page.getByRole("button", { name: "Assemble Crew" }).click();
  await expect(page).toHaveURL(/#\/characters/);
  // Let the "crew assembled" toast (2.3s) clear so it isn't in any shot.
  await expect(page.getByText("crew assembled")).toBeHidden();

  // Scroll the content pane to the top so each shot starts at the screen header.
  const settle = async () => {
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      document.querySelector(".app-main")?.scrollTo(0, 0);
    });
  };

  for (const [route, name] of [
    ["#/characters", "characters"],
    ["#/end-mission", "end-mission"],
    ["#/shop", "shop"],
    ["#/launch", "launch"],
    ["#/history", "history"]
  ] as const) {
    await page.goto(`/${route}`);
    await settle();
    await page.screenshot({ path: shot(name) });
  }
});
