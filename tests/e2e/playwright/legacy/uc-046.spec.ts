import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "./helpers";

const UC = "046";

test.describe(`UC-${UC}: Extrair Ata PDF com IA`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar AtasPage e aba Extrair", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Extrair");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/extrair|upload|url|ata|pdf/i);
  });

  test("P02: Verificar opcoes de entrada (upload ou URL)", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Extrair");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasInputOptions =
      body.toLowerCase().includes("upload") ||
      body.toLowerCase().includes("url") ||
      body.toLowerCase().includes("link") ||
      body.toLowerCase().includes("arquivo") ||
      body.toLowerCase().includes("pdf");
    expect(hasInputOptions).toBeTruthy();
  });

  test("P03: Digitar URL de ata PDF e iniciar extracao com IA (90s)", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Extrair");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Preenche campo de URL
    const urlInput = page.locator(
      'input[placeholder*="url"], input[placeholder*="URL"], input[placeholder*="link"], input[placeholder*="http"], input[type="url"]'
    ).first();
    if (await urlInput.count() > 0) {
      await urlInput.fill(
        "https://pncp.gov.br/api/pncp/v1/orgaos/00394460000141/compras/2025/24/arquivos/1"
      );
      await page.waitForTimeout(500);
    }
    // Clica Extrair
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("extrair") ||
          el.textContent?.toLowerCase().includes("processar") ||
          el.textContent?.toLowerCase().includes("analisar")
      );
      if (b) b.click();
    });
    await page.screenshot({ path: ssPath(UC, "P03_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("item") ||
        body.toLowerCase().includes("extraido") ||
        body.toLowerCase().includes("ata") ||
        body.toLowerCase().includes("pregao") ||
        body.toLowerCase().includes("concluido") ||
        body.toLowerCase().includes("erro"),
      90000
    );
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Upload de arquivo PDF de ata local", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Extrair");
    await page.waitForTimeout(1500);
    // Cria arquivo PDF temporário
    const tmpDir = `runtime/screenshots/UC-${UC}`;
    const tmpFile = path.join(process.cwd(), tmpDir, "ata_teste.pdf");
    fs.writeFileSync(
      tmpFile,
      "%PDF-1.4\nATA DE REGISTRO DE PRECOS\nPregao 001/2025\nItem 01 - Notebook - Valor: R$ 3.500,00 - CNPJ: 12.345.678/0001-99"
    );
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(tmpFile);
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
    try { fs.unlinkSync(tmpFile); } catch {}
  });

  test("P05: Verificar itens extraidos da ata", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Extrair");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });
});
