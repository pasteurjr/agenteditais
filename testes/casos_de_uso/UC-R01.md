---
uc_id: UC-R01
nome: "Gerar Proposta Tecnica (Motor Automatico)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1442
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-R01 — Gerar Proposta Tecnica (Motor Automatico)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1442).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-040-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-116, RN-117
- Faltantes: RN-125 [FALTANTE], RN-127 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-116, RN-117, RN-125 [FALTANTE->V4], RN-127 [FALTANTE->V4] — adicionalmente: RN-031 (bloquear submissao se empresa tem certidao vencida — dual flag `ENFORCE_CERTIDAO_GATE` + `ENFORCE_RN_VALIDATORS`), RN-082 (transicao de estado Edital), RN-037 (audit log universal de proposta) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Precificacao completa (camadas A-F definidas para pelo menos 1 lote)
2. Edital salvo com dados do orgao
3. Produto com specs tecnicas no portfolio

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P04**
- **UC-P05**
- **UC-P06**
- **UC-P07**
- **UC-P08**
- **UC-CV03**
- **UC-F07 OU UC-F08**


### Pos-condicoes
1. Proposta tecnica gerada com dados cruzados (preco + edital)
2. Proposta em status "rascunho", 100% editavel
3. Proposta visivel na tabela "Minhas Propostas"

### Sequencia de eventos
1. Usuario clica no [Botao: "Nova Proposta"] no header da PropostaPage ou no [Botao: "Gerar Proposta Tecnica"] no card inline. [ref: Passo 1]
2. No formulario (inline ou modal), usuario seleciona [Select: "Edital"] e [Select: "Produto"]. [ref: Passo 2]
3. Usuario preenche [Campo: "Preco Unitario"] (pode clicar no [Icone-Acao: Lightbulb "Sugerir preco"] para sugestao IA). [ref: Passo 3]
4. Usuario preenche [Campo: "Quantidade"]. [ref: Passo 4]
5. Se lotes disponiveis, usuario seleciona [Select: "Lote"]. [ref: Passo 5]
6. Opcionalmente seleciona [Select: "Template"]. [ref: Passo 6]
7. Usuario clica no [Botao: "Gerar Proposta Tecnica"]. [ref: Passo 7]
8. Sistema chama `POST /api/precificacao/simular-ia` e cria registro via `crudCreate("propostas", ...)`. [ref: Passo 8]
9. Proposta aparece na [Tabela: DataTable "Minhas Propostas"] com status "Rascunho". [ref: Passo 9]

### Fluxos Alternativos (V5)

**FA-01 — Usar sugestao de preco da IA (Lightbulb):**
1. No passo 3, usuario clica no icone de lampada (Lightbulb) ao lado do campo de preco.
2. Sistema sugere preco competitivo baseado no historico e pipeline IA.
3. Hint "Sugerido: R$ X" e exibido abaixo do campo.
4. Usuario pode aceitar ou informar outro valor.

**FA-02 — Gerar multiplas propostas para o mesmo edital (lotes diferentes):**
1. Apos gerar a primeira proposta para o Lote 1, usuario repete o processo para o Lote 2.
2. Ambas as propostas aparecem na tabela "Minhas Propostas" com lotes diferentes.

**FA-03 — Selecionar template de proposta diferente:**
1. No passo 6, usuario seleciona um template especifico.
2. A proposta e gerada com o layout e estrutura do template selecionado.

### Fluxos de Excecao (V5)

**FE-01 — Motor IA nao responde (timeout > 60 segundos):**
1. No passo 8, a chamada ao motor IA excede 60 segundos.
2. Sistema exibe toast: "Timeout na geracao da proposta. Tente novamente."
3. Nenhuma proposta e criada.

**FE-02 — Edital sem itens vinculados (precificacao incompleta):**
1. No passo 2, o edital selecionado nao tem itens com preco definido.
2. Sistema exibe alerta: "Precificacao nao concluida para este edital."

**FE-03 — Preco unitario nao informado:**
1. No passo 3, usuario deixa o campo de preco vazio.
2. Sistema exibe validacao: "Preco unitario e obrigatorio."

**FE-04 — Certidao vencida (RN-031 ativa):**
1. Se `ENFORCE_RN_VALIDATORS=true` e `ENFORCE_CERTIDAO_GATE=true`, e a empresa tem certidao vencida.
2. Sistema bloqueia geracao: "Empresa com certidao vencida. Regularize antes de criar propostas."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Header + Card 1 (Gerar) + Card 2 (Tabela)

#### Layout da Tela

[Cabecalho: "Geracao de Propostas"] icon FileEdit
  [Texto: "Criar e gerenciar propostas tecnicas"]
  [Botao: "Nova Proposta"] icon FileEdit [ref: Passo 1]
  [Botao: "Upload Proposta Externa"] icon Download [ref: UC-R02]

[Card: "Gerar Nova Proposta"] icon FileEdit [ref: Passo 1]
  [Select: "Edital"] — lista de editais salvos [ref: Passo 2]
  [Select: "Produto"] — lista de produtos [ref: Passo 2]
  [Campo: "Preco Unitario"] — number, com [Icone-Acao: Lightbulb "Sugerir preco"] [ref: Passo 3]
  [Texto: "Sugerido: R$ X"] — hint condicional [ref: Passo 3]
  [Campo: "Quantidade"] — number [ref: Passo 4]
  [Select: "Lote"] — condicional, visivel se lotes existem [ref: Passo 5]
  [Select: "Template"] — lista de templates [ref: Passo 6]
  [Botao: "Gerar Proposta Tecnica"] icon FileEdit [ref: Passo 7]

[Card: "Minhas Propostas"] icon FileEdit [ref: Passo 9]
  [Secao: FilterBar]
    [Campo: "Buscar proposta..."] — text search
    [Select: "Status"] — Todas / Rascunho / Em Revisao / Aprovada / Enviada
  [Tabela: DataTable "Minhas Propostas"]
    [Coluna: "Edital"] — sortable
    [Coluna: "Orgao"]
    [Coluna: "Produto"] — sortable
    [Coluna: "Valor Total"] — sortable, moeda formatada
    [Coluna: "Data"] — sortable
    [Coluna: "Status"] — badge colorido (Rascunho/Em Revisao/Aprovada/Enviada)
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — ver proposta
      [Icone-Acao: Download] — baixar PDF
      [Icone-Acao: Trash2] — excluir (danger)

[Modal: "Gerar Nova Proposta"] — alternativa ao card inline
  [Select: "Edital"] [ref: Passo 2]
  [Select: "Lote"] — condicional [ref: Passo 5]
  [Select: "Template"] [ref: Passo 6]
  [Select: "Produto"] [ref: Passo 2]
  [Campo: "Preco Unitario"] + [Icone-Acao: Lightbulb] [ref: Passo 3]
  [Campo: "Quantidade"] [ref: Passo 4]
  [Botao: "Gerar Proposta"] [ref: Passo 7]
  [Botao: "Cancelar"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Nova Proposta"] / [Card: "Gerar Nova Proposta"] | 1 |
| [Select: "Edital"] / [Select: "Produto"] | 2 |
| [Campo: "Preco Unitario"] + [Icone-Acao: Lightbulb] | 3 |
| [Campo: "Quantidade"] | 4 |
| [Select: "Lote"] | 5 |
| [Select: "Template"] | 6 |
| [Botao: "Gerar Proposta Tecnica"] | 7 |
| [Tabela: "Minhas Propostas"] — nova linha status "Rascunho" | 9 |

### Implementacao atual
**IMPLEMENTADO**

---
