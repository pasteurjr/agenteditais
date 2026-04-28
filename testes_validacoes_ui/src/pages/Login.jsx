import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErro(null); setBusy(true)
    try {
      await login(email, senha)
      nav('/')
    } catch (err) {
      setErro(err.message || 'falha no login')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="center-page">
      <div className="card center">
        <h1>🎬 Validação Visual</h1>
        <div className="subtitle">Facilicita.IA — Sprint 1</div>

        {erro && <div className="flash flash-erro">{erro}</div>}

        <form onSubmit={submit}>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />

          <label style={{marginTop: '1em'}}>Senha</label>
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} required />

          <button type="submit" className="primary" disabled={busy} style={{width:'100%', marginTop:'1.5em'}}>
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{marginTop:'1.5em', fontSize:'9pt', color:'#777', textAlign:'center'}}>
          Usuários de teste:<br/>
          pasteur / arnaldo / tarcisio (admin)<br/>
          marbei / marcelo / valida1 / valida2 (testers)<br/>
          Todos com <code>@valida.com</code> e senha <code>123456</code>
        </p>
      </div>
    </div>
  )
}
