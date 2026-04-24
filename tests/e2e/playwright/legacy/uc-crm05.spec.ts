import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "../helpers";

const UC = "CRM05";

test.describe(`UC-${UC}: KPIs do CRM`, () => {
  test("Sequência completa UC-CRM05", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba KPIs
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "KPIs");
    await page.waitForTimeout(3000);
    await assertDataVisible(page, {
      anyText: ["Total Editais", "Analisados", "Participados", "Ganhos", "Perdidos"],
      minCount: 4,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar 8 stat cards
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    const kpiLabels = ["Total Editais", "Analisados", "Participados", "Não Participados", "Ganhos", "Perdidos", "Em Recurso", "Em Contra-Razão"];
    const found = kpiLabels.filter(l => body.includes(l));
    expect(found.length).toBeGreaterThanOrEqual(6);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar cards Taxas de Conversão + Valores e Tickets
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    expect(body.includes("Taxas de Conversão")).toBeTruthy();
    expect(body.includes("Valores e Tickets") || body.includes("Ticket Médio")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
  });
});
