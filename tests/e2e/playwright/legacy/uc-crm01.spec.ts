import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "../helpers";

const UC = "CRM01";

test.describe(`UC-${UC}: Pipeline Kanban (13 stages)`, () => {
  test("Sequência completa UC-CRM01", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await assertDataVisible(page, { anyText: ["CRM", "Pipeline", "Mapa", "Agenda"], minCount: 2 });
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Pipeline
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Pipeline");
    await page.waitForTimeout(3000);
    await assertDataVisible(page, { anyText: ["Pipeline de Vendas", "editais"], minCount: 1 });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar presença dos 13 stages (alguns labels do PIPELINE_STAGES)
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    const stageLabels = [
      "Captado", "Análise", "Lead", "Monitoramento",
      "Impugnação", "Proposta", "Espera", "Ganho", "Recurso", "Contra", "Resultado",
    ];
    const found = stageLabels.filter(l => body.includes(l));
    expect(found.length).toBeGreaterThanOrEqual(5);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar contadores de editais nos cards
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await assertDataVisible(page, { anyText: ["editais"], minCount: 1 });
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });

    // P05 — Verificar editais reais (numeração aparece no kanban)
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body2 = await getBody(page);
    // Deve mostrar ao menos um número de edital ou órgão
    const hasEditalData = /R\$|PREG|LIC|Hospital|UF|SP|MG|RJ/.test(body2);
    expect(hasEditalData).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
  });
});
