import { useState } from "react";
import { DollarSign, Search, TrendingUp, History, Lightbulb } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, SelectInput, ScoreBadge } from "../components/common";
import type { Column } from "../components/common";

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

// Dados mock
const mockPrecosMercado: PrecoMercado[] = [
  { id: "1", data: "10/01/2026", orgao: "UFMG", termo: "microscopio optico", valor: 11200, vencedor: "Lab Solutions" },
  { id: "2", data: "05/01/2026", orgao: "USP", termo: "microscopio optico", valor: 13800, vencedor: "TechMed" },
  { id: "3", data: "20/12/2025", orgao: "UNESP", termo: "microscopio optico", valor: 10500, vencedor: "MedEquip" },
  { id: "4", data: "15/12/2025", orgao: "UNICAMP", termo: "microscopio optico", valor: 12300, vencedor: "Lab Solutions" },
];

const mockHistorico: HistoricoPreco[] = [
  { id: "1", produto: "Microscopio ABC-500", preco: 11000, data: "15/01/2026", edital: "PE-032/2026", resultado: "ganho" },
  { id: "2", produto: "Centrifuga XYZ", preco: 8500, data: "10/01/2026", edital: "PE-028/2026", resultado: "perdido" },
  { id: "3", produto: "Autoclave AM-123", preco: 15000, data: "05/01/2026", edital: "PE-020/2026", resultado: "ganho" },
];

export function PrecificacaoPage() {
  const [termoBusca, setTermoBusca] = useState("");
  const [precosMercado, setPrecosMercado] = useState<PrecoMercado[]>([]);
  const [historico] = useState<HistoricoPreco[]>(mockHistorico);
  const [loading, setLoading] = useState(false);

  // Recomendacao
  const [editalSelecionado, setEditalSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [recomendacao, setRecomendacao] = useState<RecomendacaoPreco | null>(null);
  const [loadingRecomendacao, setLoadingRecomendacao] = useState(false);

  // Estatisticas
  const [estatisticas, setEstatisticas] = useState<{ media: number; min: number; max: number } | null>(null);

  const handleBuscarPrecos = async () => {
    if (!termoBusca) return;
    // TODO: Chamar API para buscar precos no PNCP
    // Prompt: buscar_precos_pncp
    setLoading(true);
    setTimeout(() => {
      setPrecosMercado(mockPrecosMercado);
      setEstatisticas({
        media: 11950,
        min: 10500,
        max: 13800,
      });
      setLoading(false);
    }, 1500);
  };

  const handleRecomendarPreco = async () => {
    if (!editalSelecionado || !produtoSelecionado) return;
    // TODO: Chamar API para recomendar preco
    // Prompt: recomendar_preco
    setLoadingRecomendacao(true);
    setTimeout(() => {
      setRecomendacao({
        precoSugerido: 11500,
        faixaMin: 10000,
        faixaMax: 13000,
        justificativa: "Baseado em 12 licitacoes similares nos ultimos 6 meses, considerando o portfolio da empresa e historico de vitorias.",
        baseadoEm: 12,
      });
      setLoadingRecomendacao(false);
    }, 2000);
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

        <Card title="Recomendacao de Preco" icon={<Lightbulb size={18} />}>
          <div className="form-grid form-grid-3">
            <FormField label="Edital">
              <SelectInput
                value={editalSelecionado}
                onChange={setEditalSelecionado}
                options={[
                  { value: "", label: "Selecione..." },
                  { value: "PE-001/2026", label: "PE-001/2026 - UFMG" },
                  { value: "PE-045/2026", label: "PE-045/2026 - CEMIG" },
                  { value: "CC-012/2026", label: "CC-012/2026 - Pref. BH" },
                ]}
              />
            </FormField>
            <FormField label="Produto">
              <SelectInput
                value={produtoSelecionado}
                onChange={setProdutoSelecionado}
                options={[
                  { value: "", label: "Selecione..." },
                  { value: "microscopio", label: "Microscopio ABC-500" },
                  { value: "centrifuga", label: "Centrifuga XYZ-2000" },
                  { value: "autoclave", label: "Autoclave AM-123" },
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
              <ActionButton label="Ver Todos" onClick={() => {}} />
              <ActionButton label="Exportar" onClick={() => {}} />
            </div>
          }
        >
          <DataTable
            data={historico}
            columns={historicoColumns}
            idKey="id"
            emptyMessage="Nenhum historico encontrado"
          />
        </Card>
      </div>
    </div>
  );
}
