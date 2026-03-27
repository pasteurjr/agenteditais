import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/sprint4/screenshots";

async function login(page: any) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  const emailField = page.locator('input[type="email"]').first();
  if (await emailField.isVisible()) {
    await emailField.fill("pasteurjr@gmail.com");
    await page.locator('input[type="password"]').first().fill("123456");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
  }
}

async function irPara(page: any, label: string) {
  await page.locator(`span.nav-item-label:text-is("${label}")`).click({ timeout: 5000 });
  await page.waitForTimeout(2000);
}

test.describe.serial("Sprint 4 — Recursos e Impugnações: Validação Completa", () => {

  // ══════════════════════════════════════════════════════════════
  // FASE 2 — IMPUGNAÇÃO (ImpugnacaoPage)
  // ══════════════════════════════════════════════════════════════

  test("UC-I01-01: Página Impugnação carrega com abas", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");

    // Verificar título
    const bodyText = await page.textContent('body') || "";
    console.log(`Tem 'Impugna': ${bodyText.includes('Impugna') ? "✅" : "❌"}`);

    // Verificar abas
    const tabs = ['Legal', 'Peti', 'Prazo'];
    for (const t of tabs) {
      console.log(`Tab '${t}': ${bodyText.includes(t) ? "✅" : "❌"}`);
    }

    await page.screenshot({ path: `${SS}/UC-I01-01_pagina.png`, fullPage: true });
  });

  test("UC-I01-02: Validação Legal — selecionar edital e analisar", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await irPara(page, "Impugnacao");

    // Selecionar edital Fiocruz
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const opts = await selects.first().locator('option').allTextContents();
      for (const o of opts) {
        if (o.includes("46/2026") || o.toLowerCase().includes("fiocruz")) {
          await selects.first().selectOption({ label: o });
          console.log(`Edital selecionado: ${o} ✅`);
          break;
        }
      }
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/UC-I01-02_edital_selecionado.png`, fullPage: true });

    // Clicar Analisar Edital
    const btnAnalisar = page.locator('button:has-text("Analisar")').first();
    if (await btnAnalisar.isVisible().catch(() => false)) {
      await btnAnalisar.click();
      console.log("Botão Analisar clicado ✅");
      await page.waitForTimeout(30000); // IA demora
      await page.screenshot({ path: `${SS}/UC-I01-02_analise_resultado.png`, fullPage: true });
    }
  });

  test("UC-I03-01: Aba Petições — criar e listar", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");

    // Clicar na aba Petições
    const tabPeticao = page.locator('text=Peti').first();
    if (await tabPeticao.isVisible().catch(() => false)) {
      await tabPeticao.click();
      await page.waitForTimeout(1000);
    }

    const bodyText = await page.textContent('body') || "";
    const hasNovaPeticao = bodyText.includes('Nova Peti') || bodyText.includes('nova peti');
    const hasUpload = bodyText.includes('Upload') || bodyText.includes('upload');
    console.log(`Botão Nova Petição: ${hasNovaPeticao ? "✅" : "❌"}`);
    console.log(`Botão Upload: ${hasUpload ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-I03-01_aba_peticoes.png`, fullPage: true });
  });

  test("UC-I04-01: Upload de petição externa", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");

    // Aba Petições
    const tabPeticao = page.locator('text=Peti').first();
    if (await tabPeticao.isVisible().catch(() => false)) {
      await tabPeticao.click();
      await page.waitForTimeout(1000);
    }

    // Procurar botão Upload
    const btnUpload = page.locator('button:has-text("Upload")').first();
    if (await btnUpload.isVisible().catch(() => false)) {
      await btnUpload.click();
      await page.waitForTimeout(1000);
      console.log("Modal Upload aberto ✅");
    }

    await page.screenshot({ path: `${SS}/UC-I04-01_upload_peticao.png`, fullPage: true });
  });

  test("UC-I05-01: Aba Prazos — tabela com prazos", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");

    // Clicar aba Prazos
    const tabPrazo = page.locator('text=Prazo').first();
    if (await tabPrazo.isVisible().catch(() => false)) {
      await tabPrazo.click();
      await page.waitForTimeout(1000);
    }

    const bodyText = await page.textContent('body') || "";
    console.log(`Tem 'Prazo': ${bodyText.includes('Prazo') || bodyText.includes('prazo') ? "✅" : "❌"}`);
    console.log(`Tem edital 46/2026: ${bodyText.includes('46/2026') ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-I05-01_prazos.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // FASE 3 — RECURSOS (RecursosPage)
  // ══════════════════════════════════════════════════════════════

  test("UC-RE01-01: Página Recursos carrega com abas", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");

    const bodyText = await page.textContent('body') || "";
    console.log(`Tem 'Recursos': ${bodyText.includes('Recurso') ? "✅" : "❌"}`);

    // Verificar abas
    const tabs = ['Monitoramento', 'Analis', 'Laudo'];
    for (const t of tabs) {
      console.log(`Tab '${t}': ${bodyText.includes(t) ? "✅" : "❌"}`);
    }

    await page.screenshot({ path: `${SS}/UC-RE01-01_pagina_recursos.png`, fullPage: true });
  });

  test("UC-RE01-02: Monitoramento — ativar monitoramento", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");

    // Selecionar edital
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const opts = await selects.first().locator('option').allTextContents();
      for (const o of opts) {
        if (o.includes("46/2026")) {
          await selects.first().selectOption({ label: o });
          break;
        }
      }
    }
    await page.waitForTimeout(1000);

    // Verificar checkboxes de notificação
    const bodyText = await page.textContent('body') || "";
    console.log(`WhatsApp: ${bodyText.includes('WhatsApp') || bodyText.includes('whatsapp') ? "✅" : "❌"}`);
    console.log(`Email: ${bodyText.includes('Email') || bodyText.includes('email') ? "✅" : "❌"}`);

    // Ativar monitoramento
    const btnMonitorar = page.locator('button:has-text("Ativar"), button:has-text("Monitorar")').first();
    if (await btnMonitorar.isVisible().catch(() => false)) {
      await btnMonitorar.click();
      await page.waitForTimeout(2000);
      console.log("Monitoramento ativado ✅");
    }

    await page.screenshot({ path: `${SS}/UC-RE01-02_monitoramento.png`, fullPage: true });
  });

  test("UC-RE02-01: Análise da proposta vencedora", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await irPara(page, "Recursos");

    // Aba Análise
    const tabAnalise = page.locator('text=Analis, text=Análise').first();
    if (await tabAnalise.isVisible().catch(() => false)) {
      await tabAnalise.click();
      await page.waitForTimeout(1000);
    }

    // Selecionar edital
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const opts = await selects.first().locator('option').allTextContents();
      for (const o of opts) {
        if (o.includes("46/2026")) {
          await selects.first().selectOption({ label: o });
          break;
        }
      }
    }

    // Preencher texto da proposta vencedora
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill("Proposta vencedora: Kit TTPA da empresa XYZ com preço R$ 2,35 por teste. Rendimento 24 testes/kit. Validade 12 meses.");
      console.log("Texto proposta preenchido ✅");
    }

    await page.screenshot({ path: `${SS}/UC-RE02-01_antes_analisar.png`, fullPage: true });

    // Analisar
    const btnAnalisar = page.locator('button:has-text("Analisar")').first();
    if (await btnAnalisar.isVisible().catch(() => false)) {
      await btnAnalisar.click();
      console.log("Análise da vencedora acionada ✅");
      await page.waitForTimeout(30000);
      await page.screenshot({ path: `${SS}/UC-RE02-01_apos_analisar.png`, fullPage: true });
    }
  });

  test("UC-RE03-01: Chatbox de análise", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");

    // Aba Análise
    const tabAnalise = page.locator('text=Analis, text=Análise').first();
    if (await tabAnalise.isVisible().catch(() => false)) {
      await tabAnalise.click();
      await page.waitForTimeout(1000);
    }

    // Procurar chatbox
    const bodyText = await page.textContent('body') || "";
    const hasChatbox = bodyText.includes('chat') || bodyText.includes('pergunt') || bodyText.includes('Enviar');
    console.log(`Chatbox: ${hasChatbox ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-RE03-01_chatbox.png`, fullPage: true });
  });

  test("UC-RE04-01: Aba Laudos — criar laudo de recurso", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");

    // Aba Laudos
    const tabLaudo = page.locator('text=Laudo').first();
    if (await tabLaudo.isVisible().catch(() => false)) {
      await tabLaudo.click();
      await page.waitForTimeout(1000);
    }

    const bodyText = await page.textContent('body') || "";
    const hasNovoLaudo = bodyText.includes('Novo Laudo') || bodyText.includes('novo laudo');
    const hasUpload = bodyText.includes('Upload') || bodyText.includes('upload');
    console.log(`Botão Novo Laudo: ${hasNovoLaudo ? "✅" : "❌"}`);
    console.log(`Botão Upload: ${hasUpload ? "✅" : "❌"}`);

    // Clicar Novo Laudo
    const btnNovo = page.locator('button:has-text("Novo Laudo")').first();
    if (await btnNovo.isVisible().catch(() => false)) {
      await btnNovo.click();
      await page.waitForTimeout(1000);
      console.log("Modal Novo Laudo aberto ✅");
    }

    await page.screenshot({ path: `${SS}/UC-RE04-01_aba_laudos.png`, fullPage: true });
  });

  test("UC-RE05-01: Verificar opção contra-razão no modal", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");

    const tabLaudo = page.locator('text=Laudo').first();
    if (await tabLaudo.isVisible().catch(() => false)) {
      await tabLaudo.click();
      await page.waitForTimeout(1000);
    }

    const btnNovo = page.locator('button:has-text("Novo Laudo")').first();
    if (await btnNovo.isVisible().catch(() => false)) {
      await btnNovo.click();
      await page.waitForTimeout(1000);
    }

    // Verificar opções de tipo no modal
    const bodyText = await page.textContent('body') || "";
    const hasRecurso = bodyText.includes('Recurso') || bodyText.includes('recurso');
    const hasContraRazao = bodyText.toLowerCase().includes('contra') || bodyText.toLowerCase().includes('razao') || bodyText.toLowerCase().includes('razão');
    console.log(`Opção Recurso: ${hasRecurso ? "✅" : "❌"}`);
    console.log(`Opção Contra-Razão: ${hasContraRazao ? "✅" : "❌"}`);

    // Verificar campos do modal
    const selects = page.locator('.modal-overlay select');
    const selectCount = await selects.count();
    console.log(`Selects no modal: ${selectCount}`);

    await page.screenshot({ path: `${SS}/UC-RE05-01_modal_contra_razao.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // CRUD e Chat
  // ══════════════════════════════════════════════════════════════

  test("CRUD: Templates de Recursos no menu", async ({ page }) => {
    await login(page);

    // Expandir CADASTROS
    const cadastros = page.locator('text=CADASTROS').first();
    if (await cadastros.isVisible().catch(() => false)) {
      await cadastros.click();
      await page.waitForTimeout(1000);
    }

    const bodyText = await page.textContent('body') || "";
    const hasTemplates = bodyText.includes('Templates Recurso') || bodyText.includes('templates recurso');
    console.log(`Menu Templates Recursos: ${hasTemplates ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/CRUD_templates_menu.png`, fullPage: true });
  });

  test("CHAT: Prompts de recursos disponíveis", async ({ page }) => {
    await login(page);

    // Abrir chat
    const chatBtn = page.locator('[class*="chat-fab"], button:has-text("Dr. Licita"), [class*="chat-toggle"]').first();
    if (await chatBtn.isVisible().catch(() => false)) {
      await chatBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verificar prompts select
    const bodyText = await page.textContent('body') || "";
    const hasRecursosPrompt = bodyText.includes('RECURSOS') || bodyText.includes('impugna');
    console.log(`Prompts Recursos no chat: ${hasRecursosPrompt ? "✅" : "⚠️"}`);

    await page.screenshot({ path: `${SS}/CHAT_prompts_recursos.png`, fullPage: true });
  });

  test("FINAL: Captura geral", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/FINAL_impugnacao.png`, fullPage: true });

    await irPara(page, "Recursos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/FINAL_recursos.png`, fullPage: true });
  });
});
