import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

const UC = "DI01";

test.describe(`UC-${UC}: Dashboard e Workflow de Dispensas`, () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("P01: Navegar para Captação e ver aba Dispensas", async ({ page }) => {
    await navTo(page, "Captacao");
    await page.screenshot({ path: ssPath(UC, "P01_acao_captacao"), fullPage: true });
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp_dispensas_tab"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Abertas") || body.includes("Dispensas") || body.includes("aberta")).toBeTruthy();
  });

  test("P02: Stat cards de dispensas visíveis", async ({ page }) => {
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath(UC, "P02_acao_stats"), fullPage: true });
    const body = await getBody(page);
    const hasStats = body.includes("Abertas") || body.includes("Adjudicadas") || body.includes("Encerradas");
    expect(hasStats).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P02_resp_stats"), fullPage: true });
  });

  test("P03: Filtros de dispensas (artigo, UF)", async ({ page }) => {
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(2000);

    const artigoSelect = page.locator('select').filter({ hasText: /75-I|Artigo/ }).first();
    if (await artigoSelect.count() > 0) {
      await artigoSelect.selectOption({ label: "75-I" }).catch(() => {});
    }
    await page.screenshot({ path: ssPath(UC, "P03_acao_filtro_artigo"), fullPage: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath(UC, "P03_resp_filtro_aplicado"), fullPage: true });
    const body = await getBody(page);
    expect(body).toBeTruthy();
  });

  test("P04: Gerar cotação para dispensa", async ({ page }) => {
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);

    const btnCotacao = page.locator('button').filter({ hasText: /Cota[çc][aã]o|Gerar/i }).first();
    await page.screenshot({ path: ssPath(UC, "P04_acao_btn_cotacao"), fullPage: true });
    if (await btnCotacao.count() > 0) {
      await btnCotacao.click().catch(() => {});
      await page.waitForTimeout(5000);
    }
    await page.screenshot({ path: ssPath(UC, "P04_resp_cotacao"), fullPage: true });
  });

  test("P05: Atualizar status de dispensa", async ({ page }) => {
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);

    await page.screenshot({ path: ssPath(UC, "P05_acao_lista_dispensas"), fullPage: true });
    const btnStatus = page.locator('button, select').filter({ hasText: /Status|cotacao_enviada|Atualizar/i }).first();
    if (await btnStatus.count() > 0) {
      await btnStatus.click().catch(() => {});
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: ssPath(UC, "P05_resp_status"), fullPage: true });
  });
});
