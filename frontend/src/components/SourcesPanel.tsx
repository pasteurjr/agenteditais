import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, Globe, Scale } from "lucide-react";
import type { Source } from "../types";

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Garantir que sources é um array válido
  if (!sources || !Array.isArray(sources) || sources.length === 0) return null;

  // Separar fontes locais (RAG) de jurisprudência web
  const fontesLocais = sources.filter(s => s.doc_type !== "jurisprudencia");
  const fontesJuris = sources.filter(s => s.doc_type === "jurisprudencia");

  const totalFontes = sources.length;
  const temJuris = fontesJuris.length > 0;

  return (
    <div className="sources-panel">
      <button
        className="sources-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BookOpen size={14} />
        <span>Fontes utilizadas ({totalFontes})</span>
        {temJuris && (
          <span className="juris-indicator" title="Inclui jurisprudência da web">
            <Globe size={12} />
          </span>
        )}
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div className="sources-content">
          {/* Fontes locais (CLT, TRT3/MG) */}
          {fontesLocais.length > 0 && (
            <div className="sources-section">
              <div className="sources-section-header">
                <Scale size={12} />
                <span>Base de Conhecimento Local</span>
              </div>
              <ul className="sources-list">
                {fontesLocais.map((source, i) => (
                  <li key={`local-${i}`} className="source-item">
                    <span className="source-badge source-badge-local">
                      {source.doc_type === "clt" ? "CLT" : "TRT3/MG"}
                    </span>
                    <span className="source-detail">
                      Página {source.page}
                      {source.article && ` - ${source.article}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Jurisprudência da web */}
          {fontesJuris.length > 0 && (
            <div className="sources-section sources-section-juris">
              <div className="sources-section-header sources-section-header-juris">
                <Globe size={12} />
                <span>Jurisprudência Online (DataJud/CNJ)</span>
              </div>
              <ul className="sources-list">
                {fontesJuris.map((source, i) => (
                  <li key={`juris-${i}`} className="source-item source-item-juris">
                    <span className="source-badge source-badge-juris">
                      {source.tribunal || "JT"}
                    </span>
                    <span className="source-detail">
                      {source.numero_processo && (
                        <span className="juris-numero">{source.numero_processo}</span>
                      )}
                      {source.classe && (
                        <span className="juris-classe">{source.classe}</span>
                      )}
                      {source.orgao_julgador && (
                        <span className="juris-orgao">{source.orgao_julgador}</span>
                      )}
                      {source.data && (
                        <span className="juris-data">{source.data}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
