import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "FU02";

test.describe(`UC-${UC}: Configurar Alertas`, () => {
  test("P01: Aba Alertas", async ({ page }) => {
    await login(page);
    await navTo(page, 'Followup'); await clickTab(page, 'Alertas');
    await page.screenshot({ path: ssPath("FU02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("FU02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('vencimento')).toBeTruthy();
  });
});
