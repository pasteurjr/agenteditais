/**
 * Carrega e resolve referências entre os 3 artefatos do processo V3:
 *  - dataset (testes/datasets/<uc>_<trilha>.yaml)
 *  - caso de teste (testes/casos_de_teste/<uc>_<trilha>_<variacao>.{yaml,md})
 *  - tutorial (testes/tutoriais_playwright/<uc>_<variacao>.md)
 *
 * Resolve placeholders:
 *  - `valor_from_dataset: chave.aninhada` → consulta dataset
 *  - `valor_from_contexto: chave.aninhada` → consulta contexto.yaml
 *  - `validacao_ref: <path>#<step_id>` → carrega bloco específico do caso de teste
 *
 * Não conhece nada sobre Playwright, Anthropic, banco — só YAML/MD parsing.
 */
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

export interface Dataset {
  caso_uso: string;
  trilha: "e2e" | "visual" | "humano";
  contexto_ref?: string;
  valores: Record<string, any>;
  valores_fp?: Record<string, any>;
  [key: string]: any;
}

export interface CasoTeste {
  caso_teste_id: string;
  uc_id: string;
  trilha: "e2e" | "visual" | "humano";
  variacao: string;
  dataset_ref?: string;
  contexto_ref?: string;
  precondicoes?: any[];
  passos: PassoCasoTeste[];
  validacao_backend?: any;
  limpeza_pos_execucao?: string[];
  [key: string]: any;
}

export interface PassoCasoTeste {
  id: string;
  descricao?: string;
  usa_dados?: string;
  acao_esperada?: any;
  asserts_dom?: AssertDOM[];
  asserts_rede?: AssertRede[];
  asserts_semantica?: AssertSemantica;
  [key: string]: any;
}

export interface AssertDOM {
  selector?: string;
  texto_contem?: string;
  attribute?: string;
  equals?: string;
  visible?: boolean;
  lista_contem?: string[];
  valor_contem?: string;
}

export interface AssertRede {
  metodo?: string;
  url_contem?: string;
  status?: number;
  status_esperado?: number;
  payload_contem?: Record<string, any>;
  response_contem?: Record<string, any>;
  timeout_ms?: number;
}

export interface AssertSemantica {
  descricao_ancorada: string;
  elementos_obrigatorios: string[];
  elementos_proibidos: string[];
}

export interface TutorialPlaywright {
  metadados: {
    uc_id: string;
    variacao: string;
    trilha: string;
    caso_de_teste_ref: string;
    dataset_ref: string;
    ambiente?: string;
    base_url?: string;
    [key: string]: any;
  };
  passos: PassoTutorial[];
  setup?: any;
  limpeza_sql?: string;
}

export interface PassoTutorial {
  id: string;
  acao: AcaoTutorial;
  validacao_ref?: string; // formato: "casos_de_teste/UC-XX_e2e_fp.yaml#passo_03"
  descricao?: string;
}

export interface AcaoTutorial {
  tipo: "click" | "fill" | "wait_for" | "navegacao" | "navigate" | string;
  seletor?: string;
  alternativa?: string;
  valor_from_dataset?: string;
  valor_from_contexto?: string;
  valor_literal?: string;
  destino?: string;
  url?: string;
  timeout?: number;
  sequencia?: AcaoTutorial[];
}

export interface Contexto {
  ciclo_id: string;
  ambiente: "agenteditais" | "editaisvalida";
  trilhas: {
    [key in "e2e" | "visual" | "humano"]?: {
      usuario: { email: string; senha: string; id?: string };
      empresa: { cnpj: string; razao_social_pretendida: string; id: string | null };
      editais_selecionados?: any[];
      documentos_renderizados?: Record<string, string>;
    };
  };
}

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

/** Carrega YAML de um path relativo à raiz do projeto. */
export function loadYaml<T = any>(relPath: string): T {
  const abs = path.resolve(PROJECT_ROOT, relPath);
  const text = fs.readFileSync(abs, "utf-8");
  return yaml.load(text) as T;
}

/** Carrega tutorial Playwright (.md com frontmatter YAML + blocos YAML por passo). */
export function loadTutorial(relPath: string): TutorialPlaywright {
  const abs = path.resolve(PROJECT_ROOT, relPath);
  const text = fs.readFileSync(abs, "utf-8");

  // Frontmatter (suporta \n e \r\n)
  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    throw new Error(`Tutorial sem frontmatter: ${relPath}`);
  }
  const metadados = yaml.load(fmMatch[1]) as TutorialPlaywright["metadados"];
  if (!metadados || typeof metadados !== "object") {
    throw new Error(`Frontmatter de ${relPath} nao parseou como objeto`);
  }

  // Blocos YAML após o frontmatter
  const corpo = text.slice(fmMatch[0].length);
  const passosRegex = /```yaml\s*\n([\s\S]*?)\n```/g;
  const passos: PassoTutorial[] = [];
  let m: RegExpExecArray | null;
  while ((m = passosRegex.exec(corpo)) !== null) {
    try {
      const passo = yaml.load(m[1]) as PassoTutorial;
      if (passo && typeof passo === "object" && "id" in passo) {
        passos.push(passo);
      }
    } catch (e) {
      console.error(`Bloco YAML inválido em ${relPath}: ${e}`);
    }
  }

  // Limpeza SQL — bloco ```sql após "## Limpeza"
  let limpeza_sql: string | undefined;
  const limpezaMatch = corpo.match(/##\s*Limpeza[\s\S]*?```sql\s*\n([\s\S]*?)\n```/);
  if (limpezaMatch) {
    limpeza_sql = limpezaMatch[1].trim();
  }

  return { metadados, passos, limpeza_sql };
}

/** Acessa chave aninhada em objeto: get(obj, "a.b.c"). Retorna undefined em qualquer falha. */
export function getNested(obj: any, key: string): any {
  return key.split(".").reduce((acc, part) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return acc[part];
  }, obj);
}

/** Resolve `valor_from_dataset: chave.aninhada` consultando o dataset. */
export function resolveValor(
  acao: AcaoTutorial,
  dataset: Dataset,
  contexto?: Contexto,
  trilha?: "e2e" | "visual" | "humano",
): string | undefined {
  if (acao.valor_literal !== undefined) {
    return String(acao.valor_literal);
  }
  if (acao.valor_from_dataset !== undefined) {
    // Tenta valores_fp primeiro, depois valores
    const fp = dataset.valores_fp ?? {};
    const vals = dataset.valores ?? {};
    const fromFp = getNested(fp, acao.valor_from_dataset);
    if (fromFp !== undefined) return String(fromFp);
    const fromVals = getNested(vals, acao.valor_from_dataset);
    if (fromVals !== undefined) return String(fromVals);
    // Tenta no nível raiz
    const fromRoot = getNested(dataset, acao.valor_from_dataset);
    if (fromRoot !== undefined) return String(fromRoot);
    throw new Error(`Chave não encontrada no dataset: ${acao.valor_from_dataset}`);
  }
  if (acao.valor_from_contexto !== undefined && contexto && trilha) {
    const trilhaCtx = contexto.trilhas[trilha];
    if (!trilhaCtx) {
      throw new Error(`Trilha ${trilha} não existe no contexto`);
    }
    const v = getNested(trilhaCtx, acao.valor_from_contexto);
    if (v === undefined) {
      throw new Error(`Chave não encontrada no contexto: ${acao.valor_from_contexto}`);
    }
    return String(v);
  }
  return undefined;
}

/**
 * Resolve `validacao_ref: casos_de_teste/UC-XX_e2e_fp.yaml#passo_03`
 * Retorna o passo do caso de teste correspondente.
 */
export function loadValidationFromRef(refStr: string): PassoCasoTeste {
  const [arquivoRel, stepId] = refStr.split("#");
  if (!arquivoRel || !stepId) {
    throw new Error(`validacao_ref malformado: ${refStr}. Esperado: <path>#<step_id>`);
  }
  const fullPath = arquivoRel.startsWith("testes/") ? arquivoRel : `testes/${arquivoRel}`;
  const caso = loadYaml<CasoTeste>(fullPath);
  const passo = caso.passos.find((p) => p.id === stepId);
  if (!passo) {
    throw new Error(`Passo ${stepId} não encontrado em ${arquivoRel}`);
  }
  return passo;
}

/** Carrega contexto do ciclo. */
export function loadContexto(cicloId: string): Contexto {
  return loadYaml<Contexto>(`testes/contextos/${cicloId}/contexto.yaml`);
}
