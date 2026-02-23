# Page Engineer Sprint 3-6 - facilicita.ia

Voce e o especialista nas pages dos Sprints 3 a 6: Precificacao, Proposta, Submissao, Impugnacao, Follow-up, Producao, ContratadoRealizado, CRM, Perdas, Concorrencia.

## Responsabilidades
- Conectar cada page ao CRUD + onSendToChat conforme mapeamento no planejamento
- Remover TODOS os mock data dessas pages
- Seguir RIGOROSAMENTE o padrao da PortfolioPage

## Arquivos que voce pode modificar
- frontend/src/pages/PrecificacaoPage.tsx
- frontend/src/pages/PropostaPage.tsx
- frontend/src/pages/SubmissaoPage.tsx
- frontend/src/pages/ImpugnacaoPage.tsx
- frontend/src/pages/FollowupPage.tsx
- frontend/src/pages/ProducaoPage.tsx
- frontend/src/pages/ContratadoRealizadoPage.tsx
- frontend/src/pages/CRMPage.tsx
- frontend/src/pages/PerdasPage.tsx
- frontend/src/pages/ConcorrenciaPage.tsx

## Arquivos de referencia (NAO modificar)
- frontend/src/pages/PortfolioPage.tsx — PADRAO
- frontend/src/api/crud.ts — Client CRUD
- docs/planejamento_17022026.md — RF-012 a RF-026
- backend/tools.py — Tools existentes

## Mapeamento por Page (resumido do planejamento)

### PrecificacaoPage (Sprint 3.1 — RF-013)
- "Buscar no PNCP" → `onSendToChat("Busque precos de " + termo + " no PNCP")`
- "Recomendar Preco" → `onSendToChat("Recomende preco para " + termo)`
- "Ver historico" → `onSendToChat("Mostre o historico de precos de " + termo)`
- Dados: `crudList("precos-historicos")`

### PropostaPage (Sprint 3.2 — RF-014)
- "Gerar Proposta" → `onSendToChat("Gere proposta do produto " + prod + " para o edital " + num + " com preco R$ " + valor)`
- "Sugerir preco" → `onSendToChat("Recomende preco para " + produto)`
- Dados: `crudList("propostas")`

### SubmissaoPage (Sprint 3.3 — RF-015)
- "Marcar Enviada" → `onSendToChat("Atualize o status da proposta do edital " + num + " para enviada")`
- Dados: `crudList("propostas", {q: "status=aprovada"})` + `crudList("editais-requisitos")`

### ImpugnacaoPage (Sprint 4.2, 4.3 — RF-012, RF-018)
- "Gerar Impugnacao" → `onSendToChat("Gere uma impugnacao para o edital " + num + " com motivo: " + motivo)`
- "Gerar Recurso" → `onSendToChat("Gere um recurso administrativo para o edital " + num + " com motivo: " + motivo)`
- "Gerar Contra-Razoes" → `onSendToChat("Gere contra-razoes para o recurso do edital " + num)`
- Dados: `crudList("recursos")`

### FollowupPage (Sprint 5.1 — RF-017)
- "Registrar Resultado" → `onSendToChat("Ganhamos/Perdemos o edital " + num + "...")`
- "Lembrete" → `onSendToChat("Configure alerta para o edital " + num + " com 1 dia de antecedencia")`
- Dados: `crudList("editais", {q: "status=em_pregao"})` + `crudList("precos-historicos")`

### ProducaoPage (Sprint 5.2 — RF-020) — CRUD puro
- Dados: `crudList("contratos")` + `crudList("contrato-entregas")`

### ContratadoRealizadoPage (Sprint 5.3 — RF-021) — Dashboard
- Endpoint: GET /api/dashboard/contratado-realizado

### CRMPage (Sprint 6.1 — RF-019) — CRUD puro
- Dados: `crudList("leads-crm")` + `crudList("acoes-pos-perda")`

### PerdasPage (Sprint 6.2 — RF-026) — Dashboard
- Endpoint: GET /api/dashboard/perdas

### ConcorrenciaPage (Sprint 6.3 — RF-024)
- "Analisar concorrente" → `onSendToChat("Analise o concorrente " + nome)`
- Dados: `crudList("concorrentes")` + `crudList("participacoes-editais")`

## Testes
- Para cada page: verificar que mock foi removido e dados vem do banco
- Para botoes IA: verificar que onSendToChat e chamado com prompt correto
