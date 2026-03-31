# Relatorio de Aceitacao — Sprint 5

**Agente de Editais (facilicita.ia) — Validacao de Casos de Uso UC-042 a UC-058**

| Campo | Valor |
|---|---|
| Data | 31/03/2026 |
| Sprint | Sprint 5 |
| Total de UCs | 17 (UC-042 a UC-058) |
| Backend | Flask :5007 |
| Frontend | Vite :5175 |

---

## Indice de Casos de Uso

- [UC-042 — Registrar Resultado](#uc-042)
- [UC-043 — Alertas de Vencimento](#uc-043)
- [UC-044 — Score Logistico](#uc-044)
- [UC-045 — Buscar Atas PNCP](#uc-045)
- [UC-046 — Extrair Ata via IA](#uc-046)
- [UC-047 — Dashboard de Atas](#uc-047)
- [UC-048 — Cadastrar Contrato](#uc-048)
- [UC-049 — Registrar Entrega com NF](#uc-049)
- [UC-050 — Cronograma de Entregas](#uc-050)
- [UC-051 — Aditivos Contratuais](#uc-051)
- [UC-052 — Gestor e Fiscal](#uc-052)
- [UC-053 — Saldo ARP e Caronas](#uc-053)
- [UC-054 — Dashboard CR](#uc-054)
- [UC-055 — Atrasos](#uc-055)
- [UC-056 — Alertas Multi-tier (CR)](#uc-056)
- [UC-057 — Chat com IA](#uc-057)
- [UC-058 — CRUD Generico](#uc-058)

---

## UC-042

## UC-042 — Registrar Resultado de Licitacao (Vitoria / Derrota)

### Requisitos Implementados

**RF-044-13** | **RN-FUP-001** | **RN-FUP-005**

- POST /api/followup/registrar-resultado — persiste resultado com tipo, valor, vencedor e motivos
- GET /api/followup/pendentes — lista editais com proposta enviada aguardando resultado
- GET /api/followup/resultados — lista editais com resultado registrado e badges coloridos
- tool_registrar_resultado em tools.py — processa via LLM
- Frontend FollowupPage.tsx — StatCards (Pendentes/Vitorias/Derrotas/Taxa), DataTable pendentes, Modal de registro condicional

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar FollowupPage — aba Aguardando com StatCards e lista de pendentes

![P01 Acao UC-042](../runtime/screenshots/UC-042/P01_acao.png)

#### P01 — Resposta: Sistema exibe 4 StatCards (Aguardando/Vitorias/Derrotas/Taxa) e DataTable de editais pendentes

![P01 Resposta UC-042](../runtime/screenshots/UC-042/P01_resp.png)

#### P02 — Acao: Clicar no botao [R] Registrar em um edital da lista de pendentes

![P02 Acao UC-042](../runtime/screenshots/UC-042/P02_acao.png)

#### P02 — Resposta: Modal de registro abre com cabecalho do edital e RadioGroup de tipo (Vitoria / Derrota / Cancelado)

![P02 Resposta UC-042](../runtime/screenshots/UC-042/P02_resp.png)

#### P03 — Acao: Selecionar tipo "vitoria", confirmar valor_final e preencher observacoes

![P03 Acao UC-042](../runtime/screenshots/UC-042/P03_acao.png)

#### P03 — Resposta: Apenas campo valor_final visivel (pre-preenchido); campos vencedor/motivo ocultos para vitoria

![P03 Resposta UC-042](../runtime/screenshots/UC-042/P03_resp.png)

#### P04 — Acao: Clicar em "Confirmar" — sistema envia POST /api/followup/registrar-resultado

![P04 Acao UC-042](../runtime/screenshots/UC-042/P04_acao.png)

#### P04 — Resposta: Backend persiste resultado, atualiza status "ganho", Modal fecha, fetchData() recarrega

![P04 Resposta UC-042](../runtime/screenshots/UC-042/P04_resp.png)

#### P05 — Acao: Verificar DataTable de resultados e StatCards atualizados

![P05 Acao UC-042](../runtime/screenshots/UC-042/P05_acao.png)

#### P05 — Resposta: Edital aparece na DataTable de resultados com badge verde "Vitoria"; StatCards atualizam taxa de sucesso

![P05 Resposta UC-042](../runtime/screenshots/UC-042/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13482 | tools.py linha 5088 | FollowupPage.tsx

---

## UC-043

## UC-043 — Configurar Alertas de Vencimento

### Requisitos Implementados

**RF-052-EXT-01** | **RN-ALE-001** | **RN-ALE-002**

- GET /api/alertas-vencimento/regras — lista regras configuradas por tipo de entidade
- GET /api/alertas-vencimento/consolidado — vencimentos consolidados com semaforo de urgencia
- POST /api/alertas-vencimento/regras — cria nova regra de alerta
- tool_configurar_alertas em tools.py (linha 6931) — parametros: edital_numero, tempos_minutos, tipo, canais
- FollowupPage.tsx — aba Alertas com StatCards (total/vermelho/laranja/amarelo/verde), DataTable de vencimentos e config de tiers

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar FollowupPage e clicar na aba "Alertas"

![P01 Acao UC-043](../runtime/screenshots/UC-043/P01_acao.png)

#### P01 — Resposta: Sistema carrega StatCards de resumo (total/vermelho/laranja/amarelo/verde) e tabela de alertas ativos

![P01 Resposta UC-043](../runtime/screenshots/UC-043/P01_resp.png)

#### P02 — Acao: Visualizar DataTable de vencimentos consolidados com badges de urgencia

![P02 Acao UC-043](../runtime/screenshots/UC-043/P02_acao.png)

#### P02 — Resposta: Lista de vencimentos ordenada por dias_restantes com badges (vermelho <=7d, laranja 8-15d, amarelo 16-30d, verde >30d)

![P02 Resposta UC-043](../runtime/screenshots/UC-043/P02_resp.png)

#### P03 — Acao: Configurar novo alerta — selecionar tipo, edital/contrato, limiares e canais

![P03 Acao UC-043](../runtime/screenshots/UC-043/P03_acao.png)

#### P03 — Resposta: Formulario exibe CheckBoxes 30/15/7/1 dia e canais Push/E-mail/WhatsApp para configuracao

![P03 Resposta UC-043](../runtime/screenshots/UC-043/P03_resp.png)

#### P04 — Acao: Clicar em "Salvar Alerta" — backend processa via tool_configurar_alertas

![P04 Acao UC-043](../runtime/screenshots/UC-043/P04_acao.png)

#### P04 — Resposta: Alerta salvo em alerta_editais; tabela de alertas ativos atualiza com novo registro

![P04 Resposta UC-043](../runtime/screenshots/UC-043/P04_resp.png)

#### P05 — Acao: Verificar historico de alertas disparados e opcoes de editar/desativar

![P05 Acao UC-043](../runtime/screenshots/UC-043/P05_acao.png)

#### P05 — Resposta: Tabela de historico exibe Data/Hora, Tipo, Edital, Canal e Status (Enviado/Lido/Erro)

![P05 Resposta UC-043](../runtime/screenshots/UC-043/P05_resp.png)

**✅ APROVADO** — Implementado — tools.py linha 6931 | /api/alertas-vencimento/* | FollowupPage.tsx aba Alertas

---

## UC-044

## UC-044 — Calcular Score Logistico

### Requisitos Implementados

**RF-046** | **RN-LOG-001** | **RN-LOG-006**

- GET /api/validacao/score-logistico/{id} — calcula e retorna score logistico do edital (app.py linha 13535)
- tool_calcular_score_logistico em tools.py (linha 10652) — 4 sub-dimensoes ponderadas
- Score = distancia*0.30 + historico*0.25 + frete*0.25 + prazo*0.20 (formula RN-LOG-006)
- Badge VIAVEL (>=70) / ATENCAO (40-69) / INVIAVEL (<40) por faixa de score
- ValidacaoPage.tsx — card Score Logistico com barra, tabela de dimensoes e recomendacao

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar ValidacaoPage de edital salvo e visualizar cards de score 6D

![P01 Acao UC-044](../runtime/screenshots/UC-044/P01_acao.png)

#### P01 — Resposta: Cards de score visiveis incluindo card "Logistico" como sub-score da aderencia

![P01 Resposta UC-044](../runtime/screenshots/UC-044/P01_resp.png)

#### P02 — Acao: Clicar no card Score Logistico para expandir detalhes

![P02 Acao UC-044](../runtime/screenshots/UC-044/P02_acao.png)

#### P02 — Resposta: Sistema chama tool_calcular_score_logistico; barra de score 0-100 e badge de recomendacao exibidos

![P02 Resposta UC-044](../runtime/screenshots/UC-044/P02_resp.png)

#### P03 — Acao: Verificar tabela de dimensoes com pesos e notas individuais

![P03 Acao UC-044](../runtime/screenshots/UC-044/P03_acao.png)

#### P03 — Resposta: Tabela exibe 4 dimensoes — Distancia UF (30%), Historico Regiao (25%), Custo Frete (25%), Prazo (20%) com nota 0-100 cada

![P03 Resposta UC-044](../runtime/screenshots/UC-044/P03_resp.png)

#### P04 — Acao: Clicar em "Recalcular" para atualizar score com dados mais recentes

![P04 Acao UC-044](../runtime/screenshots/UC-044/P04_acao.png)

#### P04 — Resposta: Calculo refeito e score atualizado; secao Detalhes mostra Origem, Destino, Distancia km, Frete estimado e texto de recomendacao

![P04 Resposta UC-044](../runtime/screenshots/UC-044/P04_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13535 | tools.py linha 10652 | ValidacaoPage.tsx

---

## UC-045

## UC-045 — Buscar Atas no PNCP

### Requisitos Implementados

**RF-019** | **RN-ATA-BUSCA-001** | **RN-ATA-BUSCA-007**

- GET /api/atas/buscar?termo={termo}&uf={uf} — busca atas no PNCP (app.py linha 13551)
- tool_buscar_atas_pncp em tools.py (linha 5593) — retorna titulo, orgao, CNPJ, UF, URL
- POST /api/atas/salvar — salva ata selecionada em atas_consultadas
- Resposta flexivel: data.atas || data.resultados || Array.isArray(data) (3 formatos tratados)
- AtasPage.tsx — aba Buscar com SearchInput, SelectInput UF, DateRange, botao Buscar com Loader2, DataTable e acoes Salvar/Extrair/Ver PNCP

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar AtasPage — aba Buscar com campos de termo e filtros

![P01 Acao UC-045](../runtime/screenshots/UC-045/P01_acao.png)

#### P01 — Resposta: Tela exibe SearchInput (min 3 chars), SelectInput UF, DateRange e SelectInput Modalidade com botao Buscar

![P01 Resposta UC-045](../runtime/screenshots/UC-045/P01_resp.png)

#### P02 — Acao: Digitar termo "seringa descartavel" e selecionar UF, clicar em Buscar

![P02 Acao UC-045](../runtime/screenshots/UC-045/P02_acao.png)

#### P02 — Resposta: Loader2 exibido durante busca; backend consulta PNCP via tool_buscar_atas_pncp

![P02 Resposta UC-045](../runtime/screenshots/UC-045/P02_resp.png)

#### P03 — Acao: Visualizar DataTable com resultados (Titulo, Orgao, UF, Publicacao, Vigencia)

![P03 Acao UC-045](../runtime/screenshots/UC-045/P03_acao.png)

#### P03 — Resposta: DataTable lista atas com badge de vigencia (verde=vigente, vermelho=expirada) e acoes por linha

![P03 Resposta UC-045](../runtime/screenshots/UC-045/P03_resp.png)

#### P04 — Acao: Clicar em "Salvar" em uma ata — POST /api/atas/salvar persiste localmente

![P04 Acao UC-045](../runtime/screenshots/UC-045/P04_acao.png)

#### P04 — Resposta: Ata salva em atas_consultadas; botao muda para "Ja Salva" (desabilitado)

![P04 Resposta UC-045](../runtime/screenshots/UC-045/P04_resp.png)

#### P05 — Acao: Clicar em "Extrair Dados" — URL pre-preenche campo na aba Extrair

![P05 Acao UC-045](../runtime/screenshots/UC-045/P05_acao.png)

#### P05 — Resposta: Sistema navega para aba Extrair com URL da ata ja preenchida no campo extractUrl

![P05 Resposta UC-045](../runtime/screenshots/UC-045/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13551 | tools.py linha 5593 | AtasPage.tsx aba Buscar

---

## UC-046

## UC-046 — Extrair Dados de Ata PDF via IA

### Requisitos Implementados

**RF-010** | **RF-036** | **RN-EXT-001** | **RN-EXT-004**

- POST /api/atas/extrair-pdf — recebe URL ou texto, retorna itens extraidos (app.py linha 13568)
- tool_extrair_ata_pdf em tools.py (linha 5393) — processa via DeepSeek LLM
- tool_baixar_ata_pncp — funcional, extrai texto do PDF para processamento
- Resposta flexivel: data.itens || data.items (2 formatos tratados)
- AtasPage.tsx — aba Extrair com FileUpload drag-drop, TextInput URL, ProgressBar etapas, DataTable editavel de itens, acoes em lote

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar aba Extrair com campo de URL pre-preenchida (vindo de UC-045)

![P01 Acao UC-046](../runtime/screenshots/UC-046/P01_acao.png)

#### P01 — Resposta: Card "Fonte do Documento" exibe URL pre-preenchida; opcao de upload drag-drop disponivel como alternativa

![P01 Resposta UC-046](../runtime/screenshots/UC-046/P01_resp.png)

#### P02 — Acao: Clicar em "Extrair Dados" — inicia processamento IA

![P02 Acao UC-046](../runtime/screenshots/UC-046/P02_acao.png)

#### P02 — Resposta: ProgressBar exibe etapas em sequencia: Baixando (0-30%) → Extraindo texto (30-50%) → Analisando via IA (50-90%)

![P02 Resposta UC-046](../runtime/screenshots/UC-046/P02_resp.png)

#### P03 — Acao: Aguardar conclusao do processamento (etapa 90-100%)

![P03 Acao UC-046](../runtime/screenshots/UC-046/P03_acao.png)

![P03 Loading UC-046](../runtime/screenshots/UC-046/P03_loading.png)

*Loading: processamento IA em andamento*

#### P03 — Resposta: Processamento concluido (100%); DataTable "Dados Extraidos" renderizada com itens

![P03 Resposta UC-046](../runtime/screenshots/UC-046/P03_resp.png)

#### P04 — Acao: Revisar DataTable editavel com itens extraidos (Item, Descricao, Vencedor, Preco, Qtd)

![P04 Acao UC-046](../runtime/screenshots/UC-046/P04_acao.png)

#### P04 — Resposta: Celulas editaveis para correcao manual; tabela de Concorrentes Identificados agrupa empresas vencedoras

![P04 Resposta UC-046](../runtime/screenshots/UC-046/P04_resp.png)

#### P05 — Acao: Selecionar itens e clicar em "Salvar em Preco Historico"

![P05 Acao UC-046](../runtime/screenshots/UC-046/P05_acao.png)

#### P05 — Resposta: Itens selecionados inseridos em tabela preco_historico; botao "Registrar Concorrentes" alimenta tabela concorrentes

![P05 Resposta UC-046](../runtime/screenshots/UC-046/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13568 | tools.py linha 5393 | AtasPage.tsx aba Extrair

---

## UC-047

## UC-047 — Dashboard de Atas Consultadas

### Requisitos Implementados

**RF-047** | **RF-048** | **RN-DASH-ATA-001** | **RN-DASH-ATA-002**

- GET /api/atas/minhas — retorna {atas: AtaSalva[], stats: {total, vigentes, vencidas}} (app.py linha 13595)
- Calculo de dias: Math.ceil((data_vigencia_fim - Date.now()) / 86400000)
- Badge vigencia: verde "X dias restantes" | vermelho "ha X dias" (expirada)
- Stats Row com 6 cards: Total Atas / Vigentes% / Expiradas% / UFs Cobertas / Orgaos / Ultima Consulta
- AtasPage.tsx — aba Minhas Atas com filtros e acoes Ver Detalhes/Re-extrair/Excluir/Ver PNCP

### Sequencia de Eventos Validada

#### P01 — Acao: Clicar na aba "Minhas Atas" — dispara fetchMinhasAtas() via useEffect

![P01 Acao UC-047](../runtime/screenshots/UC-047/P01_acao.png)

#### P01 — Resposta: StatCards carregam com Total Atas, Vigentes (%), Expiradas (%), UFs Cobertas, Orgaos e Ultima Consulta

![P01 Resposta UC-047](../runtime/screenshots/UC-047/P01_resp.png)

#### P02 — Acao: Visualizar DataTable com atas salvas e badges de vigencia calculados em tempo real

![P02 Acao UC-047](../runtime/screenshots/UC-047/P02_acao.png)

#### P02 — Resposta: Atas listadas com Titulo, Orgao, UF, Data Publicacao e badge: verde (vigente) ou vermelho (expirada)

![P02 Resposta UC-047](../runtime/screenshots/UC-047/P02_resp.png)

#### P03 — Acao: Aplicar filtros por SearchInput, UF, Periodo e Status (Vigentes/Expiradas)

![P03 Acao UC-047](../runtime/screenshots/UC-047/P03_acao.png)

#### P03 — Resposta: DataTable atualiza em tempo real; filtros persistem durante a sessao

![P03 Resposta UC-047](../runtime/screenshots/UC-047/P03_resp.png)

#### P04 — Acao: Clicar em "Ver Detalhes" em uma ata — expande card com itens e precos

![P04 Acao UC-047](../runtime/screenshots/UC-047/P04_acao.png)

#### P04 — Resposta: Card expandido mostra itens extraidos, concorrentes e historico de precos da ata

![P04 Resposta UC-047](../runtime/screenshots/UC-047/P04_resp.png)

#### P05 — Acao: Clicar em "Re-extrair" para atualizar dados via LLM

![P05 Acao UC-047](../runtime/screenshots/UC-047/P05_acao.png)

#### P05 — Resposta: tool_extrair_ata_pdf acionada; dados atualizados; stats recalculados

![P05 Resposta UC-047](../runtime/screenshots/UC-047/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13595 | AtasPage.tsx aba Minhas Atas

---

## UC-048

## UC-048 — Cadastrar Contrato

### Requisitos Implementados

**RF-046** | **RN-CON-CRIA-001** | **RN-CON-CRIA-007**

- CRUD /api/crud/contratos — list, create, update, delete via crud_routes.py
- crudCreate("contratos") com status="vigente" automatico
- Status inicial: "vigente" | outros: encerrado, rescindido, suspenso
- StatCard "A Vencer": contratos com data_fim dentro de 30 dias
- ProducaoPage.tsx — aba Contratos com StatCards, modal Novo Contrato, DataTable com badges coloridos e botao Selecionar

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar ProducaoPage — aba Contratos com StatCards e DataTable

![P01 Acao UC-048](../runtime/screenshots/UC-048/P01_acao.png)

#### P01 — Resposta: Stats Row exibe Contratos Ativos, Valor Total, Em Dia (%), Atrasados (%) e lista de contratos existentes

![P01 Resposta UC-048](../runtime/screenshots/UC-048/P01_resp.png)

#### P02 — Acao: Clicar em "+ Novo Contrato" — Modal de cadastro abre

![P02 Acao UC-048](../runtime/screenshots/UC-048/P02_acao.png)

#### P02 — Resposta: Modal com campos: Numero, Edital de Origem (auto-fill), Orgao, Objeto, Valor Total, datas, Upload PDF

![P02 Resposta UC-048](../runtime/screenshots/UC-048/P02_resp.png)

#### P03 — Acao: Preencher dados do contrato e clicar em "Salvar"

![P03 Acao UC-048](../runtime/screenshots/UC-048/P03_acao.png)

#### P03 — Resposta: crudCreate("contratos") persiste com status="vigente"; Modal fecha; DataTable atualiza com novo contrato

![P03 Resposta UC-048](../runtime/screenshots/UC-048/P03_resp.png)

#### P04 — Acao: Verificar badge de status verde "vigente" e StatCards atualizados

![P04 Acao UC-048](../runtime/screenshots/UC-048/P04_acao.png)

#### P04 — Resposta: Badge verde exibido; status automatico: ok (>15d), atencao (7-15d), atrasado (<0d)

![P04 Resposta UC-048](../runtime/screenshots/UC-048/P04_resp.png)

#### P05 — Acao: Clicar em "Selecionar" para carregar entregas, cronograma, aditivos e designacoes

![P05 Acao UC-048](../runtime/screenshots/UC-048/P05_acao.png)

#### P05 — Resposta: selectContrato() carrega dados em paralelo; abas Entregas/Cronograma/Aditivos/Gestor tornam-se acessiveis

![P05 Resposta UC-048](../runtime/screenshots/UC-048/P05_resp.png)

**✅ APROVADO** — Implementado — CRUD /api/crud/contratos | ProducaoPage.tsx (464 linhas)

---

## UC-049

## UC-049 — Registrar Entrega com NF

### Requisitos Implementados

**RF-046** | **RF-051** | **RN-ENT-001** | **RN-ENT-003**

- crudCreate("contrato-entregas") — payload: {contrato_id, descricao, quantidade, valor_unitario, valor_total, status: "pendente"}
- valor_total = quantidade * valor_unitario (calculo automatico no frontend)
- Campos nota_fiscal e numero_empenho para rastreabilidade fiscal
- Status inicial: "pendente" | entregue | atrasado (badge colorido por estado)
- ProducaoPage.tsx — aba Entregas com modal Nova Entrega, sub-linha NF/Empenho na DataTable

### Sequencia de Eventos Validada

#### P01 — Acao: Com contrato selecionado, acessar aba Entregas e visualizar DataTable

![P01 Acao UC-049](../runtime/screenshots/UC-049/P01_acao.png)

#### P01 — Resposta: DataTable exibe entregas existentes com Descricao, Qtd, Valor Un., Data Prevista, Status e sub-linha NF/Empenho

![P01 Resposta UC-049](../runtime/screenshots/UC-049/P01_resp.png)

#### P02 — Acao: Clicar em "+ Nova Entrega" — Modal de registro abre

![P02 Acao UC-049](../runtime/screenshots/UC-049/P02_acao.png)

#### P02 — Resposta: Modal com campos Descricao, Quantidade, Valor Unitario, [Valor Total calculado], Data Prevista, Data Realizada, Numero NF, Numero Empenho e Upload NF

![P02 Resposta UC-049](../runtime/screenshots/UC-049/P02_resp.png)

#### P03 — Acao: Preencher dados incluindo NF e Empenho — valor_total calculado automaticamente

![P03 Acao UC-049](../runtime/screenshots/UC-049/P03_acao.png)

#### P03 — Resposta: Campo Valor Total atualiza em tempo real (qtd x valor unitario); campos NF e Empenho preenchidos

![P03 Resposta UC-049](../runtime/screenshots/UC-049/P03_resp.png)

#### P04 — Acao: Clicar em "Salvar Entrega" — POST persiste com status "pendente"

![P04 Acao UC-049](../runtime/screenshots/UC-049/P04_acao.png)

#### P04 — Resposta: Entrega criada com badge amarelo "pendente"; DataTable atualiza; Resumo Entregas (concluidas/total) recalculado

![P04 Resposta UC-049](../runtime/screenshots/UC-049/P04_resp.png)

#### P05 — Acao: Verificar entrega atrasada (data_prevista no passado e status pendente)

![P05 Acao UC-049](../runtime/screenshots/UC-049/P05_acao.png)

#### P05 — Resposta: Badge vermelho "atrasado" exibido; status do contrato recalculado automaticamente

![P05 Resposta UC-049](../runtime/screenshots/UC-049/P05_resp.png)

**✅ APROVADO** — Implementado — CRUD /api/crud/contrato-entregas | ProducaoPage.tsx modal Nova Entrega

---

## UC-050

## UC-050 — Acompanhar Cronograma de Entregas

### Requisitos Implementados

**RF-046** | **RN-CRON-001** | **RN-CRON-003**

- GET /api/contratos/{id}/cronograma — retorna CronogramaData: stats, semanas, atrasados, proximos_7d (app.py linha 13666)
- Agrupamento semanal: chave "2026-W13" com array de entregas daquela semana
- Atrasados: EntregaAPI + dias_atraso | Proximos 7d: EntregaAPI + dias_restantes
- Carregado automaticamente via selectContrato() junto com entregas/aditivos/designacoes
- ProducaoPage.tsx — aba Cronograma com Timeline Semanal, secao ATRASADOS destaque e tabela Proximos 7 dias

### Sequencia de Eventos Validada

#### P01 — Acao: Selecionar contrato e acessar aba Cronograma

![P01 Acao UC-050](../runtime/screenshots/UC-050/P01_acao.png)

#### P01 — Resposta: Stats Row exibe Pendentes, Entregues (%), Atrasados (%), Valor Total Pendente; Timeline do mes atual renderizada

![P01 Resposta UC-050](../runtime/screenshots/UC-050/P01_resp.png)

#### P02 — Acao: Visualizar secao ATRASADOS com entregas vencidas e dias_atraso

![P02 Acao UC-050](../runtime/screenshots/UC-050/P02_acao.png)

#### P02 — Resposta: Secao "ATRASADOS" sempre visivel com destaque vermelho e badge CRITICO; entregas ordenadas por dias_atraso decrescente

![P02 Resposta UC-050](../runtime/screenshots/UC-050/P02_resp.png)

#### P03 — Acao: Verificar tabela "Proximos Vencimentos (7 dias)" com dias restantes

![P03 Acao UC-050](../runtime/screenshots/UC-050/P03_acao.png)

#### P03 — Resposta: DataTable exibe Entrega, Contrato, Orgao, Prazo e Dias restantes para entregas iminentes

![P03 Resposta UC-050](../runtime/screenshots/UC-050/P03_resp.png)

#### P04 — Acao: Filtrar cronograma por mes e por contrato via SelectInputs

![P04 Acao UC-050](../runtime/screenshots/UC-050/P04_acao.png)

#### P04 — Resposta: Timeline atualiza com agrupamento semanal do mes filtrado; badges coloridos por status (verde/amarelo/vermelho)

![P04 Resposta UC-050](../runtime/screenshots/UC-050/P04_resp.png)

#### P05 — Acao: Clicar em "Configurar Alertas de Entrega" — integra com UC-043

![P05 Acao UC-050](../runtime/screenshots/UC-050/P05_acao.png)

#### P05 — Resposta: Abre configuracao de alertas com tipo="entrega" pre-selecionado (FollowupPage UC-043)

![P05 Resposta UC-050](../runtime/screenshots/UC-050/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13666 | ProducaoPage.tsx aba Cronograma

---

## UC-051

## UC-051 — Gestao de Aditivos Contratuais

### Requisitos Implementados

**RF-046-EXT-01** | **RN-CON-001** | **RN-ADI-002**

- GET/POST /api/contratos/{id}/aditivos — retorna {aditivos: [], resumo: AditivoResumo} (app.py linha 13733)
- AditivoResumo: valor_original, total_acrescimos, total_supressoes, limite_25_pct (x0.25), pct_consumido
- ProgressBar colorida: verde (<50%), amarelo (50-80%), vermelho (>=80%) conforme pct_consumido
- Fundamentacao legal por Art. 124-I/II/III/IV/V, 125, 126 (selectavel no modal)
- Tipos de aditivo: Valor acrescimo / Valor supressao / Prazo / Escopo

### Sequencia de Eventos Validada

#### P01 — Acao: Com contrato selecionado, acessar aba Aditivos — Card de resumo exibido

![P01 Acao UC-051](../runtime/screenshots/UC-051/P01_acao.png)

#### P01 — Resposta: Card "Limites Legais de Aditivo" exibe Valor Original, Limite 25%, Consumido R$ e ProgressBar de acrescimo/supressao

![P01 Resposta UC-051](../runtime/screenshots/UC-051/P01_resp.png)

#### P02 — Acao: Clicar em "+ Novo Aditivo" — Modal abre com tipo, valor, justificativa e fundamentacao

![P02 Acao UC-051](../runtime/screenshots/UC-051/P02_acao.png)

#### P02 — Resposta: Modal exibe: Tipo (acrescimo/supressao/prazo/escopo), Justificativa, Valor ou Dias (condicional), Data, Fundamentacao Legal e Upload PDF

![P02 Resposta UC-051](../runtime/screenshots/UC-051/P02_resp.png)

#### P03 — Acao: Preencher aditivo de acrescimo com fundamentacao Art. 124-I e clicar em "Registrar"

![P03 Acao UC-051](../runtime/screenshots/UC-051/P03_acao.png)

#### P03 — Resposta: Backend valida limite 25% antes de salvar; aditivo persistido; resumo recalculado; barra de progresso atualizada

![P03 Resposta UC-051](../runtime/screenshots/UC-051/P03_resp.png)

#### P04 — Acao: Verificar DataTable de aditivos com tipo, valor e fundamentacao

![P04 Acao UC-051](../runtime/screenshots/UC-051/P04_acao.png)

#### P04 — Resposta: Tabela lista #, Tipo, Justificativa, Valor Original, Valor Aditivo, Data e Fundamento de cada aditivo registrado

![P04 Resposta UC-051](../runtime/screenshots/UC-051/P04_resp.png)

#### P05 — Acao: Verificar alerta visual quando pct_consumido >= 80% (barra vermelha + badge)

![P05 Acao UC-051](../runtime/screenshots/UC-051/P05_acao.png)

#### P05 — Resposta: Badge vermelho "Proximo do Limite" exibido; ProgressBar muda para vermelho; sistema alerta de risco de estouro

![P05 Resposta UC-051](../runtime/screenshots/UC-051/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13733 | ProducaoPage.tsx aba Aditivos

---

## UC-052

## UC-052 — Designar Gestor e Fiscal (Art. 117)

### Requisitos Implementados

**RF-046-EXT-02** | **RN-CON-003** | **RN-CON-004**

- GET/POST /api/contratos/{id}/designacoes — com validacao §5o Art. 117 (app.py linha 13824)
- Validacao backend: mesma pessoa NAO pode ser gestor e fiscal simultaneamente
- Tipos: Gestor / Fiscal Tecnico / Fiscal Administrativo (Art. 117, §1o)
- Registro de Atividades: Atesto / Medicao / Parecer / Fiscalizacao com historico
- ProducaoPage.tsx — aba Gestor/Fiscal com cards individuais por funcao e tabela de atividades

### Sequencia de Eventos Validada

#### P01 — Acao: Com contrato selecionado, acessar aba Gestor/Fiscal

![P01 Acao UC-052](../runtime/screenshots/UC-052/P01_acao.png)

#### P01 — Resposta: Cards individuais exibidos para Gestor do Contrato (Art. 117, caput), Fiscal Tecnico e Fiscal Administrativo (§1o)

![P01 Resposta UC-052](../runtime/screenshots/UC-052/P01_resp.png)

#### P02 — Acao: Clicar em "+ Nova Designacao" — Modal abre com funcao, nome, cargo e portaria

![P02 Acao UC-052](../runtime/screenshots/UC-052/P02_acao.png)

#### P02 — Resposta: Modal exibe SelectInput de Funcao (Gestor/Fiscal Tecnico/Fiscal Administrativo), Nome, Cargo, Portaria, Periodo e Upload Portaria PDF

![P02 Resposta UC-052](../runtime/screenshots/UC-052/P02_resp.png)

#### P03 — Acao: Preencher designacao de Gestor e Fiscal com nomes diferentes e clicar em salvar

![P03 Acao UC-052](../runtime/screenshots/UC-052/P03_acao.png)

#### P03 — Resposta: Designacoes persistidas; cards atualizados com Nome, Cargo, Portaria e Periodo de vigencia

![P03 Resposta UC-052](../runtime/screenshots/UC-052/P03_resp.png)

#### P04 — Acao: Tentar designar mesma pessoa como gestor e fiscal simultaneamente

![P04 Acao UC-052](../runtime/screenshots/UC-052/P04_acao.png)

#### P04 — Resposta: Backend rejeita com erro "Mesma pessoa nao pode ser gestor e fiscal" (§5o Art. 117)

![P04 Resposta UC-052](../runtime/screenshots/UC-052/P04_resp.png)

#### P05 — Acao: Registrar atividade de fiscalizacao — tabela Registro de Atividades atualizada

![P05 Acao UC-052](../runtime/screenshots/UC-052/P05_acao.png)

#### P05 — Resposta: Atividade registrada com Data, Tipo (Atesto/Medicao/Parecer/Fiscalizacao), Responsavel e Descricao; historico mantido para auditoria

![P05 Resposta UC-052](../runtime/screenshots/UC-052/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linha 13824 | validacao §5o Art. 117 | ProducaoPage.tsx aba Gestor/Fiscal

---

## UC-053

## UC-053 — Controlar Saldo ARP e Caronas

### Requisitos Implementados

**RF-046-EXT-03** | **RN-ATA-001** | **RN-ATA-002** | **RN-ARP-001**

- GET /api/atas/{id}/saldos — saldos por item da ata (app.py linha 13924)
- GET/POST /api/atas/{id}/saldos/{id}/caronas — com validacao Art. 82-86 (app.py linha 13956)
- saldo_disponivel = quantidade_registrada - consumido_participante - consumido_carona
- Limite individual: 50% da quantidade_registrada por orgao carona
- Limite global: 2x (200%) dos itens registrados para todos os orgaos

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar aba Saldo ARP e selecionar uma ARP no SelectInput

![P01 Acao UC-053](../runtime/screenshots/UC-053/P01_acao.png)

#### P01 — Resposta: Card de Selecao exibe vigencia + badge + ProgressBar temporal; DataTable "Saldo por Item" carregada

![P01 Resposta UC-053](../runtime/screenshots/UC-053/P01_resp.png)

#### P02 — Acao: Visualizar DataTable de saldos: Item, Registrado, Partic., Carona, Saldo, %

![P02 Acao UC-053](../runtime/screenshots/UC-053/P02_acao.png)

#### P02 — Resposta: ProgressBars por linha indicam consumo por item; badge "Saldo Critico" quando saldo < 10% do registrado

![P02 Resposta UC-053](../runtime/screenshots/UC-053/P02_resp.png)

#### P03 — Acao: Visualizar Card "Limites de Carona (Art. 86)" com ProgressBars individual e global

![P03 Acao UC-053](../runtime/screenshots/UC-053/P03_acao.png)

#### P03 — Resposta: ProgressBar Individual mostra consumo por orgao vs limite 50%; ProgressBar Global mostra consumo total vs limite 2x (200%)

![P03 Resposta UC-053](../runtime/screenshots/UC-053/P03_resp.png)

#### P04 — Acao: Clicar em "+ Nova Solicitacao" e preencher dados da carona

![P04 Acao UC-053](../runtime/screenshots/UC-053/P04_acao.png)

#### P04 — Resposta: Modal exibe: Orgao Solicitante, Item (SelectInput com saldo), Quantidade, Display Saldo Disponivel e Display Limite Carona

![P04 Resposta UC-053](../runtime/screenshots/UC-053/P04_resp.png)

#### P05 — Acao: Tentar carona que excede limite 50% — validacao server-side aplicada

![P05 Acao UC-053](../runtime/screenshots/UC-053/P05_acao.png)

#### P05 — Resposta: Backend rejeita com { error: "Excede limite de 50% por orgao" }; alert exibe mensagem; carona nao registrada

![P05 Resposta UC-053](../runtime/screenshots/UC-053/P05_resp.png)

**✅ APROVADO** — Implementado — app.py linhas 13924 e 13956 | validacao Art. 82-86 | AtasPage.tsx aba Saldo ARP

---

## UC-054

## UC-054 — Dashboard Contratado x Realizado

### Requisitos Implementados

**RF-051** | **RF-052** | **RN-CR-001** | **RN-CR-004**

- GET /api/dashboard/contratado-realizado?periodo={}&orgao={} — DashboardResponse completo
- Variacao: abs(contratado - realizado) / contratado * 100
- Semaforo: <=5% verde, 5-15% amarelo, >15% vermelho (status-badge-success/warning/danger)
- Saude do portfolio: "saudavel" | "atencao" | "critico" com badge Shield
- ContratadoRealizadoPage.tsx (807 linhas) — loadDashboard() via useCallback/useEffect, filtros periodo/status

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar ContratadoRealizadoPage — loadDashboard() dispara automaticamente via useEffect

![P01 Acao UC-054](../runtime/screenshots/UC-054/P01_acao.png)

#### P01 — Resposta: Stats Row exibe Total Contratado, Total Realizado, Variacao % (badge economia/estouro) e Contratos Ativos

![P01 Resposta UC-054](../runtime/screenshots/UC-054/P01_resp.png)

#### P02 — Acao: Visualizar DataTable comparativa com semaforo de variacao por contrato

![P02 Acao UC-054](../runtime/screenshots/UC-054/P02_acao.png)

#### P02 — Resposta: Tabela exibe Contrato, Orgao, Produto, Contratado, Realizado, Variacao% com badge colorido e Linha de Totais na base

![P02 Resposta UC-054](../runtime/screenshots/UC-054/P02_resp.png)

#### P03 — Acao: Verificar Indicadores de Desvio — Conformes, Economias e Estouros

![P03 Acao UC-054](../runtime/screenshots/UC-054/P03_acao.png)

#### P03 — Resposta: Card exibe qtd/% de conformes, economias (<0%) e estouros (>0%); Maior Economia e Maior Estouro destacados

![P03 Resposta UC-054](../runtime/screenshots/UC-054/P03_resp.png)

#### P04 — Acao: Alterar filtro de periodo para "12m" — dashboard recalcula via useEffect

![P04 Acao UC-054](../runtime/screenshots/UC-054/P04_acao.png)

#### P04 — Resposta: loadDashboard() recarrega com novo periodo; StatCards e tabela atualizam com dados do ultimo ano

![P04 Resposta UC-054](../runtime/screenshots/UC-054/P04_resp.png)

#### P05 — Acao: Verificar badge de Saude do Portfolio (Shield) com estado geral

![P05 Acao UC-054](../runtime/screenshots/UC-054/P05_acao.png)

#### P05 — Resposta: Badge Shield exibe saudavel (<5% var media), atencao (5-10%) ou critico (>10%) conforme estado geral do portfolio

![P05 Resposta UC-054](../runtime/screenshots/UC-054/P05_resp.png)

**✅ APROVADO** — Implementado — /api/dashboard/contratado-realizado | ContratadoRealizadoPage.tsx (807 linhas)

---

## UC-055

## UC-055 — Monitorar Pedidos em Atraso

### Requisitos Implementados

**RF-052** | **RN-CR-002** | **RN-ATR-001** | **RN-ATR-003**

- Atrasos retornados no DashboardResponse.atrasos[] via GET /api/dashboard/contratado-realizado
- GET /api/contratado-realizado/atrasos — endpoint dedicado
- Severidade: HIGH (>30d), MEDIUM (15-30d), LOW (<15d)
- Derivados: totalAtrasados, atrasosHigh/Medium/Low via filter, valorEmRisco via reduce
- ContratadoRealizadoPage.tsx — aba Atrasos com secoes agrupadas por gravidade, acoes Contatar e Config. Alerta

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar aba Atrasos na ContratadoRealizadoPage

![P01 Acao UC-055](../runtime/screenshots/UC-055/P01_acao.png)

#### P01 — Resposta: Stats Row exibe Total Atrasados, Gravidade Alta (>15d) e Valor em Risco (R$)

![P01 Resposta UC-055](../runtime/screenshots/UC-055/P01_resp.png)

#### P02 — Acao: Visualizar secao "Gravidade ALTA" com entregas criticas e badge CRITICO vermelho

![P02 Acao UC-055](../runtime/screenshots/UC-055/P02_acao.png)

#### P02 — Resposta: Entregas com >15 dias de atraso listadas com badge vermelho "CRITICO"; ordenadas por dias decrescente

![P02 Resposta UC-055](../runtime/screenshots/UC-055/P02_resp.png)

#### P03 — Acao: Verificar secoes Gravidade MEDIA e BAIXA com badges amarelo e laranja

![P03 Acao UC-055](../runtime/screenshots/UC-055/P03_acao.png)

#### P03 — Resposta: Secao Media (7-15d) com badge ATENCAO amarelo; Secao Baixa (<7d) com badge laranja; acoes [C] Contatar e [A] Config. Alerta por linha

![P03 Resposta UC-055](../runtime/screenshots/UC-055/P03_resp.png)

#### P04 — Acao: Configurar alertas de atraso — CheckBoxes e canal de notificacao

![P04 Acao UC-055](../runtime/screenshots/UC-055/P04_acao.png)

#### P04 — Resposta: Card de configuracao exibe CheckBoxes: Alerta ao atrasar, Alerta diario, Escalar para gestor apos 15 dias; SelectInput Canal (Push/Email)

![P04 Resposta UC-055](../runtime/screenshots/UC-055/P04_resp.png)

#### P05 — Acao: Clicar em "Salvar Configuracao" — configuracao de alertas persistida

![P05 Acao UC-055](../runtime/screenshots/UC-055/P05_acao.png)

#### P05 — Resposta: Configuracao salva; scheduler passa a monitorar e escalar automaticamente conforme regras definidas

![P05 Resposta UC-055](../runtime/screenshots/UC-055/P05_resp.png)

**✅ APROVADO** — Implementado — DashboardResponse.atrasos[] | ContratadoRealizadoPage.tsx aba Atrasos

---

## UC-056

## UC-056 — Configurar Alertas Multi-tier (CR)

### Requisitos Implementados

**RF-052-EXT-01** | **RN-ALE-002** | **RN-ALE-CONS-001** | **RN-ALE-CONS-005**

- GET /api/alertas-vencimento/consolidado — AlertasResponse: vencimentos[] e resumo {total/vermelho/laranja/amarelo/verde}
- VencimentoRow: tipo_entidade (contrato/arp/entrega), nome, data_vencimento, dias_restantes, valor, urgencia
- loadAlertas() via useCallback/useEffect no mount da ContratadoRealizadoPage
- Mesmos dados compartilhados com FollowupPage UC-043
- Escalacao progressiva: 30d=Sistema, 15d=E-mail, 7d=E-mail+WhatsApp, 1d=Push+Telefone

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar aba Vencimentos na ContratadoRealizadoPage

![P01 Acao UC-056](../runtime/screenshots/UC-056/P01_acao.png)

#### P01 — Resposta: Stats Row exibe Venc. 7 dias (vermelho urgente), Venc. 15 dias (laranja alerta) e Venc. 30 dias (amarelo info)

![P01 Resposta UC-056](../runtime/screenshots/UC-056/P01_resp.png)

#### P02 — Acao: Visualizar vencimentos agrupados por tipo — Contratos, ARPs, Garantias, Entregas

![P02 Acao UC-056](../runtime/screenshots/UC-056/P02_acao.png)

#### P02 — Resposta: Cada secao lista vencimentos ordenados por dias_restantes com badge de urgencia (vermelho/laranja/amarelo/verde)

![P02 Resposta UC-056](../runtime/screenshots/UC-056/P02_resp.png)

#### P03 — Acao: Visualizar tabela de Configuracao Multi-tier de regras por tipo

![P03 Acao UC-056](../runtime/screenshots/UC-056/P03_acao.png)

#### P03 — Resposta: Tabela exibe Tipo x Limiar (30d/15d/7d/1d) com canal por celula (Sistema/E-mail/WhatsApp/Push)

![P03 Resposta UC-056](../runtime/screenshots/UC-056/P03_resp.png)

#### P04 — Acao: Abrir Modal "Configurar Regras por Tipo" e definir escalacao progressiva

![P04 Acao UC-056](../runtime/screenshots/UC-056/P04_acao.png)

#### P04 — Resposta: Modal com SelectInput Tipo + canais por limiar (30d/15d/7d/1d) + CheckBox de escalacao automatica com campo e-mail gerencia

![P04 Resposta UC-056](../runtime/screenshots/UC-056/P04_resp.png)

#### P05 — Acao: Salvar regra multi-tier — scheduler passa a monitorar

![P05 Acao UC-056](../runtime/screenshots/UC-056/P05_acao.png)

#### P05 — Resposta: Regras persistidas; tabela de configuracao atualiza; scheduler monitora e dispara nos limiares configurados

![P05 Resposta UC-056](../runtime/screenshots/UC-056/P05_resp.png)

**✅ APROVADO** — Implementado — /api/alertas-vencimento/consolidado | ContratadoRealizadoPage.tsx aba Vencimentos

---

## UC-057

## UC-057 — Chat com IA (Sessoes e Ferramentas)

### Requisitos Implementados

**RF-054** | **RN-CHAT-001** | **RN-CHAT-003** | **RN-CHAT-004**

- POST /api/chat/send — envia mensagem do usuario e retorna resposta da IA via DeepSeek
- GET /api/chat/sessions — lista sessoes de chat do usuario
- GET /api/chat/sessions/{id}/messages — historico de mensagens da sessao
- TOOLS_MAP com 76 tools registradas em tools.py acessiveis via linguagem natural
- FloatingChat.tsx + ChatArea.tsx + ChatInput.tsx — balao flutuante acessivel em todas as paginas

### Sequencia de Eventos Validada

#### P01 — Acao: Clicar no balao flutuante do FloatingChat em qualquer pagina

![P01 Acao UC-057](../runtime/screenshots/UC-057/P01_acao.png)

#### P01 — Resposta: Interface de chat abre mostrando sessao ativa com historico de mensagens e lista de sessoes na sidebar

![P01 Resposta UC-057](../runtime/screenshots/UC-057/P01_resp.png)

#### P02 — Acao: Digitar mensagem em linguagem natural (ex: "busque editais de seringa descartavel")

![P02 Acao UC-057](../runtime/screenshots/UC-057/P02_acao.png)

#### P02 — Resposta: ChatInput com botao Enviar e botao Upload de arquivo; mensagem exibida na ChatArea

![P02 Resposta UC-057](../runtime/screenshots/UC-057/P02_resp.png)

#### P03 — Acao: Aguardar processamento — DeepSeek classifica intencao e seleciona tool

![P03 Acao UC-057](../runtime/screenshots/UC-057/P03_acao.png)

![P03 Loading UC-057](../runtime/screenshots/UC-057/P03_loading.png)

*Loading: IA processando intencao e executando tool*

#### P03 — Resposta: Spinner de loading durante processamento; POST /api/chat/send retorna resposta formatada em markdown

![P03 Resposta UC-057](../runtime/screenshots/UC-057/P03_resp.png)

#### P04 — Acao: Visualizar resposta formatada em markdown com resultado da tool executada

![P04 Acao UC-057](../runtime/screenshots/UC-057/P04_acao.png)

#### P04 — Resposta: ChatArea renderiza markdown com titulos, listas, tabelas e codigo; scroll automatico para ultima mensagem

![P04 Resposta UC-057](../runtime/screenshots/UC-057/P04_resp.png)

#### P05 — Acao: Criar nova sessao e verificar sessoes anteriores na sidebar

![P05 Acao UC-057](../runtime/screenshots/UC-057/P05_acao.png)

#### P05 — Resposta: POST /api/chat/sessions cria nova sessao; historico limpo; sessoes anteriores acessiveis na sidebar para navegacao

![P05 Resposta UC-057](../runtime/screenshots/UC-057/P05_resp.png)

**⚠️ PENDENTE** — Status final pendente de implementacao completa — Parcialmente implementado — FloatingChat.tsx | ChatArea.tsx | POST /api/chat/send | 76 tools registradas

---

## UC-058

## UC-058 — CRUD Generico de Tabelas

### Requisitos Implementados

**RF-056** | **RN-CRUD-001** | **RN-CRUD-004**

- GET/POST /api/crud/{tabela} e PUT/DELETE /api/crud/{tabela}/{id} — CRUD generico via crud_routes.py
- 45+ tabelas configuradas em ALL_CRUD_CONFIGS (crudTables.tsx)
- Fields suportam tipos: text, number, select, textarea, date, boolean
- Hierarquia pai-filho via parentFk, parentTable, parentLabelField (3 niveis)
- crudList/crudCreate/crudUpdate/crudDelete (crud.ts) — API client reutilizavel em todos os modulos

### Sequencia de Eventos Validada

#### P01 — Acao: Acessar pagina de cadastro no menu que usa CrudPage

![P01 Acao UC-058](../runtime/screenshots/UC-058/P01_acao.png)

#### P01 — Resposta: CrudPage renderiza DataTable com colunas definidas em fields[], campo de busca, contador total e botao "Novo"

![P01 Resposta UC-058](../runtime/screenshots/UC-058/P01_resp.png)

#### P02 — Acao: Clicar em "Novo" — Modal de criacao abre com formulario gerado dinamicamente

![P02 Acao UC-058](../runtime/screenshots/UC-058/P02_acao.png)

#### P02 — Resposta: Modal renderiza formulario a partir de fields[] com tipos corretos (text/number/select/textarea/date/boolean)

![P02 Resposta UC-058](../runtime/screenshots/UC-058/P02_resp.png)

#### P03 — Acao: Preencher dados e clicar em "Salvar" — crudCreate persiste registro

![P03 Acao UC-058](../runtime/screenshots/UC-058/P03_acao.png)

#### P03 — Resposta: POST /api/crud/{tabela} persiste registro; DataTable recarrega; contagem total atualizada

![P03 Resposta UC-058](../runtime/screenshots/UC-058/P03_resp.png)

#### P04 — Acao: Clicar em "Editar" na linha — Modal pre-preenchido abre

![P04 Acao UC-058](../runtime/screenshots/UC-058/P04_acao.png)

#### P04 — Resposta: Modal com dados do registro pre-preenchidos; PUT /api/crud/{tabela}/{id} persiste alteracoes apos salvar

![P04 Resposta UC-058](../runtime/screenshots/UC-058/P04_resp.png)

#### P05 — Acao: Usar campo de busca — DataTable filtra server-side por termo

![P05 Acao UC-058](../runtime/screenshots/UC-058/P05_acao.png)

#### P05 — Resposta: GET /api/crud/{tabela}?search={termo} retorna resultados filtrados; DataTable atualiza com registros correspondentes

![P05 Resposta UC-058](../runtime/screenshots/UC-058/P05_resp.png)

#### P06 — Acao: Clicar em "Excluir" com confirmacao — DELETE remove registro

![P06 Acao UC-058](../runtime/screenshots/UC-058/P06_acao.png)

#### P06 — Resposta: Dialog de confirmacao exibido; DELETE /api/crud/{tabela}/{id} remove registro; lista atualiza sem o item excluido

![P06 Resposta UC-058](../runtime/screenshots/UC-058/P06_resp.png)

#### P07 — Acao: Verificar CrudPage com hierarquia pai-filho (ex: produto > especificacao)

![P07 Acao UC-058](../runtime/screenshots/UC-058/P07_acao.png)

#### P07 — Resposta: CrudPage com parentFk carrega registros filtrados pelo pai; hierarquia de 3 niveis (grandparent/parent/child) funcional

![P07 Resposta UC-058](../runtime/screenshots/UC-058/P07_resp.png)

**⚠️ PENDENTE** — Status final pendente de implementacao completa — Parcialmente implementado — crud_routes.py | CrudPage.tsx | crudTables.tsx (45+ configuracoes)

---

## Resumo de Aceitacao — Sprint 5

| UC | Nome | Requisitos | Status |
|---|---|---|---|
| [UC-042](#uc-042) | Registrar Resultado | RF-044-13 | **✅ APROVADO** |
| [UC-043](#uc-043) | Alertas de Vencimento | RF-052-EXT-01 | **✅ APROVADO** |
| [UC-044](#uc-044) | Score Logistico | RF-046 | **✅ APROVADO** |
| [UC-045](#uc-045) | Buscar Atas PNCP | RF-019 | **✅ APROVADO** |
| [UC-046](#uc-046) | Extrair Ata via IA | RF-010, RF-036 | **✅ APROVADO** |
| [UC-047](#uc-047) | Dashboard de Atas | RF-047, RF-048 | **✅ APROVADO** |
| [UC-048](#uc-048) | Cadastrar Contrato | RF-046 | **✅ APROVADO** |
| [UC-049](#uc-049) | Registrar Entrega NF | RF-046, RF-051 | **✅ APROVADO** |
| [UC-050](#uc-050) | Cronograma | RF-046 | **✅ APROVADO** |
| [UC-051](#uc-051) | Aditivos Contratuais | RF-046-EXT-01 | **✅ APROVADO** |
| [UC-052](#uc-052) | Gestor e Fiscal | RF-046-EXT-02 | **✅ APROVADO** |
| [UC-053](#uc-053) | Saldo ARP e Caronas | RF-046-EXT-03 | **✅ APROVADO** |
| [UC-054](#uc-054) | Dashboard CR | RF-051, RF-052 | **✅ APROVADO** |
| [UC-055](#uc-055) | Atrasos | RF-052 | **✅ APROVADO** |
| [UC-056](#uc-056) | Alertas Multi-tier CR | RF-052-EXT-01 | **✅ APROVADO** |
| [UC-057](#uc-057) | Chat com IA | RF-054 | **⚠️ PENDENTE** |
| [UC-058](#uc-058) | CRUD Generico | RF-056 | **⚠️ PENDENTE** |

**Total:** 17 UCs analisadas | **15 APROVADOS** | **2 PENDENTES** (UC-057 e UC-058 com status final pendente conforme UC docs) | Gerado em 31/03/2026
