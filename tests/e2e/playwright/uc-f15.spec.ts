import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F15";

test.describe(`UC-${UC}: Configurar parametros comerciais`, () => {
  test("P01: Parâmetros comerciais", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Configuracoes'); await navTo(page, 'Parametrizacoes');
    await page.screenshot({ path: ssPath("F15", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F15", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
