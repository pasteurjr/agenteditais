import { test, expect } from "@playwright/test";
import { login, navTo, getBody, ssPath } from "../helpers";

const SS = (uc: string, step: string) => ssPath(`S7-${uc}`, step);

test.describe("Sprint 7 — Analytics Consolidado (UC-AN01 a UC-AN04)", () => {
  test.setTimeout(120000);

  test("UC-AN01: Funil de Conversao Pipeline na AnalyticsPage", async ({ page }) => {
    await login(page);
    await navTo(page, "Analytics");

    await page.waitForSelector(".stat-value", { timeout: 15000 });
    await page.waitForTimeout(2000);

    // 1) Verificar header e subtitle
    const body = await getBody(page);
    expect(body).toContain("Analytics");
    expect(body).toContain("Performance");

    // 2) Verificar 4 tabs
    const tabPipeline = page.locator("button", { hasText: "Pipeline" });
    const tabConversoes = page.locator("button", { hasText: "Conversoes" });
    const tabTempos = page.locator("button", { hasText: "Tempos" });
    const tabROI = page.locator("button", { hasText: "ROI" });
    await expect(tabPipeline).toBeVisible({ timeout: 5000 });
    await expect(tabConversoes).toBeVisible({ timeout: 5000 });
    await expect(tabTempos).toBeVisible({ timeout: 5000 });
    await expect(tabROI).toBeVisible({ timeout: 5000 });

    // 3) Pipeline ativo (fontWeight bold)
    const pipelineStyle = await tabPipeline.evaluate((el) => window.getComputedStyle(el).fontWeight);
    expect(parseInt(pipelineStyle)).toBeGreaterThanOrEqual(600);

    // 4) Verificar filtros
    expect(body).toContain("Periodo");
    expect(body).toContain("Segmento");

    // 5) Verificar 4 stat cards com valores reais
    expect(body).toContain("Total Pipeline");
    expect(body).toContain("Analisados");
    expect(body).toContain("Participados");
    expect(body).toContain("Resultado Definitivo");

    const statValues = page.locator(".stat-value");
    expect(await statValues.count()).toBeGreaterThanOrEqual(4);

    const totalPipelineText = await statValues.nth(0).innerText();
    expect(totalPipelineText).toBeTruthy();
    expect(totalPipelineText).not.toBe("0");

    // 6) Verificar funil visual com etapas
    expect(body).toContain("Funil do Pipeline");
    const bodyLower = body.toLowerCase();
    const temEtapas = bodyLower.includes("captado") || bodyLower.includes("analise") || bodyLower.includes("divulgado");
    expect(temEtapas).toBeTruthy();

    // Verificar setas de conversao com %
    const percentSpans = page.locator('span:has-text("%")');
    expect(await percentSpans.count()).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: SS("AN01", "P01_analytics_pipeline_funil"), fullPage: true });

    // 7) Verificar tabela de conversao (headers ficam uppercase via CSS)
    const temTabela = body.includes("Tabela de Conversao") || body.includes("TABELA DE CONVERSAO");
    expect(temTabela).toBeTruthy();

    // Headers uppercase: ETAPA, ENTRADA, SAIDA, CONVERSAO %, VALOR ACUM.
    const bodyUpper = body.toUpperCase();
    expect(bodyUpper).toContain("ETAPA");
    expect(bodyUpper).toContain("ENTRADA");
    expect(bodyUpper).toContain("SAIDA");

    // 8) Verificar tabela tem linhas de dados
    const tableRows = page.locator("table.data-table tbody tr");
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    const firstRowText = await tableRows.first().innerText();
    expect(firstRowText.length).toBeGreaterThan(5);

    await page.screenshot({ path: SS("AN01", "P02_resp_tabela_conversao"), fullPage: true });
  });

  test("UC-AN02: Taxas de Conversao Detalhadas", async ({ page }) => {
    await login(page);
    await navTo(page, "Analytics");

    await page.waitForSelector(".stat-value", { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 1) Clicar tab "Conversoes"
    const convTab = page.locator("button", { hasText: "Conversoes" });
    await expect(convTab).toBeVisible({ timeout: 5000 });
    await convTab.click();

    await page.waitForSelector(".stat-value", { timeout: 15000 });
    await page.waitForTimeout(2000);

    const body = await getBody(page);

    // 2) Verificar 4 stat cards
    expect(body).toContain("Taxa Geral");
    expect(body).toContain("Melhor Segmento");
    expect(body).toContain("Melhor UF");

    const statValues = page.locator(".stat-value");
    expect(await statValues.count()).toBeGreaterThanOrEqual(3);

    const taxaGeralText = await statValues.nth(0).innerText();
    expect(taxaGeralText).toBeTruthy();

    await page.screenshot({ path: SS("AN02", "P01_conversoes_stats"), fullPage: true });

    // 3) Verificar tabela "Taxa por Tipo" (headers uppercase via CSS)
    expect(body).toContain("Taxa por Tipo");
    const bodyUpper = body.toUpperCase();
    expect(bodyUpper).toContain("TIPO");
    expect(bodyUpper).toContain("PARTICIPADOS");
    expect(bodyUpper).toContain("GANHOS");
    expect(bodyUpper).toContain("BENCHMARK");

    // 4) Verificar "Taxa por UF" e "Taxa por Segmento"
    expect(body).toContain("Taxa por UF");
    expect(body).toContain("Taxa por Segmento");

    // 5) Verificar tabelas tem linhas de dados
    const allTables = page.locator("table.data-table tbody tr");
    const totalRows = await allTables.count();
    expect(totalRows).toBeGreaterThanOrEqual(1);

    // 6) Verificar que ha valores com % nas tabelas (taxas de conversao)
    const temTaxas = body.includes("%");
    expect(temTaxas).toBeTruthy();

    await page.screenshot({ path: SS("AN02", "P02_resp_taxas_benchmark"), fullPage: true });
  });

  test("UC-AN03: Tempo Medio entre Etapas", async ({ page }) => {
    await login(page);
    await navTo(page, "Analytics");

    await page.waitForSelector(".stat-value", { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 1) Clicar tab "Tempos"
    const temposTab = page.locator("button", { hasText: "Tempos" });
    await expect(temposTab).toBeVisible({ timeout: 5000 });
    await temposTab.click();

    await page.waitForSelector(".stat-value", { timeout: 15000 });
    await page.waitForTimeout(2000);

    const body = await getBody(page);

    // 2) Verificar 4 stat cards
    expect(body).toContain("Tempo Total Medio");
    expect(body).toContain("Etapa Mais Lenta");
    expect(body).toContain("Etapa Mais Rapida");

    const statValues = page.locator(".stat-value");
    expect(await statValues.count()).toBeGreaterThanOrEqual(3);

    // Tempo Total Medio mostra valor com "d" (dias)
    const tempoTotalText = await statValues.nth(0).innerText();
    expect(tempoTotalText).toContain("d");

    await page.screenshot({ path: SS("AN03", "P01_tempos_stats_barras"), fullPage: true });

    // 3) Verificar "Tempo entre Etapas" com transicoes usando →
    expect(body).toContain("Tempo entre Etapas");
    expect(body).toContain("→");

    // 4) Verificar badge "GARGALO" (derivado de is_gargalo na API)
    const gargaloBadge = page.locator('span:has-text("GARGALO")');
    const gargaloCount = await gargaloBadge.count();
    if (gargaloCount > 0) {
      const gargaloStyle = await gargaloBadge.first().evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return cs.color;
      });
      expect(gargaloStyle).toBeTruthy();
    }

    // 5) Verificar "Detalhamento" DataTable (headers uppercase via CSS)
    expect(body).toContain("Detalhamento");
    const bodyUpper = body.toUpperCase();
    expect(bodyUpper).toContain("TRANSICAO");
    expect(bodyUpper).toContain("MEDIA");
    expect(bodyUpper).toContain("MEDIANA");
    expect(bodyUpper).toContain("MIN");
    expect(bodyUpper).toContain("MAX");

    // 6) Verificar tabela tem linhas com transicoes →
    const tableRows = page.locator("table.data-table tbody tr");
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    const firstRowText = await tableRows.first().innerText();
    expect(firstRowText.length).toBeGreaterThan(5);
    expect(firstRowText).toContain("→");

    await page.screenshot({ path: SS("AN03", "P02_resp_gargalo_detalhamento"), fullPage: true });
  });

  test("UC-AN04: ROI Estimado", async ({ page }) => {
    await login(page);
    await navTo(page, "Analytics");

    await page.waitForSelector(".stat-value", { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 1) Clicar tab "ROI"
    const roiTab = page.locator("button", { hasText: "ROI" });
    await expect(roiTab).toBeVisible({ timeout: 5000 });
    await roiTab.click();
    await page.waitForTimeout(3000);

    const body = await getBody(page);

    // 2) Verificar "ROI Consolidado" com valor %
    expect(body).toContain("ROI Consolidado");
    const temPercent = body.includes("%");
    expect(temPercent).toBeTruthy();
    expect(body).toContain("R$");

    await page.screenshot({ path: SS("AN04", "P01_roi_consolidado"), fullPage: true });

    // 3) Verificar grid 2x2 de Componentes com R$ e descricoes
    expect(body).toContain("Receita Direta");
    expect(body).toContain("Oportunidades Salvas");
    expect(body).toContain("Produtividade");
    expect(body).toContain("Prevencao Perdas");

    expect(body).toContain("Editais ganhos");
    expect(body).toContain("Recursos revertidos");
    expect(body).toContain("Horas economizadas");
    expect(body).toContain("Intrusos detectados");

    // 4) Verificar "Detalhamento" DataTable (headers uppercase via CSS)
    expect(body).toContain("Detalhamento");
    const bodyUpper = body.toUpperCase();
    expect(bodyUpper).toContain("COMPONENTE");
    expect(bodyUpper).toContain("VALOR R$");
    expect(bodyUpper).toContain("% TOTAL");

    // 5) Verificar tabela tem 4 linhas (uma por componente)
    const tableRows = page.locator("table.data-table tbody tr");
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(4);

    const tableText = await page.locator("table.data-table tbody").innerText();
    expect(tableText).toContain("Receita Direta");
    expect(tableText).toContain("Oportunidades Salvas");
    expect(tableText).toContain("Produtividade");
    expect(tableText).toContain("Prevencao Perdas");

    // 6) Verificar filtro Periodo
    expect(body).toContain("Periodo");
    const periodoSelect = page.locator("select");
    expect(await periodoSelect.count()).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: SS("AN04", "P02_resp_componentes_detalhamento"), fullPage: true });
  });
});
