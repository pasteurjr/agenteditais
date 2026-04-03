import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string;
}

interface Usuario {
  id: string;
  name: string;
  email: string;
}

interface Vinculo {
  id: string;
  user_id: string;
  empresa_id: string;
  papel: string;
  user_name: string;
  user_email: string;
  empresa_nome: string;
}

const API_BASE = "";

export function AssociarEmpresaUsuario() {
  const { getAccessToken } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [papel, setPapel] = useState("operador");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAccessToken();
    return fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  useEffect(() => {
    loadEmpresas();
    loadUsuarios();
  }, []);

  useEffect(() => {
    if (filterEmpresa) loadVinculos(filterEmpresa);
    else setVinculos([]);
  }, [filterEmpresa]);

  const loadEmpresas = async () => {
    const res = await authFetch("/api/crud/empresas?limit=500");
    if (res.ok) {
      const data = await res.json();
      setEmpresas(data.items || []);
    }
  };

  const loadUsuarios = async () => {
    const res = await authFetch("/api/crud/users?limit=500");
    if (res.ok) {
      const data = await res.json();
      setUsuarios(data.items || []);
    }
  };

  const loadVinculos = async (empresaId: string) => {
    const res = await authFetch(`/api/admin/vinculos?empresa_id=${empresaId}`);
    if (res.ok) {
      const data = await res.json();
      setVinculos(data.vinculos || []);
    }
  };

  const vincular = async () => {
    if (!selectedEmpresa || !selectedUser) {
      setMsg({ text: "Selecione empresa e usuário", error: true });
      return;
    }
    setLoading(true);
    const res = await authFetch("/api/admin/associar-empresa", {
      method: "POST",
      body: JSON.stringify({ user_id: selectedUser, empresa_id: selectedEmpresa, papel, acao: "vincular" }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ text: "Vínculo criado com sucesso!", error: false });
      if (filterEmpresa === selectedEmpresa) loadVinculos(filterEmpresa);
    } else {
      setMsg({ text: data.error || "Erro ao vincular", error: true });
    }
  };

  const desvincular = async (userId: string, empresaId: string) => {
    setLoading(true);
    const res = await authFetch("/api/admin/associar-empresa", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, empresa_id: empresaId, acao: "desvincular" }),
    });
    setLoading(false);
    if (res.ok) {
      loadVinculos(filterEmpresa);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Associar Empresa / Usuário</h1>
        <p className="page-subtitle">Vincule usuários às empresas que irão operar</p>
      </div>

      <div className="section-card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16, fontSize: 16 }}>Novo Vínculo</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Empresa</label>
            <select className="select-input" value={selectedEmpresa} onChange={e => setSelectedEmpresa(e.target.value)}>
              <option value="">Selecione...</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.razao_social} — {e.cnpj}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Usuário</label>
            <select className="select-input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">Selecione...</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Papel</label>
            <select className="select-input" value={papel} onChange={e => setPapel(e.target.value)}>
              <option value="operador">Operador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            className="action-button action-button-primary"
            onClick={vincular}
            disabled={loading}
          >
            Vincular
          </button>
        </div>
        {msg && (
          <div style={{ marginTop: 12, color: msg.error ? "#dc2626" : "#16a34a", fontSize: 13 }}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="section-card">
        <h2 style={{ marginBottom: 16, fontSize: 16 }}>Vínculos Existentes</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Filtrar por Empresa</label>
          <select className="select-input" style={{ maxWidth: 400 }} value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}>
            <option value="">Selecione uma empresa...</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.razao_social} — {e.cnpj}</option>
            ))}
          </select>
        </div>

        {filterEmpresa && vinculos.length === 0 && (
          <p style={{ color: "#6b7280", fontSize: 13 }}>Nenhum vínculo encontrado para esta empresa.</p>
        )}

        {vinculos.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>Usuário</th>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>Email</th>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>Papel</th>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 12px" }}>{v.user_name}</td>
                  <td style={{ padding: "8px 12px" }}>{v.user_email}</td>
                  <td style={{ padding: "8px 12px" }}>{v.papel}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <button
                      className="action-button action-button-danger action-button-small"
                      onClick={() => desvincular(v.user_id, v.empresa_id)}
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
