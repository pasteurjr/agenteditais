import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { Radio, Plus, Play, Pause, Trash2, Eye, RefreshCw } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, TextInput, Checkbox } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudUpdate, crudDelete } from "../api/crud";

interface Monitoramento {
  id: string;
  termo: string;
  ncm: string | null;
  ufs: string[] | null;
  frequencia_horas: number;
  ultimo_check: string | null;
  proximo_check: string | null;
  score_minimo_alerta: number;
  ativo: boolean;
  editais_encontrados: number;
  created_at: string | null;
}

export function MonitoriaPage({ onSendToChat }: PageProps) {
  const [monitoramentos, setMonitoramentos] = useState<Monitoramento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMon, setSelectedMon] = useState<Monitoramento | null>(null);
  const [showCriarModal, setShowCriarModal] = useState(false);

  const [novoTermo, setNovoTermo] = useState("");
  const [novasUfs, setNovasUfs] = useState("");
  const [frequencia, setFrequencia] = useState("6");
  const [notificarEmail, setNotificarEmail] = useState(true);

  const fetchMonitoramentos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crudList("monitoramentos", { limit: 200 });
      setMonitoramentos((res.items || []) as Monitoramento[]);
    } catch (e) {
      console.error("Erro ao carregar monitoramentos:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMonitoramentos();
  }, [fetchMonitoramentos]);

  const ativos = monitoramentos.filter(m => m.ativo).length;
  const pausados = monitoramentos.filter(m => !m.ativo).length;
  const totalEncontrados = monitoramentos.reduce((s, m) => s + (m.editais_encontrados || 0), 0);

  const handleToggleStatus = async (mon: Monitoramento) => {
    try {
      await crudUpdate("monitoramentos", mon.id, { ativo: !mon.ativo });
      fetchMonitoramentos();
    } catch (e) {
      console.error("Erro ao alterar status:", e);
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      await crudDelete("monitoramentos", id);
      fetchMonitoramentos();
    } catch (e) {
      console.error("Erro ao excluir:", e);
    }
  };

  const handleCriarMonitoramento = () => {
    if (!onSendToChat || !novoTermo) return;
    const ufsStr = novasUfs ? ` ufs=${novasUfs}` : "";
    const emailStr = notificarEmail ? " notificar_email=sim" : "";
    onSendToChat(`configurar monitoramento termo="${novoTermo}" frequencia=${frequencia}h${ufsStr}${emailStr}`);
    setShowCriarModal(false);
    setNovoTermo("");
    setNovasUfs("");
    setFrequencia("6");
    setTimeout(fetchMonitoramentos, 3000);
  };

  const formatData = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  const monitoramentoColumns: Column<Monitoramento>[] = [
    { key: "termo", header: "Termo", sortable: true },
    { key: "ufs", header: "UFs", render: (m) => m.ufs?.join(", ") || "Todos" },
    { key: "frequencia_horas", header: "Freq.", render: (m) => `${m.frequencia_horas}h` },
    { key: "ultimo_check", header: "Ultimo Check", render: (m) => formatData(m.ultimo_check) },
    {
      key: "editais_encontrados",
      header: "Encontrados",
      render: (m) => (
        <span className={m.editais_encontrados > 0 ? "badge-new" : ""}>
          {m.editais_encontrados || 0}
        </span>
      ),
      sortable: true,
    },
    {
      key: "ativo",
      header: "Status",
      render: (m) => (
        <span className={`status-badge ${m.ativo ? "status-badge-success" : "status-badge-neutral"}`}>
          {m.ativo ? "Ativo" : "Pausado"}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Acoes",
      width: "100px",
      render: (m) => (
        <div className="table-actions">
          <button title={m.ativo ? "Pausar" : "Ativar"} onClick={() => handleToggleStatus(m)}>
            {m.ativo ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button title="Excluir" className="danger" onClick={() => handleExcluir(m.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Radio size={24} />
          <div>
            <h1>Monitoramento Automatico</h1>
            <p>Configuracao de buscas automaticas de editais</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Resumo" icon={<Radio size={18} />}>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon success"><Play size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{ativos}</span>
                <span className="stat-label">Ativos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Pause size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{pausados}</span>
                <span className="stat-label">Pausados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon info"><Eye size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{totalEncontrados}</span>
                <span className="stat-label">Editais encontrados</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Monitoramentos"
          icon={<Radio size={18} />}
          actions={
            <ActionButton icon={<Plus size={14} />} label="Novo Monitoramento" onClick={() => setShowCriarModal(true)} />
          }
        >
          <DataTable
            data={monitoramentos}
            columns={monitoramentoColumns}
            idKey="id"
            loading={loading}
            onRowClick={setSelectedMon}
            selectedId={selectedMon?.id}
            emptyMessage="Nenhum monitoramento configurado"
          />
        </Card>

        {selectedMon && (
          <Card title={`Detalhes: "${selectedMon.termo}"`} icon={<RefreshCw size={18} />}>
            <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="info-item">
                <label>Termo</label>
                <span>{selectedMon.termo}</span>
              </div>
              <div className="info-item">
                <label>NCM</label>
                <span>{selectedMon.ncm || "—"}</span>
              </div>
              <div className="info-item">
                <label>UFs</label>
                <span>{selectedMon.ufs?.join(", ") || "Todos"}</span>
              </div>
              <div className="info-item">
                <label>Frequencia</label>
                <span>{selectedMon.frequencia_horas}h</span>
              </div>
              <div className="info-item">
                <label>Score minimo</label>
                <span>{selectedMon.score_minimo_alerta}%</span>
              </div>
              <div className="info-item">
                <label>Editais encontrados</label>
                <span style={{ fontWeight: 700, color: "#3b82f6" }}>{selectedMon.editais_encontrados || 0}</span>
              </div>
              <div className="info-item">
                <label>Ultimo check</label>
                <span>{formatData(selectedMon.ultimo_check)}</span>
              </div>
              <div className="info-item">
                <label>Proximo check</label>
                <span>{formatData(selectedMon.proximo_check)}</span>
              </div>
              <div className="info-item">
                <label>Criado em</label>
                <span>{formatData(selectedMon.created_at)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        title="Criar Monitoramento via IA"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCriarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarMonitoramento} disabled={!novoTermo}>
              <Radio size={14} /> Criar Monitoramento
            </button>
          </>
        }
      >
        <FormField label="Termo de busca" required>
          <TextInput value={novoTermo} onChange={setNovoTermo} placeholder="Ex: microscopio, centrifuga, reagente..." />
        </FormField>

        <FormField label="Estados (UFs) - separar por virgula">
          <TextInput value={novasUfs} onChange={setNovasUfs} placeholder="Ex: SP, MG, RJ (vazio = todos)" />
        </FormField>

        <FormField label="Frequencia (horas)">
          <TextInput value={frequencia} onChange={setFrequencia} placeholder="6" />
        </FormField>

        <FormField label="Notificar por">
          <div className="checkbox-group">
            <Checkbox checked={notificarEmail} onChange={setNotificarEmail} label="Email" />
          </div>
        </FormField>

        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
          O monitoramento sera configurado via chat com a IA.
        </p>
      </Modal>
    </div>
  );
}
