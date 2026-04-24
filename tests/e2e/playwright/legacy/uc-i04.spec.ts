import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "I04";

test.describe(`UC-${UC}: Upload de Petição Externa`, () => {
  test("P01: Upload modal", async ({ page }) => {
    await login(page);
    await navTo(page, 'Impugnacao'); await clickTab(page, 'Peti');
    await page.screenshot({ path: ssPath("I04", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I04", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Upload')).toBeTruthy();
  });
});
