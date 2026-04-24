import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "AT02";

test.describe(`UC-${UC}: Extrair Ata PDF via IA`, () => {
  test("P01: Aba Extrair", async ({ page }) => {
    await login(page);
    await navTo(page, 'Atas de Pregao'); await clickTab(page, 'Extrair');
    await page.screenshot({ path: ssPath("AT02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("AT02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('URL') || body.includes('Extrair')).toBeTruthy();
  });
});
