import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import Topbar from './Topbar'

export default function NovoTeste() {
  const nav = useNavigate()
  const [projetos, setProjetos] = useState([])
  const [sprints, setSprints] = useState([])
  const [ucs, setUcs] = useState([])

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [projetoId, setProjetoId] = useState('')
  const [sprintId, setSprintId] = useState('')
  const [selUcs, setSelUcs] = useState({}) // {uc_id: true}

  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.projetos().then(setProjetos).catch(e => setErro(e.message))
  }, [])

  useEffect(() => {
    setSprints([]); setSprintId('')
    if (!projetoId) return
    api.sprints(projetoId).then(setSprints).catch(e => setErro(e.message))
  }, [projetoId])

  useEffect(() => {
    setUcs([]); setSelUcs({})
    if (!sprintId) return
    api.sprintUcsResumo(sprintId).then(d => setUcs(d.ucs)).catch(e => setErro(e.message))
  }, [sprintId])

  const ucsExecutaveis = ucs.filter(uc => uc.executavel)
  const ucsNaoExecutaveis = ucs.filter(uc => !uc.executavel)

  const totalUcsSel = Object.values(selUcs).filter(Boolean).length
  const totalCtsEstimado = ucs
    .filter(uc => selUcs[uc.id])
    .reduce((acc, uc) => acc + uc.n_cenario_visual_executavel, 0)

  const podeSubmit = totalUcsSel > 0 && titulo.trim() && sprintId && !busy

  const toggleUc = (id) => setSelUcs(s => ({...s, [id]: !s[id]}))

  const marcarTodos = () => {
    const novo = {}
    ucsExecutaveis.forEach(uc => { novo[uc.id] = true })
    setSelUcs(novo)
  }

  const desmarcarTodos = () => setSelUcs({})

  const criar = async (e) => {
    e.preventDefault()
    setErro(null); setBusy(true)
    try {
      const uc_ids = Object.entries(selUcs).filter(([_,v]) => v).map(([k]) => k)
      const r = await api.criarTeste({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        sprint_id: sprintId,
        uc_ids,
      })
      nav(`/teste/${r.teste_id}`)
    } catch (err) {
      setErro(err.message); setBusy(false)
    }
  }

  return (
    <>
      <Topbar title="Novo Teste" breadcrumb="Home > Novo" />
      <div className="content">
        {erro && <div className="flash flash-erro">{erro}</div>}

        <form onSubmit={criar}>
          <div className="form-grid">
            <div>
              <label>Título do teste *</label>
              <input value={titulo} onChange={e=>setTitulo(e.target.value)} required autoFocus placeholder="Ex: Smoke regressao Sprint 1 - dia 28/04" />
            </div>
            <div>
              <label>Projeto *</label>
              <select value={projetoId} onChange={e=>setProjetoId(e.target.value)} required>
                <option value="">— selecione —</option>
                {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label>Sprint *</label>
              <select value={sprintId} onChange={e=>setSprintId(e.target.value)} required disabled={!projetoId}>
                <option value="">{projetoId ? '— selecione —' : '— escolha projeto —'}</option>
                {sprints.map(s => <option key={s.id} value={s.id}>Sprint {s.numero} — {s.nome}</option>)}
              </select>
            </div>
            <div>
              <label>Descrição (opcional)</label>
              <textarea rows={1} value={descricao} onChange={e=>setDescricao(e.target.value)} />
            </div>
          </div>

          <div className="flash flash-info" style={{marginTop:'1.5em'}}>
            <strong>Como funciona:</strong> ao criar este teste, o sistema gera automaticamente
            uma <strong>empresa nova com CNPJ único</strong> (ciclo isolado).
            Para cada UC marcado, todos os CTs Cenário+visual com passos cadastrados serão
            executados em ordem (FP → FAs → FEs).
          </div>

          <h2 style={{color:'#e94560', marginTop:'2em'}}>Selecionar Casos de Uso</h2>

          {sprintId && ucsExecutaveis.length > 0 && (
            <div className="actions">
              <button type="button" onClick={marcarTodos} className="btn-sm">Marcar todos executáveis</button>
              <button type="button" onClick={desmarcarTodos} className="secondary btn-sm">Desmarcar todos</button>
            </div>
          )}

          {!sprintId ? (
            <div className="empty">Selecione projeto e sprint primeiro.</div>
          ) : ucs.length === 0 ? (
            <div className="empty">Carregando UCs...</div>
          ) : (
            <>
              {ucsExecutaveis.length === 0 ? (
                <div className="flash flash-erro">
                  Nenhum UC desta sprint tem CTs executáveis (CTs Cenário+visual com passos cadastrados).
                  Cadastre passos primeiro.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th style={{width:'30px'}}></th>
                      <th>UC</th>
                      <th>Nome</th>
                      <th>CTs executáveis</th>
                      <th>Predecessores</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ucsExecutaveis.map(uc => {
                      // Calcula status dos predecessores: satisfeito se ja_executado pelo user OU presente no proprio teste
                      const predsUcConcretos = (uc.predecessores || []).filter(p => p.tipo === 'uc')
                      const predsAtendidos = predsUcConcretos.map(p => {
                        const ucPred = ucs.find(u => u.uc_id === p.uc_id)
                        const noTeste = ucPred && selUcs[ucPred.id]
                        return { ...p, atendido: p.satisfeito || noTeste }
                      })
                      const todosOk = predsAtendidos.every(p => p.atendido)
                      const labelPreds = predsUcConcretos.length === 0
                        ? <span style={{color:'#777'}}>—</span>
                        : predsAtendidos.map((p, i) => (
                            <span key={i} style={{
                              display:'inline-block', marginRight:'4px', padding:'1px 6px',
                              borderRadius:3, fontSize:'9pt',
                              background: p.atendido ? '#1a3a1a' : '#3a1a1a',
                              color: p.atendido ? '#4a8a4a' : '#8a4a4a',
                              border: '1px solid ' + (p.atendido ? '#2a5a2a' : '#5a2a2a'),
                            }}>{p.atendido ? '✓' : '✗'} {p.uc_id}</span>
                          ))
                      const statusBadge = uc.ja_executado ? (
                        <span style={{color:'#4a8a4a', fontSize:'9pt'}}>✓ já executado</span>
                      ) : todosOk ? (
                        <span style={{color:'#aaa', fontSize:'9pt'}}>—</span>
                      ) : (
                        <span style={{color:'#e94560', fontSize:'9pt'}} title="Predecessores ausentes">⚠ deps faltando</span>
                      )
                      return (
                        <tr key={uc.id} onClick={() => toggleUc(uc.id)} style={{cursor:'pointer'}}>
                          <td><input type="checkbox" checked={!!selUcs[uc.id]} onChange={()=>toggleUc(uc.id)} onClick={e=>e.stopPropagation()}/></td>
                          <td><strong className="ct-id-mono">{uc.uc_id}</strong></td>
                          <td>{uc.nome}</td>
                          <td><span style={{color:'#4caf50', fontWeight:'600'}}>{uc.n_cenario_visual_executavel}</span></td>
                          <td>{labelPreds}</td>
                          <td>{statusBadge}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {ucsNaoExecutaveis.length > 0 && (
                <details style={{marginTop:'1.5em'}}>
                  <summary style={{cursor:'pointer', color:'#aaa', fontSize:'10pt'}}>
                    {ucsNaoExecutaveis.length} UC(s) sem CTs executáveis (clique para ver)
                  </summary>
                  <table style={{marginTop:'0.5em', opacity:'0.6'}}>
                    <thead>
                      <tr><th>UC</th><th>Nome</th><th>Total CTs</th></tr>
                    </thead>
                    <tbody>
                      {ucsNaoExecutaveis.map(uc => (
                        <tr key={uc.id}>
                          <td><strong className="ct-id-mono">{uc.uc_id}</strong></td>
                          <td>{uc.nome}</td>
                          <td>{uc.n_total_cts} (sem passos)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}
            </>
          )}

          <div className="resumo-bottom">
            <div>
              <strong style={{color:'#4caf50', fontSize:'14pt'}}>{totalUcsSel}</strong> UC(s) selecionado(s)
              · <strong>{totalCtsEstimado}</strong> CT(s) serão executados
              · estimativa: ~{Math.max(1, totalCtsEstimado * 5)} min
            </div>
            <button type="submit" className="primary" disabled={!podeSubmit}>
              {busy ? 'Criando...' : 'Criar Teste (gera ciclo único)'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
