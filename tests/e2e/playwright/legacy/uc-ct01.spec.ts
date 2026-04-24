import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "CT01";

test.describe(`UC-${UC}: Cadastrar Contrato`, () => {
  test("P01: Acessar ProducaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Execucao Contrato');
    await page.screenshot({ path: ssPath("CT01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CT01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Contrato') && body.includes('Novo')).toBeTruthy();
  });
});
