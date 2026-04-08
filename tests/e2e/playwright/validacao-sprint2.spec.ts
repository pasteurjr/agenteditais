import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, waitForIA } from "./helpers";

const SS = (step: string) => `runtime/screenshots/validacao-sprint2/${step}.png`;

test.setTimeout(600000);

// Helper: selecionar opção em select por texto visível
async function selectByLabel(page: any, labelText: string, optionValue: string) {
  // Encontra o label e depois o select mais próximo
  const selects = page.locator('select');
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const sel = selects.nth(i);
    // Verificar se o select tem a opção que procuramos ou se está próximo do label
    const parent = sel.locator('..');
    const parentText = await parent.innerText({ timeout: 1000 }).catch(() => '');
    if (parentText.includes(labelText)) {
      await sel.selectOption(optionValue);
      return true;
    }
  }
  return false;
}

// Helper: buscar editais com termo e aguardar resultados
async function buscarEditais(page: any, termo: string, scoreMode?: string) {
  const termoInput = page.locator('input[placeholder*="Digite ou selecione"]').first();
  await termoInput.fill(termo);

  if (scoreMode) {
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const sel = selects.nth(i);
      const options = await sel.locator('option').allInnerTexts();
      if (options.some((o: string) => o.includes("Sem Score") || o.includes("Score Rapido"))) {
        await sel.selectOption(scoreMode);
        break;
      }
    }
  }

  await page.click('button:has-text("Buscar Editais")');

  // Aguardar resposta ou resultado
  const found = await waitForIA(page, (body: string) => {
    return body.includes("editais encontrados") || body.includes("Nenhum edital") || body.includes("Resultados");
  }, 120000, 5000);

  return found;
}

test.describe.serial("Validacao Sprint 2 — Captacao e Validacao (CH Hospitalar)", () => {

  // ===== UC-CV01 =====
  test("UC-CV01-P01: Navegar para CaptacaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("CV01-P01_acao_navegar"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Captacao") || body.includes("Buscar Editais") || body.includes("Monitoramento")).toBeTruthy();
    await page.screenshot({ path: SS("CV01-P01_resp_pagina"), fullPage: true });
  });

  test("UC-CV01-P02: Busca 1 — monitor multiparametrico (Score Rapido)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    const termoInput = page.locator('input[placeholder*="Digite ou selecione"]').first();
    await termoInput.fill("monitor multiparametrico");
    await page.screenshot({ path: SS("CV01-P02_acao_termo"), fullPage: true });

    // Selecionar Score Rapido no select de score
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const sel = selects.nth(i);
      const options = await sel.locator('option').allInnerTexts();
      if (options.some((o: string) => o.includes("Score Rapido") || o.includes("Sem Score"))) {
        await sel.selectOption("rapido");
        break;
      }
    }
    await page.screenshot({ path: SS("CV01-P02_acao_score"), fullPage: true });

    await page.click('button:has-text("Buscar Editais")');
    await page.screenshot({ path: SS("CV01-P02_acao_buscar"), fullPage: true });

    const found = await waitForIA(page, (body: string) => {
      return body.includes("editais encontrados") || body.includes("Nenhum edital") || body.includes("Resultados");
    }, 120000, 5000);

    await page.screenshot({ path: SS("CV01-P02_resp_resultados"), fullPage: true });
    expect(found).toBeTruthy();
  });

  test("UC-CV01-P03: Busca 2 — ultrassom portatil (Score Hibrido)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    const termoInput = page.locator('input[placeholder*="Digite ou selecione"]').first();
    await termoInput.fill("ultrassom portatil");

    // NCM
    const ncmInput = page.locator('input[placeholder*="9027"]').first();
    if (await ncmInput.count() > 0) await ncmInput.fill("9018.19.90");

    // Score Hibrido
    const selects = page.locator('select');
    const cnt = await selects.count();
    for (let i = 0; i < cnt; i++) {
      const sel = selects.nth(i);
      const opts = await sel.locator('option').allInnerTexts();
      if (opts.some((o: string) => o.includes("Score Rapido"))) {
        await sel.selectOption("hibrido");
        break;
      }
    }

    await page.screenshot({ path: SS("CV01-P03_acao_filtros"), fullPage: true });
    await page.click('button:has-text("Buscar Editais")');
    await waitForIA(page, (b: string) => b.includes("editais encontrados") || b.includes("Nenhum") || b.includes("Resultados"), 120000, 5000);
    await page.screenshot({ path: SS("CV01-P03_resp_resultados"), fullPage: true });
  });

  test("UC-CV01-P04: Busca 3 — equipamento medico (Score Profundo)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    const termoInput = page.locator('input[placeholder*="Digite ou selecione"]').first();
    await termoInput.fill("equipamento medico");

    // Score Profundo
    const selects = page.locator('select');
    const cnt = await selects.count();
    for (let i = 0; i < cnt; i++) {
      const sel = selects.nth(i);
      const opts = await sel.locator('option').allInnerTexts();
      if (opts.some((o: string) => o.includes("Score Profundo"))) {
        await sel.selectOption("profundo");
        break;
      }
    }

    // Marcar encerrados
    const encLabel = page.locator('label:has-text("encerrados")').first();
    if (await encLabel.count() > 0) {
      await encLabel.click();
    }

    await page.screenshot({ path: SS("CV01-P04_acao_filtros"), fullPage: true });
    await page.click('button:has-text("Buscar Editais")');
    await waitForIA(page, (b: string) => b.includes("editais encontrados") || b.includes("Nenhum") || b.includes("Resultados"), 180000, 5000);
    await page.screenshot({ path: SS("CV01-P04_resp_resultados"), fullPage: true });
  });

  test("UC-CV01-P05: Busca 4 — desfibrilador (Sem Score)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    const termoInput = page.locator('input[placeholder*="Digite ou selecione"]').first();
    await termoInput.fill("desfibrilador");

    // Sem Score
    const selects = page.locator('select');
    const cnt = await selects.count();
    for (let i = 0; i < cnt; i++) {
      const sel = selects.nth(i);
      const opts = await sel.locator('option').allInnerTexts();
      if (opts.some((o: string) => o.includes("Sem Score"))) {
        await sel.selectOption("nenhum");
        break;
      }
    }

    await page.screenshot({ path: SS("CV01-P05_acao_filtros"), fullPage: true });
    await page.click('button:has-text("Buscar Editais")');
    await waitForIA(page, (b: string) => b.includes("editais encontrados") || b.includes("Nenhum") || b.includes("Resultados"), 120000, 5000);
    await page.screenshot({ path: SS("CV01-P05_resp_resultados"), fullPage: true });
  });

  // ===== UC-CV02 =====
  test("UC-CV02: Explorar resultados e painel lateral", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    await buscarEditais(page, "monitor multiparametrico", "rapido");
    await page.waitForTimeout(3000);

    // Clicar no primeiro resultado
    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("CV02_acao_selecionar"), fullPage: true });

      const body = await getBody(page);
      const panelVisible = body.includes("Dados do Edital") || body.includes("Salvar Edital") || body.includes("Intencao");
      await page.screenshot({ path: SS("CV02_resp_painel"), fullPage: true });
      expect(panelVisible).toBeTruthy();
    } else {
      await page.screenshot({ path: SS("CV02_resp_sem_resultados"), fullPage: true });
    }
  });

  // ===== UC-CV03 =====
  test("UC-CV03-P01: Salvar edital individual", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    await buscarEditais(page, "monitor multiparametrico", "rapido");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      const salvarBtn = page.locator('button:has-text("Salvar Edital")').first();
      if (await salvarBtn.count() > 0 && await salvarBtn.isEnabled()) {
        await salvarBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: SS("CV03-P01_acao_salvar"), fullPage: true });

        // Fechar dialog de PDF se aparecer
        const dialog = page.locator('button:has-text("Cancelar"), button:has-text("Não")').first();
        if (await dialog.count() > 0) await dialog.click();

        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("CV03-P01_resp_salvo"), fullPage: true });
      } else {
        await page.screenshot({ path: SS("CV03-P01_resp_ja_salvo"), fullPage: true });
      }
    }
  });

  test("UC-CV03-P02: Salvar Todos (desfibrilador)", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    await buscarEditais(page, "desfibrilador", "nenhum");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("CV03-P02_acao_resultados"), fullPage: true });

    const salvarTodos = page.locator('button:has-text("Salvar Todos")').first();
    if (await salvarTodos.count() > 0) {
      await salvarTodos.click();
      await page.waitForTimeout(15000);
      await page.screenshot({ path: SS("CV03-P02_resp_salvos"), fullPage: true });
    }
  });

  // ===== UC-CV04 =====
  test("UC-CV04: Definir estrategia Estrategico 25%", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    await buscarEditais(page, "monitor multiparametrico", "rapido");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      // Radio Estrategico
      const labels = page.locator('label, span');
      const labelsTexts = await labels.allInnerTexts();
      for (let i = 0; i < labelsTexts.length; i++) {
        if (labelsTexts[i].trim() === 'Estrategico' || labelsTexts[i].trim() === 'Estratégico') {
          await labels.nth(i).click();
          break;
        }
      }

      // Margem 25%
      const slider = page.locator('input[type="range"]').first();
      if (await slider.count() > 0) await slider.fill("25");

      await page.screenshot({ path: SS("CV04_acao_estrategia"), fullPage: true });

      // Salvar
      const salvarEstr = page.locator('button:has-text("Salvar Estrategia")').first();
      if (await salvarEstr.count() > 0) {
        await salvarEstr.click();
        await page.waitForTimeout(3000);
      }
      await page.screenshot({ path: SS("CV04_resp_salva"), fullPage: true });
    }
  });

  // ===== UC-CV05 =====
  test("UC-CV05: Exportar CSV", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    await buscarEditais(page, "monitor multiparametrico", "rapido");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("CV05_acao_resultados"), fullPage: true });

    const csvBtn = page.locator('button:has-text("Exportar CSV")').first();
    if (await csvBtn.count() > 0) {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await csvBtn.click();
      const dl = await downloadPromise;
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV05_resp_exportado"), fullPage: true });
    }
  });

  // ===== UC-CV06 =====
  test("UC-CV06: Criar monitoramento", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(2000);

    // Scroll para Monitoramento
    const monSection = page.locator('text=Monitoramento').first();
    if (await monSection.count() > 0) await monSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const novoBtn = page.locator('button:has-text("Novo Monitoramento")').first();
    if (await novoBtn.count() > 0) {
      await novoBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("CV06_acao_form"), fullPage: true });

      // Preencher
      const termoField = page.locator('input[placeholder*="equipamentos laboratoriais"]').first();
      if (await termoField.count() > 0) await termoField.fill("monitor multiparametrico");

      const ncmField = page.locator('input[placeholder*="9018"]').first();
      if (await ncmField.count() > 0) await ncmField.fill("9018.19.90");

      const ufsField = page.locator('input[placeholder*="SP, RJ"]').first();
      if (await ufsField.count() > 0) await ufsField.fill("SP, RJ, MG");

      await page.screenshot({ path: SS("CV06_acao_preenchido"), fullPage: true });

      const criarBtn = page.locator('button:has-text("Criar")').first();
      if (await criarBtn.count() > 0) {
        await criarBtn.click();
        await page.waitForTimeout(3000);
      }
      await page.screenshot({ path: SS("CV06_resp_criado"), fullPage: true });
    }
  });

  // ===== UC-CV07 =====
  test("UC-CV07: Listar editais salvos na ValidacaoPage", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("CV07_acao_navegar"), fullPage: true });

    const body = await getBody(page);
    const temTabela = body.includes("Meus Editais") || body.includes("Numero") || body.includes("Orgao") || body.includes("Validacao");
    await page.screenshot({ path: SS("CV07_resp_lista"), fullPage: true });
    expect(temTabela).toBeTruthy();

    // Selecionar primeiro edital
    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("CV07_resp_selecionado"), fullPage: true });
    }
  });

  // ===== UC-CV08 =====
  test("UC-CV08: Calcular Scores IA e decidir GO", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      await clickTab(page, "Aderencia");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV08_acao_aba"), fullPage: true });

      // Calcular Scores
      const calcBtn = page.locator('button:has-text("Calcular Scores"), button:has-text("Recalcular Scores")').first();
      if (await calcBtn.count() > 0) {
        await calcBtn.click();
        await page.screenshot({ path: SS("CV08_acao_calcular"), fullPage: true });

        await waitForIA(page, (body: string) => {
          return body.includes("Tecni") || body.includes("Documental") || body.includes("Potencial") || body.includes("Score Geral");
        }, 180000, 5000);
        await page.screenshot({ path: SS("CV08_resp_scores"), fullPage: true });
      }

      // Decisão GO
      const goBtn = page.locator('button:has-text("Participar (GO)")').first();
      if (await goBtn.count() > 0) {
        await goBtn.scrollIntoViewIfNeeded();
        await goBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("CV08_acao_go"), fullPage: true });

        // Justificativa
        const motivoSel = page.locator('select').last();
        if (await motivoSel.count() > 0) {
          const opts = await motivoSel.locator('option').allInnerTexts();
          if (opts.length > 1) await motivoSel.selectOption({ index: 1 });
        }

        const detalhes = page.locator('textarea').first();
        if (await detalhes.count() > 0) {
          await detalhes.fill("Produto atende 100% dos requisitos do edital, preco competitivo, empresa tem documentacao completa.");
        }
        await page.screenshot({ path: SS("CV08_acao_justificativa"), fullPage: true });

        const salvarJust = page.locator('button:has-text("Salvar Justificativa")').first();
        if (await salvarJust.count() > 0) {
          await salvarJust.click();
          await page.waitForTimeout(3000);
        }
        await page.screenshot({ path: SS("CV08_resp_decisao"), fullPage: true });
      }
    }
  });

  // ===== UC-CV09 =====
  test("UC-CV09: Importar itens e extrair lotes", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      await clickTab(page, "Lotes");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV09_acao_aba"), fullPage: true });

      // Buscar Itens no PNCP
      const buscarItens = page.locator('button:has-text("Buscar Itens")').first();
      if (await buscarItens.count() > 0) {
        await buscarItens.click();
        await waitForIA(page, (b: string) => b.includes("Descri") || b.includes("Qtd") || b.includes("Vlr") || b.includes("item"), 60000, 3000);
        await page.screenshot({ path: SS("CV09_resp_itens"), fullPage: true });
      }

      // Extrair Lotes
      const extrairBtn = page.locator('button:has-text("Extrair Lotes"), button:has-text("Reprocessar")').first();
      if (await extrairBtn.count() > 0) {
        await extrairBtn.click();
        await waitForIA(page, (b: string) => b.includes("Lote") || b.includes("lote"), 120000, 5000);
        await page.screenshot({ path: SS("CV09_resp_lotes"), fullPage: true });
      }
    }
  });

  // ===== UC-CV10 =====
  test("UC-CV10: Confrontar documentacao", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      await clickTab(page, "Documentos");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV10_acao_aba"), fullPage: true });

      const identBtn = page.locator('button:has-text("Identificar Documentos"), button:has-text("Reidentificar")').first();
      if (await identBtn.count() > 0) {
        await identBtn.click();
        await waitForIA(page, (b: string) => b.includes("Disponivel") || b.includes("Disponível") || b.includes("Faltante") || b.includes("Completude"), 120000, 5000);
        await page.screenshot({ path: SS("CV10_resp_docs"), fullPage: true });
      }
    }
  });

  // ===== UC-CV11 =====
  test("UC-CV11: Analisar riscos, atas e concorrentes", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      await clickTab(page, "Riscos");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV11_acao_aba"), fullPage: true });

      // Analisar Riscos
      const riscosBtn = page.locator('button:has-text("Analisar Riscos"), button:has-text("Reanalisar")').first();
      if (await riscosBtn.count() > 0) {
        await riscosBtn.click();
        await waitForIA(page, (b: string) => b.includes("Risco") || b.includes("Juridico") || b.includes("Jurídico") || b.includes("Fatal"), 180000, 5000);
        await page.screenshot({ path: SS("CV11_resp_riscos"), fullPage: true });
      }

      // Rebuscar Atas
      const atasBtn = page.locator('button:has-text("Rebuscar Atas")').first();
      if (await atasBtn.count() > 0) {
        await atasBtn.click();
        await waitForIA(page, (b: string) => b.includes("ata") || b.includes("Ata") || b.includes("encontrada"), 60000, 3000);
        await page.screenshot({ path: SS("CV11_resp_atas"), fullPage: true });
      }

      // Buscar Vencedores
      const vencBtn = page.locator('button:has-text("Buscar Vencedores")').first();
      if (await vencBtn.count() > 0) {
        await vencBtn.click();
        await waitForIA(page, (b: string) => b.includes("Vencedor") || b.includes("Homol"), 60000, 3000);
        await page.screenshot({ path: SS("CV11_resp_vencedores"), fullPage: true });
      }

      // Concorrentes
      const concBtn = page.locator('button:has-text("Atualizar")').last();
      if (await concBtn.count() > 0) {
        await concBtn.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: SS("CV11_resp_concorrentes"), fullPage: true });
      }
    }
  });

  // ===== UC-CV12 =====
  test("UC-CV12: Analisar mercado do orgao", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      await clickTab(page, "Mercado");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV12_acao_aba"), fullPage: true });

      const mercBtn = page.locator('button:has-text("Analisar Mercado"), button:has-text("Reanalisar")').first();
      if (await mercBtn.count() > 0) {
        await mercBtn.click();
        await waitForIA(page, (b: string) => b.includes("Orgao") || b.includes("Órgão") || b.includes("Reputacao") || b.includes("Volume"), 180000, 5000);
        await page.screenshot({ path: SS("CV12_resp_mercado"), fullPage: true });
      }
    }
  });

  // ===== UC-CV13 =====
  test("UC-CV13: IA resumo e perguntas", async ({ page }) => {
    await login(page);
    await navTo(page, "Validacao");
    await page.waitForTimeout(3000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(3000);

      await clickTab(page, "IA");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("CV13_acao_aba"), fullPage: true });

      // Gerar Resumo
      const resumoBtn = page.locator('button:has-text("Gerar Resumo"), button:has-text("Regerar")').first();
      if (await resumoBtn.count() > 0) {
        await resumoBtn.click();
        await waitForIA(page, (b: string) => b.length > 3000, 120000, 5000);
        await page.screenshot({ path: SS("CV13_resp_resumo"), fullPage: true });
      }

      // Perguntar
      const perguntaInput = page.locator('input[placeholder*="prazo"], input[placeholder*="Qual"]').first();
      if (await perguntaInput.count() > 0) {
        await perguntaInput.fill("Qual o prazo de entrega exigido?");
        await page.screenshot({ path: SS("CV13_acao_pergunta"), fullPage: true });

        const pergBtn = page.locator('button:has-text("Perguntar")').first();
        if (await pergBtn.count() > 0) {
          await pergBtn.click();
          await waitForIA(page, (b: string) => b.includes("Resposta") || b.includes("prazo") || b.includes("dias"), 60000, 3000);
          await page.screenshot({ path: SS("CV13_resp_resposta"), fullPage: true });
        }
      }

      // Requisitos Tecnicos
      const reqBtn = page.locator('button:has-text("Requisitos")').first();
      if (await reqBtn.count() > 0) {
        await reqBtn.click();
        await waitForIA(page, (b: string) => b.includes("requisito") || b.includes("Requisito") || b.includes("técnic"), 60000, 3000);
        await page.screenshot({ path: SS("CV13_resp_requisitos"), fullPage: true });
      }

      // Classificar Edital
      const classBtn = page.locator('button:has-text("Classificar Edital")').first();
      if (await classBtn.count() > 0) {
        await classBtn.click();
        await waitForIA(page, (b: string) => b.includes("Classifica") || b.includes("Venda") || b.includes("Comodato") || b.includes("Consumo"), 60000, 3000);
        await page.screenshot({ path: SS("CV13_resp_classificacao"), fullPage: true });
      }
    }
  });

});
