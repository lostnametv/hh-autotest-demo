import { defineConfig } from '@playwright/test';
import { ENV } from "./config";

export default defineConfig({
  testDir: process.env.TEST_DIR || ENV.TEST_DIR, //path.join(__dirname, "."), set in config.ts
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || ENV.BASE_URL, //set this in your config.ts
    headless: ENV.HEADLESS, //set this in your config.ts
    viewport: { width: 1920, height: 929 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: ENV.TEST_SUITE,
      testMatch: "**/main.spec.ts", // Match the dynamically generated test entry point
    },
  ],
  reporter: [
    ['line'],
    ['allure-playwright', { resultsDir: 'allure-results' }]
  ]
});
