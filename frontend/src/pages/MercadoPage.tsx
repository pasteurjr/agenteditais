import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  TrendingUp, BarChart2, PieChart, Calendar, AlertTriangle,
  RefreshCw, Search, Filter, Layers,
} from "lucide-react";
import { Card, FormField, SelectInput, Modal } from "../components/common";
import { fetchTamSamSom, fetchIntrusos, detectarIntrusos } from "../api/sprint7";

/* ── Tipos ── */
interface TendenciaMes { mes: string; quantidade: number; valorTotal: number; }
interface CategoriaDemanda { categoria: string; quantidade: number; valorMedio: number; percentual: number; }
interface Funil { editais: number; valor: number; label: string; percentual_tam?: number; percentual_sam?: number; }
interface EvolucaoPreco { mes: string; valor: number; segmento?: string; }
interface Intruso {
  id?: string; edital_numero?: string; descricao_item: string; ncm: string;
  valor: number; percentual_edital: number; criticidade: string; acao_sugerida: string;
}

const SEGMENTOS = [
  { value: "", label: "Todos" },
  { value: "hematologia", label: "Hematologia" },
  { value: "bioquimica", label: "Bioquimica" },
  { value: "coagulacao", label: "Coagulacao" },
  { value: "imunologia", label: "Imunologia" },
  { value: "biomol", label: "Biomol/PCR" },
];

const CRITICIDADES = [
  { value: "", label: "Todas" },
  { value: "critico", label: "Critico" },
  { value: "medio", label: "Medio" },
  { value: "informativo", label: "Informativo" },
];

export function MercadoPage(_props?: PageProps) {
  const [tab, setTab] = useState<"tam" | "intrusos">("tam");
  const [periodo, setPeriodo] = useState("6m");
  const [segmento, setSegmento] = useState("");
  const [loading, setLoading] = useState(true);

  // TAM/SAM/SOM state
  const [funil, setFunil] = useState<{ tam: Funil; sam: Funil; som: Funil } | null>(null);
  const [tendencias, setTendencias] = useState<TendenciaMes[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDemanda[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoPreco[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [totalEditais, setTotalEditais] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);

  // Intrusos state
  const [intrusos, setIntrusos] = useState<Intruso[]>([]);
  const [intrusosStats, setIntrusosStats] = useState<any>({});
  const [critFiltro, setCritFiltro] = useState("");
  const [buscaIntruso, setBuscaIntruso] = useState("");
  const [showModalIntruso, setShowModalIntruso] = useState(false);
  const [editalIdAnalise, setEditalIdAnalise] = useState("");
  const [analisando, setAnalisando] = useState(false);

  const periodoMap: Record<string, number> = { "3m": 90, "6m": 180, "12m": 365 };
  const periodoMesesMap: Record<string, number> = { "3m": 3, "6m": 6, "12m": 12 };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const fetchDadosMercado = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("editais_ia_access_token");
    try {
      // Fetch original mercado data (tendencias + categorias)
      const res = await fetch(`/api/dashboard/mercado?periodo_dias=${periodoMap[periodo] || 180}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTendencias(data.tendencias || []);
        setCategorias(data.categorias || []);
        setTotalEditais(data.total_editais || 0);
        setValorTotal(data.valor_total || 0);
      }

      // Fetch TAM/SAM/SOM
      const tamData = await fetchTamSamSom({
        segmento: segmento || undefined,
        periodo_meses: periodoMesesMap[periodo] || 6,
      });
      if (tamData.tam) {
        setFunil({
          tam: { editais: tamData.tam.qtd, valor: tamData.tam.valor, label: "TAM" },
          sam: { editais: tamData.sam.qtd, valor: tamData.sam.valor, label: "SAM", percentual_tam: tamData.sam.cobertura_pct },
          som: { editais: tamData.som.qtd, valor: tamData.som.valor, label: "SOM", percentual_sam: tamData.som.penetracao_pct },
        });
        setMetricas(tamData.stat_cards);
        if (tamData.stat_cards) {
          setTotalEditais(tamData.stat_cards.editais_periodo || tamData.tam.qtd);
          setValorTotal(tamData.stat_cards.valor_total_tam || tamData.tam.valor);
        }
      }
      if (tamData.tendencias?.length) setTendencias(tamData.tendencias);
      if (tamData.categorias?.length) setCategorias(tamData.categorias);
      if (tamData.evolucao_precos) setEvolucao(tamData.evolucao_precos);
    } catch (e) {
      console.error("Erro ao carregar mercado:", e);
    }
    setLoading(false);
  }, [periodo, segmento]);

  const fetchDadosIntrusos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIntrusos({
        criticidade: critFiltro || undefined,
        periodo_dias: periodoMap[periodo] || 180,
        busca: buscaIntruso || undefined,
      });
      setIntrusos(data.intrusos || []);
      setIntrusosStats(data.stat_cards || {});
    } catch (e) {
      console.error("Erro ao carregar intrusos:", e);
    }
    setLoading(false);
  }, [critFiltro, periodo, buscaIntruso]);

  useEffect(() => {
    if (tab === "tam") fetchDadosMercado();
    else fetchDadosIntrusos();
  }, [tab, fetchDadosMercado, fetchDadosIntrusos]);

  const handleAnalisarIntruso = async () => {
    if (!editalIdAnalise) return;
    setAnalisando(true);
    try {
      await detectarIntrusos(editalIdAnalise);
      setShowModalIntruso(false);
      setEditalIdAnalise("");
      fetchDadosIntrusos();
    } catch (e) {
      console.error("Erro ao analisar intrusos:", e);
    }
    setAnalisando(false);
  };

  const mediaValor = totalEditais > 0 ? valorTotal / totalEditais : 0;
  const maxQtd = Math.max(...tendencias.map((t) => t.quantidade), 1);

  const critBadge = (crit: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      critico: { bg: "#fef2f2", color: "#dc2626" },
      medio: { bg: "#fefce8", color: "#ca8a04" },
      informativo: { bg: "#eff6ff", color: "#2563eb" },
    };
    const s = map[crit] || map.informativo;
    return (
      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
        {crit.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <TrendingUp size={24} />
          <div>
            <h1>Analise de Mercado</h1>
            <p>TAM/SAM/SOM, tendencias e itens intrusos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="page-content">
        <div className="tabs" style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 16 }}>
          {[
            { key: "tam" as const, label: "TAM / SAM / SOM", icon: <Layers size={16} /> },
            { key: "intrusos" as const, label: "Intrusos", icon: <AlertTriangle size={16} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                border: "none", borderBottom: tab === t.key ? "2px solid #2563eb" : "2px solid transparent",
                background: "none", cursor: "pointer", fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? "#2563eb" : "#6b7280", marginBottom: -2,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══════ TAB TAM/SAM/SOM ═══════ */}
        {tab === "tam" && (
          <>
            {/* Filtros */}
            <div className="form-inline" style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <FormField label="Segmento">
                <SelectInput value={segmento} onChange={setSegmento} options={SEGMENTOS} />
              </FormField>
              <FormField label="Periodo">
                <SelectInput
                  value={periodo}
                  onChange={setPeriodo}
                  options={[
                    { value: "3m", label: "Ultimos 3 meses" },
                    { value: "6m", label: "Ultimos 6 meses" },
                    { value: "12m", label: "Ultimos 12 meses" },
                  ]}
                />
              </FormField>
              <button
                className="btn btn-secondary"
                onClick={fetchDadosMercado}
                style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} /> Recalcular
              </button>
            </div>

            {/* Stat Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon info"><BarChart2 size={24} /></div>
                <div className="stat-content">
                  <span className="stat-value">{totalEditais}</span>
                  <span className="stat-label">Editais no Periodo</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon success"><TrendingUp size={24} /></div>
                <div className="stat-content">
                  <span className="stat-value">{formatCurrency(valorTotal)}</span>
                  <span className="stat-label">Valor Total TAM</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon warning"><PieChart size={24} /></div>
                <div className="stat-content">
                  <span className="stat-value">{formatCurrency(mediaValor)}</span>
                  <span className="stat-label">Valor Medio</span>
                </div>
              </div>
              {funil && (
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                    <Layers size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">
                      {funil.som.percentual_sam ? `${funil.som.percentual_sam}%` : "N/A"}
                    </span>
                    <span className="stat-label">Penetracao SOM/SAM</span>
                  </div>
                </div>
              )}
            </div>

            {/* Funil TAM/SAM/SOM */}
            {funil && (
              <Card title="Funil de Mercado" icon={<Layers size={18} />}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
                  {[
                    { data: funil.tam, color: "#3b82f6", width: "100%" },
                    { data: funil.sam, color: "#8b5cf6", width: "70%" },
                    { data: funil.som, color: "#22c55e", width: "40%" },
                  ].map((level, i) => (
                    <div
                      key={i}
                      style={{
                        width: level.width, background: level.color, color: "#fff",
                        padding: "16px 24px", borderRadius: 8, textAlign: "center",
                        transition: "all 0.3s",
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.9 }}>{level.data.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{level.data.editais} editais</div>
                      <div style={{ fontSize: 14 }}>{formatCurrency(level.data.valor)}</div>
                      {i > 0 && (
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                          {i === 1
                            ? `${level.data.percentual_tam || 0}% do TAM`
                            : `${level.data.percentual_sam || 0}% do SAM`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {metricas && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "12px 0", fontSize: 13, color: "#6b7280" }}>
                    <span>Taxa Vitoria: <b>{metricas.taxa_vitoria}%</b></span>
                    <span>UFs Atuacao: <b>{metricas.ufs_atuacao}</b></span>
                    <span>NCMs Portfolio: <b>{metricas.ncms_portfolio}</b></span>
                    <span>Participados: <b>{metricas.participados}</b></span>
                  </div>
                )}
              </Card>
            )}

            {/* Tendencias */}
            <Card title="Tendencias de Editais" icon={<TrendingUp size={18} />}>
              {tendencias.length > 0 ? (
                <div className="chart-container">
                  <div className="chart-placeholder">
                    <p className="chart-title">Editais por Mes</p>
                    <div className="bar-chart">
                      {tendencias.map((t, i) => (
                        <div key={i} className="bar-item">
                          <div
                            className="bar"
                            style={{ height: `${(t.quantidade / maxQtd) * 100}%` }}
                            title={`${t.quantidade} editais - ${formatCurrency(t.valorTotal)}`}
                          >
                            <span className="bar-value">{t.quantidade}</span>
                          </div>
                          <span className="bar-label">{t.mes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                  {loading ? "Carregando..." : "Nenhum dado no periodo"}
                </div>
              )}
            </Card>

            {/* Categorias */}
            <Card title="Categorias Mais Demandadas" icon={<PieChart size={18} />}>
              {categorias.length > 0 ? (
                <div className="categorias-grid">
                  {categorias.map((cat, i) => (
                    <div key={i} className="categoria-card">
                      <div className="categoria-header">
                        <span className="categoria-nome">{cat.categoria}</span>
                        <span className="categoria-percentual">{cat.percentual}%</span>
                      </div>
                      <div className="categoria-bar">
                        <div className="categoria-fill" style={{ width: `${cat.percentual}%` }} />
                      </div>
                      <div className="categoria-stats">
                        <span>{cat.quantidade} editais</span>
                        <span>Media: {formatCurrency(cat.valorMedio)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                  {loading ? "Carregando..." : "Nenhum dado no periodo"}
                </div>
              )}
            </Card>

            {/* Evolucao de Precos */}
            <Card title="Evolucao de Precos" icon={<Calendar size={18} />}>
              {evolucao.length > 0 ? (
                <div className="chart-container">
                  <div className="chart-placeholder">
                    <p className="chart-title">Preco Medio por Mes</p>
                    <div className="bar-chart">
                      {evolucao.map((ep, i) => {
                        const maxVal = Math.max(...evolucao.map((e) => e.valor), 1);
                        return (
                          <div key={i} className="bar-item">
                            <div
                              className="bar"
                              style={{ height: `${(ep.valor / maxVal) * 100}%`, background: "#8b5cf6" }}
                              title={`${ep.mes}: ${formatCurrency(ep.valor)}`}
                            >
                              <span className="bar-value" style={{ fontSize: 10 }}>
                                {(ep.valor / 1000).toFixed(0)}k
                              </span>
                            </div>
                            <span className="bar-label">{ep.mes}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                  {loading ? "Carregando..." : "Dados de evolucao de precos nao disponiveis para o periodo"}
                </div>
              )}
            </Card>
          </>
        )}

        {/* ═══════ TAB INTRUSOS ═══════ */}
        {tab === "intrusos" && (
          <>
            {/* Stat Cards Intrusos */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  <AlertTriangle size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{intrusosStats.total || intrusos.length}</span>
                  <span className="stat-label">Intrusos Detectados</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon warning"><BarChart2 size={24} /></div>
                <div className="stat-content">
                  <span className="stat-value">{intrusosStats.editais_afetados || 0}</span>
                  <span className="stat-label">Editais Afetados</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{formatCurrency(intrusosStats.valor_risco || 0)}</span>
                  <span className="stat-label">Valor em Risco</span>
                </div>
              </div>
            </div>

            {/* Filtros Intrusos */}
            <div className="form-inline" style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <FormField label="Criticidade">
                <SelectInput value={critFiltro} onChange={setCritFiltro} options={CRITICIDADES} />
              </FormField>
              <FormField label="Periodo">
                <SelectInput
                  value={periodo}
                  onChange={setPeriodo}
                  options={[
                    { value: "3m", label: "3 meses" },
                    { value: "6m", label: "6 meses" },
                    { value: "12m", label: "12 meses" },
                  ]}
                />
              </FormField>
              <FormField label="Buscar Edital">
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    type="text"
                    value={buscaIntruso}
                    onChange={(e) => setBuscaIntruso(e.target.value)}
                    placeholder="Numero ou orgao..."
                    className="form-input"
                    style={{ width: 200 }}
                  />
                  <button className="btn btn-secondary" onClick={fetchDadosIntrusos}>
                    <Search size={14} />
                  </button>
                </div>
              </FormField>
              <button
                className="btn btn-primary"
                onClick={() => setShowModalIntruso(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Filter size={14} /> Analisar Novo Edital
              </button>
            </div>

            {/* Tabela Intrusos */}
            <Card title="Itens Intrusos Detectados" icon={<AlertTriangle size={18} />}>
              {intrusos.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Edital</th>
                        <th>Item</th>
                        <th>NCM</th>
                        <th>Valor</th>
                        <th>% Edital</th>
                        <th>Criticidade</th>
                        <th>Acao Sugerida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intrusos.map((it, i) => (
                        <tr key={i}>
                          <td>{it.edital_numero || "—"}</td>
                          <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {it.descricao_item}
                          </td>
                          <td><code>{it.ncm || "—"}</code></td>
                          <td>{formatCurrency(it.valor)}</td>
                          <td>{it.percentual_edital}%</td>
                          <td>{critBadge(it.criticidade)}</td>
                          <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {it.acao_sugerida}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                  {loading ? "Carregando..." : "Nenhum item intruso detectado no periodo"}
                </div>
              )}
            </Card>

            {/* Modal Analisar */}
            {showModalIntruso && (
              <Modal title="Analisar Novo Edital" onClose={() => setShowModalIntruso(false)}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <FormField label="ID do Edital">
                    <input
                      type="text"
                      value={editalIdAnalise}
                      onChange={(e) => setEditalIdAnalise(e.target.value)}
                      placeholder="Cole o ID do edital..."
                      className="form-input"
                    />
                  </FormField>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={() => setShowModalIntruso(false)}>
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAnalisarIntruso}
                      disabled={analisando || !editalIdAnalise}
                    >
                      {analisando ? "Analisando..." : "Analisar com IA"}
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </>
        )}
      </div>
    </div>
  );
}
