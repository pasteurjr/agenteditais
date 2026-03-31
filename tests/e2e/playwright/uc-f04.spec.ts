import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F04";

test.describe(`UC-${UC}: Buscar e anexar certidoes`, () => {
  test("P01: Aba Certidões", async ({ page }) => {
    await login(page);
    await navTo(page, 'Empresa'); await clickTab(page, 'Certid');
    await page.screenshot({ path: ssPath("F04", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F04", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Certid') || body.includes('certid')).toBeTruthy();
  });
});
