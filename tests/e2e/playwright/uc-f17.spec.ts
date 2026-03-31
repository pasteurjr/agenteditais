import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "F17";

test.describe(`UC-${UC}: Configurar notificações`, () => {
  test("P01: Notificações", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Configuracoes'); await navTo(page, 'Parametrizacoes');
    await page.screenshot({ path: ssPath("F17", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F17", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
