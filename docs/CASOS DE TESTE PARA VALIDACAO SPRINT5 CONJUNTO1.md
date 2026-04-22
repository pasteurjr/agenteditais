# CASOS DE TESTE PARA VALIDACAO — SPRINT 5 — CONJUNTO 1 (CH Hospitalar)

**Data:** 21/04/2026
**Versao:** 1.0
**Empresa de teste:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Dados de apoio:** `docs/tutorialsprint5-1.md` / `docs/dadossprint5-1.md`
**Referencia de UCs:** `docs/CASOS DE USO SPRINT5 V5.md`
**Ambiente:** Backend porta 5007 / Frontend porta 5179
**Seed:** `python backend/seeds/sprint5_seed.py`
**Credenciais:** valida1@valida.com.br / 123456 / Empresa: CH Hospitalar
**Total de UCs cobertos:** 26 (15 implementados + 11 nao implementados)

---

## Convencoes

- **ID:** CT-{UC}-{numero} (ex: CT-FU01-01)
- **Tipo:** Positivo (fluxo principal), Negativo (fluxo de excecao), Limite (condicao de contorno/fluxo alternativo)
- Todos os dados sao extraidos dos tutoriais de validacao; nenhum dado inventado
- Para UCs nao implementados (UC-CT07 a UC-CT10, UC-CRM01 a UC-CRM07), os testes descrevem o comportamento esperado conforme especificacao

---

## FASE 1 — FOLLOW-UP

---

### UC-FU01 — Registrar Resultado (Vitoria/Derrota)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-FU01-01 | Registrar resultado de vitoria (ganho) em edital com proposta submetida | Usuario logado como valida1@valida.com.br na empresa CH Hospitalar. Seed Sprint 5 executada. Edital com proposta submetida existente | 1. Sidebar -> Followup. 2. Na aba "Resultados", localizar edital com proposta submetida. 3. Clicar "Registrar" na coluna Acao. 4. No modal, selecionar radio "Vitoria". 5. Preencher "Valor Final (R$)". 6. Clicar "Registrar" | Modal fecha. Edital move da tabela "Editais Pendentes" para "Resultados Registrados" com badge "Vitoria" (verde #16a34a). Stat Cards "Vitorias" e "Taxa de Sucesso" recalculam | Positivo |
| CT-FU01-02 | Registrar resultado de derrota com motivo "preco nao competitivo" | Usuario logado. Edital com proposta submetida existente | 1. Sidebar -> Followup. 2. Localizar edital pendente. 3. Clicar "Registrar". 4. Selecionar radio "Derrota". 5. Preencher "Valor Final (R$)". 6. Preencher "Empresa Vencedora". 7. Selecionar motivo "Preco" no select "Motivo da Derrota". 8. Clicar "Registrar" | Modal fecha. Edital aparece em "Resultados Registrados" com badge "Derrota" (vermelho #dc2626). Stat Cards "Derrotas" incrementa e "Taxa de Sucesso" recalcula | Positivo |
| CT-FU01-03 | Registrar resultado "Cancelado" pelo orgao (FA-01) | Usuario logado. Edital com proposta submetida existente | 1. Sidebar -> Followup. 2. Localizar edital pendente. 3. Clicar "Registrar". 4. Selecionar radio "Cancelado". 5. Preencher "Justificativa do Cancelamento" com texto descritivo. 6. Clicar "Registrar" | Modal fecha. Edital aparece em "Resultados Registrados" com badge "Cancelado" (cinza #6b7280). Stat Cards nao contabilizam como vitoria nem derrota | Limite |
| CT-FU01-04 | Tentar registrar resultado sem preencher campos obrigatorios (FE-02) | Usuario logado. Edital pendente visivel | 1. Sidebar -> Followup. 2. Clicar "Registrar" no edital. 3. Selecionar radio "Vitoria". 4. Deixar campo "Valor Final (R$)" vazio. 5. Clicar "Registrar" | Sistema exibe mensagem de validacao inline. Modal nao fecha. Dados preservados | Negativo |
| CT-FU01-05 | Verificar estado vazio — nenhum edital pendente de resultado (FE-01) | Usuario logado. Nenhum edital com status "submetido" no banco | 1. Sidebar -> Followup. 2. Verificar aba "Resultados" | Tabela "Editais Pendentes" vazia. Mensagem "Nenhum edital pendente de resultado" exibida. Nenhum botao "Registrar" disponivel | Negativo |

---

### UC-FU02 — Configurar Alertas de Prazo

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-FU02-01 | Visualizar alertas de vencimento de contratos e ARPs | Usuario logado. Contratos e ARPs cadastrados com datas de vencimento via seed | 1. Sidebar -> Followup. 2. Clicar na aba "Alertas" | Summary Cards exibem 5 contadores: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d). Tabela "Proximos Vencimentos" carrega com colunas: Tipo (badge), Nome, Data, Dias, Urgencia (badge) | Positivo |
| CT-FU02-02 | Atualizar dados de vencimentos via botao "Atualizar" (FA-03) | Usuario logado. Aba "Alertas" carregada | 1. Na aba "Alertas", clicar botao "Atualizar" | Dados sao recarregados do backend. Tabela e Summary Cards atualizam refletindo dados correntes | Limite |
| CT-FU02-03 | Verificar estado vazio — nenhum vencimento nos proximos 90 dias (FA-01) | Usuario logado. Nenhum contrato ou ARP com vencimento nos proximos 90 dias | 1. Aba "Alertas" | Summary Cards todos zerados. Mensagem "Nenhum vencimento nos proximos 90 dias" exibida | Negativo |

---

### UC-FU03 — Score Logistico

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-FU03-01 | Verificar calculo e exibicao do score logistico | Usuario logado. Parametros logisticos configurados. Edital com dados de entrega | 1. Sidebar -> Followup. 2. Verificar area de Stat Cards | Card "Score Logistico" exibe valor numerico com componentes detalhados (distancia, prazo, capacidade) | Positivo |
| CT-FU03-02 | Score logistico com API indisponivel (FE-01) | Usuario logado. API `/api/score-logistico` indisponivel | 1. Sidebar -> Followup | Card "Score Logistico" exibe "N/A" no lugar do valor numerico. Demais Stat Cards funcionam normalmente | Negativo |

---

## FASE 2 — ATAS DE PREGAO

---

### UC-AT01 — Buscar Atas no PNCP

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-AT01-01 | Buscar atas no PNCP com termo valido | Usuario logado. Backend e API PNCP operacionais | 1. Sidebar -> Atas. 2. Na aba "Buscar", digitar "reagentes" no campo "Termo de busca". 3. Clicar "Buscar" | Botao muda para "Buscando..." com loader. Tabela de resultados exibe atas com colunas: Titulo, Orgao, UF, Publicacao, Acoes (Salvar/Extrair) | Positivo |
| CT-AT01-02 | Salvar ata encontrada na busca | Usuario logado. Busca realizada com resultados visiveis | 1. Na tabela de resultados, clicar "Salvar" em uma ata | Ata inserida em atas_consultadas. Toast de confirmacao exibido | Positivo |
| CT-AT01-03 | Tentar buscar com termo menor que 3 caracteres (FE-01) | Usuario logado. Aba "Buscar" ativa | 1. Digitar "re" (2 caracteres) no campo de busca. 2. Observar estado do botao "Buscar" | Botao "Buscar" permanece desabilitado. Nenhuma requisicao disparada | Negativo |
| CT-AT01-04 | Buscar atas filtradas por UF (FA-02) | Usuario logado | 1. Digitar "reagentes" no campo de busca. 2. Selecionar UF "SP" no select. 3. Clicar "Buscar" | Resultados filtrados apenas para atas do estado de SP | Limite |
| CT-AT01-05 | Salvar ata ja existente (FA-03) | Usuario logado. Ata ja salva anteriormente | 1. Realizar busca. 2. Clicar "Salvar" em ata ja salva | Toast informativo "Ata ja salva anteriormente" exibido. Registro nao duplicado | Limite |

---

### UC-AT02 — Extrair Resultados de Ata PDF

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-AT02-01 | Extrair itens de ata via URL do PNCP | Usuario logado. URL de ata PNCP disponivel | 1. Clicar aba "Extrair". 2. Preencher campo "URL da ata" com URL valida. 3. Clicar "Extrair Dados" | Botao muda para "Extraindo..." com loader. Tabela "Itens Extraidos (N)" exibe resultados com colunas: Descricao, Vencedor, Valor Unit., Qtd | Positivo |
| CT-AT02-02 | Extrair itens via texto colado (FA-01) | Usuario logado | 1. Aba "Extrair". 2. Colar texto da ata no campo "Ou cole o texto da ata aqui". 3. Clicar "Extrair Dados" | Tabela "Itens Extraidos" exibe resultados extraidos do texto colado | Limite |
| CT-AT02-03 | Tentar extrair com ambos os campos vazios (FE-02) | Usuario logado. Aba "Extrair" ativa | 1. Deixar campo URL e campo texto ambos vazios. 2. Observar botao "Extrair Dados" | Botao "Extrair Dados" permanece desabilitado. Nenhuma acao disparada | Negativo |

---

### UC-AT03 — Dashboard de Atas Consultadas

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-AT03-01 | Verificar dashboard com atas consultadas (>=5 atas) | Usuario logado. Seed executada com >= 5 atas salvas | 1. Sidebar -> Atas. 2. Clicar aba "Minhas Atas" | Stat Cards exibem: Total (>=5), Vigentes, Vencidas. Tabela mostra atas com colunas: Titulo, Orgao, UF, Vigencia (badge colorido com dias restantes ou "Vencida ha Xd") | Positivo |
| CT-AT03-02 | Verificar badges de vigencia — ata vigente vs vencida | Usuario logado. Atas com diferentes datas de vigencia | 1. Na aba "Minhas Atas", verificar coluna "Vigencia" | Atas vigentes: badge verde (#dcfce7) com texto "{dias}d restantes". Atas vencidas: badge vermelho (#fee2e2) com texto "Vencida ha {dias}d" | Positivo |

---

### UC-CT06 — Saldo de ARP / Controle de Carona

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT06-01 | Verificar saldos ARP (2 saldos listados) | Usuario logado. Seed com saldos ARP populados | 1. Sidebar -> Atas. 2. Clicar aba "Saldo ARP". 3. Selecionar ARP no select | Card "Saldos por Item" exibe tabela com 2 saldos. Colunas: Item, Qtd Registrada, Consumo Part., Consumo Carona, Saldo, % Consumido (com ProgressBar colorida) | Positivo |
| CT-CT06-02 | Verificar cores da ProgressBar de consumo | Usuario logado. ARP selecionada com itens em diferentes niveis de consumo | 1. Na aba "Saldo ARP", observar coluna "% Consumido" | ProgressBar verde se pct < 70%, amarelo se 70-90%, vermelho se >= 90% | Positivo |
| CT-CT06-03 | Solicitar carona via modal | Usuario logado. ARP com saldos visiveis | 1. Clicar "Carona" na coluna Acao de um item. 2. No modal, preencher "Orgao Solicitante", "CNPJ" (formato 00.000.000/0001-00), "Quantidade", "Justificativa". 3. Clicar "Solicitar" | Solicitacao registrada. Toast de confirmacao. Tabela "Solicitacoes de Carona" atualiza com nova linha, status "Pendente" (badge amarelo) | Positivo |
| CT-CT06-04 | Tentar solicitar carona com CNPJ invalido (FE-03) | Usuario logado. Modal de carona aberto | 1. Preencher CNPJ com "123" (formato invalido). 2. Preencher demais campos. 3. Clicar "Solicitar" | Erro inline "CNPJ invalido. Use formato 00.000.000/0001-00." Modal permanece aberto | Negativo |
| CT-CT06-05 | Verificar estado sem nenhuma ARP salva (FE-01) | Usuario logado. Nenhuma ARP salva no banco | 1. Aba "Saldo ARP" | Select "Selecione uma Ata" sem opcoes. Mensagem "Nenhuma ata salva. Busque e salve atas na aba 'Buscar'." | Negativo |

---

## FASE 3 — EXECUCAO DE CONTRATOS

---

### UC-CT01 — Cadastrar Contrato

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT01-01 | Listar contratos existentes (>=10) | Usuario logado. Seed executada com contratos | 1. Sidebar -> Execucao Contrato. 2. Verificar aba "Contratos" (ativa por padrao) | Stat Cards exibem: Total (>=10), Vigentes, A Vencer 30d, Valor Total. Tabela mostra contratos com colunas: Numero, Orgao, Objeto, Valor, Termino, Status (badge colorido), Acao | Positivo |
| CT-CT01-02 | Selecionar contrato CTR-2025-0087 | Usuario logado. Contrato CTR-2025-0087 visivel na tabela | 1. Na tabela de contratos, clicar "Selecionar" na linha do contrato CTR-2025-0087 | Banner confirma selecao: "Contrato selecionado: CTR-2025-0087 — {orgao}". Stat cards exibem valor e vigencia do contrato | Positivo |
| CT-CT01-03 | Criar novo contrato via modal | Usuario logado | 1. Clicar "+ Novo Contrato". 2. Preencher "Numero do Contrato" (ex: CT-2026-TESTE). 3. Preencher "Orgao". 4. Preencher "Objeto". 5. Preencher "Valor Total" (ex: 50000). 6. Preencher "Inicio" (2026-01-01). 7. Preencher "Termino" (2026-12-31). 8. Clicar "Criar" | Modal fecha. Novo contrato aparece na tabela com status "vigente" (badge verde). Stat Cards recalculam | Positivo |
| CT-CT01-04 | Tentar criar contrato com numero duplicado (FE-01) | Usuario logado. Contrato CTR-2025-0087 ja existe | 1. Clicar "+ Novo Contrato". 2. Preencher numero "CTR-2025-0087". 3. Preencher demais campos. 4. Clicar "Criar" | Alerta "Numero de contrato ja cadastrado. Use um numero diferente." Modal permanece aberto | Negativo |
| CT-CT01-05 | Tentar criar contrato com data de termino anterior a inicio (FE-03) | Usuario logado | 1. Clicar "+ Novo Contrato". 2. Preencher "Inicio" = 2026-12-31. 3. Preencher "Termino" = 2026-01-01. 4. Clicar "Criar" | Erro "Data de termino deve ser posterior a data de inicio." Modal permanece aberto | Negativo |
| CT-CT01-06 | Verificar badges de status dos contratos | Usuario logado. Contratos com diferentes status | 1. Verificar coluna "Status" na tabela | Vigente: badge verde (#dcfce7). Encerrado: badge neutro (#f3f4f6). Rescindido: badge vermelho (#fee2e2). Suspenso: badge amarelo (#fef3c7) | Positivo |

---

### UC-CT02 — Registrar Entrega + NF

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT02-01 | Verificar entregas do contrato selecionado (incluindo 1 atrasada) | Usuario logado. Contrato CTR-2025-0087 selecionado. Seed com entregas incluindo 1 atrasada | 1. Clicar aba "Entregas" | Card "Entregas — CTR-2025-0087" exibe tabela com entregas. Colunas: Descricao, Qtd, Valor, Prevista, Realizada, NF, Status. Pelo menos 1 entrega com status de atraso visivel | Positivo |
| CT-CT02-02 | Criar nova entrega com todos os campos | Usuario logado. Contrato selecionado | 1. Clicar "+ Nova Entrega". 2. Preencher "Descricao" (ex: Lote reagentes). 3. Preencher "Quantidade" (100). 4. Preencher "Valor Unitario" (50.00). 5. Preencher "Data Prevista" (2026-06-15). 6. Preencher "Data Realizada" (2026-06-15). 7. Preencher "Nota Fiscal" (NF-12345). 8. Clicar "Criar" | Modal fecha. Nova entrega aparece na tabela | Positivo |
| CT-CT02-03 | Criar entrega parcial sem data realizada (FA-01) | Usuario logado. Contrato selecionado | 1. Clicar "+ Nova Entrega". 2. Preencher "Descricao", "Quantidade", "Valor Unitario", "Data Prevista". 3. Deixar "Data Realizada" vazia. 4. Clicar "Criar" | Entrega criada com status "pendente" | Limite |
| CT-CT02-04 | Tentar criar entrega sem contrato selecionado (FE-01) | Usuario logado. Nenhum contrato selecionado | 1. Clicar aba "Entregas" sem selecionar contrato | Mensagem "Selecione um contrato na aba 'Contratos'" exibida. Botao "+ Nova Entrega" nao aparece | Negativo |

---

### UC-CT03 — Acompanhar Cronograma de Entregas

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT03-01 | Verificar cronograma com entregas atrasadas | Usuario logado. Contrato CTR-2025-0087 selecionado com entregas incluindo 1 atrasada | 1. Clicar aba "Cronograma" | Stat Cards exibem: Pendentes, Entregues, Atrasados (>=1), Total. Card "Entregas Atrasadas" (destaque vermelho) visivel com item e dias de atraso | Positivo |
| CT-CT03-02 | Verificar estado sem contrato selecionado (FE-01) | Usuario logado. Nenhum contrato selecionado | 1. Clicar aba "Cronograma" | Mensagem "Selecione um contrato na aba 'Contratos'" exibida. Nenhum Stat Card ou cronograma renderizado | Negativo |
| CT-CT03-03 | Verificar card "Proximos 7 dias" quando existem entregas iminentes | Usuario logado. Contrato selecionado com entregas proximas | 1. Aba "Cronograma", observar card "Proximos 7 dias" | Card lista entregas iminentes com "{dias_restantes}d" em amarelo | Limite |

---

### UC-CT04 — Gestao de Aditivos

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT04-01 | Verificar aditivo existente (tipo=prazo) | Usuario logado. Contrato CTR-2025-0087 selecionado. Seed com 1 aditivo tipo prazo | 1. Clicar aba "Aditivos" | Card "Resumo de Aditivos" exibe: Valor Original, Limite 25%, Acrescimos, % Consumido com ProgressBar. Card "Aditivos" lista 1 aditivo tipo "prazo" | Positivo |
| CT-CT04-02 | Criar novo aditivo de acrescimo | Usuario logado. Contrato selecionado | 1. Clicar "+ Novo Aditivo". 2. Selecionar tipo "acrescimo". 3. Preencher "Valor do Aditivo" (ex: 25000). 4. Preencher "Justificativa" (texto descritivo). 5. Selecionar "Fundamentacao Legal" = "Art. 124-I". 6. Clicar "Criar" | Modal fecha. Aditivo registrado na tabela. ProgressBar do Resumo atualiza percentual consumido | Positivo |
| CT-CT04-03 | Aditivo de prazo sem valor financeiro (FA-01) | Usuario logado. Contrato selecionado | 1. Clicar "+ Novo Aditivo". 2. Selecionar tipo "prazo". 3. Preencher valor R$ 0,00. 4. Preencher justificativa e fundamentacao. 5. Clicar "Criar" | Aditivo registrado. ProgressBar de limite 25% nao e afetada | Limite |
| CT-CT04-04 | Aditivo cumulativo excede 25% do valor original (FE-01, RN-207) | Usuario logado. Contrato selecionado. Soma dos aditivos + novo > 25% do valor original | 1. Clicar "+ Novo Aditivo". 2. Selecionar tipo "acrescimo". 3. Preencher valor que excede 25% cumulativo. 4. Preencher demais campos. 5. Clicar "Criar" | Warning RN-207 exibido: "Limite de 25% excedido. Valor cumulativo: {pct}%." Em modo warn-only, aditivo e criado com alerta | Negativo |

---

### UC-CT05 — Designar Gestor/Fiscal

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT05-01 | Verificar designacoes existentes (gestor + fiscal) | Usuario logado. Contrato CTR-2025-0087 selecionado. Seed com 2 designacoes (gestor + fiscal) | 1. Clicar aba "Gestor/Fiscal" | Cards de Designacao (grid 3): Gestor e Fiscal Tecnico exibem nome, cargo, portaria, datas. Card "Todas as Designacoes" lista 2 linhas | Positivo |
| CT-CT05-02 | Criar nova designacao | Usuario logado. Contrato selecionado | 1. Clicar "+ Nova Designacao". 2. Selecionar tipo "fiscal_administrativo". 3. Preencher "Nome" (ex: Maria Silva). 4. Preencher "Cargo" (ex: Analista). 5. Preencher "Numero da Portaria" (ex: PORT-001). 6. Preencher "Data Inicio" (2026-01-01). 7. Clicar "Criar" | Modal fecha. Designacao registrada. Card "Fiscal Administrativo" atualiza com dados preenchidos | Positivo |
| CT-CT05-03 | Gestor igual ao Fiscal (FE-01, RN-206, Art. 117) | Usuario logado. Contrato selecionado com gestor "Joao Santos" | 1. Clicar "+ Nova Designacao". 2. Selecionar tipo "fiscal_tecnico". 3. Preencher "Nome" = mesmo nome do gestor existente. 4. Preencher demais campos. 5. Clicar "Criar" | Warning RN-206: "Gestor e fiscal nao devem ser a mesma pessoa (Art. 117 Lei 14.133/2021)." Em modo warn-only, designacao e criada com alerta | Negativo |
| CT-CT05-04 | Designacao sem portaria (FA-01) | Usuario logado. Contrato selecionado | 1. Clicar "+ Nova Designacao". 2. Preencher tipo, nome, cargo. 3. Deixar "Numero da Portaria" vazio. 4. Clicar "Criar" | Designacao criada sem portaria. Card exibe nome e cargo sem linha de portaria | Limite |

---

### UC-CT07 — Gestao de Empenhos (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT07-01 | Verificar empenho EMPH-2026-0001 (R$ 960.000) | Usuario logado. Contrato CTR-2025-0087 selecionado. Seed com empenho EMPH-2026-0001 | 1. Clicar aba "Empenhos". 2. Verificar tabela de empenhos | Tabela exibe EMPH-2026-0001 com valor empenhado R$ 960.000. Colunas: Numero Empenho, Data, Valor Empenhado, Valor Entregue, Saldo, Status | Positivo |
| CT-CT07-02 | Verificar 3 itens do empenho (Analisador, Reagentes, Calibradores sem valor) | Usuario logado. Empenho EMPH-2026-0001 visivel | 1. Clicar no empenho EMPH-2026-0001 (ou "Detalhes"). 2. Verificar itens expandidos | 3 itens visiveis: Analisador, Reagentes, Calibradores. Item Calibradores exibe alerta "Sem valor contratual" (icone AlertTriangle, vermelho) | Positivo |
| CT-CT07-03 | Confirmar alerta SEM VALOR no item Calibradores com badge de limite 120% | Usuario logado. Itens do empenho visiveis | 1. Verificar item Calibradores nos itens do contrato/empenho | Alerta "Sem valor contratual" visivel. Badge indica limite 120% | Positivo |
| CT-CT07-04 | Criar novo empenho via modal | Usuario logado. Contrato selecionado | 1. Clicar "+ Novo Empenho". 2. Preencher "Numero do Empenho" (ex: 2026NE000200). 3. Preencher "Valor (R$)" (ex: 100000). 4. Preencher "Data do Empenho" (2026-04-01). 5. Opcionalmente preencher observacoes. 6. Clicar "Criar" | Modal fecha. Nova linha na tabela de empenhos. Saldo = 100% do valor empenhado. Status "Aberto" (badge azul) | Positivo |
| CT-CT07-05 | Tentar criar empenho sem contrato selecionado (FE-01) | Usuario logado. Nenhum contrato selecionado | 1. Clicar aba "Empenhos" | Mensagem "Selecione um contrato na aba 'Contratos'" exibida. Nenhum card ou tabela renderizada | Negativo |
| CT-CT07-06 | Entrega que excede saldo do empenho (FE-03, RN-209) | Usuario logado. Empenho com saldo limitado | 1. Em empenho existente, clicar "+ Registrar Entrega". 2. Preencher valor que excede saldo do empenho. 3. Clicar "Registrar" | Warning RN-209: "Entrega excede saldo do empenho." Em modo warn-only, entrega criada com alerta | Negativo |

---

### UC-CT08 — Auditoria Empenhos x Faturas x Pedidos (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT08-01 | Verificar 5 totais de auditoria: Empenhado, Faturado, Pago, Entregue, Saldo | Usuario logado. Contrato CTR-2025-0087 selecionado. Empenhos com entregas e faturas | 1. Na aba "Empenhos", clicar "Auditoria" | Card "Auditoria" exibe 5 Stat Cards (conforme tutorial): Empenhado, Faturado, Pago, Entregue, Saldo. Todos com valores numericos reais | Positivo |
| CT-CT08-02 | Verificar tabela de conciliacao por empenho | Usuario logado. Auditoria carregada | 1. Verificar tabela de conciliacao | Tabela exibe: Numero Empenho, Valor Empenhado, Valor Entregue, Valor Faturado, Diferenca (cor dinamica), Status (badge: Conciliado/Divergente/Parcial) | Positivo |
| CT-CT08-03 | Exportar CSV da auditoria | Usuario logado. Auditoria carregada | 1. Clicar "Exportar CSV" | Download do arquivo CSV inicia | Positivo |
| CT-CT08-04 | Auditoria sem empenhos registrados (FE-01) | Usuario logado. Contrato sem empenhos | 1. Clicar "Auditoria" | Alerta "Nenhum empenho registrado para este contrato. Cadastre empenhos na aba Empenhos." | Negativo |

---

### UC-CT09 — Contratos a Vencer (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT09-01 | Verificar 5 tiers de contratos a vencer | Usuario logado. Seed com contratos em diferentes prazos de vencimento | 1. Clicar aba "Contratos a Vencer" (ou "Vencimentos" conforme tutorial) | 5 Stat Cards exibem: A Vencer 90d, A Vencer 30d, Em Tratativas, Renovados, Nao Renovados. Em cada tier, >= 1 contrato listado | Positivo |
| CT-CT09-02 | Marcar contrato como em tratativa de renovacao | Usuario logado. Contrato a vencer visivel | 1. Clicar "Marcar Tratativa" em contrato a vencer. 2. No modal, preencher "Observacoes da tratativa", "Responsavel", "Previsao de conclusao". 3. Clicar "Registrar" | Contrato move para secao "Em Tratativas". Stat Card "Em Tratativas" incrementa | Positivo |
| CT-CT09-03 | Confirmar renovacao de contrato | Usuario logado. Contrato em tratativa | 1. Clicar "Confirmar Renovacao". 2. Preencher "Novo numero de contrato", "Nova data de termino", "Novo valor". 3. Clicar "Confirmar" | Contrato renovado. Status volta a "vigente". Stat Card "Renovados" incrementa | Positivo |
| CT-CT09-04 | Nenhum contrato a vencer em 30 dias (FA-01) | Usuario logado. Nenhum contrato com vencimento em 30 dias | 1. Verificar card "Contratos a Vencer em 30 dias" | Card exibe tabela vazia. Stat Card "A Vencer 30d" exibe 0 | Limite |

---

### UC-CT10 — KPIs de Execucao (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT10-01 | Verificar 6+ stat cards com numeros reais | Usuario logado. Contratos cadastrados via seed | 1. Clicar aba "KPIs" | 6+ Stat Cards exibem numeros reais (nao "-"): Ativos/Mes, Ativos Total, A Vencer 90d, A Vencer 30d, Em Tratativas, Renovados | Positivo |
| CT-CT10-02 | Mudar filtro de periodo e verificar recalculo | Usuario logado. KPIs carregados | 1. Alterar Select "Periodo" para "Ultimo mes". 2. Verificar Stat Cards | Stat Cards recalculam com dados do periodo selecionado | Positivo |
| CT-CT10-03 | KPIs sem contratos cadastrados (FE-02) | Usuario logado. Nenhum contrato no sistema | 1. Verificar aba "KPIs" | Todos os KPIs zerados. Mensagem "Cadastre contratos para visualizar KPIs de execucao." | Negativo |

---

## FASE 4 — CONTRATADO X REALIZADO

---

### UC-CR01 — Dashboard Contratado X Realizado

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CR01-01 | Verificar dashboard com totais Contratado vs Realizado | Usuario logado. Contratos com entregas cadastrados via seed | 1. Sidebar -> Contratado x Realizado | Cabecalho "Contratado X Realizado". Stat Cards: Total Contratado, Total Realizado, Variacao %, Saude Portfolio (badge colorido). Tabela exibe contratos com variacao % (badge verde/amarelo/vermelho) | Positivo |
| CT-CR01-02 | Alterar filtro de periodo e verificar recalculo | Usuario logado. Dashboard carregado | 1. Alterar Select "Periodo" (ex: "Ultimos 3 meses") | Dashboard recalcula automaticamente. Stat Cards e tabela atualizam | Positivo |
| CT-CR01-03 | Verificar Linha de Totais | Usuario logado. Dashboard com dados | 1. Verificar parte inferior da tabela | Linha de Totais exibe: Total Contratado, Total Realizado, Var: {pct}% (verde se <= 0, vermelho se > 0) | Positivo |
| CT-CR01-04 | Dashboard sem contratos com entregas (FE-01) | Usuario logado. Nenhum contrato com entregas | 1. Sidebar -> Contratado x Realizado | Tabela vazia. Stat Cards: Total Contratado e Realizado R$ 0,00. Variacao 0%. Saude "Saudavel" | Negativo |

---

### UC-CR02 — Pedidos em Atraso

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CR02-01 | Verificar entrega atrasada destacada em vermelho | Usuario logado. Seed com 1 entrega atrasada | 1. Na pagina Contratado x Realizado, localizar secao "Pedidos em Atraso" | Card "Pedidos em Atraso" visivel. Stat Cards: Total Atrasados (>=1), Alta Severidade, Valor em Risco. Entrega atrasada listada com dias de atraso em vermelho bold | Positivo |
| CT-CR02-02 | Verificar agrupamento por severidade | Usuario logado. Atrasos existentes | 1. Verificar tabelas de severidade | Tabelas agrupadas: CRITICO (header #fecaca), ATENCAO (header #fef08a), OBSERVACAO (header #fed7aa). Cada tabela: Contrato, Orgao, Entrega, Data Prevista, Dias Atraso, Valor | Positivo |
| CT-CR02-03 | Nenhum pedido em atraso (FA-01) | Usuario logado. Nenhuma entrega atrasada | 1. Verificar secao "Pedidos em Atraso" | Mensagem "Nenhum pedido em atraso". Stat Cards: Total=0, Alta Sev.=0, Valor em Risco=R$ 0,00 | Limite |

---

### UC-CR03 — Alertas de Vencimento Multi-tier

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CR03-01 | Verificar vencimentos multi-tier | Usuario logado. Contratos e ARPs com datas de vencimento variadas | 1. Na pagina Contratado x Realizado, localizar secao "Proximos Vencimentos" | Card "Proximos Vencimentos". Stat Cards por urgencia: Vermelho (<7d), Laranja (7-15d), Amarelo (15-30d), Verde (>30d). Tabela com colunas: Tipo (badge), Nome, Data Vencimento, Dias Restantes, Urgencia (badge) | Positivo |
| CT-CR03-02 | Verificar badges de tipo (contrato/arp/entrega) | Usuario logado. Vencimentos de diferentes tipos | 1. Verificar coluna "Tipo" na tabela | Badges coloridos: contrato (azul #3b82f6), arp (roxo #8b5cf6), entrega (laranja #f59e0b) | Positivo |
| CT-CR03-03 | Nenhum vencimento proximo (FE-02) | Usuario logado. Nenhum item com vencimento proximo | 1. Verificar secao "Proximos Vencimentos" | Mensagem "Nenhum vencimento proximo". Stat Cards zerados. Tabela vazia | Negativo |

---

## FASE 5 — CRM DO PROCESSO

---

### UC-CRM01 — Pipeline de Cards do CRM (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM01-01 | Verificar pipeline com 13 stages e badges numericas | Usuario logado. Seed com editais populados no CRM | 1. Sidebar -> CRM. 2. Verificar aba "Pipeline" | 13 cards exibidos: Nao Divulgados, Divulgados, Em Analise, Leads Potenciais, Monitoramento, Impugnacao, Fase de Propostas, Propostas Submetidas, Espera Resultados, Ganho Provisorio, Recursos, Contra Razoes, Resultados Definitivos. Cada card com badge numerica | Positivo |
| CT-CRM01-02 | Verificar pelo menos 10 cards com contagem > 0 | Usuario logado. Pipeline populado | 1. Contar cards com badge > 0 | Pelo menos 10 dos 13 cards possuem contagem > 0 | Positivo |
| CT-CRM01-03 | Expandir card "Fase de Propostas" para ver tabela de editais | Usuario logado. Card "Fase de Propostas" com contagem > 0 | 1. Clicar card "Fase de Propostas" | Card Expandido abre abaixo com tabela: Numero, Orgao, Objeto, Valor Estimado, Tipo Venda (badge Pontual/Recorrente), Data, Acao | Positivo |
| CT-CRM01-04 | Card do pipeline com contagem zero (FA-01) | Usuario logado. Pelo menos 1 stage com 0 editais | 1. Clicar no card com badge "0" | Card Expandido abre com tabela vazia. Mensagem "Nenhum edital nesta etapa." | Limite |

---

### UC-CRM02 — Parametrizacoes do CRM (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM02-01 | Verificar 3 sub-abas de parametrizacoes: Tipos de Edital (8), Agrupamentos (12), Motivos de Derrota (7) | Usuario logado. Seed com 27 valores de parametrizacao | 1. CRM -> aba "Parametrizacoes" | 3 secoes: Tipos de Edital (8 itens), Agrupamento do Portfolio (12 itens), Motivos de Derrota (7 itens). Total 27 valores visiveis | Positivo |
| CT-CRM02-02 | Criar novo Motivo de Derrota | Usuario logado. Aba "Parametrizacoes" ativa | 1. Na secao "Motivos de Derrota", clicar "+ Novo Motivo". 2. Preencher nome (ex: "Prazo de entrega"). 3. Clicar "Salvar" | Novo motivo aparece na lista. Contagem de motivos incrementa para 8 | Positivo |
| CT-CRM02-03 | Tentar criar motivo com nome duplicado (FE-02) | Usuario logado. Motivo "Administrativo" ja existe | 1. Clicar "+ Novo Motivo". 2. Preencher nome "Administrativo". 3. Clicar "Salvar" | Alerta "Nome ja existe. Use um nome diferente." Item nao salvo | Negativo |
| CT-CRM02-04 | Tentar criar motivo com nome vazio (FE-04) | Usuario logado | 1. Clicar "+ Novo Motivo". 2. Deixar nome vazio. 3. Clicar "Salvar" | Validacao "Nome e obrigatorio." Item nao salvo | Negativo |

---

### UC-CRM03 — Mapa Geografico de Processos (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM03-01 | Verificar mapa interativo OpenStreetMap com titulo | Usuario logado. Editais com localizacao geografica | 1. CRM -> aba "Mapa" | Mapa interativo carrega com titulo "Distribuicao Geografica (N editais)". Mapa OpenStreetMap/Leaflet funcional | Positivo |
| CT-CRM03-02 | Verificar circulos azuis (CircleMarker) em >= 4 UFs, tamanho proporcional | Usuario logado. Mapa carregado | 1. Verificar marcadores no mapa | Circulos azuis (CircleMarker) visiveis em pelo menos 4 UFs. Tamanho proporcional ao numero de editais | Positivo |
| CT-CRM03-03 | Clicar circulo e verificar popup com UF, total editais, breakdown por stage | Usuario logado. Mapa com marcadores | 1. Clicar num circulo azul no mapa | Popup abre com: nome da UF, total de editais, breakdown por stage do pipeline | Positivo |
| CT-CRM03-04 | Verificar zoom e pan funcionais | Usuario logado. Mapa carregado | 1. Usar scroll wheel para zoom. 2. Arrastar mapa para pan | Zoom e pan funcionam normalmente (scroll wheel + arrastar) | Positivo |

---

### UC-CRM04 — Agenda/Timeline de Etapas (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM04-01 | Verificar agenda com 6 itens com datas | Usuario logado. Seed com 6 itens de agenda | 1. CRM -> aba "Agenda" | 6 itens visiveis com datas. Cada item com badge de urgencia (critica/alta/normal/baixa) | Positivo |
| CT-CRM04-02 | Verificar badges de urgencia | Usuario logado. Agenda carregada | 1. Verificar coluna/indicador de urgencia nos itens | Badges de urgencia: Critico (vermelho, <3d), Urgente (laranja, 3-7d), Normal (verde, >7d) | Positivo |
| CT-CRM04-03 | Agenda sem eventos no periodo (FE-01) | Usuario logado. Nenhum evento no periodo selecionado | 1. Navegar para periodo sem eventos | Mensagem "Nenhum prazo neste periodo." Calendario/lista vazio | Negativo |

---

### UC-CRM05 — KPIs do CRM (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM05-01 | Verificar 6+ stat cards com numeros reais | Usuario logado. Editais em diversas etapas com resultados registrados | 1. CRM -> aba "KPIs" | 6+ Stat Cards com numeros reais: Participados/Analisados, Nao Participados/Analisados, Ganhos/Participados, Ganhos c/ Recursos, Perdidos/Participados, Perdidos apos CR/Total CR | Positivo |
| CT-CRM05-02 | Clicar card "Perdidos" para ver tabela expandida | Usuario logado. KPIs carregados. Card "Perdidos" com valor > 0 | 1. Clicar card "Perdidos / Participados" | Card Expandido abre com tabela: Numero, Orgao, Valor, Resultado, Data | Positivo |
| CT-CRM05-03 | KPIs sem resultados registrados (FA-01) | Usuario logado. Nenhum resultado registrado | 1. Aba "KPIs" | Todos os KPIs exibem 0/0 = 0%. Ticket Medio R$ 0,00. Tempo Medio "N/A" | Limite |

---

### UC-CRM06 — Registrar Decisao de Nao-Participacao (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM06-01 | Declinar de edital em "Em Analise" com motivo e justificativa | Usuario logado. Edital em etapa "Em Analise" no pipeline | 1. Pipeline -> expandir card "Em Analise". 2. Clicar "Declinar" no edital. 3. No modal, selecionar motivo (ex: "Inviavel comercialmente"). 4. Preencher detalhamento com >= 20 caracteres. 5. Marcar checkbox "Manter em Monitoramento". 6. Clicar "Confirmar Declinio" | Modal fecha. Edital move para card "Monitoramento". Toast "Decisao registrada com sucesso". Badge do card "Em Analise" decrementa e "Monitoramento" incrementa | Positivo |
| CT-CRM06-02 | Declinar sem manter em monitoramento (FA-01) | Usuario logado. Edital em "Em Analise" | 1. Clicar "Declinar". 2. Selecionar motivo. 3. Preencher detalhamento >= 20 chars. 4. Deixar checkbox "Manter em Monitoramento" desmarcado. 5. Clicar "Confirmar Declinio" | Edital removido do pipeline ativo. Nao aparece em nenhum card | Limite |
| CT-CRM06-03 | Tentar declinar com detalhamento menor que 20 caracteres (FE-01) | Usuario logado. Modal de declinio aberto | 1. Selecionar motivo. 2. Preencher detalhamento com "muito curto" (< 20 chars). 3. Clicar "Confirmar Declinio" | Erro "Detalhamento deve ter no minimo 20 caracteres." Modal permanece aberto | Negativo |
| CT-CRM06-04 | Tentar declinar sem selecionar motivo (FE-02) | Usuario logado. Modal aberto | 1. Deixar select "Motivo Principal" vazio. 2. Preencher detalhamento. 3. Clicar "Confirmar Declinio" | Erro "Selecione o motivo principal da nao-participacao." Modal permanece aberto | Negativo |

---

### UC-CRM07 — Registrar Motivo de Perda (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM07-01 | Registrar motivo de perda em edital perdido | Usuario logado. Edital em "Resultados Definitivos" > "Perdidos" com badge "Pendente" | 1. Pipeline -> expandir "Resultados Definitivos" -> aba "Perdidos". 2. Clicar "Registrar Motivo" no edital pendente. 3. No modal, selecionar "Categoria do Motivo" (ex: "Nao atende especificacao"). 4. Preencher descricao >= 30 caracteres. 5. Marcar checkbox "Perda vinculada a Contra-Razao" se aplicavel. 6. Selecionar "Acao recomendada" (ex: "Revisar especificacoes tecnicas"). 7. Preencher "Responsavel pela acao". 8. Clicar "Registrar" | Modal fecha. Coluna "Motivo" atualiza de badge "Pendente" para texto da categoria. KPIs de perdas alimentados | Positivo |
| CT-CRM07-02 | Registrar motivo de perda com contra-razao (checkbox marcado) | Usuario logado. Edital perdido apos contra-razao | 1. Clicar "Registrar Motivo". 2. Selecionar categoria. 3. Preencher descricao >= 30 chars. 4. Marcar checkbox "Perda vinculada a Contra-Razao". 5. Preencher campo "Analise do processo de contra-razao". 6. Clicar "Registrar" | Modal fecha. Coluna "Origem Perda" exibe badge "Perda apos CR" (roxo). Dados registrados para analise | Positivo |
| CT-CRM07-03 | Tentar registrar motivo com descricao menor que 30 caracteres (FE-01) | Usuario logado. Modal aberto | 1. Selecionar categoria. 2. Preencher descricao "curta demais" (< 30 chars). 3. Clicar "Registrar" | Erro "Descricao deve ter no minimo 30 caracteres." Modal permanece aberto | Negativo |
| CT-CRM07-04 | Tentar registrar motivo sem selecionar categoria (FE-02) | Usuario logado. Modal aberto | 1. Deixar "Categoria do Motivo" vazio. 2. Preencher descricao. 3. Clicar "Registrar" | Erro "Selecione a categoria do motivo de perda." Modal permanece aberto | Negativo |
| CT-CRM07-05 | Perda direta sem contra-razao (FA-01) | Usuario logado. Edital perdido diretamente | 1. Clicar "Registrar Motivo". 2. Selecionar categoria. 3. Preencher descricao >= 30 chars. 4. Deixar checkbox "Perda vinculada a Contra-Razao" desmarcado. 5. Clicar "Registrar" | Campo "Analise do processo de contra-razao" nao exibido. Motivo registrado como perda direta. Coluna "Origem Perda" badge "Perda Direta" (vermelho) | Limite |

---

## RESUMO DE COBERTURA

| Fase | UCs | Casos de Teste | Positivos | Negativos | Limite |
|---|---|---|---|---|---|
| FASE 1 — Follow-up | UC-FU01, UC-FU02, UC-FU03 | 10 | 5 | 4 | 1 |
| FASE 2 — Atas de Pregao | UC-AT01, UC-AT02, UC-AT03, UC-CT06 | 12 | 7 | 3 | 2 |
| FASE 3 — Execucao de Contratos | UC-CT01..CT05, UC-CT07..CT10 | 28 | 18 | 7 | 3 |
| FASE 4 — Contratado x Realizado | UC-CR01, UC-CR02, UC-CR03 | 10 | 6 | 3 | 1 |
| FASE 5 — CRM do Processo | UC-CRM01..CRM07 | 22 | 12 | 6 | 4 |
| **TOTAL** | **26 UCs** | **82** | **48** | **23** | **11** |

---

## Notas

- Todos os dados de entrada sao extraidos de `docs/tutorialsprint5-1.md` (CH Hospitalar)
- UCs nao implementados (UC-CT07 a UC-CT10, UC-CRM01 a UC-CRM07) descrevem comportamento esperado conforme `docs/CASOS DE USO SPRINT5 V5.md`
- Dados especificos deste conjunto: contrato CTR-2025-0087, empenho EMPH-2026-0001 (R$ 960.000), 3 itens (Analisador, Reagentes, Calibradores sem valor com badge limite 120%)
- RNs testadas via fluxos de excecao: RN-084, RN-206, RN-207, RN-209, RN-210, RN-214
- Testes de limite cobrem fluxos alternativos (FA) do V5
- Testes negativos cobrem fluxos de excecao (FE) do V5

---

*Documento gerado em 21/04/2026. Casos de teste para validacao Sprint 5 — Conjunto 1 (CH Hospitalar). Total: 82 casos de teste cobrindo 26 UCs.*
