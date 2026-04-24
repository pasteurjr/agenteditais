import { test, expect } from "@playwright/test";
import { login, navTo, getBody, assertDataVisible } from "../helpers";

const SS = (step: string) => `runtime/screenshots/sprint6-monitoria/${step}.png`;

test.describe("Sprint 6 — Monitoria (UC-MO01..MO06)", () => {
  test.setTimeout(120000);

  test("UC-MO01 — Tab Ativos com stat cards e tabela completa", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("MO01_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Ativos");
    expect(body).toContain("Eventos Capturados");
    expect(body).toContain("Erros");

    for (const label of ["Ativos", "Pausados", "Editais encontrados", "Com erro"]) {
      expect(body).toContain(label);
    }

    const pausadosCard = page.locator('.stat-card:has(.stat-label:text("Pausados")) .stat-value');
    expect(parseInt(await pausadosCard.innerText().catch(() => "0"))).toBeGreaterThanOrEqual(1);

    const erroCard = page.locator('.stat-card:has(.stat-label:text("Com erro")) .stat-value');
    expect(parseInt(await erroCard.innerText().catch(() => "0"))).toBeGreaterThanOrEqual(1);

    const encontradosCard = page.locator('.stat-card:has(.stat-label:text("Editais encontrados")) .stat-value');
    expect(parseInt(await encontradosCard.innerText().catch(() => "0"))).toBeGreaterThanOrEqual(29);

    let found = 0;
    for (const t of ["hematologia", "reagentes laboratoriais", "equipamento diagnostico", "kit coagulacao", "biomol pcr"]) {
      if (body.includes(t)) found++;
    }
    expect(found).toBeGreaterThanOrEqual(5);

    await assertDataVisible(page, { anyText: ["TERMO", "UFS", "FREQ.", "ENCONTRADOS", "STATUS"], minCount: 4 });
    await expect(page.locator('button:has-text("Novo Monitoramento")')).toBeVisible({ timeout: 5000 });
    expect(body).toContain("SP");
    expect(body).toContain("MG");
    expect(await page.locator('.data-table tbody tr').count()).toBeGreaterThanOrEqual(5);

    await page.screenshot({ path: SS("MO01_resp"), fullPage: true });
  });

  test("UC-MO02 — Modal Criar Monitoramento via IA", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Novo Monitoramento")').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("MO02_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Criar Monitoramento via IA");
    expect(body).toContain("Termo de busca");
    expect(body).toContain("Frequencia");
    await expect(page.locator('button:has-text("Criar Monitoramento")')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: SS("MO02_resp"), fullPage: true });
  });

  test("UC-MO03 — Botao Analisar Documentos", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("MO03_acao"), fullPage: true });
    await expect(page.locator('button:has-text("Analisar Documentos")')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: SS("MO03_resp"), fullPage: true });
  });

  test("UC-MO04 — Botao Verificar PNCP", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("MO04_acao"), fullPage: true });
    await expect(page.locator('button:has-text("Verificar PNCP")')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: SS("MO04_resp"), fullPage: true });
  });

  test("UC-MO05 — Tab Eventos Capturados com tabela e filtros", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Eventos Capturados")').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("MO05_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Eventos Capturados");
    expect(body).toContain("Monitoramento");
    await assertDataVisible(page, { anyText: ["EDITAL", "ORGAO", "UF"], minCount: 2 });

    await page.screenshot({ path: SS("MO05_resp"), fullPage: true });
  });

  test("UC-MO06 — Tab Erros com diagnostico modal", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Erros")').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("MO06_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Monitoramentos com Erro");
    expect(body).toContain("biomol pcr");

    const diagBtn = page.locator('button:has-text("Diagnostico")');
    expect(await diagBtn.count()).toBeGreaterThanOrEqual(1);
    await diagBtn.first().click();
    await page.waitForTimeout(1000);

    const bodyModal = await getBody(page);
    expect(bodyModal).toContain("Diagnostico de Erro");
    expect(bodyModal).toContain("Atraso");
    expect(await page.locator('button:has-text("Executar Agora")').count()).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: SS("MO06_resp"), fullPage: true });
  });
});
