import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CV02";

test.describe(`UC-${UC}: Explorar resultados e painel lateral`, () => {
  test("P01: Resultados visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, 'Captacao');
    await page.screenshot({ path: ssPath("CV02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Edital') || body.includes('Score')).toBeTruthy();
  });
});
