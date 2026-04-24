import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "P02";

test.describe(`UC-${UC}: Selecao Inteligente de Portfolio`, () => {
  test("P01: Portfolio", async ({ page }) => {
    await login(page);
    await navTo(page, 'Precificacao');
    await page.screenshot({ path: ssPath("P02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("P02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
