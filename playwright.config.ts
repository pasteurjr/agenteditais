import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'http://localhost:5175',
    headless: true,
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/results/results.json' }],
  ],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
