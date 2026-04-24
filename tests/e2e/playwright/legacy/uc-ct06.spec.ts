import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "CT06";

test.describe(`UC-${UC}: Saldo ARP e Caronas`, () => {
  test("P01: Aba Saldo ARP", async ({ page }) => {
    await login(page);
    await navTo(page, 'Atas de Pregao'); await clickTab(page, 'Saldo');
    await page.screenshot({ path: ssPath("CT06", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CT06", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase().includes('selecione') || body.includes('ARP')).toBeTruthy();
  });
});
