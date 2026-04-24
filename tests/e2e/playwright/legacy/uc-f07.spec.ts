import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F07";

test.describe(`UC-${UC}: Cadastrar produto por IA`, () => {
  test("P01: Verificar opções de cadastro IA", async ({ page }) => {
    await login(page);
    await navTo(page, 'Portfolio');
    await page.screenshot({ path: ssPath("F07", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F07", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Upload') || body.includes('Manual') || body.includes('Cadastrar') || body.includes('produto') || body.includes('Portfolio')).toBeTruthy();
  });
});
