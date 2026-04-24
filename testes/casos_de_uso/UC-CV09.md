---
uc_id: UC-CV09
nome: "Importar itens e extrair lotes por IA"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 1201
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV09 — Importar itens e extrair lotes por IA

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 1201).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-085 [FALTANTE->V4]

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

### Fluxos Alternativos (V5)

**FA-01 — Itens ja carregados de busca anterior**
1. Usuario abre a aba Lotes de um edital que ja teve itens importados.
2. A tabela "Itens do Edital" ja esta populada.
3. O botao "Buscar Itens no PNCP" permanece disponivel para reimportacao.

**FA-02 — Lotes ja extraidos anteriormente (Reprocessar)**
1. Usuario abre a aba Lotes de um edital que ja teve lotes extraidos.
2. Os cards de lote sao exibidos imediatamente.
3. O botao exibido e "Reprocessar" em vez de "Extrair Lotes via IA".
4. Ao reprocessar, a IA pode gerar agrupamento diferente do anterior.

**FA-03 — Mover item entre lotes**
1. Usuario seleciona "Mover para Lote 1" no select de um item que esta no Lote 2.
2. O item desaparece do Lote 2 e aparece no Lote 1.
3. Os valores estimados de ambos os lotes sao recalculados.

**FA-04 — Excluir lote vazio**
1. Apos mover todos os itens de um lote para outros lotes, o lote fica vazio.
2. Usuario clica em "Excluir lote".
3. O card do lote e removido da interface.

**FA-05 — Edital sem itens no PNCP**
1. Usuario clica em "Buscar Itens no PNCP".
2. O PNCP nao retorna itens para aquele edital.
3. Sistema exibe mensagem: "Nenhum item encontrado no PNCP para este edital."
4. A tabela de itens permanece vazia.

### Fluxos de Excecao (V5)

**FE-01 — PNCP indisponivel ao buscar itens**
1. Usuario clica em "Buscar Itens no PNCP".
2. O endpoint do PNCP esta fora do ar ou retorna timeout.
3. Sistema exibe mensagem: "Nao foi possivel conectar ao PNCP. Tente novamente."

**FE-02 — Falha na extracao de lotes via IA**
1. Usuario clica em "Extrair Lotes via IA".
2. O servico de IA falha (timeout DeepSeek, resposta malformada).
3. Sistema exibe mensagem: "Erro ao extrair lotes. O servico de IA esta indisponivel."
4. Os itens permanecem na tabela sem agrupamento em lotes.

**FE-03 — Erro ao mover item entre lotes**
1. Usuario seleciona "Mover para Lote 1" para um item.
2. A operacao de persistencia falha.
3. Sistema exibe Toast de erro: "Erro ao mover item."
4. O item permanece no lote original.

**FE-04 — Excluir lote com itens (lote nao vazio)**
1. Usuario tenta excluir um lote que ainda contem itens.
2. Sistema solicita confirmacao: "Este lote contem N itens. Os itens serao desvinculados. Confirmar?"
3. Se usuario confirma, os itens ficam sem lote atribuido.

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
