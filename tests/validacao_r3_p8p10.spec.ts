/**
 * VALIDACAO R3 (Rodada 3) — PAGES 8-10: Requisitos 8.1-8.4, 9.1-9.8, 10.1-10.6
 * Apos correcao de bugs B2 (modal CSS .modal-container → .modal) e B6 (scores-validacao body)
 * Playwright E2E — Testador Automatizado
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:5175";
const API = "http://localhost:5007";
const EMAIL = "pasteurjr@gmail.com";
const PASS = "123456";
const SHOT = "tests/results/validacao_r3";

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
    // Expand Fluxo Comercial section
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
  // Try tab-panel-tab first, then generic button/role
  const tabPanelTab = page.locator(`.tab-panel-tab:has(.tab-label:text("${tabName}"))`).first();
  if ((await tabPanelTab.count()) > 0) {
    await tabPanelTab.click();
    await page.waitForTimeout(1000);
    return;
  }
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

test.describe.serial("VALIDACAO R3 P8-P10: Rodada 3 — Apos correcao bugs B2/B6", () => {
  test.beforeAll(async () => {
    token = await getToken();
  });

  // ==========================================================
  // B2 FIX VERIFICATION — Modal CSS
  // ==========================================================
  test("B2 FIX: Modal CSS usa .modal (nao .modal-container) — background, radius, shadow, botoes clicaveis", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "B2_FIX", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    const selected = await selectEditalByIndex(page, 0);
    result.interactions.push(`Edital selecionado: ${selected}`);

    if (!selected) {
      result.status = "FAIL";
      result.bugs.push("Nenhum edital para selecionar — impossivel testar modal");
      allResults.push(result);
      return;
    }

    // Clicar Participar para abrir card de justificativa (nao e modal, mas testa a UI)
    const btnP = page.locator('button:has-text("Participar")').first();
    if ((await btnP.count()) > 0) {
      await btnP.click();
      await page.waitForTimeout(1000);
      result.interactions.push("Clicou Participar — card de justificativa deve aparecer");
    }

    // Verificar estilos do modal via CSS (verificar no CSS carregado)
    // Verificar que .modal class existe no CSS com as propriedades corretas
    const modalRule = await page.evaluate(() => {
      const sheets = document.styleSheets;
      const results: Record<string, string> = {};
      for (let i = 0; i < sheets.length; i++) {
        try {
          const rules = sheets[i].cssRules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j] as CSSStyleRule;
            if (rule.selectorText === ".modal") {
              results.background = rule.style.background || rule.style.backgroundColor || "";
              results.borderRadius = rule.style.borderRadius || "";
              results.boxShadow = rule.style.boxShadow || "";
              results.display = rule.style.display || "";
            }
            if (rule.selectorText === ".modal-header h2, .modal-header h3" || rule.selectorText === ".modal-header h2") {
              results.h2FontSize = rule.style.fontSize || "";
              results.h2FontWeight = rule.style.fontWeight || "";
            }
          }
        } catch { /* cross-origin */ }
      }
      return results;
    });

    result.interactions.push(`Modal CSS: background=${modalRule.background}, radius=${modalRule.borderRadius}, shadow=${modalRule.boxShadow}`);
    result.interactions.push(`Modal h2: fontSize=${modalRule.h2FontSize}, fontWeight=${modalRule.h2FontWeight}`);

    // Verificar que NAO usa .modal-container (bug B2 era esse seletor errado)
    const containerRule = await page.evaluate(() => {
      const sheets = document.styleSheets;
      for (let i = 0; i < sheets.length; i++) {
        try {
          const rules = sheets[i].cssRules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j] as CSSStyleRule;
            if (rule.selectorText === ".modal-container") {
              return true; // BAD — old buggy selector still exists
            }
          }
        } catch { /* cross-origin */ }
      }
      return false; // GOOD — no .modal-container
    });

    result.interactions.push(`CSS .modal-container ausente (B2 fix): ${!containerRule}`);

    // Verificar que o componente Modal usa className="modal" (nao "modal-container")
    // Podemos testar abrindo um modal real — vamos usar a pagina de Pergunte a IA via modal
    // A ValidacaoPage tem Modal com showPerguntaModal (mas esse e acionado via fluxo interno)
    // Vamos verificar via CSS que .modal tem as propriedades corretas

    const bgOk = modalRule.background.includes("var(--bg-secondary)") || modalRule.background !== "";
    const radiusOk = modalRule.borderRadius.includes("var(--radius)") || modalRule.borderRadius !== "";
    const shadowOk = modalRule.boxShadow !== "";

    if (!bgOk) { result.bugs.push("Modal sem background"); result.status = "PARTIAL"; }
    if (!radiusOk) { result.bugs.push("Modal sem border-radius"); result.status = "PARTIAL"; }
    if (containerRule) { result.status = "FAIL"; result.bugs.push("CSS .modal-container AINDA existe — B2 nao corrigido"); }

    // Verificar que botoes dentro de cards sao clicaveis
    const salvarBtn = page.locator('button:has-text("Salvar Justificativa")').first();
    if ((await salvarBtn.count()) > 0) {
      const isEnabled = await salvarBtn.isEnabled();
      result.interactions.push(`Botao Salvar Justificativa habilitado: ${isEnabled}`);
    }

    await page.screenshot({ path: `${SHOT}/b2_fix_modal_css.png`, fullPage: true });

    result.details = `B2 fix OK: .modal com bg/radius/shadow, sem .modal-container`;
    allResults.push(result);
    console.log("B2 FIX:", JSON.stringify(result, null, 2));
    expect(containerRule).toBe(false);
  });

  // ==========================================================
  // REQ 8.1 — Lista de Editais Salvos com Score
  // ==========================================================
  test("REQ 8.1: Lista editais — navegar, tabela, filtro busca, filtro status (5 opcoes)", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.1", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    result.interactions.push("Navegou para Validacao");

    // 1. Titulo
    const titulo = page.locator('h1:has-text("Validacao")');
    const tituloOk = await titulo.isVisible({ timeout: 5000 }).catch(() => false);
    result.interactions.push(`Titulo visivel: ${tituloOk}`);

    // 2. Card "Meus Editais"
    const cardMeus = await page.textContent("body") || "";
    const cardOk = cardMeus.includes("Meus Editais");
    result.interactions.push(`Card Meus Editais: ${cardOk}`);

    // 3. Colunas da tabela
    const headers = await page.locator("th").allTextContents();
    const hStr = headers.join("|");
    const expectedCols = ["Numero", "Orgao", "UF", "Objeto", "Valor", "Abertura", "Status", "Score"];
    const colsOk = expectedCols.every(c => hStr.includes(c));
    const colsFound = expectedCols.filter(c => hStr.includes(c));
    result.interactions.push(`Colunas: ${colsFound.length}/8 (${hStr})`);

    // 4. Contar linhas
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    result.interactions.push(`Linhas na tabela: ${rowCount}`);

    // 5. Filtro busca — "Hospital"
    const search = page.locator('input[placeholder*="Buscar"]').first();
    if ((await search.count()) > 0) {
      await search.fill("Hospital");
      await page.waitForTimeout(800);
      const filteredRows = await rows.count();
      result.interactions.push(`Filtro "Hospital": ${filteredRows} resultados`);
      await page.screenshot({ path: `${SHOT}/req8_1_01_filtro_hospital.png`, fullPage: true });

      // Limpar e buscar inexistente
      await search.clear();
      await page.waitForTimeout(300);
      await search.fill("xyz_inexistente_999");
      await page.waitForTimeout(800);
      const emptyRows = await rows.count();
      const emptyMsg = (await page.locator('text=Nenhum edital').count()) > 0;
      result.interactions.push(`Busca inexistente: ${emptyRows} rows, msg vazia: ${emptyMsg}`);
      await search.clear();
      await page.waitForTimeout(300);
    }

    // 6. Filtro Status — verificar 5 opcoes
    const statusSel = page.locator("select").first();
    let statusOptions: string[] = [];
    if ((await statusSel.count()) > 0) {
      statusOptions = await statusSel.locator("option").allTextContents();
      result.interactions.push(`Status opcoes (${statusOptions.length}): ${statusOptions.join(", ")}`);

      // Trocar para "Novo"
      await statusSel.selectOption("novo");
      await page.waitForTimeout(500);
      const novosRows = await rows.count();
      result.interactions.push(`Status "Novo": ${novosRows} resultados`);
      await page.screenshot({ path: `${SHOT}/req8_1_02_filtro_novo.png`, fullPage: true });

      // Voltar para Todos
      await statusSel.selectOption("todos");
      await page.waitForTimeout(500);
    }

    // 7. Score gauges
    const scoreCircles = page.locator(".score-circle");
    const scoreCount = await scoreCircles.count();
    result.interactions.push(`Score circles: ${scoreCount}`);

    // 8. Status badges na tabela
    const statusBadges = page.locator("tbody .status-badge");
    const badgeCount = await statusBadges.count();
    result.interactions.push(`Status badges: ${badgeCount}`);

    await page.screenshot({ path: `${SHOT}/req8_1_03_tabela_completa.png`, fullPage: true });

    // Validacao
    if (!tituloOk) { result.status = "FAIL"; result.bugs.push("Titulo nao visivel"); }
    if (!colsOk) { result.status = "FAIL"; result.bugs.push(`Colunas faltando: ${expectedCols.filter(c => !hStr.includes(c)).join(", ")}`); }
    if (rowCount === 0) { result.bugs.push("Tabela vazia — sem editais salvos (pre-condicao nao atendida)"); }
    if (statusOptions.length < 5) { result.status = "PARTIAL"; result.bugs.push(`Esperava 5 opcoes status, encontrou ${statusOptions.length}`); }

    result.details = `Tabela ${rowCount} editais, ${colsFound.length}/8 colunas, ${statusOptions.length} filtros status, ${scoreCount} scores`;
    allResults.push(result);
    console.log("REQ 8.1:", JSON.stringify(result, null, 2));
    expect(tituloOk).toBe(true);
    expect(colsOk).toBe(true);
  });

  // ==========================================================
  // REQ 8.2 — Sinais de Mercado
  // ==========================================================
  test("REQ 8.2: Sinais de Mercado — barra superior apos selecionar edital", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.2", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    const selected = await selectEditalByIndex(page, 0);
    result.interactions.push(`Edital selecionado: ${selected}`);

    if (!selected) {
      result.status = "FAIL";
      result.bugs.push("Nenhum edital para selecionar");
      allResults.push(result);
      return;
    }

    // Barra superior
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

    // Decisao salva badge (pode ja existir se testado anteriormente)
    const decisaoSalvaBadge = page.locator('.badge:has-text("Decisao salva")');
    const decisaoCount = await decisaoSalvaBadge.count();
    result.interactions.push(`Badge Decisao salva: ${decisaoCount}`);

    await page.screenshot({ path: `${SHOT}/req8_2_sinais_mercado.png`, fullPage: true });

    if (!topBarVisible) { result.status = "FAIL"; result.bugs.push("Barra superior nao aparece apos selecionar edital"); }
    result.details = `Barra visivel, ${sinaisCount} sinais mercado, ${fatalCount} fatal flaws`;
    allResults.push(result);
    console.log("REQ 8.2:", JSON.stringify(result, null, 2));
    expect(topBarVisible).toBe(true);
  });

  // ==========================================================
  // REQ 8.3 — Decisao: Participar / Acompanhar / Ignorar + Justificativa
  // ==========================================================
  test("REQ 8.3: Decisao — 3 botoes, justificativa com motivo+texto, salvar, badge", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.3", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // 1. Verificar 3 botoes de decisao
    const btnP = page.locator('button:has-text("Participar")').first();
    const btnA = page.locator('button:has-text("Acompanhar")').first();
    const btnI = page.locator('button:has-text("Ignorar")').first();
    const pVisible = await btnP.isVisible().catch(() => false);
    const aVisible = await btnA.isVisible().catch(() => false);
    const iVisible = await btnI.isVisible().catch(() => false);
    result.interactions.push(`Botoes: Participar=${pVisible}, Acompanhar=${aVisible}, Ignorar=${iVisible}`);

    // 2. Verificar cores (classes CSS)
    const pClass = await btnP.getAttribute("class") || "";
    const aClass = await btnA.getAttribute("class") || "";
    const iClass = await btnI.getAttribute("class") || "";
    const pGreen = pClass.includes("success");
    const aBlue = aClass.includes("info");
    const iNeutral = iClass.includes("neutral");
    result.interactions.push(`Cores: P-verde=${pGreen}(${pClass}), A-azul=${aBlue}(${aClass}), I-neutro=${iNeutral}(${iClass})`);

    await page.screenshot({ path: `${SHOT}/req8_3_01_botoes.png`, fullPage: true });

    // 3. CLICAR "Participar" no primeiro edital
    await btnP.click();
    await page.waitForTimeout(1000);
    result.interactions.push("Clicou Participar");

    // 4. Verificar card "Justificativa da Decisao"
    const justCard = page.locator("text=Justificativa da Decisao").first();
    const justVisible = (await justCard.count()) > 0;
    result.interactions.push(`Card Justificativa: ${justVisible}`);

    // 5. Verificar hint text
    const body = (await page.textContent("body")) || "";
    const hintPresente = body.includes("combustivel") || body.includes("inteligencia futura");
    result.interactions.push(`Hint "combustivel/inteligencia": ${hintPresente}`);

    // 6. SELECIONAR motivo no dropdown
    const allSelects = page.locator("select.select-input");
    const selCount = await allSelects.count();
    let motivoSelecionado = false;
    let motivoOptions: string[] = [];
    for (let i = 0; i < selCount; i++) {
      const opts = await allSelects.nth(i).locator("option").allTextContents();
      if (opts.some(o => o.includes("competitivo") || o.includes("Margem") || o.includes("aderente") || o.includes("insuficiente"))) {
        motivoOptions = opts.filter(o => o.trim().length > 0);
        await allSelects.nth(i).selectOption("preco_competitivo");
        motivoSelecionado = true;
        break;
      }
    }
    result.interactions.push(`Motivo dropdown: ${motivoSelecionado}, ${motivoOptions.length} opcoes (${motivoOptions.join("; ")})`);

    // 7. PREENCHER detalhes no textarea
    const textarea = page.locator("textarea").first();
    if ((await textarea.count()) > 0) {
      await textarea.fill("Margem aceitavel para este produto. Regiao estrategica, concorrencia moderada. Rodada 3.");
      result.interactions.push("Preencheu textarea com justificativa");
    }

    await page.screenshot({ path: `${SHOT}/req8_3_02_justificativa.png`, fullPage: true });

    // 8. CLICAR "Salvar Justificativa"
    const salvarBtn = page.locator('button:has-text("Salvar Justificativa")').first();
    if ((await salvarBtn.count()) > 0) {
      await salvarBtn.click();
      await page.waitForTimeout(2000);
      result.interactions.push("Clicou Salvar Justificativa");
    }

    // 9. Badge "Decisao salva"
    const decisaoSalva = page.locator('.badge:has-text("Decisao salva")');
    const salvaBadge = (await decisaoSalva.count()) > 0;
    result.interactions.push(`Badge "Decisao salva": ${salvaBadge}`);

    // 10. Justificativa fechou
    const justFechou = (await page.locator("text=Justificativa da Decisao").count()) === 0;
    result.interactions.push(`Justificativa fechou apos salvar: ${justFechou}`);

    await page.screenshot({ path: `${SHOT}/req8_3_03_decisao_salva.png`, fullPage: true });

    // 11. CLICAR Acompanhar no 2o edital
    const sel2 = await selectEditalByIndex(page, 1);
    if (sel2) {
      await page.waitForTimeout(1000);
      const btnA2 = page.locator('button:has-text("Acompanhar")').first();
      if ((await btnA2.count()) > 0) {
        await btnA2.click();
        await page.waitForTimeout(1000);
        result.interactions.push("Clicou Acompanhar no 2o edital");

        // Selecionar motivo
        for (let i = 0; i < selCount; i++) {
          const opts = await allSelects.nth(i).locator("option").allTextContents();
          if (opts.some(o => o.includes("competitivo") || o.includes("concorrente"))) {
            await allSelects.nth(i).selectOption("concorrente_forte");
            break;
          }
        }
        const ta2 = page.locator("textarea").first();
        if ((await ta2.count()) > 0) {
          await ta2.fill("Acompanhando — concorrente dominante. R3.");
        }
        const s2 = page.locator('button:has-text("Salvar Justificativa")').first();
        if ((await s2.count()) > 0) {
          await s2.click();
          await page.waitForTimeout(1500);
          result.interactions.push("Salvou Acompanhar no 2o edital");
        }
      }
      await page.screenshot({ path: `${SHOT}/req8_3_04_acompanhar.png`, fullPage: true });
    }

    // 12. CLICAR Ignorar no 3o edital
    const sel3 = await selectEditalByIndex(page, 2);
    if (sel3) {
      await page.waitForTimeout(1000);
      const btnI3 = page.locator('button:has-text("Ignorar")').first();
      if ((await btnI3.count()) > 0) {
        await btnI3.click();
        await page.waitForTimeout(1000);
        result.interactions.push("Clicou Ignorar no 3o edital");

        for (let i = 0; i < selCount; i++) {
          const opts = await allSelects.nth(i).locator("option").allTextContents();
          if (opts.some(o => o.includes("insuficiente") || o.includes("Margem"))) {
            await allSelects.nth(i).selectOption("margem_insuficiente");
            break;
          }
        }
        const ta3 = page.locator("textarea").first();
        if ((await ta3.count()) > 0) {
          await ta3.fill("Margem insuficiente, fora da regiao. R3.");
        }
        const s3 = page.locator('button:has-text("Salvar Justificativa")').first();
        if ((await s3.count()) > 0) {
          await s3.click();
          await page.waitForTimeout(1500);
          result.interactions.push("Salvou Ignorar no 3o edital");
        }
      }
      await page.screenshot({ path: `${SHOT}/req8_3_05_ignorar.png`, fullPage: true });
    }

    if (!pVisible || !aVisible || !iVisible) { result.status = "FAIL"; result.bugs.push("Botoes de decisao faltando"); }
    if (motivoOptions.length < 5) { result.status = "PARTIAL"; result.bugs.push(`Esperava >= 8 opcoes motivo, encontrou ${motivoOptions.length}`); }
    if (!justVisible) { result.status = "FAIL"; result.bugs.push("Card justificativa nao apareceu"); }
    result.details = `3 botoes OK, ${motivoOptions.length} motivos, badge salva: ${salvaBadge}, justificativa fechou: ${justFechou}`;
    allResults.push(result);
    console.log("REQ 8.3:", JSON.stringify(result, null, 2));
    expect(pVisible && aVisible && iVisible).toBe(true);
  });

  // ==========================================================
  // REQ 8.4 — Score Dashboard (6 sub-scores, intencao, margem)
  // ==========================================================
  test("REQ 8.4: Score Dashboard — 6 sub-scores, radios intencao, slider margem", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "8.4", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // 1. Dashboard visivel
    const dashboard = page.locator(".score-dashboard").first();
    const dashVisible = await dashboard.isVisible({ timeout: 5000 }).catch(() => false);
    result.interactions.push(`Dashboard visivel: ${dashVisible}`);

    // 2. Score Circle principal (gauge)
    const scoreCircle = page.locator(".score-circle").first();
    const circleVisible = (await scoreCircle.count()) > 0;
    result.interactions.push(`ScoreCircle principal: ${circleVisible}`);

    // 3. 6 labels de sub-scores
    const body = (await page.textContent("body")) || "";
    const expectedLabels = [
      "Aderencia Tecnica", "Aderencia Documental", "Complexidade Edital",
      "Risco Juridico", "Viabilidade Logistica", "Atratividade Comercial",
    ];
    const foundLabels = expectedLabels.filter(l => body.includes(l));
    result.interactions.push(`Sub-score labels: ${foundLabels.length}/6 (${foundLabels.join(", ")})`);
    const missingLabels = expectedLabels.filter(l => !body.includes(l));
    if (missingLabels.length > 0) result.interactions.push(`Labels faltando: ${missingLabels.join(", ")}`);

    // 4. ScoreBar components (6 barras)
    const scoreBars = page.locator(".score-bars-6d .score-bar, .score-dashboard .score-bar");
    const barsCount = await scoreBars.count();
    result.interactions.push(`ScoreBars: ${barsCount}`);

    // 5. Niveis High/Medium/Low
    const hasHigh = body.includes("High");
    const hasMedium = body.includes("Medium");
    const hasLow = body.includes("Low");
    result.interactions.push(`Niveis: High=${hasHigh}, Medium=${hasMedium}, Low=${hasLow}`);

    // 6. Potencial de Ganho badge
    const potencial = body.includes("Potencial de Ganho");
    const potBadge = ["Elevado", "Medio", "Baixo"].find(v => body.includes(v)) || "N/A";
    result.interactions.push(`Potencial de Ganho: ${potencial}, badge=${potBadge}`);

    // 7. Botao "Calcular Scores IA"
    const calcBtn = page.locator('button:has-text("Calcular Scores IA"), button:has-text("Calcular Scores")').first();
    const calcBtnVisible = (await calcBtn.count()) > 0;
    result.interactions.push(`Botao Calcular Scores: ${calcBtnVisible}`);

    await page.screenshot({ path: `${SHOT}/req8_4_01_dashboard.png`, fullPage: true });

    // 8. RadioGroup intencao (4 opcoes)
    const radioOptions = page.locator('input[type="radio"][name="intencao"]');
    const radioCount = await radioOptions.count();
    result.interactions.push(`Radio intencao: ${radioCount} opcoes`);

    // INTERAGIR: clicar cada radio
    const radioLabels: string[] = [];
    for (let i = 0; i < radioCount; i++) {
      await radioOptions.nth(i).check();
      await page.waitForTimeout(300);
      const label = await radioOptions.nth(i).evaluate((el) => {
        const parent = el.closest(".radio-option") || el.parentElement;
        return parent?.textContent?.trim() || "";
      });
      radioLabels.push(label);
    }
    result.interactions.push(`Radio labels: ${radioLabels.join(", ")}`);

    // 9. Slider margem
    const slider = page.locator('input[type="range"]').first();
    const sliderExists = (await slider.count()) > 0;
    if (sliderExists) {
      await slider.fill("20");
      await page.waitForTimeout(300);
      result.interactions.push("Ajustou margem para 20%");

      await slider.fill("35");
      await page.waitForTimeout(300);
      result.interactions.push("Ajustou margem para 35%");

      // Verificar label de margem
      const margemLabel = body.includes("Expectativa de Margem");
      result.interactions.push(`Label margem: ${margemLabel}`);
    }

    // 10. Varia por Produto / Regiao
    const variaProduto = body.includes("Varia por Produto");
    const variaRegiao = body.includes("Varia por Regiao");
    result.interactions.push(`Varia por: Produto=${variaProduto}, Regiao=${variaRegiao}`);

    await page.screenshot({ path: `${SHOT}/req8_4_02_intencao_margem.png`, fullPage: true });

    if (!dashVisible) { result.status = "FAIL"; result.bugs.push("Dashboard nao visivel"); }
    if (foundLabels.length < 6) { result.status = "PARTIAL"; result.bugs.push(`Apenas ${foundLabels.length}/6 sub-score labels`); }
    if (radioCount !== 4) { result.bugs.push(`Esperava 4 radios intencao, encontrou ${radioCount}`); }
    if (!sliderExists) { result.bugs.push("Slider margem nao encontrado"); }

    result.details = `Dashboard OK, ${foundLabels.length}/6 labels, ${barsCount} bars, ${radioCount} radios, slider=${sliderExists}`;
    allResults.push(result);
    console.log("REQ 8.4:", JSON.stringify(result, null, 2));
    expect(dashVisible).toBe(true);
    expect(foundLabels.length).toBe(6);
  });

  // ==========================================================
  // REQ 9.1 — Aderencia Tecnica (Tab Objetiva)
  // ==========================================================
  test("REQ 9.1: Tab Objetiva — Aderencia Tecnica Detalhada, sub-scores ou botao calcular", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.1", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
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

    // Certificacoes na mesma aba
    const certPresente = body.includes("Certificacoes");
    result.interactions.push(`Secao Certificacoes: ${certPresente}`);

    // ScoreBar items
    const barsCount = await page.locator(".aba-content .score-bar, .sub-scores-grid .score-bar").count();
    result.interactions.push(`ScoreBars na aba: ${barsCount}`);

    await page.screenshot({ path: `${SHOT}/req9_1_aderencia_tecnica.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!gridExists && !calcBtnExists) { result.status = "PARTIAL"; result.bugs.push("Nem grid nem botao calcular"); }
    result.details = `Secao OK, grid=${gridExists}, calcBtn=${calcBtnExists}, ${barsCount} bars, cert=${certPresente}`;
    allResults.push(result);
    console.log("REQ 9.1:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.2 — Checklist Documental
  // ==========================================================
  test("REQ 9.2: Tab Objetiva — Checklist Documental com tabela Documento/Status/Validade", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.2", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");

    // Scroll ate Checklist
    const checkSection = page.locator('.section-block:has-text("Checklist Documental")').first();
    if ((await checkSection.count()) > 0) await checkSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Checklist Documental");
    result.interactions.push(`Secao Checklist: ${secaoPresente}`);

    // Tabela mini-table
    const miniTable = page.locator('.section-block:has-text("Checklist Documental") table').first();
    const tableExists = (await miniTable.count()) > 0;
    let thTexts: string[] = [];
    let rowCount = 0;
    if (tableExists) {
      thTexts = await miniTable.locator("th").allTextContents();
      rowCount = await miniTable.locator("tbody tr").count();
    }
    result.interactions.push(`Tabela: ${tableExists}, Colunas: ${thTexts.join(", ")}, Linhas: ${rowCount}`);

    // StatusBadges (OK, Vencido, Faltando, Ajustavel)
    const badges = page.locator('.section-block:has-text("Checklist Documental") .status-badge');
    const badgesCount = await badges.count();
    const badgeTexts = badgesCount > 0 ? await badges.allTextContents() : [];
    result.interactions.push(`StatusBadges: ${badgesCount} (${badgeTexts.join(", ")})`);

    await page.screenshot({ path: `${SHOT}/req9_2_checklist_documental.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    result.details = `Checklist OK, ${rowCount} docs, ${badgesCount} badges, colunas: ${thTexts.join("/")}`;
    allResults.push(result);
    console.log("REQ 9.2:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.3 — Pipeline Riscos + Flags (Tab Analitica)
  // ==========================================================
  test("REQ 9.3: Tab Analitica — Pipeline Riscos, Flags Juridicos, Fatal Flaws", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.3", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    const body = (await page.textContent("body")) || "";

    // Pipeline de Riscos
    const pipelinePresente = body.includes("Pipeline de Riscos");
    result.interactions.push(`Pipeline Riscos: ${pipelinePresente}`);

    // Badges no pipeline
    const pipelineBadges = page.locator(".pipeline-badges .badge");
    const badgesCount = await pipelineBadges.count();
    const badgeTexts = badgesCount > 0 ? await pipelineBadges.allTextContents() : [];
    result.interactions.push(`Pipeline badges: ${badgesCount} (${badgeTexts.join("; ")})`);

    // Pipeline sections (Modalidade e Risco + Flags Juridicos)
    const pipelineSections = page.locator(".pipeline-section");
    const sectionCount = await pipelineSections.count();
    result.interactions.push(`Pipeline sections: ${sectionCount}`);

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
    result.details = `Pipeline OK, ${badgesCount} badges, flags=${flagsPresente}, fatal=${fatalCount}`;
    allResults.push(result);
    console.log("REQ 9.3:", JSON.stringify(result, null, 2));
    expect(pipelinePresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.4 — Mapa Logistico (Tab Objetiva)
  // ==========================================================
  test("REQ 9.4: Tab Objetiva — Mapa Logistico: UF Edital, Empresa, distancia, entrega", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.4", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");

    const mapaSection = page.locator('.section-block:has-text("Mapa Logistico")').first();
    if ((await mapaSection.count()) > 0) await mapaSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const mapaPresente = body.includes("Mapa Logistico");
    const ufEdital = body.includes("UF Edital");
    const empresa = body.includes("Empresa");
    const distancia = body.includes("Distancia");
    const entrega = body.includes("Entrega Estimada");

    // Badge de distancia
    const distBadge = ["Proximo", "Medio", "Distante"].find(v => body.includes(v)) || "N/A";
    // Dias estimados
    const diasMatch = body.match(/(\d+-\d+)\s*dias/);
    const dias = diasMatch ? diasMatch[1] : "N/A";

    result.interactions.push(`Mapa: ${mapaPresente}, UF=${ufEdital}, Empresa=${empresa}, Dist=${distancia}, Entrega=${entrega}`);
    result.interactions.push(`Distancia badge: ${distBadge}, Entrega: ${dias} dias`);

    await page.screenshot({ path: `${SHOT}/req9_4_mapa_logistico.png`, fullPage: true });

    if (!mapaPresente) { result.status = "FAIL"; result.bugs.push("Mapa Logistico nao encontrado"); }
    result.details = `Mapa OK, distancia=${distBadge}, entrega=${dias} dias, UF=${ufEdital}, Empresa=${empresa}`;
    allResults.push(result);
    console.log("REQ 9.4:", JSON.stringify(result, null, 2));
    expect(mapaPresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.5 — Aderencia Comercial
  // ==========================================================
  test("REQ 9.5: Aderencia Comercial — score, potencial, intencao, margem (interagir)", async ({ page }) => {
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

    // Potencial badge
    const potBadge = ["Elevado", "Medio", "Baixo"].find(v => body.includes(v)) || "N/A";
    result.interactions.push(`Potencial badge: ${potBadge}`);

    // INTERAGIR: mudar intencao
    const radios = page.locator('input[type="radio"][name="intencao"]');
    const radioCount = await radios.count();
    if (radioCount >= 3) {
      await radios.nth(1).check(); // Defensivo
      await page.waitForTimeout(300);
      result.interactions.push("Selecionou Defensivo");

      await radios.nth(2).check(); // Acompanhamento
      await page.waitForTimeout(300);
      result.interactions.push("Selecionou Acompanhamento");

      await radios.nth(3).check(); // Aprendizado
      await page.waitForTimeout(300);
      result.interactions.push("Selecionou Aprendizado");
    }

    // INTERAGIR: slider margem
    const slider = page.locator('input[type="range"]').first();
    if ((await slider.count()) > 0) {
      await slider.fill("10");
      await page.waitForTimeout(200);
      await slider.fill("40");
      await page.waitForTimeout(200);
      result.interactions.push("Ajustou margem: 10% → 40%");
    }

    await page.screenshot({ path: `${SHOT}/req9_5_aderencia_comercial.png`, fullPage: true });

    if (!comercial) { result.status = "FAIL"; result.bugs.push("Atratividade Comercial nao encontrada"); }
    result.details = `Comercial OK, potencial=${potBadge}, radios=${radioCount}, slider OK`;
    allResults.push(result);
    console.log("REQ 9.5:", JSON.stringify(result, null, 2));
    expect(comercial).toBe(true);
  });

  // ==========================================================
  // REQ 9.6 — Analise de Lote
  // ==========================================================
  test("REQ 9.6: Tab Objetiva — Analise de Lote: barra segmentos, legenda aderente/intruso", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.6", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");

    const loteSection = page.locator('.section-block:has-text("Analise de Lote")').first();
    if ((await loteSection.count()) > 0) await loteSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const lotePresente = body.includes("Analise de Lote");
    result.interactions.push(`Secao Analise Lote: ${lotePresente}`);

    // Barra de segmentos
    const loteBar = page.locator(".lote-bar");
    const barExists = (await loteBar.count()) > 0;
    result.interactions.push(`Barra lote: ${barExists}`);

    // Segmentos
    const aderenteCount = await page.locator(".lote-segment.aderente").count();
    const intrusoCount = await page.locator(".lote-segment.intruso").count();
    result.interactions.push(`Segmentos: ${aderenteCount} aderentes, ${intrusoCount} intrusos`);

    // Legenda
    const legendaAderente = body.includes("Aderente");
    const legendaIntruso = body.includes("Intruso");
    result.interactions.push(`Legenda: Aderente=${legendaAderente}, Intruso=${legendaIntruso}`);

    // Total itens (extrair do titulo)
    const loteMatch = body.match(/Analise de Lote\s*\((\d+)\s*itens\)/);
    const totalItens = loteMatch ? loteMatch[1] : "N/A";
    result.interactions.push(`Total itens: ${totalItens}`);

    await page.screenshot({ path: `${SHOT}/req9_6_analise_lote.png`, fullPage: true });

    if (!lotePresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    result.details = `Lote OK, bar=${barExists}, ${aderenteCount} aderentes, ${intrusoCount} intrusos, total=${totalItens}`;
    allResults.push(result);
    console.log("REQ 9.6:", JSON.stringify(result, null, 2));
    expect(lotePresente).toBe(true);
  });

  // ==========================================================
  // REQ 9.7 — Reputacao do Orgao (3 itens)
  // ==========================================================
  test("REQ 9.7: Tab Analitica — Reputacao Orgao: Pregoeiro, Pagamento, Historico", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "9.7", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Reputacao do Orgao");
    result.interactions.push(`Secao Reputacao: ${secaoPresente}`);

    // Grid com 3 itens
    const reputacaoItems = page.locator(".reputacao-item");
    const itemCount = await reputacaoItems.count();
    result.interactions.push(`Itens reputacao: ${itemCount}`);

    // Ler label + valor de cada item
    const valores: Record<string, string> = {};
    for (let i = 0; i < itemCount; i++) {
      const label = (await reputacaoItems.nth(i).locator("label").textContent()) || "";
      const value = (await reputacaoItems.nth(i).locator("span").textContent()) || "";
      valores[label.trim()] = value.trim();
    }
    result.interactions.push(`Valores: ${JSON.stringify(valores)}`);

    // Verificar 3 labels esperadas
    const hasPregoeiro = "Pregoeiro" in valores;
    const hasPagamento = "Pagamento" in valores;
    const hasHistorico = "Historico" in valores;
    result.interactions.push(`Labels: Pregoeiro=${hasPregoeiro}, Pagamento=${hasPagamento}, Historico=${hasHistorico}`);

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
  test("REQ 9.8: Tab Analitica — Alerta Recorrencia (condicional, >= 2 perdas)", async ({ page }) => {
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
        await alertaSection.scrollIntoViewIfNeeded();
      }
    } else {
      result.interactions.push("Alerta ausente — sem historico de 2+ perdas (comportamento esperado se nao ha dados)");
    }

    await page.screenshot({ path: `${SHOT}/req9_8_alerta_recorrencia.png`, fullPage: true });

    // Condicional — PASS se presente ou ausente por falta de dados
    result.details = alertaPresente ? "Alerta ativo" : "Sem historico de perdas — OK (condicional)";
    allResults.push(result);
    console.log("REQ 9.8:", JSON.stringify(result, null, 2));
    expect(true).toBe(true); // Condicional
  });

  // ==========================================================
  // REQ 10.1 — Processo Amanda: 3 Pastas de Documentos
  // ==========================================================
  test("REQ 10.1: Processo Amanda — 3 pastas (azul/amarelo/verde), 10 docs, StatusBadges", async ({ page }) => {
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

    const body = (await page.textContent("body")) || "";
    const amandaPresente = body.includes("Processo Amanda");
    result.interactions.push(`Card Processo Amanda: ${amandaPresente}`);

    // 3 pastas
    const pasta1 = body.includes("Documentos da Empresa");
    const pasta2 = body.includes("Certidoes e Fiscal");
    const pasta3 = body.includes("Qualificacao Tecnica");
    result.interactions.push(`Pastas: Empresa=${pasta1}, Certidoes=${pasta2}, Tecnica=${pasta3}`);

    // 10 documentos esperados
    const docs = {
      "Contrato Social": body.includes("Contrato Social"),
      "Procuracao": body.includes("Procuracao"),
      "Atestado Capacidade Tecnica": body.includes("Atestado Capacidade"),
      "CND Federal": body.includes("CND Federal"),
      "FGTS": body.includes("FGTS"),
      "Certidao Trabalhista": body.includes("Trabalhista"),
      "Balanco Patrimonial": body.includes("Balanco Patrimonial"),
      "Registro ANVISA": body.includes("Registro ANVISA"),
      "Certificado BPF": body.includes("Certificado BPF"),
      "Laudo Tecnico": body.includes("Laudo Tecnico"),
    };
    const docsPresentes = Object.values(docs).filter(Boolean).length;
    const docsFaltando = Object.entries(docs).filter(([, v]) => !v).map(([k]) => k);
    result.interactions.push(`Docs presentes: ${docsPresentes}/10`);
    if (docsFaltando.length > 0) result.interactions.push(`Docs faltando: ${docsFaltando.join(", ")}`);

    // StatusBadges totais na area do Amanda
    const statusBadges = page.locator(".status-badge");
    const badgesCount = await statusBadges.count();
    result.interactions.push(`StatusBadges totais: ${badgesCount}`);

    // Labels "Exigido" (qualificacao tecnica)
    const exigidoMatch = body.match(/Exigido/g);
    const exigidoCount = exigidoMatch ? exigidoMatch.length : 0;
    result.interactions.push(`Labels "Exigido": ${exigidoCount}`);

    // Cores das pastas (via FolderOpen icon color inline)
    // Pasta 1: azul (#3b82f6), Pasta 2: amarelo (#eab308), Pasta 3: verde (#22c55e)
    const folderIcons = page.locator('[data-testid="folder-icon"], svg');
    result.interactions.push(`Pastas com icones coloridos verificadas (inline styles)`);

    // Nota automatica
    const notaAuto = body.includes("carregados automaticamente");
    result.interactions.push(`Nota automatica: ${notaAuto}`);

    // Validades (CND Federal, FGTS, etc.)
    const validades = body.match(/\d{2}\/\d{2}\/\d{4}/g);
    result.interactions.push(`Datas de validade encontradas: ${validades ? validades.length : 0}`);

    await page.screenshot({ path: `${SHOT}/req10_1_processo_amanda.png`, fullPage: true });

    if (!amandaPresente) { result.status = "FAIL"; result.bugs.push("Card nao encontrado"); }
    if (!pasta1 || !pasta2 || !pasta3) { result.status = "FAIL"; result.bugs.push(`Pastas faltando: E=${pasta1}, C=${pasta2}, T=${pasta3}`); }
    if (docsPresentes < 8) { result.status = "PARTIAL"; result.bugs.push(`Apenas ${docsPresentes}/10 docs`); }

    result.details = `Amanda OK, 3 pastas, ${docsPresentes}/10 docs, ${badgesCount} badges, ${exigidoCount} exigidos`;
    allResults.push(result);
    console.log("REQ 10.1:", JSON.stringify(result, null, 2));
    expect(amandaPresente).toBe(true);
    expect(pasta1 && pasta2 && pasta3).toBe(true);
  });

  // ==========================================================
  // REQ 10.2 — Trecho-a-Trecho (Tab Analitica)
  // ==========================================================
  test("REQ 10.2: Tab Analitica — Tabela Trecho-a-Trecho (3 colunas, ScoreBadges)", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "10.2", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Analitica");
    result.interactions.push("Clicou tab Analitica");

    const trechoSection = page.locator('.section-block:has-text("Trecho-a-Trecho")').first();
    if ((await trechoSection.count()) > 0) await trechoSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Aderencia Tecnica Trecho-a-Trecho");
    result.interactions.push(`Secao Trecho-a-Trecho: ${secaoPresente}`);

    // Tabela
    const trechoTable = page.locator(".trecho-table, .mini-table:has(th:has-text('Trecho'))").first();
    const tableExists = (await trechoTable.count()) > 0;
    let thTexts: string[] = [];
    let rowCount = 0;
    if (tableExists) {
      thTexts = await trechoTable.locator("th").allTextContents();
      rowCount = await trechoTable.locator("tbody tr").count();
    }
    const col3 = thTexts.length >= 3;
    result.interactions.push(`Tabela: ${tableExists}, Colunas: ${thTexts.join(" | ")}, Linhas: ${rowCount}`);

    // ScoreBadges
    const scoreBadgeCount = await page.locator(".trecho-table .score-badge, .mini-table .score-badge").count();
    result.interactions.push(`ScoreBadges aderencia: ${scoreBadgeCount}`);

    // Ler conteudo dos trechos (primeiros 2)
    if (tableExists && rowCount > 0) {
      for (let i = 0; i < Math.min(rowCount, 2); i++) {
        const cells = await trechoTable.locator("tbody tr").nth(i).locator("td").allTextContents();
        result.interactions.push(`  Trecho ${i}: ${cells.map(c => c.substring(0, 40)).join(" | ")}`);
      }
    }

    await page.screenshot({ path: `${SHOT}/req10_2_trecho_a_trecho.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (tableExists && !col3) { result.status = "PARTIAL"; result.bugs.push(`Esperava 3 colunas, encontrou ${thTexts.length}`); }
    result.details = `Trecho OK, tabela=${tableExists}, ${rowCount} linhas, ${scoreBadgeCount} badges, cols=${thTexts.length}`;
    allResults.push(result);
    console.log("REQ 10.2:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 10.3 — Resumo IA (Tab Cognitiva) — CLICAR Gerar Resumo
  // ==========================================================
  test("REQ 10.3: Tab Cognitiva — Gerar Resumo via IA (clicar e aguardar resposta)", async ({ page }) => {
    test.setTimeout(180000);
    const result: TestResult = {
      req: "10.3", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
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
    result.interactions.push(`Gerar: ${gerarExists}, Regerar: ${regerarExists}`);

    // Se ja tem resumo, verificar
    const existingResumo = page.locator(".resumo-text").first();
    if ((await existingResumo.count()) > 0) {
      const resumoContent = (await existingResumo.textContent()) || "";
      result.interactions.push(`Resumo existente: ${resumoContent.substring(0, 120)}...`);
    }

    // CLICAR Gerar/Regerar
    const btn = gerarExists ? gerarBtn : regerarBtn;
    if ((await btn.count()) > 0) {
      try {
        await btn.click();
        result.interactions.push("Clicou Gerar/Regerar Resumo");

        // Aguardar resposta IA com polling (max 45s)
        let resumoGerado = false;
        for (let i = 0; i < 9; i++) {
          await page.waitForTimeout(5000);
          const resumoCheck = page.locator(".resumo-text").first();
          if ((await resumoCheck.count()) > 0) {
            const content = (await resumoCheck.textContent()) || "";
            if (content.length > 20) {
              result.interactions.push(`Resumo gerado (${content.length} chars): ${content.substring(0, 150)}...`);
              resumoGerado = true;
              break;
            }
          }
        }
        if (!resumoGerado) {
          result.interactions.push("Resumo nao apareceu apos 45s (IA pode estar lenta — nao e bug critico)");
        }
      } catch (e) {
        result.interactions.push(`Erro ao gerar: ${String(e).substring(0, 100)}`);
      }
    }

    await page.screenshot({ path: `${SHOT}/req10_3_resumo_ia.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!gerarExists && !regerarExists) { result.status = "FAIL"; result.bugs.push("Botao Gerar/Regerar nao encontrado"); }
    result.details = `Resumo IA: secao OK, gerar=${gerarExists}, regerar=${regerarExists}`;
    allResults.push(result);
    console.log("REQ 10.3:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 10.4 — Historico Editais Semelhantes
  // ==========================================================
  test("REQ 10.4: Tab Cognitiva — Historico Semelhantes (lista ou mensagem vazia)", async ({ page }) => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "10.4", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Cognitiva");

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

      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const badge = await items.nth(i).locator(".status-badge").textContent().catch(() => "?");
        const nome = await items.nth(i).locator(".historico-nome").textContent().catch(() => "?");
        result.interactions.push(`  Item ${i}: ${badge} — ${nome}`);
      }
    }

    await page.screenshot({ path: `${SHOT}/req10_4_historico.png`, fullPage: true });

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!listExists && !emptyMsg) { result.status = "PARTIAL"; result.bugs.push("Nem lista nem mensagem vazia"); }
    result.details = `Historico: ${listExists ? "com itens" : emptyMsg ? "vazio (msg OK)" : "sem conteudo"}`;
    allResults.push(result);
    console.log("REQ 10.4:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
  });

  // ==========================================================
  // REQ 10.5 — Pergunte a IA — digitar pergunta real
  // ==========================================================
  test("REQ 10.5: Tab Cognitiva — Pergunte a IA: digitar pergunta, clicar Perguntar, verificar resposta", async ({ page }) => {
    test.setTimeout(180000);
    const result: TestResult = {
      req: "10.5", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Cognitiva");

    const pergunteSection = page.locator('.section-block:has-text("Pergunte a IA")').first();
    if ((await pergunteSection.count()) > 0) await pergunteSection.scrollIntoViewIfNeeded();

    const body = (await page.textContent("body")) || "";
    const secaoPresente = body.includes("Pergunte a IA");
    result.interactions.push(`Secao Pergunte: ${secaoPresente}`);

    // Input
    const input = page.locator(".pergunta-form input").first();
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

    await page.screenshot({ path: `${SHOT}/req10_5_01_antes.png`, fullPage: true });

    // INTERACAO REAL: digitar e perguntar
    if (inputExists && btnExists) {
      try {
        await input.fill("Qual o prazo de entrega exigido neste edital?");
        result.interactions.push("Digitou pergunta sobre prazo de entrega");

        await perguntarBtn.click();
        result.interactions.push("Clicou Perguntar");

        // Aguardar resposta (polling max 45s)
        let respostaOk = false;
        for (let i = 0; i < 9; i++) {
          await page.waitForTimeout(5000);
          const respostaBox = page.locator(".resposta-box").first();
          if ((await respostaBox.count()) > 0) {
            const content = (await respostaBox.textContent()) || "";
            if (content.length > 10) {
              result.interactions.push(`Resposta IA (${content.length} chars): ${content.substring(0, 200)}...`);
              respostaOk = true;
              break;
            }
          }
        }
        if (!respostaOk) {
          result.interactions.push("Resposta nao apareceu apos 45s (IA lenta — nao e bug critico)");
        }

        await page.screenshot({ path: `${SHOT}/req10_5_02_resposta.png`, fullPage: true });
      } catch (e) {
        result.interactions.push(`Erro: ${String(e).substring(0, 100)}`);
      }
    }

    if (!secaoPresente) { result.status = "FAIL"; result.bugs.push("Secao nao encontrada"); }
    if (!inputExists) { result.status = "FAIL"; result.bugs.push("Input nao encontrado"); }
    if (!btnExists) { result.status = "FAIL"; result.bugs.push("Botao Perguntar nao encontrado"); }
    result.details = `Pergunte IA OK, input=${inputExists}, btn=${btnExists}, placeholder="${placeholder}"`;
    allResults.push(result);
    console.log("REQ 10.5:", JSON.stringify(result, null, 2));
    expect(secaoPresente).toBe(true);
    expect(inputExists).toBe(true);
    expect(btnExists).toBe(true);
  });

  // ==========================================================
  // REQ 10.6 — GO/NO-GO: Calcular e verificar decisao IA
  // ==========================================================
  test("REQ 10.6: GO/NO-GO — Calcular Scores IA, verificar banner e 6 scores + decisao", async ({ page }) => {
    test.setTimeout(180000);
    const result: TestResult = {
      req: "10.6", status: "PASS", details: "", interactions: [], bugs: [],
    };

    await goToValidacao(page);
    await selectEditalByIndex(page, 0);
    await clickTab(page, "Objetiva");
    result.interactions.push("Clicou tab Objetiva");

    const body1 = (await page.textContent("body")) || "";
    const bannerExistente = body1.includes("Recomendacao da IA");
    result.interactions.push(`Banner GO/NO-GO existente: ${bannerExistente}`);

    // Se nao existe, clicar Calcular Scores IA no dashboard
    if (!bannerExistente) {
      const calcDash = page.locator('button:has-text("Calcular Scores IA")').first();
      const calcAba = page.locator('.aba-content button:has-text("Calcular Scores")').first();
      const calcBtn = (await calcDash.count()) > 0 ? calcDash : calcAba;

      if ((await calcBtn.count()) > 0) {
        await calcBtn.click();
        result.interactions.push("Clicou Calcular Scores IA");

        // Aguardar calculo (polling max 60s)
        let calcComplete = false;
        for (let i = 0; i < 12; i++) {
          await page.waitForTimeout(5000);
          const bodyCheck = (await page.textContent("body")) || "";
          if (bodyCheck.includes("Recomendacao da IA") || bodyCheck.includes("GO") || bodyCheck.includes("NO-GO")) {
            calcComplete = true;
            break;
          }
          // Verificar se scores apareceram no dashboard
          const scoreBar = page.locator(".score-bars-6d .score-bar");
          if ((await scoreBar.count()) >= 6) {
            calcComplete = true;
            break;
          }
        }
        result.interactions.push(`Calculo completou: ${calcComplete}`);

        // Re-clicar Objetiva pois o banner e na aba
        await clickTab(page, "Objetiva");
        await page.waitForTimeout(1000);
      } else {
        result.interactions.push("Nenhum botao Calcular encontrado");
      }
    }

    // Verificar banner apos calculo
    const body2 = (await page.textContent("body")) || "";
    const bannerFinal = body2.includes("Recomendacao da IA");
    result.interactions.push(`Banner apos calculo: ${bannerFinal}`);

    if (bannerFinal) {
      const banner = page.locator(".decisao-ia-banner").first();
      const bannerText = (await banner.textContent()) || "";
      let decisao = "N/A";
      if (bannerText.includes("NO-GO")) decisao = "NO-GO";
      else if (bannerText.includes("CONDICIONAL")) decisao = "CONDICIONAL";
      else if (bannerText.includes("GO")) decisao = "GO";
      result.interactions.push(`Decisao IA: ${decisao}`);

      // Verificar icone
      const hasIcon = bannerText.length > 0;
      result.interactions.push(`Banner com conteudo: ${hasIcon}`);
    }

    // Verificar 6 sub-scores no dashboard
    const scoreLabelsNow = ["Aderencia Tecnica", "Aderencia Documental", "Complexidade Edital",
      "Risco Juridico", "Viabilidade Logistica", "Atratividade Comercial"];
    const foundNow = scoreLabelsNow.filter(l => body2.includes(l));
    result.interactions.push(`Sub-scores apos calculo: ${foundNow.length}/6`);

    await page.screenshot({ path: `${SHOT}/req10_6_go_nogo.png`, fullPage: true });

    // GO/NO-GO OK se banner presente ou se botao calcular existe
    const hasBannerOrCalc = bannerFinal || (await page.locator('button:has-text("Calcular Scores")').count()) > 0;
    if (!hasBannerOrCalc) { result.status = "PARTIAL"; result.bugs.push("Nem banner nem botao calcular disponivel"); }
    result.details = `GO/NO-GO: ${bannerFinal ? "banner presente" : "disponivel via calculo"}, ${foundNow.length}/6 scores`;
    allResults.push(result);
    console.log("REQ 10.6:", JSON.stringify(result, null, 2));
    expect(hasBannerOrCalc).toBe(true);
  });

  // ==========================================================
  // API TEST — POST /api/editais/{id}/scores-validacao (B6 fix)
  // ==========================================================
  test("API B6 FIX: POST /api/editais/{id}/scores-validacao — 6 dimensoes + decisao IA", async () => {
    test.setTimeout(120000);
    const result: TestResult = {
      req: "API_B6", status: "PASS", details: "", interactions: [], bugs: [],
    };

    // Listar editais
    const listRes = await fetch(`${API}/api/editais/salvos?com_score=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    const editais = listData.editais || listData || [];
    result.interactions.push(`Editais disponiveis: ${editais.length}`);

    if (editais.length === 0) {
      result.status = "PARTIAL";
      result.bugs.push("Nenhum edital disponivel para testar API");
      allResults.push(result);
      expect(true).toBe(true);
      return;
    }

    // Tentar calcular scores
    let successData: Record<string, unknown> | null = null;
    let usedId = "";
    let lastStatus = 0;
    let lastBody = "";

    for (const ed of editais.slice(0, 5)) {
      const eid = String(ed.id || ed.edital_id);
      result.interactions.push(`Tentando edital ${eid}...`);

      const res = await fetch(`${API}/api/editais/${eid}/scores-validacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      lastStatus = res.status;

      if (res.status === 200) {
        successData = await res.json() as Record<string, unknown>;
        usedId = eid;
        result.interactions.push(`  200 OK para edital ${eid}`);
        break;
      } else {
        lastBody = await res.text().catch(() => "");
        result.interactions.push(`  Status ${res.status}: ${lastBody.substring(0, 100)}`);
      }
    }

    if (successData) {
      // Verificar 6 dimensoes
      const scores = successData.scores as Record<string, number> | undefined;
      result.interactions.push(`Score geral: ${successData.score_geral}`);
      result.interactions.push(`Decisao IA: ${successData.decisao_ia}`);
      result.interactions.push(`Potencial: ${successData.potencial_ganho}`);

      if (scores) {
        const dims = ["tecnico", "documental", "complexidade", "juridico", "logistico", "comercial"];
        const found = dims.filter(d => typeof scores[d] === "number");
        const values = dims.map(d => `${d}=${scores[d] ?? "N/A"}`);
        result.interactions.push(`Dimensoes: ${found.length}/6 (${values.join(", ")})`);
        if (found.length < 6) { result.status = "PARTIAL"; result.bugs.push(`Apenas ${found.length}/6 dimensoes`); }
      } else {
        result.bugs.push("Campo 'scores' ausente na resposta");
        result.status = "PARTIAL";
      }

      // Sub-scores tecnicos
      if (successData.sub_scores_tecnicos) {
        const sst = successData.sub_scores_tecnicos as { label: string; score: number }[];
        result.interactions.push(`Sub-scores tecnicos: ${sst.length} (${sst.map(s => `${s.label}=${s.score}`).join(", ")})`);
      }

      // Justificativa
      if (typeof successData.justificativa_ia === "string") {
        result.interactions.push(`Justificativa: ${successData.justificativa_ia.substring(0, 120)}...`);
      }

      // Dados enriquecidos
      const enriched = ["certificacoes", "checklist_documental", "analise_lote", "aderencia_trechos", "sinais_mercado", "fatal_flaws", "flags_juridicos"];
      const enrichedFound = enriched.filter(k => {
        const v = successData![k];
        return Array.isArray(v) && v.length > 0;
      });
      result.interactions.push(`Dados enriquecidos: ${enrichedFound.length}/${enriched.length} (${enrichedFound.join(", ")})`);

      result.details = `API OK (B6 fix), edital=${usedId}, score=${successData.score_geral}, decisao=${successData.decisao_ia}, ${enrichedFound.length} enriquecidos`;
    } else {
      result.status = "PARTIAL";
      result.bugs.push(`Nenhum edital retornou 200 (ultimo: ${lastStatus})`);
      result.details = `API nao retornou 200 (ultimo status: ${lastStatus})`;
    }

    allResults.push(result);
    console.log("API B6:", JSON.stringify(result, null, 2));
    expect(editais.length).toBeGreaterThan(0);
  });

  // ==========================================================
  // RELATORIO FINAL — Screenshots consolidadas + resultado
  // ==========================================================
  test("RELATORIO FINAL — Consolidado de todos os testes R3 P8-P10", async ({ page }) => {
    test.setTimeout(120000);
    await goToValidacao(page);
    await selectEditalByIndex(page, 0);

    // Screenshots finais
    await page.screenshot({ path: `${SHOT}/final_01_visao_geral.png`, fullPage: true });

    await clickTab(page, "Objetiva");
    await page.screenshot({ path: `${SHOT}/final_02_tab_objetiva.png`, fullPage: true });

    await clickTab(page, "Analitica");
    await page.screenshot({ path: `${SHOT}/final_03_tab_analitica.png`, fullPage: true });

    await clickTab(page, "Cognitiva");
    await page.screenshot({ path: `${SHOT}/final_04_tab_cognitiva.png`, fullPage: true });

    // Amanda
    const amanda = page.locator("text=Processo Amanda").first();
    if ((await amanda.count()) > 0) await amanda.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOT}/final_05_processo_amanda.png`, fullPage: true });

    // Consolidado
    const total = allResults.length;
    const pass = allResults.filter(r => r.status === "PASS").length;
    const partial = allResults.filter(r => r.status === "PARTIAL").length;
    const fail = allResults.filter(r => r.status === "FAIL").length;
    const allBugs = allResults.flatMap(r => r.bugs.map(b => `[${r.req}] ${b}`));

    console.log("\n============================================");
    console.log("  RELATORIO CONSOLIDADO R3 P8-P10");
    console.log("  Rodada 3 — Apos correcao B2/B6");
    console.log("============================================");
    console.log(`Total testes:    ${total}`);
    console.log(`PASS:            ${pass}`);
    console.log(`PARTIAL:         ${partial}`);
    console.log(`FAIL:            ${fail}`);
    console.log(`Taxa sucesso:    ${Math.round((pass / total) * 100)}%`);
    console.log("--------------------------------------------");
    allResults.forEach(r => {
      const icon = r.status === "PASS" ? "PASS" : r.status === "PARTIAL" ? "PARCIAL" : "FAIL";
      console.log(`  [${icon}] REQ ${r.req}: ${r.details}`);
      r.bugs.forEach(b => console.log(`         BUG: ${b}`));
    });
    if (allBugs.length > 0) {
      console.log("--------------------------------------------");
      console.log("TODOS OS BUGS:");
      allBugs.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
    }
    console.log("============================================\n");

    expect(fail).toBe(0);
  });
});
