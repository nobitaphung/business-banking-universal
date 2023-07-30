import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { join } from 'path';
import { TestOptions } from '@backbase/business-e2e';

const config: PlaywrightTestConfig<TestOptions> = {
  testDir: './src',
  timeout: process.env.CI ? 120 * 1000 : 60 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  use: {
    actionTimeout: 0,
    headless: !!process.env.CI,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium-un-s',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1723, height: 896 },
        configPath: join(__dirname, 'config/bus-un-s.config.json'),
      },
    },
  ],
};

export default config;
