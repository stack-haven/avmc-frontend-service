import type { PlaywrightTestConfig } from '@playwright/test';

import { devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 10_000,
  },
  forbidOnly: !!process.env.CI,
  outputDir: 'node_modules/.e2e/test-results',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  reporter: [['list']],
  retries: process.env.CI ? 1 : 0,
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5999',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        'cd ../../../backend-service && GOCACHE=/private/tmp/avmc-go-cache go run ./app/platform/admin/cmd/server -conf ./app/platform/admin/configs',
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'VITE_NITRO_MOCK=false pnpm vite --mode development --host 127.0.0.1 --port 5999',
      port: 5999,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  workers: 1,
};

export default config;
