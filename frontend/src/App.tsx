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
import { RecursosPage } from "./pages/RecursosPage";
import { FollowupPage } from "./pages/FollowupPage";
import { ImpugnacaoPage } from "./pages/ImpugnacaoPage";
import { ProducaoPage } from "./pages/ProducaoPage";
import { AtasPage } from "./pages/AtasPage";
import { FlagsPage } from "./pages/FlagsPage";
import { MonitoriaPage } from "./pages/MonitoriaPage";
import { ConcorrenciaPage } from "./pages/ConcorrenciaPage";
import { MercadoPage } from "./pages/MercadoPage";
import { ContratadoRealizadoPage } from "./pages/ContratadoRealizadoPage";
import { PerdasPage } from "./pages/PerdasPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AprendizadoPage } from "./pages/AprendizadoPage";
import { EmpresaPage } from "./pages/EmpresaPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ParametrizacoesPage } from "./pages/ParametrizacoesPage";
import { CRMPage } from "./pages/CRMPage";
import { AssociarEmpresaUsuario } from "./pages/AssociarEmpresaUsuario";
import { SelecionarEmpresaPage } from "./pages/SelecionarEmpresaPage";
import { SemEmpresaVinculadaPage } from "./pages/SemEmpresaVinculadaPage";
import { AuditoriaPage } from "./pages/AuditoriaPage";
import { SMTPPage } from "./pages/SMTPPage";
import { CrudPage } from "./components/CrudPage";
import { ALL_CRUD_CONFIGS } from "./config/crudTables";
import { useSessions } from "./hooks/useSessions";
import { useChat } from "./hooks/useChat";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import { setTokenGetter } from "./api/client";
import { setCrudTokenGetter } from "./api/crud";
import { setDashboardTokenGetter } from "./components/Dashboard";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import "./styles/globals.css";

function AppContent() {
  const { user, isAuthenticated, isSuper, isAdmin, isLoading: authLoading, logout, getAccessToken, empresa, minhasEmpresasList, empresasVinculadas } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  // FA-07 (UC-F01 V6): super sem empresa vinculada — quando true, bypassa tela e entra no shell
  const [bypassSemVinculo, setBypassSemVinculo] = useState(false);
  const { sessions, addSession, removeSession, updateSessionName, refreshSessions } = useSessions();
  const { messages, isLoading: chatLoading, loadingStatus, send, loadSession, clearMessages } = useChat();

  // Set token getter for API client
  useEffect(() => {
    setTokenGetter(getAccessToken);
    setCrudTokenGetter(getAccessToken);
    setDashboardTokenGetter(getAccessToken);
  }, [getAccessToken]);

  // Reload sessions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshSessions();
    }
  }, [isAuthenticated, refreshSessions]);

  // Listen for navigation events from pages (e.g., CaptacaoPage → ValidacaoPage)
  useEffect(() => {
    const handler = (e: Event) => {
      const { page } = (e as CustomEvent).detail;
      if (page) setCurrentPage(page);
    };
    window.addEventListener('navigate-to', handler);
    return () => window.removeEventListener('navigate-to', handler);
  }, []);

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
        return <CaptacaoPage onSendToChat={handleSendToChat} />;
      case "validacao":
        return <ValidacaoPage onSendToChat={handleSendToChat} />;
      case "precificacao":
        return <PrecificacaoPage onSendToChat={handleSendToChat} />;
      case "proposta":
        return <PropostaPage onSendToChat={handleSendToChat} />;
      case "submissao":
        return <SubmissaoPage onSendToChat={handleSendToChat} />;
      case "lances":
        return <LancesPage onSendToChat={handleSendToChat} />;
      case "recursos":
        return <RecursosPage onSendToChat={handleSendToChat} />;
      case "followup":
        return <FollowupPage onSendToChat={handleSendToChat} />;
      case "impugnacao":
        return <ImpugnacaoPage onSendToChat={handleSendToChat} />;
      case "producao":
        return <ProducaoPage onSendToChat={handleSendToChat} />;
      case "atas":
        return <AtasPage onSendToChat={handleSendToChat} />;
      case "crm":
        return <CRMPage onSendToChat={handleSendToChat} />;
      case "flags":
        return <FlagsPage onSendToChat={handleSendToChat} />;
      case "monitoria":
        return <MonitoriaPage onSendToChat={handleSendToChat} />;
      case "concorrencia":
        return <ConcorrenciaPage onSendToChat={handleSendToChat} />;
      case "mercado":
        return <MercadoPage onSendToChat={handleSendToChat} />;
      case "contratado":
        return <ContratadoRealizadoPage onSendToChat={handleSendToChat} />;
      case "atrasos":
        return <ContratadoRealizadoPage onSendToChat={handleSendToChat} />; // Atrasos esta integrado na pagina Contratado X Realizado
      case "perdas":
        return <PerdasPage onSendToChat={handleSendToChat} />;
      case "analytics":
        return <AnalyticsPage onSendToChat={handleSendToChat} />;
      case "aprendizado":
        return <AprendizadoPage onSendToChat={handleSendToChat} />;
      case "empresa":
        return <EmpresaPage onSendToChat={handleSendToChat} />;
      case "portfolio":
        return <PortfolioPage onSendToChat={handleSendToChat} />;
      case "parametros":
        return <ParametrizacoesPage onSendToChat={handleSendToChat} />;
      case "associar-empresa":
        return isSuper ? <AssociarEmpresaUsuario /> : <Dashboard onNavigate={setCurrentPage} onOpenChat={handleOpenChat} />;
      case "selecionar-empresa":
        return <SelecionarEmpresaPage />;
      case "auditoria":
        return <AuditoriaPage onSendToChat={handleSendToChat} />;
      case "smtp":
        return isSuper ? <SMTPPage onSendToChat={handleSendToChat} /> : <Dashboard onNavigate={setCurrentPage} onOpenChat={handleOpenChat} />;
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

  // Auth pages — só mostra login se NÃO está autenticado
  if (!isAuthenticated) {
    if (authMode === "register") {
      return <RegisterPage onSwitchToLogin={() => setAuthMode("login")} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode("register")} />;
  }

  // FA-07 (UC-F01 V6): Super sem empresa vinculada — 3 opcoes que reusam paginas existentes
  if (isAuthenticated && !empresa && isSuper && empresasVinculadas.length === 0 && !bypassSemVinculo) {
    return (
      <SemEmpresaVinculadaPage
        onCriarEmpresa={() => {
          // Reusa CRUD de empresas existente
          setCurrentPage("crud:empresas");
          setBypassSemVinculo(true);
        }}
        onAssociar={() => {
          // Reusa pagina existente Associar Empresa/Usuario
          setCurrentPage("associar-empresa");
          setBypassSemVinculo(true);
        }}
        onEntrar={() => {
          // Mostra SelecionarEmpresaPage se houver empresas, senao força criar via CRUD
          if (minhasEmpresasList.length > 0) {
            setBypassSemVinculo(true); // shell vai mostrar SelecionarEmpresa abaixo
          } else {
            setCurrentPage("crud:empresas");
            setBypassSemVinculo(true);
          }
        }}
      />
    );
  }

  // Autenticado mas sem empresa selecionada — redirecionar para seleção
  if (isAuthenticated && !empresa && minhasEmpresasList.length > 0 && !bypassSemVinculo) {
    return <SelecionarEmpresaPage />;
  }
  // Caso super tenha clicado "Entrar" e nao escolheu empresa ainda
  if (isAuthenticated && !empresa && isSuper && bypassSemVinculo && currentPage === "dashboard") {
    return <SelecionarEmpresaPage />;
  }

  // Usuario comum sem vinculo
  if (isAuthenticated && !empresa && !isSuper && minhasEmpresasList.length === 0) {
    return (
      <SemEmpresaVinculadaPage
        onCriarEmpresa={() => {}}
        onAssociar={() => {}}
        onEntrar={() => {}}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top bar: toggle + empresa */}
      <div className="top-bar">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
        {empresa && (
          <span className="top-bar-empresa" title={empresa.razao_social}>
            {empresa.nome_fantasia || empresa.razao_social}
          </span>
        )}
      </div>

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onLogout={handleLogout}
          isSuper={isSuper}
          isAdmin={isAdmin}
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
