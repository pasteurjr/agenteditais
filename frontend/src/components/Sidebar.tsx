import { useState } from "react";
import {
  LogOut, User as UserIcon, ChevronDown, ChevronRight,
  LayoutDashboard, Search, CheckCircle, DollarSign, FileText, Send,
  Gavel, Clock, AlertCircle, Package, BarChart2, Flag, Eye, Users,
  TrendingUp, Scale, AlertTriangle, XCircle, Settings, Building,
  Briefcase, Sliders, GitBranch
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
  items: MenuItem[];
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
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.page)}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                  </button>
                ))}
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
