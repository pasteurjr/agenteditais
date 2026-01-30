export interface Source {
  source: string;
  doc_type: string;
  page: number;
  article?: string | null;
  // Campos para jurisprudência (quando doc_type === "jurisprudencia")
  tribunal?: string;
  numero_processo?: string;
  classe?: string;
  orgao_julgador?: string;
  data?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[] | null;
  created_at?: string;
}

export interface Session {
  session_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  session_id: string;
}
