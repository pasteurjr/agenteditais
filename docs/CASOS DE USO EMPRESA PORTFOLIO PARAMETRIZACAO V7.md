# CASOS DE USO — EMPRESA, PORTFOLIO E PARAMETRIZACAO

<!-- V7 GENERATED — secao 'UCs predecessores' adicionada automaticamente em 2026-04-28 -->


**Data:** 27/04/2026
**Versao:** 6.0
**Base:** `requisitos_completosv6.md` (RF-001 a RF-018) + implementacao real de `EmpresaPage.tsx`, `PortfolioPage.tsx`, `ParametrizacoesPage.tsx`, `backend/crud_routes.py`, `backend/app.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso da fundacao do sistema com base no comportamento realmente implementado, com foco em secoes, abas, botoes, respostas do sistema, persistencia e integracoes observadas em codigo e banco.
**Novidade V3:** Cada UC agora inclui uma secao **Regras de Negocio aplicaveis** referenciando as RNs formalizadas na secao 13 do `requisitos_completosv8.md`. Esta sprint mapeia 42 RNs (presentes + faltantes). Todo o conteudo V2 permanece preservado.
**Novidade V4 (13/04/2026):** Adicionada secao **Regras de Negocio Implementadas (V4)** logo abaixo, documentando as RNs ja enforcadas no backend (modo warn-only por padrao). Cada UC afetado recebe uma linha `**RNs aplicadas:**` logo apos o titulo.
**Novidade V5 (21/04/2026):** Adicionados **Fluxos Alternativos (FA)** e **Fluxos de Excecao (FE)** para cada UC, numerados FA-01..N e FE-01..N. Incorporadas correcoes identificadas na avaliacao do validador Arnaldo (`correcaaval1.md`): UC-F01 UF como dropdown, falta toast de sucesso, duplicidade de telas; UC-F02 telefone sem mascara, area padrao pode estar vazia; UC-F04 fontes de certidoes devem ser inicializadas antes; UC-F06 filtro de busca nao busca em descricao/categoria.
**Novidade V6 (27/04/2026):** Adicionado **FA-07 do UC-F01 — Super sem empresa vinculada (primeiro acesso ou ambiente recem-instalado)**. Necessario para suportar o ciclo da trilha de validacao automatica visual onde o usuario `valida<N>@valida.com.br` (super) e provisionado sem vinculos previos. Inclui apenas: nova tela `[Página: "Sem Empresa Vinculada"]` com 3 opcoes que **redirecionam para paginas existentes** (Criar nova empresa → CRUD `crud:empresas`; Vincular empresa a usuario → `associar-empresa`; Entrar no sistema → `SelecionarEmpresaPage` se ha empresas, ou CRUD se banco vazio); ajuste no endpoint `GET /api/auth/minhas-empresas` que passa a retornar campo `vinculadas` separado de `empresas` (super ainda ve todas as empresas em `empresas`, mas suas vinculadas ficam em `vinculadas`). **Nao foram criadas paginas novas de cadastro de empresa nem endpoints novos** — reutilizacao total do que ja existe.

---

## Regras de Negocio Implementadas (V4)

Esta versao V4 documenta as Regras de Negocio (RNs) ja enforcadas no backend. Por padrao estao em modo **warn-only** (`ENFORCE_RN_VALIDATORS=false`) — logam warning mas nao bloqueiam. Ativar com `ENFORCE_RN_VALIDATORS=true`.

**Cobertura RNs neste documento:** 42 RNs unicas (RN-001 a RN-042) distribuidas entre os 17 UCs (UC-F01 a UC-F17). Linhas `**RNs aplicadas:**` em cada UC listam o conjunto completo aplicavel; itens marcados `[FALTANTE→V4]` correspondem as RNs novas implementadas nesta sprint V4.

| RN | Descricao | UC afetado | Arquivo backend |
|---|---|---|---|
| RN-028 | CNPJ valido (digito verificador) | UC de cadastro de empresa | `backend/rn_validators.py::validar_cnpj` |
| RN-029 | CPF valido (digito verificador) | UC de cadastro de responsavel | `backend/rn_validators.py::validar_cpf` |
| RN-035 | NCM no formato XXXX.XX.XX | UC de cadastro de produto | `backend/rn_validators.py::validar_ncm` |
| RN-040 | FK com ON DELETE SET NULL (ja existia, apenas documentado) | Estrutural | `backend/models.py` |
| RN-042 | Email em formato valido (RFC-5322 simplificado) | UCs com campo email | `backend/rn_validators.py::validar_email` |
| RN-034 | Transicao de estado Produto: cadastrado→qualificado→ofertado→vencedor/perdedor | UC de gestao de produto | `backend/rn_estados.py::PRODUTO_TRANSITIONS` |
| RN-037 | Audit log universal (toda mudanca em tabela sensivel e logada em AuditoriaLog) | Todos os UCs de CRUD | `backend/rn_audit.py::log_transicao` |
| RN-086 | Ao mudar pesos do ParametroScore, invalidar scores calculados dos editais da empresa | UC de configuracao de pesos | `backend/rn_deepseek.py::invalidar_scores_empresa` |

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

**Superusuario com vinculos em `usuario_empresa`:**
1. Login → tela de selecao de empresa (lista todas as disponiveis no banco)
2. Clicar na empresa desejada → Dashboard

**Superusuario SEM vinculos em `usuario_empresa` (V6):**
1. Login → tela `[Página: "Sem Empresa Vinculada"]` com mensagem "Você não tem empresas vinculadas" e 3 opcoes:
   a. `[Botão: "Criar Nova Empresa"]` → leva a `[Página: "Cadastro Inicial de Empresa"]` (formulario Razao+CNPJ)
   b. `[Botão: "Vincular Empresa a Usuário"]` → orienta entrar no sistema e usar `/app/admin/associar-empresa`
   c. `[Botão: "Entrar no Sistema"]` → habilita SE houver empresas no banco; leva a tela de selecao de empresa
2. Caso a) cria empresa+vinculo atomicamente (papel=admin) e redireciona para `EmpresaPage` para completar dados.

**Usuario normal:**
1. Login → Dashboard direto (empresa ja vinculada automaticamente)
2. Caso nao tenha vinculo, vê tela `[Página: "Sem Empresa Vinculada"]` apenas com botao `[Botão: "Sair"]` e mensagem "Entre em contato com o administrador".

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
| `/api/auth/minhas-empresas` | GET | Lista empresas (super ve todas) + lista `vinculadas` (do `usuario_empresa`) — V6 |
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

**RNs aplicadas:** RN-001, RN-002, RN-003, RN-022, RN-023, RN-024, RN-025, RN-028 [FALTANTE→V4]

**RF relacionados:** RF-001, RF-005

**Regras de Negocio aplicaveis:**
- Presentes: RN-001, RN-002, RN-003, RN-022, RN-023, RN-024, RN-025
- Faltantes: RN-028 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Usuario autenticado (ver secao Modelo de Acesso).
2. CRUD de `empresas` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F18 (uses)**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Registro em `empresas` criado ou atualizado.
2. Dados cadastrais ficam reutilizaveis nas demais etapas do sistema.

### Botoes e acoes observadas
- `Salvar Alteracoes`
- `Tentar novamente` em caso de erro

### Sequencia de eventos
1. Usuario acessa `EmpresaPage` via menu lateral "Configuracoes > Empresa".
2. Sistema carrega a primeira empresa do usuario via `crudList("empresas", { limit: 1 })` e popula o [Card: "Informacoes Cadastrais"].
3. Usuario revisa e altera os campos do [Card: "Informacoes Cadastrais"]: [Campo: "Razao Social"], [Campo: "Nome Fantasia"], [Campo: "CNPJ"], [Campo: "Inscricao Estadual"] na [Secao: "Dados Basicos"]; [Campo: "Website"], [Campo: "Instagram"], [Campo: "LinkedIn"], [Campo: "Facebook"] na [Secao: "Presenca Digital"]; [Campo: "Endereco"], [Campo: "Cidade"], [Campo: "UF"] (**deve ser dropdown/select com os 27 estados — V5 correcao**), [Campo: "CEP"] na [Secao: "Endereco"].
4. Usuario clica no [Botao: "Salvar Alteracoes"] no rodape do [Card: "Informacoes Cadastrais"].
5. Sistema cria ou atualiza o registro em `empresas`. Exibe [Toast] de confirmacao (**V5 correcao: toast de sucesso deve ser implementado — atualmente ausente**) ou [Alerta] de erro com [Botao: "Tentar novamente"].

> **Nota:** Este card e compartilhado com UC-F02. Ver [UC-F02] para os elementos de Emails, Telefones e Area de Atuacao Padrao.

> **Correcao V5 (Arnaldo OBS-05):** Existe duplicidade de telas de edicao de empresa entre "Cadastros > Empresa" (CRUD generico) e "Configuracoes > Empresa" (EmpresaPage completa). O tutorial deve instruir explicitamente para usar "Configuracoes > Empresa".

### Fluxos Alternativos

**FA-01 — Usuario cancela a edicao antes de salvar**
1. Usuario altera campos no formulario.
2. Usuario navega para outra pagina sem clicar "Salvar Alteracoes".
3. Sistema nao persiste as alteracoes. Ao retornar, os dados originais sao recarregados.

**FA-02 — Facebook deixado em branco (campo opcional)**
1. No Passo 3, usuario preenche todos os campos exceto [Campo: "Facebook"].
2. Sistema aceita o salvamento sem erro — campo opcional.
3. O registro persiste com Facebook = null/vazio.

**FA-03 — Empresa ja possui dados cadastrados**
1. No Passo 2, sistema carrega dados pre-existentes nos campos.
2. Usuario sobrescreve os valores desejados.
3. Sistema atualiza (PUT) em vez de criar (POST).

**FA-04 — Usuario acessa via "Cadastros > Empresa" (CRUD generico)**
1. Usuario navega para "Cadastros > Empresa" em vez de "Configuracoes > Empresa".
2. Sistema exibe CRUD generico simplificado (sem redes sociais, endereco completo, etc.).
3. Alteracoes feitas aqui atualizam a mesma tabela `empresas`, porem com menos campos.

**FA-07 — Super sem empresa vinculada (primeiro acesso, ambiente recem-instalado, ou usuario provisionado para validacao) — V6**

> **Pre-condicao:** `users.super=true` E `usuario_empresa` nao tem nenhum registro com `user_id = <usuario logado>` (ativo).

> **Motivacao:** sem este fluxo, o super cai numa tela de erro morta ("Sem empresa vinculada — contate admin") e fica preso, mesmo tendo poderes de admin. Tambem necessario para o ciclo da trilha de validacao automatica visual onde `valida<N>@valida.com.br` é provisionado super sem vinculo previo.

> **Principio de design:** **reutilizar tudo o que ja existe**. Nao criar tela nova de cadastro nem endpoint novo de empresa — apenas oferecer ao super 3 atalhos para paginas/funcoes existentes.

1. Apos login bem-sucedido, sistema chama `GET /api/auth/minhas-empresas` que retorna `{empresas: [...], vinculadas: []}` — `vinculadas` vazio.
2. Frontend detecta `isSuper && vinculadas.length === 0` e exibe **`[Página: "Sem Empresa Vinculada"]`** com:
   - Mensagem: "Você não tem empresas vinculadas"
   - Subtexto: "Como superusuário, você pode escolher uma das opções abaixo"
   - `[Botão: "Criar Nova Empresa"]` (azul) — redireciona para `[Página: "Cadastros > Empresa"]` existente (`crud:empresas`)
   - `[Botão: "Vincular Empresa a Usuário"]` (roxo) — redireciona para `[Página: "Associar Empresa/Usuario"]` existente (`/app/admin/associar-empresa`)
   - `[Botão: "Entrar no Sistema"]` (verde) — habilitado se `empresas.length > 0`, desabilitado se banco vazio
   - `[Botão: "Sair"]` (transparente)
3. **FA-07.A — Caminho "Criar Nova Empresa":**
   1. Usuario clica `[Botão: "Criar Nova Empresa"]`.
   2. Frontend seta `currentPage = "crud:empresas"` e libera o shell autenticado (mesmo sem empresa selecionada — comportamento exclusivo de super).
   3. Sistema renderiza CRUD generico de Empresas (`CrudPage` com `empresaConfig`), com botao `[Novo]` ja visivel.
   4. Usuario clica `[Novo]`, preenche dados e salva via CRUD generico (POST/PUT em `/api/crud/empresas`).
   5. Apos criar, super pode usar menu Admin → Associar Empresa para vincular o registro a si mesmo, ou ir para `[Página: "Selecionar Empresa"]` que ja lista a empresa recem-criada (super ve todas).
   6. Apos selecionar empresa, segue para EmpresaPage (UC-F01 fluxo principal) ou outra pagina.
4. **FA-07.B — Caminho "Vincular Empresa a Usuário":**
   1. Usuario clica `[Botão: "Vincular Empresa a Usuário"]`.
   2. Frontend seta `currentPage = "associar-empresa"` e libera o shell autenticado.
   3. Sistema renderiza `AssociarEmpresaUsuario` (pagina existente em `/app/admin/associar-empresa`).
   4. Super seleciona usuario + empresa + papel e cria vinculo via `POST /api/admin/associar-empresa` (endpoint existente).
   5. Apos vincular, pode usar `[Página: "Selecionar Empresa"]` para entrar.
5. **FA-07.C — Caminho "Entrar no Sistema":**
   1. Usuario clica `[Botão: "Entrar no Sistema"]`.
   2. Se `minhasEmpresasList.length > 0` (super ve todas as empresas do banco), sistema renderiza `[Página: "Selecionar Empresa"]` existente.
   3. Se banco vazio (`length === 0`), sistema redireciona automaticamente para FA-07.A.
6. **Pos-condicao FA-07.A:** existe novo registro em `empresas` (criado via CRUD existente). Vinculo opcional via FA-07.B em sequencia.
7. **Pos-condicao FA-07.B:** existe novo registro em `usuario_empresa` ligando o super (ou outro usuario) a uma empresa existente.
8. **Pos-condicao FA-07.C:** super selecionou uma das empresas existentes e esta no shell normal do sistema.

**Tela representativa de [Página: "Sem Empresa Vinculada"]:**

```
[Logo + icone construcao]
[Titulo: "Você não tem empresas vinculadas"]
[Subtitulo: "Como superusuário, você pode escolher uma das opções abaixo"]

[Botão azul: "➕ Criar Nova Empresa"]              -> abre CRUD de Empresas existente
[Botão roxo: "🔗 Vincular Empresa a Usuário"]      -> abre Associar Empresa/Usuario existente
[Botão verde: "▶️ Entrar no Sistema (N empresas)"] -> abre Selecionar Empresa existente
                                                     (desabilitado se N=0)

[Botão transparente: "Sair"]
```

**Por que NAO criar pagina nem endpoint novo:** a regra de design e maximizar reuso. O CRUD generico de empresas ja existe e ja faz validacao de CNPJ (RN-028), e a pagina de Associar Empresa/Usuario ja existe e ja chama o endpoint existente de vinculacao. A unica novidade necessaria e a tela `[Sem Empresa Vinculada]` que e simplesmente um menu de 3 botoes redirecionando para essas paginas.

**RNs aplicadas no FA-07:** RN-001 (validar CNPJ — feita pelo CRUD generico), RN-002 (Razao Social obrigatoria — feita pelo CRUD generico), RN-022 (vinculacao via endpoint existente). Nenhuma RN nova adicionada.

### Fluxos de Excecao

**FE-01 — CNPJ invalido (digito verificador incorreto)**
1. No Passo 3, usuario informa CNPJ com formato correto mas digito verificador errado (ex: `00.000.000/0000-00`).
2. Sistema valida via RN-028 (`validar_cnpj`).
3. Exibe [Alerta] ou [Toast] vermelho: "CNPJ invalido".
4. Registro NAO e salvo.

**FE-02 — CNPJ em formato incorreto**
1. Usuario digita CNPJ sem pontuacao ou com caracteres invalidos.
2. Sistema rejeita no frontend (mascara) ou backend (validacao).
3. Exibe mensagem de formato invalido.

**FE-03 — Servidor fora do ar / erro de rede**
1. Usuario clica "Salvar Alteracoes" mas o backend nao responde.
2. Sistema exibe [Alerta] de erro com [Botao: "Tentar novamente"].
3. Dados permanecem no formulario para reenvio.

**FE-04 — Razao Social em branco (campo obrigatorio)**
1. Usuario deixa [Campo: "Razao Social"] vazio e tenta salvar.
2. Sistema exibe erro de validacao: "Razao Social e obrigatoria".
3. Registro NAO e salvo.

**FE-05 — UF digitada como texto livre (bug conhecido)**
1. Campo UF e TextInput em vez de SelectInput.
2. Usuario digita valor invalido (ex: "XX").
3. Sistema aceita o valor — nao ha validacao de UF no backend.
4. **Correcao V5:** UF deve ser trocado para dropdown com 27 estados.

**FE-06 — Toast de sucesso nao aparece (bug conhecido)**
1. Usuario salva com dados validos.
2. Backend retorna 200 OK, dados sao persistidos.
3. Porem nenhum feedback visual e exibido ao usuario.
4. **Correcao V5:** Adicionar toast "Dados salvos com sucesso" apos PUT bem-sucedido.

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
    [Campo: "UF"] — **select (dropdown 27 UFs)** [ref: Passo 3] (V5 correcao: atualmente TextInput)
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

**RNs aplicadas:** RN-022, RN-023, RN-042 [FALTANTE→V4]

**RF relacionados:** RF-001, RF-005

**Regras de Negocio aplicaveis:**
- Presentes: RN-022
- Faltantes: RN-042 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Empresa em edicao.
2. Lista de areas carregada de `/api/areas-produto`.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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
2. Usuario adiciona ou remove telefones na [Secao: "Celulares / Telefones"]: digita no [Campo: "Novo telefone..."] e clica [Botao: "Adicionar"]; ou clica [Icone-Acao: X] para remover. (**V5 correcao: campo de telefone nao possui mascara — recomendado implementar mascara `(XX) XXXXX-XXXX` / `(XX) XXXX-XXXX`**)
3. Usuario seleciona a [Campo: "Area de Atuacao Padrao"] (select com areas do backend).
4. Usuario clica no [Botao: "Salvar Alteracoes"] no rodape do [Card: "Informacoes Cadastrais"].
5. Sistema persiste os contatos serializados e a area padrao no registro da empresa.

> **Nota:** Compartilha o mesmo [Card: "Informacoes Cadastrais"] do UC-F01.

### Fluxos Alternativos

**FA-01 — Usuario nao adiciona nenhum email nem telefone**
1. Usuario pula os Passos 1 e 2 e vai direto para Passo 3 (area padrao) ou Passo 4 (salvar).
2. Sistema aceita — campos email e telefone sao opcionais (nullable=True no modelo).
3. Registro salvo com `emails` e `celulares` vazios.

**FA-02 — Usuario remove email ou telefone existente**
1. Usuario clica [Icone-Acao: X] em um email ja cadastrado.
2. O email e removido da lista visual.
3. Ao salvar, a lista serializada nao contem mais o item removido.

**FA-03 — Area padrao nao selecionada**
1. Usuario nao altera [Campo: "Area de Atuacao Padrao"], deixando-o vazio ou com valor anterior.
2. Sistema aceita — area padrao e opcional.
3. Registro salvo com `area_padrao_id` = null ou mantido.

### Fluxos de Excecao

**FE-01 — Email em formato invalido**
1. Usuario digita email sem "@" ou com formato incorreto (ex: "joao.com").
2. Sistema valida via RN-042 (`validar_email`).
3. Exibe [Toast] ou [Alerta] vermelho: "Email em formato invalido".
4. Email NAO e adicionado a lista.

**FE-02 — Email duplicado**
1. Usuario tenta adicionar email ja existente na lista.
2. Sistema deve detectar duplicidade e nao adicionar novamente.
3. Exibe mensagem informativa.

**FE-03 — Area padrao esta vazia (lista sem opcoes)**
1. No Passo 3, o [Select: "Area de Atuacao Padrao"] nao exibe nenhuma opcao.
2. Causa: nenhuma area cadastrada em `areas_produto` para esta empresa/usuario.
3. **Correcao V5 (Arnaldo OBS-12):** Garantir que areas sejam populadas antes (UC-F13 deve vir antes, ou seed deve conter areas).

**FE-04 — Telefone com formato inconsistente (sem mascara)**
1. Usuario digita telefone sem parenteses ou hifen (ex: "11987654321").
2. Sistema aceita — nao ha mascara implementada.
3. **Correcao V5 (Arnaldo OBS-10):** Implementar mascara de telefone.

**FE-05 — Erro ao salvar (servidor indisponivel)**
1. Usuario clica "Salvar Alteracoes" mas backend nao responde.
2. Sistema exibe [Alerta] de erro.
3. Dados permanecem no formulario.

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

**RNs aplicadas:** RN-023, RN-039 [FALTANTE→V4]

**RF relacionados:** RF-002, RF-004

**Regras de Negocio aplicaveis:**
- Faltantes: RN-039 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa existente.
2. Endpoint `/api/empresa-documentos/upload` disponivel.
3. Lista de tipos/documentos necessarios carregada.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)
- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos

**FA-01 — Usuario cancela o upload**
1. No Passo 2, usuario abre o modal de upload.
2. Usuario clica [Botao: "Cancelar"] no rodape do modal.
3. Modal fecha sem enviar dados. Nenhum documento e criado.

**FA-02 — Documento sem data de validade**
1. No Passo 2, usuario nao preenche [Campo: "Validade"].
2. Sistema aceita o upload sem validade.
3. Documento aparece na lista com badge "OK" (sem vencimento).

**FA-03 — Upload de segundo documento do mesmo tipo**
1. Usuario tenta fazer upload de documento com mesmo tipo de um ja existente.
2. Sistema aceita — nao ha restricao de unicidade por tipo.
3. Ambos os documentos aparecem na lista.

### Fluxos de Excecao

**FE-01 — Arquivo em formato nao suportado**
1. Usuario seleciona arquivo com extensao nao aceita (ex: .exe, .zip).
2. O file input restringe via `accept=".pdf,.doc,.docx,.jpg,.png"`.
3. Se arquivo invalido for enviado, backend rejeita com erro 400.

**FE-02 — Arquivo excede tamanho maximo**
1. Usuario tenta enviar arquivo maior que o limite configurado no backend.
2. Sistema retorna erro 413 (Payload Too Large) ou mensagem de erro.
3. Documento NAO e salvo.

**FE-03 — Tipo de documento nao selecionado**
1. Usuario nao seleciona [Campo: "Tipo de Documento"] e tenta salvar.
2. Sistema exibe erro de validacao: campo obrigatorio.
3. Upload NAO e realizado.

**FE-04 — Exclusao de documento falha (Arnaldo OBS-15)**
1. Usuario clica [Icone-Acao: Trash2] para excluir documento.
2. Sistema nao responde ou exibe erro silencioso.
3. **Bug identificado V5:** Verificar se o endpoint DELETE esta disparando corretamente e se ha constraint FK impedindo exclusao.

**FE-05 — Erro de rede durante upload**
1. Conexao cai durante POST do FormData.
2. Modal permanece aberto. Toast de erro exibido.
3. Usuario pode tentar novamente.

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

**RNs aplicadas:** RN-003, RN-007, RN-008, RN-009, RN-010, RN-023, RN-026, RN-031 [FALTANTE→V4]

**RF relacionados:** RF-002

**Regras de Negocio aplicaveis:**
- Presentes: RN-003, RN-007, RN-008, RN-009, RN-010, RN-026
- Faltantes: RN-031 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa cadastrada com CNPJ.
2. Fontes de certidao configuradas ou sincronizadas. (**V5 correcao: fontes devem ser inicializadas ANTES de buscar — ver FA-01 e FE-01**)
3. Endpoints de certidoes operacionais.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)
- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Fontes de certidao nao inicializadas (pre-requisito)**
1. Antes do Passo 1, usuario deve verificar se fontes de certidao existem.
2. Se nao existirem, acessar endpoint `/api/fontes-certidoes/inicializar` ou CRUD de fontes.
3. Sistema cria 5 fontes padrao (Receita Federal, PGFN, FGTS, TST, Estadual).
4. **Correcao V5 (Arnaldo OBS-17):** Tutorial deve incluir passo de inicializacao de fontes ANTES de buscar.

**FA-02 — Busca automatica parcial (algumas fontes offline)**
1. No Passo 3, algumas fontes governamentais estao indisponiveis.
2. Sistema marca estas certidoes como "Erro" ou "Nao disponivel" na tabela.
3. Demais certidoes encontradas sao exibidas normalmente.
4. Usuario pode tentar novamente mais tarde ou usar upload manual.

**FA-03 — Upload manual sem busca automatica**
1. Usuario pula os Passos 1-4 e vai direto para Passo 7.
2. Usuario faz upload manual de PDF de certidao.
3. Sistema aceita o upload e cria registro em `empresa_certidoes`.

**FA-04 — Edicao de certidao via modal de detalhe**
1. Usuario clica [Icone-Acao: Pencil] em certidao existente.
2. Altera campos no modal e clica "Salvar".
3. Sistema atualiza o registro sem precisar buscar novamente.

### Fluxos de Excecao

**FE-01 — Nenhuma fonte de certidao cadastrada**
1. Usuario clica "Buscar Certidoes" sem fontes inicializadas.
2. Sistema retorna erro 400: "Nenhuma fonte de certidao cadastrada. Acesse Cadastros > Empresa > Fontes de Certidoes para configurar."
3. **Correcao V5 (Arnaldo OBS-17):** Sistema deveria auto-inicializar fontes ou tutorial deve instruir o passo previo.

**FE-02 — CNPJ ficticio sem resultados nos portais**
1. CNPJ da empresa e ficticio (ex: dados de teste).
2. Busca automatica retorna sem resultados de nenhum portal.
3. Sistema exibe lista vazia ou certidoes com status "Nao disponivel".
4. Comportamento esperado — usar upload manual como alternativa.

**FE-03 — Timeout na busca automatica**
1. Portais governamentais demoram mais de 60 segundos para responder.
2. Sistema aborta a conexao e marca a certidao como "Erro" ou "Timeout".
3. Usuario pode clicar "Atualizar esta certidao" para tentar individualmente.

**FE-04 — Erro de CAPTCHA**
1. Portal exige resolucao de CAPTCHA.
2. Se CapSolver nao estiver configurado, a busca falha para esta fonte.
3. Sistema exibe badge "Erro" e mensagem explicativa no modal de detalhe.

**FE-05 — Upload de arquivo invalido**
1. Usuario tenta upload de arquivo com formato nao aceito.
2. File input restringe via accept, backend rejeita com 400.

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

**RNs aplicadas:** RN-004, RN-005, RN-006, RN-023, RN-029 [FALTANTE→V4], RN-030 [FALTANTE→V4]

**RF relacionados:** RF-003

**Regras de Negocio aplicaveis:**
- Presentes: RN-004, RN-005, RN-006
- Faltantes: RN-029 [FALTANTE], RN-030 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa existente.
2. CRUD de `empresa-responsaveis` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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
2. Usuario preenche [Campo: "Tipo"] (select: Representante Legal, Preposto, Responsavel Tecnico), [Campo: "Nome"] (obrigatorio), [Campo: "Cargo"], [Campo: "Email"] (obrigatorio) e [Campo: "Telefone"]. (**V5 nota: campo CPF existe no formulario mas e opcional — tutorial deve incluir CPFs ficticios ou instruir que e opcional**)
3. Usuario clica no [Botao: "Salvar"]. Sistema cria registro em `empresa_responsaveis`.
4. A [Tabela: DataTable] e recarregada mostrando o novo responsavel.
5. Usuario pode clicar [Icone-Acao: Pencil] para editar (abre o mesmo modal com titulo "Editar Responsavel") ou [Icone-Acao: Trash2] para excluir registros existentes.

### Fluxos Alternativos

**FA-01 — Cadastro de apenas dois responsaveis (sem Preposto)**
1. Usuario cadastra Representante Legal e Responsavel Tecnico.
2. Nao cadastra Preposto.
3. Sistema aceita — Preposto NAO e obrigatorio.
4. Lista exibe dois responsaveis sem mensagem de alerta.

**FA-02 — Edicao de responsavel existente**
1. Usuario clica [Icone-Acao: Pencil] em responsavel ja cadastrado.
2. Modal "Editar Responsavel" abre com dados pre-preenchidos.
3. Usuario altera campos desejados e clica "Salvar".
4. Sistema atualiza o registro via `crudUpdate`.

**FA-03 — Campo CPF deixado em branco**
1. No Passo 2, usuario nao preenche campo CPF.
2. Sistema aceita — CPF e nullable=True, nao esta em `required`.
3. Registro salvo com CPF = null.

### Fluxos de Excecao

**FE-01 — CPF invalido (digito verificador incorreto)**
1. Usuario informa CPF com formato correto mas digito errado (ex: `000.000.000-00`).
2. Sistema valida via RN-029 (`validar_cpf`).
3. Exibe [Toast] ou [Alerta]: "CPF invalido".
4. Registro NAO e salvo.

**FE-02 — Nome em branco (campo obrigatorio)**
1. Usuario tenta salvar sem preencher [Campo: "Nome"].
2. Sistema exibe erro de validacao.
3. Modal permanece aberto.

**FE-03 — Email em formato invalido**
1. Usuario informa email incorreto (ex: "joao@").
2. Sistema valida via RN-042.
3. Exibe erro e nao salva.

**FE-04 — Permissao negada (usuario sem papel admin)**
1. Usuario com papel `operador` tenta adicionar responsavel.
2. Backend verifica `_is_admin` = False.
3. Retorna erro 403: "Apenas administradores podem criar este recurso".
4. **Nota V5 (Arnaldo OBS-20):** O validador reportou esse erro, mas valida2 e super+admin. Provavel erro de operacao (empresa nao selecionada ou token expirado).

**FE-05 — Exclusao de responsavel referenciado**
1. Usuario tenta excluir responsavel vinculado a outros registros.
2. Se houver constraint FK, backend retorna erro.
3. Exibe mensagem de erro.

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

**RNs aplicadas:** RN-011, RN-012, RN-014, RN-015, RN-023, RN-033 [FALTANTE→V4], RN-034 [FALTANTE→V4], RN-036 [FALTANTE→V4], RN-037 [FALTANTE→V4]

**RF relacionados:** RF-008, RF-009, RF-011, RF-012

**Regras de Negocio aplicaveis:**
- Presentes: RN-011, RN-012, RN-014, RN-015
- Faltantes: RN-033 [FALTANTE], RN-034 [FALTANTE], RN-036 [FALTANTE], RN-037 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio/comercial

### Pre-condicoes
1. Usuario autenticado (ver secao Modelo de Acesso).
2. Produtos cadastrados.
3. Hierarquia Area -> Classe -> Subclasse disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F07 OU UC-F08**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[seed]` — dado pre-cadastrado no banco (seed)


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
3. Usuario filtra por [Select: "Area"], [Select: "Classe"], [Select: "Subclasse"] (cascata) e digita no [Campo: busca texto] do [Tabela: FilterBar]. (**V5 correcao: filtro de texto busca APENAS em nome, fabricante e modelo — NAO busca em descricao, area, classe, subclasse ou categoria**)
4. Usuario seleciona um produto clicando na linha da [Tabela: DataTable].
5. Sistema carrega `getProduto(id)` e mostra o [Card: "Detalhes: {nome}"] com informacoes completas.
6. O detalhe exibe: classificacao (Area > Classe > Subclasse), NCM, preco de referencia, status pipeline ([Badge]), registro ANVISA, status ANVISA, descricao, [Tabela: "Especificacoes Tecnicas"] e [Toggle: "Metadados de Captacao"].

> **Correcao V5 (Arnaldo OBS-21/22):** O filtro de texto do PortfolioPage busca APENAS em `p.nome`, `p.fabricante` e `p.modelo`. NAO busca em descricao, area, classe ou subclasse. Termos como "reagente" ou "hematologia" podem nao retornar resultados se nao estiverem no nome, fabricante ou modelo dos produtos. Correcao sugerida: incluir `p.descricao` na busca. Tutorial deve usar termos que existam nos campos buscados.

### Fluxos Alternativos

**FA-01 — Nenhum produto cadastrado**
1. No Passo 2, sistema retorna lista vazia.
2. Tabela exibe "Nenhum produto encontrado" ou area vazia.
3. Badges de pipeline exibem contagem zero.

**FA-02 — Filtro por area sem resultados**
1. Usuario seleciona area que nao tem produtos associados.
2. Tabela exibe lista vazia para aquela area.
3. Usuario pode limpar o filtro para ver todos os produtos.

**FA-03 — Busca por texto sem resultados**
1. Usuario digita termo que nao existe em nenhum campo buscavel.
2. Tabela exibe lista vazia.
3. **Nota V5:** Se o termo existe em descricao mas nao no nome/fabricante/modelo, o filtro atual nao encontra.

**FA-04 — Visualizacao de detalhe sem selecao previa**
1. Usuario clica diretamente no icone de acao (Eye) na tabela.
2. Sistema carrega o detalhe do produto correspondente.

### Fluxos de Excecao

**FE-01 — Busca por "reagente" nao retorna resultados (bug conhecido)**
1. Produtos da empresa contem "reagente" na descricao ou subclasse, mas NAO no nome, fabricante ou modelo.
2. Filtro de texto nao encontra correspondencia.
3. **Correcao V5 (Arnaldo OBS-21):** Adicionar `p.descricao` ao filtro de busca no PortfolioPage.tsx.

**FE-02 — Busca por "hematologia" nao retorna resultados (bug conhecido)**
1. Produto "Kit Hemograma Sysmex XN" contem "hemograma" mas NAO "hematologia".
2. Busca por "hematologia" nao retorna resultado.
3. **Correcao V5 (Arnaldo OBS-22):** Usar "hemograma" como termo de busca, ou renomear produto.

**FE-03 — Hierarquia Area/Classe/Subclasse nao carrega**
1. Endpoint `/api/areas-produto` retorna erro ou lista vazia.
2. Selects de filtro ficam desabilitados ou sem opcoes.
3. Usuario pode usar apenas a busca por texto.

**FE-04 — Erro ao carregar detalhe do produto**
1. `getProduto(id)` retorna erro (produto excluido, permissao negada).
2. Card de detalhes nao e exibido ou mostra mensagem de erro.

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

**RNs aplicadas:** RN-011, RN-013, RN-014, RN-015, RN-016, RN-023, RN-035 [FALTANTE→V4]

**RF relacionados:** RF-006, RF-010

**Regras de Negocio aplicaveis:**
- Presentes: RN-011, RN-013, RN-014, RN-015, RN-016
- Faltantes: RN-035 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio

### Pre-condicoes
1. Usuario autenticado.
2. Servicos de IA e chat operacionais.
3. Opcionalmente classificacao por subclasse informada para melhorar a mascara de extracao.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Cadastro via website (sem arquivo)**
1. Usuario seleciona tipo "Website".
2. Campos de upload de arquivo ficam ocultos.
3. Campo "URL do Website" aparece como obrigatorio.
4. Classificacao opcional nao e enviada no prompt para website.

**FA-02 — Cadastro sem nome de produto (Plano de Contas)**
1. Usuario seleciona tipo "Plano de Contas (ERP)".
2. Nao preenche campo "Nome do Produto".
3. Sistema aceita — nome e opcional para este tipo.
4. IA pode extrair multiplos itens do arquivo.

**FA-03 — Classificacao nao informada**
1. Usuario nao seleciona Area/Classe/Subclasse.
2. Sistema processa sem mascara tecnica — extracao e generica.
3. Produto cadastrado pode nao ter especificacoes detalhadas.

### Fluxos de Excecao

**FE-01 — Servico de IA indisponivel**
1. Usuario clica "Processar com IA" mas servico de chat/IA esta offline.
2. Sistema exibe [Toast] de erro: "Servico de IA indisponivel".
3. Nenhum produto e cadastrado.

**FE-02 — Timeout no processamento de IA**
1. IA demora mais de 90 segundos para responder.
2. Sistema pode exibir timeout ou spinner indefinido.
3. Usuario pode tentar novamente.

**FE-03 — Arquivo corrompido ou ilegivel**
1. Usuario faz upload de PDF corrompido.
2. IA nao consegue extrair informacoes.
3. Resposta inline indica que nao foi possivel processar o documento.

**FE-04 — URL de website invalida ou inacessivel**
1. Usuario informa URL que nao existe ou esta offline.
2. IA retorna erro de acesso.
3. Nenhum produto e cadastrado.

**FE-05 — NCM extraido pela IA em formato invalido**
1. IA cadastra produto com NCM fora do formato XXXX.XX.XX.
2. Validacao RN-035 emite warning (modo warn-only).
3. Produto e cadastrado mas NCM pode precisar correcao manual.

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

**RNs aplicadas:** RN-011, RN-013, RN-015, RN-016, RN-023, RN-033 [FALTANTE→V4], RN-034 [FALTANTE→V4], RN-035 [FALTANTE→V4], RN-036 [FALTANTE→V4], RN-037 [FALTANTE→V4]

**RF relacionados:** RF-008, RF-012

**Regras de Negocio aplicaveis:**
- Presentes: RN-011, RN-013, RN-015, RN-016
- Faltantes: RN-033 [FALTANTE], RN-034 [FALTANTE], RN-035 [FALTANTE], RN-036 [FALTANTE], RN-037 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto existente.
2. Subclasse com mascara de campos tecnicos disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F07 OU UC-F08**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos

**FA-01 — Edicao apenas de dados basicos (sem alterar specs)**
1. Usuario altera somente nome, fabricante, modelo.
2. Nao modifica especificacoes tecnicas.
3. Sistema salva apenas os dados basicos. Specs permanecem inalteradas.

**FA-02 — Mudanca de subclasse (mascara diferente)**
1. Usuario altera a subclasse do produto.
2. Sistema recarrega a mascara tecnica da nova subclasse.
3. Especificacoes anteriores que nao existem na nova mascara ficam orfas.

**FA-03 — Cancelar edicao**
1. Usuario clica [Botao: "Cancelar"] no modal.
2. Modal fecha sem salvar alteracoes.
3. Dados originais permanecem.

### Fluxos de Excecao

**FE-01 — NCM em formato invalido**
1. Usuario digita NCM fora do padrao XXXX.XX.XX (ex: "901819").
2. Validacao RN-035 rejeita ou emite warning.
3. Em modo enforce: registro NAO e salvo. Em modo warn: salva com warning no log.

**FE-02 — Nome em branco (obrigatorio)**
1. Usuario apaga o nome e tenta salvar.
2. Sistema exibe erro de validacao.
3. Modal permanece aberto.

**FE-03 — Caracteres especiais em especificacoes**
1. Usuario preenche spec com caracteres Unicode (ex: "37C", "10 uL").
2. Sistema DEVE aceitar — campos tecnicos admitem Unicode.
3. Se rejeitar, e bug.

**FE-04 — Erro de rede ao salvar**
1. Conexao cai durante PUT.
2. Modal permanece aberto com dados preenchidos.
3. Toast de erro exibido.

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

**RNs aplicadas:** RN-023

**RF relacionados:** RF-008, RF-010
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto existente.
2. Integracao de chat operacional.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F07 OU UC-F08**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Reprocessamento via card de detalhes**
1. Em vez de usar o botao na tabela, usuario clica "Reprocessar IA" no card de detalhes.
2. Mesmo fluxo — diferenca e apenas o ponto de entrada.

### Fluxos de Excecao

**FE-01 — Servico de chat/IA indisponivel**
1. Sistema tenta enviar mensagem para o chat mas servico esta offline.
2. Nenhum feedback visual claro pode ser exibido (depende do subsistema).
3. Dados do produto permanecem inalterados.

**FE-02 — IA apaga dados manuais**
1. Reprocessamento sobrescreve especificacoes inseridas manualmente.
2. **Atencao:** Este e um risco conhecido. O ideal e que a IA complemente, nao substitua.

**FE-03 — Timeout no processamento**
1. IA demora mais de 90 segundos.
2. Lista pode nao atualizar.
3. Usuario pode clicar "Atualizar" manualmente.

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

**RNs aplicadas:** RN-023

**RF relacionados:** RF-007, RF-010
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto selecionado ou dados de consulta informados.
2. Servicos de IA e chat disponiveis.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F06**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Busca ANVISA somente por nome (sem numero)**
1. Usuario nao informa numero de registro.
2. Informa apenas o nome do produto.
3. IA busca por nome — resultados podem ser multiplos.

**FA-02 — Busca web sem fabricante**
1. Usuario nao informa fabricante (campo opcional).
2. IA busca apenas pelo nome do produto.

### Fluxos de Excecao

**FE-01 — Registro ANVISA nao encontrado**
1. Numero informado nao existe na base ANVISA.
2. IA retorna mensagem informativa: "Registro nao encontrado".
3. Nenhum dado e atualizado.

**FE-02 — Busca web sem resultados**
1. Nome do produto muito especifico ou inexistente na web.
2. IA retorna: "Nenhum resultado encontrado".

**FE-03 — Servico de IA indisponivel**
1. Chat offline. Modal nao retorna resposta.
2. Toast de erro exibido.

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

**RNs aplicadas:** RN-017, RN-018, RN-019, RN-023, RN-033 [FALTANTE→V4]

**RF relacionados:** RF-008, RF-010, RF-012

**Regras de Negocio aplicaveis:**
- Presentes: RN-017, RN-018, RN-019
- Faltantes: RN-033 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio/compliance tecnico

### Pre-condicoes
1. Produto existente.
2. Endpoint de completude disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F07 OU UC-F08**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Produto sem subclasse**
1. No Passo 5, produto nao tem subclasse atribuida.
2. Score de Especificacoes = 0%.
3. Alerta informativo e exibido.

**FA-02 — Produto com todas as specs preenchidas**
1. Score Geral >= 80%.
2. Todos os indicadores em verde.
3. Nenhuma acao adicional necessaria.

### Fluxos de Excecao

**FE-01 — Endpoint de completude indisponivel**
1. `getProdutoCompletude(id)` retorna erro.
2. Modal nao abre ou exibe mensagem de erro.

**FE-02 — Produto excluido entre listagem e verificacao**
1. Produto foi excluido por outro usuario enquanto o atual tenta verificar completude.
2. Endpoint retorna 404.
3. Toast de erro exibido.

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

**RNs aplicadas:** RN-023

**RF relacionados:** RF-010, RF-011, RF-013
**Ator:** Usuario de portfolio/captacao

### Pre-condicoes
1. Produto com detalhe aberto.
2. Endpoint `reprocessarMetadados(produtoId)` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F06**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Metadados ja existentes**
1. Ao expandir toggle, metadados ja estao preenchidos.
2. Usuario pode optar por nao reprocessar.

### Fluxos de Excecao

**FE-01 — Endpoint de reprocessamento indisponivel**
1. `reprocessarMetadados(produtoId)` retorna erro.
2. Toast de erro exibido.
3. Metadados anteriores permanecem.

**FE-02 — Produto sem dados suficientes para metadados**
1. Produto nao tem nome, fabricante ou descricao suficientes.
2. Reprocessamento retorna metadados vazios ou parciais.

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

**RNs aplicadas:** RN-012, RN-023, RN-040

**RF relacionados:** RF-011, RF-012, RF-013

**Regras de Negocio aplicaveis:**
- Presentes: RN-012
- Faltantes: RN-040 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio/gestor

### Pre-condicoes
1. Areas, classes e subclasses cadastradas.
2. Monitoramentos existentes ou nao.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos

**FA-01 — Nenhuma area cadastrada**
1. No Passo 2, lista de areas esta vazia.
2. Card exibe mensagem informativa: "Nenhuma classificacao cadastrada".

**FA-02 — Agente de monitoramento inativo**
1. No Passo 5, badge mostra "Agente Inativo".
2. Comportamento esperado se monitoramento nao foi configurado.

### Fluxos de Excecao

**FE-01 — Erro ao carregar hierarquia**
1. Endpoint de areas/classes retorna erro.
2. Card exibe mensagem de erro.

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

**RNs aplicadas:** RN-020, RN-021, RN-023, RN-032 [FALTANTE→V4], RN-038 [FALTANTE→V4], RN-041 [FALTANTE→V4]

**RF relacionados:** RF-018

**Regras de Negocio aplicaveis:**
- Presentes: RN-020, RN-021
- Faltantes: RN-032 [FALTANTE], RN-038 [FALTANTE], RN-041 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Registro de `parametros_score` existente ou passivel de criacao.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos

**FA-01 — Pesos ja configurados anteriormente**
1. No Passo 2, campos ja estao preenchidos com valores anteriores.
2. Usuario ajusta conforme necessario.

**FA-02 — Apenas limiares alterados (pesos mantidos)**
1. Usuario nao altera pesos.
2. Apenas ajusta limiares e clica "Salvar Limiares".
3. Pesos permanecem inalterados.

### Fluxos de Excecao

**FE-01 — Soma dos pesos diferente de 1.00**
1. No Passo 4, soma dos 6 pesos != 1.00 (ex: 1.05).
2. [Indicador: soma] exibe valor em vermelho.
3. Sistema exibe alerta e NAO salva os pesos.
4. Usuario deve corrigir os valores.

**FE-02 — Limiar GO menor que limiar NO-GO**
1. Usuario configura GO < NO-GO (ex: GO=0.40, NO-GO=0.70).
2. Configuracao inconsistente — comportamento do sistema pode ser imprevisivel.
3. Idealmente sistema deveria validar e alertar.

**FE-03 — Erro ao salvar (servidor indisponivel)**
1. Backend nao responde ao PUT.
2. Toast de erro exibido.
3. Dados permanecem no formulario.

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

**RNs aplicadas:** RN-023

**RF relacionados:** RF-014, RF-016, RF-017
**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Registro de `parametros_score` disponivel.
2. Modalidades cadastradas em `modalidades_licitacao`.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)
- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos

**FA-01 — Marcar "Atuar em todo o Brasil"**
1. Usuario marca checkbox "Atuar em todo o Brasil".
2. Todos os 27 estados ficam selecionados automaticamente.
3. Botoes individuais de UF podem ficar desabilitados.

**FA-02 — Selecao de estados individuais**
1. Usuario NAO marca "Todo o Brasil".
2. Seleciona estados individuais clicando em cada botao UF.
3. Apenas os estados clicados ficam ativos.

**FA-03 — Nenhuma modalidade selecionada**
1. Usuario nao marca nenhuma modalidade.
2. Sistema aceita — modalidades sao opcionais.

### Fluxos de Excecao

**FE-01 — Valor de mercado negativo**
1. Usuario informa TAM/SAM/SOM com valor negativo.
2. Sistema deveria validar (valores devem ser >= 0).

**FE-02 — Markup acima de 100%**
1. Usuario informa markup = 200.
2. Sistema aceita — nao ha limite superior implementado.

**FE-03 — Erro ao salvar bloco individual**
1. Um dos botoes "Salvar" falha.
2. Toast de erro para aquele bloco especifico.
3. Demais blocos permanecem inalterados.

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

**RNs aplicadas:** RN-023, RN-027

**RF relacionados:** RF-013, RF-015

**Regras de Negocio aplicaveis:**
- Presentes: RN-027
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/captacao

### Pre-condicoes
1. `fontes_editais` e `parametros_score` disponiveis.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)
- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos

**FA-01 — Desativar e reativar fonte**
1. Usuario clica [Icone-Acao: Pause] em fonte ativa.
2. Badge muda para "Inativa".
3. Usuario clica novamente [Icone-Acao: Play] para reativar.
4. Badge retorna para "Ativa".

**FA-02 — Nenhuma palavra-chave definida**
1. Usuario salva lista de palavras-chave vazia.
2. Sistema aceita — buscas podem ser feitas apenas por NCM.

### Fluxos de Excecao

**FE-01 — NCM em formato invalido**
1. Usuario digita NCM sem pontos (ex: "90181990").
2. Sistema deveria validar formato XXXX.XX.XX (RN-035).
3. Se aceito sem validacao, NCM pode nao funcionar na busca.

**FE-02 — Todas as fontes desativadas**
1. Usuario desativa todas as fontes.
2. Sistema aceita — porem nenhuma busca automatica sera executada.
3. Idealmente sistema deveria alertar.

**FE-03 — Erro ao salvar palavras-chave**
1. Backend retorna erro ao persistir.
2. Toast de erro exibido.
3. Lista anterior permanece.

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

**RNs aplicadas:** RN-023

**RF relacionados:** RF-018

**Regras de Negocio aplicaveis:**
- Presentes: RN-023
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador

### Pre-condicoes
1. Parametros gerais disponiveis.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos

**FA-01 — Apenas notificacoes alteradas (preferencias mantidas)**
1. Usuario altera somente as configuracoes de notificacao.
2. Nao abre aba de Preferencias.
3. Preferencias anteriores permanecem.

**FA-02 — SMS desmarcado (somente Email e Sistema)**
1. Usuario desmarca checkbox SMS.
2. Sistema aceita — SMS e opcional.
3. Notificacoes enviadas apenas por email e sistema.

**FA-03 — Tema alterado para Escuro**
1. Usuario seleciona tema "Escuro".
2. Interface muda visualmente apos salvar (ou ao selecionar).

### Fluxos de Excecao

**FE-01 — Email de notificacao em formato invalido**
1. Usuario digita email invalido no campo de notificacoes.
2. Sistema deveria validar formato.
3. Se nao validar, notificacoes podem nao ser enviadas.

**FE-02 — Nenhum canal de notificacao selecionado**
1. Usuario desmarca todos os checkboxes (Email, Sistema, SMS).
2. Sistema aceita — porem nenhuma notificacao sera enviada.
3. Idealmente sistema deveria alertar.

**FE-03 — Erro ao salvar preferencias**
1. Backend retorna erro.
2. Badge "Salvo!" nao aparece.
3. Toast de erro exibido.

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
6. **V5:** Fluxos Alternativos (FA) e Fluxos de Excecao (FE) adicionados a todos os 17 UCs. Correcoes do validador Arnaldo incorporadas: UF como dropdown (UC-F01), toast de sucesso ausente (UC-F01), telefone sem mascara (UC-F02), area padrao vazia (UC-F02), inicializacao de fontes de certidoes (UC-F04), filtro de busca limitado (UC-F06).
