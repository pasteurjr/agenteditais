---
uc_id: UC-F02
nome: "Gerir contatos e area padrao"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 348
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F02 — Gerir contatos e area padrao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 348).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-022, RN-023, RN-042 [FALTANTE→V4]

**RF relacionados:** RF-001, RF-005

**Regras de Negocio aplicaveis:**
- Presentes: RN-022
- Faltantes: RN-042 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Empresa em edicao.
2. Lista de areas carregada de `/api/areas-produto`.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


### Pos-condicoes
1. Emails e telefones ficam consolidados no cadastro da empresa.
2. `area_padrao_id` passa a orientar classificacoes e buscas posteriores.

### Botoes e acoes observadas
- `Adicionar` email
- `Adicionar` telefone
- botoes de remover item por linha
- `Salvar Alteracoes`

### Sequencia de eventos
1. Usuario adiciona ou remove emails na [Secao: "Emails de Contato"] do [Card: "Informacoes Cadastrais"]: digita no [Campo: "Novo email..."] e clica [Botao: "Adicionar"]; ou clica [Icone-Acao: X] para remover um email existente.
2. Usuario adiciona ou remove telefones na [Secao: "Celulares / Telefones"]: digita no [Campo: "Novo telefone..."] e clica [Botao: "Adicionar"]; ou clica [Icone-Acao: X] para remover. (**V5 correcao: campo de telefone nao possui mascara — recomendado implementar mascara `(XX) XXXXX-XXXX` / `(XX) XXXX-XXXX`**)
3. Usuario seleciona a [Campo: "Area de Atuacao Padrao"] (select com areas do backend).
4. Usuario clica no [Botao: "Salvar Alteracoes"] no rodape do [Card: "Informacoes Cadastrais"].
5. Sistema persiste os contatos serializados e a area padrao no registro da empresa.

> **Nota:** Compartilha o mesmo [Card: "Informacoes Cadastrais"] do UC-F01.

### Fluxos Alternativos

**FA-01 — Usuario nao adiciona nenhum email nem telefone**
1. Usuario pula os Passos 1 e 2 e vai direto para Passo 3 (area padrao) ou Passo 4 (salvar).
2. Sistema aceita — campos email e telefone sao opcionais (nullable=True no modelo).
3. Registro salvo com `emails` e `celulares` vazios.

**FA-02 — Usuario remove email ou telefone existente**
1. Usuario clica [Icone-Acao: X] em um email ja cadastrado.
2. O email e removido da lista visual.
3. Ao salvar, a lista serializada nao contem mais o item removido.

**FA-03 — Area padrao nao selecionada**
1. Usuario nao altera [Campo: "Area de Atuacao Padrao"], deixando-o vazio ou com valor anterior.
2. Sistema aceita — area padrao e opcional.
3. Registro salvo com `area_padrao_id` = null ou mantido.

### Fluxos de Excecao

**FE-01 — Email em formato invalido**
1. Usuario digita email sem "@" ou com formato incorreto (ex: "joao.com").
2. Sistema valida via RN-042 (`validar_email`).
3. Exibe [Toast] ou [Alerta] vermelho: "Email em formato invalido".
4. Email NAO e adicionado a lista.

**FE-02 — Email duplicado**
1. Usuario tenta adicionar email ja existente na lista.
2. Sistema deve detectar duplicidade e nao adicionar novamente.
3. Exibe mensagem informativa.

**FE-03 — Area padrao esta vazia (lista sem opcoes)**
1. No Passo 3, o [Select: "Area de Atuacao Padrao"] nao exibe nenhuma opcao.
2. Causa: nenhuma area cadastrada em `areas_produto` para esta empresa/usuario.
3. **Correcao V5 (Arnaldo OBS-12):** Garantir que areas sejam populadas antes (UC-F13 deve vir antes, ou seed deve conter areas).

**FE-04 — Telefone com formato inconsistente (sem mascara)**
1. Usuario digita telefone sem parenteses ou hifen (ex: "11987654321").
2. Sistema aceita — nao ha mascara implementada.
3. **Correcao V5 (Arnaldo OBS-10):** Implementar mascara de telefone.

**FE-05 — Erro ao salvar (servidor indisponivel)**
1. Usuario clica "Salvar Alteracoes" mas backend nao responde.
2. Sistema exibe [Alerta] de erro.
3. Dados permanecem no formulario.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 1 de 5 (subsecoes inferiores)

#### Layout da Tela

```
[Card: "Informacoes Cadastrais"] (mesmo card de UC-F01)
  ...
  [Campo: "Area de Atuacao Padrao"] — select [ref: Passo 3]
  ...
  [Secao: "Emails de Contato"] [Icone: Mail]
    [Lista: emails existentes]
      [Texto: email] + [Icone-Acao: X] — remover [ref: Passo 1]
    [Campo: "Novo email..."] — email [ref: Passo 1]
    [Botao: "Adicionar"] [Icone: Plus] [ref: Passo 1]

  [Secao: "Celulares / Telefones"] [Icone: Phone]
    [Lista: telefones existentes]
      [Texto: telefone] + [Icone-Acao: X] — remover [ref: Passo 2]
    [Campo: "Novo telefone..."] — text [ref: Passo 2]
    [Botao: "Adicionar"] [Icone: Plus] [ref: Passo 2]

  [Botao: "Salvar Alteracoes"] — primary [ref: Passo 4]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Campo: "Novo email..."] | 1 |
| [Botao: "Adicionar" (email)] | 1 |
| [Icone-Acao: X (email)] | 1 |
| [Campo: "Novo telefone..."] | 2 |
| [Botao: "Adicionar" (telefone)] | 2 |
| [Icone-Acao: X (telefone)] | 2 |
| [Campo: "Area de Atuacao Padrao"] | 3 |
| [Botao: "Salvar Alteracoes"] | 4, 5 |

### Implementacao atual
**IMPLEMENTADO**

---
