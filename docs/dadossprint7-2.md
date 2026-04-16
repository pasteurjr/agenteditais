# DADOS BASE — SPRINT 7 — CONJUNTO 2 (RP3X)

**Data:** 2026-04-16
**Usuario:** valida2@valida.com.br / 123456
**Empresa:** RP3X Comercio e Representacoes Ltda. (CNPJ 68.218.593/0001-09)
**Referencia:** `docs/CASOS DE USO SPRINT7 V4.md`
**UCs cobertos:** 12 (ME01..ME04, AN01..AN05, AP01..AP03)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | RP3X Comercio e Representacoes Ltda. |
| Papel | admin |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |

---

## 2. Referencias pre-existentes

- **Editais:** dados RP3X das Sprints 1-5
- **Seeds anteriores obrigatorias:**
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`

---

## 3. Concorrentes (2 registros)

| # | Nome | CNPJ | Participados | Ganhos | Observacao |
|---|---|---|---|---|---|
| 1 | TechSolucoes Gov | 67.890.123/0001-45 | 6 | 2 | TI para governo |
| 2 | GovData Sistemas | 78.901.234/0001-56 | 4 | 1 | Sistemas de gestao publica |

---

## 4. Participacoes em Editais (5 registros)

- 5 participacoes ciclicas entre 2 concorrentes e editais RP3X
- Posicao final: 1 a 3 (ciclico)
- Preco proposto: R$ 70.000 a R$ 90.000

---

## 5. Precos Historicos (5 registros)

| Resultado | Qtd | Nosso Preco (faixa) | Vencedor |
|---|---|---|---|
| vitoria | 2 | R$ 75.000 a R$ 79.000 | RP3X |
| derrota | 2 | R$ 83.000 a R$ 87.000 | TechSolucoes Gov |
| cancelado | 1 | R$ 91.000 | — |

---

## 6. Feedbacks de Aprendizado (5 registros)

| Tipo | Qtd | Entidade | Aplicado |
|---|---|---|---|
| resultado_edital | 2 | edital | 1 sim, 1 nao |
| score_ajustado | 1 | edital | sim |
| preco_ajustado | 1 | edital | nao |
| feedback_usuario | 1 | geral | sim |

---

## 7. Sugestoes IA (2 registros)

| # | Tipo | Titulo | Confianca | Status |
|---|---|---|---|---|
| 1 | estrategia | Priorizar pregoes eletronicos DF | 78% | **pendente** |
| 2 | margem | Margem competitiva em sistemas web | 65% | aceita |

---

## 8. Padroes Detectados (2 registros)

| # | Tipo | Titulo | Confianca | Dados |
|---|---|---|---|---|
| 1 | correlacao | Editais federais tem margem 15% maior | **78%** | federal_premium: 15%; amostra: 12 |
| 2 | tendencia_preco | Precos de TI subindo 5% ao semestre | 55% | taxa_semestral: 5.0%; segmento: TI |

---

## 9. Itens Intrusos (1 registro)

| # | Descricao | NCM | Valor | % Edital | Criticidade | Acao Sugerida |
|---|---|---|---|---|---|---|
| 1 | Servidor de rack 2U com 128GB RAM | 8471.49.90 | R$ 65.000 | 8.5% | **MEDIO** | Hardware fora do escopo software. Avaliar parceria. |

---

## 10. Diferenciais vs Conjunto 1 (CH Hospitalar)

| Entidade | CH (Conj.1) | RP3X (Conj.2) | Diferencial |
|---|---|---|---|
| Concorrentes | 5 | 2 | Volume minimo |
| Participacoes | 20 | 5 | Menos historico |
| Precos | 15 | 5 | Menos dados |
| Feedbacks | 15 | 5 | Menos feedback |
| Sugestoes IA | 5 (3 pend.) | 2 (1 pend.) | Menos sugestoes |
| Padroes | 4 (1 oculto) | 2 (nenhum oculto) | Sem baixa confianca |
| Intrusos | 3 (crit+med+info) | 1 (medio) | Apenas 1 criticidade |
