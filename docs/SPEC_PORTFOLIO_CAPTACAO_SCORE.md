# FACILICITA.IA — Spec Técnica para o Claude Code
## Refatoração: Portfólio · Captação · Aderência · Score

**Versão 1.0 · Março 2026 · Confidencial**

---

## 0. Contexto e Escopo da Refatoração

Este documento instrui alterações cirúrgicas em três módulos do sistema já implementado. Nada deve ser reescrito do zero — apenas os pontos listados abaixo devem ser alterados, removidos ou acrescentados.

### 0.1 Módulos afetados

| Módulo | O que muda | Arquivos impactados (referência) |
|---|---|---|
| **Cadastro do Portfólio** | Busca automática de CATMAT/CATSER + geração de termos de busca semânticos via IA | `models.py` · `tools.py` (cadastro) · frontend produto |
| **Captação de Editais** | Pré-filtro passa a usar termos semânticos + CATMAT como sinal auxiliar. Remove dependência de keywords hardcoded. | `tools.py` (`CATEGORY_SYNONYMS` e pré-filtro camada 1) |
| **Score de Aderência** | Elimina modos rápido/híbrido/profundo. Score único usa pesos da tabela `ParametroScore`. Remove pesos hardcoded. Análise spec-a-spec real. | `tools.py` · `app.py` · `CaptacaoPage.tsx` · `ParametroScore` defaults |

> ⚠️ **Premissa:** Os três módulos são alterados nesta ordem. O Portfólio vem primeiro porque Captação e Score dependem dos dados que ele vai gerar.

---

## 1. Módulo: Cadastro do Portfólio

### 1.1 Problema atual

- O cadastro recebe nome, fabricante, modelo, categoria e até 5 specs — mas nenhum metadado de classificação governamental.
- O pré-filtro da captação usa `CATEGORY_SYNONYMS` hardcoded — uma lista estática que não evolui com o portfólio do cliente.
- Nenhum conjunto de termos de busca é gerado a partir das specs reais do produto.

---

### 1.2 O que deve ser adicionado

#### 1.2.1 Novos campos no modelo Produto (`models.py`)

Adicionar os seguintes campos à tabela `Produto`:

| Campo | Tipo | Descrição |
|---|---|---|
| `catmat_codigos` | JSON / Text | Lista de códigos CATMAT mapeados ao produto. Ex: `["495268", "495269"]`. Pode ter mais de um pois o mesmo produto aparece em múltiplos códigos. |
| `catser_codigos` | JSON / Text | Lista de códigos CATSER (para produtos/serviços). Mesma lógica do CATMAT. |
| `catmat_descricoes` | JSON / Text | Descrições oficiais dos códigos CATMAT encontrados. Usadas para enriquecer o contexto da IA na análise. |
| `termos_busca` | JSON / Text | Lista de termos semânticos gerados pela IA a partir das specs do produto. São as palavras usadas na varredura de editais. |
| `termos_busca_updated_at` | DateTime | Timestamp da última geração dos termos. Permite reprocessamento periódico. |
| `catmat_updated_at` | DateTime | Timestamp da última busca CATMAT/CATSER. |

> **Migration:** Criar migration Alembic com `ALTER TABLE`. Campos nullable com default `NULL` para não quebrar registros existentes.

---

#### 1.2.2 Busca automática de CATMAT/CATSER

Ao salvar ou atualizar um produto, o sistema deve disparar (assincronamente, em background) a busca de códigos CATMAT/CATSER. Esta busca **NÃO** deve bloquear o retorno da API ao frontend.

**Endpoint da API oficial — Material:**
```
GET https://dadosabertos.compras.gov.br/modulo-material-servico/1_consultarMaterial
    ?codigoItemMaterial=&descricaoItemMaterial={TERMO}&pagina=1&tamanhoPagina=20
```

**Endpoint da API oficial — Serviço:**
```
GET https://dadosabertos.compras.gov.br/modulo-material-servico/1_consultarServico
    ?codigoItemServico=&descricaoItemServico={TERMO}&pagina=1&tamanhoPagina=20
```

**Endpoint alternativo PNCP (itens licitados com CATMAT, para validação cruzada):**
```
GET https://pncp.gov.br/api/pncp/v1/itens-compra?codigoItem={CODIGO}&pagina=1
```

**Lógica da busca:**
- Extrair termos-chave do nome do produto + categoria + specs mais relevantes
- Consultar a API de material com cada termo
- Filtrar resultados com similaridade semântica >= 0.75 (usar IA para ranquear ou `difflib`)
- Gravar os top 5 códigos CATMAT com suas descrições nos campos `catmat_codigos` e `catmat_descricoes`
- Repetir o processo para CATSER se o produto for serviço ou tiver componente de serviço
- Se a API retornar erro ou timeout: gravar `catmat_codigos=[]` e logar, não bloquear o cadastro

> O CATMAT é metadado auxiliar — sua ausência nunca impede o produto de ser usado na captação ou análise.

---

#### 1.2.3 Geração de termos de busca semânticos via IA

Imediatamente após a busca CATMAT (ou em paralelo), disparar chamada à IA para gerar os `termos_busca` do produto.

**Adicionar no `tools.py` como constante `PROMPT_GERAR_TERMOS_BUSCA`:**

```
Você é um especialista em licitações públicas brasileiras.
Dado o seguinte produto cadastrado em um portfólio empresarial:
  Nome: {nome}
  Categoria: {categoria}
  Fabricante: {fabricante}
  Modelo: {modelo}
  Especificações: {specs_formatadas}
  Códigos CATMAT encontrados: {catmat_codigos}
  Descrições CATMAT: {catmat_descricoes}

Gere uma lista de termos de busca que um agente de IA deve usar para
identificar editais de licitação que demandem este produto ou similar.
Os termos devem cobrir:
  - Sinônimos e variações de nomenclatura do produto
  - Termos técnicos presentes nas especificações
  - Termos que órgãos públicos tipicamente usam para descrever este produto
  - Abreviações e siglas comuns
  - Termos relacionados que indicam necessidade deste produto

Retorne APENAS um JSON válido, sem texto adicional:
{"termos": ["termo1", "termo2", ...]}
Máximo 30 termos. Mínimo 8 termos.
```

Processar a resposta e gravar em `termos_busca` como JSON array.

---

#### 1.2.4 Reprocessamento

Adicionar endpoint admin:
```
POST /api/produtos/{id}/reprocessar-metadados
```
Que dispara novamente a busca CATMAT e geração de termos para um produto específico. Útil quando o cadastro do produto é atualizado.

Adicionar também endpoint batch para reprocessar todos os produtos sem termos:
```
POST /api/admin/reprocessar-todos-metadados
```

---

### 1.3 O que NÃO deve ser alterado no cadastro

- A estrutura de specs (campos dinâmicos) permanece igual
- O fluxo de leitura de manuais pela IA permanece igual
- O frontend de cadastro permanece igual, exceto pela exibição dos novos campos (ver 1.4)

---

### 1.4 Exibição no frontend (produto cadastrado)

Na tela de visualização do produto, adicionar seção colapsável **"Metadados de Captação"** mostrando:
- Códigos CATMAT encontrados (badges clicáveis que abrem a URL oficial)
- Códigos CATSER encontrados (idem)
- Lista dos termos de busca gerados
- Data da última atualização dos metadados
- Botão "Reprocessar Metadados" que chama o endpoint 1.2.4

> Esta seção é informativa. O usuário não edita esses campos manualmente — são gerados automaticamente.

---

## 2. Módulo: Captação de Editais

### 2.1 Problema atual

- O pré-filtro (Camada 1) usa `CATEGORY_SYNONYMS` — um dicionário estático hardcoded que não reflete o portfólio real do cliente.
- Não usa os termos semânticos gerados das specs dos produtos.
- Não usa CATMAT como sinal auxiliar — ignora completamente os metadados que existem em parte dos editais.
- Resultado: captação imprecisa — perde editais relevantes com nomenclaturas diferentes e passa editais irrelevantes que compartilham keywords genéricas.

---

### 2.2 O que deve ser alterado

#### 2.2.1 Remover CATEGORY_SYNONYMS do pré-filtro

Localizar `CATEGORY_SYNONYMS` em `tools.py`. Remover seu uso na lógica de pré-filtro da Camada 1. A constante pode ser mantida no arquivo por ora mas não deve ser consultada no pipeline de captação.

---

#### 2.2.2 Nova lógica do pré-filtro (Camada 1)

Substituir a lógica atual pelo seguinte algoritmo:

```python
def _edital_e_relevante(edital, produtos_do_usuario):
    objeto = normalizar(edital.objeto)  # lowercase, remove acentos

    for produto in produtos_do_usuario:
        # Sinal 1: CATMAT — se edital tem código e produto tem código
        if edital.catmat_codigo and produto.catmat_codigos:
            if edital.catmat_codigo in produto.catmat_codigos:
                return True, produto, 'catmat_match'

        # Sinal 2: termos semânticos gerados da spec do produto
        if produto.termos_busca:
            for termo in produto.termos_busca:
                if termo.lower() in objeto:
                    return True, produto, 'termo_semantico'

        # Sinal 3: fallback — nome e fabricante do produto
        tokens = tokenizar(produto.nome + ' ' + produto.fabricante)
        for token in tokens:
            if len(token) > 3 and token in objeto:
                return True, produto, 'nome_fabricante'

    return False, None, None
```

O retorno inclui qual produto gerou o match e qual sinal disparou — isso alimenta o score de aderência posterior com contexto de pré-seleção.

---

#### 2.2.3 Prioridade dos sinais

| Prioridade | Sinal | Condição | Confiança |
|---|---|---|---|
| **1** | CATMAT match | `edital.catmat_codigo IN produto.catmat_codigos` | Alta — código exato bate |
| **2** | Termo semântico | Qualquer termo de `produto.termos_busca` presente no objeto | Média-alta — gerado das specs reais |
| **3** | Nome/fabricante | Token do nome ou fabricante presente no objeto | Média — fallback genérico |

> Editais sem CATMAT estruturado (maioria dos municipais) passam pelos sinais 2 e 3 normalmente. A ausência de CATMAT **nunca** elimina um edital do pré-filtro.

---

#### 2.2.4 O que fazer com editais que são só PDF

Para editais onde o PNCP retorna apenas o PDF sem itens estruturados:
- O pré-filtro roda apenas sobre o campo `objeto` do edital (que o PNCP sempre retorna)
- Se passar no pré-filtro, o edital vai para a análise de aderência onde o agente abre o PDF e extrai as specs
- Não há necessidade de lógica especial no pré-filtro para este caso

---

### 2.3 O que NÃO deve ser alterado na captação

- A estrutura de chamadas às APIs do PNCP e ComprasNet permanece igual
- O paralelismo com `ThreadPoolExecutor` permanece igual
- A deduplicação de editais permanece igual
- O pipeline de 3 camadas permanece — só a lógica interna da Camada 1 muda

---

## 3. Módulo: Score de Aderência

O sistema atual tem três modos de score (rápido, híbrido, profundo) com comportamentos inconsistentes, pesos hardcoded que ignoram a tabela `ParametroScore` e análise técnica baseada em 600 caracteres do objeto. Tudo isso será unificado.

---

### 3.1 O que deve ser REMOVIDO

| O que remover | Localização atual |
|---|---|
| Modo Rápido como opção separada | `tool_calcular_score_aderencia()` · `tools.py:3390-3523` |
| Modo Híbrido como opção separada | `app.py:8979-8991` · lógica de top N |
| Score comercial calculado no frontend | `CaptacaoPage.tsx:174-188` · `calcularScoreComercial()` |
| Score geral como média simples `(técnico+comercial)/2` | `CaptacaoPage.tsx:207` · `normalizarEditalDaBusca()` |
| Pesos hardcoded `35/15/15/20/5/10` no prompt | `PROMPT_SCORES_VALIDACAO` · `tools.py:7321-7322` |
| Limiares GO/NO-GO hardcoded no prompt | `tools.py:7300-7302` · `70/40/60/30` hardcoded |
| Objeto truncado em 300 chars no batch | `tools.py:3299` · `_score_batch()` |
| Fallback `score_final` como média simples sem pesos | `tools.py:7529` |
| Análise de apenas 1 produto (melhor match) | `tools.py:7360-7416` |
| Batch de 3-5 editais com produtos sem specs | `tools.py:3451` · envia só nome/categoria/fabricante |
| Dimensões fantasma `peso_participacao` e `peso_ganho` | `ParametroScore` · `models.py:1748-1790` |
| `UF_VIZINHOS` hardcoded no frontend | `CaptacaoPage.tsx:144-172` |

---

### 3.2 O que deve ser CORRIGIDO na tabela ParametroScore

Remover os campos fantasma e alinhar defaults:

| Campo | Default atual | Novo default | Ação |
|---|---|---|---|
| `peso_tecnico` | 0.25 | **0.35** | Corrigir default. É o peso mais importante. |
| `peso_documental` | 0.15 | 0.15 | Manter. Já correto. |
| `peso_complexidade` | 0.10 | **0.15** | Corrigir default. |
| `peso_juridico` | 0.10 | **0.20** | Corrigir default. Risco jurídico é crítico. |
| `peso_logistico` | 0.10 | **0.05** | Corrigir default. |
| `peso_comercial` | 0.15 | **0.10** | Corrigir default. |
| ~~`peso_participacao`~~ | 0.05 | — | **REMOVER** campo do modelo e da tabela. Dimensão não calculada. |
| ~~`peso_ganho`~~ | 0.10 | — | **REMOVER** campo do modelo e da tabela. Dimensão não calculada. |
| `limiar_go` | 70.0 | 70.0 | Manter. Passar a ser lido do banco — não hardcoded no prompt. |
| `limiar_nogo` | 40.0 | 40.0 | Manter. Passar a ser lido do banco — não hardcoded no prompt. |
| `estados_atuacao` | null | null | Manter. Agora usado no backend, não no frontend. |

> **Migration:** remover colunas `peso_participacao` e `peso_ganho`, atualizar defaults dos demais pesos.

---

### 3.3 Score único unificado — nova arquitetura

Substituir os três modos por um único pipeline com dois estágios internos: **pré-filtro semântico** (sem IA, rápido) e **análise profunda** (com IA, completa). O usuário não escolhe mais o modo — o sistema sempre faz a análise completa para os editais que passam no pré-filtro.

---

#### 3.3.1 Estágio 1 — Pré-filtro semântico (sem IA)

Este estágio substitui a Camada 1 do score rápido atual. Descarta rapidamente editais claramente irrelevantes antes de gastar tokens de IA.

```python
def pre_filtro_score(edital, produtos) -> (bool, produto_candidato, sinal):
    # Idêntico à lógica de captação (seção 2.2.2)
    # Reutilizar a mesma função _edital_e_relevante()
    # Retorna False → score_tecnico=0, decisao='NO-GO', skip IA
    # Retorna True  → passa para Estágio 2 com produto_candidato
```

> Reutilizar exatamente a mesma função do pré-filtro de captação. **Uma função, dois usos. Não duplicar lógica.**

---

#### 3.3.2 Estágio 2 — Análise profunda com IA

Para cada edital que passou no Estágio 1, executar análise completa. Mudanças em relação ao profundo atual:

- Carregar pesos de `ParametroScore.{peso_tecnico, peso_documental, peso_complexidade, peso_juridico, peso_logistico, peso_comercial}` do banco antes de montar o prompt
- Carregar `limiar_go` e `limiar_nogo` do banco
- Injetar os pesos e limiares no prompt dinamicamente — **nunca hardcoded**
- Analisar **todos** os produtos candidatos do portfólio que passaram no pré-filtro, não apenas o melhor match
- Enviar specs completas de cada produto candidato — não truncar em 5 specs
- Enviar o objeto do edital sem truncar em 600 chars (limite mais alto: 2000 chars)
- Se o edital tem PDF disponível: extrair texto das primeiras 3 páginas e incluir como contexto adicional
- Incluir `estados_atuacao` da empresa no contexto para score logístico
- Incluir `catmat_codigos` dos produtos candidatos no contexto

---

#### 3.3.3 Hierarquia de matching na análise

| Nível | Critério | Score técnico esperado | Ação |
|---|---|---|---|
| **1. Produto exato** | Produto do portfólio corresponde diretamente ao item do edital | 90–100 | Análise completa com todas as specs |
| **2. Subclasse** | Produto similar na mesma subclasse CATMAT ou categoria | 70–89 | Análise com identificação de gaps spec-a-spec |
| **3. Classe** | Produto relacionado na mesma classe CATMAT ou segmento | 50–69 | Análise indicando distância técnica e gaps |
| **4. Fora do escopo** | Nenhum produto minimamente relacionado | 0–49 → NO-GO automático | Não consome IA — descartado no pré-filtro |

---

#### 3.3.4 Novo prompt da análise (`PROMPT_ANALISE_ADERENCIA`)

Substituir `PROMPT_SCORES_VALIDACAO` pelo seguinte template. Os valores entre `{}` são injetados pelo backend em tempo de execução:

```
Você é um especialista em licitações públicas brasileiras e análise técnica de propostas.

EDITAL:
  Número: {numero_edital}
  Órgão: {orgao}
  Objeto completo: {objeto_edital}
  Valor estimado: R$ {valor_estimado}
  Modalidade: {modalidade}
  UF do órgão: {uf_edital}
  Data de abertura: {data_abertura}
  Códigos CATMAT do edital: {catmat_edital}
  Trecho do edital (PDF): {texto_pdf}

EMPRESA PARTICIPANTE:
  Razão social: {razao_social}
  Porte: {porte}
  Regime tributário: {regime_tributario}
  UF sede: {uf_empresa}
  Estados de atuação: {estados_atuacao}

PRODUTOS CANDIDATOS DO PORTFÓLIO:
{lista_produtos_candidatos}
  (Para cada produto: nome, fabricante, modelo, CATMAT, todas as specs)

TAREFA:
Analise a aderência de cada produto candidato ao edital.
Para o produto com maior aderência, calcule as 6 dimensões abaixo (0-100 cada).

DIMENSÕES E PESOS CONFIGURADOS:
  Técnico:      {peso_tecnico_pct}%  — aderência spec-a-spec ao edital
  Documental:   {peso_documental_pct}%  — viabilidade de obter documentação exigida
  Complexidade: {peso_complexidade_pct}%  — simplicidade do edital (inverso da complexidade)
  Jurídico:     {peso_juridico_pct}%  — ausência de riscos legais e cláusulas abusivas
  Logístico:    {peso_logistico_pct}%  — viabilidade de entrega considerando estados de atuação
  Comercial:    {peso_comercial_pct}%  — atratividade de margem e volume

REGRAS DE DECISÃO:
  GO:     score_final >= {limiar_go} E score_tecnico >= 60 E score_juridico >= 60
  NO-GO:  score_final < {limiar_nogo} OU score_tecnico < 30 OU score_juridico < 30
  AVALIAR: demais casos
  Bônus ME/EPP: se empresa é ME/EPP e edital é exclusivo ME/EPP → +10 no score_comercial
  NO-GO automático: se empresa é Médio/Grande e edital é exclusivo ME/EPP

ANÁLISE DE GAPS:
Para score_tecnico entre 70 e 99, liste EXATAMENTE quais specs do edital
o produto não atende, e o que seria necessário para atingir 100%.

Retorne APENAS JSON válido:
{
  "produto_selecionado": "nome do produto com maior aderência",
  "nivel_match": "exato|subclasse|classe",
  "score_tecnico": 0-100,
  "score_documental": 0-100,
  "score_complexidade": 0-100,
  "score_juridico": 0-100,
  "score_logistico": 0-100,
  "score_comercial": 0-100,
  "score_final": (média ponderada pelos pesos acima),
  "decisao": "GO|AVALIAR|NO-GO",
  "justificativa": "2-3 frases",
  "gaps_tecnicos": ["gap1", "gap2"],
  "pontos_positivos": ["p1", "p2"],
  "pontos_atencao": ["a1", "a2"]
}
```

---

#### 3.3.5 Cálculo do score_final no backend (não na IA)

Após receber o JSON da IA, o backend deve **recalcular** o `score_final` usando os pesos do banco — não confiar no valor retornado pela IA:

```python
def calcular_score_final(scores: dict, params: ParametroScore) -> float:
    return round(
        scores['score_tecnico']      * params.peso_tecnico +
        scores['score_documental']   * params.peso_documental +
        scores['score_complexidade'] * params.peso_complexidade +
        scores['score_juridico']     * params.peso_juridico +
        scores['score_logistico']    * params.peso_logistico +
        scores['score_comercial']    * params.peso_comercial,
        1
    )
```

> Isso garante que os pesos configurados pelo usuário na tela de Parametrização sempre se reflitam no score final, independente do que a IA calculou.

---

#### 3.3.6 Decisão GO/NO-GO no backend

A decisão também deve ser recalculada no backend usando os limiares do banco:

```python
def calcular_decisao(scores, score_final, params, porte_empresa, exclusivo_mepp):
    # NO-GO automático por porte
    if porte_empresa in ['Médio', 'Grande'] and exclusivo_mepp:
        return 'NO-GO'
    # NO-GO por score
    if (score_final < params.limiar_nogo
        or scores['score_tecnico'] < 30
        or scores['score_juridico'] < 30):
        return 'NO-GO'
    # GO
    if (score_final >= params.limiar_go
        and scores['score_tecnico'] >= 60
        and scores['score_juridico'] >= 60):
        return 'GO'
    return 'AVALIAR'
```

---

### 3.4 Paralelismo

- Manter `ThreadPoolExecutor` para processar múltiplos editais em paralelo
- Máximo **3 workers** (antes eram 4 no rápido e 2 no profundo — unificar em 3)
- Timeout por edital: **180s** (antes eram 120s no rápido)
- Se um edital falhar: logar erro, gravar `score_tecnico=0`, `decisao='ERRO'`, continuar os demais

---

### 3.5 O que o frontend deve exibir

- **Remover** o seletor de modo (Rápido / Híbrido / Profundo) da UI
- **Remover** a função `calcularScoreComercial()` e `UF_VIZINHOS`
- **Remover** o cálculo `scoreGeral = (técnico + comercial) / 2`
- Exibir sempre as **6 dimensões** retornadas pelo backend
- Exibir `nivel_match` (Produto Exato / Subclasse / Classe) como badge no card do edital
- Exibir `gaps_tecnicos` quando `score_tecnico` entre 70 e 99
- O score exibido é sempre o `score_final` calculado pelo backend

---

## 4. Ordem de Implementação Recomendada

| Passo | O que fazer | Detalhes | Dependência |
|---|---|---|---|
| **1** | Migration do banco | Adicionar campos ao Produto (`catmat_codigos`, `catmat_descricoes`, `catser_codigos`, `termos_busca`, `_updated_at`). Remover `peso_participacao` e `peso_ganho`. Atualizar defaults do `ParametroScore`. | Nenhuma |
| **2** | Busca CATMAT/CATSER no cadastro | Implementar a função de busca nas APIs de `compras.gov.br` + gravação dos campos novos. Adicionar endpoint de reprocessamento. | Passo 1 |
| **3** | Geração de termos de busca | Implementar `PROMPT_GERAR_TERMOS_BUSCA` e gravação no campo `termos_busca`. Rodar reprocessamento em todos os produtos existentes. | Passo 2 |
| **4** | Novo pré-filtro de captação | Substituir lógica `CATEGORY_SYNONYMS` pela função `_edital_e_relevante()` que usa `termos_busca` + CATMAT. | Passo 3 |
| **5** | Score unificado — backend | Remover `tool_calcular_score_aderencia` (rápido). Refatorar `tool_calcular_scores_validacao` para carregar pesos do banco, analisar todos candidatos, novo prompt. Calcular `score_final` e decisão no backend. | Passo 4 |
| **6** | Score unificado — frontend | Remover seletor de modo, `calcularScoreComercial`, `UF_VIZINHOS`, `scoreGeral` simples. Exibir 6 dimensões + `nivel_match` + gaps do backend. | Passo 5 |
| **7** | Testes e validação | Testar com 3-5 editais reais conhecidos. Verificar se scores fazem sentido. Verificar se pesos da UI de Parametrização se refletem no `score_final`. | Passo 6 |

---

## 5. O Que NÃO Deve Ser Alterado

- Estrutura de specs dinâmicas do produto (campos parametrizáveis por classe)
- Pipeline de chamadas às APIs do PNCP e ComprasNet (URLs, autenticação, paginação)
- Deduplicação de editais
- Tabela `Analise` e seus campos existentes (apenas adicionar `nivel_match` e `gaps_tecnicos`)
- Lógica de gestão de contratos ganhos (módulo separado, não afetado)
- Módulo de certidões e documentos (não afetado)
- Autenticação e multi-tenancy
- Tela de Parametrização — apenas corrigir os defaults conforme seção 3.2

---

*FACILICITA.IA · Spec Técnica v1.0 · Março 2026 · Confidencial*
