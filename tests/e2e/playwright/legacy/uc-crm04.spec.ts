import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "./helpers";

const UC = "CRM04";

test.describe(`UC-${UC}: Agenda de Compromissos`, () => {
  test("Sequência completa UC-CRM04", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Agenda
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Agenda");
    await page.waitForTimeout(2500);
    await assertDataVisible(page, {
      anyText: ["Agenda de Compromissos", "itens"],
      minCount: 1,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar itens da agenda reais
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    // Títulos que foram criados pelo seed
    const agendaKeywords = ["Apresentação", "Impugnação", "Prazo", "Followup", "Negociação", "Reunião", "técnica", "renovação"];
    const found = agendaKeywords.filter(k => body.includes(k));
    expect(found.length).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar badges de urgência
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const urgencias = ["CRITICA", "ALTA", "NORMAL", "BAIXA", "critica", "alta"];
    const urgFound = urgencias.filter(u => body.toUpperCase().includes(u.toUpperCase()));
    expect(urgFound.length).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
  });
});
