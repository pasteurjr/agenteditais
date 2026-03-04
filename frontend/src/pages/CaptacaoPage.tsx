import { useState, useEffect } from "react";
import type { PageProps } from "../types";
import { Search, Save, Download, Eye, FileText, ExternalLink, Calendar, AlertTriangle, Sparkles, X, CheckCircle, Plus, Pause, Trash2, Brain, DollarSign, History } from "lucide-react";
import {
  Card, StatCard, DataTable, ActionButton, FormField, TextInput, Checkbox,
  SelectInput, ScoreCircle, StarRating, RadioGroup, StatusBadge,
} from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate, crudDelete } from "../api/crud";

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
  tipoProdutoInferido: string;
  origemInferida: string;
  potencialGanho: "elevado" | "medio" | "baixo";
  intencaoEstrategica: "estrategico" | "defensivo" | "acompanhamento" | "aprendizado";
  margemExpectativa: number;
  gaps: GapItem[];
  selected?: boolean;
  url?: string;
  fonte?: string;
  orgaoTipo?: string;
  // IDs de registros salvos (para update)
  editalSalvoId?: string;
  estrategiaId?: string;
}

interface MonitoramentoInfo {
  id: string;
  termo: string;
  ncm?: string;
  fontes?: string[];
  ufs?: string[];
  incluir_encerrados?: boolean;
  valor_minimo?: number;
  valor_maximo?: number;
  frequencia_horas?: number;
  score_minimo_alerta?: number;
  ativo: boolean;
  ultimo_check?: string;
  editais_encontrados?: number;
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

// Mapa de estados vizinhos (adjacentes) para calculo de score comercial
const UF_VIZINHOS: Record<string, string[]> = {
  AC: ["AM", "RO"],
  AL: ["BA", "PE", "SE"],
  AP: ["PA"],
  AM: ["AC", "RO", "MT", "PA", "RR"],
  BA: ["AL", "SE", "PE", "PI", "TO", "GO", "MG", "ES"],
  CE: ["PI", "PE", "PB", "RN"],
  DF: ["GO", "MG"],
  ES: ["BA", "MG", "RJ"],
  GO: ["BA", "TO", "MT", "MS", "MG", "DF"],
  MA: ["PI", "TO", "PA"],
  MT: ["AM", "PA", "TO", "GO", "MS", "RO"],
  MS: ["MT", "GO", "MG", "SP", "PR"],
  MG: ["BA", "ES", "RJ", "SP", "MS", "GO", "DF"],
  PA: ["AM", "MT", "TO", "MA", "AP", "RR"],
  PB: ["PE", "RN", "CE"],
  PR: ["SP", "MS", "SC"],
  PE: ["AL", "BA", "PI", "CE", "PB"],
  PI: ["MA", "CE", "PE", "BA", "TO"],
  RJ: ["ES", "MG", "SP"],
  RN: ["CE", "PB"],
  RS: ["SC"],
  RO: ["AC", "AM", "MT"],
  RR: ["AM", "PA"],
  SC: ["PR", "RS"],
  SP: ["MG", "RJ", "MS", "PR"],
  SE: ["AL", "BA"],
  TO: ["MA", "PI", "BA", "GO", "MT", "PA"],
};

function calcularScoreComercial(ufEdital: string, estadosAtuacao: string[]): number {
  if (!ufEdital || estadosAtuacao.length === 0) return 20;
  const ufUpper = ufEdital.toUpperCase().trim();
  // UF esta nos estados de atuacao
  if (estadosAtuacao.some(u => u.toUpperCase().trim() === ufUpper)) return 100;
  // UF adjacente a algum estado de atuacao
  const vizinhos = new Set<string>();
  for (const uf of estadosAtuacao) {
    const adj = UF_VIZINHOS[uf.toUpperCase().trim()] || [];
    adj.forEach(v => vizinhos.add(v));
  }
  if (vizinhos.has(ufUpper)) return 60;
  // Fora da regiao
  return 20;
}

// Mapeia dados do endpoint /api/editais/buscar para EditalBusca
function normalizarEditalDaBusca(e: Record<string, unknown>, estadosAtuacao: string[]): EditalBusca {
  const scoreTecnico = Number(e.score_tecnico ?? 0);
  const dataAbertura = formatarDataBr(String(e.data_abertura ?? ""));
  // Usar data_encerramento para calcular prazo restante (é a data limite real).
  // Fallback para data_abertura se encerramento não existir.
  const dataParaPrazo = String(e.data_encerramento ?? e.data_abertura ?? "");
  const diasRestantes = calcularDiasRestantes(dataParaPrazo);

  // C1: Score comercial corrigido (RF-020)
  let scoreComercial: number;
  if (e.score_comercial !== undefined && e.score_comercial !== null) {
    scoreComercial = Number(e.score_comercial);
  } else {
    scoreComercial = calcularScoreComercial(String(e.uf ?? ""), estadosAtuacao);
  }

  const scoreGeral = Math.round((scoreTecnico + scoreComercial) / 2);

  // Extrair produto correspondente da lista de produtos aderentes
  const produtos = e.produtos_aderentes as string[] | undefined;
  const produtoCorrespondente = produtos && produtos.length > 0 ? produtos[0] : null;

  // C2: Gaps reais do backend (RF-024)
  let gaps: GapItem[] = [];
  const rawGaps = e.analise_gaps ?? e.gaps;
  if (Array.isArray(rawGaps) && rawGaps.length > 0) {
    gaps = rawGaps.map((g: unknown) => {
      if (typeof g === "object" && g !== null && "item" in (g as Record<string, unknown>)) {
        const gObj = g as Record<string, unknown>;
        return {
          item: String(gObj.item ?? ""),
          tipo: (String(gObj.tipo ?? "nao_atendido")) as GapItem["tipo"],
        };
      }
      return { item: String(g), tipo: "nao_atendido" as const };
    });
  } else if (scoreTecnico > 0 || scoreComercial > 0) {
    // Gerar gaps basicos quando o array esta vazio mas temos scores
    if (scoreTecnico < 70) {
      gaps.push({ item: "Aderencia tecnica insuficiente", tipo: scoreTecnico >= 40 ? "parcial" : "nao_atendido" });
    }
    if (scoreComercial < 70) {
      gaps.push({ item: "Regiao de atuacao fora do ideal", tipo: scoreComercial >= 40 ? "parcial" : "nao_atendido" });
    }
    if (scoreTecnico >= 70 && scoreComercial >= 70) {
      gaps.push({ item: "Requisitos basicos atendidos", tipo: "atendido" });
    }
  }

  return {
    id: String(e.id ?? ""),
    numero: String(e.numero ?? "—"),
    orgao: String(e.orgao ?? "—"),
    uf: String(e.uf ?? "—"),
    objeto: String(e.objeto ?? "—"),
    valor: Number(e.valor_estimado ?? 0),
    dataAbertura,
    diasRestantes,
    score: scoreGeral,
    scores: {
      tecnico: scoreTecnico,
      comercial: scoreComercial,
      recomendacao: Number(e.recomendacao ?? scoreGeral),
    },
    status: Boolean(e.encerrado) ? "encerrado" : "aberto",
    produtoCorrespondente,
    classificacaoTipo: String(e.tipo_produto_inferido || e.modalidade || "—"),
    classificacaoOrigem: String(e.origem_inferida || e.orgao_tipo || "—"),
    tipoProdutoInferido: String(e.tipo_produto_inferido ?? ""),
    origemInferida: String(e.origem_inferida ?? ""),
    potencialGanho: inferirPotencialGanho(scoreGeral),
    intencaoEstrategica: "acompanhamento",
    margemExpectativa: 15,
    gaps,
    url: String(e.url ?? ""),
    fonte: String(e.fonte ?? ""),
    orgaoTipo: String(e.orgao_tipo ?? "outro"),
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

export function CaptacaoPage(props?: PageProps) {
  const onSendToChat = props?.onSendToChat;
  const [termo, setTermo] = useState("");
  const [termoDropdownAberto, setTermoDropdownAberto] = useState(false);
  const [uf, setUf] = useState("todas");
  const [fonte, setFonte] = useState("todas");
  const [classificacaoTipo, setClassificacaoTipo] = useState("todos");
  const [classificacaoOrigem, setClassificacaoOrigem] = useState("todos");
  const [modalidadeFiltro, setModalidadeFiltro] = useState("todos");
  const [calcularScore, setCalcularScore] = useState(false);
  const [incluirEncerrados, setIncluirEncerrados] = useState(false);

  const [resultados, setResultados] = useState<EditalBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [painelEdital, setPainelEdital] = useState<EditalBusca | null>(null);
  const [intencaoLocal, setIntencaoLocal] = useState("estrategico");
  const [margemLocal, setMargemLocal] = useState(15);
  const [salvandoEstrategia, setSalvandoEstrategia] = useState(false);
  const [estrategiaSalva, setEstrategiaSalva] = useState(false);
  const [variaPorProduto, setVariaPorProduto] = useState(false);
  const [variaPorRegiao, setVariaPorRegiao] = useState(false);

  const [monitoramentos, setMonitoramentos] = useState<MonitoramentoInfo[]>([]);
  const [loadingMonitoramentos, setLoadingMonitoramentos] = useState(false);

  // C1: Estados de atuacao carregados de parametros-score
  const [estadosAtuacao, setEstadosAtuacao] = useState<string[]>([]);

  // C3: NCM search field
  const [ncm, setNcm] = useState("");
  const [diasBusca, setDiasBusca] = useState("90");

  // C3: Novo monitoramento inline form (mesmos parâmetros da busca)
  const [showNovoMonitoramento, setShowNovoMonitoramento] = useState(false);
  const [novoMonTermo, setNovoMonTermo] = useState("");
  const [novoMonNcm, setNovoMonNcm] = useState("");
  const [novoMonUfs, setNovoMonUfs] = useState("");
  const [novoMonFonte, setNovoMonFonte] = useState("pncp");
  const [novoMonEncerrados, setNovoMonEncerrados] = useState(false);
  const [novoMonFreq, setNovoMonFreq] = useState("24h");
  const [novoMonScoreMin, setNovoMonScoreMin] = useState(70);

  // C2: Scores de validacao (gaps reais do endpoint)
  const [scoresValidacao, setScoresValidacao] = useState<Record<string, unknown> | null>(null);
  const [loadingScores, setLoadingScores] = useState(false);

  // Fontes de editais carregadas do banco
  const [fontesDisponiveis, setFontesDisponiveis] = useState<{ value: string; label: string }[]>([]);
  // Modalidades, origens e tipos de produto carregados do banco
  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<{ value: string; label: string }[]>([]);
  const [origensDisponiveis, setOrigensDisponiveis] = useState<{ value: string; label: string }[]>([]);
  const [tiposProdutoDisponiveis, setTiposProdutoDisponiveis] = useState<{ value: string; label: string }[]>([]);
  // Produtos do portfólio para select no campo Termo
  const [produtosPortfolio, setProdutosPortfolio] = useState<{ value: string; label: string }[]>([]);

  // Carrega monitoramentos, fontes e parametros ao montar
  useEffect(() => {
    carregarMonitoramentos();
    // Carregar fontes de editais do banco
    (async () => {
      try {
        const res = await crudList("fontes-editais", { limit: 50 });
        const items = res.items as Record<string, unknown>[];
        // Deduplicar por nome (lowercase) e só ativas
        const vistos = new Set<string>();
        const opcoes: { value: string; label: string }[] = [];
        for (const f of items) {
          if (!f.ativo) continue;
          const nome = String(f.nome ?? "").trim();
          const chave = nome.toLowerCase();
          if (chave && !vistos.has(chave)) {
            vistos.add(chave);
            opcoes.push({ value: String(f.id), label: nome });
          }
        }
        opcoes.sort((a, b) => a.label.localeCompare(b.label));
        setFontesDisponiveis(opcoes);
      } catch {
        // Fallback vazio
      }
    })();
    // Carregar produtos do portfólio para o select de Termo
    (async () => {
      try {
        const res = await crudList("produtos", { limit: 100 });
        const items = res.items as Record<string, unknown>[];
        setProdutosPortfolio(items.map(p => ({
          value: String(p.nome ?? ""),
          label: String(p.nome ?? ""),
        })));
      } catch { /* silencioso */ }
    })();
    // Carregar modalidades do banco
    (async () => {
      try {
        const token = localStorage.getItem("editais_ia_access_token");
        const res = await fetch("/api/modalidades", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setModalidadesDisponiveis(data.items.map((m: Record<string, unknown>) => ({
              value: String(m.nome ?? ""),
              label: String(m.nome ?? ""),
            })));
          }
        }
      } catch { /* silencioso */ }
    })();
    // Carregar origens do banco
    (async () => {
      try {
        const token = localStorage.getItem("editais_ia_access_token");
        const res = await fetch("/api/origens", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setOrigensDisponiveis(data.items.map((o: Record<string, unknown>) => ({
              value: String(o.nome ?? ""),
              label: String(o.nome ?? ""),
            })));
          }
        }
      } catch { /* silencioso */ }
    })();
    // Carregar tipos de produto (classes) do banco
    (async () => {
      try {
        const token = localStorage.getItem("editais_ia_access_token");
        const res = await fetch("/api/areas-produto", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            const tipos: { value: string; label: string }[] = [];
            for (const area of data.items) {
              const classes = (area as Record<string, unknown>).classes as Record<string, unknown>[] | undefined;
              if (classes) {
                for (const cls of classes) {
                  tipos.push({ value: String(cls.nome ?? ""), label: String(cls.nome ?? "") });
                }
              }
            }
            setTiposProdutoDisponiveis(tipos);
          }
        }
      } catch { /* silencioso */ }
    })();
    // C1: Carregar estados de atuacao para calculo de score comercial
    (async () => {
      try {
        const paramRes = await crudList("parametros-score", { limit: 1 });
        const estados = paramRes.items[0]?.estados_atuacao;
        if (Array.isArray(estados)) {
          setEstadosAtuacao(estados as string[]);
        }
      } catch {
        // Silencioso - usara fallback score=20
      }
    })();
  }, []);

  const carregarMonitoramentos = async () => {
    setLoadingMonitoramentos(true);
    try {
      const res = await crudList("monitoramentos", { limit: 10 });
      const items = res.items as Record<string, unknown>[];
      setMonitoramentos(items.map(m => ({
        id: String(m.id ?? ""),
        termo: String(m.termo ?? ""),
        ncm: m.ncm ? String(m.ncm) : undefined,
        fontes: m.fontes as string[] | undefined,
        ufs: m.ufs as string[] | undefined,
        incluir_encerrados: Boolean(m.incluir_encerrados ?? false),
        valor_minimo: m.valor_minimo ? Number(m.valor_minimo) : undefined,
        valor_maximo: m.valor_maximo ? Number(m.valor_maximo) : undefined,
        frequencia_horas: Number(m.frequencia_horas ?? 24),
        score_minimo_alerta: m.score_minimo_alerta ? Number(m.score_minimo_alerta) : undefined,
        ativo: Boolean(m.ativo ?? true),
        ultimo_check: m.ultima_execucao ? formatarDataBr(String(m.ultima_execucao)) : undefined,
        editais_encontrados: Number(m.editais_encontrados ?? 0),
      })));
    } catch {
      // Silencioso - monitoramentos são opcionais
    } finally {
      setLoadingMonitoramentos(false);
    }
  };

  // T13: Busca real via REST
  const handleBuscar = async () => {
    // Prioridade: Tipo Produto > Termo digitado/selecionado
    let termoBusca = "";
    if (classificacaoTipo !== "todos") {
      // Tipo Produto selecionado → busca abrangente pelo tipo
      termoBusca = classificacaoTipo.toLowerCase();
    } else {
      termoBusca = termo.trim();
    }
    if (!termoBusca) {
      setErro("Informe um termo de busca ou selecione um Tipo Produto");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      if (ncm.trim()) {
        termoBusca += " NCM " + ncm.trim();
      }
      const params = new URLSearchParams({
        termo: termoBusca,
        calcularScore: String(calcularScore),
        incluirEncerrados: String(incluirEncerrados),
        limite: "2000",
        diasBusca: diasBusca,
      });
      if (uf !== "todas") params.append("uf", uf);
      if (fonte !== "todas") params.append("fonte", fonte);
      if (modalidadeFiltro !== "todos") params.append("modalidade", modalidadeFiltro);
      if (classificacaoTipo !== "todos") params.append("tipoProduto", classificacaoTipo);
      if (classificacaoOrigem !== "todos") params.append("origem", classificacaoOrigem);

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

      const editais = (data.editais ?? []).map(e => normalizarEditalDaBusca(e, estadosAtuacao));

      // Filtros aplicados server-side via query params (modalidade, tipoProduto, origem)

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
      // Mapear modalidade para ENUM válido do banco
      const modalidadeMap: Record<string, string> = {
        "pregao_eletronico": "pregao_eletronico",
        "pregao_presencial": "pregao_presencial",
        "concorrencia": "concorrencia",
        "tomada_precos": "tomada_precos",
        "convite": "convite",
        "dispensa": "dispensa",
        "inexigibilidade": "inexigibilidade",
      };
      const modalidade = modalidadeMap[edital.classificacaoTipo] || "pregao_eletronico";

      const payload: Record<string, unknown> = {
        numero: edital.numero,
        orgao: edital.orgao,
        orgao_tipo: edital.orgaoTipo || "municipal",
        uf: edital.uf !== "—" ? edital.uf : null,
        objeto: edital.objeto,
        modalidade,
        valor_referencia: edital.valor || null,
        data_abertura: (() => {
          // Converter DD/MM/YYYY para YYYY-MM-DD para o MySQL
          const d = edital.dataAbertura;
          if (!d || d === "—") return null;
          if (d.includes("/")) {
            const [dia, mes, ano] = d.split("/");
            return `${ano}-${mes}-${dia}`;
          }
          return d; // Já em formato ISO
        })(),
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

      let estrategiaId = painelEdital.estrategiaId;

      // Se não tem estrategiaId, buscar se já existe uma para este edital
      if (!estrategiaId) {
        try {
          const existentes = await crudList("estrategias-editais", { q: editalId ?? "" });
          const existente = existentes.items.find((e: Record<string, unknown>) => String(e.edital_id) === editalId);
          if (existente) {
            estrategiaId = String(existente.id);
          }
        } catch { /* ignorar erro de busca */ }
      }

      if (estrategiaId) {
        await crudUpdate("estrategias-editais", estrategiaId, payload);
        setResultados(prev => prev.map(e =>
          e.id === painelEdital.id ? { ...e, estrategiaId, editalSalvoId: editalId ?? undefined } : e
        ));
        setPainelEdital(prev => prev ? { ...prev, estrategiaId, editalSalvoId: editalId ?? undefined } : prev);
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

  // C2: Buscar scores de validacao (gaps reais) via endpoint
  const fetchScoresValidacao = async (editalId: string) => {
    // Precisa de UUID completo (36 chars) para chamar o endpoint
    if (!editalId || editalId.length !== 36) {
      setScoresValidacao(null);
      return;
    }
    setLoadingScores(true);
    setScoresValidacao(null);
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      const res = await fetch(`/api/editais/${editalId}/scores-validacao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setScoresValidacao(data);
        }
      }
    } catch {
      // Silencioso - scores sao opcionais
    } finally {
      setLoadingScores(false);
    }
  };

  const handleAbrirPainel = (edital: EditalBusca) => {
    setPainelEdital(edital);
    setIntencaoLocal(edital.intencaoEstrategica);
    setMargemLocal(edital.margemExpectativa);
    setEstrategiaSalva(false);
    // C2: Lazy-load scores de validacao ao abrir o painel
    const editalId = edital.editalSalvoId || (edital.id.length === 36 ? edital.id : null);
    if (editalId) {
      fetchScoresValidacao(editalId);
    } else {
      setScoresValidacao(null);
      setLoadingScores(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setResultados(resultados.map(e =>
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  // C1: Exportar CSV
  const handleExportarCSV = () => {
    if (!resultados.length) return;
    const header = 'Numero;Orgao;UF;Objeto;Valor;Abertura;Score\n';
    const rows = resultados.map(e =>
      `${e.numero};${e.orgao};${e.uf};"${(e.objeto || '').replace(/"/g, '""')}";${e.valor || ''};${e.dataAbertura || ''};${e.score || ''}`
    ).join('\n');
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editais_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          onClick={(ev) => ev.stopPropagation()}
          onChange={() => handleToggleSelect(e.id)}
        />
      ),
    },
    {
      key: "fonte",
      header: "Fonte",
      width: "100px",
      render: (e) => {
        const f = e.fonte || "—";
        let label = f;
        let color = "#888";
        if (f.includes("PNCP")) { label = "PNCP"; color = "#2e7d32"; }
        else if (f.includes("comprasnet") || f.includes("ComprasNet")) { label = "ComprasNet"; color = "#1565c0"; }
        else if (f.includes("bec") || f.includes("BEC")) { label = "BEC-SP"; color = "#f9a825"; }
        else if (f.includes("licitacoes") || f.includes("Licitacoes")) { label = "Licitações-e"; color = "#e65100"; }
        else if (f.includes("compras.rs")) { label = "Compras RS"; color = "#6a1b9a"; }
        else if (f.includes("compras.mg")) { label = "Compras MG"; color = "#ad1457"; }
        else if (f.includes("Scraper")) { label = f.split(" (")[0]; color = "#e65100"; }
        return <span style={{ color, fontWeight: 600, fontSize: "0.8em" }}>{label}</span>;
      },
      sortable: true,
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
        <div
          className="score-cell-tooltip"
          style={{ position: "relative" }}
          onMouseEnter={(ev) => {
            const tooltip = ev.currentTarget.querySelector(".gap-tooltip") as HTMLElement;
            if (tooltip) tooltip.style.display = "block";
          }}
          onMouseLeave={(ev) => {
            const tooltip = ev.currentTarget.querySelector(".gap-tooltip") as HTMLElement;
            if (tooltip) tooltip.style.display = "none";
          }}
        >
          <ScoreCircle score={e.score} size={40} />
          <div
            className="gap-tooltip"
            style={{
              display: "none",
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#1e293b",
              color: "#e2e8f0",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "12px",
              lineHeight: "1.5",
              minWidth: "200px",
              maxWidth: "300px",
              zIndex: 9999,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              whiteSpace: "normal",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "6px", borderBottom: "1px solid #334155", paddingBottom: "4px" }}>Analise de Gaps</div>
            {e.gaps.length > 0 ? (
              e.gaps.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start", marginBottom: "3px" }}>
                  <span style={{ color: g.tipo === "atendido" ? "#22c55e" : g.tipo === "parcial" ? "#eab308" : "#ef4444", flexShrink: 0 }}>
                    {g.tipo === "atendido" ? "\u2714" : g.tipo === "parcial" ? "\u25CF" : "\u2718"}
                  </span>
                  <span>{g.item}</span>
                </div>
              ))
            ) : (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ color: "#22c55e" }}>{"\u2714"}</span>
                <span>Todos os requisitos atendidos</span>
              </div>
            )}
            <div style={{ marginTop: "6px", borderTop: "1px solid #334155", paddingTop: "4px", fontSize: "11px", color: "#94a3b8" }}>
              Tec: {e.scores.tecnico}% | Com: {e.scores.comercial}% | Rec: {e.scores.recomendacao}%
            </div>
          </div>
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
            <FormField label="Termo / Produto">
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={termo}
                  onChange={(e) => { setTermo(e.target.value); setTermoDropdownAberto(true); }}
                  onFocus={() => setTermoDropdownAberto(true)}
                  onBlur={() => setTimeout(() => setTermoDropdownAberto(false), 150)}
                  placeholder={classificacaoTipo !== "todos" ? `Tipo Produto: ${classificacaoTipo}` : "Digite ou selecione um produto..."}
                  className="form-input"
                  style={{ width: "100%" }}
                  disabled={classificacaoTipo !== "todos"}
                />
                {termoDropdownAberto && classificacaoTipo === "todos" && produtosPortfolio.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                    background: "#1e293b", border: "1px solid #334155", borderRadius: "6px",
                    maxHeight: "200px", overflowY: "auto", marginTop: "2px",
                  }}>
                    {produtosPortfolio
                      .filter(p => !termo || p.label.toLowerCase().includes(termo.toLowerCase()))
                      .map((p) => (
                        <div
                          key={p.value}
                          onMouseDown={() => { setTermo(p.value); setTermoDropdownAberto(false); }}
                          style={{
                            padding: "6px 10px", cursor: "pointer", fontSize: "13px",
                            color: "#e2e8f0", borderBottom: "1px solid #1e293b",
                          }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.background = "#334155")}
                          onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                        >
                          {p.label}
                        </div>
                      ))}
                  </div>
                )}
                {classificacaoTipo !== "todos" && (
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    Usando Tipo Produto: {classificacaoTipo}
                  </div>
                )}
              </div>
            </FormField>
            <FormField label="UF">
              <SelectInput value={uf} onChange={setUf} options={UFS} />
            </FormField>
            <FormField label="Fonte">
              <SelectInput
                value={fonte}
                onChange={setFonte}
                options={[
                  { value: "todas", label: "Todas as fontes" },
                  ...fontesDisponiveis,
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
            <FormField label="Modalidade">
              <SelectInput
                value={modalidadeFiltro}
                onChange={setModalidadeFiltro}
                options={[
                  { value: "todos", label: "Todas" },
                  ...modalidadesDisponiveis,
                ]}
              />
            </FormField>
            <FormField label="Tipo Produto">
              <SelectInput
                value={classificacaoTipo}
                onChange={setClassificacaoTipo}
                options={[
                  { value: "todos", label: "Todos" },
                  ...tiposProdutoDisponiveis,
                ]}
              />
            </FormField>
            <FormField label="Origem">
              <SelectInput
                value={classificacaoOrigem}
                onChange={setClassificacaoOrigem}
                options={[
                  { value: "todos", label: "Todas" },
                  ...origensDisponiveis,
                ]}
              />
            </FormField>
            <FormField label="NCM (codigo)">
              <TextInput
                value={ncm}
                onChange={setNcm}
                placeholder="Ex: 9027.80.99"
              />
            </FormField>
          </div>

          <div className="form-grid form-grid-4" style={{ marginTop: "12px" }}>
            <FormField label="Periodo de publicacao">
              <SelectInput
                value={diasBusca}
                onChange={setDiasBusca}
                options={[
                  { value: "30", label: "Ultimos 30 dias" },
                  { value: "60", label: "Ultimos 60 dias" },
                  { value: "90", label: "Ultimos 90 dias" },
                  { value: "180", label: "Ultimos 180 dias" },
                  { value: "365", label: "Ultimo ano" },
                  { value: "0", label: "Todos (sem limite)" },
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
                    <ActionButton icon={<Download size={14} />} label="Exportar CSV" onClick={handleExportarCSV} />
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

                  {/* 3 sub-scores: Técnico e Comercial em gauge circular, Recomendação em estrelas */}
                  <div className="panel-subscores" style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <ScoreCircle score={painelEdital.scores.tecnico} size={60} />
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Aderencia Tecnica</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <ScoreCircle score={painelEdital.scores.comercial} size={60} />
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Aderencia Comercial</div>
                    </div>
                    <div style={{ textAlign: "center", flex: 1, minWidth: "120px" }}>
                      <StarRating score={painelEdital.scores.recomendacao} />
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Recomendacao</div>
                    </div>
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
                      <span>50%</span>
                    </div>
                    {/* Botões Varia por Produto / Região (F7) */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button
                        onClick={() => setVariaPorProduto(!variaPorProduto)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          fontSize: "12px",
                          border: variaPorProduto ? "2px solid #3b82f6" : "1px solid #334155",
                          borderRadius: "6px",
                          backgroundColor: variaPorProduto ? "#1e3a5f" : "transparent",
                          color: variaPorProduto ? "#60a5fa" : "#94a3b8",
                          cursor: "pointer",
                          fontWeight: variaPorProduto ? 600 : 400,
                        }}
                      >
                        Varia por Produto
                      </button>
                      <button
                        onClick={() => setVariaPorRegiao(!variaPorRegiao)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          fontSize: "12px",
                          border: variaPorRegiao ? "2px solid #3b82f6" : "1px solid #334155",
                          borderRadius: "6px",
                          backgroundColor: variaPorRegiao ? "#1e3a5f" : "transparent",
                          color: variaPorRegiao ? "#60a5fa" : "#94a3b8",
                          cursor: "pointer",
                          fontWeight: variaPorRegiao ? 600 : 400,
                        }}
                      >
                        Varia por Regiao
                      </button>
                    </div>
                    {variaPorProduto && (
                      <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#0f172a", borderRadius: "6px", fontSize: "12px" }}>
                        <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Margem por produto (ajuste individual via Parametrizacoes)</div>
                        <div style={{ color: "#64748b", fontStyle: "italic" }}>Configure as margens por produto na aba Parametrizacoes &gt; Comerciais</div>
                      </div>
                    )}
                    {variaPorRegiao && (
                      <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#0f172a", borderRadius: "6px", fontSize: "12px" }}>
                        <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Margem por regiao (ajuste individual via Parametrizacoes)</div>
                        <div style={{ color: "#64748b", fontStyle: "italic" }}>Configure as margens por UF na aba Parametrizacoes &gt; Comerciais</div>
                      </div>
                    )}
                  </div>

                  {/* Analise de Gaps - C2: Dados reais do endpoint scores-validacao */}
                  <div className="panel-section">
                    <h4>Analise de Gaps / Validacao</h4>
                    {loadingScores ? (
                      <p className="text-muted">Carregando scores de validacao...</p>
                    ) : scoresValidacao ? (
                      <div className="gaps-list">
                        {/* 6 dimensoes de score */}
                        <div style={{ marginBottom: "10px" }}>
                          {[
                            { key: "tecnico", label: "Tecnico" },
                            { key: "documental", label: "Documental" },
                            { key: "complexidade", label: "Complexidade" },
                            { key: "juridico", label: "Juridico" },
                            { key: "logistico", label: "Logistico" },
                            { key: "comercial", label: "Comercial" },
                          ].map(dim => {
                            const scores = scoresValidacao.scores as Record<string, number> | undefined;
                            const val = scores?.[dim.key] ?? null;
                            const status: "success" | "warning" | "error" = val === null ? "error" : val >= 70 ? "success" : val >= 40 ? "warning" : "error";
                            return (
                              <div key={dim.key} className="gap-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <span>{dim.label}</span>
                                <StatusBadge status={status} label={val !== null ? `${val}%` : "N/A"} size="small" />
                              </div>
                            );
                          })}
                        </div>
                        {/* Decisao GO/NO-GO */}
                        {scoresValidacao.decisao && (
                          <div style={{ marginBottom: "8px", padding: "6px 10px", borderRadius: "6px", backgroundColor: String(scoresValidacao.decisao) === "GO" ? "#052e16" : String(scoresValidacao.decisao) === "NO-GO" ? "#450a0a" : "#1e293b" }}>
                            <strong style={{ color: String(scoresValidacao.decisao) === "GO" ? "#22c55e" : String(scoresValidacao.decisao) === "NO-GO" ? "#ef4444" : "#eab308" }}>
                              {String(scoresValidacao.decisao)}
                            </strong>
                            {scoresValidacao.justificativa && (
                              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                                {String(scoresValidacao.justificativa)}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Pontos positivos */}
                        {Array.isArray(scoresValidacao.pontos_positivos) && (scoresValidacao.pontos_positivos as string[]).length > 0 && (
                          <div style={{ marginBottom: "6px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", marginBottom: "4px" }}>Pontos positivos:</div>
                            {(scoresValidacao.pontos_positivos as string[]).map((p, i) => (
                              <div key={i} style={{ fontSize: "12px", color: "#cbd5e1", display: "flex", gap: "4px", marginBottom: "2px" }}>
                                <span style={{ color: "#22c55e", flexShrink: 0 }}>{"\u2714"}</span>
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Pontos de atencao */}
                        {Array.isArray(scoresValidacao.pontos_atencao) && (scoresValidacao.pontos_atencao as string[]).length > 0 && (
                          <div style={{ marginBottom: "6px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#eab308", marginBottom: "4px" }}>Pontos de atencao:</div>
                            {(scoresValidacao.pontos_atencao as string[]).map((p, i) => (
                              <div key={i} style={{ fontSize: "12px", color: "#cbd5e1", display: "flex", gap: "4px", marginBottom: "2px" }}>
                                <span style={{ color: "#eab308", flexShrink: 0 }}>{"\u26A0"}</span>
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : painelEdital.gaps.length > 0 ? (
                      /* Fallback: gaps locais da busca */
                      <div className="gaps-list">
                        {painelEdital.gaps.map((g, i) => (
                          <div key={i} className="gap-item">
                            <StatusBadge status={getGapColor(g.tipo) as "success" | "warning" | "error"} label={getGapLabel(g.tipo)} size="small" />
                            <span>{g.item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">Nenhum gap identificado</p>
                    )}
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

                  {/* C4: Botoes de IA */}
                  {onSendToChat && (
                    <div className="panel-section">
                      <h4>Acoes de IA</h4>
                      <div className="panel-actions">
                        <ActionButton
                          icon={<Brain size={14} />}
                          label="Classificar Edital via IA"
                          onClick={() => onSendToChat("Classifique este edital: " + painelEdital.objeto)}
                        />
                        <ActionButton
                          icon={<DollarSign size={14} />}
                          label="Recomendar Preco"
                          onClick={() => onSendToChat("Recomende preco para " + painelEdital.objeto)}
                        />
                        <ActionButton
                          icon={<History size={14} />}
                          label="Historico de Precos"
                          onClick={() => onSendToChat("Busque precos de " + painelEdital.objeto + " no PNCP")}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Monitoramento automatico - T17 + C3 */}
        <Card
          title="Monitoramento Automatico"
          icon={<Eye size={18} />}
          actions={
            <ActionButton
              icon={<Plus size={14} />}
              label="Novo Monitoramento"
              variant="primary"
              onClick={() => setShowNovoMonitoramento(!showNovoMonitoramento)}
            />
          }
        >
          <div className="monitoramento-info">
            {/* Formulario completo para novo monitoramento (mesmos parâmetros da busca) */}
            {showNovoMonitoramento && (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155" }}>
                <div className="form-grid form-grid-4">
                  <FormField label="Termo de busca *">
                    <TextInput
                      value={novoMonTermo}
                      onChange={setNovoMonTermo}
                      placeholder="Ex: equipamentos laboratoriais"
                    />
                  </FormField>
                  <FormField label="NCM (opcional)">
                    <TextInput
                      value={novoMonNcm}
                      onChange={setNovoMonNcm}
                      placeholder="Ex: 9018.19.90"
                    />
                  </FormField>
                  <FormField label="UFs (separadas por virgula)">
                    <TextInput
                      value={novoMonUfs}
                      onChange={setNovoMonUfs}
                      placeholder="Ex: SP, RJ, MG (vazio = todas)"
                    />
                  </FormField>
                  <FormField label="Fonte">
                    <SelectInput
                      value={novoMonFonte}
                      onChange={setNovoMonFonte}
                      options={[
                        { value: "todas", label: "Todas as fontes" },
                        ...fontesDisponiveis,
                      ]}
                    />
                  </FormField>
                </div>
                <div className="form-grid form-grid-4" style={{ marginTop: "8px" }}>
                  <FormField label="Frequencia">
                    <SelectInput
                      value={novoMonFreq}
                      onChange={setNovoMonFreq}
                      options={[
                        { value: "6h", label: "A cada 6 horas" },
                        { value: "12h", label: "A cada 12 horas" },
                        { value: "24h", label: "A cada 24 horas" },
                        { value: "semanal", label: "Semanal" },
                      ]}
                    />
                  </FormField>
                  <FormField label="Score minimo alerta">
                    <SelectInput
                      value={String(novoMonScoreMin)}
                      onChange={(v) => setNovoMonScoreMin(Number(v))}
                      options={[
                        { value: "0", label: "Todos (sem filtro)" },
                        { value: "50", label: "50% ou mais" },
                        { value: "60", label: "60% ou mais" },
                        { value: "70", label: "70% ou mais" },
                        { value: "80", label: "80% ou mais" },
                      ]}
                    />
                  </FormField>
                  <FormField label="Incluir encerrados">
                    <SelectInput
                      value={novoMonEncerrados ? "sim" : "nao"}
                      onChange={(v) => setNovoMonEncerrados(v === "sim")}
                      options={[
                        { value: "nao", label: "Nao (somente abertos)" },
                        { value: "sim", label: "Sim" },
                      ]}
                    />
                  </FormField>
                  <div className="form-field-actions">
                    <ActionButton
                      icon={<Plus size={14} />}
                      label="Criar"
                      variant="primary"
                      onClick={async () => {
                        if (!novoMonTermo.trim()) return;
                        try {
                          const freqMap: Record<string, number> = { "6h": 6, "12h": 12, "24h": 24, "semanal": 168 };
                          const ufsArray = novoMonUfs.trim()
                            ? novoMonUfs.split(",").map(u => u.trim().toUpperCase()).filter(Boolean)
                            : null;
                          const fontesArray = novoMonFonte === "todas" ? null : [novoMonFonte];
                          await crudCreate("monitoramentos", {
                            termo: novoMonTermo.trim(),
                            ncm: novoMonNcm.trim() || null,
                            fontes: fontesArray,
                            ufs: ufsArray,
                            incluir_encerrados: novoMonEncerrados,
                            frequencia_horas: freqMap[novoMonFreq] || 24,
                            score_minimo_alerta: novoMonScoreMin,
                            ativo: true,
                          });
                          setNovoMonTermo("");
                          setNovoMonNcm("");
                          setNovoMonUfs("");
                          setNovoMonFonte("pncp");
                          setNovoMonEncerrados(false);
                          setNovoMonFreq("24h");
                          setNovoMonScoreMin(70);
                          setShowNovoMonitoramento(false);
                          await carregarMonitoramentos();
                        } catch {
                          alert("Erro ao criar monitoramento");
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {loadingMonitoramentos ? (
              <p className="text-muted">Carregando monitoramentos...</p>
            ) : monitoramentos.length > 0 ? (
              <>
                <p><strong>Monitoramentos ativos:</strong> {monitoramentos.filter(m => m.ativo).length} de {monitoramentos.length}</p>
                <div style={{ marginTop: "8px" }}>
                  {monitoramentos.slice(0, 5).map(m => (
                    <div key={m.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                      <StatusBadge
                        status={m.ativo ? "success" : "neutral"}
                        label={m.ativo ? "Ativo" : "Inativo"}
                        size="small"
                      />
                      <span><strong>{m.termo}</strong></span>
                      {m.ncm && (
                        <span className="text-muted">NCM: {m.ncm}</span>
                      )}
                      {m.ufs && m.ufs.length > 0 && (
                        <span className="text-muted">({m.ufs.join(", ")})</span>
                      )}
                      {m.fontes && m.fontes.length > 0 && (
                        <span className="text-muted">[{m.fontes.join(", ")}]</span>
                      )}
                      {m.frequencia_horas && (
                        <span className="text-muted">a cada {m.frequencia_horas}h</span>
                      )}
                      {m.score_minimo_alerta && m.score_minimo_alerta > 0 && (
                        <span className="text-muted">score&ge;{m.score_minimo_alerta}%</span>
                      )}
                      {m.editais_encontrados !== undefined && m.editais_encontrados > 0 && (
                        <span className="text-muted">{m.editais_encontrados} encontrado(s)</span>
                      )}
                      {m.ultimo_check && (
                        <span className="text-muted">— ultimo: {m.ultimo_check}</span>
                      )}
                      {/* C3: Botoes Pausar e Excluir por monitoramento */}
                      <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
                        <button
                          title={m.ativo ? "Pausar monitoramento" : "Retomar monitoramento"}
                          onClick={async () => {
                            try {
                              await crudUpdate("monitoramentos", m.id, { ativo: !m.ativo });
                              await carregarMonitoramentos();
                            } catch {
                              alert("Erro ao atualizar monitoramento");
                            }
                          }}
                          style={{
                            padding: "3px 8px",
                            fontSize: "11px",
                            border: "1px solid #334155",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: m.ativo ? "#eab308" : "#22c55e",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Pause size={12} />
                          {m.ativo ? "Pausar" : "Retomar"}
                        </button>
                        <button
                          title="Excluir monitoramento"
                          onClick={async () => {
                            try {
                              await crudDelete("monitoramentos", m.id);
                              await carregarMonitoramentos();
                            } catch {
                              alert("Erro ao excluir monitoramento");
                            }
                          }}
                          style={{
                            padding: "3px 8px",
                            fontSize: "11px",
                            border: "1px solid #334155",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={12} />
                          Excluir
                        </button>
                      </div>
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
