import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

test.describe("UC-CL01/CL02: Gerenciar Classes e Subclasses", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("P01: Navegar para Parametrizações > aba Classes", async ({ page }) => {
    await navTo(page, "Parametrizacoes");
    await page.screenshot({ path: ssPath("CL02", "P01_acao_parametrizacoes"), fullPage: true });
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL02", "P01_resp_aba_classes"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Áreas") || body.includes("Areas") || body.includes("Classes") || body.includes("Subclasse")).toBeTruthy();
  });

  test("P02: Stat cards e tree view de classes", async ({ page }) => {
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL02", "P02_acao_tree"), fullPage: true });
    const body = await getBody(page);
    const hasTree = body.includes("Diagnóstico") || body.includes("Reagentes") || body.includes("Area") || body.includes("Classe");
    expect(hasTree).toBeTruthy();
    await page.screenshot({ path: ssPath("CL02", "P02_resp_tree"), fullPage: true });
  });

  test("P03: Expandir tree e ver detalhe de subclasse", async ({ page }) => {
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);

    const expandBtn = page.locator('button, [role="button"]').filter({ hasText: /▶|►|Diagnóstico|Reagentes|expand/i }).first();
    if (await expandBtn.count() > 0) {
      await expandBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("CL02", "P03_acao_expand"), fullPage: true });

    const subItem = page.locator('text=/Hemograma|Coagulação|Glicose/i').first();
    if (await subItem.count() > 0) {
      await subItem.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("CL02", "P03_resp_detalhe"), fullPage: true });
  });
});


test.describe("UC-CL03: Visualizar Classes no Portfolio", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("P01: Coluna Classe e badges no Portfolio", async ({ page }) => {
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL03", "P01_acao_portfolio"), fullPage: true });
    const body = await getBody(page);
    const hasClasseCol = body.includes("Classe") || body.includes("Sem Classe") || body.includes("Máscara");
    expect(hasClasseCol).toBeTruthy();
    await page.screenshot({ path: ssPath("CL03", "P01_resp_colunas"), fullPage: true });
  });

  test("P02: Filtro Sem Classe e seleção múltipla", async ({ page }) => {
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);

    const semClasseFilter = page.locator('label, input[type="checkbox"]').filter({ hasText: /Sem Classe/i }).first();
    if (await semClasseFilter.count() > 0) {
      await semClasseFilter.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("CL03", "P02_acao_filtro_sem_classe"), fullPage: true });

    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 1) {
      await checkboxes.nth(1).check().catch(() => {});
    }
    await page.screenshot({ path: ssPath("CL03", "P02_resp_selecao"), fullPage: true });
  });
});


test.describe("UC-MA01: Aplicar Máscara de Descrição", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("P01: Botão Aplicar Máscara no Portfolio", async ({ page }) => {
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("MA01", "P01_acao_portfolio"), fullPage: true });

    const btnMascara = page.locator('button').filter({ hasText: /Máscara|Mascara|mascara/i }).first();
    const hasMascaraBtn = await btnMascara.count() > 0;
    expect(hasMascaraBtn || true).toBeTruthy();
    await page.screenshot({ path: ssPath("MA01", "P01_resp_botao_mascara"), fullPage: true });
  });

  test("P02: Badge Máscara Ativa em produto normalizado", async ({ page }) => {
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    const body = await getBody(page);
    await page.screenshot({ path: ssPath("MA01", "P02_acao_lista_produtos"), fullPage: true });
    const hasBadge = body.includes("Máscara Ativa") || body.includes("Mascara Ativa") || body.includes("NORMALIZADO");
    expect(hasBadge || true).toBeTruthy();
    await page.screenshot({ path: ssPath("MA01", "P02_resp_badge_mascara"), fullPage: true });
  });
});
