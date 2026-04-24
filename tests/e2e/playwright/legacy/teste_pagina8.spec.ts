/**
 * TESTE DAS PAGINAS 8, 9, 10 — VALIDACAO DE EDITAIS (WORKFLOW SISTEMA.pdf)
 * Seguindo EXATAMENTE o TESTEPAGINA8.md
 * Playwright E2E tests
 */
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';
const API_URL = 'http://localhost:5007';
const EMAIL = 'pasteurjr@gmail.com';
const PASSWORD = '123456';

let authToken: string;

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  return data.access_token;
}

async function loginAndGoToValidacao(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500);

  // Se tiver tela de login, fazer login
  const loginBtn = page.locator('button:has-text("Entrar"), button:has-text("Login")').first();
  if (await loginBtn.count() > 0) {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(EMAIL);
      await page.locator('input[type="password"]').first().fill(PASSWORD);
      await loginBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Navegar para Validacao (Fluxo Comercial > Validacao)
  // Fluxo Comercial pode ja estar expandido (e a secao padrao aberta)
  const validacaoBtn = page.locator('.nav-item:has(.nav-item-label:text("Validacao"))').first();
  if (await validacaoBtn.count() > 0 && await validacaoBtn.isVisible()) {
    await validacaoBtn.click();
    await page.waitForTimeout(2000);
  } else {
    // Expandir secao Fluxo Comercial primeiro
    const fluxoHeader = page.locator('.nav-section-header:has(.nav-section-label:text("Fluxo Comercial"))');
    if (await fluxoHeader.count() > 0) {
      await fluxoHeader.click();
      await page.waitForTimeout(500);
    }
    await page.locator('.nav-item:has(.nav-item-label:text("Validacao"))').first().click();
    await page.waitForTimeout(2000);
  }
}

test.describe.serial('PAGINAS 8, 9, 10 — VALIDACAO DE EDITAIS (TESTEPAGINA8.md)', () => {

  test.beforeAll(async () => {
    authToken = await getAuthToken();
  });

  // =====================================================
  // TESTE 1 — Carregamento da Pagina e Tabela de Editais
  // =====================================================
  test('TESTE 1: Pagina carrega com titulo e tabela de editais', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Screenshot da pagina carregada
    await page.screenshot({ path: 'tests/results/t8_01_tabela.png', fullPage: true });

    // Verificar titulo
    const titulo = page.locator('h1:has-text("Validacao de Editais")');
    await expect(titulo).toBeVisible({ timeout: 10000 });

    // Verificar card "Meus Editais"
    const cardMeusEditais = page.locator('text=Meus Editais').first();
    await expect(cardMeusEditais).toBeVisible();

    // Verificar filtro de busca
    const searchInput = page.locator('input[placeholder*="Buscar edital"]').first();
    await expect(searchInput).toBeVisible();

    // Verificar filtro de status
    const statusFilter = page.locator('select').first();
    await expect(statusFilter).toBeVisible();

    // Verificar colunas da tabela
    const headerTexts = await page.locator('th, .data-table-header').allTextContents();
    const headerStr = headerTexts.join(' ');

    console.log('TESTE 1 RESULTADO:', JSON.stringify({
      titulo_visivel: true,
      card_meus_editais: true,
      filtro_busca: true,
      filtro_status: true,
      colunas: headerStr,
    }, null, 2));

    // Verificar que as colunas principais estao presentes
    expect(headerStr).toContain('Numero');
    expect(headerStr).toContain('Orgao');
    expect(headerStr).toContain('Score');
  });

  // =====================================================
  // TESTE 2 — API: Listar Editais Salvos
  // =====================================================
  test('TESTE 2: API - GET /api/editais/salvos?com_score=true retorna editais', async () => {
    test.setTimeout(120000);
    const res = await fetch(`${API_URL}/api/editais/salvos?com_score=true`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await res.json();
    const editais = data.editais || data || [];

    const resumo = editais.slice(0, 3).map((e: Record<string, unknown>) => ({
      id: e.id || e.edital_id,
      numero: e.numero || e.numero_edital,
      orgao: e.orgao,
      uf: e.uf,
      score: e.score_geral || e.score,
    }));

    console.log('TESTE 2 RESULTADO:', JSON.stringify({
      http_status: res.status,
      total_editais: editais.length,
      amostra: resumo,
    }, null, 2));

    expect(res.status).toBe(200);
    expect(editais.length).toBeGreaterThan(0);
    // Verificar que o primeiro edital tem os campos minimos
    const primeiro = editais[0];
    expect(primeiro.id || primeiro.edital_id).toBeTruthy();
    expect(primeiro.numero || primeiro.numero_edital).toBeTruthy();
  });

  // =====================================================
  // TESTE 3 — Selecionar Edital e Verificar Painel
  // =====================================================
  test('TESTE 3: Selecionar edital da tabela - painel de analise aparece', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Clicar na primeira linha da tabela
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    const rowExists = await firstRow.count() > 0;

    if (rowExists) {
      await firstRow.click();
      await page.waitForTimeout(2000);

      // Screenshot do edital selecionado
      await page.screenshot({ path: 'tests/results/t8_02_edital_selecionado.png', fullPage: true });

      // Verificar barra de decisao
      const topBar = page.locator('.validacao-top-bar').first();
      const topBarVisible = await topBar.count() > 0;

      // Verificar botoes de decisao
      const participarBtn = page.locator('button:has-text("Participar")').first();
      const acompanharBtn = page.locator('button:has-text("Acompanhar")').first();
      const ignorarBtn = page.locator('button:has-text("Ignorar")').first();

      const participarVisible = await participarBtn.count() > 0;
      const acompanharVisible = await acompanharBtn.count() > 0;
      const ignorarVisible = await ignorarBtn.count() > 0;

      // Verificar score dashboard
      const scoreCircle = page.locator('.score-circle, .score-dashboard').first();
      const scoreVisible = await scoreCircle.count() > 0;

      // Verificar tabs
      const tabObjetiva = page.locator('text=Objetiva').first();
      const tabAnalitica = page.locator('text=Analitica').first();
      const tabCognitiva = page.locator('text=Cognitiva').first();

      // Verificar Processo Amanda
      const processoAmanda = page.locator('text=Processo Amanda').first();
      const amandaVisible = await processoAmanda.count() > 0;

      console.log('TESTE 3 RESULTADO:', JSON.stringify({
        edital_selecionado: true,
        top_bar_visivel: topBarVisible,
        btn_participar: participarVisible,
        btn_acompanhar: acompanharVisible,
        btn_ignorar: ignorarVisible,
        score_dashboard: scoreVisible,
        tab_objetiva: await tabObjetiva.count() > 0,
        tab_analitica: await tabAnalitica.count() > 0,
        tab_cognitiva: await tabCognitiva.count() > 0,
        processo_amanda: amandaVisible,
      }, null, 2));

      expect(topBarVisible).toBe(true);
      expect(participarVisible).toBe(true);
      expect(acompanharVisible).toBe(true);
      expect(ignorarVisible).toBe(true);
    } else {
      console.log('TESTE 3: Nenhum edital na tabela para selecionar');
      expect(rowExists).toBe(true);
    }
  });

  // =====================================================
  // TESTE 4 — Sinais de Mercado e Botoes de Decisao
  // =====================================================
  test('TESTE 4: Barra superior - sinais de mercado e botoes de decisao', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Screenshot da barra de decisao
    await page.screenshot({ path: 'tests/results/t8_03_decisao_sinais.png', fullPage: true });

    // Verificar barra superior
    const topBar = page.locator('.validacao-top-bar');
    await expect(topBar).toBeVisible({ timeout: 5000 });

    // Verificar sinais de mercado (badges)
    const sinaisBadges = page.locator('.sinais-mercado .badge');
    const sinaisCount = await sinaisBadges.count();
    const sinaisTexts = await sinaisBadges.allTextContents();

    // Verificar botoes
    const btnParticipar = page.locator('.decisao-buttons button:has-text("Participar")');
    const btnAcompanhar = page.locator('.decisao-buttons button:has-text("Acompanhar")');
    const btnIgnorar = page.locator('.decisao-buttons button:has-text("Ignorar")');

    await expect(btnParticipar).toBeVisible();
    await expect(btnAcompanhar).toBeVisible();
    await expect(btnIgnorar).toBeVisible();

    console.log('TESTE 4 RESULTADO:', JSON.stringify({
      barra_visivel: true,
      sinais_mercado_count: sinaisCount,
      sinais_textos: sinaisTexts,
      btn_participar: true,
      btn_acompanhar: true,
      btn_ignorar: true,
    }, null, 2));
  });

  // =====================================================
  // TESTE 5 — Clicar Participar e Justificativa
  // =====================================================
  test('TESTE 5: Clicar Participar - card de justificativa aparece', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Clicar Participar
    const btnParticipar = page.locator('button:has-text("Participar")').first();
    await btnParticipar.click();
    await page.waitForTimeout(1000);

    // Screenshot da justificativa
    await page.screenshot({ path: 'tests/results/t8_04_justificativa.png', fullPage: true });

    // Verificar card Justificativa
    const justificativaCard = page.locator('text=Justificativa da Decisao').first();
    const justificativaVisible = await justificativaCard.count() > 0;

    // Verificar dropdown de motivo
    const motivoSelect = page.locator('select.select-input').nth(1); // segundo select (primeiro e o filtro status)
    const motivoExists = await motivoSelect.count() > 0;

    // Verificar textarea de detalhes
    const detalhesArea = page.locator('textarea').first();
    const detalhesExists = await detalhesArea.count() > 0;

    // Verificar botao Salvar Justificativa
    const salvarJust = page.locator('button:has-text("Salvar Justificativa")').first();
    const salvarExists = await salvarJust.count() > 0;

    console.log('TESTE 5 RESULTADO:', JSON.stringify({
      justificativa_card: justificativaVisible,
      motivo_dropdown: motivoExists,
      detalhes_textarea: detalhesExists,
      btn_salvar: salvarExists,
    }, null, 2));

    expect(justificativaVisible).toBe(true);
    expect(detalhesExists).toBe(true);
    expect(salvarExists).toBe(true);
  });

  // =====================================================
  // TESTE 6 — Preencher e Salvar Justificativa
  // =====================================================
  test('TESTE 6: Preencher motivo + detalhes e salvar justificativa', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Clicar Participar
    await page.locator('button:has-text("Participar")').first().click();
    await page.waitForTimeout(1000);

    // Selecionar motivo
    const selects = page.locator('select.select-input');
    const selectCount = await selects.count();
    // Encontrar o select dentro do card de justificativa
    let motivoSelecionado = false;
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator('option').allTextContents();
      if (options.some(o => o.includes('competitivo') || o.includes('Preco'))) {
        await selects.nth(i).selectOption('preco_competitivo');
        motivoSelecionado = true;
        break;
      }
    }

    // Preencher detalhes
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('Margem aceitavel para este tipo de produto');
    }

    // Salvar
    const salvarBtn = page.locator('button:has-text("Salvar Justificativa")').first();
    await salvarBtn.click();
    await page.waitForTimeout(2000);

    // Verificar que justificativa fechou
    const justVisible = await page.locator('text=Justificativa da Decisao').count();

    // Verificar badge "Decisao salva"
    const decisaoSalvaBadge = page.locator('.badge:has-text("Decisao salva")');
    const decisaoSalva = await decisaoSalvaBadge.count() > 0;

    console.log('TESTE 6 RESULTADO:', JSON.stringify({
      motivo_selecionado: motivoSelecionado,
      detalhes_preenchidos: true,
      justificativa_fechou: justVisible === 0,
      decisao_salva_badge: decisaoSalva,
    }, null, 2));

    // Justificativa deve ter fechado
    expect(justVisible).toBe(0);
  });

  // =====================================================
  // TESTE 7 — Score Dashboard
  // =====================================================
  test('TESTE 7: Score Dashboard - score geral + 6 sub-scores', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para score dashboard
    const scoreDash = page.locator('.score-dashboard').first();
    if (await scoreDash.count() > 0) {
      await scoreDash.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(500);

    // Screenshot
    await page.screenshot({ path: 'tests/results/t8_05_score_dashboard.png', fullPage: true });

    // Verificar ScoreCircle (score geral)
    const scoreCircle = page.locator('.score-circle').first();
    const scoreCircleVisible = await scoreCircle.count() > 0;

    // Verificar "Score Geral" label
    const scoreLabel = page.locator('text=Score Geral').first();
    const scoreLabelVisible = await scoreLabel.count() > 0;

    // Verificar Potencial de Ganho
    const potencial = page.locator('text=Potencial de Ganho').first();
    const potencialVisible = await potencial.count() > 0;

    // Verificar botao Calcular Scores
    const calcBtn = page.locator('button:has-text("Calcular Scores")').first();
    const calcBtnVisible = await calcBtn.count() > 0;

    // Verificar 6 sub-scores bars
    const scoreBars = page.locator('.score-bars-6d .score-bar, .score-bars-6d [class*="score-bar"]');
    const scoreBarsCount = await scoreBars.count();

    // Verificar labels dos 6 sub-scores
    const pageText = await page.textContent('body') || '';
    const subScoreLabels = [
      'Aderencia Tecnica',
      'Aderencia Documental',
      'Complexidade Edital',
      'Risco Juridico',
      'Viabilidade Logistica',
      'Atratividade Comercial',
    ];
    const labelsPresentes = subScoreLabels.filter(l => pageText.includes(l));

    // Verificar Intencao Estrategica
    const intencao = page.locator('text=Intencao Estrategica').first();
    const intencaoVisible = await intencao.count() > 0;

    // Verificar Margem slider
    const margemSlider = page.locator('input[type="range"]').first();
    const sliderVisible = await margemSlider.count() > 0;

    console.log('TESTE 7 RESULTADO:', JSON.stringify({
      score_circle: scoreCircleVisible,
      score_label: scoreLabelVisible,
      potencial_ganho: potencialVisible,
      btn_calcular_scores: calcBtnVisible,
      score_bars_count: scoreBarsCount,
      sub_score_labels: labelsPresentes,
      intencao_estrategica: intencaoVisible,
      margem_slider: sliderVisible,
    }, null, 2));

    expect(scoreCircleVisible || scoreLabelVisible).toBe(true);
    expect(labelsPresentes.length).toBeGreaterThanOrEqual(4);
  });

  // =====================================================
  // TESTE 8 — Tab Objetiva
  // =====================================================
  test('TESTE 8: Tab Objetiva - Aderencia, Certificacoes, Checklist, Mapa, Lote', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Clicar na aba Objetiva (pode ja estar ativa por padrao)
    const tabObjetiva = page.locator('button:has-text("Objetiva"), [role="tab"]:has-text("Objetiva")').first();
    if (await tabObjetiva.count() > 0) {
      await tabObjetiva.click();
      await page.waitForTimeout(1000);
    }

    // Scroll para ver o conteudo da aba
    const abaContent = page.locator('.aba-content').first();
    if (await abaContent.count() > 0) {
      await abaContent.scrollIntoViewIfNeeded();
    }

    // Screenshot
    await page.screenshot({ path: 'tests/results/t8_06_tab_objetiva.png', fullPage: true });

    const pageText = await page.textContent('body') || '';

    // Verificar secoes da aba Objetiva
    const secoes = {
      aderencia_tecnica: pageText.includes('Aderencia Tecnica'),
      certificacoes: pageText.includes('Certificacoes'),
      checklist_documental: pageText.includes('Checklist Documental'),
      mapa_logistico: pageText.includes('Mapa Logistico'),
      analise_lote: pageText.includes('Analise de Lote'),
    };

    console.log('TESTE 8 RESULTADO:', JSON.stringify({
      tab_objetiva_ativa: true,
      secoes,
    }, null, 2));

    // Pelo menos Aderencia Tecnica e Certificacoes devem existir
    expect(secoes.aderencia_tecnica || secoes.certificacoes).toBe(true);
  });

  // =====================================================
  // TESTE 9 — Tab Analitica
  // =====================================================
  test('TESTE 9: Tab Analitica - Pipeline, Flags, Fatal Flaws, Reputacao', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Clicar na aba Analitica
    const tabAnalitica = page.locator('button:has-text("Analitica"), [role="tab"]:has-text("Analitica")').first();
    if (await tabAnalitica.count() > 0) {
      await tabAnalitica.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot
    await page.screenshot({ path: 'tests/results/t8_07_tab_analitica.png', fullPage: true });

    const pageText = await page.textContent('body') || '';

    // Verificar secoes da aba Analitica
    const secoes = {
      pipeline_riscos: pageText.includes('Pipeline de Riscos'),
      flags_juridicos: pageText.includes('Flags Juridicos'),
      reputacao_orgao: pageText.includes('Reputacao do Orgao'),
      aderencia_trecho: pageText.includes('Aderencia Tecnica Trecho') || pageText.includes('Trecho-a-Trecho'),
    };

    // Verificar campos de reputacao
    const reputacaoGrid = page.locator('.reputacao-grid, .reputacao-item');
    const reputacaoExists = await reputacaoGrid.count() > 0;

    // Verificar badges de pipeline
    const pipelineBadges = page.locator('.pipeline-badges .badge');
    const pipelineBadgesCount = await pipelineBadges.count();

    console.log('TESTE 9 RESULTADO:', JSON.stringify({
      tab_analitica_ativa: true,
      secoes,
      reputacao_grid: reputacaoExists,
      pipeline_badges: pipelineBadgesCount,
    }, null, 2));

    expect(secoes.pipeline_riscos).toBe(true);
    expect(secoes.reputacao_orgao).toBe(true);
  });

  // =====================================================
  // TESTE 10 — Tab Cognitiva
  // =====================================================
  test('TESTE 10: Tab Cognitiva - Resumo IA, Historico, Pergunte a IA', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Clicar na aba Cognitiva
    const tabCognitiva = page.locator('button:has-text("Cognitiva"), [role="tab"]:has-text("Cognitiva")').first();
    if (await tabCognitiva.count() > 0) {
      await tabCognitiva.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot
    await page.screenshot({ path: 'tests/results/t8_08_tab_cognitiva.png', fullPage: true });

    const pageText = await page.textContent('body') || '';

    // Verificar secoes da aba Cognitiva
    const secoes = {
      resumo_ia: pageText.includes('Resumo Gerado pela IA') || pageText.includes('Resumo'),
      historico_semelhantes: pageText.includes('Historico de Editais Semelhantes') || pageText.includes('Historico'),
      pergunte_ia: pageText.includes('Pergunte a IA') || pageText.includes('Pergunte'),
    };

    // Verificar botao Gerar/Regerar Resumo
    const resumoBtn = page.locator('button:has-text("Gerar Resumo"), button:has-text("Regerar Resumo")').first();
    const resumoBtnExists = await resumoBtn.count() > 0;

    // Verificar input de pergunta
    const perguntaInput = page.locator('.pergunta-form input, .pergunta-form textarea').first();
    const perguntaExists = await perguntaInput.count() > 0;

    // Verificar botao Perguntar
    const perguntarBtn = page.locator('button:has-text("Perguntar")').first();
    const perguntarExists = await perguntarBtn.count() > 0;

    console.log('TESTE 10 RESULTADO:', JSON.stringify({
      tab_cognitiva_ativa: true,
      secoes,
      btn_resumo: resumoBtnExists,
      input_pergunta: perguntaExists,
      btn_perguntar: perguntarExists,
    }, null, 2));

    expect(secoes.resumo_ia).toBe(true);
    expect(secoes.pergunte_ia).toBe(true);
  });

  // =====================================================
  // TESTE 11 — Processo Amanda (3 Pastas)
  // =====================================================
  test('TESTE 11: Processo Amanda - 3 pastas de documentos', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para Processo Amanda
    const amandaCard = page.locator('text=Processo Amanda').first();
    if (await amandaCard.count() > 0) {
      await amandaCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    // Screenshot
    await page.screenshot({ path: 'tests/results/t8_09_processo_amanda.png', fullPage: true });

    const pageText = await page.textContent('body') || '';

    // Verificar titulo do card
    const cardVisible = pageText.includes('Processo Amanda');

    // Verificar 3 pastas
    const pasta1 = pageText.includes('Documentos da Empresa');
    const pasta2 = pageText.includes('Certidoes e Fiscal') || pageText.includes('Certidoes');
    const pasta3 = pageText.includes('Qualificacao Tecnica');

    // Verificar itens dentro das pastas
    const itens = {
      contrato_social: pageText.includes('Contrato Social'),
      procuracao: pageText.includes('Procuracao'),
      cnd_federal: pageText.includes('CND Federal'),
      fgts: pageText.includes('FGTS'),
      registro_anvisa: pageText.includes('Registro ANVISA'),
      certificado_bpf: pageText.includes('Certificado BPF'),
    };

    // Verificar StatusBadges (Disponivel / Faltante / OK / Vencida)
    const statusBadges = page.locator('.status-badge');
    const badgesCount = await statusBadges.count();

    console.log('TESTE 11 RESULTADO:', JSON.stringify({
      card_processo_amanda: cardVisible,
      pasta_1_docs_empresa: pasta1,
      pasta_2_certidoes: pasta2,
      pasta_3_qualificacao: pasta3,
      itens,
      status_badges_count: badgesCount,
    }, null, 2));

    expect(cardVisible).toBe(true);
    expect(pasta1).toBe(true);
    expect(pasta3).toBe(true);
  });

  // =====================================================
  // TESTE 12 — API: Calcular Scores via IA
  // =====================================================
  test('TESTE 12: API - POST /api/editais/{id}/scores-validacao', async () => {
    test.setTimeout(120000);

    // Primeiro obter um edital ID
    const listRes = await fetch(`${API_URL}/api/editais/salvos?com_score=true`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    const editais = listData.editais || listData || [];

    if (editais.length === 0) {
      console.log('TESTE 12: Nenhum edital salvo para calcular scores');
      expect(editais.length).toBeGreaterThan(0);
      return;
    }

    const editalId = editais[0].id || editais[0].edital_id;

    // Calcular scores (endpoint requer JSON body, mesmo que vazio)
    const res = await fetch(`${API_URL}/api/editais/${editalId}/scores-validacao`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    // O endpoint retorna "scores" com sub-campos e "decisao" (GO/NO-GO/CONDICIONAL)
    const scoreGeral = data.scores?.final || data.score_geral || 0;

    console.log('TESTE 12 RESULTADO:', JSON.stringify({
      http_status: res.status,
      edital_id: editalId,
      success: data.success,
      scores: data.scores,
      score_geral: scoreGeral,
      decisao: data.decisao,
      justificativa: data.justificativa ? data.justificativa.substring(0, 120) + '...' : null,
      pontos_positivos: data.pontos_positivos?.length || 0,
      pontos_atencao: data.pontos_atencao?.length || 0,
    }, null, 2));

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Verificar campos presentes
    if (data.scores) {
      expect(typeof data.scores.tecnico).toBe('number');
      expect(typeof data.scores.documental).toBe('number');
      expect(typeof data.scores.juridico).toBe('number');
    }
    if (scoreGeral !== undefined) {
      expect(scoreGeral).toBeGreaterThanOrEqual(0);
      expect(scoreGeral).toBeLessThanOrEqual(100);
    }
  });

  // =====================================================
  // TESTE 13 — Screenshots Finais
  // =====================================================
  test('TESTE 13: Screenshots completos e verificacao geral', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToValidacao(page);

    // Screenshot 1: Tabela
    await page.screenshot({ path: 'tests/results/t8_13_01_tabela_geral.png', fullPage: true });

    // Selecionar primeiro edital
    const firstRow = page.locator('tbody tr, .data-table-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
    }

    // Screenshot 2: Edital selecionado com score dashboard
    await page.screenshot({ path: 'tests/results/t8_13_02_edital_score.png', fullPage: true });

    // Scroll para tabs
    const tabsArea = page.locator('.tab-panel, [class*="tab"]').first();
    if (await tabsArea.count() > 0) {
      await tabsArea.scrollIntoViewIfNeeded();
    }

    // Tab Objetiva
    const tabObj = page.locator('button:has-text("Objetiva"), [role="tab"]:has-text("Objetiva")').first();
    if (await tabObj.count() > 0) await tabObj.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/results/t8_13_03_tab_objetiva.png', fullPage: true });

    // Tab Analitica
    const tabAna = page.locator('button:has-text("Analitica"), [role="tab"]:has-text("Analitica")').first();
    if (await tabAna.count() > 0) await tabAna.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/results/t8_13_04_tab_analitica.png', fullPage: true });

    // Tab Cognitiva
    const tabCog = page.locator('button:has-text("Cognitiva"), [role="tab"]:has-text("Cognitiva")').first();
    if (await tabCog.count() > 0) await tabCog.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/results/t8_13_05_tab_cognitiva.png', fullPage: true });

    // Scroll para Processo Amanda
    const amandaCard = page.locator('text=Processo Amanda').first();
    if (await amandaCard.count() > 0) {
      await amandaCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'tests/results/t8_13_06_processo_amanda.png', fullPage: true });

    // Verificacao geral
    const bodyText = await page.textContent('body') || '';
    const verificacao = {
      pagina_validacao: bodyText.includes('Validacao de Editais'),
      card_meus_editais: bodyText.includes('Meus Editais'),
      processo_amanda: bodyText.includes('Processo Amanda'),
      tab_objetiva: bodyText.includes('Objetiva'),
      tab_analitica: bodyText.includes('Analitica'),
      tab_cognitiva: bodyText.includes('Cognitiva'),
    };

    console.log('TESTE 13 RESULTADO:', JSON.stringify({
      screenshots: [
        't8_13_01_tabela_geral.png',
        't8_13_02_edital_score.png',
        't8_13_03_tab_objetiva.png',
        't8_13_04_tab_analitica.png',
        't8_13_05_tab_cognitiva.png',
        't8_13_06_processo_amanda.png',
      ],
      verificacao,
    }, null, 2));

    expect(verificacao.pagina_validacao).toBe(true);
    expect(verificacao.card_meus_editais).toBe(true);
  });

});
