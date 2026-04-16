# TUTORIAL DE VALIDACAO MANUAL — SPRINT 7 — CONJUNTO 2 (RP3X)

**Data:** 2026-04-16
**Empresa:** RP3X Comercio e Representacoes Ltda. (CNPJ 68.218.593/0001-09)
**Dados de apoio:** `docs/dadossprint7-2.md`
**Referencia:** `docs/CASOS DE USO SPRINT7 V4.md`
**UCs cobertos:** 12 (ME01..ME04, AN01..AN05, AP01..AP03)

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5180 |
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Empresa | RP3X Comercio e Representacoes Ltda. |

### Fluxo de login
1. Abrir `http://localhost:5180`
2. Preencher email/senha → **Entrar**
3. Selecionar **RP3X Comercio e Representacoes Ltda.**

---

## Pre-requisitos

- Backend porta **5007** / Frontend porta **5180**
- Seeds executadas:
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`
- Empresa RP3X criada pela seed

---

## Indice

1. [FASE 1 — Inteligencia de Mercado](#fase-1)
2. [FASE 2 — Analytics Consolidado](#fase-2)
3. [FASE 3 — Perdas Expandido](#fase-3)
4. [FASE 4 — Pipeline de Aprendizado](#fase-4)

---

## FASE 1 — Inteligencia de Mercado (UC-ME01..ME04) <a id="fase-1"></a>

Fluxo identico ao Conjunto 1, com diferenciais:

### UC-ME01 — TAM/SAM/SOM
- Stat cards com valores proprios da RP3X (dados TI governamental, nao diagnostico)
- Funil TAM/SAM/SOM calculado com UFs e NCMs da RP3X

### UC-ME02 — Mapa CRM
- Mapa com marcadores das UFs de atuacao RP3X
- Stat cards SAM com dados RP3X

### UC-ME03 — Share Concorrentes
- **2 concorrentes** (vs 5 do CH): TechSolucoes Gov, GovData Sistemas
- Stat card "Concorrentes Conhecidos" mostra **2**
- Tabela com 2 linhas

### UC-ME04 — Intrusos
- **1 item intruso** (vs 3 do CH): "Servidor de rack 2U com 128GB RAM"
- Stat card "Intrusos Detectados" mostra **1**
- Criticidade: apenas **MEDIO** (8.5%)
- NCM: 8471.49.90
- Sem item CRITICO nem INFORMATIVO

---

## FASE 2 — Analytics Consolidado (UC-AN01..AN04) <a id="fase-2"></a>

Fluxo identico ao Conjunto 1, com diferenciais:

### UC-AN01 — Funil Pipeline
- Dados do pipeline CRM da RP3X
- Volumes menores que CH

### UC-AN02 — Conversoes
- Taxas calculadas com editais RP3X
- Segmentos e UFs diferentes (TI vs Diagnostico)

### UC-AN03 — Tempos
- Transicoes entre etapas com dados RP3X

### UC-AN04 — ROI
- **Receita Direta:** baseada nos 2 precos com vitoria RP3X (~R$ 154.000)
- **Prevencao Perdas:** 1 intruso (R$ 65.000, vs R$ 230.500 do CH)
- ROI total menor proporcionalmente

---

## FASE 3 — Perdas Expandido (UC-AN05) <a id="fase-3"></a>

Fluxo identico ao Conjunto 1, com diferenciais:

- **5 precos historicos** (2 derrota vs 5 do CH)
- Menos perdas na tabela e no pie chart
- Recomendacoes IA podem variar (baseadas nos dados RP3X)
- Botao Exportar CSV funciona normalmente

---

## FASE 4 — Pipeline de Aprendizado (UC-AP01..AP03) <a id="fase-4"></a>

### UC-AP01 — Feedbacks
Fluxo identico ao Conjunto 1, com diferenciais:
- **5 feedbacks** (vs 15 do CH)
- Stat card "Total Feedbacks" mostra **5**
- Tipos: 2 resultado, 1 score, 1 preco, 1 feedback_usuario
- Aplicados: 3 (i % 2 == 0), Pendentes: 2
- Tabela com 5 linhas

### UC-AP02 — Sugestoes IA
Fluxo identico ao Conjunto 1, com diferenciais:
- **2 sugestoes** (vs 5 do CH):
  - "Priorizar pregoes eletronicos DF" (78%, **pendente**)
  - "Margem competitiva em sistemas web" (65%, aceita)
- Stat cards: Pendentes (1), Aceitas (1), Rejeitadas (**0**)
- Apenas 1 sugestao ativa para interacao (Aceitar)
- Sem sugestao rejeitada no seed — interacao Rejeitar cria a primeira
- Historico: 1 aceita (seed) + acoes do teste

### UC-AP03 — Padroes Detectados
Fluxo identico ao Conjunto 1, com diferenciais:
- **2 padroes** (vs 4 do CH):
  - "Editais federais tem margem 15% maior" (78%, verde)
  - "Precos de TI subindo 5% ao semestre" (55%, amarelo)
- Stat cards: Detectados (**2**), Alta Confianca (**1**), Ultima Analise
- **Nenhum padrao < 50%** — toggle nao altera resultado visivel
- Toggle existe mas nao tem efeito pratico (ambos padroes >= 50%)
