# Roteiro de Validacao — Portfolio e Parametrizacoes

**Data:** 2026-03-12
**Requisitos cobertos:** RF-006 a RF-018 (Fundacao)
**Pre-requisito:** Backend rodando (`python3 backend/app.py`) + Frontend rodando (`cd frontend && npm run dev`)

---

## PARTE 1 — PORTFOLIO

### 1.1 Cadastro Manual de Produto (RF-008)

**Navegacao:** Menu lateral > `Portfolio` (icone mala)

1. Clique na aba **"Cadastro Manual"** (terceira aba)
2. Preencha os campos:
   - **Nome do Produto:** `Analisador Hematologico XN-1000`
   - **Classe:** selecione `Equipamentos`
   - **Subclasse:** selecione `Laboratorio`
   - **NCM:** `9027.30.11`
   - **Fabricante:** `Sysmex`
   - **Modelo:** `XN-1000`
3. Na secao **"Especificacoes Tecnicas — Equipamentos"** que aparece abaixo, preencha:
   - **Potencia:** `500W`
   - **Voltagem:** `220V`
   - **Peso:** `65kg`
4. Clique no botao **"Cadastrar via IA"** (botao azul com icone de estrela)
5. **Resultado esperado:** O produto deve ser criado e aparecer na aba "Meus Produtos"

**Segundo produto (para testar variedade):**
1. Volte a aba **"Cadastro Manual"**
2. Preencha:
   - **Nome do Produto:** `Kit Glicose Enzimática`
   - **Classe:** `Reagentes`
   - **NCM:** (deixe vazio — para testar alerta RF-012)
   - **Fabricante:** `Labtest`
   - **Modelo:** `REF 133`
3. Clique **"Cadastrar via IA"**

---

### 1.2 Pipeline de Produtos (RF-011)

**Navegacao:** Menu lateral > `Portfolio` > aba **"Meus Produtos"** (primeira aba)

1. **Verifique os contadores de pipeline** no topo da tabela:
   - Devem aparecer 4 cards coloridos: `Cadastrado` (cinza), `Qualificado` (azul), `Ofertado` (amarelo), `Vencedor` (verde)
   - Os dois produtos criados devem estar contados em "Cadastrado"

2. **Altere o status de um produto:**
   - Va ao menu lateral > `Cadastros` > `Portfolio` > **"Produtos"** (CRUD generico)
   - Localize o produto `Analisador Hematologico XN-1000`
   - Clique no icone de editar (lapis)
   - No campo **"Status Pipeline"**, mude de `Cadastrado` para `Qualificado`
   - Salve

3. **Volte a pagina Portfolio** (menu lateral > `Portfolio`)
   - **Resultado esperado:** O contador "Qualificado" deve mostrar 1, "Cadastrado" deve mostrar 1
   - Na tabela, a coluna "Status" deve exibir badge azul "Qualificado" no Analisador e badge cinza "Cadastrado" no Kit Glicose

---

### 1.3 Alerta de NCM Ausente (RF-012)

**Navegacao:** Menu lateral > `Portfolio` > aba **"Meus Produtos"**

1. **Resultado esperado:** Acima da tabela deve aparecer um aviso amarelo:
   - Icone de triangulo de alerta
   - Texto: **"1 produto(s) sem NCM cadastrado"** (referente ao Kit Glicose)

2. Na tabela, na coluna **"NCM"** da linha do Kit Glicose, deve aparecer um icone de triangulo amarelo (alerta)

3. **Corrija o NCM:**
   - Va ao CRUD: Menu lateral > `Cadastros` > `Portfolio` > **"Produtos"**
   - Edite o Kit Glicose, preencha NCM: `3822.00.90`
   - Salve

4. **Volte a pagina Portfolio** > aba "Meus Produtos"
   - **Resultado esperado:** O aviso amarelo deve desaparecer e o NCM deve aparecer na coluna

---

### 1.4 Campo ANVISA (RF-007)

**Navegacao:** Menu lateral > `Cadastros` > `Portfolio` > **"Produtos"** (CRUD generico)

1. Edite o produto `Analisador Hematologico XN-1000` (clique no icone lapis)
2. Localize os campos:
   - **Registro ANVISA:** preencha `80100300012`
   - **Status ANVISA:** selecione `Ativo`
3. Salve
4. **Resultado esperado:** Na listagem do CRUD, os campos devem estar preenchidos
5. Teste com status diferente: edite o Kit Glicose e coloque:
   - **Registro ANVISA:** `80200200045`
   - **Status ANVISA:** `Em Analise`
6. **Resultado esperado:** O campo deve aceitar e salvar corretamente

---

### 1.5 Especificacoes de Produto (RF-008)

**Navegacao:** Menu lateral > `Cadastros` > `Portfolio` > **"Especificacoes"**

1. Clique em **"Novo"** (botao azul com +)
2. Preencha:
   - **Produto:** selecione `Analisador Hematologico XN-1000`
   - **Nome Especificacao:** `Throughput`
   - **Valor:** `100`
   - **Unidade:** `testes/hora`
   - **Operador:** `>=`
3. Salve
4. Adicione outra especificacao:
   - **Produto:** mesmo
   - **Nome Especificacao:** `Volume de Amostra`
   - **Valor:** `20`
   - **Unidade:** `uL`
   - **Operador:** `<=`
   - **Valor Max:** `200`
5. **Resultado esperado:** Ambas especificacoes devem aparecer listadas e vinculadas ao produto

---

### 1.6 Documentos do Produto (RF-008)

**Navegacao:** Menu lateral > `Cadastros` > `Portfolio` > **"Documentos"**

1. Clique em **"Novo"**
2. Preencha:
   - **Produto:** selecione `Analisador Hematologico XN-1000`
   - **Tipo:** `Manual`
   - **Arquivo:** faca upload de um PDF qualquer
3. Salve
4. **Resultado esperado:** O documento deve aparecer listado e vinculado ao produto

---

### 1.7 Upload via Chat (RF-006 / RF-010)

**Navegacao:** Menu lateral > `Portfolio` > aba **"Uploads"**

1. Localize o card **"Manuais"** (icone de livro)
2. Clique no botao de upload e selecione um PDF de manual tecnico
3. **Resultado esperado:** O sistema deve enviar o arquivo ao chat com o prompt "Cadastre este produto a partir do manual" e a IA deve processar e sugerir o cadastro

4. Repita com o card **"NFS"** e um arquivo CSV/Excel
   - **Resultado esperado:** Chat recebe com prompt "Importe produtos a partir desta NFS"

---

### 1.8 Classificacao Hierarquica (RF-012 / RF-013)

**Navegacao:** Menu lateral > `Portfolio` > aba **"Classificacao"**

1. Visualize a arvore de classes:
   - Clique em uma classe para expandir e ver suas subclasses
   - Cada classe mostra o badge "NCM: {valor}" e contagem de produtos
   - Cada subclasse mostra NCM e contagem de produtos

2. **Verificar via CRUD direto:**
   - Menu lateral > `Cadastros` > `Portfolio` > **"Areas"**
     - Verifique que areas existem (ex: Diagnostico, Hospitalar)
   - Menu lateral > `Cadastros` > `Portfolio` > **"Classes"**
     - Verifique classes vinculadas a areas
   - Menu lateral > `Cadastros` > `Portfolio` > **"Subclasses"**
     - Verifique subclasses vinculadas a classes

---

## PARTE 2 — PARAMETRIZACOES

### 2.1 Estrutura de Classificacao de Produtos (RF-013)

**Navegacao:** Menu lateral > `Configuracoes` > **"Parametrizacoes"** > aba **"Produtos"**

**Criar uma classe:**
1. Na secao **"Estrutura de Classificacao"**, clique no botao **"Nova Classe"**
2. No modal, preencha:
   - **Nome:** `Hematologia`
   - **NCMs:** `9027.30`
3. Salve
4. **Resultado esperado:** A classe aparece na arvore

**Criar uma subclasse:**
1. Na classe recem-criada, clique no botao **"Adicionar Subclasse"** (icone +)
2. Preencha:
   - **Nome:** `Hemograma Completo`
   - **NCMs:** `9027.30.11`
3. Salve
4. **Resultado esperado:** A subclasse aparece aninhada dentro da classe

**Editar:**
1. Clique no icone de lapis na classe `Hematologia`
2. Altere o nome para `Hematologia Clinica`
3. Salve
4. **Resultado esperado:** O nome atualiza na arvore

**Excluir:**
1. Clique no icone de lixeira na subclasse `Hemograma Completo`
2. Confirme a exclusao
3. **Resultado esperado:** A subclasse desaparece

---

### 2.2 Tipos de Edital (RF-017)

**Navegacao:** Menu lateral > `Configuracoes` > **"Parametrizacoes"** > aba **"Produtos"**

1. Na secao **"Tipos de Edital Desejados"**, marque os checkboxes:
   - [x] Comodato de equipamentos
   - [x] Venda de equipamentos
   - [x] Aluguel com consumo de reagentes
   - [ ] Consumo de reagentes (deixe desmarcado)
   - [ ] Compra de insumos laboratoriais
   - [ ] Compra de insumos hospitalares
2. Clique no botao **"Salvar Tipos"**
3. **Resultado esperado:** Os tipos selecionados sao salvos. Recarregue a pagina (F5) e verifique que os 3 checkboxes permanecem marcados

---

### 2.3 Regiao de Atuacao (RF-016)

**Navegacao:** Menu lateral > `Configuracoes` > **"Parametrizacoes"** > aba **"Comercial"**

1. Na secao **"Regiao de Atuacao"** (icone mapa):
   - Se o checkbox **"Atuar em todo o Brasil"** estiver marcado, desmarque-o
   - Clique nos estados: **SP**, **RJ**, **MG**, **PR**, **SC**, **RS**
   - Os botoes selecionados devem ficar destacados
   - Abaixo deve aparecer: "Estados selecionados: SP, RJ, MG, PR, SC, RS"
2. Clique em **"Salvar Estados"**
3. **Resultado esperado:** Recarregue a pagina e verifique que os 6 estados permanecem selecionados

4. **Teste "Todo Brasil":**
   - Marque o checkbox **"Atuar em todo o Brasil"**
   - Todos os 27 estados devem ficar selecionados
   - Clique **"Salvar Estados"**

---

### 2.4 Tempo de Entrega (RF-016)

**Navegacao:** Mesma aba **"Comercial"**, secao **"Tempo de Entrega"**

1. Preencha:
   - **Prazo maximo aceito (dias):** `45`
   - **Frequencia maxima:** selecione `Mensal`
2. Clique em **"Salvar Prazo/Frequencia"**
3. **Resultado esperado:** Recarregue a pagina, os valores devem permanecer

---

### 2.5 Mercado TAM/SAM/SOM (RF-016)

**Navegacao:** Mesma aba **"Comercial"**, secao **"Mercado (TAM/SAM/SOM)"**

1. Preencha:
   - **TAM (Mercado Total):** `500000000` (R$ 500 milhoes)
   - **SAM (Mercado Alcancavel):** `150000000` (R$ 150 milhoes)
   - **SOM (Mercado Objetivo):** `30000000` (R$ 30 milhoes)
2. Clique em **"Salvar Mercado"**
3. **Resultado esperado:** Recarregue a pagina, os valores devem permanecer

---

### 2.6 Custos e Margens (RF-014)

**Navegacao:** Mesma aba **"Comercial"**, secao **"Custos e Margens"** (icone cifrao)

1. Preencha:
   - **Markup Padrao (%):** `30`
   - **Custos Fixos Mensais (R$):** `15000`
   - **Frete Base (R$):** `500`
2. Clique em **"Salvar Custos"**
3. **Resultado esperado:** Recarregue a pagina (F5) e verifique:
   - Markup deve mostrar `30`
   - Custos Fixos deve mostrar `15000`
   - Frete Base deve mostrar `500`

---

### 2.7 Pesos de Score — 6 Dimensoes + Operacionais (RF-018)

**Navegacao:** Mesma aba **"Comercial"**, secao **"Pesos de Score (6 Dimensoes + Operacionais)"**

1. Preencha os 8 campos (devem somar 1.00):

   | Campo | Valor | Descricao |
   |-------|-------|-----------|
   | **Peso Tecnico** | `0.25` | Aderencia tecnica do produto |
   | **Peso Documental** | `0.15` | Regularidade documental e certidoes |
   | **Peso Complexidade** | `0.10` | Complexidade tecnica do edital |
   | **Peso Juridico** | `0.10` | Risco juridico e clausulas restritivas |
   | **Peso Logistico** | `0.10` | Viabilidade logistica e prazo |
   | **Peso Comercial** | `0.15` | Viabilidade comercial e preco |
   | **Peso Participacao** | `0.05` | Historico de participacao |
   | **Peso Ganho** | `0.10` | Taxa de vitoria historica |

2. Verifique que abaixo dos campos aparece: **"Soma atual: 1.00"**
3. Clique em **"Salvar Pesos"**
4. **Resultado esperado:** Recarregue a pagina e verifique que todos os 8 valores persistem

5. **Teste de validacao:**
   - Mude Peso Tecnico para `0.50` (soma vai para 1.25)
   - A "Soma atual" deve mostrar `1.25` — o sistema deve permitir salvar mas o indicador visual alerta que nao soma 1.00

---

### 2.8 Fontes de Editais (RF-015)

**Navegacao:** Menu lateral > `Configuracoes` > **"Parametrizacoes"** > aba **"Fontes de Busca"**

1. Na secao **"Fontes de Editais"**, verifique que existem fontes pre-cadastradas:
   - **PNCP** (tipo: api, ativa)
   - **ComprasNet** (tipo: scraper)
   - **BEC-SP** (tipo: scraper)

2. **Cadastrar nova fonte:**
   - Clique em **"Cadastrar Fonte"**
   - Preencha:
     - **Nome:** `Portal de Compras RJ`
     - **Tipo:** `scraper`
     - **URL Base:** `https://www.compras.rj.gov.br`
   - Salve
   - **Resultado esperado:** A nova fonte aparece na lista

3. **Pausar/ativar fonte:**
   - Clique no icone de pause na fonte "Portal de Compras RJ"
   - **Resultado esperado:** O status muda para pausada/inativa

4. **Excluir fonte:**
   - Clique no icone de lixeira na fonte "Portal de Compras RJ"
   - Confirme
   - **Resultado esperado:** A fonte desaparece da lista

---

### 2.9 Palavras-chave de Busca (RF-015)

**Navegacao:** Mesma aba **"Fontes de Busca"**, secao **"Palavras-chave de Busca"**

1. Clique em **"+ Editar"** (ou no botao de edicao)
2. No campo que aparece, digite:
   - `microscopio, centrifuga, analisador hematologico, reagente diagnostico`
3. Clique em **"Salvar"**
4. **Resultado esperado:** As palavras-chave aparecem como tags individuais

---

### 2.10 NCMs para Busca (RF-015)

**Navegacao:** Mesma aba **"Fontes de Busca"**, secao **"NCMs para Busca"**

1. Clique em **"+ Adicionar NCM"** (ou botao de edicao)
2. Digite: `9027.30.11, 3822.00.90, 9018.19.10`
3. Clique em **"Salvar"**
4. **Resultado esperado:** Os NCMs aparecem como tags

---

## PARTE 3 — CAPTACAO (Filtro por Classe - RF-013)

### 3.1 Filtro por Classe de Produto

**Navegacao:** Menu lateral > **"Captacao"**

1. Primeiro, faca uma busca de editais:
   - Preencha o campo de busca com `reagente laboratorial`
   - Clique em **"Buscar Editais"**
   - Aguarde os resultados

2. Na secao de filtros avancados, localize o campo **"Classe de Produto (filtro local)"**
3. O dropdown deve conter:
   - `Todas as classes` (padrao)
   - As classes cadastradas no sistema (ex: Hematologia Clinica, se foi criada no teste 2.1)

4. Selecione uma classe
5. **Resultado esperado:** A tabela de editais e filtrada localmente, mostrando apenas editais vinculados a essa classe. Se nenhum edital tem classe associada, a lista fica vazia (comportamento esperado — a vinculacao e feita na Validacao)

---

## PARTE 4 — CRUD GENERICO (Verificacao Rapida)

### 4.1 Parametros de Score via CRUD

**Navegacao:** Menu lateral > `Cadastros` > `Parametros` > **"Parametros Score"**

1. Verifique que os campos existem na listagem/edicao:
   - peso_tecnico, peso_comercial, peso_participacao, peso_ganho
   - peso_documental, peso_complexidade, peso_juridico, peso_logistico
   - limiar_go, limiar_nogo, margem_minima
   - markup_padrao, custos_fixos, frete_base
2. **Resultado esperado:** Todos os 14 campos estao visiveis e editaveis

---

## CHECKLIST RESUMO

| # | Requisito | Teste | Resultado |
|---|-----------|-------|-----------|
| 1.1 | RF-008 | Cadastro manual de produto | [ ] PASS / [ ] FAIL |
| 1.2 | RF-011 | Pipeline de produtos (contadores + status) | [ ] PASS / [ ] FAIL |
| 1.3 | RF-012 | Alerta NCM ausente | [ ] PASS / [ ] FAIL |
| 1.4 | RF-007 | Campo ANVISA (registro + status) | [ ] PASS / [ ] FAIL |
| 1.5 | RF-008 | Especificacoes tecnicas do produto | [ ] PASS / [ ] FAIL |
| 1.6 | RF-008 | Documentos do produto (upload) | [ ] PASS / [ ] FAIL |
| 1.7 | RF-006/010 | Upload via chat (manuais, NFS) | [ ] PASS / [ ] FAIL |
| 1.8 | RF-012/013 | Classificacao hierarquica (areas/classes/subclasses) | [ ] PASS / [ ] FAIL |
| 2.1 | RF-013 | CRUD classes/subclasses em Parametrizacoes | [ ] PASS / [ ] FAIL |
| 2.2 | RF-017 | Tipos de edital (checkboxes) | [ ] PASS / [ ] FAIL |
| 2.3 | RF-016 | Regioes de atuacao (UFs) | [ ] PASS / [ ] FAIL |
| 2.4 | RF-016 | Tempo de entrega (prazo + frequencia) | [ ] PASS / [ ] FAIL |
| 2.5 | RF-016 | TAM/SAM/SOM | [ ] PASS / [ ] FAIL |
| 2.6 | RF-014 | Custos e margens (markup, fixos, frete) | [ ] PASS / [ ] FAIL |
| 2.7 | RF-018 | Pesos de score (8 dimensoes) | [ ] PASS / [ ] FAIL |
| 2.8 | RF-015 | Fontes de editais (CRUD + toggle) | [ ] PASS / [ ] FAIL |
| 2.9 | RF-015 | Palavras-chave de busca | [ ] PASS / [ ] FAIL |
| 2.10 | RF-015 | NCMs para busca | [ ] PASS / [ ] FAIL |
| 3.1 | RF-013 | Filtro por classe na Captacao | [ ] PASS / [ ] FAIL |
| 4.1 | RF-018/014 | CRUD generico parametros-score (14 campos) | [ ] PASS / [ ] FAIL |

**Total:** 20 testes
**Tempo estimado:** 30-45 minutos
