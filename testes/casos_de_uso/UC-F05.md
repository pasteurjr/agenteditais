---
uc_id: UC-F05
nome: "Gerir responsaveis da empresa"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 808
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F05 — Gerir responsaveis da empresa

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 808).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-004, RN-005, RN-006, RN-023, RN-029 [FALTANTE→V4], RN-030 [FALTANTE→V4]

**RF relacionados:** RF-003

**Regras de Negocio aplicaveis:**
- Presentes: RN-004, RN-005, RN-006
- Faltantes: RN-029 [FALTANTE], RN-030 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa existente **e vinculada ao usuario corrente** (registro ativo em `usuario_empresa`).
2. CRUD de `empresa-responsaveis` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Responsaveis ficam vinculados a empresa.
2. Dados podem ser reutilizados nas rotinas documentais e operacionais.

### Botoes e acoes observadas
- `Adicionar`
- `Editar`
- `Excluir`
- modal com `Salvar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica no [Botao: "Adicionar"] no cabecalho do [Card: "Responsaveis"] para abrir o [Modal: "Adicionar Responsavel"].
2. Usuario preenche [Campo: "Tipo"] (select: Representante Legal, Preposto, Responsavel Tecnico), [Campo: "Nome"] (obrigatorio), [Campo: "Cargo"], [Campo: "Email"] (obrigatorio) e [Campo: "Telefone"]. (**V5 nota: campo CPF existe no formulario mas e opcional — tutorial deve incluir CPFs ficticios ou instruir que e opcional**)
3. Usuario clica no [Botao: "Salvar"]. Sistema cria registro em `empresa_responsaveis`.
4. A [Tabela: DataTable] e recarregada mostrando o novo responsavel.
5. Usuario pode clicar [Icone-Acao: Pencil] para editar (abre o mesmo modal com titulo "Editar Responsavel") ou [Icone-Acao: Trash2] para excluir registros existentes.

### Fluxos Alternativos

**FA-01 — Cadastro de apenas dois responsaveis (sem Preposto)**
1. Usuario cadastra Representante Legal e Responsavel Tecnico.
2. Nao cadastra Preposto.
3. Sistema aceita — Preposto NAO e obrigatorio.
4. Lista exibe dois responsaveis sem mensagem de alerta.

**FA-02 — Edicao de responsavel existente**
1. Usuario clica [Icone-Acao: Pencil] em responsavel ja cadastrado.
2. Modal "Editar Responsavel" abre com dados pre-preenchidos.
3. Usuario altera campos desejados e clica "Salvar".
4. Sistema atualiza o registro via `crudUpdate`.

**FA-03 — Campo CPF deixado em branco**
1. No Passo 2, usuario nao preenche campo CPF.
2. Sistema aceita — CPF e nullable=True, nao esta em `required`.
3. Registro salvo com CPF = null.

### Fluxos de Excecao

**FE-01 — CPF invalido (digito verificador incorreto)**
1. Usuario informa CPF com formato correto mas digito errado (ex: `000.000.000-00`).
2. Sistema valida via RN-029 (`validar_cpf`).
3. Exibe [Toast] ou [Alerta]: "CPF invalido".
4. Registro NAO e salvo.

**FE-02 — Nome em branco (campo obrigatorio)**
1. Usuario tenta salvar sem preencher [Campo: "Nome"].
2. Sistema exibe erro de validacao.
3. Modal permanece aberto.

**FE-03 — Email em formato invalido**
1. Usuario informa email incorreto (ex: "joao@").
2. Sistema valida via RN-042.
3. Exibe erro e nao salva.

**FE-04 — Permissao negada (usuario sem papel admin)**
1. Usuario com papel `operador` tenta adicionar responsavel.
2. Backend verifica `_is_admin` = False.
3. Retorna erro 403: "Apenas administradores podem criar este recurso".
4. **Nota V5 (Arnaldo OBS-20):** O validador reportou esse erro, mas valida2 e super+admin. Provavel erro de operacao (empresa nao selecionada ou token expirado).

**FE-05 — Exclusao de responsavel referenciado**
1. Usuario tenta excluir responsavel vinculado a outros registros.
2. Se houver constraint FK, backend retorna erro.
3. Exibe mensagem de erro.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 5 de 5

#### Layout da Tela

```
[Card: "Responsaveis"]
  [Botao: "Adicionar"] [Icone: Plus] — header action [ref: Passo 1]
  [Tabela: DataTable]
    [Coluna: "Nome"]
    [Coluna: "Tipo"] — label traduzido
    [Coluna: "Cargo"]
    [Coluna: "Email"]
    [Coluna: "Telefone"]
    [Coluna: "Acoes"]
      [Icone-Acao: Pencil] — editar [ref: Passo 5]
      [Icone-Acao: Trash2] — excluir [ref: Passo 5]

[Modal: "Adicionar Responsavel" / "Editar Responsavel"]
  [Campo: "Tipo"] — select (Representante Legal, Preposto, Responsavel Tecnico) [ref: Passo 2]
  [Campo: "Nome"] — text, obrigatorio [ref: Passo 2]
  [Campo: "Cargo"] — text [ref: Passo 2]
  [Campo: "Email"] — email, obrigatorio [ref: Passo 2]
  [Campo: "Telefone"] — text [ref: Passo 2]
  [Botao: "Salvar"] — primary [ref: Passo 3]
  [Botao: "Cancelar"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Adicionar"] | 1 |
| [Campo: "Tipo"] (modal) | 2 |
| [Campo: "Nome"] (modal) | 2 |
| [Campo: "Cargo"] (modal) | 2 |
| [Campo: "Email"] (modal) | 2 |
| [Campo: "Telefone"] (modal) | 2 |
| [Botao: "Salvar"] (modal) | 3 |
| [Tabela: DataTable responsaveis] | 4 |
| [Icone-Acao: Pencil] | 5 |
| [Icone-Acao: Trash2] | 5 |

### Persistencia observada
Tabela `empresa_responsaveis`: `empresa_id`, `nome`, `cargo`, `cpf`, `email`, `telefone`, `tipo`.

### Implementacao atual
**IMPLEMENTADO**

---
