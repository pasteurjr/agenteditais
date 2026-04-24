/**
 * TESTE DA PÁGINA 2 — EMPRESA (WORKFLOW SISTEMA.pdf)
 * Seguindo EXATAMENTE o TESTEPAGINA2.md
 * Playwright E2E tests
 */
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';
const API_URL = 'http://localhost:5007';
const EMAIL = 'pasteurjr@gmail.com';
const PASSWORD = '123456';
const EMPRESA_ID = '7dbdc60a-b806-4614-a024-a1d4841dc8c9';

let authToken: string;

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  return data.access_token;
}

async function loginAndGoToEmpresa(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500);

  // Se tiver tela de login, fazer login
  const loginBtn = page.locator('button:has-text("Entrar"), button:has-text("Login")').first();
  if (await loginBtn.count() > 0) {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(EMAIL);
      await page.locator('input[type="password"]').first().fill(PASSWORD);
      await loginBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // A pagina Empresa fica no grupo "CONFIGURACOES" do sidebar
  // 1. Expandir secao "Configuracoes"
  const configHeader = page.locator('.nav-section-header:has(.nav-section-label:text("Configuracoes"))');
  await configHeader.click();
  await page.waitForTimeout(500);

  // 2. Clicar no botao "Empresa" dentro dos items da secao
  const empresaBtn = page.locator('.nav-section-items .nav-item:has(.nav-item-label:text("Empresa"))').first();
  await empresaBtn.click();
  await page.waitForTimeout(2000);
}

// Helper: localizar campo de input por label text
async function getFieldByLabel(page: Page, labelText: string) {
  // FormField renders: <div class="form-field"><label class="form-field-label">Label</label><div class="text-input-wrapper"><input class="text-input"/></div></div>
  const field = page.locator(`.form-field:has(.form-field-label:text("${labelText}")) input.text-input`).first();
  return field;
}

test.describe.serial('PÁGINA 2 — EMPRESA (TESTEPAGINA2.md)', () => {

  test.beforeAll(async () => {
    authToken = await getAuthToken();
  });

  // =====================================================
  // TESTE 1 — Cadastro Completo da Empresa (13 campos + emails + celulares)
  // =====================================================
  test('TESTE 1: Cadastro completo - preencher 13 campos + emails + celulares, salvar e verificar persistencia', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Screenshot ANTES
    await page.screenshot({ path: 'tests/results/t1_01_antes.png', fullPage: true });

    // Verificar que estamos na pagina Empresa
    await expect(page.locator('h1:has-text("Dados da Empresa")')).toBeVisible({ timeout: 5000 });

    // ---- PREENCHER OS 13 CAMPOS ----

    // 1. Razao Social
    const razaoInput = await getFieldByLabel(page, 'Razao Social');
    await razaoInput.fill('');
    await razaoInput.fill('Aquila Diagnostico Ltda');

    // 2. Nome Fantasia
    const nomeInput = await getFieldByLabel(page, 'Nome Fantasia');
    await nomeInput.fill('');
    await nomeInput.fill('Aquila');

    // 3. CNPJ
    const cnpjInput = await getFieldByLabel(page, 'CNPJ');
    await cnpjInput.fill('');
    await cnpjInput.fill('12.345.678/0001-90');

    // 4. Inscricao Estadual
    const ieInput = await getFieldByLabel(page, 'Inscricao Estadual');
    await ieInput.fill('');
    await ieInput.fill('123.456.789.012');

    // 5. Website
    const websiteInput = await getFieldByLabel(page, 'Website');
    await websiteInput.fill('');
    await websiteInput.fill('http://aquila.com.br');

    // 6. Instagram
    const igInput = await getFieldByLabel(page, 'Instagram');
    await igInput.fill('');
    await igInput.fill('@aquila_diagnostico');

    // 7. LinkedIn
    const liInput = await getFieldByLabel(page, 'LinkedIn');
    await liInput.fill('');
    await liInput.fill('aquila-diagnostico-ltda');

    // 8. Facebook
    const fbInput = await getFieldByLabel(page, 'Facebook');
    await fbInput.fill('');
    await fbInput.fill('aquiladiagnostico');

    // 9. Endereco
    const endInput = await getFieldByLabel(page, 'Endereco');
    await endInput.fill('');
    await endInput.fill('Rua das Analises, 500');

    // 10. Cidade
    const cidadeInput = await getFieldByLabel(page, 'Cidade');
    await cidadeInput.fill('');
    await cidadeInput.fill('Sao Paulo');

    // 11. UF
    const ufInput = await getFieldByLabel(page, 'UF');
    await ufInput.fill('');
    await ufInput.fill('SP');

    // 12. CEP
    const cepInput = await getFieldByLabel(page, 'CEP');
    await cepInput.fill('');
    await cepInput.fill('01310-100');

    // Screenshot apos preencher campos
    await page.screenshot({ path: 'tests/results/t1_02_campos_preenchidos.png', fullPage: true });

    // ---- EMAILS ----
    // Primeiro limpar emails existentes (clicar X em cada um)
    let removeButtons = page.locator('.multi-field-item .btn-icon-small');
    let count = await removeButtons.count();
    for (let i = count - 1; i >= 0; i--) {
      await removeButtons.nth(i).click();
      await page.waitForTimeout(200);
    }

    // 13a. Adicionar email 1
    const emailInput = page.locator('.multi-field-add input[type="email"]').first();
    await emailInput.fill('contato@aquila.com.br');
    await page.locator('.multi-field-add button:has-text("Adicionar")').first().click();
    await page.waitForTimeout(300);

    // 13b. Adicionar email 2
    await emailInput.fill('vendas@aquila.com.br');
    await page.locator('.multi-field-add button:has-text("Adicionar")').first().click();
    await page.waitForTimeout(300);

    // 14a. Adicionar celular 1
    const celInput = page.locator('.multi-field-add input[placeholder="Novo telefone..."]').first();
    await celInput.fill('(11) 99999-0001');
    // O botao Adicionar de celulares e o segundo botao Adicionar na pagina
    const addBtns = page.locator('.multi-field-add button:has-text("Adicionar")');
    await addBtns.nth(1).click();
    await page.waitForTimeout(300);

    // 14b. Adicionar celular 2
    await celInput.fill('(11) 98888-0002');
    await addBtns.nth(1).click();
    await page.waitForTimeout(300);

    // Screenshot apos emails e celulares
    await page.screenshot({ path: 'tests/results/t1_03_com_emails_celulares.png', fullPage: true });

    // ---- SALVAR ----
    const salvarBtn = page.locator('button:has-text("Salvar Alteracoes")').first();
    await salvarBtn.click();
    await page.waitForTimeout(2000);

    // Screenshot apos salvar
    await page.screenshot({ path: 'tests/results/t1_04_apos_salvar.png', fullPage: true });

    // ---- VERIFICAR PERSISTENCIA: navegar para outra pagina e voltar ----
    // (SPA: reload volta ao Dashboard, entao navegar de volta)
    await page.reload();
    await page.waitForTimeout(2000);
    // Re-navegar para Empresa
    await loginAndGoToEmpresa(page);

    // Screenshot apos reload
    await page.screenshot({ path: 'tests/results/t1_05_apos_reload.png', fullPage: true });

    // Verificar que os campos persistiram
    const razaoVal = await (await getFieldByLabel(page, 'Razao Social')).inputValue();
    const nomeVal = await (await getFieldByLabel(page, 'Nome Fantasia')).inputValue();
    const cnpjVal = await (await getFieldByLabel(page, 'CNPJ')).inputValue();
    const ieVal = await (await getFieldByLabel(page, 'Inscricao Estadual')).inputValue();
    const webVal = await (await getFieldByLabel(page, 'Website')).inputValue();
    const igVal = await (await getFieldByLabel(page, 'Instagram')).inputValue();
    const liVal = await (await getFieldByLabel(page, 'LinkedIn')).inputValue();
    const fbVal = await (await getFieldByLabel(page, 'Facebook')).inputValue();
    const endVal = await (await getFieldByLabel(page, 'Endereco')).inputValue();
    const cidVal = await (await getFieldByLabel(page, 'Cidade')).inputValue();
    const ufVal = await (await getFieldByLabel(page, 'UF')).inputValue();
    const cepVal = await (await getFieldByLabel(page, 'CEP')).inputValue();

    // Verificar emails na lista
    const emailItems = page.locator('.multi-field-item span');
    const emailTexts = await emailItems.allTextContents();

    // Verificar celulares
    // Os celulares sao os items depois dos emails
    // Todos multi-field-item spans contem tanto emails quanto celulares

    const resultado = {
      razao_social: razaoVal,
      nome_fantasia: nomeVal,
      cnpj: cnpjVal,
      inscricao_estadual: ieVal,
      website: webVal,
      instagram: igVal,
      linkedin: liVal,
      facebook: fbVal,
      endereco: endVal,
      cidade: cidVal,
      uf: ufVal,
      cep: cepVal,
      emails_celulares: emailTexts,
    };

    console.log('TESTE 1 RESULTADO:', JSON.stringify(resultado, null, 2));

    // ASSERTIONS
    expect(razaoVal).toBe('Aquila Diagnostico Ltda');
    expect(nomeVal).toBe('Aquila');
    expect(cnpjVal).toBe('12.345.678/0001-90');
    expect(webVal).toBe('http://aquila.com.br');
    expect(igVal).toContain('aquila_diagnostico');
    expect(liVal).toBe('aquila-diagnostico-ltda');
    expect(fbVal).toBe('aquiladiagnostico');
    expect(cidVal).toBe('Sao Paulo');
    expect(ufVal).toBe('SP');
    expect(cepVal).toBe('01310-100');

    // Verificar que emails e celulares estao na lista
    const allItems = emailTexts.join(',');
    expect(allItems).toContain('contato@aquila.com.br');
    expect(allItems).toContain('vendas@aquila.com.br');
    expect(allItems).toContain('(11) 99999-0001');
    expect(allItems).toContain('(11) 98888-0002');
  });

  // =====================================================
  // TESTE 1b — Remover um email e verificar persistencia
  // =====================================================
  test('TESTE 1b: Remover email vendas@ e verificar persistencia', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Encontrar o item com "vendas@aquila.com.br" e clicar no X
    const vendasItem = page.locator('.multi-field-item:has(span:text("vendas@aquila.com.br")) .btn-icon-small');
    if (await vendasItem.count() > 0) {
      await vendasItem.click();
      await page.waitForTimeout(300);

      // Salvar
      await page.locator('button:has-text("Salvar Alteracoes")').click();
      await page.waitForTimeout(2000);

      // Recarregar (SPA: reload vai ao Dashboard, re-navegar)
      await page.reload();
      await page.waitForTimeout(1000);
      await loginAndGoToEmpresa(page);

      const items = await page.locator('.multi-field-item span').allTextContents();
      console.log('TESTE 1b RESULTADO:', JSON.stringify({ items_apos_remocao: items }));

      expect(items.join(',')).toContain('contato@aquila.com.br');
      expect(items.join(',')).not.toContain('vendas@aquila.com.br');
    } else {
      console.log('TESTE 1b: vendas@aquila.com.br nao encontrado - pode ter sido removido antes');
    }

    await page.screenshot({ path: 'tests/results/t1b_apos_remocao_email.png', fullPage: true });
  });

  // =====================================================
  // TESTE 2 — Upload de Documentos (9 tipos via UI)
  // =====================================================
  test('TESTE 2: Upload de documento via UI - Contrato Social', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Scroll para o card "Documentos da Empresa"
    const docCard = page.locator('text=Documentos da Empresa').first();
    await docCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Clicar botao "Upload Documento"
    const uploadBtn = page.locator('button:has-text("Upload Documento")').first();
    await expect(uploadBtn).toBeVisible({ timeout: 5000 });
    await uploadBtn.click();
    await page.waitForTimeout(1000);

    // Screenshot do modal aberto
    await page.screenshot({ path: 'tests/results/t2_01_modal_upload.png', fullPage: true });

    // Verificar que modal esta aberto
    const modal = page.locator('.modal-overlay, [class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Selecionar tipo "Contrato Social"
    const selectTipo = page.locator('select.select-input').first();
    await selectTipo.selectOption('Contrato Social');

    // Verificar todos os tipos disponiveis no select
    const options = await page.locator('select.select-input option').allTextContents();
    const tiposDisponiveis = options.filter(o => o.trim() && o !== 'Selecione...');
    console.log('TESTE 2 - Tipos disponiveis no modal:', JSON.stringify(tiposDisponiveis));

    // Verificar que os 9 tipos do WORKFLOW estao presentes
    const tiposEsperados = [
      'Contrato Social', 'Procuracao', 'AFE', 'CBPAD', 'CBPP',
      'Corpo de Bombeiros', 'Habilitacao Economica', 'Habilitacao Fiscal', 'Qualificacao Tecnica'
    ];
    const tiposFaltando: string[] = [];
    for (const t of tiposEsperados) {
      if (!tiposDisponiveis.some(d => d.includes(t))) {
        tiposFaltando.push(t);
      }
    }

    // Preencher validade
    const validadeInput = page.locator('input[type="date"]').first();
    await validadeInput.fill('2027-12-31');

    // Screenshot com dados preenchidos
    await page.screenshot({ path: 'tests/results/t2_02_modal_preenchido.png', fullPage: true });

    // Clicar Enviar
    const enviarBtn = page.locator('button:has-text("Enviar")').first();
    await enviarBtn.click();
    await page.waitForTimeout(2000);

    // Screenshot apos envio
    await page.screenshot({ path: 'tests/results/t2_03_apos_envio.png', fullPage: true });

    console.log('TESTE 2 RESULTADO:', JSON.stringify({
      modal_abriu: true,
      tipos_no_select: tiposDisponiveis.length,
      tipos_esperados_presentes: tiposEsperados.length - tiposFaltando.length,
      tipos_faltando: tiposFaltando,
    }, null, 2));

    // Assert: todos os 9 tipos do WORKFLOW devem estar no select
    expect(tiposFaltando).toHaveLength(0);
  });

  // =====================================================
  // TESTE 2b — Upload real dos 9 tipos via API
  // =====================================================
  test('TESTE 2b: API - Upload dos 9 tipos de documentos do WORKFLOW', async () => {
    const tipos = [
      'contrato_social', 'procuracao', 'afe', 'cbpad', 'cbpp',
      'bombeiros', 'habilitacao_economica', 'habilitacao_fiscal', 'qualificacao_tecnica',
    ];

    const pdfBuf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF');

    const resultados: Record<string, unknown>[] = [];

    for (const tipo of tipos) {
      const formData = new FormData();
      formData.append('file', new Blob([pdfBuf], { type: 'application/pdf' }), `${tipo}_teste.pdf`);
      formData.append('tipo', tipo);
      formData.append('empresa_id', EMPRESA_ID);
      formData.append('data_vencimento', '2027-12-31');

      const res = await fetch(`${API_URL}/api/empresa-documentos/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
      });
      const data = await res.json();
      resultados.push({ tipo, status: res.status, success: data.success, error: data.error });
    }

    const todosOk = resultados.every(r => r.status === 200 || r.status === 201);
    const falharam = resultados.filter(r => r.status !== 200 && r.status !== 201);

    console.log('TESTE 2b RESULTADO:', JSON.stringify({
      total_tipos: tipos.length,
      todos_ok: todosOk,
      falharam,
      resultados,
    }, null, 2));

    expect(todosOk).toBe(true);
  });

  // =====================================================
  // TESTE 2c — Download de documento
  // =====================================================
  test('TESTE 2c: API - Download de documento uploadado', async () => {
    const listRes = await fetch(`${API_URL}/api/crud/empresa-documentos?parent_id=${EMPRESA_ID}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    const docs = listData.items || [];

    let downloadOk = false;
    if (docs.length > 0) {
      const docId = docs[0].id;
      const dlRes = await fetch(`${API_URL}/api/empresa-documentos/${docId}/download`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      downloadOk = dlRes.status === 200;
    }

    console.log('TESTE 2c RESULTADO:', JSON.stringify({
      total_documentos: docs.length,
      download_testado: docs.length > 0,
      download_ok: downloadOk,
    }, null, 2));

    expect(docs.length).toBeGreaterThan(0);
    expect(downloadOk).toBe(true);
  });

  // =====================================================
  // TESTE 2d — Exclusao de documento via API
  // =====================================================
  test('TESTE 2d: API - Exclusao de documento', async () => {
    // Listar docs e pegar o mais recente (de teste)
    const listRes = await fetch(`${API_URL}/api/crud/empresa-documentos?parent_id=${EMPRESA_ID}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    const docs = listData.items || [];
    const testDoc = docs.find((d: Record<string, unknown>) => String(d.nome_arquivo ?? '').includes('_teste.pdf'));

    let deleteOk = false;
    if (testDoc) {
      const delRes = await fetch(`${API_URL}/api/crud/empresa-documentos/${testDoc.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      deleteOk = delRes.status === 200 || delRes.status === 204;
    }

    // Verificar que foi removido
    const listRes2 = await fetch(`${API_URL}/api/crud/empresa-documentos?parent_id=${EMPRESA_ID}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const listData2 = await listRes2.json();
    const docsApos = listData2.items || [];

    console.log('TESTE 2d RESULTADO:', JSON.stringify({
      docs_antes: docs.length,
      doc_excluido: testDoc ? testDoc.nome_arquivo : 'N/A',
      delete_ok: deleteOk,
      docs_apos: docsApos.length,
    }, null, 2));

    expect(deleteOk).toBe(true);
    expect(docsApos.length).toBeLessThan(docs.length);
  });

  // =====================================================
  // TESTE 3 — Certidoes Automaticas
  // =====================================================
  test('TESTE 3: API - Busca automatica de 5 certidoes', async () => {
    const res = await fetch(`${API_URL}/api/empresa-certidoes/buscar-automatica`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipos: ['cnd_federal', 'cnd_estadual', 'cnd_municipal', 'fgts', 'trabalhista'],
        empresa_id: EMPRESA_ID
      }),
    });
    const data = await res.json();

    const resultados = (data.resultados || []).map((r: Record<string, unknown>) => ({
      tipo: r.tipo,
      status: r.status,
      url_consulta: r.url_consulta,
      orgao: (r.certidao as Record<string, unknown>)?.orgao_emissor,
    }));

    console.log('TESTE 3 RESULTADO:', JSON.stringify({
      http_status: res.status,
      success: data.success,
      message: data.message,
      cnpj: data.cnpj,
      total_certidoes: resultados.length,
      resultados,
    }, null, 2));

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(resultados.length).toBeGreaterThanOrEqual(4);

    // Verificar que as principais certidoes tem URL de consulta
    // cnd_municipal pode nao ter URL padrao (varia por cidade)
    for (const r of resultados) {
      if (r.tipo !== 'cnd_municipal') {
        expect(r.url_consulta).toBeTruthy();
      }
    }
  });

  // =====================================================
  // TESTE 3b — Certidoes na UI
  // =====================================================
  test('TESTE 3b: UI - Verificar card Certidoes Automaticas', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Scroll para certidoes
    const certCard = page.locator('text=Certidoes Automaticas').first();
    await certCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'tests/results/t3_01_certidoes_card.png', fullPage: true });

    // Verificar que o card existe
    await expect(certCard).toBeVisible();

    // Verificar botao "Buscar Certidoes"
    const buscarBtn = page.locator('button:has-text("Buscar Certidoes")').first();
    const btnExists = await buscarBtn.count() > 0;
    const btnDisabled = btnExists ? await buscarBtn.isDisabled() : true;

    // Verificar linhas de certidoes na tabela
    const certRows = page.locator('table tbody tr, .data-table-row');
    const certCount = await certRows.count();

    console.log('TESTE 3b RESULTADO:', JSON.stringify({
      card_visivel: true,
      botao_buscar_existe: btnExists,
      botao_desabilitado: btnDisabled,
      certidoes_na_tabela: certCount,
    }));
  });

  // =====================================================
  // TESTE 4 — Responsaveis (adicionar via UI)
  // =====================================================
  test('TESTE 4: UI - Adicionar responsavel via modal', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Scroll para card Responsaveis
    const respCard = page.locator('text=Responsaveis').first();
    await respCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Contar responsaveis antes
    const rowsBefore = await page.locator('table:below(:text("Responsaveis")) tbody tr').count().catch(() => 0);

    // Clicar "Adicionar"
    // O botao Adicionar do card Responsaveis esta no header do card
    const addBtnResp = page.locator('button:has-text("Adicionar")').last();
    await addBtnResp.click();
    await page.waitForTimeout(1000);

    // Screenshot do modal
    await page.screenshot({ path: 'tests/results/t4_01_modal_responsavel.png', fullPage: true });

    // Preencher campos do modal
    // O modal tem: Nome, Cargo, Email, Telefone
    const modalInputs = page.locator('.modal-overlay input.text-input, [class*="modal"] input.text-input');
    const inputCount = await modalInputs.count();

    if (inputCount >= 4) {
      await modalInputs.nth(0).fill('Joao Carlos Silva');
      await modalInputs.nth(1).fill('Diretor Tecnico');
      await modalInputs.nth(2).fill('joao.silva@aquila.com.br');
      await modalInputs.nth(3).fill('(11) 97777-0003');
    }

    await page.screenshot({ path: 'tests/results/t4_02_modal_preenchido.png', fullPage: true });

    // Clicar Salvar
    const salvarBtn = page.locator('button:has-text("Salvar")').last();
    await salvarBtn.click();
    await page.waitForTimeout(2000);

    // Screenshot apos salvar
    await page.screenshot({ path: 'tests/results/t4_03_apos_salvar.png', fullPage: true });

    // Verificar que o responsavel aparece
    const pageText = await page.textContent('body');
    const temJoao = pageText?.includes('Joao Carlos Silva') || pageText?.includes('João Carlos Silva');

    console.log('TESTE 4 RESULTADO:', JSON.stringify({
      modal_abriu: inputCount >= 4,
      campos_preenchidos: inputCount,
      responsavel_aparece: temJoao,
    }));

    expect(temJoao).toBe(true);
  });

  // =====================================================
  // TESTE 4b — Adicionar segundo responsavel e depois excluir
  // =====================================================
  test('TESTE 4b: UI - Adicionar segundo responsavel e excluir', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Scroll para Responsaveis
    const respCard = page.locator('text=Responsaveis').first();
    await respCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Adicionar Maria Souza
    const addBtn = page.locator('button:has-text("Adicionar")').last();
    await addBtn.click();
    await page.waitForTimeout(1000);

    const modalInputs = page.locator('.modal-overlay input.text-input, [class*="modal"] input.text-input');
    if (await modalInputs.count() >= 4) {
      await modalInputs.nth(0).fill('Maria Souza');
      await modalInputs.nth(1).fill('Gerente Comercial');
      await modalInputs.nth(2).fill('maria@aquila.com.br');
      await modalInputs.nth(3).fill('(11) 96666-0004');
    }

    await page.locator('button:has-text("Salvar")').last().click();
    await page.waitForTimeout(2000);

    // Verificar que Maria aparece
    const temMaria = (await page.textContent('body'))?.includes('Maria Souza');

    // Excluir Maria (clicar no botao lixeira da linha dela)
    // Setup dialog handler para o confirm()
    page.on('dialog', dialog => dialog.accept());

    const mariaRow = page.locator('tr:has-text("Maria Souza"), .data-table-row:has-text("Maria Souza")').first();
    if (await mariaRow.count() > 0) {
      const deleteBtn = mariaRow.locator('button[title="Excluir"], button.danger').first();
      if (await deleteBtn.count() > 0) {
        await deleteBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Verificar que Maria foi removida
    const temMariaApos = (await page.textContent('body'))?.includes('Maria Souza');

    await page.screenshot({ path: 'tests/results/t4b_apos_exclusao.png', fullPage: true });

    console.log('TESTE 4b RESULTADO:', JSON.stringify({
      maria_adicionada: temMaria,
      maria_removida: !temMariaApos,
    }));

    expect(temMaria).toBe(true);
    expect(temMariaApos).toBe(false);
  });

  // =====================================================
  // TESTE 7 — Gerar classes/subclasses via IA (API)
  // =====================================================
  test('TESTE 7: API - Gerar classes/subclasses via IA', async () => {
    const res = await fetch(`${API_URL}/api/parametrizacoes/gerar-classes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    const classesResumo = (data.classes || []).map((c: Record<string, unknown>) => ({
      nome: c.nome,
      ncm: c.ncm_principal || c.ncm_sugerido,
      subclasses: ((c.subclasses as Record<string, unknown>[]) || []).length,
    }));

    console.log('TESTE 7 RESULTADO:', JSON.stringify({
      http_status: res.status,
      success: data.success,
      total_produtos: data.total_produtos,
      total_classes: classesResumo.length,
      classes: classesResumo,
    }, null, 2));

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(classesResumo.length).toBeGreaterThan(0);
  });

  // =====================================================
  // TESTE 10 — SMTP config
  // =====================================================
  test('TESTE 10: API - Verificar SMTP configurado', async () => {
    const res = await fetch(`${API_URL}/api/notificacoes/config-smtp`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await res.json();

    console.log('TESTE 10 RESULTADO:', JSON.stringify({
      http_status: res.status,
      smtp_configurado: data.smtp_configurado,
      smtp_host: data.smtp_host,
    }));

    expect(res.status).toBe(200);
  });

  // =====================================================
  // TESTE 11 — Screenshots finais da pagina completa
  // =====================================================
  test('TESTE 11: UI - Screenshots completos e verificacao geral', async ({ page }) => {
    await loginAndGoToEmpresa(page);

    // Screenshot pagina inteira
    await page.screenshot({ path: 'tests/results/t11_01_pagina_completa.png', fullPage: true });

    // Verificar presenca dos 4 cards
    const cards = {
      cadastrais: await page.locator('text=Informacoes Cadastrais').count() > 0,
      documentos: await page.locator('text=Documentos da Empresa').count() > 0,
      certidoes: await page.locator('text=Certidoes Automaticas').count() > 0,
      responsaveis: await page.locator('text=Responsaveis').count() > 0,
    };

    // Verificar campos preenchidos
    const razaoVal = await (await getFieldByLabel(page, 'Razao Social')).inputValue();
    const cnpjVal = await (await getFieldByLabel(page, 'CNPJ')).inputValue();
    const webVal = await (await getFieldByLabel(page, 'Website')).inputValue();
    const igVal = await (await getFieldByLabel(page, 'Instagram')).inputValue();
    const cidVal = await (await getFieldByLabel(page, 'Cidade')).inputValue();
    const ufVal = await (await getFieldByLabel(page, 'UF')).inputValue();

    // Scroll para ver tudo
    await page.evaluate(() => window.scrollTo(0, 9999));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/results/t11_02_pagina_scroll.png', fullPage: true });

    console.log('TESTE 11 RESULTADO:', JSON.stringify({
      url: page.url(),
      cards,
      campos_verificados: {
        razao_social: razaoVal,
        cnpj: cnpjVal,
        website: webVal,
        instagram: igVal,
        cidade: cidVal,
        uf: ufVal,
      },
    }, null, 2));

    // Assertions
    expect(cards.cadastrais).toBe(true);
    expect(cards.documentos).toBe(true);
    expect(cards.certidoes).toBe(true);
    expect(cards.responsaveis).toBe(true);
    expect(razaoVal).toBeTruthy();
    expect(cnpjVal).toBeTruthy();
  });
});
