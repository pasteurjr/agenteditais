import { defineConfig } from '@playwright/test';

/**
 * Configuração do Playwright para o Facilicita.IA.
 *
 * Ambientes:
 *  - agenteditais (dev): porta 5180 (frontend) / 5007 (backend), banco `editais`.
 *  - editaisvalida (validação externa): porta 5179 (frontend) / 5008 (backend), banco `editaisvalida`.
 *
 * Por padrão os testes rodam contra agenteditais. Para rodar contra editaisvalida:
 *   npx playwright test --project=editaisvalida
 *
 * Specs legados (ciclo Arnaldo, fora do processo V3) estão em
 * `tests/e2e/playwright/legacy/` e ficam ignorados pelos `testIgnore`.
 * Specs do processo V3 (gerados via `/validar-uc`) ficam em
 * `testes/tutoriais_playwright/` e são executados pelo runner próprio.
 */

export default defineConfig({
  testDir: './tests',
  testIgnore: [
    'tests/e2e/playwright/legacy/**',
    'testes/**',
    'tests/results/**',
  ],
  timeout: 120000,
  expect: { timeout: 10000 },
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    // Ignora erros HTTPS (ambiente de dev/staging local)
    ignoreHTTPSErrors: true,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/results/results.json' }],
  ],
  projects: [
    {
      name: 'agenteditais',
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:5180',
      },
    },
    {
      name: 'editaisvalida',
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:5179',
      },
    },
  ],
});
