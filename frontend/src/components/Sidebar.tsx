import { useState } from "react";
import type { Session } from "../types";
import {
  Plus, Trash2, Pencil, MessageSquare, Check, X, LogOut, User as UserIcon,
  Bell, Calendar, Clock, Search, Settings, ChevronDown, ChevronRight,
  Timer, Mail, Eye, History, Radar
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
}

// Menu items para Sprint 2 - Alertas e Automação
interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

interface MenuGroup {
  id: string;
  icon: React.ReactNode;
  label: string;
  items: MenuItem[];
}

const SPRINT2_MENUS: MenuGroup[] = [
  {
    id: "alertas",
    icon: <Bell size={16} />,
    label: "Alertas e Prazos",
    items: [
      { id: "dashboard_prazos", icon: <Timer size={14} />, label: "Dashboard de Prazos", prompt: "Mostre o dashboard de prazos dos editais" },
      { id: "proximos_pregoes", icon: <Clock size={14} />, label: "Próximos Pregões", prompt: "Quais editais abrem esta semana?" },
      { id: "meus_alertas", icon: <Bell size={14} />, label: "Meus Alertas", prompt: "Quais alertas tenho configurados?" },
      { id: "configurar_alerta", icon: <Settings size={14} />, label: "Configurar Alerta", prompt: "Configure alertas para o edital " },
    ]
  },
  {
    id: "monitoramento",
    icon: <Radar size={16} />,
    label: "Monitoramento",
    items: [
      { id: "monitoramentos_ativos", icon: <Eye size={14} />, label: "Monitoramentos Ativos", prompt: "Quais monitoramentos tenho ativos?" },
      { id: "novo_monitoramento", icon: <Plus size={14} />, label: "Novo Monitoramento", prompt: "Monitore editais de " },
      { id: "resultados_monitoramento", icon: <Search size={14} />, label: "Resultados Recentes", prompt: "Mostre os últimos editais encontrados pelo monitoramento" },
    ]
  },
  {
    id: "calendario",
    icon: <Calendar size={16} />,
    label: "Calendário",
    items: [
      { id: "calendario_mes", icon: <Calendar size={14} />, label: "Calendário do Mês", prompt: "Mostre o calendário de editais deste mês" },
      { id: "calendario_semana", icon: <Calendar size={14} />, label: "Esta Semana", prompt: "Mostre o calendário de editais desta semana" },
      { id: "datas_importantes", icon: <Clock size={14} />, label: "Datas Importantes", prompt: "Quais são as próximas datas importantes dos meus editais?" },
    ]
  },
  {
    id: "notificacoes",
    icon: <Mail size={16} />,
    label: "Notificações",
    items: [
      { id: "config_notificacoes", icon: <Settings size={14} />, label: "Configurar Email", prompt: "Configure minhas preferências de notificação" },
      { id: "historico_notificacoes", icon: <History size={14} />, label: "Histórico", prompt: "Mostre o histórico de notificações" },
      { id: "notificacoes_pendentes", icon: <Bell size={14} />, label: "Não Lidas", prompt: "Quais notificações não li?" },
    ]
  },
];

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, name: string) => void;
  user?: User | null;
  onLogout?: () => void;
  onMenuAction?: (prompt: string) => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  user,
  onLogout,
  onMenuAction,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const handleMenuItemClick = (prompt: string) => {
    if (onMenuAction) {
      onMenuAction(prompt);
    }
  };

  const startRename = (session: Session) => {
    setEditingId(session.session_id);
    setEditName(session.name);
  };

  const confirmRename = (sessionId: string) => {
    if (editName.trim()) {
      onRenameSession(sessionId, editName.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Agente Editais</h1>
        <button className="new-session-btn" onClick={onNewSession}>
          <Plus size={18} />
          <span>Nova conversa</span>
        </button>
      </div>
      {/* Sprint 2: Menus de Alertas e Automação */}
      <div className="sprint2-menus">
        {SPRINT2_MENUS.map((group) => (
          <div key={group.id} className="menu-group">
            <button
              className={`menu-group-header ${expandedMenus.has(group.id) ? 'expanded' : ''}`}
              onClick={() => toggleMenu(group.id)}
            >
              {group.icon}
              <span>{group.label}</span>
              {expandedMenus.has(group.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedMenus.has(group.id) && (
              <div className="menu-items">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className="menu-item"
                    onClick={() => handleMenuItemClick(item.prompt)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div
            key={session.session_id}
            className={`session-item ${
              session.session_id === activeSessionId ? "active" : ""
            }`}
            onClick={() => {
              if (editingId !== session.session_id) {
                onSelectSession(session.session_id);
              }
            }}
          >
            <MessageSquare size={16} />
            {editingId === session.session_id ? (
              <div className="rename-input-group">
                <input
                  className="rename-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename(session.session_id);
                    if (e.key === "Escape") cancelRename();
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="icon-btn confirm"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmRename(session.session_id);
                  }}
                >
                  <Check size={14} />
                </button>
                <button
                  className="icon-btn cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelRename();
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <span className="session-name">{session.name}</span>
                <div className="session-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(session);
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.session_id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* User profile section */}
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
