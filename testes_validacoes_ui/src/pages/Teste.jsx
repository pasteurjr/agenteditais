import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Topbar from './Topbar'

export default function Teste() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [erro, setErro] = useState(null)
  const [iniciando, setIniciando] = useState(false)
  const [iniciado, setIniciado] = useState(null)

  const carregar = () => {
    api.testeDetalhe(id).then(setData).catch(e => setErro(e.message))
  }
  useEffect(() => {
    carregar()
    const i = setInterval(carregar, 5000)
    return () => clearInterval(i)
  }, [id])

  const iniciar = async () => {
    setIniciando(true); setErro(null)
    try {
      const r = await api.iniciarTeste(id)
      setIniciado(r)
      // Abre painel em nova aba
      window.open(r.painel_url || 'http://localhost:9876', '_blank')
      carregar()
    } catch (e) {
      // Erro estruturado: mostra pendencias de predecessor de forma legivel
      const body = e.body || {}
      if (body.exige_predecessores && body.pendencias) {
        const linhas = body.pendencias.map(p =>
          `  ${p.uc_id} precisa de: ${p.faltam.join(', ')}`
        ).join('\n')
        setErro(
          `Predecessores nao satisfeitos:\n${linhas}\n\n` +
          `Inclua esses UCs no proprio teste ou execute-os antes em outro teste.`
        )
      } else if (body.exige_configuracao) {
        setErro(body.msg || e.message)
      } else {
        setErro(e.message)
      }
    } finally {
      setIniciando(false)
    }
  }

  const cancelar = async () => {
    if (!confirm('Cancelar este teste? Os CTs já executados ficam no histórico.')) return
    try {
      await api.cancelarTeste(id)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (erro) return <><Topbar title="Erro" /><div className="content"><div className="flash flash-erro">{erro}</div></div></>
  if (!data) return <><Topbar title="Carregando..." /><div className="content empty">Carregando...</div></>

  const { teste, execucoes } = data
  const podeIniciar = ['criado','pausado'].includes(teste.estado) && !teste.pid_executor

  return (
    <>
      <Topbar title={teste.titulo} breadcrumb={`Home > ${teste.titulo}`} />
      <div className="content">
        <div className="section">
          <h2>Sumário</h2>
          <table style={{marginBottom:'1em'}}>
            <tbody>
              <tr><th>ID</th><td><code>{teste.id}</code></td></tr>
              <tr><th>Projeto</th><td>{teste.projeto_nome}</td></tr>
              <tr><th>Sprint</th><td>{teste.sprint_nome}</td></tr>
              <tr><th>Tester</th><td>{teste.tester}</td></tr>
              <tr><th>Ciclo</th><td>{teste.ciclo_id || '—'}</td></tr>
              <tr><th>Estado</th><td><span className={'tag tag-' + teste.estado}>{teste.estado}</span></td></tr>
              <tr><th>Iniciado em</th><td>{teste.iniciado_em || '-'}</td></tr>
              <tr><th>Concluído em</th><td>{teste.concluido_em || '-'}</td></tr>
              <tr><th>PID executor</th><td>{teste.pid_executor || '—'}</td></tr>
            </tbody>
          </table>

          <div className="actions">
            {podeIniciar && (
              <button className="primary" onClick={iniciar} disabled={iniciando}>
                {iniciando ? 'Iniciando...' : (teste.estado === 'pausado' ? '▶️ Retomar' : '▶️ Iniciar Teste')}
              </button>
            )}
            {teste.pid_executor && (
              <a href="http://localhost:9876" target="_blank" rel="noreferrer">
                <button className="primary">🎬 Abrir Painel</button>
              </a>
            )}
            {['em_andamento','pausado'].includes(teste.estado) && (
              <button className="danger" onClick={cancelar}>⏹️ Cancelar</button>
            )}
            <Link to="/"><button className="secondary">← Home</button></Link>
            {teste.estado === 'concluido' && (
              <Link to={`/relatorio/${id}`}><button>📄 Ver Relatório</button></Link>
            )}
          </div>

          {iniciado && (
            <div className="flash flash-ok">
              ✓ Executor iniciado (PID {iniciado.pid}). Abra o painel: <a href={iniciado.painel_url} target="_blank">{iniciado.painel_url}</a>
              <br/>Log: <code>{iniciado.log_path}</code>
            </div>
          )}
        </div>

        <div className="section">
          <h2>Casos de Teste do conjunto ({execucoes.length})</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>CT</th>
                <th>UC</th>
                <th>Descrição</th>
                <th>Estado</th>
                <th>Auto</th>
                <th>PO</th>
                <th>Passos</th>
              </tr>
            </thead>
            <tbody>
              {execucoes.map(e => (
                <tr key={e.id}>
                  <td>{e.ordem}</td>
                  <td><code className="ct-id-mono">{e.ct_id}</code></td>
                  <td><strong>{e.uc_id}</strong><br/><span style={{fontSize:'9pt', color:'#aaa'}}>{e.uc_nome}</span></td>
                  <td>{e.ct_descricao}</td>
                  <td><span className={'tag tag-' + e.estado}>{e.estado}</span></td>
                  <td>{e.veredito_automatico}</td>
                  <td>{e.veredicto_po || '—'}</td>
                  <td>{e.n_passos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
