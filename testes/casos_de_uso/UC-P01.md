---
uc_id: UC-P01
nome: "Organizar Edital por Lotes"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 155
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P01 — Organizar Edital por Lotes

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 155).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

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
