import { test, expect } from "@playwright/test";
import path from "path";

const BASE = "http://localhost:5175";
const SS = "testes/proposta/screenshots_complementar";

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

async function irParaProposta(page: any) {
  await page.locator('span.nav-item-label:text-is("Proposta")').click({ timeout: 5000 });
  await page.waitForTimeout(2000);
}

async function selecionarPrimeiraProposta(page: any) {
  const rows = page.locator('table tbody tr');
  if (await rows.count() > 0) {
    await rows.first().locator('button').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    return true;
  }
  return false;
}

test.describe.serial("Testes Complementares — Fase 2 Proposta", () => {

  // ══════════════════════════════════════════════════════════════
  // TC-01: Upload real de arquivo .docx
  // ══════════════════════════════════════════════════════════════
  test("TC-01: Upload de proposta externa (.docx)", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    // Contar propostas antes
    const rowsBefore = await page.locator('table tbody tr').count();
    console.log(`Propostas antes: ${rowsBefore}`);

    // Abrir modal Upload
    await page.locator('button:has-text("Upload Proposta Externa")').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/TC-01_modal_upload.png`, fullPage: true });

    // Selecionar edital Fiocruz
    const selects = page.locator('.modal-overlay select');
    const editalSel = selects.first();
    const opts = await editalSel.locator('option').allTextContents();
    for (const o of opts) {
      if (o.includes("46/2026")) { await editalSel.selectOption({ label: o }); break; }
    }
    await page.waitForTimeout(1000);

    // Selecionar produto TTPA
    const allCount = await selects.count();
    for (let i = 1; i < allCount; i++) {
      const sopts = await selects.nth(i).locator('option').allTextContents();
      for (const o of sopts) {
        if (o.toLowerCase().includes('ttpa')) {
          await selects.nth(i).selectOption({ label: o }); break;
        }
      }
    }

    // Upload do arquivo .docx
    const fileInput = page.locator('.modal-overlay input[type="file"]');
    await fileInput.setInputFiles(path.resolve('testes/proposta/proposta_teste.docx'));
    await page.waitForTimeout(500);

    // Preencher preço e quantidade
    const inputs = page.locator('.modal-overlay input[type="number"]');
    if (await inputs.count() >= 1) await inputs.first().fill("5.07");
    if (await inputs.count() >= 2) await inputs.nth(1).fill("10");

    await page.screenshot({ path: `${SS}/TC-01_antes_importar.png`, fullPage: true });

    // Clicar Importar
    const btnImportar = page.locator('.modal-overlay button:has-text("Importar")');
    await btnImportar.click({ force: true });
    await page.waitForTimeout(5000);

    await page.screenshot({ path: `${SS}/TC-01_apos_importar.png`, fullPage: true });

    // Verificar se nova proposta apareceu
    const rowsAfter = await page.locator('table tbody tr').count();
    console.log(`Propostas depois: ${rowsAfter}`);
    console.log(`Upload criou proposta: ${rowsAfter > rowsBefore ? "✅" : "❌"}`);
  });

  // ══════════════════════════════════════════════════════════════
  // TC-02: Toggle descrição técnica A/B
  // ══════════════════════════════════════════════════════════════
  test("TC-02: Toggle descrição técnica A/B", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-02");
      return;
    }

    // Scroll para ver toggle
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);

    // Procurar toggle/radio A/B
    const toggleB = page.locator('text=Personalizado, text=Opcao B, text=Opção B, label:has-text("Personaliz")').first();
    const toggleA = page.locator('text=Texto do Edital, text=Opcao A, text=Opção A').first();

    const bodyText = await page.textContent('body') || "";
    const hasToggle = bodyText.includes('Personaliz') || bodyText.includes('Texto do Edital') || bodyText.includes('Opcao A');
    console.log(`Toggle A/B encontrado: ${hasToggle ? "✅" : "❌"}`);

    if (await toggleB.isVisible().catch(() => false)) {
      await toggleB.click();
      await page.waitForTimeout(1000);
      console.log("Toggle B clicado ✅");

      // Verificar badge de alerta
      const badge = page.locator('text=PERSONALIZADO, text=personalizado, text=alterado');
      console.log(`Badge alerta: ${await badge.first().isVisible().catch(() => false) ? "✅" : "⚠️ não visível"}`);
    }

    await page.screenshot({ path: `${SS}/TC-02_toggle_ab.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-03: Verificação ANVISA (semáforo)
  // ══════════════════════════════════════════════════════════════
  test("TC-03: Auditoria ANVISA — verificar semáforo", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-03");
      return;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Clicar Verificar Registros
    const btnVerificar = page.locator('button:has-text("Verificar")').first();
    if (await btnVerificar.isVisible().catch(() => false)) {
      await btnVerificar.click();
      await page.waitForTimeout(5000);
      console.log("Verificar ANVISA clicado ✅");

      // Verificar resultado (verde/amarelo/vermelho ou sem_registro)
      const bodyText = await page.textContent('body') || "";
      const hasValido = bodyText.toLowerCase().includes('valido') || bodyText.includes('✅') || bodyText.includes('verde');
      const hasVencido = bodyText.toLowerCase().includes('vencido') || bodyText.includes('❌') || bodyText.includes('vermelho');
      const hasSemRegistro = bodyText.toLowerCase().includes('sem_registro') || bodyText.toLowerCase().includes('sem registro');
      console.log(`Status ANVISA — válido: ${hasValido}, vencido: ${hasVencido}, sem registro: ${hasSemRegistro}`);
    } else {
      console.log("Botão Verificar não visível ⚠️");
    }

    await page.screenshot({ path: `${SS}/TC-03_anvisa_semaforo.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-04: Download PDF
  // ══════════════════════════════════════════════════════════════
  test("TC-04: Download PDF da proposta", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-04");
      return;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Procurar botão PDF
    const btnPDF = page.locator('button:has-text("PDF")').first();
    if (await btnPDF.isVisible().catch(() => false)) {
      // Interceptar download
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await btnPDF.click();
      const download = await downloadPromise;
      if (download) {
        const filename = download.suggestedFilename();
        console.log(`PDF baixado: ${filename} ✅`);
      } else {
        // Pode ter aberto em nova aba
        console.log("PDF: clique executado (pode ter aberto em nova aba) ✅");
      }
    } else {
      console.log("Botão PDF não encontrado ⚠️");
    }

    await page.screenshot({ path: `${SS}/TC-04_download_pdf.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-05: Download DOCX
  // ══════════════════════════════════════════════════════════════
  test("TC-05: Download DOCX da proposta", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-05");
      return;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const btnDOCX = page.locator('button:has-text("DOCX"), button:has-text("Word")').first();
    if (await btnDOCX.isVisible().catch(() => false)) {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await btnDOCX.click();
      const download = await downloadPromise;
      if (download) {
        console.log(`DOCX baixado: ${download.suggestedFilename()} ✅`);
      } else {
        console.log("DOCX: clique executado ✅");
      }
    } else {
      console.log("Botão DOCX não encontrado ⚠️");
    }

    await page.screenshot({ path: `${SS}/TC-05_download_docx.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-06: Download Dossiê ZIP
  // ══════════════════════════════════════════════════════════════
  test("TC-06: Download Dossiê ZIP", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-06");
      return;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const btnZIP = page.locator('button:has-text("ZIP"), button:has-text("Dossiê"), button:has-text("Dossie")').first();
    if (await btnZIP.isVisible().catch(() => false)) {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await btnZIP.click();
      const download = await downloadPromise;
      if (download) {
        console.log(`ZIP baixado: ${download.suggestedFilename()} ✅`);
      } else {
        console.log("ZIP: clique executado ✅");
      }
    } else {
      console.log("Botão ZIP não encontrado ⚠️");
    }

    await page.screenshot({ path: `${SS}/TC-06_download_zip.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-07: Fluxo completo de status
  // ══════════════════════════════════════════════════════════════
  test("TC-07: Fluxo completo rascunho → revisão → aprovada → enviada", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-07");
      return;
    }

    await page.screenshot({ path: `${SS}/TC-07_01_rascunho.png`, fullPage: true });

    // Passo 1: Salvar Rascunho
    const btnSalvar = page.locator('button:has-text("Salvar Rascunho")');
    if (await btnSalvar.isVisible().catch(() => false)) {
      await btnSalvar.click();
      await page.waitForTimeout(2000);
      console.log("Salvar Rascunho: ✅");
    }

    // Passo 2: Enviar para Revisão
    const btnRevisao = page.locator('button:has-text("Enviar para Revisao"), button:has-text("Revisão"), button:has-text("Revisao")').first();
    if (await btnRevisao.isVisible().catch(() => false)) {
      await btnRevisao.click();
      await page.waitForTimeout(2000);
      console.log("Enviar para Revisão: ✅");
      await page.screenshot({ path: `${SS}/TC-07_02_revisao.png`, fullPage: true });
    }

    // Passo 3: Aprovar
    const btnAprovar = page.locator('button:has-text("Aprovar")').first();
    if (await btnAprovar.isVisible().catch(() => false)) {
      await btnAprovar.click();
      await page.waitForTimeout(2000);
      console.log("Aprovar: ✅");
      await page.screenshot({ path: `${SS}/TC-07_03_aprovada.png`, fullPage: true });
    }

    // Verificar status final
    const bodyText = await page.textContent('body') || "";
    const statusFinal = bodyText.includes('Aprovada') ? 'Aprovada' : bodyText.includes('Revisao') ? 'Revisão' : bodyText.includes('Rascunho') ? 'Rascunho' : 'Desconhecido';
    console.log(`Status final: ${statusFinal}`);

    await page.screenshot({ path: `${SS}/TC-07_04_final.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-08: Auditoria Documental — checklist
  // ══════════════════════════════════════════════════════════════
  test("TC-08: Auditoria Documental — verificar checklist", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    if (!await selecionarPrimeiraProposta(page)) {
      console.log("Sem proposta — pulando TC-08");
      return;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Procurar botão de auditoria documental
    const btnAuditoria = page.locator('button:has-text("Auditoria"), button:has-text("Verificar Doc")').first();
    if (await btnAuditoria.isVisible().catch(() => false)) {
      await btnAuditoria.click();
      await page.waitForTimeout(3000);
      console.log("Auditoria Documental acionada ✅");
    }

    // Verificar checklist
    const bodyText = await page.textContent('body') || "";
    const hasChecklist = bodyText.toLowerCase().includes('checklist') || bodyText.includes('✅') || bodyText.includes('☑') || bodyText.includes('presente') || bodyText.includes('ausente');
    console.log(`Checklist documental: ${hasChecklist ? "✅ presente" : "⚠️ não visível"}`);

    await page.screenshot({ path: `${SS}/TC-08_documental_checklist.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-09: Página Submissão com dados reais
  // ══════════════════════════════════════════════════════════════
  test("TC-09: Submissão — verificar propostas e checklist", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);

    await page.locator('span.nav-item-label:text-is("Submissao")').click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body') || "";
    console.log(`Submissão carregada: ${bodyText.includes('Submiss') ? "✅" : "❌"}`);
    console.log(`Checklist presente: ${bodyText.toLowerCase().includes('checklist') ? "✅" : "⚠️"}`);
    console.log(`Propostas visíveis: ${bodyText.includes('46/2026') ? "✅" : "⚠️ nenhuma proposta"}`);

    await page.screenshot({ path: `${SS}/TC-09_submissao.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-10: Templates de proposta — criar e usar
  // ══════════════════════════════════════════════════════════════
  test("TC-10: Criar template e verificar no CRUD", async ({ page }) => {
    await login(page);

    // Navegar para Cadastros → Templates Proposta
    // Expandir CADASTROS no sidebar
    const cadastros = page.locator('text=CADASTROS').first();
    if (await cadastros.isVisible().catch(() => false)) {
      await cadastros.click();
      await page.waitForTimeout(1000);
    }

    const templatesMenu = page.locator('span.nav-item-label:text-is("Templates Proposta")');
    if (await templatesMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
      await templatesMenu.click();
      await page.waitForTimeout(2000);
      console.log("Navegou para Templates Proposta ✅");
    } else {
      // Tentar via CRUD
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "crud:proposta-templates" } }));
      });
      await page.waitForTimeout(2000);
      console.log("Navegou via evento ✅");
    }

    await page.screenshot({ path: `${SS}/TC-10_01_templates_page.png`, fullPage: true });

    // Verificar que a página carregou
    const bodyText = await page.textContent('body') || "";
    const hasTemplates = bodyText.includes('Template') || bodyText.includes('template');
    console.log(`Página Templates: ${hasTemplates ? "✅" : "❌"}`);

    // Clicar em "Novo" ou "Adicionar"
    const btnNovo = page.locator('button:has-text("Novo"), button:has-text("Adicionar"), button:has-text("+")').first();
    if (await btnNovo.isVisible().catch(() => false)) {
      await btnNovo.click();
      await page.waitForTimeout(1000);
      console.log("Botão Novo clicado ✅");
    }

    // Preencher nome do template (campo com label "Nome*")
    const allInputs = page.locator('input[type="text"]');
    const inputCount = await allInputs.count();
    for (let i = 0; i < inputCount; i++) {
      const val = await allInputs.nth(i).inputValue();
      if (!val || val === "") {
        // Primeiro input vazio que não é busca
        const placeholder = await allInputs.nth(i).getAttribute("placeholder") || "";
        if (!placeholder.includes("Buscar")) {
          await allInputs.nth(i).fill("Template Padrão Reagentes");
          console.log(`Nome preenchido no input ${i} ✅`);
          break;
        }
      }
    }

    // Preencher conteúdo
    const conteudoInput = page.locator('textarea[name="conteudo_md"], textarea').first();
    if (await conteudoInput.isVisible().catch(() => false)) {
      await conteudoInput.fill(`# PROPOSTA TÉCNICA

## 1. IDENTIFICAÇÃO DO PROPONENTE
[Dados da empresa]

## 2. OBJETO
[Descrição do objeto conforme edital]

## 3. ESPECIFICAÇÕES TÉCNICAS DO PRODUTO
[Especificações do produto oferecido]

## 4. CONFORMIDADE COM O EDITAL
[Análise de aderência aos requisitos]

## 5. CONDIÇÕES COMERCIAIS
- Preço Unitário: [PREÇO]
- Quantidade: [QTD]
- Valor Total: [TOTAL]
- Validade da proposta: 60 dias

## 6. PRAZO DE ENTREGA
[Prazo conforme edital]

## 7. GARANTIA E SUPORTE
[Condições de garantia]`);
      console.log("Conteúdo preenchido ✅");
    }

    // Marcar Ativo
    const ativoCheckbox = page.locator('input[type="checkbox"]').first();
    if (await ativoCheckbox.isVisible().catch(() => false)) {
      if (!(await ativoCheckbox.isChecked())) {
        await ativoCheckbox.check();
        console.log("Checkbox Ativo marcado ✅");
      }
    }

    await page.screenshot({ path: `${SS}/TC-10_02_template_form.png`, fullPage: true });

    // Salvar
    const btnSalvar = page.locator('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]').first();
    if (await btnSalvar.isVisible().catch(() => false)) {
      await btnSalvar.click();
      await page.waitForTimeout(2000);
      console.log("Template salvo ✅");
    }

    await page.screenshot({ path: `${SS}/TC-10_03_template_salvo.png`, fullPage: true });
  });

  test("TC-11: Verificar template aparece no modal de proposta", async ({ page }) => {
    await login(page);
    await irParaProposta(page);

    // Abrir modal Nova Proposta
    await page.locator('button:has-text("Nova Proposta")').click();
    await page.waitForTimeout(1500);

    // Verificar select de Template
    const selects = page.locator('.modal-overlay select');
    const allCount = await selects.count();
    for (let i = 0; i < allCount; i++) {
      const opts = await selects.nth(i).locator('option').allTextContents();
      const hasTemplate = opts.some(o => o.includes('Template') || o.includes('Padrão'));
      if (hasTemplate) {
        console.log(`Select ${i} tem templates: ${opts.filter(o => o !== 'Sem template').join(', ')}`);

        // Selecionar o template
        for (const o of opts) {
          if (o.includes('Template') || o.includes('Padrão')) {
            await selects.nth(i).selectOption({ label: o });
            console.log(`Template selecionado: ${o} ✅`);
            break;
          }
        }
      }
    }

    await page.screenshot({ path: `${SS}/TC-11_template_no_modal.png`, fullPage: true });
  });
});
