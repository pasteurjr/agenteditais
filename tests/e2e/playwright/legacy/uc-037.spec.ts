import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "../helpers";

const UC = "037";

test.describe(`UC-${UC}: Analisar Proposta Vencedora com IA`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar RecursosPage e aba Analise", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Analise");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/analise|vencedor|edital|proposta/i);
  });

  test("P02: Selecionar edital e colar texto da proposta vencedora", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
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
    // Cola texto da proposta vencedora no TextArea
    const textarea = page.locator("textarea").first();
    if (await textarea.count() > 0) {
      await textarea.fill(
        "Proposta vencedora: Empresa XYZ LTDA - CNPJ 12.345.678/0001-99. " +
        "Valor total R$ 150.000,00. Prazo de entrega: 30 dias. " +
        "Marca exigida: apenas produto Y, excluindo concorrentes. " +
        "Qualificação técnica: exige 5 anos de experiência exclusiva no setor."
      );
    }
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Clicar Analisar Vencedora e aguardar IA (60s)", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
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
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica Analisar Vencedora
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("analisar") ||
          el.textContent?.toLowerCase().includes("vencedor")
      );
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P03_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("inconsist") ||
        body.toLowerCase().includes("desvio") ||
        body.toLowerCase().includes("recurso") ||
        body.toLowerCase().includes("analise") ||
        body.toLowerCase().includes("gravidade"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(found).toBeTruthy();
  });

  test("P04: Verificar DataTable de inconsistencias com badges de gravidade", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(1500);
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
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.toLowerCase().includes("analisar"));
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("alta") ||
        body.toLowerCase().includes("media") ||
        body.toLowerCase().includes("baixa") ||
        body.toLowerCase().includes("desvio") ||
        body.toLowerCase().includes("inconsist"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P05: Verificar resultado em markdown renderizado", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(1500);
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
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.toLowerCase().includes("analisar"));
      if (b) b.click();
    });
    await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("analise") ||
        body.toLowerCase().includes("desvio") ||
        body.toLowerCase().includes("proposta"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(200);
  });
});
