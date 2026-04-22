# CASOS DE TESTE PARA VALIDACAO — SPRINT 5 — CONJUNTO 2 (RP3X)

**Data:** 21/04/2026
**Versao:** 1.0
**Empresa de teste:** RP3X Comercio e Representacoes Ltda. (CNPJ 68.218.593/0001-09)
**Dados de apoio:** `docs/tutorialsprint5-2.md` / `docs/dadossprint5-2.md`
**Referencia de UCs:** `docs/CASOS DE USO SPRINT5 V5.md`
**Ambiente:** Backend porta 5007 / Frontend porta 5179
**Seed:** `python backend/seeds/sprint5_seed.py`
**Credenciais:** valida2@valida.com.br / 123456 / Empresa: RP3X Comercio e Representacoes Ltda.
**Total de UCs cobertos:** 26 (15 implementados + 11 nao implementados)
**Diferencial deste conjunto:** card `contra_razao` intencionalmente vazio (estado zero), cenario de reagentes em vez de equipamentos

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
| CT-FU01-01 | Registrar resultado de vitoria (ganho) — edital SP de glicose | Usuario logado como valida2@valida.com.br na empresa RP3X. Seed Sprint 5 executada. Edital SP de glicose com proposta submetida | 1. Sidebar -> Followup. 2. Na aba "Resultados", localizar edital SP de glicose. 3. Clicar "Registrar" na coluna Acao. 4. No modal, selecionar radio "Vitoria". 5. Preencher "Valor Final (R$)". 6. Clicar "Registrar" | Modal fecha. Edital move para "Resultados Registrados" com badge "Vitoria" (verde #16a34a). Stat Cards "Vitorias" e "Taxa de Sucesso" recalculam | Positivo |
| CT-FU01-02 | Registrar resultado de derrota — edital MG de hemograma, motivo: preco | Usuario logado. Edital MG de hemograma com proposta submetida | 1. Sidebar -> Followup. 2. Localizar edital MG de hemograma. 3. Clicar "Registrar". 4. Selecionar radio "Derrota". 5. Preencher "Valor Final (R$)". 6. Preencher "Empresa Vencedora". 7. Selecionar motivo "Preco" no select "Motivo da Derrota". 8. Clicar "Registrar" | Modal fecha. Edital aparece em "Resultados Registrados" com badge "Derrota" (vermelho #dc2626). Stat Cards "Derrotas" incrementa e "Taxa de Sucesso" recalcula | Positivo |
| CT-FU01-03 | Registrar resultado "Cancelado" pelo orgao (FA-01) | Usuario logado. Edital com proposta submetida | 1. Localizar edital pendente. 2. Clicar "Registrar". 3. Selecionar "Cancelado". 4. Preencher "Justificativa do Cancelamento". 5. Clicar "Registrar" | Edital em "Resultados Registrados" com badge "Cancelado" (cinza #6b7280). Nao contabiliza como vitoria nem derrota nos Stat Cards | Limite |
| CT-FU01-04 | Tentar registrar resultado sem preencher campos obrigatorios (FE-02) | Usuario logado. Modal aberto em edital pendente | 1. Selecionar radio "Derrota". 2. Deixar "Valor Final" e "Empresa Vencedora" vazios. 3. Clicar "Registrar" | Mensagem de validacao inline. Modal nao fecha. Dados preservados | Negativo |
| CT-FU01-05 | Nenhum edital pendente de resultado (FE-01) | Usuario logado. Todos os editais ja com resultado registrado | 1. Sidebar -> Followup. 2. Verificar aba "Resultados" | Tabela "Editais Pendentes" vazia. Mensagem "Nenhum edital pendente de resultado". Nenhum botao "Registrar" disponivel | Negativo |

---

### UC-FU02 — Configurar Alertas de Prazo

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-FU02-01 | Visualizar alertas de vencimento para empresa RP3X | Usuario logado como RP3X. Contratos e ARPs cadastrados com datas de vencimento via seed | 1. Sidebar -> Followup. 2. Clicar na aba "Alertas" | Summary Cards com 5 contadores: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d). Tabela "Proximos Vencimentos" com badges de tipo e urgencia | Positivo |
| CT-FU02-02 | Atualizar dados via botao "Atualizar" (FA-03) | Usuario logado. Aba "Alertas" carregada | 1. Clicar "Atualizar" | Tabela e Summary Cards recarregam com dados atualizados do backend | Limite |
| CT-FU02-03 | Nenhum vencimento nos proximos 90 dias (FA-01) | Usuario logado. Sem vencimentos proximos | 1. Verificar aba "Alertas" | Mensagem "Nenhum vencimento nos proximos 90 dias". Summary Cards todos zerados | Negativo |

---

### UC-FU03 — Score Logistico

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-FU03-01 | Verificar score logistico da empresa RP3X | Usuario logado. Parametros logisticos configurados | 1. Sidebar -> Followup. 2. Verificar Stat Cards | Card "Score Logistico" exibe valor numerico. Componentes: distancia, prazo, capacidade | Positivo |
| CT-FU03-02 | Score logistico com API indisponivel (FE-01) | API `/api/score-logistico` indisponivel | 1. Sidebar -> Followup | Card "Score Logistico" exibe "N/A". Demais Stat Cards funcionam | Negativo |

---

## FASE 2 — ATAS DE PREGAO

---

### UC-AT01 — Buscar Atas no PNCP

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-AT01-01 | Buscar atas de reagentes/diagnostico no PNCP | Usuario logado. Backend e PNCP operacionais | 1. Sidebar -> Atas. 2. Na aba "Buscar", digitar "reagentes" no campo de busca. 3. Clicar "Buscar" | Botao "Buscando..." com loader. Tabela de resultados: Titulo, Orgao, UF, Publicacao, Acoes (Salvar/Extrair) | Positivo |
| CT-AT01-02 | Salvar ata de reagentes encontrada | Usuario logado. Busca realizada com resultados | 1. Clicar "Salvar" em uma ata de reagentes | Ata inserida em atas_consultadas. Toast de confirmacao | Positivo |
| CT-AT01-03 | Buscar com termo < 3 caracteres (FE-01) | Usuario logado | 1. Digitar "re" (2 chars). 2. Verificar botao | Botao "Buscar" desabilitado. Nenhuma requisicao | Negativo |
| CT-AT01-04 | Buscar atas filtradas por UF (FA-02) | Usuario logado | 1. Digitar "diagnostico". 2. Selecionar UF "MG". 3. Clicar "Buscar" | Resultados filtrados apenas para MG | Limite |
| CT-AT01-05 | Salvar ata ja existente (FA-03) | Ata ja salva anteriormente | 1. Clicar "Salvar" em ata duplicada | Toast "Ata ja salva anteriormente". Sem duplicacao | Limite |

---

### UC-AT02 — Extrair Resultados de Ata PDF

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-AT02-01 | Extrair itens de ata de reagentes via URL | Usuario logado. URL de ata PNCP disponivel | 1. Aba "Extrair". 2. Preencher URL. 3. Clicar "Extrair Dados" | "Extraindo..." com loader. Tabela "Itens Extraidos (N)": Descricao, Vencedor, Valor Unit., Qtd | Positivo |
| CT-AT02-02 | Extrair via texto colado (FA-01) | Usuario logado | 1. Colar texto da ata no campo de texto. 2. Clicar "Extrair Dados" | Tabela com itens extraidos do texto colado | Limite |
| CT-AT02-03 | Ambos os campos vazios (FE-02) | Usuario logado | 1. URL e texto vazios. 2. Verificar botao | Botao "Extrair Dados" desabilitado | Negativo |

---

### UC-AT03 — Dashboard de Atas Consultadas

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-AT03-01 | Verificar 3 atas consultadas (reagentes/diagnostico) | Usuario logado. Seed com 3 atas de reagentes/diagnostico para RP3X | 1. Sidebar -> Atas. 2. Aba "Minhas Atas" | Stat Cards: Total (3), Vigentes, Vencidas. Tabela com 3 atas: Titulo, Orgao, UF, Vigencia (badge verde/vermelho) | Positivo |
| CT-AT03-02 | Verificar badges de vigencia | Usuario logado. Atas com datas variadas | 1. Verificar coluna "Vigencia" | Vigente: badge verde (#dcfce7) "{dias}d restantes". Vencida: badge vermelho (#fee2e2) "Vencida ha {dias}d" | Positivo |

---

### UC-CT06 — Saldo de ARP / Controle de Carona

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT06-01 | Verificar 2 saldos ARP para RP3X | Usuario logado. Seed com 2 saldos ARP | 1. Aba "Saldo ARP". 2. Selecionar ARP | Card "Saldos por Item" com 2 saldos. ProgressBar colorida por nivel de consumo | Positivo |
| CT-CT06-02 | Cores da ProgressBar de consumo | Usuario logado. ARP selecionada | 1. Observar "% Consumido" | Verde (< 70%), amarelo (70-90%), vermelho (>= 90%) | Positivo |
| CT-CT06-03 | Solicitar carona via modal | Usuario logado. Saldos visiveis | 1. Clicar "Carona". 2. Preencher Orgao, CNPJ (formato valido), Quantidade, Justificativa. 3. Clicar "Solicitar" | Solicitacao registrada. Tabela "Solicitacoes de Carona" com nova linha status "Pendente" | Positivo |
| CT-CT06-04 | CNPJ invalido na carona (FE-03) | Modal de carona aberto | 1. CNPJ = "abc" (invalido). 2. Clicar "Solicitar" | Erro "CNPJ invalido. Use formato 00.000.000/0001-00." Modal aberto | Negativo |
| CT-CT06-05 | Nenhuma ARP salva (FE-01) | Nenhuma ARP no banco para RP3X | 1. Aba "Saldo ARP" | Select vazio. Mensagem "Nenhuma ata salva. Busque e salve atas na aba 'Buscar'." | Negativo |

---

## FASE 3 — EXECUCAO DE CONTRATOS

---

### UC-CT01 — Cadastrar Contrato

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT01-01 | Listar contratos vigentes RP3X: CTR-2026-RP3X-001 (comodato) e CTR-2026-RP3X-002 (fornecimento) | Usuario logado. Seed com contratos RP3X | 1. Sidebar -> Execucao Contrato | Tabela mostra pelo menos 2 contratos: CTR-2026-RP3X-001 e CTR-2026-RP3X-002. Stat Cards: Total, Vigentes, A Vencer 30d, Valor Total. Status badges verdes (vigente) | Positivo |
| CT-CT01-02 | Selecionar contrato CTR-2026-RP3X-001 (comodato) | Contrato CTR-2026-RP3X-001 visivel | 1. Clicar "Selecionar" na linha CTR-2026-RP3X-001 | Banner: "Contrato selecionado: CTR-2026-RP3X-001 — {orgao}". Stat cards mostram dados do contrato | Positivo |
| CT-CT01-03 | Criar novo contrato para RP3X | Usuario logado | 1. Clicar "+ Novo Contrato". 2. Numero: CT-2026-RP3X-TEST. 3. Orgao, Objeto, Valor. 4. Inicio: 2026-01-01. 5. Termino: 2026-12-31. 6. Clicar "Criar" | Novo contrato na tabela com badge "vigente". Stat Cards recalculam | Positivo |
| CT-CT01-04 | Numero de contrato duplicado (FE-01) | CTR-2026-RP3X-001 ja existe | 1. Clicar "+ Novo Contrato". 2. Numero: CTR-2026-RP3X-001. 3. Clicar "Criar" | Alerta "Numero de contrato ja cadastrado." Modal aberto | Negativo |
| CT-CT01-05 | Data de termino anterior a inicio (FE-03) | Usuario logado | 1. Inicio: 2026-12-31. 2. Termino: 2026-01-01. 3. Clicar "Criar" | Erro "Data de termino deve ser posterior a data de inicio." | Negativo |
| CT-CT01-06 | Contrato com valor zero — comodato (FA-03) | Usuario logado | 1. Clicar "+ Novo Contrato". 2. Valor Total: 0. 3. Preencher demais campos. 4. Clicar "Criar" | Contrato criado com valor R$ 0,00. Stat Card "Valor Total" nao afetado | Limite |

---

### UC-CT02 — Registrar Entrega + NF

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT02-01 | Verificar entregas do contrato CTR-2026-RP3X-001 (incluindo reagentes) | Contrato CTR-2026-RP3X-001 selecionado. Seed com entregas populadas | 1. Aba "Entregas" | Card "Entregas — CTR-2026-RP3X-001". Tabela com entregas de reagentes. Colunas: Descricao, Qtd, Valor, Prevista, Realizada, NF, Status | Positivo |
| CT-CT02-02 | Criar nova entrega de reagentes | Contrato selecionado | 1. Clicar "+ Nova Entrega". 2. Descricao: "Kit Glicose BioGlic-100". 3. Quantidade: 50. 4. Valor Unitario: 220. 5. Data Prevista: 2026-07-01. 6. Clicar "Criar" | Entrega registrada na tabela com status pendente | Positivo |
| CT-CT02-03 | Entrega parcial sem data realizada (FA-01) | Contrato selecionado | 1. Criar entrega apenas com Data Prevista, sem Data Realizada | Entrega criada com status "pendente" | Limite |
| CT-CT02-04 | Sem contrato selecionado (FE-01) | Nenhum contrato selecionado | 1. Aba "Entregas" | Mensagem "Selecione um contrato na aba 'Contratos'". Sem botao "+ Nova Entrega" | Negativo |

---

### UC-CT03 — Acompanhar Cronograma de Entregas

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT03-01 | Cronograma com entrega de reagente atrasada | Contrato CTR-2026-RP3X-001 selecionado. Seed com 1 entrega de reagente atrasada | 1. Aba "Cronograma" | Stat Cards: Pendentes, Entregues, Atrasados (>=1), Total. Card "Entregas Atrasadas" com item e dias de atraso em vermelho | Positivo |
| CT-CT03-02 | Sem contrato selecionado (FE-01) | Nenhum contrato selecionado | 1. Aba "Cronograma" | Mensagem "Selecione um contrato na aba 'Contratos'". Sem cronograma | Negativo |
| CT-CT03-03 | Verificar card "Proximos 7 dias" | Contrato selecionado com entregas proximas | 1. Verificar card "Proximos 7 dias" | Entregas iminentes listadas com "{dias_restantes}d" em amarelo | Limite |

---

### UC-CT04 — Gestao de Aditivos

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT04-01 | Verificar aditivos do contrato RP3X (seed) | Contrato RP3X selecionado. Seed com aditivos | 1. Aba "Aditivos" | Card "Resumo de Aditivos" com ProgressBar. Card "Aditivos" lista aditivos existentes | Positivo |
| CT-CT04-02 | Criar aditivo de acrescimo para contrato de reagentes | Contrato selecionado | 1. Clicar "+ Novo Aditivo". 2. Tipo: "acrescimo". 3. Valor: 15000. 4. Justificativa (texto). 5. Fundamentacao: "Art. 124-I". 6. Clicar "Criar" | Aditivo registrado. ProgressBar atualiza | Positivo |
| CT-CT04-03 | Aditivo de prazo sem valor (FA-01) | Contrato selecionado | 1. Tipo: "prazo". 2. Valor: 0. 3. Justificativa e fundamentacao. 4. Clicar "Criar" | Aditivo registrado. ProgressBar inalterada | Limite |
| CT-CT04-04 | Aditivo cumulativo excede 25% (FE-01, RN-207) | Contrato selecionado. Soma aditivos + novo > 25% | 1. Criar aditivo com valor que excede 25% cumulativo | Warning RN-207: "Limite de 25% excedido." Em warn-only, aditivo criado com alerta | Negativo |

---

### UC-CT05 — Designar Gestor/Fiscal

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT05-01 | Verificar designacoes existentes do contrato RP3X | Contrato RP3X selecionado. Seed com designacoes | 1. Aba "Gestor/Fiscal" | Cards de Designacao (grid 3). Card "Todas as Designacoes" com linhas de gestor e fiscal | Positivo |
| CT-CT05-02 | Criar nova designacao de fiscal administrativo | Contrato selecionado | 1. "+ Nova Designacao". 2. Tipo: "fiscal_administrativo". 3. Nome, Cargo, Portaria, Data Inicio. 4. "Criar" | Designacao registrada. Card "Fiscal Administrativo" atualiza | Positivo |
| CT-CT05-03 | Gestor igual ao Fiscal (FE-01, RN-206) | Contrato com gestor existente | 1. Criar designacao fiscal com mesmo nome do gestor | Warning RN-206: "Gestor e fiscal nao devem ser a mesma pessoa (Art. 117)" | Negativo |
| CT-CT05-04 | Designacao sem portaria (FA-01) | Contrato selecionado | 1. Criar designacao sem "Numero da Portaria" | Designacao criada. Card exibe nome/cargo sem portaria | Limite |

---

### UC-CT07 — Gestao de Empenhos (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT07-01 | Verificar empenho EMPH-2026-RP3X-001 (R$ 480.000) | Contrato CTR-2026-RP3X-001 selecionado. Seed com empenho | 1. Aba "Empenhos". 2. Verificar tabela | Empenho EMPH-2026-RP3X-001 com valor R$ 480.000. Colunas: Numero, Data, Valor Empenhado, Valor Entregue, Saldo, Status | Positivo |
| CT-CT07-02 | Verificar 3 itens: Kit Hemograma (200 x R$ 1.800), Kit Glicose (500 x R$ 220), Controles (sem_valor, limite 110%) | Empenho visivel | 1. Clicar no empenho para expandir itens | 3 itens: Kit Hemograma Sysmex XN (qty 200, R$ 1.800 unit), Kit Glicose Wiener BioGlic-100 (qty 500, R$ 220 unit), Controles (sem_valor). Controles com alerta "Sem valor contratual" e badge limite 110% | Positivo |
| CT-CT07-03 | Confirmar alerta SEM VALOR visivel no item Controles | Itens do empenho visiveis | 1. Verificar item Controles | Alerta "SEM VALOR" visivel (icone AlertTriangle). Badge de limite 110% | Positivo |
| CT-CT07-04 | Criar novo empenho para contrato RP3X | Contrato selecionado | 1. "+ Novo Empenho". 2. Numero: 2026NE-RP3X-002. 3. Valor: 200000. 4. Data: 2026-05-01. 5. "Criar" | Novo empenho na tabela. Saldo 100%. Status "Aberto" | Positivo |
| CT-CT07-05 | Sem contrato selecionado (FE-01) | Nenhum contrato selecionado | 1. Aba "Empenhos" | Mensagem "Selecione um contrato na aba 'Contratos'" | Negativo |
| CT-CT07-06 | Entrega excede saldo do empenho (FE-03, RN-209) | Empenho com saldo limitado | 1. "+ Registrar Entrega" com valor > saldo | Warning RN-209: "Entrega excede saldo do empenho." Em warn-only, criada com alerta | Negativo |

---

### UC-CT08 — Auditoria Empenhos x Faturas x Pedidos (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT08-01 | Verificar 5 totais de auditoria para contrato RP3X | Contrato CTR-2026-RP3X-001 selecionado. Empenhos com entregas | 1. Clicar "Auditoria" | 5 Stat Cards: Empenhado, Faturado, Pago, Entregue, Saldo. Valores numericos reais | Positivo |
| CT-CT08-02 | Tabela de conciliacao por empenho | Auditoria carregada | 1. Verificar tabela | Numero Empenho, Valor Empenhado, Valor Entregue, Valor Faturado, Diferenca (cor dinamica), Status (badge) | Positivo |
| CT-CT08-03 | Exportar CSV | Auditoria carregada | 1. Clicar "Exportar CSV" | Download CSV inicia | Positivo |
| CT-CT08-04 | Sem empenhos registrados (FE-01) | Contrato sem empenhos | 1. Clicar "Auditoria" | Alerta "Nenhum empenho registrado para este contrato" | Negativo |

---

### UC-CT09 — Contratos a Vencer (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT09-01 | Verificar 5 tiers (RP-V30/V90/TR/RN/NR) | Seed com contratos RP3X em diferentes prazos | 1. Aba "Contratos a Vencer" | 5 Stat Cards: A Vencer 90d (V90), A Vencer 30d (V30), Em Tratativas (TR), Renovados (RN), Nao Renovados (NR). Cada tier com >= 1 contrato | Positivo |
| CT-CT09-02 | Marcar contrato em tratativa | Contrato a vencer visivel | 1. "Marcar Tratativa". 2. Preencher observacoes, responsavel, previsao. 3. "Registrar" | Contrato em "Em Tratativas". Stat Card incrementa | Positivo |
| CT-CT09-03 | Confirmar renovacao | Contrato em tratativa | 1. "Confirmar Renovacao". 2. Novo numero, nova data, novo valor. 3. "Confirmar" | Contrato renovado. Status "vigente" | Positivo |
| CT-CT09-04 | Nenhum contrato a vencer em 30 dias (FA-01) | Sem vencimento em 30d | 1. Verificar card "30 dias" | Tabela vazia. Stat Card V30 = 0 | Limite |

---

### UC-CT10 — KPIs de Execucao (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CT10-01 | 6+ cards com numeros reais para empresa RP3X | Contratos RP3X cadastrados via seed | 1. Aba "KPIs" | 6+ Stat Cards com numeros reais (nao "-") | Positivo |
| CT-CT10-02 | Mudar filtro de periodo | KPIs carregados | 1. Alterar Select "Periodo" | Stat Cards recalculam | Positivo |
| CT-CT10-03 | Sem contratos (FE-02) | Nenhum contrato no sistema | 1. Aba "KPIs" | Todos zerados. Mensagem orientativa | Negativo |

---

## FASE 4 — CONTRATADO X REALIZADO

---

### UC-CR01 — Dashboard Contratado X Realizado

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CR01-01 | Dashboard com dados de contratos RP3X (reagentes) | Contratos RP3X com entregas de reagentes | 1. Sidebar -> Contratado x Realizado | Stat Cards: Total Contratado, Total Realizado, Variacao %, Saude Portfolio. Tabela com contratos RP3X e variacao % por badge | Positivo |
| CT-CR01-02 | Alterar filtro de periodo | Dashboard carregado | 1. Alterar "Periodo" | Recalculo automatico de Stat Cards e tabela | Positivo |
| CT-CR01-03 | Verificar Linha de Totais | Dashboard com dados | 1. Verificar rodape da tabela | Total Contratado, Total Realizado, Var: {pct}% | Positivo |
| CT-CR01-04 | Sem contratos com entregas (FE-01) | Nenhuma entrega | 1. Verificar dashboard | Tabela vazia. R$ 0,00. Variacao 0%. Saude "Saudavel" | Negativo |

---

### UC-CR02 — Pedidos em Atraso

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CR02-01 | Verificar entrega de reagente atrasada (1 atrasada conforme tutorial) | Seed com 1 entrega de reagente atrasada para RP3X | 1. Secao "Pedidos em Atraso" | Card com Stat Cards: Total Atrasados (>=1), Alta Severidade, Valor em Risco. Entrega de reagente atrasada em vermelho | Positivo |
| CT-CR02-02 | Agrupamento por severidade | Atrasos existentes | 1. Verificar tabelas de severidade | Tabelas CRITICO/ATENCAO/OBSERVACAO com headers coloridos e colunas Contrato, Orgao, Entrega, Data Prevista, Dias Atraso, Valor | Positivo |
| CT-CR02-03 | Sem atrasos (FA-01) | Nenhuma entrega atrasada | 1. Verificar secao | "Nenhum pedido em atraso". Stats: Total=0 | Limite |

---

### UC-CR03 — Alertas de Vencimento Multi-tier

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CR03-01 | Verificar vencimentos multi-tier para RP3X | Contratos e ARPs RP3X com vencimentos variados | 1. Secao "Proximos Vencimentos" | Stat Cards: Vermelho (<7d), Laranja (7-15d), Amarelo (15-30d), Verde (>30d). Tabela com Tipo (badge), Nome, Data, Dias, Urgencia | Positivo |
| CT-CR03-02 | Badges de tipo contrato/arp | Vencimentos de diferentes tipos | 1. Verificar coluna "Tipo" | Contrato: azul. ARP: roxo. Entrega: laranja | Positivo |
| CT-CR03-03 | Nenhum vencimento proximo (FE-02) | Sem vencimentos | 1. Verificar secao | "Nenhum vencimento proximo". Stats zerados. Tabela vazia | Negativo |

---

## FASE 5 — CRM DO PROCESSO

---

### UC-CRM01 — Pipeline de Cards do CRM (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM01-01 | Pipeline 12/13 stages — card contra_razao vazio (estado zero) | Seed com editais RP3X. Card contra_razao intencionalmente vazio | 1. Sidebar -> CRM. 2. Aba "Pipeline" | 13 cards. Card "Contra Razoes" exibe badge "0" (estado zero). Demais 12 stages populados com contagens > 0 | Positivo |
| CT-CRM01-02 | Testar estado zero do card contra_razao (diferencial Conj. 2) | Pipeline carregado | 1. Clicar no card "Contra Razoes" (badge "0") | Card Expandido abre com tabela vazia. Mensagem "Nenhum edital nesta etapa." | Positivo |
| CT-CRM01-03 | Expandir card com dados | Card populado (ex: "Fase de Propostas") | 1. Clicar card com contagem > 0 | Tabela expandida: Numero, Orgao, Objeto, Valor Estimado, Tipo Venda, Data, Acao | Positivo |
| CT-CRM01-04 | Pipeline completamente vazio (FA-02) | Nenhum edital no CRM | 1. Verificar pipeline | Todos os 13 cards com badge "0" | Limite |

---

### UC-CRM02 — Parametrizacoes do CRM (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM02-01 | Verificar 27 valores seed via endpoint | Seed com parametrizacoes | 1. CRM -> "Parametrizacoes" | 3 secoes: Tipos de Edital (8), Agrupamentos (12), Motivos de Derrota (7). Total 27 | Positivo |
| CT-CRM02-02 | Criar novo Motivo de Derrota para RP3X | Aba ativa | 1. "+ Novo Motivo". 2. Nome: "Prazo inviavel". 3. "Salvar" | Novo motivo na lista. Contagem 8 | Positivo |
| CT-CRM02-03 | Nome duplicado (FE-02) | Motivo "Administrativo" existe | 1. "+ Novo Motivo". 2. Nome: "Administrativo". 3. "Salvar" | Alerta "Nome ja existe." Nao salvo | Negativo |
| CT-CRM02-04 | Nome vazio (FE-04) | Aba ativa | 1. "+ Novo Motivo". 2. Nome vazio. 3. "Salvar" | "Nome e obrigatorio." Nao salvo | Negativo |

---

### UC-CRM03 — Mapa Geografico de Processos (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM03-01 | Mapa interativo com titulo e circulos em SP, RJ, MG, RS, PR, BA | Seed com editais em 6 UFs | 1. CRM -> aba "Mapa" | Mapa Leaflet/OSM carrega. Titulo "Distribuicao Geografica (N editais)". Circulos azuis proporcionais em SP, RJ, MG, RS, PR, BA (6 UFs) | Positivo |
| CT-CRM03-02 | Popup ao clicar circulo com UF, total e breakdown por stage | Mapa com marcadores | 1. Clicar circulo de SP | Popup: nome UF (Sao Paulo), total de editais, breakdown por stage do pipeline | Positivo |
| CT-CRM03-03 | Clicar outros circulos (RJ, MG, RS, PR, BA) | Mapa carregado | 1. Clicar circulos de RJ, MG, RS, PR, BA sequencialmente | Cada popup exibe UF, total editais, stages. Dados diferentes por UF | Positivo |
| CT-CRM03-04 | Zoom e pan | Mapa carregado | 1. Scroll wheel para zoom. 2. Arrastar para pan | Zoom e pan funcionais | Positivo |

---

### UC-CRM04 — Agenda/Timeline de Etapas (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM04-01 | 6 itens de agenda: visita tecnica, impugnacao, recurso, apresentacao, renovacao, treinamento | Seed com 6 itens de agenda RP3X | 1. CRM -> aba "Agenda" | 6 itens visiveis: visita tecnica, impugnacao, recurso, apresentacao, renovacao, treinamento. Cada item com data e badge de urgencia | Positivo |
| CT-CRM04-02 | Badges de urgencia nos itens | Agenda carregada | 1. Verificar badges | Critico (vermelho), Urgente (laranja), Normal (verde) conforme proximidade da data | Positivo |
| CT-CRM04-03 | Sem eventos no periodo (FE-01) | Periodo sem eventos | 1. Navegar para periodo vazio | "Nenhum prazo neste periodo." Lista/calendario vazio | Negativo |

---

### UC-CRM05 — KPIs do CRM (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM05-01 | KPIs com numeros reais para RP3X | Editais com resultados registrados | 1. CRM -> aba "KPIs" | 6+ Stat Cards com numeros reais. Valores refletem dados de reagentes da RP3X | Positivo |
| CT-CRM05-02 | Drill-down em card "Perdidos" | Card "Perdidos" com valor > 0 | 1. Clicar "Perdidos / Participados" | Card Expandido com tabela de editais perdidos | Positivo |
| CT-CRM05-03 | Sem resultados registrados (FA-01) | Nenhum resultado | 1. Aba "KPIs" | 0/0 = 0% em todos. Ticket Medio R$ 0,00. "N/A" | Limite |

---

### UC-CRM06 — Registrar Decisao de Nao-Participacao (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM06-01 | Registrar 1a decisao de nao-participacao (das 2 previstas no tutorial) | Edital em "Em Analise" | 1. Pipeline -> "Em Analise" -> "Declinar". 2. Motivo: ex "Nao atende especificacao". 3. Detalhamento >= 20 chars. 4. Marcar "Manter em Monitoramento". 5. "Confirmar Declinio" | Edital move para "Monitoramento". Toast sucesso. Badges atualizam | Positivo |
| CT-CRM06-02 | Registrar 2a decisao de nao-participacao | Outro edital em "Em Analise" | 1. Repetir fluxo de declinio para segundo edital | Segundo edital declinado. "Monitoramento" incrementa para 2 | Positivo |
| CT-CRM06-03 | Declinar sem manter em monitoramento (FA-01) | Edital em "Em Analise" | 1. Declinar com checkbox desmarcado | Edital removido do pipeline ativo | Limite |
| CT-CRM06-04 | Detalhamento < 20 caracteres (FE-01) | Modal aberto | 1. Detalhamento: "curto" (< 20 chars). 2. "Confirmar" | Erro "Detalhamento deve ter no minimo 20 caracteres." Modal aberto | Negativo |
| CT-CRM06-05 | Sem motivo selecionado (FE-02) | Modal aberto | 1. Motivo vazio. 2. "Confirmar" | Erro "Selecione o motivo principal da nao-participacao." | Negativo |

---

### UC-CRM07 — Registrar Motivo de Perda (NOVO V3 - Nao Implementado)

| ID | Descricao | Pre-condicoes | Acoes do ator e dados de entrada | Saida esperada | Tipo |
|---|---|---|---|---|---|
| CT-CRM07-01 | Registrar motivo de perda direta (1a das 2 perdas) | Edital em "Perdidos" com badge "Pendente" | 1. "Resultados Definitivos" -> "Perdidos". 2. "Registrar Motivo". 3. Categoria (ex: "Nao tem equipamento"). 4. Descricao >= 30 chars. 5. Deixar checkbox CR desmarcado. 6. "Registrar" | Motivo registrado. Badge "Pendente" vira texto da categoria. "Origem Perda" = "Perda Direta" (vermelho) | Positivo |
| CT-CRM07-02 | Registrar motivo de perda com contra-razao (1 com contra-razao conforme tutorial) | Edital perdido apos contra-razao | 1. "Registrar Motivo". 2. Categoria. 3. Descricao >= 30 chars. 4. Marcar "Perda vinculada a Contra-Razao". 5. Preencher "Analise do processo de contra-razao". 6. "Registrar" | Motivo registrado. "Origem Perda" = "Perda apos CR" (roxo #f3e8ff). Campo de analise da CR salvo | Positivo |
| CT-CRM07-03 | Verificar 4 decisoes no total: 2 nao-participacao + 2 perda (1 com contra-razao) | Todas as decisoes registradas | 1. Verificar pipeline e KPIs | Pipeline reflete: 2 editais em "Monitoramento" (declinados), 2 em "Perdidos" com motivos registrados (1 perda direta + 1 perda apos CR). KPIs recalculados | Positivo |
| CT-CRM07-04 | Descricao < 30 caracteres (FE-01) | Modal aberto | 1. Descricao: "curta" (< 30 chars). 2. "Registrar" | Erro "Descricao deve ter no minimo 30 caracteres." Modal aberto | Negativo |
| CT-CRM07-05 | Sem categoria selecionada (FE-02) | Modal aberto | 1. Categoria vazia. 2. "Registrar" | Erro "Selecione a categoria do motivo de perda." | Negativo |
| CT-CRM07-06 | Perda direta sem contra-razao (FA-01) — verificar campo condicional | Modal aberto | 1. Checkbox CR desmarcado | Campo "Analise do processo de contra-razao" nao exibido. Fluxo simplificado | Limite |

---

## RESUMO DE COBERTURA

| Fase | UCs | Casos de Teste | Positivos | Negativos | Limite |
|---|---|---|---|---|---|
| FASE 1 — Follow-up | UC-FU01, UC-FU02, UC-FU03 | 10 | 5 | 4 | 1 |
| FASE 2 — Atas de Pregao | UC-AT01, UC-AT02, UC-AT03, UC-CT06 | 12 | 7 | 3 | 2 |
| FASE 3 — Execucao de Contratos | UC-CT01..CT05, UC-CT07..CT10 | 29 | 18 | 8 | 3 |
| FASE 4 — Contratado x Realizado | UC-CR01, UC-CR02, UC-CR03 | 10 | 6 | 3 | 1 |
| FASE 5 — CRM do Processo | UC-CRM01..CRM07 | 24 | 14 | 5 | 5 |
| **TOTAL** | **26 UCs** | **85** | **50** | **23** | **12** |

---

## Diferenciais do Conjunto 2 em relacao ao Conjunto 1

| Aspecto | Conjunto 1 (CH Hospitalar) | Conjunto 2 (RP3X) |
|---|---|---|
| **Cenario** | Equipamentos hospitalares | Reagentes de diagnostico |
| **Contratos** | CTR-2025-0087 | CTR-2026-RP3X-001 (comodato), CTR-2026-RP3X-002 (fornecimento) |
| **Empenho** | EMPH-2026-0001 (R$ 960.000) | EMPH-2026-RP3X-001 (R$ 480.000) |
| **Itens** | Analisador, Reagentes, Calibradores (sem valor, limite 120%) | Kit Hemograma (200 x R$ 1.800), Kit Glicose (500 x R$ 220), Controles (sem_valor, limite 110%) |
| **Card contra_razao** | Populado normalmente | **Vazio (estado zero)** — teste de card zerado |
| **Mapa UFs** | >= 4 UFs genericas | SP, RJ, MG, RS, PR, BA (6 UFs especificas) |
| **Agenda** | 6 itens genericos | visita tecnica, impugnacao, recurso, apresentacao, renovacao, treinamento |
| **Decisoes** | Genericas | 4 especificas: 2 nao-participacao + 2 perda (1 com contra-razao) |
| **Followup** | Edital generico ganho/perdido | Ganho: edital SP glicose. Perda: edital MG hemograma (motivo: preco) |

---

## Notas

- Todos os dados de entrada extraidos de `docs/tutorialsprint5-2.md` (RP3X)
- Diferencial principal: card `contra_razao` vazio para teste de estado zero
- Cenario de reagentes vs equipamentos para paridade de cobertura
- RNs testadas: RN-084, RN-206, RN-207, RN-209, RN-210, RN-214
- Testes de limite cobrem fluxos alternativos (FA) do V5
- Testes negativos cobrem fluxos de excecao (FE) do V5
- **Paridade total com Conjunto 1** para todos os elementos exceto os diferenciais acima

---

*Documento gerado em 21/04/2026. Casos de teste para validacao Sprint 5 — Conjunto 2 (RP3X Comercio e Representacoes Ltda.). Total: 85 casos de teste cobrindo 26 UCs.*
