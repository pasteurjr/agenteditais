import { test, expect } from "@playwright/test";
import { login, navTo, getBody, assertDataVisible } from "../helpers";

const SS = (step: string) => `runtime/screenshots/sprint6-smtp/${step}.png`;

test.describe("Sprint 6 — SMTP (UC-SM01..SM03)", () => {
  test.setTimeout(120000);

  test("UC-SM01 — Config SMTP com seguranca e status conexao", async ({ page }) => {
    await login(page);
    await navTo(page, "SMTP");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("SM01_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Configuracao SMTP");

    // Dados seed
    const temHost = body.includes("smtp.empresa.com.br") || body.includes("HOST");
    expect(temHost).toBeTruthy();
    expect(body).toContain("587");
    expect(body).toContain("alertas@empresa.com.br");
    expect(body).toContain("Sistema Argus");
    expect(body).toContain("DRY-RUN");

    // Seguranca (TLS/SSL/Nenhuma) — mostrado como label
    const temSeg = body.includes("Seguranca") || body.includes("TLS") || body.includes("Sim");
    expect(temSeg).toBeTruthy();

    // Ultima atualizacao visivel (CSS uppercase)
    const temAtualizacao = body.includes("Ultima atualizacao") || body.includes("ULTIMA ATUALIZACAO");
    expect(temAtualizacao).toBeTruthy();

    // Botoes
    await expect(page.locator('button:has-text("Testar Conexao"), button:has-text("Testar SMTP")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Editar")')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: SS("SM01_resp"), fullPage: true });
  });

  test("UC-SM02 — Tab Templates com versao, ultima edicao e preview no modal", async ({ page }) => {
    await login(page);
    await navTo(page, "SMTP");
    await page.waitForTimeout(2000);

    const templatesBtn = page.locator('button:has-text("Templates")');
    await expect(templatesBtn).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: SS("SM02_acao"), fullPage: true });
    await templatesBtn.click();
    await page.waitForTimeout(2000);

    const body = await getBody(page);
    expect(body).toContain("Templates de Email");

    // Colunas incluindo Versao e Ultima Edicao
    await assertDataVisible(page, { anyText: ["SLUG", "NOME", "ASSUNTO", "VERSAO"], minCount: 3 });

    // 4 slugs do seed
    let slugsOk = 0;
    for (const s of ["alerta-edital", "certidao-vencida", "contrato-vencimento", "monitoramento-encontrado"]) {
      if (body.includes(s)) slugsOk++;
    }
    expect(slugsOk).toBeGreaterThanOrEqual(4);

    // Nomes
    expect(body).toContain("Alerta de Edital");
    const temCertidao = body.includes("Certidao Vencida") || body.includes("Certidão Vencida");
    expect(temCertidao).toBeTruthy();
    expect(body).toContain("Contrato a Vencer");
    expect(body).toContain("Monitoramento Encontrado");

    // Badges de versao (v1)
    const versaoBadges = page.locator('.status-badge:has-text("v1")');
    expect(await versaoBadges.count()).toBeGreaterThanOrEqual(4);

    // >= 4 linhas
    expect(await page.locator('.data-table tbody tr').count()).toBeGreaterThanOrEqual(4);

    // >= 4 botoes Editar
    expect(await page.locator('.data-table button:has-text("Editar")').count()).toBeGreaterThanOrEqual(4);

    // Abrir modal de edicao do primeiro template
    await page.locator('.data-table button:has-text("Editar")').first().click();
    await page.waitForTimeout(1000);

    const bodyModal = await getBody(page);
    expect(bodyModal).toContain("Editar Template");

    // Preview panel
    expect(bodyModal).toContain("Preview");

    // Botao Salvar Nova Versao
    await expect(page.locator('button:has-text("Salvar Nova Versao")')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: SS("SM02_resp"), fullPage: true });
  });

  test("UC-SM03 — Tab Fila de Envio com filtros, taxa sucesso e modal detalhes", async ({ page }) => {
    await login(page);
    await navTo(page, "SMTP");
    await page.waitForTimeout(2000);

    const filaBtn = page.locator('button:has-text("Fila de Envio")');
    await expect(filaBtn).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: SS("SM03_acao"), fullPage: true });
    await filaBtn.click();
    await page.waitForTimeout(2000);

    const body = await getBody(page);

    // Stat cards incluindo Taxa Sucesso
    expect(body).toContain("Resumo da Fila");
    expect(body).toContain("Pendentes");
    expect(body).toContain("Enviados");
    expect(body).toContain("Falhados");
    expect(body).toContain("Taxa Sucesso");

    // Falhados >= 2
    const falhadosCard = page.locator('.stat-card:has(.stat-label:text("Falhados")) .stat-value');
    expect(parseInt(await falhadosCard.innerText().catch(() => "0"))).toBeGreaterThanOrEqual(2);

    // Total >= 6
    const pVal = parseInt(await page.locator('.stat-card:has(.stat-label:text("Pendentes")) .stat-value').innerText().catch(() => "0"));
    const eVal = parseInt(await page.locator('.stat-card:has(.stat-label:text("Enviados")) .stat-value').innerText().catch(() => "0"));
    const fVal = parseInt(await falhadosCard.innerText().catch(() => "0"));
    expect(pVal + eVal + fVal).toBeGreaterThanOrEqual(6);

    // Filtros
    expect(body).toContain("Filtros");

    // Tabela com >= 6 linhas
    expect(await page.locator('.data-table tbody tr').count()).toBeGreaterThanOrEqual(6);

    // Coluna Ultima Mensagem
    await assertDataVisible(page, { anyText: ["DESTINATARIO", "STATUS", "ULTIMA MENSAGEM"], minCount: 2 });

    // Destinatario do seed
    expect(body).toContain("valida1@valida.com.br");

    // Botoes Reenviar >= 2 e Ver detalhes
    expect(await page.locator('button:has-text("Reenviar")').count()).toBeGreaterThanOrEqual(2);

    // Abrir modal detalhes do primeiro email
    const eyeBtn = page.locator('button[title="Ver detalhes"]').first();
    await eyeBtn.click();
    await page.waitForTimeout(1000);

    const bodyModal = await getBody(page);
    expect(bodyModal).toContain("Detalhes do Email");
    expect(bodyModal).toContain("Destinatario");
    expect(bodyModal).toContain("Assunto");

    await page.screenshot({ path: SS("SM03_resp"), fullPage: true });
  });
});
