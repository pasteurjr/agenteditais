import { useState } from "react";
import {
  AlertTriangle, Clock, FileText, TrendingUp, CheckCircle,
  DollarSign, Target, Calendar, ArrowRight, Lightbulb, Search, Sparkles, Send, Gavel, Brain
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenChat: () => void;
}

// Dados mockados para o dashboard (serão substituídos por dados reais na Fase 2)
const mockData = {
  urgentes: [
    { id: 1, numero: "PE 045/2024", orgao: "UFMG", prazo: "2 dias", valor: "R$ 150.000" },
    { id: 2, numero: "PE 112/2024", orgao: "CEMIG", prazo: "3 dias", valor: "R$ 89.000" },
    { id: 3, numero: "CC 023/2024", orgao: "Prefeitura BH", prazo: "5 dias", valor: "R$ 320.000" },
  ],
  funil: {
    captacao: 45,
    validacao: 28,
    precificacao: 15,
    proposta: 8,
    submissao: 5,
    ganhos: 3,
  },
  kpis: {
    emAnalise: 28,
    propostas: 8,
    ganhos: 3,
    taxaSucesso: "37.5%",
    valorTotal: "R$ 1.2M",
  },
  insights: [
    "Editais de TI aumentaram 23% este mês",
    "Sua taxa de sucesso em pregões eletrônicos subiu para 42%",
    "3 editais novos compatíveis com seu portfólio foram publicados hoje",
  ],
};

export function Dashboard({ onNavigate, onOpenChat }: DashboardProps) {
  const [buscaRapida, setBuscaRapida] = useState("");

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
          <button className="dashboard-btn primary" onClick={onOpenChat}>
            <Lightbulb size={18} />
            Perguntar ao Dr. Licita
          </button>
        </div>
      </div>

      {/* Barra de badges de status */}
      <div className="dashboard-status-bar">
        <button className="status-badge-btn" onClick={() => onNavigate('captacao')}>
          <span className="status-badge-count">12</span>
          <span className="status-badge-label">Novos</span>
        </button>
        <button className="status-badge-btn" onClick={() => onNavigate('validacao')}>
          <span className="status-badge-count">5</span>
          <span className="status-badge-label">Em Analise</span>
        </button>
        <button className="status-badge-btn validados" onClick={() => onNavigate('precificacao')}>
          <span className="status-badge-count">3</span>
          <span className="status-badge-label">Validados</span>
        </button>
        <button className="status-badge-btn enviados" onClick={() => onNavigate('proposta')}>
          <span className="status-badge-count">2</span>
          <span className="status-badge-label">Propostas Enviadas</span>
        </button>
        <button className="status-badge-btn lances" onClick={() => onNavigate('lances')}>
          <span className="status-badge-count">1</span>
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
            <span className="badge warning">{mockData.urgentes.length}</span>
          </div>
          <div className="dashboard-card-content">
            {mockData.urgentes.map(edital => (
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
            ))}
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
            <div className="funnel-chart">
              <div className="funnel-step" style={{ width: '100%' }}>
                <div className="funnel-bar captacao" style={{ width: `${(mockData.funil.captacao / 45) * 100}%` }}>
                  <span className="funnel-label">Captação</span>
                  <span className="funnel-value">{mockData.funil.captacao}</span>
                </div>
              </div>
              <div className="funnel-step" style={{ width: '85%' }}>
                <div className="funnel-bar validacao" style={{ width: `${(mockData.funil.validacao / 45) * 100}%` }}>
                  <span className="funnel-label">Validação</span>
                  <span className="funnel-value">{mockData.funil.validacao}</span>
                </div>
              </div>
              <div className="funnel-step" style={{ width: '70%' }}>
                <div className="funnel-bar precificacao" style={{ width: `${(mockData.funil.precificacao / 45) * 100}%` }}>
                  <span className="funnel-label">Precificação</span>
                  <span className="funnel-value">{mockData.funil.precificacao}</span>
                </div>
              </div>
              <div className="funnel-step" style={{ width: '55%' }}>
                <div className="funnel-bar proposta" style={{ width: `${(mockData.funil.proposta / 45) * 100}%` }}>
                  <span className="funnel-label">Proposta</span>
                  <span className="funnel-value">{mockData.funil.proposta}</span>
                </div>
              </div>
              <div className="funnel-step" style={{ width: '40%' }}>
                <div className="funnel-bar submissao" style={{ width: `${(mockData.funil.submissao / 45) * 100}%` }}>
                  <span className="funnel-label">Submissão</span>
                  <span className="funnel-value">{mockData.funil.submissao}</span>
                </div>
              </div>
              <div className="funnel-step" style={{ width: '25%' }}>
                <div className="funnel-bar ganhos" style={{ width: `${(mockData.funil.ganhos / 45) * 100}%` }}>
                  <span className="funnel-label">Ganhos</span>
                  <span className="funnel-value">{mockData.funil.ganhos}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Row */}
        <div className="dashboard-kpis">
          <div className="kpi-card">
            <div className="kpi-icon blue">
              <FileText size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{mockData.kpis.emAnalise}</span>
              <span className="kpi-label">Em Análise</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon purple">
              <Clock size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{mockData.kpis.propostas}</span>
              <span className="kpi-label">Propostas</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon green">
              <CheckCircle size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{mockData.kpis.ganhos}</span>
              <span className="kpi-label">Ganhos</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon orange">
              <TrendingUp size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{mockData.kpis.taxaSucesso}</span>
              <span className="kpi-label">Taxa de Sucesso</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon gold">
              <DollarSign size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{mockData.kpis.valorTotal}</span>
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
            {mockData.insights.map((insight, i) => (
              <div key={i} className="insight-item">
                <span className="insight-bullet">💡</span>
                <span className="insight-text">{insight}</span>
              </div>
            ))}
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
            <div className="calendar-item">
              <div className="calendar-date">
                <span className="calendar-day">15</span>
                <span className="calendar-month">FEV</span>
              </div>
              <div className="calendar-info">
                <span className="calendar-title">Abertura PE 045/2024</span>
                <span className="calendar-subtitle">UFMG - 14:00</span>
              </div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">
                <span className="calendar-day">17</span>
                <span className="calendar-month">FEV</span>
              </div>
              <div className="calendar-info">
                <span className="calendar-title">Prazo Impugnacao CC 012/2024</span>
                <span className="calendar-subtitle">Prefeitura BH</span>
              </div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">
                <span className="calendar-day">20</span>
                <span className="calendar-month">FEV</span>
              </div>
              <div className="calendar-info">
                <span className="calendar-title">Sessao Pregao PE 112/2024</span>
                <span className="calendar-subtitle">CEMIG - 10:00</span>
              </div>
            </div>
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
            <div className="aprendizado-item">
              <Sparkles size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
              <span>Editais de microscopios na regiao MG tem taxa de sucesso de 73% para o seu portfolio</span>
            </div>
            <div className="aprendizado-item">
              <Sparkles size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
              <span>Orgao UFMG costuma aceitar propostas 5-8% acima do minimo estimado</span>
            </div>
            <div className="aprendizado-item">
              <Sparkles size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
              <span>Concorrente MedTech nao participou dos ultimos 3 pregoes de centrifugas - oportunidade</span>
            </div>
            <div className="aprendizado-item">
              <Sparkles size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
              <span>Editais com prazo menor que 5 dias tem taxa de sucesso 15% menor - planejar com antecedencia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
