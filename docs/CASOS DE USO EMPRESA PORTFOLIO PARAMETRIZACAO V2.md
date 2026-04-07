# CASOS DE USO — EMPRESA, PORTFOLIO E PARAMETRIZACAO

**Data:** 31/03/2026
**Versao:** 2.0
**Base:** `requisitos_completosv6.md` (RF-001 a RF-018) + implementacao real de `EmpresaPage.tsx`, `PortfolioPage.tsx`, `ParametrizacoesPage.tsx`, `backend/crud_routes.py`, `backend/app.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso da fundacao do sistema com base no comportamento realmente implementado, com foco em secoes, abas, botoes, respostas do sistema, persistencia e integracoes observadas em codigo e banco.
**Novidade V2:** Cada UC inclui uma secao "Tela(s) Representativa(s)" com layout hierarquico de elementos, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos.

---

## Modelo de Acesso e Autenticacao

### Estrutura de Usuarios

O sistema utiliza modelo N:N entre usuarios e empresas:

| Entidade | Descricao |
|---|---|
| `users.super` | Boolean — identifica superusuario |
| `usuario_empresa` | Tabela de juncao: user_id, empresa_id, papel, ativo |
| Papel `admin` | Gerencia configuracoes da empresa |
| Papel `operador` | Acesso operacional (sem configuracoes) |

### Fluxo de Login

**Superusuario:**
1. Login → tela de selecao de empresa (lista todas as disponiveis)
2. Clicar na empresa desejada → Dashboard

**Usuario normal:**
1. Login → Dashboard direto (empresa ja vinculada automaticamente)

### Menus exclusivos de Superusuario

| Menu Sidebar | Rota | Funcao |
|---|---|---|
| Usuarios | `/app/crud/users` | CRUD completo de usuarios |
| Associar Empresa/Usuario | `/app/admin/associar-empresa` | Vincular/desvincular usuario↔empresa |
| Selecionar Empresa | — | Trocar empresa ativa sem logout |

### APIs de Controle de Acesso

| Endpoint | Metodo | Descricao |
|---|---|---|
| `/api/auth/login` | POST | Autenticacao; retorna token + campo `super` |
| `/api/auth/switch-empresa` | POST | Troca empresa ativa; body: `{empresa_id}` |
| `/api/auth/minhas-empresas` | GET | Lista empresas do usuario logado |
| `/api/admin/associar-empresa` | POST | Vincula/desvincula user↔empresa (so super) |

### Usuarios de Validacao

| Email | Senha | Perfil | Empresa Padrao |
|---|---|---|---|
| valida1@valida.com.br | 123456 | Superusuario | CH Hospitalar |
| valida2@valida.com.br | 123456 | Superusuario | RP3X (a ser associada) |

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

## Convencoes de tags de tipo

`[Cabecalho]`, `[Card]`, `[Secao]`, `[Campo]`, `[Botao]`, `[Tabela]`, `[Coluna]`, `[Badge]`, `[Icone-Acao]`, `[Modal]`, `[Aba]`, `[Lista]`, `[Alerta]`, `[Progresso]`, `[Toggle]`, `[Checkbox]`, `[Select]`, `[Toast]`, `[Texto]`, `[Indicador]`, `[Radio]`, `[Tag]`

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
1. Usuario autenticado (ver secao Modelo de Acesso).
2. CRUD de `empresas` disponivel.

### Pos-condicoes
1. Registro em `empresas` criado ou atualizado.
2. Dados cadastrais ficam reutilizaveis nas demais etapas do sistema.

### Botoes e acoes observadas
- `Salvar Alteracoes`
- `Tentar novamente` em caso de erro

### Sequencia de eventos
1. Usuario acessa `EmpresaPage` via menu lateral "Configuracoes > Empresa".
2. Sistema carrega a primeira empresa do usuario via `crudList("empresas", { limit: 1 })` e popula o [Card: "Informacoes Cadastrais"].
3. Usuario revisa e altera os campos do [Card: "Informacoes Cadastrais"]: [Campo: "Razao Social"], [Campo: "Nome Fantasia"], [Campo: "CNPJ"], [Campo: "Inscricao Estadual"] na [Secao: "Dados Basicos"]; [Campo: "Website"], [Campo: "Instagram"], [Campo: "LinkedIn"], [Campo: "Facebook"] na [Secao: "Presenca Digital"]; [Campo: "Endereco"], [Campo: "Cidade"], [Campo: "UF"], [Campo: "CEP"] na [Secao: "Endereco"].
4. Usuario clica no [Botao: "Salvar Alteracoes"] no rodape do [Card: "Informacoes Cadastrais"].
5. Sistema cria ou atualiza o registro em `empresas`. Exibe [Toast] de confirmacao ou [Alerta] de erro com [Botao: "Tentar novamente"].

> **Nota:** Este card e compartilhado com UC-F02. Ver [UC-F02] para os elementos de Emails, Telefones e Area de Atuacao Padrao.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 1 de 5

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Icone: Building]
  [Titulo: "Dados da Empresa"]
  [Subtitulo: "Cadastro de informacoes e documentos da empresa"]
  [Botao: "Verificar Documentos"] (header-level, ver UC-F03) [ref: —]

[Card: "Informacoes Cadastrais"] [Icone: Building]
  [Secao: "Dados Basicos"] (form-grid-2)
    [Campo: "Razao Social"] — text, obrigatorio [ref: Passo 3]
    [Campo: "Nome Fantasia"] — text [ref: Passo 3]
    [Campo: "CNPJ"] — text, obrigatorio, placeholder "00.000.000/0000-00" [ref: Passo 3]
    [Campo: "Inscricao Estadual"] — text [ref: Passo 3]
  [Campo: "Area de Atuacao Padrao"] — select (areas do backend) [ref: UC-F02 Passo 3]
  [Secao: "Presenca Digital"] (form-grid-2)
    [Campo: "Website"] — url [ref: Passo 3]
    [Campo: "Instagram"] — text, prefix "@" [ref: Passo 3]
    [Campo: "LinkedIn"] — text [ref: Passo 3]
    [Campo: "Facebook"] — text [ref: Passo 3]
  [Secao: "Endereco"]
    [Campo: "Endereco"] — text (form-grid-1) [ref: Passo 3]
    [Campo: "Cidade"] — text (form-grid-3) [ref: Passo 3]
    [Campo: "UF"] — text [ref: Passo 3]
    [Campo: "CEP"] — text [ref: Passo 3]
  [Secao: "Emails de Contato"] [ref: UC-F02 Passo 1]
  [Secao: "Celulares / Telefones"] [ref: UC-F02 Passo 2]
  [Botao: "Salvar Alteracoes"] — primary [ref: Passo 4]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Campo: "Razao Social"] | 3 |
| [Campo: "Nome Fantasia"] | 3 |
| [Campo: "CNPJ"] | 3 |
| [Campo: "Inscricao Estadual"] | 3 |
| [Campo: "Website"] | 3 |
| [Campo: "Instagram"] | 3 |
| [Campo: "LinkedIn"] | 3 |
| [Campo: "Facebook"] | 3 |
| [Campo: "Endereco"] | 3 |
| [Campo: "Cidade"] | 3 |
| [Campo: "UF"] | 3 |
| [Campo: "CEP"] | 3 |
| [Botao: "Salvar Alteracoes"] | 4, 5 |
| [Botao: "Tentar novamente"] | 5 (erro) |

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
1. Usuario adiciona ou remove emails na [Secao: "Emails de Contato"] do [Card: "Informacoes Cadastrais"]: digita no [Campo: "Novo email..."] e clica [Botao: "Adicionar"]; ou clica [Icone-Acao: X] para remover um email existente.
2. Usuario adiciona ou remove telefones na [Secao: "Celulares / Telefones"]: digita no [Campo: "Novo telefone..."] e clica [Botao: "Adicionar"]; ou clica [Icone-Acao: X] para remover.
3. Usuario seleciona a [Campo: "Area de Atuacao Padrao"] (select com areas do backend).
4. Usuario clica no [Botao: "Salvar Alteracoes"] no rodape do [Card: "Informacoes Cadastrais"].
5. Sistema persiste os contatos serializados e a area padrao no registro da empresa.

> **Nota:** Compartilha o mesmo [Card: "Informacoes Cadastrais"] do UC-F01.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 1 de 5 (subsecoes inferiores)

#### Layout da Tela

```
[Card: "Informacoes Cadastrais"] (mesmo card de UC-F01)
  ...
  [Campo: "Area de Atuacao Padrao"] — select [ref: Passo 3]
  ...
  [Secao: "Emails de Contato"] [Icone: Mail]
    [Lista: emails existentes]
      [Texto: email] + [Icone-Acao: X] — remover [ref: Passo 1]
    [Campo: "Novo email..."] — email [ref: Passo 1]
    [Botao: "Adicionar"] [Icone: Plus] [ref: Passo 1]

  [Secao: "Celulares / Telefones"] [Icone: Phone]
    [Lista: telefones existentes]
      [Texto: telefone] + [Icone-Acao: X] — remover [ref: Passo 2]
    [Campo: "Novo telefone..."] — text [ref: Passo 2]
    [Botao: "Adicionar"] [Icone: Plus] [ref: Passo 2]

  [Botao: "Salvar Alteracoes"] — primary [ref: Passo 4]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Campo: "Novo email..."] | 1 |
| [Botao: "Adicionar" (email)] | 1 |
| [Icone-Acao: X (email)] | 1 |
| [Campo: "Novo telefone..."] | 2 |
| [Botao: "Adicionar" (telefone)] | 2 |
| [Icone-Acao: X (telefone)] | 2 |
| [Campo: "Area de Atuacao Padrao"] | 3 |
| [Botao: "Salvar Alteracoes"] | 4, 5 |

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
1. Usuario clica no [Botao: "Upload Documento"] no cabecalho do [Card: "Documentos da Empresa"].
2. Sistema abre o [Modal: "Upload de Documento"] com [Campo: "Tipo de Documento"] (select com optgroups por categoria), [Campo: "Arquivo"] (file input .pdf,.doc,.docx,.jpg,.png) e [Campo: "Validade"] (date picker).
3. Usuario preenche os campos e clica no [Botao: "Enviar"] no rodape do modal.
4. Sistema faz `POST /api/empresa-documentos/upload` com `FormData`.
5. A [Tabela: DataTable] de documentos e recarregada com o novo registro.
6. Usuario pode clicar [Icone-Acao: Eye] para visualizar ou [Icone-Acao: Download] para baixar o arquivo via `/api/empresa-documentos/{id}/download`.
7. Usuario pode clicar [Icone-Acao: Trash2] para excluir um documento via CRUD.

> **Nota:** O [Card: "Alertas IA sobre Documentos"] (Card 2 de 5) aparece entre o Card "Informacoes Cadastrais" e este Card. Possui [Botao: "Verificar Documentos"] que envia prompt ao chat para verificar documentos contra editais. Nao possui UC dedicado.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 3 de 5

#### Layout da Tela

```
[Card: "Alertas IA sobre Documentos"] [Icone: Sparkles] (Card 2 — informativo, sem UC dedicado)
  [Subtitulo: "A IA verifica seus documentos contra requisitos de editais"]
  [Botao: "Verificar Documentos"] — primary [ref: —]
  [Texto: area de resposta IA ou placeholder]

[Card: "Documentos da Empresa"] [Icone: Upload]
  [Botao: "Upload Documento"] [Icone: Plus] — header action [ref: Passo 1]
  [Tabela: DataTable]
    [Coluna: "Nome"] — nome do documento
    [Coluna: "Tipo"] — tipo documental
    [Coluna: "Validade"] — data de vencimento
    [Coluna: "Status"]
      [Badge: "OK"] — verde [ref: Passo 5]
      [Badge: "Vence"] — amarelo [ref: Passo 5]
      [Badge: "Falta"] — vermelho [ref: Passo 5]
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar [ref: Passo 6]
      [Icone-Acao: Download] — baixar [ref: Passo 6]
      [Icone-Acao: Trash2] — excluir [ref: Passo 7]

[Modal: "Upload de Documento"] (disparado por [Botao: "Upload Documento"])
  [Campo: "Tipo de Documento"] — select com optgroups, obrigatorio [ref: Passo 2]
  [Campo: "Arquivo"] — file (.pdf,.doc,.docx,.jpg,.png) [ref: Passo 2]
  [Campo: "Validade"] — date [ref: Passo 2]
  [Botao: "Enviar"] — primary [ref: Passo 3]
  [Botao: "Cancelar"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Upload Documento"] | 1 |
| [Campo: "Tipo de Documento"] (modal) | 2 |
| [Campo: "Arquivo"] (modal) | 2 |
| [Campo: "Validade"] (modal) | 2 |
| [Botao: "Enviar"] (modal) | 3 |
| [Tabela: DataTable documentos] | 5 |
| [Badge: "OK" / "Vence" / "Falta"] | 5 |
| [Icone-Acao: Eye] | 6 |
| [Icone-Acao: Download] | 6 |
| [Icone-Acao: Trash2] | 7 |

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
1. Usuario clica no [Botao: "Buscar Certidoes"] no cabecalho do [Card: "Certidoes Automaticas"].
2. Sistema valida `empresaId` e `cnpj`.
3. Sistema chama `POST /api/empresa-certidoes/buscar-stream`. O [Progresso: janela de log] exibe progresso streaming com barra, icones por status e contagem (N/total).
4. Ao concluir, sistema recarrega a [Tabela: DataTable] de `empresa_certidoes`.
5. Usuario pode clicar [Icone-Acao: Pencil] para abrir o [Modal: detalhe da certidao] e editar [Campo: "Status"], [Campo: "Validade"], [Campo: "Numero"], [Campo: "Orgao Emissor"]; visualizar PDF inline; e clicar [Botao: "Salvar"], [Botao: "Portal"], [Botao: "Download"] ou [Botao: "Fechar"].
6. Usuario pode configurar o [Select: "Frequencia de busca automatica"] (Desativada, Diaria, Semanal, Quinzenal, Mensal).
7. Usuario pode clicar [Icone-Acao: Upload] para abrir o [Modal: "Upload de Certidao"] e anexar manualmente um PDF via `/api/empresa-certidoes/{id}/upload`, informando [Campo: "Arquivo"], [Campo: "Data de Vencimento"] e [Campo: "Numero"].
8. Usuario pode clicar [Icone-Acao: Download] para baixar o PDF existente ou [Icone-Acao: Globe] para abrir o portal emissor.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 4 de 5

#### Layout da Tela

```
[Card: "Certidoes Automaticas"] [Icone: RefreshCw]
  [Subtitulo: "Busca certidoes para CNPJ {cnpj} nos portais oficiais"]
  [Botao: "Buscar Certidoes"] [Icone: RefreshCw] — primary, header action [ref: Passo 1]

  [Progresso: janela de log streaming] (visivel durante busca)
    [Texto: "Progresso da Busca (N/total)"]
    [Barra de progresso] — percentual
    [Lista: linhas de log com icones coloridos por status]
    [Botao: X] — fechar (apos conclusao) [ref: Passo 3]

  [Select: "Frequencia de busca automatica"] — Desativada|Diaria|Semanal|Quinzenal|Mensal [ref: Passo 6]

  [Tabela: DataTable]
    [Coluna: "Certidao"] — nome + indicador busca automatica
    [Coluna: "Status"]
      [Badge: "Valida"] — verde
      [Badge: "Vencida"] — vermelho
      [Badge: "Buscando..."] — azul animado
      [Badge: "Erro"] — vermelho
      [Badge: "Nao disponivel"] — amarelo
      [Badge: "Pendente"] — laranja
    [Coluna: "Validade"] — data + contagem regressiva
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar PDF [ref: Passo 5]
      [Icone-Acao: Upload] — upload manual [ref: Passo 7]
      [Icone-Acao: Download] — baixar PDF [ref: Passo 8]
      [Icone-Acao: RefreshCw] — atualizar individual
      [Icone-Acao: Globe] — abrir portal [ref: Passo 8]
      [Icone-Acao: Pencil] — editar detalhe [ref: Passo 5]

  [Indicador: CapSolver]
    [Badge: "CapSolver: $X.XX"] ou "CapSolver: nao configurado"

[Modal: detalhe da certidao] (disparado por [Icone-Acao: Pencil])
  [Alerta: contextual com instrucao] — cor e icone variam por status
  [Texto: PDF inline] — iframe viewer (quando disponivel)
  [Campo: "Status"] — select (Valida, Vencida, Aguardando acao, Upload manual, Erro) [ref: Passo 5]
  [Texto: "Modo"] — Automatica ou Manual (somente leitura)
  [Campo: "Validade"] — date [ref: Passo 5]
  [Campo: "Data Emissao"] — somente leitura
  [Campo: "Numero"] — text [ref: Passo 5]
  [Campo: "Orgao Emissor"] — text [ref: Passo 5]
  [Texto: "Resultado da Busca"] — mensagem da fonte
  [Lista: "Dados Detalhados"] — expansivel (dados_extras)
  [Botao: "Salvar"] — primary [ref: Passo 5]
  [Botao: "Portal"] [ref: Passo 8]
  [Botao: "Download"] [ref: Passo 8]
  [Botao: "Fechar"]

[Modal: "Upload de Certidao"] (disparado por [Icone-Acao: Upload])
  [Campo: "Arquivo"] — file (.pdf,.jpg,.jpeg,.png) [ref: Passo 7]
  [Campo: "Data de Vencimento"] — date [ref: Passo 7]
  [Campo: "Numero"] — text [ref: Passo 7]
  [Botao: "Enviar"] — primary [ref: Passo 7]
  [Botao: "Cancelar"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Buscar Certidoes"] | 1 |
| [Progresso: janela de log] | 3 |
| [Tabela: DataTable certidoes] | 4 |
| [Icone-Acao: Pencil] → [Modal: detalhe] | 5 |
| [Campo: "Status"] (modal detalhe) | 5 |
| [Campo: "Validade"] (modal detalhe) | 5 |
| [Campo: "Numero"] (modal detalhe) | 5 |
| [Campo: "Orgao Emissor"] (modal detalhe) | 5 |
| [Botao: "Salvar"] (modal detalhe) | 5 |
| [Select: "Frequencia de busca automatica"] | 6 |
| [Icone-Acao: Upload] → [Modal: upload] | 7 |
| [Campo: "Arquivo"] (modal upload) | 7 |
| [Botao: "Enviar"] (modal upload) | 7 |
| [Icone-Acao: Download] | 8 |
| [Icone-Acao: Globe] | 8 |
| [Botao: "Portal"] (modal detalhe) | 8 |
| [Botao: "Download"] (modal detalhe) | 8 |
| [Indicador: CapSolver] | (informativo) |

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
1. Usuario clica no [Botao: "Adicionar"] no cabecalho do [Card: "Responsaveis"] para abrir o [Modal: "Adicionar Responsavel"].
2. Usuario preenche [Campo: "Tipo"] (select: Representante Legal, Preposto, Responsavel Tecnico), [Campo: "Nome"] (obrigatorio), [Campo: "Cargo"], [Campo: "Email"] (obrigatorio) e [Campo: "Telefone"].
3. Usuario clica no [Botao: "Salvar"]. Sistema cria registro em `empresa_responsaveis`.
4. A [Tabela: DataTable] e recarregada mostrando o novo responsavel.
5. Usuario pode clicar [Icone-Acao: Pencil] para editar (abre o mesmo modal com titulo "Editar Responsavel") ou [Icone-Acao: Trash2] para excluir registros existentes.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 5 de 5

#### Layout da Tela

```
[Card: "Responsaveis"]
  [Botao: "Adicionar"] [Icone: Plus] — header action [ref: Passo 1]
  [Tabela: DataTable]
    [Coluna: "Nome"]
    [Coluna: "Tipo"] — label traduzido
    [Coluna: "Cargo"]
    [Coluna: "Email"]
    [Coluna: "Telefone"]
    [Coluna: "Acoes"]
      [Icone-Acao: Pencil] — editar [ref: Passo 5]
      [Icone-Acao: Trash2] — excluir [ref: Passo 5]

[Modal: "Adicionar Responsavel" / "Editar Responsavel"]
  [Campo: "Tipo"] — select (Representante Legal, Preposto, Responsavel Tecnico) [ref: Passo 2]
  [Campo: "Nome"] — text, obrigatorio [ref: Passo 2]
  [Campo: "Cargo"] — text [ref: Passo 2]
  [Campo: "Email"] — email, obrigatorio [ref: Passo 2]
  [Campo: "Telefone"] — text [ref: Passo 2]
  [Botao: "Salvar"] — primary [ref: Passo 3]
  [Botao: "Cancelar"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Adicionar"] | 1 |
| [Campo: "Tipo"] (modal) | 2 |
| [Campo: "Nome"] (modal) | 2 |
| [Campo: "Cargo"] (modal) | 2 |
| [Campo: "Email"] (modal) | 2 |
| [Campo: "Telefone"] (modal) | 2 |
| [Botao: "Salvar"] (modal) | 3 |
| [Tabela: DataTable responsaveis] | 4 |
| [Icone-Acao: Pencil] | 5 |
| [Icone-Acao: Trash2] | 5 |

### Persistencia observada
Tabela `empresa_responsaveis`: `empresa_id`, `nome`, `cargo`, `cpf`, `email`, `telefone`, `tipo`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-F06] Listar, filtrar e inspecionar produtos

**RF relacionados:** RF-008, RF-009, RF-011, RF-012
**Ator:** Usuario de portfolio/comercial

### Pre-condicoes
1. Usuario autenticado (ver secao Modelo de Acesso).
2. Produtos cadastrados.
3. Hierarquia Area -> Classe -> Subclasse disponivel.

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
1. Usuario acessa a [Aba: "Meus Produtos"] na PortfolioPage.
2. Sistema carrega produtos reais via `getProdutos(...)` e exibe [Badge: contadores de pipeline] (Cadastrado, Qualificado, Ofertado, Vencedor) e, se houver, [Alerta: "N produto(s) sem NCM"].
3. Usuario filtra por [Select: "Area"], [Select: "Classe"], [Select: "Subclasse"] (cascata) e digita no [Campo: busca texto] do [Tabela: FilterBar].
4. Usuario seleciona um produto clicando na linha da [Tabela: DataTable].
5. Sistema carrega `getProduto(id)` e mostra o [Card: "Detalhes: {nome}"] com informacoes completas.
6. O detalhe exibe: classificacao (Area > Classe > Subclasse), NCM, preco de referencia, status pipeline ([Badge]), registro ANVISA, status ANVISA, descricao, [Tabela: "Especificacoes Tecnicas"] e [Toggle: "Metadados de Captacao"].

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 de 3 — "Meus Produtos"

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Icone: Briefcase]
  [Titulo: "Portfolio de Produtos"]
  [Botao: "Atualizar"] [Icone: RefreshCw] [ref: —]
  [Botao: "Buscar ANVISA"] [Icone: Shield] [ref: UC-F10]
  [Botao: "Buscar na Web"] [Icone: Globe] [ref: UC-F10]

[Aba: "Meus Produtos"] [Icone: Eye] | [Aba: "Cadastro por IA"] | [Aba: "Classificacao"]

[Badge: Pipeline Status] (inline, horizontal)
  [Badge: "Cadastrado"] — contagem [ref: Passo 2]
  [Badge: "Qualificado"] — contagem [ref: Passo 2]
  [Badge: "Ofertado"] — contagem [ref: Passo 2]
  [Badge: "Vencedor"] — contagem [ref: Passo 2]

[Alerta: "N produto(s) sem NCM cadastrado"] (condicional) [ref: Passo 2]

[Secao: Filtros cascata]
  [Select: "Area"] [ref: Passo 3]
  [Select: "Classe"] (depende de Area) [ref: Passo 3]
  [Select: "Subclasse"] (depende de Classe) [ref: Passo 3]

[Card: tabela de produtos]
  [Tabela: FilterBar]
    [Campo: busca texto] — placeholder "Buscar produto, fabricante, modelo..." [ref: Passo 3]
  [Tabela: DataTable]
    [Coluna: "Produto"] — sortable
    [Coluna: "Fabricante"] — sortable
    [Coluna: "SKU"]
    [Coluna: "Subclasse"] — sortable
    [Coluna: "Status"] — [Badge: pipeline status]
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar [ref: Passo 4]
      [Icone-Acao: Edit2] — editar [ref: UC-F08]
      [Icone-Acao: RefreshCw] — reprocessar IA [ref: UC-F09]
      [Icone-Acao: Search] — verificar completude [ref: UC-F11]
      [Icone-Acao: Trash2] — excluir

[Card: "Detalhes: {nome}"] (visivel apos selecao)
  [Botao: "Reprocessar IA"] [Icone: RefreshCw] [ref: UC-F09]
  [Botao: "Verificar Completude"] [Icone: Search] [ref: UC-F11]
  [Botao: "Precos de Mercado"] [Icone: DollarSign] [ref: —]
  [Botao: "Excluir"] [Icone: Trash2]
  [Secao: info-grid]
    [Texto: Nome, Fabricante, Modelo, Categoria, Classificacao, NCM, Preco Referencia, Status Pipeline, Registro ANVISA, Status ANVISA, Descricao] [ref: Passo 6]
  [Tabela: "Especificacoes Tecnicas (N)"]
    [Coluna: "Especificacao"] + [Badge: "IA"]
    [Coluna: "Valor"]
    [Coluna: "Unidade"] [ref: Passo 6]
  [Toggle: "Metadados de Captacao"] [Icone: ChevronDown/Right] [ref: UC-F12]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Meus Produtos"] | 1 |
| [Badge: Pipeline Status] | 2 |
| [Alerta: sem NCM] | 2 |
| [Select: "Area" / "Classe" / "Subclasse"] | 3 |
| [Campo: busca texto (FilterBar)] | 3 |
| [Tabela: DataTable produtos] | 4 |
| [Card: "Detalhes"] | 5, 6 |
| [Tabela: "Especificacoes Tecnicas"] | 6 |

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
1. Usuario acessa a [Aba: "Cadastro por IA"] na PortfolioPage.
2. Usuario escolhe o tipo de origem no [Campo: "Tipo de Documento"] (select: Manual Tecnico, Instrucoes de Uso, Nota Fiscal, Plano de Contas, Folder/Catalogo, Website).
3. Se a origem for documental, usuario seleciona um arquivo no [Campo: "Arquivo"] e opcionalmente informa o [Campo: "Nome do Produto (opcional)"].
4. Se a origem for website, usuario informa a URL no [Campo: "URL do Website"].
5. Usuario pode informar [Select: "Area"], [Select: "Classe"] e [Select: "Subclasse"] na [Secao: "Classificacao (opcional)"]; quando informa Subclasse, ela e enviada para melhorar a extracao conforme a mascara tecnica.
6. Ao clicar no [Botao: "Processar com IA"], o sistema cria uma sessao `cadastro-produto`.
7. Para `website`, o sistema usa `sendMessage(session_id, "Busque produtos no website ... e cadastre")`.
8. Para `manual`, `instrucoes`, `folders`, `nfs` e `plano_contas`, o sistema escolhe um prompt especifico por tipo e envia `sendMessageWithFile(session_id, prompt, arquivo, subclasse_id?)`.
9. O retorno textual da IA e mostrado inline em [Texto: resposta IA] (markdown renderizado com botao fechar).
10. Em seguida a tela executa `fetchProdutos()` para recarregar a grade na [Aba: "Meus Produtos"].

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 2 de 3 — "Cadastro por IA"

#### Layout da Tela

```
[Aba: "Cadastro por IA"] [Icone: Sparkles]

[Card: "Cadastro por IA"]
  [Subtitulo: "Faca upload de documentos e a IA extrai automaticamente os dados do produto"]

  [Campo: "Tipo de Documento"] — select [ref: Passo 2]
    opcoes: Manual Tecnico | Instrucoes de Uso | Nota Fiscal | Plano de Contas | Folder/Catalogo | Website

  (se website)
  [Campo: "URL do Website"] — url, obrigatorio [ref: Passo 4]

  (se documental)
  [Campo: "Arquivo"] — file input (aceita por tipo) [ref: Passo 3]
  [Texto: info do arquivo] — nome e tamanho
  [Campo: "Nome do Produto (opcional)"] — text [ref: Passo 3]

  [Secao: "Classificacao (opcional)"] [Icone: Filter] (somente documental)
    [Select: "Area"] [ref: Passo 5]
    [Select: "Classe"] (depende de Area) [ref: Passo 5]
    [Select: "Subclasse"] (depende de Classe) [ref: Passo 5]

  [Botao: "Processar com IA"] [Icone: Sparkles] — primary [ref: Passo 6]

  [Toast: processamento] — "Processando..." com spinner (condicional) [ref: Passo 6]
  [Texto: resposta IA] — markdown renderizado com [Botao: fechar] [ref: Passo 9]

[Texto: dica cadastro manual] — informativo
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Cadastro por IA"] | 1 |
| [Campo: "Tipo de Documento"] | 2 |
| [Campo: "Arquivo"] | 3 |
| [Campo: "Nome do Produto (opcional)"] | 3 |
| [Campo: "URL do Website"] | 4 |
| [Select: "Area" / "Classe" / "Subclasse"] | 5 |
| [Botao: "Processar com IA"] | 6 |
| [Toast: processamento] | 6 |
| [Texto: resposta IA] | 9 |

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
1. Usuario clica em [Icone-Acao: Edit2] na [Tabela: DataTable] de produtos na [Aba: "Meus Produtos"].
2. Sistema abre o [Modal: "Editar: {nome}"] e resolve a hierarquia Area -> Classe -> Subclasse do item.
3. Sistema carrega as especificacoes existentes via `getProduto(id)`.
4. Usuario altera dados basicos: [Campo: "Nome"], [Campo: "Fabricante"], [Campo: "Modelo"], [Campo: "SKU / Codigo Interno"], [Campo: "NCM"], [Campo: "Descricao"].
5. Usuario altera classificacao: [Select: "Area"], [Select: "Classe"], [Select: "Subclasse"].
6. Usuario preenche ou ajusta os campos tecnicos na [Secao: "Especificacoes Tecnicas (N campos)"] derivados da mascara da subclasse selecionada.
7. Ao clicar [Botao: "Salvar"], o sistema executa `crudUpdate("produtos", ...)` e para cada especificacao preenchida executa `crudUpdate` ou `crudCreate` em `produtos-especificacoes`.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 — Modal disparado da DataTable

#### Layout da Tela

```
[Modal: "Editar: {nome}"]
  [Secao: "Dados Basicos"] (grid 2 colunas)
    [Campo: "Nome"] — text, obrigatorio [ref: Passo 4]
    [Campo: "Fabricante"] — text [ref: Passo 4]
    [Campo: "Modelo"] — text [ref: Passo 4]
    [Campo: "SKU / Codigo Interno"] — text [ref: Passo 4]
    [Campo: "NCM"] — text [ref: Passo 4]
    [Campo: "Descricao"] — text [ref: Passo 4]

  [Secao: "Classificacao"] (grid 3 colunas)
    [Select: "Area"] [ref: Passo 5]
    [Select: "Classe"] (depende de Area) [ref: Passo 5]
    [Select: "Subclasse"] (depende de Classe) [ref: Passo 5]

  [Secao: "Especificacoes Tecnicas (N campos)"] (grid 2 colunas, condicional)
    [Campo: "{campo} ({unidade})"] — text/select/boolean por tipo da mascara [ref: Passo 6]
    ... (um campo por item da mascara)

  [Botao: "Salvar"] [Icone: Save] — primary [ref: Passo 7]
  [Botao: "Cancelar"] [Icone: X]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Icone-Acao: Edit2] (DataTable) | 1 |
| [Campo: "Nome"] | 4 |
| [Campo: "Fabricante"] | 4 |
| [Campo: "Modelo"] | 4 |
| [Campo: "SKU / Codigo Interno"] | 4 |
| [Campo: "NCM"] | 4 |
| [Campo: "Descricao"] | 4 |
| [Select: "Area" / "Classe" / "Subclasse"] | 5 |
| [Campo: especificacoes da mascara] | 6 |
| [Botao: "Salvar"] | 7 |

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
1. Usuario clica no [Botao: "Reprocessar IA"] [Icone: RefreshCw] — disponivel na [Coluna: "Acoes"] da [Tabela: DataTable] ou no cabecalho do [Card: "Detalhes: {nome}"].
2. Sistema chama `onSendToChat("Reprocesse as especificacoes do produto ...")`.
3. A tela nao abre modal proprio; o fluxo depende do subsistema de chat.
4. Apos alguns segundos, a pagina executa `fetchProdutos()` para refletir possiveis alteracoes na [Tabela: DataTable].

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 — botao na DataTable e no Card de detalhe

#### Layout da Tela

```
(na DataTable, Coluna "Acoes")
  [Icone-Acao: RefreshCw] — "Reprocessar IA" [ref: Passo 1]

(no Card "Detalhes: {nome}")
  [Botao: "Reprocessar IA"] [Icone: RefreshCw] [ref: Passo 1]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Icone-Acao: RefreshCw] (DataTable) | 1 |
| [Botao: "Reprocessar IA"] (Card detalhe) | 1 |
| [Tabela: DataTable] (reload) | 4 |

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
1. Usuario clica no [Botao: "Buscar ANVISA"] [Icone: Shield] no cabecalho da PortfolioPage.
2. Sistema abre o [Modal: "Registros de Produtos pela ANVISA"] com [Campo: "Numero de Registro ANVISA"] e [Campo: "ou Nome do Produto"].
3. Ao clicar [Botao: "Buscar via IA"] [Icone: Shield], o sistema cria sessao `busca-anvisa` e envia prompt textual.
4. O retorno e mostrado inline em [Texto: resposta IA] (markdown).
5. Usuario clica no [Botao: "Buscar na Web"] [Icone: Globe] no cabecalho.
6. Sistema abre o [Modal: "Buscar Produto na Web"] com [Campo: "Nome do Produto"] (obrigatorio) e [Campo: "Fabricante (opcional)"].
7. Ao clicar [Botao: "Buscar via IA"] [Icone: Globe], o sistema cria sessao `busca-web` e envia prompt.
8. O retorno tambem e exibido inline em [Texto: resposta IA].

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Cabecalho da pagina + Modais

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Botao: "Buscar ANVISA"] [Icone: Shield] [ref: Passo 1]
  [Botao: "Buscar na Web"] [Icone: Globe] [ref: Passo 5]

[Modal: "Registros de Produtos pela ANVISA"]
  [Texto: "A IA tenta trazer os registros e o usuario valida ou complementa."]
  [Campo: "Numero de Registro ANVISA"] — text [ref: Passo 2]
  [Campo: "ou Nome do Produto"] — text [ref: Passo 2]
  [Botao: "Buscar via IA"] [Icone: Shield] — primary [ref: Passo 3]
  [Botao: "Cancelar"]

[Modal: "Buscar Produto na Web"]
  [Texto: "A IA busca informacoes do produto na web e cadastra automaticamente."]
  [Campo: "Nome do Produto"] — text, obrigatorio [ref: Passo 6]
  [Campo: "Fabricante (opcional)"] — text [ref: Passo 6]
  [Botao: "Buscar via IA"] [Icone: Globe] — primary [ref: Passo 7]
  [Botao: "Cancelar"]

[Texto: resposta IA] — inline, markdown [ref: Passo 4, 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Buscar ANVISA"] | 1 |
| [Campo: "Numero de Registro ANVISA"] | 2 |
| [Campo: "ou Nome do Produto"] (ANVISA) | 2 |
| [Botao: "Buscar via IA" (ANVISA)] | 3 |
| [Texto: resposta IA] | 4, 8 |
| [Botao: "Buscar na Web"] | 5 |
| [Campo: "Nome do Produto"] (web) | 6 |
| [Campo: "Fabricante (opcional)"] | 6 |
| [Botao: "Buscar via IA" (web)] | 7 |

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
1. Usuario obtem um diagnostico de completude dos campos basicos e da mascara tecnica.
2. Recomendacoes ficam visiveis em modal dedicado.

### Botoes e acoes observadas
- `Verificar Completude`
- fechamento do modal de resultado

### Sequencia de eventos
1. Usuario aciona [Botao: "Verificar Completude"] [Icone: Search] na [Coluna: "Acoes"] da [Tabela: DataTable] ou no cabecalho do [Card: "Detalhes: {nome}"].
2. Sistema chama `getProdutoCompletude(produto.id)` e abre o [Modal: "Completude: {nome}"].
3. O modal apresenta 3 [Indicador: percentual]: Geral, Dados Basicos e Especificacoes, com cores por faixa (verde >= 80%, amarelo >= 50%, vermelho < 50%).
4. Abaixo, [Tabela: "Dados Basicos (N/M)"] lista cada campo com [Icone: CheckCircle] ou [Icone: AlertCircle] e valor.
5. Se o produto tem subclasse, [Tabela: "Especificacoes — {subclasse} (N/M)"] lista cada campo da mascara com status.
6. Se nao tem subclasse, exibe [Alerta: "Produto sem subclasse — nao e possivel verificar especificacoes"].
7. Usuario decide se deve editar (UC-F08) ou reprocessar (UC-F09) e fecha o modal com [Botao: "Fechar"].

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 — Modal de resultado

#### Layout da Tela

```
[Modal: "Completude: {nome}"]
  [Secao: percentuais] (grid 3 colunas)
    [Indicador: "Geral"] — percentual com cor [ref: Passo 3]
    [Indicador: "Dados Basicos"] — percentual com cor [ref: Passo 3]
    [Indicador: "Especificacoes"] — percentual com cor [ref: Passo 3]

  [Tabela: "Dados Basicos (N/M)"]
    [Coluna: icone] — CheckCircle (verde) ou AlertCircle (vermelho)
    [Coluna: campo] — nome
    [Coluna: valor] — preenchido ou "Nao preenchido" [ref: Passo 4]

  [Tabela: "Especificacoes — {subclasse} (N/M)"] (condicional)
    [Coluna: icone] — CheckCircle ou AlertCircle
    [Coluna: campo (unidade)]
    [Coluna: valor] [ref: Passo 5]

  [Alerta: "Produto sem subclasse"] (condicional) [ref: Passo 6]

  [Botao: "Fechar"] [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Verificar Completude"] | 1 |
| [Indicador: percentuais] | 3 |
| [Tabela: "Dados Basicos"] | 4 |
| [Tabela: "Especificacoes"] | 5 |
| [Alerta: sem subclasse] | 6 |
| [Botao: "Fechar"] | 7 |

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
1. Usuario clica no [Toggle: "Metadados de Captacao"] [Icone: ChevronRight -> ChevronDown] no [Card: "Detalhes: {nome}"] para expandir o bloco.
2. Sistema exibe: [Tag: codigos CATMAT] com [Badge: "IA"], [Texto: descricoes CATMAT], [Tag: codigos CATSER], [Tag: termos de busca semanticos] (verde) e [Texto: "Ultima Atualizacao"].
3. Usuario clica no [Botao: "Reprocessar Metadados"] [Icone: RefreshCw].
4. Sistema chama `reprocessarMetadados(produtoId)`.
5. A pagina executa novo `getProduto(produtoId)` e atualiza os metadados exibidos no bloco expandido.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 — dentro do Card de detalhe

#### Layout da Tela

```
[Card: "Detalhes: {nome}"]
  ...
  [Toggle: "Metadados de Captacao"] [Icone: ChevronRight/Down] [Badge: "IA"] [ref: Passo 1]
    [Texto: "Codigos CATMAT"] + [Tag: codigos] [Badge: "IA"] [ref: Passo 2]
    [Texto: "Descricoes CATMAT"] [ref: Passo 2]
    [Texto: "Codigos CATSER"] + [Tag: codigos] [ref: Passo 2]
    [Texto: "Termos de Busca Semanticos"] + [Tag: termos] (verde) [ref: Passo 2]
    [Texto: "Ultima Atualizacao"] — data/hora [ref: Passo 2]
    [Botao: "Reprocessar Metadados"] [Icone: RefreshCw] — roxo [ref: Passo 3]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Toggle: "Metadados de Captacao"] | 1 |
| [Tag: CATMAT / CATSER / termos] | 2 |
| [Texto: "Ultima Atualizacao"] | 2 |
| [Botao: "Reprocessar Metadados"] | 3 |

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
1. Usuario acessa a [Aba: "Classificacao"] [Icone: ClipboardList] na PortfolioPage.
2. Sistema lista areas no [Card: "Estrutura de Classificacao"] como itens expansiveis.
3. Usuario clica para expandir uma [Lista: Area] [Icone: ChevronRight -> ChevronDown] e depois uma [Lista: Classe].
4. Sistema exibe [Lista: Subclasse] com [Badge: NCM] e contagem de campos da mascara.
5. O [Card: "Funil de Monitoramento"] exibe 3 etapas: "Monitoramento Continuo" (com contagem de ativos), "Filtro Inteligente" (com [Tag: categorias de classes]) e "Classificacao Automatica" (contagem de classes). O [Badge: StatusBadge] mostra "Agente Ativo" ou "Agente Inativo" com data da ultima verificacao.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 3 de 3 — "Classificacao"

#### Layout da Tela

```
[Aba: "Classificacao"] [Icone: ClipboardList]

[Card: "Estrutura de Classificacao"]
  [Subtitulo: "Area > Classe > Subclasse (com mascaras de especificacao)"]
  [Lista: Areas] (expansivel)
    [Icone: ChevronRight/Down] [Icone: FolderOpen] [Texto: nome da area] [Badge: "N classe(s)"] [ref: Passo 3]
    [Lista: Classes] (expansivel, aninhada)
      [Icone: ChevronRight/Down] [Texto: nome da classe] [Badge: "N subclasse(s)"] [ref: Passo 3]
      [Lista: Subclasses]
        [Texto: nome] [Badge: "NCM: XXXX.XX.XX"] [Badge: "N campo(s)"] [ref: Passo 4]
  [Texto: nota IA] — "A estrutura e gerenciada nos CRUDs..."

[Card: "Funil de Monitoramento"] [Icone: Radio]
  [Subtitulo: "O Agente Autonomo que Monitora o Mercado por Voce"]
  [Secao: funil 3 etapas]
    [Texto: "Monitoramento Continuo"] — contagem de ativos [ref: Passo 5]
    [Texto: "Filtro Inteligente"] + [Tag: categorias] [ref: Passo 5]
    [Texto: "Classificacao Automatica"] — N classes [ref: Passo 5]
  [Badge: StatusBadge] — "Agente Ativo" ou "Agente Inativo" [ref: Passo 5]
  [Texto: "Ultima verificacao"] — data/hora [ref: Passo 5]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Classificacao"] | 1 |
| [Card: "Estrutura de Classificacao"] | 2 |
| [Lista: Area expand/collapse] | 3 |
| [Lista: Classe expand/collapse] | 3 |
| [Lista: Subclasse + NCM + campos] | 4 |
| [Card: "Funil de Monitoramento"] | 5 |
| [Badge: StatusBadge agente] | 5 |

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
1. Usuario acessa a [Aba: "Score"] [Icone: Settings] na ParametrizacoesPage.
2. Sistema carrega `parametros_score` e popula os campos dos dois cards.
3. Usuario ajusta os pesos no [Card: "Pesos das Dimensoes"]: [Campo: "Peso Tecnico"], [Campo: "Peso Documental"], [Campo: "Peso Complexidade"], [Campo: "Peso Juridico"], [Campo: "Peso Logistico"], [Campo: "Peso Comercial"]. O [Indicador: soma] exibe a soma atual com cor verde (= 1.00) ou vermelha.
4. Usuario clica [Botao: "Salvar Pesos"]. Se soma != 1.00, exibe alerta e nao salva.
5. Usuario ajusta limiares no [Card: "Limiares de Decisao GO / NO-GO"]: [Campo: "Minimo para GO" / "Maximo para NO-GO"] para Score Final, Score Tecnico e Score Juridico. O [Texto: regra atual] exibe a regra combinada.
6. Usuario clica [Botao: "Salvar Limiares"]. Sistema persiste em `parametros_score`.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 1 de 5 — "Score"

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Icone: Settings]
  [Titulo: "Parametrizacoes"]
  [Subtitulo: "Configuracoes gerais do sistema"]

[Aba: "Score"] | [Aba: "Comercial"] | [Aba: "Fontes de Busca"] | [Aba: "Notificacoes"] | [Aba: "Preferencias"]

[Card: "Pesos das Dimensoes"]
  [Subtitulo: "Pesos que ponderam cada dimensao no calculo do score final (devem somar 1.00)"]
  (form-grid-2)
  [Campo: "Peso Tecnico"] — number [ref: Passo 3]
  [Campo: "Peso Documental"] — number [ref: Passo 3]
  [Campo: "Peso Complexidade"] — number [ref: Passo 3]
  [Campo: "Peso Juridico"] — number [ref: Passo 3]
  [Campo: "Peso Logistico"] — number [ref: Passo 3]
  [Campo: "Peso Comercial"] — number [ref: Passo 3]
  [Indicador: "Soma atual: X.XX"] — verde ou vermelho [ref: Passo 3]
  [Botao: "Salvar Pesos"] — primary [ref: Passo 4]

[Card: "Limiares de Decisao GO / NO-GO"]
  [Subtitulo: "Defina os limiares para classificacao automatica dos editais"]
  [Secao: "Score Final"]
    [Campo: "Minimo para GO"] — number [ref: Passo 5]
    [Campo: "Maximo para NO-GO"] — number [ref: Passo 5]
  [Secao: "Score Tecnico"]
    [Campo: "Minimo para GO"] — number [ref: Passo 5]
    [Campo: "Maximo para NO-GO"] — number [ref: Passo 5]
  [Secao: "Score Juridico"]
    [Campo: "Minimo para GO"] — number [ref: Passo 5]
    [Campo: "Maximo para NO-GO"] — number [ref: Passo 5]
  [Texto: "Regra atual: GO: ... / NO-GO: ... / AVALIAR: demais"] [ref: Passo 5]
  [Botao: "Salvar Limiares"] — primary [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Score"] | 1 |
| [Campo: pesos (6 campos)] | 3 |
| [Indicador: soma] | 3 |
| [Botao: "Salvar Pesos"] | 4 |
| [Campo: limiares (6 campos)] | 5 |
| [Texto: "Regra atual"] | 5 |
| [Botao: "Salvar Limiares"] | 6 |

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
1. Usuario acessa a [Aba: "Comercial"] [Icone: Globe] na ParametrizacoesPage.
2. No [Card: "Regiao de Atuacao"] [Icone: MapPin], usuario marca [Checkbox: "Atuar em todo o Brasil"] ou seleciona estados individuais clicando nos [Botao: UF] (27 botoes). Clica [Botao: "Salvar Estados"].
3. No [Card: "Tempo de Entrega"], usuario informa [Campo: "Prazo maximo aceito (dias)"] e [Select: "Frequencia maxima"] (Diaria, Semanal, Quinzenal, Mensal). Clica [Botao: "Salvar Prazo/Frequencia"].
4. No [Card: "Mercado (TAM/SAM/SOM)"], usuario define [Campo: "TAM"] (R$), [Campo: "SAM"] (R$) e [Campo: "SOM"] (R$). Clica [Botao: "Salvar Mercado"]. O [Botao: "Calcular com IA (Onda 4)"] esta desabilitado.
5. No [Card: "Custos e Margens"] [Icone: DollarSign], usuario informa [Campo: "Markup Padrao (%)"], [Campo: "Custos Fixos Mensais (R$)"] e [Campo: "Frete Base (R$)"]. Clica [Botao: "Salvar Custos"].
6. No [Card: "Modalidades de Licitacao Desejadas"], usuario marca [Checkbox: modalidades] (carregadas do backend). Clica [Botao: "Salvar Modalidades"].
7. Sistema salva cada bloco em `parametros_score`.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 2 de 5 — "Comercial"

#### Layout da Tela

```
[Aba: "Comercial"] [Icone: Globe]

[Card: "Regiao de Atuacao"] [Icone: MapPin]
  [Checkbox: "Atuar em todo o Brasil"] [ref: Passo 2]
  [Secao: grid de 27 estados]
    [Botao: "AC"] [Botao: "AL"] ... [Botao: "TO"] [ref: Passo 2]
  [Texto: "Estados selecionados: ..."] [ref: Passo 2]
  [Botao: "Salvar Estados"] — primary [ref: Passo 2]

[Card: "Tempo de Entrega"]
  [Campo: "Prazo maximo aceito (dias)"] — number [ref: Passo 3]
  [Select: "Frequencia maxima"] — Diaria|Semanal|Quinzenal|Mensal [ref: Passo 3]
  [Botao: "Salvar Prazo/Frequencia"] — primary [ref: Passo 3]

[Card: "Mercado (TAM/SAM/SOM)"]
  [Campo: "TAM (Mercado Total)"] — text, prefix "R$" [ref: Passo 4]
  [Campo: "SAM (Mercado Alcancavel)"] — text, prefix "R$" [ref: Passo 4]
  [Campo: "SOM (Mercado Objetivo)"] — text, prefix "R$" [ref: Passo 4]
  [Botao: "Salvar Mercado"] — primary [ref: Passo 4]
  [Botao: "Calcular com IA (Onda 4)"] — desabilitado

[Card: "Custos e Margens"] [Icone: DollarSign]
  [Campo: "Markup Padrao (%)"] — number [ref: Passo 5]
  [Campo: "Custos Fixos Mensais (R$)"] — number, prefix "R$" [ref: Passo 5]
  [Campo: "Frete Base (R$)"] — number, prefix "R$" [ref: Passo 5]
  [Botao: "Salvar Custos"] — primary [ref: Passo 5]

[Card: "Modalidades de Licitacao Desejadas"]
  [Subtitulo: "Selecione as modalidades em que a empresa deseja participar"]
  [Checkbox: modalidade 1] [ref: Passo 6]
  [Checkbox: modalidade 2] [ref: Passo 6]
  ... (carregadas do backend)
  [Botao: "Salvar Modalidades"] — primary [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Comercial"] | 1 |
| [Checkbox: "Atuar em todo o Brasil"] | 2 |
| [Botao: UF] (27 botoes) | 2 |
| [Botao: "Salvar Estados"] | 2 |
| [Campo: "Prazo maximo aceito (dias)"] | 3 |
| [Select: "Frequencia maxima"] | 3 |
| [Botao: "Salvar Prazo/Frequencia"] | 3 |
| [Campo: "TAM" / "SAM" / "SOM"] | 4 |
| [Botao: "Salvar Mercado"] | 4 |
| [Campo: "Markup Padrao (%)" / "Custos Fixos" / "Frete Base"] | 5 |
| [Botao: "Salvar Custos"] | 5 |
| [Checkbox: modalidades] | 6 |
| [Botao: "Salvar Modalidades"] | 6 |

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
1. Usuario acessa a [Aba: "Fontes de Busca"] [Icone: Globe] na ParametrizacoesPage.
2. No [Card: "Fontes de Editais"], usuario revisa a [Lista: fontes] com nome, tipo (API/Scraper) e [Badge: "Ativa"/"Inativa"]. Pode clicar [Icone-Acao: Play/Pause] para ativar ou desativar cada fonte. O [Botao: "Gerenciar Fontes"] redireciona ao CRUD.
3. No [Card: "Palavras-chave de Busca"], usuario clica [Botao: "+ Editar"] para abrir o modo edicao, digita no [Campo: "Palavras-chave (separadas por virgula)"] e clica [Botao: "Salvar"]. O [Botao: "Gerar do portfolio (Onda 4)"] esta desabilitado.
4. No [Card: "NCMs para Busca"], usuario clica [Botao: "+ Adicionar NCM"] para abrir edicao, digita no [Campo: "NCMs (separados por virgula)"] e clica [Botao: "Salvar"]. O [Botao: "Sincronizar NCMs (Onda 4)"] esta desabilitado.
5. Sistema persiste as configuracoes em `parametros_score` e `fontes_editais`.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 3 de 5 — "Fontes de Busca"

#### Layout da Tela

```
[Aba: "Fontes de Busca"] [Icone: Globe]

[Card: "Fontes de Editais"]
  [Subtitulo: "Fontes ativas para busca de editais"]
  [Botao: "Gerenciar Fontes"] [Icone: Settings] — primary, header action [ref: Passo 2]
  [Lista: fontes]
    [Texto: nome da fonte] [Texto: tipo (API/Scraper)]
    [Badge: "Ativa" / "Inativa"] [ref: Passo 2]
    [Icone-Acao: Play/Pause] — ativar/desativar [ref: Passo 2]

[Card: "Palavras-chave de Busca"]
  [Botao: "Gerar do portfolio (Onda 4)"] — desabilitado
  (modo leitura)
  [Tag: palavra-chave 1] [Tag: palavra-chave 2] ... [ref: Passo 3]
  [Botao: "+ Editar"] [ref: Passo 3]
  (modo edicao)
  [Campo: "Palavras-chave (separadas por virgula)"] — text [ref: Passo 3]
  [Botao: "Salvar"] — primary [ref: Passo 3]
  [Botao: "Cancelar"]

[Card: "NCMs para Busca"]
  [Subtitulo: "Extraidos automaticamente das classes/subclasses do portfolio"]
  [Botao: "Sincronizar NCMs (Onda 4)"] — desabilitado
  (modo leitura)
  [Tag: NCM 1] [Tag: NCM 2] ... [ref: Passo 4]
  [Botao: "+ Adicionar NCM"] [ref: Passo 4]
  (modo edicao)
  [Campo: "NCMs (separados por virgula)"] — text [ref: Passo 4]
  [Botao: "Salvar"] — primary [ref: Passo 4]
  [Botao: "Cancelar"]
  [Texto: "NCMs sao usados para busca direta no PNCP por codigo de produto"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Fontes de Busca"] | 1 |
| [Lista: fontes] | 2 |
| [Badge: "Ativa"/"Inativa"] | 2 |
| [Icone-Acao: Play/Pause] | 2 |
| [Botao: "Gerenciar Fontes"] | 2 |
| [Tag: palavras-chave] | 3 |
| [Botao: "+ Editar"] | 3 |
| [Campo: palavras-chave] | 3 |
| [Botao: "Salvar" (palavras)] | 3 |
| [Tag: NCMs] | 4 |
| [Botao: "+ Adicionar NCM"] | 4 |
| [Campo: NCMs] | 4 |
| [Botao: "Salvar" (NCMs)] | 4 |

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
1. Usuario abre a [Aba: "Notificacoes"] [Icone: Bell] na ParametrizacoesPage.
2. No [Card: "Configuracoes de Notificacao"], usuario preenche [Campo: "Email para notificacoes"], marca os [Checkbox: "Email"], [Checkbox: "Sistema"], [Checkbox: "SMS"] na secao "Receber por", e seleciona [Select: "Frequencia do resumo"] (Imediato, Diario, Semanal).
3. Usuario clica [Botao: "Salvar"]. Sistema persiste. Exibe [Badge: "Salvo!"].
4. Usuario abre a [Aba: "Preferencias"] [Icone: Palette].
5. No [Card: "Preferencias do Sistema"], usuario seleciona [Radio: "Tema"] (Escuro/Claro), [Select: "Idioma"] (Portugues, English, Espanol) e [Select: "Fuso horario"] (Sao Paulo, Manaus, Belem).
6. Usuario clica [Botao: "Salvar"]. Sistema persiste. Exibe [Badge: "Salvo!"].

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 4 e Tab 5 de 5

#### Layout da Tela — Tab "Notificacoes"

```
[Aba: "Notificacoes"] [Icone: Bell]

[Card: "Configuracoes de Notificacao"]
  [Campo: "Email para notificacoes"] — email [ref: Passo 2]
  [Secao: "Receber por"]
    [Checkbox: "Email"] [ref: Passo 2]
    [Checkbox: "Sistema"] [ref: Passo 2]
    [Checkbox: "SMS"] [ref: Passo 2]
  [Select: "Frequencia do resumo"] — Imediato|Diario|Semanal [ref: Passo 2]
  [Botao: "Salvar"] — primary [ref: Passo 3]
  [Badge: "Salvo!"] (temporario) [ref: Passo 3]
```

#### Layout da Tela — Tab "Preferencias"

```
[Aba: "Preferencias"] [Icone: Palette]

[Card: "Preferencias do Sistema"]
  [Radio: "Tema"]
    [Radio: "Escuro"] [ref: Passo 5]
    [Radio: "Claro"] [ref: Passo 5]
  [Select: "Idioma"] — pt-BR|en-US|es-ES [ref: Passo 5]
  [Select: "Fuso horario"] — America/Sao_Paulo|Manaus|Belem [ref: Passo 5]
  [Botao: "Salvar"] — primary [ref: Passo 6]
  [Badge: "Salvo!"] (temporario) [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Notificacoes"] | 1 |
| [Campo: "Email para notificacoes"] | 2 |
| [Checkbox: "Email" / "Sistema" / "SMS"] | 2 |
| [Select: "Frequencia do resumo"] | 2 |
| [Botao: "Salvar" (notificacoes)] | 3 |
| [Aba: "Preferencias"] | 4 |
| [Radio: "Tema"] | 5 |
| [Select: "Idioma"] | 5 |
| [Select: "Fuso horario"] | 5 |
| [Botao: "Salvar" (preferencias)] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## Conclusoes desta rodada

1. O UC de portfolio que extrai produto e especificacoes por IA nao pode ser achatado em um cadastro generico; o codigo possui fluxo proprio, prompts distintos por tipo de origem e suporte a extracao multipla para `NFS` e `Plano de Contas`.
2. Os botoes da `PortfolioPage` se dividem em quatro grupos funcionais: navegacao da grade, enriquecimento por IA, verificacao tecnica e manutencao direta do cadastro.
3. Nem todo botao da tela persiste direto em CRUD: `Reprocessar IA` e `Precos de Mercado` delegam trabalho ao subsistema de chat; `Buscar ANVISA` e `Buscar na Web` usam sessoes de IA; `Reprocessar Metadados` usa endpoint proprio.
4. Os recursos marcados como `Onda 4` em `ParametrizacoesPage` nao devem entrar como implementados no escopo desta fundacao.
5. **V2:** Todos os elementos interativos de tela (botoes, campos, tabelas, modais, badges, toggles, checkboxes, selects, indicadores) estao mapeados bidirecionalmente com os passos da sequencia de eventos. Gaps do V1 foram corrigidos: Card "Alertas IA" documentado em UC-F03, dropdown "Frequencia" adicionado em UC-F04, CapSolver adicionado em UC-F04, Pipeline badges adicionados em UC-F06, UC-F17 apresenta 2 tabs separados.
