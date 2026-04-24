---
uc_id: UC-CV07
nome: "Listar editais salvos e selecionar edital para analise"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 908
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV07 — Listar editais salvos e selecionar edital para analise

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 908).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-064, RN-076, RN-082 [FALTANTE->V4]

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

### Fluxos Alternativos (V5)

**FA-01 — Nenhum edital salvo (lista vazia)**
1. Usuario acessa a ValidacaoPage sem ter salvo editais na captacao.
2. A tabela "Meus Editais" exibe mensagem: "Nenhum edital salvo. Va para Captacao para buscar e salvar editais."
3. O painel de abas nao aparece.

**FA-02 — Filtro por status nao retorna resultados**
1. Usuario seleciona filtro "GO" mas nenhum edital tem status GO.
2. A tabela exibe mensagem: "Nenhum edital com status GO."
3. Usuario pode selecionar outro filtro ou "Todos" para ver a lista completa.

**FA-03 — Busca por texto sem correspondencia**
1. Usuario digita um termo no campo "Buscar edital..." que nao corresponde a nenhum edital salvo.
2. A tabela fica vazia.
3. Usuario pode limpar o campo para restaurar a lista completa.

**FA-04 — Trocar edital selecionado**
1. Usuario clica em outro edital na tabela enquanto ja tem um selecionado.
2. Sistema limpa os dados do edital anterior e carrega os do novo edital.
3. As 6 abas sao reinicializadas para o novo edital.

### Fluxos de Excecao (V5)

**FE-01 — Falha ao carregar lista de editais salvos**
1. Usuario acessa a ValidacaoPage.
2. O endpoint `/api/editais/salvos` retorna erro HTTP 500 ou timeout.
3. Sistema exibe [Alerta: "Erro de carregamento"] com [Botao: "Tentar novamente"].
4. Usuario clica em "Tentar novamente" para refazer a requisicao.

**FE-02 — Edital selecionado foi excluido por outro usuario**
1. Usuario clica num edital na tabela.
2. O sistema tenta carregar detalhes do edital, mas ele foi excluido do banco.
3. Sistema exibe mensagem: "Este edital nao foi encontrado. A lista sera recarregada."
4. A tabela e recarregada sem o edital excluido.

**FE-03 — Falha ao carregar dados auxiliares (itens, lotes, docs)**
1. Apos selecionar um edital, o sistema tenta carregar itens, lotes e documentacao.
2. Uma ou mais requisicoes falham.
3. O Card "Edital Info" e exibido normalmente.
4. As abas afetadas exibem mensagem de erro individual com opcao de recarregar.

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
