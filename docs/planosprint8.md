# PLANO DE IMPLEMENTACAO — SPRINT 8: Dispensas + Classes + Mascaras

**Data:** 2026-04-16
**Documento base:** `docs/CASOS DE USO SPRINT8.md` (5 UCs)
**Escopo:** 3 EXPANSOES + 2 NOVOS

---

## 1. Inventario: O que JA EXISTE vs O que FALTA

### 1.1 Models (backend/models.py)

| Model | Existe? | Linha | Campos | O que FALTA |
|---|---|---|---|---|
| `Dispensa` | SIM | 2681 | id, user_id, empresa_id, edital_id, artigo, valor_limite, justificativa, cotacao_texto, fornecedores_cotados, status(aberta/cotacao_enviada/adjudicada/encerrada), data_limite | Nada — modelo completo |
| `ClasseProdutoV2` | SIM | 288 | id, empresa_id, nome, area_id, descricao, ativo, ordem | Nada |
| `SubclasseProduto` | SIM | 316 | id, empresa_id, nome, classe_id, ncms, campos_mascara, ativo, ordem | Nada |
| `AreaProduto` | SIM | 263 | id, empresa_id, nome, descricao, ativo, ordem | Nada |
| `Produto` | SIM | 139 | nome, ncm, categoria, subclasse_id, fabricante, modelo, descricao, ... | **FALTA:** `descricao_normalizada` (Text), `mascara_ativa` (Boolean), `mascara_metadata` (JSON) |

### 1.2 CRUDs (backend/crud_routes.py)

| CRUD | Existe? | Linha |
|---|---|---|
| `dispensas` | SIM | 555 |
| `classes-produtos` (v1) | SIM | 570 |
| `classes-produto-v2` | SIM | (sidebar referencia) |
| `subclasses-produto` | SIM | (sidebar referencia) |
| `areas-produto` | SIM | (sidebar referencia) |

### 1.3 Endpoints (backend/app.py)

| Endpoint | Existe? | Linha | Observacao |
|---|---|---|---|
| `POST /api/parametrizacoes/gerar-classes` | **SIM** | 10656 | Ja faz: lista produtos, envia para DeepSeek, retorna JSON com classes/subclasses sugeridas. **NAO** aplica automaticamente, retorna sugestao. **NAO** verifica minimo 20 produtos. |
| `GET /api/dashboard/dispensas` | NAO | — | CRIAR |
| `POST /api/dispensas/buscar` | NAO | — | CRIAR (reusa motor busca PNCP com `modalidade=dispensa`) |
| `POST /api/dispensas/<id>/cotacao` | NAO | — | CRIAR |
| `PUT /api/dispensas/<id>/status` | NAO | — | CRIAR |
| `POST /api/portfolio/aplicar-mascara` | NAO | — | CRIAR |
| `POST /api/portfolio/aplicar-mascara-lote` | NAO | — | CRIAR |

### 1.4 Tools DeepSeek (backend/tools.py)

| Tool | Existe? | Observacao |
|---|---|---|
| `tool_gerar_classes_portfolio` | **NAO** como tool registrada | A logica existe inline no endpoint `/api/parametrizacoes/gerar-classes` (app.py:10656), mas NAO esta registrada como tool DeepSeek. Decisao: **manter endpoint existente + melhorar** (adicionar RN-NEW-09 minimo 20 produtos, campos_mascara sugeridos). NAO precisa virar tool se o endpoint ja faz o trabalho. |
| `tool_aplicar_mascara_descricao` | **NAO** | CRIAR como tool registrada — normaliza descricao de produto via LLM |
| `_build_prompt_mascara` | SIM | tools.py:240 — constroi prompt com campos_mascara |
| `_extrair_specs_em_chunks` | SIM | tools.py:1090 — extrai specs usando mascara |

### 1.5 Frontend — Paginas

| Pagina | Existe? | Linhas | Tabs atuais | O que FALTA |
|---|---|---|---|---|
| `CaptacaoPage.tsx` | SIM | 2641 | Sem tabs superiores (1 view unica) | ADICIONAR: aba "Dispensas" com dashboard + workflow cotacao |
| `ParametrizacoesPage.tsx` | SIM | 979 | Score, Comercial, Fontes, Notificacoes, Preferencias | ADICIONAR: aba "Classes" com tree view + edicao mascaras |
| `PortfolioPage.tsx` | SIM | 1478 | produtos, cadastroIA, classificacao | EXPANDIR: colunas Classe + Desc.Normalizada, badges, selecao multipla, botao Aplicar Mascara |

### 1.6 Sidebar

| Entrada | Existe? | Observacao |
|---|---|---|
| Dispensas (Cadastros > Parametros) | SIM | Aponta para `crud:dispensas` (CRUD generico) |
| Classes (Cadastros > Portfolio) | SIM | Aponta para `crud:classes-produto-v2` |
| Captacao (Fluxo Comercial) | SIM | — |
| Parametrizacoes (Configuracoes) | SIM | — |

---

## 2. Mapa UC → Implementacao

### UC-DI01 — Dashboard e Workflow de Dispensas (EXPANSAO CaptacaoPage)
**Estende:** UC-CV01, UC-CV07 (Sprint 2)

**Backend:**
1. `GET /api/dashboard/dispensas` — stat cards por status (aberta/cotacao_enviada/adjudicada/encerrada), filtros artigo/faixa_valor/uf
2. `POST /api/dispensas/buscar` — reusa `tool_buscar_editais` com `modalidade=dispensa` pre-configurado
3. `POST /api/dispensas/<id>/cotacao` — gera cotacao via DeepSeek usando precos do portfolio
4. `PUT /api/dispensas/<id>/status` — transicao de status com RN-NEW-08 (sem pular etapa) + RN-NEW-11 (adjudicada → lead CRM)
5. Expandir CRUD `dispensas` com filtros: artigo, faixa_valor, status

**Frontend (CaptacaoPage.tsx):**
1. Adicionar tabs superiores: "Editais" (conteudo existente) | "Dispensas" (novo)
2. Tab Dispensas: 4 stat cards, filtros (artigo, faixa valor, UF, buscar orgao), botao "Buscar Dispensas PNCP"
3. DataTable dispensas com colunas: Numero, Orgao, UF, Artigo, Objeto, Valor, Prazo (badge urgencia), Score, Status, Acoes
4. Badge RN-NEW-07 "Valor Excedido" quando valor > limite do artigo
5. Botao "Gerar Cotacao" → modal com produtos match + textarea cotacao + botao enviar
6. Botao "Atualizar Status" com transicoes validas

### UC-CL01 — Gerar Classes do Portfolio via IA (NOVO — usa endpoint existente)
**Endpoint existente:** `POST /api/parametrizacoes/gerar-classes` (app.py:10656)

**Backend — MELHORAR endpoint existente:**
1. Adicionar verificacao RN-NEW-09: minimo 20 produtos (hoje aceita qualquer qtd)
2. Adicionar `campos_mascara` sugeridos na resposta da IA (hoje so retorna nome/descricao/ncm)
3. Adicionar audit log RN-132 (invocacao DeepSeek)
4. Adicionar cooldown RN-084
5. Adicionar logica de aplicacao: apos aceite do usuario, criar registros em areas/classes/subclasses e vincular produtos (hoje so retorna sugestao)

**Frontend (ParametrizacoesPage.tsx — aba Classes, UC-CL02):**
1. Botao "Gerar Classes via IA" na aba Classes
2. Modal com arvore sugerida, botoes Aceitar Tudo / Editar e Aceitar / Cancelar

### UC-CL02 — Gerenciar Classes e Mascaras (EXPANSAO ParametrizacoesPage)
**Estende:** UC-F13, UC-F14, UC-F15 (Sprint 1)

**Backend:**
- Nenhum endpoint novo — usa CRUDs existentes (areas-produto, classes-produto-v2, subclasses-produto)

**Frontend (ParametrizacoesPage.tsx):**
1. Adicionar aba "Classes" ao array de tabs
2. Stat cards: Areas (qtd), Classes (qtd), Produtos sem Classe (qtd)
3. Tree view hierarquica: Area → Classe → Subclasse com contagem de produtos
4. Painel detalhe de subclasse: nome, NCMs, classe pai, campos_mascara editaveis
5. Botoes: Nova Area, Nova Classe, Nova Subclasse, Editar, Excluir
6. Botao "Gerar Classes via IA" (invoca UC-CL01)
7. Botao "Aplicar ao Portfolio" → modal vincular produtos sem classe

### UC-CL03 — Visualizar Classes no Portfolio (EXPANSAO PortfolioPage)
**Estende:** UC-F06, UC-F13 (Sprint 1)

**Backend:**
- Expandir retorno de `GET /api/crud/produtos` com `descricao_normalizada` e `mascara_ativa` (apos adicionar campos ao model)

**Frontend (PortfolioPage.tsx):**
1. Adicionar coluna "Classe" na tab produtos (resolve via subclasseToClasseMap existente)
2. Adicionar coluna "Desc. Normalizada"
3. Badge "Sem Classe" para subclasse_id=null
4. Badge "Mascara Ativa" para mascara_ativa=true
5. Checkbox selecao multipla + botao "Classificar Selecionados" → modal com cascata Area/Classe/Subclasse
6. Botao "Aplicar Mascara" por produto na coluna Acoes (invoca UC-MA01)
7. Filtro adicional "Sem Classe" no select de subclasse

### UC-MA01 — Aplicar Mascara de Descricao a Produtos (NOVO)

**Backend:**
1. Adicionar 3 campos ao model `Produto`: `descricao_normalizada` (Text), `mascara_ativa` (Boolean default True), `mascara_metadata` (JSON)
2. Registrar tool `tool_aplicar_mascara_descricao` em tools.py — recebe descricao, NCM, campos_mascara da subclasse, termos frequentes de editais; retorna descricao_normalizada, variantes, sinonimos, score estimado antes/depois
3. `POST /api/portfolio/aplicar-mascara` — 1 produto: invoca tool, salva resultado
4. `POST /api/portfolio/aplicar-mascara-lote` — N produtos sequencialmente

**Frontend (PortfolioPage.tsx):**
1. Modal "Aplicar Mascara de Descricao": descricao original, subclasse, campos_mascara, botao Gerar
2. Resultado: antes/depois lado a lado, impacto no score, variantes, sinonimos
3. Toggle "Mascara Ativa" (RN-NEW-10)
4. Botoes: Aceitar, Editar e Aceitar, Cancelar

---

## 3. Ordem de Execucao

### ONDA 1 — Backend (models + endpoints)
1. `backend/models.py` — adicionar 3 campos ao Produto (descricao_normalizada, mascara_ativa, mascara_metadata)
2. `backend/app.py` — melhorar endpoint gerar-classes (RN-NEW-09, campos_mascara, audit, aplicacao)
3. `backend/app.py` — 4 endpoints novos dispensas (dashboard, buscar, cotacao, status)
4. `backend/app.py` — 2 endpoints novos mascara (aplicar, aplicar-lote)
5. `backend/tools.py` — 1 tool nova (tool_aplicar_mascara_descricao)

### ONDA 2 — Frontend (3 paginas expandidas)
6. `CaptacaoPage.tsx` — tabs + aba Dispensas completa
7. `ParametrizacoesPage.tsx` — aba Classes com tree view + mascaras + botao IA
8. `PortfolioPage.tsx` — colunas + badges + selecao + modal mascara

### ONDA 3 — Seed + Testes
9. `backend/seeds/sprint8_seed.py` — dados para CH e RP3X
10. Testes Playwright (2 specs, 5 testes)

---

## 4. Arquivos Modificados

| Arquivo | Acao | Delta estimado |
|---|---|---|
| `backend/models.py` | MODIFICAR — 3 campos em Produto | +5L |
| `backend/app.py` | MODIFICAR — 6 endpoints (4 novos + 1 melhorado + filtros CRUD) | +350L |
| `backend/tools.py` | MODIFICAR — 1 tool nova | +150L |
| `backend/seeds/sprint8_seed.py` | CRIAR | ~300L |
| `frontend/src/pages/CaptacaoPage.tsx` | EXPANDIR — tabs + aba Dispensas | +400L |
| `frontend/src/pages/ParametrizacoesPage.tsx` | EXPANDIR — aba Classes | +350L |
| `frontend/src/pages/PortfolioPage.tsx` | EXPANDIR — colunas + badges + modal mascara | +300L |
| `tests/e2e/playwright/sprint8-dispensas.spec.ts` | CRIAR | ~150L |
| `tests/e2e/playwright/sprint8-classes-mascaras.spec.ts` | CRIAR | ~200L |

---

## 5. Verificacao

### Backend
- [ ] 3 campos adicionados ao Produto (descricao_normalizada, mascara_ativa, mascara_metadata)
- [ ] Endpoint gerar-classes melhorado com RN-NEW-09 (minimo 20 produtos)
- [ ] 4 endpoints dispensas respondem (curl)
- [ ] 2 endpoints mascara respondem (curl)
- [ ] Tool tool_aplicar_mascara_descricao registrada
- [ ] Seed idempotente executado
- [ ] Todos endpoints filtram por empresa_id

### Frontend
- [ ] CaptacaoPage com 2 tabs (Editais + Dispensas)
- [ ] ParametrizacoesPage com 6 tabs (+ Classes)
- [ ] PortfolioPage com colunas Classe + Desc.Normalizada + badges
- [ ] Modal cotacao funcional
- [ ] Modal mascara funcional com antes/depois
- [ ] Tree view de classes com edicao de campos_mascara
- [ ] TypeScript sem erros, Vite build OK

### Testes
- [ ] 5 testes Playwright passando
- [ ] 10 screenshots (2 por teste)
