---
uc_id: UC-F13
nome: "Consultar classificacao e funil de monitoramento"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1747
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F13 — Consultar classificacao e funil de monitoramento

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1747).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-012, RN-023, RN-040

**RF relacionados:** RF-011, RF-012, RF-013

**Regras de Negocio aplicaveis:**
- Presentes: RN-012
- Faltantes: RN-040 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio/gestor

### Pre-condicoes
1. Areas, classes e subclasses cadastradas.
2. Monitoramentos existentes ou nao.

### Pos-condicoes
1. Usuario visualiza a arvore de classificacao parametrizada.
2. Usuario entende como a classificacao alimenta o monitoramento de mercado.

### Botoes e acoes observadas
- aba `Classificacao`
- expand/collapse em Area e Classe

### Sequencia de eventos
1. Usuario acessa a [Aba: "Classificacao"] [Icone: ClipboardList] na PortfolioPage.
2. Sistema lista areas no [Card: "Estrutura de Classificacao"] como itens expansiveis.
3. Usuario clica para expandir uma [Lista: Area] [Icone: ChevronRight -> ChevronDown] e depois uma [Lista: Classe].
4. Sistema exibe [Lista: Subclasse] com [Badge: NCM] e contagem de campos da mascara.
5. O [Card: "Funil de Monitoramento"] exibe 3 etapas: "Monitoramento Continuo" (com contagem de ativos), "Filtro Inteligente" (com [Tag: categorias de classes]) e "Classificacao Automatica" (contagem de classes). O [Badge: StatusBadge] mostra "Agente Ativo" ou "Agente Inativo" com data da ultima verificacao.

### Fluxos Alternativos

**FA-01 — Nenhuma area cadastrada**
1. No Passo 2, lista de areas esta vazia.
2. Card exibe mensagem informativa: "Nenhuma classificacao cadastrada".

**FA-02 — Agente de monitoramento inativo**
1. No Passo 5, badge mostra "Agente Inativo".
2. Comportamento esperado se monitoramento nao foi configurado.

### Fluxos de Excecao

**FE-01 — Erro ao carregar hierarquia**
1. Endpoint de areas/classes retorna erro.
2. Card exibe mensagem de erro.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 3 de 3 — "Classificacao"

#### Layout da Tela

```
[Aba: "Classificacao"] [Icone: ClipboardList]

[Card: "Estrutura de Classificacao"]
  [Subtitulo: "Area > Classe > Subclasse (com mascaras de especificacao)"]
  [Lista: Areas] (expansivel)
    [Icone: ChevronRight/Down] [Icone: FolderOpen] [Texto: nome da area] [Badge: "N classe(s)"] [ref: Passo 3]
    [Lista: Classes] (expansivel, aninhada)
      [Icone: ChevronRight/Down] [Texto: nome da classe] [Badge: "N subclasse(s)"] [ref: Passo 3]
      [Lista: Subclasses]
        [Texto: nome] [Badge: "NCM: XXXX.XX.XX"] [Badge: "N campo(s)"] [ref: Passo 4]
  [Texto: nota IA] — "A estrutura e gerenciada nos CRUDs..."

[Card: "Funil de Monitoramento"] [Icone: Radio]
  [Subtitulo: "O Agente Autonomo que Monitora o Mercado por Voce"]
  [Secao: funil 3 etapas]
    [Texto: "Monitoramento Continuo"] — contagem de ativos [ref: Passo 5]
    [Texto: "Filtro Inteligente"] + [Tag: categorias] [ref: Passo 5]
    [Texto: "Classificacao Automatica"] — N classes [ref: Passo 5]
  [Badge: StatusBadge] — "Agente Ativo" ou "Agente Inativo" [ref: Passo 5]
  [Texto: "Ultima verificacao"] — data/hora [ref: Passo 5]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Classificacao"] | 1 |
| [Card: "Estrutura de Classificacao"] | 2 |
| [Lista: Area expand/collapse] | 3 |
| [Lista: Classe expand/collapse] | 3 |
| [Lista: Subclasse + NCM + campos] | 4 |
| [Card: "Funil de Monitoramento"] | 5 |
| [Badge: StatusBadge agente] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---
