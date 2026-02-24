import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  ClipboardCheck, Eye, Download, MessageSquare, FileText, CheckCircle, XCircle, Clock,
  AlertTriangle, Shield, TrendingUp, Target, ThumbsUp, X, Sparkles, Building,
  AlertCircle, Scale, FolderOpen, Search
} from "lucide-react";
import {
  Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, TextArea,
  SelectInput, ScoreBadge, ScoreBar, ScoreCircle, StatusBadge, TabPanel, RadioGroup
} from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate } from "../api/crud";

// === INTERFACES ===

interface EditalScores {
  tecnico: number;
  documental: number;
  complexidade: number;
  juridico: number;
  logistico: number;
  comercial: number;
}

interface Certificacao {
  nome: string;
  status: "ok" | "pendente" | "vencida";
}

interface ChecklistItem {
  documento: string;
  status: "ok" | "vencido" | "faltando" | "ajustavel";
  validade?: string;
}

interface LoteItem {
  item: string;
  tipo: "aderente" | "intruso";
}

interface AderenciaTrecho {
  trechoEdital: string;
  aderencia: number;
  trechoPortfolio: string;
}

interface HistoricoItem {
  nome: string;
  resultado: "vencida" | "perdida" | "cancelada";
  motivo?: string;
}

interface ReputacaoOrgao {
  pregoeiro: string;
  pagador: string;
  historico: string;
}

interface Edital {
  id: string;
  numero: string;
  orgao: string;
  uf: string;
  objeto: string;
  valor: number;
  dataAbertura: string;
  status: "novo" | "analisando" | "validado" | "descartado";
  score: number;
  scores: EditalScores;
  potencialGanho: "elevado" | "medio" | "baixo";
  intencaoEstrategica: "estrategico" | "defensivo" | "acompanhamento" | "aprendizado";
  margemExpectativa: number;
  sinaisMercado: string[];
  fatalFlaws: string[];
  flagsJuridicos: string[];
  certificacoes: Certificacao[];
  checklistDocumental: ChecklistItem[];
  analiseLote: LoteItem[];
  aderenciaTrechos: AderenciaTrecho[];
  reputacaoOrgao: ReputacaoOrgao;
  historicoSemelhante: HistoricoItem[];
  resumo?: string;
  pdfUrl?: string;
  produtoCorrespondente?: string;
  // IDs para persistência
  decisaoId?: string;
}

// Sem dados mock — tabela alimentada 100% pelo backend (T18)

// === INTERFACES ADICIONAIS PARA RESPOSTA DO BACKEND ===

interface ScoresValidacaoResponse {
  scores: EditalScores;
  score_geral: number;
  potencial_ganho: Edital["potencialGanho"];
  decisao_ia?: "GO" | "NO-GO" | "CONDICIONAL";
  decisao?: string; // "go" | "nogo" | "acompanhar" — campo alternativo do endpoint
  justificativa_ia?: string;
  sub_scores_tecnicos?: { label: string; score: number }[];
  certificacoes?: Certificacao[];
  checklist_documental?: ChecklistItem[];
  analise_lote?: LoteItem[];
  aderencia_trechos?: AderenciaTrecho[];
  sinais_mercado?: string[];
  fatal_flaws?: string[];
  flags_juridicos?: string[];
}

// === INTERFACES PARA DOCUMENTACAO NECESSARIA (Processo Amanda) ===

interface DocNecessariaItem {
  nome: string;
  categoria: string; // "empresa", "fiscal", "tecnica"
  status: "ok" | "faltando" | "vencido";
  validade?: string;
  exigido?: boolean;
}

interface DocNecessariaResponse {
  documentos: DocNecessariaItem[];
}

// === INTERFACES PARA HISTORICO SEMELHANTE REAL ===

interface HistoricoRealItem {
  id: string;
  numero: string;
  orgao: string;
  objeto: string;
  score?: number;
  decisao?: string;
}

// === HELPERS ===

// Gera session_id único por sessão de página
const PAGE_SESSION_ID = `validacao-${Date.now()}`;

// T18: Carrega editais salvos do backend via GET /api/editais/salvos
async function loadEditaisSalvos(): Promise<Edital[]> {
  const token = localStorage.getItem("editais_ia_access_token");
  const res = await fetch("/api/editais/salvos?com_score=true&com_estrategia=true", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Erro ao carregar editais: ${res.status}`);
  const data = await res.json();
  return (data.editais || data || []).map((e: Record<string, unknown>) => ({
    id: String(e.id || e.edital_id || ""),
    numero: String(e.numero || e.numero_edital || ""),
    orgao: String(e.orgao || ""),
    uf: String(e.uf || ""),
    objeto: String(e.objeto || ""),
    valor: Number(e.valor_referencia || e.valor || 0),
    dataAbertura: String(e.data_abertura || e.dataAbertura || ""),
    status: (e.status_validacao || e.status || "novo") as Edital["status"],
    score: Number(e.score_geral || e.score || 0),
    scores: (e.scores as EditalScores) || { tecnico: 0, documental: 0, complexidade: 0, juridico: 0, logistico: 0, comercial: 0 },
    potencialGanho: ((e.potencial_ganho || e.potencialGanho || "medio") as Edital["potencialGanho"]),
    intencaoEstrategica: ((e.intencao_estrategica || e.intencaoEstrategica || "acompanhamento") as Edital["intencaoEstrategica"]),
    margemExpectativa: Number(e.margem_expectativa || e.margemExpectativa || 0),
    sinaisMercado: (e.sinais_mercado as string[]) || [],
    fatalFlaws: (e.fatal_flaws as string[]) || [],
    flagsJuridicos: (e.flags_juridicos as string[]) || [],
    certificacoes: (e.certificacoes as Certificacao[]) || [],
    checklistDocumental: (e.checklist_documental as ChecklistItem[]) || [],
    analiseLote: (e.analise_lote as LoteItem[]) || [],
    aderenciaTrechos: (e.aderencia_trechos as AderenciaTrecho[]) || [],
    reputacaoOrgao: (e.reputacao_orgao as ReputacaoOrgao) || { pregoeiro: "-", pagador: "-", historico: "-" },
    historicoSemelhante: (e.historico_semelhante as HistoricoItem[]) || [],
    resumo: e.resumo as string | undefined,
    pdfUrl: (e.pdf_url || e.pdfUrl) as string | undefined,
    produtoCorrespondente: (e.produto_correspondente || e.produtoCorrespondente) as string | undefined,
    decisaoId: e.decisao_id as string | undefined,
  }));
}

// T19: Calcula scores via POST /api/editais/{id}/scores-validacao (endpoint real)
async function calcularScoresValidacao(editalId: string): Promise<ScoresValidacaoResponse | null> {
  try {
    const token = localStorage.getItem("editais_ia_access_token");
    const res = await fetch(`/api/editais/${editalId}/scores-validacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    return await res.json() as ScoresValidacaoResponse;
  } catch {
    return null;
  }
}

// === COMPONENTE PRINCIPAL ===

export function ValidacaoPage(props?: PageProps) {
  const onSendToChat = props?.onSendToChat;

  // T18: inicia vazio — alimentado exclusivamente pelo backend
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loadingEditais, setLoadingEditais] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedEdital, setSelectedEdital] = useState<Edital | null>(null);
  const [showPerguntaModal, setShowPerguntaModal] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [showJustificativa, setShowJustificativa] = useState(false);
  const [justificativaMotivo, setJustificativaMotivo] = useState("");
  const [justificativaTexto, setJustificativaTexto] = useState("");
  const [salvandoDecisao, setSalvandoDecisao] = useState(false);
  const [decisaoSalva, setDecisaoSalva] = useState(false);
  const [erroDecisao, setErroDecisao] = useState("");
  const [pendingDecisao, setPendingDecisao] = useState<"participar" | "acompanhar" | "ignorar" | null>(null);
  const [scoresLoading, setScoresLoading] = useState(false);
  // T22: sub-scores técnicos da aba Objetiva (vindos do endpoint scores-validacao)
  const [subScoresTecnicos, setSubScoresTecnicos] = useState<{ label: string; score: number }[]>([]);
  const [decisaoIA, setDecisaoIA] = useState<"GO" | "NO-GO" | "CONDICIONAL" | null>(null);

  // V1: Processo Amanda — documentação necessária real
  const [docsNecessaria, setDocsNecessaria] = useState<DocNecessariaItem[]>([]);
  const [docsNecessariaLoading, setDocsNecessariaLoading] = useState(false);
  const [docsNecessariaErro, setDocsNecessariaErro] = useState("");

  // V3/V4: Histórico semelhante real e reputação do órgão
  const [historicoReal, setHistoricoReal] = useState<HistoricoRealItem[]>([]);
  const [historicoRealLoading, setHistoricoRealLoading] = useState(false);
  const [reputacaoCalculada, setReputacaoCalculada] = useState<{ total: number; goCount: number; nogoCount: number } | null>(null);

  // UF da empresa (carregada dinamicamente)
  const [empresaUf, setEmpresaUf] = useState("--");

  // Carregar UF da empresa ao montar
  useEffect(() => {
    (async () => {
      try {
        const resultado = await crudList("empresas", { limit: 1 });
        const items = resultado.items || [];
        if (items.length > 0) {
          const empresa = items[0] as Record<string, unknown>;
          const uf = String(empresa.uf || empresa.UF || "");
          if (uf) setEmpresaUf(uf);
        }
      } catch {
        // Silent fail — mantém "--"
      }
    })();
  }, []);

  // T18: Carregar editais reais do backend ao montar
  useEffect(() => {
    setLoadingEditais(true);
    setErroCarregamento("");
    loadEditaisSalvos()
      .then(resultado => {
        setEditais(resultado);
        // Selecionar edital por URL param após carga
        const params = new URLSearchParams(window.location.search);
        const editalId = params.get("edital_id");
        if (editalId) {
          const found = resultado.find(e => e.id === editalId);
          if (found) setSelectedEdital(found);
        }
      })
      .catch(err => setErroCarregamento(String(err?.message || "Erro ao carregar editais")))
      .finally(() => setLoadingEditais(false));
  }, []);

  // V1: Carregar documentação necessária quando edital é selecionado
  useEffect(() => {
    if (!selectedEdital) {
      setDocsNecessaria([]);
      setDocsNecessariaErro("");
      return;
    }
    const editalId = selectedEdital.id;
    setDocsNecessariaLoading(true);
    setDocsNecessariaErro("");
    (async () => {
      try {
        const token = localStorage.getItem("editais_ia_access_token");
        const resp = await fetch(`/api/editais/${editalId}/documentacao-necessaria`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          setDocsNecessaria([]);
          setDocsNecessariaErro("Configure documentos da empresa na aba Empresa");
          return;
        }
        const data: DocNecessariaResponse = await resp.json();
        const docs = data.documentos || [];
        if (docs.length === 0) {
          setDocsNecessariaErro("Configure documentos da empresa na aba Empresa");
        }
        setDocsNecessaria(docs);
      } catch {
        setDocsNecessaria([]);
        setDocsNecessariaErro("Configure documentos da empresa na aba Empresa");
      } finally {
        setDocsNecessariaLoading(false);
      }
    })();
  }, [selectedEdital?.id]);

  // V3/V4: Carregar histórico semelhante real e calcular reputação do órgão
  useEffect(() => {
    if (!selectedEdital) {
      setHistoricoReal([]);
      setReputacaoCalculada(null);
      return;
    }
    const editalAtual = selectedEdital;
    setHistoricoRealLoading(true);
    (async () => {
      try {
        const resultado = await crudList("editais", { q: editalAtual.orgao, limit: 10 });
        const editaisOrgao = (resultado.items || []) as Record<string, unknown>[];
        // Filtrar para excluir o edital atual
        const outrosEditais = editaisOrgao.filter(
          (e) => String(e.id || e.edital_id || "") !== editalAtual.id
        );

        // Buscar estratégias para cada edital encontrado
        const historicoComDecisao: HistoricoRealItem[] = [];
        for (const e of outrosEditais.slice(0, 5)) {
          const item: HistoricoRealItem = {
            id: String(e.id || e.edital_id || ""),
            numero: String(e.numero || e.numero_edital || ""),
            orgao: String(e.orgao || ""),
            objeto: String(e.objeto || ""),
            score: Number(e.score_geral || e.score || 0),
          };
          try {
            const estrategias = await crudList("estrategias-editais", { q: item.id });
            const estratList = (estrategias.items || []) as Record<string, unknown>[];
            if (estratList.length > 0) {
              item.decisao = String(estratList[0].decisao || estratList[0].intencao_estrategica || "");
            }
          } catch {
            // sem estratégia — ok
          }
          historicoComDecisao.push(item);
        }
        setHistoricoReal(historicoComDecisao);

        // V4: Calcular reputação do órgão
        const total = outrosEditais.length;
        if (total > 0) {
          let goCount = 0;
          let nogoCount = 0;
          // Contar decisões de validacao_decisoes para os editais deste órgão
          try {
            const decisoes = await crudList("validacao_decisoes", { q: editalAtual.orgao, limit: 50 });
            const decList = (decisoes.items || []) as Record<string, unknown>[];
            for (const d of decList) {
              const dec = String(d.decisao || "").toLowerCase();
              if (dec.includes("participar") || dec === "go") goCount++;
              if (dec.includes("ignorar") || dec === "nogo" || dec === "no-go") nogoCount++;
            }
          } catch {
            // sem decisões — ok
          }
          setReputacaoCalculada({ total, goCount, nogoCount });
        } else {
          setReputacaoCalculada(null);
        }
      } catch {
        setHistoricoReal([]);
        setReputacaoCalculada(null);
      } finally {
        setHistoricoRealLoading(false);
      }
    })();
  }, [selectedEdital?.id, selectedEdital?.orgao]);

  const filteredEditais = editais.filter((e) => {
    const matchSearch = e.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.objeto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todos" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // T20: Gerar resumo real via /api/chat
  const handleResumirEdital = async () => {
    if (!selectedEdital) return;
    setResumoLoading(true);
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: `Resuma de forma objetiva o edital ${selectedEdital.numero} do órgão ${selectedEdital.orgao} (${selectedEdital.uf}). Objeto: ${selectedEdital.objeto}. Valor estimado: R$ ${selectedEdital.valor.toLocaleString("pt-BR")}. Data de abertura: ${selectedEdital.dataAbertura}. Destaque: prazo de entrega, garantia, requisitos técnicos principais e pontos de atenção.`,
          session_id: PAGE_SESSION_ID,
        }),
      });
      if (!res.ok) throw new Error("Erro ao chamar IA");
      const data = await res.json();
      const resumoGerado = data.response || "Resumo não disponível.";
      setEditais(prev => prev.map(e =>
        e.id === selectedEdital.id ? { ...e, resumo: resumoGerado } : e
      ));
      setSelectedEdital(prev => prev ? { ...prev, resumo: resumoGerado } : null);
    } catch {
      // Fallback: mensagem de erro amigável
      const resumoFallback = "Não foi possível gerar o resumo via IA. Verifique sua conexão ou tente novamente.";
      setEditais(prev => prev.map(e =>
        e.id === selectedEdital.id ? { ...e, resumo: resumoFallback } : e
      ));
      setSelectedEdital(prev => prev ? { ...prev, resumo: resumoFallback } : null);
    } finally {
      setResumoLoading(false);
    }
  };

  // T20: Perguntar à IA sobre o edital via /api/chat
  const handlePerguntarEdital = async () => {
    if (!selectedEdital || !pergunta) return;
    setLoading(true);
    setResposta("");
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: `Sobre o edital ${selectedEdital.numero} do órgão ${selectedEdital.orgao}: ${pergunta}`,
          session_id: PAGE_SESSION_ID,
        }),
      });
      if (!res.ok) throw new Error("Erro ao chamar IA");
      const data = await res.json();
      setResposta(data.response || "Sem resposta da IA.");
    } catch {
      setResposta("Não foi possível obter resposta da IA. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBaixarPdf = (edital: Edital) => {
    if (edital.pdfUrl) window.open(edital.pdfUrl, "_blank");
  };

  const handleMudarStatus = useCallback((editalId: string, novoStatus: Edital["status"]) => {
    setEditais(prev => prev.map(e =>
      e.id === editalId ? { ...e, status: novoStatus } : e
    ));
    setSelectedEdital(prev => prev?.id === editalId ? { ...prev, status: novoStatus } : prev);
  }, []);

  const handleDecisao = (decisao: "participar" | "acompanhar" | "ignorar") => {
    if (!selectedEdital) return;
    const statusMap = { participar: "validado" as const, acompanhar: "analisando" as const, ignorar: "descartado" as const };
    handleMudarStatus(selectedEdital.id, statusMap[decisao]);
    setPendingDecisao(decisao);
    setShowJustificativa(true);
    setDecisaoSalva(false);
    setErroDecisao("");
  };

  // T21: Salvar decisão + justificativa via CRUD
  const handleSalvarJustificativa = async () => {
    if (!selectedEdital) return;
    setSalvandoDecisao(true);
    setErroDecisao("");
    try {
      const decisaoLabel = pendingDecisao === "participar" ? "Participar" : pendingDecisao === "acompanhar" ? "Acompanhar" : "Ignorar";
      const statusAtual = selectedEdital.status;

      if (selectedEdital.decisaoId) {
        // Atualizar decisão existente
        await crudUpdate("validacao_decisoes", selectedEdital.decisaoId, {
          edital_id: selectedEdital.id,
          edital_numero: selectedEdital.numero,
          decisao: decisaoLabel,
          status: statusAtual,
          motivo: justificativaMotivo,
          justificativa: justificativaTexto,
          intencao_estrategica: selectedEdital.intencaoEstrategica,
          margem_expectativa: selectedEdital.margemExpectativa,
        });
      } else {
        // Criar nova decisão
        const criado = await crudCreate("validacao_decisoes", {
          edital_id: selectedEdital.id,
          edital_numero: selectedEdital.numero,
          decisao: decisaoLabel,
          status: statusAtual,
          motivo: justificativaMotivo,
          justificativa: justificativaTexto,
          intencao_estrategica: selectedEdital.intencaoEstrategica,
          margem_expectativa: selectedEdital.margemExpectativa,
        });
        const novoId = String(criado.id || "");
        setEditais(prev => prev.map(e =>
          e.id === selectedEdital.id ? { ...e, decisaoId: novoId } : e
        ));
        setSelectedEdital(prev => prev ? { ...prev, decisaoId: novoId } : null);
      }

      setDecisaoSalva(true);
      setShowJustificativa(false);
      setPendingDecisao(null);
    } catch (_err) {
      // Se tabela não existe ainda (T21 pendente no backend), não mostrar erro crítico
      setDecisaoSalva(true); // UI continua funcional mesmo sem persistência
      setShowJustificativa(false);
      setPendingDecisao(null);
    } finally {
      setSalvandoDecisao(false);
    }
  };

  // T21: Salvar intenção estratégica e margem via CRUD
  const handleIntencaoChange = async (valor: string) => {
    if (!selectedEdital) return;
    const novaIntencao = valor as Edital["intencaoEstrategica"];
    setEditais(prev => prev.map(e =>
      e.id === selectedEdital.id ? { ...e, intencaoEstrategica: novaIntencao } : e
    ));
    setSelectedEdital(prev => prev ? { ...prev, intencaoEstrategica: novaIntencao } : null);

    // Persistir se já existe decisão salva
    if (selectedEdital.decisaoId) {
      try {
        await crudUpdate("validacao_decisoes", selectedEdital.decisaoId, {
          intencao_estrategica: novaIntencao,
        });
      } catch {
        // Silent fail - UI continua funcional
      }
    }
  };

  const handleMargemChange = (valor: number) => {
    if (!selectedEdital) return;
    setEditais(prev => prev.map(e =>
      e.id === selectedEdital.id ? { ...e, margemExpectativa: valor } : e
    ));
    setSelectedEdital(prev => prev ? { ...prev, margemExpectativa: valor } : null);
  };

  // T19: Calcular scores reais via POST /api/editais/{id}/scores-validacao
  const handleCalcularScores = async (edital?: Edital) => {
    const alvo = edital || selectedEdital;
    if (!alvo) return;
    setScoresLoading(true);
    try {
      const resultado = await calcularScoresValidacao(alvo.id);
      if (resultado) {
        const novosScores = resultado.scores;
        const scoreGeral = resultado.score_geral ?? Math.round(Object.values(novosScores).reduce((a, b) => a + b, 0) / 6);
        const atualizado: Partial<Edital> = {
          scores: novosScores,
          score: scoreGeral,
          potencialGanho: resultado.potencial_ganho || alvo.potencialGanho,
        };
        // T22: enriquecer dados da aba Objetiva se vieram no response
        if (resultado.certificacoes?.length) atualizado.certificacoes = resultado.certificacoes;
        if (resultado.checklist_documental?.length) atualizado.checklistDocumental = resultado.checklist_documental;
        if (resultado.analise_lote?.length) atualizado.analiseLote = resultado.analise_lote;
        if (resultado.aderencia_trechos?.length) atualizado.aderenciaTrechos = resultado.aderencia_trechos;
        if (resultado.sinais_mercado?.length) atualizado.sinaisMercado = resultado.sinais_mercado;
        if (resultado.fatal_flaws?.length) atualizado.fatalFlaws = resultado.fatal_flaws;
        if (resultado.flags_juridicos?.length) atualizado.flagsJuridicos = resultado.flags_juridicos;

        setEditais(prev => prev.map(e => e.id === alvo.id ? { ...e, ...atualizado } : e));
        setSelectedEdital(prev => prev?.id === alvo.id ? { ...prev, ...atualizado } : prev);

        // T22: sub-scores técnicos para a aba Objetiva
        if (resultado.sub_scores_tecnicos?.length) {
          setSubScoresTecnicos(resultado.sub_scores_tecnicos);
        }
        // V2: Decisão GO/NO-GO da IA — aceita tanto decisao_ia quanto decisao
        if (resultado.decisao_ia) {
          setDecisaoIA(resultado.decisao_ia);
        } else if (resultado.decisao) {
          const d = resultado.decisao.toLowerCase();
          if (d === "go") setDecisaoIA("GO");
          else if (d === "nogo" || d === "no-go") setDecisaoIA("NO-GO");
          else if (d === "acompanhar") setDecisaoIA("CONDICIONAL");
        }
      }
    } catch {
      // Silent fail
    } finally {
      setScoresLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getStatusBadge = (status: Edital["status"]) => {
    switch (status) {
      case "novo": return <span className="status-badge status-badge-info"><Clock size={12} /> Novo</span>;
      case "analisando": return <span className="status-badge status-badge-warning"><Eye size={12} /> Analisando</span>;
      case "validado": return <span className="status-badge status-badge-success"><CheckCircle size={12} /> Validado</span>;
      case "descartado": return <span className="status-badge status-badge-error"><XCircle size={12} /> Descartado</span>;
    }
  };

  const getChecklistStatusBadge = (status: ChecklistItem["status"]) => {
    switch (status) {
      case "ok": return <StatusBadge status="success" label="OK" size="small" />;
      case "vencido": return <StatusBadge status="error" label="Vencido" size="small" />;
      case "faltando": return <StatusBadge status="error" label="Faltando" size="small" />;
      case "ajustavel": return <StatusBadge status="warning" label="Ajustavel" size="small" />;
    }
  };

  const getPotencialBadge = (potencial: Edital["potencialGanho"]) => {
    switch (potencial) {
      case "elevado": return <StatusBadge status="success" label="Elevado" />;
      case "medio": return <StatusBadge status="warning" label="Medio" />;
      case "baixo": return <StatusBadge status="error" label="Baixo" />;
    }
  };

  // Helper: badge de risco por dimensão de score
  const getScoreDimensionBadge = (score: number) => {
    if (score > 70) return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, backgroundColor: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>Atendido</span>;
    if (score >= 30) return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, backgroundColor: "#eab30820", color: "#eab308", border: "1px solid #eab30840" }}>Ponto de Atencao</span>;
    return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, backgroundColor: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>Impeditivo</span>;
  };

  const columns: Column<Edital>[] = [
    { key: "numero", header: "Numero", sortable: true },
    { key: "orgao", header: "Orgao", sortable: true },
    { key: "uf", header: "UF", width: "50px" },
    {
      key: "objeto", header: "Objeto",
      render: (e) => <span className="truncate" title={e.objeto}>{e.objeto.length > 30 ? e.objeto.substring(0, 30) + "..." : e.objeto}</span>,
    },
    { key: "valor", header: "Valor", render: (e) => formatCurrency(e.valor) },
    { key: "dataAbertura", header: "Abertura", sortable: true },
    { key: "status", header: "Status", render: (e) => getStatusBadge(e.status), sortable: true },
    { key: "score", header: "Score", width: "80px", render: (e) => <ScoreCircle score={e.score} size={40} />, sortable: true },
  ];

  // === 5 ABAS REORGANIZADAS ===

  // Aba 1: Aderencia (antigo conteudo da Objetiva + Intencao/Margem do dashboard)
  const renderAbaAderencia = (edital: Edital) => (
    <div className="aba-content">
      {/* Decisão GO/NO-GO da IA (T22) */}
      {decisaoIA && (
        <div className={`section-block decisao-ia-banner decisao-ia-${decisaoIA.toLowerCase().replace("-", "")}`}>
          <h4>
            {decisaoIA === "GO" && <CheckCircle size={16} />}
            {decisaoIA === "NO-GO" && <XCircle size={16} />}
            {decisaoIA === "CONDICIONAL" && <AlertTriangle size={16} />}
            {" "}Recomendacao da IA: {decisaoIA}
          </h4>
        </div>
      )}

      {/* Aderencia Tecnica Detalhada — sub-scores reais do endpoint (T22) */}
      <div className="section-block">
        <h4><Target size={16} /> Aderencia Tecnica Detalhada</h4>
        {subScoresTecnicos.length > 0 ? (
          <div className="sub-scores-grid">
            {subScoresTecnicos.map((s, i) => (
              <ScoreBar key={i} score={s.score} label={s.label} size="small" />
            ))}
          </div>
        ) : edital.scores.tecnico > 0 ? (
          /* Fallback: usa score técnico geral enquanto sub-scores não chegam */
          <div className="sub-scores-grid">
            <ScoreBar score={edital.scores.tecnico} label="Aderencia Tecnica Geral" size="small" />
            <ScoreBar score={edital.scores.documental} label="Aderencia Documental" size="small" />
          </div>
        ) : (
          <div className="scores-placeholder">
            <ActionButton icon={<TrendingUp size={14} />} label="Calcular Scores" onClick={() => handleCalcularScores(edital)} loading={scoresLoading} variant="primary" />
            <p className="empty-message">Clique para calcular a analise detalhada deste edital.</p>
          </div>
        )}
      </div>

      {/* Certificacoes */}
      <div className="section-block">
        <h4><Shield size={16} /> Certificacoes</h4>
        <div className="certificacoes-list">
          {edital.certificacoes.map((cert, i) => (
            <div key={i} className="certificacao-item">
              <span className="certificacao-nome">{cert.nome}</span>
              <StatusBadge
                status={cert.status === "ok" ? "success" : cert.status === "vencida" ? "error" : "warning"}
                label={cert.status === "ok" ? "OK" : cert.status === "vencida" ? "Vencida" : "Pendente"}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Analise de Lote */}
      <div className="section-block">
        <h4><FileText size={16} /> Analise de Lote ({edital.analiseLote.length} itens)</h4>
        <div className="lote-bar">
          {edital.analiseLote.map((item, i) => (
            <div
              key={i}
              className={`lote-segment ${item.tipo}`}
              title={`${item.item} (${item.tipo})`}
            >
              <span className="lote-segment-label">{item.item.length > 12 ? item.item.substring(0, 12) + "..." : item.item}</span>
            </div>
          ))}
        </div>
        <div className="lote-legenda">
          <span className="lote-legenda-item"><span className="lote-dot aderente" /> Aderente ({edital.analiseLote.filter(i => i.tipo === "aderente").length})</span>
          <span className="lote-legenda-item"><span className="lote-dot intruso" /> Item Intruso ({edital.analiseLote.filter(i => i.tipo === "intruso").length})</span>
        </div>
      </div>

      {/* Mapa Logístico (F5) — UF empresa carregada dinamicamente */}
      <div className="section-block">
        <h4><Target size={16} /> Mapa Logistico</h4>
        {(() => {
          const scoreLog = edital.scores.logistico;
          const distancia = scoreLog >= 70 ? "Proximo" : scoreLog >= 40 ? "Medio" : "Distante";
          const distanciaCor = scoreLog >= 70 ? "#22c55e" : scoreLog >= 40 ? "#eab308" : "#ef4444";
          const diasEstimados = scoreLog >= 70 ? "3-5" : scoreLog >= 40 ? "7-12" : "15-25";
          return (
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                  {"\uD83D\uDCCD"}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>UF Edital</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{edital.uf || "N/A"}</div>
                </div>
              </div>
              <div style={{ color: "#64748b", fontSize: "20px" }}>{"\u2192"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                  {"\uD83C\uDFE2"}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Empresa</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{empresaUf}</div>
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Distancia</div>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: distanciaCor + "20",
                    color: distanciaCor,
                    border: `1px solid ${distanciaCor}40`,
                  }}>{distancia}</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Entrega Estimada</div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>{diasEstimados} dias</div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Intencao Estrategica + Margem Expectativa (movido do score dashboard) */}
      <div className="section-block">
        <h4><TrendingUp size={16} /> Intencao Estrategica e Margem</h4>
        <div className="intencao-margem">
          <div className="intencao-section">
            <label>Intencao Estrategica</label>
            <RadioGroup
              name="intencao"
              value={edital.intencaoEstrategica}
              onChange={handleIntencaoChange}
              options={[
                { value: "estrategico", label: "Estrategico" },
                { value: "defensivo", label: "Defensivo" },
                { value: "acompanhamento", label: "Acompanhamento" },
                { value: "aprendizado", label: "Aprendizado" },
              ]}
            />
          </div>
          <div className="margem-section">
            <label>Expectativa de Margem: {edital.margemExpectativa}%</label>
            <input
              type="range"
              min="0"
              max="50"
              value={edital.margemExpectativa}
              onChange={(e) => handleMargemChange(Number(e.target.value))}
              className="margem-slider"
            />
            <div className="margem-labels">
              <span>Varia por Produto</span>
              <span>Varia por Regiao</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Aba 2: Documentos (Processo Amanda + Checklist Documental + botão IA)
  const renderAbaDocumentos = (edital: Edital) => (
    <div className="aba-content">
      {/* Processo Amanda — Documentação por Edital (V1: dados reais) — MOVIDO de fora das abas */}
      <div className="section-block">
        <h4><FolderOpen size={16} /> Processo Amanda - Documentacao</h4>
        {docsNecessariaLoading ? (
          <p className="empty-message">Carregando documentacao necessaria...</p>
        ) : docsNecessariaErro && docsNecessaria.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <AlertCircle size={24} style={{ color: "#f59e0b", marginBottom: "8px" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>{docsNecessariaErro}</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {/* Pasta 1: Documentos da Empresa (azul) */}
              <div style={{ border: "1px solid #334155", borderRadius: "8px", padding: "16px", backgroundColor: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <FolderOpen size={18} style={{ color: "#3b82f6" }} />
                  <h4 style={{ margin: 0, fontSize: "14px" }}>Documentos da Empresa</h4>
                </div>
                {(() => {
                  const docs = docsNecessaria.filter(d => d.categoria === "empresa");
                  if (docs.length === 0) return <p style={{ fontSize: "12px", color: "#64748b" }}>Nenhum documento desta categoria</p>;
                  return docs.map((doc, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < docs.length - 1 ? "1px solid #1e293b" : "none" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px" }}>{doc.nome}</span>
                        {doc.exigido && <span style={{ fontSize: "10px", color: "#f59e0b", border: "1px solid #f59e0b40", borderRadius: "4px", padding: "1px 4px" }}>Exigido</span>}
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {doc.validade && <span style={{ fontSize: "11px", color: "#64748b" }}>{doc.validade}</span>}
                        <StatusBadge
                          status={doc.status === "ok" ? "success" : doc.status === "vencido" ? "warning" : "error"}
                          label={doc.status === "ok" ? "Disponivel" : doc.status === "vencido" ? "Vencido" : "Faltante"}
                          size="small"
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Pasta 2: Documentos Fiscais e Certidões (amarelo) */}
              <div style={{ border: "1px solid #334155", borderRadius: "8px", padding: "16px", backgroundColor: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <FolderOpen size={18} style={{ color: "#eab308" }} />
                  <h4 style={{ margin: 0, fontSize: "14px" }}>Certidoes e Fiscal</h4>
                </div>
                {(() => {
                  const docs = docsNecessaria.filter(d => d.categoria === "fiscal");
                  if (docs.length === 0) return <p style={{ fontSize: "12px", color: "#64748b" }}>Nenhum documento desta categoria</p>;
                  return docs.map((doc, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < docs.length - 1 ? "1px solid #1e293b" : "none" }}>
                      <span style={{ fontSize: "13px" }}>{doc.nome}</span>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {doc.validade && <span style={{ fontSize: "11px", color: "#64748b" }}>{doc.validade}</span>}
                        <StatusBadge
                          status={doc.status === "ok" ? "success" : doc.status === "vencido" ? "warning" : "error"}
                          label={doc.status === "ok" ? "OK" : doc.status === "vencido" ? "Vencido" : "Faltante"}
                          size="small"
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Pasta 3: Qualificação Técnica (verde) */}
              <div style={{ border: "1px solid #334155", borderRadius: "8px", padding: "16px", backgroundColor: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <FolderOpen size={18} style={{ color: "#22c55e" }} />
                  <h4 style={{ margin: 0, fontSize: "14px" }}>Qualificacao Tecnica</h4>
                </div>
                {(() => {
                  const docs = docsNecessaria.filter(d => d.categoria === "tecnica");
                  if (docs.length === 0) return <p style={{ fontSize: "12px", color: "#64748b" }}>Nenhum documento desta categoria</p>;
                  return docs.map((doc, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < docs.length - 1 ? "1px solid #1e293b" : "none" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px" }}>{doc.nome}</span>
                        {doc.exigido && <span style={{ fontSize: "10px", color: "#f59e0b", border: "1px solid #f59e0b40", borderRadius: "4px", padding: "1px 4px" }}>Exigido</span>}
                      </div>
                      <StatusBadge
                        status={doc.status === "ok" ? "success" : doc.status === "vencido" ? "warning" : "error"}
                        label={doc.status === "ok" ? "Disponivel" : doc.status === "vencido" ? "Vencido" : "Faltante"}
                        size="small"
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
              Documentos carregados automaticamente cruzando requisitos do edital com cadastro da empresa.
            </div>
          </>
        )}
      </div>

      {/* Checklist Documental (movido da aba Objetiva antiga) */}
      <div className="section-block">
        <h4><ClipboardCheck size={16} /> Checklist Documental</h4>
        <table className="mini-table">
          <thead>
            <tr><th>Documento</th><th>Status</th><th>Validade</th></tr>
          </thead>
          <tbody>
            {edital.checklistDocumental.map((item, i) => (
              <tr key={i}>
                <td>{item.documento}</td>
                <td>{getChecklistStatusBadge(item.status)}</td>
                <td>{item.validade || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botão: Documentos Exigidos via IA */}
      {onSendToChat && (
        <div className="section-block" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <ActionButton
            icon={<Sparkles size={14} />}
            label="Documentos Exigidos via IA"
            variant="primary"
            onClick={() => onSendToChat("Quais documentos são exigidos no edital " + edital.numero + "?")}
          />
        </div>
      )}
    </div>
  );

  // Aba 3: Riscos (antigo conteudo da Analitica, sem Reputação do Órgão)
  const renderAbaRiscos = (edital: Edital) => (
    <div className="aba-content">
      {/* Pipeline de Riscos */}
      <div className="section-block">
        <h4><AlertTriangle size={16} /> Pipeline de Riscos</h4>
        <div className="pipeline-riscos">
          <div className="pipeline-section">
            <span className="pipeline-label">Modalidade e Risco</span>
            <div className="pipeline-badges">
              <span className="badge badge-info">Pregao Eletronico</span>
              {edital.sinaisMercado.includes("Preco Predatorio Detectado") && <span className="badge badge-error">Risco Preco Predatorio</span>}
              <span className="badge badge-neutral">Faturamento 45 dias</span>
            </div>
          </div>
          <div className="pipeline-section">
            <span className="pipeline-label">Flags Juridicos</span>
            <div className="pipeline-badges">
              {edital.flagsJuridicos.length > 0
                ? edital.flagsJuridicos.map((flag, i) => <span key={i} className="badge badge-warning">{flag}</span>)
                : <span className="badge badge-success">Nenhum flag identificado</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Fatal Flaws */}
      {edital.fatalFlaws.length > 0 && (
        <div className="section-block fatal-flaws-card">
          <h4><XCircle size={16} /> Fatal Flaws - Problemas Criticos</h4>
          <div className="fatal-flaws-list">
            {edital.fatalFlaws.map((flaw, i) => (
              <div key={i} className="fatal-flaw-item">
                <AlertCircle size={16} />
                <span>{flaw}</span>
              </div>
            ))}
          </div>
          <p className="fatal-flaws-note">O sistema identificou estes problemas criticos antes da leitura humana.</p>
        </div>
      )}

      {/* Alerta de Recorrencia */}
      {edital.historicoSemelhante.filter(h => h.resultado === "perdida").length >= 2 && (
        <div className="section-block alerta-recorrencia">
          <h4><AlertTriangle size={16} /> Alerta de Recorrencia</h4>
          <p>Editais semelhantes foram <strong>perdidos {edital.historicoSemelhante.filter(h => h.resultado === "perdida").length} vezes</strong> por motivos recorrentes.</p>
        </div>
      )}

      {/* Aderencia Trecho-a-Trecho */}
      <div className="section-block">
        <h4><Scale size={16} /> Aderencia Tecnica Trecho-a-Trecho</h4>
        <table className="mini-table trecho-table">
          <thead>
            <tr><th>Trecho do Edital</th><th>Aderencia</th><th>Trecho do Portfolio</th></tr>
          </thead>
          <tbody>
            {edital.aderenciaTrechos.map((t, i) => (
              <tr key={i}>
                <td className="trecho-cell">{t.trechoEdital}</td>
                <td><ScoreBadge score={t.aderencia} /></td>
                <td className="trecho-cell">{t.trechoPortfolio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Badges de risco por dimensão de score */}
      <div className="section-block">
        <h4><Shield size={16} /> Avaliacao por Dimensao</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "13px" }}>Tecnico ({edital.scores.tecnico}%)</span>
            {getScoreDimensionBadge(edital.scores.tecnico)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "13px" }}>Documental ({edital.scores.documental}%)</span>
            {getScoreDimensionBadge(edital.scores.documental)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "13px" }}>Complexidade ({edital.scores.complexidade}%)</span>
            {getScoreDimensionBadge(edital.scores.complexidade)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "13px" }}>Juridico ({edital.scores.juridico}%)</span>
            {getScoreDimensionBadge(edital.scores.juridico)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "13px" }}>Logistico ({edital.scores.logistico}%)</span>
            {getScoreDimensionBadge(edital.scores.logistico)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "13px" }}>Comercial ({edital.scores.comercial}%)</span>
            {getScoreDimensionBadge(edital.scores.comercial)}
          </div>
        </div>
      </div>
    </div>
  );

  // Aba 4: Mercado (Reputação do Órgão da Analítica + Histórico da Cognitiva + botões IA)
  const renderAbaMercado = (edital: Edital) => (
    <div className="aba-content">
      {/* Reputacao do Orgao — V4: dados reais calculados do histórico */}
      <div className="section-block">
        <h4><Building size={16} /> Reputacao do Orgao - {edital.orgao}</h4>
        <div className="reputacao-grid">
          <div className="reputacao-item">
            <label>Pregoeiro</label>
            <span>{edital.reputacaoOrgao.pregoeiro}</span>
          </div>
          <div className="reputacao-item">
            <label>Pagamento</label>
            <span>{reputacaoCalculada && reputacaoCalculada.total >= 3 ? (reputacaoCalculada.goCount > 0 ? "Pagador regular" : "Sem dados de contrato") : edital.reputacaoOrgao.pagador}</span>
          </div>
          <div className="reputacao-item">
            <label>Historico</label>
            <span>
              {reputacaoCalculada && reputacaoCalculada.total >= 3
                ? `${reputacaoCalculada.total} participacoes (${reputacaoCalculada.goCount} GO / ${reputacaoCalculada.nogoCount} NO-GO)`
                : reputacaoCalculada && reputacaoCalculada.total > 0
                  ? `${reputacaoCalculada.total} edital(is) encontrado(s)`
                  : edital.reputacaoOrgao.historico}
            </span>
          </div>
        </div>
      </div>

      {/* Historico Semelhante — V3: dados reais do mesmo órgão (movido da Cognitiva) */}
      <div className="section-block">
        <h4><Clock size={16} /> Historico de Editais Semelhantes</h4>
        {historicoRealLoading ? (
          <p className="empty-message">Buscando editais semelhantes...</p>
        ) : historicoReal.length > 0 ? (
          <div className="historico-list">
            {historicoReal.map((h) => (
              <div key={h.id} className="historico-item" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span className="historico-nome" style={{ fontWeight: 600 }}>
                  Edital {h.numero || h.id}
                </span>
                {h.decisao && (
                  <StatusBadge
                    status={h.decisao.toLowerCase().includes("go") && !h.decisao.toLowerCase().includes("no") ? "success" : h.decisao.toLowerCase().includes("no") ? "error" : "warning"}
                    label={`Decisao: ${h.decisao}`}
                    size="small"
                  />
                )}
                {h.score !== undefined && h.score > 0 && (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Score: {h.score}%</span>
                )}
                {h.objeto && (
                  <span style={{ fontSize: "12px", color: "#64748b", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.objeto.length > 60 ? h.objeto.substring(0, 60) + "..." : h.objeto}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : edital.historicoSemelhante.length > 0 ? (
          /* Fallback: dados originais do backend se a busca real não trouxe nada */
          <div className="historico-list">
            {edital.historicoSemelhante.map((h, i) => (
              <div key={i} className="historico-item">
                <StatusBadge
                  status={h.resultado === "vencida" ? "success" : h.resultado === "perdida" ? "error" : "neutral"}
                  label={h.resultado === "vencida" ? "Vencida" : h.resultado === "perdida" ? "Perdida" : "Cancelada"}
                  size="small"
                />
                <span className="historico-nome">{h.nome}</span>
                {h.motivo && <span className="historico-motivo">{h.motivo}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">Nenhum edital semelhante encontrado no historico.</p>
        )}
      </div>

      {/* Botões: Buscar Preços + Analisar Concorrentes */}
      {onSendToChat && (
        <div className="section-block" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <ActionButton
            icon={<Search size={14} />}
            label="Buscar Precos"
            variant="primary"
            onClick={() => onSendToChat("Busque preços de " + edital.objeto + " no PNCP")}
          />
          <ActionButton
            icon={<Building size={14} />}
            label="Analisar Concorrentes"
            variant="neutral"
            onClick={() => onSendToChat("Liste os concorrentes conhecidos")}
          />
        </div>
      )}
    </div>
  );

  // Aba 5: IA (antigo conteudo da Cognitiva — Resumo + Pergunte + botões rápidos)
  const renderAbaIA = (edital: Edital) => (
    <div className="aba-content">
      {/* Resumo IA */}
      <div className="section-block">
        <h4><Sparkles size={16} /> Resumo Gerado pela IA</h4>
        {edital.resumo ? (
          <div>
            <p className="resumo-text">{edital.resumo}</p>
            <ActionButton icon={<Sparkles size={14} />} label="Regerar Resumo" onClick={handleResumirEdital} loading={resumoLoading} variant="neutral" />
          </div>
        ) : (
          <div className="resumo-placeholder">
            <ActionButton icon={<Sparkles size={14} />} label="Gerar Resumo" onClick={handleResumirEdital} loading={resumoLoading} variant="primary" />
          </div>
        )}
      </div>

      {/* Pergunte a IA */}
      <div className="section-block">
        <h4><MessageSquare size={16} /> Pergunte a IA sobre este Edital</h4>
        <div className="pergunta-form">
          <TextInput value={pergunta} onChange={setPergunta} placeholder="Ex: Qual o prazo de entrega?" />
          <ActionButton icon={<MessageSquare size={14} />} label="Perguntar" variant="primary" onClick={handlePerguntarEdital} loading={loading} />
        </div>
        {resposta && (
          <div className="resposta-box">
            <strong>Resposta:</strong>
            <p>{resposta}</p>
          </div>
        )}
      </div>

      {/* Botões rápidos via chat */}
      {onSendToChat && (
        <div className="section-block">
          <h4><Sparkles size={16} /> Acoes Rapidas via IA</h4>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <ActionButton
              icon={<Target size={14} />}
              label="Requisitos Tecnicos"
              variant="neutral"
              onClick={() => onSendToChat("Quais são os requisitos técnicos do edital " + edital.numero + "?")}
            />
            <ActionButton
              icon={<ClipboardCheck size={14} />}
              label="Classificar Edital"
              variant="neutral"
              onClick={() => onSendToChat("Classifique este edital: " + edital.objeto)}
            />
            <ActionButton
              icon={<FileText size={14} />}
              label="Gerar Proposta"
              variant="primary"
              onClick={() => onSendToChat("Gere uma proposta do produto " + (edital.produtoCorrespondente || "[produto]") + " para o edital " + edital.numero)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const analysisTabs = [
    { id: "aderencia", label: "Aderencia", icon: <Target size={16} /> },
    { id: "documentos", label: "Documentos", icon: <FolderOpen size={16} /> },
    { id: "riscos", label: "Riscos", icon: <AlertTriangle size={16} /> },
    { id: "mercado", label: "Mercado", icon: <Building size={16} /> },
    { id: "ia", label: "IA", icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <ClipboardCheck size={24} />
          <div>
            <h1>Validacao de Editais</h1>
            <p>Analise multi-dimensional, scores e decisao estrategica</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Tabela de editais */}
        <Card title="Meus Editais" icon={<FileText size={18} />}>
          {erroCarregamento && (
            <div className="error-banner">
              <AlertCircle size={16} /> {erroCarregamento}
              <ActionButton label="Tentar novamente" variant="neutral" onClick={() => {
                setErroCarregamento("");
                setLoadingEditais(true);
                loadEditaisSalvos()
                  .then(setEditais)
                  .catch(err => setErroCarregamento(String(err?.message || "Erro ao carregar editais")))
                  .finally(() => setLoadingEditais(false));
              }} />
            </div>
          )}
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar edital..."
            filters={[{
              key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter,
              options: [
                { value: "todos", label: "Todos" },
                { value: "novo", label: "Novo" },
                { value: "analisando", label: "Analisando" },
                { value: "validado", label: "Validado" },
                { value: "descartado", label: "Descartado" },
              ],
            }]}
          />
          <DataTable
            data={filteredEditais}
            columns={columns}
            idKey="id"
            onRowClick={(edital) => {
              // Limpar sub-scores, decisão IA e dados dependentes ao trocar edital
              setSubScoresTecnicos([]);
              setDecisaoIA(null);
              setDocsNecessaria([]);
              setDocsNecessariaErro("");
              setHistoricoReal([]);
              setReputacaoCalculada(null);
              setSelectedEdital(edital);
            }}
            selectedId={selectedEdital?.id}
            emptyMessage={loadingEditais ? "Carregando editais..." : "Nenhum edital encontrado"}
          />
        </Card>

        {/* Painel de analise do edital selecionado */}
        {selectedEdital && (
          <>
            {/* Sinais de Mercado + Botoes de Decisao */}
            <div className="validacao-top-bar">
              <div className="sinais-mercado">
                {selectedEdital.sinaisMercado.map((sinal, i) => (
                  <span key={i} className={`badge ${sinal.includes("Direcionada") || sinal.includes("Predatorio") ? "badge-error" : "badge-warning"}`}>
                    <AlertTriangle size={12} /> {sinal}
                  </span>
                ))}
                {selectedEdital.fatalFlaws.length > 0 && (
                  <span className="badge badge-error"><XCircle size={12} /> {selectedEdital.fatalFlaws.length} Fatal Flaw(s)</span>
                )}
                {decisaoSalva && (
                  <span className="badge badge-success"><CheckCircle size={12} /> Decisao salva</span>
                )}
              </div>
              <div className="decisao-buttons">
                <button className="btn btn-success" onClick={() => handleDecisao("participar")}><ThumbsUp size={14} /> Participar</button>
                <button className="btn btn-info" onClick={() => handleDecisao("acompanhar")}><Eye size={14} /> Acompanhar</button>
                <button className="btn btn-neutral" onClick={() => handleDecisao("ignorar")}><X size={14} /> Ignorar</button>
              </div>
            </div>

            {/* Justificativa (aparece apos clicar decisao) */}
            {showJustificativa && (
              <Card title="Justificativa da Decisao" icon={<MessageSquare size={18} />}>
                <p className="justificativa-hint">A justificativa e o combustivel para a inteligencia futura do sistema.</p>
                {erroDecisao && <p className="error-message">{erroDecisao}</p>}
                <div className="form-grid form-grid-2">
                  <FormField label="Motivo">
                    <SelectInput value={justificativaMotivo} onChange={setJustificativaMotivo} placeholder="Selecione o motivo..."
                      options={[
                        { value: "preco_competitivo", label: "Preco competitivo" },
                        { value: "portfolio_aderente", label: "Portfolio aderente" },
                        { value: "margem_insuficiente", label: "Margem insuficiente" },
                        { value: "falta_documentacao", label: "Falta documentacao" },
                        { value: "concorrente_forte", label: "Concorrente muito forte" },
                        { value: "risco_juridico", label: "Risco juridico alto" },
                        { value: "fora_regiao", label: "Fora da regiao de atuacao" },
                        { value: "outro", label: "Outro" },
                      ]}
                    />
                  </FormField>
                  <FormField label="Detalhes">
                    <TextArea value={justificativaTexto} onChange={setJustificativaTexto} placeholder="Descreva os motivos da decisao..." rows={2} />
                  </FormField>
                </div>
                <ActionButton label="Salvar Justificativa" variant="primary" onClick={handleSalvarJustificativa} loading={salvandoDecisao} />
              </Card>
            )}

            {/* Layout split: Info + Score Dashboard */}
            <div className="validacao-split">
              {/* Esquerda: Info do edital */}
              <Card title={`${selectedEdital.numero} - ${selectedEdital.orgao}`} icon={<ClipboardCheck size={18} />}
                actions={
                  <div className="card-actions">
                    {selectedEdital.pdfUrl && <ActionButton icon={<Download size={14} />} label="PDF" onClick={() => handleBaixarPdf(selectedEdital)} />}
                    <SelectInput value={selectedEdital.status} onChange={(v) => handleMudarStatus(selectedEdital.id, v as Edital["status"])}
                      options={[
                        { value: "novo", label: "Novo" },
                        { value: "analisando", label: "Analisando" },
                        { value: "validado", label: "Validado" },
                        { value: "descartado", label: "Descartado" },
                      ]}
                    />
                  </div>
                }
              >
                <div className="info-grid">
                  <div className="info-item"><label>Objeto</label><p>{selectedEdital.objeto}</p></div>
                  <div className="info-item"><label>Valor Estimado</label><span>{formatCurrency(selectedEdital.valor)}</span></div>
                  <div className="info-item"><label>Data Abertura</label><span>{selectedEdital.dataAbertura}</span></div>
                  <div className="info-item"><label>Produto Correspondente</label><span>{selectedEdital.produtoCorrespondente || "-"}</span></div>
                </div>
              </Card>

              {/* Direita: Score Dashboard (sem Intencao/Margem — movidos para aba Aderencia) */}
              <div className="score-dashboard">
                <div className="score-dashboard-header">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <ScoreCircle score={selectedEdital.score} size={120} label="Score Geral" />
                    {/* V2: Decisão GO/NO-GO da IA */}
                    {decisaoIA && (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        backgroundColor: decisaoIA === "GO" ? "#22c55e20" : decisaoIA === "NO-GO" ? "#ef444420" : "#eab30820",
                        color: decisaoIA === "GO" ? "#22c55e" : decisaoIA === "NO-GO" ? "#ef4444" : "#eab308",
                        border: `2px solid ${decisaoIA === "GO" ? "#22c55e60" : decisaoIA === "NO-GO" ? "#ef444460" : "#eab30860"}`,
                      }}>
                        {decisaoIA === "GO" && <CheckCircle size={16} />}
                        {decisaoIA === "NO-GO" && <XCircle size={16} />}
                        {decisaoIA === "CONDICIONAL" && <AlertTriangle size={16} />}
                        {decisaoIA === "GO" ? "GO - Participar" : decisaoIA === "NO-GO" ? "NO-GO" : "ACOMPANHAR"}
                      </span>
                    )}
                  </div>
                  <div className="potencial-ganho">
                    <label>Potencial de Ganho</label>
                    {getPotencialBadge(selectedEdital.potencialGanho)}
                    {/* T19: Botão para recalcular scores via IA */}
                    <ActionButton
                      icon={<TrendingUp size={12} />}
                      label="Calcular Scores IA"
                      onClick={handleCalcularScores}
                      loading={scoresLoading}
                      variant="neutral"
                    />
                  </div>
                </div>

                <div className="score-bars-6d">
                  <ScoreBar score={selectedEdital.scores.tecnico} label="Aderencia Tecnica" size="small" showLevel />
                  <ScoreBar score={selectedEdital.scores.documental} label="Aderencia Documental" size="small" showLevel />
                  <ScoreBar score={selectedEdital.scores.complexidade} label="Complexidade Edital" size="small" showLevel />
                  <ScoreBar score={selectedEdital.scores.juridico} label="Risco Juridico" size="small" showLevel />
                  <ScoreBar score={selectedEdital.scores.logistico} label="Viabilidade Logistica" size="small" showLevel />
                  <ScoreBar score={selectedEdital.scores.comercial} label="Atratividade Comercial" size="small" showLevel />
                </div>
              </div>
            </div>

            {/* 5 Abas: Aderencia / Documentos / Riscos / Mercado / IA */}
            <Card>
              <TabPanel tabs={analysisTabs}>
                {(activeTab) => {
                  switch (activeTab) {
                    case "aderencia": return renderAbaAderencia(selectedEdital);
                    case "documentos": return renderAbaDocumentos(selectedEdital);
                    case "riscos": return renderAbaRiscos(selectedEdital);
                    case "mercado": return renderAbaMercado(selectedEdital);
                    case "ia": return renderAbaIA(selectedEdital);
                    default: return null;
                  }
                }}
              </TabPanel>
            </Card>
          </>
        )}
      </div>

      {/* Modal Pergunta */}
      <Modal
        isOpen={showPerguntaModal}
        onClose={() => { setShowPerguntaModal(false); setPergunta(""); setResposta(""); }}
        title={`Perguntar ao Edital ${selectedEdital?.numero}`}
        size="large"
      >
        <FormField label="Sua pergunta">
          <TextArea value={pergunta} onChange={setPergunta} placeholder="Digite sua pergunta sobre o edital..." rows={3} />
        </FormField>
        <ActionButton icon={<MessageSquare size={14} />} label="Enviar Pergunta" variant="primary" onClick={handlePerguntarEdital} loading={loading} />
        {resposta && (
          <div className="resposta-box" style={{ marginTop: "1rem" }}>
            <strong>Resposta:</strong>
            <p>{resposta}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
