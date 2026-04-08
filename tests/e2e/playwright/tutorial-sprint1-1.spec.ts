import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA } from "./helpers";

// ──────────────────────────────────────────────────────────
// Tutorial Sprint 1 — Conjunto 1 — CH Hospitalar
// Empresa real: CH Hospitalar Comércio de Equipamentos Médicos e Hospitalares Ltda.
// CNPJ: 43.712.232/0001-85 — São Paulo/SP
// Validação automatizada dos UC-F01 a UC-F17
// ──────────────────────────────────────────────────────────

const DIR = "runtime/screenshots/tutorial-sprint1-1";
fs.mkdirSync(DIR, { recursive: true });

const SS = (step: string) => `${DIR}/${step}.png`;
const FIXTURE_PDF = "tests/fixtures/teste_upload.pdf";

// Helper: preencher campo pelo label do FormField
const fillByLabel = async (page: any, labelText: string, value: string) => {
  const field = page.locator(`.form-field:has(.form-field-label:has-text("${labelText}"))`).first();
  if (await field.count() > 0) {
    const input = field.locator('.text-input, input, textarea').first();
    if (await input.count() > 0) {
      await input.click({ clickCount: 3 });
      await input.fill(value);
      await input.dispatchEvent('change');
    }
  }
};

// ─── UC-F01: Cadastro Principal da Empresa ────────────────
test.describe("UC-F01: Cadastro Principal da Empresa", () => {
  test("Preencher e salvar dados cadastrais da CH Hospitalar", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Screenshot inicial — página carregada com dados da empresa atual
    await page.screenshot({ path: SS("F01_01_pagina_empresa"), fullPage: true });

    // ── Razão Social ──
    await fillByLabel(page, "Razao Social", "CH Hospitalar Comércio de Equipamentos Médicos e Hospitalares Ltda.");
    await page.waitForTimeout(300);
    await page.screenshot({ path: SS("F01_02_razao_social"), fullPage: true });

    // ── Nome Fantasia, CNPJ, IE ──
    await fillByLabel(page, "Nome Fantasia", "CH Hospitalar");
    await fillByLabel(page, "CNPJ", "43.712.232/0001-85");
    await fillByLabel(page, "Inscricao Estadual", "136.432.789.110");
    await page.screenshot({ path: SS("F01_03_cnpj"), fullPage: true });

    // ── Presença Digital ──
    await fillByLabel(page, "Website", "https://www.chhospitalar.com.br");
    await fillByLabel(page, "Instagram", "chhospitalar");
    await fillByLabel(page, "LinkedIn", "ch-hospitalar-equipamentos");
    await fillByLabel(page, "Facebook", "CHHospitalar");
    await page.screenshot({ path: SS("F01_04_redes_sociais"), fullPage: true });

    // ── Endereço ──
    await fillByLabel(page, "Endereco", "Rua Maria Curupaiti, 627, Andar 3 Sala 02");
    await fillByLabel(page, "Cidade", "Sao Paulo");
    await fillByLabel(page, "UF", "SP");
    await fillByLabel(page, "CEP", "02452-001");
    await page.screenshot({ path: SS("F01_05_endereco"), fullPage: true });

    // ── Salvar ──
    const btnSalvar = page.locator('button:has-text("Salvar Alteracoes"), button:has-text("Salvar Alterações")').first();
    if (await btnSalvar.count() > 0) {
      await btnSalvar.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: SS("F01_06_salvo"), fullPage: true });

    const bodyAfter = await getBody(page);
    expect(bodyAfter.length).toBeGreaterThan(100);
  });
});

// ─── UC-F02: Contatos, Emails e Área Padrão ──────────────
test.describe("UC-F02: Contatos, Emails e Area Padrao", () => {
  test("Adicionar emails, telefones e area padrao", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Fechar qualquer modal aberto
    if (await page.locator('.modal-overlay').count() > 0) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // Scroll para seção de contatos
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("F02_01_secao_contatos"), fullPage: true });

    // ── Adicionar 3 emails ──
    const emails = ["licitacoes@chhospitalar.com.br", "comercial@chhospitalar.com.br", "fiscal@chhospitalar.com.br"];
    for (const email of emails) {
      const emailInput = page.locator('input[placeholder="Novo email..."]').first();
      if (await emailInput.count() > 0) {
        await emailInput.clear();
        await emailInput.fill(email);
        // Botão Adicionar imediatamente após o input de email
        const addBtn = page.locator('input[placeholder="Novo email..."] ~ button, input[placeholder="Novo email..."] + button').first();
        if (await addBtn.count() > 0) {
          await addBtn.click();
        } else {
          // fallback: primeiro botão Adicionar fora de modal
          await page.locator('button:has-text("Adicionar")').first().click();
        }
        await page.waitForTimeout(500);
      }
    }
    await page.screenshot({ path: SS("F02_02_emails_adicionados"), fullPage: true });

    // ── Adicionar 2 telefones ──
    const telefones = ["(11) 2934-5600", "(11) 98723-4100"];
    for (const tel of telefones) {
      const telInput = page.locator('input[placeholder="Novo telefone..."]').first();
      if (await telInput.count() > 0) {
        await telInput.clear();
        await telInput.fill(tel);
        const addBtnTel = page.locator('input[placeholder="Novo telefone..."] ~ button, input[placeholder="Novo telefone..."] + button').first();
        if (await addBtnTel.count() > 0) {
          await addBtnTel.click();
        } else {
          // Fechar modal se abriu antes de tentar o fallback
          if (await page.locator('.modal-overlay').count() > 0) {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(500);
          }
          const addBtns = page.locator('button:has-text("Adicionar")');
          const btnCount = await addBtns.count();
          // Clicar no último botão Adicionar visível fora de modal
          for (let bi = btnCount - 1; bi >= 0; bi--) {
            const btn = addBtns.nth(bi);
            if (await btn.isVisible() && await btn.isEnabled()) {
              await btn.click();
              break;
            }
          }
        }
        await page.waitForTimeout(500);
      }
    }
    await page.screenshot({ path: SS("F02_03_telefones_adicionados"), fullPage: true });

    // Fechar modal se abriu por engano
    if (await page.locator('.modal-overlay').count() > 0) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // ── Área Padrão ──
    const areaSelectField = page.locator('.form-field:has(.form-field-label:has-text("Area de Atuacao Padrao"))').first();
    if (await areaSelectField.count() > 0) {
      const areaSelect = areaSelectField.locator('select').first();
      if (await areaSelect.count() > 0) {
        const options = await areaSelect.locator('option').allTextContents();
        const areaOpt = options.find(o => o.toLowerCase().includes("equip") || o.toLowerCase().includes("hospital") || o.toLowerCase().includes("med"));
        if (areaOpt) {
          await areaSelect.selectOption({ label: areaOpt.trim() });
        } else if (options.length > 1) {
          // Selecionar primeira opção real
          const vals = await areaSelect.locator('option').evaluateAll(
            (opts: HTMLOptionElement[]) => opts.filter(o => o.value !== "").map(o => o.value)
          );
          if (vals.length > 0) await areaSelect.selectOption(vals[0]);
        }
      }
    }
    await page.screenshot({ path: SS("F02_04_area_padrao"), fullPage: true });

    // ── Salvar ──
    const btnSalvar = page.locator('button:has-text("Salvar Alteracoes"), button:has-text("Salvar Alterações")').first();
    if (await btnSalvar.count() > 0) {
      await btnSalvar.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: SS("F02_05_salvo"), fullPage: true });
  });
});

// ─── UC-F03: Upload de Documentos ─────────────────────────
test.describe("UC-F03: Upload de Documentos da Empresa", () => {
  test("Upload de 3 documentos com tipos e validades diferentes", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Scroll para seção de documentos
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("F03_01_secao_documentos"), fullPage: true });

    const validades = ["2026-12-31", "", "2025-12-31"];

    for (let i = 0; i < 3; i++) {
      // Clicar "Upload Documento" — botão fora do modal
      const uploadBtn = page.locator('button:has-text("Upload Documento")').first();
      if (await uploadBtn.count() === 0) break;

      await uploadBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS(`F03_02_modal_doc${i + 1}`), fullPage: true });

      // Tipo de Documento — select dentro do modal (options dinâmicas do banco)
      const tipoSelect = page.locator('.modal select, .modal .select-input').first();
      if (await tipoSelect.count() > 0) {
        const optionValues = await tipoSelect.locator('option').evaluateAll(
          (opts: HTMLOptionElement[]) => opts.filter(o => o.value !== "").map(o => ({ v: o.value, t: o.text }))
        );
        if (optionValues.length > i) {
          await tipoSelect.selectOption(optionValues[i].v);
          await page.waitForTimeout(300);
        } else if (optionValues.length > 0) {
          await tipoSelect.selectOption(optionValues[0].v);
          await page.waitForTimeout(300);
        }
      }

      // Arquivo
      const fileInput = page.locator('.modal input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(FIXTURE_PDF);
        await page.waitForTimeout(500);
      }

      // Validade
      if (validades[i]) {
        const dateInput = page.locator('.modal input[type="date"]').first();
        if (await dateInput.count() > 0) {
          await dateInput.fill(validades[i]);
        }
      }
      await page.screenshot({ path: SS(`F03_03_formulario_doc${i + 1}`), fullPage: true });

      // Enviar — aguardar enabled
      const enviarBtn = page.locator('button:has-text("Enviar")').last();
      try {
        await enviarBtn.waitFor({ state: "visible", timeout: 5000 });
        if (await enviarBtn.isEnabled()) {
          await enviarBtn.click();
          await page.waitForTimeout(3000);
        } else {
          await page.locator('button:has-text("Cancelar")').last().click().catch(() => {});
          await page.waitForTimeout(1000);
        }
      } catch {
        await page.locator('button:has-text("Cancelar")').last().click().catch(() => {});
        await page.waitForTimeout(1000);
      }
      // Aguardar modal sumir verificando que botão Upload Documento é clicável
      await page.waitForTimeout(1000);
      // Fechar qualquer modal residual via Escape
      const hasResidualModal = await page.locator('button:has-text("Cancelar")').count();
      if (hasResidualModal > 0) {
        await page.locator('button:has-text("Cancelar")').last().click().catch(() => {});
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: SS(`F03_04_doc${i + 1}_salvo`), fullPage: true });
    }

    // Lista final de documentos
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("F03_05_lista_documentos"), fullPage: true });
  });
});

// ─── UC-F04: Certidões Automáticas e Manuais ──────────────
test.describe("UC-F04: Certidoes Automaticas e Manuais", () => {
  test("Buscar certidoes, upload manual e edicao", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Scroll para seção Certidões
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("F04_01_secao_certidoes"), fullPage: true });

    // Frequência Semanal
    const freqSelect = page.locator('select').filter({ has: page.locator('option:has-text("Semanal")') }).first();
    if (await freqSelect.count() > 0) {
      await freqSelect.selectOption("semanal");
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: SS("F04_02_frequencia_semanal"), fullPage: true });

    // Buscar Certidões
    const buscarBtn = page.locator('button:has-text("Buscar Certidoes"), button:has-text("Buscar Certidões")').first();
    if (await buscarBtn.count() > 0 && await buscarBtn.isEnabled()) {
      await buscarBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: SS("F04_03_busca_em_andamento"), fullPage: true });
      await page.waitForTimeout(25000);
      await page.screenshot({ path: SS("F04_04_busca_concluida"), fullPage: true });
    }

    // Upload manual — botão com title "Upload PDF"
    const uploadCertBtn = page.locator('button[title*="Upload"], button[title*="upload"]').first();
    if (await uploadCertBtn.count() > 0) {
      await uploadCertBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("F04_05_modal_upload_certidao"), fullPage: true });

      // Arquivo primeiro (habilita Enviar)
      const fileInput = page.locator('.modal input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(FIXTURE_PDF);
        await page.waitForTimeout(500);
      }

      const dateInput = page.locator('.modal input[type="date"]').first();
      if (await dateInput.count() > 0) await dateInput.fill("2026-06-30");

      const numInput = page.locator('input[placeholder*="12345"], input[placeholder*="Numero da certidao"]').first();
      if (await numInput.count() > 0) await numInput.fill("CND-2025-12345");

      await page.screenshot({ path: SS("F04_06_upload_preenchido"), fullPage: true });

      const enviarBtn = page.locator('.modal button:has-text("Enviar")').first();
      try {
        await enviarBtn.waitFor({ state: "visible", timeout: 5000 });
        if (await enviarBtn.isEnabled()) {
          await enviarBtn.click();
          await page.waitForTimeout(5000);
        } else {
          await page.keyboard.press("Escape");
          await page.waitForTimeout(500);
        }
      } catch {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: SS("F04_07_upload_salvo"), fullPage: true });
    }

    // Editar certidão — clicar no ícone de lápis/editar da primeira linha
    const editCertBtn = page.locator('button[title*="Editar"], button[title*="editar"], button[title*="Detalhe"]').first();
    if (await editCertBtn.count() > 0) {
      await editCertBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("F04_08_modal_editar_certidao"), fullPage: true });

      // Campos dentro do modal de detalhe
      const modal = page.locator('.modal-overlay').last();
      const statusSelect = modal.locator('select').first();
      if (await statusSelect.count() > 0) {
        await statusSelect.selectOption("valida");
      }

      const dateInput2 = modal.locator('input[type="date"]').first();
      if (await dateInput2.count() > 0) await dateInput2.fill("2026-06-30");

      await page.screenshot({ path: SS("F04_09_edicao_preenchida"), fullPage: true });

      const salvarBtn = modal.locator('button:has-text("Salvar")').first();
      if (await salvarBtn.count() > 0) {
        await salvarBtn.click();
        await page.waitForTimeout(3000);
      } else {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: SS("F04_10_edicao_salva"), fullPage: true });
    }

    await page.screenshot({ path: SS("F04_11_resultado_final"), fullPage: true });
  });
});

// ─── UC-F05: Cadastro de Responsáveis ─────────────────────
test.describe("UC-F05: Cadastro de Responsaveis", () => {
  test("Adicionar 3 responsaveis", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Scroll para seção Responsáveis (final da página)
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("F05_01_secao_responsaveis"), fullPage: true });

    const responsaveis = [
      { tipo: "representante_legal", nome: "Diego Ricardo Munoz", cargo: "Socio-Administrador", email: "diego.munoz@chhospitalar.com.br", tel: "(11) 98723-4100" },
      { tipo: "preposto", nome: "Carla Regina Souza", cargo: "Gerente de Licitacoes", email: "carla.souza@chhospitalar.com.br", tel: "(11) 2934-5601" },
      { tipo: "tecnico", nome: "Dr. Paulo Roberto Menezes", cargo: "Engenheiro Biomedico", email: "paulo.menezes@chhospitalar.com.br", tel: "(11) 2934-5602" },
    ];

    for (let i = 0; i < responsaveis.length; i++) {
      const resp = responsaveis[i];

      // Botão Adicionar Responsável (no card de responsáveis)
      const addBtn = page.locator('button:has-text("Adicionar")').last();
      if (await addBtn.count() === 0) continue;
      await addBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS(`F05_02_modal_resp${i + 1}`), fullPage: true });

      // Tipo — select com "Selecione o tipo..."
      const tipoSelect = page.locator('select').filter({ has: page.locator('option[value="representante_legal"]') }).first();
      if (await tipoSelect.count() > 0) {
        await tipoSelect.selectOption(resp.tipo);
      }

      // Nome — primeiro .text-input dentro do modal (campo Nome)
      const nomeField = page.locator('.modal .form-field:has(.form-field-label:has-text("Nome"))').first();
      if (await nomeField.count() > 0) {
        const nomeInput = nomeField.locator('.text-input').first();
        await nomeInput.clear();
        await nomeInput.fill(resp.nome);
      }

      // Cargo
      const cargoField = page.locator('.modal .form-field:has(.form-field-label:has-text("Cargo"))').first();
      if (await cargoField.count() > 0) {
        const cargoInput = cargoField.locator('.text-input').first();
        await cargoInput.clear();
        await cargoInput.fill(resp.cargo);
      }

      // Email
      const emailField = page.locator('.modal .form-field:has(.form-field-label:has-text("Email"))').first();
      if (await emailField.count() > 0) {
        const emailInput = emailField.locator('.text-input, input[type="email"]').first();
        await emailInput.clear();
        await emailInput.fill(resp.email);
      }

      // Telefone
      const telField = page.locator('.modal .form-field:has(.form-field-label:has-text("Telefone"))').first();
      if (await telField.count() > 0) {
        const telInput = telField.locator('.text-input').first();
        await telInput.clear();
        await telInput.fill(resp.tel);
      }

      await page.screenshot({ path: SS(`F05_03_resp${i + 1}_preenchido`), fullPage: true });

      // Salvar
      const salvarBtn = page.locator('.modal button:has-text("Salvar")').first();
      if (await salvarBtn.count() > 0) {
        await salvarBtn.click();
        await page.waitForTimeout(2000);
      }
      await page.screenshot({ path: SS(`F05_04_resp${i + 1}_salvo`), fullPage: true });
    }

    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SS("F05_05_lista_responsaveis"), fullPage: true });

    const bodyFinal = await getBody(page);
    expect(bodyFinal).toContain("Diego Ricardo");
  });
});

// ─── UC-F14: Configurar Pesos e Limiares ──────────────────
test.describe("UC-F14: Configurar Pesos e Limiares do Score", () => {
  test("Definir pesos e limiares GO/NO-GO", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Parametrizacoes");
    await page.waitForTimeout(2000);

    await clickTab(page, "Score");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F14_01_aba_score"), fullPage: true });

    // Preencher todos os inputs number (pesos)
    const pesoInputs = page.locator('input[type="number"]');
    const count = await pesoInputs.count();
    const pesoValues = ["0.25", "0.20", "0.10", "0.15", "0.15", "0.15"];
    for (let i = 0; i < Math.min(6, count); i++) {
      await pesoInputs.nth(i).click({ clickCount: 3 });
      await pesoInputs.nth(i).fill(pesoValues[i]);
    }
    await page.screenshot({ path: SS("F14_02_pesos_preenchidos"), fullPage: true });
    await page.screenshot({ path: SS("F14_03_soma_verificada"), fullPage: true });

    const salvarPesosBtn = page.locator('button:has-text("Salvar Pesos")').first();
    if (await salvarPesosBtn.count() > 0) {
      await salvarPesosBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F14_04_pesos_salvos"), fullPage: true });

    // Limiares
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    const limiarValues = ["70", "40", "65", "35", "80", "50"];
    for (let i = 6; i < Math.min(12, count); i++) {
      await pesoInputs.nth(i).click({ clickCount: 3 });
      await pesoInputs.nth(i).fill(limiarValues[i - 6]);
    }
    await page.screenshot({ path: SS("F14_05_limiares_preenchidos"), fullPage: true });

    const salvarLimiaresBtn = page.locator('button:has-text("Salvar Limiares")').first();
    if (await salvarLimiaresBtn.count() > 0) {
      await salvarLimiaresBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F14_06_limiares_salvos"), fullPage: true });
  });
});

// ─── UC-F15: Parâmetros Comerciais ────────────────────────
test.describe("UC-F15: Parametros Comerciais", () => {
  test("Configurar regiao, prazo, mercado, custos e modalidades", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Parametrizacoes");
    await page.waitForTimeout(2000);

    await clickTab(page, "Comercial");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F15_01_aba_comercial"), fullPage: true });

    // Estados
    const estados = ["SP", "RJ", "MG", "RS", "PR", "SC", "DF", "GO", "BA", "PE"];
    for (const uf of estados) {
      const ufBtn = page.locator(`button.estado-btn:has-text("${uf}")`).first();
      if (await ufBtn.count() > 0) {
        const isSelected = await ufBtn.evaluate(el => el.classList.contains("selected"));
        if (!isSelected) {
          await ufBtn.click();
          await page.waitForTimeout(200);
        }
      }
    }
    await page.screenshot({ path: SS("F15_02_estados_selecionados"), fullPage: true });

    const salvarEstBtn = page.locator('button:has-text("Salvar Estados")').first();
    if (await salvarEstBtn.count() > 0) {
      await salvarEstBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F15_03_estados_salvos"), fullPage: true });

    // Prazo
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    const prazoInput = page.locator('input[type="number"]').first();
    if (await prazoInput.count() > 0) {
      await prazoInput.click({ clickCount: 3 });
      await prazoInput.fill("30");
    }

    const salvarPrazoBtn = page.locator('button:has-text("Salvar Prazo")').first();
    if (await salvarPrazoBtn.count() > 0) {
      await salvarPrazoBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F15_04_prazo_salvo"), fullPage: true });

    // Mercado
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    const fillLabelPage = async (labelText: string, value: string) => {
      const field = page.locator(`.form-field:has(.form-field-label:has-text("${labelText}"))`).first();
      if (await field.count() > 0) {
        const input = field.locator('input').first();
        if (await input.count() > 0) {
          await input.click({ clickCount: 3 });
          await input.fill(value);
        }
      }
    };
    await fillLabelPage("TAM", "12500000000");
    await fillLabelPage("SAM", "2800000000");
    await fillLabelPage("SOM", "180000000");

    const salvarMercBtn = page.locator('button:has-text("Salvar Mercado")').first();
    if (await salvarMercBtn.count() > 0) {
      await salvarMercBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F15_05_mercado_salvo"), fullPage: true });

    // Custos
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(500);
    await fillLabelPage("Markup", "28");
    await fillLabelPage("Custos Fixos", "85000");
    await fillLabelPage("Frete", "350");

    const salvarCustBtn = page.locator('button:has-text("Salvar Custos")').first();
    if (await salvarCustBtn.count() > 0) {
      await salvarCustBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F15_06_custos_salvos"), fullPage: true });

    // Modalidades
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(500);
    const salvarModBtn = page.locator('button:has-text("Salvar Modalidades")').first();
    if (await salvarModBtn.count() > 0) {
      await salvarModBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F15_07_modalidades_salvas"), fullPage: true });
  });
});

// ─── UC-F16: Fontes de Busca e Palavras-chave ─────────────
test.describe("UC-F16: Fontes de Busca e Palavras-chave", () => {
  test("Toggle fonte, palavras-chave e NCMs", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Parametrizacoes");
    await page.waitForTimeout(2000);

    await clickTab(page, "Fontes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F16_01_aba_fontes"), fullPage: true });

    // Toggle BLL
    const bllBtn = page.locator('button[title*="Desativar"], button[title*="Ativar"]').last();
    if (await bllBtn.count() > 0) {
      await bllBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("F16_02_bll_desativado"), fullPage: true });
      const reativarBtn = page.locator('button[title*="Ativar"]').last();
      if (await reativarBtn.count() > 0) {
        await reativarBtn.click();
        await page.waitForTimeout(1000);
      }
      await page.screenshot({ path: SS("F16_03_bll_reativado"), fullPage: true });
    }

    // Palavras-chave
    const editarPalavrasBtn = page.locator('button.tag-add, button:has-text("+ Editar"), button:has-text("Editar")').first();
    if (await editarPalavrasBtn.count() > 0) {
      await editarPalavrasBtn.click();
      await page.waitForTimeout(1000);
      const palavrasInput = page.locator('textarea, input[type="text"]').last();
      if (await palavrasInput.count() > 0) {
        await palavrasInput.click({ clickCount: 3 });
        await palavrasInput.fill("monitor multiparametrico, ultrassonografo, equipamento hospitalar, material hospitalar, ventilador pulmonar, oximetro, desfibrilador, bisturi eletrico, autoclave, mesa cirurgica");
      }
      await page.screenshot({ path: SS("F16_04_palavras_preenchidas"), fullPage: true });
      const salvarPalBtn = page.locator('button:has-text("Salvar")').first();
      if (await salvarPalBtn.count() > 0) {
        await salvarPalBtn.click();
        await page.waitForTimeout(2000);
      }
      await page.screenshot({ path: SS("F16_05_palavras_salvas"), fullPage: true });
    }

    // NCMs
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    const addNcmBtn = page.locator('button:has-text("+ Adicionar NCM"), button:has-text("Adicionar NCM")').first();
    if (await addNcmBtn.count() > 0) {
      await addNcmBtn.click();
      await page.waitForTimeout(1000);
      const ncmInput = page.locator('textarea, input[type="text"]').last();
      if (await ncmInput.count() > 0) {
        await ncmInput.click({ clickCount: 3 });
        await ncmInput.fill("9018.19.90, 9018.90.99, 9021.90.90, 9018.11.00, 9402.90.00");
      }
      await page.screenshot({ path: SS("F16_06_ncms_preenchidos"), fullPage: true });
      const salvarNcmBtn = page.locator('button:has-text("Salvar")').first();
      if (await salvarNcmBtn.count() > 0) {
        await salvarNcmBtn.click();
        await page.waitForTimeout(2000);
      }
      await page.screenshot({ path: SS("F16_07_ncms_salvos"), fullPage: true });
    }
  });
});

// ─── UC-F17: Notificações e Preferências ──────────────────
test.describe("UC-F17: Notificacoes e Preferencias", () => {
  test("Configurar notificacoes e preferencias do sistema", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Parametrizacoes");
    await page.waitForTimeout(2000);

    await clickTab(page, "Notificacoes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F17_01_aba_notificacoes"), fullPage: true });

    // Email de notificação
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.clear();
      await emailInput.fill("licitacoes@chhospitalar.com.br");
    }

    // Frequência
    const freqSelect = page.locator('select').filter({ has: page.locator('option:has-text("Diario"), option:has-text("Diário")') }).first();
    if (await freqSelect.count() > 0) {
      await freqSelect.selectOption("diario");
    }

    await page.screenshot({ path: SS("F17_02_notificacoes_preenchidas"), fullPage: true });

    const salvarBtn = page.locator('button:has-text("Salvar")').first();
    if (await salvarBtn.count() > 0) {
      await salvarBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F17_03_notificacoes_salvas"), fullPage: true });

    // Preferências
    await clickTab(page, "Preferencias");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F17_04_aba_preferencias"), fullPage: true });

    // Tema
    const escuroRadio = page.locator('input[type="radio"][value*="escuro"], input[type="radio"][value*="dark"]').first();
    if (await escuroRadio.count() > 0) {
      await escuroRadio.check();
    }

    await page.screenshot({ path: SS("F17_05_preferencias_preenchidas"), fullPage: true });

    const salvarPrefBtn = page.locator('button:has-text("Salvar")').first();
    if (await salvarPrefBtn.count() > 0) {
      await salvarPrefBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F17_06_preferencias_salvas"), fullPage: true });
  });
});

// ─── UC-F07: Cadastro de Produto por IA ───────────────────
test.describe("UC-F07: Cadastro de Produto por IA", () => {
  test("Cadastrar produto via Manual Tecnico", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Aba Cadastro por IA
    await clickTab(page, "Cadastro por IA");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F07_01_aba_cadastro_ia"), fullPage: true });

    // Tipo Manual Técnico
    const tipoSelect = page.locator('select').filter({ has: page.locator('option:has-text("Manual")') }).first();
    if (await tipoSelect.count() > 0) {
      const options = await tipoSelect.locator('option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => ({ v: o.value, t: o.text }))
      );
      const manualOpt = options.find(o => o.t.toLowerCase().includes("manual"));
      if (manualOpt) await tipoSelect.selectOption(manualOpt.v);
    }
    await page.waitForTimeout(500);

    // Arquivo
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(FIXTURE_PDF);
      await page.waitForTimeout(500);
    }

    // Nome do Produto (se campo existir)
    const nomeInput = page.locator('input[placeholder*="extraido"], input[placeholder*="Sera"], input[placeholder*="Nome do Produto"]').first();
    if (await nomeInput.count() > 0) {
      await nomeInput.fill("Monitor Multiparametrico Mindray iMEC10");
    }

    await page.screenshot({ path: SS("F07_02_formulario_preenchido"), fullPage: true });

    // Processar com IA
    const processarBtn = page.locator('button:has-text("Processar com IA"), button:has-text("Processar"), button:has-text("Cadastrar")').first();
    if (await processarBtn.count() > 0 && await processarBtn.isEnabled()) {
      await processarBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("F07_03_processando"), fullPage: true });

      await waitForIA(page, (body) => {
        return body.includes("cadastrado") || body.includes("produto") || body.includes("extraido") || body.includes("Meus Produtos");
      }, 120000, 5000);

      await page.screenshot({ path: SS("F07_04_resultado_ia"), fullPage: true });
    }

    await page.screenshot({ path: SS("F07_05_final"), fullPage: true });
  });
});

// ─── UC-F06: Listar e Filtrar Produtos ────────────────────
test.describe("UC-F06: Listar e Filtrar Produtos", () => {
  test("Filtrar por area, classe e texto", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Aba Meus Produtos (padrão) — lista todos os produtos
    await page.screenshot({ path: SS("F06_01_lista_produtos"), fullPage: true });

    // Filtrar por Área — usar primeira opção real (não filtrar demais)
    const areaSelect = page.locator('select.form-input').first();
    if (await areaSelect.count() > 0) {
      const options = await areaSelect.locator('option').allTextContents();
      const areaOpt = options.find(o => o !== "" && !o.includes("Todas") && !o.includes("todas") && !o.includes("Selecione"));
      if (areaOpt) {
        await areaSelect.selectOption({ label: areaOpt.trim() });
        await page.waitForTimeout(1000);
      }
    }
    await page.screenshot({ path: SS("F06_02_filtro_area"), fullPage: true });

    // Limpar filtro de área (voltar para "Todas")
    if (await areaSelect.count() > 0) {
      const allOption = await areaSelect.locator('option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.find(o => o.text.includes("Todas") || o.value === "")?.value ?? ""
      );
      await areaSelect.selectOption(allOption);
      await page.waitForTimeout(500);
    }

    // Busca por texto — digitar algo genérico que tenha resultado
    const buscaInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[placeholder*="Pesquisar"], input[placeholder*="produto"]').first();
    if (await buscaInput.count() > 0) {
      await buscaInput.fill("monitor");
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: SS("F06_03_busca_texto"), fullPage: true });

    // Limpar busca para ver todos os produtos
    if (await buscaInput.count() > 0) {
      await buscaInput.clear();
      await page.waitForTimeout(500);
    }

    // Clicar Visualizar no primeiro produto disponível
    const visualizarBtn = page.locator('button[title="Visualizar"], button[title*="Visualizar"]').first();
    if (await visualizarBtn.count() > 0) {
      await visualizarBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: SS("F06_04_detalhe_produto"), fullPage: true });
  });
});

// ─── UC-F08: Editar Produto ───────────────────────────────
test.describe("UC-F08: Editar Produto Existente", () => {
  test("Editar produto e especificacoes tecnicas", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Clicar Editar no primeiro produto
    const editarBtn = page.locator('button[title="Editar"], button[title*="Editar"]').first();
    if (await editarBtn.count() > 0) {
      await editarBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("F08_01_modal_editar"), fullPage: true });

      // Preencher campos dentro do modal
      const nomeInput = page.locator('.modal .form-field:has(.form-field-label:has-text("Nome")) .text-input, [role="dialog"] .form-field:has(.form-field-label:has-text("Nome")) .text-input').first();
      if (await nomeInput.count() > 0) {
        await nomeInput.click({ clickCount: 3 });
        await nomeInput.fill("Monitor Multiparametrico Mindray iMEC10 Plus");
      }

      const fabInput = page.locator('.modal .form-field:has(.form-field-label:has-text("Fabricante")) .text-input').first();
      if (await fabInput.count() > 0) {
        await fabInput.click({ clickCount: 3 });
        await fabInput.fill("Mindray Bio-Medical Electronics");
      }

      const modeloInput = page.locator('.modal .form-field:has(.form-field-label:has-text("Modelo")) .text-input').first();
      if (await modeloInput.count() > 0) {
        await modeloInput.click({ clickCount: 3 });
        await modeloInput.fill("iMEC10 Plus");
      }

      await page.screenshot({ path: SS("F08_02_campos_editados"), fullPage: true });

      // Scroll dentro do modal para especificações
      await page.evaluate(() => {
        const modal = document.querySelector('.modal, [role="dialog"]');
        if (modal) modal.scrollTop = 600;
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: SS("F08_03_especificacoes"), fullPage: true });

      // Salvar
      const salvarBtn = page.locator('.modal button:has-text("Salvar")').first();
      if (await salvarBtn.count() > 0) {
        await salvarBtn.click();
        await page.waitForTimeout(3000);
      }
      await page.screenshot({ path: SS("F08_04_produto_salvo"), fullPage: true });
    }
  });
});

// ─── UC-F09: Reprocessar IA ───────────────────────────────
test.describe("UC-F09: Reprocessar Metadados por IA", () => {
  test("Clicar Reprocessar IA no produto", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: SS("F09_01_lista_produtos"), fullPage: true });

    const reprocessarBtn = page.locator('button[title="Reprocessar IA"]').first();
    if (await reprocessarBtn.count() > 0) {
      await reprocessarBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("F09_02_reprocessando"), fullPage: true });

      await waitForIA(page, (body) => !body.includes("Reprocessando"), 60000, 5000);
      await page.screenshot({ path: SS("F09_03_reprocessado"), fullPage: true });
    }
  });
});

// ─── UC-F10: ANVISA e Busca Web ───────────────────────────
test.describe("UC-F10: ANVISA e Busca Web", () => {
  test("Buscar ANVISA e buscar na Web", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Buscar ANVISA
    const anvisaBtn = page.locator('button:has-text("Buscar ANVISA")').first();
    if (await anvisaBtn.count() > 0) {
      await anvisaBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("F10_01_modal_anvisa"), fullPage: true });

      const regInput = page.locator('input[placeholder*="80000"], input[placeholder*="Registro"], input[placeholder*="registro"]').first();
      if (await regInput.count() > 0) await regInput.fill("80262090001");

      const buscarIABtn = page.locator('button:has-text("Buscar via IA")').first();
      if (await buscarIABtn.count() > 0 && await buscarIABtn.isEnabled()) {
        await buscarIABtn.click();
        await page.waitForTimeout(5000);
      }
      await page.screenshot({ path: SS("F10_02_resultado_anvisa"), fullPage: true });

      const fecharBtn = page.locator('button:has-text("Cancelar"), button:has-text("Fechar")').first();
      if (await fecharBtn.count() > 0) {
        await fecharBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Buscar na Web
    const webBtn = page.locator('button:has-text("Buscar na Web")').first();
    if (await webBtn.count() > 0) {
      await webBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("F10_03_modal_web"), fullPage: true });

      const nomeInput = page.locator('input[placeholder*="Microscopio"], input[placeholder*="produto"], input[placeholder*="Nome"]').first();
      if (await nomeInput.count() > 0) await nomeInput.fill("Ultrassonografo Portatil Mindray M7T");

      const fabInput = page.locator('input[placeholder*="Olympus"], input[placeholder*="fabricante"], input[placeholder*="Fabricante"]').first();
      if (await fabInput.count() > 0) await fabInput.fill("Mindray");

      const buscarWebBtn = page.locator('button:has-text("Buscar via IA")').first();
      if (await buscarWebBtn.count() > 0 && await buscarWebBtn.isEnabled()) {
        await buscarWebBtn.click();
        await page.waitForTimeout(5000);
      }
      await page.screenshot({ path: SS("F10_04_resultado_web"), fullPage: true });

      const fecharBtn2 = page.locator('button:has-text("Cancelar"), button:has-text("Fechar")').first();
      if (await fecharBtn2.count() > 0) await fecharBtn2.click();
    }
  });
});

// ─── UC-F11: Verificar Completude ─────────────────────────
test.describe("UC-F11: Verificar Completude", () => {
  test("Verificar completude do produto", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    const completudeBtn = page.locator('button[title="Verificar Completude"], button[title*="Completude"]').first();
    if (await completudeBtn.count() > 0) {
      await completudeBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("F11_01_modal_completude"), fullPage: true });

      const body = await getBody(page);
      expect(body.includes("Completude") || body.includes("%")).toBeTruthy();

      await page.screenshot({ path: SS("F11_02_scores"), fullPage: true });

      const fecharBtn = page.locator('button:has-text("Fechar")').first();
      if (await fecharBtn.count() > 0) await fecharBtn.click();
    }
  });
});

// ─── UC-F12: Metadados de Captação ────────────────────────
test.describe("UC-F12: Metadados de Captacao", () => {
  test("Visualizar e reprocessar metadados", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Visualizar primeiro produto
    const visualizarBtn = page.locator('button[title="Visualizar"], button[title*="Visualizar"]').first();
    if (await visualizarBtn.count() > 0) {
      await visualizarBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SS("F12_01_detalhe_produto"), fullPage: true });

    // Expandir seção Metadados de Captação
    const toggleMeta = page.locator('button:has-text("Metadados"), span:has-text("Metadados de Captacao"), div:has-text("Metadados de Captacao")').first();
    if (await toggleMeta.count() > 0) {
      await toggleMeta.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: SS("F12_02_metadados_expandidos"), fullPage: true });

    const reprocessarBtn = page.locator('button:has-text("Reprocessar Metadados"), button:has-text("Reprocessar")').first();
    if (await reprocessarBtn.count() > 0) {
      await reprocessarBtn.click();
      await page.waitForTimeout(5000);
    }
    await page.screenshot({ path: SS("F12_03_metadados_reprocessados"), fullPage: true });
  });
});

// ─── UC-F13: Classificação Hierárquica ────────────────────
test.describe("UC-F13: Classificacao Hierarquica", () => {
  test("Navegar arvore de classificacao", async ({ page }) => {
    await login(page, "CH Hospitalar");
    await navTo(page, "Portfolio");
    await page.waitForTimeout(2000);

    // Aba Classificacao — usar o texto exato do botão ptab
    await page.locator('button.ptab:has-text("Classificacao"), button:has-text("Classificacao")').first().click().catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("F13_01_aba_classificacao"), fullPage: true });

    const body = await getBody(page);
    expect(body.includes("Classificacao") || body.includes("Estrutura")).toBeTruthy();

    // Expandir primeira área — clicar no header da árvore
    const areaHeaders = page.locator('.classificacao-classe-header').first();
    if (await areaHeaders.count() > 0) {
      await areaHeaders.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("F13_02_area_expandida"), fullPage: true });

      // Expandir primeira classe dentro da área
      const classeHeaders = page.locator('.classificacao-classe-header').nth(1);
      if (await classeHeaders.count() > 0) {
        await classeHeaders.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: SS("F13_03_classe_expandida"), fullPage: true });
      }
    }

    // Scroll para ver funil/estatísticas
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SS("F13_04_funil_monitoramento"), fullPage: true });
  });
});
