import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { XCircle, TrendingDown, PieChart, BarChart2 } from "lucide-react";
import { Card, DataTable, FormField, SelectInput } from "../components/common";
import type { Column } from "../components/common";

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

export function PerdasPage(_props?: PageProps) {
  const [perdas, setPerdas] = useState<Perda[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);
  const [taxaPerda, setTaxaPerda] = useState(0);
  const [valorTotalPerdido, setValorTotalPerdido] = useState(0);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("6m");

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
    } catch (e) {
      console.error("Erro ao carregar perdas:", e);
    }
    setLoading(false);
  }, [periodo]);

  useEffect(() => {
    fetchPerdas();
  }, [fetchPerdas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const totalPerdas = perdas.length;

  const getMotivoBadge = (motivo: string) => {
    const cores: Record<string, string> = {
      preco: "status-badge-error",
      tecnica: "status-badge-warning",
      documentacao: "status-badge-info",
      prazo: "status-badge-neutral",
      outro: "status-badge-neutral",
    };
    const labels: Record<string, string> = {
      preco: "Preco",
      tecnica: "Tecnica",
      documentacao: "Documentacao",
      prazo: "Prazo",
      outro: "Outro",
    };
    return <span className={`status-badge ${cores[motivo] || "status-badge-neutral"}`}>{labels[motivo] || motivo}</span>;
  };

  const perdasColumns: Column<Perda>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "data", header: "Data", sortable: true },
    { key: "motivo", header: "Motivo", render: (p) => getMotivoBadge(p.motivo) },
    {
      key: "valorProposto",
      header: "Nosso Preco",
      render: (p) => p.valorProposto > 0 ? formatCurrency(p.valorProposto) : "—",
    },
    {
      key: "valorVencedor",
      header: "Preco Vencedor",
      render: (p) => p.valorVencedor > 0 ? formatCurrency(p.valorVencedor) : "—",
    },
    {
      key: "diferenca",
      header: "Diferenca",
      render: (p) => p.diferenca > 0 ? formatCurrency(p.diferenca) : "—",
    },
    { key: "vencedor", header: "Vencedor" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <XCircle size={24} />
          <div>
            <h1>Analise de Perdas</h1>
            <p>Historico e analise de derrotas em licitacoes</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Resumo" icon={<BarChart2 size={18} />}>
          <div className="form-inline">
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
          </div>
        </Card>

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
