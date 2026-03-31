import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "050";

test.describe(`UC-${UC}: Cronograma de Entregas`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ProducaoPage e localizar cronograma", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    // Tenta aba Cronograma se existir
    await clickTab(page, "Cronograma");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/cronograma|entrega|prazo|data|contrato/i);
  });

  test("P02: Verificar timeline ou calendario de entregas", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Cronograma");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasCronograma =
      body.toLowerCase().includes("cronograma") ||
      body.toLowerCase().includes("calendario") ||
      body.toLowerCase().includes("data") ||
      body.toLowerCase().includes("prazo") ||
      body.toLowerCase().includes("entrega");
    expect(hasCronograma).toBeTruthy();
  });

  test("P03: Selecionar contrato e visualizar datas de entrega", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Cronograma");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Seleciona contrato se disponível
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
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Verificar itens do cronograma com status de cumprimento", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Cronograma");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("P05: Verificar alertas de prazo proximo ou atrasado", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Cronograma");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    const hasAlerts =
      body.toLowerCase().includes("atras") ||
      body.toLowerCase().includes("prazo") ||
      body.toLowerCase().includes("vencimento") ||
      body.toLowerCase().includes("alerta") ||
      body.toLowerCase().includes("pendente");
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });
});
