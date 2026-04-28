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
  const [cicloId, setCicloId] = useState('piloto-ucf01')
  const [projetoId, setProjetoId] = useState('')
  const [sprintId, setSprintId] = useState('')
  const [selCts, setSelCts] = useState({}) // {ct_id: true}

  const [filtroCats, setFiltroCats] = useState({Cenário: true, Classe: false, Fronteira: false, Combinado: false})
  const [filtroTrilha, setFiltroTrilha] = useState('visual')
  const [soComPassos, setSoComPassos] = useState(true)
  const [abertos, setAbertos] = useState({})

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
    setUcs([])
    if (!sprintId) return
    const params = {}
    if (filtroTrilha) params.trilha = filtroTrilha
    if (soComPassos) params.so_com_passos = '1'
    api.sprintUcs(sprintId, params).then(d => {
      setUcs(d.ucs)
      // Por padrao abre primeiro UC
      if (d.ucs.length) setAbertos({[d.ucs[0].uc_id]: true})
    }).catch(e => setErro(e.message))
  }, [sprintId, filtroTrilha, soComPassos])

  // Filtro por categoria — client-side
  const ucsFiltrados = ucs.map(uc => ({
    ...uc,
    cts: uc.cts.filter(ct => filtroCats[ct.categoria]),
  })).filter(uc => uc.cts.length > 0)

  const totalSel = Object.values(selCts).filter(Boolean).length
  const podeSubmit = totalSel > 0 && titulo.trim() && sprintId && !busy

  const toggleCt = (ctId) => {
    setSelCts(s => ({...s, [ctId]: !s[ctId]}))
  }

  const toggleUC = (uc) => {
    const todasMarcadas = uc.cts.every(c => selCts[c.id])
    const nova = {...selCts}
    uc.cts.forEach(c => {
      if (c.tem_passos) nova[c.id] = !todasMarcadas
    })
    setSelCts(nova)
  }

  const criar = async (e) => {
    e.preventDefault()
    setErro(null); setBusy(true)
    try {
      const ct_ids = Object.entries(selCts).filter(([_,v]) => v).map(([k]) => k)
      const r = await api.criarTeste({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        sprint_id: sprintId,
        ciclo_id: cicloId.trim() || null,
        ct_ids,
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
              <label>Título *</label>
              <input value={titulo} onChange={e=>setTitulo(e.target.value)} required autoFocus placeholder="Ex: Smoke regressao Sprint 1" />
            </div>
            <div>
              <label>Ciclo (opcional)</label>
              <input value={cicloId} onChange={e=>setCicloId(e.target.value)} placeholder="Ex: piloto-ucf01" />
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
            <div className="full-row">
              <label>Descrição (opcional)</label>
              <textarea rows={2} value={descricao} onChange={e=>setDescricao(e.target.value)} />
            </div>
          </div>

          <h2 style={{color:'#e94560', marginTop:'2em'}}>Selecionar Casos de Teste</h2>

          <div className="filtros">
            <strong>Filtros:</strong>
            {Object.keys(filtroCats).map(cat => (
              <label key={cat}>
                <input type="checkbox" checked={filtroCats[cat]} onChange={()=> setFiltroCats(c => ({...c, [cat]: !c[cat]}))}/>
                {cat}
              </label>
            ))}
            <label style={{marginLeft:'1em'}}>Trilha:
              <select value={filtroTrilha} onChange={e=>setFiltroTrilha(e.target.value)}>
                <option value="visual">visual</option>
                <option value="">todas</option>
                <option value="e2e">e2e</option>
                <option value="humana">humana</option>
              </select>
            </label>
            <label><input type="checkbox" checked={soComPassos} onChange={()=>setSoComPassos(s=>!s)}/> só com passos cadastrados</label>
          </div>

          <div>
            {ucsFiltrados.length === 0 ? (
              <div className="empty">{sprintId ? 'Nenhum CT bate com os filtros (ou sprint sem CTs cadastrados).' : 'Selecione um projeto e sprint.'}</div>
            ) : (
              ucsFiltrados.map(uc => (
                <UcAccordion
                  key={uc.id}
                  uc={uc}
                  aberto={abertos[uc.uc_id]}
                  onToggleAccordion={() => setAbertos(a => ({...a, [uc.uc_id]: !a[uc.uc_id]}))}
                  selCts={selCts}
                  onToggleCt={toggleCt}
                  onToggleUC={() => toggleUC(uc)}
                />
              ))
            )}
          </div>

          <div className="resumo-bottom">
            <div>
              <strong style={{color:'#4caf50', fontSize:'14pt'}}>{totalSel}</strong> CTs selecionados
              — estimativa: ~{Math.max(1, totalSel * 5)} min
            </div>
            <button type="submit" className="primary" disabled={!podeSubmit}>
              {busy ? 'Criando...' : 'Criar Teste'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function UcAccordion({ uc, aberto, onToggleAccordion, selCts, onToggleCt, onToggleUC }) {
  const todasMarcadas = uc.cts.every(c => selCts[c.id]) && uc.cts.length > 0
  return (
    <div className="uc-accordion">
      <div className="uc-header" onClick={onToggleAccordion}>
        <div onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={todasMarcadas} onChange={onToggleUC} style={{marginRight:'0.5em'}} />
          <span className="titulo">{uc.uc_id}</span> — {uc.nome}
        </div>
        <span className="count">{uc.cts.length} CT(s) {aberto ? '▼' : '▶'}</span>
      </div>
      {aberto && (
        <div className="uc-cts">
          {uc.cts.map(c => (
            <div key={c.id} className={'ct-item ' + (c.tem_passos ? '' : 'ct-no-passos')}>
              <input type="checkbox" id={'ct-'+c.id} checked={!!selCts[c.id]} disabled={!c.tem_passos} onChange={() => onToggleCt(c.id)} />
              <label htmlFor={'ct-'+c.id}>
                <span className={'badge-cat badge-cat-' + c.categoria.toLowerCase().replace('á','a')}>{c.categoria}</span>
                <span className="ct-id-mono">{c.ct_id}</span>{' '}
                <span style={{color:'#aaa'}}>[{c.tipo}/{c.trilha_sugerida}]</span> — {c.descricao}
                {c.tem_passos && <span style={{color:'#aaa', marginLeft:'0.5em'}}>({c.n_passos} passos)</span>}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
