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
        <button onClick={onLogout} className="secondary btn-sm" style={{marginLeft:'1em'}}>Logout</button>
      </div>
    </header>
  )
}
