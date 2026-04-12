import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "./helpers";

const UC = "CRM03";

test.describe(`UC-${UC}: Mapa de Distribuição Geográfica`, () => {
  test("Sequência completa UC-CRM03", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Mapa
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Mapa");
    await page.waitForTimeout(3000);
    await assertDataVisible(page, {
      anyText: ["Distribuição Geográfica", "editais", "lat", "lon"],
      minCount: 2,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar cards de UF presentes
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    const ufs = ["SP", "RJ", "MG", "RS", "PR", "BA", "GO", "DF"];
    const ufsFound = ufs.filter(u => body.includes(u));
    expect(ufsFound.length).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Verificar coords visíveis
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    expect(body.includes("lat")).toBeTruthy();
    expect(body.includes("lon")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
  });
});
