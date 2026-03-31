# Roteiro de Teste — Formularios de Configuracao

Data: 2026-03-12

Este documento cobre os testes de todos os 3 formularios de configuracao do sistema e todas as suas abas/secoes.

---

## 1. Parametrizacoes

### 1.1 Aba Comercial

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 1.1.1 | Regiao de Atuacao — selecionar estados | Clicar em 3-5 estados no grid (ex: SP, RJ, MG) | Estados ficam destacados, resumo mostra "SP, RJ, MG" |
| 1.1.2 | Regiao de Atuacao — Todo Brasil | Marcar checkbox "Atuar em todo o Brasil" | Todos 27 estados selecionados, botoes individuais desabilitados |
| 1.1.3 | Regiao de Atuacao — salvar | Clicar "Salvar Estados" | Botao mostra "Salvando...", apos sucesso volta ao normal. Recarregar pagina: estados persistem |
| 1.1.4 | Tempo de Entrega | Preencher "Prazo maximo aceito" = 30, "Frequencia maxima" = Quinzenal. Clicar "Salvar Prazo/Frequencia" | Valores persistem apos reload |
| 1.1.5 | Mercado TAM/SAM/SOM | Preencher valores em R$ nos 3 campos. Salvar | Valores persistem apos reload |
| 1.1.6 | Custos e Margens | Preencher Markup Padrao = 30, Custos Fixos = 15000, Frete Base = 500. Salvar | Valores persistem apos reload |
| 1.1.7 | Modalidades de Licitacao | Verificar que checkboxes sao carregadas da tabela ModalidadeLicitacao (banco). Selecionar 2-3 modalidades. Salvar | Modalidades selecionadas persistem. Se nenhuma cadastrada, mostra link "Cadastrar Modalidades" |
| 1.1.8 | Pesos de Score | Alterar pesos (8 campos). Verificar "Soma atual" atualiza em tempo real. Salvar | Soma mostra valor correto. Valores persistem apos reload |
| 1.1.9 | Norteadores — Classificacao | Clicar no norteador (a) | Navega para CRUD de classes-produto-v2 |
| 1.1.10 | Norteadores — scroll | Clicar norteadores (b), (c), (e) | Pagina faz scroll suave ate o card correspondente (Regiao, Modalidades, Custos) |
| 1.1.11 | Norteadores — Portfolio hint | Clicar norteador (d) "Score Tecnico" | Mostra tooltip "Configure na pagina Portfolio" por 3 segundos |
| 1.1.12 | Score Aderencia de Ganho | Preencher Taxa de Vitoria, Margem Media, Total Licitacoes | Valores salvos via updateParamPeso |

### 1.2 Aba Fontes de Busca

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 1.2.1 | Lista de fontes read-only | Abrir aba "Fontes de Busca" | Lista mostra fontes cadastradas com nome, tipo (API/SCRAPER) e status (Ativa/Inativa) |
| 1.2.2 | Toggle fonte ativa/inativa | Clicar botao play/pause em uma fonte | Status alterna. Fonte e atualizada no banco |
| 1.2.3 | Gerenciar Fontes | Clicar botao "Gerenciar Fontes" | Navega para CRUD fontes-editais (pagina completa de CRUD) |
| 1.2.4 | Palavras-chave — visualizar | Verificar que tags de palavras-chave sao exibidas | Tags mostram palavras-chave salvas ou "Nenhuma palavra-chave cadastrada" |
| 1.2.5 | Palavras-chave — editar | Clicar "+ Editar". Digitar palavras separadas por virgula. Salvar | Palavras persistem como tags. Reload confirma |
| 1.2.6 | NCMs para Busca | Clicar "+ Adicionar NCM". Digitar NCMs separados por virgula (ex: 9011.10.00, 8421.19.10). Salvar | NCMs aparecem como tags. Texto informativo sobre uso no PNCP visivel |

### 1.3 Aba Notificacoes

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 1.3.1 | Email de notificacao | Alterar email. Salvar | Email persiste apos reload |
| 1.3.2 | Canais de notificacao | Marcar/desmarcar Email, Sistema, SMS | Checkboxes refletem selecao |
| 1.3.3 | Frequencia do resumo | Selecionar "Imediato", "Diario" ou "Semanal" | Valor selecionado persiste |
| 1.3.4 | Feedback visual | Salvar configuracoes | Badge "Salvo!" aparece por 3 segundos |

### 1.4 Aba Preferencias

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 1.4.1 | Tema | Selecionar "Escuro" ou "Claro" via radio buttons | Selecao visivel |
| 1.4.2 | Idioma | Selecionar entre Portugues, English, Espanol | Valor selecionado |
| 1.4.3 | Fuso horario | Selecionar fuso horario | Valor selecionado |
| 1.4.4 | Salvar preferencias | Clicar Salvar | Badge "Salvo!" aparece por 3 segundos. Valores persistem |

---

## 2. Portfolio de Produtos

### 2.1 Aba Meus Produtos

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 2.1.1 | Lista de produtos | Abrir Portfolio, aba "Meus Produtos" | Tabela mostra produtos com colunas: Nome, Fabricante, SKU, Subclasse, Status, Acoes |
| 2.1.2 | Busca/filtro | Digitar texto na busca | Tabela filtra produtos pelo texto |
| 2.1.3 | Editar produto | Clicar botao editar em um produto | Modal de edicao abre com dados preenchidos |
| 2.1.4 | Excluir produto | Clicar excluir, confirmar | Produto removido da lista |
| 2.1.5 | Ver especificacoes | Expandir/clicar em produto | Especificacoes tecnicas visiveis |

### 2.2 Aba Uploads

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 2.2.1 | Upload de arquivo | Clicar na area de upload ou arrastar arquivo (PDF/imagem) | Arquivo enviado ao backend. Progresso visivel |
| 2.2.2 | Processamento por IA | Apos upload, IA extrai dados do documento | Produto criado com nome, fabricante, specs extraidas |
| 2.2.3 | Selecionar subclasse no upload | Selecionar subclasse antes do upload | IA usa campos_mascara da subclasse para direcionar extracao |
| 2.2.4 | Historico de uploads | Ver lista de uploads anteriores | Uploads mostram status (processado/erro/pendente) |

### 2.3 Aba Cadastro Manual

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 2.3.1 | Formulario basico | Preencher Nome, Fabricante, Modelo, SKU | Campos aceitam texto |
| 2.3.2 | Selecao de subclasse | Selecionar subclasse no dropdown | Campos de especificacao mudam conforme a mascara (campos_mascara) da subclasse |
| 2.3.3 | Campos tipados | Ao selecionar subclasse com mascara enriquecida | Campos mostram tipo correto: texto (TextInput), numero/decimal (TextInput type=number), select (SelectInput com opcoes), boolean (SelectInput Sim/Nao) |
| 2.3.4 | Unidades | Campos com unidade definida na mascara | Placeholder mostra unidade (ex: "RPM", "mL") |
| 2.3.5 | Salvar produto manual | Preencher todos os campos obrigatorios. Clicar "Cadastrar" | Produto criado com sucesso. Specs incluem tipo e unidade |
| 2.3.6 | Cadastro por IA (chat) | Clicar "Cadastrar por IA" | Mensagem enviada ao chat com formato: `Cadastre manualmente o produto: Nome="X", SubclasseId="uuid". Especificacoes: campo=valor[unidade]{tipo}` |
| 2.3.7 | Busca ANVISA | Clicar "Buscar ANVISA" no modal. Digitar nome/registro | Mensagem enviada ao chat: `busque anvisa [termo]`. Backend busca via web search em consultas.anvisa.gov.br |
| 2.3.8 | Busca Web | Clicar "Buscar na Web" no modal. Digitar termo | Mensagem enviada ao chat: `busque na web [termo]`. Backend executa web search e retorna resultados |

### 2.4 Aba Classificacao

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 2.4.1 | Arvore de classes | Abrir aba "Classificacao" | Arvore hierarquica: Classes > Subclasses. Mostra contagem de produtos por classe/subclasse |
| 2.4.2 | Expandir/colapsar | Clicar em classe | Subclasses expandem/colapsam |
| 2.4.3 | Mascara de campos | Ver subclasse com campos_mascara | Campos da mascara exibidos (nome, tipo, unidade) |

---

## 3. Empresa

### 3.1 Informacoes Cadastrais

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 3.1.1 | Dados basicos | Preencher Razao Social, Nome Fantasia, CNPJ, Inscricao Estadual, Telefone | Campos aceitam texto. CNPJ com formato correto |
| 3.1.2 | Presenca digital | Preencher Website, LinkedIn | URLs aceitas |
| 3.1.3 | Endereco | Preencher CEP, Logradouro, Numero, Complemento, Bairro, Cidade, UF | Campos de endereco completo |
| 3.1.4 | Emails multiplos | Adicionar emails via campo + botao "Adicionar". Remover com X | Lista de emails gerenciavel |
| 3.1.5 | Celulares multiplos | Adicionar telefones via campo + botao "Adicionar". Remover com X | Lista de celulares gerenciavel |
| 3.1.6 | Salvar alteracoes | Clicar "Salvar Alteracoes" | Dados persistem apos reload. Botao mostra loading |

### 3.2 Alertas IA sobre Documentos

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 3.2.1 | Verificar Documentos | Clicar "Verificar Documentos" | Mensagem enviada ao chat pedindo analise de documentos vs editais. Resposta da IA exibida no card |
| 3.2.2 | Resultado da verificacao | Apos resposta da IA | Texto formatado com documentos faltantes, vencidos, exigencias possivelmente ilegais |

### 3.3 Documentos da Empresa

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 3.3.1 | Listar documentos | Ver tabela de documentos | DataTable com documentos cadastrados (tipo, nome, status, validade) |
| 3.3.2 | Upload de documento | Clicar "Upload Documento" | Modal abre para selecionar arquivo e tipo de documento |
| 3.3.3 | Documento com validade | Cadastrar documento com data de validade | Validade exibida na tabela. Alerta se proximo do vencimento |

### 3.4 Certidoes Automaticas

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 3.4.1 | Pre-requisito CNPJ | Sem CNPJ cadastrado | Botao "Buscar Certidoes" desabilitado. Mensagem indica necessidade de CNPJ |
| 3.4.2 | Buscar certidoes | Com CNPJ preenchido, clicar "Buscar Certidoes" | Botao mostra "Buscando..." com spinner. Janela de progresso abre mostrando portal por portal |
| 3.4.3 | Progresso da busca | Durante a busca | Janela exibe log em tempo real: portal sendo consultado, status (sucesso/erro), tempo decorrido |
| 3.4.4 | Resultado | Apos busca completar | Certidoes encontradas listadas com nome do portal, status (valida/vencida/nao encontrada), link para download |
| 3.4.5 | Mensagem de resultado | Apos busca | Mensagem de sucesso mostra quantas certidoes foram encontradas vs total de portais consultados |

---

## Checklist Geral

- [ ] Todos os formularios abrem sem erro no console
- [ ] Dados salvos persistem apos reload da pagina
- [ ] Nenhum campo exibe "undefined" ou "null" como texto
- [ ] Botoes de salvar mostram feedback visual (loading/salvando)
- [ ] Navegacao entre abas funciona sem perder dados nao salvos (exibir aviso se necessario)
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx vite build` sem erros
- [ ] Backend inicia sem erros (`python3 backend/app.py`)
