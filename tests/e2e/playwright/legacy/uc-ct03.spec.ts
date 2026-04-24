import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CT03";

test.describe(`UC-${UC}: Acompanhar Cronograma`, () => {
  test("P01: Aba Cronograma", async ({ page }) => {
    await login(page);
    await navTo(page, 'Execucao Contrato'); await clickTab(page, 'Cronograma');
    await page.screenshot({ path: ssPath("CT03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CT03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('selecione') || body.includes('Cronograma')).toBeTruthy();
  });
});
