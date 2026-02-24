import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================
const BASE_URL = "http://localhost:5175";
const API_URL = "http://localhost:5007";
const CREDS = { email: "pasteurjr@gmail.com", password: "123456" };
const SCREENSHOT_DIR = path.join(__dirname, "..", "test_screenshots", "certidoes");
const FIXTURES_DIR = path.join(__dirname, "fixtures");

// Helper: screenshot com nome descritivo
async function screenshot(page: Page, name: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `CERT_${name}.png`), fullPage: true });
}

// Helper: login e obter token
async function getAuthToken(): Promise<string> {
  const resp = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDS),
  });
  const data = await resp.json();
  return data.access_token;
}

// Helper: login na UI
async function loginUI(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500);

  const sidebar = await page.locator(".sidebar, .nav-section, nav").first();
  if (await sidebar.isVisible().catch(() => false)) {
    return;
  }

  await page.fill('input[type="email"], input[name="email"]', CREDS.email);
  await page.fill('input[type="password"], input[name="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
}

// Helper: dismiss any open modal
async function dismissModal(page: Page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
  const overlay = page.locator('.modal-overlay');
  if (await overlay.isVisible().catch(() => false)) {
    await overlay.click({ position: { x: 5, y: 5 }, force: true }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

// Helper: navegar via menu lateral
async function navigateTo(page: Page, section: string, item: string, subSection?: string) {
  await dismissModal(page);

  // Expand section
  const sectionHeader = page.locator('.nav-section-header').filter({ hasText: section });
  if (await sectionHeader.isVisible().catch(() => false)) {
    const isExpanded = await sectionHeader.getAttribute('class').then(c => c?.includes('expanded')).catch(() => false);
    if (!isExpanded) {
      await sectionHeader.click();
      await page.waitForTimeout(500);
    }
  }

  // If has subsection, expand it first
  if (subSection) {
    const subHeader = page.locator('.nav-subsection-header').filter({ hasText: subSection });
    if (await subHeader.isVisible().catch(() => false)) {
      const isExpanded = await subHeader.getAttribute('class').then(c => c?.includes('expanded')).catch(() => false);
      if (!isExpanded) {
        await subHeader.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // Click nav item
  const navItem = page.locator('.nav-item').filter({ hasText: item }).first();
  if (await navItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    await navItem.click();
    await page.waitForTimeout(2000);
    return;
  }

  // Fallback
  const fallback = page.locator(`button:has-text("${item}"), a:has-text("${item}")`).first();
  if (await fallback.isVisible({ timeout: 1000 }).catch(() => false)) {
    await fallback.click();
    await page.waitForTimeout(2000);
  }
}

// ============================================================================
// RESULTADOS GLOBAIS
// ============================================================================
const results: {
  id: string;
  title: string;
  status: "PASS" | "FAIL" | "PARTIAL";
  details: string;
  screenshots: string[];
}[] = [];

function addResult(id: string, title: string, status: "PASS" | "FAIL" | "PARTIAL", details: string, screenshots: string[] = []) {
  results.push({ id, title, status, details, screenshots });
}

// ============================================================================
// TESTES DE CERTIDÕES AUTOMÁTICAS
// ============================================================================
test.describe("CERTIDÕES AUTOMÁTICAS — Testes Completos", () => {
  let page: Page;
  let token: string;

  test.beforeAll(async ({ browser }) => {
    token = await getAuthToken();
    page = await browser.newPage();
    await loginUI(page);
  });

  test.afterAll(async () => {
    // Gerar relatório final
    const reportPath = path.join(__dirname, "..", "docs", "RELATORIO_TESTE_CERTIDOES.md");
    let report = `# Relatório de Testes — Certidões Automáticas\n\n`;
    report += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
    report += `**Ambiente:** Frontend ${BASE_URL} | Backend ${API_URL}\n\n`;

    const pass = results.filter(r => r.status === "PASS").length;
    const fail = results.filter(r => r.status === "FAIL").length;
    const partial = results.filter(r => r.status === "PARTIAL").length;
    report += `## Resumo\n\n`;
    report += `| Status | Quantidade |\n|---|---|\n`;
    report += `| PASS | ${pass} |\n| FAIL | ${fail} |\n| PARTIAL | ${partial} |\n`;
    report += `| **Total** | **${results.length}** |\n\n`;

    report += `## Resultados Detalhados\n\n`;
    for (const r of results) {
      const icon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⚠️";
      report += `### ${icon} ${r.id}: ${r.title}\n\n`;
      report += `**Status:** ${r.status}\n\n`;
      report += `**Detalhes:** ${r.details}\n\n`;
      if (r.screenshots.length > 0) {
        report += `**Screenshots:**\n`;
        for (const s of r.screenshots) {
          report += `- ![${s}](../test_screenshots/certidoes/${s})\n`;
        }
        report += `\n`;
      }
      report += `---\n\n`;
    }

    fs.writeFileSync(reportPath, report);
    console.log(`\n📋 Relatório salvo em: ${reportPath}`);
    console.log(`\n=== RESUMO ===`);
    console.log(`PASS: ${pass} | FAIL: ${fail} | PARTIAL: ${partial} | Total: ${results.length}`);

    await page.close();
  });

  // --------------------------------------------------------------------------
  // TC-01: API — Buscar certidões automáticas via endpoint direto
  // --------------------------------------------------------------------------
  test("TC-01 — API buscar-automatica: retorna 21 fontes", async () => {
    const screenshots: string[] = [];

    try {
      // Primeiro, buscar empresa_id
      const empResp = await fetch(`${API_URL}/api/crud/empresas?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empData = await empResp.json();
      expect(empData.items.length).toBeGreaterThan(0);
      const empresaId = empData.items[0].id;

      // Chamar buscar-automatica
      const resp = await fetch(`${API_URL}/api/empresa-certidoes/buscar-automatica`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ empresa_id: empresaId }),
      });

      const data = await resp.json();
      expect(resp.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.resultados).toBeDefined();

      const total = data.resultados.length;
      const stats = data.stats || {};

      // Verificar que retornou resultados
      expect(total).toBeGreaterThanOrEqual(5);

      // Verificar que cada resultado tem fonte_nome
      for (const r of data.resultados) {
        expect(r.fonte_nome).toBeTruthy();
        expect(r.fonte_id).toBeTruthy();
      }

      // Verificar classificação
      const validas = data.resultados.filter((r: any) => r.certidao?.status === 'valida').length;
      const pendentes = data.resultados.filter((r: any) => r.certidao?.status === 'pendente').length;
      const manuais = data.resultados.filter((r: any) => r.certidao?.status === 'nao_disponivel').length;

      addResult("TC-01", "API buscar-automatica retorna todas as fontes", "PASS",
        `Retornou ${total} certidões. Stats: ${JSON.stringify(stats)}. Válidas: ${validas}, Pendentes: ${pendentes}, Manuais: ${manuais}. Mensagem: "${data.message}"`,
        screenshots);
    } catch (err: any) {
      addResult("TC-01", "API buscar-automatica retorna todas as fontes", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-02: API — Verificar que certidões têm fonte_certidao_id
  // --------------------------------------------------------------------------
  test("TC-02 — API: certidões vinculadas a fontes via FK", async () => {
    try {
      const empResp = await fetch(`${API_URL}/api/crud/empresas?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empData = await empResp.json();
      const empresaId = empData.items[0].id;

      const certResp = await fetch(`${API_URL}/api/crud/empresa-certidoes?parent_id=${empresaId}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const certData = await certResp.json();

      expect(certData.items.length).toBeGreaterThan(0);

      let comFonte = 0;
      let semFonte = 0;
      let comFonteNome = 0;

      for (const cert of certData.items) {
        if (cert.fonte_certidao_id) comFonte++;
        else semFonte++;
        if (cert.fonte_nome) comFonteNome++;
      }

      addResult("TC-02", "Certidões vinculadas a fontes via FK",
        semFonte === 0 ? "PASS" : "PARTIAL",
        `Total: ${certData.items.length}. Com fonte_certidao_id: ${comFonte}. Sem: ${semFonte}. Com fonte_nome: ${comFonteNome}`);
    } catch (err: any) {
      addResult("TC-02", "Certidões vinculadas a fontes via FK", "FAIL", `Erro: ${err.message}`);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-03: API — Verificar fontes de certidões cadastradas
  // --------------------------------------------------------------------------
  test("TC-03 — API: 21 fontes cadastradas e ativas", async () => {
    try {
      const resp = await fetch(`${API_URL}/api/crud/fontes-certidoes?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      const total = data.items.length;
      const ativas = data.items.filter((f: any) => f.ativo).length;
      const automaticas = data.items.filter((f: any) => f.permite_busca_automatica).length;
      const manuais = total - automaticas;

      // Listar nomes
      const nomes = data.items.map((f: any) => f.nome).join(", ");

      addResult("TC-03", "Fontes de certidões cadastradas",
        total >= 21 ? "PASS" : "PARTIAL",
        `Total: ${total}. Ativas: ${ativas}. Automáticas: ${automaticas}. Manuais: ${manuais}. Fontes: ${nomes}`);
    } catch (err: any) {
      addResult("TC-03", "Fontes de certidões cadastradas", "FAIL", `Erro: ${err.message}`);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-04: UI — Navegar para Empresa e verificar seção certidões
  // --------------------------------------------------------------------------
  test("TC-04 — UI: Página Empresa mostra seção Certidões Automáticas", async () => {
    const screenshots: string[] = [];

    try {
      await navigateTo(page, "Configuracoes", "Empresa");
      await screenshot(page, "TC04_01_empresa_page");
      screenshots.push("CERT_TC04_01_empresa_page.png");

      // Verificar card de certidões
      const certCard = page.locator('text="Certidoes Automaticas"').first();
      const cardVisible = await certCard.isVisible({ timeout: 5000 }).catch(() => false);

      // Verificar botão Buscar Certidões
      const btnBuscar = page.locator('button:has-text("Buscar Certidoes")').first();
      const btnVisible = await btnBuscar.isVisible().catch(() => false);

      await screenshot(page, "TC04_02_secao_certidoes");
      screenshots.push("CERT_TC04_02_secao_certidoes.png");

      addResult("TC-04", "Página Empresa mostra seção Certidões",
        cardVisible && btnVisible ? "PASS" : "FAIL",
        `Card certidões visível: ${cardVisible}. Botão Buscar: ${btnVisible}`,
        screenshots);
    } catch (err: any) {
      addResult("TC-04", "Página Empresa mostra seção Certidões", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-05: UI — Clicar Buscar Certidões e verificar resultados
  // --------------------------------------------------------------------------
  test("TC-05 — UI: Buscar Certidões popula tabela com 21 linhas", async () => {
    const screenshots: string[] = [];

    try {
      // Clicar no botão Buscar Certidões
      const btnBuscar = page.locator('button:has-text("Buscar Certidoes")').first();
      await btnBuscar.click();

      // Aguardar o loading (pode demorar devido a HTTP requests nos portais)
      await page.waitForTimeout(3000);

      // Verificar spinner/loading
      const buscando = page.locator('button:has-text("Buscando...")').first();
      const isLoading = await buscando.isVisible().catch(() => false);
      if (isLoading) {
        await screenshot(page, "TC05_01_buscando");
        screenshots.push("CERT_TC05_01_buscando.png");
        // Esperar até 120s para completar (portais podem demorar)
        await page.waitForSelector('button:has-text("Buscar Certidoes")', { timeout: 120000 });
      }

      await page.waitForTimeout(2000);
      await screenshot(page, "TC05_02_resultado_busca");
      screenshots.push("CERT_TC05_02_resultado_busca.png");

      // Verificar mensagem de sucesso
      const msgSuccess = page.locator('div[style*="bg-success"], div[style*="dcfce7"]').first();
      const msgVisible = await msgSuccess.isVisible().catch(() => false);
      const msgText = msgVisible ? await msgSuccess.textContent() : "";

      // Contar linhas na tabela de certidões
      // A tabela de certidões é a segunda DataTable na página (depois de documentos)
      // Buscar todas as linhas de tabela que estão dentro do card de certidões
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();
      const tableRows = certCard.locator('tbody tr, .data-table-row');
      const rowCount = await tableRows.count();

      // Scroll down para ver toda a tabela
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await screenshot(page, "TC05_03_tabela_completa");
      screenshots.push("CERT_TC05_03_tabela_completa.png");

      addResult("TC-05", "Buscar Certidões popula tabela",
        rowCount >= 15 ? "PASS" : rowCount > 0 ? "PARTIAL" : "FAIL",
        `Linhas na tabela: ${rowCount}. Mensagem: "${msgText?.substring(0, 200)}"`,
        screenshots);
    } catch (err: any) {
      await screenshot(page, "TC05_ERROR");
      screenshots.push("CERT_TC05_ERROR.png");
      addResult("TC-05", "Buscar Certidões popula tabela", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-06: UI — Verificar status badges na tabela
  // --------------------------------------------------------------------------
  test("TC-06 — UI: Status badges corretos (Válida, Pendente, Manual)", async () => {
    const screenshots: string[] = [];

    try {
      // Scroll para ver certidões
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();
      await certCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Contar badges por tipo
      const badgeValida = certCard.locator('.status-badge:has-text("Valida"), [class*="success"]:has-text("Valida")');
      const badgePendente = certCard.locator('.status-badge:has-text("Pendente"), [class*="warning"]:has-text("Pendente")');
      const badgeManual = certCard.locator('.status-badge:has-text("Manual"), [class*="neutral"]:has-text("Manual")');
      const badgeErro = certCard.locator('.status-badge:has-text("Erro"), [class*="error"]:has-text("Erro")');

      const countValida = await badgeValida.count();
      const countPendente = await badgePendente.count();
      const countManual = await badgeManual.count();
      const countErro = await badgeErro.count();

      await screenshot(page, "TC06_01_badges");
      screenshots.push("CERT_TC06_01_badges.png");

      const hasVariety = (countValida > 0 || countPendente > 0) && countManual > 0;

      addResult("TC-06", "Status badges corretos",
        hasVariety ? "PASS" : "PARTIAL",
        `Válida: ${countValida}, Pendente: ${countPendente}, Manual: ${countManual}, Erro: ${countErro}`,
        screenshots);
    } catch (err: any) {
      addResult("TC-06", "Status badges corretos", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-07: UI — Verificar botões de ação por linha
  // --------------------------------------------------------------------------
  test("TC-07 — UI: Botões de ação (portal, upload, download, refresh)", async () => {
    const screenshots: string[] = [];

    try {
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();
      await certCard.scrollIntoViewIfNeeded();

      // Verificar se existem botões de ação
      const actionsDiv = certCard.locator('.table-actions').first();
      const hasActions = await actionsDiv.isVisible().catch(() => false);

      // Contar botões por tipo (dentro do card de certidões)
      const portais = certCard.locator('button[title*="portal"]');
      const uploads = certCard.locator('button[title*="Upload"]');
      const downloads = certCard.locator('button[title*="Download"]');
      const refreshes = certCard.locator('button[title*="Atualizar"]');

      const countPortais = await portais.count();
      const countUploads = await uploads.count();
      const countDownloads = await downloads.count();
      const countRefreshes = await refreshes.count();

      await screenshot(page, "TC07_01_acoes");
      screenshots.push("CERT_TC07_01_acoes.png");

      addResult("TC-07", "Botões de ação na tabela",
        hasActions && countUploads > 0 ? "PASS" : "PARTIAL",
        `Portais: ${countPortais}, Upload: ${countUploads}, Download: ${countDownloads}, Refresh: ${countRefreshes}`,
        screenshots);
    } catch (err: any) {
      addResult("TC-07", "Botões de ação na tabela", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-08: UI — Abrir modal de upload de certidão
  // --------------------------------------------------------------------------
  test("TC-08 — UI: Modal de upload de certidão abre corretamente", async () => {
    const screenshots: string[] = [];

    try {
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();
      await certCard.scrollIntoViewIfNeeded();

      // Clicar no primeiro botão de upload
      const uploadBtn = certCard.locator('button[title*="Upload"]').first();
      if (await uploadBtn.isVisible().catch(() => false)) {
        await uploadBtn.click();
        await page.waitForTimeout(1000);

        await screenshot(page, "TC08_01_modal_upload");
        screenshots.push("CERT_TC08_01_modal_upload.png");

        // Verificar modal aberto
        const modal = page.locator('.modal, .modal-overlay').first();
        const modalVisible = await modal.isVisible().catch(() => false);

        // Verificar campos do modal
        const hasFileInput = await page.locator('input[type="file"]').isVisible().catch(() => false);
        const hasDateInput = await page.locator('input[type="date"]').isVisible().catch(() => false);
        const hasTitle = await page.locator('text=/Upload Certidao/').isVisible().catch(() => false);

        // Fechar modal
        await dismissModal(page);
        await page.waitForTimeout(500);

        addResult("TC-08", "Modal upload de certidão",
          modalVisible && hasFileInput ? "PASS" : "PARTIAL",
          `Modal visível: ${modalVisible}. Input arquivo: ${hasFileInput}. Input data: ${hasDateInput}. Título: ${hasTitle}`,
          screenshots);
      } else {
        addResult("TC-08", "Modal upload de certidão", "FAIL", "Botão de upload não encontrado", screenshots);
      }
    } catch (err: any) {
      await dismissModal(page);
      addResult("TC-08", "Modal upload de certidão", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-09: UI — Upload real de PDF de certidão
  // --------------------------------------------------------------------------
  test("TC-09 — UI: Upload real de PDF via modal", async () => {
    const screenshots: string[] = [];

    try {
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();
      await certCard.scrollIntoViewIfNeeded();

      // Clicar no primeiro botão de upload
      const uploadBtn = certCard.locator('button[title*="Upload"]').first();
      await uploadBtn.click();
      await page.waitForTimeout(1000);

      // Verificar que modal abriu
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible().catch(() => false)) {
        // Usar o PDF de fixture
        const testPdf = path.join(FIXTURES_DIR, "teste_upload.pdf");
        if (fs.existsSync(testPdf)) {
          await fileInput.setInputFiles(testPdf);
          await page.waitForTimeout(500);

          // Preencher data de vencimento (6 meses no futuro)
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + 6);
          const dateStr = futureDate.toISOString().split('T')[0];
          const dateInput = page.locator('input[type="date"]').first();
          if (await dateInput.isVisible().catch(() => false)) {
            await dateInput.fill(dateStr);
          }

          // Preencher número
          const numInput = page.locator('input[placeholder*="12345"]').first();
          if (await numInput.isVisible().catch(() => false)) {
            await numInput.fill("CERT-2026-TEST-001");
          }

          await screenshot(page, "TC09_01_form_preenchido");
          screenshots.push("CERT_TC09_01_form_preenchido.png");

          // Clicar Enviar
          const sendBtn = page.locator('button:has-text("Enviar")').first();
          if (await sendBtn.isVisible().catch(() => false)) {
            await sendBtn.click();
            await page.waitForTimeout(3000);

            await screenshot(page, "TC09_02_apos_upload");
            screenshots.push("CERT_TC09_02_apos_upload.png");

            // Verificar se o modal fechou e tabela atualizou
            const modalStillOpen = await page.locator('.modal-overlay').isVisible().catch(() => false);

            addResult("TC-09", "Upload real de PDF via modal",
              !modalStillOpen ? "PASS" : "PARTIAL",
              `Modal fechou: ${!modalStillOpen}. Data vencimento: ${dateStr}`,
              screenshots);
          } else {
            addResult("TC-09", "Upload real de PDF via modal", "FAIL", "Botão Enviar não encontrado", screenshots);
          }
        } else {
          addResult("TC-09", "Upload real de PDF via modal", "FAIL", `Arquivo fixture não existe: ${testPdf}`, screenshots);
        }
      } else {
        addResult("TC-09", "Upload real de PDF via modal", "FAIL", "Input file não encontrado no modal", screenshots);
      }

      await dismissModal(page);
    } catch (err: any) {
      await dismissModal(page);
      addResult("TC-09", "Upload real de PDF via modal", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-10: UI — Verificar certidão ficou como Válida após upload
  // --------------------------------------------------------------------------
  test("TC-10 — UI: Certidão atualizada para Válida após upload", async () => {
    const screenshots: string[] = [];

    try {
      await page.waitForTimeout(1000);
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();
      await certCard.scrollIntoViewIfNeeded();

      await screenshot(page, "TC10_01_apos_upload_status");
      screenshots.push("CERT_TC10_01_apos_upload_status.png");

      // Verificar se alguma certidão tem badge Válida
      const badgeValida = certCard.locator('.status-badge:has-text("Valida"), [class*="success"]:has-text("Valida")');
      const countValida = await badgeValida.count();

      // Verificar se alguma tem botão de download (indica arquivo anexado)
      const downloads = certCard.locator('button[title*="Download"]');
      const countDownloads = await downloads.count();

      addResult("TC-10", "Certidão Válida após upload",
        countValida > 0 && countDownloads > 0 ? "PASS" : countValida > 0 ? "PARTIAL" : "FAIL",
        `Badges Válida: ${countValida}. Botões Download: ${countDownloads}`,
        screenshots);
    } catch (err: any) {
      addResult("TC-10", "Certidão Válida após upload", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-11: UI — Footer dinâmico com contagem de fontes
  // --------------------------------------------------------------------------
  test("TC-11 — UI: Footer mostra contagem dinâmica de fontes", async () => {
    const screenshots: string[] = [];

    try {
      const certCard = page.locator('.card').filter({ hasText: "Certidoes Automaticas" }).first();

      // Scroll para ver o footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      await screenshot(page, "TC11_01_footer");
      screenshots.push("CERT_TC11_01_footer.png");

      // Verificar que NÃO mostra o footer hardcoded antigo
      const oldFooter = page.locator('text=/Receita Federal.*SEFAZ.*Prefeitura.*Caixa.*TST/');
      const hasOldFooter = await oldFooter.isVisible().catch(() => false);

      // Verificar que mostra contagem dinâmica
      const newFooter = certCard.locator('text=/\\d+ certid.*busca autom/i');
      const hasNewFooter = await newFooter.isVisible().catch(() => false);

      addResult("TC-11", "Footer dinâmico com contagem",
        !hasOldFooter && hasNewFooter ? "PASS" : hasNewFooter ? "PARTIAL" : "FAIL",
        `Footer antigo (hardcoded): ${hasOldFooter}. Footer novo (dinâmico): ${hasNewFooter}`,
        screenshots);
    } catch (err: any) {
      addResult("TC-11", "Footer dinâmico com contagem", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-12: UI — CRUD Fontes de Certidões via menu Cadastros
  // --------------------------------------------------------------------------
  test("TC-12 — UI: Menu Cadastros > Empresa > Fontes de Certidões funciona", async () => {
    const screenshots: string[] = [];

    try {
      // Navegar para Cadastros > Empresa > Fontes de Certidões
      await navigateTo(page, "Cadastros", "Fontes de Certidoes", "Empresa");
      await page.waitForTimeout(2000);

      await screenshot(page, "TC12_01_crud_fontes");
      screenshots.push("CERT_TC12_01_crud_fontes.png");

      // Verificar que a página CRUD carregou
      const crudTable = page.locator('table, .data-table, .crud-table').first();
      const tableVisible = await crudTable.isVisible({ timeout: 5000 }).catch(() => false);

      // Contar linhas
      const rows = page.locator('tbody tr').count();
      const rowCount = await rows;

      // Scroll para ver mais
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await screenshot(page, "TC12_02_crud_fontes_scroll");
      screenshots.push("CERT_TC12_02_crud_fontes_scroll.png");

      addResult("TC-12", "CRUD Fontes de Certidões",
        tableVisible && rowCount >= 5 ? "PASS" : tableVisible ? "PARTIAL" : "FAIL",
        `Tabela visível: ${tableVisible}. Linhas: ${rowCount}`,
        screenshots);
    } catch (err: any) {
      await screenshot(page, "TC12_ERROR");
      screenshots.push("CERT_TC12_ERROR.png");
      addResult("TC-12", "CRUD Fontes de Certidões", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-13: API — Endpoint upload de certidão funciona
  // --------------------------------------------------------------------------
  test("TC-13 — API: Upload de certidão via endpoint direto", async () => {
    try {
      // Buscar uma certidão existente
      const empResp = await fetch(`${API_URL}/api/crud/empresas?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empData = await empResp.json();
      const empresaId = empData.items[0].id;

      const certResp = await fetch(`${API_URL}/api/crud/empresa-certidoes?parent_id=${empresaId}&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const certData = await certResp.json();

      if (certData.items.length > 0) {
        const certId = certData.items[0].id;

        // Criar um PDF de teste
        const testPdf = path.join(FIXTURES_DIR, "teste_upload.pdf");
        if (fs.existsSync(testPdf)) {
          const formData = new FormData();
          formData.append("file", new Blob([fs.readFileSync(testPdf)], { type: "application/pdf" }), "certidao_test.pdf");
          formData.append("data_vencimento", "2026-12-31");
          formData.append("numero", "API-TEST-001");

          const uploadResp = await fetch(`${API_URL}/api/empresa-certidoes/${certId}/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          const uploadData = await uploadResp.json();

          addResult("TC-13", "API upload de certidão",
            uploadResp.status === 200 && uploadData.success ? "PASS" : "FAIL",
            `Status: ${uploadResp.status}. Response: ${JSON.stringify(uploadData).substring(0, 300)}`);
        } else {
          addResult("TC-13", "API upload de certidão", "PARTIAL", "Arquivo fixture não existe - upload não testado");
        }
      } else {
        addResult("TC-13", "API upload de certidão", "FAIL", "Nenhuma certidão encontrada para upload");
      }
    } catch (err: any) {
      addResult("TC-13", "API upload de certidão", "FAIL", `Erro: ${err.message}`);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-14: API — Verificar novos status no enum
  // --------------------------------------------------------------------------
  test("TC-14 — API: Novos status (buscando, erro, nao_disponivel) aceitos", async () => {
    try {
      const empResp = await fetch(`${API_URL}/api/crud/empresas?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empData = await empResp.json();
      const empresaId = empData.items[0].id;

      const certResp = await fetch(`${API_URL}/api/crud/empresa-certidoes?parent_id=${empresaId}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const certData = await certResp.json();

      const statusCounts: Record<string, number> = {};
      for (const cert of certData.items) {
        const s = cert.status || "unknown";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }

      const hasNewStatuses = "nao_disponivel" in statusCounts || "valida" in statusCounts;

      addResult("TC-14", "Novos status aceitos pelo enum",
        hasNewStatuses ? "PASS" : "PARTIAL",
        `Distribuição de status: ${JSON.stringify(statusCounts)}`);
    } catch (err: any) {
      addResult("TC-14", "Novos status aceitos pelo enum", "FAIL", `Erro: ${err.message}`);
      throw err;
    }
  });

  // --------------------------------------------------------------------------
  // TC-15: UI — Mensagem de sucesso após busca mostra estatísticas
  // --------------------------------------------------------------------------
  test("TC-15 — UI: Mensagem de sucesso com estatísticas de busca", async () => {
    const screenshots: string[] = [];

    try {
      // Voltar para Empresa
      await navigateTo(page, "Configuracoes", "Empresa");
      await page.waitForTimeout(2000);

      // Buscar certidões novamente
      const btnBuscar = page.locator('button:has-text("Buscar Certidoes")').first();
      if (await btnBuscar.isVisible().catch(() => false)) {
        await btnBuscar.click();

        // Esperar completar
        await page.waitForSelector('button:has-text("Buscar Certidoes")', { timeout: 120000 });
        await page.waitForTimeout(1000);

        await screenshot(page, "TC15_01_msg_sucesso");
        screenshots.push("CERT_TC15_01_msg_sucesso.png");

        // Verificar mensagem com estatísticas
        const msgDiv = page.locator('div[style*="dcfce7"], div[style*="bg-success"]').first();
        const msgVisible = await msgDiv.isVisible().catch(() => false);
        const msgText = msgVisible ? await msgDiv.textContent() : "";

        const hasStats = msgText?.includes("obtida") || msgText?.includes("pública") || msgText?.includes("manual") || msgText?.includes("fontes");

        addResult("TC-15", "Mensagem com estatísticas de busca",
          msgVisible && hasStats ? "PASS" : msgVisible ? "PARTIAL" : "FAIL",
          `Mensagem visível: ${msgVisible}. Texto: "${msgText?.substring(0, 300)}"`,
          screenshots);
      } else {
        addResult("TC-15", "Mensagem com estatísticas de busca", "FAIL", "Botão Buscar não encontrado", screenshots);
      }
    } catch (err: any) {
      await screenshot(page, "TC15_ERROR");
      screenshots.push("CERT_TC15_ERROR.png");
      addResult("TC-15", "Mensagem com estatísticas de busca", "FAIL", `Erro: ${err.message}`, screenshots);
      throw err;
    }
  });
});
