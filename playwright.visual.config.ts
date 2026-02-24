import { defineConfig } from '@playwright/test';

/**
 * Configuracao para rodar testes em modo VISUAL (headed + slowMo).
 * O usuario ve o browser abrir e executar cada acao como se fosse um humano.
 *
 * Uso:
 *   npx playwright test --config=playwright.visual.config.ts tests/validacao_sprint2.spec.ts
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: { timeout: 15000 },
  workers: 1,            // Um worker = sequencial
  retries: 0,            // Sem retries para ver cada teste
  use: {
    baseURL: 'http://localhost:5175',
    headless: false,      // <<< BROWSER VISIVEL
    launchOptions: {
      slowMo: 400,        // 400ms entre cada acao — da tempo de ver
    },
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    video: 'on',          // Grava video de cada teste
    trace: 'on',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/results/html-report', open: 'never' }],
  ],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
