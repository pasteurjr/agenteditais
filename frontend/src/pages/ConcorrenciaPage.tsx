import { useState } from "react";
import { Users, Search, TrendingUp, Trophy, XCircle, BarChart2 } from "lucide-react";
import { Card, DataTable, ActionButton, FilterBar } from "../components/common";
import type { Column } from "../components/common";

interface Concorrente {
  id: string;
  nome: string;
  cnpj: string;
  vitorias: number;
  derrotas: number;
  taxaSucesso: number;
  ultimaAtuacao: string;
}

interface HistoricoConcorrente {
  id: string;
  data: string;
  edital: string;
  orgao: string;
  valor: number;
  resultado: "venceu" | "perdeu";
  nosParticipamos: boolean;
}

// Dados mock
const mockConcorrentes: Concorrente[] = [
  { id: "1", nome: "Lab Solutions Ltda", cnpj: "12.345.678/0001-00", vitorias: 15, derrotas: 8, taxaSucesso: 65, ultimaAtuacao: "05/02/2026" },
  { id: "2", nome: "TechMed Brasil", cnpj: "23.456.789/0001-11", vitorias: 12, derrotas: 10, taxaSucesso: 55, ultimaAtuacao: "03/02/2026" },
  { id: "3", nome: "MedEquip Comercio", cnpj: "34.567.890/0001-22", vitorias: 8, derrotas: 12, taxaSucesso: 40, ultimaAtuacao: "01/02/2026" },
  { id: "4", nome: "Diagnostica SP", cnpj: "45.678.901/0001-33", vitorias: 20, derrotas: 5, taxaSucesso: 80, ultimaAtuacao: "08/02/2026" },
];

const mockHistorico: HistoricoConcorrente[] = [
  { id: "1", data: "05/02/2026", edital: "PE-050/2026", orgao: "UFMG", valor: 43500, resultado: "venceu", nosParticipamos: true },
  { id: "2", data: "01/02/2026", edital: "PE-032/2026", orgao: "USP", valor: 30000, resultado: "perdeu", nosParticipamos: true },
  { id: "3", data: "28/01/2026", edital: "PE-028/2026", orgao: "UNICAMP", valor: 50500, resultado: "venceu", nosParticipamos: true },
  { id: "4", data: "25/01/2026", edital: "PE-020/2026", orgao: "UNESP", valor: 38000, resultado: "perdeu", nosParticipamos: false },
];

export function ConcorrenciaPage() {
  const [concorrentes] = useState<Concorrente[]>(mockConcorrentes);
  const [selectedConcorrente, setSelectedConcorrente] = useState<Concorrente | null>(null);
  const [historico] = useState<HistoricoConcorrente[]>(mockHistorico);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConcorrentes = concorrentes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj.includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const concorrentesColumns: Column<Concorrente>[] = [
    { key: "nome", header: "Empresa", sortable: true },
    { key: "cnpj", header: "CNPJ" },
    {
      key: "vitorias",
      header: "Vitorias",
      render: (c) => <span className="text-success">{c.vitorias}</span>,
      sortable: true,
    },
    {
      key: "derrotas",
      header: "Derrotas",
      render: (c) => <span className="text-danger">{c.derrotas}</span>,
      sortable: true,
    },
    {
      key: "taxaSucesso",
      header: "Taxa Sucesso",
      render: (c) => (
        <span className={c.taxaSucesso >= 60 ? "text-success" : c.taxaSucesso >= 40 ? "text-warning" : "text-danger"}>
          {c.taxaSucesso}%
        </span>
      ),
      sortable: true,
    },
    { key: "ultimaAtuacao", header: "Ultima Atuacao", sortable: true },
    {
      key: "acoes",
      header: "",
      width: "80px",
      render: (c) => (
        <div className="table-actions">
          <button title="Ver detalhes" onClick={() => setSelectedConcorrente(c)}><Search size={16} /></button>
          <button title="Analise" onClick={() => {}}><BarChart2 size={16} /></button>
        </div>
      ),
    },
  ];

  const historicoColumns: Column<HistoricoConcorrente>[] = [
    { key: "data", header: "Data", sortable: true },
    { key: "edital", header: "Edital" },
    { key: "orgao", header: "Orgao" },
    { key: "valor", header: "Valor", render: (h) => formatCurrency(h.valor) },
    {
      key: "resultado",
      header: "Resultado",
      render: (h) => (
        <span className={`status-badge ${h.resultado === "venceu" ? "status-badge-success" : "status-badge-error"}`}>
          {h.resultado === "venceu" ? <><Trophy size={12} /> Venceu</> : <><XCircle size={12} /> Perdeu</>}
        </span>
      ),
    },
    {
      key: "nosParticipamos",
      header: "Nos",
      render: (h) => h.nosParticipamos ? <span className="tag">Participamos</span> : "-",
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
            onRowClick={setSelectedConcorrente}
            selectedId={selectedConcorrente?.id}
            emptyMessage="Nenhum concorrente encontrado"
          />
        </Card>

        {selectedConcorrente && (
          <Card
            title={`Detalhes: ${selectedConcorrente.nome}`}
            icon={<TrendingUp size={18} />}
          >
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
                  <label>Atuacao</label>
                  <span>Equipamentos laboratoriais</span>
                </div>
                <div className="info-item">
                  <label>Taxa de Sucesso</label>
                  <span className={selectedConcorrente.taxaSucesso >= 60 ? "text-success" : "text-warning"}>
                    {selectedConcorrente.taxaSucesso}%
                  </span>
                </div>
              </div>

              <div className="stats-row compact">
                <div className="stat-card small">
                  <div className="stat-icon success"><Trophy size={20} /></div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedConcorrente.vitorias}</span>
                    <span className="stat-label">Vitorias</span>
                  </div>
                </div>
                <div className="stat-card small">
                  <div className="stat-icon error"><XCircle size={20} /></div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedConcorrente.derrotas}</span>
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
