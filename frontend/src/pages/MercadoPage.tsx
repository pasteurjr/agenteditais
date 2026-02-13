import { useState } from "react";
import { TrendingUp, BarChart2, PieChart, Calendar } from "lucide-react";
import { Card, ActionButton, FormField, SelectInput } from "../components/common";

interface TendenciaMes {
  mes: string;
  quantidade: number;
  valorTotal: number;
}

interface CategoriaDemanda {
  categoria: string;
  quantidade: number;
  valorMedio: number;
  percentual: number;
}

// Dados mock
const mockTendencias: TendenciaMes[] = [
  { mes: "Set/25", quantidade: 42, valorTotal: 3500000 },
  { mes: "Out/25", quantidade: 45, valorTotal: 3800000 },
  { mes: "Nov/25", quantidade: 38, valorTotal: 3200000 },
  { mes: "Dez/25", quantidade: 35, valorTotal: 2900000 },
  { mes: "Jan/26", quantidade: 48, valorTotal: 4100000 },
  { mes: "Fev/26", quantidade: 52, valorTotal: 4500000 },
];

const mockCategorias: CategoriaDemanda[] = [
  { categoria: "Equipamentos Laboratoriais", quantidade: 45, valorMedio: 85000, percentual: 35 },
  { categoria: "Material Hospitalar", quantidade: 38, valorMedio: 120000, percentual: 28 },
  { categoria: "TI e Informatica", quantidade: 32, valorMedio: 65000, percentual: 22 },
  { categoria: "Reagentes e Insumos", quantidade: 20, valorMedio: 45000, percentual: 15 },
];

export function MercadoPage() {
  const [tendencias] = useState<TendenciaMes[]>(mockTendencias);
  const [categorias] = useState<CategoriaDemanda[]>(mockCategorias);
  const [periodoPreco, setPeriodoPreco] = useState("6m");
  const [produtoPreco, setProdutoPreco] = useState("microscopio");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const totalEditais = tendencias.reduce((acc, t) => acc + t.quantidade, 0);
  const totalValor = tendencias.reduce((acc, t) => acc + t.valorTotal, 0);
  const mediaValor = totalValor / totalEditais;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <TrendingUp size={24} />
          <div>
            <h1>Analise de Mercado</h1>
            <p>Tendencias, demanda e evolucao de precos</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon info"><BarChart2 size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{totalEditais}</span>
              <span className="stat-label">Editais (6 meses)</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><TrendingUp size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(totalValor)}</span>
              <span className="stat-label">Valor Total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><PieChart size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(mediaValor)}</span>
              <span className="stat-label">Valor Medio</span>
            </div>
          </div>
        </div>

        <Card title="Tendencias de Editais" icon={<TrendingUp size={18} />}>
          <div className="chart-container">
            <div className="chart-placeholder">
              <p className="chart-title">Editais por Mes</p>
              <div className="bar-chart">
                {tendencias.map((t, i) => (
                  <div key={i} className="bar-item">
                    <div
                      className="bar"
                      style={{ height: `${(t.quantidade / 60) * 100}%` }}
                      title={`${t.quantidade} editais`}
                    >
                      <span className="bar-value">{t.quantidade}</span>
                    </div>
                    <span className="bar-label">{t.mes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Categorias Mais Demandadas" icon={<PieChart size={18} />}>
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
        </Card>

        <Card title="Evolucao de Precos" icon={<Calendar size={18} />}>
          <div className="form-grid form-grid-3">
            <FormField label="Produto">
              <SelectInput
                value={produtoPreco}
                onChange={setProdutoPreco}
                options={[
                  { value: "microscopio", label: "Microscopio" },
                  { value: "centrifuga", label: "Centrifuga" },
                  { value: "autoclave", label: "Autoclave" },
                  { value: "reagente", label: "Reagentes" },
                ]}
              />
            </FormField>
            <FormField label="Periodo">
              <SelectInput
                value={periodoPreco}
                onChange={setPeriodoPreco}
                options={[
                  { value: "3m", label: "Ultimos 3 meses" },
                  { value: "6m", label: "Ultimos 6 meses" },
                  { value: "12m", label: "Ultimos 12 meses" },
                ]}
              />
            </FormField>
            <div className="form-field-actions">
              <ActionButton label="Atualizar" onClick={() => {}} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-placeholder">
              <p className="chart-title">Evolucao de Preco: {produtoPreco}</p>
              <div className="line-chart">
                <div className="line-chart-area">
                  <svg viewBox="0 0 600 200" className="line-svg">
                    <polyline
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="2"
                      points="0,150 100,130 200,140 300,120 400,100 500,90 600,80"
                    />
                    <polyline
                      fill="rgba(14, 165, 233, 0.1)"
                      stroke="none"
                      points="0,200 0,150 100,130 200,140 300,120 400,100 500,90 600,80 600,200"
                    />
                  </svg>
                </div>
                <div className="line-chart-labels">
                  <span>Set</span>
                  <span>Out</span>
                  <span>Nov</span>
                  <span>Dez</span>
                  <span>Jan</span>
                  <span>Fev</span>
                </div>
              </div>
              <div className="chart-legend">
                <span>Preco Medio: <strong>{formatCurrency(12500)}</strong></span>
                <span>Variacao: <strong className="text-success">+8.5%</strong></span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
