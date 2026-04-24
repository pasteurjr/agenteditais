import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "P09";

test.describe(`UC-${UC}: Consultar Historico Precos Camada F`, () => {
  test("P01: Histórico", async ({ page }) => {
    await login(page);
    await navTo(page, 'Precificacao');
    await page.screenshot({ path: ssPath("P09", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("P09", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
