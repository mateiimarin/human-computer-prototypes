import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3111",
    browserName: "chromium",
    channel: "chrome",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "NUXT_IGNORE_LOCK=1 npm run dev -- --host 127.0.0.1 --port 3111",
    url: "http://127.0.0.1:3111",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
