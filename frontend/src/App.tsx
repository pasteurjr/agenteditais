import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { FloatingChat } from "./components/FloatingChat";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CaptacaoPage } from "./pages/CaptacaoPage";
import { ValidacaoPage } from "./pages/ValidacaoPage";
import { PrecificacaoPage } from "./pages/PrecificacaoPage";
import { PropostaPage } from "./pages/PropostaPage";
import { SubmissaoPage } from "./pages/SubmissaoPage";
import { LancesPage } from "./pages/LancesPage";
import { FollowupPage } from "./pages/FollowupPage";
import { ImpugnacaoPage } from "./pages/ImpugnacaoPage";
import { ProducaoPage } from "./pages/ProducaoPage";
import { FlagsPage } from "./pages/FlagsPage";
import { MonitoriaPage } from "./pages/MonitoriaPage";
import { ConcorrenciaPage } from "./pages/ConcorrenciaPage";
import { MercadoPage } from "./pages/MercadoPage";
import { ContratadoRealizadoPage } from "./pages/ContratadoRealizadoPage";
import { PerdasPage } from "./pages/PerdasPage";
import { EmpresaPage } from "./pages/EmpresaPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ParametrizacoesPage } from "./pages/ParametrizacoesPage";
import { CRMPage } from "./pages/CRMPage";
import { CrudPage } from "./components/CrudPage";
import { ALL_CRUD_CONFIGS } from "./config/crudTables";
import { useSessions } from "./hooks/useSessions";
import { useChat } from "./hooks/useChat";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import { setTokenGetter } from "./api/client";
import { setCrudTokenGetter } from "./api/crud";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import "./styles/globals.css";

function AppContent() {
  const { user, isAuthenticated, isLoading: authLoading, logout, getAccessToken } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { sessions, addSession, removeSession, updateSessionName, refreshSessions } = useSessions();
  const { messages, isLoading: chatLoading, loadingStatus, send, loadSession, clearMessages } = useChat();

  // Set token getter for API client
  useEffect(() => {
    setTokenGetter(getAccessToken);
    setCrudTokenGetter(getAccessToken);
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
    async (message: string, file?: File) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = await addSession();
        sessionId = session.session_id;
        setActiveSessionId(sessionId);
      }
      const response = await send(sessionId, message, file);
      if (response?.session_name) {
        updateSessionName(sessionId, response.session_name);
      }
    },
    [activeSessionId, send, addSession, updateSessionName]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setActiveSessionId(null);
    clearMessages();
    setCurrentPage("dashboard");
  }, [logout, clearMessages]);

  const handleOpenChat = useCallback(() => {
    setChatOpen(true);
  }, []);

  // Bridge: permite que paginas enviem mensagens ao chat programaticamente
  const handleSendToChat = useCallback(async (message: string, file?: File) => {
    setChatOpen(true);
    await handleSend(message, file);
  }, [handleSend]);

  // Renderiza a pagina baseado no estado atual
  const renderPage = () => {
    // Check if it's a CRUD page (format: "crud:table-slug")
    if (currentPage.startsWith("crud:")) {
      const tableSlug = currentPage.slice(5);
      const config = ALL_CRUD_CONFIGS[tableSlug];
      if (config) {
        return <CrudPage key={tableSlug} config={config} />;
      }
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} onOpenChat={handleOpenChat} />;
      case "captacao":
        return <CaptacaoPage />;
      case "validacao":
        return <ValidacaoPage />;
      case "precificacao":
        return <PrecificacaoPage />;
      case "proposta":
        return <PropostaPage />;
      case "submissao":
        return <SubmissaoPage />;
      case "lances":
        return <LancesPage />;
      case "followup":
        return <FollowupPage />;
      case "impugnacao":
        return <ImpugnacaoPage />;
      case "producao":
        return <ProducaoPage />;
      case "crm":
        return <CRMPage />;
      case "flags":
        return <FlagsPage />;
      case "monitoria":
        return <MonitoriaPage />;
      case "concorrencia":
        return <ConcorrenciaPage />;
      case "mercado":
        return <MercadoPage />;
      case "contratado":
        return <ContratadoRealizadoPage />;
      case "atrasos":
        return <ContratadoRealizadoPage />; // Atrasos esta integrado na pagina Contratado X Realizado
      case "perdas":
        return <PerdasPage />;
      case "empresa":
        return <EmpresaPage />;
      case "portfolio":
        return <PortfolioPage onSendToChat={handleSendToChat} />;
      case "parametros":
        return <ParametrizacoesPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} onOpenChat={handleOpenChat} />;
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Auth pages
  if (!isAuthenticated) {
    if (authMode === "register") {
      return <RegisterPage onSwitchToLogin={() => setAuthMode("login")} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode("register")} />;
  }

  return (
    <div className="app-container">
      {/* Toggle da sidebar */}
      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Area principal */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Chat flutuante */}
      <FloatingChat
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        messages={messages}
        isLoading={chatLoading}
        loadingStatus={loadingStatus}
        onSend={handleSend}
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
