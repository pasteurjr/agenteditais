import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  DollarSign, Search, TrendingUp, History, Lightbulb, Package,
  Layers, Target, BarChart3, Shield, ChevronDown, ChevronUp,
  Check, AlertTriangle, Download, X, Globe, Loader2, Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card, DataTable, ActionButton, FormField, TextInput, SelectInput,
  TabPanel, Modal,
} from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate, crudGet } from "../api/crud";
import { createSession, sendMessage } from "../api/client";
import { getEditais, getProdutos } from "../api/client";
import type { Edital, Produto } from "../api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lote {
  id: string;
  edital_id: string;
  numero_lote: number;
  nome: string;
  especialidade: string | null;
  volume_exigido: number | null;
  valor_estimado: number | null;
  status: string;
}

interface EditalItem {
  id: string;
  numero_item: number;
  descricao: string;
  unidade_medida: string;
  quantidade: number | null;
  valor_unitario_estimado: number | null;
  valor_total_estimado: number | null;
}

interface Vinculo {
  id: string;
  edital_item_id: string;
  produto_id: string;
  match_score: number | null;
  confirmado: boolean;
  volume_edital: number | null;
  rendimento_produto: number | null;
  repeticoes_amostras: number;
  repeticoes_calibradores: number;
  repeticoes_controles: number;
  volume_real_ajustado: number | null;
  quantidade_kits: number | null;
  formula_calculo: string | null;
}

interface PrecoCamada {
  id: string;
  edital_item_produto_id: string;
  custo_unitario: number | null;
  custo_fonte: string | null;
  ncm: string | null;
  icms: number | null;
  ipi: number | null;
  pis_cofins: number | null;
  isencao_icms: boolean;
  custo_base_final: number | null;
  modo_preco_base: string | null;
  markup_percentual: number | null;
  preco_base: number | null;
  valor_referencia_edital: number | null;
  valor_referencia_disponivel: boolean;
  target_referencia: number | null;
  margem_sobre_custo: number | null;
  lance_inicial: number | null;
  lance_minimo: number | null;
  margem_minima: number | null;
  preco_medio_historico: number | null;
  preco_min_historico: number | null;
  preco_max_historico: number | null;
  qtd_registros_historico: number;
  status: string;
}

interface Comodato {
  id: string;
  edital_id: string;
  nome_equipamento: string;
  valor_equipamento: number | null;
  duracao_meses: number | null;
  valor_mensal_amortizacao: number | null;
  custo_manutencao_mensal: number | null;
  custo_instalacao: number | null;
  condicoes_especiais: string | null;
  status: string;
}

interface HistoricoPreco {
  id: string;
  produto: string;
  preco: number;
  data: string;
  edital: string;
  resultado: "ganho" | "perdido";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number | null | undefined) =>
  v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";

const pct = (v: number | null | undefined) =>
  v != null ? `${v.toFixed(1)}%` : "—";

// ─── Component ────────────────────────────────────────────────────────────────

export function PrecificacaoPage(props?: PageProps) {
  const { onSendToChat } = props ?? {};

  // ── Global state ──
  const [editais, setEditais] = useState<Edital[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editalId, setEditalId] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Tab: Lotes (UC-P01) ──
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loteItensMap, setLoteItensMap] = useState<Record<string, string[]>>({});
  const [itensEdital, setItensEdital] = useState<EditalItem[]>([]);
  const [iaProcessing, setIaProcessing] = useState<string | null>(null);
  const [iaResponse, setIaResponse] = useState<string | null>(null);
  // Modals: Buscar na Web / ANVISA (mesmo padrão do PortfolioPage)
  const [showBuscaWebModal, setShowBuscaWebModal] = useState(false);
  const [showAnvisaModal, setShowAnvisaModal] = useState(false);
  const [buscaNomeProduto, setBuscaNomeProduto] = useState("");
  const [buscaFabricante, setBuscaFabricante] = useState("");
  const [anvisaRegistro, setAnvisaRegistro] = useState("");
  const [anvisaNomeProduto, setAnvisaNomeProduto] = useState("");
  const [loteExpandido, setLoteExpandido] = useState<string | null>(null);
  const [loteEspecialidade, setLoteEspecialidade] = useState("");
  const [loteVolume, setLoteVolume] = useState("");
  const [loteDescricao, setLoteDescricao] = useState("");
  const [loteTipoAmostra, setLoteTipoAmostra] = useState("");
  const [loteEquipamento, setLoteEquipamento] = useState("");
  const [loteObservacoes, setLoteObservacoes] = useState("");

  // ── Tab: Custos e Preços (UC-P02 a UC-P06) ──
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [vinculoId, setVinculoId] = useState("");
  const [camada, setCamada] = useState<PrecoCamada | null>(null);
  // UC-P02: Seleção
  const [selecaoItemId, setSelecaoItemId] = useState("");
  const [sugestoes, setSugestoes] = useState<Array<{ produto_id: string; nome: string; fabricante: string; match_score: number }>>([]);
  const [showSelecaoModal, setShowSelecaoModal] = useState(false);
  // UC-P03: Volumetria
  const [precisaVolumetria, setPrecisaVolumetria] = useState<boolean | null>(null);
  const [volEdital, setVolEdital] = useState("");
  const [rendimento, setRendimento] = useState("");
  const [repAmostras, setRepAmostras] = useState("0");
  const [repCalib, setRepCalib] = useState("0");
  const [repControles, setRepControles] = useState("0");
  // UC-P04: Custos
  const [custoUnit, setCustoUnit] = useState("");
  // UC-P05: Preço base
  const [modoPrecoBase, setModoPrecoBase] = useState("markup");
  const [markup, setMarkup] = useState("");
  const [precoBaseManual, setPrecoBaseManual] = useState("");
  // UC-P06: Referência
  const [valorRef, setValorRef] = useState("");
  const [pctSobreBase, setPctSobreBase] = useState("");

  // ── Insights IA (histórico + recomendação) ──
  const [insights, setInsights] = useState<{
    historico: { qtd_registros: number; preco_min: number | null; preco_medio: number | null; preco_max: number | null };
    recomendacao: { custo_sugerido: number | null; markup_sugerido: number | null; preco_base_sugerido: number | null; referencia_sugerida: number | null; faixa: { agressivo: number | null; ideal: number | null; conservador: number | null }; justificativa: string; fonte: string | null };
    concorrentes: Array<{ nome: string; taxa_vitoria: number; preco_medio: number; editais_ganhos: number }>;
    referencia_edital: number | null;
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // ── Tab: Lances (UC-P07 + UC-P08) ──
  const [lanceInicial, setLanceInicial] = useState("");
  const [lanceMinimo, setLanceMinimo] = useState("");
  const [descontoMax, setDescontoMax] = useState("");
  const [modoInicial, setModoInicial] = useState("absoluto");
  const [modoMinimo, setModoMinimo] = useState("absoluto");
  // UC-P08: Estratégia
  const [perfil, setPerfil] = useState("quero_ganhar");
  const [cenarios, setCenarios] = useState<Record<string, unknown>[]>([]);

  // ── Tab: Histórico (UC-P09) + Comodato (UC-P10) ──
  const [termoBusca, setTermoBusca] = useState("");
  const [historico, setHistorico] = useState<HistoricoPreco[]>([]);
  const [histStats, setHistStats] = useState<{ media: number; min: number; max: number } | null>(null);
  const [comodatos, setComodatos] = useState<Comodato[]>([]);
  const [comodatoNome, setComodatoNome] = useState("");
  const [comodatoValor, setComodatoValor] = useState("");
  const [comodatoMeses, setComodatoMeses] = useState("");

  // ── Load data ──
  useEffect(() => {
    (async () => {
      try { setEditais(await getEditais()); } catch { setEditais([]); }
      try { setProdutos(await getProdutos()); } catch { setProdutos([]); }
    })();
  }, []);

  const editalOptions = [
    { value: "", label: "Selecione um edital..." },
    ...editais.map((e) => ({ value: e.id ?? e.numero, label: `${e.numero} — ${e.orgao}` })),
  ];
  const produtoOptions = [
    { value: "", label: "Selecione..." },
    ...produtos.map((p) => ({ value: p.id, label: p.nome })),
  ];

  // ── Load lotes when edital changes ──
  const loadLotes = useCallback(async (eid: string) => {
    if (!eid) { setLotes([]); setItensEdital([]); return; }
    setLoading(true);
    try {
      const res = await crudList("lotes", { parent_id: eid, limit: 100 });
      const lotesData = (res.items as unknown as Lote[]) || [];
      setLotes(lotesData);
      const itensRes = await crudList("editais-itens", { parent_id: eid, limit: 200 });
      const itensComIgnorado = ((itensRes.items || []) as Record<string, unknown>[]).map(it => ({
        ...it,
        _ignorado: it.tipo_beneficio === "ignorado",
      }));
      setItensEdital(itensComIgnorado as unknown as EditalItem[]);
      // Load lote_itens para saber quais itens pertencem a cada lote
      const loteItensMap: Record<string, string[]> = {};
      for (const lote of lotesData) {
        try {
          const liRes = await crudList("lote-itens", { parent_id: lote.id, limit: 200 });
          loteItensMap[lote.id] = ((liRes.items || []) as Record<string, unknown>[]).map(li => String(li.edital_item_id));
        } catch { loteItensMap[lote.id] = []; }
      }
      setLoteItensMap(loteItensMap);
      // Load vinculos — filtrar apenas itens deste edital
      const allItemIds = new Set(itensComIgnorado.map((i) => (i as Record<string, unknown>).id as string));
      const vRes = await crudList("edital-item-produto", { limit: 500 });
      const allVinculos = (vRes.items as unknown as Vinculo[]) || [];
      setVinculos(allVinculos.filter(v => allItemIds.has(v.edital_item_id)));
      // Load comodatos
      const cRes = await crudList("comodatos", { parent_id: eid, limit: 50 });
      setComodatos((cRes.items as unknown as Comodato[]) || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (editalId) loadLotes(editalId); }, [editalId, loadLotes]);

  // ── Load camada when vinculo changes ──
  useEffect(() => {
    if (!vinculoId) { setCamada(null); return; }
    (async () => {
      try {
        const res = await crudList("preco-camadas", { edital_item_produto_id: vinculoId, limit: 1 });
        const items = res.items as unknown as PrecoCamada[];
        if (items.length > 0) setCamada(items[0]);
        else setCamada(null);
      } catch { setCamada(null); }
    })();
  }, [vinculoId]);

  // ── Detecção de necessidade de conversão + pré-preenchimento via especificações ──
  useEffect(() => {
    if (!vinculoId) { setPrecisaVolumetria(null); return; }
    const v = vinculos.find(vv => vv.id === vinculoId);
    if (!v) { setPrecisaVolumetria(null); return; }
    const item = itensEdital.find(i => i.id === v.edital_item_id);
    const prod = produtos.find(p => p.id === v.produto_id);
    const desc = ((item?.descricao || "") + " " + (prod?.nome || "")).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cat = ((prod as Record<string, unknown>)?.categoria as string || "").toLowerCase();

    // Termos que indicam conversão (produto vendido em embalagem com rendimento)
    const termosVolumetria = ["kit", "reagente", "caixa com", "frasco", "testes", "determinacoes", "dosagens", "ensaios", "reacoes"];
    // Termos que indicam compra unitária (sem conversão)
    const termosUnitario = ["microscopio", "autoclave", "centrifuga", "equipamento", "impressora", "computador", "monitor", "balanca"];

    const temTermoVol = termosVolumetria.some(t => desc.includes(t)) || cat === "reagente";
    const temTermoUnit = termosUnitario.some(t => desc.includes(t)) || cat === "equipamento";

    if (temTermoUnit && !temTermoVol) setPrecisaVolumetria(false);
    else if (temTermoVol) setPrecisaVolumetria(true);
    else setPrecisaVolumetria(false);

    // Pré-preencher: quantidade do edital
    const qtdItem = item?.quantidade;
    if (qtdItem && Number(qtdItem) > 0) setVolEdital(String(Number(qtdItem)));
    else setVolEdital("");

    // Buscar especificações do produto para rendimento e repetições
    if (prod) {
      (async () => {
        try {
          const specsRes = await crudList("produtos-especificacoes", { parent_id: prod.id, limit: 50 });
          const specs = (specsRes.items || []) as Record<string, unknown>[];
          const getSpec = (nome: string) => {
            const s = specs.find(sp => String(sp.nome_especificacao || "").toLowerCase().includes(nome.toLowerCase()));
            return s ? String(s.valor || "") : "";
          };

          // Rendimento: especificação do produto é fonte primária, vínculo é fallback
          const rendSpec = Number(getSpec("Rendimento") || 0);
          const rendVinc = Number(v.rendimento_produto || 0);
          if (rendSpec > 0) setRendimento(String(rendSpec));
          else if (rendVinc > 0) setRendimento(String(rendVinc));
          else setRendimento("");

          // Repetições: especificação é fonte primária, vínculo é fallback
          const repAmSpec = Number(getSpec("Amostras") || 0);
          const repCalSpec = Number(getSpec("Calibradores") || 0);
          const repCtSpec = Number(getSpec("Controles") || 0);
          setRepAmostras(String(repAmSpec || Number(v.repeticoes_amostras) || 0));
          setRepCalib(String(repCalSpec || Number(v.repeticoes_calibradores) || 0));
          setRepControles(String(repCtSpec || Number(v.repeticoes_controles) || 0));

          // Se encontrou rendimento na spec, forçar detecção de conversão
          if (rendSpec && Number(rendSpec) > 0) setPrecisaVolumetria(true);
        } catch {
          // Sem especificações — usar dados do vínculo
          setRendimento(v.rendimento_produto ? String(v.rendimento_produto) : "");
          setRepAmostras(String(v.repeticoes_amostras || 0));
          setRepCalib(String(v.repeticoes_calibradores || 0));
          setRepControles(String(v.repeticoes_controles || 0));
        }
      })();
    } else {
      setRendimento("");
      setRepAmostras("0");
      setRepCalib("0");
      setRepControles("0");
    }
  }, [vinculoId, vinculos, itensEdital, produtos]);

  // ── Buscar insights IA ao selecionar vínculo ──
  useEffect(() => {
    if (!vinculoId) { setInsights(null); return; }
    setInsightsLoading(true);
    setInsights(null);
    const token = localStorage.getItem("editais_ia_access_token");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    fetch(`/api/precificacao/${vinculoId}/insights`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => { if (data.success) setInsights(data); })
      .catch(() => {})
      .finally(() => { clearTimeout(timeout); setInsightsLoading(false); });
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [vinculoId]);

  // ── Handlers ──

  const handleCriarLotes = async () => {
    if (!editalId) return;
    if (itensEdital.length === 0) return;
    // Criar lote via CRUD com todos os itens existentes
    try {
      const valorTotal = itensEdital.reduce((s, i) => s + (i.valor_total_estimado || 0), 0);
      const lote = await crudCreate("lotes", {
        edital_id: editalId,
        numero_lote: lotes.length + 1,
        nome: `Lote ${String(lotes.length + 1).padStart(2, "0")}`,
        valor_estimado: valorTotal,
        status: "rascunho",
      });
      // Vincular itens ao lote
      const loteId = (lote as Record<string, unknown>).id as string;
      for (let i = 0; i < itensEdital.length; i++) {
        await crudCreate("lote-itens", {
          lote_id: loteId,
          edital_item_id: itensEdital[i].id,
          ordem: i + 1,
        });
      }
      loadLotes(editalId);
    } catch { /* */ }
  };

  const handleSalvarLote = async (loteId: string) => {
    try {
      await crudUpdate("lotes", loteId, {
        especialidade: loteEspecialidade || undefined,
        volume_exigido: loteVolume ? Number(loteVolume) : undefined,
        tipo_amostra: loteTipoAmostra || undefined,
        equipamento_exigido: loteEquipamento || undefined,
        observacoes_tecnicas: loteObservacoes || undefined,
        status: "configurado",
      });
      loadLotes(editalId);
    } catch { /* */ }
  };

  const handleSelecaoPortfolio = async (itemId: string) => {
    setSelecaoItemId(itemId);
    // Carregar produtos e ordenar por relevância ao item
    try {
      const res = await crudList("produtos", { limit: 100 });
      const prods = res.items as unknown as Array<{ id: string; nome: string; fabricante: string; categoria: string }>;
      // Encontrar descrição do item para match
      const item = itensEdital.find(it => it.id === itemId);
      const descItem = (item?.descricao || "").toLowerCase();
      // Calcular score de match simples (palavras em comum)
      const palavrasItem = descItem.split(/\s+/).filter(w => w.length > 3);
      const sugestoesSorted = prods.map(p => {
        const nomeLower = p.nome.toLowerCase();
        const matchCount = palavrasItem.filter(w => nomeLower.includes(w)).length;
        return { produto_id: p.id, nome: p.nome, fabricante: p.fabricante || "—", categoria: p.categoria || "", match_score: matchCount };
      }).sort((a, b) => b.match_score - a.match_score);
      setSugestoes(sugestoesSorted);
    } catch (err) { console.error("[SELECAO] Erro ao carregar produtos:", err); }
    setShowSelecaoModal(true);
  };

  const handleConfirmarSelecao = async (produtoId: string) => {
    try {
      // Buscar vínculo existente (no state OU no banco)
      let existente = vinculos.find(v => (v as Record<string,unknown>).edital_item_id === selecaoItemId);
      if (!existente) {
        // Tentar buscar no banco (pode existir mas não estar no state filtrado)
        try {
          const dbRes = await crudList("edital-item-produto", { edital_item_id: selecaoItemId, limit: 1 });
          const dbItems = (dbRes.items || []) as unknown as Vinculo[];
          if (dbItems.length > 0) existente = dbItems[0];
        } catch { /* ignore */ }
      }
      if (existente) {
        try {
          await crudUpdate("edital-item-produto", existente.id, {
            produto_id: produtoId,
            match_score: 100,
            confirmado: true,
          });
        } catch {
          // Se update falha (ex: constraint), deletar e recriar
          const { crudDelete } = await import("../api/crud");
          await crudDelete("edital-item-produto", existente.id);
          await crudCreate("edital-item-produto", {
            edital_item_id: selecaoItemId,
            produto_id: produtoId,
            match_score: 100,
            confirmado: true,
          });
        }
      } else {
        await crudCreate("edital-item-produto", {
          edital_item_id: selecaoItemId,
          produto_id: produtoId,
          match_score: 100,
          confirmado: true,
        });
      }
      setShowSelecaoModal(false);
      loadLotes(editalId);
      alert("Produto vinculado com sucesso!");
    } catch (err) {
      console.error("[SELECAO] Erro:", err);
      alert("Erro ao vincular produto.");
    }
  };

  const handleCalcVolume = async () => {
    if (!vinculoId) return;
    setLoading(true);
    try {
      const vol = Number(volEdital) || 0;
      const rend = Number(rendimento) || 1;
      const rAmostras = Number(repAmostras) || 0;
      const rCalib = Number(repCalib) || 0;
      const rControles = Number(repControles) || 0;
      const total = vol + rAmostras + rCalib + rControles;
      const kits = Math.ceil(total / rend);
      const formula = `(${vol} + ${rAmostras} + ${rCalib} + ${rControles}) / ${rend} = ${(total/rend).toFixed(3)} → ${kits} kits`;
      await crudUpdate("edital-item-produto", vinculoId, {
        volume_edital: vol,
        rendimento_produto: rend,
        repeticoes_amostras: rAmostras,
        repeticoes_calibradores: rCalib,
        repeticoes_controles: rControles,
        volume_real_ajustado: total,
        quantidade_kits: kits,
        formula_calculo: formula,
      });
      // Refresh
      const v = await crudGet("edital-item-produto", vinculoId) as unknown as Vinculo;
      setVinculos(prev => prev.map(x => x.id === vinculoId ? v : x));
      alert(`Conversão salva! ${kits} embalagens/kits necessários.`);
    } catch (err) {
      console.error("[VOLUMETRIA] Erro:", err);
      alert(`Erro ao calcular: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  const _fetchPrecif = async (url: string, body: Record<string, unknown>) => {
    const token = localStorage.getItem("editais_ia_access_token");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erro");
    return data;
  };

  const handleSalvarCustos = async () => {
    if (!vinculoId) return;
    setLoading(true);
    try {
      const result = await _fetchPrecif(`/api/precificacao/${vinculoId}/custos`, {
        custo_unitario: custoUnit ? parseFloat(custoUnit) : null,
      });
      // Recarregar camada
      const camadas = await crudList("preco-camadas", { edital_item_produto_id: vinculoId, limit: 1 });
      if (camadas.items?.length > 0) setCamada(camadas.items[0] as PrecoCamada);
      alert("Custos salvos com sucesso!");
    } catch (e) { alert(e instanceof Error ? e.message : "Erro ao salvar custos"); }
    finally { setLoading(false); }
  };

  const handleSalvarPrecoBase = async () => {
    if (!vinculoId) return;
    setLoading(true);
    try {
      await _fetchPrecif(`/api/precificacao/${vinculoId}/preco-base`, {
        modo: modoPrecoBase === "markup" ? "custo_markup" : "manual",
        markup_percentual: modoPrecoBase === "markup" && markup ? parseFloat(markup) : null,
        preco_base: modoPrecoBase !== "markup" && precoBaseManual ? parseFloat(precoBaseManual) : null,
      });
      const camadas = await crudList("preco-camadas", { edital_item_produto_id: vinculoId, limit: 1 });
      if (camadas.items?.length > 0) setCamada(camadas.items[0] as PrecoCamada);
      alert("Preço base salvo!");
    } catch (e) { alert(e instanceof Error ? e.message : "Erro ao salvar preço base"); }
    finally { setLoading(false); }
  };

  const handleSalvarReferencia = async () => {
    if (!vinculoId) return;
    setLoading(true);
    try {
      await _fetchPrecif(`/api/precificacao/${vinculoId}/referencia`, {
        valor_referencia: valorRef ? parseFloat(valorRef) : null,
        percentual_sobre_base: pctSobreBase ? parseFloat(pctSobreBase) : null,
      });
      const camadas = await crudList("preco-camadas", { edital_item_produto_id: vinculoId, limit: 1 });
      if (camadas.items?.length > 0) setCamada(camadas.items[0] as PrecoCamada);
      alert("Valor de referência salvo!");
    } catch (e) { alert(e instanceof Error ? e.message : "Erro ao salvar referência"); }
    finally { setLoading(false); }
  };

  const handleSalvarLances = async () => {
    if (!vinculoId) return;
    setLoading(true);
    try {
      await _fetchPrecif(`/api/precificacao/${vinculoId}/lances`, {
        lance_inicial: lanceInicial ? parseFloat(lanceInicial) : null,
        lance_minimo: lanceMinimo ? parseFloat(lanceMinimo) : null,
        modo_inicial: modoInicial,
        modo_minimo: modoMinimo,
        desconto_maximo_pct: descontoMax ? parseFloat(descontoMax) : null,
      });
      const camadas = await crudList("preco-camadas", { edital_item_produto_id: vinculoId, limit: 1 });
      if (camadas.items?.length > 0) setCamada(camadas.items[0] as PrecoCamada);
      alert("Lances salvos!");
    } catch (e) { alert(e instanceof Error ? e.message : "Erro ao salvar lances"); }
    finally { setLoading(false); }
  };

  const handleSimularEstrategia = async () => {
    if (!editalId) return;
    setLoading(true);
    try {
      const result = await _fetchPrecif(`/api/precificacao/${editalId}/estrategia`, { perfil });
      if (result.cenarios) setCenarios(result.cenarios);
      alert("Estratégia salva!");
    } catch (e) { alert(e instanceof Error ? e.message : "Erro ao salvar estratégia"); }
    finally { setLoading(false); }
  };

  const handleBuscarHistorico = async () => {
    if (!termoBusca) return;
    setLoading(true);
    try {
      const res = await crudList("precos-historicos", { q: termoBusca, limit: 50 });
      const items = res.items as Record<string, unknown>[];
      const mapped: HistoricoPreco[] = items.map((item) => ({
        id: String(item.id ?? ""),
        produto: String(item.produto ?? item.nome_produto ?? ""),
        preco: Number(item.preco ?? item.preco_ofertado ?? 0),
        data: String(item.data ?? item.data_licitacao ?? ""),
        edital: String(item.edital ?? item.numero_edital ?? ""),
        resultado: (item.resultado === "ganho" ? "ganho" : "perdido") as "ganho" | "perdido",
      }));
      setHistorico(mapped);
      const vals = mapped.map(h => h.preco).filter(v => v > 0);
      if (vals.length > 0) {
        setHistStats({
          media: vals.reduce((a, b) => a + b, 0) / vals.length,
          min: Math.min(...vals),
          max: Math.max(...vals),
        });
      }
    } catch {
      if (onSendToChat) onSendToChat(`busque preços históricos de ${termoBusca} no PNCP`);
    }
    setLoading(false);
  };

  const handleSalvarComodato = async () => {
    if (!editalId) return;
    try {
      const meses = Number(comodatoMeses) || 0;
      const valor = Number(comodatoValor.replace(/\./g, "").replace(",", ".")) || 0;
      await crudCreate("comodatos", {
        edital_id: editalId,
        nome_equipamento: comodatoNome || "Equipamento",
        valor_equipamento: valor,
        duracao_meses: meses,
        valor_mensal_amortizacao: meses > 0 ? valor / meses : null,
      });
      loadLotes(editalId);
      setComodatoNome(""); setComodatoValor(""); setComodatoMeses("");
    } catch { /* */ }
  };

  const handleExportCSV = () => {
    if (historico.length === 0) return;
    const header = "Produto;Preco;Data;Edital;Resultado\n";
    const rows = historico.map((h) => `${h.produto};${h.preco};${h.data};${h.edital};${h.resultado}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historico-precos.csv";
    link.click();
  };

  // ── Vinculo selector for Custos e Preços/Lances tabs ──
  const vinculoOptions = [
    { value: "", label: "Selecione item-produto..." },
    ...vinculos.map(v => {
      const item = itensEdital.find(i => i.id === v.edital_item_id);
      const prod = produtos.find(p => p.id === v.produto_id);
      // Descobrir lote do item
      const loteEntry = Object.entries(loteItensMap).find(([, ids]) => ids.includes(v.edital_item_id));
      const lote = loteEntry ? lotes.find(l => l.id === loteEntry[0]) : null;
      // Nome curto do item (extrair de parênteses ou tipo de análise)
      const desc = item?.descricao || "";
      const parenMatch = desc.match(/\(([^)]{2,30})\)/);
      const tipoMatch = desc.match(/tipo de an[aá]lise:\s*([^,]{3,40})/i);
      const shortName = parenMatch ? parenMatch[1] : tipoMatch ? tipoMatch[1].trim() : desc.slice(0, 30);
      const loteLabel = lote ? `Lote ${lote.numero_lote} (${lote.nome})` : "";
      return {
        value: v.id,
        label: `${loteLabel} → ${shortName} / ${prod?.nome?.slice(0, 30) ?? "Produto"} ${v.confirmado ? "✓" : ""}`,
      };
    }),
  ];

  const curVinculo = vinculos.find(v => v.id === vinculoId);

  // Detectar se existe produto compatível no portfolio para um item
  const _norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const _stopWords = new Set(["para","tipo","conjunto","completo","caracteristicas","adicionais","equipamento","apresentacao","metodo","teste","reagente","diagnostico","clinico","marca","dispositivos"]);
  const temProdutoCompativelNoPortfolio = useCallback((descricao: string): boolean => {
    if (!descricao || produtos.length === 0) return false;
    // Extrair nome curto: conteúdo entre parênteses (ex: "TP", "TTPA") ou tipo de análise
    const parenMatch = descricao.match(/\(([^)]{2,30})\)/);
    const tipoMatch = descricao.match(/tipo de an[aá]lise:\s*([^,]{3,60})/i);
    const keyPhrase = parenMatch ? parenMatch[1] : tipoMatch ? tipoMatch[1] : "";
    if (!keyPhrase) return false; // sem nome curto identificável = não dá pra comparar
    const keyNorm = _norm(keyPhrase);
    const keyWords = keyNorm.split(/\s+/).filter(w => w.length > 2 && !_stopWords.has(w));
    if (keyWords.length === 0) return false;

    return produtos.some(p => {
      const nomeLower = _norm(p.nome || "");
      // Match: pelo menos 1 palavra-chave do nome curto aparece no nome do produto
      return keyWords.some(kw => nomeLower.includes(kw));
    });
  }, [produtos]);

  // ── Column defs ──
  const historicoColumns: Column<HistoricoPreco>[] = [
    { key: "produto", header: "Produto", sortable: true },
    { key: "preco", header: "Preço", render: (h) => fmt(h.preco), sortable: true },
    { key: "data", header: "Data", sortable: true },
    { key: "edital", header: "Edital" },
    {
      key: "resultado", header: "Resultado",
      render: (h) => (
        <span className={`status-badge ${h.resultado === "ganho" ? "status-badge-success" : "status-badge-error"}`}>
          {h.resultado === "ganho" ? "Ganho" : "Perdido"}
        </span>
      ),
    },
  ];

  // ── Handlers: Buscar na Web / ANVISA (modal → IA) ──
  const handleBuscaWebConfirm = async () => {
    if (!buscaNomeProduto) return;
    const msg = buscaFabricante
      ? `Busque o manual do produto ${buscaNomeProduto} do fabricante ${buscaFabricante} na web e cadastre`
      : `Busque o manual do produto ${buscaNomeProduto} na web e cadastre`;
    setShowBuscaWebModal(false);
    setIaProcessing("Buscando produto na web...");
    setIaResponse(null);
    try {
      const session = await createSession("precif-busca-web") as Record<string, unknown>;
      const sid = String(session.session_id || session.id);
      const resp = await sendMessage(sid, msg);
      setIaResponse(resp.response || "Busca web concluída.");
      setBuscaNomeProduto("");
      setBuscaFabricante("");
      if (editalId) loadLotes(editalId);
    } catch (err) {
      console.error("[BuscaWeb] Erro:", err);
      setIaResponse(`Erro: ${err instanceof Error ? err.message : "Falha na busca web"}`);
    } finally {
      setIaProcessing(null);
    }
  };

  const handleAnvisaConfirm = async () => {
    let msg = "";
    if (anvisaRegistro) msg = `Busque o registro ANVISA numero ${anvisaRegistro}`;
    else if (anvisaNomeProduto) msg = `Busque registros ANVISA para o produto ${anvisaNomeProduto}`;
    else return;
    setShowAnvisaModal(false);
    setIaProcessing("Buscando registros ANVISA...");
    setIaResponse(null);
    try {
      const session = await createSession("precif-anvisa") as Record<string, unknown>;
      const sid = String(session.session_id || session.id);
      const resp = await sendMessage(sid, msg);
      setIaResponse(resp.response || "Busca ANVISA concluída.");
      setAnvisaRegistro("");
      setAnvisaNomeProduto("");
      if (editalId) loadLotes(editalId);
    } catch (err) {
      console.error("[ANVISA] Erro:", err);
      setIaResponse(`Erro: ${err instanceof Error ? err.message : "Falha na busca ANVISA"}`);
    } finally {
      setIaProcessing(null);
    }
  };

  // ── Tabs ──
  const tabs = [
    { id: "lotes", label: `Lotes ${lotes.length > 0 ? (lotes.some(l => (l as Record<string,unknown>).status === "configurado") ? "✅" : "⚠️") : "❌"}`, icon: <Layers size={16} /> },
    { id: "camadas", label: `Custos e Preços ${camada ? (camada.preco_base ? "✅" : "⚠️") : "❌"}`, icon: <DollarSign size={16} /> },
    { id: "lances", label: `Lances ${camada?.lance_inicial ? "✅" : "❌"}`, icon: <Target size={16} /> },
    { id: "historico", label: "Histórico", icon: <History size={16} /> },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <DollarSign size={24} />
          <div>
            <h1>Precificação</h1>
            <p>Custos, preços, lances e estratégia competitiva</p>
          </div>
        </div>
      </div>

      {/* Edital selector — global */}
      <div className="page-content">
        <Card title="Edital" icon={<Search size={18} />}>
          <div className="form-grid form-grid-2">
            <FormField label="Selecione o edital">
              <SelectInput value={editalId} onChange={setEditalId} options={editalOptions} />
            </FormField>
            <div className="form-field-actions" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <ActionButton
                icon={<Layers size={16} />}
                label="Criar Lotes"
                variant="primary"
                onClick={handleCriarLotes}
                loading={loading}
                disabled={itensEdital.length === 0}
              />
            </div>
          </div>
        </Card>

        {editalId && (
          <TabPanel tabs={tabs} defaultTab="lotes">
            {(activeTab) => (
              <>
                {/* ═══════════════════ TAB: LOTES (UC-P01) ═══════════════════ */}
                {activeTab === "lotes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Card title={`Lotes (${lotes.length})`} icon={<Layers size={18} />}>
                      {lotes.length === 0 ? (
                        <p style={{ color: "var(--text-secondary)", padding: "16px 0" }}>
                          {itensEdital.length === 0
                            ? "Este edital não possui itens. Importe os itens na fase de captação/validação antes de precificar."
                            : `${itensEdital.length} item(ns) encontrado(s). Clique em "Criar Lotes" para agrupá-los.`}
                        </p>
                      ) : (
                        <div>
                          {lotes.map((lote) => (
                            <div key={lote.id} className="card" style={{ marginBottom: 8, padding: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                                onClick={() => {
                                  const novoId = loteExpandido === lote.id ? null : lote.id;
                                  setLoteExpandido(novoId);
                                  if (novoId) {
                                    setLoteEspecialidade(lote.especialidade || "");
                                    setLoteVolume(String(lote.volume_exigido || ""));
                                    setLoteTipoAmostra(String((lote as Record<string,unknown>).tipo_amostra || ""));
                                    setLoteEquipamento(String((lote as Record<string,unknown>).equipamento_exigido || ""));
                                    setLoteObservacoes(String((lote as Record<string,unknown>).observacoes_tecnicas || ""));
                                  }
                                }}>
                                <div>
                                  <strong>Lote {lote.numero_lote}</strong> — {lote.nome || "Sem nome"}
                                  <span className={`status-badge status-badge-${lote.status === "configurado" ? "success" : "warning"}`} style={{ marginLeft: 8 }}>
                                    {lote.status}
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                  <span>{fmt(lote.valor_estimado)}</span>
                                  {loteExpandido === lote.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                              </div>
                              {loteExpandido === lote.id && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                                  <div className="form-grid form-grid-3">
                                    <FormField label="Especialidade">
                                      <TextInput value={loteEspecialidade || lote.especialidade || ""} onChange={setLoteEspecialidade} placeholder="Ex: Hematologia, Microscopia" />
                                    </FormField>
                                    <FormField label="Volume Exigido (testes/unidades)">
                                      <TextInput value={loteVolume || String(lote.volume_exigido || "")} onChange={setLoteVolume} placeholder="Ex: 50000" />
                                    </FormField>
                                    <FormField label="Tipo de Amostra">
                                      <TextInput value={loteTipoAmostra || String((lote as Record<string,unknown>).tipo_amostra || "")} onChange={setLoteTipoAmostra} placeholder="Ex: Sangue total, Soro, Urina" />
                                    </FormField>
                                  </div>
                                  <div className="form-grid form-grid-2" style={{ marginTop: 8 }}>
                                    <FormField label="Equipamento Exigido">
                                      <TextInput value={loteEquipamento || String((lote as Record<string,unknown>).equipamento_exigido || "")} onChange={setLoteEquipamento} placeholder="Ex: Analisador bioquímico, Microscópio" />
                                    </FormField>
                                    <FormField label="Descrição / Observações Técnicas">
                                      <TextInput value={loteObservacoes || String((lote as Record<string,unknown>).observacoes_tecnicas || "")} onChange={setLoteObservacoes} placeholder="Observações sobre o lote" />
                                    </FormField>
                                  </div>
                                  <div style={{ marginTop: 8 }}>
                                    <ActionButton icon={<Check size={16} />} label="Atualizar Lote" variant="primary" onClick={() => handleSalvarLote(lote.id)} />
                                  </div>

                                  {/* Itens deste lote */}
                                  <h4 style={{ margin: "12px 0 8px" }}>Itens do Edital</h4>
                                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                        <th style={{ textAlign: "left", padding: 4 }}>#</th>
                                        <th style={{ textAlign: "left", padding: 4 }}>Descrição</th>
                                        <th style={{ textAlign: "right", padding: 4 }}>Qtd</th>
                                        <th style={{ textAlign: "right", padding: 4 }}>Valor Unit.</th>
                                        <th style={{ textAlign: "left", padding: 4 }}>Produto Vinculado</th>
                                        <th style={{ padding: 4 }}></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(() => {
                                        // Filtrar itens que pertencem a este lote
                                        const itensDoLote = loteItensMap[lote.id]
                                          ? itensEdital.filter(it => loteItensMap[lote.id].includes(it.id))
                                          : itensEdital; // fallback: todos (lote sem mapeamento)
                                        return itensDoLote;
                                      })().slice(0, 20).map((it) => {
                                        const vinculo = vinculos.find(v => (v as Record<string,unknown>).edital_item_id === it.id);
                                        const prodVinculado = vinculo ? produtos.find(p => p.id === (vinculo as Record<string,unknown>).produto_id) : null;
                                        return (
                                        <tr key={it.id} style={{ borderBottom: "1px solid var(--border-light, #eee)" }}>
                                          <td style={{ padding: 4 }}>{it.numero_item}</td>
                                          <td style={{ padding: 4, maxWidth: 350 }}>
                                            {(() => {
                                              const desc = it.descricao || "";
                                              // Extrair nome curto: conteúdo entre parênteses ou "tipo de análise: ..."
                                              const parenMatch = desc.match(/\(([^)]{2,30})\)/);
                                              const tipoMatch = desc.match(/tipo de an[aá]lise:\s*([^,]{3,60})/i);
                                              const shortName = parenMatch ? parenMatch[1] : tipoMatch ? tipoMatch[1].trim() : null;
                                              return (
                                                <div>
                                                  {shortName && (
                                                    <strong style={{ display: "block", fontSize: 13, marginBottom: 2, color: "var(--text-primary)" }}>
                                                      {shortName}
                                                    </strong>
                                                  )}
                                                  <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {desc}
                                                  </span>
                                                </div>
                                              );
                                            })()}
                                          </td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{it.quantidade}</td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{fmt(it.valor_unitario_estimado)}</td>
                                          <td style={{ padding: 4 }}>
                                            {prodVinculado ? (
                                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>
                                                ✅ {prodVinculado.nome?.slice(0, 30)}
                                              </span>
                                            ) : (it as Record<string, unknown>)._ignorado || (it as Record<string, unknown>).tipo_beneficio === "ignorado" ? (
                                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: "#64748b20", color: "#94a3b8", border: "1px solid #64748b40" }}>
                                                ⏭️ Ignorado
                                              </span>
                                            ) : temProdutoCompativelNoPortfolio(it.descricao) ? (
                                              <span style={{ fontSize: 12, color: "#f59e0b" }}>⚠️ Não vinculado — existe produto compatível</span>
                                            ) : (
                                              <span style={{ fontSize: 12, color: "#ef4444" }}>❌ Sem produto no portfolio</span>
                                            )}
                                          </td>
                                          <td style={{ padding: 4, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                                              <ActionButton
                                                icon={<Target size={14} />}
                                                label={prodVinculado ? "Trocar" : "Vincular"}
                                                variant={prodVinculado ? "neutral" : "primary"}
                                                onClick={() => handleSelecaoPortfolio(it.id)}
                                              />
                                              <ActionButton
                                                icon={<Lightbulb size={14} />}
                                                label="IA"
                                                variant="neutral"
                                                loading={loading}
                                                onClick={async () => {
                                                  setLoading(true);
                                                  try {
                                                    const token = localStorage.getItem("editais_ia_access_token");
                                                    const res = await fetch(`/api/precificacao/vincular-ia/${it.id}`, {
                                                      method: "POST",
                                                      headers: { Authorization: token ? `Bearer ${token}` : "" },
                                                    });
                                                    const data = await res.json();
                                                    if (data.success && data.auto_vinculado) {
                                                      loadLotes(editalId);
                                                      alert(`IA vinculou: ${data.produto_nome || "Produto"} (match: ${data.match_score || 0}%)\n${data.justificativa || ""}`);
                                                    } else if (data.success && !data.auto_vinculado) {
                                                      // IA não encontrou match suficiente
                                                      const cadastrar = window.confirm(
                                                        "Nenhum produto compatível encontrado no portfolio.\n\n" +
                                                        "Deseja cadastrar um novo produto?\n" +
                                                        "(Clique OK para ir ao Portfolio, Cancelar para pular este item)"
                                                      );
                                                      if (cadastrar) {
                                                        window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "portfolio" } }));
                                                      }
                                                    } else {
                                                      const cadastrar = window.confirm(
                                                        `${data.error || "Nenhum produto compatível"}\n\nDeseja cadastrar um novo produto no Portfolio?`
                                                      );
                                                      if (cadastrar) {
                                                        window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "portfolio" } }));
                                                      }
                                                    }
                                                  } catch { alert("Erro ao vincular com IA"); }
                                                  finally { setLoading(false); }
                                                }}
                                              />
                                              {prodVinculado ? (
                                                <ActionButton
                                                  icon={<X size={14} />}
                                                  label="Desvincular"
                                                  variant="neutral"
                                                  onClick={async () => {
                                                    if (!window.confirm(`Desvincular "${prodVinculado.nome?.slice(0, 30)}" deste item?`)) return;
                                                    try {
                                                      const { crudDelete } = await import("../api/crud");
                                                      await crudDelete("edital-item-produto", vinculo!.id);
                                                      loadLotes(editalId);
                                                    } catch { alert("Erro ao desvincular."); }
                                                  }}
                                                />
                                              ) : (it as Record<string, unknown>)._ignorado ? (
                                                <ActionButton
                                                  icon={<Check size={14} />}
                                                  label="Reativar"
                                                  variant="neutral"
                                                  onClick={async () => {
                                                    try {
                                                      await crudUpdate("editais-itens", it.id, { tipo_beneficio: null });
                                                      setItensEdital(prev => prev.map(item =>
                                                        item.id === it.id ? { ...item, _ignorado: false } as EditalItem : item
                                                      ));
                                                    } catch { alert("Erro ao reativar item."); }
                                                  }}
                                                />
                                              ) : (
                                                <>
                                                  <ActionButton
                                                    icon={<Globe size={14} />}
                                                    label="Buscar na Web"
                                                    variant="neutral"
                                                    onClick={() => {
                                                      setBuscaNomeProduto((it.descricao || "").slice(0, 120));
                                                      setBuscaFabricante("");
                                                      setShowBuscaWebModal(true);
                                                    }}
                                                  />
                                                  <ActionButton
                                                    icon={<Shield size={14} />}
                                                    label="ANVISA"
                                                    variant="neutral"
                                                    onClick={() => {
                                                      setAnvisaNomeProduto((it.descricao || "").slice(0, 120));
                                                      setAnvisaRegistro("");
                                                      setShowAnvisaModal(true);
                                                    }}
                                                  />
                                                  <ActionButton
                                                    icon={<X size={14} />}
                                                    label="Ignorar"
                                                    variant="neutral"
                                                    onClick={async () => {
                                                      try {
                                                        await crudUpdate("editais-itens", it.id, { tipo_beneficio: "ignorado" });
                                                        setItensEdital(prev => prev.map(item =>
                                                          item.id === it.id ? { ...item, _ignorado: true } as EditalItem : item
                                                        ));
                                                      } catch { alert("Erro ao ignorar item."); }
                                                    }}
                                                  />
                                                </>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  {itensEdital.length > 20 && <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>... e mais {itensEdital.length - 20} itens</p>}
                                  {/* Resposta da IA (busca web / ANVISA) */}
                                  {iaProcessing && (
                                    <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, backgroundColor: "#1e293b", fontSize: 12, color: "#60a5fa", display: "flex", alignItems: "center", gap: 8 }}>
                                      <Loader2 size={14} className="spin" /> {iaProcessing}
                                    </div>
                                  )}
                                  {iaResponse && !iaProcessing && (
                                    <Card>
                                      <div style={{ position: "relative" }}>
                                        <button
                                          onClick={() => setIaResponse(null)}
                                          style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 18 }}
                                        >&times;</button>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                          <Sparkles size={18} style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: 2 }} />
                                          <div className="markdown-response" style={{ fontSize: 12, maxHeight: 300, overflowY: "auto" }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({href, children}) => <a href={href as string} target="_blank" rel="noopener noreferrer">{children}</a> }}>{iaResponse}</ReactMarkdown>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* ═══════════════════ TAB: CUSTOS E PREÇOS (UC-P02 a UC-P06) ═══════════════════ */}
                {activeTab === "camadas" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Item-Produto selector */}
                    <Card title="Selecionar Item-Produto" icon={<Package size={18} />}>
                      <FormField label="Vínculo Item ↔ Produto">
                        <SelectInput value={vinculoId} onChange={setVinculoId} options={vinculoOptions} />
                      </FormField>
                      {vinculoOptions.length <= 1 && (
                        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8 }}>
                          Nenhum vínculo item-produto encontrado. Vá à aba Lotes e clique no ícone <Target size={12} /> para vincular produtos.
                        </p>
                      )}
                    </Card>

                    {vinculoId && (
                      <>
                        {/* Banner de detecção de volumetria */}
                        <Card title="Conversão de Quantidade" icon={<BarChart3 size={18} />}>
                          <div style={{ padding: 16, borderRadius: 8, border: "2px solid #3b82f6", backgroundColor: "#3b82f610", textAlign: "center" }}>
                            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
                              Este item requer conversão de quantidade?
                            </p>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                              {precisaVolumetria
                                ? "Detectamos que este item é vendido em embalagem com rendimento fixo (ex: kit com X testes, caixa com X unidades). O cálculo converte a quantidade do edital em número de embalagens."
                                : "Detectamos que este item é de compra unitária. A quantidade do edital será usada diretamente."}
                            </p>
                            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: 14, padding: "8px 24px", opacity: precisaVolumetria ? 1 : 0.5 }}
                                onClick={() => setPrecisaVolumetria(true)}
                              >
                                Sim, converter quantidade
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: 14, padding: "8px 24px", opacity: !precisaVolumetria ? 1 : 0.5 }}
                                onClick={() => setPrecisaVolumetria(false)}
                              >
                                Não, usar quantidade do edital
                              </button>
                            </div>
                          </div>

                          {/* UC-P03: Campos de volumetria — só se confirmado */}
                          {precisaVolumetria && (
                            <>
                              <div className="form-grid form-grid-3" style={{ marginTop: 12 }}>
                                <FormField label="Quantidade do Edital">
                                  <TextInput value={volEdital} onChange={setVolEdital} placeholder="Qtd exigida no edital" />
                                </FormField>
                                <FormField label="Rendimento por Embalagem">
                                  <TextInput value={rendimento} onChange={setRendimento} placeholder="Unidades por embalagem/kit" />
                                </FormField>
                                <FormField label="Rep. Amostras">
                                  <TextInput value={repAmostras} onChange={setRepAmostras} placeholder="0" />
                                </FormField>
                                <FormField label="Rep. Calibradores">
                                  <TextInput value={repCalib} onChange={setRepCalib} placeholder="0" />
                                </FormField>
                                <FormField label="Rep. Controles">
                                  <TextInput value={repControles} onChange={setRepControles} placeholder="0" />
                                </FormField>
                                <div className="form-field-actions">
                                  <ActionButton icon={<BarChart3 size={16} />} label="Calcular e Salvar" variant="primary" onClick={handleCalcVolume} loading={loading} />
                                </div>
                              </div>
                              {curVinculo?.formula_calculo && (
                                <div style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
                                  <strong>Fórmula:</strong> {curVinculo.formula_calculo}<br />
                                  <strong>Kits necessários:</strong> {curVinculo.quantidade_kits}
                                </div>
                              )}
                            </>
                          )}

                          {/* Sem volumetria: mostra resumo direto */}
                          {precisaVolumetria === false && (
                            <div style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
                              {(() => {
                                const item = itensEdital.find(i => i.id === curVinculo?.edital_item_id);
                                const qtd = item?.quantidade || 0;
                                return (
                                  <>
                                    <strong>Quantidade do edital:</strong> {qtd} unidades — será usada diretamente como quantidade final.
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </Card>

                        {/* Card IA: Precificação Assistida */}
                        <Card title="Precificação Assistida por IA" icon={<Sparkles size={18} />}>
                          {insightsLoading && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 0", color: "#60a5fa", fontSize: 13 }}>
                              <Loader2 size={16} className="spin" /> Buscando histórico de preços e atas no PNCP...
                            </div>
                          )}
                          {!insightsLoading && (!insights || !(insights as Record<string, unknown>).tem_dados) && (
                            <div style={{ padding: "12px", fontSize: 13, color: "var(--text-secondary)", borderRadius: 8, backgroundColor: "var(--bg-secondary, #f5f5f5)" }}>
                              <p style={{ marginBottom: 8 }}>Nenhum registro histórico ou ata encontrado para este produto.</p>
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <ActionButton icon={<Search size={14} />} label="Rebuscar no PNCP" variant="primary" loading={insightsLoading}
                                  onClick={() => {
                                    setInsights(null);
                                    setInsightsLoading(true);
                                    const token = localStorage.getItem("editais_ia_access_token");
                                    fetch(`/api/precificacao/${vinculoId}/insights`, { headers: { Authorization: token ? `Bearer ${token}` : "" } })
                                      .then(r => r.json()).then(data => { if (data.success) setInsights(data); })
                                      .catch(() => {}).finally(() => setInsightsLoading(false));
                                  }}
                                />
                              </div>
                              {insights && (insights as Record<string, unknown>).termos_tentados && (
                                <p style={{ fontSize: 11, marginTop: 8, color: "#64748b" }}>
                                  Termos buscados: {((insights as Record<string, unknown>).termos_tentados as string[]).join(" | ")}
                                  {(insights as Record<string, unknown>).etapa && <span> | Etapa: {String((insights as Record<string, unknown>).etapa)}</span>}
                                </p>
                              )}
                            </div>
                          )}
                          {!insightsLoading && insights && (insights as Record<string, unknown>).tem_dados && (
                            <>
                              {/* Banner resumo */}
                              <div style={{ display: "flex", gap: 16, padding: "8px 12px", borderRadius: 8, backgroundColor: "#3b82f610", border: "1px solid #3b82f630", fontSize: 13, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                                <span><strong>{insights.historico.qtd_registros}</strong> registros</span>
                                {(insights as Record<string, unknown>).atas_encontradas ? <span><strong>{String((insights as Record<string, unknown>).atas_encontradas)}</strong> atas</span> : null}
                                {insights.historico.preco_min != null && (
                                  <>
                                    <span>Mín: <strong style={{ color: "#22c55e" }}>{fmt(insights.historico.preco_min)}</strong></span>
                                    <span>Média: <strong>{fmt(insights.historico.preco_medio)}</strong></span>
                                    <span>Máx: <strong style={{ color: "#ef4444" }}>{fmt(insights.historico.preco_max)}</strong></span>
                                  </>
                                )}
                                {insights.referencia_edital != null && (
                                  <span>Ref. Edital: <strong style={{ color: "#f59e0b" }}>{fmt(insights.referencia_edital)}</strong></span>
                                )}
                                {insights.recomendacao.fonte && (
                                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, backgroundColor: "#3b82f620", color: "#3b82f6" }}>
                                    {insights.recomendacao.fonte}
                                  </span>
                                )}
                                <ActionButton icon={<Search size={12} />} label="Rebuscar" variant="neutral"
                                  onClick={() => {
                                    setInsights(null);
                                    setInsightsLoading(true);
                                    const token = localStorage.getItem("editais_ia_access_token");
                                    fetch(`/api/precificacao/${vinculoId}/insights`, { headers: { Authorization: token ? `Bearer ${token}` : "" } })
                                      .then(r => r.json()).then(data => { if (data.success) setInsights(data); })
                                      .catch(() => {}).finally(() => setInsightsLoading(false));
                                  }}
                                />
                              </div>

                              {/* 5 cards: sugestões A-E */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
                                {[
                                  { label: "Custo (A)", valor: insights.recomendacao.custo_sugerido, desc: "85% do mín. histórico", action: () => setCustoUnit(String(insights.recomendacao.custo_sugerido)) },
                                  { label: "Preço Base (B)", valor: insights.recomendacao.preco_base_sugerido, desc: `Faixa: ${fmt(insights.recomendacao.faixa?.agressivo)}–${fmt(insights.recomendacao.faixa?.conservador)}`, action: () => { setModoPrecoBase("manual"); setPrecoBaseManual(String(insights.recomendacao.preco_base_sugerido)); } },
                                  { label: "Referência (C)", valor: insights.referencia_edital || insights.recomendacao.referencia_sugerida, desc: insights.referencia_edital ? "valor do edital" : "preço conservador", action: () => setValorRef(String(insights.referencia_edital || insights.recomendacao.referencia_sugerida)) },
                                  { label: "Lance Inicial (D)", valor: (insights.recomendacao as Record<string, unknown>).lance_inicial_sugerido as number | null, desc: "= preço base sugerido", action: () => setLanceInicial(String((insights.recomendacao as Record<string, unknown>).lance_inicial_sugerido)) },
                                  { label: "Lance Mínimo (E)", valor: (insights.recomendacao as Record<string, unknown>).lance_minimo_sugerido as number | null, desc: "custo + margem 10%", action: () => setLanceMinimo(String((insights.recomendacao as Record<string, unknown>).lance_minimo_sugerido)) },
                                ].map((s, i) => (
                                  <div key={i} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)", textAlign: "center" }}>
                                    <p style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 2, fontWeight: 600 }}>{s.label}</p>
                                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                                      {s.valor ? fmt(s.valor as number) : "—"}
                                    </p>
                                    <p style={{ fontSize: 9, color: "var(--text-secondary)", marginBottom: 6 }}>{s.desc}</p>
                                    {s.valor && (
                                      <button className="btn btn-secondary" style={{ fontSize: 10, padding: "2px 8px" }} onClick={s.action}>
                                        Usar →
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Concorrentes (colapsável) */}
                              {insights.concorrentes.length > 0 && (
                                <details style={{ fontSize: 12, marginBottom: 8 }}>
                                  <summary style={{ cursor: "pointer", color: "var(--text-secondary)", marginBottom: 6 }}>
                                    Concorrentes principais ({insights.concorrentes.length})
                                  </summary>
                                  <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                        <th style={{ textAlign: "left", padding: 4 }}>Empresa</th>
                                        <th style={{ textAlign: "right", padding: 4 }}>Vitórias</th>
                                        <th style={{ textAlign: "right", padding: 4 }}>Taxa</th>
                                        <th style={{ textAlign: "right", padding: 4 }}>Preço Médio</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {insights.concorrentes.map((c, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid var(--border-light, #eee)" }}>
                                          <td style={{ padding: 4 }}>{c.nome}</td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{c.editais_ganhos}</td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{c.taxa_vitoria.toFixed(1)}%</td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{fmt(c.preco_medio)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </details>
                              )}

                              {/* Atas encontradas (expansível) */}
                              {(insights as Record<string, unknown>).atas_detalhes && ((insights as Record<string, unknown>).atas_detalhes as Array<Record<string, string>>).length > 0 && (
                                <details style={{ fontSize: 12, marginBottom: 8 }}>
                                  <summary style={{ cursor: "pointer", color: "var(--text-secondary)", marginBottom: 6 }}>
                                    Atas consultadas ({((insights as Record<string, unknown>).atas_detalhes as Array<Record<string, string>>).length})
                                  </summary>
                                  {((insights as Record<string, unknown>).atas_detalhes as Array<Record<string, string>>).map((ata, i) => (
                                    <div key={i} style={{ padding: "6px 8px", marginBottom: 4, borderRadius: 6, backgroundColor: "var(--bg-secondary, #f5f5f5)", fontSize: 12 }}>
                                      <strong>{ata.titulo}</strong> — {ata.orgao} ({ata.uf})
                                      {ata.url_pncp && (
                                        <a href={ata.url_pncp} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: "#3b82f6", fontSize: 11 }}>Ver no PNCP ↗</a>
                                      )}
                                    </div>
                                  ))}
                                </details>
                              )}

                              {/* Preços detalhados dos vencedores (expansível) */}
                              {(insights as Record<string, unknown>).vencedores_detalhes && ((insights as Record<string, unknown>).vencedores_detalhes as Array<Record<string, unknown>>).length > 0 && (
                                <details style={{ fontSize: 12, marginBottom: 8 }}>
                                  <summary style={{ cursor: "pointer", color: "var(--text-secondary)", marginBottom: 6 }}>
                                    Preços detalhados dos vencedores
                                  </summary>
                                  {((insights as Record<string, unknown>).vencedores_detalhes as Array<Record<string, unknown>>).map((res, ri) => (
                                    <div key={ri} style={{ marginBottom: 8 }}>
                                      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>
                                        {String(res.ata_titulo)} — {String(res.orgao)}
                                      </p>
                                      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                                        <thead>
                                          <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                            <th style={{ textAlign: "left", padding: 3 }}>Item</th>
                                            <th style={{ textAlign: "left", padding: 3 }}>Descrição</th>
                                            <th style={{ textAlign: "left", padding: 3 }}>Vencedor</th>
                                            <th style={{ textAlign: "right", padding: 3 }}>Estimado</th>
                                            <th style={{ textAlign: "right", padding: 3 }}>Homologado</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {((res.vencedores || []) as Array<Record<string, unknown>>).map((v, vi) => (
                                            <tr key={vi} style={{ borderBottom: "1px solid var(--border-light, #eee)" }}>
                                              <td style={{ padding: 3 }}>{String(v.item)}</td>
                                              <td style={{ padding: 3, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(v.descricao || "")}</td>
                                              <td style={{ padding: 3 }}>{String(v.vencedor || "").slice(0, 25)}</td>
                                              <td style={{ textAlign: "right", padding: 3 }}>{v.valor_estimado ? fmt(Number(v.valor_estimado)) : "—"}</td>
                                              <td style={{ textAlign: "right", padding: 3, fontWeight: 600 }}>{v.valor_homologado ? fmt(Number(v.valor_homologado)) : "—"}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ))}
                                </details>
                              )}

                              {/* Justificativa IA detalhada */}
                              {insights.recomendacao.justificativa && (
                                <details open style={{ fontSize: 12, marginTop: 8 }}>
                                  <summary style={{ cursor: "pointer", color: "var(--text-secondary)", marginBottom: 6, fontWeight: 600 }}>
                                    <Sparkles size={12} style={{ display: "inline", marginRight: 4 }} /> Análise IA — Justificativa dos preços
                                  </summary>
                                  <div className="markdown-response" style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, backgroundColor: "var(--bg-secondary, #f5f5f5)", border: "1px solid var(--border)" }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{insights.recomendacao.justificativa}</ReactMarkdown>
                                  </div>
                                </details>
                              )}
                            </>
                          )}
                        </Card>

                        {/* UC-P04: Base de Custos */}
                        <Card title="Base de Custos" icon={<DollarSign size={18} />}>
                          <div className="form-grid form-grid-3">
                            <FormField label="Custo Unitário (R$)">
                              <TextInput value={custoUnit || String(camada?.custo_unitario || "")} onChange={setCustoUnit} placeholder="85.00" />
                            </FormField>
                            <FormField label="NCM">
                              <TextInput value={camada?.ncm || ""} onChange={() => {}} placeholder="Automático do produto" />
                            </FormField>
                            <div className="form-field-actions">
                              <ActionButton icon={<Check size={16} />} label="Salvar Custos" variant="primary" onClick={handleSalvarCustos} />
                            </div>
                          </div>
                          {camada && (
                            <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
                              <span>ICMS: {pct(camada.icms)} {camada.isencao_icms && <span style={{ color: "var(--color-success, green)" }}>ISENTO</span>}</span>
                              <span>IPI: {pct(camada.ipi)}</span>
                              <span>PIS+COFINS: {pct(camada.pis_cofins)}</span>
                              <span><strong>Custo Final: {fmt(camada.custo_base_final)}</strong></span>
                            </div>
                          )}
                        </Card>

                        {/* UC-P05: Preço Base */}
                        <Card title="Preço Base" icon={<TrendingUp size={18} />}>
                          <div className="form-grid form-grid-3">
                            <FormField label="Modo">
                              <SelectInput value={modoPrecoBase} onChange={setModoPrecoBase} options={[
                                { value: "markup", label: "Custo + Markup" },
                                { value: "manual", label: "Manual" },
                                { value: "upload", label: "Upload" },
                              ]} />
                            </FormField>
                            {modoPrecoBase === "markup" ? (
                              <FormField label="Markup (%)">
                                <TextInput value={markup || String(camada?.markup_percentual || "")} onChange={setMarkup} placeholder="76.47" />
                              </FormField>
                            ) : (
                              <FormField label="Preço Base (R$)">
                                <TextInput value={precoBaseManual || String(camada?.preco_base || "")} onChange={setPrecoBaseManual} placeholder="150.00" />
                              </FormField>
                            )}
                            <div className="form-field-actions">
                              <ActionButton icon={<Check size={16} />} label="Salvar Preço Base" variant="primary" onClick={handleSalvarPrecoBase} />
                            </div>
                          </div>
                          {camada?.preco_base && (
                            <div style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
                              Custo: {fmt(camada.custo_base_final)} → <strong>Preço Base: {fmt(camada.preco_base)}</strong>
                              {camada.markup_percentual && <span> (markup: {pct(camada.markup_percentual)})</span>}
                            </div>
                          )}
                        </Card>

                        {/* UC-P06: Valor de Referência */}
                        <Card title="Valor de Referência" icon={<Target size={18} />}>
                          <div className="form-grid form-grid-3">
                            <FormField label="Valor Referência (R$)" hint={camada?.valor_referencia_disponivel ? "Importado do edital" : "Não disponível no edital"}>
                              <TextInput value={valorRef || String(camada?.valor_referencia_edital || "")} onChange={setValorRef} placeholder="145.00" />
                            </FormField>
                            <FormField label="OU % sobre Preço Base">
                              <TextInput value={pctSobreBase || String(camada?.percentual_sobre_base || "")} onChange={setPctSobreBase} placeholder="95" />
                            </FormField>
                            <div className="form-field-actions">
                              <ActionButton icon={<Check size={16} />} label="Salvar Target" variant="primary" onClick={handleSalvarReferencia} />
                            </div>
                          </div>
                          {camada?.target_referencia && (
                            <div style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
                              <strong>Comparativo:</strong> Custo={fmt(camada.custo_base_final)} | Preço Base={fmt(camada.preco_base)} | <strong>Referência={fmt(camada.target_referencia)}</strong>
                              {camada.margem_sobre_custo != null && <span> | Margem: {pct(camada.margem_sobre_custo)}</span>}
                            </div>
                          )}
                        </Card>
                      </>
                    )}
                  </div>
                )}

                {/* ═══════════════════ TAB: LANCES (UC-P07 + UC-P08) ═══════════════════ */}
                {activeTab === "lances" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Item-Produto selector */}
                    <Card title="Selecionar Item-Produto" icon={<Package size={18} />}>
                      <FormField label="Vínculo Item ↔ Produto">
                        <SelectInput value={vinculoId} onChange={setVinculoId} options={vinculoOptions} />
                      </FormField>
                    </Card>

                    {vinculoId && (
                      <>
                        {/* UC-P07: Lances D + E */}
                        <Card title="Estrutura de Lances (UC-P07)" icon={<Target size={18} />}>
                          <div className="form-grid form-grid-2">
                            <div>
                              <h4 style={{ marginBottom: 8 }}>Valor Inicial do Lance</h4>
                              <FormField label="Modo">
                                <SelectInput value={modoInicial} onChange={setModoInicial} options={[
                                  { value: "absoluto", label: "Valor Absoluto" },
                                  { value: "percentual_referencia", label: "% da Referência" },
                                ]} />
                              </FormField>
                              <FormField label="Valor Inicial (R$)">
                                <TextInput value={lanceInicial || String(camada?.lance_inicial || "")} onChange={setLanceInicial} placeholder="145.00" />
                              </FormField>
                            </div>
                            <div>
                              <h4 style={{ marginBottom: 8 }}>Valor Mínimo do Lance</h4>
                              <FormField label="Modo">
                                <SelectInput value={modoMinimo} onChange={setModoMinimo} options={[
                                  { value: "absoluto", label: "Valor Absoluto" },
                                  { value: "percentual_desconto", label: "% Desconto Máximo" },
                                ]} />
                              </FormField>
                              {modoMinimo === "absoluto" ? (
                                <FormField label="Valor Mínimo (R$)">
                                  <TextInput value={lanceMinimo || String(camada?.lance_minimo || "")} onChange={setLanceMinimo} placeholder="95.00" />
                                </FormField>
                              ) : (
                                <FormField label="Desconto Máximo (%)">
                                  <TextInput value={descontoMax} onChange={setDescontoMax} placeholder="36.67" />
                                </FormField>
                              )}
                            </div>
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <ActionButton icon={<Check size={16} />} label="Salvar Lances" variant="primary" onClick={handleSalvarLances} />
                          </div>

                          {/* Barra visual */}
                          {camada && (camada.lance_inicial || camada.lance_minimo) && (() => {
                            const custo = camada.custo_base_final || 0;
                            const ini = camada.lance_inicial || 0;
                            const min = camada.lance_minimo || 0;
                            const target = camada.target_referencia || 0;
                            const maxVal = Math.max(custo, ini, min, target, 1);
                            const scale = (v: number) => `${Math.min((v / maxVal) * 100, 100)}%`;
                            return (
                              <div style={{ marginTop: 16, padding: 12, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 8 }}>
                                <p style={{ fontSize: 12, marginBottom: 8 }}><strong>Barra de Faixa de Disputa</strong></p>
                                <div style={{ position: "relative", height: 24, background: "#e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                                  {custo > 0 && <div style={{ position: "absolute", left: 0, width: scale(custo), height: "100%", background: "#ef4444", opacity: 0.3 }} />}
                                  {min > 0 && <div style={{ position: "absolute", left: scale(min), width: `calc(${scale(ini)} - ${scale(min)})`, height: "100%", background: "#22c55e", opacity: 0.3 }} />}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
                                  <span>Custo: {fmt(custo)}</span>
                                  <span>Mínimo: {fmt(min)}</span>
                                  <span>Target: {fmt(target)}</span>
                                  <span>Inicial: {fmt(ini)}</span>
                                </div>
                                {camada.margem_minima != null && (
                                  <p style={{ fontSize: 12, marginTop: 4 }}>
                                    Margem mínima: <strong>{pct(camada.margem_minima)}</strong>
                                    {(camada.margem_minima ?? 0) < 0 && <span style={{ color: "red", marginLeft: 4 }}><AlertTriangle size={12} /> Abaixo do custo!</span>}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </Card>

                        {/* UC-P08: Estratégia Competitiva */}
                        <Card title="Estratégia Competitiva (UC-P08)" icon={<Shield size={18} />}>
                          <div className="form-grid form-grid-2">
                            <div
                              onClick={() => setPerfil("quero_ganhar")}
                              style={{
                                padding: 16, borderRadius: 8, cursor: "pointer",
                                border: perfil === "quero_ganhar" ? "2px solid var(--color-primary, #3b82f6)" : "1px solid var(--border)",
                                background: perfil === "quero_ganhar" ? "var(--bg-primary-light, #eff6ff)" : "var(--bg)",
                              }}
                            >
                              <h4>QUERO GANHAR</h4>
                              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Estratégia agressiva — prioriza competitividade</p>
                            </div>
                            <div
                              onClick={() => setPerfil("nao_ganhei_minimo")}
                              style={{
                                padding: 16, borderRadius: 8, cursor: "pointer",
                                border: perfil === "nao_ganhei_minimo" ? "2px solid var(--color-primary, #3b82f6)" : "1px solid var(--border)",
                                background: perfil === "nao_ganhei_minimo" ? "var(--bg-primary-light, #eff6ff)" : "var(--bg)",
                              }}
                            >
                              <h4>NÃO GANHEI NO MÍNIMO</h4>
                              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Reposicionar — renegociar margem</p>
                            </div>
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <ActionButton icon={<TrendingUp size={16} />} label="Simular Disputa" variant="primary" onClick={handleSimularEstrategia} />
                          </div>
                          {cenarios.length > 0 && (
                            <div style={{ marginTop: 12, fontSize: 13 }}>
                              <h4>Cenários</h4>
                              {cenarios.map((c, i) => (
                                <div key={i} style={{ padding: 8, marginTop: 4, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 6 }}>
                                  {JSON.stringify(c)}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </>
                    )}
                  </div>
                )}

                {/* ═══════════════════ TAB: HISTÓRICO (UC-P09 + UC-P10) ═══════════════════ */}
                {activeTab === "historico" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* UC-P09: Histórico */}
                    <Card title="Consultar Histórico de Preços (UC-P09)" icon={<Search size={18} />}>
                      <div className="form-grid form-grid-3">
                        <FormField label="Produto/Termo">
                          <TextInput value={termoBusca} onChange={setTermoBusca} placeholder="reagente hematologia" />
                        </FormField>
                        <div className="form-field-actions" style={{ display: "flex", gap: 8 }}>
                          <ActionButton icon={<Search size={16} />} label="Filtrar" variant="primary" onClick={handleBuscarHistorico} loading={loading} />
                          <ActionButton icon={<Download size={16} />} label="CSV" onClick={handleExportCSV} />
                        </div>
                      </div>
                    </Card>

                    {histStats && (
                      <Card title="Estatísticas" icon={<TrendingUp size={18} />}>
                        <div style={{ display: "flex", gap: 24 }}>
                          <div><label style={{ fontSize: 12 }}>Preço Médio</label><br /><strong>{fmt(histStats.media)}</strong></div>
                          <div><label style={{ fontSize: 12 }}>Mínimo</label><br /><strong style={{ color: "green" }}>{fmt(histStats.min)}</strong></div>
                          <div><label style={{ fontSize: 12 }}>Máximo</label><br /><strong style={{ color: "red" }}>{fmt(histStats.max)}</strong></div>
                        </div>
                      </Card>
                    )}

                    {historico.length > 0 && (
                      <Card title="Resultados" icon={<History size={18} />}>
                        <DataTable data={historico} columns={historicoColumns} idKey="id" emptyMessage="Nenhum registro" />
                      </Card>
                    )}

                    {/* UC-P10: Comodato */}
                    <Card
                      title="Gestão de Comodato (UC-P10)"
                      icon={<Lightbulb size={18} />}
                      actions={
                        <span className="status-badge status-badge-warning" style={{ fontSize: 11 }}>
                          Processo manual — IA futura no roadmap
                        </span>
                      }
                    >
                      <div className="form-grid form-grid-3">
                        <FormField label="Equipamento">
                          <TextInput value={comodatoNome} onChange={setComodatoNome} placeholder="Analisador XYZ-3000" />
                        </FormField>
                        <FormField label="Valor do Equipamento (R$)">
                          <TextInput value={comodatoValor} onChange={setComodatoValor} placeholder="250000" />
                        </FormField>
                        <FormField label="Prazo (meses)">
                          <TextInput value={comodatoMeses} onChange={setComodatoMeses} placeholder="60" />
                        </FormField>
                      </div>
                      {comodatoValor && comodatoMeses && Number(comodatoMeses) > 0 && (
                        <p style={{ marginTop: 8, fontSize: 13 }}>
                          Amortização mensal: <strong>{fmt(Number(comodatoValor.replace(/\./g, "").replace(",", ".")) / Number(comodatoMeses))}</strong>
                        </p>
                      )}
                      <div style={{ marginTop: 12 }}>
                        <ActionButton icon={<Check size={16} />} label="Salvar Comodato" variant="primary" onClick={handleSalvarComodato} />
                      </div>

                      {comodatos.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <h4>Comodatos Cadastrados</h4>
                          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", marginTop: 8 }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                <th style={{ textAlign: "left", padding: 4 }}>Equipamento</th>
                                <th style={{ textAlign: "right", padding: 4 }}>Valor</th>
                                <th style={{ textAlign: "right", padding: 4 }}>Meses</th>
                                <th style={{ textAlign: "right", padding: 4 }}>Amort./mês</th>
                                <th style={{ padding: 4 }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comodatos.map((c) => (
                                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light, #eee)" }}>
                                  <td style={{ padding: 4 }}>{c.nome_equipamento}</td>
                                  <td style={{ textAlign: "right", padding: 4 }}>{fmt(c.valor_equipamento)}</td>
                                  <td style={{ textAlign: "right", padding: 4 }}>{c.duracao_meses}</td>
                                  <td style={{ textAlign: "right", padding: 4 }}>{fmt(c.valor_mensal_amortizacao)}</td>
                                  <td style={{ padding: 4 }}><span className="status-badge">{c.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabPanel>
        )}

        {/* Seleção de Portfolio Modal */}
        <Modal isOpen={showSelecaoModal} title="Seleção de Portfolio" onClose={() => setShowSelecaoModal(false)} size="large">
            <p style={{ marginBottom: 12 }}>Selecione o produto do portfolio para vincular ao item:</p>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: 6 }}>Produto</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Fabricante</th>
                  <th style={{ padding: 6 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {sugestoes.map((s) => (
                  <tr key={s.produto_id} style={{ borderBottom: "1px solid var(--border-light, #eee)" }}>
                    <td style={{ padding: 6 }}>{s.nome}</td>
                    <td style={{ padding: 6 }}>{s.fabricante || "—"}</td>
                    <td style={{ padding: 6, textAlign: "center" }}>
                      <ActionButton
                        label="Selecionar"
                        variant="primary"
                        onClick={() => handleConfirmarSelecao(s.produto_id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Modal>

          {/* === MODAL BUSCAR NA WEB === */}
          <Modal
            isOpen={showBuscaWebModal}
            onClose={() => { setShowBuscaWebModal(false); setBuscaNomeProduto(""); setBuscaFabricante(""); }}
            title="Buscar Produto na Web"
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setShowBuscaWebModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleBuscaWebConfirm} disabled={!buscaNomeProduto}>
                  <Globe size={14} /> Buscar via IA
                </button>
              </>
            }
          >
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
              A IA busca informações do produto na web e cadastra automaticamente no portfólio.
            </p>
            <FormField label="Nome do Produto" required>
              <TextInput value={buscaNomeProduto} onChange={setBuscaNomeProduto} placeholder="Ex: Reagente Hematologia XN-L" />
            </FormField>
            <FormField label="Fabricante (opcional)">
              <TextInput value={buscaFabricante} onChange={setBuscaFabricante} placeholder="Ex: Sysmex" />
            </FormField>
          </Modal>

          {/* === MODAL ANVISA === */}
          <Modal
            isOpen={showAnvisaModal}
            onClose={() => { setShowAnvisaModal(false); setAnvisaRegistro(""); setAnvisaNomeProduto(""); }}
            title="Registros de Produtos pela ANVISA"
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setShowAnvisaModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAnvisaConfirm} disabled={!anvisaRegistro && !anvisaNomeProduto}>
                  <Shield size={14} /> Buscar via IA
                </button>
              </>
            }
          >
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
              A IA tenta trazer os registros e o usuário valida ou complementa.
            </p>
            <FormField label="Número de Registro ANVISA">
              <TextInput value={anvisaRegistro} onChange={setAnvisaRegistro} placeholder="Ex: 80000000001" />
            </FormField>
            <FormField label="ou Nome do Produto">
              <TextInput value={anvisaNomeProduto} onChange={setAnvisaNomeProduto} placeholder="Ex: Reagente Teste Rápido" />
            </FormField>
          </Modal>
      </div>
    </div>
  );
}
