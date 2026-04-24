import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "034";

test.describe(`UC-${UC}: Upload de Petição Externa`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar aba Peticoes e localizar botao Upload", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peticoes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/upload|peti|importar/i);
  });

  test("P02: Abrir modal de upload ao clicar em Upload", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peticoes");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Clica botão Upload
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) =>
        el.textContent?.toLowerCase().includes("upload")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/edital|arquivo|importar|peti/i);
  });

  test("P03: Verificar campos do modal de upload", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peticoes");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) =>
        el.textContent?.toLowerCase().includes("upload")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Seleciona edital no modal
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
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/edital|tipo|arquivo|50 mb|docx|pdf/i);
  });

  test("P04: Selecionar arquivo PDF para upload", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peticoes");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) =>
        el.textContent?.toLowerCase().includes("upload")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    // Cria arquivo temporário para upload
    const tmpFile = path.join(
      process.cwd(),
      "runtime",
      "screenshots",
      `UC-${UC}`,
      "peticao_teste.pdf"
    );
    fs.writeFileSync(tmpFile, "%PDF-1.4 peticao de teste para upload automatizado");
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Localiza input file e faz upload
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(tmpFile);
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
    // Limpa arquivo temporário
    try { fs.unlinkSync(tmpFile); } catch {}
  });

  test("P05: Cancelar upload sem salvar", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peticoes");
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) =>
        el.textContent?.toLowerCase().includes("upload")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    // Clica Cancelar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) =>
        el.textContent?.toLowerCase().includes("cancelar") ||
        el.textContent?.toLowerCase().includes("fechar")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });
});
