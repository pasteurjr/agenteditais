const BASE = "";
function headers() {
  const token = localStorage.getItem("editais_ia_access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function consultarAuditoriaSensiveis(params: {
  periodo_dias?: number;
}) {
  const qs = params.periodo_dias ? `?periodo_dias=${params.periodo_dias}` : "";
  const res = await fetch(`${BASE}/api/crud/auditoria-log${qs}`, {
    headers: headers(),
  });
  return res.json();
}

export async function exportarAuditoriaCompliance(params: {
  inicio: string;
  fim: string;
  mascarar_pii?: boolean;
}) {
  const qs = `?inicio=${params.inicio}&fim=${params.fim}&mascarar_pii=${params.mascarar_pii ?? true}`;
  const res = await fetch(`${BASE}/api/crud/auditoria-log/export${qs}`, {
    headers: headers(),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria_${params.inicio}_${params.fim}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function testarSMTP(destinatario: string) {
  const res = await fetch(`${BASE}/api/smtp/testar`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ destinatario_teste: destinatario }),
  });
  return res.json();
}

export async function reenviarEmailFila(queueId: string) {
  const res = await fetch(`${BASE}/api/smtp/fila/reenviar/${queueId}`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}

export async function executarMonitoramento(monId: string) {
  const res = await fetch(`${BASE}/api/monitoramentos/${monId}/executar`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}
