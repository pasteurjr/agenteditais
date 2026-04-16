import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  BarChart2, TrendingUp, Clock, DollarSign, Filter,
  Target, Award, ArrowRight, AlertTriangle,
} from "lucide-react";
import { Card, FormField, SelectInput } from "../components/common";
import {
  fetchAnalyticsFunil, fetchAnalyticsConversoes,
  fetchAnalyticsTempos, fetchAnalyticsROI,
} from "../api/sprint7";

const SEGMENTOS = [
  { value: "", label: "Todos" },
  { value: "hematologia", label: "Hematologia" },
  { value: "bioquimica", label: "Bioquimica" },
  { value: "coagulacao", label: "Coagulacao" },
  { value: "imunologia", label: "Imunologia" },
];

export function AnalyticsPage(_props?: PageProps) {
  const [tab, setTab] = useState<"pipeline" | "conversoes" | "tempos" | "roi">("pipeline");
  const [periodo, setPeriodo] = useState("180");
  const [segmento, setSegmento] = useState("");
  const [uf, setUf] = useState("");
  const [loading, setLoading] = useState(true);

  // Pipeline/Funil state
  const [funilData, setFunilData] = useState<any>(null);

  // Conversoes state
  const [conversoesData, setConversoesData] = useState<any>(null);

  // Tempos state
  const [temposData, setTemposData] = useState<any>(null);

  // ROI state
  const [roiData, setRoiData] = useState<any>(null);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        periodo_dias: parseInt(periodo),
        segmento: segmento || undefined,
        uf: uf || undefined,
      };
      if (tab === "pipeline") {
        const data = await fetchAnalyticsFunil(params);
        setFunilData(data);
      } else if (tab === "conversoes") {
        const data = await fetchAnalyticsConversoes(params);
        setConversoesData(data);
      } else if (tab === "tempos") {
        const data = await fetchAnalyticsTempos({ periodo_dias: parseInt(periodo) });
        setTemposData(data);
      } else if (tab === "roi") {
        const data = await fetchAnalyticsROI({ periodo_dias: parseInt(periodo) });
        setRoiData(data);
      }
    } catch (e) {
      console.error("Erro analytics:", e);
    }
    setLoading(false);
  }, [tab, periodo, segmento, uf]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const convColor = (pct: number) =>
    pct > 60 ? "#16a34a" : pct > 30 ? "#eab308" : "#dc2626";

  const corMap: Record<string, string> = { verde: "#16a34a", amarelo: "#eab308", vermelho: "#dc2626" };
  const mapCor = (cor?: string, fallback?: string) => (cor && corMap[cor]) || fallback || "#6b7280";

  const tempoColor = (dias: number) =>
    dias < 7 ? "#16a34a" : dias < 30 ? "#eab308" : "#dc2626";

  // ═══ Tab Pipeline ═══
  const tabPipeline = () => {
    if (!funilData) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>;
    const stats = funilData.stat_cards || {};
    const etapas = funilData.funil || [];
    return (
      <>
        <div className="stats-row">
          {[
            { label: "Total Pipeline", value: stats.total_pipeline ?? 0, icon: <BarChart2 size={24} />, color: "info" },
            { label: "Analisados", value: stats.analisados ?? 0, icon: <Target size={24} />, color: "warning" },
            { label: "Participados", value: stats.participados ?? 0, icon: <TrendingUp size={24} />, color: "success" },
            { label: "Resultado Definitivo", value: stats.resultado_definitivo ?? 0, icon: <Award size={24} />, color: "success" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <Card title="Funil do Pipeline — 13 Etapas" icon={<Filter size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 16 }}>
            {etapas.map((et: any, i: number) => {
              const maxCount = Math.max(...etapas.map((e: any) => e.quantidade || 0), 1);
              const widthPct = Math.max(10, ((et.quantidade || 0) / maxCount) * 100);
              return (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 200, fontSize: 12, color: "#374151", textAlign: "right" }}>
                      {et.label || et.stage}
                    </span>
                    <div style={{ flex: 1, position: "relative" }}>
                      <div style={{
                        width: `${widthPct}%`, height: 32,
                        background: mapCor(et.cor, convColor(et.conversao_pct || 0)),
                        borderRadius: 4, display: "flex", alignItems: "center",
                        paddingLeft: 8, transition: "width 0.3s",
                      }}>
                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
                          {et.quantidade || 0} {et.valor ? `| ${fmt(et.valor)}` : ""}
                        </span>
                      </div>
                    </div>
                    {i < etapas.length - 1 && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, minWidth: 50, textAlign: "center",
                        color: convColor(et.conversao_pct || 0),
                      }}>
                        <ArrowRight size={10} /> {et.conversao_pct ?? 0}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Tabela de Conversao" icon={<BarChart2 size={18} />}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Etapa</th><th>Entrada</th><th>Saida</th><th>Conversao %</th><th>Valor Acum.</th></tr>
              </thead>
              <tbody>
                {etapas.map((et: any, i: number) => (
                  <tr key={i}>
                    <td>{et.label || et.stage}</td>
                    <td>{et.quantidade || 0}</td>
                    <td>{i < etapas.length - 1 ? (etapas[i + 1]?.quantidade || 0) : "—"}</td>
                    <td>
                      <span style={{ color: convColor(et.conversao_pct || 0), fontWeight: 600 }}>
                        {et.conversao_pct ?? "—"}%
                      </span>
                    </td>
                    <td>{et.valor ? fmt(et.valor) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </>
    );
  };

  // ═══ Tab Conversoes ═══
  const tabConversoes = () => {
    if (!conversoesData) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>;
    const stats = conversoesData.stat_cards || {};
    const porTipo = conversoesData.por_tipo || [];
    const porUF = conversoesData.por_uf || [];
    const porSeg = conversoesData.por_segmento || [];

    const renderBenchmark = (atual: number, anterior: number) => {
      const diff = atual - anterior;
      if (diff === 0 || !anterior) return null;
      return (
        <span style={{ fontSize: 11, color: diff > 0 ? "#16a34a" : "#dc2626", fontWeight: 600, marginLeft: 4 }}>
          {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
        </span>
      );
    };

    return (
      <>
        <div className="stats-row">
          {[
            { label: "Taxa Geral", value: `${stats.taxa_geral ?? 0}%`, icon: <Target size={24} />, color: "info" },
            { label: "Melhor Segmento", value: stats.melhor_segmento || "—", icon: <Award size={24} />, color: "success" },
            { label: "Melhor UF", value: stats.melhor_uf || "—", icon: <TrendingUp size={24} />, color: "success" },
            { label: "Contribuicao Auto.", value: `${stats.contribuicao_automatica ?? 0}%`, icon: <BarChart2 size={24} />, color: "warning" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <Card title="Taxa por Tipo de Licitacao" icon={<BarChart2 size={18} />}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Tipo</th><th>Participados</th><th>Ganhos</th><th>Taxa %</th><th>Benchmark</th></tr></thead>
              <tbody>
                {porTipo.map((t: any, i: number) => (
                  <tr key={i}>
                    <td><strong>{t.tipo}</strong></td>
                    <td>{t.participados}</td><td>{t.ganhos}</td>
                    <td style={{ color: convColor(t.taxa), fontWeight: 600 }}>{t.taxa}%</td>
                    <td>{renderBenchmark(t.taxa, t.benchmark)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card title="Taxa por UF" icon={<TrendingUp size={18} />}>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>UF</th><th>Taxa %</th><th>Benchmark</th></tr></thead>
                <tbody>
                  {porUF.slice(0, 10).map((u: any, i: number) => (
                    <tr key={i}>
                      <td><strong>{u.uf}</strong></td>
                      <td style={{ color: convColor(u.taxa), fontWeight: 600 }}>{u.taxa}%</td>
                      <td>{renderBenchmark(u.taxa, u.benchmark)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Taxa por Segmento" icon={<TrendingUp size={18} />}>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Segmento</th><th>Taxa %</th><th>Benchmark</th></tr></thead>
                <tbody>
                  {porSeg.slice(0, 10).map((s: any, i: number) => (
                    <tr key={i}>
                      <td><strong>{s.segmento}</strong></td>
                      <td style={{ color: convColor(s.taxa), fontWeight: 600 }}>{s.taxa}%</td>
                      <td>{renderBenchmark(s.taxa, s.benchmark)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </>
    );
  };

  // ═══ Tab Tempos ═══
  const tabTempos = () => {
    if (!temposData) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>;
    const stats = temposData.stat_cards || {};
    const transicoes = (temposData.transicoes || []).map((t: any) => ({
      ...t,
      media: t.media ?? t.media_dias ?? 0,
    }));
    const maxTempo = Math.max(...transicoes.map((t: any) => t.media || 0), 1);
    const gargalo = temposData.gargalo || transicoes.find((t: any) => t.is_gargalo) || null;

    return (
      <>
        <div className="stats-row">
          {[
            { label: "Tempo Total Medio", value: `${stats.tempo_total_medio ?? 0}d`, icon: <Clock size={24} />, color: "info" },
            { label: "Etapa Mais Lenta", value: stats.mais_lenta || stats.etapa_mais_lenta || "—", icon: <AlertTriangle size={24} />, color: "error" },
            { label: "Etapa Mais Rapida", value: stats.mais_rapida || stats.etapa_mais_rapida || "—", icon: <TrendingUp size={24} />, color: "success" },
            { label: "Homologacao → Empenho", value: `${stats.tempo_homologacao_empenho ?? 0}d`, icon: <Clock size={24} />, color: "warning" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <Card title="Tempo entre Etapas" icon={<Clock size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16 }}>
            {transicoes.map((t: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 250, fontSize: 12, textAlign: "right", color: "#374151" }}>
                  {t.de} → {t.para}
                </span>
                <div style={{ flex: 1, height: 24, background: "#f3f4f6", borderRadius: 4, position: "relative" }}>
                  <div style={{
                    width: `${Math.max(5, (t.media / maxTempo) * 100)}%`,
                    height: "100%", borderRadius: 4,
                    background: tempoColor(t.media),
                    display: "flex", alignItems: "center", paddingLeft: 8,
                  }}>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{t.media}d</span>
                  </div>
                  {gargalo && t.de === gargalo.de && t.para === gargalo.para && (
                    <span style={{
                      position: "absolute", right: -70, top: 2,
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: "#fef2f2", color: "#dc2626",
                    }}>
                      GARGALO
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Detalhamento" icon={<BarChart2 size={18} />}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Transicao</th><th>Media</th><th>Mediana</th><th>Min</th><th>Max</th></tr></thead>
              <tbody>
                {transicoes.map((t: any, i: number) => (
                  <tr key={i}>
                    <td>{t.de} → {t.para}</td>
                    <td style={{ color: tempoColor(t.media), fontWeight: 600 }}>{t.media}d</td>
                    <td>{t.mediana ?? "—"}d</td>
                    <td>{t.min ?? "—"}d</td>
                    <td>{t.max ?? "—"}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </>
    );
  };

  // ═══ Tab ROI ═══
  const tabROI = () => {
    if (!roiData) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>;
    const roiPct = roiData.roi_pct ?? roiData.roi?.percentual ?? 0;
    const roiValorTotal = roiData.roi?.valor_total ?? 0;
    const compArr = Array.isArray(roiData.componentes) ? roiData.componentes : [];
    const compByName = (n: string) => compArr.find((c: any) => c.nome?.toLowerCase().includes(n))?.valor || 0;
    const componentes = {
      receita_direta: compByName("receita"),
      oportunidades_salvas: compByName("oportunidade"),
      produtividade: compByName("produtividade"),
      prevencao_perdas: compByName("preven"),
    };
    const evolucao = (roiData.evolucao || []).map((e: any) => ({
      ...e, roi: e.roi ?? e.roi_pct ?? 0,
    }));

    return (
      <>
        {/* ROI Central */}
        <div style={{ textAlign: "center", padding: 32, background: "#f0fdf4", borderRadius: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>ROI Consolidado</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#16a34a" }}>{roiPct}%</div>
          <div style={{ fontSize: 16, color: "#374151" }}>{fmt(roiValorTotal)}</div>
        </div>

        <FormField label="Periodo">
          <SelectInput value={periodo} onChange={setPeriodo} options={[
            { value: "90", label: "3 meses" }, { value: "180", label: "6 meses" },
            { value: "365", label: "12 meses" }, { value: "9999", label: "Total" },
          ]} />
        </FormField>

        {/* Componentes 2x2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          {[
            { label: "Receita Direta", value: componentes.receita_direta || 0, desc: "Editais ganhos", icon: <DollarSign size={24} />, color: "#16a34a" },
            { label: "Oportunidades Salvas", value: componentes.oportunidades_salvas || 0, desc: "Recursos revertidos", icon: <Award size={24} />, color: "#3b82f6" },
            { label: "Produtividade", value: componentes.produtividade || 0, desc: "Horas economizadas", icon: <Clock size={24} />, color: "#8b5cf6" },
            { label: "Prevencao Perdas", value: componentes.prevencao_perdas || 0, desc: "Intrusos detectados", icon: <AlertTriangle size={24} />, color: "#eab308" },
          ].map((c, i) => (
            <Card key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: c.color + "20", color: c.color, borderRadius: 8, padding: 10 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(c.value)}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Evolucao ROI */}
        {evolucao.length > 0 && (
          <Card title="Evolucao ROI" icon={<TrendingUp size={18} />} style={{ marginTop: 16 }}>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="bar-chart">
                  {evolucao.map((e: any, i: number) => {
                    const maxVal = Math.max(...evolucao.map((x: any) => x.roi || 0), 1);
                    return (
                      <div key={i} className="bar-item">
                        <div
                          className="bar"
                          style={{ height: `${Math.max(5, ((e.roi || 0) / maxVal) * 100)}%`, background: "#16a34a" }}
                          title={`${e.mes}: ${e.roi}%`}
                        >
                          <span className="bar-value" style={{ fontSize: 10 }}>{e.roi}%</span>
                        </div>
                        <span className="bar-label">{e.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Detalhamento */}
        <Card title="Detalhamento" icon={<BarChart2 size={18} />} style={{ marginTop: 16 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Componente</th><th>Valor R$</th><th>% Total</th></tr></thead>
              <tbody>
                {[
                  { nome: "Receita Direta", valor: componentes.receita_direta || 0 },
                  { nome: "Oportunidades Salvas", valor: componentes.oportunidades_salvas || 0 },
                  { nome: "Produtividade", valor: componentes.produtividade || 0 },
                  { nome: "Prevencao Perdas", valor: componentes.prevencao_perdas || 0 },
                ].map((c, i) => {
                  const total = (componentes.receita_direta || 0) + (componentes.oportunidades_salvas || 0) +
                    (componentes.produtividade || 0) + (componentes.prevencao_perdas || 0);
                  return (
                    <tr key={i}>
                      <td><strong>{c.nome}</strong></td>
                      <td>{fmt(c.valor)}</td>
                      <td>{total > 0 ? ((c.valor / total) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <BarChart2 size={24} />
          <div>
            <h1>Analytics</h1>
            <p>Performance, conversoes e ROI</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 16 }}>
          {[
            { key: "pipeline" as const, label: "Pipeline", icon: <Filter size={16} /> },
            { key: "conversoes" as const, label: "Conversoes", icon: <Target size={16} /> },
            { key: "tempos" as const, label: "Tempos", icon: <Clock size={16} /> },
            { key: "roi" as const, label: "ROI", icon: <DollarSign size={16} /> },
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

        {/* Filtros (exceto ROI que tem os seus) */}
        {tab !== "roi" && (
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <FormField label="Periodo">
              <SelectInput value={periodo} onChange={setPeriodo} options={[
                { value: "90", label: "3 meses" }, { value: "180", label: "6 meses" }, { value: "365", label: "12 meses" },
              ]} />
            </FormField>
            {tab !== "tempos" && (
              <>
                <FormField label="Segmento">
                  <SelectInput value={segmento} onChange={setSegmento} options={SEGMENTOS} />
                </FormField>
                <FormField label="UF">
                  <SelectInput value={uf} onChange={setUf} options={[
                    { value: "", label: "Todas" }, { value: "SP", label: "SP" }, { value: "RJ", label: "RJ" },
                    { value: "MG", label: "MG" }, { value: "RS", label: "RS" }, { value: "PR", label: "PR" },
                  ]} />
                </FormField>
              </>
            )}
          </div>
        )}

        {loading && <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>}

        {!loading && tab === "pipeline" && tabPipeline()}
        {!loading && tab === "conversoes" && tabConversoes()}
        {!loading && tab === "tempos" && tabTempos()}
        {!loading && tab === "roi" && tabROI()}
      </div>
    </div>
  );
}
