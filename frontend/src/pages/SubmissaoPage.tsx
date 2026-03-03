import { useState, useEffect } from "react";
import type { PageProps } from "../types";
import { Send, CheckSquare, Upload, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, TextInput } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudUpdate } from "../api/crud";

interface PropostaPronta {
  id: string;
  edital: string;
  orgao: string;
  produto: string;
  valor: number;
  dataAbertura: string;
  horaAbertura: string;
  status: "aguardando" | "enviada" | "aprovada";
  checklist: {
    propostaTecnica: boolean;
    precoDefinido: boolean;
    documentosAnexados: number;
    documentosTotal: number;
    revisaoFinal: boolean;
  };
}

function mapCrudToPropostaPronta(item: Record<string, unknown>): PropostaPronta {
  const statusRaw = String(item.status ?? "rascunho");
  let status: PropostaPronta["status"] = "aguardando";
  if (statusRaw === "enviada") status = "enviada";
  else if (statusRaw === "aprovada") status = "aprovada";
  else if (statusRaw === "rascunho" || statusRaw === "revisao") status = "aguardando";

  const dataAbertura = String(item.data_abertura ?? item.dataAbertura ?? "");
  let dataPart = "";
  let horaPart = "";
  if (dataAbertura.includes("T")) {
    [dataPart, horaPart] = dataAbertura.split("T");
    horaPart = horaPart?.slice(0, 5) ?? "";
  } else if (dataAbertura.includes(" ")) {
    [dataPart, horaPart] = dataAbertura.split(" ");
  } else {
    dataPart = dataAbertura;
    horaPart = "00:00";
  }

  const precoDefinido = Number(item.preco_unitario ?? item.precoUnitario ?? 0) > 0;
  const temTexto = Boolean(item.texto_tecnico ?? item.conteudo);

  return {
    id: String(item.id ?? ""),
    edital: String(item.numero_edital ?? item.edital ?? ""),
    orgao: String(item.orgao ?? ""),
    produto: String(item.nome_produto ?? item.produto ?? ""),
    valor: Number(item.preco_total ?? item.valorTotal ?? 0),
    dataAbertura: dataPart,
    horaAbertura: horaPart || "00:00",
    status,
    checklist: {
      propostaTecnica: temTexto,
      precoDefinido,
      documentosAnexados: Number(item.documentos_anexados ?? 0),
      documentosTotal: Number(item.documentos_total ?? 3),
      revisaoFinal: status !== "aguardando",
    },
  };
}

export function SubmissaoPage(_props?: PageProps) {
  const [propostas, setPropostas] = useState<PropostaPronta[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [selectedProposta, setSelectedProposta] = useState<PropostaPronta | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [uploadTipo, setUploadTipo] = useState("");
  const [uploadObs, setUploadObs] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoadingLista(true);
      try {
        // Listar propostas que estão prontas ou enviadas
        const res = await crudList("propostas", { limit: 100 });
        const items = res.items as Record<string, unknown>[];
        // Filtrar apenas propostas relevantes para submissão (não rascunho simples)
        const filtered = items.filter((item) => {
          const s = String(item.status ?? "");
          return s !== "cancelada" && s !== "perdida";
        });
        setPropostas(filtered.map(mapCrudToPropostaPronta));
      } catch {
        setPropostas([]);
      } finally {
        setLoadingLista(false);
      }
    };
    loadData();
  }, []);

  const handleMarcarEnviada = async (id: string) => {
    setLoadingStatus(true);
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      const res = await fetch(`/api/propostas/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "enviada" }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      const updated = propostas.map((p) =>
        p.id === id ? { ...p, status: "enviada" as const, checklist: { ...p.checklist, revisaoFinal: true } } : p
      );
      setPropostas(updated);
      if (selectedProposta?.id === id) {
        setSelectedProposta(updated.find((p) => p.id === id) ?? null);
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleAprovar = async (id: string) => {
    setLoadingStatus(true);
    try {
      const token = localStorage.getItem("editais_ia_access_token");
      const res = await fetch(`/api/propostas/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "aprovada" }),
      });
      if (!res.ok) throw new Error("Erro ao aprovar proposta");
      const updated = propostas.map((p) =>
        p.id === id ? { ...p, status: "aprovada" as const } : p
      );
      setPropostas(updated);
      if (selectedProposta?.id === id) {
        setSelectedProposta(updated.find((p) => p.id === id) ?? null);
      }
    } catch (err) {
      console.error("Erro ao aprovar proposta:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleAbrirPortal = (proposta: PropostaPronta) => {
    window.open("https://pncp.gov.br", "_blank");
    console.log("Abrindo portal para:", proposta.edital);
  };

  const handleAnexarDocumento = () => {
    setShowUploadModal(true);
  };

  const handleSalvarDocumento = async () => {
    if (!selectedProposta || !uploadFile) return;
    try {
      // Atualizar contagem de documentos no backend
      const novoAnexado = (selectedProposta.checklist.documentosAnexados ?? 0) + 1;
      await crudUpdate("propostas", selectedProposta.id, {
        documentos_anexados: novoAnexado,
      });
      const updated = propostas.map((p) =>
        p.id === selectedProposta.id
          ? { ...p, checklist: { ...p.checklist, documentosAnexados: novoAnexado } }
          : p
      );
      setPropostas(updated);
      setSelectedProposta(updated.find((p) => p.id === selectedProposta.id) ?? null);
    } catch (err) {
      console.error("Erro ao anexar documento:", err);
    }
    setShowUploadModal(false);
    setUploadTipo("");
    setUploadObs("");
    setUploadFile(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getStatusBadge = (status: PropostaPronta["status"]) => {
    switch (status) {
      case "aguardando":
        return <span className="status-badge status-badge-warning"><Clock size={12} /> Aguardando</span>;
      case "enviada":
        return <span className="status-badge status-badge-info"><Send size={12} /> Enviada</span>;
      case "aprovada":
        return <span className="status-badge status-badge-success"><CheckCircle size={12} /> Aprovada</span>;
    }
  };

  const getChecklistProgress = (checklist: PropostaPronta["checklist"]) => {
    let done = 0;
    const total = 4;
    if (checklist.propostaTecnica) done++;
    if (checklist.precoDefinido) done++;
    if (checklist.documentosAnexados >= checklist.documentosTotal) done++;
    if (checklist.revisaoFinal) done++;
    return { done, total };
  };

  const columns: Column<PropostaPronta>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "produto", header: "Produto" },
    { key: "valor", header: "Valor", render: (p) => formatCurrency(p.valor) },
    {
      key: "abertura",
      header: "Abertura",
      render: (p) => p.dataAbertura ? `${p.dataAbertura} ${p.horaAbertura}` : "-",
      sortable: true,
    },
    { key: "status", header: "Status", render: (p) => getStatusBadge(p.status) },
    {
      key: "progresso",
      header: "Checklist",
      render: (p) => {
        const { done, total } = getChecklistProgress(p.checklist);
        return <span className={`progress-badge ${done === total ? "complete" : ""}`}>{done}/{total}</span>;
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Send size={24} />
          <div>
            <h1>Submissao de Propostas</h1>
            <p>Preparacao e envio de propostas aos portais</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Propostas Prontas para Envio" icon={<Send size={18} />}>
          <DataTable
            data={propostas}
            columns={columns}
            idKey="id"
            onRowClick={setSelectedProposta}
            selectedId={selectedProposta?.id}
            emptyMessage={loadingLista ? "Carregando..." : "Nenhuma proposta pronta para envio"}
          />
        </Card>

        {selectedProposta && (
          <Card
            title={`Checklist de Submissao: ${selectedProposta.edital}`}
            icon={<CheckSquare size={18} />}
          >
            <div className="checklist-container">
              <div className="checklist-header">
                <div className="edital-info">
                  <p><strong>Orgao:</strong> {selectedProposta.orgao}</p>
                  <p><strong>Produto:</strong> {selectedProposta.produto}</p>
                  <p><strong>Valor:</strong> {formatCurrency(selectedProposta.valor)}</p>
                  <p><strong>Abertura:</strong> {selectedProposta.dataAbertura || "-"} {selectedProposta.dataAbertura ? `as ${selectedProposta.horaAbertura}` : ""}</p>
                </div>
              </div>

              <div className="checklist-items">
                <div className={`checklist-item ${selectedProposta.checklist.propostaTecnica ? "done" : ""}`}>
                  <input type="checkbox" checked={selectedProposta.checklist.propostaTecnica} readOnly />
                  <span>Proposta tecnica gerada</span>
                </div>
                <div className={`checklist-item ${selectedProposta.checklist.precoDefinido ? "done" : ""}`}>
                  <input type="checkbox" checked={selectedProposta.checklist.precoDefinido} readOnly />
                  <span>Preco definido</span>
                </div>
                <div className={`checklist-item ${selectedProposta.checklist.documentosAnexados >= selectedProposta.checklist.documentosTotal ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={selectedProposta.checklist.documentosAnexados >= selectedProposta.checklist.documentosTotal}
                    readOnly
                  />
                  <span>
                    Documentos anexados ({selectedProposta.checklist.documentosAnexados}/{selectedProposta.checklist.documentosTotal})
                  </span>
                </div>
                <div className={`checklist-item ${selectedProposta.checklist.revisaoFinal ? "done" : ""}`}>
                  <input type="checkbox" checked={selectedProposta.checklist.revisaoFinal} readOnly />
                  <span>Revisao final</span>
                </div>
              </div>

              <div className="checklist-actions">
                <ActionButton
                  icon={<Upload size={14} />}
                  label="Anexar Documento"
                  onClick={handleAnexarDocumento}
                />
                <ActionButton
                  icon={<Send size={14} />}
                  label="Marcar como Enviada"
                  onClick={() => handleMarcarEnviada(selectedProposta.id)}
                  disabled={selectedProposta.status !== "aguardando" || loadingStatus}
                  loading={loadingStatus && selectedProposta.status === "aguardando"}
                />
                <ActionButton
                  icon={<CheckCircle size={14} />}
                  label="Aprovar"
                  onClick={() => handleAprovar(selectedProposta.id)}
                  disabled={selectedProposta.status !== "enviada" || loadingStatus}
                  loading={loadingStatus && selectedProposta.status === "enviada"}
                />
                <ActionButton
                  icon={<ExternalLink size={14} />}
                  label="Abrir Portal PNCP"
                  variant="primary"
                  onClick={() => handleAbrirPortal(selectedProposta)}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Anexar Documento"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarDocumento}>Enviar</button>
          </>
        }
      >
        <FormField label="Tipo de Documento" required>
          <select className="select-input" value={uploadTipo} onChange={(e) => setUploadTipo(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="proposta">Proposta Tecnica</option>
            <option value="certidao">Certidao Negativa</option>
            <option value="contrato">Contrato Social</option>
            <option value="procuracao">Procuracao</option>
            <option value="outro">Outro</option>
          </select>
        </FormField>
        <FormField label="Arquivo" required>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
          />
        </FormField>
        <FormField label="Observacao">
          <TextInput value={uploadObs} onChange={setUploadObs} placeholder="Observacao opcional..." />
        </FormField>
      </Modal>
    </div>
  );
}
