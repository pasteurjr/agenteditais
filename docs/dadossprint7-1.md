# DADOS BASE — SPRINT 7 — CONJUNTO 1 (CH Hospitalar)

**Data:** 2026-04-16
**Usuario:** valida1@valida.com.br / 123456
**Empresa:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Referencia:** `docs/CASOS DE USO SPRINT7 V4.md`
**UCs cobertos:** 12 (ME01..ME04, AN01..AN05, AP01..AP03)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | valida1@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | CH Hospitalar |
| Papel | admin |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |

---

## 2. Referencias pre-existentes

- **Editais:** >=28 distribuidos em 9 UFs (Sprints 1-5)
- **Contratos:** >=12 vigentes
- **ParametroScore:** com `estados_atuacao` e NCMs configurados
- **Seeds anteriores obrigatorias:**
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`

---

## 3. Concorrentes (5 registros)

| # | Nome | CNPJ | Participados | Ganhos | Observacao |
|---|---|---|---|---|---|
| 1 | MedLab Sul | 12.345.678/0001-90 | 15 | 8 | Reagentes hematologia e bioquimica |
| 2 | DiagTech Ltda | 23.456.789/0001-01 | 12 | 3 | Equipamentos diagnostico |
| 3 | BioAnalise SA | 34.567.890/0001-12 | 10 | 5 | Kits laboratoriais diversos |
| 4 | LabNorte Distribuidora | 45.678.901/0001-23 | 8 | 2 | Reagentes e insumos norte |
| 5 | QualiMed Diagnosticos | 56.789.012/0001-34 | 20 | 12 | Full-line diagnostico |

---

## 4. Participacoes em Editais (20 registros)

- 20 participacoes distribuidas ciclicamente entre os 5 concorrentes e os 10 primeiros editais CH
- Posicao final: 1 a 5 (ciclico)
- Preco proposto: R$ 40.000 a R$ 89.512 (incremental)
- Fonte: manual

---

## 5. Precos Historicos (15 registros)

| Resultado | Qtd | Nosso Preco (faixa) | Vencedor |
|---|---|---|---|
| vitoria | 8 | R$ 45.000 a R$ 67.400 | CH Hospitalar |
| derrota | 5 | R$ 70.600 a R$ 83.000 | MedLab Sul |
| cancelado | 2 | R$ 86.200 a R$ 89.400 | — |

**Distribuicao:** 53% vitoria, 33% derrota, 14% cancelado

---

## 6. Feedbacks de Aprendizado (15 registros)

| Tipo | Qtd | Entidade | Aplicado |
|---|---|---|---|
| resultado_edital | 4 | edital | mix sim/nao |
| score_ajustado | 4 | edital | mix sim/nao |
| preco_ajustado | 4 | edital | mix sim/nao |
| feedback_usuario | 3 | geral | mix sim/nao |

- **Total:** 15 feedbacks
- **Aplicados:** ~10 (regra: `i % 3 != 0`)
- **Pendentes:** ~5
- **Taxa de adocao:** ~62.5%
- **Dados:** cada feedback tem `dados_entrada`, `resultado_real` e `delta` com scores

---

## 7. Sugestoes IA (5 registros)

| # | Tipo | Titulo | Confianca | Status | Motivo Rejeicao |
|---|---|---|---|---|---|
| 1 | parametro | Ajustar peso prazo de entrega | 82% | **pendente** | — |
| 2 | margem | Reduzir margem em Hematologia SP | 75% | **pendente** | — |
| 3 | score | Recalibrar score tecnico para biomol | 68% | **pendente** | — |
| 4 | estrategia | Focar em pregoes eletronicos MG | 90% | aceita | — |
| 5 | parametro | Ignorar editais < R$ 10k | 55% | rejeitada | Nao concordamos, editais pequenos abrem portas |

**Distribuicao:** 3 pendentes, 1 aceita, 1 rejeitada

---

## 8. Padroes Detectados (4 registros)

| # | Tipo | Titulo | Confianca | Dados |
|---|---|---|---|---|
| 1 | sazonalidade | Pico de editais em Marco e Setembro | **92%** | meses_pico: 03, 09; concentracao: 35% |
| 2 | correlacao | Orgaos federais pagam 12% acima da media | **85%** | federal_premium: 12%; amostra: 45 |
| 3 | tendencia_preco | Preco medio subindo 3% ao trimestre | 68% | taxa_trimestral: 3.0%; segmento: hematologia |
| 4 | comportamento_orgao | Hospital X repete mesmos NCMs a cada 6 meses | **45%** | orgao: Hospital Municipal X; ciclo: 6 meses |

**Distribuicao por confianca:**
- Alta (>=70%): 2 (sazonalidade 92%, correlacao 85%)
- Media (50-69%): 1 (tendencia_preco 68%)
- Baixa (<50%): 1 (comportamento_orgao 45%) — **oculto por default no toggle**

---

## 9. Itens Intrusos (3 registros)

| # | Descricao | NCM | Valor | % Edital | Criticidade | Acao Sugerida |
|---|---|---|---|---|---|---|
| 1 | Mobiliario hospitalar - cama articulada eletrica | 9402.90.90 | R$ 185.000 | **15.3%** | **CRITICO** | Item fora do portfolio. Risco alto de inexecucao. |
| 2 | Ar condicionado split 30000 BTU | 8415.10.11 | R$ 42.000 | 7.2% | **MEDIO** | Fora do escopo diagnostico. Avaliar subcontratacao. |
| 3 | Papel A4 resma 500fls | 4802.56.10 | R$ 3.500 | 0.8% | INFORMATIVO | Material de escritorio. Impacto minimo. |

**Criterios de criticidade:**
- CRITICO: > 10% do edital (vermelho)
- MEDIO: 5-10% do edital (amarelo)
- INFORMATIVO: < 5% do edital (azul)

---

## 10. Dados derivados (calculados em tempo real)

### TAM/SAM/SOM (UC-ME01)
- **TAM:** todos os editais no periodo (quantidade e valor total)
- **SAM:** filtrado por UFs do `estados_atuacao` e NCMs do portfolio
- **SOM:** SAM * taxa_vitoria * capacidade (penetracao)

### Analytics Funil (UC-AN01)
- Funil de 13 etapas do CRM pipeline
- Stat cards: Total Pipeline, Analisados, Participados, Resultado Definitivo
- Dados derivados do LeadCRM da empresa

### Conversoes (UC-AN02)
- Taxa geral, por tipo de licitacao, por UF, por segmento
- Benchmark contra periodo anterior

### Tempos (UC-AN03)
- Tempo medio entre cada transicao do pipeline
- Badge GARGALO na transicao mais lenta

### ROI (UC-AN04)
- Receita Direta: soma dos editais ganhos (PrecoHistorico vitoria)
- Oportunidades Salvas: recursos deferidos
- Produtividade: 40h * R$ 150/h * meses
- Prevencao Perdas: valor dos itens intrusos detectados (R$ 230.500)
