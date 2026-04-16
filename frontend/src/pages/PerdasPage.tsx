import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { XCircle, TrendingDown, PieChart, BarChart2, Lightbulb, Download, Check, X } from "lucide-react";
import { Card, DataTable, FormField, SelectInput } from "../components/common";
import type { Column } from "../components/common";
import { fetchAnalyticsPerdas } from "../api/sprint7";

interface Perda {
  id: string;
  edital: string;
  orgao: string;
  data: string;
  valorProposto: number;
  valorVencedor: number;
  diferenca: number;
  motivo: string;
  vencedor: string;
}

interface MotivoPerda {
  motivo: string;
  quantidade: number;
  percentual: number;
}

interface Recomendacao {
  texto: string;
  tipo: string;
}

export function PerdasPage(_props?: PageProps) {
  const [perdas, setPerdas] = useState<Perda[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);
  const [taxaPerda, setTaxaPerda] = useState(0);
  const [valorTotalPerdido, setValorTotalPerdido] = useState(0);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("6m");

  // Sprint 7 UC-AN05 — expansion
  const [topMotivo, setTopMotivo] = useState("");
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [segmento, setSegmento] = useState("");
  const [uf, setUf] = useState("");
  const [recAceitas, setRecAceitas] = useState<Set<number>>(new Set());
  const [recRejeitadas, setRecRejeitadas] = useState<Set<number>>(new Set());

  const periodoMap: Record<string, number> = { "3m": 90, "6m": 180, "12m": 365 };

  const fetchPerdas = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("editais_ia_access_token");
    try {
      const res = await fetch(`/api/dashboard/perdas?periodo_dias=${periodoMap[periodo] || 180}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPerdas(data.perdas || []);
        setMotivos(data.motivos || []);
        setTaxaPerda(data.taxa_perda || 0);
        setValorTotalPerdido(data.valor_total_perdido || 0);
      }

      // Fetch expanded perdas with recommendations
      const expanded = await fetchAnalyticsPerdas({
        periodo_dias: periodoMap[periodo] || 180,
        segmento: segmento || undefined,
        uf: uf || undefined,
      });
      if (expanded.top_motivo) setTopMotivo(expanded.top_motivo);
      if (expanded.recomendacoes) setRecomendacoes(expanded.recomendacoes);
    } catch (e) {
      console.error("Erro ao carregar perdas:", e);
    }
    setLoading(false);
  }, [periodo, segmento, uf]);

  useEffect(() => {
    fetchPerdas();
  }, [fetchPerdas]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const totalPerdas = perdas.length;

  const handleExportCSV = () => {
    if (!perdas.length) return;
    const header = "Edital,Orgao,Data,Motivo,Nosso Preco,Vencedor Preco,Diferenca,Vencedor\n";
    const rows = perdas.map(p =>
      `"${p.edital}","${p.orgao}","${p.data}","${p.motivo}",${p.valorProposto},${p.valorVencedor},${p.diferenca},"${p.vencedor}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `perdas_${periodo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAceitarRec = (idx: number) => {
    setRecAceitas(prev => new Set(prev).add(idx));
  };

  const handleRejeitarRec = (idx: number) => {
    setRecRejeitadas(prev => new Set(prev).add(idx));
  };

  const getMotivoBadge = (motivo: string) => {
    const cores: Record<string, string> = {
      preco: "status-badge-error", tecnica: "status-badge-warning",
      documentacao: "status-badge-info", prazo: "status-badge-neutral", outro: "status-badge-neutral",
    };
    const labels: Record<string, string> = {
      preco: "Preco", tecnica: "Tecnica", documentacao: "Documentacao", prazo: "Prazo", outro: "Outro",
    };
    return <span className={`status-badge ${cores[motivo] || "status-badge-neutral"}`}>{labels[motivo] || motivo}</span>;
  };

  const perdasColumns: Column<Perda>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "data", header: "Data", sortable: true },
    { key: "motivo", header: "Motivo", render: (p) => getMotivoBadge(p.motivo) },
    { key: "valorProposto", header: "Nosso Preco", render: (p) => p.valorProposto > 0 ? formatCurrency(p.valorProposto) : "—" },
    { key: "valorVencedor", header: "Preco Vencedor", render: (p) => p.valorVencedor > 0 ? formatCurrency(p.valorVencedor) : "—" },
    { key: "diferenca", header: "Diferenca", render: (p) => p.diferenca > 0 ? formatCurrency(p.diferenca) : "—" },
    { key: "vencedor", header: "Vencedor" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <XCircle size={24} />
          <div>
            <h1>Analise de Perdas</h1>
            <p>Historico, analise e recomendacoes para reduzir perdas</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Resumo" icon={<BarChart2 size={18} />}>
          <div className="form-inline" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <FormField label="Periodo">
              <SelectInput value={periodo} onChange={setPeriodo} options={[
                { value: "3m", label: "3 meses" }, { value: "6m", label: "6 meses" }, { value: "12m", label: "12 meses" },
              ]} />
            </FormField>
            <FormField label="Segmento">
              <SelectInput value={segmento} onChange={setSegmento} options={[
                { value: "", label: "Todos" }, { value: "hematologia", label: "Hematologia" },
                { value: "bioquimica", label: "Bioquimica" }, { value: "coagulacao", label: "Coagulacao" },
              ]} />
            </FormField>
            <FormField label="UF">
              <SelectInput value={uf} onChange={setUf} options={[
                { value: "", label: "Todas" }, { value: "SP", label: "SP" }, { value: "RJ", label: "RJ" },
                { value: "MG", label: "MG" }, { value: "RS", label: "RS" },
              ]} />
            </FormField>
            <button
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 6 }}
              disabled={!perdas.length}
            >
              <Download size={14} /> Exportar CSV
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon error"><XCircle size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{totalPerdas}</span>
                <span className="stat-label">Total de Perdas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><TrendingDown size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(valorTotalPerdido)}</span>
                <span className="stat-label">Valor Total Perdido</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon info"><PieChart size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{taxaPerda}%</span>
                <span className="stat-label">Taxa de Perda</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#fef3c7", color: "#92400e" }}>
                <BarChart2 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{topMotivo || "—"}</span>
                <span className="stat-label">Top Motivo</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recomendacoes IA */}
        {recomendacoes.length > 0 && (
          <Card title="Recomendacoes da IA" icon={<Lightbulb size={18} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recomendacoes.map((rec, i) => {
                const aceita = recAceitas.has(i);
                const rejeitada = recRejeitadas.has(i);
                return (
                  <div key={i} style={{
                    padding: 16, borderRadius: 8, border: "1px solid #e5e7eb",
                    background: aceita ? "#f0fdf4" : rejeitada ? "#fef2f2" : "#fffbeb",
                    opacity: aceita || rejeitada ? 0.7 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <Lightbulb size={20} style={{ color: "#eab308", flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14 }}>{rec.texto}</p>
                      </div>
                      {!aceita && !rejeitada && (
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                            onClick={() => handleAceitarRec(i)}
                          >
                            <Check size={12} /> Aplicar
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                            onClick={() => handleRejeitarRec(i)}
                          >
                            <X size={12} /> Rejeitar
                          </button>
                        </div>
                      )}
                      {aceita && <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>Aplicada</span>}
                      {rejeitada && <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}>Rejeitada</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Motivos das Perdas" icon={<PieChart size={18} />}>
          {motivos.length > 0 ? (
            <div className="motivos-chart">
              <div className="pie-chart-container">
                <div className="pie-chart">
                  {motivos.map((m, i) => {
                    const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#6b7280", "#10b981"];
                    const offset = motivos.slice(0, i).reduce((acc, x) => acc + x.percentual, 0);
                    return (
                      <div
                        key={i}
                        className="pie-segment"
                        style={{
                          background: `conic-gradient(${colors[i % colors.length]} 0% ${m.percentual}%, transparent ${m.percentual}% 100%)`,
                          transform: `rotate(${offset * 3.6}deg)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="motivos-legend">
                {motivos.map((m, i) => {
                  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#6b7280", "#10b981"];
                  return (
                    <div key={i} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="legend-label">{m.motivo}</span>
                      <span className="legend-value">{m.percentual}%</span>
                      <span className="legend-count">({m.quantidade})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              Nenhuma perda registrada no periodo
            </div>
          )}
        </Card>

        <Card title="Historico de Perdas" icon={<XCircle size={18} />}>
          <DataTable
            data={perdas}
            columns={perdasColumns}
            idKey="id"
            loading={loading}
            emptyMessage="Nenhuma perda registrada no periodo"
          />
        </Card>
      </div>
    </div>
  );
}
