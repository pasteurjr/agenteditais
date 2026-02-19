import { useState, useEffect, useCallback } from "react";
import { Building, Upload, Plus, Trash2, Eye, Download, AlertTriangle, X, RefreshCw, Mail, Phone, Loader2, AlertCircle, Lock } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, Modal, StatusBadge } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate, crudDelete } from "../api/crud";
import type { CrudListResponse } from "../api/crud";

interface EmpresaPageProps {
  onSendToChat?: (message: string, file?: File) => Promise<void>;
}

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  emails?: string;
  celulares?: string;
}

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
  cargo?: string;
  email?: string;
  telefone?: string;
}

interface CertidaoAutomatica {
  id: string;
  certidao: string;
  status: "obtida" | "pendente" | "erro";
  data_obtencao: string | null;
  validade: string | null;
}

export function EmpresaPage({ onSendToChat }: EmpresaPageProps) {
  // Empresa data
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");

  // Emails e celulares multiplos
  const [emails, setEmails] = useState<string[]>([]);
  const [celulares, setCelulares] = useState<string[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [novoCelular, setNovoCelular] = useState("");

  // Sub-tables
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [certidoes, setCertidoes] = useState<CertidaoAutomatica[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);

  // Loading/error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [showRespModal, setShowRespModal] = useState(false);

  // New responsavel form
  const [novoRespNome, setNovoRespNome] = useState("");
  const [novoRespCargo, setNovoRespCargo] = useState("");
  const [novoRespEmail, setNovoRespEmail] = useState("");
  const [novoRespTel, setNovoRespTel] = useState("");

  // New doc form
  const [novoDocTipo, setNovoDocTipo] = useState("");
  const [novoDocValidade, setNovoDocValidade] = useState("");
  const [novoDocFile, setNovoDocFile] = useState<File | null>(null);

  const loadEmpresa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: CrudListResponse = await crudList("empresas", { limit: 1 });
      if (res.items.length > 0) {
        const emp = res.items[0] as Record<string, unknown>;
        const id = String(emp.id ?? "");
        setEmpresaId(id);
        setRazaoSocial(String(emp.razao_social ?? ""));
        setNomeFantasia(String(emp.nome_fantasia ?? ""));
        setCnpj(String(emp.cnpj ?? ""));
        setInscricaoEstadual(String(emp.inscricao_estadual ?? ""));
        setWebsite(String(emp.website ?? ""));
        setInstagram(String(emp.instagram ?? ""));
        setLinkedin(String(emp.linkedin ?? ""));
        setFacebook(String(emp.facebook ?? ""));
        setEndereco(String(emp.endereco ?? ""));
        setCidade(String(emp.cidade ?? ""));
        setUf(String(emp.uf ?? ""));
        setCep(String(emp.cep ?? ""));
        const emailsStr = String(emp.emails ?? "");
        setEmails(emailsStr ? emailsStr.split(",").map(e => e.trim()).filter(Boolean) : []);
        const celStr = String(emp.celulares ?? "");
        setCelulares(celStr ? celStr.split(",").map(c => c.trim()).filter(Boolean) : []);

        // Load sub-tables
        await loadSubTables(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar empresa");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubTables = async (id: string) => {
    try {
      const [docsRes, certRes, respRes] = await Promise.all([
        crudList("empresa-documentos", { parent_id: id }),
        crudList("empresa-certidoes", { parent_id: id }),
        crudList("empresa-responsaveis", { parent_id: id }),
      ]);

      setDocumentos(docsRes.items.map(d => ({
        id: String(d.id ?? ""),
        nome: String(d.nome ?? ""),
        tipo: String(d.tipo ?? ""),
        validade: d.validade ? String(d.validade) : null,
        status: (d.status as Documento["status"]) || "ok",
        arquivo: d.arquivo ? String(d.arquivo) : undefined,
      })));

      setCertidoes(certRes.items.map(c => ({
        id: String(c.id ?? ""),
        certidao: String(c.certidao ?? ""),
        status: (c.status as CertidaoAutomatica["status"]) || "pendente",
        data_obtencao: c.data_obtencao ? String(c.data_obtencao) : null,
        validade: c.validade ? String(c.validade) : null,
      })));

      setResponsaveis(respRes.items.map(r => ({
        id: String(r.id ?? ""),
        nome: String(r.nome ?? ""),
        cargo: r.cargo ? String(r.cargo) : undefined,
        email: r.email ? String(r.email) : undefined,
        telefone: r.telefone ? String(r.telefone) : undefined,
      })));
    } catch {
      // Sub-tables may be empty or not exist yet - not a fatal error
    }
  };

  useEffect(() => {
    loadEmpresa();
  }, [loadEmpresa]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia,
        cnpj,
        inscricao_estadual: inscricaoEstadual,
        website,
        instagram,
        linkedin,
        facebook,
        endereco,
        cidade,
        uf,
        cep,
        emails: emails.join(","),
        celulares: celulares.join(","),
      };

      if (empresaId) {
        await crudUpdate("empresas", empresaId, data);
      } else {
        const created = await crudCreate("empresas", data);
        setEmpresaId(String(created.id ?? ""));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar empresa");
    } finally {
      setSaving(false);
    }
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

  const handleSalvarResponsavel = async () => {
    if (!novoRespNome.trim() || !empresaId) return;
    try {
      await crudCreate("empresa-responsaveis", {
        empresa_id: empresaId,
        nome: novoRespNome,
        cargo: novoRespCargo,
        email: novoRespEmail,
        telefone: novoRespTel,
      });
      setNovoRespNome("");
      setNovoRespCargo("");
      setNovoRespEmail("");
      setNovoRespTel("");
      setShowRespModal(false);
      await loadSubTables(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar responsavel");
    }
  };

  const handleExcluirResponsavel = async (id: string) => {
    if (!confirm("Excluir este responsavel?")) return;
    try {
      await crudDelete("empresa-responsaveis", id);
      setResponsaveis(responsaveis.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir responsavel");
    }
  };

  const handleSalvarDocumento = async () => {
    if (!novoDocTipo || !empresaId) return;
    try {
      await crudCreate("empresa-documentos", {
        empresa_id: empresaId,
        tipo: novoDocTipo,
        nome: novoDocTipo,
        validade: novoDocValidade || null,
        status: novoDocFile ? "ok" : "falta",
      });
      await loadSubTables(empresaId);
      setNovoDocTipo("");
      setNovoDocValidade("");
      setNovoDocFile(null);
      setShowDocModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar documento");
    }
  };

  const handleExcluirDocumento = async (id: string) => {
    if (!confirm("Excluir este documento?")) return;
    try {
      await crudDelete("empresa-documentos", id);
      setDocumentos(documentos.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir documento");
    }
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
              <button title="Excluir" className="danger" onClick={() => handleExcluirDocumento(d.id)}><Trash2 size={16} /></button>
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
    { key: "data_obtencao", header: "Data Obtencao", render: (c) => c.data_obtencao || "-" },
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
    { key: "cargo", header: "Cargo", render: (r) => r.cargo || "-" },
    { key: "email", header: "Email", render: (r) => r.email || "-" },
    {
      key: "acoes",
      header: "Acoes",
      width: "80px",
      render: (r) => (
        <div className="table-actions">
          <button title="Excluir" className="danger" onClick={() => handleExcluirResponsavel(r.id)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-center">
          <Loader2 size={32} className="spin" />
          <span>Carregando dados da empresa...</span>
        </div>
      </div>
    );
  }

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
        <div className="page-header-actions">
          <ActionButton
            icon={<Lock size={16} />}
            label="Verificar Documentos (Em breve)"
            onClick={() => {}}
            disabled
          />
        </div>
      </div>

      <div className="page-content">
        {error && (
          <div className="portfolio-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={loadEmpresa}>Tentar novamente</button>
          </div>
        )}

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
              icon={<Lock size={14} />}
              label="Buscar Certidoes (Em breve)"
              onClick={() => {}}
              disabled
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
            <button className="btn btn-primary" onClick={handleSalvarDocumento} disabled={!novoDocTipo}>Enviar</button>
          </>
        }
      >
        <FormField label="Tipo de Documento" required>
          <select className="select-input" value={novoDocTipo} onChange={(e) => setNovoDocTipo(e.target.value)}>
            <option value="">Selecione...</option>
            <optgroup label="Habilitacao Juridica">
              <option value="Contrato Social">Contrato Social</option>
              <option value="Procuracao">Procuracao</option>
            </optgroup>
            <optgroup label="Habilitacao Fiscal">
              <option value="Certidao Negativa">Certidao Negativa</option>
              <option value="Habilitacao Fiscal">Habilitacao Fiscal</option>
            </optgroup>
            <optgroup label="Habilitacao Economica/Financeira">
              <option value="Habilitacao Economica">Habilitacao Economica</option>
              <option value="Balanco Patrimonial">Balanco Patrimonial</option>
            </optgroup>
            <optgroup label="Qualificacao Tecnica">
              <option value="Qualificacao Tecnica">Qualificacao Tecnica</option>
              <option value="Atestado de Capacidade">Atestado de Capacidade</option>
            </optgroup>
            <optgroup label="Sanitarias/Regulatorias">
              <option value="AFE">AFE (ANVISA)</option>
              <option value="CBPAD">CBPAD</option>
              <option value="CBPP">CBPP</option>
              <option value="Corpo de Bombeiros">Corpo de Bombeiros</option>
            </optgroup>
            <optgroup label="Outros">
              <option value="Outro">Outro</option>
            </optgroup>
          </select>
        </FormField>
        <FormField label="Arquivo">
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => setNovoDocFile(e.target.files?.[0] || null)} />
        </FormField>
        <FormField label="Validade">
          <input type="date" className="text-input" value={novoDocValidade} onChange={(e) => setNovoDocValidade(e.target.value)} />
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
            <button className="btn btn-primary" onClick={handleSalvarResponsavel} disabled={!novoRespNome}>Salvar</button>
          </>
        }
      >
        <FormField label="Nome" required>
          <TextInput value={novoRespNome} onChange={setNovoRespNome} />
        </FormField>
        <FormField label="Cargo">
          <TextInput value={novoRespCargo} onChange={setNovoRespCargo} />
        </FormField>
        <FormField label="Email" required>
          <TextInput value={novoRespEmail} onChange={setNovoRespEmail} type="email" />
        </FormField>
        <FormField label="Telefone">
          <TextInput value={novoRespTel} onChange={setNovoRespTel} />
        </FormField>
      </Modal>
    </div>
  );
}
