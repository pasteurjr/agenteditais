import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "R01";

test.describe(`UC-${UC}: Gerar Proposta Tecnica`, () => {
  test("P01: Acessar PropostaPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Proposta');
    await page.screenshot({ path: ssPath("R01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("R01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Proposta')).toBeTruthy();
  });
});
