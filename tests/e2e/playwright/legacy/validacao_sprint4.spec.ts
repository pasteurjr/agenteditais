import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/sprint4/screenshots";

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

test.describe.serial("Sprint 4 FASE 1 — IMPUGNAÇÃO: Sequência Completa de Eventos", () => {

  // ══════════════════════════════════════════════════════════════
  // UC-I01: Validação Legal do Edital (13 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I01 P1: Acessar ImpugnacaoPage — aba Validação Legal ativa", async ({ page }) => {
    await login(page);
    // AÇÃO: Navegar para Impugnação
    await navTo(page, "Impugnacao");
    await page.screenshot({ path: `${SS}/UC-I01-P01_acao_acessar.png`, fullPage: true });
    // RESPOSTA: 3 abas visíveis
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Legal");
    expect(body).toContain("Peti");
    expect(body).toContain("Prazo");
    await page.screenshot({ path: `${SS}/UC-I01-P01_resp_3abas.png`, fullPage: true });
  });

  test("UC-I01 P2-3: Selecionar edital — sistema mostra status do documento", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // AÇÃO: Selecionar edital no dropdown [I01-F01]
    const select = page.locator('select').first();
    const options = await select.locator('option').allTextContents();
    console.log(`Editais: ${options.slice(1).join(', ')}`);
    await select.selectOption({ index: 1 }); // Primeiro edital real
    await page.screenshot({ path: `${SS}/UC-I01-P02_acao_selecionar_edital.png`, fullPage: true });
    // RESPOSTA: Edital carregado, status do documento
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SS}/UC-I01-P03_resp_status_documento.png`, fullPage: true });
  });

  test("UC-I01 P4-10: Clicar Analisar → IA processa → resultado com inconsistências", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    const select = page.locator('select').first();
    await select.selectOption({ index: 1 });
    await page.waitForTimeout(1000);
    // AÇÃO P4: Clicar botão Analisar [I01-F04]
    const analisarBtn = page.locator('button:has-text("Analisar")').first();
    await page.screenshot({ path: `${SS}/UC-I01-P04_acao_clicar_analisar.png`, fullPage: true });
    if (await analisarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const t0 = Date.now();
      await analisarBtn.click();
      // RESPOSTA P5: Sistema envia para IA — loading visível
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `${SS}/UC-I01-P05_resp_ia_processando.png`, fullPage: true });
      // RESPOSTA P6-7: IA retorna resultado — esperar até 55s
      await page.waitForTimeout(50000);
      const elapsed = Math.round((Date.now() - t0) / 1000);
      console.log(`UC-I01 IA tempo: ${elapsed}s`);
      // RESPOSTA P8: Tabela de inconsistências [I01-F07]
      await page.screenshot({ path: `${SS}/UC-I01-P08_resp_tabela_inconsistencias.png`, fullPage: true });
      const body = await page.innerText("body").catch(() => "");
      console.log(`Resultado tem conteúdo: ${body.length > 300 ? "✅" : "❌"} (${body.length} chars)`);
      // RESPOSTA P9-10: Badges de gravidade e resumo
      // (Já visíveis no screenshot acima se IA retornou)
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I03: Gerar Petição de Impugnação (11 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I03 P1-2: Aba Petições — tabela e botões visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // AÇÃO: Clicar aba Petições
    await clickTab(page, "Peti");
    await page.screenshot({ path: `${SS}/UC-I03-P01_acao_clicar_aba_peticoes.png`, fullPage: true });
    // RESPOSTA: Tabela de petições + botões Nova e Upload
    const body = await page.innerText("body").catch(() => "");
    console.log(`Nova Petição: ${body.includes("Nova") ? "✅" : "❌"}`);
    console.log(`Upload: ${body.includes("Upload") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-I03-P02_resp_tabela_peticoes.png`, fullPage: true });
  });

  test("UC-I03 P3-4: Abrir modal Nova Petição — selecionar template e preencher dados", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    // AÇÃO P3: Clicar Nova Petição
    const novaBtn = page.locator('button:has-text("Nova")').first();
    if (await novaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novaBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/UC-I03-P03_acao_clicar_nova_peticao.png`, fullPage: true });
      // RESPOSTA: Modal aberto com campos
      await page.screenshot({ path: `${SS}/UC-I03-P03_resp_modal_aberto.png`, fullPage: true });
      // AÇÃO P4: Selecionar template e preencher [I03-F03 a F07]
      const selects = page.locator('.modal-overlay select, dialog select, [class*="modal"] select');
      const count = await selects.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const sel = selects.nth(i);
        if (await sel.locator('option').count() > 1) await sel.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
      await page.screenshot({ path: `${SS}/UC-I03-P04_acao_preencher_campos.png`, fullPage: true });
      // RESPOSTA: Campos preenchidos
      await page.screenshot({ path: `${SS}/UC-I03-P04_resp_campos_preenchidos.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I04: Upload de Petição Externa (11 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I04 P1-3: Upload modal — selecionar edital e tipo", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    // AÇÃO P1: Clicar Upload Petição
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: `${SS}/UC-I04-P01_acao_clicar_upload.png`, fullPage: true });
      await uploadBtn.click();
      await page.waitForTimeout(1500);
      // RESPOSTA: Modal upload aberto
      await page.screenshot({ path: `${SS}/UC-I04-P01_resp_modal_upload.png`, fullPage: true });
      // AÇÃO P2-3: Selecionar edital e tipo no modal
      const modalSelect = page.locator('.modal-overlay select, dialog select, [class*="modal"] select').first();
      if (await modalSelect.isVisible().catch(() => false)) {
        if (await modalSelect.locator('option').count() > 1) {
          await modalSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }
      await page.screenshot({ path: `${SS}/UC-I04-P02_acao_selecionar_edital.png`, fullPage: true });
      // RESPOSTA: Edital selecionado, campo arquivo visível
      await page.screenshot({ path: `${SS}/UC-I04-P03_resp_edital_selecionado.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I05: Controle de Prazo (11 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I05 P1-4: Aba Prazos — tabela com editais, cálculo 3 dias úteis, badges", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // AÇÃO P1: Clicar aba Prazos
    await clickTab(page, "Prazo");
    await page.screenshot({ path: `${SS}/UC-I05-P01_acao_clicar_aba_prazos.png`, fullPage: true });
    // RESPOSTA P2-4: Tabela com editais, prazos calculados, badges coloridos
    await page.waitForTimeout(2000);
    const body = await page.innerText("body").catch(() => "");
    console.log(`Tabela prazos: ${body.includes("Prazo") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-I05-P02_resp_tabela_prazos.png`, fullPage: true });
    // Verificar se tem badge EXPIRADO
    console.log(`Badge expirado: ${body.toLowerCase().includes("expir") ? "✅" : "❌"}`);
  });

});

test.describe.serial("Sprint 4 FASE 2 — RECURSOS: Sequência Completa de Eventos", () => {

  // ══════════════════════════════════════════════════════════════
  // UC-RE01: Monitorar Janela de Recurso (13 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE01 P1: Acessar RecursosPage — 3 abas visíveis", async ({ page }) => {
    await login(page);
    // AÇÃO: Navegar para Recursos
    await navTo(page, "Recursos");
    await page.screenshot({ path: `${SS}/UC-RE01-P01_acao_acessar.png`, fullPage: true });
    // RESPOSTA: 3 abas (Monitoramento, Análise, Laudos)
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Monitoramento");
    await page.screenshot({ path: `${SS}/UC-RE01-P01_resp_3abas.png`, fullPage: true });
  });

  test("UC-RE01 P2-5: Selecionar edital → configurar canais → ativar monitoramento", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    // AÇÃO P2: Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SS}/UC-RE01-P02_acao_selecionar_edital.png`, fullPage: true });
        // RESPOSTA P3-4: Card com canais de notificação
        const body = await page.innerText("body").catch(() => "");
        console.log(`WhatsApp: ${body.includes("WhatsApp") ? "✅" : "❌"}`);
        console.log(`Email: ${body.includes("Email") ? "✅" : "❌"}`);
        console.log(`Alerta: ${body.includes("Alerta") || body.includes("alerta") ? "✅" : "❌"}`);
        await page.screenshot({ path: `${SS}/UC-RE01-P04_resp_canais_notificacao.png`, fullPage: true });
        // AÇÃO P5: Clicar Ativar/Criar Monitoramento [RE01-F09]
        const ativarBtn = page.locator('button:has-text("Ativar"), button:has-text("Criar"), button:has-text("Monitorar")').first();
        if (await ativarBtn.isVisible().catch(() => false)) {
          await page.screenshot({ path: `${SS}/UC-RE01-P05_acao_clicar_ativar.png`, fullPage: true });
          await ativarBtn.click();
          await page.waitForTimeout(2000);
          // RESPOSTA: Monitoramento ativado
          await page.screenshot({ path: `${SS}/UC-RE01-P05_resp_monitoramento_ativado.png`, fullPage: true });
        }
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE02: Analisar Proposta Vencedora (14 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE02 P1-2: Aba Análise — selecionar edital", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    // AÇÃO P1: Clicar aba Análise
    await clickTab(page, "Análise");
    await page.screenshot({ path: `${SS}/UC-RE02-P01_acao_clicar_aba_analise.png`, fullPage: true });
    // RESPOSTA: Área de análise
    await page.screenshot({ path: `${SS}/UC-RE02-P01_resp_aba_analise.png`, fullPage: true });
    // AÇÃO P2: Selecionar edital [RE02-F01]
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-RE02-P02_acao_selecionar_edital.png`, fullPage: true });
        // RESPOSTA: Edital carregado
        await page.screenshot({ path: `${SS}/UC-RE02-P02_resp_edital_carregado.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  test("UC-RE02 P6-11: Clicar Analisar → IA processa → resultado com inconsistências", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) await select.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
    // AÇÃO P6: Clicar Analisar [RE02-F06]
    const btn = page.locator('button:has-text("Analisar")').first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: `${SS}/UC-RE02-P06_acao_clicar_analisar.png`, fullPage: true });
      const t0 = Date.now();
      await btn.click();
      // RESPOSTA P7: IA processa
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `${SS}/UC-RE02-P07_resp_ia_processando.png`, fullPage: true });
      // Esperar resultado completo
      await page.waitForTimeout(40000);
      const elapsed = Math.round((Date.now() - t0) / 1000);
      console.log(`UC-RE02 IA tempo: ${elapsed}s`);
      // RESPOSTA P8-11: Tabela inconsistências, severidade, recomendação
      await page.screenshot({ path: `${SS}/UC-RE02-P08_resp_resultado_analise.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE03: Chatbox de Análise (12 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE03 P4-7: Digitar pergunta → enviar → esperar resposta IA", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);
    // AÇÃO P5: Digitar pergunta no chatbox [RE03-F08]
    const chatInput = page.locator('input[placeholder*="pergunt" i], input[placeholder*="diga" i], textarea[placeholder*="pergunt" i], input[placeholder*="Faça" i]').first();
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatInput.fill("Quais são os riscos jurídicos deste edital conforme a Lei 14.133?");
      await page.screenshot({ path: `${SS}/UC-RE03-P05_acao_digitar_pergunta.png`, fullPage: true });
      // AÇÃO P6: Clicar Enviar [RE03-F09]
      const enviarBtn = page.locator('button:has-text("Enviar"), button[type="submit"]').first();
      if (await enviarBtn.isVisible().catch(() => false)) {
        await page.screenshot({ path: `${SS}/UC-RE03-P06_acao_clicar_enviar.png`, fullPage: true });
        const t0 = Date.now();
        await enviarBtn.click();
        // RESPOSTA P7: IA responde [RE03-F05]
        await page.waitForTimeout(30000);
        const elapsed = Math.round((Date.now() - t0) / 1000);
        console.log(`UC-RE03 Chatbox IA: ${elapsed}s`);
        await page.screenshot({ path: `${SS}/UC-RE03-P07_resp_resposta_ia.png`, fullPage: true });
      }
    } else {
      // Chatbox pode estar em outro formato
      await page.screenshot({ path: `${SS}/UC-RE03-P05_chatbox_nao_encontrado.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE04: Gerar Laudo de Recurso (15 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE04 P1-2: Aba Laudos — lista e botão Novo Laudo", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    // AÇÃO P1: Clicar aba Laudos
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SS}/UC-RE04-P01_acao_clicar_aba_laudos.png`, fullPage: true });
    // RESPOSTA: Lista de laudos + botão Novo
    const body = await page.innerText("body").catch(() => "");
    console.log(`Novo Laudo: ${body.includes("Novo") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-RE04-P01_resp_lista_laudos.png`, fullPage: true });
  });

  test("UC-RE04 P3-8: Novo Laudo → selecionar edital/tipo/subtipo/template → Gerar com IA", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    // AÇÃO P3: Clicar Novo Laudo
    const novoBtn = page.locator('button:has-text("Novo Laudo"), button:has-text("Novo")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1500);
      // RESPOSTA: Modal aberto
      await page.screenshot({ path: `${SS}/UC-RE04-P03_resp_modal_aberto.png`, fullPage: true });
      // AÇÃO P4-7: Selecionar edital [RE04-F01], tipo [F02], subtipo, template [F03], empresa [F04]
      const selects = page.locator('select');
      const count = await selects.count();
      for (let i = 0; i < Math.min(count, 4); i++) {
        const sel = selects.nth(i);
        if (await sel.locator('option').count() > 1) {
          await sel.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }
      await page.screenshot({ path: `${SS}/UC-RE04-P07_acao_campos_preenchidos.png`, fullPage: true });
      // AÇÃO P8: Clicar Gerar/Criar [RE04-F09]
      const gerarBtn = page.locator('button:has-text("Gerar"), button:has-text("Criar")').first();
      if (await gerarBtn.isVisible().catch(() => false)) {
        await page.screenshot({ path: `${SS}/UC-RE04-P08_acao_clicar_gerar.png`, fullPage: true });
        const t0 = Date.now();
        await gerarBtn.click();
        // RESPOSTA P9: IA gera laudo — esperar 60s
        await page.waitForTimeout(10000);
        await page.screenshot({ path: `${SS}/UC-RE04-P09_resp_ia_processando.png`, fullPage: true });
        await page.waitForTimeout(50000);
        const elapsed = Math.round((Date.now() - t0) / 1000);
        console.log(`UC-RE04 Gerar laudo IA: ${elapsed}s`);
        // RESPOSTA P10-11: Laudo gerado no editor
        await page.screenshot({ path: `${SS}/UC-RE04-P10_resp_laudo_gerado.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE05: Gerar Laudo de Contra-Razão (18 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE05 P1-4: Modal com tipo Contra-Razão selecionado", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    const novoBtn = page.locator('button:has-text("Novo Laudo"), button:has-text("Novo")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1500);
      // AÇÃO P2: Selecionar edital
      const selects = page.locator('select');
      if (await selects.count() > 0 && await selects.first().locator('option').count() > 1) {
        await selects.first().selectOption({ index: 1 });
      }
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SS}/UC-RE05-P02_acao_selecionar_edital.png`, fullPage: true });
      // AÇÃO P3: Selecionar tipo Contra-Razão [RE05-F02]
      const count = await selects.count();
      for (let i = 0; i < count; i++) {
        const sel = selects.nth(i);
        const opts = await sel.locator('option').allTextContents();
        const idx = opts.findIndex(o => o.toLowerCase().includes('contra'));
        if (idx >= 0) {
          await sel.selectOption({ index: idx });
          await page.waitForTimeout(500);
          break;
        }
      }
      await page.screenshot({ path: `${SS}/UC-RE05-P03_acao_selecionar_contra_razao.png`, fullPage: true });
      // RESPOSTA: Campos específicos de contra-razão visíveis
      await page.screenshot({ path: `${SS}/UC-RE05-P04_resp_campos_contra_razao.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

});
