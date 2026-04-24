---
uc_id: UC-P10
nome: "Gestao de Comodato"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1135
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P10 — Gestao de Comodato

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1135).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-13

**Regras de Negocio aplicaveis:**
- Presentes: RN-107
- Faltantes: RN-125 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-107, RN-125 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Edital envolve comodato de equipamento

### Pos-condicoes
1. Dados de comodato registrados com amortizacao calculada

### Sequencia de eventos
1. Na [Aba: "Historico"], usuario localiza o [Card: "Gestao de Comodato"]. [ref: Passo 1]
2. Usuario preenche [Campo: "Equipamento"], [Campo: "Valor do Equipamento (R$)"] e [Campo: "Prazo (meses)"]. [ref: Passo 2]
3. Sistema calcula e exibe amortizacao mensal (valor / meses). [ref: Passo 3]
4. Usuario clica no [Botao: "Salvar Comodato"]. [ref: Passo 4]
5. A [Tabela: "Comodatos"] exibe equipamentos salvos com colunas Equipamento, Valor, Meses, Amort./mes, Status. [ref: Passo 5]
6. A [Secao: "Impacto do Comodato no Preco"] exibe metricas: total equipamentos, valor total, amortizacao mensal total e impacto por item do lote. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Edital sem comodato (nenhum equipamento exigido):**
1. O edital nao exige comodato de equipamento.
2. O card "Gestao de Comodato" esta presente mas vazio.
3. Secao "Impacto do Comodato no Preco" nao e exibida.

**FA-02 — Multiplos equipamentos em comodato:**
1. Usuario cadastra mais de um equipamento (ex: analisador hematologico + analisador bioquimico).
2. Cada equipamento aparece como linha na tabela "Comodatos".
3. A secao "Impacto" consolida amortizacoes e calcula impacto total por item.

**FA-03 — Edicao de comodato existente (alterar prazo):**
1. Usuario edita um comodato ja salvo e altera o prazo (ex: de 60 para 48 meses).
2. A amortizacao mensal e recalculada automaticamente.

**FA-04 — Exclusao de comodato:**
1. Usuario exclui um comodato da lista.
2. Sistema remove da tabela e recalcula metricas de impacto.

### Fluxos de Excecao (V5)

**FE-01 — Valor do equipamento igual a zero:**
1. No passo 2, usuario informa valor = 0.
2. Sistema exibe validacao: "Valor do equipamento deve ser maior que zero."

**FE-02 — Prazo igual a zero:**
1. No passo 2, usuario informa prazo = 0 meses.
2. Sistema exibe erro: "Prazo deve ser maior que zero (divisao por zero)."

**FE-03 — Equipamento duplicado:**
1. Usuario tenta cadastrar um equipamento com mesmo nome ja existente.
2. Sistema exibe warning: "Equipamento ja cadastrado. Deseja atualizar os dados?"

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 4 (Historico) — Card Gestao de Comodato

#### Layout da Tela

[Card: "Gestao de Comodato"] icon Lightbulb [ref: Passo 1]
  [Badge: "Processo manual — IA futura no roadmap"]
  [Campo: "Equipamento"] — text, placeholder "Analisador XYZ-3000" [ref: Passo 2]
  [Campo: "Valor do Equipamento (R$)"] — text, placeholder "250000" [ref: Passo 2]
  [Campo: "Prazo (meses)"] — text, placeholder "60" [ref: Passo 2]
  [Texto: "Amortizacao mensal: R$ X"] — calculado [ref: Passo 3]
  [Botao: "Salvar Comodato"] icon Check [ref: Passo 4]
  [Tabela: "Comodatos"] — visivel se existem registros [ref: Passo 5]
    [Coluna: "Equipamento"]
    [Coluna: "Valor"]
    [Coluna: "Meses"]
    [Coluna: "Amort./mes"]
    [Coluna: "Status"]
  [Secao: "Impacto do Comodato no Preco"] — visivel se comodatos existem [ref: Passo 6]
    [Indicador: "Total equipamentos"]
    [Indicador: "Valor total equipamentos"]
    [Indicador: "Amortizacao mensal total"]
    [Indicador: "Impacto por item do lote"]
    [Texto: "Formula: X / Y itens = Z"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Gestao de Comodato"] | 1 |
| [Campo: "Equipamento/Valor/Prazo"] | 2 |
| [Texto: "Amortizacao mensal"] | 3 |
| [Botao: "Salvar Comodato"] | 4 |
| [Tabela: "Comodatos"] | 5 |
| [Secao: "Impacto do Comodato no Preco"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---
