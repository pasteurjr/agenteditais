# Como o Score funciona

## 3 modos de score

| Modo | O que faz |
|---|---|
| **Sem Score** | Busca pura, sem análise |
| **Rápido** | 1 score único (score_tecnico) via DeepSeek — compara objeto do edital vs produtos do portfolio |
| **Híbrido** | Rápido em TODOS + Profundo (6 dimensões) nos top N |
| **Profundo** | 6 dimensões para todos (ou top N) |

---

## Score Rápido — `tool_calcular_score_aderencia`

Pipeline de 3 camadas:

### Camada 1: Pré-filtro por keywords (sem IA, <100ms)
- Constrói índice de keywords dos seus produtos: nome tokenizado, fabricante, modelo, categoria (com sinônimos), specs
- Compara o **objeto** de cada edital contra esse índice
- Se nenhuma keyword bate → score 0 + "NÃO PARTICIPAR" (nem manda pra IA)
- Se qualquer keyword bate → passa para a Camada 2

### Camada 2: Score batch via DeepSeek
- Agrupa editais em batches de 3-5
- Envia para DeepSeek-chat um prompt com:
  - Lista dos seus produtos (nome, categoria, fabricante)
  - Lista dos editais do batch (número, órgão, objeto truncado em 300 chars)
- A IA retorna para cada edital:
  - `score_tecnico` (0-100)
  - `recomendacao` (PARTICIPAR / AVALIAR / NÃO PARTICIPAR)
  - `produto_principal` (qual produto combina)
  - `justificativa` (frase curta)

### Regras do score rápido:
- 80-100 → PARTICIPAR
- 50-79 → AVALIAR
- 0-49 → NÃO PARTICIPAR

No frontend, o score rápido gera também um `score_comercial` calculado localmente com base na UF do edital vs estados de atuação da empresa. O score geral exibido = média(técnico + comercial).

---

## Score Profundo — `tool_calcular_scores_validacao`

Chamado pelo modo Híbrido (top N) ou Profundo (todos). Para **cada edital individualmente**:

### Dados de entrada enviados à IA:
- Edital: número, órgão, objeto (600 chars), valor, modalidade, UF, data
- Produto: o melhor match do portfolio (matched por tokens do nome, fabricante, modelo, categoria vs objeto do edital)
- Empresa: razão social, CNPJ, porte (ME/EPP/Médio/Grande), regime tributário, UF, cidade

### 6 dimensões calculadas pela IA (0-100 cada):

| Dimensão | O que avalia | Peso |
|---|---|---|
| **Técnico** | Produto atende aos requisitos técnicos do objeto? | **35%** |
| **Documental** | Documentação exigida é fácil de obter? | **15%** |
| **Complexidade** | Edital é simples ou restritivo? (inverso: simples=100) | **15%** |
| **Jurídico** | Há riscos legais, cláusulas abusivas, direcionamento? | **20%** |
| **Logístico** | Entrega é viável (distância, instalação, suporte)? | **5%** |
| **Comercial** | Margem, concorrência, volume são atrativos? | **10%** |

### Score final
Média ponderada com os pesos acima (35/15/15/20/5/10).

### Decisão GO/NO-GO:
- **GO**: score_final >= 70 E técnico >= 60 E jurídico >= 60
- **NO-GO**: score_final < 40 OU técnico < 30 OU jurídico < 30 OU incompatibilidade de porte
- **AVALIAR**: demais casos

### Regra especial de porte:
- Se empresa é ME/EPP e edital é exclusivo ME/EPP → +10 no comercial
- Se empresa é Médio/Grande e edital é exclusivo ME/EPP → NO-GO automático

### A IA também retorna:
- `pontos_positivos`: lista de pontos favoráveis
- `pontos_atencao`: lista de riscos
- `justificativa`: 2-3 frases explicando a decisão
