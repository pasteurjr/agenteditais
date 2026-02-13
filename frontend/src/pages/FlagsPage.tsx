import { useState } from "react";
import { Flag, Bell, Clock, AlertTriangle, Plus, Trash2, CheckCircle } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, SelectInput, Checkbox } from "../components/common";
import type { Column } from "../components/common";

interface AlertaAtivo {
  tipo: string;
  quantidade: number;
  cor: "danger" | "warning" | "success";
  items: string[];
}

interface Alerta {
  id: string;
  edital: string;
  tipo: "abertura" | "impugnacao" | "entrega" | "documento";
  antecedencia: string[];
  status: "ativo" | "disparado" | "expirado";
  proximoDisparo?: string;
}

// Dados mock
const mockAlertasAtivos: AlertaAtivo[] = [
  { tipo: "Editais vencem em 24h", quantidade: 3, cor: "danger", items: ["PE-001/2026", "PE-045/2026", "CC-012/2026"] },
  { tipo: "Propostas pendentes de envio", quantidade: 5, cor: "warning", items: ["PE-001/2026", "PE-045/2026", "CC-012/2026", "PE-088/2026", "DP-003/2026"] },
  { tipo: "Contratos com entrega proxima", quantidade: 2, cor: "success", items: ["PE-032/2026", "PE-018/2026"] },
];

const mockAlertas: Alerta[] = [
  { id: "1", edital: "PE-001/2026", tipo: "abertura", antecedencia: ["24h", "1h"], status: "ativo", proximoDisparo: "14/02/2026 14:00" },
  { id: "2", edital: "PE-045/2026", tipo: "impugnacao", antecedencia: ["48h"], status: "ativo", proximoDisparo: "16/02/2026 10:00" },
  { id: "3", edital: "PE-032/2026", tipo: "entrega", antecedencia: ["7d", "1d"], status: "ativo", proximoDisparo: "13/03/2026" },
  { id: "4", edital: "CC-012/2025", tipo: "abertura", antecedencia: ["24h"], status: "expirado" },
];

export function FlagsPage() {
  const [alertasAtivos] = useState<AlertaAtivo[]>(mockAlertasAtivos);
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [showCriarModal, setShowCriarModal] = useState(false);

  // Form
  const [novoEdital, setNovoEdital] = useState("");
  const [novoTipo, setNovoTipo] = useState("abertura");
  const [antecedencia24h, setAntecedencia24h] = useState(true);
  const [antecedencia1h, setAntecedencia1h] = useState(true);
  const [antecedencia15min, setAntecedencia15min] = useState(false);

  const handleCriarAlerta = () => {
    // TODO: Chamar API para criar alerta
    // Prompt: configurar_alertas
    const antecedencia: string[] = [];
    if (antecedencia24h) antecedencia.push("24h");
    if (antecedencia1h) antecedencia.push("1h");
    if (antecedencia15min) antecedencia.push("15min");

    const novoAlerta: Alerta = {
      id: String(alertas.length + 1),
      edital: novoEdital,
      tipo: novoTipo as Alerta["tipo"],
      antecedencia,
      status: "ativo",
      proximoDisparo: "A calcular",
    };
    setAlertas([novoAlerta, ...alertas]);
    setShowCriarModal(false);
    // Reset
    setNovoEdital("");
    setNovoTipo("abertura");
    setAntecedencia24h(true);
    setAntecedencia1h(true);
    setAntecedencia15min(false);
  };

  const handleCancelarAlerta = (id: string) => {
    // TODO: Chamar API para cancelar alerta
    // Prompt: cancelar_alerta
    setAlertas(alertas.filter(a => a.id !== id));
  };

  const getTipoBadge = (tipo: Alerta["tipo"]) => {
    switch (tipo) {
      case "abertura":
        return <span className="status-badge status-badge-info"><Clock size={12} /> Abertura</span>;
      case "impugnacao":
        return <span className="status-badge status-badge-warning"><AlertTriangle size={12} /> Impugnacao</span>;
      case "entrega":
        return <span className="status-badge status-badge-success"><CheckCircle size={12} /> Entrega</span>;
      case "documento":
        return <span className="status-badge status-badge-neutral">Documento</span>;
    }
  };

  const getStatusBadge = (status: Alerta["status"]) => {
    switch (status) {
      case "ativo":
        return <span className="status-badge status-badge-success">Ativo</span>;
      case "disparado":
        return <span className="status-badge status-badge-info">Disparado</span>;
      case "expirado":
        return <span className="status-badge status-badge-neutral">Expirado</span>;
    }
  };

  const alertasColumns: Column<Alerta>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "tipo", header: "Tipo", render: (a) => getTipoBadge(a.tipo) },
    { key: "antecedencia", header: "Antecedencia", render: (a) => a.antecedencia.join(", ") },
    { key: "proximoDisparo", header: "Proximo Disparo", render: (a) => a.proximoDisparo || "-" },
    { key: "status", header: "Status", render: (a) => getStatusBadge(a.status) },
    {
      key: "acoes",
      header: "",
      width: "50px",
      render: (a) => (
        <button
          className="btn-icon danger"
          title="Cancelar alerta"
          onClick={() => handleCancelarAlerta(a.id)}
          disabled={a.status === "expirado"}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Flag size={24} />
          <div>
            <h1>Flags e Alertas</h1>
            <p>Pendencias, alertas e lembretes</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Alertas Ativos" icon={<Bell size={18} />}>
          <div className="alertas-ativos">
            {alertasAtivos.map((alerta, index) => (
              <div key={index} className={`alerta-item alerta-${alerta.cor}`}>
                <div className="alerta-icon">
                  {alerta.cor === "danger" && <AlertTriangle size={20} />}
                  {alerta.cor === "warning" && <Clock size={20} />}
                  {alerta.cor === "success" && <CheckCircle size={20} />}
                </div>
                <div className="alerta-content">
                  <span className="alerta-quantidade">{alerta.quantidade}</span>
                  <span className="alerta-tipo">{alerta.tipo}</span>
                </div>
                <div className="alerta-items">
                  {alerta.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="tag">{item}</span>
                  ))}
                  {alerta.items.length > 3 && (
                    <span className="tag tag-more">+{alerta.items.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Meus Alertas Configurados"
          icon={<Bell size={18} />}
          actions={
            <ActionButton
              icon={<Plus size={14} />}
              label="Novo Alerta"
              onClick={() => setShowCriarModal(true)}
            />
          }
        >
          <DataTable
            data={alertas}
            columns={alertasColumns}
            idKey="id"
            emptyMessage="Nenhum alerta configurado"
          />
        </Card>
      </div>

      <Modal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        title="Criar Alerta"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCriarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarAlerta} disabled={!novoEdital}>
              <Bell size={14} /> Criar Alerta
            </button>
          </>
        }
      >
        <FormField label="Edital" required>
          <SelectInput
            value={novoEdital}
            onChange={setNovoEdital}
            options={[
              { value: "", label: "Selecione..." },
              { value: "PE-001/2026", label: "PE-001/2026 - UFMG" },
              { value: "PE-045/2026", label: "PE-045/2026 - CEMIG" },
              { value: "CC-012/2026", label: "CC-012/2026 - Pref. BH" },
              { value: "PE-088/2026", label: "PE-088/2026 - USP" },
            ]}
          />
        </FormField>

        <FormField label="Tipo de Alerta" required>
          <SelectInput
            value={novoTipo}
            onChange={setNovoTipo}
            options={[
              { value: "abertura", label: "Abertura do Edital" },
              { value: "impugnacao", label: "Prazo de Impugnacao" },
              { value: "entrega", label: "Prazo de Entrega" },
              { value: "documento", label: "Vencimento de Documento" },
            ]}
          />
        </FormField>

        <FormField label="Antecedencia">
          <div className="checkbox-group">
            <Checkbox
              checked={antecedencia24h}
              onChange={setAntecedencia24h}
              label="24 horas"
            />
            <Checkbox
              checked={antecedencia1h}
              onChange={setAntecedencia1h}
              label="1 hora"
            />
            <Checkbox
              checked={antecedencia15min}
              onChange={setAntecedencia15min}
              label="15 minutos"
            />
          </div>
        </FormField>
      </Modal>
    </div>
  );
}
