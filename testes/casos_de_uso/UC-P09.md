---
uc_id: UC-P09
nome: "Consultar Historico de Precos (Camada F)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1037
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P09 — Consultar Historico de Precos (Camada F)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1037).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-12

**Regras de Negocio aplicaveis:**
- Presentes: RN-104
- Faltantes: RN-123 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-104, RN-123 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Produto selecionado (em qualquer etapa da precificacao)

### Pos-condicoes
1. Usuario visualizou historico e usou como referencia consultiva

### Sequencia de eventos
1. Usuario clica na [Aba: "Historico"]. [ref: Passo 1]
2. No [Card: "Consultar Historico de Precos"], usuario preenche [Campo: "Produto/Termo"]. [ref: Passo 2]
3. Usuario clica no [Botao: "Filtrar"]. [ref: Passo 3]
4. Sistema busca em `preco_historico` e PNCP, exibe estatisticas no [Card: "Estatisticas"] (Preco Medio, Minimo, Maximo). [ref: Passo 4]
5. O [Card: "Resultados"] exibe [Tabela: DataTable "Resultados"] com colunas Produto, Preco e Data. [ref: Passo 5]
6. Opcionalmente, usuario clica no [Botao: "CSV"] para exportar historico. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Busca por NCM em vez de termo textual:**
1. No passo 2, usuario preenche NCM (ex: "9018.19.90") em vez de termo textual.
2. Sistema filtra por NCM e retorna resultados de produtos com este NCM.

**FA-02 — Busca com filtro de periodo:**
1. No passo 2, usuario seleciona periodo (ex: "Ultimos 12 meses", "Ultimos 24 meses").
2. Resultados sao filtrados pelo periodo selecionado.

**FA-03 — Visualizar grafico de tendencia:**
1. Apos a busca, sistema exibe grafico de linha temporal de precos.
2. Faixa sugerida para a Camada F e exibida baseada no historico.

### Fluxos de Excecao (V5)

**FE-01 — Nenhum historico encontrado:**
1. No passo 4, a busca nao retorna resultados (base local e PNCP vazios para o termo).
2. Sistema exibe mensagem: "Nenhum historico encontrado para este termo."
3. Os cards de estatisticas ficam vazios ou ocultos.

**FE-02 — Falha de conexao com PNCP:**
1. No passo 4, a busca no PNCP falha por erro de rede.
2. Sistema exibe toast: "Erro ao consultar PNCP. Usando apenas base local."
3. Resultados da base local sao exibidos normalmente.

**FE-03 — Termo de busca muito generico (muitos resultados):**
1. A busca retorna centenas ou milhares de resultados.
2. Sistema pagina os resultados e exibe apenas os primeiros N.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 4 (Historico) — Cards de consulta

#### Layout da Tela

[Aba: "Historico"] icon History [ref: Passo 1]

[Card: "Consultar Historico de Precos"] icon Search [ref: Passo 2]
  [Campo: "Produto/Termo"] — text, placeholder "reagente hematologia" [ref: Passo 2]
  [Botao: "Filtrar"] icon Search [ref: Passo 3]
  [Botao: "CSV"] icon Download [ref: Passo 6]

[Card: "Estatisticas"] icon TrendingUp — visivel apos busca [ref: Passo 4]
  [Indicador: "Preco Medio"]
  [Indicador: "Minimo"] — verde
  [Indicador: "Maximo"] — vermelho

[Card: "Resultados"] icon History — visivel se resultados [ref: Passo 5]
  [Tabela: DataTable "Resultados"]
    [Coluna: "Produto"] — sortable
    [Coluna: "Preco"] — moeda formatada, sortable
    [Coluna: "Data"] — sortable

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Historico"] | 1 |
| [Campo: "Produto/Termo"] | 2 |
| [Botao: "Filtrar"] | 3 |
| [Card: "Estatisticas"] — Medio/Min/Max | 4 |
| [Tabela: "Resultados"] | 5 |
| [Botao: "CSV"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---
