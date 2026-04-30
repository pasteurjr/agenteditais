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
          <div className="actions" style={{flexWrap:'wrap', gap:'0.5em'}}>
            <Link to="/"><button className="secondary">← Home</button></Link>
            <Link to={`/teste/${id}`}><button>Ver Teste</button></Link>
            <a href={api.relatorioMdUrl(id)} download>
              <button title="Markdown (texto)">📝 .md</button>
            </a>
            <a href={api.relatorioDocxUrl(id)} download>
              <button title="Word (com screenshots)">📄 .docx</button>
            </a>
            <a href={api.relatorioPdfUrl(id)} download>
              <button title="PDF (com screenshots)">📑 .pdf</button>
            </a>
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

function resumirAcao(a) {
  if (!a || typeof a !== 'object') return String(a)
  const tipo = (a.tipo || '?').toUpperCase()
  const sel = a.seletor
  const valor = a.valor_literal
  const valorDs = a.valor_from_dataset
  const valorCtx = a.valor_from_contexto
  const url = a.url || a.destino
  if (Array.isArray(a.sequencia)) return `${tipo} (sequencia de ${a.sequencia.length} sub-acoes)`
  if (tipo === 'CLICK' && sel) return `CLICK em "${sel.slice(0,120)}"`
  if (tipo === 'WAIT_FOR' && sel) return `WAIT_FOR "${sel.slice(0,120)}"`
  if (tipo === 'FILL' && sel) {
    const v = valor != null ? valor : valorDs ? `<dataset:${valorDs}>` : valorCtx ? `<contexto:${valorCtx}>` : '?'
    return `FILL "${sel.slice(0,80)}" com "${v}"`
  }
  if (tipo === 'SELECT' && sel) {
    const v = valor != null ? valor : valorDs ? `<dataset:${valorDs}>` : '?'
    return `SELECT "${sel.slice(0,80)}" → "${v}"`
  }
  if (['NAVIGATE','NAVEGACAO','GOTO'].includes(tipo) && url) return `${tipo} url=${url}`
  if (tipo === 'WAIT') return `WAIT ${valor || '?'} ms`
  if (tipo === 'EVALUATE') {
    const codigo = valor || ''
    const primeira = (codigo.split('\n').find(l => l.trim()) || '').trim()
    return `EVALUATE JS: ${primeira.slice(0,100)}`
  }
  if (tipo === 'CHAMAR_API' && url) return `CHAMAR_API ${a.metodo || 'POST'} ${url}`
  if (sel) return `${tipo} em "${sel.slice(0,120)}"`
  return tipo
}

function limparDescricao(s) {
  if (!s) return ''
  const linhas = s.trim().split('\n')
  while (linhas.length && (linhas[0].trim().startsWith('## ') || !linhas[0].trim())) {
    linhas.shift()
  }
  return linhas.join('\n').trim()
}

function PassoBlock({ p }) {
  const cls = (p.veredicto_po || '').toLowerCase() || 'pendente'
  const descricao = limparDescricao(p.descricao_painel)
  const acoes = p.acoes || []
  const pontos = p.pontos_observacao || []
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

      {descricao && (
        <div className="bloco-instrucao">
          <div className="bloco-label">📋 Instrução do passo:</div>
          <pre style={{whiteSpace:'pre-wrap', fontFamily:'inherit', margin:'0.3em 0', fontSize:'9pt'}}>{descricao}</pre>
        </div>
      )}

      {acoes.length > 0 && (
        <div className="bloco-acoes">
          <div className="bloco-label">🖱️ O que foi clicado/digitado:</div>
          <ol style={{margin:'0.3em 0', paddingLeft:'1.2em', fontSize:'8.5pt'}}>
            {acoes.map((a, i) => (
              Array.isArray(a.sequencia) ? (
                <li key={i}>
                  <strong>{(a.tipo || 'sequencia').toUpperCase()}</strong> — {a.sequencia.length} sub-ações:
                  <ol>
                    {a.sequencia.map((sub, j) => (
                      <li key={j}><code>{resumirAcao(sub)}</code></li>
                    ))}
                  </ol>
                </li>
              ) : (
                <li key={i}><code>{resumirAcao(a)}</code></li>
              )
            ))}
          </ol>
        </div>
      )}

      {pontos.length > 0 && (
        <div className="bloco-pontos">
          <div className="bloco-label">👀 Pontos a observar na tela:</div>
          <ul style={{margin:'0.3em 0', paddingLeft:'1.2em', fontSize:'9pt'}}>
            {pontos.map((ponto, i) => (
              <li key={i}>{ponto}</li>
            ))}
          </ul>
        </div>
      )}

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

