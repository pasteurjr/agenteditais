---
uc_id: UC-CV06
nome: "Gerir monitoramentos automaticos de busca"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 772
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV06 — Gerir monitoramentos automaticos de busca

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 772).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

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

### Fluxos Alternativos (V5)

**FA-01 — Criar monitoramento sem NCM (campo vazio)**
1. Usuario preenche o formulario de novo monitoramento mas deixa NCM em branco.
2. Sistema aceita o monitoramento sem filtro de NCM (busca mais ampla).
3. O monitoramento e salvo e aparece na tabela com campo NCM vazio.

**FA-02 — Criar monitoramento com UF "Todas"**
1. Usuario seleciona "Todas" no campo de UFs.
2. O monitoramento busca em todas as UFs sem filtro geografico.

**FA-03 — Pausar e retomar o mesmo monitoramento**
1. Usuario pausa um monitoramento ativo.
2. O status muda para "Pausado" (badge cinza).
3. O monitoramento nao executa buscas automaticas enquanto pausado.
4. Usuario retoma o monitoramento; status volta para "Ativo" (badge verde).

**FA-04 — Excluir monitoramento com confirmacao**
1. Usuario clica em "Excluir" num monitoramento.
2. Sistema exibe modal de confirmacao: "Deseja realmente excluir este monitoramento?"
3. Usuario confirma; monitoramento e removido da tabela e do banco.

**FA-05 — Nenhum edital encontrado pelo monitoramento**
1. O monitoramento executa a busca automatica no intervalo configurado.
2. Nenhum novo edital e encontrado.
3. A tabela "Ultimos Editais Encontrados" permanece vazia ou com dados da execucao anterior.

### Fluxos de Excecao (V5)

**FE-01 — Falha ao criar monitoramento (campo obrigatorio ausente)**
1. Usuario clica em "Criar" sem preencher o campo Termo (obrigatorio).
2. Sistema exibe validacao inline: "O campo Termo e obrigatorio."
3. O monitoramento nao e criado.

**FE-02 — Erro ao persistir monitoramento no banco**
1. Usuario clica em "Criar".
2. O CRUD retorna erro de banco.
3. Sistema exibe Toast de erro: "Erro ao criar monitoramento."

**FE-03 — Falha na execucao automatica do monitoramento**
1. O sistema tenta executar a busca automatica no intervalo configurado.
2. O PNCP esta fora do ar ou a busca falha.
3. O monitoramento registra o erro e tenta novamente no proximo intervalo.
4. O campo "Ultimo Check" exibe a data da ultima tentativa com indicador de falha.

**FE-04 — Limite de monitoramentos atingido**
1. Usuario tenta criar um novo monitoramento alem do limite maximo permitido.
2. Sistema exibe mensagem: "Limite maximo de monitoramentos atingido."

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
