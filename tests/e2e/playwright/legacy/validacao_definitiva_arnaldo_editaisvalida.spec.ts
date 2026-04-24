/**
 * VALIDACAO DEFINITIVA das correcoes do Arnaldo.
 * Cobre todas as lacunas identificadas na auditoria previa:
 *   L1: OBS-09 — antes/depois real do save
 *   L2: OBS-11 — Portfolio navegado corretamente
 *   L3: OBS-19 — duplicata CPF via UI (agora que o campo existe)
 *   L4: OBS-17/18 — UI de Fontes de Certidoes
 *   L8: OBS-11 original — confirmar que nao tem edicao inline
 *
 * Gera screenshots em docs/screenshots_definitiva_editaisvalida/
 */
import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:5179";
const API = "http://localhost:5008";
const SHOTS = "/mnt/data1/progpython/agenteditais/docs/screenshots_definitiva_editaisvalida";

async function shot(page: any, name: string) {
  const full = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: full, fullPage: false });
  return full;
}

async function loginDev(page: any) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.startsWith("editais_ia_")).forEach(k => localStorage.removeItem(k));
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', "valida1@valida.com.br");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    const body = await page.innerText("body").catch(() => "");
    if (body.includes("Selecionar Empresa") || body.includes("Escolha a empresa")) {
      const ch = page.locator("text=CH Hospitalar").first();
      if (await ch.count() > 0) await ch.click();
      else {
        await page.evaluate(() => {
          const all = Array.from(document.querySelectorAll("div, button, a"));
          const el = all.find(e => e.textContent?.includes("CNPJ"));
          if (el) (el as HTMLElement).click();
        });
      }
      await page.waitForTimeout(4000);
    }
    await page.waitForSelector("text=Dashboard", { timeout: 15000 });
  } catch {
    await page.waitForTimeout(3000);
  }
}

async function navTo(page: any, label: string) {
  const sectionMap: Record<string, string> = {
    "Empresa": "Configuracoes",
    "Portfolio": "Configuracoes",
    "Parametrizacoes": "Configuracoes",
  };
  const section = sectionMap[label];
  if (section) {
    await page.evaluate((sec: string) => {
      const buttons = Array.from(document.querySelectorAll("button"));
      for (const btn of buttons) {
        const t = btn.textContent?.trim() || "";
        if (t === sec || t.includes(sec)) {
          (btn as HTMLElement).click();
          return;
        }
      }
    }, section);
    await page.waitForTimeout(800);
  }
  await page.evaluate((lbl: string) => {
    const navButtons = Array.from(document.querySelectorAll("button.nav-item, button.nav-item-main"));
    for (const btn of navButtons) {
      const ls = btn.querySelector(".nav-item-label");
      if (ls && ls.textContent?.trim() === lbl) {
        (btn as HTMLElement).click();
        return;
      }
    }
  }, label);
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

test.beforeAll(async ({ request }) => {
  fs.mkdirSync(SHOTS, { recursive: true });
  // Cleanup de teste residual
  const r = await request.post(`${API}/api/auth/login`, {
    data: { email: "valida1@valida.com.br", password: "123456" },
  });
  const token = (await r.json()).access_token;
  const H = { Authorization: `Bearer ${token}` };
  const list = await request.get(`${API}/api/crud/empresa-responsaveis?limit=200`, { headers: H });
  const items = (await list.json()).items || [];
  for (const it of items) {
    const n = (it.nome || "").toLowerCase();
    if (n.includes("fernanda") || n.includes("ricardo") || n.includes("teste") || n.includes("dup") || n.includes("cpf ")) {
      await request.delete(`${API}/api/crud/empresa-responsaveis/${it.id}`, { headers: H });
    }
  }
});

test.describe("VALIDACAO DEFINITIVA — fechamento de lacunas", () => {
  test.setTimeout(180000);

  // ─────────────────────────────────────────────────────────
  // L1: OBS-09 — antes/depois REAL do save
  // ─────────────────────────────────────────────────────────
  test("L1 OBS-09: Salvar com sucesso NAO dispara X vermelho de erro (antes+depois reais)", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Topo da tela
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await shot(page, "L1_01_ANTES_de_salvar_topo");

    // Clicar num input de Razao Social para modificar algo real e achar o Salvar
    const razao = page.locator('input').first();
    await razao.focus();
    await razao.press("End");
    await razao.press("Space");
    await razao.press("Backspace"); // force dirty

    // Scroll procurar o botao "Salvar Alteracoes" (existe um na secao de telefones)
    // mas o que queremos eh a resposta da API de empresas. Qualquer save que dispare
    // PUT /api/crud/empresas/<id> conta.
    const respPromise = page.waitForResponse(r => r.url().includes("/api/crud/empresas") && ["PUT","PATCH"].includes(r.request().method()), { timeout: 15000 }).catch(() => null);

    // Clica em TODOS os Salvar disponiveis — pelo menos um deve disparar PUT /api/crud/empresas
    const botoes = page.locator('button:has-text("Salvar")');
    const count = await botoes.count();
    console.log(`[L1] Botoes Salvar encontrados: ${count}`);
    // Clicar no primeiro Salvar (que eh o de Informacoes Cadastrais)
    const primeiro = botoes.first();
    await primeiro.scrollIntoViewIfNeeded();
    await shot(page, "L1_02_antes_de_clicar_Salvar");
    await primeiro.click();

    const resp = await respPromise;
    if (resp) console.log(`[L1] Response: ${resp.status()} ${resp.url()}`);

    // Aguardar feedback aparecer — o toast "Salvo!" so fica 2 segundos
    await page.waitForTimeout(300);
    await shot(page, "L1_03_depois_de_salvar_visao_atual");

    // Procurar o texto "Salvo!" (feedback verde ao lado do botao)
    // Ele so fica visivel por 2 segundos apos o save bem-sucedido.
    const salvoSpan = page.locator('text="Salvo!"').first();
    const hasSalvo = await salvoSpan.count() > 0;
    console.log(`[L1] "Salvo!" encontrado: ${hasSalvo}`);
    if (hasSalvo) {
      await shot(page, "L1_04_feedback_Salvo_verde_visivel");
      const vis = await salvoSpan.isVisible();
      expect(vis).toBeTruthy();
    } else {
      // Se nao tem "Salvo!" ainda, chama primeiro o scroll antes de tirar shot
      await shot(page, "L1_05_sem_salvo_visivel");
    }

    // Asserts
    const errorDivs = await page.locator('.crud-message-error, .portfolio-error').count();
    const body = await page.innerText("body");
    expect(/erro ao salvar|falha ao salvar/i.test(body)).toBeFalsy();

    const successDivs = await page.locator('.crud-message-success, [class*="success"]').count();
    console.log(`[L1] errorDivs=${errorDivs}, successDivs=${successDivs}, response=${resp?.status()}`);

    if (resp && resp.status() < 400) {
      expect(errorDivs).toBe(0);
    }
  });

  // ─────────────────────────────────────────────────────────
  // L2: OBS-11 — Portfolio navegado, icones do Portfolio
  // ─────────────────────────────────────────────────────────
  test("L2 OBS-11: Portfolio com icones coloridos (navegacao confirmada)", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Portfolio");

    // Confirmacao explicita que estamos no Portfolio
    await page.waitForSelector('text=Portfolio de Produtos', { timeout: 10000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await shot(page, "L2_01_portfolio_topo");

    const title = await page.locator('text=Portfolio de Produtos').count();
    expect(title).toBeGreaterThan(0);

    // Scroll ate a grid
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("th")).find(e => (e.textContent || "").toUpperCase().includes("PRODUTO"));
      if (el) el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1000);
    await shot(page, "L2_02_portfolio_grid_com_icones");

    // Verificar computed style de pelo menos um botao de acao
    const actionBtn = page.locator(".table-actions button").first();
    if (await actionBtn.count() > 0) {
      const cs = await actionBtn.evaluate(el => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { bg: s.backgroundColor, color: s.color, w: r.width, h: r.height };
      });
      console.log(`[L2] Portfolio action button: ${JSON.stringify(cs)}`);
      expect(cs.bg).toBe("rgb(239, 246, 255)"); // #eff6ff
      expect(cs.w).toBeGreaterThanOrEqual(24);
      expect(cs.h).toBeGreaterThanOrEqual(24);
    }
  });

  // ─────────────────────────────────────────────────────────
  // L3: OBS-19 — duplicata CPF via UI (agora que existe o campo)
  // ─────────────────────────────────────────────────────────
  test("L3 OBS-19: duplicata CPF no formulario mostra mensagem amigavel no toast de erro", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Scroll para Responsaveis
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll(".card-title, h2, h3")).find(el => (el.textContent || "").toLowerCase().includes("responsavei"));
      if (h) h.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1000);

    // Helper: abre modal, preenche e salva
    const CPF_TEST = "11122233344";

    // PRIMEIRO responsavel com CPF
    await page.locator('button:has-text("Adicionar")').last().click();
    await page.waitForTimeout(1500);
    const ins1 = page.locator('.modal input, [role="dialog"] input');
    await ins1.nth(0).fill("CPF Dup Test A");     // Nome
    await ins1.nth(1).fill("Diretor");             // Cargo
    await ins1.nth(2).fill(CPF_TEST);              // CPF (NOVO campo)
    await ins1.nth(3).fill("dup.a@test.com");      // Email
    await ins1.nth(4).fill("11987654321");         // Telefone
    await page.waitForTimeout(500);
    await shot(page, "L3_01_primeiro_preenchido_com_cpf");

    const r1 = page.waitForResponse(r => r.url().includes("/api/crud/empresa-responsaveis") && r.request().method() === "POST", { timeout: 10000 }).catch(() => null);
    await page.locator('button:has-text("Salvar")').last().click();
    const resp1 = await r1;
    expect(resp1?.status()).toBe(201);
    await page.waitForTimeout(2000);
    await shot(page, "L3_02_primeiro_salvo");

    // SEGUNDO responsavel com MESMO CPF — deve falhar com msg amigavel
    await page.waitForSelector('.modal, [role="dialog"]', { state: "detached", timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Adicionar")').last().click();
    await page.waitForTimeout(1500);
    const ins2 = page.locator('.modal input, [role="dialog"] input');
    await ins2.nth(0).fill("CPF Dup Test B");
    await ins2.nth(1).fill("Gerente");
    await ins2.nth(2).fill(CPF_TEST);              // MESMO CPF
    await ins2.nth(3).fill("dup.b@test.com");
    await ins2.nth(4).fill("11999887766");
    await shot(page, "L3_03_segundo_preenchido_cpf_duplicado");

    const r2 = page.waitForResponse(r => r.url().includes("/api/crud/empresa-responsaveis") && r.request().method() === "POST", { timeout: 10000 }).catch(() => null);
    await page.locator('button:has-text("Salvar")').last().click();
    const resp2 = await r2;
    expect(resp2?.status()).toBe(400);
    const bodyApi = await resp2?.json();
    console.log(`[L3] Erro amigavel retornado: ${JSON.stringify(bodyApi)}`);
    expect(bodyApi.error).toContain("Ja existe um responsavel com este CPF");
    expect(bodyApi.error).not.toContain("IntegrityError");

    await page.waitForTimeout(2500);
    await shot(page, "L3_04_apos_erro_mostra_mensagem_no_modal");

    // Verificar que a mensagem aparece DENTRO do modal
    const modalText = await page.locator('.modal, [role="dialog"]').first().innerText();
    console.log(`[L3] Texto do modal apos erro: ${modalText.substring(0, 300)}`);
    expect(modalText.toLowerCase()).toContain("ja existe um responsavel com este cpf");

    // Fechar modal e limpar via API
    const cancelar = page.locator('button:has-text("Cancelar")').last();
    if (await cancelar.count() > 0) await cancelar.click();
  });

  // ─────────────────────────────────────────────────────────
  // L4: OBS-17/18 — UI de Fontes de Certidoes
  // ─────────────────────────────────────────────────────────
  test("L4 OBS-17/18: navegar ate Fontes de Certidoes e capturar UI", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");

    // Scroll ate a area de Certidoes
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll(".card-title, h2, h3")).find(e => (e.textContent || "").toLowerCase().includes("certido") || (e.textContent || "").toLowerCase().includes("certidã"));
      if (el) el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1500);
    await shot(page, "L4_01_secao_certidoes_da_empresa");

    const body = await page.innerText("body");
    const hasCertidoes = /certid[õo]es/i.test(body);
    expect(hasCertidoes).toBeTruthy();
    console.log(`[L4] Pagina contem secao de certidoes: ${hasCertidoes}`);
  });

  // ─────────────────────────────────────────────────────────
  // L8: OBS-11 — confirmar que edicao inline NAO acontece mais
  //             (digitando em celula nao deve mudar valor)
  // ─────────────────────────────────────────────────────────
  test("L8 OBS-11-orig: celulas da grid NAO sao editaveis por clique+digit (requer abrir modal)", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll(".card-title, h2, h3")).find(el => (el.textContent || "").toLowerCase().includes("responsavei"));
      if (h) h.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1000);

    // Tentar clicar em uma celula de nome e digitar
    const firstNameCell = page.locator('table tbody tr td').nth(1);
    if (await firstNameCell.count() > 0) {
      const before = await firstNameCell.innerText();
      await firstNameCell.click();
      await page.keyboard.type("XXXX_TESTE_EDIT_INLINE_XXXX");
      await page.waitForTimeout(1000);
      const after = await firstNameCell.innerText();
      console.log(`[L8] Celula antes='${before}' depois='${after}'`);
      expect(after).toBe(before); // celula NAO foi editada
      await shot(page, "L8_01_clique_em_celula_nao_edita_inline");
    }
  });
});
