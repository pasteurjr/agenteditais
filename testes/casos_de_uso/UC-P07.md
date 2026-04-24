---
uc_id: UC-P07
nome: "Estruturar Lances (Camadas D e E)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 805
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P07 — Estruturar Lances (Camadas D e E)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 805).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-10

**Regras de Negocio aplicaveis:**
- Presentes: RN-098, RN-099, RN-100
- Faltantes: RN-121 [FALTANTE], RN-122 [FALTANTE], RN-132 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-098, RN-099, RN-100, RN-102, RN-121 [FALTANTE->V4], RN-122 [FALTANTE->V4], RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Camadas A, B e C definidas (UC-P04 a UC-P06)

### Pos-condicoes
1. Valor Inicial do Lance definido
2. Valor Minimo do Lance definido

### Sequencia de eventos
1. Usuario clica na [Aba: "Lances"]. [ref: Passo 1]
2. Usuario seleciona vinculo no [Select: "Vinculo Item <-> Produto"] do [Card: "Selecionar Item-Produto"]. [ref: Passo 2]
3. No [Card: "Estrutura de Lances"], usuario seleciona modo do lance inicial no [Select: "Modo"] (Valor Absoluto / % da Referencia). [ref: Passo 3]
4. Usuario preenche [Campo: "Valor Inicial (R$)"]. [ref: Passo 4]
5. Usuario seleciona modo do lance minimo no [Select: "Modo"] (Valor Absoluto / % Desconto Maximo). [ref: Passo 5]
6. Se absoluto, preenche [Campo: "Valor Minimo (R$)"]. Se percentual, preenche [Campo: "Desconto Maximo (%)"]. [ref: Passo 6]
7. Usuario clica no [Botao: "Salvar Lances"]. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Lance inicial como percentual da referencia:**
1. No passo 3, usuario seleciona "% da Referencia" em vez de "Valor Absoluto".
2. Usuario preenche percentual (ex: 95 para 95% do valor de referencia).
3. Sistema calcula: Valor Inicial = Valor Referencia x (% / 100).

**FA-02 — Lance minimo como desconto maximo percentual:**
1. No passo 5, usuario seleciona "% Desconto Maximo".
2. Usuario preenche percentual (ex: 18 para 18% de desconto).
3. Sistema calcula: Valor Minimo = Valor Inicial x (1 - desconto/100).

**FA-03 — Modos mistos no mesmo edital:**
1. Diferentes itens do mesmo edital podem usar modos diferentes.
2. Ex: Item 1 usa "Valor Absoluto" para lance inicial, Item 6 usa "% da Referencia".

### Fluxos de Excecao (V5)

**FE-01 — Lance inicial acima do valor de referencia (D > C):**
1. No passo 4, o valor do lance inicial excede o valor de referencia.
2. Sistema exibe alerta: "Lance Inicial (D) nao pode exceder o Valor de Referencia (C)."
3. Badge vermelho aparece na validacao.

**FE-02 — Lance minimo acima do lance inicial (E > D):**
1. No passo 6, o valor minimo excede o lance inicial.
2. Sistema exibe alerta: "Lance Minimo (E) nao pode exceder o Lance Inicial (D)."

**FE-03 — Lance minimo abaixo do custo (margem negativa):**
1. No passo 6, o valor minimo e inferior ao custo total do item.
2. Sistema exibe alerta vermelho: "Lance Minimo abaixo do custo — prejuizo!"
3. O salvamento e permitido com warning.

**FE-04 — Margem inferior a 5% (alerta de margem estreita):**
1. A margem calculada (Lance Minimo - Custo) / Custo e inferior a 5%.
2. Sistema exibe warning amarelo: "Margem apertada (< 5%). Risco de prejuizo com custos adicionais."

**FE-05 — Desconto maximo de 100% (lance minimo = R$ 0):**
1. No passo 6, usuario informa desconto de 100%.
2. Sistema calcula Valor Minimo = R$ 0,00 e exibe alerta bloqueante.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 3 (Lances) — Card Estrutura de Lances

#### Layout da Tela

[Aba: "Lances"] icon Target [ref: Passo 1]

[Card: "Selecionar Item-Produto"] icon Package [ref: Passo 2]
  [Select: "Vinculo Item <-> Produto"]

[Card: "Sugestoes IA para Lances"] icon Sparkles
  > Nota: mesma estrutura do Card "Precificacao Assistida por IA" (UC-P11)

[Card: "Estrutura de Lances"] icon Target [ref: Passo 3]
  [Secao: "Lance Inicial (Camada D)"]
    [Select: "Modo"] — "Valor Absoluto" / "% da Referencia" [ref: Passo 3]
    [Campo: "Valor Inicial (R$)"] — text [ref: Passo 4]
  [Secao: "Lance Minimo (Camada E)"]
    [Select: "Modo"] — "Valor Absoluto" / "% Desconto Maximo" [ref: Passo 5]
    [Campo: "Valor Minimo (R$)"] — condicional [ref: Passo 6]
    [Campo: "Desconto Maximo (%)"] — condicional, placeholder "36.67" [ref: Passo 6]
  [Botao: "Salvar Lances"] icon Check [ref: Passo 7]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Lances"] | 1 |
| [Select: "Vinculo Item <-> Produto"] | 2 |
| [Select: "Modo"] (lance inicial) | 3 |
| [Campo: "Valor Inicial (R$)"] | 4 |
| [Select: "Modo"] (lance minimo) | 5 |
| [Campo: "Valor Minimo"] / [Campo: "Desconto Maximo"] | 6 |
| [Botao: "Salvar Lances"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---
