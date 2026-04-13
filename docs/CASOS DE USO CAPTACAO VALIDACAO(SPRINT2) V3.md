# CASOS DE USO — CAPTACAO E VALIDACAO (SPRINT 2)

**Data:** 13/04/2026
**Versao:** 3.0
**Base:** `requisitos_completosv6.md` (RF-019 a RF-037) + implementacao real de `CaptacaoPage.tsx`, `ValidacaoPage.tsx`, `backend/app.py`, `backend/crud_routes.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso da Sprint 2 com base na implementacao real das telas, seus botoes, integracoes, persistencia e divergencias observadas no codigo e banco.
**Novidade V3:** Cada UC agora inclui uma secao **Regras de Negocio aplicaveis** referenciando as RNs formalizadas na secao 13 do `requisitos_completosv8.md`. Esta sprint mapeia 45 RNs (presentes + faltantes). Todo o conteudo V2 permanece preservado.

---

## INDICE

### CAPTACAO
- [UC-CV01] Buscar editais por termo, classificacao e score
- [UC-CV02] Explorar resultados e painel lateral do edital
- [UC-CV03] Salvar edital, itens e scores da captacao
- [UC-CV04] Definir estrategia, intencao e margem do edital
- [UC-CV05] Exportar e consolidar resultados da busca
- [UC-CV06] Gerir monitoramentos automaticos de busca

### VALIDACAO
- [UC-CV07] Listar editais salvos e selecionar edital para analise
- [UC-CV08] Calcular scores multidimensionais e decidir GO/NO-GO
- [UC-CV09] Importar itens e extrair lotes por IA
- [UC-CV10] Confrontar documentacao necessaria com a empresa
- [UC-CV11] Analisar riscos, recorrencia, atas e concorrentes
- [UC-CV12] Analisar mercado do orgao contratante
- [UC-CV13] Usar IA na validacao: resumo, perguntas e acoes rapidas

---

## Estrutura real das paginas

### CaptacaoPage
Pagina unica, sem abas, organizada em blocos reais:
1. cards de prazo e indicadores
2. card `Buscar Editais`
3. tabela de resultados
4. painel lateral do edital selecionado
5. card `Monitoramento Automatico`

### ValidacaoPage
Pagina com tabela de editais e painel inferior por abas reais:
1. `Aderencia`
2. `Lotes`
3. `Documentos`
4. `Riscos`
5. `Mercado`
6. `IA`

### Persistencia observada
Tabelas realmente relacionadas:
- `editais`
- `editais_itens`
- `editais_requisitos`
- `estrategias_editais`
- `monitoramentos`
- `parametros_score`
- `produtos`

---

## Convencoes de tags de tipo

`[Cabecalho]`, `[Card]`, `[Secao]`, `[Campo]`, `[Botao]`, `[Tabela]`, `[Coluna]`, `[Badge]`, `[Icone-Acao]`, `[Modal]`, `[Aba]`, `[Lista]`, `[Alerta]`, `[Progresso]`, `[Toggle]`, `[Checkbox]`, `[Select]`, `[Toast]`, `[Texto]`, `[Indicador]`, `[Radio]`, `[Tag]`

---

## Matriz resumida de botoes observados

### CaptacaoPage
- `Buscar Editais`: chama a busca principal com filtros e modo de score.
- `Relatório Completo`: gera markdown/HTML e abre a trilha de consolidacao da busca.
- `Salvar Todos`: persiste todos os resultados ainda nao salvos.
- `Salvar Score >= 70%`: salva apenas os recomendados.
- `Exportar CSV`: exporta o grid atual.
- `Salvar Selecionados`: persiste os resultados marcados no grid.
- `Ver detalhes`: abre o painel lateral do edital.
- `Salvar edital`: salva edital, itens e, quando houver, scores da captacao.
- `Salvar Estrategia`: grava intencao e margem em `estrategias_editais`.
- `Ir para Validacao`: navega para `ValidacaoPage` com o edital salvo.
- `Abrir no Portal`: abre `url` do edital.
- `Baixar PDF`: baixa `/api/editais/{id}/pdf?download=true` quando o edital foi salvo e possui dados PNCP.
- `Classificar Edital via IA`, `Recomendar Preco`, `Historico de Precos`: disparam acoes via chat.
- `Novo Monitoramento`, `Criar`, `Pausar`, `Retomar`, `Excluir`, `Atualizar`: mantem `monitoramentos`.

### ValidacaoPage
- `Calcular Scores IA` e `Recalcular Scores IA`: chamam `POST /api/editais/{id}/scores-validacao`.
- `Participar (GO)`, `Acompanhar (Em Avaliação)`, `Rejeitar (NO-GO)`: mudam o estado visual e abrem o bloco de justificativa.
- `Salvar Justificativa`: tenta persistir em `validacao_decisoes`.
- `Buscar Itens no PNCP`: importa itens para `editais_itens`.
- `Extrair Lotes via IA` e `Reprocessar`: chamam a extracao de lotes.
- `Excluir lote`: remove um lote.
- `Mover para`: move item entre lotes via `lote-itens`.
- `Identificar Documentos Exigidos pelo Edital` e `Reidentificar...`: extraem requisitos do PDF e recarregam `documentacao-necessaria`.
- `Buscar Documentos Exigidos`: pergunta ao chat quais documentos o edital exige.
- `Verificar Certidões`: reexecuta busca de certidoes e tenta recarregar a completude documental.
- `Analisar Riscos do Edital` e `Reanalisar...`: chamam pipeline unificado de riscos.
- `Rebuscar Atas`, `Buscar Vencedores e Preços`, `Atualizar`: alimentam historico competitivo.
- `Analisar Mercado do Órgão` e `Reanalisar Mercado`: chamam `/api/editais/{id}/analisar-mercado`.
- `Gerar Resumo`, `Regerar Resumo`, `Perguntar`, `Requisitos Técnicos`, `Classificar Edital`: usam `/api/chat` com sessao de pagina.
- `Ver Edital`: abre `PdfViewer` para `pdfUrl` ou `pdfPath`.

---

## Divergencias tecnicas relevantes

1. `validacao_decisoes` nao existe no schema `editais` consultado em 30/03/2026, embora o frontend tente usar `crudCreate("validacao_decisoes", ...)` e `crudUpdate("validacao_decisoes", ...)`.
2. Na aba `Documentos` da `ValidacaoPage`, o botao `Verificar Certidões` envia `POST /api/empresa-certidoes/buscar-stream` com `empresa_id: edital.id`, o que aparenta misturar identidade de empresa com identidade de edital.
3. Por causa disso, a experiencia visual da validacao esta rica, mas parte da persistencia de decisao e da revalidacao documental deve ser tratada como `PARCIAL / COM DIVERGENCIA`.

---

## [UC-CV01] Buscar editais por termo, classificacao e score

**RF relacionados:** RF-019, RF-021, RF-022, RF-026, RF-028

**Regras de Negocio aplicaveis:**
- Presentes: RN-043, RN-044, RN-045, RN-046, RN-065, RN-068
- Faltantes: RN-077 [FALTANTE], RN-078 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Usuario autenticado.
2. Fontes e parametros basicos configurados.
3. Endpoints `/api/editais/buscar`, `/api/modalidades`, `/api/origens` e `/api/areas-produto` disponiveis.

### Pos-condicoes
1. Lista de editais encontrada e exibida na tabela.
2. Resultados podem vir sem score, com score rapido, hibrido ou profundo.
3. Cards de prazo e ranking passam a refletir a busca atual.

### Botoes e acoes observadas
- `Buscar Editais`
- filtros de UF, fonte, area, classe, subclasse, modalidade, origem, NCM, periodo
- select `Analise de Score`
- checkbox `Incluir editais encerrados`

### Sequencia de eventos
1. Usuario preenche o [Campo: "Termo de busca / Produto"] com texto livre ou seleciona sugestao no autocomplete. [ref: Passo 1]
2. Usuario navega pela cascata [Select: "Area"] -> [Select: "Classe"] -> [Select: "Subclasse"] para refinar a classificacao. [ref: Passo 2]
3. Usuario ajusta filtros de [Select: "UF"], [Select: "Fonte"], [Select: "Modalidade"], [Select: "Origem"], [Campo: "NCM"] e [Campo: "Periodo (De/Ate)"]. [ref: Passo 3]
4. Usuario define o modo de score no [Select: "Analise de Score"]: `Sem Score`, `Score Rapido`, `Score Hibrido` ou `Score Profundo`. [ref: Passo 4]
5. Usuario pode marcar [Checkbox: "Incluir editais encerrados"] e definir [Campo: "Qtd editais profundo"]. [ref: Passo 5]
6. Usuario clica no [Botao: "Buscar Editais"]. [ref: Passo 6]
7. Sistema chama a busca principal via `POST /api/editais/buscar`, normaliza o retorno para `EditalBusca` e recalcula dias restantes, score, potencial e gaps. [ref: Passo 7]
8. Os [Card: "StatCard"] superiores (prazo 2, 5, 10, 20 dias) e a [Tabela: "Resultados"] sao atualizados com os novos dados. [ref: Passo 8]

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 1 (StatCards) + Bloco 2 (Card Buscar Editais)

#### Layout da Tela

[Cabecalho: "Captacao de Editais"] icon Search
  [Texto: "Busca inteligente com IA, classificacao e monitoramento"]

[Card: "StatCard — Prazo 2 dias"] — contador de editais proximos do vencimento
[Card: "StatCard — Prazo 5 dias"]
[Card: "StatCard — Prazo 10 dias"]
[Card: "StatCard — Prazo 20 dias"]

[Card: "Buscar Editais"] icon Search
  [Campo: "Termo de busca / Produto"] — text com autocomplete de produtos [ref: Passo 1]
  [Select: "UF"] — multiselect de estados [ref: Passo 3]
  [Select: "Fonte"] — select de fontes configuradas [ref: Passo 3]
  [Select: "Area"] — cascata nivel 1 [ref: Passo 2]
  [Select: "Classe"] — cascata nivel 2, depende de Area [ref: Passo 2]
  [Select: "Subclasse"] — cascata nivel 3, depende de Classe [ref: Passo 2]
  [Select: "Modalidade"] — select de modalidades [ref: Passo 3]
  [Select: "Origem"] — select de origens [ref: Passo 3]
  [Campo: "NCM"] — text livre [ref: Passo 3]
  [Campo: "Periodo De"] — date [ref: Passo 3]
  [Campo: "Periodo Ate"] — date [ref: Passo 3]
  [Select: "Analise de Score"] — 4 modos (Sem Score / Rapido / Hibrido / Profundo) [ref: Passo 4]
  [Campo: "Qtd editais profundo"] — number, visivel quando modo = Profundo [ref: Passo 5]
  [Checkbox: "Incluir editais encerrados"] [ref: Passo 5]
  [Botao: "Buscar Editais"] icon Search [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Campo: "Termo de busca / Produto"] | 1 |
| [Select: "Area"] / [Select: "Classe"] / [Select: "Subclasse"] | 2 |
| [Select: "UF"] / [Select: "Fonte"] / [Select: "Modalidade"] / [Select: "Origem"] | 3 |
| [Campo: "NCM"] / [Campo: "Periodo De/Ate"] | 3 |
| [Select: "Analise de Score"] | 4 |
| [Checkbox: "Incluir editais encerrados"] / [Campo: "Qtd editais profundo"] | 5 |
| [Botao: "Buscar Editais"] | 6 |
| [Card: "StatCard"] (4x prazo) | 8 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV02] Explorar resultados e painel lateral do edital

**RF relacionados:** RF-019, RF-020, RF-024, RF-026

**Regras de Negocio aplicaveis:**
- Presentes: RN-046, RN-052, RN-065, RN-067
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Resultado de busca retornado.

### Pos-condicoes
1. Usuario visualiza detalhes completos do edital selecionado.
2. Usuario pode tomar decisoes operacionais a partir do painel.

### Botoes e acoes observadas
Na tabela:
- checkbox de selecao
- clique na linha
- `Ver detalhes`
- `Salvar edital`

No painel lateral:
- `Salvar Estrategia`
- `Salvar Edital`
- `Ir para Validacao`
- `Abrir no Portal`
- `Baixar PDF`
- `Classificar Edital via IA`
- `Recomendar Preco`
- `Historico de Precos`

### Sequencia de eventos
1. Usuario clica numa linha da [Tabela: "Resultados"] ou no [Icone-Acao: "Ver detalhes"] (Eye). [ref: Passo 1]
2. Sistema abre o [Card: "Painel Lateral"] com dados do edital: numero, orgao, UF, objeto, valor, modalidade, produto correspondente, score e potencial. [ref: Passo 2]
3. Se ja houver score profundo, o painel exibe [Secao: "Score Profundo"] com 6 [Indicador: "ScoreBar"] (Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial), decisao IA e justificativas. [ref: Passo 3]
4. Se nao houver score profundo mas o modo de score estiver ativo, a tela pode buscar `scores-validacao` ao abrir o painel. [ref: Passo 4]
5. No painel, usuario visualiza [Secao: "Intencao Estrategica"] com 4 opcoes [Radio] e [Secao: "Margem"] com slider. [ref: Passo 5]
6. Usuario decide se salva, exporta, envia para validacao ou usa acoes de IA via os botoes do painel. [ref: Passo 6]

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 3 (Tabela de Resultados) + Bloco 4 (Painel Lateral)

#### Layout da Tela

[Card: "Resultados"] icon FileText
  [Secao: "Acoes em Lote"]
    [Botao: "Relatório Completo"] icon FileText [ref: UC-CV05]
    [Botao: "Salvar Todos"] icon Save [ref: UC-CV03]
    [Botao: "Salvar Score >= 70%"] icon Save [ref: UC-CV03]
    [Botao: "Exportar CSV"] icon Download [ref: UC-CV05]
    [Botao: "Salvar Selecionados"] icon Save [ref: UC-CV03]
  [Tabela: DataTable "Resultados"]
    [Coluna: Checkbox] — selecao multipla
    [Coluna: "Fonte"] — badge com cor
    [Coluna: "Numero"] — identificador do edital
    [Coluna: "Orgao"] — nome do orgao contratante
    [Coluna: "UF"] — estado
    [Coluna: "Modalidade"] — tipo de licitacao
    [Coluna: "Objeto"] — descricao resumida
    [Coluna: "Valor"] — valor estimado formatado
    [Coluna: "Produto Correspondente"] — match com portfolio
    [Coluna: "Prazo"] — dias restantes com badge colorido
    [Coluna: "Score"] — barra percentual com cor
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — ver detalhes / abrir painel lateral [ref: Passo 1]
      [Icone-Acao: Save] — salvar edital individual [ref: UC-CV03]

[Card: "Painel Lateral"] — visivel quando edital selecionado [ref: Passo 2]
  [Secao: "Dados do Edital"]
    [Texto: "Numero"] / [Texto: "Orgao"] / [Texto: "UF"]
    [Texto: "Objeto"] / [Texto: "Valor"] / [Texto: "Modalidade"]
    [Texto: "Produto Correspondente"]
    [Badge: "Score"] — percentual com cor
    [Badge: "Potencial"] — Alto/Medio/Baixo
  [Secao: "Score Profundo"] — visivel se calculado [ref: Passo 3]
    [Indicador: "ScoreBar Tecnica"]
    [Indicador: "ScoreBar Documental"]
    [Indicador: "ScoreBar Complexidade"]
    [Indicador: "ScoreBar Juridico"]
    [Indicador: "ScoreBar Logistico"]
    [Indicador: "ScoreBar Comercial"]
    [Badge: "Decisao IA"]
    [Texto: "Justificativa"]
    [Lista: "Pontos Positivos"]
    [Lista: "Pontos de Atencao"]
  [Secao: "Intencao Estrategica"] [ref: Passo 5, UC-CV04]
    [Radio: "Estrategico"]
    [Radio: "Defensivo"]
    [Radio: "Acompanhamento"]
    [Radio: "Aprendizado"]
  [Secao: "Expectativa de Margem"] [ref: Passo 5, UC-CV04]
    [Campo: Slider] — 0% a 50%
    [Toggle: "Varia por Produto"]
    [Toggle: "Varia por Regiao"]
  [Secao: "Acoes"]
    [Botao: "Salvar Estrategia"] [ref: UC-CV04]
    [Botao: "Salvar Edital"] [ref: UC-CV03]
    [Botao: "Ir para Validacao"] icon ExternalLink [ref: Passo 6]
    [Botao: "Abrir no Portal"] icon ExternalLink [ref: Passo 6]
    [Botao: "Baixar PDF"] icon Download [ref: Passo 6]
  [Secao: "Acoes IA"]
    [Botao: "Classificar Edital via IA"] [ref: Passo 6]
    [Botao: "Recomendar Preco"] [ref: Passo 6]
    [Botao: "Historico de Precos"] [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Tabela: "Resultados"] / [Icone-Acao: Eye] | 1 |
| [Card: "Painel Lateral"] — dados do edital | 2 |
| [Secao: "Score Profundo"] + 6 ScoreBars | 3 |
| Carga automatica de scores | 4 |
| [Secao: "Intencao Estrategica"] + [Secao: "Margem"] | 5 |
| [Botao: "Ir para Validacao"] / [Botao: "Abrir no Portal"] / [Botao: "Baixar PDF"] / Acoes IA | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV03] Salvar edital, itens e scores da captacao

**RF relacionados:** RF-019, RF-020, RF-023

**Regras de Negocio aplicaveis:**
- Presentes: RN-066
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Resultado de busca disponivel.
2. CRUD de `editais` e `editais-itens` disponivel.

### Pos-condicoes
1. Edital passa a existir em `editais`.
2. Itens do edital podem ser persistidos para alimentar validacao e lotes.
3. Scores da captacao podem ser salvos para evitar recalculo posterior.
4. O registro salvo passa a ser elegivel na `ValidacaoPage`.

### Botoes e acoes observadas
- `Salvar edital` por linha
- `Salvar Todos`
- `Salvar Score >= 70%`
- `Salvar Selecionados`

### Sequencia de eventos
1. Usuario escolhe salvar um edital individualmente clicando no [Icone-Acao: Save] na linha da [Tabela: "Resultados"] ou no [Botao: "Salvar Edital"] do [Card: "Painel Lateral"]. [ref: Passo 1]
2. Alternativamente, usuario clica em [Botao: "Salvar Todos"], [Botao: "Salvar Score >= 70%"] ou [Botao: "Salvar Selecionados"] na [Secao: "Acoes em Lote"]. [ref: Passo 2]
3. Sistema cria ou atualiza o registro em `editais` via CRUD. [ref: Passo 3]
4. Se houver itens na busca, sistema grava em `editais-itens`; se nao houver, tenta `POST /api/editais/{id}/buscar-itens-pncp`. [ref: Passo 4]
5. Se o edital tiver score rapido ou profundo, a tela tenta `POST /api/editais/salvar-scores-captacao`. [ref: Passo 5]
6. A UI marca o edital como salvo com [Badge: "Salvo"] e pode oferecer download do PDF. [ref: Passo 6]

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 3 (Tabela) + Bloco 4 (Painel Lateral)

#### Layout da Tela

> Nota: Os elementos de tela estao detalhados no layout de UC-CV02. Aqui estao listados apenas os elementos diretamente envolvidos no salvamento.

[Secao: "Acoes em Lote"]
  [Botao: "Salvar Todos"] icon Save [ref: Passo 2]
  [Botao: "Salvar Score >= 70%"] icon Save [ref: Passo 2]
  [Botao: "Salvar Selecionados"] icon Save [ref: Passo 2]

[Tabela: DataTable "Resultados"]
  [Coluna: "Acoes"]
    [Icone-Acao: Save] — salvar edital individual [ref: Passo 1]

[Card: "Painel Lateral"]
  [Botao: "Salvar Edital"] [ref: Passo 1]

[Badge: "Salvo"] — aparece apos persistencia [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Icone-Acao: Save] na tabela / [Botao: "Salvar Edital"] no painel | 1 |
| [Botao: "Salvar Todos"] / [Botao: "Salvar Score >= 70%"] / [Botao: "Salvar Selecionados"] | 2 |
| [Badge: "Salvo"] | 6 |

### Persistencia observada
Tabela `editais` com campos relevantes: `numero`, `orgao`, `uf`, `objeto`, `modalidade`, `valor_referencia`, `status`, `fonte`, `url`, `pdf_url`, `pdf_path`, `cnpj_orgao`, `ano_compra`, `seq_compra`, `classe_produto_id`, `subclasse_produto_id`.
Tabela `editais_itens`: `edital_id`, `numero_item`, `descricao`, `quantidade`, `unidade_medida`, `valor_unitario_estimado`, `valor_total_estimado`, `tipo_beneficio`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV04] Definir estrategia, intencao e margem do edital

**RF relacionados:** RF-023, RF-027, RF-037

**Regras de Negocio aplicaveis:**
- Presentes: RN-063
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/estrategico

### Pre-condicoes
1. Edital selecionado no painel lateral.
2. Registro de edital salvo ou passivel de salvamento.

### Pos-condicoes
1. Estrategia comercial do edital fica persistida.
2. Margem desejada e perfil de abordagem ficam registrados.

### Botoes e acoes observadas
- radio de `Estrategico`, `Defensivo`, `Acompanhamento`, `Aprendizado`
- slider de margem
- toggles `Varia por Produto` e `Varia por Regiao`
- `Salvar Estrategia`

### Sequencia de eventos
1. Usuario abre o [Card: "Painel Lateral"] do edital selecionado. [ref: Passo 1]
2. Na [Secao: "Intencao Estrategica"], usuario escolhe uma das 4 opcoes via [Radio: "Estrategico"], [Radio: "Defensivo"], [Radio: "Acompanhamento"] ou [Radio: "Aprendizado"]. [ref: Passo 2]
3. Na [Secao: "Expectativa de Margem"], usuario ajusta o [Campo: Slider] de margem desejada (0-50%). [ref: Passo 3]
4. Usuario pode sinalizar variacao via [Toggle: "Varia por Produto"] e [Toggle: "Varia por Regiao"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Salvar Estrategia"]. [ref: Passo 5]
6. Sistema garante que o edital esteja salvo (cria registro em `editais` se necessario). [ref: Passo 6]
7. Sistema cria ou atualiza o registro em `estrategias-editais` via CRUD. [ref: Passo 7]

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 4 (Painel Lateral)

#### Layout da Tela

> Nota: O layout completo do Painel Lateral esta em UC-CV02. Aqui estao os elementos especificos da estrategia.

[Card: "Painel Lateral"]
  [Secao: "Intencao Estrategica"]
    [Radio: "Estrategico"] [ref: Passo 2]
    [Radio: "Defensivo"] [ref: Passo 2]
    [Radio: "Acompanhamento"] [ref: Passo 2]
    [Radio: "Aprendizado"] [ref: Passo 2]
  [Secao: "Expectativa de Margem"]
    [Campo: Slider] — 0% a 50% [ref: Passo 3]
    [Toggle: "Varia por Produto"] [ref: Passo 4]
    [Toggle: "Varia por Regiao"] [ref: Passo 4]
  [Botao: "Salvar Estrategia"] [ref: Passo 5]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Painel Lateral"] | 1 |
| [Radio: "Estrategico/Defensivo/Acompanhamento/Aprendizado"] | 2 |
| [Campo: Slider de margem] | 3 |
| [Toggle: "Varia por Produto"] / [Toggle: "Varia por Regiao"] | 4 |
| [Botao: "Salvar Estrategia"] | 5 |

### Persistencia observada
Tabela `estrategias_editais`: `user_id`, `edital_id`, `decisao`, `prioridade`, `margem_desejada`, `agressividade_preco`, `perfil_competitivo`, `margem_minima`, `margem_maxima`, `desconto_maximo`, `priorizar_volume`, `notas_estrategia`, `cenarios_simulados`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV05] Exportar e consolidar resultados da busca

**RF relacionados:** RF-019, RF-026
**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Resultados de busca carregados.

### Pos-condicoes
1. Usuario consegue exportar a grade corrente em CSV.
2. Usuario consegue gerar relatorio consolidado em markdown/HTML/PDF de impressao.

### Botoes e acoes observadas
- `Relatório Completo`
- `Exportar CSV`

### Sequencia de eventos
1. Usuario executa uma busca e visualiza resultados na [Tabela: "Resultados"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Exportar CSV"] na [Secao: "Acoes em Lote"] para baixar a lista corrente em formato CSV. [ref: Passo 2]
3. Usuario clica no [Botao: "Relatório Completo"] na [Secao: "Acoes em Lote"] para consolidar a busca atual em relatorio textual estruturado (markdown/HTML). [ref: Passo 3]
4. Sistema usa o mesmo dataset normalizado da grade para gerar a saida consolidada. [ref: Passo 4]

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 3 (Secao de Acoes em Lote acima da Tabela)

#### Layout da Tela

> Nota: Elementos compartilhados com UC-CV02/CV03. Aqui apenas os de exportacao.

[Secao: "Acoes em Lote"]
  [Botao: "Relatório Completo"] icon FileText [ref: Passo 3]
  [Botao: "Exportar CSV"] icon Download [ref: Passo 2]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Tabela: "Resultados"] | 1 |
| [Botao: "Exportar CSV"] | 2 |
| [Botao: "Relatório Completo"] | 3 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV06] Gerir monitoramentos automaticos de busca

**RF relacionados:** RF-025
**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Pagina `CaptacaoPage` acessivel.
2. CRUD de `monitoramentos` disponivel.

### Pos-condicoes
1. Monitoramento fica criado, pausado, retomado ou excluido.
2. Parametros da busca automatica ficam persistidos.

### Botoes e acoes observadas
- `Novo Monitoramento`
- `Criar`
- `Pausar`
- `Retomar`
- `Excluir`
- `Atualizar`

### Sequencia de eventos
1. Usuario rola ate o [Card: "Monitoramento Automatico"] no final da CaptacaoPage. [ref: Passo 1]
2. Usuario clica no [Botao: "Novo Monitoramento"] para abrir o formulario inline. [ref: Passo 2]
3. Usuario informa [Campo: "Termo"], [Campo: "NCM"], [Select: "UFs"], [Select: "Fonte"], [Select: "Frequencia"], [Campo: "Score Minimo"] e [Checkbox: "Incluir Encerrados"]. [ref: Passo 3]
4. Usuario clica no [Botao: "Criar"]. [ref: Passo 4]
5. Sistema persiste em `monitoramentos` via CRUD. [ref: Passo 5]
6. Na [Tabela: "Monitoramentos Ativos"], usuario pode clicar em [Botao: "Pausar"], [Botao: "Retomar"], [Botao: "Atualizar"] ou [Botao: "Excluir"] para gerenciar monitoramentos existentes. [ref: Passo 6]
7. A [Tabela: "Ultimos Editais Encontrados"] exibe editais detectados pelo monitoramento com numero, orgao, objeto, valor e data. [ref: Passo 7]

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 5 (Card Monitoramento Automatico)

#### Layout da Tela

[Card: "Monitoramento Automatico"] icon Bell
  [Botao: "Novo Monitoramento"] icon Plus [ref: Passo 2]
  [Secao: "Formulario Inline"] — visivel apos clicar Novo Monitoramento
    [Campo: "Termo"] — text [ref: Passo 3]
    [Campo: "NCM"] — text [ref: Passo 3]
    [Select: "UFs"] — multiselect [ref: Passo 3]
    [Select: "Fonte"] — select [ref: Passo 3]
    [Select: "Frequencia"] — select (horas) [ref: Passo 3]
    [Campo: "Score Minimo"] — number [ref: Passo 3]
    [Checkbox: "Incluir Encerrados"] [ref: Passo 3]
    [Botao: "Criar"] icon Check [ref: Passo 4]
  [Tabela: "Monitoramentos Ativos"]
    [Coluna: "Termo"]
    [Coluna: "Fontes"]
    [Coluna: "UFs"]
    [Coluna: "Frequencia"]
    [Coluna: "Score Min"]
    [Coluna: "Status"] — Ativo/Pausado badge
    [Coluna: "Ultimo Check"]
    [Coluna: "Editais Encontrados"]
    [Coluna: "Acoes"]
      [Botao: "Pausar"] / [Botao: "Retomar"] [ref: Passo 6]
      [Botao: "Atualizar"] [ref: Passo 6]
      [Botao: "Excluir"] [ref: Passo 6]
  [Tabela: "Ultimos Editais Encontrados"] [ref: Passo 7]
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Objeto"]
    [Coluna: "Valor"]
    [Coluna: "Data"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Monitoramento Automatico"] | 1 |
| [Botao: "Novo Monitoramento"] | 2 |
| [Campo: "Termo"] / [Campo: "NCM"] / [Select: "UFs/Fonte/Frequencia"] / [Campo: "Score Minimo"] / [Checkbox: "Incluir Encerrados"] | 3 |
| [Botao: "Criar"] | 4 |
| [Botao: "Pausar"] / [Botao: "Retomar"] / [Botao: "Atualizar"] / [Botao: "Excluir"] | 6 |
| [Tabela: "Ultimos Editais Encontrados"] | 7 |

### Persistencia observada
Tabela `monitoramentos`: `termo`, `ncm`, `fontes`, `ufs`, `incluir_encerrados`, `valor_minimo`, `valor_maximo`, `frequencia_horas`, `score_minimo_alerta`, `ativo`, `ultimo_check`, `editais_encontrados`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV07] Listar editais salvos e selecionar edital para analise

**RF relacionados:** RF-027, RF-029

**Regras de Negocio aplicaveis:**
- Presentes: RN-064, RN-076
- Faltantes: RN-082 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/analista

### Pre-condicoes
1. Editais ja salvos na captacao.
2. Endpoint `/api/editais/salvos` disponivel.

### Pos-condicoes
1. Usuario consegue selecionar um edital salvo para analisar.
2. Painel por abas da validacao passa a refletir o edital escolhido.

### Botoes e acoes observadas
- filtro por status na tabela de `Meus Editais`
- clique na linha do edital
- `Tentar novamente` em caso de falha de carga
- `Ver Edital`
- select de status do edital no cabecalho da analise

### Sequencia de eventos
1. Usuario acessa a `ValidacaoPage` via menu lateral. [ref: Passo 1]
2. Sistema carrega editais via `GET /api/editais/salvos?com_score=true&com_estrategia=true` e popula a [Tabela: DataTable "Meus Editais"]. [ref: Passo 2]
3. Usuario filtra por status usando o [Select: "Status"] na [Secao: FilterBar] (Todos / Novo / GO / Em Avaliacao / NO-GO) ou pesquisa por texto no [Campo: "Buscar edital..."]. [ref: Passo 3]
4. Usuario clica numa linha da [Tabela: "Meus Editais"]. [ref: Passo 4]
5. Sistema limpa estados auxiliares e monta o [Card: "Edital Info"] com dados do edital + o [Card: "Painel de Abas"] com as 6 abas de analise. [ref: Passo 5]
6. A partir da selecao, a tela tambem tenta carregar itens, lotes, historico e documentacao necessaria. [ref: Passo 6]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Card superior (Meus Editais) + Card inferior (Edital Info + Abas)

#### Layout da Tela

[Cabecalho: "Validacao de Editais"] icon ClipboardCheck
  [Texto: "Analise multi-dimensional, scores e decisao estrategica"]

[Card: "Meus Editais"] icon FileText
  [Alerta: "Erro de carregamento"] — visivel se falha [ref: Passo 2]
    [Botao: "Tentar novamente"] [ref: Passo 2]
  [Secao: FilterBar]
    [Campo: "Buscar edital..."] — text search [ref: Passo 3]
    [Select: "Status"] — Todos / Novo / GO / Em Avaliacao / NO-GO [ref: Passo 3]
  [Tabela: DataTable "Meus Editais"]
    [Coluna: "Numero"] — identificador
    [Coluna: "Orgao"] — nome do orgao
    [Coluna: "UF"] — estado
    [Coluna: "Objeto"] — descricao
    [Coluna: "Valor"] — valor estimado
    [Coluna: "Abertura"] — data de abertura
    [Coluna: "Status"] — badge (Novo / GO / Em Avaliacao / NO-GO)
    [Coluna: "Score"] — barra percentual
    Clique na linha seleciona o edital [ref: Passo 4]

[Card: "Edital Info"] — visivel apos selecao [ref: Passo 5]
  [Texto: "Numero — Orgao"] — titulo do card
  [Secao: "Info Grid"]
    [Texto: "Objeto"]
    [Texto: "Valor"]
    [Texto: "Abertura"]
    [Texto: "Produto"]
  [Secao: "Acoes do Cabecalho"]
    [Botao: "Ver Edital"] icon Eye — abre PdfViewer [ref: Passo 5]
    [Select: "Status"] — Novo / GO / Em Avaliacao / NO-GO [ref: Passo 5]
    [Badge: "Sinais de Mercado"] — AlertTriangle, visivel se existirem sinais
    [Badge: "Decisao salva"] — CheckCircle, visivel apos salvar decisao

[Card: "Painel de Abas"] — 6 abas [ref: Passo 5]
  [Aba: "Aderencia"] icon Target [ref: UC-CV08]
  [Aba: "Lotes (N)"] icon Layers [ref: UC-CV09]
  [Aba: "Documentos"] icon FolderOpen [ref: UC-CV10]
  [Aba: "Riscos"] icon AlertTriangle [ref: UC-CV11]
  [Aba: "Mercado"] icon Building [ref: UC-CV12]
  [Aba: "IA"] icon Sparkles [ref: UC-CV13]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| Navegacao para ValidacaoPage | 1 |
| [Tabela: "Meus Editais"] / [Alerta: "Erro de carregamento"] | 2 |
| [Select: "Status"] / [Campo: "Buscar edital..."] | 3 |
| Clique na linha da tabela | 4 |
| [Card: "Edital Info"] + [Card: "Painel de Abas"] | 5 |
| Carga automatica de itens, lotes, historico, docs | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV08] Calcular scores multidimensionais e decidir GO/NO-GO

**RF relacionados:** RF-027, RF-028, RF-037

**Regras de Negocio aplicaveis:**
- Presentes: RN-047, RN-048, RN-049, RN-050, RN-051, RN-052, RN-053, RN-054, RN-055, RN-064, RN-067
- Faltantes: RN-080 [FALTANTE], RN-081 [FALTANTE], RN-082 [FALTANTE], RN-086 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado na `ValidacaoPage`.
2. Endpoint `/api/editais/{id}/scores-validacao` disponivel.

### Pos-condicoes
1. Scores em 6 dimensoes ficam visiveis.
2. Usuario consegue registrar uma decisao assistida.
3. Persistencia da decisao depende de uma trilha ainda inconsistente.

### Botoes e acoes observadas
Na aba `Aderencia`:
- `Calcular Scores IA` / `Recalcular Scores IA`
- `Participar (GO)`
- `Acompanhar (Em Avaliação)`
- `Rejeitar (NO-GO)`
- `Salvar Justificativa`

### Sequencia de eventos
1. Usuario abre a [Aba: "Aderencia"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Calcular Scores IA"] (ou [Botao: "Recalcular Scores IA"] se ja calculado). [ref: Passo 2]
3. Sistema chama `POST /api/editais/{id}/scores-validacao`. [ref: Passo 3]
4. Sistema atualiza o [Indicador: "ScoreCircle"] (score geral 100px), o [Badge: "Decisao IA"], as 6 [Indicador: "ScoreBar"] (Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial), o [Badge: "Potencial"], o [Texto: "Justificativa IA"], a [Lista: "Pontos Positivos"] e a [Lista: "Pontos de Atencao"]. [ref: Passo 4]
5. Na [Secao: "Mapa Logistico"], sistema exibe UF Edital -> UF Empresa com distancia estimada e dias de transito. [ref: Passo 5]
6. Na [Secao: "Decisao"], usuario escolhe [Botao: "Participar (GO)"], [Botao: "Acompanhar (Em Avaliacao)"] ou [Botao: "Rejeitar (NO-GO)"]. [ref: Passo 6]
7. Sistema abre a [Secao: "Justificativa"] com [Select: "Motivo"] e [Campo: "Detalhes" (TextArea)]. [ref: Passo 7]
8. Usuario clica no [Botao: "Salvar Justificativa"]. [ref: Passo 8]
9. A tela tenta criar ou atualizar `validacao_decisoes` via CRUD. [ref: Passo 9]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 1 "Aderencia" do Painel de Abas

#### Layout da Tela

[Aba: "Aderencia"] icon Target
  [Secao: "Score e Calcular"]
    [Botao: "Calcular Scores IA"] / [Botao: "Recalcular Scores IA"] icon Sparkles [ref: Passo 2]
    [Indicador: "ScoreCircle"] — score geral, 100px diametro [ref: Passo 4]
    [Badge: "Decisao IA"] — GO/NO-GO/Acompanhar com cor [ref: Passo 4]
  [Secao: "Scores por Dimensao"] [ref: Passo 4]
    [Indicador: "ScoreBar Tecnica"] — 0-100%
    [Indicador: "ScoreBar Documental"] — 0-100%
    [Indicador: "ScoreBar Complexidade"] — 0-100%
    [Indicador: "ScoreBar Juridico"] — 0-100%
    [Indicador: "ScoreBar Logistico"] — 0-100%
    [Indicador: "ScoreBar Comercial"] — 0-100%
  [Badge: "Potencial"] — Alto/Medio/Baixo [ref: Passo 4]
  [Secao: "Analise da IA"] [ref: Passo 4]
    [Texto: "Justificativa IA"] — texto descritivo
    [Lista: "Pontos Positivos"] — itens em verde
    [Lista: "Pontos de Atencao"] — itens em amarelo
  [Secao: "Mapa Logistico"] [ref: Passo 5]
    [Texto: "UF Edital"] -> [Texto: "UF Empresa"]
    [Texto: "Distancia estimada"]
    [Texto: "Dias de transito"]
  [Secao: "Decisao"] [ref: Passo 6]
    [Botao: "Participar (GO)"] — verde
    [Botao: "Acompanhar (Em Avaliacao)"] — amarelo
    [Botao: "Rejeitar (NO-GO)"] — vermelho
  [Secao: "Justificativa"] — visivel apos decisao [ref: Passo 7]
    [Select: "Motivo"] — lista de motivos pre-definidos
    [Campo: "Detalhes"] — TextArea
    [Botao: "Salvar Justificativa"] [ref: Passo 8]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Aderencia"] | 1 |
| [Botao: "Calcular Scores IA"] / [Botao: "Recalcular Scores IA"] | 2 |
| [Indicador: "ScoreCircle"] + 6 ScoreBars + [Badge: "Decisao IA"] + [Badge: "Potencial"] | 4 |
| [Texto: "Justificativa IA"] + [Lista: "Pontos Positivos/Atencao"] | 4 |
| [Secao: "Mapa Logistico"] | 5 |
| [Botao: "Participar/Acompanhar/Rejeitar"] | 6 |
| [Select: "Motivo"] + [Campo: "Detalhes"] | 7 |
| [Botao: "Salvar Justificativa"] | 8 |

### Observacao critica
O frontend tenta persistir a decisao em `validacao_decisoes`, mas essa tabela nao existe no schema `editais` consultado em 30/03/2026. Portanto, a experiencia visual esta implementada, mas a trilha de persistencia da decisao deve ser tratada como **parcial/inconsistente**.

### Implementacao atual
**PARCIAL / COM DIVERGENCIA DE PERSISTENCIA**

---

## [UC-CV09] Importar itens e extrair lotes por IA

**RF relacionados:** RF-031, RF-036

**Regras de Negocio aplicaveis:**
- Faltantes: RN-085 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. Itens do edital inexistentes ou incompletos.
3. PDF do edital disponivel para extracao de lotes.

### Pos-condicoes
1. Itens podem ser importados do PNCP.
2. Lotes podem ser extraidos e reprocessados via IA.
3. Usuario consegue mover itens entre lotes e excluir lotes.

### Botoes e acoes observadas
Na aba `Lotes`:
- `Buscar Itens no PNCP`
- `Extrair Lotes via IA`
- `Reprocessar`
- `Excluir lote`
- combo `Mover para` por item

### Sequencia de eventos
1. Usuario abre a [Aba: "Lotes"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Sistema exibe a [Tabela: "Itens do Edital"] com itens previamente carregados (se houver). [ref: Passo 2]
3. Se nao houver itens, usuario clica no [Botao: "Buscar Itens no PNCP"]. [ref: Passo 3]
4. Sistema chama `POST /api/editais/{id}/buscar-itens-pncp` e popula a tabela. [ref: Passo 4]
5. Com itens carregados, usuario clica no [Botao: "Extrair Lotes via IA"] (ou [Botao: "Reprocessar"] se ja extraido). [ref: Passo 5]
6. Sistema chama `POST /api/editais/{id}/lotes/extrair`. [ref: Passo 6]
7. A interface passa a exibir [Card: "Lote N"] com itens agrupados, valor estimado e status por lote. [ref: Passo 7]
8. Usuario pode usar o [Select: "Mover para"] em cada item para redistribuir entre lotes. [ref: Passo 8]
9. Usuario pode clicar no [Icone-Acao: XCircle "Excluir lote"] para remover um lote. [ref: Passo 9]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 2 "Lotes" do Painel de Abas

#### Layout da Tela

[Aba: "Lotes (N)"] icon Layers
  [Secao: "Itens do Edital"]
    [Tabela: DataTable "Itens do Edital"] [ref: Passo 2]
      [Coluna: "#"] — numero do item
      [Coluna: "Descricao"] — descricao do item
      [Coluna: "Qtd"] — quantidade
      [Coluna: "Unid"] — unidade de medida
      [Coluna: "Vlr Unit"] — valor unitario estimado
      [Coluna: "Vlr Total"] — valor total estimado
    [Botao: "Buscar Itens no PNCP"] icon Search [ref: Passo 3]
  [Secao: "Lotes"]
    [Botao: "Extrair Lotes via IA"] icon Sparkles [ref: Passo 5]
    [Botao: "Reprocessar"] icon RefreshCw [ref: Passo 5]
    [Card: "Lote 1"] [ref: Passo 7]
      [Texto: "Titulo do Lote"]
      [Texto: "Valor estimado"]
      [Lista: "Itens do Lote"]
        [Texto: "Item N — Descricao"]
        [Select: "Mover para"] — lote destino [ref: Passo 8]
      [Icone-Acao: XCircle "Excluir lote"] [ref: Passo 9]
    [Card: "Lote 2"] ...
    [Card: "Lote N"] ...

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Lotes"] | 1 |
| [Tabela: "Itens do Edital"] | 2 |
| [Botao: "Buscar Itens no PNCP"] | 3 |
| [Botao: "Extrair Lotes via IA"] / [Botao: "Reprocessar"] | 5 |
| [Card: "Lote N"] com itens agrupados | 7 |
| [Select: "Mover para"] | 8 |
| [Icone-Acao: XCircle "Excluir lote"] | 9 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV10] Confrontar documentacao necessaria com a empresa

**RF relacionados:** RF-029, RF-035, RF-036

**Regras de Negocio aplicaveis:**
- Presentes: RN-071, RN-072
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario compliance/comercial

### Pre-condicoes
1. Edital selecionado.
2. Empresa e documentacao da empresa cadastradas.
3. Endpoint `/api/editais/{id}/documentacao-necessaria` disponivel.

### Pos-condicoes
1. Usuario visualiza documentos exigidos, faltantes e vencidos.
2. Requisitos podem ser reextraidos do edital.
3. Certidoes podem ser atualizadas a partir da propria aba, com ressalva de divergencia de parametro.

### Botoes e acoes observadas
Na aba `Documentos`:
- `Identificar Documentos Exigidos pelo Edital` / `Reidentificar Documentos do Edital`
- `Buscar Documentos Exigidos`
- `Verificar Certidões`

### Sequencia de eventos
1. Usuario abre a [Aba: "Documentos"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Sistema tenta carregar `GET /api/editais/{id}/documentacao-necessaria` e popula a interface. [ref: Passo 2]
3. Interface agrupa os documentos por categoria em [Secao: "Pasta Categoria"] (Habilitacao Juridica, Fiscal, Qualificacao Tecnica, etc.) e mostra [Badge: "Disponivel"] / [Badge: "Vencido"] / [Badge: "Faltante"] por documento. [ref: Passo 3]
4. A [Secao: "Resumo de Completude"] exibe [Progresso: "Barra de completude"] com contadores de documentos disponiveis, vencidos e faltantes. [ref: Passo 4]
5. A [Tabela: "Checklist Documental IA"] mostra requisitos extraidos com status de atendimento. [ref: Passo 5]
6. Usuario pode acionar o [Botao: "Identificar Documentos Exigidos pelo Edital"] (ou [Botao: "Reidentificar Documentos do Edital"]) para chamar `POST /api/editais/{id}/extrair-requisitos`. [ref: Passo 6]
7. Ao concluir, a tela recarrega `documentacao-necessaria`. [ref: Passo 7]
8. Usuario pode acionar o [Botao: "Buscar Documentos Exigidos"] que pergunta ao chat quais documentos o edital exige. [ref: Passo 8]
9. Usuario pode acionar o [Botao: "Verificar Certidoes"], que reexecuta a busca de certidoes e tenta recarregar a completude documental. [ref: Passo 9]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 3 "Documentos" do Painel de Abas

#### Layout da Tela

[Aba: "Documentos"] icon FolderOpen
  [Secao: "Acoes de Extracao"]
    [Botao: "Identificar Documentos Exigidos pelo Edital"] / [Botao: "Reidentificar Documentos do Edital"] icon FileSearch [ref: Passo 6]
    [Botao: "Buscar Documentos Exigidos"] icon Search [ref: Passo 8]
    [Botao: "Verificar Certidoes"] icon Shield [ref: Passo 9]
  [Secao: "Documentacao Necessaria"] [ref: Passo 3]
    [Secao: "Pasta — Habilitacao Juridica"] icon Folder
      [Texto: "Nome do documento"]
      [Badge: "Disponivel"] — verde / [Badge: "Vencido"] — vermelho / [Badge: "Faltante"] — cinza
    [Secao: "Pasta — Regularidade Fiscal"]
      ...
    [Secao: "Pasta — Qualificacao Tecnica"]
      ...
    [Secao: "Pasta — Qualificacao Economica"]
      ...
    [Secao: "Pasta — Outros"]
      ...
  [Secao: "Resumo de Completude"] [ref: Passo 4]
    [Progresso: "Barra de completude"] — percentual preenchido
    [Indicador: "Disponiveis"] — contador verde
    [Indicador: "Vencidos"] — contador vermelho
    [Indicador: "Faltantes"] — contador cinza
  [Tabela: "Checklist Documental IA"] [ref: Passo 5]
    [Coluna: "Requisito"]
    [Coluna: "Status"] — badge Atendido/Pendente/Vencido
    [Coluna: "Observacao"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Documentos"] | 1 |
| Carga de documentacao-necessaria | 2 |
| [Secao: "Pasta — Categoria"] + badges de status | 3 |
| [Secao: "Resumo de Completude"] + [Progresso] | 4 |
| [Tabela: "Checklist Documental IA"] | 5 |
| [Botao: "Identificar Documentos Exigidos"] / [Botao: "Reidentificar"] | 6 |
| [Botao: "Buscar Documentos Exigidos"] | 8 |
| [Botao: "Verificar Certidoes"] | 9 |

### Observacao critica
O botao `Verificar Certidões` envia `empresa_id: edital.id` para `/api/empresa-certidoes/buscar-stream`. Isso aparenta ser um acoplamento incorreto entre edital e empresa, entao esse trecho deve ser tratado como **parcial/com divergencia funcional** ate confirmacao de backend.

### Implementacao atual
**PARCIAL / COM DIVERGENCIA FUNCIONAL**

---

## [UC-CV11] Analisar riscos, recorrencia, atas e concorrentes

**RF relacionados:** RF-030, RF-032, RF-033, RF-034

**Regras de Negocio aplicaveis:**
- Presentes: RN-045, RN-061, RN-062, RN-073, RN-074
- Faltantes: RN-084 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. PDF e dados do edital disponiveis para processamento.

### Pos-condicoes
1. Usuario obtem pipeline de riscos e trechos relevantes.
2. Sistema pode buscar atas, vencedores e concorrentes conhecidos.
3. Usuario passa a enxergar sinais de recorrencia e historico competitivo.

### Botoes e acoes observadas
Na aba `Riscos`:
- `Analisar Riscos do Edital` / `Reanalisar Riscos do Edital`
- `Rebuscar Atas`
- `Buscar Vencedores e Preços`
- `Atualizar` concorrentes

### Sequencia de eventos
1. Usuario abre a [Aba: "Riscos"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Analisar Riscos do Edital"] (ou [Botao: "Reanalisar Riscos do Edital"]). [ref: Passo 2]
3. Sistema chama `POST /api/editais/{id}/analisar-riscos`. [ref: Passo 3]
4. A interface exibe o [Secao: "Pipeline de Riscos"] com [Badge] de modalidade, pagamento e sinais de mercado. [ref: Passo 4]
5. O [Secao: "Riscos Identificados"] agrupa riscos por categoria (juridico, tecnico, financeiro, logistico) com [Badge] de severidade (critico / alto / medio / baixo). [ref: Passo 5]
6. O [Secao: "Fatal Flaws"] destaca riscos eliminatorios, se existirem. [ref: Passo 6]
7. O [Secao: "Flags Juridicos"] exibe alertas legais identificados pela IA. [ref: Passo 7]
8. O [Secao: "Trechos Relevantes"] mostra trechos do edital marcados pela IA. [ref: Passo 8]
9. Na [Secao: "Historico de Atas e Vencedores"], usuario clica no [Botao: "Rebuscar Atas"] para chamar `POST /api/editais/{id}/historico-vencedores`. [ref: Passo 9]
10. Sistema exibe [Lista: "Atas encontradas"] com titulo, orgao, UF, data e link "Ver no PNCP", alem de [Badge: "Recorrencia"] (Semestral / Anual / Esporadica). [ref: Passo 10]
11. Se houver atas, usuario pode clicar no [Botao: "Buscar Vencedores e Precos"] para chamar `POST /api/editais/{id}/vencedores-atas`. [ref: Passo 11]
12. Sistema exibe [Tabela: "Vencedores e Precos Registrados"] com colunas Item, Vencedor, Vlr Est., Vlr Homol., Desc.% agrupados por ata. [ref: Passo 12]
13. Na [Secao: "Concorrentes Conhecidos"], usuario clica no [Botao: "Atualizar"] para buscar `/api/concorrentes/listar`. [ref: Passo 13]
14. Sistema exibe [Tabela: "Concorrentes"] com colunas Concorrente, Participacoes, Vitorias, Taxa(%). [ref: Passo 14]
15. Se houver >= 2 editais perdidos, sistema exibe [Alerta: "Alerta de Recorrencia"] em amarelo. [ref: Passo 15]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 4 "Riscos" do Painel de Abas

#### Layout da Tela

[Aba: "Riscos"] icon AlertTriangle
  [Secao: "Acao de Analise"]
    [Botao: "Analisar Riscos do Edital"] / [Botao: "Reanalisar Riscos do Edital"] icon Shield [ref: Passo 2]
  [Secao: "Pipeline de Riscos"] [ref: Passo 4]
    [Badge: "Modalidade"] — tipo de licitacao
    [Badge: "Pagamento"] — risco de pagamento
    [Badge: "Sinais Mercado"] — alertas de mercado
  [Secao: "Riscos Identificados"] [ref: Passo 5]
    [Secao: "Riscos Juridicos"]
      [Texto: "Descricao do risco"]
      [Badge: "Severidade"] — critico/alto/medio/baixo
    [Secao: "Riscos Tecnicos"]
      ...
    [Secao: "Riscos Financeiros"]
      ...
    [Secao: "Riscos Logisticos"]
      ...
  [Secao: "Fatal Flaws"] [ref: Passo 6]
    [Alerta: "Risco eliminatorio"] — vermelho, se existir
  [Secao: "Flags Juridicos"] [ref: Passo 7]
    [Lista: "Alertas legais"]
  [Secao: "Trechos Relevantes"] [ref: Passo 8]
    [Lista: "Trechos do edital marcados"]
  [Secao: "Historico de Atas e Vencedores"]
    [Botao: "Rebuscar Atas"] icon RefreshCw [ref: Passo 9]
    [Texto: "Termo buscado"] / [Texto: "N ata(s) encontrada(s)"]
    [Badge: "Recorrencia"] — Semestral / Anual / Esporadica [ref: Passo 10]
    [Lista: "Atas encontradas"] [ref: Passo 10]
      [Texto: "Titulo da ata"]
      [Texto: "Orgao (UF) — Data"]
      [Botao: "Ver no PNCP"] — link externo
    [Botao: "Buscar Vencedores e Precos"] icon TrendingUp [ref: Passo 11]
    [Tabela: "Vencedores e Precos Registrados"] [ref: Passo 12]
      [Coluna: "Item"] — descricao do item
      [Coluna: "Vencedor"] — nome + porte
      [Coluna: "Vlr Est."] — valor estimado
      [Coluna: "Vlr Homol."] — valor homologado
      [Coluna: "Desc."] — percentual de desconto
  [Secao: "Concorrentes Conhecidos"]
    [Botao: "Atualizar"] icon Search [ref: Passo 13]
    [Tabela: "Concorrentes"] [ref: Passo 14]
      [Coluna: "Concorrente"] — nome + CNPJ
      [Coluna: "Participacoes"]
      [Coluna: "Vitorias"]
      [Coluna: "Taxa"] — percentual com badge colorido
  [Alerta: "Alerta de Recorrencia"] — visivel se >= 2 editais perdidos [ref: Passo 15]
    [Texto: "Editais semelhantes foram perdidos N vezes por motivos recorrentes."]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Riscos"] | 1 |
| [Botao: "Analisar Riscos"] / [Botao: "Reanalisar Riscos"] | 2 |
| [Secao: "Pipeline de Riscos"] + badges | 4 |
| [Secao: "Riscos Identificados"] por categoria + severidade | 5 |
| [Secao: "Fatal Flaws"] | 6 |
| [Secao: "Flags Juridicos"] | 7 |
| [Secao: "Trechos Relevantes"] | 8 |
| [Botao: "Rebuscar Atas"] | 9 |
| [Lista: "Atas"] + [Badge: "Recorrencia"] | 10 |
| [Botao: "Buscar Vencedores e Precos"] | 11 |
| [Tabela: "Vencedores e Precos"] | 12 |
| [Botao: "Atualizar"] concorrentes | 13 |
| [Tabela: "Concorrentes"] | 14 |
| [Alerta: "Alerta de Recorrencia"] | 15 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV12] Analisar mercado do orgao contratante

**RF relacionados:** RF-033

**Regras de Negocio aplicaveis:**
- Presentes: RN-045, RN-056, RN-057, RN-058, RN-059, RN-060, RN-069, RN-070, RN-076
- Faltantes: RN-079 [FALTANTE], RN-087 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. Endpoint `/api/editais/{id}/analisar-mercado` disponivel.

### Pos-condicoes
1. Usuario visualiza dados do orgao, reputacao, volume de compras, compras similares e historico interno.
2. Analise textual da IA fica associada ao contexto do edital.

### Botoes e acoes observadas
Na aba `Mercado`:
- `Analisar Mercado do Órgão` / `Reanalisar Mercado`

### Sequencia de eventos
1. Usuario abre a [Aba: "Mercado"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Analisar Mercado do Orgao"] (ou [Botao: "Reanalisar Mercado"]). [ref: Passo 2]
3. Sistema chama `POST /api/editais/{id}/analisar-mercado`. [ref: Passo 3]
4. A [Secao: "Dados do Orgao"] exibe Nome, CNPJ e UF do orgao. [ref: Passo 4]
5. A [Secao: "Reputacao do Orgao"] exibe 6 indicadores: Esfera, Risco Pagamento, Volume Compras, Modalidade Principal, % Pregao Eletronico, Editais Similares. [ref: Passo 5]
6. A [Secao: "Volume de Compras no PNCP"] exibe 3 cards (Compras encontradas, Valor total, Valor medio) + badges de modalidades. [ref: Passo 6]
7. A [Secao: "Compras Similares"] lista compras do mesmo orgao com objeto, valor, data e modalidade. [ref: Passo 7]
8. A [Secao: "Historico Interno"] exibe badges com total de editais, GO, NO-GO e Em Avaliacao para o mesmo orgao. [ref: Passo 8]
9. A [Secao: "Analise de Mercado (IA)"] exibe texto analitico gerado pela IA sobre o orgao. [ref: Passo 9]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 5 "Mercado" do Painel de Abas

#### Layout da Tela

[Aba: "Mercado"] icon Building
  [Secao: "Acao de Analise"]
    [Botao: "Analisar Mercado do Orgao"] / [Botao: "Reanalisar Mercado"] icon Building [ref: Passo 2]
    [Badge: "Cache (dados recentes)"] — visivel se dados cacheados
  [Secao: "Dados do Orgao"] icon Building [ref: Passo 4]
    [Texto: "Nome"] — nome do orgao
    [Texto: "CNPJ"] — CNPJ do orgao
    [Texto: "UF"] — estado
  [Secao: "Reputacao do Orgao"] icon Shield [ref: Passo 5]
    [Indicador: "Esfera"] — Federal/Estadual/Municipal com cor
    [Indicador: "Risco Pagamento"] — Baixo/Medio/Alto com cor
    [Indicador: "Volume Compras"] — texto
    [Indicador: "Modalidade Principal"] — texto
    [Indicador: "% Pregao Eletronico"] — percentual com cor
    [Indicador: "Editais Similares"] — numero
  [Secao: "Volume de Compras no PNCP"] icon TrendingUp [ref: Passo 6]
    [Card: "Compras encontradas"] — numero em azul
    [Card: "Valor total"] — moeda em verde
    [Card: "Valor medio"] — moeda em amarelo
    [Lista: "Modalidades"] — badges com contagem
  [Secao: "Compras Similares"] icon Search [ref: Passo 7]
    [Lista: "Compras"]
      [Texto: "Objeto"]
      [Texto: "Valor"]
      [Texto: "Data"]
      [Badge: "Modalidade"]
  [Secao: "Historico Interno"] icon ClipboardCheck [ref: Passo 8]
    [Badge: "N edital(is)"] — azul
    [Badge: "N GO"] — verde
    [Badge: "N NO-GO"] — vermelho
    [Badge: "N Em Avaliacao"] — amarelo
  [Secao: "Analise de Mercado (IA)"] icon Sparkles [ref: Passo 9]
    [Texto: "Analise textual"] — texto longo gerado pela IA

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Mercado"] | 1 |
| [Botao: "Analisar Mercado do Orgao"] / [Botao: "Reanalisar Mercado"] | 2 |
| [Secao: "Dados do Orgao"] | 4 |
| [Secao: "Reputacao do Orgao"] — 6 indicadores | 5 |
| [Secao: "Volume de Compras no PNCP"] — 3 cards + badges | 6 |
| [Secao: "Compras Similares"] | 7 |
| [Secao: "Historico Interno"] — badges GO/NO-GO | 8 |
| [Secao: "Analise de Mercado (IA)"] | 9 |

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV13] Usar IA na validacao: resumo, perguntas e acoes rapidas

**RF relacionados:** RF-026, RF-029, RF-030

**Regras de Negocio aplicaveis:**
- Presentes: RN-075
- Faltantes: RN-083 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. Servico de chat/IA disponivel.

### Pos-condicoes
1. Usuario consegue resumir, perguntar e obter respostas especificas sobre o edital.
2. Respostas ficam refletidas na propria aba `IA`.

### Botoes e acoes observadas
Na aba `IA`:
- `Gerar Resumo`
- `Regerar Resumo`
- `Perguntar`
- `Requisitos Técnicos`
- `Classificar Edital`

### Sequencia de eventos
1. Usuario abre a [Aba: "IA"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Na [Secao: "Resumo Gerado pela IA"], usuario clica no [Botao: "Gerar Resumo"] (ou [Botao: "Regerar Resumo"] se ja existir). [ref: Passo 2]
3. Sistema chama `/api/chat` com sessao de pagina e exibe o resumo formatado em markdown renderizado. [ref: Passo 3]
4. Na [Secao: "Pergunte a IA sobre este Edital"], usuario digita uma pergunta no [Campo: TextInput "Pergunta"] e clica no [Botao: "Perguntar"]. [ref: Passo 4]
5. Sistema responde via `/api/chat` e exibe a resposta na [Secao: "Resposta"]. [ref: Passo 5]
6. Na [Secao: "Acoes Rapidas via IA"], usuario pode clicar no [Botao: "Requisitos Tecnicos"] para listar requisitos tecnicos do edital. [ref: Passo 6]
7. Usuario pode clicar no [Botao: "Classificar Edital"] para obter classificacao (comodato/venda/aluguel/consumo/servico) com justificativa. [ref: Passo 7]
8. As respostas das acoes rapidas sao exibidas na mesma area de resposta da [Secao: "Pergunte a IA"]. [ref: Passo 8]

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 6 "IA" do Painel de Abas

#### Layout da Tela

[Aba: "IA"] icon Sparkles
  [Secao: "Resumo Gerado pela IA"] icon Sparkles [ref: Passo 2, 3]
    [Texto: "Resumo"] — markdown renderizado (h2, h3, bold, listas)
    [Botao: "Gerar Resumo"] icon Sparkles — visivel se nao ha resumo [ref: Passo 2]
    [Botao: "Regerar Resumo"] icon Sparkles — visivel se ja ha resumo [ref: Passo 2]
  [Secao: "Pergunte a IA sobre este Edital"] icon MessageSquare [ref: Passo 4]
    [Campo: TextInput "Pergunta"] — placeholder "Ex: Qual o prazo de entrega?" [ref: Passo 4]
    [Botao: "Perguntar"] icon MessageSquare [ref: Passo 4]
    [Secao: "Resposta"] — visivel apos resposta [ref: Passo 5, 8]
      [Texto: "Resposta da IA"] — markdown renderizado
  [Secao: "Acoes Rapidas via IA"] icon Sparkles [ref: Passo 6, 7]
    [Botao: "Requisitos Tecnicos"] icon Target [ref: Passo 6]
    [Botao: "Classificar Edital"] icon ClipboardCheck [ref: Passo 7]

[Modal: "Perguntar ao Edital {Numero}"] — alternativa modal (disparado em outro contexto)
  [Campo: TextArea "Sua pergunta"] — rows=3
  [Botao: "Enviar Pergunta"] icon MessageSquare
  [Secao: "Resposta"] — markdown renderizado

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "IA"] | 1 |
| [Botao: "Gerar Resumo"] / [Botao: "Regerar Resumo"] | 2 |
| [Texto: "Resumo"] renderizado | 3 |
| [Campo: TextInput "Pergunta"] + [Botao: "Perguntar"] | 4 |
| [Secao: "Resposta"] | 5, 8 |
| [Botao: "Requisitos Tecnicos"] | 6 |
| [Botao: "Classificar Edital"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---

## Veredicto Tecnico desta rodada sobre Sprint 2

`CaptacaoPage` e `ValidacaoPage` estao substancialmente implementadas e possuem mais funcionalidade real do que uma leitura superficial dos requisitos sugere.

Pontos fortes:
- a trilha de busca, exploracao, salvamento, exportacao e monitoramento de editais e real.
- a validacao tem abas funcionais bem definidas para aderencia, lotes, documentos, riscos, mercado e IA.
- existem integracoes concretas com PNCP, extracao de requisitos, analise de riscos, mercado e chat contextual.

Pontos criticos:
- a persistencia da decisao em `ValidacaoPage` esta inconsistente com o schema observado, porque `validacao_decisoes` nao existe no banco `editais` consultado em 30/03/2026.
- o fluxo `Verificar Certidões` na aba `Documentos` aparenta enviar um `empresa_id` incorreto.

Conclusao objetiva:
- `Captacao`: **IMPLEMENTADA**
- `Validacao`: **IMPLEMENTADA COM DIVERGENCIAS PONTUAIS DE PERSISTENCIA E ACOPLAMENTO**
