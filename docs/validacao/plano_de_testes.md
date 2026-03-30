# Plano de Testes — Agente de Editais

**Data:** 30/03/2026
**Total:** 58 Casos de Uso → 58 specs Playwright

---

## Bloco 1 — Fundação (Sprint 1)

| UC | Nome | Spec | Passos | Screenshots Est. | IA? |
|---|---|---|---|---|---|
| UC-001 | Login | uc-001.spec.ts | 5 | 6 | Não |
| UC-002 | Cadastro empresa | uc-002.spec.ts | 7 | 10 | Não |
| UC-003 | Documentos empresa | uc-003.spec.ts | 5 | 8 | Não |
| UC-004 | Busca certidões | uc-004.spec.ts | 4 | 6 | Ext |
| UC-005 | Responsáveis | uc-005.spec.ts | 4 | 6 | Não |
| UC-006 | Cadastro produto | uc-006.spec.ts | 6 | 8 | Não |
| UC-007 | Upload manual IA | uc-007.spec.ts | 5 | 8 | Sim |
| UC-008 | Especificações | uc-008.spec.ts | 5 | 6 | Não |
| UC-009 | Classes/subclasses | uc-009.spec.ts | 6 | 8 | Não |
| UC-010 | Fontes editais | uc-010.spec.ts | 4 | 6 | Não |
| UC-011 | Parâmetros score | uc-011.spec.ts | 5 | 6 | Não |
| UC-012 | Dashboard | uc-012.spec.ts | 4 | 6 | Não |

## Bloco 2 — Captação e Validação (Sprint 2)

| UC | Nome | Spec | Passos | Screenshots Est. | IA? |
|---|---|---|---|---|---|
| UC-013 | Buscar editais | uc-013.spec.ts | 6 | 10 | Ext |
| UC-014 | Filtrar editais | uc-014.spec.ts | 5 | 8 | Não |
| UC-015 | Salvar editais | uc-015.spec.ts | 4 | 6 | Não |
| UC-016 | Score aderência | uc-016.spec.ts | 5 | 8 | Sim |
| UC-017 | Validar 6 dimensões | uc-017.spec.ts | 6 | 10 | Sim |
| UC-018 | Análise mercado | uc-018.spec.ts | 4 | 6 | Sim |
| UC-019 | Decisão participação | uc-019.spec.ts | 4 | 6 | Não |

## Bloco 3 — Precificação e Proposta (Sprint 3)

| UC | Nome | Spec | Passos | Screenshots Est. | IA? |
|---|---|---|---|---|---|
| UC-020 | Organizar lotes | uc-020.spec.ts | 5 | 8 | Não |
| UC-021 | Vincular produto | uc-021.spec.ts | 4 | 6 | Sim |
| UC-022 | Camadas A-E | uc-022.spec.ts | 6 | 10 | Não |
| UC-023 | Preços PNCP | uc-023.spec.ts | 4 | 6 | Ext |
| UC-024 | Simular disputa | uc-024.spec.ts | 5 | 8 | Sim |
| UC-025 | Estratégia | uc-025.spec.ts | 4 | 6 | Sim |
| UC-026 | Gerar proposta IA | uc-026.spec.ts | 6 | 10 | Sim |
| UC-027 | Editor proposta | uc-027.spec.ts | 5 | 8 | Não |
| UC-028 | ANVISA | uc-028.spec.ts | 4 | 6 | Ext |
| UC-029 | Auditoria docs | uc-029.spec.ts | 4 | 6 | Não |
| UC-030 | Export dossiê | uc-030.spec.ts | 4 | 6 | Não |
| UC-031 | Submeter proposta | uc-031.spec.ts | 4 | 6 | Não |

## Bloco 4 — Impugnação e Recursos (Sprint 4)

| UC | Nome | Spec | Passos | Screenshots Est. | IA? |
|---|---|---|---|---|---|
| UC-032 | Validação legal IA | uc-032.spec.ts | 8 | 14 | **Sim (60s)** |
| UC-033 | Gerar petição | uc-033.spec.ts | 5 | 8 | Sim |
| UC-034 | Upload petição | uc-034.spec.ts | 4 | 6 | Não |
| UC-035 | Controle prazo | uc-035.spec.ts | 4 | 6 | Não |
| UC-036 | Monitorar recurso | uc-036.spec.ts | 5 | 8 | Não |
| UC-037 | Analisar vencedora IA | uc-037.spec.ts | 6 | 10 | **Sim (60s)** |
| UC-038 | Chatbox análise | uc-038.spec.ts | 5 | 8 | **Sim (100s)** |
| UC-039 | Laudo recurso IA | uc-039.spec.ts | 7 | 12 | **Sim (120s)** |
| UC-040 | Contra-razão IA | uc-040.spec.ts | 5 | 8 | Sim |
| UC-041 | Submissão portal | uc-041.spec.ts | 6 | 10 | Não |

## Bloco 5 — Pós-Licitação (Sprint 5)

| UC | Nome | Spec | Passos | Screenshots Est. | IA? |
|---|---|---|---|---|---|
| UC-042 | Registrar resultado | uc-042.spec.ts | 6 | 10 | Não |
| UC-043 | Alertas vencimento | uc-043.spec.ts | 4 | 6 | Não |
| UC-044 | Score logístico | uc-044.spec.ts | 3 | 4 | Não (API) |
| UC-045 | Buscar atas PNCP | uc-045.spec.ts | 5 | 8 | Ext |
| UC-046 | Extrair ata IA | uc-046.spec.ts | 5 | 8 | **Sim (90s)** |
| UC-047 | Dashboard atas | uc-047.spec.ts | 4 | 6 | Não |
| UC-048 | Cadastrar contrato | uc-048.spec.ts | 5 | 8 | Não |
| UC-049 | Registrar entrega | uc-049.spec.ts | 5 | 8 | Não |
| UC-050 | Cronograma | uc-050.spec.ts | 4 | 6 | Não |
| UC-051 | Aditivos | uc-051.spec.ts | 5 | 8 | Não |
| UC-052 | Gestor/Fiscal | uc-052.spec.ts | 5 | 8 | Não |
| UC-053 | Saldo ARP | uc-053.spec.ts | 5 | 8 | Não |
| UC-054 | Dashboard CR | uc-054.spec.ts | 5 | 8 | Não |
| UC-055 | Atrasos | uc-055.spec.ts | 4 | 6 | Não |
| UC-056 | Alertas multi-tier | uc-056.spec.ts | 4 | 6 | Não |

## Bloco 6 — Transversais

| UC | Nome | Spec | Passos | Screenshots Est. | IA? |
|---|---|---|---|---|---|
| UC-057 | Chat IA | uc-057.spec.ts | 5 | 8 | **Sim** |
| UC-058 | CRUD genérico | uc-058.spec.ts | 5 | 8 | Não |

---

## Totais

| Métrica | Valor |
|---------|-------|
| Casos de uso | 58 |
| Specs Playwright | 58 |
| Passos estimados | ~280 |
| Screenshots estimados | ~440 |
| UCs com IA | 15 (timeout 45-120s cada) |
| Tempo estimado total | ~90 min |
