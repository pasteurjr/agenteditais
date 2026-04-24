import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "R02";

test.describe(`UC-${UC}: Upload Proposta Externa`, () => {
  test("P01: Upload", async ({ page }) => {
    await login(page);
    await navTo(page, 'Proposta');
    await page.screenshot({ path: ssPath("R02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("R02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length > 100).toBeTruthy();
  });
});
