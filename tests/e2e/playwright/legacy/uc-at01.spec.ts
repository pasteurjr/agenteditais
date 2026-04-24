import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "AT01";

test.describe(`UC-${UC}: Buscar Atas PNCP`, () => {
  test("P01: Acessar AtasPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Atas de Pregao');
    await page.screenshot({ path: ssPath("AT01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("AT01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Buscar')).toBeTruthy();
  });
});
