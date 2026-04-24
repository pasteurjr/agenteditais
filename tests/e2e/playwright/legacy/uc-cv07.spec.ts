import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "CV07";

test.describe(`UC-${UC}: Listar editais salvos`, () => {
  test("P01: Acessar ValidacaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Validacao');
    await page.screenshot({ path: ssPath("CV07", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV07", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Validacao') || body.includes('Validação') || body.includes('Edital') || body.includes('Meus Editais')).toBeTruthy();
  });
});
