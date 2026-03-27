import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/sprint4/screenshots_complementar";

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

// Clicar na aba pelo texto do tab-label (nth(1) para pegar a aba, não o sidebar)
async function clicarAba(page: any, texto: string) {
  const el = page.locator(`text=${texto}`);
  const count = await el.count();
  // A aba é geralmente o segundo elemento (o primeiro é o sidebar)
  const idx = count >= 2 ? 1 : 0;
  await el.nth(idx).click();
  await page.waitForTimeout(1500);
}

test.describe.serial("Sprint 4 Complementar — Testes End-to-End", () => {

  // ══════════════════════════════════════════════════════════════
  // TC-S4-01: Validação Legal — resultado completo da IA
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-01: Validação Legal — resultado completo", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await irPara(page, "Impugnacao");

    // Selecionar edital Fiocruz
    const selects = page.locator('select');
    const opts = await selects.first().locator('option').allTextContents();
    for (const o of opts) {
      if (o.includes("46/2026")) { await selects.first().selectOption({ label: o }); break; }
    }
    await page.waitForTimeout(1000);

    // Clicar Analisar
    await page.locator('button:has-text("Analisar Edital")').click();
    console.log("Analisar Edital clicado — aguardando IA...");
    await page.waitForTimeout(45000); // IA demora

    // Verificar resultado
    const bodyText = await page.textContent('body') || "";
    const hasInconsistencia = bodyText.toLowerCase().includes('inconsist') || bodyText.includes('lei') || bodyText.includes('Art.');
    const hasGravidade = bodyText.includes('ALTA') || bodyText.includes('MEDIA') || bodyText.includes('BAIXA') || bodyText.toLowerCase().includes('gravidade');
    console.log(`Inconsistências: ${hasInconsistencia ? "✅" : "⚠️"}`);
    console.log(`Gravidade: ${hasGravidade ? "✅" : "⚠️"}`);

    await page.screenshot({ path: `${SS}/TC-S4-01_validacao_resultado.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-S4-02: Aba Petições — Nova Petição modal
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-02: Aba Petições — abrir e ver botões", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");
    await clicarAba(page, "Peticoes");

    // Verificar botões
    const btnNova = page.locator('button:has-text("Nova Peticao")');
    const btnUpload = page.locator('button:has-text("Upload Peticao")');
    expect(await btnNova.isVisible()).toBeTruthy();
    expect(await btnUpload.isVisible()).toBeTruthy();
    console.log("Botão Nova Petição: ✅");
    console.log("Botão Upload Petição: ✅");

    await page.screenshot({ path: `${SS}/TC-S4-02_peticoes_botoes.png`, fullPage: true });
  });

  test("TC-S4-03: Nova Petição — modal com campos", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");
    await clicarAba(page, "Peticoes");

    // Clicar Nova Petição
    await page.locator('button:has-text("Nova Peticao")').click();
    await page.waitForTimeout(1000);

    // Verificar modal
    const bodyText = await page.textContent('body') || "";
    const hasEdital = bodyText.includes('Edital');
    const hasTipo = bodyText.includes('Tipo') || bodyText.includes('tipo');
    console.log(`Campo Edital: ${hasEdital ? "✅" : "❌"}`);
    console.log(`Campo Tipo: ${hasTipo ? "✅" : "❌"}`);

    // Verificar selects no modal
    const modalSelects = page.locator('.modal-overlay select');
    const cnt = await modalSelects.count();
    console.log(`Selects no modal: ${cnt}`);

    await page.screenshot({ path: `${SS}/TC-S4-03_nova_peticao_modal.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-S4-04: Aba Prazos — tabela de editais com cores
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-04: Aba Prazos — tabela com prazo e cores", async ({ page }) => {
    await login(page);
    await irPara(page, "Impugnacao");
    await clicarAba(page, "Prazos");

    // Verificar tabela
    const bodyText = await page.textContent('body') || "";
    console.log(`Tem 46/2026: ${bodyText.includes('46/2026') ? "✅" : "❌"}`);
    console.log(`Tem FIOCRUZ: ${bodyText.includes('FIOCRUZ') || bodyText.includes('Fiocruz') ? "✅" : "❌"}`);
    console.log(`Tem Prazo: ${bodyText.includes('Prazo') || bodyText.includes('dias') ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/TC-S4-04_prazos_tabela.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-S4-05: RecursosPage — Aba Análise com textarea e botão
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-05: Análise — textarea e botão analisar", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");
    await clicarAba(page, "Analise");

    // Verificar textarea
    const textarea = page.locator('textarea');
    const taCnt = await textarea.count();
    console.log(`Textareas: ${taCnt}`);

    // Verificar botão analisar
    const btnAnalisar = page.locator('button:has-text("Analisar")');
    console.log(`Botão Analisar: ${await btnAnalisar.first().isVisible().catch(() => false) ? "✅" : "❌"}`);

    // Preencher e analisar
    if (taCnt > 0) {
      await textarea.first().fill("Proposta vencedora da empresa XYZ: Kit TTPA por R$ 2,35/teste. Validade 12 meses. Sem registro ANVISA informado.");
      console.log("Texto preenchido ✅");
    }

    await page.screenshot({ path: `${SS}/TC-S4-05_analise_textarea.png`, fullPage: true });
  });

  test("TC-S4-06: Análise — resultado da IA", async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    await irPara(page, "Recursos");
    await clicarAba(page, "Analise");

    // Selecionar edital
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const opts = await selects.first().locator('option').allTextContents();
      for (const o of opts) {
        if (o.includes("46/2026")) { await selects.first().selectOption({ label: o }); break; }
      }
    }

    // Preencher proposta e analisar
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill("Empresa XYZ venceu com Kit TTPA R$ 2,35. Sem ANVISA. Validade 12 meses contra 18 exigidos no edital.");
    }

    const btnAnalisar = page.locator('button:has-text("Analisar")').first();
    if (await btnAnalisar.isVisible().catch(() => false)) {
      await btnAnalisar.click();
      console.log("Análise acionada — aguardando IA...");
      await page.waitForTimeout(40000);
    }

    const bodyText = await page.textContent('body') || "";
    const hasResultado = bodyText.length > 1000; // IA gerou texto
    console.log(`Resultado IA: ${hasResultado ? "✅ (texto gerado)" : "⚠️"}`);

    await page.screenshot({ path: `${SS}/TC-S4-06_analise_resultado.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-S4-07: Aba Laudos — botões e modal
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-07: Aba Laudos — botões Novo Laudo e Upload", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");
    await clicarAba(page, "Laudos");

    const btnNovo = page.locator('button:has-text("Novo Laudo")');
    const btnUpload = page.locator('button:has-text("Upload")');
    console.log(`Botão Novo Laudo: ${await btnNovo.first().isVisible().catch(() => false) ? "✅" : "❌"}`);
    console.log(`Botão Upload: ${await btnUpload.first().isVisible().catch(() => false) ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/TC-S4-07_laudos_botoes.png`, fullPage: true });
  });

  test("TC-S4-08: Modal Novo Laudo — campos tipo/subtipo/template", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");
    await clicarAba(page, "Laudos");

    await page.locator('button:has-text("Novo Laudo")').first().click();
    await page.waitForTimeout(1000);

    // Verificar campos do modal
    const modalSelects = page.locator('.modal-overlay select');
    const cnt = await modalSelects.count();
    console.log(`Selects no modal Laudo: ${cnt}`);

    // Listar opções de cada select
    for (let i = 0; i < cnt; i++) {
      const opts = await modalSelects.nth(i).locator('option').allTextContents();
      console.log(`  Select ${i}: ${opts.join(', ')}`);
    }

    const bodyText = await page.textContent('body') || "";
    console.log(`Tem 'recurso': ${bodyText.toLowerCase().includes('recurso') ? "✅" : "❌"}`);
    console.log(`Tem 'contra': ${bodyText.toLowerCase().includes('contra') ? "✅" : "❌"}`);
    console.log(`Tem 'juridic': ${bodyText.toLowerCase().includes('juridic') || bodyText.toLowerCase().includes('jurídic') ? "✅" : "❌"}`);
    console.log(`Tem 'tecnic': ${bodyText.toLowerCase().includes('tecnic') || bodyText.toLowerCase().includes('técnic') ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/TC-S4-08_modal_novo_laudo.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-S4-09: Chatbox na aba Análise
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-09: Chatbox interativo na Análise", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");
    await clicarAba(page, "Analise");

    // Scroll para ver chatbox
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body') || "";
    const hasChatInput = bodyText.includes('Pergunte') || bodyText.includes('pergunte') || bodyText.includes('Enviar') || bodyText.includes('pergunta');
    console.log(`Chat input: ${hasChatInput ? "✅" : "⚠️"}`);

    // Procurar input de chat
    const chatInputs = page.locator('input[placeholder*="pergunt" i], input[placeholder*="chat" i], textarea[placeholder*="pergunt" i]');
    console.log(`Inputs de chat: ${await chatInputs.count()}`);

    await page.screenshot({ path: `${SS}/TC-S4-09_chatbox.png`, fullPage: true });
  });

  // ══════════════════════════════════════════════════════════════
  // TC-S4-10: Monitoramento status visual
  // ══════════════════════════════════════════════════════════════
  test("TC-S4-10: Monitoramento — status e botão ativar", async ({ page }) => {
    await login(page);
    await irPara(page, "Recursos");

    // Selecionar edital
    const selects = page.locator('select');
    const opts = await selects.first().locator('option').allTextContents();
    for (const o of opts) {
      if (o.includes("46/2026")) { await selects.first().selectOption({ label: o }); break; }
    }
    await page.waitForTimeout(1000);

    // Verificar status
    const bodyText = await page.textContent('body') || "";
    const hasInativo = bodyText.includes('Inativo');
    const hasAguardando = bodyText.includes('Aguardando');
    const hasAberta = bodyText.includes('ABERTA');
    console.log(`Status Inativo: ${hasInativo ? "✅" : "❌"}`);
    console.log(`Status Aguardando: ${hasAguardando ? "✅" : "❌"}`);

    // Clicar Ativar
    const btnAtivar = page.locator('button:has-text("Ativar Monitoramento")');
    if (await btnAtivar.isVisible().catch(() => false)) {
      await btnAtivar.click();
      await page.waitForTimeout(3000);
      console.log("Monitoramento ativado ✅");

      // Verificar se mudou
      const bodyAfter = await page.textContent('body') || "";
      const mudou = bodyAfter.includes('Aguardando') || bodyAfter.includes('Ativo') || bodyAfter.includes('ativo');
      console.log(`Status após ativar: ${mudou ? "✅ mudou" : "⚠️ não mudou visualmente"}`);
    }

    await page.screenshot({ path: `${SS}/TC-S4-10_monitoramento_status.png`, fullPage: true });
  });
});
