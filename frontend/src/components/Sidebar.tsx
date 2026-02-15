import { useState } from "react";
import {
  LogOut, User as UserIcon, ChevronDown, ChevronRight,
  LayoutDashboard, Search, CheckCircle, DollarSign, FileText, Send,
  Gavel, Clock, AlertCircle, Package, BarChart2, Flag, Eye, Users,
  TrendingUp, Scale, AlertTriangle, XCircle, Settings, Building,
  Briefcase, Sliders, GitBranch, Database, Shield, Layers, FileCheck,
  Bell, Mail, Target, BookOpen, Zap
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  page: string;
}

interface MenuSection {
  id: string;
  icon: React.ReactNode;
  label: string;
  items: (MenuItem | MenuSubSection)[];
}

interface MenuSubSection {
  id: string;
  icon: React.ReactNode;
  label: string;
  items: MenuItem[];
}

function isSubSection(item: MenuItem | MenuSubSection): item is MenuSubSection {
  return "items" in item;
}

const SIDEBAR_SECTIONS: MenuSection[] = [
  {
    id: "fluxo",
    icon: <GitBranch size={18} />,
    label: "Fluxo Comercial",
    items: [
      { id: "captacao", icon: <Search size={16} />, label: "Captacao", page: "captacao" },
      { id: "validacao", icon: <CheckCircle size={16} />, label: "Validacao", page: "validacao" },
      { id: "impugnacao", icon: <AlertCircle size={16} />, label: "Impugnacao", page: "impugnacao" },
      { id: "precificacao", icon: <DollarSign size={16} />, label: "Precificacao", page: "precificacao" },
      { id: "proposta", icon: <FileText size={16} />, label: "Proposta", page: "proposta" },
      { id: "submissao", icon: <Send size={16} />, label: "Submissao", page: "submissao" },
      { id: "lances", icon: <Gavel size={16} />, label: "Disputa Lances", page: "lances" },
      { id: "followup", icon: <Clock size={16} />, label: "Followup", page: "followup" },
      { id: "crm", icon: <Users size={16} />, label: "CRM", page: "crm" },
      { id: "producao", icon: <Package size={16} />, label: "Execucao Contrato", page: "producao" },
    ]
  },
  {
    id: "cadastros",
    icon: <Database size={18} />,
    label: "Cadastros",
    items: [
      {
        id: "cad-empresa",
        icon: <Building size={16} />,
        label: "Empresa",
        items: [
          { id: "crud-empresas", icon: <Building size={14} />, label: "Dados Cadastrais", page: "crud:empresas" },
          { id: "crud-empresa-documentos", icon: <FileText size={14} />, label: "Documentos", page: "crud:empresa-documentos" },
          { id: "crud-empresa-certidoes", icon: <Shield size={14} />, label: "Certidoes", page: "crud:empresa-certidoes" },
          { id: "crud-empresa-responsaveis", icon: <Users size={14} />, label: "Responsaveis", page: "crud:empresa-responsaveis" },
        ],
      },
      {
        id: "cad-portfolio",
        icon: <Package size={16} />,
        label: "Portfolio",
        items: [
          { id: "crud-produtos", icon: <Package size={14} />, label: "Produtos", page: "crud:produtos" },
          { id: "crud-produtos-specs", icon: <Sliders size={14} />, label: "Especificacoes", page: "crud:produtos-especificacoes" },
          { id: "crud-produtos-docs", icon: <FileText size={14} />, label: "Documentos", page: "crud:produtos-documentos" },
        ],
      },
      {
        id: "cad-editais",
        icon: <FileCheck size={16} />,
        label: "Editais",
        items: [
          { id: "crud-editais", icon: <FileCheck size={14} />, label: "Editais", page: "crud:editais" },
          { id: "crud-editais-req", icon: <Layers size={14} />, label: "Requisitos", page: "crud:editais-requisitos" },
          { id: "crud-editais-docs", icon: <FileText size={14} />, label: "Documentos", page: "crud:editais-documentos" },
          { id: "crud-editais-itens", icon: <Layers size={14} />, label: "Itens", page: "crud:editais-itens" },
        ],
      },
      {
        id: "cad-analises",
        icon: <BarChart2 size={16} />,
        label: "Analises e Propostas",
        items: [
          { id: "crud-analises", icon: <BarChart2 size={14} />, label: "Analises", page: "crud:analises" },
          { id: "crud-propostas", icon: <Send size={14} />, label: "Propostas", page: "crud:propostas" },
        ],
      },
      {
        id: "cad-concorrencia",
        icon: <Users size={16} />,
        label: "Concorrencia",
        items: [
          { id: "crud-concorrentes", icon: <Users size={14} />, label: "Concorrentes", page: "crud:concorrentes" },
          { id: "crud-precos", icon: <DollarSign size={14} />, label: "Precos Historicos", page: "crud:precos-historicos" },
          { id: "crud-participacoes", icon: <Scale size={14} />, label: "Participacoes", page: "crud:participacoes-editais" },
        ],
      },
      {
        id: "cad-alertas",
        icon: <Bell size={16} />,
        label: "Alertas e Monitor.",
        items: [
          { id: "crud-alertas", icon: <Bell size={14} />, label: "Alertas", page: "crud:alertas" },
          { id: "crud-monitoramentos", icon: <Eye size={14} />, label: "Monitoramentos", page: "crud:monitoramentos" },
          { id: "crud-notificacoes", icon: <Mail size={14} />, label: "Notificacoes", page: "crud:notificacoes" },
          { id: "crud-pref-notif", icon: <Bell size={14} />, label: "Preferencias", page: "crud:preferencias-notificacao" },
        ],
      },
      {
        id: "cad-contratos",
        icon: <Briefcase size={16} />,
        label: "Contratos",
        items: [
          { id: "crud-contratos", icon: <Briefcase size={14} />, label: "Contratos", page: "crud:contratos" },
          { id: "crud-entregas", icon: <Clock size={14} />, label: "Entregas", page: "crud:contrato-entregas" },
        ],
      },
      {
        id: "cad-recursos",
        icon: <Gavel size={16} />,
        label: "Recursos",
        items: [
          { id: "crud-recursos", icon: <Gavel size={14} />, label: "Recursos/Impugnacoes", page: "crud:recursos" },
        ],
      },
      {
        id: "cad-crm",
        icon: <TrendingUp size={16} />,
        label: "CRM",
        items: [
          { id: "crud-leads", icon: <TrendingUp size={14} />, label: "Leads", page: "crud:leads-crm" },
          { id: "crud-acoes-perda", icon: <AlertTriangle size={14} />, label: "Acoes Pos-Perda", page: "crud:acoes-pos-perda" },
        ],
      },
      {
        id: "cad-auditoria",
        icon: <BookOpen size={16} />,
        label: "Auditoria",
        items: [
          { id: "crud-auditoria", icon: <Database size={14} />, label: "Log Auditoria", page: "crud:auditoria-log" },
          { id: "crud-feedback", icon: <BookOpen size={14} />, label: "Feedback Aprendizado", page: "crud:aprendizado-feedback" },
        ],
      },
      {
        id: "cad-parametros",
        icon: <Target size={16} />,
        label: "Parametros",
        items: [
          { id: "crud-param-score", icon: <Target size={14} />, label: "Parametros Score", page: "crud:parametros-score" },
          { id: "crud-dispensas", icon: <Zap size={14} />, label: "Dispensas", page: "crud:dispensas" },
          { id: "crud-estrategias", icon: <Target size={14} />, label: "Estrategias", page: "crud:estrategias-editais" },
          { id: "crud-fontes", icon: <Search size={14} />, label: "Fontes Editais", page: "crud:fontes-editais" },
        ],
      },
    ]
  },
  {
    id: "indicadores",
    icon: <BarChart2 size={18} />,
    label: "Indicadores",
    items: [
      { id: "flags", icon: <Flag size={16} />, label: "Flags", page: "flags" },
      { id: "monitoria", icon: <Eye size={16} />, label: "Monitoria", page: "monitoria" },
      { id: "concorrencia", icon: <Users size={16} />, label: "Concorrencia", page: "concorrencia" },
      { id: "mercado", icon: <TrendingUp size={16} />, label: "Mercado", page: "mercado" },
      { id: "contratado", icon: <Scale size={16} />, label: "Contratado X Realizado", page: "contratado" },
      { id: "atrasos", icon: <AlertTriangle size={16} />, label: "Pedidos em Atraso", page: "atrasos" },
      { id: "perdas", icon: <XCircle size={16} />, label: "Perdas", page: "perdas" },
    ]
  },
  {
    id: "config",
    icon: <Settings size={18} />,
    label: "Configuracoes",
    items: [
      { id: "empresa", icon: <Building size={16} />, label: "Empresa", page: "empresa" },
      { id: "portfolio", icon: <Briefcase size={16} />, label: "Portfolio", page: "portfolio" },
      { id: "parametros", icon: <Sliders size={16} />, label: "Parametrizacoes", page: "parametros" },
    ]
  }
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: User | null;
  onLogout?: () => void;
}

export function Sidebar({
  currentPage,
  onNavigate,
  user,
  onLogout,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["fluxo"]));
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleSubSection = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subId)) {
        newSet.delete(subId);
      } else {
        newSet.add(subId);
      }
      return newSet;
    });
  };

  const handleItemClick = (page: string) => {
    onNavigate(page);
  };

  return (
    <div className="sidebar">
      {/* Header com logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => onNavigate('dashboard')}>
          <span className="logo-icon">F</span>
          <h1>facilicita.ia</h1>
        </div>
      </div>

      {/* Navegacao */}
      <nav className="sidebar-nav">
        {/* Dashboard - item fixo fora dos menus */}
        <button
          className={`nav-item nav-item-main ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleItemClick('dashboard')}
        >
          <span className="nav-item-icon"><LayoutDashboard size={18} /></span>
          <span className="nav-item-label">Dashboard</span>
        </button>

        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.id} className="nav-section">
            <button
              className={`nav-section-header ${expandedSections.has(section.id) ? 'expanded' : ''}`}
              onClick={() => toggleSection(section.id)}
            >
              <span className="nav-section-icon">{section.icon}</span>
              <span className="nav-section-label">{section.label}</span>
              <span className="nav-section-chevron">
                {expandedSections.has(section.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </button>

            {expandedSections.has(section.id) && (
              <div className="nav-section-items">
                {section.items.map((item) => {
                  if (isSubSection(item)) {
                    // Render sub-section with expandable items
                    return (
                      <div key={item.id} className="nav-subsection">
                        <button
                          className={`nav-subsection-header ${expandedSubSections.has(item.id) ? 'expanded' : ''}`}
                          onClick={(e) => toggleSubSection(item.id, e)}
                        >
                          <span className="nav-item-icon">{item.icon}</span>
                          <span className="nav-item-label">{item.label}</span>
                          <span className="nav-section-chevron">
                            {expandedSubSections.has(item.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </span>
                        </button>
                        {expandedSubSections.has(item.id) && (
                          <div className="nav-subsection-items">
                            {item.items.map((subItem) => (
                              <button
                                key={subItem.id}
                                className={`nav-item nav-item-sub ${currentPage === subItem.page ? 'active' : ''}`}
                                onClick={() => handleItemClick(subItem.page)}
                              >
                                <span className="nav-item-icon">{subItem.icon}</span>
                                <span className="nav-item-label">{subItem.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  // Render regular item
                  return (
                    <button
                      key={item.id}
                      className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                      onClick={() => handleItemClick(item.page)}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      <span className="nav-item-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer com perfil */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-profile">
            {user.picture_url ? (
              <img src={user.picture_url} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                <UserIcon size={20} />
              </div>
            )}
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            {onLogout && (
              <button className="logout-btn" onClick={onLogout} title="Sair">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
