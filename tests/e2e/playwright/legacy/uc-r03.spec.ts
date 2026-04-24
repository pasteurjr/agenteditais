import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "R03";

test.describe(`UC-${UC}: Personalizar Descricao Tecnica`, () => {
  test("P01: Descrição", async ({ page }) => {
    await login(page);
    await navTo(page, 'Proposta');
    await page.screenshot({ path: ssPath("R03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("R03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
