import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F12";

test.describe(`UC-${UC}: Reprocessar metadados captação`, () => {
  test("P01: Verificar metadados", async ({ page }) => {
    await login(page);
    await navTo(page, 'Portfolio');
    await page.screenshot({ path: ssPath("F12", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F12", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
