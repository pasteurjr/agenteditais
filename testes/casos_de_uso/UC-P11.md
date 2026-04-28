---
uc_id: UC-P11
nome: "Pipeline IA de Precificacao"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1239
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-P11 — Pipeline IA de Precificacao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1239).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-14

**Regras de Negocio aplicaveis:**
- Presentes: RN-101, RN-103, RN-104, RN-105
- Faltantes: RN-123 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-101, RN-103, RN-104, RN-105, RN-123 [FALTANTE->V4] — adicionalmente: RN-083 (escopo de chat limitado ao edital aberto), RN-084 (cooldown 60s DeepSeek por empresa), RN-132 (audit de invocacoes DeepSeek com tool/hash/duracao) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Vinculo item-produto existente

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P02**


### Pos-condicoes
1. Insights salvos no banco, campos A-E pre-preenchidos

### Sequencia de eventos
1. Usuario seleciona vinculo item-produto no [Select: "Vinculo Item <-> Produto"]. [ref: Passo 1]
2. Sistema carrega automaticamente insights do [Card: "Precificacao Assistida por IA"]. [ref: Passo 2]
3. Se nao ha insights, sistema mostra loading "Buscando historico de precos e atas no PNCP...". [ref: Passo 3]
4. Apos carga, sistema exibe [Secao: "Banner Resumo"] com contadores (registros, atas, Min, Media, Max, Ref. Edital). [ref: Passo 4]
5. Abaixo, sistema exibe 5 cards de recomendacao: [Card: "Custo (A)"], [Card: "Preco Base (B)"], [Card: "Referencia (C)"], [Card: "Lance Inicial (D)"], [Card: "Lance Minimo (E)"], cada um com valor e botao "Usar ->". [ref: Passo 5]
6. Usuario clica em "Usar ->" para pre-preencher o campo correspondente. [ref: Passo 6]
7. Se nenhum dado encontrado, usuario pode clicar no [Botao: "Regenerar Analise"] para nova busca. [ref: Passo 7]
8. Detalhes expansiveis mostram [Secao: "Concorrentes principais"] com tabela e [Secao: "Atas consultadas"] com lista de atas. [ref: Passo 8]

### Fluxos Alternativos (V5)

**FA-01 — Aceitar todas as sugestoes de uma vez (Aplicar Sugestoes):**
1. Em vez de clicar "Usar ->" card a card, usuario clica em "Aplicar Sugestoes".
2. Sistema preenche automaticamente todos os campos A-E com os valores sugeridos.

**FA-02 — Descartar sugestoes e manter valores manuais:**
1. Usuario clica em "Descartar".
2. Os valores definidos manualmente nos UCs anteriores sao mantidos.

**FA-03 — Regenerar analise com novos termos de busca:**
1. No passo 7, usuario clica em "Regenerar Analise".
2. Sistema faz nova busca no PNCP com termos atualizados.
3. Banner Resumo e recomendacoes sao atualizados.

### Fluxos de Excecao (V5)

**FE-01 — Nenhum historico encontrado no PNCP (N=0):**
1. No passo 4, a busca nao retorna registros.
2. Banner Resumo exibe "0 registros, 0 atas".
3. Recomendacoes A-E ficam vazias ou com valores default.

**FE-02 — Timeout da busca PNCP (> 120 segundos):**
1. No passo 3, a busca no PNCP nao retorna em 120 segundos.
2. Sistema exibe toast: "Timeout na busca PNCP. Tente 'Regenerar Analise'."

**FE-03 — Cooldown DeepSeek ativo (RN-084):**
1. Usuario tenta regenerar analise dentro de 60 segundos de outra chamada.
2. Sistema exibe toast: "Aguarde 60 segundos entre chamadas de IA."

**FE-04 — Sugestoes com valores absurdos:**
1. A IA retorna valores fora da faixa razoavel (ex: R$ 0 ou R$ 999.999).
2. Sistema exibe badge de warning nos cards afetados.
3. Usuario deve validar e ajustar manualmente.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Precificacao Assistida por IA

#### Layout da Tela

[Card: "Precificacao Assistida por IA"] icon Sparkles [ref: Passo 2]
  [Texto: "Buscando historico de precos e atas no PNCP..."] — loading [ref: Passo 3]
  [Secao: "Banner Resumo"] — fundo azul [ref: Passo 4]
    [Indicador: "N registros"]
    [Indicador: "N atas"]
    [Indicador: "Min"] — verde
    [Indicador: "Media"]
    [Indicador: "Max"] — vermelho
    [Indicador: "Ref. Edital"] — laranja, condicional
    [Badge: "Fonte da recomendacao"]
    [Botao: "Regenerar"] icon Search [ref: Passo 7]
  [Secao: "Recomendacoes A-E"] — grid de 5 cards [ref: Passo 5]
    [Card: "Custo (A)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Preco Base (B)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Referencia (C)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Lance Inicial (D)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
    [Card: "Lance Minimo (E)"] — valor + descricao + [Botao: "Usar ->"] [ref: Passo 6]
  [Secao: "Concorrentes principais (N)"] — expansivel [ref: Passo 8]
    [Tabela: "Concorrentes"]
      [Coluna: "Empresa"]
      [Coluna: "Vitorias"]
      [Coluna: "Taxa (%)"]
      [Coluna: "Preco Medio"]
  [Secao: "Atas consultadas (N)"] — expansivel [ref: Passo 8]
    [Lista: "Atas"]
      [Texto: "Titulo da ata"]
      [Texto: "Orgao"]
      [Texto: "UF"]
      [Botao: "Ver no PNCP"] — link externo

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Select: "Vinculo Item <-> Produto"] | 1 |
| [Card: "Precificacao Assistida por IA"] | 2 |
| Loading "Buscando..." | 3 |
| [Secao: "Banner Resumo"] | 4 |
| 5 cards de recomendacao (A-E) | 5 |
| [Botao: "Usar ->"] por card | 6 |
| [Botao: "Regenerar Analise"] | 7 |
| [Secao: "Concorrentes"] / [Secao: "Atas consultadas"] | 8 |

### Implementacao atual
**IMPLEMENTADO**

---
