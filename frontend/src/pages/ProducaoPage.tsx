import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { Package, Clock, CheckCircle, AlertTriangle, Plus, Loader2, FileText, Users, BarChart2 } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, TextArea, SelectInput, Modal, TabPanel } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate } from "../api/crud";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContratoAPI {
  id: string;
  numero_contrato: string;
  orgao: string;
  objeto: string;
  valor_total: number | null;
  data_assinatura: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string;
  edital_id: string | null;
}

interface EntregaAPI {
  id: string;
  contrato_id: string;
  descricao: string;
  quantidade: number | null;
  valor_unitario: number | null;
  valor_total: number | null;
  data_prevista: string | null;
  data_realizada: string | null;
  nota_fiscal: string | null;
  numero_empenho: string | null;
  status: string;
}

interface Aditivo {
  id: string;
  tipo: string;
  justificativa: string;
  valor_original: number | null;
  valor_aditivo: number | null;
  percentual: number | null;
  data_aditivo: string | null;
  fundamentacao_legal: string;
  status: string;
}

interface AditivoResumo {
  valor_original: number;
  total_acrescimos: number;
  total_supressoes: number;
  limite_25_pct: number;
  pct_consumido: number;
}

interface Designacao {
  id: string;
  tipo: string;
  nome: string;
  cargo: string;
  portaria_numero: string;
  data_inicio: string | null;
  data_fim: string | null;
  ativo: boolean;
}

interface CronogramaData {
  stats: { pendentes: number; entregues: number; atrasados: number; total: number };
  semanas: Record<string, EntregaAPI[]>;
  atrasados: (EntregaAPI & { dias_atraso?: number })[];
  proximos_7d: (EntregaAPI & { dias_restantes?: number })[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProducaoPage(_props?: PageProps) {
  const token = localStorage.getItem("editais_ia_access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const fmt = (v: number | null | undefined) => v != null ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

  // State
  const [contratos, setContratos] = useState<ContratoAPI[]>([]);
  const [selectedContrato, setSelectedContrato] = useState<ContratoAPI | null>(null);
  const [entregas, setEntregas] = useState<EntregaAPI[]>([]);
  const [cronograma, setCronograma] = useState<CronogramaData | null>(null);
  const [aditivos, setAditivos] = useState<Aditivo[]>([]);
  const [aditivoResumo, setAditivoResumo] = useState<AditivoResumo | null>(null);
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [showAditivoModal, setShowAditivoModal] = useState(false);
  const [showDesignacaoModal, setShowDesignacaoModal] = useState(false);

  // Form state
  const [formContrato, setFormContrato] = useState({ numero_contrato: "", orgao: "", objeto: "", valor_total: "", data_inicio: "", data_fim: "" });
  const [formEntrega, setFormEntrega] = useState({ descricao: "", quantidade: "", valor_unitario: "", data_prevista: "", nota_fiscal: "", numero_empenho: "" });
  const [formAditivo, setFormAditivo] = useState({ tipo: "acrescimo", valor_aditivo: "", justificativa: "", fundamentacao_legal: "" });
  const [formDesignacao, setFormDesignacao] = useState({ tipo: "gestor", nome: "", cargo: "", portaria_numero: "", data_inicio: "", data_fim: "" });

  const fetchContratos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crudList("contratos", { limit: 100 });
      setContratos(res.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchContratos(); }, [fetchContratos]);

  const selectContrato = async (c: ContratoAPI) => {
    setSelectedContrato(c);
    // Fetch entregas
    try {
      const res = await crudList("contrato-entregas", { limit: 100, filters: { contrato_id: c.id } });
      setEntregas(res.items || []);
    } catch (e) { console.error(e); }
    // Fetch cronograma
    try {
      const res = await fetch(`/api/contratos/${c.id}/cronograma`, { headers });
      if (res.ok) setCronograma(await res.json());
    } catch (e) { console.error(e); }
    // Fetch aditivos
    try {
      const res = await fetch(`/api/contratos/${c.id}/aditivos`, { headers });
      if (res.ok) { const data = await res.json(); setAditivos(data.aditivos || []); setAditivoResumo(data.resumo || null); }
    } catch (e) { console.error(e); }
    // Fetch designações
    try {
      const res = await fetch(`/api/contratos/${c.id}/designacoes`, { headers });
      if (res.ok) setDesignacoes(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleCreateContrato = async () => {
    try {
      await crudCreate("contratos", { ...formContrato, valor_total: parseFloat(formContrato.valor_total) || 0, status: "vigente" });
      setShowContratoModal(false);
      setFormContrato({ numero_contrato: "", orgao: "", objeto: "", valor_total: "", data_inicio: "", data_fim: "" });
      fetchContratos();
    } catch (e) { console.error(e); }
  };

  const handleCreateEntrega = async () => {
    if (!selectedContrato) return;
    try {
      await crudCreate("contrato-entregas", { contrato_id: selectedContrato.id, ...formEntrega, quantidade: parseFloat(formEntrega.quantidade) || 0, valor_unitario: parseFloat(formEntrega.valor_unitario) || 0, valor_total: (parseFloat(formEntrega.quantidade) || 0) * (parseFloat(formEntrega.valor_unitario) || 0), status: "pendente" });
      setShowEntregaModal(false);
      setFormEntrega({ descricao: "", quantidade: "", valor_unitario: "", data_prevista: "", nota_fiscal: "", numero_empenho: "" });
      selectContrato(selectedContrato);
    } catch (e) { console.error(e); }
  };

  const handleCreateAditivo = async () => {
    if (!selectedContrato) return;
    try {
      await fetch(`/api/contratos/${selectedContrato.id}/aditivos`, { method: "POST", headers, body: JSON.stringify({ ...formAditivo, valor_aditivo: parseFloat(formAditivo.valor_aditivo) || 0 }) });
      setShowAditivoModal(false);
      setFormAditivo({ tipo: "acrescimo", valor_aditivo: "", justificativa: "", fundamentacao_legal: "" });
      selectContrato(selectedContrato);
    } catch (e) { console.error(e); }
  };

  const handleCreateDesignacao = async () => {
    if (!selectedContrato) return;
    try {
      await fetch(`/api/contratos/${selectedContrato.id}/designacoes`, { method: "POST", headers, body: JSON.stringify(formDesignacao) });
      setShowDesignacaoModal(false);
      setFormDesignacao({ tipo: "gestor", nome: "", cargo: "", portaria_numero: "", data_inicio: "", data_fim: "" });
      selectContrato(selectedContrato);
    } catch (e) { console.error(e); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; fg: string }> = {
      vigente: { bg: "#dcfce7", fg: "#166534" }, encerrado: { bg: "#f3f4f6", fg: "#374151" },
      rescindido: { bg: "#fee2e2", fg: "#991b1b" }, suspenso: { bg: "#fef3c7", fg: "#92400e" },
      pendente: { bg: "#fef3c7", fg: "#92400e" }, entregue: { bg: "#dcfce7", fg: "#166534" },
      atrasado: { bg: "#fee2e2", fg: "#991b1b" },
    };
    const c = colors[status] || { bg: "#f3f4f6", fg: "#374151" };
    return <span style={{ background: c.bg, color: c.fg, padding: "2px 10px", borderRadius: 12, fontSize: 12 }}>{status}</span>;
  };

  const noContrato = <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Selecione um contrato na aba "Contratos"</div>;

  // Contrato columns
  const contratoCols: Column<ContratoAPI>[] = [
    { key: "numero_contrato", header: "Número" },
    { key: "orgao", header: "Órgão" },
    { key: "objeto", header: "Objeto", render: (r) => <span title={r.objeto}>{r.objeto?.substring(0, 50)}{r.objeto && r.objeto.length > 50 ? "..." : ""}</span> },
    { key: "valor_total", header: "Valor", render: (r) => fmt(r.valor_total) },
    { key: "data_fim", header: "Término", render: (r) => r.data_fim ? new Date(r.data_fim).toLocaleDateString("pt-BR") : "—" },
    { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
    { key: "id", header: "Ação", render: (r) => <ActionButton label="Selecionar" onClick={() => selectContrato(r)} size="sm" variant={selectedContrato?.id === r.id ? "primary" : "secondary"} /> },
  ];

  // Tabs
  const tabContratos = (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total", value: contratos.length, color: "#3b82f6", icon: <Package size={20} /> },
          { label: "Vigentes", value: contratos.filter(c => c.status === "vigente").length, color: "#16a34a", icon: <CheckCircle size={20} /> },
          { label: "A Vencer (30d)", value: contratos.filter(c => { if (!c.data_fim) return false; const d = Math.ceil((new Date(c.data_fim).getTime() - Date.now()) / 86400000); return d > 0 && d <= 30; }).length, color: "#eab308", icon: <Clock size={20} /> },
          { label: "Valor Total", value: fmt(contratos.reduce((s, c) => s + (c.valor_total || 0), 0)), color: "#8b5cf6", icon: <BarChart2 size={20} /> },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: s.color + "20", color: s.color, borderRadius: 8, padding: 8 }}>{s.icon}</div>
              <div><div style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div></div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3>Contratos</h3>
          <ActionButton label="Novo Contrato" onClick={() => setShowContratoModal(true)} icon={<Plus size={16} />} />
        </div>
        {loading ? <Loader2 className="animate-spin" /> : <DataTable columns={contratoCols} data={contratos} />}
      </Card>
    </div>
  );

  const entregaCols: Column<EntregaAPI>[] = [
    { key: "descricao", header: "Descrição" },
    { key: "quantidade", header: "Qtd" },
    { key: "valor_total", header: "Valor", render: (r) => fmt(r.valor_total) },
    { key: "data_prevista", header: "Prevista", render: (r) => r.data_prevista ? new Date(r.data_prevista).toLocaleDateString("pt-BR") : "—" },
    { key: "data_realizada", header: "Realizada", render: (r) => r.data_realizada ? new Date(r.data_realizada).toLocaleDateString("pt-BR") : "—" },
    { key: "nota_fiscal", header: "NF" },
    { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
  ];

  const tabEntregas = !selectedContrato ? noContrato : (
    <div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3>Entregas — {selectedContrato.numero_contrato}</h3>
          <ActionButton label="Nova Entrega" onClick={() => setShowEntregaModal(true)} icon={<Plus size={16} />} />
        </div>
        <DataTable columns={entregaCols} data={entregas} />
      </Card>
    </div>
  );

  const tabCronograma = !selectedContrato ? noContrato : !cronograma ? <Loader2 className="animate-spin" /> : (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Pendentes", value: cronograma.stats.pendentes, color: "#eab308" },
          { label: "Entregues", value: cronograma.stats.entregues, color: "#16a34a" },
          { label: "Atrasados", value: cronograma.stats.atrasados, color: "#dc2626" },
          { label: "Total", value: cronograma.stats.total, color: "#3b82f6" },
        ].map((s, i) => (
          <Card key={i}><div style={{ textAlign: "center" }}><div style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</div><div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div></div></Card>
        ))}
      </div>
      {cronograma.atrasados.length > 0 && (
        <Card>
          <h3 style={{ color: "#dc2626", marginBottom: 12 }}>⚠ Entregas Atrasadas</h3>
          {cronograma.atrasados.map((e, i) => (
            <div key={i} style={{ padding: 8, borderBottom: "1px solid #fee2e2", display: "flex", justifyContent: "space-between" }}>
              <span>{e.descricao}</span>
              <span style={{ color: "#dc2626", fontWeight: 700 }}>{e.dias_atraso}d atraso</span>
            </div>
          ))}
        </Card>
      )}
      {cronograma.proximos_7d.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card>
            <h3 style={{ marginBottom: 12 }}>Próximos 7 dias</h3>
            {cronograma.proximos_7d.map((e, i) => (
              <div key={i} style={{ padding: 8, borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
                <span>{e.descricao}</span>
                <span style={{ color: "#eab308" }}>{e.dias_restantes}d</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );

  const tabAditivos = !selectedContrato ? noContrato : (
    <div>
      {aditivoResumo && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
            <div><div style={{ fontSize: 12, color: "#6b7280" }}>Valor Original</div><div style={{ fontWeight: 700 }}>{fmt(aditivoResumo.valor_original)}</div></div>
            <div><div style={{ fontSize: 12, color: "#6b7280" }}>Limite 25%</div><div style={{ fontWeight: 700 }}>{fmt(aditivoResumo.limite_25_pct)}</div></div>
            <div><div style={{ fontSize: 12, color: "#6b7280" }}>Acréscimos</div><div style={{ fontWeight: 700 }}>{fmt(aditivoResumo.total_acrescimos)}</div></div>
            <div><div style={{ fontSize: 12, color: "#6b7280" }}>% Consumido</div><div style={{ fontWeight: 700 }}>{aditivoResumo.pct_consumido}%</div></div>
          </div>
          <div style={{ width: "100%", height: 12, background: "#e5e7eb", borderRadius: 6 }}>
            <div style={{ width: `${Math.min(aditivoResumo.pct_consumido, 100)}%`, height: "100%", borderRadius: 6, background: aditivoResumo.pct_consumido < 50 ? "#16a34a" : aditivoResumo.pct_consumido < 80 ? "#eab308" : "#dc2626" }} />
          </div>
        </Card>
      )}
      <div style={{ marginTop: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Aditivos</h3>
            <ActionButton label="Novo Aditivo" onClick={() => setShowAditivoModal(true)} icon={<Plus size={16} />} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: 8, textAlign: "left" }}>Tipo</th>
              <th style={{ padding: 8, textAlign: "left" }}>Data</th>
              <th style={{ padding: 8, textAlign: "right" }}>Valor</th>
              <th style={{ padding: 8, textAlign: "left" }}>Fundamentação</th>
              <th style={{ padding: 8, textAlign: "center" }}>Status</th>
            </tr></thead>
            <tbody>{aditivos.map((a, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: 8 }}>{a.tipo}</td>
                <td style={{ padding: 8 }}>{a.data_aditivo ? new Date(a.data_aditivo).toLocaleDateString("pt-BR") : "—"}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{fmt(a.valor_aditivo)}</td>
                <td style={{ padding: 8 }}>{a.fundamentacao_legal}</td>
                <td style={{ padding: 8, textAlign: "center" }}>{statusBadge(a.status)}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </div>
  );

  const tabDesignacoes = !selectedContrato ? noContrato : (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {(["gestor", "fiscal_tecnico", "fiscal_administrativo"] as const).map(tipo => {
          const d = designacoes.find(x => x.tipo === tipo && x.ativo);
          const label = tipo === "gestor" ? "Gestor" : tipo === "fiscal_tecnico" ? "Fiscal Técnico" : "Fiscal Administrativo";
          return (
            <Card key={tipo}>
              <h4 style={{ marginBottom: 8, color: "#374151" }}>{label}</h4>
              {d ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{d.nome}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{d.cargo}</div>
                  {d.portaria_numero && <div style={{ fontSize: 12, color: "#9ca3af" }}>Portaria: {d.portaria_numero}</div>}
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                    {d.data_inicio ? new Date(d.data_inicio).toLocaleDateString("pt-BR") : "—"} a {d.data_fim ? new Date(d.data_fim).toLocaleDateString("pt-BR") : "vigente"}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Não designado</div>
              )}
            </Card>
          );
        })}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3>Todas as Designações</h3>
          <ActionButton label="Nova Designação" onClick={() => setShowDesignacaoModal(true)} icon={<Plus size={16} />} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Tipo</th>
            <th style={{ padding: 8, textAlign: "left" }}>Nome</th>
            <th style={{ padding: 8, textAlign: "left" }}>Cargo</th>
            <th style={{ padding: 8, textAlign: "left" }}>Portaria</th>
            <th style={{ padding: 8, textAlign: "center" }}>Ativo</th>
          </tr></thead>
          <tbody>{designacoes.map((d, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: 8 }}>{d.tipo}</td>
              <td style={{ padding: 8 }}>{d.nome}</td>
              <td style={{ padding: 8 }}>{d.cargo}</td>
              <td style={{ padding: 8 }}>{d.portaria_numero}</td>
              <td style={{ padding: 8, textAlign: "center" }}>{d.ativo ? "✅" : "❌"}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Execução de Contratos</h2>
      {selectedContrato && <div style={{ marginBottom: 12, padding: "8px 16px", background: "#eff6ff", borderRadius: 8, fontSize: 14 }}>Contrato selecionado: <strong>{selectedContrato.numero_contrato}</strong> — {selectedContrato.orgao}</div>}
      <TabPanel tabs={[
        { id: "contratos", label: "Contratos" },
        { id: "entregas", label: "Entregas" },
        { id: "cronograma", label: "Cronograma" },
        { id: "aditivos", label: "Aditivos" },
        { id: "designacoes", label: "Gestor/Fiscal" },
      ]}>
        {(activeTab) => {
          if (activeTab === "contratos") return tabContratos;
          if (activeTab === "entregas") return tabEntregas;
          if (activeTab === "cronograma") return tabCronograma;
          if (activeTab === "aditivos") return tabAditivos;
          return tabDesignacoes;
        }}
      </TabPanel>

      {/* Modals */}
      {showContratoModal && (
        <Modal title="Novo Contrato" onClose={() => setShowContratoModal(false)}>
          <FormField label="Número do Contrato"><TextInput value={formContrato.numero_contrato} onChange={v => setFormContrato(p => ({ ...p, numero_contrato: v }))} placeholder="CT-2026/001" /></FormField>
          <FormField label="Órgão"><TextInput value={formContrato.orgao} onChange={v => setFormContrato(p => ({ ...p, orgao: v }))} /></FormField>
          <FormField label="Objeto"><TextArea value={formContrato.objeto} onChange={v => setFormContrato(p => ({ ...p, objeto: v }))} /></FormField>
          <FormField label="Valor Total"><TextInput value={formContrato.valor_total} onChange={v => setFormContrato(p => ({ ...p, valor_total: v }))} placeholder="0.00" /></FormField>
          <FormField label="Início"><TextInput value={formContrato.data_inicio} onChange={v => setFormContrato(p => ({ ...p, data_inicio: v }))} placeholder="2026-01-01" /></FormField>
          <FormField label="Término"><TextInput value={formContrato.data_fim} onChange={v => setFormContrato(p => ({ ...p, data_fim: v }))} placeholder="2026-12-31" /></FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <ActionButton label="Cancelar" onClick={() => setShowContratoModal(false)} variant="secondary" />
            <ActionButton label="Criar" onClick={handleCreateContrato} />
          </div>
        </Modal>
      )}
      {showEntregaModal && (
        <Modal title="Nova Entrega" onClose={() => setShowEntregaModal(false)}>
          <FormField label="Descrição"><TextInput value={formEntrega.descricao} onChange={v => setFormEntrega(p => ({ ...p, descricao: v }))} /></FormField>
          <FormField label="Quantidade"><TextInput value={formEntrega.quantidade} onChange={v => setFormEntrega(p => ({ ...p, quantidade: v }))} /></FormField>
          <FormField label="Valor Unitário"><TextInput value={formEntrega.valor_unitario} onChange={v => setFormEntrega(p => ({ ...p, valor_unitario: v }))} /></FormField>
          <FormField label="Data Prevista"><TextInput value={formEntrega.data_prevista} onChange={v => setFormEntrega(p => ({ ...p, data_prevista: v }))} placeholder="2026-03-15" /></FormField>
          <FormField label="Nota Fiscal"><TextInput value={formEntrega.nota_fiscal} onChange={v => setFormEntrega(p => ({ ...p, nota_fiscal: v }))} /></FormField>
          <FormField label="Nº Empenho"><TextInput value={formEntrega.numero_empenho} onChange={v => setFormEntrega(p => ({ ...p, numero_empenho: v }))} /></FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <ActionButton label="Cancelar" onClick={() => setShowEntregaModal(false)} variant="secondary" />
            <ActionButton label="Criar" onClick={handleCreateEntrega} />
          </div>
        </Modal>
      )}
      {showAditivoModal && (
        <Modal title="Novo Aditivo" onClose={() => setShowAditivoModal(false)}>
          <FormField label="Tipo"><SelectInput value={formAditivo.tipo} onChange={v => setFormAditivo(p => ({ ...p, tipo: v }))} options={[{ value: "acrescimo", label: "Acréscimo" }, { value: "supressao", label: "Supressão" }, { value: "prazo", label: "Prazo" }, { value: "escopo", label: "Escopo" }]} /></FormField>
          <FormField label="Valor do Aditivo"><TextInput value={formAditivo.valor_aditivo} onChange={v => setFormAditivo(p => ({ ...p, valor_aditivo: v }))} placeholder="0.00" /></FormField>
          <FormField label="Justificativa"><TextArea value={formAditivo.justificativa} onChange={v => setFormAditivo(p => ({ ...p, justificativa: v }))} /></FormField>
          <FormField label="Fundamentação Legal"><SelectInput value={formAditivo.fundamentacao_legal} onChange={v => setFormAditivo(p => ({ ...p, fundamentacao_legal: v }))} options={[{ value: "", label: "Selecione..." }, { value: "Art. 124-I", label: "Art. 124-I" }, { value: "Art. 124-II", label: "Art. 124-II" }, { value: "Art. 125", label: "Art. 125" }, { value: "Art. 126", label: "Art. 126" }]} /></FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <ActionButton label="Cancelar" onClick={() => setShowAditivoModal(false)} variant="secondary" />
            <ActionButton label="Criar" onClick={handleCreateAditivo} />
          </div>
        </Modal>
      )}
      {showDesignacaoModal && (
        <Modal title="Nova Designação" onClose={() => setShowDesignacaoModal(false)}>
          <FormField label="Tipo"><SelectInput value={formDesignacao.tipo} onChange={v => setFormDesignacao(p => ({ ...p, tipo: v }))} options={[{ value: "gestor", label: "Gestor" }, { value: "fiscal_tecnico", label: "Fiscal Técnico" }, { value: "fiscal_administrativo", label: "Fiscal Administrativo" }]} /></FormField>
          <FormField label="Nome"><TextInput value={formDesignacao.nome} onChange={v => setFormDesignacao(p => ({ ...p, nome: v }))} /></FormField>
          <FormField label="Cargo"><TextInput value={formDesignacao.cargo} onChange={v => setFormDesignacao(p => ({ ...p, cargo: v }))} /></FormField>
          <FormField label="Nº Portaria"><TextInput value={formDesignacao.portaria_numero} onChange={v => setFormDesignacao(p => ({ ...p, portaria_numero: v }))} /></FormField>
          <FormField label="Data Início"><TextInput value={formDesignacao.data_inicio} onChange={v => setFormDesignacao(p => ({ ...p, data_inicio: v }))} placeholder="2026-01-01" /></FormField>
          <FormField label="Data Fim"><TextInput value={formDesignacao.data_fim} onChange={v => setFormDesignacao(p => ({ ...p, data_fim: v }))} placeholder="2026-12-31" /></FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <ActionButton label="Cancelar" onClick={() => setShowDesignacaoModal(false)} variant="secondary" />
            <ActionButton label="Criar" onClick={handleCreateDesignacao} />
          </div>
        </Modal>
      )}
    </div>
  );
}
