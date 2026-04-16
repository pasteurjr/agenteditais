import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { TrendingUp, BarChart2, PieChart, Calendar } from "lucide-react";
import { Card, FormField, SelectInput } from "../components/common";

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

export function MercadoPage(_props?: PageProps) {
  const [tendencias, setTendencias] = useState<TendenciaMes[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDemanda[]>([]);
  const [totalEditais, setTotalEditais] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("6m");

  const periodoMap: Record<string, number> = { "3m": 90, "6m": 180, "12m": 365 };

  const fetchMercado = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("editais_ia_access_token");
    try {
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
    } catch (e) {
      console.error("Erro ao carregar mercado:", e);
    }
    setLoading(false);
  }, [periodo]);

  useEffect(() => {
    fetchMercado();
  }, [fetchMercado]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const mediaValor = totalEditais > 0 ? valorTotal / totalEditais : 0;
  const maxQtd = Math.max(...tendencias.map(t => t.quantidade), 1);

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
        <div className="form-inline" style={{ marginBottom: 16 }}>
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
            <div className="stat-icon info"><BarChart2 size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{totalEditais}</span>
              <span className="stat-label">Editais no periodo</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><TrendingUp size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(valorTotal)}</span>
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

        <Card title="Evolucao de Precos" icon={<Calendar size={18} />}>
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
            Evolucao de precos por produto sera implementada na Sprint 7 (Mercado TAM/SAM/SOM)
          </div>
        </Card>
      </div>
    </div>
  );
}
