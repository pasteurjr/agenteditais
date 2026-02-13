import { useState } from "react";
import { Gavel, Clock, Trophy, XCircle, ExternalLink } from "lucide-react";
import { Card, DataTable, ActionButton } from "../components/common";
import type { Column } from "../components/common";

interface PregaoHoje {
  id: string;
  edital: string;
  orgao: string;
  hora: string;
  status: "aguardando" | "em_andamento" | "encerrado";
  tempoRestante?: string;
}

interface HistoricoLance {
  id: string;
  edital: string;
  orgao: string;
  data: string;
  nossoLance: number;
  lanceVencedor: number;
  vencedor: string;
  resultado: "vitoria" | "derrota";
}

// Dados mock
const mockPregoesHoje: PregaoHoje[] = [
  { id: "1", edital: "PE-001/2026", orgao: "UFMG", hora: "14:00", status: "aguardando", tempoRestante: "2 horas" },
  { id: "2", edital: "PE-088/2026", orgao: "USP", hora: "10:00", status: "em_andamento" },
  { id: "3", edital: "PE-050/2026", orgao: "CEMIG", hora: "09:00", status: "encerrado" },
];

const mockHistorico: HistoricoLance[] = [
  { id: "1", edital: "PE-050/2026", orgao: "UFMG", data: "05/02/2026", nossoLance: 45000, lanceVencedor: 43500, vencedor: "Lab Solutions", resultado: "derrota" },
  { id: "2", edital: "PE-032/2026", orgao: "USP", data: "01/02/2026", nossoLance: 28000, lanceVencedor: 28000, vencedor: "Aquila", resultado: "vitoria" },
  { id: "3", edital: "PE-028/2026", orgao: "UNICAMP", data: "28/01/2026", nossoLance: 52000, lanceVencedor: 50500, vencedor: "TechMed", resultado: "derrota" },
  { id: "4", edital: "PE-020/2026", orgao: "UNESP", data: "25/01/2026", nossoLance: 35000, lanceVencedor: 35000, vencedor: "Aquila", resultado: "vitoria" },
];

export function LancesPage() {
  const [pregoesHoje] = useState<PregaoHoje[]>(mockPregoesHoje);
  const [historico] = useState<HistoricoLance[]>(mockHistorico);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getStatusBadge = (status: PregaoHoje["status"]) => {
    switch (status) {
      case "aguardando":
        return <span className="status-badge status-badge-warning"><Clock size={12} /> Aguardando</span>;
      case "em_andamento":
        return <span className="status-badge status-badge-success pulse"><Gavel size={12} /> Em andamento</span>;
      case "encerrado":
        return <span className="status-badge status-badge-neutral">Encerrado</span>;
    }
  };

  const handleAbrirSalaLances = (pregao: PregaoHoje) => {
    // TODO: Abrir sala de lances do portal
    console.log("Abrindo sala de lances:", pregao.edital);
    window.open("https://comprasnet.gov.br", "_blank");
  };

  const pregoesColumns: Column<PregaoHoje>[] = [
    {
      key: "status_icon",
      header: "",
      width: "40px",
      render: (p) => {
        if (p.status === "em_andamento") return <span className="status-dot pulse green" />;
        if (p.status === "aguardando") return <span className="status-dot yellow" />;
        return <span className="status-dot gray" />;
      },
    },
    { key: "edital", header: "Edital" },
    { key: "orgao", header: "Orgao" },
    { key: "hora", header: "Hora" },
    { key: "status", header: "Status", render: (p) => getStatusBadge(p.status) },
    {
      key: "tempo",
      header: "",
      render: (p) => p.tempoRestante ? <span className="tempo-restante">em {p.tempoRestante}</span> : null,
    },
    {
      key: "acoes",
      header: "",
      width: "100px",
      render: (p) => (
        <ActionButton
          icon={<ExternalLink size={14} />}
          label="Abrir Sala"
          onClick={() => handleAbrirSalaLances(p)}
          disabled={p.status === "encerrado"}
        />
      ),
    },
  ];

  const historicoColumns: Column<HistoricoLance>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "data", header: "Data", sortable: true },
    { key: "nossoLance", header: "Nosso Lance", render: (h) => formatCurrency(h.nossoLance) },
    { key: "lanceVencedor", header: "Lance Vencedor", render: (h) => formatCurrency(h.lanceVencedor) },
    { key: "vencedor", header: "Vencedor" },
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

  const estatisticas = {
    vitorias: historico.filter(h => h.resultado === "vitoria").length,
    derrotas: historico.filter(h => h.resultado === "derrota").length,
    taxaSucesso: Math.round((historico.filter(h => h.resultado === "vitoria").length / historico.length) * 100),
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Gavel size={24} />
          <div>
            <h1>Acompanhamento de Lances</h1>
            <p>Pregoes em andamento e historico</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Pregoes Hoje" icon={<Clock size={18} />}>
          <DataTable
            data={pregoesHoje}
            columns={pregoesColumns}
            idKey="id"
            emptyMessage="Nenhum pregao agendado para hoje"
          />
        </Card>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon success"><Trophy size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{estatisticas.vitorias}</span>
              <span className="stat-label">Vitorias</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon error"><XCircle size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{estatisticas.derrotas}</span>
              <span className="stat-label">Derrotas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><Gavel size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{estatisticas.taxaSucesso}%</span>
              <span className="stat-label">Taxa de Sucesso</span>
            </div>
          </div>
        </div>

        <Card title="Historico de Lances" icon={<Gavel size={18} />}>
          <DataTable
            data={historico}
            columns={historicoColumns}
            idKey="id"
            emptyMessage="Nenhum historico de lances"
          />
        </Card>
      </div>
    </div>
  );
}
