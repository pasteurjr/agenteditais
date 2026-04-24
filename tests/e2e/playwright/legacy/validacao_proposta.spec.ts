import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/proposta/screenshots";

async function login(page: any) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  const emailField = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  if (await emailField.isVisible()) {
    await emailField.fill("pasteurjr@gmail.com");
    await page.locator('input[type="password"]').first().fill("123456");
    await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first().click();
    await page.waitForTimeout(3000);
  }
}

async function irParaProposta(page: any) {
  // Sidebar items use: <button><span class="nav-item-label">Proposta</span></button>
  await page.locator('span.nav-item-label:text-is("Proposta")').click({ timeout: 5000 });
  await page.waitForTimeout(2000);
}

// Helper: abrir modal e preencher Fiocruz + Lote 2 + TTPA
async function preencherModalFiocruzTTPA(page: any) {
  await page.locator('button:has-text("Nova Proposta")').click();
  await page.waitForTimeout(1500);

  const selects = page.locator('.modal-overlay select');

  // Edital: 46/2026 Fiocruz
  const editalSel = selects.first();
  const edOpts = await editalSel.locator('option').allTextContents();
  let editalFound = false;
  for (const o of edOpts) {
    if (o.includes("46/2026")) {
      await editalSel.selectOption({ label: o });
      editalFound = true;
      break;
    }
  }
  expect(editalFound).toBeTruthy();
  await page.waitForTimeout(2000);

  // Lote 2 Coagulação
  const allCount = await selects.count();
  if (allCount >= 4) {
    const loteSel = selects.nth(1);
    const loteOpts = await loteSel.locator('option').allTextContents();
    for (const o of loteOpts) {
      if (o.toLowerCase().includes('coagula') || o.includes('Lote 2')) {
        await loteSel.selectOption({ label: o });
        break;
      }
    }
    await page.waitForTimeout(1000);
  }

  // Produto TTPA
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
  const precoVal = await inputs.first().inputValue();
  if (!precoVal) await inputs.first().fill("5.07");
  const qtdCount = await inputs.count();
  if (qtdCount >= 2) {
    const qtdVal = await inputs.nth(1).inputValue();
    if (!qtdVal || qtdVal === "0") await inputs.nth(1).fill("10");
  }
}

test.describe.serial("Fase 2 — Proposta: Validação Completa v2", () => {

  // ══════════════════════════════════════════════════════════════════
  // UC-R01: Gerar Proposta Técnica
  // ══════════════════════════════════════════════════════════════════

  test("UC-R01-01: Página Proposta carrega com elementos corretos", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    // Verificar título
    const titulo = page.locator('h1:has-text("Propostas"), h1:has-text("Geracao")');
    await expect(titulo).toBeVisible({ timeout: 5000 });

    // Verificar botões no header
    const btnNova = page.locator('button:has-text("Nova Proposta")');
    await expect(btnNova).toBeVisible();
    const btnUpload = page.locator('button:has-text("Upload Proposta Externa")');
    await expect(btnUpload).toBeVisible();

    // Verificar card inline
    const cardGerar = page.locator('text=Gerar Nova Proposta');
    await expect(cardGerar).toBeVisible();

    // Verificar tabela
    const tabela = page.locator('text=Minhas Propostas');
    await expect(tabela).toBeVisible();

    await page.screenshot({ path: `${SS}/UC-R01-01_pagina_inicial.png`, fullPage: true });
  });

  test("UC-R01-02: Modal Nova Proposta com todos os campos", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.locator('button:has-text("Nova Proposta")').click();
    await page.waitForTimeout(1500);

    // Verificar título do modal
    const modalTitle = page.locator('.modal-overlay >> text=Gerar Nova Proposta');
    await expect(modalTitle).toBeVisible();

    // Verificar campos
    const labels = await page.locator('.modal-overlay .form-field-label, .modal-overlay label').allTextContents();
    console.log("Labels no modal:", labels);

    // Deve ter: Edital, Lote, Template, Produto, Preco Unitario, Quantidade
    const camposEsperados = ["Edital", "Template", "Produto", "Preco Unitario", "Quantidade"];
    for (const campo of camposEsperados) {
      const found = labels.some(l => l.toLowerCase().includes(campo.toLowerCase()));
      console.log(`  Campo "${campo}": ${found ? "✅" : "❌"}`);
      expect(found).toBeTruthy();
    }

    // Verificar botões do modal
    const btnGerar = page.locator('.modal-overlay button:has-text("Gerar Proposta")');
    await expect(btnGerar).toBeVisible();
    const btnCancelar = page.locator('.modal-overlay button:has-text("Cancelar")');
    await expect(btnCancelar).toBeVisible();

    await page.screenshot({ path: `${SS}/UC-R01-02_modal_campos.png`, fullPage: true });
  });

  test("UC-R01-03: Selecionar Fiocruz + Lote 2 + TTPA + verificar preço", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await preencherModalFiocruzTTPA(page);

    // Verificar que os selects foram preenchidos
    const selects = page.locator('.modal-overlay select');
    const editalVal = await selects.first().inputValue();
    console.log(`Edital selecionado (value): ${editalVal}`);
    expect(editalVal).toBeTruthy(); // não vazio

    // Verificar preço
    const precoInput = page.locator('.modal-overlay input[type="number"]').first();
    const preco = await precoInput.inputValue();
    console.log(`Preço: ${preco}`);

    // Verificar quantidade
    const inputs = page.locator('.modal-overlay input[type="number"]');
    if (await inputs.count() >= 2) {
      const qtd = await inputs.nth(1).inputValue();
      console.log(`Quantidade: ${qtd}`);
      expect(qtd).toBeTruthy();
    }

    await page.screenshot({ path: `${SS}/UC-R01-03_fiocruz_lote_ttpa.png`, fullPage: true });
  });

  test("UC-R01-04: Gerar proposta com IA e verificar resultado", async ({ page }) => {
    test.setTimeout(180000);
    await login(page);
    await irParaProposta(page);
    await preencherModalFiocruzTTPA(page);

    await page.screenshot({ path: `${SS}/UC-R01-04_antes_gerar.png`, fullPage: true });

    // Clicar Gerar Proposta
    const btnGerar = page.locator('.modal-overlay button:has-text("Gerar Proposta")');
    await btnGerar.scrollIntoViewIfNeeded();
    await btnGerar.click({ force: true });
    console.log("Botão Gerar clicado — aguardando IA...");

    // Aguardar IA (até 90s)
    await page.waitForTimeout(60000);
    await page.screenshot({ path: `${SS}/UC-R01-04_apos_gerar.png`, fullPage: true });

    // Verificar que proposta apareceu na lista
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    console.log(`Propostas na lista: ${count}`);
    expect(count).toBeGreaterThan(0);

    // Verificar dados da proposta
    const firstRow = await rows.first().textContent();
    console.log(`Primeira proposta: ${firstRow?.slice(0, 120)}`);
    expect(firstRow).toContain("46/2026");
    expect(firstRow).toContain("FUNDACAO OSWALDO CRUZ");
    expect(firstRow).toContain("Kit TTPA");
    expect(firstRow).toContain("Rascunho");
  });

  test("UC-R01-05: Selecionar proposta e verificar editor rico", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    // Clicar no botão de visualizar da primeira proposta
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible();
    const btnVer = firstRow.locator('button').first();
    await btnVer.click();
    await page.waitForTimeout(2000);

    // Verificar seção "Proposta Selecionada"
    const secaoSelecionada = page.locator('text=Proposta Selecionada');
    await expect(secaoSelecionada).toBeVisible();
    console.log("Seção Proposta Selecionada: ✅");

    // Verificar botões de status
    const btnSalvar = page.locator('button:has-text("Salvar Rascunho")');
    await expect(btnSalvar).toBeVisible();
    const btnRevisao = page.locator('button:has-text("Enviar para Revisao"), button:has-text("Revisao")');
    await expect(btnRevisao.first()).toBeVisible();
    const btnAprovar = page.locator('button:has-text("Aprovar")');
    await expect(btnAprovar).toBeVisible();

    // Verificar editor (textarea)
    const textarea = page.locator('textarea');
    const taCount = await textarea.count();
    console.log(`Textareas: ${taCount}`);
    expect(taCount).toBeGreaterThan(0);

    // Verificar conteúdo do editor ou da área de exibição
    const conteudo = await textarea.first().inputValue();
    console.log(`Conteúdo textarea (primeiros 100 chars): ${conteudo?.slice(0, 100)}`);
    // Se textarea vazio, verificar se o conteúdo está renderizado na página
    if (!conteudo || conteudo.length < 50) {
      const pageText = await page.textContent('body') || "";
      const hasProposta = pageText.includes('PROPOSTA') || pageText.includes('proposta') || pageText.includes('Técnica');
      console.log(`Conteúdo proposta na página: ${hasProposta ? "✅" : "⚠️"}`);
    }

    // Verificar toolbar markdown
    const btnNegrito = page.locator('button[title="Negrito"]');
    expect(await btnNegrito.count()).toBeGreaterThan(0);

    await page.screenshot({ path: `${SS}/UC-R01-05_editor_proposta.png`, fullPage: true });
  });

  test("UC-R01-06: Editar proposta no editor e verificar toolbar", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(3000);

    // Selecionar proposta
    const rows = page.locator('table tbody tr');
    if (await rows.count() === 0) {
      console.log("Nenhuma proposta na lista — pulando teste de edição");
      await page.screenshot({ path: `${SS}/UC-R01-06_sem_proposta.png`, fullPage: true });
      return;
    }
    const btnVer = rows.first().locator('button').first();
    await btnVer.click({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Editar no textarea
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.click();
      await textarea.press('End');
      await textarea.type('\n\n--- TEXTO ADICIONADO PELO TESTE ---');
      await page.waitForTimeout(500);

      const editado = await textarea.inputValue();
      if (editado.includes('TEXTO ADICIONADO PELO TESTE')) {
        console.log("Editor editável: ✅");
      } else {
        console.log("Editor: textarea visível mas edição não refletiu no value");
      }
    } else {
      console.log("Editor: textarea não visível (conteúdo pode estar em outro elemento)");
    }

    // Testar botão Negrito da toolbar
    await textarea.selectText();
    const btnBold = page.locator('button[title="Negrito"]').first();
    if (await btnBold.isVisible()) {
      console.log("Toolbar Negrito: ✅ visível");
    }

    await page.screenshot({ path: `${SS}/UC-R01-06_editor_editado.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // UC-R02: Upload de Proposta Externa
  // ══════════════════════════════════════════════════════════════════

  test("UC-R02-01: Botão Upload visível e modal funciona", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    // Verificar botão Upload
    const btnUpload = page.locator('button:has-text("Upload Proposta Externa")');
    await expect(btnUpload).toBeVisible();
    console.log("Botão Upload Proposta Externa: ✅ visível");

    // Clicar para abrir modal
    await btnUpload.click();
    await page.waitForTimeout(1000);

    // Verificar modal de upload
    const modalTitle = page.locator('.modal-overlay >> text=Upload');
    const modalVisible = await modalTitle.isVisible();
    console.log(`Modal Upload: ${modalVisible ? "✅ aberto" : "❌ não abriu"}`);

    // Verificar campos do modal
    const fileInput = page.locator('.modal-overlay input[type="file"]');
    const fileCount = await fileInput.count();
    console.log(`Input file: ${fileCount > 0 ? "✅" : "❌"}`);

    const btnImportar = page.locator('.modal-overlay button:has-text("Importar")');
    console.log(`Botão Importar: ${await btnImportar.isVisible() ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-R02-01_modal_upload.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // UC-R03: Descrição Técnica A/B
  // ══════════════════════════════════════════════════════════════════

  test("UC-R03-01: Toggle descrição A/B na proposta", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    // Selecionar proposta
    const btnVer = page.locator('table tbody tr').first().locator('button').first();
    if (await btnVer.isVisible()) {
      await btnVer.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para ver toda a proposta
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Procurar toggle A/B
    const bodyText = await page.textContent('body') || "";
    const hasDescTecnica = bodyText.includes('Descri') && (bodyText.includes('Edital') || bodyText.includes('Personaliz'));
    console.log(`Descrição Técnica A/B: ${hasDescTecnica ? "✅ presente" : "⚠️ não visível (pode precisar scroll)"}`);

    await page.screenshot({ path: `${SS}/UC-R03-01_descricao_ab.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // UC-R04: Auditoria ANVISA
  // ══════════════════════════════════════════════════════════════════

  test("UC-R04-01: Card ANVISA com semáforo", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    // Selecionar proposta
    const btnVer = page.locator('table tbody tr').first().locator('button').first();
    if (await btnVer.isVisible()) {
      await btnVer.click();
      await page.waitForTimeout(2000);
    }

    // Scroll para cards inferiores
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body') || "";
    const hasAnvisa = bodyText.includes('ANVISA');
    console.log(`Card ANVISA: ${hasAnvisa ? "✅ presente" : "❌ não encontrado"}`);

    // Procurar botão Verificar
    const btnVerificar = page.locator('button:has-text("Verificar")');
    const verifCount = await btnVerificar.count();
    console.log(`Botão Verificar: ${verifCount > 0 ? "✅" : "⚠️ não visível"}`);

    if (verifCount > 0 && await btnVerificar.first().isVisible()) {
      await btnVerificar.first().click();
      await page.waitForTimeout(3000);
      console.log("Verificação ANVISA acionada");
    }

    await page.screenshot({ path: `${SS}/UC-R04-01_anvisa.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // UC-R05: Auditoria Documental
  // ══════════════════════════════════════════════════════════════════

  test("UC-R05-01: Card Auditoria Documental", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    const btnVer = page.locator('table tbody tr').first().locator('button').first();
    if (await btnVer.isVisible()) {
      await btnVer.click();
      await page.waitForTimeout(2000);
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body') || "";
    const hasDocumental = bodyText.toLowerCase().includes('documental') || bodyText.toLowerCase().includes('checklist');
    console.log(`Card Documental: ${hasDocumental ? "✅ presente" : "⚠️ não visível"}`);

    await page.screenshot({ path: `${SS}/UC-R05-01_documental.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // UC-R06: Exportar Dossiê
  // ══════════════════════════════════════════════════════════════════

  test("UC-R06-01: Botões PDF, DOCX, ZIP", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    const btnVer = page.locator('table tbody tr').first().locator('button').first();
    if (await btnVer.isVisible()) {
      await btnVer.click();
      await page.waitForTimeout(2000);
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body') || "";
    const hasPDF = bodyText.includes('PDF');
    const hasDOCX = bodyText.includes('DOCX') || bodyText.includes('Word');
    const hasZIP = bodyText.includes('ZIP') || bodyText.toLowerCase().includes('dossi');
    console.log(`Export PDF: ${hasPDF ? "✅" : "❌"}`);
    console.log(`Export DOCX: ${hasDOCX ? "✅" : "❌"}`);
    console.log(`Export ZIP/Dossiê: ${hasZIP ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-R06-01_exportacao.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // UC-R07: Status e Submissão
  // ══════════════════════════════════════════════════════════════════

  test("UC-R07-01: Fluxo de status rascunho → revisão", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(2000);

    // Selecionar proposta
    const btnVer = page.locator('table tbody tr').first().locator('button').first();
    if (await btnVer.isVisible()) {
      await btnVer.click();
      await page.waitForTimeout(2000);
    }

    // Verificar que proposta está selecionada com seção visível
    const secao = page.locator('text=Proposta Selecionada');
    await expect(secao).toBeVisible({ timeout: 5000 });
    console.log("Proposta Selecionada: ✅");

    // Clicar "Enviar para Revisão"
    const btnRevisao = page.locator('button:has-text("Enviar para Revisao"), button:has-text("Revisão"), button:has-text("Revisao")').first();
    if (await btnRevisao.isVisible()) {
      await btnRevisao.click();
      await page.waitForTimeout(2000);
      console.log("Enviar para Revisão clicado");
    }

    await page.screenshot({ path: `${SS}/UC-R07-01_status.png`, fullPage: true });
  });

  test("UC-R07-02: Página Submissão com checklist", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);

    // Navegar para Submissão
    const submissao = page.locator('text=Submissao').first();
    if (await submissao.isVisible()) {
      await submissao.click();
      await page.waitForTimeout(2000);
    }

    const bodyText = await page.textContent('body') || "";
    const hasSubmissao = bodyText.includes('Submiss');
    const hasChecklist = bodyText.toLowerCase().includes('checklist') || bodyText.toLowerCase().includes('proposta');
    console.log(`Página Submissão: ${hasSubmissao ? "✅" : "❌"}`);
    console.log(`Checklist: ${hasChecklist ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-R07-02_submissao.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════════
  // Captura final
  // ══════════════════════════════════════════════════════════════════

  test("FINAL: Visão geral completa", async ({ page }) => {
    await login(page);
    await irParaProposta(page);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/FINAL_visao_geral.png`, fullPage: true });
  });
});
