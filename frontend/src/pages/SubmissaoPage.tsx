import { useState } from "react";
import { Send, CheckSquare, Upload, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, TextInput } from "../components/common";
import type { Column } from "../components/common";

interface PropostaPronta {
  id: string;
  edital: string;
  orgao: string;
  produto: string;
  valor: number;
  dataAbertura: string;
  horaAbertura: string;
  status: "aguardando" | "enviada" | "confirmada";
  checklist: {
    propostaTecnica: boolean;
    precoDefinido: boolean;
    documentosAnexados: number;
    documentosTotal: number;
    revisaoFinal: boolean;
  };
}

// Dados mock
const mockPropostas: PropostaPronta[] = [
  {
    id: "1",
    edital: "PE-001/2026",
    orgao: "UFMG",
    produto: "Microscopio ABC-500",
    valor: 55000,
    dataAbertura: "15/02/2026",
    horaAbertura: "14:00",
    status: "aguardando",
    checklist: {
      propostaTecnica: true,
      precoDefinido: true,
      documentosAnexados: 3,
      documentosTotal: 5,
      revisaoFinal: false,
    },
  },
  {
    id: "2",
    edital: "PE-045/2026",
    orgao: "CEMIG",
    produto: "Centrifuga XYZ-2000",
    valor: 42500,
    dataAbertura: "20/02/2026",
    horaAbertura: "10:00",
    status: "enviada",
    checklist: {
      propostaTecnica: true,
      precoDefinido: true,
      documentosAnexados: 5,
      documentosTotal: 5,
      revisaoFinal: true,
    },
  },
  {
    id: "3",
    edital: "CC-012/2026",
    orgao: "Pref. BH",
    produto: "Autoclave AM-123",
    valor: 30000,
    dataAbertura: "25/02/2026",
    horaAbertura: "09:00",
    status: "confirmada",
    checklist: {
      propostaTecnica: true,
      precoDefinido: true,
      documentosAnexados: 4,
      documentosTotal: 4,
      revisaoFinal: true,
    },
  },
];

export function SubmissaoPage() {
  const [propostas, setPropostas] = useState<PropostaPronta[]>(mockPropostas);
  const [selectedProposta, setSelectedProposta] = useState<PropostaPronta | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleMarcarEnviada = (id: string) => {
    setPropostas(propostas.map(p =>
      p.id === id ? { ...p, status: "enviada" as const } : p
    ));
  };

  const handleAbrirPortal = (proposta: PropostaPronta) => {
    // TODO: Abrir portal PNCP/ComprasNET
    console.log("Abrindo portal para:", proposta.edital);
    window.open("https://pncp.gov.br", "_blank");
  };

  const handleAnexarDocumento = () => {
    // TODO: Implementar upload de documento
    setShowUploadModal(true);
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
      case "confirmada":
        return <span className="status-badge status-badge-success"><CheckCircle size={12} /> Confirmada</span>;
    }
  };

  const getChecklistProgress = (checklist: PropostaPronta["checklist"]) => {
    let total = 4;
    let done = 0;
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
      render: (p) => `${p.dataAbertura} ${p.horaAbertura}`,
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
            emptyMessage="Nenhuma proposta pronta para envio"
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
                  <p><strong>Abertura:</strong> {selectedProposta.dataAbertura} as {selectedProposta.horaAbertura}</p>
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
                  disabled={selectedProposta.status !== "aguardando"}
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
            <button className="btn btn-primary">Enviar</button>
          </>
        }
      >
        <FormField label="Tipo de Documento" required>
          <select className="select-input">
            <option value="">Selecione...</option>
            <option value="proposta">Proposta Tecnica</option>
            <option value="certidao">Certidao Negativa</option>
            <option value="contrato">Contrato Social</option>
            <option value="procuracao">Procuracao</option>
            <option value="outro">Outro</option>
          </select>
        </FormField>
        <FormField label="Arquivo" required>
          <input type="file" accept=".pdf,.doc,.docx" />
        </FormField>
        <FormField label="Observacao">
          <TextInput value="" onChange={() => {}} placeholder="Observacao opcional..." />
        </FormField>
      </Modal>
    </div>
  );
}
