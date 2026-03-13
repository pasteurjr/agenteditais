import { useState, useEffect, useCallback, useRef } from "react";
import {
  Briefcase, Upload, Globe, Search, RefreshCw, Trash2, Eye, Plus, Shield,
  Sparkles, Radio, AlertCircle, Loader2, FileText, BookOpen, Receipt,
  ClipboardList, FolderOpen, MonitorSmartphone, ChevronDown, ChevronRight,
  Filter, Zap, ArrowDown, ArrowRight, CheckCircle, DollarSign, AlertTriangle,
  Edit2, Save, X
} from "lucide-react";
import { Card, DataTable, ActionButton, FilterBar, Modal, FormField, TextInput, SelectInput, ScoreBar, StatusBadge } from "../components/common";
import type { Column } from "../components/common";
import { getProdutos, getProduto, getProdutoCompletude, sendMessage, sendMessageWithFile, createSession } from "../api/client";
import type { Produto, ProdutoEspecificacao, CompletudeResult } from "../api/client";
import { crudList, crudCreate, crudUpdate, crudDelete } from "../api/crud";

interface PortfolioPageProps {
  onSendToChat: (message: string, file?: File) => Promise<void>;
}

// Tipos de upload conforme WORKFLOW pag 3
const UPLOAD_TYPES = [
  { id: "manual", label: "Manuais", icon: BookOpen, desc: "Manuais tecnicos dos produtos", accept: ".pdf,.doc,.docx", prompt: "Cadastre este produto a partir do manual" },
  { id: "instrucoes", label: "Instrucoes de Uso", icon: ClipboardList, desc: "Instrucoes de uso e IFUs", accept: ".pdf,.doc,.docx", prompt: "Cadastre este produto a partir das instrucoes de uso" },
  { id: "nfs", label: "NFS", icon: Receipt, desc: "Notas fiscais de servico", accept: ".pdf,.xlsx,.xls,.csv", prompt: "Importe TODOS os produtos/itens desta nota fiscal. Extraia cada item listado e cadastre cada um individualmente", multi: true },
  { id: "plano_contas", label: "Plano de Contas", icon: FileText, desc: "Plano de contas do ERP", accept: ".pdf,.xlsx,.xls,.csv", prompt: "Importe TODOS os produtos deste plano de contas. Liste e cadastre cada item individualmente", multi: true },
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
  { value: "comodato", label: "Comodato" },
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
  insumo_laboratorial: [
    { campo: "Tipo de Insumo", placeholder: "Ex: Ponteira, Tubo, Lamina" },
    { campo: "Volume/Quantidade", placeholder: "Ex: 1000uL" },
    { campo: "Validade", placeholder: "Ex: 24 meses" },
    { campo: "Condicoes de Armazenamento", placeholder: "Ex: Temperatura ambiente" },
    { campo: "Fabricante", placeholder: "Ex: Eppendorf" },
  ],
  redes: [
    { campo: "Tipo de Equipamento", placeholder: "Ex: Switch, Roteador, Access Point" },
    { campo: "Velocidade/Throughput", placeholder: "Ex: 1Gbps" },
    { campo: "Numero de Portas", placeholder: "Ex: 24 portas" },
    { campo: "Protocolos Suportados", placeholder: "Ex: TCP/IP, SNMP" },
    { campo: "Alimentacao", placeholder: "Ex: PoE, 110/220V" },
  ],
  mobiliario: [
    { campo: "Tipo de Movel", placeholder: "Ex: Mesa, Cadeira, Armario" },
    { campo: "Material", placeholder: "Ex: MDP, Aco, Madeira" },
    { campo: "Dimensoes (LxAxP)", placeholder: "Ex: 120x75x60cm" },
    { campo: "Capacidade de Peso", placeholder: "Ex: 150kg" },
    { campo: "Cor/Acabamento", placeholder: "Ex: Cinza, Amadeirado" },
  ],
  eletronico: [
    { campo: "Tipo de Dispositivo", placeholder: "Ex: Monitor, Impressora, Tablet" },
    { campo: "Processador", placeholder: "Ex: Intel i5" },
    { campo: "Memoria RAM", placeholder: "Ex: 8GB" },
    { campo: "Armazenamento", placeholder: "Ex: 256GB SSD" },
    { campo: "Conectividade", placeholder: "Ex: Wi-Fi 6, Bluetooth 5.0" },
  ],
  comodato: [
    { campo: "Equipamento Principal", placeholder: "Ex: Analisador Bioquimico" },
    { campo: "Reagentes Vinculados", placeholder: "Ex: Kit Glicose, Kit Colesterol" },
    { campo: "Producao Mensal Estimada", placeholder: "Ex: 5000 testes/mes" },
    { campo: "Prazo do Contrato", placeholder: "Ex: 48 meses" },
    { campo: "Manutencao Incluida", placeholder: "Ex: Preventiva e Corretiva" },
  ],
};

interface SpecCampoTop {
  campo: string;
  tipo: "texto" | "numero" | "decimal" | "select" | "boolean";
  unidade?: string;
  placeholder?: string;
  opcoes?: string[];
  obrigatorio?: boolean;
}

function parseMascaraTop(raw: unknown): SpecCampoTop[] {
  try {
    let mascara = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (typeof mascara === "string") mascara = JSON.parse(mascara);
    if (!Array.isArray(mascara) || mascara.length === 0) return [];
    return mascara.map((m: Record<string, unknown>) => ({
      campo: String(m.campo || m.nome || ""),
      tipo: (m.tipo as SpecCampoTop["tipo"]) || "texto",
      unidade: m.unidade ? String(m.unidade) : undefined,
      placeholder: m.placeholder ? String(m.placeholder) : undefined,
      opcoes: Array.isArray(m.opcoes) ? m.opcoes.map(String) : undefined,
      obrigatorio: Boolean(m.obrigatorio),
    }));
  } catch { return []; }
}

export function PortfolioPage({ onSendToChat }: PortfolioPageProps) {
  // Aba ativa
  const [activeTab, setActiveTab] = useState<"produtos" | "uploads" | "cadastro" | "classificacao">("produtos");

  // === PRODUTOS (tabela) ===
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroClasse, setFiltroClasse] = useState("");
  const [filtroSubclasse, setFiltroSubclasse] = useState("");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [selectedProdutoFull, setSelectedProdutoFull] = useState<Produto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const detalheRef = useRef<HTMLDivElement>(null);

  // === UPLOADS ===
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNomeProduto, setUploadNomeProduto] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === CADASTRO MANUAL ===
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroArea, setCadastroArea] = useState("");
  const [cadastroClasse, setCadastroClasse] = useState("");
  const [cadastroSubclasse, setCadastroSubclasse] = useState("");
  const [cadastroFabricante, setCadastroFabricante] = useState("");
  const [cadastroModelo, setCadastroModelo] = useState("");
  const [cadastroNcm, setCadastroNcm] = useState("");
  const [cadastroSpecs, setCadastroSpecs] = useState<Record<string, string>>({});

  // === CLASSIFICACAO ===
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [expandedClasse, setExpandedClasse] = useState<string | null>(null);

  // === HIERARQUIA DO BACKEND (Area → Classe → Subclasse) ===
  const [areasBackend, setAreasBackend] = useState<Record<string, unknown>[]>([]);
  const [classesV2Backend, setClassesV2Backend] = useState<Record<string, unknown>[]>([]);
  const [subclassesBackend, setSubclassesBackend] = useState<Record<string, unknown>[]>([]);

  // === MONITORAMENTOS ===
  const [monitoramentos, setMonitoramentos] = useState<Record<string, unknown>[]>([]);
  const [monitoramentosLoading, setMonitoramentosLoading] = useState(false);

  // === COMPLETUDE ===
  const [completudeResult, setCompletudeResult] = useState<CompletudeResult | null>(null);
  const [completudeLoading, setCompletudeLoading] = useState(false);

  // === FEEDBACK DE PROCESSAMENTO ===
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [iaResponse, setIaResponse] = useState<string | null>(null);

  // === EDIÇÃO DE PRODUTO ===
  const [editProduto, setEditProduto] = useState<Produto | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editArea, setEditArea] = useState("");
  const [editClasse, setEditClasse] = useState("");
  const [editSubclasse, setEditSubclasse] = useState("");
  const [editSpecs, setEditSpecs] = useState<Record<string, { id?: string; valor: string; unidade?: string }>>({});
  const [editLoading, setEditLoading] = useState(false);

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

  // Carregar hierarquia Area → Classe → Subclasse do backend
  useEffect(() => {
    (async () => {
      try {
        const [areasRes, classesRes, subsRes] = await Promise.all([
          crudList("areas-produto", { limit: 100 }),
          crudList("classes-produto-v2", { limit: 200 }),
          crudList("subclasses-produto", { limit: 500 }),
        ]);
        setAreasBackend(areasRes.items || []);
        setClassesV2Backend(classesRes.items || []);
        setSubclassesBackend(subsRes.items || []);
      } catch {
        // Fallback: mantém vazio, usará CLASSES_PRODUTO hardcoded
      }
    })();
    // Carregar monitoramentos
    (async () => {
      setMonitoramentosLoading(true);
      try {
        const res = await crudList("monitoramentos", { limit: 10 });
        setMonitoramentos(res.items || []);
      } catch {
        // silencioso
      } finally {
        setMonitoramentosLoading(false);
      }
    })();
  }, []);

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
      setTimeout(() => detalheRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  // Mapas para filtro hierárquico
  const subclasseToClasseMap = Object.fromEntries(subclassesBackend.map(s => [String(s.id), String(s.classe_id || "")]));
  const classeToAreaMap = Object.fromEntries(classesV2Backend.map(c => [String(c.id), String(c.area_id || "")]));

  const filteredProdutos = produtos.filter((p) => {
    // Filtro por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = p.nome.toLowerCase().includes(term) ||
        (p.fabricante || "").toLowerCase().includes(term) ||
        (p.modelo || "").toLowerCase().includes(term);
      if (!match) return false;
    }
    // Filtro por subclasse
    if (filtroSubclasse && p.subclasse_id !== filtroSubclasse) return false;
    // Filtro por classe (via subclasse do produto)
    if (filtroClasse && !filtroSubclasse) {
      const classeId = p.subclasse_id ? subclasseToClasseMap[p.subclasse_id] : "";
      if (classeId !== filtroClasse) return false;
    }
    // Filtro por área (via classe da subclasse do produto)
    if (filtroArea && !filtroClasse && !filtroSubclasse) {
      const classeId = p.subclasse_id ? subclasseToClasseMap[p.subclasse_id] : "";
      const areaId = classeId ? classeToAreaMap[classeId] : "";
      if (areaId !== filtroArea) return false;
    }
    return true;
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

    setProcessingMessage("Processando via IA...");
    setIaResponse(null);

    try {
      const session = await createSession("cadastro-produto");

      if (uploadingType === "website") {
        if (!websiteUrl) return;
        const resp = await sendMessage(session.id, `Busque produtos no website ${websiteUrl} e cadastre`);
        setProcessingMessage(null);
        setIaResponse(resp.response || "Processado pela IA.");
        setWebsiteUrl("");
        setUploadingType(null);
        fetchProdutos();
        return;
      }

      if (!uploadFile) return;
      const typeConfig = UPLOAD_TYPES.find(t => t.id === uploadingType);
      const prompt = typeConfig?.prompt || "Cadastre este produto";
      const msg = uploadNomeProduto ? `${prompt}: ${uploadNomeProduto}` : prompt;
      const resp = await sendMessageWithFile(session.id, msg, uploadFile);
      setProcessingMessage(null);
      setIaResponse(resp.response || "Produto processado pela IA.");
      setUploadFile(null);
      setUploadNomeProduto("");
      setUploadingType(null);
      fetchProdutos();
    } catch (err) {
      setProcessingMessage(null);
      setIaResponse(`Erro: ${err instanceof Error ? err.message : "Falha ao processar"}`);
    }
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
    if (cadastroSubclasse) msg += `, SubclasseId="${cadastroSubclasse}"`;
    if (cadastroClasse) {
      const cls = useBackendClasses
        ? classesV2Backend.find(c => String(c.id) === cadastroClasse)
        : null;
      msg += `, Categoria="${cls ? String(cls.nome) : cadastroClasse}"`;
    }
    if (cadastroNcm) msg += `, NCM="${cadastroNcm}"`;

    // Adicionar specs preenchidas com tipo e unidade da máscara
    const specsPreenchidas = Object.entries(cadastroSpecs).filter(([, v]) => v.trim());
    if (specsPreenchidas.length > 0) {
      const specsDetalhadas = specsPreenchidas.map(([campo, valor]) => {
        const specDef = specsClasse.find(s => s.campo === campo);
        let entry = `${campo}=${valor}`;
        if (specDef?.unidade) entry += `[${specDef.unidade}]`;
        if (specDef?.tipo && specDef.tipo !== "texto") entry += `{${specDef.tipo}}`;
        return entry;
      });
      msg += `. Especificacoes: ${specsDetalhadas.join(", ")}`;
    }

    setProcessingMessage("Processando via IA...");
    setIaResponse(null);

    try {
      // Chamar /api/chat diretamente (mesmo endpoint do chat)
      const session = await createSession("cadastro-produto");
      const response = await sendMessage(session.id, msg);

      setProcessingMessage(null);
      setIaResponse(response.response || "Produto processado pela IA.");

      // Limpar form
      setCadastroNome("");
      setCadastroArea("");
      setCadastroClasse("");
      setCadastroSubclasse("");
      setCadastroFabricante("");
      setCadastroModelo("");
      setCadastroNcm("");
      setCadastroSpecs({});

      // Atualizar lista de produtos
      fetchProdutos();
    } catch (err) {
      setProcessingMessage(null);
      setIaResponse(`Erro: ${err instanceof Error ? err.message : "Falha ao cadastrar"}`);
    }
  };

  const handleSpecChange = (campo: string, valor: string) => {
    setCadastroSpecs(prev => ({ ...prev, [campo]: valor }));
  };

  // Handlers de seleção cascata: Área → Classe → Subclasse
  const handleAreaChange = (areaId: string) => {
    setCadastroArea(areaId);
    setCadastroClasse("");
    setCadastroSubclasse("");
    setCadastroNcm("");
    setCadastroSpecs({});
  };

  const handleClasseChange = (classeId: string) => {
    setCadastroClasse(classeId);
    setCadastroSubclasse("");
    setCadastroSpecs({});
    setCadastroNcm("");
  };

  const handleSubclasseChange = (subId: string) => {
    setCadastroSubclasse(subId);
    setCadastroSpecs({});
    if (useBackendClasses) {
      const sub = subclassesBackend.find(s => String(s.id) === subId);
      if (sub && sub.ncms) {
        const ncms = Array.isArray(sub.ncms) ? sub.ncms : [sub.ncms];
        setCadastroNcm(String(ncms[0] || ""));
      }
    } else {
      const cls = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);
      const sub = cls?.subclasses.find(s => s.id === subId);
      if (sub) setCadastroNcm(sub.ncm);
    }
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
    try {
      await crudDelete("produtos", produto.id);
      setSelectedProduto(null);
      setSelectedProdutoFull(null);
      setEditProduto(null);
      fetchProdutos();
    } catch (err) {
      setError(`Erro ao excluir: ${err instanceof Error ? err.message : "Falha"}`);
    }
  };

  const handleVerificarCompletude = async (produto: Produto) => {
    setCompletudeLoading(true);
    try {
      const result = await getProdutoCompletude(produto.id);
      setCompletudeResult(result);
    } catch (err) {
      setError(`Erro ao verificar completude: ${err instanceof Error ? err.message : "Falha"}`);
    } finally {
      setCompletudeLoading(false);
    }
  };

  const handleEditarAbrir = async (produto: Produto) => {
    setEditProduto(produto);
    setEditForm({
      nome: produto.nome || "",
      fabricante: produto.fabricante || "",
      modelo: produto.modelo || "",
      codigo_interno: produto.codigo_interno || "",
      ncm: produto.ncm || "",
      descricao: produto.descricao || "",
    });

    // Resolver hierarquia: subclasse → classe → área
    const subId = produto.subclasse_id || "";
    setEditSubclasse(subId);
    if (subId) {
      const sub = subclassesBackend.find(s => String(s.id) === subId);
      const clsId = sub ? String(sub.classe_id || "") : "";
      setEditClasse(clsId);
      if (clsId) {
        const cls = classesV2Backend.find(c => String(c.id) === clsId);
        setEditArea(cls ? String(cls.area_id || "") : "");
      } else {
        setEditArea("");
      }
    } else {
      setEditClasse("");
      setEditArea("");
    }

    // Carregar especificações existentes
    setEditLoading(true);
    try {
      const full = await getProduto(produto.id);
      const specsMap: Record<string, { id?: string; valor: string; unidade?: string }> = {};
      if (full.especificacoes) {
        for (const spec of full.especificacoes) {
          specsMap[spec.nome_especificacao] = {
            id: spec.id,
            valor: spec.valor || "",
            unidade: spec.unidade || "",
          };
        }
      }
      setEditSpecs(specsMap);
    } catch {
      setEditSpecs({});
    } finally {
      setEditLoading(false);
    }
  };

  // Máscara da subclasse selecionada na edição
  const editMascara = (() => {
    if (!editSubclasse) return [];
    const sub = subclassesBackend.find(s => String(s.id) === editSubclasse);
    if (!sub || !sub.campos_mascara) return [];
    return parseMascaraTop(sub.campos_mascara);
  })();

  const handleEditarSalvar = async () => {
    if (!editProduto) return;
    setEditSaving(true);
    try {
      // Salvar dados básicos do produto
      await crudUpdate("produtos", editProduto.id, {
        ...editForm,
        subclasse_id: editSubclasse || null,
      });

      // Salvar especificações: update existentes, create novas
      for (const campo of editMascara) {
        const specData = editSpecs[campo.campo];
        const valor = specData?.valor?.trim() || "";
        if (!valor) continue;
        if (specData?.id) {
          // Update existente
          await crudUpdate("produtos-especificacoes", specData.id, {
            valor,
            unidade: campo.unidade || specData.unidade || "",
          });
        } else {
          // Criar nova
          await crudCreate("produtos-especificacoes", {
            produto_id: editProduto.id,
            nome_especificacao: campo.campo,
            valor,
            unidade: campo.unidade || "",
          });
        }
      }

      setEditProduto(null);
      fetchProdutos();
    } catch (err) {
      setError(`Erro ao salvar: ${err instanceof Error ? err.message : "Falha"}`);
    } finally {
      setEditSaving(false);
    }
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

  // === Dados derivados da hierarquia v2 (Area → Classe → Subclasse) ===
  const useBackendClasses = areasBackend.length > 0;

  // Options para dropdown de area
  const areaOptions = useBackendClasses
    ? [{ value: "", label: "Selecione a area..." }, ...areasBackend.map(a => ({ value: String(a.id), label: String(a.nome || a.id) }))]
    : [{ value: "", label: "Selecione a area..." }];

  // Options para dropdown de classe (filtradas por area)
  const classeOptions = (() => {
    const base = [{ value: "", label: "Selecione a classe..." }];
    if (useBackendClasses) {
      if (!cadastroArea) return base;
      const filtered = classesV2Backend.filter(c => String(c.area_id) === cadastroArea);
      return [...base, ...filtered.map(c => ({ value: String(c.id), label: String(c.nome || c.id) }))];
    }
    return [...base, ...CLASSES_PRODUTO.map(c => ({ value: c.id, label: c.label }))];
  })();

  // Options para dropdown de subclasse (filtradas por classe)
  const subclasseOptions = (() => {
    const base = [{ value: "", label: "Selecione a subclasse..." }];
    if (!cadastroClasse) return base;
    if (useBackendClasses) {
      const subs = subclassesBackend.filter(s => String(s.classe_id) === cadastroClasse);
      return [...base, ...subs.map(s => ({ value: String(s.id), label: String(s.nome || s.id) }))];
    }
    const cls = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);
    return [...base, ...(cls?.subclasses.map(s => ({ value: s.id, label: s.label })) || [])];
  })();

  // Specs da subclasse selecionada (campos_mascara enriquecida)
  interface SpecCampo {
    campo: string;
    tipo: "texto" | "numero" | "decimal" | "select" | "boolean";
    unidade?: string;
    placeholder?: string;
    opcoes?: string[];
    obrigatorio?: boolean;
  }

  const parseMascara = (raw: unknown): SpecCampo[] => {
    try {
      let mascara = typeof raw === "string" ? JSON.parse(raw) : raw;
      // Handle double-encoded JSON
      if (typeof mascara === "string") mascara = JSON.parse(mascara);
      if (!Array.isArray(mascara) || mascara.length === 0) return [];
      return mascara.map((m: Record<string, unknown>) => ({
        campo: String(m.campo || m.nome || ""),
        tipo: (m.tipo as SpecCampo["tipo"]) || "texto",
        unidade: m.unidade ? String(m.unidade) : undefined,
        placeholder: m.placeholder ? String(m.placeholder) : undefined,
        opcoes: Array.isArray(m.opcoes) ? m.opcoes.map(String) : undefined,
        obrigatorio: Boolean(m.obrigatorio),
      }));
    } catch { return []; }
  };

  const specsClasse: SpecCampo[] = (() => {
    // Specs só aparecem quando uma subclasse é selecionada
    if (!cadastroSubclasse) return [];
    if (useBackendClasses) {
      const sub = subclassesBackend.find(s => String(s.id) === cadastroSubclasse);
      if (sub && sub.campos_mascara) return parseMascara(sub.campos_mascara);
      return [];
    }
    // Fallback hardcoded
    return (SPECS_POR_CLASSE[cadastroClasse] || SPECS_POR_CLASSE["equipamento"] || []).map(s => ({
      ...s, tipo: "texto" as const,
    }));
  })();

  const classeAtualLabel = (() => {
    if (useBackendClasses) {
      if (cadastroSubclasse) {
        const sub = subclassesBackend.find(s => String(s.id) === cadastroSubclasse);
        if (sub) return String(sub.nome);
      }
      const cls = classesV2Backend.find(c => String(c.id) === cadastroClasse);
      return cls ? String(cls.nome) : "";
    }
    if (cadastroSubclasse) {
      const cls = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);
      const sub = cls?.subclasses.find(s => s.id === cadastroSubclasse);
      if (sub) return sub.label;
    }
    const cls = CLASSES_PRODUTO.find(c => c.id === cadastroClasse);
    return cls?.label || "";
  })();

  // Pipeline status badge colors
  const pipelineStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
    cadastrado:  { color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "Cadastrado" },
    qualificado: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Qualificado" },
    ofertado:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Ofertado" },
    vencedor:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Vencedor" },
  };

  // Pipeline counters
  const pipelineCounts = {
    cadastrado:  filteredProdutos.filter(p => !p.status_pipeline || p.status_pipeline === "cadastrado").length,
    qualificado: filteredProdutos.filter(p => p.status_pipeline === "qualificado").length,
    ofertado:    filteredProdutos.filter(p => p.status_pipeline === "ofertado").length,
    vencedor:    filteredProdutos.filter(p => p.status_pipeline === "vencedor").length,
  };

  // NCM alert: products without NCM
  const produtosSemNcm = filteredProdutos.filter(p => !p.ncm || p.ncm.trim() === "");

  // Mapa de subclasses para exibir nome na tabela
  const subclasseMap = Object.fromEntries(subclassesBackend.map(s => [String(s.id), String(s.nome || "")]));

  const getSubclasseNome = (p: Produto): string => {
    if (p.subclasse_id && subclasseMap[p.subclasse_id]) return subclasseMap[p.subclasse_id];
    return p.categoria || "-";
  };

  // Colunas da tabela
  const columns: Column<Produto>[] = [
    { key: "nome", header: "Produto", sortable: true },
    { key: "fabricante", header: "Fabricante", sortable: true, render: (p) => p.fabricante || "-" },
    { key: "codigo_interno", header: "SKU", render: (p) => p.codigo_interno || "-" },
    {
      key: "categoria", header: "Subclasse", sortable: true,
      render: (p) => getSubclasseNome(p),
    },
    {
      key: "status_pipeline", header: "Status", sortable: true,
      render: (p) => {
        const status = p.status_pipeline || "cadastrado";
        const cfg = pipelineStatusConfig[status] || pipelineStatusConfig.cadastrado;
        return (
          <span style={{
            display: "inline-block", padding: "2px 10px", borderRadius: 12,
            fontSize: "0.82rem", fontWeight: 600,
            color: cfg.color, background: cfg.bg,
          }}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "acoes", header: "Acoes", width: "200px",
      render: (p) => (
        <div className="table-actions">
          <button title="Visualizar" onClick={(e) => { e.stopPropagation(); handleSelectProduto(p); }}><Eye size={16} /></button>
          <button title="Editar" onClick={(e) => { e.stopPropagation(); handleEditarAbrir(p); }}><Edit2 size={16} /></button>
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

        {processingMessage && (
          <div className="portfolio-processing-toast">
            <Loader2 size={16} className="spin" />
            <span>{processingMessage}</span>
          </div>
        )}

        {iaResponse && (
          <Card>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIaResponse(null)}
                style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "18px" }}
              >&times;</button>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <Sparkles size={20} style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: 2 }} />
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{iaResponse}</div>
              </div>
            </div>
          </Card>
        )}

        {/* ====================================================
            TAB: MEUS PRODUTOS
            ==================================================== */}
        {activeTab === "produtos" && (
          <>
            {/* Pipeline status counters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              {(Object.entries(pipelineCounts) as [string, number][]).map(([status, count]) => {
                const cfg = pipelineStatusConfig[status];
                return (
                  <div key={status} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 16px", borderRadius: 8,
                    background: cfg.bg, border: `1px solid ${cfg.color}22`,
                  }}>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: cfg.color }}>{count}</span>
                    <span style={{ fontSize: "0.85rem", color: cfg.color }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>

            {/* NCM alert summary */}
            {produtosSemNcm.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", marginBottom: 12, borderRadius: 8,
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                color: "#f59e0b", fontSize: "0.9rem",
              }}>
                <AlertTriangle size={16} />
                <span><strong>{produtosSemNcm.length}</strong> produto{produtosSemNcm.length > 1 ? "s" : ""} sem NCM cadastrado</span>
              </div>
            )}

            {/* Filtros: Área → Classe → Subclasse */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Área:</label>
                <select
                  className="form-input"
                  style={{ minWidth: 160 }}
                  value={filtroArea}
                  onChange={(e) => { setFiltroArea(e.target.value); setFiltroClasse(""); setFiltroSubclasse(""); }}
                >
                  <option value="">Todas</option>
                  {areasBackend.map(a => (
                    <option key={String(a.id)} value={String(a.id)}>{String(a.nome)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Classe:</label>
                <select
                  className="form-input"
                  style={{ minWidth: 160 }}
                  value={filtroClasse}
                  disabled={!filtroArea}
                  onChange={(e) => { setFiltroClasse(e.target.value); setFiltroSubclasse(""); }}
                >
                  <option value="">Todas</option>
                  {classesV2Backend
                    .filter(c => !filtroArea || String(c.area_id) === filtroArea)
                    .map(c => (
                      <option key={String(c.id)} value={String(c.id)}>{String(c.nome)}</option>
                    ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Subclasse:</label>
                <select
                  className="form-input"
                  style={{ minWidth: 180 }}
                  value={filtroSubclasse}
                  disabled={!filtroClasse}
                  onChange={(e) => setFiltroSubclasse(e.target.value)}
                >
                  <option value="">Todas</option>
                  {subclassesBackend
                    .filter(s => !filtroClasse || String(s.classe_id) === filtroClasse)
                    .map(s => (
                      <option key={String(s.id)} value={String(s.id)}>{String(s.nome)}</option>
                    ))}
                </select>
              </div>
            </div>

            <Card>
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar produto, fabricante, modelo..."
                filters={[]}
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
              <div ref={detalheRef}>
              <Card
                title={`Detalhes: ${detalhe.nome}`}
                actions={
                  <div className="card-actions">
                    <ActionButton icon={<RefreshCw size={14} />} label="Reprocessar IA" onClick={() => handleReprocessar(detalhe)} />
                    <ActionButton icon={<Search size={14} />} label="Verificar Completude" onClick={() => handleVerificarCompletude(detalhe)} />
                    <ActionButton icon={<DollarSign size={14} />} label="Precos de Mercado" onClick={() => onSendToChat("Busque precos de " + detalhe.nome + " no PNCP")} />
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
                      <div className="info-group"><label>Status Pipeline</label><span>{(() => {
                        const st = detalhe.status_pipeline || "cadastrado";
                        const cfg = pipelineStatusConfig[st] || pipelineStatusConfig.cadastrado;
                        return <span style={{ padding: "2px 10px", borderRadius: 12, fontSize: "0.82rem", fontWeight: 600, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>;
                      })()}</span></div>
                      <div className="info-group"><label>Registro ANVISA</label><span>{detalhe.registro_anvisa || "-"}</span></div>
                      <div className="info-group"><label>Status ANVISA</label><span>{detalhe.anvisa_status ? detalhe.anvisa_status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "-"}</span></div>
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
              </div>
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
                        {"multi" in type && (type as Record<string, unknown>).multi && (
                          <p style={{ fontSize: 11, color: "var(--accent-primary)", margin: "4px 0 8px", display: "flex", alignItems: "center", gap: 4 }}>
                            <AlertCircle size={12} /> Multiplos produtos serao importados automaticamente
                          </p>
                        )}
                        {!("multi" in type && (type as Record<string, unknown>).multi) && type.id !== "website" && (
                          <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "4px 0 8px" }}>
                            Um produto sera identificado e cadastrado
                          </p>
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
                {/* Linha 1: Nome + Area */}
                <div className="cadastro-row">
                  <FormField label="Nome do Produto" required>
                    <TextInput
                      value={cadastroNome}
                      onChange={setCadastroNome}
                      placeholder="Ex: Centrifuga Refrigerada"
                    />
                  </FormField>
                  {useBackendClasses ? (
                    <FormField label="Area">
                      <SelectInput
                        value={cadastroArea}
                        onChange={handleAreaChange}
                        options={areaOptions}
                      />
                    </FormField>
                  ) : (
                    <FormField label="Classe">
                      <SelectInput
                        value={cadastroClasse}
                        onChange={handleClasseChange}
                        options={classeOptions}
                      />
                    </FormField>
                  )}
                </div>

                {/* Linha 2: Classe + Subclasse (cascata) */}
                <div className="cadastro-row">
                  {useBackendClasses && (
                    <FormField label="Classe">
                      <SelectInput
                        value={cadastroClasse}
                        onChange={handleClasseChange}
                        options={classeOptions}
                      />
                    </FormField>
                  )}
                  <FormField label="Subclasse">
                    <SelectInput
                      value={cadastroSubclasse}
                      onChange={handleSubclasseChange}
                      options={subclasseOptions}
                    />
                  </FormField>
                  {!useBackendClasses && (
                    <FormField label="NCM">
                      <TextInput value={cadastroNcm} onChange={setCadastroNcm} placeholder="Ex: 9027.30.11" />
                    </FormField>
                  )}
                </div>

                {/* Linha 3: NCM (auto) + Fabricante + Modelo */}
                <div className="cadastro-row">
                  {useBackendClasses && (
                    <FormField label="NCM" hint="Preenchido automaticamente pela subclasse">
                      <TextInput value={cadastroNcm} onChange={setCadastroNcm} placeholder="Selecione a subclasse..." />
                    </FormField>
                  )}
                  <FormField label="Fabricante">
                    <TextInput value={cadastroFabricante} onChange={setCadastroFabricante} placeholder="Ex: Shimadzu" />
                  </FormField>
                  <FormField label="Modelo">
                    <TextInput value={cadastroModelo} onChange={setCadastroModelo} placeholder="Ex: UV-2600i" />
                  </FormField>
                </div>

                {/* Specs dinamicas da subclasse selecionada */}
                {cadastroSubclasse && specsClasse.length > 0 && (
                  <div className="cadastro-specs-section">
                    <div className="cadastro-specs-header">
                      <h4>
                        <Sparkles size={16} style={{ color: "#8b5cf6" }} />
                        Especificacoes Tecnicas — {classeAtualLabel}
                      </h4>
                      <span className="ia-hint">A IA pode preencher estes campos automaticamente via upload</span>
                    </div>
                    <div className="cadastro-specs-grid">
                      {specsClasse.map((spec) => (
                        <FormField key={spec.campo} label={`${spec.campo}${spec.unidade ? ` (${spec.unidade})` : ""}${spec.obrigatorio ? " *" : ""}`}>
                          {spec.tipo === "select" && spec.opcoes ? (
                            <SelectInput
                              value={cadastroSpecs[spec.campo] || ""}
                              onChange={(v) => handleSpecChange(spec.campo, v)}
                              options={[{ value: "", label: "Selecione..." }, ...spec.opcoes.map(o => ({ value: o, label: o }))]}
                            />
                          ) : spec.tipo === "boolean" ? (
                            <SelectInput
                              value={cadastroSpecs[spec.campo] || ""}
                              onChange={(v) => handleSpecChange(spec.campo, v)}
                              options={[{ value: "", label: "Selecione..." }, { value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }]}
                            />
                          ) : spec.tipo === "numero" || spec.tipo === "decimal" ? (
                            <TextInput
                              value={cadastroSpecs[spec.campo] || ""}
                              onChange={(v) => handleSpecChange(spec.campo, v)}
                              placeholder={spec.placeholder || `Ex: ${spec.tipo === "decimal" ? "12.5" : "100"}`}
                            />
                          ) : (
                            <TextInput
                              value={cadastroSpecs[spec.campo] || ""}
                              onChange={(v) => handleSpecChange(spec.campo, v)}
                              placeholder={spec.placeholder || ""}
                            />
                          )}
                        </FormField>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botoes */}
                <div className="cadastro-actions">
                  <button className="btn btn-secondary" onClick={() => {
                    setCadastroNome(""); setCadastroArea(""); setCadastroClasse(""); setCadastroSubclasse("");
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
            <Card title="Estrutura de Classificacao" subtitle="Area → Classe → Subclasse (com mascaras de especificacao)">
              <div className="classificacao-tree">
                {useBackendClasses ? (
                  areasBackend.length > 0 ? (
                    areasBackend.map((area) => {
                      const aId = String(area.id);
                      const classesInArea = classesV2Backend.filter(c => String(c.area_id) === aId);
                      return (
                        <div key={aId} className="classificacao-classe">
                          <div
                            className="classificacao-classe-header"
                            onClick={() => setExpandedArea(expandedArea === aId ? null : aId)}
                            style={{ background: "rgba(59,130,246,0.08)" }}
                          >
                            {expandedArea === aId ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <FolderOpen size={16} style={{ color: "#3b82f6" }} />
                            <span className="classificacao-classe-nome">{String(area.nome)}</span>
                            <span className="classificacao-count">
                              {classesInArea.length} classe(s)
                            </span>
                          </div>
                          {expandedArea === aId && classesInArea.length > 0 && (
                            <div className="classificacao-subclasses" style={{ paddingLeft: 12 }}>
                              {classesInArea.map((classe) => {
                                const cId = String(classe.id);
                                const subs = subclassesBackend.filter(s => String(s.classe_id) === cId);
                                return (
                                  <div key={cId} className="classificacao-classe" style={{ marginTop: 4 }}>
                                    <div
                                      className="classificacao-classe-header"
                                      onClick={() => setExpandedClasse(expandedClasse === cId ? null : cId)}
                                    >
                                      {expandedClasse === cId ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                      <span className="classificacao-classe-nome">{String(classe.nome)}</span>
                                      <span className="classificacao-count">{subs.length} subclasse(s)</span>
                                    </div>
                                    {expandedClasse === cId && subs.length > 0 && (
                                      <div className="classificacao-subclasses">
                                        {subs.map((sub) => {
                                          const mascara = parseMascara(sub.campos_mascara);
                                          const ncms = Array.isArray(sub.ncms) ? (sub.ncms as string[]).join(", ") : String(sub.ncms || "");
                                          return (
                                            <div key={String(sub.id)} className="classificacao-subclasse">
                                              <span className="classificacao-sub-nome">{String(sub.nome)}</span>
                                              {ncms && <span className="classificacao-ncm-badge small">NCM: {ncms}</span>}
                                              {mascara.length > 0 && (
                                                <span className="classificacao-count" style={{ color: "#8b5cf6" }}>
                                                  {mascara.length} campo(s)
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-specs">
                      <AlertCircle size={16} />
                      <span>Nenhuma area cadastrada. Configure nos CRUDs de Areas, Classes e Subclasses.</span>
                    </div>
                  )
                ) : (
                  CLASSES_PRODUTO.map((classe) => (
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
                  ))
                )}
              </div>

              <div className="classificacao-ia-note">
                <Sparkles size={16} style={{ color: "#8b5cf6" }} />
                <span>A estrutura de classificacao e gerenciada nos CRUDs de Areas, Classes e Subclasses (menu Cadastros).</span>
              </div>
            </Card>

            {/* Card Agente de Monitoramento + Funil */}
            <Card
              title="Funil de Monitoramento"
              icon={<Radio size={18} />}
              subtitle="O Agente Autonomo que Monitora o Mercado por Voce"
            >
              {monitoramentosLoading ? (
                <div className="loading-detail">
                  <Loader2 size={20} className="spin" />
                  <span>Carregando monitoramentos...</span>
                </div>
              ) : (
                <div className="funil-monitoramento">
                  <div className="funil-steps">
                    <div className="funil-step">
                      <div className="funil-step-icon" style={{ background: "rgba(59,130,246,0.15)" }}>
                        <Radio size={24} style={{ color: "#3b82f6" }} />
                      </div>
                      <div className="funil-step-content">
                        <h4>Monitoramento Continuo</h4>
                        <p>
                          {monitoramentos.filter(m => m.status === "ativo").length} monitoramento(s) ativo(s)
                          {monitoramentos.length > 0 && ` de ${monitoramentos.length} cadastrado(s)`}
                          {monitoramentos.length === 0 && " — nenhum monitoramento cadastrado ainda"}
                        </p>
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
                          {classesV2Backend.length > 0
                            ? classesV2Backend.map((c) => (
                                <span key={String(c.id)} className="monitor-tag">{String(c.nome)}</span>
                              ))
                            : (
                              <>
                                <span className="monitor-tag">Comodato de equipamentos</span>
                                <span className="monitor-tag">Alugueis com/sem consumo de reagentes</span>
                                <span className="monitor-tag">Venda de equipamentos</span>
                                <span className="monitor-tag">Consumo de insumos hospitalares</span>
                              </>
                            )
                          }
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
                        <p>Classificacao parametrizada em {classesV2Backend.length > 0 ? classesV2Backend.length : CLASSES_PRODUTO.length} classes</p>
                      </div>
                    </div>
                  </div>

                  <div className="funil-status">
                    <StatusBadge
                      status={monitoramentos.some(m => m.status === "ativo") ? "success" : "neutral"}
                      label={monitoramentos.some(m => m.status === "ativo") ? "Agente Ativo" : "Agente Inativo"}
                      size="small"
                    />
                    <span>Ultima verificacao: {(() => {
                      const dt = monitoramentos[0]?.updated_at || monitoramentos[0]?.ultimo_check;
                      if (!dt) return "Nenhuma verificacao ainda";
                      try { return new Date(dt as string).toLocaleString("pt-BR"); } catch { return "Nenhuma verificacao ainda"; }
                    })()}</span>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* === MODAL COMPLETUDE === */}
      <Modal
        isOpen={!!completudeResult || completudeLoading}
        onClose={() => { setCompletudeResult(null); setCompletudeLoading(false); }}
        title={completudeResult ? `Completude: ${completudeResult.produto.nome}` : "Verificando completude..."}
        footer={
          <button className="btn btn-secondary" onClick={() => setCompletudeResult(null)}>Fechar</button>
        }
      >
        {completudeLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2rem 0", justifyContent: "center" }}>
            <Loader2 size={20} className="spin" /> Analisando...
          </div>
        ) : completudeResult && (
          <>
            {/* Barras de percentual */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ textAlign: "center", padding: 12, borderRadius: 8, background: "var(--bg-secondary)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: completudeResult.completude.percentual_geral >= 80 ? "#22c55e" : completudeResult.completude.percentual_geral >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {completudeResult.completude.percentual_geral}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Geral</div>
              </div>
              <div style={{ textAlign: "center", padding: 12, borderRadius: 8, background: "var(--bg-secondary)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: completudeResult.completude.percentual_basicos >= 80 ? "#22c55e" : "#f59e0b" }}>
                  {completudeResult.completude.percentual_basicos}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Dados Basicos</div>
              </div>
              <div style={{ textAlign: "center", padding: 12, borderRadius: 8, background: "var(--bg-secondary)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: completudeResult.completude.percentual_mascara >= 80 ? "#22c55e" : completudeResult.completude.percentual_mascara >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {completudeResult.completude.percentual_mascara}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Especificacoes</div>
              </div>
            </div>

            {/* Campos básicos */}
            <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>Dados Basicos ({completudeResult.campos_basicos.filter(c => c.preenchido).length}/{completudeResult.campos_basicos.length})</h4>
            <table style={{ width: "100%", fontSize: "0.85rem", marginBottom: 16, borderCollapse: "collapse" }}>
              <tbody>
                {completudeResult.campos_basicos.map(c => (
                  <tr key={c.campo} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td style={{ padding: "4px 8px", width: 24 }}>
                      {c.preenchido
                        ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                        : <AlertCircle size={16} style={{ color: "#ef4444" }} />}
                    </td>
                    <td style={{ padding: "4px 8px", fontWeight: 500 }}>{c.campo}</td>
                    <td style={{ padding: "4px 8px", color: c.preenchido ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                      {c.preenchido ? c.valor : "Nao preenchido"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Especificações vs máscara */}
            {completudeResult.subclasse_nome ? (
              <>
                <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>
                  Especificacoes — {completudeResult.subclasse_nome} ({completudeResult.mascara_check.filter(c => c.preenchido).length}/{completudeResult.mascara_check.length})
                </h4>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {completudeResult.mascara_check.map(c => (
                        <tr key={c.campo} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                          <td style={{ padding: "3px 8px", width: 24 }}>
                            {c.preenchido
                              ? <CheckCircle size={14} style={{ color: "#22c55e" }} />
                              : <AlertCircle size={14} style={{ color: "#ef4444" }} />}
                          </td>
                          <td style={{ padding: "3px 8px", fontWeight: 500 }}>
                            {c.campo}{c.unidade ? ` (${c.unidade})` : ""}
                          </td>
                          <td style={{ padding: "3px 8px", color: c.preenchido ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                            {c.preenchido ? c.valor : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ padding: "12px", background: "rgba(245,158,11,0.08)", borderRadius: 8, color: "#f59e0b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} />
                Produto sem subclasse atribuida — nao e possivel verificar especificacoes contra a mascara.
              </div>
            )}
          </>
        )}
      </Modal>

      {/* === MODAL EDITAR PRODUTO === */}
      <Modal
        isOpen={!!editProduto}
        onClose={() => setEditProduto(null)}
        title={`Editar: ${editProduto?.nome || ""}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditProduto(null)}>
              <X size={14} /> Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleEditarSalvar} disabled={editSaving || !editForm.nome}>
              {editSaving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Salvar
            </button>
          </>
        }
      >
        {editLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2rem 0", justifyContent: "center" }}>
            <Loader2 size={20} className="spin" /> Carregando dados...
          </div>
        ) : (
          <>
            {/* Dados básicos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Nome" required>
                <TextInput value={editForm.nome || ""} onChange={(v) => setEditForm(f => ({ ...f, nome: v }))} placeholder="Nome do produto" />
              </FormField>
              <FormField label="Fabricante">
                <TextInput value={editForm.fabricante || ""} onChange={(v) => setEditForm(f => ({ ...f, fabricante: v }))} placeholder="Fabricante" />
              </FormField>
              <FormField label="Modelo">
                <TextInput value={editForm.modelo || ""} onChange={(v) => setEditForm(f => ({ ...f, modelo: v }))} placeholder="Modelo" />
              </FormField>
              <FormField label="SKU / Codigo Interno">
                <TextInput value={editForm.codigo_interno || ""} onChange={(v) => setEditForm(f => ({ ...f, codigo_interno: v }))} placeholder="Codigo interno / SKU" />
              </FormField>
              <FormField label="NCM">
                <TextInput value={editForm.ncm || ""} onChange={(v) => setEditForm(f => ({ ...f, ncm: v }))} placeholder="Ex: 9027.30.00" />
              </FormField>
              <FormField label="Descricao">
                <TextInput value={editForm.descricao || ""} onChange={(v) => setEditForm(f => ({ ...f, descricao: v }))} placeholder="Descricao do produto" />
              </FormField>
            </div>

            {/* Classificação: Área → Classe → Subclasse */}
            <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border-primary)" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", color: "var(--text-primary)" }}>Classificacao</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <FormField label="Area">
                  <select className="form-input" value={editArea} onChange={(e) => { setEditArea(e.target.value); setEditClasse(""); setEditSubclasse(""); }}>
                    <option value="">Selecione...</option>
                    {areasBackend.map(a => <option key={String(a.id)} value={String(a.id)}>{String(a.nome)}</option>)}
                  </select>
                </FormField>
                <FormField label="Classe">
                  <select className="form-input" value={editClasse} disabled={!editArea} onChange={(e) => { setEditClasse(e.target.value); setEditSubclasse(""); }}>
                    <option value="">Selecione...</option>
                    {classesV2Backend.filter(c => String(c.area_id) === editArea).map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.nome)}</option>)}
                  </select>
                </FormField>
                <FormField label="Subclasse">
                  <select className="form-input" value={editSubclasse} disabled={!editClasse} onChange={(e) => setEditSubclasse(e.target.value)}>
                    <option value="">Selecione...</option>
                    {subclassesBackend.filter(s => String(s.classe_id) === editClasse).map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.nome)}</option>)}
                  </select>
                </FormField>
              </div>
            </div>

            {/* Especificações da máscara */}
            {editMascara.length > 0 && (
              <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border-primary)" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  Especificacoes Tecnicas ({editMascara.length} campos)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {editMascara.map((campo) => {
                    const specVal = editSpecs[campo.campo]?.valor || "";
                    return (
                      <FormField key={campo.campo} label={`${campo.campo}${campo.unidade ? ` (${campo.unidade})` : ""}`}>
                        {campo.tipo === "select" && campo.opcoes ? (
                          <select
                            className="form-input"
                            value={specVal}
                            onChange={(e) => setEditSpecs(prev => ({ ...prev, [campo.campo]: { ...prev[campo.campo], valor: e.target.value } }))}
                          >
                            <option value="">Selecione...</option>
                            {campo.opcoes.map(op => <option key={op} value={op}>{op}</option>)}
                          </select>
                        ) : campo.tipo === "boolean" ? (
                          <select
                            className="form-input"
                            value={specVal}
                            onChange={(e) => setEditSpecs(prev => ({ ...prev, [campo.campo]: { ...prev[campo.campo], valor: e.target.value } }))}
                          >
                            <option value="">Selecione...</option>
                            <option value="Sim">Sim</option>
                            <option value="Nao">Nao</option>
                          </select>
                        ) : (
                          <TextInput
                            value={specVal}
                            onChange={(v) => setEditSpecs(prev => ({ ...prev, [campo.campo]: { ...prev[campo.campo], valor: v } }))}
                            placeholder={campo.placeholder || campo.campo}
                          />
                        )}
                      </FormField>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

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
