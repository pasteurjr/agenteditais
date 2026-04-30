import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Topbar from './Topbar'

export default function Teste() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [ciclo, setCiclo] = useState(null)
  const [runs, setRuns] = useState([])
  const [erro, setErro] = useState(null)
  const [busy, setBusy] = useState(false)
  const [busyMsg, setBusyMsg] = useState('')
  const [showAddUcs, setShowAddUcs] = useState(false)
  const [showReiniciar, setShowReiniciar] = useState(false)

  const carregar = async () => {
    try {
      const [d, c, r] = await Promise.all([
        api.testeDetalhe(id),
        api.testeCiclo(id).catch(() => null),
        api.testeRuns(id).catch(() => ({rodadas: []})),
      ])
      setData(d)
      setCiclo(c)
      setRuns(r.rodadas || [])
      setErro(null)
    } catch (e) {
      setErro(e.message)
    }
  }
  useEffect(() => {
    carregar()
    const i = setInterval(carregar, 5000)
    return () => clearInterval(i)
  }, [id])

  const tratarErro = (e) => {
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
      setErro(body.msg || e.message)
    }
  }

  const acao = async (label, fn, abrePainel = false) => {
    setBusy(true); setBusyMsg(label); setErro(null)
    try {
      const r = await fn()
      if (abrePainel && (r?.painel_url || r?.run_id)) {
        window.open(r.painel_url || 'http://localhost:9876', '_blank')
      }
      await carregar()
      return r
    } catch (e) {
      tratarErro(e)
      return null
    } finally {
      setBusy(false); setBusyMsg('')
    }
  }

  const iniciar  = () => acao('Iniciando...', () => api.iniciarTeste(id), true)
  const retomar  = () => acao('Retomando...', () => api.retomarTeste(id), true)
  const pausar   = () => acao('Pausando...',  () => api.pausarTeste(id))
  const cancelar = async () => {
    if (!confirm('Cancelar este teste? Os CTs já executados ficam no histórico.')) return
    await acao('Cancelando...', () => api.cancelarTeste(id))
  }

  if (erro) return <><Topbar title="Erro" /><div className="content"><div className="flash flash-erro" style={{whiteSpace:'pre-wrap'}}>{erro}</div></div></>
  if (!data) return <><Topbar title="Carregando..." /><div className="content empty">Carregando...</div></>

  const { teste, execucoes } = data
  const podeIniciar  = teste.estado === 'criado' && !teste.pid_executor
  const podePausar   = teste.estado === 'em_andamento' && teste.pid_executor
  const podeRetomar  = teste.estado === 'pausado' && !teste.pid_executor
  const podeCancelar = ['em_andamento', 'pausado'].includes(teste.estado)
  const podeAdicionar = ['pausado','concluido','cancelado','criado'].includes(teste.estado) && !teste.pid_executor
  const podeReiniciar = ['pausado','concluido','cancelado'].includes(teste.estado) && !teste.pid_executor

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
              <tr><th>Estado</th><td><span className={'tag tag-' + teste.estado}>{teste.estado}</span></td></tr>
              <tr><th>Rodada atual</th><td>{ciclo?.rodada?.numero ? `#${ciclo.rodada.numero}` : '—'} de {runs.length}</td></tr>
              <tr><th>PID executor</th><td>{teste.pid_executor || '—'}</td></tr>
            </tbody>
          </table>

          <div className="actions" style={{flexWrap:'wrap', gap:'0.5em'}}>
            {podeIniciar && (
              <button className="primary" onClick={iniciar} disabled={busy}>
                {busy && busyMsg.includes('Iniciar') ? '⏳ ' + busyMsg : '▶️ Iniciar Teste'}
              </button>
            )}
            {podeRetomar && (
              <button className="primary" onClick={retomar} disabled={busy}>
                {busy && busyMsg.includes('Retoma') ? '⏳ ' + busyMsg : '▶️ Retomar'}
              </button>
            )}
            {podePausar && (
              <button onClick={pausar} disabled={busy}>
                {busy && busyMsg.includes('Pausa') ? '⏳ ' + busyMsg : '⏸️ Pausar'}
              </button>
            )}
            {teste.pid_executor && (
              <a href="http://localhost:9876" target="_blank" rel="noreferrer">
                <button className="primary">🎬 Abrir Painel</button>
              </a>
            )}
            {podeAdicionar && (
              <button onClick={() => setShowAddUcs(true)} disabled={busy}>➕ Adicionar UCs</button>
            )}
            {podeReiniciar && (
              <button onClick={() => setShowReiniciar(true)} disabled={busy}>🔄 Reiniciar do zero</button>
            )}
            {podeCancelar && (
              <button className="danger" onClick={cancelar} disabled={busy}>⏹️ Cancelar</button>
            )}
            <Link to="/"><button className="secondary">← Home</button></Link>
            {(teste.estado === 'concluido' || runs.some(r => r.estado === 'concluido')) && (
              <Link to={`/relatorio/${id}`}><button>📄 Ver Relatório</button></Link>
            )}
          </div>
        </div>

        {ciclo && (
          <div className="section">
            <h2>🔄 Contexto da Rodada {ciclo.rodada?.numero}</h2>
            <table>
              <tbody>
                <tr><th>Ciclo ID</th><td><code>{ciclo.rodada?.ciclo_id || '—'}</code></td></tr>
                <tr><th>Estado da rodada</th><td><span className={'tag tag-' + ciclo.rodada?.estado}>{ciclo.rodada?.estado}</span></td></tr>
                <tr><th>👤 Usuário sintético</th><td>{ciclo.usuario_sintetico?.email || '—'}</td></tr>
                <tr><th>🏢 Empresa planejada</th><td>{ciclo.empresa_planejada?.razao || '—'} <span style={{color:'#aaa'}}>(CNPJ {ciclo.empresa_planejada?.cnpj || '—'})</span></td></tr>
                {ciclo.empresa_real_no_editais?.empresa_id_no_editais && (
                  <>
                    <tr><th>🗄️ Empresa criada no banco</th><td>
                      <strong>{ciclo.empresa_real_no_editais.razao_social}</strong>
                      <br/><span style={{fontSize:'9pt', color:'#aaa'}}>CNPJ: {ciclo.empresa_real_no_editais.cnpj} | id: <code>{ciclo.empresa_real_no_editais.empresa_id_no_editais.slice(0, 8)}...</code></span>
                    </td></tr>
                    <tr><th>📂 Hierarquia criada</th><td>
                      {ciclo.empresa_real_no_editais.hierarquia?.areas || 0} áreas,{' '}
                      {ciclo.empresa_real_no_editais.hierarquia?.classes || 0} classes,{' '}
                      {ciclo.empresa_real_no_editais.hierarquia?.subclasses || 0} subclasses
                    </td></tr>
                    <tr><th>🎯 Área padrão setada</th><td>{ciclo.empresa_real_no_editais.area_padrao_nome || '— (nenhuma)'}</td></tr>
                    <tr><th>🔗 Vínculos usuario_empresa</th><td>{ciclo.empresa_real_no_editais.vinculos_usuario_empresa || 0}</td></tr>
                    <tr><th>📧 Emails / 📞 Telefone</th><td style={{fontSize:'9pt'}}>{ciclo.empresa_real_no_editais.emails || '—'} | {ciclo.empresa_real_no_editais.telefone || '—'}</td></tr>
                  </>
                )}
                <tr><th>📁 Evidências</th><td style={{fontSize:'9pt'}}>{(ciclo.evidencias_dirs || []).map(d => <div key={d}><code>{d}</code></div>)}</td></tr>
                <tr><th>📄 Contexto YAML</th><td><code style={{fontSize:'9pt'}}>{ciclo.contexto_yaml_path}</code></td></tr>
              </tbody>
            </table>
          </div>
        )}

        {runs.length > 1 && (
          <div className="section">
            <h2>📚 Histórico de Rodadas ({runs.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Estado</th><th>Iniciado</th><th>Concluído</th>
                  <th>Passos</th><th>Aprov</th><th>Reprov</th><th>Obs</th>
                  <th>Empresa</th><th>Usuário</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(r => (
                  <tr key={r.id}>
                    <td>{r.numero}</td>
                    <td><span className={'tag tag-' + r.estado}>{r.estado}</span></td>
                    <td style={{fontSize:'9pt'}}>{r.iniciado_em ? r.iniciado_em.slice(0,16).replace('T',' ') : '—'}</td>
                    <td style={{fontSize:'9pt'}}>{r.concluido_em ? r.concluido_em.slice(0,16).replace('T',' ') : '—'}</td>
                    <td>{r.n_passos}</td>
                    <td style={{color:'#4caf50'}}>{r.n_cts_aprovados}</td>
                    <td style={{color:'#f44336'}}>{r.n_cts_reprovados}</td>
                    <td>{r.n_observacoes}</td>
                    <td style={{fontSize:'9pt'}}>{r.empresa_demo_cnpj || '—'}</td>
                    <td style={{fontSize:'9pt'}}>{r.user_sintetico_email?.split('@')[0] || '—'}</td>
                    <td><Link to={`/relatorio/${id}?run=${r.id}`}><button className="btn-sm">Relatório</button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="section">
          <h2>Casos de Teste da rodada atual ({execucoes.length})</h2>
          <table>
            <thead>
              <tr>
                <th>#</th><th>CT</th><th>UC</th><th>Descrição</th>
                <th>Estado</th><th>Auto</th><th>PO</th><th>Passos</th>
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

      {showAddUcs && (
        <ModalAdicionarUcs
          testeId={id}
          sprintId={teste.sprint_id}
          ucsExistentes={execucoes.map(e => e.uc_id)}
          onClose={() => setShowAddUcs(false)}
          onSuccess={() => { setShowAddUcs(false); carregar() }}
        />
      )}

      {showReiniciar && (
        <ModalReiniciar
          testeId={id}
          rodadaAtualNumero={ciclo?.rodada?.numero}
          ucsCanonicos={teste.uc_ids_canonicos || []}
          onClose={() => setShowReiniciar(false)}
          onSuccess={() => { setShowReiniciar(false); carregar(); nav(`/teste/${id}`) }}
        />
      )}
    </>
  )
}


function ModalAdicionarUcs({ testeId, sprintId, ucsExistentes, onClose, onSuccess }) {
  const [ucs, setUcs] = useState([])
  const [sel, setSel] = useState({})
  const [erro, setErro] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!sprintId) return
    api.sprintUcsResumo(sprintId).then(d => {
      // Filtra UCs ja na rodada atual + so executaveis
      const existentesSet = new Set(ucsExistentes)
      const disponiveis = d.ucs.filter(u => u.executavel && !existentesSet.has(u.uc_id))
      setUcs(disponiveis)
    }).catch(e => setErro(e.message))
  }, [sprintId])

  const confirmar = async () => {
    const ids = Object.entries(sel).filter(([_,v]) => v).map(([k]) => k)
    if (ids.length === 0) {
      setErro('Selecione pelo menos 1 UC')
      return
    }
    setBusy(true); setErro(null)
    try {
      await api.adicionarUcs(testeId, ids)
      onSuccess()
    } catch (e) {
      setErro(e.body?.msg || e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:'700px'}}>
        <h3>➕ Adicionar UCs ao teste</h3>
        <p style={{color:'#aaa', fontSize:'9pt'}}>UCs novos serão inseridos como pendentes na rodada atual.
        Predecessores serão respeitados (ordem topológica).</p>
        {erro && <div className="flash flash-erro">{erro}</div>}
        {ucs.length === 0 ? (
          <p>Nenhum UC executável disponível (todos já estão no teste).</p>
        ) : (
          <table>
            <thead>
              <tr><th></th><th>UC</th><th>Nome</th><th>CTs</th></tr>
            </thead>
            <tbody>
              {ucs.map(u => (
                <tr key={u.id}>
                  <td><input type="checkbox" checked={!!sel[u.id]}
                    onChange={() => setSel(s => ({...s, [u.id]: !s[u.id]}))} /></td>
                  <td><code>{u.uc_id}</code></td>
                  <td>{u.nome}</td>
                  <td>{u.n_cenario_visual_executavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="actions" style={{marginTop:'1em'}}>
          <button onClick={onClose} className="secondary">Cancelar</button>
          <button onClick={confirmar} disabled={busy || ucs.length===0} className="primary">
            {busy ? 'Adicionando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}


function ModalReiniciar({ testeId, rodadaAtualNumero, ucsCanonicos, onClose, onSuccess }) {
  const [erro, setErro] = useState(null)
  const [busy, setBusy] = useState(false)

  const confirmar = async () => {
    setBusy(true); setErro(null)
    try {
      const r = await api.reiniciarTeste(testeId)
      alert(`Rodada ${r.run_numero} criada com sucesso!\n\nUsuário: ${r.user_sintetico_email}\nEmpresa CNPJ: ${r.empresa_demo_cnpj}\nCTs pendentes: ${r.n_cts}`)
      onSuccess()
    } catch (e) {
      setErro(e.body?.msg || e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>🔄 Reiniciar teste do zero</h3>
        <p>Isso vai criar a <strong>Rodada {(rodadaAtualNumero || 1) + 1}</strong> do teste com:</p>
        <ul>
          <li>Novo usuário sintético (próximo <code>valida&lt;N&gt;</code> disponível)</li>
          <li>Nova empresa DEMO (novo CNPJ gerado)</li>
          <li>Mesmos {ucsCanonicos.length} UCs da rodada atual (todos pendentes)</li>
        </ul>
        <p style={{background:'rgba(76,175,80,0.1)', borderLeft:'3px solid #4caf50', padding:'0.5em'}}>
          ✓ A rodada {rodadaAtualNumero || 1} atual <strong>fica preservada</strong> no histórico.
          Seus passos, observações, screenshots e relatórios continuam acessíveis.
        </p>
        {erro && <div className="flash flash-erro">{erro}</div>}
        <div className="actions" style={{marginTop:'1em'}}>
          <button onClick={onClose} className="secondary">Cancelar</button>
          <button onClick={confirmar} disabled={busy} className="primary">
            {busy ? 'Criando rodada...' : 'Confirmar e criar nova rodada'}
          </button>
        </div>
      </div>
    </div>
  )
}
