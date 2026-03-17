# MANUAL DE TESTE — CAPTACAO + VALIDACAO
**Data:** 16/03/2026 (atualizado Sprint 3)
**Objetivo:** Guia completo e didatico para testar as fases de Captacao e Validacao do sistema de editais, usando 3 editais reais de reagentes laboratoriais do PNCP.

---

## PRE-REQUISITOS

Antes de comecar, garanta que:

1. **Backend rodando** na porta 5007: `python3 backend/app.py`
2. **Frontend rodando** na porta 5175: `cd frontend && npm run dev`
3. **Empresa cadastrada** no sistema (menu lateral → Cadastros → Empresas)
4. **Pelo menos 1 produto** cadastrado no Portfolio (pode ser via upload de PDF ou manual)
5. **Metadados de captacao gerados** — ao cadastrar um produto, o sistema gera automaticamente codigos CATMAT e termos de busca semanticos em background. Voce pode verificar/reprocessar na secao "Metadados de Captacao" no detalhe do produto (Portfolio → clique no produto → secao colapsavel no final)
6. **Fontes configuradas** (menu lateral → Cadastros → Fontes) — pelo menos "PNCP" ativa
7. **Pesos e limiares configurados** — em Parametrizacoes → aba **Score**, verifique que os 6 pesos das dimensoes somam 1.00 e que os limiares GO/NO-GO estao adequados (defaults: GO >= 70, NO-GO < 40)
8. Estar logado no sistema

---

## PARTE 1 — CAPTACAO (Busca e Salvamento de Editais)

A Captacao e a primeira fase do workflow. Aqui voce busca editais no PNCP (e outras fontes), avalia os scores e salva os que interessam.

---

### PASSO 1: Acessar a tela de Captacao

1. No menu lateral esquerdo, clique em **"Captacao"**
2. A tela abre com o formulario de busca na parte superior

---

### PASSO 2: Configurar a busca

Preencha os campos do formulario:

| Campo | Valor para digitar | Por que |
|---|---|---|
| **Termo** | `microscopio` | Busca editais de microscopios (produto do portfolio) |
| **UF** | `Todas` (padrao) | Para nao restringir geograficamente |
| **Fonte** | `PNCP` | Fonte principal do governo federal |
| **Modalidade** | (deixe vazio) | Qualquer modalidade |
| **Periodo** | `30 dias` | Janela curta para encontrar editais abertos |
| **Incluir Encerrados** | **Desmarque** | Queremos apenas editais abertos |

> **DICA:** Use termos curtos e genericos que correspondam aos nomes dos seus produtos no portfolio. Termos muito especificos (ex: "reagentes hematologia hemominas") podem nao retornar resultados porque a API PNCP busca no texto do objeto. Bons exemplos: `microscopio`, `seringa descartavel`, `analisador bioquimico`, `luva nitrilo`.

---

### PASSO 3: Escolher o modo de Score

Abaixo do formulario, ha 4 opcoes de analise:

| Modo | O que faz | Quando usar |
|---|---|---|
| **Sem Score** | Busca sem analisar | So para ver o que existe |
| **Score Rapido** | Analise rapida (Tecnico + Comercial) | Triagem inicial, resultado em segundos |
| **Score Hibrido** | Rapido para todos + Profundo para os top N | **RECOMENDADO para teste** — equilibrio velocidade/qualidade |
| **Score Profundo** | Analise completa de 6 dimensoes para todos | Demorado, usar so com poucos editais |

> **NOVIDADE Sprint 3:** Quando o score esta ativado (Rapido, Hibrido ou Profundo), o sistema faz **buscas paralelas extras** no PNCP usando os termos semanticos e descricoes CATMAT dos seus produtos. Isso amplia a cobertura de editais encontrados automaticamente — voce nao precisa digitar todos os termos relevantes.

**Para este teste, selecione: "Score Hibrido"**

Se aparecer o campo "Qtd editais profundo", selecione **5** (analisa em profundidade os 5 melhores).

---

### PASSO 4: Executar a busca

1. Clique no botao **"Buscar"** (icone de lupa)
2. Aguarde — a busca leva ~15-30 segundos (score hibrido e mais demorado)
3. Os resultados aparecem na tabela abaixo do formulario

---

### PASSO 5: Entender os resultados

A tabela mostra as colunas:

| Coluna | O que significa |
|---|---|
| **Fonte** | De onde veio (PNCP, ComprasNet, etc.) — badge colorido |
| **Numero** | Numero oficial do edital |
| **Orgao** | Quem esta comprando (hospital, universidade, prefeitura) |
| **UF** | Estado |
| **Modalidade** | Pregao Eletronico, Dispensa, etc. |
| **Objeto** | Descricao resumida do que estao comprando |
| **Valor** | Valor estimado total |
| **Produto** | Se o sistema encontrou um produto do seu portfolio que combina |
| **Prazo** | Dias restantes (verde = ok, laranja = urgente, vermelho = critico) |
| **Score** | Circulo com nota 0-100 (clique para ver detalhes) |
| **Nivel Match** | Qualidade do matching com seu portfolio: exato, subclasse, classe ou generico |

---

### PASSO 6: Analisar um edital no painel lateral

1. Clique em qualquer linha da tabela
2. O **painel lateral direito** abre com todas as informacoes detalhadas:

**O que voce vera no painel:**

- **Dados do Edital**: Numero, orgao, UF, modalidade, valor, data de abertura, objeto completo
- **Score Geral**: Circulo grande com a nota (0-100)
- **Analise de Score**:
  - Se Hibrido/Profundo: 6 barras (Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial)
  - Decisao GO/NO-GO da IA com justificativa
  - Pontos positivos (verde) e pontos de atencao (amarelo)
- **Produto Correspondente**: Qual produto do seu portfolio combina
- **Potencial de Ganho**: Badge (Elevado/Medio/Baixo)
- **Itens do Edital**: Tabela com os itens que o PNCP retornou (descricao, quantidade, valor)
- **Intencao Estrategica**: Radio buttons para marcar como Estrategico/Defensivo/Acompanhamento/Aprendizado
- **Expectativa de Margem**: Slider de 0-50%

---

### PASSO 7: Salvar os 4 editais recomendados

Voce deve buscar e salvar **estes 4 editais** (ou similares que encontrar):

#### Edital 1: MCTI — Microscopio

| Campo | Valor |
|---|---|
| **Buscar por** | `microscopio` |
| **Fonte** | PNCP |
| **Score** | Hibrido |
| **Dias** | 30 |
| **Orgao** | MINISTERIO DA CIENCIA, TECNOLOGIA E INOVACAO |
| **Numero** | 90002/2026 |
| **UF** | MT |
| **Objeto** | Aquisicao de microscopio para laboratorio |
| **Valor estimado** | ~R$ 105.000 |
| **Encerramento** | 30/03/2026 |
| **Por que salvar** | Produto do portfolio (Microscopio Olympus CX23), match direto, valor medio, prazo aberto |

#### Edital 2: UNIOESTE — Seringa Descartavel

| Campo | Valor |
|---|---|
| **Buscar por** | `seringa descartavel` |
| **Fonte** | PNCP |
| **Score** | Hibrido |
| **Dias** | 30 |
| **Orgao** | UNIVERSIDADE ESTADUAL DO OESTE DO PARANA |
| **Numero** | 166/2026 |
| **UF** | PR |
| **Objeto** | Aquisicao de seringas descartaveis |
| **Valor estimado** | ~R$ 636.000 |
| **Encerramento** | 31/03/2026 |
| **Por que salvar** | Produto do portfolio (Seringa Descartavel BD), alto valor, universidade estadual |

#### Edital 3: Pres. Bernardes — Analisador Bioquimico

| Campo | Valor |
|---|---|
| **Buscar por** | `analisador bioquimico` |
| **Fonte** | PNCP |
| **Score** | Hibrido |
| **Dias** | 30 |
| **Orgao** | PREFEITURA MUNICIPAL DE PRESIDENTE BERNARDES |
| **Numero** | 28/2026 |
| **UF** | MG |
| **Objeto** | Aquisicao de analisador bioquimico para laboratorio municipal |
| **Valor estimado** | ~R$ 110.000 |
| **Encerramento** | 26/03/2026 |
| **Por que salvar** | Produto do portfolio (Analisador Bioquimico Mindray BS-230), match direto, prazo curto — bom para testar urgencia |

#### Edital 4: USP — Luva Nitrilo

| Campo | Valor |
|---|---|
| **Buscar por** | `luva nitrilo` |
| **Fonte** | PNCP |
| **Score** | Hibrido |
| **Dias** | 30 |
| **Orgao** | UNIVERSIDADE DE SAO PAULO |
| **Numero** | 267/2026 |
| **UF** | SP |
| **Objeto** | Aquisicao de luvas de procedimento nitrilo |
| **Valor estimado** | ~R$ 8.000 |
| **Encerramento** | 23/03/2026 |
| **Por que salvar** | Produto do portfolio (Luva Procedimento Nitrilo Supermax), valor baixo mas match exato, USP e referencia |

**Como salvar cada edital:**

1. Localize o edital na tabela de resultados
2. Clique na linha para abrir o painel lateral
3. No painel, defina a **Intencao Estrategica** (selecione "Estrategico")
4. Ajuste a **Expectativa de Margem** para 15%
5. Clique no botao **"Salvar Edital"** (parte inferior do painel)
6. Opcionalmente, clique em **"Salvar Estrategia"** para gravar a intencao + margem

> **ATALHO:** Apos buscar, voce pode clicar no botao **"Salvar Todos"** (no cabecalho do card de resultados) para salvar todos os editais de uma vez. Ou **"Salvar Score >= 70%"** para salvar apenas os que a IA recomendou.

---

### PASSO 8: Ver o edital no portal PNCP

1. Com o painel lateral aberto, clique no botao **"Abrir no Portal"**
2. Uma nova aba do navegador abrira com a pagina oficial do edital no PNCP
3. La voce pode baixar o PDF do edital, ver os anexos, etc.

---

### PASSO 9: Ir para Validacao

Apos salvar os editais, voce tem duas formas de ir para a Validacao:

- **Opcao A:** No painel lateral, clique no botao **"Ir para Validacao"**
- **Opcao B:** No menu lateral esquerdo, clique em **"Validacao"**

---

## PARTE 2 — VALIDACAO (Analise Aprofundada dos Editais Salvos)

A Validacao e onde voce analisa em profundidade cada edital salvo, decidindo se participa (GO) ou nao (NO-GO).

---

### PASSO 10: Acessar a tela de Validacao

1. Clique em **"Validacao"** no menu lateral
2. A tela mostra uma tabela com todos os editais que voce salvou na Captacao
3. Cada linha mostra: Numero, Orgao, UF, Objeto, Valor, Score, Status

---

### PASSO 11: Selecionar um edital para validar

1. Clique na linha do edital que deseja validar (ex: MCTI Microscopio 90002/2026)
2. O **dashboard de validacao** aparece abaixo da tabela, com:
   - Score geral (circulo grande)
   - Decisao da IA (badge GO/NO-GO/CONDICIONAL)
   - 6 barras de score por dimensao
   - Potencial de ganho
   - Pontos positivos e de atencao

---

### PASSO 12: Calcular os Scores de Validacao

> Os scores da Captacao sao uma primeira triagem. A Validacao recalcula com mais profundidade.

1. Clique no botao **"Calcular Scores IA"** (no dashboard)
2. Aguarde ~10-20 segundos
3. O sistema analisa o edital em 6 dimensoes, usando **pesos parametrizaveis** (configurados em Parametrizacoes → aba Score):

| Dimensao | Peso default | O que avalia | Exemplo |
|---|---|---|---|
| **Tecnico** | 35% | Seus produtos atendem as especificacoes? | "Portfolio tem Microscopio Olympus CX23 compativel" |
| **Documental** | 15% | Voce tem toda a documentacao exigida? | "Falta ART do responsavel tecnico" |
| **Complexidade** | 15% | Quao dificil e participar/executar? | "Entrega em 30 dias uteis — viavel" |
| **Juridico** | 20% | Ha riscos legais ou clausulas problematicas? | "Clausula de penalidade excessiva" |
| **Logistico** | 5% | Logistica de entrega e viavel? | "Entrega em MG — dentro da area de atuacao" |
| **Comercial** | 10% | O preco e competitivo? Margem e viavel? | "Valor referencia compativel com mercado" |

4. O **score_final** e **recalculado no backend** (nao confia no valor da IA) usando a formula:
   `score_final = Σ (score_dimensao × peso_dimensao)`

5. A **decisao GO/NO-GO** tambem e calculada no backend usando os limiares do banco:
   - **GO**: score_final >= limiar_go **E** score_tecnico >= limiar_tecnico_go **E** score_juridico >= limiar_juridico_go
   - **NO-GO**: score_final < limiar_nogo **OU** score_tecnico < limiar_tecnico_nogo **OU** score_juridico < limiar_juridico_nogo
   - **AVALIAR**: nos demais casos

6. Apos o calculo, observe:
   - **Score >= limiar_go (default 70)**: Bom candidato (barra verde)
   - **Score entre limiar_nogo e limiar_go**: Avaliar com cuidado (barra amarela)
   - **Score < limiar_nogo (default 40)**: Provavelmente nao vale (barra vermelha)

> **NOVIDADE Sprint 3:** O matching de produto usa 4 niveis hierarquicos: **exato** (nome/fabricante/modelo direto), **subclasse** (produto irmao na mesma subclasse), **classe** (produto primo na mesma classe), **generico** (fallback por termos). O nivel de match afeta a confianca do score tecnico.

---

### PASSO 13: Aba ADERENCIA — Analise tecnica detalhada

Esta aba e a principal para decidir se seu portfolio atende ao edital.

**O que voce encontra:**

1. **Sub-scores tecnicos**: Detalhamento do score tecnico com breakdown por criterio
2. **Aderencia trecho-a-trecho**: Tabela comparando trechos do edital com trechos do seu portfolio
   - Cada trecho tem um score de aderencia (0-100%)
   - Verde = atende, Amarelo = parcial, Vermelho = nao atende

**Acoes na aba:**
- Selecione a **Intencao Estrategica** (Estrategico/Defensivo/Acompanhamento/Aprendizado)
- Ajuste a **Expectativa de Margem** (slider 0-50%)

---

### PASSO 14: Aba LOTES — Gerenciamento de lotes do edital

Os lotes agrupam os itens do edital por especialidade (ex: todos os reagentes de hematologia ficam no Lote 01).

**Passo a passo:**

1. Clique na aba **"Lotes"**
2. Voce vera duas secoes:
   - **Itens do Edital**: Tabela com todos os itens importados do PNCP
   - **Lotes**: Cards com os lotes extraidos

3. **Se a secao de Itens estiver vazia:**
   - Os itens sao importados automaticamente do PNCP quando voce salva o edital
   - Se nao apareceram, volte a Captacao, abra o edital e salve novamente

4. **Para extrair os lotes via IA:**
   - Clique no botao **"Extrair Lotes via IA"**
   - O sistema le o texto do PDF do edital (que foi salvo quando voce clicou "Ver edital" na Captacao)
   - A IA (DeepSeek) analisa o texto e identifica:
     - Tipo de julgamento (por lote, por item, lote unico)
     - Quais itens pertencem a cada lote
     - Especialidade de cada lote (ex: "Hematologia", "Imunologia")
   - Aguarde ~15-30 segundos

5. **Apos a extracao, voce vera:**
   - Cards de lotes com:
     - Numero do lote (ex: "Lote 01")
     - Nome (ex: "Reagentes Hematologia")
     - Especialidade (badge azul)
     - Quantidade de itens
     - Valor estimado
     - Status (Rascunho/Configurado)
   - Dentro de cada card: tabela com os itens do lote

6. **Para reprocessar** (se os lotes nao ficaram corretos):
   - Clique no botao **"Reprocessar"**
   - O sistema apaga os lotes existentes e extrai novamente

> **IMPORTANTE:** Para que a extracao funcione, o PDF do edital precisa ter sido salvo. Volte a Captacao, abra o edital no painel lateral, clique em "Abrir no Portal" → na pagina do PNCP, clique em "Ver edital" ou "Baixar Edital" para que o sistema salve o texto do PDF.

**Exemplo pratico com o Edital MCTI Microscopio 90002/2026:**

| Lote | Especialidade | Itens | Descricao |
|---|---|---|---|
| Lote 01 | Equipamento Laboratorial | 1+ itens | Microscopio para laboratorio |

Os itens deste lote incluem microscopio(s) e acessorios conforme especificado no edital.

---

### PASSO 15: Aba DOCUMENTOS — Checklist documental

Esta aba mostra toda a documentacao necessaria para participar do edital.

**O que voce encontra:**

1. **Tres categorias de documentos:**
   - **Empresa** (azul): CNPJ atualizado, contrato social, procuracoes
   - **Certidoes e Fiscal** (amarelo): CND Federal, Estadual, Municipal, FGTS, Trabalhista
   - **Qualificacao Tecnica** (verde): ART, atestados de capacidade tecnica, registro no CRA/CREA

2. **Status de cada documento:**
   - ✅ **Ok** (verde): Documento valido e disponivel
   - ⚠️ **Vencido** (amarelo): Documento existe mas expirou
   - ❌ **Faltando** (vermelho): Documento nao encontrado

3. **Resumo de Completude:**
   - Barra de progresso com % (verde se 100%, amarelo se 70-99%, vermelho se <70%)
   - Contagem: X disponiveis, Y vencidos, Z faltantes

**Acoes:**
- Clique em **"Extrair Requisitos do Edital"** para que a IA leia o PDF e identifique os documentos especificos exigidos neste edital
- Clique em **"Documentos Exigidos via IA"** para perguntar a IA quais documentos sao necessarios

---

### PASSO 16: Aba RISCOS — Analise de riscos e alertas

Esta aba identifica riscos que podem inviabilizar sua participacao.

**O que voce encontra:**

1. **Pipeline de Riscos:**
   - Modalidade do edital
   - Flags de risco (ex: "Risco Preco Predatorio")
   - Prazo de faturamento

2. **Fatal Flaws** (Falhas fatais):
   - Problemas criticos que IMPEDEM a participacao
   - Aparecem em vermelho
   - Exemplos: "Nao possui registro ANVISA para o produto X", "Clausula exige experiencia de 5 anos na area"

3. **Flags Juridicos:**
   - Alertas sobre clausulas problematicas no edital
   - Exemplos: "Penalidade de 20% sobre valor do contrato", "Exigencia de capital social minimo R$ 500.000"

4. **Alerta de Recorrencia:**
   - Se voce ja perdeu editais semelhantes 2+ vezes, o sistema avisa

5. **Aderencia trecho-a-trecho:**
   - Mesma analise da aba Aderencia, mas focada em riscos

6. **Avaliacao por Dimensao:**
   - 6 cards com score e status:
     - Verde "Atendido" (>70%)
     - Amarelo "Ponto de Atencao" (30-70%)
     - Vermelho "Impeditivo" (<30%)

---

### PASSO 17: Aba MERCADO — Inteligencia de mercado

Esta aba ajuda a entender o contexto do orgao comprador e o historico de editais similares.

**O que voce encontra:**

1. **Reputacao do Orgao:**
   - **Pregoeiro**: Como e o pregoeiro deste orgao (rigoroso, flexivel)
   - **Pagamento**: Se o orgao paga em dia
   - **Historico**: Quantas vezes voce ja participou com este orgao

2. **Historico de Editais Semelhantes:**
   - Lista de editais anteriores do mesmo orgao
   - Para cada um mostra: numero, decisao (GO/NO-GO), score, objeto
   - Ajuda a entender o padrao de compra do orgao

**Acoes:**
- Clique em **"Buscar Precos"** para perguntar a IA sobre precos praticados em editais similares
- Clique em **"Analisar Concorrentes"** para perguntar a IA sobre concorrentes conhecidos neste segmento

---

### PASSO 18: Aba IA — Chat com a Inteligencia Artificial

Esta aba permite interagir diretamente com a IA para tirar duvidas sobre o edital.

**Funcionalidades:**

1. **Resumo Gerado pela IA:**
   - Clique em **"Gerar Resumo"** para que a IA faca um resumo executivo do edital
   - O resumo inclui: objeto, valor, prazos, principais exigencias, recomendacao

2. **Perguntas Livres:**
   - Digite qualquer pergunta no campo de texto (ex: "Quais sao os prazos de entrega?")
   - Clique em **"Perguntar"**
   - A IA responde com base no conteudo do edital

3. **Acoes Rapidas** (botoes pre-definidos):
   - **Requisitos Tecnicos**: Pergunta quais sao os requisitos tecnicos do edital
   - **Classificar Edital**: Pede a IA para classificar o tipo de edital
   - **Gerar Proposta**: Solicita um rascunho de proposta
   - **Baixar PDF do Edital**: Aciona o download do PDF
   - **Buscar Itens**: Importa os itens do PNCP

---

### PASSO 19: Tomar a decisao GO / NO-GO

Esta e a etapa mais importante da Validacao. Voce decide se vai participar do edital.

**Onde fica:** Na parte superior da tela, ao lado dos sinais de mercado, ha 3 botoes:

| Botao | Cor | Significado | Quando usar |
|---|---|---|---|
| **Participar** | Verde | **GO** — vamos participar | Score alto, portfolio aderente, documentacao ok, sem fatal flaws |
| **Acompanhar** | Azul | **CONDICIONAL** — vamos monitorar | Score medio, falta algum documento, margem apertada |
| **Ignorar** | Cinza | **NO-GO** — nao vamos participar | Score baixo, fatal flaws, sem portfolio, risco juridico |

**Como decidir:**

1. Clique em um dos 3 botoes
2. Um modal aparece pedindo:
   - **Motivo** (dropdown):
     - `preco_competitivo` — Temos preco competitivo
     - `portfolio_aderente` — Portfolio atende ao edital
     - `margem_insuficiente` — Margem muito baixa
     - `falta_documentacao` — Documentacao incompleta
     - `concorrente_forte` — Concorrente muito forte
     - `risco_juridico` — Risco juridico identificado
     - `fora_regiao` — Fora da nossa area de atuacao
     - `outro` — Outro motivo
   - **Detalhes** (texto livre): Justifique sua decisao

3. Clique em **"Confirmar"**
4. A decisao fica salva e aparece como badge na tabela de editais

**Criterios para decidir — guia pratico:**

| Criterio | GO | CONDICIONAL | NO-GO |
|---|---|---|---|
| Score Geral | >= limiar_go (default 70) | entre limiar_nogo e limiar_go | < limiar_nogo (default 40) |
| Score Tecnico | >= limiar_tecnico_go (default 60) | entre os limiares | < limiar_tecnico_nogo (default 30) |
| Score Juridico | >= limiar_juridico_go (default 60) | entre os limiares | < limiar_juridico_nogo (default 30) |
| Fatal Flaws | Nenhum | 0-1 contornaveis | 2+ ou 1 critico |
| Documentacao | >= 80% ok | 60-79% ok | < 60% ok |
| Aderencia Tecnica | >= 70% | 50-69% | < 50% |
| Margem esperada | >= 15% | 10-14% | < 10% |
| Prazo | > 5 dias | 3-5 dias | < 3 dias |

> **NOTA:** Todos os limiares acima sao **parametrizaveis** em Parametrizacoes → aba Score → card "Limiares de Decisao GO/NO-GO". Os valores default podem ser ajustados conforme a estrategia da empresa.

---

## PARTE 3 — FLUXO COMPLETO PASSO A PASSO (Exemplo com Microscopio MCTI 90002/2026)

Vamos fazer o fluxo completo com um edital real:

### 3.1 Captacao

1. Menu lateral → **Captacao**
2. Campo Termo: `microscopio`
3. Fonte: `PNCP`
4. Score: **Hibrido** (top 5)
5. Dias: **30**
6. Clique **Buscar**
7. Localize o edital "90002/2026 — MINISTERIO DA CIENCIA, TECNOLOGIA E INOVACAO"
8. Clique na linha → painel lateral abre
9. Observe:
   - Objeto: Aquisicao de microscopio para laboratorio
   - Valor: ~R$ 105.000
   - UF: MT
   - Score da IA (provavelmente >= 60 se voce tem Microscopio Olympus CX23 no portfolio)
   - Nivel Match: exato (match direto com produto do portfolio)
10. Selecione Intencao: **Estrategico**
11. Margem: **15%**
12. Clique **"Salvar Edital"**
13. Clique **"Salvar Estrategia"**
14. Clique **"Ir para Validacao"**

### 3.2 Validacao — Aderencia

1. O edital ja estara selecionado na tabela
2. Clique **"Calcular Scores IA"**
3. Aguarde o calculo (~15s)
4. Analise os 6 scores:
   - Tecnico >= 70? → Bom sinal (microscopio e match direto)
   - Documental >= 50? → Verificar documentos faltantes
   - Complexidade: medio e normal
   - Juridico >= 60? → Sem grandes riscos
   - Logistico >= 50? → Entrega viavel (verificar UF MT)
   - Comercial >= 60? → Preco competitivo

### 3.3 Validacao — Lotes

1. Clique na aba **"Lotes"**
2. Verifique se os itens aparecem na tabela
3. Clique **"Extrair Lotes via IA"**
4. Aguarde ~15-30s
5. Resultado esperado: 1 lote com microscopio(s)
6. Verifique que cada item aparece dentro do card do lote

### 3.4 Validacao — Documentos

1. Clique na aba **"Documentos"**
2. Verifique os 3 blocos (Empresa, Certidoes, Qualificacao)
3. Clique **"Extrair Requisitos do Edital"**
4. Veja quais documentos o PDF do edital exige especificamente
5. Anote os que estao faltando ou vencidos

### 3.5 Validacao — Riscos

1. Clique na aba **"Riscos"**
2. Verifique:
   - Ha Fatal Flaws? → Se sim, considere NO-GO
   - Ha Flags Juridicos? → Avalie a gravidade
   - Recorrencia? → Ja perdeu editais semelhantes?
3. Veja a avaliacao por dimensao:
   - Vermelho ("Impeditivo") em alguma? → Risco alto

### 3.6 Validacao — Mercado

1. Clique na aba **"Mercado"**
2. Verifique a reputacao do orgao (MCTI)
3. Veja o historico: ja participou de editais do MCTI antes?
4. Clique **"Buscar Precos"** → IA retorna precos praticados para microscopios
5. Clique **"Analisar Concorrentes"** → IA lista concorrentes (Nikon, Zeiss, Leica, etc.)

### 3.7 Validacao — IA

1. Clique na aba **"IA"**
2. Clique **"Gerar Resumo"** → IA faz resumo executivo
3. Pergunte: "Quais especificacoes tecnicas de microscopio sao exigidas?"
4. Pergunte: "Qual o prazo de entrega e as condicoes de pagamento?"
5. Use as acoes rapidas conforme necessidade

### 3.8 Decisao Final

Com base em tudo que analisou:

1. Score geral >= 70? ✅
2. Sem fatal flaws? ✅
3. Documentacao >= 80%? (Verificar)
4. Aderencia tecnica alta? ✅ (Microscopio Olympus CX23 no portfolio)
5. Margem >= 15%? (Verificar na Precificacao)

**Se tudo OK:** Clique **"Participar"** → Motivo: `portfolio_aderente` → Detalhes: "Portfolio possui Microscopio Olympus CX23 compativel, documentacao em dia, margem viavel"

**Se falta algo:** Clique **"Acompanhar"** → Motivo: `falta_documentacao` → Detalhes: "Falta registro ANVISA atualizado, resolver antes de 30/03"

**Se nao vale:** Clique **"Ignorar"** → Motivo: `margem_insuficiente` → Detalhes: "Valor referencia muito baixo, margem ficaria abaixo de 10%"

---

## PARTE 4 — REPETIR PARA OS OUTROS 3 EDITAIS

Repita os passos 10-19 para:

### Edital UNIOESTE — Seringa Descartavel (166/2026)
- **Busca na Captacao:** Termo = `seringa descartavel`, 30 dias
- **Particularidade:** Universidade estadual, alto valor (~R$ 636k), produto de consumo
- **Na aba Lotes:** Pode ter multiplos lotes por tipo/tamanho de seringa
- **Match esperado:** Seringa Descartavel BD do portfolio

### Edital Pres. Bernardes — Analisador Bioquimico (28/2026)
- **Busca na Captacao:** Termo = `analisador bioquimico`, 30 dias
- **Particularidade:** Prefeitura municipal em MG, valor ~R$ 110k, prazo curto (26/03)
- **Na aba Lotes:** Provavelmente lote unico com equipamento
- **Match esperado:** Analisador Bioquimico Mindray BS-230 do portfolio
- **Atencao:** Prazo curto — verificar viabilidade logistica

### Edital USP — Luva Nitrilo (267/2026)
- **Busca na Captacao:** Termo = `luva nitrilo`, 30 dias
- **Particularidade:** USP, valor baixo (~R$ 8k), produto de consumo
- **Na aba Lotes:** Verificar se ha separacao por tamanho (P/M/G)
- **Match esperado:** Luva Procedimento Nitrilo Supermax do portfolio
- **Atencao:** Valor baixo — margem pode ser insuficiente

---

## GLOSSARIO DE TERMOS

| Termo | Significado |
|---|---|
| **Captacao** | Fase de busca e identificacao de editais relevantes |
| **Validacao** | Fase de analise aprofundada para decidir GO/NO-GO |
| **Score** | Nota de 0-100 atribuida pela IA com base em multiplos criterios |
| **Score Final** | Media ponderada dos 6 scores dimensionais, calculada no backend com pesos do banco |
| **Aderencia** | Grau de compatibilidade entre seus produtos e o que o edital pede |
| **Lote** | Agrupamento de itens do edital por especialidade ou categoria |
| **Fatal Flaw** | Problema critico que impede a participacao (ex: falta registro ANVISA) |
| **GO** | Decisao de participar do edital |
| **NO-GO** | Decisao de nao participar |
| **AVALIAR** | Caso intermediario — nao atende criterios de GO nem de NO-GO |
| **CONDICIONAL** | Monitorar, mas nao decidir ainda (falta informacao) |
| **Intencao Estrategica** | Como voce classifica o edital no seu portfolio de oportunidades |
| **PNCP** | Portal Nacional de Contratacoes Publicas — fonte oficial de editais |
| **Pregao Eletronico** | Modalidade de licitacao mais comum, feita online |
| **Comodato** | Emprestimo de equipamento em troca de compra de reagentes |
| **NCM** | Nomenclatura Comum do Mercosul — codigo do produto para tributacao |
| **CATMAT** | Catalogo de Materiais do governo federal — codigos padrao para materiais em licitacoes. Buscados automaticamente na API dadosabertos.compras.gov.br |
| **CATSER** | Catalogo de Servicos do governo federal — codigos padrao para servicos em licitacoes |
| **Termos Semanticos** | Termos de busca gerados pela IA (DeepSeek) para cada produto, usados para ampliar a cobertura de editais encontrados |
| **Matching Hierarquico** | Algoritmo de 4 niveis para encontrar o melhor produto para um edital: exato → subclasse → classe → generico |
| **ParametroScore** | Tabela do banco com pesos das 6 dimensoes e limiares GO/NO-GO, editavel em Parametrizacoes → aba Score |

---

## RESUMO DO FLUXO

```
SETUP                             CAPTACAO                          VALIDACAO
─────                             ─────────                         ──────────
A. Cadastrar produtos             1. Buscar editais (termo, UF)     7. Selecionar edital salvo
B. Metadados gerados (CATMAT +    2. Escolher modo de score         8. Calcular scores IA
   termos semanticos) automatico  3. Buscas extras automaticas         (pesos/limiares do banco)
C. Configurar pesos/limiares         (termos CATMAT/semanticos)     9. Analisar aderencia
   em Parametrizacoes → Score     4. Analisar resultados           10. Extrair lotes via IA
                                  5. Abrir painel lateral          11. Verificar documentacao
                                  6. Salvar editais relevantes     12. Avaliar riscos
                                           │                       13. Consultar mercado
                                           └──→ Ir para Validacao  14. Usar chat IA
                                                                   15. Decidir GO / NO-GO
                                                                            │
                                                                            ↓
                                                                      PRECIFICACAO
                                                                      (proxima fase)
```

---

## CHECKLIST RAPIDO

- [ ] Backend rodando (porta 5007)
- [ ] Frontend rodando (porta 5175)
- [ ] Empresa cadastrada
- [ ] Pelo menos 1 produto no portfolio
- [ ] Metadados de captacao gerados (CATMAT + termos semanticos) — verificar no detalhe do produto
- [ ] Pesos e limiares configurados (Parametrizacoes → aba Score, soma dos pesos = 1.00)
- [ ] Buscar com Score Hibrido
- [ ] Salvar 3 editais de reagentes
- [ ] Calcular scores de validacao para cada um
- [ ] Verificar que score_final e decisao vem do backend (nao da IA)
- [ ] Extrair lotes via IA para cada um
- [ ] Verificar documentacao
- [ ] Analisar riscos e fatal flaws
- [ ] Consultar mercado e historico
- [ ] Gerar resumo via IA
- [ ] Decidir GO/NO-GO para cada edital
- [ ] Justificar cada decisao com motivo + detalhes
- [ ] (Opcional) Alterar pesos/limiares em Parametrizacoes e verificar que os scores mudam
