import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody } from "../helpers";

const SS = (name: string) => `runtime/screenshots/zoom/${name}.png`;

test.use({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });

test.describe.serial("Sprint 8 — Zoom Screenshots para Análise", () => {

  test("Z01: Stat cards dispensas — clip topo", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    // Stat cards area — clip top region
    await page.screenshot({ path: SS("Z01_stat_cards"), clip: { x: 200, y: 80, width: 1600, height: 200 } });
  });

  test("Z02: Tabela dispensas — dados completos", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    // Scroll to table
    await page.evaluate(() => window.scrollBy(0, 350));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SS("Z02_tabela_dispensas"), clip: { x: 200, y: 50, width: 1600, height: 500 } });
  });

  test("Z03: Tabela dispensas — scroll full para ver todas linhas", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    await page.screenshot({ path: SS("Z03_dispensas_full"), fullPage: true });
  });

  test("Z04: Filtro 75-I aplicado", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    const selects = page.locator("select");
    const cnt = await selects.count();
    for (let i = 0; i < cnt; i++) {
      const opts = await selects.nth(i).locator("option").allTextContents();
      if (opts.some(o => o.includes("75-I"))) {
        await selects.nth(i).selectOption({ label: "75-I" });
        break;
      }
    }
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("Z04_filtro_75I"), fullPage: true });
  });

  test("Z05: Modal cotacao", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    const btn = page.locator("button").filter({ hasText: /Cota[çc]/i }).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(12000);
      await page.screenshot({ path: SS("Z05_modal_cotacao"), fullPage: true });
      const closeBtn = page.locator("button").filter({ hasText: /Fechar|OK|Cancelar|Close/i }).first();
      if (await closeBtn.count() > 0) await closeBtn.click();
    }
  });

  test("Z06: Parametrizacoes > Classes — stat cards", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(4000);
    await page.screenshot({ path: SS("Z06_classes_stat"), clip: { x: 200, y: 80, width: 1600, height: 250 } });
    await page.screenshot({ path: SS("Z06_classes_full"), fullPage: true });
  });

  test("Z07: Tree expandida completa", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(4000);
    // Expand all
    const items = page.locator("text=/Diagnóstico|Diagnostico/i").first();
    if (await items.count() > 0) await items.click();
    await page.waitForTimeout(500);
    const r = page.locator("text=/Reagentes/i").first();
    if (await r.count() > 0) await r.click();
    await page.waitForTimeout(500);
    const k = page.locator("text=/Kits|Bioquímica|Bioquimica/i").first();
    if (await k.count() > 0) await k.click();
    await page.waitForTimeout(500);
    const eq = page.locator("text=/Equipamentos/i").first();
    if (await eq.count() > 0) await eq.click();
    await page.waitForTimeout(500);
    const an = page.locator("text=/Analisadores/i").first();
    if (await an.count() > 0) await an.click();
    await page.waitForTimeout(500);
    const mi = page.locator("text=/Microscopia/i").first();
    if (await mi.count() > 0) await mi.click();
    await page.waitForTimeout(500);
    const co = page.locator("text=/Consumíveis|Consumiveis/i").first();
    if (await co.count() > 0) await co.click();
    await page.waitForTimeout(500);
    const de = page.locator("text=/Descartáveis|Descartaveis/i").first();
    if (await de.count() > 0) await de.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("Z07_tree_full"), fullPage: true });
  });

  test("Z08: Detalhe subclasse Hemograma — campos_mascara", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(4000);
    const d = page.locator("text=/Diagnóstico|Diagnostico/i").first();
    if (await d.count() > 0) await d.click();
    await page.waitForTimeout(500);
    const r = page.locator("text=/Reagentes/i").first();
    if (await r.count() > 0) await r.click();
    await page.waitForTimeout(500);
    const h = page.locator("text=/Hemograma/i").first();
    if (await h.count() > 0) await h.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("Z08_detalhe_hemograma"), fullPage: true });
  });

  test("Z09: Portfolio — tabela com colunas Classe + badges", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(4000);
    await page.screenshot({ path: SS("Z09_portfolio_top"), clip: { x: 200, y: 80, width: 1600, height: 400 } });
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SS("Z09_portfolio_tabela"), clip: { x: 200, y: 50, width: 1600, height: 500 } });
    await page.screenshot({ path: SS("Z09_portfolio_full"), fullPage: true });
  });

  test("Z10: Portfolio — selecao + botoes Classificar/Mascara Lote", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(4000);
    const cbs = page.locator("input[type='checkbox']");
    const cnt = await cbs.count();
    if (cnt > 3) {
      await cbs.nth(1).check().catch(() => {});
      await cbs.nth(2).check().catch(() => {});
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: SS("Z10_selecao_botoes"), fullPage: true });
  });
});
