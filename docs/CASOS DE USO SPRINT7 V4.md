# CASOS DE USO — SPRINT 7: MERCADO TAM/SAM/SOM, ANALYTICS CONSOLIDADO E PIPELINE DE APRENDIZADO

**Data:** 16/04/2026
**Versao:** 4.0
**Base:** requisitos_completosv8.md (RF-050, RF-049, RF-053, RF-055, RF-048, RF-060) + SPRINT7-VI.md (descritivo funcional) + planejamento_editaisv4.md (secao 4) + Roadmap Fase 1 18/12/2025 (itens 5.c, 5.d, 5.e, 5.f, 11) + Lei 14.133/2021
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Mercado (TAM/SAM/SOM + Concorrencia + Itens Intrusos), Analytics Consolidado (Pipeline + Conversoes + Tempo + ROI + Perdas) e Pipeline de Aprendizado Continuo (Feedbacks + Sugestoes IA + Padroes).
**Nota sobre funcionalidades existentes:** Varias paginas ja implementadas nas Sprints 5-6 sao EXPANDIDAS (nao recriadas) nesta sprint:
- `CRMPage.tsx` (539L, 6 tabs) — ja possui aba Mapa com Leaflet/OSM (CircleMarker por UF + popup por pipeline_stage). UC-ME02 EXPANDE esta aba.
- `ConcorrenciaPage.tsx` (231L) — ja possui tabela com Nome/CNPJ/Vitorias/Derrotas/Taxa/Preco Medio + detalhe com historico. UC-ME03 EXPANDE esta pagina.
- `PerdasPage.tsx` (213L) — ja possui 3 stat cards, pie chart de motivos, tabela com Edital/Orgao/Motivo/Preco/Vencedor/Gap, filtro periodo. UC-AN05 EXPANDE esta pagina.
- `MercadoPage.tsx` (173L) — ja possui 3 stat cards, tendencias por mes, categorias. UC-ME01 EXPANDE com tabs + TAM/SAM/SOM.
- Models `Concorrente`, `ParticipacaoEdital`, `PrecoHistorico`, `AprendizadoFeedback` ja existem no backend.
- Paginas NOVAS desta sprint: `AnalyticsPage.tsx` (4 tabs) e `AprendizadoPage.tsx` (3 tabs).

---

## Regras de Negocio Aplicadas (V4)

Esta sprint implementa enforcement de RNs relacionadas a dimensionamento de mercado, concorrencia e aprendizado. As seguintes RNs sao relevantes:

| RN | Descricao | UC afetado | Origem |
|---|---|---|---|
| RN-059 | Cache de analise de mercado tem validade de 30 dias; `{"forcar": true}` forca recalculo | UC-ME01, UC-ME02 | RF-050 + app.py:11270 |
| RN-070 | Analise de mercado exige CNPJ OU nome do orgao; sem nenhum, retorna HTTP 400 | UC-ME02 | RF-050 + app.py:11267 |
| RN-074 | Taxa de vitoria do concorrente: `ganhos / max(participados, 1) * 100`, arredondada 1 casa | UC-ME03 | RF-049 + app.py:11790 |
| RN-073 | Alerta visual amarelo quando >=2 editais similares perdidos para concorrentes | UC-ME03, UC-AN05 | RF-049 + Captacao UC-CV11 |
| RN-037 | Audit log universal em todas as operacoes CRUD e transicoes de estado | Todos os UCs | RF-056 |
| RN-084 | Cooldown de 60s entre invocacoes DeepSeek pesadas | UC-ME04, UC-AP02 | RF-041-02 |
| RN-132 | Audit de invocacoes DeepSeek (tool_name, input_hash, user, timestamp) | UC-ME01, UC-ME04, UC-AP02 | RF-041-02 |
| RN-196 | KPIs CRM: "analisados" e "participados" sao conjuntos distintos de stages do pipeline | UC-AN01, UC-AN02 | RF-045-05 + crm_routes |
| RN-165 | Pipeline CRM tem exatamente 13 stages imutaveis | UC-AN01 | RF-045-01 |
| RN-193 | Decisao de nao-participacao exige motivo + justificativa + LOG | UC-AN05 | RF-045-01 + UC-CRM06 |
| RN-NEW-01 | TAM inclui todos os editais nos segmentos do portfolio, sem filtro geografico | UC-ME01 | RF-050 (nova) |
| RN-NEW-02 | SAM = TAM filtrado por UFs + NCMs + faixa de valor da empresa | UC-ME01 | RF-050 (nova) |
| RN-NEW-03 | SOM = SAM * taxa_vitoria_historica * fator_capacidade | UC-ME01 | RF-050 (nova) |
| RN-NEW-04 | Item intruso: item cujo NCM nao pertence ao portfolio da empresa E cujo valor > 5% do total do edital | UC-ME04 | RF-048/049 (nova) |
| RN-NEW-05 | Sugestao da IA requer aceite/rejeite explicito; nunca aplica automaticamente | UC-AP02 | RF-055 (nova) |
| RN-NEW-06 | Padrao detectado requer confianca >= 50% para ser exibido; >= 70% para gerar sugestao | UC-AP03 | RF-055 (nova) |

**Total de RNs nesta sprint:** 16 (10 existentes + 6 novas).

---

## INDICE

### FASE 1 — MERCADO (TAM/SAM/SOM + CONCORRENCIA + ITENS INTRUSOS)
- [UC-ME01] Dashboard TAM/SAM/SOM
- [UC-ME02] Distribuicao Geografica do Mercado
- [UC-ME03] Participacao de Mercado (Share vs Concorrentes)
- [UC-ME04] Detectar Itens Intrusos em Edital via IA

### FASE 2 — ANALYTICS CONSOLIDADO
- [UC-AN01] Funil de Conversao do Pipeline CRM
- [UC-AN02] Taxas de Conversao Detalhadas
- [UC-AN03] Tempo Medio entre Etapas do Pipeline
- [UC-AN04] ROI Estimado do Sistema
- [UC-AN05] Analise de Perdas com Recomendacoes IA

### FASE 3 — PIPELINE DE APRENDIZADO CONTINUO
- [UC-AP01] Consultar Feedbacks Registrados
- [UC-AP02] Sugestoes da IA Baseadas em Aprendizado
- [UC-AP03] Padroes Detectados pela IA

---

## RESUMO DE IMPLEMENTACAO

| UC | Nome | Fase | Tipo | Pagina Alvo | Aba / Posicao | Status |
|----|------|------|------|-------------|---------------|--------|
| UC-ME01 | Dashboard TAM/SAM/SOM | Mercado | **EXPANSAO** MercadoPage | `MercadoPage.tsx` | Aba "TAM/SAM/SOM" (default) | ⬜ NAO IMPLEMENTADO |
| UC-ME02 | Distribuicao Geografica SAM | Mercado | **EXPANSAO** CRMPage | `CRMPage.tsx` | Aba Mapa (existente) | ⬜ NAO IMPLEMENTADO |
| UC-ME03 | Share vs Concorrentes | Mercado | **EXPANSAO** ConcorrenciaPage | `ConcorrenciaPage.tsx` | Secao nova acima da tabela | ⬜ NAO IMPLEMENTADO |
| UC-ME04 | Itens Intrusos via IA | Mercado | **NOVO** | `MercadoPage.tsx` | Aba "Intrusos" (nova) | ⬜ NAO IMPLEMENTADO |
| UC-AN01 | Funil do Pipeline CRM | Analytics | **NOVO** | `AnalyticsPage.tsx` | Aba "Pipeline" | ⬜ NAO IMPLEMENTADO |
| UC-AN02 | Taxas de Conversao | Analytics | **NOVO** | `AnalyticsPage.tsx` | Aba "Conversoes" | ⬜ NAO IMPLEMENTADO |
| UC-AN03 | Tempo entre Etapas | Analytics | **NOVO** | `AnalyticsPage.tsx` | Aba "Tempos" | ⬜ NAO IMPLEMENTADO |
| UC-AN04 | ROI do Sistema | Analytics | **NOVO** | `AnalyticsPage.tsx` | Aba "ROI" | ⬜ NAO IMPLEMENTADO |
| UC-AN05 | Perdas + Recomendacoes IA | Analytics | **EXPANSAO** PerdasPage | `PerdasPage.tsx` | Adiciona recomendacoes IA | ⬜ NAO IMPLEMENTADO |
| UC-AP01 | Feedbacks Registrados | Aprendizado | **NOVO** | `AprendizadoPage.tsx` | Aba "Feedbacks" | ⬜ NAO IMPLEMENTADO |
| UC-AP02 | Sugestoes da IA | Aprendizado | **NOVO** | `AprendizadoPage.tsx` | Aba "Sugestoes" | ⬜ NAO IMPLEMENTADO |
| UC-AP03 | Padroes Detectados | Aprendizado | **NOVO** | `AprendizadoPage.tsx` | Aba "Padroes" | ⬜ NAO IMPLEMENTADO |

**Totais:** 0 implementados + 0 parciais + 12 nao implementados = **12 casos de uso**
**Tipos:** 3 EXPANSOES (ME02→CRMPage, ME03→ConcorrenciaPage, AN05→PerdasPage) + 1 EXPANSAO (ME01→MercadoPage) + 8 NOVOS

---

# FASE 1 — MERCADO (TAM/SAM/SOM + CONCORRENCIA + ITENS INTRUSOS)

---

## [UC-ME01] Dashboard TAM/SAM/SOM

**RNs aplicadas:** RN-059 (cache 30d), RN-037 (audit log), RN-132 (audit invocacao), RN-NEW-01 (TAM sem filtro geo), RN-NEW-02 (SAM com filtro), RN-NEW-03 (SOM com taxa vitoria)

**RF relacionado:** RF-050 (Mercado TAM/SAM/SOM)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Portfolio da empresa possui pelo menos 5 produtos cadastrados
3. Historico de editais captados existe (Sprints 2/6)
4. Parametrizacoes de UFs de atuacao e NCMs estao configuradas

### Pos-condicoes
1. Usuario visualiza o dimensionamento TAM/SAM/SOM com valores atualizados
2. Registro de consulta gravado em `AuditoriaLog` (RN-037)
3. Cache de 30 dias criado (RN-059) — proxima consulta usa cache se < 30d

### Sequencia de Eventos

1. Usuario acessa MercadoPage (`/app/mercado`) via menu lateral "Indicadores > Mercado"
2. [Cabecalho: "Analise de Mercado"] exibe titulo da pagina com subtitulo "TAM/SAM/SOM e Deteccao de Intrusos"
3. [Secao: Abas] mostra 2 tabs: TAM/SAM/SOM (default), Intrusos (UC-ME04)
   **Nota:** Mapa fica na aba Mapa do CRMPage (UC-ME02). Concorrencia fica na ConcorrenciaPage (UC-ME03).
4. Na [Aba: "TAM/SAM/SOM"] (default), [Secao: Filtros] exibe [Select: "Segmento"] (Todos/Hematologia/Bioquimica/Coagulacao/etc.), [Select: "Periodo"] (3m/6m/12m), [Botao: "Recalcular"] (forca cache, RN-059)
5. [Card: "Funil de Mercado"] exibe 3 indicadores em formato funil vertical:
   - TAM: total de editais no(s) segmento(s) no periodo, com valor acumulado em R$
   - SAM: subconjunto filtrado por UFs + NCMs + faixa de valor, com valor acumulado
   - SOM: SAM * taxa_vitoria * fator_capacidade, com valor estimado de captura
6. Cada indicador mostra: [Valor em R$], [Quantidade de editais], [% relativa ao anterior] (SAM/TAM = Taxa Cobertura, SOM/SAM = Taxa Penetracao)
7. [Card: "Stat Cards — grid 4 colunas"] exibe: Editais no Periodo (total TAM), Valor Total TAM (R$), Valor Medio por Edital (R$), Taxa de Penetracao SOM/SAM (%)
8. [Card: "Tendencias"] exibe grafico de barras com editais por mes (ja existe, expandido com linha de SOM sobreposta)
9. [Card: "Categorias Mais Demandadas"] exibe grid de categorias com percentual e valor medio (ja existe)
10. [Card: "Evolucao de Precos"] exibe grafico de linha com preco medio por segmento ao longo do periodo
11. Se cache expirado (> 30 dias): sistema recalcula automaticamente com loading spinner

### Tela(s) Representativa(s)

**Pagina:** MercadoPage (`/app/mercado`)
**Posicao:** Aba "TAM/SAM/SOM"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Analise de Mercado                                           |
|  TAM/SAM/SOM e Deteccao de Intrusos                           |
|                                                               |
|  +-----------+  +---------+                                   |
|  |TAM/SAM/SOM|  |Intrusos |                                   |
|  +-----------+  +---------+                                   |
|  (Mapa→CRMPage, Concorrencia→ConcorrenciaPage)               |
|                                                               |
|  [Filtros]                                                    |
|  Segmento: [Todos v]  Periodo: [12 meses v]  [Recalcular]   |
|                                                               |
|  +-------------------+  +---------+ +---------+ +---------+  |
|  | FUNIL DE MERCADO  |  |Editais  | |Valor    | |Valor    |  |
|  |                   |  |Periodo  | |Total TAM| |Medio    |  |
|  |  +-------------+  |  |  1.247  | |R$ 892M  | |R$ 715K  |  |
|  |  |    TAM      |  |  +---------+ +---------+ +---------+  |
|  |  | 1.247 ed.   |  |  +---------+                          |
|  |  | R$ 892M     |  |  |Penetra- |                          |
|  |  +-------------+  |  |cao      |                          |
|  |  |   SAM       |  |  | 12.3%   |                          |
|  |  |  412 ed.    |  |  +---------+                          |
|  |  |  R$ 298M    |  |                                       |
|  |  | (33% TAM)   |  |                                       |
|  |  +-------------+  |                                       |
|  |  |  SOM        |  |                                       |
|  |  |  51 ed.     |  |                                       |
|  |  |  R$ 36.7M   |  |                                       |
|  |  | (12.3% SAM) |  |                                       |
|  |  +-------------+  |                                       |
|  +-------------------+                                       |
|                                                               |
|  +------ Tendencias de Editais --------+                     |
|  | [Grafico barras: editais por mes]   |                     |
|  | [Linha sobreposta: SOM por mes]     |                     |
|  +-------------------------------------+                     |
|                                                               |
|  +---- Categorias Mais Demandadas -----+                     |
|  | Hematologia      38%  ████████████  |                     |
|  | Bioquimica       25%  ████████      |                     |
|  | Coagulacao       18%  ██████        |                     |
|  | Imunologia       12%  ████          |                     |
|  | Biomol/PCR        7%  ██            |                     |
|  +-------------------------------------+                     |
|                                                               |
|  +---- Evolucao de Precos por Segmento -+                    |
|  | [Grafico linha: preco medio por mes] |                    |
|  | Segmentos: cores diferentes por linha|                    |
|  +--------------------------------------+                    |
|                                                               |
|                                       [Floating Chatbox IA]  |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Funil TAM/SAM/SOM (3 niveis), Stat Cards (4), Tendencias (grafico barras), Categorias (barras horizontais), Evolucao de Precos (grafico linha)
- **Preenchidos (input):** Segmento, Periodo, Botao Recalcular
- **Obtidos (resposta do sistema):** Dimensionamento calculado, cache atualizado, graficos renderizados

### Excecoes
- **E1:** Portfolio vazio ou com menos de 5 produtos — banner: "Cadastre pelo menos 5 produtos no portfolio para dimensionar o mercado"
- **E2:** Nenhum edital no historico — stat cards mostram zero com mensagem: "Execute monitoramentos (Sprint 6) para capturar editais"
- **E3:** Cache invalido e recalculo falha — toast de erro: "Falha ao calcular TAM/SAM/SOM. Tente novamente."

---

## [UC-ME02] Distribuicao Geografica do Mercado (EXPANSAO — CRMPage aba Mapa)

**Tipo:** EXPANSAO da aba Mapa existente em `CRMPage.tsx`
**O que JA EXISTE:** Mapa Leaflet/OpenStreetMap com `MapContainer`, `TileLayer`, `CircleMarker` por UF. Popup mostra nome da UF, quantidade de editais e breakdown por pipeline_stage. Endpoint: `GET /api/crm/mapa`. Arquivo: `frontend/src/pages/CRMPage.tsx` (539L, aba Mapa).

**RNs aplicadas:** RN-059 (cache 30d), RN-037 (audit log)

**RF relacionado:** RF-050
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Dados do TAM/SAM ja calculados (UC-ME01)
3. Editais possuem campo UF preenchido
4. Mapa Leaflet ja funcional na aba Mapa do CRM (Sprint 5)

### Pos-condicoes
1. Aba Mapa do CRM expandida com camada SAM e stat cards de oportunidade
2. Ranking de UFs visivel abaixo do mapa

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA ao mapa existente)

1. Usuario acessa CRMPage (`/app/crm`) e clica na aba "Mapa" (JA EXISTE)
2. **NOVO:** [Card: "Stat Cards — grid 3"] acima do mapa: UF com Maior Oportunidade, UF com Menor Participacao, UFs sem Presenca
3. **NOVO:** [Filtros adicionais]: [Select: "Segmento"] (Todos/Hematologia/...), [Select: "Metrica"] (Quantidade / Valor R$)
4. **EXPANDIDO:** Cores dos CircleMarker agora refletem oportunidade SAM: verde escuro (alta) → amarelo → cinza (zero)
5. **EXPANDIDO:** Popup ao clicar UF agora inclui: valor R$, top 3 orgaos compradores, taxa participacao empresa, [Link: "Ver editais desta UF"]
6. **NOVO:** [Card: "Ranking de UFs"] abaixo do mapa — DataTable: UF, Editais (SAM), Valor Total, Participados, Taxa %, Gap (oportunidade nao captada)
7. **EXPANDIDO:** Endpoint `GET /api/crm/mapa` recebe params adicionais: `segmento`, `metrica`. Retorno expandido com stat cards SAM e ranking

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`) — NAO MercadoPage
**Posicao:** Aba "Mapa" (EXISTENTE, expandida)

#### Layout da Tela (mostra APENAS os elementos NOVOS/EXPANDIDOS)

```
+---------------------------------------------------------------+
|  CRM > Mapa                                                   |
|                                                               |
|  [Pipeline] [Param.] [Mapa] [Agenda] [KPIs] [Decisoes]       |
|                                                               |
|  === ELEMENTOS NOVOS (Sprint 7) ===                           |
|                                                               |
|  [Filtros NOVOS] Segmento: [Todos v]  Metrica: [Qtd v]       |
|                                                               |
|  +---------+  +----------+  +-----------+  (NOVO)             |
|  |Maior    |  |Menor     |  |Sem        |                     |
|  |Oportuni.|  |Participac|  |Presenca   |                     |
|  |SP (142) |  |BA (0.5%) |  |AC,RR,AP   |                     |
|  +---------+  +----------+  +-----------+                     |
|                                                               |
|  +---- Mapa Leaflet/OSM (JA EXISTE) ------+                  |
|  |  CircleMarker por UF (JA EXISTE)        |                  |
|  |  EXPANDIDO: cores por oportunidade SAM  |                  |
|  |  EXPANDIDO: popup com valor R$, orgaos  |                  |
|  +------------------------------------------+                 |
|                                                               |
|  +------ Ranking de UFs (NOVO) -----+                         |
|  |UF |Editais|Valor   |Part.|Taxa |Gap     |                 |
|  |SP |  142  |R$ 98M  | 28  |19.7%|114 ed. |                 |
|  |MG |   87  |R$ 52M  | 15  |17.2%| 72 ed. |                 |
|  +--------------------------------+                           |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Stat Cards SAM (3), Ranking de UFs (DataTable)
- **EXPANDIDOS (leitura):** Cores do mapa por oportunidade, Popup com valor R$ + orgaos + link
- **NOVOS (input):** Filtro Segmento, Filtro Metrica
- **JA EXISTENTES (nao alterar):** MapContainer, TileLayer, CircleMarker, popup basico por pipeline_stage

### Excecoes
- **E1:** Nenhum edital com UF preenchida — stat cards zerados, mapa mantém CircleMarkers existentes sem camada SAM

---

## [UC-ME03] Participacao de Mercado — Share vs Concorrentes (EXPANSAO — ConcorrenciaPage)

**Tipo:** EXPANSAO da pagina existente `ConcorrenciaPage.tsx`
**O que JA EXISTE:** Tabela de concorrentes com colunas Nome/CNPJ/Vitorias/Derrotas/Taxa Sucesso/Preco Medio + detalhe com stat cards (Vitorias/Derrotas) + sub-tabela historico de licitacoes + botao "Analisar via IA". Endpoints: `GET /api/concorrentes/listar`, `GET /api/crud/precos-historicos`. Arquivo: `frontend/src/pages/ConcorrenciaPage.tsx` (231L).

**RNs aplicadas:** RN-074 (taxa vitoria concorrente), RN-073 (alerta >=2 perdas para concorrente), RN-037 (audit log)

**RF relacionado:** RF-049 (Concorrencia), RF-050
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Tabela `concorrentes` possui pelo menos 1 registro (JA EXISTE do Sprint 5)
3. ConcorrenciaPage ja funcional com tabela e detalhe (Sprint 5)

### Pos-condicoes
1. ConcorrenciaPage expandida com grafico de share e stat cards estrategicos
2. Badge de alerta RN-073 visivel na tabela existente

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA a ConcorrenciaPage)

1. Usuario acessa ConcorrenciaPage (`/app/concorrencia`) via menu lateral "Indicadores > Concorrencia" (JA EXISTE)
2. **NOVO:** [Card: "Stat Cards — grid 4"] acima da tabela existente: Concorrentes Conhecidos (total), Nossa Taxa de Vitoria (%), Maior Ameaca (concorrente com mais vitorias), Editais Disputados Juntos (total)
3. **NOVO:** [Card: "Filtros"] adicionais: [Select: "Segmento"], [Select: "UF"], [Select: "Periodo"] (adicionar aos filtros de busca existentes)
4. **NOVO:** [Card: "Share de Mercado"] grafico de barras horizontais:
   - Cada barra: nome do player + % editais ganhos no segmento
   - Barra da empresa em azul, concorrentes em cinza
   - Ordenado por taxa de vitoria descendente
5. **JA EXISTE:** Tabela de concorrentes com colunas Nome/CNPJ/Vitorias/Derrotas/Taxa/Preco Medio (MANTER)
6. **NOVO:** [Badge: "Alerta"] (RN-073) amarelo na tabela existente se >= 2 editais perdidos para concorrente
7. **EXPANDIDO:** Modal de detalhe existente — adicionar: UFs de atuacao, tendencia (subindo/caindo)
8. **NOVO:** Endpoint `GET /api/dashboard/mercado/share` para dados agregados de share

### Tela(s) Representativa(s)

**Pagina:** ConcorrenciaPage (`/app/concorrencia`) — NAO MercadoPage
**Posicao:** Secao nova acima da tabela existente

#### Layout da Tela (mostra APENAS os elementos NOVOS)

```
+---------------------------------------------------------------+
|  Concorrencia                                                 |
|                                                               |
|  === ELEMENTOS NOVOS (Sprint 7) ===                           |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Concorrent.|  |Nossa Taxa |  |Maior      |  |Disputas   |   |
|  |Conhecidos |  |de Vitoria |  |Ameaca     |  |Juntos     |   |
|  |    14     |  |  28.5%    |  |MedLab Sul |  |   87      |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  [Filtros NOVOS] Segmento: [Hemato v]  UF: [Todos v]         |
|  Periodo: [12m v]                                              |
|                                                               |
|  +------- Share de Mercado (%) (NOVO) ----+                   |
|  | CH Hospitalar  28.5%  ████████ (azul)                     |
|  | MedLab Sul     24.2%  ███████  (cinza)                    |
|  | DiagTech       18.1%  █████    (cinza)                    |
|  +-------------------------------------+                     |
|                                                               |
|  === TABELA EXISTENTE (Sprint 5) — manter ===                |
|  +---- Tabela Concorrentes (JA EXISTE) ---+                   |
|  |Nome      |CNPJ  |Vitor.|Derrot.|Taxa|Preco M.|Acao      | |
|  |MedLab Sul|12.34.|  18  |  34   |34.6|R$680K  |[Det][IA] | |
|  |          |      |      |       |    |  [!]   |          | |
|  +---------------------------------------------+             |
|  [!] = Badge alerta NOVO (RN-073)                            |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Stat Cards (4), Grafico share (barras horizontais), Badge alerta RN-073
- **NOVOS (input):** Filtros Segmento, UF, Periodo
- **EXPANDIDOS:** Modal detalhe (+ UFs atuacao, tendencia)
- **JA EXISTENTES (nao alterar):** Tabela concorrentes, busca, detalhe com historico, botao IA

### Excecoes
- **E1:** Nenhum concorrente cadastrado — stat cards zerados, grafico share vazio (tabela existente mostra CTA)
- **E2:** Sem participacoes no periodo — stat cards zerados, grafico vazio

---

## [UC-ME04] Detectar Itens Intrusos em Edital via IA

**RNs aplicadas:** RN-084 (cooldown DeepSeek), RN-132 (audit invocacao), RN-037 (audit log), RN-NEW-04 (criterio item intruso)

**RF relacionado:** RF-048, RF-049
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Tool `tool_detectar_itens_intrusos` registrada no catalogo DeepSeek
3. Portfolio da empresa cadastrado com NCMs

### Pos-condicoes
1. Lista de itens intrusos detectados gravada em banco
2. Alertas gerados para itens criticos (valor > 10% do edital)
3. Log de invocacao gravado (RN-132)

### Sequencia de Eventos

1. Usuario acessa MercadoPage e clica na [Aba: "Intrusos"]
2. [Card: "Stat Cards — grid 3"] exibe: Intrusos Detectados (total), Editais Afetados (qtd), Valor em Risco (R$ — soma dos itens intrusos)
3. [Card: "Filtros"] permite: [Select: "Criticidade"] (Todos/Critico/Medio/Informativo), [Select: "Periodo"], [TextInput: "Buscar edital"]
4. [Card: "Itens Intrusos Detectados"] exibe DataTable: Edital, Item, NCM, Valor do Item, % do Edital, Criticidade, Acao Sugerida
5. Criticidade calculada: >10% do edital = Critico (vermelho), 5-10% = Medio (amarelo), <5% = Informativo (azul) (RN-NEW-04)
6. [Botao: "Analisar Novo Edital"] abre [Modal: "Detectar Itens Intrusos"]
7. Modal exibe: [TextInput: "Numero do Edital"] ou [Select: "Selecionar edital da lista"]
8. Usuario seleciona edital e clica [Botao: "Analisar com IA"]
9. Sistema verifica cooldown (RN-084), invoca `tool_detectar_itens_intrusos` via DeepSeek
10. Tool compara NCMs dos itens do edital vs NCMs do portfolio da empresa
11. Itens com NCM fora do portfolio sao classificados como intrusos
12. Resultado exibido na tabela com badge de criticidade
13. Toast: "Analise concluida: {N} itens intrusos detectados no edital {numero}"

### Tela(s) Representativa(s)

**Pagina:** MercadoPage
**Posicao:** Aba "Intrusos"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Mercado > Itens Intrusos                                     |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Intrusos   |  |Editais    |  |Valor em   |                  |
|  |Detectados |  |Afetados   |  |Risco      |                  |
|  |    23     |  |    8      |  |R$ 1.2M    |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  [Filtros] Criticidade: [Todos v]  Periodo: [6m v]            |
|  Buscar edital: [________________]  [Analisar Novo Edital]    |
|                                                               |
|  +---- Itens Intrusos Detectados ---------+                   |
|  |Edital      |Item           |NCM   |Valor  |% Ed.|Crit.|   |
|  |PE 2034/SP  |Calibrador sem |9027  |R$180K | 12% |[!!!]|   |
|  |            |valor de venda |      |       |     |     |   |
|  |PE 2089/MG  |Equip. osmose  |8421  |R$ 95K |  8% |[!! ]|   |
|  |            |reversa        |      |       |     |     |   |
|  |PE 2103/RJ  |Insumo limpeza |3402  |R$ 12K |  2% |[ i ]|   |
|  +--------------------------------------------+               |
|  [!!!] = Critico (>10%)  [!!] = Medio (5-10%)  [i] = Info    |
|                                                               |
|  +---- Modal: Detectar Itens Intrusos ----+                   |
|  | Edital: [Select ou digitar numero v]   |                   |
|  |                                        |                   |
|  | [Analisar com IA]  [Cancelar]          |                   |
|  +----------------------------------------+                   |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Tabela intrusos com criticidade, Badge colorido
- **Preenchidos (input):** Filtros (Criticidade, Periodo, Busca), Modal (numero do edital)
- **Obtidos (resposta do sistema):** Lista de itens intrusos com NCM, valor, criticidade, acao sugerida

### Excecoes
- **E1:** Edital nao encontrado — modal exibe erro "Edital nao encontrado no sistema"
- **E2:** Edital sem itens — toast: "Edital sem itens detalhados para analisar"
- **E3:** Cooldown ativo (RN-084) — toast: "Aguarde {N}s antes de nova analise"

---

# FASE 2 — ANALYTICS CONSOLIDADO

---

## [UC-AN01] Funil de Conversao do Pipeline CRM (NOVO — AnalyticsPage)

**Tipo:** NOVO — AnalyticsPage (pagina nova)
**Diferenca do CRM KPIs:** A aba KPIs do CRMPage (Sprint 5) mostra 8 stat cards AGREGADOS (total editais, analisados, participados, ganhos, perdidos, taxas, tickets). O UC-AN01 mostra um FUNIL VISUAL com as 13 etapas INDIVIDUAIS e taxa de conversao entre CADA PAR de etapas. Sao vistas complementares, nao duplicadas.

**RNs aplicadas:** RN-165 (13 stages imutaveis), RN-196 (KPIs analisados/participados), RN-037 (audit log)

**RF relacionado:** RF-053, RF-050, RF-045-05
**Ator:** Usuario (Diretor, Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Pipeline CRM com pelo menos 10 editais distribuidos em stages
3. Dados do CRM da Sprint 5 disponiveis (UC-CRM01..CRM07)

### Pos-condicoes
1. Usuario visualiza funil de conversao completo do pipeline
2. Identifica gargalos (etapas com baixa conversao)

### Sequencia de Eventos

1. Usuario acessa AnalyticsPage (`/app/analytics`) via menu lateral "Indicadores > Analytics"
2. [Cabecalho: "Analytics"] exibe titulo com subtitulo "Performance, Conversoes e ROI"
3. [Secao: Abas] mostra 4 tabs: Pipeline (default), Conversoes, Tempos, ROI
   **Nota:** Perdas NAO e aba do AnalyticsPage — UC-AN05 EXPANDE a PerdasPage existente (`/app/perdas`)
4. Na [Aba: "Pipeline"], [Card: "Filtros"] exibe: [Select: "Periodo"], [Select: "Segmento"], [Select: "UF"]
5. [Card: "Funil do Pipeline"] exibe grafico de funil visual com as 13 etapas (RN-165):
   - captado_nao_divulgado → captado_divulgado → em_analise → lead_potencial → monitoramento_concorrencia → em_impugnacao → fase_propostas → proposta_submetida → espera_resultado → ganho_provisorio → processo_recurso → contra_razao → resultado_definitivo
   - Cada etapa mostra: nome, quantidade de editais, valor acumulado (R$), taxa de conversao para a proxima
6. [Card: "Stat Cards — grid 4"] exibe: Total no Pipeline, Analisados (RN-196), Participados (RN-196), Resultado Definitivo (ganhos + perdidos)
7. [Card: "Tabela de Conversao por Etapa"] DataTable: Etapa, Entrada, Saida, Conversao %, Valor Acumulado
8. Cores do funil: verde (conversao > 60%), amarelo (30-60%), vermelho (< 30%)

### Tela(s) Representativa(s)

**Pagina:** AnalyticsPage (`/app/analytics`)
**Posicao:** Aba "Pipeline"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Analytics                                                    |
|  Performance, Conversoes e ROI                                |
|                                                               |
|  +--------+  +----------+  +-------+  +-----+                 |
|  |Pipeline|  |Conversoes|  |Tempos |  |ROI  |                 |
|  +--------+  +----------+  +-------+  +-----+                 |
|  (Perdas NAO e aba aqui — UC-AN05 expande PerdasPage)         |
|                                                               |
|  [Filtros] Periodo: [12m v]  Segmento: [Todos v]  UF: [v]   |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Total      |  |Analisados |  |Particip.  |  |Resultado  |   |
|  |Pipeline   |  |(RN-196)   |  |(RN-196)   |  |Definitivo |   |
|  |   247     |  |   189     |  |   142     |  |    98     |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  +------------ Funil do Pipeline ---------------+             |
|  |                                              |             |
|  |  captado_nao_div     ████████████████  247   |             |
|  |  captado_divulgado   ██████████████    220   |             |
|  |  em_analise          ████████████      189   |             |
|  |  lead_potencial      ██████████        165   |             |
|  |  fase_propostas      ████████          142   |             |
|  |  proposta_submetida  ██████            118   |             |
|  |  espera_resultado    █████             105   |             |
|  |  resultado_definit.  ████               98   |             |
|  |                                              |             |
|  |  Legenda: ██ >60%  ██ 30-60%  ██ <30%       |             |
|  +----------------------------------------------+             |
|                                                               |
|  +--- Conversao por Etapa ---+                                |
|  |Etapa          |Entra|Sai|% Conv|                           |
|  |capt→divulg    | 247 |220| 89%  |                           |
|  |divulg→analise | 220 |189| 86%  |                           |
|  |analise→lead   | 189 |165| 87%  |                           |
|  |lead→propostas | 165 |142| 86%  |                           |
|  |prop→submetida | 142 |118| 83%  |                           |
|  |submet→espera  | 118 |105| 89%  |                           |
|  |espera→result  | 105 | 98| 93%  |                           |
|  +-----------------------------+                              |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Funil visual (13 etapas), Stat Cards (4), Tabela conversao por etapa
- **Preenchidos (input):** Periodo, Segmento, UF
- **Obtidos (resposta do sistema):** Funil renderizado, taxas de conversao, gargalos identificados

---

## [UC-AN02] Taxas de Conversao Detalhadas

**RNs aplicadas:** RN-196, RN-037

**RF relacionado:** RF-053, RF-050
**Ator:** Usuario (Diretor, Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Historico de editais com resultado (ganho/perdido) existe

### Pos-condicoes
1. Usuario visualiza taxas de conversao segmentadas por tipo, UF e segmento

### Sequencia de Eventos

1. Usuario clica na [Aba: "Conversoes"]
2. [Card: "Stat Cards — grid 4"] exibe: Taxa Geral (%), Melhor Segmento (nome + %), Melhor UF (nome + %), Contribuicao Automatica (% editais via monitoramento)
3. [Card: "Taxa por Tipo de Edital"] tabela: Tipo (Pregao/Concorrencia/Dispensa/Outro), Participados, Ganhos, Taxa %, Benchmark anterior (seta verde/vermelha)
4. [Card: "Taxa por UF"] tabela: UF, Participados, Ganhos, Taxa %, Benchmark
5. [Card: "Taxa por Segmento"] tabela: Segmento, Participados, Ganhos, Taxa %, Benchmark
6. Benchmark: compara o mesmo indicador no periodo anterior (ex.: ultimos 6m vs 6m anteriores)
7. [Badge: "↑ +3.2%"] (verde, subiu) ou [Badge: "↓ -1.5%"] (vermelho, caiu)

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Analytics > Conversoes                                       |
|                                                               |
|  +---------+  +---------+  +---------+  +---------+           |
|  |Taxa     |  |Melhor   |  |Melhor   |  |Contribu.|           |
|  |Geral    |  |Segmento |  |UF       |  |Automat. |           |
|  | 28.5%   |  |Hemato   |  |RJ       |  | 42%     |           |
|  |  ↑+2.1% |  | 35.2%   |  | 38.1%   |  |         |           |
|  +---------+  +---------+  +---------+  +---------+           |
|                                                               |
|  +--- Taxa por Tipo ----+  +--- Taxa por UF -----+           |
|  |Tipo     |Part|Gan|%  |  |UF  |Part|Gan|%  |Bm |           |
|  |Pregao   |102 | 30|29%|  |SP  | 42 | 12|29%| ↑ |           |
|  |Concorr. | 28 |  8|29%|  |MG  | 28 |  7|25%| ↓ |           |
|  |Dispensa | 12 |  5|42%|  |RJ  | 21 |  8|38%| ↑ |           |
|  +----------------------+  +----------------------+           |
|                                                               |
|  +--- Taxa por Segmento --------+                             |
|  |Segmento    |Part|Ganhos|%    |Benchmark                   |
|  |Hematologia |  52|   18 |35.2%| ↑ +4.1% vs periodo ant.   |
|  |Bioquimica  |  38|   10 |26.3%| ↓ -1.8%                   |
|  |Coagulacao  |  24|    6 |25.0%| = estavel                  |
|  +-------------------------------+                            |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (4), 3 tabelas de taxa (por tipo, UF, segmento) com benchmarks
- **Preenchidos (input):** Filtros herdados da aba Pipeline
- **Obtidos (resposta do sistema):** Taxas calculadas, tendencias vs periodo anterior

---

## [UC-AN03] Tempo Medio entre Etapas do Pipeline

**RNs aplicadas:** RN-165, RN-037

**RF relacionado:** RF-053
**Ator:** Usuario (Diretor, Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Editais com timestamps de transicao entre stages no pipeline

### Pos-condicoes
1. Usuario identifica gargalos de tempo no pipeline

### Sequencia de Eventos

1. Usuario clica na [Aba: "Tempos"]
2. [Card: "Stat Cards — grid 3"] exibe: Tempo Total Medio (dias, captacao → resultado), Etapa Mais Lenta (nome + dias), Etapa Mais Rapida (nome + dias)
3. [Card: "Tempo por Transicao"] exibe grafico de barras horizontais: cada barra = uma transicao de etapa, largura proporcional ao tempo medio em dias
4. Cores: verde (<7d), amarelo (7-30d), vermelho (>30d)
5. [Card: "Tabela Detalhada"] DataTable: Transicao, Tempo Medio (dias), Mediana (dias), Min, Max, Desvio Padrao
6. [Badge: "Gargalo"] aparece em vermelho na transicao com maior tempo medio
7. [Card: "Distribuicao Temporal"] histograma por faixa de dias para a transicao selecionada

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Analytics > Tempos                                           |
|                                                               |
|  +-----------+  +------------+  +------------+                |
|  |Tempo Total|  |Mais Lenta  |  |Mais Rapida |                |
|  |Medio      |  |            |  |            |                |
|  |  67 dias  |  |espera→res. |  |capt→divulg |                |
|  |           |  |  38 dias   |  |  0.5 dias  |                |
|  +-----------+  +------------+  +------------+                |
|                                                               |
|  +---- Tempo por Transicao (barras) -----+                    |
|  | capt→divulg      █  0.5d                                  |
|  | divulg→analise   ██  2d                                   |
|  | analise→lead     ████  5d                                 |
|  | lead→propostas   ███████  8d                              |
|  | prop→submetida   ████  5d                                 |
|  | submet→espera    ██  3d                                   |
|  | espera→resultado ██████████████████████  38d [GARGALO]    |
|  | result→definitivo █  1d                                   |
|  +-------------------------------------------+               |
|                                                               |
|  +--- Tabela Detalhada ----+                                  |
|  |Transicao       |Media|Mediana|Min|Max |DesvP|              |
|  |espera→resultado| 38d |  32d  | 5d|120d| 28d |              |
|  |lead→propostas  |  8d |   6d  | 1d| 25d|  5d |              |
|  +-------------------------+                                  |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Grafico barras horizontais, Tabela detalhada, Badge gargalo
- **Preenchidos (input):** Filtros (Periodo, Segmento)
- **Obtidos (resposta do sistema):** Tempos calculados, gargalos identificados, distribuicao

---

## [UC-AN04] ROI Estimado do Sistema

**RNs aplicadas:** RN-037

**RF relacionado:** RF-053
**Ator:** Usuario (Diretor)

### Pre-condicoes
1. Usuario autenticado
2. Editais ganhos com valor arrematado registrado
3. Recursos revertidos com valor registrado (Sprint 4)

### Pos-condicoes
1. Usuario visualiza ROI estimado do sistema

### Sequencia de Eventos

1. Usuario clica na [Aba: "ROI"]
2. [Card: "ROI Consolidado"] exibe indicador grande: ROI % = (Receita + Economias) / Custo estimado
3. [Card: "Componentes do ROI — grid 2x2"] exibe:
   - Receita Direta: soma dos valores arrematados em editais ganhos
   - Oportunidades Salvas: editais revertidos via recursos (Sprint 4) — valor estimado
   - Produtividade: horas economizadas vs processo manual (benchmark configuravel)
   - Prevencao de Perdas: valor de itens intrusos detectados antes de proposta (UC-ME04)
4. [Card: "Filtros"] permite: [Select: "Periodo"] (3m/6m/12m/total)
5. [Card: "Evolucao do ROI"] grafico de linha mostrando ROI % mes a mes
6. [Card: "Detalhamento"] DataTable: Componente, Valor (R$), % do Total, Tendencia

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Analytics > ROI                                              |
|                                                               |
|  +----------- ROI CONSOLIDADO ----------------+               |
|  |                                            |               |
|  |             ROI: 342%                      |               |
|  |      (verde, circulo com preenchimento)    |               |
|  |                                            |               |
|  +--------------------------------------------+               |
|                                                               |
|  Periodo: [12 meses v]                                        |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Receita    |  |Oportunid. |  |Produtivi- |  |Prevencao  |   |
|  |Direta     |  |Salvas     |  |dade       |  |de Perdas  |   |
|  |R$ 12.4M   |  |R$ 2.1M    |  |R$ 890K    |  |R$ 340K    |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  +---- Evolucao do ROI (%) ---+                               |
|  | [Grafico linha: ROI mes a mes]                             |
|  | Jan: 120% → Fev: 180% → Mar: 250% → ...                  |
|  +-----------------------------+                              |
|                                                               |
|  +---- Detalhamento ----+                                     |
|  |Componente     |Valor     |% Total|Tend. |                  |
|  |Receita direta |R$ 12.4M  |  79%  | ↑    |                  |
|  |Oport. salvas  |R$  2.1M  |  13%  | ↑    |                  |
|  |Produtividade  |R$  890K  |   6%  | =    |                  |
|  |Prev. perdas   |R$  340K  |   2%  | ↑    |                  |
|  +----------------------------+                               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** ROI % (indicador principal), 4 componentes, grafico evolucao, tabela detalhamento
- **Preenchidos (input):** Periodo
- **Obtidos (resposta do sistema):** ROI calculado, componentes, tendencia

---

## [UC-AN05] Analise de Perdas com Recomendacoes IA (EXPANSAO — PerdasPage)

**Tipo:** EXPANSAO da pagina existente `PerdasPage.tsx`
**O que JA EXISTE:** 3 stat cards (Total Perdas, Valor Total Perdido, Taxa de Perda), pie chart de motivos (preco/tecnica/documentacao/prazo/outro), tabela com colunas Edital/Orgao/Data/Motivo/Nosso Preco/Preco Vencedor/Diferenca/Vencedor, filtro periodo (3m/6m/12m). Endpoint: `GET /api/dashboard/perdas?periodo_dias=`. Arquivo: `frontend/src/pages/PerdasPage.tsx` (213L).

**RNs aplicadas:** RN-193 (decisao nao-participacao com motivo), RN-073 (alerta >=2 perdas), RN-037 (audit log)

**RF relacionado:** RF-053 (Perdas), RF-055 (Aprendizado)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Editais com resultado "perdido" e motivo registrado (UC-CRM07 Sprint 5)
3. PerdasPage ja funcional com stat cards, pie chart e tabela (Sprint 5)

### Pos-condicoes
1. PerdasPage expandida com recomendacoes IA e filtros adicionais
2. Insights aceitos alimentam Pipeline de Aprendizado (UC-AP01)

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA a PerdasPage)

1. Usuario acessa PerdasPage (`/app/perdas`) via menu lateral "Indicadores > Perdas" (JA EXISTE)
2. **JA EXISTE:** 3 stat cards (Total Perdas, Valor Perdido, Taxa de Perda) — MANTER
3. **NOVO:** [Stat Card 4]: "Top Motivo" (nome do motivo mais frequente)
4. **JA EXISTE:** Pie chart de motivos — MANTER
5. **NOVO:** [Filtros adicionais]: [Select: "Segmento"], [Select: "UF"] (adicionar ao filtro periodo existente)
6. **JA EXISTE:** Tabela de perdas — MANTER colunas existentes
7. **NOVO:** [Card: "Recomendacoes da IA"] exibe 3-5 insights:
   - Cada insight: [Icone: lampada], [Texto descritivo], [Botao: "Aplicar"], [Botao: "Rejeitar"]
   - Exemplo: "Voce perdeu 8 editais por preco em SP. Considere margem de 9% (atual 12%) em Hemato."
   - Exemplo: "3 perdas por doc. incompleta — certidao FGTS vencida em 2 casos."
8. **NOVO:** Insights aceitos criam registro em `AprendizadoFeedback` com `tipo_evento=feedback_usuario`
9. **NOVO:** [Botao: "Exportar CSV"] gera download do historico de perdas
10. **NOVO/EXPANDIDO:** Endpoint `GET /api/dashboard/analytics/perdas` (reutiliza logica de `/api/dashboard/perdas` + adiciona recomendacoes IA, filtros segmento/uf, stat card top_motivo)

### Tela(s) Representativa(s)

**Pagina:** PerdasPage (`/app/perdas`) — NAO AnalyticsPage
**Posicao:** Expansao da pagina existente

#### Layout da Tela (mostra JA EXISTE vs NOVO)

```
+---------------------------------------------------------------+
|  Perdas                                                       |
|                                                               |
|  === STAT CARDS (3 existentes + 1 NOVO) ===                  |
|  +---------+  +---------+  +---------+  +-----------+         |
|  |Total    |  |Valor    |  |Taxa de  |  |Top Motivo |         |
|  |Perdas   |  |Perdido  |  |Perda    |  |(NOVO)     |         |
|  |   42    |  |R$ 28.5M |  |  29.6%  |  |Preco      |         |
|  +---------+  +---------+  +---------+  +-----------+         |
|  (JA EXISTE) (JA EXISTE) (JA EXISTE) (NOVO Sprint 7)          |
|                                                               |
|  === FILTROS (periodo existe + segmento/UF NOVOS) ===        |
|  [Periodo: 6m v] [Segmento: Todos v (NOVO)] [UF: v (NOVO)]  |
|                                                               |
|  +---- Pie Chart Motivos (JA EXISTE) ----+                    |
|  | [Manter pie chart existente]           |                   |
|  +----------------------------------------+                   |
|                                                               |
|  +---- Tabela Perdas (JA EXISTE) --------+                    |
|  | [Manter tabela existente]              |                   |
|  +----------------------------------------+                   |
|                                                               |
|  === ELEMENTOS NOVOS (Sprint 7) ===                           |
|                                                               |
|  +---- Recomendacoes da IA (NOVO) ----+                       |
|  | lampada Voce perdeu 8 editais por preco em SP.             |
|  |    Considere margem de 9% (atual 12%) em Hemato.           |
|  |    [Aplicar]  [Rejeitar]                                   |
|  |                                                             |
|  | lampada 3 perdas por doc. incompleta — certidao FGTS       |
|  |    vencida em 2 casos.                                      |
|  |    [Aplicar]  [Rejeitar]                                   |
|  +--------------------------------------------+               |
|                                                               |
|  [Exportar CSV] (NOVO)                                        |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Stat Card "Top Motivo", Card Recomendacoes IA (3-5 insights)
- **NOVOS (input):** Filtros Segmento e UF, Botoes Aplicar/Rejeitar, Botao Exportar CSV
- **JA EXISTENTES (nao alterar):** 3 stat cards, pie chart, tabela perdas, filtro periodo

### Excecoes
- **E1:** Nenhuma perda registrada — stat cards zerados (mensagem existente mantida)
- **E2:** IA sem dados suficientes — card recomendacoes vazio: "Preciso de pelo menos 5 perdas registradas para gerar insights"

---

# FASE 3 — PIPELINE DE APRENDIZADO CONTINUO

---

## [UC-AP01] Consultar Feedbacks Registrados

**RNs aplicadas:** RN-037 (audit log), RN-NEW-05 (aceite explicito)

**RF relacionado:** RF-055 (Aprendizado Continuo)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Model `AprendizadoFeedback` tem registros (via resultados Sprint 5, ajustes Sprint 6)

### Pos-condicoes
1. Usuario visualiza todos os feedbacks que alimentam a base de conhecimento da IA

### Sequencia de Eventos

1. Usuario acessa AprendizadoPage (`/app/aprendizado`) via menu lateral "Indicadores > Aprendizado"
2. [Cabecalho: "Pipeline de Aprendizado"] exibe titulo com subtitulo "Feedbacks, Sugestoes e Padroes"
3. [Secao: Abas] mostra 3 tabs: Feedbacks (default), Sugestoes, Padroes
4. Na [Aba: "Feedbacks"], [Card: "Stat Cards — grid 4"] exibe: Total Feedbacks, Aplicados (qtd com `aplicado=true`), Pendentes (nao aplicados), Taxa de Adocao (%)
5. [Card: "Filtros"] permite: [Select: "Tipo"] (Todos/resultado_edital/score_ajustado/preco_ajustado/feedback_usuario), [Select: "Periodo"], [Select: "Entidade"]
6. [Card: "Feedbacks Registrados"] DataTable: Data, Tipo, Entidade, Resumo (dados_entrada resumido), Resultado (resultado_real resumido), Delta, Aplicado (badge), Acao
7. Coluna "Acao": [Botao: "Ver Detalhe"] abre [Modal: "Detalhe do Feedback"]
8. Modal mostra: JSON completo de `dados_entrada`, `resultado_real`, `delta`, metadados (user, timestamp)
9. [Badge: "Aplicado"] (verde) ou [Badge: "Pendente"] (cinza) — indica se a IA ja usou este feedback
10. [Botao: "Registrar Feedback Manual"] abre modal para registrar um feedback explicito do usuario

### Tela(s) Representativa(s)

**Pagina:** AprendizadoPage (`/app/aprendizado`)
**Posicao:** Aba "Feedbacks"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Pipeline de Aprendizado                                      |
|  Feedbacks, Sugestoes e Padroes                               |
|                                                               |
|  +---------+  +----------+  +-------+                         |
|  |Feedbacks|  |Sugestoes |  |Padroes|                         |
|  +---------+  +----------+  +-------+                         |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Total      |  |Aplicados  |  |Pendentes  |  |Taxa de    |   |
|  |Feedbacks  |  |           |  |           |  |Adocao     |   |
|  |   128     |  |    42     |  |    86     |  |  32.8%    |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  [Filtros] Tipo: [Todos v]  Periodo: [6m v]                  |
|  Entidade: [Todos v]              [Registrar Feedback Manual] |
|                                                               |
|  +---- Feedbacks Registrados -------+                         |
|  |Data    |Tipo           |Entidade |Resumo      |Aplic|Acao| |
|  |14/04   |resultado_     |Edital   |Score: 72   |[✓]  |[De]| |
|  |        |edital         |PE 2034  |Ganhou      |     |    | |
|  |12/04   |score_ajustado |Parametro|Peso tec:   |[ ]  |[De]| |
|  |        |               |Score    |0.4→0.6     |     |    | |
|  |10/04   |preco_ajustado |Produto  |Margem:     |[✓]  |[De]| |
|  |        |               |HB-A1C   |12%→9%      |     |    | |
|  |08/04   |feedback_      |Edital   |"Estrategia |[ ]  |[De]| |
|  |        |usuario        |PE 2089  | defensiva  |     |    | |
|  |        |               |         | funcionou" |     |    | |
|  +-------------------------------------------+               |
|                                                               |
|  +---- Modal: Detalhe do Feedback ----+                       |
|  | Tipo: score_ajustado               |                       |
|  | Entidade: ParametroScore (Hemato)  |                       |
|  | Data: 12/04/2026 14:32             |                       |
|  | Usuario: J. Silva                  |                       |
|  |                                    |                       |
|  | Dados Entrada (antes):             |                       |
|  | { peso_tecnico: 0.4,              |                       |
|  |   peso_comercial: 0.6 }           |                       |
|  |                                    |                       |
|  | Resultado Real (depois):           |                       |
|  | { peso_tecnico: 0.6,              |                       |
|  |   peso_comercial: 0.4 }           |                       |
|  |                                    |                       |
|  | Delta:                             |                       |
|  | { peso_tecnico: +0.2,             |                       |
|  |   peso_comercial: -0.2 }          |                       |
|  |                                    |                       |
|  | Aplicado: Nao  [Marcar Aplicado]   |                       |
|  |                     [Fechar]       |                       |
|  +------------------------------------+                       |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (4), Tabela feedbacks, Modal detalhe JSON, Badge aplicado
- **Preenchidos (input):** Filtros (Tipo, Periodo, Entidade), Botao Registrar Manual
- **Obtidos (resposta do sistema):** Lista de feedbacks, detalhe com delta, status de aplicacao

---

## [UC-AP02] Sugestoes da IA Baseadas em Aprendizado

**RNs aplicadas:** RN-NEW-05 (aceite explicito), RN-084 (cooldown), RN-132 (audit invocacao), RN-037 (audit log)

**RF relacionado:** RF-055 (Aprendizado Continuo)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Base de `AprendizadoFeedback` possui >= 10 registros
3. Padroes ja detectados (UC-AP03) com confianca >= 70%

### Pos-condicoes
1. Usuario aceita ou rejeita sugestoes da IA
2. Decisoes registradas em `AprendizadoFeedback`
3. Sugestoes aceitas sao aplicadas na proxima analise da IA

### Sequencia de Eventos

1. Usuario clica na [Aba: "Sugestoes"]
2. [Card: "Stat Cards — grid 3"] exibe: Sugestoes Pendentes, Aceitas (total historico), Rejeitadas (total historico)
3. [Card: "Sugestoes Ativas"] lista as sugestoes geradas pela IA que aguardam decisao:
   - Cada sugestao: [Icone: sparkle/lampada], [Titulo], [Descricao], [Confianca %], [Base de dados], [Botao: "Aceitar"], [Botao: "Rejeitar"]
4. Ao clicar [Botao: "Aceitar"]: sistema aplica a sugestao (ex.: altera peso de score), registra em `AprendizadoFeedback` com `aplicado=true`
5. Ao clicar [Botao: "Rejeitar"]: [Modal: "Motivo da Rejeicao"] abre com [TextArea: "Por que rejeita esta sugestao?"] (min 10 chars)
6. Sistema registra rejeicao com motivo em `AprendizadoFeedback` — IA NAO repete sugestao similar
7. [Card: "Historico de Decisoes"] tabela: Data, Sugestao, Decisao (Aceita/Rejeitada), Motivo, Impacto (se aceita, qual metrica mudou)
8. [Botao: "Pedir Nova Analise"] invoca DeepSeek para gerar novas sugestoes (RN-084 cooldown)

### Tela(s) Representativa(s)

**Pagina:** AprendizadoPage
**Posicao:** Aba "Sugestoes"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Aprendizado > Sugestoes                                      |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Pendentes  |  |Aceitas    |  |Rejeitadas |                  |
|  |     5     |  |    18     |  |     7     |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  +---- Sugestoes Ativas ------+                               |
|  |                            |                               |
|  | ✨ Ajustar peso tecnico para Hematologia                   |
|  |    Voce alterou peso_tecnico de 0.4 para 0.6 nos          |
|  |    ultimos 3 editais de hemato. Ganhou 2 dos 3.           |
|  |    Sugestao: padronizar peso 0.6 para o segmento.         |
|  |    Confianca: 78%  Base: 12 feedbacks                     |
|  |    [Aceitar]  [Rejeitar]                                  |
|  |                                                            |
|  | ✨ Reduzir margem alvo em SP                               |
|  |    Editais ganhos em SP: margem media 8.2%.               |
|  |    Editais perdidos em SP: margem media 14.5%.            |
|  |    Sugestao: calibrar margem alvo para 10% em SP.         |
|  |    Confianca: 72%  Base: 23 feedbacks                     |
|  |    [Aceitar]  [Rejeitar]                                  |
|  |                                                            |
|  | ✨ Priorizar orgaos universitarios                         |
|  |    Sua taxa de vitoria em hospitais universitarios:        |
|  |    42% vs 18% em hospitais municipais.                    |
|  |    Sugestao: aumentar score para orgaos HU.               |
|  |    Confianca: 85%  Base: 35 feedbacks                     |
|  |    [Aceitar]  [Rejeitar]                                  |
|  +--------------------------------------------+              |
|                                                               |
|  [Pedir Nova Analise]                                         |
|                                                               |
|  +---- Historico de Decisoes ----+                            |
|  |Data  |Sugestao         |Decisao  |Motivo         |        |
|  |10/04 |Margem RJ 8%     |Aceita   |—              |        |
|  |08/04 |Ignorar dispensa |Rejeitada|"Vamos testar  |        |
|  |      |< R$50K          |         | dispensas"     |        |
|  +-------------------------------+                            |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Lista sugestoes ativas, Historico de decisoes
- **Preenchidos (input):** Aceitar/Rejeitar (com motivo), Pedir Nova Analise
- **Obtidos (resposta do sistema):** Sugestoes da IA, aplicacao automatica, registro de decisao

### Excecoes
- **E1:** Base < 10 feedbacks — mensagem: "Preciso de pelo menos 10 resultados registrados para gerar sugestoes. Atualmente: {N}."
- **E2:** Cooldown ativo ao pedir nova analise — toast: "Aguarde {N}s"
- **E3:** Sugestao ja rejeitada com motivo similar — IA filtra e nao repete

---

## [UC-AP03] Padroes Detectados pela IA

**RNs aplicadas:** RN-NEW-06 (confianca >= 50% para exibir, >= 70% para sugestao), RN-037 (audit log)

**RF relacionado:** RF-055 (Aprendizado Continuo), RF-060 (Analytics MindsDB — conceito simplificado)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Job de deteccao de padroes executado pelo scheduler (1x/semana)
3. Base de feedbacks + auditoria com dados suficientes

### Pos-condicoes
1. Usuario visualiza padroes detectados com nivel de confianca
2. Padroes com confianca >= 70% podem gerar sugestoes automaticas (UC-AP02)

### Sequencia de Eventos

1. Usuario clica na [Aba: "Padroes"]
2. [Card: "Stat Cards — grid 3"] exibe: Padroes Detectados (total), Alta Confianca (>= 70%), Ultima Analise (data/hora do ultimo job)
3. [Card: "Padroes Identificados"] lista os padroes em cards visuais:
   - Cada padrao: [Icone por tipo], [Titulo], [Descricao], [Badge: Confianca %], [Texto: Base de dados (N registros)], [Texto: Acao sugerida]
   - Tipos de padrao: sazonalidade, correlacao, tendencia_preco, comportamento_orgao, gargalo_pipeline
4. Padroes com confianca >= 70%: [Badge verde: "Alta Confianca"] + [Link: "Ver sugestao gerada"]
5. Padroes com confianca 50-69%: [Badge amarelo: "Emergente"] — sem sugestao, apenas observacao
6. Padroes com confianca < 50%: filtrados (nao exibidos por padrao, toggle para mostrar)
7. [Card: "Timeline de Analises"] tabela: Data/Hora do Job, Padroes Novos, Padroes Atualizados, Padroes Removidos
8. [Botao: "Forcar Nova Analise"] dispara job de deteccao imediato (scheduler)

### Tela(s) Representativa(s)

**Pagina:** AprendizadoPage
**Posicao:** Aba "Padroes"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Aprendizado > Padroes                                        |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Padroes    |  |Alta       |  |Ultima     |                  |
|  |Detectados |  |Confianca  |  |Analise    |                  |
|  |    12     |  |     7     |  |14/04 06h  |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  [ ] Mostrar padroes com confianca < 50%                      |
|  [Forcar Nova Analise]                                        |
|                                                               |
|  +---- Padroes Identificados --------+                        |
|  |                                   |                        |
|  | 📈 SAZONALIDADE — Hemato em SP                             |
|  |    Pico de editais em Mar/Abr e Set/Out.                  |
|  |    Base: 142 editais (24 meses)                           |
|  |    Confianca: [92%] Alta                                  |
|  |    Acao: intensificar monitoramento nesses meses          |
|  |    [Ver sugestao gerada -->]                              |
|  |                                                            |
|  | 📊 CORRELACAO — Aderencia tecnica x Vitoria               |
|  |    Editais com score tecnico >= 75 tem taxa de            |
|  |    vitoria 3x maior que score < 50.                       |
|  |    Base: 89 editais analisados                            |
|  |    Confianca: [85%] Alta                                  |
|  |    Acao: priorizar editais com score tecnico alto         |
|  |    [Ver sugestao gerada -->]                              |
|  |                                                            |
|  | 💰 TENDENCIA — Preco medio caindo em Bioquimica           |
|  |    Preco medio caiu 12% nos ultimos 6 meses.             |
|  |    Base: 38 editais no segmento                           |
|  |    Confianca: [68%] Emergente                             |
|  |    Observacao: monitorar antes de agir                    |
|  |                                                            |
|  | 🏛️ ORGAO — HC-FMUSP comprando mais frequente             |
|  |    Frequencia de editais subiu 40% vs semestre ant.       |
|  |    Base: 23 editais do orgao                              |
|  |    Confianca: [74%] Alta                                  |
|  |    Acao: priorizar preparacao para este orgao             |
|  |    [Ver sugestao gerada -->]                              |
|  +-------------------------------------------+               |
|                                                               |
|  +---- Timeline de Analises ----+                             |
|  |Data/Hora   |Novos|Atualiz.|Removidos|                      |
|  |14/04 06:00 |  2  |   5    |    1    |                      |
|  |07/04 06:00 |  1  |   3    |    0    |                      |
|  +------------------------------+                             |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Cards de padroes com confianca, Timeline de analises
- **Preenchidos (input):** Toggle "mostrar < 50%", Botao Forcar Nova Analise
- **Obtidos (resposta do sistema):** Padroes detectados, niveis de confianca, link para sugestoes, historico de jobs

### Excecoes
- **E1:** Nenhum padrao detectado — mensagem: "A IA precisa de mais dados para detectar padroes. Continue registrando resultados."
- **E2:** Job de deteccao nao executou — banner: "Analise de padroes nao executou na ultima semana. Verifique o scheduler."

---

## BACKEND — NOVOS ENDPOINTS E TOOLS

### Endpoints REST

| Metodo | Rota | Descricao | UC |
|--------|------|-----------|-----|
| GET | `/api/dashboard/mercado/tam-sam-som` | Calcula TAM/SAM/SOM com filtros | UC-ME01 |
| GET | `/api/dashboard/mercado/mapa` | Distribuicao por UF | UC-ME02 |
| GET | `/api/dashboard/mercado/share` | Share vs concorrentes | UC-ME03 |
| POST | `/api/mercado/detectar-intrusos` | Analisa edital via IA para itens intrusos | UC-ME04 |
| GET | `/api/dashboard/analytics/funil` | Funil de conversao do pipeline CRM | UC-AN01 |
| GET | `/api/dashboard/analytics/conversoes` | Taxas por tipo/UF/segmento | UC-AN02 |
| GET | `/api/dashboard/analytics/tempos` | Tempo medio entre etapas | UC-AN03 |
| GET | `/api/dashboard/analytics/roi` | ROI estimado | UC-AN04 |
| GET | `/api/dashboard/analytics/perdas` | Dashboard de perdas | UC-AN05 |
| GET | `/api/dashboard/aprendizado/sugestoes` | Sugestoes da IA | UC-AP02 |
| POST | `/api/aprendizado/sugestoes/<id>/aceitar` | Aceitar sugestao | UC-AP02 |
| POST | `/api/aprendizado/sugestoes/<id>/rejeitar` | Rejeitar sugestao com motivo | UC-AP02 |
| GET | `/api/dashboard/aprendizado/padroes` | Padroes detectados | UC-AP03 |
| POST | `/api/aprendizado/analisar` | Forcar analise de padroes | UC-AP03 |

### Tools DeepSeek

| Tool | Descricao | UC |
|------|-----------|-----|
| `tool_calcular_tam_sam_som` | Dimensionamento de mercado com filtros | UC-ME01 |
| `tool_detectar_itens_intrusos` | Detecta itens fora do portfolio em edital | UC-ME04 |
| `tool_gerar_sugestao_aprendizado` | Gera sugestoes baseadas em feedbacks | UC-AP02 |
| `tool_analisar_padroes` | Roda deteccao de padroes sobre feedbacks | UC-AP03 |

### Modelos (alteracoes)

| Modelo | Alteracao | Motivo |
|--------|-----------|--------|
| `AprendizadoFeedback` | Adicionar campo `rejeitado_motivo` (Text, nullable) | UC-AP02 — registrar motivo de rejeicao |
| NOVO: `SugestaoIA` | id, tipo, titulo, descricao, confianca, base_dados_count, acao_sugerida, status (pendente/aceita/rejeitada), feedback_id (FK), created_at | UC-AP02 |
| NOVO: `PadraoDetectado` | id, tipo (sazonalidade/correlacao/tendencia/orgao/gargalo), titulo, descricao, confianca, base_dados_count, dados_json, ativo, created_at, updated_at | UC-AP03 |
| NOVO: `ItemIntruso` | id, edital_id (FK), descricao_item, ncm, valor, percentual_edital, criticidade, acao_sugerida, created_at | UC-ME04 |

---

## SIDEBAR — ENTRADAS ATUALIZADAS

```
Indicadores
  ├── Flags          (Sprint 6)
  ├── Monitoria      (Sprint 6)
  ├── Concorrencia   (Sprint 5 — EXPANDIDO pelo UC-ME03)
  ├── Mercado        (Sprint 5 — EXPANDIDO pelos UC-ME01/ME04)
  ├── Contratado X Realizado  (Sprint 5)
  ├── Pedidos em Atraso       (Sprint 5)
  ├── Perdas         (Sprint 5 — EXPANDIDO pelo UC-AN05)
  ├── Analytics      (Sprint 7 — NOVO)
  └── Aprendizado    (Sprint 7 — NOVO)
```
**Nota:** Concorrencia, Mercado e Perdas ja existem no sidebar. Sprint 7 apenas ADICIONA Analytics e Aprendizado.

---

## SEED DATA — SPRINT 7

O seed da Sprint 7 deve popular:

1. **Concorrentes:** >= 5 concorrentes com segmentos, editais_participados, editais_ganhos, taxa_vitoria
2. **Participacoes:** >= 20 registros em `participacoes_editais` com precos e posicoes
3. **Precos Historicos:** >= 15 registros com preco_referencia, preco_vencedor, nosso_preco
4. **Feedbacks:** >= 15 registros em `AprendizadoFeedback` com 4 tipos de evento
5. **Sugestoes:** >= 5 registros em `SugestaoIA` (3 pendentes, 1 aceita, 1 rejeitada)
6. **Padroes:** >= 4 registros em `PadraoDetectado` com confiancas variadas (92%, 85%, 68%, 45%)
7. **Itens Intrusos:** >= 3 registros em `ItemIntruso` com criticidades diferentes
8. **Editais:** garantir que editais existentes tenham UF, valor_estimado, segmento preenchidos para calculo TAM/SAM/SOM
