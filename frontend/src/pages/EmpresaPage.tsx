import { useState } from "react";
import { Building, Upload, Plus, Pencil, Trash2, Eye, Download, AlertTriangle, X, Sparkles, RefreshCw, Mail, Phone } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, Modal, StatusBadge } from "../components/common";
import type { Column } from "../components/common";

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  validade: string | null;
  status: "ok" | "vence" | "falta";
  arquivo?: string;
}

interface Responsavel {
  id: string;
  nome: string;
  cargo: string;
  email: string;
}

interface CertidaoAutomatica {
  id: string;
  certidao: string;
  status: "obtida" | "pendente" | "erro";
  dataObtencao: string | null;
  validade: string | null;
}

interface AlertaIA {
  id: string;
  mensagem: string;
  severidade: "critico" | "aviso" | "info";
}

// Dados mock
const mockDocumentos: Documento[] = [
  { id: "1", nome: "Contrato Social", tipo: "contrato", validade: null, status: "ok", arquivo: "contrato.pdf" },
  { id: "2", nome: "AFE", tipo: "afe", validade: "15/08/2026", status: "ok", arquivo: "afe.pdf" },
  { id: "3", nome: "CBPAD", tipo: "cbpad", validade: "10/03/2026", status: "vence", arquivo: "cbpad.pdf" },
  { id: "4", nome: "CBPP", tipo: "cbpp", validade: null, status: "falta" },
  { id: "5", nome: "Corpo de Bombeiros", tipo: "bombeiros", validade: "20/12/2026", status: "ok", arquivo: "bombeiros.pdf" },
  { id: "6", nome: "Certidao Negativa", tipo: "certidao", validade: "01/03/2026", status: "vence", arquivo: "certidao.pdf" },
  { id: "7", nome: "Balanco Patrimonial 2025", tipo: "hab_financeira", validade: null, status: "ok", arquivo: "balanco2025.pdf" },
  { id: "8", nome: "Atestado Capacidade Tecnica", tipo: "qual_tecnica", validade: null, status: "falta" },
];

const mockCertidoes: CertidaoAutomatica[] = [
  { id: "1", certidao: "CND FGTS", status: "obtida", dataObtencao: "08/02/2026", validade: "08/03/2026" },
  { id: "2", certidao: "CND INSS / Previdenciaria", status: "obtida", dataObtencao: "05/02/2026", validade: "05/03/2026" },
  { id: "3", certidao: "CND Receita Federal (Tributos)", status: "pendente", dataObtencao: null, validade: null },
  { id: "4", certidao: "CND Trabalhista (TST)", status: "obtida", dataObtencao: "01/02/2026", validade: "01/08/2026" },
  { id: "5", certidao: "CND Estadual (SEFAZ-MG)", status: "erro", dataObtencao: null, validade: null },
];

const mockAlertasIA: AlertaIA[] = [
  { id: "1", mensagem: "Certidao Negativa vence em 20 dias - renovar urgente", severidade: "critico" },
  { id: "2", mensagem: "Edital PE-001/2026 exige Atestado de Capacidade Tecnica - documento nao encontrado", severidade: "critico" },
  { id: "3", mensagem: "CBPP nao cadastrado - 73% dos editais da sua area exigem este documento", severidade: "aviso" },
  { id: "4", mensagem: "CBPAD vence em 28 dias - agende renovacao", severidade: "aviso" },
  { id: "5", mensagem: "Balanco Patrimonial 2025 cadastrado com sucesso - disponivel para licitacoes", severidade: "info" },
];

const mockResponsaveis: Responsavel[] = [
  { id: "1", nome: "Joao Silva", cargo: "Diretor", email: "joao@empresa.com" },
  { id: "2", nome: "Maria Santos", cargo: "Comercial", email: "maria@empresa.com" },
];

export function EmpresaPage() {
  // Estado do formulario
  const [razaoSocial, setRazaoSocial] = useState("Aquila Diagnostico Ltda");
  const [nomeFantasia, setNomeFantasia] = useState("Aquila Diagnostico");
  const [cnpj, setCnpj] = useState("11.111.111/0001-11");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("123.456.789");
  const [website, setWebsite] = useState("https://aquila.com.br");
  const [instagram, setInstagram] = useState("@aquiladiag");
  const [linkedin, setLinkedin] = useState("aquila-diagnostico");
  const [facebook, setFacebook] = useState("");
  const [endereco, setEndereco] = useState("Rua das Flores, 123");
  const [cidade, setCidade] = useState("Belo Horizonte");
  const [uf, setUf] = useState("MG");
  const [cep, setCep] = useState("30000-000");

  // Emails e celulares multiplos
  const [emails, setEmails] = useState(["contato@aquila.com.br", "comercial@aquila.com.br"]);
  const [celulares, setCelulares] = useState(["(31) 99999-9999", "(31) 98888-8888"]);
  const [novoEmail, setNovoEmail] = useState("");
  const [novoCelular, setNovoCelular] = useState("");

  const [documentos] = useState<Documento[]>(mockDocumentos);
  const [certidoes] = useState<CertidaoAutomatica[]>(mockCertidoes);
  const [responsaveis] = useState<Responsavel[]>(mockResponsaveis);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showRespModal, setShowRespModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [buscandoCertidoes, setBuscandoCertidoes] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleAddEmail = () => {
    if (novoEmail.trim()) {
      setEmails([...emails, novoEmail.trim()]);
      setNovoEmail("");
    }
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleAddCelular = () => {
    if (novoCelular.trim()) {
      setCelulares([...celulares, novoCelular.trim()]);
      setNovoCelular("");
    }
  };

  const handleRemoveCelular = (index: number) => {
    setCelulares(celulares.filter((_, i) => i !== index));
  };

  const handleBuscarCertidoes = () => {
    setBuscandoCertidoes(true);
    setTimeout(() => setBuscandoCertidoes(false), 2000);
  };

  const getStatusBadge = (status: Documento["status"]) => {
    switch (status) {
      case "ok":
        return <span className="status-badge status-badge-success">OK</span>;
      case "vence":
        return <span className="status-badge status-badge-warning"><AlertTriangle size={12} /> Vence em breve</span>;
      case "falta":
        return <span className="status-badge status-badge-error">Falta</span>;
    }
  };

  const getCertidaoStatus = (status: CertidaoAutomatica["status"]) => {
    switch (status) {
      case "obtida":
        return <StatusBadge status="success" label="Obtida" size="small" />;
      case "pendente":
        return <StatusBadge status="warning" label="Pendente" size="small" />;
      case "erro":
        return <StatusBadge status="error" label="Erro" size="small" />;
    }
  };

  const getAlertaIcon = (severidade: AlertaIA["severidade"]) => {
    switch (severidade) {
      case "critico":
        return <AlertTriangle size={14} style={{ color: "#ef4444" }} />;
      case "aviso":
        return <AlertTriangle size={14} style={{ color: "#eab308" }} />;
      case "info":
        return <Sparkles size={14} style={{ color: "#3b82f6" }} />;
    }
  };

  const getAlertaClass = (severidade: AlertaIA["severidade"]) => {
    switch (severidade) {
      case "critico": return "alerta-critico";
      case "aviso": return "alerta-aviso";
      case "info": return "alerta-info";
    }
  };

  const docColumns: Column<Documento>[] = [
    { key: "nome", header: "Documento", sortable: true },
    { key: "tipo", header: "Tipo", render: (d) => <span className="text-muted" style={{ fontSize: "12px" }}>{d.tipo}</span> },
    { key: "validade", header: "Validade", render: (d) => d.validade || "-" },
    { key: "status", header: "Status", render: (d) => getStatusBadge(d.status) },
    {
      key: "acoes",
      header: "Acoes",
      width: "120px",
      render: (d) => (
        <div className="table-actions">
          {d.arquivo ? (
            <>
              <button title="Visualizar"><Eye size={16} /></button>
              <button title="Download"><Download size={16} /></button>
              <button title="Excluir" className="danger"><Trash2 size={16} /></button>
            </>
          ) : (
            <button className="btn-small btn-primary" onClick={() => setShowDocModal(true)}>
              <Upload size={14} /> Upload
            </button>
          )}
        </div>
      ),
    },
  ];

  const certidaoColumns: Column<CertidaoAutomatica>[] = [
    { key: "certidao", header: "Certidao", sortable: true },
    { key: "status", header: "Status", render: (c) => getCertidaoStatus(c.status) },
    { key: "dataObtencao", header: "Data Obtencao", render: (c) => c.dataObtencao || "-" },
    { key: "validade", header: "Validade", render: (c) => c.validade || "-" },
    {
      key: "acoes",
      header: "Acoes",
      width: "80px",
      render: (c) => c.status === "obtida" ? (
        <div className="table-actions">
          <button title="Visualizar"><Eye size={16} /></button>
          <button title="Download"><Download size={16} /></button>
        </div>
      ) : (
        <div className="table-actions">
          <button title="Tentar novamente"><RefreshCw size={16} /></button>
        </div>
      ),
    },
  ];

  const respColumns: Column<Responsavel>[] = [
    { key: "nome", header: "Nome", sortable: true },
    { key: "cargo", header: "Cargo" },
    { key: "email", header: "Email" },
    {
      key: "acoes",
      header: "Acoes",
      width: "80px",
      render: () => (
        <div className="table-actions">
          <button title="Editar"><Pencil size={16} /></button>
          <button title="Excluir" className="danger"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <Building size={24} />
          <div>
            <h1>Dados da Empresa</h1>
            <p>Cadastro de informacoes e documentos da empresa</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Alertas de Documentacao (IA) */}
        <Card
          title="Alertas de Documentacao (IA)"
          icon={<Sparkles size={18} />}
          variant="attention"
        >
          <div className="alertas-ia-list">
            {mockAlertasIA.map((alerta) => (
              <div key={alerta.id} className={`alerta-ia-item ${getAlertaClass(alerta.severidade)}`}>
                {getAlertaIcon(alerta.severidade)}
                <span>{alerta.mensagem}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Informacoes Cadastrais */}
        <Card title="Informacoes Cadastrais" icon={<Building size={18} />}>
          <div className="form-grid form-grid-2">
            <FormField label="Razao Social" required>
              <TextInput value={razaoSocial} onChange={setRazaoSocial} />
            </FormField>
            <FormField label="Nome Fantasia">
              <TextInput value={nomeFantasia} onChange={setNomeFantasia} />
            </FormField>
            <FormField label="CNPJ" required>
              <TextInput value={cnpj} onChange={setCnpj} placeholder="00.000.000/0000-00" />
            </FormField>
            <FormField label="Inscricao Estadual">
              <TextInput value={inscricaoEstadual} onChange={setInscricaoEstadual} />
            </FormField>
          </div>

          <div className="form-section-title">Presenca Digital</div>
          <div className="form-grid form-grid-2">
            <FormField label="Website">
              <TextInput value={website} onChange={setWebsite} type="url" />
            </FormField>
            <FormField label="Instagram">
              <TextInput value={instagram} onChange={setInstagram} prefix="@" />
            </FormField>
            <FormField label="LinkedIn">
              <TextInput value={linkedin} onChange={setLinkedin} />
            </FormField>
            <FormField label="Facebook">
              <TextInput value={facebook} onChange={setFacebook} />
            </FormField>
          </div>

          <div className="form-section-title">Endereco</div>
          <div className="form-grid form-grid-1">
            <FormField label="Endereco">
              <TextInput value={endereco} onChange={setEndereco} />
            </FormField>
          </div>
          <div className="form-grid form-grid-3">
            <FormField label="Cidade">
              <TextInput value={cidade} onChange={setCidade} />
            </FormField>
            <FormField label="UF">
              <TextInput value={uf} onChange={setUf} />
            </FormField>
            <FormField label="CEP">
              <TextInput value={cep} onChange={setCep} />
            </FormField>
          </div>

          {/* Emails multiplos */}
          <div className="form-section-title">
            <Mail size={16} />
            Emails de Contato
          </div>
          <div className="multi-field-list">
            {emails.map((em, i) => (
              <div key={i} className="multi-field-item">
                <span>{em}</span>
                <button className="btn-icon-small" onClick={() => handleRemoveEmail(i)} title="Remover">
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="multi-field-add">
              <TextInput
                value={novoEmail}
                onChange={setNovoEmail}
                placeholder="Novo email..."
                type="email"
              />
              <ActionButton
                icon={<Plus size={14} />}
                label="Adicionar"
                onClick={handleAddEmail}
              />
            </div>
          </div>

          {/* Celulares multiplos */}
          <div className="form-section-title">
            <Phone size={16} />
            Celulares / Telefones
          </div>
          <div className="multi-field-list">
            {celulares.map((cel, i) => (
              <div key={i} className="multi-field-item">
                <span>{cel}</span>
                <button className="btn-icon-small" onClick={() => handleRemoveCelular(i)} title="Remover">
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="multi-field-add">
              <TextInput
                value={novoCelular}
                onChange={setNovoCelular}
                placeholder="Novo telefone..."
              />
              <ActionButton
                icon={<Plus size={14} />}
                label="Adicionar"
                onClick={handleAddCelular}
              />
            </div>
          </div>

          <div className="form-actions">
            <ActionButton
              label="Salvar Alteracoes"
              variant="primary"
              onClick={handleSave}
              loading={saving}
            />
          </div>
        </Card>

        {/* Documentos */}
        <Card
          title="Documentos da Empresa"
          icon={<Upload size={18} />}
          actions={
            <ActionButton
              icon={<Plus size={16} />}
              label="Upload Documento"
              onClick={() => setShowDocModal(true)}
            />
          }
        >
          <DataTable
            data={documentos}
            columns={docColumns}
            idKey="id"
            emptyMessage="Nenhum documento cadastrado"
          />
        </Card>

        {/* Certidoes Automaticas */}
        <Card
          title="Certidoes Automaticas"
          subtitle="O sistema busca certidoes automaticamente nos orgaos emissores"
          icon={<RefreshCw size={18} />}
          actions={
            <ActionButton
              icon={<RefreshCw size={14} />}
              label="Buscar Certidoes Agora"
              onClick={handleBuscarCertidoes}
              loading={buscandoCertidoes}
            />
          }
        >
          <DataTable
            data={certidoes}
            columns={certidaoColumns}
            idKey="id"
            emptyMessage="Nenhuma certidao automatica configurada"
          />
        </Card>

        {/* Responsaveis */}
        <Card
          title="Responsaveis"
          actions={
            <ActionButton
              icon={<Plus size={16} />}
              label="Adicionar"
              onClick={() => setShowRespModal(true)}
            />
          }
        >
          <DataTable
            data={responsaveis}
            columns={respColumns}
            idKey="id"
            emptyMessage="Nenhum responsavel cadastrado"
          />
        </Card>
      </div>

      {/* Modal Upload Documento */}
      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Upload de Documento"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Cancelar</button>
            <button className="btn btn-primary">Enviar</button>
          </>
        }
      >
        <FormField label="Tipo de Documento" required>
          <select className="select-input">
            <option value="">Selecione...</option>
            <optgroup label="Habilitacao Juridica">
              <option value="contrato">Contrato Social</option>
              <option value="procuracao">Procuracao</option>
            </optgroup>
            <optgroup label="Habilitacao Fiscal">
              <option value="certidao">Certidao Negativa</option>
              <option value="hab_fiscal">Habilitacao Fiscal</option>
            </optgroup>
            <optgroup label="Habilitacao Economica/Financeira">
              <option value="hab_financeira">Habilitacao Economica</option>
              <option value="balanco">Balanco Patrimonial</option>
            </optgroup>
            <optgroup label="Qualificacao Tecnica">
              <option value="qual_tecnica">Qualificacao Tecnica</option>
              <option value="atestado">Atestado de Capacidade</option>
            </optgroup>
            <optgroup label="Sanitarias/Regulatorias">
              <option value="afe">AFE (ANVISA)</option>
              <option value="cbpad">CBPAD</option>
              <option value="cbpp">CBPP</option>
              <option value="bombeiros">Corpo de Bombeiros</option>
            </optgroup>
            <optgroup label="Outros">
              <option value="outro">Outro</option>
            </optgroup>
          </select>
        </FormField>
        <FormField label="Arquivo" required>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" />
        </FormField>
        <FormField label="Validade">
          <input type="date" className="text-input" />
        </FormField>
      </Modal>

      {/* Modal Responsavel */}
      <Modal
        isOpen={showRespModal}
        onClose={() => setShowRespModal(false)}
        title="Adicionar Responsavel"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowRespModal(false)}>Cancelar</button>
            <button className="btn btn-primary">Salvar</button>
          </>
        }
      >
        <FormField label="Nome" required>
          <TextInput value="" onChange={() => {}} />
        </FormField>
        <FormField label="Cargo">
          <TextInput value="" onChange={() => {}} />
        </FormField>
        <FormField label="Email" required>
          <TextInput value="" onChange={() => {}} type="email" />
        </FormField>
        <FormField label="Telefone">
          <TextInput value="" onChange={() => {}} />
        </FormField>
      </Modal>
    </div>
  );
}
