/**
 * Smoke test do playwright.config.ts (V3).
 *
 * Garante que:
 *  - Os 2 projetos (agenteditais, editaisvalida) funcionam
 *  - baseURL aponta pro frontend correto
 *  - testIgnore não está pegando este arquivo
 *
 * NÃO testa lógica de negócio — só que o harness de testes está saudável.
 *
 * Pre-condicao: pelo menos um dos ambientes (agenteditais OU editaisvalida)
 * tem que estar rodando para o smoke passar. Se nenhum estiver, o teste
 * é skipped graciosamente em vez de falhar.
 */
import { test, expect } from "@playwright/test";

test("smoke: config carrega e baseURL responde (ou skip se ambiente off)", async ({ page, baseURL }) => {
  // baseURL deve estar definido pela config
  expect(baseURL).toBeDefined();
  expect(baseURL).toMatch(/^https?:\/\/localhost:51(79|80)/);

  // Verificar se o ambiente está ativo. Se não, skip (não falha).
  const url = baseURL!;
  let alive = false;
  try {
    const resp = await page.goto(url, { timeout: 5000, waitUntil: "domcontentloaded" });
    alive = !!resp && resp.status() < 500;
  } catch {
    alive = false;
  }

  test.skip(!alive, `Ambiente ${url} não está rodando — smoke pulado (config OK).`);

  // Se está vivo, página deve ter conteúdo (pelo menos <body>)
  const bodyExists = await page.locator("body").count();
  expect(bodyExists).toBeGreaterThan(0);
});
