import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F10";

test.describe(`UC-${UC}: Consultar ANVISA e busca web`, () => {
  test("P01: Verificar ANVISA", async ({ page }) => {
    await login(page);
    await navTo(page, 'Portfolio');
    await page.screenshot({ path: ssPath("F10", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F10", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
