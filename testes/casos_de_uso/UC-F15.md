---
uc_id: UC-F15
nome: "Configurar parametros comerciais, regioes e modalidades"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1963
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F15 — Configurar parametros comerciais, regioes e modalidades

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1963).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023

**RF relacionados:** RF-014, RF-016, RF-017
**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Registro de `parametros_score` disponivel.
2. Modalidades cadastradas em `modalidades_licitacao`.

### Pos-condicoes
1. Regioes, tempo de entrega, custos e modalidades ficam persistidos.
2. Esses dados podem influenciar captacao, score e decisao comercial.

### Botoes e acoes observadas
- aba `Comercial`
- `Salvar Estados`
- `Salvar Prazo/Frequencia`
- `Salvar Mercado`
- `Salvar Custos`
- `Salvar Modalidades`
- `Calcular com IA (Onda 4)` desabilitado

### Sequencia de eventos
1. Usuario acessa a [Aba: "Comercial"] [Icone: Globe] na ParametrizacoesPage.
2. No [Card: "Regiao de Atuacao"] [Icone: MapPin], usuario marca [Checkbox: "Atuar em todo o Brasil"] ou seleciona estados individuais clicando nos [Botao: UF] (27 botoes). Clica [Botao: "Salvar Estados"].
3. No [Card: "Tempo de Entrega"], usuario informa [Campo: "Prazo maximo aceito (dias)"] e [Select: "Frequencia maxima"] (Diaria, Semanal, Quinzenal, Mensal). Clica [Botao: "Salvar Prazo/Frequencia"].
4. No [Card: "Mercado (TAM/SAM/SOM)"], usuario define [Campo: "TAM"] (R$), [Campo: "SAM"] (R$) e [Campo: "SOM"] (R$). Clica [Botao: "Salvar Mercado"]. O [Botao: "Calcular com IA (Onda 4)"] esta desabilitado.
5. No [Card: "Custos e Margens"] [Icone: DollarSign], usuario informa [Campo: "Markup Padrao (%)"], [Campo: "Custos Fixos Mensais (R$)"] e [Campo: "Frete Base (R$)"]. Clica [Botao: "Salvar Custos"].
6. No [Card: "Modalidades de Licitacao Desejadas"], usuario marca [Checkbox: modalidades] (carregadas do backend). Clica [Botao: "Salvar Modalidades"].
7. Sistema salva cada bloco em `parametros_score`.

### Fluxos Alternativos

**FA-01 — Marcar "Atuar em todo o Brasil"**
1. Usuario marca checkbox "Atuar em todo o Brasil".
2. Todos os 27 estados ficam selecionados automaticamente.
3. Botoes individuais de UF podem ficar desabilitados.

**FA-02 — Selecao de estados individuais**
1. Usuario NAO marca "Todo o Brasil".
2. Seleciona estados individuais clicando em cada botao UF.
3. Apenas os estados clicados ficam ativos.

**FA-03 — Nenhuma modalidade selecionada**
1. Usuario nao marca nenhuma modalidade.
2. Sistema aceita — modalidades sao opcionais.

### Fluxos de Excecao

**FE-01 — Valor de mercado negativo**
1. Usuario informa TAM/SAM/SOM com valor negativo.
2. Sistema deveria validar (valores devem ser >= 0).

**FE-02 — Markup acima de 100%**
1. Usuario informa markup = 200.
2. Sistema aceita — nao ha limite superior implementado.

**FE-03 — Erro ao salvar bloco individual**
1. Um dos botoes "Salvar" falha.
2. Toast de erro para aquele bloco especifico.
3. Demais blocos permanecem inalterados.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 2 de 5 — "Comercial"

#### Layout da Tela

```
[Aba: "Comercial"] [Icone: Globe]

[Card: "Regiao de Atuacao"] [Icone: MapPin]
  [Checkbox: "Atuar em todo o Brasil"] [ref: Passo 2]
  [Secao: grid de 27 estados]
    [Botao: "AC"] [Botao: "AL"] ... [Botao: "TO"] [ref: Passo 2]
  [Texto: "Estados selecionados: ..."] [ref: Passo 2]
  [Botao: "Salvar Estados"] — primary [ref: Passo 2]

[Card: "Tempo de Entrega"]
  [Campo: "Prazo maximo aceito (dias)"] — number [ref: Passo 3]
  [Select: "Frequencia maxima"] — Diaria|Semanal|Quinzenal|Mensal [ref: Passo 3]
  [Botao: "Salvar Prazo/Frequencia"] — primary [ref: Passo 3]

[Card: "Mercado (TAM/SAM/SOM)"]
  [Campo: "TAM (Mercado Total)"] — text, prefix "R$" [ref: Passo 4]
  [Campo: "SAM (Mercado Alcancavel)"] — text, prefix "R$" [ref: Passo 4]
  [Campo: "SOM (Mercado Objetivo)"] — text, prefix "R$" [ref: Passo 4]
  [Botao: "Salvar Mercado"] — primary [ref: Passo 4]
  [Botao: "Calcular com IA (Onda 4)"] — desabilitado

[Card: "Custos e Margens"] [Icone: DollarSign]
  [Campo: "Markup Padrao (%)"] — number [ref: Passo 5]
  [Campo: "Custos Fixos Mensais (R$)"] — number, prefix "R$" [ref: Passo 5]
  [Campo: "Frete Base (R$)"] — number, prefix "R$" [ref: Passo 5]
  [Botao: "Salvar Custos"] — primary [ref: Passo 5]

[Card: "Modalidades de Licitacao Desejadas"]
  [Subtitulo: "Selecione as modalidades em que a empresa deseja participar"]
  [Checkbox: modalidade 1] [ref: Passo 6]
  [Checkbox: modalidade 2] [ref: Passo 6]
  ... (carregadas do backend)
  [Botao: "Salvar Modalidades"] — primary [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Comercial"] | 1 |
| [Checkbox: "Atuar em todo o Brasil"] | 2 |
| [Botao: UF] (27 botoes) | 2 |
| [Botao: "Salvar Estados"] | 2 |
| [Campo: "Prazo maximo aceito (dias)"] | 3 |
| [Select: "Frequencia maxima"] | 3 |
| [Botao: "Salvar Prazo/Frequencia"] | 3 |
| [Campo: "TAM" / "SAM" / "SOM"] | 4 |
| [Botao: "Salvar Mercado"] | 4 |
| [Campo: "Markup Padrao (%)" / "Custos Fixos" / "Frete Base"] | 5 |
| [Botao: "Salvar Custos"] | 5 |
| [Checkbox: modalidades] | 6 |
| [Botao: "Salvar Modalidades"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---
