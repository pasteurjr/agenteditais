import { useState } from "react";
import { Search, Save, Download, Eye, FileText, ExternalLink, Calendar, AlertTriangle, Sparkles, X } from "lucide-react";
import {
  Card, StatCard, DataTable, ActionButton, FormField, TextInput, Checkbox,
  SelectInput, ScoreCircle, ScoreBar, RadioGroup, StatusBadge,
} from "../components/common";
import type { Column } from "../components/common";

// --- Interfaces ---

interface EditalScores {
  tecnico: number;
  comercial: number;
  recomendacao: number;
}

interface GapItem {
  item: string;
  tipo: "atendido" | "parcial" | "nao_atendido";
}

interface EditalBusca {
  id: string;
  numero: string;
  orgao: string;
  uf: string;
  objeto: string;
  valor: number;
  dataAbertura: string;
  diasRestantes: number;
  score: number;
  scores: EditalScores;
  status: "aberto" | "encerrado";
  produtoCorrespondente: string | null;
  classificacaoTipo: string;
  classificacaoOrigem: string;
  potencialGanho: "elevado" | "medio" | "baixo";
  intencaoEstrategica: "estrategico" | "defensivo" | "acompanhamento" | "aprendizado";
  margemExpectativa: number;
  gaps: GapItem[];
  selected?: boolean;
}

// --- UFs brasileiras ---
const UFS = [
  { value: "todas", label: "Todas" },
  { value: "AC", label: "Acre" }, { value: "AL", label: "Alagoas" }, { value: "AP", label: "Amapa" },
  { value: "AM", label: "Amazonas" }, { value: "BA", label: "Bahia" }, { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" }, { value: "ES", label: "Espirito Santo" },
  { value: "GO", label: "Goias" }, { value: "MA", label: "Maranhao" }, { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" }, { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Para" }, { value: "PB", label: "Paraiba" }, { value: "PR", label: "Parana" },
  { value: "PE", label: "Pernambuco" }, { value: "PI", label: "Piaui" }, { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" }, { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondonia" }, { value: "RR", label: "Roraima" }, { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "Sao Paulo" }, { value: "SE", label: "Sergipe" }, { value: "TO", label: "Tocantins" },
];

// --- Dados mock ---
const mockResultados: EditalBusca[] = [
  {
    id: "1", numero: "PE-001/2026", orgao: "UFMG", uf: "MG",
    objeto: "Aquisicao de microscopios opticos para laboratorio de biologia",
    valor: 150000, dataAbertura: "15/02/2026", diasRestantes: 5, score: 92, status: "aberto",
    scores: { tecnico: 95, comercial: 88, recomendacao: 92 },
    produtoCorrespondente: "Microscopio Nikon Eclipse Ei",
    classificacaoTipo: "Equipamentos", classificacaoOrigem: "Universidade",
    potencialGanho: "elevado", intencaoEstrategica: "estrategico", margemExpectativa: 18,
    gaps: [
      { item: "Especificacao optica 40x-1000x", tipo: "atendido" },
      { item: "Camera acoplada 5MP", tipo: "atendido" },
      { item: "Software de analise de imagens", tipo: "parcial" },
    ],
  },
  {
    id: "2", numero: "PE-045/2026", orgao: "CEMIG", uf: "MG",
    objeto: "Equipamentos de laboratorio para analises quimicas",
    valor: 89000, dataAbertura: "20/02/2026", diasRestantes: 10, score: 88, status: "aberto",
    scores: { tecnico: 90, comercial: 85, recomendacao: 88 },
    produtoCorrespondente: "Espectrofotometro UV-VIS Shimadzu",
    classificacaoTipo: "Equipamentos", classificacaoOrigem: "Estadual",
    potencialGanho: "elevado", intencaoEstrategica: "estrategico", margemExpectativa: 15,
    gaps: [
      { item: "Faixa UV-VIS 190-1100nm", tipo: "atendido" },
      { item: "Certificado de calibracao RBC", tipo: "atendido" },
      { item: "Cubetas de quartzo incluidas", tipo: "nao_atendido" },
    ],
  },
  {
    id: "3", numero: "CC-012/2026", orgao: "Pref. BH", uf: "MG",
    objeto: "Material de laboratorio e reagentes para diagnostico",
    valor: 320000, dataAbertura: "25/02/2026", diasRestantes: 15, score: 65, status: "aberto",
    scores: { tecnico: 60, comercial: 72, recomendacao: 65 },
    produtoCorrespondente: "Kit Reagentes Diagnostico Labtest",
    classificacaoTipo: "Reagentes", classificacaoOrigem: "Municipal",
    potencialGanho: "medio", intencaoEstrategica: "defensivo", margemExpectativa: 12,
    gaps: [
      { item: "Reagentes para bioquimica", tipo: "atendido" },
      { item: "Reagentes para hematologia", tipo: "parcial" },
      { item: "Registro ANVISA vigente", tipo: "atendido" },
      { item: "Reagentes para imunologia", tipo: "nao_atendido" },
    ],
  },
  {
    id: "4", numero: "PE-088/2026", orgao: "USP", uf: "SP",
    objeto: "Reagentes para diagnostico molecular PCR",
    valor: 75000, dataAbertura: "18/02/2026", diasRestantes: 8, score: 58, status: "aberto",
    scores: { tecnico: 55, comercial: 62, recomendacao: 58 },
    produtoCorrespondente: null,
    classificacaoTipo: "Reagentes", classificacaoOrigem: "Universidade",
    potencialGanho: "baixo", intencaoEstrategica: "acompanhamento", margemExpectativa: 8,
    gaps: [
      { item: "Kit PCR real-time", tipo: "nao_atendido" },
      { item: "Primers customizados", tipo: "nao_atendido" },
      { item: "Mastermix SYBR Green", tipo: "parcial" },
    ],
  },
  {
    id: "5", numero: "DP-003/2026", orgao: "UFOP", uf: "MG",
    objeto: "Centrifuga de bancada refrigerada",
    valor: 45000, dataAbertura: "10/02/2026", diasRestantes: 0, score: 85, status: "encerrado",
    scores: { tecnico: 88, comercial: 80, recomendacao: 85 },
    produtoCorrespondente: "Centrifuga Eppendorf 5430R",
    classificacaoTipo: "Equipamentos", classificacaoOrigem: "Universidade",
    potencialGanho: "medio", intencaoEstrategica: "defensivo", margemExpectativa: 14,
    gaps: [
      { item: "Velocidade max 30.000 rpm", tipo: "atendido" },
      { item: "Refrigeracao -10 a 40C", tipo: "atendido" },
    ],
  },
  {
    id: "6", numero: "PE-110/2026", orgao: "LACEN-MG", uf: "MG",
    objeto: "Equipamento de comodato para automacao laboratorial",
    valor: 520000, dataAbertura: "12/02/2026", diasRestantes: 2, score: 78, status: "aberto",
    scores: { tecnico: 82, comercial: 70, recomendacao: 78 },
    produtoCorrespondente: "Automacao Roche Cobas c311",
    classificacaoTipo: "Comodato", classificacaoOrigem: "LACEN",
    potencialGanho: "elevado", intencaoEstrategica: "estrategico", margemExpectativa: 22,
    gaps: [
      { item: "Capacidade 200 testes/hora", tipo: "atendido" },
      { item: "Interface LIS/HCIS", tipo: "parcial" },
      { item: "Manutencao preventiva inclusa", tipo: "atendido" },
    ],
  },
  {
    id: "7", numero: "PE-200/2026", orgao: "Hospital de Clinicas UFPR", uf: "PR",
    objeto: "Oferta de preco para reagentes de hemoglobina glicada",
    valor: 180000, dataAbertura: "22/02/2026", diasRestantes: 12, score: 42, status: "aberto",
    scores: { tecnico: 40, comercial: 48, recomendacao: 42 },
    produtoCorrespondente: null,
    classificacaoTipo: "Oferta Preco", classificacaoOrigem: "Hospital",
    potencialGanho: "baixo", intencaoEstrategica: "aprendizado", margemExpectativa: 5,
    gaps: [
      { item: "Metodologia HPLC", tipo: "nao_atendido" },
      { item: "Calibradores rastreados NGSP", tipo: "nao_atendido" },
      { item: "Controles internos", tipo: "parcial" },
    ],
  },
];

// --- Contagens de prazos ---
function contarPrazos(editais: EditalBusca[]) {
  const abertos = editais.filter(e => e.status === "aberto");
  return {
    dias2: abertos.filter(e => e.diasRestantes <= 2 && e.diasRestantes > 0).length,
    dias5: abertos.filter(e => e.diasRestantes <= 5 && e.diasRestantes > 0).length,
    dias10: abertos.filter(e => e.diasRestantes <= 10 && e.diasRestantes > 0).length,
    dias20: abertos.filter(e => e.diasRestantes <= 20 && e.diasRestantes > 0).length,
  };
}

// --- Componente ---

export function CaptacaoPage() {
  const [termo, setTermo] = useState("");
  const [uf, setUf] = useState("todas");
  const [fonte, setFonte] = useState("pncp");
  const [classificacaoTipo, setClassificacaoTipo] = useState("todos");
  const [classificacaoOrigem, setClassificacaoOrigem] = useState("todos");
  const [calcularScore, setCalcularScore] = useState(true);
  const [incluirEncerrados, setIncluirEncerrados] = useState(false);

  const [resultados, setResultados] = useState<EditalBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [painelEdital, setPainelEdital] = useState<EditalBusca | null>(null);
  const [intencaoLocal, setIntencaoLocal] = useState("estrategico");
  const [margemLocal, setMargemLocal] = useState(15);

  const handleBuscar = async () => {
    setLoading(true);
    setTimeout(() => {
      let res = [...mockResultados];
      if (!incluirEncerrados) res = res.filter(e => e.status === "aberto");
      if (classificacaoTipo !== "todos") res = res.filter(e => e.classificacaoTipo === classificacaoTipo);
      if (classificacaoOrigem !== "todos") res = res.filter(e => e.classificacaoOrigem === classificacaoOrigem);
      if (uf !== "todas") res = res.filter(e => e.uf === uf);
      setResultados(res);
      setLoading(false);
    }, 1500);
  };

  const handleSalvarTodos = () => {
    console.log("Salvando todos os editais");
  };

  const handleSalvarRecomendados = () => {
    const recomendados = resultados.filter(e => e.score >= 70);
    console.log("Salvando recomendados:", recomendados.length);
  };

  const handleSalvarEdital = (edital: EditalBusca) => {
    console.log("Salvando edital:", edital.numero);
  };

  const handleAbrirPainel = (edital: EditalBusca) => {
    setPainelEdital(edital);
    setIntencaoLocal(edital.intencaoEstrategica);
    setMargemLocal(edital.margemExpectativa);
  };

  const handleToggleSelect = (id: string) => {
    setResultados(resultados.map(e =>
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getRowClass = (edital: EditalBusca) => {
    if (edital.score >= 80) return "row-score-high";
    if (edital.score >= 50) return "row-score-medium";
    return "row-score-low";
  };

  const getGapColor = (tipo: string) => {
    if (tipo === "atendido") return "success";
    if (tipo === "parcial") return "warning";
    return "error";
  };

  const getGapLabel = (tipo: string) => {
    if (tipo === "atendido") return "Atendido";
    if (tipo === "parcial") return "Parcial";
    return "Nao atendido";
  };

  const prazos = contarPrazos(resultados.length > 0 ? resultados : mockResultados);

  const columns: Column<EditalBusca>[] = [
    {
      key: "selected",
      header: "",
      width: "40px",
      render: (e) => (
        <input
          type="checkbox"
          checked={e.selected || false}
          onChange={() => handleToggleSelect(e.id)}
        />
      ),
    },
    { key: "numero", header: "Numero", sortable: true },
    { key: "orgao", header: "Orgao", sortable: true },
    { key: "uf", header: "UF", width: "50px" },
    {
      key: "objeto",
      header: "Objeto",
      render: (e) => (
        <span className="truncate" title={e.objeto}>
          {e.objeto.length > 45 ? e.objeto.substring(0, 45) + "..." : e.objeto}
        </span>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      render: (e) => formatCurrency(e.valor),
      sortable: true,
    },
    {
      key: "produtoCorrespondente",
      header: "Produto",
      render: (e) => e.produtoCorrespondente ? (
        <span className="produto-correspondente" title={e.produtoCorrespondente}>
          {e.produtoCorrespondente.length > 25 ? e.produtoCorrespondente.substring(0, 25) + "..." : e.produtoCorrespondente}
        </span>
      ) : (
        <span className="text-muted">—</span>
      ),
    },
    {
      key: "diasRestantes",
      header: "Prazo",
      width: "70px",
      render: (e) => {
        if (e.status === "encerrado") return <StatusBadge status="neutral" label="Encerrado" size="small" />;
        if (e.diasRestantes <= 2) return <StatusBadge status="error" label={`${e.diasRestantes}d`} size="small" />;
        if (e.diasRestantes <= 5) return <StatusBadge status="warning" label={`${e.diasRestantes}d`} size="small" />;
        return <span>{e.diasRestantes}d</span>;
      },
      sortable: true,
    },
    {
      key: "score",
      header: "Score",
      width: "70px",
      render: (e) => calcularScore ? (
        <div className="score-cell-tooltip" title={`Tec: ${e.scores.tecnico}% | Com: ${e.scores.comercial}% | Rec: ${e.scores.recomendacao}%`}>
          <ScoreCircle score={e.score} size={40} />
        </div>
      ) : <span>-</span>,
      sortable: true,
    },
    {
      key: "acoes",
      header: "Acoes",
      width: "80px",
      render: (e) => (
        <div className="table-actions">
          <button title="Ver detalhes" onClick={() => handleAbrirPainel(e)}><Eye size={16} /></button>
          <button title="Salvar edital" onClick={() => handleSalvarEdital(e)}><Save size={16} /></button>
        </div>
      ),
    },
  ];

  const selectedCount = resultados.filter(e => e.selected).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Search size={24} />
          <div>
            <h1>Captacao de Editais</h1>
            <p>Busca e captacao de novos editais</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Prazos de submissao */}
        <div className="stat-cards-grid">
          <StatCard
            icon={<AlertTriangle size={20} />}
            value={prazos.dias2}
            label="Proximos 2 dias"
            color="red"
          />
          <StatCard
            icon={<Calendar size={20} />}
            value={prazos.dias5}
            label="Proximos 5 dias"
            color="orange"
          />
          <StatCard
            icon={<Calendar size={20} />}
            value={prazos.dias10}
            label="Proximos 10 dias"
            color="yellow"
          />
          <StatCard
            icon={<Calendar size={20} />}
            value={prazos.dias20}
            label="Proximos 20 dias"
            color="blue"
          />
        </div>

        {/* Card de busca */}
        <Card title="Buscar Editais" icon={<Search size={18} />}>
          <div className="form-grid form-grid-4">
            <FormField label="Termo / Palavra-chave">
              <TextInput
                value={termo}
                onChange={setTermo}
                placeholder="Ex: microscopio, reagente..."
              />
            </FormField>
            <FormField label="UF">
              <SelectInput value={uf} onChange={setUf} options={UFS} />
            </FormField>
            <FormField label="Fonte">
              <SelectInput
                value={fonte}
                onChange={setFonte}
                options={[
                  { value: "pncp", label: "PNCP" },
                  { value: "comprasnet", label: "ComprasNET" },
                  { value: "bec", label: "BEC-SP" },
                  { value: "siconv", label: "SICONV" },
                  { value: "todas", label: "Todas as fontes" },
                ]}
              />
            </FormField>
            <div className="form-field-actions">
              <ActionButton
                icon={<Search size={16} />}
                label="Buscar Editais"
                variant="primary"
                onClick={handleBuscar}
                loading={loading}
              />
            </div>
          </div>

          <div className="form-grid form-grid-4" style={{ marginTop: "12px" }}>
            <FormField label="Classificacao Tipo">
              <SelectInput
                value={classificacaoTipo}
                onChange={setClassificacaoTipo}
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "Reagentes", label: "Reagentes" },
                  { value: "Equipamentos", label: "Equipamentos" },
                  { value: "Comodato", label: "Comodato" },
                  { value: "Aluguel", label: "Aluguel" },
                  { value: "Oferta Preco", label: "Oferta de Preco" },
                ]}
              />
            </FormField>
            <FormField label="Classificacao Origem">
              <SelectInput
                value={classificacaoOrigem}
                onChange={setClassificacaoOrigem}
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "Municipal", label: "Municipal" },
                  { value: "Estadual", label: "Estadual" },
                  { value: "Federal", label: "Federal" },
                  { value: "Universidade", label: "Universidade" },
                  { value: "Hospital", label: "Hospital" },
                  { value: "LACEN", label: "LACEN" },
                  { value: "Forca Armada", label: "Forca Armada" },
                  { value: "Autarquia", label: "Autarquia" },
                ]}
              />
            </FormField>
          </div>

          <div className="checkbox-inline">
            <Checkbox
              checked={calcularScore}
              onChange={setCalcularScore}
              label="Calcular score de aderencia (portfolio)"
            />
            <Checkbox
              checked={incluirEncerrados}
              onChange={setIncluirEncerrados}
              label="Incluir editais encerrados"
            />
          </div>
        </Card>

        {/* Resultados + Painel lateral */}
        {resultados.length > 0 && (
          <div className={`captacao-layout ${painelEdital ? "with-panel" : ""}`}>
            {/* Tabela de resultados */}
            <div className="captacao-table-area">
              <Card
                title={`Resultados (${resultados.length} editais encontrados)`}
                icon={<FileText size={18} />}
                actions={
                  <div className="card-actions">
                    <ActionButton icon={<Save size={14} />} label="Salvar Todos" onClick={handleSalvarTodos} />
                    <ActionButton icon={<Save size={14} />} label="Salvar Score >= 70%" onClick={handleSalvarRecomendados} />
                    <ActionButton icon={<Download size={14} />} label="Exportar CSV" onClick={() => {}} />
                  </div>
                }
              >
                {selectedCount > 0 && (
                  <div className="selection-bar">
                    <span>{selectedCount} edital(is) selecionado(s)</span>
                    <ActionButton label="Salvar Selecionados" onClick={() => {}} variant="primary" />
                  </div>
                )}

                <DataTable
                  data={resultados}
                  columns={columns}
                  idKey="id"
                  emptyMessage="Nenhum edital encontrado"
                  loading={loading}
                  rowClassName={(e) => getRowClass(e)}
                  onRowClick={(e) => handleAbrirPainel(e)}
                />
              </Card>
            </div>

            {/* Painel lateral de detalhes */}
            {painelEdital && (
              <div className="captacao-panel">
                <Card
                  title={painelEdital.numero}
                  subtitle={painelEdital.orgao}
                  actions={
                    <button className="btn-icon" onClick={() => setPainelEdital(null)} title="Fechar">
                      <X size={18} />
                    </button>
                  }
                >
                  {/* Score principal */}
                  <div className="panel-score-section">
                    <ScoreCircle score={painelEdital.score} size={100} label="Score Geral" />
                  </div>

                  {/* 3 sub-scores */}
                  <div className="panel-subscores">
                    <ScoreBar score={painelEdital.scores.tecnico} label="Tecnico" size="small" />
                    <ScoreBar score={painelEdital.scores.comercial} label="Comercial" size="small" />
                    <ScoreBar score={painelEdital.scores.recomendacao} label="Recomendacao" size="small" />
                  </div>

                  {/* Produto correspondente */}
                  <div className="panel-section">
                    <h4>Produto Correspondente</h4>
                    {painelEdital.produtoCorrespondente ? (
                      <div className="panel-produto">
                        <Sparkles size={14} />
                        <span>{painelEdital.produtoCorrespondente}</span>
                      </div>
                    ) : (
                      <p className="text-muted">Nenhum produto correspondente encontrado</p>
                    )}
                  </div>

                  {/* Potencial de Ganho */}
                  <div className="panel-section">
                    <h4>Potencial de Ganho</h4>
                    <StatusBadge
                      status={
                        painelEdital.potencialGanho === "elevado" ? "success" :
                        painelEdital.potencialGanho === "medio" ? "warning" : "error"
                      }
                      label={painelEdital.potencialGanho.charAt(0).toUpperCase() + painelEdital.potencialGanho.slice(1)}
                    />
                  </div>

                  {/* Intencao Estrategica */}
                  <div className="panel-section">
                    <h4>Intencao Estrategica</h4>
                    <RadioGroup
                      value={intencaoLocal}
                      onChange={setIntencaoLocal}
                      name="intencao-panel"
                      options={[
                        { value: "estrategico", label: "Estrategico" },
                        { value: "defensivo", label: "Defensivo" },
                        { value: "acompanhamento", label: "Acompanhamento" },
                        { value: "aprendizado", label: "Aprendizado" },
                      ]}
                    />
                  </div>

                  {/* Expectativa de Margem */}
                  <div className="panel-section">
                    <h4>Expectativa de Margem: {margemLocal}%</h4>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={margemLocal}
                      onChange={(e) => setMargemLocal(Number(e.target.value))}
                      className="slider-input"
                    />
                    <div className="slider-labels">
                      <span>0%</span>
                      <span className="text-muted">Varia por Produto / Regiao</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Analise de Gaps */}
                  <div className="panel-section">
                    <h4>Analise de Gaps</h4>
                    <div className="gaps-list">
                      {painelEdital.gaps.map((g, i) => (
                        <div key={i} className="gap-item">
                          <StatusBadge status={getGapColor(g.tipo) as "success" | "warning" | "error"} label={getGapLabel(g.tipo)} size="small" />
                          <span>{g.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="panel-section">
                    <div className="info-grid-compact">
                      <div className="info-item-compact">
                        <label>Valor</label>
                        <span>{formatCurrency(painelEdital.valor)}</span>
                      </div>
                      <div className="info-item-compact">
                        <label>Abertura</label>
                        <span>{painelEdital.dataAbertura}</span>
                      </div>
                      <div className="info-item-compact">
                        <label>Tipo</label>
                        <span>{painelEdital.classificacaoTipo}</span>
                      </div>
                      <div className="info-item-compact">
                        <label>Origem</label>
                        <span>{painelEdital.classificacaoOrigem}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acoes */}
                  <div className="panel-actions">
                    <ActionButton
                      icon={<Save size={14} />}
                      label="Salvar Edital"
                      variant="primary"
                      onClick={() => handleSalvarEdital(painelEdital)}
                    />
                    <ActionButton
                      icon={<ExternalLink size={14} />}
                      label="Abrir no PNCP"
                      onClick={() => {}}
                    />
                    <ActionButton
                      icon={<Download size={14} />}
                      label="Baixar PDF"
                      onClick={() => {}}
                    />
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Monitoramento automatico */}
        <Card title="Monitoramento Automatico" icon={<Eye size={18} />}>
          <div className="monitoramento-info">
            <p><strong>Palavras-chave ativas:</strong> microscopio, centrifuga, autoclave, reagente, espectrofotometro</p>
            <p><strong>NCMs monitorados:</strong> 9011.80.00, 9027.30.11, 3822.00.90</p>
            <p><strong>Ultima busca automatica:</strong> 10/02/2026 06:00</p>
            <p><strong>Novos encontrados:</strong> 3</p>
            <ActionButton label="Configurar Monitoria" onClick={() => {}} />
          </div>
        </Card>
      </div>
    </div>
  );
}
