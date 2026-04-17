# CASOS DE USO — SPRINT 8: DISPENSAS DE LICITACAO + CLASSIFICACAO INTELIGENTE DO PORTFOLIO + MASCARAS DE DESCRICAO

**Data:** 16/04/2026
**Versao:** 1.0
**Base:** requisitos_completosv8.md (RF-057, RF-013, RF-015, RF-017, RF-045-02) + SPRINT8-VI.md (descritivo funcional) + planejamento_editaisv4.md (secao 5) + Lei 14.133/2021 (Art. 75 — Dispensas)
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Dispensas de Licitacao (busca, dashboard, cotacao), Classificacao Inteligente do Portfolio (geracao de classes via IA, gestao visual, aplicacao ao portfolio) e Mascaras de Descricao (normalizacao de nomenclatura de produtos).
**Nota sobre funcionalidades existentes:** Varias paginas ja implementadas nas Sprints 1-2 sao EXPANDIDAS (nao recriadas) nesta sprint:
- `CaptacaoPage.tsx` (2641L) — ja possui filtro de modalidade (incluindo "dispensa"), cascata Area→Classe→Subclasse, busca PNCP, painel lateral, score. UC-DI01 EXPANDE com aba "Dispensas".
- `ParametrizacoesPage.tsx` (979L, 5 tabs) — ja possui tabs Score/Comercial/Fontes/Notificacoes/Preferencias + carregamento de classes via `loadClasses`. UC-CL02 EXPANDE com tab "Classes".
- `PortfolioPage.tsx` (1478L, 3 tabs) — ja possui tabs produtos/cadastroIA/classificacao, filtros cascata area/classe/subclasse, parse de mascara (`parseMascaraTop`). UC-CL04 EXPANDE com colunas e badges.
- Models `Dispensa` (models.py:2681), `ClasseProdutoV2` (models.py:288), `SubclasseProduto` (models.py:316 com `campos_mascara`) ja existem no backend.
- CRUDs `dispensas`, `classes-produto-v2`, `subclasses-produto` ja registrados em `crud_routes.py`.
- Tools `_build_prompt_mascara` e `_extrair_specs_em_chunks` ja existem em `tools.py` e consomem `campos_mascara`.

---

## Regras de Negocio Aplicadas

Esta sprint implementa enforcement de RNs relacionadas a dispensas, classificacao de portfolio e mascaras. As seguintes RNs sao relevantes:

| RN | Descricao | UC afetado | Origem |
|---|---|---|---|
| RN-067 | Matching produto x edital segue hierarquia: produto exato → subclasse → classe → generico | UC-CL01, UC-CL04, UC-MA01 | RF-015 + tools.py:8059 |
| RN-189 | Parametrizacoes CRM aceitam 3 tipos fixos: {tipo_edital, agrupamento_portfolio, motivo_derrota}. Escopadas por empresa | UC-CL02 | RF-045-02 |
| RN-191 | Agrupamento Portfolio padrao: 13 valores (Point Of Care, Gasometria, etc.). Empresa edita/cria livremente | UC-CL01, UC-CL02 | RF-045-02 |
| RN-037 | Audit log universal em todas as operacoes CRUD e transicoes de estado | Todos os UCs | RF-056 |
| RN-084 | Cooldown de 60s entre invocacoes DeepSeek pesadas | UC-CL01, UC-MA01 | RF-041-02 |
| RN-132 | Audit de invocacoes DeepSeek (tool_name, input_hash, user, timestamp) | UC-CL01, UC-MA01 | RF-041-02 |
| RN-NEW-07 | Dispensa com valor > limite do artigo e bloqueada com alerta visual | UC-DI01 | RF-057 (nova) |
| RN-NEW-08 | Transicao de status de dispensa: aberta → cotacao_enviada → adjudicada/encerrada (sem pular etapa) | UC-DI01 | RF-057 (nova) |
| RN-NEW-09 | Geracao de classes via IA exige minimo de 20 produtos no portfolio | UC-CL01 | RF-013 (nova) |
| RN-NEW-10 | Mascara de descricao e feature flag por produto — usuario pode desativar individualmente | UC-MA01 | RF-015 (nova) |
| RN-NEW-11 | Dispensa adjudicada cria lead automatico no pipeline CRM com stage "ganho_provisorio" | UC-DI01 | RF-057 + RF-045-01 (nova) |

**Total de RNs nesta sprint:** 11 (6 existentes + 5 novas).

---

## INDICE

### FASE 1 — DISPENSAS DE LICITACAO
- [UC-DI01] Dashboard e Workflow de Dispensas (EXPANSAO — CaptacaoPage)

### FASE 2 — CLASSIFICACAO INTELIGENTE DO PORTFOLIO
- [UC-CL01] Gerar Classes do Portfolio via IA
- [UC-CL02] Gerenciar Classes e Mascaras (EXPANSAO — ParametrizacoesPage)
- [UC-CL03] Visualizar Classes no Portfolio (EXPANSAO — PortfolioPage)

### FASE 3 — MASCARAS DE DESCRICAO
- [UC-MA01] Aplicar Mascara de Descricao a Produtos

---

## RESUMO DE IMPLEMENTACAO

| UC | Nome | Fase | Tipo | Pagina Alvo | Aba / Posicao | Status |
|----|------|------|------|-------------|---------------|--------|
| UC-DI01 | Dashboard e Workflow de Dispensas | Dispensas | **EXPANSAO** CaptacaoPage | `CaptacaoPage.tsx` | Aba "Dispensas" (nova) | ⬜ NAO IMPLEMENTADO |
| UC-CL01 | Gerar Classes via IA | Classificacao | **NOVO** | `ParametrizacoesPage.tsx` | Aba "Classes" (nova) — botao "Gerar via IA" | ⬜ NAO IMPLEMENTADO |
| UC-CL02 | Gerenciar Classes e Mascaras | Classificacao | **EXPANSAO** ParametrizacoesPage | `ParametrizacoesPage.tsx` | Aba "Classes" (nova) | ⬜ NAO IMPLEMENTADO |
| UC-CL03 | Visualizar Classes no Portfolio | Classificacao | **EXPANSAO** PortfolioPage | `PortfolioPage.tsx` | Tab "produtos" (existente) | ⬜ NAO IMPLEMENTADO |
| UC-MA01 | Aplicar Mascara de Descricao | Mascaras | **NOVO** | `PortfolioPage.tsx` | Tab "produtos" + modal | ⬜ NAO IMPLEMENTADO |

**Totais:** 0 implementados + 0 parciais + 5 nao implementados = **5 casos de uso**
**Tipos:** 3 EXPANSOES (DI01→CaptacaoPage, CL02→ParametrizacoesPage, CL03→PortfolioPage) + 2 NOVOS (CL01, MA01)

---

# FASE 1 — DISPENSAS DE LICITACAO

---

## [UC-DI01] Dashboard e Workflow de Dispensas (EXPANSAO — CaptacaoPage)

**Tipo:** EXPANSAO da pagina existente `CaptacaoPage.tsx`
**UCs estendidos:** UC-CV01 (Sprint 2 — Buscar editais por termo, classificacao e score), UC-CV07 (Sprint 2 — Listar editais salvos e selecionar edital para analise). A busca de dispensas reutiliza o motor de busca PNCP de UC-CV01 com filtro `modalidade=dispensa`. A listagem de dispensas salvas reutiliza a infraestrutura de UC-CV07 com filtros adicionais de artigo e status.
**O que JA EXISTE:** CaptacaoPage com 2641 linhas — busca PNCP/Brave, filtro de modalidade (incluindo "dispensa"), listagem de editais com score de aderencia, painel lateral de analise com tabs (Aderencia, Lotes, Documentos, Riscos, Mercado, IA), cascata Area→Classe→Subclasse, salvar edital, exportar resultados. Endpoint: `GET /api/editais/buscar`, `POST /api/editais/salvar`. Arquivo: `frontend/src/pages/CaptacaoPage.tsx`.

**RNs aplicadas:** RN-037 (audit log), RN-NEW-07 (valor > limite bloqueado), RN-NEW-08 (transicao status), RN-NEW-11 (adjudicada → lead CRM)

**RF relacionado:** RF-057 (Dispensas), RF-017 (Tipos de Edital)
**Ator:** Usuario (Analista Comercial, Gestor de Licitacoes)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Portfolio da empresa possui pelo menos 1 produto cadastrado
3. Modelo `Dispensa` existe no banco (ja criado na Sprint 1)
4. Busca PNCP funcional (Sprint 2)

### Pos-condicoes
1. Aba "Dispensas" visivel na CaptacaoPage com dashboard de status
2. Dispensas salvas vinculadas a editais com status rastreado
3. Cotacao gerada e armazenada no campo `cotacao_texto`
4. Dispensa adjudicada cria lead no pipeline CRM (RN-NEW-11)
5. Audit log registrado para cada transicao de status (RN-037)

### Sequencia de Eventos

1. Usuario acessa CaptacaoPage (`/app/captacao`) via menu lateral "Fluxo Comercial > Captacao"
2. **NOVO:** [Secao: Abas superiores] mostra 2 tabs: "Editais" (default, conteudo existente), "Dispensas" (novo)
3. Usuario clica na [Aba: "Dispensas"]
4. [Card: "Stat Cards — grid 4"] exibe: Dispensas Abertas (status=aberta), Em Cotacao (status=cotacao_enviada), Adjudicadas (status=adjudicada), Encerradas (status=encerrada)
5. [Card: "Filtros"] exibe: [Select: "Artigo"] (Todos / Art.75-I / Art.75-II / Art.75-III / Art.75-IV / Art.75-V / Art.75-VIII), [Select: "Faixa Valor"] (Todos / Ate R$50K / R$50K-100K / Acima R$100K), [Select: "UF"], [TextInput: "Buscar orgao"]
6. [Botao: "Buscar Dispensas no PNCP"] invoca busca com `modalidade=dispensa` + filtros selecionados + UFs da empresa + NCMs do portfolio
7. Sistema executa busca via `tool_buscar_editais` com parametro `modalidade=dispensa` (reusa motor Sprint 2)
8. Resultado exibido em [Card: "Dispensas Encontradas"] — DataTable: Numero, Orgao, UF, Artigo, Objeto (resumido), Valor Estimado, Prazo Resposta, Score Aderencia, Status, Acoes
9. [Badge: "Urgencia"] por prazo na coluna Prazo Resposta: vermelho (<3 dias uteis), amarelo (3-7 dias uteis), verde (>7 dias uteis)
10. Se valor > limite do artigo, [Badge: "Valor Excedido"] vermelho na linha (RN-NEW-07)
11. Coluna "Acoes" exibe: [Botao: "Salvar"] (se nao salva), [Botao: "Ver Detalhe"] (se salva), [Botao: "Gerar Cotacao"] (se status=aberta)
12. Ao clicar [Botao: "Salvar"]: sistema cria registro em `editais` (se nao existe) + registro em `dispensas` com status `aberta`, vinculando via `edital_id`
13. Ao clicar [Botao: "Gerar Cotacao"]:
    a. Sistema abre [Modal: "Gerar Cotacao para Dispensa"]
    b. Modal exibe: resumo do edital (orgao, objeto, valor, artigo), lista de produtos do portfolio com match, [TextArea: "Cotacao"] pre-preenchida pela IA com formatacao padrao
    c. IA usa precos do portfolio (Camadas A-E Sprint 3) para calcular valores
    d. Campo `fornecedores_cotados` (JSON) preenchido com fornecedores sugeridos para pesquisa de mercado
    e. [Botao: "Enviar Cotacao"] atualiza status para `cotacao_enviada` (RN-NEW-08)
    f. Toast: "Cotacao gerada e status atualizado para 'Em Cotacao'"
14. Na tabela, dispensas salvas mostram [Botao: "Atualizar Status"] com opcoes:
    a. cotacao_enviada → adjudicada (exige valor final)
    b. cotacao_enviada → encerrada (exige motivo)
    c. adjudicada → encerrada
15. Ao marcar como "adjudicada": sistema cria lead automatico no pipeline CRM com stage `ganho_provisorio` (RN-NEW-11), grava audit log
16. [Botao: "Ver Detalhe"] abre painel lateral EXISTENTE da CaptacaoPage com dados do edital vinculado

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Aba "Dispensas" (nova)

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Captacao                                                     |
|                                                               |
|  +---------+  +-----------+                                   |
|  | Editais |  | Dispensas |  (NOVO)                           |
|  +---------+  +-----------+                                   |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Abertas    |  |Em Cotacao |  |Adjudicadas|  |Encerradas |   |
|  |    12     |  |     4     |  |     2     |  |     8     |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  [Filtros]                                                    |
|  Artigo: [Todos v]  Faixa: [Todos v]  UF: [Todos v]         |
|  Buscar orgao: [________________]  [Buscar Dispensas PNCP]   |
|                                                               |
|  +---- Dispensas -----------------------------------------------+
|  |Numero    |Orgao     |UF|Art. |Objeto     |Valor   |Prazo|Sc|St |Acoes     |
|  |DI-001/26 |HC-UNICAMP|SP|75-II|Reag.hemato|R$ 45K  |[!!] |78|Abe|[Cot][De]|
|  |DI-002/26 |HU-USP    |SP|75-I |Equip.coag.|R$ 92K  |[!!!]|65|Abe|[Cot][De]|
|  |DI-003/26 |HCPA      |RS|75-II|Reag.bioq. |R$ 38K  |[ v ]|82|Cot|[At][De] |
|  |DI-004/26 |INTO      |RJ|75-II|Kit imunoH |R$ 120K |[ v ]|71|Adj|[De]     |
|  |          |          |  |     |           |[EXCEDE]|     |  |   |          |
|  +--------------------------------------------------------------+
|  [!!!] = <3 dias  [!!] = 3-7 dias  [v] = >7 dias              |
|  [EXCEDE] = Valor > limite do artigo (RN-NEW-07)               |
|                                                               |
|  +---- Modal: Gerar Cotacao ----+                              |
|  | Dispensa: DI-001/26                                        |
|  | Orgao: HC-UNICAMP  Artigo: 75-II                           |
|  | Objeto: Reagentes de hematologia                           |
|  | Valor Estimado: R$ 45.000,00                               |
|  |                                                             |
|  | Produtos com Match:                                        |
|  | [x] Reagente HbA1c (R$ 12,50/un x 200 = R$ 2.500)        |
|  | [x] Reagente Hemograma (R$ 8,00/un x 500 = R$ 4.000)     |
|  | [ ] Calibrador Hemo (R$ 45,00/un x 10 = R$ 450)           |
|  |                                                             |
|  | Cotacao (gerada pela IA):                                  |
|  | +----------------------------------------------+           |
|  | | PROPOSTA DE COTACAO                          |           |
|  | | Ref: DI-001/2026 — HC-UNICAMP               |           |
|  | | Item 1: Reagente HbA1c ....... R$ 2.500,00   |           |
|  | | Item 2: Reagente Hemograma ... R$ 4.000,00   |           |
|  | | TOTAL: R$ 6.500,00                           |           |
|  | +----------------------------------------------+           |
|  |                                                             |
|  | Fornecedores para Pesquisa de Mercado:                     |
|  | 1. BioRad (historico 3 cotacoes)                           |
|  | 2. Siemens Healthineers (historico 1 cotacao)              |
|  |                                                             |
|  | [Enviar Cotacao]  [Cancelar]                                |
|  +--------------------------------------------+               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (4), Tabela dispensas com badges urgencia/excede, Modal cotacao com produtos e valores
- **Preenchidos (input):** Filtros (Artigo, Faixa Valor, UF, Buscar), Selecao de produtos no modal, TextArea cotacao (editavel), Botao Enviar/Atualizar Status
- **Obtidos (resposta do sistema):** Lista de dispensas do PNCP com score, cotacao gerada pela IA, lead CRM criado automaticamente

### Excecoes
- **E1:** Nenhuma dispensa encontrada no PNCP — tabela vazia com mensagem "Nenhuma dispensa encontrada para os filtros selecionados"
- **E2:** Valor excede limite do artigo (RN-NEW-07) — badge vermelho "Valor Excedido" + tooltip com limite legal
- **E3:** Cotacao sem produtos com match — modal alerta: "Nenhum produto do portfolio corresponde aos itens desta dispensa"
- **E4:** Erro na busca PNCP — toast: "Falha ao buscar dispensas no PNCP. Tente novamente."

---

# FASE 2 — CLASSIFICACAO INTELIGENTE DO PORTFOLIO

---

## [UC-CL01] Gerar Classes do Portfolio via IA

**RNs aplicadas:** RN-084 (cooldown DeepSeek), RN-132 (audit invocacao), RN-037 (audit log), RN-NEW-09 (minimo 20 produtos)

**RF relacionado:** RF-013 (Classes e Subclasses), RF-015 (Fontes), RF-045-02 (Parametrizacoes CRM)
**Ator:** Usuario (Gestor de Portfolio, Diretor)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Portfolio da empresa possui pelo menos 20 produtos cadastrados (RN-NEW-09)
3. Tool `tool_gerar_classes_portfolio` registrada no catalogo DeepSeek
4. Modelos `AreaProduto`, `ClasseProdutoV2`, `SubclasseProduto` existem (Sprint 1)

### Pos-condicoes
1. Sugestao de classificacao hierarquica gerada pela IA e exibida para aprovacao
2. Ao aceitar, registros criados em `areas_produto`, `classes_produto_v2`, `subclasses_produto`
3. Produtos vinculados as classes/subclasses geradas
4. Log de invocacao gravado (RN-132)

### Sequencia de Eventos

1. Usuario acessa ParametrizacoesPage (`/app/parametros`) e clica na [Aba: "Classes"] (nova — UC-CL02)
2. [Card: "Stat Cards — grid 3"] exibe: Areas (qtd), Classes (qtd), Produtos sem Classe (qtd)
3. Se stat card "Produtos sem Classe" > 0, sistema exibe [Banner: "Voce tem {N} produtos sem classificacao. Use a IA para gerar classes automaticamente."]
4. Usuario clica [Botao: "Gerar Classes via IA"]
5. Sistema verifica pre-condicao: portfolio >= 20 produtos (RN-NEW-09)
   - Se < 20: toast de erro "Cadastre pelo menos 20 produtos para gerar classes via IA"
   - Se >= 20: prossegue
6. Sistema verifica cooldown DeepSeek (RN-084)
7. Sistema invoca `tool_gerar_classes_portfolio` passando lista de produtos (nome, NCM, descricao tecnica)
8. Loading spinner: "A IA esta analisando seus {N} produtos..."
9. Tool retorna proposta de classificacao hierarquica:
   - Areas sugeridas (ex.: "Diagnostico In Vitro", "Equipamentos")
   - Classes por area (ex.: "Hematologia", "Bioquimica", "Coagulacao")
   - Subclasses por classe (ex.: "Hemograma", "Hemoglobina Glicada", "Velocidade de Hemossedimentacao")
   - Vinculacao sugerida: quais produtos vao para qual subclasse
10. Resultado exibido em [Modal: "Sugestao de Classificacao da IA"]:
    a. Arvore hierarquica visual (Area → Classe → Subclasse) com contagem de produtos em cada no
    b. Lista de produtos por subclasse sugerida
    c. Indicador de confianca por agrupamento (alta/media/baixa)
11. Usuario pode:
    a. [Botao: "Aceitar Tudo"] — cria todos os registros de uma vez
    b. [Botao: "Editar e Aceitar"] — permite remover/renomear/mover itens antes de confirmar
    c. [Botao: "Cancelar"] — descarta sugestao
12. Ao aceitar: sistema cria registros via CRUDs existentes (`areas-produto`, `classes-produto-v2`, `subclasses-produto`)
13. Sistema vincula produtos as subclasses criadas (atualiza `subclasse_id` em cada produto)
14. Toast: "Classificacao aplicada: {N} areas, {M} classes, {P} subclasses criadas. {Q} produtos vinculados."
15. Arvore na aba "Classes" (UC-CL02) atualizada automaticamente

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Aba "Classes" — Modal de sugestao IA

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Parametrizacoes > Classes                                    |
|                                                               |
|  [Score] [Comercial] [Fontes] [Notificacoes] [Preferencias]  |
|  [Classes] (NOVO)                                             |
|                                                               |
|  ... (arvore existente — ver UC-CL02) ...                     |
|                                                               |
|  +---- Modal: Sugestao de Classificacao da IA ----+            |
|  |                                                 |           |
|  |  A IA analisou 87 produtos e sugere:           |           |
|  |                                                 |           |
|  |  📁 Diagnostico In Vitro (62 produtos)         |           |
|  |    📂 Hematologia (28 produtos)                |           |
|  |      📄 Hemograma (12) — confianca: alta       |           |
|  |      📄 Hemoglobina Glicada (8) — alta         |           |
|  |      📄 Coagulacao (8) — alta                  |           |
|  |    📂 Bioquimica (20 produtos)                 |           |
|  |      📄 Glicose/Lipidios (10) — alta           |           |
|  |      📄 Enzimas (6) — media                    |           |
|  |      📄 Eletrolitos (4) — media                |           |
|  |    📂 Imunologia (14 produtos)                 |           |
|  |      📄 Hormonio (8) — alta                    |           |
|  |      📄 Marcadores Tumorais (6) — media        |           |
|  |  📁 Equipamentos (25 produtos)                 |           |
|  |    📂 Analisadores (15 produtos)               |           |
|  |      📄 Hematologia (8) — alta                 |           |
|  |      📄 Bioquimica (7) — alta                  |           |
|  |    📂 Acessorios (10 produtos)                 |           |
|  |      📄 Cubetas/Consumiveis (6) — alta         |           |
|  |      📄 Calibradores (4) — media               |           |
|  |                                                 |           |
|  |  Produtos sem classificacao sugerida: 0         |           |
|  |                                                 |           |
|  |  [Aceitar Tudo]  [Editar e Aceitar]  [Cancelar]|           |
|  +------------------------------------------------+           |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Arvore hierarquica sugerida com contagem e confianca, lista de produtos por no
- **Preenchidos (input):** Botao "Gerar Classes via IA", Botoes Aceitar/Editar/Cancelar, edicao de nomes/movimentacao de itens (modo editar)
- **Obtidos (resposta do sistema):** Proposta de classificacao hierarquica, registros criados em areas/classes/subclasses, produtos vinculados

### Excecoes
- **E1:** Portfolio com < 20 produtos (RN-NEW-09) — toast: "Cadastre pelo menos 20 produtos para usar esta funcionalidade"
- **E2:** Cooldown ativo (RN-NEW-084) — toast: "Aguarde {N}s antes de nova invocacao"
- **E3:** Todos os produtos ja classificados — toast: "Todos os produtos ja possuem classe. Use 'Editar' para reclassificar."
- **E4:** Falha na IA — toast: "Erro ao gerar classificacao. Tente novamente."

---

## [UC-CL02] Gerenciar Classes e Mascaras (EXPANSAO — ParametrizacoesPage)

**Tipo:** EXPANSAO da pagina existente `ParametrizacoesPage.tsx`
**UCs estendidos:** UC-F13 (Sprint 1 — Consultar classificacao e funil de monitoramento), UC-F14 (Sprint 1 — Configurar pesos e limiares de score), UC-F15 (Sprint 1 — Configurar parametros comerciais, regioes e modalidades). A aba "Classes" estende UC-F13 fornecendo gestao visual da arvore hierarquica com edicao de `campos_mascara` — UC-F13 permitia apenas consulta da classificacao; este UC adiciona CRUD visual completo com tree view e edicao de mascaras. A aba se integra as demais tabs de parametrizacao (UC-F14/F15) na mesma pagina.
**O que JA EXISTE:** ParametrizacoesPage com 979 linhas, 5 tabs (Score, Comercial, Fontes de Busca, Notificacoes, Preferencias). Carrega classes via `loadClasses` (linha 210) usando CRUD `classes-produtos`. Modelos `ClasseProdutoV2` e `SubclasseProduto` (com `campos_mascara`) existem. CRUDs `classes-produto-v2` e `subclasses-produto` registrados.

**RNs aplicadas:** RN-189 (parametrizacoes CRM por empresa), RN-191 (agrupamento portfolio), RN-037 (audit log)

**RF relacionado:** RF-013 (Classes e Subclasses), RF-015 (Fontes), RF-045-02 (Parametrizacoes CRM)
**Ator:** Usuario (Gestor de Portfolio, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Modelos `AreaProduto`, `ClasseProdutoV2`, `SubclasseProduto` existem
3. CRUDs `areas-produto`, `classes-produto-v2`, `subclasses-produto` funcionais

### Pos-condicoes
1. Nova aba "Classes" visivel na ParametrizacoesPage
2. Arvore hierarquica gerenciavel com CRUD visual
3. Campos de mascara editaveis por subclasse

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA a ParametrizacoesPage)

1. Usuario acessa ParametrizacoesPage (`/app/parametros`) — JA EXISTE
2. **NOVO:** [Aba: "Classes"] adicionada apos as 5 tabs existentes
3. Na [Aba: "Classes"], [Card: "Stat Cards — grid 3"] exibe: Areas (qtd total), Classes (qtd total), Produtos sem Classe (qtd de produtos com `subclasse_id=null`)
4. **NOVO:** [Card: "Arvore de Classificacao"] exibe tree view hierarquica:
   - Nivel 1: Areas (ex.: "Diagnostico In Vitro") — icone pasta
   - Nivel 2: Classes (ex.: "Hematologia") — icone tag
   - Nivel 3: Subclasses (ex.: "Hemograma") — icone documento
   - Cada no mostra: nome, qtd de produtos vinculados, [Botao: "Editar"], [Botao: "Excluir"]
5. **NOVO:** [Botao: "Nova Area"] / [Botao: "Nova Classe"] / [Botao: "Nova Subclasse"] para criacao manual
6. Ao clicar em uma Subclasse, [Panel: "Detalhe da Subclasse"] exibe:
   a. Nome (editavel)
   b. NCMs vinculados (JSON editavel — lista de codigos NCM)
   c. Classe pai (select)
   d. **NOVO:** [Card: "Campos de Mascara"] — lista editavel dos campos tecnicos que a IA extrai de documentos:
      - Cada campo: Nome (ex.: "Potencia"), Tipo (texto/numero/boolean), Obrigatorio (toggle)
      - [Botao: "+"] para adicionar campo
      - [Botao: "x"] para remover campo
      - Alteracoes salvas via CRUD `subclasses-produto` (campo `campos_mascara` JSON)
7. **NOVO:** [Botao: "Gerar Classes via IA"] (invoca UC-CL01)
8. **NOVO:** [Botao: "Aplicar ao Portfolio"] abre [Modal: "Vincular Produtos"]:
   - Lista de produtos sem classe com sugestao automatica de vinculacao
   - Checkbox por produto para aceitar/rejeitar vinculacao
   - [Botao: "Vincular Selecionados"]

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Aba "Classes" (NOVA)

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Parametrizacoes                                               |
|                                                               |
|  [Score] [Comercial] [Fontes] [Notif.] [Pref.] [Classes]     |
|                                               (NOVO) ^        |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Areas      |  |Classes    |  |Prod. sem  |                  |
|  |           |  |           |  |Classe     |                  |
|  |     3     |  |    12     |  |    23     |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  [Gerar Classes via IA]  [Aplicar ao Portfolio]               |
|                                                               |
|  +---- Arvore de Classificacao ----+  +-- Detalhe Subclasse -+|
|  |                                 |  |                       ||
|  |  v 📁 Diagnostico In Vitro     |  | Nome: [Hemograma    ] ||
|  |    v 📂 Hematologia (28 prod)  |  | NCMs: [9018.19.80]   ||
|  |      > 📄 Hemograma (12)  [Ed] |  |       [+Adicionar]   ||
|  |      > 📄 HbA1c (8)      [Ed] |  | Classe: [Hematologia]||
|  |      > 📄 Coagulacao (8)  [Ed] |  |                       ||
|  |    > 📂 Bioquimica (20 prod)   |  | Campos de Mascara:    ||
|  |    > 📂 Imunologia (14 prod)   |  | +---------+---------+ ||
|  |  v 📁 Equipamentos             |  | |Nome     |Tipo     | ||
|  |    > 📂 Analisadores (15 prod) |  | |Potencia |texto    | ||
|  |    > 📂 Acessorios (10 prod)   |  | |Volume   |numero   | ||
|  |  [+Nova Area]                   |  | |Autom.   |boolean  | ||
|  |                                 |  | |[+Novo campo]       | ||
|  +---------------------------------+  | |                     | ||
|                                       | [Salvar]  [Cancelar] ||
|                                       +-----------------------+|
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Arvore hierarquica com contagem, Detalhe da subclasse com NCMs e mascara
- **Preenchidos (input):** Nome de area/classe/subclasse, NCMs, campos de mascara (nome, tipo, obrigatorio), botoes CRUD
- **Obtidos (resposta do sistema):** Arvore atualizada, campos de mascara salvos, produtos vinculados

### Excecoes
- **E1:** Tentativa de excluir classe com produtos vinculados — confirmacao: "Esta classe tem {N} produtos. Deseja mover para 'Sem Classe' e excluir?"
- **E2:** NCM invalido (formato) — campo destacado em vermelho com tooltip

---

## [UC-CL03] Visualizar Classes no Portfolio (EXPANSAO — PortfolioPage)

**Tipo:** EXPANSAO da pagina existente `PortfolioPage.tsx`
**UCs estendidos:** UC-F06 (Sprint 1 — Listar, filtrar e inspecionar produtos), UC-F13 (Sprint 1 — Consultar classificacao e funil de monitoramento). A tab "produtos" de UC-F06 e expandida com coluna "Classe", badge "Sem Classe", badge "Mascara Ativa", selecao multipla e botao "Classificar Selecionados". A tab "classificacao" de UC-F13 ja exibe a hierarquia — este UC adiciona a visao de classes DENTRO da tabela de produtos e acoes em lote.
**O que JA EXISTE:** PortfolioPage com 1478 linhas, 3 tabs (produtos, cadastroIA, classificacao). Tab "produtos" com DataTable: Nome, Fabricante, Codigo Interno, Categoria/Subclasse, Status Pipeline, Acoes. Filtros cascata: area, classe, subclasse, searchTerm. Tab "classificacao" com visualizacao de hierarquia. `parseMascaraTop` (linha 40) ja faz parse de campos_mascara. Endpoint: `GET /api/crud/produtos`.

**RNs aplicadas:** RN-067 (matching hierarquico), RN-037 (audit log)

**RF relacionado:** RF-013 (Classes), RF-015 (Fontes)
**Ator:** Usuario (Gestor de Portfolio, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Portfolio com produtos cadastrados
3. Hierarquia de classes criada (manual ou via UC-CL01)

### Pos-condicoes
1. Tab "produtos" expandida com colunas Classe e Descricao Normalizada
2. Badges visuais para produtos sem classe
3. Acao em lote para classificar produtos selecionados

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA ao PortfolioPage)

1. Usuario acessa PortfolioPage (`/app/portfolio`) — JA EXISTE
2. Na [Tab: "produtos"] (JA EXISTE), tabela EXPANDIDA com colunas adicionais:
3. **NOVO:** Coluna "Classe" — exibe nome da classe pai da subclasse do produto (resolve via `subclasseToClasseMap` existente)
4. **NOVO:** Coluna "Desc. Normalizada" — exibe `descricao_normalizada` do produto (quando mascara aplicada via UC-MA01)
5. **NOVO:** [Badge: "Sem Classe"] vermelho/cinza para produtos com `subclasse_id = null`
6. **NOVO:** [Badge: "Mascara Ativa"] verde para produtos com `descricao_normalizada` preenchida e feature flag ativo
7. **NOVO:** [Checkbox] por linha para selecao multipla
8. **NOVO:** [Botao: "Classificar Selecionados"] (visivel quando >= 1 produto selecionado) abre [Modal: "Classificar Produtos"]:
   a. Lista dos produtos selecionados
   b. [Select: "Area"] → [Select: "Classe"] → [Select: "Subclasse"] (cascata existente)
   c. [Botao: "Vincular"] — atualiza `subclasse_id` dos produtos selecionados
   d. OU [Botao: "Sugerir via IA"] — invoca `tool_gerar_classes_portfolio` apenas para os selecionados
9. **NOVO:** [Botao: "Aplicar Mascara"] por produto (coluna Acoes) — invoca UC-MA01
10. **EXPANDIDO:** Filtro existente de subclasse — adicionar opcao "Sem Classe" para filtrar produtos nao classificados

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab "produtos" (EXISTENTE, expandida)

#### Layout da Tela (mostra APENAS os elementos NOVOS)

```
+---------------------------------------------------------------+
|  Portfolio > Produtos                                         |
|                                                               |
|  [produtos] [cadastroIA] [classificacao]                      |
|                                                               |
|  [Filtros existentes] Area: [v] Classe: [v] Subclasse: [v]   |
|  Buscar: [________]  Subclasse: [Sem Classe] (NOVO opcao)    |
|                                                               |
|  [Classificar Selecionados] (NOVO, visivel com selecao)       |
|                                                               |
|  === TABELA EXPANDIDA ===                                     |
|  +--------------------------------------------------------------+
|  |[x]|Nome          |Fab.  |Cod.|Classe   |Subclass|Desc.Norm|St|Ac|
|  |   |              |      |    |(NOVO)   |(existe)|(NOVO)   |  |  |
|  |[x]|Reag. HbA1c   |BioRad|H01 |Hemato   |HbA1c   |reagente |OK|[M]|
|  |   |              |      |    |         |        |hemoglob.|  |  |
|  |[x]|Reag. Glicose |Roche |B01 |Bioq.    |Glicose |reagente |OK|[M]|
|  |   |              |      |    |         |        |glicemia |  |  |
|  |[ ]|Calibrador X  |Siem. |C01 |[S/CLS]  |  —     |   —     |OK|[M]|
|  |   |              |      |    |(badge)  |        |         |  |  |
|  |[ ]|Kit Coag.     |Stago |K01 |Hemato   |Coag.   |[MascON] |OK|[M]|
|  +--------------------------------------------------------------+
|  [S/CLS] = Badge "Sem Classe" (NOVO)                          |
|  [MascON] = Badge "Mascara Ativa" verde (NOVO)                |
|  [M] = Botao "Aplicar Mascara" (NOVO — invoca UC-MA01)        |
|                                                               |
|  +---- Modal: Classificar Produtos ----+                       |
|  | Produtos selecionados: 2            |                       |
|  | - Reag. HbA1c                       |                       |
|  | - Reag. Glicose                     |                       |
|  |                                      |                       |
|  | Area: [Diag. In Vitro v]            |                       |
|  | Classe: [Hematologia v]             |                       |
|  | Subclasse: [HbA1c v]               |                       |
|  |                                      |                       |
|  | [Vincular]  [Sugerir via IA]  [Canc.]|                       |
|  +--------------------------------------+                      |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Coluna "Classe", Coluna "Desc. Normalizada", Badge "Sem Classe", Badge "Mascara Ativa"
- **NOVOS (input):** Checkbox selecao multipla, Botao "Classificar Selecionados", Botao "Aplicar Mascara", Filtro "Sem Classe"
- **JA EXISTENTES (nao alterar):** Colunas Nome/Fabricante/Codigo/Subclasse/Status/Acoes, filtros cascata, tabs, parse de mascara

### Excecoes
- **E1:** Nenhum produto selecionado — botao "Classificar Selecionados" desabilitado
- **E2:** Nenhuma classe criada — select cascata vazio com CTA: "Crie classes em Parametrizacoes > Classes"

---

# FASE 3 — MASCARAS DE DESCRICAO

---

## [UC-MA01] Aplicar Mascara de Descricao a Produtos

**RNs aplicadas:** RN-084 (cooldown DeepSeek), RN-132 (audit invocacao), RN-037 (audit log), RN-NEW-10 (feature flag por produto), RN-067 (matching hierarquico)

**RF relacionado:** RF-015 (Fontes)
**Ator:** Usuario (Gestor de Portfolio, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Produto cadastrado com descricao original
3. Tool `tool_aplicar_mascara_descricao` registrada no catalogo DeepSeek
4. Infraestrutura de mascara funcional (`_build_prompt_mascara`, `_extrair_specs_em_chunks` em tools.py)

### Pos-condicoes
1. Campo `descricao_normalizada` preenchido no produto
2. Feature flag `mascara_ativa` definido (default: true)
3. Log antes/depois do score de aderencia registrado
4. Badge "Mascara Ativa" visivel no PortfolioPage (UC-CL03)

### Sequencia de Eventos

1. Usuario acessa PortfolioPage e clica [Botao: "Aplicar Mascara"] (coluna Acoes) de um produto — OU — acessa via chatbox: "aplica mascara ao produto X"
2. Sistema abre [Modal: "Aplicar Mascara de Descricao"]
3. Modal exibe:
   a. [Campo: "Descricao Original"] (readonly) — nome/descricao atual do produto
   b. [Campo: "Subclasse"] — subclasse atual do produto (se houver)
   c. [Campo: "campos_mascara da Subclasse"] — lista de campos tecnicos configurados (se subclasse tiver mascara)
4. Usuario clica [Botao: "Gerar Descricao Normalizada"]
5. Sistema verifica cooldown DeepSeek (RN-084)
6. Sistema invoca `tool_aplicar_mascara_descricao` passando:
   - Descricao original do produto
   - NCM do produto (se houver)
   - campos_mascara da subclasse (se houver)
   - Top 10 termos mais frequentes em editais captados no mesmo segmento
7. Tool retorna:
   a. `descricao_normalizada`: versao normalizada da descricao
   b. `variantes`: lista de 3-5 variantes de nomenclatura geradas
   c. `sinonimos_aplicados`: lista de substituicoes feitas (ex.: "A1C" → "hemoglobina glicada HbA1c")
   d. `score_estimado_antes`: score de aderencia estimado com descricao original
   e. `score_estimado_depois`: score de aderencia estimado com descricao normalizada
8. Modal exibe resultado:
   a. [Card: "Antes → Depois"] lado a lado com descricao original e normalizada, diferencas destacadas em amarelo
   b. [Card: "Impacto no Score"] — barra comparativa antes/depois (ex.: 62% → 81%)
   c. [Card: "Variantes Geradas"] — lista de variantes alternativas
   d. [Card: "Sinonimos Aplicados"] — tabela: Original, Normalizado, Fonte
9. Usuario pode:
   a. [Botao: "Aceitar"] — salva `descricao_normalizada` no produto, ativa feature flag
   b. [Botao: "Editar e Aceitar"] — permite ajustar a descricao normalizada antes de salvar
   c. [Botao: "Cancelar"] — descarta
10. [Toggle: "Mascara Ativa"] (RN-NEW-10) — usuario pode desativar a mascara por produto sem apagar a descricao normalizada
11. Ao aceitar, sistema salva no produto: `descricao_normalizada`, `mascara_ativa=true`, `mascara_metadata` (JSON com variantes, sinonimos, score antes/depois)
12. Toast: "Mascara aplicada. Score de aderencia estimado: {antes}% → {depois}%"
13. Badge "Mascara Ativa" aparece no PortfolioPage (UC-CL03)

**Modo em lote:**
14. Usuario pode selecionar multiplos produtos no PortfolioPage (UC-CL03) e clicar [Botao: "Aplicar Mascara em Lote"]
15. Sistema processa cada produto sequencialmente (respeitando cooldown), exibe progresso
16. Resultado exibido em tabela resumo: Produto, Score Antes, Score Depois, Delta, Status (OK/Erro)

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`) — Modal
**Posicao:** Modal sobreposto a tab "produtos"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  +---- Modal: Aplicar Mascara de Descricao ----+               |
|  |                                              |              |
|  | Produto: Reagente Hemoglobina A1C            |              |
|  | Subclasse: Hemoglobina Glicada               |              |
|  | NCM: 3822.00.90                              |              |
|  |                                              |              |
|  | Campos de Mascara (subclasse):               |              |
|  | - Metodologia (texto)                        |              |
|  | - Tamanho Kit (numero)                       |              |
|  | - Rastreabilidade (boolean)                  |              |
|  |                                              |              |
|  | [Gerar Descricao Normalizada]                |              |
|  |                                              |              |
|  | +--- Antes → Depois ---+                     |              |
|  | | ORIGINAL:            | NORMALIZADA:        |              |
|  | | Reagente Hemoglobina  | Reagente para       |              |
|  | | A1C                   | dosagem de          |              |
|  | |                       | hemoglobina         |              |
|  | |                       | glicada HbA1c       |              |
|  | |                       | (metodo HPLC)       |              |
|  | +-----------------------+---------------------+              |
|  |                                              |              |
|  | +--- Impacto no Score ---+                   |              |
|  | | Antes: ████████░░░ 62%  |                   |              |
|  | | Depois: ████████████ 81% |  (+19%)          |              |
|  | +------------------------+                    |              |
|  |                                              |              |
|  | +--- Variantes Geradas ---+                  |              |
|  | | 1. reagente hemoglobina glicada HbA1c      |              |
|  | | 2. reagente dosagem HbA1c HPLC             |              |
|  | | 3. kit hemoglobina glicada automatizado     |              |
|  | +----------------------------+               |              |
|  |                                              |              |
|  | +--- Sinonimos Aplicados ---+                |              |
|  | | Original       | Normalizado              |              |
|  | | A1C            | hemoglobina glicada HbA1c |              |
|  | | Reagente       | Reagente para dosagem de  |              |
|  | +----------------------------+               |              |
|  |                                              |              |
|  | Mascara Ativa: [ON/OFF] (default: ON)        |              |
|  |                                              |              |
|  | [Aceitar]  [Editar e Aceitar]  [Cancelar]    |              |
|  +----------------------------------------------+              |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Descricao original, campos mascara da subclasse, comparativo antes/depois, impacto no score, variantes, sinonimos
- **Preenchidos (input):** Botao "Gerar", Toggle "Mascara Ativa", Botoes Aceitar/Editar/Cancelar, edicao da descricao normalizada (modo editar)
- **Obtidos (resposta do sistema):** Descricao normalizada, variantes, score estimado antes/depois, sinonimos aplicados

### Excecoes
- **E1:** Produto sem descricao — toast: "Produto sem descricao para normalizar"
- **E2:** Cooldown ativo (RN-084) — toast: "Aguarde {N}s antes de nova analise"
- **E3:** IA nao consegue melhorar — modal exibe: "A descricao original ja esta otimizada. Score estimado nao melhora com normalizacao."
- **E4:** Modo lote com erro parcial — tabela resumo mostra quais produtos falharam com motivo

---

# BACKEND — ESPECIFICACAO TECNICA

---

## Novos Endpoints (7)

| # | Endpoint | UC | Metodo | Descricao |
|---|---|---|---|---|
| 1 | `/api/dashboard/dispensas` | UC-DI01 | GET | Dashboard de dispensas com stat cards por status |
| 2 | `/api/dispensas/buscar` | UC-DI01 | POST | Buscar dispensas no PNCP (reusa motor busca Sprint 2) |
| 3 | `/api/dispensas/<id>/cotacao` | UC-DI01 | POST | Gerar cotacao assistida por IA |
| 4 | `/api/dispensas/<id>/status` | UC-DI01 | PUT | Atualizar status (RN-NEW-08) |
| 5 | `/api/portfolio/gerar-classes` | UC-CL01 | POST | Invocar tool_gerar_classes_portfolio |
| 6 | `/api/portfolio/aplicar-mascara` | UC-MA01 | POST | Invocar tool_aplicar_mascara_descricao (1 produto) |
| 7 | `/api/portfolio/aplicar-mascara-lote` | UC-MA01 | POST | Aplicar mascara em lote (N produtos) |

## Endpoints Expandidos (2)

| # | Endpoint Existente | UC | O que ADICIONA |
|---|---|---|---|
| 8 | `GET /api/crud/dispensas` | UC-DI01 | Ja existe — adicionar filtros: artigo, faixa_valor, status |
| 9 | `GET /api/crud/produtos` | UC-CL03 | Ja existe — adicionar campo `descricao_normalizada` e `mascara_ativa` no retorno |

## Novas Tools DeepSeek (2)

| Tool | UC | Funcao |
|---|---|---|
| `tool_gerar_classes_portfolio` | UC-CL01 | Analisa produtos (nome, NCM, descricao) e gera arvore Area→Classe→Subclasse |
| `tool_aplicar_mascara_descricao` | UC-MA01 | Normaliza descricao de produto via regex+LLM, gera variantes e estima impacto no score |

## Alteracoes em Models (2 campos novos)

| Model | Campo | Tipo | Descricao |
|---|---|---|---|
| `Produto` | `descricao_normalizada` | Text, nullable | Descricao normalizada pela mascara |
| `Produto` | `mascara_ativa` | Boolean, default True | Feature flag (RN-NEW-10) |
| `Produto` | `mascara_metadata` | JSON, nullable | Variantes, sinonimos, score antes/depois |

---

# SIDEBAR

Sem alteracoes na sidebar. As funcionalidades sao acessiveis por:
- Dispensas: CaptacaoPage → aba "Dispensas" (nova aba na pagina existente)
- Classes: ParametrizacoesPage → aba "Classes" (nova aba na pagina existente)
- Mascara: PortfolioPage → coluna Acoes → botao "Aplicar Mascara"
- Entradas "Dispensas" e "Classes" ja existem na sidebar em Cadastros

---

# SEED DATA SPRINT 8

## IDs Fixos
```
SEED_MARK = "SPRINT8_SEED"
VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"   (valida1 — CH Hospitalar)
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"   (valida2 — RP3X)
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"
```

## Conjunto 1: CH Hospitalar (valida1)

| Entidade | Qtd | Detalhes |
|---|---|---|
| Dispensas | 6 | 2 abertas, 2 cotacao_enviada, 1 adjudicada, 1 encerrada. Artigos: 75-I (2), 75-II (3), 75-VIII (1). Vinculadas a editais existentes com modalidade "dispensa" |
| Areas | 2 | "Diagnostico In Vitro", "Equipamentos" |
| Classes | 5 | Hematologia, Bioquimica, Coagulacao, Imunologia, Analisadores |
| Subclasses | 10 | 2 por classe. Cada uma com campos_mascara definidos (3-4 campos tecnicos) |
| Produtos com mascara | 8 | 8 dos produtos existentes recebem descricao_normalizada + mascara_ativa=true + mascara_metadata |

## Conjunto 2: RP3X (valida2) — Dados Minimos

| Entidade | Qtd | Detalhes |
|---|---|---|
| Dispensas | 2 | 1 aberta, 1 cotacao_enviada. Artigo 75-II |
| Areas | 1 | "TI Governamental" |
| Classes | 2 | "Sistemas Web", "Infraestrutura" |
| Subclasses | 3 | Com campos_mascara |
| Produtos com mascara | 3 | 3 produtos com descricao_normalizada |

---

# TESTES PLAYWRIGHT (2 arquivos, 5 testes)

## sprint8-dispensas.spec.ts (2 testes)

- **UC-DI01 — Dashboard:** navTo("Captacao"), clickTab("Dispensas"), verificar stat cards (4 status), filtros (artigo, faixa, UF), tabela com badges urgencia, botao Buscar
- **UC-DI01 — Cotacao:** na aba Dispensas, clicar "Gerar Cotacao" em dispensa aberta, verificar modal com produtos, cotacao gerada, enviar, verificar transicao status para "cotacao_enviada"

## sprint8-classes-mascaras.spec.ts (3 testes)

- **UC-CL01 + UC-CL02 — Classes:** navTo("Parametrizacoes"), clickTab("Classes"), verificar stat cards, arvore hierarquica, detalhe subclasse com campos_mascara, botao "Gerar via IA"
- **UC-CL03 — Portfolio:** navTo("Portfolio"), verificar coluna "Classe", badge "Sem Classe", badge "Mascara Ativa", filtro "Sem Classe", selecao multipla
- **UC-MA01 — Mascara:** no Portfolio, clicar "Aplicar Mascara" em produto, verificar modal com antes/depois, impacto score, variantes, aceitar, badge atualizado

**Helpers update:** verificar que "Captacao" e "Parametrizacoes" ja existem em PAGE_LABELS (devem existir desde Sprint 1-2)
