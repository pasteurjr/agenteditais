# PLANO: Impacto no código das 64 Regras de Negócio [FALTANTE]

## Contexto

Durante a formalização da Seção 13 de `docs/requisitos_completosv8.md`, 217 RNs foram catalogadas. **153 já estão no código**; **64 estão marcadas como [FALTANTE]** — cláusulas implícitas na Lei 14.133/2021, em RFs, em UCs ou em legislação correlata que ainda não possuem enforcement explícito. O dono do projeto quer saber: **(a)** esse gap impacta muito o código já entregue nas Sprints 1–5? **(b)** o que exatamente precisa mudar?

Resposta curta: **Não é catastrófico.** ~60% das 64 RNs são validadores localizados (1–50 linhas, 1–2 arquivos). ~20% exigem migração + mudança cruzada (matrizes de estado, audit log). **Apenas 4 RNs são GRANDE** (feriados úteis, scheduler, FK 1:N ata-edital) e **2 já estão implementadas** mas não documentadas (RN-040, RN-077). Infraestrutura-chave já existe e pode ser reusada: `AuditoriaLog` model, `APScheduler`, `ParametroScore.margem_minima`, `tool_verificar_completude_produto`.

---

## PARTE 1 — Resumo executivo

### Distribuição dos 64 RNs faltantes por esforço

| Esforço | Definição | Qtd | % |
|---|---|---|---|
| **TRIVIAL** | ≤10 linhas, 1 arquivo, sem migração | 11 | 17% |
| **PEQUENO** | 10–50 linhas, 1–2 arquivos, migração opcional | 37 | 58% |
| **MÉDIO** | 50–200 linhas, 3–5 arquivos, migração obrigatória | 12 | 19% |
| **GRANDE** | >200 linhas ou mudança estrutural/infra | 4 | 6% |

### Distribuição por sprint

| Sprint | RNs faltantes | Já implementados | Críticos (MÉDIO/GRANDE) |
|---|---|---|---|
| **1 — Fundação** | 15 (RN-028..042) | RN-040 (ON DELETE SET NULL) | 3 (034, 036, 037) |
| **2 — Captação** | 11 (RN-077..087) | RN-077 (termo ≥3 chars) | 4 (080, 081, 082, 083) |
| **3 — Precificação** | 13 (RN-120..132) | — | 3 (123, 129, 132) |
| **4 — Impugnação/Recursos** | 10 (RN-155..164) | — | 3 (162, **163**, **164**) |
| **5 — Pós-venda/CRM** | 14 (RN-204..217) | — | 5 (205, 206, 207, **212**, **213**) |

**Dois "bônus"**: RN-040 e RN-077 já estão no código. Basta marcar como presentes em `requisitos_completosv8.md` e na próxima versão das planilhas RN↔UC.

---

## PARTE 2 — Classificação detalhada por categoria

### Categoria A — Validadores localizados (~30 RNs, PEQUENO/TRIVIAL)

Camadas de validação que entram em uma função única ou em um endpoint específico. Baixo risco, zero migração, maior volume.

**Exemplos representativos:**

| RN | Enunciado | Arquivo:linha alvo | LoC |
|---|---|---|---|
| RN-028 | Validar dígito verificador CNPJ no cadastro de empresa | `backend/app.py` endpoint `POST /api/empresas` | ~15 |
| RN-029 | Validar DV CPF de responsável técnico | `backend/app.py` endpoint responsável | ~12 |
| RN-031 | Bloquear participação se certidão vencida | `backend/app.py` gate pré-proposta (Sprint 3) | ~20 |
| RN-035 | NCM deve seguir padrão XXXX.XX.XX | `backend/models.py` validator de `Produto.ncm` | ~8 |
| RN-042 | Email deve passar em regex RFC-5322 simplificado | `backend/app.py` múltiplos endpoints | ~10 |
| RN-078 | Filtro de estado só permite UFs válidas (IBGE) | `backend/app.py` busca PNCP | ~8 |
| RN-084 | Cooldown de 60s entre chamadas DeepSeek por empresa | `backend/app.py` endpoint de chat/analise | ~25 |
| RN-086 | Invalidar score calculado quando pesos mudam | `backend/crud_routes.py` PUT ParametroScore | ~15 |
| RN-121 | Quantidade de volumetria deve ser inteira ≥1 | `backend/app.py` endpoint Camada A | ~6 |
| RN-125 | Primeiro lance > lance mínimo (Camada D > Camada E) | `backend/app.py` endpoint Camada D/E | ~10 |
| RN-155 | Contagem de prazo exclui sábado/domingo (simples) | `backend/app.py` endpoint impugnação | ~30 |
| RN-156 | Prazo de impugnação = 3 dias úteis (Art. 164) | helper `dias_uteis_ate(data)` | ~20 |
| RN-209 | Valor de entrega não pode exceder contrato | `backend/app.py` POST entrega | ~12 |
| RN-214 | Gestor e fiscal devem ter email válido | `backend/app.py` designação | ~10 |

**Impacto:** ~30 RNs × ~15 linhas médias = ~450 linhas espalhadas. Cada uma é um `if … raise ValidationError(...)` ou um regex. Testabilidade alta (unit tests). **Zero migração.**

### Categoria B — Máquinas de estado + gates de transição (6 RNs, MÉDIO, migração obrigatória)

Transições entre estados de entidades precisam ser explícitas e auditáveis. Hoje muitas transições são implícitas (set via PUT sem validação de estado anterior).

| RN | Entidade | Transição que precisa ser aplicada | Arquivos |
|---|---|---|---|
| **RN-034** | `Produto` | `cadastrado → qualificado → ofertado → vencedor/perdedor`. Não permitir pular estados; bloquear back-transitions sem motivo. | `backend/models.py:Produto`, `backend/crud_routes.py`, migração de `Produto.status` para enum |
| **RN-082** | `Edital` | `descoberto → salvo → em_analise → decisao_GO/NO-GO → em_proposta → submetido → vencido/perdido`. | `backend/models.py:Edital`, `backend/app.py` endpoints de status, migração |
| **RN-205** | `Contrato` | `rascunho → vigente → em_renovacao → renovado/encerrado`. Bloquear alteração de vigência após "encerrado". | `backend/models.py:Contrato`, `backend/empenho_routes.py` |
| **RN-114** | `PropostaPrecificacao` | `em_elaboracao → aprovada_internamente → enviada → aceita/recusada`. | `backend/app.py` endpoints propostas |
| **RN-080** | `DecisaoGO_NOGO` | Versionar toda decisão (history, não UPDATE). | Nova tabela `DecisaoGoNoGoHistorico`, migração, endpoint GET history |
| **RN-037** | Audit log universal | Toda mudança de estado gera linha em `AuditoriaLog` com `usuario_id`, `entidade`, `estado_anterior`, `estado_novo`, `timestamp`. | `AuditoriaLog` **já existe** em `backend/models.py:2373`. Precisa wiring transversal. |

**Infraestrutura reusável:** `AuditoriaLog` model existe e nunca foi populado. Wiring = criar helper `log_transicao(entidade, id, de, para, user)` e chamá-lo em cada endpoint de mudança de estado. ~150 linhas centralizadas + ~5 linhas por endpoint × ~15 endpoints = ~225 linhas totais.

**Migração necessária (1 Alembic):**
```sql
ALTER TABLE produto MODIFY status ENUM('cadastrado','qualificado','ofertado','vencedor','perdedor','inativo');
ALTER TABLE edital ADD COLUMN estado_atual VARCHAR(30) DEFAULT 'descoberto';
ALTER TABLE contrato MODIFY status ENUM('rascunho','vigente','em_renovacao','renovado','encerrado');
CREATE TABLE decisao_go_nogo_historico (...);
```

**Risco:** MÉDIO. Dados seed das 2 empresas de validação (CH Hospitalar, RP3X) precisam ser conferidos para não entrarem em estado inválido após a migração. Back-fill obrigatório.

### Categoria C — Auditoria e rastreabilidade (3 RNs, MÉDIO)

| RN | Escopo | Onde |
|---|---|---|
| **RN-036** | Mascarar preço unitário em logs e exports para usuários sem permissão `VER_PRECOS` | Middleware cross-cutting, serializers |
| **RN-037** | Audit log universal (ver Categoria B) | `AuditoriaLog` existente |
| **RN-132** | Logar invocações de ferramentas DeepSeek (tool name, input hash, user, ts) | `backend/tools.py`, ~40 linhas em decorator |

**Reuso:** infraestrutura de audit pode ser 1 decorator `@audited("nome_evento")` aplicado onde necessário.

### Categoria D — Infraestrutura nova (4 RNs, GRANDE)

#### RN-163 — Calendário de feriados (contagem dias úteis real)

Hoje as RNs PEQUENAS 155/156/160 contam "dias úteis" excluindo só sábado/domingo. Para Art. 164 e Art. 165 §1º I da Lei 14.133/2021, a contagem oficial **exclui também feriados nacionais e do ente federativo**.

**Duas opções:**
- **Leve (recomendada):** lib `workalendar` (MIT license) — `BrazilCalendar().add_working_days(data, 3)`. Adiciona 1 dependência em `requirements.txt`. Cobre só feriados federais (basta para MVP).
- **Completa:** tabela `feriado` (uf, municipio, data, tipo). ETL manual via CSV. ~200 linhas + CRUD + tela de gestão.

**Decisão sugerida:** começar com `workalendar` (federal-only) e evoluir sob demanda. **~80 linhas + 1 dependência.**

#### RN-164 — Scheduler para alertas de prazo

Alertas de impugnação/recurso vencendo hoje são calculados **on-demand** (toda consulta à tela recalcula). RN-164 pede job periódico que roda 1×/dia e dispara notificações.

**Infraestrutura existente:** `backend/scheduler.py:17-20` já importa `APScheduler` e está em uso (checar jobs registrados). Basta adicionar um job:
```python
scheduler.add_job(func=checar_prazos_impugnacao, trigger="cron", hour=7)
```
Função `checar_prazos_impugnacao` = ~60 linhas. **~100 linhas total.**

#### RN-212 — Scheduler de contratos vencendo (Sprint 5)

Similar ao RN-164, porém para contratos: checar 30/90 dias antes do término e popular `ContratoAVencer` com tier. Hoje a tela UC-CT09 já existe (cards em 5 tiers) mas cálculo é on-demand.

**Reuso:** mesmo scheduler da RN-164. ~80 linhas (nova função + registro do job).

#### RN-213 — Refactor FK 1:N ata ↔ edital (Sprint 5)

Hoje `AtaPregao` tem relação N:1 com `Edital` (uma ata pertence a um edital). A Lei 14.133/2021 Art. 84 prevê que **uma única ARP pode atender múltiplos editais relacionados** (adesões/caronas). RN-213 pede modelagem 1:N invertida: 1 ata → N editais.

**Mudança estrutural:**
- Criar tabela associativa `ata_edital (ata_id, edital_id, role)` ou transformar `AtaPregao.edital_id` em FK removida + criar `AtaEdital` association model.
- Endpoints de ata precisam aceitar `edital_ids: [...]`.
- UC-AT01/AT02 frontend muda: seletor de múltiplos editais.
- **Migração com back-fill:** toda ata existente (seed) vira 1 linha `(ata_id, edital_original_id, 'principal')`.

**Esforço:** ~250 linhas backend + ~80 linhas frontend + 1 migração. **GRANDE.**

### Categoria E — Já implementadas, apenas documentar (2 RNs, 0 código)

| RN | Estado | Como marcar |
|---|---|---|
| **RN-040** | `ON DELETE SET NULL` já aplicado em `backend/models.py` — produto.categoria_id, certidao.responsavel_id, etc. | Remover `[FALTANTE]`, adicionar `Fonte: models.py:linhas_XXX-YYY` |
| **RN-077** | Termo de busca ≥3 caracteres já validado em `backend/app.py:4942-4943` | Remover `[FALTANTE]`, atualizar Fonte |

**Ação:** edit textual em `docs/requisitos_completosv8.md` Seção 13. Zero código.

---

## PARTE 3 — Arquivos afetados (consolidado)

| Arquivo | RNs que tocam | Tamanho estimado |
|---|---|---|
| `backend/app.py` | ~25 RNs (validadores, gates, endpoints de estado) | ~600 linhas |
| `backend/models.py` | ~8 RNs (enums, validators, FK) | ~150 linhas + migração |
| `backend/tools.py` | RN-132 (audit DeepSeek) | ~40 linhas |
| `backend/crud_routes.py` | RN-034, 082, 086, 205, 114 | ~100 linhas |
| `backend/empenho_routes.py` | RN-205, 206, 207, 208, 210 (Sprint 5) | ~120 linhas |
| `backend/crm_routes.py` | RN-216, 217 (transições CRM) | ~40 linhas |
| `backend/scheduler.py` | RN-164, 212 (jobs novos) | ~160 linhas |
| `backend/helpers/prazos.py` *(novo)* | RN-155, 156, 160, 163 (dias úteis + feriados) | ~100 linhas |
| `backend/helpers/audit.py` *(novo)* | RN-037, 132, 036 (decorators) | ~180 linhas |
| `frontend/src/pages/ProdutosPage.jsx` | RN-034 (UI de transições de estado) | ~30 linhas |
| `frontend/src/pages/EditalDetalhePage.jsx` | RN-082 (UI de estado) | ~30 linhas |
| `frontend/src/pages/ContratoDetalhe.jsx` | RN-205, 206 (gestor≠fiscal) | ~25 linhas |
| `frontend/src/pages/AtaPregao.jsx` | RN-213 (multi-edital selector) | ~80 linhas |
| `docs/requisitos_completosv8.md` | RN-040, 077 (remarcar como presentes) | ~10 linhas |
| **Migração Alembic nova** | RN-034, 082, 205, 208, 210, 213 | 1 arquivo, ~80 linhas SQL |
| `requirements.txt` | `workalendar` (RN-163) | +1 linha |

**Total estimado: ~1800 linhas de backend + ~165 linhas de frontend + 1 migração + 1 dependência.**

---

## PARTE 4 — Ordem de execução recomendada

**Fase 1 — Vitórias rápidas (1–2 dias)**
1. Documentar RN-040 e RN-077 como presentes (10min).
2. Adicionar validadores TRIVIAL e PEQUENO que **não precisam de migração**: DV CNPJ/CPF, regex email, NCM, estado UF, cooldown DeepSeek, quantidade mínima, etc. (~30 RNs, ~450 linhas).
3. Rodar suite Playwright completa para garantir que validadores não quebraram fluxo existente.

**Fase 2 — Máquinas de estado (3–5 dias)**
4. Escrever migração Alembic para enums + estado_atual + histórico de decisão.
5. Implementar helper `log_transicao(...)` + wiring nos endpoints de RN-034, 082, 205, 114.
6. Adicionar UI mínima nas 3 páginas frontend (ProdutosPage, EditalDetalhe, ContratoDetalhe) mostrando "estado atual" + transições válidas.
7. Back-fill dos seeds (CH Hospitalar + RP3X) para estados válidos. Rodar validação de migração em `editaisvalida` antes de `agenteditais`.

**Fase 3 — Auditoria transversal (2 dias)**
8. Criar `backend/helpers/audit.py` com decorator `@audited`.
9. Aplicar em `tools.py` (RN-132), nos endpoints de mudança de estado (RN-037), e no serializer de preços (RN-036).
10. Endpoint GET `/api/auditoria?entidade=XXX&id=YYY` para consulta.

**Fase 4 — Infraestrutura nova (3–4 dias)**
11. Adicionar `workalendar` ao requirements.txt e criar `backend/helpers/prazos.py` com `dias_uteis_ate(...)`. Substituir RN-155/156/160 para usar a versão nova.
12. Registrar jobs `checar_prazos_impugnacao` e `checar_contratos_vencendo` no `scheduler.py`.
13. Refactor FK 1:N ata-edital (RN-213): nova tabela, migração, endpoints, frontend.

**Fase 5 — Testes de regressão + validação (1–2 dias)**
14. Rodar suíte Playwright completa (322 testes).
15. Atualizar tutoriais das 5 sprints se algum passo mudou devido a gate novo.
16. Regerar PPT V2 (incremental), commit + push.

**Total estimado: 10–15 dias de trabalho concentrado**, assumindo 1 dev full-time e suite de testes saudável.

---

## PARTE 5 — Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Migração de `Produto.status` → enum rejeita linhas existentes com valores fora do enum | Auditoria prévia `SELECT DISTINCT status FROM produto` + back-fill antes do `ALTER` |
| Gate de certidão vencida (RN-031) bloqueia seed de validação | Feature flag `ENFORCE_CERTIDAO_GATE=false` em dev, true em prod, default false até testes passarem |
| Audit log explode tamanho do MySQL | Tabela particionada por mês ou TTL de 12 meses via job |
| `workalendar` não cobre feriados estaduais/municipais | Documentar limitação; evoluir para tabela própria se exigido por UF-específico |
| Refactor 1:N ata-edital quebra exports existentes | Compatibilidade via view SQL `ata_pregao_legacy` mantendo shape antigo até frontend migrar |
| Alertas de scheduler disparam emails em massa no primeiro deploy | Lançar com dry-run (log-only) por 7 dias antes de ativar envio real |

---

## PARTE 6 — Resposta direta à pergunta do usuário

> "as regras de negocios novas impactam muito o codigo produzido nas 5 sprints? o que precisa ser alterado no codigo?"

**Não impacta muito.** Dos 64 RNs marcados como [FALTANTE]:

- **2 já estão no código** (RN-040, RN-077) — só falta documentar.
- **~30 RNs são validações localizadas** (`if … raise`) — 1 arquivo, até 50 linhas cada. Zero migração. Fase 1 resolve em ~2 dias.
- **~20 RNs são validações com pequena migração** — PEQUENO esforço, ~5 dias.
- **~8 RNs são estruturais** (máquinas de estado de produto/edital/contrato + audit trail cross-cutting) — MÉDIO, ~5 dias, **usa infraestrutura já existente** (`AuditoriaLog` model, `APScheduler`).
- **4 RNs são GRANDE** mas pontuais: feriados úteis (lib externa), 2 jobs de scheduler, 1 refactor FK — ~4 dias.

**Totalizando: ~1800 linhas de backend + 165 de frontend + 1 migração + 1 dependência, em 10–15 dias de trabalho.**

Metáfora: **80% é colar `if`s em endpoints existentes; 20% é mexer em 3 modelos que viram enum e criar um helper de audit.** Nada exige reescrever sprint. O código das 5 sprints continua válido — ganha camadas de enforcement em cima.

**Risco maior:** os 6 RNs de Categoria B (estado + histórico) exigem back-fill cuidadoso dos seeds `valida1@valida.com.br` e `valida2@valida.com.br` para não invalidar dados de validação. Fazer em `editaisvalida` antes de `agenteditais`, com dump/restore como fallback.

---

## PARTE 7 — Verificação

- [ ] `docs/requisitos_completosv8.md` tem os 64 RNs [FALTANTE] reclassificados (presentes ou com fonte pós-implementação)
- [ ] Migração Alembic aplicada em `editaisvalida` sem erro e com seeds válidos
- [ ] Suíte Playwright 322 testes verde
- [ ] Endpoint `GET /api/auditoria` retorna linhas para transições aplicadas em `AuditoriaLog`
- [ ] Scheduler jobs aparecem em `scheduler.get_jobs()` e executam em horário definido
- [ ] Gate de certidão vencida bloqueia seed com certidão expirada (teste manual)
- [ ] Refactor 1:N ata-edital: ata antiga ainda aparece no frontend após migração

---

## Arquivos-chave a ler antes de começar

| Arquivo | Por quê |
|---|---|
| `backend/models.py:2373` | `AuditoriaLog` model existente — reusar |
| `backend/scheduler.py:17-20` | `APScheduler` já importado — reusar |
| `backend/app.py:4942-4943` | RN-077 já implementado — referência de padrão |
| `backend/tools.py:~6742` | `tool_verificar_completude_produto` existente (RN-033) |
| `backend/models.py` definição de `ParametroScore.margem_minima` | RN-122 — campo já existe |
| `backend/models.py` definição de `PrecoCamada.perfil_competitivo` | RN-124 — campo já existe |
| `docs/requisitos_completosv8.md` Seção 13 | Lista canônica das 217 RNs |
| `docs/CASOS DE USO *.md` V3/V4 | Mapeamento RN → UC já feito |

---

## Arquivos que o plano NÃO toca

- Qualquer coisa dentro de `runtime/`, `test-results/`, `frontend/testes/`
- `gerar_ppt_validacao.py` (o PPT não muda; se precisar, regera depois)
- Sprints 6–10 (fora de escopo)
- Fluxos externos (PNCP, Brave, DeepSeek) — só mudam wrappers locais

---

## Nota sobre pacote de validação em curso

A pergunta do usuário vem **depois** do pacote de validação Sprints 1–5 já ter sido entregue (PPT de 76 slides + 5 UCs V3/V4 + Seção 13 das RNs). Portanto este plano assume que:

1. Validação manual com os dois validadores (valida1, valida2) continua rodando **contra o código atual**, sem as RNs faltantes.
2. Este plano só inicia **depois** do ciclo Alfa/Beta terminar, para não invalidar testes já em andamento.
3. Se validadores encontrarem bug relacionado a alguma RN faltante durante Alfa/Beta, esse RN sobe para Fase 1 (prioridade).
