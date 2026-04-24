import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "../helpers";

const UC = "CT09";

test.describe(`UC-${UC}: Contratos a Vencer — 5 tiers`, () => {
  test("Sequência completa UC-CT09", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar Execução
    await login(page);
    await navTo(page, "Execucao Contrato");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Vencimentos (não precisa selecionar contrato)
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Vencimentos");
    await page.waitForTimeout(3000);
    await assertDataVisible(page, {
      anyText: ["A vencer 30 dias", "A vencer 90 dias", "Em Tratativa", "Renovados", "Não Renovados"],
      minCount: 4,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar 5 tiers presentes
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("A vencer 30 dias")).toBeTruthy();
    expect(body.includes("A vencer 90 dias")).toBeTruthy();
    expect(body.includes("Em Tratativa")).toBeTruthy();
    expect(body.includes("Renovados")).toBeTruthy();
    expect(body.includes("Não Renovados")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar contratos reais exibidos (CTR-CH-2026)
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await assertDataVisible(page, {
      anyText: ["CTR-CH-2026", "CTR-2025", "CTR-"],
      minCount: 1,
    });
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
  });
});
