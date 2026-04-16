const BASE = "";
function headers() {
  const token = localStorage.getItem("editais_ia_access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// UC-ME01 — TAM/SAM/SOM
export async function fetchTamSamSom(params?: {
  segmento?: string;
  periodo_meses?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.segmento) qs.set("segmento", params.segmento);
  if (params?.periodo_meses) qs.set("periodo_meses", String(params.periodo_meses));
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/mercado/tam-sam-som${q}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-ME02 — Mapa SAM (expand)
export async function fetchMapaSAM(params?: {
  segmento?: string;
  metrica?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.segmento) qs.set("segmento", params.segmento);
  if (params?.metrica) qs.set("metrica", params.metrica);
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/crm/mapa${q}`, { headers: headers() });
  return res.json();
}

// UC-ME03 — Share
export async function fetchMercadoShare(params?: {
  segmento?: string;
  uf?: string;
  periodo_dias?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.segmento) qs.set("segmento", params.segmento);
  if (params?.uf) qs.set("uf", params.uf);
  if (params?.periodo_dias) qs.set("periodo_dias", String(params.periodo_dias));
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/mercado/share${q}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-ME04 — Intrusos
export async function fetchIntrusos(params?: {
  criticidade?: string;
  periodo_dias?: number;
  busca?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.criticidade) qs.set("criticidade", params.criticidade);
  if (params?.periodo_dias) qs.set("periodo_dias", String(params.periodo_dias));
  if (params?.busca) qs.set("busca", params.busca);
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/mercado/intrusos${q}`, {
    headers: headers(),
  });
  return res.json();
}

export async function detectarIntrusos(editalId: string) {
  const res = await fetch(`${BASE}/api/mercado/detectar-intrusos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ edital_id: editalId }),
  });
  return res.json();
}

// UC-AN01 — Funil
export async function fetchAnalyticsFunil(params?: {
  periodo_dias?: number;
  segmento?: string;
  uf?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.periodo_dias) qs.set("periodo_dias", String(params.periodo_dias));
  if (params?.segmento) qs.set("segmento", params.segmento);
  if (params?.uf) qs.set("uf", params.uf);
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/analytics/funil${q}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-AN02 — Conversoes
export async function fetchAnalyticsConversoes(params?: {
  periodo_dias?: number;
  segmento?: string;
  uf?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.periodo_dias) qs.set("periodo_dias", String(params.periodo_dias));
  if (params?.segmento) qs.set("segmento", params.segmento);
  if (params?.uf) qs.set("uf", params.uf);
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/analytics/conversoes${q}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-AN03 — Tempos
export async function fetchAnalyticsTempos(params?: {
  periodo_dias?: number;
}) {
  const qs = params?.periodo_dias
    ? `?periodo_dias=${params.periodo_dias}`
    : "";
  const res = await fetch(`${BASE}/api/dashboard/analytics/tempos${qs}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-AN04 — ROI
export async function fetchAnalyticsROI(params?: {
  periodo_dias?: number;
}) {
  const qs = params?.periodo_dias
    ? `?periodo_dias=${params.periodo_dias}`
    : "";
  const res = await fetch(`${BASE}/api/dashboard/analytics/roi${qs}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-AN05 — Perdas expandido
export async function fetchAnalyticsPerdas(params?: {
  periodo_dias?: number;
  segmento?: string;
  uf?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.periodo_dias) qs.set("periodo_dias", String(params.periodo_dias));
  if (params?.segmento) qs.set("segmento", params.segmento);
  if (params?.uf) qs.set("uf", params.uf);
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/analytics/perdas${q}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-AP01 — Feedbacks
export async function fetchAprendizadoFeedbacks(params?: {
  tipo?: string;
  periodo_dias?: number;
  entidade?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.tipo) qs.set("tipo", params.tipo);
  if (params?.periodo_dias) qs.set("periodo_dias", String(params.periodo_dias));
  if (params?.entidade) qs.set("entidade", params.entidade);
  const q = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${BASE}/api/dashboard/aprendizado/feedbacks${q}`, {
    headers: headers(),
  });
  return res.json();
}

// UC-AP02 — Sugestoes
export async function fetchAprendizadoSugestoes() {
  const res = await fetch(`${BASE}/api/dashboard/aprendizado/sugestoes`, {
    headers: headers(),
  });
  return res.json();
}

export async function aceitarSugestao(id: string) {
  const res = await fetch(
    `${BASE}/api/aprendizado/sugestoes/${id}/aceitar`,
    { method: "POST", headers: headers() }
  );
  return res.json();
}

export async function rejeitarSugestao(id: string, motivo: string) {
  const res = await fetch(
    `${BASE}/api/aprendizado/sugestoes/${id}/rejeitar`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ motivo }),
    }
  );
  return res.json();
}

// UC-AP03 — Padroes
export async function fetchAprendizadoPadroes() {
  const res = await fetch(`${BASE}/api/dashboard/aprendizado/padroes`, {
    headers: headers(),
  });
  return res.json();
}

export async function forcarAnalisePadroes() {
  const res = await fetch(`${BASE}/api/aprendizado/analisar`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}
