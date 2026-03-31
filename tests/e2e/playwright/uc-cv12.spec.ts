import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "CV12";

test.describe(`UC-${UC}: Analisar mercado do órgão`, () => {
  test("P01: Mercado", async ({ page }) => {
    await login(page);
    await navTo(page, 'Validacao');
    await page.screenshot({ path: ssPath("CV12", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV12", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
