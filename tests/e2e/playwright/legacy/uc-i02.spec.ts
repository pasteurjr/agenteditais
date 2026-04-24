import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "I02";

test.describe(`UC-${UC}: Sugerir Esclarecimento ou Impugnação`, () => {
  test("P01: Integrado com UC-I01", async ({ page }) => {
    await login(page);
    await navTo(page, 'Impugnacao');
    await page.screenshot({ path: ssPath("I02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("I02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
