import { useState, useEffect, useCallback } from "react";
import type { PageProps } from "../types";
import { Users, Search, TrendingUp, Trophy, XCircle, BarChart2, AlertTriangle, Target, Shield, Star } from "lucide-react";
import { Card, DataTable, FilterBar, FormField, SelectInput } from "../components/common";
import type { Column } from "../components/common";
import { fetchMercadoShare } from "../api/sprint7";
import { getQualidadeConcorrente, getQualidadeOrgao } from "../api/sprint9";

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

interface ShareData {
  nome: string;
  share: number;
  is_empresa: boolean;
}

export function ConcorrenciaPage({ onSendToChat }: PageProps) {
  const [concorrentes, setConcorrentes] = useState<Concorrente[]>([]);
  const [selectedConcorrente, setSelectedConcorrente] = useState<Concorrente | null>(null);
  const [historico, setHistorico] = useState<HistoricoConcorrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Sprint 7 UC-ME03 — share state
  const [shareData, setShareData] = useState<ShareData[]>([]);
  const [shareStats, setShareStats] = useState<any>({});
  const [alertas, setAlertas] = useState<string[]>([]);
  const [shareSegmento, setShareSegmento] = useState("");
  const [shareUF, setShareUF] = useState("");
  const [sharePeriodo, setSharePeriodo] = useState("180");

  // Sprint 9 UC-SC02 — Qualidade Concorrente
  const [qualidades, setQualidades] = useState<Record<string, { score: number; badge: string; desclassificacoes: number }>>({});
  const [qualidadeOrgao, setQualidadeOrgao] = useState<{ media: number; total: number } | null>(null);

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

  const fetchShare = useCallback(async () => {
    try {
      const data = await fetchMercadoShare({
        segmento: shareSegmento || undefined,
        uf: shareUF || undefined,
        periodo_dias: parseInt(sharePeriodo) || 180,
      });
      setShareData(data.share || []);
      setShareStats(data.stat_cards || {});
      setAlertas(data.alertas || []);
    } catch (e) {
      console.error("Erro ao carregar share:", e);
    }
  }, [shareSegmento, shareUF, sharePeriodo]);

  useEffect(() => {
    fetchConcorrentes();
    fetchShare();
  }, [fetchConcorrentes, fetchShare]);

  // Sprint 9 — fetch qualidade for each concorrente
  useEffect(() => {
    if (concorrentes.length === 0) return;
    const fetchAllQualidades = async () => {
      const results: Record<string, { score: number; badge: string; desclassificacoes: number }> = {};
      await Promise.all(
        concorrentes.map(async (c) => {
          try {
            const data = await getQualidadeConcorrente(c.id);
            results[c.id] = {
              score: data.score ?? 0,
              badge: data.badge ?? "",
              desclassificacoes: data.desclassificacoes ?? 0,
            };
          } catch {
            results[c.id] = { score: 0, badge: "Sem dados", desclassificacoes: 0 };
          }
        })
      );
      setQualidades(results);
    };
    fetchAllQualidades();
  }, [concorrentes]);

  // Sprint 9 — fetch qualidade media do orgao
  useEffect(() => {
    const orgaoNome = shareStats.orgao || "Orgao Geral";
    const fetchOrgao = async () => {
      try {
        const data = await getQualidadeOrgao(orgaoNome);
        setQualidadeOrgao({ media: data.media ?? 0, total: data.total_avaliados ?? 0 });
      } catch {
        // fallback: compute from loaded qualidades
        const vals = Object.values(qualidades).map(q => q.score);
        if (vals.length > 0) {
          const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
          setQualidadeOrgao({ media: avg, total: vals.length });
        }
      }
    };
    fetchOrgao();
  }, [concorrentes, qualidades, shareStats.orgao]);

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const maxShare = Math.max(...shareData.map(s => s.share), 1);

  const concorrentesColumns: Column<Concorrente>[] = [
    { key: "nome", header: "Empresa", sortable: true,
      render: (c) => (
        <span>
          {c.nome}
          {alertas.includes(c.nome) && (
            <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
              ALERTA
            </span>
          )}
        </span>
      ),
    },
    { key: "cnpj", header: "CNPJ" },
    {
      key: "editais_ganhos", header: "Vitorias",
      render: (c) => <span className="text-success">{c.editais_ganhos}</span>,
      sortable: true,
    },
    {
      key: "derrotas", header: "Derrotas",
      render: (c) => <span className="text-danger">{c.editais_participados - c.editais_ganhos}</span>,
      sortable: true,
    },
    {
      key: "taxa_vitoria", header: "Taxa Sucesso",
      render: (c) => (
        <span className={c.taxa_vitoria >= 60 ? "text-success" : c.taxa_vitoria >= 40 ? "text-warning" : "text-danger"}>
          {c.taxa_vitoria}%
        </span>
      ),
      sortable: true,
    },
    {
      key: "preco_medio", header: "Preco Medio",
      render: (c) => c.preco_medio ? formatCurrency(c.preco_medio) : "—",
    },
    {
      key: "qualidade", header: "Qualidade", width: "110px",
      render: (c) => {
        const q = qualidades[c.id];
        if (!q) return <span style={{ color: "#94a3b8", fontSize: 12 }}>...</span>;
        const cls = q.score >= 70 ? "status-badge-success"
          : q.score >= 40 ? "status-badge-warning"
          : "status-badge-error";
        const label = q.score >= 70 ? "Alta" : q.score >= 40 ? "Media" : "Baixa";
        return <span className={`status-badge ${cls}`}>{label} ({q.score})</span>;
      },
    },
    {
      key: "acoes", header: "", width: "80px",
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
      key: "resultado", header: "Resultado",
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
            <p>Inteligencia competitiva, share de mercado e historico</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Sprint 7 — Stat Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon info"><Users size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{shareStats.concorrentes_conhecidos ?? concorrentes.length}</span>
              <span className="stat-label">Concorrentes Conhecidos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><Target size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{shareStats.nossa_taxa ?? "—"}%</span>
              <span className="stat-label">Nossa Taxa</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{shareStats.maior_ameaca || "—"}</span>
              <span className="stat-label">Maior Ameaca</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><BarChart2 size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{shareStats.editais_disputados ?? 0}</span>
              <span className="stat-label">Editais Disputados</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{
              background: qualidadeOrgao && qualidadeOrgao.media >= 70 ? "#f0fdf4"
                : qualidadeOrgao && qualidadeOrgao.media >= 40 ? "#fefce8" : "#fef2f2",
              color: qualidadeOrgao && qualidadeOrgao.media >= 70 ? "#16a34a"
                : qualidadeOrgao && qualidadeOrgao.media >= 40 ? "#ca8a04" : "#dc2626",
            }}>
              <Star size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{qualidadeOrgao ? `${qualidadeOrgao.media}%` : "—"}</span>
              <span className="stat-label">Qualidade Media do Orgao</span>
            </div>
          </div>
        </div>

        {/* Share de Mercado */}
        <Card title="Share de Mercado" icon={<BarChart2 size={18} />}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <FormField label="Segmento">
              <SelectInput value={shareSegmento} onChange={setShareSegmento} options={[
                { value: "", label: "Todos" }, { value: "hematologia", label: "Hematologia" },
                { value: "bioquimica", label: "Bioquimica" }, { value: "coagulacao", label: "Coagulacao" },
              ]} />
            </FormField>
            <FormField label="UF">
              <SelectInput value={shareUF} onChange={setShareUF} options={[
                { value: "", label: "Todas" }, { value: "SP", label: "SP" }, { value: "RJ", label: "RJ" },
                { value: "MG", label: "MG" }, { value: "RS", label: "RS" }, { value: "PR", label: "PR" },
              ]} />
            </FormField>
            <FormField label="Periodo">
              <SelectInput value={sharePeriodo} onChange={setSharePeriodo} options={[
                { value: "90", label: "3 meses" }, { value: "180", label: "6 meses" }, { value: "365", label: "12 meses" },
              ]} />
            </FormField>
          </div>

          {shareData.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shareData.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 150, fontSize: 13, fontWeight: s.is_empresa ? 700 : 400, color: s.is_empresa ? "#2563eb" : "#374151" }}>
                    {s.nome}
                  </span>
                  <div style={{ flex: 1, height: 24, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${(s.share / maxShare) * 100}%`, height: "100%",
                      background: s.is_empresa ? "#3b82f6" : "#9ca3af", borderRadius: 4,
                      display: "flex", alignItems: "center", paddingLeft: 8,
                    }}>
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{s.share}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              Sem dados de share para o periodo selecionado
            </div>
          )}
        </Card>

        {/* Tabela Concorrentes */}
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
                {qualidades[selectedConcorrente.id] && (
                  <div className="stat-card small">
                    <div className="stat-icon" style={{
                      background: qualidades[selectedConcorrente.id].desclassificacoes > 0 ? "#fef2f2" : "#f0fdf4",
                      color: qualidades[selectedConcorrente.id].desclassificacoes > 0 ? "#dc2626" : "#16a34a",
                    }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">{qualidades[selectedConcorrente.id].desclassificacoes}</span>
                      <span className="stat-label">Desclassificacoes</span>
                    </div>
                  </div>
                )}
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
