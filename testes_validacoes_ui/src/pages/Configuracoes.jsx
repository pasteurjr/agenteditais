import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import Topbar from './Topbar'

export default function Configuracoes() {
  const nav = useNavigate()
  const [pasta, setPasta] = useState('')
  const [pastaSalva, setPastaSalva] = useState('')
  const [statusValido, setStatusValido] = useState(null)
  const [detalhes, setDetalhes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try {
      const r = await api.getPastaDocumentos()
      setPastaSalva(r.pasta || '')
      setPasta(r.pasta || '')
      setStatusValido(r.valida)
      setDetalhes(r.detalhes)
    } catch (e) {
      setMsg('Erro ao carregar: ' + e.message)
    }
  }

  async function validar() {
    if (!pasta.trim()) { setMsg('Informe a pasta primeiro'); return }
    setLoading(true); setMsg('')
    try {
      const r = await api.validarPastaDocumentos(pasta)
      setStatusValido(r.valida)
      setDetalhes(r.detalhes)
      if (r.valida) setMsg('✓ Pasta válida — pronto pra salvar')
      else setMsg('✗ ' + (r.detalhes?.erro || 'pasta inválida'))
    } catch (e) {
      setMsg('Erro: ' + e.message)
    } finally { setLoading(false) }
  }

  async function salvar() {
    if (!pasta.trim()) return
    setLoading(true); setMsg('')
    try {
      const r = await api.setPastaDocumentos(pasta)
      if (r.ok) {
        setPastaSalva(r.pasta)
        setStatusValido(true)
        setDetalhes(r.detalhes)
        setMsg('✓ Pasta salva com sucesso')
      } else {
        setMsg('✗ ' + (r.msg || 'erro ao salvar'))
      }
    } catch (e) {
      setMsg('Erro: ' + e.message)
    } finally { setLoading(false) }
  }

  function baixarZip() {
    // O navegador abre a caixa de download — tester escolhe pasta de download
    window.location.href = api.zipDocumentosUrl()
  }

  return (
    <div className="page">
      <Topbar title="Configurações" breadcrumb="Pasta de documentos" />
      <main style={{maxWidth: 720, margin: '2em auto', padding: '0 1em'}}>
        <h2>Pasta de documentos sintetizados</h2>
        <p style={{color: '#aaa', fontSize: '0.95em', lineHeight: 1.5}}>
          Os testes que envolvem upload de PDF (UC-F03, UC-CV10, UC-R05, etc) precisam acessar
          arquivos fictícios. Baixe o ZIP, descompacte numa pasta da sua escolha e cole o caminho
          completo dela aqui.
        </p>

        <section style={{background: '#1a1a2e', padding: '1.5em', borderRadius: 8, marginTop: '1.5em'}}>
          <h3 style={{marginTop: 0}}>1. Baixar o ZIP</h3>
          <p>Conteúdo: 91 PDFs / 35 UCs / 5 sprints (~2.3 MB).</p>
          <button onClick={baixarZip} className="primary" style={{padding: '0.6em 1.2em'}}>
            📦 Baixar documentos_sintetizados.zip
          </button>
        </section>

        <section style={{background: '#1a1a2e', padding: '1.5em', borderRadius: 8, marginTop: '1.5em'}}>
          <h3 style={{marginTop: 0}}>2. Descompactar e informar pasta</h3>
          <p>Após descompactar o ZIP, cole abaixo o <strong>caminho completo</strong> da pasta
            <code style={{background:'#000', padding:'2px 6px', margin:'0 4px'}}>documentos_sintetizados</code>
             (a pasta que contém as subpastas <code>sprint1/</code>, <code>sprint2/</code>, etc).
          </p>
          <p style={{fontSize: '0.85em', color: '#888'}}>
            Exemplo Linux/Mac: <code>/home/usuario/Downloads/documentos_sintetizados</code><br/>
            Exemplo Windows: <code>C:\Users\Usuario\Downloads\documentos_sintetizados</code>
          </p>

          <input
            type="text"
            value={pasta}
            onChange={e => setPasta(e.target.value)}
            placeholder="/caminho/completo/para/documentos_sintetizados"
            style={{
              width: '100%', padding: '0.6em', marginTop: '0.5em',
              background: '#0a0a1a', border: '1px solid #444', color: '#fff',
              borderRadius: 4, fontFamily: 'monospace', fontSize: '0.95em'
            }}
          />

          <div style={{marginTop: '1em', display: 'flex', gap: '0.5em'}}>
            <button onClick={validar} disabled={loading} className="secondary">
              Validar pasta
            </button>
            <button onClick={salvar} disabled={loading || !statusValido} className="primary">
              Salvar
            </button>
          </div>

          {msg && (
            <div style={{
              marginTop: '1em', padding: '0.7em',
              background: statusValido ? '#0a3a0a' : '#3a0a0a',
              border: '1px solid ' + (statusValido ? '#4a8a4a' : '#8a4a4a'),
              borderRadius: 4
            }}>
              {msg}
            </div>
          )}

          {detalhes && statusValido && (
            <div style={{marginTop: '1em', fontSize: '0.9em', color: '#aaa'}}>
              <strong>Estrutura encontrada:</strong>
              <ul>
                <li>Sprints: {(detalhes.sprints_encontradas || []).join(', ')}</li>
                <li>Total de PDFs: <strong>{detalhes.pdfs_total}</strong></li>
              </ul>
            </div>
          )}
        </section>

        <section style={{background: '#1a1a2e', padding: '1.5em', borderRadius: 8, marginTop: '1.5em'}}>
          <h3 style={{marginTop: 0}}>Status atual</h3>
          {pastaSalva ? (
            <div>
              <div>Pasta salva: <code style={{background:'#000', padding:'2px 6px'}}>{pastaSalva}</code></div>
              <div style={{marginTop: '0.5em'}}>
                {statusValido
                  ? <span style={{color: '#4a8a4a'}}>✓ Pasta acessível e estrutura OK</span>
                  : <span style={{color: '#8a4a4a'}}>✗ Pasta inacessível — verifique se moveu/renomeou</span>
                }
              </div>
            </div>
          ) : (
            <div style={{color: '#888'}}>Nenhuma pasta configurada ainda.</div>
          )}
        </section>

        <div style={{marginTop: '2em'}}>
          <button onClick={() => nav('/')} className="secondary">← Voltar para Home</button>
        </div>
      </main>
    </div>
  )
}
