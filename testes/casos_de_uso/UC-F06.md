---
uc_id: UC-F06
nome: "Listar, filtrar e inspecionar produtos"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 943
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F06 — Listar, filtrar e inspecionar produtos

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 943).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

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
- **UC-F13 OU [seed]**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


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
