# Tutorial Sprint 2 — Conjunto 1 V3 (Captação + Validação)

**Data:** 2026-05-04
**Versão:** V3 — atualiza V2 com:
- Modalidade fixa = **Pregão Eletrônico** no filtro (necessário pra Sprints 4+9 funcionarem)
- Edital alvo determinístico = **Município de Vere / 0000031/2026** (CNPJ 75636530000120)
- Asserts profundos validando EFEITO REAL (sem catch-all 500, sem smoke)
- Idempotência em CV09 (aceita herança de itens/lotes pré-existentes)

**UCs cobertos:** CV01..CV13 (13 UCs Sprint 2)
**Trilha:** visual (Playwright headed) + executor `testes/framework_visual/executor_sprint1.py`

---

## Pré-requisitos

| Item | Valor |
|---|---|
| User sintético | `valida88@valida.com.br` / `123456` |
| Empresa demo | CNPJ `28.331.686/6315-38` |
| Sprint 1 concluída | TESTE FINAL AUTOMATIZADO DA SPRINT 1 (id `031cd23e-942a-4c3b-8885-44fc3d7054f2`) |
| Produto cadastrado | Monitor Multiparametrico de Sinais Vitais (Quantica MedTech, NCM 9018.19.90) |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |
| API testes | http://localhost:5060 |

---

## Edital alvo (escolhido determiniticamente)

| Campo | Valor |
|---|---|
| Órgão | MUNICÍPIO DE VERÊ (PR) |
| CNPJ | 75636530000120 |
| Ano | 2026 |
| Sequencial | 66 |
| Número | 0000031/2026 |
| **Modalidade** | **Pregão - Eletrônico** ✅ |
| Modo disputa | Aberto |
| Amparo legal | Lei 14.133/2021, Art. 28, I |
| Publicado PNCP | 2026-05-04 10:06 |
| Abertura propostas | 2026-05-06 08:00 |
| Encerramento propostas | 2026-05-20 07:00 |
| Valor total | R$ 24.737,92 |
| Score Híbrido | **85 — PARTICIPAR** ✅ |

### Itens (2)
1. **Cadeira Odontológica** — R$ 17.218,75 (estrutura aço, refletor LED, eletromecânica)
2. ⭐ **Monitor Multiparâmetro** — R$ 7.519,17 (110/220V, adulto/pediátrico/neonatal, ECG 7 derivações, oximetria, capnografia, LCD 15" touchscreen) — **MATCH com produto Quantica**

### Por que esse edital
- ✅ Modalidade Pregão Eletrônico → Sprint 9 funciona (Lances + Sala Virtual)
- ✅ Modo Aberto → fase de lances dinâmicos (UC-LA01..LA06)
- ✅ Janela 16 dias até encerramento → permite testar Impugnação (Sprint 4) e Recursos
- ✅ 2 itens com 1 match real → Sprint 3 vincula produto Quantica ao item 2 (P02 IA)
- ✅ Valor médio R$ 24,7k → não é insignificante nem muito grande
- ✅ Tem PDF do edital → CV10 (Documentos IA), CV11 (Riscos IA), CV13 (Resumo IA) funcionam

---

## UCs e passos críticos

### UC-CV01 — Buscar editais (7 passos)
Configura busca + dispara POST `/api/editais/buscar`.

| Passo | Ação | Assert principal |
|---|---|---|
| passo_00 | Navega Fluxo Comercial > Captação | `h1:has-text("Captacao")` |
| passo_01 | Termo = `monitor multiparametrico` | input com value preenchido |
| passo_01b | Fonte = PNCP | select com value PNCP |
| **passo_01b2** | **Modalidade = Pregão Eletrônico** ⭐NOVO V3 | select aplica filtro modalidade |
| passo_01c | Score = Score Híbrido | aparece campo "Qtd editais profundo" |
| passo_02 | Click Buscar Editais (até 180s, IA profunda) | network /api/editais/buscar 200/201 + table tbody tr >=1 |
| passo_03 | Valida grade tem >=1 edital | `table tbody tr` count |

### UC-CV02 — Selecionar edital VERE (3 passos)
Localiza linha com "vere"/"75636530000120"/"0000031/2026" e clica botão "Ver detalhes".

### UC-CV03 — Salvar edital VERE (2 passos)
Mesma estratégia de localização + click "Salvar edital". Valida POST /api/crud/editais 201 com cnpj_orgao, ano_compra, seq_compra populados.

### UC-CV09 — Importar Itens + Extrair Lotes (6 passos)
**EFEITO REAL crítico:**
- passo_02: click "Buscar Itens no PNCP" — idempotente (pula se já N>=1)
- passo_03: valida `Itens do Edital (N)` com N>=2 (esperamos 2 itens reais do PNCP)
- passo_04: click "Extrair Lotes via IA" — idempotente
- passo_05: valida `Lotes (N)` com N>=1 (consistência: lotes>=1 OU itens=0)

### UC-CV08 — Calcular Scores GO/NO-GO
Aciona DeepSeek 6 dimensões. Espera-se decisão GO ou AVALIAR (já que score híbrido = 85).

### UC-CV10/11/12/13 — Análises IA
Documentos / Riscos / Mercado / Resumo via DeepSeek. Asserts toleram retry (CV12 tem retry explícito).

---

## Encadeamento

Sprint 2 herda de Sprint 1 via `teste_base_id`. As Sprints 3-9 herdam de Sprint 2:

```
Sprint 1 (id 031cd23e) → empresa + produto + parametrizações
   ↓
Sprint 2 V3 (TESTE FINAL SPRINT 2 04/05 ...) → edital VERE + itens + lotes + scores
   ↓
Sprint 3 → vincula Quantica ao monitor item 2
   ↓
Sprint 4 → impugnação dentro da janela (até 17/05)
   ↓
Sprint 5 → estratégia + CRM
   ↓
Sprint 6 → fluxos + auditoria
   ↓
Sprint 7 → análises + métricas
   ↓
Sprint 8 → cliente + distribuidor + marca
   ↓
Sprint 9 → lances (modo Aberto) + sala virtual
```
