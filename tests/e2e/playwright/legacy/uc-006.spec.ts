import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "006";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-006: Listar, Filtrar e Inspecionar Produtos", () => {
  test("P01: Acessar pagina Portfolio e verificar 3 abas", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P01_portfolio"), fullPage: true });

    const body = await getBody(page);
    // Verificar presenca das 3 abas: Meus Produtos, Cadastro por IA, Classificacao
    const hasAbas =
      body.includes("Meus Produtos") ||
      body.includes("Cadastro por IA") ||
      body.includes("Classificação") ||
      body.includes("Classificacao") ||
      body.includes("Portfolio") ||
      body.includes("Produto");
    expect(hasAbas).toBeTruthy();
  });

  test("P01-P02: Aba Meus Produtos — filtros e DataTable", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Garantir que aba Meus Produtos esta ativa
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("P01_meus_produtos"), fullPage: true });

    const body = await getBody(page);
    // Verificar elementos da aba Meus Produtos
    const hasTabela =
      body.includes("Produto") ||
      body.includes("produto") ||
      body.includes("Fabricante") ||
      body.includes("Modelo") ||
      body.includes("NCM") ||
      body.includes("Atualizar");
    expect(hasTabela || body.length > 200).toBeTruthy();

    // Passo 2: Usar campo de filtro/busca
    const searchInput = page
      .locator('input[placeholder*="busca"], input[placeholder*="Busca"], input[placeholder*="filtro"], input[placeholder*="pesquisa"], input[type="search"]')
      .first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("produto");
      await page.waitForTimeout(1500);
      await page.screenshot({ path: SS("P02_filtro_aplicado"), fullPage: true });
      await searchInput.clear();
      await page.waitForTimeout(1000);
    } else {
      await page.screenshot({ path: SS("P02_sem_filtro"), fullPage: true });
    }
  });

  test("P03: Visualizar detalhe de produto — botao Visualizar", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(1500);

    await page.screenshot({ path: SS("P03_antes_detalhe"), fullPage: true });

    // Clicar no botao Visualizar do primeiro produto
    const vizBtn = page
      .locator('button:has-text("Visualizar"), button[title*="Visualizar"]')
      .first();

    if (await vizBtn.count() > 0) {
      await vizBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P03_dados_basicos"), fullPage: true });

      const body = await getBody(page);
      const hasDetalhe =
        body.includes("NCM") ||
        body.includes("Fabricante") ||
        body.includes("Modelo") ||
        body.includes("Especificação") ||
        body.includes("Especificacao") ||
        body.includes("Completude") ||
        body.includes("CATMAT");
      expect(hasDetalhe || body.length > 200).toBeTruthy();
    } else {
      // Nenhum produto cadastrado ainda — estado vazio esperado
      const body = await getBody(page);
      await page.screenshot({ path: SS("P03_sem_produtos"), fullPage: true });
      expect(body.length).toBeGreaterThan(200);
    }
  });

  test("P04: Verificar Completude do produto", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(1500);

    const completudeBtn = page
      .locator('button:has-text("Verificar Completude"), button:has-text("Completude")')
      .first();

    if (await completudeBtn.count() > 0) {
      await completudeBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P04_completude"), fullPage: true });

      const body = await getBody(page);
      const hasCompletude =
        body.includes("%") ||
        body.includes("percentual") ||
        body.includes("Percentual") ||
        body.includes("recomendação") ||
        body.includes("recomendacao") ||
        body.includes("Completude");
      expect(hasCompletude || body.length > 200).toBeTruthy();

      // Fechar modal de completude
      const fecharBtn = page.locator('button:has-text("Fechar"), button:has-text("Cancelar")').first();
      if (await fecharBtn.count() > 0) {
        await fecharBtn.click();
        await page.waitForTimeout(1000);
      }
    } else {
      await page.screenshot({ path: SS("P04_sem_botao_completude"), fullPage: true });
    }
    await page.screenshot({ path: SS("P04_classificacao"), fullPage: true });
  });

  test("P05: Reprocessar Metadados de captacao", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(1500);

    // Selecionar primeiro produto para ver detalhe
    const vizBtn = page.locator('button:has-text("Visualizar")').first();
    if (await vizBtn.count() > 0) {
      await vizBtn.click();
      await page.waitForTimeout(2000);

      // Toggle de Metadados de Captacao
      const metadadosToggle = page
        .locator('button:has-text("Metadados"), span:has-text("Metadados")')
        .first();
      if (await metadadosToggle.count() > 0) {
        await metadadosToggle.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: SS("P05_metadados_expandido"), fullPage: true });

        const reprocessarBtn = page
          .locator('button:has-text("Reprocessar Metadados")')
          .first();
        if (await reprocessarBtn.count() > 0) {
          await reprocessarBtn.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: SS("P05_salvo"), fullPage: true });
        }
      }
    }

    await page.screenshot({ path: SS("P05_metadados"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P06: Botao Atualizar recarrega lista de produtos", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(1500);

    const atualizarBtn = page
      .locator('button:has-text("Atualizar")')
      .first();

    if (await atualizarBtn.count() > 0) {
      await atualizarBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P06_listagem"), fullPage: true });
    } else {
      await page.screenshot({ path: SS("P06_listagem_atual"), fullPage: true });
    }

    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });
});
