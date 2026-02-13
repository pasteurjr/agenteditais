import { useState } from "react";
import { ClipboardList, Phone, Bell, Trophy, XCircle, Ban, Clock } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, SelectInput, Modal } from "../components/common";
import type { Column } from "../components/common";

interface EditalAguardando {
  id: string;
  edital: string;
  orgao: string;
  dataSubmissao: string;
  diasAguardando: number;
  valorProposto: number;
}

interface Resultado {
  id: string;
  edital: string;
  orgao: string;
  resultado: "vitoria" | "derrota" | "cancelado";
  valorFinal?: number;
  vencedor?: string;
  motivo?: string;
  data: string;
}

// Dados mock
const mockAguardando: EditalAguardando[] = [
  { id: "1", edital: "PE-001/2026", orgao: "UFMG", dataSubmissao: "15/02/2026", diasAguardando: 5, valorProposto: 55000 },
  { id: "2", edital: "PE-045/2026", orgao: "CEMIG", dataSubmissao: "12/02/2026", diasAguardando: 8, valorProposto: 42500 },
  { id: "3", edital: "CC-012/2026", orgao: "Pref. BH", dataSubmissao: "08/02/2026", diasAguardando: 12, valorProposto: 30000 },
];

const mockResultados: Resultado[] = [
  { id: "1", edital: "PE-032/2026", orgao: "USP", resultado: "vitoria", valorFinal: 28000, data: "01/02/2026" },
  { id: "2", edital: "PE-050/2026", orgao: "UFMG", resultado: "derrota", valorFinal: 43500, vencedor: "Lab Solutions", motivo: "Preco", data: "05/02/2026" },
  { id: "3", edital: "PE-018/2026", orgao: "UNICAMP", resultado: "cancelado", data: "03/02/2026" },
];

export function FollowupPage() {
  const [aguardando] = useState<EditalAguardando[]>(mockAguardando);
  const [resultados, setResultados] = useState<Resultado[]>(mockResultados);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [selectedEdital, setSelectedEdital] = useState<EditalAguardando | null>(null);

  // Form de registro de resultado
  const [tipoResultado, setTipoResultado] = useState<"vitoria" | "derrota" | "cancelado">("vitoria");
  const [valorFinal, setValorFinal] = useState("");
  const [vencedor, setVencedor] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleAbrirRegistro = (edital: EditalAguardando) => {
    setSelectedEdital(edital);
    setShowRegistrarModal(true);
  };

  const handleRegistrarResultado = () => {
    if (!selectedEdital) return;
    // TODO: Chamar API para registrar resultado
    // Prompts: registrar_vitoria, registrar_derrota, registrar_cancelado
    const novoResultado: Resultado = {
      id: String(resultados.length + 1),
      edital: selectedEdital.edital,
      orgao: selectedEdital.orgao,
      resultado: tipoResultado,
      valorFinal: valorFinal ? Number(valorFinal) : undefined,
      vencedor: tipoResultado === "derrota" ? vencedor : undefined,
      motivo: tipoResultado === "derrota" ? motivo : undefined,
      data: new Date().toLocaleDateString("pt-BR"),
    };
    setResultados([novoResultado, ...resultados]);
    setShowRegistrarModal(false);
    // Reset form
    setTipoResultado("vitoria");
    setValorFinal("");
    setVencedor("");
    setMotivo("");
    setSelectedEdital(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getResultadoBadge = (resultado: Resultado["resultado"]) => {
    switch (resultado) {
      case "vitoria":
        return <span className="status-badge status-badge-success"><Trophy size={12} /> Vitoria</span>;
      case "derrota":
        return <span className="status-badge status-badge-error"><XCircle size={12} /> Derrota</span>;
      case "cancelado":
        return <span className="status-badge status-badge-neutral"><Ban size={12} /> Cancelado</span>;
    }
  };

  const aguardandoColumns: Column<EditalAguardando>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "dataSubmissao", header: "Submetido em", sortable: true },
    {
      key: "diasAguardando",
      header: "Aguardando",
      render: (e) => (
        <span className={e.diasAguardando > 10 ? "text-warning" : ""}>
          {e.diasAguardando} dias
        </span>
      ),
    },
    { key: "valorProposto", header: "Valor Proposto", render: (e) => formatCurrency(e.valorProposto) },
    {
      key: "acoes",
      header: "Acoes",
      width: "150px",
      render: (e) => (
        <div className="table-actions">
          <button title="Contato" onClick={() => {}}><Phone size={16} /></button>
          <button title="Lembrete" onClick={() => {}}><Bell size={16} /></button>
          <ActionButton
            label="Registrar"
            onClick={() => handleAbrirRegistro(e)}
          />
        </div>
      ),
    },
  ];

  const resultadosColumns: Column<Resultado>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "data", header: "Data", sortable: true },
    { key: "resultado", header: "Resultado", render: (r) => getResultadoBadge(r.resultado) },
    {
      key: "valorFinal",
      header: "Valor Final",
      render: (r) => r.valorFinal ? formatCurrency(r.valorFinal) : "-",
    },
    { key: "vencedor", header: "Vencedor", render: (r) => r.vencedor || "-" },
    { key: "motivo", header: "Motivo", render: (r) => r.motivo || "-" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <ClipboardList size={24} />
          <div>
            <h1>Followup Pos-Submissao</h1>
            <p>Acompanhamento de editais submetidos</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card title="Aguardando Resultado" icon={<Clock size={18} />}>
          <DataTable
            data={aguardando}
            columns={aguardandoColumns}
            idKey="id"
            emptyMessage="Nenhum edital aguardando resultado"
          />
        </Card>

        <Card title="Resultados Registrados" icon={<ClipboardList size={18} />}>
          <DataTable
            data={resultados}
            columns={resultadosColumns}
            idKey="id"
            emptyMessage="Nenhum resultado registrado"
          />
        </Card>
      </div>

      <Modal
        isOpen={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        title={`Registrar Resultado: ${selectedEdital?.edital}`}
        size="medium"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowRegistrarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleRegistrarResultado}>
              Registrar Resultado
            </button>
          </>
        }
      >
        <div className="resultado-form">
          <FormField label="Resultado">
            <div className="radio-group">
              <label className="radio-wrapper">
                <input
                  type="radio"
                  checked={tipoResultado === "vitoria"}
                  onChange={() => setTipoResultado("vitoria")}
                />
                <span><Trophy size={14} /> Vitoria</span>
              </label>
              <label className="radio-wrapper">
                <input
                  type="radio"
                  checked={tipoResultado === "derrota"}
                  onChange={() => setTipoResultado("derrota")}
                />
                <span><XCircle size={14} /> Derrota</span>
              </label>
              <label className="radio-wrapper">
                <input
                  type="radio"
                  checked={tipoResultado === "cancelado"}
                  onChange={() => setTipoResultado("cancelado")}
                />
                <span><Ban size={14} /> Cancelado</span>
              </label>
            </div>
          </FormField>

          {tipoResultado === "vitoria" && (
            <FormField label="Valor Final">
              <TextInput
                value={valorFinal}
                onChange={setValorFinal}
                type="number"
                prefix="R$"
              />
            </FormField>
          )}

          {tipoResultado === "derrota" && (
            <>
              <FormField label="Vencedor">
                <TextInput
                  value={vencedor}
                  onChange={setVencedor}
                  placeholder="Nome do vencedor"
                />
              </FormField>
              <FormField label="Valor Vencedor">
                <TextInput
                  value={valorFinal}
                  onChange={setValorFinal}
                  type="number"
                  prefix="R$"
                />
              </FormField>
              <FormField label="Motivo da Derrota">
                <SelectInput
                  value={motivo}
                  onChange={setMotivo}
                  options={[
                    { value: "", label: "Selecione..." },
                    { value: "Preco", label: "Preco" },
                    { value: "Tecnico", label: "Requisito Tecnico" },
                    { value: "Documentacao", label: "Documentacao" },
                    { value: "Prazo", label: "Prazo de Entrega" },
                    { value: "Outro", label: "Outro" },
                  ]}
                />
              </FormField>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
