/**
 * VALIDACAO REAL COM SCREENSHOTS — REVISAO do Arnaldo (Sprint 1)
 *
 * Cobre as 5 observacoes da REVISAO + spot-checks das Sprints 1-1 e 1-2:
 *   - OBS-09-R: "X vermelho ao salvar" (na verdade e o botao Excluir adjacente)
 *   - OBS-11-R: icones de lapis mais visiveis (background azul, size 18)
 *   - OBS-17/18-R: fontes de certidoes (infraestrutura existe)
 *   - OBS-19-R: cadastro de responsavel (Fernanda + Dr. Ricardo) sem erro
 *   - OBS-21/22-R: busca no Portfolio encontra produto pelo nome da subclasse
 *
 * Cada teste gera screenshots em docs/screenshots_revisao_arnaldo/
 * que serao analisadas no relatorio final.
 */
import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:5180";
const SHOTS = "/mnt/data1/progpython/agenteditais/docs/screenshots_revisao_arnaldo";

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
        const text = btn.textContent?.trim() || "";
        if (text === sec || text.includes(sec)) {
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
      const labelSpan = btn.querySelector(".nav-item-label");
      if (labelSpan && labelSpan.textContent?.trim() === lbl) {
        (btn as HTMLElement).click();
        return;
      }
    }
  }, label);
  await page.waitForTimeout(2500);
}

// ═══════════════════════════════════════════════════════════════════════
// Ao inicio, limpar sempre os responsaveis "Fernanda" / "Dr. Ricardo" que
// possam ter ficado de execucoes anteriores.
// ═══════════════════════════════════════════════════════════════════════
test.beforeAll(async ({ request }) => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const r = await request.post("http://localhost:5007/api/auth/login", {
    data: { email: "valida1@valida.com.br", password: "123456" },
  });
  const j = await r.json();
  const token = j.access_token || j.token;
  const headers = { Authorization: `Bearer ${token}` };
  const list = await request.get("http://localhost:5007/api/crud/empresa-responsaveis?limit=200", { headers });
  const lj = await list.json();
  const items = lj.items || lj.data || [];
  for (const it of items) {
    const nome = (it.nome || "").toLowerCase();
    if (nome.includes("fernanda") || nome.includes("ricardo") || nome.includes("teste") || nome.includes("cpf dup")) {
      await request.delete(`http://localhost:5007/api/crud/empresa-responsaveis/${it.id}`, { headers });
    }
  }
});

test.describe("REVISAO Arnaldo — validacao real com screenshots", () => {
  test.setTimeout(180000);

  // ───────────────────────────────────────────────────────────────────────
  // OBS-21/22-R: busca no Portfolio funciona com nome da subclasse
  // ───────────────────────────────────────────────────────────────────────
  test("OBS-21/22-R: buscar 'Coagulacao' (nome de subclasse) retorna o produto", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);

    // Estado inicial — sem filtro
    await shot(page, "OBS-21-22_01_portfolio_inicial");

    // Contar produtos visiveis antes do filtro
    const countBefore = await page.locator("table tr").count();

    // Buscar por 'Coagulacao' — nome da subclasse do 2o produto (NAO aparece no nome do produto)
    const search = page.locator('input[placeholder*="Buscar"]').first();
    await search.click();
    await search.fill("Coagula");
    await page.waitForTimeout(1500);
    await shot(page, "OBS-21-22_02_busca_coagulacao");

    // Ler texto da tabela
    const tableText = await page.locator("table").innerText().catch(() => "");
    const countAfter = await page.locator("table tr").count();

    // Deve aparecer pelo menos o produto "Monitor Multiparametrico iMEC10 Plus"
    // (cuja subclasse e "Coagulação")
    expect(tableText.toLowerCase()).toContain("monitor");
    // E o filtro deve ter REDUZIDO a contagem, nao eliminado todos
    expect(countAfter).toBeGreaterThan(1); // header + pelo menos 1
    expect(countAfter).toBeLessThanOrEqual(countBefore);

    console.log(`[OBS-21/22-R] Linhas antes: ${countBefore}, depois do filtro 'Coagula': ${countAfter}`);

    // Testar tambem por nome da CLASSE "Laboratorio" (se existir)
    await search.fill("");
    await page.waitForTimeout(500);
    await search.fill("Hemograma");
    await page.waitForTimeout(1500);
    await shot(page, "OBS-21-22_03_busca_hemograma");
    const tableText2 = await page.locator("table").innerText().catch(() => "");
    expect(tableText2.toLowerCase()).toContain("kit reagente"); // Produto cuja subclasse e "Hemograma Completo"

    // Testar EXATAMENTE o termo que o Arnaldo reclamou: "reagente"
    // Ambos produtos tem "Reagentes" na CLASSE, entao busca deve retornar 2 produtos
    await search.fill("");
    await page.waitForTimeout(500);
    await search.fill("reagente");
    await page.waitForTimeout(1500);
    await shot(page, "OBS-21-22_04_busca_reagente_termo_do_arnaldo");
    const tableText3 = await page.locator("table").innerText().catch(() => "");
    // Deve conter AMBOS os produtos (ambos com "Reagentes" na classe)
    expect(tableText3.toLowerCase()).toContain("kit reagente");
    expect(tableText3.toLowerCase()).toContain("monitor multiparametrico");

    // Limpar busca
    await search.fill("");
    await page.waitForTimeout(1000);
  });

  // ───────────────────────────────────────────────────────────────────────
  // OBS-19-R: cadastrar Fernanda e Dr. Ricardo pela UI
  // ───────────────────────────────────────────────────────────────────────
  test("OBS-19-R: cadastrar Fernanda e Dr. Ricardo (2 responsaveis) sem erro", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(3000);

    // Scroll ate a secao de Responsaveis
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll(".card-title, h2, h3"));
      const target = headers.find(h => (h.textContent || "").toLowerCase().includes("responsavei"));
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await page.waitForTimeout(1000);
    await shot(page, "OBS-19_01_secao_responsaveis");

    // Clicar em "Adicionar" (botao na secao de responsaveis)
    const addBtn = page.locator('button:has-text("Adicionar")').last();
    await addBtn.click();
    await page.waitForTimeout(1500);
    await shot(page, "OBS-19_02_modal_aberto_fernanda");

    // Preencher Fernanda — usando inputs dentro do modal em ordem.
    // Modal tem: [select Tipo, input Nome, input Cargo, input Email, input Telefone]
    // SEM selecionar tipo para validar que ENUM "" → null funciona
    const modalInputs = page.locator('.modal input, [role="dialog"] input');
    const nomeInp = modalInputs.nth(0);
    const cargoInp = modalInputs.nth(1);
    const emailInp = modalInputs.nth(2);
    const telInp = modalInputs.nth(3);
    await nomeInp.fill("Fernanda Silva Diretora");
    await cargoInp.fill("Diretora Tecnica");
    await emailInp.fill("fernanda@test.com");
    await telInp.fill("11987654321");

    await page.waitForTimeout(500);
    await shot(page, "OBS-19_03_formulario_fernanda_preenchido");

    // Capturar resposta do backend antes de clicar Salvar
    const respPromise = page.waitForResponse(
      r => r.url().includes("/api/crud/empresa-responsaveis") && r.request().method() === "POST",
      { timeout: 10000 }
    ).catch(() => null);

    // Clicar Salvar
    const saveBtn = page.locator('button:has-text("Salvar")').last();
    await saveBtn.click();
    const resp = await respPromise;
    await page.waitForTimeout(2000);
    await shot(page, "OBS-19_04_apos_salvar_fernanda");

    // Fernanda deve ter sido salva (201) e aparecer na grid
    if (resp) {
      expect(resp.status()).toBe(201);
    }
    const body1 = await page.innerText("body");
    expect(body1).toContain("Fernanda Silva Diretora");

    // Agora Dr. Ricardo
    await page.waitForTimeout(1000);
    // Garantir que o modal fechou antes de abrir de novo
    await page.waitForSelector('.modal, [role="dialog"]', { state: "detached", timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    const addBtn2 = page.locator('button:has-text("Adicionar")').last();
    await addBtn2.click();
    await page.waitForTimeout(1500);
    await shot(page, "OBS-19_05_modal_aberto_ricardo");

    const modalInputs2 = page.locator('.modal input, [role="dialog"] input');
    await modalInputs2.nth(0).fill("Dr. Ricardo Oliveira");
    await modalInputs2.nth(1).fill("Medico Responsavel");
    await modalInputs2.nth(2).fill("ricardo@test.com");
    await modalInputs2.nth(3).fill("1133334444");

    await page.waitForTimeout(500);
    await shot(page, "OBS-19_06_formulario_ricardo_preenchido");

    const resp2Promise = page.waitForResponse(
      r => r.url().includes("/api/crud/empresa-responsaveis") && r.request().method() === "POST",
      { timeout: 10000 }
    ).catch(() => null);

    const saveBtn2 = page.locator('button:has-text("Salvar")').last();
    await saveBtn2.click();
    const resp2 = await resp2Promise;
    await page.waitForTimeout(2000);
    await shot(page, "OBS-19_07_apos_salvar_ricardo_AMBOS_NA_GRID");

    if (resp2) {
      expect(resp2.status()).toBe(201);
    }
    const body2 = await page.innerText("body");
    expect(body2).toContain("Fernanda Silva Diretora");
    expect(body2).toContain("Dr. Ricardo Oliveira");
  });

  // ───────────────────────────────────────────────────────────────────────
  // OBS-19-R (continuacao): mensagem amigavel para CPF duplicado
  // ───────────────────────────────────────────────────────────────────────
  test("OBS-19-R: _friendly_error traduz Duplicate entry em mensagem legivel", async ({ request }) => {
    const r = await request.post("http://localhost:5007/api/auth/login", {
      data: { email: "valida1@valida.com.br", password: "123456" },
    });
    const token = (await r.json()).access_token;
    const H = { Authorization: `Bearer ${token}` };

    const empresas = await request.get("http://localhost:5007/api/crud/empresas?limit=1", { headers: H });
    const empresasJson = await empresas.json();
    const eid = (empresasJson.items || empresasJson.data)[0].id;

    // Criar responsavel 1 com CPF
    const c1 = await request.post("http://localhost:5007/api/crud/empresa-responsaveis", {
      headers: H,
      data: { empresa_id: eid, nome: "Dup Test 1", cpf: "12345678909" },
    });
    expect(c1.status()).toBe(201);
    const id1 = (await c1.json()).id;

    // Criar responsavel 2 com MESMO CPF — deve falhar com mensagem amigavel
    const c2 = await request.post("http://localhost:5007/api/crud/empresa-responsaveis", {
      headers: H,
      data: { empresa_id: eid, nome: "Dup Test 2", cpf: "12345678909" },
    });
    expect(c2.status()).toBe(400);
    const errJson = await c2.json();
    console.log(`[OBS-19-R] Erro retornado: ${JSON.stringify(errJson)}`);
    // Deve retornar mensagem AMIGAVEL, nao o IntegrityError bruto
    expect(errJson.error).toContain("Ja existe um responsavel com este CPF");
    expect(errJson.error).not.toContain("IntegrityError");
    expect(errJson.error).not.toContain("Duplicate entry");

    // Cleanup
    await request.delete(`http://localhost:5007/api/crud/empresa-responsaveis/${id1}`, { headers: H });
  });

  // ───────────────────────────────────────────────────────────────────────
  // OBS-11-R: icones de edicao visiveis (background azul, size 18)
  // ───────────────────────────────────────────────────────────────────────
  test("OBS-11-R: icones de acao na grid tem background azul e sao maiores", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(3000);

    // Scroll ate Responsaveis (onde ha botoes de acao)
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll(".card-title, h2, h3"))
        .find(el => (el.textContent || "").toLowerCase().includes("responsavei"));
      if (h) h.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await page.waitForTimeout(1500);
    await shot(page, "OBS-11_01_responsaveis_com_icones");

    // Checar se ha ao menos 1 botao dentro de .table-actions
    const btn = page.locator(".table-actions button").first();
    if (await btn.count() > 0) {
      const styles = await btn.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          background: cs.backgroundColor,
          color: cs.color,
          border: cs.border,
          padding: cs.padding,
        };
      });
      console.log(`[OBS-11-R] Estilos computados do botao:`, JSON.stringify(styles));

      // Background deve ser azul claro (#eff6ff = rgb(239, 246, 255))
      // ou alternativa: cor nao-transparente
      expect(styles.background).not.toBe("rgba(0, 0, 0, 0)");
      expect(styles.background).not.toBe("transparent");

      // Cor do icone deve ser azul (nao cinza/muted)
      // #2563eb = rgb(37, 99, 235)
      const colorMatch = styles.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
      if (colorMatch) {
        const [_, r, g, b] = colorMatch.map(Number);
        // Azul dominante: b > r e b > g
        expect(b).toBeGreaterThan(r);
        expect(b).toBeGreaterThan(g);
      }
    } else {
      console.log("[OBS-11-R] Sem botoes .table-actions na tela atual — tirando shot apenas");
    }

    // Ir tambem ao Portfolio para conferir outros icones
    await navTo(page, "Portfolio");
    await page.waitForTimeout(3000);
    await shot(page, "OBS-11_02_portfolio_icones_acao");

    const btnPort = page.locator(".table-actions button").first();
    if (await btnPort.count() > 0) {
      const stylesPort = await btnPort.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, size: el.getBoundingClientRect() };
      });
      console.log(`[OBS-11-R] Portfolio icon styles:`, JSON.stringify(stylesPort));
      // Dimensao minima 24x24 (com padding 6-8px do icon 18)
      expect(stylesPort.size.width).toBeGreaterThanOrEqual(24);
      expect(stylesPort.size.height).toBeGreaterThanOrEqual(24);
    }
  });

  // ───────────────────────────────────────────────────────────────────────
  // OBS-09-R: nao aparece mensagem de erro vermelha ao salvar com sucesso
  //           (confusao: o "X vermelho" e o botao Excluir adjacente)
  // ───────────────────────────────────────────────────────────────────────
  test("OBS-09-R: ao salvar dados com sucesso NAO aparece mensagem de erro vermelha", async ({ page }) => {
    await loginDev(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(3000);

    // Scroll ate o topo e fazer uma edicao simples (razao social)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await shot(page, "OBS-09_01_tela_empresa_inicial");

    // Clicar em Salvar da empresa — sem mudancas de verdade, so pra testar feedback
    const saveBtn = page.locator('button:has-text("Salvar")').first();
    if (await saveBtn.count() > 0) {
      // Monitorar se aparece mensagem de erro (crud-message-error)
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await shot(page, "OBS-09_02_apos_salvar");

      // Nao deve existir .crud-message-error na tela
      const errorMessages = await page.locator(".crud-message-error, .error-message").count();
      expect(errorMessages).toBe(0);

      // Tambem nao deve haver texto visivel com "erro" (exceto botao Excluir)
      const body = await page.innerText("body");
      const hasErrorText = /erro ao salvar|falha ao salvar|erro:/i.test(body);
      expect(hasErrorText).toBeFalsy();
    }

    // Agora capturar o botao Excluir para ilustrar que ele eh o "X vermelho" que confunde
    await shot(page, "OBS-09_03_botao_excluir_vermelho_adjacente");
  });

  // ───────────────────────────────────────────────────────────────────────
  // OBS-17/18-R: fontes de certidoes — infraestrutura existe
  // ───────────────────────────────────────────────────────────────────────
  test("OBS-17/18-R: endpoint fontes-certidoes responde com estrutura esperada", async ({ request }) => {
    const r = await request.post("http://localhost:5007/api/auth/login", {
      data: { email: "valida1@valida.com.br", password: "123456" },
    });
    const token = (await r.json()).access_token;
    const H = { Authorization: `Bearer ${token}` };

    // Endpoint existe e retorna 200
    const list = await request.get("http://localhost:5007/api/crud/fontes-certidoes?limit=10", { headers: H });
    expect(list.status()).toBe(200);
    const lj = await list.json();
    console.log(`[OBS-17/18-R] Endpoint fontes-certidoes: ${list.status()}, items: ${(lj.items || lj.data || []).length}`);

    // Schema endpoint confirma que a entidade existe
    const schema = await request.get("http://localhost:5007/api/crud/schema", { headers: H });
    expect(schema.status()).toBe(200);
    const sj = await schema.json();
    expect(JSON.stringify(sj)).toContain("fontes-certidoes");
  });
});
