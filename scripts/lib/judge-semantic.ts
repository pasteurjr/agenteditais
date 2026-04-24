/**
 * Juiz semântico — Camada 3 da validação automática.
 *
 * Recebe screenshot + a11y tree + descrição ancorada + obrigatórios + proibidos,
 * chama Anthropic SDK, retorna JSON rígido com veredito.
 *
 * Aplica voto majoritário se confiança < 0.85 (chama 2 vezes adicionais).
 *
 * Segue as injunções fortes da seção 7 de `docs/VALIDACAOFACILICITA.md`.
 */
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import { AssertSemantica } from "./artifact-loader";

const MODEL = "claude-opus-4-7";
const MAX_TOKENS = 4096;
const CONFIANCA_MINIMA = 0.85;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY nao configurada. Configure em .env ou via env var.",
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export interface InputJuizSemantico {
  passo_id: string;
  screenshot_path: string;
  a11y_tree?: string | object; // JSON da árvore de acessibilidade
  url_atual: string;
  status_ultima_request?: number;
  asserts: AssertSemantica;
  /** Descricao curta da acao executada — pra checar coerencia */
  acao_descricao?: string;
}

export interface VeredictoJuiz {
  veredito: "APROVADO" | "REPROVADO" | "INCONCLUSIVO";
  confianca: number;
  inventario_tela: {
    elementos_interativos: any[];
    textos_visiveis: string[];
    valores_preenchidos: Record<string, string>;
    estado_transitorio: boolean;
    url_observada?: string;
  };
  checklist_obrigatorios: Array<{
    esperado: string;
    encontrado: boolean;
    evidencia: string;
  }>;
  checklist_proibidos: Array<{
    proibido: string;
    encontrado: boolean;
    varreu_tela_inteira: boolean;
  }>;
  coerencia_com_acao: string;
  justificativa: string;
  discrepancias_observadas: string[];
}

const SYSTEM_PROMPT = `Você é o juiz semântico do processo de validação V3 do Facilicita.IA.

Sua mentalidade é adversarial. Você NÃO escreveu o caso de teste — você é um 3º olho independente. Seu trabalho é achar furo.

REGRAS INVIOLÁVEIS:
1. Na dúvida, REPROVE. Falso positivo (aprovou com bug) custa mais caro que falso negativo em sistema com consequência jurídica.
2. Se algum obrigatório está AUSENTE → REPROVADO. Sem exceção.
3. Se algum proibido está PRESENTE → REPROVADO. Mesmo que todos obrigatórios também estejam.
4. Tela em estado transitório (loading) → INCONCLUSIVO. Não adivinhe.
5. URL não bate com o esperado → REPROVADO.
6. Sempre preencha "confianca" com valor real (0.0 a 1.0).
7. Descrição ancorada ambígua → INCONCLUSIVO com justificativa explicando o que faltou.

VIESES A MITIGAR:
- Confirmação: você tende a achar o que foi pedido e ignorar o resto. Por isso, varra a tela INTEIRA buscando proibidos.
- Permissividade: você tende a justificar aprovação. Por isso, ao reprovar, seja específico.

Responda APENAS com JSON válido. Nenhuma prosa fora.`;

const PROMPT_TEMPLATE = (input: InputJuizSemantico) => `Analise a tela capturada contra a descrição esperada.

URL ATUAL: ${input.url_atual}
${input.acao_descricao ? `AÇÃO EXECUTADA: ${input.acao_descricao}` : ""}
${input.status_ultima_request ? `STATUS HTTP DA ÚLTIMA REQUEST: ${input.status_ultima_request}` : ""}

DESCRIÇÃO ESPERADA:
${input.asserts.descricao_ancorada}

ELEMENTOS OBRIGATÓRIOS (devem estar presentes):
${input.asserts.elementos_obrigatorios.map((e, i) => `  ${i + 1}. ${e}`).join("\n")}

ELEMENTOS PROIBIDOS (NÃO podem estar presentes):
${input.asserts.elementos_proibidos.map((e, i) => `  ${i + 1}. ${e}`).join("\n")}

${input.a11y_tree ? `ÁRVORE DE ACESSIBILIDADE:\n${typeof input.a11y_tree === "string" ? input.a11y_tree : JSON.stringify(input.a11y_tree, null, 2).slice(0, 5000)}` : ""}

Execute mentalmente o checklist (Passos A-E) e responda APENAS em JSON com este schema:

{
  "veredito": "APROVADO | REPROVADO | INCONCLUSIVO",
  "confianca": 0.0,
  "inventario_tela": {
    "elementos_interativos": [...],
    "textos_visiveis": [...],
    "valores_preenchidos": {"campo1": "valor1"},
    "estado_transitorio": false,
    "url_observada": "..."
  },
  "checklist_obrigatorios": [
    {"esperado": "...", "encontrado": true, "evidencia": "..."}
  ],
  "checklist_proibidos": [
    {"proibido": "...", "encontrado": false, "varreu_tela_inteira": true}
  ],
  "coerencia_com_acao": "...",
  "justificativa": "...",
  "discrepancias_observadas": []
}

Retorne SÓ o JSON. Nenhum markdown. Nenhum "Aqui está".`;

/** Faz UMA chamada ao juiz semântico. */
async function chamarJuizUmaVez(input: InputJuizSemantico): Promise<VeredictoJuiz> {
  const client = getClient();

  // Carregar screenshot como base64
  if (!fs.existsSync(input.screenshot_path)) {
    throw new Error(`Screenshot nao encontrada: ${input.screenshot_path}`);
  }
  const imgBuffer = fs.readFileSync(input.screenshot_path);
  const imgBase64 = imgBuffer.toString("base64");
  const mediaType: "image/png" | "image/jpeg" = input.screenshot_path
    .toLowerCase()
    .endsWith(".png")
    ? "image/png"
    : "image/jpeg";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imgBase64 },
          },
          { type: "text", text: PROMPT_TEMPLATE(input) },
        ],
      },
    ],
  });

  // Extrair texto da resposta
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta do juiz sem bloco de texto.");
  }
  let raw = textBlock.text.trim();

  // Resiliência (3 estratégias em cascata):
  // 1. ```json ... ``` (markdown code block)
  // 2. Primeiro bloco { ... } via balanceamento de chaves
  // 3. Bruto
  const jsonBlockMatch = raw.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (jsonBlockMatch) raw = jsonBlockMatch[1].trim();

  // Se ainda começa com prosa antes de '{', extrair primeiro objeto
  if (!raw.startsWith("{")) {
    const firstBrace = raw.indexOf("{");
    if (firstBrace >= 0) {
      const lastBrace = raw.lastIndexOf("}");
      if (lastBrace > firstBrace) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }
    }
  }

  try {
    const parsed = JSON.parse(raw) as VeredictoJuiz;
    // Sanity check — campos obrigatórios
    if (!parsed.veredito || typeof parsed.confianca !== "number") {
      throw new Error("JSON parseado mas faltam campos obrigatorios (veredito ou confianca)");
    }
    if (!["APROVADO", "REPROVADO", "INCONCLUSIVO"].includes(parsed.veredito)) {
      throw new Error(`veredito invalido: ${parsed.veredito}`);
    }
    return parsed;
  } catch (e) {
    throw new Error(`Resposta nao e JSON valido: ${raw.slice(0, 300)}\n\nErro: ${e}`);
  }
}

/**
 * Chama o juiz semântico com voto majoritário se confiança < 0.85.
 * Retorna o veredicto final + lista de vereditos individuais para auditoria.
 */
export async function julgarSemantico(input: InputJuizSemantico): Promise<{
  final: VeredictoJuiz;
  rodadas: VeredictoJuiz[];
  voto_majoritario_aplicado: boolean;
}> {
  const primeiro = await chamarJuizUmaVez(input);

  if (primeiro.confianca >= CONFIANCA_MINIMA) {
    return { final: primeiro, rodadas: [primeiro], voto_majoritario_aplicado: false };
  }

  // Voto majoritário: chama 2x mais
  const segundo = await chamarJuizUmaVez(input);
  const terceiro = await chamarJuizUmaVez(input);
  const rodadas = [primeiro, segundo, terceiro];

  const contagem: Record<string, number> = {};
  for (const r of rodadas) {
    contagem[r.veredito] = (contagem[r.veredito] || 0) + 1;
  }

  // Veredito vencedor (modo). Se empate (1-1-1), retorna INCONCLUSIVO.
  let vencedor: VeredictoJuiz["veredito"] = "INCONCLUSIVO";
  let max = 0;
  for (const [v, c] of Object.entries(contagem)) {
    if (c > max) {
      max = c;
      vencedor = v as VeredictoJuiz["veredito"];
    }
  }
  // Empate 1-1-1 (3 vereditos diferentes) ou max<2 → INCONCLUSIVO
  if (max < 2) {
    vencedor = "INCONCLUSIVO";
  }

  // Final: pega a primeira rodada que bateu com vencedor.
  // Se for INCONCLUSIVO mas nenhuma rodada veio INCONCLUSIVO, sintetiza um veredicto
  // explicito sinalizando o desacordo, em vez de retornar uma rodada que contradiz.
  let final = rodadas.find((r) => r.veredito === vencedor);
  if (!final) {
    final = {
      ...primeiro,
      veredito: "INCONCLUSIVO",
      confianca: Math.min(...rodadas.map((r) => r.confianca)),
      justificativa:
        `Voto majoritario nao convergiu: ${rodadas.map((r) => r.veredito).join(" / ")}. ` +
        `Refinar descricao_ancorada do caso de teste — esta ambigua.`,
      discrepancias_observadas: [
        ...primeiro.discrepancias_observadas,
        `juiz_flutuante: 3 rodadas com vereditos diferentes`,
      ],
    };
  }

  return { final, rodadas, voto_majoritario_aplicado: true };
}
