import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Playwright doesn't read .env automatically. Load it so tests can use
// DASHBOARD_PASSWORD without hardcoding.
loadEnv();

const PORT = process.env.PORT ?? "3000";
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // tests touch the shared dev DB; keep them sequential
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // We assume `npm run dev` is running in another terminal. To make CI
  // self-sufficient later, uncomment the webServer block:
  // webServer: {
  //   command: "npm run dev",
  //   url: BASE_URL,
  //   reuseExistingServer: true,
  //   timeout: 120_000,
  // },
});
