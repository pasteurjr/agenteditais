import { useState } from "react";
import { Package, Truck, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, TextInput } from "../components/common";
import type { Column } from "../components/common";

interface Contrato {
  id: string;
  edital: string;
  orgao: string;
  produto: string;
  quantidade: number;
  valorTotal: number;
  prazoEntrega: string;
  diasRestantes: number;
  status: "ok" | "atencao" | "atrasado" | "entregue";
  nfAnexada?: boolean;
}

// Dados mock
const mockContratos: Contrato[] = [
  { id: "1", edital: "PE-032/2026", orgao: "USP", produto: "Microscopio ABC-500", quantidade: 2, valorTotal: 28000, prazoEntrega: "20/03/2026", diasRestantes: 35, status: "ok" },
  { id: "2", edital: "PE-018/2026", orgao: "UFMG", produto: "Centrifuga XYZ-2000", quantidade: 3, valorTotal: 45000, prazoEntrega: "15/03/2026", diasRestantes: 30, status: "atencao" },
  { id: "3", edital: "PE-020/2026", orgao: "UNESP", produto: "Autoclave AM-123", quantidade: 1, valorTotal: 35000, prazoEntrega: "01/03/2026", diasRestantes: 16, status: "ok", nfAnexada: true },
  { id: "4", edital: "PE-010/2026", orgao: "UNICAMP", produto: "Reagente TR-001", quantidade: 100, valorTotal: 15000, prazoEntrega: "01/02/2026", diasRestantes: -9, status: "atrasado" },
];

export function ProducaoPage() {
  const [contratos, setContratos] = useState<Contrato[]>(mockContratos);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [showNfModal, setShowNfModal] = useState(false);

  const handleRegistrarEntrega = () => {
    if (!selectedContrato) return;
    setContratos(contratos.map(c =>
      c.id === selectedContrato.id ? { ...c, status: "entregue" as const } : c
    ));
    setShowEntregaModal(false);
    setSelectedContrato(null);
  };

  const handleAnexarNf = () => {
    if (!selectedContrato) return;
    setContratos(contratos.map(c =>
      c.id === selectedContrato.id ? { ...c, nfAnexada: true } : c
    ));
    setShowNfModal(false);
    setSelectedContrato(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getStatusBadge = (status: Contrato["status"]) => {
    switch (status) {
      case "ok":
        return <span className="status-badge status-badge-success"><CheckCircle size={12} /> OK</span>;
      case "atencao":
        return <span className="status-badge status-badge-warning"><Clock size={12} /> Atencao</span>;
      case "atrasado":
        return <span className="status-badge status-badge-error"><AlertTriangle size={12} /> Atrasado</span>;
      case "entregue":
        return <span className="status-badge status-badge-info"><Truck size={12} /> Entregue</span>;
    }
  };

  const columns: Column<Contrato>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "produto", header: "Produto" },
    { key: "quantidade", header: "Qtd" },
    { key: "valorTotal", header: "Valor", render: (c) => formatCurrency(c.valorTotal) },
    { key: "prazoEntrega", header: "Prazo", sortable: true },
    {
      key: "diasRestantes",
      header: "Dias Rest.",
      render: (c) => (
        <span className={c.diasRestantes < 0 ? "text-danger" : c.diasRestantes <= 7 ? "text-warning" : ""}>
          {c.diasRestantes < 0 ? `${Math.abs(c.diasRestantes)} dias atrasado` : `${c.diasRestantes} dias`}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (c) => getStatusBadge(c.status) },
    {
      key: "nf",
      header: "NF",
      render: (c) => c.nfAnexada ? <CheckCircle size={16} className="text-success" /> : <span className="text-muted">-</span>,
    },
  ];

  const contratosAtivos = contratos.filter(c => c.status !== "entregue");
  const contratosAtrasados = contratos.filter(c => c.status === "atrasado");

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Package size={24} />
          <div>
            <h1>Contratos em Producao</h1>
            <p>Gerenciamento de contratos ganhos em execucao</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon info"><Package size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{contratosAtivos.length}</span>
              <span className="stat-label">Contratos Ativos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon error"><AlertTriangle size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{contratosAtrasados.length}</span>
              <span className="stat-label">Atrasados</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><Truck size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{contratos.filter(c => c.status === "entregue").length}</span>
              <span className="stat-label">Entregues</span>
            </div>
          </div>
        </div>

        <Card title="Contratos Ativos" icon={<Package size={18} />}>
          <DataTable
            data={contratosAtivos}
            columns={columns}
            idKey="id"
            onRowClick={setSelectedContrato}
            selectedId={selectedContrato?.id}
            emptyMessage="Nenhum contrato ativo"
          />
        </Card>

        {selectedContrato && (
          <Card
            title={`Detalhes do Contrato: ${selectedContrato.edital}`}
            icon={<FileText size={18} />}
          >
            <div className="contrato-detalhes">
              <div className="info-grid">
                <div className="info-item">
                  <label>Edital</label>
                  <span>{selectedContrato.edital}</span>
                </div>
                <div className="info-item">
                  <label>Orgao</label>
                  <span>{selectedContrato.orgao}</span>
                </div>
                <div className="info-item">
                  <label>Produto</label>
                  <span>{selectedContrato.produto}</span>
                </div>
                <div className="info-item">
                  <label>Quantidade</label>
                  <span>{selectedContrato.quantidade}</span>
                </div>
                <div className="info-item">
                  <label>Valor Total</label>
                  <span>{formatCurrency(selectedContrato.valorTotal)}</span>
                </div>
                <div className="info-item">
                  <label>Prazo de Entrega</label>
                  <span>{selectedContrato.prazoEntrega}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  {getStatusBadge(selectedContrato.status)}
                </div>
                <div className="info-item">
                  <label>NF Anexada</label>
                  <span>{selectedContrato.nfAnexada ? "Sim" : "Nao"}</span>
                </div>
              </div>

              <div className="contrato-actions">
                <ActionButton
                  icon={<Truck size={14} />}
                  label="Registrar Entrega"
                  variant="primary"
                  onClick={() => setShowEntregaModal(true)}
                  disabled={selectedContrato.status === "entregue"}
                />
                <ActionButton
                  icon={<FileText size={14} />}
                  label="Anexar NF"
                  onClick={() => setShowNfModal(true)}
                  disabled={selectedContrato.nfAnexada}
                />
                <ActionButton
                  label="Ver Historico"
                  onClick={() => {}}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showEntregaModal}
        onClose={() => setShowEntregaModal(false)}
        title="Registrar Entrega"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowEntregaModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleRegistrarEntrega}>
              <Truck size={14} /> Confirmar Entrega
            </button>
          </>
        }
      >
        <p>Confirma a entrega do contrato <strong>{selectedContrato?.edital}</strong>?</p>
        <FormField label="Data da Entrega">
          <TextInput value={new Date().toLocaleDateString("pt-BR")} onChange={() => {}} />
        </FormField>
        <FormField label="Observacao">
          <TextInput value="" onChange={() => {}} placeholder="Observacao opcional..." />
        </FormField>
      </Modal>

      <Modal
        isOpen={showNfModal}
        onClose={() => setShowNfModal(false)}
        title="Anexar Nota Fiscal"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowNfModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAnexarNf}>Anexar</button>
          </>
        }
      >
        <FormField label="Numero da NF" required>
          <TextInput value="" onChange={() => {}} />
        </FormField>
        <FormField label="Arquivo" required>
          <input type="file" accept=".pdf,.xml" />
        </FormField>
      </Modal>
    </div>
  );
}
