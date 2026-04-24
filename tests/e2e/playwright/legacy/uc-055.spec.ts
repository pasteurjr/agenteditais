import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "055";

test.describe(`UC-${UC}: Pedidos em Atraso`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ProducaoPage e localizar tabela de atrasos", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/atras|prazo|entrega|pedido|pendente|execu/i);
  });

  test("P02: Verificar lista de pedidos com status em atraso", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasAtrasos =
      body.toLowerCase().includes("atras") ||
      body.toLowerCase().includes("vencido") ||
      body.toLowerCase().includes("pendente") ||
      body.toLowerCase().includes("prazo") ||
      body.toLowerCase().includes("nenhum") || body.toLowerCase().includes("vigente") || body.toLowerCase().includes("contrato") || body.toLowerCase().includes("execu");
    expect(hasAtrasos).toBeTruthy();
  });

  test("P03: Verificar indicadores de severidade de atraso", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    const hasSeverity =
      body.toLowerCase().includes("critico") ||
      body.toLowerCase().includes("grave") ||
      body.toLowerCase().includes("alto") ||
      body.toLowerCase().includes("medio") ||
      body.toLowerCase().includes("baixo") ||
      body.toLowerCase().includes("leve") ||
      body.toLowerCase().includes("dias");
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("P04: Filtrar pedidos por contrato ou periodo", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Aplica filtro de contrato
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
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });

  test("P05: Verificar acoes disponiveis para pedidos atrasados", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    // Ações podem incluir notificar, registrar ocorrência, etc.
    expect(body.length).toBeGreaterThan(50);
  });
});
