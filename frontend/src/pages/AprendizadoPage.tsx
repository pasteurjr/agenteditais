import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import {
  Brain, MessageSquare, Lightbulb, Activity,
  Check, X, RefreshCw, Plus, Eye, Clock,
  TrendingUp, Target, BarChart2, Filter,
} from "lucide-react";
import { Card, FormField, SelectInput, Modal, DataTable } from "../components/common";
import type { Column } from "../components/common";
import { crudCreate } from "../api/crud";
import {
  fetchAprendizadoFeedbacks, fetchAprendizadoSugestoes,
  fetchAprendizadoPadroes, aceitarSugestao, rejeitarSugestao,
  forcarAnalisePadroes,
} from "../api/sprint7";

const TIPOS_FEEDBACK = [
  { value: "", label: "Todos" },
  { value: "resultado_edital", label: "Resultado Edital" },
  { value: "score_ajustado", label: "Score Ajustado" },
  { value: "preco_ajustado", label: "Preco Ajustado" },
  { value: "feedback_usuario", label: "Feedback Usuario" },
];

const TIPO_PADRAO_ICONS: Record<string, typeof Activity> = {
  sazonalidade: Clock,
  correlacao: TrendingUp,
  tendencia_preco: BarChart2,
  comportamento_orgao: Target,
  gargalo_pipeline: Filter,
};

export function AprendizadoPage(_props?: PageProps) {
  const [tab, setTab] = useState<"feedbacks" | "sugestoes" | "padroes">("feedbacks");
  const [loading, setLoading] = useState(true);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>({});
  const [fbTipo, setFbTipo] = useState("");
  const [fbPeriodo, setFbPeriodo] = useState("180");
  const [showFbModal, setShowFbModal] = useState(false);
  const [showFbDetalhe, setShowFbDetalhe] = useState<any>(null);
  const [fbForm, setFbForm] = useState({ tipo_evento: "feedback_usuario", entidade_tipo: "geral", descricao: "", resultado_observado: "" });

  // Sugestoes state
  const [sugestoes, setSugestoes] = useState<any>({});
  const [showRejeitar, setShowRejeitar] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  // Padroes state
  const [padroes, setPadroes] = useState<any>({});
  const [showBaixaConf, setShowBaixaConf] = useState(false);
  const [analisando, setAnalisando] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "feedbacks") {
        const data = await fetchAprendizadoFeedbacks({
          tipo: fbTipo || undefined,
          periodo_dias: parseInt(fbPeriodo),
        });
        setFeedbacks(data.feedbacks || []);
        setFeedbackStats(data.stat_cards || {});
      } else if (tab === "sugestoes") {
        const data = await fetchAprendizadoSugestoes();
        setSugestoes(data);
      } else if (tab === "padroes") {
        const data = await fetchAprendizadoPadroes();
        setPadroes(data);
      }
    } catch (e) {
      console.error("Erro aprendizado:", e);
    }
    setLoading(false);
  }, [tab, fbTipo, fbPeriodo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegistrarFeedback = async () => {
    try {
      await crudCreate("aprendizado-feedback", {
        tipo_evento: fbForm.tipo_evento,
        entidade_tipo: fbForm.entidade_tipo,
        descricao: fbForm.descricao,
        resultado_observado: fbForm.resultado_observado,
        aplicado: false,
      });
      setShowFbModal(false);
      setFbForm({ tipo_evento: "feedback_usuario", entidade_tipo: "geral", descricao: "", resultado_observado: "" });
      fetchData();
    } catch (e) {
      console.error("Erro ao registrar feedback:", e);
    }
  };

  const handleAceitar = async (id: string) => {
    try {
      await aceitarSugestao(id);
      fetchData();
    } catch (e) {
      console.error("Erro ao aceitar:", e);
    }
  };

  const handleRejeitar = async () => {
    if (!showRejeitar || motivoRejeicao.length < 10) return;
    try {
      await rejeitarSugestao(showRejeitar, motivoRejeicao);
      setShowRejeitar(null);
      setMotivoRejeicao("");
      fetchData();
    } catch (e) {
      console.error("Erro ao rejeitar:", e);
    }
  };

  const handleForcarAnalise = async () => {
    setAnalisando(true);
    try {
      await forcarAnalisePadroes();
      fetchData();
    } catch (e) {
      console.error("Erro ao analisar:", e);
    }
    setAnalisando(false);
  };

  const confBadge = (conf: number) => {
    const bg = conf >= 70 ? "#dcfce7" : conf >= 50 ? "#fef9c3" : "#fee2e2";
    const color = conf >= 70 ? "#16a34a" : conf >= 50 ? "#ca8a04" : "#dc2626";
    return (
      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: bg, color }}>
        {conf}%
      </span>
    );
  };

  const feedbackColumns: Column<any>[] = [
    { key: "created_at", header: "Data", sortable: true, render: (f) => f.created_at ? new Date(f.created_at).toLocaleDateString("pt-BR") : "—" },
    { key: "tipo_evento", header: "Tipo", render: (f) => (
      <span className="status-badge status-badge-info">{f.tipo_evento}</span>
    )},
    { key: "entidade_tipo", header: "Entidade" },
    { key: "descricao", header: "Resumo", render: (f) => (f.descricao || "").substring(0, 80) },
    { key: "valor_delta", header: "Delta", render: (f) => f.valor_delta || "—" },
    { key: "aplicado", header: "Aplicado", render: (f) => (
      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
        background: f.aplicado ? "#dcfce7" : "#f3f4f6", color: f.aplicado ? "#16a34a" : "#9ca3af" }}>
        {f.aplicado ? "Sim" : "Nao"}
      </span>
    )},
    { key: "acao", header: "", width: "40px", render: (f) => (
      <button title="Ver detalhe" onClick={() => setShowFbDetalhe(f)}><Eye size={14} /></button>
    )},
  ];

  // ═══ Tab Feedbacks ═══
  const tabFeedbacks = () => (
    <>
      <div className="stats-row">
        {[
          { label: "Total Feedbacks", value: feedbackStats.total ?? 0, icon: <MessageSquare size={24} />, color: "info" },
          { label: "Aplicados", value: feedbackStats.aplicados ?? 0, icon: <Check size={24} />, color: "success" },
          { label: "Pendentes", value: feedbackStats.pendentes ?? 0, icon: <Clock size={24} />, color: "warning" },
          { label: "Taxa Adocao", value: `${feedbackStats.taxa_adocao ?? 0}%`, icon: <TrendingUp size={24} />, color: "info" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <FormField label="Tipo">
          <SelectInput value={fbTipo} onChange={setFbTipo} options={TIPOS_FEEDBACK} />
        </FormField>
        <FormField label="Periodo">
          <SelectInput value={fbPeriodo} onChange={setFbPeriodo} options={[
            { value: "90", label: "3 meses" }, { value: "180", label: "6 meses" }, { value: "365", label: "12 meses" },
          ]} />
        </FormField>
        <button
          className="btn btn-primary"
          onClick={() => setShowFbModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={14} /> Registrar Feedback Manual
        </button>
      </div>

      <Card title="Feedbacks Registrados" icon={<MessageSquare size={18} />}>
        <DataTable
          data={feedbacks}
          columns={feedbackColumns}
          idKey="id"
          loading={loading}
          emptyMessage="Nenhum feedback no periodo"
        />
      </Card>
    </>
  );

  // ═══ Tab Sugestoes ═══
  const tabSugestoes = () => {
    const stats = sugestoes.stat_cards || {};
    const ativas = sugestoes.ativas || [];
    const historico = sugestoes.historico || [];

    return (
      <>
        <div className="stats-row">
          {[
            { label: "Pendentes", value: stats.pendentes ?? 0, icon: <Clock size={24} />, color: "warning" },
            { label: "Aceitas", value: stats.aceitas ?? 0, icon: <Check size={24} />, color: "success" },
            { label: "Rejeitadas", value: stats.rejeitadas ?? 0, icon: <X size={24} />, color: "error" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <Card title="Sugestoes Ativas" icon={<Lightbulb size={18} />}>
          {ativas.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ativas.map((s: any) => (
                <div key={s.id} style={{
                  padding: 16, borderRadius: 8, border: "1px solid #e5e7eb",
                  background: "#fffbeb",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 15 }}>{s.titulo}</strong>
                        {confBadge(s.confianca || 0)}
                        <span className="status-badge status-badge-info" style={{ fontSize: 10 }}>{s.tipo}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#4b5563" }}>{s.descricao}</p>
                      {s.acao_sugerida && (
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
                          Acao: {s.acao_sugerida}
                        </p>
                      )}
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Base: {s.base_dados_count || 0} feedbacks</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                        onClick={() => handleAceitar(s.id)}
                      >
                        <Check size={12} /> Aceitar
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                        onClick={() => setShowRejeitar(s.id)}
                      >
                        <X size={12} /> Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              Nenhuma sugestao ativa pendente
            </div>
          )}
        </Card>

        {historico.length > 0 && (
          <Card title="Historico de Decisoes" icon={<BarChart2 size={18} />}>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Data</th><th>Sugestao</th><th>Decisao</th><th>Motivo</th></tr></thead>
                <tbody>
                  {historico.map((h: any, i: number) => (
                    <tr key={i}>
                      <td>{h.created_at ? new Date(h.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                      <td>{h.titulo}</td>
                      <td>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: h.status === "aceita" ? "#dcfce7" : "#fee2e2",
                          color: h.status === "aceita" ? "#16a34a" : "#dc2626",
                        }}>
                          {h.status === "aceita" ? "Aceita" : "Rejeitada"}
                        </span>
                      </td>
                      <td>{h.rejeitado_motivo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </>
    );
  };

  // ═══ Tab Padroes ═══
  const tabPadroes = () => {
    const stats = padroes.stat_cards || {};
    const lista = (padroes.padroes || []).filter(
      (p: any) => showBaixaConf || (p.confianca || 0) >= 50
    );

    return (
      <>
        <div className="stats-row">
          {[
            { label: "Padroes Detectados", value: stats.total ?? 0, icon: <Activity size={24} />, color: "info" },
            { label: "Alta Confianca (>=70%)", value: stats.alta_confianca ?? 0, icon: <Target size={24} />, color: "success" },
            { label: "Ultima Analise", value: stats.ultima_analise ? new Date(stats.ultima_analise).toLocaleDateString("pt-BR") : "—", icon: <Clock size={24} />, color: "warning" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={showBaixaConf} onChange={(e) => setShowBaixaConf(e.target.checked)} />
            Mostrar padroes com confianca &lt; 50%
          </label>
          <button
            className="btn btn-primary"
            onClick={handleForcarAnalise}
            disabled={analisando}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} className={analisando ? "animate-spin" : ""} />
            {analisando ? "Analisando..." : "Forcar Nova Analise"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {lista.map((p: any, i: number) => {
            const IconComp = TIPO_PADRAO_ICONS[p.tipo] || Activity;
            return (
              <Card key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    background: "#eff6ff", borderRadius: 8, padding: 10,
                    color: "#2563eb", flexShrink: 0,
                  }}>
                    <IconComp size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: 14 }}>{p.titulo}</strong>
                      {confBadge(p.confianca || 0)}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#4b5563" }}>{p.descricao}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "#9ca3af" }}>
                      <span style={{
                        padding: "1px 6px", borderRadius: 4, fontSize: 10,
                        background: "#f3f4f6", color: "#6b7280",
                      }}>
                        {p.tipo}
                      </span>
                      <span>Base: {p.base_dados_count || 0} registros</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {lista.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
            Nenhum padrao detectado{!showBaixaConf ? " com confianca >= 50%" : ""}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Brain size={24} />
          <div>
            <h1>Pipeline de Aprendizado</h1>
            <p>Feedbacks, sugestoes IA e padroes detectados</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 16 }}>
          {[
            { key: "feedbacks" as const, label: "Feedbacks", icon: <MessageSquare size={16} /> },
            { key: "sugestoes" as const, label: "Sugestoes", icon: <Lightbulb size={16} /> },
            { key: "padroes" as const, label: "Padroes", icon: <Activity size={16} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                border: "none", borderBottom: tab === t.key ? "2px solid #2563eb" : "2px solid transparent",
                background: "none", cursor: "pointer", fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? "#2563eb" : "#6b7280", marginBottom: -2,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "feedbacks" && tabFeedbacks()}
        {tab === "sugestoes" && tabSugestoes()}
        {tab === "padroes" && tabPadroes()}

        {/* Modal Registrar Feedback */}
        {showFbModal && (
          <Modal title="Registrar Feedback Manual" onClose={() => setShowFbModal(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Tipo">
                <SelectInput
                  value={fbForm.tipo_evento}
                  onChange={(v: string) => setFbForm({ ...fbForm, tipo_evento: v })}
                  options={[
                    { value: "feedback_usuario", label: "Feedback Usuario" },
                    { value: "resultado_edital", label: "Resultado Edital" },
                    { value: "score_ajustado", label: "Score Ajustado" },
                    { value: "preco_ajustado", label: "Preco Ajustado" },
                  ]}
                />
              </FormField>
              <FormField label="Entidade">
                <input
                  type="text"
                  value={fbForm.entidade_tipo}
                  onChange={(e) => setFbForm({ ...fbForm, entidade_tipo: e.target.value })}
                  className="form-input"
                  placeholder="ex: edital, produto, geral"
                />
              </FormField>
              <FormField label="Descricao">
                <textarea
                  value={fbForm.descricao}
                  onChange={(e) => setFbForm({ ...fbForm, descricao: e.target.value })}
                  className="form-input"
                  rows={3}
                  placeholder="Descreva o feedback..."
                />
              </FormField>
              <FormField label="Resultado Observado">
                <textarea
                  value={fbForm.resultado_observado}
                  onChange={(e) => setFbForm({ ...fbForm, resultado_observado: e.target.value })}
                  className="form-input"
                  rows={2}
                  placeholder="Resultado observado (opcional)"
                />
              </FormField>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowFbModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleRegistrarFeedback} disabled={!fbForm.descricao}>
                  Registrar
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal Detalhe Feedback */}
        {showFbDetalhe && (
          <Modal title="Detalhe do Feedback" onClose={() => setShowFbDetalhe(null)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div><strong>Tipo:</strong> {showFbDetalhe.tipo_evento}</div>
              <div><strong>Entidade:</strong> {showFbDetalhe.entidade_tipo}</div>
              <div><strong>Data:</strong> {showFbDetalhe.created_at ? new Date(showFbDetalhe.created_at).toLocaleString("pt-BR") : "—"}</div>
              <div><strong>Descricao:</strong> {showFbDetalhe.descricao}</div>
              <div><strong>Valor Anterior:</strong> <code>{showFbDetalhe.valor_anterior || "—"}</code></div>
              <div><strong>Valor Novo:</strong> <code>{showFbDetalhe.valor_novo || "—"}</code></div>
              <div><strong>Delta:</strong> <code>{showFbDetalhe.valor_delta || "—"}</code></div>
              <div><strong>Aplicado:</strong> {showFbDetalhe.aplicado ? "Sim" : "Nao"}</div>
              <div><strong>Resultado:</strong> {showFbDetalhe.resultado_observado || "—"}</div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setShowFbDetalhe(null)}>Fechar</button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal Rejeitar Sugestao */}
        {showRejeitar && (
          <Modal title="Rejeitar Sugestao" onClose={() => setShowRejeitar(null)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Motivo da rejeicao (minimo 10 caracteres)">
                <textarea
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Explique por que esta sugestao nao se aplica..."
                />
              </FormField>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowRejeitar(null)}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  onClick={handleRejeitar}
                  disabled={motivoRejeicao.length < 10}
                  style={{ background: "#dc2626" }}
                >
                  Rejeitar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
