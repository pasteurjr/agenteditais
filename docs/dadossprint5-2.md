# DADOS BASE — SPRINT 5 — CONJUNTO 2 (RP3X)

**Data:** 2026-04-10
**Usuário:** valida2@valida.com.br / 123456
**Empresa:** RP3X Comércio e Representações Ltda. (CNPJ 68.218.593/0001-09)
**Referência:** `docs/CASOS DE USO SPRINT5 V3.md`
**UCs cobertos:** 26 (15 V2 + 11 V3)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Empresa | RP3X Comércio e Representações Ltda. |
| CNPJ | 68.218.593/0001-09 |
| Papel | admin |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5179 |

---

## 2. Parametrizações de empresa

| Item | Valor |
|---|---|
| Markup padrão | 35% |
| Custos fixos mensais | R$ 42.000 |
| Frete base | R$ 180 |
| Tema | claro |

---

## 3. Produtos

| Código | Nome | Fabricante |
|---|---|---|
| SYS-XN | Kit Hemograma Sysmex XN | Sysmex |
| WIE-BG100 | Kit Glicose Wiener BioGlic-100 | Wiener |

---

## 4. Editais (≥15 em 6 UFs)

Distribuição: SP, RJ, MG, RS, PR, BA — foco em reagentes/diagnóstico in vitro.

---

## 5. Empenhos (Grupo A — UC-CT07, UC-CT08)

### 5.1 CTR-2026-RP3X-001 (Comodato analisador hematologia)

| Empenho | Tipo | Valor | Itens | Faturas |
|---|---|---|---|---|
| **EMPH-2026-RP3X-001** | global | R$ 480.000 | 3 | 3 |

**Itens:**

| # | Descrição | Qtd | Unit. | `gera_valor` |
|---|---|---|---|---|
| 1 | Kit Hemograma Sysmex XN (caixa) | 200 | 1.800 | ✅ |
| 2 | Kit Glicose Wiener BioGlic-100 | 500 | 220 | ✅ |
| 3 | Controles qualidade (calibradores) | 100 | 0 | ❌ limite=110% |

**Faturas:** NF-R01 (R$180k paga) / NF-R02 (R$150k pendente) / NF-R03 (R$150k pendente).

### 5.2 CTR-2026-RP3X-002 (Fornecimento reagentes)

| Empenho | Tipo | Valor | Itens | Faturas |
|---|---|---|---|---|
| **EMPH-2026-RP3X-002** | estimativo | R$ 220.000 | 3 | 3 |

---

## 6. Contratos a vencer — 5 tiers (UC-CT09)

| Tier | Número | data_fim | tratativa_status |
|---|---|---|---|
| 90d | CTR-RP-2026-V90 | 2026-06-25 | — |
| 30d | CTR-RP-2026-V30 | 2026-05-05 | — |
| em tratativa | CTR-RP-2026-TR | 2026-04-28 | em_tratativa |
| renovado | CTR-RP-2026-RN | 2026-05-22 | renovado |
| não renovado | CTR-RP-2026-NR | 2026-05-02 | nao_renovado |

---

## 7. Pipeline CRM — 12/13 stages

Mesmos stages do Conjunto 1, com **contra_razao intencionalmente vazio** (card 0 — testar estado vazio).

---

## 8. Agenda CRM — 6 itens

| Data | Título | Urgência |
|---|---|---|
| 16/04/2026 | Visita técnica edital MG-AAA | alta |
| 22/04/2026 | Impugnação edital BA-BBB | crítica |
| 28/04/2026 | Elaboração recurso edital SP-CCC | crítica |
| 05/05/2026 | Apresentação ensaio reagentes | normal |
| 10/05/2026 | Renovação CTR-RP-2026-V30 | alta |
| 25/05/2026 | Treinamento cliente | baixa |

---

## 9. Edital Decisões

4 decisões: 2 nao_participacao + 2 perda (1 com contra-razão).

---

## 10. Aditivos/Designações/ARP

- Aditivos: 1
- Designações: 2 (gestor + fiscal)
- ARP saldos: 2
- Atividade fiscal: 1
