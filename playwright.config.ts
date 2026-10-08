import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  // PW_CHROMIUM_PATH: usa um Chromium já instalado (ex.: ambientes sem download dos navegadores do Playwright).
  use: { baseURL: "http://localhost:3000", launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined } },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }, // emulação mobile no Chromium
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
