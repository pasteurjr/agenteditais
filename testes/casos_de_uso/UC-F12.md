---
uc_id: UC-F12
nome: "Reprocessar metadados de captacao do produto"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1671
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F12 — Reprocessar metadados de captacao do produto

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1671).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023

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
