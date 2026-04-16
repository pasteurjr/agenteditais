import { test, expect } from "@playwright/test";
import { login, navTo, getBody, assertDataVisible } from "./helpers";

const SS = (step: string) => `runtime/screenshots/sprint6-auditoria/${step}.png`;

test.describe("Sprint 6 — Auditoria (UC-AU01..AU03)", () => {
  test.setTimeout(120000);

  test("UC-AU01 — Tab Consultar com filtros usuario e diff visual no modal", async ({ page }) => {
    await login(page);
    await navTo(page, "Auditoria");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("AU01_acao"), fullPage: true });

    const body = await getBody(page);

    // Tabs
    expect(body).toContain("Consultar");
    expect(body).toContain("Alteracoes Sensiveis");
    expect(body).toContain("Exportar Compliance");

    // Filtros incluindo Usuario
    expect(body).toContain("Filtros");
    expect(body).toContain("Entidade");
    expect(body).toContain("Usuario");
    expect(body).toContain("Periodo");

    // Registros
    const registrosMatch = body.match(/Registros\s*\((\d+)\)/);
    expect(registrosMatch).toBeTruthy();
    expect(parseInt(registrosMatch![1])).toBeGreaterThanOrEqual(10);

    // Colunas
    await assertDataVisible(page, { anyText: ["ACAO", "ENTIDADE", "IP"], minCount: 2 });

    // Acoes do seed
    let acoesOk = 0;
    for (const a of ["create", "update", "delete", "login"]) {
      if (body.toLowerCase().includes(a)) acoesOk++;
    }
    expect(acoesOk).toBeGreaterThanOrEqual(3);

    // Filtrar por acao "update" para garantir log com user_agent e diff
    const acaoSelect = page.locator('select.select-input').first();
    await acaoSelect.selectOption("update");
    await page.waitForTimeout(1000);

    // Abrir modal de detalhe
    const eyeBtn = page.locator('button[title="Ver detalhes"]').first();
    await eyeBtn.click();
    await page.waitForTimeout(1000);

    const bodyModal = await getBody(page);
    expect(bodyModal).toContain("Detalhes da Alteracao");
    expect(bodyModal).toContain("User-Agent");
    expect(bodyModal).toContain("Alteracoes");

    // Diff visual — tabela com Antes/Depois
    expect(bodyModal).toContain("Campo");
    expect(bodyModal).toContain("Antes");
    expect(bodyModal).toContain("Depois");

    // Botao Copiar JSON
    const copyBtn = page.locator('button:has-text("Copiar JSON")');
    expect(await copyBtn.count()).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: SS("AU01_resp"), fullPage: true });
  });

  test("UC-AU02 — Tab Alteracoes Sensiveis com stat cards e colunas enriquecidas", async ({ page }) => {
    await login(page);
    await navTo(page, "Auditoria");
    await page.waitForTimeout(2000);

    const sensiveisBtn = page.locator('button:has-text("Alteracoes Sensiveis")');
    await expect(sensiveisBtn).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: SS("AU02_acao"), fullPage: true });
    await sensiveisBtn.click();
    await page.waitForTimeout(2000);

    const body = await getBody(page);

    // Stat cards sensiveis
    expect(body).toContain("Total Sensiveis");
    expect(body).toContain("Ultimos 7 dias");
    expect(body).toContain("Usuarios Distintos");

    // Stat card valor >= 3
    const totalCard = page.locator('.stat-card:has(.stat-label:text("Total Sensiveis")) .stat-value');
    const totalVal = await totalCard.innerText().catch(() => "0");
    expect(parseInt(totalVal)).toBeGreaterThanOrEqual(3);

    // Colunas enriquecidas
    await assertDataVisible(page, { anyText: ["CAMPO ALTERADO", "ANTES", "DEPOIS"], minCount: 2 });

    // Entidades sensiveis presentes
    let entOk = 0;
    for (const e of ["smtp-config", "users", "parametros-score"]) {
      if (body.toLowerCase().includes(e)) entOk++;
    }
    expect(entOk).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: SS("AU02_resp"), fullPage: true });
  });

  test("UC-AU03 — Tab Exportar Compliance com formulario completo e hash", async ({ page }) => {
    await login(page);
    await navTo(page, "Auditoria");
    await page.waitForTimeout(2000);

    const exportBtn = page.locator('button:has-text("Exportar Compliance")');
    await expect(exportBtn).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: SS("AU03_acao"), fullPage: true });
    await exportBtn.click();
    await page.waitForTimeout(1500);

    const body = await getBody(page);

    // Formulario
    expect(body).toContain("Exportar para Compliance");
    expect(body).toContain("Data Inicio");
    expect(body).toContain("Data Fim");
    expect(body).toContain("Mascarar PII");

    // Campos date
    const dateInputs = page.locator('input[type="date"]');
    expect(await dateInputs.count()).toBeGreaterThanOrEqual(2);

    // Checkbox PII
    expect(await page.locator('input[type="checkbox"]').count()).toBeGreaterThanOrEqual(1);

    // Botoes Exportar CSV e PDF
    await expect(page.locator('button:has-text("Exportar CSV")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Exportar PDF")')).toBeVisible({ timeout: 5000 });

    // Filtros de Entidades e Usuarios
    expect(body).toContain("Entidades");
    expect(body).toContain("Usuarios");

    await page.screenshot({ path: SS("AU03_resp"), fullPage: true });
  });
});
