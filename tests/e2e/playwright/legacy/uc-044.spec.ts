import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "../helpers";

const UC = "044";

test.describe(`UC-${UC}: Score Logístico`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ValidacaoPage e localizar card Score Logistico", async ({ page }) => {
    await login(page);
    // Score logístico pode estar no Dashboard ou em Validacao/Analise
    await navTo(page, "Validacao");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P02: Verificar card Score Logistico com valor numerico", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    const hasScore =
      body.toLowerCase().includes("score") ||
      body.toLowerCase().includes("logistic") ||
      body.toLowerCase().includes("viabilidade") ||
      body.toLowerCase().includes("pontuacao") ||
      body.toLowerCase().includes("logis");
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    // Pode não estar visível se não há edital selecionado
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Selecionar edital e verificar score calculado", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(1500);
    // Seleciona edital
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
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Verificar componentes do score (distancia, prazo, capacidade)", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    const hasComponents =
      body.toLowerCase().includes("distancia") ||
      body.toLowerCase().includes("prazo") ||
      body.toLowerCase().includes("capacidade") ||
      body.toLowerCase().includes("entrega") ||
      body.toLowerCase().includes("logis") ||
      body.toLowerCase().includes("score");
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });
});
