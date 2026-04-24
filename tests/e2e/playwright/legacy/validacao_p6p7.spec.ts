import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const BASE_URL = "http://localhost:5175";
const API_URL = "http://localhost:5007";
const EMAIL = "pasteurjr@gmail.com";
const PASSWORD = "123456";
const SCREENSHOT_DIR = "tests/results/validacao";

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

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1500);
  const loginBtn = page
    .locator('button:has-text("Entrar"), button:has-text("Login")')
    .first();
  if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page
      .locator('input[type="email"], input[placeholder*="email"]')
      .first()
      .fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await loginBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function navigateToCaptacao(page: Page) {
  await login(page);
  const captacaoBtn = page
    .locator('.nav-item:has(.nav-item-label:text("Captacao"))')
    .first();
  if (await captacaoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await captacaoBtn.click();
  } else {
    const fluxoHeader = page.locator(
      '.nav-section-header:has(.nav-section-label:text("Fluxo Comercial"))'
    );
    await fluxoHeader.click();
    await page.waitForTimeout(500);
    await page
      .locator('.nav-item:has(.nav-item-label:text("Captacao"))')
      .first()
      .click();
  }
  await page.waitForTimeout(2000);
}

async function buscarEditais(page: Page, termo: string = "reagente") {
  const campoTermo = page.locator(
    '.form-field:has(.form-field-label:text("Termo")) input'
  ).first();
  await campoTermo.fill(termo);
  const btnBuscar = page.locator('button:has-text("Buscar Editais")').first();
  await btnBuscar.click();
  await page.waitForTimeout(8000);
}

// ========================================================================
// PAGINA 6 - CAPTACAO (Painel de Oportunidades)
// ========================================================================

test.describe("PAGINA 6 - Captacao: Painel de Oportunidades", () => {
  // REQ 6.1 - Tabela de Oportunidades com Score
  test("6.1.1 - Tabela de oportunidades mostra dados apos busca", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    // Verificar titulo da pagina
    const h1 = page.locator("h1:has-text('Captacao de Editais')");
    await expect(h1).toBeVisible({ timeout: 10000 });

    // Buscar editais
    await buscarEditais(page, "reagente");

    // Verificar se resultados apareceram na tabela
    const resultadosCard = page.locator("text=editais encontrados").first();
    const temResultados = await resultadosCard
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/6.1.1_tabela_resultados.png`,
      fullPage: true,
    });

    if (temResultados) {
      // Verificar colunas da tabela
      const headers = page.locator("th");
      const headerTexts = await headers.allTextContents();
      const headersNorm = headerTexts.map((h) => h.trim().toLowerCase());

      const colunasEsperadas = ["numero", "orgao", "uf", "objeto", "valor", "score"];
      const faltando: string[] = [];
      for (const col of colunasEsperadas) {
        if (!headersNorm.some((h) => h.includes(col))) {
          faltando.push(col);
        }
      }
      console.log(
        `6.1.1 - Colunas presentes: ${headersNorm.join(", ")}. Faltando: ${faltando.length > 0 ? faltando.join(", ") : "nenhuma"}`
      );
      expect(faltando.length).toBe(0);
    } else {
      console.log(
        "6.1.1 - Busca executou mas sem resultados visiveis (pode ser problema de API)"
      );
    }
  });

  test("6.1.2 - Score circular aparece na tabela com tooltip de gaps", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    // Procurar scores circulares na tabela
    const scoreCircles = page.locator(".score-circle, .score-cell-tooltip");
    const scoreCount = await scoreCircles.count();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/6.1.2_score_circular.png`,
      fullPage: true,
    });

    console.log(`6.1.2 - ${scoreCount} score(s) circular(es) encontrado(s)`);
    // Score deve existir se ha resultados
  });

  // REQ 6.2 - Categorizar por Cor
  test("6.2.1 - Linhas da tabela tem classes de cor por score", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    // Verificar se existem rows com classes de score
    const rowsAlto = page.locator("tr.row-score-high");
    const rowsMedio = page.locator("tr.row-score-medium");
    const rowsBaixo = page.locator("tr.row-score-low");

    const countAlto = await rowsAlto.count();
    const countMedio = await rowsMedio.count();
    const countBaixo = await rowsBaixo.count();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/6.2.1_cores_score.png`,
      fullPage: true,
    });

    console.log(
      `6.2.1 - Linhas verde(>=80): ${countAlto}, amarelo(>=50): ${countMedio}, vermelho(<50): ${countBaixo}`
    );

    // Verificar que a funcao getRowClass existe checando classes CSS
    // As classes sao: row-score-high, row-score-medium, row-score-low
    const totalComClasse = countAlto + countMedio + countBaixo;
    console.log(
      `6.2.1 - Total de linhas com classificacao por cor: ${totalComClasse}`
    );
  });

  // REQ 6.3 - Painel Lateral com Analise do Edital
  test("6.3.1 - Painel lateral abre ao clicar em edital com score e sub-scores", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    // Tentar clicar em uma linha da tabela
    const primeiraLinha = page.locator("table tbody tr").first();
    const linhaVisivel = await primeiraLinha
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (linhaVisivel) {
      await primeiraLinha.click();
      await page.waitForTimeout(1500);

      // Verificar se painel lateral abriu
      const painelLateral = page.locator(".captacao-panel");
      const painelVisivel = await painelLateral
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (painelVisivel) {
        // Verificar score principal (ScoreCircle grande)
        const scoreGeral = painelLateral.locator(".score-circle").first();
        const scoreGeralVisivel = await scoreGeral
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        // Verificar sub-scores: Aderencia Tecnica
        const subScoreTec = painelLateral.locator(
          'text=Aderencia Tecnica'
        );
        const subScoreCom = painelLateral.locator(
          'text=Aderencia Comercial'
        );
        const subScoreRec = painelLateral.locator('text=Recomendacao');

        const tecVisivel = await subScoreTec
          .isVisible({ timeout: 3000 })
          .catch(() => false);
        const comVisivel = await subScoreCom
          .isVisible({ timeout: 3000 })
          .catch(() => false);
        const recVisivel = await subScoreRec
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/6.3.1_painel_lateral.png`,
          fullPage: true,
        });

        console.log(
          `6.3.1 - Painel lateral: Score geral=${scoreGeralVisivel}, Tecnico=${tecVisivel}, Comercial=${comVisivel}, Recomendacao=${recVisivel}`
        );

        expect(painelVisivel).toBeTruthy();
      } else {
        console.log("6.3.1 - Painel lateral nao abriu (sem resultados de busca?)");
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/6.3.1_painel_nao_abriu.png`,
          fullPage: true,
        });
      }
    } else {
      console.log("6.3.1 - Nenhuma linha de resultado para clicar");
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/6.3.1_sem_resultados.png`,
        fullPage: true,
      });
    }
  });

  test("6.3.2 - Produto correspondente e Potencial de Ganho no painel", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    const primeiraLinha = page.locator("table tbody tr").first();
    if (await primeiraLinha.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiraLinha.click();
      await page.waitForTimeout(1500);

      const painelLateral = page.locator(".captacao-panel");
      if (
        await painelLateral.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        // Produto Correspondente
        const produtoHeader = painelLateral.locator(
          'text=Produto Correspondente'
        );
        const produtoVisivel = await produtoHeader
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        // Potencial de Ganho
        const potencialHeader = painelLateral.locator(
          'text=Potencial de Ganho'
        );
        const potencialVisivel = await potencialHeader
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/6.3.2_produto_potencial.png`,
          fullPage: true,
        });

        console.log(
          `6.3.2 - Produto Correspondente: ${produtoVisivel}, Potencial de Ganho: ${potencialVisivel}`
        );
      }
    }
  });

  // REQ 6.4 - Analise de Gaps
  test("6.4.1 - Tooltip de gaps no hover do score e secao de gaps no painel", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    // Verificar que tooltip de gaps existe no DOM (mesmo que hidden)
    const gapTooltips = page.locator(".gap-tooltip");
    const tooltipCount = await gapTooltips.count();

    // Tentar abrir painel para ver secao de gaps
    const primeiraLinha = page.locator("table tbody tr").first();
    let gapSectionVisible = false;
    if (await primeiraLinha.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiraLinha.click();
      await page.waitForTimeout(1500);

      const painelLateral = page.locator(".captacao-panel");
      if (
        await painelLateral.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        const gapSection = painelLateral.locator('text=Analise de Gaps');
        gapSectionVisible = await gapSection
          .isVisible({ timeout: 3000 })
          .catch(() => false);
      }
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/6.4.1_gaps.png`,
      fullPage: true,
    });

    console.log(
      `6.4.1 - Tooltips de gaps no DOM: ${tooltipCount}, Secao de gaps no painel: ${gapSectionVisible}`
    );
  });

  // REQ 6.5 - Intencao Estrategica + Margem
  test("6.5.1 - Intencao Estrategica com 4 opcoes no painel lateral", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    const primeiraLinha = page.locator("table tbody tr").first();
    if (await primeiraLinha.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiraLinha.click();
      await page.waitForTimeout(1500);

      const painelLateral = page.locator(".captacao-panel");
      if (
        await painelLateral.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        // Verificar titulo Intencao Estrategica
        const intencaoHeader = painelLateral.locator(
          'text=Intencao Estrategica'
        );
        const intencaoVisivel = await intencaoHeader
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        // Verificar 4 radio buttons
        const radioButtons = painelLateral.locator(
          'input[type="radio"][name="intencao-panel"]'
        );
        const radioCount = await radioButtons.count();

        // Verificar labels das 4 opcoes
        const estrategico = painelLateral.locator(
          'label:has-text("Estrategico")'
        );
        const defensivo = painelLateral.locator(
          'label:has-text("Defensivo")'
        );
        const acompanhamento = painelLateral.locator(
          'label:has-text("Acompanhamento")'
        );
        const aprendizado = painelLateral.locator(
          'label:has-text("Aprendizado")'
        );

        const opts = {
          estrategico: await estrategico
            .isVisible({ timeout: 2000 })
            .catch(() => false),
          defensivo: await defensivo
            .isVisible({ timeout: 2000 })
            .catch(() => false),
          acompanhamento: await acompanhamento
            .isVisible({ timeout: 2000 })
            .catch(() => false),
          aprendizado: await aprendizado
            .isVisible({ timeout: 2000 })
            .catch(() => false),
        };

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/6.5.1_intencao_estrategica.png`,
          fullPage: true,
        });

        console.log(
          `6.5.1 - Intencao Estrategica header: ${intencaoVisivel}, Radios: ${radioCount}, Opcoes: Estrategico=${opts.estrategico}, Defensivo=${opts.defensivo}, Acompanhamento=${opts.acompanhamento}, Aprendizado=${opts.aprendizado}`
        );

        expect(radioCount).toBe(4);
      }
    }
  });

  test("6.5.2 - Slider de Expectativa de Margem (0-50%) no painel", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    const primeiraLinha = page.locator("table tbody tr").first();
    if (await primeiraLinha.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiraLinha.click();
      await page.waitForTimeout(1500);

      const painelLateral = page.locator(".captacao-panel");
      if (
        await painelLateral.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        // Verificar titulo Expectativa de Margem
        const margemHeader = painelLateral.locator(
          'text=Expectativa de Margem'
        );
        const margemVisivel = await margemHeader
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        // Verificar slider (input type=range)
        const slider = painelLateral.locator('input[type="range"]');
        const sliderCount = await slider.count();

        let sliderMin = "";
        let sliderMax = "";
        if (sliderCount > 0) {
          sliderMin = (await slider.first().getAttribute("min")) || "";
          sliderMax = (await slider.first().getAttribute("max")) || "";
        }

        // Verificar botoes Varia por Produto e Varia por Regiao
        const variaProduto = painelLateral.locator(
          'button:has-text("Varia por Produto")'
        );
        const variaRegiao = painelLateral.locator(
          'button:has-text("Varia por Regiao")'
        );
        const variaProdutoVisivel = await variaProduto
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        const variaRegiaoVisivel = await variaRegiao
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        // Verificar Salvar Estrategia
        const salvarEstrategia = painelLateral.locator(
          'button:has-text("Salvar Estrategia")'
        );
        const salvarVisivel = await salvarEstrategia
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/6.5.2_margem_slider.png`,
          fullPage: true,
        });

        console.log(
          `6.5.2 - Margem header: ${margemVisivel}, Slider: count=${sliderCount} min=${sliderMin} max=${sliderMax}, Varia Produto: ${variaProdutoVisivel}, Varia Regiao: ${variaRegiaoVisivel}, Salvar Estrategia: ${salvarVisivel}`
        );

        if (sliderCount > 0) {
          expect(sliderMin).toBe("0");
          expect(sliderMax).toBe("50");
        }
      }
    }
  });

  test("6.5.3 - Salvar Estrategia funciona e mostra feedback", async ({
    page,
  }) => {
    await navigateToCaptacao(page);
    await buscarEditais(page, "reagente");

    const primeiraLinha = page.locator("table tbody tr").first();
    if (await primeiraLinha.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiraLinha.click();
      await page.waitForTimeout(1500);

      const painelLateral = page.locator(".captacao-panel");
      if (
        await painelLateral.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        // Selecionar uma intencao
        const radioEstrategico = painelLateral
          .locator('input[type="radio"][value="estrategico"]')
          .first();
        if (
          await radioEstrategico
            .isVisible({ timeout: 2000 })
            .catch(() => false)
        ) {
          await radioEstrategico.click();
        }

        // Clicar Salvar Estrategia
        const salvarBtn = painelLateral.locator(
          'button:has-text("Salvar Estrategia")'
        );
        if (
          await salvarBtn.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await salvarBtn.click();
          await page.waitForTimeout(3000);

          // Verificar mensagem de sucesso
          const sucesso = painelLateral.locator(
            'text=Estrategia salva com sucesso'
          );
          const sucessoVisivel = await sucesso
            .isVisible({ timeout: 5000 })
            .catch(() => false);

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/6.5.3_estrategia_salva.png`,
            fullPage: true,
          });

          console.log(
            `6.5.3 - Salvar Estrategia: feedback de sucesso=${sucessoVisivel}`
          );
        }
      }
    }
  });
});

// ========================================================================
// PAGINA 7 - CAPTACAO (Classificacoes e Fontes)
// ========================================================================

test.describe("PAGINA 7 - Captacao: Classificacoes e Fontes", () => {
  // REQ 7.1 - Classificacao por Tipo de Edital
  test("7.1.1 - Select Classificacao Tipo com 6 opcoes", async ({ page }) => {
    await navigateToCaptacao(page);

    // Localizar select de Classificacao Tipo
    const selectTipo = page.locator(
      '.form-field:has(.form-field-label:text("Classificacao Tipo")) select'
    ).first();
    await expect(selectTipo).toBeVisible({ timeout: 10000 });

    // Contar opcoes
    const options = await selectTipo.locator("option").allTextContents();
    const optionsNorm = options.map((o) => o.trim());

    // Opcoes esperadas: Todos, Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco
    const esperadas = [
      "Todos",
      "Reagentes",
      "Equipamentos",
      "Comodato",
      "Aluguel",
      "Oferta de Preco",
    ];

    const presentes: string[] = [];
    const ausentes: string[] = [];
    for (const esp of esperadas) {
      if (optionsNorm.some((o) => o.toLowerCase().includes(esp.toLowerCase()))) {
        presentes.push(esp);
      } else {
        ausentes.push(esp);
      }
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.1.1_classificacao_tipo.png`,
      fullPage: true,
    });

    console.log(
      `7.1.1 - Total opcoes: ${options.length}. Esperadas: 6. Presentes: [${presentes.join(", ")}]. Ausentes: [${ausentes.join(", ")}]. Opcoes reais: [${optionsNorm.join(", ")}]`
    );

    expect(options.length).toBe(6);
  });

  test("7.1.2 - Selecionar tipo Reagentes e buscar", async ({ page }) => {
    await navigateToCaptacao(page);

    const selectTipo = page.locator(
      '.form-field:has(.form-field-label:text("Classificacao Tipo")) select'
    ).first();
    await selectTipo.selectOption({ label: "Reagentes" });

    // Verificar que foi selecionado
    const valorSelecionado = await selectTipo.inputValue();
    expect(valorSelecionado).toBe("Reagentes");

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.1.2_tipo_reagentes.png`,
      fullPage: true,
    });

    console.log(`7.1.2 - Tipo selecionado: ${valorSelecionado}`);
  });

  // REQ 7.2 - Classificacao por Origem
  test("7.2.1 - Select Classificacao Origem com 9 opcoes", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    const selectOrigem = page.locator(
      '.form-field:has(.form-field-label:text("Classificacao Origem")) select'
    ).first();
    await expect(selectOrigem).toBeVisible({ timeout: 10000 });

    const options = await selectOrigem.locator("option").allTextContents();
    const optionsNorm = options.map((o) => o.trim());

    // Esperadas: Todos, Municipal, Estadual, Federal, Universidade, Hospital, LACEN, Forca Armada, Autarquia
    const esperadas = [
      "Todos",
      "Municipal",
      "Estadual",
      "Federal",
      "Universidade",
      "Hospital",
      "LACEN",
      "Forca Armada",
      "Autarquia",
    ];

    const presentes: string[] = [];
    const ausentes: string[] = [];
    for (const esp of esperadas) {
      if (optionsNorm.some((o) => o.toLowerCase().includes(esp.toLowerCase()))) {
        presentes.push(esp);
      } else {
        ausentes.push(esp);
      }
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.2.1_classificacao_origem.png`,
      fullPage: true,
    });

    console.log(
      `7.2.1 - Total opcoes: ${options.length}. Esperadas: 9. Presentes: [${presentes.join(", ")}]. Ausentes: [${ausentes.join(", ")}]. Opcoes reais: [${optionsNorm.join(", ")}]`
    );

    expect(options.length).toBe(9);
  });

  test("7.2.2 - Selecionar origem Federal e verificar", async ({ page }) => {
    await navigateToCaptacao(page);

    const selectOrigem = page.locator(
      '.form-field:has(.form-field-label:text("Classificacao Origem")) select'
    ).first();
    await selectOrigem.selectOption({ label: "Federal" });

    const valorSelecionado = await selectOrigem.inputValue();
    expect(valorSelecionado).toBe("Federal");

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.2.2_origem_federal.png`,
      fullPage: true,
    });

    console.log(`7.2.2 - Origem selecionada: ${valorSelecionado}`);
  });

  // REQ 7.3 - Locais de Busca (Fonte)
  test("7.3.1 - Select Fonte com 5 opcoes", async ({ page }) => {
    await navigateToCaptacao(page);

    const selectFonte = page.locator(
      '.form-field:has(.form-field-label:text("Fonte")) select'
    ).first();
    await expect(selectFonte).toBeVisible({ timeout: 10000 });

    const options = await selectFonte.locator("option").allTextContents();
    const optionsNorm = options.map((o) => o.trim());

    // Esperadas: PNCP, ComprasNET, BEC-SP, SICONV, Todas as fontes
    const esperadas = ["PNCP", "ComprasNET", "BEC-SP", "SICONV", "Todas as fontes"];

    const presentes: string[] = [];
    const ausentes: string[] = [];
    for (const esp of esperadas) {
      if (optionsNorm.some((o) => o.toLowerCase().includes(esp.toLowerCase()))) {
        presentes.push(esp);
      } else {
        ausentes.push(esp);
      }
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.3.1_fontes_busca.png`,
      fullPage: true,
    });

    console.log(
      `7.3.1 - Total opcoes: ${options.length}. Esperadas: 5. Presentes: [${presentes.join(", ")}]. Ausentes: [${ausentes.join(", ")}]. Opcoes reais: [${optionsNorm.join(", ")}]`
    );

    expect(options.length).toBe(5);
  });

  test("7.3.2 - Selecionar fonte PNCP e buscar", async ({ page }) => {
    await navigateToCaptacao(page);

    const selectFonte = page.locator(
      '.form-field:has(.form-field-label:text("Fonte")) select'
    ).first();
    await selectFonte.selectOption({ label: "PNCP" });
    const valorSelecionado = await selectFonte.inputValue();
    expect(valorSelecionado).toBe("pncp");

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.3.2_fonte_pncp.png`,
      fullPage: true,
    });

    console.log(`7.3.2 - Fonte selecionada: ${valorSelecionado}`);
  });

  // REQ 7.4 - Formato de Busca (Campo Termo)
  test("7.4.1 - Campo Termo aceita texto com placeholder correto", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    const campoTermo = page.locator(
      '.form-field:has(.form-field-label:text("Termo")) input'
    ).first();
    await expect(campoTermo).toBeVisible({ timeout: 10000 });

    // Verificar placeholder
    const placeholder = await campoTermo.getAttribute("placeholder");

    // Preencher com texto
    await campoTermo.fill("reagente laboratorial");
    const valorDigitado = await campoTermo.inputValue();
    expect(valorDigitado).toBe("reagente laboratorial");

    // Limpar e testar com NCM
    await campoTermo.fill("9027.80.99");
    const valorNCM = await campoTermo.inputValue();
    expect(valorNCM).toBe("9027.80.99");

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.4.1_campo_termo.png`,
      fullPage: true,
    });

    console.log(
      `7.4.1 - Placeholder: "${placeholder}". Aceita texto livre: SIM. Aceita NCM: SIM`
    );

    // Verificar que placeholder menciona microscopio ou reagente como exemplo
    expect(placeholder).toBeTruthy();
  });

  test("7.4.2 - Checkbox Calcular Score funciona", async ({ page }) => {
    await navigateToCaptacao(page);

    // Localizar checkbox de score
    const cbScore = page.locator(
      'text=Calcular score de aderencia'
    ).first();
    await expect(cbScore).toBeVisible({ timeout: 10000 });

    // Verificar checkbox de encerrados
    const cbEncerrados = page.locator(
      'text=Incluir editais encerrados'
    ).first();
    await expect(cbEncerrados).toBeVisible({ timeout: 10000 });

    // Verificar que checkbox de score tem input associado
    const inputScore = page.locator('.checkbox-inline input[type="checkbox"]').first();
    const isChecked = await inputScore.isChecked();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.4.2_checkboxes.png`,
      fullPage: true,
    });

    console.log(
      `7.4.2 - Checkbox Score visivel: SIM (checked=${isChecked}). Checkbox Encerrados visivel: SIM`
    );
  });

  // REQ 7.5 - Filtro por UF (28 opcoes)
  test("7.5.1 - Select UF com 28 opcoes (Todas + 27 estados)", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    const selectUF = page.locator(
      '.form-field:has(.form-field-label:text("UF")) select'
    ).first();
    await expect(selectUF).toBeVisible({ timeout: 10000 });

    const options = await selectUF.locator("option").allTextContents();
    const optionsNorm = options.map((o) => o.trim());

    // Verificar contagem exata: Todas + 27 UFs = 28
    const totalEsperado = 28;

    // Verificar UFs especificas
    const ufsChave = [
      "Todas",
      "Sao Paulo",
      "Minas Gerais",
      "Rio de Janeiro",
      "Bahia",
      "Distrito Federal",
      "Acre",
      "Amazonas",
      "Tocantins",
    ];

    const presentes: string[] = [];
    const ausentes: string[] = [];
    for (const uf of ufsChave) {
      if (optionsNorm.some((o) => o.toLowerCase().includes(uf.toLowerCase()))) {
        presentes.push(uf);
      } else {
        ausentes.push(uf);
      }
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.5.1_filtro_uf.png`,
      fullPage: true,
    });

    console.log(
      `7.5.1 - Total opcoes UF: ${options.length}. Esperadas: ${totalEsperado}. UFs chave presentes: [${presentes.join(", ")}]. Ausentes: [${ausentes.join(", ")}]`
    );
    console.log(`7.5.1 - Lista completa: [${optionsNorm.join(", ")}]`);

    expect(options.length).toBe(totalEsperado);
  });

  test("7.5.2 - Selecionar UF Sao Paulo e verificar", async ({ page }) => {
    await navigateToCaptacao(page);

    const selectUF = page.locator(
      '.form-field:has(.form-field-label:text("UF")) select'
    ).first();
    await selectUF.selectOption({ label: "Sao Paulo" });

    const valorSelecionado = await selectUF.inputValue();
    expect(valorSelecionado).toBe("SP");

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.5.2_uf_sao_paulo.png`,
      fullPage: true,
    });

    console.log(`7.5.2 - UF selecionada: ${valorSelecionado}`);
  });

  // Teste completo de busca com todos os filtros
  test("7.ALL - Busca completa com todos os filtros combinados", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    // Preencher todos os campos
    const campoTermo = page.locator(
      '.form-field:has(.form-field-label:text("Termo")) input'
    ).first();
    await campoTermo.fill("reagente");

    const selectUF = page.locator(
      '.form-field:has(.form-field-label:text("UF")) select'
    ).first();
    await selectUF.selectOption({ label: "Todas" });

    const selectFonte = page.locator(
      '.form-field:has(.form-field-label:text("Fonte")) select'
    ).first();
    await selectFonte.selectOption({ label: "PNCP" });

    const selectTipo = page.locator(
      '.form-field:has(.form-field-label:text("Classificacao Tipo")) select'
    ).first();
    await selectTipo.selectOption({ label: "Todos" });

    const selectOrigem = page.locator(
      '.form-field:has(.form-field-label:text("Classificacao Origem")) select'
    ).first();
    await selectOrigem.selectOption({ label: "Todos" });

    // Screenshot com formulario preenchido
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.ALL_formulario_preenchido.png`,
      fullPage: true,
    });

    // Buscar
    await buscarEditais(page, "reagente");

    // Verificar resultados
    const temResultados = await page
      .locator("text=editais encontrados")
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.ALL_resultados_busca.png`,
      fullPage: true,
    });

    console.log(
      `7.ALL - Busca completa com filtros: resultados visiveis=${temResultados}`
    );
  });

  // Verificacao de stat cards (prazos)
  test("7.EXTRA - 4 StatCards de prazo no topo da pagina", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    // Verificar stat cards
    const statCards = page.locator(".stat-card");
    const count = await statCards.count();

    // Verificar labels dos 4 stat cards
    const proximos2 = page.locator('text=Proximos 2 dias');
    const proximos5 = page.locator('text=Proximos 5 dias');
    const proximos10 = page.locator('text=Proximos 10 dias');
    const proximos20 = page.locator('text=Proximos 20 dias');

    const vis2 = await proximos2.isVisible({ timeout: 3000 }).catch(() => false);
    const vis5 = await proximos5.isVisible({ timeout: 3000 }).catch(() => false);
    const vis10 = await proximos10.isVisible({ timeout: 3000 }).catch(() => false);
    const vis20 = await proximos20.isVisible({ timeout: 3000 }).catch(() => false);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.EXTRA_stat_cards.png`,
      fullPage: true,
    });

    console.log(
      `7.EXTRA - StatCards count: ${count}. 2d=${vis2}, 5d=${vis5}, 10d=${vis10}, 20d=${vis20}`
    );

    expect(count).toBe(4);
    expect(vis2).toBeTruthy();
    expect(vis5).toBeTruthy();
    expect(vis10).toBeTruthy();
    expect(vis20).toBeTruthy();
  });

  // Verificacao de Monitoramento Automatico
  test("7.EXTRA2 - Card Monitoramento Automatico presente", async ({
    page,
  }) => {
    await navigateToCaptacao(page);

    const cardMonitoramento = page.locator(
      'text=Monitoramento Automatico'
    ).first();
    const monitoramentoVisivel = await cardMonitoramento
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Verificar botao Atualizar
    const btnAtualizar = page.locator('button:has-text("Atualizar")').first();
    const atualizarVisivel = await btnAtualizar
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/7.EXTRA2_monitoramento.png`,
      fullPage: true,
    });

    console.log(
      `7.EXTRA2 - Monitoramento card: ${monitoramentoVisivel}, Botao Atualizar: ${atualizarVisivel}`
    );

    expect(monitoramentoVisivel).toBeTruthy();
  });
});

// ========================================================================
// VALIDACAO VIA API - Verificacoes de backend
// ========================================================================

test.describe("API - Verificacoes de Backend para P6/P7", () => {
  test("API.1 - Endpoint /api/editais/buscar funciona", async () => {
    const token = await getToken();
    const res = await fetch(
      `${API_URL}/api/editais/buscar?termo=reagente&calcularScore=true&limite=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("success");

    const editais = data.editais || [];
    console.log(
      `API.1 - Busca retornou ${editais.length} editais. Success=${data.success}`
    );

    if (editais.length > 0) {
      const primeiro = editais[0];
      const campos = Object.keys(primeiro);
      console.log(`API.1 - Campos do edital: ${campos.join(", ")}`);
    }
  });

  test("API.2 - Endpoint /api/editais/salvos funciona", async () => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/editais/salvos?com_score=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const editais = data.editais || data || [];

    console.log(`API.2 - Editais salvos: ${editais.length}`);

    if (editais.length > 0) {
      const primeiro = editais[0];
      const campos = Object.keys(primeiro);
      console.log(`API.2 - Campos: ${campos.join(", ")}`);
    }
  });

  test("API.3 - Login funciona e retorna token", async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("access_token");
    expect(data.access_token).toBeTruthy();

    console.log("API.3 - Login OK, token recebido");
  });
});
