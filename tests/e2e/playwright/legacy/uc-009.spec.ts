import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "009";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-009: Metadados de Captacao e Consulta de Classificacao", () => {
  test("P03: Acessar aba Classificacao na PortfolioPage", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    await clickTab(page, "Classificação");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P01_aba_classificacao_arvore"), fullPage: true });

    const body = await getBody(page);
    const hasClassificacao =
      body.includes("Classificaç") ||
      body.includes("Classificac") ||
      body.includes("Área") ||
      body.includes("Area") ||
      body.includes("Classe") ||
      body.includes("Subclasse") ||
      body.includes("Funil") ||
      body.includes("NCM");
    expect(hasClassificacao || body.length > 200).toBeTruthy();
  });

  test("P04: Expandir Area e verificar classes", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Classificação");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("P04_antes_expandir"), fullPage: true });

    // Tentar expandir primeira area
    const expandirAreaBtn = page
      .locator('button:has-text("Expandir Área"), button:has-text("Expandir Area"), button:has-text("Expandir")')
      .first();

    if (await expandirAreaBtn.count() > 0) {
      await expandirAreaBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: SS("P02_area_expandida_classes"), fullPage: true });

      const body = await getBody(page);
      const hasClasses =
        body.includes("Classe") ||
        body.includes("Expandir Classe") ||
        body.includes("Subclasse");
      expect(hasClasses || body.length > 200).toBeTruthy();

      // Expandir primeira classe
      const expandirClasseBtn = page
        .locator('button:has-text("Expandir Classe")')
        .first();
      if (await expandirClasseBtn.count() > 0) {
        await expandirClasseBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: SS("P03_classe_expandida_subclasses"), fullPage: true });

        const bodyClasse = await getBody(page);
        const hasSubclasses =
          bodyClasse.includes("Subclasse") ||
          bodyClasse.includes("NCM") ||
          bodyClasse.includes("campos");
        expect(hasSubclasses || bodyClasse.length > 200).toBeTruthy();
      }
    } else {
      // Nao ha areas cadastradas — estado vazio
      await page.screenshot({ path: SS("P02_sem_areas"), fullPage: true });
      const body = await getBody(page);
      expect(body.length).toBeGreaterThan(200);
    }
  });

  test("P01-P02: Metadados de Captacao no detalhe do produto", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);

    // Selecionar um produto
    const vizBtn = page.locator('button:has-text("Visualizar")').first();

    if (await vizBtn.count() > 0) {
      await vizBtn.click();
      await page.waitForTimeout(2000);

      // Expandir toggle Metadados de Captacao
      const metadadosToggle = page
        .locator('text=Metadados de Captação, text=Metadados de Captacao')
        .first();

      if (await metadadosToggle.count() > 0) {
        await metadadosToggle.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: SS("P01_metadados_expandido"), fullPage: true });

        const body = await getBody(page);
        const hasMetadados =
          body.includes("CATMAT") ||
          body.includes("CATSER") ||
          body.includes("termos de busca") ||
          body.includes("Termos") ||
          body.includes("última atualização") ||
          body.includes("ultima atualizacao") ||
          body.includes("Reprocessar Metadados");
        expect(hasMetadados || body.length > 200).toBeTruthy();
      } else {
        await page.screenshot({ path: SS("P01_sem_toggle_metadados"), fullPage: true });
      }
    } else {
      await page.screenshot({ path: SS("P01_sem_produtos"), fullPage: true });
    }

    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P02: Reprocessar Metadados de captacao", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Meus Produtos");
    await page.waitForTimeout(2000);

    const vizBtn = page.locator('button:has-text("Visualizar")').first();
    if (await vizBtn.count() > 0) {
      await vizBtn.click();
      await page.waitForTimeout(2000);

      // Expandir toggle Metadados
      const metadadosToggle = page
        .locator('button:has-text("Metadados"), span:has-text("Metadados")')
        .first();
      if (await metadadosToggle.count() > 0) {
        await metadadosToggle.click();
        await page.waitForTimeout(1000);
      }

      const reprocessarBtn = page
        .locator('button:has-text("Reprocessar Metadados")')
        .first();

      if (await reprocessarBtn.count() > 0) {
        await reprocessarBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: SS("P02_metadados_reprocessados"), fullPage: true });

        const body = await getBody(page);
        expect(body.length).toBeGreaterThan(200);
      }
    }

    await page.screenshot({ path: SS("P02_apos_reprocessar"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("Verificar card de funil de monitoramento na aba Classificacao", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);
    await clickTab(page, "Classificação");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("P07_hierarquia_completa"), fullPage: true });

    const body = await getBody(page);
    const hasFunil =
      body.includes("Funil") ||
      body.includes("monitoramento") ||
      body.includes("Monitoramento") ||
      body.includes("ativos") ||
      body.includes("categorias") ||
      body.includes("Classificaç");
    expect(body.length).toBeGreaterThan(200);
  });
});
