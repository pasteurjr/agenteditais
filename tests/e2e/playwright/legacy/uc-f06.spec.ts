import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "F06";

test.describe(`UC-${UC}: Listar e inspecionar produtos`, () => {
  test("P01: Acessar PortfolioPage", async ({ page }) => {
    await login(page);
    await navTo(page, 'Portfolio');
    await page.screenshot({ path: ssPath("F06", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F06", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Produto') || body.includes('Portfolio')).toBeTruthy();
  });
});
