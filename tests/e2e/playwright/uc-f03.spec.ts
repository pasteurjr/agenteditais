import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F03";

test.describe(`UC-${UC}: Gerir documentos da empresa`, () => {
  test("P01: Aba Documentos", async ({ page }) => {
    await login(page);
    await navTo(page, 'Empresa'); await clickTab(page, 'Documento');
    await page.screenshot({ path: ssPath("F03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Documento') || body.includes('Upload')).toBeTruthy();
  });
});
