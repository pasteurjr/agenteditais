import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { Users, Search, TrendingUp, Trophy, XCircle, BarChart2 } from "lucide-react";
import { Card, DataTable, FilterBar } from "../components/common";
import type { Column } from "../components/common";

interface Concorrente {
  id: string;
  nome: string;
  cnpj: string;
  editais_participados: number;
  editais_ganhos: number;
  taxa_vitoria: number;
  preco_medio: number | null;
}

interface HistoricoConcorrente {
  id: string;
  data: string;
  edital: string;
  orgao: string;
  valor: number;
  resultado: string;
}

export function ConcorrenciaPage({ onSendToChat }: PageProps) {
  const [concorrentes, setConcorrentes] = useState<Concorrente[]>([]);
  const [selectedConcorrente, setSelectedConcorrente] = useState<Concorrente | null>(null);
  const [historico, setHistorico] = useState<HistoricoConcorrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchConcorrentes = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("editais_ia_access_token");
    try {
      const res = await fetch("/api/concorrentes/listar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConcorrentes(data.concorrentes || []);
      }
    } catch (e) {
      console.error("Erro ao carregar concorrentes:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConcorrentes();
  }, [fetchConcorrentes]);

  const handleSelectConcorrente = useCallback(async (c: Concorrente) => {
    setSelectedConcorrente(c);
    const token = localStorage.getItem("editais_ia_access_token");
    try {
      const res = await fetch(`/api/crud/precos-historicos?limit=20&search=${encodeURIComponent(c.nome)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).map((p: any) => ({
          id: p.id,
          data: p.data_registro ? new Date(p.data_registro).toLocaleDateString("pt-BR") : "—",
          edital: p.edital_numero || "—",
          orgao: p.orgao || "—",
          valor: p.preco_vencedor ? parseFloat(p.preco_vencedor) : 0,
          resultado: p.resultado || "—",
        }));
        setHistorico(items);
      }
    } catch (e) {
      console.error("Erro ao carregar historico:", e);
      setHistorico([]);
    }
  }, []);

  const filteredConcorrentes = concorrentes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cnpj || "").includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const concorrentesColumns: Column<Concorrente>[] = [
    { key: "nome", header: "Empresa", sortable: true },
    { key: "cnpj", header: "CNPJ" },
    {
      key: "editais_ganhos",
      header: "Vitorias",
      render: (c) => <span className="text-success">{c.editais_ganhos}</span>,
      sortable: true,
    },
    {
      key: "derrotas",
      header: "Derrotas",
      render: (c) => <span className="text-danger">{c.editais_participados - c.editais_ganhos}</span>,
      sortable: true,
    },
    {
      key: "taxa_vitoria",
      header: "Taxa Sucesso",
      render: (c) => (
        <span className={c.taxa_vitoria >= 60 ? "text-success" : c.taxa_vitoria >= 40 ? "text-warning" : "text-danger"}>
          {c.taxa_vitoria}%
        </span>
      ),
      sortable: true,
    },
    {
      key: "preco_medio",
      header: "Preco Medio",
      render: (c) => c.preco_medio ? formatCurrency(c.preco_medio) : "—",
    },
    {
      key: "acoes",
      header: "",
      width: "80px",
      render: (c) => (
        <div className="table-actions">
          <button title="Ver detalhes" onClick={() => handleSelectConcorrente(c)}><Search size={16} /></button>
          <button title="Analisar via IA" onClick={() => onSendToChat?.(`analise o concorrente ${c.nome}`)}><BarChart2 size={16} /></button>
        </div>
      ),
    },
  ];

  const historicoColumns: Column<HistoricoConcorrente>[] = [
    { key: "data", header: "Data", sortable: true },
    { key: "edital", header: "Edital" },
    { key: "orgao", header: "Orgao" },
    { key: "valor", header: "Valor", render: (h) => h.valor > 0 ? formatCurrency(h.valor) : "—" },
    {
      key: "resultado",
      header: "Resultado",
      render: (h) => (
        <span className={`status-badge ${h.resultado === "vitoria" ? "status-badge-success" : "status-badge-error"}`}>
          {h.resultado === "vitoria" ? <><Trophy size={12} /> Vitoria</> : <><XCircle size={12} /> Derrota</>}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Users size={24} />
          <div>
            <h1>Analise de Concorrentes</h1>
            <p>Inteligencia competitiva e historico de concorrentes</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Concorrentes Conhecidos" icon={<Users size={18} />}>
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome ou CNPJ..."
          />
          <DataTable
            data={filteredConcorrentes}
            columns={concorrentesColumns}
            idKey="id"
            loading={loading}
            onRowClick={handleSelectConcorrente}
            selectedId={selectedConcorrente?.id}
            emptyMessage="Nenhum concorrente encontrado"
          />
        </Card>

        {selectedConcorrente && (
          <Card title={`Detalhes: ${selectedConcorrente.nome}`} icon={<TrendingUp size={18} />}>
            <div className="concorrente-detalhes">
              <div className="info-grid">
                <div className="info-item">
                  <label>Razao Social</label>
                  <span>{selectedConcorrente.nome}</span>
                </div>
                <div className="info-item">
                  <label>CNPJ</label>
                  <span>{selectedConcorrente.cnpj}</span>
                </div>
                <div className="info-item">
                  <label>Preco Medio</label>
                  <span>{selectedConcorrente.preco_medio ? formatCurrency(selectedConcorrente.preco_medio) : "—"}</span>
                </div>
                <div className="info-item">
                  <label>Taxa de Sucesso</label>
                  <span className={selectedConcorrente.taxa_vitoria >= 60 ? "text-success" : "text-warning"}>
                    {selectedConcorrente.taxa_vitoria}%
                  </span>
                </div>
              </div>

              <div className="stats-row compact">
                <div className="stat-card small">
                  <div className="stat-icon success"><Trophy size={20} /></div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedConcorrente.editais_ganhos}</span>
                    <span className="stat-label">Vitorias</span>
                  </div>
                </div>
                <div className="stat-card small">
                  <div className="stat-icon error"><XCircle size={20} /></div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedConcorrente.editais_participados - selectedConcorrente.editais_ganhos}</span>
                    <span className="stat-label">Derrotas</span>
                  </div>
                </div>
              </div>

              <h4>Historico de Licitacoes</h4>
              <DataTable
                data={historico}
                columns={historicoColumns}
                idKey="id"
                emptyMessage="Nenhum historico"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
