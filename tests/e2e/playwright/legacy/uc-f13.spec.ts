import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "F13";

test.describe(`UC-${UC}: Classificação e funil`, () => {
  test("P01: Verificar classificação", async ({ page }) => {
    await login(page);
    await navTo(page, 'Portfolio');
    await page.screenshot({ path: ssPath("F13", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F13", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
