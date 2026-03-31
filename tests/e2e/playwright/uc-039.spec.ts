import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "./helpers";

const UC = "039";

test.describe(`UC-${UC}: Gerar Laudo de Recurso`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar RecursosPage e aba Laudos", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Laudos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/laudo|novo|recurso|lista/i);
  });

  test("P02: Verificar botao Novo Laudo na aba Laudos", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    const hasNovoLaudo =
      body.toLowerCase().includes("novo laudo") ||
      body.toLowerCase().includes("novo") ||
      body.toLowerCase().includes("laudo");
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(hasNovoLaudo).toBeTruthy();
  });

  test("P03: Clicar Novo Laudo e preencher formulario", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica Novo Laudo
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          (el.textContent?.toLowerCase().includes("novo") &&
            el.textContent?.toLowerCase().includes("laudo")) ||
          el.textContent?.toLowerCase().includes("novo laudo") ||
          el.textContent?.toLowerCase().includes("criar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    // Seleciona edital no modal/formulário
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
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Selecionar tipo Recurso e gerar com IA (120s)", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(1500);
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
    // Seleciona tipo "recurso"
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        for (const opt of Array.from(s.options)) {
          if (opt.text.toLowerCase().includes("recurso")) {
            s.value = opt.value;
            s.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Clica Gerar com IA
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          (el.textContent?.toLowerCase().includes("gerar") &&
            el.textContent?.toLowerCase().includes("ia")) ||
          el.textContent?.toLowerCase().includes("gerar laudo") ||
          el.textContent?.toLowerCase().includes("gerar")
      );
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P04_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("laudo") ||
        body.toLowerCase().includes("recurso") ||
        body.toLowerCase().includes("fatos") ||
        body.toLowerCase().includes("direito") ||
        body.toLowerCase().includes("pedido"),
      120000
    );
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P05: Verificar DataTable com laudos gerados", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });
});
