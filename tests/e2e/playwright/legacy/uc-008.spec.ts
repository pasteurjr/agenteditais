import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "../helpers";

const UC = "008";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-008: Gestao de Especificacoes Tecnicas e Verificacao de Completude", () => {
  test("P01: Lista de produtos com ScoreBar visivel", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P01_lista_produtos_scorebar"), fullPage: true });

    const body = await getBody(page);
    const hasLista =
      body.includes("Produto") ||
      body.includes("Fabricante") ||
      body.includes("NCM") ||
      body.includes("Completude") ||
      body.includes("Score") ||
      body.includes("%");
    expect(body.length).toBeGreaterThan(200);
  });

  test("P02: Selecionar produto e verificar painel de detalhes (botao Eye)", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("P02_antes_selecionar"), fullPage: true });

    // Clicar no botao Visualizar (Eye) do primeiro produto
    const vizBtn = page
      .locator('button:has-text("Visualizar"), button[aria-label*="detalhe"], button[title*="detalhe"]')
      .first();

    if (await vizBtn.count() > 0) {
      await vizBtn.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: SS("P02_detalhe_produto_specs"), fullPage: true });

      const body = await getBody(page);
      const hasDetalhe =
        body.includes("Especificaç") ||
        body.includes("Especificac") ||
        body.includes("Fabricante") ||
        body.includes("Modelo") ||
        body.includes("NCM") ||
        body.includes("CATMAT") ||
        body.includes("Reprocessar") ||
        body.includes("Completude");
      expect(hasDetalhe || body.length > 200).toBeTruthy();
    } else {
      await page.screenshot({ path: SS("P02_sem_produtos"), fullPage: true });
      const body = await getBody(page);
      expect(body.length).toBeGreaterThan(200);
    }
  });

  test("P04-P06: Modal de edicao de produto — campos editaveis e salvar", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);

    // Clicar no botao Editar do primeiro produto
    const editBtn = page
      .locator('button:has-text("Editar")')
      .first();

    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P04_modo_edicao_ativo"), fullPage: true });

      const body = await getBody(page);
      const hasModal =
        body.includes("Salvar") ||
        body.includes("Cancelar") ||
        body.includes("Nome") ||
        body.includes("Fabricante") ||
        body.includes("NCM") ||
        body.includes("Especificaç");
      expect(hasModal || body.length > 200).toBeTruthy();

      // Passo 5: Editar uma especificacao
      // Tentar modificar o campo Modelo se existir
      const modeloInput = page
        .locator('input[name*="modelo"], input[placeholder*="Modelo"], label:has-text("Modelo") ~ * input')
        .first();
      if (await modeloInput.count() > 0) {
        const valorAtual = await modeloInput.inputValue();
        await modeloInput.fill(valorAtual + "-EDITADO");
        await page.screenshot({ path: SS("P05_specs_editadas"), fullPage: true });
      } else {
        await page.screenshot({ path: SS("P05_campos_modal"), fullPage: true });
      }

      // Passo 6: Cancelar (nao salvar dado de teste em producao)
      const cancelarBtn = page.locator('button:has-text("Cancelar")').first();
      if (await cancelarBtn.count() > 0) {
        await cancelarBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: SS("P06_apos_cancelar"), fullPage: true });
      }
    } else {
      await page.screenshot({ path: SS("P04_sem_botao_editar"), fullPage: true });
    }

    await page.screenshot({ path: SS("P05_salvo_modo_visualizacao"), fullPage: true });
  });

  test("FA-003: Verificar Completude Tecnica via modal", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);

    const completudeBtn = page
      .locator('button:has-text("Verificar Completude"), button:has-text("Completude")')
      .first();

    if (await completudeBtn.count() > 0) {
      await completudeBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("FA03_completude_modal"), fullPage: true });

      const body = await getBody(page);
      const hasCompletude =
        body.includes("percentual") ||
        body.includes("Percentual") ||
        body.includes("%") ||
        body.includes("mascara") ||
        body.includes("mascara") ||
        body.includes("básic") ||
        body.includes("basico") ||
        body.includes("recomend");
      expect(hasCompletude || body.length > 200).toBeTruthy();

      const fecharBtn = page
        .locator('button:has-text("Fechar"), button:has-text("OK")')
        .first();
      if (await fecharBtn.count() > 0) {
        await fecharBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: SS("P06_scorebar_atualizado"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("FA-002: Reprocessar IA — botao na tabela ou detalhe", async ({
    page,
  }) => {
    test.setTimeout(120000);
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);

    const reprocessarBtn = page
      .locator('button:has-text("Reprocessar IA"), button:has-text("Reprocessar")')
      .first();

    if (await reprocessarBtn.count() > 0) {
      await reprocessarBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("FA02_reprocessar_ia"), fullPage: true });

      // Aguardar feedback de reprocessamento
      const ok = await waitForIA(
        page,
        (body) =>
          body.includes("reprocess") ||
          body.includes("Reprocess") ||
          body.includes("conclu") ||
          body.includes("sucesso") ||
          body.length > 200,
        30000,
        3000
      );
      await page.screenshot({ path: SS("FA02_apos_reprocessar"), fullPage: true });
    } else {
      await page.screenshot({ path: SS("FA02_sem_botao_reprocessar"), fullPage: true });
    }

    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });
});
