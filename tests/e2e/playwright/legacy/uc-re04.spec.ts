import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "RE04";

test.describe(`UC-${UC}: Gerar Laudo de Recurso`, () => {
  test("P01: Aba Laudos", async ({ page }) => {
    await login(page);
    await navTo(page, 'Recursos'); await clickTab(page, 'Laudo');
    await page.screenshot({ path: ssPath("RE04", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("RE04", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Laudo') || body.includes('Novo')).toBeTruthy();
  });
});
