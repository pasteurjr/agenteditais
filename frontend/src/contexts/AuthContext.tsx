import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefresh, register as apiRegister } from "../api/auth";
import type { User } from "../api/auth";

const ACCESS_TOKEN_KEY = "editais_ia_access_token";
const REFRESH_TOKEN_KEY = "editais_ia_refresh_token";
const USER_KEY = "editais_ia_user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth state on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user
      }
    }
    setIsLoading(false);
  }, []);

  // Save auth state to localStorage
  const saveAuth = useCallback((access: string, refresh: string, userData: User) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
  }, []);

  // Clear auth state
  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    saveAuth(response.access_token, response.refresh_token, response.user);
  }, [saveAuth]);

  // Register
  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await apiRegister(name, email, password);
    saveAuth(response.access_token, response.refresh_token, response.user);
  }, [saveAuth]);

  // Logout
  const logout = useCallback(async () => {
    if (accessToken && refreshTokenValue) {
      try {
        await apiLogout(accessToken, refreshTokenValue);
      } catch {
        // Ignore logout errors
      }
    }
    clearAuth();
  }, [accessToken, refreshTokenValue, clearAuth]);

  // Get a valid access token (refresh if needed)
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken || !refreshTokenValue) {
      return null;
    }

    // Check if token is expired (simple check - tokens expire in 1 hour)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();

      // If token expires in less than 5 minutes, refresh it
      if (exp - now < 5 * 60 * 1000) {
        const response = await apiRefresh(refreshTokenValue);
        const newAccessToken = response.access_token;
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        setAccessToken(newAccessToken);
        if (response.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          setUser(response.user);
        }
        return newAccessToken;
      }
    } catch {
      // Token refresh failed, clear auth
      clearAuth();
      return null;
    }

    return accessToken;
  }, [accessToken, refreshTokenValue, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        accessToken,
        login,
        register,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
