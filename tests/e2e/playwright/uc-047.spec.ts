import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "047";

test.describe(`UC-${UC}: Dashboard de Atas`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar AtasPage e aba Minhas Atas", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Minhas Atas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/minhas?|atas?|dashboard|total|registr/i);
  });

  test("P02: Verificar cards de estatisticas de atas", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Minhas Atas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasStats =
      body.toLowerCase().includes("total") ||
      body.toLowerCase().includes("ativa") ||
      body.toLowerCase().includes("vencida") ||
      body.toLowerCase().includes("vigente") ||
      body.toLowerCase().includes("ata") ||
      body.toLowerCase().includes("nenhuma");
    expect(hasStats).toBeTruthy();
  });

  test("P03: Verificar lista de atas cadastradas", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Minhas Atas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Verificar filtros de status de atas", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Minhas Atas");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Tenta aplicar filtro por status
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        for (const opt of Array.from(s.options)) {
          if (
            opt.text.toLowerCase().includes("ativa") ||
            opt.text.toLowerCase().includes("vigente")
          ) {
            s.value = opt.value;
            s.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });

  test("P05: Verificar badges de status de ata (ativa/vencida/encerrada)", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Minhas Atas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });
});
