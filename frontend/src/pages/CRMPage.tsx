import { useState } from "react";
import { Users, Target, TrendingUp, Award, Phone, Mail, Plus, Eye, MessageSquare } from "lucide-react";
import { Card, DataTable, ActionButton, FilterBar, FormField, SelectInput, Modal, TextInput } from "../components/common";
import type { Column } from "../components/common";

interface Lead {
  [key: string]: unknown;
  id: string;
  edital: string;
  orgao: string;
  objeto: string;
  valor: number;
  scoreAderencia: number;
  dataAbertura: string;
  status: "novo" | "contatado" | "qualificado" | "proposta" | "ganho" | "perdido";
  responsavel: string;
  ultimoContato: string | null;
}

interface Meta {
  [key: string]: unknown;
  id: string;
  vendedor: string;
  metaMensal: number;
  realizado: number;
  editaisGanhos: number;
  percentual: number;
}

interface AcaoPosPerda {
  [key: string]: unknown;
  id: string;
  edital: string;
  orgao: string;
  motivo: string;
  acao: string;
  responsavel: string;
  prazo: string;
  status: "pendente" | "em_andamento" | "concluida";
}

// Dados mock
const mockLeads: Lead[] = [
  { id: "1", edital: "PE-055/2026", orgao: "UFMG", objeto: "Microscopios opticos", valor: 150000, scoreAderencia: 92, dataAbertura: "20/02/2026", status: "novo", responsavel: "Joao Silva", ultimoContato: null },
  { id: "2", edital: "PE-048/2026", orgao: "USP", objeto: "Centrifugas laboratorio", valor: 85000, scoreAderencia: 88, dataAbertura: "18/02/2026", status: "contatado", responsavel: "Maria Santos", ultimoContato: "10/02/2026" },
  { id: "3", edital: "PE-042/2026", orgao: "UNICAMP", objeto: "Reagentes diagnostico", valor: 45000, scoreAderencia: 75, dataAbertura: "15/02/2026", status: "qualificado", responsavel: "Joao Silva", ultimoContato: "08/02/2026" },
  { id: "4", edital: "PE-038/2026", orgao: "UNESP", objeto: "Autoclaves", valor: 120000, scoreAderencia: 95, dataAbertura: "12/02/2026", status: "proposta", responsavel: "Maria Santos", ultimoContato: "09/02/2026" },
  { id: "5", edital: "PE-030/2026", orgao: "Pref. BH", objeto: "Equipamentos lab", valor: 200000, scoreAderencia: 82, dataAbertura: "10/02/2026", status: "ganho", responsavel: "Joao Silva", ultimoContato: "05/02/2026" },
];

const mockMetas: Meta[] = [
  { id: "1", vendedor: "Joao Silva", metaMensal: 500000, realizado: 350000, editaisGanhos: 3, percentual: 70 },
  { id: "2", vendedor: "Maria Santos", metaMensal: 400000, realizado: 280000, editaisGanhos: 2, percentual: 70 },
  { id: "3", vendedor: "Pedro Oliveira", metaMensal: 300000, realizado: 150000, editaisGanhos: 1, percentual: 50 },
];

const mockAcoesPosPerda: AcaoPosPerda[] = [
  { id: "1", edital: "PE-025/2026", orgao: "CEMIG", motivo: "Preco acima do mercado", acao: "Revisar politica de precos para equipamentos de alta tensao", responsavel: "Gerente Comercial", prazo: "28/02/2026", status: "em_andamento" },
  { id: "2", edital: "PE-020/2026", orgao: "Pref. SP", motivo: "Documentacao incompleta", acao: "Atualizar certidoes e criar checklist pre-submissao", responsavel: "Administrativo", prazo: "15/02/2026", status: "concluida" },
  { id: "3", edital: "PE-015/2026", orgao: "UFOP", motivo: "Requisito tecnico nao atendido", acao: "Avaliar inclusao de novo produto no portfolio", responsavel: "Tecnico", prazo: "10/03/2026", status: "pendente" },
];

export function CRMPage() {
  const [leads] = useState<Lead[]>(mockLeads);
  const [metas] = useState<Meta[]>(mockMetas);
  const [acoes] = useState<AcaoPosPerda[]>(mockAcoesPosPerda);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [responsavelFilter, setResponsavelFilter] = useState("todos");
  const [showContatoModal, setShowContatoModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchSearch = lead.edital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.objeto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todos" || lead.status === statusFilter;
    const matchResponsavel = responsavelFilter === "todos" || lead.responsavel === responsavelFilter;
    return matchSearch && matchStatus && matchResponsavel;
  });

  const getStatusBadge = (status: Lead["status"]) => {
    const config: Record<string, { class: string; label: string }> = {
      novo: { class: "status-badge-info", label: "Novo" },
      contatado: { class: "status-badge-warning", label: "Contatado" },
      qualificado: { class: "status-badge-primary", label: "Qualificado" },
      proposta: { class: "status-badge-warning", label: "Proposta" },
      ganho: { class: "status-badge-success", label: "Ganho" },
      perdido: { class: "status-badge-error", label: "Perdido" },
    };
    const { class: className, label } = config[status];
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const getAcaoStatusBadge = (status: AcaoPosPerda["status"]) => {
    const config: Record<string, { class: string; label: string }> = {
      pendente: { class: "status-badge-error", label: "Pendente" },
      em_andamento: { class: "status-badge-warning", label: "Em Andamento" },
      concluida: { class: "status-badge-success", label: "Concluida" },
    };
    const { class: className, label } = config[status];
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  // Calculos
  const totalLeads = leads.length;
  const leadsNovos = leads.filter(l => l.status === "novo").length;
  const leadsGanhos = leads.filter(l => l.status === "ganho").length;
  const valorPipeline = leads.filter(l => !["ganho", "perdido"].includes(l.status)).reduce((acc, l) => acc + l.valor, 0);

  const leadsColumns: Column<Lead>[] = [
    { key: "edital", header: "Edital", sortable: true },
    { key: "orgao", header: "Orgao" },
    { key: "objeto", header: "Objeto", render: (l) => <span title={l.objeto}>{l.objeto.length > 25 ? l.objeto.slice(0, 25) + "..." : l.objeto}</span> },
    { key: "valor", header: "Valor", render: (l) => formatCurrency(l.valor) },
    {
      key: "scoreAderencia",
      header: "Score",
      render: (l) => (
        <span className={`score-badge ${l.scoreAderencia >= 80 ? "success" : l.scoreAderencia >= 60 ? "warning" : "error"}`}>
          {l.scoreAderencia}%
        </span>
      )
    },
    { key: "dataAbertura", header: "Abertura" },
    { key: "status", header: "Status", render: (l) => getStatusBadge(l.status) },
    { key: "responsavel", header: "Responsavel" },
    {
      key: "acoes",
      header: "Acoes",
      width: "120px",
      render: (l) => (
        <div className="table-actions">
          <button title="Ver detalhes" onClick={() => setSelectedLead(l)}><Eye size={16} /></button>
          <button title="Registrar contato" onClick={() => { setSelectedLead(l); setShowContatoModal(true); }}><Phone size={16} /></button>
          <button title="Enviar email"><Mail size={16} /></button>
        </div>
      ),
    },
  ];

  const metasColumns: Column<Meta>[] = [
    { key: "vendedor", header: "Vendedor", sortable: true },
    { key: "metaMensal", header: "Meta Mensal", render: (m) => formatCurrency(m.metaMensal) },
    { key: "realizado", header: "Realizado", render: (m) => formatCurrency(m.realizado) },
    { key: "editaisGanhos", header: "Editais Ganhos" },
    {
      key: "percentual",
      header: "Atingimento",
      render: (m) => (
        <div className="progress-cell">
          <div className="progress-bar-small">
            <div
              className={`progress-fill ${m.percentual >= 80 ? "success" : m.percentual >= 50 ? "warning" : "error"}`}
              style={{ width: `${Math.min(m.percentual, 100)}%` }}
            />
          </div>
          <span className="progress-text">{m.percentual}%</span>
        </div>
      ),
    },
  ];

  const acoesColumns: Column<AcaoPosPerda>[] = [
    { key: "edital", header: "Edital" },
    { key: "orgao", header: "Orgao" },
    { key: "motivo", header: "Motivo da Perda", render: (a) => <span title={a.motivo}>{a.motivo.length > 30 ? a.motivo.slice(0, 30) + "..." : a.motivo}</span> },
    { key: "acao", header: "Acao", render: (a) => <span title={a.acao}>{a.acao.length > 35 ? a.acao.slice(0, 35) + "..." : a.acao}</span> },
    { key: "responsavel", header: "Responsavel" },
    { key: "prazo", header: "Prazo" },
    { key: "status", header: "Status", render: (a) => getAcaoStatusBadge(a.status) },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Users size={24} />
          <div>
            <h1>CRM - Gestao de Oportunidades</h1>
            <p>Leads, metas de vendedores e acoes pos-perda</p>
          </div>
        </div>
        <div className="page-header-actions">
          <ActionButton icon={<Plus size={16} />} label="Novo Lead" variant="primary" onClick={() => {}} />
        </div>
      </div>

      <div className="page-content">
        {/* KPIs */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon info"><Target size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{totalLeads}</span>
              <span className="stat-label">Total de Leads</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><Users size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{leadsNovos}</span>
              <span className="stat-label">Leads Novos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><Award size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{leadsGanhos}</span>
              <span className="stat-label">Ganhos no Mes</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary"><TrendingUp size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(valorPipeline)}</span>
              <span className="stat-label">Pipeline</span>
            </div>
          </div>
        </div>

        {/* Leads / Oportunidades */}
        <Card title="Leads (Editais com Aderencia)" icon={<Target size={18} />}>
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar edital, orgao..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "novo", label: "Novo" },
                  { value: "contatado", label: "Contatado" },
                  { value: "qualificado", label: "Qualificado" },
                  { value: "proposta", label: "Proposta" },
                  { value: "ganho", label: "Ganho" },
                  { value: "perdido", label: "Perdido" },
                ],
              },
              {
                key: "responsavel",
                label: "Responsavel",
                value: responsavelFilter,
                onChange: setResponsavelFilter,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "Joao Silva", label: "Joao Silva" },
                  { value: "Maria Santos", label: "Maria Santos" },
                  { value: "Pedro Oliveira", label: "Pedro Oliveira" },
                ],
              },
            ]}
          />
          <DataTable
            data={filteredLeads}
            columns={leadsColumns}
            idKey="id"
            emptyMessage="Nenhum lead encontrado"
          />
        </Card>

        {/* Metas dos Vendedores */}
        <Card title="Metas dos Vendedores" icon={<Award size={18} />}>
          <DataTable
            data={metas}
            columns={metasColumns}
            idKey="id"
            emptyMessage="Nenhuma meta cadastrada"
          />
        </Card>

        {/* Acoes Pos-Perda */}
        <Card title="Acoes Pos-Perda" icon={<MessageSquare size={18} />}>
          <DataTable
            data={acoes}
            columns={acoesColumns}
            idKey="id"
            emptyMessage="Nenhuma acao registrada"
          />
        </Card>
      </div>

      {/* Modal de Contato */}
      <Modal
        isOpen={showContatoModal}
        onClose={() => { setShowContatoModal(false); setSelectedLead(null); }}
        title={`Registrar Contato - ${selectedLead?.edital}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowContatoModal(false)}>Cancelar</button>
            <button className="btn btn-primary">Salvar</button>
          </>
        }
      >
        <FormField label="Tipo de Contato" required>
          <SelectInput
            value=""
            onChange={() => {}}
            options={[
              { value: "telefone", label: "Telefone" },
              { value: "email", label: "Email" },
              { value: "reuniao", label: "Reuniao" },
              { value: "visita", label: "Visita" },
            ]}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="Data do Contato" required>
          <input type="date" className="text-input" />
        </FormField>
        <FormField label="Observacoes">
          <textarea className="text-input" rows={3} placeholder="Descreva o contato realizado..." />
        </FormField>
        <FormField label="Proximo Passo">
          <TextInput value="" onChange={() => {}} placeholder="Ex: Agendar reuniao tecnica" />
        </FormField>
        <FormField label="Novo Status">
          <SelectInput
            value={selectedLead?.status || ""}
            onChange={() => {}}
            options={[
              { value: "novo", label: "Novo" },
              { value: "contatado", label: "Contatado" },
              { value: "qualificado", label: "Qualificado" },
              { value: "proposta", label: "Proposta Enviada" },
              { value: "ganho", label: "Ganho" },
              { value: "perdido", label: "Perdido" },
            ]}
          />
        </FormField>
      </Modal>
    </div>
  );
}
