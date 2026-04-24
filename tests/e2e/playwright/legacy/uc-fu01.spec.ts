import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "FU01";

test.describe(`UC-${UC}: Registrar Resultado`, () => {
  test("P01: Acessar FollowupPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Followup');
    await page.screenshot({ path: ssPath("FU01", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("FU01", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Pendentes') || body.includes('Resultado')).toBeTruthy();
  });
});
