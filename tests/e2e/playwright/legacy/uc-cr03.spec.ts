import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CR03";

test.describe(`UC-${UC}: Alertas Vencimento Multi-tier`, () => {
  test("P01: Seção Vencimentos", async ({ page }) => {
    await login(page);
    await expandSection(page, 'Indicadores'); await navTo(page, 'Contratado X Realizado');
    await page.screenshot({ path: ssPath("CR03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CR03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('vencimento')).toBeTruthy();
  });
});
