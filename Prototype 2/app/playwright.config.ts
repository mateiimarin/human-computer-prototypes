import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './tests/e2e', fullyParallel: false, use: { baseURL: 'http://127.0.0.1:3002', headless: true, channel: 'chrome', trace: 'retain-on-failure' }, webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3002', reuseExistingServer: true, timeout: 120000 } })
