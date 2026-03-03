import { useState, useEffect } from "react";
import type { PageProps } from "../types";
import { FileEdit, Eye, Download, Trash2, Send, Lightbulb } from "lucide-react";
import { Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, SelectInput } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudDelete } from "../api/crud";
import { getEditais, getProdutos } from "../api/client";
import type { Edital, Produto } from "../api/client";

interface Proposta {
  id: string;
  edital: string;
  orgao: string;
  produto: string;
  precoUnitario: number;
  quantidade: number;
  valorTotal: number;
  dataCriacao: string;
  status: "rascunho" | "revisao" | "aprovada" | "enviada";
  conteudo?: string;
}

function mapCrudToProposta(item: Record<string, unknown>): Proposta {
  const precoUnitario = Number(item.preco_unitario ?? item.precoUnitario ?? 0);
  const quantidade = Number(item.quantidade ?? 1);
  return {
    id: String(item.id ?? ""),
    edital: String(item.numero_edital ?? item.edital ?? ""),
    orgao: String(item.orgao ?? ""),
    produto: String(item.nome_produto ?? item.produto ?? ""),
    precoUnitario,
    quantidade,
    valorTotal: Number(item.preco_total ?? item.valorTotal ?? precoUnitario * quantidade),
    dataCriacao: String(item.created_at ?? item.dataCriacao ?? "").split("T")[0],
    status: (["rascunho", "revisao", "aprovada", "enviada"].includes(String(item.status))
      ? item.status
      : "rascunho") as Proposta["status"],
    conteudo: item.texto_tecnico ? String(item.texto_tecnico) : undefined,
  };
}

export function PropostaPage(props?: PageProps) {
  const { onSendToChat } = props ?? {};

  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);
  const [showGerarModal, setShowGerarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Listas para selects
  const [editais, setEditais] = useState<Edital[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Formulario de nova proposta
  const [novoEdital, setNovoEdital] = useState("");
  const [novoProduto, setNovoProduto] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");
  const [precoSugerido, setPrecoSugerido] = useState<number | null>(null);

  const filteredPropostas = propostas.filter((p) => {
    const matchSearch =
      p.edital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.produto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todas" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Carregar dados ao montar
  useEffect(() => {
    const loadData = async () => {
      setLoadingLista(true);
      try {
        const res = await crudList("propostas", { limit: 100 });
        setPropostas(res.items.map(mapCrudToProposta));
      } catch {
        setPropostas([]);
      } finally {
        setLoadingLista(false);
      }

      try {
        setEditais(await getEditais("salvo"));
      } catch {
        setEditais([]);
      }

      try {
        setProdutos(await getProdutos());
      } catch {
        setProdutos([]);
      }
    };
    loadData();
  }, []);

  const handleSugerirPreco = async () => {
    const edital = editais.find((e) => e.id === novoEdital || e.numero === novoEdital);
    const produto = produtos.find((p) => p.id === novoProduto || p.nome === novoProduto);
    const editalDesc = edital ? `${edital.numero} - ${edital.orgao}` : novoEdital;
    const produtoDesc = produto ? produto.nome : novoProduto;

    if (onSendToChat && (editalDesc || produtoDesc)) {
      onSendToChat(
        `Sugira um preço unitário competitivo para:\n` +
        `- Edital: ${editalDesc || "(não selecionado)"}\n` +
        `- Produto: ${produtoDesc || "(não selecionado)"}\n` +
        `Retorne somente o valor numérico recomendado com justificativa breve.`
      );
    }

    // Tenta buscar preco sugerido da analise
    try {
      const res = await crudList("preco-historico", { q: produtoDesc, limit: 20 });
      const items = res.items as Record<string, unknown>[];
      if (items.length > 0) {
        const precos = items.map((i) => Number(i.preco ?? i.preco_ofertado ?? 0)).filter((v) => v > 0);
        if (precos.length > 0) {
          const media = precos.reduce((a, b) => a + b, 0) / precos.length;
          setPrecoSugerido(Math.round(media * 0.95));
        }
      }
    } catch {
      // apenas via IA
    }
  };

  const handleGerarProposta = async () => {
    if (!novoEdital || !novoProduto || !novoPreco || !novaQuantidade) return;
    setLoading(true);

    const edital = editais.find((e) => e.id === novoEdital || e.numero === novoEdital);
    const produto = produtos.find((p) => p.id === novoProduto || p.nome === novoProduto);
    const editalDesc = edital ? `${edital.numero} - ${edital.orgao}` : novoEdital;
    const produtoDesc = produto ? produto.nome : novoProduto;
    const preco = Number(novoPreco);
    const qtd = Number(novaQuantidade);

    try {
      // Criar proposta no backend
      const data: Record<string, unknown> = {
        numero_edital: edital?.numero ?? novoEdital,
        orgao: edital?.orgao ?? "",
        nome_produto: produtoDesc,
        preco_unitario: preco,
        quantidade: qtd,
        preco_total: preco * qtd,
        status: "rascunho",
      };
      if (edital?.id) data.edital_id = edital.id;
      if (produto?.id) data.produto_id = produto.id;

      const created = await crudCreate("propostas", data);
      const novaProposta = mapCrudToProposta(created);
      setPropostas([novaProposta, ...propostas]);

      // Solicitar geração do texto técnico via IA
      if (onSendToChat) {
        onSendToChat(
          `Gere uma proposta técnica completa para:\n` +
          `- Edital: ${editalDesc}\n` +
          `- Produto: ${produtoDesc}\n` +
          `- Preço Unitário: R$ ${preco.toFixed(2)}\n` +
          `- Quantidade: ${qtd}\n` +
          `- Valor Total: R$ ${(preco * qtd).toFixed(2)}\n\n` +
          `Inclua: identificação da empresa, objeto, especificações técnicas, prazo de entrega e validade da proposta.`
        );
      }

      setShowGerarModal(false);
      setNovoEdital("");
      setNovoProduto("");
      setNovoPreco("");
      setNovaQuantidade("");
      setPrecoSugerido(null);
    } catch (err) {
      console.error("Erro ao criar proposta:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirProposta = async (id: string) => {
    try {
      await crudDelete("propostas", id);
      setPropostas(propostas.filter((p) => p.id !== id));
      if (selectedProposta?.id === id) {
        setSelectedProposta(null);
      }
    } catch (err) {
      console.error("Erro ao excluir proposta:", err);
    }
  };

  const handleBaixarProposta = (proposta: Proposta, formato: "docx" | "pdf") => {
    const token = localStorage.getItem("editais_ia_access_token");
    const url = `/api/propostas/${proposta.id}/export?formato=${formato}`;
    // Abre em nova aba com auth via token na URL não é seguro;
    // usar fetch + blob para download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao baixar");
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `proposta-${proposta.edital}.${formato}`;
        link.click();
      })
      .catch(() => {
        // endpoint ainda não disponível - notifica via chat
        if (onSendToChat) {
          onSendToChat(`Exporte a proposta ${proposta.edital} no formato ${formato.toUpperCase()}.`);
        }
      });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getStatusBadge = (status: Proposta["status"]) => {
    switch (status) {
      case "rascunho":
        return <span className="status-badge status-badge-neutral">Rascunho</span>;
      case "revisao":
        return <span className="status-badge status-badge-warning">Em Revisao</span>;
      case "aprovada":
        return <span className="status-badge status-badge-success">Aprovada</span>;
      case "enviada":
        return <span className="status-badge status-badge-info">Enviada</span>;
    }
  };

  const editalOptions = [
    { value: "", label: "Selecione..." },
    ...editais.map((e) => ({ value: e.id ?? e.numero, label: `${e.numero} - ${e.orgao}` })),
  ];

  const produtoOptions = [
    { value: "", label: "Selecione..." },
    ...produtos.map((p) => ({ value: p.id, label: p.nome })),
  ];

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
                options={editalOptions}
              />
            </FormField>
            <FormField label="Produto">
              <SelectInput
                value={novoProduto}
                onChange={setNovoProduto}
                options={produtoOptions}
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
                  { value: "revisao", label: "Em Revisao" },
                  { value: "aprovada", label: "Aprovada" },
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
            emptyMessage={loadingLista ? "Carregando..." : "Nenhuma proposta encontrada"}
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
                  onClick={() => {
                    if (onSendToChat && selectedProposta) {
                      onSendToChat(
                        `Prepare um email para envio da proposta:\n` +
                        `- Edital: ${selectedProposta.edital}\n` +
                        `- Orgao: ${selectedProposta.orgao}\n` +
                        `- Produto: ${selectedProposta.produto}\n` +
                        `- Valor: R$ ${selectedProposta.valorTotal.toFixed(2)}\n` +
                        `Gere o corpo do email profissional para envio da proposta ao orgao licitante.`
                      );
                    }
                  }}
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
            options={editalOptions}
          />
        </FormField>
        <FormField label="Produto" required>
          <SelectInput
            value={novoProduto}
            onChange={setNovoProduto}
            options={produtoOptions}
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
