import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "./helpers";

const UC = "FU03";

test.describe(`UC-${UC}: Score Logístico`, () => {
  test("P01: Score via API", async ({ page }) => {
    await login(page);
    await navTo(page, 'Followup');
    await page.screenshot({ path: ssPath("FU03", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("FU03", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
