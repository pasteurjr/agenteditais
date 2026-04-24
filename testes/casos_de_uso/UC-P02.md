---
uc_id: UC-P02
nome: "Selecao Inteligente de Portfolio (Agente Assistido)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 274
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 274).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

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
