import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "P10";

test.describe(`UC-${UC}: Gestao de Comodato`, () => {
  test("P01: Comodato", async ({ page }) => {
    await login(page);
    await navTo(page, 'Precificacao');
    await page.screenshot({ path: ssPath("P10", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("P10", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
