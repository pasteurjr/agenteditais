import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CV08";

test.describe(`UC-${UC}: Calcular scores e decidir GO/NO-GO`, () => {
  test("P01: Scores visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, 'Validacao');
    await page.screenshot({ path: ssPath("CV08", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV08", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('score') || body.toLowerCase().includes('ader') || body.includes('Edital')).toBeTruthy();
  });
});
