# PLANO SPRINT 7 — Mercado TAM/SAM/SOM, Analytics Consolidado e Pipeline de Aprendizado

**Data:** 2026-04-16
**Versao:** 2.0 (corrigida — eliminadas duplicacoes com Sprints 5/6)
**Autor:** Claude Code (plan mode)
**Documentos base:** `docs/SPRINT7-VI.md`, `docs/CASOS DE USO SPRINT7 V4.md`

---

## 1. Contexto e Motivacao

A Sprint 7 transforma o Facilicita.ia de ferramenta operacional em plataforma de decisao estrategica. **Problema identificado na v1.0 do plano:** varias funcionalidades propostas JA EXISTEM nas Sprints 5-6 (mapa Leaflet no CRMPage, tabela de concorrentes no ConcorrenciaPage, dashboard de perdas no PerdasPage, KPIs no CRMPage). Esta v2.0 corrige isso — cada UC que toca funcionalidade existente e tratado como **EXPANSAO** (delta), nao recriacao.

**12 Casos de Uso** em **3 Grupos:**
1. **Inteligencia de Mercado** — TAM/SAM/SOM + Itens Intrusos (MercadoPage expandida) + expansoes em CRMPage e ConcorrenciaPage
2. **Analytics Consolidado** — Funil, Tempos, ROI (AnalyticsPage nova) + expansao PerdasPage
3. **Pipeline de Aprendizado** — Feedbacks, Sugestoes IA, Padroes (AprendizadoPage nova)

---

## 2. O que JA EXISTE (nao recriar)

### 2.1 Paginas Frontend Existentes

| Pagina | Linhas | O que tem | Endpoint |
|---|---|---|---|
| `CRMPage.tsx` | 539L, 6 tabs | Pipeline Kanban, Parametrizacoes, **Mapa Leaflet/OSM** (CircleMarker por UF com popup), Agenda, **KPIs** (8 stat cards + taxas + tickets), Decisoes | `/api/crm/mapa`, `/api/crm/kpis`, `/api/crm/pipeline` |
| `ConcorrenciaPage.tsx` | 231L | Tabela com Nome/CNPJ/Vitorias/Derrotas/Taxa/Preco Medio, **detalhe** com historico licitacoes, botao "Analisar via IA" | `/api/concorrentes/listar`, `/api/crud/precos-historicos` |
| `PerdasPage.tsx` | 213L | 3 stat cards (Total/Valor/Taxa), **pie chart** motivos, tabela com Edital/Orgao/Motivo/Nosso Preco/Vencedor/Gap | `/api/dashboard/perdas?periodo_dias=` |
| `MercadoPage.tsx` | 173L | 3 stat cards (Editais/Valor/Medio), **barras** tendencias por mes, **grid** categorias, placeholder "Sprint 7 TAM/SAM/SOM" | `/api/dashboard/mercado?periodo_dias=` |

### 2.2 Sidebar Indicadores (ja existe)
- Flags, Monitoria, **Concorrencia**, **Mercado**, Contratado X Realizado, Pedidos em Atraso, **Perdas**

### 2.3 Models e CRUDs Existentes
- `Concorrente`, `ParticipacaoEdital`, `PrecoHistorico`, `AprendizadoFeedback`, `Edital`, `EditalDecisao`, `LeadCRM`, `Contrato`
- CRUDs: `concorrentes`, `participacoes-editais`, `precos-historicos`, `aprendizado-feedback`
- Tools: `tool_listar_concorrentes`, `tool_analisar_concorrente`

---

## 3. Mapa de UCs — NOVO vs EXPANSAO

| UC | Tipo | Pagina Alvo | O que ADICIONA (delta) |
|---|---|---|---|
| UC-ME01 | **EXPANSAO** MercadoPage | `MercadoPage.tsx` | Tabs + funil TAM/SAM/SOM + evolucao precos + filtro segmento + botao recalcular |
| UC-ME02 | **EXPANSAO** CRMPage Mapa | `CRMPage.tsx` aba Mapa | Camada SAM (cor por oportunidade), stat cards (Maior Oport/Menor Partic/Sem Presenca), ranking UFs, filtros segmento/metrica |
| UC-ME03 | **EXPANSAO** ConcorrenciaPage | `ConcorrenciaPage.tsx` | Grafico share barras horizontais, stat cards (Concorrentes/Nossa Taxa/Maior Ameaca/Disputas), badge alerta RN-073, filtros segmento/UF/periodo |
| UC-ME04 | **NOVO** | `MercadoPage.tsx` (nova aba) | Tab "Intrusos" completa — stat cards, tabela, modal analise, deteccao IA |
| UC-AN01 | **NOVO** | `AnalyticsPage.tsx` | Funil visual 13 etapas com conversao — consolida dados CRM em vista analitica |
| UC-AN02 | **NOVO** | `AnalyticsPage.tsx` | Taxas por tipo/UF/segmento com benchmark periodo anterior |
| UC-AN03 | **NOVO** | `AnalyticsPage.tsx` | Tempo medio entre etapas + gargalo + histograma |
| UC-AN04 | **NOVO** | `AnalyticsPage.tsx` | ROI consolidado (receita + oportunidades + produtividade + prevencao) |
| UC-AN05 | **EXPANSAO** PerdasPage | `PerdasPage.tsx` | Card "Recomendacoes IA" (3-5 insights com Aplicar/Rejeitar), filtros segmento/UF, botao Exportar CSV, stat card "Top Motivo" |
| UC-AP01 | **NOVO** | `AprendizadoPage.tsx` | Tab Feedbacks completa |
| UC-AP02 | **NOVO** | `AprendizadoPage.tsx` | Tab Sugestoes completa |
| UC-AP03 | **NOVO** | `AprendizadoPage.tsx` | Tab Padroes completa |

---

## 4. Correcoes nos Documentos (a fazer ANTES da implementacao)

### 4.1 SPRINT7-VI.md — Correcoes

| Secao | Problema | Correcao |
|---|---|---|
| Card 2 "Mapa do Brasil" | Descreve mapa novo como se nao existisse | Reescrever: "Expande aba Mapa do CRMPage com camada SAM" |
| Card 3 "Share Concorrentes" | Descreve pagina nova de concorrencia | Reescrever: "Expande ConcorrenciaPage com grafico share e badges" |
| Card 5 Analytics "Perdas" | Descreve dashboard novo de perdas | Reescrever: "Expande PerdasPage com recomendacoes IA e filtros adicionais" |

### 4.2 CASOS DE USO SPRINT7 V4.md — Correcoes

| UC | Problema | Correcao |
|---|---|---|
| UC-ME02 | Descreve mapa do zero com UFs coloridas | Referenciar CRMPage:Mapa, descrever APENAS: camada SAM, stat cards novos, ranking UFs |
| UC-ME03 | Descreve tabela concorrentes do zero | Referenciar ConcorrenciaPage, descrever APENAS: grafico share, stat cards novos, badge alerta |
| UC-AN01 | Funil pode parecer duplicar KPIs CRM | Esclarecer: e vista ANALITICA consolidada (todas etapas com conversao), diferente dos stat cards simples do CRM |
| UC-AN05 | Descreve dashboard perdas do zero | Referenciar PerdasPage, descrever APENAS: card recomendacoes IA, filtros extras, exportar CSV |

---

## 5. Novos Modelos — Especificacao

### 5.1 SugestaoIA
```python
class SugestaoIA(Base):
    __tablename__ = 'sugestoes_ia'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    tipo = Column(String(50), nullable=False)  # parametro, margem, score, estrategia
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=False)
    confianca = Column(DECIMAL(5, 2), nullable=True)  # 0-100
    base_dados_count = Column(Integer, default=0)
    acao_sugerida = Column(Text, nullable=True)
    status = Column(Enum('pendente', 'aceita', 'rejeitada'), default='pendente')
    rejeitado_motivo = Column(Text, nullable=True)
    feedback_id = Column(String(36), ForeignKey('aprendizado_feedback.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
```

### 5.2 PadraoDetectado
```python
class PadraoDetectado(Base):
    __tablename__ = 'padroes_detectados'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    tipo = Column(Enum('sazonalidade', 'correlacao', 'tendencia_preco', 'comportamento_orgao', 'gargalo_pipeline'), nullable=False)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=False)
    confianca = Column(DECIMAL(5, 2), nullable=True)
    base_dados_count = Column(Integer, default=0)
    dados_json = Column(JSON, nullable=True)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
```

### 5.3 ItemIntruso
```python
class ItemIntruso(Base):
    __tablename__ = 'itens_intrusos'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    descricao_item = Column(Text, nullable=False)
    ncm = Column(String(20), nullable=True)
    valor = Column(DECIMAL(15, 2), nullable=True)
    percentual_edital = Column(DECIMAL(5, 2), nullable=True)
    criticidade = Column(Enum('critico', 'medio', 'informativo'), nullable=False)
    acao_sugerida = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
```

### 5.4 Alteracao em AprendizadoFeedback (existente)
```python
# ADICIONAR ao modelo existente:
rejeitado_motivo = Column(Text, nullable=True)
```

---

## 6. Endpoints — Separados por NOVO vs EXPANSAO

### 6.1 Endpoints NOVOS (nao existem no backend)

| # | Endpoint | UC | Descricao |
|---|---|---|---|
| 1 | `GET /api/dashboard/mercado/tam-sam-som` | ME01 | Calculo TAM/SAM/SOM com cache 30d |
| 2 | `POST /api/mercado/detectar-intrusos` | ME04 | Detecta itens fora do portfolio via IA |
| 3 | `GET /api/dashboard/mercado/intrusos` | ME04 | Lista historico de intrusos detectados |
| 4 | `GET /api/dashboard/analytics/funil` | AN01 | Funil 13 etapas com conversao |
| 5 | `GET /api/dashboard/analytics/conversoes` | AN02 | Taxas por tipo/UF/segmento + benchmark |
| 6 | `GET /api/dashboard/analytics/tempos` | AN03 | Tempo medio entre etapas |
| 7 | `GET /api/dashboard/analytics/roi` | AN04 | ROI consolidado |
| 8 | `GET /api/dashboard/aprendizado/feedbacks` | AP01 | Feedbacks filtrados com stat cards |
| 9 | `GET /api/dashboard/aprendizado/sugestoes` | AP02 | Sugestoes IA ativas + historico |
| 10 | `POST /api/aprendizado/sugestoes/<id>/aceitar` | AP02 | Aceitar sugestao |
| 11 | `POST /api/aprendizado/sugestoes/<id>/rejeitar` | AP02 | Rejeitar com motivo |
| 12 | `GET /api/dashboard/aprendizado/padroes` | AP03 | Padroes detectados |
| 13 | `POST /api/aprendizado/analisar` | AP03 | Forcar nova analise de padroes |

### 6.2 Endpoints EXPANDIDOS (existem, precisam de params/dados extras)

| # | Endpoint Existente | UC | O que ADICIONA |
|---|---|---|---|
| 14 | `GET /api/crm/mapa` | ME02 | Params: segmento, metrica. Retorno: stat cards SAM, ranking UFs, gap |
| 15 | `GET /api/dashboard/mercado/share` (NOVO mas usa dados de `/api/concorrentes/listar`) | ME03 | Endpoint novo que agrega share % de mercado |
| 16 | `GET /api/dashboard/perdas` → expandir para `GET /api/dashboard/analytics/perdas` | AN05 | Params: segmento, uf. Retorno: +recomendacoes IA, +top_motivo |

**Total: 16 endpoints (13 novos + 3 expandidos/novos complementares)**

---

## 7. Novas Tools DeepSeek (4)

| Tool | UC | Funcao |
|---|---|---|
| `tool_calcular_tam_sam_som` | ME01 | TAM (total mercado) → SAM (UFs+NCMs) → SOM (taxa vitoria * capacidade) |
| `tool_detectar_itens_intrusos` | ME04 | Compara NCMs edital vs portfolio, classifica criticidade |
| `tool_gerar_sugestao_aprendizado` | AP02 | Analisa feedbacks e gera sugestoes de ajuste |
| `tool_analisar_padroes` | AP03 | Detecta sazonalidade, correlacao, tendencia, gargalo |

---

## 8. Fluxo de Trabalho — 4 Ondas

### ONDA 1: Documentos (~30min)
1. Reescrever `docs/SPRINT7-VI.md` — eliminar duplicacoes conforme secao 4.1
2. Reescrever `docs/CASOS DE USO SPRINT7 V4.md` — eliminar duplicacoes conforme secao 4.2

### ONDA 2: Backend (~2h)
**Sequencia:**
1. `backend/models.py` — 3 novos modelos + 1 campo
2. `backend/crud_routes.py` — registrar CRUDs: sugestoes-ia, padroes-detectados, itens-intrusos
3. `backend/app.py` — 16 endpoints (13 novos + 3 expandidos)
4. `backend/tools.py` — 4 novas tools
5. `backend/scheduler.py` — 1 job semanal (deteccao padroes)
6. `backend/seeds/sprint7_seed.py` — seed completo 2 conjuntos
7. Testar endpoints via curl

### ONDA 3: Frontend (~2.5h)
**Sequencia:**
1. `frontend/src/api/sprint7.ts` — fetchers para endpoints novos
2. `frontend/src/pages/MercadoPage.tsx` — **REESCREVER**: adicionar tabs (TAM/SAM/SOM default + Intrusos), manter conteudo existente na tab default, adicionar funil TAM/SAM/SOM + evolucao precos
3. `frontend/src/pages/CRMPage.tsx` — **EXPANDIR** aba Mapa: adicionar stat cards SAM, ranking UFs, filtros segmento/metrica, camada de cor por oportunidade
4. `frontend/src/pages/ConcorrenciaPage.tsx` — **EXPANDIR**: adicionar secao share (grafico barras horizontais), stat cards novos, badge alerta, filtros
5. `frontend/src/pages/PerdasPage.tsx` — **EXPANDIR**: adicionar card "Recomendacoes IA", filtros segmento/UF, botao Exportar CSV, stat card "Top Motivo"
6. `frontend/src/pages/AnalyticsPage.tsx` — **CRIAR**: 4 tabs (Pipeline, Conversoes, Tempos, ROI)
7. `frontend/src/pages/AprendizadoPage.tsx` — **CRIAR**: 3 tabs (Feedbacks, Sugestoes, Padroes)
8. `frontend/src/pages/index.ts` — 2 exports (AnalyticsPage, AprendizadoPage)
9. `frontend/src/App.tsx` — 2 imports + 2 route cases (analytics, aprendizado)
10. `frontend/src/components/Sidebar.tsx` — 2 novos itens em Indicadores (Analytics, Aprendizado)
11. Verificar TypeScript + build Vite

### ONDA 4: Validacao (~1h)
1. Executar seed sprint7
2. Iniciar backend e frontend
3. Executar testes Playwright (3 arquivos, 12 testes)
4. Gerar relatorio de validacao

---

## 9. Detalhamento por UC

### UC-ME01 — Dashboard TAM/SAM/SOM (EXPANSAO MercadoPage)

**Arquivo:** `frontend/src/pages/MercadoPage.tsx` (REESCREVER 173L → ~400L)
**O que ja existe:** 3 stat cards, tendencias, categorias, placeholder evolucao precos
**O que ADICIONA:**

- [ ] **Tabs (2):** TAM/SAM/SOM (default, absorve conteudo existente), Intrusos (UC-ME04)
- [ ] **Filtro: Select "Segmento"** (Todos/Hematologia/Bioquimica/Coagulacao/Imunologia/Biomol-PCR)
- [ ] **Filtro: Select "Periodo"** (3m/6m/12m) — ja existe, manter
- [ ] **Botao "Recalcular"** (forca cache, RN-059)
- [ ] **Card "Funil de Mercado"** — 3 niveis funil vertical:
  - TAM: total editais + R$ (RN-NEW-01)
  - SAM: filtrado UFs+NCMs + R$ + % TAM (RN-NEW-02)
  - SOM: SAM * taxa_vitoria * capacidade + R$ + % SAM (RN-NEW-03)
- [ ] **Stat Cards (4):** Editais no Periodo, Valor Total TAM, Valor Medio, Taxa Penetracao SOM/SAM
- [ ] **Card "Tendencias"** — MANTER existente + adicionar linha SOM sobreposta
- [ ] **Card "Categorias"** — MANTER existente
- [ ] **Card "Evolucao de Precos"** — SUBSTITUIR placeholder por grafico real (linha por segmento)
- [ ] **Endpoint novo:** `GET /api/dashboard/mercado/tam-sam-som`
- [ ] **Tool nova:** `tool_calcular_tam_sam_som`

---

### UC-ME02 — Distribuicao Geografica SAM (EXPANSAO CRMPage Mapa)

**Arquivo:** `frontend/src/pages/CRMPage.tsx` aba Mapa (EXPANDIR, ~+100L)
**O que ja existe:** MapContainer Leaflet com CircleMarker por UF, popup com editais por pipeline_stage
**O que ADICIONA:**

- [ ] **Stat Cards (3) acima do mapa:** UF Maior Oportunidade, UF Menor Participacao, UFs sem Presenca
- [ ] **Filtro: Select "Segmento"** (Todos/Hematologia/...)
- [ ] **Filtro: Select "Metrica"** (Quantidade / Valor R$)
- [ ] **Cores do mapa por SAM:** verde escuro (alta oportunidade) → amarelo → cinza (zero)
- [ ] **Tooltip expandido:** adicionar valor R$, top orgao ao popup existente
- [ ] **Card "Ranking de UFs"** abaixo do mapa — DataTable: UF, Editais SAM, Valor, Participados, Taxa %, Gap
- [ ] **Endpoint expandido:** `GET /api/crm/mapa` — adicionar params segmento/metrica e retorno com stat cards SAM

---

### UC-ME03 — Share vs Concorrentes (EXPANSAO ConcorrenciaPage)

**Arquivo:** `frontend/src/pages/ConcorrenciaPage.tsx` (EXPANDIR, ~+150L)
**O que ja existe:** Tabela concorrentes com CNPJ/Vitorias/Derrotas/Taxa/Preco Medio + detalhe com historico
**O que ADICIONA:**

- [ ] **Secao "Share de Mercado"** acima da tabela existente — grafico barras horizontais:
  - Cada barra: nome do player + % editais ganhos
  - Barra empresa em azul, concorrentes em cinza
- [ ] **Stat Cards (4):** Concorrentes Conhecidos, Nossa Taxa, Maior Ameaca, Editais Disputados
- [ ] **Filtros:** Segmento, UF, Periodo (adicionar aos existentes)
- [ ] **Badge "Alerta"** amarelo na tabela se >= 2 editais perdidos para concorrente (RN-073)
- [ ] **Modal detalhe expandido:** adicionar UFs de atuacao e tendencia ao detalhe existente
- [ ] **Endpoint novo:** `GET /api/dashboard/mercado/share`

---

### UC-ME04 — Detectar Itens Intrusos (NOVO em MercadoPage tab)

**Arquivo:** `frontend/src/pages/MercadoPage.tsx` (nova aba "Intrusos")
**O que ja existe:** Nada — totalmente novo
**Modelo novo:** `ItemIntruso`

- [ ] **Stat Cards (3):** Intrusos Detectados, Editais Afetados, Valor em Risco
- [ ] **Filtros:** Criticidade (Todos/Critico/Medio/Informativo), Periodo, Buscar edital
- [ ] **Botao "Analisar Novo Edital"**
- [ ] **DataTable:** Edital, Item, NCM, Valor, % do Edital, Criticidade (badge colorido), Acao Sugerida
  - Critico (>10%) vermelho, Medio (5-10%) amarelo, Informativo (<5%) azul (RN-NEW-04)
- [ ] **Modal "Analisar Novo Edital":** Select edital + Botao "Analisar com IA" + Cancelar
- [ ] **Toast** apos analise
- [ ] **Endpoint novo:** `POST /api/mercado/detectar-intrusos` + `GET /api/dashboard/mercado/intrusos`
- [ ] **Tool nova:** `tool_detectar_itens_intrusos`

---

### UC-AN01 — Funil de Conversao Pipeline CRM (NOVO AnalyticsPage)

**Arquivo:** `frontend/src/pages/AnalyticsPage.tsx` (CRIAR, aba "Pipeline")
**Diferenca do CRM KPIs:** CRM KPIs mostra 8 stat cards agregados. Analytics mostra funil VISUAL com 13 etapas individuais + taxa conversao entre cada par.

- [ ] **Cabecalho:** "Analytics" + subtitulo "Performance, Conversoes e ROI"
- [ ] **Abas (4):** Pipeline (default), Conversoes, Tempos, ROI
- [ ] **Filtros:** Periodo, Segmento, UF
- [ ] **Stat Cards (4):** Total Pipeline, Analisados (RN-196), Participados (RN-196), Resultado Definitivo
- [ ] **Card "Funil do Pipeline"** — 13 etapas visuais (captado → resultado_definitivo):
  - Cada etapa: nome, quantidade, valor R$, taxa conversao proxima
  - Cores: verde (>60%), amarelo (30-60%), vermelho (<30%)
- [ ] **Card "Tabela Conversao"** — DataTable: Etapa, Entrada, Saida, Conversao %, Valor Acumulado
- [ ] **Endpoint novo:** `GET /api/dashboard/analytics/funil`

---

### UC-AN02 — Taxas de Conversao Detalhadas (NOVO AnalyticsPage)

**Arquivo:** `frontend/src/pages/AnalyticsPage.tsx` (aba "Conversoes")
**Diferenca do CRM KPIs:** CRM mostra taxa_participacao e taxa_vitoria agregadas. Analytics desagrega por tipo/UF/segmento com benchmark.

- [ ] **Stat Cards (4):** Taxa Geral %, Melhor Segmento, Melhor UF, Contribuicao Automatica %
- [ ] **Card "Taxa por Tipo"** — DataTable: Tipo (Pregao/Concorrencia/Dispensa), Participados, Ganhos, Taxa %, Benchmark
  - Badge verde (subiu) / vermelho (caiu) vs periodo anterior
- [ ] **Card "Taxa por UF"** — DataTable com benchmark
- [ ] **Card "Taxa por Segmento"** — DataTable com benchmark
- [ ] **Endpoint novo:** `GET /api/dashboard/analytics/conversoes`

---

### UC-AN03 — Tempo Medio entre Etapas (NOVO AnalyticsPage)

**Arquivo:** `frontend/src/pages/AnalyticsPage.tsx` (aba "Tempos")

- [ ] **Stat Cards (3+1):** Tempo Total Medio (dias), Etapa Mais Lenta, Etapa Mais Rapida, Tempo Homologacao → 1o Empenho (correcao L2)
- [ ] **Card barras horizontais:** cada transicao com largura proporcional
  - Cores: verde (<7d), amarelo (7-30d), vermelho (>30d)
  - **Badge "Gargalo"** na transicao mais lenta
- [ ] **Card "Tabela Detalhada"** — DataTable: Transicao, Media, Mediana, Min, Max, Desvio
- [ ] **Endpoint novo:** `GET /api/dashboard/analytics/tempos`

---

### UC-AN04 — ROI Estimado (NOVO AnalyticsPage)

**Arquivo:** `frontend/src/pages/AnalyticsPage.tsx` (aba "ROI")

- [ ] **Card "ROI Consolidado"** — indicador grande central com %
- [ ] **Filtro:** Periodo (3m/6m/12m/total)
- [ ] **Card "Componentes" (grid 2x2):**
  - Receita Direta: soma valores editais ganhos
  - Oportunidades Salvas: recursos revertidos (Sprint 4)
  - Produtividade: horas economizadas (benchmark configuravel)
  - Prevencao Perdas: valor itens intrusos detectados (UC-ME04)
- [ ] **Card "Evolucao ROI"** — grafico linha mes a mes
- [ ] **Card "Detalhamento"** — DataTable: Componente, Valor R$, % Total, Tendencia
- [ ] **Endpoint novo:** `GET /api/dashboard/analytics/roi`

---

### UC-AN05 — Perdas com Recomendacoes IA (EXPANSAO PerdasPage)

**Arquivo:** `frontend/src/pages/PerdasPage.tsx` (EXPANDIR 213L → ~350L)
**O que ja existe:** 3 stat cards, pie chart motivos, tabela perdas, filtro periodo
**O que ADICIONA:**

- [ ] **Stat Card 4:** "Top Motivo" (nome do motivo mais frequente)
- [ ] **Filtros adicionais:** Segmento, UF (adicionar ao periodo existente)
- [ ] **Card "Recomendacoes da IA"** — 3-5 insights:
  - Cada insight: icone lampada, texto, Botao "Aplicar", Botao "Rejeitar"
  - Aceitar cria AprendizadoFeedback com tipo_evento=feedback_usuario
- [ ] **Botao "Exportar CSV"** — download historico perdas
- [ ] **Endpoint expandido:** `GET /api/dashboard/analytics/perdas` (reutiliza logica de `/api/dashboard/perdas` + adiciona recomendacoes)

---

### UC-AP01 — Feedbacks Registrados (NOVO AprendizadoPage)

**Arquivo:** `frontend/src/pages/AprendizadoPage.tsx` (CRIAR, aba "Feedbacks")

- [ ] **Cabecalho:** "Pipeline de Aprendizado" + subtitulo
- [ ] **Abas (3):** Feedbacks (default), Sugestoes, Padroes
- [ ] **Stat Cards (4):** Total Feedbacks, Aplicados, Pendentes, Taxa Adocao %
- [ ] **Filtros:** Tipo (resultado_edital/score_ajustado/preco_ajustado/feedback_usuario), Periodo, Entidade
- [ ] **Botao "Registrar Feedback Manual"**
- [ ] **DataTable:** Data, Tipo, Entidade, Resumo, Delta, Aplicado (badge verde/cinza), Acao
- [ ] **Modal "Detalhe":** Tipo, Entidade, Data, JSON completo, Botao "Marcar Aplicado"
- [ ] **Modal "Registrar Manual":** Select Tipo + TextInput Entidade + TextArea Descricao + TextArea Resultado + Botao "Registrar" (usa CRUD existente aprendizado-feedback)
- [ ] **Endpoint novo:** `GET /api/dashboard/aprendizado/feedbacks`

---

### UC-AP02 — Sugestoes IA (NOVO AprendizadoPage)

**Arquivo:** `frontend/src/pages/AprendizadoPage.tsx` (aba "Sugestoes")
**Modelo novo:** `SugestaoIA`

- [ ] **Stat Cards (3):** Pendentes, Aceitas, Rejeitadas
- [ ] **Card "Sugestoes Ativas"** — lista de sugestoes pendentes:
  - Titulo, Descricao, Badge Confianca %, Base dados (N feedbacks)
  - Botao "Aceitar" + Botao "Rejeitar"
- [ ] **Acao Aceitar:** atualiza status, cria feedback aplicado=true
- [ ] **Acao Rejeitar:** modal motivo (textarea >= 10 chars), registra rejeitado_motivo
- [ ] **Card "Historico Decisoes"** — DataTable: Data, Sugestao, Decisao, Motivo, Impacto
- [ ] **Botao "Pedir Nova Analise"** (cooldown RN-084)
- [ ] **Endpoints novos:** `GET .../sugestoes`, `POST .../aceitar`, `POST .../rejeitar`
- [ ] **Tool nova:** `tool_gerar_sugestao_aprendizado`

---

### UC-AP03 — Padroes Detectados (NOVO AprendizadoPage)

**Arquivo:** `frontend/src/pages/AprendizadoPage.tsx` (aba "Padroes")
**Modelo novo:** `PadraoDetectado`

- [ ] **Stat Cards (3):** Padroes Detectados, Alta Confianca (>=70%), Ultima Analise
- [ ] **Toggle:** "Mostrar padroes com confianca < 50%" (default off)
- [ ] **Botao "Forcar Nova Analise"**
- [ ] **Cards de padroes:** icone por tipo (sazonalidade/correlacao/tendencia/comportamento/gargalo)
  - Titulo, Descricao, Badge confianca (verde >=70% / amarelo 50-69%)
  - Link "Ver sugestao gerada" se >= 70%
  - Base dados: "N registros"
- [ ] **Card "Timeline Analises"** — DataTable: Data/Hora, Novos, Atualizados, Removidos
- [ ] **Endpoints novos:** `GET .../padroes`, `POST .../analisar`
- [ ] **Tool nova:** `tool_analisar_padroes`

---

## 10. Seed Data Sprint 7

### IDs Fixos
```python
SEED_MARK = "SPRINT7_SEED"
VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"
```

### Conjunto 1: CH Hospitalar (valida1)
| Entidade | Qtd | Detalhes |
|---|---|---|
| Concorrentes | 5 | MedLab Sul, DiagTech, BioAnalise, LabNorte, QualiMed |
| Participacoes | 20 | Distribuidas entre 5 concorrentes + editais existentes |
| Precos Historicos | 15 | 8 vitoria, 5 derrota, 2 cancelado |
| Feedbacks | 15 | 4 resultado_edital, 4 score, 4 preco, 3 feedback_usuario |
| Sugestoes IA | 5 | 3 pendentes, 1 aceita, 1 rejeitada |
| Padroes | 4 | sazonalidade 92%, correlacao 85%, tendencia 68%, comportamento 45% |
| Itens Intrusos | 3 | 1 critico (>10%), 1 medio (5-10%), 1 informativo (<5%) |

### Conjunto 2: RP3X (valida2) — Dados Minimos
| Entidade | Qtd | Detalhes |
|---|---|---|
| Concorrentes | 2 | Basicos |
| Participacoes | 5 | Minimo |
| Precos Historicos | 5 | 2 vitoria, 2 derrota, 1 cancelado |
| Feedbacks | 5 | 2 resultado, 1 score, 1 preco, 1 feedback |
| Sugestoes IA | 2 | 1 pendente, 1 aceita |
| Padroes | 2 | 78% alta, 55% emergente |
| Itens Intrusos | 1 | 1 medio |

---

## 11. Testes Playwright (3 arquivos, 12 testes)

### sprint7-mercado.spec.ts (4 testes)
- **UC-ME01:** navTo("Mercado"), verificar tabs, funil TAM/SAM/SOM, stat cards, tendencias, evolucao precos
- **UC-ME02:** navTo("CRM"), clickTab("Mapa"), verificar stat cards SAM, ranking UFs, filtros segmento/metrica
- **UC-ME03:** navTo("Concorrencia"), verificar share chart, stat cards, badge alerta, tabela expandida
- **UC-ME04:** navTo("Mercado"), clickTab("Intrusos"), verificar stat cards, tabela intrusos, badges criticidade

### sprint7-analytics.spec.ts (4 testes)
- **UC-AN01:** navTo("Analytics"), verificar funil 13 etapas, conversao, stat cards
- **UC-AN02:** clickTab("Conversoes"), verificar taxas por tipo/UF/segmento, benchmarks
- **UC-AN03:** clickTab("Tempos"), verificar stat cards, barras transicoes, badge gargalo
- **UC-AN04:** clickTab("ROI"), verificar ROI consolidado, componentes, evolucao

### sprint7-aprendizado.spec.ts (4 testes)
- **UC-AN05+AP01:** navTo("Aprendizado"), verificar feedbacks tab (absorve teste de perdas expandido separadamente)
  - **NOTA:** UC-AN05 (Perdas expandido) testado inline: navTo("Perdas"), verificar recomendacoes IA, filtros extras, exportar CSV
- **UC-AP01:** navTo("Aprendizado"), verificar feedbacks, stat cards, filtros, botao registrar
- **UC-AP02:** clickTab("Sugestoes"), verificar sugestoes ativas, aceitar/rejeitar, historico
- **UC-AP03:** clickTab("Padroes"), verificar padroes, toggle, timeline

**Helpers update:** adicionar "Analytics" e "Aprendizado" em PAGE_LABELS/PAGE_SECTION com secao "Indicadores"

---

## 12. Arquivos Modificados — Tabela Consolidada

| Arquivo | Acao | Delta |
|---|---|---|
| `backend/models.py` | MODIFICAR — 3 novos modelos + 1 campo | +120L |
| `backend/app.py` | MODIFICAR — 16 endpoints | +600L |
| `backend/tools.py` | MODIFICAR — 4 tools | +400L |
| `backend/crud_routes.py` | MODIFICAR — 3 CRUDs | +20L |
| `backend/scheduler.py` | MODIFICAR — 1 job | +30L |
| `backend/seeds/sprint7_seed.py` | CRIAR | ~500L |
| `frontend/src/pages/MercadoPage.tsx` | **REESCREVER** — 2 tabs (TAM/SAM/SOM + Intrusos) | 173L → ~400L |
| `frontend/src/pages/CRMPage.tsx` | **EXPANDIR** aba Mapa | 539L → ~640L |
| `frontend/src/pages/ConcorrenciaPage.tsx` | **EXPANDIR** com share + stats | 231L → ~380L |
| `frontend/src/pages/PerdasPage.tsx` | **EXPANDIR** com recomendacoes IA | 213L → ~350L |
| `frontend/src/pages/AnalyticsPage.tsx` | **CRIAR** — 4 tabs | ~600L |
| `frontend/src/pages/AprendizadoPage.tsx` | **CRIAR** — 3 tabs | ~500L |
| `frontend/src/api/sprint7.ts` | CRIAR — fetchers | ~120L |
| `frontend/src/pages/index.ts` | MODIFICAR — 2 exports | +2L |
| `frontend/src/App.tsx` | MODIFICAR — 2 cases | +6L |
| `frontend/src/components/Sidebar.tsx` | MODIFICAR — 2 itens | +2L |
| `tests/e2e/playwright/helpers.ts` | MODIFICAR | +4L |
| `tests/e2e/playwright/sprint7-mercado.spec.ts` | CRIAR | ~200L |
| `tests/e2e/playwright/sprint7-analytics.spec.ts` | CRIAR | ~200L |
| `tests/e2e/playwright/sprint7-aprendizado.spec.ts` | CRIAR | ~200L |
| `docs/SPRINT7-VI.md` | REESCREVER (eliminar duplicacoes) | ~160L |
| `docs/CASOS DE USO SPRINT7 V4.md` | REESCREVER (eliminar duplicacoes) | ~1100L |

---

## 13. Verificacao Final

### Backend
- [ ] 3 modelos criados, tabelas existem
- [ ] 16 endpoints respondem (curl)
- [ ] 4 tools registradas
- [ ] Seed idempotente executado
- [ ] Todos endpoints filtram por empresa_id (user_scoped)
- [ ] Audit log (RN-037) + cooldown (RN-084)

### Frontend
- [ ] MercadoPage com 2 tabs (TAM/SAM/SOM + Intrusos)
- [ ] CRMPage Mapa expandido com stat cards SAM + ranking
- [ ] ConcorrenciaPage expandida com share + stat cards
- [ ] PerdasPage expandida com recomendacoes IA + CSV
- [ ] AnalyticsPage nova com 4 tabs
- [ ] AprendizadoPage nova com 3 tabs
- [ ] Sidebar com Analytics + Aprendizado
- [ ] TypeScript sem erros, Vite build OK

### Testes
- [ ] 12 testes Playwright passando
- [ ] 24 screenshots (2 por teste)
- [ ] User_scoped: dados CH != RP3X

---

## 14. Ordem de Execucao

1. models.py (base)
2. crud_routes.py (CRUDs)
3. app.py endpoints Mercado (ME01-ME04)
4. app.py endpoints Analytics (AN01-AN05)
5. app.py endpoints Aprendizado (AP01-AP03)
6. tools.py (4 tools)
7. scheduler.py (1 job)
8. seeds/sprint7_seed.py
9. api/sprint7.ts (fetchers)
10. MercadoPage.tsx (reescrever com tabs)
11. CRMPage.tsx (expandir Mapa)
12. ConcorrenciaPage.tsx (expandir)
13. PerdasPage.tsx (expandir)
14. AnalyticsPage.tsx (criar)
15. AprendizadoPage.tsx (criar)
16. Sidebar + App.tsx + index.ts (wiring)
17. helpers.ts + 3 specs Playwright
18. Validacao e relatorio
