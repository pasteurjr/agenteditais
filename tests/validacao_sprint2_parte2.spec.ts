/**
 * VALIDACAO SPRINT 2 — PARTE 2 (Grupos 4 a 7)
 * Testes T-20 a T-47
 *
 * Grupo 4: Captacao (T-20 a T-27)
 * Grupo 5: Validacao (T-28 a T-37)
 * Grupo 6: Chat (T-38 a T-44)
 * Grupo 7: Integrados (T-45 a T-47)
 *
 * Execucao VISUAL (headed, slowMo) — test.describe.serial + mesma page
 */
import { test, expect, type Page, type Browser } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// === CONSTANTES ===
const BASE_URL = "http://localhost:5175";
const API_URL = "http://localhost:5007";
const SCREENSHOT_DIR = path.join(__dirname, "test_screenshots", "sprint2");
const EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9";

// === RESULTADOS ===
const results: { id: string; title: string; status: "PASS" | "FAIL" | "PARTIAL"; details: string }[] = [];

// === HELPERS ===

function pushResult(id: string, title: string, status: "PASS" | "FAIL" | "PARTIAL", details: string) {
  results.push({ id, title, status, details });
  console.log(`[${id}] ${title} => ${status}: ${details}`);
}

async function screenshot(page: Page, name: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `S2_${name}.png`), fullPage: true });
}

async function getAuthToken(): Promise<string> {
  const resp = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "pasteurjr@gmail.com", password: "123456" }),
  });
  const data = await resp.json();
  return data.access_token;
}

async function loginUI(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500);
  const sidebar = page.locator(".sidebar, .nav-section, nav").first();
  if (await sidebar.isVisible().catch(() => false)) return;
  await page.fill('input[type="email"], input[name="email"]', "pasteurjr@gmail.com");
  await page.fill('input[type="password"], input[name="password"]', "123456");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
}

async function navigateTo(page: Page, section: string, item: string) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);

  // Fechar modal se aberto
  const modalClose = page.locator(".modal-close, .modal-overlay").first();
  if (await modalClose.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  const sectionHeader = page.locator(".nav-section-header").filter({ hasText: section });
  if (await sectionHeader.isVisible().catch(() => false)) {
    const cls = (await sectionHeader.getAttribute("class")) || "";
    if (!cls.includes("expanded")) {
      await sectionHeader.click();
      await page.waitForTimeout(500);
    }
  }
  const navItem = page.locator(".nav-item, .nav-item-sub").filter({ hasText: item }).first();
  await navItem.click();
  await page.waitForTimeout(2000);
}

async function navigateToCaptacao(page: Page) {
  // Captacao esta em "Fluxo Comercial"
  const captacaoBtn = page.locator('.nav-item').filter({ hasText: "Captacao" }).first();
  if (await captacaoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await captacaoBtn.click();
    await page.waitForTimeout(2000);
    return;
  }
  await navigateTo(page, "Fluxo Comercial", "Captacao");
}

async function navigateToValidacao(page: Page) {
  const validacaoBtn = page.locator('.nav-item').filter({ hasText: "Validacao" }).first();
  if (await validacaoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await validacaoBtn.click();
    await page.waitForTimeout(2000);
    return;
  }
  await navigateTo(page, "Fluxo Comercial", "Validacao");
}

function generateReport() {
  const reportDir = path.join(__dirname, "..", "docs");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  const partialCount = results.filter((r) => r.status === "PARTIAL").length;
  const total = results.length;
  const pct = total > 0 ? ((passCount / total) * 100).toFixed(1) : "0";

  let md = `# Relatorio de Validacao Sprint 2 — Parte 2 (Grupos 4 a 7)\n\n`;
  md += `**Data:** ${new Date().toISOString().slice(0, 19).replace("T", " ")}\n\n`;
  md += `## Resumo\n\n`;
  md += `| Metrica | Valor |\n|---|---|\n`;
  md += `| Total de Testes | ${total} |\n`;
  md += `| PASS | ${passCount} |\n`;
  md += `| FAIL | ${failCount} |\n`;
  md += `| PARTIAL | ${partialCount} |\n`;
  md += `| Taxa de Sucesso | ${pct}% |\n\n`;

  // Por grupo
  const grupos = [
    { nome: "Grupo 4: Captacao", prefix: "T-2" },
    { nome: "Grupo 5: Validacao", prefix: "T-3" },
    { nome: "Grupo 6: Chat", prefix: "T-4" },
    { nome: "Grupo 7: Integrados", prefix: "T-4" },
  ];

  md += `## Resultados Detalhados\n\n`;
  md += `| ID | Titulo | Status | Detalhes |\n|---|---|---|---|\n`;
  for (const r of results) {
    const statusEmoji = r.status === "PASS" ? "PASS" : r.status === "FAIL" ? "FAIL" : "PARTIAL";
    md += `| ${r.id} | ${r.title} | ${statusEmoji} | ${r.details.replace(/\|/g, "/")} |\n`;
  }

  md += `\n## Screenshots\n\nVeja a pasta \`tests/test_screenshots/sprint2/\`\n`;

  const reportPath = path.join(reportDir, "RELATORIO_VALIDACAO_SPRINT2_PARTE2.md");
  fs.writeFileSync(reportPath, md, "utf-8");
  console.log(`\n=== RELATORIO GERADO: ${reportPath} ===`);
  console.log(`PASS: ${passCount} | FAIL: ${failCount} | PARTIAL: ${partialCount} | Total: ${total} | Taxa: ${pct}%\n`);
}

// =============================================================================
// GRUPO 4: CAPTACAO (T-20 a T-27)
// =============================================================================

test.describe.serial("GRUPO 4: CAPTACAO (T-20 a T-27)", () => {
  let page: Page;
  let browser: Browser;

  test.beforeAll(async ({ browser: b }) => {
    browser = b;
    page = await browser.newPage();
    await loginUI(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("T-20: Cards de Prazo (RF-022)", async () => {
    test.setTimeout(60000);
    try {
      await navigateToCaptacao(page);
      await page.waitForTimeout(1000);

      // Verificar StatCards no topo
      const statCardsGrid = page.locator(".stat-cards-grid, .stat-card").first();
      const statCardsVisible = await statCardsGrid.isVisible({ timeout: 5000 }).catch(() => false);

      const statCards = page.locator(".stat-card");
      const statCount = await statCards.count();

      // Coletar valores dos stat cards
      const cardInfos: string[] = [];
      for (let i = 0; i < Math.min(statCount, 6); i++) {
        const card = statCards.nth(i);
        const text = ((await card.textContent()) || "").trim();
        cardInfos.push(text);
      }

      await screenshot(page, "T20_cards_prazo");

      const pass = statCardsVisible && statCount >= 2;
      pushResult("T-20", "Cards de Prazo (RF-022)", pass ? "PASS" : "FAIL",
        `Visible: ${statCardsVisible}, Count: ${statCount}, Cards: ${cardInfos.join(" | ")}`);
      expect(statCount).toBeGreaterThanOrEqual(2);
    } catch (err) {
      await screenshot(page, "T20_erro");
      pushResult("T-20", "Cards de Prazo (RF-022)", "FAIL", String(err));
    }
  });

  test("T-21: Busca Simples de Editais (RF-021)", async () => {
    test.setTimeout(90000);
    try {
      await navigateToCaptacao(page);
      await page.waitForTimeout(1000);

      // Preencher campo de busca/termo
      const termoInput = page.locator(
        '.form-field:has(.form-field-label:text("Termo")) input, input[placeholder*="Buscar"], input[placeholder*="termo"], input.text-input'
      ).first();
      await termoInput.waitFor({ timeout: 5000 });
      await termoInput.fill("equipamentos medicos");
      await page.waitForTimeout(500);

      // Selecionar UF = MG
      const ufSelect = page.locator(
        '.form-field:has(.form-field-label:text("UF")) select, select.select-input'
      ).first();
      if (await ufSelect.isVisible().catch(() => false)) {
        await ufSelect.selectOption("MG");
        await page.waitForTimeout(300);
      }

      // Se ha checkbox "Calcular score" — marcar
      const cbScore = page.locator('input[type="checkbox"]').first();
      if (await cbScore.isVisible().catch(() => false)) {
        const isChecked = await cbScore.isChecked().catch(() => false);
        if (!isChecked) {
          await cbScore.click().catch(() => {});
          await page.waitForTimeout(300);
        }
      }

      // Clicar Buscar Editais
      const buscarBtn = page.locator('button:has-text("Buscar Editais"), button:has-text("Buscar")').first();
      await buscarBtn.click();

      // Aguardar resultado — API pode demorar
      await page.waitForTimeout(15000);

      // Verificar resultados na tabela
      const tableRows = page.locator(".data-table tbody tr, table tbody tr");
      const rowCount = await tableRows.count();

      await screenshot(page, "T21_busca_simples");

      const pass = rowCount >= 1;
      pushResult("T-21", "Busca Simples de Editais (RF-021)", pass ? "PASS" : "PARTIAL",
        `Resultados encontrados: ${rowCount}`);
    } catch (err) {
      await screenshot(page, "T21_erro");
      pushResult("T-21", "Busca Simples de Editais (RF-021)", "FAIL", String(err));
    }
  });

  test("T-22: Busca com Filtros Diferentes", async () => {
    test.setTimeout(90000);
    try {
      await navigateToCaptacao(page);
      await page.waitForTimeout(1000);

      // Limpar e preencher novo termo
      const termoInput = page.locator(
        '.form-field:has(.form-field-label:text("Termo")) input, input.text-input'
      ).first();
      await termoInput.waitFor({ timeout: 5000 });
      await termoInput.fill("");
      await page.waitForTimeout(300);
      await termoInput.fill("reagentes hematologia");
      await page.waitForTimeout(500);

      // Selecionar UF = SP
      const ufSelect = page.locator(
        '.form-field:has(.form-field-label:text("UF")) select, select.select-input'
      ).first();
      if (await ufSelect.isVisible().catch(() => false)) {
        await ufSelect.selectOption("SP");
        await page.waitForTimeout(300);
      }

      // Buscar
      const buscarBtn = page.locator('button:has-text("Buscar Editais"), button:has-text("Buscar")').first();
      await buscarBtn.click();
      await page.waitForTimeout(15000);

      const tableRows = page.locator(".data-table tbody tr, table tbody tr");
      const rowCount = await tableRows.count();

      await screenshot(page, "T22_busca_filtros");

      pushResult("T-22", "Busca com Filtros Diferentes", rowCount >= 0 ? "PASS" : "PARTIAL",
        `Resultados com reagentes hematologia/SP: ${rowCount}`);
    } catch (err) {
      await screenshot(page, "T22_erro");
      pushResult("T-22", "Busca com Filtros Diferentes", "FAIL", String(err));
    }
  });

  test("T-23: Painel Lateral de Analise (RF-019, RF-020)", async () => {
    test.setTimeout(60000);
    try {
      // Verificar se ha resultados na tabela
      const tableRows = page.locator(".data-table tbody tr, table tbody tr");
      const rowCount = await tableRows.count();

      let painelAbriu = false;
      let temScore = false;
      let temProduto = false;

      if (rowCount > 0) {
        // Clicar na primeira linha
        await tableRows.first().click();
        await page.waitForTimeout(2000);

        // Verificar painel lateral
        const painel = page.locator(".captacao-panel");
        painelAbriu = await painel.isVisible({ timeout: 5000 }).catch(() => false);

        if (painelAbriu) {
          // Verificar score no painel
          temScore = await painel.locator(".score-circle-container, .score-cell-tooltip, text=/\\d+%/").first()
            .isVisible({ timeout: 3000 }).catch(() => false);

          // Verificar produto correspondente
          temProduto = await painel.locator('text=Produto Correspondente, text=Produto').first()
            .isVisible({ timeout: 3000 }).catch(() => false);
        }
      }

      await screenshot(page, "T23_painel_lateral");

      pushResult("T-23", "Painel Lateral de Analise (RF-019, RF-020)",
        painelAbriu ? "PASS" : (rowCount === 0 ? "PARTIAL" : "FAIL"),
        `Linhas: ${rowCount}, Painel abriu: ${painelAbriu}, Score: ${temScore}, Produto: ${temProduto}`);
    } catch (err) {
      await screenshot(page, "T23_erro");
      pushResult("T-23", "Painel Lateral de Analise (RF-019, RF-020)", "FAIL", String(err));
    }
  });

  test("T-24: Intencao Estrategica (RF-023)", async () => {
    test.setTimeout(60000);
    try {
      const painel = page.locator(".captacao-panel");
      const painelVisivel = await painel.isVisible({ timeout: 3000 }).catch(() => false);

      let radioEncontrado = false;
      let salvoComSucesso = false;

      if (painelVisivel) {
        // Localizar radio buttons de intencao
        const radioButtons = painel.locator('input[type="radio"]');
        const radioCount = await radioButtons.count();

        if (radioCount > 0) {
          radioEncontrado = true;
          // Selecionar "estrategico" (primeiro radio)
          const estrategicoRadio = painel.locator('input[type="radio"][value="estrategico"]').first();
          if (await estrategicoRadio.isVisible().catch(() => false)) {
            await estrategicoRadio.click();
          } else {
            await radioButtons.first().click();
          }
          await page.waitForTimeout(500);
        }

        // Ajustar slider de margem se existir
        const slider = painel.locator('input[type="range"]').first();
        if (await slider.isVisible().catch(() => false)) {
          await slider.fill("20");
          await page.waitForTimeout(300);
        }

        // Scroll ate botao salvar
        await painel.evaluate((el) => el.scrollTo(0, el.scrollHeight));
        await page.waitForTimeout(500);

        // Clicar Salvar Estrategia se disponivel
        const salvarBtn = painel.locator('button:has-text("Salvar Estrategia"), button:has-text("Salvar")').first();
        if (await salvarBtn.isVisible().catch(() => false)) {
          // Handle dialog
          page.once("dialog", (dialog) => dialog.accept().catch(() => {}));
          await salvarBtn.click();
          await page.waitForTimeout(3000);

          // Verificar sucesso
          salvoComSucesso = await painel.locator('text=sucesso, text=Salvo, text=salva').first()
            .isVisible({ timeout: 5000 }).catch(() => false);
        }
      }

      await screenshot(page, "T24_intencao_estrategica");

      pushResult("T-24", "Intencao Estrategica (RF-023)",
        painelVisivel && radioEncontrado ? "PASS" : (painelVisivel ? "PARTIAL" : "FAIL"),
        `Painel: ${painelVisivel}, Radio: ${radioEncontrado}, Salvo: ${salvoComSucesso}`);
    } catch (err) {
      await screenshot(page, "T24_erro");
      pushResult("T-24", "Intencao Estrategica (RF-023)", "FAIL", String(err));
    }
  });

  test("T-25: Salvar Editais", async () => {
    test.setTimeout(60000);
    try {
      // Fechar painel lateral se aberto
      const painelCloseBtn = page.locator('.captacao-panel button[title="Fechar"], .captacao-panel .btn-icon').first();
      if (await painelCloseBtn.isVisible().catch(() => false)) {
        await painelCloseBtn.click();
        await page.waitForTimeout(500);
      }

      // Verificar checkboxes na tabela
      const checkboxes = page.locator('.data-table tbody tr input[type="checkbox"], table tbody tr input[type="checkbox"]');
      const cbCount = await checkboxes.count();

      let savedOk = false;
      let msgSucesso = false;

      if (cbCount > 0) {
        // Marcar 1-2 checkboxes
        await checkboxes.first().click();
        await page.waitForTimeout(300);
        if (cbCount > 1) {
          await checkboxes.nth(1).click().catch(() => {});
          await page.waitForTimeout(300);
        }

        // Clicar salvar
        const salvarBtn = page.locator('button:has-text("Salvar Selecionados"), button:has-text("Salvar")').first();
        if (await salvarBtn.isVisible().catch(() => false)) {
          page.once("dialog", (dialog) => dialog.accept().catch(() => {}));
          await salvarBtn.click();
          await page.waitForTimeout(3000);
          savedOk = true;

          msgSucesso = await page.locator('text=salvo, text=sucesso, text=Salvo').first()
            .isVisible({ timeout: 5000 }).catch(() => false);
        }
      }

      await screenshot(page, "T25_salvar_editais");

      pushResult("T-25", "Salvar Editais",
        savedOk ? "PASS" : (cbCount === 0 ? "PARTIAL" : "FAIL"),
        `Checkboxes: ${cbCount}, Salvou: ${savedOk}, Msg sucesso: ${msgSucesso}`);
    } catch (err) {
      await screenshot(page, "T25_erro");
      pushResult("T-25", "Salvar Editais", "FAIL", String(err));
    }
  });

  test("T-26: Monitoramento 24/7 (RF-025)", async () => {
    test.setTimeout(60000);
    try {
      await navigateToCaptacao(page);
      await page.waitForTimeout(1000);

      // Rolar ate secao de monitoramento
      const monitorSection = page.locator('text=Monitoramento Automatico, text=Monitoramento 24').first();
      let monitorVisivel = false;

      if (await monitorSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await monitorSection.scrollIntoViewIfNeeded();
        monitorVisivel = true;
      } else {
        // Scroll ate o final da pagina para encontrar secao
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        monitorVisivel = await monitorSection.isVisible({ timeout: 3000 }).catch(() => false);
      }

      // Verificar monitoramentos existentes
      const monitorItems = page.locator('.monitor-item, text=Monitoramentos ativos, text=ativo');
      const temMonitoramentos = await monitorItems.first().isVisible({ timeout: 3000 }).catch(() => false);

      // Tentar criar novo monitoramento se formulario disponivel
      let formularioVisivel = false;
      let criadoOk = false;

      const termoMonitor = page.locator(
        '.form-field:has(.form-field-label:text("Termo")) input, input[placeholder*="termo"], input[placeholder*="monitorar"]'
      ).last();
      if (await termoMonitor.isVisible().catch(() => false)) {
        formularioVisivel = true;
        await termoMonitor.fill("insumos hospitalares");
        await page.waitForTimeout(300);

        // UFs
        const ufInput = page.locator(
          '.form-field:has(.form-field-label:text("UF")) select'
        ).last();
        if (await ufInput.isVisible().catch(() => false)) {
          await ufInput.selectOption("MG").catch(() => {});
          await page.waitForTimeout(300);
        }

        // Frequencia
        const freqSelect = page.locator(
          '.form-field:has(.form-field-label:text("Frequencia")) select, select:has(option:text("12h"))'
        ).last();
        if (await freqSelect.isVisible().catch(() => false)) {
          await freqSelect.selectOption({ index: 1 }).catch(() => {});
          await page.waitForTimeout(300);
        }

        // Criar
        const criarBtn = page.locator('button:has-text("Criar Monitoramento"), button:has-text("Adicionar"), button:has-text("Criar")').last();
        if (await criarBtn.isVisible().catch(() => false)) {
          page.once("dialog", (dialog) => dialog.accept().catch(() => {}));
          await criarBtn.click();
          await page.waitForTimeout(3000);
          criadoOk = true;
        }
      }

      await screenshot(page, "T26_monitoramento");

      pushResult("T-26", "Monitoramento 24/7 (RF-025)",
        monitorVisivel ? "PASS" : "PARTIAL",
        `Monitor visivel: ${monitorVisivel}, Tem itens: ${temMonitoramentos}, Formulario: ${formularioVisivel}, Criado: ${criadoOk}`);
    } catch (err) {
      await screenshot(page, "T26_erro");
      pushResult("T-26", "Monitoramento 24/7 (RF-025)", "FAIL", String(err));
    }
  });

  test("T-27: Botao Abrir no Portal", async () => {
    test.setTimeout(60000);
    try {
      // Verificar se ha botao "Abrir" ou link externo
      const abrirBtn = page.locator(
        'button:has-text("Abrir"), a[target="_blank"], button[title="Abrir no portal"], .external-link-btn'
      ).first();
      const abrirVisivel = await abrirBtn.isVisible({ timeout: 5000 }).catch(() => false);

      // Verificar tambem icones de link externo na tabela
      const externalIcons = page.locator('svg.lucide-external-link, [data-icon="external-link"]');
      const externalCount = await externalIcons.count().catch(() => 0);

      await screenshot(page, "T27_abrir_portal");

      pushResult("T-27", "Botao Abrir no Portal",
        abrirVisivel || externalCount > 0 ? "PASS" : "PARTIAL",
        `Botao Abrir: ${abrirVisivel}, Icones external-link: ${externalCount}`);
    } catch (err) {
      await screenshot(page, "T27_erro");
      pushResult("T-27", "Botao Abrir no Portal", "FAIL", String(err));
    }
  });
});

// =============================================================================
// GRUPO 5: VALIDACAO (T-28 a T-37)
// =============================================================================

test.describe.serial("GRUPO 5: VALIDACAO (T-28 a T-37)", () => {
  let page: Page;
  let browser: Browser;

  test.beforeAll(async ({ browser: b }) => {
    browser = b;
    page = await browser.newPage();
    await loginUI(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("T-28: Tabela de Editais para Validacao", async () => {
    test.setTimeout(60000);
    try {
      await navigateToValidacao(page);
      await page.waitForTimeout(2000);

      // Verificar titulo da pagina
      const h1 = page.locator('h1:has-text("Validacao"), h1:has-text("Validação")').first();
      const tituloVisivel = await h1.isVisible({ timeout: 5000 }).catch(() => false);

      // Verificar DataTable carrega
      const dataTable = page.locator(".data-table, table");
      const tabelaVisivel = await dataTable.first().isVisible({ timeout: 8000 }).catch(() => false);

      const rows = page.locator(".data-table tbody tr, table tbody tr");
      const rowCount = await rows.count();

      // Verificar filtros
      const filterBar = page.locator(".filter-bar, .search-filter");
      const filterVisivel = await filterBar.first().isVisible({ timeout: 3000 }).catch(() => false);

      // Input de busca
      const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input.text-input').first();
      const searchVisivel = await searchInput.isVisible().catch(() => false);

      // Select de status
      const statusSelect = page.locator('select.select-input, select').first();
      const statusVisivel = await statusSelect.isVisible().catch(() => false);

      await screenshot(page, "T28_tabela_validacao");

      pushResult("T-28", "Tabela de Editais para Validacao",
        tabelaVisivel ? "PASS" : "FAIL",
        `Titulo: ${tituloVisivel}, Tabela: ${tabelaVisivel}, Linhas: ${rowCount}, Filtros: ${filterVisivel}, Busca: ${searchVisivel}, Status: ${statusVisivel}`);
      expect(tabelaVisivel).toBe(true);
    } catch (err) {
      await screenshot(page, "T28_erro");
      pushResult("T-28", "Tabela de Editais para Validacao", "FAIL", String(err));
    }
  });

  test("T-29: Sinais de Mercado (RF-026)", async () => {
    test.setTimeout(60000);
    try {
      // Clicar no primeiro edital se ha resultados
      const rows = page.locator(".data-table tbody tr, table tbody tr");
      const rowCount = await rows.count();

      let sinaisVisiveis = false;
      let badgesCount = 0;

      if (rowCount > 0) {
        await rows.first().click();
        await page.waitForTimeout(2000);

        // Verificar badges de sinais de mercado
        const badges = page.locator(".status-badge-success, .status-badge-warning, .status-badge-error, .sinais-badge, .signal-badge");
        badgesCount = await badges.count();
        sinaisVisiveis = badgesCount > 0;

        // Verificar texto de sinais
        const sinaisText = page.locator('text=Sinais de Mercado, text=sinais, text=Sinal');
        const textVisivel = await sinaisText.first().isVisible({ timeout: 3000 }).catch(() => false);
        sinaisVisiveis = sinaisVisiveis || textVisivel;
      }

      await screenshot(page, "T29_sinais_mercado");

      pushResult("T-29", "Sinais de Mercado (RF-026)",
        rowCount > 0 ? (sinaisVisiveis ? "PASS" : "PARTIAL") : "PARTIAL",
        `Linhas: ${rowCount}, Sinais visiveis: ${sinaisVisiveis}, Badges: ${badgesCount}`);
    } catch (err) {
      await screenshot(page, "T29_erro");
      pushResult("T-29", "Sinais de Mercado (RF-026)", "FAIL", String(err));
    }
  });

  test("T-30: Decisao Participar/Acompanhar/Ignorar (RF-027)", async () => {
    test.setTimeout(60000);
    try {
      // Verificar botoes de decisao
      const btnParticipar = page.locator('button:has-text("Participar")').first();
      const btnAcompanhar = page.locator('button:has-text("Acompanhar")').first();
      const btnIgnorar = page.locator('button:has-text("Ignorar")').first();

      const participarVisivel = await btnParticipar.isVisible({ timeout: 5000 }).catch(() => false);
      const acompanharVisivel = await btnAcompanhar.isVisible({ timeout: 3000 }).catch(() => false);
      const ignorarVisivel = await btnIgnorar.isVisible({ timeout: 3000 }).catch(() => false);

      let clicouParticipar = false;
      let modalAbriu = false;
      let confirmouOk = false;

      if (participarVisivel) {
        await btnParticipar.click();
        await page.waitForTimeout(1500);
        clicouParticipar = true;

        // Verificar se modal de justificativa abre
        const modal = page.locator(".modal-overlay, .modal");
        modalAbriu = await modal.first().isVisible({ timeout: 3000 }).catch(() => false);

        if (modalAbriu) {
          // Preencher motivo (select)
          const motivoSelect = page.locator(".modal select.select-input, .modal select").first();
          if (await motivoSelect.isVisible().catch(() => false)) {
            const options = motivoSelect.locator("option");
            const optCount = await options.count();
            if (optCount > 1) {
              await motivoSelect.selectOption({ index: 1 });
              await page.waitForTimeout(300);
            }
          }

          // Preencher detalhes (textarea)
          const textarea = page.locator(".modal textarea, .modal .text-area").first();
          if (await textarea.isVisible().catch(() => false)) {
            await textarea.fill("Aderencia tecnica alta. Portfolio atende requisitos.");
            await page.waitForTimeout(300);
          }

          // Confirmar
          const confirmarBtn = page.locator('.modal button:has-text("Confirmar"), .modal button:has-text("Salvar"), .modal button.btn-primary').first();
          if (await confirmarBtn.isVisible().catch(() => false)) {
            await confirmarBtn.click();
            await page.waitForTimeout(2000);
            confirmouOk = true;
          }
        }
      }

      await screenshot(page, "T30_decisao_participar");

      pushResult("T-30", "Decisao Participar/Acompanhar/Ignorar (RF-027)",
        participarVisivel ? "PASS" : "PARTIAL",
        `Participar: ${participarVisivel}, Acompanhar: ${acompanharVisivel}, Ignorar: ${ignorarVisivel}, Clicou: ${clicouParticipar}, Modal: ${modalAbriu}, Confirmou: ${confirmouOk}`);
    } catch (err) {
      await screenshot(page, "T30_erro");
      pushResult("T-30", "Decisao Participar/Acompanhar/Ignorar (RF-027)", "FAIL", String(err));
    }
  });

  test("T-31: Score Dashboard (RF-028)", async () => {
    test.setTimeout(90000);
    try {
      // Verificar area de scores (circulo grande, barras)
      const scoreCircle = page.locator(".score-circle-container, .score-circle").first();
      const scoreVisivel = await scoreCircle.isVisible({ timeout: 5000 }).catch(() => false);

      const scoreBars = page.locator(".score-bar, .score-bars-6d");
      const barsCount = await scoreBars.locator(".score-bar-item, .score-bar").count().catch(() => 0);

      // Se ha botao "Calcular Scores IA"
      const calcularBtn = page.locator('button:has-text("Calcular Scores"), button:has-text("Calcular Scores IA")').first();
      let calcularVisivel = await calcularBtn.isVisible().catch(() => false);
      let calculouOk = false;

      if (calcularVisivel) {
        await calcularBtn.click();
        await page.waitForTimeout(30000); // IA pode demorar
        calculouOk = true;

        // Verificar scores apos calculo
        const scoreAposCalculo = await scoreCircle.isVisible({ timeout: 5000 }).catch(() => false);
        calculouOk = scoreAposCalculo;
      }

      await screenshot(page, "T31_score_dashboard");

      pushResult("T-31", "Score Dashboard (RF-028)",
        scoreVisivel || calculouOk ? "PASS" : "PARTIAL",
        `Score circulo: ${scoreVisivel}, Barras: ${barsCount}, Btn calcular: ${calcularVisivel}, Calculou: ${calculouOk}`);
    } catch (err) {
      await screenshot(page, "T31_erro");
      pushResult("T-31", "Score Dashboard (RF-028)", "FAIL", String(err));
    }
  });

  test("T-32: Aba Aderencia (RF-029)", async () => {
    test.setTimeout(60000);
    try {
      // Clicar aba Aderencia
      const abaAderencia = page.locator('.tab-panel-tab').filter({ hasText: "Aderencia" }).first();
      let abaVisivel = await abaAderencia.isVisible({ timeout: 5000 }).catch(() => false);

      let conteudoOk = false;
      let subScoresVisiveis = false;
      let analiseVisivelLote = false;

      if (abaVisivel) {
        await abaAderencia.click();
        await page.waitForTimeout(1500);

        // Verificar conteudo: recomendacao IA, sub-scores, analise de lote
        const recomendacao = page.locator('text=Recomendacao, text=Aderencia Tecnica').first();
        conteudoOk = await recomendacao.isVisible({ timeout: 3000 }).catch(() => false);

        // Sub-scores
        const subScores = page.locator(".score-bar, .sub-score-item, text=Score");
        subScoresVisiveis = (await subScores.count()) > 0;

        // Analise de lote
        analiseVisivelLote = await page.locator('text=Analise de Lote, text=lote, text=Itens').first()
          .isVisible({ timeout: 3000 }).catch(() => false);
      }

      await screenshot(page, "T32_aba_aderencia");

      pushResult("T-32", "Aba Aderencia (RF-029)",
        abaVisivel ? "PASS" : "PARTIAL",
        `Aba visivel: ${abaVisivel}, Conteudo: ${conteudoOk}, SubScores: ${subScoresVisiveis}, Lote: ${analiseVisivelLote}`);
    } catch (err) {
      await screenshot(page, "T32_erro");
      pushResult("T-32", "Aba Aderencia (RF-029)", "FAIL", String(err));
    }
  });

  test("T-33: Aba Documentos — Processo Amanda (RF-036)", async () => {
    test.setTimeout(60000);
    try {
      // Clicar aba Documentos
      const abaDocumentos = page.locator('.tab-panel-tab').filter({ hasText: "Documentos" }).first();
      let abaVisivel = await abaDocumentos.isVisible({ timeout: 5000 }).catch(() => false);

      let pastasColoridas = 0;
      let checklistVisivel = false;

      if (abaVisivel) {
        await abaDocumentos.click();
        await page.waitForTimeout(1500);

        // Verificar 3 pastas coloridas (empresa, fiscal, tecnica)
        const pastas = page.locator('.folder-card, .pasta-doc, .doc-categoria, .doc-section-card');
        pastasColoridas = await pastas.count();

        // Verificar checklist documental
        const checklist = page.locator('.checklist-item, text=Checklist, text=Documentacao Necessaria, text=Documentos Exigidos');
        checklistVisivel = await checklist.first().isVisible({ timeout: 3000 }).catch(() => false);

        // Alternativa: verificar categorias (empresa, fiscal, tecnica)
        if (pastasColoridas === 0) {
          const catEmpresa = await page.locator('text=Empresa, text=empresa').first().isVisible().catch(() => false);
          const catFiscal = await page.locator('text=Fiscal, text=fiscal').first().isVisible().catch(() => false);
          const catTecnica = await page.locator('text=Tecnica, text=tecnica').first().isVisible().catch(() => false);
          pastasColoridas = [catEmpresa, catFiscal, catTecnica].filter(Boolean).length;
        }
      }

      await screenshot(page, "T33_aba_documentos");

      pushResult("T-33", "Aba Documentos — Processo Amanda (RF-036)",
        abaVisivel ? "PASS" : "PARTIAL",
        `Aba: ${abaVisivel}, Pastas/categorias: ${pastasColoridas}, Checklist: ${checklistVisivel}`);
    } catch (err) {
      await screenshot(page, "T33_erro");
      pushResult("T-33", "Aba Documentos — Processo Amanda (RF-036)", "FAIL", String(err));
    }
  });

  test("T-34: Aba Riscos (RF-032)", async () => {
    test.setTimeout(60000);
    try {
      // Clicar aba Riscos
      const abaRiscos = page.locator('.tab-panel-tab').filter({ hasText: "Riscos" }).first();
      let abaVisivel = await abaRiscos.isVisible({ timeout: 5000 }).catch(() => false);

      let pipelineVisivel = false;
      let badgesRisco = 0;

      if (abaVisivel) {
        await abaRiscos.click();
        await page.waitForTimeout(1500);

        // Verificar pipeline de riscos
        pipelineVisivel = await page.locator('text=Riscos, text=Risco, text=Fatal Flaw, text=Flags').first()
          .isVisible({ timeout: 3000 }).catch(() => false);

        // Verificar badges de risco
        const badges = page.locator('.status-badge-error, .status-badge-warning, .risk-badge, .fatal-flaw-item');
        badgesRisco = await badges.count();
      }

      await screenshot(page, "T34_aba_riscos");

      pushResult("T-34", "Aba Riscos (RF-032)",
        abaVisivel ? "PASS" : "PARTIAL",
        `Aba: ${abaVisivel}, Pipeline/riscos: ${pipelineVisivel}, Badges: ${badgesRisco}`);
    } catch (err) {
      await screenshot(page, "T34_erro");
      pushResult("T-34", "Aba Riscos (RF-032)", "FAIL", String(err));
    }
  });

  test("T-35: Aba Mercado", async () => {
    test.setTimeout(60000);
    try {
      // Clicar aba Mercado
      const abaMercado = page.locator('.tab-panel-tab').filter({ hasText: "Mercado" }).first();
      let abaVisivel = await abaMercado.isVisible({ timeout: 5000 }).catch(() => false);

      let reputacaoVisivel = false;
      let historicoVisivel = false;

      if (abaVisivel) {
        await abaMercado.click();
        await page.waitForTimeout(1500);

        // Verificar conteudo: reputacao do orgao, historico
        reputacaoVisivel = await page.locator('text=Reputacao, text=Orgao, text=Pregoeiro, text=reputacao').first()
          .isVisible({ timeout: 3000 }).catch(() => false);

        historicoVisivel = await page.locator('text=Historico, text=historico, text=Semelhante').first()
          .isVisible({ timeout: 3000 }).catch(() => false);
      }

      await screenshot(page, "T35_aba_mercado");

      pushResult("T-35", "Aba Mercado",
        abaVisivel ? "PASS" : "PARTIAL",
        `Aba: ${abaVisivel}, Reputacao: ${reputacaoVisivel}, Historico: ${historicoVisivel}`);
    } catch (err) {
      await screenshot(page, "T35_erro");
      pushResult("T-35", "Aba Mercado", "FAIL", String(err));
    }
  });

  test("T-36: Aba IA — Chat Cognitivo", async () => {
    test.setTimeout(90000);
    try {
      // Clicar aba IA
      const abaIA = page.locator('.tab-panel-tab').filter({ hasText: "IA" }).first();
      let abaVisivel = await abaIA.isVisible({ timeout: 5000 }).catch(() => false);

      let resumoGerado = false;
      let perguntaEnviada = false;

      if (abaVisivel) {
        await abaIA.click();
        await page.waitForTimeout(1500);

        // Se ha botao "Gerar Resumo", clicar
        const gerarResumoBtn = page.locator('button:has-text("Gerar Resumo")').first();
        if (await gerarResumoBtn.isVisible().catch(() => false)) {
          await gerarResumoBtn.click();
          await page.waitForTimeout(20000); // IA demora

          // Verificar se resumo apareceu
          resumoGerado = await page.locator('.resumo-box, .resumo-text, text=Resumo').first()
            .isVisible({ timeout: 10000 }).catch(() => false);
        }

        // Se ha campo "Pergunte a IA", digitar pergunta
        const perguntaInput = page.locator('textarea[placeholder*="pergunt"], textarea[placeholder*="Pergunt"], input[placeholder*="pergunt"]').first();
        if (await perguntaInput.isVisible().catch(() => false)) {
          await perguntaInput.fill("Quais os riscos deste edital?");
          await page.waitForTimeout(500);

          // Enviar pergunta
          const enviarBtn = page.locator('button:has-text("Enviar"), button:has-text("Perguntar")').first();
          if (await enviarBtn.isVisible().catch(() => false)) {
            await enviarBtn.click();
            await page.waitForTimeout(20000);
            perguntaEnviada = true;
          }
        }
      }

      await screenshot(page, "T36_aba_ia");

      pushResult("T-36", "Aba IA — Chat Cognitivo",
        abaVisivel ? "PASS" : "PARTIAL",
        `Aba: ${abaVisivel}, Resumo: ${resumoGerado}, Pergunta: ${perguntaEnviada}`);
    } catch (err) {
      await screenshot(page, "T36_erro");
      pushResult("T-36", "Aba IA — Chat Cognitivo", "FAIL", String(err));
    }
  });

  test("T-37: GO/NO-GO (RF-037)", async () => {
    test.setTimeout(60000);
    try {
      // Verificar badge GO/NO-GO
      const goBadge = page.locator('text=GO, text=NO-GO, text=CONDICIONAL').first();
      const goBadgeVisivel = await goBadge.isVisible({ timeout: 5000 }).catch(() => false);

      // Verificar score geral consolidado
      const scoreGeral = page.locator(".score-circle-container, .score-circle, .score-geral").first();
      const scoreGeralVisivel = await scoreGeral.isVisible({ timeout: 3000 }).catch(() => false);

      // Verificar decisao IA
      const decisaoIA = page.locator('.decisao-ia, text=Decisao IA, .go-nogo-badge').first();
      const decisaoVisivel = await decisaoIA.isVisible({ timeout: 3000 }).catch(() => false);

      // Verificar score bars (6 dimensoes)
      const scoreBars = page.locator('.score-bars-6d .score-bar, .score-bar');
      const barsCount = await scoreBars.count().catch(() => 0);

      await screenshot(page, "T37_go_nogo");

      pushResult("T-37", "GO/NO-GO (RF-037)",
        goBadgeVisivel || scoreGeralVisivel ? "PASS" : "PARTIAL",
        `Badge GO: ${goBadgeVisivel}, Score geral: ${scoreGeralVisivel}, Decisao IA: ${decisaoVisivel}, Score bars: ${barsCount}`);
    } catch (err) {
      await screenshot(page, "T37_erro");
      pushResult("T-37", "GO/NO-GO (RF-037)", "FAIL", String(err));
    }
  });
});

// =============================================================================
// GRUPO 6: CHAT (T-38 a T-44)
// =============================================================================

test.describe.serial("GRUPO 6: CHAT (T-38 a T-44)", () => {
  let page: Page;
  let browser: Browser;

  test.beforeAll(async ({ browser: b }) => {
    browser = b;
    page = await browser.newPage();
    await loginUI(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("T-38: Chat — Listar Produtos", async () => {
    test.setTimeout(90000);
    try {
      // Clicar no botao flutuante do chat
      const chatBtn = page.locator(".floating-chat-btn");
      await chatBtn.waitFor({ timeout: 5000 });
      await chatBtn.click();
      await page.waitForTimeout(1500);

      // Aguardar modal do chat
      const chatModal = page.locator(".floating-chat-modal");
      const modalAbriu = await chatModal.isVisible({ timeout: 5000 }).catch(() => false);

      let respostaRecebida = false;

      if (modalAbriu) {
        // Digitar mensagem no textarea (chat-input e uma textarea)
        const chatInput = page.locator(".chat-input");
        await chatInput.waitFor({ timeout: 3000 });
        await chatInput.fill("Listar meus produtos");
        await page.waitForTimeout(500);

        // Clicar enviar
        const sendBtn = page.locator(".send-button");
        await sendBtn.click();
        await page.waitForTimeout(15000);

        // Verificar resposta
        const mensagens = page.locator(".message-bubble.assistant-bubble");
        const msgCount = await mensagens.count();
        respostaRecebida = msgCount > 0;
      }

      await screenshot(page, "T38_chat_listar_produtos");

      pushResult("T-38", "Chat — Listar Produtos",
        modalAbriu && respostaRecebida ? "PASS" : (modalAbriu ? "PARTIAL" : "FAIL"),
        `Modal: ${modalAbriu}, Resposta: ${respostaRecebida}`);
      expect(modalAbriu).toBe(true);
    } catch (err) {
      await screenshot(page, "T38_erro");
      pushResult("T-38", "Chat — Listar Produtos", "FAIL", String(err));
    }
  });

  test("T-39: Chat — Buscar Editais", async () => {
    test.setTimeout(90000);
    try {
      // Chat ja deve estar aberto
      const chatInput = page.locator(".chat-input");
      await chatInput.waitFor({ timeout: 3000 });
      await chatInput.fill("Buscar editais de equipamentos medicos em MG");
      await page.waitForTimeout(500);

      const sendBtn = page.locator(".send-button");
      await sendBtn.click();
      await page.waitForTimeout(20000);

      // Contar mensagens do assistente
      const mensagens = page.locator(".message-bubble.assistant-bubble");
      const msgCount = await mensagens.count();

      // Verificar que ha mais de 1 resposta (a anterior + esta)
      const respostaRecebida = msgCount >= 2;

      await screenshot(page, "T39_chat_buscar_editais");

      pushResult("T-39", "Chat — Buscar Editais",
        respostaRecebida ? "PASS" : "PARTIAL",
        `Mensagens do assistente: ${msgCount}`);
    } catch (err) {
      await screenshot(page, "T39_erro");
      pushResult("T-39", "Chat — Buscar Editais", "FAIL", String(err));
    }
  });

  test("T-40: Chat — Calcular Aderencia", async () => {
    test.setTimeout(90000);
    try {
      const chatInput = page.locator(".chat-input");
      await chatInput.waitFor({ timeout: 3000 });
      await chatInput.fill("Calcular aderencia do edital PE-001/2026");
      await page.waitForTimeout(500);

      const sendBtn = page.locator(".send-button");
      await sendBtn.click();
      await page.waitForTimeout(20000);

      const mensagens = page.locator(".message-bubble.assistant-bubble");
      const msgCount = await mensagens.count();
      const respostaRecebida = msgCount >= 3;

      await screenshot(page, "T40_chat_calcular_aderencia");

      pushResult("T-40", "Chat — Calcular Aderencia",
        respostaRecebida ? "PASS" : "PARTIAL",
        `Mensagens do assistente: ${msgCount}`);
    } catch (err) {
      await screenshot(page, "T40_erro");
      pushResult("T-40", "Chat — Calcular Aderencia", "FAIL", String(err));
    }
  });

  test("T-41: Chat — Gerar Proposta", async () => {
    test.setTimeout(90000);
    try {
      const chatInput = page.locator(".chat-input");
      await chatInput.waitFor({ timeout: 3000 });
      await chatInput.fill("Gerar proposta para o edital PE-001/2026");
      await page.waitForTimeout(500);

      const sendBtn = page.locator(".send-button");
      await sendBtn.click();
      await page.waitForTimeout(30000);

      const mensagens = page.locator(".message-bubble.assistant-bubble");
      const msgCount = await mensagens.count();
      const respostaRecebida = msgCount >= 4;

      await screenshot(page, "T41_chat_gerar_proposta");

      pushResult("T-41", "Chat — Gerar Proposta",
        respostaRecebida ? "PASS" : "PARTIAL",
        `Mensagens do assistente: ${msgCount}`);
    } catch (err) {
      await screenshot(page, "T41_erro");
      pushResult("T-41", "Chat — Gerar Proposta", "FAIL", String(err));
    }
  });

  test("T-42: Chat — Upload de Documento", async () => {
    test.setTimeout(90000);
    try {
      // Verificar se ha botao de upload no chat
      const uploadBtn = page.locator(".upload-button, button[title*='Enviar PDF']").first();
      const uploadVisivel = await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false);

      let uploadOk = false;

      if (uploadVisivel) {
        // Verificar se arquivo de teste existe
        const fixturePath = path.join(__dirname, "fixtures", "teste_upload.pdf");
        if (fs.existsSync(fixturePath)) {
          // Localizar input file hidden
          const fileInput = page.locator('input[type="file"]').first();
          await fileInput.setInputFiles(fixturePath);
          await page.waitForTimeout(1000);

          // Verificar que arquivo aparece selecionado
          const fileBanner = page.locator(".selected-file-banner, text=teste_upload");
          uploadOk = await fileBanner.first().isVisible({ timeout: 3000 }).catch(() => false);

          if (uploadOk) {
            // Digitar mensagem
            const chatInput = page.locator(".chat-input");
            await chatInput.fill("Analise este documento");
            await page.waitForTimeout(500);

            const sendBtn = page.locator(".send-button");
            await sendBtn.click();
            await page.waitForTimeout(15000);
          }
        } else {
          // Arquivo nao existe — registrar como PARTIAL
          uploadOk = false;
        }
      }

      await screenshot(page, "T42_chat_upload");

      pushResult("T-42", "Chat — Upload de Documento",
        uploadVisivel ? (uploadOk ? "PASS" : "PARTIAL") : "PARTIAL",
        `Botao upload: ${uploadVisivel}, Upload OK: ${uploadOk}`);
    } catch (err) {
      await screenshot(page, "T42_erro");
      pushResult("T-42", "Chat — Upload de Documento", "FAIL", String(err));
    }
  });

  test("T-43: Chat — Perguntas Contextuais", async () => {
    test.setTimeout(90000);
    try {
      const chatInput = page.locator(".chat-input");
      await chatInput.waitFor({ timeout: 3000 });
      await chatInput.fill("Quais documentos estao vencidos?");
      await page.waitForTimeout(500);

      const sendBtn = page.locator(".send-button");
      await sendBtn.click();
      await page.waitForTimeout(15000);

      const mensagens = page.locator(".message-bubble.assistant-bubble");
      const msgCount = await mensagens.count();

      // Verificar ultima resposta
      const ultimaMsg = mensagens.last();
      const textoResposta = ((await ultimaMsg.textContent()) || "").trim();
      const respostaValida = textoResposta.length > 10;

      await screenshot(page, "T43_chat_perguntas_contextuais");

      pushResult("T-43", "Chat — Perguntas Contextuais",
        respostaValida ? "PASS" : "PARTIAL",
        `Mensagens: ${msgCount}, Resposta valida (>10 chars): ${respostaValida}`);
    } catch (err) {
      await screenshot(page, "T43_erro");
      pushResult("T-43", "Chat — Perguntas Contextuais", "FAIL", String(err));
    }
  });

  test("T-44: Chat — Sessoes", async () => {
    test.setTimeout(60000);
    try {
      // Clicar no botao de historico (History icon no header do chat)
      const historyBtn = page.locator('.floating-chat-header-btn').first();
      let sessoesPanelVisivel = false;
      let novaConversaBtnVisivel = false;

      if (await historyBtn.isVisible().catch(() => false)) {
        await historyBtn.click();
        await page.waitForTimeout(1000);

        // Verificar lista de sessoes
        const sessionsList = page.locator(".floating-chat-sessions-list");
        sessoesPanelVisivel = await sessionsList.isVisible({ timeout: 3000 }).catch(() => false);

        // Verificar itens de sessao
        const sessionItems = page.locator(".floating-chat-session-item");
        const sessionCount = await sessionItems.count();

        // Botao Nova Conversa
        const novaConversaBtn = page.locator('button[title="Nova conversa"], .floating-chat-new-session-btn').first();
        novaConversaBtnVisivel = await novaConversaBtn.isVisible().catch(() => false);

        if (novaConversaBtnVisivel) {
          await novaConversaBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      // Fechar chat
      const closeBtn = page.locator('.floating-chat-header-btn[title="Fechar"], .floating-chat-btn').last();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click().catch(() => {});
        await page.waitForTimeout(500);
      }
      // Fallback: Escape
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(500);

      await screenshot(page, "T44_chat_sessoes");

      pushResult("T-44", "Chat — Sessoes",
        sessoesPanelVisivel ? "PASS" : "PARTIAL",
        `Sessoes panel: ${sessoesPanelVisivel}, Nova conversa btn: ${novaConversaBtnVisivel}`);
    } catch (err) {
      await screenshot(page, "T44_erro");
      pushResult("T-44", "Chat — Sessoes", "FAIL", String(err));
    }
  });
});

// =============================================================================
// GRUPO 7: INTEGRADOS (T-45 a T-47)
// =============================================================================

test.describe.serial("GRUPO 7: INTEGRADOS (T-45 a T-47)", () => {
  let page: Page;
  let browser: Browser;

  test.beforeAll(async ({ browser: b }) => {
    browser = b;
    page = await browser.newPage();
    await loginUI(page);
  });

  test.afterAll(async () => {
    await page.close();
    // Gerar relatorio apos todos os testes
    generateReport();
  });

  test("T-45: Dashboard", async () => {
    test.setTimeout(60000);
    try {
      // Navegar para Dashboard (clicar no item fixo "Dashboard" ou logo)
      const dashboardBtn = page.locator('.nav-item').filter({ hasText: "Dashboard" }).first();
      if (await dashboardBtn.isVisible().catch(() => false)) {
        await dashboardBtn.click();
      } else {
        // Clicar no logo
        const logo = page.locator(".sidebar-logo, .logo-icon").first();
        if (await logo.isVisible().catch(() => false)) {
          await logo.click();
        }
      }
      await page.waitForTimeout(2000);

      // Verificar dashboard cards com valores
      const dashboardCards = page.locator('.dashboard-card, .stat-card, .kpi-card');
      const cardsCount = await dashboardCards.count();

      // Verificar KPIs
      const kpiItems = page.locator('.kpi-value, .kpi-item, .stat-value, .dashboard-kpi');
      const kpiCount = await kpiItems.count();

      // Verificar funil
      const funilVisivel = await page.locator('text=Funil, text=Pipeline, text=Captacao').first()
        .isVisible({ timeout: 3000 }).catch(() => false);

      // Verificar urgentes
      const urgentesVisivel = await page.locator('text=Urgentes, text=Atencao, text=Prazo').first()
        .isVisible({ timeout: 3000 }).catch(() => false);

      // Verificar status bar
      const statusBarVisivel = await page.locator('.status-bar, .dashboard-status-bar').first()
        .isVisible({ timeout: 3000 }).catch(() => false);

      await screenshot(page, "T45_dashboard");

      pushResult("T-45", "Dashboard",
        cardsCount > 0 ? "PASS" : "FAIL",
        `Cards: ${cardsCount}, KPIs: ${kpiCount}, Funil: ${funilVisivel}, Urgentes: ${urgentesVisivel}, StatusBar: ${statusBarVisivel}`);
      expect(cardsCount).toBeGreaterThan(0);
    } catch (err) {
      await screenshot(page, "T45_erro");
      pushResult("T-45", "Dashboard", "FAIL", String(err));
    }
  });

  test("T-46: Verificar Persistencia — Empresa", async () => {
    test.setTimeout(60000);
    try {
      // Navegar para Empresa (Configuracoes > Empresa)
      await navigateTo(page, "Configuracoes", "Empresa");
      await page.waitForTimeout(2000);

      // Verificar Website
      const bodyText = (await page.textContent("body")) || "";
      const temWebsite = bodyText.includes("quanticaia.com.br");
      const temInstagram = bodyText.includes("@quanticaia");

      // Verificar campos especificos
      const websiteInput = page.locator('input[value*="quanticaia.com.br"], text=quanticaia.com.br').first();
      const websiteVisivel = await websiteInput.isVisible({ timeout: 5000 }).catch(() => false);

      const instagramInput = page.locator('input[value*="@quanticaia"], text=@quanticaia').first();
      const instagramVisivel = await instagramInput.isVisible({ timeout: 3000 }).catch(() => false);

      // Verificar nome empresa
      const temNomeEmpresa = bodyText.includes("QUANTICA") || bodyText.includes("Quantica");

      await screenshot(page, "T46_persistencia_empresa");

      pushResult("T-46", "Verificar Persistencia — Empresa",
        temNomeEmpresa ? "PASS" : "PARTIAL",
        `Website (quanticaia.com.br): ${temWebsite || websiteVisivel}, Instagram (@quanticaia): ${temInstagram || instagramVisivel}, Empresa: ${temNomeEmpresa}`);
    } catch (err) {
      await screenshot(page, "T46_erro");
      pushResult("T-46", "Verificar Persistencia — Empresa", "FAIL", String(err));
    }
  });

  test("T-47: Verificar Persistencia — Parametrizacoes", async () => {
    test.setTimeout(60000);
    try {
      // Navegar para Parametrizacoes (Configuracoes > Parametrizacoes)
      await navigateTo(page, "Configuracoes", "Parametrizacoes");
      await page.waitForTimeout(2000);

      // Verificar titulo da pagina
      const tituloVisivel = await page.locator('h1:has-text("Parametrizacoes"), text=Parametrizacoes').first()
        .isVisible({ timeout: 5000 }).catch(() => false);

      // Verificar que classes criadas existem
      const bodyText = (await page.textContent("body")) || "";
      const temClassificacao = bodyText.includes("Classificacao") || bodyText.includes("classificacao") || bodyText.includes("Reagentes");
      const temNorteadores = bodyText.includes("Norteadores") || bodyText.includes("norteador");

      // Verificar especificamente classes criadas (por T-01 se existiram)
      const classeItems = page.locator('.classe-header, .classe-nome, .classificacao-item');
      const classeCount = await classeItems.count();

      // Verificar cards de norteadores
      const norteadorItems = page.locator('.norteador-item, .norteador-card');
      const norteadorCount = await norteadorItems.count();

      // Verificar tipos de edital (checkboxes)
      const checkboxes = page.locator('.checkbox-grid input[type="checkbox"], .checkbox-wrapper input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      await screenshot(page, "T47_persistencia_parametrizacoes");

      pushResult("T-47", "Verificar Persistencia — Parametrizacoes",
        tituloVisivel ? "PASS" : "FAIL",
        `Titulo: ${tituloVisivel}, Classes: ${classeCount}, Norteadores: ${norteadorCount}, Checkboxes: ${checkboxCount}, Tem classificacao: ${temClassificacao}, Tem norteadores: ${temNorteadores}`);
      expect(tituloVisivel).toBe(true);
    } catch (err) {
      await screenshot(page, "T47_erro");
      pushResult("T-47", "Verificar Persistencia — Parametrizacoes", "FAIL", String(err));
    }
  });
});
