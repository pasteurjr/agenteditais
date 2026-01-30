import type { Session, ChatResponse, Message } from "../types";

const API_BASE = "http://localhost:5007";

// Token getter function - will be set by AuthContext
let getAccessTokenFn: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  getAccessTokenFn = fn;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (getAccessTokenFn) {
    const token = await getAccessTokenFn();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

// =============================================================================
// Ações
// =============================================================================

export interface Acao {
  id: string;
  nome: string;
  descricao: string;
}

export async function getAcoes(): Promise<Acao[]> {
  const res = await fetch(`${API_BASE}/api/acoes`);
  if (!res.ok) throw new Error("Erro ao buscar ações");
  const data = await res.json();
  return data.acoes;
}

// =============================================================================
// Sessions
// =============================================================================

export async function fetchSessions(): Promise<Session[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/sessions`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao buscar sessões");
  const data = await res.json();
  return data.sessions;
}

export async function createSession(name?: string): Promise<Session> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao criar sessão");
  return res.json();
}

export async function getSessionMessages(
  sessionId: string
): Promise<{ session_id: string; name: string; messages: Message[] }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao buscar mensagens");
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: "DELETE",
    headers,
  });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao excluir sessão");
}

export async function renameSession(
  sessionId: string,
  name: string
): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ name }),
  });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao renomear sessão");
}

// =============================================================================
// Chat
// =============================================================================

export interface SendMessageResponse extends ChatResponse {
  session_name?: string;
  action_type?: string;
  resultado?: Record<string, unknown>;
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<SendMessageResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      session_id: sessionId,
      message
    }),
  });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao enviar mensagem");
  }
  return res.json();
}

// =============================================================================
// Upload
// =============================================================================

export interface UploadResultado {
  success: boolean;
  produto_id?: string;
  nome?: string;
  specs_extraidas?: number;
  specs?: Record<string, unknown>[];
  error?: string;
}

export async function uploadManual(
  file: File,
  nomeProduto: string,
  categoria: string,
  fabricante?: string,
  modelo?: string
): Promise<UploadResultado> {
  const token = getAccessTokenFn ? await getAccessTokenFn() : null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("nome_produto", nomeProduto);
  formData.append("categoria", categoria);
  if (fabricante) formData.append("fabricante", fabricante);
  if (modelo) formData.append("modelo", modelo);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  if (res.status === 401) throw new Error("Não autenticado");
  return res.json();
}

// =============================================================================
// Produtos
// =============================================================================

export interface Produto {
  id: string;
  nome: string;
  codigo_interno?: string;
  ncm?: string;
  categoria: string;
  fabricante?: string;
  modelo?: string;
  descricao?: string;
  preco_referencia?: number;
  created_at: string;
  especificacoes?: ProdutoEspecificacao[];
}

export interface ProdutoEspecificacao {
  id: string;
  nome_especificacao: string;
  valor: string;
  unidade?: string;
  valor_numerico?: number;
  operador?: string;
}

export async function getProdutos(categoria?: string, nome?: string): Promise<Produto[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (categoria) params.append("categoria", categoria);
  if (nome) params.append("nome", nome);

  const res = await fetch(`${API_BASE}/api/produtos?${params}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao buscar produtos");
  const data = await res.json();
  return data.produtos;
}

export async function getProduto(produtoId: string): Promise<Produto> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/produtos/${produtoId}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

// =============================================================================
// Editais
// =============================================================================

export interface Edital {
  id: string;
  numero: string;
  orgao: string;
  orgao_tipo: string;
  uf?: string;
  cidade?: string;
  objeto: string;
  modalidade: string;
  categoria?: string;
  valor_referencia?: number;
  data_publicacao?: string;
  data_abertura?: string;
  status: string;
  fonte?: string;
  url?: string;
  created_at: string;
  requisitos?: EditalRequisito[];
}

export interface EditalRequisito {
  id: string;
  tipo: string;
  descricao: string;
  nome_especificacao?: string;
  valor_exigido?: string;
  operador?: string;
  obrigatorio: boolean;
}

export async function getEditais(
  status?: string,
  uf?: string,
  categoria?: string
): Promise<Edital[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (uf) params.append("uf", uf);
  if (categoria) params.append("categoria", categoria);

  const res = await fetch(`${API_BASE}/api/editais?${params}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao buscar editais");
  const data = await res.json();
  return data.editais;
}

export async function getEdital(editalId: string): Promise<Edital> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/editais/${editalId}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Edital não encontrado");
  return res.json();
}

// =============================================================================
// Fontes
// =============================================================================

export interface FonteEdital {
  id: string;
  nome: string;
  tipo: string;
  url_base?: string;
  ativo: boolean;
  descricao?: string;
}

export async function getFontes(): Promise<FonteEdital[]> {
  const res = await fetch(`${API_BASE}/api/fontes`);
  if (!res.ok) throw new Error("Erro ao buscar fontes");
  const data = await res.json();
  return data.fontes;
}

// =============================================================================
// Análises
// =============================================================================

export interface Analise {
  id: string;
  edital_id: string;
  produto_id: string;
  score_tecnico?: number;
  score_comercial?: number;
  score_potencial?: number;
  score_final?: number;
  requisitos_total: number;
  requisitos_atendidos: number;
  requisitos_parciais: number;
  requisitos_nao_atendidos: number;
  preco_sugerido?: number;
  recomendacao?: string;
  created_at: string;
  detalhes?: AnaliseDetalhe[];
}

export interface AnaliseDetalhe {
  id: string;
  requisito_id: string;
  especificacao_id?: string;
  status: string;
  valor_exigido?: string;
  valor_produto?: string;
  justificativa?: string;
}

export async function getAnalises(): Promise<Analise[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/analises`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao buscar análises");
  const data = await res.json();
  return data.analises;
}

export async function getAnalise(analiseId: string): Promise<Analise> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/analises/${analiseId}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Análise não encontrada");
  return res.json();
}

// =============================================================================
// Propostas
// =============================================================================

export interface Proposta {
  id: string;
  edital_id: string;
  produto_id: string;
  analise_id?: string;
  texto_tecnico?: string;
  preco_unitario?: number;
  preco_total?: number;
  quantidade: number;
  status: string;
  arquivo_path?: string;
  created_at: string;
}

export async function getPropostas(): Promise<Proposta[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/propostas`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Erro ao buscar propostas");
  const data = await res.json();
  return data.propostas;
}

export async function getProposta(propostaId: string): Promise<Proposta> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/propostas/${propostaId}`, { headers });
  if (res.status === 401) throw new Error("Não autenticado");
  if (!res.ok) throw new Error("Proposta não encontrada");
  return res.json();
}
