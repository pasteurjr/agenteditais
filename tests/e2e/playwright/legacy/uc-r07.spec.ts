import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "R07";

test.describe(`UC-${UC}: Gerenciar Status e Submissao`, () => {
  test("P01: Acessar SubmissaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Submissao');
    await page.screenshot({ path: ssPath("R07", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("R07", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Submiss') || body.includes('Proposta')).toBeTruthy();
  });
});
