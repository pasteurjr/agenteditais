import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "F16";

test.describe(`UC-${UC}: Configurar fontes e NCMs`, () => {
  test("P01: Fontes de busca", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Configuracoes'); await navTo(page, 'Parametrizacoes');
    await page.screenshot({ path: ssPath("F16", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F16", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Fonte') || body.includes('fonte')).toBeTruthy();
  });
});
