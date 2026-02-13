import { useState } from "react";
import type { Message, Session } from "../types";
import { ChatArea } from "./ChatArea";
import {
  MessageCircle, X, Minimize2, Maximize2, Plus, History, Trash2, Pencil, Check,
  ChevronLeft
} from "lucide-react";

interface FloatingChatProps {
  isOpen: boolean;
  onToggle: () => void;
  // Props de sessões
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, name: string) => void;
  // Props do chat
  messages: Message[];
  isLoading: boolean;
  loadingStatus?: string;
  onSend: (message: string, file?: File) => void;
}

export function FloatingChat({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  messages,
  isLoading,
  loadingStatus,
  onSend,
}: FloatingChatProps) {
  const [showSessions, setShowSessions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const activeSession = sessions.find(s => s.session_id === activeSessionId);

  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId);
    setShowSessions(false);
  };

  const startRename = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.session_id);
    setEditName(session.name);
  };

  const confirmRename = (sessionId: string) => {
    if (editName.trim()) {
      onRenameSession(sessionId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        className={`floating-chat-btn ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        title={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Modal do chat */}
      {isOpen && (
        <div className={`floating-chat-modal ${isExpanded ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="floating-chat-header">
            <button
              className="floating-chat-header-btn"
              onClick={() => setShowSessions(!showSessions)}
              title="Histórico de conversas"
            >
              {showSessions ? <ChevronLeft size={20} /> : <History size={20} />}
            </button>

            <div className="floating-chat-title">
              <h3>Dr. Licita</h3>
              {activeSession && (
                <span className="floating-chat-session-name">{activeSession.name}</span>
              )}
            </div>

            <div className="floating-chat-header-actions">
              <button
                className="floating-chat-header-btn"
                onClick={onNewSession}
                title="Nova conversa"
              >
                <Plus size={20} />
              </button>
              <button
                className="floating-chat-header-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Reduzir" : "Expandir"}
              >
                {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                className="floating-chat-header-btn"
                onClick={onToggle}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Container principal com sessões e chat */}
          <div className="floating-chat-body">
            {/* Painel de sessões */}
            {showSessions && (
              <div className="floating-chat-sessions">
                <div className="floating-chat-sessions-header">
                  <h4>Conversas</h4>
                  <button
                    className="floating-chat-new-session-btn"
                    onClick={() => {
                      onNewSession();
                      setShowSessions(false);
                    }}
                    title="Nova conversa"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="floating-chat-sessions-list">
                  {sessions.length === 0 ? (
                    <div className="floating-chat-sessions-empty">
                      Nenhuma conversa ainda.
                      <button
                        className="floating-chat-start-btn"
                        onClick={() => {
                          onNewSession();
                          setShowSessions(false);
                        }}
                      >
                        Iniciar conversa
                      </button>
                    </div>
                  ) : (
                    sessions.map(session => (
                      <div
                        key={session.session_id}
                        className={`floating-chat-session-item ${
                          session.session_id === activeSessionId ? 'active' : ''
                        }`}
                        onClick={() => handleSelectSession(session.session_id)}
                      >
                        {editingId === session.session_id ? (
                          <div className="floating-chat-session-edit">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmRename(session.session_id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                            <button onClick={() => confirmRename(session.session_id)}>
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="floating-chat-session-name-text">
                              {session.name}
                            </span>
                            <div className="floating-chat-session-actions">
                              <button onClick={(e) => startRename(session, e)}>
                                <Pencil size={14} />
                              </button>
                              <button
                                className="danger"
                                onClick={(e) => handleDelete(session.session_id, e)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Área do chat */}
            <div className={`floating-chat-content ${showSessions ? 'with-sessions' : ''}`}>
              <ChatArea
                messages={messages}
                isLoading={isLoading}
                loadingStatus={loadingStatus}
                onSend={onSend}
                hasSession={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
