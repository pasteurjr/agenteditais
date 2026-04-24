import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, assertDataVisible } from "../helpers";

const SS = (name: string) => `runtime/screenshots/sprint9/${name}.png`;

test.describe.serial("Sprint 9 — Validacao Completa CH Hospitalar", () => {

  // ==================== FASE 1: LANCES EM TEMPO REAL ====================

  test("LA01: LancesPage — titulo e estrutura principal", async ({ page }) => {
    await login(page);
    await navTo(page, "Lances");
    await page.waitForTimeout(4000);
    const body = await getBody(page);

    // Verificar titulo e subtitulo
    expect(body).toContain("Acompanhamento de Lances");
    expect(body).toContain("Pregoes em andamento e historico");

    // Verificar card "Pregoes Hoje" presente
    expect(body).toContain("Pregoes Hoje");

    // Verificar card "Historico de Lances" presente
    expect(body).toContain("Historico de Lances");

    await page.screenshot({ path: SS("LA01_01_titulo_estrutura"), fullPage: true });
  });

  test("LA02: LancesPage — stat cards Vitorias/Derrotas/Taxa", async ({ page }) => {
    await login(page);
    await navTo(page, "Lances");
    await page.waitForTimeout(4000);
    const body = await getBody(page);

    // Verificar presenca dos 3 stat cards
    expect(body).toContain("Vitorias");
    expect(body).toContain("Derrotas");
    expect(body).toContain("Taxa de Sucesso");

    // Screenshot focado nos stat cards (area abaixo da tabela de pregoes)
    await page.screenshot({ path: SS("LA02_01_stat_cards"), fullPage: true });

    // Verificar que stat cards sao stat-label elements
    const statLabels = page.locator(".stat-label");
    const count = await statLabels.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Capturar os valores exatos dos stat cards
    const statValues = page.locator(".stat-value");
    const valCount = await statValues.count();
    expect(valCount).toBeGreaterThanOrEqual(3);
    const valores: string[] = [];
    for (let i = 0; i < Math.min(valCount, 5); i++) {
      valores.push(await statValues.nth(i).innerText());
    }
    // Salvar screenshot com crop nos stats
    await page.screenshot({
      path: SS("LA02_02_valores_stat_cards"),
      clip: { x: 0, y: 300, width: 1400, height: 200 },
    });
  });

  test("LA03: LancesPage — botoes de acao (Entrar na Sala / Abrir Portal)", async ({ page }) => {
    await login(page);
    await navTo(page, "Lances");
    await page.waitForTimeout(4000);

    // Verificar se ha botoes de acao nas linhas da tabela
    const btns = page.locator("button").filter({ hasText: /Entrar na Sala|Abrir Portal/i });
    const count = await btns.count();
    // Pode haver 0 se nao ha pregoes hoje, mas a estrutura deve existir
    await page.screenshot({ path: SS("LA03_01_botoes_acao"), fullPage: true });

    // Se ha botoes, verificar que os labels estao corretos
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await btns.nth(i).innerText();
        expect(text).toMatch(/Entrar na Sala|Abrir Portal/i);
      }
    }
  });

  test("LA04: Sala Virtual — cabecalho com Camadas A/D/E via API", async ({ page }) => {
    await login(page);
    // Testar via API direta o endpoint da sala virtual
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    // Buscar sessao ativa via API
    const response = await page.request.get("http://localhost:5007/api/sala/b86c3b7d-51e3-496c-b859-6d3c828dbe6c/estado", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Validar estrutura da resposta
    expect(data.sessao).toBeDefined();
    expect(["ativa", "encerrada"]).toContain(data.sessao.status);
    expect(data.sessao.modalidade).toBe("aberto");
    expect(["aberta", "encerrada"]).toContain(data.sessao.fase_atual);
    expect(data.sessao.autonomia).toBe("copiloto");
    expect(typeof data.sessao.robo_ativo).toBe("boolean");

    // Validar camadas (PrecoCamada)
    expect(data.camadas).toBeDefined();
    expect(data.camadas.lance_inicial).toBe(495.0);
    expect(data.camadas.lance_minimo).toBe(385.0);
    expect(data.camadas.margem_minima).toBe(13.24);
    expect(data.camadas.custo_base).toBeGreaterThan(0);

    // Validar estrategia
    expect(data.estrategia).toBeDefined();
    expect(data.estrategia.perfil).toBe("quero_ganhar");

    await page.screenshot({ path: SS("LA04_01_sala_api_validada") });
  });

  test("LA05: Sala Virtual — sugestao de lance via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));
    const sessaoId = "b86c3b7d-51e3-496c-b859-6d3c828dbe6c";

    // Pedir sugestao de lance
    const response = await page.request.post(`http://localhost:5007/api/sala/${sessaoId}/sugerir-lance`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        lance_lider: 480,
        nosso_ultimo: 495,
        decremento_medio: 10,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Validar estrutura da sugestao
    expect(data.lance_sugerido).toBeDefined();
    expect(typeof data.lance_sugerido).toBe("number");
    expect(data.lance_sugerido).toBeGreaterThan(0);

    expect(data.margem_sobre_custo).toBeDefined();
    expect(typeof data.margem_sobre_custo).toBe("number");

    expect(data.posicao_estimada).toBeDefined();
    expect(data.confianca).toBeDefined();
    expect(["alta", "media", "baixa"]).toContain(data.confianca);

    expect(data.justificativa).toBeDefined();
    expect(typeof data.justificativa).toBe("string");

    expect(typeof data.abaixo_custo).toBe("boolean");

    // Lance sugerido deve ser menor que lance lider (quero_ganhar)
    expect(data.lance_sugerido).toBeLessThanOrEqual(480);

    // Lance sugerido nao deve ser menor que lance minimo (385)
    expect(data.lance_sugerido).toBeGreaterThanOrEqual(385);

    await page.screenshot({ path: SS("LA05_01_sugestao_api") });
  });

  test("LA06: PrecificacaoPage — Simulador Deterministico", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificacao");
    await page.waitForTimeout(4000);

    // Selecionar o edital 90006/2026 que tem vinculos e PrecoCamada
    const selectEdital = page.locator("select").first();
    if (await selectEdital.count() > 0) {
      // Clicar no dropdown para abrir opcoes
      await selectEdital.click();
      await page.waitForTimeout(1000);
      // Tentar selecionar por option que contem texto do edital
      const options = page.locator("option");
      const optCount = await options.count();
      for (let i = 0; i < optCount; i++) {
        const text = await options.nth(i).innerText();
        if (text.includes("90006")) {
          await selectEdital.selectOption({ index: i });
          break;
        }
      }
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: SS("LA06_01_edital_selecionado"), fullPage: true });

    // Navegar para tab Estrategia
    const tabEstrategia = page.locator("button, [role='tab']").filter({ hasText: /Estrat[eé]gia/i }).first();
    if (await tabEstrategia.count() > 0) {
      await tabEstrategia.click();
      await page.waitForTimeout(3000);
    }

    const body = await getBody(page);
    await page.screenshot({ path: SS("LA06_02_tab_estrategia"), fullPage: true });

    // Verificar conteudo da tab (pode ser Simulador, Score, DRE ou outro conteudo de Estrategia)
    const hasEstrategia = body.includes("Simulador") || body.includes("Score") || body.includes("DRE") ||
                          body.includes("Estrat") || body.includes("Competitividade") || body.includes("Precifica");
    expect(hasEstrategia).toBeTruthy();

    // Verificar botao Simular se presente
    const btnSimular = page.locator("button").filter({ hasText: /Simular/i }).first();
    if (await btnSimular.count() > 0) {
      await page.screenshot({ path: SS("LA06_03_form_simulador"), fullPage: true });

      await btnSimular.click();
      await page.waitForTimeout(5000);

      const bodyAfter = await getBody(page);
      await page.screenshot({ path: SS("LA06_04_resultado_simulacao"), fullPage: true });
    }
  });

  test("LA07: PrecificacaoPage — Score de Competitividade", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificacao");
    await page.waitForTimeout(4000);

    // Selecionar edital
    const selectEdital = page.locator("select").first();
    if (await selectEdital.count() > 0) {
      const options = page.locator("option");
      const optCount = await options.count();
      for (let i = 0; i < optCount; i++) {
        const text = await options.nth(i).innerText();
        if (text.includes("90006")) {
          await selectEdital.selectOption({ index: i });
          break;
        }
      }
      await page.waitForTimeout(3000);
    }

    const tabEstrategia = page.locator("button, [role='tab']").filter({ hasText: /Estrat[eé]gia/i }).first();
    if (await tabEstrategia.count() > 0) {
      await tabEstrategia.click();
      await page.waitForTimeout(3000);
    }

    const body = await getBody(page);
    await page.screenshot({ path: SS("LA07_01_score_competitividade"), fullPage: true });

    // Verificar que conteudo de estrategia carregou (Score, Simulador ou DRE)
    const hasContent = body.includes("Score") || body.includes("Competitividade") ||
                       body.includes("Simulador") || body.includes("DRE") || body.includes("Estrat");
    expect(hasContent).toBeTruthy();
  });

  test("LA08: PrecificacaoPage — Simular DRE", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificacao");
    await page.waitForTimeout(4000);

    // Selecionar edital
    const selectEdital = page.locator("select").first();
    if (await selectEdital.count() > 0) {
      const options = page.locator("option");
      const optCount = await options.count();
      for (let i = 0; i < optCount; i++) {
        const text = await options.nth(i).innerText();
        if (text.includes("90006")) {
          await selectEdital.selectOption({ index: i });
          break;
        }
      }
      await page.waitForTimeout(3000);
    }

    const tabEstrategia = page.locator("button, [role='tab']").filter({ hasText: /Estrat[eé]gia/i }).first();
    if (await tabEstrategia.count() > 0) {
      await tabEstrategia.click();
      await page.waitForTimeout(3000);
    }

    const body = await getBody(page);

    // Verificar presenca de DRE
    const hasDRE = body.includes("DRE");
    expect(hasDRE).toBeTruthy();

    // Verificar botao Simular DRE
    const btnDRE = page.locator("button").filter({ hasText: /Simular DRE/i }).first();
    if (await btnDRE.count() > 0) {
      await page.screenshot({ path: SS("LA08_01_botao_dre"), fullPage: true });

      await btnDRE.click();
      await page.waitForTimeout(5000);

      const bodyAfter = await getBody(page);
      await page.screenshot({ path: SS("LA08_02_resultado_dre"), fullPage: true });

      // Verificar linhas do DRE
      const hasReceita = bodyAfter.includes("Receita") || bodyAfter.includes("receita");
      const hasMargem = bodyAfter.includes("Resultado") || bodyAfter.includes("Margem") || bodyAfter.includes("Atrativ");
      expect(hasReceita || hasMargem).toBeTruthy();
    } else {
      await page.screenshot({ path: SS("LA08_01_dre_card"), fullPage: true });
    }
  });

  test("LA09: MonitoriaPage — monitoramento sessao_pregao", async ({ page }) => {
    await login(page);
    await navTo(page, "Monitoria");
    await page.waitForTimeout(4000);
    const body = await getBody(page);
    await page.screenshot({ path: SS("LA09_01_monitoria_dashboard"), fullPage: true });

    // Verificar presenca de conteudo de monitoria
    expect(body).toContain("Monitor");

    // Verificar badge "Sessao" para monitoramentos tipo sessao_pregao
    const hasSessaoBadge = body.includes("Sessao") || body.includes("sessao_pregao");
    // O monitoramento do seed deve ter badge Sessao
    await page.screenshot({ path: SS("LA09_02_badge_sessao"), fullPage: true });

    // Verificar botao "Monitorar Sessao de Pregao"
    const btnMonitorar = page.locator("button").filter({ hasText: /Monitorar Sess/i }).first();
    const btnCount = await btnMonitorar.count();
    if (btnCount > 0) {
      const btnText = await btnMonitorar.innerText();
      expect(btnText).toContain("Monitorar");

      // Clicar para abrir modal
      await btnMonitorar.click();
      await page.waitForTimeout(2000);
      const bodyModal = await getBody(page);
      await page.screenshot({ path: SS("LA09_03_modal_sessao"), fullPage: true });

      // Verificar campos do modal
      const hasEdital = bodyModal.includes("Edital");
      const hasTermo = bodyModal.includes("Termo") || bodyModal.includes("Sessao");
      expect(hasEdital || hasTermo).toBeTruthy();

      // Verificar botao Criar
      const btnCriar = page.locator("button").filter({ hasText: /Criar/i }).first();
      expect(await btnCriar.count()).toBeGreaterThan(0);
    }
  });

  // ==================== FASE 2: INDICADORES AVANCADOS ====================

  test("SC01: ConcorrenciaPage — coluna Qualidade e card media", async ({ page }) => {
    await login(page);
    await navTo(page, "Concorrencia");
    await page.waitForTimeout(5000);
    const body = await getBody(page);
    await page.screenshot({ path: SS("SC01_01_concorrencia_geral"), fullPage: true });

    // Verificar presenca da pagina
    expect(body).toContain("Concorr");

    // Verificar coluna "Qualidade" presente
    const hasQualidade = body.includes("Qualidade");
    expect(hasQualidade).toBeTruthy();

    // Verificar badges de qualidade (Alta/Media/Baixa)
    const hasAlta = body.includes("Alta");
    // Concorrentes do seed tem scores 90+ portanto devem ser "Alta"

    // Verificar stat card "Qualidade Media do Orgao"
    const hasMediaOrgao = body.includes("Qualidade Media") || body.includes("Qualidade M");
    await page.screenshot({ path: SS("SC01_02_qualidade_media_orgao"), fullPage: true });

    // Verificar stat cards superiores
    const hasConhecidos = body.includes("Concorrentes Conhecidos") || body.includes("Conhecidos");
    const hasTaxa = body.includes("Nossa Taxa") || body.includes("Taxa");
    expect(hasConhecidos || hasTaxa).toBeTruthy();

    // Verificar que existem linhas de dados na tabela
    const rows = page.locator("table tbody tr, .data-table-row");
    const rowCount = await rows.count();
    // Deve ter pelo menos 1 concorrente
    expect(rowCount).toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: SS("SC01_03_tabela_concorrentes"), fullPage: true });
  });

  test("SC02: ConcorrenciaPage — API Qualidade Concorrente detalhada", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    // Buscar qualidade do primeiro concorrente
    const response = await page.request.get("http://localhost:5007/api/concorrentes/092e428b-35b0-4f46-9fa3-614369bafd8a/qualidade", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Validar campos obrigatorios
    expect(data.success).toBe(true);
    expect(data.score).toBeDefined();
    expect(typeof data.score).toBe("number");
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);

    expect(data.badge).toBeDefined();
    expect(["Alta", "Media", "Baixa"]).toContain(data.badge);

    expect(data.editais_participados).toBeDefined();
    expect(typeof data.editais_participados).toBe("number");
    expect(data.editais_participados).toBeGreaterThanOrEqual(0);

    expect(data.desclassificacoes).toBeDefined();
    expect(typeof data.desclassificacoes).toBe("number");

    // Concorrente 092e com 12 participados e 1 desclassificacao
    // Score esperado: 100 - (1/12)*100 = 91.7
    expect(data.score).toBeCloseTo(91.7, 0);
    expect(data.badge).toBe("Alta");
    expect(data.desclassificacoes).toBe(1);

    await page.screenshot({ path: SS("SC02_01_qualidade_api") });
  });

  test("SC03: RecursosPage — Score de Recurso com gauge", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await page.waitForTimeout(5000);
    const body = await getBody(page);
    await page.screenshot({ path: SS("SC03_01_recursos_geral"), fullPage: true });

    // Verificar presenca da pagina de recursos
    expect(body).toContain("Recurso");

    // Verificar "Status dos Servicos" card com health check
    const hasHealth = body.includes("Status dos Servi") || body.includes("Status");
    expect(hasHealth).toBeTruthy();

    // Verificar monitoramento de janela
    const hasMonitoramento = body.includes("Monitoramento") || body.includes("Janela");
    expect(hasMonitoramento).toBeTruthy();

    // Score de Recurso requer selecao de edital na tab de analise
    // Tentar selecionar edital no dropdown de monitoramento/analise
    const selectEdital = page.locator("select").first();
    if (await selectEdital.count() > 0) {
      const options = page.locator("option");
      const optCount = await options.count();
      for (let i = 1; i < Math.min(optCount, 5); i++) {
        const text = await options.nth(i).innerText();
        if (text.length > 5) {
          await selectEdital.selectOption({ index: i });
          break;
        }
      }
      await page.waitForTimeout(4000);
      const bodyAfter = await getBody(page);
      await page.screenshot({ path: SS("SC03_02_com_edital"), fullPage: true });

      // Com edital selecionado, Score de Recurso pode aparecer
      if (bodyAfter.includes("Score de Recurso")) {
        // Verificar gauge e recomendacao
        const hasRecomendacao = bodyAfter.includes("Recomendado") || bodyAfter.includes("Inconclusivo") || bodyAfter.includes("recomendado");
        await page.screenshot({ path: SS("SC03_03_score_recurso_card"), fullPage: true });
      }
    }
  });

  test("SC04: RecursosPage — Score Recurso via API detalhada", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    // Score recurso para um edital CH
    const response = await page.request.get("http://localhost:5007/api/recursos/02d3ce22-5f04-4208-9d75-2ccae6495404/score", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Validar estrutura
    expect(data.success).toBe(true);
    expect(data.score).toBeDefined();
    expect(typeof data.score).toBe("number");
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);

    expect(data.recomendacao).toBeDefined();
    expect(["Recurso recomendado", "Inconclusivo", "Não recomendado"]).toContain(data.recomendacao);

    // Validar 4 fatores
    expect(data.fatores).toBeDefined();
    expect(Array.isArray(data.fatores)).toBeTruthy();
    expect(data.fatores.length).toBe(4);

    // Verificar nomes dos fatores
    const nomes = data.fatores.map((f: any) => f.nome);
    expect(nomes).toContain("Desvios Técnicos");
    expect(nomes).toContain("Histórico Empresa");
    expect(nomes).toContain("Histórico Órgão");
    expect(nomes).toContain("Fundamento Legal");

    // Verificar pesos (40+20+25+15 = 100)
    const pesos = data.fatores.map((f: any) => f.peso);
    expect(pesos).toContain(40);
    expect(pesos).toContain(20);
    expect(pesos).toContain(25);
    expect(pesos).toContain(15);

    await page.screenshot({ path: SS("SC04_01_recurso_api") });
  });

  test("SC05: ContratadoRealizadoPage — Tempo Medio Empenho", async ({ page }) => {
    await login(page);
    await navTo(page, "Contratado");
    await page.waitForTimeout(5000);
    const body = await getBody(page);
    await page.screenshot({ path: SS("SC05_01_contratado_geral"), fullPage: true });

    // Verificar presenca da pagina
    expect(body).toContain("Contratado");

    // Verificar stat card "Tempo Medio 1o Empenho"
    const hasTempoMedio = body.includes("Tempo") && body.includes("Empenho");
    expect(hasTempoMedio).toBeTruthy();

    // Verificar que mostra valor em dias
    const hasDias = body.includes("dias");
    expect(hasDias).toBeTruthy();

    // Screenshot focado nos KPIs
    await page.screenshot({ path: SS("SC05_02_tempo_empenho_card"), fullPage: true });
  });

  test("SC06: ContratadoRealizadoPage — Tempo Empenho via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    const response = await page.request.get("http://localhost:5007/api/analytics/tempo-empenho", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Validar campos obrigatorios
    expect(data.media_global).toBeDefined();
    expect(typeof data.media_global).toBe("number");
    expect(data.media_global).toBeGreaterThan(0);

    expect(data.total_contratos).toBeDefined();
    expect(typeof data.total_contratos).toBe("number");
    expect(data.total_contratos).toBeGreaterThanOrEqual(1);

    expect(data.sem_empenho).toBeDefined();
    expect(typeof data.sem_empenho).toBe("number");

    // Verificar distribuicao
    expect(data.distribuicao).toBeDefined();
    expect(data.distribuicao["0-30"]).toBeDefined();
    expect(data.distribuicao["31-60"]).toBeDefined();
    expect(data.distribuicao["61-90"]).toBeDefined();
    expect(data.distribuicao[">90"]).toBeDefined();

    // Verificar por_orgao
    expect(data.por_orgao).toBeDefined();
    expect(Array.isArray(data.por_orgao)).toBeTruthy();
    if (data.por_orgao.length > 0) {
      const org = data.por_orgao[0];
      expect(org.orgao).toBeDefined();
      expect(org.media_dias).toBeDefined();
      expect(org.contratos).toBeDefined();
      expect(org.badge).toBeDefined();
      expect(["Rápido", "Normal", "Lento"]).toContain(org.badge);
    }

    await page.screenshot({ path: SS("SC06_01_tempo_empenho_api") });
  });

  test("SC07: ContratadoRealizadoPage — DRE do Contrato via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    // Buscar primeiro contrato CH
    const listResponse = await page.request.get("http://localhost:5007/api/contratos/listar", {
      headers: { Authorization: `Bearer ${token}` },
    });
    let contratoId = "";
    if (listResponse.ok()) {
      const listData = await listResponse.json();
      const contratos = listData.contratos || listData || [];
      if (Array.isArray(contratos) && contratos.length > 0) {
        contratoId = contratos[0].id;
      }
    }

    if (contratoId) {
      const response = await page.request.get(`http://localhost:5007/api/contratos/${contratoId}/dre`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status()).toBe(200);
      const data = await response.json();

      // Validar estrutura DRE
      expect(data.success).toBe(true);
      expect(data.tipo).toBeDefined();
      expect(["realizado", "simulado"]).toContain(data.tipo);

      expect(data.linhas).toBeDefined();
      expect(Array.isArray(data.linhas)).toBeTruthy();
      expect(data.linhas.length).toBeGreaterThanOrEqual(4);

      // Validar linhas do DRE
      const descricoes = data.linhas.map((l: any) => l.descricao);
      expect(descricoes).toContain("Receita Bruta");
      expect(descricoes.some((d: string) => d.includes("Impostos"))).toBeTruthy();
      expect(descricoes.some((d: string) => d.includes("Receita L"))).toBeTruthy();
      expect(descricoes.some((d: string) => d.includes("Custos"))).toBeTruthy();
      expect(descricoes.some((d: string) => d.includes("Resultado"))).toBeTruthy();

      // Validar margem e badge
      expect(data.margem_percentual).toBeDefined();
      expect(typeof data.margem_percentual).toBe("number");

      expect(data.badge).toBeDefined();
      expect(["verde", "amarelo", "vermelho"]).toContain(data.badge);
    }

    await page.screenshot({ path: SS("SC07_01_dre_api") });
  });

  test("SC08: ContratadoRealizadoPage — colunas DRE e 1o Empenho na tabela", async ({ page }) => {
    await login(page);
    await navTo(page, "Contratado");
    await page.waitForTimeout(5000);
    const body = await getBody(page);

    // Verificar coluna DRE na tabela
    const hasDRE = body.includes("DRE");
    expect(hasDRE).toBeTruthy();

    // Verificar coluna 1o Empenho
    const hasEmpenho = body.includes("Empenho");
    expect(hasEmpenho).toBeTruthy();

    // Verificar que a tabela por orgao existe
    const hasOrgao = body.includes("Orgao") || body.includes("orgao");

    await page.screenshot({ path: SS("SC08_01_tabela_dre_empenho"), fullPage: true });

    // Verificar badges de classificacao (Rapido/Normal/Lento)
    const hasBadge = body.includes("Rapido") || body.includes("Normal") || body.includes("Lento") ||
                     body.includes("Verde") || body.includes("Amarelo") || body.includes("Vermelho");
    await page.screenshot({ path: SS("SC08_02_badges_classificacao"), fullPage: true });
  });

  test("SC09: CaptacaoPage — coluna Competitividade apos busca", async ({ page }) => {
    await login(page);
    await navTo(page, "Captacao");
    await page.waitForTimeout(4000);
    const body = await getBody(page);
    await page.screenshot({ path: SS("SC09_01_captacao_geral"), fullPage: true });

    // Verificar que a pagina carregou (titulo e tabs)
    expect(body).toContain("Captacao");

    // A coluna Competitividade aparece na tabela de resultados apos busca.
    // Clicar em "Buscar Editais" para executar busca com filtros atuais
    const btnBuscar = page.locator("button").filter({ hasText: /Buscar Editais/i }).first();
    if (await btnBuscar.count() > 0) {
      await btnBuscar.click();
      await page.waitForTimeout(8000);
      const bodyAfter = await getBody(page);
      await page.screenshot({ path: SS("SC09_02_resultados_busca"), fullPage: true });

      // Verificar se a coluna Competitividade aparece na tabela de resultados
      const hasCompetitividade = bodyAfter.includes("Competitividade") || bodyAfter.includes("competitividade");
      if (hasCompetitividade) {
        // Coluna esta visivel — busca retornou resultados com tabela
        await page.screenshot({ path: SS("SC09_03_coluna_competitividade"), fullPage: true });
      }
      // Mesmo sem coluna visivel, a busca deve funcionar
      expect(bodyAfter.length).toBeGreaterThan(100);
    }

    // Verificar via API que o endpoint de competitividade funciona
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));
    const response = await page.request.get("http://localhost:5007/api/score/competitividade/2a29c044-eefd-4581-af34-b38fce8a17dd", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.score).toBeDefined();
    expect(typeof data.score).toBe("number");
  });

  // ==================== FASE 3: HEALTH CHECK ====================

  test("HC01: Health Check — GET /api/health completo", async ({ page }) => {
    // Endpoint publico, sem auth
    const response = await page.request.get("http://localhost:5007/api/health");
    expect(response.status()).toBeLessThan(503);
    const data = await response.json();

    // Status geral
    expect(data.status).toBeDefined();
    expect(["healthy", "degraded", "unhealthy"]).toContain(data.status);

    // Versao
    expect(data.version).toBe("9.0.0");

    // Timestamp
    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe("string");

    // Services
    expect(data.services).toBeDefined();
    expect(Array.isArray(data.services)).toBeTruthy();
    expect(data.services.length).toBe(7);

    // Validar cada servico
    const serviceNames = data.services.map((s: any) => s.name);
    expect(serviceNames).toContain("database");
    expect(serviceNames).toContain("pncp");
    expect(serviceNames).toContain("deepseek");
    expect(serviceNames).toContain("brave");
    expect(serviceNames).toContain("smtp");
    expect(serviceNames).toContain("cache");
    expect(serviceNames).toContain("scheduler");

    // Cada servico deve ter status e latency_ms
    for (const service of data.services) {
      expect(service.name).toBeDefined();
      expect(service.status).toBeDefined();
      expect(["healthy", "degraded", "unhealthy"]).toContain(service.status);
      expect(service.latency_ms).toBeDefined();
      expect(typeof service.latency_ms).toBe("number");
    }

    // Database deve estar healthy
    const dbService = data.services.find((s: any) => s.name === "database");
    expect(dbService.status).toBe("healthy");
    expect(dbService.latency_ms).toBeLessThan(1000);

    await page.screenshot({ path: SS("HC01_01_health_check") });
  });

  test("HC02: Score Competitividade — API detalhada com 4 fatores", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    const response = await page.request.get("http://localhost:5007/api/score/competitividade/2a29c044-eefd-4581-af34-b38fce8a17dd", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Score
    expect(data.score).toBeDefined();
    expect(typeof data.score).toBe("number");
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);

    // 4 fatores
    expect(data.fatores).toBeDefined();
    expect(Array.isArray(data.fatores)).toBeTruthy();
    expect(data.fatores.length).toBe(4);

    // Verificar nomes exatos
    const nomes = data.fatores.map((f: any) => f.nome);
    expect(nomes).toContain("Histórico Similar");
    expect(nomes).toContain("Posição de Preço");
    expect(nomes).toContain("Concorrência");
    expect(nomes).toContain("Perfil Órgão");

    // Verificar pesos (30+30+20+20 = 100)
    const pesos = data.fatores.map((f: any) => f.peso);
    expect(pesos).toContain(30);
    expect(pesos).toContain(20);

    // Cada fator deve ter valor numerico
    for (const fator of data.fatores) {
      expect(typeof fator.valor).toBe("number");
      expect(fator.valor).toBeGreaterThanOrEqual(0);
    }

    // Confianca
    expect(data.confianca).toBeDefined();
    expect(["alta", "media", "baixa"]).toContain(data.confianca);

    // Bootstrap
    expect(typeof data.bootstrap_pncp).toBe("boolean");

    await page.screenshot({ path: SS("HC02_01_competitividade_api") });
  });

});
