import { test, expect } from "@playwright/test";
import { login, navTo, expandSection, clickTab, getBody, ssPath } from "../helpers";

const UC = "F02";

test.describe(`UC-${UC}: Gerir contatos e area padrao`, () => {
  test("P01: Seção de emails e telefones", async ({ page }) => {
    await login(page);
    await navTo(page, 'Empresa');
    await page.screenshot({ path: ssPath("F02", "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("F02", "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes('Email') || body.includes('Contato')).toBeTruthy();
  });
});
