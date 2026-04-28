import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, createContext, useContext } from 'react'
import { api } from './api'

import Login from './pages/Login'
import Home from './pages/Home'
import NovoTeste from './pages/NovoTeste'
import Teste from './pages/Teste'
import Relatorio from './pages/Relatorio'

// ===== Contexto de auth =====
const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = checando, null = nao logado
  useEffect(() => {
    api.me().then(d => setUser(d.user)).catch(() => setUser(null))
  }, [])
  const login = async (email, senha) => {
    const r = await api.login(email, senha)
    setUser(r.user)
    return r.user
  }
  const logout = async () => {
    try { await api.logout() } catch {}
    setUser(null)
  }
  return <AuthCtx.Provider value={{ user, setUser, login, logout }}>{children}</AuthCtx.Provider>
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (user === undefined) return <div className="center-page"><div className="card">Carregando...</div></div>
  if (user === null) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/novo" element={<RequireAuth><NovoTeste /></RequireAuth>} />
          <Route path="/teste/:id" element={<RequireAuth><Teste /></RequireAuth>} />
          <Route path="/relatorio/:id" element={<RequireAuth><Relatorio /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
