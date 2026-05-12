import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function Topbar({ title, breadcrumb }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const onLogout = async () => { await logout(); nav('/login') }
  return (
    <header className="topbar">
      <h1>🎬 {title || 'Validação Visual'}</h1>
      <div className="right">
        {breadcrumb && <span style={{marginRight:'1em', color:'#aaa'}}>{breadcrumb}</span>}
        Olá, <strong>{user?.name || user?.email}</strong>
        {user?.administrador && <span className="badge-admin">ADMIN</span>}
        {/* Botão Config completamente oculto: pasta de documentos agora é fixa no servidor
            (env PASTA_DOCS_TESTE, default /home/pasteurjr/Documentos/documentos_sintetizados).
            A rota /configuracoes continua existindo no App.jsx — admin acessa direto pela URL
            se precisar diagnosticar. */}
        <button onClick={onLogout} className="secondary btn-sm" style={{marginLeft:'0.5em'}}>Logout</button>
      </div>
    </header>
  )
}
