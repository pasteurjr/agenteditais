# DADOS BASE — SPRINT 5 — CONJUNTO 1 (CH Hospitalar)

**Data:** 2026-04-10
**Usuário:** valida1@valida.com.br / 123456
**Empresa:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Referência:** `docs/CASOS DE USO SPRINT5 V3.md`
**UCs cobertos:** 26 (15 V2 + 11 V3)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | valida1@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | CH Hospitalar |
| Papel | admin |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5179 |

---

## 2. Referências (já populadas antes da Sprint 5)

- **Produtos:** Kit Hemograma Sysmex, Monitor Mindray iMEC10
- **Editais:** 28 distribuídos em 9 UFs (SP, RJ, MG, RS, PR, BA, GO, SC, DF)
- **Contratos base:** 7 (1 com dados completos + 6 originais preenchidos pela seed)

---

## 3. Empenhos (Grupo A — UC-CT07, UC-CT08)

### 3.1 Contrato principal CTR-2025-0087 (Comodato Analisador)

| Empenho | Tipo | Valor | Data | Itens | Faturas |
|---|---|---|---|---|---|
| **EMPH-2026-0001** | global | R$ 960.000,00 | 01/04/2026 | 3 | 3 |

**Itens EMPH-2026-0001:**

| # | Descrição | Qtd | Unit. | Valor | `gera_valor` | Observação |
|---|---|---|---|---|---|---|
| 1 | Analisador Mindray BS-240 | 1 | 850.000,00 | 850.000 | ✅ | Equipamento principal |
| 2 | Reagentes Hemograma | 100 | 800,00 | 80.000 | ✅ | Consumo mensal |
| 3 | Calibradores/Controles | 50 | 0,00 | 0 | ❌ | **sem_valor**, limite_consumo_pct=120% |

**Faturas EMPH-2026-0001:**

| NF | Valor | Data | Status |
|---|---|---|---|
| NF-001 | R$ 320.000 | 01/04/2026 | paga |
| NF-002 | R$ 320.000 | 01/05/2026 | pendente |
| NF-003 | R$ 320.000 | 01/06/2026 | pendente |

### 3.2 Contrato secundário CTR-2026-SEC-001

| Empenho | Tipo | Valor | Itens | Faturas |
|---|---|---|---|---|
| **EMPH-2026-0002** | ordinário | R$ 450.000 | 3 | 3 |

---

## 4. Contratos a vencer — 5 tiers (UC-CT09)

| Tier | Número | data_fim | tratativa_status |
|---|---|---|---|
| 90d | CTR-CH-2026-V90 | 2026-06-20 | — |
| 30d | CTR-CH-2026-V30 | 2026-05-08 | — |
| em tratativa | CTR-CH-2026-TR | 2026-04-25 | em_tratativa |
| renovado | CTR-CH-2026-RN | 2026-05-20 | renovado |
| não renovado | CTR-CH-2026-NR | 2026-04-30 | nao_renovado |

---

## 5. Pipeline CRM — 13 stages (UC-CRM01)

| Stage | Qtd | Fonte |
|---|---|---|
| captado_nao_divulgado | 2 | novos dummy |
| captado_divulgado | 4 | editais status=novo |
| em_analise | 3 | editais status=novo |
| lead_potencial | 3 | score alto |
| monitoramento_concorrencia | 2 | novos |
| em_impugnacao | 2 | com impugnação |
| fase_propostas | 3 | com rascunho |
| proposta_submetida | 2 | submetidas |
| espera_resultado | 2 | novos |
| ganho_provisorio | 2 | pós-proposta |
| processo_recurso | 2 | com recurso |
| contra_razao | 1 | com contra-razão |
| resultado_definitivo | 3 | 2 ganhos + 1 perdido |

**Total:** 13/13 stages com dados.

---

## 6. CRM Parametrizações (UC-CRM02)

Populadas via seed: **27 valores default** em 3 tipos:
- tipo_edital: 8
- agrupamento_portfolio: 12
- motivo_derrota: 7

---

## 7. Agenda CRM — 6 itens (UC-CRM04)

| Data | Título | Urgência |
|---|---|---|
| 15/04/2026 | Apresentação técnica edital SP-XXX | crítica |
| 18/04/2026 | Impugnação edital GO-YYY | alta |
| 25/04/2026 | Prazo recurso edital RS-ZZZ | crítica |
| 30/04/2026 | Followup ganho CTR-2025-0087 | normal |
| 08/05/2026 | Negociação renovação CTR-CH-2026-V30 | alta |
| 20/05/2026 | Reunião pós-venda | baixa |

---

## 8. Edital Decisões (UC-CRM06, UC-CRM07)

| Tipo | Motivo | Edital | Contra-razão |
|---|---|---|---|
| nao_participacao | exclusivo_me_epp | X | — |
| nao_participacao | inviavel_comercialmente | Y | — |
| perda | nao_atende_especificacao | Z | não |
| perda | falha_operacional | W | sim |

**Total:** 4 decisões.

---

## 9. Aditivos, Designações, ARP, Atividade Fiscal

- Aditivos contratuais: 1 (tipo=prazo)
- Designações: 2 (1 gestor, 1 fiscal)
- ARP saldos: 2
- Atividade fiscal: 1 (inspeção registrada)
