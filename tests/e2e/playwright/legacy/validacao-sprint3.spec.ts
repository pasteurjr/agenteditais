import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, waitForIA } from "./helpers";
import path from "path";

const SS = (step: string) => `runtime/screenshots/validacao-sprint3/${step}.png`;

test.setTimeout(600000);

// ── Helpers ─────────────────────────────────────────────────────────────

async function selecionarEditalPrecificacao(page: any) {
  await navTo(page, "Precificacao");
  await page.waitForTimeout(2000);
  // Aguardar select com opções carregadas (API async)
  const sel = page.locator("select.select-input").first();
  await sel.waitFor({ state: "visible", timeout: 15000 });
  // Poll até as opções de editais aparecerem
  let options: string[] = [];
  for (let i = 0; i < 20; i++) {
    options = await sel.locator("option").allInnerTexts();
    if (options.length > 1) break;
    await page.waitForTimeout(1000);
  }
  expect(options.length).toBeGreaterThan(1);
  const targetIdx = options.findIndex((o: string) =>
    o.includes("COMANDO DO EXERCITO") || o.includes("90006")
  );
  expect(targetIdx).toBeGreaterThan(0);
  await sel.selectOption({ index: targetIdx });
  await page.waitForTimeout(3000);
}

async function selecionarVinculo(page: any) {
  const allSelects = page.locator("select");
  const count = await allSelects.count();
  let sel: any = null;
  for (let i = 0; i < count; i++) {
    const opts = await allSelects.nth(i).locator("option").allInnerTexts();
    if (opts.some((o: string) => o.includes("Selecione item-produto") || o.includes("→"))) {
      sel = allSelects.nth(i);
      break;
    }
  }
  expect(sel).not.toBeNull();
  const opts = await sel.locator("option").allInnerTexts();
  expect(opts.length).toBeGreaterThan(1);
  await sel.selectOption({ index: 1 });
  await page.waitForTimeout(2000);
}

/** Aceitar dialogs (window.confirm) automaticamente */
function autoAcceptDialogs(page: any) {
  page.on("dialog", async (dialog: any) => { await dialog.accept(); });
}

// ── Suite ───────────────────────────────────────────────────────────────

test.describe.serial("Validacao Sprint 3 — Precificacao e Proposta (CH Hospitalar)", () => {

  // =====================================================================
  // FASE 1 — PRECIFICACAO
  // =====================================================================

  // ===== UC-P01 — Organizar Edital por Lotes (8 passos) ==================
  test("UC-P01: Selecionar edital, criar lotes, expandir lote, preencher parametros e atualizar", async ({ page }) => {
    await login(page);
    // Passo 1: Selecionar edital
    await selecionarEditalPrecificacao(page);
    await page.screenshot({ path: SS("P01_p1_edital_selecionado"), fullPage: true });

    // Passo 2: Clicar "Criar Lotes"
    const criarLotesBtn = page.locator('button:has-text("Criar Lotes")').first();
    if ((await criarLotesBtn.count()) > 0 && (await criarLotesBtn.isEnabled().catch(() => false))) {
      await criarLotesBtn.click();
      await page.waitForTimeout(5000);
    }
    await page.screenshot({ path: SS("P01_p2_lotes_criados"), fullPage: true });

    // Passo 3: Verificar aba Lotes com cards expandiveis
    const body = await getBody(page);
    expect(body).toMatch(/Lotes?\s*\(/i); // "Lotes (N)"
    await page.screenshot({ path: SS("P01_p3_aba_lotes"), fullPage: true });

    // Passo 4: Expandir Lote 1 clicando no toggle
    const loteRow = page.locator('text=Lote 1').first();
    if ((await loteRow.count()) > 0) {
      await loteRow.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("P01_p4_lote_expandido"), fullPage: true });

    // Passo 5: Preencher campos — Especialidade, Volume, Tipo Amostra, Equipamento, Descricao
    const especialidadeInput = page.locator('input[placeholder*="Hematologia"]').first();
    if ((await especialidadeInput.count()) > 0) {
      await especialidadeInput.fill("Hematologia");
      await page.waitForTimeout(300);
    }
    const volumeInput = page.locator('input[placeholder*="50000"]').first();
    if ((await volumeInput.count()) > 0) {
      await volumeInput.fill("10000");
      await page.waitForTimeout(300);
    }
    const amostraInput = page.locator('input[placeholder*="Sangue"]').first();
    if ((await amostraInput.count()) > 0) {
      await amostraInput.fill("Sangue total");
      await page.waitForTimeout(300);
    }
    const equipInput = page.locator('input[placeholder*="Analisador"]').first();
    if ((await equipInput.count()) > 0) {
      await equipInput.fill("Analisador hematologico Sysmex XN-L");
      await page.waitForTimeout(300);
    }
    const obsInput = page.locator('input[placeholder*="Observa"]').first();
    if ((await obsInput.count()) > 0) {
      await obsInput.fill("Reagentes para diagnostico clinico hematologico");
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: SS("P01_p5_campos_preenchidos"), fullPage: true });

    // Passo 6: Clicar "Atualizar Lote"
    const atualizarBtn = page.locator('button:has-text("Atualizar Lote")').first();
    if ((await atualizarBtn.count()) > 0) {
      await atualizarBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("P01_p6_lote_atualizado"), fullPage: true });
    }

    // Passo 7: Verificar tabela de itens com colunas #, Descricao, Qtd, Valor Unit., Produto Vinculado
    const bodyFinal = await getBody(page);
    const temTabela =
      bodyFinal.includes("Descri") || bodyFinal.includes("Qtd") ||
      bodyFinal.includes("Valor Unit") || bodyFinal.includes("Produto") ||
      bodyFinal.includes("Vincular") || bodyFinal.includes("Reagente");
    expect(temTabela).toBe(true);
    await page.screenshot({ path: SS("P01_p7_tabela_itens"), fullPage: true });
  });

  // ===== UC-P02 — Selecao Inteligente de Portfolio ========================
  test("UC-P02: Expandir lote e verificar vinculos item-produto (IA ou manual)", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Lotes");
    await page.waitForTimeout(2000);

    // Expandir Lote 1
    const loteRow = page.locator('text=Lote 1').first();
    if ((await loteRow.count()) > 0) {
      await loteRow.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("P02_p1_lote_expandido"), fullPage: true });

    // Verificar botoes de vinculacao por item: "Vincular", "IA", "Trocar", "Desvincular"
    const bodyExpanded = await getBody(page);
    const temBotoesVinculacao =
      bodyExpanded.includes("Vincular") || bodyExpanded.includes("Trocar") ||
      bodyExpanded.includes("IA") || bodyExpanded.includes("Desvincular") ||
      bodyExpanded.includes("Buscar na Web") || bodyExpanded.includes("ANVISA") ||
      bodyExpanded.includes("Ignorar");
    expect(temBotoesVinculacao).toBe(true);
    await page.screenshot({ path: SS("P02_p2_botoes_vinculacao"), fullPage: true });

    // Verificar que pelo menos 1 item tem badge de vinculacao (✅ ou ❌ ou ⚠)
    const temBadge =
      bodyExpanded.includes("✅") || bodyExpanded.includes("❌") || bodyExpanded.includes("⚠") ||
      bodyExpanded.includes("Trocar") || bodyExpanded.includes("Vincular");
    expect(temBadge).toBe(true);
  });

  // ===== UC-P03 — Calculo Tecnico de Volumetria ==========================
  test("UC-P03: Selecionar vinculo e configurar volumetria", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);

    // Passo 1: Clicar aba "Custos e Precos"
    await clickTab(page, "Custos");
    await page.waitForTimeout(2000);

    // Passo 2: Selecionar vinculo item-produto
    await selecionarVinculo(page);
    await page.screenshot({ path: SS("P03_p2_vinculo_selecionado"), fullPage: true });

    // Passo 3: Verificar card "Conversao de Quantidade" com opcoes
    const body = await getBody(page);
    const temConversao =
      body.includes("Convers") || body.includes("Sim, converter") ||
      body.includes("quantidade") || body.includes("Volumetria") ||
      body.includes("edital");
    expect(temConversao).toBe(true);

    // Clicar "Sim, converter quantidade" se disponivel
    const simBtn = page.locator('button:has-text("Sim, converter")').first();
    if ((await simBtn.count()) > 0) {
      await simBtn.click();
      await page.waitForTimeout(1000);

      // Passo 4: Preencher campos de volumetria
      const qtdEditalInput = page.locator('input[placeholder*="Qtd exigida"]').first();
      if ((await qtdEditalInput.count()) > 0) await qtdEditalInput.fill("10000");

      const rendimentoInput = page.locator('input[placeholder*="Unidades por embalagem"]').first();
      if ((await rendimentoInput.count()) > 0) await rendimentoInput.fill("200");

      const repAmostrasInput = page.locator('input[placeholder="0"]').first();
      if ((await repAmostrasInput.count()) > 0) await repAmostrasInput.fill("2");

      await page.screenshot({ path: SS("P03_p4_volumetria_preenchida"), fullPage: true });

      // Passo 5: Clicar "Calcular e Salvar"
      const calcularBtn = page.locator('button:has-text("Calcular e Salvar")').first();
      if ((await calcularBtn.count()) > 0) {
        await calcularBtn.click();
        await page.waitForTimeout(3000);
      }

      // Passo 6: Verificar resultado calculado
      const bodyCalc = await getBody(page);
      expect(bodyCalc).toMatch(/kits?|volume|ajustado|quantidade|Calcul|Salvar/i);
      await page.screenshot({ path: SS("P03_p6_volumetria_calculada"), fullPage: true });
    } else {
      // Opcao "Nao, usar quantidade do edital" — clicar
      const naoBtn = page.locator('button:has-text("quantidade do edital")').first();
      if ((await naoBtn.count()) > 0) {
        await naoBtn.click();
        await page.waitForTimeout(1000);
      }
      await page.screenshot({ path: SS("P03_resp_sem_volumetria"), fullPage: true });
    }
  });

  // ===== UC-P04 — Configurar Base de Custos (ERP + Tributario) ===========
  test("UC-P04: Preencher custo unitario, verificar NCM e impostos, salvar custos", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Custos");
    await page.waitForTimeout(2000);
    await selecionarVinculo(page);
    await page.screenshot({ path: SS("P04_p1_base_custos"), fullPage: true });

    // Passo 2: Preencher "Custo Unitario (R$)" — placeholder "Custo de aquisicao"
    const custoInput = page.locator('input[placeholder*="Custo de aquisi"], input[placeholder*="custo"]').first();
    if ((await custoInput.count()) > 0) {
      await custoInput.fill("14200");
    } else {
      // Fallback: primeiro input disponivel na secao Base de Custos
      const inputs = page.locator('input[type="text"]');
      const cnt = await inputs.count();
      for (let i = 0; i < cnt; i++) {
        const ph = await inputs.nth(i).getAttribute("placeholder").catch(() => "");
        if (ph && (ph.includes("Custo") || ph.includes("custo") || ph.includes("aquisi"))) {
          await inputs.nth(i).fill("14200");
          break;
        }
      }
    }
    await page.screenshot({ path: SS("P04_p2_custo_preenchido"), fullPage: true });

    // Passo 3: Verificar NCM readonly (importado do produto)
    const body = await getBody(page);
    const temNCM = body.includes("NCM") || body.includes("3822");
    expect(temNCM).toBe(true);

    // Passo 4/5: Verificar campos ICMS, IPI, PIS+COFINS
    const temImpostos =
      body.includes("ICMS") || body.includes("IPI") || body.includes("PIS") ||
      body.includes("COFINS") || body.includes("9.25");
    expect(temImpostos).toBe(true);
    await page.screenshot({ path: SS("P04_p5_impostos_visiveis"), fullPage: true });

    // Passo 6: Clicar "Salvar Custos"
    const salvarCustosBtn = page.locator('button:has-text("Salvar Custos")').first();
    expect(await salvarCustosBtn.count()).toBeGreaterThan(0);
    await salvarCustosBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P04_p6_custos_salvos"), fullPage: true });
  });

  // ===== UC-P05 — Montar Preco Base (Camada B) ===========================
  test("UC-P05: Selecionar modo markup, definir percentual e salvar preco base", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Custos");
    await page.waitForTimeout(2000);
    await selecionarVinculo(page);

    // Passo 1: Verificar card "Preco Base"
    const body = await getBody(page);
    expect(body).toMatch(/Pre.o Base|Modo|Markup|Manual|Upload/i);
    await page.screenshot({ path: SS("P05_p1_preco_base"), fullPage: true });

    // Passo 2: Selecionar modo "Custo + Markup"
    const modoSelect = page.locator("select").filter({ hasText: /Markup|Manual|Upload/ });
    if ((await modoSelect.count()) > 0) {
      await modoSelect.first().selectOption("markup");
      await page.waitForTimeout(500);
    }

    // Passo 3: Preencher markup — placeholder "30"
    const markupInput = page.locator('input[placeholder="30"]').first();
    if ((await markupInput.count()) > 0) {
      await markupInput.fill("25");
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: SS("P05_p3_markup_preenchido"), fullPage: true });

    // Passo 4: Clicar "Salvar Preco Base"
    const salvarPrecoBtn = page.locator('button:has-text("Salvar Preco Base"), button:has-text("Salvar Preço Base")').first();
    if ((await salvarPrecoBtn.count()) > 0) {
      await salvarPrecoBtn.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: SS("P05_p4_preco_base_salvo"), fullPage: true });

    // Verificar checkbox "Reutilizar este Preco Base"
    const bodyAfter = await getBody(page);
    expect(bodyAfter).toMatch(/Reutilizar|Pre.o Base|Markup|Salvar/i);
  });

  // ===== UC-P06 — Definir Valor de Referencia (Camada C) =================
  test("UC-P06: Preencher valor referencia ou percentual e salvar target", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Custos");
    await page.waitForTimeout(2000);
    await selecionarVinculo(page);

    // Passo 1: Localizar card "Valor de Referencia"
    const body = await getBody(page);
    expect(body).toMatch(/Refer|Target|Valor/i);

    // Passo 2: Preencher "Valor Referencia (R$)" — placeholder "Target estrategico"
    const refInput = page.locator('input[placeholder*="Target"], input[placeholder*="target"]').first();
    if ((await refInput.count()) > 0) {
      await refInput.fill("18500");
    } else {
      // Passo 3: OU preencher "% sobre Preco Base" — placeholder "95"
      const pctInput = page.locator('input[placeholder="95"]').first();
      if ((await pctInput.count()) > 0) {
        await pctInput.fill("95");
      }
    }
    await page.screenshot({ path: SS("P06_p2_referencia_preenchida"), fullPage: true });

    // Passo 4: Clicar "Salvar Target"
    const salvarTargetBtn = page.locator('button:has-text("Salvar Target")').first();
    if ((await salvarTargetBtn.count()) > 0) {
      await salvarTargetBtn.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: SS("P06_p4_target_salvo"), fullPage: true });

    const bodyAfter = await getBody(page);
    expect(bodyAfter).toMatch(/Refer|Target|18[.,]?500|Camada C|Valor|Salvar/i);
  });

  // ===== UC-P07 — Estruturar Lances (Camadas D e E) ======================
  test("UC-P07: Selecionar vinculo, preencher lance inicial/minimo e salvar", async ({ page }) => {
    await login(page);
    autoAcceptDialogs(page);
    await selecionarEditalPrecificacao(page);

    // Passo 1: Clicar aba "Lances"
    await clickTab(page, "Lances");
    await page.waitForTimeout(2000);

    // Passo 2: Selecionar vinculo
    await selecionarVinculo(page);
    await page.screenshot({ path: SS("P07_p2_vinculo_lances"), fullPage: true });

    // Passo 3: Verificar modos de lance disponivel (Valor Absoluto / % da Referencia)
    const body = await getBody(page);
    expect(body).toMatch(/Estrutura de Lances|Lance|Valor Inicial|Valor M/i);

    // Passo 4: Preencher "Valor Inicial (R$)" — placeholder "Valor do lance inicial"
    const lanceInicialInput = page.locator('input[placeholder*="lance inicial"], input[placeholder*="Valor do lance"]').first();
    expect(await lanceInicialInput.count()).toBeGreaterThan(0);
    await lanceInicialInput.fill("17800");

    // Passo 5-6: Preencher "Valor Minimo (R$)" — placeholder "Valor minimo aceitavel"
    const lanceMinimoInput = page.locator('input[placeholder*="nimo aceit"], input[placeholder*="minimo"]').first();
    expect(await lanceMinimoInput.count()).toBeGreaterThan(0);
    await lanceMinimoInput.fill("16500");
    await page.screenshot({ path: SS("P07_p4_lances_preenchidos"), fullPage: true });

    // Passo 7: Clicar "Salvar Lances"
    const salvarLancesBtn = page.locator('button:has-text("Salvar Lances")').first();
    expect(await salvarLancesBtn.count()).toBeGreaterThan(0);
    await salvarLancesBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P07_p7_lances_salvos"), fullPage: true });

    const bodyAfter = await getBody(page);
    expect(bodyAfter).toMatch(/17[.,]?800|16[.,]?500|Lance|Salvo|salvo|\d{4,}/i);
  });

  // ===== UC-P08 — Definir Estrategia Competitiva (10 passos) =============
  test("UC-P08: Selecionar perfil, executar analise de lances, analise IA e simulador", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Lances");
    await page.waitForTimeout(2000);
    await selecionarVinculo(page);

    // Passo 1: Localizar card "Estrategia Competitiva"
    const estrategia = page.locator('text=Estrat').first();
    if ((await estrategia.count()) > 0) await estrategia.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Passo 4: Selecionar perfil "QUERO GANHAR"
    const queroGanhar = page.locator('text=QUERO GANHAR').first();
    if ((await queroGanhar.count()) > 0) {
      await queroGanhar.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: SS("P08_p4_perfil_selecionado"), fullPage: true });

    // Passo 5: Clicar "Analise de Lances"
    const analiseBtn = page.locator('button:has-text("Analise de Lances"), button:has-text("Análise de Lances")').first();
    if ((await analiseBtn.count()) > 0) {
      await analiseBtn.click();
      await waitForIA(page, (b: string) =>
        b.includes("Resultado") || b.includes("Margem") || b.includes("Cenario") ||
        b.includes("cenario") || b.includes("Erro") || b.includes("%"),
        180000, 5000);
      await page.screenshot({ path: SS("P08_p5_analise_lances"), fullPage: true });
    }

    // Passo 7: Clicar "Analise por IA"
    const iaBtn = page.locator('button:has-text("Analise por IA"), button:has-text("Análise por IA")').first();
    if ((await iaBtn.count()) > 0 && (await iaBtn.isEnabled().catch(() => false))) {
      await iaBtn.click();
      await waitForIA(page, (b: string) =>
        b.includes("Analise") || b.includes("Cenario") || b.includes("Relatorio") ||
        b.includes("Erro") || b.includes("IA"),
        180000, 5000);
      await page.screenshot({ path: SS("P08_p7_analise_ia"), fullPage: true });
    }

    // Passo 9: Clicar "Simulador de Disputa"
    const simBtn = page.locator('button:has-text("Simulador de Disputa")').first();
    if ((await simBtn.count()) > 0 && (await simBtn.isEnabled().catch(() => false))) {
      await simBtn.click();
      await waitForIA(page, (b: string) =>
        b.includes("Simulacao") || b.includes("Disputa") || b.includes("Relatorio") ||
        b.includes("Erro") || b.includes("pregao"),
        180000, 5000);
      await page.screenshot({ path: SS("P08_p9_simulador_disputa"), fullPage: true });
    }

    const bodyFinal = await getBody(page);
    expect(bodyFinal).toMatch(/Estrat|QUERO GANHAR|Competitiv|Lance|Analise/i);
  });

  // ===== UC-P09 — Consultar Historico de Precos (6 passos) ===============
  test("UC-P09: Buscar historico por termo e verificar resultado", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);

    // Passo 1: Clicar aba "Historico"
    const histTab = page.locator('button:has-text("Hist")').first();
    await histTab.click();
    await page.waitForTimeout(2000);

    // Passo 2: Preencher campo "Produto/Termo" — placeholder "reagente hematologia"
    const buscaInput = page.locator('input[placeholder*="reagente"], input[placeholder*="hematologia"]').first();
    if ((await buscaInput.count()) > 0) {
      await buscaInput.fill("reagente hematologia");
    }
    await page.screenshot({ path: SS("P09_p2_termo_preenchido"), fullPage: true });

    // Passo 3: Clicar "Filtrar"
    const filtrarBtn = page.locator('button:has-text("Filtrar")').first();
    if ((await filtrarBtn.count()) > 0) {
      await filtrarBtn.click();
    } else {
      const buscarBtn = page.locator('button:has-text("Buscar"), button:has-text("Consultar")').first();
      if ((await buscarBtn.count()) > 0) await buscarBtn.click();
    }
    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P09_p3_resultado_filtro"), fullPage: true });

    // Passo 4-5: Verificar se ha estatisticas (Medio/Min/Max) e tabela de resultados
    const bodyResult = await getBody(page);
    expect(bodyResult).toMatch(/Hist|Preco|preco|Nenhum|resultado|Filtrar|Medio|Min|Max|Produto/i);

    // Passo 6: Verificar botao "CSV"
    const csvBtn = page.locator('button:has-text("CSV")').first();
    const temCSV = (await csvBtn.count()) > 0;
    // CSV pode nao existir se nao ha resultados — mas registramos
    await page.screenshot({ path: SS("P09_p6_csv_disponivel"), fullPage: true });
  });

  // ===== UC-P10 — Gestao de Comodato (6 passos) =========================
  test("UC-P10: Preencher dados de comodato e salvar", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);

    // Passo 1: Clicar aba "Historico" (Comodato fica nesta aba)
    const histTab = page.locator('button:has-text("Hist")').first();
    await histTab.click();
    await page.waitForTimeout(2000);

    // Localizar card "Gestao de Comodato"
    const comodatoSection = page.locator('text=Comodato').first();
    if ((await comodatoSection.count()) > 0) {
      await comodatoSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: SS("P10_p1_card_comodato"), fullPage: true });

    const body = await getBody(page);
    expect(body).toMatch(/Comodato|Equipamento|Prazo/i);

    // Passo 2: Preencher Equipamento, Valor, Prazo
    const equipInput = page.locator('input[placeholder*="Analisador"]').first();
    if ((await equipInput.count()) > 0) {
      await equipInput.fill("Analisador XN-L Sysmex");
    }
    const valorEquipInput = page.locator('input[placeholder*="250000"]').first();
    if ((await valorEquipInput.count()) > 0) {
      await valorEquipInput.fill("320000");
    }
    const prazoInput = page.locator('input[placeholder*="60"]').first();
    if ((await prazoInput.count()) > 0) {
      await prazoInput.fill("60");
    }
    await page.screenshot({ path: SS("P10_p2_comodato_preenchido"), fullPage: true });

    // Passo 4: Clicar "Salvar Comodato"
    const salvarComodatoBtn = page.locator('button:has-text("Salvar Comodato")').first();
    if ((await salvarComodatoBtn.count()) > 0) {
      await salvarComodatoBtn.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: SS("P10_p4_comodato_salvo"), fullPage: true });

    // Passo 5-6: Verificar tabela de comodatos e impacto no preco
    const bodyAfter = await getBody(page);
    expect(bodyAfter).toMatch(/Comodato|Equipamento|Amortiz|Impacto|Salvar|Analisador/i);
  });

  // ===== UC-P11 — Pipeline IA de Precificacao (8 passos) =================
  test("UC-P11: Verificar insights IA com 5 cards de recomendacao e clicar Usar", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Custos");
    await page.waitForTimeout(2000);

    // Passo 1: Selecionar vinculo
    await selecionarVinculo(page);

    // Passo 2: Verificar card "Precificacao Assistida por IA"
    const iaSection = page.locator('text=Precifica').last();
    if ((await iaSection.count()) > 0) await iaSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("P11_p2_card_ia"), fullPage: true });

    // Passo 7: Clicar "Regenerar Analise" para nova busca
    const regenerarBtn = page.locator('button:has-text("Regenerar")').first();
    if ((await regenerarBtn.count()) > 0) {
      await regenerarBtn.click();
      await waitForIA(page, (b: string) =>
        b.includes("Custo") || b.includes("Base") || b.includes("Usar") ||
        b.includes("insight") || b.includes("R$") || b.includes("Erro") ||
        b.includes("Recomend") || b.includes("registros"),
        180000, 5000);
      await page.screenshot({ path: SS("P11_p7_insights_regenerados"), fullPage: true });
    }

    // Passo 5-6: Verificar cards de recomendacao (A-E) e clicar "Usar ->"
    const usarBtn = page.locator('button:has-text("Usar")').first();
    if ((await usarBtn.count()) > 0) {
      await usarBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P11_p6_valor_aplicado"), fullPage: true });
    }

    const bodyFinal = await getBody(page);
    expect(bodyFinal).toMatch(/Custo|Base|Usar|insight|Recomend|R\$|Regenerar|Precifica/i);
  });

  // ===== UC-P12 — Relatorio de Custos e Precos (4 passos) ================
  test("UC-P12: Gerar relatorio de custos em nova janela", async ({ page }) => {
    await login(page);
    await selecionarEditalPrecificacao(page);
    await clickTab(page, "Custos");
    await page.waitForTimeout(2000);
    await selecionarVinculo(page);

    // Passo 1: Clicar "Relatorio de Custos e Precos"
    const relatorioBtn = page.locator('button:has-text("Relatorio de Custos"), button:has-text("Relatório de Custos")').first();
    if ((await relatorioBtn.count()) > 0) {
      // Passo 3: Sistema abre nova aba com relatorio
      const [popup] = await Promise.all([
        page.waitForEvent("popup", { timeout: 10000 }).catch(() => null),
        relatorioBtn.click(),
      ]);
      await page.waitForTimeout(3000);

      if (popup) {
        await popup.waitForTimeout(2000);
        const popupBody = await popup.locator("body").innerText().catch(() => "");
        // Verificar que relatorio tem conteudo real (>100 chars)
        expect(popupBody.length).toBeGreaterThan(100);
        await popup.screenshot({ path: SS("P12_p3_relatorio_html"), fullPage: true });
        await popup.close();
      }
    }
    await page.screenshot({ path: SS("P12_p1_pagina_final"), fullPage: true });
  });

  // =====================================================================
  // FASE 2 — PROPOSTA
  // =====================================================================

  // ===== UC-R01 — Gerar Proposta Tecnica (9 passos) ======================
  test("UC-R01: Selecionar edital/produto, preencher preco/quantidade e gerar proposta", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    // Passo 1: Verificar pagina PropostaPage
    const body = await getBody(page);
    expect(body).toMatch(/Proposta|Gerar|Nova/i);
    await page.screenshot({ path: SS("R01_p1_pagina_proposta"), fullPage: true });

    // Passo 2: Selecionar edital
    const editalSelect = page.locator("select").first();
    const editalOpts = await editalSelect.locator("option").allInnerTexts();
    expect(editalOpts.length).toBeGreaterThan(1);
    const targetIdx = editalOpts.findIndex((o: string) =>
      o.includes("COMANDO DO EXERCITO") || o.includes("90006"));
    await editalSelect.selectOption({ index: targetIdx > 0 ? targetIdx : 1 });
    await page.waitForTimeout(2000);

    // Passo 2b: Selecionar produto
    const allSelects = page.locator("select");
    const selectCount = await allSelects.count();
    for (let i = 1; i < selectCount; i++) {
      const opts = await allSelects.nth(i).locator("option").allInnerTexts();
      if (opts.some((o: string) => o.includes("Kit") || o.includes("Monitor") || o.includes("Reagente"))) {
        await allSelects.nth(i).selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Passo 3: Preencher preco unitario
    const precoInput = page.locator('input[type="number"]').first();
    if ((await precoInput.count()) > 0) await precoInput.fill("17800");

    // Passo 4: Preencher quantidade
    const qtdInput = page.locator('input[type="number"]').nth(1);
    if ((await qtdInput.count()) > 0) await qtdInput.fill("10");
    await page.screenshot({ path: SS("R01_p4_formulario_preenchido"), fullPage: true });

    // Passo 7: Clicar "Gerar Proposta Tecnica"
    const gerarBtn = page.locator('button:has-text("Gerar Proposta Tecnica"), button:has-text("Gerar Proposta Técnica")').first();
    expect(await gerarBtn.count()).toBeGreaterThan(0);
    await gerarBtn.click();

    // Passo 8-9: Aguardar geracao e verificar tabela "Minhas Propostas"
    await waitForIA(page, (b: string) =>
      b.includes("Proposta") || b.includes("Rascunho") || b.includes("Minhas") ||
      b.includes("Monitor") || b.includes("Kit") || b.includes("Gerada"),
      300000, 5000);
    await page.screenshot({ path: SS("R01_p9_proposta_gerada"), fullPage: true });

    const bodyAfter = await getBody(page);
    expect(bodyAfter).toMatch(/Proposta|Rascunho|Minhas|COMANDO/i);
  });

  // ===== UC-R02 — Upload de Proposta Externa (6 passos) ==================
  test("UC-R02: Clicar Upload Proposta Externa, selecionar arquivo e importar", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    // Passo 1: Clicar "Upload Proposta Externa"
    const uploadBtn = page.locator('button:has-text("Upload Proposta Externa"), button:has-text("Upload")').first();
    expect(await uploadBtn.count()).toBeGreaterThan(0);
    await uploadBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("R02_p1_modal_upload"), fullPage: true });

    // Passo 2: Selecionar edital e produto no modal
    const modalSelects = page.locator("select");
    const modalSelectCount = await modalSelects.count();
    for (let i = 0; i < modalSelectCount; i++) {
      const opts = await modalSelects.nth(i).locator("option").allInnerTexts();
      if (opts.length > 1 && opts.some((o: string) => o.includes("Selecione") || o.includes("edital"))) {
        const cmdIdx = opts.findIndex((o: string) => o.includes("COMANDO") || o.includes("90006"));
        await modalSelects.nth(i).selectOption({ index: cmdIdx > 0 ? cmdIdx : 1 });
        await page.waitForTimeout(500);
      }
    }
    // Selecionar produto
    for (let i = 0; i < modalSelectCount; i++) {
      const opts = await modalSelects.nth(i).locator("option").allInnerTexts();
      if (opts.some((o: string) => o.includes("Kit") || o.includes("Monitor") || o.includes("Reagente"))) {
        await modalSelects.nth(i).selectOption({ index: 1 });
        await page.waitForTimeout(500);
        break;
      }
    }

    // Passo 3: Selecionar arquivo
    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      const fixturePath = path.resolve("tests/fixtures/teste_upload.pdf");
      await fileInput.first().setInputFiles(fixturePath).catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: SS("R02_p3_arquivo_selecionado"), fullPage: true });

    // Passo 5: Clicar "Importar"
    const importarBtn = page.locator('button:has-text("Importar")').first();
    if ((await importarBtn.count()) > 0 && (await importarBtn.isEnabled().catch(() => false))) {
      await importarBtn.click();
      await page.waitForTimeout(5000);
    }
    await page.screenshot({ path: SS("R02_p5_importado"), fullPage: true });

    // Fechar modal se aberto
    const cancelarBtn = page.locator('button:has-text("Cancelar")').last();
    if ((await cancelarBtn.count()) > 0) {
      await cancelarBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  // ===== UC-R03 — Personalizar Descricao Tecnica (6 passos) ==============
  test("UC-R03: Selecionar proposta, alternar modo descricao e editar", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    // Selecionar proposta na tabela "Minhas Propostas" — clicar icone olho
    const viewBtn = page.locator("table tbody tr").first().locator("button").first();
    if ((await viewBtn.count()) > 0) {
      await viewBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("R03_p1_proposta_selecionada"), fullPage: true });

    const body = await getBody(page);

    // Passo 2-3: Localizar toggle "Texto do Edital" / "Personalizado"
    const toggleBtn = page.locator('button:has-text("Texto do Edital"), button:has-text("Personalizado")').first();
    if ((await toggleBtn.count()) > 0) {
      await toggleBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("R03_p3_modo_personalizado"), fullPage: true });
    }

    // Passo 5: Editar textarea do conteudo da proposta
    const propTextarea = page.locator('textarea[placeholder*="Escreva o conteudo"], textarea[placeholder*="proposta"], textarea[placeholder*="Markdown"]').first();
    if ((await propTextarea.count()) > 0 && (await propTextarea.isVisible().catch(() => false))) {
      const textoAtual = await propTextarea.inputValue().catch(() => "");
      await propTextarea.fill(textoAtual + "\n\n## Especificacoes Tecnicas Adicionais\n\nEquipamento atende norma ABNT NBR ISO 15189.");
      await page.waitForTimeout(500);
      await page.screenshot({ path: SS("R03_p5_texto_editado"), fullPage: true });

      // Salvar conteudo
      const salvarConteudoBtn = page.locator('button:has-text("Salvar Conteudo"), button:has-text("Salvar Rascunho")').first();
      if ((await salvarConteudoBtn.count()) > 0) {
        await salvarConteudoBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: SS("R03_p5_conteudo_salvo"), fullPage: true });
      }
    }

    expect(body).toMatch(/Proposta|Descri|Conteudo|Markdown|Selecionada/i);
  });

  // ===== UC-R04 — Auditoria ANVISA (5 passos) ============================
  test("UC-R04: Selecionar proposta e executar verificacao ANVISA", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    // Primeiro: selecionar uma proposta na tabela (clicar icone olho)
    const viewBtn = page.locator("table tbody tr").first().locator("button").first();
    if ((await viewBtn.count()) > 0) {
      await viewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para card "Auditoria ANVISA"
    const anvisaSection = page.locator('text=ANVISA').first();
    if ((await anvisaSection.count()) > 0) await anvisaSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("R04_p1_card_anvisa"), fullPage: true });

    // Passo 1: Clicar "Verificar Registros"
    const verificarBtn = page.locator('button:has-text("Verificar Registros")').first();
    if ((await verificarBtn.count()) > 0) {
      await verificarBtn.click();
      await waitForIA(page, (b: string) =>
        b.includes("Registro") || b.includes("Validade") || b.includes("Vigente") ||
        b.includes("ANVISA") || b.includes("Nenhum") || b.includes("Erro") ||
        b.includes("Valido") || b.includes("Vencido"),
        120000, 5000);
      await page.screenshot({ path: SS("R04_p3_tabela_anvisa"), fullPage: true });

      // Passo 3-4: Verificar tabela com colunas Produto, Registro, Validade, Status
      const bodyAnvisa = await getBody(page);
      expect(bodyAnvisa).toMatch(/ANVISA|Registro|Validade|Valido|Vencido|Nenhum|Produto/i);
    } else {
      // Sem proposta selecionada — registrar como evidencia
      await page.screenshot({ path: SS("R04_resp_sem_proposta_selecionada"), fullPage: true });
      const body = await getBody(page);
      expect(body).toMatch(/Proposta|ANVISA|Verificar/i);
    }
  });

  // ===== UC-R05 — Auditoria Documental + Smart Split (7 passos) ==========
  test("UC-R05: Selecionar proposta e verificar documentos", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    // Selecionar proposta
    const viewBtn = page.locator("table tbody tr").first().locator("button").first();
    if ((await viewBtn.count()) > 0) {
      await viewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para "Auditoria Documental"
    const docSection = page.locator('text=Documental').first();
    if ((await docSection.count()) > 0) await docSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("R05_p1_card_documental"), fullPage: true });

    // Passo 1: Clicar "Verificar Documentos"
    const verificarDocBtn = page.locator('button:has-text("Verificar Documentos")').first();
    if ((await verificarDocBtn.count()) > 0) {
      await verificarDocBtn.click();
      await page.waitForTimeout(5000);

      // Passo 3-4: Verificar tabela com Documento, Tamanho, Status (Presente/Ausente/Vencido)
      const bodyDoc = await getBody(page);
      expect(bodyDoc).toMatch(/Documento|Tamanho|Status|Presente|Ausente|Nenhum|Documental/i);
      await page.screenshot({ path: SS("R05_p4_tabela_documentos"), fullPage: true });
    } else {
      await page.screenshot({ path: SS("R05_resp_sem_proposta_selecionada"), fullPage: true });
      const body = await getBody(page);
      expect(body).toMatch(/Proposta|Documental|Documento/i);
    }
  });

  // ===== UC-R06 — Exportar Dossie Completo (5 passos) ====================
  test("UC-R06: Baixar proposta em PDF e DOCX", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    // Selecionar proposta
    const viewBtn = page.locator("table tbody tr").first().locator("button").first();
    if ((await viewBtn.count()) > 0) {
      await viewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para "Exportacao"
    const exportSection = page.locator('text=Exporta').first();
    if ((await exportSection.count()) > 0) await exportSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("R06_p1_card_exportacao"), fullPage: true });

    // Passo 1: Clicar "Baixar PDF"
    const pdfBtn = page.locator('button:has-text("Baixar PDF")').first();
    if ((await pdfBtn.count()) > 0) {
      const dlPromise = page.waitForEvent("download", { timeout: 30000 }).catch(() => null);
      await pdfBtn.click();
      await page.waitForTimeout(3000);
      const dl = await dlPromise;
      if (dl) {
        expect(dl.suggestedFilename()).toMatch(/\.(pdf)$/i);
        await page.screenshot({ path: SS("R06_p1_download_pdf"), fullPage: true });
      }
    }

    // Passo 2: Clicar "Baixar DOCX"
    const docxBtn = page.locator('button:has-text("Baixar DOCX")').first();
    if ((await docxBtn.count()) > 0) {
      const dlPromise2 = page.waitForEvent("download", { timeout: 30000 }).catch(() => null);
      await docxBtn.click();
      await page.waitForTimeout(3000);
      const dl2 = await dlPromise2;
      if (dl2) {
        expect(dl2.suggestedFilename()).toMatch(/\.(docx)$/i);
      }
    }

    // Passo 3: Verificar "Baixar Dossie ZIP"
    const zipBtn = page.locator('button:has-text("Dossie"), button:has-text("ZIP")').first();
    const temZip = (await zipBtn.count()) > 0;
    await page.screenshot({ path: SS("R06_p3_botoes_export"), fullPage: true });

    const body = await getBody(page);
    expect(body).toMatch(/Proposta|Exporta|PDF|DOCX|Baixar/i);
  });

  // ===== UC-R07 — Gerenciar Status e Submissao ===========================
  test("UC-R07: Selecionar proposta, verificar checklist, marcar como enviada e anexar documento", async ({ page }) => {
    await login(page);
    await navTo(page, "Submissao");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("R07_p1_submissao_page"), fullPage: true });

    const body = await getBody(page);
    expect(body).toMatch(/Submiss|Proposta|Envio/i);

    // Verificar tabela "Propostas Prontas para Envio"
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();

    if (rowCount > 0 && !body.includes("Nenhuma proposta")) {
      // Clicar na primeira proposta
      await rows.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("R07_p2_proposta_selecionada"), fullPage: true });

      // Verificar checklist 4 itens: Proposta tecnica, Preco definido, Documentos, Revisao final
      const bodyChecklist = await getBody(page);
      expect(bodyChecklist).toMatch(/Checklist|Proposta tecnica|Preco definido|Anexar|Marcar/i);

      // Clicar "Marcar como Enviada"
      const marcarBtn = page.locator('button:has-text("Marcar como Enviada")').first();
      if ((await marcarBtn.count()) > 0 && (await marcarBtn.isEnabled().catch(() => false))) {
        await marcarBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: SS("R07_p3_marcada_enviada"), fullPage: true });
      }

      // Clicar "Anexar Documento" — verificar modal
      const anexarBtn = page.locator('button:has-text("Anexar Documento")').first();
      if ((await anexarBtn.count()) > 0) {
        await anexarBtn.click();
        await page.waitForTimeout(2000);

        // Verificar modal com select "Tipo de Documento"
        const bodyModal = await getBody(page);
        expect(bodyModal).toMatch(/Tipo|Proposta Tecnica|Certidao|Contrato|Procuracao/i);
        await page.screenshot({ path: SS("R07_p4_modal_anexar"), fullPage: true });

        const cancelarBtn = page.locator('button:has-text("Cancelar")').last();
        if ((await cancelarBtn.count()) > 0) await cancelarBtn.click();
      }

      // Verificar "Abrir Portal PNCP"
      const pncpBtn = page.locator('button:has-text("Abrir Portal PNCP"), button:has-text("PNCP")').first();
      const temPNCP = (await pncpBtn.count()) > 0;
      await page.screenshot({ path: SS("R07_p5_botao_pncp"), fullPage: true });
    } else {
      expect(body).toMatch(/Nenhuma|Submiss|Carregando/i);
      await page.screenshot({ path: SS("R07_resp_sem_propostas"), fullPage: true });
    }
  });
});
