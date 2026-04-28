---
uc_id: UC-R03
nome: "Personalizar Descricao Tecnica (A/B)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1670
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-R03 — Personalizar Descricao Tecnica (A/B)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1670).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-040-03

**Regras de Negocio aplicaveis:**
- Presentes: RN-115
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-115

**Ator:** Usuario

### Pre-condicoes
1. Proposta gerada (UC-R01) e selecionada

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01**


### Pos-condicoes
1. Descricao tecnica personalizada com backup do original

### Sequencia de eventos
1. Na [Card: "Proposta Selecionada"], usuario localiza a [Secao: "Descricao Tecnica"]. [ref: Passo 1]
2. Por padrao, o [Toggle: "Modo"] esta em "edital" e exibe texto do edital (primeiros 500 chars). [ref: Passo 2]
3. Usuario clica no [Toggle: "Modo"] para alternar para "personalizado". [ref: Passo 3]
4. Sistema exibe [Badge: "Personalizado"] em amarelo. [ref: Passo 4]
5. O [Campo: TextArea "Descricao personalizada"] fica editavel para texto livre. [ref: Passo 5]
6. Para voltar ao original, usuario clica no toggle novamente. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Gerar Variacao B (comercial) por IA:**
1. Usuario clica em "Gerar Variacao B por IA".
2. IA gera texto comercial persuasivo com beneficios e diferenciais.
3. Variacao B fica disponivel ao lado da Variacao A (tecnica).

**FA-02 — Selecionar variacao ativa por radio button:**
1. Usuario alterna entre Variacao A (tecnica) e Variacao B (comercial) usando radio button.
2. A variacao selecionada e incluida na proposta final.
3. Ambas permanecem editaveis.

**FA-03 — Preservacao do texto ao alternar toggle:**
1. Usuario alterna de "personalizado" para "edital" e volta.
2. O texto personalizado digitado e preservado — nao se perde.

### Fluxos de Excecao (V5)

**FE-01 — IA nao gera Variacao B (timeout):**
1. A chamada para gerar Variacao B excede o timeout.
2. Sistema exibe toast: "Erro ao gerar variacao comercial. Tente novamente."

**FE-02 — Texto personalizado vazio:**
1. Usuario salva proposta com descricao personalizada em branco.
2. Sistema exibe warning: "Descricao personalizada vazia. A proposta sera enviada sem descricao."

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 3 (Proposta Selecionada) — Secao Descricao Tecnica

#### Layout da Tela

[Card: "Proposta Selecionada"]
  [Secao: "Descricao Tecnica"] [ref: Passo 1]
    [Toggle: "Modo"] — ToggleLeft (edital) / ToggleRight (personalizado) [ref: Passo 2, 3]
    [Badge: "Personalizado"] — amarelo, visivel se modo = personalizado [ref: Passo 4]
    [Secao: "Modo Edital"] — visivel se modo = edital
      [Texto: "Primeiros 500 chars do conteudo"] — readonly, fundo escuro
    [Secao: "Modo Personalizado"] — visivel se modo = personalizado
      [Campo: TextArea "Descricao personalizada"] — monospace [ref: Passo 5]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Secao: "Descricao Tecnica"] | 1 |
| [Toggle: "Modo"] (padrao: edital) | 2, 3, 6 |
| [Badge: "Personalizado"] | 4 |
| [Campo: TextArea] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---
