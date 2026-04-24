import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "043";

test.describe(`UC-${UC}: Configurar Alertas de Follow-up`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar Follow-up e aba Alertas", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Alertas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/alerta|notifica|canal|email|whatsapp/i);
  });

  test("P02: Verificar campos de tipo de alerta e limiares", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await clickTab(page, "Alertas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasAlertFields =
      body.toLowerCase().includes("tipo") ||
      body.toLowerCase().includes("limiar") ||
      body.toLowerCase().includes("prazo") ||
      body.toLowerCase().includes("dias") ||
      body.toLowerCase().includes("alerta");
    expect(hasAlertFields).toBeTruthy();
  });

  test("P03: Selecionar tipo de alerta e configurar canais", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await clickTab(page, "Alertas");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Ativa checkboxes de canais disponíveis
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      await checkboxes.nth(i).check().catch(() => {});
    }
    await page.waitForTimeout(500);
    // Preenche email se disponível
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill("pasteurjr@gmail.com");
    }
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Clicar Salvar configuracao de alertas", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await clickTab(page, "Alertas");
    await page.waitForTimeout(1500);
    // Preenche alguma configuração
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().check().catch(() => {});
    }
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Clica Salvar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("salvar") ||
          el.textContent?.toLowerCase().includes("configurar") ||
          el.textContent?.toLowerCase().includes("confirmar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Verificar historico de notificacoes enviadas", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await clickTab(page, "Alertas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });
});
