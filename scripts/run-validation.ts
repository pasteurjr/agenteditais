#!/usr/bin/env -S npx ts-node
/**
 * Runner do processo V3 — trilha E2E (headless).
 *
 * Uso:
 *   npx ts-node scripts/run-validation.ts <UC-ID> <variacao> <trilha> [--ciclo=<id>]
 *
 * Exemplo:
 *   npx ts-node scripts/run-validation.ts UC-F01 fp e2e --ciclo=2026-04-25_103000
 *
 * Lê:
 *   - tutorial em testes/tutoriais_playwright/<UC>_<variacao>.md
 *   - referencia caso de teste e dataset (resolvidos pelo artifact-loader)
 *   - opcionalmente, contexto do ciclo
 *
 * Executa cada passo com 3 camadas: DOM → Rede → Semântica.
 * Camada 3 (LLM) só roda se 1 e 2 passaram.
 *
 * Salva relatório em testes/relatorios/automatico/<UC>_<variacao>_<ts>.md
 * + screenshots e logs em subpasta de evidências.
 */
import { chromium, Browser, BrowserContext, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  loadTutorial,
  loadYaml,
  loadValidationFromRef,
  loadContexto,
  resolveValor,
  Dataset,
  CasoTeste,
  PassoCasoTeste,
  TutorialPlaywright,
  AcaoTutorial,
  Contexto,
} from "./lib/artifact-loader";
import { julgarSemantico, VeredictoJuiz } from "./lib/judge-semantic";
import {
  ResultadoExecucao,
  ResultadoPasso,
  CamadaDecisiva,
  salvarRelatorio,
} from "./lib/report-generator";
import { captureA11yTree, setupNetworkInterceptor, login as helperLogin } from "../tests/e2e/playwright/helpers";

const PROJECT_ROOT = path.resolve(__dirname, "..");

interface Args {
  uc_id: string;
  variacao: string;
  trilha: "e2e" | "visual" | "humano";
  ciclo_id?: string;
  base_url?: string;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  if (argv.length < 3) {
    console.error("Uso: npx ts-node scripts/run-validation.ts <UC-ID> <variacao> <trilha> [--ciclo=<id>] [--base-url=<url>]");
    process.exit(1);
  }
  const args: Args = {
    uc_id: argv[0],
    variacao: argv[1],
    trilha: argv[2] as "e2e" | "visual" | "humano",
  };
  for (const a of argv.slice(3)) {
    if (a.startsWith("--ciclo=")) args.ciclo_id = a.slice(8);
    if (a.startsWith("--base-url=")) args.base_url = a.slice(11);
  }
  return args;
}

async function main(): Promise<number> {
  const args = parseArgs();
  console.log(`[runner] Iniciando ${args.uc_id}/${args.variacao} (trilha ${args.trilha})`);

  // Este runner roda apenas a trilha E2E (headless). Visual usa framework_visual
  // em Python; Humano nao executa, so gera tutorial pro Arnaldo.
  if (args.trilha !== "e2e") {
    console.error(`[runner] ERRO: este runner so suporta trilha=e2e. Para 'visual', usar:`);
    console.error(`  python testes/framework_visual/executor.py ${args.uc_id} ${args.variacao}`);
    console.error(`Para 'humano': nao precisa rodar — apenas gerar o tutorial.`);
    return 2;
  }

  // Carregar tutorial
  const tutorialPath = `testes/tutoriais_playwright/${args.uc_id}_${args.variacao}.md`;
  const tutorial: TutorialPlaywright = loadTutorial(tutorialPath);

  // Carregar dataset
  const datasetPath = tutorial.metadados.dataset_ref;
  const dataset: Dataset = loadYaml<Dataset>(datasetPath);

  // Carregar contexto (opcional)
  let contexto: Contexto | undefined;
  if (args.ciclo_id) {
    contexto = loadContexto(args.ciclo_id);
  } else if (dataset.contexto_ref) {
    const cid = dataset.contexto_ref.split("/").find((p) => /^\d/.test(p));
    if (cid) {
      try {
        contexto = loadContexto(cid);
        args.ciclo_id = cid;
      } catch (e) {
        console.warn(`[runner] Contexto nao carregado: ${e}`);
      }
    }
  }

  const baseUrl = args.base_url ?? tutorial.metadados.base_url ?? "http://localhost:5180";
  const ambiente = tutorial.metadados.ambiente ?? "agenteditais";
  const cicloId = args.ciclo_id ?? "sem-ciclo";

  // Criar diretório de evidências
  const iniciado_em = new Date().toISOString();
  const tsSafe = iniciado_em.replace(/[:.]/g, "-");
  const evidDir = path.resolve(
    PROJECT_ROOT,
    `testes/relatorios/automatico/${args.uc_id}/${tsSafe}`,
  );
  fs.mkdirSync(evidDir, { recursive: true });
  console.log(`[runner] Evidências: ${evidDir}`);

  // Setup browser
  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    baseURL: baseUrl,
    viewport: { width: 1400, height: 900 },
  });
  const page: Page = await context.newPage();
  const netInterceptor = setupNetworkInterceptor(page);

  const t0 = Date.now();
  const passosResultado: ResultadoPasso[] = [];
  let custoTokens = 0;
  let chamadasJuiz = 0;
  let chamadasVoto = 0;

  // Login. helperLogin atual usa valida1/123456 fixo — futuro: usar email do contexto
  // do ciclo (trilhas.e2e.usuario.email/senha) quando Fase 0 estiver implementada.
  try {
    if (contexto?.trilhas?.e2e?.usuario?.email) {
      console.log(`[runner] Login com ${contexto.trilhas.e2e.usuario.email} (do contexto)`);
      // helpers.login() ainda usa credenciais fixas — TODO: parametrizar.
      await helperLogin(page);
    } else {
      console.log(`[runner] Login com credencial padrao do helpers (sem contexto)`);
      await helperLogin(page);
    }
  } catch (e) {
    console.error(`[runner] Login falhou: ${e}`);
    await browser.close();
    return 3;
  }

  for (const passo of tutorial.passos) {
    const passoT0 = Date.now();
    let validacao: PassoCasoTeste | null = null;

    if (passo.validacao_ref) {
      try {
        validacao = loadValidationFromRef(passo.validacao_ref);
      } catch (e) {
        console.error(`[runner] Erro ao carregar validacao_ref para ${passo.id}: ${e}`);
      }
    }

    netInterceptor.clear();

    // Pre-passo: screenshot before
    const beforePath = path.join(evidDir, `before_${passo.id}.png`);
    try {
      await page.screenshot({ path: beforePath, fullPage: false });
    } catch (e) {
      console.warn(`[runner] Falha screenshot before: ${e}`);
    }

    // Executar ação
    let acaoErro: string | null = null;
    try {
      await executarAcao(page, passo.acao, dataset, contexto, args.trilha);
    } catch (e: any) {
      acaoErro = String(e?.message ?? e);
    }
    await page.waitForTimeout(500); // settle network

    // Screenshot after
    const afterPath = path.join(evidDir, `after_${passo.id}.png`);
    try {
      await page.screenshot({ path: afterPath, fullPage: false });
    } catch (e) {
      console.warn(`[runner] Falha screenshot after: ${e}`);
    }

    // Capturar a11y + rede
    const a11y = await captureA11yTree(page);
    const a11yPath = path.join(evidDir, `a11y_${passo.id}.json`);
    fs.writeFileSync(a11yPath, JSON.stringify(a11y, null, 2));
    const netLogs = netInterceptor.getLogs();
    const redePath = path.join(evidDir, `rede_${passo.id}.json`);
    fs.writeFileSync(redePath, JSON.stringify(netLogs, null, 2));

    // === Camadas de validação ===
    const result: ResultadoPasso = {
      passo_id: passo.id,
      veredito: "INCONCLUSIVO",
      duracao_ms: 0,
      camada_decisiva: "skipped",
      screenshot_before: beforePath,
      screenshot_after: afterPath,
      a11y_tree_path: a11yPath,
      rede_log_path: redePath,
    };

    if (acaoErro) {
      result.veredito = "REPROVADO";
      result.camada_decisiva = "DOM";
      result.detalhe_dom = { ok: false, mensagem: `Acao falhou: ${acaoErro}` };
      passosResultado.push({ ...result, duracao_ms: Date.now() - passoT0 });
      console.log(`[runner] [${passo.id}] REPROVADO (acao falhou): ${acaoErro}`);
      // Continue para próximos passos? Ou parar? Por ora, parar.
      break;
    }

    if (!validacao) {
      result.veredito = "INCONCLUSIVO";
      result.camada_decisiva = "skipped";
      passosResultado.push({ ...result, duracao_ms: Date.now() - passoT0 });
      console.log(`[runner] [${passo.id}] INCONCLUSIVO (sem caso de teste)`);
      continue;
    }

    // Camada 1: DOM
    const domR = await validarDOM(page, validacao);
    result.detalhe_dom = domR;
    if (!domR.ok) {
      result.veredito = "REPROVADO";
      result.camada_decisiva = "DOM";
      passosResultado.push({ ...result, duracao_ms: Date.now() - passoT0 });
      console.log(`[runner] [${passo.id}] REPROVADO (DOM): ${domR.mensagem}`);
      break;
    }

    // Camada 2: Rede
    const redeR = validarRede(netLogs, validacao);
    result.detalhe_rede = redeR;
    if (!redeR.ok) {
      result.veredito = "REPROVADO";
      result.camada_decisiva = "Rede";
      passosResultado.push({ ...result, duracao_ms: Date.now() - passoT0 });
      console.log(`[runner] [${passo.id}] REPROVADO (Rede): ${redeR.mensagem}`);
      break;
    }

    // Camada 3: Semântica (só se tem asserts)
    if (validacao.asserts_semantica && process.env.ANTHROPIC_API_KEY) {
      try {
        const judgeRes = await julgarSemantico({
          passo_id: passo.id,
          screenshot_path: afterPath,
          a11y_tree: a11y,
          url_atual: page.url(),
          status_ultima_request: netLogs[netLogs.length - 1]?.status,
          asserts: validacao.asserts_semantica,
          acao_descricao: passo.descricao ?? acaoString(passo.acao),
        });
        chamadasJuiz += judgeRes.rodadas.length;
        custoTokens += judgeRes.rodadas.length * 1500; // estimativa grossa
        if (judgeRes.voto_majoritario_aplicado) chamadasVoto++;
        result.detalhe_semantica = judgeRes.final;
        result.voto_majoritario_aplicado = judgeRes.voto_majoritario_aplicado;
        result.rodadas_juiz = judgeRes.rodadas;
        result.veredito = judgeRes.final.veredito;
        result.camada_decisiva = "Semantica";
      } catch (e: any) {
        console.error(`[runner] Erro juiz semantico: ${e?.message ?? e}`);
        result.detalhe_semantica = null;
        result.veredito = "INCONCLUSIVO";
        result.camada_decisiva = "skipped";
      }
    } else {
      // Sem asserts semânticas: APROVADO baseado em DOM+Rede
      result.veredito = "APROVADO";
      result.camada_decisiva = "Rede";
    }

    result.duracao_ms = Date.now() - passoT0;
    passosResultado.push(result);
    console.log(`[runner] [${passo.id}] ${result.veredito} (${result.camada_decisiva}, ${(result.duracao_ms / 1000).toFixed(1)}s)`);
  }

  await browser.close();

  // Veredito final
  const reprovados = passosResultado.filter((p) => p.veredito === "REPROVADO").length;
  const inconclusivos = passosResultado.filter((p) => p.veredito === "INCONCLUSIVO").length;
  const veredito_final: ResultadoExecucao["veredito_final"] = reprovados > 0
    ? "REPROVADO"
    : inconclusivos > 0
      ? "INCONCLUSIVO"
      : "APROVADO";

  const resultado: ResultadoExecucao = {
    uc_id: args.uc_id,
    variacao: args.variacao,
    trilha: args.trilha,
    ciclo_id: cicloId,
    ambiente,
    iniciado_em,
    duracao_total_ms: Date.now() - t0,
    veredito_final,
    passos: passosResultado,
    artefatos_usados: {
      dataset_path: tutorial.metadados.dataset_ref,
      caso_de_teste_path: tutorial.metadados.caso_de_teste_ref,
      tutorial_path: tutorialPath,
    },
    custo: {
      tokens_camada_semantica: custoTokens,
      chamadas_juiz: chamadasJuiz,
      chamadas_voto_majoritario: chamadasVoto,
    },
  };

  const relPath = salvarRelatorio(resultado);
  console.log(`\n[runner] ========================================`);
  console.log(`[runner] VEREDITO FINAL: ${veredito_final}`);
  console.log(`[runner] Relatório: ${relPath}`);
  console.log(`[runner] Duração: ${(resultado.duracao_total_ms / 1000).toFixed(1)}s`);
  console.log(`[runner] Tokens camada semântica: ${custoTokens}`);
  return veredito_final === "APROVADO" ? 0 : 1;
}

// ============================================================
// Helpers de execução
// ============================================================

function acaoString(a: AcaoTutorial): string {
  if (a.tipo === "fill") return `fill ${a.seletor}`;
  if (a.tipo === "click") return `click ${a.seletor ?? a.destino ?? ""}`;
  if (a.tipo === "navegacao" || a.tipo === "navigate") return `navegar para ${a.destino ?? a.url ?? ""}`;
  return `${a.tipo} ${a.seletor ?? ""}`;
}

async function executarAcao(
  page: Page,
  acao: AcaoTutorial,
  dataset: Dataset,
  contexto: Contexto | undefined,
  trilha: "e2e" | "visual" | "humano",
): Promise<void> {
  // Sequência aninhada
  if (acao.sequencia && Array.isArray(acao.sequencia)) {
    for (const sub of acao.sequencia) {
      await executarAcao(page, sub, dataset, contexto, trilha);
    }
    return;
  }

  switch (acao.tipo) {
    case "navigate":
    case "navegacao":
    case "goto": {
      const url = acao.url ?? acao.destino ?? "/";
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      break;
    }
    case "click": {
      const sel = acao.seletor ?? acao.alternativa;
      if (!sel) throw new Error("click sem seletor");
      await page.click(sel, { timeout: acao.timeout ?? 10000 });
      break;
    }
    case "fill": {
      const sel = acao.seletor;
      if (!sel) throw new Error("fill sem seletor");
      const valor = resolveValor(acao, dataset, contexto, trilha);
      if (valor === undefined) throw new Error("fill sem valor");
      await page.fill(sel, valor, { timeout: acao.timeout ?? 10000 });
      break;
    }
    case "wait_for": {
      const sel = acao.seletor;
      if (!sel) throw new Error("wait_for sem seletor");
      await page.waitForSelector(sel, { timeout: acao.timeout ?? 10000 });
      break;
    }
    default:
      throw new Error(`Tipo de ação não suportado: ${acao.tipo}`);
  }
}

async function validarDOM(page: Page, validacao: PassoCasoTeste): Promise<{ ok: boolean; mensagem?: string }> {
  if (!validacao.asserts_dom || validacao.asserts_dom.length === 0) {
    return { ok: true, mensagem: "sem asserts DOM" };
  }
  for (const a of validacao.asserts_dom) {
    if (a.selector) {
      const loc = page.locator(a.selector).first();
      const count = await loc.count();
      if (count === 0 && (a.visible !== false)) {
        return { ok: false, mensagem: `Selector nao encontrado: ${a.selector}` };
      }
      if (a.texto_contem) {
        const txt = (await loc.textContent()) ?? "";
        if (!txt.toLowerCase().includes(a.texto_contem.toLowerCase())) {
          return { ok: false, mensagem: `Texto esperado "${a.texto_contem}" nao em ${a.selector}` };
        }
      }
      if (a.attribute && a.equals) {
        const v = await loc.getAttribute(a.attribute);
        if (v !== a.equals) {
          return { ok: false, mensagem: `${a.selector}.${a.attribute}=${v}, esperado ${a.equals}` };
        }
      }
      if (a.valor_contem) {
        const v = (await loc.inputValue().catch(() => "")) ?? "";
        if (!v.includes(a.valor_contem)) {
          return { ok: false, mensagem: `Valor "${v}" nao contem "${a.valor_contem}"` };
        }
      }
    }
  }
  return { ok: true };
}

function validarRede(logs: any[], validacao: PassoCasoTeste): { ok: boolean; mensagem?: string; payloads?: any[] } {
  if (!validacao.asserts_rede || validacao.asserts_rede.length === 0) {
    return { ok: true, mensagem: "sem asserts Rede" };
  }
  for (const a of validacao.asserts_rede) {
    const candidatos = logs.filter((l) => {
      if (a.url_contem && !l.url.includes(a.url_contem)) return false;
      if (a.metodo && l.method.toUpperCase() !== a.metodo.toUpperCase()) return false;
      return true;
    });
    if (candidatos.length === 0) {
      return { ok: false, mensagem: `Nenhuma request match: ${a.metodo} ${a.url_contem}` };
    }
    const last = candidatos[candidatos.length - 1];
    const expectedStatus = a.status ?? a.status_esperado;
    if (expectedStatus !== undefined && last.status !== expectedStatus) {
      return {
        ok: false,
        mensagem: `Status ${last.status}, esperado ${expectedStatus} em ${a.metodo} ${a.url_contem}`,
        payloads: candidatos,
      };
    }
  }
  return { ok: true, payloads: logs };
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error("[runner] FATAL:", e);
  process.exit(2);
});
