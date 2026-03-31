# Relatório de Implementação — FASE 1 PRECIFICAÇÃO

**Data:** 20/03/2026
**Base:** CASOS DE USO PRECIFICACAO E PROPOSTA.md (UC-P01 a UC-P10)

---

## Resumo Geral

| UC | Nome | Status | Backend | Frontend |
|----|------|--------|---------|----------|
| UC-P01 | Organizar Edital por Lotes | ✅ Implementado | `tool_organizar_lotes` | Aba "Lotes" |
| UC-P02 | Seleção Inteligente de Portfolio | ✅ Implementado | `tool_selecao_portfolio` | Aba "Lotes" (botão vincular) |
| UC-P03 | Cálculo Técnico de Volumetria | ✅ Implementado | `tool_calcular_volumetria` | Aba "Camadas" (seção volumetria) |
| UC-P04 | Configurar Base de Custos | ✅ Implementado | `tool_configurar_custos` | Aba "Camadas" (Camada A) |
| UC-P05 | Montar Preço Base (Camada B) | ✅ Implementado | `tool_montar_preco_base` | Aba "Camadas" (Camada B) |
| UC-P06 | Definir Valor de Referência (Camada C) | ✅ Implementado | `tool_definir_referencia` | Aba "Camadas" (Camada C) |
| UC-P07 | Estruturar Lances (Camadas D e E) | ✅ Implementado | `tool_estruturar_lances` | Aba "Lances" (Camadas D+E) |
| UC-P08 | Definir Estratégia Competitiva | ✅ Implementado | `tool_estrategia_competitiva` | Aba "Lances" (seção estratégia) |
| UC-P09 | Consultar Histórico de Preços (Camada F) | ✅ Implementado | `tool_historico_precos_camada_f` | Aba "Histórico" |
| UC-P10 | Gestão de Comodato | ✅ Implementado | `tool_gestao_comodato` | Aba "Histórico" (seção comodato) |

---

## Arquivos Modificados

| Arquivo | O que foi feito |
|---------|-----------------|
| `backend/models.py` | 6 novos modelos: `Lote`, `LoteItem`, `EditalItemProduto`, `PrecoCamada`, `Lance`, `Comodato`. Colunas extras em `EstrategiaEdital` (7 cols) e `ParametroScore` (6 cols) |
| `backend/tools.py` | 10 novas tools (linhas 8391-9248) registradas em `TOOLS_MAP` |
| `backend/app.py` | 10 novas intenções no `PROMPT_CLASSIFICAR_INTENCAO`, 10 handlers `processar_precif_*`, 10 blocos `elif` no dispatch |
| `backend/crud_routes.py` | 6 novos registros CRUD: `lotes`, `lote-itens`, `edital-item-produto`, `preco-camadas`, `lances`, `comodatos` |
| `frontend/src/pages/PrecificacaoPage.tsx` | Reescrita completa com 4 abas (Lotes, Camadas, Lances, Histórico) |
| `frontend/src/config/crudTables.tsx` | Configuração CRUD para as 6 novas tabelas |

---

## Detalhamento por Caso de Uso

---

### UC-P01 — Organizar Edital por Lotes

**RF relacionado:** RF-039-01

**O que foi implementado:**
- **Modelo `Lote`** (`models.py:2054`): campos `edital_id`, `numero_lote`, `nome`, `especialidade`, `descricao`, `valor_estimado`, `tipo_amostra`, `volume_exigido`, `equipamento_exigido`, `observacoes_tecnicas`, `status`
- **Modelo `LoteItem`** (`models.py:2092`): vínculo N:N entre Lote e EditalItem (`lote_id`, `edital_item_id`, `ordem`)
- **Tool `tool_organizar_lotes`** (`tools.py:8391`): recebe `edital_id`, busca itens do edital, agrupa automaticamente por categoria/descrição e cria lotes com itens vinculados
- **Handler `processar_precif_organizar_lotes`** (`app.py:7003`): extrai edital_id da mensagem do chat, chama a tool
- **Frontend — Aba "Lotes"** (`PrecificacaoPage.tsx`):
  - SelectInput para escolher edital (todos os editais, sem filtro de status)
  - Tabela de lotes com colunas: Lote, Nome, Especialidade, Itens, Valor Est., Status
  - Botão "Criar Lotes" que agrupa itens existentes do edital em um lote
  - Botão excluir lote (ícone lixeira)
  - Exibição dos itens vinculados a cada lote
  - Botão vincular produto (ícone Target) em cada item do lote

**O que NÃO foi implementado (vs documento):**
- Campos P01-F07 a P01-F14 (Especialidade, Descrição, Tipo Amostra, Volume Exigido, Equipamento Exigido, Observações) existem no modelo mas não têm formulário de edição inline na UI — são preenchidos via chat/tool
- Botão "Importar do PNCP" (P01-F03) foi substituído por "Criar Lotes" — importação de itens deve ser feita na fase de Captação/Validação (RF-031)
- Painel de detalhes expandível do lote (P01-F09 a P01-F15) não existe como card separado

**Como testar:**
1. Acessar PrecificacaoPage
2. Selecionar um edital que tenha itens importados (via CaptacaoPage)
3. Clicar "Criar Lotes" — sistema agrupa todos os itens em um lote
4. Verificar que o lote aparece na tabela com nome, valor e status
5. Testar exclusão do lote (ícone lixeira)
6. Via chat: enviar "organizar lotes do edital {id}" — IA classifica como `precif_organizar_lotes` e chama tool

---

### UC-P02 — Seleção Inteligente de Portfolio (Agente Assistido)

**RF relacionado:** RF-039-07

**O que foi implementado:**
- **Modelo `EditalItemProduto`** (`models.py:2115`): vínculo item↔produto com campos `edital_item_id`, `produto_id`, `match_score`, `match_justificativa`, `parametros_obrigatorios` (JSON), `validado_usuario`, `fonte_sugestao`
- **Tool `tool_selecao_portfolio`** (`tools.py:8575`): recebe `edital_item_id`, busca o item, consulta produtos cadastrados, usa IA para calcular match % e justificativa, cria registro `EditalItemProduto`
- **Handler `processar_precif_selecao_portfolio`** (`app.py:7033`): extrai item_id da mensagem, chama tool
- **Frontend**: botão de vincular produto (ícone Target) em cada item da tabela de lotes

**O que NÃO foi implementado (vs documento):**
- Modal de Seleção Inteligente com layout lado-a-lado (P02-F01 a P02-F08) — não existe modal visual; vinculação é feita via chat ou botão simples
- Badge Match % colorido (P02-F03) — match_score existe no modelo mas não é exibido visualmente
- Lista de parâmetros obrigatórios destacados (P02-F04)
- Alerta de ação humana (P02-F05)
- Botão Re-analisar (P02-F07)

**Como testar:**
1. Na aba Lotes, com lote criado, verificar que itens mostram ícone de vincular
2. Via chat: enviar "selecionar portfolio para item {item_id}" — IA sugere produtos com match %
3. Verificar no banco que tabela `edital_item_produto` tem registro com `match_score` e `match_justificativa`

---

### UC-P03 — Cálculo Técnico de Volumetria

**RF relacionado:** RF-039-02

**O que foi implementado:**
- **Campos em `PrecoCamada`** (`models.py:2166`): `volume_edital`, `repeticoes_amostras`, `repeticoes_calibradores`, `repeticoes_controles`, `rendimento_kit`, `qtd_kits_calculada`, `volume_real_ajustado`
- **Tool `tool_calcular_volumetria`** (`tools.py:8676`): fórmula `ceil((volume + rep_amostras + rep_calibradores + rep_controles) / rendimento)`, salva resultado em `PrecoCamada` tipo "A"
- **Handler `processar_precif_calcular_volumetria`** (`app.py:7056`): extrai parâmetros da mensagem, chama tool
- **Frontend — Aba "Camadas"**: seção Camada A com campos de volumetria (volume edital, repetições, rendimento) e exibição do resultado

**O que NÃO foi implementado (vs documento):**
- Formulário completo com NumberInputs editáveis (P03-F03 a P03-F07) — campos são preenchidos via chat, não via formulário interativo
- Botão "Calcular" inline (P03-F08) — cálculo é feito pela tool via chat
- Display da fórmula aplicada (P03-F11)
- Pré-preenchimento automático do rendimento do portfolio (P03-F07)

**Como testar:**
1. Vincular um produto a um item (UC-P02)
2. Na aba Camadas, selecionar o vínculo item-produto
3. Via chat: "calcular volumetria: volume 50000, repetições amostras 2, calibradores 3, controles 2, rendimento 500"
4. Resultado esperado: Volume Ajustado = 50007, Kits = 101
5. Verificar que `PrecoCamada` tipo "A" tem `qtd_kits_calculada = 101`

---

### UC-P04 — Configurar Base de Custos (ERP + Tributário)

**RF relacionado:** RF-039-03 + RF-039-04

**O que foi implementado:**
- **Campos em `PrecoCamada`** (`models.py:2166`): `custo_unitario`, `custo_total`, `icms_percentual`, `ipi_percentual`, `pis_percentual`, `cofins_percentual`, `ncm`, `isencao_icms`
- **Campos em `ParametroScore`**: `icms_padrao`, `pis_cofins`, `ipi_padrao`, `custo_logistica_percentual`, `margem_contribuicao_min`, `ncm_isencao_icms`
- **Tool `tool_configurar_custos`** (`tools.py:8737`): recebe custo unitário, verifica NCM do produto, aplica isenção automática de ICMS se NCM começa com "3822" (reagentes diagnósticos — Convênio ICMS 100/97), calcula custo total com tributos, salva em `PrecoCamada` tipo "A"
- **Handler `processar_precif_configurar_custos`** (`app.py:7087`): extrai parâmetros, chama tool
- **Frontend**: seção Camada A exibe custo, NCM, alíquotas e badge de isenção

**O que NÃO foi implementado (vs documento):**
- Botão "Importar do ERP" (P04-F01) — não há integração ERP real, custos são informados manualmente
- Formulário com NumberInputs editáveis para alíquotas (P04-F05 a P04-F08) — preenchimento via chat
- Badge visual de isenção (P04-F04) — lógica existe no backend mas sem badge colorido na UI

**Como testar:**
1. Ter produto com NCM cadastrado (ex: "3822.00.90")
2. Via chat: "configurar custos do item-produto {id}, custo unitário 85"
3. Verificar que ICMS foi zerado automaticamente (isenção NCM 3822)
4. Verificar que PIS (1.65%) e COFINS (7.60%) foram aplicados com valores padrão
5. Testar com NCM diferente (ex: "9027") — ICMS deve manter alíquota padrão

---

### UC-P05 — Montar Preço Base (Camada B)

**RF relacionado:** RF-039-08

**O que foi implementado:**
- **Campos em `PrecoCamada`**: `valor_unitario`, `markup_percentual`, `modo_input` (manual/custo_markup/upload), `reutilizar`
- **Tool `tool_montar_preco_base`** (`tools.py:8824`): 3 modos — manual (valor direto), custo+markup (custo × (1 + markup/100)), upload. Calcula markup reverso se modo manual. Salva `PrecoCamada` tipo "B"
- **Handler `processar_precif_preco_base`** (`app.py:7117`): extrai modo e valores, chama tool
- **Frontend**: seção Camada B na aba Camadas com campos de preço e markup

**O que NÃO foi implementado (vs documento):**
- RadioGroup para modo de input (P05-F01) — seleção via chat, não via radio buttons
- Upload de tabela de preços (P05-F03) — modo "upload" existe na tool mas sem FileInput na UI
- Checkbox "Reutilizar" (P05-F06) — campo existe no modelo mas sem checkbox na UI

**Como testar:**
1. Ter Camada A configurada (UC-P04)
2. Via chat: "montar preço base: modo custo_markup, markup 76.47%"
3. Se custo era R$ 85,00: preço base = 85 × 1.7647 = R$ 150,00
4. Alternativo: "preço base manual: R$ 150,00"
5. Verificar `PrecoCamada` tipo "B" com `valor_unitario = 150` e `markup_percentual = 76.47`

---

### UC-P06 — Definir Valor de Referência (Camada C)

**RF relacionado:** RF-039-09

**O que foi implementado:**
- **Campos em `PrecoCamada`**: `valor_unitario`, `percentual_sobre_base`, `margem_sobre_custo`
- **Tool `tool_definir_referencia`** (`tools.py:8882`): busca `valor_referencia` do edital; se disponível, usa como target; senão, calcula como % do preço base (Camada B). Calcula margem sobre custo (Camada A). Salva `PrecoCamada` tipo "C"
- **Handler `processar_precif_valor_referencia`** (`app.py:7158`): extrai parâmetros, chama tool
- **Frontend**: seção Camada C na aba Camadas com comparativo A/B/C

**O que NÃO foi implementado (vs documento):**
- Badge de disponibilidade do valor referência (P06-F01) — lógica existe mas sem badge visual
- Comparativo visual lado a lado (P06-F05) — dados retornados pela tool mas sem layout dedicado
- Recálculo em tempo real ao ajustar percentual (P06-F04)

**Como testar:**
1. Ter Camadas A e B configuradas
2. Via chat: "definir referência: 95% sobre preço base"
3. Se preço base = R$ 150,00: target = R$ 142,50
4. Margem sobre custo calculada: (142.50 - 85) / 85 = 67.6%
5. Se edital tem `valor_referencia` preenchido: tool usa esse valor diretamente
6. Verificar `PrecoCamada` tipo "C"

---

### UC-P07 — Estruturar Lances (Camadas D e E)

**RF relacionado:** RF-039-10

**O que foi implementado:**
- **Modelo `Lance`** (`models.py:2262`): campos `edital_item_produto_id`, `valor_inicial`, `valor_minimo`, `desconto_inicial_pct`, `desconto_maximo_pct`, `margem_minima_pct`, `faixa_disputa`, `modo_inicial` (absoluto/percentual), `modo_minimo`
- **Tool `tool_estruturar_lances`** (`tools.py:8944`): recebe valor inicial e mínimo (ou descontos %), calcula faixa de disputa, margem mínima sobre custo. Valida que mínimo < inicial. Salva registro `Lance`
- **Handler `processar_precif_estruturar_lances`** (`app.py:7195`): extrai valores, chama tool
- **Frontend — Aba "Lances"**: card "Estrutura de Lances" com campos para Camada D (valor inicial) e Camada E (valor mínimo), botão "Salvar Lances"

**O que NÃO foi implementado (vs documento):**
- RadioGroup para modo absoluto/percentual (P07-F01, P07-F04) — seleção via chat
- Barra visual horizontal de resumo (P07-F07) mostrando todas as camadas — não existe
- Cálculo automático recíproco (preencher valor → calcula %, e vice-versa) — feito na tool, não em tempo real na UI
- Validações inline (mínimo >= inicial, mínimo < custo) — validação na tool

**Como testar:**
1. Ter Camadas A, B, C configuradas
2. Na aba Lances, preencher valor inicial (ex: 145) e valor mínimo (ex: 95)
3. Clicar "Salvar Lances" — grava registro `Lance`
4. Via chat: "estruturar lances: inicial R$ 145, mínimo R$ 95"
5. Verificar: faixa de disputa = R$ 50, margem mínima = (95-85)/85 = 11.8%
6. Testar validação: se mínimo >= inicial, tool retorna erro

---

### UC-P08 — Definir Estratégia Competitiva

**RF relacionado:** RF-039-11

**O que foi implementado:**
- **Campos em `EstrategiaEdital`** (`models.py`): `perfil_competitivo` (quero_ganhar / nao_ganhei_no_minimo), `margem_minima`, `margem_maxima`, `desconto_maximo`, `priorizar_volume`, `notas_estrategia`, `cenarios_simulados` (JSON)
- **Tool `tool_estrategia_competitiva`** (`tools.py:9014`): recebe perfil competitivo, salva estratégia. Se solicitado, gera 3 cenários simulados com IA (ganho agressivo, empate no mínimo, perda). Atualiza `EstrategiaEdital`
- **Handler `processar_precif_estrategia`** (`app.py:7229`): extrai estratégia e parâmetros, chama tool
- **Frontend — Aba "Lances"**: seção de estratégia competitiva com radio cards "Quero Ganhar" e "Não Ganhei no Mínimo", campo de notas, botão "Salvar Estratégia"

**O que NÃO foi implementado (vs documento):**
- Botão "Simular Disputa" (P08-F02) — simulação via chat, não via botão na UI
- Lista de cenários visual (P08-F03) — cenários salvos no JSON mas sem renderização na UI
- Cards visuais com descrição detalhada de cada estratégia (P08-F01) — radio buttons simples

**Como testar:**
1. Na aba Lances, selecionar "Quero Ganhar" ou "Não Ganhei no Mínimo"
2. Preencher notas de estratégia (opcional)
3. Clicar "Salvar Estratégia"
4. Via chat: "definir estratégia competitiva: quero ganhar, margem mínima 10%"
5. Via chat: "simular disputa para edital {id}" — gera 3 cenários
6. Verificar `EstrategiaEdital` com `perfil_competitivo` e `cenarios_simulados`

---

### UC-P09 — Consultar Histórico de Preços (Camada F)

**RF relacionado:** RF-039-12

**O que foi implementado:**
- **Tool `tool_historico_precos_camada_f`** (`tools.py:9162`): busca preços históricos do PNCP para o produto vinculado, calcula estatísticas (média, mín, máx), retorna dados formatados. Salva referência em `PrecoCamada` tipo "F"
- **Handler `processar_precif_historico_camada_f`** (`app.py:7266`): extrai produto/termo, chama tool
- **Frontend — Aba "Histórico"**: campo de busca por produto/termo, botão "Filtrar", tabela de resultados com colunas (Data, Órgão, Produto, Valor, Resultado), estatísticas (média/mín/máx), botão "Exportar CSV"

**O que NÃO foi implementado (vs documento):**
- Filtros avançados por órgão (P09-F02), data de/até (P09-F03/F04), margem (P09-F05) — apenas filtro por texto
- Gráfico SVG de evolução temporal (P09-F08) — não implementado nesta versão
- Coluna "Nosso Preço" e resultado ganho/perdido (P09-F09) — dados parciais

**Como testar:**
1. Ir à aba "Histórico"
2. Digitar termo de busca (ex: "hemograma", "reagente")
3. Clicar "Filtrar" — sistema busca no PNCP via tool
4. Verificar tabela com resultados históricos
5. Verificar estatísticas (média, mín, máx)
6. Clicar "Exportar CSV" — verifica download
7. Via chat: "consultar histórico de preços para hemograma"

---

### UC-P10 — Gestão de Comodato

**RF relacionado:** RF-039-13

**O que foi implementado:**
- **Modelo `Comodato`** (`models.py:2295`): campos `edital_id`, `equipamento`, `valor_equipamento`, `prazo_contrato_meses`, `valor_mensal_amortizacao` (calculado), `condicoes_especiais`, `status`
- **Tool `tool_gestao_comodato`** (`tools.py:9162`): recebe dados do comodato, calcula amortização mensal (`valor / prazo`), salva registro
- **Handler `processar_precif_comodato`** (`app.py:7298`): extrai dados, chama tool
- **Frontend — Aba "Histórico"**: seção de comodato com campos para equipamento, valor, prazo e cálculo de amortização
- **CRUD**: `/api/crud/comodatos` disponível

**O que NÃO foi implementado (vs documento):**
- Card visual dedicado com badge "Processo manual" (layout do documento) — implementação simplificada
- Campo de condições especiais com TextArea (P10-F05) — campo existe no modelo mas formulário simplificado na UI

**Como testar:**
1. Na seção de comodato (aba Histórico)
2. Via chat: "registrar comodato: equipamento Analisador XYZ-3000, valor R$ 250.000, prazo 60 meses"
3. Resultado esperado: amortização mensal = R$ 4.166,67
4. Verificar registro na tabela `comodatos`
5. Via CRUD: `GET /api/crud/comodatos?parent_id={edital_id}`

---

## Modelos de Dados Criados

### Tabelas Novas (6)

| Tabela | Modelo | Campos Principais |
|--------|--------|-------------------|
| `lotes` | `Lote` | edital_id, numero_lote, nome, especialidade, valor_estimado, status |
| `lotes_itens` | `LoteItem` | lote_id, edital_item_id, ordem |
| `edital_item_produto` | `EditalItemProduto` | edital_item_id, produto_id, match_score, match_justificativa, validado_usuario |
| `preco_camadas` | `PrecoCamada` | edital_item_produto_id, tipo (A-F), valor_unitario, custo_unitario, markup, volumetria, tributos |
| `lances` | `Lance` | edital_item_produto_id, valor_inicial, valor_minimo, margem_minima, faixa_disputa |
| `comodatos` | `Comodato` | edital_id, equipamento, valor_equipamento, prazo_contrato_meses, valor_mensal_amortizacao |

### Colunas Adicionadas em Tabelas Existentes

| Tabela | Colunas Adicionadas |
|--------|---------------------|
| `estrategias_editais` | perfil_competitivo, margem_minima, margem_maxima, desconto_maximo, priorizar_volume, notas_estrategia, cenarios_simulados |
| `parametros_score` | icms_padrao, pis_cofins, ipi_padrao, custo_logistica_percentual, margem_contribuicao_min, ncm_isencao_icms |

---

## Integração com Chat (IA)

Cada UC tem uma intenção registrada no `PROMPT_CLASSIFICAR_INTENCAO` de `app.py`:

| Intenção | UC | Exemplos de prompt do usuário |
|----------|-----|-------------------------------|
| `precif_organizar_lotes` | UC-P01 | "organizar lotes", "criar lotes do edital" |
| `precif_selecao_portfolio` | UC-P02 | "selecionar portfolio", "vincular produtos ao item" |
| `precif_calcular_volumetria` | UC-P03 | "calcular volumetria", "quantos kits preciso" |
| `precif_configurar_custos` | UC-P04 | "configurar custos", "definir custo base" |
| `precif_preco_base` | UC-P05 | "montar preço base", "definir markup" |
| `precif_valor_referencia` | UC-P06 | "definir referência", "qual o target" |
| `precif_estruturar_lances` | UC-P07 | "estruturar lances", "definir valor inicial e mínimo" |
| `precif_estrategia` | UC-P08 | "definir estratégia", "quero ganhar" |
| `precif_historico_camada_f` | UC-P09 | "consultar histórico de preços", "preços anteriores" |
| `precif_comodato` | UC-P10 | "registrar comodato", "calcular amortização" |

---

## Pré-requisitos para Testes End-to-End

1. **Edital com itens importados** — usar CaptacaoPage para buscar e salvar edital com itens do PNCP
2. **Produtos cadastrados** — ter pelo menos 1 produto no portfolio com NCM preenchido
3. **Fluxo sequencial recomendado:**
   - UC-P01 (criar lotes) → UC-P02 (vincular produtos) → UC-P03 (volumetria) → UC-P04 (custos) → UC-P05 (preço base) → UC-P06 (referência) → UC-P07 (lances) → UC-P08 (estratégia)
   - UC-P09 (histórico) e UC-P10 (comodato) são independentes

---

## Lacunas Conhecidas (para sprints futuras)

| Item | Descrição |
|------|-----------|
| UI interativa | Formulários com NumberInputs editáveis em cada camada (hoje preenchimento via chat) |
| Modal de Seleção Inteligente | Layout lado-a-lado item vs produto com badge match % |
| Barra visual de camadas | Gráfico horizontal mostrando A→B→C→D→E posicionados |
| Integração ERP | Botão "Importar do ERP" para buscar custo real |
| Gráfico de evolução | SVG com linha temporal de preços históricos |
| Filtros avançados histórico | Filtros por órgão, data, margem |
| Upload tabela de preços | FileInput para .csv/.xlsx no modo Upload da Camada B |
