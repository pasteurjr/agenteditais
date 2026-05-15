# Análise das Observações — tutorialsprint1-3 V8

**Data da análise:** 2026-05-15
**Documento analisado:** `docs/Observações tutorialsprint1-3 V8.docx` (validador Arnaldo/Argus)
**Tutorial base:** `docs/tutorialsprint1-3 V8.md`
**Método:** cada observação cruzada com o **código real** do agenteditais (frontend `PortfolioPage.tsx`/`ParametrizacoesPage.tsx`, backend `app.py`/`tools.py`/`crud_routes.py`/`models.py`), não apenas com o tutorial.

**Legenda de veredito:**
- ✅ **PROCEDE** — o problema existe no código, precisa correção
- ⚠️ **PROCEDE PARCIAL** — premissa correta mas com nuance / melhoria de UX
- ❌ **NÃO PROCEDE** — premissa incorreta ou já resolvido
- 🟢 **JÁ CORRIGIDO** — corrigido nesta sessão (commits 6f8f64f / f3b5dcb / 3a1be34)

---

## Resumo executivo

| UC | Obs | Veredito | Tipo |
|----|-----|----------|------|
| F06 | 1 — falta lupa clicável | ✅ PROCEDE | UX |
| F06 | 2 — busca exige acento | ✅ PROCEDE | Bug |
| F07 | 3 — máscara NCM não formata no upload | ⚠️ PARCIAL | Bug |
| F07 | 4 — PDF não extrai produtos; CSV/Excel erro | ✅ PROCEDE | Bug grave |
| F07 | 5 — NF multi-item cadastra só 1 + subclasse aleatória | ✅ PROCEDE | Bug grave |
| F07 | 6 — categoria não editável | ✅ PROCEDE | Feature |
| F07 | 7 — upload não determinístico, muda tipo de doc | ✅ PROCEDE | Bug (LLM) |
| F07 | 8 — sempre 1 item de ordem aleatória | ✅ PROCEDE | Bug grave |
| F09 | 9 — specs alucinadas; não cita fonte | ⚠️ PARCIAL | Bug/UX |
| F09 | 10 — reprocessar APAGA specs existentes | ✅ PROCEDE | Bug grave |
| F09 | 11 — desabilitar reprocessar com fonte externa | ❌ NÃO PROCEDE | Premissa incorreta |
| F09 | 12 — sem upload/specs adicionais pós-cadastro | ✅ PROCEDE | Feature |
| F10 | 13 — Busca Web não deve cadastrar auto | ⚠️ PARCIAL | UX |
| F10 | 14 — buscas sem resultado ANVISA/web | 🟢 JÁ CORRIGIDO | Config |
| F11 | 15 — farol de completude na lista | ✅ PROCEDE | Feature |
| F11 | 16 — filtro por nível de completude | ✅ PROCEDE | Feature |
| F11 | 17 — produto sem specs mostra 100% completude | ✅ PROCEDE | Bug |
| F12 | 24 — não há edição de CATMAT/CATSER/termos | 🟢 JÁ CORRIGIDO | — |
| F12 | 25 — palavras-chave CATMAT excludentes | ⚠️ PARCIAL | Bug/melhoria |
| F15 | 27 — fonte branca + desmarcar UF | ✅ PROCEDE | UX/Bug |
| F15 | 28 — máscara nos campos de valor | ✅ PROCEDE | UX |
| F16 | 30 — ComprasNet reativa sozinho após salvar | ✅ PROCEDE | Bug grave |

**Bugs graves de código:** Obs 4, 5, 8 (upload mono-produto/só-PDF), Obs 10 (reprocessar destrutivo), Obs 17 (completude 100% falso), Obs 30 (`ativa`/`ativo` não persiste).
**Já resolvido nesta sessão:** Obs 14 (Serper→Brave), Obs 24 (edição de metadados).

---

## UC-F06 — Listar e filtrar produtos

### Obs 1 — "Passo 3: incluir lupa para clicar e executar a busca" — ✅ PROCEDE
A busca de produtos é **só por digitação reativa**, sem botão de submit.
- `frontend/src/components/common/FilterBar.tsx:33-41` — o `<Search size={16}/>` é **decorativo** (não é `<button>`, sem `onClick`); `<input onChange>` filtra por tecla.
- `PortfolioPage.tsx:1026-1029` usa esse FilterBar; filtro client-side em `:229-263`.

**O que fazer:** tornar o ícone de lupa um `<button>` clicável que dispara a busca (ou apenas manter como está e ajustar o tutorial para dizer "a busca é automática ao digitar"). Como é UX simples, recomenda-se adicionar o botão clicável envolvendo o ícone Search no `FilterBar.tsx` chamando `onSearchChange` com o valor atual (no-op funcional, mas atende a expectativa do usuário). Atualizar tutorial UC-F06 Passo 3.

### Obs 2 — "Passo 4: a busca está exigindo a palavra com acentuação" — ✅ PROCEDE
Filtro sem normalização de acento.
- `PortfolioPage.tsx:231-245` — só `.toLowerCase().includes(term)`; sem `.normalize('NFD')`/remoção de diacríticos.
- Backend CRUD `crud_routes.py:1127-1135` — `field.ilike(f"%{q}%")` também acento-sensível conforme collation.

**O que fazer:** normalizar acento no filtro client-side (função `normalize` removendo diacríticos via `.normalize('NFD').replace(/[̀-ͯ]/g,'')`) aplicada tanto ao termo quanto ao campo comparado em `PortfolioPage.tsx:231-245`. Correção localizada e segura.

---

## UC-F07 — Cadastrar produto por IA (upload)

### Obs 3 — "máscara NCM não formata os pontos sozinhos após 8 dígitos" — ⚠️ PROCEDE PARCIAL
- A máscara existe e está **correta**, mas só no **modal de edição** (`PortfolioPage.tsx:1760-1767`: digits[0:4]+"."+[4:6]+"."+[6:] → `9018.19.90`).
- O **formulário de cadastro por upload IA** (`:1320-1410`) **não tem campo NCM nem máscara** — NCM vem da extração IA/`campos_mascara` da subclasse no backend (`tools.py:1236-1248`).

**O que fazer:** se o tutorial Passo 02 V4 instrui digitar NCM no cadastro por upload, ou (a) adicionar campo NCM com a mesma máscara nesse formulário, ou (b) corrigir o tutorial para esclarecer que NCM é extraído pela IA e a máscara só aparece ao editar o produto depois. Recomenda-se (b) — menor risco, alinhado ao design atual.

### Obs 4 — "PDF não extrai produtos (nome 'Produtos'); CSV/Excel dão erro" — ✅ PROCEDE (grave)
Dois defeitos confirmados:
1. **CSV/Excel não suportados.** `accept` declara `.xlsx,.xls,.csv` (`PortfolioPage.tsx:25-26`) mas backend só processa PDF: `tool_processar_upload` → `_extrair_texto_por_paginas` (PyMuPDF, só PDF, `tools.py:1164-1170`); `/api/chat-upload` usa `fitz.open` (`app.py:8009-8017`). Sem parser CSV/XLSX → erro.
2. **Nome genérico.** Fallback `{"nome":"Produto"}` (`tools.py:497,507,1181`) quando IA não identifica nome.

**O que fazer:**
- Curto prazo: remover `.csv,.xlsx,.xls` do `accept` dos UPLOAD_TYPES (`PortfolioPage.tsx:25-26`) para não prometer formato não suportado + mensagem clara "apenas PDF".
- Médio prazo: implementar parser CSV/XLSX em `tool_processar_upload` (pandas/openpyxl) extraindo múltiplos produtos.
- Atualizar tutorial UC-F07 Passo 04 informando que só PDF é suportado hoje.

### Obs 5 — "NF com 5 produtos, cadastrou só 1; subclasse aleatória" — ✅ PROCEDE (grave)
- `tool_processar_upload` cria **exatamente 1** `Produto` (`tools.py:1331-1340`, único `db.add`), sem laço sobre itens. Usa só primeiros 10000 chars (`:1178-1179`).
- Subclasse por heurística de score: se `melhor_score >= 10` atribui mesmo com match fraco (`tools.py:1315-1317`).

**O que fazer:** funcionalidade multi-item exige redesenho do `tool_processar_upload` para extrair lista de produtos (ou rotear NF/plano de contas para `/api/upload-lote-ia`). Zona sensível (extração IA) — recomenda-se planejar como feature dedicada, não correção pontual. Endurecer o threshold de subclasse (exigir score maior ou confirmar com usuário) reduz a "subclasse aleatória".

### Obs 6 — "cria categoria automaticamente, sem opção de editar" — ✅ PROCEDE
`categoria` definida automaticamente (`tools.py:1186-1193`); modal de edição (`PortfolioPage.tsx:1748-1796`) não tem campo `categoria` (só leitura em `:1068`).

**O que fazer:** adicionar campo `categoria` editável no modal de edição, análogo ao que foi feito com CATMAT/termos na Obs 24 (mesmo padrão `crudUpdate("produtos",...)`). Correção de baixo risco.

### Obs 7 — "uploads repetidos dão resultados/tipo de doc diferentes" — ✅ PROCEDE
Classificação de intenção/tipo via LLM **não determinística**: `detectar_intencao_ia` → `call_deepseek` (`app.py:7972,484-488`); `_extrair_info_produto` → `call_deepseek` (`tools.py:486-487`). Sem `temperature=0`/seed/cache.

**O que fazer:** fixar `temperature=0` nas chamadas de classificação/extração estrutural e/ou adicionar cache por hash do conteúdo. Melhora determinismo sem mudar arquitetura. (Não elimina 100% a variância do LLM, mas reduz muito.)

### Obs 8 — "sempre 1 item de ordem aleatória independente do tipo" — ✅ PROCEDE (grave)
Mesma causa da Obs 5. O `tipoDocumento` só muda `prompt`/`accept` (`PortfolioPage.tsx:293-297`); backend não ramifica para extração multi-item. Existe `/api/upload-lote-ia` (`app.py:10636`) mas itera **arquivos**, não itens dentro de um PDF, e **não é** o caminho do botão de upload do Portfolio (que usa `/api/chat-upload`).

**O que fazer:** mesma recomendação da Obs 5 (feature multi-item). Documentar no tutorial a limitação atual.

---

## UC-F09 — Reprocessar especificações via IA

### Obs 9 — "specs novas não estavam no doc/chat; deve citar fontes" — ⚠️ PARCIAL
- **Não busca fora:** `tool_reprocessar_produto` (`tools.py:1463-1525`) usa só texto local (documento salvo / `texto_extraido` / descrição). As 2 specs extras são provável **alucinação do LLM**, não fonte externa.
- **Não cita fonte:** toda spec recebe badge fixo "IA" (`PortfolioPage.tsx:1105`), sem origem (documento/página).

**O que fazer:** (a) reduzir alucinação com `temperature` baixa no `_extrair_specs_em_chunks`; (b) registrar origem da spec (ex.: nome do documento + página) e exibir no badge/tooltip em vez de só "IA". Melhoria de rastreabilidade.

### Obs 10 — "reprocessar incluiu novas e APAGOU as existentes" — ✅ PROCEDE (grave)
`tools.py:1503-1510`:
```python
db.query(ProdutoEspecificacao).filter(
    ProdutoEspecificacao.produto_id == produto_id
).delete()
specs_salvas = _extrair_specs_em_chunks(texto_specs, produto_id, db)
```
**DELETE incondicional de todas as specs** antes de inserir. Specs manuais (UC-F08 Passo 5) são destruídas. Sem merge/upsert.

**O que fazer:** trocar o delete cego por **merge**: manter specs existentes, adicionar/atualizar apenas as novas por chave `nome_especificacao` (upsert). Alternativa mínima: só deletar specs cuja origem seja "IA" e preservar as editadas manualmente (requer flag de origem). Correção de causa raiz clara e localizada.

### Obs 11 — "desabilitar reprocessar com fonte externa" — ❌ NÃO PROCEDE
Premissa incorreta: `tool_reprocessar_produto` **já não busca fora do sistema** (só documento/descrição local — `tools.py:1463-1510`). O `handleReprocessar` (`PortfolioPage.tsx:328-331`) roteia para `processar_reprocessar_produto` (`app.py:3336-3405`) sem `_web_search`. Os botões "Buscar na Web"/"Buscar ANVISA" são função separada (UC-F10).

**O que fazer:** nenhuma mudança de código. Esclarecer no tutorial/resposta ao validador que reprocessar **não** acessa web. (A confusão pode vir do nome "Reprocessar IA".)

### Obs 12 — "sem upload/criar specs adicionais pós-cadastro; só na subclasse" — ✅ PROCEDE
Card de detalhes (`PortfolioPage.tsx:1044-1122`): ações só Reprocessar IA / Verificar Completude / Preços / Excluir. Tabela de specs **somente leitura** (`:1091-1114`). Upload só na aba "Cadastro por IA" (cadastro inicial).

**O que fazer:** feature — adicionar no card de detalhes (a) input de upload de documento adicional que reprocessa em modo *append* (depende da Obs 10) e (b) UI para adicionar spec manual ao produto. Escopo de feature, planejar dedicado.

---

## UC-F10 — Buscar Web / Buscar ANVISA

### Obs 13 — "Busca Web não deve cadastrar automaticamente; mostrar p/ escolher" — ⚠️ PARCIAL
`handleBuscaWebConfirm` (`PortfolioPage.tsx:539-560`) → `processar_buscar_web` (`app.py:1774-1824`) → `tool_web_search`. O retorno **lista links/PDFs como texto** (`app.py:1787-1819`); o cadastro só ocorre numa 2ª etapa manual (usuário cola URL no chat). **Não há cadastro automático imediato**, mas também **não há UI de seleção** (checkbox de specs/fontes pra validar).

**O que fazer:** UX — criar tela/modal de resultados com seleção (checkbox) do que incorporar ao produto, em vez do fluxo "copie a URL no chat". Melhoria de UX, não bug.

### Obs 14 — "buscas sem resultado ANVISA/web" — 🟢 JÁ CORRIGIDO (esta sessão)
Causa confirmada: `_web_search_serper` com Serper **sem créditos** → `except: return []` (`tools.py:112-114`) → zero resultados **sem erro visível**. Já alterado nesta sessão: `.env:26 SCRAPE_API=brave` (antes `serper`); `_web_search_brave` (`tools.py:180-215`) implementado corretamente; `BRAVE_API_KEY` configurada (`.env:36`).

**O que fazer:** validar em runtime que a cota Brave está ativa (rodar uma busca real Web + ANVISA pela UI). Nenhuma mudança de código adicional. Se ANVISA continuar vazio mesmo com Brave, investigar o filtro `filetype:pdf` forçado em `tool_web_search` (`tools.py:520`) — porém a busca ANVISA usa search direto (`app.py:3888-3895`), não sofre esse filtro.

---

## UC-F11 — Verificar completude

### Obs 15 — "farol de % de completude na lista (cor na lupa)" — ✅ PROCEDE (feature)
Grade não tem indicador de completude por linha (`PortfolioPage.tsx:748-823`); ícone lupa "Verificar Completude" (`:818`) tem cor fixa. Completude só em modal sob demanda (`:1631-1660`).

**O que fazer:** feature — colorir o ícone de completude por faixa (verde/amarelo/vermelho) calculando o % na listagem (exige o endpoint de completude retornar na listagem ou cálculo client-side). Médio esforço.

### Obs 16 — "filtro por nível de completude (amarelo/vermelho)" — ✅ PROCEDE (feature)
Filtros atuais: texto + "Sem Classe" (`PortfolioPage.tsx:931-985`); sem filtro de completude (`:229-262`).

**O que fazer:** feature dependente da Obs 15 (precisa do % na listagem). Adicionar filtro por faixa de completude.

### Obs 17 — "produto sem specs mostra 100% completude em Especificações" — ✅ PROCEDE (BUG)
`tools.py:6851`:
```python
pct_mascara = round((mascara_preenchidos / len(mascara_check)) * 100) if mascara_check else 100
```
`mascara_check` vazio (produto sem `subclasse_id` ou subclasse sem máscara) → força **100%**. Deveria ser 0% (ou N/A).

**O que fazer:** corrigir o fallback `else 100` → `else 0` (ou retornar `None`/"N/A" e exibir adequadamente no frontend `:1659-1660`). Correção de 1 linha, causa raiz clara. **Atenção:** `tools.py` contém funções em zona protegida — esta função de completude não é financeira/governamental, mas confirmar contra `.claude-protected` antes de aplicar (não está na lista de funções protegidas).

---

## UC-F12 — Metadados

### Obs 24 — "não há campo para inserir/editar CATMAT, CATSER, palavras-chave" — 🟢 JÁ CORRIGIDO (commit 6f8f64f)
UI de edição implementada nesta sessão em `PortfolioPage.tsx`:
- Estados `editingMetadados/editCatmat/editCatser/editTermos` (`:85-88`)
- `handleAbrirEdicaoMetadados` (`:348-356`), `handleCancelarEdicaoMetadados` (`:358-361`), `handleSalvarMetadados` (`:364-386`, PUT via `crudUpdate`)
- Botão "✏ Editar metadados manualmente" (`:1139-1148`); inputs CATMAT (`:1168-1175`), CATSER (`:1203-1210`), Termos (`:1226-1233`); botões Salvar/Cancelar (`:1252-1273`)
- Documentado em `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V8.md` (FA-02/FA-03/FE-03)

**O que fazer:** nada — sanado. Garantir que o tutorial V8/V9 reflita a nova UI (o tutorial atual ainda diz "read-only de CATMAT/CATSER/termos" no CHANGELOG V4 — atualizar para a capacidade de edição).

### Obs 25 — "palavras-chave do CATMAT não podem ser excludentes; devem ampliar" — ⚠️ PARCIAL
`app.py:9764-9862` ("Buscas paralelas extras com termos CATMAT/semânticos"):
- **Complementa** (bom): busca primária usa termo do usuário; termos CATMAT disparam buscas extras e `editais.extend(filtered)` (`:9839`) + dedupe (`:9844-9861`).
- **Mas re-filtra** (limitante): cada edital trazido por termo CATMAT é re-filtrado exigindo conter palavra do termo original (`:9833-9838`); só roda se `tipo_score != "nenhum"` (`:9765`); descarta termos genéricos (`:9801-9811`).

**O que fazer:** remover/afrouxar o re-filtro de `:9833-9838` para que termos CATMAT realmente **ampliem** o leque (trazer editais que casam com o termo CATMAT mesmo sem conter a palavra digitada), deixando o score de aderência classificar o interesse — exatamente o que o validador pede. **Atenção:** lógica de busca de editais + score é área sensível (aderência) — propor diff e validar com cuidado, não aplicar cego.

---

## UC-F15 — Parametrização (Estados/UF + valores)

Arquivo: `frontend/src/pages/ParametrizacoesPage.tsx` (aba "comercial").

### Obs 27 — "fonte branca nas caixinhas + desmarcar UF após selecionar todos" — ✅ PROCEDE
- **Cor:** `.estado-btn` (`globals.css:5751-5762`) não define `color` (herda tema, baixo contraste); branco só em `.estado-btn.selected` (`:5772`).
- **Desmarcar:** `toggleEstado` aborta se `todoBrasil` (`ParametrizacoesPage.tsx:697 if (todoBrasil) return;`) e botões ficam `disabled={todoBrasil}` (`:1015`). "Atuar em todo o Brasil" trava desseleção individual.

**O que fazer:** (a) definir `color:#fff` (ou cor de alto contraste) no `.estado-btn` base no `globals.css`; (b) permitir desmarcar UF individual após "todo o Brasil" — ao desmarcar uma UF, sair do modo `todoBrasil` e manter as demais selecionadas (ajustar `toggleEstado` e remover `disabled`). UX/Bug de baixo risco.

### Obs 28 — "colocar máscaras nos campos de valores (pontos e vírgulas)" — ✅ PROCEDE
Campos TAM/SAM/SOM (`ParametrizacoesPage.tsx:1055-1063`) usam `<TextInput prefix="R$">`; `FormField.tsx:35-58` — `prefix` é só `<span>` cosmético, `onChange` repassa valor cru sem formatação de milhar/decimal.

**O que fazer:** aplicar máscara monetária pt-BR (separador de milhar `.`, decimal `,`) nos campos de valor — criar componente/máscara reutilizável ou usar lib de máscara já presente no projeto. Formatar exibição e converter para número no envio (padrão entrada/exibição/trânsito do projeto).

---

## UC-F16 — Fontes de Busca (ativar/desativar)

### Obs 30 — "ComprasNet reativa sozinho após salvar e voltar" — ✅ PROCEDE (BUG grave)
Causa raiz: incompatibilidade de nome de campo **`ativa` (frontend) vs `ativo` (modelo)**.
- Modelo `FonteEdital.ativo` (`models.py:411`).
- Frontend lê `f.ativa ?? true` (`ParametrizacoesPage.tsx:274`) e escreve `crudUpdate("fontes-editais", id, { ativa: !fonte.ativa })` (`:638`) — tudo no feminino.
- `crud_update` só aplica chaves que batem com colunas reais (`crud_routes.py:1459-1467` itera `model.__table__.columns`, `if col.name in data`). `data` traz `ativa`, coluna é `ativo` → **nada é gravado** (PUT 200 mas no-op).
- Na releitura, serializa `ativo`; frontend lê `f.ativa` (inexistente) → `undefined ?? true` → **sempre "Ativa"**. Sintoma exato relatado.
- **Agravante:** a busca multifonte (`app.py:~2152-2289`) nem consulta `FonteEdital.ativo` — usa flags fixas. Mesmo persistindo, desativar ComprasNet não o excluiria da busca padrão.

**O que fazer:**
1. Alinhar o nome do campo: no frontend usar `ativo` (ler `f.ativo`, escrever `{ ativo: !fonte.ativo }`) em `ParametrizacoesPage.tsx:274,638` — correção mínima de causa raiz.
2. Fazer a busca multifonte (`app.py`) respeitar `FonteEdital.ativo` ao montar as fontes consultadas — senão a desativação não tem efeito funcional. **Atenção:** integração com sistemas governamentais (ComprasNet/PNCP) é zona sensível — propor diff e validar, não aplicar cego.

---

## Recomendações de priorização

**Correções pontuais de causa raiz (baixo risco, alto valor):**
1. Obs 17 — `else 100` → `else 0` em `tools.py:6851` (1 linha)
2. Obs 30 (parte 1) — `ativa`→`ativo` no frontend (`ParametrizacoesPage.tsx:274,638`)
3. Obs 2 — normalização de acento no filtro (`PortfolioPage.tsx:231-245`)
4. Obs 6 — campo categoria editável (mesmo padrão da Obs 24)
5. Obs 10 — reprocessar fazer merge em vez de delete cego (`tools.py:1503-1510`)
6. Obs 27 — cor branca + desmarcar UF (`globals.css` + `ParametrizacoesPage.tsx`)

**Já resolvido (validar em runtime):**
- Obs 14 (Brave) — rodar busca Web/ANVISA real pela UI
- Obs 24 (edição metadados) — confirmado por código

**Apenas ajustar tutorial / resposta ao validador (não é bug):**
- Obs 11 (reprocessar não busca web — esclarecer)
- Obs 3 (NCM extraído pela IA — esclarecer no Passo 02 V4)

**Features (planejar dedicado, escopo maior):**
- Obs 4/5/8 — upload multi-produto + suporte CSV/XLSX
- Obs 12 — upload/spec adicional pós-cadastro
- Obs 15/16 — farol e filtro de completude na grade
- Obs 13 — UI de seleção nos resultados de Busca Web

**Áreas sensíveis (propor diff, validar com cuidado, não aplicar cego):**
- Obs 25 — afrouxar re-filtro de termos CATMAT (lógica de aderência)
- Obs 30 (parte 2) — busca multifonte respeitar `ativo` (integração governamental)
- Obs 7 — `temperature=0` nas chamadas LLM de classificação

---

*Análise gerada cruzando cada observação com o código real do agenteditais (não apenas o tutorial). Nenhum código foi modificado nesta análise — é diagnóstico.*
