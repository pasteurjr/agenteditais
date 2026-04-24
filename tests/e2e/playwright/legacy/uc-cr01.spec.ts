import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CR01";

test.describe(`UC-${UC}: Dashboard Contratado X Realizado`, () => {
  test("P01: Acessar Dashboard CR", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Indicadores'); await navTo(page, 'Contratado X Realizado');
    await page.screenshot({ path: ssPath("CR01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CR01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Contratado')).toBeTruthy();
  });
});
