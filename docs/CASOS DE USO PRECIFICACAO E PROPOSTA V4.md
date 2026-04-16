# CASOS DE USO — PRECIFICACAO E PROPOSTA

**Data:** 2026-04-13
**Versao:** 4.0
**Base:** `requisitos_completosv6.md` (RF-039 a RF-041) + implementacao real de `PrecificacaoPage.tsx`, `PropostaPage.tsx`, `SubmissaoPage.tsx`, `backend/app.py`, `backend/crud_routes.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso de Precificacao e Proposta com base no comportamento realmente implementado, com foco em secoes, abas, botoes, respostas do sistema, persistencia e integracoes observadas em codigo e banco.
**Novidade V4:** Anotacoes de RNs implementadas em modo warn-only (default `ENFORCE_RN_VALIDATORS=false`). Veja secao "Regras de Negocio Implementadas (V4)" abaixo e linhas `**RNs aplicadas:**` nos UCs afetados.
**Novidade V3:** Cada UC agora inclui uma secao **Regras de Negocio aplicaveis** referenciando as RNs formalizadas na secao 13 do `requisitos_completosv8.md`. Esta sprint mapeia 45 RNs (presentes + faltantes). Todo o conteudo V2 permanece preservado.
**Novidade V2.1:** Cada UC inclui uma secao "Tela(s) Representativa(s)" com layout hierarquico de elementos, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos.

---

## Regras de Negócio Implementadas (V4)

Esta versão V4 documenta as Regras de Negócio (RNs) já enforçadas no backend. Por padrão estão em modo **warn-only** (`ENFORCE_RN_VALIDATORS=false`). Ativar com `ENFORCE_RN_VALIDATORS=true`.

**Cobertura V4 (Precificacao + Proposta):** 45 RNs unicas mapeadas nos UCs P02-P11 e R01-R07 (RN-088 a RN-132). Destas, 32 ja estavam **presentes** no codigo e 13 foram marcadas como `[FALTANTE→V4]` (RN-120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132). Cada UC referenciado em `/tmp/rns_PRECIFICACAO.md` traz a linha `**RNs aplicadas:**` com a lista completa.

| RN | Descrição | UC afetado | Arquivo backend |
|---|---|---|---|
| RN-031 | Bloquear submissão se empresa tem certidão vencida (dual flag: `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`) | UC de criação de proposta/submissão | `backend/crud_routes.py::_validar_rns_db` |
| RN-082 | Transição de estado Edital: controla progressão proposta_enviada→em_pregao→vencedor/perdedor | UC de envio de proposta, registro de resultado | `backend/rn_estados.py::EDITAL_TRANSITIONS` |
| RN-083 | Escopo de chat limitado ao edital aberto | UC de chat IA durante precificação | `backend/rn_deepseek.py::validar_scope_edital` |
| RN-084 | Cooldown 60s DeepSeek por empresa | UCs de geração IA, análise de mercado, pricing IA | `backend/rn_deepseek.py::check_cooldown` |
| RN-132 | Audit de invocações DeepSeek (tool, hash, duração) | UCs com pipelines IA (estratégia, markup, simulação) | `backend/rn_audit.py::audited_tool` |
| RN-037 | Audit log universal em propostas e estratégias | UCs de criação/edição de proposta | `backend/rn_audit.py::log_transicao` |

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
      [Coluna: "Produto Vinculado"] — badge (✅ vinculado / ❌ nao vinculado / ⚠ ignorado)
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

**RNs aplicadas:** RN-120 [FALTANTE→V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Lotes do edital estao configurados (UC-P01 concluido)
2. Portfolio de produtos esta cadastrado com specs tecnicas
3. Itens dos lotes tem parametros tecnicos definidos

### Pos-condicoes
1. Cada item do lote tem produto do portfolio vinculado
2. Usuario validou e confirmou a selecao
3. Match item-a-item esta registrado em `edital_item_produto`

### Sequencia de eventos
1. Na [Tabela: "Itens do Lote"] (UC-P01), usuario localiza item sem produto vinculado ([Badge: "❌"]). [ref: Passo 1]
2. Usuario clica no [Botao: "Vincular"] para abrir o [Modal: "Selecao de Portfolio"]. [ref: Passo 2]
3. No modal, usuario visualiza a [Tabela: "Portfolio"] com colunas Produto, Fabricante e Acao. [ref: Passo 3]
4. Usuario clica no [Botao: "Selecionar"] no produto desejado para confirmar o vinculo. [ref: Passo 4]
5. Alternativamente, usuario clica no [Botao: "IA"] para vincular automaticamente via `POST /api/precificacao/vincular-ia/{itemId}`. [ref: Passo 5]
6. Sistema retorna sugestao com score de match e exibe resposta IA no [Secao: "Resposta IA"]. [ref: Passo 6]
7. Se o produto nao existe no portfolio, usuario clica no [Botao: "Buscar na Web"] para abrir o [Modal: "Buscar Produto na Web"] e cadastrar via IA. [ref: Passo 7]
8. Alternativamente, usuario clica no [Botao: "ANVISA"] para abrir o [Modal: "Registros de Produtos pela ANVISA"]. [ref: Passo 8]
9. Se usuario deseja desconsiderar um item, clica no [Botao: "Ignorar"]. Para reativar, clica no [Botao: "Reativar"]. [ref: Passo 9]
10. Para trocar vinculo existente, usuario clica no [Botao: "Trocar"] ou no [Botao: "Desvincular"]. [ref: Passo 10]

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
| [Badge: "❌"] na coluna Produto Vinculado | 1 |
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

**RNs aplicadas:** RN-093, RN-094, RN-095, RN-098, RN-101, RN-102, RN-120 [FALTANTE→V4], RN-131 [FALTANTE→V4], RN-132 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Volumetria calculada (UC-P03) ou opcao "Nao Preciso" selecionada
2. Produto tem NCM cadastrado no portfolio

### Pos-condicoes
1. Custo base do item definido
2. Regras tributarias aplicadas (isencao ICMS se NCM 3822)
3. Custos salvos na camada A

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], apos selecionar vinculo, usuario localiza o [Card: "Base de Custos"]. [ref: Passo 1]
2. Usuario preenche [Campo: "Custo Unitario (R$)"]. [ref: Passo 2]
3. O [Campo: "NCM"] e exibido como readonly (importado do produto). [ref: Passo 3]
4. Se NCM 3822, sistema exibe [Texto: "ISENTO — NCM 3822"] como hint no campo ICMS. [ref: Passo 4]
5. Usuario preenche ou ajusta [Campo: "ICMS (%)"], [Campo: "IPI (%)"] e [Campo: "PIS+COFINS (%)"]. [ref: Passo 5]
6. Usuario clica no [Botao: "Salvar Custos"]. [ref: Passo 6]

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Base de Custos

#### Layout da Tela

[Card: "Base de Custos"] icon DollarSign [ref: Passo 1]
  [Campo: "Custo Unitario (R$)"] — text, placeholder "Custo de aquisicao" [ref: Passo 2]
  [Campo: "NCM"] — readonly, placeholder "Automatico do produto" [ref: Passo 3]
  [Campo: "ICMS (%)"] — text, placeholder "0", hint "ISENTO — NCM 3822" se aplicavel [ref: Passo 4, 5]
  [Campo: "IPI (%)"] — text, placeholder "0" [ref: Passo 5]
  [Campo: "PIS+COFINS (%)"] — text, placeholder "9.25" [ref: Passo 5]
  [Botao: "Salvar Custos"] icon Check [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Base de Custos"] | 1 |
| [Campo: "Custo Unitario (R$)"] | 2 |
| [Campo: "NCM"] readonly | 3 |
| [Texto: "ISENTO — NCM 3822"] | 4 |
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

**RNs aplicadas:** RN-091, RN-092, RN-098, RN-102, RN-124 [FALTANTE→V4], RN-130 [FALTANTE→V4], RN-132 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Base de custos definida (UC-P04)

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

**RNs aplicadas:** RN-096, RN-097, RN-098, RN-102, RN-132 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Preco Base definido (UC-P05)

### Pos-condicoes
1. Target estrategico definido

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], usuario localiza o [Card: "Valor de Referencia"]. [ref: Passo 1]
2. Sistema exibe o [Campo: "Valor Referencia (R$)"] com hint "Importado do edital" se disponivel ou "Nao disponivel no edital". [ref: Passo 2]
3. Alternativamente, usuario preenche [Campo: "OU % sobre Preco Base"] para calcular o target. [ref: Passo 3]
4. Usuario clica no [Botao: "Salvar Target"]. [ref: Passo 4]

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

**RNs aplicadas:** RN-098, RN-099, RN-100, RN-102, RN-121 [FALTANTE→V4], RN-122 [FALTANTE→V4], RN-132 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Camadas A, B e C definidas (UC-P04 a UC-P06)

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

**RNs aplicadas:** RN-102, RN-106, RN-124 [FALTANTE→V4] — adicionalmente: RN-084 (cooldown 60s DeepSeek por empresa), RN-132 (audit de invocacoes DeepSeek), RN-037 (audit log universal de estrategia) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Lances configurados (UC-P07)

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

**RNs aplicadas:** RN-104, RN-123 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Produto selecionado (em qualquer etapa da precificacao)

### Pos-condicoes
1. Usuario visualizou historico e usou como referencia consultiva

### Sequencia de eventos
1. Usuario clica na [Aba: "Historico"]. [ref: Passo 1]
2. No [Card: "Consultar Historico de Precos"], usuario preenche [Campo: "Produto/Termo"]. [ref: Passo 2]
3. Usuario clica no [Botao: "Filtrar"]. [ref: Passo 3]
4. Sistema busca em `preco_historico` e PNCP, exibe estatisticas no [Card: "Estatisticas"] (Preco Medio, Minimo, Maximo). [ref: Passo 4]
5. O [Card: "Resultados"] exibe [Tabela: DataTable "Resultados"] com colunas Produto, Preco e Data. [ref: Passo 5]
6. Opcionalmente, usuario clica no [Botao: "CSV"] para exportar historico. [ref: Passo 6]

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

**RNs aplicadas:** RN-107, RN-125 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Edital envolve comodato de equipamento

### Pos-condicoes
1. Dados de comodato registrados com amortizacao calculada

### Sequencia de eventos
1. Na [Aba: "Historico"], usuario localiza o [Card: "Gestao de Comodato"]. [ref: Passo 1]
2. Usuario preenche [Campo: "Equipamento"], [Campo: "Valor do Equipamento (R$)"] e [Campo: "Prazo (meses)"]. [ref: Passo 2]
3. Sistema calcula e exibe amortizacao mensal (valor / meses). [ref: Passo 3]
4. Usuario clica no [Botao: "Salvar Comodato"]. [ref: Passo 4]
5. A [Tabela: "Comodatos"] exibe equipamentos salvos com colunas Equipamento, Valor, Meses, Amort./mes, Status. [ref: Passo 5]
6. A [Secao: "Impacto do Comodato no Preco"] exibe metricas: total equipamentos, valor total, amortizacao mensal total e impacto por item do lote. [ref: Passo 6]

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

**RNs aplicadas:** RN-101, RN-103, RN-104, RN-105, RN-123 [FALTANTE→V4] — adicionalmente: RN-083 (escopo de chat limitado ao edital aberto), RN-084 (cooldown 60s DeepSeek por empresa), RN-132 (audit de invocacoes DeepSeek com tool/hash/duracao) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Vinculo item-produto existente

### Pos-condicoes
1. Insights salvos no banco, campos A-E pre-preenchidos

### Sequencia de eventos
1. Usuario seleciona vinculo item-produto no [Select: "Vinculo Item <-> Produto"]. [ref: Passo 1]
2. Sistema carrega automaticamente insights do [Card: "Precificacao Assistida por IA"]. [ref: Passo 2]
3. Se nao ha insights, sistema mostra loading "Buscando historico de precos e atas no PNCP...". [ref: Passo 3]
4. Apos carga, sistema exibe [Secao: "Banner Resumo"] com contadores (registros, atas, Min, Media, Max, Ref. Edital). [ref: Passo 4]
5. Abaixo, sistema exibe 5 cards de recomendacao: [Card: "Custo (A)"], [Card: "Preco Base (B)"], [Card: "Referencia (C)"], [Card: "Lance Inicial (D)"], [Card: "Lance Minimo (E)"], cada um com valor e botao "Usar →". [ref: Passo 5]
6. Usuario clica em "Usar →" para pre-preencher o campo correspondente. [ref: Passo 6]
7. Se nenhum dado encontrado, usuario pode clicar no [Botao: "Regenerar Analise"] para nova busca. [ref: Passo 7]
8. Detalhes expansiveis mostram [Secao: "Concorrentes principais"] com tabela e [Secao: "Atas consultadas"] com lista de atas. [ref: Passo 8]

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
    [Card: "Custo (A)"] — valor + descricao + [Botao: "Usar →"] [ref: Passo 6]
    [Card: "Preco Base (B)"] — valor + descricao + [Botao: "Usar →"] [ref: Passo 6]
    [Card: "Referencia (C)"] — valor + descricao + [Botao: "Usar →"] [ref: Passo 6]
    [Card: "Lance Inicial (D)"] — valor + descricao + [Botao: "Usar →"] [ref: Passo 6]
    [Card: "Lance Minimo (E)"] — valor + descricao + [Botao: "Usar →"] [ref: Passo 6]
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
| [Botao: "Usar →"] por card | 6 |
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

### Pos-condicoes
1. Relatorio MD gerado com opcao de download

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"] ou [Aba: "Lances"], usuario clica no [Botao: "Relatorio de Custos e Precos"]. [ref: Passo 1]
2. Sistema coleta dados do vinculo: identificacao, conversao, analise IA, sugestoes, calculos. [ref: Passo 2]
3. Sistema gera documento Markdown completo com 9 secoes e abre em nova aba. [ref: Passo 3]
4. Na nova aba, usuario pode usar a toolbar para baixar em MD ou PDF. [ref: Passo 4]

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

**RNs aplicadas:** RN-116, RN-117, RN-125 [FALTANTE→V4], RN-127 [FALTANTE→V4] — adicionalmente: RN-031 (bloquear submissao se empresa tem certidao vencida — dual flag `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`), RN-082 (transicao de estado Edital), RN-037 (audit log universal de proposta) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Precificacao completa (camadas A-F definidas para pelo menos 1 lote)
2. Edital salvo com dados do orgao
3. Produto com specs tecnicas no portfolio

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

### Pos-condicoes
1. Proposta importada no sistema com status "rascunho"

### Sequencia de eventos
1. Usuario clica no [Botao: "Upload Proposta Externa"] no header da PropostaPage. [ref: Passo 1]
2. No [Modal: "Upload de Proposta Externa"], usuario seleciona [Select: "Edital"] e [Select: "Produto"]. [ref: Passo 2]
3. Usuario seleciona arquivo no [Campo: "Arquivo da Proposta (.docx, .pdf)"]. [ref: Passo 3]
4. Opcionalmente preenche [Campo: "Preco Unitario"] e [Campo: "Quantidade"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Importar"]. [ref: Passo 5]
6. Sistema faz `POST /api/propostas/upload` com FormData e importa a proposta. [ref: Passo 6]

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

### Pos-condicoes
1. Descricao tecnica personalizada com backup do original

### Sequencia de eventos
1. Na [Card: "Proposta Selecionada"], usuario localiza a [Secao: "Descricao Tecnica"]. [ref: Passo 1]
2. Por padrao, o [Toggle: "Modo"] esta em "edital" e exibe texto do edital (primeiros 500 chars). [ref: Passo 2]
3. Usuario clica no [Toggle: "Modo"] para alternar para "personalizado". [ref: Passo 3]
4. Sistema exibe [Badge: "Personalizado"] em amarelo. [ref: Passo 4]
5. O [Campo: TextArea "Descricao personalizada"] fica editavel para texto livre. [ref: Passo 5]
6. Para voltar ao original, usuario clica no toggle novamente. [ref: Passo 6]

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

**RNs aplicadas:** RN-108, RN-109, RN-110, RN-126 [FALTANTE→V4]

**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Proposta selecionada com produtos vinculados
2. Produtos tem campo `registro_anvisa` preenchido

### Pos-condicoes
1. Cada produto tem status ANVISA visivel (Valido/Proximo Venc./Vencido)
2. Alerta bloqueante se registros vencidos

### Sequencia de eventos
1. No [Card: "Auditoria ANVISA"], usuario clica no [Botao: "Verificar Registros"]. [ref: Passo 1]
2. Sistema chama `GET /api/propostas/{id}/anvisa-audit`. [ref: Passo 2]
3. A [Tabela: "ANVISA Records"] exibe Produto, Registro, Validade e Status por produto. [ref: Passo 3]
4. Status badge: [Badge: "Valido"] verde, [Badge: "Proximo Venc."] amarelo, [Badge: "Vencido"] vermelho. [ref: Passo 4]
5. Se houver registros vencidos, sistema exibe [Alerta: "BLOQUEANTE: Existem registros ANVISA vencidos"]. [ref: Passo 5]

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

**RNs aplicadas:** RN-118, RN-119, RN-129 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Proposta selecionada
2. Auditorias concluidas (recomendado)

### Pos-condicoes
1. Pacote completo gerado (PDF + DOCX + ZIP)

### Sequencia de eventos
1. No [Card: "Exportacao"], usuario clica no [Botao: "Baixar PDF"] para download da proposta em formato PDF. [ref: Passo 1]
2. Ou clica no [Botao: "Baixar DOCX"] para formato Word editavel. [ref: Passo 2]
3. Ou clica no [Botao: "Baixar Dossie ZIP"] para pacote completo com proposta + anexos. [ref: Passo 3]
4. Ou clica no [Botao: "Enviar por Email"] para preparar envio via chat. [ref: Passo 4]
5. Sistema gera o arquivo via `GET /api/propostas/{id}/export?formato=pdf|docx` ou `GET /api/propostas/{id}/dossie`. [ref: Passo 5]

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

**RNs aplicadas:** RN-109, RN-114, RN-128 [FALTANTE→V4] — adicionalmente: RN-031 (bloquear submissao se empresa tem certidao vencida — dual flag `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`), RN-082 (transicao de estado Edital: proposta_enviada→em_pregao→vencedor/perdedor), RN-037 (audit log universal de submissao) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Proposta criada (qualquer status)

### Pos-condicoes
1. Proposta progrediu no fluxo de status (rascunho → revisao → aprovada → enviada)

### Fluxo de Status
```
rascunho → revisao → aprovada → enviada
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
| UC-P01 | PRECIFICACAO | ✅ IMPLEMENTADO | Lotes por especialidade, itens PNCP, nome curto extraido, ignorar/reativar |
| UC-P02 | PRECIFICACAO | ✅ IMPLEMENTADO | Vincular manual + IA auto-link + Buscar Web + ANVISA (com modais) |
| UC-P03 | PRECIFICACAO | ✅ IMPLEMENTADO | Deteccao automatica, rendimento das especificacoes, pergunta ao usuario |
| UC-P04 | PRECIFICACAO | ✅ IMPLEMENTADO | Custo manual, NCM automatico, ICMS isencao, tributos editaveis |
| UC-P05 | PRECIFICACAO | ✅ IMPLEMENTADO | Manual, Custo+Markup, Upload CSV, flag reutilizar |
| UC-P06 | PRECIFICACAO | ✅ IMPLEMENTADO | Auto-importacao edital + % sobre base + IA sugere |
| UC-P07 | PRECIFICACAO | ✅ IMPLEMENTADO | Absoluto/percentual, barra visual |
| UC-P08 | PRECIFICACAO | ✅ IMPLEMENTADO | Perfis + simulacao IA + disputa |
| UC-P09 | PRECIFICACAO | ✅ IMPLEMENTADO | Busca + stats + CSV export |
| UC-P10 | PRECIFICACAO | ✅ IMPLEMENTADO | CRUD + amortizacao + impacto no preco |
| UC-P11 | PRECIFICACAO | ✅ IMPLEMENTADO | Pipeline IA: historico + atas PNCP + justificativa + pre-preenche A-E |
| UC-P12 | PRECIFICACAO | ✅ IMPLEMENTADO | Relatorio MD com 9 secoes + download MD/PDF |
| UC-R01 | PROPOSTA | ✅ IMPLEMENTADO | Motor completo com lotes, camadas, templates, editor rico |
| UC-R02 | PROPOSTA | ✅ IMPLEMENTADO | Upload de proposta externa (.docx/.pdf) com extracao de texto |
| UC-R03 | PROPOSTA | ✅ IMPLEMENTADO | Descricao Tecnica A/B com toggle e backup do original |
| UC-R04 | PROPOSTA | ✅ IMPLEMENTADO | Semaforo ANVISA com bloqueio por validade |
| UC-R05 | PROPOSTA | ✅ IMPLEMENTADO | Auditoria documental completa com Smart Split |
| UC-R06 | PROPOSTA | ✅ IMPLEMENTADO | Export PDF/DOCX + dossie ZIP completo |
| UC-R07 | PROPOSTA | ✅ IMPLEMENTADO | Submissao com checklist dinamico e fluxo de status |

**Totais:** 19 implementados = **19/19 casos de uso (100%)**

---

*Documento gerado em 31/03/2026. Cada caso de uso foi verificado contra o codebase atual (PrecificacaoPage.tsx, PropostaPage.tsx, SubmissaoPage.tsx).*
