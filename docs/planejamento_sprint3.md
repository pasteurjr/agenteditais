# Plano Detalhado Sprint 3 — Precificacao + Proposta + Submissao

**Sprint:** 3
**Onda:** 2
**Periodo:** 09/03 a 13/03/2026
**Requisitos:** RF-039 (Precificacao), RF-040 (Proposta/Documentacao), RF-041 (Submissao)
**Status:** EM ANDAMENTO

---

## 1. Inventario — O que ja esta implementado

### Backend (100% pronto)

| Componente | Arquivo | Linha | Status |
|------------|---------|-------|--------|
| tool_buscar_precos_pncp() | backend/tools.py | 4701 | PRONTO |
| tool_historico_precos() | backend/tools.py | 4858 | PRONTO |
| tool_recomendar_preco() | backend/tools.py | 5084 | PRONTO |
| tool_gerar_proposta() | backend/tools.py | 2262 | PRONTO |
| tool_atualizar_status_proposta() | backend/tools.py | 6539 | PRONTO |
| GET /api/propostas | backend/app.py | 7256 | PRONTO |
| GET /api/propostas/<id> | backend/app.py | 7271 | PRONTO |
| PUT /api/propostas/<id>/status | backend/app.py | 7643 | PRONTO |
| GET /api/propostas/<id>/export | backend/app.py | 7715 | PRONTO |
| Proposta model | backend/models.py | 531 | PRONTO |
| PrecoHistorico model | backend/models.py | 610 | PRONTO |

### Frontend (85-95% pronto)

| Pagina | Arquivo | Status | Pendencias |
|--------|---------|--------|------------|
| PrecificacaoPage | frontend/src/pages/PrecificacaoPage.tsx | 90% | Grafico de evolucao, Ver Todos, Exportar |
| PropostaPage | frontend/src/pages/PropostaPage.tsx | 95% | Status enum 3→4, Enviar por Email |
| SubmissaoPage | frontend/src/pages/SubmissaoPage.tsx | 85% | Status endpoint, remover "confirmada" |

### Chat Prompts (100% pronto)

| Secao | Prompts | Status |
|-------|---------|--------|
| Secao 4: Geracao de Propostas | Gerar proposta, Listar, Excluir | PRONTO |
| Secao 7: Historico de Precos | Buscar PNCP, Preco mercado, Quanto custa, Historico | PRONTO |
| Secao 9: Recomendacao | Recomendar preco, Sugerir, Faixa de preco | PRONTO |

---

## 2. Gaps Identificados

### Gap 1 (CRITICO): Status Enum Mismatch
- **Backend model:** rascunho → revisao → aprovada → enviada (4 estados)
- **PropostaPage frontend:** rascunho | pronta | enviada (3 estados)
- **SubmissaoPage frontend:** usa "confirmada" que NAO existe no backend
- **SubmissaoPage:** usa crudUpdate generico ao inves do endpoint PUT /api/propostas/{id}/status
- **Correcao:** Alinhar frontend aos 4 estados do backend. Mapear "pronta" → "aprovada". Remover "confirmada".

### Gap 2: Grafico de Evolucao de Precos
- **Requisito:** RF-039 criterio 6 — "Grafico de evolucao de precos"
- **Situacao:** PrecificacaoPage NAO tem grafico
- **Correcao:** Implementar grafico SVG com pattern do MercadoPage (CSS classes ja existem em globals.css)

### Gap 3: Botoes com Handler Vazio
- **PrecificacaoPage:** "Ver Todos" (onClick vazio) — deve carregar historico completo
- **PrecificacaoPage:** "Exportar" (onClick vazio) — deve gerar CSV e download
- **PropostaPage:** "Enviar por Email" (onClick vazio) — deve enviar via chat ou mailto

### Gap 4: Campos Ausentes no Model
- **Proposta model:** sem campos documentos_anexados e documentos_total
- **SubmissaoPage:** usa esses campos com defaults (0/3) mas nao persistem
- **Correcao:** ALTER TABLE + atualizar model

---

## 3. Ondas de Execucao

### Onda 1: Backend + Documentos (2 agentes em paralelo)

| Agente | Tarefas |
|--------|---------|
| backend-fixer | Adicionar campos ao model, enriquecer to_dict(), ALTER TABLE |
| doc-writer | Gerar planejamento_editaisv3.md e planejamento_sprint3.md |

### Onda 2: Frontend Fixes (2 agentes em paralelo, depende Onda 1)

| Agente | Tarefas |
|--------|---------|
| frontend-status-fixer | PropostaPage status 3→4, SubmissaoPage endpoint dedicado, remover "confirmada" |
| precificacao-fixer | Grafico SVG, Ver Todos, Exportar CSV, Enviar por Email |

### Onda 3: Testes de Validacao (1 agente, depende Onda 2)

| Agente | Tarefas |
|--------|---------|
| test-writer | validacao_sprint3.spec.ts (35 testes em 5 grupos), rodar_validacao_sprint3.sh |

### Onda 4: QA Final (1 agente, depende Onda 3)

| Agente | Tarefas |
|--------|---------|
| qa-runner | Executar testes, verificar TypeScript, corrigir falhas, atualizar docs |

---

## 4. Testes de Validacao (35 testes em 5 grupos)

### Grupo 1: Precificacao (T-01 a T-08)
| # | Teste | Criterio |
|---|-------|----------|
| T-01 | Navegar para PrecificacaoPage | Pagina carrega com header e secoes |
| T-02 | Buscar precos no PNCP | Preencher termo, clicar buscar, verificar stats (media/min/max) |
| T-03 | Tabela de precos de mercado | DataTable com colunas: Data, Orgao, Produto, Valor, Vencedor |
| T-04 | Recomendar preco | Selecionar edital + produto, clicar recomendar, verificar resultado |
| T-05 | Historico de precos | DataTable com resultado ganho/perdido |
| T-06 | Botao Ver Todos | Clicar, verificar mais registros carregados |
| T-07 | Botao Exportar | Clicar, verificar download CSV |
| T-08 | Grafico de evolucao | Verificar SVG renderizado com dados |

### Grupo 2: Proposta (T-09 a T-17)
| # | Teste | Criterio |
|---|-------|----------|
| T-09 | Navegar para PropostaPage | Pagina carrega com botao "Nova Proposta" |
| T-10 | Criar proposta | Selecionar edital/produto, preencher preco, gerar |
| T-11 | Listar propostas | DataTable com colunas corretas |
| T-12 | Filtrar por status | Testar 4 estados (Rascunho, Revisao, Aprovada, Enviada) |
| T-13 | Preview proposta | Clicar na row, verificar card de preview |
| T-14 | Download PDF | Clicar, verificar request de download |
| T-15 | Download DOCX | Clicar, verificar request de download |
| T-16 | Excluir proposta | Clicar trash, verificar remocao |
| T-17 | Sugerir preco | Clicar lampada, verificar chat ou sugestao |

### Grupo 3: Submissao (T-18 a T-25)
| # | Teste | Criterio |
|---|-------|----------|
| T-18 | Navegar para SubmissaoPage | Pagina carrega com tabela de propostas |
| T-19 | Colunas da tabela | Edital, Orgao, Produto, Valor, Abertura, Status, Checklist |
| T-20 | Selecionar proposta | Clicar row, verificar card de checklist |
| T-21 | Checklist 4 itens | proposta tecnica, preco, docs (X/Y), revisao |
| T-22 | Anexar documento | Modal com Tipo, Arquivo, Observacao |
| T-23 | Marcar como enviada | Status muda via endpoint dedicado |
| T-24 | Abrir Portal PNCP | Link externo pncp.gov.br |
| T-25 | Badge de progresso | X/4 exibido corretamente |

### Grupo 4: Chat Integration (T-26 a T-30)
| # | Teste | Criterio |
|---|-------|----------|
| T-26 | Buscar precos PNCP via chat | Dropdown prompt funciona |
| T-27 | Recomendar preco via chat | Dropdown prompt funciona |
| T-28 | Gerar proposta via chat | Dropdown prompt funciona |
| T-29 | Listar propostas via chat | Dropdown prompt funciona |
| T-30 | Historico precos via chat | Dropdown prompt funciona |

### Grupo 5: Integracao (T-31 a T-35)
| # | Teste | Criterio |
|---|-------|----------|
| T-31 | Fluxo: Recomendacao → Proposta | Preco recomendado usado na proposta |
| T-32 | Fluxo: Proposta → Submissao | Proposta criada aparece na submissao |
| T-33 | Export PDF com dados reais | PDF gerado com conteudo correto |
| T-34 | Workflow status completo | rascunho → revisao → aprovada → enviada |
| T-35 | Grafico popula com dados | Historico alimenta grafico de evolucao |

---

## 5. Criterios de Aceite da Sprint 3

- [ ] RF-039: Busca de precos PNCP funcional
- [ ] RF-039: Estatisticas media/min/max exibidas
- [ ] RF-039: Tabela de precos de mercado com dados reais
- [ ] RF-039: Recomendacao de preco funcional (3 estrategias)
- [ ] RF-039: Historico de precos com resultado ganho/perdido
- [ ] RF-039: Grafico de evolucao de precos
- [ ] RF-040: Selecao de edital + produto
- [ ] RF-040: Geracao de proposta via IA
- [ ] RF-040: Preview da proposta
- [ ] RF-040: Export PDF e DOCX
- [ ] RF-040: Status workflow 4 estados
- [ ] RF-041: Tabela de propostas com checklist
- [ ] RF-041: Checklist 4 itens
- [ ] RF-041: Anexar documento (modal)
- [ ] RF-041: Marcar como enviada (endpoint dedicado)
- [ ] RF-041: Link portal PNCP
- [ ] 35 testes Playwright passando
- [ ] TypeScript compila sem erros

---

*Documento gerado em 02/03/2026*
