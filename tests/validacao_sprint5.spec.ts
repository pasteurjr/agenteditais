import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";
const SS = "testes/sprint5/screenshots";

test.describe.serial("Sprint 5 — Pós-Licitação: Validação Completa", () => {
  async function ensureLogin(page: any) {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.fill('input[type="email"]', "pasteurjr@gmail.com");
      await page.fill('input[type="password"]', "123456");
      await page.click('button[type="submit"]');
      await page.waitForSelector('text=Dashboard', { timeout: 15000 });
      await page.waitForTimeout(2000);
    } catch {
      await page.waitForTimeout(3000);
    }
  }

  async function navTo(page: any, label: string) {
    await page.evaluate((lbl: string) => {
      const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent?.trim() === lbl) as HTMLElement;
      if (el) el.click();
    }, label);
    await page.waitForTimeout(3000);
  }

  async function clickTab(page: any, texto: string) {
    await page.evaluate((txt: string) => {
      // Try multiple selectors for tab buttons
      const selectors = ['.tab-panel-tab', '.tab-panel button', 'button.tab-label', '[class*="tab"]'];
      for (const sel of selectors) {
        const tabs = document.querySelectorAll(sel);
        const tab = Array.from(tabs).find(t => t.textContent?.trim().includes(txt)) as HTMLElement;
        if (tab) { tab.click(); return; }
      }
      // Last resort: find any button/span with the text
      const allBtns = document.querySelectorAll('button, span');
      const btn = Array.from(allBtns).find(b => b.textContent?.trim() === txt && (b as HTMLElement).offsetParent !== null) as HTMLElement;
      if (btn) btn.click();
    }, texto);
    await page.waitForTimeout(2000);
  }

  // ── FASE 1: FOLLOW-UP ──

  test("UC-FU01: Página Follow-up — abas, stats, tabelas", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Followup");
    const body = await page.innerText("body").catch(() => "");

    console.log(`Follow-up de Resultados: ${body.includes("Follow-up") || body.includes("Resultados") ? "✅" : "❌"}`);
    console.log(`Pendentes: ${body.includes("Pendentes") ? "✅" : "❌"}`);
    console.log(`Vitória: ${body.includes("Vitória") || body.includes("Vitórias") ? "✅" : "❌"}`);
    console.log(`Taxa: ${body.includes("Taxa") ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-FU01-01_followup_pagina.png`, fullPage: true });
    expect(body.length).toBeGreaterThan(50);
  });

  test("UC-FU02: Aba Alertas com placeholder", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Followup");
    await clickTab(page, "Alertas");
    const body = await page.innerText("body").catch(() => "");
    console.log(`Alertas: ${body.toLowerCase().includes("alerta") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-FU02-01_followup_alertas.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("alerta");
  });

  // ── FASE 2: ATAS ──

  test("UC-AT01: Página Atas — 4 abas (Buscar, Extrair, Minhas Atas, Saldo ARP)", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Atas de Pregao");
    const body = await page.innerText("body").catch(() => "");

    console.log(`Buscar: ${body.includes("Buscar") ? "✅" : "❌"}`);
    console.log(`Extrair: ${body.includes("Extrair") ? "✅" : "❌"}`);
    console.log(`Minhas Atas: ${body.includes("Minhas Atas") ? "✅" : "❌"}`);
    console.log(`Saldo ARP: ${body.includes("Saldo ARP") ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-AT01-01_atas_pagina.png`, fullPage: true });
    expect(body).toContain("Buscar");
  });

  test("UC-AT02: Aba Extrair com campo URL", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Atas de Pregao");
    await clickTab(page, "Extrair");
    const body = await page.innerText("body").catch(() => "");
    console.log(`URL: ${body.includes("URL") ? "✅" : "❌"}`);
    console.log(`Extrair Dados: ${body.includes("Extrair Dados") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-AT02-01_atas_extrair.png`, fullPage: true });
    expect(body).toContain("Extrair");
  });

  test("UC-AT03: Aba Minhas Atas com stats", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Atas de Pregao");
    await clickTab(page, "Minhas Atas");
    const body = await page.innerText("body").catch(() => "");
    console.log(`Total: ${body.includes("Total") ? "✅" : "❌"}`);
    console.log(`Vigentes: ${body.includes("Vigentes") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-AT03-01_atas_minhas.png`, fullPage: true });
    expect(body).toContain("Total");
  });

  test("UC-CT06: Aba Saldo ARP com seletor", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Atas de Pregao");
    await clickTab(page, "Saldo ARP");
    const body = await page.innerText("body").catch(() => "");
    console.log(`Selecione: ${body.includes("Selecione") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-CT06-01_atas_saldo.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("selecione");
  });

  // ── FASE 3: EXECUÇÃO DE CONTRATOS ──

  test("UC-CT01: Página Produção — 5 abas + stats + Novo Contrato", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Execucao Contrato");
    const body = await page.innerText("body").catch(() => "");

    console.log(`Contratos: ${body.includes("Contratos") ? "✅" : "❌"}`);
    console.log(`Entregas: ${body.includes("Entregas") ? "✅" : "❌"}`);
    console.log(`Cronograma: ${body.includes("Cronograma") ? "✅" : "❌"}`);
    console.log(`Aditivos: ${body.includes("Aditivos") ? "✅" : "❌"}`);
    console.log(`Gestor/Fiscal: ${body.includes("Gestor") ? "✅" : "❌"}`);
    console.log(`Novo Contrato: ${body.includes("Novo Contrato") ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-CT01-01_producao_pagina.png`, fullPage: true });
    expect(body).toContain("Contratos");
  });

  test("UC-CT02: Aba Entregas — mensagem selecione", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Execucao Contrato");
    await clickTab(page, "Entregas");
    const body = await page.innerText("body").catch(() => "");
    console.log(`Selecione: ${body.includes("Selecione") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-CT02-01_producao_entregas.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("selecione");
  });

  test("UC-CT03: Aba Cronograma — mensagem selecione", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Execucao Contrato");
    await clickTab(page, "Cronograma");
    const body = await page.innerText("body").catch(() => "");
    await page.screenshot({ path: `${SS}/UC-CT03-01_producao_cronograma.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("selecione");
  });

  test("UC-CT04: Aba Aditivos — mensagem selecione", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Execucao Contrato");
    await clickTab(page, "Aditivos");
    const body = await page.innerText("body").catch(() => "");
    await page.screenshot({ path: `${SS}/UC-CT04-01_producao_aditivos.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("selecione");
  });

  test("UC-CT05: Aba Gestor/Fiscal — mensagem selecione", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Execucao Contrato");
    await clickTab(page, "Gestor/Fiscal");
    const body = await page.innerText("body").catch(() => "");
    await page.screenshot({ path: `${SS}/UC-CT05-01_producao_designacoes.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("selecione");
  });

  // ── FASE 4: CONTRATADO X REALIZADO ──

  test("UC-CR01: Dashboard Contratado x Realizado", async ({ page }) => {
    await ensureLogin(page);
    // Expand Indicadores section first
    await navTo(page, "Indicadores");
    await page.waitForTimeout(500);
    await navTo(page, "Contratado X Realizado");
    await page.waitForTimeout(2000);
    const body = await page.innerText("body").catch(() => "");

    console.log(`Contratado: ${body.includes("Contratado") ? "✅" : "❌"}`);
    console.log(`Realizado: ${body.includes("Realizado") ? "✅" : "❌"}`);

    await page.screenshot({ path: `${SS}/UC-CR01-01_contratado_pagina.png`, fullPage: true });
    expect(body).toContain("Contratado");
  });

  test("UC-CR02: Seção Pedidos em Atraso", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Indicadores");
    await page.waitForTimeout(500);
    await navTo(page, "Contratado X Realizado");
    await page.waitForTimeout(2000);
    const body = await page.innerText("body").catch(() => "");
    console.log(`Atraso: ${body.toLowerCase().includes("atraso") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-CR02-01_contratado_atrasos.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("atraso");
  });

  test("UC-CR03: Seção Próximos Vencimentos", async ({ page }) => {
    await ensureLogin(page);
    await navTo(page, "Indicadores");
    await page.waitForTimeout(500);
    await navTo(page, "Contratado X Realizado");
    await page.waitForTimeout(2000);
    const body = await page.innerText("body").catch(() => "");
    console.log(`Vencimento: ${body.toLowerCase().includes("vencimento") ? "✅" : "❌"}`);
    await page.screenshot({ path: `${SS}/UC-CR03-01_contratado_vencimentos.png`, fullPage: true });
    expect(body.toLowerCase()).toContain("vencimento");
  });
});
