import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    channel: 'chrome',
    headless: true,
  },
  webServer: {
    command: 'python3 -m http.server 3000 --directory dist',
    port: 3000,
    reuseExistingServer: true,
  },
});
