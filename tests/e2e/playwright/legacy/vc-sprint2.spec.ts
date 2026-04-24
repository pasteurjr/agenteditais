import { test } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab } from "./helpers";

// VC Fase C — Sprint 2
// CV02, CV03, CV05 em Captação (após buscar com termo)
// CV11, CV12, CV13 em Validação (após selecionar um edital salvo)

const DIR = "runtime/screenshots/VC/sprint2";
fs.mkdirSync(DIR, { recursive: true });
const SS = (name: string) => `${DIR}/${name}.png`;

test.describe.configure({ mode: "serial" });

async function doBuscaComTermo(page: any) {
  await navTo(page, "Captacao");
  await page.waitForTimeout(2500);

  // Preencher via setter nativo (contorna React controlled input)
  const termoInput = page.locator('input[placeholder*="produto"], input[placeholder*="Digite"]').first();
  await termoInput.click();
  await page.evaluate(() => {
    const input = Array.from(document.querySelectorAll<HTMLInputElement>("input")).find(i => {
      const p = (i.placeholder || "").toLowerCase();
      return p.includes("produto") || p.includes("digite");
    });
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "hemograma");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // Aguardar resposta da API ao clicar
  const respPromise = page.waitForResponse(
    (r: any) => r.url().includes("/api/editais/buscar"),
    { timeout: 60000 }
  ).catch(() => null);

  const buscarBtn = page.locator('button:has-text("Buscar Editais")').first();
  await buscarBtn.click();

  await respPromise;
  await page.waitForTimeout(3000); // render da tabela
}

test("VC-CV02: Painel lateral aberto scrollado pro topo", async ({ page }) => {
  await login(page);
  await doBuscaComTermo(page);

  // Clicar no Eye da primeira linha da tabela de resultados
  const eyeBtn = page.locator('button[title="Ver detalhes"]').first();
  if (await eyeBtn.count() > 0) {
    await eyeBtn.click();
    await page.waitForTimeout(3000);
  }

  // Scrollar até o painel lateral para garantir que apareça completo no viewport
  await page.evaluate(() => {
    const panel = document.querySelector(".captacao-panel");
    if (panel) (panel as HTMLElement).scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: SS("CV02_painel_topo"), fullPage: true });
});

test("VC-CV03: Painel lateral com botão Salvar visível", async ({ page }) => {
  await login(page);
  await doBuscaComTermo(page);

  const eyeBtn = page.locator('button[title="Ver detalhes"]').first();
  if (await eyeBtn.count() > 0) {
    await eyeBtn.click();
    await page.waitForTimeout(3000);
  }

  // Scrollar DENTRO do painel para mostrar a seção com Salvar Edital / Intenção / Margem
  await page.evaluate(() => {
    const panel = document.querySelector(".captacao-panel");
    if (panel) {
      (panel as HTMLElement).scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
      // O botão salvar costuma ficar no final da seção inferior do painel
      const buttons = Array.from(panel.querySelectorAll("button"));
      const salvar = buttons.find(b => /salvar\s*edital|salvar/i.test(b.textContent || ""));
      if (salvar) salvar.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    }
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: SS("CV03_painel_salvar"), fullPage: true });
});

test("VC-CV05: Exportação CSV", async ({ page }) => {
  await login(page);
  await doBuscaComTermo(page);

  const downloadPromise = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => /exportar\s*csv/i.test((b.textContent || "").trim()));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(2000);

  const download = await downloadPromise;
  if (download) await download.cancel().catch(() => undefined);

  await page.screenshot({ path: SS("CV05_exportacao_feedback"), fullPage: true });
});

async function selectFirstEditalValidacao(page: any) {
  await navTo(page, "Validacao");
  await page.waitForTimeout(4500);

  // Aguarda a tabela de Meus Editais renderizar com dados
  await page.waitForSelector("tbody tr.clickable", { timeout: 15000 }).catch(() => null);

  // Clica na primeira linha e AGUARDA o painel realmente aparecer
  const firstRow = page.locator("tbody tr.clickable").first();
  await firstRow.click({ force: true });

  // Wait for painel a aparecer — o botão "Ver Edital" é marcador exclusivo do painel
  await page.waitForSelector("button:has-text('Ver Edital')", { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Scroll para o painel ficar no viewport
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b =>
      (b.textContent || "").includes("Ver Edital")
    );
    if (btn) btn.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  });
  await page.waitForTimeout(600);
}

test("VC-CV11: Análise de Riscos executada", async ({ page }) => {
  test.setTimeout(240000);
  await login(page);
  const ok = await selectFirstEditalValidacao(page);
  if (!ok) {
    // Fallback: tentar clicar na primeira célula da tabela ao invés da linha
    await page.evaluate(() => {
      const cell = document.querySelector("tbody tr td") as HTMLElement | null;
      if (cell) cell.click();
    });
    await page.waitForTimeout(3000);
  }

  await clickTab(page, "Riscos");
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => /analisar\s*riscos|reanalisar/i.test((b.textContent || "").trim()));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(30000);

  await page.screenshot({ path: SS("CV11_riscos_resultado"), fullPage: true });
});

test("VC-CV12: Análise de Mercado executada", async ({ page }) => {
  test.setTimeout(240000);
  await login(page);
  await selectFirstEditalValidacao(page);

  await clickTab(page, "Mercado");
  await page.waitForTimeout(2500);

  // Aguarda resposta da API de mercado — URL exato é /api/editais/{id}/analisar-mercado
  const respPromise = page.waitForResponse(
    (r: any) => r.url().includes("/analisar-mercado") && r.request().method() === "POST",
    { timeout: 120000 }
  ).catch(() => null);

  // Clica "Analisar Mercado do Órgão" via evaluate (mais robusto)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => /analisar\s*mercado/i.test((b.textContent || "").trim()));
    if (btn) (btn as HTMLElement).click();
  });

  await respPromise;

  // Aguardar estado "Reanalisar Mercado" ou presença de h4 Dados do Órgão — indica render completo
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const hasReanalisar = btns.some(b => /reanalisar\s*mercado/i.test((b.textContent || "").trim()));
    const hasDados = Array.from(document.querySelectorAll("h4")).some(h =>
      /dados\s*do\s*órgão|reputação|estatísticas|análise.*ia/i.test(h.textContent || "")
    );
    return hasReanalisar || hasDados;
  }, { timeout: 30000 }).catch(() => null);

  await page.waitForTimeout(2500); // pequeno buffer pós-render

  // Scrollar para mostrar dados analíticos
  await page.evaluate(() => {
    const title = Array.from(document.querySelectorAll("h4")).find(h =>
      /dados\s*do\s*órgão|reputação|estatísticas/i.test(h.textContent || "")
    );
    if (title) {
      title.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    } else {
      // fallback: scroll pro botão Reanalisar
      const btn = Array.from(document.querySelectorAll("button")).find(b =>
        /reanalisar\s*mercado/i.test(b.textContent || "")
      );
      if (btn) btn.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    }
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: SS("CV12_mercado_resultado"), fullPage: true });
});

test("VC-CV13: Chat IA com resposta visível", async ({ page }) => {
  test.setTimeout(240000);
  await login(page);
  await selectFirstEditalValidacao(page);

  await clickTab(page, "IA");
  await page.waitForTimeout(2500);

  // Gerar resumo primeiro (mostra conteúdo rico no painel)
  const respResumoPromise = page.waitForResponse(
    (r: any) => r.url().includes("/resumir") || r.url().includes("/resumo"),
    { timeout: 90000 }
  ).catch(() => null);
  const gerarResumoBtn = page.locator('button:has-text("Gerar Resumo"), button:has-text("Regerar Resumo")').first();
  if (await gerarResumoBtn.count() > 0) {
    await gerarResumoBtn.click({ force: true });
  }
  await respResumoPromise;
  await page.waitForTimeout(2000);

  // Fazer pergunta genérica e segura
  await page.evaluate(() => {
    const input = Array.from(document.querySelectorAll<HTMLInputElement>("input")).find(i =>
      /prazo|qual/i.test(i.placeholder || "")
    );
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "Resuma o objeto deste edital em 3 linhas");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);

  const respChatPromise = page.waitForResponse(
    (r: any) => r.url().includes("/chat") || r.url().includes("/perguntar") || r.url().includes("/pergunta-edital"),
    { timeout: 60000 }
  ).catch(() => null);
  const perguntarBtn = page.locator('button:has-text("Perguntar")').first();
  if (await perguntarBtn.count() > 0) await perguntarBtn.click({ force: true });
  await respChatPromise;
  await page.waitForTimeout(3000);

  // Scroll para a box de resumo + resposta
  await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h4")).find(h => (h.textContent || "").includes("Resumo Gerado"));
    if (h) h.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  });
  await page.waitForTimeout(600);

  await page.screenshot({ path: SS("CV13_chat_resposta"), fullPage: true });
});
