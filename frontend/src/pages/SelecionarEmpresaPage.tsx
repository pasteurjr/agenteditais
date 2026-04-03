import { useAuth } from "../contexts/AuthContext";
import { Building } from "lucide-react";

export function SelecionarEmpresaPage() {
  const { minhasEmpresasList, selecionarEmpresa, empresa: empresaAtual } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Selecionar Empresa</h1>
        <p className="page-subtitle">Escolha a empresa com que deseja trabalhar</p>
      </div>
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
    </div>
  );
}
