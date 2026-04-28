---
uc_id: UC-F07
nome: "Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1102
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F07 — Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1102).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-011, RN-013, RN-014, RN-015, RN-016, RN-023, RN-035 [FALTANTE→V4]

**RF relacionados:** RF-006, RF-010

**Regras de Negocio aplicaveis:**
- Presentes: RN-011, RN-013, RN-014, RN-015, RN-016
- Faltantes: RN-035 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario de portfolio

### Pre-condicoes
1. Usuario autenticado.
2. Servicos de IA e chat operacionais.
3. Opcionalmente classificacao por subclasse informada para melhorar a mascara de extracao.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Um ou mais produtos podem ser cadastrados a partir de documento ou website.
2. Especificacoes tecnicas podem ser extraidas automaticamente.
3. Resposta da IA fica visivel inline e a lista de produtos e atualizada.

### Fontes de entrada implementadas
- `Manual Tecnico`
- `Instrucoes de Uso / IFU`
- `Nota Fiscal (NFS)`
- `Plano de Contas (ERP)`
- `Folder / Catalogo`
- `Website do Fabricante`

### Botoes e acoes observadas
- aba `Cadastro por IA`
- seletor `Tipo de Documento`
- upload de arquivo ou campo `URL do Website`
- classificacao opcional `Area`, `Classe`, `Subclasse`
- `Processar com IA`
- fechamento manual da resposta inline

### Sequencia de eventos
1. Usuario acessa a [Aba: "Cadastro por IA"] na PortfolioPage.
2. Usuario escolhe o tipo de origem no [Campo: "Tipo de Documento"] (select: Manual Tecnico, Instrucoes de Uso, Nota Fiscal, Plano de Contas, Folder/Catalogo, Website).
3. Se a origem for documental, usuario seleciona um arquivo no [Campo: "Arquivo"] e opcionalmente informa o [Campo: "Nome do Produto (opcional)"].
4. Se a origem for website, usuario informa a URL no [Campo: "URL do Website"].
5. Usuario pode informar [Select: "Area"], [Select: "Classe"] e [Select: "Subclasse"] na [Secao: "Classificacao (opcional)"]; quando informa Subclasse, ela e enviada para melhorar a extracao conforme a mascara tecnica.
6. Ao clicar no [Botao: "Processar com IA"], o sistema cria uma sessao `cadastro-produto`.
7. Para `website`, o sistema usa `sendMessage(session_id, "Busque produtos no website ... e cadastre")`.
8. Para `manual`, `instrucoes`, `folders`, `nfs` e `plano_contas`, o sistema escolhe um prompt especifico por tipo e envia `sendMessageWithFile(session_id, prompt, arquivo, subclasse_id?)`.
9. O retorno textual da IA e mostrado inline em [Texto: resposta IA] (markdown renderizado com botao fechar).
10. Em seguida a tela executa `fetchProdutos()` para recarregar a grade na [Aba: "Meus Produtos"].

### Fluxos Alternativos

**FA-01 — Cadastro via website (sem arquivo)**
1. Usuario seleciona tipo "Website".
2. Campos de upload de arquivo ficam ocultos.
3. Campo "URL do Website" aparece como obrigatorio.
4. Classificacao opcional nao e enviada no prompt para website.

**FA-02 — Cadastro sem nome de produto (Plano de Contas)**
1. Usuario seleciona tipo "Plano de Contas (ERP)".
2. Nao preenche campo "Nome do Produto".
3. Sistema aceita — nome e opcional para este tipo.
4. IA pode extrair multiplos itens do arquivo.

**FA-03 — Classificacao nao informada**
1. Usuario nao seleciona Area/Classe/Subclasse.
2. Sistema processa sem mascara tecnica — extracao e generica.
3. Produto cadastrado pode nao ter especificacoes detalhadas.

### Fluxos de Excecao

**FE-01 — Servico de IA indisponivel**
1. Usuario clica "Processar com IA" mas servico de chat/IA esta offline.
2. Sistema exibe [Toast] de erro: "Servico de IA indisponivel".
3. Nenhum produto e cadastrado.

**FE-02 — Timeout no processamento de IA**
1. IA demora mais de 90 segundos para responder.
2. Sistema pode exibir timeout ou spinner indefinido.
3. Usuario pode tentar novamente.

**FE-03 — Arquivo corrompido ou ilegivel**
1. Usuario faz upload de PDF corrompido.
2. IA nao consegue extrair informacoes.
3. Resposta inline indica que nao foi possivel processar o documento.

**FE-04 — URL de website invalida ou inacessivel**
1. Usuario informa URL que nao existe ou esta offline.
2. IA retorna erro de acesso.
3. Nenhum produto e cadastrado.

**FE-05 — NCM extraido pela IA em formato invalido**
1. IA cadastra produto com NCM fora do formato XXXX.XX.XX.
2. Validacao RN-035 emite warning (modo warn-only).
3. Produto e cadastrado mas NCM pode precisar correcao manual.

### Tela(s) Representativa(s)

**Pagina:** PortfolioPage (`/app/portfolio`)
**Posicao:** Tab 2 de 3 — "Cadastro por IA"

#### Layout da Tela

```
[Aba: "Cadastro por IA"] [Icone: Sparkles]

[Card: "Cadastro por IA"]
  [Subtitulo: "Faca upload de documentos e a IA extrai automaticamente os dados do produto"]

  [Campo: "Tipo de Documento"] — select [ref: Passo 2]
    opcoes: Manual Tecnico | Instrucoes de Uso | Nota Fiscal | Plano de Contas | Folder/Catalogo | Website

  (se website)
  [Campo: "URL do Website"] — url, obrigatorio [ref: Passo 4]

  (se documental)
  [Campo: "Arquivo"] — file input (aceita por tipo) [ref: Passo 3]
  [Texto: info do arquivo] — nome e tamanho
  [Campo: "Nome do Produto (opcional)"] — text [ref: Passo 3]

  [Secao: "Classificacao (opcional)"] [Icone: Filter] (somente documental)
    [Select: "Area"] [ref: Passo 5]
    [Select: "Classe"] (depende de Area) [ref: Passo 5]
    [Select: "Subclasse"] (depende de Classe) [ref: Passo 5]

  [Botao: "Processar com IA"] [Icone: Sparkles] — primary [ref: Passo 6]

  [Toast: processamento] — "Processando..." com spinner (condicional) [ref: Passo 6]
  [Texto: resposta IA] — markdown renderizado com [Botao: fechar] [ref: Passo 9]

[Texto: dica cadastro manual] — informativo
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Cadastro por IA"] | 1 |
| [Campo: "Tipo de Documento"] | 2 |
| [Campo: "Arquivo"] | 3 |
| [Campo: "Nome do Produto (opcional)"] | 3 |
| [Campo: "URL do Website"] | 4 |
| [Select: "Area" / "Classe" / "Subclasse"] | 5 |
| [Botao: "Processar com IA"] | 6 |
| [Toast: processamento] | 6 |
| [Texto: resposta IA] | 9 |

### Observacoes de implementacao
- Este UC e distinto do simples cadastro manual porque a pagina possui um fluxo proprio de extracao automatica.
- `nfs` e `plano_contas` admitem extracao de multiplos itens a partir de um unico arquivo.
- Para `website`, a classificacao opcional por subclasse nao e enviada no prompt atual.

### Implementacao atual
**IMPLEMENTADO**

---
