import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Maximize2, Minimize2, Loader2 } from "lucide-react";

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  titulo?: string;
  editalNumero?: string;
  // Se não tiver pdfUrl direta, usa dados do PNCP para construir
  editalId?: string;
  cnpjOrgao?: string;
  anoCompra?: number;
  seqCompra?: number;
}

export function PdfViewer({
  isOpen,
  onClose,
  pdfUrl,
  titulo,
  editalNumero,
  editalId,
  cnpjOrgao,
  anoCompra,
  seqCompra,
}: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLoading(true);
      setError(null);
      setFinalUrl(null);
      return;
    }

    // Determinar a URL do PDF
    let url: string | null = null;

    if (pdfUrl) {
      url = pdfUrl;
    } else if (editalId) {
      // Usar o endpoint do backend que faz proxy
      url = `/api/editais/${editalId}/pdf`;
    } else if (cnpjOrgao && anoCompra && seqCompra) {
      // Construir URL direta do PNCP
      url = `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpjOrgao}/compras/${anoCompra}/${seqCompra}/arquivos/1`;
    }

    if (url) {
      setFinalUrl(url);
      setLoading(false);
    } else {
      setError("URL do PDF nao disponivel");
      setLoading(false);
    }
  }, [isOpen, pdfUrl, editalId, cnpjOrgao, anoCompra, seqCompra]);

  const handleDownload = () => {
    if (finalUrl) {
      // Adicionar parametro download=true se for endpoint do backend
      const downloadUrl = finalUrl.startsWith('/api/')
        ? `${finalUrl}?download=true`
        : finalUrl;
      window.open(downloadUrl, '_blank');
    }
  };

  const handleOpenExternal = () => {
    if (finalUrl) {
      window.open(finalUrl, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError("Nao foi possivel carregar o PDF");
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div
        className={`pdf-modal ${fullscreen ? 'pdf-modal-fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pdf-modal-header">
          <div className="pdf-modal-title">
            <span className="pdf-modal-titulo">
              {titulo || `Edital ${editalNumero || ''}`}
            </span>
          </div>
          <div className="pdf-modal-actions">
            <button
              className="pdf-modal-btn"
              onClick={handleOpenExternal}
              title="Abrir em nova aba"
            >
              <ExternalLink size={18} />
            </button>
            <button
              className="pdf-modal-btn"
              onClick={handleDownload}
              title="Baixar PDF"
            >
              <Download size={18} />
            </button>
            <button
              className="pdf-modal-btn"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              className="pdf-modal-btn pdf-modal-close"
              onClick={onClose}
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pdf-modal-content">
          {loading && (
            <div className="pdf-loading">
              <Loader2 size={40} className="spinning" />
              <span>Carregando PDF...</span>
            </div>
          )}

          {error && (
            <div className="pdf-error">
              <span>{error}</span>
              <button onClick={handleOpenExternal} className="pdf-error-btn">
                Tentar abrir em nova aba
              </button>
            </div>
          )}

          {finalUrl && !error && (
            <iframe
              src={finalUrl}
              className="pdf-iframe"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={titulo || "Visualizador de PDF"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
