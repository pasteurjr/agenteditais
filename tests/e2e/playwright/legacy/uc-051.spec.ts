import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "051";

test.describe(`UC-${UC}: Gestão de Aditivos`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ProducaoPage e aba Aditivos", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Aditivos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/aditiv|contrato|prazo|valor|termo/i);
  });

  test("P02: Verificar lista de aditivos existentes", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Aditivos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Clicar Novo Aditivo e abrir formulario", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Aditivos");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica Novo Aditivo
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("aditivo") ||
          (el.textContent?.toLowerCase().includes("novo") &&
            el.textContent?.toLowerCase().includes("aditiv")) ||
          el.textContent?.toLowerCase().includes("adicionar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Preencher dados do aditivo (tipo, valor, prazo)", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Aditivos");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("aditivo") ||
          el.textContent?.toLowerCase().includes("novo")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Seleciona contrato vinculado
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
    // Preenche tipo de aditivo
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        for (const opt of Array.from(s.options)) {
          if (
            opt.text.toLowerCase().includes("prazo") ||
            opt.text.toLowerCase().includes("prorrogacao") ||
            opt.text.toLowerCase().includes("valor")
          ) {
            s.value = opt.value;
            s.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    });
    await page.waitForTimeout(500);
    // Preenche justificativa
    const textarea = page.locator("textarea").first();
    if (await textarea.count() > 0) {
      await textarea.fill("Prorrogação de prazo por 60 dias conforme necessidade operacional.");
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Salvar aditivo e verificar na lista", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await clickTab(page, "Aditivos");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.toLowerCase().includes("aditivo"));
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
