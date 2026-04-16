import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { Flag, Bell, Clock, AlertTriangle, Plus, Trash2, CheckCircle } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, SelectInput, Checkbox } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudDelete } from "../api/crud";

interface Alerta {
  id: string;
  edital_id: string;
  tipo: string;
  data_disparo: string | null;
  tempo_antes_minutos: number | null;
  status: string;
  canal_email: boolean;
  canal_push: boolean;
  titulo: string | null;
  mensagem: string | null;
  disparado_em: string | null;
  lido_em: string | null;
  created_at: string | null;
}

export function FlagsPage({ onSendToChat }: PageProps) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriarModal, setShowCriarModal] = useState(false);

  const [novoEdital, setNovoEdital] = useState("");
  const [novoTipo, setNovoTipo] = useState("abertura");
  const [antecedencia24h, setAntecedencia24h] = useState(true);
  const [antecedencia1h, setAntecedencia1h] = useState(true);
  const [antecedencia15min, setAntecedencia15min] = useState(false);

  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crudList("alertas", { limit: 200 });
      setAlertas((res.items || []) as Alerta[]);
    } catch (e) {
      console.error("Erro ao carregar alertas:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  const agendados = alertas.filter(a => a.status === "agendado").length;
  const disparados = alertas.filter(a => a.status === "disparado").length;
  const lidos = alertas.filter(a => a.status === "lido").length;
  const cancelados = alertas.filter(a => a.status === "cancelado").length;

  const handleCriarAlerta = () => {
    if (!onSendToChat || !novoEdital) return;
    const tempos: string[] = [];
    if (antecedencia24h) tempos.push("24h");
    if (antecedencia1h) tempos.push("1h");
    if (antecedencia15min) tempos.push("15min");
    onSendToChat(`configurar alertas para o edital ${novoEdital} tipo ${novoTipo} com antecedencia de ${tempos.join(" e ")}`);
    setShowCriarModal(false);
    setNovoEdital("");
    setNovoTipo("abertura");
    setAntecedencia24h(true);
    setAntecedencia1h(true);
    setAntecedencia15min(false);
    setTimeout(fetchAlertas, 3000);
  };

  const handleCancelarAlerta = async (id: string) => {
    try {
      await crudDelete("alertas", id);
      fetchAlertas();
    } catch (e) {
      console.error("Erro ao cancelar alerta:", e);
    }
  };

  const getTipoBadge = (tipo: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      abertura: { cls: "status-badge-info", icon: <Clock size={12} />, label: "Abertura" },
      impugnacao: { cls: "status-badge-warning", icon: <AlertTriangle size={12} />, label: "Impugnacao" },
      recursos: { cls: "status-badge-warning", icon: <AlertTriangle size={12} />, label: "Recursos" },
      proposta: { cls: "status-badge-info", icon: <Clock size={12} />, label: "Proposta" },
      contrato_vencimento: { cls: "status-badge-error", icon: <AlertTriangle size={12} />, label: "Contrato" },
      entrega_prazo: { cls: "status-badge-success", icon: <CheckCircle size={12} />, label: "Entrega" },
    };
    const m = map[tipo] || { cls: "status-badge-neutral", icon: null, label: tipo };
    return <span className={`status-badge ${m.cls}`}>{m.icon} {m.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <span className="status-badge status-badge-success">Agendado</span>;
      case "disparado":
        return <span className="status-badge status-badge-info">Disparado</span>;
      case "lido":
        return <span className="status-badge status-badge-neutral">Lido</span>;
      case "cancelado":
        return <span className="status-badge status-badge-error">Cancelado</span>;
      default:
        return <span className="status-badge status-badge-neutral">{status}</span>;
    }
  };

  const formatData = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  const alertasColumns: Column<Alerta>[] = [
    { key: "titulo", header: "Titulo", sortable: true, render: (a) => a.titulo || "—" },
    { key: "tipo", header: "Tipo", render: (a) => getTipoBadge(a.tipo) },
    { key: "data_disparo", header: "Disparo", render: (a) => formatData(a.data_disparo), sortable: true },
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
          disabled={a.status === "cancelado"}
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
        <Card title="Resumo" icon={<Bell size={18} />}>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon success"><CheckCircle size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{agendados}</span>
                <span className="stat-label">Agendados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon info"><Bell size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{disparados}</span>
                <span className="stat-label">Disparados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Clock size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{lidos}</span>
                <span className="stat-label">Lidos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon error"><AlertTriangle size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{cancelados}</span>
                <span className="stat-label">Cancelados</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Meus Alertas"
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
            loading={loading}
            emptyMessage="Nenhum alerta configurado"
          />
        </Card>
      </div>

      <Modal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        title="Criar Alerta via IA"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCriarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarAlerta} disabled={!novoEdital}>
              <Bell size={14} /> Criar Alerta
            </button>
          </>
        }
      >
        <FormField label="Numero do Edital" required>
          <input
            type="text"
            className="form-input"
            value={novoEdital}
            onChange={(e) => setNovoEdital(e.target.value)}
            placeholder="Ex: PE-001/2026"
          />
        </FormField>

        <FormField label="Tipo de Alerta" required>
          <SelectInput
            value={novoTipo}
            onChange={setNovoTipo}
            options={[
              { value: "abertura", label: "Abertura do Edital" },
              { value: "impugnacao", label: "Prazo de Impugnacao" },
              { value: "recursos", label: "Prazo de Recursos" },
              { value: "proposta", label: "Prazo para Proposta" },
              { value: "entrega_prazo", label: "Prazo de Entrega" },
            ]}
          />
        </FormField>

        <FormField label="Antecedencia">
          <div className="checkbox-group">
            <Checkbox checked={antecedencia24h} onChange={setAntecedencia24h} label="24 horas" />
            <Checkbox checked={antecedencia1h} onChange={setAntecedencia1h} label="1 hora" />
            <Checkbox checked={antecedencia15min} onChange={setAntecedencia15min} label="15 minutos" />
          </div>
        </FormField>

        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
          O alerta sera criado via chat com a IA, que calculara as datas automaticamente.
        </p>
      </Modal>
    </div>
  );
}
