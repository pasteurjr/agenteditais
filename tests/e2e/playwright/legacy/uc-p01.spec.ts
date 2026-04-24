import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "P01";

test.describe(`UC-${UC}: Organizar Edital por Lotes`, () => {
  test("P01: Acessar PrecificacaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Precificacao');
    await page.screenshot({ path: ssPath("P01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("P01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Lote') || body.includes('Precific')).toBeTruthy();
  });
});
