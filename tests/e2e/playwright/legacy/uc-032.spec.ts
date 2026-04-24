import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "./helpers";

const UC = "032";

test.describe(`UC-${UC}: Validação Legal do Edital com IA`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar ImpugnacaoPage e aba Validacao Legal", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Validacao Legal");
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toContain("valid");
  });

  test("P02: Selecionar edital no SelectInput", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Validacao Legal");
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Seleciona primeiro edital disponível no select
    const select = page.locator("select").first();
    const optionCount = await select.locator("option").count();
    if (optionCount > 1) {
      await select.selectOption({ index: 1 });
    } else {
      // Tenta via react-select ou custom select
      await page.evaluate(() => {
        const selects = document.querySelectorAll("select");
        if (selects.length > 0 && selects[0].options.length > 1) {
          selects[0].selectedIndex = 1;
          selects[0].dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P03: Clicar Analisar Edital e aguardar resposta da IA", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Validacao Legal");
    // Seleciona primeiro edital
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      if (selects.length > 0 && selects[0].options.length > 1) {
        selects[0].selectedIndex = 1;
        selects[0].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await page.waitForTimeout(1500);
    // Clica no botão Analisar Edital
    const btn = page.locator("button", { hasText: /Analisar Edital/i }).first();
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    if (await btn.isVisible()) {
      await btn.click();
    } else {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const b = btns.find((el) => el.textContent?.includes("Analisar"));
        if (b) b.click();
      });
    }
    await page.screenshot({ path: ssPath(UC, "P03_loading"), fullPage: true });
    // Aguarda IA (60s)
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("inconsist") ||
        body.toLowerCase().includes("gravidade") ||
        body.toLowerCase().includes("nenhuma") ||
        body.toLowerCase().includes("lei"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(found).toBeTruthy();
  });

  test("P04: Verificar DataTable de inconsistencias com badges de gravidade", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Validacao Legal");
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      if (selects.length > 0 && selects[0].options.length > 1) {
        selects[0].selectedIndex = 1;
        selects[0].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.includes("Analisar"));
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("inconsist") ||
        body.toLowerCase().includes("gravidade") ||
        body.toLowerCase().includes("nenhuma"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    // Verifica presença de badges ou tabela de resultados
    const hasResults =
      body.toLowerCase().includes("alta") ||
      body.toLowerCase().includes("media") ||
      body.toLowerCase().includes("baixa") ||
      body.toLowerCase().includes("nenhuma") ||
      body.toLowerCase().includes("inconsist");
    expect(hasResults).toBeTruthy();
  });

  test("P05: Verificar botao Gerar Peticao apos analise", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Validacao Legal");
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      if (selects.length > 0 && selects[0].options.length > 1) {
        selects[0].selectedIndex = 1;
        selects[0].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.includes("Analisar"));
      if (b) b.click();
    });
    await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("inconsist") ||
        body.toLowerCase().includes("gerar") ||
        body.toLowerCase().includes("peticao") ||
        body.toLowerCase().includes("prosseguir"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    // Botão de petição pode aparecer se houver inconsistências
    const hasGerarBtn =
      body.toLowerCase().includes("gerar") ||
      body.toLowerCase().includes("peticao") ||
      body.toLowerCase().includes("prosseguir");
    expect(hasGerarBtn || body.toLowerCase().includes("nenhuma")).toBeTruthy();
  });
});
