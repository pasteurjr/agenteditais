/**
 * Gera o relatório markdown do processo V3 (trilha automática E2E).
 *
 * Formato espelha a Fase 5 do `validar-uc.md`:
 *  - Sumário executivo
 *  - Linha do tempo (passo × veredito × duração × camada decisiva)
 *  - Evidências por passo (links pra screenshots/payloads)
 *  - Discrepâncias priorizadas
 *  - Custo (tokens, duração)
 *  - Recomendações
 */
import * as fs from "fs";
import * as path from "path";
import { VeredictoJuiz } from "./judge-semantic";

export type CamadaDecisiva = "DOM" | "Rede" | "Semantica" | "Backend" | "skipped";

export interface ResultadoPasso {
  passo_id: string;
  veredito: "APROVADO" | "REPROVADO" | "INCONCLUSIVO";
  duracao_ms: number;
  camada_decisiva: CamadaDecisiva;
  detalhe_dom?: { ok: boolean; mensagem?: string };
  detalhe_rede?: { ok: boolean; mensagem?: string; payloads?: any[] };
  detalhe_semantica?: VeredictoJuiz | null;
  voto_majoritario_aplicado?: boolean;
  rodadas_juiz?: VeredictoJuiz[];
  screenshot_before?: string;
  screenshot_after?: string;
  a11y_tree_path?: string;
  rede_log_path?: string;
}

export interface ResultadoExecucao {
  uc_id: string;
  variacao: string;
  trilha: "e2e" | "visual" | "humano";
  ciclo_id: string;
  ambiente: string;
  iniciado_em: string;
  duracao_total_ms: number;
  veredito_final: "APROVADO" | "REPROVADO" | "INCONCLUSIVO";
  passos: ResultadoPasso[];
  artefatos_usados: {
    dataset_path: string;
    caso_de_teste_path: string;
    tutorial_path: string;
  };
  custo: {
    tokens_camada_semantica: number;
    chamadas_juiz: number;
    chamadas_voto_majoritario: number;
  };
}

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

export function gerarRelatorio(r: ResultadoExecucao): string {
  const aprovados = r.passos.filter((p) => p.veredito === "APROVADO").length;
  const reprovados = r.passos.filter((p) => p.veredito === "REPROVADO").length;
  const inconclusivos = r.passos.filter((p) => p.veredito === "INCONCLUSIVO").length;
  const taxaAprov = r.passos.length === 0 ? 0 : (aprovados / r.passos.length) * 100;

  const lines: string[] = [];
  lines.push(`# Relatório de Validação Automática — ${r.uc_id} (${r.variacao})`);
  lines.push("");
  lines.push("## Sumário executivo");
  lines.push("");
  lines.push(`- **Veredicto final:** ${badge(r.veredito_final)}`);
  lines.push(`- **Trilha:** ${r.trilha}`);
  lines.push(`- **Ambiente:** ${r.ambiente}`);
  lines.push(`- **Ciclo:** ${r.ciclo_id}`);
  lines.push(`- **Início:** ${r.iniciado_em}`);
  lines.push(`- **Duração total:** ${(r.duracao_total_ms / 1000).toFixed(1)}s`);
  lines.push(`- **Passos:** ${r.passos.length} (${aprovados} aprovados, ${reprovados} reprovados, ${inconclusivos} inconclusivos)`);
  lines.push(`- **Taxa aprovação:** ${taxaAprov.toFixed(0)}%`);
  lines.push(`- **Custo (camada semântica):** ${r.custo.chamadas_juiz} chamadas, ${r.custo.tokens_camada_semantica} tokens`);
  if (r.custo.chamadas_voto_majoritario > 0) {
    lines.push(`- **Voto majoritário aplicado:** ${r.custo.chamadas_voto_majoritario} passo(s)`);
  }
  lines.push("");

  lines.push("## Artefatos consumidos");
  lines.push("");
  lines.push(`- **Dataset:** \`${r.artefatos_usados.dataset_path}\``);
  lines.push(`- **Caso de teste:** \`${r.artefatos_usados.caso_de_teste_path}\``);
  lines.push(`- **Tutorial:** \`${r.artefatos_usados.tutorial_path}\``);
  lines.push("");

  lines.push("## Linha do tempo");
  lines.push("");
  lines.push("| # | Passo | Veredicto | Duração | Camada decisiva |");
  lines.push("|---|---|---|---|---|");
  for (const [i, p] of r.passos.entries()) {
    const dur = (p.duracao_ms / 1000).toFixed(1) + "s";
    lines.push(`| ${i + 1} | \`${p.passo_id}\` | ${badge(p.veredito)} | ${dur} | ${p.camada_decisiva} |`);
  }
  lines.push("");

  // Evidências por passo
  lines.push("## Evidências por passo");
  lines.push("");
  for (const p of r.passos) {
    lines.push(`### ${p.passo_id}`);
    lines.push("");
    lines.push(`- **Veredicto:** ${badge(p.veredito)} (camada ${p.camada_decisiva})`);
    if (p.screenshot_before) {
      lines.push(`- Screenshot ANTES: ![antes](${rel(p.screenshot_before)})`);
    }
    if (p.screenshot_after) {
      lines.push(`- Screenshot DEPOIS: ![depois](${rel(p.screenshot_after)})`);
    }
    if (p.detalhe_dom) {
      lines.push(`- **DOM:** ${p.detalhe_dom.ok ? "✓" : "✗"} ${p.detalhe_dom.mensagem ?? ""}`);
    }
    if (p.detalhe_rede) {
      lines.push(`- **Rede:** ${p.detalhe_rede.ok ? "✓" : "✗"} ${p.detalhe_rede.mensagem ?? ""}`);
      if (p.rede_log_path) {
        lines.push(`  - Payload completo: \`${rel(p.rede_log_path)}\``);
      }
    }
    if (p.detalhe_semantica) {
      const j = p.detalhe_semantica;
      lines.push(`- **Semântica:** ${badge(j.veredito)} (confiança ${(j.confianca * 100).toFixed(0)}%)`);
      lines.push(`  - Justificativa: ${j.justificativa}`);
      if (j.discrepancias_observadas?.length) {
        lines.push(`  - Discrepâncias: ${j.discrepancias_observadas.join("; ")}`);
      }
    }
    if (p.voto_majoritario_aplicado) {
      lines.push(`- **Voto majoritário aplicado** (${p.rodadas_juiz?.length ?? 3} rodadas)`);
    }
    lines.push("");
  }

  // Discrepâncias agregadas
  const discrepancias = r.passos.flatMap((p) =>
    (p.detalhe_semantica?.discrepancias_observadas ?? []).map((d) => `${p.passo_id}: ${d}`),
  );
  if (discrepancias.length > 0) {
    lines.push("## Discrepâncias detectadas");
    lines.push("");
    for (const d of discrepancias) {
      lines.push(`- ${d}`);
    }
    lines.push("");
  }

  // Recomendações
  lines.push("## Recomendações de manutenção");
  lines.push("");
  const baixaConf = r.passos.filter(
    (p) => p.detalhe_semantica && p.detalhe_semantica.confianca < 0.85,
  );
  if (baixaConf.length > 0) {
    lines.push(`- ${baixaConf.length} passo(s) com confiança < 85% no juiz semântico — refinar \`descricao_ancorada\`:`);
    for (const p of baixaConf) {
      lines.push(`  - \`${p.passo_id}\` (confiança ${(p.detalhe_semantica!.confianca * 100).toFixed(0)}%)`);
    }
  }
  const semSemantica = r.passos.filter((p) => p.camada_decisiva !== "Semantica" && p.veredito !== "REPROVADO");
  if (semSemantica.length === r.passos.length && r.passos.length > 0) {
    lines.push(
      "- Camada semântica nunca foi a decisiva — possível redundância. Avaliar se asserções DOM/Rede já garantem o suficiente e remover descrição ancorada nos passos triviais.",
    );
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(`*Relatório gerado pelo runner V3. Para reproduzir: \`npx ts-node scripts/run-validation.ts ${r.uc_id} ${r.variacao} ${r.trilha}\`*`);
  lines.push("");

  return lines.join("\n");
}

function badge(v: string): string {
  if (v === "APROVADO") return "✅ APROVADO";
  if (v === "REPROVADO") return "❌ REPROVADO";
  if (v === "INCONCLUSIVO") return "⚠️ INCONCLUSIVO";
  return v;
}

function rel(p: string): string {
  // Caminho relativo ao próprio relatório (que será gravado no diretório do UC)
  if (path.isAbsolute(p)) {
    return path.relative(PROJECT_ROOT, p);
  }
  return p;
}

/** Salva o relatório em `testes/relatorios/automatico/<uc>_<ts>.md`. */
export function salvarRelatorio(r: ResultadoExecucao): string {
  const ts = r.iniciado_em.replace(/[:.]/g, "-");
  const filename = `${r.uc_id}_${r.variacao}_${ts}.md`;
  const dir = path.resolve(PROJECT_ROOT, `testes/relatorios/${r.trilha === "e2e" ? "automatico" : r.trilha}`);
  fs.mkdirSync(dir, { recursive: true });
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, gerarRelatorio(r), "utf-8");
  return fullPath;
}
