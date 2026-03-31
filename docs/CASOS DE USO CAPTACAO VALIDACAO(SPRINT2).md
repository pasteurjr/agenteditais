# CASOS DE USO — CAPTACAO E VALIDACAO (SPRINT 2)

**Data:** 30/03/2026
**Versao:** 1.1
**Base:** `requisitos_completosv6.md` (RF-019 a RF-037) + implementacao real de `CaptacaoPage.tsx`, `ValidacaoPage.tsx`, `backend/app.py`, `backend/crud_routes.py` e schema MySQL `editais`
**Objetivo:** documentar os casos de uso da Sprint 2 com base na implementacao real das telas, seus botoes, integracoes, persistencia e divergencias observadas no codigo e banco.

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
1. Usuario preenche termo ou navega por Area -> Classe -> Subclasse.
2. Usuario ajusta filtros de UF, fonte, modalidade, origem, NCM e periodo.
3. Usuario define o modo de score: `Sem Score`, `Score Rapido`, `Score Hibrido` ou `Score Profundo`.
4. Usuario clica em `Buscar Editais`.
5. Sistema chama a busca principal, normaliza o retorno para `EditalBusca` e recalcula dias restantes, score, potencial e gaps.
6. A tabela e os cards superiores sao atualizados.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV02] Explorar resultados e painel lateral do edital

**RF relacionados:** RF-019, RF-020, RF-024, RF-026
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
1. Usuario clica numa linha da tabela ou em `Ver detalhes`.
2. Sistema abre painel lateral com dados do edital, score, itens, produto correspondente, potencial e recomendacao.
3. Se ja houver score profundo, o painel mostra 6 dimensoes, decisao e justificativas.
4. Se nao houver score profundo mas o modo de score estiver ativo, a tela pode buscar `scores-validacao` ao abrir o painel.
5. Usuario decide se salva, exporta, envia para validacao ou usa acoes de IA.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV03] Salvar edital, itens e scores da captacao

**RF relacionados:** RF-019, RF-020, RF-023
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
1. Usuario escolhe salvar um edital individualmente ou em lote.
2. Sistema cria ou atualiza o registro em `editais`.
3. Se houver itens na busca, sistema grava em `editais-itens`; se nao houver, tenta `POST /api/editais/{id}/buscar-itens-pncp`.
4. Se o edital tiver score rapido ou profundo, a tela tenta `POST /api/editais/salvar-scores-captacao`.
5. A UI marca o edital como salvo e pode oferecer download do PDF.

### Persistencia observada
Tabela `editais` com campos relevantes: `numero`, `orgao`, `uf`, `objeto`, `modalidade`, `valor_referencia`, `status`, `fonte`, `url`, `pdf_url`, `pdf_path`, `cnpj_orgao`, `ano_compra`, `seq_compra`, `classe_produto_id`, `subclasse_produto_id`.
Tabela `editais_itens`: `edital_id`, `numero_item`, `descricao`, `quantidade`, `unidade_medida`, `valor_unitario_estimado`, `valor_total_estimado`, `tipo_beneficio`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV04] Definir estrategia, intencao e margem do edital

**RF relacionados:** RF-023, RF-027, RF-037
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
1. Usuario abre o painel lateral do edital.
2. Usuario escolhe a intencao estrategica.
3. Usuario ajusta a margem desejada.
4. Usuario pode sinalizar variacao por produto ou regiao.
5. Usuario clica em `Salvar Estrategia`.
6. Sistema garante que o edital esteja salvo.
7. Sistema cria ou atualiza o registro em `estrategias-editais`.

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
1. Usuario executa uma busca.
2. Usuario clica em `Exportar CSV` para baixar a lista corrente.
3. Usuario clica em `Relatório Completo` para consolidar a busca atual em relatorio textual estruturado.
4. Sistema usa o mesmo dataset normalizado da grade para gerar a saida consolidada.

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
1. Usuario abre `Novo Monitoramento`.
2. Usuario informa termo, NCM, UFs, fonte, frequencia, score minimo e incluir encerrados.
3. Usuario clica em `Criar`.
4. Sistema persiste em `monitoramentos`.
5. Na lista, usuario pode pausar, retomar, atualizar ou excluir monitoramentos existentes.

### Persistencia observada
Tabela `monitoramentos`: `termo`, `ncm`, `fontes`, `ufs`, `incluir_encerrados`, `valor_minimo`, `valor_maximo`, `frequencia_horas`, `score_minimo_alerta`, `ativo`, `ultimo_check`, `editais_encontrados`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV07] Listar editais salvos e selecionar edital para analise

**RF relacionados:** RF-027, RF-029
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
1. Usuario acessa `ValidacaoPage`.
2. Sistema carrega editais via `GET /api/editais/salvos?com_score=true&com_estrategia=true`.
3. Usuario filtra por status ou pesquisa por texto.
4. Usuario clica numa linha da tabela.
5. Sistema limpa estados auxiliares e monta o painel de analise do edital selecionado.
6. A partir da selecao, a tela tambem tenta carregar itens, lotes, historico e documentacao necessaria.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV08] Calcular scores multidimensionais e decidir GO/NO-GO

**RF relacionados:** RF-027, RF-028, RF-037
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
1. Usuario abre a aba `Aderencia`.
2. Usuario clica em `Calcular Scores IA`.
3. Sistema chama `POST /api/editais/{id}/scores-validacao`.
4. Sistema atualiza score geral, 6 barras de score, potencial, justificativa, pontos positivos e pontos de atencao.
5. Usuario escolhe `Participar`, `Acompanhar` ou `Rejeitar`.
6. Sistema abre o bloco de justificativa com motivo e detalhes.
7. Usuario clica em `Salvar Justificativa`.
8. A tela tenta criar ou atualizar `validacao_decisoes`.

### Observacao critica
O frontend tenta persistir a decisao em `validacao_decisoes`, mas essa tabela nao existe no schema `editais` consultado em 30/03/2026. Portanto, a experiencia visual esta implementada, mas a trilha de persistencia da decisao deve ser tratada como **parcial/inconsistente**.

### Implementacao atual
**PARCIAL / COM DIVERGENCIA DE PERSISTENCIA**

---

## [UC-CV09] Importar itens e extrair lotes por IA

**RF relacionados:** RF-031, RF-036
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
1. Usuario abre a aba `Lotes`.
2. Se nao houver itens, usuario clica em `Buscar Itens no PNCP`.
3. Sistema chama `POST /api/editais/{id}/buscar-itens-pncp`.
4. Com itens carregados, usuario clica em `Extrair Lotes via IA`.
5. Sistema chama `POST /api/editais/{id}/lotes/extrair`.
6. A interface passa a exibir lotes, itens por lote, valor estimado e status.
7. Usuario pode reprocessar, excluir lotes ou mover itens entre lotes via `lote-itens`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV10] Confrontar documentacao necessaria com a empresa

**RF relacionados:** RF-029, RF-035, RF-036
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
1. Usuario abre a aba `Documentos`.
2. Sistema tenta carregar `/api/editais/{id}/documentacao-necessaria`.
3. Interface agrupa os documentos por categoria e mostra status de disponibilidade.
4. Usuario pode acionar `Identificar Documentos Exigidos pelo Edital` para chamar `POST /api/editais/{id}/extrair-requisitos`.
5. Ao concluir, a tela recarrega `documentacao-necessaria`.
6. Usuario pode acionar `Buscar Documentos Exigidos` via chat.
7. Usuario pode acionar `Verificar Certidões`, que reexecuta a busca de certidoes e tenta recarregar a completude documental.

### Observacao critica
O botao `Verificar Certidões` envia `empresa_id: edital.id` para `/api/empresa-certidoes/buscar-stream`. Isso aparenta ser um acoplamento incorreto entre edital e empresa, então esse trecho deve ser tratado como **parcial/com divergencia funcional** ate confirmacao de backend.

### Implementacao atual
**PARCIAL / COM DIVERGENCIA FUNCIONAL**

---

## [UC-CV11] Analisar riscos, recorrencia, atas e concorrentes

**RF relacionados:** RF-030, RF-032, RF-033, RF-034
**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. PDF e dados do edital disponiveis para processamento.

### Pos-condicoes
1. Usuario obtém pipeline de riscos e trechos relevantes.
2. Sistema pode buscar atas, vencedores e concorrentes conhecidos.
3. Usuario passa a enxergar sinais de recorrencia e historico competitivo.

### Botoes e acoes observadas
Na aba `Riscos`:
- `Analisar Riscos do Edital` / `Reanalisar Riscos do Edital`
- `Rebuscar Atas`
- `Buscar Vencedores e Preços`
- `Atualizar` concorrentes

### Sequencia de eventos
1. Usuario abre a aba `Riscos`.
2. Usuario clica em `Analisar Riscos do Edital`.
3. Sistema chama `POST /api/editais/{id}/analisar-riscos`.
4. A interface exibe riscos por categoria, fatal flaws, flags juridicos e trechos relevantes.
5. Usuario pode acionar `Rebuscar Atas` para chamar `POST /api/editais/{id}/historico-vencedores`.
6. Usuario pode acionar `Buscar Vencedores e Preços` para chamar `POST /api/editais/{id}/vencedores-atas`.
7. Usuario pode atualizar a lista de concorrentes conhecidos via `/api/concorrentes/listar`.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV12] Analisar mercado do orgao contratante

**RF relacionados:** RF-033
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
1. Usuario abre a aba `Mercado`.
2. Usuario clica em `Analisar Mercado do Órgão`.
3. Sistema chama `POST /api/editais/{id}/analisar-mercado`.
4. Interface mostra dados do orgao, reputacao, volume de compras, compras similares e historico interno.
5. Sistema exibe a analise textual de mercado produzida pela IA.

### Implementacao atual
**IMPLEMENTADO**

---

## [UC-CV13] Usar IA na validacao: resumo, perguntas e acoes rapidas

**RF relacionados:** RF-026, RF-029, RF-030
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
1. Usuario abre a aba `IA`.
2. Usuario gera ou regera um resumo do edital via `/api/chat`.
3. Usuario digita uma pergunta e clica em `Perguntar`.
4. Usuario tambem pode usar as acoes rapidas `Requisitos Técnicos` e `Classificar Edital`.
5. Sistema usa `/api/chat` e a sessao de pagina para devolver respostas contextualizadas.

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
