# CÁLCULO DAS DIMENSÕES DO SCORE — Análise Detalhada

Data: 16/03/2026

## Visão Geral dos 3 Modos

| Modo | Dimensões calculadas | Quem calcula | Dados de entrada |
|---|---|---|---|
| **Rápido** | 1 (técnico) + 1 local (comercial) | DeepSeek batch + frontend | Objeto (300 chars) + lista de produtos |
| **Híbrido** | Rápido em TODOS + Profundo nos top N | DeepSeek batch + individual | Idem rápido + profundo nos melhores |
| **Profundo** | 6 dimensões | DeepSeek individual | Objeto (600 chars) + melhor produto + empresa |

---

## 1. MODO RÁPIDO — `tool_calcular_score_aderencia()`

**Arquivo:** `backend/tools.py:3390-3523`

### Pipeline de 3 camadas:

#### Camada 1: Pré-filtro por keywords (sem IA, <100ms)

**Arquivo:** `backend/tools.py:3140-3263`

Constrói um índice de keywords a partir dos produtos do portfolio:
- **Categorias** com sinônimos expandidos (`CATEGORY_SYNONYMS`)
- **Nomes** dos produtos tokenizados (palavras > 2 chars, excluindo stopwords)
- **Fabricantes** e **modelos** (strings > 2 chars)
- **Specs** dos produtos (nomes das especificações tokenizados)

Compara cada edital (campo `objeto` normalizado) contra esse índice:

```
is_relevant = (
    fabricante encontrado no objeto  OR
    modelo encontrado no objeto      OR
    categoria/sinônimo encontrado    OR
    ≥1 keyword de produto encontrada OR
    spec de produto encontrada
)
```

- **Se relevante** → passa para Camada 2 (scoring via IA)
- **Se não relevante** → `score_tecnico=0`, `recomendacao='NAO PARTICIPAR'` (sem gastar IA)

#### Camada 2: Score batch via DeepSeek

**Arquivo:** `backend/tools.py:3287-3342`
**Prompt:** `PROMPT_CALCULAR_SCORE_BATCH` (tools.py:3268-3284)

Agrupa editais em batches de 3-5 e envia ao DeepSeek-chat com:

**Entrada para a IA:**
- Lista de produtos: `[{"nome": "...", "categoria": "...", "fabricante": "..."}]` (sem specs, sem modelo)
- Lista de editais: `[{"idx": N, "numero": "...", "orgao": "...", "objeto": "..." (300 chars)}]`

**Saída da IA (por edital):**
```json
{
  "idx": 0,
  "score_tecnico": 85,
  "recomendacao": "PARTICIPAR",
  "produto_principal": "Nome do produto",
  "justificativa": "Frase curta"
}
```

**Regras hardcoded no prompt:**
- 80-100 → PARTICIPAR
- 50-79 → AVALIAR
- 0-49 → NÃO PARTICIPAR

#### Camada 3: Processamento paralelo

**Arquivo:** `backend/tools.py:3459-3502`

- Até 4 workers paralelos (`ThreadPoolExecutor`)
- Cada batch é enviado independentemente
- Timeout: 120s

### Dimensão `score_tecnico` no Rápido

| Aspecto | Detalhe |
|---|---|
| **Quem calcula** | DeepSeek-chat (LLM) |
| **Dados disponíveis** | Nome + categoria + fabricante dos produtos (SEM modelo, SEM specs). Objeto do edital truncado em 300 chars |
| **Critério** | Aderência textual/semântica entre produtos e objeto do edital |
| **Range** | 0-100 |
| **Determinismo** | Não (LLM pode variar) |

### Dimensão `score_comercial` no Rápido (calculada no FRONTEND)

**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx:174-188`

**NÃO usa IA.** Calculado localmente no frontend com lógica determinística:

```typescript
function calcularScoreComercial(ufEdital: string, estadosAtuacao: string[]): number {
  if (!ufEdital || estadosAtuacao.length === 0) return 20;
  // UF está nos estados de atuação → 100
  if (estadosAtuacao.includes(ufEdital)) return 100;
  // UF vizinha de algum estado de atuação → 60
  if (ehVizinho(ufEdital, estadosAtuacao)) return 60;
  // Fora da região → 20
  return 20;
}
```

| UF do edital vs empresa | Score |
|---|---|
| Mesmo estado de atuação | **100** |
| Estado vizinho | **60** |
| Fora da região | **20** |
| Sem UF ou sem estados cadastrados | **20** |

**Mapa de vizinhança:** `UF_VIZINHOS` (CaptacaoPage.tsx:144-172) — hardcoded com adjacências geográficas dos 27 estados.

**Fonte dos `estadosAtuacao`:** Carregados de `ParametroScore.estados_atuacao` (JSON array) via endpoint `/api/parametros-score`.

### Score Geral no Rápido

```
scoreGeral = Math.round((scoreTecnico + scoreComercial) / 2)
```

**Média simples** de técnico + comercial. **Sem pesos configuráveis.**

### Análise de Gaps no Rápido

**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx:220-240`

Gerada no frontend com regras hardcoded:
- `scoreComercial < 70` → gap "Região de atuação fora do ideal"
- `scoreTecnico >= 70 && scoreComercial >= 70` → "Potencial elevado de ganho"

### Recomendação e Potencial de Ganho no Rápido

**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx:225-250`

```
scoreTecnico >= 80 → "PARTICIPAR", potencial "elevado"
scoreTecnico >= 50 → "AVALIAR", potencial "medio"
scoreTecnico < 50  → "NÃO PARTICIPAR", potencial "baixo"
```

---

## 2. MODO PROFUNDO — `tool_calcular_scores_validacao()`

**Arquivo:** `backend/tools.py:7326-7567`
**Prompt:** `PROMPT_SCORES_VALIDACAO` (tools.py:7235-7323)
**Orquestrador:** `_calcular_score_profundo()` (app.py:8821-8901)

### Fluxo:

1. Salva edital temporariamente no banco (status `temp_score`)
2. Faz matching inteligente de produto
3. Monta prompt com dados do edital + produto + empresa
4. Envia ao DeepSeek-chat (temperature=0, max_tokens=1500)
5. Parseia JSON de resposta
6. Salva na tabela `Analise`
7. Remove edital temporário

### Matching de Produto (tools.py:7360-7416)

Se `produto_id` não fornecido, busca TODOS os produtos do user e pontua:

| Critério | Pontos |
|---|---|
| Token do nome do produto no objeto do edital | +3 por token |
| Fabricante exato no objeto | +10 |
| Modelo exato no objeto | +10 |
| Categoria no objeto | +5 |
| Nome inteiro do produto como substring | +15 |

Usa o produto com maior pontuação. Se nenhum match > 0, usa o **primeiro produto** como fallback.

**Se não há produtos cadastrados:** `produto_info = "Produto não informado. Analise considerando um produto genérico da categoria do edital."`

### As 6 Dimensões — Como a IA Calcula

Todas as 6 dimensões são calculadas **exclusivamente pelo LLM (DeepSeek-chat)**. O backend não tem nenhuma lógica de cálculo própria. A IA recebe:

**Dados de entrada:**
- Edital: número, órgão, objeto (600 chars), valor, modalidade, UF, data
- Produto: nome, categoria, fabricante, modelo, até 5 specs
- Empresa: razão social, CNPJ, porte, regime tributário, UF, cidade

---

### Dimensão 1: `score_tecnico` (Aderência Técnica)

**Peso hardcoded no prompt:** 35%

**O que a IA avalia (conforme prompt):**
```
90-100: Produto atende 100% dos requisitos técnicos
70-89:  Atende requisitos principais, pequenas adaptações
50-69:  Atende parcialmente, requer ajustes
0-49:   Baixa aderência técnica
```

**Na prática:** A IA compara semanticamente o texto do `objeto` (600 chars) com o nome, fabricante, modelo e specs do produto. Se "Autoclave Horizontal" vs edital de "reagentes de hematologia" → score baixo. Se vs edital de "autoclaves para esterilização" → score alto.

**O que a IA NÃO tem:**
- PDF completo do edital (só 600 chars do objeto)
- Itens/lotes do edital
- Specs detalhadas (máximo 5 specs resumidas)
- Certificações requeridas (ANVISA, INMETRO)

---

### Dimensão 2: `score_documental` (Aderência Documental)

**Peso hardcoded no prompt:** 15%

**O que a IA avalia (conforme prompt):**
```
90-100: Documentação padrão, fácil de obter
70-89:  Maioria da documentação disponível
50-69:  Alguns documentos complexos ou demorados
0-49:   Documentação difícil ou impossível
```

**Na prática:** A IA **infere** a complexidade documental a partir de:
- **Modalidade**: pregão eletrônico = mais simples, concorrência = mais documentação
- **Tipo de órgão**: federal = mais exigente que municipal
- **Porte da empresa vs modalidade**: ME/EPP = documentação simplificada em pregões

**O que a IA NÃO tem:**
- Lista real de documentos exigidos pelo edital
- Status das certidões da empresa (CND, FGTS, etc.)
- Atestados de capacidade técnica disponíveis
- Registros ANVISA dos produtos

---

### Dimensão 3: `score_complexidade` (Complexidade do Edital — INVERSO)

**Peso hardcoded no prompt:** 15%

**O que a IA avalia (conforme prompt):**
```
90-100: Edital simples, poucos requisitos
70-89:  Complexidade moderada
50-69:  Edital complexo, muitas exigências
0-49:   Extremamente complexo ou restritivo
```

**Na prática:** A IA busca sinais de complexidade no texto do objeto:
- "aquisição de material" = simples (score alto)
- "locação com comodato, instalação, treinamento, manutenção preventiva e corretiva" = complexo (score baixo)
- Quanto mais verbos de obrigação e requisitos implícitos no texto, menor o score

**O que a IA NÃO tem:**
- Número real de itens/lotes
- Termos de referência completos
- Cláusulas de penalidade
- Prazos de execução

---

### Dimensão 4: `score_juridico` (Risco Jurídico)

**Peso hardcoded no prompt:** 20%

**O que a IA avalia (conforme prompt):**
```
90-100: Sem restrições legais, edital bem elaborado
70-89:  Pequenas questões jurídicas, riscos baixos
50-69:  Alguns pontos questionáveis, possível impugnação
0-49:   Alto risco jurídico ou edital direcionado
```

**Na prática:** A IA busca sinais de risco no texto:
- Exclusividade ME/EPP vs porte da empresa (regra explícita no prompt)
- Termos como "penalidade", "suspensão"
- Indícios de direcionamento (especificações muito específicas de marca/modelo)
- Tipo de modalidade (pregão = menor risco, convite = mais subjetivo)

**Regra especial de porte (hardcoded no prompt):**
- Empresa ME/EPP + edital exclusivo ME/EPP → +10 no score_comercial (não no jurídico)
- Empresa médio/grande + edital exclusivo ME/EPP → **NO-GO automático**

**O que a IA NÃO tem:**
- Texto completo do edital (cláusulas, penalidades)
- Histórico de impugnações do órgão
- Jurisprudência relacionada

---

### Dimensão 5: `score_logistico` (Viabilidade Logística)

**Peso hardcoded no prompt:** 5%

**O que a IA avalia (conforme prompt):**
```
90-100: Entrega simples, local acessível
70-89:  Logística moderada, razoavelmente viável
50-69:  Logística desafiadora
0-49:   Logística inviável ou muito custosa
```

**Na prática:** A IA compara:
- UF da empresa vs UF do edital (mesmo estado = score alto)
- Se o objeto implica instalação/suporte presencial
- Se exige treinamento on-site
- Se o valor justifica frete para regiões distantes

**O que a IA NÃO tem:**
- Distância real (km) entre empresa e órgão
- Custos de frete reais
- Dados de filiais/representantes regionais

---

### Dimensão 6: `score_comercial` (Atratividade Comercial)

**Peso hardcoded no prompt:** 10%

**O que a IA avalia (conforme prompt):**
```
90-100: Alta margem esperada, baixa concorrência
70-89:  Boa oportunidade comercial
50-69:  Margem moderada, concorrência média
0-49:   Margem muito baixa ou alta concorrência
```

**Na prática:** A IA avalia:
- Valor estimado do edital (alto = mais atrativo)
- Modalidade (pregão eletrônico = muitos concorrentes → menor score)
- Benefícios ME/EPP (+10 se aplicável)
- Tipo de contratação (comodato = margens maiores mas risco)
- Regime tributário da empresa vs tipo de contratação

**O que a IA NÃO tem:**
- Histórico de preços praticados
- Custos reais dos produtos
- Margem de lucro real
- Dados de concorrentes
- Histórico de participação do órgão

---

### Score Final no Profundo

**Quem calcula:** A IA calcula diretamente no JSON de resposta, usando os pesos instruídos no prompt.

**Pesos hardcoded no prompt (tools.py:7321-7322):**
```
técnico: 35%, documental: 15%, complexidade: 15%, jurídico: 20%, logístico: 5%, comercial: 10%
```

**Fórmula esperada:**
```
score_final = (técnico×0.35) + (documental×0.15) + (complexidade×0.15) + (jurídico×0.20) + (logístico×0.05) + (comercial×0.10)
```

**Fallback no backend (tools.py:7529):** Se a IA não retornar `score_final`, o backend calcula média simples:
```python
score_final = round(sum(scores_out.values()) / 6)
```

### Decisão GO/NO-GO no Profundo

**Hardcoded no prompt (tools.py:7300-7302):**
```
GO:      score_final >= 70 E score_tecnico >= 60 E score_juridico >= 60
NO-GO:   score_final < 40 OU score_tecnico < 30 OU score_juridico < 30 OU incompatibilidade de porte
AVALIAR: demais casos
```

---

## 3. MODO HÍBRIDO

**Arquivo:** `backend/app.py:8979-8991`

É uma **combinação sequencial**:

1. **Score rápido em TODOS** os editais → `tool_calcular_score_aderencia()`
2. **Ordena** por `score_tecnico` descendente
3. **Seleciona top N** (configurável, default 10)
4. **Score profundo nos top N** → `_calcular_score_profundo()`
5. **Retorna TODOS**: top N enriquecidos com 6 dimensões + restantes com score rápido

Para os editais no top N:
- `score_profundo` contém os 6 scores, decisão, justificativa, pontos positivos/atenção
- `score_tecnico` preserva o valor do score rápido (para ordenação consistente)

Para os editais fora do top N:
- Mantêm apenas `score_tecnico` do rápido + `score_comercial` do frontend
- `score_profundo` = null

---

## 4. PARÂMETROS NO BANCO vs HARDCODED

### Tabela `ParametroScore` (models.py:1748-1790)

| Campo no banco | Default | Usado no Rápido? | Usado no Profundo? | Observação |
|---|---|---|---|---|
| `peso_tecnico` | 0.25 (25%) | **NÃO** | **NÃO** | Prompt hardcoda 35% |
| `peso_comercial` | 0.15 (15%) | **NÃO** | **NÃO** | Prompt hardcoda 10% |
| `peso_participacao` | 0.05 (5%) | **NÃO** | **NÃO** | Dimensão NÃO existe no cálculo |
| `peso_ganho` | 0.10 (10%) | **NÃO** | **NÃO** | Dimensão NÃO existe no cálculo |
| `peso_documental` | 0.15 (15%) | N/A (não calcula) | **NÃO** | Prompt hardcoda 15% |
| `peso_complexidade` | 0.10 (10%) | N/A (não calcula) | **NÃO** | Prompt hardcoda 15% |
| `peso_juridico` | 0.10 (10%) | N/A (não calcula) | **NÃO** | Prompt hardcoda 20% |
| `peso_logistico` | 0.10 (10%) | N/A (não calcula) | **NÃO** | Prompt hardcoda 5% |
| `limiar_go` | 70.0 | **NÃO** | **NÃO** | Prompt hardcoda >= 70 |
| `limiar_nogo` | 40.0 | **NÃO** | **NÃO** | Prompt hardcoda < 40 |
| `margem_minima` | null | **NÃO** | **NÃO** | Não usado em nenhum lugar |
| `estados_atuacao` | null (JSON) | **SIM** (frontend) | **NÃO** | Usado no `calcularScoreComercial` do frontend |
| `tipos_edital` | null (JSON) | **NÃO** | **NÃO** | Não usado no score |
| `palavras_chave` | null (JSON) | **NÃO** | **NÃO** | Não usado no score |
| `ncms_busca` | null (JSON) | **NÃO** | **NÃO** | Não usado no score |

### Divergência de Pesos: Banco vs Prompt vs Workflow

| Dimensão | Banco (default) | Prompt (hardcoded) | Soma banco | Soma prompt |
|---|---|---|---|---|
| Técnico | 25% | **35%** | | |
| Comercial | 15% | **10%** | | |
| Participação | 5% | **N/A** | | |
| Ganho | 10% | **N/A** | | |
| Documental | 15% | **15%** ✓ | | |
| Complexidade | 10% | **15%** | | |
| Jurídico | 10% | **20%** | | |
| Logístico | 10% | **5%** | | |
| **TOTAL** | **100%** (8 dim) | **100%** (6 dim) | | |

**O banco tem 8 dimensões, o prompt tem 6.** As dimensões `participacao` e `ganho` existem no banco mas não são calculadas em nenhum lugar.

### Valores Hardcoded Completos

| O que | Onde | Valor hardcoded |
|---|---|---|
| Pesos das 6 dimensões | `PROMPT_SCORES_VALIDACAO` (tools.py:7321-7322) | 35/15/15/20/5/10 |
| Limiar GO | `PROMPT_SCORES_VALIDACAO` (tools.py:7300) | score_final >= 70, técnico >= 60, jurídico >= 60 |
| Limiar NO-GO | `PROMPT_SCORES_VALIDACAO` (tools.py:7301) | score_final < 40, técnico < 30, jurídico < 30 |
| Regras score rápido | `PROMPT_CALCULAR_SCORE_BATCH` (tools.py:3277-3279) | 80-100 PARTICIPAR, 50-79 AVALIAR, 0-49 NÃO PARTICIPAR |
| Score comercial (rápido) | `calcularScoreComercial` (CaptacaoPage.tsx:174-188) | Mesmo UF=100, Vizinho=60, Fora=20 |
| Score geral (rápido) | `normalizarEditalDaBusca` (CaptacaoPage.tsx:207) | Média simples (técnico + comercial) / 2 |
| UF_VIZINHOS | CaptacaoPage.tsx:144-172 | 27 estados com adjacências |
| Bônus porte ME/EPP | `PROMPT_SCORES_VALIDACAO` (tools.py:7295) | +10 no comercial |
| Objeto truncado (rápido) | `_score_batch` (tools.py:3299) | 300 chars |
| Objeto truncado (profundo) | `tool_calcular_scores_validacao` (tools.py:7462) | 600 chars |
| Specs enviadas (profundo) | tools.py:7420-7422 | Máximo 5 specs |
| Specs enviadas (rápido) | tools.py:3417-3420 | Máximo 3 specs (nomes apenas) |
| Batch size (rápido) | tools.py:3451 | 5 editais (ou 3 se > 50 produtos) |
| Workers paralelos (rápido) | tools.py:3454 | Máximo 4 |
| Workers paralelos (profundo) | app.py:8874 | Máximo 2 |
| Fallback score_final | tools.py:7529 | Média simples (sem pesos) |

---

## 5. O QUE DEVERIA SER PARAMETRIZÁVEL (conforme RF-018)

O requisito RF-018 diz:
> "6 dimensões configuráveis: Técnico, Documental, Complexidade, Jurídico, Logístico, Comercial.
> Peso de 0 a 100 para cada dimensão. Soma dos pesos = 100%."

### Para tornar parametrizável:

1. **Carregar pesos de `ParametroScore`** dentro de `tool_calcular_scores_validacao()` antes de montar o prompt
2. **Injetar os pesos no prompt** em vez dos hardcoded 35/15/15/20/5/10
3. **Carregar limiares** `limiar_go` e `limiar_nogo` do banco em vez de hardcodar 70 e 40
4. **Remover dimensões fantasma** do banco: `peso_participacao` e `peso_ganho` não são calculadas — ou remover do banco ou implementar o cálculo
5. **Alinhar defaults** do banco com os defaults do prompt (hoje divergem)
6. **Score comercial do rápido** (frontend): considerar usar os pesos do banco em vez da lógica UF fixa

### Defaults sugeridos (alinhados com o prompt atual):

| Dimensão | Default sugerido |
|---|---|
| peso_tecnico | 0.35 |
| peso_documental | 0.15 |
| peso_complexidade | 0.15 |
| peso_juridico | 0.20 |
| peso_logistico | 0.05 |
| peso_comercial | 0.10 |

---

## 6. LIMITAÇÕES DO CÁLCULO ATUAL

1. **100% subjetivo** — A IA "chuta" os scores com base em texto limitado (300-600 chars do objeto)
2. **Sem dados reais** — Não verifica documentação, não consulta mercado, não lê o PDF completo
3. **Não determinístico** — Mesmo com temperature=0, respostas podem variar
4. **Pesos ignorados** — Os pesos configurados na Parametrização não são usados pelo profundo
5. **Produto único** — Analisa apenas o "melhor match" do portfolio, não todos os produtos
6. **Sem produtos = score fictício** — Score profundo sem produtos usa "produto genérico" (sem base real). Score rápido retorna aviso e score 0
7. **Score rápido sem specs** — O batch envia só nome/categoria/fabricante, sem modelo nem specs
8. **Score comercial inconsistente** — No rápido é calculado no frontend (UF). No profundo é calculado pela IA (inclui margem, concorrência, volume)
9. **Fallback perigoso** — Se IA não retorna score_final, backend calcula média simples (sem pesos), divergindo do esperado
10. **Dimensões fantasma** — `peso_participacao` e `peso_ganho` existem no banco mas nunca são calculadas
