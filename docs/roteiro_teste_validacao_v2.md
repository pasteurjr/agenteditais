# Roteiro Detalhado de Teste — Página de Validação
## Baseado em requisitos_completosv2.md (RF-026 a RF-037)

**Data:** 2026-03-09
**Página:** ValidacaoPage (`frontend/src/pages/ValidacaoPage.tsx`)
**Endpoint principal:** `GET /api/editais/salvos?com_score=true&com_estrategia=true`

---

## Pré-requisitos

1. Backend rodando na porta 5007 (`python3 backend/app.py`)
2. Frontend rodando na porta 5175 (`cd frontend && npm run dev`)
3. Login com `pasteurjr@gmail.com` / `123456`
4. Ter pelo menos 1 edital salvo (via Captação → botão Salvar)
5. Ter produtos cadastrados no Portfolio (ex: Sysmex XN-1000, HP LaserJet, etc.)

---

## TESTE 0 — Lista de Editais Salvos (pré-condição)

1. Navegar para **Fluxo Comercial → Validação**
2. Verificar que a tabela carrega **somente editais salvos** (não temporários)
3. Colunas esperadas: número, órgão, UF, objeto, valor, data abertura, status, score
4. Testar ordenação, busca por texto, filtro por status
5. Clicar em um edital → painel direito deve abrir

**Resultado esperado:** Tabela populada apenas com editais salvos na Captação.

---

## TESTE 1 — RF-026: Sinais de Mercado (barra superior)

**Requisito:** Alertas de sinais de mercado detectados pela IA.

**Passos:**
1. Com edital selecionado, verificar a **barra superior** (`.validacao-top-bar`)
2. Procurar **badges de sinais de mercado**:
   - [ ] "Concorrente Dominante Identificado" (badge vermelho/amarelo)
   - [ ] "Suspeita de Licitação Direcionada" (badge vermelho/amarelo)
3. Cada sinal deve ter **ícone + texto** e cor correspondente à severidade
4. Sinais são calculados pela IA a partir dos dados do edital e histórico

**Critérios de aceite (RF-026):**
- [ ] Barra no topo da validação com badges de sinais
- [ ] Cada sinal é uma badge colorida (vermelho/amarelo) com ícone e texto
- [ ] Sinais calculados pela IA a partir de dados do edital e histórico

**Resultado esperado:** Badges de sinais visíveis no topo quando aplicável.

---

## TESTE 2 — RF-027: Decisão (Participar / Acompanhar / Ignorar)

**Requisito:** 3 opções de decisão com justificativa obrigatória.

**Passos:**
1. Na barra superior, verificar os **3 botões de decisão**:
   - [ ] **Participar** (verde com ícone check)
   - [ ] **Acompanhar** (azul)
   - [ ] **Ignorar** (com ícone X)
2. Clicar em **"Participar"**
3. Verificar que abre **formulário de justificativa** com:
   - [ ] **Dropdown de motivo** com pelo menos 9 opções pré-definidas:
     - Preço competitivo
     - Portfólio aderente
     - Margem insuficiente
     - Falta documentação
     - Concorrente forte
     - Risco jurídico
     - Fora da região
     - Outro
   - [ ] **Textarea** para justificativa livre
4. Selecionar motivo + digitar detalhes → Clicar **Salvar**
5. Verificar:
   - [ ] Badge **"Decisão salva"** aparece (verde)
   - [ ] **Status** do edital mudou para **"validado"** na tabela à esquerda
6. Repetir com **"Acompanhar"** → status deve mudar para **"analisando"**
7. Repetir com **"Ignorar"** → status deve mudar para **"descartado"**
8. Verificar que a decisão é **atualizada** (não duplicada) ao mudar

**Critérios de aceite (RF-027):**
- [ ] 3 botões com cores distintas
- [ ] Ao clicar, abre formulário de justificativa
- [ ] Dropdown com motivos pré-definidos (>=9 opções)
- [ ] Textarea para justificativa livre
- [ ] Justificativa salva no backend (POST/PUT `/api/crud/validacao_decisoes`)
- [ ] Persistência por edital

**Resultado esperado:** Decisão persiste no banco, status reflete na tabela, modal funcional.

---

## TESTE 3 — RF-028: Score Dashboard (6 Dimensões)

**Requisito:** Dashboard visual com score geral e 6 sub-scores.

**Passos:**
1. Clicar botão **"Calcular Scores IA"**
2. Aguardar loading (spinner, ~10-30s)
3. Verificar que aparece:
   - [ ] **ScoreCircle grande** (110px) com Score Geral (0-100)
   - [ ] **6 barras horizontais** com porcentagem e nível (High/Medium/Low):
     1. Aderência Técnica
     2. Aderência Documental
     3. Complexidade do Edital
     4. Risco Jurídico
     5. Viabilidade Logística
     6. Atratividade Comercial
   - [ ] **Cores corretas**: verde (High, >=70), amarelo (Medium, 30-70), vermelho (Low, <30)
   - [ ] **Badge de Potencial**: Elevado (verde) / Médio (amarelo) / Baixo (vermelho)
   - [ ] **Decisão IA**: GO (verde) / NO-GO (vermelho) / CONDICIONAL (amarelo)
   - [ ] **Justificativa da IA**: parágrafo de texto explicativo
   - [ ] **Pontos Positivos**: lista com itens verdes
   - [ ] **Pontos de Atenção**: lista com itens amarelos

**Critérios de aceite (RF-028):**
- [ ] Círculo grande com score geral (0-100)
- [ ] 6 barras horizontais com porcentagem e nível
- [ ] Cores: verde (High), amarelo (Medium), vermelho (Low)
- [ ] Scores calculados pelo motor multi-dimensional do backend
- [ ] Score é **determinístico** (temperature=0, mesmo resultado a cada cálculo)
- [ ] Produto correto é selecionado automaticamente (matching inteligente por keywords)

**Endpoint:** `POST /api/editais/{editalId}/scores-validacao`

**Resultado esperado:** Todos os 6 scores + decisão + justificativa + pontos aparecem.

---

## TESTE 4 — RF-029: 3 Abas (Objetiva / Analítica / Cognitiva)

**Requisito:** 3 abas organizando diferentes perspectivas de análise.

> **Nota:** Na implementação atual as abas foram renomeadas para: Aderência, Documentos, Riscos, Mercado, IA. O mapeamento para os requisitos é:
> - **Objetiva** → Aderência + Documentos
> - **Analítica** → Riscos + Mercado
> - **Cognitiva** → IA

### 4a. Aba Aderência (parte da Objetiva)
1. Clicar na aba **"Aderência"** (ícone Target)
2. Verificar:
   - [ ] **Banner de Decisão IA** no topo (GO/NO-GO/CONDICIONAL com cor)
   - [ ] **Sub-scores Técnicos Detalhados** — grid de barras com labels e valores
   - [ ] **Certificações** — lista com badges: OK (verde), Vencida (vermelho), Pendente (amarelo)
   - [ ] **Análise de Lote** (ver TESTE 6 — RF-031)
   - [ ] **Mapa Logístico** (ver item F5 abaixo)
   - [ ] **Intenção Estratégica** — radio buttons (estratégico/defensivo/acompanhamento/aprendizado)
   - [ ] **Slider de Margem** (0-50%)

### 4b. Aba Documentos (parte da Objetiva)
3. Clicar na aba **"Documentos"** (ícone FolderOpen)
4. Verificar componentes (ver TESTE 8 — RF-036)

### 4c. Aba Riscos (Analítica)
5. Clicar na aba **"Riscos"** (ícone AlertTriangle)
6. Verificar componentes (ver TESTE 7 — RF-032)

### 4d. Aba Mercado (Analítica)
7. Clicar na aba **"Mercado"** (ícone Building)
8. Verificar componentes (ver TESTE 9 — RF-033/RF-034)

### 4e. Aba IA (Cognitiva)
9. Clicar na aba **"IA"** (ícone Sparkles)
10. Verificar componentes (ver TESTE 10)

**Critérios de aceite (RF-029):**
- [ ] Todas as abas clicáveis e funcionais
- [ ] Cada aba com seus componentes conforme descrito
- [ ] Dados reais do backend (scores, documentos, histórico)

---

## TESTE 5 — RF-030: Aderência Técnica Trecho-a-Trecho

**Requisito:** Comparação lado-a-lado entre trechos do edital e trechos do portfolio.

**Passos:**
1. Na aba **Riscos**, procurar seção **"Aderência Trecho-a-Trecho"**
2. Verificar **tabela com 3 colunas**:
   - [ ] **Trecho do Edital** — texto extraído do edital
   - [ ] **Aderência (%)** — ScoreBadge com porcentagem e cor
   - [ ] **Trecho do Portfolio** — texto correspondente do produto
3. Verificar cores na coluna de aderência:
   - [ ] Verde (>=70%) — Aderente
   - [ ] Amarelo (30-70%) — Parcialmente Aderente
   - [ ] Vermelho (<30%) — Não Aderente
4. Verificar **resumo textual da IA** abaixo da tabela

**Critérios de aceite (RF-030):**
- [ ] Tabela com 3 colunas: Trecho do Edital, Aderência (%), Trecho do Portfolio
- [ ] Cores na coluna de aderência (verde/amarelo/vermelho)
- [ ] Resumo textual da IA
- [ ] Dados calculados pela comparação automática edital vs portfolio

**Resultado esperado:** Tabela de aderência trecho-a-trecho visível e com dados reais.

---

## TESTE 6 — RF-031: Análise de Lote (Itens Intrusos)

**Requisito:** Identificação de itens do lote que não pertencem ao segmento da empresa.

**Passos:**
1. Na aba **Aderência**, procurar seção **"Análise de Lote"**
2. Verificar **barra horizontal segmentada**:
   - [ ] Segmentos **verdes** = itens "aderente" (produto compatível)
   - [ ] Segmentos **vermelhos/amarelos** = itens "intruso" (produto incompatível)
3. Verificar **legenda** abaixo:
   - [ ] "Aderente (N)" — quantidade de itens aderentes
   - [ ] "Item Intruso (N)" — quantidade de itens intrusos
4. Verificar **texto de alerta** quando há itens intrusos significativos:
   - [ ] "Item Intruso: Dependência de Terceiros (Impacto no Lote Inteiro)"
5. Verificar **percentual de aderência do lote**

**Critérios de aceite (RF-031):**
- [ ] Barra horizontal com proporção aderentes vs intrusos
- [ ] Cores: verde (aderente), amarelo (intruso)
- [ ] Legenda com descrição do item intruso
- [ ] Percentual de aderência do lote
- [ ] Alerta quando há itens intrusos significativos

---

## TESTE 7 — RF-032: Pipeline de Riscos

**Requisito:** Pipeline de riscos em 3 categorias com badges.

**Passos:**
1. Clicar na aba **"Riscos"** (ícone AlertTriangle)
2. Verificar **seção "Pipeline de Riscos"** com 3 categorias:

### 7a. Modalidade e Risco
   - [ ] Badge de modalidade (ex: "Pregão Eletrônico")
   - [ ] Badge de risco preço predatório (se detectado)
   - [ ] Badge de prazo faturamento (ex: "Faturamento 45 dias")

### 7b. Checklist Documental
   - [ ] Lista de documentos com status:
     - Certidão Negativa → Vencida (vermelho/Crítico) ou OK (verde)
     - Atestado de Capacidade → OK (verde) ou Pendente (amarelo)
     - Balanço Patrimonial → OK ou Ajustável (amarelo)

### 7c. Flags Jurídicos
   - [ ] Lista de flags (badges amarelos/vermelhos) OU "Nenhum flag identificado" (verde)
   - [ ] Exemplos: "Aglutinação indevida", "Restrição regional"
   - [ ] Para cada flag, IA sugere como contornar

3. Verificar **Fatal Flaws** (se existirem):
   - [ ] Card **vermelho** com lista de problemas críticos
   - [ ] Nota: "O sistema identifica Fatal Flaws antes da leitura humana"

**Critérios de aceite (RF-032):**
- [ ] 3 seções empilhadas: Modalidade, Checklist, Flags
- [ ] Badges coloridas por severidade (vermelho=crítico, amarelo=ajustável, verde=ok)
- [ ] Detecção automática de "Fatal Flaws"
- [ ] Para cada flag, IA sugere como contornar

---

## TESTE 8 — RF-036: Processo Amanda (Documentação em 3 Pastas)

**Requisito:** Organização automática de documentos em 3 pastas conforme exigências do edital.

**Passos:**
1. Clicar na aba **"Documentos"** (ícone FolderOpen)

### 8a. Itens do Edital
2. Verificar **tabela de itens** com colunas: #, Descrição, Qtd, Unidade, Valor Unit., Valor Total
3. Se não houver itens, verificar botão **"Buscar Itens no PNCP"**

### 8b. 3 Pastas de Documentação
4. Verificar **3 pastas coloridas** (conforme Processo Amanda, pág. 9):
   - [ ] **Pasta 1: Documentos da Empresa** (azul) — categoria "empresa"
     - Contrato Social, Procuração, etc.
   - [ ] **Pasta 2: Documentos Fiscais e Certidões** (amarelo) — categoria "fiscal"
     - Certidão Negativa, FGTS, INSS, etc.
   - [ ] **Pasta 3: Qualificação Técnica** (verde) — categoria "tecnica"
     - Atestado de Capacidade, Registro ANVISA, etc.
5. Cada documento mostra:
   - [ ] Nome do documento
   - [ ] Badge **"Exigido"** (se requerido pelo edital)
   - [ ] **Validade**
   - [ ] **Status**: Disponível (verde), Vencido (amarelo), Faltante (vermelho)
6. Verificar que cada documento está **vinculado ao item/requisito do edital** que o exige

### 8c. Resumo de Completude
7. Verificar **barra de progresso** com percentual:
   - [ ] Verde: 100%
   - [ ] Amarelo: >= 70%
   - [ ] Vermelho: < 70%
8. Verificar **contadores**: Disponíveis / Vencidos / Faltantes

### 8d. Checklist Documental IA
9. Verificar **tabela** com colunas: Documento, Status (badge), Validade

### 8e. Ações
10. Testar botão **"Extrair Requisitos do Edital"** (se fonte = PNCP):
    - [ ] Chama `POST /api/editais/{editalId}/extrair-requisitos`
    - [ ] Recarrega documentação após sucesso
11. Testar botão **"Documentos Exigidos via IA"** (envia ao chat)

**Critérios de aceite (RF-036):**
- [ ] 3 pastas coloridas (azul/amarelo/verde)
- [ ] Dentro de cada pasta, lista de documentos com status (presente/faltante/vencido)
- [ ] Cada documento vinculado ao item/requisito do edital
- [ ] StatusBadges para cada documento (OK/Pendente/Exigido)
- [ ] Nota automática gerada pela IA sobre completude

**Endpoints:**
- `GET /api/editais/{editalId}/documentacao-necessaria`
- `GET /api/crud/editais-itens?edital_id={id}&per_page=200`
- `POST /api/editais/{editalId}/extrair-requisitos`

---

## TESTE 9 — RF-033 + RF-034: Reputação do Órgão + Alerta de Recorrência

**Requisito RF-033:** Informações de reputação do órgão licitante.
**Requisito RF-034:** Alerta quando editais semelhantes já foram recusados/perdidos.

**Passos:**
1. Clicar na aba **"Mercado"** (ícone Building)

### 9a. Reputação do Órgão (RF-033)
2. Verificar **card "Reputação do Órgão — {nome do órgão}"** com:
   - [ ] **Pregoeiro** — rigoroso / moderado / flexível
   - [ ] **Pagamento** — "Bom pagador" / "Pagador regular" / "Atrasos frequentes"
   - [ ] **Histórico** — quantidade de participações + resultado (GO/NO-GO)
3. Verificar indicadores positivo/negativo/neutro para cada item
4. Dados devem ser acumulados ao longo do tempo (memória corporativa)

### 9b. Alerta de Recorrência (RF-034)
5. Verificar **card de alerta** (se aplicável):
   - [ ] Mensagem tipo: "Editais semelhantes a este foram recusados N vezes por margem insuficiente"
   - [ ] Card **vermelho** quando há recorrência de perdas/recusas
   - [ ] Quantidade de ocorrências anteriores semelhantes
6. Se não houver recorrência → mensagem "Nenhum edital semelhante encontrado no histórico"

### 9c. Histórico de Editais Semelhantes
7. Verificar lista com:
   - [ ] Número do edital anterior
   - [ ] Badge de decisão (GO verde / NO-GO vermelho)
   - [ ] Score
   - [ ] Objeto truncado

### 9d. Botões de Ação
8. Testar **"Buscar Preços"** → envia ao chat: "Busque preços de {objeto} no PNCP"
9. Testar **"Analisar Concorrentes"** → envia ao chat: "Liste os concorrentes conhecidos"

**Critérios de aceite (RF-033):**
- [ ] Card com ícone do órgão
- [ ] 3+ itens de reputação com indicadores
- [ ] Dados acumulados ao longo do tempo
- [ ] Persistência no backend

**Critérios de aceite (RF-034):**
- [ ] Card de alerta vermelho quando há recorrência
- [ ] Descrição textual do padrão identificado
- [ ] Quantidade de ocorrências anteriores
- [ ] Dados calculados do histórico

---

## TESTE 10 — RF-029 (Aba Cognitiva): IA

**Requisito:** Resumo da IA, histórico semelhante, perguntar à IA.

**Passos:**
1. Clicar na aba **"IA"** (ícone Sparkles)

### 10a. Resumo Gerado pela IA
2. Clicar **"Gerar Resumo"** → aguardar loading
3. Verificar que texto de resumo aparece
4. Clicar **"Regerar Resumo"** → deve substituir o texto anterior

### 10b. Perguntar à IA
5. Digitar pergunta (ex: "Qual o prazo de entrega?") no campo de texto
6. Clicar **"Perguntar"** → aguardar → verificar resposta

### 10c. Ações Rápidas via IA
7. Testar cada botão rápido:
   - [ ] **Requisitos Técnicos** → envia ao chat
   - [ ] **Classificar Edital** → envia ao chat
   - [ ] **Gerar Proposta** → envia ao chat
   - [ ] **Baixar PDF do Edital** → envia ao chat
   - [ ] **Buscar Itens** → envia ao chat

**Critérios de aceite (RF-029 — Cognitiva):**
- [ ] Resumo IA funcional via `/api/chat`
- [ ] Perguntas livres funcionais
- [ ] Ações rápidas enviam ao chat corretamente

---

## TESTE 11 — RF-035: Aderências/Riscos por Dimensão

**Requisito:** 5-6 dimensões de aderência/risco classificadas como Impeditivo ou Ponto de Atenção.

**Passos:**
1. Na aba **Riscos**, procurar seção **"Avaliação por Dimensão"**
2. Verificar grid com **6 dimensões**:
   - [ ] **(a) Técnica/Portfolio** — riscos de aderência técnica, itens intrusos, complementação
   - [ ] **(b) Documental** — certidões vencidas, balanços, registros, candidatos a impugnação
   - [ ] **(c) Jurídico** — recorrência de aditivos, ações contra empresas, edital direcionado, pregoeiro rigoroso
   - [ ] **(d) Logística** — distância para assistência técnica
   - [ ] **(e) Comercial** — preços predatórios, atrasos faturamento, margem, concorrente dominante
   - [ ] **(f) Tipo de Empresa** — porte compatível (ME, EPP, etc.)
3. Cada dimensão com badge de classificação:
   - [ ] **Atendido** (verde, score >70)
   - [ ] **Ponto de Atenção** (amarelo, score 30-70)
   - [ ] **Impeditivo** (vermelho, score <30)
4. Verificar que IA fornece recomendação para cada item

**Critérios de aceite (RF-035):**
- [ ] Seção para cada dimensão (a-f) com dados relevantes
- [ ] Classificação como "Impeditivo" ou "Ponto de Atenção"
- [ ] IA fornece recomendação para cada item
- [ ] Dados calculados automaticamente

---

## TESTE 12 — RF-037: GO/NO-GO (Fluxo Completo)

**Requisito:** Decisão final consolidada com scores e recomendação da IA.

**Passos:**
1. Verificar que os scores já foram calculados (TESTE 3)
2. Verificar **recomendação automática da IA**: GO / NO-GO / ACOMPANHAR
3. Na barra superior, clicar **"Participar"** (GO)
4. Preencher justificativa → Salvar
5. Verificar:
   - [ ] Badge "Decisão salva" aparece
   - [ ] Status mudou para "validado"
   - [ ] Score geral consolidado visível
6. Verificar que ao **recalcular scores** (botão "Calcular Scores IA" novamente):
   - [ ] Scores são **recalculados** e atualizados
   - [ ] Valor deve ser consistente (temperature=0)
   - [ ] Sub-scores técnicos são recarregados

**Critérios de aceite (RF-037):**
- [ ] Botão "Calcular Scores IA" aciona cálculo das 6 dimensões
- [ ] Score geral consolidado
- [ ] Recomendação automática da IA (GO/NO-GO/ACOMPANHAR)
- [ ] Ao decidir, dados persistem no backend

---

## TESTE 13 — RF-029 (Objetiva): Mapa Logístico + Intenção + Margem

**Requisito:** Mapa logístico, intenção estratégica e slider de margem na aba Aderência.

**Passos:**

### 13a. Mapa Logístico (F5)
1. Na aba **Aderência**, procurar seção **"Mapa Logístico"**
2. Verificar:
   - [ ] UF do Edital (📍) ↔ UF da Empresa (🏢)
   - [ ] Badge de **distância**: Próximo (verde) / Médio (amarelo) / Distante (vermelho)
   - [ ] **Estimativa de entrega** em dias

### 13b. Intenção Estratégica
3. Verificar **radio buttons**:
   - [ ] Estratégico
   - [ ] Defensivo
   - [ ] Acompanhamento
   - [ ] Aprendizado
4. Selecionar uma opção → trocar de aba → voltar
5. Verificar que a **seleção persiste**

### 13c. Slider de Margem
6. Verificar **slider** (0-50%):
   - [ ] Mover slider e verificar que o percentual atualiza
   - [ ] Labels indicativas

**Resultado esperado:** Mapa, intenção e margem funcionais e persistentes.

---

## TESTE 14 — Ver Edital (PDF)

**Passos:**
1. Com edital selecionado, clicar **"Ver Edital"**
2. Verificar que o **modal PdfViewer** abre com o PDF do edital
3. Na **primeira vez**: PDF é baixado do PNCP e salvo localmente
4. Na **segunda vez**: PDF é servido do disco (instantâneo)
5. Verificar que os dados PNCP (cnpj, ano, seq) foram extraídos da URL

**Endpoint:** `GET /api/editais/{editalId}/pdf`

**Resultado esperado:** PDF visível no modal, salvo no banco para consultas futuras.

---

## Resumo dos Endpoints Testados

| Endpoint | Método | Teste | RF |
|----------|--------|-------|----|
| `/api/editais/salvos` | GET | T0 — Lista | — |
| `/api/editais/{id}/scores-validacao` | POST | T3, T12 — Scores | RF-028, RF-037 |
| `/api/editais/{id}/documentacao-necessaria` | GET | T8 — Documentação | RF-036 |
| `/api/editais/{id}/extrair-requisitos` | POST | T8e — Extrair requisitos | RF-036 |
| `/api/editais/{id}/pdf` | GET | T14 — Ver PDF | — |
| `/api/crud/editais-itens` | GET | T8a — Itens | RF-036 |
| `/api/crud/validacao_decisoes` | POST/PUT | T2, T12 — Decisão | RF-027, RF-037 |
| `/api/crud/editais` | GET | T9 — Histórico | RF-033 |
| `/api/chat` | POST | T10 — Resumo, perguntas | RF-029 |

---

## Mapeamento Requisitos → Testes

| Requisito | Descrição | Teste |
|-----------|-----------|-------|
| RF-026 | Sinais de Mercado | T1 |
| RF-027 | Decisão Participar/Acompanhar/Ignorar | T2 |
| RF-028 | Score Dashboard 6 Dimensões | T3 |
| RF-029 | 3 Abas (Objetiva/Analítica/Cognitiva) | T4, T10, T13 |
| RF-030 | Aderência Trecho-a-Trecho | T5 |
| RF-031 | Análise de Lote (Itens Intrusos) | T6 |
| RF-032 | Pipeline de Riscos | T7 |
| RF-033 | Reputação do Órgão | T9a |
| RF-034 | Alerta de Recorrência | T9b |
| RF-035 | Aderências/Riscos por Dimensão | T11 |
| RF-036 | Processo Amanda (3 Pastas) | T8 |
| RF-037 | GO/NO-GO | T12 |
