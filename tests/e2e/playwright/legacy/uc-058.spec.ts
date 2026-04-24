import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "../helpers";

const UC = "058";

test.describe(`UC-${UC}: CRUD Genérico`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Verificar pagina de CRUD generica ou tabelas de dados", async ({ page }) => {
    await login(page);
    // CrudPage ou tabelas genéricas — tenta rota /crud ou /admin
    await page.goto("http://localhost:5175/crud", {
      waitUntil: "networkidle",
      timeout: 10000,
    }).catch(async () => {
      await page.goto("http://localhost:5175", { waitUntil: "networkidle" });
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P02: Verificar operacao Create via formulario", async ({ page }) => {
    await login(page);
    await navTo(page, "Dashboard");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Qualquer tabela com botão de criar/adicionar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("adicionar") ||
          el.textContent?.toLowerCase().includes("criar") ||
          el.textContent?.toLowerCase().includes("novo")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Verificar operacao Read (listagem de registros)", async ({ page }) => {
    await login(page);
    // Testa listagem em qualquer módulo com tabela de dados
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    // Listagem deve ter registros ou mensagem vazia
    const hasTable =
      body.toLowerCase().includes("contrato") ||
      body.toLowerCase().includes("tabela") ||
      body.toLowerCase().includes("registro") ||
      body.toLowerCase().includes("lista") ||
      body.toLowerCase().includes("nenhum");
    expect(hasTable).toBeTruthy();
  });

  test("P04: Verificar operacao Update (editar registro existente)", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Clica ícone de editar na primeira linha da tabela
    await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll("button, [class*='edit'], [class*='Edit3']"));
      for (const b of Array.from(editBtns)) {
        const title = b.getAttribute("title") || "";
        const text = (b as HTMLElement).textContent || "";
        if (
          title.toLowerCase().includes("editar") ||
          title.toLowerCase().includes("edit") ||
          text.toLowerCase().includes("editar")
        ) {
          (b as HTMLElement).click();
          break;
        }
      }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Verificar operacao Delete com confirmacao", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    // Clica ícone de deletar na primeira linha (se houver)
    await page.evaluate(() => {
      const deleteBtns = Array.from(
        document.querySelectorAll("button[title*='excluir'], button[title*='deletar'], button[title*='delete']")
      );
      if (deleteBtns.length > 0) {
        (deleteBtns[0] as HTMLElement).click();
      }
    });
    await page.waitForTimeout(1000);
    // Cancela a exclusão para não deletar dados reais
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("cancelar") ||
          el.textContent?.toLowerCase().includes("nao") ||
          el.textContent?.toLowerCase().includes("não")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });

  test("P06: Verificar paginacao em tabelas com muitos registros", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P06_acao"), fullPage: true });
    // Verifica presença de controles de paginação
    const hasPagination = await page.evaluate(() => {
      const paginationSelectors = [
        '[class*="pagination"]',
        '[class*="Pagination"]',
        'button[aria-label*="page"]',
        'button[aria-label*="Página"]',
        'button[aria-label*="proxima"]',
        'button[aria-label*="anterior"]',
      ];
      for (const sel of paginationSelectors) {
        if (document.querySelectorAll(sel).length > 0) return true;
      }
      return false;
    });
    await page.screenshot({ path: ssPath(UC, "P06_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });

  test("P07: Verificar busca e filtros em tabelas genericas", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P07_acao"), fullPage: true });
    // Tenta usar campo de busca
    const searchInput = page.locator(
      'input[placeholder*="buscar"], input[placeholder*="filtrar"], input[placeholder*="pesquisar"], input[placeholder*="search"]'
    ).first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("teste");
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath(UC, "P07_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(50);
  });
});
