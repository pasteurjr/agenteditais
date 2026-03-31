# Analise: PDF SPRINT PRECO E PROPOSTA vs requisitos_completosv4.md

**Data:** 13/03/2026
**Fonte:** `PDF SPRINT PRECO e PROPOSTA.pdf` (15 slides, NotebookLM)
**Comparacao com:** `requisitos_completosv4.md`
**Verificacao de implementacao:** Codebase atual (backend + frontend)

---

## Requisitos extraidos do PDF — slide a slide

O PDF apresenta 15 slides organizados em um pipeline de 6 etapas (Bloco A: Precificacao + Bloco B: Proposta). Abaixo, cada requisito identificado no PDF, seu correspondente no v4, e status de implementacao.

---

## TABELA COMPLETA

| # | Requisito extraido do PDF | Slide | Fase | RF no v4 | Implementado? | Onde no app |
|---|--------------------------|-------|------|----------|---------------|-------------|
| 1 | **Pipeline 6 etapas** (Selecao → Calculo → Lances → Proposta → Auditoria → Exportacao) com Bloco A (Estrategia/Precificacao) e Bloco B (Execucao/Compliance) | 2 | GERAL | Secao "Sprint 3" v4 (RF-039 a RF-041) | ⚙️ PARCIAL — paginas existem mas pipeline nao e sequencial | `PrecificacaoPage.tsx`, `PropostaPage.tsx`, `SubmissaoPage.tsx` |
| 2 | **Entrada do pipeline vem do ERP/Bancos de Dados**, saida vai para o Orgao Publico | 2 | GERAL | RF-039-03 (ERP) + RF-041-01 (Exportacao) | ❌ ERP nao integrado; exportacao basica existe | Export: `app.py:8739` |
| 3 | **Selecao Inteligente de Portfolio** — Agente Assistido cruza Edital (Lotes) com Portfolio Interno por: Tipo de amostra, Volumetria, No ANVISA | 3 | PRECIFICACAO | RF-039-07 | ❌ NAO IMPLEMENTADO | — |
| 4 | **Validacao humana obrigatoria** — [ACAO HUMANA] no match de portfolio | 3 | PRECIFICACAO | RF-039-07 (criterio 3) | ❌ NAO IMPLEMENTADO | — |
| 5 | **Atualizacao Dinamica** — Sincronizacao automatica via links do fabricante (ex: Wiener) | 3 | PRECIFICACAO | RF-039-06 | ❌ NAO IMPLEMENTADO | — |
| 6 | **Inclusao de fotos** dos produtos [OPCIONAL] | 3 | PRECIFICACAO | RF-039-05 (campo "Fotos") | ❌ NAO IMPLEMENTADO — campo nao existe | — |
| 7 | **Motor de Calculo Tecnico** — Volume do Edital + Repeticoes (Amostras) + Repeticoes (Calibradores) + Repeticoes (Controles) / Rendimento do Kit = Quantidade Total de Kits. Arredondamento sempre para cima. | 4 | PRECIFICACAO | RF-039-02 | ❌ NAO IMPLEMENTADO | — |
| 8 | **Recalibracao por parametro** — calculo recalibra volumes para cada parametro (Bioquimica, Hemato) | 4 | PRECIFICACAO | RF-039-02 (dentro da descricao) | ❌ NAO IMPLEMENTADO | — |
| 9 | **Integracao ERP** — Importacao automatica de Preco de Compra ou Custo de Producao | 5 | PRECIFICACAO | RF-039-03 | ❌ NAO IMPLEMENTADO | — |
| 10 | **Motor Tributario** — Parametrizacao por NCM, isencao identificada NCM 3822 (Isencao de ICMS) | 5 | PRECIFICACAO | RF-039-04 | ❌ NAO IMPLEMENTADO — campo NCM existe (`models.py:140`) mas sem logica tributaria | Campo basico: `Produto.ncm` |
| 11 | **Convergencia para Preco Base** — ERP + Motor Tributario geram Preco Base com [ACAO HUMANA] campo editavel para validacao final | 5 | PRECIFICACAO | RF-039-03 + RF-039-04 | ❌ NAO IMPLEMENTADO | — |
| 12 | **Estrutura de Lances: 4 Camadas** — Preco Base (input manual/upload tabela/custo+markup, opcao reutilizavel) | 6 | PRECIFICACAO | RF-039-08 | ❌ NAO IMPLEMENTADO | — |
| 13 | **Valor de Referencia (Target)** — Importado do edital ou % sobre tabela | 6 | PRECIFICACAO | RF-039-09 | ❌ NAO IMPLEMENTADO — campo `valor_referencia` existe no model mas sem logica de camada | Campo basico: `Edital.valor_referencia` (`models.py:411`) |
| 14 | **Valor Inicial do Lance** [MANDATORIO] — Ponto de partida do leilao | 6 | PRECIFICACAO | RF-039-10 | ❌ NAO IMPLEMENTADO | — |
| 15 | **Valor Minimo do Lance** [MANDATORIO] — Limite de seguranca comercial | 6 | PRECIFICACAO | RF-039-10 | ❌ NAO IMPLEMENTADO | — |
| 16 | **Estrategia Competitiva: "Quero Ganhar"** — Automacao de lances agressivos ate bloqueio do Valor Minimo | 7 | PRECIFICACAO | RF-039-11 | ❌ NAO IMPLEMENTADO | — |
| 17 | **Estrategia Competitiva: "Nao ganhei no minimo"** — Reposicionamento automatico para melhor colocacao apos 1o lugar | 7 | PRECIFICACAO | RF-039-11 | ❌ NAO IMPLEMENTADO | — |
| 18 | **Historico de Precos** — Grafico de barras com evolucao temporal, referencia de editais passados para embasar decisao | 7 | PRECIFICACAO | RF-039-12 | ⚙️ PARCIAL — tools existem, grafico SVG existe na PrecificacaoPage | `tools.py:5552` (busca), `tools.py:5709` (historico), `PrecificacaoPage.tsx` (grafico) |
| 19 | **Roadmap Comodato** — Fase Atual: Processo Manual Assistido (input direto do usuario). Visao de Futuro: Agente de IA dedicado para automatizar calculos | 8 | PRECIFICACAO | RF-039-13 | ❌ NAO IMPLEMENTADO — "Comodato" existe como categoria de edital, mas nao como modulo de gestao | Categoria basica: `Edital.categoria` |
| 20 | **Motor de Geracao de Propostas** — Inputs de Preco + Edital → Motor de Layout Parametrizavel → Proposta Gerada | 9 | PROPOSTA | RF-040-01 | ⚙️ PARCIAL — tool_gerar_proposta existe mas e basico (gera texto IA, sem cruzamento com camadas de preco) | `tools.py:2879` (tool), `PropostaPage.tsx` (UI) |
| 21 | **100% Editavel antes da submissao** — Regra de ouro da proposta | 9 | PROPOSTA | RF-040-01 (criterio 4) | ⚙️ PARCIAL — proposta tem campo texto editavel, mas nao ha editor rico inline | `Proposta.texto_tecnico` (`models.py:695`) |
| 22 | **Geracao via sistema** (automatica) | 9 | PROPOSTA | RF-040-01 + RF-040-02 | ✅ IMPLEMENTADO | `tools.py:2879` (tool_gerar_proposta) |
| 23 | **Upload de proposta pronta** (externa) | 9 | PROPOSTA | RF-040-02 | ⚙️ PARCIAL — upload de documentos existe na SubmissaoPage, mas nao como alternativa de entrada na PropostaPage | `SubmissaoPage.tsx` (upload docs) |
| 24 | **Personalizacao Tecnica Estrategica A/B** — Opcao 1: Texto tecnico exato do edital. Opcao 2: Descritivo tecnico personalizado do cliente (aderencia parcial/manuais) | 10 | PROPOSTA | RF-040-03 | ❌ NAO IMPLEMENTADO | — |
| 25 | **[VERSAO ORIGINAL SALVA]** — Backup do texto original quando Opcao 2 e usada | 10 | PROPOSTA | RF-040-03 (criterio 5) | ❌ NAO IMPLEMENTADO | — |
| 26 | **[LOG REGISTRADO]** — Usuario, data e alteracao registrados ao usar Opcao 2 | 10 | PROPOSTA | RF-040-03 (criterio 4) + RF-041-02 | ❌ NAO IMPLEMENTADO — auditoria_log existe mas nao para descricoes tecnicas | `AuditoriaLog` (`models.py:1662`) existe para CRUD basico |
| 27 | **Auditoria Regulatoria ANVISA** — Semaforo: Verde (Registro Valido), Amarelo (Em Processo), Vermelho (Vencido) | 11 | PROPOSTA | RF-040-04 | ❌ NAO IMPLEMENTADO — campo `anvisa_status` existe mas sem semaforo nem bloqueio | Campo basico: `Produto.anvisa_status` (`models.py:149`) |
| 28 | **Fase Inicial ANVISA** → Base de dados interna | 11 | PROPOSTA | RF-040-04 (criterio 4) | ❌ NAO IMPLEMENTADO | — |
| 29 | **Visao Futura ANVISA** → Consulta externa website Anvisa | 11 | PROPOSTA | RF-040-04 (roadmap) | ❌ NAO IMPLEMENTADO | — |
| 30 | **[LOG DE VALIDACAO REGISTRADO]** — Data da consulta, fonte da informacao e status salvos automaticamente | 11 | PROPOSTA | RF-040-04 (criterio 3) + RF-041-02 | ❌ NAO IMPLEMENTADO | — |
| 31 | **Auditoria Documental e Checklist Inteligente** — 3 fases: 1. Identificacao (Instrucoes, Registro, Manual, FISPQ), 2. Validacao e Adequacao (fracionamento automatico para limites do orgao), 3. Checklist Final [ACAO HUMANA] | 12 | PROPOSTA | RF-040-05 | ❌ NAO IMPLEMENTADO | — |
| 32 | **Fracionamento automatico** — Smart Split para limites de transferencia do orgao | 12 | PROPOSTA | RF-040-05 (criterio 4) | ❌ NAO IMPLEMENTADO | — |
| 33 | **Escudo de Rastreabilidade** — 5 eventos com [TIMESTAMP]: Alteracoes manuais de Preco, Substituicao do texto descritivo tecnico, Atualizacoes automatizadas do Portfolio, Consultas e validacoes Anvisa, Uploads e fracionamento de documentos | 13 | TRANSVERSAL | RF-041-02 | ⚙️ PARCIAL — auditoria_log existe para CRUD generico, mas NAO rastreia os 5 eventos especificos do PDF | `AuditoriaLog` (`models.py:1662`) — apenas CRUD basico |
| 34 | **Foco na mitigacao de riscos regulatorios e comerciais** — principio do escudo | 13 | TRANSVERSAL | RF-041-02 (descricao) | ⚙️ PARCIAL — conceito existe mas nao os 5 eventos | — |
| 35 | **Exportacao: Proposta PDF** — Pronta para assinatura e submissao | 14 | SUBMISSAO | RF-041-01 | ✅ IMPLEMENTADO | `app.py:8739` (route export PDF via weasyprint) |
| 36 | **Exportacao: Proposta Word (DOC)** — Total flexibilidade e editabilidade | 14 | SUBMISSAO | RF-041-01 | ✅ IMPLEMENTADO | `app.py:8739` (route export DOCX via python-docx) |
| 37 | **Exportacao: Pacote de Anexos** — Documentacao auditada, fracionada e estruturada | 14 | SUBMISSAO | RF-041-01 (criterio 1) | ❌ NAO IMPLEMENTADO — export e individual, sem pacote consolidado | — |
| 38 | **Pacote consolidado** — organizado para envio imediato, garantindo integridade e rastreabilidade | 14 | SUBMISSAO | RF-041-01 | ❌ NAO IMPLEMENTADO | — |
| 39 | **Criterio de Aceite 1:** Integracao de custo com ERP operacional | 15 | CRITERIO | RF-039-03 | ❌ NAO IMPLEMENTADO | — |
| 40 | **Criterio de Aceite 2:** Calculo tecnico volumetrico automatizado | 15 | CRITERIO | RF-039-02 | ❌ NAO IMPLEMENTADO | — |
| 41 | **Criterio de Aceite 3:** Estrutura de lances e estrategia 100% parametrizavel | 15 | CRITERIO | RF-039-10 + RF-039-11 | ❌ NAO IMPLEMENTADO | — |
| 42 | **Criterio de Aceite 4:** Proposta tecnica gerada automaticamente e totalmente editavel | 15 | CRITERIO | RF-040-01 | ⚙️ PARCIAL — gera mas nao cruza com camadas | `tools.py:2879` |
| 43 | **Criterio de Aceite 5:** Auditoria Anvisa e Documental ativas | 15 | CRITERIO | RF-040-04 + RF-040-05 | ❌ NAO IMPLEMENTADO | — |
| 44 | **Criterio de Aceite 6:** Sistema de LOGs mapeando todas as acoes criticas | 15 | CRITERIO | RF-041-02 | ⚙️ PARCIAL — LOG existe mas nao os 5 eventos criticos | `AuditoriaLog` basico |

---

## RESUMO DE COBERTURA

### PDF vs v4 — Cobertura de Requisitos

| Metrica | Resultado |
|---------|-----------|
| Total de requisitos extraidos do PDF | **44** (38 funcionais + 6 criterios de aceite) |
| Cobertos no requisitos_completosv4.md | **44/44 (100%)** |
| Requisitos no v4 que NAO aparecem no PDF | RF-039-01 (Lotes como entidade), RF-039-05 (campos portfolio), RF-039-13 detalhado |

### Status de Implementacao

| Status | Qtd | % |
|--------|-----|---|
| ✅ IMPLEMENTADO | **3** (geracao proposta, export PDF, export DOCX) | 7% |
| ⚙️ PARCIAL | **8** (pipeline paginas, historico precos, motor proposta, editabilidade, upload externo, rastreabilidade, criterios 4 e 6) | 18% |
| ❌ NAO IMPLEMENTADO | **33** (volumetria, ERP, NCM tributario, lances, estrategia, A/B, ANVISA semaforo, Smart Split, pacote anexos, comodato, agente match, sync fabricante, etc.) | 75% |

---

## FUNCIONALIDADES EXISTENTES QUE O PDF ASSUME COMO INPUT

Estas funcionalidades ja existem e alimentam o pipeline do PDF:

| Funcionalidade | Status | Local |
|---------------|--------|-------|
| Busca de precos PNCP | ✅ | `tools.py:5552` — `tool_buscar_precos_pncp` |
| Historico de precos | ✅ | `tools.py:5709` — `tool_historico_precos` |
| Recomendacao de preco | ✅ | `tools.py:5935` — `tool_recomendar_preco` |
| Tabela precos_historicos | ✅ | `models.py:773` — `PrecoHistorico` |
| Tabela propostas | ✅ | `models.py:680` — `Proposta` (4 status) |
| CRUD Portfolio | ✅ | `models.py:107` — `Produto` + specs + docs |
| Campo NCM no produto | ✅ | `models.py:140` — `Produto.ncm` |
| Campo ANVISA basico | ✅ | `models.py:148-149` — `registro_anvisa`, `anvisa_status` |
| Campo valor_referencia edital | ✅ | `models.py:411` — `Edital.valor_referencia` |
| Auditoria LOG basica | ✅ | `models.py:1662` — `AuditoriaLog` (CRUD) |
| PrecificacaoPage | ✅ | `PrecificacaoPage.tsx` |
| PropostaPage | ✅ | `PropostaPage.tsx` |
| SubmissaoPage | ✅ | `SubmissaoPage.tsx` |
| API propostas (CRUD + export) | ✅ | `app.py:7948-8739` |

---

## O QUE FALTA IMPLEMENTAR (gap PDF → app)

### Prioridade ALTA (Criterios de Aceite da Sprint)

| Gap | RF v4 | Criticidade |
|-----|-------|-------------|
| Motor de calculo volumetrico (formula de kits) | RF-039-02 | BLOQUEANTE — criterio de aceite 2 |
| Integracao ERP para custo base | RF-039-03 | BLOQUEANTE — criterio de aceite 1 |
| Estrutura de lances 4 camadas + bloqueio minimo | RF-039-08/09/10 | BLOQUEANTE — criterio de aceite 3 |
| Estrategia competitiva parametrizavel | RF-039-11 | BLOQUEANTE — criterio de aceite 3 |
| Motor de proposta cruzando camadas x edital | RF-040-01 (evolucao) | BLOQUEANTE — criterio de aceite 4 |
| Auditoria ANVISA com semaforo 3 cores + bloqueio | RF-040-04 | BLOQUEANTE — criterio de aceite 5 |
| Auditoria documental + Smart Split | RF-040-05 | BLOQUEANTE — criterio de aceite 5 |
| Escudo de LOGs com 5 eventos criticos | RF-041-02 (evolucao) | BLOQUEANTE — criterio de aceite 6 |

### Prioridade MEDIA

| Gap | RF v4 |
|-----|-------|
| Agente match assistido (portfolio x lote) | RF-039-07 |
| Motor tributario NCM (isencao ICMS 3822) | RF-039-04 |
| Personalizacao tecnica A/B com versao original + LOG | RF-040-03 |
| Pacote de anexos consolidado (PDF+Word+Anexos) | RF-041-01 |

### Prioridade BAIXA (Roadmap)

| Gap | RF v4 |
|-----|-------|
| Sync automatico via fabricante (Wiener) | RF-039-06 |
| Comodato como modulo (manual assistido) | RF-039-13 |
| Campos adicionais portfolio (fotos, volumetria, procedencia) | RF-039-05 |
| Consulta externa ANVISA (website) | RF-040-04 (fase futura) |

---

*Documento gerado em 13/03/2026. Fonte: PDF SPRINT PRECO e PROPOSTA.pdf (15 slides) vs requisitos_completosv4.md vs codebase.*
