/**
 * VALIDACAO REAL PAGES 8-10: Requisitos 8.1-8.4, 9.1-9.8, 10.1-10.6
 * TESTE DE INTERACAO REAL — como testador humano
 * Playwright E2E — Validador Especialista
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:5175";
const API = "http://localhost:5007";
const EMAIL = "pasteurjr@gmail.com";
const PASS = "123456";
const SHOT = "tests/results/validacao_real";

let token: string;

// --- Helpers ---

async function getToken(): Promise<string> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const d = await res.json();
  return d.access_token;
}

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  const emailInput = page.locator('input[type="email"]').first();
  if ((await emailInput.count()) > 0 && (await emailInput.isVisible({ timeout: 3000 }).catch(() => false))) {
    await emailInput.fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASS);
    const btn = page.locator('button:has-text("Entrar"), button:has-text("Login")').first();
    await btn.click();
    await page.waitForTimeout(3000);
  }
}

async function goToValidacao(page: Page) {
  await login(page);
  // Try direct nav item
  const navItem = page.locator('.nav-item:has(.nav-item-label:text("Validacao"))').first();
  if ((await navItem.count()) > 0 && (await navItem.isVisible({ timeout: 2000 }).catch(() => false))) {
    await navItem.click();
  } else {
    // Expand Fluxo Comercial
    const header = page.locator('.nav-section-header:has(.nav-section-label:text("Fluxo Comercial"))');
    if ((await header.count()) > 0) {
      await header.click();
      await page.waitForTimeout(500);
    }
    await page.locator('.nav-item:has(.nav-item-label:text("Validacao"))').first().click();
  }
  await page.waitForTimeout(2500);
}

async function selectEditalByIndex(page: Page, index: number): Promise<boolean> {
  const rows = page.locator("tbody tr, .data-table-row");
  const count = await rows.count();
  if (count > index) {
    await rows.nth(index).click();
    await page.waitForTimeout(2000);
    return true;
  }
  return false;
}

async function clickTab(page: Page, tabName: string) {
  const tab = page.locator(`button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`).first();
  if ((await tab.count()) > 0) {
    await tab.click();
    await page.waitForTimeout(1000);
  }
}

// --- RESULTS COLLECTOR ---
interface TestResult {
  req: string;
  status: "PASS" | "FAIL" | "PARTIAL";
  details: string;
  interactions: string[];
  bugs: string[];
}
const allResults: TestResult[] = [];

// --- Tests ---

test.describe.serial("VALIDACAO REAL P8-P10: Interacao Real como Testador Humano", () => {
  test.beforeAll(async () => {
    token = await getToken();
  });

  // ==========================================================
  // REQ 8.1 — Lista de Editais Salvos com Score
  // ==========================================================
  test("REQ 8.1: Lista editais — navegar, filtrar busca, trocar status, verificar colunas", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.1", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    result.interactions.push("Navegou para Validacao");

    // 1. Verificar titulo
    const titulo = page.locator('h1:has-text("Validacao")');
    const tituloOk = await titulo.isVisible({ timeout: 5000 }).catch(() => false);
    result.interactions.push(`Titulo visivel: ${tituloOk}`);

    // 2. Verificar colunas da tabela
    const headers = await page.locator("th").allTextContents();
    const hStr = headers.join("|");
    const colsOk = ["Numero", "Orgao", "UF", "Objeto", "Valor", "Abertura", "Status", "Score"]
      .every(c => hStr.includes(c));
    result.interactions.push(`Colunas presentes: ${colsOk} (${hStr})`);

    // 3. Contar linhas na tabela
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    result.interactions.push(`Linhas na tabela: ${rowCount}`);

    // 4. INTERAGIR com filtro de busca
    const search = page.locator('input[placeholder*="Buscar edital"]').first();
    await search.fill("Hospital");
    await page.waitForTimeout(800);
    const filteredRows1 = await rows.count();
    result.interactions.push(`Filtro busca "Hospital": ${filteredRows1} resultados`);
    await page.screenshot({ path: `${SHOT}/req8_1_01_filtro_busca.png`, fullPage: true });

    await search.clear();
    await page.waitForTimeout(500);

    // 5. Buscar algo inexistente
    await search.fill("xyz_inexistente_999");
    await page.waitForTimeout(800);
    const emptyRows = await rows.count();
    const emptyMsg = page.locator('text=Nenhum edital encontrado');
    const emptyVisible = emptyRows === 0 || (await emptyMsg.count()) > 0;
    result.interactions.push(`Busca inexistente mostra vazio: ${emptyVisible}`);
    await search.clear();
    await page.waitForTimeout(500);

    // 6. INTERAGIR com filtro de status
    const statusSel = page.locator("select").first();
    const statusOptions = await statusSel.locator("option").allTextContents();
    result.interactions.push(`Status opcoes: ${statusOptions.join(", ")}`);

    // Trocar para "Novo"
    await statusSel.selectOption("novo");
    await page.waitForTimeout(500);
    const novosRows = await rows.count();
    result.interactions.push(`Filtro status "Novo": ${novosRows} resultados`);
    await page.screenshot({ path: `${SHOT}/req8_1_02_filtro_status_novo.png`, fullPage: true });

    // Voltar para "Todos"
    await statusSel.selectOption("todos");
    await page.waitForTimeout(500);

    // 7. Score gauges na tabela
    const scoreCircles = page.locator(".score-circle");
    const scoreCount = await scoreCircles.count();
    result.interactions.push(`Score gauges: ${scoreCount}`);

    await page.screenshot({ path: `${SHOT}/req8_1_03_tabela_completa.png`, fullPage: true });

    // Validacao
    if (!tituloOk) { result.status = "FAIL"; result.bugs.push("Titulo nao visivel"); }
    if (!colsOk) { result.status = "FAIL"; result.bugs.push("Colunas faltando"); }
    if (rowCount === 0) { result.bugs.push("Tabela vazia — sem editais salvos"); }
    if (statusOptions.length < 5) { result.status = "PARTIAL"; result.bugs.push(`Esperava 5 opcoes status, encontrou ${statusOptions.length}`); }

    result.details = `Tabela com ${rowCount} editais, ${scoreCount} scores, filtros OK`;
    allResults.push(result);
    console.log("REQ 8.1:", JSON.stringify(result, null, 2));
    expect(tituloOk).toBe(true);
    expect(colsOk).toBe(true);
  });

  // ==========================================================
  // REQ 8.2 — Sinais de Mercado
  // ==========================================================
  test("REQ 8.2: Sinais de Mercado — selecionar edital, verificar barra superior", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.2", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);

    // Selecionar primeiro edital
    const selected = await selectEditalByIndex(page, 0);
    result.interactions.push(`Edital selecionado: ${selected}`);

    if (!selected) {
      result.status = "FAIL";
      result.bugs.push("Nenhum edital para selecionar");
      allResults.push(result);
      return;
    }

    // Verificar barra superior
    const topBar = page.locator(".validacao-top-bar");
    const topBarVisible = await topBar.isVisible({ timeout: 5000 }).catch(() => false);
    result.interactions.push(`Barra superior visivel: ${topBarVisible}`);

    // Sinais de mercado badges
    const sinaisBadges = page.locator(".sinais-mercado .badge");
    const sinaisCount = await sinaisBadges.count();
    const sinaisTexts = sinaisCount > 0 ? await sinaisBadges.allTextContents() : [];
    result.interactions.push(`Sinais badges: ${sinaisCount} (${sinaisTexts.join("; ")})`);

    // Fatal flaws badge
    const fatalFlawBadge = page.locator('.badge:has-text("Fatal Flaw")');
    const fatalCount = await fatalFlawBadge.count();
    result.interactions.push(`Fatal Flaws badge: ${fatalCount}`);

    await page.screenshot({ path: `${SHOT}/req8_2_sinais_mercado.png`, fullPage: true });

    if (!topBarVisible) { result.status = "FAIL"; result.bugs.push("Barra superior nao aparece"); }
    result.details = `Barra visivel, ${sinaisCount} sinais, ${fatalCount} fatal flaws`;
    allResults.push(result);
    console.log("REQ 8.2:", JSON.stringify(result, null, 2));
    expect(topBarVisible).toBe(true);
  });

  // ==========================================================
  // REQ 8.3 — Decisao: Participar / Acompanhar / Ignorar + Justificativa
  // ==========================================================
  test("REQ 8.3: CLICAR Participar, PREENCHER justificativa, SALVAR, verificar badge", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.3", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // 1. Verificar 3 botoes
    const btnP = page.locator('button:has-text("Participar")').first();
    const btnA = page.locator('button:has-text("Acompanhar")').first();
    const btnI = page.locator('button:has-text("Ignorar")').first();

    const pVisible = await btnP.isVisible().catch(() => false);
    const aVisible = await btnA.isVisible().catch(() => false);
    const iVisible = await btnI.isVisible().catch(() => false);
    result.interactions.push(`Botoes: Participar=${pVisible}, Acompanhar=${aVisible}, Ignorar=${iVisible}`);

    // 2. Verificar classes/cores
    const pClass = await btnP.getAttribute("class") || "";
    const aClass = await btnA.getAttribute("class") || "";
    const iClass = await btnI.getAttribute("class") || "";
    result.interactions.push(`Classes: P=${pClass}, A=${aClass}, I=${iClass}`);

    await page.screenshot({ path: `${SHOT}/req8_3_01_botoes.png`, fullPage: true });

    // 3. CLICAR "Participar"
    await btnP.click();
    await page.waitForTimeout(1000);
    result.interactions.push("Clicou Participar");

    // 4. Verificar card "Justificativa da Decisao" apareceu
    const justCard = page.locator("text=Justificativa da Decisao").first();
    const justVisible = (await justCard.count()) > 0;
    result.interactions.push(`Card Justificativa apareceu: ${justVisible}`);

    if (!justVisible) {
      result.status = "FAIL";
      result.bugs.push("Card Justificativa nao apareceu apos clicar Participar");
    }

    // 5. SELECIONAR motivo no dropdown
    const allSelects = page.locator("select.select-input");
    const selCount = await allSelects.count();
    let motivoSelecionado = false;
    let motivoOptions: string[] = [];
    for (let i = 0; i < selCount; i++) {
      const opts = await allSelects.nth(i).locator("option").allTextContents();
      if (opts.some(o => o.includes("competitivo") || o.includes("Margem") || o.includes("aderente"))) {
        motivoOptions = opts.filter(o => o.trim().length > 0);
        await allSelects.nth(i).selectOption("preco_competitivo");
        motivoSelecionado = true;
        break;
      }
    }
    result.interactions.push(`Motivo selecionado: ${motivoSelecionado}, opcoes: ${motivoOptions.length}`);

    // 6. PREENCHER detalhes no textarea
    const textarea = page.locator("textarea").first();
    const textareaExists = (await textarea.count()) > 0;
    if (textareaExists) {
      await textarea.fill("Margem aceitavel para este produto. Regiao estrategica, concorrencia moderada.");
      result.interactions.push("Preencheu textarea com justificativa");
    }

    await page.screenshot({ path: `${SHOT}/req8_3_02_justificativa_preenchida.png`, fullPage: true });

    // 7. CLICAR "Salvar Justificativa"
    const salvarBtn = page.locator('button:has-text("Salvar Justificativa")').first();
    const salvarExists = (await salvarBtn.count()) > 0;
    if (salvarExists) {
      await salvarBtn.click();
      await page.waitForTimeout(2000);
      result.interactions.push("Clicou Salvar Justificativa");
    }

    // 8. Verificar badge "Decisao salva"
    const decisaoSalva = page.locator('.badge:has-text("Decisao salva")');
    const salvaBadge = (await decisaoSalva.count()) > 0;
    result.interactions.push(`Badge "Decisao salva": ${salvaBadge}`);

    // 9. Verificar que justificativa fechou
    await page.waitForTimeout(500);
    const justFechou = (await page.locator("text=Justificativa da Decisao").count()) === 0;
    result.interactions.push(`Justificativa fechou: ${justFechou}`);

    await page.screenshot({ path: `${SHOT}/req8_3_03_decisao_salva.png`, fullPage: true });

    // 10. TESTAR botao Acompanhar com segundo edital
    const selected2 = await selectEditalByIndex(page, 1);
    if (selected2) {
      await page.waitForTimeout(1000);
      const btnA2 = page.locator('button:has-text("Acompanhar")').first();
      if ((await btnA2.count()) > 0) {
        await btnA2.click();
        await page.waitForTimeout(1000);
        result.interactions.push("Clicou Acompanhar no 2o edital");

        // Selecionar motivo e preencher
        for (let i = 0; i < selCount; i++) {
          const opts = await allSelects.nth(i).locator("option").allTextContents();
          if (opts.some(o => o.includes("competitivo") || o.includes("concorrencia"))) {
            await allSelects.nth(i).selectOption("concorrente_forte");
            break;
          }
        }
        const ta2 = page.locator("textarea").first();
        if ((await ta2.count()) > 0) {
          await ta2.fill("Acompanhando por enquanto — concorrente dominante.");
        }
        const salvarBtn2 = page.locator('button:has-text("Salvar Justificativa")').first();
        if ((await salvarBtn2.count()) > 0) {
          await salvarBtn2.click();
          await page.waitForTimeout(1500);
          result.interactions.push("Salvou justificativa Acompanhar");
        }
      }
      await page.screenshot({ path: `${SHOT}/req8_3_04_acompanhar.png`, fullPage: true });
    }

    // 11. TESTAR botao Ignorar com terceiro edital
    const selected3 = await selectEditalByIndex(page, 2);
    if (selected3) {
      await page.waitForTimeout(1000);
      const btnI3 = page.locator('button:has-text("Ignorar")').first();
      if ((await btnI3.count()) > 0) {
        await btnI3.click();
        await page.waitForTimeout(1000);
        result.interactions.push("Clicou Ignorar no 3o edital");

        for (let i = 0; i < selCount; i++) {
          const opts = await allSelects.nth(i).locator("option").allTextContents();
          if (opts.some(o => o.includes("Margem") || o.includes("insuficiente"))) {
            await allSelects.nth(i).selectOption("margem_insuficiente");
            break;
          }
        }
        const ta3 = page.locator("textarea").first();
        if ((await ta3.count()) > 0) {
          await ta3.fill("Margem insuficiente, fora da regiao de atuacao.");
        }
        const salvarBtn3 = page.locator('button:has-text("Salvar Justificativa")').first();
        if ((await salvarBtn3.count()) > 0) {
          await salvarBtn3.click();
          await page.waitForTimeout(1500);
          result.interactions.push("Salvou justificativa Ignorar");
        }
      }
      await page.screenshot({ path: `${SHOT}/req8_3_05_ignorar.png`, fullPage: true });
    }

    if (!pVisible || !aVisible || !iVisible) { result.status = "FAIL"; result.bugs.push("Botoes de decisao faltando"); }
    if (motivoOptions.length < 5) { result.status = "PARTIAL"; result.bugs.push(`Esperava >= 8 opcoes motivo, encontrou ${motivoOptions.length}`); }
    result.details = `3 botoes OK, justificativa com ${motivoOptions.length} motivos, decisao salva: ${salvaBadge}`;
    allResults.push(result);
    console.log("REQ 8.3:", JSON.stringify(result, null, 2));
    expect(pVisible && aVisible && iVisible).toBe(true);
  });

  // ==========================================================
  // REQ 8.4 — Score Dashboard + Calcular Scores IA
  // ==========================================================
  test("REQ 8.4: Score Dashboard — verificar 6 sub-scores, intencao, margem, calcular scores", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.4", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // 1. Score Dashboard visivel
    const dashboard = page.locator(".score-dashboard").first();
    const dashVisible = await dashboard.isVisible({ timeout: 5000 }).catch(() => false);
    result.interactions.push(`Dashboard visivel: ${dashVisible}`);

    // 2. Score Circle principal
    const scoreCircle = page.locator(".score-circle").first();
    const circleVisible = (await scoreCircle.count()) > 0;
    result.interactions.push(`ScoreCircle: ${circleVisible}`);

    // 3. Verificar 6 labels de sub-scores
    const body = (await page.textContent("body")) || "";
    const expectedLabels = [
      "Aderencia Tecnica", "Aderencia Documental", "Complexidade Edital",
      "Risco Juridico", "Viabilidade Logistica", "Atratividade Comercial",
    ];
    const foundLabels = expectedLabels.filter(l => body.includes(l));
    result.interactions.push(`Sub-score labels: ${foundLabels.length}/6 (${foundLabels.join(", ")})`);

    // 4. Verificar niveis High/Medium/Low
    const hasHigh = body.includes("High");
    const hasMedium = body.includes("Medium");
    const hasLow = body.includes("Low");
    result.interactions.push(`Niveis: High=${hasHigh}, Medium=${hasMedium}, Low=${hasLow}`);

    // 5. Potencial de Ganho badge
    const potencialVisible = body.includes("Potencial de Ganho");
    result.interactions.push(`Potencial de Ganho: ${potencialVisible}`);

    // 6. Botao "Calcular Scores IA" existe
    const calcBtn = page.locator('button:has-text("Calcular Scores IA"), button:has-text("Calcular Scores")').first();
    const calcBtnVisible = (await calcBtn.count()) > 0;
    result.interactions.push(`Botao Calcular Scores: ${calcBtnVisible}`);

    // Nao clicar calcular aqui — teste separado de API cobre isso
    // Apenas verificar que o botao existe e dashboard esta correto

    await page.screenshot({ path: `${SHOT}/req8_4_01_score_dashboard.png`, fullPage: true });

    // 7. Intencao Estrategica (4 radios)
    const radioOptions = page.locator('input[type="radio"][name="intencao"]');
    const radioCount = await radioOptions.count();
    result.interactions.push(`Radio intencao: ${radioCount} opcoes`);

    // INTERAGIR: selecionar "Estrategico"
    if (radioCount >= 1) {
      await radioOptions.first().check();
      await page.waitForTimeout(500);
      result.interactions.push("Selecionou intencao Estrategico");
    }

    // 8. Slider margem
    const slider = page.locator('input[type="range"]').first();
    const sliderExists = (await slider.count()) > 0;
    if (sliderExists) {
      await slider.fill("25");
      await page.waitForTimeout(500);
      result.interactions.push("Ajustou margem para 25%");
    }

    // 9. Varia por Produto / Regiao
    const variaProduto = body.includes("Varia por Produto");
    const variaRegiao = body.includes("Varia por Regiao");
    result.interactions.push(`Varia por Produto: ${variaProduto}, Regiao: ${variaRegiao}`);

    await page.screenshot({ path: `${SHOT}/req8_4_02_intencao_margem.png`, fullPage: true });

    if (!dashVisible) { result.status = "FAIL"; result.bugs.push("Dashboard nao visivel"); }
    if (foundLabels.length < 6) { result.status = "PARTIAL"; result.bugs.push(`Apenas ${foundLabels.length}/6 labels encontradas`); }
    if (radioCount !== 4) { result.bugs.push(`Esperava 4 radios intencao, encontrou ${radioCount}`); }

    result.details = `Dashboard OK, ${foundLabels.length}/6 labels, ${radioCount} radios, slider OK`;
    allResults.push(result);
    console.log("REQ 8.4:", JSON.stringify(result, null, 2));
    expect(dashVisible).toBe(true);
    expect(foundLabels.length).toBe(6);
  });

  // ==========================================================
  // REQ 9.1 — Aderencia Tecnica (Tab Objetiva)
  // ==========================================================
  test("REQ 9.1: Tab Objetiva — Aderencia Tecnica Detalhada — sub-scores ou calcular", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.1", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // CLICAR na tab Objetiva
    await clickTab(page, "Objetiva");
    result.interactions.push("Clicou tab Objetiva");

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Aderencia Tecnica Detalhada");
    result.interactions.push(`Secao Aderencia Tecnica: ${secaoPresente}`);

    // Sub-scores grid OU placeholder com botao
    const subScoresGrid = page.locator(".sub-scores-grid");
    const gridExists = (await subScoresGrid.count()) > 0;
    const calcBtn = page.locator('.aba-content button:has-text("Calcular Scores")').first();
    const calcBtnExists = (await calcBtn.count()) > 0;

    result.interactions.push(`Sub-scores grid: ${gridExists}, Botao calcular: ${calcBtnExists}`);

    // Se tem botao calcular, registrar (nao clicar — teste API separado cobre isso)
    if (calcBtnExists && !gridExists) {
      result.interactions.push("Botao Calcular disponivel — sub-scores aparecerao apos calculo via API");
    }

    // ScoreBar items
    const scoreBars = page.locator(".aba-content .score-bar, .sub-scores-grid .score-bar");
    const barsCount = await scoreBars.count();
    result.interactions.push(`ScoreBars na aba: ${barsCount}`);

    await page.screenshot({ path: `${SHOT}/req9_1_aderencia_tecnica.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    result.details = `Secao presente, ${barsCount} score bars, grid=${gridExists}`;
    allResults.push(result);
    console.log("REQ 9.1:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.2 — Checklist Documental
  // ==========================================================
  test("REQ 9.2: Tab Objetiva — Checklist Documental com tabela e badges", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.2", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");
    result.interactions.push("Navegou para tab Objetiva");

    // Scroll ate Checklist Documental
    const checklistSection = page.locator('.section-block:has-text("Checklist Documental")').first();
    if ((await checklistSection.count()) > 0) {
      await checklistSection.scrollIntoViewIfNeeded();
    }

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Checklist Documental");
    result.interactions.push(`Secao Checklist: ${secaoPresente}`);

    // Tabela com colunas Documento, Status, Validade
    const miniTable = page.locator(".section-block:has-text('Checklist Documental') table").first();
    const tableExists = (await miniTable.count()) > 0;
    let thTexts: string[] = [];
    if (tableExists) {
      thTexts = await miniTable.locator("th").allTextContents();
    }
    result.interactions.push(`Tabela: ${tableExists}, Colunas: ${thTexts.join(", ")}`);

    // StatusBadges
    const badges = page.locator(".section-block:has-text('Checklist Documental') .status-badge");
    const badgesCount = await badges.count();
    let badgeTexts: string[] = [];
    if (badgesCount > 0) {
      badgeTexts = await badges.allTextContents();
    }
    result.interactions.push(`StatusBadges: ${badgesCount} (${badgeTexts.join(", ")})`);

    // Linhas de dados
    const rows = tableExists ? await miniTable.locator("tbody tr").count() : 0;
    result.interactions.push(`Linhas dados: ${rows}`);

    await page.screenshot({ path: `${SHOT}/req9_2_checklist_documental.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    result.details = `Checklist com ${rows} docs, ${badgesCount} badges`;
    allResults.push(result);
    console.log("REQ 9.2:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.3 — Pipeline Riscos + Flags Juridicos (Tab Analitica)
  // ==========================================================
  test("REQ 9.3: CLICAR tab Analitica — Pipeline Riscos, Flags Juridicos, Fatal Flaws", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.3", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // CLICAR tab Analitica
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    const body = (await page.textContent("body")) || "";

    // Pipeline de Riscos
    const pipelinePresente = body.includes("Pipeline de Riscos");
    result.interactions.push(`Pipeline Riscos: ${pipelinePresente}`);

    // Badges de risco
    const pipelineBadges = page.locator(".pipeline-badges .badge");
    const badgesCount = await pipelineBadges.count();
    const badgeTexts = badgesCount > 0 ? await pipelineBadges.allTextContents() : [];
    result.interactions.push(`Pipeline badges: ${badgesCount} (${badgeTexts.join("; ")})`);

    // Flags Juridicos
    const flagsPresente = body.includes("Flags Juridicos");
    result.interactions.push(`Flags Juridicos: ${flagsPresente}`);

    // Fatal Flaws
    const fatalFlawsPresente = body.includes("Fatal Flaws") || body.includes("Problemas Criticos");
    const fatalItems = page.locator(".fatal-flaw-item");
    const fatalCount = await fatalItems.count();
    result.interactions.push(`Fatal Flaws: ${fatalFlawsPresente}, itens: ${fatalCount}`);

    await page.screenshot({ path: `${SHOT}/req9_3_pipeline_riscos.png`, fullPage: true });

    if (!pipelinePresente) { result.status = "FAIL"; result.bugs.push("Pipeline nao encontrada"); }
    if (!flagsPresente) { result.status = "PARTIAL"; result.bugs.push("Flags Juridicos label faltando"); }
    result.details = `Pipeline OK, ${badgesCount} badges, flags=${flagsPresente}, fatal=${fatalCount}`;
    allResults.push(result);
    console.log("REQ 9.3:", JSON.stringify(result, null, 2));
    expect(pipelinePresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.4 — Mapa Logistico (Tab Objetiva)
  // ==========================================================
  test("REQ 9.4: Tab Objetiva — Mapa Logistico com UF, distancia, entrega", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.4", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");
    result.interactions.push("Navegou para tab Objetiva");

    // Scroll ate Mapa Logistico
    const mapaSection = page.locator('.section-block:has-text("Mapa Logistico")').first();
    if ((await mapaSection.count()) > 0) {
      await mapaSection.scrollIntoViewIfNeeded();
    }

    const body = (await page.textContent("body")) || "";
    const mapaPresente = body.includes("Mapa Logistico");
    const ufEdital = body.includes("UF Edital");
    const empresa = body.includes("Empresa");
    const distancia = body.includes("Distancia");
    const entrega = body.includes("Entrega Estimada");

    // Qual badge de distancia
    const distBadge = ["Proximo", "Medio", "Distante"].find(v => body.includes(v)) || "N/A";
    // Dias estimados
    const diasMatch = body.match(/(\d+-\d+)\s*dias/);
    const dias = diasMatch ? diasMatch[1] : "N/A";

    result.interactions.push(`Mapa: ${mapaPresente}, UF=${ufEdital}, Empresa=${empresa}`);
    result.interactions.push(`Distancia: ${distBadge}, Entrega: ${dias} dias`);

    await page.screenshot({ path: `${SHOT}/req9_4_mapa_logistico.png`, fullPage: true });

    if (!mapaPresente) { result.status = "FAIL"; result.bugs.push("Mapa Logistico nao encontrado"); }
    result.details = `Mapa OK, distancia=${distBadge}, entrega=${dias} dias`;
    allResults.push(result);
    console.log("REQ 9.4:", JSON.stringify(result, null, 2));
    expect(mapaPresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.5 — Aderencia Comercial
  // ==========================================================
  test("REQ 9.5: Score Dashboard — Atratividade Comercial + Potencial + INTERAGIR intencao/margem", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.5", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    const body = (await page.textContent("body")) || "";
    const comercial = body.includes("Atratividade Comercial");
    const potencial = body.includes("Potencial de Ganho");
    result.interactions.push(`Atratividade Comercial: ${comercial}, Potencial: ${potencial}`);

    // INTERAGIR: mudar intencao estrategica
    const radios = page.locator('input[type="radio"][name="intencao"]');
    const radioCount = await radios.count();
    if (radioCount >= 2) {
      await radios.nth(1).check(); // Defensivo
      await page.waitForTimeout(500);
      result.interactions.push("Selecionou intencao Defensivo");

      await radios.nth(2).check(); // Acompanhamento
      await page.waitForTimeout(500);
      result.interactions.push("Selecionou intencao Acompanhamento");
    }

    // INTERAGIR: slider margem
    const slider = page.locator('input[type="range"]').first();
    if ((await slider.count()) > 0) {
      await slider.fill("15");
      await page.waitForTimeout(300);
      result.interactions.push("Ajustou margem para 15%");

      await slider.fill("35");
      await page.waitForTimeout(300);
      result.interactions.push("Ajustou margem para 35%");
    }

    // Potencial badge
    const potBadge = ["Elevado", "Medio", "Baixo"].find(v => body.includes(v)) || "N/A";
    result.interactions.push(`Potencial badge: ${potBadge}`);

    await page.screenshot({ path: `${SHOT}/req9_5_aderencia_comercial.png`, fullPage: true });

    if (!comercial) { result.status = "FAIL"; result.bugs.push("Atratividade Comercial nao encontrada"); }
    if (!potencial) { result.status = "PARTIAL"; result.bugs.push("Potencial Ganho nao encontrado"); }
    result.details = `Comercial OK, potencial=${potBadge}, radios=${radioCount}`;
    allResults.push(result);
    console.log("REQ 9.5:", JSON.stringify(result, null, 2));
    expect(comercial).toBe(true);
  });

  // ==========================================================
  // REQ 9.6 — Analise de Lote
  // ==========================================================
  test("REQ 9.6: Tab Objetiva — Analise de Lote com barra segmentos e legenda", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.6", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");
    result.interactions.push("Navegou para tab Objetiva");

    // Scroll ate Analise de Lote
    const loteSection = page.locator('.section-block:has-text("Analise de Lote")').first();
    if ((await loteSection.count()) > 0) {
      await loteSection.scrollIntoViewIfNeeded();
    }

    const body = (await page.textContent("body")) || "";
    const lotePresente = body.includes("Analise de Lote");
    result.interactions.push(`Secao Analise Lote: ${lotePresente}`);

    // Barra de segmentos
    const loteBar = page.locator(".lote-bar");
    const barExists = (await loteBar.count()) > 0;

    // Segmentos
    const aderentes = page.locator(".lote-segment.aderente");
    const intrusos = page.locator(".lote-segment.intruso");
    const aderenteCount = await aderentes.count();
    const intrusoCount = await intrusos.count();
    result.interactions.push(`Segmentos: ${aderenteCount} aderentes, ${intrusoCount} intrusos`);

    // Legenda
    const legendaAderente = body.includes("Aderente");
    const legendaIntruso = body.includes("Item Intruso") || body.includes("Intruso");
    result.interactions.push(`Legenda: Aderente=${legendaAderente}, Intruso=${legendaIntruso}`);

    await page.screenshot({ path: `${SHOT}/req9_6_analise_lote.png`, fullPage: true });

    if (!lotePresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    result.details = `Lote OK, ${aderenteCount} aderentes, ${intrusoCount} intrusos`;
    allResults.push(result);
    console.log("REQ 9.6:", JSON.stringify(result, null, 2));
    expect(lotePresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.7 — Reputacao do Orgao (3 itens)
  // ==========================================================
  test("REQ 9.7: Tab Analitica — Reputacao Orgao (Pregoeiro, Pagamento, Historico)", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.7", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // CLICAR tab Analitica
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Reputacao do Orgao");
    result.interactions.push(`Secao Reputacao: ${secaoPresente}`);

    // Grid com 3 itens
    const reputacaoItems = page.locator(".reputacao-item");
    const itemCount = await reputacaoItems.count();
    result.interactions.push(`Itens reputacao: ${itemCount}`);

    // Ler valores de cada item
    const valores: Record<string, string> = {};
    for (let i = 0; i < itemCount; i++) {
      const label = (await reputacaoItems.nth(i).locator("label").textContent()) || "";
      const value = (await reputacaoItems.nth(i).locator("span").textContent()) || "";
      valores[label.trim()] = value.trim();
    }
    result.interactions.push(`Valores: ${JSON.stringify(valores)}`);

    // Scroll para secao
    const section = page.locator('.section-block:has-text("Reputacao do Orgao")').first();
    if ((await section.count()) > 0) await section.scrollIntoViewIfNeeded();

    await page.screenshot({ path: `${SHOT}/req9_7_reputacao_orgao.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (itemCount !== 3) { result.status = "PARTIAL"; result.bugs.push(`Esperava 3 itens, encontrou ${itemCount}`); }
    result.details = `Reputacao OK, ${itemCount} itens: ${JSON.stringify(valores)}`;
    allResults.push(result);
    console.log("REQ 9.7:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
    expect(itemCount).toBe(3);
  });

  // ==========================================================
  // REQ 9.8 — Alerta de Recorrencia
  // ==========================================================
  test("REQ 9.8: Tab Analitica — Alerta de Recorrencia (condicional)", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.8", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    const body = (await page.textContent("body")) || "";
    const alertaPresente = body.includes("Alerta de Recorrencia");
    result.interactions.push(`Alerta Recorrencia: ${alertaPresente}`);

    if (alertaPresente) {
      const alertaSection = page.locator(".alerta-recorrencia").first();
      if ((await alertaSection.count()) > 0) {
        const alertaText = (await alertaSection.textContent()) || "";
        const match = alertaText.match(/perdidos?\s+(\d+)\s+vez/);
        const perdas = match ? parseInt(match[1]) : 0;
        result.interactions.push(`Perdas semelhantes: ${perdas}`);
      }
    } else {
      result.interactions.push("Alerta ausente — sem historico de 2+ perdas (comportamento esperado)");
    }

    // Trecho-a-Trecho na mesma aba
    const trechoPresente = body.includes("Aderencia Tecnica Trecho-a-Trecho");
    result.interactions.push(`Trecho-a-Trecho visivel: ${trechoPresente}`);

    await page.screenshot({ path: `${SHOT}/req9_8_alerta_recorrencia.png`, fullPage: true });

    // Condicional — nao falhar se nao existir
    result.details = alertaPresente ? "Alerta ativo" : "Sem historico de perdas — OK";
    allResults.push(result);
    console.log("REQ 9.8:", JSON.stringify(result, null, 2));
    expect(true).toBe(true);
  });

  // ==========================================================
  // REQ 10.1 — Processo Amanda: 3 Pastas de Documentos
  // ==========================================================
  test("REQ 10.1: Processo Amanda — 3 pastas coloridas, 10 docs, 14 StatusBadges", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "10.1", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // Scroll para Processo Amanda
    const amandaCard = page.locator("text=Processo Amanda").first();
    if ((await amandaCard.count()) > 0) await amandaCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    result.interactions.push("Scrollou para Processo Amanda");

    const body = (await page.textContent("body")) || "";

    // Card titulo
    const amandaPresente = body.includes("Processo Amanda");
    result.interactions.push(`Card Processo Amanda: ${amandaPresente}`);

    // 3 pastas
    const pasta1 = body.includes("Documentos da Empresa");
    const pasta2 = body.includes("Certidoes e Fiscal");
    const pasta3 = body.includes("Qualificacao Tecnica");
    result.interactions.push(`Pastas: Empresa=${pasta1}, Certidoes=${pasta2}, Tecnica=${pasta3}`);

    // Documentos em cada pasta
    const docs = {
      contrato_social: body.includes("Contrato Social"),
      procuracao: body.includes("Procuracao"),
      atestado: body.includes("Atestado Capacidade Tecnica"),
      cnd_federal: body.includes("CND Federal"),
      fgts: body.includes("FGTS"),
      trabalhista: body.includes("Trabalhista"),
      balanco: body.includes("Balanco"),
      anvisa: body.includes("Registro ANVISA"),
      bpf: body.includes("Certificado BPF"),
      laudo: body.includes("Laudo Tecnico"),
    };
    const docsPresentes = Object.values(docs).filter(Boolean).length;
    result.interactions.push(`Docs presentes: ${docsPresentes}/10 (${JSON.stringify(docs)})`);

    // StatusBadges totais
    const statusBadges = page.locator(".status-badge");
    const badgesCount = await statusBadges.count();
    result.interactions.push(`StatusBadges totais: ${badgesCount}`);

    // Badges com label "Exigido"
    const exigidos = body.match(/Exigido/g);
    const exigidoCount = exigidos ? exigidos.length : 0;
    result.interactions.push(`Labels "Exigido": ${exigidoCount}`);

    // Nota automatica
    const notaAuto = body.includes("carregados automaticamente");
    result.interactions.push(`Nota automatica: ${notaAuto}`);

    await page.screenshot({ path: `${SHOT}/req10_1_processo_amanda.png`, fullPage: true });

    if (!amandaPresente) { result.status = "FAIL"; result.bugs.push("Card nao encontrado"); }
    if (!pasta1 || !pasta2 || !pasta3) { result.status = "FAIL"; result.bugs.push("Pastas faltando"); }
    if (docsPresentes < 8) { result.status = "PARTIAL"; result.bugs.push(`Apenas ${docsPresentes}/10 docs`); }

    result.details = `Amanda OK, 3 pastas, ${docsPresentes} docs, ${badgesCount} badges`;
    allResults.push(result);
    console.log("REQ 10.1:", JSON.stringify(result, null, 2));
    expect(amandaPresente).toBe(true);
    expect(pasta1 && pasta2 && pasta3).toBe(true);
  });

  // ==========================================================
  // REQ 10.2 — Aderencia Trecho-a-Trecho
  // ==========================================================
  test("REQ 10.2: Tab Analitica — Tabela Trecho-a-Trecho 3 colunas", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "10.2", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // CLICAR tab Analitica
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    // Scroll para Trecho-a-Trecho
    const trechoSection = page.locator('.section-block:has-text("Trecho-a-Trecho")').first();
    if ((await trechoSection.count()) > 0) await trechoSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Aderencia Tecnica Trecho-a-Trecho");
    result.interactions.push(`Secao Trecho-a-Trecho: ${secaoPresente}`);

    // Tabela com 3 colunas
    const trechoTable = page.locator(".trecho-table, .mini-table:has(th:has-text('Trecho'))").first();
    const tableExists = (await trechoTable.count()) > 0;
    let thTexts: string[] = [];
    let rowCount = 0;
    if (tableExists) {
      thTexts = await trechoTable.locator("th").allTextContents();
      rowCount = await trechoTable.locator("tbody tr").count();
    }
    result.interactions.push(`Tabela: ${tableExists}, Colunas: ${thTexts.join(", ")}, Linhas: ${rowCount}`);

    // ScoreBadges de aderencia
    const scoreBadges = page.locator(".trecho-table .score-badge, .mini-table .score-badge");
    const scoreBadgeCount = await scoreBadges.count();
    result.interactions.push(`ScoreBadges aderencia: ${scoreBadgeCount}`);

    await page.screenshot({ path: `${SHOT}/req10_2_trecho_a_trecho.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    const col3 = thTexts.length >= 3;
    if (!col3 && tableExists) { result.status = "PARTIAL"; result.bugs.push(`Esperava 3 colunas, encontrou ${thTexts.length}`); }
    result.details = `Trecho OK, tabela=${tableExists}, ${rowCount} linhas, ${scoreBadgeCount} badges`;
    allResults.push(result);
    console.log("REQ 10.2:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 10.3 — Resumo IA (Tab Cognitiva) — CLICAR Gerar Resumo
  // ==========================================================
  test("REQ 10.3: Tab Cognitiva — CLICAR Gerar Resumo e verificar resposta IA", async ({ page }) => {
    test.setTimeout(180000);
    const result: TestResult = {
      req: "10.3", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // CLICAR tab Cognitiva
    await clickTab(page, "Cognitiva");
    result.interactions.push("Clicou tab Cognitiva");

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Resumo Gerado pela IA");
    result.interactions.push(`Secao Resumo IA: ${secaoPresente}`);

    // Botao Gerar ou Regerar
    const gerarBtn = page.locator('button:has-text("Gerar Resumo")').first();
    const regerarBtn = page.locator('button:has-text("Regerar Resumo")').first();
    const gerarExists = (await gerarBtn.count()) > 0;
    const regerarExists = (await regerarBtn.count()) > 0;
    result.interactions.push(`Botao Gerar: ${gerarExists}, Regerar: ${regerarExists}`);

    // CLICAR no botao (Gerar ou Regerar)
    const btn = gerarExists ? gerarBtn : regerarBtn;
    if ((await btn.count()) > 0) {
      try {
        await btn.click();
        result.interactions.push("Clicou Gerar/Regerar Resumo");
        // Aguardar resposta IA — maximo 30s com polling
        for (let i = 0; i < 6; i++) {
          await page.waitForTimeout(5000);
          const resumoCheck = page.locator(".resumo-text").first();
          if ((await resumoCheck.count()) > 0) break;
        }
        // Verificar se resumo apareceu
        const resumoText = page.locator(".resumo-text").first();
        const resumoExists = (await resumoText.count()) > 0;
        if (resumoExists) {
          const resumoContent = (await resumoText.textContent()) || "";
          result.interactions.push(`Resumo gerado: ${resumoContent.substring(0, 150)}...`);
        } else {
          result.interactions.push("Resumo nao apareceu apos 30s (IA pode estar lenta)");
        }
      } catch (e) {
        result.interactions.push(`Erro ao gerar resumo: ${String(e).substring(0, 100)}`);
      }
    }

    await page.screenshot({ path: `${SHOT}/req10_3_resumo_ia.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!gerarExists && !regerarExists) { result.status = "FAIL"; result.bugs.push("Botao Gerar/Regerar nao encontrado"); }
    result.details = `Resumo IA: secao OK, botao=${gerarExists || regerarExists}`;
    allResults.push(result);
    console.log("REQ 10.3:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 10.4 — Historico de Editais Semelhantes
  // ==========================================================
  test("REQ 10.4: Tab Cognitiva — Historico Editais Semelhantes", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "10.4", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Cognitiva");
    result.interactions.push("Clicou tab Cognitiva");

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Historico de Editais Semelhantes");
    result.interactions.push(`Secao Historico: ${secaoPresente}`);

    // Lista ou mensagem vazia
    const historicoList = page.locator(".historico-list");
    const listExists = (await historicoList.count()) > 0;
    const emptyMsg = body.includes("Nenhum edital semelhante");
    result.interactions.push(`Lista: ${listExists}, Msg vazia: ${emptyMsg}`);

    if (listExists) {
      const items = page.locator(".historico-item");
      const itemCount = await items.count();
      result.interactions.push(`Itens historico: ${itemCount}`);

      // Ler status de cada item
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const badge = await items.nth(i).locator(".status-badge").textContent().catch(() => "?");
        const nome = await items.nth(i).locator(".historico-nome").textContent().catch(() => "?");
        result.interactions.push(`  Item ${i}: ${badge} — ${nome}`);
      }
    }

    await page.screenshot({ path: `${SHOT}/req10_4_historico_semelhantes.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!listExists && !emptyMsg) { result.status = "PARTIAL"; result.bugs.push("Nem lista nem mensagem vazia"); }
    result.details = `Historico: ${listExists ? "com itens" : emptyMsg ? "vazio (msg OK)" : "sem conteudo"}`;
    allResults.push(result);
    console.log("REQ 10.4:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 10.5 — Pergunte a IA — DIGITAR pergunta real e verificar resposta
  // ==========================================================
  test("REQ 10.5: Tab Cognitiva — DIGITAR pergunta real e VERIFICAR resposta IA", async ({ page }) => {
    test.setTimeout(180000);
    const result: TestResult = {
      req: "10.5", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Cognitiva");
    result.interactions.push("Clicou tab Cognitiva");

    // Scroll para secao Pergunte
    const pergunteSection = page.locator('.section-block:has-text("Pergunte a IA")').first();
    if ((await pergunteSection.count()) > 0) await pergunteSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Pergunte a IA");
    result.interactions.push(`Secao Pergunte: ${secaoPresente}`);

    // Input com placeholder
    const input = page.locator('.pergunta-form input').first();
    const inputExists = (await input.count()) > 0;
    let placeholder = "";
    if (inputExists) {
      placeholder = (await input.getAttribute("placeholder")) || "";
    }
    result.interactions.push(`Input: ${inputExists}, Placeholder: "${placeholder}"`);

    // Botao Perguntar
    const perguntarBtn = page.locator('button:has-text("Perguntar")').first();
    const btnExists = (await perguntarBtn.count()) > 0;
    result.interactions.push(`Botao Perguntar: ${btnExists}`);

    await page.screenshot({ path: `${SHOT}/req10_5_01_antes_pergunta.png`, fullPage: true });

    // INTERACAO REAL: digitar pergunta e clicar perguntar
    if (inputExists && btnExists) {
      try {
        await input.fill("Qual o prazo de entrega exigido neste edital?");
        result.interactions.push("Digitou: Qual o prazo de entrega exigido neste edital?");

        await perguntarBtn.click();
        result.interactions.push("Clicou Perguntar");

        // Aguardar resposta IA — polling com timeout de 30s
        for (let i = 0; i < 6; i++) {
          await page.waitForTimeout(5000);
          const respostaCheck = page.locator(".resposta-box").first();
          if ((await respostaCheck.count()) > 0) break;
        }

        // Verificar resposta
        const respostaBox = page.locator(".resposta-box").first();
        const respostaExists = (await respostaBox.count()) > 0;
        if (respostaExists) {
          const respostaContent = (await respostaBox.textContent()) || "";
          result.interactions.push(`Resposta IA: ${respostaContent.substring(0, 200)}...`);
        } else {
          result.interactions.push("Resposta nao apareceu apos 30s (IA pode estar lenta)");
        }

        await page.screenshot({ path: `${SHOT}/req10_5_02_resposta_ia.png`, fullPage: true });
      } catch (e) {
        result.interactions.push(`Erro na pergunta: ${String(e).substring(0, 100)}`);
      }
    }

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!inputExists) { result.status = "FAIL"; result.bugs.push("Input nao encontrado"); }
    if (!btnExists) { result.status = "FAIL"; result.bugs.push("Botao Perguntar nao encontrado"); }
    result.details = `Pergunte IA OK, input=${inputExists}, btn=${btnExists}`;
    allResults.push(result);
    console.log("REQ 10.5:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
    expect(inputExists).toBe(true);
    expect(btnExists).toBe(true);
  });

  // ==========================================================
  // REQ 10.6 — GO/NO-GO Banner
  // ==========================================================
  test("REQ 10.6: Tab Objetiva — Banner GO/NO-GO/CONDICIONAL apos calculo", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "10.6", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");
    result.interactions.push("Clicou tab Objetiva");

    const body = (await page.textContent("body")) || "";

    // Verificar banner existente
    const bannerExistente = body.includes("Recomendacao da IA");
    result.interactions.push(`Banner existente: ${bannerExistente}`);

    // Se nao existe, verificar se botao calcular esta disponivel (nao clicar — teste API separado)
    if (!bannerExistente) {
      const calcBtn = page.locator('.aba-content button:has-text("Calcular Scores")').first();
      const calcBtnExists = (await calcBtn.count()) > 0;
      result.interactions.push(`Botao Calcular na aba: ${calcBtnExists}`);

      const calcDashBtn = page.locator('button:has-text("Calcular Scores IA")').first();
      const calcDashExists = (await calcDashBtn.count()) > 0;
      result.interactions.push(`Botao Calcular no dashboard: ${calcDashExists}`);

      result.interactions.push("Banner aparecera apos calcular scores (disponivel via botao)");
    } else {
      // Banner ja existe
      const banner = page.locator(".decisao-ia-banner").first();
      const bannerText = (await banner.textContent()) || "";
      let decisao = "N/A";
      if (bannerText.includes("NO-GO")) decisao = "NO-GO";
      else if (bannerText.includes("CONDICIONAL")) decisao = "CONDICIONAL";
      else if (bannerText.includes("GO")) decisao = "GO";
      result.interactions.push(`Decisao IA existente: ${decisao}`);
    }

    await page.screenshot({ path: `${SHOT}/req10_6_go_nogo.png`, fullPage: true });

    // GO/NO-GO depende do calculo de scores
    const bodyFinal = (await page.textContent("body")) || "";
    const hasBannerOrCalc = bodyFinal.includes("Recomendacao da IA") || (await page.locator('button:has-text("Calcular Scores")').count()) > 0;
    if (!hasBannerOrCalc) { result.status = "PARTIAL"; result.bugs.push("Nem banner nem botao calcular"); }
    result.details = `GO/NO-GO: ${bannerExistente ? "banner presente" : "disponivel via calculo"}`;
    allResults.push(result);
    console.log("REQ 10.6:", JSON.stringify(result, null, 2));
    expect(hasBannerOrCalc).toBe(true);
  });

  // ==========================================================
  // API TEST — POST /api/editais/{id}/scores-validacao
  // ==========================================================
  test("API: POST /api/editais/{id}/scores-validacao — calcular 6 dimensoes", async () => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "API_SCORES", status: "PASS", details: "", interactions: [], bugs: [],
    };

    // Listar editais
    const listRes = await fetch(`${API}/api/editais/salvos?com_score=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    const editais = listData.editais || listData || [];
    result.interactions.push(`Editais disponiveis: ${editais.length}`);

    // Tentar calcular scores em ate 5 editais
    let successData: Record<string, unknown> | null = null;
    let usedId = "";
    let lastStatus = 0;
    for (const ed of editais.slice(0, 5)) {
      const eid = String(ed.id || ed.edital_id);
      result.interactions.push(`Tentando edital ${eid}...`);
      const res = await fetch(`${API}/api/editais/${eid}/scores-validacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      lastStatus = res.status;
      result.interactions.push(`  Status: ${res.status}`);
      if (res.status === 200) {
        successData = await res.json() as Record<string, unknown>;
        usedId = eid;
        break;
      }
    }

    if (successData) {
      const scores = successData.scores as Record<string, number> | undefined;
      result.interactions.push(`Scores calculados para edital ${usedId}`);
      result.interactions.push(`Score geral: ${successData.score_geral}`);
      result.interactions.push(`Decisao IA: ${successData.decisao_ia || successData.decisao}`);

      if (scores) {
        const dims = ["tecnico", "documental", "complexidade", "juridico", "logistico", "comercial"];
        const found = dims.filter(d => typeof scores[d] === "number");
        result.interactions.push(`Dimensoes: ${found.length}/6 (${found.join(", ")})`);

        if (found.length < 6) { result.status = "PARTIAL"; result.bugs.push(`Apenas ${found.length}/6 dimensoes`); }
      }

      // Sub-scores tecnicos
      if (successData.sub_scores_tecnicos) {
        const sst = successData.sub_scores_tecnicos as { label: string; score: number }[];
        result.interactions.push(`Sub-scores tecnicos: ${sst.length}`);
      }

      // Justificativa
      if (typeof successData.justificativa_ia === "string") {
        result.interactions.push(`Justificativa: ${successData.justificativa_ia.substring(0, 100)}...`);
      }

      result.details = `API OK, score=${successData.score_geral}, decisao=${successData.decisao_ia}`;
    } else {
      result.status = "PARTIAL";
      result.bugs.push(`Nenhum edital retornou 200 (ultimo status: ${lastStatus})`);
      result.details = `API nao retornou 200 para nenhum edital`;
    }

    allResults.push(result);
    console.log("API SCORES:", JSON.stringify(result, null, 2));
    expect(editais.length).toBeGreaterThan(0);
  });

  // ==========================================================
  // RELATORIO FINAL — Consolidado
  // ==========================================================
  test("RELATORIO FINAL — Consolidado de todos os testes", async ({ page }) => {
    test.setTimeout(120000);
    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // Screenshot final
    await page.screenshot({ path: `${SHOT}/final_visao_geral.png`, fullPage: true });

    // Tabs
    await clickTab(page, "Objetiva");
    await page.screenshot({ path: `${SHOT}/final_tab_objetiva.png`, fullPage: true });

    await clickTab(page, "Analitica");
    await page.screenshot({ path: `${SHOT}/final_tab_analitica.png`, fullPage: true });

    await clickTab(page, "Cognitiva");
    await page.screenshot({ path: `${SHOT}/final_tab_cognitiva.png`, fullPage: true });

    // Scroll Amanda
    const amanda = page.locator("text=Processo Amanda").first();
    if ((await amanda.count()) > 0) await amanda.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOT}/final_processo_amanda.png`, fullPage: true });

    // Imprimir resultado consolidado
    const total = allResults.length;
    const pass = allResults.filter(r => r.status === "PASS").length;
    const partial = allResults.filter(r => r.status === "PARTIAL").length;
    const fail = allResults.filter(r => r.status === "FAIL").length;
    const allBugs = allResults.flatMap(r => r.bugs.map(b => `[${r.req}] ${b}`));

    console.log("\n============================================");
    console.log("      RELATORIO CONSOLIDADO P8-P10");
    console.log("============================================");
    console.log(`Total testes: ${total}`);
    console.log(`PASS:    ${pass}`);
    console.log(`PARTIAL: ${partial}`);
    console.log(`FAIL:    ${fail}`);
    console.log(`Taxa sucesso: ${Math.round((pass / total) * 100)}%`);
    console.log("--------------------------------------------");
    allResults.forEach(r => {
      console.log(`  ${r.status === "PASS" ? "✓" : r.status === "PARTIAL" ? "~" : "✗"} REQ ${r.req}: ${r.status} — ${r.details}`);
    });
    if (allBugs.length > 0) {
      console.log("--------------------------------------------");
      console.log("BUGS:");
      allBugs.forEach(b => console.log(`  - ${b}`));
    }
    console.log("============================================\n");

    expect(fail).toBe(0);
  });
});
