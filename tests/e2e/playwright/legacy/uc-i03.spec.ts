import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "I03";

test.describe(`UC-${UC}: Gerar Petição de Impugnação`, () => {
  test("P01: Aba Petições", async ({ page }) => {
    await login(page);
    await navTo(page, 'Impugnacao'); await clickTab(page, 'Peti');
    await page.screenshot({ path: ssPath("I03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Nova') || body.includes('Upload')).toBeTruthy();
  });
});
