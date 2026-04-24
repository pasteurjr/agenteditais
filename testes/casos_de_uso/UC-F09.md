---
uc_id: UC-F09
nome: "Reprocessar especificacoes do produto com IA"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1386
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F09 — Reprocessar especificacoes do produto com IA

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1386).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023

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
