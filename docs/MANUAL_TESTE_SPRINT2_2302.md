# MANUAL DE TESTES — Sprint 2 (23/02/2026)

**Objetivo:** Validar cada um dos 37 requisitos funcionais (RF-001 a RF-037) implementados na Sprint 2.

**Pre-requisitos:**
- Backend rodando: `cd backend && python app.py` (porta 5007)
- Frontend rodando: `cd frontend && npm run dev` (porta 5175)
- Navegador aberto em `http://localhost:5175`

---

## PAGINA 1: EMPRESA (RF-001 a RF-005)

### RF-001 — Cadastro da Empresa
1. No menu lateral, clique em **"Empresa"**
2. Verifique que a pagina exibe formulario com:
   - Razao Social, Nome Fantasia, CNPJ, Inscricao Estadual
   - Website, Instagram, LinkedIn, Facebook
   - Endereco, Cidade, UF, CEP
   - Emails de Contato (lista dinamica com botao Adicionar)
   - Celulares/Telefones (lista dinamica com botao Adicionar)
3. Preencha os campos e clique **"Salvar Alteracoes"**
4. Recarregue a pagina — os dados devem persistir
- **Resultado esperado:** Formulario completo, dados salvam e persistem

### RF-002 — Documentos Habilitativos
1. Na secao **"Documentos da Empresa"**, clique em **"Upload Documento"**
2. No modal, selecione um tipo (ex: "Contrato Social"), anexe um PDF, defina validade
3. Clique **"Enviar"** — documento deve aparecer na tabela
4. Verifique as cores de status:
   - **Verde (ok)**: arquivo presente, validade > 30 dias
   - **Amarelo (vence)**: arquivo presente, validade <= 30 dias
   - **Vermelho (falta)**: sem arquivo
5. Clique no icone **Eye** para visualizar, **Download** para baixar
- **Resultado esperado:** Upload funciona, status calculado por vencimento, acoes funcionais

### RF-003 — Certidoes Automaticas
1. Na secao **"Certidoes Automaticas"**, verifique a tabela com:
   - Tipos: CND Federal, CND Estadual, CND Municipal, FGTS, Trabalhista
   - Colunas: Certidao, Status, Data Obtencao, Validade, Acoes
2. Clique em **"Buscar Certidoes via IA"** — deve enviar prompt ao chat
3. Verifique que o status mostra: Valida (verde), Vencida (vermelho), Pendente (amarelo)
4. Clique no icone **RefreshCw** de uma certidao — deve enviar prompt de atualizacao ao chat
- **Resultado esperado:** Botao habilitado, tipos mapeados, acoes conectadas ao chat

### RF-004 — Alertas IA sobre Documentos
1. Localize o card **"Alertas IA sobre Documentos"** (entre Informacoes Cadastrais e Documentos)
2. Quando vazio, deve mostrar placeholder convidando a clicar
3. Clique em **"Verificar Documentos"** — deve enviar prompt ao chat
4. O chat deve responder com analise dos documentos
- **Resultado esperado:** Card visivel, botao funcional, IA responde via chat

### RF-005 — Responsaveis da Empresa
1. Na secao **"Responsaveis"**, clique em **"Adicionar"**
2. No modal, verifique:
   - Dropdown **Tipo** com opcoes: Representante Legal, Preposto, Responsavel Tecnico
   - Campos: Nome (obrigatorio), Cargo, Email, Telefone
3. Preencha e salve — responsavel aparece na tabela com coluna "Tipo"
4. Clique no icone **Pencil** — modal abre pre-preenchido para edicao
5. Clique no icone **Trash2** — responsavel e removido
- **Resultado esperado:** CRUD completo com tipo, edicao e exclusao

---

## PAGINA 2: PORTFOLIO (RF-006 a RF-012)

### RF-006 — Fontes de Obtencao
1. No menu lateral, clique em **"Portfolio"**
2. Na aba **"Uploads"**, verifique 6 areas de upload:
   - Manuais e Fichas Tecnicas
   - Instrucoes de Uso / Bulas
   - Notas Fiscais de Compra/Venda
   - Plano de Contas (ERP)
   - Folders Comerciais
   - Website (URL)
3. Faca upload de um PDF — deve aparecer na lista de uploads
- **Resultado esperado:** 6 tipos de upload funcionais

### RF-007 — Registros ANVISA
1. Na aba **"Meus Produtos"**, selecione um produto
2. Clique em **"Buscar ANVISA"** — modal abre
3. Preencha numero de registro ou nome do produto
4. Clique **"Buscar via IA"** — deve enviar prompt ao chat
- **Resultado esperado:** Modal funcional com busca via IA

### RF-008 — Cadastro Manual
1. Na aba **"Cadastro Manual"**, verifique formulario com:
   - Nome do Produto (obrigatorio), Classe, Subclasse, NCM, Fabricante, Modelo
2. Preencha os campos e clique **"Cadastrar via IA"**
- **Resultado esperado:** Formulario completo com envio ao chat

### RF-009 — Mascara Parametrizavel por Classe
1. Na aba **"Cadastro Manual"**, selecione uma classe (ex: "Equipamento")
2. Verifique que campos de especificacao mudam conforme a classe:
   - Equipamento: Voltagem, Peso, Dimensoes, etc.
   - Reagente: Principio Ativo, Volume, Armazenamento, etc.
3. Teste as 9 categorias disponiveis (incluindo 5 novas: insumo_laboratorial, redes, mobiliario, eletronico, comodato)
- **Resultado esperado:** Specs dinamicas por classe, 9 categorias

### RF-010 — IA Le Manuais
1. Na aba **"Uploads"**, faca upload de um manual tecnico (PDF)
2. A IA deve processar o documento e extrair especificacoes
- **Resultado esperado:** Upload dispara processamento IA

### RF-011 — Funil de Monitoramento
1. Na aba **"Classificacao"**, role ate o card **"Funil de Monitoramento"**
2. Verifique 3 passos do funil:
   - **Monitoramento Continuo**: conta de monitoramentos ativos/cadastrados
   - **Filtro Inteligente**: tags das classes do backend (ou fallback hardcoded)
   - **Classificacao Automatica**: conta de classes
3. Verifique o StatusBadge: "Agente Ativo" (verde) se ha monitoramento ativo, "Agente Inativo" (cinza) se nao
4. Verifique "Ultima verificacao" com data real
- **Resultado esperado:** Dados reais carregados do backend, nao mais decorativo

### RF-012 — Importancia do NCM
1. Na aba **"Cadastro Manual"**, verifique campo NCM presente
2. Na aba **"Classificacao"**, verifique NCMs nas classes/subclasses
- **Resultado esperado:** NCM visivel em cadastro e classificacao

---

## PAGINA 3: PARAMETRIZACOES (RF-013 a RF-018)

### RF-013 — Classificacao/Agrupamento de Produtos
1. No menu lateral, clique em **"Parametrizacoes"**
2. Na aba **"Produtos"**, verifique arvore de classes:
   - Clique para expandir e ver subclasses
   - Clique em **"Nova Classe"** — preencha nome e NCMs
   - Clique em **Pencil** da subclasse — modal abre pre-preenchido
   - Clique em **Trash2** — item e removido
- **Resultado esperado:** CRUD completo de classes/subclasses

### RF-014 — Fontes de Busca
1. Na aba **"Fontes de Busca"**, verifique:
   - Tabela de fontes cadastradas (nome, tipo API/Scraper, URL, status)
   - Botao **"Cadastrar Fonte"** abre modal
   - Card **"Palavras-chave de Busca"** com tags editaveis
   - Card **"NCMs para Busca"** com NCMs editaveis
- **Resultado esperado:** Fontes, palavras-chave e NCMs gerenciaveis

### RF-015 — Estrutura de Classificacao em Parametrizacoes
1. Na aba **"Produtos"**, verifique a arvore completa
2. Crie uma classe, depois uma subclasse dentro dela
3. Edite a subclasse (botao Pencil) — verifique modal pre-preenchido
4. Exclua uma subclasse (botao Trash2)
- **Resultado esperado:** Persistencia via crudCreate/crudUpdate

### RF-016 — Parametrizacoes Comerciais
1. Na aba **"Comercial"**, verifique:
   - Grid de 27 estados brasileiros (clicaveis, mudam cor ao selecionar)
   - Card **"Tempo de Entrega"**: prazo maximo (input), frequencia maxima (select)
   - Card **"Mercado (TAM/SAM/SOM)"**: 3 campos editaveis
2. Edite TAM/SAM/SOM — verifique que aceita valores
3. Clique **"Salvar Mercado"** — verifique feedback
- **Resultado esperado:** UFs selecionaveis, campos editaveis com persistencia

### RF-017 — Tipos de Edital Desejados
1. Na aba **"Produtos"**, localize o card **"Tipos de Edital Desejados"**
2. Verifique 6 checkboxes:
   - Comodato de Equipamentos
   - Venda Direta
   - Aluguel
   - Consumo de Reagentes/Insumos
   - Insumos Laboratoriais
   - Insumos Hospitalares
3. Marque/desmarque os checkboxes
- **Resultado esperado:** 6 checkboxes funcionais

### RF-018 — Norteadores de Score
1. No topo da pagina, localize os 6 cards norteadores
2. Clique em cada um e verifique a acao:
   - **(a) Classificacao**: scroll para card "Estrutura de Classificacao"
   - **(b) Comercial**: muda para aba "Comercial"
   - **(c) Tipos Edital**: scroll para card "Tipos de Edital"
   - **(d) Tecnico**: tooltip "Configure na pagina Portfolio"
   - **(e) Participacao**: muda para aba "Comercial"
   - **(f) Ganho**: nenhuma acao (placeholder)
- **Resultado esperado:** 5 de 6 cards navegam para local correto

---

## PAGINA 4: CAPTACAO (RF-019 a RF-025)

### RF-019 — Painel de Oportunidades
1. No menu lateral, clique em **"Captacao"**
2. Verifique os StatCards no topo (contagem por prazo: 2, 5, 10, 20 dias)
3. Preencha o campo de busca e clique **"Buscar"**
4. Verifique a tabela com colunas: numero, orgao, UF, objeto, valor, dias restantes, score
5. Clique em uma linha — painel lateral abre
- **Resultado esperado:** Busca funciona, tabela exibe resultados com scores

### RF-020 — Painel Lateral de Analise
1. Com o painel lateral aberto, verifique:
   - ScoreCircle grande (score geral)
   - 3 sub-scores: Aderencia Tecnica, Aderencia Comercial, Recomendacao
   - Score comercial deve ser diferente do tecnico (calculado por UF)
   - Potencial de Ganho com badge colorida
- **Resultado esperado:** Score comercial calculado independentemente por proximidade de UF

### RF-021 — Filtros e Classificacao
1. Nos filtros de busca, verifique opcoes de Classificacao Origem:
   - Pregao Eletronico, Pregao Presencial, Concorrencia, etc.
   - **4 novas opcoes**: Centros de Pesquisas, Campanhas Governamentais, Fundacoes de Pesquisa, Fundacoes Diversas
2. Filtre por UF, fonte, NCM, tipo, origem
- **Resultado esperado:** Filtros completos com todas as opcoes

### RF-022 — Datas de Submissao
1. Verifique os 4 StatCards no topo:
   - Vermelho: editais com prazo <= 2 dias
   - Laranja: prazo <= 5 dias
   - Amarelo: prazo <= 10 dias
   - Azul: prazo <= 20 dias
- **Resultado esperado:** Contagem correta por prazo

### RF-023 — Intencao Estrategica
1. No painel lateral, verifique:
   - RadioGroup: Estrategico, Defensivo, Acompanhamento, Aprendizado
   - Slider de margem expectativa (0-50%)
   - Botoes "Varia por Produto" e "Varia por Regiao"
2. Selecione uma intencao e ajuste a margem
3. Clique **"Salvar Estrategia"**
- **Resultado esperado:** Intencao e margem salvas com feedback visual

### RF-024 — Analise de Gaps
1. No painel lateral, secao **"Analise de Gaps / Validacao"**:
   - Se o edital tem scores-validacao: mostra 6 dimensoes com badges, decisao GO/NO-GO, pontos positivos/atencao
   - Se nao: mostra gaps calculados localmente (tecnico insuficiente, regiao fora, etc.)
- **Resultado esperado:** Gaps carregados do backend ou calculados

### RF-025 — Monitoramento 24/7
1. Role ate o card **"Monitoramento Automatico"**
2. Clique em **"Novo Monitoramento"** — formulario inline aparece
3. Preencha: Termo (ex: "reagentes"), UFs (ex: "SP, RJ"), Frequencia (ex: "24h")
4. Clique **"Criar"** — envia prompt ao chat
5. Verifique a lista de monitoramentos:
   - StatusBadge Ativo/Inativo
   - Termo, UFs, editais encontrados, ultimo check
   - Botoes **"Pausar"** e **"Excluir"** por item
6. Clique **"Pausar"** — envia prompt ao chat
7. Clique **"Excluir"** — remove via crudDelete
- **Resultado esperado:** CRUD visual completo de monitoramentos

---

## PAGINA 5: VALIDACAO (RF-026 a RF-037)

### RF-026 — Sinais de Mercado
1. No menu lateral, clique em **"Validacao"**
2. Selecione um edital na tabela
3. Verifique badges de sinais no topo:
   - Badges laranjas/vermelhas com AlertTriangle (ex: "Direcionada", "Predatorio")
   - Badge de Fatal Flaws com XCircle
- **Resultado esperado:** Badges visiveis com sinais detectados

### RF-027 — Decisao (Participar/Acompanhar/Ignorar)
1. Clique em **"Participar"** (verde) — card de justificativa aparece
2. Selecione um motivo no dropdown (preco competitivo, portfolio aderente, etc.)
3. Escreva detalhes na textarea
4. Clique **"Salvar Justificativa"**
5. Badge "Decisao salva" aparece no topo
- **Resultado esperado:** 3 botoes + justificativa obrigatoria com persistencia

### RF-028 — Score Dashboard (6 Dimensoes)
1. Verifique o Score Dashboard a direita:
   - ScoreCircle grande (score geral)
   - Badge GO/NO-GO/CONDICIONAL (se calculado)
   - Potencial de Ganho
   - 6 ScoreBars: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial
2. Clique **"Calcular Scores IA"** — scores sao recalculados via API
- **Resultado esperado:** Dashboard completo com 6 dimensoes e botao de calculo

### RF-029 — 5 Abas de Analise
1. Verifique as 5 abas abaixo do dashboard:
   - **Aderencia** (Target icon)
   - **Documentos** (FolderOpen icon)
   - **Riscos** (AlertTriangle icon)
   - **Mercado** (BarChart icon)
   - **IA** (Sparkles icon)
2. Clique em cada aba — conteudo muda conforme descrito abaixo
- **Resultado esperado:** 5 abas com conteudo organizado

### RF-030 — Aderencia Trecho-a-Trecho
1. Na aba **"Riscos"**, localize a tabela de aderencia trecho-a-trecho
2. Verifique 3 colunas: Trecho Edital, Aderencia (%), Trecho Portfolio
- **Resultado esperado:** Tabela de comparacao lado-a-lado

### RF-031 — Analise de Lote
1. Na aba **"Aderencia"**, localize a secao de analise de lote
2. Verifique barra horizontal segmentada:
   - Segmentos verdes = itens aderentes
   - Segmentos amarelos = itens intrusos
   - Legenda abaixo com quantidades
- **Resultado esperado:** Barra visual com legenda

### RF-032 — Pipeline de Riscos
1. Na aba **"Riscos"**, verifique:
   - Secao com badges por severidade (critico/ajustavel/ok)
   - Modalidade, checklist, flags
- **Resultado esperado:** Pipeline visual com badges

### RF-033 — Reputacao do Orgao
1. Na aba **"Mercado"**, localize o card de reputacao
2. Verifique 3 itens: Pregoeiro, Pagamento, Historico
3. Cada item com StatusBadge (success/warning/error)
- **Resultado esperado:** Dados de reputacao com status visual

### RF-034 — Alerta de Recorrencia
1. Na aba **"Riscos"**, verifique se existe alerta de recorrencia
2. Se editais semelhantes foram perdidos 2+ vezes, deve mostrar alerta vermelho
- **Resultado esperado:** Alerta condicional quando ha recorrencia

### RF-035 — Aderencias/Riscos por Dimensao
1. Na aba **"Riscos"**, verifique as 6 dimensoes com badges:
   - Score < 30%: **Impeditivo** (vermelho)
   - Score 30-70%: **Ponto de Atencao** (amarelo)
   - Score > 70%: **Atendido** (verde)
- **Resultado esperado:** Badges por dimensao com classificacao por score

### RF-036 — Processo Amanda
1. Na aba **"Documentos"**, verifique 3 pastas coloridas:
   - **Azul**: Documentos da Empresa
   - **Amarelo**: Certidoes e Fiscal
   - **Verde**: Qualificacao Tecnica
2. Cada pasta lista documentos com status (Disponivel/Vencido/Faltante)
3. Botao **"Documentos Exigidos via IA"** envia prompt ao chat
- **Resultado esperado:** 3 pastas com documentos e status

### RF-037 — GO/NO-GO
1. No Score Dashboard, verifique a badge de decisao IA:
   - **GO** (verde): "GO - Participar"
   - **NO-GO** (vermelho): "NO-GO"
   - **CONDICIONAL** (amarelo): "ACOMPANHAR"
2. A badge aparece apos clicar **"Calcular Scores IA"**
- **Resultado esperado:** Recomendacao IA visivel apos calculo

---

## TESTES TRANSVERSAIS

### T1 — Integracao onSendToChat em todas as paginas
Verifique que cada pagina tem botoes que enviam prompts ao chat:
- **Empresa**: "Verificar Documentos", "Buscar Certidoes via IA", "Atualizar certidao"
- **Portfolio**: "Buscar ANVISA", "Verificar Completude", "Precos de Mercado"
- **Parametrizacoes**: (sem botoes IA diretos)
- **Captacao**: "Classificar Edital via IA", "Recomendar Preco", "Historico de Precos"
- **Validacao**: "Documentos Exigidos", "Buscar Precos", "Analisar Concorrentes", "Requisitos Tecnicos", "Classificar Edital", "Gerar Proposta"

### T2 — Responsividade
Verifique que as 5 paginas funcionam em tela cheia e em tela reduzida.

### T3 — Compilacao
```bash
cd frontend && npx tsc --noEmit   # zero erros
cd frontend && npx vite build     # compila em < 2s
```

---

## Checklist Resumido

| # | Teste | Pagina | OK? |
|---|-------|--------|-----|
| 1 | Cadastro empresa salva | Empresa | [ ] |
| 2 | Upload documento com vencimento | Empresa | [ ] |
| 3 | Buscar certidoes via IA | Empresa | [ ] |
| 4 | Alertas IA sobre documentos | Empresa | [ ] |
| 5 | CRUD responsaveis com tipo | Empresa | [ ] |
| 6 | 6 tipos de upload | Portfolio | [ ] |
| 7 | Modal ANVISA | Portfolio | [ ] |
| 8 | Cadastro manual completo | Portfolio | [ ] |
| 9 | Specs dinamicas por classe | Portfolio | [ ] |
| 10 | IA processa manuais | Portfolio | [ ] |
| 11 | Funil com dados reais | Portfolio | [ ] |
| 12 | NCM em cadastro | Portfolio | [ ] |
| 13 | CRUD classes/subclasses | Parametrizacoes | [ ] |
| 14 | Fontes + palavras-chave + NCMs | Parametrizacoes | [ ] |
| 15 | Arvore de classificacao | Parametrizacoes | [ ] |
| 16 | UFs + TAM/SAM/SOM | Parametrizacoes | [ ] |
| 17 | 6 checkboxes tipos edital | Parametrizacoes | [ ] |
| 18 | Norteadores clicaveis | Parametrizacoes | [ ] |
| 19 | Busca e tabela de editais | Captacao | [ ] |
| 20 | Painel lateral com 3 scores | Captacao | [ ] |
| 21 | Filtros completos | Captacao | [ ] |
| 22 | StatCards por prazo | Captacao | [ ] |
| 23 | Intencao + margem | Captacao | [ ] |
| 24 | Gaps reais/calculados | Captacao | [ ] |
| 25 | Monitoramento CRUD visual | Captacao | [ ] |
| 26 | Sinais de mercado | Validacao | [ ] |
| 27 | 3 botoes decisao + justificativa | Validacao | [ ] |
| 28 | Score Dashboard 6 dimensoes | Validacao | [ ] |
| 29 | 5 abas reorganizadas | Validacao | [ ] |
| 30 | Aderencia trecho-a-trecho | Validacao | [ ] |
| 31 | Analise de lote | Validacao | [ ] |
| 32 | Pipeline de riscos | Validacao | [ ] |
| 33 | Reputacao do orgao | Validacao | [ ] |
| 34 | Alerta de recorrencia | Validacao | [ ] |
| 35 | Badges Impeditivo/Atencao/Atendido | Validacao | [ ] |
| 36 | Processo Amanda 3 pastas | Validacao | [ ] |
| 37 | GO/NO-GO badge IA | Validacao | [ ] |
