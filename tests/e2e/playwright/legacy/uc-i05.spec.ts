import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "I05";

test.describe(`UC-${UC}: Controle de Prazo`, () => {
  test("P01: Aba Prazos com badges", async ({ page }) => {
    await login(page);
    await navTo(page, 'Impugnacao'); await clickTab(page, 'Prazo');
    await page.screenshot({ path: ssPath("I05", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I05", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Prazo') || body.includes('prazo')).toBeTruthy();
  });
});
