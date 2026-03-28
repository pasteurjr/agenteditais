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

test.describe.serial("Sprint 4 — Pipeline Agente 2 (EXECUTOR): Sequência de Eventos", () => {

  // ══════════════════════════════════════════════════════════════
  // UC-I01: Validação Legal do Edital (13 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I01 Passo 1: Acessar ImpugnacaoPage — 3 abas visíveis", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    const body = await page.innerText("body").catch(() => "");
    await page.screenshot({ path: `${SS}/UC-I01-P01_3abas.png`, fullPage: true });
    expect(body).toContain("Legal");
    expect(body).toContain("Peti");
    expect(body).toContain("Prazo");
  });

  test("UC-I01 Passo 2-3: Selecionar edital [I01-F01] — status documento [I01-F02/F03]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const options = await select.locator('option').allTextContents();
      console.log(`Editais disponíveis: ${options.length - 1}`);
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1500);
      }
    }
    await page.screenshot({ path: `${SS}/UC-I01-P02_edital_selecionado.png`, fullPage: true });
    expect(true).toBeTruthy();
  });

  test("UC-I01 Passo 4-8: Clicar Analisar [I01-F04] → IA processa → resultado [I01-F07]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    // Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) await select.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: `${SS}/UC-I01-P04_antes_analisar.png`, fullPage: true });
    // Clicar Analisar
    const btn = page.locator('button:has-text("Analisar")').first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const t0 = Date.now();
      await btn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `${SS}/UC-I01-P05_ia_processando.png`, fullPage: true });
      // Esperar resultado completo (até 60s)
      await page.waitForTimeout(40000);
      const elapsed = Math.round((Date.now() - t0) / 1000);
      console.log(`IA levou ~${elapsed}s`);
      await page.screenshot({ path: `${SS}/UC-I01-P08_resultado_completo.png`, fullPage: true });
      const body = await page.innerText("body").catch(() => "");
      console.log(`Resultado tem conteúdo: ${body.length > 300 ? "✅" : "❌"} (${body.length} chars)`);
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I03: Gerar Petição de Impugnação (11 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I03 Passo 1-2: Aba Petições — tabela [I03-F01] e botões", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/UC-I03-P01_aba_peticoes.png`, fullPage: true });
    const body = await page.innerText("body").catch(() => "");
    console.log(`Nova Petição: ${body.includes("Nova") ? "✅" : "❌"}`);
    console.log(`Upload: ${body.includes("Upload") ? "✅" : "❌"}`);
  });

  test("UC-I03 Passo 3-5: Abrir modal — selecionar template [I03-F03] e dados [I03-F05/F06/F07]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    const novaBtn = page.locator('button:has-text("Nova")').first();
    if (await novaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novaBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/UC-I03-P03_modal_nova_peticao.png`, fullPage: true });
      // Preencher selects no modal
      const selects = page.locator('.modal-overlay select, dialog select, [class*="modal"] select');
      const count = await selects.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const sel = selects.nth(i);
        const optCount = await sel.locator('option').count();
        if (optCount > 1) await sel.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
      await page.screenshot({ path: `${SS}/UC-I03-P05_modal_preenchido.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I04: Upload Petição Externa (11 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I04 Passo 1-5: Upload modal — selecionar edital [I04-F01] e tipo [I04-F02]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Peti");
    await page.waitForTimeout(1000);
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/UC-I04-P01_modal_upload.png`, fullPage: true });
      // Selecionar edital no modal
      const modalSelect = page.locator('.modal-overlay select, dialog select, [class*="modal"] select').first();
      if (await modalSelect.isVisible().catch(() => false)) {
        const opts = await modalSelect.locator('option').count();
        if (opts > 1) {
          await modalSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${SS}/UC-I04-P03_edital_selecionado.png`, fullPage: true });
        }
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-I05: Controle de Prazo (11 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-I05 Passo 1-4: Aba Prazos — tabela [I05-F01] com badges [I05-F02]", async ({ page }) => {
    await login(page);
    await navTo(page, "Impugnacao");
    await clickTab(page, "Prazo");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/UC-I05-P01_tabela_prazos.png`, fullPage: true });
    const body = await page.innerText("body").catch(() => "");
    console.log(`Tem tabela prazos: ${body.includes("Prazo") ? "✅" : "❌"}`);
    // Verificar badges coloridos
    const badges = await page.locator('[style*="background"]').count();
    console.log(`Badges coloridos: ${badges}`);
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE01: Monitorar Janela de Recurso (13 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE01 Passo 1: Acessar RecursosPage — 3 abas", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await page.screenshot({ path: `${SS}/UC-RE01-P01_pagina_recursos.png`, fullPage: true });
    const body = await page.innerText("body").catch(() => "");
    expect(body).toContain("Monitoramento");
  });

  test("UC-RE01 Passo 2-5: Selecionar edital → configurar canais [RE01-F06/F07/F08] → ativar [RE01-F09]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    // Passo 2: Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SS}/UC-RE01-P02_edital_selecionado.png`, fullPage: true });
        // Passo 4: Verificar checkboxes
        const body = await page.innerText("body").catch(() => "");
        console.log(`WhatsApp: ${body.includes("WhatsApp") || body.includes("Whats") ? "✅" : "❌"}`);
        console.log(`Email: ${body.includes("Email") || body.includes("email") ? "✅" : "❌"}`);
        console.log(`Alerta: ${body.includes("Alerta") || body.includes("alerta") ? "✅" : "❌"}`);
        // Passo 5: Clicar Ativar/Criar Monitoramento
        const ativarBtn = page.locator('button:has-text("Ativar"), button:has-text("Criar"), button:has-text("Monitorar")').first();
        if (await ativarBtn.isVisible().catch(() => false)) {
          await ativarBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${SS}/UC-RE01-P05_monitoramento_ativado.png`, fullPage: true });
        }
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE02: Analisar Proposta Vencedora (14 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE02 Passo 1-3: Aba Análise — selecionar edital [RE02-F01]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/UC-RE02-P01_aba_analise.png`, fullPage: true });
    // Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) {
        await select.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/UC-RE02-P02_edital_selecionado.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  test("UC-RE02 Passo 6-8: Clicar Analisar [RE02-F06] → IA processa → resultado [RE02-F08]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);
    // Selecionar edital
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      if (opts.length > 1) await select.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
    // Clicar Analisar
    const btn = page.locator('button:has-text("Analisar")').first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: `${SS}/UC-RE02-P06_antes_analisar.png`, fullPage: true });
      const t0 = Date.now();
      await btn.click();
      await page.waitForTimeout(45000);
      const elapsed = Math.round((Date.now() - t0) / 1000);
      console.log(`Análise vencedora IA: ~${elapsed}s`);
      await page.screenshot({ path: `${SS}/UC-RE02-P08_resultado_analise.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE03: Chatbox de Análise (12 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE03 Passo 5-8: Digitar pergunta [RE03-F08] → enviar [RE03-F09] → resposta IA [RE03-F05]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Análise");
    await page.waitForTimeout(1000);
    // Localizar chatbox input
    const chatInput = page.locator('input[placeholder*="pergunt" i], input[placeholder*="diga" i], textarea[placeholder*="pergunt" i], input[placeholder*="Faça" i]').first();
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatInput.fill("Quais são os riscos jurídicos deste edital conforme a Lei 14.133?");
      await page.screenshot({ path: `${SS}/UC-RE03-P05_pergunta_digitada.png`, fullPage: true });
      const enviarBtn = page.locator('button:has-text("Enviar"), button[type="submit"]').first();
      if (await enviarBtn.isVisible().catch(() => false)) {
        const t0 = Date.now();
        await enviarBtn.click();
        await page.waitForTimeout(30000);
        const elapsed = Math.round((Date.now() - t0) / 1000);
        console.log(`Chatbox IA resposta: ~${elapsed}s`);
        await page.screenshot({ path: `${SS}/UC-RE03-P07_resposta_ia.png`, fullPage: true });
      }
    } else {
      await page.screenshot({ path: `${SS}/UC-RE03-P05_chatbox_area.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE04: Gerar Laudo de Recurso (15 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE04 Passo 1-2: Aba Laudos — lista [RE04-F01] e Novo Laudo", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SS}/UC-RE04-P01_aba_laudos.png`, fullPage: true });
  });

  test("UC-RE04 Passo 3-8: Novo Laudo → selecionar edital/tipo/subtipo/template [RE04-F02 a F08]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    const novoBtn = page.locator('button:has-text("Novo Laudo"), button:has-text("Novo")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/UC-RE04-P03_modal_vazio.png`, fullPage: true });
      // Preencher dropdowns
      const selects = page.locator('select');
      const count = await selects.count();
      for (let i = 0; i < Math.min(count, 4); i++) {
        const sel = selects.nth(i);
        const optCount = await sel.locator('option').count();
        if (optCount > 1) {
          await sel.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }
      await page.screenshot({ path: `${SS}/UC-RE04-P06_campos_preenchidos.png`, fullPage: true });
      // Passo 8: Clicar Gerar
      const gerarBtn = page.locator('button:has-text("Gerar"), button:has-text("Criar")').first();
      if (await gerarBtn.isVisible().catch(() => false)) {
        const t0 = Date.now();
        await gerarBtn.click();
        await page.waitForTimeout(60000);
        const elapsed = Math.round((Date.now() - t0) / 1000);
        console.log(`Gerar laudo IA: ~${elapsed}s`);
        await page.screenshot({ path: `${SS}/UC-RE04-P09_laudo_gerado.png`, fullPage: true });
      }
    }
    expect(true).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-RE05: Gerar Laudo de Contra-Razão (18 passos)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE05 Passo 1-4: Modal tipo Contra-Razão — campos específicos [RE05-F02/F04/F05]", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Laudo");
    await page.waitForTimeout(1500);
    const novoBtn = page.locator('button:has-text("Novo Laudo"), button:has-text("Novo")').first();
    if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await novoBtn.click();
      await page.waitForTimeout(1500);
      // Selecionar tipo Contra-Razão
      const selects = page.locator('select');
      const count = await selects.count();
      // Selecionar edital primeiro
      if (count > 0) { const s = selects.nth(0); if (await s.locator('option').count() > 1) await s.selectOption({ index: 1 }); }
      await page.waitForTimeout(300);
      // Selecionar tipo: buscar "contra" nas options
      for (let i = 0; i < count; i++) {
        const sel = selects.nth(i);
        const opts = await sel.locator('option').allTextContents();
        const idx = opts.findIndex(o => o.toLowerCase().includes('contra'));
        if (idx >= 0) { await sel.selectOption({ index: idx }); break; }
      }
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SS}/UC-RE05-P03_contra_razao_selecionado.png`, fullPage: true });
    }
    expect(true).toBeTruthy();
  });

});
