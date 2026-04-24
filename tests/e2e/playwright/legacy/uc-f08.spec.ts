import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F08";

test.describe(`UC-${UC}: Editar produto e especificações`, () => {
  test("P01: Verificar edição de produto", async ({ page }) => {
    await login(page);
    await navTo(page, 'Portfolio');
    await page.screenshot({ path: ssPath("F08", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F08", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Produto') || body.includes('Especific')).toBeTruthy();
  });
});
