import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible, selectFirstContrato } from "./helpers";

const UC = "CT08";

test.describe(`UC-${UC}: Auditoria Empenho x Fatura x Entrega`, () => {
  test("Sequência completa UC-CT08", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar Execução
    await login(page);
    await navTo(page, "Execucao Contrato");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await assertDataVisible(page, { anyText: ["Contratos", "Auditoria"], minCount: 2 });
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Selecionar contrato
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const clicked = await selectFirstContrato(page, "CTR-2025-0087");
    expect(clicked).toBeTruthy();
    await page.waitForTimeout(2000);
    await assertDataVisible(page, { anyText: ["Contrato selecionado"], minCount: 1 });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Abrir aba Auditoria
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    await clickTab(page, "Auditoria");
    await page.waitForTimeout(3000);
    await assertDataVisible(page, {
      anyText: ["Empenhado", "Faturado", "Pago", "Entregue", "Saldo"],
      minCount: 4,
    });
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    let body = await getBody(page);
    expect(body.includes("Auditoria")).toBeTruthy();

    // P04 — Verificar 5 totais + tabela com empenhos
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await page.waitForTimeout(500);
    body = await getBody(page);
    expect(body.includes("EMPH-")).toBeTruthy();
    expect(body.includes("R$")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });

    // P05 — Botão Exportar CSV presente
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const hasExport = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button"))
        .some(b => (b.textContent || "").includes("Exportar CSV"));
    });
    expect(hasExport).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
  });
});
