/**
 * F01-01/F01-06/F02-03/F03-02: Upload em massa de documentos com classificacao por IA.
 *
 * Drag-and-drop de varios arquivos. Cada um eh classificado pela IA e fica em modo "rascunho"
 * pra revisao do user antes de persistir. Inclui aceite de IA (F03-03).
 *
 * Uso:
 *   <UploadLoteIA
 *     contexto="documentos"
 *     empresaId={empresaId}
 *     onConfirmado={(persistidos) => recarregarLista()}
 *   />
 */
import { useState, useRef } from "react";
import { Upload, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { AceiteIACheckbox } from "./AceiteIACheckbox";

type Contexto = "cadastro_empresa" | "documentos" | "portfolio";

interface ItemResultado {
  filename: string;
  classificacao: string | null;
  dados_extraidos: Record<string, unknown> | null;
  criado_id: string | null;
  filepath: string | null;
  erro: string | null;
}

interface UploadLoteIAProps {
  contexto: Contexto;
  empresaId?: string;
  onConfirmado?: (persistidos: unknown[]) => void;
  authToken?: string | null;
}

const TITULOS: Record<Contexto, string> = {
  cadastro_empresa: "Cadastro Automático por IA — envie contrato social",
  documentos: "Upload em Massa — IA classifica cada documento",
  portfolio: "Upload em Massa de Portfólio — IA classifica catálogos/manuais",
};

const DESCRICOES: Record<Contexto, string> = {
  cadastro_empresa: "Envie o contrato social, cartão CNPJ ou comprovante. A IA extrai os dados e preenche o formulário automaticamente. Você confere e ajusta antes de salvar.",
  documentos: "Arraste vários PDFs (alvará, certidões, contrato social, atestados, etc.). A IA classifica cada um e identifica datas de vencimento. Você revisa e confirma antes de salvar.",
  portfolio: "Arraste catálogos, manuais, registros ANVISA, fichas técnicas. A IA classifica e tenta identificar produto, fabricante, modelo. Você revisa e confirma.",
};

export function UploadLoteIA({ contexto, empresaId, onConfirmado, authToken }: UploadLoteIAProps) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [resultados, setResultados] = useState<ItemResultado[]>([]);
  const [processando, setProcessando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [aprovados, setAprovados] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const novos = Array.from(files).filter(f => f.size < 25 * 1024 * 1024); // <25MB
    setArquivos(prev => [...prev, ...novos].slice(0, 50));
  };

  const removerArquivo = (i: number) => {
    setArquivos(prev => prev.filter((_, idx) => idx !== i));
  };

  const enviar = async () => {
    if (arquivos.length === 0) return;
    setProcessando(true);
    try {
      const formData = new FormData();
      formData.append("contexto", contexto);
      if (empresaId) formData.append("empresa_id", empresaId);
      arquivos.forEach((f, i) => formData.append(`file_${i}`, f));

      const headers: Record<string, string> = {};
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/upload-lote-ia", {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro no upload");
      }
      setResultados(data.resultados || []);
      // Inicialmente, marca todos os que tiveram sucesso como aprovados
      const initSet = new Set<number>();
      (data.resultados || []).forEach((r: ItemResultado, i: number) => {
        if (!r.erro) initSet.add(i);
      });
      setAprovados(initSet);
    } catch (e) {
      alert(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setProcessando(false);
    }
  };

  const toggleAprovado = (i: number) => {
    setAprovados(prev => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  };

  const confirmar = async () => {
    if (!aceito) {
      alert("Marque o aceite de IA antes de confirmar.");
      return;
    }
    if (aprovados.size === 0) {
      alert("Nenhum item aprovado.");
      return;
    }
    setConfirmando(true);
    try {
      const itensAprovados = resultados
        .map((r, i) => ({ ...r, _idx: i }))
        .filter(r => aprovados.has(r._idx));

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/upload-lote-ia/confirmar", {
        method: "POST",
        headers,
        body: JSON.stringify({
          contexto,
          empresa_id: empresaId,
          itens_aprovados: itensAprovados,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao confirmar");
      alert(`✅ ${data.persistidos} item(s) salvo(s) com sucesso.`);
      setArquivos([]);
      setResultados([]);
      setAprovados(new Set());
      setAceito(false);
      if (onConfirmado) onConfirmado(data.itens || []);
    } catch (e) {
      alert(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div style={{
      border: "1px solid var(--border-color, #2d3a54)",
      borderRadius: "8px",
      padding: "16px",
      background: "var(--bg-secondary, #16213e)",
    }}>
      <h3 style={{ margin: 0, marginBottom: "8px", fontSize: "15px" }}>{TITULOS[contexto]}</h3>
      <p style={{ margin: 0, marginBottom: "16px", fontSize: "12px", color: "var(--text-secondary, #94a3b8)" }}>
        {DESCRICOES[contexto]}
      </p>

      {resultados.length === 0 && (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? "#3b82f6" : "#2d3a54"}`,
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              background: drag ? "rgba(59,130,246,0.05)" : "transparent",
              transition: "all 0.15s",
            }}
          >
            <Upload size={28} style={{ opacity: 0.6, marginBottom: "8px" }} />
            <div style={{ fontSize: "13px" }}>
              {drag ? "Solte os arquivos aqui" : "Clique ou arraste arquivos PDF/DOCX (máx 50)"}
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {arquivos.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <strong style={{ fontSize: "12px" }}>{arquivos.length} arquivo(s) selecionado(s):</strong>
              <ul style={{ marginTop: "8px", listStyle: "none", padding: 0 }}>
                {arquivos.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", fontSize: "12px" }}>
                    <span style={{ flex: 1 }}>{f.name} <span style={{ opacity: 0.5 }}>({(f.size / 1024).toFixed(1)} KB)</span></span>
                    <button onClick={() => removerArquivo(i)} title="Remover" style={{ background: "none", border: "none", color: "#ef4444" }}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={enviar}
                disabled={processando || arquivos.length === 0}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: processando ? "#475569" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: processando ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {processando ? <><Loader2 size={14} className="spin" /> Analisando com IA...</> : `🤖 Enviar ${arquivos.length} arquivos para IA`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div>
          <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "14px" }}>
            Resultados da IA — revise antes de salvar:
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "400px", overflowY: "auto" }}>
            {resultados.map((r, i) => (
              <li key={i} style={{
                padding: "10px 12px",
                marginBottom: "6px",
                borderRadius: "6px",
                background: r.erro ? "rgba(239,68,68,0.08)" : aprovados.has(i) ? "rgba(34,197,94,0.08)" : "rgba(148,163,184,0.05)",
                border: `1px solid ${r.erro ? "#ef4444" : aprovados.has(i) ? "#22c55e" : "#475569"}`,
                fontSize: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  {!r.erro && (
                    <input
                      type="checkbox"
                      checked={aprovados.has(i)}
                      onChange={() => toggleAprovado(i)}
                      style={{ marginTop: "2px" }}
                    />
                  )}
                  {r.erro && <AlertTriangle size={14} color="#ef4444" style={{ marginTop: "2px" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: "4px" }}>{r.filename}</div>
                    {r.erro ? (
                      <span style={{ color: "#ef4444" }}>❌ {r.erro}</span>
                    ) : (
                      <>
                        <div style={{ color: "#22c55e", marginBottom: "4px" }}>
                          <strong>Tipo:</strong> {r.classificacao || "—"}
                        </div>
                        {r.dados_extraidos && (
                          <pre style={{ fontSize: "10px", margin: 0, padding: "6px", background: "rgba(15,22,41,0.5)", borderRadius: "4px", overflow: "auto" }}>
                            {JSON.stringify(r.dados_extraidos, null, 2)}
                          </pre>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Aceite de IA (F03-03) */}
          <div style={{ marginTop: "16px" }}>
            <AceiteIACheckbox
              onChange={setAceito}
              warning={true}
              label="Eu revisei TODOS os dados extraídos pela IA e confirmo que estão corretos. Itens marcados serão salvos. A responsabilidade pela aceitação é minha."
            />
          </div>

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <button
              onClick={confirmar}
              disabled={confirmando || !aceito || aprovados.size === 0}
              style={{
                padding: "10px 20px",
                background: !aceito || aprovados.size === 0 ? "#475569" : "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: confirmando || !aceito || aprovados.size === 0 ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {confirmando ? <><Loader2 size={14} className="spin" /> Salvando...</> : <><CheckCircle2 size={14} /> Confirmar e salvar {aprovados.size} item(s)</>}
            </button>
            <button
              onClick={() => { setResultados([]); setArquivos([]); setAprovados(new Set()); setAceito(false); }}
              style={{
                padding: "10px 16px",
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid #475569",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
