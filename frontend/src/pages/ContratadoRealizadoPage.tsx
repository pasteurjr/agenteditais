import { useState } from "react";
import { BarChart2, TrendingUp, TrendingDown, Clock, AlertTriangle } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, SelectInput } from "../components/common";
import type { Column } from "../components/common";

interface ContratoComparativo {
  id: string;
  edital: string;
  orgao: string;
  produto: string;
  valorContratado: number;
  valorRealizado: number;
  variacao: number;
  status: "concluido" | "em_andamento";
}

interface PedidoAtraso {
  id: string;
  contrato: string;
  orgao: string;
  prazo: string;
  diasAtraso: number;
}

// Dados mock
const mockContratos: ContratoComparativo[] = [
  { id: "1", edital: "PE-032/2026", orgao: "USP", produto: "Microscopio", valorContratado: 28000, valorRealizado: 28000, variacao: 0, status: "concluido" },
  { id: "2", edital: "PE-018/2026", orgao: "UFMG", produto: "Centrifuga", valorContratado: 45000, valorRealizado: 42000, variacao: -6.7, status: "concluido" },
  { id: "3", edital: "PE-020/2026", orgao: "UNESP", produto: "Autoclave", valorContratado: 35000, valorRealizado: 35000, variacao: 0, status: "em_andamento" },
  { id: "4", edital: "PE-015/2026", orgao: "UNICAMP", produto: "Reagentes", valorContratado: 15000, valorRealizado: 14200, variacao: -5.3, status: "concluido" },
];

const mockAtrasos: PedidoAtraso[] = [
  { id: "1", contrato: "PE-010/2026", orgao: "UFMG", prazo: "01/02/2026", diasAtraso: 9 },
  { id: "2", contrato: "PE-015/2026", orgao: "USP", prazo: "05/02/2026", diasAtraso: 5 },
];

const mockProximosVencimentos: PedidoAtraso[] = [
  { id: "1", contrato: "PE-020/2026", orgao: "CEMIG", prazo: "17/02/2026", diasAtraso: -7 },
  { id: "2", contrato: "PE-022/2026", orgao: "UNESP", prazo: "20/02/2026", diasAtraso: -10 },
  { id: "3", contrato: "PE-025/2026", orgao: "UFOP", prazo: "22/02/2026", diasAtraso: -12 },
];

export function ContratadoRealizadoPage() {
  const [contratos] = useState<ContratoComparativo[]>(mockContratos);
  const [atrasos] = useState<PedidoAtraso[]>(mockAtrasos);
  const [proximosVencimentos] = useState<PedidoAtraso[]>(mockProximosVencimentos);
  const [periodo, setPeriodo] = useState("6m");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // Calculos
  const totalContratado = contratos.reduce((acc, c) => acc + c.valorContratado, 0);
  const totalRealizado = contratos.reduce((acc, c) => acc + c.valorRealizado, 0);
  const variacaoTotal = ((totalRealizado - totalContratado) / totalContratado) * 100;

  const contratosColumns: Column<ContratoComparativo>[] = [
    { key: "edital", header: "Contrato", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "produto", header: "Produto" },
    { key: "valorContratado", header: "Contratado", render: (c) => formatCurrency(c.valorContratado) },
    { key: "valorRealizado", header: "Realizado", render: (c) => formatCurrency(c.valorRealizado) },
    {
      key: "variacao",
      header: "Variacao",
      render: (c) => (
        <span className={c.variacao < 0 ? "text-success" : c.variacao > 0 ? "text-danger" : ""}>
          {c.variacao < 0 ? <TrendingDown size={14} /> : c.variacao > 0 ? <TrendingUp size={14} /> : null}
          {c.variacao.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <span className={`status-badge ${c.status === "concluido" ? "status-badge-success" : "status-badge-info"}`}>
          {c.status === "concluido" ? "Concluido" : "Em andamento"}
        </span>
      ),
    },
  ];

  const atrasosColumns: Column<PedidoAtraso>[] = [
    { key: "contrato", header: "Contrato" },
    { key: "orgao", header: "Orgao" },
    { key: "prazo", header: "Prazo" },
    {
      key: "diasAtraso",
      header: "Atraso",
      render: (a) => <span className="text-danger">{a.diasAtraso} dias</span>,
    },
    {
      key: "acoes",
      header: "",
      width: "100px",
      render: () => (
        <ActionButton label="Contato" onClick={() => {}} />
      ),
    },
  ];

  const vencimentosColumns: Column<PedidoAtraso>[] = [
    { key: "contrato", header: "Contrato" },
    { key: "orgao", header: "Orgao" },
    { key: "prazo", header: "Prazo" },
    {
      key: "diasAtraso",
      header: "Dias Rest.",
      render: (a) => <span className="text-warning">{Math.abs(a.diasAtraso)} dias</span>,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <BarChart2 size={24} />
          <div>
            <h1>Contratado X Realizado</h1>
            <p>Comparativo de valores e pedidos em atraso</p>
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

          <div className="resumo-comparativo">
            <div className="resumo-item">
              <label>Total Contratado</label>
              <span className="valor">{formatCurrency(totalContratado)}</span>
            </div>
            <div className="resumo-item">
              <label>Total Realizado</label>
              <span className="valor">{formatCurrency(totalRealizado)}</span>
            </div>
            <div className="resumo-item">
              <label>Variacao</label>
              <span className={`valor ${variacaoTotal < 0 ? "text-success" : "text-danger"}`}>
                {variacaoTotal < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                {variacaoTotal.toFixed(1)}%
                {variacaoTotal < 0 && <span className="subtext">(economia)</span>}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Detalhamento" icon={<BarChart2 size={18} />}>
          <DataTable
            data={contratos}
            columns={contratosColumns}
            idKey="id"
            emptyMessage="Nenhum contrato encontrado"
          />
        </Card>

        <div className="cards-row">
          <Card title="Pedidos em Atraso" icon={<AlertTriangle size={18} />}>
            <div className="alerta-header danger">
              <AlertTriangle size={20} />
              <span>{atrasos.length} contratos com entrega atrasada</span>
            </div>
            <DataTable
              data={atrasos}
              columns={atrasosColumns}
              idKey="id"
              emptyMessage="Nenhum pedido em atraso"
            />
          </Card>

          <Card title="Proximos Vencimentos" icon={<Clock size={18} />}>
            <div className="alerta-header warning">
              <Clock size={20} />
              <span>{proximosVencimentos.length} contratos vencem em 7 dias</span>
            </div>
            <DataTable
              data={proximosVencimentos}
              columns={vencimentosColumns}
              idKey="id"
              emptyMessage="Nenhum vencimento proximo"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
