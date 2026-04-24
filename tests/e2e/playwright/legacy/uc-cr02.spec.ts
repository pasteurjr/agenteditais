import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "CR02";

test.describe(`UC-${UC}: Pedidos em Atraso`, () => {
  test("P01: Seção Atrasos", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Indicadores'); await navTo(page, 'Contratado X Realizado');
    await page.screenshot({ path: ssPath("CR02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CR02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('atraso')).toBeTruthy();
  });
});
