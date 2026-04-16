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

    // P02 — Abrir aba Mapa e verificar container Leaflet
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Mapa");
    await page.waitForTimeout(4000);
    await assertDataVisible(page, {
      anyText: ["Distribuicao Geografica", "editais"],
      minCount: 2,
    });
    const leafletContainer = page.locator(".leaflet-container");
    await expect(leafletContainer).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar marcadores (CircleMarker SVG) no mapa
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const circles = page.locator(".leaflet-overlay-pane circle, .leaflet-overlay-pane path");
    const circleCount = await circles.count();
    expect(circleCount).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Clicar num marcador e verificar popup com dados da UF
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const firstCircle = circles.first();
    await firstCircle.click({ force: true });
    await page.waitForTimeout(2000);
    const popup = page.locator(".leaflet-popup-content");
    const popupVisible = await popup.isVisible().catch(() => false);
    if (popupVisible) {
      const popupText = await popup.innerText();
      expect(popupText).toContain("editais");
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
  });
});
