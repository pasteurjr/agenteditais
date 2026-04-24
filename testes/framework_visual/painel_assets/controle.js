// Painel de controle — polling de estado + ações HTTP

const POLL_MS = 1000;

const $ = (id) => document.getElementById(id);
const placeholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'><rect width='100%' height='100%' fill='%23555'/><text x='50%' y='50%' fill='%23fff' text-anchor='middle' font-family='Arial' font-size='14'>Aguardando captura…</text></svg>";

function badge(v) {
  return `<span class="veredito ${v}">${v}</span>`;
}

function renderEstado(d) {
  $("uc-info").textContent = `${d.uc_id} (${d.variacao})`;
  $("ciclo-info").textContent = `ciclo: ${d.ciclo_id || '—'} | ${d.ambiente}`;
  const pill = $("estado-pill");
  pill.textContent = d.estado;
  pill.className = "estado-pill " + d.estado;

  $("progresso-bar").style.width = (d.progresso_pct || 0) + "%";

  // Passo atual
  if (d.passo_atual) {
    const p = d.passo_atual;
    $("passo-titulo").textContent = `[${d.passo_atual_idx + 1}/${d.total_passos}] ${p.titulo}`;
    $("passo-descricao").innerHTML = renderMd(p.descricao_painel || "");
    const olist = $("obs-list");
    olist.innerHTML = (p.pontos_observacao || []).map(o => `<li>${escapeHtml(o)}</li>`).join("") || "<li class='vazio'>(sem observações específicas)</li>";

    $("img-antes").src = p.screenshot_antes || placeholder;
    $("img-depois").src = p.screenshot_depois || placeholder;

    $("veredito-badge").outerHTML = `<span class="veredito ${p.veredito_automatico}" id="veredito-badge">${p.veredito_automatico}</span>`;

    // Bot dão estado pausado: continuar habilitado; senão desabilitado
    $("btn-continuar").disabled = (d.estado !== "pausado");
  } else {
    $("passo-titulo").textContent = d.estado === "terminado" ? "✅ Tutorial concluído" : "Aguardando início…";
    $("passo-descricao").innerHTML = "";
    $("obs-list").innerHTML = "";
    $("btn-continuar").disabled = true;
  }

  // Histórico (passos já concluídos, exceto o atual)
  const hist = $("historico");
  const concluidos = (d.resultados || []).filter((_, i) => i < d.passo_atual_idx);
  if (concluidos.length === 0) {
    hist.innerHTML = "<div class='vazio'>Nenhum passo concluído ainda.</div>";
  } else {
    hist.innerHTML = concluidos.map((r, i) => `
      <div class="historico-item">
        <span class="id">${i + 1}. ${r.passo_id}</span>
        — ${badge(r.veredito_automatico)}
        ${r.correcao_necessaria ? '<span style="color:#ff9800">⚠️ correção</span>' : ''}
        ${r.comentarios_po && r.comentarios_po.length > 0 ?
          `<div class="comentarios">💬 ${r.comentarios_po.map(escapeHtml).join(' | ')}</div>` : ''}
      </div>`).join("");
  }
}

function renderMd(md) {
  // Renderização Markdown bem básica (sem dependência externa)
  return escapeHtml(md)
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[m]));
}

async function poll() {
  try {
    const r = await fetch("/estado");
    const d = await r.json();
    renderEstado(d);
  } catch (e) {
    console.error("poll falhou:", e);
  }
}

async function post(path, body) {
  const r = await fetch(path, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body || {})
  });
  return r.json();
}

$("btn-continuar").addEventListener("click", async () => {
  await post("/continuar");
});

$("btn-parar").addEventListener("click", async () => {
  if (confirm("Parar a execução agora?")) await post("/parar");
});

$("btn-reiniciar").addEventListener("click", async () => {
  if (confirm("Reiniciar do primeiro passo? Histórico será preservado.")) await post("/reiniciar");
});

$("btn-correcao").addEventListener("click", async () => {
  const desc = prompt("Descreva o problema observado:");
  if (desc !== null) await post("/correcao", {descricao: desc});
});

$("btn-salvar-comentario").addEventListener("click", async () => {
  const ta = $("comentario-input");
  const txt = ta.value.trim();
  if (!txt) return;
  const r = await post("/comentario", {texto: txt});
  if (r.ok) {
    ta.value = "";
    alert("Comentário salvo.");
  }
});

setInterval(poll, POLL_MS);
poll();
