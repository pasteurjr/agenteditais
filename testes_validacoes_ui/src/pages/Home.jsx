import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Topbar from './Topbar'
import { useAuth } from '../App'

export default function Home() {
  const { user } = useAuth()
  const [testes, setTestes] = useState(null)
  const [erro, setErro] = useState(null)
  const [verTodos, setVerTodos] = useState(false)

  const carregar = () => {
    setTestes(null)
    api.testes(verTodos ? {todos: '1'} : {})
       .then(setTestes)
       .catch(e => setErro(e.message))
  }
  useEffect(carregar, [verTodos])

  const emAndamento = (testes || []).filter(t => ['criado','em_andamento','pausado'].includes(t.estado))
  const historico   = (testes || []).filter(t => ['concluido','cancelado'].includes(t.estado))
  const aprovados = (testes || []).reduce((acc, t) => acc + t.n_concluidos, 0)

  return (
    <>
      <Topbar title="Home" />
      <div className="content">
        {erro && <div className="flash flash-erro">{erro}</div>}

        <div className="kpis">
          <div className="kpi"><div className="label">Em andamento</div><div className="value">{emAndamento.length}</div></div>
          <div className="kpi"><div className="label">CTs concluídos</div><div className="value">{aprovados}</div></div>
          <div className="kpi"><div className="label">Total de testes</div><div className="value">{(testes||[]).length}</div></div>
        </div>

        <div className="actions">
          <Link to="/novo" className="btn"><button className="primary">➕ Novo Teste</button></Link>
          {user?.administrador && (
            <button className={verTodos ? 'primary' : 'secondary'} onClick={() => setVerTodos(v => !v)}>
              {verTodos ? '🔁 Ver só meus' : '👥 Ver todos (admin)'}
            </button>
          )}
        </div>

        <Section title="Em andamento" testes={emAndamento} tipo="andamento" />
        <Section title="Histórico" testes={historico} tipo="historico" />
      </div>
    </>
  )
}

function Section({ title, testes, tipo }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      {!testes || testes.length === 0 ? (
        <div className="empty">{tipo === 'andamento' ? 'Nenhum teste em andamento. Clique em "Novo Teste".' : 'Sem testes concluídos.'}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Sprint</th>
              <th>Tester</th>
              <th>Estado</th>
              <th>Progresso</th>
              <th>Última atividade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {testes.map(t => (
              <tr key={t.id}>
                <td>{t.titulo}</td>
                <td>{t.sprint_nome}</td>
                <td>{t.tester}</td>
                <td><span className={'tag tag-' + t.estado}>{t.estado}</span></td>
                <td>{t.n_concluidos}/{t.n_cts}</td>
                <td>{t.atualizado_em}</td>
                <td>
                  {tipo === 'andamento' ? (
                    <Link to={`/teste/${t.id}`}><button className="primary btn-sm">Abrir</button></Link>
                  ) : (
                    <Link to={`/relatorio/${t.id}`}><button className="btn-sm">Relatório</button></Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
