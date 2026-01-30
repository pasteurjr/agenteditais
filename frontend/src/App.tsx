import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useSessions } from "./hooks/useSessions";
import { useChat } from "./hooks/useChat";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import { setTokenGetter, uploadFile } from "./api/client";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import "./styles/globals.css";

function AppContent() {
  const { user, isAuthenticated, isLoading, logout, getAccessToken } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { sessions, addSession, removeSession, updateSessionName, refreshSessions } = useSessions();
  const { messages, isLoading: chatLoading, loadingStatus, send, loadSession, clearMessages } = useChat();

  // Set token getter for API client
  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  // Reload sessions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshSessions();
    }
  }, [isAuthenticated, refreshSessions]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      setActiveSessionId(sessionId);
      await loadSession(sessionId);
    },
    [loadSession]
  );

  const handleNewSession = useCallback(async () => {
    const session = await addSession();
    setActiveSessionId(session.session_id);
    clearMessages();
  }, [addSession, clearMessages]);

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      await removeSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        clearMessages();
      }
    },
    [removeSession, activeSessionId, clearMessages]
  );

  const handleRenameSession = useCallback(
    async (sessionId: string, name: string) => {
      await updateSessionName(sessionId, name);
    },
    [updateSessionName]
  );

  const handleSend = useCallback(
    async (message: string) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = await addSession();
        sessionId = session.session_id;
        setActiveSessionId(sessionId);
      }
      const response = await send(sessionId, message);
      // Update session name if auto-renamed
      if (response?.session_name) {
        console.log("Session renamed to:", response.session_name);
        // Update locally for immediate feedback
        updateSessionName(sessionId, response.session_name);
      }
    },
    [activeSessionId, send, addSession, updateSessionName]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setActiveSessionId(null);
    clearMessages();
  }, [logout, clearMessages]);

  const handleUpload = useCallback(
    async (file: File, nomeProduto: string) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = await addSession();
        sessionId = session.session_id;
        setActiveSessionId(sessionId);
      }
      try {
        // Envia o arquivo para o backend
        const response = await uploadFile(sessionId, file, nomeProduto);
        // Recarrega as mensagens para mostrar o resultado
        await loadSession(sessionId);
        // Update session name if auto-renamed
        if (response?.session_name) {
          updateSessionName(sessionId, response.session_name);
        }
      } catch (error) {
        console.error("Erro no upload:", error);
      }
    },
    [activeSessionId, addSession, loadSession, updateSessionName]
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Show login or register page if not authenticated
  if (!isAuthenticated) {
    if (authMode === "register") {
      return <RegisterPage onSwitchToLogin={() => setAuthMode("login")} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode("register")} />;
  }

  return (
    <div className="app-container">
      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
      </button>
      <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          user={user}
          onLogout={handleLogout}
        />
      </div>
      <ChatArea
        messages={messages}
        isLoading={chatLoading}
        loadingStatus={loadingStatus}
        onSend={handleSend}
        onUpload={handleUpload}
        hasSession={true}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
