---
uc_id: UC-F11
nome: "Verificar completude tecnica do produto"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1569
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F11 — Verificar completude tecnica do produto

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1569).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-017, RN-018, RN-019, RN-023, RN-033 [FALTANTE→V4]

**RF relacionados:** RF-008, RF-010, RF-012

**Regras de Negocio aplicaveis:**
- Presentes: RN-017, RN-018, RN-019
- Faltantes: RN-033 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio/compliance tecnico

### Pre-condicoes
1. Produto existente.
2. Endpoint de completude disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F07 OU UC-F08**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Usuario obtem um diagnostico de completude dos campos basicos e da mascara tecnica.
2. Recomendacoes ficam visiveis em modal dedicado.

### Botoes e acoes observadas
- `Verificar Completude`
- fechamento do modal de resultado

### Sequencia de eventos
1. Usuario aciona [Botao: "Verificar Completude"] [Icone: Search] na [Coluna: "Acoes"] da [Tabela: DataTable] ou no cabecalho do [Card: "Detalhes: {nome}"].
2. Sistema chama `getProdutoCompletude(produto.id)` e abre o [Modal: "Completude: {nome}"].
3. O modal apresenta 3 [Indicador: percentual]: Geral, Dados Basicos e Especificacoes, com cores por faixa (verde >= 80%, amarelo >= 50%, vermelho < 50%).
4. Abaixo, [Tabela: "Dados Basicos (N/M)"] lista cada campo com [Icone: CheckCircle] ou [Icone: AlertCircle] e valor.
5. Se o produto tem subclasse, [Tabela: "Especificacoes — {subclasse} (N/M)"] lista cada campo da mascara com status.
6. Se nao tem subclasse, exibe [Alerta: "Produto sem subclasse — nao e possivel verificar especificacoes"].
7. Usuario decide se deve editar (UC-F08) ou reprocessar (UC-F09) e fecha o modal com [Botao: "Fechar"].

### Fluxos Alternativos

**FA-01 — Produto sem subclasse**
1. No Passo 5, produto nao tem subclasse atribuida.
2. Score de Especificacoes = 0%.
3. Alerta informativo e exibido.

**FA-02 — Produto com todas as specs preenchidas**
1. Score Geral >= 80%.
2. Todos os indicadores em verde.
3. Nenhuma acao adicional necessaria.

### Fluxos de Excecao

**FE-01 — Endpoint de completude indisponivel**
1. `getProdutoCompletude(id)` retorna erro.
2. Modal nao abre ou exibe mensagem de erro.

**FE-02 — Produto excluido entre listagem e verificacao**
1. Produto foi excluido por outro usuario enquanto o atual tenta verificar completude.
2. Endpoint retorna 404.
3. Toast de erro exibido.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 — Modal de resultado

#### Layout da Tela

```
[Modal: "Completude: {nome}"]
  [Secao: percentuais] (grid 3 colunas)
    [Indicador: "Geral"] — percentual com cor [ref: Passo 3]
    [Indicador: "Dados Basicos"] — percentual com cor [ref: Passo 3]
    [Indicador: "Especificacoes"] — percentual com cor [ref: Passo 3]

  [Tabela: "Dados Basicos (N/M)"]
    [Coluna: icone] — CheckCircle (verde) ou AlertCircle (vermelho)
    [Coluna: campo] — nome
    [Coluna: valor] — preenchido ou "Nao preenchido" [ref: Passo 4]

  [Tabela: "Especificacoes — {subclasse} (N/M)"] (condicional)
    [Coluna: icone] — CheckCircle ou AlertCircle
    [Coluna: campo (unidade)]
    [Coluna: valor] [ref: Passo 5]

  [Alerta: "Produto sem subclasse"] (condicional) [ref: Passo 6]

  [Botao: "Fechar"] [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Verificar Completude"] | 1 |
| [Indicador: percentuais] | 3 |
| [Tabela: "Dados Basicos"] | 4 |
| [Tabela: "Especificacoes"] | 5 |
| [Alerta: sem subclasse] | 6 |
| [Botao: "Fechar"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---
