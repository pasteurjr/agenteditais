---
uc_id: UC-P05
nome: "Montar Preco Base (Camada B)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 618
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P05 — Montar Preco Base (Camada B)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 618).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-08

**Regras de Negocio aplicaveis:**
- Presentes: RN-091, RN-092
- Faltantes: RN-124 [FALTANTE], RN-130 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-091, RN-092, RN-098, RN-102, RN-124 [FALTANTE->V4], RN-130 [FALTANTE->V4], RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Base de custos definida (UC-P04)

### Pos-condicoes
1. Preco base definido por uma das 3 opcoes
2. Flag de reutilizacao definida

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], usuario localiza o [Card: "Preco Base"]. [ref: Passo 1]
2. Usuario seleciona modo no [Select: "Modo"]: "Custo + Markup", "Manual" ou "Upload". [ref: Passo 2]
3. **Se Custo + Markup:** usuario preenche [Campo: "Markup (%)"] e sistema calcula preco base. [ref: Passo 3]
4. **Se Manual:** usuario preenche [Campo: "Preco Base (R$)"]. [ref: Passo 4]
5. **Se Upload:** usuario seleciona arquivo no [Campo: "Tabela de Precos (.csv)"]. [ref: Passo 5]
6. Opcionalmente, usuario marca [Checkbox: "Reutilizar este preco nos proximos lances"]. [ref: Passo 6]
7. Usuario clica no [Botao: "Salvar Preco Base"]. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Modo Manual (preco direto):**
1. No passo 2, usuario seleciona "Manual".
2. Usuario informa diretamente o valor do preco base em reais.
3. O calculo de markup nao e aplicado.

**FA-02 — Modo Upload CSV (tabela de precos externa):**
1. No passo 2, usuario seleciona "Upload".
2. Usuario seleciona arquivo .csv com tabela de precos.
3. Sistema importa os precos e aplica ao vinculo correspondente.

**FA-03 — Reutilizar preco em outros editais:**
1. No passo 6, usuario marca "Reutilizar este preco nos proximos lances".
2. O preco fica salvo como referencia e e sugerido automaticamente em editais futuros para o mesmo produto.

**FA-04 — Override do markup padrao por item:**
1. No passo 3, usuario altera o markup de, por exemplo, 28% (padrao da empresa) para 35%.
2. O sistema recalcula o preco base com o novo markup.
3. O markup original nao e alterado nos parametros globais.

### Fluxos de Excecao (V5)

**FE-01 — Markup negativo (preco abaixo do custo):**
1. No passo 3, usuario informa markup negativo (ex: -5%).
2. Sistema exibe warning: "Markup negativo resulta em preco abaixo do custo."
3. O calculo e permitido mas o campo exibe alerta visual vermelho.

**FE-02 — Preco base manual igual a zero:**
1. No passo 4, usuario informa preco base = 0.
2. Sistema exibe validacao: "Preco base deve ser maior que zero."

**FE-03 — Arquivo CSV invalido ou vazio:**
1. No passo 5, usuario faz upload de um CSV que nao segue o formato esperado.
2. Sistema exibe toast de erro: "Formato do CSV invalido. Use o modelo disponivel."

**FE-04 — CSV com mais de 25MB:**
1. No passo 5, usuario tenta fazer upload de CSV acima de 25MB.
2. Sistema bloqueia upload: "Arquivo excede o tamanho maximo de 25MB."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Preco Base

#### Layout da Tela

[Card: "Preco Base"] icon TrendingUp [ref: Passo 1]
  [Select: "Modo"] — "Custo + Markup" / "Manual" / "Upload" [ref: Passo 2]
  [Secao: "Modo Markup"] — visivel se modo = "Custo + Markup"
    [Campo: "Markup (%)"] — text, placeholder "30" [ref: Passo 3]
  [Secao: "Modo Manual"] — visivel se modo = "Manual"
    [Campo: "Preco Base (R$)"] — text, placeholder "Preco de venda" [ref: Passo 4]
  [Secao: "Modo Upload"] — visivel se modo = "Upload"
    [Campo: "Tabela de Precos (.csv)"] — file input, accept ".csv" [ref: Passo 5]
  [Checkbox: "Reutilizar este preco nos proximos lances"] [ref: Passo 6]
  [Botao: "Salvar Preco Base"] icon Check [ref: Passo 7]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Preco Base"] | 1 |
| [Select: "Modo"] | 2 |
| [Campo: "Markup (%)"] | 3 |
| [Campo: "Preco Base (R$)"] | 4 |
| [Campo: "Tabela de Precos (.csv)"] | 5 |
| [Checkbox: "Reutilizar preco"] | 6 |
| [Botao: "Salvar Preco Base"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---
