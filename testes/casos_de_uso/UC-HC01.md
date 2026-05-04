---
uc_id: UC-HC01
nome: "Health Check do Sistema"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 1166
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-HC01 — Health Check do Sistema

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 1166).
> Sprint origem: **Sprint 9**.

---

**Tipo:** NOVO — endpoint backend + card opcional de status

**RNs aplicadas:** RN-NEW-20 (nao exige autenticacao), RN-037 (audit)

**RF relacionado:** Infraestrutura / Operacao
**Ator:** Sistema (monitoramento externo) + Usuario (administrador)

### Pre-condicoes
1. Aplicacao backend rodando
2. Servicos configurados (DB, PNCP, Brave, DeepSeek, SMTP)

### Pos-condicoes
1. Endpoint `/api/health` retorna status de todos os servicos
2. Status global calculado (healthy/degraded/unhealthy)

### Sequencia de Eventos

1. Sistema externo (UptimeRobot, Zabbix, etc.) ou usuario faz `GET /api/health`
2. Endpoint executa verificacao de cada servico:
   - **database:** tenta `SELECT 1` no MySQL, mede latencia
   - **cache:** tenta ping no Redis (se configurado)
   - **pncp:** faz request leve ao PNCP, verifica resposta 200
   - **brave:** faz request leve ao Brave Search, verifica resposta 200
   - **deepseek:** verifica API key valida e credito > 0
   - **smtp:** tenta EHLO no servidor SMTP (Sprint 6)
   - **scheduler:** verifica se scheduler de alertas/monitoria esta ativo
3. Cada servico retorna:
   - `status`: "healthy" / "degraded" / "unhealthy"
   - `latency_ms`: tempo de resposta em ms
   - `message`: detalhes (ex.: "Connection refused", "Timeout after 5s")
   - `last_check`: timestamp ISO
4. Status global calculado:
   - `healthy`: todos os servicos healthy
   - `degraded`: pelo menos 1 servico degraded/unhealthy, mas database healthy
   - `unhealthy`: database unhealthy OU >= 3 servicos unhealthy
5. Retorno JSON (nao exige autenticacao, RN-NEW-20):
   ```json
   {
     "status": "degraded",
     "timestamp": "2026-05-10T14:23:15Z",
     "services": {
       "database": {"status": "healthy", "latency_ms": 2},
       "cache": {"status": "unhealthy", "message": "Connection refused"},
       "pncp": {"status": "healthy", "latency_ms": 340},
       "brave": {"status": "healthy", "latency_ms": 180},
       "deepseek": {"status": "healthy", "latency_ms": 520},
       "smtp": {"status": "healthy", "latency_ms": 45},
       "scheduler": {"status": "healthy"}
     },
     "version": "9.0.0",
     "uptime_seconds": 345600
   }
   ```
6. HTTP status code:
   - 200: healthy
   - 200 com body degraded: degraded (para nao disparar alertas de monitoramento em servicos nao criticos)
   - 503: unhealthy

### Tela(s) Representativa(s)

Nao ha pagina dedicada. Endpoint apenas. Opcionalmente, card de status pode ser adicionado a uma pagina de administracao futura.

#### Formato de Resposta

```
GET /api/health

HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "timestamp": "2026-05-10T14:23:15Z",
  "services": { ... },
  "version": "9.0.0",
  "uptime_seconds": 345600
}
```

### Excecoes
- **E1:** Database unreachable — retorna 503 com `{"status": "unhealthy", "services": {"database": {"status": "unhealthy"}}}`
- **E2:** Check timeout (> 10s por servico) — servico marcado como "degraded" com message "Timeout"
- **E3:** Credito DeepSeek zerado — deepseek marcado como "degraded" com message "No credits remaining"

---

## NOTA SOBRE QA END-TO-END

O QA end-to-end nao e um Caso de Uso funcional — e uma entrega de engenharia que inclui:

1. **Auditoria de toda a suite Playwright** — revisao de specs das Sprints 1-8 (400+ testes)
2. **Resolucao de testes flaky** — timeouts, selectors frageis, dependencias de dados
3. **Suite de regressao Sprint 9** — novos specs para lances, sala virtual, scores, DRE, health
4. **Documentacao operacional:**
   - Guia de deploy em producao
   - Configuracao de variaveis de ambiente
   - Procedimento de backup e restore
   - Runbook de operacoes

Esta entrega sera documentada em relatrio tecnico separado, nao como UC.
