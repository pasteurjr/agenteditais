---
uc_id: UC-F08
nome: "Editar produto e especificacoes tecnicas"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1260
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F08 — Editar produto e especificacoes tecnicas

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1260).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-011, RN-013, RN-015, RN-016, RN-023, RN-033 [FALTANTE→V4], RN-034 [FALTANTE→V4], RN-035 [FALTANTE→V4], RN-036 [FALTANTE→V4], RN-037 [FALTANTE→V4]

**RF relacionados:** RF-008, RF-012

**Regras de Negocio aplicaveis:**
- Presentes: RN-011, RN-013, RN-015, RN-016
- Faltantes: RN-033 [FALTANTE], RN-034 [FALTANTE], RN-035 [FALTANTE], RN-036 [FALTANTE], RN-037 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio

### Pre-condicoes
1. Produto existente.
2. Subclasse com mascara de campos tecnicos disponivel.

### Pos-condicoes
1. Dados basicos do produto sao atualizados.
2. Especificacoes preenchidas ficam persistidas em `produtos_especificacoes`.

### Botoes e acoes observadas
- `Editar`
- modal com `Salvar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica em [Icone-Acao: Edit2] na [Tabela: DataTable] de produtos na [Aba: "Meus Produtos"].
2. Sistema abre o [Modal: "Editar: {nome}"] e resolve a hierarquia Area -> Classe -> Subclasse do item.
3. Sistema carrega as especificacoes existentes via `getProduto(id)`.
4. Usuario altera dados basicos: [Campo: "Nome"], [Campo: "Fabricante"], [Campo: "Modelo"], [Campo: "SKU / Codigo Interno"], [Campo: "NCM"], [Campo: "Descricao"].
5. Usuario altera classificacao: [Select: "Area"], [Select: "Classe"], [Select: "Subclasse"].
6. Usuario preenche ou ajusta os campos tecnicos na [Secao: "Especificacoes Tecnicas (N campos)"] derivados da mascara da subclasse selecionada.
7. Ao clicar [Botao: "Salvar"], o sistema executa `crudUpdate("produtos", ...)` e para cada especificacao preenchida executa `crudUpdate` ou `crudCreate` em `produtos-especificacoes`.

### Fluxos Alternativos

**FA-01 — Edicao apenas de dados basicos (sem alterar specs)**
1. Usuario altera somente nome, fabricante, modelo.
2. Nao modifica especificacoes tecnicas.
3. Sistema salva apenas os dados basicos. Specs permanecem inalteradas.

**FA-02 — Mudanca de subclasse (mascara diferente)**
1. Usuario altera a subclasse do produto.
2. Sistema recarrega a mascara tecnica da nova subclasse.
3. Especificacoes anteriores que nao existem na nova mascara ficam orfas.

**FA-03 — Cancelar edicao**
1. Usuario clica [Botao: "Cancelar"] no modal.
2. Modal fecha sem salvar alteracoes.
3. Dados originais permanecem.

### Fluxos de Excecao

**FE-01 — NCM em formato invalido**
1. Usuario digita NCM fora do padrao XXXX.XX.XX (ex: "901819").
2. Validacao RN-035 rejeita ou emite warning.
3. Em modo enforce: registro NAO e salvo. Em modo warn: salva com warning no log.

**FE-02 — Nome em branco (obrigatorio)**
1. Usuario apaga o nome e tenta salvar.
2. Sistema exibe erro de validacao.
3. Modal permanece aberto.

**FE-03 — Caracteres especiais em especificacoes**
1. Usuario preenche spec com caracteres Unicode (ex: "37C", "10 uL").
2. Sistema DEVE aceitar — campos tecnicos admitem Unicode.
3. Se rejeitar, e bug.

**FE-04 — Erro de rede ao salvar**
1. Conexao cai durante PUT.
2. Modal permanece aberto com dados preenchidos.
3. Toast de erro exibido.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 1 — Modal disparado da DataTable

#### Layout da Tela

```
[Modal: "Editar: {nome}"]
  [Secao: "Dados Basicos"] (grid 2 colunas)
    [Campo: "Nome"] — text, obrigatorio [ref: Passo 4]
    [Campo: "Fabricante"] — text [ref: Passo 4]
    [Campo: "Modelo"] — text [ref: Passo 4]
    [Campo: "SKU / Codigo Interno"] — text [ref: Passo 4]
    [Campo: "NCM"] — text [ref: Passo 4]
    [Campo: "Descricao"] — text [ref: Passo 4]

  [Secao: "Classificacao"] (grid 3 colunas)
    [Select: "Area"] [ref: Passo 5]
    [Select: "Classe"] (depende de Area) [ref: Passo 5]
    [Select: "Subclasse"] (depende de Classe) [ref: Passo 5]

  [Secao: "Especificacoes Tecnicas (N campos)"] (grid 2 colunas, condicional)
    [Campo: "{campo} ({unidade})"] — text/select/boolean por tipo da mascara [ref: Passo 6]
    ... (um campo por item da mascara)

  [Botao: "Salvar"] [Icone: Save] — primary [ref: Passo 7]
  [Botao: "Cancelar"] [Icone: X]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Icone-Acao: Edit2] (DataTable) | 1 |
| [Campo: "Nome"] | 4 |
| [Campo: "Fabricante"] | 4 |
| [Campo: "Modelo"] | 4 |
| [Campo: "SKU / Codigo Interno"] | 4 |
| [Campo: "NCM"] | 4 |
| [Campo: "Descricao"] | 4 |
| [Select: "Area" / "Classe" / "Subclasse"] | 5 |
| [Campo: especificacoes da mascara] | 6 |
| [Botao: "Salvar"] | 7 |

### Observacao de implementacao
Especificacoes vazias nao sao enviadas; portanto o fluxo atual privilegia criacao e atualizacao de campos preenchidos, nao uma limpeza massiva de specs existentes.

### Implementacao atual
**IMPLEMENTADO**

---
