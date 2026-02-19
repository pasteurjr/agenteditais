import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, Clock, FileText, TrendingUp, CheckCircle,
  DollarSign, Target, Calendar, ArrowRight, Lightbulb, Search, Sparkles, Brain, Loader2, AlertCircle, RefreshCw
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenChat: () => void;
}

interface EditalUrgente {
  id: string | number;
  numero: string;
  orgao: string;
  prazo: string;
  valor: string;
}

interface FunilData {
  captacao: number;
  validacao: number;
  precificacao: number;
  proposta: number;
  submissao: number;
  ganhos: number;
}

interface KpisData {
  emAnalise: number;
  propostas: number;
  ganhos: number;
  taxaSucesso: string;
  valorTotal: string;
}

interface StatusBarData {
  novos: number;
  emAnalise: number;
  validados: number;
  propostasEnviadas: number;
  lanceHoje: number;
}

interface DashboardStats {
  urgentes: EditalUrgente[];
  funil: FunilData;
  kpis: KpisData;
  statusBar: StatusBarData;
  insights: string[];
  eventos: Array<{ dia: string; mes: string; titulo: string; subtitulo: string }>;
  aprendizados: string[];
}

const STATS_DEFAULTS: DashboardStats = {
  urgentes: [],
  funil: { captacao: 0, validacao: 0, precificacao: 0, proposta: 0, submissao: 0, ganhos: 0 },
  kpis: { emAnalise: 0, propostas: 0, ganhos: 0, taxaSucesso: "0%", valorTotal: "R$ 0" },
  statusBar: { novos: 0, emAnalise: 0, validados: 0, propostasEnviadas: 0, lanceHoje: 0 },
  insights: [],
  eventos: [],
  aprendizados: [],
};

// Token getter - set by the same mechanism as crud.ts
let getDashboardTokenFn: (() => Promise<string | null>) | null = null;

export function setDashboardTokenGetter(fn: () => Promise<string | null>) {
  getDashboardTokenFn = fn;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (getDashboardTokenFn) {
    const token = await getDashboardTokenFn();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/dashboard/stats", { headers });
  if (res.status === 401) throw new Error("Nao autenticado");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).error || "Erro ao buscar estatisticas");
  }

  const raw = await res.json();
  const eps = raw.editais_por_status || {};
  const pps = raw.propostas_por_status || {};
  const ganhos = (eps.ganho || 0) + (eps.vencedor || 0);

  // Transformar resposta do backend para formato do Dashboard
  const stats: DashboardStats = {
    urgentes: (raw.proximos_prazos || []).map((p: { edital: string; prazo: string; dias_restantes: number }) => ({
      id: p.edital,
      numero: p.edital || "—",
      orgao: "",
      prazo: p.dias_restantes != null ? `${p.dias_restantes} dias` : (p.prazo || "—"),
      valor: "",
    })),
    funil: {
      captacao: eps.novo || 0,
      validacao: eps.analisando || 0,
      precificacao: eps.precificando || 0,
      proposta: (pps.rascunho || 0) + (pps.revisao || 0) + (pps.aprovada || 0),
      submissao: pps.enviada || 0,
      ganhos: ganhos,
    },
    kpis: {
      emAnalise: eps.analisando || 0,
      propostas: raw.total_propostas || 0,
      ganhos: ganhos,
      taxaSucesso: `${Math.round((raw.taxa_sucesso || 0) * 100)}%`,
      valorTotal: `R$ ${((raw.valor_total_contratado || 0) / 1000).toFixed(0)}k`,
    },
    statusBar: {
      novos: eps.novo || 0,
      emAnalise: eps.analisando || 0,
      validados: eps.participando || 0,
      propostasEnviadas: pps.enviada || 0,
      lanceHoje: 0,
    },
    insights: [],
    eventos: (raw.proximos_prazos || []).slice(0, 5).map((p: { edital: string; prazo: string }) => {
      const d = p.prazo ? new Date(p.prazo + "T00:00:00") : null;
      return {
        dia: d ? String(d.getDate()) : "—",
        mes: d ? d.toLocaleString("pt-BR", { month: "short" }).toUpperCase() : "",
        titulo: p.edital || "Edital",
        subtitulo: "Prazo de abertura",
      };
    }),
    aprendizados: [],
  };

  return stats;
}

export function Dashboard({ onNavigate, onOpenChat }: DashboardProps) {
  const [buscaRapida, setBuscaRapida] = useState("");
  const [stats, setStats] = useState<DashboardStats>(STATS_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatisticas");
      // Keep defaults on error so UI still renders
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const maxFunil = Math.max(stats.funil?.captacao ?? 0, 1);

  return (
    <div className="dashboard">
      {/* Header com busca rapida */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Visao geral das suas licitacoes</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="dashboard-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar editais, produtos, propostas..."
              value={buscaRapida}
              onChange={(e) => setBuscaRapida(e.target.value)}
            />
          </div>
          <button className="dashboard-btn secondary" onClick={loadStats} disabled={loading} title="Atualizar">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
          <button className="dashboard-btn primary" onClick={onOpenChat}>
            <Lightbulb size={18} />
            Perguntar ao Dr. Licita
          </button>
        </div>
      </div>

      {error && (
        <div className="portfolio-error" style={{ marginBottom: "16px" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={loadStats}>Tentar novamente</button>
        </div>
      )}

      {/* Barra de badges de status */}
      <div className="dashboard-status-bar">
        <button className="status-badge-btn" onClick={() => onNavigate('captacao')}>
          <span className="status-badge-count">
            {loading ? <Loader2 size={14} className="spin" /> : stats.statusBar.novos}
          </span>
          <span className="status-badge-label">Novos</span>
        </button>
        <button className="status-badge-btn" onClick={() => onNavigate('validacao')}>
          <span className="status-badge-count">
            {loading ? <Loader2 size={14} className="spin" /> : stats.statusBar.emAnalise}
          </span>
          <span className="status-badge-label">Em Analise</span>
        </button>
        <button className="status-badge-btn validados" onClick={() => onNavigate('precificacao')}>
          <span className="status-badge-count">
            {loading ? <Loader2 size={14} className="spin" /> : stats.statusBar.validados}
          </span>
          <span className="status-badge-label">Validados</span>
        </button>
        <button className="status-badge-btn enviados" onClick={() => onNavigate('proposta')}>
          <span className="status-badge-count">
            {loading ? <Loader2 size={14} className="spin" /> : stats.statusBar.propostasEnviadas}
          </span>
          <span className="status-badge-label">Propostas Enviadas</span>
        </button>
        <button className="status-badge-btn lances" onClick={() => onNavigate('lances')}>
          <span className="status-badge-count">
            {loading ? <Loader2 size={14} className="spin" /> : stats.statusBar.lanceHoje}
          </span>
          <span className="status-badge-label">Lance Hoje</span>
        </button>
      </div>

      {/* Grid principal */}
      <div className="dashboard-grid">
        {/* Painel de Atenção - Editais Urgentes */}
        <div className="dashboard-card attention">
          <div className="dashboard-card-header">
            <AlertTriangle size={20} className="icon-warning" />
            <h2>Editais Urgentes</h2>
            {!loading && <span className="badge warning">{stats.urgentes.length}</span>}
          </div>
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /><span>Carregando...</span></div>
            ) : stats.urgentes.length === 0 ? (
              <div className="empty-state-small">Nenhum edital urgente no momento</div>
            ) : (
              stats.urgentes.map(edital => (
                <div key={edital.id} className="attention-item">
                  <div className="attention-item-info">
                    <span className="attention-item-numero">{edital.numero}</span>
                    <span className="attention-item-orgao">{edital.orgao}</span>
                  </div>
                  <div className="attention-item-meta">
                    <span className="attention-item-prazo">
                      <Clock size={14} /> {edital.prazo}
                    </span>
                    <span className="attention-item-valor">{edital.valor}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="dashboard-card-action" onClick={() => onNavigate('validacao')}>
            Ver todos <ArrowRight size={16} />
          </button>
        </div>

        {/* Funil de Editais */}
        <div className="dashboard-card funnel">
          <div className="dashboard-card-header">
            <Target size={20} />
            <h2>Funil de Editais</h2>
          </div>
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /><span>Carregando...</span></div>
            ) : (
              <div className="funnel-chart">
                <div className="funnel-step" style={{ width: '100%' }}>
                  <div className="funnel-bar captacao" style={{ width: `${(stats.funil.captacao / maxFunil) * 100}%` }}>
                    <span className="funnel-label">Captacao</span>
                    <span className="funnel-value">{stats.funil.captacao}</span>
                  </div>
                </div>
                <div className="funnel-step" style={{ width: '85%' }}>
                  <div className="funnel-bar validacao" style={{ width: `${(stats.funil.validacao / maxFunil) * 100}%` }}>
                    <span className="funnel-label">Validacao</span>
                    <span className="funnel-value">{stats.funil.validacao}</span>
                  </div>
                </div>
                <div className="funnel-step" style={{ width: '70%' }}>
                  <div className="funnel-bar precificacao" style={{ width: `${(stats.funil.precificacao / maxFunil) * 100}%` }}>
                    <span className="funnel-label">Precificacao</span>
                    <span className="funnel-value">{stats.funil.precificacao}</span>
                  </div>
                </div>
                <div className="funnel-step" style={{ width: '55%' }}>
                  <div className="funnel-bar proposta" style={{ width: `${(stats.funil.proposta / maxFunil) * 100}%` }}>
                    <span className="funnel-label">Proposta</span>
                    <span className="funnel-value">{stats.funil.proposta}</span>
                  </div>
                </div>
                <div className="funnel-step" style={{ width: '40%' }}>
                  <div className="funnel-bar submissao" style={{ width: `${(stats.funil.submissao / maxFunil) * 100}%` }}>
                    <span className="funnel-label">Submissao</span>
                    <span className="funnel-value">{stats.funil.submissao}</span>
                  </div>
                </div>
                <div className="funnel-step" style={{ width: '25%' }}>
                  <div className="funnel-bar ganhos" style={{ width: `${(stats.funil.ganhos / maxFunil) * 100}%` }}>
                    <span className="funnel-label">Ganhos</span>
                    <span className="funnel-value">{stats.funil.ganhos}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPIs Row */}
        <div className="dashboard-kpis">
          <div className="kpi-card">
            <div className="kpi-icon blue">
              <FileText size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{loading ? <Loader2 size={16} className="spin" /> : stats.kpis.emAnalise}</span>
              <span className="kpi-label">Em Analise</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon purple">
              <Clock size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{loading ? <Loader2 size={16} className="spin" /> : stats.kpis.propostas}</span>
              <span className="kpi-label">Propostas</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon green">
              <CheckCircle size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{loading ? <Loader2 size={16} className="spin" /> : stats.kpis.ganhos}</span>
              <span className="kpi-label">Ganhos</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon orange">
              <TrendingUp size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{loading ? <Loader2 size={16} className="spin" /> : stats.kpis.taxaSucesso}</span>
              <span className="kpi-label">Taxa de Sucesso</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon gold">
              <DollarSign size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{loading ? <Loader2 size={16} className="spin" /> : stats.kpis.valorTotal}</span>
              <span className="kpi-label">Valor Total</span>
            </div>
          </div>
        </div>

        {/* Insights da IA */}
        <div className="dashboard-card insights">
          <div className="dashboard-card-header">
            <Lightbulb size={20} className="icon-insight" />
            <h2>Insights da IA</h2>
          </div>
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /><span>Carregando...</span></div>
            ) : stats.insights.length === 0 ? (
              <div className="empty-state-small">Nenhum insight disponivel ainda</div>
            ) : (
              stats.insights.map((insight, i) => (
                <div key={i} className="insight-item">
                  <span className="insight-bullet">💡</span>
                  <span className="insight-text">{insight}</span>
                </div>
              ))
            )}
          </div>
          <button className="dashboard-card-action" onClick={onOpenChat}>
            Explorar insights <ArrowRight size={16} />
          </button>
        </div>

        {/* Calendário Resumido */}
        <div className="dashboard-card calendar">
          <div className="dashboard-card-header">
            <Calendar size={20} />
            <h2>Proximos Eventos</h2>
          </div>
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /><span>Carregando...</span></div>
            ) : stats.eventos.length === 0 ? (
              <div className="empty-state-small">Nenhum evento proximo</div>
            ) : (
              stats.eventos.map((ev, i) => (
                <div key={i} className="calendar-item">
                  <div className="calendar-date">
                    <span className="calendar-day">{ev.dia}</span>
                    <span className="calendar-month">{ev.mes}</span>
                  </div>
                  <div className="calendar-info">
                    <span className="calendar-title">{ev.titulo}</span>
                    <span className="calendar-subtitle">{ev.subtitulo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="dashboard-card-action" onClick={() => onNavigate('calendario')}>
            Ver calendario completo <ArrowRight size={16} />
          </button>
        </div>

        {/* O que o sistema aprendeu */}
        <div className="dashboard-card aprendizado">
          <div className="dashboard-card-header">
            <Brain size={20} className="icon-brain" />
            <h2>O que o sistema aprendeu</h2>
          </div>
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /><span>Carregando...</span></div>
            ) : stats.aprendizados.length === 0 ? (
              <div className="empty-state-small">O sistema ainda esta aprendendo...</div>
            ) : (
              stats.aprendizados.map((ap, i) => (
                <div key={i} className="aprendizado-item">
                  <Sparkles size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                  <span>{ap}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
