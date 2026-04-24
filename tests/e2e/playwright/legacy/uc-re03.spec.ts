import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "RE03";

test.describe(`UC-${UC}: Chatbox de Análise`, () => {
  test("P01: Chatbox após análise", async ({ page }) => {
    await login(page);
    await navTo(page, 'Recursos'); await clickTab(page, 'Análise');
    await page.screenshot({ path: ssPath("RE03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("RE03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
