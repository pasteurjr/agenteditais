import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefresh, register as apiRegister, minhasEmpresas as minhasEmpresasApi } from "../api/auth";
import type { User, EmpresaInfo } from "../api/auth";

const ACCESS_TOKEN_KEY = "editais_ia_access_token";
const REFRESH_TOKEN_KEY = "editais_ia_refresh_token";
const USER_KEY = "editais_ia_user";
const EMPRESA_KEY = "editais_ia_empresa";
const MINHAS_EMPRESAS_KEY = "editais_ia_minhas_empresas";
const PAPEL_KEY = "editais_ia_papel";

export interface EmpresaVinculada {
  id: string;
  razao_social: string;
  cnpj: string;
  nome_fantasia?: string;
  papel: string;
}

interface AuthContextType {
  user: User | null;
  empresa: EmpresaInfo | null;
  hasEmpresa: boolean;
  isAuthenticated: boolean;
  isSuper: boolean;
  isAdmin: boolean;  // super OU papel === 'admin' na empresa atual
  papel: string | null;
  isLoading: boolean;
  accessToken: string | null;
  minhasEmpresasList: EmpresaVinculada[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  selecionarEmpresa: (empresaId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minhasEmpresasList, setMinhasEmpresasList] = useState<EmpresaVinculada[]>([]);
  const [papel, setPapel] = useState<string | null>(null);

  // Load stored auth state on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const storedEmpresa = localStorage.getItem(EMPRESA_KEY);
    const storedMinhasEmpresas = localStorage.getItem(MINHAS_EMPRESAS_KEY);
    const storedPapel = localStorage.getItem(PAPEL_KEY);

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      try { setUser(JSON.parse(storedUser)); } catch { /* invalid */ }
      if (storedEmpresa) {
        try { setEmpresa(JSON.parse(storedEmpresa)); } catch { /* invalid */ }
      }
      if (storedMinhasEmpresas) {
        try { setMinhasEmpresasList(JSON.parse(storedMinhasEmpresas)); } catch { /* invalid */ }
      }
      if (storedPapel) setPapel(storedPapel);
    }
    setIsLoading(false);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EMPRESA_KEY);
    localStorage.removeItem(MINHAS_EMPRESAS_KEY);
    localStorage.removeItem(PAPEL_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setEmpresa(null);
    setMinhasEmpresasList([]);
    setPapel(null);
  }, []);

  const saveAuth = useCallback((access: string, refresh: string, userData: User, empresaData?: EmpresaInfo) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    if (empresaData) {
      localStorage.setItem(EMPRESA_KEY, JSON.stringify(empresaData));
      setEmpresa(empresaData);
    }
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
  }, []);

  const selecionarEmpresa = useCallback(async (empresaId: string) => {
    const token = accessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;
    const res = await fetch('/api/auth/switch-empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ empresa_id: empresaId }),
    });
    if (!res.ok) throw new Error('Erro ao selecionar empresa');
    const data = await res.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(EMPRESA_KEY, JSON.stringify(data.empresa));
    const novoPapel = data.papel ?? null;
    if (novoPapel) localStorage.setItem(PAPEL_KEY, novoPapel);
    else localStorage.removeItem(PAPEL_KEY);
    setAccessToken(data.access_token);
    setEmpresa(data.empresa);
    setPapel(novoPapel);
  }, [accessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);
    setUser(response.user);

    const empresas = await minhasEmpresasApi(response.access_token);
    setMinhasEmpresasList(empresas);
    localStorage.setItem(MINHAS_EMPRESAS_KEY, JSON.stringify(empresas));

    if (empresas.length === 1) {
      const res = await fetch('/api/auth/switch-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${response.access_token}` },
        body: JSON.stringify({ empresa_id: empresas[0].id }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(data.empresa));
        const novoPapel = data.papel ?? null;
        if (novoPapel) localStorage.setItem(PAPEL_KEY, novoPapel);
        setAccessToken(data.access_token);
        setEmpresa(data.empresa);
        setPapel(novoPapel);
      }
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await apiRegister(name, email, password);
    saveAuth(response.access_token, response.refresh_token, response.user, response.empresa);
  }, [saveAuth]);

  const logout = useCallback(async () => {
    if (accessToken && refreshTokenValue) {
      try { await apiLogout(accessToken, refreshTokenValue); } catch { /* ignore */ }
    }
    clearAuth();
  }, [accessToken, refreshTokenValue, clearAuth]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken || !refreshTokenValue) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const exp = payload.exp * 1000;
      if (exp - Date.now() < 5 * 60 * 1000) {
        const response = await apiRefresh(refreshTokenValue);
        const newToken = response.access_token;
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        setAccessToken(newToken);
        if (response.user) { localStorage.setItem(USER_KEY, JSON.stringify(response.user)); setUser(response.user); }
        if (response.empresa) { localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.empresa)); setEmpresa(response.empresa); }
        return newToken;
      }
    } catch {
      clearAuth();
      return null;
    }
    return accessToken;
  }, [accessToken, refreshTokenValue, clearAuth]);

  const isSuper = user?.super ?? false;
  const isAdmin = isSuper || papel === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        empresa,
        hasEmpresa: !!empresa,
        isAuthenticated: !!user,
        isSuper,
        isAdmin,
        papel,
        isLoading,
        accessToken,
        minhasEmpresasList,
        login,
        register,
        logout,
        getAccessToken,
        selecionarEmpresa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
