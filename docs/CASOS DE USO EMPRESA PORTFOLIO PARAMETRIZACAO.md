# CASOS DE USO — EMPRESA, PORTFOLIO E PARAMETRIZACAO

**Data:** 30/03/2026
**Versao:** 1.1
**Base:** `requisitos_completosv6.md` (RF-001 a RF-018) + implementacao real de `EmpresaPage.tsx`, `PortfolioPage.tsx`, `ParametrizacoesPage.tsx`, `backend/crud_routes.py`, `backend/app.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso da fundacao do sistema com base no comportamento realmente implementado, com foco em secoes, abas, botoes, respostas do sistema, persistencia e integracoes observadas em codigo e banco.

---

## INDICE

### EMPRESA
- [UC-F01] Manter cadastro principal da empresa
- [UC-F02] Gerir contatos e area padrao
- [UC-F03] Gerir documentos da empresa
- [UC-F04] Buscar, revisar e anexar certidoes
- [UC-F05] Gerir responsaveis da empresa

### PORTFOLIO
- [UC-F06] Listar, filtrar e inspecionar produtos
- [UC-F07] Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website
- [UC-F08] Editar produto e especificacoes tecnicas
- [UC-F09] Reprocessar especificacoes do produto com IA
- [UC-F10] Consultar ANVISA e busca web a partir da tela de portfolio
- [UC-F11] Verificar completude tecnica do produto
- [UC-F12] Reprocessar metadados de captacao do produto
- [UC-F13] Consultar classificacao e funil de monitoramento

### PARAMETRIZACAO
- [UC-F14] Configurar pesos e limiares de score
- [UC-F15] Configurar parametros comerciais, regioes e modalidades
- [UC-F16] Configurar fontes, palavras-chave e NCMs de busca
- [UC-F17] Configurar notificacoes e preferencias

---

## Estrutura real das paginas

### EmpresaPage
Pagina em secoes, sem abas:
1. Informacoes Cadastrais
2. Alertas IA sobre Documentos
3. Documentos da Empresa
4. Certidoes Automaticas
5. Responsaveis

### PortfolioPage
Abas reais:
1. `Meus Produtos`
2. `Cadastro por IA`
3. `Classificacao`

### ParametrizacoesPage
Abas reais:
1. `Score`
2. `Comercial`
3. `Fontes de Busca`
4. `Notificacoes`
5. `Preferencias`

### Persistencia observada
Tabelas principais realmente usadas:
- `empresas`
- `empresa_documentos`
- `empresa_certidoes`
- `empresa_responsaveis`
- `produtos`
- `produtos_especificacoes`
- `areas_produto`
- `classes_produto_v2`
- `subclasses_produto`
- `fontes_editais`
- `parametros_score`

---

## Matriz resumida de botoes observados

### EmpresaPage
- `Salvar Alteracoes`: cria ou atualiza o primeiro registro de `empresas` carregado para o usuario.
- `Upload Documento`: abre modal de upload para `empresa_documentos`.
- `Visualizar` e `Download` em documentos: acessam o arquivo existente.
- `Excluir` em documentos: remove o registro documental.
- `Buscar Certidoes`: chama fluxo streaming de busca automatica de certidoes por CNPJ.
- `Editar certidao`: abre modal de ajuste de dados da certidao.
- `Upload PDF` em certidao: anexa PDF manual a uma certidao existente.
- `Download PDF`: baixa o PDF vinculado.
- `Atualizar esta certidao`: reconsulta uma certidao especifica.
- `Abrir portal`: abre a URL de consulta da fonte emissora.
- `Adicionar`, `Editar`, `Excluir` em responsaveis: mantem `empresa_responsaveis`.

### PortfolioPage
- `Atualizar`: recarrega a lista real de produtos via `getProdutos(...)`.
- `Buscar ANVISA`: abre modal e, ao confirmar, cria sessao `busca-anvisa` e envia prompt para IA.
- `Buscar na Web`: abre modal e, ao confirmar, cria sessao `busca-web` e envia prompt para IA.
- `Visualizar`: carrega detalhe completo do produto via `getProduto(id)`.
- `Editar`: abre modal, resolve hierarquia Area -> Classe -> Subclasse e carrega especificacoes existentes.
- `Reprocessar IA`: envia mensagem para o chat pedindo reextracao das especificacoes do produto.
- `Verificar Completude`: consulta `getProdutoCompletude(produto.id)` e abre retorno analitico.
- `Excluir`: remove o produto via CRUD.
- `Processar com IA`: na aba `Cadastro por IA`, cria sessao `cadastro-produto` e envia arquivo ou URL com prompt especifico por tipo.
- `Precos de Mercado`: nao persiste direto na pagina; envia uma instrucao ao chat para buscar precos do item no PNCP.
- `Reprocessar Metadados`: chama endpoint proprio de enriquecimento de CATMAT, CATSER e termos de busca.
- `Expandir Area` e `Expandir Classe`: navegam a arvore de classificacao.

### ParametrizacoesPage
- `Salvar Pesos`, `Salvar Limiares`: persistem score e thresholds.
- `Salvar Estados`, `Salvar Prazo/Frequencia`, `Salvar Mercado`, `Salvar Custos`, `Salvar Modalidades`: persistem os blocos comerciais.
- `Ativar` ou `Desativar` fonte: alterna o status operacional de `fontes_editais`.
- `Salvar Palavras-chave`, `Salvar NCMs`: atualizam listas de busca.
- `Salvar Notificacoes`, `Salvar Preferencias`: persistem configuracoes gerais.
- `Calcular com IA (Onda 4)`, `Gerar do portfolio (Onda 4)`, `Sincronizar NCMs (Onda 4)`: aparecem desabilitados, portanto nao compoem escopo realmente implementado ate esta fase.

---

## [UC-F01] Manter cadastro principal da empresa

**RF relacionados:** RF-001, RF-005
**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Usuario autenticado.
2. CRUD de `empresas` disponivel.

### Pos-condicoes
1. Registro em `empresas` criado ou atualizado.
2. Dados cadastrais ficam reutilizaveis nas demais etapas do sistema.

### Botoes e acoes observadas
- `Salvar Alteracoes`
- `Tentar novamente` em caso de erro

### Sequencia de eventos
1. Usuario acessa `EmpresaPage`.
2. Sistema carrega a primeira empresa do usuario via `crudList("empresas", { limit: 1 })`.
3. Usuario revisa e altera razao social, nome fantasia, CNPJ, inscricao estadual, website, redes sociais e endereco.
4. Usuario clica em `Salvar Alteracoes`.
5. Sistema cria ou atualiza o registro em `empresas`.

### Persistencia observada
Campos relevantes em `empresas`: `cnpj`, `razao_social`, `nome_fantasia`, `inscricao_estadual`, `website`, `instagram`, `linkedin`, `facebook`, `endereco`, `cidade`, `uf`, `cep`, `emails`, `celulares`, `area_padrao_id`, `frequencia_busca_certidoes`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F02] Gerir contatos e area padrao

**RF relacionados:** RF-001, RF-005
**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Empresa em edicao.
2. Lista de areas carregada de `/api/areas-produto`.

### Pos-condicoes
1. Emails e telefones ficam consolidados no cadastro da empresa.
2. `area_padrao_id` passa a orientar classificacoes e buscas posteriores.

### Botoes e acoes observadas
- `Adicionar` email
- `Adicionar` telefone
- botoes de remover item por linha
- `Salvar Alteracoes`

### Sequencia de eventos
1. Usuario adiciona ou remove emails na secao `Emails de Contato`.
2. Usuario adiciona ou remove telefones na secao `Celulares / Telefones`.
3. Usuario seleciona `Area de Atuacao Padrao`.
4. Usuario salva o cadastro.
5. Sistema persiste os contatos serializados e a area padrao no registro da empresa.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F03] Gerir documentos da empresa

**RF relacionados:** RF-002, RF-004
**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa existente.
2. Endpoint `/api/empresa-documentos/upload` disponivel.
3. Lista de tipos/documentos necessarios carregada.

### Pos-condicoes
1. Documento fica associado a empresa em `empresa_documentos`.
2. Documento pode ser visualizado, baixado ou excluido.
3. Status visual do documento e recalculado conforme arquivo e validade.

### Botoes e acoes observadas
- `Upload Documento`
- `Upload` por linha quando falta arquivo
- `Visualizar`
- `Download`
- `Excluir`
- modal com `Enviar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica em `Upload Documento`.
2. Sistema abre modal para selecionar tipo documental, validade e arquivo.
3. Usuario clica em `Enviar`.
4. Sistema faz `POST /api/empresa-documentos/upload` com `FormData`.
5. Tabela de documentos e recarregada.
6. Usuario pode visualizar ou baixar o arquivo por `/api/empresa-documentos/{id}/download`.
7. Usuario pode excluir um documento via CRUD.

### Persistencia observada
Tabela `empresa_documentos`: `empresa_id`, `tipo`, `nome_arquivo`, `path_arquivo`, `data_vencimento`, `texto_extraido`, `documento_necessario_id`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F04] Buscar, revisar e anexar certidoes

**RF relacionados:** RF-002
**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa cadastrada com CNPJ.
2. Fontes de certidao configuradas ou sincronizadas.
3. Endpoints de certidoes operacionais.

### Pos-condicoes
1. Registros em `empresa_certidoes` sao atualizados.
2. PDFs e metadados podem ser mantidos automaticamente ou manualmente.
3. Usuario consegue corrigir, anexar ou baixar certidoes individualmente.

### Botoes e acoes observadas
- `Buscar Certidoes`
- `Editar certidao`
- `Upload PDF`
- `Download PDF`
- `Atualizar esta certidao`
- `Abrir portal`
- modal de detalhe com `Salvar`, `Abrir Portal`, `Download`, `Fechar`
- modal de upload com `Enviar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica em `Buscar Certidoes`.
2. Sistema valida `empresaId` e `cnpj`.
3. Sistema chama `POST /api/empresa-certidoes/buscar-stream`.
4. A interface mostra progresso streaming por fonte consultada.
5. Ao concluir, sistema recarrega `empresa_certidoes`.
6. Usuario pode editar numero, validade, orgao e status de uma certidao.
7. Usuario pode anexar manualmente um PDF via `/api/empresa-certidoes/{id}/upload`.
8. Usuario pode visualizar ou baixar o PDF existente.

### Persistencia observada
Tabela `empresa_certidoes`: `tipo`, `orgao_emissor`, `numero`, `data_vencimento`, `path_arquivo`, `status`, `url_consulta`, `fonte_certidao_id`, `mensagem`, `dados_extras`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F05] Gerir responsaveis da empresa

**RF relacionados:** RF-003
**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa existente.
2. CRUD de `empresa-responsaveis` disponivel.

### Pos-condicoes
1. Responsaveis ficam vinculados a empresa.
2. Dados podem ser reutilizados nas rotinas documentais e operacionais.

### Botoes e acoes observadas
- `Adicionar`
- `Editar`
- `Excluir`
- modal com `Salvar` e `Cancelar`

### Sequencia de eventos
1. Usuario abre modal de novo responsavel.
2. Usuario informa tipo, nome, cargo, email e telefone.
3. Sistema cria ou atualiza `empresa_responsaveis`.
4. Tabela e recarregada.
5. Usuario pode editar ou excluir registros existentes.

### Persistencia observada
Tabela `empresa_responsaveis`: `empresa_id`, `nome`, `cargo`, `cpf`, `email`, `telefone`, `tipo`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F06] Listar, filtrar e inspecionar produtos

**RF relacionados:** RF-008, RF-009, RF-011, RF-012
**Ator:** Usuario de portfolio/comercial

### Pre-condicoes
1. Produtos cadastrados.
2. Hierarquia Area -> Classe -> Subclasse disponivel.

### Pos-condicoes
1. Usuario consegue localizar produtos por texto e classificacao.
2. Usuario consegue abrir detalhe enriquecido do produto.

### Botoes e acoes observadas
- `Atualizar`
- tabela com `Visualizar`, `Editar`, `Reprocessar IA`, `Verificar Completude`, `Excluir`
- no detalhe: `Reprocessar IA`, `Verificar Completude`, `Precos de Mercado`, `Excluir`
- toggle de `Metadados de Captacao`
- `Reprocessar Metadados`

### Sequencia de eventos
1. Usuario entra na aba `Meus Produtos`.
2. Sistema carrega produtos reais via `getProdutos(...)`.
3. Usuario filtra por Area, Classe, Subclasse e texto.
4. Usuario seleciona um produto na tabela.
5. Sistema carrega `getProduto(id)` e mostra detalhe completo.
6. O detalhe exibe classificacao, NCM, preco de referencia, status pipeline, ANVISA, especificacoes e metadados de captacao.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F07] Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website

**RF relacionados:** RF-006, RF-010
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Usuario autenticado.
2. Servicos de IA e chat operacionais.
3. Opcionalmente classificacao por subclasse informada para melhorar a mascara de extracao.

### Pos-condicoes
1. Um ou mais produtos podem ser cadastrados a partir de documento ou website.
2. Especificacoes tecnicas podem ser extraidas automaticamente.
3. Resposta da IA fica visivel inline e a lista de produtos e atualizada.

### Fontes de entrada implementadas
- `Manual Tecnico`
- `Instrucoes de Uso / IFU`
- `Nota Fiscal (NFS)`
- `Plano de Contas (ERP)`
- `Folder / Catalogo`
- `Website do Fabricante`

### Botoes e acoes observadas
- aba `Cadastro por IA`
- seletor `Tipo de Documento`
- upload de arquivo ou campo `URL do Website`
- classificacao opcional `Area`, `Classe`, `Subclasse`
- `Processar com IA`
- fechamento manual da resposta inline

### Sequencia de eventos
1. Usuario acessa a aba `Cadastro por IA`.
2. Usuario escolhe o tipo de origem.
3. Se a origem for documental, usuario seleciona um arquivo e opcionalmente informa um nome de produto.
4. Se a origem for website, usuario informa a URL do fabricante.
5. Usuario pode informar `Area`, `Classe` e `Subclasse`; quando informa `Subclasse`, ela e enviada para melhorar a extracao conforme a mascara tecnica.
6. Ao clicar em `Processar com IA`, o sistema cria uma sessao `cadastro-produto`.
7. Para `website`, o sistema usa `sendMessage(session_id, "Busque produtos no website ... e cadastre")`.
8. Para `manual`, `instrucoes`, `folders`, `nfs` e `plano_contas`, o sistema escolhe um prompt especifico por tipo e envia `sendMessageWithFile(session_id, prompt, arquivo, subclasse_id?)`.
9. O retorno textual da IA e mostrado inline na pagina.
10. Em seguida a tela executa `fetchProdutos()` para recarregar a grade.

### Observacoes de implementacao
- Este UC e distinto do simples cadastro manual porque a pagina possui um fluxo proprio de extracao automatica.
- `nfs` e `plano_contas` admitem extracao de multiplos itens a partir de um unico arquivo.
- Para `website`, a classificacao opcional por subclasse nao e enviada no prompt atual.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F08] Editar produto e especificacoes tecnicas

**RF relacionados:** RF-008, RF-012
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto existente.
2. Subclasse com mascara de campos tecnicos disponivel.

### Pos-condicoes
1. Dados basicos do produto sao atualizados.
2. Especificacoes preenchidas ficam persistidas em `produtos_especificacoes`.

### Botoes e acoes observadas
- `Editar`
- modal com `Salvar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica em `Editar` em um produto.
2. Sistema abre modal e resolve a hierarquia Area -> Classe -> Subclasse do item.
3. Sistema carrega as especificacoes existentes via `getProduto(id)`.
4. Usuario altera dados basicos e classificacao.
5. Usuario preenche ou ajusta os campos tecnicos derivados da mascara da subclasse selecionada.
6. Ao salvar, o sistema executa `crudUpdate("produtos", ...)`.
7. Para cada especificacao preenchida, o sistema executa `crudUpdate("produtos-especificacoes", ...)` ou `crudCreate("produtos-especificacoes", ...)`.

### Observacao de implementacao
Especificacoes vazias nao sao enviadas; portanto o fluxo atual privilegia criacao e atualizacao de campos preenchidos, nao uma limpeza massiva de specs existentes.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F09] Reprocessar especificacoes do produto com IA

**RF relacionados:** RF-008, RF-010
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto existente.
2. Integracao de chat operacional.

### Pos-condicoes
1. Sistema solicita reextracao das especificacoes do produto.
2. Lista de produtos e recarregada apos a solicitacao.

### Botoes e acoes observadas
- `Reprocessar IA` na tabela
- `Reprocessar IA` no card de detalhes

### Sequencia de eventos
1. Usuario clica em `Reprocessar IA`.
2. Sistema chama `onSendToChat("Reprocesse as especificacoes do produto ...")`.
3. A tela nao abre modal proprio; o fluxo depende do subsistema de chat.
4. Apos alguns segundos, a pagina executa `fetchProdutos()` para refletir possiveis alteracoes.

### Observacao de implementacao
Este botao nao usa um endpoint especializado do portfolio; ele delega o trabalho ao chat/IA da aplicacao.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F10] Consultar ANVISA e busca web a partir da tela de portfolio

**RF relacionados:** RF-007, RF-010
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto selecionado ou dados de consulta informados.
2. Servicos de IA e chat disponiveis.

### Pos-condicoes
1. Usuario obtem resposta sobre ANVISA ou busca web.
2. A lista de produtos e recarregada ao final da consulta.

### Botoes e acoes observadas
- `Buscar ANVISA`
- `Buscar na Web`
- modal ANVISA com confirmacao
- modal Busca Web com confirmacao

### Sequencia de eventos
1. Usuario clica em `Buscar ANVISA`.
2. Sistema abre modal para informar numero de registro ou nome do produto.
3. Ao confirmar, o sistema cria sessao `busca-anvisa` e envia prompt textual apropriado.
4. O retorno e mostrado inline em `iaResponse`.
5. Usuario clica em `Buscar na Web`.
6. Sistema abre modal para informar produto e, opcionalmente, fabricante.
7. Ao confirmar, o sistema cria sessao `busca-web` e envia prompt pedindo manual ou cadastro pela web.
8. O retorno tambem e exibido inline.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F11] Verificar completude tecnica do produto

**RF relacionados:** RF-008, RF-010, RF-012
**Ator:** Usuario de portfolio/compliance tecnico

### Pre-condicoes
1. Produto existente.
2. Endpoint de completude disponivel.

### Pos-condicoes
1. Usuario obtém um diagnostico de completude dos campos basicos e da mascara tecnica.
2. Recomendacoes ficam visiveis em modal dedicado.

### Botoes e acoes observadas
- `Verificar Completude`
- fechamento do modal de resultado

### Sequencia de eventos
1. Usuario aciona `Verificar Completude` na tabela ou no detalhe.
2. Sistema chama `getProdutoCompletude(produto.id)`.
3. Sistema apresenta percentual geral, percentual basico, percentual da mascara e recomendacoes.
4. Usuario decide se deve editar ou reprocessar o produto.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F12] Reprocessar metadados de captacao do produto

**RF relacionados:** RF-010, RF-011, RF-013
**Ator:** Usuario de portfolio/captacao

### Pre-condicoes
1. Produto com detalhe aberto.
2. Endpoint `reprocessarMetadados(produtoId)` disponivel.

### Pos-condicoes
1. CATMAT, CATSER, termos de busca e timestamp de atualizacao podem ser recalculados.
2. Detalhe do produto e recarregado.

### Botoes e acoes observadas
- toggle `Metadados de Captacao`
- `Reprocessar Metadados`

### Sequencia de eventos
1. Usuario abre o bloco `Metadados de Captacao` no detalhe do produto.
2. Sistema exibe CATMAT, descricoes CATMAT, CATSER, termos de busca e ultima atualizacao.
3. Usuario clica em `Reprocessar Metadados`.
4. Sistema chama `reprocessarMetadados(produtoId)`.
5. A pagina executa novo `getProduto(produtoId)` e atualiza os metadados exibidos.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F13] Consultar classificacao e funil de monitoramento

**RF relacionados:** RF-011, RF-012, RF-013
**Ator:** Usuario de portfolio/gestor

### Pre-condicoes
1. Areas, classes e subclasses cadastradas.
2. Monitoramentos existentes ou nao.

### Pos-condicoes
1. Usuario visualiza a arvore de classificacao parametrizada.
2. Usuario entende como a classificacao alimenta o monitoramento de mercado.

### Botoes e acoes observadas
- aba `Classificacao`
- expand/collapse em Area e Classe

### Sequencia de eventos
1. Usuario acessa aba `Classificacao`.
2. Sistema lista areas, classes e subclasses do banco.
3. Usuario expande uma area e depois uma classe.
4. Sistema exibe subclasses, NCMs e quantidade de campos da mascara.
5. O card de funil mostra monitoramentos ativos e categorias parametrizadas.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F14] Configurar pesos e limiares de score

**RF relacionados:** RF-018
**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Registro de `parametros_score` existente ou passivel de criacao.

### Pos-condicoes
1. Pesos ficam persistidos.
2. Limiares GO/NO-GO passam a parametrizar as etapas seguintes.

### Botoes e acoes observadas
- aba `Score`
- `Salvar Pesos`
- `Salvar Limiares`

### Sequencia de eventos
1. Usuario acessa a aba `Score`.
2. Sistema carrega `parametros_score`.
3. Usuario ajusta os pesos do score.
4. Sistema exibe a soma e sinaliza se difere de 1.00.
5. Usuario ajusta limiares final, tecnico e juridico.
6. Usuario salva cada bloco.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F15] Configurar parametros comerciais, regioes e modalidades

**RF relacionados:** RF-014, RF-016, RF-017
**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Registro de `parametros_score` disponivel.
2. Modalidades cadastradas em `modalidades_licitacao`.

### Pos-condicoes
1. Regioes, tempo de entrega, custos e modalidades ficam persistidos.
2. Esses dados podem influenciar captacao, score e decisao comercial.

### Botoes e acoes observadas
- aba `Comercial`
- `Salvar Estados`
- `Salvar Prazo/Frequencia`
- `Salvar Mercado`
- `Salvar Custos`
- `Salvar Modalidades`
- `Calcular com IA (Onda 4)` desabilitado

### Sequencia de eventos
1. Usuario escolhe estados de atuacao ou marca `Atuar em todo o Brasil`.
2. Usuario informa prazo maximo e frequencia maxima.
3. Usuario define TAM, SAM e SOM.
4. Usuario informa markup, custos fixos e frete base.
5. Usuario marca modalidades desejadas.
6. Sistema salva os blocos em `parametros_score`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F16] Configurar fontes, palavras-chave e NCMs de busca

**RF relacionados:** RF-013, RF-015
**Ator:** Usuario administrador/captacao

### Pre-condicoes
1. `fontes_editais` e `parametros_score` disponiveis.

### Pos-condicoes
1. Fontes ficam ativadas ou desativadas.
2. Palavras-chave e NCMs alimentam rotinas de monitoramento e captacao.

### Botoes e acoes observadas
- aba `Fontes de Busca`
- `Ativar` ou `Desativar` fonte
- `Salvar Palavras-chave`
- `Salvar NCMs`
- `Gerar do portfolio (Onda 4)` desabilitado
- `Sincronizar NCMs (Onda 4)` desabilitado

### Sequencia de eventos
1. Usuario revisa a lista de fontes disponiveis.
2. Usuario ativa ou desativa cada fonte conforme estrategia operacional.
3. Usuario ajusta palavras-chave livres.
4. Usuario ajusta a lista de NCMs de busca.
5. Sistema persiste as configuracoes.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F17] Configurar notificacoes e preferencias

**RF relacionados:** RF-018
**Ator:** Usuario administrador

### Pre-condicoes
1. Parametros gerais disponiveis.

### Pos-condicoes
1. Canais, frequencias e preferencias globais ficam persistidos.

### Botoes e acoes observadas
- aba `Notificacoes`
- aba `Preferencias`
- `Salvar Notificacoes`
- `Salvar Preferencias`

### Sequencia de eventos
1. Usuario abre `Notificacoes` e define canais e regras de aviso.
2. Usuario salva o bloco.
3. Usuario abre `Preferencias` e ajusta preferencias gerais da operacao.
4. Usuario salva o bloco.

### Implementacao atual
**IMPLEMENTADO**

---

## Conclusoes desta rodada

1. O UC de portfolio que extrai produto e especificacoes por IA nao pode ser achatado em um cadastro generico; o codigo possui fluxo proprio, prompts distintos por tipo de origem e suporte a extracao multipla para `NFS` e `Plano de Contas`.
2. Os botoes da `PortfolioPage` se dividem em quatro grupos funcionais: navegacao da grade, enriquecimento por IA, verificacao tecnica e manutencao direta do cadastro.
3. Nem todo botao da tela persiste direto em CRUD: `Reprocessar IA` e `Precos de Mercado` delegam trabalho ao subsistema de chat; `Buscar ANVISA` e `Buscar na Web` usam sessoes de IA; `Reprocessar Metadados` usa endpoint proprio.
4. Os recursos marcados como `Onda 4` em `ParametrizacoesPage` nao devem entrar como implementados no escopo desta fundacao.
