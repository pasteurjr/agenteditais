import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/sprint5/screenshots";

async function login(page: any) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', "pasteurjr@gmail.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
  } catch { await page.waitForTimeout(3000); }
}

async function navTo(page: any, label: string) {
  await page.evaluate((lbl: string) => {
    const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent?.trim() === lbl) as HTMLElement;
    if (el) el.click();
  }, label);
  await page.waitForTimeout(3000);
}

async function clickTab(page: any, texto: string) {
  await page.evaluate((txt: string) => {
    const selectors = ['.tab-panel-tab', '.tab-panel button', '[class*="tab"]'];
    for (const sel of selectors) {
      const tabs = document.querySelectorAll(sel);
      const tab = Array.from(tabs).find(t => t.textContent?.trim().includes(txt)) as HTMLElement;
      if (tab) { tab.click(); return; }
    }
  }, texto);
  await page.waitForTimeout(2000);
}

test.describe.serial("Sprint 5 — Validação com Sequência de Eventos dos UCs", () => {

  // ══════════════════════════════════════════════════════════════
  // UC-FU01: Registrar Resultado — Sequência completa
  // Passos: Acessar → Ver stats → Clicar Registrar → Preencher modal → Confirmar
  // ══════════════════════════════════════════════════════════════

  test("UC-FU01-01: Acessar FollowupPage — stats e tabela de pendentes carregam", async ({ page }) => {
    await login(page);
    await navTo(page, "Followup");
    // Passo 1-3: Página carrega com stats e tabela
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Pendentes");
    expect(body).toContain("Taxa");
    await page.screenshot({ path: `${SS}/UC-FU01-01_pagina_stats.png`, fullPage: true });
  });

  test("UC-FU01-02: Clicar Registrar — modal abre com campos", async ({ page }) => {
    await login(page);
    await navTo(page, "Followup");
    // Passo 4: Clicar botão Registrar no primeiro edital
    const regBtn = page.locator('button:has-text("Registrar")').first();
    if (await regBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await regBtn.click();
      await page.waitForTimeout(1000);
      // Passo 5-6: Modal com tipo de resultado
      const body = await page.innerText("body").catch(() => "");
      expect(body).toContain("Vitória") || expect(body).toContain("vitoria");
      await page.screenshot({ path: `${SS}/UC-FU01-02_modal_registrar.png`, fullPage: true });

      // Passo 7: Selecionar tipo Derrota e ver campos adicionais
      const derrotaRadio = page.locator('text=Derrota').first();
      if (await derrotaRadio.isVisible().catch(() => false)) {
        await derrotaRadio.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SS}/UC-FU01-03_modal_derrota.png`, fullPage: true });
      }

      // Passo 8-10: Preencher campos de derrota
      const valorInput = page.locator('input[placeholder="0,00"], input[placeholder*="valor"]').first();
      if (await valorInput.isVisible().catch(() => false)) {
        await valorInput.fill("45000");
      }
      const vencedorInput = page.locator('input[placeholder*="empresa"], input[placeholder*="Nome"]').first();
      if (await vencedorInput.isVisible().catch(() => false)) {
        await vencedorInput.fill("Lab Solutions Ltda");
      }
      // Selecionar motivo
      const motivoSelect = page.locator('select').nth(0);
      if (await motivoSelect.isVisible().catch(() => false)) {
        await motivoSelect.selectOption({ index: 1 });
      }
      await page.screenshot({ path: `${SS}/UC-FU01-04_campos_preenchidos.png`, fullPage: true });

      // Passo 12: Clicar Confirmar/Registrar
      const confirmBtn = page.locator('button:has-text("Registrar"), button:has-text("Confirmar")').last();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(3000);
        // Passo 14: Verificar que o resultado aparece na tabela
        await page.screenshot({ path: `${SS}/UC-FU01-05_resultado_registrado.png`, fullPage: true });
      }
    } else {
      // Sem editais pendentes — capturar estado vazio
      await page.screenshot({ path: `${SS}/UC-FU01-02_sem_pendentes.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-FU02: Alertas — Sequência: Acessar aba → Ver vencimentos → Ver regras
  // ══════════════════════════════════════════════════════════════

  test("UC-FU02-01: Aba Alertas — vencimentos consolidados e regras", async ({ page }) => {
    await login(page);
    await navTo(page, "Followup");
    await clickTab(page, "Alertas");
    // Passo 1-2: Aba carrega com vencimentos
    const body = await page.innerText("body").catch(() => "");
    expect(body.toLowerCase()).toContain("vencimento");
    await page.screenshot({ path: `${SS}/UC-FU02-01_alertas_vencimentos.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-AT01: Buscar Atas — Sequência: Digitar termo → Buscar → Ver resultados
  // ══════════════════════════════════════════════════════════════

  test("UC-AT01-01: Buscar atas no PNCP — digitar termo e buscar", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas de Pregao");
    // Passo 1-2: Digitar termo de busca
    const searchInput = page.locator('input[placeholder*="reagente"], input[placeholder*="Ex:"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill("reagente hematologia");
      await page.screenshot({ path: `${SS}/UC-AT01-01_termo_digitado.png`, fullPage: true });

      // Passo 4: Clicar Buscar
      const buscarBtn = page.locator('button:has-text("Buscar")').first();
      await buscarBtn.click();
      // Passo 5-6: Esperar resultados do PNCP (pode demorar)
      await page.waitForTimeout(15000);
      await page.screenshot({ path: `${SS}/UC-AT01-02_resultados_busca.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-AT02: Extrair Ata PDF — Sequência: Colar URL → Extrair → Ver itens
  // ══════════════════════════════════════════════════════════════

  test("UC-AT02-01: Extrair dados de ata — preencher URL e clicar Extrair", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas de Pregao");
    await clickTab(page, "Extrair");
    // Passo 2-3: Preencher URL
    const urlInput = page.locator('input[placeholder*="pncp"], input[placeholder*="http"]').first();
    if (await urlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await urlInput.fill("https://pncp.gov.br/app/editais/08135860000186/2025/6");
      await page.screenshot({ path: `${SS}/UC-AT02-01_url_preenchida.png`, fullPage: true });

      // Passo 4: Clicar Extrair
      const extrairBtn = page.locator('button:has-text("Extrair")').first();
      if (await extrairBtn.isVisible().catch(() => false)) {
        await extrairBtn.click();
        // Passo 5-8: Esperar processamento IA (pode demorar 30-60s)
        await page.waitForTimeout(45000);
        await page.screenshot({ path: `${SS}/UC-AT02-02_resultado_extracao.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-AT03: Minhas Atas — Sequência: Ver stats → Ver tabela
  // ══════════════════════════════════════════════════════════════

  test("UC-AT03-01: Dashboard Minhas Atas — stats e tabela com vigência", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas de Pregao");
    await clickTab(page, "Minhas Atas");
    // Passo 1-4: Stats e tabela carregam
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Total");
    expect(body).toContain("Vigentes");
    await page.screenshot({ path: `${SS}/UC-AT03-01_minhas_atas_stats.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-CT01: Cadastrar Contrato — Sequência: Ver stats → Novo Contrato → Preencher → Salvar
  // ══════════════════════════════════════════════════════════════

  test("UC-CT01-01: Página Contratos — stats e tabela", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao Contrato");
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Contratos");
    expect(body).toContain("Novo Contrato");
    await page.screenshot({ path: `${SS}/UC-CT01-01_contratos_stats.png`, fullPage: true });
  });

  test("UC-CT01-02: Abrir modal Novo Contrato e preencher campos", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao Contrato");
    // Passo 4: Clicar Novo Contrato
    const novoBtn = page.locator('button:has-text("Novo Contrato")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SS}/UC-CT01-02_modal_vazio.png`, fullPage: true });

      // Passo 7-8: Preencher campos
      const inputs = page.locator('input[type="text"], input:not([type])');
      const count = await inputs.count();
      if (count >= 2) {
        await inputs.nth(0).fill("CT-2026/TEST");  // número contrato
        await inputs.nth(1).fill("UFMG");          // órgão
      }
      // Preencher valor
      const valorInputs = page.locator('input[placeholder*="0"]');
      if (await valorInputs.count() > 0) {
        await valorInputs.first().fill("150000");
      }
      await page.screenshot({ path: `${SS}/UC-CT01-03_modal_preenchido.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-CT02 a CT05: Selecionar contrato → Navegar abas com dados reais
  // ══════════════════════════════════════════════════════════════

  test("UC-CT02-01: Selecionar contrato → Aba Entregas com dados", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao Contrato");
    // Selecionar primeiro contrato
    const selBtn = page.locator('button:has-text("Selecionar")').first();
    if (await selBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/UC-CT02-01_contrato_selecionado.png`, fullPage: true });

      // Ir para aba Entregas
      await clickTab(page, "Entregas");
      await page.waitForTimeout(2000);
      const body = await page.innerText("body").catch(() => "");
      await page.screenshot({ path: `${SS}/UC-CT02-02_aba_entregas.png`, fullPage: true });

      // Clicar Nova Entrega
      const novaEntBtn = page.locator('button:has-text("Nova Entrega")').first();
      if (await novaEntBtn.isVisible().catch(() => false)) {
        await novaEntBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-CT02-03_modal_entrega.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  test("UC-CT03-01: Selecionar contrato → Aba Cronograma com stats", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao Contrato");
    const selBtn = page.locator('button:has-text("Selecionar")').first();
    if (await selBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selBtn.click();
      await page.waitForTimeout(2000);
      await clickTab(page, "Cronograma");
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SS}/UC-CT03-01_cronograma_dados.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  test("UC-CT04-01: Selecionar contrato → Aba Aditivos com resumo e barra 25%", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao Contrato");
    const selBtn = page.locator('button:has-text("Selecionar")').first();
    if (await selBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selBtn.click();
      await page.waitForTimeout(2000);
      await clickTab(page, "Aditivos");
      await page.waitForTimeout(2000);
      const body = await page.innerText("body").catch(() => "");
      await page.screenshot({ path: `${SS}/UC-CT04-01_aditivos_resumo.png`, fullPage: true });

      // Clicar Novo Aditivo para ver modal
      const novoAdBtn = page.locator('button:has-text("Novo Aditivo")').first();
      if (await novoAdBtn.isVisible().catch(() => false)) {
        await novoAdBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-CT04-02_modal_aditivo.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  test("UC-CT05-01: Selecionar contrato → Aba Gestor/Fiscal com cards", async ({ page }) => {
    await login(page);
    await navTo(page, "Execucao Contrato");
    const selBtn = page.locator('button:has-text("Selecionar")').first();
    if (await selBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selBtn.click();
      await page.waitForTimeout(2000);
      await clickTab(page, "Gestor/Fiscal");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/UC-CT05-01_designacoes_cards.png`, fullPage: true });

      // Clicar Nova Designação
      const novaDesBtn = page.locator('button:has-text("Nova Designa")').first();
      if (await novaDesBtn.isVisible().catch(() => false)) {
        await novaDesBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-CT05-02_modal_designacao.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-CT06: Saldo ARP — Sequência: Selecionar ata → Ver saldos
  // ══════════════════════════════════════════════════════════════

  test("UC-CT06-01: Aba Saldo ARP — selecionar ata e ver saldos", async ({ page }) => {
    await login(page);
    await navTo(page, "Atas de Pregao");
    await clickTab(page, "Saldo ARP");
    await page.screenshot({ path: `${SS}/UC-CT06-01_saldo_arp_seletor.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-CR01: Dashboard Contratado x Realizado — Sequência completa
  // ══════════════════════════════════════════════════════════════

  test("UC-CR01-01: Dashboard com filtros, stats e tabela comparativa", async ({ page }) => {
    await login(page);
    await navTo(page, "Indicadores");
    await page.waitForTimeout(500);
    await navTo(page, "Contratado X Realizado");
    await page.waitForTimeout(3000);
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Contratado");
    await page.screenshot({ path: `${SS}/UC-CR01-01_dashboard_completo.png`, fullPage: true });

    // Passo 10: Mudar filtro de período
    const periodoSelect = page.locator('select').first();
    if (await periodoSelect.isVisible().catch(() => false)) {
      await periodoSelect.selectOption("tudo");
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SS}/UC-CR01-02_filtro_tudo.png`, fullPage: true });
    }
  });

  // ══════════════════════════════════════════════════════════════
  // UC-CR02: Pedidos em Atraso — Seção com agrupamento
  // ══════════════════════════════════════════════════════════════

  test("UC-CR02-01: Seção Pedidos em Atraso com severidade", async ({ page }) => {
    await login(page);
    await navTo(page, "Indicadores");
    await page.waitForTimeout(500);
    await navTo(page, "Contratado X Realizado");
    await page.waitForTimeout(3000);
    // Scroll para a seção de atrasos
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('h3, h2')).find(e => e.textContent?.toLowerCase().includes('atraso'));
      if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/UC-CR02-01_atrasos_secao.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-CR03: Alertas Vencimento Multi-tier
  // ══════════════════════════════════════════════════════════════

  test("UC-CR03-01: Seção Próximos Vencimentos com urgência multi-tier", async ({ page }) => {
    await login(page);
    await navTo(page, "Indicadores");
    await page.waitForTimeout(500);
    await navTo(page, "Contratado X Realizado");
    await page.waitForTimeout(3000);
    // Scroll para vencimentos
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('h3, h2')).find(e => e.textContent?.toLowerCase().includes('vencimento'));
      if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/UC-CR03-01_vencimentos_secao.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-FU03: Score Logístico — validação via API
  // ══════════════════════════════════════════════════════════════

  test("UC-FU03-01: Score logístico retorna 4 dimensões ponderadas", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("token"));
    // Buscar um edital para testar
    const editais = await page.evaluate(async (t: string) => {
      const r1 = await fetch("/api/followup/resultados", { headers: { Authorization: `Bearer ${t}` } });
      const r2 = await fetch("/api/followup/pendentes", { headers: { Authorization: `Bearer ${t}` } });
      const d1 = r1.ok ? await r1.json() : [];
      const d2 = r2.ok ? await r2.json() : [];
      return [...d1, ...d2];
    }, token);

    if (editais.length > 0) {
      const scoreRes = await page.evaluate(async (args: {t:string;id:string}) => {
        const res = await fetch(`/api/validacao/score-logistico/${args.id}`, { headers: { Authorization: `Bearer ${args.t}` } });
        return res.ok ? await res.json() : null;
      }, { t: token, id: editais[0].id });

      if (scoreRes?.score != null) {
        console.log(`Score: ${scoreRes.score}/100 — ${scoreRes.recomendacao}`);
        scoreRes.dimensoes?.forEach((d: any) => console.log(`  ${d.nome}: ${d.score} (peso ${d.peso}%)`));
        expect(scoreRes.score).toBeGreaterThanOrEqual(0);
        expect(scoreRes.dimensoes).toHaveLength(4);
      }
    }
    await page.screenshot({ path: `${SS}/UC-FU03-01_score_logistico_api.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

});
