import { defineConfig, devices } from '@playwright/test';

// El stack debe estar arriba (`make up`). BASE_URL permite apuntar a staging.
export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost', trace: 'retain-on-failure', locale: 'es-CO' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
