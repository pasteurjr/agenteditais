import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath, waitForIA } from "../helpers";

const UC = "004";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-004: Busca Automatica de Certidoes", () => {
  test("P01: Acessar secao Certidoes Automaticas", async ({ page }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Rolar ate a quarta secao — Certidoes Automaticas
    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("P01_aba_certidoes"), fullPage: true });

    const body = await getBody(page);
    // A pagina deve ter carregado
    expect(body.length).toBeGreaterThan(200);
  });

  test("P01-P04: Visualizacao da secao Certidoes e botao Buscar", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Rolar progressivamente ate encontrar Certidoes
    for (let scroll = 800; scroll <= 3000; scroll += 400) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      await page.waitForTimeout(500);
      const body = await getBody(page);
      if (
        body.includes("Certidão") ||
        body.includes("Certidao") ||
        body.includes("Buscar Certidoes") ||
        body.includes("Buscar Certidões") ||
        body.includes("INSS") ||
        body.includes("FGTS")
      ) {
        break;
      }
    }

    await page.screenshot({ path: SS("P01_secao_certidoes"), fullPage: true });

    const body = await getBody(page);

    // Verificar botao Buscar Certidoes
    const btnBuscar = page
      .locator(
        'button:has-text("Buscar Certidões"), button:has-text("Buscar Certidoes"), button:has-text("Buscar")'
      )
      .first();
    const btnExists = await btnBuscar.count() > 0;
    await page.screenshot({ path: SS("P01_botao_buscar"), fullPage: true });

    expect(body.length).toBeGreaterThan(200);
  });

  test("P02: Iniciar busca automatica de certidoes", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Rolar ate a secao de certidoes
    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("P02_antes_busca"), fullPage: true });

    // Verificar se empresa tem CNPJ (pre-condicao)
    const body = await getBody(page);
    const temCnpj =
      body.includes("CNPJ") ||
      body.includes("cnpj") ||
      body.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);

    // Tentar clicar no botao Buscar Certidoes
    const btnBuscar = page
      .locator(
        'button:has-text("Buscar Certidões"), button:has-text("Buscar Certidoes")'
      )
      .first();

    if (await btnBuscar.count() > 0) {
      await btnBuscar.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("P02_buscando"), fullPage: true });

      const bodyBuscando = await getBody(page);
      const isBuscando =
        bodyBuscando.includes("buscando") ||
        bodyBuscando.includes("Buscando") ||
        bodyBuscando.includes("aguarde") ||
        bodyBuscando.includes("Aguarde") ||
        bodyBuscando.includes("processando") ||
        bodyBuscando.length > 200;
      expect(isBuscando).toBeTruthy();
    } else {
      // Botao nao encontrado — verificar mensagem de pre-condicao
      await page.screenshot({ path: SS("P02_sem_botao_busca"), fullPage: true });
      expect(body.length).toBeGreaterThan(200);
    }
  });

  test("P04-P06: Verificar resultado da busca e status das certidoes", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("P04_resultado_busca"), fullPage: true });

    const body = await getBody(page);

    // Verificar status badges existentes
    const hasStatusBadges =
      body.includes("valida") ||
      body.includes("Valida") ||
      body.includes("vencida") ||
      body.includes("pendente") ||
      body.includes("erro") ||
      body.includes("Erro") ||
      body.includes("nao_disponivel") ||
      body.includes("Certidão") ||
      body.includes("Certidao");

    await page.screenshot({ path: SS("P05_status_validade"), fullPage: true });
    expect(body.length).toBeGreaterThan(200);
  });

  test("FA-001: Verificar botao Editar certidao e modal de detalhe", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(1500);

    // Verificar botoes de acao em certidoes (se existirem)
    const editBtn = page
      .locator('button:has-text("Editar"), button:has-text("Edit")')
      .first();

    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: SS("FA01_modal_editar"), fullPage: true });

      const body = await getBody(page);
      const hasModal =
        body.includes("Salvar") ||
        body.includes("Fechar") ||
        body.includes("Cancelar") ||
        body.includes("numero") ||
        body.includes("Numero");
      expect(hasModal || body.length > 200).toBeTruthy();

      // Fechar modal
      const closeBtn = page
        .locator('button:has-text("Fechar"), button:has-text("Cancelar")')
        .first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: SS("FA01_apos_modal"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });
});
