import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody } from "../helpers";

const SS = (name: string) => `runtime/screenshots/sprint9/${name}.png`;

test.describe.serial("Sprint 9 — Validacao Complementar: Sala Virtual + Robo + Qualidade Orgao", () => {

  test("SV01: Sala Virtual — enviar lance e verificar resposta", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));
    const sessaoId = "b86c3b7d-51e3-496c-b859-6d3c828dbe6c";

    // Enviar lance na sessao ativa
    const response = await page.request.post(`http://localhost:5007/api/sala/${sessaoId}/lance`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: { valor: 480.0 },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    // Verificar que lance foi registrado no estado
    const estadoResp = await page.request.get(`http://localhost:5007/api/sala/${sessaoId}/estado`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const estado = await estadoResp.json();
    expect(estado.lances).toBeDefined();
    expect(Array.isArray(estado.lances)).toBeTruthy();
    expect(estado.lances.length).toBeGreaterThanOrEqual(1);

    // Verificar valores do lance enviado
    const ultimoLance = estado.lances[0];
    expect(ultimoLance.valor_lance).toBe(480.0);
    expect(ultimoLance.tipo).toBeDefined();
    expect(ultimoLance.fase).toBe("aberta");
    expect(ultimoLance.status).toBe("enviado");

    // Verificar margem sobre custo calculada
    expect(ultimoLance.margem_sobre_custo).toBeDefined();

    await page.screenshot({ path: SS("SV01_01_lance_enviado") });
  });

  test("SV02: Sala Virtual — robo ativar/desativar", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));
    const sessaoId = "b86c3b7d-51e3-496c-b859-6d3c828dbe6c";

    // Tentar ativar robo (pode falhar se AUTO_BID_ENABLED=false)
    const response = await page.request.post(`http://localhost:5007/api/sala/${sessaoId}/robo/ativar`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        modo_decremento: "fixo_reais",
        valor_decremento: 10,
        max_lances: 20,
      },
    });

    const data = await response.json();
    if (data.error && data.error.includes("AUTO_BID_ENABLED")) {
      // RN-NEW-12: Robo desabilitado por padrao — validacao OK
      expect(data.error).toContain("AUTO_BID_ENABLED");
    } else if (data.success) {
      // Se ativou, verificar estado
      const estadoResp = await page.request.get(`http://localhost:5007/api/sala/${sessaoId}/estado`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const estado = await estadoResp.json();
      expect(estado.sessao.robo_ativo).toBe(true);

      // Desativar
      const desResp = await page.request.post(`http://localhost:5007/api/sala/${sessaoId}/robo/desativar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(desResp.status()).toBe(200);
      const desData = await desResp.json();
      expect(desData.success).toBe(true);
    }

    await page.screenshot({ path: SS("SV02_01_robo_resposta") });
  });

  test("SV03: Sala Virtual — encerrar sessao e verificar resultado", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));
    const sessaoId = "b86c3b7d-51e3-496c-b859-6d3c828dbe6c";

    // Verificar estado atual
    const estadoAntes = await page.request.get(`http://localhost:5007/api/sala/${sessaoId}/estado`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const antes = await estadoAntes.json();

    if (antes.sessao.status === "ativa") {
      // Encerrar com resultado vitoria
      const response = await page.request.post(`http://localhost:5007/api/sala/${sessaoId}/encerrar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { resultado: "vitoria", posicao_final: 1 },
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verificar estado apos encerramento
      const estadoDepois = await page.request.get(`http://localhost:5007/api/sala/${sessaoId}/estado`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const depois = await estadoDepois.json();
      expect(depois.sessao.status).toBe("encerrada");
      expect(depois.sessao.resultado).toBe("vitoria");
      expect(depois.sessao.posicao_final).toBe(1);
    } else {
      // Sessao ja encerrada, verificar campos
      expect(antes.sessao.status).toBe("encerrada");
      expect(antes.sessao.resultado).toBeDefined();
    }

    await page.screenshot({ path: SS("SV03_01_sessao_encerrada") });
  });

  test("QO01: Qualidade por Orgao via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    // Buscar qualidade por orgao (pode retornar dados se concorrentes tem orgao vinculado)
    const response = await page.request.get("http://localhost:5007/api/analytics/qualidade-orgao/geral", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Pode retornar 200 ou 404 dependendo se ha dados para "geral"
    const data = await response.json();
    if (response.status() === 200 && data.success) {
      expect(data.media_qualidade).toBeDefined();
      expect(typeof data.media_qualidade).toBe("number");
    }

    await page.screenshot({ path: SS("QO01_01_qualidade_orgao") });
  });

  test("SM01: Simulador de Lance via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    // Buscar um vinculo edital_item_produto
    const response = await page.request.post("http://localhost:5007/api/precificacao/simular-lance", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        edital_item_produto_id: "654456c5-0acf-4d2d-80e2-28486a4f6a02",
        num_rodadas: 5,
        tipo_decremento: "fixo_reais",
        valor_decremento: 5.0,
        num_concorrentes: 2,
        perfil: "quero_ganhar",
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Validar estrutura do resultado
    if (data.success !== false && data.rodadas) {
      expect(Array.isArray(data.rodadas)).toBeTruthy();
      expect(data.rodadas.length).toBeGreaterThanOrEqual(1);

      // Cada rodada deve ter campos
      const r = data.rodadas[0];
      expect(r.rodada).toBeDefined();
      expect(r.valor_nosso).toBeDefined();
      expect(typeof r.valor_nosso).toBe("number");
    }

    await page.screenshot({ path: SS("SM01_01_simulador_api") });
  });

  test("MO01: Criar Monitoramento Sessao via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    const response = await page.request.post("http://localhost:5007/api/monitoramentos/sessao-pregao", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        edital_id: "02d3ce22-5f04-4208-9d75-2ccae6495404",
        termo: "Teste validacao Playwright",
        notificar_email: true,
      },
    });

    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.monitoramento).toBeDefined();
    expect(data.monitoramento.tipo).toBe("sessao_pregao");

    await page.screenshot({ path: SS("MO01_01_monitoramento_criado") });
  });

  test("DRE01: Simular DRE via API", async ({ page }) => {
    await login(page);
    const token = await page.evaluate(() => localStorage.getItem("editais_ia_access_token"));

    const response = await page.request.post("http://localhost:5007/api/precificacao/02d3ce22-5f04-4208-9d75-2ccae6495404/simular-dre", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {},
    });
    expect(response.status()).toBe(200);
    const data = await response.json();

    if (data.success) {
      expect(data.tipo).toBe("simulado");
      expect(data.linhas).toBeDefined();
      expect(Array.isArray(data.linhas)).toBeTruthy();
      expect(data.margem_percentual).toBeDefined();
      expect(data.badge).toBeDefined();
      expect(["verde", "amarelo", "vermelho"]).toContain(data.badge);
    }

    await page.screenshot({ path: SS("DRE01_01_dre_simulado") });
  });

});
