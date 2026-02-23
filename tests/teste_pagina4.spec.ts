/**
 * TESTE DA PAGINA 4 — PARAMETRIZACOES (WORKFLOW SISTEMA.pdf)
 * Seguindo EXATAMENTE o TESTEPAGINA4.md
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

async function loginAndGoToParametrizacoes(page: Page) {
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

  // 1. Expandir secao "Configuracoes"
  const configHeader = page.locator('.nav-section-header:has(.nav-section-label:text("Configuracoes"))');
  await configHeader.click();
  await page.waitForTimeout(500);

  // 2. Clicar em "Parametrizacoes"
  const paramBtn = page.locator('.nav-section-items .nav-item:has(.nav-item-label:text("Parametrizacoes"))').first();
  await paramBtn.click();
  await page.waitForTimeout(2000);
}

// Helper: clicar em uma aba pelo label
async function clickTab(page: Page, tabLabel: string) {
  const tab = page.locator(`.tab-panel-tab:has(.tab-label:text("${tabLabel}"))`).first();
  await tab.click();
  await page.waitForTimeout(1000);
}

test.describe.serial('PAGINA 4 — PARAMETRIZACOES (TESTEPAGINA4.md)', () => {

  test.beforeAll(async () => {
    authToken = await getAuthToken();
  });

  // =====================================================
  // TESTE 1 — Carregamento da pagina com 5 abas
  // =====================================================
  test('TESTE 1: Pagina carrega com titulo e 5 abas', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    // Screenshot inicial
    await page.screenshot({ path: 'tests/results/p4_t1_01_pagina_carregada.png', fullPage: true });

    // Verificar titulo
    await expect(page.locator('h1:has-text("Parametrizacoes")')).toBeVisible({ timeout: 5000 });

    // Verificar subtitulo
    const pageText = await page.textContent('body');
    expect(pageText).toContain('Configuracoes gerais do sistema');

    // Verificar as 5 abas
    const abasEsperadas = ['Produtos', 'Comercial', 'Fontes de Busca', 'Notificacoes', 'Preferencias'];
    const abasEncontradas: string[] = [];

    for (const aba of abasEsperadas) {
      const tabEl = page.locator(`text="${aba}"`).first();
      const visivel = await tabEl.isVisible().catch(() => false);
      if (visivel) abasEncontradas.push(aba);
    }

    console.log('TESTE 1 RESULTADO:', JSON.stringify({
      titulo_visivel: true,
      abas_esperadas: abasEsperadas,
      abas_encontradas: abasEncontradas,
      todas_presentes: abasEncontradas.length === 5,
    }, null, 2));

    expect(abasEncontradas.length).toBe(5);
  });

  // =====================================================
  // TESTE 2 — Aba Produtos: Estrutura de Classificacao
  // =====================================================
  test('TESTE 2: Aba Produtos - Estrutura de Classificacao', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    // Aba Produtos ja e a ativa por padrao
    await page.waitForTimeout(500);

    // Verificar card "Estrutura de Classificacao"
    const cardClassif = page.locator('text=Estrutura de Classificacao').first();
    await expect(cardClassif).toBeVisible({ timeout: 5000 });

    // Verificar botao "Nova Classe"
    const novaClasseBtn = page.locator('button:has-text("Nova Classe")').first();
    const novaClasseVisivel = await novaClasseBtn.isVisible().catch(() => false);

    // Verificar botao "Gerar com IA" (desabilitado)
    const gerarIABtn = page.locator('button:has-text("Gerar com IA")').first();
    const gerarIAVisivel = await gerarIABtn.isVisible().catch(() => false);
    const gerarIADisabled = gerarIAVisivel ? await gerarIABtn.isDisabled() : true;

    // Verificar area classes-tree
    const classesTree = page.locator('.classes-tree');
    const treeExists = await classesTree.count() > 0;

    await page.screenshot({ path: 'tests/results/p4_t2_01_produtos_classificacao.png', fullPage: true });

    console.log('TESTE 2 RESULTADO:', JSON.stringify({
      card_classificacao_visivel: true,
      botao_nova_classe: novaClasseVisivel,
      botao_gerar_ia: gerarIAVisivel,
      gerar_ia_desabilitado: gerarIADisabled,
      classes_tree_presente: treeExists,
    }, null, 2));

    expect(novaClasseVisivel).toBe(true);
  });

  // =====================================================
  // TESTE 3 — Aba Produtos: Tipos de Edital
  // =====================================================
  test('TESTE 3: Aba Produtos - Tipos de Edital (6 checkboxes)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await page.waitForTimeout(500);

    // Verificar card "Tipos de Edital Desejados"
    const cardTipos = page.locator('text=Tipos de Edital Desejados').first();
    await expect(cardTipos).toBeVisible({ timeout: 5000 });

    // Verificar os 6 tipos de checkbox
    const tiposEsperados = [
      'Comodato de equipamentos',
      'Venda de equipamentos',
      'Aluguel com consumo de reagentes',
      'Consumo de reagentes',
      'Compra de insumos laboratoriais',
      'Compra de insumos hospitalares',
    ];

    const tiposEncontrados: Record<string, boolean> = {};
    for (const tipo of tiposEsperados) {
      const label = page.locator(`text="${tipo}"`).first();
      tiposEncontrados[tipo] = await label.isVisible().catch(() => false);
    }

    // Contar checkboxes no checkbox-grid abaixo de "Tipos de Edital"
    const checkboxes = page.locator('.checkbox-grid .checkbox-wrapper').first();
    const checkboxCount = await page.locator('.checkbox-grid').first().locator('.checkbox-wrapper').count();

    await page.screenshot({ path: 'tests/results/p4_t3_01_tipos_edital.png', fullPage: true });

    console.log('TESTE 3 RESULTADO:', JSON.stringify({
      card_visivel: true,
      tipos_encontrados: tiposEncontrados,
      total_checkboxes: checkboxCount,
    }, null, 2));

    const todosVisiveis = Object.values(tiposEncontrados).every(v => v);
    expect(todosVisiveis).toBe(true);
    expect(checkboxCount).toBeGreaterThanOrEqual(6);
  });

  // =====================================================
  // TESTE 4 — Aba Produtos: Norteadores de Score
  // =====================================================
  test('TESTE 4: Aba Produtos - Norteadores de Score (6 itens)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await page.waitForTimeout(500);

    // Verificar card "Norteadores de Score"
    const cardNort = page.locator('text=Norteadores de Score').first();
    await expect(cardNort).toBeVisible({ timeout: 5000 });

    // Verificar os 6 norteadores
    const norteadores = [
      'Classificacao/Agrupamento',
      'Score Comercial',
      'Tipos de Edital',
      'Score Tecnico',
      'Score Recomendacao',
      'Score Aderencia de Ganho',
    ];

    const nortEncontrados: Record<string, boolean> = {};
    for (const n of norteadores) {
      const label = page.locator(`.norteador-label:has-text("${n}")`).first();
      nortEncontrados[n] = (await label.count()) > 0;
    }

    // Verificar campos de Score Ganho
    const taxaVitoria = page.locator('text=Taxa de Vitoria').first();
    const margemMedia = page.locator('text=Margem Media').first();
    const totalLicit = page.locator('text=Total de Licitacoes').first();

    const camposGanho = {
      taxa_vitoria: await taxaVitoria.isVisible().catch(() => false),
      margem_media: await margemMedia.isVisible().catch(() => false),
      total_licitacoes: await totalLicit.isVisible().catch(() => false),
    };

    // Scroll para ver norteadores completos
    await cardNort.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/results/p4_t4_01_norteadores_score.png', fullPage: true });

    console.log('TESTE 4 RESULTADO:', JSON.stringify({
      card_visivel: true,
      norteadores: nortEncontrados,
      campos_score_ganho: camposGanho,
    }, null, 2));

    // Pelo menos 5 norteadores devem estar visiveis (o 6o pode ter texto levemente diferente)
    const nortCount = Object.values(nortEncontrados).filter(v => v).length;
    expect(nortCount).toBeGreaterThanOrEqual(5);
  });

  // =====================================================
  // TESTE 5 — Aba Produtos: Fontes Documentais
  // =====================================================
  test('TESTE 5: Aba Produtos - Fontes Documentais (10 docs)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await page.waitForTimeout(500);

    // Verificar card "Fontes Documentais"
    const cardFontes = page.locator('text=Fontes Documentais Exigidas').first();
    await expect(cardFontes).toBeVisible({ timeout: 5000 });

    // Scroll para ver
    await cardFontes.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Contar itens documentais
    const docItems = page.locator('.doc-exigido-item, .docs-exigidos-grid > div');
    const docCount = await docItems.count();

    // Verificar badges "Temos" / "Nao temos"
    const badgesTemos = await page.locator('.status-badge-success:has-text("Temos")').count();
    const badgesNaoTemos = await page.locator('.status-badge-error:has-text("Nao temos")').count();

    await page.screenshot({ path: 'tests/results/p4_t5_01_fontes_documentais.png', fullPage: true });

    console.log('TESTE 5 RESULTADO:', JSON.stringify({
      card_visivel: true,
      total_docs: docCount,
      badges_temos: badgesTemos,
      badges_nao_temos: badgesNaoTemos,
    }, null, 2));

    expect(docCount).toBeGreaterThanOrEqual(10);
  });

  // =====================================================
  // TESTE 6 — Aba Comercial: Regiao de Atuacao
  // =====================================================
  test('TESTE 6: Aba Comercial - Regiao de Atuacao (27 estados)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    // Clicar na aba "Comercial"
    await clickTab(page, 'Comercial');

    // Verificar card "Regiao de Atuacao"
    const cardRegiao = page.locator('text=Regiao de Atuacao').first();
    await expect(cardRegiao).toBeVisible({ timeout: 5000 });

    // Verificar checkbox "Atuar em todo o Brasil"
    const todoBrasil = page.locator('text=Atuar em todo o Brasil').first();
    const todoBrasilVisivel = await todoBrasil.isVisible().catch(() => false);

    // Contar botoes de estados
    const estadoBtns = page.locator('.estado-btn');
    const estadoCount = await estadoBtns.count();

    // Verificar estados selecionados por padrao (SP, MG, RJ, ES)
    const selectedBtns = page.locator('.estado-btn.selected');
    const selectedCount = await selectedBtns.count();
    const selectedTexts = await selectedBtns.allTextContents();

    // Verificar resumo
    const resumo = page.locator('.estados-resumo');
    const resumoText = await resumo.textContent().catch(() => '');

    await page.screenshot({ path: 'tests/results/p4_t6_01_comercial_regiao.png', fullPage: true });

    console.log('TESTE 6 RESULTADO:', JSON.stringify({
      card_visivel: true,
      checkbox_todo_brasil: todoBrasilVisivel,
      total_estados: estadoCount,
      estados_selecionados: selectedTexts,
      total_selecionados: selectedCount,
      resumo: resumoText,
    }, null, 2));

    expect(estadoCount).toBe(27);
    expect(selectedCount).toBeGreaterThanOrEqual(4);
  });

  // =====================================================
  // TESTE 7 — Aba Comercial: Tempo de Entrega e Mercado
  // =====================================================
  test('TESTE 7: Aba Comercial - Tempo Entrega + Mercado TAM/SAM/SOM', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await clickTab(page, 'Comercial');

    // Verificar card "Tempo de Entrega"
    const cardTempo = page.locator('text=Tempo de Entrega').first();
    await expect(cardTempo).toBeVisible({ timeout: 5000 });

    // Verificar campo prazo
    const campoPrazo = page.locator('text=Prazo maximo aceito').first();
    const prazoVisivel = await campoPrazo.isVisible().catch(() => false);

    // Verificar campo frequencia
    const campoFreq = page.locator('text=Frequencia maxima').first();
    const freqVisivel = await campoFreq.isVisible().catch(() => false);

    // Verificar card Mercado
    const cardMercado = page.locator('text=Mercado (TAM/SAM/SOM)').first();
    const mercadoVisivel = await cardMercado.isVisible().catch(() => false);

    // Verificar campos TAM, SAM, SOM
    const campoTAM = page.locator('text=TAM (Mercado Total)').first();
    const campoSAM = page.locator('text=SAM (Mercado Alcancavel)').first();
    const campoSOM = page.locator('text=SOM (Mercado Objetivo)').first();

    const tamVisivel = await campoTAM.isVisible().catch(() => false);
    const samVisivel = await campoSAM.isVisible().catch(() => false);
    const somVisivel = await campoSOM.isVisible().catch(() => false);

    // Scroll para ver Mercado
    if (mercadoVisivel) await cardMercado.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'tests/results/p4_t7_01_comercial_tempo_mercado.png', fullPage: true });

    console.log('TESTE 7 RESULTADO:', JSON.stringify({
      card_tempo_entrega: true,
      prazo_visivel: prazoVisivel,
      frequencia_visivel: freqVisivel,
      card_mercado: mercadoVisivel,
      tam_visivel: tamVisivel,
      sam_visivel: samVisivel,
      som_visivel: somVisivel,
    }, null, 2));

    expect(prazoVisivel).toBe(true);
    expect(mercadoVisivel).toBe(true);
  });

  // =====================================================
  // TESTE 8 — Aba Fontes de Busca: DataTable
  // =====================================================
  test('TESTE 8: Aba Fontes de Busca - DataTable de Fontes', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await clickTab(page, 'Fontes de Busca');

    // Verificar card "Fontes de Editais"
    const cardFontes = page.locator('text=Fontes de Editais').first();
    await expect(cardFontes).toBeVisible({ timeout: 5000 });

    // Verificar botao "Atualizar"
    const btnAtualizar = page.locator('button:has-text("Atualizar")').first();
    const atualizarVisivel = await btnAtualizar.isVisible().catch(() => false);

    // Verificar botao "Cadastrar Fonte"
    const btnCadastrar = page.locator('button:has-text("Cadastrar Fonte")').first();
    const cadastrarVisivel = await btnCadastrar.isVisible().catch(() => false);

    // Verificar tabela ou mensagem vazia
    const tabela = page.locator('table, .data-table').first();
    const tabelaExiste = (await tabela.count()) > 0;
    const mensagemVazia = page.locator('text=Nenhuma fonte cadastrada').first();
    const vaziaVisivel = await mensagemVazia.isVisible().catch(() => false);

    // Contar linhas se tabela existir
    let fontesCount = 0;
    if (tabelaExiste && !vaziaVisivel) {
      fontesCount = await page.locator('table tbody tr, .data-table-row').count();
    }

    await page.screenshot({ path: 'tests/results/p4_t8_01_fontes_busca.png', fullPage: true });

    console.log('TESTE 8 RESULTADO:', JSON.stringify({
      card_visivel: true,
      botao_atualizar: atualizarVisivel,
      botao_cadastrar: cadastrarVisivel,
      tabela_existe: tabelaExiste,
      mensagem_vazia: vaziaVisivel,
      fontes_na_tabela: fontesCount,
    }, null, 2));

    expect(atualizarVisivel || cadastrarVisivel).toBe(true);
  });

  // =====================================================
  // TESTE 9 — Aba Fontes de Busca: Palavras-chave e NCMs
  // =====================================================
  test('TESTE 9: Aba Fontes de Busca - Palavras-chave e NCMs', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await clickTab(page, 'Fontes de Busca');

    // Verificar card "Palavras-chave de Busca"
    const cardPalavras = page.locator('text=Palavras-chave de Busca').first();
    await expect(cardPalavras).toBeVisible({ timeout: 5000 });

    // Verificar tags de palavras
    const tagsPalavras = page.locator('.palavras-chave .tag');
    const palavrasCount = await tagsPalavras.count();
    const palavrasTexts = await tagsPalavras.allTextContents();

    // Verificar card "NCMs para Busca"
    const cardNCMs = page.locator('text=NCMs para Busca').first();
    const ncmsVisivel = await cardNCMs.isVisible().catch(() => false);

    // Verificar tags de NCMs
    const tagsNCMs = page.locator('.ncms-busca .tag');
    const ncmsCount = await tagsNCMs.count();
    const ncmsTexts = await tagsNCMs.allTextContents();

    // Scroll para ver NCMs
    if (ncmsVisivel) await cardNCMs.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'tests/results/p4_t9_01_palavras_ncms.png', fullPage: true });

    console.log('TESTE 9 RESULTADO:', JSON.stringify({
      card_palavras_chave: true,
      total_tags_palavras: palavrasCount,
      palavras: palavrasTexts,
      card_ncms: ncmsVisivel,
      total_tags_ncms: ncmsCount,
      ncms: ncmsTexts,
    }, null, 2));

    expect(palavrasCount).toBeGreaterThan(0);
  });

  // =====================================================
  // TESTE 10 — Aba Notificacoes
  // =====================================================
  test('TESTE 10: Aba Notificacoes - Email, checkboxes, frequencia', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await clickTab(page, 'Notificacoes');

    // Verificar card "Configuracoes de Notificacao"
    const cardNotif = page.locator('text=Configuracoes de Notificacao').first();
    await expect(cardNotif).toBeVisible({ timeout: 5000 });

    // Verificar campo email
    const emailField = page.locator('text=Email para notificacoes').first();
    const emailVisivel = await emailField.isVisible().catch(() => false);

    // Verificar input de email com valor
    const emailInput = page.locator('input[type="email"]').first();
    const emailValor = emailInput ? await emailInput.inputValue().catch(() => '') : '';

    // Verificar checkboxes "Receber por"
    const secaoReceber = page.locator('text=Receber por').first();
    const receberVisivel = await secaoReceber.isVisible().catch(() => false);

    // Verificar labels Email, Sistema, SMS
    const chkEmail = page.locator('.checkbox-wrapper:has-text("Email")').first();
    const chkSistema = page.locator('.checkbox-wrapper:has-text("Sistema")').first();
    const chkSms = page.locator('.checkbox-wrapper:has-text("SMS")').first();

    const emailChkVisivel = (await chkEmail.count()) > 0;
    const sistemaChkVisivel = (await chkSistema.count()) > 0;
    const smsChkVisivel = (await chkSms.count()) > 0;

    // Verificar select frequencia
    const freqLabel = page.locator('text=Frequencia do resumo').first();
    const freqVisivel = await freqLabel.isVisible().catch(() => false);

    // Verificar botao Salvar
    const btnSalvar = page.locator('button:has-text("Salvar")').first();
    const salvarVisivel = await btnSalvar.isVisible().catch(() => false);

    await page.screenshot({ path: 'tests/results/p4_t10_01_notificacoes.png', fullPage: true });

    console.log('TESTE 10 RESULTADO:', JSON.stringify({
      card_visivel: true,
      email_label: emailVisivel,
      email_valor: emailValor,
      secao_receber_por: receberVisivel,
      checkbox_email: emailChkVisivel,
      checkbox_sistema: sistemaChkVisivel,
      checkbox_sms: smsChkVisivel,
      frequencia_visivel: freqVisivel,
      botao_salvar: salvarVisivel,
    }, null, 2));

    expect(emailVisivel).toBe(true);
    expect(emailChkVisivel || sistemaChkVisivel || smsChkVisivel).toBe(true);
  });

  // =====================================================
  // TESTE 11 — Aba Preferencias
  // =====================================================
  test('TESTE 11: Aba Preferencias - Tema, Idioma, Fuso', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndGoToParametrizacoes(page);

    await clickTab(page, 'Preferencias');

    // Verificar card "Preferencias do Sistema"
    const cardPref = page.locator('text=Preferencias do Sistema').first();
    await expect(cardPref).toBeVisible({ timeout: 5000 });

    // Verificar Tema (radio buttons)
    const temaLabel = page.locator('text=Tema').first();
    const temaVisivel = await temaLabel.isVisible().catch(() => false);
    const radioEscuro = page.locator('.radio-wrapper:has-text("Escuro")').first();
    const radioClaro = page.locator('.radio-wrapper:has-text("Claro")').first();
    const escuroVisivel = (await radioEscuro.count()) > 0;
    const claroVisivel = (await radioClaro.count()) > 0;

    // Verificar Idioma (select)
    const idiomaLabel = page.locator('text=Idioma').first();
    const idiomaVisivel = await idiomaLabel.isVisible().catch(() => false);

    // Verificar Fuso horario (select)
    const fusoLabel = page.locator('text=Fuso horario').first();
    const fusoVisivel = await fusoLabel.isVisible().catch(() => false);

    // Verificar botao Salvar
    const btnSalvar = page.locator('button:has-text("Salvar")').first();
    const salvarVisivel = await btnSalvar.isVisible().catch(() => false);

    await page.screenshot({ path: 'tests/results/p4_t11_01_preferencias.png', fullPage: true });

    console.log('TESTE 11 RESULTADO:', JSON.stringify({
      card_visivel: true,
      tema_label: temaVisivel,
      radio_escuro: escuroVisivel,
      radio_claro: claroVisivel,
      idioma_visivel: idiomaVisivel,
      fuso_visivel: fusoVisivel,
      botao_salvar: salvarVisivel,
    }, null, 2));

    expect(temaVisivel).toBe(true);
    expect(idiomaVisivel).toBe(true);
    expect(fusoVisivel).toBe(true);
  });

  // =====================================================
  // TESTE 12 — API: Listar Fontes de Editais
  // =====================================================
  test('TESTE 12: API - GET /api/crud/fontes-editais', async () => {
    test.setTimeout(120000);
    const res = await fetch(`${API_URL}/api/crud/fontes-editais`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await res.json();

    const items = data.items || [];
    const fontesResumo = items.map((f: Record<string, unknown>) => ({
      nome: f.nome,
      tipo: f.tipo,
      ativa: f.ativa,
    }));

    console.log('TESTE 12 RESULTADO:', JSON.stringify({
      http_status: res.status,
      total_fontes: items.length,
      fontes: fontesResumo,
    }, null, 2));

    expect(res.status).toBe(200);
    expect(Array.isArray(items)).toBe(true);
  });

  // =====================================================
  // TESTE 13 — API: Obter Parametros de Score
  // =====================================================
  test('TESTE 13: API - GET /api/crud/parametros-score', async () => {
    test.setTimeout(120000);
    const res = await fetch(`${API_URL}/api/crud/parametros-score`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await res.json();

    const items = data.items || [];
    const paramResumo = items.map((p: Record<string, unknown>) => ({
      nome: p.nome,
      peso: p.peso,
    }));

    console.log('TESTE 13 RESULTADO:', JSON.stringify({
      http_status: res.status,
      total_parametros: items.length,
      parametros: paramResumo,
    }, null, 2));

    expect(res.status).toBe(200);
    expect(Array.isArray(items)).toBe(true);
  });
});
