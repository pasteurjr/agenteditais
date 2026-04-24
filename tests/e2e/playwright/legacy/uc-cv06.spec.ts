import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CV06";

test.describe(`UC-${UC}: Gerir monitoramentos automáticos`, () => {
  test("P01: Monitoramentos", async ({ page }) => {
    await login(page);
    await navTo(page, 'Captacao');
    await page.screenshot({ path: ssPath("CV06", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CV06", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
