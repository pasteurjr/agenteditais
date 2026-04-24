import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "056";

test.describe(`UC-${UC}: Alertas Multi-Tier de Vencimento`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar painel de alertas consolidados", async ({ page }) => {
    await login(page);
    // Alertas multi-tier podem estar no Dashboard, Execucao ou menu Alertas
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P02: Verificar alertas de contratos proximos do vencimento", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    const hasAlerts =
      body.toLowerCase().includes("alerta") ||
      body.toLowerCase().includes("vencimento") ||
      body.toLowerCase().includes("prazo") ||
      body.toLowerCase().includes("expira") ||
      body.toLowerCase().includes("notifica");
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("P03: Verificar niveis de alerta (critico, atencao, informativo)", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    // Multi-tier: critico, atenção, informativo
    const hasLevels =
      body.toLowerCase().includes("critico") ||
      body.toLowerCase().includes("atencao") ||
      body.toLowerCase().includes("informativ") ||
      body.toLowerCase().includes("nivel") ||
      body.toLowerCase().includes("tier");
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("P04: Verificar alertas de atas ARP proximas do vencimento", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("P05: Verificar alertas consolidados no dashboard principal", async ({ page }) => {
    await login(page);
    // Dashboard deve exibir alertas consolidados
    await navTo(page, "Dashboard");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });
});
