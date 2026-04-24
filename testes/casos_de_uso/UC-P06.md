---
uc_id: UC-P06
nome: "Definir Valor de Referencia (Camada C)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 722
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P06 — Definir Valor de Referencia (Camada C)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 722).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-09

**Regras de Negocio aplicaveis:**
- Presentes: RN-096, RN-097
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-096, RN-097, RN-098, RN-102, RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Preco Base definido (UC-P05)

### Pos-condicoes
1. Target estrategico definido

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], usuario localiza o [Card: "Valor de Referencia"]. [ref: Passo 1]
2. Sistema exibe o [Campo: "Valor Referencia (R$)"] com hint "Importado do edital" se disponivel ou "Nao disponivel no edital". [ref: Passo 2]
3. Alternativamente, usuario preenche [Campo: "OU % sobre Preco Base"] para calcular o target. [ref: Passo 3]
4. Usuario clica no [Botao: "Salvar Target"]. [ref: Passo 4]

### Fluxos Alternativos (V5)

**FA-01 — Valor importado automaticamente do edital:**
1. No passo 2, o sistema preenche automaticamente o valor de referencia com o valor estimado do edital (importado no UC-CV09).
2. O hint exibe "Importado do edital".
3. Usuario pode aceitar ou sobrescrever.

**FA-02 — Modo percentual sobre preco base:**
1. No passo 3, usuario preenche "% sobre Preco Base" (ex: 107 para 7% acima).
2. Sistema calcula automaticamente: Valor Referencia = Preco Base x (% / 100).
3. O campo "Valor Referencia (R$)" e preenchido automaticamente com o resultado.

**FA-03 — Modo percentual negativo (desconto sobre preco base):**
1. No passo 3, usuario preenche percentual negativo (ex: -18).
2. Sistema calcula: Valor Referencia = Preco Base x (1 - 0,18).
3. Indicador visual vermelho se C < B (margem potencialmente negativa).

### Fluxos de Excecao (V5)

**FE-01 — Valor de referencia abaixo do custo total:**
1. O valor de referencia (C) e menor que o custo total (A + tributos + frete).
2. Sistema exibe alerta warning: "Valor de referencia abaixo do custo total. Margem negativa!"
3. Indicador visual vermelho aparece.

**FE-02 — Edital sem valor estimado (referencia nao disponivel):**
1. No passo 2, o edital nao possui valores estimados por item.
2. Sistema exibe hint "Nao disponivel no edital".
3. Usuario deve preencher manualmente ou usar modo percentual.

**FE-03 — Percentual zerado:**
1. Usuario preenche "% sobre Preco Base" = 0.
2. Sistema calcula valor = R$ 0,00 e exibe alerta.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Valor de Referencia

#### Layout da Tela

[Card: "Valor de Referencia"] icon Target [ref: Passo 1]
  [Campo: "Valor Referencia (R$)"] — text, placeholder "Target estrategico", hint contextual [ref: Passo 2]
  [Campo: "OU % sobre Preco Base"] — text, placeholder "95" [ref: Passo 3]
  [Botao: "Salvar Target"] icon Check [ref: Passo 4]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Valor de Referencia"] | 1 |
| [Campo: "Valor Referencia (R$)"] | 2 |
| [Campo: "OU % sobre Preco Base"] | 3 |
| [Botao: "Salvar Target"] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---
