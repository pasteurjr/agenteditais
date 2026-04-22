import { useState, useEffect, useCallback, useRef } from "react";
import type { PageProps } from "../types";
import { Gavel, Clock, Trophy, XCircle, ExternalLink, Bot, AlertTriangle, Target, ArrowDown, Pause, Square, Zap, Play, ChevronRight } from "lucide-react";
import { Card, DataTable, ActionButton } from "../components/common";
import type { Column } from "../components/common";
import {
  criarSessaoPregao, getEstadoSala, enviarLance, enviarLanceFechado,
  sugerirLance, encerrarSessao, ativarRobo, desativarRobo, pausarRobo,
} from "../api/sprint9";

interface PregaoHoje {
  id: string;
  edital: string;
  orgao: string;
  hora: string;
  status: "aguardando" | "em_andamento" | "encerrado";
  tempoRestante?: string | null;
  url_portal?: string | null;
}

interface HistoricoLance {
  id: string;
  edital: string;
  orgao: string;
  data: string;
  nossoLance: number;
  lanceVencedor: number;
  vencedor: string;
  resultado: string;
}

interface SessaoState {
  sessao: {
    id: string;
    edital_id: string;
    modalidade: string;
    fase_atual: string;
    status: string;
    autonomia: string;
    resultado?: string | null;
    posicao_final?: number | null;
    lance_final?: number | null;
    margem_final?: number | null;
    robo_ativo: boolean;
    lances_automaticos_count: number;
    max_lances_automaticos: number;
    robo_modo_decremento?: string | null;
    robo_valor_decremento?: number | null;
    timer_aberto_seg: number;
    timer_fechado_seg: number;
  };
  lances: Array<{
    id: string;
    rodada: number;
    valor_lance: number;
    tipo: string;
    fase: string;
    margem_sobre_custo: number | null;
    status: string;
    created_at: string;
  }>;
  camadas: {
    custo_base: number;
    lance_inicial: number;
    lance_minimo: number;
    margem_minima: number;
    target_referencia: number;
  };
  estrategia: {
    perfil: string;
    cenarios: unknown[];
  };
}

interface SugestaoIA {
  lance_sugerido: number;
  margem_sobre_custo: number;
  posicao_estimada: number;
  confianca: string;
  justificativa: string;
  abaixo_custo: boolean;
  no_minimo: boolean;
}

export function LancesPage(_props?: PageProps) {
  const [pregoesHoje, setPregoesHoje] = useState<PregaoHoje[]>([]);
  const [historico, setHistorico] = useState<HistoricoLance[]>([]);
  const [loading, setLoading] = useState(true);

  // Sala virtual state
  const [salaAtiva, setSalaAtiva] = useState(false);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [estadoSala, setEstadoSala] = useState<SessaoState | null>(null);
  const [sugestao, setSugestao] = useState<SugestaoIA | null>(null);
  const [lanceInput, setLanceInput] = useState("");
  const [lanceLider, setLanceLider] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [showResultado, setShowResultado] = useState(false);
  const [showConfigRobo, setShowConfigRobo] = useState(false);
  const [roboModo, setRoboModo] = useState("fixo_reais");
  const [roboValor, setRoboValor] = useState("10");
  const [roboMax, setRoboMax] = useState("20");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLances = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("editais_ia_access_token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resHoje, resHist] = await Promise.all([
        fetch("/api/lances/hoje", { headers }),
        fetch("/api/lances/historico", { headers }),
      ]);
      if (resHoje.ok) {
        const d = await resHoje.json();
        setPregoesHoje(d.pregoes || []);
      }
      if (resHist.ok) {
        const d = await resHist.json();
        setHistorico(d.historico || []);
      }
    } catch (e) {
      console.error("Erro ao carregar lances:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLances();
  }, [fetchLances]);

  // Polling sala virtual
  useEffect(() => {
    if (salaAtiva && sessaoId) {
      const poll = async () => {
        try {
          const data = await getEstadoSala(sessaoId);
          if (!data.error) setEstadoSala(data);
          if (data.sessao?.status === "encerrada") {
            setShowResultado(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch { /* ignore */ }
      };
      poll();
      pollingRef.current = setInterval(poll, 5000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }
  }, [salaAtiva, sessaoId]);

  // Timer countdown
  useEffect(() => {
    if (salaAtiva && estadoSala) {
      const maxSeg = estadoSala.sessao.fase_atual === "fechada"
        ? estadoSala.sessao.timer_fechado_seg
        : estadoSala.sessao.timer_aberto_seg;
      setTimerSeconds(maxSeg);
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [salaAtiva, estadoSala?.sessao.fase_atual]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: PregaoHoje["status"]) => {
    switch (status) {
      case "aguardando":
        return <span className="status-badge status-badge-warning"><Clock size={12} /> Aguardando</span>;
      case "em_andamento":
        return <span className="status-badge status-badge-success pulse"><Gavel size={12} /> Em andamento</span>;
      case "encerrado":
        return <span className="status-badge status-badge-neutral">Encerrado</span>;
    }
  };

  const handleEntrarSala = async (pregao: PregaoHoje) => {
    try {
      const result = await criarSessaoPregao({ edital_id: pregao.id });
      if (result.success && result.sessao) {
        setSessaoId(result.sessao.id);
        setSalaAtiva(true);
      }
    } catch (e) {
      console.error("Erro ao criar sala:", e);
    }
  };

  const handleSairSala = () => {
    setSalaAtiva(false);
    setSessaoId(null);
    setEstadoSala(null);
    setSugestao(null);
    setShowResultado(false);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleEnviarLance = async () => {
    if (!sessaoId || !lanceInput) return;
    const valor = parseFloat(lanceInput);
    if (isNaN(valor) || valor <= 0) return;

    const isFechada = estadoSala?.sessao.fase_atual === "fechada";
    const result = isFechada
      ? await enviarLanceFechado(sessaoId, valor)
      : await enviarLance(sessaoId, valor);

    if (result.success) {
      setLanceInput("");
      const estado = await getEstadoSala(sessaoId);
      if (!estado.error) setEstadoSala(estado);
    }
  };

  const handleSugerirLance = async () => {
    if (!sessaoId) return;
    const result = await sugerirLance(sessaoId, {
      lance_lider: parseFloat(lanceLider) || 0,
      nosso_ultimo: estadoSala?.lances[0]?.valor_lance || 0,
      decremento_medio: 10,
    });
    if (result.success !== false) setSugestao(result);
  };

  const handleEncerrar = async (resultado: string) => {
    if (!sessaoId) return;
    await encerrarSessao(sessaoId, { resultado, posicao_final: resultado === "vitoria" ? 1 : undefined });
    const estado = await getEstadoSala(sessaoId);
    if (!estado.error) setEstadoSala(estado);
    setShowResultado(true);
  };

  const handleAtivarRobo = async () => {
    if (!sessaoId) return;
    const result = await ativarRobo(sessaoId, {
      modo_decremento: roboModo,
      valor_decremento: parseFloat(roboValor) || 10,
      max_lances: parseInt(roboMax) || 20,
    });
    if (result.success) {
      setShowConfigRobo(false);
      const estado = await getEstadoSala(sessaoId);
      if (!estado.error) setEstadoSala(estado);
    } else {
      alert(result.error || "Erro ao ativar robô");
    }
  };

  const handleDesativarRobo = async () => {
    if (!sessaoId) return;
    await desativarRobo(sessaoId);
    const estado = await getEstadoSala(sessaoId);
    if (!estado.error) setEstadoSala(estado);
  };

  const handlePausarRobo = async () => {
    if (!sessaoId) return;
    await pausarRobo(sessaoId);
    const estado = await getEstadoSala(sessaoId);
    if (!estado.error) setEstadoSala(estado);
  };

  // Calculate live margin
  const getLiveMargin = () => {
    const valor = parseFloat(lanceInput);
    const custo = estadoSala?.camadas?.custo_base || 0;
    if (!valor || !custo || custo <= 0) return null;
    return ((valor - custo) / custo * 100).toFixed(2);
  };

  const timerColor = timerSeconds > 60 ? "success" : timerSeconds > 30 ? "warning" : "error";
  const timerDisplay = `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, "0")}`;

  // ========================= SALA VIRTUAL =========================
  if (salaAtiva && estadoSala) {
    const cam = estadoSala.camadas;
    const s = estadoSala.sessao;
    const lances = estadoSala.lances || [];
    const nossoUltimo = lances[0]?.valor_lance || 0;
    const margemAtual = nossoUltimo && cam.custo_base > 0
      ? ((nossoUltimo - cam.custo_base) / cam.custo_base * 100).toFixed(1)
      : "—";

    return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <Gavel size={24} />
            <div>
              <h1>Sala Virtual de Disputa</h1>
              <p>
                <span className={`status-badge status-badge-${s.status === "ativa" ? "success" : s.status === "encerrada" ? "neutral" : "warning"}`}>
                  {s.status.toUpperCase()}
                </span>
                {" "}
                <span className="status-badge status-badge-info">
                  {s.modalidade === "aberto_fechado" ? "Aberto + Fechado" : "Aberto"}
                </span>
                {" "}
                <span className="status-badge status-badge-neutral">
                  Fase: {s.fase_atual}
                </span>
              </p>
            </div>
          </div>
          <ActionButton icon={<XCircle size={14} />} label="Sair da Sala" onClick={handleSairSala} variant="outline" />
        </div>

        <div className="page-content">
          {/* Cabecalho Camadas */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon warning"><Target size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(cam.custo_base)}</span>
                <span className="stat-label">Custo (A)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon info"><ArrowDown size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(cam.lance_inicial)}</span>
                <span className="stat-label">Inicial (D)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon error"><AlertTriangle size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(cam.lance_minimo)}</span>
                <span className="stat-label">Minimo (E)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><Trophy size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{margemAtual}%</span>
                <span className="stat-label">Margem Atual</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon info"><Zap size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{estadoSala.estrategia.perfil}</span>
                <span className="stat-label">Perfil</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Timer */}
            <Card title="Timer" icon={<Clock size={18} />}>
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", fontWeight: "bold" }} className={`text-${timerColor}`}>
                  {timerDisplay}
                </div>
                <p style={{ color: "var(--text-muted)" }}>
                  {s.fase_atual === "fechada" ? "Fase Fechada (5 min)" : "Fase Aberta (2 min)"}
                </p>
              </div>
            </Card>

            {/* Posicao Atual */}
            <Card title="Posicao Atual" icon={<Target size={18} />}>
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  Nosso lance: {nossoUltimo ? formatCurrency(nossoUltimo) : "—"}
                </div>
                <div style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
                  Margem: {margemAtual}% | Ate minimo: {nossoUltimo && cam.lance_minimo ? formatCurrency(nossoUltimo - cam.lance_minimo) : "—"}
                </div>
              </div>
            </Card>
          </div>

          {/* Sugestao IA */}
          <Card title="Sugestao IA" icon={<Zap size={18} />}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "0.5rem" }}>
              <input
                type="number"
                step="0.01"
                value={lanceLider}
                onChange={e => setLanceLider(e.target.value)}
                placeholder="Lance lider atual"
                className="form-input"
                style={{ width: "200px" }}
              />
              <ActionButton icon={<Zap size={14} />} label="Pedir Sugestao" onClick={handleSugerirLance} />
            </div>
            {sugestao && (
              <div style={{ padding: "0.5rem", marginTop: "0.5rem" }}>
                <div style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  background: sugestao.abaixo_custo ? "var(--error-bg, #fee)" : sugestao.no_minimo ? "var(--warning-bg, #fff3cd)" : "var(--success-bg, #d4edda)",
                  border: `1px solid ${sugestao.abaixo_custo ? "var(--error)" : sugestao.no_minimo ? "var(--warning)" : "var(--success)"}`,
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    {formatCurrency(sugestao.lance_sugerido)}
                  </div>
                  <div>Margem: {sugestao.margem_sobre_custo}% | Posicao: {sugestao.posicao_estimada}o | Confianca: {sugestao.confianca}</div>
                  <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>{sugestao.justificativa}</div>
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                    <ActionButton
                      icon={<ChevronRight size={14} />}
                      label="Aceitar"
                      onClick={() => setLanceInput(String(sugestao.lance_sugerido))}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Envio de Lance */}
          {s.status !== "encerrada" && (
            <Card title={s.fase_atual === "fechada" ? "Lance Fechado" : "Enviar Lance"} icon={<Gavel size={18} />}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "0.5rem" }}>
                <input
                  type="number"
                  step="0.01"
                  value={lanceInput}
                  onChange={e => setLanceInput(e.target.value)}
                  placeholder="Valor do lance"
                  className="form-input"
                  style={{ width: "200px" }}
                />
                {getLiveMargin() !== null && (
                  <span className={`status-badge ${parseFloat(getLiveMargin()!) < 0 ? "status-badge-error" : "status-badge-success"}`}>
                    Margem: {getLiveMargin()}%
                  </span>
                )}
                <ActionButton
                  icon={<Gavel size={14} />}
                  label="Enviar"
                  onClick={handleEnviarLance}
                  disabled={!lanceInput}
                />
              </div>
              {lanceInput && parseFloat(lanceInput) < cam.custo_base && (
                <div style={{ padding: "0.5rem", color: "var(--error)", fontWeight: "bold" }}>
                  <AlertTriangle size={14} style={{ verticalAlign: "middle" }} /> LANCE ABAIXO DO CUSTO — PREJUIZO! (RN-100)
                </div>
              )}
              {lanceInput && parseFloat(lanceInput) < cam.lance_minimo && parseFloat(lanceInput) >= cam.custo_base && (
                <div style={{ padding: "0.5rem", color: "var(--warning)", fontWeight: "bold" }}>
                  <AlertTriangle size={14} style={{ verticalAlign: "middle" }} /> Lance abaixo do minimo (Camada E)
                </div>
              )}
            </Card>
          )}

          {/* Historico Lances */}
          <Card title="Historico de Lances na Sessao" icon={<Clock size={18} />}>
            <DataTable
              data={lances.map(l => ({
                ...l,
                valor_display: formatCurrency(l.valor_lance),
                margem_display: l.margem_sobre_custo != null ? `${l.margem_sobre_custo}%` : "—",
              }))}
              columns={[
                { key: "rodada", header: "Rodada", width: "60px" },
                { key: "valor_display", header: "Valor" },
                { key: "tipo", header: "Tipo", render: (l: any) => <span className="status-badge status-badge-info">{l.tipo}</span> },
                { key: "fase", header: "Fase" },
                { key: "margem_display", header: "Margem" },
                { key: "status", header: "Status", render: (l: any) => <span className={`status-badge status-badge-${l.status === "enviado" ? "success" : "neutral"}`}>{l.status}</span> },
              ]}
              idKey="id"
              emptyMessage="Nenhum lance registrado"
            />
          </Card>

          {/* Robo de Lances */}
          <Card title="Robo de Lances" icon={<Bot size={18} />}>
            <div style={{ padding: "0.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <span className={`status-badge ${s.robo_ativo ? "status-badge-success pulse" : "status-badge-neutral"}`}>
                  {s.robo_ativo ? "ATIVO" : "INATIVO"}
                </span>
                {s.robo_ativo && (
                  <span className="status-badge status-badge-info">
                    Lances: {s.lances_automaticos_count}/{s.max_lances_automaticos}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {!s.robo_ativo ? (
                  <ActionButton icon={<Play size={14} />} label="Configurar Robo" onClick={() => setShowConfigRobo(true)} />
                ) : (
                  <>
                    <ActionButton icon={<Pause size={14} />} label="Pausar" onClick={handlePausarRobo} variant="outline" />
                    <ActionButton icon={<Square size={14} />} label="Parar" onClick={handleDesativarRobo} variant="outline" />
                  </>
                )}
              </div>

              {showConfigRobo && (
                <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <h4>Configuracao do Robo</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <div>
                      <label>Custo (A)</label>
                      <input className="form-input" value={formatCurrency(cam.custo_base)} disabled />
                    </div>
                    <div>
                      <label>Inicial (D)</label>
                      <input className="form-input" value={formatCurrency(cam.lance_inicial)} disabled />
                    </div>
                    <div>
                      <label>Minimo (E)</label>
                      <input className="form-input" value={formatCurrency(cam.lance_minimo)} disabled />
                    </div>
                    <div>
                      <label>Margem Minima</label>
                      <input className="form-input" value={`${cam.margem_minima}%`} disabled />
                    </div>
                    <div>
                      <label>Perfil</label>
                      <input className="form-input" value={estadoSala.estrategia.perfil} disabled />
                    </div>
                    <div>
                      <label>Modo Decremento</label>
                      <select className="form-input" value={roboModo} onChange={e => setRoboModo(e.target.value)}>
                        <option value="fixo_reais">Fixo (R$)</option>
                        <option value="percentual_ultimo">Percentual do ultimo</option>
                      </select>
                    </div>
                    <div>
                      <label>Valor Decremento</label>
                      <input className="form-input" type="number" value={roboValor} onChange={e => setRoboValor(e.target.value)} />
                    </div>
                    <div>
                      <label>Max Lances</label>
                      <input className="form-input" type="number" value={roboMax} onChange={e => setRoboMax(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                    <ActionButton icon={<Bot size={14} />} label="Ativar Robo" onClick={handleAtivarRobo} />
                    <ActionButton icon={<XCircle size={14} />} label="Cancelar" onClick={() => setShowConfigRobo(false)} variant="outline" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Encerrar Sessao */}
          {s.status !== "encerrada" && (
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", padding: "1rem" }}>
              <ActionButton icon={<Trophy size={14} />} label="Vitoria" onClick={() => handleEncerrar("vitoria")} />
              <ActionButton icon={<XCircle size={14} />} label="Derrota" onClick={() => handleEncerrar("derrota")} variant="outline" />
            </div>
          )}

          {/* Modal Resultado */}
          {showResultado && s.status === "encerrada" && (
            <Card title="Resultado da Sessao" icon={s.resultado === "vitoria" ? <Trophy size={18} /> : <XCircle size={18} />}>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: s.resultado === "vitoria" ? "var(--success)" : "var(--error)" }}>
                  {s.resultado === "vitoria" ? "VITORIA!" : "DERROTA"}
                </div>
                {s.lance_final && <div>Lance Final: {formatCurrency(s.lance_final)}</div>}
                {s.margem_final != null && <div>Margem Final: {s.margem_final}%</div>}
                {s.posicao_final && <div>Posicao: {s.posicao_final}o</div>}
                <div style={{ marginTop: "1rem" }}>
                  <ActionButton icon={<XCircle size={14} />} label="Fechar" onClick={handleSairSala} />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ========================= LISTAGEM PADRAO =========================
  const pregoesColumns: Column<PregaoHoje>[] = [
    {
      key: "status_icon",
      header: "",
      width: "40px",
      render: (p) => {
        if (p.status === "em_andamento") return <span className="status-dot pulse green" />;
        if (p.status === "aguardando") return <span className="status-dot yellow" />;
        return <span className="status-dot gray" />;
      },
    },
    { key: "edital", header: "Edital" },
    { key: "orgao", header: "Orgao" },
    { key: "hora", header: "Hora" },
    { key: "status", header: "Status", render: (p) => getStatusBadge(p.status) },
    {
      key: "tempo",
      header: "",
      render: (p) => p.tempoRestante ? <span className="tempo-restante">em {p.tempoRestante}</span> : null,
    },
    {
      key: "acoes",
      header: "",
      width: "120px",
      render: (p) => (
        <ActionButton
          icon={p.status === "em_andamento" ? <Gavel size={14} /> : <ExternalLink size={14} />}
          label={p.status === "em_andamento" ? "Entrar na Sala" : "Abrir Portal"}
          onClick={() => p.status === "em_andamento" ? handleEntrarSala(p) : window.open(p.url_portal || "https://comprasnet.gov.br", "_blank")}
          disabled={p.status === "encerrado"}
        />
      ),
    },
  ];

  const historicoColumns: Column<HistoricoLance>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "data", header: "Data", sortable: true },
    { key: "nossoLance", header: "Nosso Lance", render: (h) => h.nossoLance > 0 ? formatCurrency(h.nossoLance) : "—" },
    { key: "lanceVencedor", header: "Lance Vencedor", render: (h) => h.lanceVencedor > 0 ? formatCurrency(h.lanceVencedor) : "—" },
    { key: "vencedor", header: "Vencedor" },
    {
      key: "resultado",
      header: "Resultado",
      render: (h) => (
        <span className={`status-badge ${h.resultado === "vitoria" ? "status-badge-success" : "status-badge-error"}`}>
          {h.resultado === "vitoria" ? <><Trophy size={12} /> Vitoria</> : <><XCircle size={12} /> Derrota</>}
        </span>
      ),
    },
  ];

  const vitorias = historico.filter(h => h.resultado === "vitoria").length;
  const derrotas = historico.filter(h => h.resultado === "derrota").length;
  const taxaSucesso = historico.length > 0 ? Math.round((vitorias / historico.length) * 100) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Gavel size={24} />
          <div>
            <h1>Acompanhamento de Lances</h1>
            <p>Pregoes em andamento e historico</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Pregoes Hoje" icon={<Clock size={18} />}>
          <DataTable
            data={pregoesHoje}
            columns={pregoesColumns}
            idKey="id"
            loading={loading}
            emptyMessage="Nenhum pregao agendado para hoje"
          />
        </Card>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon success"><Trophy size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{vitorias}</span>
              <span className="stat-label">Vitorias</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon error"><XCircle size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{derrotas}</span>
              <span className="stat-label">Derrotas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><Gavel size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{taxaSucesso}%</span>
              <span className="stat-label">Taxa de Sucesso</span>
            </div>
          </div>
        </div>

        <Card title="Historico de Lances" icon={<Gavel size={18} />}>
          <DataTable
            data={historico}
            columns={historicoColumns}
            idKey="id"
            loading={loading}
            emptyMessage="Nenhum historico de lances"
          />
        </Card>
      </div>
    </div>
  );
}
