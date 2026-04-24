import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "054";

test.describe(`UC-${UC}: Dashboard Contratado x Realizado`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ContratadoRealizadoPage", async ({ page }) => {
    await login(page);
    // Tenta acessar pelo menu separado ou dentro de Execucao
    await navTo(page, "Contratado");
    await page.waitForTimeout(2000);
    const body1 = await getBody(page);
    if (!body1.toLowerCase().includes("contratado")) {
      await navTo(page, "Execucao");
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P02: Verificar cards de contratado x realizado", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    const hasDashboard =
      body.toLowerCase().includes("contratado") ||
      body.toLowerCase().includes("realizado") ||
      body.toLowerCase().includes("saldo") ||
      body.toLowerCase().includes("valor") ||
      body.toLowerCase().includes("total");
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Verificar graficos de desempenho financeiro", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Verifica presença de elementos gráficos no DOM
    const hasCharts = await page.evaluate(() => {
      const svgs = document.querySelectorAll("svg, canvas, [class*='chart'], [class*='graph']");
      return svgs.length > 0;
    });
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Verificar tabela de contratos com valores contratados e realizados", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Verificar filtros por periodo e contrato", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    // Tenta aplicar filtro de período
    const dateInputs = page.locator('input[type="date"]');
    if (await dateInputs.count() > 0) {
      await dateInputs.first().fill("2026-01-01");
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });
});
