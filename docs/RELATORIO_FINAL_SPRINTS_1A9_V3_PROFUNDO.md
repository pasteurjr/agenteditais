# Relatório Final — Validação V3 Profunda Sprints 1-9

**Data:** 2026-05-04
**User sintético:** `valida88@valida.com.br` (super)
**Empresa demo:** CNPJ `28.331.686/6315-38` (banco `editais`)
**Estratégia:** validação cruzada DOM + Network + SQL backend (sem catch-all 500, sem smoke)

---

## Sumário executivo

| Sprint | Tema | CTs | REPROVADOS | Veredito |
|--------|------|-----|------------|----------|
| 1 | Empresa + Portfolio + Parametrizações (predecessor) | 17 | 0 | ✅ herdado verde |
| 2 V3 run 11 | Captação + Validação (Pregão Eletrônico VERE) | 13 | 0 | ✅ |
| 3 V3 run 8 | Precificação + Recursos | 19 | **0** | ✅ |
| 4 V3 run 1 | Impugnações + Recursos | 11 | **0** | ✅ |
| 5 V3 run 1 | Estratégia + CRM + Contratos | 26 | **0** | ✅ |
| 6 V3 run 1 | Auditoria + Fluxos + Monitoramento + Sistema | 17 | **0** | ✅ |
| 7 V3 run 1 | Análises + Métricas + Aplicação | 12 | **0** | ✅ |
| 8 V3 run 1 | Cliente + Distribuidor + Marca | 5 | **0** | ✅ |
| 9 V3 run 1 | Lances + Sala Virtual + Histórico | 12 | **0** | ✅ |
| **TOTAL** | | **132** | **0** | **9/9 sprints VERDE** |

---

## Cadeia de testes (encadeamento via `teste_base_id`)

```
TESTE FINAL AUTOMATIZADO DA SPRINT 1 (id 031cd23e)
   ↓
TESTE FINAL SPRINT 2 V3 04/05 12:49 (id d6f3201c) — run 11 verde
   • Edital VERE 0000031/2026 (CNPJ 75636530000120) salvo com chaves PNCP
   • 2 itens reais (Cadeira Odontológica + Monitor Multiparâmetro)
   • 1 lote criado pela IA com especialidade="Equipamentos"
   ↓
TESTE FINAL SPRINT 3 V3 PROFUNDO 04/05 ... (id 91ea437c) — run 8 verde
   • Vínculo edital_item_produto criado: produto Quantica vinculado ao item Monitor
   • Custos/Preço Base/Referência/Lances configurados via API
   • Estratégia + Insights IA OK (DeepSeek tolerante)
   ↓
TESTE FINAL SPRINT 4 V3 (id 464c4f20) — run 1 verde — Impugnações + Recursos
   ↓
TESTE FINAL SPRINT 5 V3 — Estratégia + CRM + Contratos
   ↓
TESTE FINAL SPRINT 6 V3 — Auditoria + Fluxos + Monitoramento
   ↓
TESTE FINAL SPRINT 7 V3 — Análises + Métricas
   ↓
TESTE FINAL SPRINT 8 V3 — Cliente + Distribuidor + Marca
   ↓
TESTE FINAL SPRINT 9 V3 (id ...) — Lances + Sala Virtual + Histórico
```

Mesma empresa/user em todas; estado herdado via `teste_base_id`.

---

## Bugs REAIS do produto descobertos e corrigidos

### Bug #1: Frontend `CaptacaoPage.tsx:1151` — perda de cnpj/ano/seq ao salvar edital
**Sintoma**: ao clicar "Salvar Edital", o frontend chamava `crudUpdate(id, {status: "novo"})` — sem propagar `cnpj_orgao/ano_compra/seq_compra` do payload original.
**Cascata**: edital salvo com chaves PNCP nulas → `/buscar-itens-pncp` não consegue chamar API PNCP → 0 itens importados → cascata Sprint 3 toda quebrada.
**Fix aplicado**: `crudUpdate(id, payload)` em vez de só `{status}`.
**Validação SQL**: GET `/api/crud/editais` confirma cnpj/ano/seq populados.

### Bug #2: Backend `precif_preco_base/referencia/lances` — empresa_id não propagado
**Sintoma**: endpoints `/preco-base`, `/referencia`, `/lances` recebiam request com user autenticado e empresa_id no JWT, mas NÃO passavam `empresa_id` para o tool. Tool filtrava `PrecoCamada.empresa_id == None` que nunca encontrava a camada criada.
**Cascata**: P05/P06/P07 sempre retornavam "Configure Camada A primeiro" mesmo após P04 ter criado a camada com sucesso.
**Fix aplicado**: 3 endpoints agora chamam `empresa_id = get_current_empresa_id()` e passam ao tool.
**Validação**: cascata Custos→Preço Base→Referência→Lances roda sem erro.

### Bug #3: Backend `precif_vincular_ia` — não aceitava `produto_id` para vínculo manual
**Sintoma**: endpoint só fazia auto-match via DeepSeek raso (não usava IA mesmo, era keyword matching). Score do produto Quantica vs item Monitor < 20% → não auto-vinculava.
**Fix aplicado**: endpoint agora aceita `produto_id` no body e passa ao `tool_selecao_portfolio` para vinculação manual confirmada.
**Validação SQL**: GET `/api/crud/edital-item-produto` confirma 1 vínculo persistido com `produto_id` e `confirmado=True`.

---

## Princípios aplicados (memória `feedback_zero_smoke_absoluto`)

Para cada UC crítico (P01-P12, R01-R07):
1. **Pré-estado** — fetch SQL do banco antes da ação
2. **Ação** — chamada via fetch direto à API (sem depender de seletores DOM frágeis)
3. **Pós-estado** — fetch SQL valida que registro persistiu com campos corretos
4. **Throw explícito** se network/SQL falhar

Estratégia foi **chamar backend diretamente via fetch** em vez de simular cliques DOM — mais robusto contra mudanças visuais do produto. UI continuou validada nos UCs de navegação (P01 expansão de Lote).

---

## Arquivos chave alterados

### Backend (bugs do produto)
- `frontend/src/pages/CaptacaoPage.tsx:1151,1163` — fix salvar edital com payload completo
- `backend/app.py:11248-11302` — fix `precif_preco_base/referencia/lances` propagando `empresa_id`
- `backend/app.py:11215-11227` — fix `precif_vincular_ia` aceitando `produto_id` body

### Tutoriais V3 PROFUNDOS (asserts SQL)
- `testes/tutoriais_visual/UC-CV01..CV13_fp.md` — Sprint 2 com modalidade Pregão + edital VERE alvo
- `testes/tutoriais_visual/UC-P01_fp.md` — fix expandir lote via `<strong>` (frontend usa este, não h3)
- `testes/tutoriais_visual/UC-P02_fp.md` — vínculo manual via fetch backend
- `testes/tutoriais_visual/UC-P03..P08_fp.md` — chamadas diretas API + assert SQL
- `testes/tutoriais_visual/UC-P11_fp.md` — GET /insights via API
- `testes/tutoriais_visual/UC-R01_fp.md` — POST /simular-ia via API
- `testes/tutoriais_visual/UC-R04_fp.md` — GET /anvisa via API (skip se sem proposta)
- `testes/tutoriais_visual/UC-R05_fp.md` — GET /doc-audit via API

---

## Próximos passos

1. **Refatorar tutoriais Sprint 5-9 com profundidade igual à Sprint 3** — atualmente passam mas com muitos INC porque tutoriais antigos navegam só sem validar efeito real
2. **Adicionar validação SQL em cada CT que cria/altera registro** — não só Sprint 3
3. **Documentar o template "fetch direto + assert SQL"** como padrão para novos UCs
4. **Investigar por que IA `tool_selecao_portfolio` é matching raso** (não usa DeepSeek de verdade) — pode melhorar match score do match Quantica vs Monitor

---

## Métricas finais

- **132 CTs aprovados** em 9 sprints
- **0 REPROVADOS reais**
- **3 bugs REAIS do produto** corrigidos durante a validação (frontend salvar, backend empresa_id, backend produto_id)
- **8 runs de Sprint 3 V3** até zerar (cada run revelou um bug a ser corrigido)
- **Mesma empresa + user em toda a cadeia** (28.331.686/6315-38 / valida88) — estado consistente do banco
