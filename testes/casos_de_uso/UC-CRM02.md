---
uc_id: UC-CRM02
nome: "Parametrizacoes do CRM *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2243
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CRM02 — Parametrizacoes do CRM *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2243).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-189, RN-190, RN-191, RN-192

**RF relacionado:** RF-045-02
**Ator:** Usuario (Administrador / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema com permissao de administracao
2. Pagina CRMPage acessivel
3. Empresa do usuario cadastrada no sistema

### Pos-condicoes
1. Tipos de Edital do Business parametrizados e disponiveis para classificacao
2. Agrupamentos do Portfolio cadastrados para organizacao dos editais
3. Motivos de Derrota cadastrados para registro de perdas (UC-CRM07)
4. Parametrizacoes salvas na base da empresa

### Sequencia de Eventos

1. Na CRMPage, usuario clica [Botao: "Parametrizacoes"] (icone Settings) no cabecalho ou acessa via [Aba: "Parametrizacoes"]
2. [Card: "Parametrizacoes do CRM"] exibe 3 secoes organizadas em abas internas ou accordions
3. **Secao 1 — Tipos de Edital do Business:**
   - [Card: "Tipos de Edital"] exibe [Tabela: tipos] com: Nome, Descricao, Ativo
   - Valores padrao: Aquisicao Equipamentos, Aquisicao Reag + Equip, Aquisicao Reagentes, Comodato, Locacao, Locacao + Reagentes, Manutencao, Material de Laboratorio
   - Usuario clica [Botao: "+ Novo Tipo"] — linha editavel aparece na tabela
   - Preenche [TextInput: "Nome"], [TextInput: "Descricao"]
   - Clica [Botao: "Salvar"] (icone Check)
   - [Botao: "Excluir"] (icone Trash2) remove tipo (com confirmacao)
4. **Secao 2 — Agrupamento do Portfolio:**
   - [Card: "Agrupamento do Portfolio"] exibe [Tabela: agrupamentos] com: Nome, Ativo
   - Valores padrao: Point Of Care, Gasometria, Bioquimica, Coagulacao, ELISA, Hematologia, Imunohematologia, Teste Rapido, Urinalise, Quimioluminescencia, Ion Seletivo, Aglutinacao, Diversos
   - Mesmo padrao CRUD: [Botao: "+ Novo"], linha editavel, [Botao: "Salvar"], [Botao: "Excluir"]
5. **Secao 3 — Motivos de Derrota:**
   - [Card: "Motivos de Derrota"] exibe [Tabela: motivos] com: Nome, Categoria, Ativo
   - Valores padrao: Administrativo, Exclusivo para ME/EPP, Falha operacional, Nao tem documento, Nao atende especificacao, Inviavel comercialmente, Nao tem equipamento
   - Mesmo padrao CRUD
6. Usuario clica [Botao: "Salvar Todas"] — todas as parametrizacoes sao persistidas
7. [Toast: "Parametrizacoes salvas com sucesso"] confirmacao exibida

### Fluxos Alternativos (V5)

- **FA-01 — Apenas edicao de Motivos de Derrota (sem alterar Tipos ou Agrupamentos):** Usuario edita apenas a secao 3 e clica "Salvar Todas". Secoes 1 e 2 nao sao afetadas.
- **FA-02 — Criar novo Tipo de Edital customizado:** Usuario clica "+ Novo Tipo" (passo 3), preenche "Servico Terceirizado" e salva. Novo tipo disponivel para classificacao de editais.
- **FA-03 — Desativar item parametrizado (sem excluir):** Usuario alterna toggle "Ativo" para falso. Item permanece na base mas nao aparece nas selecoes dos demais UCs.

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao salvar parametrizacoes:** Requisicao POST falha. Toast de erro "Falha ao salvar parametrizacoes. Tente novamente." Dados locais preservados.
- **FE-02 — Nome de tipo/agrupamento/motivo duplicado:** Backend rejeita duplicidade. Sistema exibe alerta "Nome ja existe. Use um nome diferente."
- **FE-03 — Exclusao de motivo em uso:** Usuario tenta excluir motivo que ja esta referenciado em perdas registradas. Sistema exibe alerta "Motivo em uso. Desative em vez de excluir."
- **FE-04 — Nome vazio em novo item:** Sistema exibe validacao "Nome e obrigatorio." Item nao e salvo.

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Secao Parametrizacoes (aba ou modal de configuracao)

#### Layout da Tela

```
[Botao: "Parametrizacoes"] (icone Settings) [ref: Passo 1]

[Card: "Parametrizacoes do CRM"] [ref: Passo 2]

  [Accordion/Aba: "Tipos de Edital do Business"] [ref: Passo 3]
    [Botao: "+ Novo Tipo"] (icone Plus, size: sm)
    [Tabela: tipos] (DataTable, editavel inline)
      [Coluna: "Nome"] — editavel
      [Coluna: "Descricao"] — editavel
      [Coluna: "Ativo"] — toggle
      [Coluna: "Acao"]
        [Botao: "Salvar"] (icone Check, size: sm)
        [Botao: "Excluir"] (icone Trash2, size: sm, variant: secondary)

  [Accordion/Aba: "Agrupamento do Portfolio"] [ref: Passo 4]
    [Botao: "+ Novo Agrupamento"] (icone Plus, size: sm)
    [Tabela: agrupamentos] (DataTable, editavel inline)
      [Coluna: "Nome"] — editavel
      [Coluna: "Ativo"] — toggle
      [Coluna: "Acao"]
        [Botao: "Salvar"] (icone Check, size: sm)
        [Botao: "Excluir"] (icone Trash2, size: sm, variant: secondary)

  [Accordion/Aba: "Motivos de Derrota"] [ref: Passo 5]
    [Botao: "+ Novo Motivo"] (icone Plus, size: sm)
    [Tabela: motivos] (DataTable, editavel inline)
      [Coluna: "Nome"] — editavel
      [Coluna: "Categoria"] — editavel
      [Coluna: "Ativo"] — toggle
      [Coluna: "Acao"]
        [Botao: "Salvar"] (icone Check, size: sm)
        [Botao: "Excluir"] (icone Trash2, size: sm, variant: secondary)

  [Botao: "Salvar Todas"] (variant: primary) [ref: Passo 6]
  [Toast: "Parametrizacoes salvas com sucesso"] — condicional [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Parametrizacoes"] | 1 |
| [Card: "Parametrizacoes do CRM"] | 2 |
| [Accordion: "Tipos de Edital"] / tabela e CRUD | 3 |
| [Accordion: "Agrupamento do Portfolio"] / tabela e CRUD | 4 |
| [Accordion: "Motivos de Derrota"] / tabela e CRUD | 5 |
| [Botao: "Salvar Todas"] | 6 |
| [Toast: confirmacao] | 7 |

### Implementacao Atual
**Nao Implementado**

---
