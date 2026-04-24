import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "CT02";

test.describe(`UC-${UC}: Registrar Entrega`, () => {
  test("P01: Aba Entregas", async ({ page }) => {
    await login(page);
    await navTo(page, 'Execucao Contrato'); await clickTab(page, 'Entregas');
    await page.screenshot({ path: ssPath("CT02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CT02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('selecione') || body.includes('Entrega')).toBeTruthy();
  });
});
