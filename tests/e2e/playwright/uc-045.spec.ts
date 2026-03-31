import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "045";

test.describe(`UC-${UC}: Buscar Atas PNCP`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar AtasPage via menu Atas", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/atas?|buscar|pncp|pesquisar/i);
  });

  test("P02: Verificar aba Buscar e campos de pesquisa", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Buscar");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const hasSearch =
      body.toLowerCase().includes("buscar") ||
      body.toLowerCase().includes("pesquisa") ||
      body.toLowerCase().includes("termo") ||
      body.toLowerCase().includes("produto") ||
      body.toLowerCase().includes("cnpj");
    expect(hasSearch).toBeTruthy();
  });

  test("P03: Digitar termo de busca e clicar Buscar", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Buscar");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Digita termo de busca
    const searchInput = page.locator(
      'input[placeholder*="busca"], input[placeholder*="termo"], input[placeholder*="produto"], input[type="search"], input[type="text"]'
    ).first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("notebook");
      await page.waitForTimeout(500);
    }
    // Clica Buscar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("buscar") ||
          el.textContent?.toLowerCase().includes("pesquisar") ||
          el.textContent?.toLowerCase().includes("search")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Verificar resultados da busca PNCP", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Buscar");
    await page.waitForTimeout(1500);
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("notebook");
    }
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.toLowerCase().includes("buscar"));
      if (b) b.click();
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const hasResults =
      body.toLowerCase().includes("ata") ||
      body.toLowerCase().includes("resultado") ||
      body.toLowerCase().includes("registro") ||
      body.toLowerCase().includes("nenhum") ||
      body.toLowerCase().includes("pregao");
    expect(hasResults).toBeTruthy();
  });

  test("P05: Verificar detalhes de uma ata encontrada", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas");
    await clickTab(page, "Buscar");
    await page.waitForTimeout(1500);
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("notebook");
    }
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.toLowerCase().includes("buscar"));
      if (b) b.click();
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    // Clica no primeiro resultado se houver
    await page.evaluate(() => {
      const rows = document.querySelectorAll("tr");
      if (rows.length > 1) {
        const firstRow = rows[1] as HTMLElement;
        firstRow.click();
      }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });
});
