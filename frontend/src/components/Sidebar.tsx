import { useState } from "react";
import type { Session } from "../types";
import { Plus, Trash2, Pencil, MessageSquare, Check, X, LogOut, User as UserIcon } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
}

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, name: string) => void;
  user?: User | null;
  onLogout?: () => void;
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
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
