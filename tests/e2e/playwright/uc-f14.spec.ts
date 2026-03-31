import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F14";

test.describe(`UC-${UC}: Configurar pesos e limiares de score`, () => {
  test("P01: Acessar ParametrizaçõesPage", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Configuracoes'); await navTo(page, 'Parametrizacoes');
    await page.screenshot({ path: ssPath("F14", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F14", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Score') || body.includes('Peso')).toBeTruthy();
  });
});
