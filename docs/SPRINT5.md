# SPRINT 5 — FOLLOW-UP + PRODUCAO + CONTRATADO + ATAS

**Data:** 27/03/2026
**Versao:** 1.0
**Onda:** 3 (Ciclo Pos-Licitacao)
**Status:** PLANEJADO
**Objetivo:** Entregar o ciclo de vida pos-resultado: registro de vitorias/derrotas, gestao de contratos e entregas, atas de registro de precos e dashboard de performance contratual.

---

## 1. Contexto

A Sprint 5 marca a transicao do ciclo pre-licitacao (Sprints 1 a 4) para o ciclo **pos-licitacao**. Ate aqui, o sistema cobriu:

- **Sprint 1:** Infraestrutura de conexao, Dashboard, Empresa, Parametrizacoes
- **Sprint 2:** Captacao de editais e Validacao com scores de IA
- **Sprint 3:** Precificacao, Proposta e Submissao com export PDF/DOCX
- **Sprint 4:** Juridico — Impugnacao, Recursos, Contra-Razoes e Disclaimers

Apos licitar, precificar, montar proposta, disputar lances e recorrer, o proximo passo natural e: **o que acontece depois do resultado?**

A Sprint 5 responde a essa pergunta com quatro modulos:

1. **Follow-up** — Registro de resultados (vitoria/derrota), atualizacao de status, geracao automatica de leads CRM e contratos
2. **Atas de Pregao** — Busca, download e extracao de atas de registro de precos no PNCP via ferramentas de IA
3. **Execucao de Contratos (Producao)** — CRUD completo de contratos, entregas, notas fiscais e cronograma
4. **Contratado X Realizado** — Dashboard comparativo de valores contratados vs realizados, com atrasos e vencimentos

Alem das 6 entregas previstas no roadmap original (`planejamento_sprints_completo.md`), uma pesquisa sobre a **Lei 14.133/2021** (Nova Lei de Licitacoes) identificou **4 requisitos adicionais** nao previstos originalmente, mas necessarios para conformidade legal:

- Gestao de Aditivos Contratuais (Art. 124-126)
- Designacao de Gestor e Fiscal de Contrato (Art. 117)
- Saldo ARP e Controle de Carona (Art. 82-86)
- Alertas de Vencimento Multi-tier (boas praticas de gestao contratual)

Essas adcoes elevam o escopo de 6 para **10 entregas**.

---

## 2. Escopo — Tabela de Entregas

### Entregas do Roadmap Original

| # | Funcionalidade | Task | RF | Pagina |
|---|----------------|------|----|--------|
| 1 | **FollowupPage — registrar resultados** via tool_registrar_resultado + alertas | T24 | RF-017 | FollowupPage.tsx |
| 2 | **tool_calcular_score_logistico** — viabilidade logistica | T25 | RF-011 | tools.py |
| 3 | **AtasPage — pagina nova** com 3 tools IA | T26 | RF-035 | AtasPage.tsx (nova) |
| 4 | **ProducaoPage — CRUD contratos + entregas** | T27 | RF-046 | ProducaoPage.tsx |
| 5 | **Endpoint GET /api/dashboard/contratado-realizado** | T29 | RF-051 | app.py |
| 6 | **ContratadoRealizadoPage — dashboard real** | T28 | RF-051, RF-052 | ContratadoRealizadoPage.tsx |

### Entregas Adicionais (Pesquisa Lei 14.133/2021)

| # | Funcionalidade | Task | Fundamentacao | Pagina |
|---|----------------|------|---------------|--------|
| 7 | **Gestao de Aditivos** — tracking de aditivos contratuais com limites legais | NEW | Art. 124-126 | ProducaoPage.tsx |
| 8 | **Designacao Gestor/Fiscal** — obrigatoriedade de designacao formal | NEW | Art. 117 | ProducaoPage.tsx |
| 9 | **Saldo ARP / Controle de Carona** — saldos e limites de adesao | NEW | Art. 82-86 | AtasPage.tsx |
| 10 | **Alertas de Vencimento Multi-tier** — alertas configuraveis multi-canal | NEW | Boas praticas | ContratadoRealizadoPage.tsx |

---

## 3. Requisitos Cobertos

### Requisitos do Roadmap Original

---

#### RF-017: Follow-up de Editais

**Descricao:** Registro de resultados de licitacoes participadas (vitoria ou derrota), com atualizacao automatica de status e criacao de entidades dependentes.

**Criterios de aceite:**
1. Tabela carrega editais com status `submetido` do banco de dados
2. Modal permite registrar vitoria (tipo, valor final, observacoes) ou derrota (motivo, concorrente vencedor, valor vencedor)
3. Status do edital atualiza automaticamente (submetido -> ganho/perdido)
4. Em caso de vitoria: contrato criado automaticamente na tabela `contratos`
5. Em caso de derrota: lead CRM criado automaticamente na tabela `leads_crm`
6. Alertas de prazo configuraveis para prazos de assinatura/recurso

---

#### RF-011: Score Logistico (Dimensao de Viabilidade)

**Descricao:** Calculo de viabilidade logistica como dimensao adicional do score de aderencia.

**Criterios de aceite:**
1. Calcula distancia entre UF da empresa e UF do local de entrega
2. Consulta historico de entregas na regiao
3. Estima custos de frete baseado em distancia e volume
4. Analisa prazos de entrega viaveis
5. Retorna score 0-100 com recomendacao (viavel/parcial/inviavel)
6. Integrado ao painel de Validacao como dimensao adicional

---

#### RF-035: Atas de Pregao

**Descricao:** Busca, download e extracao de informacoes de atas de registro de precos publicadas no PNCP.

**Criterios de aceite:**
1. Busca de atas por termo, orgao, CNPJ ou numero de controle
2. Download automatico do PDF da ata
3. Extracao via IA: itens registrados, vencedores, precos unitarios, quantidades
4. Salvamento em tabela `atas_consultadas` com vinculo a `preco_historico`
5. Interface com abas: Buscar, Extrair, Minhas Atas

---

#### RF-046: Execucao de Contrato

**Descricao:** Acompanhamento da execucao pos-vitoria com gestao completa de contratos e entregas.

**Criterios de aceite:**
1. Tabela de contratos: numero, orgao, valor, data inicio/fim, status (vigente/encerrado/rescindido/suspenso)
2. Detalhe do contrato: entregas previstas vs realizadas
3. Modal de registrar entrega: descricao, quantidade, valor, nota fiscal, numero de empenho
4. Indicadores: atrasados, entregues, pendentes
5. Proximos vencimentos com contagem regressiva

---

#### RF-051: Contratado X Realizado

**Descricao:** Comparativo entre valores contratados e efetivamente realizados.

**Criterios de aceite:**
1. Resumo comparativo: total contratado vs total realizado, variacao percentual
2. Tabela detalhada por contrato com colunas: contrato, orgao, valor contratado, valor realizado, desvio %
3. Indicadores de desvio com semaforo (verde <= 5%, amarelo <= 15%, vermelho > 15%)
4. Depende de RF-046 (Execucao de Contrato)

---

#### RF-052: Pedidos em Atraso

**Descricao:** Monitoramento de entregas atrasadas em contratos ativos.

**Criterios de aceite:**
1. Tabela de entregas atrasadas: contrato, item, dias de atraso, valor em risco
2. Alertas automaticos para atrasos criticos (> 7 dias, > 15 dias, > 30 dias)
3. Depende de RF-046 (Execucao de Contrato)

---

### Requisitos Adicionais — Pesquisa Lei 14.133/2021

---

#### RF-046-EXT-01: Gestao de Aditivos Contratuais (NOVO — Pesquisa Lei 14.133/2021)

**Fundamentacao Legal:** Art. 124 a 126 da Lei 14.133/2021
**Descricao:** Registro e controle de termos aditivos que modificam contratos administrativos — seja por acrescimo/supressao de valor, prorrogacao de prazo ou alteracao de escopo.

**Criterios de aceite:**
1. CRUD de aditivos vinculados a um contrato (tipo: valor, prazo, escopo)
2. Campos obrigatorios: justificativa, valor original, valor do aditivo, percentual, data, fundamentacao legal
3. Validacao automatica de limites legais: 25% para acrescimos em geral, 50% para reforma de edificio/equipamento (Art. 125)
4. Alerta visual quando percentual acumulado se aproxima do limite legal
5. Historico de aditivos por contrato com timeline
6. Status do aditivo: rascunho, aprovado, publicado, cancelado

---

#### RF-046-EXT-02: Designacao de Gestor e Fiscal (NOVO — Pesquisa Lei 14.133/2021)

**Fundamentacao Legal:** Art. 117 da Lei 14.133/2021
**Descricao:** A Lei 14.133/2021 obriga a designacao formal de gestor e fiscal para todo contrato administrativo. O sistema deve registrar essas designacoes e permitir o acompanhamento das atividades de fiscalizacao.

**Criterios de aceite:**
1. CRUD de designacoes vinculadas a um contrato (tipo: gestor, fiscal tecnico, fiscal administrativo)
2. Campos: nome, cargo, portaria de designacao, data inicio, data fim, ativo
3. Registro de atividades de fiscalizacao (atesto, medicao, parecer tecnico)
4. Upload de documentos de atividade (relatorio de medicao, parecer, etc.)
5. Alerta quando designacao vence sem substituto

---

#### RF-046-EXT-03: Saldo ARP e Controle de Carona (NOVO — Pesquisa Lei 14.133/2021)

**Fundamentacao Legal:** Art. 82 a 86 da Lei 14.133/2021
**Descricao:** Controle de saldos de Ata de Registro de Precos (ARP) e gestao de solicitacoes de adesao (carona) por orgaos nao participantes. A Lei 14.133/2021 impoe limites rigorosos de adesao.

**Criterios de aceite:**
1. Tabela de saldos por item da ARP: quantidade registrada, consumido pelo participante, consumido por carona, saldo disponivel
2. CRUD de solicitacoes de carona: orgao solicitante, CNPJ, quantidade, status (pendente/autorizado/negado)
3. Validacao automatica de limites: 50% por orgao individual, ate 2x o total registrado para soma de caronas
4. Alerta de vencimento de ARP (vigencia maxima 1 ano, prorrogavel por mais 1)
5. Alerta de saldo baixo (< 20% do saldo original)
6. Dashboard de consumo da ARP com grafico de barras empilhadas

---

#### RF-052-EXT-01: Alertas de Vencimento Multi-tier (NOVO — Pesquisa Lei 14.133/2021)

**Fundamentacao Legal:** Boas praticas de gestao contratual sob a Lei 14.133/2021
**Descricao:** Sistema de alertas escalonados para vencimentos criticos, com multiplos niveis de urgencia e canais de notificacao.

**Criterios de aceite:**
1. Tipos de alerta: contrato_vencimento, arp_vencimento, garantia_vencimento, entrega_prazo
2. Thresholds configuraveis: 30, 15, 7 e 1 dia(s) antes do vencimento
3. Escalacao por canal: 30d -> notificacao sistema; 15d -> notificacao + email; 7d -> todos os canais
4. Dashboard de proximos vencimentos com contagem regressiva
5. Multi-canal: sistema (notificacao in-app), email (SMTP), WhatsApp (futuro)
6. Historico de alertas disparados com confirmacao de leitura

---

## 4. Detalhamento por Funcionalidade

---

### 4.1 FollowupPage — Registrar Resultados

**Endpoint(s) backend:**
- `POST /api/chat/send` — via `tool_registrar_resultado` (tool de IA existente)
- `GET /api/editais?status=submetido` — lista editais aguardando resultado
- `POST /api/crud/contratos` — criacao automatica de contrato em caso de vitoria
- `POST /api/crud/leads-crm` — criacao automatica de lead em caso de derrota

**Componente frontend:**
- `FollowupPage.tsx` — reescrever removendo dados mock
- Secoes: Aguardando Resultado (tabela), Resultados Registrados (tabela), Configuracao de Alertas (painel)
- Modal: Registrar Resultado (tipo vitoria/derrota, campos condicionais)

**Tool(s) IA:**
- `tool_registrar_resultado` — processa o registro via chat (ja existe, precisa ser conectado a UI)
- `tool_configurar_alertas` — configura alertas de prazo pos-resultado (ja existe)

**Fluxo de dados:**
1. Pagina carrega editais com status `submetido` via `GET /api/editais?status=submetido`
2. Usuario seleciona edital e clica "Registrar Resultado"
3. Modal abre com opcoes: Vitoria ou Derrota
4. Se **Vitoria**: campos valor_final, observacoes
   - `onSendToChat("registrar vitoria no edital PE-046/2026, valor final R$ 350.000")`
   - `tool_registrar_resultado` atualiza edital.status para `ganho`
   - Cria automaticamente registro em `contratos` com dados do edital
5. Se **Derrota**: campos motivo, concorrente_vencedor, valor_vencedor
   - `onSendToChat("registrar derrota no edital PE-046/2026, motivo: preco, vencedor: Lab XYZ")`
   - `tool_registrar_resultado` atualiza edital.status para `perdido`
   - Cria automaticamente registro em `leads_crm` para reabordagem futura
6. Tabela de resultados atualiza em tempo real

---

### 4.2 tool_calcular_score_logistico

**Endpoint(s) backend:**
- Chamado via pipeline chat/tool (sem endpoint REST dedicado)
- Integrado ao `tool_calcular_scores_validacao` como dimensao adicional

**Componente frontend:**
- `ValidacaoPage.tsx` — exibe score logistico como barra adicional no painel de scores

**Tool(s) IA:**
- `tool_calcular_score_logistico` (nova tool)

**Parametros de entrada:**
- `empresa_uf` (String) — UF da empresa do usuario
- `local_entrega_uf` (String) — UF do local de entrega do edital
- `produto_id` (String, opcional) — ID do produto para verificar historico
- `historico_entregas_regiao` (Boolean, default=True) — consultar entregas anteriores na regiao

**Retorno:**
```json
{
  "score": 78,
  "dimensoes": {
    "distancia": { "score": 65, "peso": 0.30, "detalhe": "SP -> RJ: ~400km, mesma regiao" },
    "historico": { "score": 90, "peso": 0.25, "detalhe": "3 entregas anteriores no RJ, todas no prazo" },
    "custo_frete": { "score": 70, "peso": 0.25, "detalhe": "Frete estimado: R$ 2.500 (3.2% do valor)" },
    "prazo": { "score": 85, "peso": 0.20, "detalhe": "Prazo viavel: 5 dias uteis (edital pede 10)" }
  },
  "recomendacao": "VIAVEL",
  "observacoes": "Regiao com bom historico de entregas. Custo de frete dentro do aceitavel."
}
```

**Fluxo de dados:**
1. Usuario solicita calculo de scores na ValidacaoPage
2. `tool_calcular_scores_validacao` chama internamente `tool_calcular_score_logistico`
3. Dimensoes calculadas: distancia (tabela de distancias entre UFs), historico (consulta `contrato_entregas` por UF), custo de frete (estimativa por faixa de distancia), prazo (distancia vs prazo exigido)
4. Score ponderado retornado e exibido como 7a barra no painel de scores

---

### 4.3 AtasPage — Nova Pagina

**Endpoint(s) backend:**
- `POST /api/chat/send` — via tools de IA: `tool_buscar_atas_pncp`, `tool_baixar_ata_pncp`, `tool_extrair_ata_pdf`
- `GET /api/crud/atas-consultadas` — lista atas salvas pelo usuario
- `POST /api/crud/atas-consultadas` — salva nova ata consultada
- `POST /api/crud/preco-historico` — salva precos extraidos da ata

**Componente frontend:**
- `AtasPage.tsx` (NOVA) — pagina completa com 4 abas:
  - **Aba Buscar:** campo de busca + resultados em tabela
  - **Aba Extrair:** upload de PDF ou selecao de ata baixada -> extracao via IA
  - **Aba Minhas Atas:** tabela com atas salvas, filtros por orgao/ano/UF
  - **Aba Saldo ARP:** controle de saldos e caronas (entrega 9)

**Tool(s) IA:**
- `tool_buscar_atas_pncp` (nova) — busca atas no PNCP por termo, orgao ou CNPJ
- `tool_baixar_ata_pncp` (nova) — baixa PDF da ata via API PNCP
- `tool_extrair_ata_pdf` (nova) — LLM extrai itens, vencedores e precos do PDF da ata

**Fluxo de dados:**
1. Usuario navega para AtasPage via sidebar (secao "Fluxo Comercial")
2. Na aba "Buscar": digita termo -> `onSendToChat("buscar atas PNCP para reagentes hematologia")` -> `tool_buscar_atas_pncp` retorna lista
3. Seleciona ata -> clica "Baixar" -> `tool_baixar_ata_pncp` faz download do PDF
4. Na aba "Extrair": seleciona PDF -> clica "Extrair com IA" -> `tool_extrair_ata_pdf` processa
5. Resultados exibidos: tabela com itens, CATMAT, vencedores, precos, quantidades
6. Botao "Salvar": grava em `atas_consultadas` + insere precos em `preco_historico`
7. Na aba "Minhas Atas": lista todas as atas salvas com opcao de reextrair

---

### 4.4 ProducaoPage — CRUD Contratos + Entregas

**Endpoint(s) backend:**
- `GET/POST/PUT/DELETE /api/crud/contratos` — CRUD generico via crud_routes.py
- `GET/POST/PUT/DELETE /api/crud/contrato-entregas` — CRUD generico via crud_routes.py
- `GET/POST/PUT/DELETE /api/crud/contrato-aditivos` — CRUD generico (entrega 7)
- `GET/POST/PUT/DELETE /api/crud/contrato-designacoes` — CRUD generico (entrega 8)

**Componente frontend:**
- `ProducaoPage.tsx` — reescrever removendo dados mock
- **Aba Contratos:** tabela com todos os contratos do usuario, filtros por status/orgao/periodo
- **Aba Cronograma:** timeline visual com entregas previstas e realizadas
- **Detalhe do contrato:** abre ao clicar em um contrato, com sub-abas:
  - Sub-aba Entregas: tabela de `contrato_entregas`, botao "+ Registrar Entrega"
  - Sub-aba Aditivos: tabela de `contrato_aditivos`, botao "+ Novo Aditivo" (entrega 7)
  - Sub-aba Gestor/Fiscal: tabela de `contrato_designacoes`, botao "+ Designar" (entrega 8)

**Tool(s) IA:**
- Nenhuma tool de IA dedicada (operacoes CRUD diretas)

**Fluxo de dados:**
1. Pagina carrega contratos via `GET /api/crud/contratos`
2. Tabela exibe: numero_contrato, orgao, objeto (truncado), valor_total, data_inicio, data_fim, status, badge de atraso
3. Usuario clica em contrato -> abre painel de detalhe
4. Sub-aba Entregas: lista `contrato_entregas` do contrato selecionado
5. Botao "+ Registrar Entrega" -> modal com campos: descricao, produto (select do portfolio), quantidade, valor_unitario, valor_total (calculado), data_prevista, nota_fiscal, numero_empenho
6. Ao salvar entrega -> `POST /api/crud/contrato-entregas` -> tabela atualiza
7. Indicadores no topo: total de entregas, entregues no prazo, atrasados, pendentes

---

### 4.5 Endpoint GET /api/dashboard/contratado-realizado

**Endpoint(s) backend:**
- `GET /api/dashboard/contratado-realizado`

**Query params:**
- `periodo` (String, default "6m") — periodo de analise: 1m, 3m, 6m, 12m, tudo
- `produto_id` (String, opcional) — filtrar por produto especifico
- `orgao` (String, opcional) — filtrar por orgao

**Retorno:**
```json
{
  "total_contratado": 1250000.00,
  "total_realizado": 980000.00,
  "variacao_pct": -21.6,
  "total_contratos": 8,
  "total_entregas": 45,
  "entregas_no_prazo": 38,
  "entregas_atrasadas": 5,
  "entregas_pendentes": 2,
  "contratos": [
    {
      "id": "uuid",
      "numero_contrato": "CT-001/2026",
      "orgao": "Hospital Universitario SP",
      "valor_contratado": 350000.00,
      "valor_realizado": 280000.00,
      "variacao_pct": -20.0,
      "entregas_total": 12,
      "entregas_realizadas": 10,
      "status": "vigente",
      "data_fim": "2026-12-31"
    }
  ],
  "atrasos": [
    {
      "contrato_numero": "CT-001/2026",
      "item": "Kit Hemoglobina Glicada",
      "dias_atraso": 12,
      "valor_em_risco": 45000.00,
      "data_prevista": "2026-03-15"
    }
  ],
  "proximos_vencimentos": [
    {
      "tipo": "contrato",
      "referencia": "CT-003/2026",
      "orgao": "Secretaria de Saude MG",
      "data_vencimento": "2026-04-30",
      "dias_restantes": 34
    }
  ]
}
```

**Logica de agregacao:**
1. Consulta `contratos` do usuario no periodo selecionado
2. Para cada contrato, soma `contrato_entregas` com status `entregue` -> valor_realizado
3. Calcula variacao_pct = ((realizado - contratado) / contratado) * 100
4. Identifica atrasos: entregas com `data_prevista < hoje` e `status != entregue`
5. Identifica proximos vencimentos: contratos com `data_fim` nos proximos 90 dias

---

### 4.6 ContratadoRealizadoPage — Dashboard Real

**Componente frontend:**
- `ContratadoRealizadoPage.tsx` — reescrever removendo dados mock

**Secoes da pagina:**
1. **Resumo (stats cards):** Total Contratado, Total Realizado, Variacao %, Entregas no Prazo (%), Contratos Ativos
2. **Tabela comparativa:** uma linha por contrato com colunas: contrato, orgao, contratado, realizado, desvio %, progresso (barra), status
3. **Tabela de atrasos:** entregas atrasadas com dias de atraso, valor em risco, acoes (notificar/reagendar)
4. **Proximos vencimentos:** lista cronologica com contagem regressiva e icone de alerta por urgencia

**Filtros:**
- Periodo: 1m, 3m, 6m, 12m, tudo (via select)
- Produto: select com opcoes do portfolio (opcional)
- Orgao: campo texto com autocomplete (opcional)

**Fluxo de dados:**
1. Pagina carrega dados via `GET /api/dashboard/contratado-realizado?periodo=6m`
2. Stats cards preenchidos com `total_contratado`, `total_realizado`, `variacao_pct`
3. Tabela comparativa preenchida com array `contratos`
4. Tabela de atrasos preenchida com array `atrasos`
5. Lista de vencimentos preenchida com array `proximos_vencimentos`
6. Ao alterar filtro -> nova requisicao com parametros atualizados -> re-renderiza

---

### 4.7 Gestao de Aditivos (NOVO — Pesquisa Lei 14.133/2021)

**Endpoint(s) backend:**
- `GET/POST/PUT/DELETE /api/crud/contrato-aditivos` — CRUD generico via crud_routes.py
- Validacao no backend: verifica limites legais antes de salvar

**Componente frontend:**
- Sub-aba "Aditivos" no detalhe do contrato em `ProducaoPage.tsx`
- Tabela de aditivos com colunas: tipo, data, valor original, valor aditivo, percentual, fundamentacao, status
- Botao "+ Novo Aditivo" abre modal com formulario
- Barra de progresso visual: mostra percentual acumulado vs limite legal (25% ou 50%)
- Alerta visual (vermelho) quando percentual acumulado > 80% do limite

**Tool(s) IA:**
- Nenhuma tool dedicada. Validacao por regras de negocio no backend.

**Regras de negocio:**
1. Aditivo de valor: soma de todos os aditivos de valor nao pode exceder 25% do valor original do contrato (Art. 125, paragrafo 1o)
2. Excecao: reforma de edificio ou equipamento permite ate 50% (Art. 125, paragrafo 2o)
3. Aditivo de prazo: nova data_fim do contrato nao pode ser retroativa
4. Campo `fundamentacao_legal` obrigatorio com sugestao automatica baseada no tipo
5. Transicao de status: rascunho -> aprovado -> publicado (irreversivel)

**Fluxo de dados:**
1. Usuario abre detalhe de contrato -> clica aba "Aditivos"
2. Tabela carrega via `GET /api/crud/contrato-aditivos?contrato_id=X`
3. Clica "+ Novo Aditivo" -> modal com campos
4. Ao digitar valor do aditivo, sistema calcula automaticamente o percentual e exibe barra de progresso
5. Se percentual acumulado > limite: mensagem de erro impede salvamento
6. Se percentual acumulado > 80% do limite: alerta amarelo de proximidade
7. Ao salvar -> `POST /api/crud/contrato-aditivos` com validacao no backend -> tabela atualiza

---

### 4.8 Designacao Gestor/Fiscal (NOVO — Pesquisa Lei 14.133/2021)

**Endpoint(s) backend:**
- `GET/POST/PUT/DELETE /api/crud/contrato-designacoes` — CRUD generico via crud_routes.py
- `GET/POST/PUT/DELETE /api/crud/atividades-fiscais` — CRUD generico via crud_routes.py

**Componente frontend:**
- Sub-aba "Gestor/Fiscal" no detalhe do contrato em `ProducaoPage.tsx`
- Secao 1 — Designacoes Ativas: cards com nome, cargo, tipo (gestor/fiscal tecnico/fiscal administrativo), portaria, vigencia
- Secao 2 — Atividades de Fiscalizacao: tabela cronologica com tipo (atesto, medicao, parecer), data, descricao, arquivo
- Botao "+ Designar" abre modal de cadastro
- Botao "+ Registrar Atividade" abre modal com upload de arquivo

**Tool(s) IA:**
- Nenhuma tool dedicada.

**Regras de negocio:**
1. Todo contrato deve ter ao menos 1 gestor e 1 fiscal tecnico designados (alerta se ausente)
2. Designacao com `data_fim` vencida e `ativo=true` gera alerta de substituicao
3. Atividade fiscal pode ter arquivo anexo (PDF de medicao, parecer, relatorio)
4. Ao encerrar contrato: verifica se todas as medicoes estao completas

**Fluxo de dados:**
1. Usuario abre detalhe de contrato -> clica aba "Gestor/Fiscal"
2. Cards de designacoes carregam via `GET /api/crud/contrato-designacoes?contrato_id=X`
3. Tabela de atividades carrega via `GET /api/crud/atividades-fiscais?designacao_id=Y`
4. "+ Designar" -> modal com campos: tipo, nome, cargo, portaria, data_inicio, data_fim
5. "+ Registrar Atividade" -> modal com campos: tipo (select), data, descricao, arquivo (upload)
6. Upload de arquivo via `POST /api/upload` -> path salvo em `atividade_fiscal.arquivo_path`

---

### 4.9 Saldo ARP / Controle de Carona (NOVO — Pesquisa Lei 14.133/2021)

**Endpoint(s) backend:**
- `GET/POST/PUT/DELETE /api/crud/arp-saldos` — CRUD generico via crud_routes.py
- `GET/POST/PUT/DELETE /api/crud/solicitacoes-carona` — CRUD generico via crud_routes.py
- Validacao no backend: limites de adesao (50% individual, 2x global)

**Componente frontend:**
- Aba "Saldo ARP" na `AtasPage.tsx`
- Tabela de saldos: item, quantidade registrada, consumido participante, consumido carona, saldo disponivel, barra de progresso
- Tabela de solicitacoes de carona: orgao solicitante, quantidade, status (badge colorido), data
- Botao "+ Registrar Consumo" (participante)
- Botao "+ Solicitacao de Carona" (orgao externo)
- Dashboard mini: grafico de barras empilhadas mostrando distribuicao de consumo

**Tool(s) IA:**
- Nenhuma tool dedicada. Saldos calculados por regras de negocio.

**Regras de negocio (Art. 82 a 86):**
1. ARP tem vigencia maxima de 1 ano, prorrogavel por mais 1 ano
2. Adesao (carona) por orgao individual: limitada a 50% dos quantitativos registrados na ata
3. Soma total de adesoes de caronas: nao pode exceder o dobro (2x) do quantitativo registrado
4. Solicitacao de carona requer justificativa e vantajosidade comprovada
5. Saldo = quantidade_registrada - consumido_participante - consumido_carona
6. Alerta quando saldo < 20% do total registrado
7. Alerta 90/60/30 dias antes do vencimento da ARP

**Fluxo de dados:**
1. Usuario seleciona ata na aba "Minhas Atas" -> clica "Ver Saldo"
2. Navega para aba "Saldo ARP" com ata pre-selecionada
3. Tabela de saldos carrega via `GET /api/crud/arp-saldos?ata_id=X`
4. "+ Registrar Consumo" -> modal: item (select da ARP), quantidade, tipo (participante/carona)
5. Se tipo carona: campos adicionais: orgao_solicitante, cnpj, justificativa
6. Backend valida limites antes de salvar: recusa se excede 50% individual ou 2x global
7. Saldo atualiza automaticamente apos registro

---

### 4.10 Alertas de Vencimento Multi-tier (NOVO — Pesquisa Lei 14.133/2021)

**Endpoint(s) backend:**
- Extensao da logica existente em `tool_configurar_alertas`
- Novos tipos no Enum do modelo `Alerta`: contrato_vencimento, arp_vencimento, garantia_vencimento, entrega_prazo
- Scheduler (APScheduler) verifica diariamente e dispara alertas nos thresholds configurados

**Componente frontend:**
- Painel de "Proximos Vencimentos" na `ContratadoRealizadoPage.tsx`
- Cards com contagem regressiva e cor por urgencia: verde (> 30d), amarelo (15-30d), laranja (7-15d), vermelho (< 7d)
- Configuracao de thresholds em `ParametrizacoesPage.tsx` (secao Alertas)
- Icone de sino com badge de contagem no header (notificacoes nao lidas)

**Tool(s) IA:**
- `tool_configurar_alertas` (extensao da tool existente) — aceita novos tipos de alerta

**Regras de escalacao:**
1. **30 dias antes:** notificacao in-app (icone de sino, badge)
2. **15 dias antes:** notificacao in-app + email via SMTP
3. **7 dias antes:** notificacao in-app + email + destaque na Dashboard principal
4. **1 dia antes:** todos os canais + banner critico no topo da aplicacao

**Tipos de vencimento monitorados:**
- `contrato_vencimento` — data_fim do contrato se aproxima
- `arp_vencimento` — data_vigencia_fim da ARP se aproxima
- `garantia_vencimento` — garantia contratual vence
- `entrega_prazo` — data_prevista de entrega se aproxima

**Fluxo de dados:**
1. Scheduler roda diariamente (cron via APScheduler, ja configurado)
2. Consulta todos os contratos com `data_fim` nos proximos 30 dias
3. Consulta todas as ARPs com `data_vigencia_fim` nos proximos 30 dias
4. Consulta todas as entregas com `data_prevista` nos proximos 7 dias
5. Para cada item encontrado: verifica threshold atual (30/15/7/1d)
6. Cria registro em `alertas` com tipo e canais adequados
7. Se canal_email=true: envia via SMTP (configuracao existente no app.py)
8. Frontend exibe notificacoes via polling a `GET /api/crud/alertas?status=agendado`

---

## 5. Modelo de Dados

### Tabelas Existentes (ja em models.py)

---

#### Contrato
```
contratos
├── id (String 36, PK, UUID)
├── user_id (String 36, FK users.id)
├── empresa_id (String 36, FK empresas.id)
├── edital_id (String 36, FK editais.id)
├── proposta_id (String 36, FK propostas.id)
├── numero_contrato (String 100)
├── orgao (String 255)
├── objeto (Text)
├── valor_total (Decimal 15,2)
├── data_assinatura (Date)
├── data_inicio (Date)
├── data_fim (Date)
├── status (Enum: vigente, encerrado, rescindido, suspenso)
├── arquivo_path (String 500)
├── observacoes (Text)
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

#### ContratoEntrega
```
contrato_entregas
├── id (String 36, PK, UUID)
├── contrato_id (String 36, FK contratos.id, CASCADE)
├── produto_id (String 36, FK produtos.id)
├── descricao (Text)
├── quantidade (Decimal 15,4)
├── valor_unitario (Decimal 15,2)
├── valor_total (Decimal 15,2)
├── data_prevista (Date, NOT NULL)
├── data_realizada (Date)
├── nota_fiscal (String 100)
├── numero_empenho (String 100)
├── status (Enum: pendente, entregue, atrasado, cancelado)
├── observacoes (Text)
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

#### AtaConsultada
```
atas_consultadas
├── id (String 36, PK, UUID)
├── edital_id (String 36, FK editais.id)
├── user_id (String 36, FK users.id)
├── numero_controle_pncp (String 100, UNIQUE)
├── titulo (String 255)
├── orgao (String 255)
├── cnpj_orgao (String 20)
├── uf (String 2)
├── ano (Integer)
├── seq_compra (Integer)
├── url_pncp (String 500)
├── url_edital_origem (String 500)
├── data_publicacao (DateTime)
├── data_vigencia_inicio (Date)
├── data_vigencia_fim (Date)
└── created_at (DateTime)
```

---

#### LeadCRM
```
leads_crm
├── id (String 36, PK, UUID)
├── user_id (String 36, FK users.id)
├── empresa_id (String 36, FK empresas.id)
├── edital_id (String 36, FK editais.id)
├── orgao (String 255, NOT NULL)
├── cnpj_orgao (String 20)
├── contato_nome (String 255)
├── contato_cargo (String 100)
├── contato_telefone (String 20)
├── contato_email (String 255)
├── status_pipeline (Enum: prospeccao, contato, proposta, negociacao, ganho, perdido, inativo)
└── origem (String 100)
```

---

#### Alerta
```
alertas
├── id (String 36, PK, UUID)
├── user_id (String 36, FK users.id)
├── empresa_id (String 36, FK empresas.id)
├── edital_id (String 36, FK editais.id)
├── tipo (Enum: abertura, impugnacao, recursos, proposta, personalizado)
├── data_disparo (DateTime, NOT NULL)
├── tempo_antes_minutos (Integer)
├── status (Enum: agendado, disparado, lido, cancelado)
├── canal_email (Boolean, default True)
├── canal_push (Boolean, default True)
├── canal_sms (Boolean, default False)
├── titulo (String 255)
├── mensagem (Text)
├── disparado_em (DateTime)
├── lido_em (DateTime)
└── created_at (DateTime)
```

**Alteracao necessaria no Alerta:** Adicionar novos valores ao Enum `tipo`:
- `contrato_vencimento`
- `arp_vencimento`
- `garantia_vencimento`
- `entrega_prazo`

E tornar `edital_id` nullable (alertas de contrato/ARP nao necessariamente vinculados a edital).

---

### Tabelas Novas (a criar em models.py)

---

#### ContratoAditivo (NOVA)
```
contrato_aditivos
├── id (String 36, PK, UUID)
├── contrato_id (String 36, FK contratos.id, CASCADE, NOT NULL)
├── tipo (Enum: valor, prazo, escopo)
├── justificativa (Text, NOT NULL)
├── valor_original (Decimal 15,2) — valor do contrato no momento do aditivo
├── valor_aditivo (Decimal 15,2) — valor acrescido/suprimido
├── percentual (Decimal 5,2) — % em relacao ao valor original
├── data_aditivo (Date, NOT NULL)
├── nova_data_fim (Date) — apenas para aditivos de prazo
├── fundamentacao_legal (String 255) — ex: "Art. 124, I, Lei 14.133/2021"
├── status (Enum: rascunho, aprovado, publicado, cancelado)
├── observacoes (Text)
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

#### ContratoDesignacao (NOVA)
```
contrato_designacoes
├── id (String 36, PK, UUID)
├── contrato_id (String 36, FK contratos.id, CASCADE, NOT NULL)
├── tipo (Enum: gestor, fiscal_tecnico, fiscal_administrativo)
├── nome (String 255, NOT NULL)
├── cargo (String 100)
├── portaria (String 100) — numero da portaria de designacao
├── data_inicio (Date, NOT NULL)
├── data_fim (Date)
├── ativo (Boolean, default True)
├── observacoes (Text)
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

#### AtividadeFiscal (NOVA)
```
atividades_fiscais
├── id (String 36, PK, UUID)
├── designacao_id (String 36, FK contrato_designacoes.id, CASCADE, NOT NULL)
├── tipo (Enum: atesto, medicao, parecer, relatorio, vistoria, outro)
├── data (Date, NOT NULL)
├── descricao (Text)
├── arquivo_path (String 500) — caminho do PDF/documento anexo
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

#### ARPSaldo (NOVA)
```
arp_saldos
├── id (String 36, PK, UUID)
├── ata_id (String 36, FK atas_consultadas.id, CASCADE, NOT NULL)
├── item_descricao (String 500, NOT NULL)
├── catmat_catser (String 20) — codigo CATMAT ou CATSER do item
├── unidade (String 20) — ex: "unidade", "frasco", "kit"
├── quantidade_registrada (Decimal 15,4, NOT NULL) — qtd original da ata
├── consumido_participante (Decimal 15,4, default 0) — consumido pelo orgao gerenciador
├── consumido_carona (Decimal 15,4, default 0) — soma de caronas autorizadas
├── saldo_disponivel (Decimal 15,4) — calculado: registrada - participante - carona
├── valor_unitario_registrado (Decimal 15,2) — preco da ata
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

#### SolicitacaoCarona (NOVA)
```
solicitacoes_carona
├── id (String 36, PK, UUID)
├── arp_saldo_id (String 36, FK arp_saldos.id, CASCADE, NOT NULL)
├── orgao_solicitante (String 255, NOT NULL)
├── cnpj_solicitante (String 20)
├── quantidade (Decimal 15,4, NOT NULL)
├── justificativa (Text)
├── status (Enum: pendente, autorizado, negado)
├── data_solicitacao (Date, NOT NULL)
├── data_resposta (Date)
├── observacoes (Text)
├── created_at (DateTime)
└── updated_at (DateTime)
```

---

## 6. Telas e Navegacao

### 6.1 FollowupPage

```
┌─────────────────────────────────────────────────────────────────────┐
│ FOLLOW-UP                                                           │
│ Acompanhamento de resultados de licitacoes                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ SECAO: Aguardando Resultado ────────────────────────────────────┐│
│ │ [Filtro: Periodo ▼] [Filtro: Orgao ▼]                           ││
│ │                                                                   ││
│ │ ┌──────────────────────────────────────────────────────────────┐  ││
│ │ │ Edital      │ Orgao         │ Valor Est. │ Prazo  │ Acoes   │  ││
│ │ ├──────────────────────────────────────────────────────────────┤  ││
│ │ │ PE-046/2026 │ Hosp.Univ SP  │ R$350.000  │ 5 dias │[Registrar]││
│ │ │ PE-112/2026 │ Sec.Saude MG  │ R$180.000  │ 12 dias│[Registrar]││
│ │ └──────────────────────────────────────────────────────────────┘  ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ SECAO: Resultados Registrados ──────────────────────────────────┐│
│ │ ┌──────────────────────────────────────────────────────────────┐  ││
│ │ │ Edital      │ Resultado │ Valor Final│ Data     │ Detalhes  │  ││
│ │ ├──────────────────────────────────────────────────────────────┤  ││
│ │ │ PE-031/2026 │ VITORIA   │ R$290.000  │ 20/03/26 │ [Ver]     │  ││
│ │ │ PE-089/2026 │ DERROTA   │ R$200.000  │ 18/03/26 │ [Ver]     │  ││
│ │ └──────────────────────────────────────────────────────────────┘  ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ SECAO: Alertas de Prazo ────────────────────────────────────────┐│
│ │ [+ Novo Alerta]                                                   ││
│ │ Tabela de alertas configurados com tipo, edital, prazo, status   ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Modal: Registrar Resultado**
```
┌─── Registrar Resultado ─────────────────────┐
│                                               │
│ Edital: PE-046/2026 — Hosp. Univ. SP         │
│                                               │
│ Tipo: ( ) Vitoria  ( ) Derrota               │
│                                               │
│ --- Se Vitoria ---                            │
│ Valor Final:    [R$ ________]                │
│ Observacoes:    [_________________________]  │
│                                               │
│ --- Se Derrota ---                            │
│ Motivo:         [Preco ▼]                    │
│ Vencedor:       [________________]           │
│ Valor Vencedor: [R$ ________]                │
│ Observacoes:    [_________________________]  │
│                                               │
│           [Cancelar]  [Registrar]             │
└───────────────────────────────────────────────┘
```

---

### 6.2 AtasPage (NOVA)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ATAS DE REGISTRO DE PRECOS                                          │
│ Busca, extracao e gestao de atas do PNCP                           │
│                                                                     │
│ [Aba: Buscar] [Aba: Extrair] [Aba: Minhas Atas] [Aba: Saldo ARP] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ === ABA BUSCAR ===                                                  │
│ ┌─ CARD: Busca ────────────────────────────────────────────────────┐│
│ │ Termo: [reagentes hematologia___] [Buscar]                       ││
│ │ Filtros: [UF ▼] [Ano ▼] [Orgao: _________]                     ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ Resultados ─────────────────────────────────────────────────────┐│
│ │ Titulo          │ Orgao        │ UF │ Ano  │ Vigencia │ Acoes   ││
│ │ Ata RP 001/2026 │ Hosp Univ SP │ SP │ 2026 │ Vigente  │[Baixar] ││
│ │ Ata RP 045/2025 │ Sec Saude RJ │ RJ │ 2025 │ Vigente  │[Baixar] ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ === ABA SALDO ARP ===                                               │
│ ┌─ Saldo da Ata: Ata RP 001/2026 ──────────────────────────────────┐│
│ │ Item              │ Registrado │ Participante │ Carona │ Saldo   ││
│ │ Kit Hemoglobina   │ 500        │ 200          │ 100    │ 200     ││
│ │ Kit Glicose       │ 300        │ 150          │ 50     │ 100     ││
│ └────────────────────────────────────────────────────────────────────┘│
│ ┌─ Solicitacoes de Carona ──────────────────────────────────────────┐│
│ │ Orgao           │ Item            │ Qtd │ Status     │ Data      ││
│ │ Pref. Campinas  │ Kit Hemoglobina │ 50  │ Autorizado │ 15/03/26  ││
│ │ Sec. Saude BA   │ Kit Glicose     │ 30  │ Pendente   │ 25/03/26  ││
│ └────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 6.3 ProducaoPage

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRODUCAO — Gestao de Contratos                                      │
│ Acompanhamento de contratos e entregas                              │
│                                                                     │
│ [Aba: Contratos] [Aba: Cronograma]                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [Filtro: Status ▼] [Filtro: Orgao ▼] [Filtro: Periodo ▼]         │
│                                                                     │
│ INDICADORES:                                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ 8        │ │ 5        │ │ 2        │ │ 1        │               │
│ │ Total    │ │ Vigentes │ │ A vencer │ │ Atrasado │               │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                     │
│ ┌─ TABELA CONTRATOS ───────────────────────────────────────────────┐│
│ │ Contrato    │ Orgao       │ Objeto     │ Valor    │ Fim    │ St ││
│ │ CT-001/2026 │ Hosp.Univ   │ Reagentes  │ R$350k   │ 12/26  │ V  ││
│ │ CT-002/2026 │ Sec.Saude   │ Equip.Lab  │ R$180k   │ 06/26  │ V  ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ DETALHE: CT-001/2026 ───────────────────────────────────────────┐│
│ │ [Sub-aba: Entregas] [Sub-aba: Aditivos] [Sub-aba: Gestor/Fiscal]││
│ │                                                                   ││
│ │ === SUB-ABA ENTREGAS ===                                          ││
│ │ [+ Registrar Entrega]                                             ││
│ │ Item          │ Qtd │ Valor    │ Prevista │ Realizada │ Status   ││
│ │ Kit Hemo      │ 50  │ R$25.000 │ 15/03    │ 14/03     │ Entregue ││
│ │ Kit Glicose   │ 30  │ R$15.000 │ 30/03    │ —         │ Pendente ││
│ │                                                                   ││
│ │ === SUB-ABA ADITIVOS === (NOVO)                                   ││
│ │ [+ Novo Aditivo]                                                  ││
│ │ Tipo  │ Data   │ Valor Adit.│ % Acum.│ Fundam.      │ Status    ││
│ │ Valor │ 20/03  │ +R$50.000  │ 14.3%  │ Art.124,I    │ Aprovado  ││
│ │ Prazo │ 25/03  │ —          │ —      │ Art.124,II   │ Publicado ││
│ │                                                                   ││
│ │ Barra: [=========>        ] 14.3% / 25% (limite legal)           ││
│ │                                                                   ││
│ │ === SUB-ABA GESTOR/FISCAL === (NOVO)                              ││
│ │ [+ Designar]                                                      ││
│ │ ┌ Gestor ─────────────────┐ ┌ Fiscal Tecnico ───────────────┐   ││
│ │ │ Maria Silva             │ │ Joao Santos                    │   ││
│ │ │ Coordenadora de Compras │ │ Biomedico — CRBm 12345        │   ││
│ │ │ Portaria 045/2026       │ │ Portaria 046/2026              │   ││
│ │ │ Vigente ate: 31/12/2026 │ │ Vigente ate: 31/12/2026        │   ││
│ │ └─────────────────────────┘ └────────────────────────────────┘   ││
│ │                                                                   ││
│ │ [+ Registrar Atividade]                                           ││
│ │ Tipo     │ Data   │ Descricao                    │ Arquivo       ││
│ │ Atesto   │ 14/03  │ Atesto de recebimento lote 1 │ [PDF]         ││
│ │ Medicao  │ 20/03  │ Medicao mensal marco/2026    │ [PDF]         ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 6.4 ContratadoRealizadoPage

```
┌─────────────────────────────────────────────────────────────────────┐
│ CONTRATADO X REALIZADO                                              │
│ Dashboard de performance contratual                                 │
│                                                                     │
│ [Filtro: Periodo ▼] [Filtro: Produto ▼] [Filtro: Orgao _______]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ RESUMO:                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│ │ R$ 1.250.000 │ │ R$ 980.000   │ │ -21.6%       │ │ 84.4%      │ │
│ │ Contratado   │ │ Realizado    │ │ Variacao     │ │ No Prazo   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                     │
│ ┌─ COMPARATIVO POR CONTRATO ───────────────────────────────────────┐│
│ │ Contrato    │ Orgao      │ Contrat.│ Realiz.│ Desvio │ Progresso││
│ │ CT-001/2026 │ Hosp.Univ  │ R$350k  │ R$280k │ -20.0% │ [====> ]││
│ │ CT-002/2026 │ Sec.Saude  │ R$180k  │ R$180k │  0.0%  │ [======]││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ ATRASOS ────────────────────────────────────────────────────────┐│
│ │ Contrato    │ Item            │ Dias Atraso│ Valor Risco│ Acoes  ││
│ │ CT-001/2026 │ Kit Hemoglobina │ 12 dias    │ R$45.000   │[Acao]  ││
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ PROXIMOS VENCIMENTOS ───────────────────────────────────────────┐│
│ │ Tipo     │ Referencia  │ Orgao      │ Vencimento │ Restante     ││
│ │ Contrato │ CT-003/2026 │ Sec.Saude  │ 30/04/2026 │ 34 dias      ││
│ │ ARP      │ ARP-001/2025│ Hosp.Univ  │ 15/05/2026 │ 49 dias      ││
│ │ Entrega  │ CT-001 #5   │ Hosp.Univ  │ 05/04/2026 │ 9 dias (!)   ││
│ └───────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 6.5 Alteracoes na Sidebar

Adicionar `AtasPage` na secao "Fluxo Comercial" do menu lateral, entre "Submissao" e "Follow-up":

```
Fluxo Comercial
├── Captacao
├── Validacao
├── Impugnacao
├── Precificacao
├── Proposta
├── Submissao
├── Atas de Pregao    <-- NOVA
├── Follow-up
├── Producao
└── Contratado X Realizado
```

---

## 7. Requisitos Adicionais Inferidos (NOVO — Pesquisa Lei 14.133/2021)

Esta secao destaca os 4 requisitos que **NAO constavam no roadmap original** (`planejamento_sprints_completo.md`) e foram adicionados apos pesquisa sobre a Lei 14.133/2021 (Nova Lei de Licitacoes e Contratos Administrativos).

---

### 7.1 RF-046-EXT-01: Gestao de Aditivos Contratuais

**Base legal:** Art. 124 a 126 da Lei 14.133/2021

**Por que foi adicionado:**
O roadmap original previa apenas o CRUD basico de contratos (RF-046). Porem, na pratica da gestao publica, aditivos contratuais sao extremamente comuns — acrescimos de valor, prorrogacoes de prazo, alteracoes de escopo. A Lei 14.133/2021 impoe limites rigorosos (Art. 125: ate 25% de acrescimo, ate 50% para reformas) e exige fundamentacao legal para cada aditivo. Sem esse controle, o usuario nao tem visibilidade sobre quanto do contrato ja foi aditado nem se esta proximo dos limites legais.

**Impacto no sistema:**
- Nova tabela: `contrato_aditivos` (10 campos)
- Nova sub-aba na ProducaoPage: "Aditivos"
- Validacao de regras de negocio no backend (limites %)
- Barra de progresso visual no frontend

**Diferenca do roadmap original:**
O RF-046 original tinha 5 criterios focados em entregas. A gestao de aditivos nao era mencionada em nenhum dos 52 requisitos do planejamento original.

---

### 7.2 RF-046-EXT-02: Designacao de Gestor e Fiscal

**Base legal:** Art. 117 da Lei 14.133/2021

**Por que foi adicionado:**
O Art. 117 da Lei 14.133/2021 estabelece que "a execucao do contrato devera ser acompanhada e fiscalizada por 1 (um) ou mais fiscais do contrato, representantes da Administracao especialmente designados". Essa obrigatoriedade nao estava prevista no sistema. Na pratica, a empresa licitante precisa saber quem e o gestor e o fiscal do contrato para direcionar comunicacoes, obter atestos e resolver pendencias.

**Impacto no sistema:**
- Novas tabelas: `contrato_designacoes` (11 campos) + `atividades_fiscais` (7 campos)
- Nova sub-aba na ProducaoPage: "Gestor/Fiscal"
- Cards visuais com dados dos designados
- Upload de documentos de atividade fiscal

**Diferenca do roadmap original:**
Nenhuma mencao a gestor/fiscal em nenhum dos requisitos originais. O RF-046 focava exclusivamente em entregas e NF.

---

### 7.3 RF-046-EXT-03: Saldo ARP e Controle de Carona

**Base legal:** Art. 82 a 86 da Lei 14.133/2021

**Por que foi adicionado:**
O roadmap original previa a AtasPage (RF-035) apenas para buscar, baixar e extrair atas. Porem, na pratica, atas de registro de precos (ARP) possuem um ciclo de vida ativo: saldos sao consumidos pelo orgao gerenciador e por caronas (orgaos aderentes). A Lei 14.133/2021 impoe limites rigorosos de adesao (Art. 86: ate 50% por orgao, ate 2x no total). Sem esse controle, o usuario nao sabe quanto saldo resta na ata nem se pode aceitar novas caronas.

**Impacto no sistema:**
- Novas tabelas: `arp_saldos` (10 campos) + `solicitacoes_carona` (10 campos)
- Nova aba na AtasPage: "Saldo ARP"
- Validacao de limites legais no backend
- Alertas de saldo baixo e vencimento de ARP

**Diferenca do roadmap original:**
O RF-035 original previa apenas 3 tools de IA para busca/extracao. Nenhuma mencao a gestao de saldos ou caronas.

---

### 7.4 RF-052-EXT-01: Alertas de Vencimento Multi-tier

**Base legal:** Boas praticas de gestao contratual sob a Lei 14.133/2021

**Por que foi adicionado:**
O sistema ja possui alertas basicos (modelo `Alerta` com 5 tipos: abertura, impugnacao, recursos, proposta, personalizado). Porem, na fase pos-licitacao, os vencimentos criticos mudam: agora sao contratos, ARPs, garantias e prazos de entrega. Os alertas existentes nao cobrem esses cenarios. Alem disso, a urgencia de um vencimento em 30 dias e diferente de 1 dia — o sistema precisa escalar canais conforme a proximidade.

**Impacto no sistema:**
- Extensao do Enum `tipo` no modelo `Alerta` (4 novos valores)
- Logica de escalacao multi-canal no scheduler (APScheduler)
- Painel de vencimentos na ContratadoRealizadoPage
- Configuracao de thresholds na ParametrizacoesPage

**Diferenca do roadmap original:**
O RF-052 original previa apenas "alertas automaticos para atrasos criticos" (criterio 2). A versao ampliada adiciona multi-tier, multi-canal e 4 tipos de vencimento.

---

## 8. Criterios de Aceite por Caso de Uso

### Casos de Uso — Follow-up

---

#### UC-FU01: Listar Editais Aguardando Resultado
1. Tabela carrega editais com status `submetido` do banco de dados
2. Cada linha exibe: numero do edital, orgao, valor estimado, dias desde submissao
3. Botao "Registrar Resultado" presente em cada linha
4. Filtros por periodo e orgao funcionais
5. Tabela vazia exibe mensagem "Nenhum edital aguardando resultado"

#### UC-FU02: Registrar Vitoria
1. Modal abre com campos especificos para vitoria (valor final, observacoes)
2. Ao confirmar, edital.status atualiza para `ganho`
3. Contrato criado automaticamente na tabela `contratos` com dados do edital
4. Notificacao de sucesso exibida ao usuario
5. Lead CRM NAO criado (apenas em derrota)

#### UC-FU03: Registrar Derrota
1. Modal abre com campos especificos para derrota (motivo, vencedor, valor vencedor)
2. Ao confirmar, edital.status atualiza para `perdido`
3. Lead CRM criado automaticamente com dados do orgao para reabordagem
4. Contrato NAO criado (apenas em vitoria)
5. Dados do vencedor salvos para inteligencia competitiva

#### UC-FU04: Configurar Alertas de Prazo
1. Botao "+ Novo Alerta" abre modal de configuracao
2. Campos: tipo, edital, dias antes, canais (email, push)
3. Alerta salvo e exibido na tabela de alertas
4. Alerta dispara no prazo configurado

---

### Casos de Uso — Atas

---

#### UC-AT01: Buscar Atas no PNCP
1. Campo de busca aceita termo, orgao ou CNPJ
2. Resultados exibidos em tabela com titulo, orgao, UF, ano, vigencia
3. Botao "Baixar" disponivel para cada resultado
4. Busca funciona via tool de IA (tool_buscar_atas_pncp)

#### UC-AT02: Extrair Dados de Ata PDF
1. Upload de PDF ou selecao de ata baixada
2. Botao "Extrair com IA" processa o documento
3. Resultados exibidos: tabela com itens, CATMAT, vencedor, preco, quantidade
4. Botao "Salvar" grava em atas_consultadas e preco_historico
5. Extracao funciona via tool de IA (tool_extrair_ata_pdf)

#### UC-AT03: Consultar Minhas Atas
1. Aba "Minhas Atas" lista todas as atas salvas pelo usuario
2. Filtros por orgao, ano, UF
3. Cada ata tem link para ver detalhes (itens extraidos)
4. Opcao de reextrair com IA

#### UC-AT04: Gerenciar Saldo ARP (NOVO)
1. Selecionar ata na aba "Minhas Atas" e clicar "Ver Saldo"
2. Tabela de saldos exibe: item, quantidade registrada, consumido participante, consumido carona, saldo
3. Registrar consumo (participante ou carona) com validacao de limites
4. Solicitacao de carona requer orgao, CNPJ e quantidade
5. Backend valida limites (50% individual, 2x global) e recusa se exceder

---

### Casos de Uso — Contratos

---

#### UC-CT01: Listar Contratos
1. Tabela carrega todos os contratos do usuario
2. Filtros por status (vigente, encerrado, rescindido, suspenso), orgao e periodo
3. Indicadores no topo: total, vigentes, a vencer, atrasados
4. Clicar em contrato abre painel de detalhe

#### UC-CT02: Registrar Entrega
1. No detalhe do contrato, sub-aba "Entregas" exibe entregas existentes
2. Botao "+ Registrar Entrega" abre modal
3. Campos: descricao, produto (select), quantidade, valor unitario, valor total (calculado), data prevista, nota fiscal, empenho
4. Ao salvar, entrega aparece na tabela com status "pendente"
5. Ao informar data_realizada, status muda para "entregue"

#### UC-CT03: Gestao de Aditivos (NOVO)
1. No detalhe do contrato, sub-aba "Aditivos" exibe aditivos existentes
2. Barra de progresso mostra percentual acumulado vs limite legal
3. Botao "+ Novo Aditivo" abre modal com campos obrigatorios
4. Validacao impede aditivo que exceda limite (25% geral, 50% reformas)
5. Alerta visual quando acumulado > 80% do limite
6. Transicao de status: rascunho -> aprovado -> publicado (irreversivel)

#### UC-CT04: Designar Gestor/Fiscal (NOVO)
1. No detalhe do contrato, sub-aba "Gestor/Fiscal" exibe designacoes ativas
2. Cards visuais com nome, cargo, portaria e vigencia
3. Botao "+ Designar" abre modal com tipo (gestor, fiscal tecnico, fiscal administrativo)
4. Alerta se contrato nao possui gestor e fiscal tecnico designados
5. Alerta se designacao vence sem substituto ativo

#### UC-CT05: Registrar Atividade Fiscal (NOVO)
1. Na sub-aba "Gestor/Fiscal", secao "Atividades de Fiscalizacao"
2. Botao "+ Registrar Atividade" abre modal
3. Campos: tipo (atesto, medicao, parecer, relatorio, vistoria), data, descricao, arquivo (upload)
4. Atividade salva e exibida na tabela cronologica
5. Arquivo acessivel para download posterior

---

### Casos de Uso — Dashboard

---

#### UC-DR01: Visualizar Contratado X Realizado
1. Pagina carrega dados via endpoint com periodo padrao de 6 meses
2. Stats cards exibem: total contratado, total realizado, variacao %, entregas no prazo %
3. Tabela comparativa exibe uma linha por contrato com barra de progresso
4. Desvio negativo exibido em vermelho, positivo em verde

#### UC-DR02: Filtrar Dashboard
1. Filtro de periodo (1m, 3m, 6m, 12m, tudo) atualiza dados em tempo real
2. Filtro de produto restringe a contratos com entregas daquele produto
3. Filtro de orgao restringe a contratos daquele orgao
4. Filtros cumulativos (podem ser combinados)

#### UC-DR03: Visualizar Atrasos
1. Secao "Atrasos" exibe entregas com data_prevista < hoje e status != entregue
2. Colunas: contrato, item, dias de atraso, valor em risco
3. Botao de acao disponivel para cada atraso

#### UC-DR04: Visualizar Proximos Vencimentos (NOVO)
1. Secao "Proximos Vencimentos" exibe itens com vencimento nos proximos 90 dias
2. Tipos: contrato, ARP, garantia, entrega
3. Cor por urgencia: verde (> 30d), amarelo (15-30d), laranja (7-15d), vermelho (< 7d)
4. Contagem regressiva em dias

---

## 9. Plano de Testes

### 9.1 Follow-up

| # | Cenario | Passos | Resultado Esperado |
|---|---------|--------|--------------------|
| T01 | Listar editais aguardando resultado | Login -> nav Follow-up -> verificar tabela | Tabela carrega editais com status submetido |
| T02 | Registrar vitoria | Selecionar edital -> Registrar -> Vitoria -> preencher -> Confirmar | Status muda para ganho, contrato criado |
| T03 | Registrar derrota | Selecionar edital -> Registrar -> Derrota -> preencher -> Confirmar | Status muda para perdido, lead CRM criado |
| T04 | Contrato auto-criado | Apos T02 -> nav Producao | Contrato aparece na tabela com dados do edital |
| T05 | Lead CRM auto-criado | Apos T03 -> nav CRM | Lead aparece com dados do orgao |

### 9.2 Atas

| # | Cenario | Passos | Resultado Esperado |
|---|---------|--------|--------------------|
| T06 | Buscar atas | Login -> nav Atas -> aba Buscar -> digitar termo -> Buscar | Resultados exibidos em tabela |
| T07 | Baixar ata | Selecionar ata -> Baixar | PDF baixado e disponivel na aba Extrair |
| T08 | Extrair PDF | Aba Extrair -> selecionar PDF -> Extrair com IA | Itens, vencedores e precos exibidos |
| T09 | Salvar ata | Apos extracao -> Salvar | Ata aparece em "Minhas Atas", precos em historico |
| T10 | Registrar consumo ARP | Aba Saldo ARP -> selecionar ata -> + Registrar Consumo | Saldo atualiza |
| T11 | Solicitar carona | Aba Saldo ARP -> + Solicitacao de Carona -> preencher | Carona registrada com status pendente |
| T12 | Validar limite carona | Solicitar carona > 50% do registrado | Sistema recusa com mensagem de erro |

### 9.3 Contratos

| # | Cenario | Passos | Resultado Esperado |
|---|---------|--------|--------------------|
| T13 | Listar contratos | Login -> nav Producao -> aba Contratos | Tabela carrega contratos do usuario |
| T14 | Criar contrato manual | + Novo Contrato -> preencher -> Salvar | Contrato aparece na tabela |
| T15 | Registrar entrega | Detalhe do contrato -> aba Entregas -> + Registrar -> preencher -> Salvar | Entrega aparece com status pendente |
| T16 | Confirmar entrega | Editar entrega -> informar data_realizada + NF -> Salvar | Status muda para entregue |
| T17 | Criar aditivo | Detalhe -> aba Aditivos -> + Novo Aditivo -> preencher | Aditivo criado, barra de progresso atualiza |
| T18 | Validar limite aditivo | Criar aditivo que exceda 25% | Sistema recusa com mensagem de limite |
| T19 | Designar fiscal | Detalhe -> aba Gestor/Fiscal -> + Designar -> preencher | Card de designacao exibido |
| T20 | Registrar atividade fiscal | + Registrar Atividade -> preencher + upload -> Salvar | Atividade na tabela com link para arquivo |

### 9.4 Dashboard Contratado X Realizado

| # | Cenario | Passos | Resultado Esperado |
|---|---------|--------|--------------------|
| T21 | Verificar totais | Login -> nav Contratado x Realizado | Stats cards com valores calculados |
| T22 | Filtrar por periodo | Alterar filtro para 3m | Dados recalculados para 3 meses |
| T23 | Verificar atrasos | Criar entrega atrasada -> verificar tabela | Entrega aparece na secao de atrasos |
| T24 | Verificar vencimentos | Criar contrato com fim em 15 dias -> verificar | Aparece na lista com cor amarela |
| T25 | Filtrar por produto | Selecionar produto no filtro | Apenas contratos com entregas do produto exibidos |

### 9.5 Alertas Multi-tier

| # | Cenario | Passos | Resultado Esperado |
|---|---------|--------|--------------------|
| T26 | Alerta 30d | Contrato com vencimento em 30 dias | Notificacao in-app criada |
| T27 | Alerta 15d | Contrato com vencimento em 15 dias | Notificacao + email enviado |
| T28 | Alerta 7d | Contrato com vencimento em 7 dias | Destaque na Dashboard |
| T29 | Alerta ARP | ARP com vigencia em 30 dias | Alerta criado com tipo arp_vencimento |
| T30 | Config thresholds | Parametrizacoes -> Alertas -> alterar threshold | Alertas futuros usam novo threshold |

---

## 10. Arquivos a Modificar

### Backend

| Arquivo | Alteracao | Entrega |
|---------|-----------|---------|
| `backend/models.py` | Novos models: ContratoAditivo, ContratoDesignacao, AtividadeFiscal, ARPSaldo, SolicitacaoCarona | 7, 8, 9 |
| `backend/models.py` | Extensao do Enum `tipo` em Alerta (4 novos valores) | 10 |
| `backend/tools.py` | Nova tool: tool_calcular_score_logistico | 2 |
| `backend/tools.py` | Novas tools: tool_buscar_atas_pncp, tool_baixar_ata_pncp, tool_extrair_ata_pdf | 3 |
| `backend/tools.py` | Extensao de tool_configurar_alertas (novos tipos) | 10 |
| `backend/app.py` | Novo endpoint: GET /api/dashboard/contratado-realizado | 5 |
| `backend/app.py` | Logica de auto-criacao de contrato/lead CRM ao registrar resultado | 1 |
| `backend/app.py` | Scheduler: verificacao diaria de vencimentos multi-tier | 10 |
| `backend/crud_routes.py` | Registro das novas tabelas no mapeamento CRUD generico | 7, 8, 9 |

### Frontend

| Arquivo | Alteracao | Entrega |
|---------|-----------|---------|
| `frontend/src/pages/FollowupPage.tsx` | Reescrita completa — remover mock, conectar a dados reais, modal de registro | 1 |
| `frontend/src/pages/AtasPage.tsx` | Pagina NOVA — 4 abas: Buscar, Extrair, Minhas Atas, Saldo ARP | 3, 9 |
| `frontend/src/pages/ProducaoPage.tsx` | Reescrita completa — remover mock, CRUD contratos/entregas, sub-abas Aditivos e Gestor/Fiscal | 4, 7, 8 |
| `frontend/src/pages/ContratadoRealizadoPage.tsx` | Reescrita completa — remover mock, dados do endpoint, atrasos, vencimentos | 6, 10 |
| `frontend/src/components/Sidebar.tsx` | Adicionar link para AtasPage na secao "Fluxo Comercial" | 3 |
| `frontend/src/App.tsx` | Import e roteamento de AtasPage | 3 |

---

## 11. Casos de Uso Relacionados

Os 15 casos de uso desta Sprint estao documentados em detalhe no arquivo `CASOS DE USO SPRINT5.md`:

### Follow-up (4 UCs)
- **UC-FU01:** Listar Editais Aguardando Resultado
- **UC-FU02:** Registrar Vitoria
- **UC-FU03:** Registrar Derrota
- **UC-FU04:** Configurar Alertas de Prazo

### Atas (4 UCs)
- **UC-AT01:** Buscar Atas no PNCP
- **UC-AT02:** Extrair Dados de Ata PDF
- **UC-AT03:** Consultar Minhas Atas
- **UC-AT04:** Gerenciar Saldo ARP (NOVO)

### Contratos (5 UCs)
- **UC-CT01:** Listar Contratos
- **UC-CT02:** Registrar Entrega
- **UC-CT03:** Gestao de Aditivos (NOVO)
- **UC-CT04:** Designar Gestor/Fiscal (NOVO)
- **UC-CT05:** Registrar Atividade Fiscal (NOVO)

### Dashboard (4 UCs — 1 novo)
- **UC-DR01:** Visualizar Contratado X Realizado
- **UC-DR02:** Filtrar Dashboard
- **UC-DR03:** Visualizar Atrasos
- **UC-DR04:** Visualizar Proximos Vencimentos (NOVO)

---

## 12. Resumo — O Que Foi Adicionado Alem do Roadmap Original

O roadmap original (`planejamento_sprints_completo.md`) previa **6 entregas** para a Sprint 5:

1. FollowupPage com registros de resultado (T24)
2. tool_calcular_score_logistico (T25)
3. AtasPage com 3 tools IA (T26)
4. ProducaoPage com CRUD contratos (T27)
5. Endpoint contratado-realizado (T29)
6. ContratadoRealizadoPage com dashboard (T28)

Apos pesquisa sobre a **Lei 14.133/2021**, foram adicionadas **4 entregas novas**:

| # | Entrega Nova | Fundamentacao | Tabelas | UCs |
|---|--------------|---------------|---------|-----|
| 7 | Gestao de Aditivos | Art. 124-126 | contrato_aditivos | UC-CT03 |
| 8 | Designacao Gestor/Fiscal | Art. 117 | contrato_designacoes, atividades_fiscais | UC-CT04, UC-CT05 |
| 9 | Saldo ARP / Carona | Art. 82-86 | arp_saldos, solicitacoes_carona | UC-AT04 |
| 10 | Alertas Multi-tier | Boas praticas | extensao do Alerta | UC-DR04 |

**Impacto quantitativo:**

| Metrica | Roadmap Original | Com Pesquisa Lei 14.133 | Delta |
|---------|-----------------|------------------------|-------|
| Entregas | 6 | 10 | +4 |
| Tabelas novas | 0 | 5 | +5 |
| Casos de uso | 11 | 15 | +4 |
| Cenarios de teste | 20 | 30 | +10 |
| Requisitos funcionais | 6 (RF-017, RF-011, RF-035, RF-046, RF-051, RF-052) | 10 (+ 4 EXT) | +4 |

As 4 entregas adicionais garantem conformidade com a legislacao vigente e cobrem aspectos operacionais criticos que o roadmap original tratava apenas superficialmente — especialmente a gestao contratual pos-assinatura, que e onde a maioria dos riscos juridicos e financeiros se materializa.

---

*Documento gerado em 27/03/2026. Versao 1.0.*
