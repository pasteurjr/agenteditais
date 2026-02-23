import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const BASE_URL = "http://localhost:5175";
const API_URL = "http://localhost:5007";
const EMAIL = "pasteurjr@gmail.com";
const PASSWORD = "123456";

let AUTH_TOKEN = "";

async function getToken(): Promise<string> {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  AUTH_TOKEN = data.access_token;
  return AUTH_TOKEN;
}

async function loginAndGoToCaptacao(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500);
  const loginBtn = page.locator('button:has-text("Entrar"), button:has-text("Login")').first();
  if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.locator('input[type="email"], input[placeholder*="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await loginBtn.click();
    await page.waitForTimeout(2000);
  }
  const captacaoBtn = page.locator('.nav-item:has(.nav-item-label:text("Captacao"))').first();
  if (await captacaoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await captacaoBtn.click();
  } else {
    const fluxoHeader = page.locator('.nav-section-header:has(.nav-section-label:text("Fluxo Comercial"))');
    await fluxoHeader.click();
    await page.waitForTimeout(500);
    await page.locator('.nav-item:has(.nav-item-label:text("Captacao"))').first().click();
  }
  await page.waitForTimeout(2000);
}

test.describe("PAGINA 7 - Captacao: Classificacoes, Locais de Busca e Monitoramento", () => {

  test("T1: Classificacao Tipo - 6 opcoes (Todos + 5 tipos de edital)", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    const selectTipo = page.locator('.form-field:has(.form-field-label:text("Classificacao Tipo")) select').first();
    await expect(selectTipo).toBeVisible();

    const options = await selectTipo.locator("option").allTextContents();
    expect(options).toContain("Todos");
    expect(options).toContain("Reagentes");
    expect(options).toContain("Equipamentos");
    expect(options).toContain("Comodato");
    expect(options).toContain("Aluguel");
    expect(options).toContain("Oferta de Preco");
    expect(options).toHaveLength(6);

    await page.screenshot({ path: "tests/results/p7_t1_classificacao_tipo.png", fullPage: true });
    console.log(`T1 PASS: 6 opcoes de tipo: ${options.join(", ")}`);
  });

  test("T2: Classificacao Origem - 9 opcoes (Todos + 8 origens)", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    const selectOrigem = page.locator('.form-field:has(.form-field-label:text("Classificacao Origem")) select').first();
    await expect(selectOrigem).toBeVisible();

    const options = await selectOrigem.locator("option").allTextContents();
    expect(options).toContain("Todos");
    expect(options).toContain("Municipal");
    expect(options).toContain("Estadual");
    expect(options).toContain("Federal");
    expect(options).toContain("Universidade");
    expect(options).toContain("Hospital");
    expect(options).toContain("LACEN");
    expect(options).toContain("Forca Armada");
    expect(options).toContain("Autarquia");
    expect(options).toHaveLength(9);

    await page.screenshot({ path: "tests/results/p7_t2_classificacao_origem.png", fullPage: true });
    console.log(`T2 PASS: 9 opcoes de origem: ${options.join(", ")}`);
  });

  test("T3: Locais de Busca - 5 fontes (PNCP, ComprasNET, BEC-SP, SICONV, Todas)", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    const selectFonte = page.locator('.form-field:has(.form-field-label:text("Fonte")) select').first();
    await expect(selectFonte).toBeVisible();

    const options = await selectFonte.locator("option").allTextContents();
    expect(options).toContain("PNCP");
    expect(options).toContain("ComprasNET");
    expect(options).toContain("BEC-SP");
    expect(options).toContain("SICONV");
    expect(options).toContain("Todas as fontes");
    expect(options).toHaveLength(5);

    await page.screenshot({ path: "tests/results/p7_t3_fontes_busca.png", fullPage: true });
    console.log(`T3 PASS: 5 fontes de busca: ${options.join(", ")}`);
  });

  test("T4: Formato de Busca - Campo termo com placeholder", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    const campoTermo = page.locator('.form-field:has(.form-field-label:text("Termo")) input').first();
    await expect(campoTermo).toBeVisible();

    const placeholder = await campoTermo.getAttribute("placeholder");
    expect(placeholder).toContain("microscopio");

    // Digitar termo e verificar que o campo aceita
    await campoTermo.fill("reagente laboratorial");
    const valor = await campoTermo.inputValue();
    expect(valor).toBe("reagente laboratorial");

    await page.screenshot({ path: "tests/results/p7_t4_campo_termo.png", fullPage: true });
    console.log("T4 PASS: Campo termo funcional com placeholder correto");
  });

  test("T5: Checkboxes - Calcular score + Incluir encerrados", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    const cbScore = page.locator('label:has-text("Calcular score de aderencia")').first();
    await expect(cbScore).toBeVisible();

    const cbEncerrados = page.locator('label:has-text("Incluir editais encerrados")').first();
    await expect(cbEncerrados).toBeVisible();

    await page.screenshot({ path: "tests/results/p7_t5_checkboxes.png", fullPage: true });
    console.log("T5 PASS: 2 checkboxes presentes (score + encerrados)");
  });

  test("T6: Card Monitoramento Automatico visivel", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    // Scroll para o card de monitoramento
    const cardMonitoramento = page.locator("text=Monitoramento Automatico").first();
    await cardMonitoramento.scrollIntoViewIfNeeded();
    await expect(cardMonitoramento).toBeVisible();

    // Verificar botao Atualizar
    const btnAtualizar = page.locator('button:has-text("Atualizar")').last();
    await expect(btnAtualizar).toBeVisible();

    // Verificar mensagem ou lista de monitoramentos
    const temMensagem = await page.locator("text=Nenhum monitoramento configurado").isVisible().catch(() => false);
    const temMonitoramentos = await page.locator("text=Monitoramentos ativos").isVisible().catch(() => false);

    await page.screenshot({ path: "tests/results/p7_t6_monitoramento.png", fullPage: true });
    console.log(`T6 PASS: Card Monitoramento visivel, ${temMonitoramentos ? "com monitoramentos ativos" : "nenhum configurado"}`);
  });

  test("T7: API - GET /api/crud/monitoramentos", async () => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/crud/monitoramentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    const items = data.items || data || [];
    expect(Array.isArray(items)).toBeTruthy();
    console.log(`T7 PASS: API monitoramentos retornou ${items.length} item(s)`);
  });

  test("T8: Filtro UF - 28 opcoes (Todas + 27 estados)", async ({ page }) => {
    await loginAndGoToCaptacao(page);

    const selectUF = page.locator('.form-field:has(.form-field-label:text("UF")) select').first();
    await expect(selectUF).toBeVisible();

    const options = await selectUF.locator("option").allTextContents();
    expect(options.length).toBe(28); // Todas + 27 UFs

    // Verificar alguns estados especificos
    const textoJunto = options.join(",");
    expect(textoJunto).toContain("Todas");
    expect(textoJunto).toContain("Sao Paulo");
    expect(textoJunto).toContain("Minas Gerais");
    expect(textoJunto).toContain("Rio de Janeiro");
    expect(textoJunto).toContain("Bahia");
    expect(textoJunto).toContain("Distrito Federal");

    await page.screenshot({ path: "tests/results/p7_t8_filtro_uf.png", fullPage: true });
    console.log(`T8 PASS: ${options.length} opcoes de UF (Todas + 27 estados)`);
  });

  test("T9: Screenshots completos dos filtros", async ({ page }) => {
    await loginAndGoToCaptacao(page);
    await page.waitForTimeout(1000);

    // Screenshot 1: Formulario completo
    await page.screenshot({ path: "tests/results/p7_t9_01_formulario_completo.png", fullPage: true });

    // Screenshot 2: Selects visiveis
    const selectTipo = page.locator('.form-field:has(.form-field-label:text("Classificacao Tipo")) select').first();
    await selectTipo.scrollIntoViewIfNeeded();
    await page.screenshot({ path: "tests/results/p7_t9_02_classificacoes.png", fullPage: true });

    // Screenshot 3: Monitoramento
    const cardMon = page.locator("text=Monitoramento Automatico").first();
    await cardMon.scrollIntoViewIfNeeded();
    await page.screenshot({ path: "tests/results/p7_t9_03_monitoramento.png", fullPage: true });

    console.log("T9 PASS: 3 screenshots capturados");
  });
});
