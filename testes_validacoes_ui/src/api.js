// Wrapper de fetch — sempre envia credentials (cookies de sessao Flask)
const BASE = ""; // proxy do Vite redireciona /api -> :5060

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error(body.error || body.message || res.statusText);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  // auth
  me:       ()                => req("/api/me"),
  login:    (email, senha)    => req("/api/login", {method: "POST", body: JSON.stringify({email, senha})}),
  logout:   ()                => req("/api/logout", {method: "POST"}),

  // catalogo
  projetos: ()                => req("/api/projetos"),
  sprints:  (pid)             => req(`/api/projetos/${pid}/sprints`),
  sprintUcs:(sid, params={})  => {
    const q = new URLSearchParams(params).toString();
    return req(`/api/sprints/${sid}/ucs${q ? "?" + q : ""}`);
  },
  sprintUcsResumo:(sid)        => req(`/api/sprints/${sid}/ucs-resumo`),

  // testes
  testes:        (params={})   => {
    const q = new URLSearchParams(params).toString();
    return req(`/api/testes${q ? "?" + q : ""}`);
  },
  testeDetalhe:  (id)          => req(`/api/testes/${id}`),
  criarTeste:    (data)        => req("/api/testes", {method: "POST", body: JSON.stringify(data)}),
  iniciarTeste:  (id)          => req(`/api/testes/${id}/iniciar`, {method: "POST"}),
  pausarTeste:   (id)          => req(`/api/testes/${id}/pausar`, {method: "POST"}),
  retomarTeste:  (id)          => req(`/api/testes/${id}/retomar`, {method: "POST"}),
  reiniciarTeste:(id)          => req(`/api/testes/${id}/reiniciar`, {method: "POST"}),
  cancelarTeste: (id)          => req(`/api/testes/${id}/cancelar`, {method: "POST"}),
  adicionarUcs:  (id, uc_ids)  => req(`/api/testes/${id}/adicionar-ucs`, {method: "POST", body: JSON.stringify({uc_ids})}),
  testeRuns:     (id)          => req(`/api/testes/${id}/runs`),
  testeCiclo:    (id, runId)   => req(`/api/testes/${id}/ciclo${runId ? `?run_id=${runId}` : ''}`),
  relatorio:     (id, runId)   => req(`/api/testes/${id}/relatorio${runId ? `?run_id=${runId}` : ''}`),
  runRelatorio:  (runId)       => req(`/api/runs/${runId}/relatorio`),
  relatorioMdUrl:    (id)       => `/api/testes/${id}/relatorio.md`,
  relatorioPdfUrl:   (id)       => `/api/testes/${id}/relatorio.pdf`,
  relatorioDocxUrl:  (id)       => `/api/testes/${id}/relatorio.docx`,
  runRelatorioMdUrl:   (runId)  => `/api/runs/${runId}/relatorio.md`,
  runRelatorioPdfUrl:  (runId)  => `/api/runs/${runId}/relatorio.pdf`,
  runRelatorioDocxUrl: (runId)  => `/api/runs/${runId}/relatorio.docx`,

  // helper
  screenshotUrl: (path)        => `/api/screenshot?path=${encodeURIComponent(path)}`,

  // configuracoes — pasta de documentos sintetizados
  getPastaDocumentos:    ()        => req("/api/configuracoes/pasta-documentos"),
  setPastaDocumentos:    (pasta)   => req("/api/configuracoes/pasta-documentos", {method: "POST", body: JSON.stringify({pasta})}),
  validarPastaDocumentos:(pasta)   => req("/api/configuracoes/pasta-documentos/validar", {method: "POST", body: JSON.stringify({pasta})}),
  zipDocumentosUrl:      ()        => "/api/documentos-sintetizados.zip",
};
