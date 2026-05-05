import { useAuth } from "../contexts/AuthContext";
import { Building, LogOut, Plus, AlertCircle } from "lucide-react";

export function SelecionarEmpresaPage() {
  const { minhasEmpresasList, selecionarEmpresa, empresa: empresaAtual, logout } = useAuth();
  const vazio = !minhasEmpresasList || minhasEmpresasList.length === 0;

  const irParaCadastro = () => {
    window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "crud:empresas" } }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Selecionar Empresa</h1>
        <p className="page-subtitle">
          {vazio
            ? "Nenhuma empresa vinculada à sua conta ainda."
            : "Escolha a empresa com que deseja trabalhar"}
        </p>
      </div>

      {vazio ? (
        <div style={{
          marginTop: 32, padding: 32, border: "2px dashed var(--border-color, #e5e7eb)",
          borderRadius: 12, background: "var(--bg-card, #fff)", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16
        }}>
          <AlertCircle size={48} style={{ color: "#f59e0b" }} />
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Você ainda não tem nenhuma empresa</h3>
            <p style={{ margin: 0, color: "var(--text-muted, #6b7280)", fontSize: 14, maxWidth: 480 }}>
              Para começar a usar o sistema, cadastre uma nova empresa ou peça a um administrador
              para vincular você a uma empresa existente.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={irParaCadastro}
              style={{
                padding: "10px 18px", border: "none", borderRadius: 8,
                background: "var(--primary, #3b82f6)", color: "#fff",
                cursor: "pointer", fontSize: 14, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              <Plus size={16} /> Cadastrar nova empresa
            </button>
            <button
              onClick={() => logout()}
              style={{
                padding: "10px 18px", border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: 8, background: "var(--bg-card, #fff)",
                color: "var(--text-color, #111)", cursor: "pointer",
                fontSize: 14, fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
            {minhasEmpresasList.map(e => (
              <button
                key={e.id}
                onClick={() => selecionarEmpresa(e.id)}
                style={{
                  padding: 20, border: "2px solid", borderColor: empresaAtual?.id === e.id ? "var(--primary, #3b82f6)" : "var(--border-color, #e5e7eb)",
                  borderRadius: 12, background: empresaAtual?.id === e.id ? "var(--primary-light, #eff6ff)" : "var(--bg-card, #fff)",
                  cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 8
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Building size={20} style={{ color: "var(--primary, #3b82f6)" }} />
                  <strong style={{ fontSize: 15 }}>{e.razao_social}</strong>
                  {empresaAtual?.id === e.id && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--primary, #3b82f6)", fontWeight: 600 }}>ATIVA</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>CNPJ: {e.cnpj}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", textTransform: "capitalize" }}>Papel: {e.papel}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={irParaCadastro}
              style={{
                padding: "8px 14px", border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: 8, background: "var(--bg-card, #fff)",
                cursor: "pointer", fontSize: 13,
                display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <Plus size={14} /> Nova empresa
            </button>
            <button
              onClick={() => logout()}
              style={{
                padding: "8px 14px", border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: 8, background: "var(--bg-card, #fff)",
                cursor: "pointer", fontSize: 13,
                display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
