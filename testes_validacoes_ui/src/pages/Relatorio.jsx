import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Topbar from './Topbar'

export default function Relatorio() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.relatorio(id).then(setData).catch(e => setErro(e.message))
  }, [id])

  if (erro) return <><Topbar title="Erro" /><div className="content"><div className="flash flash-erro">{erro}</div></div></>
  if (!data) return <><Topbar title="Carregando..." /><div className="content empty">Carregando...</div></>

  const { teste, execucoes } = data

  return (
    <>
      <Topbar title={`Relatório — ${teste.titulo}`} breadcrumb={`Home > ${teste.titulo}`} />
      <div className="content">
        <div className="section">
          <h2>Sumário</h2>
          <table style={{marginBottom:'1em'}}>
            <tbody>
              <tr><th>ID</th><td><code>{teste.id}</code></td></tr>
              <tr><th>Sprint</th><td>{teste.sprint_nome}</td></tr>
              <tr><th>Tester</th><td>{teste.tester}</td></tr>
              <tr><th>Ciclo</th><td>{teste.ciclo_id || '—'}</td></tr>
              <tr><th>Estado</th><td><span className={'tag tag-' + teste.estado}>{teste.estado}</span></td></tr>
              <tr><th>Iniciado em</th><td>{teste.iniciado_em || '-'}</td></tr>
              <tr><th>Concluído em</th><td>{teste.concluido_em || '-'}</td></tr>
            </tbody>
          </table>
          <div className="actions">
            <Link to="/"><button className="secondary">← Home</button></Link>
            <Link to={`/teste/${id}`}><button>Ver Teste</button></Link>
          </div>
        </div>

        <div className="section">
          <h2>Casos de Teste ({execucoes.length})</h2>
          {execucoes.map(e => (
            <CtBlock key={e.ordem} e={e} />
          ))}
        </div>
      </div>
    </>
  )
}

function CtBlock({ e }) {
  return (
    <div className="ct-block">
      <div className="ct-block-header">
        <div>
          <span className="ct-id-mono">{e.ordem}. {e.ct_id}</span>
          <span style={{color:'#aaa', marginLeft:'0.5em'}}>({e.uc_id} — {e.uc_nome})</span>
          <br/><span style={{fontSize:'10pt'}}>{e.ct_descricao}</span>
        </div>
        <div>
          <span className={'tag tag-' + e.estado}>{e.estado}</span>
          <span style={{color:'#aaa', marginLeft:'0.5em'}}>{((e.duracao_ms||0)/1000).toFixed(1)}s</span>
        </div>
      </div>

      {e.passos && e.passos.length > 0 ? (
        e.passos.map(p => <PassoBlock key={p.ordem} p={p} />)
      ) : (
        <div className="empty">Sem passos registrados.</div>
      )}
    </div>
  )
}

function PassoBlock({ p }) {
  const cls = (p.veredicto_po || '').toLowerCase() || 'pendente'
  return (
    <div className={'passo-block ' + cls}>
      <strong>Passo {p.ordem} — <code>{p.passo_id}</code></strong>
      {p.passo_titulo && <span style={{color:'#aaa'}}> — {p.passo_titulo}</span>}
      <div style={{fontSize:'9pt', color:'#aaa', marginTop:'0.3em'}}>
        Auto: <strong>{p.veredito_automatico}</strong>
        {' | '}PO: <strong>{p.veredicto_po || '—'}</strong>
        {' | '}{((p.duracao_ms || 0)/1000).toFixed(1)}s
        {p.correcao_necessaria && <span style={{color:'#ff9800'}}> | ⚠ Correção necessária</span>}
      </div>
      {(p.screenshot_antes_path || p.screenshot_depois_path) && (
        <div className="screens-pair">
          {p.screenshot_antes_path && (
            <div>
              <div className="label">ANTES</div>
              <img src={api.screenshotUrl(p.screenshot_antes_path)} alt="antes" />
            </div>
          )}
          {p.screenshot_depois_path && (
            <div>
              <div className="label">DEPOIS</div>
              <img src={api.screenshotUrl(p.screenshot_depois_path)} alt="depois" />
            </div>
          )}
        </div>
      )}
      {p.observacoes && p.observacoes.map((o, i) => (
        <div key={i} className="observacao">💬 {o.texto}</div>
      ))}
      {p.correcao_descricao && (
        <div className="observacao" style={{borderLeftColor:'#ff9800'}}>🔧 Correção: {p.correcao_descricao}</div>
      )}
    </div>
  )
}

