import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Download,
  Save,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Globe,
  Database,
  Package,
  Eye,
} from "lucide-react";
import type { Edital } from "../types";

interface EditalCardProps {
  edital: Edital;
  onSalvar?: (edital: Edital) => void;
  onVerPdf?: (edital: Edital) => void;
  onBaixarPdf?: (edital: Edital) => void;
  salvo?: boolean;
}

// Cores para badges de fonte
const fonteCores: Record<string, { bg: string; text: string; border: string }> = {
  'PNCP (API)': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  'PNCP': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  'ComprasNet': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'BEC-SP': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  'Compras MG': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  'Licitacoes-e': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'Portal Compras Publicas': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  'Web': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
};

function formatarValor(valor?: number): string {
  if (!valor) return '';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data?: string): string {
  if (!data) return '';
  try {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return data;
  }
}

export function EditalCard({ edital, onSalvar, onVerPdf, onBaixarPdf, salvo = false }: EditalCardProps) {
  const [salvando, setSalvando] = useState(false);

  const fonteNome = edital.fonte || 'Web';
  const cores = fonteCores[fonteNome] || fonteCores['Web'];
  const ehApi = edital.fonte_tipo === 'api' || fonteNome.includes('PNCP');

  const handleSalvar = async () => {
    if (onSalvar && !salvo) {
      setSalvando(true);
      await onSalvar(edital);
      setSalvando(false);
    }
  };

  const handleVerPdf = () => {
    if (onVerPdf) {
      onVerPdf(edital);
    }
  };

  const handleBaixarPdf = () => {
    if (onBaixarPdf) {
      onBaixarPdf(edital);
    }
  };

  const temPdf = !!(edital.pdf_url || (edital.cnpj_orgao && edital.ano_compra && edital.seq_compra));

  return (
    <div className="edital-card">
      {/* Header com numero e fonte */}
      <div className="edital-header">
        <div className="edital-numero-container">
          <span className="edital-numero">PE {edital.numero}</span>
          {edital.dados_completos && (
            <span className="dados-completos-badge" title="Dados completos do PNCP">
              <Database size={12} />
            </span>
          )}
        </div>
        <span className={`fonte-badge ${cores.bg} ${cores.text} ${cores.border}`}>
          {ehApi ? <Database size={12} /> : <Globe size={12} />}
          <span>{fonteNome}</span>
        </span>
      </div>

      {/* Orgao e localização */}
      <div className="edital-orgao">
        <Building2 size={14} />
        <span>{edital.orgao}</span>
        {(edital.cidade || edital.uf) && (
          <span className="edital-local">
            <MapPin size={12} />
            {edital.cidade ? `${edital.cidade}/` : ''}{edital.uf || ''}
          </span>
        )}
      </div>

      {/* Objeto */}
      <div className="edital-objeto">
        {edital.objeto?.substring(0, 200)}
        {edital.objeto && edital.objeto.length > 200 && '...'}
      </div>

      {/* Valor e data */}
      <div className="edital-info-row">
        {edital.valor_referencia && (
          <span className="edital-valor">
            <DollarSign size={14} />
            {formatarValor(edital.valor_referencia)}
          </span>
        )}
        {edital.data_abertura && (
          <span className="edital-data">
            <Calendar size={14} />
            Abertura: {formatarData(edital.data_abertura)}
          </span>
        )}
      </div>

      {/* Indicador de itens */}
      {edital.total_itens && edital.total_itens > 0 && (
        <div className="edital-itens-indicator">
          <Package size={14} />
          <span>{edital.total_itens} {edital.total_itens === 1 ? 'item' : 'itens'}</span>
        </div>
      )}

      {/* Botoes de ação */}
      <div className="edital-actions">
        {edital.url && (
          <a
            href={edital.url}
            target="_blank"
            rel="noopener noreferrer"
            className="edital-btn edital-btn-link"
            title="Ver no portal"
          >
            <ExternalLink size={16} />
            <span>Portal</span>
          </a>
        )}

        {temPdf && (
          <>
            <button
              className="edital-btn edital-btn-pdf"
              onClick={handleVerPdf}
              title="Visualizar PDF"
            >
              <Eye size={16} />
              <span>Ver PDF</span>
            </button>

            <button
              className="edital-btn edital-btn-download"
              onClick={handleBaixarPdf}
              title="Baixar PDF"
            >
              <Download size={16} />
              <span>Baixar</span>
            </button>
          </>
        )}

        <button
          className={`edital-btn edital-btn-salvar ${salvo ? 'salvo' : ''}`}
          onClick={handleSalvar}
          disabled={salvo || salvando}
          title={salvo ? 'Ja salvo' : 'Salvar edital'}
        >
          <Save size={16} />
          <span>{salvo ? 'Salvo' : salvando ? 'Salvando...' : 'Salvar'}</span>
        </button>
      </div>
    </div>
  );
}
