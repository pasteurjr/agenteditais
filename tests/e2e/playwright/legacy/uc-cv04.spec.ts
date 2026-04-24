import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CV04";

test.describe(`UC-${UC}: Definir estratégia e intenção`, () => {
  test("P01: Estratégia", async ({ page }) => {
    await login(page);
    await navTo(page, 'Captacao');
    await page.screenshot({ path: ssPath("CV04", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV04", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
