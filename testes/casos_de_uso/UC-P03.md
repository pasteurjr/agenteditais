---
uc_id: UC-P03
nome: "Calculo Tecnico de Volumetria"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 418
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-P03 — Calculo Tecnico de Volumetria

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 418).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-088, RN-089, RN-090
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-088, RN-089, RN-090

**Ator:** Usuario

### Pre-condicoes
1. Lote configurado com itens e produtos vinculados (UC-P01 + UC-P02)
2. Produtos tem campo "rendimento por kit" preenchido no portfolio

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P01**
- **UC-P02**


### Pos-condicoes
1. Quantidade de kits calculada com arredondamento ceil para cada item
2. Dados alimentam as camadas de preco (UC-P04/P05)

### Sequencia de eventos
1. Usuario clica na [Aba: "Custos e Precos"] no painel de abas. [ref: Passo 1]
2. Usuario seleciona um vinculo item-produto no [Select: "Vinculo Item <-> Produto"] do [Card: "Selecionar Item-Produto"]. [ref: Passo 2]
3. No [Card: "Conversao de Quantidade"], usuario escolhe entre [Botao: "Preciso de Volumetria"] ou [Botao: "Nao Preciso"]. [ref: Passo 3]
4. Se precisa, usuario preenche [Campo: "Quantidade do Edital"], [Campo: "Rendimento por Embalagem"], [Campo: "Rep. Amostras"], [Campo: "Rep. Calibradores"] e [Campo: "Rep. Controles"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Calcular e Salvar"]. [ref: Passo 5]
6. Sistema calcula volume real ajustado e quantidade de kits (ceil) e exibe resultado. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Sem volumetria (item unitario / equipamento):**
1. No passo 3, usuario seleciona "Nao Preciso".
2. Sistema usa a quantidade do edital diretamente, sem calculo de conversao.
3. Fator de conversao = 1.0.

**FA-02 — Deteccao automatica de tipo de produto:**
1. O sistema detecta automaticamente se o produto e equipamento (unidade), acessorio consumivel ou kit/reagente.
2. Badge correspondente ("Unidade", "Kit/Reagente", "Acessorio consumivel") e exibido.
3. Para equipamentos, volumetria nao e necessaria (fator 1.0).

**FA-03 — Edicao manual do fator de conversao:**
1. Apos o calculo automatico, usuario edita manualmente o campo de fator de conversao.
2. O volume total e recalculado automaticamente com o novo fator.

### Fluxos de Excecao (V5)

**FE-01 — Rendimento por embalagem igual a zero:**
1. No passo 4, usuario informa rendimento = 0.
2. Sistema exibe erro: "Rendimento por embalagem deve ser maior que zero."
3. O calculo nao e executado.

**FE-02 — Campo de quantidade do edital vazio:**
1. No passo 4, usuario deixa o campo "Quantidade do Edital" em branco.
2. Sistema exibe validacao: "Quantidade do edital e obrigatoria."

**FE-03 — Repeticoes negativas:**
1. Usuario informa valor negativo em Rep. Amostras, Calibradores ou Controles.
2. Sistema exibe erro: "Valores de repeticao devem ser >= 0."

**FE-04 — Produto sem rendimento cadastrado no portfolio:**
1. No passo 2, o produto vinculado nao tem campo "rendimento por kit" preenchido.
2. Sistema exibe warning: "Produto sem rendimento cadastrado. Preencha manualmente."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Conversao de Quantidade

#### Layout da Tela

[Aba: "Custos e Precos"] icon DollarSign

[Card: "Selecionar Item-Produto"] icon Package [ref: Passo 2]
  [Select: "Vinculo Item <-> Produto"] — lista de vinculos confirmados

[Card: "Conversao de Quantidade"] icon BarChart3 [ref: Passo 3]
  [Botao: "Preciso de Volumetria"] — card selecionavel [ref: Passo 3]
  [Botao: "Nao Preciso"] — card selecionavel [ref: Passo 3]
  [Secao: "Formulario Volumetria"] — visivel se "Preciso" selecionado
    [Campo: "Quantidade do Edital"] — text, placeholder "Qtd exigida" [ref: Passo 4]
    [Campo: "Rendimento por Embalagem"] — text, placeholder "Unidades por embalagem/kit" [ref: Passo 4]
    [Campo: "Rep. Amostras"] — text, placeholder "0" [ref: Passo 4]
    [Campo: "Rep. Calibradores"] — text, placeholder "0" [ref: Passo 4]
    [Campo: "Rep. Controles"] — text, placeholder "0" [ref: Passo 4]
    [Botao: "Calcular e Salvar"] icon BarChart3 [ref: Passo 5]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Custos e Precos"] | 1 |
| [Select: "Vinculo Item <-> Produto"] | 2 |
| [Botao: "Preciso de Volumetria"] / [Botao: "Nao Preciso"] | 3 |
| [Campo: "Quantidade/Rendimento/Rep. Amostras/Calibradores/Controles"] | 4 |
| [Botao: "Calcular e Salvar"] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---
