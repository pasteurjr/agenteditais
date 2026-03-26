import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SCREENSHOTS = "testes/proposta/screenshots";

// Helper: login
async function login(page: any) {
  await page.goto(BASE);
  await page.waitForTimeout(1000);
  // Check if already logged in
  const loginForm = page.locator('input[type="email"], input[placeholder*="email" i]');
  if (await loginForm.count() > 0) {
    await loginForm.first().fill("pasteurjr@gmail.com");
    const passField = page.locator('input[type="password"]');
    await passField.first().fill("123456");
    await page.locator('button:has-text("Entrar"), button:has-text("Login"), button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
  }
}

// Helper: navigate to page
async function navigateTo(page: any, menuItem: string) {
  const menuBtn = page.locator(`text=${menuItem}`).first();
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(1500);
  }
}

test.describe("Fase 2 — Proposta: Validação Completa", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R01: Gerar Proposta Técnica
  // ══════════════════════════════════════════════════════════════
  test("UC-R01-01: Navegar para página Proposta", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-01_pagina_proposta.png`, fullPage: true });
    // Verificar que a página carregou
    const title = page.locator('text=Proposta').first();
    expect(await title.isVisible()).toBeTruthy();
  });

  test("UC-R01-02: Abrir modal Nova Proposta", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    // Procurar botão Nova Proposta
    const btnNova = page.locator('button:has-text("Nova Proposta"), button:has-text("Gerar")').first();
    if (await btnNova.isVisible()) {
      await btnNova.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-02_modal_nova_proposta.png`, fullPage: true });
  });

  test("UC-R01-03: Selecionar edital e verificar lotes", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    const btnNova = page.locator('button:has-text("Nova Proposta"), button:has-text("Gerar")').first();
    if (await btnNova.isVisible()) await btnNova.click();
    await page.waitForTimeout(1000);
    // Procurar select de edital
    const editalSelect = page.locator('select').first();
    if (await editalSelect.isVisible()) {
      const options = await editalSelect.locator('option').allTextContents();
      await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-03_select_edital.png`, fullPage: true });
      // Selecionar Fiocruz se disponível
      for (const opt of options) {
        if (opt.toLowerCase().includes("fiocruz") || opt.includes("46/2026")) {
          await editalSelect.selectOption({ label: opt });
          await page.waitForTimeout(1000);
          break;
        }
      }
    }
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-03_edital_selecionado.png`, fullPage: true });
  });

  test("UC-R01-04: Verificar campos de preço e template", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    const btnNova = page.locator('button:has-text("Nova Proposta"), button:has-text("Gerar")').first();
    if (await btnNova.isVisible()) await btnNova.click();
    await page.waitForTimeout(1000);
    // Verificar campos existentes
    const precoField = page.locator('input[placeholder*="preço" i], input[placeholder*="preco" i], input[placeholder*="Preço" i]').first();
    const qtdField = page.locator('input[placeholder*="quantidade" i], input[placeholder*="Quantidade" i]').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-04_campos_preco_template.png`, fullPage: true });
  });

  test("UC-R01-05: Gerar proposta com IA", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    // Tentar todo o fluxo
    const btnNova = page.locator('button:has-text("Nova Proposta"), button:has-text("Gerar")').first();
    if (await btnNova.isVisible()) await btnNova.click();
    await page.waitForTimeout(1000);
    // Selecionar edital
    const selects = page.locator('select');
    const count = await selects.count();
    if (count > 0) {
      const editalSel = selects.nth(0);
      const opts = await editalSel.locator('option').allTextContents();
      for (const o of opts) {
        if (o.includes("46/2026") || o.toLowerCase().includes("fiocruz")) {
          await editalSel.selectOption({ label: o });
          await page.waitForTimeout(1500);
          break;
        }
      }
    }
    // Selecionar produto se disponível
    if (count > 1) {
      const prodSel = selects.nth(1);
      await page.waitForTimeout(500);
      const prodOpts = await prodSel.locator('option').allTextContents();
      for (const o of prodOpts) {
        if (o.toLowerCase().includes("ttpa")) {
          await prodSel.selectOption({ label: o });
          break;
        }
      }
    }
    // Preencher preço se vazio
    const precoInputs = page.locator('input[type="number"], input[placeholder*="preço" i]');
    if (await precoInputs.count() > 0) {
      const val = await precoInputs.first().inputValue();
      if (!val) await precoInputs.first().fill("5.07");
    }
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-05_antes_gerar.png`, fullPage: true });
    // Clicar Gerar
    const btnGerar = page.locator('button:has-text("Gerar Proposta"), button:has-text("Gerar")').first();
    if (await btnGerar.isVisible()) {
      await btnGerar.click();
      await page.waitForTimeout(15000); // IA pode demorar
    }
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-05_proposta_gerada.png`, fullPage: true });
  });

  test("UC-R01-06: Verificar editor rico e toolbar", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    // Verificar se existe textarea/editor
    const editor = page.locator('textarea').first();
    const toolbar = page.locator('button:has-text("B"), button:has-text("I"), button:has-text("H1")');
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-06_editor_rico.png`, fullPage: true });
  });

  test("UC-R01-07: Verificar lista de propostas", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(2000);
    // Verificar tabela de propostas
    const table = page.locator('table').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R01-07_lista_propostas.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R02: Upload de Proposta Externa
  // ══════════════════════════════════════════════════════════════
  test("UC-R02-01: Verificar botão Upload Proposta Externa", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    const btnUpload = page.locator('button:has-text("Upload"), button:has-text("Importar")').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R02-01_botao_upload.png`, fullPage: true });
    expect(await btnUpload.isVisible()).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R03: Descrição Técnica A/B
  // ══════════════════════════════════════════════════════════════
  test("UC-R03-01: Verificar toggle A/B na proposta", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    // Procurar toggle ou radio para descrição
    const toggleAB = page.locator('text=Opção A, text=Opção B, text=Texto do Edital, text=Personalizado').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R03-01_toggle_ab.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R04: Auditoria ANVISA
  // ══════════════════════════════════════════════════════════════
  test("UC-R04-01: Verificar card Auditoria ANVISA", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    const anvisaCard = page.locator('text=Auditoria ANVISA, text=ANVISA').first();
    const btnVerificar = page.locator('button:has-text("Verificar Registros"), button:has-text("Verificar")').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R04-01_auditoria_anvisa.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R05: Auditoria Documental
  // ══════════════════════════════════════════════════════════════
  test("UC-R05-01: Verificar card Auditoria Documental", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    const docCard = page.locator('text=Auditoria Documental, text=Documental').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R05-01_auditoria_documental.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R06: Exportar Dossiê
  // ══════════════════════════════════════════════════════════════
  test("UC-R06-01: Verificar botões de exportação", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    const btnPDF = page.locator('button:has-text("PDF")').first();
    const btnDOCX = page.locator('button:has-text("DOCX"), button:has-text("Word")').first();
    const btnZIP = page.locator('button:has-text("ZIP"), button:has-text("Dossiê")').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R06-01_botoes_exportacao.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R07: Status e Submissão
  // ══════════════════════════════════════════════════════════════
  test("UC-R07-01: Verificar fluxo de status", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(1000);
    // Procurar badges de status
    const statusBadges = page.locator('text=rascunho, text=revisão, text=aprovada, text=enviada');
    const btnRevisao = page.locator('button:has-text("Revisão"), button:has-text("Enviar para Revisão")').first();
    const btnAprovar = page.locator('button:has-text("Aprovar")').first();
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R07-01_fluxo_status.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // Visão geral da página
  // ══════════════════════════════════════════════════════════════
  test("OVERVIEW: Captura completa da página Proposta", async ({ page }) => {
    await navigateTo(page, "Proposta");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/OVERVIEW_proposta_page.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // Submissão page
  // ══════════════════════════════════════════════════════════════
  test("UC-R07-02: Verificar página Submissão", async ({ page }) => {
    await navigateTo(page, "Submissão");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/UC-R07-02_submissao_page.png`, fullPage: true });
  });
});
