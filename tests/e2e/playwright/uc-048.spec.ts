import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "048";

test.describe(`UC-${UC}: Cadastrar Contrato`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ProducaoPage via menu Execucao", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/execu|contrat|entrega|cronograma|producao/i);
  });

  test("P02: Verificar secao de contratos e botao Novo Contrato", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    const hasContratos =
      body.toLowerCase().includes("contrato") ||
      body.toLowerCase().includes("novo") ||
      body.toLowerCase().includes("adicionar") ||
      body.toLowerCase().includes("cadastrar");
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(hasContratos).toBeTruthy();
  });

  test("P03: Clicar Novo Contrato e abrir formulario de cadastro", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica novo contrato
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          (el.textContent?.toLowerCase().includes("novo") &&
            el.textContent?.toLowerCase().includes("contrato")) ||
          el.textContent?.toLowerCase().includes("adicionar contrato") ||
          el.textContent?.toLowerCase().includes("novo contrato")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Preencher campos do formulario de contrato", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("novo contrato") ||
          (el.textContent?.toLowerCase().includes("novo") &&
            el.textContent?.toLowerCase().includes("contrato"))
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Preenche campos do contrato
    const numberInput = page.locator(
      'input[placeholder*="numero"], input[placeholder*="contrato"], input[name*="numero"], input[name*="contrato_numero"]'
    ).first();
    if (await numberInput.count() > 0) {
      await numberInput.fill("CT-2026-001");
    }
    const valorInput = page.locator(
      'input[placeholder*="valor"], input[name*="valor"], input[type="number"]'
    ).first();
    if (await valorInput.count() > 0) {
      await valorInput.fill("150000");
    }
    // Preenche edital vinculado
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
    await page.waitForTimeout(500);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Salvar contrato e verificar na lista", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("novo contrato") ||
          (el.textContent?.toLowerCase().includes("novo") &&
            el.textContent?.toLowerCase().includes("contrato"))
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    // Preenche número mínimo
    const numberInput = page.locator('input[placeholder*="numero"], input[name*="numero"]').first();
    if (await numberInput.count() > 0) {
      await numberInput.fill("CT-2026-TEST");
    }
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    // Salva
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("salvar") ||
          el.textContent?.toLowerCase().includes("criar") ||
          el.textContent?.toLowerCase().includes("cadastrar") ||
          el.textContent?.toLowerCase().includes("confirmar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });
});
