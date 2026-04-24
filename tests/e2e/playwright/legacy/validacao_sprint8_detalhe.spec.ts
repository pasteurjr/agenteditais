import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

// Screenshots de alta resolução para análise detalhada
// Viewport 1920x1080 para melhor legibilidade

test.describe.serial("Sprint 8 — Screenshots Detalhados", () => {

  test("HD01: Stat cards dispensas — valores numericos", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    // Screenshot focado nos stat cards (topo da pagina)
    await page.screenshot({ path: "runtime/screenshots/UC-DI01/HD01_stat_cards_hd.png", fullPage: false });
    // Scroll down para tabela
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "runtime/screenshots/UC-DI01/HD01_tabela_hd.png", fullPage: false });
    // Full page
    await page.screenshot({ path: "runtime/screenshots/UC-DI01/HD01_fullpage_hd.png", fullPage: true });
  });

  test("HD02: Tabela dispensas — artigos, status, valores, acoes", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    // Scroll direto para tabela
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "runtime/screenshots/UC-DI01/HD02_tabela_zoom.png", fullPage: false });
  });

  test("HD03: Filtro 75-I aplicado — tabela filtrada", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    // Aplicar filtro
    const selects = page.locator("select");
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const opts = await selects.nth(i).locator("option").allTextContents();
      if (opts.some(o => o.includes("75-I"))) {
        await selects.nth(i).selectOption({ label: "75-I" });
        break;
      }
    }
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "runtime/screenshots/UC-DI01/HD03_filtro_75I_hd.png", fullPage: true });
  });

  test("HD04: Modal cotacao gerada", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(4000);
    const btnCotacao = page.locator("button").filter({ hasText: /Cota[çc]/i }).first();
    if (await btnCotacao.count() > 0) {
      await btnCotacao.click();
      await page.waitForTimeout(10000);
      await page.screenshot({ path: "runtime/screenshots/UC-DI01/HD04_modal_cotacao_hd.png", fullPage: true });
      const closeBtn = page.locator("button").filter({ hasText: /Fechar|OK|Cancelar|Close/i }).first();
      if (await closeBtn.count() > 0) await closeBtn.click();
    }
  });

  test("HD05: Parametrizacoes > Classes — stat cards e tree", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "runtime/screenshots/UC-CL02/HD05_classes_hd.png", fullPage: false });
    await page.screenshot({ path: "runtime/screenshots/UC-CL02/HD05_classes_full.png", fullPage: true });
  });

  test("HD06: Tree view expandida com subclasses", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(4000);
    // Expandir areas
    const areas = page.locator("text=/Diagnóstico|Diagnostico/i").first();
    if (await areas.count() > 0) await areas.click();
    await page.waitForTimeout(800);
    const classes = page.locator("text=/Reagentes|Hematologia/i").first();
    if (await classes.count() > 0) await classes.click();
    await page.waitForTimeout(800);
    const equip = page.locator("text=/Equipamentos/i").first();
    if (await equip.count() > 0) await equip.click();
    await page.waitForTimeout(800);
    const consum = page.locator("text=/Consumíveis|Consumiveis/i").first();
    if (await consum.count() > 0) await consum.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: "runtime/screenshots/UC-CL02/HD06_tree_expandida_hd.png", fullPage: true });
  });

  test("HD07: Detalhe subclasse com campos_mascara", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(4000);
    // Expandir e selecionar subclasse
    const diag = page.locator("text=/Diagnóstico|Diagnostico/i").first();
    if (await diag.count() > 0) await diag.click();
    await page.waitForTimeout(800);
    const hemato = page.locator("text=/Reagentes Hematologia|Hematologia/i").first();
    if (await hemato.count() > 0) await hemato.click();
    await page.waitForTimeout(800);
    const sub = page.locator("text=/Hemograma|Coagulação|Coagulacao/i").first();
    if (await sub.count() > 0) await sub.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "runtime/screenshots/UC-CL02/HD07_detalhe_subcl_hd.png", fullPage: true });
  });

  test("HD08: Portfolio — colunas Classe, Desc.Normalizada, badges", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "runtime/screenshots/UC-CL03/HD08_portfolio_hd.png", fullPage: false });
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);
    await page.screenshot({ path: "runtime/screenshots/UC-CL03/HD08_tabela_hd.png", fullPage: false });
    await page.screenshot({ path: "runtime/screenshots/UC-CL03/HD08_portfolio_full.png", fullPage: true });
  });

  test("HD09: Portfolio — filtro Sem Classe ativado", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(4000);
    const semClasse = page.locator("label, span").filter({ hasText: /Sem Classe/i }).first();
    if (await semClasse.count() > 0) {
      await semClasse.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: "runtime/screenshots/UC-CL03/HD09_filtro_sem_classe_hd.png", fullPage: true });
  });

  test("HD10: Portfolio — selecao multipla + botoes lote", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(4000);
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();
    if (count > 3) {
      await checkboxes.nth(1).check().catch(() => {});
      await checkboxes.nth(2).check().catch(() => {});
      await checkboxes.nth(3).check().catch(() => {});
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: "runtime/screenshots/UC-CL03/HD10_selecao_lote_hd.png", fullPage: false });
    await page.screenshot({ path: "runtime/screenshots/UC-CL03/HD10_selecao_full.png", fullPage: true });
  });
});
