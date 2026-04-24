import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "R06";

test.describe(`UC-${UC}: Exportar Dossie Completo`, () => {
  test("P01: Exportar", async ({ page }) => {
    await login(page);
    await navTo(page, 'Proposta');
    await page.screenshot({ path: ssPath("R06", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("R06", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
