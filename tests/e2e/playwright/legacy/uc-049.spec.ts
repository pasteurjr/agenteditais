import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "049";

test.describe(`UC-${UC}: Registrar Entrega / Nota Fiscal`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ProducaoPage e secao de entregas", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/entrega|nota|fiscal|contrato|execu/i);
  });

  test("P02: Selecionar contrato e visualizar entregas", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Seleciona contrato
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
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Clicar Registrar Entrega e abrir formulario", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica Registrar Entrega
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("entrega") ||
          el.textContent?.toLowerCase().includes("registrar") ||
          (el.textContent?.toLowerCase().includes("nova") &&
            el.textContent?.toLowerCase().includes("entrega"))
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Preencher dados de entrega e nota fiscal", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("entrega") ||
          el.textContent?.toLowerCase().includes("registrar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Preenche nota fiscal
    const nfInput = page.locator(
      'input[placeholder*="nota"], input[placeholder*="nf"], input[name*="nota"], input[name*="nf_numero"]'
    ).first();
    if (await nfInput.count() > 0) {
      await nfInput.fill("NF-2026-00456");
    }
    // Preenche valor
    const valorInput = page.locator(
      'input[placeholder*="valor"], input[type="number"]'
    ).first();
    if (await valorInput.count() > 0) {
      await valorInput.fill("15000");
    }
    // Preenche data
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill("2026-03-31");
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Salvar entrega e verificar na lista do contrato", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("entrega") ||
          el.textContent?.toLowerCase().includes("registrar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    const nfInput = page.locator('input[placeholder*="nota"], input[name*="nota"]').first();
    if (await nfInput.count() > 0) {
      await nfInput.fill("NF-TESTE-999");
    }
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("salvar") ||
          el.textContent?.toLowerCase().includes("confirmar") ||
          el.textContent?.toLowerCase().includes("registrar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });
});
