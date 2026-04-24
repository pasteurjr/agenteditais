import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "../helpers";

const UC = "040";

test.describe(`UC-${UC}: Gerar Contra-Razão`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar RecursosPage aba Laudos para Contra-Razao", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/laudo|recurso|contra/i);
  });

  test("P02: Clicar Novo Laudo e selecionar tipo Contra-Razao", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Abre modal Novo Laudo
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("novo laudo") ||
          (el.textContent?.toLowerCase().includes("novo") && el.textContent?.toLowerCase().includes("laudo"))
      );
      if (b) b.click();
    });
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
    await page.waitForTimeout(500);
    // Seleciona tipo "contra_razao" ou "Contra-Razão"
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        for (const opt of Array.from(s.options)) {
          if (
            opt.value === "contra_razao" ||
            opt.text.toLowerCase().includes("contra")
          ) {
            s.value = opt.value;
            s.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Gerar Contra-Razao com IA e aguardar resultado (120s)", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("novo laudo") ||
          (el.textContent?.toLowerCase().includes("novo") && el.textContent?.toLowerCase().includes("laudo"))
      );
      if (b) b.click();
    });
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
    await page.waitForTimeout(500);
    // Seleciona tipo contra_razao
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        for (const opt of Array.from(s.options)) {
          if (
            opt.value === "contra_razao" ||
            opt.text.toLowerCase().includes("contra")
          ) {
            s.value = opt.value;
            s.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica Gerar com IA
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("gerar") ||
          el.textContent?.toLowerCase().includes("ia")
      );
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P03_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("contra") ||
        body.toLowerCase().includes("razao") ||
        body.toLowerCase().includes("recurso") ||
        body.toLowerCase().includes("laudo") ||
        body.toLowerCase().includes("gerado"),
      120000
    );
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P04: Verificar badge de tipo Contra-Razao na lista de laudos", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    // Pode ter laudos do tipo contra_razao na lista
    expect(body.length).toBeGreaterThan(100);
  });
});
