import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CT04";

test.describe(`UC-${UC}: Gestão de Aditivos`, () => {
  test("P01: Aba Aditivos", async ({ page }) => {
    await login(page);
    await navTo(page, 'Execucao Contrato'); await clickTab(page, 'Aditivos');
    await page.screenshot({ path: ssPath("CT04", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CT04", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('selecione') || body.includes('Aditivo')).toBeTruthy();
  });
});
