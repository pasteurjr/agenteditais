const BASE = "";
function headers() {
  const token = localStorage.getItem("editais_ia_access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// UC-LA01 — Simulação determinística
export async function simularLanceDeterministico(params: {
  edital_item_produto_id: string;
  num_rodadas?: number;
  tipo_decremento?: string;
  valor_decremento?: number;
  num_concorrentes?: number;
  perfil?: string;
}) {
  const res = await fetch(`${BASE}/api/precificacao/simular-lance`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return res.json();
}

// UC-LA03 — Sala Virtual
export async function criarSessaoPregao(params: {
  edital_id: string;
  modalidade?: string;
  autonomia?: string;
  timer_aberto_seg?: number;
  timer_fechado_seg?: number;
  alarme_custo?: boolean;
  alarme_minimo?: boolean;
  max_lances_automaticos?: number;
}) {
  const res = await fetch(`${BASE}/api/sala/criar`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function getEstadoSala(sessaoId: string) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/estado`, {
    headers: headers(),
  });
  return res.json();
}

export async function enviarLance(sessaoId: string, valor: number) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/lance`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ valor }),
  });
  return res.json();
}

export async function enviarLanceFechado(sessaoId: string, valor: number) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/lance-fechado`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ valor }),
  });
  return res.json();
}

// UC-LA02 — Sugestão IA
export async function sugerirLance(sessaoId: string, params: {
  lance_lider: number;
  nosso_ultimo: number;
  decremento_medio?: number;
}) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/sugerir-lance`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function encerrarSessao(sessaoId: string, params: {
  resultado?: string;
  posicao_final?: number;
}) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/encerrar`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return res.json();
}

// UC-LA06 — Robô
export async function ativarRobo(sessaoId: string, params: {
  modo_decremento?: string;
  valor_decremento?: number;
  confirmar_cada?: boolean;
  max_lances?: number;
}) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/robo/ativar`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function desativarRobo(sessaoId: string) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/robo/desativar`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}

export async function pausarRobo(sessaoId: string) {
  const res = await fetch(`${BASE}/api/sala/${sessaoId}/robo/pausar`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}

// UC-LA05 — Monitoramento sessão
export async function criarMonitoramentoSessao(params: {
  edital_id: string;
  termo?: string;
  notificar_email?: boolean;
}) {
  const res = await fetch(`${BASE}/api/monitoramentos/sessao-pregao`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  return res.json();
}

// UC-SC01 — Score Competitividade
export async function getScoreCompetitividade(editalId: string) {
  const res = await fetch(`${BASE}/api/score/competitividade/${editalId}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-SC02 — Qualidade Concorrente
export async function getQualidadeConcorrente(concorrenteId: string) {
  const res = await fetch(`${BASE}/api/concorrentes/${concorrenteId}/qualidade`, {
    headers: headers(),
  });
  return res.json();
}

export async function getQualidadeOrgao(orgao: string) {
  const res = await fetch(`${BASE}/api/analytics/qualidade-orgao/${encodeURIComponent(orgao)}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-SC03 — Score Recurso
export async function getScoreRecurso(editalId: string) {
  const res = await fetch(`${BASE}/api/recursos/${editalId}/score`, {
    headers: headers(),
  });
  return res.json();
}

// UC-SC04 — Tempo Empenho
export async function getTempoEmpenho() {
  const res = await fetch(`${BASE}/api/analytics/tempo-empenho`, {
    headers: headers(),
  });
  return res.json();
}

// UC-SC05 — DRE
export async function getDREContrato(contratoId: string) {
  const res = await fetch(`${BASE}/api/contratos/${contratoId}/dre`, {
    headers: headers(),
  });
  return res.json();
}

export async function simularDRE(editalId: string) {
  const res = await fetch(`${BASE}/api/precificacao/${editalId}/simular-dre`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}

// UC-HC01 — Health Check
export async function getHealthCheck() {
  const res = await fetch(`${BASE}/api/health`);
  return res.json();
}
