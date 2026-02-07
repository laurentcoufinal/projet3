import { defineConfig, devices } from '@playwright/test';

/**
 * Tests E2E Playwright.
 * Prérequis : l'API backend doit être démarrée (ex. Laravel sur http://localhost:8000)
 * et les tables préparées (migrations + éventuel seed de test).
 * Le serveur frontend Vite est lancé automatiquement avant les tests.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
