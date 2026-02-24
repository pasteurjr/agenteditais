import { useState, useEffect, useCallback, useRef } from "react";
import type { PageProps } from "../types";
import { Settings, Globe, Bell, Palette, Plus, Play, Pause, Trash2, ChevronDown, ChevronRight, Pencil, MapPin, CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader2, AlertCircle, Lock, Info } from "lucide-react";
import { Card, DataTable, ActionButton, TabPanel, FormField, TextInput, Checkbox, SelectInput, Modal, StatusBadge } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate, crudDelete } from "../api/crud";

interface Fonte {
  id: string;
  nome: string;
  tipo: "api" | "scraper";
  url: string;
  ativa: boolean;
}

interface ClasseProdutoAPI {
  id: string;
  nome: string;
  tipo: string;
  ncms: string[];
  classe_pai_id: string | null;
  campos_mascara: Record<string, unknown> | null;
  qtd_produtos: number;
}

interface Subclasse {
  id: string;
  nome: string;
  ncms: string;
  produtos: number;
}

interface Classe {
  id: string;
  nome: string;
  ncms: string;
  subclasses: Subclasse[];
  produtos: number;
}

interface ParametroScoreAPI {
  id: string;
  estados_atuacao: string[];
  prazo_maximo: number;
  frequencia_maxima: string;
  tam: string;
  sam: string;
  som: string;
  tipos_edital: string[];
  palavras_chave: string[];
  ncms_busca: string[];
  [key: string]: unknown;
}

interface ParametroScore {
  id: string;
  nome: string;
  peso: number;
}

// Lista de estados brasileiros
const ESTADOS_BR = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" }, { uf: "AP", nome: "Amapa" },
  { uf: "AM", nome: "Amazonas" }, { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceara" },
  { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espirito Santo" }, { uf: "GO", nome: "Goias" },
  { uf: "MA", nome: "Maranhao" }, { uf: "MT", nome: "Mato Grosso" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "PA", nome: "Para" }, { uf: "PB", nome: "Paraiba" },
  { uf: "PR", nome: "Parana" }, { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piaui" },
  { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" }, { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondonia" }, { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "Sao Paulo" }, { uf: "SE", nome: "Sergipe" }, { uf: "TO", nome: "Tocantins" },
];

const DOCS_EXIGIDOS = [
  { tipo: "contrato_social", label: "Contrato Social" },
  { tipo: "habilitacao_fiscal", label: "Habilitacao Fiscal" },
  { tipo: "habilitacao_economica", label: "Habilitacao Economica" },
  { tipo: "qualificacao_tecnica", label: "Qualificacao Tecnica" },
  { tipo: "atestado_capacidade", label: "Atestado de Capacidade" },
  { tipo: "afe", label: "AFE (Alvara Funcionamento)" },
  { tipo: "cbpad", label: "CBPAD" },
  { tipo: "cbpp", label: "CBPP" },
  { tipo: "corpo_bombeiros", label: "Corpo de Bombeiros" },
  { tipo: "balanco_patrimonial", label: "Balanco Patrimonial" },
];

export function ParametrizacoesPage({ onSendToChat }: PageProps) {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [loadingFontes, setLoadingFontes] = useState(true);
  const [errorFontes, setErrorFontes] = useState<string | null>(null);
  const [parametros, setParametros] = useState<ParametroScore[]>([]);
  const [loadingParametros, setLoadingParametros] = useState(true);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Parametros-score state (persisted)
  const [paramScoreId, setParamScoreId] = useState<string | null>(null);
  const [paramScore, setParamScore] = useState<ParametroScoreAPI | null>(null);
  const [loadingParamScore, setLoadingParamScore] = useState(true);
  const [savingParamScore, setSavingParamScore] = useState(false);
  const [savingClasse, setSavingClasse] = useState(false);

  // Palavras-chave e NCMs editing
  const [editingPalavras, setEditingPalavras] = useState(false);
  const [palavrasText, setPalavrasText] = useState("");
  const [editingNcms, setEditingNcms] = useState(false);
  const [ncmsText, setNcmsText] = useState("");

  // Edit mode for classes (null = creating new, string = editing existing id)
  const [editingClasseId, setEditingClasseId] = useState<string | null>(null);

  // Fonte modal form state
  const [novaFonteNome, setNovaFonteNome] = useState("");
  const [novaFonteTipo, setNovaFonteTipo] = useState<"api" | "scraper">("api");
  const [novaFonteUrl, setNovaFonteUrl] = useState("");
  const [salvandoFonte, setSalvandoFonte] = useState(false);

  // Configuracoes de notificacao
  const [emailNotif, setEmailNotif] = useState("contato@aquila.com.br");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSistema, setNotifSistema] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [frequenciaResumo, setFrequenciaResumo] = useState("diario");

  // Preferencias
  const [tema, setTema] = useState("claro");
  const [idioma, setIdioma] = useState("pt-BR");
  const [fusoHorario, setFusoHorario] = useState("America/Sao_Paulo");

  // Tipos de edital
  const [tiposEdital, setTiposEdital] = useState({
    comodato: false,
    venda: false,
    aluguel: false,
    consumo: false,
    insumosLab: false,
    insumosHosp: false,
  });

  // Regiao de atuacao
  const [estadosSelecionados, setEstadosSelecionados] = useState<Set<string>>(new Set());
  const [todoBrasil, setTodoBrasil] = useState(false);

  // Comercial - Tempo de Entrega + Mercado
  const [prazoMaximo, setPrazoMaximo] = useState("");
  const [frequenciaMaxima, setFrequenciaMaxima] = useState("semanal");
  const [tam, setTam] = useState("");
  const [sam, setSam] = useState("");
  const [som, setSom] = useState("");

  // Modais
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [showClasseModal, setShowClasseModal] = useState(false);
  const [showSubclasseModal, setShowSubclasseModal] = useState(false);
  const [selectedClasseId, setSelectedClasseId] = useState<string | null>(null);

  // Campos do formulario de classe
  const [novaClasseNome, setNovaClasseNome] = useState("");
  const [novaClasseNCMs, setNovaClasseNCMs] = useState("");

  // Campos do formulario de subclasse
  const [novaSubclasseNome, setNovaSubclasseNome] = useState("");
  const [novaSubclasseNCMs, setNovaSubclasseNCMs] = useState("");

  // R1: Feedback salvar notificacoes
  const [notifSalvas, setNotifSalvas] = useState(false);

  // R2: Feedback salvar preferencias
  const [prefSalvas, setPrefSalvas] = useState(false);

  // R3: Fontes documentais da empresa
  const [empresaDocs, setEmpresaDocs] = useState<string[]>([]);
  const [empresaDocsLoaded, setEmpresaDocsLoaded] = useState(false);

  // R4: Editar subclasse
  const [editingSubclasseId, setEditingSubclasseId] = useState<string | null>(null);
  const [editingSubclasseClasseId, setEditingSubclasseClasseId] = useState<string | null>(null);

  // R5: Norteadores - tooltip state
  const [showPortfolioHint, setShowPortfolioHint] = useState(false);

  // Ref for tab container to programmatically switch tabs
  const tabContainerRef = useRef<HTMLDivElement>(null);

  const loadFontes = useCallback(async () => {
    try {
      setLoadingFontes(true);
      setErrorFontes(null);
      const res = await crudList("fontes-editais");
      setFontes(res.items.map(f => ({
        id: String(f.id ?? ""),
        nome: String(f.nome ?? ""),
        tipo: (f.tipo as "api" | "scraper") || "api",
        url: String(f.url ?? ""),
        ativa: Boolean(f.ativa ?? true),
      })));
    } catch (err) {
      setErrorFontes(err instanceof Error ? err.message : "Erro ao carregar fontes");
    } finally {
      setLoadingFontes(false);
    }
  }, []);

  const loadParametros = useCallback(async () => {
    try {
      setLoadingParametros(true);
      const res = await crudList("parametros-score");
      setParametros(res.items.map(p => ({
        id: String(p.id ?? ""),
        nome: String(p.nome ?? ""),
        peso: Number(p.peso ?? 0),
      })));
    } catch {
      // May not exist yet
    } finally {
      setLoadingParametros(false);
    }
  }, []);

  // Helper to convert tipos_edital array to checkbox state
  const tiposArrayToState = (tipos: string[]) => ({
    comodato: tipos.includes("comodato"),
    venda: tipos.includes("venda"),
    aluguel: tipos.includes("aluguel"),
    consumo: tipos.includes("consumo"),
    insumosLab: tipos.includes("insumosLab"),
    insumosHosp: tipos.includes("insumosHosp"),
  });

  // Helper to convert checkbox state to tipos_edital array
  const tiposStateToArray = (state: typeof tiposEdital) =>
    Object.entries(state).filter(([, v]) => v).map(([k]) => k);

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const res = await crudList("classes-produtos", { limit: 500 });
      const items = res.items as unknown as ClasseProdutoAPI[];

      // Build hierarchical tree from flat list
      const classesTop = items.filter(i => i.tipo === "classe");
      const tree: Classe[] = classesTop.map(c => {
        const subs = items.filter(i => i.tipo === "subclasse" && String(i.classe_pai_id) === String(c.id));
        return {
          id: String(c.id),
          nome: c.nome,
          ncms: Array.isArray(c.ncms) ? c.ncms.join(", ") : String(c.ncms || ""),
          produtos: c.qtd_produtos || 0,
          subclasses: subs.map(s => ({
            id: String(s.id),
            nome: s.nome,
            ncms: Array.isArray(s.ncms) ? s.ncms.join(", ") : String(s.ncms || ""),
            produtos: s.qtd_produtos || 0,
          })),
        };
      });
      setClasses(tree);
    } catch {
      // May not exist yet
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadParamScore = useCallback(async () => {
    try {
      setLoadingParamScore(true);
      const res = await crudList("parametros-score");
      if (res.items.length > 0) {
        const p = res.items[0] as unknown as ParametroScoreAPI;
        const id = String(p.id);
        setParamScoreId(id);
        setParamScore(p);

        // Populate local state from persisted data
        const estados = Array.isArray(p.estados_atuacao) ? p.estados_atuacao : [];
        setEstadosSelecionados(new Set(estados));
        setTodoBrasil(estados.length === 27);
        setPrazoMaximo(p.prazo_maximo != null ? String(p.prazo_maximo) : "");
        setFrequenciaMaxima(p.frequencia_maxima || "semanal");
        setTam(p.tam != null ? String(p.tam) : "");
        setSam(p.sam != null ? String(p.sam) : "");
        setSom(p.som != null ? String(p.som) : "");
        const tipos = Array.isArray(p.tipos_edital) ? p.tipos_edital : [];
        setTiposEdital(tiposArrayToState(tipos));
      }
    } catch {
      // May not exist yet
    } finally {
      setLoadingParamScore(false);
    }
  }, []);

  useEffect(() => {
    loadFontes();
    loadParametros();
    loadClasses();
    loadParamScore();

    // R3: Carregar documentos da empresa
    crudList("empresas", { limit: 1 }).then(async (empRes) => {
      if (empRes.items.length > 0) {
        const docsRes = await crudList("empresa-documentos", { parent_id: String(empRes.items[0].id) });
        setEmpresaDocs(docsRes.items.map(d => String(d.tipo || "")).filter(Boolean));
      }
      setEmpresaDocsLoaded(true);
    }).catch(() => {
      setEmpresaDocsLoaded(true);
    });
  }, [loadFontes, loadParametros, loadClasses, loadParamScore]);

  const handleToggleFonte = async (id: string) => {
    const fonte = fontes.find(f => f.id === id);
    if (!fonte) return;
    try {
      await crudUpdate("fontes-editais", id, { ativa: !fonte.ativa });
      setFontes(fontes.map(f => f.id === id ? { ...f, ativa: !f.ativa } : f));
    } catch (err) {
      setErrorFontes(err instanceof Error ? err.message : "Erro ao atualizar fonte");
    }
  };

  const handleExcluirFonte = async (id: string) => {
    if (!confirm("Excluir esta fonte?")) return;
    try {
      await crudDelete("fontes-editais", id);
      setFontes(fontes.filter(f => f.id !== id));
    } catch (err) {
      setErrorFontes(err instanceof Error ? err.message : "Erro ao excluir fonte");
    }
  };

  const handleSalvarFonte = async () => {
    if (!novaFonteNome.trim()) return;
    setSalvandoFonte(true);
    try {
      const created = await crudCreate("fontes-editais", {
        nome: novaFonteNome,
        tipo: novaFonteTipo,
        url: novaFonteUrl,
        ativa: true,
      });
      setFontes([...fontes, {
        id: String(created.id ?? ""),
        nome: novaFonteNome,
        tipo: novaFonteTipo,
        url: novaFonteUrl,
        ativa: true,
      }]);
      setNovaFonteNome("");
      setNovaFonteTipo("api");
      setNovaFonteUrl("");
      setShowFonteModal(false);
    } catch (err) {
      setErrorFontes(err instanceof Error ? err.message : "Erro ao salvar fonte");
    } finally {
      setSalvandoFonte(false);
    }
  };

  const getParamPeso = (nome: string) =>
    parametros.find(p => p.nome === nome)?.peso?.toString() || "";

  const updateParamPeso = async (nome: string, valor: string) => {
    const p = parametros.find(p => p.nome === nome);
    if (p) {
      await crudUpdate("parametros-score", p.id, { peso: Number(valor) });
      setParametros(parametros.map(pm => pm.id === p.id ? { ...pm, peso: Number(valor) } : pm));
    }
  };

  const toggleClasseExpansion = (classeId: string) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classeId)) {
        newSet.delete(classeId);
      } else {
        newSet.add(classeId);
      }
      return newSet;
    });
  };

  // Helper to ensure parametros-score record exists, returns the id
  const ensureParamScore = async (): Promise<string> => {
    if (paramScoreId) return paramScoreId;
    const created = await crudCreate("parametros-score", {
      estados_atuacao: [],
      prazo_maximo: 30,
      frequencia_maxima: "semanal",
      tam: 0,
      sam: 0,
      som: 0,
      tipos_edital: [],
      palavras_chave: [],
      ncms_busca: [],
    });
    const id = String(created.id);
    setParamScoreId(id);
    setParamScore(created as unknown as ParametroScoreAPI);
    return id;
  };

  // Save a partial update to parametros-score
  const saveParamScore = async (data: Record<string, unknown>) => {
    setSavingParamScore(true);
    try {
      const id = await ensureParamScore();
      await crudUpdate("parametros-score", id, data);
      setParamScore(prev => prev ? { ...prev, ...data } as ParametroScoreAPI : prev);
    } catch (err) {
      console.error("Erro ao salvar parametros-score:", err);
    } finally {
      setSavingParamScore(false);
    }
  };

  const toggleEstado = (uf: string) => {
    if (todoBrasil) return;
    setEstadosSelecionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uf)) {
        newSet.delete(uf);
      } else {
        newSet.add(uf);
      }
      return newSet;
    });
  };

  const handleTodoBrasil = (checked: boolean) => {
    setTodoBrasil(checked);
    if (checked) {
      setEstadosSelecionados(new Set(ESTADOS_BR.map(e => e.uf)));
    } else {
      setEstadosSelecionados(new Set());
    }
  };

  // Save handlers for comercial tab
  const handleSalvarEstados = async () => {
    await saveParamScore({ estados_atuacao: Array.from(estadosSelecionados) });
  };

  const handleSalvarTempoEntrega = async () => {
    await saveParamScore({
      prazo_maximo: prazoMaximo ? Number(prazoMaximo) : 0,
      frequencia_maxima: frequenciaMaxima,
    });
  };

  const handleSalvarMercado = async () => {
    await saveParamScore({
      tam: tam || "0",
      sam: sam || "0",
      som: som || "0",
    });
  };

  const handleSalvarTiposEdital = async () => {
    await saveParamScore({ tipos_edital: tiposStateToArray(tiposEdital) });
  };

  const handleSalvarPalavrasChave = async () => {
    const palavras = palavrasText.split(",").map(p => p.trim()).filter(Boolean);
    await saveParamScore({ palavras_chave: palavras });
    setEditingPalavras(false);
  };

  const handleSalvarNcmsBusca = async () => {
    const ncms = ncmsText.split(",").map(n => n.trim()).filter(Boolean);
    await saveParamScore({ ncms_busca: ncms });
    setEditingNcms(false);
  };

  // R1: Salvar notificacoes
  const handleSalvarNotificacoes = async () => {
    try {
      await saveParamScore({
        email_notificacao: emailNotif,
        notif_email: notifEmail,
        notif_sistema: notifSistema,
        notif_sms: notifSms,
        frequencia_resumo: frequenciaResumo,
      });
      setNotifSalvas(true);
      setTimeout(() => setNotifSalvas(false), 3000);
    } catch (e) {
      console.error("Erro ao salvar notificacoes:", e);
    }
  };

  // R2: Salvar preferencias
  const handleSalvarPreferencias = async () => {
    try {
      await saveParamScore({
        tema: tema,
        idioma: idioma,
        fuso_horario: fusoHorario,
      });
      setPrefSalvas(true);
      setTimeout(() => setPrefSalvas(false), 3000);
    } catch (e) {
      console.error("Erro ao salvar preferencias:", e);
    }
  };

  // R5: Helper to switch tab programmatically
  const switchToTab = (tabId: string) => {
    const container = tabContainerRef.current;
    if (!container) return;
    const tabBtn = container.querySelector<HTMLButtonElement>(`.tab-panel-tab:nth-child(${tabs.findIndex(t => t.id === tabId) + 1})`);
    if (tabBtn) tabBtn.click();
  };

  // R5: Helper to scroll to a card by title text
  const scrollToCard = (titleText: string) => {
    const container = tabContainerRef.current;
    if (!container) return;
    const headings = container.querySelectorAll<HTMLElement>(".card-title, h3");
    for (const h of headings) {
      if (h.textContent?.includes(titleText)) {
        h.closest(".card")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
  };

  // Funcao placeholder — tool_gerar_classes_portfolio sera criada na Onda 4 (T48)
  const handleGerarComIA = () => {};

  const handleExcluirClasse = async (classeId: string) => {
    if (!confirm("Excluir esta classe e suas subclasses?")) return;
    try {
      // Also delete subclasses belonging to this class
      const classe = classes.find(c => c.id === classeId);
      if (classe) {
        for (const sub of classe.subclasses) {
          await crudDelete("classes-produtos", sub.id);
        }
      }
      await crudDelete("classes-produtos", classeId);
      setClasses(classes.filter(c => c.id !== classeId));
    } catch (err) {
      console.error("Erro ao excluir classe:", err);
    }
  };

  const handleEditarClasse = (classe: Classe) => {
    setEditingClasseId(classe.id);
    setNovaClasseNome(classe.nome);
    setNovaClasseNCMs(classe.ncms);
    setShowClasseModal(true);
  };

  const handleExcluirSubclasse = async (classeId: string, subId: string) => {
    if (!confirm("Excluir esta subclasse?")) return;
    try {
      await crudDelete("classes-produtos", subId);
      setClasses(classes.map(c => {
        if (c.id === classeId) {
          return { ...c, subclasses: c.subclasses.filter(s => s.id !== subId) };
        }
        return c;
      }));
    } catch (err) {
      console.error("Erro ao excluir subclasse:", err);
    }
  };

  const handleSalvarClasse = async () => {
    if (!novaClasseNome.trim()) return;
    setSavingClasse(true);
    try {
      const ncmsArray = novaClasseNCMs.split(",").map(n => n.trim()).filter(Boolean);
      if (editingClasseId) {
        // Update existing
        await crudUpdate("classes-produtos", editingClasseId, {
          nome: novaClasseNome,
          ncms: ncmsArray,
        });
        setClasses(classes.map(c =>
          c.id === editingClasseId
            ? { ...c, nome: novaClasseNome, ncms: novaClasseNCMs }
            : c
        ));
        setEditingClasseId(null);
      } else {
        // Create new
        const created = await crudCreate("classes-produtos", {
          nome: novaClasseNome,
          tipo: "classe",
          ncms: ncmsArray,
        });
        const novaClasse: Classe = {
          id: String(created.id),
          nome: novaClasseNome,
          ncms: novaClasseNCMs,
          produtos: 0,
          subclasses: [],
        };
        setClasses([...classes, novaClasse]);
      }
      setNovaClasseNome("");
      setNovaClasseNCMs("");
      setShowClasseModal(false);
    } catch (err) {
      console.error("Erro ao salvar classe:", err);
    } finally {
      setSavingClasse(false);
    }
  };

  const handleSalvarSubclasse = async () => {
    if (!novaSubclasseNome.trim() || !selectedClasseId) return;
    setSavingClasse(true);
    try {
      const ncmsArray = novaSubclasseNCMs.split(",").map(n => n.trim()).filter(Boolean);

      if (editingSubclasseId) {
        // R4: Update existing subclasse
        await crudUpdate("classes-produtos", editingSubclasseId, {
          nome: novaSubclasseNome,
          ncms: ncmsArray,
        });
        setClasses(classes.map(c => {
          if (c.id === editingSubclasseClasseId) {
            return {
              ...c,
              subclasses: c.subclasses.map(s =>
                s.id === editingSubclasseId
                  ? { ...s, nome: novaSubclasseNome, ncms: novaSubclasseNCMs }
                  : s
              ),
            };
          }
          return c;
        }));
        setEditingSubclasseId(null);
        setEditingSubclasseClasseId(null);
      } else {
        // Create new subclasse
        const created = await crudCreate("classes-produtos", {
          nome: novaSubclasseNome,
          tipo: "subclasse",
          classe_pai_id: Number(selectedClasseId),
          ncms: ncmsArray,
        });
        setClasses(classes.map(c => {
          if (c.id === selectedClasseId) {
            return {
              ...c,
              subclasses: [
                ...c.subclasses,
                {
                  id: String(created.id),
                  nome: novaSubclasseNome,
                  ncms: novaSubclasseNCMs,
                  produtos: 0,
                },
              ],
            };
          }
          return c;
        }));
      }
      setNovaSubclasseNome("");
      setNovaSubclasseNCMs("");
      setShowSubclasseModal(false);
      setSelectedClasseId(null);
    } catch (err) {
      console.error("Erro ao salvar subclasse:", err);
    } finally {
      setSavingClasse(false);
    }
  };

  const fonteColumns: Column<Fonte>[] = [
    { key: "nome", header: "Nome", sortable: true },
    { key: "tipo", header: "Tipo", render: (f) => f.tipo.toUpperCase() },
    { key: "url", header: "URL" },
    {
      key: "ativa",
      header: "Status",
      render: (f) => (
        <span className={`status-badge ${f.ativa ? "status-badge-success" : "status-badge-neutral"}`}>
          {f.ativa ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Acoes",
      width: "100px",
      render: (f) => (
        <div className="table-actions">
          <button
            title={f.ativa ? "Pausar" : "Ativar"}
            onClick={() => handleToggleFonte(f.id)}
          >
            {f.ativa ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button title="Excluir" className="danger" onClick={() => handleExcluirFonte(f.id)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "produtos", label: "Produtos", icon: <Settings size={16} /> },
    { id: "comercial", label: "Comercial", icon: <Globe size={16} /> },
    { id: "fontes", label: "Fontes de Busca", icon: <Globe size={16} /> },
    { id: "notificacoes", label: "Notificacoes", icon: <Bell size={16} /> },
    { id: "preferencias", label: "Preferencias", icon: <Palette size={16} /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Settings size={24} />
          <div>
            <h1>Parametrizacoes</h1>
            <p>Configuracoes gerais do sistema</p>
          </div>
        </div>
      </div>

      <div className="page-content" ref={tabContainerRef}>
        <TabPanel tabs={tabs}>
          {(activeTab) => {
            switch (activeTab) {
              case "produtos":
                return (
                  <>
                    <Card
                      title="Estrutura de Classificacao"
                      actions={
                        <div className="card-actions">
                          <ActionButton icon={<Plus size={14} />} label="Nova Classe" onClick={() => setShowClasseModal(true)} />
                          <ActionButton
                            icon={<Lock size={14} />}
                            label="Gerar com IA (Onda 4)"
                            onClick={() => {}}
                            disabled
                          />
                        </div>
                      }
                    >
                      {loadingClasses ? (
                        <div className="loading-center">
                          <Loader2 size={20} className="spin" />
                          <span>Carregando classes...</span>
                        </div>
                      ) : (
                      <div className="classes-tree">
                        {classes.length === 0 && (
                          <p className="text-muted" style={{ padding: "16px", textAlign: "center" }}>
                            Nenhuma classe cadastrada. Clique em "Nova Classe" para comecar.
                          </p>
                        )}
                        {classes.map((classe) => (
                          <div key={classe.id} className="classe-item">
                            <div
                              className="classe-header"
                              onClick={() => toggleClasseExpansion(classe.id)}
                            >
                              <span className="classe-expand-icon">
                                {expandedClasses.has(classe.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </span>
                              <span className="classe-nome">{classe.nome}</span>
                              <span className="classe-ncm">NCMs: {classe.ncms}</span>
                              <span className="classe-count">{classe.subclasses.length} subclasses</span>
                              <span className="classe-count">{classe.produtos} produtos</span>
                              <div className="classe-actions">
                                <button title="Adicionar Subclasse" onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClasseId(classe.id);
                                  setShowSubclasseModal(true);
                                }}><Plus size={14} /></button>
                                <button title="Editar" onClick={(e) => { e.stopPropagation(); handleEditarClasse(classe); }}><Pencil size={14} /></button>
                                <button title="Excluir" className="danger" onClick={(e) => { e.stopPropagation(); handleExcluirClasse(classe.id); }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            {expandedClasses.has(classe.id) && classe.subclasses.length > 0 && (
                              <div className="subclasses-list">
                                {classe.subclasses.map((sub) => (
                                  <div key={sub.id} className="subclasse-item">
                                    <span className="subclasse-nome">{sub.nome}</span>
                                    <span className="subclasse-ncm">NCMs: {sub.ncms}</span>
                                    <span className="subclasse-count">{sub.produtos} produtos</span>
                                    <div className="subclasse-actions">
                                      <button title="Editar" onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSubclasseId(sub.id);
                                        setEditingSubclasseClasseId(classe.id);
                                        setNovaSubclasseNome(sub.nome);
                                        setNovaSubclasseNCMs(sub.ncms || "");
                                        setSelectedClasseId(classe.id);
                                        setShowSubclasseModal(true);
                                      }}><Pencil size={14} /></button>
                                      <button title="Excluir" className="danger" onClick={() => handleExcluirSubclasse(classe.id, sub.id)}><Trash2 size={14} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      )}
                    </Card>

                    <Card title="Tipos de Edital Desejados">
                      <div className="checkbox-grid">
                        <Checkbox
                          checked={tiposEdital.comodato}
                          onChange={(v) => setTiposEdital({ ...tiposEdital, comodato: v })}
                          label="Comodato de equipamentos"
                        />
                        <Checkbox
                          checked={tiposEdital.venda}
                          onChange={(v) => setTiposEdital({ ...tiposEdital, venda: v })}
                          label="Venda de equipamentos"
                        />
                        <Checkbox
                          checked={tiposEdital.aluguel}
                          onChange={(v) => setTiposEdital({ ...tiposEdital, aluguel: v })}
                          label="Aluguel com consumo de reagentes"
                        />
                        <Checkbox
                          checked={tiposEdital.consumo}
                          onChange={(v) => setTiposEdital({ ...tiposEdital, consumo: v })}
                          label="Consumo de reagentes"
                        />
                        <Checkbox
                          checked={tiposEdital.insumosLab}
                          onChange={(v) => setTiposEdital({ ...tiposEdital, insumosLab: v })}
                          label="Compra de insumos laboratoriais"
                        />
                        <Checkbox
                          checked={tiposEdital.insumosHosp}
                          onChange={(v) => setTiposEdital({ ...tiposEdital, insumosHosp: v })}
                          label="Compra de insumos hospitalares"
                        />
                      </div>
                      <div className="form-actions" style={{ marginTop: "12px" }}>
                        <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Tipos"} variant="primary" onClick={handleSalvarTiposEdital} disabled={savingParamScore} />
                      </div>
                    </Card>

                    {/* Norteadores de Score */}
                    <Card title="Norteadores de Score" subtitle="Configuracoes que alimentam o calculo de scores multi-dimensionais">
                      <div className="norteadores-grid">
                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => scrollToCard("Estrutura de Classificacao")}>
                          <div className="norteador-header">
                            {classes.length > 0
                              ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              : <XCircle size={16} style={{ color: "#ef4444" }} />}
                            <span className="norteador-label">(a) Classificacao/Agrupamento</span>
                            <span className="score-feed-badge feed-tecnico">Score Tecnico</span>
                          </div>
                          <p className="norteador-desc">Arvore de classes e subclasses acima</p>
                          {classes.length > 0
                            ? <StatusBadge status="success" label={`${classes.length} classe(s) configurada(s)`} size="small" />
                            : <StatusBadge status="error" label="Nao configurado" size="small" />}
                        </div>

                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => switchToTab("comercial")}>
                          <div className="norteador-header">
                            {estadosSelecionados.size > 0
                              ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              : <XCircle size={16} style={{ color: "#ef4444" }} />}
                            <span className="norteador-label">(b) Score Comercial</span>
                            <span className="score-feed-badge feed-comercial">Score Comercial</span>
                          </div>
                          <p className="norteador-desc">Regiao de atuacao, prazos e mercado (aba Comercial)</p>
                          {estadosSelecionados.size > 0
                            ? <StatusBadge status="success" label={`${estadosSelecionados.size} estado(s) selecionado(s)`} size="small" />
                            : <StatusBadge status="error" label="Nao configurado" size="small" />}
                        </div>

                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => scrollToCard("Tipos de Edital Desejados")}>
                          <div className="norteador-header">
                            {tiposStateToArray(tiposEdital).length > 0
                              ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              : <XCircle size={16} style={{ color: "#ef4444" }} />}
                            <span className="norteador-label">(c) Tipos de Edital</span>
                            <span className="score-feed-badge feed-recomendacao">Score Recomendacao</span>
                          </div>
                          <p className="norteador-desc">Checkboxes de tipos de edital acima</p>
                          {tiposStateToArray(tiposEdital).length > 0
                            ? <StatusBadge status="success" label={`${tiposStateToArray(tiposEdital).length} tipo(s) selecionado(s)`} size="small" />
                            : <StatusBadge status="error" label="Nao configurado" size="small" />}
                        </div>

                        <div className="norteador-item" style={{ cursor: "pointer", position: "relative" }} onClick={() => {
                          setShowPortfolioHint(true);
                          setTimeout(() => setShowPortfolioHint(false), 3000);
                        }}>
                          <div className="norteador-header">
                            <CheckCircle size={16} style={{ color: "#22c55e" }} />
                            <span className="norteador-label">(d) Score Tecnico</span>
                            <span className="score-feed-badge feed-tecnico">Score Tecnico</span>
                          </div>
                          <p className="norteador-desc">Baseado nas especificacoes dos produtos do Portfolio</p>
                          <StatusBadge status="success" label="Configurar no Portfolio" size="small" />
                          {showPortfolioHint && (
                            <div style={{
                              position: "absolute", bottom: "-32px", left: "50%", transform: "translateX(-50%)",
                              background: "#1e293b", color: "#fff", padding: "6px 12px", borderRadius: "6px",
                              fontSize: "12px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                            }}>
                              <Info size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                              Configure na pagina Portfolio
                            </div>
                          )}
                        </div>

                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => switchToTab("comercial")}>
                          <div className="norteador-header">
                            <AlertTriangle size={16} style={{ color: "#eab308" }} />
                            <span className="norteador-label">(e) Score Participacao</span>
                            <span className="score-feed-badge feed-recomendacao">Score Recomendacao</span>
                          </div>
                          <p className="norteador-desc">Documentos frequentemente solicitados em editais (configurar abaixo)</p>
                          <StatusBadge status="warning" label="Em configuracao" size="small" />
                        </div>

                        <div className="norteador-item">
                          <div className="norteador-header">
                            <XCircle size={16} style={{ color: "#6b7280" }} />
                            <span className="norteador-label">(f) Score Aderencia de Ganho</span>
                            <span className="score-feed-badge feed-ganho">Score Ganho</span>
                          </div>
                          <p className="norteador-desc">Historico: taxa de vitoria, margem media praticada</p>
                          <StatusBadge status="neutral" label="A definir" size="small" />
                        </div>
                      </div>

                      {/* Historico para Score Ganho */}
                      <div className="norteador-config-section">
                        <h4>Configurar Score Aderencia de Ganho (f)</h4>
                        {loadingParametros ? (
                          <div className="loading-center"><Loader2 size={16} className="spin" /><span>Carregando...</span></div>
                        ) : (
                          <div className="form-grid form-grid-3">
                            <FormField label="Taxa de Vitoria Historica (%)">
                              <TextInput value={getParamPeso("taxa_vitoria")} onChange={(v) => updateParamPeso("taxa_vitoria", v)} placeholder="Ex: 35" type="number" />
                            </FormField>
                            <FormField label="Margem Media Praticada (%)">
                              <TextInput value={getParamPeso("margem_media")} onChange={(v) => updateParamPeso("margem_media", v)} placeholder="Ex: 15" type="number" />
                            </FormField>
                            <FormField label="Total de Licitacoes Participadas">
                              <TextInput value={getParamPeso("total_licitacoes")} onChange={(v) => updateParamPeso("total_licitacoes", v)} placeholder="Ex: 120" type="number" />
                            </FormField>
                          </div>
                        )}
                        <ActionButton icon={<Lock size={14} />} label="Calcular pesos com IA (Onda 4)" onClick={() => {}} disabled />
                      </div>
                    </Card>

                    {/* Fontes Documentais Exigidas */}
                    <Card
                      title="Fontes Documentais Exigidas por Editais"
                      subtitle="Documentos que editais costumam solicitar - ligado ao cadastro da Empresa"
                    >
                      {!empresaDocsLoaded ? (
                        <div className="loading-center">
                          <Loader2 size={16} className="spin" />
                          <span>Carregando documentos da empresa...</span>
                        </div>
                      ) : empresaDocs.length === 0 && empresaDocsLoaded ? (
                        <div className="docs-exigidos-grid">
                          {DOCS_EXIGIDOS.map((doc, i) => (
                            <div key={i} className="doc-exigido-item">
                              <span style={{ fontSize: "14px" }}>{doc.label}</span>
                              <StatusBadge
                                status="error"
                                label="Nao temos"
                                size="small"
                              />
                            </div>
                          ))}
                          <p className="text-muted" style={{ marginTop: "12px", fontSize: "12px", gridColumn: "1 / -1" }}>
                            Configure documentos na pagina Empresa
                          </p>
                        </div>
                      ) : (
                        <div className="docs-exigidos-grid">
                          {DOCS_EXIGIDOS.map((doc, i) => (
                            <div key={i} className="doc-exigido-item">
                              <span style={{ fontSize: "14px" }}>{doc.label}</span>
                              <StatusBadge
                                status={empresaDocs.includes(doc.tipo) ? "success" : "error"}
                                label={empresaDocs.includes(doc.tipo) ? "Temos" : "Nao temos"}
                                size="small"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-muted" style={{ marginTop: "12px", fontSize: "12px" }}>
                        Status "Temos/Nao temos" e sincronizado com a pagina Empresa &rarr; Documentos
                      </p>
                    </Card>
                  </>
                );

              case "comercial":
                return (
                  <>
                    {loadingParamScore ? (
                      <div className="loading-center"><Loader2 size={20} className="spin" /><span>Carregando parametros comerciais...</span></div>
                    ) : (
                    <>
                    <Card title="Regiao de Atuacao" icon={<MapPin size={18} />}>
                      <div className="regiao-atuacao">
                        <div className="regiao-header">
                          <Checkbox
                            checked={todoBrasil}
                            onChange={handleTodoBrasil}
                            label="Atuar em todo o Brasil"
                          />
                        </div>
                        <div className="estados-grid">
                          {ESTADOS_BR.map((estado) => (
                            <button
                              key={estado.uf}
                              className={`estado-btn ${estadosSelecionados.has(estado.uf) ? "selected" : ""} ${todoBrasil ? "disabled" : ""}`}
                              onClick={() => toggleEstado(estado.uf)}
                              title={estado.nome}
                              disabled={todoBrasil}
                            >
                              {estado.uf}
                            </button>
                          ))}
                        </div>
                        <div className="estados-resumo">
                          <strong>Estados selecionados:</strong> {estadosSelecionados.size === 27 ? "Todos (Brasil)" : Array.from(estadosSelecionados).join(", ")}
                        </div>
                        <div className="form-actions" style={{ marginTop: "12px" }}>
                          <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Estados"} variant="primary" onClick={handleSalvarEstados} disabled={savingParamScore} />
                        </div>
                      </div>
                    </Card>

                    <Card title="Tempo de Entrega">
                      <div className="form-grid form-grid-2">
                        <FormField label="Prazo maximo aceito (dias)">
                          <TextInput value={prazoMaximo} onChange={(v) => setPrazoMaximo(v)} type="number" />
                        </FormField>
                        <FormField label="Frequencia maxima">
                          <SelectInput
                            value={frequenciaMaxima}
                            onChange={(v) => setFrequenciaMaxima(v)}
                            options={[
                              { value: "diaria", label: "Diaria" },
                              { value: "semanal", label: "Semanal" },
                              { value: "quinzenal", label: "Quinzenal" },
                              { value: "mensal", label: "Mensal" },
                            ]}
                          />
                        </FormField>
                      </div>
                      <div className="form-actions" style={{ marginTop: "12px" }}>
                        <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Prazo/Frequencia"} variant="primary" onClick={handleSalvarTempoEntrega} disabled={savingParamScore} />
                      </div>
                    </Card>

                    <Card title="Mercado (TAM/SAM/SOM)">
                      <div className="form-grid form-grid-3">
                        <FormField label="TAM (Mercado Total)" hint="Editais/ano">
                          <TextInput value={tam} onChange={(v) => setTam(v)} prefix="R$" />
                        </FormField>
                        <FormField label="SAM (Mercado Alcancavel)">
                          <TextInput value={sam} onChange={(v) => setSam(v)} prefix="R$" />
                        </FormField>
                        <FormField label="SOM (Mercado Objetivo)">
                          <TextInput value={som} onChange={(v) => setSom(v)} prefix="R$" />
                        </FormField>
                      </div>
                      <div className="form-actions" style={{ marginTop: "12px" }}>
                        <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Mercado"} variant="primary" onClick={handleSalvarMercado} disabled={savingParamScore} />
                        <ActionButton icon={<Lock size={14} />} label="Calcular com IA (Onda 4)" onClick={() => {}} disabled />
                      </div>
                    </Card>
                    </>
                    )}
                  </>
                );

              case "fontes":
                return (
                  <>
                    {errorFontes && (
                      <div className="portfolio-error">
                        <AlertCircle size={16} />
                        <span>{errorFontes}</span>
                        <button onClick={loadFontes}>Tentar novamente</button>
                      </div>
                    )}
                    <Card
                      title="Fontes de Editais"
                      actions={
                        <div className="card-actions">
                          <ActionButton
                            icon={<RefreshCw size={14} />}
                            label="Atualizar"
                            onClick={loadFontes}
                          />
                          <ActionButton
                            icon={<Plus size={14} />}
                            label="Cadastrar Fonte"
                            onClick={() => setShowFonteModal(true)}
                          />
                        </div>
                      }
                    >
                      {loadingFontes ? (
                        <div className="loading-center">
                          <Loader2 size={20} className="spin" />
                          <span>Carregando fontes...</span>
                        </div>
                      ) : (
                        <DataTable data={fontes} columns={fonteColumns} idKey="id" emptyMessage="Nenhuma fonte cadastrada. Use 'Cadastrar via IA' ou adicione manualmente." />
                      )}
                    </Card>

                    <Card title="Palavras-chave de Busca">
                      <div className="palavras-chave">
                        <ActionButton icon={<Lock size={14} />} label="Gerar do portfolio (Onda 4)" onClick={() => {}} disabled />
                        {editingPalavras ? (
                          <div style={{ marginTop: "8px" }}>
                            <FormField label="Palavras-chave (separadas por virgula)">
                              <TextInput
                                value={palavrasText}
                                onChange={setPalavrasText}
                                placeholder="microscopio, centrifuga, autoclave"
                              />
                            </FormField>
                            <div className="form-actions" style={{ marginTop: "8px" }}>
                              <ActionButton label={savingParamScore ? "Salvando..." : "Salvar"} variant="primary" onClick={handleSalvarPalavrasChave} disabled={savingParamScore} />
                              <ActionButton label="Cancelar" onClick={() => setEditingPalavras(false)} />
                            </div>
                          </div>
                        ) : (
                          <div className="tags-container">
                            {(paramScore?.palavras_chave && paramScore.palavras_chave.length > 0)
                              ? paramScore.palavras_chave.map((p, i) => (
                                  <span key={i} className="tag">{p}</span>
                                ))
                              : <span className="text-muted" style={{ fontSize: "13px" }}>Nenhuma palavra-chave cadastrada</span>
                            }
                            <button className="tag tag-add" onClick={() => {
                              setPalavrasText(paramScore?.palavras_chave?.join(", ") || "");
                              setEditingPalavras(true);
                            }}>+ Editar</button>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card title="NCMs para Busca" subtitle="Extraidos automaticamente das classes/subclasses do portfolio">
                      <div className="ncms-busca">
                        <div className="ncms-actions">
                          <ActionButton
                            icon={<Lock size={14} />}
                            label="Sincronizar NCMs (Onda 4)"
                            onClick={() => {}}
                            disabled
                          />
                        </div>
                        {editingNcms ? (
                          <div style={{ marginTop: "8px" }}>
                            <FormField label="NCMs (separados por virgula)">
                              <TextInput
                                value={ncmsText}
                                onChange={setNcmsText}
                                placeholder="9011.10.00, 9011.20.00, 8421.19.10"
                              />
                            </FormField>
                            <div className="form-actions" style={{ marginTop: "8px" }}>
                              <ActionButton label={savingParamScore ? "Salvando..." : "Salvar"} variant="primary" onClick={handleSalvarNcmsBusca} disabled={savingParamScore} />
                              <ActionButton label="Cancelar" onClick={() => setEditingNcms(false)} />
                            </div>
                          </div>
                        ) : (
                          <div className="tags-container">
                            {(paramScore?.ncms_busca && paramScore.ncms_busca.length > 0)
                              ? paramScore.ncms_busca.map((n, i) => (
                                  <span key={i} className="tag">{n}</span>
                                ))
                              : <span className="text-muted" style={{ fontSize: "13px" }}>Nenhum NCM cadastrado</span>
                            }
                            <button className="tag tag-add" onClick={() => {
                              setNcmsText(paramScore?.ncms_busca?.join(", ") || "");
                              setEditingNcms(true);
                            }}>+ Adicionar NCM</button>
                          </div>
                        )}
                        <p className="text-muted" style={{ marginTop: "8px", fontSize: "12px" }}>
                          NCMs sao usados para busca direta no PNCP por codigo de produto
                        </p>
                      </div>
                    </Card>
                  </>
                );

              case "notificacoes":
                return (
                  <Card title="Configuracoes de Notificacao">
                    <FormField label="Email para notificacoes">
                      <TextInput value={emailNotif} onChange={setEmailNotif} type="email" />
                    </FormField>

                    <div className="form-section-title">Receber por</div>
                    <div className="checkbox-grid">
                      <Checkbox checked={notifEmail} onChange={setNotifEmail} label="Email" />
                      <Checkbox checked={notifSistema} onChange={setNotifSistema} label="Sistema" />
                      <Checkbox checked={notifSms} onChange={setNotifSms} label="SMS" />
                    </div>

                    <FormField label="Frequencia do resumo">
                      <SelectInput
                        value={frequenciaResumo}
                        onChange={setFrequenciaResumo}
                        options={[
                          { value: "imediato", label: "Imediato" },
                          { value: "diario", label: "Diario" },
                          { value: "semanal", label: "Semanal" },
                        ]}
                      />
                    </FormField>

                    <div className="form-actions">
                      <ActionButton label={savingParamScore ? "Salvando..." : "Salvar"} variant="primary" onClick={handleSalvarNotificacoes} disabled={savingParamScore} />
                      {notifSalvas && (
                        <span className="status-badge status-badge-success" style={{ marginLeft: "8px" }}>Salvo!</span>
                      )}
                    </div>
                  </Card>
                );

              case "preferencias":
                return (
                  <Card title="Preferencias do Sistema">
                    <FormField label="Tema">
                      <div className="radio-group">
                        <label className="radio-wrapper">
                          <input
                            type="radio"
                            checked={tema === "escuro"}
                            onChange={() => setTema("escuro")}
                          />
                          <span>Escuro</span>
                        </label>
                        <label className="radio-wrapper">
                          <input
                            type="radio"
                            checked={tema === "claro"}
                            onChange={() => setTema("claro")}
                          />
                          <span>Claro</span>
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Idioma">
                      <SelectInput
                        value={idioma}
                        onChange={setIdioma}
                        options={[
                          { value: "pt-BR", label: "Portugues (Brasil)" },
                          { value: "en-US", label: "English (US)" },
                          { value: "es-ES", label: "Espanol" },
                        ]}
                      />
                    </FormField>

                    <FormField label="Fuso horario">
                      <SelectInput
                        value={fusoHorario}
                        onChange={setFusoHorario}
                        options={[
                          { value: "America/Sao_Paulo", label: "America/Sao_Paulo (GMT-3)" },
                          { value: "America/Manaus", label: "America/Manaus (GMT-4)" },
                          { value: "America/Belem", label: "America/Belem (GMT-3)" },
                        ]}
                      />
                    </FormField>

                    <div className="form-actions">
                      <ActionButton label={savingParamScore ? "Salvando..." : "Salvar"} variant="primary" onClick={handleSalvarPreferencias} disabled={savingParamScore} />
                      {prefSalvas && (
                        <span className="status-badge status-badge-success" style={{ marginLeft: "8px" }}>Salvo!</span>
                      )}
                    </div>
                  </Card>
                );

              default:
                return null;
            }
          }}
        </TabPanel>
      </div>

      {/* Modal Nova Fonte */}
      <Modal
        isOpen={showFonteModal}
        onClose={() => setShowFonteModal(false)}
        title="Cadastrar Fonte de Editais"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowFonteModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarFonte} disabled={salvandoFonte || !novaFonteNome}>
              {salvandoFonte ? <Loader2 size={14} className="spin" /> : null} Salvar
            </button>
          </>
        }
      >
        <FormField label="Nome" required>
          <TextInput value={novaFonteNome} onChange={setNovaFonteNome} />
        </FormField>
        <FormField label="Tipo" required>
          <SelectInput
            value={novaFonteTipo}
            onChange={(v) => setNovaFonteTipo(v as "api" | "scraper")}
            options={[
              { value: "api", label: "API" },
              { value: "scraper", label: "Scraper" },
            ]}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="URL" required>
          <TextInput value={novaFonteUrl} onChange={setNovaFonteUrl} type="url" />
        </FormField>
      </Modal>

      {/* Modal Nova/Editar Classe */}
      <Modal
        isOpen={showClasseModal}
        onClose={() => { setShowClasseModal(false); setEditingClasseId(null); setNovaClasseNome(""); setNovaClasseNCMs(""); }}
        title={editingClasseId ? "Editar Classe de Produto" : "Nova Classe de Produto"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setShowClasseModal(false); setEditingClasseId(null); setNovaClasseNome(""); setNovaClasseNCMs(""); }}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarClasse} disabled={savingClasse || !novaClasseNome}>
              {savingClasse ? <Loader2 size={14} className="spin" /> : null} Salvar
            </button>
          </>
        }
      >
        <FormField label="Nome da Classe" required>
          <TextInput value={novaClasseNome} onChange={setNovaClasseNome} placeholder="Ex: Reagentes" />
        </FormField>
        <FormField label="NCMs (separados por virgula)">
          <TextInput value={novaClasseNCMs} onChange={setNovaClasseNCMs} placeholder="3822, 3002, 3006" />
        </FormField>
      </Modal>

      {/* Modal Nova/Editar Subclasse */}
      <Modal
        isOpen={showSubclasseModal}
        onClose={() => { setShowSubclasseModal(false); setSelectedClasseId(null); setEditingSubclasseId(null); setEditingSubclasseClasseId(null); setNovaSubclasseNome(""); setNovaSubclasseNCMs(""); }}
        title={editingSubclasseId ? "Editar Subclasse de Produto" : "Nova Subclasse de Produto"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setShowSubclasseModal(false); setSelectedClasseId(null); setEditingSubclasseId(null); setEditingSubclasseClasseId(null); setNovaSubclasseNome(""); setNovaSubclasseNCMs(""); }}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarSubclasse} disabled={savingClasse || !novaSubclasseNome}>
              {savingClasse ? <Loader2 size={14} className="spin" /> : null} Salvar
            </button>
          </>
        }
      >
        <FormField label="Classe Pai">
          <TextInput value={classes.find(c => c.id === selectedClasseId)?.nome || ""} onChange={() => {}} disabled />
        </FormField>
        <FormField label="Nome da Subclasse" required>
          <TextInput value={novaSubclasseNome} onChange={setNovaSubclasseNome} placeholder="Ex: Reagentes Diagnostico" />
        </FormField>
        <FormField label="NCMs da Subclasse (separados por virgula)" required>
          <TextInput value={novaSubclasseNCMs} onChange={setNovaSubclasseNCMs} placeholder="3822.00.90, 3822.00.10" />
        </FormField>
      </Modal>
    </div>
  );
}
