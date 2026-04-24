import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CV10";

test.describe(`UC-${UC}: Confrontar documentação`, () => {
  test("P01: Documentação", async ({ page }) => {
    await login(page);
    await navTo(page, 'Validacao');
    await page.screenshot({ path: ssPath("CV10", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV10", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
