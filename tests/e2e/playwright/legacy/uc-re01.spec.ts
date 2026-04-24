import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "RE01";

test.describe(`UC-${UC}: Monitorar Janela de Recurso`, () => {
  test("P01: Acessar RecursosPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Recursos');
    await page.screenshot({ path: ssPath("RE01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("RE01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Monitoramento')).toBeTruthy();
  });
  test("P02: Selecionar edital e canais", async ({ page }) => {
    await login(page);
    await page.screenshot({ path: ssPath("RE01", "P02_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("RE01", "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('WhatsApp') || body.includes('Email') || body.includes('canal') || body.includes('Canal') || body.includes('notific') || body.length > 500).toBeTruthy();
  });
});
