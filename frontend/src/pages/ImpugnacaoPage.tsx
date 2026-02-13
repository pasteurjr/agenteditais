import { useState } from "react";
import { AlertTriangle, FileText, Lightbulb, Save, Clock, CheckCircle } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, TextArea, SelectInput, Modal } from "../components/common";
import type { Column } from "../components/common";

interface EditalImpugnacao {
  id: string;
  edital: string;
  orgao: string;
  prazoImpugnacao: string;
  diasRestantes: number;
  status: "pendente" | "criada" | "enviada";
}

interface Impugnacao {
  id: string;
  edital: string;
  tipo: "impugnacao" | "recurso";
  motivo: string;
  dataCriacao: string;
  status: "rascunho" | "pronta" | "enviada";
  texto?: string;
}

// Dados mock
const mockEditais: EditalImpugnacao[] = [
  { id: "1", edital: "PE-001/2026", orgao: "UFMG", prazoImpugnacao: "12/02/2026", diasRestantes: 2, status: "pendente" },
  { id: "2", edital: "PE-045/2026", orgao: "CEMIG", prazoImpugnacao: "18/02/2026", diasRestantes: 8, status: "pendente" },
  { id: "3", edital: "CC-012/2026", orgao: "Pref. BH", prazoImpugnacao: "22/02/2026", diasRestantes: 12, status: "criada" },
];

const mockImpugnacoes: Impugnacao[] = [
  { id: "1", edital: "CC-012/2026", tipo: "impugnacao", motivo: "Especificacao restritiva", dataCriacao: "05/02/2026", status: "rascunho", texto: "Ilustrissimo Senhor Pregoeiro..." },
  { id: "2", edital: "PE-050/2025", tipo: "recurso", motivo: "Desclassificacao indevida", dataCriacao: "01/02/2026", status: "enviada" },
];

export function ImpugnacaoPage() {
  const [editais] = useState<EditalImpugnacao[]>(mockEditais);
  const [impugnacoes, setImpugnacoes] = useState<Impugnacao[]>(mockImpugnacoes);
  const [selectedEdital, setSelectedEdital] = useState<EditalImpugnacao | null>(null);
  const [showCriarModal, setShowCriarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const [tipo, setTipo] = useState<"impugnacao" | "recurso">("impugnacao");
  const [motivo, setMotivo] = useState("");
  const [fundamentacao, setFundamentacao] = useState("");
  const [textoGerado, setTextoGerado] = useState("");

  const handleCriarImpugnacao = (edital: EditalImpugnacao) => {
    setSelectedEdital(edital);
    setShowCriarModal(true);
  };

  const handleGerarTexto = async () => {
    if (!motivo) return;
    // TODO: Chamar API para gerar texto com IA
    // Prompts: chat_impugnacao, chat_recurso
    setLoading(true);
    setTimeout(() => {
      setTextoGerado(`IMPUGNACAO AO EDITAL

Ilustrissimo Senhor Pregoeiro,

${selectedEdital?.orgao.toUpperCase()} - PREGAO ELETRONICO N. ${selectedEdital?.edital}

A empresa AQUILA DIAGNOSTICO LTDA, inscrita no CNPJ sob o numero XX.XXX.XXX/0001-XX, vem, respeitosamente, a presenca de Vossa Senhoria, apresentar IMPUGNACAO ao edital em epigrafe, pelos motivos de fato e de direito a seguir expostos:

I - DO MOTIVO
${motivo}

II - DA FUNDAMENTACAO
${fundamentacao || "Conforme disposto na Lei 14.133/2021..."}

III - DO PEDIDO
Diante do exposto, requer-se a Vossa Senhoria:
a) O recebimento e processamento da presente impugnacao;
b) A modificacao do edital para correcao das irregularidades apontadas;
c) A republicacao do edital com novo prazo para apresentacao de propostas.

Nestes termos, pede deferimento.

${new Date().toLocaleDateString("pt-BR")}

AQUILA DIAGNOSTICO LTDA`);
      setLoading(false);
    }, 2000);
  };

  const handleSalvarRascunho = () => {
    if (!selectedEdital) return;
    const novaImpugnacao: Impugnacao = {
      id: String(impugnacoes.length + 1),
      edital: selectedEdital.edital,
      tipo,
      motivo,
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
      status: "rascunho",
      texto: textoGerado,
    };
    setImpugnacoes([novaImpugnacao, ...impugnacoes]);
    setShowCriarModal(false);
    // Reset
    setTipo("impugnacao");
    setMotivo("");
    setFundamentacao("");
    setTextoGerado("");
    setSelectedEdital(null);
  };

  const editaisColumns: Column<EditalImpugnacao>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "prazoImpugnacao", header: "Prazo Impugnacao", sortable: true },
    {
      key: "diasRestantes",
      header: "Dias Restantes",
      render: (e) => (
        <span className={e.diasRestantes <= 3 ? "text-danger" : e.diasRestantes <= 7 ? "text-warning" : ""}>
          {e.diasRestantes} dias
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (e) => {
        switch (e.status) {
          case "pendente":
            return <span className="status-badge status-badge-warning"><Clock size={12} /> Pendente</span>;
          case "criada":
            return <span className="status-badge status-badge-info"><FileText size={12} /> Criada</span>;
          case "enviada":
            return <span className="status-badge status-badge-success"><CheckCircle size={12} /> Enviada</span>;
        }
      },
    },
    {
      key: "acoes",
      header: "Acoes",
      width: "120px",
      render: (e) => (
        <ActionButton
          icon={<AlertTriangle size={14} />}
          label="Criar"
          onClick={() => handleCriarImpugnacao(e)}
          disabled={e.status === "enviada"}
        />
      ),
    },
  ];

  const impugnacoesColumns: Column<Impugnacao>[] = [
    { key: "edital", header: "Edital", sortable: true },
    {
      key: "tipo",
      header: "Tipo",
      render: (i) => i.tipo === "impugnacao" ? "Impugnacao" : "Recurso",
    },
    { key: "motivo", header: "Motivo" },
    { key: "dataCriacao", header: "Data", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (i) => {
        switch (i.status) {
          case "rascunho":
            return <span className="status-badge status-badge-neutral">Rascunho</span>;
          case "pronta":
            return <span className="status-badge status-badge-success">Pronta</span>;
          case "enviada":
            return <span className="status-badge status-badge-info">Enviada</span>;
        }
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <AlertTriangle size={24} />
          <div>
            <h1>Impugnacoes e Recursos</h1>
            <p>Gerenciamento de impugnacoes e recursos administrativos</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Editais com Prazo de Impugnacao" icon={<Clock size={18} />}>
          <DataTable
            data={editais}
            columns={editaisColumns}
            idKey="id"
            emptyMessage="Nenhum edital com prazo de impugnacao"
          />
        </Card>

        <Card title="Minhas Impugnacoes e Recursos" icon={<FileText size={18} />}>
          <DataTable
            data={impugnacoes}
            columns={impugnacoesColumns}
            idKey="id"
            emptyMessage="Nenhuma impugnacao ou recurso criado"
          />
        </Card>
      </div>

      <Modal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        title={`Criar Impugnacao/Recurso: ${selectedEdital?.edital}`}
        size="large"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCriarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarRascunho} disabled={!textoGerado}>
              <Save size={14} /> Salvar Rascunho
            </button>
          </>
        }
      >
        <div className="impugnacao-form">
          <FormField label="Tipo">
            <div className="radio-group">
              <label className="radio-wrapper">
                <input
                  type="radio"
                  checked={tipo === "impugnacao"}
                  onChange={() => setTipo("impugnacao")}
                />
                <span>Impugnacao do Edital</span>
              </label>
              <label className="radio-wrapper">
                <input
                  type="radio"
                  checked={tipo === "recurso"}
                  onChange={() => setTipo("recurso")}
                />
                <span>Recurso Administrativo</span>
              </label>
            </div>
          </FormField>

          <FormField label="Motivo" required>
            <TextInput
              value={motivo}
              onChange={setMotivo}
              placeholder="Ex: Especificacao restritiva, Preco inexequivel..."
            />
          </FormField>

          <FormField label="Fundamentacao">
            <TextArea
              value={fundamentacao}
              onChange={setFundamentacao}
              rows={4}
              placeholder="Descreva os fundamentos legais e faticos..."
            />
          </FormField>

          <div className="form-actions">
            <ActionButton
              icon={<Lightbulb size={16} />}
              label="Gerar Texto com IA"
              variant="primary"
              onClick={handleGerarTexto}
              loading={loading}
              disabled={!motivo}
            />
          </div>

          {textoGerado && (
            <div className="texto-gerado">
              <h4>Texto Gerado</h4>
              <TextArea
                value={textoGerado}
                onChange={setTextoGerado}
                rows={15}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
