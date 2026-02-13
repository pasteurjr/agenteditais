import { useState } from "react";
import { FileEdit, Eye, Download, Trash2, Send, Lightbulb } from "lucide-react";
import { Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, SelectInput } from "../components/common";
import type { Column } from "../components/common";

interface Proposta {
  id: string;
  edital: string;
  orgao: string;
  produto: string;
  precoUnitario: number;
  quantidade: number;
  valorTotal: number;
  dataCriacao: string;
  status: "rascunho" | "pronta" | "enviada";
  conteudo?: string;
}

// Dados mock
const mockPropostas: Proposta[] = [
  { id: "1", edital: "PE-001/2026", orgao: "UFMG", produto: "Microscopio ABC-500", precoUnitario: 11000, quantidade: 5, valorTotal: 55000, dataCriacao: "10/02/2026", status: "pronta", conteudo: "PROPOSTA TECNICA\n\nEdital: PE-001/2026\nProduto: Microscopio Optico ABC-500\n..." },
  { id: "2", edital: "PE-045/2026", orgao: "CEMIG", produto: "Centrifuga XYZ-2000", precoUnitario: 8500, quantidade: 5, valorTotal: 42500, dataCriacao: "08/02/2026", status: "enviada" },
  { id: "3", edital: "CC-012/2026", orgao: "Pref. BH", produto: "Autoclave AM-123", precoUnitario: 15000, quantidade: 2, valorTotal: 30000, dataCriacao: "05/02/2026", status: "rascunho" },
];

export function PropostaPage() {
  const [propostas, setPropostas] = useState<Proposta[]>(mockPropostas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);
  const [showGerarModal, setShowGerarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulario de nova proposta
  const [novoEdital, setNovoEdital] = useState("");
  const [novoProduto, setNovoProduto] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");
  const [precoSugerido, setPrecoSugerido] = useState<number | null>(null);

  const filteredPropostas = propostas.filter((p) => {
    const matchSearch = p.edital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.produto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todas" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSugerirPreco = async () => {
    // TODO: Chamar API para sugerir preco
    // Prompt: recomendar_preco
    setPrecoSugerido(11500);
  };

  const handleGerarProposta = async () => {
    if (!novoEdital || !novoProduto || !novoPreco || !novaQuantidade) return;
    // TODO: Chamar API para gerar proposta
    // Prompt: gerar_proposta
    setLoading(true);
    setTimeout(() => {
      const novaProposta: Proposta = {
        id: String(propostas.length + 1),
        edital: novoEdital,
        orgao: "UFMG",
        produto: novoProduto === "microscopio" ? "Microscopio ABC-500" : novoProduto,
        precoUnitario: Number(novoPreco),
        quantidade: Number(novaQuantidade),
        valorTotal: Number(novoPreco) * Number(novaQuantidade),
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
        status: "pronta",
        conteudo: "PROPOSTA TECNICA GERADA PELA IA...",
      };
      setPropostas([novaProposta, ...propostas]);
      setShowGerarModal(false);
      setLoading(false);
      // Reset form
      setNovoEdital("");
      setNovoProduto("");
      setNovoPreco("");
      setNovaQuantidade("");
      setPrecoSugerido(null);
    }, 2000);
  };

  const handleExcluirProposta = (id: string) => {
    // TODO: Chamar API para excluir proposta
    // Prompt: excluir_proposta
    setPropostas(propostas.filter(p => p.id !== id));
    if (selectedProposta?.id === id) {
      setSelectedProposta(null);
    }
  };

  const handleBaixarProposta = (proposta: Proposta, formato: "docx" | "pdf") => {
    // TODO: Chamar API para baixar proposta
    console.log(`Baixando proposta ${proposta.edital} em ${formato}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getStatusBadge = (status: Proposta["status"]) => {
    switch (status) {
      case "rascunho":
        return <span className="status-badge status-badge-neutral">Rascunho</span>;
      case "pronta":
        return <span className="status-badge status-badge-success">Pronta</span>;
      case "enviada":
        return <span className="status-badge status-badge-info">Enviada</span>;
    }
  };

  const columns: Column<Proposta>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "produto", header: "Produto", sortable: true },
    { key: "valorTotal", header: "Valor Total", render: (p) => formatCurrency(p.valorTotal), sortable: true },
    { key: "dataCriacao", header: "Data", sortable: true },
    { key: "status", header: "Status", render: (p) => getStatusBadge(p.status) },
    {
      key: "acoes",
      header: "Acoes",
      width: "120px",
      render: (p) => (
        <div className="table-actions">
          <button title="Visualizar" onClick={() => setSelectedProposta(p)}><Eye size={16} /></button>
          <button title="Baixar" onClick={() => handleBaixarProposta(p, "pdf")}><Download size={16} /></button>
          <button title="Excluir" className="danger" onClick={() => handleExcluirProposta(p.id)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <FileEdit size={24} />
          <div>
            <h1>Geracao de Propostas</h1>
            <p>Criar e gerenciar propostas tecnicas</p>
          </div>
        </div>
        <div className="page-header-actions">
          <ActionButton
            icon={<FileEdit size={16} />}
            label="Nova Proposta"
            variant="primary"
            onClick={() => setShowGerarModal(true)}
          />
        </div>
      </div>

      <div className="page-content">
        <Card title="Gerar Nova Proposta" icon={<FileEdit size={18} />}>
          <div className="form-grid form-grid-4">
            <FormField label="Edital">
              <SelectInput
                value={novoEdital}
                onChange={setNovoEdital}
                options={[
                  { value: "", label: "Selecione..." },
                  { value: "PE-001/2026", label: "PE-001/2026 - UFMG - Microscopios" },
                  { value: "PE-045/2026", label: "PE-045/2026 - CEMIG - Equip. Lab" },
                  { value: "CC-012/2026", label: "CC-012/2026 - Pref. BH - Material" },
                ]}
              />
            </FormField>
            <FormField label="Produto">
              <SelectInput
                value={novoProduto}
                onChange={setNovoProduto}
                options={[
                  { value: "", label: "Selecione..." },
                  { value: "microscopio", label: "Microscopio ABC-500" },
                  { value: "centrifuga", label: "Centrifuga XYZ-2000" },
                  { value: "autoclave", label: "Autoclave AM-123" },
                ]}
              />
            </FormField>
            <FormField label="Preco Unitario" hint={precoSugerido ? `Sugerido: ${formatCurrency(precoSugerido)}` : undefined}>
              <div className="input-with-button">
                <TextInput
                  value={novoPreco}
                  onChange={setNovoPreco}
                  type="number"
                  placeholder="R$"
                />
                <button className="btn-icon" title="Sugerir preco" onClick={handleSugerirPreco}>
                  <Lightbulb size={16} />
                </button>
              </div>
            </FormField>
            <FormField label="Quantidade">
              <TextInput
                value={novaQuantidade}
                onChange={setNovaQuantidade}
                type="number"
                placeholder="Qtd"
              />
            </FormField>
          </div>
          <div className="form-actions">
            <ActionButton
              icon={<FileEdit size={16} />}
              label="Gerar Proposta Tecnica"
              variant="primary"
              onClick={handleGerarProposta}
              loading={loading}
            />
          </div>
        </Card>

        <Card
          title="Minhas Propostas"
          icon={<FileEdit size={18} />}
        >
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar proposta..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "todas", label: "Todas" },
                  { value: "rascunho", label: "Rascunho" },
                  { value: "pronta", label: "Pronta" },
                  { value: "enviada", label: "Enviada" },
                ],
              },
            ]}
          />

          <DataTable
            data={filteredPropostas}
            columns={columns}
            idKey="id"
            onRowClick={setSelectedProposta}
            selectedId={selectedProposta?.id}
            emptyMessage="Nenhuma proposta encontrada"
          />
        </Card>

        {selectedProposta && (
          <Card
            title="Preview da Proposta"
            actions={
              <div className="card-actions">
                <ActionButton
                  icon={<Download size={14} />}
                  label="Baixar DOCX"
                  onClick={() => handleBaixarProposta(selectedProposta, "docx")}
                />
                <ActionButton
                  icon={<Download size={14} />}
                  label="Baixar PDF"
                  onClick={() => handleBaixarProposta(selectedProposta, "pdf")}
                />
                <ActionButton
                  icon={<Send size={14} />}
                  label="Enviar por Email"
                  onClick={() => {}}
                />
              </div>
            }
          >
            <div className="proposta-preview">
              <div className="proposta-header">
                <h3>PROPOSTA TECNICA</h3>
                <p><strong>Edital:</strong> {selectedProposta.edital}</p>
                <p><strong>Orgao:</strong> {selectedProposta.orgao}</p>
                <p><strong>Produto:</strong> {selectedProposta.produto}</p>
                <p><strong>Preco Unitario:</strong> {formatCurrency(selectedProposta.precoUnitario)}</p>
                <p><strong>Quantidade:</strong> {selectedProposta.quantidade}</p>
                <p><strong>Valor Total:</strong> {formatCurrency(selectedProposta.valorTotal)}</p>
              </div>
              {selectedProposta.conteudo && (
                <div className="proposta-conteudo">
                  <pre>{selectedProposta.conteudo}</pre>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showGerarModal}
        onClose={() => setShowGerarModal(false)}
        title="Gerar Nova Proposta"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowGerarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleGerarProposta}>
              <FileEdit size={14} /> Gerar Proposta
            </button>
          </>
        }
      >
        <FormField label="Edital" required>
          <SelectInput
            value={novoEdital}
            onChange={setNovoEdital}
            options={[
              { value: "", label: "Selecione o edital..." },
              { value: "PE-001/2026", label: "PE-001/2026 - UFMG" },
              { value: "PE-045/2026", label: "PE-045/2026 - CEMIG" },
            ]}
          />
        </FormField>
        <FormField label="Produto" required>
          <SelectInput
            value={novoProduto}
            onChange={setNovoProduto}
            options={[
              { value: "", label: "Selecione o produto..." },
              { value: "microscopio", label: "Microscopio ABC-500" },
              { value: "centrifuga", label: "Centrifuga XYZ-2000" },
            ]}
          />
        </FormField>
        <FormField label="Preco Unitario" required>
          <TextInput value={novoPreco} onChange={setNovoPreco} type="number" prefix="R$" />
        </FormField>
        <FormField label="Quantidade" required>
          <TextInput value={novaQuantidade} onChange={setNovaQuantidade} type="number" />
        </FormField>
      </Modal>
    </div>
  );
}
