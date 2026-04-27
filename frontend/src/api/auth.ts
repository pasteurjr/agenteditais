const API_BASE = "";

export interface User {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
  super: boolean;
}

export interface EmpresaInfo {
  id: string;
  razao_social: string;
  cnpj: string;
  nome_fantasia?: string;
  area_padrao_id?: string;
  area_padrao_nome?: string;
  uf?: string;
  cidade?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  has_empresa: boolean;
  empresa?: EmpresaInfo;
}

export interface RefreshResponse {
  access_token: string;
  user: User;
  has_empresa: boolean;
  empresa?: EmpresaInfo;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao fazer login");
  }
  return res.json();
}

export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    throw new Error("Sessão expirada");
  }
  return res.json();
}

export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/user`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Não autenticado");
  }
  return res.json();
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao criar conta");
  }
  return res.json();
}

export interface EmpresaApi {
  id: string;
  razao_social: string;
  cnpj: string;
  nome_fantasia?: string;
  papel: string;
}

export async function minhasEmpresas(accessToken: string): Promise<EmpresaApi[]> {
  const res = await fetch(`${API_BASE}/api/auth/minhas-empresas`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.empresas || [];
}

export async function minhasEmpresasComVinculadas(
  accessToken: string
): Promise<{ empresas: EmpresaApi[]; vinculadas: EmpresaApi[] }> {
  const res = await fetch(`${API_BASE}/api/auth/minhas-empresas`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { empresas: [], vinculadas: [] };
  const data = await res.json();
  return { empresas: data.empresas || [], vinculadas: data.vinculadas || [] };
}
