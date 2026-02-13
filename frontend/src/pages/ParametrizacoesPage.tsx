import { useState } from "react";
import { Settings, Globe, Bell, Palette, Plus, Play, Pause, Trash2, ChevronDown, ChevronRight, Pencil, Sparkles, MapPin, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Card, DataTable, ActionButton, TabPanel, FormField, TextInput, Checkbox, SelectInput, Modal, StatusBadge } from "../components/common";
import type { Column } from "../components/common";

interface Fonte {
  id: string;
  nome: string;
  tipo: "api" | "scraper";
  url: string;
  ativa: boolean;
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

// Dados mock
const mockFontes: Fonte[] = [
  { id: "1", nome: "PNCP", tipo: "api", url: "api.pncp.gov.br", ativa: true },
  { id: "2", nome: "ComprasNET", tipo: "scraper", url: "comprasnet.gov.br", ativa: true },
  { id: "3", nome: "BEC-SP", tipo: "scraper", url: "bec.sp.gov.br", ativa: false },
  { id: "4", nome: "SICONV", tipo: "api", url: "siconv.gov.br", ativa: true },
];

const mockClasses: Classe[] = [
  {
    id: "1",
    nome: "Laboratorio",
    ncms: "9011, 9012",
    produtos: 15,
    subclasses: [
      { id: "1-1", nome: "Microscopios", ncms: "9011.10.00, 9011.20.00", produtos: 5 },
      { id: "1-2", nome: "Centrifugas", ncms: "8421.19.10", produtos: 4 },
      { id: "1-3", nome: "Autoclaves", ncms: "8419.20.00", produtos: 6 },
    ]
  },
  {
    id: "2",
    nome: "Hospitalar",
    ncms: "9018, 9402",
    produtos: 22,
    subclasses: [
      { id: "2-1", nome: "Equipamentos Cirurgicos", ncms: "9018.90.99", produtos: 8 },
      { id: "2-2", nome: "Mobiliario Hospitalar", ncms: "9402.90.20", produtos: 6 },
      { id: "2-3", nome: "Monitores", ncms: "9018.19.80", produtos: 4 },
      { id: "2-4", nome: "Esterilizacao", ncms: "8419.20.00", produtos: 2 },
      { id: "2-5", nome: "Diagnostico", ncms: "9018.19.10", produtos: 2 },
    ]
  },
  {
    id: "3",
    nome: "Informatica",
    ncms: "8471, 8473",
    produtos: 8,
    subclasses: [
      { id: "3-1", nome: "Computadores", ncms: "8471.30.19", produtos: 5 },
      { id: "3-2", nome: "Perifericos", ncms: "8471.60.80", produtos: 3 },
    ]
  },
];

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

export function ParametrizacoesPage() {
  const [fontes, setFontes] = useState<Fonte[]>(mockFontes);
  const [classes, setClasses] = useState<Classe[]>(mockClasses);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

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
    comodato: true,
    venda: true,
    aluguel: true,
    consumo: true,
    insumosLab: false,
    insumosHosp: false,
  });

  // Regiao de atuacao
  const [estadosSelecionados, setEstadosSelecionados] = useState<Set<string>>(new Set(["SP", "MG", "RJ", "ES"]));
  const [todoBrasil, setTodoBrasil] = useState(false);

  // Modais
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [showClasseModal, setShowClasseModal] = useState(false);
  const [showSubclasseModal, setShowSubclasseModal] = useState(false);
  const [selectedClasseId, setSelectedClasseId] = useState<string | null>(null);
  const [gerandoIA, setGerandoIA] = useState(false);

  // Campos do formulario de classe
  const [novaClasseNome, setNovaClasseNome] = useState("");
  const [novaClasseNCMs, setNovaClasseNCMs] = useState("");

  // Campos do formulario de subclasse
  const [novaSubclasseNome, setNovaSubclasseNome] = useState("");
  const [novaSubclasseNCMs, setNovaSubclasseNCMs] = useState("");

  const handleToggleFonte = (id: string) => {
    setFontes(fontes.map(f => f.id === id ? { ...f, ativa: !f.ativa } : f));
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
      setEstadosSelecionados(new Set(["SP", "MG", "RJ", "ES"]));
    }
  };

  const handleGerarComIA = async () => {
    setGerandoIA(true);
    // Simula chamada a IA
    setTimeout(() => {
      // Adiciona uma nova classe gerada pela IA
      const novaClasse: Classe = {
        id: String(classes.length + 1),
        nome: "Reagentes",
        ncms: "3822, 3002",
        produtos: 0,
        subclasses: [
          { id: `${classes.length + 1}-1`, nome: "Reagentes Diagnostico", ncms: "3822.00.90", produtos: 0 },
          { id: `${classes.length + 1}-2`, nome: "Reagentes Quimicos", ncms: "3822.00.10", produtos: 0 },
        ]
      };
      setClasses([...classes, novaClasse]);
      setGerandoIA(false);
      alert("IA gerou nova classe 'Reagentes' baseado no portfolio!");
    }, 2000);
  };

  const handleSalvarClasse = () => {
    if (!novaClasseNome.trim()) return;
    const novaClasse: Classe = {
      id: String(classes.length + 1),
      nome: novaClasseNome,
      ncms: novaClasseNCMs,
      produtos: 0,
      subclasses: []
    };
    setClasses([...classes, novaClasse]);
    setNovaClasseNome("");
    setNovaClasseNCMs("");
    setShowClasseModal(false);
  };

  const handleSalvarSubclasse = () => {
    if (!novaSubclasseNome.trim() || !selectedClasseId) return;
    setClasses(classes.map(c => {
      if (c.id === selectedClasseId) {
        return {
          ...c,
          subclasses: [
            ...c.subclasses,
            {
              id: `${c.id}-${c.subclasses.length + 1}`,
              nome: novaSubclasseNome,
              ncms: novaSubclasseNCMs,
              produtos: 0
            }
          ]
        };
      }
      return c;
    }));
    setNovaSubclasseNome("");
    setNovaSubclasseNCMs("");
    setShowSubclasseModal(false);
    setSelectedClasseId(null);
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
          <button title="Excluir" className="danger"><Trash2 size={16} /></button>
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

      <div className="page-content">
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
                            icon={<Sparkles size={14} />}
                            label={gerandoIA ? "Gerando..." : "Gerar com IA"}
                            onClick={handleGerarComIA}
                            loading={gerandoIA}
                          />
                        </div>
                      }
                    >
                      <div className="classes-tree">
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
                                <button title="Editar"><Pencil size={14} /></button>
                                <button title="Excluir" className="danger"><Trash2 size={14} /></button>
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
                                      <button title="Editar"><Pencil size={14} /></button>
                                      <button title="Excluir" className="danger"><Trash2 size={14} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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
                    </Card>

                    {/* Norteadores de Score */}
                    <Card title="Norteadores de Score" subtitle="Configuracoes que alimentam o calculo de scores multi-dimensionais">
                      <div className="norteadores-grid">
                        <div className="norteador-item">
                          <div className="norteador-header">
                            <CheckCircle size={16} style={{ color: "#22c55e" }} />
                            <span className="norteador-label">(a) Classificacao/Agrupamento</span>
                            <span className="score-feed-badge feed-tecnico">Score Tecnico</span>
                          </div>
                          <p className="norteador-desc">Arvore de classes e subclasses acima</p>
                          <StatusBadge status="success" label="Configurado" size="small" />
                        </div>

                        <div className="norteador-item">
                          <div className="norteador-header">
                            <CheckCircle size={16} style={{ color: "#22c55e" }} />
                            <span className="norteador-label">(b) Score Comercial</span>
                            <span className="score-feed-badge feed-comercial">Score Comercial</span>
                          </div>
                          <p className="norteador-desc">Regiao de atuacao, prazos e mercado (aba Comercial)</p>
                          <StatusBadge status="success" label="Configurado" size="small" />
                        </div>

                        <div className="norteador-item">
                          <div className="norteador-header">
                            <CheckCircle size={16} style={{ color: "#22c55e" }} />
                            <span className="norteador-label">(c) Tipos de Edital</span>
                            <span className="score-feed-badge feed-recomendacao">Score Recomendacao</span>
                          </div>
                          <p className="norteador-desc">Checkboxes de tipos de edital acima</p>
                          <StatusBadge status="success" label="Configurado" size="small" />
                        </div>

                        <div className="norteador-item">
                          <div className="norteador-header">
                            <CheckCircle size={16} style={{ color: "#22c55e" }} />
                            <span className="norteador-label">(d) Score Tecnico</span>
                            <span className="score-feed-badge feed-tecnico">Score Tecnico</span>
                          </div>
                          <p className="norteador-desc">Baseado nas especificacoes dos produtos do Portfolio</p>
                          <StatusBadge status="success" label="4 produtos com specs" size="small" />
                        </div>

                        <div className="norteador-item">
                          <div className="norteador-header">
                            <AlertTriangle size={16} style={{ color: "#eab308" }} />
                            <span className="norteador-label">(e) Score Recomendacao</span>
                            <span className="score-feed-badge feed-recomendacao">Score Recomendacao</span>
                          </div>
                          <p className="norteador-desc">Documentos frequentemente solicitados em editais (configurar abaixo)</p>
                          <StatusBadge status="warning" label="Parcial - 6/10 docs" size="small" />
                        </div>

                        <div className="norteador-item">
                          <div className="norteador-header">
                            <XCircle size={16} style={{ color: "#ef4444" }} />
                            <span className="norteador-label">(f) Score Aderencia de Ganho</span>
                            <span className="score-feed-badge feed-ganho">Score Ganho</span>
                          </div>
                          <p className="norteador-desc">Historico: taxa de vitoria, margem media praticada</p>
                          <StatusBadge status="error" label="Nao configurado" size="small" />
                        </div>
                      </div>

                      {/* Historico para Score Ganho */}
                      <div className="norteador-config-section">
                        <h4>Configurar Score Aderencia de Ganho (f)</h4>
                        <div className="form-grid form-grid-3">
                          <FormField label="Taxa de Vitoria Historica (%)">
                            <TextInput value="" onChange={() => {}} placeholder="Ex: 35" type="number" />
                          </FormField>
                          <FormField label="Margem Media Praticada (%)">
                            <TextInput value="" onChange={() => {}} placeholder="Ex: 15" type="number" />
                          </FormField>
                          <FormField label="Total de Licitacoes Participadas">
                            <TextInput value="" onChange={() => {}} placeholder="Ex: 120" type="number" />
                          </FormField>
                        </div>
                      </div>
                    </Card>

                    {/* Fontes Documentais Exigidas */}
                    <Card
                      title="Fontes Documentais Exigidas por Editais"
                      subtitle="Documentos que editais costumam solicitar - ligado ao cadastro da Empresa"
                    >
                      <div className="docs-exigidos-grid">
                        {[
                          { doc: "Certidao Negativa de Debitos", temos: true },
                          { doc: "Atestado de Capacidade Tecnica", temos: false },
                          { doc: "Registro ANVISA", temos: true },
                          { doc: "Balanco Patrimonial", temos: true },
                          { doc: "Contrato Social Atualizado", temos: true },
                          { doc: "AFE (Autorizacao Funcionamento)", temos: true },
                          { doc: "CBPAD", temos: true },
                          { doc: "CBPP", temos: false },
                          { doc: "Certidao FGTS", temos: true },
                          { doc: "Certidao Trabalhista (TST)", temos: true },
                        ].map((item, i) => (
                          <div key={i} className="doc-exigido-item">
                            <Checkbox
                              checked={true}
                              onChange={() => {}}
                              label={item.doc}
                            />
                            <StatusBadge
                              status={item.temos ? "success" : "error"}
                              label={item.temos ? "Temos" : "Nao temos"}
                              size="small"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-muted" style={{ marginTop: "12px", fontSize: "12px" }}>
                        Status "Temos/Nao temos" e sincronizado com a pagina Empresa → Documentos
                      </p>
                    </Card>
                  </>
                );

              case "comercial":
                return (
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
                      </div>
                    </Card>

                    <Card title="Tempo de Entrega">
                      <div className="form-grid form-grid-2">
                        <FormField label="Prazo maximo aceito (dias)">
                          <TextInput value="30" onChange={() => {}} type="number" />
                        </FormField>
                        <FormField label="Frequencia maxima">
                          <SelectInput
                            value="semanal"
                            onChange={() => {}}
                            options={[
                              { value: "diaria", label: "Diaria" },
                              { value: "semanal", label: "Semanal" },
                              { value: "quinzenal", label: "Quinzenal" },
                              { value: "mensal", label: "Mensal" },
                            ]}
                          />
                        </FormField>
                      </div>
                    </Card>

                    <Card title="Mercado (TAM/SAM/SOM)">
                      <div className="form-grid form-grid-3">
                        <FormField label="TAM (Mercado Total)" hint="Editais/ano">
                          <TextInput value="" onChange={() => {}} prefix="R$" />
                        </FormField>
                        <FormField label="SAM (Mercado Alcancavel)">
                          <TextInput value="" onChange={() => {}} prefix="R$" />
                        </FormField>
                        <FormField label="SOM (Mercado Objetivo)">
                          <TextInput value="" onChange={() => {}} prefix="R$" />
                        </FormField>
                      </div>
                      <ActionButton icon={<Sparkles size={14} />} label="Calcular com IA baseado no portfolio" onClick={() => {}} />
                    </Card>
                  </>
                );

              case "fontes":
                return (
                  <>
                    <Card
                      title="Fontes de Editais"
                      actions={
                        <ActionButton
                          icon={<Plus size={14} />}
                          label="Cadastrar Fonte"
                          onClick={() => setShowFonteModal(true)}
                        />
                      }
                    >
                      <DataTable data={fontes} columns={fonteColumns} idKey="id" />
                    </Card>

                    <Card title="Palavras-chave de Busca">
                      <div className="palavras-chave">
                        <ActionButton icon={<Sparkles size={14} />} label="Gerar automaticamente do portfolio" onClick={() => {}} />
                        <div className="tags-container">
                          <span className="tag">microscopio</span>
                          <span className="tag">centrifuga</span>
                          <span className="tag">autoclave</span>
                          <span className="tag">equipamento laboratorio</span>
                          <span className="tag">reagente</span>
                          <span className="tag">esterilizacao</span>
                          <button className="tag tag-add">+ Editar</button>
                        </div>
                      </div>
                    </Card>

                    <Card title="NCMs para Busca" subtitle="Extraidos automaticamente das classes/subclasses do portfolio">
                      <div className="ncms-busca">
                        <div className="ncms-actions">
                          <ActionButton
                            icon={<RefreshCw size={14} />}
                            label="Sincronizar NCMs do Portfolio"
                            onClick={() => {}}
                          />
                        </div>
                        <div className="tags-container">
                          <span className="tag">9011.10.00</span>
                          <span className="tag">9011.20.00</span>
                          <span className="tag">8421.19.10</span>
                          <span className="tag">8419.20.00</span>
                          <span className="tag">9018.90.99</span>
                          <span className="tag">9402.90.20</span>
                          <span className="tag">3822.00.90</span>
                          <span className="tag">3822.00.10</span>
                          <span className="tag">8471.30.19</span>
                          <button className="tag tag-add">+ Adicionar NCM</button>
                        </div>
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
                      <ActionButton label="Salvar" variant="primary" onClick={() => {}} />
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
                      <ActionButton label="Salvar" variant="primary" onClick={() => {}} />
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
            <button className="btn btn-primary">Salvar</button>
          </>
        }
      >
        <FormField label="Nome" required>
          <TextInput value="" onChange={() => {}} />
        </FormField>
        <FormField label="Tipo" required>
          <SelectInput
            value=""
            onChange={() => {}}
            options={[
              { value: "api", label: "API" },
              { value: "scraper", label: "Scraper" },
            ]}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="URL" required>
          <TextInput value="" onChange={() => {}} type="url" />
        </FormField>
      </Modal>

      {/* Modal Nova Classe */}
      <Modal
        isOpen={showClasseModal}
        onClose={() => setShowClasseModal(false)}
        title="Nova Classe de Produto"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowClasseModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarClasse}>Salvar</button>
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

      {/* Modal Nova Subclasse */}
      <Modal
        isOpen={showSubclasseModal}
        onClose={() => { setShowSubclasseModal(false); setSelectedClasseId(null); }}
        title="Nova Subclasse de Produto"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowSubclasseModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarSubclasse}>Salvar</button>
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
