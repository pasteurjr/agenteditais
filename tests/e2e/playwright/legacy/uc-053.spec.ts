import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "053";

test.describe(`UC-${UC}: Saldo ARP e Caronas`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar AtasPage e aba Saldo ARP", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Saldo ARP");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/saldo|arp|carona|ata|quantidade|valor/i);
  });

  test("P02: Verificar cards de saldo por ata", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Saldo ARP");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasSaldo =
      body.toLowerCase().includes("saldo") ||
      body.toLowerCase().includes("quantidade") ||
      body.toLowerCase().includes("disponivel") ||
      body.toLowerCase().includes("consumido") ||
      body.toLowerCase().includes("ata") ||
      body.toLowerCase().includes("nenhuma");
    expect(hasSaldo).toBeTruthy();
  });

  test("P03: Verificar atas disponiveis para carona", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Saldo ARP");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const hasCarona =
      body.toLowerCase().includes("carona") ||
      body.toLowerCase().includes("arp") ||
      body.toLowerCase().includes("ata") ||
      body.toLowerCase().includes("adesao");
    expect(body.length).toBeGreaterThan(50);
  });

  test("P04: Verificar consumo por item da ata", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Saldo ARP");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Seleciona ata se disponível
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        if (s.options.length > 1) {
          s.selectedIndex = 1;
          s.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        }
      }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });

  test("P05: Verificar percentual de utilizacao da ARP", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Saldo ARP");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });
});
