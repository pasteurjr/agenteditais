import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CT05";

test.describe(`UC-${UC}: Designar Gestor/Fiscal`, () => {
  test("P01: Aba Gestor/Fiscal", async ({ page }) => {
    await login(page);
    await navTo(page, 'Execucao Contrato'); await clickTab(page, 'Gestor');
    await page.screenshot({ path: ssPath("CT05", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CT05", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('selecione') || body.includes('Gestor')).toBeTruthy();
  });
});
