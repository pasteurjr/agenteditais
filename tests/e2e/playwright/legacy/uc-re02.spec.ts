import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "RE02";

test.describe(`UC-${UC}: Analisar Proposta Vencedora`, () => {
  test("P01: Aba Análise", async ({ page }) => {
    await login(page);
    await navTo(page, 'Recursos'); await clickTab(page, 'Análise');
    await page.screenshot({ path: ssPath("RE02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("RE02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Analisar') || body.includes('Proposta')).toBeTruthy();
  });
});
