import { useState, useEffect } from "react";
import type { PageProps } from "../types";
import { Search, Save, Download, Eye, FileText, ExternalLink, Calendar, AlertTriangle, Sparkles, X, CheckCircle } from "lucide-react";
import {
  Card, StatCard, DataTable, ActionButton, FormField, TextInput, Checkbox,
  SelectInput, ScoreCircle, ScoreBar, RadioGroup, StatusBadge,
} from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate } from "../api/crud";

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
  url?: string;
  fonte?: string;
  // IDs de registros salvos (para update)
  editalSalvoId?: string;
  estrategiaId?: string;
}

interface MonitoramentoInfo {
  id: string;
  termo: string;
  ativo: boolean;
  ultimo_check?: string;
  editais_encontrados?: number;
  ufs?: string[];
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

// --- Helpers ---

function calcularDiasRestantes(dataAbertura: string): number {
  if (!dataAbertura) return 0;
  try {
    // Tenta parsear tanto "DD/MM/YYYY" quanto "YYYY-MM-DD" ou ISO
    let data: Date;
    if (dataAbertura.includes("/")) {
      const [d, m, y] = dataAbertura.split("/").map(Number);
      data = new Date(y, m - 1, d);
    } else {
      data = new Date(dataAbertura);
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

function formatarDataBr(dataStr: string): string {
  if (!dataStr) return "—";
  try {
    if (dataStr.includes("/")) return dataStr;
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return dataStr;
    return data.toLocaleDateString("pt-BR");
  } catch {
    return dataStr;
  }
}

function inferirPotencialGanho(score: number): "elevado" | "medio" | "baixo" {
  if (score >= 80) return "elevado";
  if (score >= 50) return "medio";
  return "baixo";
}

// Mapeia dados do endpoint /api/editais/buscar para EditalBusca
function normalizarEditalDaBusca(e: Record<string, unknown>): EditalBusca {
  const score = Number(e.score_tecnico ?? 0);
  const dataAbertura = formatarDataBr(String(e.data_abertura ?? ""));
  const diasRestantes = calcularDiasRestantes(String(e.data_abertura ?? ""));

  // Extrair produto correspondente da lista de produtos aderentes
  const produtos = e.produtos_aderentes as string[] | undefined;
  const produtoCorrespondente = produtos && produtos.length > 0 ? produtos[0] : null;

  return {
    id: String(e.id ?? ""),
    numero: String(e.numero ?? "—"),
    orgao: String(e.orgao ?? "—"),
    uf: String(e.uf ?? "—"),
    objeto: String(e.objeto ?? "—"),
    valor: Number(e.valor_estimado ?? 0),
    dataAbertura,
    diasRestantes,
    score,
    scores: {
      tecnico: score,
      comercial: score,
      recomendacao: Number(e.recomendacao ?? score),
    },
    status: Boolean(e.encerrado) ? "encerrado" : (diasRestantes > 0 ? "aberto" : "encerrado"),
    produtoCorrespondente,
    classificacaoTipo: String(e.modalidade ?? "—"),
    classificacaoOrigem: String(e.fonte ?? "—"),
    potencialGanho: inferirPotencialGanho(score),
    intencaoEstrategica: "acompanhamento",
    margemExpectativa: 15,
    gaps: [],
    url: String(e.url ?? ""),
    fonte: String(e.fonte ?? ""),
  };
}

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

export function CaptacaoPage(_props?: PageProps) {
  const [termo, setTermo] = useState("");
  const [uf, setUf] = useState("todas");
  const [fonte, setFonte] = useState("pncp");
  const [classificacaoTipo, setClassificacaoTipo] = useState("todos");
  const [classificacaoOrigem, setClassificacaoOrigem] = useState("todos");
  const [calcularScore, setCalcularScore] = useState(true);
  const [incluirEncerrados, setIncluirEncerrados] = useState(false);

  const [resultados, setResultados] = useState<EditalBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [painelEdital, setPainelEdital] = useState<EditalBusca | null>(null);
  const [intencaoLocal, setIntencaoLocal] = useState("estrategico");
  const [margemLocal, setMargemLocal] = useState(15);
  const [salvandoEstrategia, setSalvandoEstrategia] = useState(false);
  const [estrategiaSalva, setEstrategiaSalva] = useState(false);

  const [monitoramentos, setMonitoramentos] = useState<MonitoramentoInfo[]>([]);
  const [loadingMonitoramentos, setLoadingMonitoramentos] = useState(false);

  // Carrega monitoramentos ao montar (T17)
  useEffect(() => {
    carregarMonitoramentos();
  }, []);

  const carregarMonitoramentos = async () => {
    setLoadingMonitoramentos(true);
    try {
      const res = await crudList("monitoramentos", { limit: 10 });
      const items = res.items as Record<string, unknown>[];
      setMonitoramentos(items.map(m => ({
        id: String(m.id ?? ""),
        termo: String(m.termo ?? ""),
        ativo: Boolean(m.ativo ?? true),
        ultimo_check: m.ultima_execucao ? formatarDataBr(String(m.ultima_execucao)) : undefined,
        editais_encontrados: Number(m.editais_encontrados ?? 0),
        ufs: m.ufs as string[] | undefined,
      })));
    } catch {
      // Silencioso - monitoramentos são opcionais
    } finally {
      setLoadingMonitoramentos(false);
    }
  };

  // T13: Busca real via REST
  const handleBuscar = async () => {
    if (!termo.trim()) {
      setErro("Informe um termo de busca");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      const params = new URLSearchParams({
        termo: termo.trim(),
        calcularScore: String(calcularScore),
        incluirEncerrados: String(incluirEncerrados),
        limite: "30",
      });
      if (uf !== "todas") params.append("uf", uf);
      if (fonte !== "todas") params.append("fontes", fonte);

      const res = await fetch(`/api/editais/buscar?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error || "Erro ao buscar editais");
      }

      const data = await res.json() as { success: boolean; editais?: Record<string, unknown>[]; error?: string };

      if (!data.success) {
        throw new Error(data.error || "Busca sem resultados");
      }

      let editais = (data.editais ?? []).map(normalizarEditalDaBusca);

      // Filtros client-side por tipo e origem (mapeados dos campos retornados)
      if (classificacaoTipo !== "todos") {
        editais = editais.filter(e => e.classificacaoTipo.toLowerCase() === classificacaoTipo.toLowerCase());
      }
      if (classificacaoOrigem !== "todos") {
        editais = editais.filter(e => e.classificacaoOrigem.toLowerCase() === classificacaoOrigem.toLowerCase());
      }

      setResultados(editais);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao buscar editais");
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  // T14: Salvar edital via CRUD
  const salvarEditalNoBanco = async (edital: EditalBusca): Promise<string | null> => {
    try {
      const payload: Record<string, unknown> = {
        numero: edital.numero,
        orgao: edital.orgao,
        orgao_tipo: edital.classificacaoOrigem,
        uf: edital.uf,
        objeto: edital.objeto,
        modalidade: edital.classificacaoTipo,
        valor_referencia: edital.valor || null,
        data_abertura: edital.dataAbertura || null,
        status: "novo",
        fonte: edital.fonte || "pncp",
        url: edital.url || null,
      };
      // Se já tem ID do backend, reutiliza (não duplica)
      if (edital.id && edital.id.length === 36) {
        // Edital já salvo no banco (UUID completo)
        return edital.id;
      }
      const criado = await crudCreate("editais", payload);
      return String(criado.id ?? "");
    } catch {
      return null;
    }
  };

  const handleSalvarEdital = async (edital: EditalBusca) => {
    const editalId = await salvarEditalNoBanco(edital);
    if (!editalId) {
      alert("Erro ao salvar edital");
      return;
    }
    // Atualiza ID local
    setResultados(prev => prev.map(e =>
      e.id === edital.id ? { ...e, editalSalvoId: editalId } : e
    ));
    if (painelEdital?.id === edital.id) {
      setPainelEdital(prev => prev ? { ...prev, editalSalvoId: editalId } : prev);
    }
  };

  const handleSalvarTodos = async () => {
    for (const edital of resultados) {
      await salvarEditalNoBanco(edital);
    }
    alert(`${resultados.length} edital(is) salvo(s)`);
  };

  const handleSalvarRecomendados = async () => {
    const recomendados = resultados.filter(e => e.score >= 70);
    for (const edital of recomendados) {
      await salvarEditalNoBanco(edital);
    }
    alert(`${recomendados.length} edital(is) recomendado(s) salvo(s)`);
  };

  // T15: Persistir intenção estratégica e margem
  const handleSalvarEstrategia = async () => {
    if (!painelEdital) return;
    setSalvandoEstrategia(true);
    setEstrategiaSalva(false);
    try {
      // Garante que o edital está salvo primeiro
      let editalId = painelEdital.editalSalvoId || (painelEdital.id.length === 36 ? painelEdital.id : null);
      if (!editalId) {
        editalId = await salvarEditalNoBanco(painelEdital);
      }
      if (!editalId) throw new Error("Não foi possível salvar o edital");

      // Mapa intenção -> decisao/prioridade do modelo
      const decisaoMap: Record<string, string> = {
        estrategico: "go",
        defensivo: "acompanhar",
        acompanhamento: "acompanhar",
        aprendizado: "nogo",
      };
      const prioridadeMap: Record<string, string> = {
        estrategico: "alta",
        defensivo: "media",
        acompanhamento: "baixa",
        aprendizado: "baixa",
      };

      const payload: Record<string, unknown> = {
        edital_id: editalId,
        decisao: decisaoMap[intencaoLocal] ?? "acompanhar",
        prioridade: prioridadeMap[intencaoLocal] ?? "media",
        margem_desejada: margemLocal,
        justificativa: `Intenção: ${intencaoLocal}`,
      };

      if (painelEdital.estrategiaId) {
        await crudUpdate("estrategias-editais", painelEdital.estrategiaId, payload);
      } else {
        const criada = await crudCreate("estrategias-editais", payload);
        const novoId = String(criada.id ?? "");
        setResultados(prev => prev.map(e =>
          e.id === painelEdital.id ? { ...e, estrategiaId: novoId, editalSalvoId: editalId ?? undefined } : e
        ));
        setPainelEdital(prev => prev ? { ...prev, estrategiaId: novoId, editalSalvoId: editalId ?? undefined } : prev);
      }
      setEstrategiaSalva(true);
      setTimeout(() => setEstrategiaSalva(false), 3000);
    } catch (e) {
      alert("Erro ao salvar estratégia: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSalvandoEstrategia(false);
    }
  };

  const handleAbrirPainel = (edital: EditalBusca) => {
    setPainelEdital(edital);
    setIntencaoLocal(edital.intencaoEstrategica);
    setMargemLocal(edital.margemExpectativa);
    setEstrategiaSalva(false);
  };

  const handleToggleSelect = (id: string) => {
    setResultados(resultados.map(e =>
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  // T16: Navegação para ValidacaoPage com edital_id
  const handleIrParaValidacao = (edital: EditalBusca) => {
    const editalId = edital.editalSalvoId || (edital.id.length === 36 ? edital.id : null);
    // Dispara evento customizado para o App.tsx capturar
    window.dispatchEvent(new CustomEvent("navigate-to", {
      detail: { page: "validacao", edital_id: editalId }
    }));
  };

  const formatCurrency = (value: number) => {
    if (!value) return "—";
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

  const prazos = contarPrazos(resultados.length > 0 ? resultados : []);

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

          {erro && (
            <div className="alert alert-error" style={{ marginTop: "12px" }}>
              {erro}
            </div>
          )}
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
                    <ActionButton
                      label="Salvar Selecionados"
                      onClick={async () => {
                        const selecionados = resultados.filter(e => e.selected);
                        for (const edital of selecionados) {
                          await salvarEditalNoBanco(edital);
                        }
                        alert(`${selecionados.length} edital(is) salvo(s)`);
                      }}
                      variant="primary"
                    />
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

                  {/* Intencao Estrategica - T15 */}
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

                  {/* Expectativa de Margem - T15 */}
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
                  {painelEdital.gaps.length > 0 && (
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
                  )}

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

                  {/* Feedback de estratégia salva */}
                  {estrategiaSalva && (
                    <div className="alert alert-success" style={{ marginBottom: "8px" }}>
                      <CheckCircle size={14} /> Estrategia salva com sucesso
                    </div>
                  )}

                  {/* Acoes */}
                  <div className="panel-actions">
                    <ActionButton
                      icon={<Save size={14} />}
                      label="Salvar Estrategia"
                      variant="primary"
                      onClick={handleSalvarEstrategia}
                      loading={salvandoEstrategia}
                    />
                    <ActionButton
                      icon={<Save size={14} />}
                      label="Salvar Edital"
                      onClick={() => handleSalvarEdital(painelEdital)}
                    />
                    <ActionButton
                      icon={<ExternalLink size={14} />}
                      label="Ir para Validacao"
                      onClick={() => handleIrParaValidacao(painelEdital)}
                    />
                    {painelEdital.url && (
                      <ActionButton
                        icon={<ExternalLink size={14} />}
                        label="Abrir no Portal"
                        onClick={() => window.open(painelEdital.url, "_blank")}
                      />
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Monitoramento automatico - T17 */}
        <Card title="Monitoramento Automatico" icon={<Eye size={18} />}>
          <div className="monitoramento-info">
            {loadingMonitoramentos ? (
              <p className="text-muted">Carregando monitoramentos...</p>
            ) : monitoramentos.length > 0 ? (
              <>
                <p><strong>Monitoramentos ativos:</strong> {monitoramentos.filter(m => m.ativo).length} de {monitoramentos.length}</p>
                <div style={{ marginTop: "8px" }}>
                  {monitoramentos.slice(0, 5).map(m => (
                    <div key={m.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <StatusBadge
                        status={m.ativo ? "success" : "neutral"}
                        label={m.ativo ? "Ativo" : "Inativo"}
                        size="small"
                      />
                      <span><strong>{m.termo}</strong></span>
                      {m.ufs && m.ufs.length > 0 && (
                        <span className="text-muted">({m.ufs.join(", ")})</span>
                      )}
                      {m.editais_encontrados !== undefined && (
                        <span className="text-muted">{m.editais_encontrados} encontrado(s)</span>
                      )}
                      {m.ultimo_check && (
                        <span className="text-muted">— ultimo: {m.ultimo_check}</span>
                      )}
                    </div>
                  ))}
                </div>
                {monitoramentos.length > 5 && (
                  <p className="text-muted" style={{ marginTop: "4px" }}>
                    +{monitoramentos.length - 5} monitoramento(s) adicionais
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-muted">Nenhum monitoramento configurado.</p>
                <p style={{ marginTop: "4px" }}>Configure via chat: <em>"Monitore editais de equipamentos laboratoriais no PNCP"</em></p>
              </>
            )}
            <div style={{ marginTop: "12px" }}>
              <ActionButton label="Atualizar" onClick={carregarMonitoramentos} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
