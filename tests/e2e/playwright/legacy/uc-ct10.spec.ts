import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "./helpers";

const UC = "CT10";

test.describe(`UC-${UC}: KPIs de Execução de Contratos`, () => {
  test("Sequência completa UC-CT10", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar Execução
    await login(page);
    await navTo(page, "Execucao Contrato");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba KPIs
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "KPIs");
    await page.waitForTimeout(3000);
    await assertDataVisible(page, {
      anyText: ["Contratos Ativos", "Vencer 30 dias", "Vencer 90 dias", "Em Tratativa", "Renovados"],
      minCount: 4,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar 6 stat cards
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Contratos Ativos")).toBeTruthy();
    expect(body.includes("Vencer 30 dias")).toBeTruthy();
    expect(body.includes("Vencer 90 dias")).toBeTruthy();
    expect(body.includes("Em Tratativa")).toBeTruthy();
    expect(body.includes("Renovados")).toBeTruthy();
    expect(body.includes("Não Renovados")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar card Período de referência
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await assertDataVisible(page, { anyText: ["Período de referência", "Hoje"], minCount: 1 });
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
  });
});
