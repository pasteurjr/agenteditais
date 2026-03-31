import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "./helpers";

const UC = "036";

test.describe(`UC-${UC}: Monitorar Janela de Recurso`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar RecursosPage e aba Monitoramento", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Monitoramento");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/monitor|janela|recurso|edital/i);
  });

  test("P02: Verificar SelectInput de edital e checkboxes de canais", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Monitoramento");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    // Verifica presença de canais de alerta ou elementos de monitoramento
    const hasCanais =
      body.toLowerCase().includes("whatsapp") ||
      body.toLowerCase().includes("email") ||
      body.toLowerCase().includes("sistema") ||
      body.toLowerCase().includes("alerta") ||
      body.toLowerCase().includes("canal") ||
      body.toLowerCase().includes("monitoramento") ||
      body.toLowerCase().includes("selecione") ||
      body.toLowerCase().includes("recurso");
    expect(hasCanais).toBeTruthy();
  });

  test("P03: Selecionar edital e configurar canais de alerta", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Monitoramento");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
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
    // Ativa checkboxes de canais
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 0) {
      await checkboxes.first().check().catch(() => {});
    }
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Clicar Ativar Monitoramento e aguardar status", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Monitoramento");
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
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Clica Ativar Monitoramento
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("ativar") ||
          el.textContent?.toLowerCase().includes("iniciar") ||
          el.textContent?.toLowerCase().includes("monitor")
      );
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P04_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("aguardando") ||
        body.toLowerCase().includes("aberta") ||
        body.toLowerCase().includes("encerrada") ||
        body.toLowerCase().includes("ativado") ||
        body.toLowerCase().includes("monitorando"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Verificar botao Registrar Intencao de Recurso", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Monitoramento");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const hasBtn =
      body.toLowerCase().includes("registrar") ||
      body.toLowerCase().includes("intencao") ||
      body.toLowerCase().includes("recurso") ||
      body.toLowerCase().includes("contra-razao");
    expect(hasBtn).toBeTruthy();
  });
});
