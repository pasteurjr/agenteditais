import { useState, useEffect, useCallback, useRef } from "react";
import type { PageProps } from "../types";
import { Settings, Globe, Bell, Palette, Play, Pause, MapPin, CheckCircle, AlertTriangle, XCircle, Loader2, Lock, Info, DollarSign } from "lucide-react";
import { Card, ActionButton, TabPanel, FormField, TextInput, Checkbox, SelectInput, StatusBadge } from "../components/common";
import { crudList, crudCreate, crudUpdate } from "../api/crud";

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

interface CampoMascara {
  campo: string;
  placeholder: string;
}

interface Subclasse {
  id: string;
  nome: string;
  ncms: string;
  produtos: number;
  campos_mascara?: CampoMascara[] | null;
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


export function ParametrizacoesPage(_props: PageProps) {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [loadingFontes, setLoadingFontes] = useState(true);
  const [errorFontes, setErrorFontes] = useState<string | null>(null);
  const [parametros, setParametros] = useState<ParametroScore[]>([]);
  const [loadingParametros, setLoadingParametros] = useState(true);
  const [classes, setClasses] = useState<Classe[]>([]);

  // Parametros-score state (persisted)
  const [paramScoreId, setParamScoreId] = useState<string | null>(null);
  const [paramScore, setParamScore] = useState<ParametroScoreAPI | null>(null);
  const [loadingParamScore, setLoadingParamScore] = useState(true);
  const [savingParamScore, setSavingParamScore] = useState(false);

  // Palavras-chave e NCMs editing
  const [editingPalavras, setEditingPalavras] = useState(false);
  const [palavrasText, setPalavrasText] = useState("");
  const [editingNcms, setEditingNcms] = useState(false);
  const [ncmsText, setNcmsText] = useState("");

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

  // Tipos de edital (modalidades do banco)
  const [modalidades, setModalidades] = useState<{ id: string; nome: string; ativo: boolean }[]>([]);
  const [tiposEditalSelecionados, setTiposEditalSelecionados] = useState<Set<string>>(new Set());

  // Regiao de atuacao
  const [estadosSelecionados, setEstadosSelecionados] = useState<Set<string>>(new Set());
  const [todoBrasil, setTodoBrasil] = useState(false);

  // Comercial - Tempo de Entrega + Mercado
  const [prazoMaximo, setPrazoMaximo] = useState("");
  const [frequenciaMaxima, setFrequenciaMaxima] = useState("semanal");
  const [tam, setTam] = useState("");
  const [sam, setSam] = useState("");
  const [som, setSom] = useState("");

  // RF-014: Custos e Margens
  const [markupPadrao, setMarkupPadrao] = useState("");
  const [custosFixos, setCustosFixos] = useState("");
  const [freteBase, setFreteBase] = useState("");

  // Pesos de Score (8 dimensoes)
  const [pesoTecnico, setPesoTecnico] = useState("0.25");
  const [pesoComercial, setPesoComercial] = useState("0.15");
  const [pesoParticipacao, setPesoParticipacao] = useState("0.05");
  const [pesoGanho, setPesoGanho] = useState("0.10");
  const [pesoDocumental, setPesoDocumental] = useState("0.15");
  const [pesoComplexidade, setPesoComplexidade] = useState("0.10");
  const [pesoJuridico, setPesoJuridico] = useState("0.10");
  const [pesoLogistico, setPesoLogistico] = useState("0.10");


  // R1: Feedback salvar notificacoes
  const [notifSalvas, setNotifSalvas] = useState(false);

  // R2: Feedback salvar preferencias
  const [prefSalvas, setPrefSalvas] = useState(false);


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

  const loadModalidades = useCallback(async () => {
    try {
      const res = await crudList("modalidades-licitacao", { limit: 100 });
      setModalidades(res.items.map(m => ({
        id: String(m.id),
        nome: String(m.nome),
        ativo: Boolean(m.ativo ?? true),
      })));
    } catch {
      // May not exist yet
    }
  }, []);

  const loadClasses = useCallback(async () => {
    try {
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
            campos_mascara: Array.isArray(s.campos_mascara) ? s.campos_mascara as unknown as CampoMascara[] : null,
          })),
        };
      });
      setClasses(tree);
    } catch {
      // May not exist yet
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
        // RF-014: Custos e Margens
        setMarkupPadrao(p.markup_padrao != null ? String(p.markup_padrao) : "");
        setCustosFixos(p.custos_fixos != null ? String(p.custos_fixos) : "");
        setFreteBase(p.frete_base != null ? String(p.frete_base) : "");
        const tipos = Array.isArray(p.tipos_edital) ? p.tipos_edital : [];
        setTiposEditalSelecionados(new Set(tipos));

        // Populate score weights
        if (p.peso_tecnico != null) setPesoTecnico(String(p.peso_tecnico));
        if (p.peso_comercial != null) setPesoComercial(String(p.peso_comercial));
        if (p.peso_participacao != null) setPesoParticipacao(String(p.peso_participacao));
        if (p.peso_ganho != null) setPesoGanho(String(p.peso_ganho));
        if (p.peso_documental != null) setPesoDocumental(String(p.peso_documental));
        if (p.peso_complexidade != null) setPesoComplexidade(String(p.peso_complexidade));
        if (p.peso_juridico != null) setPesoJuridico(String(p.peso_juridico));
        if (p.peso_logistico != null) setPesoLogistico(String(p.peso_logistico));
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
    loadModalidades();
  }, [loadFontes, loadParametros, loadClasses, loadParamScore, loadModalidades]);

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


  const getParamPeso = (nome: string) =>
    parametros.find(p => p.nome === nome)?.peso?.toString() || "";

  const updateParamPeso = async (nome: string, valor: string) => {
    const p = parametros.find(p => p.nome === nome);
    if (p) {
      await crudUpdate("parametros-score", p.id, { peso: Number(valor) });
      setParametros(parametros.map(pm => pm.id === p.id ? { ...pm, peso: Number(valor) } : pm));
    }
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

  // RF-014: Salvar custos e margens
  const handleSalvarCustos = async () => {
    await saveParamScore({
      markup_padrao: markupPadrao ? Number(markupPadrao) : 0,
      custos_fixos: custosFixos ? Number(custosFixos) : 0,
      frete_base: freteBase ? Number(freteBase) : 0,
    });
  };

  const handleSalvarPesosScore = async () => {
    await saveParamScore({
      peso_tecnico: parseFloat(pesoTecnico) || 0,
      peso_comercial: parseFloat(pesoComercial) || 0,
      peso_participacao: parseFloat(pesoParticipacao) || 0,
      peso_ganho: parseFloat(pesoGanho) || 0,
      peso_documental: parseFloat(pesoDocumental) || 0,
      peso_complexidade: parseFloat(pesoComplexidade) || 0,
      peso_juridico: parseFloat(pesoJuridico) || 0,
      peso_logistico: parseFloat(pesoLogistico) || 0,
    });
  };

  const handleSalvarTiposEdital = async () => {
    await saveParamScore({ tipos_edital: Array.from(tiposEditalSelecionados) });
  };

  const toggleModalidade = (nome: string) => {
    setTiposEditalSelecionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nome)) {
        newSet.delete(nome);
      } else {
        newSet.add(nome);
      }
      return newSet;
    });
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

  // Helper to scroll to a card by title text
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

  const tabs = [
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

                    <Card title="Custos e Margens" icon={<DollarSign size={18} />}>
                      <div className="form-grid form-grid-3">
                        <FormField label="Markup Padrao (%)" hint="Percentual de markup sobre custo">
                          <TextInput value={markupPadrao} onChange={(v) => setMarkupPadrao(v)} type="number" placeholder="Ex: 30" />
                        </FormField>
                        <FormField label="Custos Fixos Mensais (R$)" hint="Custos operacionais fixos mensais">
                          <TextInput value={custosFixos} onChange={(v) => setCustosFixos(v)} type="number" prefix="R$" placeholder="Ex: 15000" />
                        </FormField>
                        <FormField label="Frete Base (R$)" hint="Custo base de frete por entrega">
                          <TextInput value={freteBase} onChange={(v) => setFreteBase(v)} type="number" prefix="R$" placeholder="Ex: 500" />
                        </FormField>
                      </div>
                      <div className="form-actions" style={{ marginTop: "12px" }}>
                        <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Custos"} variant="primary" onClick={handleSalvarCustos} disabled={savingParamScore} />
                      </div>
                    </Card>

                    <Card title="Modalidades de Licitacao Desejadas" subtitle="Selecione as modalidades em que a empresa deseja participar">
                      {modalidades.length === 0 ? (
                        <p className="text-muted" style={{ padding: 12, textAlign: "center", fontSize: 13 }}>
                          Nenhuma modalidade cadastrada.
                          <button style={{ marginLeft: 8, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "crud:modalidades-licitacao" } }))}>
                            Cadastrar Modalidades
                          </button>
                        </p>
                      ) : (
                        <div className="checkbox-grid">
                          {modalidades.filter(m => m.ativo).map(m => (
                            <Checkbox
                              key={m.id}
                              checked={tiposEditalSelecionados.has(m.nome)}
                              onChange={() => toggleModalidade(m.nome)}
                              label={m.nome}
                            />
                          ))}
                        </div>
                      )}
                      <div className="form-actions" style={{ marginTop: "12px" }}>
                        <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Modalidades"} variant="primary" onClick={handleSalvarTiposEdital} disabled={savingParamScore} />
                      </div>
                    </Card>

                    <Card title="Pesos de Score (6 Dimensoes + Operacionais)" subtitle="Pesos que ponderam cada dimensao no calculo do score final. As 6 dimensoes do workflow: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial, mais pesos operacionais Participacao e Ganho.">
                      <div className="form-grid form-grid-2">
                        <FormField label="Peso Tecnico" hint="Aderencia tecnica do produto">
                          <TextInput value={pesoTecnico} onChange={(v) => setPesoTecnico(v)} type="number" placeholder="0.25" />
                        </FormField>
                        <FormField label="Peso Documental" hint="Regularidade documental e certidoes">
                          <TextInput value={pesoDocumental} onChange={(v) => setPesoDocumental(v)} type="number" placeholder="0.15" />
                        </FormField>
                        <FormField label="Peso Complexidade" hint="Complexidade tecnica do edital">
                          <TextInput value={pesoComplexidade} onChange={(v) => setPesoComplexidade(v)} type="number" placeholder="0.10" />
                        </FormField>
                        <FormField label="Peso Juridico" hint="Risco juridico e clausulas restritivas">
                          <TextInput value={pesoJuridico} onChange={(v) => setPesoJuridico(v)} type="number" placeholder="0.10" />
                        </FormField>
                        <FormField label="Peso Logistico" hint="Viabilidade logistica e prazo de entrega">
                          <TextInput value={pesoLogistico} onChange={(v) => setPesoLogistico(v)} type="number" placeholder="0.10" />
                        </FormField>
                        <FormField label="Peso Comercial" hint="Viabilidade comercial e preco">
                          <TextInput value={pesoComercial} onChange={(v) => setPesoComercial(v)} type="number" placeholder="0.15" />
                        </FormField>
                        <FormField label="Peso Participacao" hint="Historico de participacao em editais">
                          <TextInput value={pesoParticipacao} onChange={(v) => setPesoParticipacao(v)} type="number" placeholder="0.05" />
                        </FormField>
                        <FormField label="Peso Ganho" hint="Taxa de vitoria historica">
                          <TextInput value={pesoGanho} onChange={(v) => setPesoGanho(v)} type="number" placeholder="0.10" />
                        </FormField>
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
                        Soma atual: {(
                          parseFloat(pesoTecnico || "0") + parseFloat(pesoComercial || "0") +
                          parseFloat(pesoParticipacao || "0") + parseFloat(pesoGanho || "0") +
                          parseFloat(pesoDocumental || "0") + parseFloat(pesoComplexidade || "0") +
                          parseFloat(pesoJuridico || "0") + parseFloat(pesoLogistico || "0")
                        ).toFixed(2)}
                      </div>
                      <div className="form-actions" style={{ marginTop: "12px" }}>
                        <ActionButton label={savingParamScore ? "Salvando..." : "Salvar Pesos"} variant="primary" onClick={handleSalvarPesosScore} disabled={savingParamScore} />
                      </div>
                    </Card>

                    {/* Norteadores de Score */}
                    <Card title="Norteadores de Score" subtitle="Configuracoes que alimentam o calculo de scores multi-dimensionais">
                      <div className="norteadores-grid">
                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "crud:classes-produto-v2" } }))}>
                          <div className="norteador-header">
                            {classes.length > 0
                              ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              : <XCircle size={16} style={{ color: "#ef4444" }} />}
                            <span className="norteador-label">(a) Classificacao/Agrupamento</span>
                            <span className="score-feed-badge feed-tecnico">Score Tecnico</span>
                          </div>
                          <p className="norteador-desc">Arvore de classes e subclasses (aba Produtos)</p>
                          {classes.length > 0
                            ? <StatusBadge status="success" label={`${classes.length} classe(s) configurada(s)`} size="small" />
                            : <StatusBadge status="error" label="Nao configurado" size="small" />}
                        </div>

                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => scrollToCard("Regiao de Atuacao")}>
                          <div className="norteador-header">
                            {estadosSelecionados.size > 0
                              ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              : <XCircle size={16} style={{ color: "#ef4444" }} />}
                            <span className="norteador-label">(b) Score Comercial</span>
                            <span className="score-feed-badge feed-comercial">Score Comercial</span>
                          </div>
                          <p className="norteador-desc">Regiao de atuacao, prazos e mercado (acima)</p>
                          {estadosSelecionados.size > 0
                            ? <StatusBadge status="success" label={`${estadosSelecionados.size} estado(s) selecionado(s)`} size="small" />
                            : <StatusBadge status="error" label="Nao configurado" size="small" />}
                        </div>

                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => scrollToCard("Modalidades de Licitacao")}>
                          <div className="norteador-header">
                            {tiposEditalSelecionados.size > 0
                              ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              : <XCircle size={16} style={{ color: "#ef4444" }} />}
                            <span className="norteador-label">(c) Modalidades de Licitacao</span>
                            <span className="score-feed-badge feed-recomendacao">Score Recomendacao</span>
                          </div>
                          <p className="norteador-desc">Modalidades de licitacao desejadas (acima)</p>
                          {tiposEditalSelecionados.size > 0
                            ? <StatusBadge status="success" label={`${tiposEditalSelecionados.size} modalidade(s) selecionada(s)`} size="small" />
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

                        <div className="norteador-item" style={{ cursor: "pointer" }} onClick={() => scrollToCard("Custos e Margens")}>
                          <div className="norteador-header">
                            <AlertTriangle size={16} style={{ color: "#eab308" }} />
                            <span className="norteador-label">(e) Score Participacao</span>
                            <span className="score-feed-badge feed-recomendacao">Score Recomendacao</span>
                          </div>
                          <p className="norteador-desc">Documentos frequentemente solicitados em editais</p>
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
                    </>
                    )}
                  </>
                );

              case "fontes":
                return (
                  <>
                    <Card
                      title="Fontes de Editais"
                      subtitle="Fontes ativas para busca de editais"
                      actions={
                        <ActionButton
                          icon={<Settings size={14} />}
                          label="Gerenciar Fontes"
                          variant="primary"
                          onClick={() => window.dispatchEvent(new CustomEvent("navigate-to", { detail: { page: "crud:fontes-editais" } }))}
                        />
                      }
                    >
                      {loadingFontes ? (
                        <div className="loading-center">
                          <Loader2 size={20} className="spin" />
                          <span>Carregando fontes...</span>
                        </div>
                      ) : fontes.length === 0 ? (
                        <p className="text-muted" style={{ padding: 12, textAlign: "center", fontSize: 13 }}>
                          Nenhuma fonte cadastrada. Use o botao acima para gerenciar fontes.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {fontes.map(f => (
                            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.nome}</span>
                                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{f.tipo.toUpperCase()}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className={`status-badge ${f.ativa ? "status-badge-success" : "status-badge-neutral"}`} style={{ fontSize: 11 }}>
                                  {f.ativa ? "Ativa" : "Inativa"}
                                </span>
                                <button
                                  title={f.ativa ? "Desativar" : "Ativar"}
                                  onClick={() => handleToggleFonte(f.id)}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}
                                >
                                  {f.ativa ? <Pause size={14} /> : <Play size={14} />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
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
    </div>
  );
}
