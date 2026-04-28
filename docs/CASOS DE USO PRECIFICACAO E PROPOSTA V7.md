# CASOS DE USO — PRECIFICACAO E PROPOSTA

<!-- V7 GENERATED — secao 'UCs predecessores' adicionada automaticamente em 2026-04-28 -->


**Data:** 2026-04-21
**Versao:** 5.0
**Base:** `requisitos_completosv6.md` (RF-039 a RF-041) + implementacao real de `PrecificacaoPage.tsx`, `PropostaPage.tsx`, `SubmissaoPage.tsx`, `backend/app.py`, `backend/crud_routes.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso de Precificacao e Proposta com base no comportamento realmente implementado, com foco em secoes, abas, botoes, respostas do sistema, persistencia e integracoes observadas em codigo e banco.
**Novidade V5:** Cada UC agora inclui secoes **Fluxo Alternativo (FA)** e **Fluxo de Excecao (FE)** detalhando caminhos alternativos validos e situacoes excepcionais/erros, numerados FA-01, FA-02... e FE-01, FE-02... respectivamente.
**Novidade V4:** Anotacoes de RNs implementadas em modo warn-only (default `ENFORCE_RN_VALIDATORS=false`). Veja secao "Regras de Negocio Implementadas (V4)" abaixo e linhas `**RNs aplicadas:**` nos UCs afetados.
**Novidade V3:** Cada UC agora inclui uma secao **Regras de Negocio aplicaveis** referenciando as RNs formalizadas na secao 13 do `requisitos_completosv8.md`. Esta sprint mapeia 45 RNs (presentes + faltantes). Todo o conteudo V2 permanece preservado.
**Novidade V2.1:** Cada UC inclui uma secao "Tela(s) Representativa(s)" com layout hierarquico de elementos, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos.

---

## Regras de Negocio Implementadas (V4)

Esta versao V4 documenta as Regras de Negocio (RNs) ja enforcadas no backend. Por padrao estao em modo **warn-only** (`ENFORCE_RN_VALIDATORS=false`). Ativar com `ENFORCE_RN_VALIDATORS=true`.

**Cobertura V4 (Precificacao + Proposta):** 45 RNs unicas mapeadas nos UCs P02-P11 e R01-R07 (RN-088 a RN-132). Destas, 32 ja estavam **presentes** no codigo e 13 foram marcadas como `[FALTANTE->V4]` (RN-120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132). Cada UC referenciado em `/tmp/rns_PRECIFICACAO.md` traz a linha `**RNs aplicadas:**` com a lista completa.

| RN | Descricao | UC afetado | Arquivo backend |
|---|---|---|---|
| RN-031 | Bloquear submissao se empresa tem certidao vencida (dual flag: `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`) | UC de criacao de proposta/submissao | `backend/crud_routes.py::_validar_rns_db` |
| RN-082 | Transicao de estado Edital: controla progressao proposta_enviada->em_pregao->vencedor/perdedor | UC de envio de proposta, registro de resultado | `backend/rn_estados.py::EDITAL_TRANSITIONS` |
| RN-083 | Escopo de chat limitado ao edital aberto | UC de chat IA durante precificacao | `backend/rn_deepseek.py::validar_scope_edital` |
| RN-084 | Cooldown 60s DeepSeek por empresa | UCs de geracao IA, analise de mercado, pricing IA | `backend/rn_deepseek.py::check_cooldown` |
| RN-132 | Audit de invocacoes DeepSeek (tool, hash, duracao) | UCs com pipelines IA (estrategia, markup, simulacao) | `backend/rn_audit.py::audited_tool` |
| RN-037 | Audit log universal em propostas e estrategias | UCs de criacao/edicao de proposta | `backend/rn_audit.py::log_transicao` |

---

## INDICE

### FASE 1 — PRECIFICACAO
- [UC-P01] Organizar Edital por Lotes
- [UC-P02] Selecao Inteligente de Portfolio (Agente Assistido)
- [UC-P03] Calculo Tecnico de Volumetria
- [UC-P04] Configurar Base de Custos (ERP + Tributario)
- [UC-P05] Montar Preco Base (Camada B)
- [UC-P06] Definir Valor de Referencia (Camada C)
- [UC-P07] Estruturar Lances (Camadas D e E)
- [UC-P08] Definir Estrategia Competitiva
- [UC-P09] Consultar Historico de Precos (Camada F)
- [UC-P10] Gestao de Comodato
- [UC-P11] Pipeline IA de Precificacao
- [UC-P12] Relatorio de Custos e Precos

### FASE 2 — PROPOSTA
- [UC-R01] Gerar Proposta Tecnica (Motor Automatico)
- [UC-R02] Upload de Proposta Externa
- [UC-R03] Personalizar Descricao Tecnica (A/B)
- [UC-R04] Auditoria ANVISA (Semaforo Regulatorio)
- [UC-R05] Auditoria Documental + Smart Split
- [UC-R06] Exportar Dossie Completo
- [UC-R07] Gerenciar Status e Submissao

---

## Estrutura real das paginas

### PrecificacaoPage
Pagina com seletor de edital global e painel de 4 abas:
1. `Lotes` — organizar lotes, vincular itens a produtos
2. `Custos e Precos` — camadas A (custos), B (preco base), C (referencia) + volumetria + IA
3. `Lances` — camadas D (inicial), E (minimo) + estrategia competitiva
4. `Historico` — consulta de precos + comodato

### PropostaPage
Pagina com card de geracao, tabela de propostas, editor com toolbar, auditorias e exportacao:
1. Card "Gerar Nova Proposta" — formulario inline
2. Card "Minhas Propostas" — DataTable com filtros
3. Card "Proposta Selecionada" — editor Markdown com toolbar, status e descricao A/B
4. Card "Auditoria ANVISA" — semaforo regulatorio
5. Card "Auditoria Documental" — checklist + Smart Split
6. Card "Exportacao" — PDF, DOCX, ZIP, Email

### SubmissaoPage
Pagina com tabela de propostas prontas e checklist de submissao:
1. Card "Propostas Prontas para Envio" — DataTable
2. Card "Checklist de Submissao" — 4 itens + acoes
3. Modal "Anexar Documento" — upload com tipo e obs

### Persistencia observada
Tabelas realmente usadas:
- `editais`, `editais_itens`
- `lotes`, `lote_itens`
- `edital_item_produto` (vinculo item-produto)
- `preco_camada` (custos, precos, lances)
- `preco_historico`
- `comodatos`
- `propostas`
- `proposta_templates`
- `estrategias_editais`
- `produtos`, `produtos_especificacoes`

---

## Convencoes de tags de tipo

`[Cabecalho]`, `[Card]`, `[Secao]`, `[Campo]`, `[Botao]`, `[Tabela]`, `[Coluna]`, `[Badge]`, `[Icone-Acao]`, `[Modal]`, `[Aba]`, `[Lista]`, `[Alerta]`, `[Progresso]`, `[Toggle]`, `[Checkbox]`, `[Select]`, `[Toast]`, `[Texto]`, `[Indicador]`, `[Radio]`, `[Tag]`

---

## Matriz resumida de botoes observados

### PrecificacaoPage
- `Criar Lotes`: cria lotes a partir dos itens do edital selecionado.
- `Atualizar Lote`: salva parametros tecnicos do lote.
- `Vincular`/`Trocar`: abre modal de selecao de produto do portfolio.
- `IA`: vincula produto automaticamente via `POST /api/precificacao/vincular-ia/{itemId}`.
- `Desvincular`: remove vinculo item-produto.
- `Ignorar`/`Reativar`: altera `tipo_beneficio` do item.
- `Buscar na Web`: abre modal de busca web para cadastrar produto.
- `ANVISA`: abre modal de consulta ANVISA.
- `Calcular e Salvar`: calcula volumetria.
- `Salvar Custos`: salva camada A.
- `Salvar Preco Base`: salva camada B.
- `Salvar Target`: salva camada C.
- `Salvar Lances`: salva camadas D e E.
- `Analise de Lances`: gera cenarios de simulacao.
- `Analise por IA`: chama `POST /api/precificacao/simular-ia`.
- `Simulador de Disputa`: chama `POST /api/precificacao/simular-disputa`.
- `Regenerar Analise`: regenera insights de precificacao.
- `Filtrar`: busca historico de precos.
- `CSV`: exporta historico em CSV.
- `Salvar Comodato`: salva equipamento em comodato.
- `Relatorio de Custos e Precos`: gera relatorio MD/PDF.

### PropostaPage
- `Nova Proposta`: abre modal de geracao.
- `Upload Proposta Externa`: abre modal de upload.
- `Gerar Proposta Tecnica`: dispara motor IA.
- `Sugerir Preco` (Lightbulb): sugere preco competitivo.
- `Salvar Rascunho`: salva com status "rascunho".
- `Enviar para Revisao`: muda status para "revisao".
- `Aprovar`: muda status para "aprovada".
- `Salvar Conteudo`: persiste editor Markdown.
- `Verificar Registros`: auditoria ANVISA.
- `Verificar Documentos`: auditoria documental.
- `Fracionar`: Smart Split de PDF > 25MB.
- `Baixar PDF`/`Baixar DOCX`/`Baixar Dossie ZIP`: exportacao.
- `Enviar por Email`: prepara prompt para envio.

### SubmissaoPage
- `Anexar Documento`: abre modal de upload.
- `Marcar como Enviada`: muda status para "enviada".
- `Aprovar`: muda status para "aprovada".
- `Abrir Portal PNCP`: abre portal externo.

---

# FASE 1 — PRECIFICACAO

---

## [UC-P01] Organizar Edital por Lotes

**RF relacionado:** RF-039-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital foi salvo na CaptacaoPage (status "salvo" no banco)
3. Itens do edital foram importados do PNCP (tabela `editais_itens`)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**
- **UC-CV09**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Lotes do edital estao cadastrados com especialidade
2. Itens do PNCP estao associados aos lotes
3. Cada lote tem parametros tecnicos definidos
4. Sistema esta pronto para a Selecao Inteligente (UC-P02)

### Sequencia de eventos
1. Usuario acessa a PrecificacaoPage e seleciona um edital no [Select: "Selecione o edital"] no [Card: "Edital"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Criar Lotes"] para gerar lotes a partir dos itens do edital. [ref: Passo 2]
3. Sistema cria lotes e popula a [Aba: "Lotes"] com cards expandiveis por lote. [ref: Passo 3]
4. Usuario expande um [Card: "Lote N"] clicando no toggle de expansao. [ref: Passo 4]
5. Usuario preenche [Campo: "Especialidade"], [Campo: "Volume Exigido (testes/unidades)"], [Campo: "Tipo de Amostra"], [Campo: "Equipamento Exigido"] e [Campo: "Descricao / Observacoes Tecnicas"]. [ref: Passo 5]
6. Usuario clica no [Botao: "Atualizar Lote"] para salvar os parametros tecnicos. [ref: Passo 6]
7. Na [Tabela: "Itens do Lote"], usuario visualiza itens com colunas #, Descricao, Qtd, Valor Unit., Produto Vinculado e Acoes. [ref: Passo 7]
8. Repete passos 4-7 para cada lote do edital. [ref: Passo 8]

### Fluxos Alternativos (V5)

**FA-01 — Lotes ja existentes (criados no UC-CV09):**
1. No passo 2, se os lotes ja foram criados na Sprint 2 (UC-CV09), o sistema carrega os lotes automaticamente ao selecionar o edital.
2. O botao "Criar Lotes" nao e necessario — os lotes ja aparecem na aba "Lotes".
3. O usuario apenas verifica/edita os parametros tecnicos (passos 4-7).

**FA-02 — Mover item entre lotes:**
1. No passo 7, usuario arrasta ou transfere um item de um lote para outro.
2. Sistema remove o item do lote de origem e adiciona ao lote de destino.
3. Ambas as tabelas de itens sao atualizadas instantaneamente.

**FA-03 — Criar lote vazio para reserva:**
1. Usuario cria um novo lote sem atribuir itens (ex: "Lote 3 — Reserva").
2. O lote aparece como card vazio na lista de lotes.
3. Itens podem ser movidos para este lote posteriormente.

**FA-04 — Excluir lote vazio:**
1. Usuario exclui um lote que nao possui itens associados.
2. Sistema remove o lote e confirma via toast.
3. Lotes com itens nao podem ser excluidos sem antes mover os itens.

### Fluxos de Excecao (V5)

**FE-01 — Edital sem itens importados:**
1. No passo 1, ao selecionar um edital cujos itens nao foram importados do PNCP, a aba "Lotes" permanece vazia.
2. Sistema exibe alerta: "Este edital nao possui itens importados. Execute o UC-CV09 antes."
3. O botao "Criar Lotes" fica desabilitado.

**FE-02 — Falha ao criar lotes (edital com item sem descricao):**
1. No passo 2, se algum item do edital nao possui descricao, o sistema pode criar lotes com itens incompletos.
2. Sistema exibe toast de aviso: "N itens sem descricao foram ignorados na criacao dos lotes."

**FE-03 — Tentativa de excluir lote com itens:**
1. Usuario tenta excluir um lote que ainda contem itens associados.
2. Sistema exibe alerta bloqueante: "Nao e possivel excluir lote com itens. Mova os itens primeiro."
3. A exclusao e cancelada.

**FE-04 — Edital nao selecionado:**
1. Se o usuario tenta clicar em "Criar Lotes" sem selecionar um edital, o botao permanece desabilitado ou sistema exibe toast de erro.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Card global (Edital) + Aba 1 (Lotes)

#### Layout da Tela

[Cabecalho: "Precificacao"] icon DollarSign
  [Texto: "Custos, precos, lances e estrategia competitiva"]

[Card: "Edital"] icon Search
  [Select: "Selecione o edital"] — lista de editais salvos [ref: Passo 1]
  [Botao: "Criar Lotes"] icon Layers [ref: Passo 2]

[Aba: "Lotes"] icon Layers [ref: Passo 3]
  [Card: "Lote 1"] — expandivel [ref: Passo 4]
    [Secao: "Parametros Tecnicos"]
      [Campo: "Especialidade"] — text, placeholder "Ex: Hematologia, Microscopia" [ref: Passo 5]
      [Campo: "Volume Exigido (testes/unidades)"] — text, placeholder "Ex: 50000" [ref: Passo 5]
      [Campo: "Tipo de Amostra"] — text, placeholder "Ex: Sangue total, Soro" [ref: Passo 5]
      [Campo: "Equipamento Exigido"] — text [ref: Passo 5]
      [Campo: "Descricao / Observacoes Tecnicas"] — text [ref: Passo 5]
      [Botao: "Atualizar Lote"] icon Check [ref: Passo 6]
    [Tabela: "Itens do Lote"] [ref: Passo 7]
      [Coluna: "#"] — numero do item
      [Coluna: "Descricao"] — nome curto extraido
      [Coluna: "Qtd"] — quantidade
      [Coluna: "Valor Unit."] — valor unitario estimado
      [Coluna: "Produto Vinculado"] — badge (vinculado / nao vinculado / ignorado)
      [Coluna: "Acoes"] — botoes por item [ref: UC-P02]
    [Secao: "Resposta IA"] — card com markdown, visivel apos acao IA
    [Secao: "Resumo de Precificacao"] icon BarChart3 — tabela resumo com dados de preco
  [Card: "Lote 2"] ...
  [Card: "Lote N"] ...

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Select: "Selecione o edital"] | 1 |
| [Botao: "Criar Lotes"] | 2 |
| [Aba: "Lotes"] — cards por lote | 3 |
| Toggle de expansao do [Card: "Lote N"] | 4 |
| [Campo: "Especialidade/Volume/Amostra/Equipamento/Observacoes"] | 5 |
| [Botao: "Atualizar Lote"] | 6 |
| [Tabela: "Itens do Lote"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P02] Selecao Inteligente de Portfolio (Agente Assistido)

**RF relacionado:** RF-039-07

**Regras de Negocio aplicaveis:**
- Faltantes: RN-120 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-120 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Lotes do edital estao configurados (UC-P01 concluido)
2. Portfolio de produtos esta cadastrado com specs tecnicas
3. Itens dos lotes tem parametros tecnicos definidos

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P01**
- **UC-F07 OU UC-F08**


### Pos-condicoes
1. Cada item do lote tem produto do portfolio vinculado
2. Usuario validou e confirmou a selecao
3. Match item-a-item esta registrado em `edital_item_produto`

### Sequencia de eventos
1. Na [Tabela: "Itens do Lote"] (UC-P01), usuario localiza item sem produto vinculado ([Badge: "nao vinculado"]). [ref: Passo 1]
2. Usuario clica no [Botao: "Vincular"] para abrir o [Modal: "Selecao de Portfolio"]. [ref: Passo 2]
3. No modal, usuario visualiza a [Tabela: "Portfolio"] com colunas Produto, Fabricante e Acao. [ref: Passo 3]
4. Usuario clica no [Botao: "Selecionar"] no produto desejado para confirmar o vinculo. [ref: Passo 4]
5. Alternativamente, usuario clica no [Botao: "IA"] para vincular automaticamente via `POST /api/precificacao/vincular-ia/{itemId}`. [ref: Passo 5]
6. Sistema retorna sugestao com score de match e exibe resposta IA no [Secao: "Resposta IA"]. [ref: Passo 6]
7. Se o produto nao existe no portfolio, usuario clica no [Botao: "Buscar na Web"] para abrir o [Modal: "Buscar Produto na Web"] e cadastrar via IA. [ref: Passo 7]
8. Alternativamente, usuario clica no [Botao: "ANVISA"] para abrir o [Modal: "Registros de Produtos pela ANVISA"]. [ref: Passo 8]
9. Se usuario deseja desconsiderar um item, clica no [Botao: "Ignorar"]. Para reativar, clica no [Botao: "Reativar"]. [ref: Passo 9]
10. Para trocar vinculo existente, usuario clica no [Botao: "Trocar"] ou no [Botao: "Desvincular"]. [ref: Passo 10]

### Fluxos Alternativos (V5)

**FA-01 — Vinculacao manual (usuario seleciona do portfolio):**
1. No passo 2, usuario abre modal de selecao e escolhe manualmente o produto desejado.
2. Nao ha processamento IA — vinculo direto e imediato.
3. Badge muda para "vinculado" ao confirmar.

**FA-02 — Vinculacao automatica por IA (batch para todo o lote):**
1. Em vez de clicar "IA" item a item, usuario clica em "Vincular Portfolio por IA" para processar todos os itens do lote de uma vez.
2. Sistema processa em batch (10-30 segundos) e retorna resultados por item (score e match).
3. Itens com score alto sao vinculados automaticamente; itens com score baixo ficam como "Sem match".

**FA-03 — Cadastro de produto via busca na web:**
1. No passo 7, quando o produto nao existe no portfolio, usuario informa nome e fabricante no modal "Buscar na Web".
2. IA busca informacoes na web e cadastra o produto no portfolio automaticamente.
3. Apos cadastro, o item e vinculado ao novo produto.

**FA-04 — Vinculacao via registro ANVISA:**
1. No passo 8, usuario informa numero de registro ANVISA.
2. IA retorna dados do registro e sugere produto correspondente.
3. Usuario seleciona o produto adequado entre os resultados.

**FA-05 — Marcar item como acessorio (sem produto vinculado):**
1. Para itens que sao acessorios sem correspondente no portfolio (cabos, sensores, suportes), usuario marca como "Acessorio".
2. O item recebe preco manual sem vinculo a produto do portfolio.

### Fluxos de Excecao (V5)

**FE-01 — IA nao encontra correspondencia (score < 20%):**
1. No passo 5 ou FA-02, a IA processa mas nao encontra produto com score de match aceitavel.
2. Sistema exibe badge "Sem match" cinza e mensagem "Nenhum produto do portfolio atende este item".
3. Usuario deve vincular manualmente, buscar na web ou ignorar o item.

**FE-02 — Timeout da IA (> 60 segundos):**
1. A chamada `POST /api/precificacao/vincular-ia/{itemId}` nao retorna em 60 segundos.
2. Sistema exibe toast de erro: "Timeout na vinculacao IA. Tente novamente ou vincule manualmente."
3. O item permanece "nao vinculado".

**FE-03 — Portfolio vazio (sem produtos cadastrados):**
1. No passo 2, o modal "Selecao de Portfolio" abre com tabela vazia.
2. Sistema exibe mensagem: "Nenhum produto cadastrado no portfolio. Cadastre produtos na Sprint 1."
3. Vinculacao manual nao e possivel; usuario pode usar "Buscar na Web".

**FE-04 — Busca na Web nao retorna resultado:**
1. No passo 7, a IA busca na web mas nao encontra informacoes sobre o produto.
2. Sistema exibe toast: "Produto nao encontrado na web. Cadastre manualmente no portfolio."

**FE-05 — Registro ANVISA inexistente:**
1. No passo 8, o numero de registro informado nao existe na base ANVISA.
2. Sistema exibe mensagem: "Registro ANVISA nao encontrado."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 1 (Lotes) — coluna Acoes da Tabela de Itens + Modais

#### Layout da Tela

> Nota: Os itens estao na [Tabela: "Itens do Lote"] detalhada em UC-P01.

[Coluna: "Acoes"] — por item na tabela
  [Botao: "Vincular"] / [Botao: "Trocar"] icon Target [ref: Passo 2, 10]
  [Botao: "IA"] icon Lightbulb [ref: Passo 5]
  [Botao: "Desvincular"] icon X [ref: Passo 10]
  [Botao: "Buscar na Web"] icon Globe [ref: Passo 7]
  [Botao: "ANVISA"] icon Shield [ref: Passo 8]
  [Botao: "Ignorar"] icon X [ref: Passo 9]
  [Botao: "Reativar"] icon Check [ref: Passo 9]

[Modal: "Selecao de Portfolio"] (disparado por [Botao: "Vincular"]) [ref: Passo 2, 3, 4]
  [Texto: "Selecione o produto do portfolio para vincular ao item"]
  [Tabela: "Portfolio"]
    [Coluna: "Produto"] — nome
    [Coluna: "Fabricante"]
    [Coluna: "Acao"]
      [Botao: "Selecionar"] [ref: Passo 4]

[Modal: "Buscar Produto na Web"] [ref: Passo 7]
  [Texto: "A IA busca informacoes do produto na web e cadastra automaticamente"]
  [Campo: "Nome do Produto"] — obrigatorio
  [Campo: "Fabricante (opcional)"]
  [Botao: "Buscar via IA"] icon Globe
  [Botao: "Cancelar"]

[Modal: "Registros de Produtos pela ANVISA"] [ref: Passo 8]
  [Texto: "A IA tenta trazer os registros e o usuario valida"]
  [Campo: "Numero de Registro ANVISA"]
  [Campo: "ou Nome do Produto"]
  [Botao: "Buscar via IA"] icon Shield
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Badge: "nao vinculado"] na coluna Produto Vinculado | 1 |
| [Botao: "Vincular"] / [Modal: "Selecao de Portfolio"] | 2, 3 |
| [Botao: "Selecionar"] no modal | 4 |
| [Botao: "IA"] | 5 |
| [Secao: "Resposta IA"] | 6 |
| [Botao: "Buscar na Web"] / [Modal: "Buscar Produto na Web"] | 7 |
| [Botao: "ANVISA"] / [Modal: "Registros ANVISA"] | 8 |
| [Botao: "Ignorar"] / [Botao: "Reativar"] | 9 |
| [Botao: "Trocar"] / [Botao: "Desvincular"] | 10 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P03] Calculo Tecnico de Volumetria

**RF relacionado:** RF-039-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-088, RN-089, RN-090
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-088, RN-089, RN-090

**Ator:** Usuario

### Pre-condicoes
1. Lote configurado com itens e produtos vinculados (UC-P01 + UC-P02)
2. Produtos tem campo "rendimento por kit" preenchido no portfolio

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P01**
- **UC-P02**


### Pos-condicoes
1. Quantidade de kits calculada com arredondamento ceil para cada item
2. Dados alimentam as camadas de preco (UC-P04/P05)

### Sequencia de eventos
1. Usuario clica na [Aba: "Custos e Precos"] no painel de abas. [ref: Passo 1]
2. Usuario seleciona um vinculo item-produto no [Select: "Vinculo Item <-> Produto"] do [Card: "Selecionar Item-Produto"]. [ref: Passo 2]
3. No [Card: "Conversao de Quantidade"], usuario escolhe entre [Botao: "Preciso de Volumetria"] ou [Botao: "Nao Preciso"]. [ref: Passo 3]
4. Se precisa, usuario preenche [Campo: "Quantidade do Edital"], [Campo: "Rendimento por Embalagem"], [Campo: "Rep. Amostras"], [Campo: "Rep. Calibradores"] e [Campo: "Rep. Controles"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Calcular e Salvar"]. [ref: Passo 5]
6. Sistema calcula volume real ajustado e quantidade de kits (ceil) e exibe resultado. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Sem volumetria (item unitario / equipamento):**
1. No passo 3, usuario seleciona "Nao Preciso".
2. Sistema usa a quantidade do edital diretamente, sem calculo de conversao.
3. Fator de conversao = 1.0.

**FA-02 — Deteccao automatica de tipo de produto:**
1. O sistema detecta automaticamente se o produto e equipamento (unidade), acessorio consumivel ou kit/reagente.
2. Badge correspondente ("Unidade", "Kit/Reagente", "Acessorio consumivel") e exibido.
3. Para equipamentos, volumetria nao e necessaria (fator 1.0).

**FA-03 — Edicao manual do fator de conversao:**
1. Apos o calculo automatico, usuario edita manualmente o campo de fator de conversao.
2. O volume total e recalculado automaticamente com o novo fator.

### Fluxos de Excecao (V5)

**FE-01 — Rendimento por embalagem igual a zero:**
1. No passo 4, usuario informa rendimento = 0.
2. Sistema exibe erro: "Rendimento por embalagem deve ser maior que zero."
3. O calculo nao e executado.

**FE-02 — Campo de quantidade do edital vazio:**
1. No passo 4, usuario deixa o campo "Quantidade do Edital" em branco.
2. Sistema exibe validacao: "Quantidade do edital e obrigatoria."

**FE-03 — Repeticoes negativas:**
1. Usuario informa valor negativo em Rep. Amostras, Calibradores ou Controles.
2. Sistema exibe erro: "Valores de repeticao devem ser >= 0."

**FE-04 — Produto sem rendimento cadastrado no portfolio:**
1. No passo 2, o produto vinculado nao tem campo "rendimento por kit" preenchido.
2. Sistema exibe warning: "Produto sem rendimento cadastrado. Preencha manualmente."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Conversao de Quantidade

#### Layout da Tela

[Aba: "Custos e Precos"] icon DollarSign

[Card: "Selecionar Item-Produto"] icon Package [ref: Passo 2]
  [Select: "Vinculo Item <-> Produto"] — lista de vinculos confirmados

[Card: "Conversao de Quantidade"] icon BarChart3 [ref: Passo 3]
  [Botao: "Preciso de Volumetria"] — card selecionavel [ref: Passo 3]
  [Botao: "Nao Preciso"] — card selecionavel [ref: Passo 3]
  [Secao: "Formulario Volumetria"] — visivel se "Preciso" selecionado
    [Campo: "Quantidade do Edital"] — text, placeholder "Qtd exigida" [ref: Passo 4]
    [Campo: "Rendimento por Embalagem"] — text, placeholder "Unidades por embalagem/kit" [ref: Passo 4]
    [Campo: "Rep. Amostras"] — text, placeholder "0" [ref: Passo 4]
    [Campo: "Rep. Calibradores"] — text, placeholder "0" [ref: Passo 4]
    [Campo: "Rep. Controles"] — text, placeholder "0" [ref: Passo 4]
    [Botao: "Calcular e Salvar"] icon BarChart3 [ref: Passo 5]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Custos e Precos"] | 1 |
| [Select: "Vinculo Item <-> Produto"] | 2 |
| [Botao: "Preciso de Volumetria"] / [Botao: "Nao Preciso"] | 3 |
| [Campo: "Quantidade/Rendimento/Rep. Amostras/Calibradores/Controles"] | 4 |
| [Botao: "Calcular e Salvar"] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P04] Configurar Base de Custos (ERP + Tributario)

**RF relacionado:** RF-039-03 + RF-039-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-093, RN-094, RN-095, RN-098, RN-101, RN-102
- Faltantes: RN-120 [FALTANTE], RN-131 [FALTANTE], RN-132 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-093, RN-094, RN-095, RN-098, RN-101, RN-102, RN-120 [FALTANTE->V4], RN-131 [FALTANTE->V4], RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Volumetria calculada (UC-P03) ou opcao "Nao Preciso" selecionada
2. Produto tem NCM cadastrado no portfolio

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P03**
- **UC-F07 OU UC-F08**


### Pos-condicoes
1. Custo base do item definido
2. Regras tributarias aplicadas (isencao ICMS se NCM 3822)
3. Custos salvos na camada A

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], apos selecionar vinculo, usuario localiza o [Card: "Base de Custos"]. [ref: Passo 1]
2. Usuario preenche [Campo: "Custo Unitario (R$)"]. [ref: Passo 2]
3. O [Campo: "NCM"] e exibido como readonly (importado do produto). [ref: Passo 3]
4. Se NCM 3822, sistema exibe [Texto: "ISENTO -- NCM 3822"] como hint no campo ICMS. [ref: Passo 4]
5. Usuario preenche ou ajusta [Campo: "ICMS (%)"], [Campo: "IPI (%)"] e [Campo: "PIS+COFINS (%)"]. [ref: Passo 5]
6. Usuario clica no [Botao: "Salvar Custos"]. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — NCM 3822 (reagentes IVD) — isencao ICMS e IPI:**
1. No passo 3, sistema detecta NCM 3822.xx.xx.
2. Sistema preenche automaticamente ICMS = 0% e IPI = 0% com hint "ISENTO -- NCM 3822".
3. Apenas PIS+COFINS (9,25%) incide sobre o custo.

**FA-02 — NCM 9018 (equipamentos medicos) — IPI isento:**
1. No passo 3, sistema detecta NCM 9018.xx.xx.
2. Sistema preenche IPI = 0% com hint "IPI isento — Dec. 7.660/2011".
3. ICMS permanece editavel (ex: 12%).

**FA-03 — Custos de acessorios (itens sem produto vinculado):**
1. Para itens marcados como "Acessorio" no UC-P02, o custo e informado manualmente.
2. O campo NCM pode estar vazio ou preenchido manualmente.
3. Tributos sao informados manualmente pelo usuario.

### Fluxos de Excecao (V5)

**FE-01 — Custo unitario igual a zero ou negativo:**
1. No passo 2, usuario informa custo <= 0.
2. Sistema exibe validacao: "Custo unitario deve ser maior que zero."
3. O botao "Salvar Custos" fica desabilitado.

**FE-02 — Produto sem NCM cadastrado:**
1. No passo 3, o campo NCM aparece vazio.
2. Sistema exibe warning: "NCM nao cadastrado para este produto. Preencha no portfolio."
3. Tributos automaticos nao sao aplicados; usuario informa manualmente.

**FE-03 — Aliquota tributaria invalida (> 100% ou negativa):**
1. No passo 5, usuario informa aliquota fora do range 0-100%.
2. Sistema exibe validacao: "Aliquota deve estar entre 0% e 100%."

**FE-04 — Falha ao salvar custos (erro de rede):**
1. No passo 6, a chamada ao backend falha.
2. Sistema exibe toast de erro: "Erro ao salvar custos. Tente novamente."
3. Os dados preenchidos sao preservados na tela.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Base de Custos

#### Layout da Tela

[Card: "Base de Custos"] icon DollarSign [ref: Passo 1]
  [Campo: "Custo Unitario (R$)"] — text, placeholder "Custo de aquisicao" [ref: Passo 2]
  [Campo: "NCM"] — readonly, placeholder "Automatico do produto" [ref: Passo 3]
  [Campo: "ICMS (%)"] — text, placeholder "0", hint "ISENTO -- NCM 3822" se aplicavel [ref: Passo 4, 5]
  [Campo: "IPI (%)"] — text, placeholder "0" [ref: Passo 5]
  [Campo: "PIS+COFINS (%)"] — text, placeholder "9.25" [ref: Passo 5]
  [Botao: "Salvar Custos"] icon Check [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Base de Custos"] | 1 |
| [Campo: "Custo Unitario (R$)"] | 2 |
| [Campo: "NCM"] readonly | 3 |
| [Texto: "ISENTO -- NCM 3822"] | 4 |
| [Campo: "ICMS/IPI/PIS+COFINS"] | 5 |
| [Botao: "Salvar Custos"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P05] Montar Preco Base (Camada B)

**RF relacionado:** RF-039-08

**Regras de Negocio aplicaveis:**
- Presentes: RN-091, RN-092
- Faltantes: RN-124 [FALTANTE], RN-130 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-091, RN-092, RN-098, RN-102, RN-124 [FALTANTE->V4], RN-130 [FALTANTE->V4], RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Base de custos definida (UC-P04)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P04**


### Pos-condicoes
1. Preco base definido por uma das 3 opcoes
2. Flag de reutilizacao definida

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], usuario localiza o [Card: "Preco Base"]. [ref: Passo 1]
2. Usuario seleciona modo no [Select: "Modo"]: "Custo + Markup", "Manual" ou "Upload". [ref: Passo 2]
3. **Se Custo + Markup:** usuario preenche [Campo: "Markup (%)"] e sistema calcula preco base. [ref: Passo 3]
4. **Se Manual:** usuario preenche [Campo: "Preco Base (R$)"]. [ref: Passo 4]
5. **Se Upload:** usuario seleciona arquivo no [Campo: "Tabela de Precos (.csv)"]. [ref: Passo 5]
6. Opcionalmente, usuario marca [Checkbox: "Reutilizar este preco nos proximos lances"]. [ref: Passo 6]
7. Usuario clica no [Botao: "Salvar Preco Base"]. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Modo Manual (preco direto):**
1. No passo 2, usuario seleciona "Manual".
2. Usuario informa diretamente o valor do preco base em reais.
3. O calculo de markup nao e aplicado.

**FA-02 — Modo Upload CSV (tabela de precos externa):**
1. No passo 2, usuario seleciona "Upload".
2. Usuario seleciona arquivo .csv com tabela de precos.
3. Sistema importa os precos e aplica ao vinculo correspondente.

**FA-03 — Reutilizar preco em outros editais:**
1. No passo 6, usuario marca "Reutilizar este preco nos proximos lances".
2. O preco fica salvo como referencia e e sugerido automaticamente em editais futuros para o mesmo produto.

**FA-04 — Override do markup padrao por item:**
1. No passo 3, usuario altera o markup de, por exemplo, 28% (padrao da empresa) para 35%.
2. O sistema recalcula o preco base com o novo markup.
3. O markup original nao e alterado nos parametros globais.

### Fluxos de Excecao (V5)

**FE-01 — Markup negativo (preco abaixo do custo):**
1. No passo 3, usuario informa markup negativo (ex: -5%).
2. Sistema exibe warning: "Markup negativo resulta em preco abaixo do custo."
3. O calculo e permitido mas o campo exibe alerta visual vermelho.

**FE-02 — Preco base manual igual a zero:**
1. No passo 4, usuario informa preco base = 0.
2. Sistema exibe validacao: "Preco base deve ser maior que zero."

**FE-03 — Arquivo CSV invalido ou vazio:**
1. No passo 5, usuario faz upload de um CSV que nao segue o formato esperado.
2. Sistema exibe toast de erro: "Formato do CSV invalido. Use o modelo disponivel."

**FE-04 — CSV com mais de 25MB:**
1. No passo 5, usuario tenta fazer upload de CSV acima de 25MB.
2. Sistema bloqueia upload: "Arquivo excede o tamanho maximo de 25MB."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Preco Base

#### Layout da Tela

[Card: "Preco Base"] icon TrendingUp [ref: Passo 1]
  [Select: "Modo"] — "Custo + Markup" / "Manual" / "Upload" [ref: Passo 2]
  [Secao: "Modo Markup"] — visivel se modo = "Custo + Markup"
    [Campo: "Markup (%)"] — text, placeholder "30" [ref: Passo 3]
  [Secao: "Modo Manual"] — visivel se modo = "Manual"
    [Campo: "Preco Base (R$)"] — text, placeholder "Preco de venda" [ref: Passo 4]
  [Secao: "Modo Upload"] — visivel se modo = "Upload"
    [Campo: "Tabela de Precos (.csv)"] — file input, accept ".csv" [ref: Passo 5]
  [Checkbox: "Reutilizar este preco nos proximos lances"] [ref: Passo 6]
  [Botao: "Salvar Preco Base"] icon Check [ref: Passo 7]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Preco Base"] | 1 |
| [Select: "Modo"] | 2 |
| [Campo: "Markup (%)"] | 3 |
| [Campo: "Preco Base (R$)"] | 4 |
| [Campo: "Tabela de Precos (.csv)"] | 5 |
| [Checkbox: "Reutilizar preco"] | 6 |
| [Botao: "Salvar Preco Base"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P06] Definir Valor de Referencia (Camada C)

**RF relacionado:** RF-039-09

**Regras de Negocio aplicaveis:**
- Presentes: RN-096, RN-097
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-096, RN-097, RN-098, RN-102, RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Preco Base definido (UC-P05)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P05**


### Pos-condicoes
1. Target estrategico definido

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], usuario localiza o [Card: "Valor de Referencia"]. [ref: Passo 1]
2. Sistema exibe o [Campo: "Valor Referencia (R$)"] com hint "Importado do edital" se disponivel ou "Nao disponivel no edital". [ref: Passo 2]
3. Alternativamente, usuario preenche [Campo: "OU % sobre Preco Base"] para calcular o target. [ref: Passo 3]
4. Usuario clica no [Botao: "Salvar Target"]. [ref: Passo 4]

### Fluxos Alternativos (V5)

**FA-01 — Valor importado automaticamente do edital:**
1. No passo 2, o sistema preenche automaticamente o valor de referencia com o valor estimado do edital (importado no UC-CV09).
2. O hint exibe "Importado do edital".
3. Usuario pode aceitar ou sobrescrever.

**FA-02 — Modo percentual sobre preco base:**
1. No passo 3, usuario preenche "% sobre Preco Base" (ex: 107 para 7% acima).
2. Sistema calcula automaticamente: Valor Referencia = Preco Base x (% / 100).
3. O campo "Valor Referencia (R$)" e preenchido automaticamente com o resultado.

**FA-03 — Modo percentual negativo (desconto sobre preco base):**
1. No passo 3, usuario preenche percentual negativo (ex: -18).
2. Sistema calcula: Valor Referencia = Preco Base x (1 - 0,18).
3. Indicador visual vermelho se C < B (margem potencialmente negativa).

### Fluxos de Excecao (V5)

**FE-01 — Valor de referencia abaixo do custo total:**
1. O valor de referencia (C) e menor que o custo total (A + tributos + frete).
2. Sistema exibe alerta warning: "Valor de referencia abaixo do custo total. Margem negativa!"
3. Indicador visual vermelho aparece.

**FE-02 — Edital sem valor estimado (referencia nao disponivel):**
1. No passo 2, o edital nao possui valores estimados por item.
2. Sistema exibe hint "Nao disponivel no edital".
3. Usuario deve preencher manualmente ou usar modo percentual.

**FE-03 — Percentual zerado:**
1. Usuario preenche "% sobre Preco Base" = 0.
2. Sistema calcula valor = R$ 0,00 e exibe alerta.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Valor de Referencia

#### Layout da Tela

[Card: "Valor de Referencia"] icon Target [ref: Passo 1]
  [Campo: "Valor Referencia (R$)"] — text, placeholder "Target estrategico", hint contextual [ref: Passo 2]
  [Campo: "OU % sobre Preco Base"] — text, placeholder "95" [ref: Passo 3]
  [Botao: "Salvar Target"] icon Check [ref: Passo 4]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Valor de Referencia"] | 1 |
| [Campo: "Valor Referencia (R$)"] | 2 |
| [Campo: "OU % sobre Preco Base"] | 3 |
| [Botao: "Salvar Target"] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P07] Estruturar Lances (Camadas D e E)

**RF relacionado:** RF-039-10

**Regras de Negocio aplicaveis:**
- Presentes: RN-098, RN-099, RN-100
- Faltantes: RN-121 [FALTANTE], RN-122 [FALTANTE], RN-132 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-098, RN-099, RN-100, RN-102, RN-121 [FALTANTE->V4], RN-122 [FALTANTE->V4], RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Camadas A, B e C definidas (UC-P04 a UC-P06)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P04**
- **UC-P05**
- **UC-P06**


### Pos-condicoes
1. Valor Inicial do Lance definido
2. Valor Minimo do Lance definido

### Sequencia de eventos
1. Usuario clica na [Aba: "Lances"]. [ref: Passo 1]
2. Usuario seleciona vinculo no [Select: "Vinculo Item <-> Produto"] do [Card: "Selecionar Item-Produto"]. [ref: Passo 2]
3. No [Card: "Estrutura de Lances"], usuario seleciona modo do lance inicial no [Select: "Modo"] (Valor Absoluto / % da Referencia). [ref: Passo 3]
4. Usuario preenche [Campo: "Valor Inicial (R$)"]. [ref: Passo 4]
5. Usuario seleciona modo do lance minimo no [Select: "Modo"] (Valor Absoluto / % Desconto Maximo). [ref: Passo 5]
6. Se absoluto, preenche [Campo: "Valor Minimo (R$)"]. Se percentual, preenche [Campo: "Desconto Maximo (%)"]. [ref: Passo 6]
7. Usuario clica no [Botao: "Salvar Lances"]. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Lance inicial como percentual da referencia:**
1. No passo 3, usuario seleciona "% da Referencia" em vez de "Valor Absoluto".
2. Usuario preenche percentual (ex: 95 para 95% do valor de referencia).
3. Sistema calcula: Valor Inicial = Valor Referencia x (% / 100).

**FA-02 — Lance minimo como desconto maximo percentual:**
1. No passo 5, usuario seleciona "% Desconto Maximo".
2. Usuario preenche percentual (ex: 18 para 18% de desconto).
3. Sistema calcula: Valor Minimo = Valor Inicial x (1 - desconto/100).

**FA-03 — Modos mistos no mesmo edital:**
1. Diferentes itens do mesmo edital podem usar modos diferentes.
2. Ex: Item 1 usa "Valor Absoluto" para lance inicial, Item 6 usa "% da Referencia".

### Fluxos de Excecao (V5)

**FE-01 — Lance inicial acima do valor de referencia (D > C):**
1. No passo 4, o valor do lance inicial excede o valor de referencia.
2. Sistema exibe alerta: "Lance Inicial (D) nao pode exceder o Valor de Referencia (C)."
3. Badge vermelho aparece na validacao.

**FE-02 — Lance minimo acima do lance inicial (E > D):**
1. No passo 6, o valor minimo excede o lance inicial.
2. Sistema exibe alerta: "Lance Minimo (E) nao pode exceder o Lance Inicial (D)."

**FE-03 — Lance minimo abaixo do custo (margem negativa):**
1. No passo 6, o valor minimo e inferior ao custo total do item.
2. Sistema exibe alerta vermelho: "Lance Minimo abaixo do custo — prejuizo!"
3. O salvamento e permitido com warning.

**FE-04 — Margem inferior a 5% (alerta de margem estreita):**
1. A margem calculada (Lance Minimo - Custo) / Custo e inferior a 5%.
2. Sistema exibe warning amarelo: "Margem apertada (< 5%). Risco de prejuizo com custos adicionais."

**FE-05 — Desconto maximo de 100% (lance minimo = R$ 0):**
1. No passo 6, usuario informa desconto de 100%.
2. Sistema calcula Valor Minimo = R$ 0,00 e exibe alerta bloqueante.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 3 (Lances) — Card Estrutura de Lances

#### Layout da Tela

[Aba: "Lances"] icon Target [ref: Passo 1]

[Card: "Selecionar Item-Produto"] icon Package [ref: Passo 2]
  [Select: "Vinculo Item <-> Produto"]

[Card: "Sugestoes IA para Lances"] icon Sparkles
  > Nota: mesma estrutura do Card "Precificacao Assistida por IA" (UC-P11)

[Card: "Estrutura de Lances"] icon Target [ref: Passo 3]
  [Secao: "Lance Inicial (Camada D)"]
    [Select: "Modo"] — "Valor Absoluto" / "% da Referencia" [ref: Passo 3]
    [Campo: "Valor Inicial (R$)"] — text [ref: Passo 4]
  [Secao: "Lance Minimo (Camada E)"]
    [Select: "Modo"] — "Valor Absoluto" / "% Desconto Maximo" [ref: Passo 5]
    [Campo: "Valor Minimo (R$)"] — condicional [ref: Passo 6]
    [Campo: "Desconto Maximo (%)"] — condicional, placeholder "36.67" [ref: Passo 6]
  [Botao: "Salvar Lances"] icon Check [ref: Passo 7]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Lances"] | 1 |
| [Select: "Vinculo Item <-> Produto"] | 2 |
| [Select: "Modo"] (lance inicial) | 3 |
| [Campo: "Valor Inicial (R$)"] | 4 |
| [Select: "Modo"] (lance minimo) | 5 |
| [Campo: "Valor Minimo"] / [Campo: "Desconto Maximo"] | 6 |
| [Botao: "Salvar Lances"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P08] Definir Estrategia Competitiva

**RF relacionado:** RF-039-11

**Regras de Negocio aplicaveis:**
- Presentes: RN-102, RN-106
- Faltantes: RN-124 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-102, RN-106, RN-124 [FALTANTE->V4] — adicionalmente: RN-084 (cooldown 60s DeepSeek por empresa), RN-132 (audit de invocacoes DeepSeek), RN-037 (audit log universal de estrategia) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Lances configurados (UC-P07)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P07**


### Pos-condicoes
1. Perfil de estrategia definido (Quero Ganhar / Nao Ganhei no Minimo)
2. Cenarios simulados e salvos

### Sequencia de eventos
1. Na [Aba: "Lances"], apos salvar lances, usuario localiza o [Card: "Estrategia Competitiva"]. [ref: Passo 1]
2. Usuario le as descricoes dos 2 perfis no [Secao: "Explicacao"]. [ref: Passo 2]
3. Se ha dados historicos, sistema exibe [Secao: "Insight"] com faixa de preco recomendada. [ref: Passo 3]
4. Usuario seleciona perfil clicando no [Radio: "QUERO GANHAR"] ou [Radio: "NAO GANHEI NO MINIMO"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Analise de Lances"] para gerar cenarios de simulacao. [ref: Passo 5]
6. Sistema exibe [Secao: "Simulacoes (N cenarios)"] com cards de cenario mostrando valor e margem. [ref: Passo 6]
7. Usuario pode clicar no [Botao: "Analise por IA"] para gerar explicacao detalhada via `POST /api/precificacao/simular-ia`. [ref: Passo 7]
8. Sistema exibe [Secao: "Analise IA dos Cenarios"] com markdown detalhado e [Botao: "Relatorio MD/PDF"]. [ref: Passo 8]
9. Usuario pode clicar no [Botao: "Simulador de Disputa"] para simular pregao eletronico via `POST /api/precificacao/simular-disputa`. [ref: Passo 9]
10. Sistema exibe [Secao: "Simulacao de Disputa"] com markdown e [Botao: "Relatorio MD/PDF"]. [ref: Passo 10]

### Fluxos Alternativos (V5)

**FA-01 — Perfil "Nao Ganhei no Minimo" (pos-derrota):**
1. No passo 4, usuario seleciona "NAO GANHEI NO MINIMO".
2. Sistema exibe campos adicionais: preco vencedor observado, diferenca vs lance minimo, recomendacao IA.
3. Dados sao registrados para historico e ajuste de estrategia futura.

**FA-02 — Simulacao com cenarios pre-calculados:**
1. No passo 5, o sistema gera automaticamente 4 cenarios (Conservador, Moderado, Agressivo, Limite).
2. Cada cenario mostra desconto (%), valor do lance (R$), margem (%) e probabilidade estimada.
3. Usuario pode ajustar o slider de desconto para simular cenarios personalizados.

**FA-03 — Inclusao de justificativa textual na estrategia:**
1. Apos selecionar o perfil, usuario preenche campo de justificativa textual.
2. A justificativa e salva junto com a estrategia para auditoria.

### Fluxos de Excecao (V5)

**FE-01 — Cenario com margem negativa:**
1. No passo 6, algum cenario de simulacao resulta em margem negativa.
2. Sistema exibe [Alerta: "Cenarios com margem negativa indicam prejuizo"] em vermelho.
3. O cenario nao e bloqueado, mas e sinalizado visualmente.

**FE-02 — Timeout da Analise por IA (> 120 segundos):**
1. No passo 7, a chamada `POST /api/precificacao/simular-ia` nao retorna em 120 segundos.
2. Sistema exibe toast de erro: "Timeout na analise IA. Tente novamente."

**FE-03 — Cooldown DeepSeek ativo (RN-084):**
1. No passo 7 ou 9, usuario tenta executar analise IA dentro de 60 segundos de outra chamada.
2. Sistema exibe toast: "Aguarde 60 segundos entre chamadas de IA."

**FE-04 — Sem dados historicos para insight:**
1. No passo 3, nao ha dados historicos para o produto/segmento.
2. A secao "Insight" nao e exibida.
3. O sistema gera cenarios baseados apenas nas camadas A-E definidas.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 3 (Lances) — Card Estrategia Competitiva

#### Layout da Tela

[Card: "Estrategia Competitiva"] icon Shield [ref: Passo 1]
  [Secao: "Explicacao"] — grid 2 colunas [ref: Passo 2]
    [Texto: "QUERO GANHAR"] — descricao: lances agressivos ate valor minimo
    [Texto: "NAO GANHEI NO MINIMO"] — descricao: reposicionamento para melhor colocacao
  [Secao: "Insight"] — visivel se dados historicos [ref: Passo 3]
    [Texto: "Com base no historico, lance entre X e Y tem maior chance de vitoria"]
  [Secao: "Selecao de Perfil"]
    [Radio: "QUERO GANHAR"] — card selecionavel, borda verde [ref: Passo 4]
    [Radio: "NAO GANHEI NO MINIMO"] — card selecionavel, borda amarela [ref: Passo 4]
  [Secao: "Acoes"]
    [Botao: "Analise de Lances"] icon TrendingUp [ref: Passo 5]
    [Botao: "Analise por IA"] icon Sparkles [ref: Passo 7]
    [Botao: "Simulador de Disputa"] icon Target [ref: Passo 9]
  [Secao: "Simulacoes (N cenarios)"] — visivel apos simulacao [ref: Passo 6]
    [Card: "Cenario 1"] — valor + margem
    [Card: "Cenario 2"] ...
    [Card: "Cenario N"] ...
    [Alerta: "Cenarios com margem negativa indicam prejuizo"] — vermelho, condicional
    [Botao: "Limpar"]
  [Secao: "Analise IA dos Cenarios"] — visivel apos IA [ref: Passo 8]
    [Texto: "Markdown renderizado"]
    [Botao: "Relatorio MD/PDF"] icon FileText
  [Secao: "Simulacao de Disputa"] — visivel apos simulacao [ref: Passo 10]
    [Texto: "Markdown renderizado"]
    [Botao: "Relatorio MD/PDF"] icon FileText

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Estrategia Competitiva"] | 1 |
| [Secao: "Explicacao"] — 2 perfis | 2 |
| [Secao: "Insight"] | 3 |
| [Radio: "QUERO GANHAR"] / [Radio: "NAO GANHEI NO MINIMO"] | 4 |
| [Botao: "Analise de Lances"] | 5 |
| [Secao: "Simulacoes"] — cards de cenario | 6 |
| [Botao: "Analise por IA"] | 7 |
| [Secao: "Analise IA dos Cenarios"] | 8 |
| [Botao: "Simulador de Disputa"] | 9 |
| [Secao: "Simulacao de Disputa"] | 10 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P09] Consultar Historico de Precos (Camada F)

**RF relacionado:** RF-039-12

**Regras de Negocio aplicaveis:**
- Presentes: RN-104
- Faltantes: RN-123 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-104, RN-123 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Produto selecionado (em qualquer etapa da precificacao)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F06**


### Pos-condicoes
1. Usuario visualizou historico e usou como referencia consultiva

### Sequencia de eventos
1. Usuario clica na [Aba: "Historico"]. [ref: Passo 1]
2. No [Card: "Consultar Historico de Precos"], usuario preenche [Campo: "Produto/Termo"]. [ref: Passo 2]
3. Usuario clica no [Botao: "Filtrar"]. [ref: Passo 3]
4. Sistema busca em `preco_historico` e PNCP, exibe estatisticas no [Card: "Estatisticas"] (Preco Medio, Minimo, Maximo). [ref: Passo 4]
5. O [Card: "Resultados"] exibe [Tabela: DataTable "Resultados"] com colunas Produto, Preco e Data. [ref: Passo 5]
6. Opcionalmente, usuario clica no [Botao: "CSV"] para exportar historico. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Busca por NCM em vez de termo textual:**
1. No passo 2, usuario preenche NCM (ex: "9018.19.90") em vez de termo textual.
2. Sistema filtra por NCM e retorna resultados de produtos com este NCM.

**FA-02 — Busca com filtro de periodo:**
1. No passo 2, usuario seleciona periodo (ex: "Ultimos 12 meses", "Ultimos 24 meses").
2. Resultados sao filtrados pelo periodo selecionado.

**FA-03 — Visualizar grafico de tendencia:**
1. Apos a busca, sistema exibe grafico de linha temporal de precos.
2. Faixa sugerida para a Camada F e exibida baseada no historico.

### Fluxos de Excecao (V5)

**FE-01 — Nenhum historico encontrado:**
1. No passo 4, a busca nao retorna resultados (base local e PNCP vazios para o termo).
2. Sistema exibe mensagem: "Nenhum historico encontrado para este termo."
3. Os cards de estatisticas ficam vazios ou ocultos.

**FE-02 — Falha de conexao com PNCP:**
1. No passo 4, a busca no PNCP falha por erro de rede.
2. Sistema exibe toast: "Erro ao consultar PNCP. Usando apenas base local."
3. Resultados da base local sao exibidos normalmente.

**FE-03 — Termo de busca muito generico (muitos resultados):**
1. A busca retorna centenas ou milhares de resultados.
2. Sistema pagina os resultados e exibe apenas os primeiros N.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 4 (Historico) — Cards de consulta

#### Layout da Tela

[Aba: "Historico"] icon History [ref: Passo 1]

[Card: "Consultar Historico de Precos"] icon Search [ref: Passo 2]
  [Campo: "Produto/Termo"] — text, placeholder "reagente hematologia" [ref: Passo 2]
  [Botao: "Filtrar"] icon Search [ref: Passo 3]
  [Botao: "CSV"] icon Download [ref: Passo 6]

[Card: "Estatisticas"] icon TrendingUp — visivel apos busca [ref: Passo 4]
  [Indicador: "Preco Medio"]
  [Indicador: "Minimo"] — verde
  [Indicador: "Maximo"] — vermelho

[Card: "Resultados"] icon History — visivel se resultados [ref: Passo 5]
  [Tabela: DataTable "Resultados"]
    [Coluna: "Produto"] — sortable
    [Coluna: "Preco"] — moeda formatada, sortable
    [Coluna: "Data"] — sortable

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Historico"] | 1 |
| [Campo: "Produto/Termo"] | 2 |
| [Botao: "Filtrar"] | 3 |
| [Card: "Estatisticas"] — Medio/Min/Max | 4 |
| [Tabela: "Resultados"] | 5 |
| [Botao: "CSV"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P10] Gestao de Comodato

**RF relacionado:** RF-039-13

**Regras de Negocio aplicaveis:**
- Presentes: RN-107
- Faltantes: RN-125 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-107, RN-125 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Edital envolve comodato de equipamento

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Dados de comodato registrados com amortizacao calculada

### Sequencia de eventos
1. Na [Aba: "Historico"], usuario localiza o [Card: "Gestao de Comodato"]. [ref: Passo 1]
2. Usuario preenche [Campo: "Equipamento"], [Campo: "Valor do Equipamento (R$)"] e [Campo: "Prazo (meses)"]. [ref: Passo 2]
3. Sistema calcula e exibe amortizacao mensal (valor / meses). [ref: Passo 3]
4. Usuario clica no [Botao: "Salvar Comodato"]. [ref: Passo 4]
5. A [Tabela: "Comodatos"] exibe equipamentos salvos com colunas Equipamento, Valor, Meses, Amort./mes, Status. [ref: Passo 5]
6. A [Secao: "Impacto do Comodato no Preco"] exibe metricas: total equipamentos, valor total, amortizacao mensal total e impacto por item do lote. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Edital sem comodato (nenhum equipamento exigido):**
1. O edital nao exige comodato de equipamento.
2. O card "Gestao de Comodato" esta presente mas vazio.
3. Secao "Impacto do Comodato no Preco" nao e exibida.

**FA-02 — Multiplos equipamentos em comodato:**
1. Usuario cadastra mais de um equipamento (ex: analisador hematologico + analisador bioquimico).
2. Cada equipamento aparece como linha na tabela "Comodatos".
3. A secao "Impacto" consolida amortizacoes e calcula impacto total por item.

**FA-03 — Edicao de comodato existente (alterar prazo):**
1. Usuario edita um comodato ja salvo e altera o prazo (ex: de 60 para 48 meses).
2. A amortizacao mensal e recalculada automaticamente.

**FA-04 — Exclusao de comodato:**
1. Usuario exclui um comodato da lista.
2. Sistema remove da tabela e recalcula metricas de impacto.

### Fluxos de Excecao (V5)

**FE-01 — Valor do equipamento igual a zero:**
1. No passo 2, usuario informa valor = 0.
2. Sistema exibe validacao: "Valor do equipamento deve ser maior que zero."

**FE-02 — Prazo igual a zero:**
1. No passo 2, usuario informa prazo = 0 meses.
2. Sistema exibe erro: "Prazo deve ser maior que zero (divisao por zero)."

**FE-03 — Equipamento duplicado:**
1. Usuario tenta cadastrar um equipamento com mesmo nome ja existente.
2. Sistema exibe warning: "Equipamento ja cadastrado. Deseja atualizar os dados?"

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 4 (Historico) — Card Gestao de Comodato

#### Layout da Tela

[Card: "Gestao de Comodato"] icon Lightbulb [ref: Passo 1]
  [Badge: "Processo manual — IA futura no roadmap"]
  [Campo: "Equipamento"] — text, placeholder "Analisador XYZ-3000" [ref: Passo 2]
  [Campo: "Valor do Equipamento (R$)"] — text, placeholder "250000" [ref: Passo 2]
  [Campo: "Prazo (meses)"] — text, placeholder "60" [ref: Passo 2]
  [Texto: "Amortizacao mensal: R$ X"] — calculado [ref: Passo 3]
  [Botao: "Salvar Comodato"] icon Check [ref: Passo 4]
  [Tabela: "Comodatos"] — visivel se existem registros [ref: Passo 5]
    [Coluna: "Equipamento"]
    [Coluna: "Valor"]
    [Coluna: "Meses"]
    [Coluna: "Amort./mes"]
    [Coluna: "Status"]
  [Secao: "Impacto do Comodato no Preco"] — visivel se comodatos existem [ref: Passo 6]
    [Indicador: "Total equipamentos"]
    [Indicador: "Valor total equipamentos"]
    [Indicador: "Amortizacao mensal total"]
    [Indicador: "Impacto por item do lote"]
    [Texto: "Formula: X / Y itens = Z"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Gestao de Comodato"] | 1 |
| [Campo: "Equipamento/Valor/Prazo"] | 2 |
| [Texto: "Amortizacao mensal"] | 3 |
| [Botao: "Salvar Comodato"] | 4 |
| [Tabela: "Comodatos"] | 5 |
| [Secao: "Impacto do Comodato no Preco"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P11] Pipeline IA de Precificacao

**RF relacionado:** RF-039-14

**Regras de Negocio aplicaveis:**
- Presentes: RN-101, RN-103, RN-104, RN-105
- Faltantes: RN-123 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-101, RN-103, RN-104, RN-105, RN-123 [FALTANTE->V4] — adicionalmente: RN-083 (escopo de chat limitado ao edital aberto), RN-084 (cooldown 60s DeepSeek por empresa), RN-132 (audit de invocacoes DeepSeek com tool/hash/duracao) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Vinculo item-produto existente

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P02**


### Pos-condicoes
1. Insights salvos no banco, campos A-E pre-preenchidos

### Sequencia de eventos
1. Usuario seleciona vinculo item-produto no [Select: "Vinculo Item <-> Produto"]. [ref: Passo 1]
2. Sistema carrega automaticamente insights do [Card: "Precificacao Assistida por IA"]. [ref: Passo 2]
3. Se nao ha insights, sistema mostra loading "Buscando historico de precos e atas no PNCP...". [ref: Passo 3]
4. Apos carga, sistema exibe [Secao: "Banner Resumo"] com contadores (registros, atas, Min, Media, Max, Ref. Edital). [ref: Passo 4]
5. Abaixo, sistema exibe 5 cards de recomendacao: [Card: "Custo (A)"], [Card: "Preco Base (B)"], [Card: "Referencia (C)"], [Card: "Lance Inicial (D)"], [Card: "Lance Minimo (E)"], cada um com valor e botao "Usar ->". [ref: Passo 5]
6. Usuario clica em "Usar ->" para pre-preencher o campo correspondente. [ref: Passo 6]
7. Se nenhum dado encontrado, usuario pode clicar no [Botao: "Regenerar Analise"] para nova busca. [ref: Passo 7]
8. Detalhes expansiveis mostram [Secao: "Concorrentes principais"] com tabela e [Secao: "Atas consultadas"] com lista de atas. [ref: Passo 8]

### Fluxos Alternativos (V5)

**FA-01 — Aceitar todas as sugestoes de uma vez (Aplicar Sugestoes):**
1. Em vez de clicar "Usar ->" card a card, usuario clica em "Aplicar Sugestoes".
2. Sistema preenche automaticamente todos os campos A-E com os valores sugeridos.

**FA-02 — Descartar sugestoes e manter valores manuais:**
1. Usuario clica em "Descartar".
2. Os valores definidos manualmente nos UCs anteriores sao mantidos.

**FA-03 — Regenerar analise com novos termos de busca:**
1. No passo 7, usuario clica em "Regenerar Analise".
2. Sistema faz nova busca no PNCP com termos atualizados.
3. Banner Resumo e recomendacoes sao atualizados.

### Fluxos de Excecao (V5)

**FE-01 — Nenhum historico encontrado no PNCP (N=0):**
1. No passo 4, a busca nao retorna registros.
2. Banner Resumo exibe "0 registros, 0 atas".
3. Recomendacoes A-E ficam vazias ou com valores default.

**FE-02 — Timeout da busca PNCP (> 120 segundos):**
1. No passo 3, a busca no PNCP nao retorna em 120 segundos.
2. Sistema exibe toast: "Timeout na busca PNCP. Tente 'Regenerar Analise'."

**FE-03 — Cooldown DeepSeek ativo (RN-084):**
1. Usuario tenta regenerar analise dentro de 60 segundos de outra chamada.
2. Sistema exibe toast: "Aguarde 60 segundos entre chamadas de IA."

**FE-04 — Sugestoes com valores absurdos:**
1. A IA retorna valores fora da faixa razoavel (ex: R$ 0 ou R$ 999.999).
2. Sistema exibe badge de warning nos cards afetados.
3. Usuario deve validar e ajustar manualmente.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Precificacao Assistida por IA

#### Layout da Tela

[Card: "Precificacao Assistida por IA"] icon Sparkles [ref: Passo 2]
  [Texto: "Buscando historico de precos e atas no PNCP..."] — loading [ref: Passo 3]
  [Secao: "Banner Resumo"] — fundo azul [ref: Passo 4]
    [Indicador: "N registros"]
    [Indicador: "N atas"]
    [Indicador: "Min"] — verde
    [Indicador: "Media"]
    [Indicador: "Max"] — vermelho
    [Indicador: "Ref. Edital"] — laranja, condicional
    [Badge: "Fonte da recomendacao"]
    [Botao: "Regenerar"] icon Search [ref: Passo 7]
  [Secao: "Recomendacoes A-E"] — grid de 5 cards [ref: Passo 5]
    [Card: "Custo (A)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Preco Base (B)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Referencia (C)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Lance Inicial (D)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Lance Minimo (E)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
  [Secao: "Concorrentes principais (N)"] — expansivel [ref: Passo 8]
    [Tabela: "Concorrentes"]
      [Coluna: "Empresa"]
      [Coluna: "Vitorias"]
      [Coluna: "Taxa (%)"]
      [Coluna: "Preco Medio"]
  [Secao: "Atas consultadas (N)"] — expansivel [ref: Passo 8]
    [Lista: "Atas"]
      [Texto: "Titulo da ata"]
      [Texto: "Orgao"]
      [Texto: "UF"]
      [Botao: "Ver no PNCP"] — link externo

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Select: "Vinculo Item <-> Produto"] | 1 |
| [Card: "Precificacao Assistida por IA"] | 2 |
| Loading "Buscando..." | 3 |
| [Secao: "Banner Resumo"] | 4 |
| 5 cards de recomendacao (A-E) | 5 |
| [Botao: "Usar ->"] por card | 6 |
| [Botao: "Regenerar Analise"] | 7 |
| [Secao: "Concorrentes"] / [Secao: "Atas consultadas"] | 8 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-P12] Relatorio de Custos e Precos

**RF relacionado:** RF-039-15
**Ator:** Usuario

### Pre-condicoes
1. Vinculo selecionado com dados de custos/precos

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P04 OU UC-P05**


### Pos-condicoes
1. Relatorio MD gerado com opcao de download

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"] ou [Aba: "Lances"], usuario clica no [Botao: "Relatorio de Custos e Precos"]. [ref: Passo 1]
2. Sistema coleta dados do vinculo: identificacao, conversao, analise IA, sugestoes, calculos. [ref: Passo 2]
3. Sistema gera documento Markdown completo com 9 secoes e abre em nova aba. [ref: Passo 3]
4. Na nova aba, usuario pode usar a toolbar para baixar em MD ou PDF. [ref: Passo 4]

### Fluxos Alternativos (V5)

**FA-01 — Relatorio gerado para lote inteiro (todos os itens):**
1. Em vez de gerar relatorio para um vinculo especifico, usuario seleciona o lote inteiro.
2. Relatorio inclui tabela consolidada com todos os itens do lote.

**FA-02 — Download em formato MD:**
1. No passo 4, usuario clica em "Baixar MD".
2. Arquivo .md e baixado para o computador.

### Fluxos de Excecao (V5)

**FE-01 — Vinculo sem dados de preco preenchidos:**
1. No passo 1, o vinculo selecionado nao tem camadas A-E definidas.
2. O relatorio e gerado com campos vazios ou "nao definido" nas secoes correspondentes.

**FE-02 — Falha na geracao do relatorio:**
1. No passo 2, o sistema nao consegue coletar todos os dados.
2. Sistema exibe toast de erro: "Erro ao gerar relatorio. Verifique os dados de precificacao."

**FE-03 — Download do PDF falha:**
1. No passo 4, a exportacao PDF gera erro.
2. Sistema exibe toast: "Erro ao exportar PDF. Tente baixar em MD."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 ou Aba 3 — botao Relatorio

#### Layout da Tela

[Botao: "Relatorio de Custos e Precos"] icon FileText [ref: Passo 1]

> Nota: O relatorio abre em nova aba do navegador com toolbar e conteudo renderizado.

[Secao: "Nova Aba — Relatorio"]
  [Botao: "Baixar MD"]
  [Botao: "Baixar PDF"]
  [Secao: "Identificacao"] — edital, orgao, item, produto
  [Secao: "Conversao de Quantidade"] — volumetria
  [Secao: "Analise de Mercado IA"] — atas e contratos
  [Secao: "Sugestoes A-E"] — valores por camada
  [Secao: "Explicacao dos Calculos"] — markup e margens
  [Secao: "Concorrentes"]
  [Secao: "Vencedores Detalhados"]
  [Secao: "Justificativa IA"]
  [Secao: "Valores Definidos"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Relatorio de Custos e Precos"] | 1 |
| Relatorio renderizado em nova aba | 3 |
| [Botao: "Baixar MD"] / [Botao: "Baixar PDF"] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---

---

# FASE 2 — PROPOSTA

---

## [UC-R01] Gerar Proposta Tecnica (Motor Automatico)

**RF relacionado:** RF-040-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-116, RN-117
- Faltantes: RN-125 [FALTANTE], RN-127 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-116, RN-117, RN-125 [FALTANTE->V4], RN-127 [FALTANTE->V4] — adicionalmente: RN-031 (bloquear submissao se empresa tem certidao vencida — dual flag `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`), RN-082 (transicao de estado Edital), RN-037 (audit log universal de proposta) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Precificacao completa (camadas A-F definidas para pelo menos 1 lote)
2. Edital salvo com dados do orgao
3. Produto com specs tecnicas no portfolio

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P04**
- **UC-P05**
- **UC-P06**
- **UC-P07**
- **UC-P08**
- **UC-CV03**
- **UC-F07 OU UC-F08**


### Pos-condicoes
1. Proposta tecnica gerada com dados cruzados (preco + edital)
2. Proposta em status "rascunho", 100% editavel
3. Proposta visivel na tabela "Minhas Propostas"

### Sequencia de eventos
1. Usuario clica no [Botao: "Nova Proposta"] no header da PropostaPage ou no [Botao: "Gerar Proposta Tecnica"] no card inline. [ref: Passo 1]
2. No formulario (inline ou modal), usuario seleciona [Select: "Edital"] e [Select: "Produto"]. [ref: Passo 2]
3. Usuario preenche [Campo: "Preco Unitario"] (pode clicar no [Icone-Acao: Lightbulb "Sugerir preco"] para sugestao IA). [ref: Passo 3]
4. Usuario preenche [Campo: "Quantidade"]. [ref: Passo 4]
5. Se lotes disponiveis, usuario seleciona [Select: "Lote"]. [ref: Passo 5]
6. Opcionalmente seleciona [Select: "Template"]. [ref: Passo 6]
7. Usuario clica no [Botao: "Gerar Proposta Tecnica"]. [ref: Passo 7]
8. Sistema chama `POST /api/precificacao/simular-ia` e cria registro via `crudCreate("propostas", ...)`. [ref: Passo 8]
9. Proposta aparece na [Tabela: DataTable "Minhas Propostas"] com status "Rascunho". [ref: Passo 9]

### Fluxos Alternativos (V5)

**FA-01 — Usar sugestao de preco da IA (Lightbulb):**
1. No passo 3, usuario clica no icone de lampada (Lightbulb) ao lado do campo de preco.
2. Sistema sugere preco competitivo baseado no historico e pipeline IA.
3. Hint "Sugerido: R$ X" e exibido abaixo do campo.
4. Usuario pode aceitar ou informar outro valor.

**FA-02 — Gerar multiplas propostas para o mesmo edital (lotes diferentes):**
1. Apos gerar a primeira proposta para o Lote 1, usuario repete o processo para o Lote 2.
2. Ambas as propostas aparecem na tabela "Minhas Propostas" com lotes diferentes.

**FA-03 — Selecionar template de proposta diferente:**
1. No passo 6, usuario seleciona um template especifico.
2. A proposta e gerada com o layout e estrutura do template selecionado.

### Fluxos de Excecao (V5)

**FE-01 — Motor IA nao responde (timeout > 60 segundos):**
1. No passo 8, a chamada ao motor IA excede 60 segundos.
2. Sistema exibe toast: "Timeout na geracao da proposta. Tente novamente."
3. Nenhuma proposta e criada.

**FE-02 — Edital sem itens vinculados (precificacao incompleta):**
1. No passo 2, o edital selecionado nao tem itens com preco definido.
2. Sistema exibe alerta: "Precificacao nao concluida para este edital."

**FE-03 — Preco unitario nao informado:**
1. No passo 3, usuario deixa o campo de preco vazio.
2. Sistema exibe validacao: "Preco unitario e obrigatorio."

**FE-04 — Certidao vencida (RN-031 ativa):**
1. Se `ENFORCE_RN_VALIDATORS=true` e `ENFORCE_CERTIDAO_GATE=true`, e a empresa tem certidao vencida.
2. Sistema bloqueia geracao: "Empresa com certidao vencida. Regularize antes de criar propostas."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Header + Card 1 (Gerar) + Card 2 (Tabela)

#### Layout da Tela

[Cabecalho: "Geracao de Propostas"] icon FileEdit
  [Texto: "Criar e gerenciar propostas tecnicas"]
  [Botao: "Nova Proposta"] icon FileEdit [ref: Passo 1]
  [Botao: "Upload Proposta Externa"] icon Download [ref: UC-R02]

[Card: "Gerar Nova Proposta"] icon FileEdit [ref: Passo 1]
  [Select: "Edital"] — lista de editais salvos [ref: Passo 2]
  [Select: "Produto"] — lista de produtos [ref: Passo 2]
  [Campo: "Preco Unitario"] — number, com [Icone-Acao: Lightbulb "Sugerir preco"] [ref: Passo 3]
  [Texto: "Sugerido: R$ X"] — hint condicional [ref: Passo 3]
  [Campo: "Quantidade"] — number [ref: Passo 4]
  [Select: "Lote"] — condicional, visivel se lotes existem [ref: Passo 5]
  [Select: "Template"] — lista de templates [ref: Passo 6]
  [Botao: "Gerar Proposta Tecnica"] icon FileEdit [ref: Passo 7]

[Card: "Minhas Propostas"] icon FileEdit [ref: Passo 9]
  [Secao: FilterBar]
    [Campo: "Buscar proposta..."] — text search
    [Select: "Status"] — Todas / Rascunho / Em Revisao / Aprovada / Enviada
  [Tabela: DataTable "Minhas Propostas"]
    [Coluna: "Edital"] — sortable
    [Coluna: "Orgao"]
    [Coluna: "Produto"] — sortable
    [Coluna: "Valor Total"] — sortable, moeda formatada
    [Coluna: "Data"] — sortable
    [Coluna: "Status"] — badge colorido (Rascunho/Em Revisao/Aprovada/Enviada)
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — ver proposta
      [Icone-Acao: Download] — baixar PDF
      [Icone-Acao: Trash2] — excluir (danger)

[Modal: "Gerar Nova Proposta"] — alternativa ao card inline
  [Select: "Edital"] [ref: Passo 2]
  [Select: "Lote"] — condicional [ref: Passo 5]
  [Select: "Template"] [ref: Passo 6]
  [Select: "Produto"] [ref: Passo 2]
  [Campo: "Preco Unitario"] + [Icone-Acao: Lightbulb] [ref: Passo 3]
  [Campo: "Quantidade"] [ref: Passo 4]
  [Botao: "Gerar Proposta"] [ref: Passo 7]
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Nova Proposta"] / [Card: "Gerar Nova Proposta"] | 1 |
| [Select: "Edital"] / [Select: "Produto"] | 2 |
| [Campo: "Preco Unitario"] + [Icone-Acao: Lightbulb] | 3 |
| [Campo: "Quantidade"] | 4 |
| [Select: "Lote"] | 5 |
| [Select: "Template"] | 6 |
| [Botao: "Gerar Proposta Tecnica"] | 7 |
| [Tabela: "Minhas Propostas"] — nova linha status "Rascunho" | 9 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-R02] Upload de Proposta Externa

**RF relacionado:** RF-040-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-116, RN-117
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-116, RN-117

**Ator:** Usuario

### Pre-condicoes
1. Usuario tem proposta elaborada fora do sistema (DOCX/PDF)

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Proposta importada no sistema com status "rascunho"

### Sequencia de eventos
1. Usuario clica no [Botao: "Upload Proposta Externa"] no header da PropostaPage. [ref: Passo 1]
2. No [Modal: "Upload de Proposta Externa"], usuario seleciona [Select: "Edital"] e [Select: "Produto"]. [ref: Passo 2]
3. Usuario seleciona arquivo no [Campo: "Arquivo da Proposta (.docx, .pdf)"]. [ref: Passo 3]
4. Opcionalmente preenche [Campo: "Preco Unitario"] e [Campo: "Quantidade"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Importar"]. [ref: Passo 5]
6. Sistema faz `POST /api/propostas/upload` com FormData e importa a proposta. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Upload de PDF (proposta comercial pronta):**
1. No passo 3, usuario seleciona arquivo .pdf.
2. Sistema importa e extrai texto do PDF.
3. Proposta aparece na tabela com status "Rascunho".

**FA-02 — Upload de DOCX (documento editavel):**
1. No passo 3, usuario seleciona arquivo .docx.
2. Sistema importa e extrai texto do Word.

**FA-03 — Substituicao de arquivo ja importado:**
1. Se uma proposta ja tem arquivo importado, usuario faz novo upload.
2. O arquivo anterior e substituido pelo novo.

**FA-04 — Visualizacao do arquivo importado:**
1. Apos upload, usuario clica em "Visualizar" para abrir o PDF em nova aba.

### Fluxos de Excecao (V5)

**FE-01 — Arquivo com formato nao suportado (ex: .xlsx, .png):**
1. No passo 3, usuario tenta fazer upload de arquivo que nao e .docx ou .pdf.
2. Sistema exibe toast: "Formato nao suportado. Use .docx ou .pdf."

**FE-02 — Arquivo maior que 25MB:**
1. No passo 3, o arquivo excede 25MB.
2. Sistema bloqueia upload: "Arquivo excede o tamanho maximo de 25MB."

**FE-03 — Arquivo corrompido (nao abre):**
1. No passo 6, o sistema nao consegue extrair texto do arquivo.
2. Sistema exibe toast: "Erro ao processar arquivo. Verifique se o arquivo esta corrompido."

**FE-04 — Edital ou produto nao selecionado:**
1. No passo 2, usuario tenta importar sem selecionar edital ou produto.
2. Sistema exibe validacao: "Edital e produto sao obrigatorios."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Modal de Upload

#### Layout da Tela

[Modal: "Upload de Proposta Externa"] [ref: Passo 1]
  [Select: "Edital"] — obrigatorio [ref: Passo 2]
  [Select: "Produto"] — obrigatorio [ref: Passo 2]
  [Campo: "Arquivo da Proposta (.docx, .pdf)"] — file input, accept ".docx,.pdf" [ref: Passo 3]
  [Campo: "Preco Unitario"] — number [ref: Passo 4]
  [Campo: "Quantidade"] — number [ref: Passo 4]
  [Botao: "Importar"] [ref: Passo 5]
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Upload Proposta Externa"] | 1 |
| [Select: "Edital"] / [Select: "Produto"] | 2 |
| [Campo: "Arquivo da Proposta"] | 3 |
| [Campo: "Preco Unitario"] / [Campo: "Quantidade"] | 4 |
| [Botao: "Importar"] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-R03] Personalizar Descricao Tecnica (A/B)

**RF relacionado:** RF-040-03

**Regras de Negocio aplicaveis:**
- Presentes: RN-115
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-115

**Ator:** Usuario

### Pre-condicoes
1. Proposta gerada (UC-R01) e selecionada

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01**


### Pos-condicoes
1. Descricao tecnica personalizada com backup do original

### Sequencia de eventos
1. Na [Card: "Proposta Selecionada"], usuario localiza a [Secao: "Descricao Tecnica"]. [ref: Passo 1]
2. Por padrao, o [Toggle: "Modo"] esta em "edital" e exibe texto do edital (primeiros 500 chars). [ref: Passo 2]
3. Usuario clica no [Toggle: "Modo"] para alternar para "personalizado". [ref: Passo 3]
4. Sistema exibe [Badge: "Personalizado"] em amarelo. [ref: Passo 4]
5. O [Campo: TextArea "Descricao personalizada"] fica editavel para texto livre. [ref: Passo 5]
6. Para voltar ao original, usuario clica no toggle novamente. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Gerar Variacao B (comercial) por IA:**
1. Usuario clica em "Gerar Variacao B por IA".
2. IA gera texto comercial persuasivo com beneficios e diferenciais.
3. Variacao B fica disponivel ao lado da Variacao A (tecnica).

**FA-02 — Selecionar variacao ativa por radio button:**
1. Usuario alterna entre Variacao A (tecnica) e Variacao B (comercial) usando radio button.
2. A variacao selecionada e incluida na proposta final.
3. Ambas permanecem editaveis.

**FA-03 — Preservacao do texto ao alternar toggle:**
1. Usuario alterna de "personalizado" para "edital" e volta.
2. O texto personalizado digitado e preservado — nao se perde.

### Fluxos de Excecao (V5)

**FE-01 — IA nao gera Variacao B (timeout):**
1. A chamada para gerar Variacao B excede o timeout.
2. Sistema exibe toast: "Erro ao gerar variacao comercial. Tente novamente."

**FE-02 — Texto personalizado vazio:**
1. Usuario salva proposta com descricao personalizada em branco.
2. Sistema exibe warning: "Descricao personalizada vazia. A proposta sera enviada sem descricao."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 3 (Proposta Selecionada) — Secao Descricao Tecnica

#### Layout da Tela

[Card: "Proposta Selecionada"]
  [Secao: "Descricao Tecnica"] [ref: Passo 1]
    [Toggle: "Modo"] — ToggleLeft (edital) / ToggleRight (personalizado) [ref: Passo 2, 3]
    [Badge: "Personalizado"] — amarelo, visivel se modo = personalizado [ref: Passo 4]
    [Secao: "Modo Edital"] — visivel se modo = edital
      [Texto: "Primeiros 500 chars do conteudo"] — readonly, fundo escuro
    [Secao: "Modo Personalizado"] — visivel se modo = personalizado
      [Campo: TextArea "Descricao personalizada"] — monospace [ref: Passo 5]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Secao: "Descricao Tecnica"] | 1 |
| [Toggle: "Modo"] (padrao: edital) | 2, 3, 6 |
| [Badge: "Personalizado"] | 4 |
| [Campo: TextArea] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-R04] Auditoria ANVISA (Semaforo Regulatorio)

**RF relacionado:** RF-040-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-108, RN-109, RN-110
- Faltantes: RN-126 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-108, RN-109, RN-110, RN-126 [FALTANTE->V4]

**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Proposta selecionada com produtos vinculados
2. Produtos tem campo `registro_anvisa` preenchido

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**
- **UC-F07 OU UC-F08**


### Pos-condicoes
1. Cada produto tem status ANVISA visivel (Valido/Proximo Venc./Vencido)
2. Alerta bloqueante se registros vencidos

### Sequencia de eventos
1. No [Card: "Auditoria ANVISA"], usuario clica no [Botao: "Verificar Registros"]. [ref: Passo 1]
2. Sistema chama `GET /api/propostas/{id}/anvisa-audit`. [ref: Passo 2]
3. A [Tabela: "ANVISA Records"] exibe Produto, Registro, Validade e Status por produto. [ref: Passo 3]
4. Status badge: [Badge: "Valido"] verde, [Badge: "Proximo Venc."] amarelo, [Badge: "Vencido"] vermelho. [ref: Passo 4]
5. Se houver registros vencidos, sistema exibe [Alerta: "BLOQUEANTE: Existem registros ANVISA vencidos"]. [ref: Passo 5]

### Fluxos Alternativos (V5)

**FA-01 — Todos os registros validos (semaforo verde):**
1. No passo 4, todos os produtos tem registro ANVISA vigente (> 12 meses).
2. Todos os badges sao verdes.
3. Nenhum alerta bloqueante e exibido.
4. Badge geral: "OK".

**FA-02 — Registro proximo do vencimento (amarelo):**
1. Algum registro vence em menos de 12 meses.
2. Badge amarelo "Proximo Venc." e exibido.
3. Badge geral: "Atencao" (amarelo).
4. Proposta pode prosseguir, mas com aviso.

**FA-03 — Semaforo com multiplos indicadores (registro, classe, AFE):**
1. Sistema exibe 4 indicadores: Registro ANVISA, Classe de Risco, Vencimento, AFE da empresa.
2. Cada indicador tem cor independente (verde/amarelo/vermelho).

### Fluxos de Excecao (V5)

**FE-01 — Registro ANVISA vencido (bloqueante):**
1. No passo 4, algum produto tem registro ANVISA vencido.
2. Sistema exibe [Alerta: "BLOQUEANTE: Existem registros ANVISA vencidos"].
3. A proposta nao pode ser enviada ate regularizacao do registro.

**FE-02 — Registro ANVISA nao encontrado:**
1. No passo 2, o numero de registro informado nao existe na base ANVISA.
2. Sistema exibe badge vermelho "Nao encontrado" e alerta de regularizacao.

**FE-03 — Falha na consulta ANVISA (timeout de rede):**
1. A chamada `GET /api/propostas/{id}/anvisa-audit` falha.
2. Sistema exibe toast: "Erro ao consultar ANVISA. Tente novamente."
3. Badges ficam cinzas (sem dados).

**FE-04 — Produto sem registro ANVISA cadastrado:**
1. O produto vinculado nao tem campo `registro_anvisa` preenchido.
2. Sistema exibe badge vermelho "Sem registro" e recomendacao de cadastro.

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 4 (Auditoria ANVISA)

#### Layout da Tela

[Card: "Auditoria ANVISA"] icon Shield
  [Botao: "Verificar Registros"] icon Shield [ref: Passo 1]
  [Texto: "Clique em 'Verificar Registros' para consultar"] — estado inicial
  [Tabela: "ANVISA Records"] — visivel apos verificacao [ref: Passo 3]
    [Coluna: "Produto"]
    [Coluna: "Registro"] — monospace
    [Coluna: "Validade"]
    [Coluna: "Status"] — badge [ref: Passo 4]
      [Badge: "Valido"] — verde
      [Badge: "Proximo Venc."] — amarelo
      [Badge: "Vencido"] — vermelho
  [Alerta: "BLOQUEANTE"] — vermelho, visivel se registros vencidos [ref: Passo 5]
    [Texto: "Existem registros ANVISA vencidos. A proposta nao pode ser enviada."]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Verificar Registros"] | 1 |
| [Tabela: "ANVISA Records"] | 3 |
| [Badge: "Valido/Proximo Venc./Vencido"] | 4 |
| [Alerta: "BLOQUEANTE"] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-R05] Auditoria Documental + Smart Split

**RF relacionado:** RF-040-05

**Regras de Negocio aplicaveis:**
- Presentes: RN-111, RN-112, RN-113
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-111, RN-112, RN-113

**Ator:** Usuario

### Pre-condicoes
1. Proposta selecionada
2. Documentos do produto cadastrados

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**
- **UC-F03**


### Pos-condicoes
1. Todos os documentos exigidos verificados
2. PDFs > 25MB fracionados se necessario

### Sequencia de eventos
1. No [Card: "Auditoria Documental"], usuario clica no [Botao: "Verificar Documentos"]. [ref: Passo 1]
2. Sistema chama `GET /api/propostas/{id}/doc-audit`. [ref: Passo 2]
3. A [Tabela: "Document Records"] exibe Documento, Tamanho, Status e Acoes. [ref: Passo 3]
4. Status badge: [Badge: "Presente"] verde, [Badge: "Ausente"] vermelho, [Badge: "Vencido"] amarelo. [ref: Passo 4]
5. Se documento > 25MB, a coluna Acoes mostra [Botao: "Fracionar"] (Smart Split). [ref: Passo 5]
6. Usuario clica no [Botao: "Fracionar"] — sistema chama `POST /api/propostas/{id}/smart-split`. [ref: Passo 6]
7. A [Secao: "Checklist"] exibe resumo: "N de M documentos presentes" e alerta sobre arquivos grandes. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Todos os documentos presentes (100% completo):**
1. No passo 7, o indicador mostra "M de M documentos presentes" em verde.
2. Nenhum alerta de documento faltante.

**FA-02 — Upload de documento faltante durante a auditoria:**
1. Para um documento com status "Ausente", usuario clica em "Upload".
2. Seleciona o arquivo e informa a validade.
3. O status muda para "Presente" (verde) e o indicador e atualizado.

**FA-03 — Documentos pequenos (sem alerta Smart Split):**
1. Todos os documentos estao abaixo de 25MB.
2. Nenhum botao "Fracionar" e exibido.
3. Alerta Smart Split nao aparece.

### Fluxos de Excecao (V5)

**FE-01 — Documento com mais de 25MB (Smart Split necessario):**
1. No passo 5, algum documento excede 25MB.
2. Botao "Fracionar" e exibido na coluna de acoes.
3. Alerta: "Existem documentos maiores que 25MB. Use Fracionar para dividir."

**FE-02 — Smart Split falha (PDF protegido por senha):**
1. No passo 6, o PDF esta protegido por senha e nao pode ser dividido.
2. Sistema exibe toast: "Nao foi possivel fracionar o PDF. Remova a protecao por senha."

**FE-03 — Documento vencido (certidao expirada):**
1. No passo 4, algum documento tem validade expirada.
2. Badge amarelo "Vencido" e exibido.
3. Alerta: "Documentos vencidos devem ser atualizados antes do envio."

**FE-04 — Falha na auditoria documental (erro de rede):**
1. A chamada `GET /api/propostas/{id}/doc-audit` falha.
2. Sistema exibe toast: "Erro ao verificar documentos. Tente novamente."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 5 (Auditoria Documental)

#### Layout da Tela

[Card: "Auditoria Documental"] icon FileCheck
  [Botao: "Verificar Documentos"] icon FileCheck [ref: Passo 1]
  [Texto: "Clique em 'Verificar Documentos' para conferir"] — estado inicial
  [Tabela: "Document Records"] — visivel apos verificacao [ref: Passo 3]
    [Coluna: "Documento"] — nome do arquivo
    [Coluna: "Tamanho"] — KB/MB formatado
    [Coluna: "Status"] — badge [ref: Passo 4]
      [Badge: "Presente"] — verde
      [Badge: "Ausente"] — vermelho
      [Badge: "Vencido"] — amarelo
    [Coluna: "Acoes"]
      [Botao: "Fracionar"] icon Scissors — visivel se > 25MB [ref: Passo 5, 6]
  [Secao: "Checklist"] [ref: Passo 7]
    [Indicador: "N de M documentos presentes"] — verde se todos, laranja se faltam
    [Alerta: "Existem documentos maiores que 25MB. Use Fracionar para dividir."] — condicional

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Verificar Documentos"] | 1 |
| [Tabela: "Document Records"] | 3 |
| [Badge: "Presente/Ausente/Vencido"] | 4 |
| [Botao: "Fracionar"] | 5, 6 |
| [Secao: "Checklist"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-R06] Exportar Dossie Completo

**RF relacionado:** RF-041-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-118, RN-119
- Faltantes: RN-129 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-118, RN-119, RN-129 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Proposta selecionada
2. Auditorias concluidas (recomendado)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**
- **UC-R04 OU UC-R05**


### Pos-condicoes
1. Pacote completo gerado (PDF + DOCX + ZIP)

### Sequencia de eventos
1. No [Card: "Exportacao"], usuario clica no [Botao: "Baixar PDF"] para download da proposta em formato PDF. [ref: Passo 1]
2. Ou clica no [Botao: "Baixar DOCX"] para formato Word editavel. [ref: Passo 2]
3. Ou clica no [Botao: "Baixar Dossie ZIP"] para pacote completo com proposta + anexos. [ref: Passo 3]
4. Ou clica no [Botao: "Enviar por Email"] para preparar envio via chat. [ref: Passo 4]
5. Sistema gera o arquivo via `GET /api/propostas/{id}/export?formato=pdf|docx` ou `GET /api/propostas/{id}/dossie`. [ref: Passo 5]

### Fluxos Alternativos (V5)

**FA-01 — Exportar apenas proposta tecnica (PDF individual):**
1. Usuario clica em "Baixar PDF".
2. Sistema gera PDF apenas da proposta tecnica.

**FA-02 — Exportar proposta editavel (DOCX):**
1. Usuario clica em "Baixar DOCX".
2. Sistema gera documento Word editavel.

**FA-03 — Exportar dossie completo (ZIP com todos os documentos):**
1. Usuario clica em "Baixar Dossie ZIP".
2. Sistema gera pacote ZIP com proposta, certidoes, registros ANVISA, atestados e planilha de precos.

**FA-04 — Enviar por email:**
1. Usuario clica em "Enviar por Email".
2. Sistema prepara prompt de envio via chat com destinatario e assunto sugeridos.

### Fluxos de Excecao (V5)

**FE-01 — Falha na geracao do PDF (dados incompletos):**
1. A proposta nao tem conteudo suficiente para gerar PDF.
2. Sistema exibe toast: "Erro ao gerar PDF. Verifique o conteudo da proposta."

**FE-02 — Dossie ZIP incompleto (documentos ausentes):**
1. Alguns documentos do checklist estao ausentes.
2. O ZIP e gerado com aviso: "Dossie parcial — N documentos ausentes."

**FE-03 — Download falha (erro de rede):**
1. A chamada de exportacao falha.
2. Sistema exibe toast: "Erro no download. Tente novamente."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 6 (Exportacao) — visivel com proposta selecionada

#### Layout da Tela

[Card: "Exportacao"] icon Download
  [Botao: "Baixar PDF"] icon Download [ref: Passo 1]
  [Botao: "Baixar DOCX"] icon Download [ref: Passo 2]
  [Botao: "Baixar Dossie ZIP"] icon Archive [ref: Passo 3]
  [Botao: "Enviar por Email"] icon Send [ref: Passo 4]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Baixar PDF"] | 1 |
| [Botao: "Baixar DOCX"] | 2 |
| [Botao: "Baixar Dossie ZIP"] | 3 |
| [Botao: "Enviar por Email"] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-R07] Gerenciar Status e Submissao

**RF relacionado:** RF-041 (Submissao geral)

**Regras de Negocio aplicaveis:**
- Presentes: RN-109, RN-114
- Faltantes: RN-128 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-109, RN-114, RN-128 [FALTANTE->V4] — adicionalmente: RN-031 (bloquear submissao se empresa tem certidao vencida — dual flag `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`), RN-082 (transicao de estado Edital: proposta_enviada->em_pregao->vencedor/perdedor), RN-037 (audit log universal de submissao) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Proposta criada (qualquer status)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**


### Pos-condicoes
1. Proposta progrediu no fluxo de status (rascunho -> revisao -> aprovada -> enviada)

### Fluxo de Status
```
rascunho -> revisao -> aprovada -> enviada
```

### Sequencia de eventos

#### Parte A — PropostaPage (Gestao de Status)
1. Usuario seleciona proposta na [Tabela: "Minhas Propostas"]. [ref: Passo 1]
2. O [Card: "Proposta Selecionada"] exibe dados do edital, orgao, produto, preco e valor total. [ref: Passo 2]
3. O [Secao: "Conteudo da Proposta (Markdown)"] exibe editor com [Secao: "Toolbar Markdown"] (Bold, Italic, H1, H2, List, Table). [ref: Passo 3]
4. Usuario edita conteudo e clica no [Botao: "Salvar Conteudo"] quando ha alteracoes nao salvas. [ref: Passo 4]
5. Usuario clica no [Botao: "Salvar Rascunho"], [Botao: "Enviar para Revisao"] ou [Botao: "Aprovar"] para mudar status. [ref: Passo 5]

#### Parte B — SubmissaoPage (Checklist e Envio)
6. Usuario acessa a SubmissaoPage e visualiza [Tabela: DataTable "Propostas Prontas para Envio"]. [ref: Passo 6]
7. Usuario seleciona uma proposta — sistema exibe [Card: "Checklist de Submissao"]. [ref: Passo 7]
8. O checklist mostra 4 itens readonly: Proposta tecnica gerada, Preco definido, Documentos anexados (N/M) e Revisao final. [ref: Passo 8]
9. Usuario pode clicar no [Botao: "Anexar Documento"] para abrir [Modal: "Anexar Documento"]. [ref: Passo 9]
10. No modal, usuario seleciona [Select: "Tipo de Documento"], [Campo: "Arquivo (.pdf, .doc, .docx)"] e opcionalmente [Campo: "Observacao"]. [ref: Passo 10]
11. Usuario clica no [Botao: "Enviar"] no modal para salvar documento. [ref: Passo 11]
12. Usuario clica no [Botao: "Marcar como Enviada"] para mudar status para "enviada". [ref: Passo 12]
13. Usuario clica no [Botao: "Aprovar"] para mudar status para "aprovada". [ref: Passo 13]
14. Usuario clica no [Botao: "Abrir Portal PNCP"] para abrir portal externo. [ref: Passo 14]

### Fluxos Alternativos (V5)

**FA-01 — Retrocesso de status permitido (Aprovada -> Em Revisao):**
1. Proposta com status "Aprovada" pode ser devolvida para "Em Revisao".
2. Usuario clica em "Devolver para Revisao".
3. Badge muda de verde para amarelo.
4. Apos correcao, usuario re-aprova a proposta.

**FA-02 — Edicao do conteudo Markdown com toolbar:**
1. No passo 3, usuario usa toolbar (Bold, H1, List, Table) para formatar o conteudo.
2. Indicador "Alteracoes nao salvas" aparece em laranja.
3. Ao clicar "Salvar Conteudo", o indicador desaparece.

**FA-03 — Preenchimento de dados de submissao (protocolo):**
1. No passo 12, usuario preenche dados de envio: protocolo, data, hora, canal, responsavel, observacoes.
2. Dados sao salvos junto com a transicao de status.

**FA-04 — Abertura do portal PNCP:**
1. No passo 14, o portal PNCP abre em nova aba do navegador.
2. Usuario realiza o envio real no portal externo.

### Fluxos de Excecao (V5)

**FE-01 — Tentativa de retroceder de "Enviada" (bloqueado):**
1. Proposta com status "Enviada" nao pode retroceder para status anterior.
2. Botoes de retrocesso ficam desabilitados.
3. Se tentado via API, sistema retorna erro de validacao.

**FE-02 — Proposta enviada nao permite edicao:**
1. Apos status "Enviada", o editor Markdown fica readonly.
2. Botoes de acao (exceto visualizacao) ficam desabilitados.

**FE-03 — Checklist incompleto ao tentar enviar:**
1. No passo 12, se o checklist nao esta 100% completo (ex: documentos faltantes).
2. Sistema exibe warning: "Checklist incompleto. Deseja enviar mesmo assim?"
3. Usuario pode confirmar ou cancelar.

**FE-04 — Certidao vencida bloqueia submissao (RN-031):**
1. Se `ENFORCE_RN_VALIDATORS=true` e `ENFORCE_CERTIDAO_GATE=true`, e a empresa tem certidao vencida.
2. Sistema bloqueia "Marcar como Enviada": "Empresa com certidao vencida."

**FE-05 — Falha ao anexar documento (arquivo invalido):**
1. No passo 10, o arquivo selecionado nao e .pdf, .doc ou .docx.
2. Sistema exibe toast: "Formato de arquivo nao suportado."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`) + SubmissaoPage (`/app/submissao`)

#### Layout da Tela — PropostaPage (Parte A)

[Card: "Proposta Selecionada"] [ref: Passo 2]
  [Badge: "Status"] — cor dinamica (Rascunho/Em Revisao/Aprovada/Enviada)
  [Secao: "Acoes de Status"]
    [Botao: "Salvar Rascunho"] icon FileEdit [ref: Passo 5]
    [Botao: "Enviar para Revisao"] icon Send [ref: Passo 5]
    [Botao: "Aprovar"] icon CheckCircle — habilitado somente se status = "revisao" [ref: Passo 5]
  [Secao: "Dados da Proposta"]
    [Texto: "Edital"] / [Texto: "Orgao"] / [Texto: "Produto"]
    [Texto: "Preco Unitario"] / [Texto: "Quantidade"] / [Texto: "Valor Total"]
  [Secao: "Descricao Tecnica"] — ver UC-R03
  [Secao: "Conteudo da Proposta (Markdown)"] [ref: Passo 3]
    [Indicador: "Alteracoes nao salvas"] — laranja, condicional
    [Secao: "Toolbar Markdown"] [ref: Passo 3]
      [Icone-Acao: Bold]
      [Icone-Acao: Italic]
      [Icone-Acao: Heading1]
      [Icone-Acao: Heading2]
      [Icone-Acao: List]
      [Icone-Acao: Table]
    [Campo: TextArea "Editor Markdown"] — monospace, min-height 300px [ref: Passo 4]
    [Botao: "Salvar Conteudo"] icon CheckCircle — visivel se dirty [ref: Passo 4]

#### Layout da Tela — SubmissaoPage (Parte B)

[Cabecalho: "Submissao de Propostas"] icon Send
  [Texto: "Preparacao e envio de propostas aos portais"]

[Card: "Propostas Prontas para Envio"] icon Send [ref: Passo 6]
  [Tabela: DataTable "Propostas Prontas"]
    [Coluna: "Edital"] — sortable
    [Coluna: "Orgao"]
    [Coluna: "Produto"]
    [Coluna: "Valor"] — moeda formatada
    [Coluna: "Abertura"] — data + hora, sortable
    [Coluna: "Status"] — badge (Aguardando/Enviada/Aprovada)
    [Coluna: "Checklist"] — badge progresso "N/M"

[Card: "Checklist de Submissao: {Edital}"] icon CheckSquare — visivel com proposta selecionada [ref: Passo 7]
  [Secao: "Info do Edital"]
    [Texto: "Orgao"] / [Texto: "Produto"] / [Texto: "Valor"] / [Texto: "Abertura"]
  [Secao: "Checklist"] [ref: Passo 8]
    [Checkbox: "Proposta tecnica gerada"] — readonly
    [Checkbox: "Preco definido"] — readonly
    [Checkbox: "Documentos anexados (N/M)"] — readonly
    [Checkbox: "Revisao final"] — readonly
  [Secao: "Acoes"] [ref: Passo 9, 12, 13, 14]
    [Botao: "Anexar Documento"] icon Upload [ref: Passo 9]
    [Botao: "Marcar como Enviada"] icon Send [ref: Passo 12]
    [Botao: "Aprovar"] icon CheckCircle [ref: Passo 13]
    [Botao: "Abrir Portal PNCP"] icon ExternalLink [ref: Passo 14]

[Modal: "Anexar Documento"] [ref: Passo 9, 10, 11]
  [Select: "Tipo de Documento"] — Proposta Tecnica / Certidao / Contrato Social / Procuracao / Outro [ref: Passo 10]
  [Campo: "Arquivo (.pdf, .doc, .docx)"] — file input [ref: Passo 10]
  [Campo: "Observacao"] — text, placeholder "Observacao opcional..." [ref: Passo 10]
  [Botao: "Enviar"] [ref: Passo 11]
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Tabela: "Minhas Propostas"] (PropostaPage) | 1 |
| [Card: "Proposta Selecionada"] — dados | 2 |
| [Secao: "Toolbar Markdown"] + [Campo: TextArea] | 3 |
| [Botao: "Salvar Conteudo"] | 4 |
| [Botao: "Salvar Rascunho/Enviar para Revisao/Aprovar"] | 5 |
| [Tabela: "Propostas Prontas"] (SubmissaoPage) | 6 |
| [Card: "Checklist de Submissao"] | 7 |
| 4 [Checkbox] readonly | 8 |
| [Botao: "Anexar Documento"] / [Modal: "Anexar Documento"] | 9, 10, 11 |
| [Botao: "Marcar como Enviada"] | 12 |
| [Botao: "Aprovar"] (SubmissaoPage) | 13 |
| [Botao: "Abrir Portal PNCP"] | 14 |

### Implementacao atual
**IMPLEMENTADO**

---

---

# RESUMO DE IMPLEMENTACAO

| Caso de Uso | Fase | Status | Detalhe |
|-------------|------|--------|---------|
| UC-P01 | PRECIFICACAO | IMPLEMENTADO | Lotes por especialidade, itens PNCP, nome curto extraido, ignorar/reativar |
| UC-P02 | PRECIFICACAO | IMPLEMENTADO | Vincular manual + IA auto-link + Buscar Web + ANVISA (com modais) |
| UC-P03 | PRECIFICACAO | IMPLEMENTADO | Deteccao automatica, rendimento das especificacoes, pergunta ao usuario |
| UC-P04 | PRECIFICACAO | IMPLEMENTADO | Custo manual, NCM automatico, ICMS isencao, tributos editaveis |
| UC-P05 | PRECIFICACAO | IMPLEMENTADO | Manual, Custo+Markup, Upload CSV, flag reutilizar |
| UC-P06 | PRECIFICACAO | IMPLEMENTADO | Auto-importacao edital + % sobre base + IA sugere |
| UC-P07 | PRECIFICACAO | IMPLEMENTADO | Absoluto/percentual, barra visual |
| UC-P08 | PRECIFICACAO | IMPLEMENTADO | Perfis + simulacao IA + disputa |
| UC-P09 | PRECIFICACAO | IMPLEMENTADO | Busca + stats + CSV export |
| UC-P10 | PRECIFICACAO | IMPLEMENTADO | CRUD + amortizacao + impacto no preco |
| UC-P11 | PRECIFICACAO | IMPLEMENTADO | Pipeline IA: historico + atas PNCP + justificativa + pre-preenche A-E |
| UC-P12 | PRECIFICACAO | IMPLEMENTADO | Relatorio MD com 9 secoes + download MD/PDF |
| UC-R01 | PROPOSTA | IMPLEMENTADO | Motor completo com lotes, camadas, templates, editor rico |
| UC-R02 | PROPOSTA | IMPLEMENTADO | Upload de proposta externa (.docx/.pdf) com extracao de texto |
| UC-R03 | PROPOSTA | IMPLEMENTADO | Descricao Tecnica A/B com toggle e backup do original |
| UC-R04 | PROPOSTA | IMPLEMENTADO | Semaforo ANVISA com bloqueio por validade |
| UC-R05 | PROPOSTA | IMPLEMENTADO | Auditoria documental completa com Smart Split |
| UC-R06 | PROPOSTA | IMPLEMENTADO | Export PDF/DOCX + dossie ZIP completo |
| UC-R07 | PROPOSTA | IMPLEMENTADO | Submissao com checklist dinamico e fluxo de status |

**Totais:** 19 implementados = **19/19 casos de uso (100%)**

---

*Documento gerado em 21/04/2026. Versao V5 com Fluxos Alternativos (FA) e Fluxos de Excecao (FE) para cada UC. Cada caso de uso foi verificado contra o codebase atual (PrecificacaoPage.tsx, PropostaPage.tsx, SubmissaoPage.tsx).*
