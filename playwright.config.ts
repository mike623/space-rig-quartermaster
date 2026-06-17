import { defineConfig, devices } from "@playwright/test";

// ponytail: dev server + one mobile project is all the screenshot run needs.
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
    ...devices["iPhone 13"]
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI
  }
});
