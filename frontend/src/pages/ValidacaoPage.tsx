import { useState } from "react";
import {
  ClipboardCheck, Eye, Download, MessageSquare, FileText, CheckCircle, XCircle, Clock,
  AlertTriangle, Shield, TrendingUp, Target, ThumbsUp, Pause, X, Sparkles, Building,
  AlertCircle, Scale, MapPin, Truck
} from "lucide-react";
import {
  Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, TextArea,
  SelectInput, ScoreBadge, ScoreBar, ScoreCircle, StatusBadge, TabPanel, RadioGroup
} from "../components/common";
import type { Column } from "../components/common";

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
}

// === DADOS MOCK ===

const mockEditais: Edital[] = [
  {
    id: "1", numero: "PE-001/2026", orgao: "UFMG", uf: "MG",
    objeto: "Aquisicao de microscopios opticos para laboratorio de biologia",
    valor: 150000, dataAbertura: "15/02/2026", status: "novo", score: 82,
    scores: { tecnico: 90, documental: 65, complexidade: 35, juridico: 60, logistico: 85, comercial: 95 },
    potencialGanho: "elevado", intencaoEstrategica: "estrategico", margemExpectativa: 15,
    sinaisMercado: ["Concorrente Dominante Identificado"],
    fatalFlaws: [],
    flagsJuridicos: ["Sinalizacao de aglutinacao indevida de itens"],
    certificacoes: [
      { nome: "Registro ANVISA", status: "ok" },
      { nome: "Certificado ISO 9001", status: "ok" },
      { nome: "Laudo Tecnico INMETRO", status: "pendente" },
    ],
    checklistDocumental: [
      { documento: "Certidao Negativa Federal", status: "ok", validade: "15/08/2026" },
      { documento: "Atestado Capacidade Tecnica", status: "ok" },
      { documento: "Balanco Patrimonial", status: "ajustavel", validade: "31/12/2025" },
      { documento: "Certidao FGTS", status: "vencido", validade: "01/01/2026" },
      { documento: "AFE", status: "ok", validade: "20/12/2026" },
    ],
    analiseLote: [
      { item: "Microscopio Optico Binocular", tipo: "aderente" },
      { item: "Microscopio Trinocular", tipo: "aderente" },
      { item: "Laminas preparadas (kit 100)", tipo: "aderente" },
      { item: "Oleo de imersao", tipo: "aderente" },
      { item: "Camera digital p/ microscopio", tipo: "aderente" },
      { item: "Lupa estereoscopica", tipo: "aderente" },
      { item: "Balanca analitica 0.001g", tipo: "intruso" },
      { item: "Centrifuga micro", tipo: "intruso" },
    ],
    aderenciaTrechos: [
      { trechoEdital: "Microscopio binocular com aumento de 40x a 1000x, iluminacao LED", aderencia: 95, trechoPortfolio: "ABC-500: Aumento 40x-1000x, LED, binocular" },
      { trechoEdital: "Deve possuir platina mecanica com movimentos X-Y", aderencia: 90, trechoPortfolio: "ABC-500: Platina mecanica XY com trava" },
      { trechoEdital: "Garantia minima de 24 meses com assistencia no local", aderencia: 70, trechoPortfolio: "Garantia 12 meses, assistencia remota" },
      { trechoEdital: "Compativel com camera digital acoplavel", aderencia: 85, trechoPortfolio: "ABC-500: Saida trinocular para camera (opcional)" },
      { trechoEdital: "Certificacao INMETRO obrigatoria", aderencia: 50, trechoPortfolio: "Laudo INMETRO em andamento" },
    ],
    reputacaoOrgao: { pregoeiro: "Rigoroso - exige documentacao completa", pagador: "Bom pagador - media 30 dias", historico: "2 editais anteriores sem problemas" },
    historicoSemelhante: [
      { nome: "PE-088/2023 UFMG - Microscopios", resultado: "vencida", motivo: "Melhor preco" },
      { nome: "PE-045/2024 UFOP - Equipamentos Lab", resultado: "perdida", motivo: "Preco 8% acima do vencedor" },
      { nome: "CC-012/2022 Pref BH - Material Lab", resultado: "cancelada", motivo: "Edital cancelado pelo orgao" },
    ],
    resumo: "Edital para aquisicao de microscopios opticos para laboratorio de biologia. Prazo de entrega 30 dias. Garantia minima 24 meses. 8 itens no lote.",
    pdfUrl: "/docs/pe001.pdf",
    produtoCorrespondente: "Microscopio ABC-500",
  },
  {
    id: "2", numero: "PE-045/2026", orgao: "CEMIG", uf: "MG",
    objeto: "Equipamentos de laboratorio para analises quimicas",
    valor: 89000, dataAbertura: "20/02/2026", status: "validado", score: 88,
    scores: { tecnico: 85, documental: 80, complexidade: 45, juridico: 75, logistico: 90, comercial: 88 },
    potencialGanho: "elevado", intencaoEstrategica: "estrategico", margemExpectativa: 12,
    sinaisMercado: [],
    fatalFlaws: [],
    flagsJuridicos: [],
    certificacoes: [
      { nome: "Registro ANVISA", status: "ok" },
      { nome: "ISO 9001", status: "ok" },
    ],
    checklistDocumental: [
      { documento: "Certidao Negativa Federal", status: "ok", validade: "15/08/2026" },
      { documento: "Atestado Capacidade Tecnica", status: "ok" },
      { documento: "Balanco Patrimonial", status: "ok", validade: "31/12/2025" },
    ],
    analiseLote: [
      { item: "Espectrofotometro UV-Vis", tipo: "aderente" },
      { item: "Banho maria digital", tipo: "aderente" },
      { item: "Agitador magnetico", tipo: "aderente" },
    ],
    aderenciaTrechos: [
      { trechoEdital: "Espectrofotometro com faixa 190-1100nm", aderencia: 92, trechoPortfolio: "UV-2000: 190-1100nm, duplo feixe" },
      { trechoEdital: "Banho maria com controle digital de temperatura", aderencia: 88, trechoPortfolio: "BM-D10: Digital, 5-100C, 10L" },
    ],
    reputacaoOrgao: { pregoeiro: "Moderado", pagador: "Regular - media 45 dias", historico: "Primeira participacao" },
    historicoSemelhante: [],
    pdfUrl: "/docs/pe045.pdf",
    produtoCorrespondente: "Espectrofotometro UV-2000",
  },
  {
    id: "3", numero: "CC-012/2026", orgao: "Pref. BH", uf: "MG",
    objeto: "Material de laboratorio e reagentes diversos",
    valor: 320000, dataAbertura: "25/02/2026", status: "analisando", score: 65,
    scores: { tecnico: 70, documental: 55, complexidade: 60, juridico: 40, logistico: 75, comercial: 60 },
    potencialGanho: "medio", intencaoEstrategica: "acompanhamento", margemExpectativa: 8,
    sinaisMercado: ["Suspeita de Licitacao Direcionada", "Preco Referencia Abaixo do Mercado"],
    fatalFlaws: ["Certificacao CBPP obrigatoria - documento NAO cadastrado"],
    flagsJuridicos: ["Restricao regional - exige sede no municipio", "Sinalizacao de aglutinacao indevida de itens"],
    certificacoes: [
      { nome: "Registro ANVISA", status: "ok" },
      { nome: "CBPP", status: "pendente" },
      { nome: "ISO 17025", status: "pendente" },
    ],
    checklistDocumental: [
      { documento: "Certidao Negativa Federal", status: "ok", validade: "15/08/2026" },
      { documento: "CBPP", status: "faltando" },
      { documento: "Atestado Capacidade Tecnica", status: "faltando" },
    ],
    analiseLote: [
      { item: "Reagente A", tipo: "aderente" },
      { item: "Reagente B", tipo: "aderente" },
      { item: "Reagente C", tipo: "aderente" },
      { item: "Vidraria diversa", tipo: "intruso" },
      { item: "Equipamento de protecao", tipo: "intruso" },
    ],
    aderenciaTrechos: [
      { trechoEdital: "Reagentes para analise bioquimica com registro ANVISA", aderencia: 80, trechoPortfolio: "Kit BioQuim: Registro ANVISA 123456" },
      { trechoEdital: "Prazo entrega 15 dias corridos", aderencia: 45, trechoPortfolio: "Prazo padrao: 30 dias" },
    ],
    reputacaoOrgao: { pregoeiro: "Muito rigoroso - historico de impugnacoes", pagador: "Pagamento atrasado - media 60 dias", historico: "3 editais anteriores, 1 com problema de pagamento" },
    historicoSemelhante: [
      { nome: "CC-005/2024 Pref BH - Reagentes", resultado: "perdida", motivo: "Margem insuficiente" },
      { nome: "CC-018/2023 Pref BH - Material Lab", resultado: "perdida", motivo: "Falta de documentacao" },
    ],
    pdfUrl: "/docs/cc012.pdf",
    produtoCorrespondente: "Kit Reagentes BioQuim",
  },
  {
    id: "4", numero: "PE-088/2026", orgao: "USP", uf: "SP",
    objeto: "Reagentes para diagnostico laboratorial",
    valor: 75000, dataAbertura: "18/02/2026", status: "descartado", score: 35,
    scores: { tecnico: 40, documental: 30, complexidade: 70, juridico: 25, logistico: 30, comercial: 35 },
    potencialGanho: "baixo", intencaoEstrategica: "aprendizado", margemExpectativa: 5,
    sinaisMercado: ["Concorrente Dominante Identificado", "Preco Predatorio Detectado"],
    fatalFlaws: ["Exige laboratorio proprio no estado de SP - nao possuimos", "Certificacao ISO 17025 obrigatoria - nao possuimos"],
    flagsJuridicos: ["Restricao regional explicita - sede em SP"],
    certificacoes: [
      { nome: "ISO 17025", status: "pendente" },
      { nome: "Laboratorio SP", status: "pendente" },
    ],
    checklistDocumental: [
      { documento: "Certidao Negativa Federal", status: "ok", validade: "15/08/2026" },
      { documento: "ISO 17025", status: "faltando" },
    ],
    analiseLote: [
      { item: "Reagente Diagnostico HIV", tipo: "aderente" },
      { item: "Reagente Diagnostico Hepatite", tipo: "aderente" },
      { item: "Equipamento ELISA", tipo: "intruso" },
    ],
    aderenciaTrechos: [
      { trechoEdital: "Reagentes com validacao clinica e registro ANVISA", aderencia: 60, trechoPortfolio: "Registro ANVISA parcial" },
    ],
    reputacaoOrgao: { pregoeiro: "Padrao", pagador: "Excelente - media 15 dias", historico: "Sem historico" },
    historicoSemelhante: [],
  },
  {
    id: "5", numero: "DP-003/2026", orgao: "UFOP", uf: "MG",
    objeto: "Centrifuga de bancada refrigerada",
    valor: 45000, dataAbertura: "10/02/2026", status: "novo", score: 78,
    scores: { tecnico: 85, documental: 70, complexidade: 30, juridico: 80, logistico: 80, comercial: 75 },
    potencialGanho: "medio", intencaoEstrategica: "defensivo", margemExpectativa: 10,
    sinaisMercado: [],
    fatalFlaws: [],
    flagsJuridicos: [],
    certificacoes: [
      { nome: "Registro ANVISA", status: "ok" },
      { nome: "ISO 9001", status: "ok" },
    ],
    checklistDocumental: [
      { documento: "Certidao Negativa Federal", status: "ok", validade: "15/08/2026" },
      { documento: "Atestado Capacidade Tecnica", status: "ok" },
    ],
    analiseLote: [
      { item: "Centrifuga refrigerada 15000rpm", tipo: "aderente" },
      { item: "Rotor angular 24x1.5mL", tipo: "aderente" },
    ],
    aderenciaTrechos: [
      { trechoEdital: "Centrifuga refrigerada -20C a +40C, 15000rpm", aderencia: 90, trechoPortfolio: "XYZ-2000: -20 a +40C, 15000rpm" },
      { trechoEdital: "Rotor angular para 24 tubos de 1.5mL", aderencia: 95, trechoPortfolio: "Rotor R-24: 24x1.5mL angular" },
    ],
    reputacaoOrgao: { pregoeiro: "Flexivel", pagador: "Bom - media 30 dias", historico: "1 edital anterior vencido" },
    historicoSemelhante: [
      { nome: "PE-010/2024 UFOP - Centrifuga", resultado: "vencida", motivo: "Melhor proposta tecnica" },
    ],
    pdfUrl: "/docs/dp003.pdf",
    produtoCorrespondente: "Centrifuga XYZ-2000",
  },
];

// === COMPONENTE PRINCIPAL ===

export function ValidacaoPage() {
  const [editais, setEditais] = useState<Edital[]>(mockEditais);
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

  const filteredEditais = editais.filter((e) => {
    const matchSearch = e.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.objeto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todos" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleResumirEdital = async () => {
    if (!selectedEdital) return;
    setResumoLoading(true);
    setTimeout(() => {
      setEditais(editais.map(e =>
        e.id === selectedEdital.id
          ? { ...e, resumo: "Este edital visa a aquisicao de equipamentos laboratoriais de alta precisao. O prazo de entrega e de 30 dias apos a homologacao. Exige-se garantia minima de 24 meses e assistencia tecnica no local." }
          : e
      ));
      setSelectedEdital(prev => prev ? { ...prev, resumo: "Este edital visa a aquisicao de equipamentos laboratoriais de alta precisao..." } : null);
      setResumoLoading(false);
    }, 2000);
  };

  const handlePerguntarEdital = async () => {
    if (!selectedEdital || !pergunta) return;
    setLoading(true);
    setTimeout(() => {
      setResposta("Com base no edital " + selectedEdital.numero + ", o prazo de entrega e de 30 dias corridos apos a emissao da ordem de compra. Fonte: Item 8.2 do edital.");
      setLoading(false);
    }, 1500);
  };

  const handleBaixarPdf = (edital: Edital) => {
    if (edital.pdfUrl) window.open(edital.pdfUrl, "_blank");
  };

  const handleMudarStatus = (editalId: string, novoStatus: Edital["status"]) => {
    setEditais(editais.map(e =>
      e.id === editalId ? { ...e, status: novoStatus } : e
    ));
    if (selectedEdital?.id === editalId) {
      setSelectedEdital(prev => prev ? { ...prev, status: novoStatus } : null);
    }
  };

  const handleDecisao = (decisao: "participar" | "acompanhar" | "ignorar") => {
    if (!selectedEdital) return;
    const statusMap = { participar: "validado" as const, acompanhar: "analisando" as const, ignorar: "descartado" as const };
    handleMudarStatus(selectedEdital.id, statusMap[decisao]);
    setShowJustificativa(true);
  };

  const handleIntencaoChange = (valor: string) => {
    if (!selectedEdital) return;
    setEditais(editais.map(e =>
      e.id === selectedEdital.id ? { ...e, intencaoEstrategica: valor as Edital["intencaoEstrategica"] } : e
    ));
    setSelectedEdital(prev => prev ? { ...prev, intencaoEstrategica: valor as Edital["intencaoEstrategica"] } : null);
  };

  const handleMargemChange = (valor: number) => {
    if (!selectedEdital) return;
    setEditais(editais.map(e =>
      e.id === selectedEdital.id ? { ...e, margemExpectativa: valor } : e
    ));
    setSelectedEdital(prev => prev ? { ...prev, margemExpectativa: valor } : null);
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
      {/* Aderencia Tecnica Detalhada */}
      <div className="section-block">
        <h4><Target size={16} /> Aderencia Tecnica Detalhada</h4>
        <div className="sub-scores-grid">
          <ScoreBar score={95} label="Hardware" size="small" />
          <ScoreBar score={75} label="Alertas" size="small" />
          <ScoreBar score={80} label="Integracao" size="small" />
          <ScoreBar score={65} label="Servimento" size="small" />
          <ScoreBar score={70} label="Permanencia" size="small" />
        </div>
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
          <p className="resumo-text">{edital.resumo}</p>
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
          <DataTable data={filteredEditais} columns={columns} idKey="id" onRowClick={setSelectedEdital} selectedId={selectedEdital?.id} emptyMessage="Nenhum edital encontrado" />
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
                <ActionButton label="Salvar Justificativa" variant="primary" onClick={() => setShowJustificativa(false)} />
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
