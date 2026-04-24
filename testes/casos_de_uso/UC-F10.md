---
uc_id: UC-F10
nome: "Consultar ANVISA e busca web a partir da tela de portfolio"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1464
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F10 — Consultar ANVISA e busca web a partir da tela de portfolio

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1464).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023

**RF relacionados:** RF-007, RF-010
**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto selecionado ou dados de consulta informados.
2. Servicos de IA e chat disponiveis.

### Pos-condicoes
1. Usuario obtem resposta sobre ANVISA ou busca web.
2. A lista de produtos e recarregada ao final da consulta.

### Botoes e acoes observadas
- `Buscar ANVISA`
- `Buscar na Web`
- modal ANVISA com confirmacao
- modal Busca Web com confirmacao

### Sequencia de eventos
1. Usuario clica no [Botao: "Buscar ANVISA"] [Icone: Shield] no cabecalho da PortfolioPage.
2. Sistema abre o [Modal: "Registros de Produtos pela ANVISA"] com [Campo: "Numero de Registro ANVISA"] e [Campo: "ou Nome do Produto"].
3. Ao clicar [Botao: "Buscar via IA"] [Icone: Shield], o sistema cria sessao `busca-anvisa` e envia prompt textual.
4. O retorno e mostrado inline em [Texto: resposta IA] (markdown).
5. Usuario clica no [Botao: "Buscar na Web"] [Icone: Globe] no cabecalho.
6. Sistema abre o [Modal: "Buscar Produto na Web"] com [Campo: "Nome do Produto"] (obrigatorio) e [Campo: "Fabricante (opcional)"].
7. Ao clicar [Botao: "Buscar via IA"] [Icone: Globe], o sistema cria sessao `busca-web` e envia prompt.
8. O retorno tambem e exibido inline em [Texto: resposta IA].

### Fluxos Alternativos

**FA-01 — Busca ANVISA somente por nome (sem numero)**
1. Usuario nao informa numero de registro.
2. Informa apenas o nome do produto.
3. IA busca por nome — resultados podem ser multiplos.

**FA-02 — Busca web sem fabricante**
1. Usuario nao informa fabricante (campo opcional).
2. IA busca apenas pelo nome do produto.

### Fluxos de Excecao

**FE-01 — Registro ANVISA nao encontrado**
1. Numero informado nao existe na base ANVISA.
2. IA retorna mensagem informativa: "Registro nao encontrado".
3. Nenhum dado e atualizado.

**FE-02 — Busca web sem resultados**
1. Nome do produto muito especifico ou inexistente na web.
2. IA retorna: "Nenhum resultado encontrado".

**FE-03 — Servico de IA indisponivel**
1. Chat offline. Modal nao retorna resposta.
2. Toast de erro exibido.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Cabecalho da pagina + Modais

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Botao: "Buscar ANVISA"] [Icone: Shield] [ref: Passo 1]
  [Botao: "Buscar na Web"] [Icone: Globe] [ref: Passo 5]

[Modal: "Registros de Produtos pela ANVISA"]
  [Texto: "A IA tenta trazer os registros e o usuario valida ou complementa."]
  [Campo: "Numero de Registro ANVISA"] — text [ref: Passo 2]
  [Campo: "ou Nome do Produto"] — text [ref: Passo 2]
  [Botao: "Buscar via IA"] [Icone: Shield] — primary [ref: Passo 3]
  [Botao: "Cancelar"]

[Modal: "Buscar Produto na Web"]
  [Texto: "A IA busca informacoes do produto na web e cadastra automaticamente."]
  [Campo: "Nome do Produto"] — text, obrigatorio [ref: Passo 6]
  [Campo: "Fabricante (opcional)"] — text [ref: Passo 6]
  [Botao: "Buscar via IA"] [Icone: Globe] — primary [ref: Passo 7]
  [Botao: "Cancelar"]

[Texto: resposta IA] — inline, markdown [ref: Passo 4, 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Buscar ANVISA"] | 1 |
| [Campo: "Numero de Registro ANVISA"] | 2 |
| [Campo: "ou Nome do Produto"] (ANVISA) | 2 |
| [Botao: "Buscar via IA" (ANVISA)] | 3 |
| [Texto: resposta IA] | 4, 8 |
| [Botao: "Buscar na Web"] | 5 |
| [Campo: "Nome do Produto"] (web) | 6 |
| [Campo: "Fabricante (opcional)"] | 6 |
| [Botao: "Buscar via IA" (web)] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---
