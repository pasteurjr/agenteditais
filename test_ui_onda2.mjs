import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = '/mnt/data1/progpython/agenteditais/test_screenshots';
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const results = [];
function log(msg) { console.log(`[TEST] ${msg}`); results.push(msg); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  try {
    // === LOGIN ===
    log('1. LOGIN');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[placeholder*="email" i], input[type="email"]', 'pasteurjr@gmail.com');
    await page.fill('input[type="password"]', 'test1234');
    await page.click('button:has-text("Entrar")');
    await sleep(3000);

    const loggedIn = (await page.textContent('body')).includes('Dashboard');
    log(`   Login: ${loggedIn ? 'OK' : 'FALHOU'}`);
    if (!loggedIn) { await browser.close(); return; }
    await page.screenshot({ path: `${DIR}/01_dashboard.png` });

    // === DASHBOARD ===
    log('2. DASHBOARD');
    const dash = await page.textContent('body');
    log(`   Editais urgentes: ${dash.includes('PE-001') || dash.includes('PE-003') ? 'SIM' : 'NAO'}`);
    log(`   Funil: ${dash.includes('Captacao') && dash.includes('Validacao') ? 'SIM' : 'NAO'}`);
    log(`   Valor Total: ${dash.includes('R$') ? 'SIM' : 'NAO'}`);

    // === Helper: click sidebar ===
    async function goTo(label, screenshot) {
      await page.click(`text="${label}"`);
      await sleep(2500);
      await page.screenshot({ path: `${DIR}/${screenshot}` });
    }

    // === CAPTACAO ===
    log('3. CAPTACAO');
    await goTo('Captacao', '02_captacao.png');
    let t = await page.textContent('body');
    log(`   Titulo: ${t.includes('Captacao de Editais') ? 'OK' : 'NAO'}`);
    log(`   Buscar Editais: ${t.includes('Buscar Editais') ? 'OK' : 'NAO'}`);
    log(`   Monitoramento: ${t.includes('Monitoramento') ? 'OK' : 'NAO'}`);
    log(`   Filtros (UF, Fonte, Tipo): ${t.includes('UF') && t.includes('Fonte') ? 'OK' : 'NAO'}`);

    // Test search
    const searchInput = await page.$('input[placeholder*="microscopio" i], input[placeholder*="reagente" i], input[placeholder*="Ex:" i]');
    if (searchInput) {
      await searchInput.fill('reagente');
      const buscarBtn = await page.$('button:has-text("Buscar Editais")');
      if (buscarBtn) {
        log('   Buscando "reagente"...');
        await buscarBtn.click();
        await sleep(10000); // PNCP API can be slow
        await page.screenshot({ path: `${DIR}/03_captacao_busca.png` });
        t = await page.textContent('body');
        const hasResults = t.includes('Score') || t.includes('score') || t.includes('PE-') ||
                          t.includes('Nenhum') || t.includes('resultado') || t.includes('edital');
        log(`   Resultado busca: ${hasResults ? 'SIM' : 'NAO'}`);
      }
    } else {
      log('   Input busca nao encontrado (placeholder diferente)');
      // Try any visible input in the page content area
      const inputs = await page.$$('input[type="text"]');
      if (inputs.length > 0) {
        log(`   ${inputs.length} inputs text encontrados`);
      }
    }

    // === VALIDACAO ===
    log('4. VALIDACAO');
    await goTo('Validacao', '04_validacao.png');
    t = await page.textContent('body');

    // Check real data
    const realData = ['PE-001', 'PE-003', 'DL-010', 'CC-002', 'PE-015', 'Hospital', 'FHEMIG', 'UPA Norte'];
    const found = realData.filter(d => t.includes(d));
    log(`   Editais reais encontrados: ${found.length > 0 ? found.join(', ') : 'NENHUM'}`);
    log(`   Mock removido: ${!t.includes('Pregão Eletrônico 001/2024') ? 'SIM' : 'NAO'}`);

    // Check score elements
    log(`   Score/Aderencia: ${t.includes('Score') || t.includes('score') || t.includes('Aderencia') ? 'SIM' : 'NAO'}`);
    log(`   Filtro status: ${t.includes('Novo') || t.includes('novo') || t.includes('status') ? 'SIM' : 'NAO'}`);

    // Try clicking first edital row
    const rows = await page.$$('tr');
    if (rows.length > 2) {
      log(`   ${rows.length} linhas na tabela, clicando na 2a...`);
      await rows[1].click();
      await sleep(2000);
      await page.screenshot({ path: `${DIR}/05_validacao_detail.png` });
      t = await page.textContent('body');

      log(`   Detalhes edital: ${t.includes('Técnic') || t.includes('Documental') || t.includes('Jurídic') || t.includes('Participar') ? 'SIM' : 'NAO'}`);
      log(`   Aba Objetiva: ${t.includes('Objetiva') ? 'SIM' : 'NAO'}`);
      log(`   Aba Cognitiva: ${t.includes('Cognitiva') ? 'SIM' : 'NAO'}`);
      log(`   Decisao btns: ${t.includes('Participar') || t.includes('Acompanhar') || t.includes('Ignorar') ? 'SIM' : 'NAO'}`);
    }

    // === PRECIFICACAO ===
    log('5. PRECIFICACAO');
    await goTo('Precificacao', '06_precificacao.png');
    t = await page.textContent('body');
    log(`   Titulo precificacao: ${t.includes('Precificacao') || t.includes('Preco') || t.includes('preco') ? 'SIM' : 'NAO'}`);

    // === PROPOSTA ===
    log('6. PROPOSTA');
    await goTo('Proposta', '07_proposta.png');
    t = await page.textContent('body');
    log(`   Titulo proposta: ${t.includes('Proposta') || t.includes('Gerar') ? 'SIM' : 'NAO'}`);
    log(`   Dados reais: ${t.includes('R$') || t.includes('Rascunho') || t.includes('rascunho') ? 'SIM' : 'NAO'}`);
    log(`   Tabela propostas: ${t.includes('EDITAL') || t.includes('ORGAO') || t.includes('STATUS') ? 'SIM' : 'NAO'}`);

    // === SUBMISSAO ===
    log('7. SUBMISSAO');
    await goTo('Submissao', '08_submissao.png');
    t = await page.textContent('body');
    log(`   Titulo submissao: ${t.includes('Submiss') || t.includes('submiss') ? 'SIM' : 'NAO'}`);
    log(`   Workflow status: ${t.includes('Status') || t.includes('Enviar') || t.includes('aguardando') ? 'SIM' : 'NAO'}`);

    // === SUMMARY ===
    log('');
    log('=== ERROS CONSOLE (únicos) ===');
    const unique = [...new Set(errors)];
    if (unique.length === 0) log('   Nenhum erro!');
    else unique.slice(0, 10).forEach(e => log(`   ${e.substring(0, 120)}`));
    log(`   Total: ${unique.length}`);

  } catch (err) {
    log(`FATAL: ${err.message}`);
    await page.screenshot({ path: `${DIR}/ERROR.png` });
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(50));
  results.forEach(r => console.log(r));
})();
