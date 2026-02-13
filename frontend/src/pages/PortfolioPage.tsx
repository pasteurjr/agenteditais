import { useState, useEffect, useCallback, useRef } from "react";
import {
  Briefcase, Upload, Globe, Search, RefreshCw, Trash2, Eye, Plus, Shield,
  Sparkles, Radio, AlertCircle, Loader2, FileText, BookOpen, Receipt,
  ClipboardList, FolderOpen, MonitorSmartphone, ChevronDown, ChevronRight,
  Filter, Zap, ArrowDown, ArrowRight, CheckCircle
} from "lucide-react";
import { Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, SelectInput, ScoreBar, StatusBadge } from "../components/common";
import type { Column } from "../components/common";
import { getProdutos, getProduto } from "../api/client";
import type { Produto, ProdutoEspecificacao } from "../api/client";

interface PortfolioPageProps {
  onSendToChat: (message: string, file?: File) => Promise<void>;
}

// Tipos de upload conforme WORKFLOW pag 3
const UPLOAD_TYPES = [
  { id: "manual", label: "Manuais", icon: BookOpen, desc: "Manuais tecnicos dos produtos", accept: ".pdf,.doc,.docx", prompt: "Cadastre este produto a partir do manual" },
  { id: "instrucoes", label: "Instrucoes de Uso", icon: ClipboardList, desc: "Instrucoes de uso e IFUs", accept: ".pdf,.doc,.docx", prompt: "Cadastre este produto a partir das instrucoes de uso" },
  { id: "nfs", label: "NFS", icon: Receipt, desc: "Notas fiscais de servico", accept: ".pdf,.xlsx,.xls,.csv", prompt: "Importe produtos a partir desta NFS" },
  { id: "plano_contas", label: "Plano de Contas", icon: FileText, desc: "Plano de contas do ERP", accept: ".pdf,.xlsx,.xls,.csv", prompt: "Importe produtos a partir deste plano de contas" },
  { id: "folders", label: "Folders", icon: FolderOpen, desc: "Folders e catalogos comerciais", accept: ".pdf,.doc,.docx", prompt: "Cadastre este produto a partir do folder" },
  { id: "website", label: "Website de Consultas", icon: MonitorSmartphone, desc: "URL do site do fabricante", accept: "", prompt: "Busque produtos no website" },
];

// Classes de produto (hierarquia conforme WORKFLOW)
const CLASSES_PRODUTO = [
  {
    id: "equipamento", label: "Equipamentos",
    ncm: "9027, 9011, 8419",
    subclasses: [
      { id: "laboratorio", label: "Laboratorio", ncm: "9027.30, 9011.10" },
      { id: "hospitalar", label: "Hospitalar", ncm: "9018.19, 8419.20" },
      { id: "imagem", label: "Imagem e Diagnostico", ncm: "9022.14" },
    ]
  },
  {
    id: "reagente", label: "Reagentes",
    ncm: "3822, 3002",
    subclasses: [
      { id: "diagnostico", label: "Diagnostico in vitro", ncm: "3822.00" },
      { id: "laboratorial", label: "Reagentes laboratoriais", ncm: "3822.19" },
    ]
  },
  {
    id: "insumo_hospitalar", label: "Insumos Hospitalares",
    ncm: "3005, 3006, 9018",
    subclasses: [
      { id: "descartavel", label: "Descartaveis", ncm: "3005.10" },
      { id: "esterilizacao", label: "Esterilizacao", ncm: "3006.70" },
    ]
  },
  {
    id: "informatica", label: "Informatica",
    ncm: "8471, 8473",
    subclasses: [
      { id: "computadores", label: "Computadores", ncm: "8471.30" },
      { id: "redes", label: "Redes e Infra", ncm: "8517.62" },
    ]
  },
];

const CATEGORIAS_FILTER = [
  { value: "todas", label: "Todas" },
  { value: "equipamento", label: "Equipamentos" },
  { value: "reagente", label: "Reagentes" },
  { value: "insumo_hospitalar", label: "Insumos Hospitalares" },
  { value: "insumo_laboratorial", label: "Insumos Laboratoriais" },
  { value: "informatica", label: "Informatica" },
  { value: "redes", label: "Redes" },
  { value: "mobiliario", label: "Mobiliario" },
  { value: "eletronico", label: "Eletronico" },
  { value: "outro", label: "Outro" },
];

// Campos de especificacao por classe (mascara parametrizavel)
const SPECS_POR_CLASSE: Record<string, { campo: string; placeholder: string }[]> = {
  equipamento: [
    { campo: "Potencia", placeholder: "Ex: 1500W" },
    { campo: "Voltagem", placeholder: "Ex: 220V" },
    { campo: "Resistencia", placeholder: "Ex: 10kΩ" },
    { campo: "Peso", placeholder: "Ex: 15kg" },
    { campo: "Dimensoes", placeholder: "Ex: 40x30x20cm" },
  ],
  reagente: [
    { campo: "Metodologia", placeholder: "Ex: Imunocromatografia" },
    { campo: "Sensibilidade", placeholder: "Ex: 95%" },
    { campo: "Especificidade", placeholder: "Ex: 98%" },
    { campo: "Validade", placeholder: "Ex: 18 meses" },
    { campo: "Armazenamento", placeholder: "Ex: 2-8°C" },
  ],
  insumo_hospitalar: [
    { campo: "Material", placeholder: "Ex: Latex" },
    { campo: "Tamanho", placeholder: "Ex: M" },
    { campo: "Esterilidade", placeholder: "Ex: Esteril" },
    { campo: "Quantidade por Caixa", placeholder: "Ex: 100 unidades" },
  ],
  informatica: [
    { campo: "Processador", placeholder: "Ex: Intel i7" },
    { campo: "Memoria RAM", placeholder: "Ex: 16GB" },
    { campo: "Armazenamento", placeholder: "Ex: 512GB SSD" },
    { campo: "Sistema Operacional", placeholder: "Ex: Windows 11" },
  ],
};

export function PortfolioPage({ onSendToChat }: PortfolioPageProps) {
  // Aba ativa
  const [activeTab, setActiveTab] = useState<"produtos" | "uploads" | "cadastro" | "classificacao">("produtos");

  // === PRODUTOS (tabela) ===
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [selectedProdutoFull, setSelectedProdutoFull] = useState<Produto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // === UPLOADS ===
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNomeProduto, setUploadNomeProduto] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === CADASTRO MANUAL ===
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroClasse, setCadastroClasse] = useState("");
  const [cadastroSubclasse, setCadastroSubclasse] = useState("");
  const [cadastroFabricante, setCadastroFabricante] = useState("");
  const [cadastroModelo, setCadastroModelo] = useState("");
  const [cadastroNcm, setCadastroNcm] = useState("");
  const [cadastroSpecs, setCadastroSpecs] = useState<Record<string, string>>({});

  // === CLASSIFICACAO ===
  const [expandedClasse, setExpandedClasse] = useState<string | null>(null);

  // === MODALS ===
  const [showAnvisaModal, setShowAnvisaModal] = useState(false);
  const [showBuscaWebModal, setShowBuscaWebModal] = useState(false);
  const [anvisaRegistro, setAnvisaRegistro] = useState("");
  const [anvisaNomeProduto, setAnvisaNomeProduto] = useState("");
  const [buscaNomeProduto, setBuscaNomeProduto] = useState("");
  const [buscaFabricante, setBuscaFabricante] = useState("");

  // Carregar produtos reais do backend
  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const categoria = categoriaFilter !== "todas" ? categoriaFilter : undefined;
      const data = await getProdutos(categoria);
      setProdutos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [categoriaFilter]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  // Carregar detalhes completos ao selecionar produto
  const handleSelectProduto = useCallback(async (produto: Produto) => {
    setSelectedProduto(produto);
    setLoadingDetail(true);
    try {
      const full = await getProduto(produto.id);
      setSelectedProdutoFull(full);
    } catch {
      setSelectedProdutoFull(produto);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const filteredProdutos = produtos.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.nome.toLowerCase().includes(term) ||
      (p.fabricante || "").toLowerCase().includes(term) ||
      (p.modelo || "").toLowerCase().includes(term)
    );
  });

  // ============================================================
  // HANDLERS - UPLOAD
  // ============================================================

  const handleUploadClick = (typeId: string) => {
    if (typeId === "website") {
      setUploadingType("website");
      return;
    }
    setUploadingType(typeId);
    setUploadFile(null);
    setUploadNomeProduto("");
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFile(e.target.files?.[0] || null);
  };

  const handleUploadConfirm = async () => {
    if (!uploadingType) return;

    if (uploadingType === "website") {
      if (!websiteUrl) return;
      await onSendToChat(`Busque produtos no website ${websiteUrl} e cadastre`);
      setWebsiteUrl("");
      setUploadingType(null);
      setTimeout(() => fetchProdutos(), 5000);
      return;
    }

    if (!uploadFile) return;
    const typeConfig = UPLOAD_TYPES.find(t => t.id === uploadingType);
    const prompt = typeConfig?.prompt || "Cadastre este produto";
    const msg = uploadNomeProduto ? `${prompt}: ${uploadNomeProduto}` : prompt;
    await onSendToChat(msg, uploadFile);
    setUploadFile(null);
    setUploadNomeProduto("");
    setUploadingType(null);
    setTimeout(() => fetchProdutos(), 3000);
  };

  const handleUploadCancel = () => {
    setUploadingType(null);
    setUploadFile(null);
    setUploadNomeProduto("");
    setWebsiteUrl("");
  };

  // ============================================================
  // HANDLERS - CADASTRO MANUAL
  // ============================================================

  const handleCadastroSubmit = async () => {
    if (!cadastroNome) return;

    let msg = `Cadastre manualmente o produto: Nome="${cadastroNome}"`;
    if (cadastroFabricante) msg += `, Fabricante="${cadastroFabricante}"`;
    if (cadastroModelo) msg += `, Modelo="${cadastroModelo}"`;
    if (cadastroClasse) {
      const cls = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);
      if (cls) msg += `, Categoria="${cls.label}"`;
    }
    if (cadastroNcm) msg += `, NCM="${cadastroNcm}"`;

    // Adicionar specs preenchidas
    const specsPreenchidas = Object.entries(cadastroSpecs).filter(([, v]) => v.trim());
    if (specsPreenchidas.length > 0) {
      const specsStr = specsPreenchidas.map(([k, v]) => `${k}=${v}`).join(", ");
      msg += `. Especificacoes: ${specsStr}`;
    }

    await onSendToChat(msg);

    // Limpar form
    setCadastroNome("");
    setCadastroClasse("");
    setCadastroSubclasse("");
    setCadastroFabricante("");
    setCadastroModelo("");
    setCadastroNcm("");
    setCadastroSpecs({});
    setTimeout(() => fetchProdutos(), 2000);
  };

  const handleSpecChange = (campo: string, valor: string) => {
    setCadastroSpecs(prev => ({ ...prev, [campo]: valor }));
  };

  // Atualizar NCM quando classe muda
  const handleClasseChange = (classeId: string) => {
    setCadastroClasse(classeId);
    setCadastroSubclasse("");
    const cls = CLASSES_PRODUTO.find(c => c.id === classeId);
    if (cls) setCadastroNcm(cls.ncm.split(",")[0].trim());
    setCadastroSpecs({});
  };

  const handleSubclasseChange = (subId: string) => {
    setCadastroSubclasse(subId);
    const cls = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);
    const sub = cls?.subclasses.find(s => s.id === subId);
    if (sub) setCadastroNcm(sub.ncm);
  };

  // ============================================================
  // HANDLERS - ACOES NA TABELA (via chat)
  // ============================================================

  const handleReprocessar = async (produto: Produto) => {
    await onSendToChat(`Reprocesse as especificacoes do produto ${produto.nome}`);
    setTimeout(() => fetchProdutos(), 3000);
  };

  const handleExcluir = async (produto: Produto) => {
    if (!confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) return;
    await onSendToChat(`Exclua o produto ${produto.nome}`);
    setSelectedProduto(null);
    setSelectedProdutoFull(null);
    setTimeout(() => fetchProdutos(), 2000);
  };

  const handleVerificarCompletude = async (produto: Produto) => {
    await onSendToChat(`Verifique a completude do produto ${produto.nome}`);
  };

  // ANVISA
  const handleAnvisaConfirm = async () => {
    let msg = "";
    if (anvisaRegistro) msg = `Busque o registro ANVISA numero ${anvisaRegistro}`;
    else if (anvisaNomeProduto) msg = `Busque registros ANVISA para o produto ${anvisaNomeProduto}`;
    else return;
    setShowAnvisaModal(false);
    await onSendToChat(msg);
    setAnvisaRegistro("");
    setAnvisaNomeProduto("");
    setTimeout(() => fetchProdutos(), 3000);
  };

  // Busca Web
  const handleBuscaWebConfirm = async () => {
    if (!buscaNomeProduto) return;
    const msg = buscaFabricante
      ? `Busque o manual do produto ${buscaNomeProduto} do fabricante ${buscaFabricante} na web e cadastre`
      : `Busque o manual do produto ${buscaNomeProduto} na web e cadastre`;
    setShowBuscaWebModal(false);
    await onSendToChat(msg);
    setBuscaNomeProduto("");
    setBuscaFabricante("");
    setTimeout(() => fetchProdutos(), 5000);
  };

  // Completude calc
  const calcCompletude = (produto: Produto): number => {
    if (!produto.especificacoes || produto.especificacoes.length === 0) return 0;
    const preenchidos = produto.especificacoes.filter(e => e.valor && e.valor !== "-" && e.valor !== "").length;
    return Math.round((preenchidos / produto.especificacoes.length) * 100);
  };

  // Specs da classe selecionada no cadastro
  const specsClasse = cadastroClasse ? (SPECS_POR_CLASSE[cadastroClasse] || SPECS_POR_CLASSE["equipamento"]) : [];
  const classeAtual = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);

  // Colunas da tabela
  const columns: Column<Produto>[] = [
    { key: "nome", header: "Produto", sortable: true },
    { key: "fabricante", header: "Fabricante", sortable: true, render: (p) => p.fabricante || "-" },
    { key: "modelo", header: "Modelo", render: (p) => p.modelo || "-" },
    { key: "categoria", header: "Classe", sortable: true, render: (p) => p.categoria || "-" },
    { key: "ncm", header: "NCM", render: (p) => p.ncm || "-" },
    {
      key: "completude", header: "Completude",
      render: (p) => <ScoreBar score={calcCompletude(p)} size="small" />,
      sortable: true,
    },
    {
      key: "acoes", header: "Acoes", width: "180px",
      render: (p) => (
        <div className="table-actions">
          <button title="Visualizar" onClick={(e) => { e.stopPropagation(); handleSelectProduto(p); }}><Eye size={16} /></button>
          <button title="Reprocessar IA" onClick={(e) => { e.stopPropagation(); handleReprocessar(p); }}><RefreshCw size={16} /></button>
          <button title="Verificar Completude" onClick={(e) => { e.stopPropagation(); handleVerificarCompletude(p); }}><Search size={16} /></button>
          <button title="Excluir" className="danger" onClick={(e) => { e.stopPropagation(); handleExcluir(p); }}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  const detalhe = selectedProdutoFull || selectedProduto;

  return (
    <div className="page-container">
      {/* === HEADER === */}
      <div className="page-header">
        <div className="page-header-left">
          <Briefcase size={24} />
          <div>
            <h1>Portfolio de Produtos</h1>
            <p className="portfolio-subtitle">Etapa mais estrategica — Cadastro e gestao completa do portfolio</p>
          </div>
        </div>
        <div className="page-header-actions">
          <ActionButton icon={<RefreshCw size={16} />} label="Atualizar" onClick={fetchProdutos} />
          <ActionButton icon={<Shield size={16} />} label="Buscar ANVISA" onClick={() => setShowAnvisaModal(true)} />
          <ActionButton icon={<Globe size={16} />} label="Buscar na Web" onClick={() => setShowBuscaWebModal(true)} />
        </div>
      </div>

      {/* === TABS === */}
      <div className="portfolio-tabs">
        <button className={`ptab ${activeTab === "produtos" ? "active" : ""}`} onClick={() => setActiveTab("produtos")}>
          <Eye size={16} /> Meus Produtos ({produtos.length})
        </button>
        <button className={`ptab ${activeTab === "uploads" ? "active" : ""}`} onClick={() => setActiveTab("uploads")}>
          <Upload size={16} /> Uploads
        </button>
        <button className={`ptab ${activeTab === "cadastro" ? "active" : ""}`} onClick={() => setActiveTab("cadastro")}>
          <Plus size={16} /> Cadastro Manual
        </button>
        <button className={`ptab ${activeTab === "classificacao" ? "active" : ""}`} onClick={() => setActiveTab("classificacao")}>
          <ClipboardList size={16} /> Classificacao
        </button>
      </div>

      <div className="page-content">
        {error && (
          <div className="portfolio-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={fetchProdutos}>Tentar novamente</button>
          </div>
        )}

        {/* ====================================================
            TAB: MEUS PRODUTOS
            ==================================================== */}
        {activeTab === "produtos" && (
          <>
            <Card>
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar produto, fabricante, modelo..."
                filters={[{
                  key: "categoria", label: "Classe",
                  value: categoriaFilter, onChange: setCategoriaFilter,
                  options: CATEGORIAS_FILTER,
                }]}
              />
              <DataTable
                data={filteredProdutos}
                columns={columns}
                idKey="id"
                onRowClick={handleSelectProduto}
                selectedId={selectedProduto?.id}
                loading={loading}
                emptyMessage={loading ? "Carregando produtos..." : "Nenhum produto cadastrado. Use as abas Uploads ou Cadastro Manual para adicionar produtos."}
              />
            </Card>

            {/* Detalhes do produto selecionado */}
            {detalhe && (
              <Card
                title={`Detalhes: ${detalhe.nome}`}
                actions={
                  <div className="card-actions">
                    <ActionButton icon={<RefreshCw size={14} />} label="Reprocessar IA" onClick={() => handleReprocessar(detalhe)} />
                    <ActionButton icon={<Search size={14} />} label="Verificar Completude" onClick={() => handleVerificarCompletude(detalhe)} />
                    <ActionButton icon={<Trash2 size={14} />} label="Excluir" onClick={() => handleExcluir(detalhe)} />
                  </div>
                }
              >
                {loadingDetail ? (
                  <div className="loading-detail">
                    <Loader2 size={20} className="spin" />
                    <span>Carregando detalhes...</span>
                  </div>
                ) : (
                  <div className="produto-detalhes">
                    <div className="produto-info-grid">
                      <div className="info-group"><label>Nome</label><span>{detalhe.nome}</span></div>
                      <div className="info-group"><label>Fabricante</label><span>{detalhe.fabricante || "-"}</span></div>
                      <div className="info-group"><label>Modelo</label><span>{detalhe.modelo || "-"}</span></div>
                      <div className="info-group"><label>Classe</label><span>{detalhe.categoria || "-"}</span></div>
                      <div className="info-group"><label>NCM</label><span>{detalhe.ncm || "-"}</span></div>
                      <div className="info-group"><label>Preco Referencia</label><span>{detalhe.preco_referencia ? `R$ ${detalhe.preco_referencia.toLocaleString("pt-BR")}` : "-"}</span></div>
                      {detalhe.descricao && (
                        <div className="info-group full-width"><label>Descricao</label><span>{detalhe.descricao}</span></div>
                      )}
                    </div>

                    {detalhe.especificacoes && detalhe.especificacoes.length > 0 && (
                      <div className="produto-specs">
                        <h4>Especificacoes Tecnicas ({detalhe.especificacoes.length})</h4>
                        <table className="specs-table">
                          <thead>
                            <tr><th>Especificacao</th><th>Valor</th><th>Unidade</th></tr>
                          </thead>
                          <tbody>
                            {detalhe.especificacoes.map((spec: ProdutoEspecificacao) => (
                              <tr key={spec.id}>
                                <td>
                                  <span className="fonte-cell">
                                    <Sparkles size={12} style={{ color: "#8b5cf6" }} />
                                    {spec.nome_especificacao}
                                    <span className="ia-badge" title="Extraido pela IA">IA</span>
                                  </span>
                                </td>
                                <td>{spec.valor || "-"}</td>
                                <td>{spec.unidade || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(!detalhe.especificacoes || detalhe.especificacoes.length === 0) && (
                      <div className="no-specs">
                        <AlertCircle size={16} />
                        <span>Nenhuma especificacao extraida. Use "Reprocessar IA" para extrair.</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {/* ====================================================
            TAB: UPLOADS
            ==================================================== */}
        {activeTab === "uploads" && (
          <>
            {/* Header explicativo */}
            <div className="uploads-header-info">
              <h3>Varias fontes de obtencao do portfolio</h3>
              <p>Uploads (manuais, folders, instrucoes de uso, etc.); Acesso a ANVISA; Acesso ao plano de contas do ERP; Acesso ao website do fabricante.</p>
            </div>

            {/* Grid de 6 tipos de upload */}
            <div className="uploads-grid">
              {UPLOAD_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = uploadingType === type.id;
                return (
                  <div key={type.id} className={`upload-card ${isActive ? "active" : ""}`}>
                    <div className="upload-card-header" onClick={() => handleUploadClick(type.id)}>
                      <div className="upload-card-icon">
                        <Icon size={24} />
                      </div>
                      <div className="upload-card-info">
                        <h4>{type.label}</h4>
                        <p>{type.desc}</p>
                      </div>
                      <Upload size={18} className="upload-card-arrow" />
                    </div>

                    {/* Area expandida de upload */}
                    {isActive && (
                      <div className="upload-card-body">
                        {type.id === "website" ? (
                          <>
                            <FormField label="URL do Website">
                              <TextInput
                                value={websiteUrl}
                                onChange={setWebsiteUrl}
                                placeholder="https://www.fabricante.com.br/produto"
                              />
                            </FormField>
                          </>
                        ) : (
                          <>
                            <FormField label="Arquivo" required>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept={type.accept}
                                onChange={handleUploadFileChange}
                                className="upload-file-input"
                              />
                            </FormField>
                            {uploadFile && (
                              <div className="upload-file-info">
                                <FileText size={14} />
                                <span>{uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)</span>
                              </div>
                            )}
                            <FormField label="Nome do Produto (opcional)">
                              <TextInput
                                value={uploadNomeProduto}
                                onChange={setUploadNomeProduto}
                                placeholder="Sera extraido automaticamente pela IA"
                              />
                            </FormField>
                          </>
                        )}
                        <div className="upload-card-actions">
                          <button className="btn btn-secondary btn-sm" onClick={handleUploadCancel}>Cancelar</button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleUploadConfirm}
                            disabled={type.id === "website" ? !websiteUrl : !uploadFile}
                          >
                            <Sparkles size={14} /> Processar com IA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info "Deixe a IA trabalhar por voce" */}
            <Card>
              <div className="ia-trabalhar">
                <div className="ia-trabalhar-icon">
                  <Sparkles size={32} />
                </div>
                <div className="ia-trabalhar-content">
                  <h3>Deixe a IA trabalhar por voce</h3>
                  <p>
                    A IA realiza a leitura dos manuais tecnicos dos seus produtos e sugere novos campos
                    ou preenche requisitos faltantes, garantindo um cadastro rico e completo para maximizar
                    a compatibilidade.
                  </p>
                  <div className="ia-trabalhar-flow">
                    <div className="ia-flow-step">
                      <FileText size={20} />
                      <span>Manual Tecnico.pdf</span>
                    </div>
                    <ArrowRight size={20} className="ia-flow-arrow" />
                    <div className="ia-flow-step">
                      <Sparkles size={20} />
                      <span>IA Extrai Specs</span>
                    </div>
                    <ArrowRight size={20} className="ia-flow-arrow" />
                    <div className="ia-flow-step">
                      <CheckCircle size={20} />
                      <span>Produto Cadastrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ====================================================
            TAB: CADASTRO MANUAL
            ==================================================== */}
        {activeTab === "cadastro" && (
          <>
            <Card title="Crie uma base de conhecimento estruturada" subtitle="Utilize uma mascara de entrada totalmente parametrizavel para cadastrar as caracteristicas tecnicas de seus produtos por classe, seguindo os criterios normalmente avaliados nos certames.">
              <div className="cadastro-form">
                {/* Linha 1: Nome + Classe */}
                <div className="cadastro-row">
                  <FormField label="Nome do Produto" required>
                    <TextInput
                      value={cadastroNome}
                      onChange={setCadastroNome}
                      placeholder="Ex: Equipamento de Alta Tensao"
                    />
                  </FormField>
                  <FormField label="Classe">
                    <SelectInput
                      value={cadastroClasse}
                      onChange={handleClasseChange}
                      options={[{ value: "", label: "Selecione a classe..." }, ...CLASSES_PRODUTO.map(c => ({ value: c.id, label: c.label }))]}
                    />
                  </FormField>
                </div>

                {/* Linha 2: Subclasse + NCM */}
                <div className="cadastro-row">
                  <FormField label="Subclasse">
                    <SelectInput
                      value={cadastroSubclasse}
                      onChange={handleSubclasseChange}
                      options={[
                        { value: "", label: "Selecione..." },
                        ...(classeAtual?.subclasses.map(s => ({ value: s.id, label: s.label })) || [])
                      ]}
                    />
                  </FormField>
                  <FormField label="NCM">
                    <TextInput value={cadastroNcm} onChange={setCadastroNcm} placeholder="Ex: 9027.30.11" />
                  </FormField>
                </div>

                {/* Linha 3: Fabricante + Modelo */}
                <div className="cadastro-row">
                  <FormField label="Fabricante">
                    <TextInput value={cadastroFabricante} onChange={setCadastroFabricante} placeholder="Ex: Shimadzu" />
                  </FormField>
                  <FormField label="Modelo">
                    <TextInput value={cadastroModelo} onChange={setCadastroModelo} placeholder="Ex: UV-2600i" />
                  </FormField>
                </div>

                {/* Specs dinamicas por classe */}
                {cadastroClasse && specsClasse.length > 0 && (
                  <div className="cadastro-specs-section">
                    <div className="cadastro-specs-header">
                      <h4>
                        <Sparkles size={16} style={{ color: "#8b5cf6" }} />
                        Especificacoes Tecnicas — {classeAtual?.label}
                      </h4>
                      <span className="ia-hint">A IA pode preencher estes campos automaticamente via upload</span>
                    </div>
                    <div className="cadastro-specs-grid">
                      {specsClasse.map((spec) => (
                        <FormField key={spec.campo} label={spec.campo}>
                          <TextInput
                            value={cadastroSpecs[spec.campo] || ""}
                            onChange={(v) => handleSpecChange(spec.campo, v)}
                            placeholder={spec.placeholder}
                          />
                        </FormField>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botoes */}
                <div className="cadastro-actions">
                  <button className="btn btn-secondary" onClick={() => {
                    setCadastroNome(""); setCadastroClasse(""); setCadastroSubclasse("");
                    setCadastroFabricante(""); setCadastroModelo(""); setCadastroNcm("");
                    setCadastroSpecs({});
                  }}>Limpar</button>
                  <button className="btn btn-primary" onClick={handleCadastroSubmit} disabled={!cadastroNome}>
                    <Sparkles size={14} /> Cadastrar via IA
                  </button>
                </div>
              </div>
            </Card>

            {/* Dica IA */}
            <div className="ia-dica-card">
              <Sparkles size={18} />
              <div>
                <strong>Dica:</strong> Voce pode cadastrar produtos mais rapidamente fazendo upload de manuais na aba Uploads.
                A IA preenche todos os campos automaticamente.
              </div>
            </div>
          </>
        )}

        {/* ====================================================
            TAB: CLASSIFICACAO
            ==================================================== */}
        {activeTab === "classificacao" && (
          <>
            <Card title="Cadastro da Estrutura de Classificacao" subtitle="Classe de Produtos → NCM de cada Classe → Subclasse de Produtos → NCM de cada Subclasse">
              <div className="classificacao-tree">
                {CLASSES_PRODUTO.map((classe) => (
                  <div key={classe.id} className="classificacao-classe">
                    <div
                      className="classificacao-classe-header"
                      onClick={() => setExpandedClasse(expandedClasse === classe.id ? null : classe.id)}
                    >
                      {expandedClasse === classe.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <span className="classificacao-classe-nome">{classe.label}</span>
                      <span className="classificacao-ncm-badge">NCM: {classe.ncm}</span>
                      <span className="classificacao-count">
                        {produtos.filter(p => p.categoria === classe.id).length} produtos
                      </span>
                    </div>
                    {expandedClasse === classe.id && (
                      <div className="classificacao-subclasses">
                        {classe.subclasses.map((sub) => (
                          <div key={sub.id} className="classificacao-subclasse">
                            <span className="classificacao-sub-nome">{sub.label}</span>
                            <span className="classificacao-ncm-badge small">NCM: {sub.ncm}</span>
                            <span className="classificacao-count">
                              {produtos.filter(p => p.categoria === sub.id).length} produtos
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="classificacao-ia-note">
                <Sparkles size={16} style={{ color: "#8b5cf6" }} />
                <span>A IA deveria gerar esses agrupamentos, caso o cliente nao os parametrize no sistema (na area de parametrizacao)</span>
              </div>
            </Card>

            {/* Card Agente de Monitoramento + Funil */}
            <Card
              title="Do ruido de milhares de editais a clareza das oportunidades certas"
              icon={<Radio size={18} />}
              subtitle="O Agente Autonomo que Monitora o Mercado por Voce"
            >
              <div className="funil-monitoramento">
                <div className="funil-steps">
                  <div className="funil-step">
                    <div className="funil-step-icon" style={{ background: "rgba(59,130,246,0.15)" }}>
                      <Radio size={24} style={{ color: "#3b82f6" }} />
                    </div>
                    <div className="funil-step-content">
                      <h4>Monitoramento Continuo</h4>
                      <p>Um agente de IA monitora diariamente todas as fontes publicas (federal, estaduais, municipais), capturando e pre-qualificando novos editais</p>
                    </div>
                  </div>
                  <div className="funil-arrow"><ArrowDown size={20} /></div>

                  <div className="funil-step">
                    <div className="funil-step-icon" style={{ background: "rgba(168,85,247,0.15)" }}>
                      <Filter size={24} style={{ color: "#a855f7" }} />
                    </div>
                    <div className="funil-step-content">
                      <h4>Filtro Inteligente</h4>
                      <p>O sistema classifica automaticamente as oportunidades por categorias estrategicas:</p>
                      <div className="funil-categorias">
                        <span className="monitor-tag">Comodato de equipamentos</span>
                        <span className="monitor-tag">Alugueis com/sem consumo de reagentes</span>
                        <span className="monitor-tag">Venda de equipamentos</span>
                        <span className="monitor-tag">Consumo de insumos hospitalares</span>
                      </div>
                    </div>
                  </div>
                  <div className="funil-arrow"><ArrowDown size={20} /></div>

                  <div className="funil-step">
                    <div className="funil-step-icon" style={{ background: "rgba(34,197,94,0.15)" }}>
                      <Zap size={24} style={{ color: "#22c55e" }} />
                    </div>
                    <div className="funil-step-content">
                      <h4>Classificacao Automatica</h4>
                      <p>Classificacao parametrizavel e pre-estabelecida na pagina de cadastro — Etapa de Fundacao</p>
                    </div>
                  </div>
                </div>

                <div className="funil-status">
                  <StatusBadge status="success" label="Agente Ativo" size="small" />
                  <span>Ultima verificacao: {new Date().toLocaleDateString("pt-BR")} 06:00</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* === MODAL ANVISA === */}
      <Modal
        isOpen={showAnvisaModal}
        onClose={() => { setShowAnvisaModal(false); setAnvisaRegistro(""); setAnvisaNomeProduto(""); }}
        title="Registros de Produtos pela ANVISA"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAnvisaModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAnvisaConfirm} disabled={!anvisaRegistro && !anvisaNomeProduto}>
              <Shield size={14} /> Buscar via IA
            </button>
          </>
        }
      >
        <p className="modal-info">A IA tenta trazer os registros e o usuario valida ou complementa.</p>
        <FormField label="Numero de Registro ANVISA">
          <TextInput value={anvisaRegistro} onChange={setAnvisaRegistro} placeholder="Ex: 80000000001" />
        </FormField>
        <FormField label="ou Nome do Produto">
          <TextInput value={anvisaNomeProduto} onChange={setAnvisaNomeProduto} placeholder="Ex: Reagente Teste Rapido" />
        </FormField>
      </Modal>

      {/* === MODAL BUSCA WEB === */}
      <Modal
        isOpen={showBuscaWebModal}
        onClose={() => { setShowBuscaWebModal(false); setBuscaNomeProduto(""); setBuscaFabricante(""); }}
        title="Buscar Produto na Web"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowBuscaWebModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleBuscaWebConfirm} disabled={!buscaNomeProduto}>
              <Globe size={14} /> Buscar via IA
            </button>
          </>
        }
      >
        <p className="modal-info">A IA busca informacoes do produto na web e cadastra automaticamente.</p>
        <FormField label="Nome do Produto" required>
          <TextInput value={buscaNomeProduto} onChange={setBuscaNomeProduto} placeholder="Ex: Microscopio Optico Olympus CX23" />
        </FormField>
        <FormField label="Fabricante (opcional)">
          <TextInput value={buscaFabricante} onChange={setBuscaFabricante} placeholder="Ex: Olympus" />
        </FormField>
      </Modal>
    </div>
  );
}
