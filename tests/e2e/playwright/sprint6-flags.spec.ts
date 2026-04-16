import { test, expect } from "@playwright/test";
import { login, navTo, getBody, assertDataVisible } from "./helpers";

const SS = (step: string) => `runtime/screenshots/sprint6-flags/${step}.png`;

test.describe.serial("Sprint 6 — Flags (UC-FL01..FL05)", () => {
  test.setTimeout(120000);

  test("UC-FL01 — Tab Ativos com stat cards criticidade e tabela completa", async ({ page }) => {
    await login(page);
    await navTo(page, "Flags");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("FL01_acao"), fullPage: true });

    const body = await getBody(page);

    // Tabs
    expect(body).toContain("Ativos");
    expect(body).toContain("Historico");
    expect(body).toContain("Calendario");
    expect(body).toContain("Silenciados");

    // Stat cards criticidade
    for (const label of ["Criticos", "Altos", "Medios", "Informativos"]) {
      expect(body).toContain(label);
    }

    // Pipeline de alertas
    expect(body).toContain("Pipeline de Alertas");
    expect(body).toContain("Agendados");
    expect(body).toContain("Disparados");
    expect(body).toContain("Cancelados");

    // Titulos seed
    let found = 0;
    for (const t of ["Abertura PE Hemograma SP", "Prazo impugnacao edital MG", "Prazo recurso edital RS", "Proposta edital RJ vence hoje", "Contrato CTR-CH-2026-V30 vence"]) {
      if (body.includes(t)) found++;
    }
    expect(found).toBeGreaterThanOrEqual(4);

    // Colunas tabela
    await assertDataVisible(page, { anyText: ["CRITICIDADE", "TITULO", "TIPO", "DISPARO", "STATUS"], minCount: 4 });

    // Filtros
    expect(body).toContain("Filtros");

    // Botao Novo Alerta
    await expect(page.locator('button:has-text("Novo Alerta")')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: SS("FL01_resp"), fullPage: true });
  });

  test("UC-FL02 — Modal Criar Alerta via IA", async ({ page }) => {
    await login(page);
    await navTo(page, "Flags");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Novo Alerta")').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("FL02_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Criar Alerta via IA");
    expect(body).toContain("Numero do Edital");
    expect(body).toContain("Tipo de Alerta");
    expect(body).toContain("Antecedencia");
    await expect(page.locator('button:has-text("Criar Alerta")')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: SS("FL02_resp"), fullPage: true });
  });

  test("UC-FL03 — Tab Historico com stats e export CSV", async ({ page }) => {
    await login(page);
    await navTo(page, "Flags");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Historico")').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("FL03_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Total Disparados");
    expect(body).toContain("Reconhecidos");
    expect(body).toContain("Cancelados");
    expect(body).toContain("Taxa Reconhecimento");

    await expect(page.locator('button:has-text("Exportar CSV")')).toBeVisible({ timeout: 5000 });
    await assertDataVisible(page, { anyText: ["DATA", "TIPO", "TITULO", "STATUS FINAL"], minCount: 3 });

    await page.screenshot({ path: SS("FL03_resp"), fullPage: true });
  });

  test("UC-FL04 — Tab Silenciados com alerta do seed e botao Reativar", async ({ page }) => {
    await login(page);
    await navTo(page, "Flags");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Silenciados")').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("FL04_acao"), fullPage: true });

    const body = await getBody(page);
    expect(body).toContain("Silenciados");
    const temSil = body.includes("Reuniao adiada pelo cliente") || body.includes("Reativar");
    expect(temSil).toBeTruthy();
    expect(await page.locator('button:has-text("Reativar")').count()).toBeGreaterThanOrEqual(1);
    await assertDataVisible(page, { anyText: ["TITULO", "SILENCIADO ATE", "MOTIVO"], minCount: 2 });

    await page.screenshot({ path: SS("FL04_resp"), fullPage: true });
  });

  test("UC-FL05 — Tab Calendario com legenda criticidade", async ({ page }) => {
    await login(page);
    await navTo(page, "Flags");
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Calendario")').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SS("FL05_acao"), fullPage: true });

    const body = await getBody(page);
    const meses = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    expect(body).toContain(meses[new Date().getMonth()]);
    expect(body).toContain("Critico");
    expect(body).toContain("Informativo");
    expect(body).toContain("Dias com alertas agendados");

    await page.screenshot({ path: SS("FL05_resp"), fullPage: true });
  });
});
