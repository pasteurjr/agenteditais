# TUTORIAL DE VALIDAÇÃO MANUAL — SPRINT 5 — CONJUNTO 2 (RP3X)

**Data:** 2026-04-10
**Empresa:** RP3X Comércio e Representações Ltda. (CNPJ 68.218.593/0001-09)
**Dados de apoio:** `docs/dadossprint5-2.md`
**Referência:** `docs/CASOS DE USO SPRINT5 V3.md`
**UCs cobertos:** 26 (15 V2 + 11 V3)

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5179 |
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Empresa | RP3X Comércio e Representações Ltda. |

### Fluxo de login
1. Abrir `http://localhost:5179`
2. Preencher email/senha → **Entrar**
3. Selecionar **RP3X Comércio e Representações Ltda.**

---

## Pré-requisitos

- Backend porta **5007** / Frontend porta **5179**
- Seed Sprint 5: `python backend/seeds/sprint5_seed.py`
- Empresa RP3X criada pela seed (verificar na tabela `empresas`)

---

## Índice

1. [FASE 1 — Followup](#fase-1)
2. [FASE 2 — Atas](#fase-2)
3. [FASE 3 — Execução Contratos](#fase-3)
4. [FASE 4 — Contratado × Realizado](#fase-4)
5. [FASE 5 — CRM](#fase-5)

---

## FASE 1 — Followup (UC-FU01..04) <a id="fase-1"></a>

Fluxo idêntico ao Conjunto 1, mas com editais de **reagentes**:
- Ganho: edital SP de glicose
- Perda: edital MG de hemograma (motivo: preço)

---

## FASE 2 — Atas (UC-AT01..04) <a id="fase-2"></a>

- 3 atas consultadas (reagentes/diagnóstico)
- 2 saldos ARP

---

## FASE 3 — Execução Contratos (UC-CT01..10) <a id="fase-3"></a>

### UC-CT01..06
- Contratos vigentes: CTR-2026-RP3X-001 (comodato) + CTR-2026-RP3X-002 (fornecimento)
- Aditivos, designações, entregas, atividade fiscal — todos populados pela seed

### UC-CT07 — Empenhos ⭐ NOVO V3
1. **Execução Contrato** → Selecionar `CTR-2026-RP3X-001`
2. Aba **Empenhos** → verificar **EMPH-2026-RP3X-001** (R$ 480.000)
3. Itens:
   - Kit Hemograma Sysmex XN — qty 200 × R$ 1.800
   - Kit Glicose Wiener BioGlic-100 — qty 500 × R$ 220
   - Controles — **sem_valor**, limite 110%
4. Alerta SEM VALOR visível no item de controles
5. Novo Empenho → preencher → salvar

### UC-CT08 — Auditoria ⭐ V3
- 5 totais (Empenhado, Faturado, Pago, Entregue, Saldo)
- Exportar CSV

### UC-CT09 — Contratos a Vencer ⭐ V3
- 5 tiers RP-V30/V90/TR/RN/NR

### UC-CT10 — KPIs ⭐ V3
- 6+ cards

---

## FASE 4 — Contratado × Realizado (UC-DR01..04) <a id="fase-4"></a>

Mesma estrutura do Conjunto 1, com entregas de reagentes (1 atrasada).

---

## FASE 5 — CRM (UC-CRM01..07) <a id="fase-5"></a>

### UC-CRM01 — Pipeline 12/13 stages ⭐ V3
- Card **contra_razao** intencionalmente **vazio** (estado zero — testar card zerado)
- Outros 12 stages populados

### UC-CRM02..07
- Parametrizações (27 valores seed via endpoint)
- Mapa Leaflet/OSM: circulos azuis proporcionais em SP, RJ, MG, RS, PR, BA — clicar abre popup com total editais + stages
- Agenda: 6 itens (visita técnica, impugnação, recurso, apresentação, renovação, treinamento)
- KPIs: números reais
- Decisões: 4 (2 não-participação + 2 perda, 1 com contra-razão)

---

## Resumo

- **UCs cobertos:** 26/26
- **Diferencial do Conj. 2:** card `contra_razao` vazio (estado zero), cenário de reagentes em vez de equipamentos
- **Paridade total** com Conj. 1 para todos os outros elementos

---

## Encerramento

Parar backend e frontend ao final.
