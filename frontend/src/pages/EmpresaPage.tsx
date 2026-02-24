import { useState, useEffect, useCallback } from "react";
import { Building, Upload, Plus, Trash2, Eye, Download, AlertTriangle, X, RefreshCw, Mail, Phone, Loader2, AlertCircle, Pencil, Search, Sparkles } from "lucide-react";
import { Card, DataTable, ActionButton, FormField, TextInput, SelectInput, Modal, StatusBadge } from "../components/common";
import type { Column } from "../components/common";
import { crudList, crudCreate, crudUpdate, crudDelete, getCrudTokenGetter } from "../api/crud";
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
  tipo?: string;
  cargo?: string;
  email?: string;
  telefone?: string;
}

interface CertidaoAutomatica {
  id: string;
  certidao: string;
  tipo?: string;
  status: "valida" | "vencida" | "pendente" | "buscando" | "erro" | "nao_disponivel";
  data_obtencao: string | null;
  validade: string | null;
  path_arquivo?: string;
  url_consulta?: string;
  orgao_emissor?: string;
  fonte_certidao_id?: string;
  fonte_nome?: string;
  permite_busca_automatica?: boolean;
}

const TIPO_RESPONSAVEL_OPTIONS = [
  { value: "representante_legal", label: "Representante Legal" },
  { value: "preposto", label: "Preposto" },
  { value: "tecnico", label: "Responsavel Tecnico" },
];

const TIPO_RESPONSAVEL_LABELS: Record<string, string> = {
  representante_legal: "Representante Legal",
  preposto: "Preposto",
  tecnico: "Responsavel Tecnico",
};

function calcDocStatus(hasArquivo: boolean, dataVencimento: string | null): "ok" | "vence" | "falta" {
  if (!hasArquivo) return "falta";
  if (!dataVencimento) return "ok";
  const hoje = new Date();
  const venc = new Date(dataVencimento);
  const diffMs = venc.getTime() - hoje.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  if (diffDias <= 0) return "falta";
  if (diffDias <= 30) return "vence";
  return "ok";
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

  // Alertas IA
  const [alertasIA] = useState<string>("");

  // Certidoes loading
  const [buscandoCertidoes, setBuscandoCertidoes] = useState(false);
  const [certidoesMsg, setCertidoesMsg] = useState<string | null>(null);
  const [freqCertidoes, setFreqCertidoes] = useState<string>("diaria");

  // New/Edit responsavel form
  const [editingRespId, setEditingRespId] = useState<string | null>(null);
  const [novoRespTipo, setNovoRespTipo] = useState("");
  const [novoRespNome, setNovoRespNome] = useState("");
  const [novoRespCargo, setNovoRespCargo] = useState("");
  const [novoRespEmail, setNovoRespEmail] = useState("");
  const [novoRespTel, setNovoRespTel] = useState("");

  // New doc form
  const [novoDocTipo, setNovoDocTipo] = useState("");
  const [novoDocValidade, setNovoDocValidade] = useState("");
  const [novoDocFile, setNovoDocFile] = useState<File | null>(null);

  // Upload certidao modal
  const [showCertUploadModal, setShowCertUploadModal] = useState(false);
  const [uploadCertId, setUploadCertId] = useState<string | null>(null);
  const [uploadCertNome, setUploadCertNome] = useState("");
  const [uploadCertFile, setUploadCertFile] = useState<File | null>(null);
  const [uploadCertValidade, setUploadCertValidade] = useState("");
  const [uploadCertNumero, setUploadCertNumero] = useState("");

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
        setFreqCertidoes(String(emp.frequencia_busca_certidoes ?? "diaria"));

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

      setDocumentos(docsRes.items.map(d => {
        const hasArquivo = !!(d.path_arquivo || d.arquivo);
        const dataVenc = d.data_vencimento ? String(d.data_vencimento) : (d.validade ? String(d.validade) : null);
        return {
          id: String(d.id ?? ""),
          nome: String(d.nome_arquivo || d.nome || d.tipo || ""),
          tipo: String(d.tipo ?? ""),
          validade: dataVenc,
          status: calcDocStatus(hasArquivo, dataVenc),
          arquivo: d.path_arquivo ? String(d.path_arquivo) : (d.arquivo ? String(d.arquivo) : undefined),
        };
      }));

      setCertidoes(certRes.items.map(c => ({
          id: String(c.id ?? ""),
          certidao: String(c.fonte_nome || c.orgao_emissor || c.tipo || "Certidão"),
          tipo: c.tipo ? String(c.tipo) : undefined,
          status: (c.status as CertidaoAutomatica["status"]) || "pendente",
          data_obtencao: c.data_obtencao ? String(c.data_obtencao) : null,
          validade: c.data_vencimento ? String(c.data_vencimento) : (c.validade ? String(c.validade) : null),
          path_arquivo: c.path_arquivo ? String(c.path_arquivo) : undefined,
          url_consulta: c.url_consulta ? String(c.url_consulta) : undefined,
          orgao_emissor: c.orgao_emissor ? String(c.orgao_emissor) : undefined,
          fonte_certidao_id: c.fonte_certidao_id ? String(c.fonte_certidao_id) : undefined,
          fonte_nome: c.fonte_nome ? String(c.fonte_nome) : undefined,
          permite_busca_automatica: c.permite_busca_automatica !== false,
      })));

      setResponsaveis(respRes.items.map(r => ({
        id: String(r.id ?? ""),
        nome: String(r.nome ?? ""),
        tipo: r.tipo ? String(r.tipo) : undefined,
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
      const payload = {
        empresa_id: empresaId,
        tipo: novoRespTipo,
        nome: novoRespNome,
        cargo: novoRespCargo,
        email: novoRespEmail,
        telefone: novoRespTel,
      };
      if (editingRespId) {
        await crudUpdate("empresa-responsaveis", editingRespId, payload);
      } else {
        await crudCreate("empresa-responsaveis", payload);
      }
      setEditingRespId(null);
      setNovoRespTipo("");
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

  const handleEditarResponsavel = (r: Responsavel) => {
    setEditingRespId(r.id);
    setNovoRespTipo(r.tipo || "");
    setNovoRespNome(r.nome);
    setNovoRespCargo(r.cargo || "");
    setNovoRespEmail(r.email || "");
    setNovoRespTel(r.telefone || "");
    setShowRespModal(true);
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
      const formData = new FormData();
      formData.append("empresa_id", empresaId);
      formData.append("tipo", novoDocTipo);
      if (novoDocValidade) formData.append("data_vencimento", novoDocValidade);
      if (novoDocFile) {
        formData.append("file", novoDocFile);
      }

      const headers: HeadersInit = {};
      const tokenFn = getCrudTokenGetter();
      if (tokenFn) {
        const token = await tokenFn();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/empresa-documentos/upload", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao fazer upload do documento");
      }

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

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const tokenFn = getCrudTokenGetter();
    if (tokenFn) {
      const token = await tokenFn();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleFreqCertidoesChange = async (valor: string) => {
    setFreqCertidoes(valor);
    if (empresaId) {
      try {
        await crudUpdate("empresas", empresaId, { frequencia_busca_certidoes: valor });
      } catch (err) {
        console.error("Erro ao salvar frequência:", err);
      }
    }
  };

  const handleBuscarCertidoes = async () => {
    if (!empresaId) {
      setError("Cadastre a empresa primeiro (com CNPJ) antes de buscar certidoes.");
      return;
    }
    if (!cnpj) {
      setError("A empresa precisa ter um CNPJ cadastrado para buscar certidoes.");
      return;
    }
    setBuscandoCertidoes(true);
    setCertidoesMsg(null);
    try {
      const headers = await getAuthHeaders();

      const res = await fetch("/api/empresa-certidoes/buscar-automatica", {
        method: "POST",
        headers,
        body: JSON.stringify({ empresa_id: empresaId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar certidoes");
      }

      setCertidoesMsg(`${data.message}. ${data.nota || ""}`);
      await loadSubTables(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar certidoes");
    } finally {
      setBuscandoCertidoes(false);
    }
  };

  const handleOpenCertUpload = (cert: CertidaoAutomatica) => {
    setUploadCertId(cert.id);
    setUploadCertNome(cert.certidao);
    setUploadCertFile(null);
    setUploadCertValidade("");
    setUploadCertNumero("");
    setShowCertUploadModal(true);
  };

  const handleUploadCertidao = async () => {
    if (!uploadCertId || !uploadCertFile) return;
    try {
      const formData = new FormData();
      formData.append("file", uploadCertFile);
      if (uploadCertValidade) formData.append("data_vencimento", uploadCertValidade);
      if (uploadCertNumero) formData.append("numero", uploadCertNumero);

      const headers: HeadersInit = {};
      const tokenFn = getCrudTokenGetter();
      if (tokenFn) {
        const token = await tokenFn();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/empresa-certidoes/${uploadCertId}/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao fazer upload da certidao");
      }

      setShowCertUploadModal(false);
      if (empresaId) await loadSubTables(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload da certidao");
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
      case "valida":
        return <StatusBadge status="success" label="Valida" size="small" />;
      case "vencida":
        return <StatusBadge status="error" label="Vencida" size="small" />;
      case "pendente":
        return <StatusBadge status="warning" label="Pendente" size="small" />;
      case "buscando":
        return <StatusBadge status="info" label="Buscando..." size="small" />;
      case "erro":
        return <StatusBadge status="error" label="Erro" size="small" />;
      case "nao_disponivel":
        return <StatusBadge status="neutral" label="Manual" size="small" />;
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
              <button title="Visualizar" onClick={() => window.open(`/api/empresa-documentos/${d.id}/download`, "_blank")}><Eye size={16} /></button>
              <button title="Download" onClick={async () => {
                const tokenFn = getCrudTokenGetter();
                const token = tokenFn ? await tokenFn() : null;
                const res = await fetch(`/api/empresa-documentos/${d.id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = d.nome || "documento"; a.click(); URL.revokeObjectURL(url);
                }
              }}><Download size={16} /></button>
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
    { key: "orgao_emissor", header: "Orgao Emissor", render: (c) => c.orgao_emissor || "-" },
    { key: "status", header: "Status", render: (c) => getCertidaoStatus(c.status) },
    { key: "validade", header: "Validade", render: (c) => c.validade || "-" },
    {
      key: "acoes",
      header: "Acoes",
      width: "220px",
      render: (c) => (
        <div className="table-actions">
          {c.url_consulta && (
            <button title={`Abrir portal: ${c.orgao_emissor || c.certidao}`} onClick={() => window.open(c.url_consulta, "_blank")} style={{ color: "var(--color-primary, #3b82f6)" }}>
              <Eye size={16} />
            </button>
          )}
          <button title="Upload certidao (PDF)" onClick={() => handleOpenCertUpload(c)} style={{ color: "var(--color-warning, #f59e0b)" }}>
            <Upload size={16} />
          </button>
          {c.path_arquivo && (
            <button title="Download certidao" onClick={async () => {
              const tokenFn = getCrudTokenGetter();
              const token = tokenFn ? await tokenFn() : null;
              const res = await fetch(`/api/empresa-certidoes/${c.id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
              if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = c.certidao || "certidao"; a.click(); URL.revokeObjectURL(url);
              }
            }}><Download size={16} /></button>
          )}
          {c.permite_busca_automatica !== false && (
            <button title="Atualizar esta certidao" disabled={buscandoCertidoes} onClick={() => handleBuscarCertidoes()}>
              <RefreshCw size={16} className={buscandoCertidoes ? "spin" : ""} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const respColumns: Column<Responsavel>[] = [
    { key: "tipo", header: "Tipo", render: (r) => TIPO_RESPONSAVEL_LABELS[r.tipo || ""] || r.tipo || "-" },
    { key: "nome", header: "Nome", sortable: true },
    { key: "cargo", header: "Cargo", render: (r) => r.cargo || "-" },
    { key: "email", header: "Email", render: (r) => r.email || "-" },
    {
      key: "acoes",
      header: "Acoes",
      width: "120px",
      render: (r) => (
        <div className="table-actions">
          <button title="Editar" onClick={() => handleEditarResponsavel(r)}><Pencil size={16} /></button>
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
            icon={<Search size={16} />}
            label="Verificar Documentos"
            variant="primary"
            onClick={() => onSendToChat?.("Verifique os documentos da nossa empresa contra os editais que estamos participando. Liste documentos faltantes, vencidos e exigencias possivelmente ilegais.")}
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

        {/* Alertas IA sobre Documentos */}
        <Card
          title="Alertas IA sobre Documentos"
          subtitle="A IA verifica seus documentos contra requisitos de editais"
          icon={<Sparkles size={18} />}
          actions={
            <ActionButton
              icon={<Search size={14} />}
              label="Verificar Documentos"
              variant="primary"
              onClick={() => onSendToChat?.("Verifique os documentos da nossa empresa contra os editais que estamos participando. Liste documentos faltantes, vencidos e exigencias possivelmente ilegais.")}
            />
          }
        >
          {alertasIA ? (
            <div className="alertas-ia-content" style={{ whiteSpace: "pre-wrap", padding: "12px", background: "var(--bg-secondary, #f5f5f5)", borderRadius: "8px", fontSize: "14px", lineHeight: "1.6" }}>
              {alertasIA}
            </div>
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted, #888)" }}>
              <Sparkles size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
              <p>Clique em &quot;Verificar Documentos&quot; para a IA analisar sua documentacao.</p>
            </div>
          )}
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
          subtitle={cnpj ? `Busca certidoes para CNPJ ${cnpj} nos portais oficiais` : "Cadastre o CNPJ da empresa para buscar certidoes"}
          icon={<RefreshCw size={18} />}
          actions={
            <ActionButton
              icon={buscandoCertidoes ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
              label={buscandoCertidoes ? "Buscando..." : "Buscar Certidoes"}
              variant="primary"
              disabled={buscandoCertidoes || !cnpj}
              onClick={() => handleBuscarCertidoes()}
            />
          }
        >
          {certidoesMsg && (
            <div style={{ padding: "8px 12px", marginBottom: "12px", background: "var(--bg-success, #dcfce7)", borderRadius: "6px", fontSize: "13px", color: "var(--text-success, #166534)" }}>
              {certidoesMsg}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary, #666)" }}>Frequencia de busca automatica:</span>
            <select
              value={freqCertidoes}
              onChange={(e) => handleFreqCertidoesChange(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border, #ddd)", fontSize: "13px", background: "var(--bg-primary, #fff)", color: "var(--text-primary, #333)" }}
            >
              <option value="desativada">Desativada</option>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="quinzenal">Quinzenal</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
          <DataTable
            data={certidoes}
            columns={certidaoColumns}
            idKey="id"
            emptyMessage={cnpj
              ? 'Clique em "Buscar Certidoes" para consultar todas as fontes cadastradas'
              : "Cadastre o CNPJ da empresa primeiro"
            }
          />
          {certidoes.length > 0 && (
            <div style={{ padding: "8px 12px", marginTop: "8px", fontSize: "12px", color: "var(--text-muted, #888)" }}>
              {(() => {
                const publicas = certidoes.filter(c => c.permite_busca_automatica !== false && c.status !== "nao_disponivel").length;
                const manuais = certidoes.filter(c => c.status === "nao_disponivel").length;
                return `${certidoes.length} certidões (${publicas} com busca automática, ${manuais} manuais). `;
              })()}
              Clique no icone <Eye size={12} style={{ display: "inline", verticalAlign: "middle" }} /> para abrir o portal do orgao emissor.
            </div>
          )}
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
        onClose={() => {
          setShowRespModal(false);
          setEditingRespId(null);
          setNovoRespTipo("");
          setNovoRespNome("");
          setNovoRespCargo("");
          setNovoRespEmail("");
          setNovoRespTel("");
        }}
        title={editingRespId ? "Editar Responsavel" : "Adicionar Responsavel"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => {
              setShowRespModal(false);
              setEditingRespId(null);
              setNovoRespTipo("");
              setNovoRespNome("");
              setNovoRespCargo("");
              setNovoRespEmail("");
              setNovoRespTel("");
            }}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSalvarResponsavel} disabled={!novoRespNome}>Salvar</button>
          </>
        }
      >
        <FormField label="Tipo">
          <SelectInput
            value={novoRespTipo}
            onChange={setNovoRespTipo}
            options={TIPO_RESPONSAVEL_OPTIONS}
            placeholder="Selecione o tipo..."
          />
        </FormField>
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

      {/* Modal Upload Certidao */}
      <Modal
        isOpen={showCertUploadModal}
        onClose={() => setShowCertUploadModal(false)}
        title={`Upload Certidao: ${uploadCertNome}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCertUploadModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleUploadCertidao} disabled={!uploadCertFile}>
              <Upload size={14} /> Enviar
            </button>
          </>
        }
      >
        <FormField label="Arquivo (PDF)" required>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setUploadCertFile(e.target.files?.[0] || null)}
            style={{ width: "100%", padding: "8px", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "6px" }}
          />
        </FormField>
        <FormField label="Data de Vencimento">
          <TextInput
            value={uploadCertValidade}
            onChange={setUploadCertValidade}
            type="date"
            placeholder="YYYY-MM-DD"
          />
        </FormField>
        <FormField label="Numero da Certidao">
          <TextInput
            value={uploadCertNumero}
            onChange={setUploadCertNumero}
            placeholder="Ex: 12345/2026"
          />
        </FormField>
        <div style={{ padding: "8px 0", fontSize: "12px", color: "var(--text-muted, #888)" }}>
          Apos o upload, a certidao sera marcada como <strong>Valida</strong>.
          Informe a data de vencimento para receber alertas automaticos antes do vencimento.
        </div>
      </Modal>
    </div>
  );
}
