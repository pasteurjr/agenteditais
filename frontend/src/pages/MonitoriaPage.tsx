import { useState } from "react";
import { Radio, Plus, Play, Pause, Trash2, Eye, Save, RefreshCw } from "lucide-react";
import { Card, DataTable, ActionButton, Modal, FormField, TextInput, SelectInput, Checkbox } from "../components/common";
import type { Column } from "../components/common";

interface Monitoramento {
  id: string;
  termo: string;
  ufs: string[];
  frequencia: string;
  ultimaBusca: string;
  novosEncontrados: number;
  status: "ativo" | "pausado";
}

interface EditalEncontrado {
  id: string;
  numero: string;
  orgao: string;
  uf: string;
  objeto: string;
  termoOrigem: string;
}

// Dados mock
const mockMonitoramentos: Monitoramento[] = [
  { id: "1", termo: "microscopio", ufs: ["SP", "MG"], frequencia: "6h", ultimaBusca: "10/02/2026 10:30", novosEncontrados: 3, status: "ativo" },
  { id: "2", termo: "equipamento laboratorio", ufs: ["Todos"], frequencia: "12h", ultimaBusca: "10/02/2026 06:00", novosEncontrados: 0, status: "ativo" },
  { id: "3", termo: "centrifuga", ufs: ["RJ"], frequencia: "24h", ultimaBusca: "09/02/2026 08:00", novosEncontrados: 1, status: "pausado" },
];

const mockEncontrados: EditalEncontrado[] = [
  { id: "1", numero: "PE-099/2026", orgao: "UNICAMP", uf: "SP", objeto: "Microscopio eletronico de varredura", termoOrigem: "microscopio" },
  { id: "2", numero: "PE-100/2026", orgao: "UNESP", uf: "SP", objeto: "Microscopio optico binocular", termoOrigem: "microscopio" },
  { id: "3", numero: "PE-101/2026", orgao: "UFMG", uf: "MG", objeto: "Microscopio de fluorescencia", termoOrigem: "microscopio" },
];

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function MonitoriaPage() {
  const [monitoramentos, setMonitoramentos] = useState<Monitoramento[]>(mockMonitoramentos);
  const [encontrados] = useState<EditalEncontrado[]>(mockEncontrados);
  const [selectedMonitoramento, setSelectedMonitoramento] = useState<Monitoramento | null>(null);
  const [showCriarModal, setShowCriarModal] = useState(false);

  // Form
  const [novoTermo, setNovoTermo] = useState("");
  const [novasUfs, setNovasUfs] = useState<string[]>([]);
  const [todosEstados, setTodosEstados] = useState(false);
  const [frequencia, setFrequencia] = useState("6h");
  const [notificarSistema, setNotificarSistema] = useState(true);
  const [notificarEmail, setNotificarEmail] = useState(true);

  const handleToggleStatus = (id: string) => {
    // TODO: Chamar API para pausar/ativar monitoramento
    // Prompt: desativar_monitoramento
    setMonitoramentos(monitoramentos.map(m =>
      m.id === id ? { ...m, status: m.status === "ativo" ? "pausado" as const : "ativo" as const } : m
    ));
  };

  const handleExcluir = (id: string) => {
    setMonitoramentos(monitoramentos.filter(m => m.id !== id));
  };

  const handleCriarMonitoramento = () => {
    // TODO: Chamar API para criar monitoramento
    // Prompts: configurar_monitoramento, configurar_monitoramento_uf
    const novoMonitoramento: Monitoramento = {
      id: String(monitoramentos.length + 1),
      termo: novoTermo,
      ufs: todosEstados ? ["Todos"] : novasUfs,
      frequencia,
      ultimaBusca: "-",
      novosEncontrados: 0,
      status: "ativo",
    };
    setMonitoramentos([novoMonitoramento, ...monitoramentos]);
    setShowCriarModal(false);
    // Reset
    setNovoTermo("");
    setNovasUfs([]);
    setTodosEstados(false);
    setFrequencia("6h");
  };

  const handleSalvarEdital = (edital: EditalEncontrado) => {
    // TODO: Chamar API para salvar edital
    console.log("Salvando edital:", edital.numero);
  };

  const handleToggleUf = (uf: string) => {
    if (novasUfs.includes(uf)) {
      setNovasUfs(novasUfs.filter(u => u !== uf));
    } else {
      setNovasUfs([...novasUfs, uf]);
    }
  };

  const monitoramentoColumns: Column<Monitoramento>[] = [
    { key: "termo", header: "Termo", sortable: true },
    { key: "ufs", header: "UFs", render: (m) => m.ufs.join(", ") },
    { key: "frequencia", header: "Frequencia" },
    { key: "ultimaBusca", header: "Ultima Busca" },
    {
      key: "novosEncontrados",
      header: "Novos",
      render: (m) => (
        <span className={m.novosEncontrados > 0 ? "badge-new" : ""}>
          {m.novosEncontrados > 0 ? `${m.novosEncontrados} novos` : "0"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => (
        <span className={`status-badge ${m.status === "ativo" ? "status-badge-success" : "status-badge-neutral"}`}>
          {m.status === "ativo" ? "Ativo" : "Pausado"}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Acoes",
      width: "100px",
      render: (m) => (
        <div className="table-actions">
          <button
            title={m.status === "ativo" ? "Pausar" : "Ativar"}
            onClick={() => handleToggleStatus(m.id)}
          >
            {m.status === "ativo" ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button title="Excluir" className="danger" onClick={() => handleExcluir(m.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const encontradosColumns: Column<EditalEncontrado>[] = [
    { key: "numero", header: "Numero" },
    { key: "orgao", header: "Orgao" },
    { key: "uf", header: "UF" },
    {
      key: "objeto",
      header: "Objeto",
      render: (e) => (
        <span className="truncate" title={e.objeto}>
          {e.objeto.length > 40 ? e.objeto.substring(0, 40) + "..." : e.objeto}
        </span>
      ),
    },
    {
      key: "termoOrigem",
      header: "Termo",
      render: (e) => <span className="tag">{e.termoOrigem}</span>,
    },
    {
      key: "acoes",
      header: "",
      width: "80px",
      render: (e) => (
        <div className="table-actions">
          <button title="Ver detalhes"><Eye size={16} /></button>
          <button title="Salvar" onClick={() => handleSalvarEdital(e)}><Save size={16} /></button>
        </div>
      ),
    },
  ];

  const encontradosFiltrados = selectedMonitoramento
    ? encontrados.filter(e => e.termoOrigem === selectedMonitoramento.termo)
    : encontrados;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Radio size={24} />
          <div>
            <h1>Monitoramento Automatico</h1>
            <p>Configuracao de buscas automaticas de editais</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card
          title="Monitoramentos Ativos"
          icon={<Radio size={18} />}
          actions={
            <ActionButton
              icon={<Plus size={14} />}
              label="Novo Monitoramento"
              onClick={() => setShowCriarModal(true)}
            />
          }
        >
          <DataTable
            data={monitoramentos}
            columns={monitoramentoColumns}
            idKey="id"
            onRowClick={setSelectedMonitoramento}
            selectedId={selectedMonitoramento?.id}
            emptyMessage="Nenhum monitoramento configurado"
          />
        </Card>

        <Card
          title={selectedMonitoramento ? `Ultimos Editais Encontrados: "${selectedMonitoramento.termo}"` : "Ultimos Editais Encontrados"}
          icon={<RefreshCw size={18} />}
        >
          {selectedMonitoramento && (
            <div className="monitoramento-info">
              <span>Termo: <strong>{selectedMonitoramento.termo}</strong></span>
              <span>Encontrados: <strong>{selectedMonitoramento.novosEncontrados}</strong></span>
              <span>Ultima busca: <strong>{selectedMonitoramento.ultimaBusca}</strong></span>
            </div>
          )}
          <DataTable
            data={encontradosFiltrados}
            columns={encontradosColumns}
            idKey="id"
            emptyMessage="Nenhum edital encontrado recentemente"
          />
        </Card>
      </div>

      <Modal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        title="Criar Monitoramento"
        size="large"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCriarModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarMonitoramento} disabled={!novoTermo}>
              <Radio size={14} /> Criar Monitoramento
            </button>
          </>
        }
      >
        <FormField label="Termo de busca" required>
          <TextInput
            value={novoTermo}
            onChange={setNovoTermo}
            placeholder="Ex: microscopio, centrifuga, reagente..."
          />
        </FormField>

        <FormField label="Estados (UF)">
          <div className="uf-selector">
            <Checkbox
              checked={todosEstados}
              onChange={(v) => {
                setTodosEstados(v);
                if (v) setNovasUfs([]);
              }}
              label="Todos os estados"
            />
            {!todosEstados && (
              <div className="uf-grid">
                {UFS.map(uf => (
                  <label key={uf} className="uf-checkbox">
                    <input
                      type="checkbox"
                      checked={novasUfs.includes(uf)}
                      onChange={() => handleToggleUf(uf)}
                    />
                    <span>{uf}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </FormField>

        <FormField label="Frequencia">
          <div className="radio-group">
            <label className="radio-wrapper">
              <input type="radio" checked={frequencia === "2h"} onChange={() => setFrequencia("2h")} />
              <span>2 horas</span>
            </label>
            <label className="radio-wrapper">
              <input type="radio" checked={frequencia === "6h"} onChange={() => setFrequencia("6h")} />
              <span>6 horas</span>
            </label>
            <label className="radio-wrapper">
              <input type="radio" checked={frequencia === "12h"} onChange={() => setFrequencia("12h")} />
              <span>12 horas</span>
            </label>
            <label className="radio-wrapper">
              <input type="radio" checked={frequencia === "24h"} onChange={() => setFrequencia("24h")} />
              <span>24 horas</span>
            </label>
          </div>
        </FormField>

        <FormField label="Notificar por">
          <div className="checkbox-group">
            <Checkbox
              checked={notificarSistema}
              onChange={setNotificarSistema}
              label="Sistema"
            />
            <Checkbox
              checked={notificarEmail}
              onChange={setNotificarEmail}
              label="Email"
            />
          </div>
        </FormField>
      </Modal>
    </div>
  );
}
