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

  // Passo atual — quando terminado, NAO renderiza passo (mostra sumario abaixo)
  if (d.passo_atual && d.estado !== "terminado") {
    const p = d.passo_atual;
    $("passo-titulo").textContent = `[${d.passo_atual_idx + 1}/${d.total_passos}] ${p.titulo}`;
    $("passo-descricao").innerHTML = renderMd(p.descricao_painel || "");
    const olist = $("obs-list");
    olist.innerHTML = (p.pontos_observacao || []).map(o => `<li>${escapeHtml(o)}</li>`).join("") || "<li class='vazio'>(sem observações específicas)</li>";

    $("img-antes").src = p.screenshot_antes || placeholder;
    $("img-depois").src = p.screenshot_depois || placeholder;

    $("veredito-badge").outerHTML = `<span class="veredito ${p.veredito_automatico}" id="veredito-badge" style="font-size: 8pt; padding: 0.1em 0.4em;">${p.veredito_automatico}</span>`;

    // Detalhes da camada automatica
    const det = p.detalhes_validacao || {};
    $("url-atual").textContent = det.url_atual || "—";
    $("camada-decisiva").textContent = det.camada_decisiva || "—";
    let msg = "";
    if (det.acao_erro) msg = `❌ erro de acao: ${det.acao_erro}`;
    else if (det.dom) msg = det.dom.ok ? `✓ ${det.dom.mensagem || "ok"}` : `❌ ${det.dom.mensagem}`;
    else msg = "—";
    $("msg-validacao").innerHTML = escapeHtml(msg);

    const asserts = (det.dom && det.dom.asserts) || [];
    $("asserts-list").innerHTML = asserts.length === 0 ? "<li class='vazio'>(sem asserts DOM)</li>" : asserts.map(a => `
      <li style="padding: 0.2em 0; font-family: monospace; font-size: 8pt;">
        ${a.ok ? '✅' : '❌'} <code>${escapeHtml(a.selector)}</code>
        — ${escapeHtml(a.info || '')} ${a.count !== undefined ? `(count=${a.count})` : ''}
      </li>`).join("");

    // Veredicto do PO (aprovar/reprovar)
    const vp = p.veredicto_po;
    const pill = $("veredicto-po-pill");
    if (vp === "APROVADO") {
      pill.className = "veredito APROVADO";
      pill.textContent = "✅ APROVADO";
    } else if (vp === "REPROVADO") {
      pill.className = "veredito REPROVADO";
      pill.textContent = "❌ REPROVADO";
    } else {
      pill.className = "veredito PENDENTE";
      pill.textContent = "não decidido";
    }
    $("btn-aprovar").classList.toggle("ativo", vp === "APROVADO");
    $("btn-reprovar").classList.toggle("ativo", vp === "REPROVADO");

    // Continuar só habilita se pausado E veredicto marcado
    $("btn-continuar").disabled = !(d.estado === "pausado" && vp);
    $("btn-aprovar").disabled = (d.estado !== "pausado");
    $("btn-reprovar").disabled = (d.estado !== "pausado");
  } else {
    if (d.estado === "terminado") {
      // Sumario de conclusao com tela verde celebratoria
      const total = (d.resultados || []).length;
      const aprovados = (d.resultados || []).filter(r => r.veredicto_po === "APROVADO").length;
      const reprovados = (d.resultados || []).filter(r => r.veredicto_po === "REPROVADO").length;
      const inconclusivos = (d.resultados || []).filter(r => !r.veredicto_po).length;
      $("passo-titulo").innerHTML = "🎉 Teste concluído!";
      $("passo-descricao").innerHTML = `
        <div style="background: rgba(76,175,80,0.15); border: 2px solid #4caf50; border-radius: 8px; padding: 1.5em; text-align: center;">
          <h2 style="color: #4caf50; margin-top: 0; font-size: 22pt;">✅ ${total} passos executados</h2>
          <div style="font-size: 14pt; margin: 1em 0;">
            <span style="color: #4caf50; margin-right: 1em;">✅ ${aprovados} APROVADOS</span>
            ${reprovados > 0 ? `<span style="color: #f44336; margin-right: 1em;">❌ ${reprovados} REPROVADOS</span>` : ''}
            ${inconclusivos > 0 ? `<span style="color: #ff9800;">⏸ ${inconclusivos} sem decisão</span>` : ''}
          </div>
          <p style="color: #aaa; font-size: 10pt; margin-top: 1.5em;">
            Esta janela permanecerá aberta por 30 segundos para visualização.<br>
            Acesse <strong>http://localhost:5181</strong> para ver o relatório completo.
          </p>
        </div>`;
      // Limpa screenshots e detalhes do passo
      try {
        $("img-antes").src = placeholder;
        $("img-depois").src = placeholder;
        $("url-atual").textContent = "—";
        $("camada-decisiva").textContent = "—";
        $("msg-validacao").innerHTML = "";
        $("asserts-list").innerHTML = "";
        $("veredito-badge").outerHTML = `<span class="veredito APROVADO" id="veredito-badge" style="font-size: 8pt; padding: 0.1em 0.4em;">CONCLUÍDO</span>`;
        // Limpa veredicto-po-pill
        const pill = $("veredicto-po-pill");
        if (pill) { pill.className = "veredito"; pill.textContent = ""; }
      } catch (e) {}
    } else {
      $("passo-titulo").textContent = "Aguardando início…";
      $("passo-descricao").innerHTML = "";
    }
    $("obs-list").innerHTML = "";
    $("btn-continuar").disabled = true;
    $("btn-aprovar").disabled = true;
    $("btn-reprovar").disabled = true;
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

$("btn-aprovar").addEventListener("click", async () => {
  await post("/aprovar");
});

$("btn-reprovar").addEventListener("click", async () => {
  await post("/reprovar");
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
