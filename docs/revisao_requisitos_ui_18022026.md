# REVISAO DE REQUISITOS COM ENFASE EM UI
## facilicita.ia — 18/02/2026

**Revisor:** Claude (Opus 4.6) — Papel: Revisor de Requisitos com enfase em UI
**Documentos analisados:**
- requisitos_completos.md (40 RFs + 4 RNFs)
- WORKFLOW SISTEMA.pdf (12 paginas)
- interface_ia.md (108 prompts x 17 groups x 5 UI patterns)
- planejamento_17022026.md (52 tasks, 4 ondas, 8 agentes)
- CaptacaoPage.tsx (649 linhas, 100% mock)
- ValidacaoPage.tsx (818 linhas, 100% mock)

---

## PARTE 1: VEREDICTO GERAL

### O planejamento das Ondas esta OK?

**VEREDICTO: O planejamento esta BEM ESTRUTURADO, mas tem PROBLEMAS DE PRIORIDADE para a sprint dessa semana.**

**Pontos POSITIVOS do plano atual:**
1. Ownership exclusivo de arquivos — sem conflitos de merge
2. Dependencias mapeadas corretamente (T1→tudo, T11+T12→T13, etc.)
3. Priorizacao por aderencia aos prompts existentes (Onda 2 = tools prontas)
4. Separacao clara backend-tools vs backend-infra

**Pontos NEGATIVOS (e correcoes necessarias):**

| # | Problema | Impacto | Correcao |
|---|----------|---------|---------|
| 1 | **CaptacaoPage (T8) depende de `onSendToChat` para buscar editais** — mas isso forca o resultado a aparecer no CHAT, nao na tabela da page | **CRITICO** — UX quebrada, o WORKFLOW SISTEMA.pdf mostra resultados NA TABELA DA PAGE, nao no chat | Busca deve usar REST direto (`POST /api/chat` com retorno JSON) ou endpoint dedicado, NAO `onSendToChat` |
| 2 | **ValidacaoPage (T10) tenta usar `onSendToChat` para "Gerar Resumo"** — resultado apareceria no chat, nao na aba Cognitiva da page | **CRITICO** — DOC4 pag 8 mostra resumo INLINE na page | Usar `fetch` direto ao `/api/chat` e renderizar resultado no componente |
| 3 | **Padrao `onSendToChat` foi pensado para Portfolio** — funciona la porque o resultado e texto livre no chat. Para Captacao/Validacao os resultados sao DADOS ESTRUTURADOS (tabela de editais, 6 scores, gaps) | **ALTO** — o padrao nao se aplica a pages que exibem dados em componentes visuais | Criar funcao `callChatAPI(prompt)` que retorna `{action_type, resultado}` sem jogar no chat |
| 4 | **Onda 2 coloca CaptacaoPage + ValidacaoPage no mesmo page-engineer-sprint2** — sao as 2 pages mais complexas do sistema (649 + 818 linhas) com UX muito diferente | **MEDIO** — risco de atraso | Separar: um agente para Captacao, outro para Validacao |
| 5 | **Nao ha tratamento do fluxo Captacao → Validacao** — DOC4 pag 6 diz "Cliquei no edital que posso ter interesse, ele abre a proxima tela (Validacao)" | **ALTO** — a navegacao Captacao→Validacao nao esta mapeada em nenhuma task | Criar task: ao clicar "Ver Detalhes" na Captacao, navegar para Validacao com edital selecionado |

---

## PARTE 2: ANALISE PROFUNDA — CAPTACAO (Meta da Sprint)

### 2.1 O que o WORKFLOW SISTEMA.pdf exige para Captacao

Analisando as paginas 5-7 do PDF:

**Layout da Captacao (DOC4 pag 5):**
```
+-------------------------------------------------------------+
| Painel de Oportunidades                                     |
+------------------+---------------------+--------------------+
| Licitacao        | Produto Correspon.  | Score Aderencia    |
| Licitacao 2023/458 | Produto: Bomba X-300 | [98%]           |
| Licitacao 2023/461 | Produto: Valvula V-15| [91%]           |
| Licitacao 2023/462 | Produto: Motor M-550 | [88%]           |
+------------------+---------------------+--------------------+
|                                                             |
| Datas de submissao  | Analise do Edital (detalhes)          |
| Prox. 2 dias: 2     | Score Aderencia Tecnica: 90%          |
| Prox. 5 dias: 5     | Score Aderencia Comercial: 75%        |
| Prox. 10 dias: x    | Score Recomendacao: 4.5/5             |
| Prox. 20 dias: x    | Potencial de Ganho: Elevado           |
|                     |                                       |
|                     | Intencao Estrategica: ( ) Estrategico  |
|                     |   ( ) Defensivo ( ) Acompanhar         |
|                     |   ( ) Aprendizado                      |
|                     |                                       |
|                     | Expectativa de Margem: [---o---] 15%   |
|                     |                                       |
|                     | Analise de Gaps:                       |
|                     |   - Req 4.2.a NAO atendido             |
|                     |   - Certificacao XYZ pendente          |
+-------------------------------------------------------------+
```

**Classificacoes exigidas (DOC4 pag 7):**
- a) Por TIPO: Reagentes, Equipamentos, Comodato, Aluguel, Oferta de Preco
- b) Por ORIGEM: Municipal, Estadual, Federal, Universidade, Hospital, LACEN, etc.
- c) Locais de Busca: PNCP, ComprasNet, BEC-SP, SICONV
- d) Formato de Busca: NCM, Nome Tecnico, Palavra-chave (IA le o OBJETO do edital)
- e) Comunicacao: Alertas de matching, periodicidade configuravel

### 2.2 O que o CaptacaoPage.tsx atual TEM vs o que o DOC4 EXIGE

| Elemento DOC4 | Existe no CaptacaoPage.tsx? | Status | Observacao |
|---------------|---------------------------|--------|-----------|
| Tabela de oportunidades com Score | SIM (L252-328) | MOCK | 7 editais hardcoded |
| Coluna "Produto Correspondente" | SIM (L286-293) | MOCK | Dados hardcoded |
| Score circular com cores | SIM (ScoreCircle L310-314) | OK (componente) | Funciona visualmente |
| Sub-scores (Tecnico + Comercial + Recomendacao) | SIM (L512-514) | MOCK | 3 scores hardcoded |
| Datas de submissao (2/5/10/20 dias) | SIM (L347-371) | MOCK | Calcula sobre dados mock |
| Classificacao por TIPO | SIM (L411-421) | MOCK | Filtro local nao conectado |
| Classificacao por ORIGEM | SIM (L424-439) | MOCK | Filtro local nao conectado |
| Fontes de busca (PNCP, ComprasNet...) | SIM (L386-396) | MOCK | Select nao conectado |
| Analise de Gaps | SIM (L577-586) | MOCK | Lista hardcoded |
| Intencao Estrategica (radio) | SIM (L546-556) | MOCK | RadioGroup local |
| Expectativa de Margem (slider) | SIM (L559-574) | MOCK | Slider local |
| Potencial de Ganho | SIM (L531-539) | MOCK | Badge hardcoded |
| Buscar por termo + filtros | SIM (L376-456) | MOCK | handleBuscar filtra mockResultados (L190-200) |
| Salvar todos / Score >= 70% / Selecionados | SIM (L466-478) | MOCK | console.log |
| Checkbox de selecao | SIM (L254-263) | OK | Funciona (toggleSelect) |
| Exportar CSV | SIM (L470 botao) | MOCK | onClick vazio |
| Configurar Monitoria | SIM (L643 botao) | MOCK | onClick vazio |
| Botao "Abrir no PNCP" | SIM (L619-621) | MOCK | onClick vazio |
| Botao "Baixar PDF" | SIM (L623-627) | MOCK | onClick vazio |
| Cores da tabela (verde/amarelo/vermelho) | SIM (L232-236) | OK | getRowClass funciona |
| **NCM monitorado** | SIM (L639-640) | HARDCODED | Texto estatico "9011.80.00, 9027.30.11..." |
| **Monitoramento Automatico** | SIM (L637-645) | MOCK | Card estatico |

### 2.3 GAPS CRITICOS na CaptacaoPage

**GAP-C1: O botao "Buscar Editais" nao pode usar `onSendToChat`**

O plano (T8) diz: `onSendToChat("Busque editais de {termo} no PNCP")`. Isso jogaria o resultado no chat. Mas a UI mostra os resultados **na tabela da page** (DOC4 pag 5: "Painel de Oportunidades" com colunas Licitacao/Produto/Score).

**Solucao:** Criar funcao `searchEditais(params)` que:
1. Chama `POST /api/chat` com body `{message: "Busque editais de...", session_id}`
2. Recebe `{response, action_type, resultado}` onde `resultado` e um JSON com lista de editais
3. Seta `setResultados(resultado.editais)` — dados aparecem NA TABELA, nao no chat
4. Opcionalmente: criar endpoint REST dedicado `GET /api/editais/buscar?termo=X&uf=Y` que chama `tool_buscar_editais_scraper` internamente

**GAP-C2: Salvar editais nao persiste no banco**

Os botoes "Salvar Todos", "Salvar Score >= 70%", "Salvar Edital" fazem `console.log`. Precisam chamar `tool_salvar_editais_selecionados` com os editais selecionados.

**Solucao:** Criar funcao `salvarEditais(editais)` que chama `/api/chat` com "Salve os editais encontrados" + dados ou CRUD direto com `crudCreate("editais", edital)`.

**GAP-C3: Intencao Estrategica e Margem nao persistem**

RadioGroup e Slider alteram estado local. Quando o usuario sai da page, perde tudo.

**Solucao:** Ao mudar intencao/margem, chamar `crudCreate("estrategias-editais", {edital_id, decisao, margem_desejada})` ou `crudUpdate`.

**GAP-C4: Fluxo Captacao → Validacao ausente**

DOC4 pag 6: "Cliquei no edital que posso ter interesse, ele abre a proxima tela... Para enriquecer a validacao da escolha."

**Solucao:** Botao "Ver Detalhes" deve navegar para `/validacao?edital_id={id}` ou abrir o edital na ValidacaoPage.

**GAP-C5: Monitoramento Automatico e hardcoded**

O card de monitoramento (L637-645) mostra dados estaticos. Precisa consumir `tool_listar_monitoramentos`.

**Solucao:** Chamar `/api/chat` com "Quais monitoramentos tenho ativos?" e exibir resultado.

### 2.4 PROPOSTA DE IMPLEMENTACAO — CaptacaoPage (Revisada)

**Arquitetura proposta (NAO usar onSendToChat para busca):**

```typescript
// ABORDAGEM 1: Chamar /api/chat e extrair resultado estruturado
async function buscarEditais(params: BuscaParams) {
  setLoading(true);
  const prompt = `Busque editais de ${params.termo} no PNCP` +
    (params.uf !== "todas" ? ` no estado ${params.uf}` : "") +
    (params.calcularScore ? "" : " sem calcular score") +
    (params.incluirEncerrados ? " incluindo encerrados" : "");

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: prompt, session_id: sessionId }),
  });
  const data = await response.json();

  // O backend retorna action_type e resultado com os editais
  if (data.resultado?.editais) {
    setResultados(data.resultado.editais);
  }
  setLoading(false);
}

// ABORDAGEM 2 (PREFERIVEL): Endpoint REST dedicado
// GET /api/editais/buscar?termo=microscopio&uf=MG&score=true&encerrados=false
// Internamente chama tool_buscar_editais_scraper + tool_calcular_score_aderencia
```

**Recomendacao: ABORDAGEM 2** — criar endpoint REST dedicado `GET /api/editais/buscar` que encapsula as tools existentes. Assim:
- Resultado retorna como JSON estruturado (lista de editais com scores)
- Nao polui o chat com busca
- Performance melhor (sem passar pelo LLM para intent detection)
- A Captacao FUNCIONA INDEPENDENTE do chat

---

## PARTE 3: ANALISE PROFUNDA — VALIDACAO (Meta da Sprint)

### 3.1 O que o WORKFLOW SISTEMA.pdf exige para Validacao

Analisando as paginas 8-10 do PDF:

**Layout principal (DOC4 pag 8):**
- Sinais de Mercado (badges: "Concorrente Dominante", "Suspeita Licitacao Direcionada")
- Botoes decisao: [Participar] [Acompanhar] [Ignorar]
- Justificativa com motivo dropdown + texto livre
- Aprendizado da IA (justificativa alimenta inteligencia futura)

**Score Dashboard (DOC4 pag 8 — direita):**
```
Score Geral: 82/100

6 dimensoes:
1. Aderencia Tecnica (High) .......... 90%
2. Aderencia Documental (Medium) ..... 65%
3. Complexidade do Edital (Low) ...... 35%
4. Risco Juridico (Medium) ........... 60%
5. Viabilidade Logistica (High) ...... 85%
6. Atratividade Comercial (High) ..... 95%
```

**3 Abas de analise (DOC4 pag 8):**
- **Objetiva:** Aderencia Tecnica detalhada + Certificacoes + Checklist Documental
- **Analitica:** Pipeline de Riscos + Fatal Flaws + Reputacao Orgao + Alerta de Recorrencia + Aderencia Trecho-a-Trecho
- **Cognitiva:** Resumo IA + Historico Semelhante + "Pergunte a IA"

**Analise de Lote (DOC4 pag 8 — inferior esquerdo):**
```
[Aderente][Aderente][Aderente]...[Aderente][Item Intruso]
                                          ↓
                               "Dependencia de Terceiros
                                (Impacto no Lote Inteiro)"
```

**Validacao — 6 dimensoes de score (DOC4 pag 9):**
- a) Tecnica / Portfolio: itens intrusos, complementacao, portfolio familia/individual
- b) Documental: balancos, certidoes, registros. Se inusitado → candidato a impugnacao
- c) Juridicos: historico de aditivos, acoes contra empresas, edital direcionado, pregoeiro rigoroso
- d) Logistica: distancia para assistencia tecnica, etc.
- e) Comerciais: precos, precos predatorios, atrasos de faturamento, margem impactada, concorrente dominante
- f) Indicar tipo empresa que pode participar (micro, lucro presumido)

**Processo Amanda (DOC4 pag 10):**
- Leitura do edital → montagem de pastas:
  1. Pasta documentos da empresa
  2. Pasta documentos fiscais e certidoes
  3. Pasta qualificacao tecnica (registro ANVISA por produto)

### 3.2 O que o ValidacaoPage.tsx atual TEM vs o que o DOC4 EXIGE

| Elemento DOC4 | Existe no ValidacaoPage.tsx? | Linhas | Status | Qualidade UI |
|---------------|---------------------------|--------|--------|-------------|
| Tabela de editais com status+score | SIM (L383-395, L650) | L650 | MOCK | BOA |
| Filtro por status (novo/analisando/validado/descartado) | SIM (L636-649) | L639-648 | OK | BOA |
| Score Geral circular grande | SIM (L731) | L731 | MOCK | BOA |
| 6 dimensoes de score (barras) | SIM (L739-744) | L738-745 | MOCK | EXCELENTE — exatamente como DOC4 |
| Sinais de Mercado (badges) | SIM (L658-666) | L657-666 | MOCK | BOA — badges coloridos |
| Fatal Flaws (card vermelho) | SIM (L498-510) | L498-510 | MOCK | EXCELENTE |
| Botoes Participar/Acompanhar/Ignorar | SIM (L668-672) | L668-672 | MOCK (setState) | BOA |
| Justificativa com motivo+texto | SIM (L676-699) | L676-699 | MOCK (nao persiste) | BOA |
| Aba Objetiva: Aderencia Tecnica | SIM (L399-468) | L399-468 | MOCK (scores hardcoded) | BOA |
| Aba Objetiva: Certificacoes | SIM (L414-428) | L414-428 | MOCK | BOA |
| Aba Objetiva: Checklist Documental | SIM (L431-447) | L431-447 | MOCK | BOA |
| Aba Objetiva: Analise de Lote | SIM (L449-467) | L449-467 | MOCK | EXCELENTE — barra visual como DOC4 |
| Aba Analitica: Pipeline Riscos | SIM (L474-494) | L474-494 | MOCK | BOA |
| Aba Analitica: Flags Juridicos | SIM (L486-493) | L486-493 | MOCK | BOA |
| Aba Analitica: Reputacao Orgao | SIM (L513-530) | L513-530 | MOCK | EXCELENTE — exatamente como DOC4 |
| Aba Analitica: Alerta Recorrencia | SIM (L532-538) | L532-538 | MOCK | EXCELENTE |
| Aba Analitica: Aderencia Trecho-a-Trecho | SIM (L541-557) | L541-557 | MOCK | EXCELENTE — tabela com ScoreBadge |
| Aba Cognitiva: Resumo IA | SIM (L564-573) | L564-573 | MOCK (setTimeout 2s) | BOA |
| Aba Cognitiva: Historico Semelhante | SIM (L576-595) | L576-595 | MOCK | BOA |
| Aba Cognitiva: Pergunte a IA | SIM (L598-610) | L598-610 | MOCK (setTimeout 1.5s) | BOA |
| Intencao Estrategica (radio) | SIM (L748-760) | L748-760 | MOCK (setState) | BOA |
| Expectativa de Margem (slider) | SIM (L761-777) | L761-777 | MOCK (setState) | BOA |
| Potencial de Ganho badge | SIM (L732-735) | L732-735 | MOCK | BOA |
| Botao PDF | SIM (L708) | L708 | MOCK | OK |
| **Processo Amanda (pastas)** | **NAO** | — | **AUSENTE** | — |
| **Tipo empresa (micro/lucro presumido)** | **NAO** | — | **AUSENTE** | — |
| **Score calculado por IA (real)** | **NAO** | — | **TODOS HARDCODED** | — |

### 3.3 CONCLUSAO ValidacaoPage — UI vs DOC4

**A UI da ValidacaoPage esta EXCELENTE em termos de design.** Os componentes visuais estao muito proximos do que o DOC4 pede:
- 6 barras de score iguais ao wireframe
- Barra de lote (aderente/intruso) igual ao wireframe
- Fatal Flaws igual ao wireframe
- Reputacao do Orgao igual ao wireframe
- Alerta de Recorrencia igual ao wireframe
- 3 abas (Objetiva/Analitica/Cognitiva) organizadas como DOC4

**O PROBLEMA e que TUDO e dados mock.** A UI esta pronta, so falta conectar ao backend.

### 3.4 GAPS CRITICOS na ValidacaoPage

**GAP-V1: Faltam 3 tools de score no backend**

O ValidacaoPage mostra 6 dimensoes de score. O backend so tem 2:
- Tecnico → `tool_calcular_aderencia` (existe)
- Comercial → `tool_recomendar_preco` + dados mercado (existe)
- **Documental → NAO EXISTE** (T11)
- **Juridico → NAO EXISTE** (T12)
- **Logistico → NAO EXISTE** (T25 — Onda 3)
- Complexidade → Pode ser derivado dos outros

**Impacto:** Sem esses scores, o Score Geral (82/100 no mock) nao pode ser calculado de verdade.

**Proposta para a sprint:**
- Score Documental (T11): Checar docs da empresa vs docs exigidos no edital. Pode ser feito com dados existentes (CRUD empresa-documentos + editais-requisitos).
- Score Juridico (T12): Analisar clausulas do edital via LLM (flags restritivos, direcionamento). Pode usar `tool_perguntar_edital` como base.
- Score Logistico pode ficar para Onda 3 — e o menos critico dos 6.

**GAP-V2: O botao "Gerar Resumo" nao pode usar setTimeout mock**

Atualmente (L294-305): setTimeout 2s retorna texto hardcoded.

**Solucao:**
```typescript
async function handleResumirEdital() {
  if (!selectedEdital) return;
  setResumoLoading(true);
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { ... },
    body: JSON.stringify({
      message: `Resuma o edital ${selectedEdital.numero}`,
      session_id: sessionId,
    }),
  });
  const data = await response.json();
  setSelectedEdital(prev => prev ? { ...prev, resumo: data.response } : null);
  setResumoLoading(false);
}
```

**GAP-V3: O botao "Perguntar" nao pode usar setTimeout mock**

Mesmo problema. Solucao identica: chamar `/api/chat` com a pergunta.

**GAP-V4: Decisoes (Participar/Acompanhar/Ignorar) nao persistem**

Botoes fazem `handleMudarStatus(id, "validado")` que e setState local. Perdem-se ao recarregar.

**Solucao:**
1. Chamar `crudUpdate("editais", id, {status: novoStatus})`
2. Chamar `crudCreate("estrategias-editais", {edital_id, decisao, justificativa, margem_desejada})`

**GAP-V5: Justificativa nao persiste e nao alimenta aprendizado**

DOC4 pag 8: "A justificativa e o combustivel para a inteligencia futura." Atualmente: `setShowJustificativa(false)` sem salvar.

**Solucao:** Salvar via `crudUpdate("estrategias-editais", id, {justificativa, motivo})`.

**GAP-V6: Os editais na tabela sao hardcoded**

Os 5 editais em `mockEditais` (L89-268) sao dados estaticos. Precisam vir do banco.

**Solucao:**
```typescript
useEffect(() => {
  async function fetchEditais() {
    const data = await crudList("editais", {});
    setEditais(data);
  }
  fetchEditais();
}, []);
```

**GAP-V7: Scores nao sao calculados pela IA**

Cada edital tem `scores: { tecnico: 90, documental: 65, ... }` hardcoded. Precisam ser calculados pela IA.

**Solucao:** Para cada edital, chamar as tools de score:
- `tool_calcular_aderencia(produto_id, edital_id)` → score tecnico
- `tool_calcular_score_documental(edital_id, empresa_id)` → score documental (NOVA)
- `tool_calcular_score_juridico(edital_id)` → score juridico (NOVA)
- `tool_recomendar_preco(edital_id)` → dados para score comercial
- Complexidade pode ser derivada do numero de requisitos/itens

**GAP-V8: Processo Amanda nao existe**

DOC4 pag 10 descreve organizacao em pastas. Nao esta no ValidacaoPage nem em nenhuma task.

**Proposta:** Adiar para Onda 3. Criar aba "Documentacao" ou card lateral com checklist de pastas.

**GAP-V9: Nao identifica tipo de empresa que pode participar**

DOC4 pag 9 item f: "Indicar sobre o tipo de empresa pode participar (micro, lucro presumido)."

**Proposta:** Adicionar badge no header do edital: "ME/EPP exclusivo" ou "Ampla concorrencia". Pode ser extraido do edital via `tool_perguntar_edital("Este edital e exclusivo para ME/EPP?")`.

---

## PARTE 4: ANALISE DAS PARTES QUE DEPENDEM DA IA

### 4.1 Prompts de IA bem definidos na UI e no chat

| Funcao | Prompts Chat | Tool Backend | Na Page (botao/form) | Veredicto |
|--------|-------------|-------------|---------------------|----------|
| Buscar editais PNCP | 7 prompts (Grupo 2 #1-7) | tool_buscar_editais_scraper | NAO (CaptacaoPage mock) | **PROBLEMA:** resultado precisa ir pra tabela, nao pro chat |
| Resumir edital | 3 prompts (Grupo 2.1 #1-3) | call_deepseek (RAG) | NAO (ValidacaoPage mock) | **OK se usar fetch direto** |
| Perguntar edital | 7 prompts (Grupo 2.1 #4-10) | call_deepseek (RAG) | NAO (ValidacaoPage mock) | **OK se usar fetch direto** |
| Calcular aderencia | 3 prompts (Grupo 3) | tool_calcular_aderencia | NAO | **OK** — resultado numerico |
| Classificar edital | 3 prompts (Grupo 10) | tool_classificar_edital | NAO | **OK** — resultado texto |
| Extrair datas | 2 prompts (Grupo 17) | tool_extrair_datas_edital | NAO | **OK** — resultado estruturado |

### 4.2 Partes que dependem de IA e NAO estao bem definidas

| Funcao | Problema | O que falta definir |
|--------|---------|-------------------|
| **Score Documental** | Tool nao existe. Nao esta claro COMO calcular | Definir: quais docs sao exigidos (extrair do edital) vs quais a empresa TEM (CRUD empresa-documentos). Score = % de docs atendidos. |
| **Score Juridico** | Tool nao existe. Nao esta claro quais flags | Definir: quais clausulas sao flags (restricao regional, aglutinacao, exigencia inusitada, prazo curto). Usar LLM para identificar via analise do PDF do edital. |
| **Score Logistico** | Tool nao existe. Nao ha dados de logistica | Definir: calcular distancia entre sede da empresa (CRUD empresa.uf/cidade) e local de entrega (edital.uf). Tempo de entrega vs prazo do edital. |
| **Decision Engine Go/NoGo** | Tool nao existe. Algoritmo nao definido | Definir: combinar 6 scores + parametros do ParametroScore (limiar_go, limiar_nogo) + fatal flaws. Se tem fatal flaw → NoGo automatico. Se score > limiar_go → Go. Se score < limiar_nogo → NoGo. |
| **Itens Intrusos** | Tool nao existe. Nao esta claro o criterio | Definir: comparar itens do lote (EditalItem) com portfolio da empresa (Produto). Se item nao tem correspondencia no portfolio → intruso. Score = % aderentes / total. |
| **Reputacao Orgao** | Dados nao existem no banco | Definir: construir a partir de historico de editais do mesmo orgao (vitorias/derrotas/cancelamentos). O mock ja tem a estrutura certa. |

### 4.3 Prompts que FALTAM e precisam ser criados

| # | Prompt a criar | Tool a criar | Onde usar | Sprint |
|---|---------------|-------------|----------|--------|
| 1 | "Calcule o score documental do edital {NUM}" | tool_calcular_score_documental | ValidacaoPage | ESTA SEMANA |
| 2 | "Calcule o score juridico do edital {NUM}" | tool_calcular_score_juridico | ValidacaoPage | ESTA SEMANA |
| 3 | "Calcule a decisao Go/NoGo do edital {NUM}" | decision_engine_go_nogo | ValidacaoPage + CaptacaoPage | ESTA SEMANA |
| 4 | "Calcule o score logistico do edital {NUM}" | tool_calcular_score_logistico | ValidacaoPage | PROXIMA SEMANA |
| 5 | "Detecte itens intrusos no edital {NUM}" | tool_detectar_itens_intrusos | ValidacaoPage | PROXIMA SEMANA |
| 6 | "Atualize o status da proposta do edital {NUM}" | tool_atualizar_status_proposta | SubmissaoPage | PROXIMA SEMANA |

---

## PARTE 5: PLANO REVISADO PARA A SPRINT DESSA SEMANA

### Sprint 18-21/02/2026 — Meta: Captacao + Validacao FUNCIONAIS

### Dia 1 (18/02 — Terça): Backend + Setup

| # | Task | Tipo | Agente | Duracao |
|---|------|------|--------|---------|
| S1 | Criar endpoint REST `GET /api/editais/buscar` que encapsula `tool_buscar_editais_scraper` + `tool_calcular_score_aderencia` | Backend | backend-tools | 1-2h |
| S2 | Criar endpoint REST `GET /api/editais/salvos` que lista editais do usuario com scores e estrategia | Backend | backend-tools | 30min |
| S3 | Criar `tool_calcular_score_documental(edital_id, empresa_id)` — compara docs exigidos vs docs da empresa | Backend | backend-tools | 1-2h |
| S4 | Criar `tool_calcular_score_juridico(edital_id)` — LLM analisa clausulas restritivas do edital | Backend | backend-tools | 1-2h |
| S5 | Criar `decision_engine_go_nogo(edital_id)` — combina scores + parametros + fatal flaws | Backend | backend-tools | 1h |

### Dia 2 (19/02 — Quarta): CaptacaoPage

| # | Task | Tipo | Agente | Duracao |
|---|------|------|--------|---------|
| S6 | CaptacaoPage: Substituir mock por `GET /api/editais/buscar` | Frontend | page-captacao | 2h |
| S7 | CaptacaoPage: Botoes Salvar → chamar `tool_salvar_editais_selecionados` via `/api/chat` ou CRUD | Frontend | page-captacao | 1h |
| S8 | CaptacaoPage: Intencao + Margem → persistir via CRUD `estrategias-editais` | Frontend | page-captacao | 1h |
| S9 | CaptacaoPage: "Ver Detalhes" → navegar para ValidacaoPage com edital_id | Frontend | page-captacao | 30min |
| S10 | CaptacaoPage: Card Monitoramento → consumir `tool_listar_monitoramentos` via fetch | Frontend | page-captacao | 1h |

### Dia 3 (20/02 — Quinta): ValidacaoPage

| # | Task | Tipo | Agente | Duracao |
|---|------|------|--------|---------|
| S11 | ValidacaoPage: Tabela → consumir `GET /api/editais/salvos` | Frontend | page-validacao | 1h |
| S12 | ValidacaoPage: Score Dashboard → chamar tools de score para edital selecionado | Frontend | page-validacao | 2h |
| S13 | ValidacaoPage: Aba Cognitiva (Resumir + Perguntar) → chamar `/api/chat` | Frontend | page-validacao | 1h |
| S14 | ValidacaoPage: Decisao (Participar/Acompanhar/Ignorar) → CRUD editais + estrategias-editais | Frontend | page-validacao | 1h |
| S15 | ValidacaoPage: Justificativa → salvar no CRUD estrategias-editais | Frontend | page-validacao | 30min |

### Dia 4 (21/02 — Sexta): Integracao + Testes

| # | Task | Tipo | Agente | Duracao |
|---|------|------|--------|---------|
| S16 | Integrar fluxo completo: Buscar no PNCP → Salvar → Abrir Validacao → Scores → Decisao → Justificativa | QA | qa | 2h |
| S17 | Verificar que dados reais do PNCP aparecem na tabela de Captacao com scores reais | QA | qa | 1h |
| S18 | Verificar que "Gerar Resumo" e "Perguntar" funcionam com edital real (PDF necessario) | QA | qa | 1h |
| S19 | Fix de bugs | Todos | todos | 2h |

### Diferenca em relacao ao plano original (T8, T9, T10, T11, T12, T13)

| Aspecto | Plano Original | Plano Revisado | Por que mudou |
|---------|---------------|---------------|---------------|
| Busca de editais | `onSendToChat` (resultado no chat) | Endpoint REST dedicado | DOC4 mostra resultado na TABELA |
| Resumir edital | `onSendToChat` | `fetch /api/chat` direto | Resultado deve aparecer na aba Cognitiva, nao no chat |
| Scores | Sem endpoint REST | `GET /api/editais/buscar` retorna scores | Performance + UX |
| Navegacao Captacao→Validacao | Nao mapeada | Task S9 | DOC4 pag 6 exige |
| Score Logistico | Onda 2 (junto com Documental e Juridico) | Onda 3 (proxima semana) | Menos critico, pode ser 0 por enquanto |

---

## PARTE 6: PROBLEMAS POTENCIAIS NAS ONDAS SEGUINTES

### Onda 3: Problemas identificados

| # | Problema | Impacto | Mitigacao |
|---|----------|---------|----------|
| 1 | ImpugnacaoPage (T21) depende de T19+T20 (tools juridicas). Essas tools precisam gerar TEXTO LONGO via LLM | Medio — tempo de resposta pode ser >30s | Implementar loading com progresso, ou gerar em background |
| 2 | ConcorrenciaPage (T34) precisa de dados de concorrentes. Tabela `concorrentes` tem 7 registros mas `participacoes_editais` tem 0 | Alto — page vai abrir com tabela quase vazia | Popular dados de teste, ou integrar com extracao automatica de atas |
| 3 | FlagsPage (T35) precisa de alertas reais. Tabela `alertas` tem 0 registros | Medio — page abre vazia | Criar alertas de demonstracao ou mostrar mensagem "Configure seus alertas" |
| 4 | MonitoriaPage (T36) precisa de scheduler real. Nao ha Celery/cron configurado | **ALTO** — monitoramento nao roda automaticamente | Task T40 (SMTP) deveria vir junto com scheduler. Considerar APScheduler |

### Onda 4: Problemas identificados

| # | Problema | Impacto | Mitigacao |
|---|----------|---------|----------|
| 1 | MercadoPage TAM/SAM/SOM (T41+T43) — calculo depende de volume significativo de dados | Baixo — pode mostrar "Dados insuficientes" | Implementar calculo com aviso de confiabilidade |
| 2 | LancesPage (T49+T50) — precisa de acesso ao portal de lances (ComprasNet) que nao temos | **ALTO** — funcionalidade pode nao ser demonstravel | Marcar como "Simulacao" na UI. Focar na simulacao offline |
| 3 | AnalyticsPage (T45) — tool_consulta_mindsdb precisa de MindsDB configurado | Medio — se MindsDB nao esta up, page nao funciona | Verificar conexao antes de implementar page |

---

## PARTE 7: CHECKLIST DE VERIFICACAO PRE-SPRINT

Antes de iniciar a sprint, verificar:

- [ ] Backend esta rodando? (`python app.py` na porta 5007)
- [ ] MySQL esta up? (tabelas criadas, dados de teste)
- [ ] PNCP esta acessivel? (testar `tool_buscar_editais_scraper` com termo real)
- [ ] LLM esta acessivel? (LM Studio ou DeepSeek API)
- [ ] Tem editais reais salvos no banco? (se nao, buscar e salvar via chat)
- [ ] Tabela `empresa` tem pelo menos 1 registro? (necessario para score documental)
- [ ] Tabela `empresa_documentos` tem documentos? (necessario para score documental)
- [ ] Tabela `parametro_score` tem registro? (necessario para decision engine)
- [ ] Frontend compila? (`npx tsc --noEmit`)
- [ ] Endpoint CRUD generico funciona? (`GET /api/crud/editais`)

---

## PARTE 8: RESUMO EXECUTIVO

### O que esta BEM:
1. **UI da ValidacaoPage e excelente** — segue o DOC4 fielmente, so falta conectar
2. **UI da CaptacaoPage e boa** — tem todos os elementos, so falta conectar
3. **Backend tem 49 tools + 108 prompts** — 95% das tools necessarias ja existem
4. **Plano de 4 ondas e solido** — ownership exclusivo, dependencias corretas

### O que precisa CORRIGIR:
1. **NAO usar `onSendToChat` para busca de editais** — resultado deve ir para tabela, nao para chat
2. **Criar endpoints REST dedicados** para busca e listagem de editais (nao depender do chat)
3. **Criar 3 tools novas** esta semana: score documental, score juridico, decision engine
4. **Mapear navegacao Captacao → Validacao** — ausente no plano
5. **Separar agentes** — Captacao e Validacao sao complexas demais para 1 agente

### Prioridade da Sprint:
```
DIA 1: Backend (endpoints REST + 3 tools novas)
DIA 2: CaptacaoPage (busca real + salvar + persistir estrategia)
DIA 3: ValidacaoPage (scores reais + resumo IA + decisao persistente)
DIA 4: Integracao + QA
```

**Resultado esperado ao final da sprint:**
- Usuario busca editais no PNCP → resultados reais aparecem na tabela de Captacao com scores
- Usuario clica em edital → abre Validacao com 4-5 scores calculados pela IA
- Usuario gera resumo e faz perguntas sobre edital → respostas reais da IA
- Usuario decide Participar/Acompanhar/Ignorar → decisao persiste no banco com justificativa
