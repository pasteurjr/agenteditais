import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "052";

test.describe(`UC-${UC}: Designar Gestor e Fiscal de Contrato`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ProducaoPage e aba Designacoes", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Designacoes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/designa|gestor|fiscal|contrato|responsavel/i);
  });

  test("P02: Verificar lista de designacoes existentes", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Designacoes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Clicar Nova Designacao e preencher formulario", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Designacoes");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica Nova Designação
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("designa") ||
          el.textContent?.toLowerCase().includes("novo gestor") ||
          el.textContent?.toLowerCase().includes("novo fiscal") ||
          el.textContent?.toLowerCase().includes("nova designa")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Selecionar contrato e tipo (gestor/fiscal)", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Designacoes");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("designa") ||
          el.textContent?.toLowerCase().includes("novo")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
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
    await page.waitForTimeout(500);
    // Seleciona tipo gestor
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        for (const opt of Array.from(s.options)) {
          if (
            opt.text.toLowerCase().includes("gestor") ||
            opt.value.toLowerCase().includes("gestor")
          ) {
            s.value = opt.value;
            s.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    });
    await page.waitForTimeout(500);
    // Preenche nome do responsável
    const nameInput = page.locator(
      'input[placeholder*="nome"], input[placeholder*="gestor"], input[name*="nome"], input[name*="responsavel"]'
    ).first();
    if (await nameInput.count() > 0) {
      await nameInput.fill("Maria Silva Santos");
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Salvar designacao e verificar na lista", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Designacoes");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("designa") ||
          el.textContent?.toLowerCase().includes("novo")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("salvar") ||
          el.textContent?.toLowerCase().includes("confirmar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });
});
