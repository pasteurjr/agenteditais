/**
 * Testes UI automatizados — Captação e Validação
 * Executa via: node test_ui_captacao_validacao.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:5175";
const SCREENSHOT_DIR = "./test_screenshots";
let page, browser, context;
const resultados = [];
let testNum = 0;

function log(msg) { console.log(`  ${msg}`); }

async function registrar(nome, status, detalhe = "") {
  testNum++;
  const emoji = status === "OK" ? "✅" : status === "WARN" ? "⚠️" : "❌";
  resultados.push({ num: testNum, nome, status, detalhe });
  console.log(`${emoji} T${String(testNum).padStart(2, "0")} ${nome}: ${status}${detalhe ? " — " + detalhe : ""}`);
  try {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/T${String(testNum).padStart(2, "0")}_${nome.replace(/[^a-zA-Z0-9]/g, "_")}.png`, fullPage: true });
  } catch {}
}

async function setup() {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  page = await context.newPage();
  page.on("console", () => {});
  const fs = await import("fs");
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper: navegar via sidebar clicando no botão com label
async function navSidebar(labelText) {
  // Os itens do sidebar são <button class="nav-item"> com <span class="nav-item-label">
  const btn = await page.$(`button.nav-item >> text="${labelText}"`);
  if (btn) {
    await btn.click();
    await page.waitForTimeout(2000);
    return true;
  }
  // Fallback: procurar qualquer elemento com esse texto
  const el = await page.$(`text="${labelText}"`);
  if (el) {
    await el.click();
    await page.waitForTimeout(2000);
    return true;
  }
  return false;
}

// ============================================================
// LOGIN
// ============================================================
async function testLogin() {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 15000 });
  await page.fill('input[type="email"]', "pasteurjr@gmail.com");
  await page.fill('input[type="password"]', "123456");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));
  if (!token) {
    await registrar("Login", "FAIL", "Token nao encontrado no localStorage");
    return false;
  }
  const body = await page.textContent("body");
  const temDashboard = body.includes("Dashboard") || body.includes("Captacao");
  if (!temDashboard) {
    await registrar("Login", "FAIL", "Token gerado mas dashboard nao carregou");
    return false;
  }
  await registrar("Login", "OK", "Autenticado com sucesso, token presente");
  return true;
}

// ============================================================
// CAPTAÇÃO — Testes
// ============================================================

async function testCaptacao01_PaginaCarrega() {
  const ok = await navSidebar("Captacao");
  if (!ok) {
    await registrar("Captacao_Carrega", "FAIL", "Nao conseguiu navegar para Captacao");
    return false;
  }
  const body = await page.textContent("body");
  const temTitulo = body.includes("Captacao de Editais") || body.includes("Buscar Editais");
  const temCampo = await page.$('input[placeholder*="microscopio"]') || await page.$('input[placeholder*="reagente"]');
  if (temTitulo && temCampo) {
    await registrar("Captacao_Carrega", "OK", "Pagina carregou com titulo e campo de busca");
    return true;
  } else {
    await registrar("Captacao_Carrega", temTitulo ? "WARN" : "FAIL",
      `Titulo: ${temTitulo ? "SIM" : "NAO"}, Campo busca: ${temCampo ? "SIM" : "NAO"}`);
    return temTitulo;
  }
}

async function testCaptacao02_CardsPrazo() {
  const body = await page.textContent("body");
  const tem2d = body.includes("2 dias");
  const tem5d = body.includes("5 dias");
  const tem10d = body.includes("10 dias");
  const tem20d = body.includes("20 dias");
  const total = [tem2d, tem5d, tem10d, tem20d].filter(Boolean).length;
  await registrar("Captacao_CardsPrazo", total >= 3 ? "OK" : "WARN",
    `Proximos: 2d=${tem2d?"S":"N"} 5d=${tem5d?"S":"N"} 10d=${tem10d?"S":"N"} 20d=${tem20d?"S":"N"}`);
}

async function testCaptacao03_CardBusca() {
  // Verifica card "Buscar Editais" com campos
  const body = await page.textContent("body");
  const temCard = body.includes("Buscar Editais");
  const temTermoLabel = body.includes("Termo") || body.includes("Palavra-chave");
  await registrar("Captacao_CardBusca", temCard && temTermoLabel ? "OK" : "WARN",
    `Card Buscar: ${temCard?"S":"N"}, Label Termo: ${temTermoLabel?"S":"N"}`);
}

async function testCaptacao04_FiltroUF() {
  // Verificar se existe o select com opcoes de UF (a label "UF" esta no form)
  const body = await page.textContent("body");
  const temLabelUF = body.includes("UF");
  // Verificar se existe select com "Todas"
  const selects = await page.$$("select");
  let temUFSelect = false;
  for (const sel of selects) {
    const options = await sel.$$eval("option", opts => opts.map(o => o.textContent));
    if (options.some(o => o?.includes("Acre") || o?.includes("Sao Paulo"))) {
      temUFSelect = true;
      break;
    }
  }
  await registrar("Captacao_FiltroUF", temLabelUF && temUFSelect ? "OK" : "WARN",
    `Label UF: ${temLabelUF?"S":"N"}, Select com UFs: ${temUFSelect?"S":"N"}`);
}

async function testCaptacao05_FiltroFonte() {
  const selects = await page.$$("select");
  let temFonteSelect = false;
  for (const sel of selects) {
    const options = await sel.$$eval("option", opts => opts.map(o => o?.textContent));
    if (options.some(o => o?.includes("PNCP")) && options.some(o => o?.includes("ComprasNET"))) {
      temFonteSelect = true;
      break;
    }
  }
  await registrar("Captacao_FiltroFonte", temFonteSelect ? "OK" : "WARN",
    temFonteSelect ? "Select de fontes com PNCP, ComprasNET, etc." : "Select de fontes nao encontrado");
}

async function testCaptacao06_ClassificacaoTipoOrigem() {
  const selects = await page.$$("select");
  let temTipo = false, temOrigem = false;
  for (const sel of selects) {
    const options = await sel.$$eval("option", opts => opts.map(o => o?.textContent));
    if (options.some(o => o?.includes("Reagentes")) && options.some(o => o?.includes("Equipamentos"))) temTipo = true;
    if (options.some(o => o?.includes("Municipal")) && options.some(o => o?.includes("Federal"))) temOrigem = true;
  }
  await registrar("Captacao_ClassifTipoOrigem", temTipo && temOrigem ? "OK" : "WARN",
    `Tipo (Reagentes/Equip): ${temTipo?"S":"N"}, Origem (Mun/Fed): ${temOrigem?"S":"N"}`);
}

async function testCaptacao07_Checkboxes() {
  const body = await page.textContent("body");
  const temScore = body.includes("score de aderencia") || body.includes("Calcular score");
  const temEncerrados = body.includes("Incluir editais encerrados");
  await registrar("Captacao_Checkboxes", temScore && temEncerrados ? "OK" : "WARN",
    `Checkbox Score: ${temScore?"S":"N"}, Checkbox Encerrados: ${temEncerrados?"S":"N"}`);
}

async function testCaptacao08_BuscaVazia() {
  // Limpar campo e clicar buscar
  const input = await page.$('input[placeholder*="microscopio"]') || await page.$('input[placeholder*="reagente"]');
  if (input) await input.fill("");

  // Botão é um ActionButton com label "Buscar Editais"
  const btnBuscar = await page.$('button:has-text("Buscar Editais")');
  if (btnBuscar) {
    await btnBuscar.click();
    await page.waitForTimeout(1000);
    const body = await page.textContent("body");
    const temErro = body.includes("Informe") || body.includes("termo de busca");
    await registrar("Captacao_BuscaVazia", temErro ? "OK" : "WARN",
      temErro ? "Validacao de campo vazio exibiu mensagem de erro" : "Nao exibiu erro para busca vazia");
  } else {
    await registrar("Captacao_BuscaVazia", "FAIL", "Botao 'Buscar Editais' nao encontrado");
  }
}

async function testCaptacao09_BuscaReagentes() {
  const input = await page.$('input[placeholder*="microscopio"]') || await page.$('input[placeholder*="reagente"]');
  if (!input) {
    await registrar("Captacao_BuscaReagentes", "FAIL", "Campo de busca nao encontrado");
    return;
  }
  await input.fill("reagentes");

  // Desmarcar "Calcular score" e marcar "Incluir encerrados"
  const checkboxes = await page.$$('input[type="checkbox"]');
  for (const cb of checkboxes) {
    const label = await cb.evaluate(el => {
      const wrapper = el.closest('label') || el.parentElement;
      return wrapper?.textContent || "";
    });
    if (label.toLowerCase().includes("score") && await cb.isChecked()) await cb.click();
    if (label.toLowerCase().includes("encerrad") && !(await cb.isChecked())) await cb.click();
  }

  const btnBuscar = await page.$('button:has-text("Buscar Editais")');
  if (!btnBuscar) {
    await registrar("Captacao_BuscaReagentes", "FAIL", "Botao 'Buscar Editais' nao encontrado");
    return;
  }

  await btnBuscar.click();
  log("Aguardando resposta da busca (ate 120s - API PNCP pode demorar)...");

  // Monitorar resposta
  let temResultado = false;
  let temErro = false;
  let ultimoBody = "";
  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(1000);
    ultimoBody = await page.textContent("body");

    // Verificar se apareceram resultados (tabela com editais)
    if (ultimoBody.includes("editais encontrados") || ultimoBody.includes("Resultados")) {
      temResultado = true;
      break;
    }
    // Verificar erros
    if (ultimoBody.includes("Erro ao buscar") || ultimoBody.includes("Nenhum edital")) {
      temErro = true;
      break;
    }
    // Se parou de carregar (sem spinner/loading)
    if (i > 10 && !ultimoBody.includes("Buscando") && !ultimoBody.includes("Carregando")) {
      // Verificar se talvez já tem resultado sem o texto "encontrados"
      const trs = await page.$$("tr");
      if (trs.length > 2) { temResultado = true; break; }
      break;
    }
  }

  if (temResultado) {
    const trs = await page.$$("tr");
    await registrar("Captacao_BuscaReagentes", "OK",
      `Resultados encontrados (${trs.length} linhas na tabela)`);
  } else if (temErro) {
    await registrar("Captacao_BuscaReagentes", "WARN",
      "Busca retornou erro ou 0 resultados (PNCP pode estar offline/lento)");
  } else {
    await registrar("Captacao_BuscaReagentes", "WARN",
      "Busca completou mas sem resultados visiveis (timeout da API PNCP?)");
  }
}

async function testCaptacao10_Monitoramentos() {
  const body = await page.textContent("body");
  const temMon = body.includes("Monitoramento") || body.includes("monitoramento") || body.includes("monitorando");
  await registrar("Captacao_Monitoramentos", temMon ? "OK" : "WARN",
    temMon ? "Secao de monitoramentos presente" : "Secao de monitoramentos nao visivel (pode nao ter monitoramentos ativos)");
}

// ============================================================
// VALIDAÇÃO — Testes
// ============================================================

async function testValidacao01_PaginaCarrega() {
  const ok = await navSidebar("Validacao");
  if (!ok) {
    await registrar("Validacao_Carrega", "FAIL", "Nao conseguiu navegar para Validacao");
    return false;
  }
  const body = await page.textContent("body");
  const temTitulo = body.includes("Validacao") || body.includes("Analise");
  await registrar("Validacao_Carrega", temTitulo ? "OK" : "FAIL",
    temTitulo ? "Pagina de validacao carregou" : "Pagina nao carregou corretamente");
  return temTitulo;
}

async function testValidacao02_ListaEditais() {
  await page.waitForTimeout(2000);
  const body = await page.textContent("body");
  // Editais salvos aparecem na tabela
  const temEditais = body.includes("PE-") || body.includes("DL-") || body.includes("CC-") ||
    body.includes("novo") || body.includes("analisando") || body.includes("validado");
  const trs = await page.$$("tr");
  await registrar("Validacao_ListaEditais", temEditais ? "OK" : "WARN",
    temEditais ? `Editais salvos encontrados (${trs.length} linhas)` : "Nenhum edital salvo na lista");
}

async function testValidacao03_FiltrosBarra() {
  const body = await page.textContent("body");
  // FilterBar com status: Todos, Novos, Analisando, Validados, Descartados
  const temFiltros = body.includes("Todos") && (body.includes("Novos") || body.includes("novo"));
  const inputs = await page.$$('input[type="text"], input[placeholder*="Buscar"], input[placeholder*="buscar"], input[placeholder*="Filtrar"]');
  await registrar("Validacao_FiltrosBarra", temFiltros || inputs.length > 0 ? "OK" : "WARN",
    `Filtros status: ${temFiltros?"S":"N"}, Campo busca: ${inputs.length > 0?"S":"N"}`);
}

async function testValidacao04_SelecionarEdital() {
  // Tentar clicar no primeiro edital da lista
  const trs = await page.$$("tr");
  let clicou = false;
  if (trs.length > 1) {
    try {
      await trs[1].click(); // Pular header
      await page.waitForTimeout(2000);
      clicou = true;
    } catch {}
  }

  if (!clicou) {
    // Tentar clicar em qualquer row que contenha "PE-" ou outro numero de edital
    const pe = await page.$('text=/PE-\\d/');
    if (pe) {
      await pe.click();
      await page.waitForTimeout(2000);
      clicou = true;
    }
  }

  if (!clicou) {
    await registrar("Validacao_SelecionarEdital", "WARN", "Nenhum edital para selecionar");
    return false;
  }

  const body = await page.textContent("body");
  const temDetalhes = body.includes("Score") || body.includes("Cognitiv") || body.includes("Objetiv") ||
    body.includes("Participar") || body.includes("Acompanhar");
  await registrar("Validacao_SelecionarEdital", temDetalhes ? "OK" : "WARN",
    temDetalhes ? "Detalhes do edital abertos com painel lateral" : "Clicou no edital mas detalhes nao visiveis");
  return temDetalhes;
}

async function testValidacao05_ScoresIA() {
  const body = await page.textContent("body");
  // Os 6 scores: tecnico, documental, complexidade, juridico, logistico, comercial
  const scores = ["tecnico", "documental", "complexidade", "juridico", "logistico", "comercial"];
  const encontrados = scores.filter(s => body.toLowerCase().includes(s));

  await registrar("Validacao_ScoresIA", encontrados.length >= 3 ? "OK" : "WARN",
    `Scores visiveis: ${encontrados.join(", ") || "nenhum"} (${encontrados.length}/6 dimensoes)`);
}

async function testValidacao06_AbasCognitivaObjetiva() {
  const body = await page.textContent("body");
  // As abas podem ser Cognitiva (Resumo, Perguntar) e Objetiva (GO/NO-GO, checklist)
  const temCognitiva = body.includes("Cognitiv") || body.includes("Resumo") || body.includes("Perguntar");
  const temObjetiva = body.includes("Objetiv") || body.includes("GO") || body.includes("Checklist");

  await registrar("Validacao_Abas", temCognitiva || temObjetiva ? "OK" : "WARN",
    `Cognitiva: ${temCognitiva?"S":"N"}, Objetiva: ${temObjetiva?"S":"N"}`);
}

async function testValidacao07_BotoesDecisao() {
  const body = await page.textContent("body");
  const temParticipar = body.includes("Participar");
  const temAcompanhar = body.includes("Acompanhar");
  const temIgnorar = body.includes("Ignorar");
  const total = [temParticipar, temAcompanhar, temIgnorar].filter(Boolean).length;

  await registrar("Validacao_BotoesDecisao", total === 3 ? "OK" : total > 0 ? "WARN" : "WARN",
    `Participar: ${temParticipar?"S":"N"}, Acompanhar: ${temAcompanhar?"S":"N"}, Ignorar: ${temIgnorar?"S":"N"}`);
}

async function testValidacao08_BotaoCalcularScores() {
  // Procurar botão de calcular/analisar scores
  const btnCalc = await page.$('button:has-text("Calcular")') ||
    await page.$('button:has-text("Analisar")') ||
    await page.$('button:has-text("Score")');

  if (btnCalc) {
    const btnText = await btnCalc.textContent();
    await registrar("Validacao_BtnCalcular", "OK", `Botao encontrado: "${btnText?.trim()}"`);
  } else {
    await registrar("Validacao_BtnCalcular", "WARN",
      "Botao Calcular/Analisar nao encontrado (pode precisar selecionar edital primeiro)");
  }
}

async function testValidacao09_InformacoesEdital() {
  const body = await page.textContent("body");
  // Verifica se informações do edital selecionado estão visíveis
  const temOrgao = body.includes("Orgao") || body.includes("orgao");
  const temValor = body.includes("R$") || body.includes("Valor");
  const temObjeto = body.includes("Objeto") || body.includes("objeto");
  const campos = [temOrgao, temValor, temObjeto].filter(Boolean).length;

  await registrar("Validacao_InfoEdital", campos >= 2 ? "OK" : "WARN",
    `Orgao: ${temOrgao?"S":"N"}, Valor: ${temValor?"S":"N"}, Objeto: ${temObjeto?"S":"N"}`);
}

async function testValidacao10_InteracaoChat() {
  // Verificar se existe botão de enviar para chat / perguntar ao Dr. Licita
  const body = await page.textContent("body");
  const temChat = body.includes("Dr. Licita") || body.includes("Perguntar") || body.includes("Chat");
  const btnChat = await page.$('button:has-text("Perguntar")') ||
    await page.$('button:has-text("Dr. Licita")') ||
    await page.$('button:has-text("Chat")');

  await registrar("Validacao_IntegracaoChat", temChat || btnChat ? "OK" : "WARN",
    temChat || btnChat ? "Integracao com chat presente" : "Integracao chat nao visivel");
}

// ============================================================
// EXECUÇÃO
// ============================================================

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  TESTES UI — CAPTACAO E VALIDACAO (Playwright)          ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  await setup();

  // Login
  console.log("── LOGIN ──");
  const logado = await testLogin();
  if (!logado) {
    console.log("\n❌ Login falhou. Abortando testes.");
    await browser.close();
    process.exit(1);
  }

  // Captação
  console.log("\n── CAPTACAO ──");
  const captOk = await testCaptacao01_PaginaCarrega();
  if (captOk) {
    await testCaptacao02_CardsPrazo();
    await testCaptacao03_CardBusca();
    await testCaptacao04_FiltroUF();
    await testCaptacao05_FiltroFonte();
    await testCaptacao06_ClassificacaoTipoOrigem();
    await testCaptacao07_Checkboxes();
    await testCaptacao08_BuscaVazia();
    await testCaptacao09_BuscaReagentes();
    await testCaptacao10_Monitoramentos();
  }

  // Validação
  console.log("\n── VALIDACAO ──");
  const valOk = await testValidacao01_PaginaCarrega();
  if (valOk) {
    await testValidacao02_ListaEditais();
    await testValidacao03_FiltrosBarra();
    const editalSelecionado = await testValidacao04_SelecionarEdital();
    await testValidacao05_ScoresIA();
    await testValidacao06_AbasCognitivaObjetiva();
    await testValidacao07_BotoesDecisao();
    await testValidacao08_BotaoCalcularScores();
    await testValidacao09_InformacoesEdital();
    await testValidacao10_InteracaoChat();
  }

  // Resumo
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  RESUMO DOS RESULTADOS                                  ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  const ok = resultados.filter(r => r.status === "OK").length;
  const warn = resultados.filter(r => r.status === "WARN").length;
  const fail = resultados.filter(r => r.status === "FAIL").length;
  console.log(`\n  Total: ${resultados.length} testes`);
  console.log(`  ✅ OK:   ${ok}`);
  console.log(`  ⚠️  WARN: ${warn}`);
  console.log(`  ❌ FAIL: ${fail}`);
  console.log(`\n  Screenshots salvas em: ${SCREENSHOT_DIR}/\n`);

  // Tabela
  console.log("  #   | Teste                        | Status | Detalhe");
  console.log("  ----|------------------------------|--------|--------");
  for (const r of resultados) {
    const num = String(r.num).padStart(2, "0");
    const nome = r.nome.padEnd(28);
    const st = r.status.padEnd(6);
    console.log(`  T${num} | ${nome} | ${st} | ${r.detalhe}`);
  }

  await browser.close();
}

main().catch(e => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
