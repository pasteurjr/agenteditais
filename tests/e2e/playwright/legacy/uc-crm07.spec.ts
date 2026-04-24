import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "../helpers";

const UC = "CRM07";

test.describe(`UC-${UC}: Registro de Motivo de Perda`, () => {
  test("Sequência completa UC-CRM07", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Decisões
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Decisões");
    await page.waitForTimeout(2500);
    await assertDataVisible(page, { anyText: ["Decisões de Editais"], minCount: 1 });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar decisões do tipo Perda existentes
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Perda")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar coluna Contra-Razão na tabela
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    expect(body.includes("Contra-Razão") || body.includes("Contra")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });

    // P05 — Verificar tabela com dados reais (motivo texto)
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const motivosSeed = ["Preço não competitivo", "Especificação", "Documentação", "Falha operacional", "Preço", "não atendeu"];
    const found = motivosSeed.filter(m => body.includes(m));
    expect(found.length).toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
  });
});
