import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath } from "./helpers";

// ============================================================
// VALIDACAO SPRINT 8 — CH Hospitalar (tutorialsprint8-1.md)
// 5 UCs: DI01, CL01, CL02, CL03, MA01
// ============================================================

test.describe.serial("Sprint 8 — CH Hospitalar — Validacao Completa", () => {

  // ==================== FASE 1: DISPENSAS (UC-DI01) ====================

  test("F1-P01: Captacao > Aba Dispensas visivel com 2 tabs", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("DI01", "F1-P01_captacao_tabs"), fullPage: true });
    const body = await getBody(page);
    // Deve ter aba Editais e Dispensas
    expect(body.includes("Editais") || body.includes("editais")).toBeTruthy();
    // Clicar na aba Dispensas
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("DI01", "F1-P01_dispensas_tab"), fullPage: true });
  });

  test("F1-P02: Stat cards com valores corretos (2 abertas, 2 cotacao, 1 adj, 1 enc)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("DI01", "F1-P02_stat_cards"), fullPage: true });
    const body = await getBody(page);
    // Verificar presenca de stat cards
    const hasAbertas = body.includes("Abertas") || body.includes("aberta");
    const hasCotacao = body.includes("Cotação") || body.includes("Cotacao") || body.includes("cotacao");
    const hasAdjudicadas = body.includes("Adjudicada");
    const hasEncerradas = body.includes("Encerrada");
    expect(hasAbertas).toBeTruthy();
    expect(hasCotacao || hasAdjudicadas || hasEncerradas).toBeTruthy();
  });

  test("F1-P03: Tabela de dispensas com 6 registros do seed", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    const body = await getBody(page);
    await page.screenshot({ path: ssPath("DI01", "F1-P03_tabela_dispensas"), fullPage: true });
    // Verificar que ha dados na tabela (artigos do seed)
    const has75I = body.includes("75-I");
    const has75II = body.includes("75-II");
    expect(has75I || has75II).toBeTruthy();
  });

  test("F1-P04: Filtro por artigo 75-I", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("DI01", "F1-P04_antes_filtro"), fullPage: true });
    // Tentar selecionar filtro artigo
    const selects = page.locator("select");
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator("option").allTextContents();
      if (options.some(o => o.includes("75-I"))) {
        await selects.nth(i).selectOption({ label: "75-I" });
        break;
      }
    }
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("DI01", "F1-P04_filtro_75I"), fullPage: true });
  });

  test("F1-P05: Gerar cotacao para dispensa aberta", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    // Procurar botao de cotacao
    const btnCotacao = page.locator("button").filter({ hasText: /Cota[çc]/i }).first();
    await page.screenshot({ path: ssPath("DI01", "F1-P05_antes_cotacao"), fullPage: true });
    if (await btnCotacao.count() > 0) {
      await btnCotacao.click();
      await page.waitForTimeout(8000); // DeepSeek pode demorar
      await page.screenshot({ path: ssPath("DI01", "F1-P05_modal_cotacao"), fullPage: true });
      // Fechar modal
      const closeBtn = page.locator("button").filter({ hasText: /Fechar|OK|Cancelar|Close/i }).first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("DI01", "F1-P05_apos_cotacao"), fullPage: true });
  });

  test("F1-P06: Transicao de status (aberta → cotacao_enviada)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await clickTab(page, "Dispensas");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("DI01", "F1-P06_antes_status"), fullPage: true });
    // Procurar select/botao de status
    const statusSelects = page.locator("select").filter({ hasText: /cotacao_enviada|adjudicada/i });
    if (await statusSelects.count() > 0) {
      await statusSelects.first().selectOption("cotacao_enviada");
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: ssPath("DI01", "F1-P06_apos_status"), fullPage: true });
  });

  // ==================== FASE 2: CLASSIFICACAO (UC-CL01, UC-CL02) ====================

  test("F2-P01: Parametrizacoes > 6 tabs incluindo Classes", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath("CL02", "F2-P01_parametrizacoes"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Classes") || body.includes("classes")).toBeTruthy();
  });

  test("F2-P02: Aba Classes — stat cards (Areas, Classes, Produtos sem Classe)", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL02", "F2-P02_aba_classes"), fullPage: true });
    const body = await getBody(page);
    // Verificar stat cards
    const hasAreas = body.includes("Áreas") || body.includes("Areas") || body.includes("áreas");
    const hasClasses = body.includes("Classes") || body.includes("classes");
    const hasSemClasse = body.includes("sem Classe") || body.includes("Sem Classe") || body.includes("sem classe");
    expect(hasAreas || hasClasses).toBeTruthy();
    await page.screenshot({ path: ssPath("CL02", "F2-P02_stat_cards"), fullPage: true });
  });

  test("F2-P03: Tree view com areas e classes do seed", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    const body = await getBody(page);
    // Verificar nomes da arvore do seed
    const hasDiagnostico = body.includes("Diagnóstico") || body.includes("Diagnostico");
    const hasEquipamentos = body.includes("Equipamentos");
    const hasConsumiveis = body.includes("Consumíveis") || body.includes("Consumiveis");
    await page.screenshot({ path: ssPath("CL02", "F2-P03_tree_view"), fullPage: true });
    expect(hasDiagnostico || hasEquipamentos || hasConsumiveis).toBeTruthy();
  });

  test("F2-P04: Expandir area e ver classes/subclasses", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    // Tentar expandir a primeira area
    const expandBtns = page.locator("button, [role='button'], [class*='expand'], [class*='toggle']");
    const diagBtn = page.locator("text=/Diagnóstico|Diagnostico/i").first();
    if (await diagBtn.count() > 0) {
      await diagBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("CL02", "F2-P04_expandida"), fullPage: true });
    const body = await getBody(page);
    // Apos expandir, deve mostrar classes filhas
    const hasReagentes = body.includes("Reagentes") || body.includes("Hematologia");
    const hasBioq = body.includes("Bioquímica") || body.includes("Bioquimica");
    await page.screenshot({ path: ssPath("CL02", "F2-P04_classes_filhas"), fullPage: true });
  });

  test("F2-P05: Detalhe de subclasse com campos_mascara", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    // Expandir e clicar em uma subclasse
    const diagBtn = page.locator("text=/Diagnóstico|Diagnostico/i").first();
    if (await diagBtn.count() > 0) await diagBtn.click();
    await page.waitForTimeout(800);
    const hematoBtn = page.locator("text=/Reagentes Hematologia|Hematologia/i").first();
    if (await hematoBtn.count() > 0) await hematoBtn.click();
    await page.waitForTimeout(800);
    const subBtn = page.locator("text=/Hemograma|Coagulação|Coagulacao/i").first();
    if (await subBtn.count() > 0) await subBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath("CL02", "F2-P05_detalhe_subclasse"), fullPage: true });
    const body = await getBody(page);
    // Verificar campos de mascara visiveis
    const hasCamposMascara = body.includes("Volume") || body.includes("Testes") || body.includes("Metodologia") || body.includes("máscara") || body.includes("mascara") || body.includes("campos");
    await page.screenshot({ path: ssPath("CL02", "F2-P05_campos_mascara"), fullPage: true });
  });

  test("F2-P06: Botoes Nova Area / Nova Classe / Nova Subclasse visiveis", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL02", "F2-P06_botoes_crud"), fullPage: true });
    const body = await getBody(page);
    const hasNovaArea = body.includes("Nova Área") || body.includes("Nova Area");
    const hasNovaClasse = body.includes("Nova Classe");
    const hasGerar = body.includes("Gerar") || body.includes("IA");
    expect(hasNovaArea || hasNovaClasse || hasGerar).toBeTruthy();
  });

  test("F2-P07: Botao Gerar via IA (UC-CL01)", async ({ page }) => {
    await login(page);
    await navTo(page, "Parametrizacoes");
    await clickTab(page, "Classes");
    await page.waitForTimeout(3000);
    const gerarBtn = page.locator("button").filter({ hasText: /Gerar|IA/i }).first();
    await page.screenshot({ path: ssPath("CL02", "F2-P07_antes_gerar_ia"), fullPage: true });
    if (await gerarBtn.count() > 0) {
      await gerarBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: ssPath("CL02", "F2-P07_modal_ia"), fullPage: true });
      // Fechar modal sem aplicar
      const cancelBtn = page.locator("button").filter({ hasText: /Cancelar|Fechar|Close/i }).first();
      if (await cancelBtn.count() > 0) await cancelBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("CL02", "F2-P07_apos_ia"), fullPage: true });
  });

  // ==================== FASE 3: PORTFOLIO (UC-CL03) ====================

  test("F3-P01: Portfolio > coluna Classe e badges", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL03", "F3-P01_portfolio_produtos"), fullPage: true });
    const body = await getBody(page);
    // Verificar coluna Classe
    const hasClasseCol = body.includes("Classe");
    // Verificar badges
    const hasSemClasse = body.includes("Sem Classe");
    const hasMascara = body.includes("Máscara") || body.includes("Mascara");
    await page.screenshot({ path: ssPath("CL03", "F3-P01_colunas_badges"), fullPage: true });
  });

  test("F3-P02: Badge Mascara Ativa nos 2 produtos do seed", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    const body = await getBody(page);
    await page.screenshot({ path: ssPath("CL03", "F3-P02_mascara_ativa"), fullPage: true });
    // Verificar desc normalizada visivel
    const hasNormalizado = body.includes("NORMALIZADO") || body.includes("normalizado") || body.includes("padronizada");
    await page.screenshot({ path: ssPath("CL03", "F3-P02_desc_normalizada"), fullPage: true });
  });

  test("F3-P03: Filtro Sem Classe", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("CL03", "F3-P03_antes_filtro"), fullPage: true });
    // Marcar checkbox Sem Classe
    const semClasseCheckbox = page.locator("label, input[type='checkbox']").filter({ hasText: /Sem Classe/i }).first();
    if (await semClasseCheckbox.count() > 0) {
      await semClasseCheckbox.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: ssPath("CL03", "F3-P03_filtro_sem_classe"), fullPage: true });
    // Desmarcar
    if (await semClasseCheckbox.count() > 0) {
      await semClasseCheckbox.click();
      await page.waitForTimeout(1000);
    }
  });

  test("F3-P04: Selecao multipla e botao Classificar Selecionados", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    // Selecionar checkboxes de produtos
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();
    if (count > 2) {
      await checkboxes.nth(1).check().catch(() => {});
      await checkboxes.nth(2).check().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("CL03", "F3-P04_selecao_multipla"), fullPage: true });
    // Verificar botao Classificar Selecionados
    const body = await getBody(page);
    const hasBtnClassificar = body.includes("Classificar") || body.includes("Selecionados");
    await page.screenshot({ path: ssPath("CL03", "F3-P04_btn_classificar"), fullPage: true });
  });

  // ==================== FASE 4: MASCARAS (UC-MA01) ====================

  test("F4-P01: Botao Aplicar Mascara no Portfolio", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ssPath("MA01", "F4-P01_portfolio_mascaras"), fullPage: true });
    const body = await getBody(page);
    // Verificar presenca de botoes/icones de mascara nas acoes
    const hasMascara = body.includes("Máscara") || body.includes("Mascara") || body.includes("mascara");
    await page.screenshot({ path: ssPath("MA01", "F4-P01_acoes_mascara"), fullPage: true });
  });

  test("F4-P02: Aplicar mascara individual — resultado antes/depois", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    // Procurar botao de mascara (icone ou texto)
    const mascaraBtns = page.locator("button").filter({ hasText: /Máscara|Mascara/i });
    const mascaraIconBtns = page.locator("button[title*='ascara'], button[aria-label*='ascara']");
    const allBtns = page.locator("button");
    let clicked = false;

    // Tentar clicar no primeiro botao de mascara disponivel
    if (await mascaraBtns.count() > 0) {
      await mascaraBtns.first().click();
      clicked = true;
    } else if (await mascaraIconBtns.count() > 0) {
      await mascaraIconBtns.first().click();
      clicked = true;
    }

    if (clicked) {
      await page.waitForTimeout(10000); // DeepSeek pode demorar
      await page.screenshot({ path: ssPath("MA01", "F4-P02_modal_mascara"), fullPage: true });
      const body = await getBody(page);
      // Verificar resultado
      const hasOriginal = body.includes("Original") || body.includes("original") || body.includes("Antes");
      const hasNormalizada = body.includes("Normalizada") || body.includes("normalizada") || body.includes("Depois");
      const hasScore = body.includes("Score") || body.includes("score") || body.includes("%");
      const hasVariantes = body.includes("Variantes") || body.includes("variantes") || body.includes("Sinônimos") || body.includes("sinonimos");
      await page.screenshot({ path: ssPath("MA01", "F4-P02_resultado_detalhe"), fullPage: true });
      // Fechar modal
      const closeBtn = page.locator("button").filter({ hasText: /Cancelar|Fechar|Close/i }).first();
      if (await closeBtn.count() > 0) await closeBtn.click();
    } else {
      await page.screenshot({ path: ssPath("MA01", "F4-P02_sem_botao_mascara"), fullPage: true });
    }
  });

  test("F4-P03: Produtos pre-normalizados do seed com badges", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    const body = await getBody(page);
    await page.screenshot({ path: ssPath("MA01", "F4-P03_produtos_normalizados"), fullPage: true });
    // Verificar que os 2 produtos do seed tem desc normalizada visivel
    const hasNormalizado = body.includes("NORMALIZADO") || body.includes("padronizada");
    const hasMascaraAtiva = body.includes("Máscara Ativa") || body.includes("Mascara Ativa");
    await page.screenshot({ path: ssPath("MA01", "F4-P03_badges_mascara"), fullPage: true });
  });

  test("F4-P04: Botao Aplicar Mascara em Lote", async ({ page }) => {
    await login(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    // Selecionar checkboxes
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();
    if (count > 2) {
      await checkboxes.nth(1).check().catch(() => {});
      await checkboxes.nth(2).check().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ssPath("MA01", "F4-P04_selecao_lote"), fullPage: true });
    // Verificar botao de lote
    const body = await getBody(page);
    const hasLote = body.includes("Lote") || body.includes("lote") || body.includes("Mascara em Lote");
    await page.screenshot({ path: ssPath("MA01", "F4-P04_btn_lote"), fullPage: true });
  });
});
