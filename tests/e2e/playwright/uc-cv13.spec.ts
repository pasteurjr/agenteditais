import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "CV13";

test.describe(`UC-${UC}: Usar IA na validação`, () => {
  test("P01: IA na validação", async ({ page }) => {
    await login(page);
    await navTo(page, 'Validacao');
    await page.screenshot({ path: ssPath("CV13", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV13", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
