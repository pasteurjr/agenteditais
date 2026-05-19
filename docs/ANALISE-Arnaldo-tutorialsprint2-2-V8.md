# Análise das Observações do Arnaldo — tutorialsprint2-2 V8 (Sprint 2)

**Data:** 2026-05-19
**Documento analisado:** `docs/Arnaldo tutorialsprint2-2 V8.docx` (validador Arnaldo, Conjunto 2 / Bio-Hosp)
**Tutorial base:** `docs/tutorialsprint2-2 V8.md` (UC-CV01 a CV13 — Captação e Validação de Editais)
**Método:** cada observação cruzada com o **código real** (`backend/app.py`, `backend/tools.py`, `frontend/src/pages/CaptacaoPage.tsx`, `ValidacaoPage.tsx`), não apenas com o tutorial.

**Legenda:** ✅ **PROCEDE** (problema existe) · ⚠️ **PARCIAL** (premissa correta com nuance) · ❌ **NÃO PROCEDE** (premissa incorreta / já existe)

---

## Resumo executivo

De ~40 observações em 13 UCs: a **grande maioria PROCEDE**. Identificados **5 bugs graves de backend** e várias lacunas de UX. Causa-raiz transversal importante: **falta a extração do texto completo do PDF do edital** — quando só o aviso PNCP é capturado, resumo/Q&A/riscos/classificação degradam (afeta obs CV11-5/6, CV13-8/9/10).

| UC | Observação resumida | Veredito |
|----|---------------------|----------|
| CV01-1 | Duplicidade PNCP no dropdown, comportamentos distintos | ✅ PROCEDE |
| CV01-2a | NCM digitado zera a busca | ✅ PROCEDE (bug) |
| CV01-2b | Filtro UF não é respeitado (traz outros estados) | ✅ **PROCEDE — bug grave** |
| CV01-3 | Sem botão "Limpar busca / Resetar filtros" | ✅ PROCEDE (UX) |
| CV01-4 | Sem mensagem de "nenhum resultado"; loading sem fim | ⚠️ PARCIAL |
| CV01-5 | Busca sem score traz estados fora do critério | ✅ PROCEDE (= CV01-2b) |
| CV01-6 | Fonte=TODAS mas só PNCP retorna | ⚠️ PARCIAL |
| CV01-7 | Lista não diferencia ativo/encerrado | ❌ NÃO PROCEDE |
| CV01-8 | Tabela cortada (colunas finais não aparecem) | ✅ PROCEDE (UX) |
| CV02-9 | Score só aparece ao clicar no edital | ❌ NÃO PROCEDE / PARCIAL |
| CV02-10 | Rolagem horizontal ruim (barra só no fim) | ✅ PROCEDE (UX) |
| CV02-11 | Título do edital repete o nome do órgão | ✅ PROCEDE (bug) |
| CV02-12 | Produto "GEN-2024-PRO" alucinado; alguns sem produto | ✅ PROCEDE (bug) |
| CV03-13 | Salvar em LOTE não atualiza badge "salvo" | ✅ **PROCEDE — bug** |
| CV04-14 | "Definir estratégia" só na Captação, não nos salvos | ✅ PROCEDE |
| CV04-15 | Estratégia salva não persiste ao reabrir painel | ✅ **PROCEDE — bug** |
| CV06-1/2 | Score mínimo do monitoramento não tem 30%/40% | ✅ PROCEDE |
| CV06-3 | Sem botão Editar; "Atualizar" só recarrega | ✅ PROCEDE |
| CV06-4 | Exclusão sem confirmação | ✅ PROCEDE (UX) |
| CV07-5/6 | Busca de editais salvos exige acento | ✅ **PROCEDE — bug** |
| CV08-7 | Falta motivo "Boa aderência técnica" | ✅ PROCEDE |
| CV08-8/10 | Decisão GO/Avaliação não persiste | ✅ **PROCEDE — bug grave** |
| CV08-9 | Motivo/Detalhes vazam do edital anterior | ✅ **PROCEDE — bug** |
| CV09-11 | Aba Lotes auto-lista; sem botão "Importar" claro | ⚠️ PARCIAL (UX) |
| CV09-12 | IA agrupa tudo em 1 lote; não persiste; sem editar | ✅ **PROCEDE — bug grave** |
| CV09-13 | Descrição do lote duplicada ("Lote 01 — Lote 01 —") | ✅ PROCEDE (bug) |
| CV09-14 | Mover/consolidar lote inviável (só 1 lote) | ✅ PROCEDE (consequência) |
| CV10-2 | Passo 3 redundante com passo 2 | ✅ PROCEDE |
| CV10-3 | Botão certidões não diferencia certidões | ⚠️ PARCIAL |
| CV11-4 | Edital com abertura passada não deveria constar | ✅ PROCEDE |
| CV11-5 | Data de abertura diverge (aba Riscos × resumo IA) | ✅ PROCEDE |
| CV11-6 | Sem seção "Falhas Fatais" | ❌ NÃO PROCEDE (existe, condicional) |
| CV12-7 | Análise IA contradiz risco de pagamento da reputação | ✅ **PROCEDE — bug lógico** |
| CV13-8 | Q&A não acha resposta (mas justifica) | ✅ PROCEDE (consequência da CV13-9) |
| CV13-9 | Só tem o aviso, não o edital completo | ✅ **PROCEDE — causa-raiz transversal** |
| CV13-10 | Classificação frágil ("Aluguel Simples") | ✅ PROCEDE |
| CV13-11 | Histórico de Q&A é apagado | ✅ **PROCEDE — bug** |

---

## UC-CV01 — Buscar editais

### Obs 1 — Duplicidade PNCP no dropdown, comportamentos distintos — ✅ PROCEDE
O seed cria **uma** fonte PNCP (`models.py:3639-3646`, `id='pncp'`, `nome='PNCP'`). A 2ª entrada ("PNCP – Portal Nacional…") foi criada via `tool_cadastrar_fonte` (`tools.py:1985-2013`) sem dedup robusto. O comportamento divergente tem causa raiz em `_buscar_editais_multifonte` (`app.py:2184-2188`): `buscar_scraper` testa `fonte_lower in _fontes_com_api` com igualdade exata da tupla — a 2ª entrada não casa → `buscar_pncp=False`, cai só no scraper restrito ao domínio gov.br (2 resultados, fonte "www.gov.br"); a 1ª usa a API PNCP (22 resultados).
**O que fazer:** deduplicar `FonteEdital` por nome normalizado (impedir 2ª PNCP); ou no `_buscar_editais_multifonte` detectar PNCP por substring (`'pncp' in fonte_lower`) também para `buscar_scraper`/`buscar_pncp`, igual ao fix obs30b já aplicado para ComprasNet.

### Obs 2a — NCM digitado zera a busca — ✅ PROCEDE (bug)
`CaptacaoPage.tsx:1014-1015`: o NCM é **concatenado na string do termo** (`termoBusca += " NCM " + ncm`). Isso polui a query da Search API PNCP e o filtro local de palavras → zero resultados. Não há parâmetro NCM real no backend (`buscar_editais_rest` não lê `ncm`).
**O que fazer:** ou remover o campo NCM da busca (não suportado), ou tratá-lo como filtro estruturado real (não concatenar no termo textual).

### Obs 2b — Filtro UF não é respeitado — ✅ **PROCEDE — bug grave**
`buscar_editais_rest` lê `uf` (`app.py:9792`) e repassa, mas em `tool_buscar_editais_fonte` (`tools.py:2044-2354`) o parâmetro **`uf` nunca é usado** — não há nenhum `if uf:` filtrando. O `uf` acaba só decorativo no JSON de resposta. Por isso a busca com UF=SP traz MG/GO/RS.
**O que fazer:** aplicar filtro real por UF em `tool_buscar_editais_fonte` (ou pós-filtro em `_buscar_editais_multifonte`, onde já há filtro de modalidade/tipo_produto). **Bug de maior impacto da Sprint 2.**

### Obs 3 — Sem botão Limpar/Resetar — ✅ PROCEDE (UX)
Não existe handler de reset em `CaptacaoPage.tsx`. **O que fazer:** botão "Limpar filtros" que zera termo/uf/fonte/ncm/score.

### Obs 4 — Sem mensagem de "nenhum resultado" — ⚠️ PARCIAL
Existe SIM uma mensagem, mas frágil: o backend retorna `success: len(editais)>0` (`app.py:2538`); zero → `success:false` → frontend lança erro genérico. O `emptyMessage` da grade (`CaptacaoPage.tsx:2339`) está dentro de `{resultados.length>0}` → nunca aparece. **O que fazer:** backend retornar `success:true` + lista vazia; frontend mostrar empty-state explícito ("Nenhum edital encontrado para estes critérios").

### Obs 5 — Estados fora do critério sem score — ✅ PROCEDE (mesma raiz de 2b)

### Obs 6 — Fonte=TODAS mas só PNCP — ⚠️ PARCIAL
O código TENTA BEC e ComprasNet (`app.py:2226-2280`), mas elas retornam vazio/erro com frequência (cobertura baixa), sobrando só PNCP+scraper. **O que fazer:** expor `erros_fontes` (já existe no JSON, `app.py:10045`) na UI para transparência ("BEC: indisponível").

### Obs 7 — Não diferencia ativo/encerrado — ❌ NÃO PROCEDE
Existe: coluna "Prazo" renderiza `<StatusBadge label="Encerrado">` quando `e.status==="encerrado"` (`CaptacaoPage.tsx:1927,331`). **O que fazer:** apenas tornar o badge mais evidente (não é ausência de funcionalidade).

### Obs 8 — Tabela cortada — ✅ PROCEDE (UX)
13 colunas sem coluna fixa/sticky (`CaptacaoPage.tsx:1836-2035`); painel lateral reduz a área e agrava o overflow. **O que fazer:** coluna de ações sticky + container de scroll horizontal no topo (relaciona com a melhoria #2 do relatório de UX).

---

## UC-CV02 — Painel lateral

### Obs 9 — Score só ao clicar — ❌ NÃO PROCEDE / PARCIAL
Score **é** coluna da grade (`CaptacaoPage.tsx:1934-1997`), mas só renderiza se `tipoScore!=="nenhum"`. Procede só no cenário "busquei sem score". **O que fazer:** quando busca sem score, indicar "—" com tooltip "calcule o score" em vez de vazio.

### Obs 10 — Rolagem horizontal ruim — ✅ PROCEDE (UX) — mesma raiz da Obs 8

### Obs 11 — Título repete o órgão — ✅ PROCEDE (bug)
`CaptacaoPage.tsx:2353-2354`: `title=numero` / `subtitle=orgao`. O `numero` vem de `tools.py:2238-2239` com fallback ao `titulo_raw` completo (que inclui o órgão) quando o regex `n[ºo°]` não casa → repetição. **O que fazer:** melhorar a extração do número do edital; se não houver número, usar o objeto (não o título cru com órgão).

### Obs 12 — Produto alucinado "GEN-2024-PRO" — ✅ PROCEDE (bug)
`produto_principal` vem do LLM em `_score_batch` (`tools.py:4151-4157`) como texto livre, sem validar contra o portfólio real. **O que fazer:** validar o nome retornado contra produtos cadastrados; se não casar, não exibir produto (ou marcar "sugestão IA").

---

## UC-CV03 — Salvar edital

### Obs 13 — Salvar em LOTE não atualiza badge — ✅ **PROCEDE — bug**
`handleSalvarEdital` individual faz `setResultados(...)` e atualiza o badge (`CaptacaoPage.tsx:1269-1281`). Já `handleSalvarTodos`/`handleSalvarRecomendados`/"Salvar Selecionados" (`:1290-1304,2323-2329`) só iteram e dão `alert(...)` **sem `setResultados`** → boxes não recebem badge.
**O que fazer:** após o salvar em lote, atualizar `setResultados` marcando `editalSalvoId` dos itens salvos (replicar a lógica do individual).

---

## UC-CV04 — Definir estratégia

### Obs 14 — "Definir estratégia" só na Captação — ✅ PROCEDE
O fluxo de estratégia existe só no painel da `CaptacaoPage.tsx` (`:1306-1375`). Não há nada em `ValidacaoPage.tsx`/lista de salvos. **O que fazer:** expor "Definir estratégia" também na lista de editais salvos / na ValidacaoPage.

### Obs 15 — Estratégia não persiste ao reabrir painel — ✅ **PROCEDE — bug**
`handleSalvarEstrategia` (`CaptacaoPage.tsx:1354-1367`) grava `estrategiaId` mas **não atualiza** `intencaoEstrategica`/`margemExpectativa` no estado; ao reabrir o painel lê os valores antigos. Só "reaparece" após nova busca (cross-ref com `/api/editais/salvos`). **O que fazer:** no `handleSalvarEstrategia`, atualizar também `intencaoEstrategica`/`margemExpectativa` via `setResultados`/`setPainelEdital`.

---

## UC-CV06 — Gerir monitoramentos

### Obs 1/2 — Score mínimo sem 30%/40% — ✅ PROCEDE
`CaptacaoPage.tsx:2902-2908`: opções fixas 0(Todos)/50/60/70/80. **O que fazer:** adicionar 30 e 40 às opções (alinhar com os limiares de score do sistema).

### Obs 3 — Sem Editar; "Atualizar" só recarrega — ✅ PROCEDE
Não há botão Editar por monitoramento; "Atualizar" (`:3068-3069`) só chama `carregarMonitoramentos` (refresh). **O que fazer:** implementar edição de monitoramento (ou renomear "Atualizar" → "Recarregar lista" para não enganar).

### Obs 4 — Exclusão sem confirmação — ✅ PROCEDE (UX)
`crudDelete("monitoramentos")` direto, sem `confirm()` (`:3026-3051`). Inconsistente: a exclusão de **lote** já tem `window.confirm` (`ValidacaoPage.tsx:1153`). **O que fazer:** padronizar confirmação em todas as exclusões.

---

## UC-CV07 — Listar editais salvos

### Obs 5/6 — Busca exige acento — ✅ **PROCEDE — bug**
`ValidacaoPage.tsx:531-534` filtra com `.toLowerCase().includes(...)` **sem normalizar acento**. O fix da obs2 (`norm()` NFD) **já foi aplicado no `PortfolioPage.tsx:257-258` mas NÃO na `ValidacaoPage`**. **O que fazer:** replicar o mesmo helper `norm()` (normalize NFD) no filtro de editais salvos. (Fix conhecido, baixo risco — é o mesmo da obs2 já entregue.)

---

## UC-CV08 — Calcular scores e decidir

### Obs 7 — Falta motivo "Boa aderência técnica" — ✅ PROCEDE
Lista de motivos (`ValidacaoPage.tsx:940-951`): preco_competitivo, portfolio_aderente, margem_insuficiente, falta_documentacao, concorrente_forte, risco_juridico, fora_regiao, outro. Não há "Boa aderência técnica" (≠ "Portfolio aderente"). **O que fazer:** adicionar a opção `aderencia_tecnica` ("Boa aderência técnica").

### Obs 8/10 — Decisão GO/Avaliação não persiste — ✅ **PROCEDE — bug grave**
`ValidacaoPage.tsx:646` chama `crudCreate("validacao_decisoes", ...)`, mas a tabela **`validacao_decisoes` NÃO está registrada no backend** (não está em `CRUD_TABLES`; `crud_create` retorna **HTTP 404**). O `catch` (`:666-668`) **engole o erro** com comentário `// Se tabela não existe ainda (T21 pendente no backend)` e faz `setDecisaoSalva(true)`. Badge fica verde (estado local) mas **nada persiste** — ao recarregar, some.
**O que fazer:** implementar a tabela/endpoint `validacao_decisoes` no backend (a tarefa "T21" pendente) — ou persistir a decisão num campo do próprio edital. **2º bug mais crítico da Sprint 2.**

### Obs 9 — Motivo/Detalhes vazam do edital anterior — ✅ **PROCEDE — bug**
`onRowClick` (`ValidacaoPage.tsx:2158-2175`) reseta vários estados mas **não** `justificativaMotivo`, `justificativaTexto`, `showJustificativa`, `pendingDecisao`, `decisaoSalva`. **O que fazer:** adicionar o reset desses estados ao trocar de edital.

---

## UC-CV09 — Importar itens e extrair lotes

### Obs 11 — Aba Lotes auto-lista; sem botão "Importar" claro — ⚠️ PARCIAL (UX)
`ValidacaoPage.tsx:365-376`: ao selecionar edital, um `useEffect` auto-carrega `editais-itens` do banco. O botão "Buscar Itens no PNCP" (`:1030-1062`) só aparece quando `itensEdital.length===0`. Não é a aba "importando do PNCP" — é auto-load do que já está no banco. **O que fazer:** sempre mostrar o botão "Importar/Atualizar itens do PNCP" (mesmo com itens já carregados) e deixar claro a origem dos itens.

### Obs 12 — IA agrupa tudo em 1 lote / não persiste / sem editar — ✅ **PROCEDE — bug grave (3 sub-bugs)**
- **(a)** Fallback "lote único" (`tools.py:8853-8871`) quando não há texto de PDF (`tools.py:8755-8767` exige `EditalDocumento` texto>500 chars) → sempre 1 lote em editais sem PDF (ligado à CV13-9).
- **(b)** Sem UI para editar/salvar lote (`ValidacaoPage.tsx:1118-1219` só exclui/move).
- **(c)** **Bug grave de backend:** `listar_lotes_edital` em `app.py:8894` filtra `Lote.empresa_id == empresa_id`, mas **`empresa_id` não é definido nessa função** (não chama `get_current_empresa_id()`, ao contrário de `extrair_lotes_edital` em `:8932`) → **`NameError` → 500** → frontend faz `setLotesEdital([])` → "0 lotes ao voltar" mesmo após o commit.
**O que fazer:** (c) adicionar `empresa_id = get_current_empresa_id()` em `listar_lotes_edital` (fix de 1 linha, exatamente o mesmo padrão do bug obs25 do Sprint 1); (a) depende da extração de PDF (CV13-9); (b) implementar edição de lote.

### Obs 13 — Descrição do lote duplicada — ✅ PROCEDE (bug)
Backend grava `nome` já com prefixo "Lote 01 — …" (`tools.py:8799,8860`); o frontend re-prefixa "Lote NN — {lote.nome}" (`ValidacaoPage.tsx:1125-1128`) → "Lote 01 — Lote 01 — …". **O que fazer:** o `nome` no banco não deve conter o prefixo "Lote NN —" (ou o frontend não deve re-prefixar).

### Obs 14 — Mover/consolidar inviável — ✅ PROCEDE (consequência da Obs 12a)

---

## UC-CV10 — Confrontar documentação

### Obs 1 — Badge "Exigido" funciona — ✅ PROCEDE (comportamento correto, sem ação)

### Obs 2 — Passo 3 redundante com passo 2 — ✅ PROCEDE
Passo 2 (`ValidacaoPage.tsx:1356-1393`) extrai requisitos e cruza com a base. Passo 3 (`:1394-1401`) só faz `onSendToChat("Quais documentos...")` — atalho de chat, não etapa de confronto. **O que fazer:** remover/renomear o passo 3 no tutorial, ou dar a ele função distinta real.

### Obs 3 — Botão certidões não diferencia certidões — ⚠️ PARCIAL
Backend separa documento×certidão (`app.py:11645-11673`), mas a UI reusa a mesma badge "Exigido" e há **payload suspeito**: frontend envia `{empresa_id: edital.id}` (`ValidacaoPage.tsx:1414`) — ID do edital no lugar de empresa_id. **O que fazer:** corrigir o payload (`empresa_id` real); badge visual distinta para certidões.

---

## UC-CV11 — Riscos, atas, concorrentes

### Obs 4 — Edital com abertura passada não deveria constar — ✅ PROCEDE
O filtro de encerrados (`tools.py:2160-2184`) **não considera `data_abertura`** — só data_fim_vigencia/resultado/situação. **O que fazer:** incluir critério `data_abertura < hoje` (com tolerância) na marcação de encerrado/filtro.

### Obs 5 — Data de abertura diverge (aba × resumo IA) — ✅ PROCEDE
Aba Riscos usa `edital.data_abertura` do banco; resumo IA monta prompt com a mesma data mas o LLM pode alucinar outra a partir do objeto (`app.py:6628`, `ValidacaoPage.tsx:550`). **O que fazer:** fonte única confiável de data; instruir o LLM a NÃO inferir data (usar só a fornecida).

### Obs 6 — Sem seção "Falhas Fatais" — ❌ NÃO PROCEDE
A seção existe (`ValidacaoPage.tsx:1547-1558`), mas só renderiza se `fatal_flaws.length>0`, e o prompt instrui que são raros (`app.py:12567`) + depende de PDF (`app.py:12549`). **O que fazer:** renderizar a seção sempre, com "Nenhuma falha fatal identificada" quando vazia (UX).

---

## UC-CV12 — Analisar mercado

### Obs 7 — Análise IA contradiz risco de pagamento — ✅ **PROCEDE — bug lógico**
Reputação estruturada calcula `risco_pagamento` por esfera (`app.py:12219-12222`: município → "Alto"). O texto da análise IA (`app.py:12235-12260`) é gerado por LLM livre sem receber essa regra → pode dizer o oposto ("município = risco baixo"). **O que fazer:** passar o `risco_pagamento` já calculado para o prompt do texto (amarração), ou gerar o texto a partir do valor estruturado.

---

## UC-CV13 — IA resumo e perguntas

### Obs 8 — Q&A não acha resposta — ✅ PROCEDE (consequência da Obs 9)

### Obs 9 — Só tem o aviso, não o edital completo — ✅ **PROCEDE — causa-raiz transversal**
Toda a cadeia (Q&A `app.py:6792-6805`, requisitos `:12764-12768`, riscos `:12549`, resumo `:6622-6641`) depende de `EditalDocumento.texto_extraido`. Se só o aviso PNCP foi capturado (sem download/parse do PDF do edital), tudo degrada. **O que fazer:** implementar download + extração do PDF completo do edital (não só o aviso). É a correção de **maior alcance** — destrava CV11-5/6, CV13-8/10 e melhora CV09-12a.

### Obs 10 — Classificação frágil — ✅ PROCEDE
`tool_classificar_edital` (`tools.py:6888-6941`) classifica só por keywords do `objeto+numero`; `aluguel_simples` e `aluguel_reagentes` compartilham keywords. **O que fazer:** classificar com o texto completo do edital (depende da Obs 9); desambiguar keywords de aluguel.

### Obs 11 — Histórico de Q&A apagado — ✅ **PROCEDE — bug**
Estado de slot único: `resposta`/`pergunta` (`ValidacaoPage.tsx:266-267`); cada ação faz `setResposta("")`. Não há array de histórico. **O que fazer:** trocar por uma lista acumulada de pares pergunta/resposta (não sobrescrever).

---

## Priorização recomendada

**Bugs graves de causa raiz clara (corrigir primeiro):**
1. **CV09-12c** — `empresa_id` indefinido em `listar_lotes_edital` (`app.py:8894`) → 500 → lotes "somem". Fix de 1 linha (mesmo padrão do bug obs25 já corrigido).
2. **CV01-2b** — filtro UF nunca aplicado (`tools.py` `tool_buscar_editais_fonte`). Alto impacto (busca traz estados errados).
3. **CV07-5/6** — busca de editais salvos sem acento: replicar o `norm()` NFD já existente no PortfolioPage. Baixo risco.
4. **CV03-13** — salvar em lote não atualiza badge: adicionar `setResultados` no handler de lote.
5. **CV04-15 / CV08-9** — estado não persistido/não resetado: ajustar handlers de estratégia e troca de edital.

**Bug grande (requer implementação):**
6. **CV08-8/10** — tabela `validacao_decisoes` nunca implementada no backend (T21). Decisão GO não persiste.
7. **CV13-9** — extração do PDF completo do edital (destrava CV11/CV13 em cascata). Maior alcance.

**Bugs lógicos / IA:**
8. CV12-7 (contradição risco pagamento), CV02-12 (produto alucinado), CV02-11 (título=órgão), CV09-13 (lote duplicado), CV13-11 (histórico Q&A), CV13-10 (classificação).

**UX / não-bugs:**
9. CV01-3 (limpar), CV01-4/6 (feedback vazio/fontes), CV01-8/CV02-10 (tabela), CV06-1/2/3/4 (score mínimo, editar, confirmação), CV08-7 (motivo), CV09-11 (botão importar), CV10-2/3 (redundância, payload certidões), CV11-6 (seção sempre visível).

**Não procedem:** CV01-7 (diferencia ativo/encerrado — existe), CV02-9 (score é coluna quando há score), CV11-6 (seção fatal flaws existe, é condicional).

---

*Análise gerada cruzando cada observação do Arnaldo com o código real (backend/frontend), não apenas o tutorial. Nenhum código foi modificado — este documento é diagnóstico, no mesmo formato do `docs/ANALISE-Observações tutorialsprint1-3 V8.md`.*
