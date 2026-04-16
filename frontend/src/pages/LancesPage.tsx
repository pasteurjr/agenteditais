import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { Gavel, Clock, Trophy, XCircle, ExternalLink } from "lucide-react";
import { Card, DataTable, ActionButton } from "../components/common";
import type { Column } from "../components/common";

interface PregaoHoje {
  id: string;
  edital: string;
  orgao: string;
  hora: string;
  status: "aguardando" | "em_andamento" | "encerrado";
  tempoRestante?: string | null;
  url_portal?: string | null;
}

interface HistoricoLance {
  id: string;
  edital: string;
  orgao: string;
  data: string;
  nossoLance: number;
  lanceVencedor: number;
  vencedor: string;
  resultado: string;
}

export function LancesPage(_props?: PageProps) {
  const [pregoesHoje, setPregoesHoje] = useState<PregaoHoje[]>([]);
  const [historico, setHistorico] = useState<HistoricoLance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLances = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("editais_ia_access_token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resHoje, resHist] = await Promise.all([
        fetch("/api/lances/hoje", { headers }),
        fetch("/api/lances/historico", { headers }),
      ]);
      if (resHoje.ok) {
        const d = await resHoje.json();
        setPregoesHoje(d.pregoes || []);
      }
      if (resHist.ok) {
        const d = await resHist.json();
        setHistorico(d.historico || []);
      }
    } catch (e) {
      console.error("Erro ao carregar lances:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLances();
  }, [fetchLances]);

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
    const url = pregao.url_portal || "https://comprasnet.gov.br";
    window.open(url, "_blank");
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
    { key: "nossoLance", header: "Nosso Lance", render: (h) => h.nossoLance > 0 ? formatCurrency(h.nossoLance) : "—" },
    { key: "lanceVencedor", header: "Lance Vencedor", render: (h) => h.lanceVencedor > 0 ? formatCurrency(h.lanceVencedor) : "—" },
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

  const vitorias = historico.filter(h => h.resultado === "vitoria").length;
  const derrotas = historico.filter(h => h.resultado === "derrota").length;
  const taxaSucesso = historico.length > 0 ? Math.round((vitorias / historico.length) * 100) : 0;

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
            loading={loading}
            emptyMessage="Nenhum pregao agendado para hoje"
          />
        </Card>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon success"><Trophy size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{vitorias}</span>
              <span className="stat-label">Vitorias</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon error"><XCircle size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{derrotas}</span>
              <span className="stat-label">Derrotas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><Gavel size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{taxaSucesso}%</span>
              <span className="stat-label">Taxa de Sucesso</span>
            </div>
          </div>
        </div>

        <Card title="Historico de Lances" icon={<Gavel size={18} />}>
          <DataTable
            data={historico}
            columns={historicoColumns}
            idKey="id"
            loading={loading}
            emptyMessage="Nenhum historico de lances"
          />
        </Card>
      </div>
    </div>
  );
}
