import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "AT03";

test.describe(`UC-${UC}: Dashboard Atas Consultadas`, () => {
  test("P01: Minhas Atas", async ({ page }) => {
    await login(page);
    await navTo(page, 'Atas de Pregao'); await clickTab(page, 'Minhas');
    await page.screenshot({ path: ssPath("AT03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("AT03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Total')).toBeTruthy();
  });
});
