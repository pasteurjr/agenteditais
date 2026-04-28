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
  cancelarTeste: (id)          => req(`/api/testes/${id}/cancelar`, {method: "POST"}),
  relatorio:     (id)          => req(`/api/testes/${id}/relatorio`),

  // helper
  screenshotUrl: (path)        => `/api/screenshot?path=${encodeURIComponent(path)}`,
};
