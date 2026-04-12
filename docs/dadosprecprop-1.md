# Conjunto de Dados 1 — Precificacao e Proposta
# Validacao Automatizada e pelo Dono do Produto

**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Perfil:** Fornecedora de equipamentos medico-hospitalares para cirurgia, UTI, emergencia e diagnostico por imagem, atuante em licitacoes publicas via PNCP.
**Uso:** Conjunto principal — dados para validacao automatizada (Playwright) e referencia para o validador humano.

---

## Contexto de Acesso — Usuarios e Empresas

### Usuarios de Validacao

| Campo | Usuario Principal | Usuario Secundario |
|---|---|---|
| Email | valida1@valida.com.br | valida2@valida.com.br |
| Senha | 123456 | 123456 |
| Perfil | Superusuario | Superusuario |
| Empresa vinculada | CH Hospitalar | (associar previamente) |
| Papel | admin | admin |

### Fluxo de Login (Superusuario)

1. Acessar o sistema em `http://localhost:5175`
2. Preencher email e senha
3. Apos autenticacao, aparece **tela de selecao de empresa** (lista todas as empresas disponiveis)
4. Clicar em "CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda."
5. Sistema carrega o Dashboard com a empresa selecionada

### Pre-requisitos: Dados das Sprints 1 e 2

Os dados de empresa, portfolio e parametrizacoes do `dadosempportpar-1.md` (Sprint 1) e os editais captados e validados do `dadoscapval-1.md` (Sprint 2) devem estar cadastrados antes de executar os testes da Sprint 3. Os recursos relevantes sao:

#### Produtos cadastrados (Sprint 1)

| Produto | Fabricante | SKU | NCM | Area |
|---|---|---|---|---|
| Ultrassonografo Portatil Mindray M7T | Mindray | MD-M7T-BR-2024 | 9018.19.90 | Equip. Medico-Hospitalares |
| Monitor Multiparametrico Mindray iMEC10 Plus | Mindray Bio-Medical Electronics | MD-IMEC10-PLUS-BR | 9018.19.90 | Equip. Medico-Hospitalares |

#### Parametros comerciais (Sprint 1)

| Parametro | Valor |
|---|---|
| Markup Padrao (%) | 28 |
| Custos Fixos Mensais (R$) | 85.000,00 |
| Frete Base (R$) | 350,00 |

#### Edital salvo com itens (Sprint 2)

| Campo | Valor |
|---|---|
| Origem | Edital de "monitor multiparametrico" salvo no UC-CV03 |
| Status | GO (decisao positiva no UC-CV08) |
| Itens importados | Sim (UC-CV09) |
| Lotes extraidos | Sim (UC-CV09) |

---

## FASE 1 — PRECIFICACAO (PrecificacaoPage /app/precificacao)

---

## UC-P01 — Organizar Edital por Lotes

### Selecionar edital salvo

| Acao | Descricao |
|---|---|
| Acessar | Menu "Precificacao" no Sidebar |
| Selecionar edital | Edital de "monitor multiparametrico" salvo na Sprint 2 |
| Verificar | Itens do edital carregados na tabela |

### Lote 1 — Monitores e Acessorios

| Campo | Valor |
|---|---|
| Nome do Lote | Lote 1 — Monitores Multiparametricos |
| Especialidade | Monitoracao |
| Volume estimado | 10 unidades |
| Tipo de amostra | Unidade |

#### Itens do Lote 1

| # | Descricao | Qtd | Unid | Vlr Unit Est. |
|---|---|---|---|---|
| 1 | Monitor multiparametrico de 12 parametros, tela touch 12" | 10 | UN | R$ 18.500,00 |
| 3 | Cabo de ECG 5 vias para monitor multiparametrico | 10 | UN | R$ 350,00 |
| 4 | Sensor de SpO2 reutilizavel adulto | 15 | UN | R$ 280,00 |
| 5 | Suporte com rodizios para monitor multiparametrico | 10 | UN | R$ 950,00 |

### Lote 2 — Oximetria

| Campo | Valor |
|---|---|
| Nome do Lote | Lote 2 — Oximetros |
| Especialidade | Diagnostico |
| Volume estimado | 20 unidades |
| Tipo de amostra | Unidade |

#### Itens do Lote 2

| # | Descricao | Qtd | Unid | Vlr Unit Est. |
|---|---|---|---|---|
| 2 | Oximetro de pulso portatil com sensor neonatal | 20 | UN | R$ 1.200,00 |

### Acoes de organizacao

| Acao | Descricao |
|---|---|
| Mover item | Mover item 5 (Suporte) do Lote 1 para Lote 2 |
| Verificar | Item 5 aparece no Lote 2 e some do Lote 1 |
| Desfazer | Mover item 5 de volta ao Lote 1 |
| Criar lote vazio | Criar "Lote 3 — Reserva" sem itens |
| Excluir lote vazio | Excluir Lote 3 |

---

## UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)

### Executar vinculacao automatica

| Acao | Descricao |
|---|---|
| Selecionar lote | Lote 1 — Monitores Multiparametricos |
| Clicar | "Vincular Portfolio por IA" |
| Aguardar | Processamento do agente (10-30 segundos) |

### Resultados esperados da vinculacao

| Item do Edital | Produto Vinculado | Match (%) | Status |
|---|---|---|---|
| Monitor multiparametrico 12 parametros | Monitor Multiparametrico Mindray iMEC10 Plus | >= 80% | Vinculado automaticamente |
| Cabo de ECG 5 vias | (nenhum produto no portfolio) | < 20% | Nao vinculado |
| Sensor de SpO2 reutilizavel | (nenhum produto no portfolio) | < 20% | Nao vinculado |
| Suporte com rodizios | (nenhum produto no portfolio) | < 20% | Nao vinculado |

### Vinculacao manual (itens nao vinculados)

| Acao | Descricao |
|---|---|
| Item 3 (Cabo ECG) | Marcar como "Acessorio" — sem produto vinculado, preco manual |
| Item 4 (Sensor SpO2) | Marcar como "Acessorio" — sem produto vinculado, preco manual |
| Item 5 (Suporte) | Marcar como "Acessorio" — sem produto vinculado, preco manual |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Itens com match >= 20% | Vinculados automaticamente com badge verde |
| Itens com match < 20% | Nao vinculados, badge cinza "Sem match" |
| Botao "Desvincular" | Disponivel nos itens vinculados |
| Botao "Vincular Manual" | Disponivel nos itens nao vinculados |

---

## UC-P03 — Calculo Tecnico de Volumetria

### Dados de volumetria — Monitor (item principal, unidade)

| Campo | Valor |
|---|---|
| Item | Monitor multiparametrico 12 parametros |
| Tipo de produto | Equipamento (unidade) |
| Quantidade solicitada | 10 |
| Deteccao automatica | Unidade (nao kit/reagente) |
| Volume calculado | 10 unidades |
| Fator de conversao | 1.0 |

### Dados de volumetria — Sensor SpO2 (acessorio, consumivel)

| Campo | Valor |
|---|---|
| Item | Sensor de SpO2 reutilizavel adulto |
| Tipo de produto | Acessorio consumivel |
| Quantidade solicitada | 15 |
| Deteccao automatica | Unidade |
| Vida util estimada | 12 meses |
| Reposicao anual | 1x |
| Volume anualizado | 15 unidades/ano |

### Cenario kit/reagente (para validacao de deteccao)

| Campo | Valor |
|---|---|
| Descricao simulada | "Kit de reagentes para gasometria — 500 testes" |
| Tipo detectado | Kit/Reagente |
| Quantidade de kits | 5 |
| Testes por kit | 500 |
| Volume total (testes) | 2.500 testes |
| Fator de conversao | 500 testes/kit |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Deteccao automatica equipamento vs kit | Badge "Unidade" ou "Kit/Reagente" por item |
| Calculo de volume | Total exibido com unidade correta |
| Edicao manual do fator | Campo editavel, recalcula ao alterar |

---

## UC-P04 — Configurar Base de Custos (ERP + Tributario)

### Custos ERP — Monitor Multiparametrico iMEC10 Plus

| Campo | Valor |
|---|---|
| Produto | Monitor Multiparametrico Mindray iMEC10 Plus |
| SKU | MD-IMEC10-PLUS-BR |
| Custo unitario (ERP) | R$ 14.200,00 |
| Moeda de origem | BRL |
| Data de referencia | 2026-03-01 |
| Fonte | Importacao ERP manual |

### Custos ERP — Ultrassonografo Portatil Mindray M7T

| Campo | Valor |
|---|---|
| Produto | Ultrassonografo Portatil Mindray M7T |
| SKU | MD-M7T-BR-2024 |
| Custo unitario (ERP) | R$ 78.000,00 |
| Moeda de origem | BRL |
| Data de referencia | 2026-03-01 |
| Fonte | Importacao ERP manual |

### Custos ERP — Acessorios (sem produto vinculado)

| Item | Custo unitario |
|---|---|
| Cabo de ECG 5 vias | R$ 185,00 |
| Sensor de SpO2 reutilizavel adulto | R$ 145,00 |
| Suporte com rodizios | R$ 520,00 |

### Regras tributarias por NCM

| NCM | ICMS (%) | IPI (%) | PIS (%) | COFINS (%) | ISS (%) | Regime |
|---|---|---|---|---|---|---|
| 9018.19.90 | 12,0 | 0,0 | 1,65 | 7,60 | 0,0 | Lucro Real |
| 9018.90.99 | 12,0 | 0,0 | 1,65 | 7,60 | 0,0 | Lucro Real |

> **Nota:** Equipamentos medico-hospitalares NCM 9018 possuem IPI zero (Dec. 7.660/2011). ICMS interestadual pode variar conforme UF de destino.

### Upload de tabela de custos (alternativa)

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Formato | CSV ou PDF com tabela de custos |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Custo carregado | Valor exibido na coluna "Custo ERP" da tabela de itens |
| Tributos aplicados | Linha detalhada com ICMS, PIS, COFINS por NCM |
| Total com impostos | Custo + impostos calculado automaticamente |
| Edicao manual | Campos editaveis para ajuste fino |

---

## UC-P05 — Montar Preco Base (Camada B)

### Modo 1 — Custo + Markup (modo padrao)

#### Monitor Multiparametrico iMEC10 Plus

| Componente | Valor |
|---|---|
| Custo unitario (ERP) | R$ 14.200,00 |
| ICMS (12%) | R$ 1.704,00 |
| PIS (1,65%) | R$ 234,30 |
| COFINS (7,60%) | R$ 1.079,20 |
| Subtotal com impostos | R$ 17.217,50 |
| Frete | R$ 350,00 |
| Custo total | R$ 17.567,50 |
| Markup (28%) | R$ 4.918,90 |
| **Preco Base (Camada B)** | **R$ 22.486,40** |

#### Ultrassonografo Portatil Mindray M7T

| Componente | Valor |
|---|---|
| Custo unitario (ERP) | R$ 78.000,00 |
| ICMS (12%) | R$ 9.360,00 |
| PIS (1,65%) | R$ 1.287,00 |
| COFINS (7,60%) | R$ 5.928,00 |
| Subtotal com impostos | R$ 94.575,00 |
| Frete | R$ 350,00 |
| Custo total | R$ 94.925,00 |
| Markup (28%) | R$ 26.579,00 |
| **Preco Base (Camada B)** | **R$ 121.504,00** |

### Modo 2 — Preco manual

| Item | Preco Base Manual |
|---|---|
| Cabo de ECG 5 vias | R$ 320,00 |
| Sensor de SpO2 reutilizavel | R$ 255,00 |
| Suporte com rodizios | R$ 890,00 |

### Modo 3 — Upload de tabela de precos

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Formato esperado | CSV/Excel com colunas: Item, Preco Base |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Selecao de modo | Radio button: "Custo + Markup" / "Manual" / "Upload Tabela" |
| Calculo automatico | Preco Base calculado ao confirmar modo Custo + Markup |
| Edicao pos-calculo | Campo Preco Base editavel mesmo apos calculo |
| Markup editavel | Campo de markup por item (override do padrao 28%) |

---

## UC-P06 — Definir Valor de Referencia (Camada C)

### Importacao automatica do edital

| Item | Vlr Referencia Edital | Fonte |
|---|---|---|
| Monitor multiparametrico 12 parametros | R$ 18.500,00 | Importado do edital (UC-CV09) |
| Cabo de ECG 5 vias | R$ 350,00 | Importado do edital |
| Sensor de SpO2 reutilizavel | R$ 280,00 | Importado do edital |
| Suporte com rodizios | R$ 950,00 | Importado do edital |
| Oximetro de pulso portatil | R$ 1.200,00 | Importado do edital |

### Modo alternativo — percentual sobre preco base

| Item | Preco Base (B) | Percentual | Vlr Referencia (C) |
|---|---|---|---|
| Monitor iMEC10 Plus | R$ 22.486,40 | -18% | R$ 18.438,85 |
| Ultrassonografo M7T | R$ 121.504,00 | -13% | R$ 105.708,48 |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Auto-importacao | Valores do edital preenchidos automaticamente ao abrir |
| Modo percentual | Toggle "% sobre Base" ativa campo de percentual |
| Comparacao B vs C | Indicador visual: verde se C >= B, vermelho se C < B |
| Alerta margem negativa | Warning se Vlr Referencia < Custo Total |

---

## UC-P07 — Estruturar Lances (Camadas D e E)

### Lance Inicial (Camada D)

| Item | Vlr Referencia (C) | Lance Inicial (D) | Desconto s/ Ref (%) |
|---|---|---|---|
| Monitor iMEC10 Plus | R$ 18.500,00 | R$ 17.800,00 | 3,8% |
| Cabo de ECG 5 vias | R$ 350,00 | R$ 338,00 | 3,4% |
| Sensor de SpO2 | R$ 280,00 | R$ 270,00 | 3,6% |
| Suporte com rodizios | R$ 950,00 | R$ 915,00 | 3,7% |

### Lance Minimo (Camada E)

| Item | Lance Inicial (D) | Lance Minimo (E) | Margem s/ Custo (%) |
|---|---|---|---|
| Monitor iMEC10 Plus | R$ 17.800,00 | R$ 16.500,00 | 17,5% |
| Cabo de ECG 5 vias | R$ 338,00 | R$ 295,00 | 59,5% |
| Sensor de SpO2 | R$ 270,00 | R$ 230,00 | 58,6% |
| Suporte com rodizios | R$ 915,00 | R$ 780,00 | 50,0% |

### Validacao de limites

| Regra | Descricao |
|---|---|
| D <= C | Lance Inicial nao pode exceder Valor de Referencia |
| E <= D | Lance Minimo nao pode exceder Lance Inicial |
| E >= Custo | Lance Minimo nao pode ser inferior ao custo total (alerta) |
| Margem minima | Warning se margem sobre custo < 5% |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Campos D e E | Editaveis por item |
| Calculo de desconto | Automatico ao preencher D (% sobre C) |
| Calculo de margem | Automatico ao preencher E (% sobre custo) |
| Alerta margem zero | Badge vermelho se E <= custo total |
| Resumo visual | Barra horizontal mostrando faixas B-C-D-E por item |

---

## UC-P08 — Definir Estrategia Competitiva

### Perfil "Quero ganhar"

| Campo | Valor |
|---|---|
| Perfil estrategico | Quero ganhar |
| Lote alvo | Lote 1 — Monitores Multiparametricos |
| Desconto agressivo (%) | 8,0 |
| Lance inicial sugerido | R$ 17.020,00 (8% abaixo de C) |
| Lance minimo sugerido | R$ 15.900,00 (margem de 13,2% sobre custo) |

### Perfil "Nao ganhei"

| Campo | Valor |
|---|---|
| Perfil estrategico | Nao ganhei |
| Lote alvo | Lote 2 — Oximetros |
| Acao pos-derrota | Registrar preco vencedor para historico |
| Preco vencedor observado | R$ 980,00 |
| Diferenca vs lance minimo | -18,3% |
| Recomendacao IA | "Revisar custo de aquisicao ou buscar fornecedor alternativo" |

### Simulacao de cenarios

| Cenario | Desconto (%) | Lance (R$) | Margem (%) | Probabilidade estimada |
|---|---|---|---|---|
| Conservador | 3,0 | R$ 17.945,00 | 24,2% | Baixa |
| Moderado | 6,0 | R$ 17.390,00 | 20,4% | Media |
| Agressivo | 10,0 | R$ 16.650,00 | 15,3% | Alta |
| Limite | 14,0 | R$ 15.910,00 | 10,1% | Muito alta |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Selecao de perfil | Radio: "Quero ganhar" / "Nao ganhei" |
| Simulador | Slider de desconto com recalculo em tempo real |
| Grafico de cenarios | Barra comparativa dos 4 cenarios |
| Salvar estrategia | Botao "Salvar Estrategia" com toast de sucesso |

---

## UC-P09 — Consultar Historico de Precos (Camada F)

### Busca de historico local

| Campo | Valor |
|---|---|
| Produto | Monitor Multiparametrico Mindray iMEC10 Plus |
| Periodo | Ultimos 24 meses |
| Resultado esperado | Precos de licitacoes anteriores (se houver) |

### Busca PNCP — Lances vencedores

| Campo | Valor |
|---|---|
| Termo de busca | monitor multiparametrico 12 parametros |
| NCM | 9018.19.90 |
| Periodo | Ultimos 12 meses |

### Historico de precos esperado (dados representativos)

| Data | Orgao | UF | Vlr Estimado | Vlr Homologado | Vencedor |
|---|---|---|---|---|---|
| 2025-11-15 | Hospital Municipal de SP | SP | R$ 19.200,00 | R$ 16.800,00 | Medic Supply Ltda. |
| 2025-08-22 | HCFMUSP | SP | R$ 20.500,00 | R$ 17.350,00 | Equiphos Comercio |
| 2025-06-10 | Hospital Estadual RJ | RJ | R$ 18.900,00 | R$ 15.900,00 | CH Hospitalar |
| 2025-03-05 | Secretaria Saude MG | MG | R$ 21.000,00 | R$ 18.200,00 | BioMedica Brasil |
| 2024-12-18 | Hospital Universitario PR | PR | R$ 17.500,00 | R$ 14.950,00 | TechMed Equipamentos |

### Busca PNCP — Contratos

| Campo | Valor |
|---|---|
| Tipo | Atas de Registro de Preco |
| NCM | 9018.19.90 |
| Resultado esperado | Contratos vigentes com precos unitarios |

### Estatisticas de historico

| Indicador | Valor |
|---|---|
| Preco medio homologado | R$ 16.640,00 |
| Preco mediano | R$ 16.800,00 |
| Menor preco | R$ 14.950,00 |
| Maior preco | R$ 18.200,00 |
| Desconto medio s/ estimado | 14,2% |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Tabela de historico | Preenchida com dados do PNCP |
| Estatisticas | Cards com media, mediana, min, max |
| Grafico de tendencia | Linha temporal de precos |
| Sugestao Camada F | Faixa sugerida com base no historico |

---

## UC-P10 — Gestao de Comodato

### Cadastro de equipamento em comodato

| Campo | Valor |
|---|---|
| Equipamento | Monitor Multiparametrico Mindray iMEC10 Plus |
| Numero de serie | MR-IMEC10-2026-001 |
| Valor do equipamento | R$ 22.486,40 |
| Prazo do comodato | 60 meses |
| Orgao contratante | Hospital Municipal de Sao Paulo |
| Data de inicio | 2026-04-01 |
| Data de termino | 2031-03-31 |

### Amortizacao mensal

| Campo | Valor |
|---|---|
| Metodo | Linear |
| Valor mensal | R$ 374,77 |
| Valor residual (60 meses) | R$ 0,00 |
| Seguro mensal | R$ 112,43 |
| Manutencao mensal | R$ 224,86 |
| **Custo mensal total comodato** | **R$ 712,06** |

### Tabela de amortizacao (primeiros 6 meses)

| Mes | Amortizacao | Seguro | Manutencao | Total Mes | Saldo Devedor |
|---|---|---|---|---|---|
| 1 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 22.111,63 |
| 2 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 21.736,86 |
| 3 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 21.362,09 |
| 4 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 20.987,32 |
| 5 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 20.612,55 |
| 6 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 20.237,78 |

### Acoes CRUD

| Acao | Descricao |
|---|---|
| Criar | Cadastrar comodato com dados acima |
| Listar | Verificar comodato na lista de comodatos ativos |
| Editar | Alterar prazo para 48 meses (recalcula amortizacao para R$ 468,47/mes) |
| Excluir | Excluir comodato e verificar remocao da lista |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Formulario de cadastro | Todos os campos preenchidos |
| Calculo automatico | Amortizacao mensal calculada ao salvar |
| Tabela de amortizacao | Exibida com todos os meses |
| Edicao recalcula | Alterar prazo recalcula valores |

---

## UC-P11 — Pipeline IA de Precificacao

### Execucao do pipeline

| Acao | Descricao |
|---|---|
| Selecionar lote | Lote 1 — Monitores Multiparametricos |
| Clicar | "Executar Pipeline IA de Precificacao" |
| Aguardar | Processamento (30-120 segundos) |

### Etapas do pipeline

| Etapa | Descricao | Status esperado |
|---|---|---|
| 1. Busca PNCP automatica | Busca precos historicos por NCM e termo | Concluida |
| 2. Extracao de vencedores | Identifica vencedores e precos das atas | Concluida |
| 3. Analise estatistica | Calcula media, mediana, desvio padrao | Concluida |
| 4. Sugestao faixas A-E | Sugere valores para cada camada | Concluida |

### Sugestoes geradas pelo pipeline (Monitor iMEC10 Plus)

| Camada | Descricao | Valor Sugerido | Justificativa |
|---|---|---|---|
| A (Custo) | Custo total com impostos | R$ 17.567,50 | Base ERP + tributos + frete |
| B (Preco Base) | Custo + markup | R$ 22.486,40 | Markup 28% aplicado |
| C (Referencia) | Valor de referencia do edital | R$ 18.500,00 | Importado do edital |
| D (Lance Inicial) | Primeiro lance sugerido | R$ 17.200,00 | Mediana historica + 3% |
| E (Lance Minimo) | Piso competitivo | R$ 15.500,00 | Proximo ao menor preco historico |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Progresso do pipeline | Barra de progresso com etapas |
| Log de execucao | Texto detalhado de cada etapa |
| Sugestoes editaveis | Valores sugeridos editaveis antes de aplicar |
| Botao "Aplicar Sugestoes" | Preenche camadas B-E com valores do pipeline |
| Botao "Descartar" | Ignora sugestoes e mantem valores atuais |

---

## UC-P12 — Relatorio de Custos e Precos

### Geracao do relatorio

| Acao | Descricao |
|---|---|
| Selecionar lote | Lote 1 — Monitores Multiparametricos |
| Clicar | "Gerar Relatorio de Custos e Precos" |
| Aguardar | Geracao do relatorio (10-30 segundos) |

### Conteudo esperado do relatorio

| Secao | Conteudo |
|---|---|
| Cabecalho | Empresa, edital, lote, data de geracao |
| Resumo executivo | Valor total do lote, margem media, estrategia |
| Tabela de custos | Custo ERP, impostos, frete por item |
| Tabela de precos | Camadas A-E por item |
| Historico PNCP | Precos de referencia do mercado |
| Analise de competitividade | Posicionamento vs concorrentes |
| Comodato (se aplicavel) | Resumo da amortizacao |
| Recomendacoes | Sugestoes da IA para otimizacao |

### Formatos de exportacao

| Formato | Verificacao |
|---|---|
| Markdown | Visualizado na tela com formatacao |
| PDF | Download de arquivo PDF |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Relatorio gerado | Exibido na tela em markdown |
| Botao "Baixar PDF" | Download de arquivo .pdf |
| Dados corretos | Valores consistentes com camadas B-E configuradas |
| Impressao | Relatorio formatado para impressao |

---

## FASE 2 — PROPOSTA (PropostaPage /app/proposta)

---

## UC-R01 — Gerar Proposta Tecnica (Motor Automatico)

### Selecionar edital e lote

| Acao | Descricao |
|---|---|
| Acessar | Menu "Proposta" no Sidebar |
| Selecionar edital | Edital de "monitor multiparametrico" |
| Selecionar lote | Lote 1 — Monitores Multiparametricos |
| Clicar | "Gerar Proposta Tecnica" |
| Aguardar | Processamento do motor (30-60 segundos) |

### Dados cruzados na proposta (precificacao x requisitos do edital)

| Campo da Proposta | Origem | Valor |
|---|---|---|
| Item principal | Edital | Monitor multiparametrico 12 parametros, tela touch 12" |
| Produto ofertado | Portfolio | Monitor Multiparametrico Mindray iMEC10 Plus |
| Fabricante | Portfolio | Mindray Bio-Medical Electronics |
| Modelo | Portfolio | iMEC10 Plus |
| Preco unitario | Precificacao (D) | R$ 17.800,00 |
| Quantidade | Edital | 10 |
| Valor total | Calculado | R$ 178.000,00 |
| Prazo de entrega | Parametros | 30 dias |
| Garantia | Edital/padrao | 12 meses |
| Registro ANVISA | Portfolio | 80262090001 |

### Especificacoes tecnicas na proposta

| Requisito do Edital | Ofertado | Atende |
|---|---|---|
| 12 parametros simultaneos | 10 parametros | Parcial |
| Tela touch >= 12" | TFT Touch 12,1" | Sim |
| SpO2 integrado | Sim | Sim |
| ECG 12 derivacoes | Sim (12 derivacoes) | Sim |
| NIBP integrado | Sim | Sim |
| EtCO2 integrado | Sim | Sim |
| Bateria >= 4 horas | 6 horas | Sim |
| Peso <= 5 kg | 4,1 kg | Sim |
| Registro ANVISA vigente | 80262090001 | Sim |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Proposta gerada | Documento em markdown exibido na tela |
| Tabela de itens | Itens com preco, qtd, total |
| Especificacoes cruzadas | Tabela requisito vs ofertado |
| Alertas de nao conformidade | Badge amarelo para itens parciais |
| Status | "Rascunho" apos geracao |

---

## UC-R02 — Upload de Proposta Externa

### Upload de documento

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Tipo | Proposta tecnica externa (PDF) |
| Descricao | "Proposta alternativa elaborada pelo setor comercial" |
| Lote vinculado | Lote 1 — Monitores Multiparametricos |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Upload concluido | Badge "Enviado" com nome do arquivo |
| Visualizacao | Botao "Visualizar" abre o PDF |
| Substituicao | Upload de novo arquivo substitui o anterior |
| Exclusao | Botao "Remover" exclui o arquivo enviado |

---

## UC-R03 — Personalizar Descricao Tecnica (A/B)

### Variacao A — Descricao tecnica (padrao)

| Campo | Valor |
|---|---|
| Estilo | Tecnico |
| Produto | Monitor Multiparametrico Mindray iMEC10 Plus |
| Descricao | "Monitor multiparametrico para UTI e pronto-socorro, 10 parametros simultaneos, tela touch TFT colorida de 12,1 polegadas, monitoracao continua de ECG (12 derivacoes), SpO2, NIBP, temperatura, frequencia respiratoria e EtCO2. Bateria com autonomia de 6 horas. Peso de 4,1 kg. Alimentacao 100-240 VAC. Registro ANVISA 80262090001." |

### Variacao B — Descricao comercial

| Campo | Valor |
|---|---|
| Estilo | Comercial |
| Produto | Monitor Multiparametrico Mindray iMEC10 Plus |
| Descricao | "Monitor de sinais vitais Mindray iMEC10 Plus — solucao completa de monitoracao a beira do leito com 10 parametros, tela sensivel ao toque de alta resolucao (12,1"), design compacto e leve (4,1 kg), ideal para UTI, centro cirurgico e pronto-socorro. Autonomia de bateria de ate 6 horas para transporte intra-hospitalar. Produto com registro ANVISA vigente (80262090001) e suporte tecnico nacional." |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Duas variacoes | Abas "Variacao A" e "Variacao B" visiveis |
| Edicao inline | Texto editavel em cada variacao |
| Selecionar ativa | Radio para escolher qual variacao vai na proposta |
| Gerar por IA | Botao "Gerar Variacao B por IA" cria texto alternativo |
| Preview | Visualizacao lado a lado das variacoes |

---

## UC-R04 — Auditoria ANVISA (Semaforo Regulatorio)

### Consulta de registro ANVISA

| Campo | Valor |
|---|---|
| Produto | Monitor Multiparametrico Mindray iMEC10 Plus |
| Numero de registro | 80262090001 |
| Fabricante | Mindray Bio-Medical Electronics |

### Resultado esperado — Semaforo

| Indicador | Status | Cor | Descricao |
|---|---|---|---|
| Registro ANVISA | Vigente | Verde | Registro ativo e dentro da validade |
| Classe de risco | III | Amarelo | Produto classe III — requer cuidados adicionais |
| Vencimento do registro | > 12 meses | Verde | Registro vence em mais de 1 ano |
| AFE da empresa | Vigente | Verde | Autorizacao de funcionamento ativa |

### Cenario de alerta (produto sem registro)

| Indicador | Status | Cor | Descricao |
|---|---|---|---|
| Registro ANVISA | Nao encontrado | Vermelho | Produto sem registro ANVISA valido |
| Recomendacao | — | — | "Nao incluir na proposta ate regularizacao" |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Semaforo visual | Icone verde/amarelo/vermelho por indicador |
| Resumo geral | Badge geral: "Aprovado" (verde), "Atencao" (amarelo), "Bloqueado" (vermelho) |
| Detalhes clicaveis | Clicar no indicador abre detalhes da consulta |
| Data da consulta | Timestamp da ultima verificacao ANVISA |

---

## UC-R05 — Auditoria Documental + Smart Split

### Checklist documental

| # | Documento | Status | Origem |
|---|---|---|---|
| 1 | Proposta Tecnica (assinada) | Gerada | UC-R01 |
| 2 | Certidao Negativa de Debitos Federais | Disponivel | Sprint 1 (UC-F04) |
| 3 | Certidao de Regularidade FGTS | Disponivel | Sprint 1 (UC-F04) |
| 4 | Certidao Negativa de Debitos Trabalhistas | Disponivel | Sprint 1 (UC-F04) |
| 5 | Contrato Social | Disponivel | Sprint 1 (UC-F03) |
| 6 | Alvara de Funcionamento | Disponivel | Sprint 1 (UC-F03) |
| 7 | Atestado de Capacidade Tecnica | Pendente | (nao cadastrado) |
| 8 | Registro ANVISA do produto | Vigente | UC-R04 |
| 9 | AFE — Autorizacao de Funcionamento ANVISA | Pendente | (verificar cadastro) |
| 10 | Balanco Patrimonial | Pendente | (nao cadastrado) |

### Upload de documento pendente

| Campo | Valor |
|---|---|
| Documento | Atestado de Capacidade Tecnica |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Validade | 2027-06-30 |

### Smart Split (documento > 25 MB)

| Campo | Valor |
|---|---|
| Arquivo simulado | `tests/fixtures/teste_upload.pdf` |
| Tamanho simulado | > 25 MB (para validar a funcionalidade) |
| Partes geradas | Parte 1 (25 MB), Parte 2 (restante) |
| Nomeacao | documento_parte1.pdf, documento_parte2.pdf |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Checklist completa | Todos os documentos exigidos listados |
| Status por documento | Badges: Disponivel (verde), Pendente (amarelo), Vencido (vermelho) |
| Upload de pendente | Atualiza status para "Disponivel" apos upload |
| Smart Split | Botao "Dividir PDF" ativo quando arquivo > 25 MB |
| Progresso | Indicador de completude (%) da documentacao |

---

## UC-R06 — Exportar Dossie Completo

### Conteudo do dossie

| Secao | Conteudo |
|---|---|
| Capa | Empresa, edital, lote, data |
| Proposta Tecnica | Documento gerado no UC-R01 |
| Planilha de Precos | Tabela com itens, quantidades, precos unitarios e totais |
| Documentos de Habilitacao | PDFs de certidoes, contrato social, etc. |
| Registro ANVISA | Comprovante de consulta |
| Atestados Tecnicos | PDFs de atestados de capacidade |

### Formatos de exportacao

| Formato | Extensao | Verificacao |
|---|---|---|
| PDF consolidado | .pdf | Documento unico com todas as secoes |
| DOCX editavel | .docx | Documento Word editavel |
| ZIP com arquivos separados | .zip | Pasta com cada documento individual |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Botao "Exportar Dossie" | Abre modal com opcoes de formato |
| Selecao de formato | Radio: PDF / DOCX / ZIP |
| Download | Arquivo baixado com nome padrao: `dossie_[edital]_[data].ext` |
| Conteudo PDF | Todas as secoes presentes com formatacao |
| Conteudo ZIP | Pasta com arquivos individuais nomeados |

---

## UC-R07 — Gerenciar Status e Submissao

### Workflow de status

| Passo | Status | Acao | Verificacao |
|---|---|---|---|
| 1 | Rascunho | Proposta recem-criada (UC-R01) | Badge cinza "Rascunho" |
| 2 | Em Revisao | Clicar "Enviar para Revisao" | Badge amarelo "Em Revisao" |
| 3 | Aprovada | Clicar "Aprovar Proposta" | Badge verde "Aprovada" |
| 4 | Enviada | Clicar "Marcar como Enviada" | Badge azul "Enviada" |

### Dados de submissao

| Campo | Valor |
|---|---|
| Protocolo de envio | PROT-2026-04-001 |
| Data de envio | 2026-04-08 |
| Hora de envio | 14:30 |
| Canal de envio | Portal de Compras (manual) |
| Responsavel pelo envio | Diego Ricardo Munoz |
| Observacoes | "Proposta enviada via portal comprasnet, protocolo confirmado" |

### Transicoes bloqueadas

| De | Para | Motivo do bloqueio |
|---|---|---|
| Rascunho | Aprovada | Nao pode pular "Em Revisao" |
| Rascunho | Enviada | Nao pode pular etapas |
| Enviada | Rascunho | Nao pode retroceder apos envio |

### Transicoes permitidas (retrocesso)

| De | Para | Acao |
|---|---|---|
| Em Revisao | Rascunho | Clicar "Devolver para Rascunho" |
| Aprovada | Em Revisao | Clicar "Devolver para Revisao" |

### Verificacoes

| Verificacao | Esperado |
|---|---|
| Badge de status | Cor e texto mudam conforme transicao |
| Historico de transicoes | Tabela com: data, status anterior, novo status, usuario |
| Bloqueio de edicao | Proposta "Enviada" nao permite edicao |
| Formulario de submissao | Campos de protocolo, data, canal visiveis ao aprovar |
| Confirmacao | Modal de confirmacao antes de cada transicao |

---

## Cenarios de Borda Cobertos

### Precificacao

| Cenario | UC | Descricao | Resultado esperado |
|---|---|---|---|
| Markup zero | UC-P05 | Definir markup = 0% | Preco Base = Custo Total (sem margem) |
| Margem negativa | UC-P07 | Lance Minimo (E) < Custo Total (A) | Alerta vermelho "Margem negativa" |
| Valor de referencia ausente | UC-P06 | Edital sem valor estimado por item | Campo vazio, modo percentual obrigatorio |
| Historico PNCP vazio | UC-P09 | Nenhum resultado na busca PNCP | Mensagem "Nenhum historico encontrado" |
| Custo ERP nao importado | UC-P04 | Produto sem custo cadastrado | Campo vazio, alerta "Custo nao informado" |
| Comodato sem amortizacao | UC-P10 | Prazo = 0 meses | Validacao bloqueia salvamento |
| Pipeline IA timeout | UC-P11 | Busca PNCP demora mais de 120s | Timeout com mensagem de erro |
| Lote sem itens | UC-P01 | Criar lote vazio e tentar precificar | Mensagem "Lote sem itens para precificar" |
| Item sem produto vinculado | UC-P02 | Acessorio sem match no portfolio | Permite preco manual, sem dados de custo ERP |

### Proposta

| Cenario | UC | Descricao | Resultado esperado |
|---|---|---|---|
| Proposta sem precificacao | UC-R01 | Gerar proposta sem ter configurado precos | Alerta "Configure precos antes de gerar proposta" |
| ANVISA registro vencido | UC-R04 | Registro com validade expirada | Semaforo vermelho, bloqueio recomendado |
| Documento vencido na checklist | UC-R05 | Certidao com validade expirada | Badge vermelho "Vencido" no checklist |
| PDF > 25 MB | UC-R05 | Upload de arquivo grande | Smart Split ativado automaticamente |
| Exportacao sem documentos completos | UC-R06 | Dossie com documentos pendentes | Warning "Documentacao incompleta" no dossie |
| Transicao de status invalida | UC-R07 | Tentar pular de Rascunho para Enviada | Botao desabilitado ou erro de validacao |
| Dupla submissao | UC-R07 | Marcar como enviada duas vezes | Sistema impede duplicacao |

---

## Dados Auxiliares — Fixtures e Arquivos

### Arquivos de teste

| Uso | Caminho | Alternativa |
|---|---|---|
| PDF generico (propostas, documentos) | `tests/fixtures/teste_upload.pdf` | Qualquer PDF < 2 MB |
| Tabela de custos (upload) | `tests/fixtures/teste_upload.pdf` | CSV com colunas Item, Custo |
| Proposta externa | `tests/fixtures/teste_upload.pdf` | PDF de proposta comercial |
| Documento grande (Smart Split) | `tests/fixtures/teste_upload.pdf` | PDF > 25 MB (simular) |

### Valores de referencia para calculo

| Parametro | Valor | Origem |
|---|---|---|
| Markup padrao | 28% | Sprint 1 (UC-F15) |
| Frete base | R$ 350,00 | Sprint 1 (UC-F15) |
| ICMS (SP) | 12% | Tabela NCM |
| PIS | 1,65% | Regime Lucro Real |
| COFINS | 7,60% | Regime Lucro Real |
| IPI (NCM 9018) | 0% | Decreto 7.660/2011 |

---

## Notas para o Dono do Produto

1. **Ordem de execucao recomendada:** UC-P01 a UC-P12 (Precificacao), depois UC-R01 a UC-R07 (Proposta). A Proposta depende de precos configurados na Precificacao.
2. **Pre-requisitos obrigatorios:** Sprint 1 (empresa, produtos, parametros comerciais) e Sprint 2 (edital salvo com itens e lotes) devem estar completos antes de iniciar a Sprint 3.
3. **Edital de referencia:** Os testes usam o edital de "monitor multiparametrico" salvo no UC-CV03 da Sprint 2. Se o edital nao estiver disponivel, executar primeiro os UCs da Sprint 2.
4. **Precos do PNCP variam:** Os valores de historico (UC-P09) sao representativos. Os precos reais dependem dos editais publicados no momento da execucao.
5. **Pipeline IA (UC-P11):** requer conexao com PNCP e servico de IA operacional. Timeout padrao de 120 segundos. Em ambiente sem internet, os dados de historico nao serao preenchidos.
6. **ANVISA (UC-R04):** a consulta depende de conexao externa com a base da ANVISA. O registro 80262090001 e real e deve retornar resultado. Em ambiente offline, usar dados mockados.
7. **Smart Split (UC-R05):** a funcionalidade de divisao automatica de PDF so e acionada para arquivos > 25 MB. Para testar, usar um PDF grande ou simular o cenario via interface.
8. **Workflow de status (UC-R07):** as transicoes seguem ordem estrita: Rascunho -> Em Revisao -> Aprovada -> Enviada. Retrocesso e permitido ate "Aprovada", mas nao apos "Enviada".
9. **Valores calculados:** os precos nas camadas B-E foram calculados com base nos custos e parametros do Sprint 1. Pequenas diferencas de arredondamento sao aceitaveis.
10. **Empresa real:** CH Hospitalar — CNPJ 43.712.232/0001-85 — ATIVA na Receita Federal desde 30/09/2021 — Socio: Diego Ricardo Munoz.
