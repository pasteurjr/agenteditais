/**
 * F03-03: Componente de aceite humano de resultado de IA.
 *
 * Uso:
 *   <AceiteIACheckbox
 *     onChange={setAceito}
 *     label="Eu revisei os dados extraídos pela IA e confirmo que estão corretos"
 *   />
 *   <button disabled={!aceito} onClick={handleSalvar}>Salvar</button>
 *
 * Após salvar, chamar:
 *   await registrarAceiteIA({
 *     contexto: "upload_certidao",
 *     recurso_id: certidaoId,
 *     dados_extraidos_ia: dadosIA,
 *     dados_aceitos_user: dadosFinal,
 *   });
 */
import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface AceiteIACheckboxProps {
  /** label customizada — default: "Eu revisei os dados extraídos pela IA e confirmo que estão corretos" */
  label?: string;
  /** chamado quando o user marca/desmarca */
  onChange: (aceito: boolean) => void;
  /** se true, mostra com cor de aviso (vermelho) — para casos onde IA pode ter errado */
  warning?: boolean;
  /** valor inicial */
  initialChecked?: boolean;
}

export function AceiteIACheckbox({
  label = "Eu revisei os dados extraídos pela IA e confirmo que estão corretos. Entendo que a aceitação é minha responsabilidade.",
  onChange,
  warning = false,
  initialChecked = false,
}: AceiteIACheckboxProps) {
  const [checked, setChecked] = useState(initialChecked);

  const toggle = () => {
    const novo = !checked;
    setChecked(novo);
    onChange(novo);
  };

  return (
    <div
      className="aceite-ia-box"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "12px 14px",
        margin: "8px 0",
        borderRadius: "8px",
        border: `2px solid ${warning ? "#f59e0b" : checked ? "#22c55e" : "#3b82f6"}`,
        background: warning
          ? "rgba(245,158,11,0.08)"
          : checked
            ? "rgba(34,197,94,0.08)"
            : "rgba(59,130,246,0.06)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onClick={toggle}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {/* no-op, handled by div onClick */}}
        style={{ marginTop: "3px", cursor: "pointer", accentColor: warning ? "#f59e0b" : "#22c55e" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          {warning ? (
            <AlertTriangle size={16} color="#f59e0b" />
          ) : checked ? (
            <CheckCircle2 size={16} color="#22c55e" />
          ) : null}
          <strong style={{ fontSize: "13px", color: warning ? "#f59e0b" : "var(--text-primary)" }}>
            Aceite obrigatório
          </strong>
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-secondary, #94a3b8)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Helper: registra o aceite no backend após salvar.
 * Não bloqueia o salvamento se falhar (apenas loga).
 */
export async function registrarAceiteIA(params: {
  contexto: string;
  recurso_id?: string;
  dados_extraidos_ia?: unknown;
  dados_aceitos_user?: unknown;
  authToken?: string | null;
}) {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (params.authToken) headers["Authorization"] = `Bearer ${params.authToken}`;
    await fetch("/api/auditoria/aceite-ia", {
      method: "POST",
      headers,
      body: JSON.stringify({
        contexto: params.contexto,
        recurso_id: params.recurso_id,
        dados_extraidos_ia: params.dados_extraidos_ia,
        dados_aceitos_user: params.dados_aceitos_user,
      }),
    });
  } catch (err) {
    console.warn("[AceiteIA] Falha ao registrar aceite (nao critico):", err);
  }
}
