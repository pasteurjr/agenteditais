import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "F05";

test.describe(`UC-${UC}: Gerir responsaveis`, () => {
  test("P01: Aba Responsáveis", async ({ page }) => {
    await login(page);
    await navTo(page, 'Empresa'); await clickTab(page, 'Respons');
    await page.screenshot({ path: ssPath("F05", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F05", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Respons') || body.includes('Nome')).toBeTruthy();
  });
});
