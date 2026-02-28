import { useState, useMemo } from "react";
import { X, Download, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  titulo?: string;
  editalNumero?: string;
  editalId?: string;
  /** Se já tem pdf_path salvo no backend */
  pdfJaSalvo?: boolean;
  /** Callback após baixar/salvar com sucesso — atualiza o estado do pai */
  onPdfSalvo?: () => void;
}

export function PdfViewer({
  isOpen,
  onClose,
  pdfUrl,
  titulo,
  editalNumero,
  editalId,
  pdfJaSalvo,
  onPdfSalvo,
}: PdfViewerProps) {
  const [baixando, setBaixando] = useState(false);
  const [baixouOk, setBaixouOk] = useState(false);
  const [erroBaixar, setErroBaixar] = useState("");

  // URL para visualização inline
  const viewUrl = useMemo(() => {
    if (!isOpen || !editalId) return "";
    const token = localStorage.getItem("editais_ia_access_token") || "";
    return `/api/editais/${editalId}/pdf/view?token=${encodeURIComponent(token)}`;
  }, [isOpen, editalId]);

  // Determina se tem PDF local (já baixado) ou precisa mostrar da URL externa
  const temPdfLocal = pdfJaSalvo || baixouOk;

  // URL a ser exibida no iframe: se já salvou, usa /view (local); senão tenta pdfUrl externo
  const displayUrl = temPdfLocal ? viewUrl : (pdfUrl || viewUrl);

  const handleBaixarSalvar = async () => {
    if (!editalId) return;
    setBaixando(true);
    setErroBaixar("");
    try {
      const token = localStorage.getItem("editais_ia_access_token") || "";
      const res = await fetch(`/api/editais/${editalId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(data.error || `Erro HTTP ${res.status}`);
      }
      setBaixouOk(true);
      onPdfSalvo?.();
    } catch (err: unknown) {
      setErroBaixar(err instanceof Error ? err.message : "Erro ao baixar PDF");
    } finally {
      setBaixando(false);
    }
  };

  const handleAbrirNovaAba = () => {
    if (displayUrl) window.open(displayUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", backgroundColor: "#1e293b", borderBottom: "1px solid #334155",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#e2e8f0" }}>
            {titulo || `Edital ${editalNumero || ""}`}
          </h3>
          {temPdfLocal && (
            <span style={{
              fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.15)",
              padding: "2px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <CheckCircle size={12} /> Salvo localmente
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Botão Abrir em Nova Aba */}
          <button
            onClick={handleAbrirNovaAba}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "6px", border: "1px solid #475569",
              backgroundColor: "#334155", color: "#e2e8f0", cursor: "pointer", fontSize: "13px",
            }}
          >
            <ExternalLink size={14} /> Nova Aba
          </button>

          {/* Botão Baixar e Salvar */}
          {!temPdfLocal && (
            <button
              onClick={handleBaixarSalvar}
              disabled={baixando}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "6px", border: "1px solid #3b82f6",
                backgroundColor: baixando ? "#1e3a5f" : "#2563eb", color: "#fff",
                cursor: baixando ? "not-allowed" : "pointer", fontSize: "13px",
              }}
            >
              {baixando ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
              {baixando ? "Baixando..." : "Baixar e Salvar"}
            </button>
          )}

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #475569",
              backgroundColor: "#334155", color: "#e2e8f0", cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {erroBaixar && (
        <div style={{
          padding: "8px 20px", backgroundColor: "rgba(239,68,68,0.15)",
          color: "#f87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px",
          flexShrink: 0,
        }}>
          <AlertCircle size={14} /> {erroBaixar}
        </div>
      )}

      {/* Mensagem de sucesso após baixar */}
      {baixouOk && (
        <div style={{
          padding: "8px 20px", backgroundColor: "rgba(34,197,94,0.15)",
          color: "#22c55e", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px",
          flexShrink: 0,
        }}>
          <CheckCircle size={14} /> PDF baixado e salvo com sucesso! Recarregando visualização do arquivo local...
        </div>
      )}

      {/* Corpo: iframe com PDF */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {displayUrl ? (
          <iframe
            src={displayUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={`PDF ${editalNumero || ""}`}
          />
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: "100%", color: "#94a3b8",
          }}>
            <AlertCircle size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p style={{ fontSize: "16px" }}>Nenhum PDF disponível para visualização.</p>
            <p style={{ fontSize: "13px", marginTop: "8px" }}>
              Clique em "Baixar e Salvar" para obter o PDF do PNCP.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
