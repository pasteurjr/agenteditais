---
uc_id: UC-LA05
nome: "Deteccao Automatica de Abertura de Sessao (EXPANSAO — MonitoriaPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 601
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-LA05 — Deteccao Automatica de Abertura de Sessao (EXPANSAO — MonitoriaPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 601).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO da pagina existente `MonitoriaPage.tsx`
**UCs estendidos:** UC-MO02 (Sprint 6 — Criar Monitoramento PNCP via IA). Este UC ADICIONA um **subtipo especializado** de monitoramento: tipo=`sessao_pregao`. NAO cria sistema de monitoramento paralelo — reutiliza toda a infraestrutura de UC-MO02 (model, endpoints, dashboard, eventos) e apenas adiciona: (a) tipo especifico `sessao_pregao` com polling de alta frequencia (60s vs padrao), (b) auto-ativacao da sala virtual ao detectar abertura, (c) notificacao push dedicada. O ciclo de vida do monitoramento (criar, pausar, ativar, excluir) segue o mesmo workflow de UC-MO02.
**O que JA EXISTE:** MonitoriaPage com dashboard de monitoramentos ativos, criacao de monitoramento via chatbox, eventos capturados, tratamento de erros. Endpoints de monitoria. Arquivo: `frontend/src/pages/MonitoriaPage.tsx`.

**RNs aplicadas:** RN-037 (audit), RN-NEW-19 (polling 60s no dia agendado)

**RF relacionado:** RF-042-03 (Deteccao de Abertura de Sessao)
**Ator:** Sistema (automatico) + Usuario (recebe notificacao)

### Pre-condicoes
1. Edital salvo com data de sessao de pregao conhecida
2. Sistema de monitoria ativo (Sprint 6)
3. Sistema de alertas ativo (Sprint 6)

### Pos-condicoes
1. Monitoramento de sessao criado e ativo
2. Abertura de sessao detectada com notificacao enviada
3. Sala virtual ativada automaticamente (link direto)

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage (`/app/monitoria`)
2. **NOVO:** No dashboard de monitoramentos, [Botao: "Monitorar Sessao de Pregao"] (ao lado do botao existente "Criar Monitoramento")
3. Ao clicar: [Modal: "Configurar Monitoramento de Sessao"] exibe:
   - [Select: "Edital"] — lista editais salvos com data_sessao futura
   - [DatePicker: "Data da Sessao"] — pre-preenchido do edital
   - [TimeInput: "Hora da Sessao"] — pre-preenchido se disponivel
   - [Select: "Portal"] — PNCP (default) / ComprasNet / BEC / Outro (manual)
   - [Checkbox: "Ativar sala virtual automaticamente"] (default: true)
   - [Checkbox: "Notificar por email"] (default: true)
4. [Botao: "Ativar Monitoramento"] cria monitoramento com tipo `sessao_pregao`
5. No dia da sessao, sistema inicia polling de alta frequencia (a cada 60s, RN-NEW-19):
   - Consulta API PNCP para verificar se sessao foi aberta
   - Status detectados: `nao_aberta`, `aberta`, `em_andamento`, `suspensa`, `encerrada`
6. Ao detectar `aberta` ou `em_andamento`:
   - Cria alerta visual no sistema (badge piscante na sidebar: "Pregao em Andamento")
   - Envia email ao usuario (se configurado)
   - Se checkbox "Ativar sala virtual" marcada: abre notificacao push com [Link: "Entrar na Sala Virtual"]
   - Grava evento no log de monitoramento (UC-MO05, Sprint 6)
7. Na listagem de monitoramentos, monitoramentos tipo `sessao_pregao` exibem:
   - [Badge: "Sessao"] diferenciando de monitoramentos PNCP regulares
   - Status: Aguardando / Sessao Aberta / Em Disputa / Encerrada
   - Countdown: "Faltam Xh Xmin para a sessao"

### Tela(s) Representativa(s)

**Pagina:** MonitoriaPage (`/app/monitoria`)
**Posicao:** Dashboard de monitoramentos (expandido)

#### Layout — Modal de Configuracao

```
+--- Monitorar Sessao de Pregao ---+
| Edital: [PE 023/2026 v]          |
| Data: [15/05/2026]               |
| Hora: [14:00]                    |
| Portal: [PNCP v]                 |
| [x] Ativar sala virtual auto     |
| [x] Notificar por email          |
|                                   |
| [Ativar Monitoramento] [Cancelar]|
+-----------------------------------+
```

### Excecoes
- **E1:** Portal diferente de PNCP — banner: "Deteccao automatica disponivel apenas para PNCP. Para outros portais, use entrada manual."
- **E2:** API PNCP indisponivel no dia — fallback para polling a cada 5min + alerta ao usuario para verificar manualmente
- **E3:** Sessao adiada/cancelada — monitoramento detecta `suspensa` e notifica usuario

---
