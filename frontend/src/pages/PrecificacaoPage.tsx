import { useState, useEffect } from "react";
import type { PageProps } from "../types";
import { DollarSign, Search, TrendingUp, History, Lightbulb } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, SelectInput } from "../components/common";
import type { Column } from "../components/common";
import { crudList } from "../api/crud";
import { getEditais, getProdutos } from "../api/client";
import type { Edital, Produto } from "../api/client";

interface PrecoMercado {
  id: string;
  data: string;
  orgao: string;
  termo: string;
  valor: number;
  vencedor: string;
}

interface HistoricoPreco {
  id: string;
  produto: string;
  preco: number;
  data: string;
  edital: string;
  resultado: "ganho" | "perdido";
}

interface RecomendacaoPreco {
  precoSugerido: number;
  faixaMin: number;
  faixaMax: number;
  justificativa: string;
  baseadoEm: number;
}

export function PrecificacaoPage(props?: PageProps) {
  const { onSendToChat } = props ?? {};

  const [termoBusca, setTermoBusca] = useState("");
  const [precosMercado, setPrecosMercado] = useState<PrecoMercado[]>([]);
  const [historico, setHistorico] = useState<HistoricoPreco[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  // Recomendacao
  const [editais, setEditais] = useState<Edital[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [recomendacao, setRecomendacao] = useState<RecomendacaoPreco | null>(null);
  const [loadingRecomendacao, setLoadingRecomendacao] = useState(false);

  // Estatisticas
  const [estatisticas, setEstatisticas] = useState<{ media: number; min: number; max: number } | null>(null);

  // Carregar historico de precos e listas ao montar
  useEffect(() => {
    const loadData = async () => {
      setLoadingHistorico(true);
      try {
        // Historico de precos via CRUD
        const res = await crudList("preco-historico", { limit: 50 });
        const items = res.items as Record<string, unknown>[];
        setHistorico(items.map((item) => ({
          id: String(item.id ?? ""),
          produto: String(item.produto ?? item.nome_produto ?? ""),
          preco: Number(item.preco ?? item.preco_ofertado ?? 0),
          data: String(item.data ?? item.data_licitacao ?? ""),
          edital: String(item.edital ?? item.numero_edital ?? ""),
          resultado: (item.resultado === "ganho" ? "ganho" : "perdido") as "ganho" | "perdido",
        })));
      } catch {
        // Se tabela não existe ainda, historico fica vazio
        setHistorico([]);
      } finally {
        setLoadingHistorico(false);
      }

      // Editais salvos
      try {
        const edList = await getEditais("salvo");
        setEditais(edList);
      } catch {
        setEditais([]);
      }

      // Produtos cadastrados
      try {
        const prodList = await getProdutos();
        setProdutos(prodList);
      } catch {
        setProdutos([]);
      }
    };

    loadData();
  }, []);

  const handleBuscarPrecos = async () => {
    if (!termoBusca) return;
    setLoading(true);
    setPrecosMercado([]);
    setEstatisticas(null);
    try {
      // Busca historico filtrado pelo termo
      const res = await crudList("preco-historico", { q: termoBusca, limit: 50 });
      const items = res.items as Record<string, unknown>[];
      const precos: PrecoMercado[] = items.map((item) => ({
        id: String(item.id ?? ""),
        data: String(item.data ?? item.data_licitacao ?? ""),
        orgao: String(item.orgao ?? item.nome_orgao ?? ""),
        termo: String(item.produto ?? item.nome_produto ?? termoBusca),
        valor: Number(item.preco ?? item.preco_ofertado ?? 0),
        vencedor: String(item.vencedor ?? item.empresa_vencedora ?? ""),
      }));
      setPrecosMercado(precos);
      if (precos.length > 0) {
        const valores = precos.map((p) => p.valor).filter((v) => v > 0);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        setEstatisticas({
          media: Math.round(media),
          min: Math.min(...valores),
          max: Math.max(...valores),
        });
      }
    } catch {
      // Fallback: enviar para IA buscar precos
      if (onSendToChat) {
        onSendToChat(`Busque preços de mercado para o produto: ${termoBusca}. Consulte o PNCP e retorne dados de licitações similares.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecomendarPreco = async () => {
    if (!editalSelecionado || !produtoSelecionado) return;
    setLoadingRecomendacao(true);
    setRecomendacao(null);

    const edital = editais.find((e) => e.id === editalSelecionado || e.numero === editalSelecionado);
    const produto = produtos.find((p) => p.id === produtoSelecionado || p.nome === produtoSelecionado);

    const editalDesc = edital ? `${edital.numero} - ${edital.orgao}` : editalSelecionado;
    const produtoDesc = produto ? produto.nome : produtoSelecionado;

    if (onSendToChat) {
      onSendToChat(
        `Recomende um preço competitivo para a seguinte licitação:\n` +
        `- Edital: ${editalDesc}\n` +
        `- Produto: ${produtoDesc}\n` +
        `Analise preços históricos, licitações similares no PNCP e retorne: preço sugerido, faixa competitiva (min/max) e justificativa.`
      );
    }

    // Tentar buscar analise existente para sugestao de preco
    try {
      const res = await crudList("preco-historico", { q: produtoDesc, limit: 20 });
      const items = res.items as Record<string, unknown>[];
      if (items.length > 0) {
        const precos = items.map((i) => Number(i.preco ?? i.preco_ofertado ?? 0)).filter((v) => v > 0);
        if (precos.length > 0) {
          const media = precos.reduce((a, b) => a + b, 0) / precos.length;
          const min = Math.min(...precos);
          const max = Math.max(...precos);
          setRecomendacao({
            precoSugerido: Math.round(media * 0.95), // 5% abaixo da media para ser competitivo
            faixaMin: Math.round(min * 0.9),
            faixaMax: Math.round(max * 0.95),
            justificativa: `Baseado em ${precos.length} licitacoes similares. Preco sugerido 5% abaixo da media de mercado para maior competitividade.`,
            baseadoEm: precos.length,
          });
        }
      }
    } catch {
      // recomendacao via IA ja foi enviada acima
    } finally {
      setLoadingRecomendacao(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const mercadoColumns: Column<PrecoMercado>[] = [
    { key: "data", header: "Data", sortable: true },
    { key: "orgao", header: "Orgao", sortable: true },
    { key: "termo", header: "Produto/Termo" },
    { key: "valor", header: "Valor", render: (p) => formatCurrency(p.valor), sortable: true },
    { key: "vencedor", header: "Vencedor" },
  ];

  const historicoColumns: Column<HistoricoPreco>[] = [
    { key: "produto", header: "Produto", sortable: true },
    { key: "preco", header: "Preco", render: (h) => formatCurrency(h.preco), sortable: true },
    { key: "data", header: "Data", sortable: true },
    { key: "edital", header: "Edital" },
    {
      key: "resultado",
      header: "Resultado",
      render: (h) => (
        <span className={`status-badge ${h.resultado === "ganho" ? "status-badge-success" : "status-badge-error"}`}>
          {h.resultado === "ganho" ? "🏆 Ganho" : "❌ Perdido"}
        </span>
      ),
    },
  ];

  const editalOptions = [
    { value: "", label: "Selecione..." },
    ...editais.map((e) => ({ value: e.id ?? e.numero, label: `${e.numero} - ${e.orgao}` })),
  ];

  const produtoOptions = [
    { value: "", label: "Selecione..." },
    ...produtos.map((p) => ({ value: p.id, label: p.nome })),
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <DollarSign size={24} />
          <div>
            <h1>Precificacao</h1>
            <p>Consulta de precos de mercado e recomendacao</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Consultar Precos no PNCP" icon={<Search size={18} />}>
          <div className="form-grid form-grid-2">
            <FormField label="Produto/Termo de busca">
              <TextInput
                value={termoBusca}
                onChange={setTermoBusca}
                placeholder="Ex: microscopio optico, centrifuga..."
              />
            </FormField>
            <div className="form-field-actions">
              <ActionButton
                icon={<Search size={16} />}
                label="Buscar no PNCP"
                variant="primary"
                onClick={handleBuscarPrecos}
                loading={loading}
              />
            </div>
          </div>
        </Card>

        {estatisticas && (
          <Card title="Precos de Mercado" icon={<TrendingUp size={18} />}>
            <div className="estatisticas-resumo">
              <div className="stat-item">
                <label>Preco Medio</label>
                <span className="stat-value">{formatCurrency(estatisticas.media)}</span>
              </div>
              <div className="stat-item">
                <label>Preco Minimo</label>
                <span className="stat-value stat-min">{formatCurrency(estatisticas.min)}</span>
              </div>
              <div className="stat-item">
                <label>Preco Maximo</label>
                <span className="stat-value stat-max">{formatCurrency(estatisticas.max)}</span>
              </div>
            </div>

            <DataTable
              data={precosMercado}
              columns={mercadoColumns}
              idKey="id"
              emptyMessage="Nenhum preco encontrado"
            />
          </Card>
        )}

        {precosMercado.length > 0 && (() => {
          // Generate SVG chart points from real data
          const sortedData = [...precosMercado].sort((a, b) => a.data.localeCompare(b.data));
          const valores = sortedData.map((p) => p.valor).filter((v) => v > 0);
          if (valores.length < 2) return null;
          const minVal = Math.min(...valores);
          const maxVal = Math.max(...valores);
          const range = maxVal - minVal || 1;
          const width = 600;
          const height = 200;
          const padding = 20;
          const points = valores.map((v, i) => {
            const x = (i / (valores.length - 1)) * (width - padding * 2) + padding;
            const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
            return `${x},${y}`;
          }).join(" ");
          const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
          const labels = sortedData.map((p) => {
            const parts = p.data.split("-");
            return parts.length >= 2 ? `${parts[1]}/${parts[0]?.slice(2)}` : p.data.slice(0, 7);
          });
          // Show max 6 labels evenly spaced
          const labelStep = Math.max(1, Math.floor(labels.length / 6));
          const displayLabels = labels.filter((_, i) => i % labelStep === 0 || i === labels.length - 1);
          const media = valores.reduce((a, b) => a + b, 0) / valores.length;
          const variacao = ((valores[valores.length - 1] - valores[0]) / valores[0] * 100).toFixed(1);

          return (
            <Card title="Evolucao de Precos" icon={<TrendingUp size={18} />}>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <p className="chart-title">Evolucao de Preco: {termoBusca}</p>
                  <div className="line-chart">
                    <div className="line-chart-area">
                      <svg viewBox={`0 0 ${width} ${height}`} className="line-svg">
                        <polyline
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="2"
                          points={points}
                        />
                        <polyline
                          fill="rgba(14, 165, 233, 0.1)"
                          stroke="none"
                          points={areaPoints}
                        />
                      </svg>
                    </div>
                    <div className="line-chart-labels">
                      {displayLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span>Preco Medio: <strong>{formatCurrency(media)}</strong></span>
                    <span>Variacao: <strong className={Number(variacao) >= 0 ? "text-success" : "text-danger"}>{Number(variacao) >= 0 ? "+" : ""}{variacao}%</strong></span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })()}

        <Card title="Recomendacao de Preco" icon={<Lightbulb size={18} />}>
          <div className="form-grid form-grid-3">
            <FormField label="Edital">
              <SelectInput
                value={editalSelecionado}
                onChange={setEditalSelecionado}
                options={editalOptions.length > 1 ? editalOptions : [
                  { value: "", label: "Selecione..." },
                  { value: "manual", label: "Edital manual" },
                ]}
              />
            </FormField>
            <FormField label="Produto">
              <SelectInput
                value={produtoSelecionado}
                onChange={setProdutoSelecionado}
                options={produtoOptions.length > 1 ? produtoOptions : [
                  { value: "", label: "Selecione..." },
                  { value: "manual", label: "Produto manual" },
                ]}
              />
            </FormField>
            <div className="form-field-actions">
              <ActionButton
                icon={<Lightbulb size={16} />}
                label="Recomendar Preco"
                variant="primary"
                onClick={handleRecomendarPreco}
                loading={loadingRecomendacao}
              />
            </div>
          </div>

          {recomendacao && (
            <div className="recomendacao-box">
              <h4>Recomendacao</h4>
              <div className="recomendacao-grid">
                <div className="recomendacao-item principal">
                  <label>Preco Sugerido</label>
                  <span className="preco-sugerido">{formatCurrency(recomendacao.precoSugerido)}</span>
                </div>
                <div className="recomendacao-item">
                  <label>Faixa Competitiva</label>
                  <span>{formatCurrency(recomendacao.faixaMin)} - {formatCurrency(recomendacao.faixaMax)}</span>
                </div>
                <div className="recomendacao-item">
                  <label>Baseado em</label>
                  <span>{recomendacao.baseadoEm} licitacoes</span>
                </div>
              </div>
              <div className="justificativa">
                <label>Justificativa:</label>
                <p>{recomendacao.justificativa}</p>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Meu Historico de Precos"
          icon={<History size={18} />}
          actions={
            <div className="card-actions">
              <ActionButton label="Ver Todos" onClick={async () => {
                setLoadingHistorico(true);
                try {
                  const res = await crudList("preco-historico", { limit: 1000 });
                  const items = res.items as Record<string, unknown>[];
                  setHistorico(items.map((item) => ({
                    id: String(item.id ?? ""),
                    produto: String(item.produto ?? item.nome_produto ?? ""),
                    preco: Number(item.preco ?? item.preco_ofertado ?? 0),
                    data: String(item.data ?? item.data_licitacao ?? ""),
                    edital: String(item.edital ?? item.numero_edital ?? ""),
                    resultado: (item.resultado === "ganho" ? "ganho" : "perdido") as "ganho" | "perdido",
                  })));
                } catch {
                  // keep existing data
                } finally {
                  setLoadingHistorico(false);
                }
              }} />
              <ActionButton label="Exportar CSV" onClick={() => {
                if (historico.length === 0) return;
                const header = "Produto;Preco;Data;Edital;Resultado\n";
                const rows = historico.map((h) =>
                  `${h.produto};${h.preco};${h.data};${h.edital};${h.resultado}`
                ).join("\n");
                const csv = header + rows;
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "historico-precos.csv";
                link.click();
              }} />
            </div>
          }
        >
          <DataTable
            data={historico}
            columns={historicoColumns}
            idKey="id"
            emptyMessage={loadingHistorico ? "Carregando..." : "Nenhum historico encontrado"}
          />
        </Card>
      </div>
    </div>
  );
}
