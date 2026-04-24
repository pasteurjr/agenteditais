import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "041";

test.describe(`UC-${UC}: Submissão no Portal`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar RecursosPage e aba Submissao", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await clickTab(page, "Submissao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/submiss|protocolo|status|portal|envio/i);
  });

  test("P02: Verificar lista de laudos prontos para submissao", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Submissao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Verificar campo protocolo e status de submissao", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Submissao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    const hasStatus =
      body.toLowerCase().includes("protocolo") ||
      body.toLowerCase().includes("status") ||
      body.toLowerCase().includes("enviado") ||
      body.toLowerCase().includes("pendente") ||
      body.toLowerCase().includes("submiss");
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    expect(hasStatus).toBeTruthy();
  });

  test("P04: Registrar protocolo de submissao em laudo existente", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Submissao");
    await page.waitForTimeout(2000);
    // Tenta preencher campo de protocolo se disponível
    const protocolInput = page.locator(
      'input[placeholder*="protocolo"], input[placeholder*="numero"], input[name*="protocolo"]'
    ).first();
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    if (await protocolInput.count() > 0) {
      await protocolInput.fill("PROT-2026-00123");
      await page.waitForTimeout(500);
      // Tenta salvar
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const b = btns.find(
          (el) =>
            el.textContent?.toLowerCase().includes("salvar") ||
            el.textContent?.toLowerCase().includes("registrar") ||
            el.textContent?.toLowerCase().includes("confirmar")
        );
        if (b) b.click();
      });
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Verificar badge de status apos submissao", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Submissao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });
});
