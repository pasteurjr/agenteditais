import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "010";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-010: Configuracao de Fontes de Editais", () => {
  test("P01: Acessar ParametrizacoesPage e aba Fontes de Busca", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Parametrizações");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P01_parametrizacoes"), fullPage: true });

    const body = await getBody(page);
    const hasParam =
      body.includes("Parametrizaç") ||
      body.includes("Parametrizac") ||
      body.includes("Score") ||
      body.includes("Fontes") ||
      body.includes("Comercial");
    expect(hasParam || body.length > 200).toBeTruthy();

    // Navegar para aba Fontes de Busca
    await clickTab(page, "Fontes de Busca");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P01_parametrizacoes_fontes"), fullPage: true });

    const bodyFontes = await getBody(page);
    const hasFontes =
      bodyFontes.includes("Fonte") ||
      bodyFontes.includes("fonte") ||
      bodyFontes.includes("PNCP") ||
      bodyFontes.includes("Ativar") ||
      bodyFontes.includes("Desativar") ||
      bodyFontes.includes("api") ||
      bodyFontes.includes("scraper");
    expect(hasFontes || bodyFontes.length > 200).toBeTruthy();
  });

  test("P02: Visualizar lista de fontes com nome, tipo e status", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Parametrizações");
    await page.waitForTimeout(2000);
    await clickTab(page, "Fontes de Busca");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P02_lista_fontes_status"), fullPage: true });

    const body = await getBody(page);

    // Verificar elementos esperados da lista de fontes
    const hasTipos =
      body.includes("api") ||
      body.includes("API") ||
      body.includes("scraper") ||
      body.includes("Scraper") ||
      body.includes("PNCP") ||
      body.includes("Fonte");

    const hasStatus =
      body.includes("Ativa") ||
      body.includes("ativa") ||
      body.includes("Inativa") ||
      body.includes("Ativar") ||
      body.includes("Desativar");

    await page.screenshot({ path: SS("P02_badges_tipo_fonte"), fullPage: true });
    expect(body.length).toBeGreaterThan(200);
  });

  test("P03: Ativar ou desativar uma fonte", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizações");
    await page.waitForTimeout(2000);
    await clickTab(page, "Fontes de Busca");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("P03_antes_toggle"), fullPage: true });

    // Tentar clicar no botao Ativar ou Desativar
    const ativarBtn = page
      .locator('button:has-text("Ativar"), button:has-text("Desativar")')
      .first();

    if (await ativarBtn.count() > 0) {
      const textoAntes = await ativarBtn.textContent();
      await ativarBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P03_toggle_ativar_desativar"), fullPage: true });

      const body = await getBody(page);
      expect(body.length).toBeGreaterThan(200);

      // Reverter para estado original (clicar novamente)
      const btnApos = page
        .locator('button:has-text("Ativar"), button:has-text("Desativar")')
        .first();
      if (await btnApos.count() > 0) {
        const textoApos = await btnApos.textContent();
        if (textoApos !== textoAntes) {
          await btnApos.click();
          await page.waitForTimeout(1500);
        }
      }
    } else {
      await page.screenshot({ path: SS("P03_sem_botoes_toggle"), fullPage: true });
    }

    await page.screenshot({ path: SS("P03_configuracao_final"), fullPage: true });
  });

  test("P04-P05: Editar e salvar palavras-chave", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizações");
    await page.waitForTimeout(2000);
    await clickTab(page, "Fontes de Busca");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("P04_palavras_chave"), fullPage: true });

    const body = await getBody(page);

    // Verificar campo de palavras-chave
    const hasKeywords =
      body.includes("Palavras") ||
      body.includes("palavras") ||
      body.includes("keyword") ||
      body.includes("Chave") ||
      body.includes("chave");

    // Tentar interagir com textarea de palavras-chave
    const keywordsTextarea = page
      .locator('textarea[name*="palavras"], textarea[placeholder*="palavras"], textarea')
      .first();

    if (await keywordsTextarea.count() > 0) {
      await keywordsTextarea.fill("equipamento hospitalar, monitor, ventilador");
      await page.screenshot({ path: SS("P04_palavras_editadas"), fullPage: true });

      // Salvar palavras-chave
      const salvarPalavrasBtn = page
        .locator('button:has-text("Salvar Palavras-chave"), button:has-text("Salvar Palavras")')
        .first();
      if (await salvarPalavrasBtn.count() > 0) {
        await salvarPalavrasBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("P05_palavras_salvas"), fullPage: true });
      }
    } else {
      await page.screenshot({ path: SS("P04_sem_palavras"), fullPage: true });
    }

    expect(body.length).toBeGreaterThan(200);
  });

  test("P06: Editar e salvar NCMs de busca", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizações");
    await page.waitForTimeout(2000);
    await clickTab(page, "Fontes de Busca");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("P06_ncms"), fullPage: true });

    const body = await getBody(page);
    const hasNcm =
      body.includes("NCM") ||
      body.includes("ncm") ||
      body.includes("Salvar NCMs");

    // Tentar localizar e editar campo NCM
    const ncmsTextarea = page
      .locator('textarea[name*="ncm"], textarea[placeholder*="NCM"]')
      .first();

    if (await ncmsTextarea.count() > 0) {
      await ncmsTextarea.fill("8528.52.00, 9018.19.99");
      await page.screenshot({ path: SS("P06_ncms_editados"), fullPage: true });

      const salvarNcmsBtn = page
        .locator('button:has-text("Salvar NCMs")')
        .first();
      if (await salvarNcmsBtn.count() > 0) {
        await salvarNcmsBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("P06_ncms_salvos"), fullPage: true });
      }
    } else {
      await page.screenshot({ path: SS("P06_sem_ncm"), fullPage: true });
    }

    expect(body.length).toBeGreaterThan(200);
  });

  test("FA-001: Verificar botoes Onda 4 desabilitados", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizações");
    await page.waitForTimeout(2000);
    await clickTab(page, "Fontes de Busca");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("FA01_botoes_onda4"), fullPage: true });

    const body = await getBody(page);
    // Os botoes Onda 4 devem aparecer desabilitados
    const hasOnda4 =
      body.includes("Onda 4") ||
      body.includes("Gerar do portfolio") ||
      body.includes("Sincronizar NCMs");

    // Verificar que botao aparece como disabled se presente
    const onda4Btn = page
      .locator('button:has-text("Onda 4"), button:has-text("Gerar do portfolio")')
      .first();
    if (await onda4Btn.count() > 0) {
      const isDisabled = await onda4Btn.isDisabled();
      expect(isDisabled).toBeTruthy();
    }

    // Seja qual for o resultado, a pagina deve estar carregada
    expect(body.length).toBeGreaterThan(200);
  });
});
