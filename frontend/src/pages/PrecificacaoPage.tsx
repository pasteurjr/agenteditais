import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  DollarSign, Search, TrendingUp, History, Lightbulb, Package,
  Layers, Target, BarChart3, Shield, ChevronDown, ChevronUp,
  Check, AlertTriangle, Download,
} from "lucide-react";
import {
  Card, DataTable, ActionButton, FormField, TextInput, SelectInput,
  TabPanel, Modal,
} from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate, crudGet } from "../api/crud";
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
  const [itensEdital, setItensEdital] = useState<EditalItem[]>([]);
  const [loteExpandido, setLoteExpandido] = useState<string | null>(null);
  const [loteEspecialidade, setLoteEspecialidade] = useState("");
  const [loteVolume, setLoteVolume] = useState("");

  // ── Tab: Camadas (UC-P02 a UC-P06) ──
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [vinculoId, setVinculoId] = useState("");
  const [camada, setCamada] = useState<PrecoCamada | null>(null);
  // UC-P02: Seleção
  const [selecaoItemId, setSelecaoItemId] = useState("");
  const [sugestoes, setSugestoes] = useState<Array<{ produto_id: string; nome: string; fabricante: string; match_score: number }>>([]);
  const [showSelecaoModal, setShowSelecaoModal] = useState(false);
  // UC-P03: Volumetria
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
      setLotes((res.items as unknown as Lote[]) || []);
      const itensRes = await crudList("editais-itens", { parent_id: eid, limit: 200 });
      setItensEdital((itensRes.items as unknown as EditalItem[]) || []);
      // Load vinculos
      const vRes = await crudList("edital-item-produto", { limit: 200 });
      setVinculos((vRes.items as unknown as Vinculo[]) || []);
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
        especialidade: loteEspecialidade,
        volume_exigido: loteVolume ? Number(loteVolume) : null,
        status: "configurado",
      });
      loadLotes(editalId);
    } catch { /* */ }
  };

  const handleSelecaoPortfolio = async (itemId: string) => {
    setSelecaoItemId(itemId);
    if (onSendToChat) {
      onSendToChat(`selecione produto para o item ${itemId}`);
    }
    // Also try CRUD-based search
    try {
      const res = await crudList("produtos", { limit: 50 });
      const prods = res.items as unknown as Array<{ id: string; nome: string; fabricante: string }>;
      setSugestoes(prods.map(p => ({ ...p, match_score: 0 })));
    } catch { /* */ }
    setShowSelecaoModal(true);
  };

  const handleConfirmarSelecao = async (produtoId: string) => {
    try {
      await crudCreate("edital-item-produto", {
        edital_item_id: selecaoItemId,
        produto_id: produtoId,
        confirmado: true,
      });
      setShowSelecaoModal(false);
      loadLotes(editalId);
    } catch { /* */ }
  };

  const handleCalcVolume = async () => {
    if (!vinculoId) return;
    try {
      await crudUpdate("edital-item-produto", vinculoId, {
        volume_edital: Number(volEdital) || 0,
        rendimento_produto: Number(rendimento) || 0,
        repeticoes_amostras: Number(repAmostras) || 0,
        repeticoes_calibradores: Number(repCalib) || 0,
        repeticoes_controles: Number(repControles) || 0,
      });
      // Calculate locally
      const vol = Number(volEdital) || 0;
      const rend = Number(rendimento) || 1;
      const total = vol + Number(repAmostras) + Number(repCalib) + Number(repControles);
      const kits = Math.ceil(total / rend);
      const formula = `(${vol} + ${repAmostras} + ${repCalib} + ${repControles}) / ${rend} = ${(total/rend).toFixed(3)} → ${kits}`;
      await crudUpdate("edital-item-produto", vinculoId, {
        volume_real_ajustado: total,
        quantidade_kits: kits,
        formula_calculo: formula,
      });
      // Refresh
      const v = await crudGet("edital-item-produto", vinculoId) as unknown as Vinculo;
      setVinculos(prev => prev.map(x => x.id === vinculoId ? v : x));
    } catch { /* */ }
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

  // ── Vinculo selector for Camadas/Lances tabs ──
  const vinculoOptions = [
    { value: "", label: "Selecione item-produto..." },
    ...vinculos.map(v => {
      const item = itensEdital.find(i => i.id === v.edital_item_id);
      const prod = produtos.find(p => p.id === v.produto_id);
      return {
        value: v.id,
        label: `Item ${item?.numero_item ?? "?"} — ${prod?.nome?.slice(0, 30) ?? "Produto"} ${v.confirmado ? "✓" : ""}`,
      };
    }),
  ];

  const curVinculo = vinculos.find(v => v.id === vinculoId);

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

  // ── Tabs ──
  const tabs = [
    { id: "lotes", label: `Lotes ${lotes.length > 0 ? (lotes.some(l => (l as Record<string,unknown>).status === "configurado") ? "✅" : "⚠️") : "❌"}`, icon: <Layers size={16} /> },
    { id: "camadas", label: `Camadas ${camada ? (camada.preco_base ? "✅" : "⚠️") : "❌"}`, icon: <BarChart3 size={16} /> },
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
            <p>Camadas de preço, lances e estratégia competitiva</p>
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
                                onClick={() => setLoteExpandido(loteExpandido === lote.id ? null : lote.id)}>
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
                                      <TextInput value={loteEspecialidade || lote.especialidade || ""} onChange={setLoteEspecialidade} placeholder="Ex: Hematologia" />
                                    </FormField>
                                    <FormField label="Volume Exigido">
                                      <TextInput value={loteVolume || String(lote.volume_exigido || "")} onChange={setLoteVolume} placeholder="Ex: 50000" />
                                    </FormField>
                                    <div className="form-field-actions">
                                      <ActionButton icon={<Check size={16} />} label="Salvar Lote" variant="primary" onClick={() => handleSalvarLote(lote.id)} />
                                    </div>
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
                                        <th style={{ padding: 4 }}>Ação</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {itensEdital.slice(0, 20).map((it) => (
                                        <tr key={it.id} style={{ borderBottom: "1px solid var(--border-light, #eee)" }}>
                                          <td style={{ padding: 4 }}>{it.numero_item}</td>
                                          <td style={{ padding: 4, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.descricao}</td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{it.quantidade}</td>
                                          <td style={{ textAlign: "right", padding: 4 }}>{fmt(it.valor_unitario_estimado)}</td>
                                          <td style={{ padding: 4, textAlign: "center" }}>
                                            <button className="btn btn-sm" onClick={() => handleSelecaoPortfolio(it.id)} title="Selecionar produto">
                                              <Target size={14} />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {itensEdital.length > 20 && <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>... e mais {itensEdital.length - 20} itens</p>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* ═══════════════════ TAB: CAMADAS (UC-P02 a UC-P06) ═══════════════════ */}
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
                        {/* UC-P03: Volumetria */}
                        <Card title="Volumetria (UC-P03)" icon={<BarChart3 size={18} />}>
                          <div className="form-grid form-grid-3">
                            <FormField label="Volume do Edital">
                              <TextInput value={volEdital || String(curVinculo?.volume_edital || "")} onChange={setVolEdital} placeholder="50000" />
                            </FormField>
                            <FormField label="Rendimento (por kit)">
                              <TextInput value={rendimento || String(curVinculo?.rendimento_produto || "")} onChange={setRendimento} placeholder="500" />
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
                              <ActionButton icon={<BarChart3 size={16} />} label="Calcular" variant="primary" onClick={handleCalcVolume} />
                            </div>
                          </div>
                          {curVinculo?.formula_calculo && (
                            <div style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
                              <strong>Fórmula:</strong> {curVinculo.formula_calculo}<br />
                              <strong>Kits necessários:</strong> {curVinculo.quantidade_kits}
                            </div>
                          )}
                        </Card>

                        {/* UC-P04: Base de Custos — Camada A */}
                        <Card title="Camada A — Base de Custos (UC-P04)" icon={<DollarSign size={18} />}>
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

                        {/* UC-P05: Preço Base — Camada B */}
                        <Card title="Camada B — Preço Base (UC-P05)" icon={<TrendingUp size={18} />}>
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
                              Custo (A): {fmt(camada.custo_base_final)} → <strong>Preço Base (B): {fmt(camada.preco_base)}</strong>
                              {camada.markup_percentual && <span> (markup: {pct(camada.markup_percentual)})</span>}
                            </div>
                          )}
                        </Card>

                        {/* UC-P06: Valor de Referência — Camada C */}
                        <Card title="Camada C — Valor de Referência (UC-P06)" icon={<Target size={18} />}>
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
                              <strong>Comparativo:</strong> A={fmt(camada.custo_base_final)} | B={fmt(camada.preco_base)} | <strong>C={fmt(camada.target_referencia)}</strong>
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
                              <h4 style={{ marginBottom: 8 }}>Camada D — Valor Inicial</h4>
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
                              <h4 style={{ marginBottom: 8 }}>Camada E — Valor Mínimo</h4>
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
        {showSelecaoModal && (
          <Modal title="Seleção de Portfolio (UC-P02)" onClose={() => setShowSelecaoModal(false)}>
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
        )}
      </div>
    </div>
  );
}
