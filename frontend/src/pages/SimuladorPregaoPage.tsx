/**
 * SimuladorPregaoPage — UI do Simulador Multi-Agente de Pregão Eletrônico (Sprint 10).
 *
 * Layout 4 painéis:
 *  1. Topo: Config + botões de controle
 *  2. Esquerda: Petri Net SVG ao vivo
 *  3. Direita: Ranking + Timeline + Log
 *  4. Inferior: Chat com pregoeiro + Ações do operador
 *
 * Polling REST cada 1s. Operador participa como 6o licitante.
 */
import { useState, useEffect, useRef } from "react";

const API_BASE = ""; // mesma origem (proxy do Vite ou backend co-localizado)

type Personalidade = "agressivo" | "conservador" | "erratico" | "calculista" | "reativo" | "operador";

interface Agente {
  id: string;
  nome: string;
  personalidade: Personalidade;
  cnpj: string;
  custo: number;
  minimo: number;
}

interface Lugar {
  id: string;
  nome: string;
  coordenadas: { x: number; y: number };
  tokens: number;
  agentId: string | null;
}

interface Transicao {
  id: string;
  nome: string;
  coordenadas: { x: number; y: number };
  prioridade: number;
}

interface Arco {
  origem: string;
  destino: string;
  peso: number;
}

interface RankingItem {
  agente_id: string;
  valor: number;
  nome: string;
  personalidade: string;
}

interface Lance {
  rodada: number;
  agente_id: string;
  valor: number;
}

interface Estado {
  sessao_id: string;
  etapa: string;
  rodada: number;
  max_rodadas: number;
  config: any;
  petri_lugares: Lugar[];
  petri_transicoes: Transicao[];
  petri_arcos: Arco[];
  ranking: RankingItem[];
  historico_lances: Lance[];
  operador: Agente | null;
  instrucoes_pregoeiro: { de: string; msg: string; rodada: number }[];
  log: string[];
  resultado?: any;
}

const COR_PERSONALIDADE: Record<string, string> = {
  agressivo: "#dc2626",
  conservador: "#2563eb",
  erratico: "#a855f7",
  calculista: "#16a34a",
  reativo: "#ea580c",
  operador: "#facc15",
};

const ETAPA_LABEL: Record<string, string> = {
  propostas: "1. Propostas iniciais",
  lances: "2. Rodadas de lances abertos",
  lance_fechado_pendente: "3. Lance fechado",
  negociacao_pendente: "4. Negociação",
  habilitacao_pendente: "5. Habilitação documental",
  adjudicacao_pendente: "6. Adjudicação",
  encerrado: "✓ Pregão encerrado",
  deserto: "✗ Pregão deserto",
};

export function SimuladorPregaoPage() {
  // Config inicial
  const [valorReferencia, setValorReferencia] = useState(200);
  const [custoBase, setCustoBase] = useState(100);
  const [modalidade, setModalidade] = useState<"aberto" | "aberto_fechado">("aberto");
  const [useLLM, setUseLLM] = useState(false);

  // Estado da sessão
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Inputs do operador
  const [propostaOp, setPropostaOp] = useState<string>("");
  const [lanceOp, setLanceOp] = useState<string>("");
  const [chatMsg, setChatMsg] = useState<string>("");

  // Polling
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Iniciar pregão
  const iniciar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await fetch(`${API_BASE}/api/simulador/interativo/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor_referencia: valorReferencia,
          custo_base: custoBase,
          modalidade,
          operador_participa: true,
          operador_custo: custoBase,
          use_llm: useLLM,
        }),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.erro || "falha ao iniciar");
      setSessaoId(data.sessao_id);
      // Sugere proposta inicial = 95% do referencia
      setPropostaOp((valorReferencia * 0.95).toFixed(2));
    } catch (ex: any) {
      setErro(ex.message);
    } finally {
      setCarregando(false);
    }
  };

  // Polling
  useEffect(() => {
    if (!sessaoId) return;
    const fetchEstado = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/estado`);
        const data = await resp.json();
        if (data.ok) setEstado(data);
      } catch {}
    };
    fetchEstado();
    pollRef.current = setInterval(fetchEstado, 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessaoId]);

  // Submeter proposta inicial
  const submeterProposta = async () => {
    if (!sessaoId) return;
    setCarregando(true);
    try {
      const resp = await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/propostas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor_proposta_operador: parseFloat(propostaOp) }),
      });
      const data = await resp.json();
      if (data.erro) setErro(data.erro);
    } catch (ex: any) {
      setErro(ex.message);
    } finally {
      setCarregando(false);
    }
  };

  // Avançar rodada
  const avancarRodada = async (passar = false) => {
    if (!sessaoId) return;
    setCarregando(true);
    try {
      const body: any = { passar_operador: passar };
      if (!passar && lanceOp) body.lance_operador = parseFloat(lanceOp);
      const resp = await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/avancar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.erro) setErro(data.erro);
      setLanceOp("");
    } finally {
      setCarregando(false);
    }
  };

  const negociar = async () => {
    if (!sessaoId) return;
    await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/negociar`, { method: "POST" });
  };

  const habilitar = async () => {
    if (!sessaoId) return;
    await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/habilitar`, { method: "POST" });
  };

  const adjudicar = async () => {
    if (!sessaoId) return;
    await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/adjudicar`, { method: "POST" });
  };

  const enviarChat = async () => {
    if (!sessaoId || !chatMsg.trim()) return;
    await fetch(`${API_BASE}/api/simulador/interativo/${sessaoId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: chatMsg }),
    });
    setChatMsg("");
  };

  const resetar = () => {
    setSessaoId(null);
    setEstado(null);
    setErro(null);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  // Render Petri Net SVG
  const renderPetriNet = () => {
    if (!estado) return null;
    const W = 1400, H = 600;
    const lugarById = new Map(estado.petri_lugares.map(l => [l.id, l]));
    const trById = new Map(estado.petri_transicoes.map(t => [t.id, t]));

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", background: "#0b1220", borderRadius: 8 }}>
        {/* Arcos */}
        {estado.petri_arcos.map((a, i) => {
          const oLug = lugarById.get(a.origem);
          const oTr = trById.get(a.origem);
          const dLug = lugarById.get(a.destino);
          const dTr = trById.get(a.destino);
          const o = oLug || oTr;
          const d = dLug || dTr;
          if (!o || !d) return null;
          const x1 = o.coordenadas.x;
          const y1 = o.coordenadas.y;
          const x2 = d.coordenadas.x;
          const y2 = d.coordenadas.y;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#475569" strokeWidth={2} markerEnd="url(#arrow)" />
          );
        })}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
          </marker>
        </defs>
        {/* Lugares (círculos) */}
        {estado.petri_lugares.map(l => {
          const ativo = l.tokens > 0;
          return (
            <g key={l.id} transform={`translate(${l.coordenadas.x},${l.coordenadas.y})`}>
              <circle r={32} fill={ativo ? "#16a34a" : "#1e293b"} stroke={ativo ? "#22c55e" : "#475569"} strokeWidth={3} />
              {ativo && (<circle r={8} fill="#fff" />)}
              <text textAnchor="middle" y={50} fill="#cbd5e1" fontSize={11} fontWeight={600}>
                {l.nome.split("\n")[0].substring(0, 18)}
              </text>
              {ativo && (
                <text textAnchor="middle" y={5} fill="#fff" fontSize={14} fontWeight={700}>{l.tokens}</text>
              )}
            </g>
          );
        })}
        {/* Transições (retângulos) */}
        {estado.petri_transicoes.map(t => (
          <g key={t.id} transform={`translate(${t.coordenadas.x},${t.coordenadas.y})`}>
            <rect x={-25} y={-12} width={50} height={24} fill="#334155" stroke="#64748b" strokeWidth={1.5} />
            <text textAnchor="middle" y={5} fill="#e2e8f0" fontSize={9}>{t.id.replace("T_", "")}</text>
          </g>
        ))}
      </svg>
    );
  };

  // Botões de ação por etapa
  const botoesEtapa = () => {
    if (!estado) return null;
    const op = estado.operador;
    const opLider = estado.ranking.length > 0 && op && estado.ranking[0].agente_id === op.id;

    if (estado.etapa === "propostas") {
      return (
        <div>
          <h4>Propostas iniciais</h4>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>
            Submeta sua proposta selada. Mínimo R$ {op?.minimo.toFixed(2) || "?"}.
            Os 5 IAs submetem em paralelo.
          </p>
          <input type="number" value={propostaOp} onChange={e => setPropostaOp(e.target.value)}
            placeholder="Sua proposta R$" step="0.01" style={{ padding: 8, marginRight: 8 }} />
          <button onClick={submeterProposta} disabled={carregando}>Submeter Propostas</button>
        </div>
      );
    }
    if (estado.etapa === "lances") {
      return (
        <div>
          <h4>Rodada {estado.rodada + 1}/{estado.max_rodadas}</h4>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>
            Líder atual: <b>{estado.ranking[0]?.nome}</b> R$ {estado.ranking[0]?.valor.toFixed(2)}.
            {opLider ? " 🏆 VOCE eh o lider!" : ` Voce: R$ ${(estado.ranking.find(r => op && r.agente_id === op.id)?.valor || 0).toFixed(2)}`}
          </p>
          <input type="number" value={lanceOp} onChange={e => setLanceOp(e.target.value)}
            placeholder={`Novo lance R$ (min ${op?.minimo.toFixed(2)})`}
            step="0.01" style={{ padding: 8, marginRight: 8 }} />
          <button onClick={() => avancarRodada(false)} disabled={carregando || !lanceOp}>Dar Lance + Avançar</button>
          <button onClick={() => avancarRodada(true)} disabled={carregando}
            style={{ marginLeft: 8 }}>Passar / Avançar IAs</button>
        </div>
      );
    }
    if (estado.etapa === "negociacao_pendente" || estado.etapa === "lance_fechado_pendente") {
      return (
        <div>
          <h4>Encerrar disputa de lances</h4>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>
            Pregoeiro vai negociar com o lider {opLider ? "(VOCE!)" : ""}.
          </p>
          <button onClick={negociar} disabled={carregando}>Iniciar Negociação</button>
        </div>
      );
    }
    if (estado.etapa === "habilitacao_pendente") {
      return (
        <div>
          <h4>Habilitação documental</h4>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>
            Pregoeiro vai verificar documentos do lider {opLider ? "(VOCE!)" : ""}. 90% chance OK.
          </p>
          <button onClick={habilitar} disabled={carregando}>Verificar Documentos</button>
        </div>
      );
    }
    if (estado.etapa === "adjudicacao_pendente") {
      return (
        <div>
          <h4>Adjudicação final</h4>
          <button onClick={adjudicar} disabled={carregando}>ADJUDICAR + Gerar Ata</button>
        </div>
      );
    }
    if (estado.etapa === "encerrado") {
      const r = estado.resultado;
      const venceu = r?.operador_venceu;
      return (
        <div style={{ padding: 12, background: venceu ? "#052e16" : "#1e293b", border: `2px solid ${venceu ? "#22c55e" : "#475569"}`, borderRadius: 8 }}>
          <h3 style={{ color: venceu ? "#22c55e" : "#cbd5e1" }}>
            {venceu ? "🏆 VOCÊ VENCEU O PREGÃO!" : "Pregão encerrado"}
          </h3>
          <p>Vencedor: <b>{r?.vencedor_nome}</b></p>
          <p>Valor: R$ {r?.valor_adjudicado?.toFixed(2)}</p>
          <p>Economia: {r?.economia_pct?.toFixed(1)}% sobre R$ {r?.valor_referencia?.toFixed(2)}</p>
          <p>Total: {r?.total_lances} lances em {r?.total_rodadas} rodadas</p>
          <details>
            <summary style={{ cursor: "pointer", color: "#94a3b8" }}>Ver ata completa</summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, marginTop: 8 }}>{r?.ata}</pre>
          </details>
          <button onClick={resetar} style={{ marginTop: 12 }}>Novo Pregão</button>
        </div>
      );
    }
    return <p>Etapa: {estado.etapa}</p>;
  };

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", color: "#e2e8f0", background: "#020617", minHeight: "100vh" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 12 }}>
        🏛️ Simulador de Pregão Eletrônico
        <span style={{ fontSize: 12, padding: "2px 8px", background: "#1e40af", borderRadius: 4 }}>
          Lei 14.133/2021
        </span>
      </h1>

      {/* CONFIG */}
      {!sessaoId && (
        <div style={{ padding: 16, background: "#1e293b", borderRadius: 8, marginBottom: 16 }}>
          <h3>Configuração do pregão</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, alignItems: "end" }}>
            <label>Valor referência (R$)
              <input type="number" value={valorReferencia} onChange={e => setValorReferencia(parseFloat(e.target.value))} style={{ width: "100%", padding: 8 }} />
            </label>
            <label>Custo base (R$)
              <input type="number" value={custoBase} onChange={e => setCustoBase(parseFloat(e.target.value))} style={{ width: "100%", padding: 8 }} />
            </label>
            <label>Modalidade
              <select value={modalidade} onChange={e => setModalidade(e.target.value as any)} style={{ width: "100%", padding: 8 }}>
                <option value="aberto">Aberto</option>
                <option value="aberto_fechado">Aberto + Fechado</option>
              </select>
            </label>
            <label>
              <input type="checkbox" checked={useLLM} onChange={e => setUseLLM(e.target.checked)} />
              {" "}Usar DeepSeek (mais lento)
            </label>
          </div>
          <button onClick={iniciar} disabled={carregando}
            style={{ marginTop: 16, padding: "12px 24px", fontSize: 16, background: "#16a34a", color: "white", border: 0, borderRadius: 6 }}>
            {carregando ? "Iniciando..." : "🚀 Iniciar Pregão"}
          </button>
          {erro && <p style={{ color: "#ef4444" }}>Erro: {erro}</p>}
        </div>
      )}

      {sessaoId && estado && (
        <>
          {/* Status */}
          <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 14 }}>
            <div><b>Sessão:</b> {sessaoId.substring(0, 8)}…</div>
            <div><b>Etapa:</b> {ETAPA_LABEL[estado.etapa] || estado.etapa}</div>
            <div><b>Rodada:</b> {estado.rodada}/{estado.max_rodadas}</div>
            <div><b>Modalidade:</b> {estado.config?.modalidade}</div>
          </div>

          {/* Petri Net SVG (largura total) */}
          <div style={{ marginBottom: 16 }}>
            <h3>Rede de Petri (token verde = etapa atual)</h3>
            {renderPetriNet()}
          </div>

          {/* 2 colunas: Ranking + Log */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ padding: 12, background: "#1e293b", borderRadius: 8 }}>
              <h3>Ranking ao vivo</h3>
              {estado.ranking.length === 0 && <p style={{ color: "#94a3b8" }}>Aguardando propostas…</p>}
              <table style={{ width: "100%", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    <th style={{ textAlign: "left" }}>#</th>
                    <th style={{ textAlign: "left" }}>Licitante</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {estado.ranking.map((r, i) => (
                    <tr key={r.agente_id} style={{
                      background: estado.operador && r.agente_id === estado.operador.id ? "#422006" : "transparent",
                      fontWeight: estado.operador && r.agente_id === estado.operador.id ? 700 : 400,
                    }}>
                      <td>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                      <td>
                        <span style={{ display: "inline-block", width: 8, height: 8, background: COR_PERSONALIDADE[r.personalidade], borderRadius: "50%", marginRight: 6 }}></span>
                        {r.nome.substring(0, 35)}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>R$ {r.valor.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: 12, background: "#1e293b", borderRadius: 8 }}>
              <h3>Log do pregão</h3>
              <div style={{ maxHeight: 300, overflowY: "auto", fontSize: 12, fontFamily: "monospace" }}>
                {estado.log.slice().reverse().map((l, i) => (
                  <div key={i} style={{ padding: "2px 0", borderBottom: "1px dashed #334155" }}>{l}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações + Chat */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: 12, background: "#1e293b", borderRadius: 8 }}>
              <h3>🎮 Suas ações</h3>
              {botoesEtapa()}
              {erro && <p style={{ color: "#ef4444", marginTop: 8 }}>Erro: {erro}</p>}
            </div>

            <div style={{ padding: 12, background: "#1e293b", borderRadius: 8 }}>
              <h3>💬 Chat com Pregoeiro</h3>
              <div style={{ maxHeight: 200, overflowY: "auto", fontSize: 13, marginBottom: 8 }}>
                {estado.instrucoes_pregoeiro.length === 0 && <p style={{ color: "#94a3b8" }}>Sem mensagens. Diga algo ao pregoeiro abaixo.</p>}
                {estado.instrucoes_pregoeiro.map((m, i) => (
                  <div key={i} style={{ padding: "4px 8px", margin: "4px 0", borderRadius: 4,
                    background: m.de === "operador" ? "#1e3a8a" : "#3f3f46",
                    textAlign: m.de === "operador" ? "right" : "left" }}>
                    <strong>{m.de === "operador" ? "Você" : "Pregoeiro"}:</strong> {m.msg}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && enviarChat()}
                  placeholder='Ex: "encerre a rodada agora" ou "peça desconto"'
                  style={{ flex: 1, padding: 8 }} />
                <button onClick={enviarChat}>Enviar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
