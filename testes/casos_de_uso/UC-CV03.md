---
uc_id: UC-CV03
nome: "Salvar edital, itens e scores da captacao"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 456
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV03 — Salvar edital, itens e scores da captacao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 456).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-066

**RF relacionados:** RF-019, RF-020, RF-023

**Regras de Negocio aplicaveis:**
- Presentes: RN-066
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/captacao

### Pre-condicoes
1. Resultado de busca disponivel.
2. CRUD de `editais` e `editais-itens` disponivel.

### Pos-condicoes
1. Edital passa a existir em `editais`.
2. Itens do edital podem ser persistidos para alimentar validacao e lotes.
3. Scores da captacao podem ser salvos para evitar recalculo posterior.
4. O registro salvo passa a ser elegivel na `ValidacaoPage`.

### Botoes e acoes observadas
- `Salvar edital` por linha
- `Salvar Todos`
- `Salvar Score >= 70%`
- `Salvar Selecionados`

### Sequencia de eventos
1. Usuario escolhe salvar um edital individualmente clicando no [Icone-Acao: Save] na linha da [Tabela: "Resultados"] ou no [Botao: "Salvar Edital"] do [Card: "Painel Lateral"]. [ref: Passo 1]
2. Alternativamente, usuario clica em [Botao: "Salvar Todos"], [Botao: "Salvar Score >= 70%"] ou [Botao: "Salvar Selecionados"] na [Secao: "Acoes em Lote"]. [ref: Passo 2]
3. Sistema cria ou atualiza o registro em `editais` via CRUD. [ref: Passo 3]
4. Se houver itens na busca, sistema grava em `editais-itens`; se nao houver, tenta `POST /api/editais/{id}/buscar-itens-pncp`. [ref: Passo 4]
5. Se o edital tiver score rapido ou profundo, a tela tenta `POST /api/editais/salvar-scores-captacao`. [ref: Passo 5]
6. A UI marca o edital como salvo com [Badge: "Salvo"] e pode oferecer download do PDF. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — Edital ja existe no banco (duplicata)**
1. Usuario clica em "Salvar Edital" para um edital que ja foi salvo anteriormente.
2. Sistema detecta duplicata via numero/cnpj_orgao.
3. Sistema atualiza o registro existente em vez de criar um novo (upsert).
4. Exibe Toast: "Edital atualizado com sucesso."

**FA-02 — Salvar Todos sem nenhum resultado na tabela**
1. Usuario clica em "Salvar Todos" sem ter executado uma busca (tabela vazia).
2. Sistema exibe mensagem: "Nenhum edital para salvar. Execute uma busca primeiro."
3. Nenhuma operacao de persistencia e realizada.

**FA-03 — Salvar Score >= 70% sem editais com score alto**
1. Usuario clica em "Salvar Score >= 70%".
2. Nenhum edital na busca atual tem score >= 70%.
3. Sistema exibe Toast: "Nenhum edital com score >= 70% encontrado."

**FA-04 — Salvar Selecionados sem checkbox marcado**
1. Usuario clica em "Salvar Selecionados" sem marcar nenhum checkbox.
2. Sistema exibe mensagem: "Selecione ao menos um edital antes de salvar."

**FA-05 — Edital sem itens no PNCP**
1. Sistema tenta buscar itens no PNCP apos salvar o edital.
2. O PNCP nao retorna itens para aquele edital.
3. O edital e salvo normalmente, mas a tabela `editais_itens` fica vazia.
4. Os itens poderao ser importados manualmente na aba Lotes da ValidacaoPage.

### Fluxos de Excecao (V5)

**FE-01 — Falha de persistencia no banco de dados**
1. Usuario clica em "Salvar Edital".
2. O CRUD retorna erro (conexao com banco perdida, constraint violation, etc.).
3. Sistema exibe Toast de erro: "Erro ao salvar edital. Tente novamente."
4. O edital nao recebe badge "Salvo".

**FE-02 — Timeout ao buscar itens no PNCP**
1. Apos salvar o edital, o sistema tenta buscar itens no PNCP.
2. A requisicao para o PNCP excede o timeout.
3. O edital e salvo com sucesso, mas sem itens.
4. Sistema exibe aviso: "Edital salvo, mas nao foi possivel importar itens do PNCP."

**FE-03 — Erro ao salvar scores da captacao**
1. Sistema tenta `POST /api/editais/salvar-scores-captacao`.
2. O endpoint retorna erro.
3. O edital e salvo, mas os scores nao sao persistidos.
4. Os scores poderao ser recalculados na ValidacaoPage.

**FE-04 — Permissao negada (usuario sem perfil de escrita)**
1. Usuario com perfil somente leitura tenta salvar um edital.
2. O backend retorna HTTP 403.
3. Sistema exibe mensagem: "Voce nao tem permissao para salvar editais."

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 3 (Tabela) + Bloco 4 (Painel Lateral)

#### Layout da Tela

> Nota: Os elementos de tela estao detalhados no layout de UC-CV02. Aqui estao listados apenas os elementos diretamente envolvidos no salvamento.

[Secao: "Acoes em Lote"]
  [Botao: "Salvar Todos"] icon Save [ref: Passo 2]
  [Botao: "Salvar Score >= 70%"] icon Save [ref: Passo 2]
  [Botao: "Salvar Selecionados"] icon Save [ref: Passo 2]

[Tabela: DataTable "Resultados"]
  [Coluna: "Acoes"]
    [Icone-Acao: Save] — salvar edital individual [ref: Passo 1]

[Card: "Painel Lateral"]
  [Botao: "Salvar Edital"] [ref: Passo 1]

[Badge: "Salvo"] — aparece apos persistencia [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Icone-Acao: Save] na tabela / [Botao: "Salvar Edital"] no painel | 1 |
| [Botao: "Salvar Todos"] / [Botao: "Salvar Score >= 70%"] / [Botao: "Salvar Selecionados"] | 2 |
| [Badge: "Salvo"] | 6 |

### Persistencia observada
Tabela `editais` com campos relevantes: `numero`, `orgao`, `uf`, `objeto`, `modalidade`, `valor_referencia`, `status`, `fonte`, `url`, `pdf_url`, `pdf_path`, `cnpj_orgao`, `ano_compra`, `seq_compra`, `classe_produto_id`, `subclasse_produto_id`.
Tabela `editais_itens`: `edital_id`, `numero_item`, `descricao`, `quantidade`, `unidade_medida`, `valor_unitario_estimado`, `valor_total_estimado`, `tipo_beneficio`.

### Implementacao atual
**IMPLEMENTADO**

---
