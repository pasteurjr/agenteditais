# Plano Sprint 6 — CRM + Perdas + Concorrência

> ⚠️ **DOCUMENTO HISTÓRICO — NÃO USAR COMO REFERÊNCIA ATIVA**
>
> Este plano foi elaborado em 28/03/2026 antes da execução efetiva da Sprint 5. Na execução real, a Sprint 5 absorveu o escopo originalmente previsto para a Sprint 6 (CRM + Perdas + Concorrência), totalizando 26 UCs entregues (UC-FU01..03, UC-AT01..03, UC-CT01..10, UC-CR01..03, UC-CRM01..07).
>
> O escopo **real** da Sprint 6 v4 está documentado em:
> - `docs/SPRINT 6-VI.md` — descritivo no estilo SPRINT 5 - VF.docx (Flags + Monitoria + Auditoria + SMTP)
> - `docs/planejamento_editaisv4.md` — planejamento consolidado com renumeração (9 sprints)
>
> O arquivo abaixo é mantido apenas para rastreabilidade histórica do planejamento original.
>
> ---

## Contexto

Sprint 6 entrega o ciclo pós-venda: CRM ativo com pipeline de leads, análise de perdas com dashboard, e inteligência competitiva via IA. É a última sprint da Onda 3.

Sprints 1-5 já concluídas. A Sprint 6 tem **5 entregas** (T30-T34) e **3 RFs** (RF-019, RF-024, RF-026).

**Diferença vs Sprint 5:** Aqui a infraestrutura backend já existe em grande parte — os modelos LeadCRM e Concorrente existem, as tools `tool_listar_concorrentes` e `tool_analisar_concorrente` existem, e os CRUDs `leads-crm` e `concorrentes` estão registrados. O trabalho é principalmente **reescrever 3 páginas frontend** e **criar 2 endpoints + 1 tool novos**.

---

## O que já existe

| Item | Status | Localização |
|------|--------|-------------|
| LeadCRM model | ✅ Existe | models.py:2010 |
| Concorrente model | ✅ Existe | models.py |
| CRUD leads-crm | ✅ Registrado | crud_routes.py:391 |
| CRUD concorrentes | ✅ Registrado | crud_routes.py:297 |
| tool_listar_concorrentes | ✅ Existe | tools.py:6424 |
| tool_analisar_concorrente | ✅ Existe | tools.py:6473 |
| CRMPage.tsx (mock) | ⚠️ Mock 343L | Reescrever com API real |
| PerdasPage.tsx (mock) | ⚠️ Mock 186L | Reescrever com API real |
| ConcorrenciaPage.tsx (mock) | ⚠️ Mock 203L | Reescrever com API real |
| Endpoint /api/dashboard/perdas | ❌ Não existe | Criar |
| Lead auto-criado em derrota | ❌ Parcial | tool_registrar_resultado_api existe mas não cria lead |

---

## Fluxo de Trabalho — 3 Ondas

### Onda 1 — Backend (1 agente, ~30min)
Arquivo: `backend/app.py` + `backend/tools.py`

| Task | Descrição |
|------|-----------|
| T30 | **Endpoint `GET /api/dashboard/perdas`** — Query editais com status='perdido', agrupa por motivo, calcula valores, lista concorrentes vencedores, tendência por período |
| T31 | **Tool `tool_dashboard_perdas`** — Lógica de agregação: motivos (preço/técnico/documental/recurso/ME-EPP/outro), top concorrentes, valores por mês, taxa de perda |
| T32 | **Fix `tool_registrar_resultado_api`** — Ao registrar derrota, criar LeadCRM automaticamente com orgao, edital_id, status='novo', origem='derrota_licitacao' |

### Onda 2 — Frontend (3 agentes paralelos, cada um modifica arquivo diferente)

| Agente | Arquivo | Tasks |
|--------|---------|-------|
| **sprint6-crm** | `CRMPage.tsx` | T33: Rewrite com API real — CRUD leads via `/api/crud/leads-crm`, pipeline visual (novo→contatado→qualificado→proposta→ganho/perdido), registrar interações, stats cards |
| **sprint6-perdas** | `PerdasPage.tsx` | T34: Rewrite com API real — Dashboard de perdas via `GET /api/dashboard/perdas`, gráfico de motivos (barras), top concorrentes, valores perdidos por período, filtros |
| **sprint6-concorrencia** | `ConcorrenciaPage.tsx` | T35: Rewrite com API real — Listar concorrentes via `/api/crud/concorrentes`, botão "Analisar" via `onSendToChat`, perfil do concorrente com histórico de preços |

### Onda 3 — Validação Playwright + Relatório

| Agente | Arquivos | Tasks |
|--------|----------|-------|
| **sprint6-validacao** | `tests/validacao_sprint6.spec.ts`, `tests/validacao_sprint6_complementar.spec.ts`, `testes/sprint6/ACEITACAOVALIDACAOSPRINT6.md` | T36-T37: Testes E2E + screenshots + relatório |

---

## Documentos a Gerar (mesmo padrão Sprint 5)

Antes de implementar, gerar 3 documentos:

1. **`docs/SPRINT6.md`** — Briefing da sprint com contexto, escopo, entregas, requisitos
2. **`docs/CASOS DE USO SPRINT6.md`** — Casos de uso detalhados com telas ASCII, ações ator/sistema, pré/pós-condições
3. **`docs/requisitos_completosv7.md`** — Atualizar requisitos com RFs da Sprint 6 (CRM, Perdas, Concorrência)

---

## Endpoints a Criar (2)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/perdas` | Dashboard de perdas com motivos, concorrentes, valores, tendências |
| GET | `/api/crm/pipeline` | Stats do pipeline CRM (leads por status, valor total, conversão) |

---

## Tools a Criar (1)

| Tool | Descrição |
|------|-----------|
| `tool_dashboard_perdas` | Agrega dados de editais perdidos: motivos, concorrentes vencedores, valores por período |

---

## Frontend — Páginas a Reescrever (3)

### CRMPage.tsx (343L → ~400L)
- Remover mock data
- Fetch: `/api/crud/leads-crm` + `/api/crm/pipeline`
- Stats cards: Total Leads, Novos, Contatados, Taxa Conversão
- Pipeline visual: colunas por status com cards
- Tabela de leads com filtros
- Modal: registrar interação (ligação, email, reunião, visita)

### PerdasPage.tsx (186L → ~350L)
- Remover mock data
- Fetch: `GET /api/dashboard/perdas`
- Stats: Total Perdas, Valor Perdido, Motivo Principal, Top Concorrente
- Gráfico de motivos (barras horizontais com %)
- Tabela: Edital, Órgão, Valor Proposto, Valor Vencedor, Diferença, Motivo, Vencedor
- Filtros: período, motivo

### ConcorrenciaPage.tsx (203L → ~350L)
- Remover mock data
- Fetch: `/api/crud/concorrentes`
- Stats: Total Concorrentes, Mais Frequente, Taxa Sucesso Média
- Tabela: Nome, CNPJ, Vitórias, Derrotas, Taxa Sucesso, Última Atuação
- Botão "Analisar" → `onSendToChat("analise o concorrente {nome}")`
- Detalhe: perfil do concorrente com histórico (expandir row)

---

## Testes Estimados

| Teste | UC | Descrição |
|-------|-----|-----------|
| TC-01 | CRM | Página CRM carrega com stats e tabela de leads |
| TC-02 | CRM | Pipeline visual por status |
| TC-03 | Perdas | Dashboard de perdas com motivos e concorrentes |
| TC-04 | Perdas | Filtros de período funcionam |
| TC-05 | Concorrência | Tabela de concorrentes com dados reais |
| TC-06 | Concorrência | Botão Analisar concorrente |
| TC-07 | API | Endpoint /api/dashboard/perdas retorna estrutura |
| TC-08 | API | Endpoint /api/crm/pipeline retorna stats |
| TC-09 | Integração | Registrar derrota cria lead CRM |
| TC-10 | Integração | Lead CRM aparece na CRMPage |

**Total estimado:** 14 principais + 10 complementares = ~24 testes

---

## Arquivos Críticos

| Arquivo | Ação |
|---------|------|
| `backend/app.py` | +2 endpoints (perdas, pipeline CRM) |
| `backend/tools.py` | +1 tool (dashboard_perdas) + fix registrar_resultado_api |
| `frontend/src/pages/CRMPage.tsx` | REWRITE |
| `frontend/src/pages/PerdasPage.tsx` | REWRITE |
| `frontend/src/pages/ConcorrenciaPage.tsx` | REWRITE |
| `tests/validacao_sprint6.spec.ts` | NOVO |
| `tests/validacao_sprint6_complementar.spec.ts` | NOVO |
| `testes/sprint6/ACEITACAOVALIDACAOSPRINT6.md` | NOVO |

---

## Verificação

1. `cd backend && python3 -c "from app import app"` — sem erros
2. `cd frontend && npx tsc --noEmit` — sem erros
3. `npx vite build` — build OK
4. 24 testes Playwright passando
5. Relatório ACEITACAOVALIDACAOSPRINT6.md com screenshots
6. `fuser -k 5007/tcp && fuser -k 5175/tcp` — servidores parados
