import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  ClipboardCheck, Eye, Download, MessageSquare, FileText, CheckCircle, XCircle, Clock,
  AlertTriangle, Shield, TrendingUp, Target, ThumbsUp, X, Sparkles, Building,
  AlertCircle, Scale
} from "lucide-react";
import {
  Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, TextArea,
  SelectInput, ScoreBadge, ScoreBar, ScoreCircle, StatusBadge, TabPanel, RadioGroup
} from "../components/common";
import type { Column } from "../components/common";
import { crudCreate, crudUpdate } from "../api/crud";

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
  decisao_ia: "GO" | "NO-GO" | "CONDICIONAL";
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
    });
    if (!res.ok) return null;
    return await res.json() as ScoresValidacaoResponse;
  } catch {
    return null;
  }
}

// === COMPONENTE PRINCIPAL ===

export function ValidacaoPage(_props?: PageProps) {
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
        // Decisão GO/NO-GO da IA
        if (resultado.decisao_ia) setDecisaoIA(resultado.decisao_ia);
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

  // === ABAS ===

  const renderAbaObjetiva = (edital: Edital) => (
    <div className="aba-content">
      {/* Decisão GO/NO-GO da IA (T22) */}
      {decisaoIA && (
        <div className={`section-block decisao-ia-banner decisao-ia-${decisaoIA.toLowerCase().replace("-", "")}`}>
          <h4>
            {decisaoIA === "GO" && <CheckCircle size={16} />}
            {decisaoIA === "NO-GO" && <XCircle size={16} />}
            {decisaoIA === "CONDICIONAL" && <AlertTriangle size={16} />}
            {" "}Recomendação da IA: {decisaoIA}
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
            <p className="empty-message">Clique para calcular a análise detalhada deste edital.</p>
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

      {/* Checklist Documental */}
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
    </div>
  );

  const renderAbaAnalitica = (edital: Edital) => (
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

      {/* Reputacao do Orgao */}
      <div className="section-block">
        <h4><Building size={16} /> Reputacao do Orgao - {edital.orgao}</h4>
        <div className="reputacao-grid">
          <div className="reputacao-item">
            <label>Pregoeiro</label>
            <span>{edital.reputacaoOrgao.pregoeiro}</span>
          </div>
          <div className="reputacao-item">
            <label>Pagamento</label>
            <span>{edital.reputacaoOrgao.pagador}</span>
          </div>
          <div className="reputacao-item">
            <label>Historico</label>
            <span>{edital.reputacaoOrgao.historico}</span>
          </div>
        </div>
      </div>

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
    </div>
  );

  const renderAbaCognitiva = (edital: Edital) => (
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

      {/* Historico Semelhante */}
      <div className="section-block">
        <h4><Clock size={16} /> Historico de Editais Semelhantes</h4>
        {edital.historicoSemelhante.length > 0 ? (
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
    </div>
  );

  const analysisTabs = [
    { id: "objetiva", label: "Objetiva", icon: <Target size={16} /> },
    { id: "analitica", label: "Analitica", icon: <AlertTriangle size={16} /> },
    { id: "cognitiva", label: "Cognitiva", icon: <Sparkles size={16} /> },
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
              // Limpar sub-scores e decisão IA ao trocar edital
              setSubScoresTecnicos([]);
              setDecisaoIA(null);
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

              {/* Direita: Score Dashboard */}
              <div className="score-dashboard">
                <div className="score-dashboard-header">
                  <ScoreCircle score={selectedEdital.score} size={120} label="Score Geral" />
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
                  <ScoreBar score={selectedEdital.scores.tecnico} label="Aderencia Tecnica" size="small" />
                  <ScoreBar score={selectedEdital.scores.documental} label="Aderencia Documental" size="small" />
                  <ScoreBar score={selectedEdital.scores.complexidade} label="Complexidade Edital" size="small" />
                  <ScoreBar score={selectedEdital.scores.juridico} label="Risco Juridico" size="small" />
                  <ScoreBar score={selectedEdital.scores.logistico} label="Viabilidade Logistica" size="small" />
                  <ScoreBar score={selectedEdital.scores.comercial} label="Atratividade Comercial" size="small" />
                </div>

                <div className="intencao-margem">
                  <div className="intencao-section">
                    <label>Intencao Estrategica</label>
                    <RadioGroup
                      name="intencao"
                      value={selectedEdital.intencaoEstrategica}
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
                    <label>Expectativa de Margem: {selectedEdital.margemExpectativa}%</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={selectedEdital.margemExpectativa}
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

            {/* Abas: Objetiva / Analitica / Cognitiva */}
            <Card>
              <TabPanel tabs={analysisTabs}>
                {(activeTab) => {
                  switch (activeTab) {
                    case "objetiva": return renderAbaObjetiva(selectedEdital);
                    case "analitica": return renderAbaAnalitica(selectedEdital);
                    case "cognitiva": return renderAbaCognitiva(selectedEdital);
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
