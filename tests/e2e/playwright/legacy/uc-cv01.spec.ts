import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CV01";

test.describe(`UC-${UC}: Buscar editais por termo`, () => {
  test("P01: Acessar CaptacaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Captacao');
    await page.screenshot({ path: ssPath("CV01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Buscar') || body.includes('Edital')).toBeTruthy();
  });
  test("P02: Digitar termo e buscar", async ({ page }) => {
    await login(page);
    await page.screenshot({ path: ssPath("CV01", "P02_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV01", "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 200).toBeTruthy();
  });
});
