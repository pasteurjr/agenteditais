import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/proposta/screenshots";

async function login(page: any) {
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  const emailField = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  if (await emailField.isVisible()) {
    await emailField.fill("pasteurjr@gmail.com");
    await page.locator('input[type="password"]').first().fill("123456");
    await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first().click();
    await page.waitForTimeout(3000);
  }
}

async function irParaProposta(page: any) {
  await page.locator('text=Proposta').first().click();
  await page.waitForTimeout(2000);
}

test.describe.serial("Fase 2 — Proposta: Validação Real", () => {

  test("UC-R01-01: Página Proposta carrega", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.screenshot({ path: `${SS}/UC-R01-01_pagina.png`, fullPage: true });
  });

  test("UC-R01-02: Modal Nova Proposta + selecionar Fiocruz", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.locator('button:has-text("Nova Proposta")').click();
    await page.waitForTimeout(1000);

    // Selecionar edital Fiocruz
    const editalSelect = page.locator('.modal-overlay select').first();
    const options = await editalSelect.locator('option').allTextContents();
    console.log("Opções edital:", options);
    let found = false;
    for (const o of options) {
      if (o.includes("46/2026") || o.toLowerCase().includes("fiocruz")) {
        await editalSelect.selectOption({ label: o });
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/UC-R01-02_fiocruz_selecionado.png`, fullPage: true });
  });

  test("UC-R01-03: Selecionar Lote e Produto TTPA", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.locator('button:has-text("Nova Proposta")').click();
    await page.waitForTimeout(1000);

    // Edital
    const selects = page.locator('.modal-overlay select');
    const editalSel = selects.first();
    const edOpts = await editalSel.locator('option').allTextContents();
    for (const o of edOpts) {
      if (o.includes("46/2026")) { await editalSel.selectOption({ label: o }); break; }
    }
    await page.waitForTimeout(2000);

    // Contar selects no modal
    const allCount = await selects.count();
    console.log(`Total selects no modal: ${allCount}`);

    // Listar todas as opções de cada select
    for (let i = 0; i < allCount; i++) {
      const opts = await selects.nth(i).locator('option').allTextContents();
      console.log(`Select ${i}: ${opts.join(' | ')}`);
    }

    // Selecionar Lote Coagulação se disponível
    if (allCount >= 4) {
      const loteSel = selects.nth(1);
      const loteOpts = await loteSel.locator('option').allTextContents();
      for (const o of loteOpts) {
        if (o.toLowerCase().includes('coagula') || o.includes('Lote 2')) {
          await loteSel.selectOption({ label: o });
          console.log(`Lote selecionado: ${o}`);
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    // Selecionar produto TTPA
    for (let i = 0; i < allCount; i++) {
      const opts = await selects.nth(i).locator('option').allTextContents();
      for (const o of opts) {
        if (o.toLowerCase().includes('ttpa')) {
          await selects.nth(i).selectOption({ label: o });
          console.log(`Produto selecionado: ${o} (select ${i})`);
          break;
        }
      }
    }

    await page.waitForTimeout(1000);

    // Verificar preço
    const precoInputs = page.locator('.modal-overlay input[type="number"]');
    const precoCount = await precoInputs.count();
    for (let i = 0; i < precoCount; i++) {
      const val = await precoInputs.nth(i).inputValue();
      console.log(`Input number ${i}: "${val}"`);
    }

    // Preencher preço e quantidade se vazios
    if (precoCount >= 1) {
      const v = await precoInputs.first().inputValue();
      if (!v) await precoInputs.first().fill("5.07");
    }
    if (precoCount >= 2) {
      const v = await precoInputs.nth(1).inputValue();
      if (!v || v === "0") await precoInputs.nth(1).fill("10");
    }

    await page.screenshot({ path: `${SS}/UC-R01-03_lote_produto.png`, fullPage: true });
  });

  test("UC-R01-04: Gerar proposta com IA", async ({ page }) => {
    test.setTimeout(180000);
    await login(page);
    await irParaProposta(page);
    await page.locator('button:has-text("Nova Proposta")').click();
    await page.waitForTimeout(1000);

    // Selecionar edital
    const selects = page.locator('.modal-overlay select');
    const edOpts = await selects.first().locator('option').allTextContents();
    for (const o of edOpts) {
      if (o.includes("46/2026")) { await selects.first().selectOption({ label: o }); break; }
    }
    await page.waitForTimeout(2000);

    // Selecionar produto TTPA
    const allCount = await selects.count();
    for (let i = 0; i < allCount; i++) {
      const opts = await selects.nth(i).locator('option').allTextContents();
      for (const o of opts) {
        if (o.toLowerCase().includes('ttpa')) {
          await selects.nth(i).selectOption({ label: o });
          break;
        }
      }
    }
    await page.waitForTimeout(1000);

    // Preço e quantidade
    const inputs = page.locator('.modal-overlay input[type="number"]');
    if (await inputs.count() >= 1) {
      const v = await inputs.first().inputValue();
      if (!v) await inputs.first().fill("5.07");
    }
    if (await inputs.count() >= 2) {
      const v = await inputs.nth(1).inputValue();
      if (!v || v === "0") await inputs.nth(1).fill("10");
    }

    await page.screenshot({ path: `${SS}/UC-R01-04_antes_gerar.png`, fullPage: true });

    // Gerar proposta (force click para evitar interceptação)
    const btnGerar = page.locator('.modal-overlay button:has-text("Gerar Proposta")');
    await btnGerar.scrollIntoViewIfNeeded();
    await btnGerar.click({ force: true });
    console.log("Botão Gerar Proposta clicado");

    // Aguardar IA
    await page.waitForTimeout(60000);
    await page.screenshot({ path: `${SS}/UC-R01-04_apos_gerar.png`, fullPage: true });
  });

  test("UC-R01-05: Lista de propostas após geração", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    console.log(`Propostas na lista: ${count}`);

    if (count > 0) {
      const firstRowText = await rows.first().textContent();
      console.log(`Primeira proposta: ${firstRowText?.slice(0, 100)}`);
    }

    await page.screenshot({ path: `${SS}/UC-R01-05_lista.png`, fullPage: true });
  });

  test("UC-R01-06: Selecionar proposta e ver editor", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      // Clicar no botão de visualizar/editar da primeira proposta
      const btns = rows.first().locator('button');
      const btnCount = await btns.count();
      console.log(`Botões na primeira proposta: ${btnCount}`);
      if (btnCount > 0) {
        await btns.first().click();
        await page.waitForTimeout(2000);
      }
    }

    // Verificar editor e toolbar
    const textarea = page.locator('textarea');
    console.log(`Textareas: ${await textarea.count()}`);
    const toolbarBtns = page.locator('button[title="Negrito"]');
    console.log(`Toolbar Negrito: ${await toolbarBtns.count()}`);

    await page.screenshot({ path: `${SS}/UC-R01-06_editor.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R02: Upload
  // ══════════════════════════════════════════════════════════════
  test("UC-R02-01: Verificar upload na página", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(1000);

    // Buscar qualquer referência a upload
    const allText = await page.textContent('body');
    const hasUpload = allText?.toLowerCase().includes('upload');
    const hasImportar = allText?.toLowerCase().includes('importar');
    console.log(`Texto 'upload' na página: ${hasUpload}`);
    console.log(`Texto 'importar' na página: ${hasImportar}`);

    await page.screenshot({ path: `${SS}/UC-R02-01_upload.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R04: ANVISA + UC-R05: Documental + UC-R06: Export
  // ══════════════════════════════════════════════════════════════
  test("UC-R04-05-06: Cards ANVISA, Documental e Export (com proposta)", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      const btns = rows.first().locator('button');
      if (await btns.count() > 0) {
        await btns.first().click();
        await page.waitForTimeout(2000);
      }

      // Scroll para ver todos os cards
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
    }

    // Buscar cards
    const allText = await page.textContent('body') || "";
    console.log(`ANVISA na página: ${allText.includes('ANVISA')}`);
    console.log(`Documental na página: ${allText.includes('Documental') || allText.includes('documental')}`);
    console.log(`PDF na página: ${allText.includes('PDF')}`);
    console.log(`DOCX na página: ${allText.includes('DOCX')}`);
    console.log(`ZIP/Dossiê na página: ${allText.includes('ZIP') || allText.includes('Dossi')}`);

    await page.screenshot({ path: `${SS}/UC-R04-05-06_cards.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // UC-R07: Submissão
  // ══════════════════════════════════════════════════════════════
  test("UC-R07: Página Submissão", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);
    const submissao = page.locator('text=Submissao').first();
    if (await submissao.isVisible()) {
      await submissao.click();
      await page.waitForTimeout(2000);
    }
    const pageText = await page.textContent('body') || "";
    console.log(`Página tem 'Submissao': ${pageText.includes('Submiss')}`);
    console.log(`Página tem 'checklist': ${pageText.toLowerCase().includes('checklist')}`);
    await page.screenshot({ path: `${SS}/UC-R07_submissao.png`, fullPage: true });
  });

  test("FINAL: Captura geral", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/FINAL.png`, fullPage: true });
  });
});
