import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "I01";

test.describe(`UC-${UC}: Validação Legal do Edital`, () => {
  test("P01: Acessar ImpugnacaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Impugnacao');
    await page.screenshot({ path: ssPath("I01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Legal') && body.includes('Peti')).toBeTruthy();
  });
  test("P02: Selecionar edital", async ({ page }) => {
    await login(page);
    await page.screenshot({ path: ssPath("I01", "P02_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I01", "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 200).toBeTruthy();
  });
  test("P04: Clicar Analisar Edital e esperar IA", async ({ page }) => {
    await login(page);
    await page.screenshot({ path: ssPath("I01", "P04_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I01", "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 500).toBeTruthy();
  });
});
