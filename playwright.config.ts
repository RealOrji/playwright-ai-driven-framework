import { defineConfig, devices } from '@playwright/test';
import { resolveEnvironment } from './config/environments';

const environment = resolveEnvironment(process.env.TEST_ENV);
const viewport = { width: 1366, height: 768 };
const isCI = !!process.env.CI;

console.log(`Running against "${environment.name}" (${environment.baseUrl})`);

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 8000 },
  use: {
    baseURL: environment.baseUrl,
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport },
      dependencies: ['setup'],
    },
  ],
});
