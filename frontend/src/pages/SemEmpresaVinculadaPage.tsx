import { useAuth } from "../contexts/AuthContext";

interface Props {
  onCriarEmpresa: () => void;
  onAssociar: () => void;
  onEntrar: () => void;
}

export function SemEmpresaVinculadaPage({ onCriarEmpresa, onAssociar, onEntrar }: Props) {
  const { isSuper, logout, minhasEmpresasList } = useAuth();

  // Usuario comum: so pode sair
  if (!isSuper) {
    return (
      <div className="login-page">
        <div className="login-container" style={{ maxWidth: 480, textAlign: "center" }}>
          <div className="login-header">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h1 style={{ marginTop: 16 }}>Sem empresa vinculada</h1>
            <p>Seu usuário ainda não foi alocado a nenhuma empresa.<br />Entre em contato com o administrador do sistema.</p>
          </div>
          <button className="login-btn" style={{ marginTop: 24 }} onClick={logout}>Sair</button>
        </div>
      </div>
    );
  }

  // Super: 3 opcoes que redirecionam pra paginas existentes
  const podeEntrar = minhasEmpresasList.length > 0;

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: 600, textAlign: "center" }}>
        <div className="login-header">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
          </svg>
          <h1 style={{ marginTop: 16 }}>Você não tem empresas vinculadas</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>
            Como superusuário, você pode escolher uma das opções abaixo:
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
          <button
            className="login-btn"
            data-action="criar-empresa"
            onClick={onCriarEmpresa}
            style={{ background: "#3b82f6" }}
            title="Abre o CRUD de Empresas (Cadastros > Empresa)"
          >
            ➕ Criar Nova Empresa
          </button>

          <button
            className="login-btn"
            data-action="associar-empresa"
            onClick={onAssociar}
            style={{ background: "#8b5cf6" }}
            title="Abre a página Associar Empresa/Usuário"
          >
            🔗 Vincular Empresa a Usuário
          </button>

          <button
            className="login-btn"
            data-action="entrar-sistema"
            onClick={onEntrar}
            disabled={!podeEntrar}
            style={{ background: podeEntrar ? "#10b981" : "#475569", cursor: podeEntrar ? "pointer" : "not-allowed" }}
            title={podeEntrar ? "Selecionar uma das empresas existentes" : "Não há empresas no banco"}
          >
            ▶️ Entrar no Sistema {podeEntrar ? `(${minhasEmpresasList.length} empresas disponíveis)` : "(banco vazio)"}
          </button>

          <button
            className="login-btn"
            onClick={logout}
            style={{ background: "transparent", border: "1px solid #475569", color: "#94a3b8", marginTop: 8 }}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
