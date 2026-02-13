import { useState } from "react";
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
  motivo: "preco" | "tecnico" | "documentacao" | "prazo" | "outro";
  vencedor: string;
}

interface MotivoPerda {
  motivo: string;
  quantidade: number;
  percentual: number;
}

// Dados mock
const mockPerdas: Perda[] = [
  { id: "1", edital: "PE-050/2026", orgao: "UFMG", data: "05/02/2026", valorProposto: 45000, valorVencedor: 43500, diferenca: 1500, motivo: "preco", vencedor: "Lab Solutions" },
  { id: "2", edital: "PE-040/2026", orgao: "USP", data: "01/02/2026", valorProposto: 38000, valorVencedor: 38000, diferenca: 0, motivo: "tecnico", vencedor: "TechMed" },
  { id: "3", edital: "PE-035/2026", orgao: "UNICAMP", data: "28/01/2026", valorProposto: 52000, valorVencedor: 50500, diferenca: 1500, motivo: "preco", vencedor: "MedEquip" },
  { id: "4", edital: "PE-030/2026", orgao: "UNESP", data: "25/01/2026", valorProposto: 28000, valorVencedor: 27000, diferenca: 1000, motivo: "preco", vencedor: "Diagnostica SP" },
  { id: "5", edital: "CC-010/2026", orgao: "Pref. BH", data: "20/01/2026", valorProposto: 65000, valorVencedor: 65000, diferenca: 0, motivo: "documentacao", vencedor: "Lab Solutions" },
];

const mockMotivos: MotivoPerda[] = [
  { motivo: "Preco", quantidade: 7, percentual: 60 },
  { motivo: "Tecnico", quantidade: 3, percentual: 25 },
  { motivo: "Documentacao", quantidade: 1, percentual: 8 },
  { motivo: "Outros", quantidade: 1, percentual: 7 },
];

export function PerdasPage() {
  const [perdas] = useState<Perda[]>(mockPerdas);
  const [motivos] = useState<MotivoPerda[]>(mockMotivos);
  const [periodo, setPeriodo] = useState("6m");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // Calculos
  const totalPerdas = perdas.length;
  const valorTotalPerdido = perdas.reduce((acc, p) => acc + p.valorProposto, 0);
  const taxaPerda = 35; // Mock - seria calculado com base no total de participacoes

  const getMotivoBadge = (motivo: Perda["motivo"]) => {
    const cores: Record<string, string> = {
      preco: "status-badge-error",
      tecnico: "status-badge-warning",
      documentacao: "status-badge-info",
      prazo: "status-badge-neutral",
      outro: "status-badge-neutral",
    };
    const labels: Record<string, string> = {
      preco: "Preco",
      tecnico: "Tecnico",
      documentacao: "Documentacao",
      prazo: "Prazo",
      outro: "Outro",
    };
    return <span className={`status-badge ${cores[motivo]}`}>{labels[motivo]}</span>;
  };

  const perdasColumns: Column<Perda>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "data", header: "Data", sortable: true },
    { key: "motivo", header: "Motivo", render: (p) => getMotivoBadge(p.motivo) },
    {
      key: "diferenca",
      header: "Diferenca",
      render: (p) => p.diferenca > 0 ? formatCurrency(p.diferenca) : "-",
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
          <div className="motivos-chart">
            <div className="pie-chart-container">
              <div className="pie-chart">
                {motivos.map((m, i) => {
                  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#6b7280"];
                  const offset = motivos.slice(0, i).reduce((acc, m) => acc + m.percentual, 0);
                  return (
                    <div
                      key={i}
                      className="pie-segment"
                      style={{
                        background: `conic-gradient(${colors[i]} 0% ${m.percentual}%, transparent ${m.percentual}% 100%)`,
                        transform: `rotate(${offset * 3.6}deg)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="motivos-legend">
              {motivos.map((m, i) => {
                const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#6b7280"];
                return (
                  <div key={i} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: colors[i] }} />
                    <span className="legend-label">{m.motivo}</span>
                    <span className="legend-value">{m.percentual}%</span>
                    <span className="legend-count">({m.quantidade})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card title="Historico de Perdas" icon={<XCircle size={18} />}>
          <DataTable
            data={perdas}
            columns={perdasColumns}
            idKey="id"
            emptyMessage="Nenhuma perda registrada"
          />
        </Card>
      </div>
    </div>
  );
}
