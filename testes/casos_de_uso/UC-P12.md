---
uc_id: UC-P12
nome: "Relatorio de Custos e Precos"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1358
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-P12 — Relatorio de Custos e Precos

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1358).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-15
**Ator:** Usuario

### Pre-condicoes
1. Vinculo selecionado com dados de custos/precos

### Pos-condicoes
1. Relatorio MD gerado com opcao de download

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"] ou [Aba: "Lances"], usuario clica no [Botao: "Relatorio de Custos e Precos"]. [ref: Passo 1]
2. Sistema coleta dados do vinculo: identificacao, conversao, analise IA, sugestoes, calculos. [ref: Passo 2]
3. Sistema gera documento Markdown completo com 9 secoes e abre em nova aba. [ref: Passo 3]
4. Na nova aba, usuario pode usar a toolbar para baixar em MD ou PDF. [ref: Passo 4]

### Fluxos Alternativos (V5)

**FA-01 — Relatorio gerado para lote inteiro (todos os itens):**
1. Em vez de gerar relatorio para um vinculo especifico, usuario seleciona o lote inteiro.
2. Relatorio inclui tabela consolidada com todos os itens do lote.

**FA-02 — Download em formato MD:**
1. No passo 4, usuario clica em "Baixar MD".
2. Arquivo .md e baixado para o computador.

### Fluxos de Excecao (V5)

**FE-01 — Vinculo sem dados de preco preenchidos:**
1. No passo 1, o vinculo selecionado nao tem camadas A-E definidas.
2. O relatorio e gerado com campos vazios ou "nao definido" nas secoes correspondentes.

**FE-02 — Falha na geracao do relatorio:**
1. No passo 2, o sistema nao consegue coletar todos os dados.
2. Sistema exibe toast de erro: "Erro ao gerar relatorio. Verifique os dados de precificacao."

**FE-03 — Download do PDF falha:**
1. No passo 4, a exportacao PDF gera erro.
2. Sistema exibe toast: "Erro ao exportar PDF. Tente baixar em MD."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 ou Aba 3 — botao Relatorio

#### Layout da Tela

[Botao: "Relatorio de Custos e Precos"] icon FileText [ref: Passo 1]

> Nota: O relatorio abre em nova aba do navegador com toolbar e conteudo renderizado.

[Secao: "Nova Aba — Relatorio"]
  [Botao: "Baixar MD"]
  [Botao: "Baixar PDF"]
  [Secao: "Identificacao"] — edital, orgao, item, produto
  [Secao: "Conversao de Quantidade"] — volumetria
  [Secao: "Analise de Mercado IA"] — atas e contratos
  [Secao: "Sugestoes A-E"] — valores por camada
  [Secao: "Explicacao dos Calculos"] — markup e margens
  [Secao: "Concorrentes"]
  [Secao: "Vencedores Detalhados"]
  [Secao: "Justificativa IA"]
  [Secao: "Valores Definidos"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Relatorio de Custos e Precos"] | 1 |
| Relatorio renderizado em nova aba | 3 |
| [Botao: "Baixar MD"] / [Botao: "Baixar PDF"] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---

---

# FASE 2 — PROPOSTA

---
