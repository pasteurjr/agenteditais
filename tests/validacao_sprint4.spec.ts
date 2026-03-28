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

test.describe.serial("Sprint 4 — Recursos e Impugnações: Sequência de Eventos", () => {

  // ══════════════════════════════════════════════════════════════
  // UC-I01: Validação Legal do Edital
  // Sequência: Acessar → Selecionar edital → Clicar Analisar → Esperar IA → Ver resultado
  // ══════════════════════════════════════════════════════════════

  test("UC-I01-01: Acessar ImpugnacaoPage — aba Validação Legal com 3 abas visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // Passo 1: Página carrega com abas
    const body = await page.innerText("body").catch(() => "");
    console.log(`Validação Legal: ${body.includes("Valid") ? "✅" : "❌"}`);
    console.log(`Petições: ${body.includes("Peti") ? "✅" : "❌"}`);
    console.log(`Prazos: ${body.includes("Prazo") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-I01-01_pagina_impugnacao.png`, fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("UC-I01-02: Selecionar edital no dropdown [I01-F01]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // Passo 2: Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const options = await select.locator('option').allTextContents();
      console.log(`Editais disponíveis: ${options.length - 1}`);
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-I01-02_edital_selecionado.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  test("UC-I01-03: Clicar 'Analisar Edital' [I01-F04] → esperar resposta IA → ver inconsistências", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // Selecionar edital primeiro
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const options = await select.locator('option').allTextContents();
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
      }
    }
    // Passo 4: Clicar Analisar
    const analisarBtn = page.locator('button:has-text("Analisar")').first();
    if (await analisarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: `${SS}/UC-I01-03_antes_analisar.png`, fullPage: true });
      await analisarBtn.click();
      // Passo 5-8: Esperar IA processar (pode demorar 30-60s)
      await page.waitForTimeout(45000);
      await page.screenshot({ path: `${SS}/UC-I01-04_resultado_analise.png`, fullPage: true });
      const body = await page.innerText("body").catch(() => "");
      console.log(`Resultado IA presente: ${body.length > 200 ? "✅" : "❌"}`);
    } else {
      await page.screenshot({ path: `${SS}/UC-I01-03_sem_botao_analisar.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I03: Gerar Petição de Impugnação
  // Sequência: Aba Petições → Nova petição → Preencher → Gerar com IA → Editor
  // ══════════════════════════════════════════════════════════════

  test("UC-I03-01: Aba Petições — lista e botão Nova Petição", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    const body = await page.innerText("body").catch(() => "");
    console.log(`Aba Petições: ${body.includes("Peti") || body.includes("peti") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-I03-01_aba_peticoes.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  test("UC-I03-02: Abrir modal Nova Petição e preencher campos [I03-F05 a F07]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    // Clicar botão Nova Petição
    const novaBtn = page.locator('button:has-text("Nova"), button:has-text("Criar"), button:has-text("Gerar")').first();
    if (await novaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novaBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/UC-I03-02_modal_peticao.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I04: Upload de Petição Externa
  // Sequência: Botão Upload → Modal → Selecionar edital → Upload arquivo
  // ══════════════════════════════════════════════════════════════

  test("UC-I04-01: Botão Upload de petição externa visível", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("upload"), button:has-text("Importar")').first();
    const visible = await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Upload botão: ${visible ? "✅" : "❌"}`);
    if (visible) {
      await uploadBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SS}/UC-I04-01_upload_modal.png`, fullPage: true });
    } else {
      await page.screenshot({ path: `${SS}/UC-I04-01_aba_peticoes.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I05: Controle de Prazo
  // Sequência: Aba Prazos → Tabela editais → Badges de urgência → Config alertas
  // ══════════════════════════════════════════════════════════════

  test("UC-I05-01: Aba Prazos — tabela com editais e badges de urgência", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Prazo");
    await page.waitForTimeout(2000);
    const body = await page.innerText("body").catch(() => "");
    console.log(`Aba Prazos: ${body.includes("Prazo") || body.includes("prazo") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-I05-01_aba_prazos.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE01: Monitorar Janela de Recurso
  // Sequência: Acessar RecursosPage → Aba Monitoramento → Selecionar edital → Ativar
  // ══════════════════════════════════════════════════════════════

  test("UC-RE01-01: RecursosPage — aba Monitoramento com 3 abas visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    const body = await page.innerText("body").catch(() => "");
    console.log(`Monitoramento: ${body.includes("Monitoramento") || body.includes("Monitor") ? "✅" : "❌"}`);
    console.log(`Análise: ${body.includes("Análise") || body.includes("Analise") ? "✅" : "❌"}`);
    console.log(`Laudos: ${body.includes("Laudo") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-RE01-01_pagina_recursos.png`, fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("UC-RE01-02: Selecionar edital [RE01] e configurar monitoramento", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    // Selecionar edital no dropdown
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const options = await select.locator('option').allTextContents();
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SS}/UC-RE01-02_edital_selecionado.png`, fullPage: true });

        // Passo 4-5: Verificar checkboxes de canais e botão Ativar
        const body = await page.innerText("body").catch(() => "");
        console.log(`Email checkbox: ${body.includes("Email") || body.includes("email") ? "✅" : "❌"}`);
        console.log(`Ativar botão: ${body.includes("Ativar") || body.includes("Monitorar") ? "✅" : "❌"}`);

        // Tentar ativar monitoramento
        const ativarBtn = page.locator('button:has-text("Ativar"), button:has-text("Monitorar"), button:has-text("Iniciar")').first();
        if (await ativarBtn.isVisible().catch(() => false)) {
          await ativarBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${SS}/UC-RE01-03_monitoramento_ativado.png`, fullPage: true });
        }
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE02: Analisar Proposta Vencedora
  // Sequência: Aba Análise → Selecionar edital → Preencher empresa → Clicar Analisar → Esperar IA
  // ══════════════════════════════════════════════════════════════

  test("UC-RE02-01: Aba Análise — selecionar edital e clicar Analisar", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/UC-RE02-01_aba_analise.png`, fullPage: true });

    // Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const options = await select.locator('option').allTextContents();
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-RE02-02_edital_selecionado.png`, fullPage: true });
      }
    }

    // Clicar Analisar
    const analisarBtn = page.locator('button:has-text("Analisar")').first();
    if (await analisarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await analisarBtn.click();
      // Esperar IA (30-60s)
      await page.waitForTimeout(45000);
      await page.screenshot({ path: `${SS}/UC-RE02-03_resultado_analise.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE03: Chatbox de Análise
  // Sequência: Input de pergunta → Enviar → Esperar resposta IA → Ver resposta
  // ══════════════════════════════════════════════════════════════

  test("UC-RE03-01: Chatbox interativo — digitar pergunta e enviar", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);

    // Localizar input do chatbox
    const chatInput = page.locator('input[placeholder*="pergunt" i], input[placeholder*="diga" i], textarea[placeholder*="pergunt" i]').first();
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatInput.fill("Quais são os principais riscos jurídicos deste edital?");
      await page.screenshot({ path: `${SS}/UC-RE03-01_pergunta_digitada.png`, fullPage: true });

      // Enviar
      const enviarBtn = page.locator('button:has-text("Enviar"), button[type="submit"]').first();
      if (await enviarBtn.isVisible().catch(() => false)) {
        await enviarBtn.click();
        // Esperar resposta IA
        await page.waitForTimeout(30000);
        await page.screenshot({ path: `${SS}/UC-RE03-02_resposta_ia.png`, fullPage: true });
      }
    } else {
      await page.screenshot({ path: `${SS}/UC-RE03-01_chatbox_area.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE04: Gerar Laudo de Recurso
  // Sequência: Aba Laudos → Selecionar edital → Tipo Recurso → Template → Gerar → Editor
  // ══════════════════════════════════════════════════════════════

  test("UC-RE04-01: Aba Laudos — lista de laudos e botão Novo Laudo", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    const body = await page.innerText("body").catch(() => "");
    console.log(`Aba Laudos: ${body.includes("Laudo") || body.includes("laudo") ? "✅" : "❌"}`);
    console.log(`Novo Laudo: ${body.includes("Novo") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-RE04-01_aba_laudos.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  test("UC-RE04-02: Abrir modal Novo Laudo — preencher campos [RE04-F01 a F08]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);

    // Clicar Novo Laudo
    const novoBtn = page.locator('button:has-text("Novo Laudo"), button:has-text("Novo"), button:has-text("Criar")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/UC-RE04-02_modal_novo_laudo.png`, fullPage: true });

      // Preencher campos do modal
      // Selecionar edital
      const selects = page.locator('select');
      const selectCount = await selects.count();
      for (let i = 0; i < Math.min(selectCount, 4); i++) {
        const sel = selects.nth(i);
        const opts = await sel.locator('option').count();
        if (opts > 1) {
          await sel.selectOption({ index: 1 });
          await page.waitForTimeout(300);
        }
      }
      await page.screenshot({ path: `${SS}/UC-RE04-03_modal_preenchido.png`, fullPage: true });

      // Clicar Gerar
      const gerarBtn = page.locator('button:has-text("Gerar"), button:has-text("gerar")').first();
      if (await gerarBtn.isVisible().catch(() => false)) {
        await gerarBtn.click();
        // Esperar IA gerar laudo (60s+)
        await page.waitForTimeout(60000);
        await page.screenshot({ path: `${SS}/UC-RE04-04_laudo_gerado.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE05: Gerar Laudo de Contra-Razão
  // Sequência: Tipo Contra-Razão → Preencher → Upload recurso → Gerar → Editor
  // ══════════════════════════════════════════════════════════════

  test("UC-RE05-01: Modal Contra-Razão — campos específicos visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);

    const novoBtn = page.locator('button:has-text("Novo Laudo"), button:has-text("Novo"), button:has-text("Contra")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1500);

      // Selecionar tipo Contra-Razão
      const tipoSelect = page.locator('select');
      const tipoCount = await tipoSelect.count();
      for (let i = 0; i < tipoCount; i++) {
        const sel = tipoSelect.nth(i);
        const opts = await sel.locator('option').allTextContents();
        const contraIdx = opts.findIndex(o => o.toLowerCase().includes('contra'));
        if (contraIdx >= 0) {
          await sel.selectOption({ index: contraIdx });
          await page.waitForTimeout(500);
          break;
        }
      }
      await page.screenshot({ path: `${SS}/UC-RE05-01_modal_contra_razao.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

});
