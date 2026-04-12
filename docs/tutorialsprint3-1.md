# Tutorial de Validacao — Sprint 3 — Conjunto 1
# Empresa: CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.

**Data:** 08/04/2026
**Dados:** dadosprecprop-1.md
**Referencia:** CASOS DE USO PRECIFICACAO E PROPOSTA V2.md
**UCs:** P01-P12, R01-R07 (19 casos de uso)
**Publico:** Validador Automatizado (Playwright) e Dono do Produto

---

> **Como usar este tutorial**
>
> Siga cada passo na ordem indicada. Os dados a inserir estao destacados em `codigo`. As verificacoes ao final de cada UC dizem exatamente o que deve estar na tela para confirmar que o sistema funcionou corretamente. Quando algo nao esta como esperado, a secao "Sinais de problema" orienta o que reportar.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| URL | http://pasteurjr.servehttp.com:5179 |
| Usuario | valida1@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa alvo | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |

### Fluxo de login

1. Acessar `http://pasteurjr.servehttp.com:5179`
2. Email: `valida1@valida.com.br` / Senha: `123456`
3. Tela de selecao de empresa -> clicar "CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda."
4. Dashboard carrega com CH Hospitalar como empresa ativa

### Menus extras visiveis (superusuario)
- **Usuarios** — CRUD de usuarios
- **Associar Empresa/Usuario** — vincular usuarios a empresas
- **Selecionar Empresa** — trocar empresa ativa

### Pre-requisitos globais

Os dados das Sprints 1 e 2 devem estar cadastrados antes de executar os testes da Sprint 3:

**Sprint 1 — Empresa, Portfolio e Parametrizacao:**
- Empresa CH Hospitalar cadastrada com CNPJ `43.712.232/0001-85`
- Produtos: `Ultrassonografo Portatil Mindray M7T` (SKU `MD-M7T-BR-2024`) e `Monitor Multiparametrico Mindray iMEC10 Plus` (SKU `MD-IMEC10-PLUS-BR`)
- Markup padrao: `28%`, Custos fixos mensais: `R$ 85.000,00`, Frete base: `R$ 350,00`

**Sprint 2 — Captacao e Validacao:**
- Edital de "monitor multiparametrico" salvo (UC-CV03), com decisao GO (UC-CV08) e itens/lotes importados (UC-CV09)

---

## Indice

- [UC-P01 — Organizar Edital por Lotes](#uc-p01--organizar-edital-por-lotes)
- [UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)](#uc-p02--selecao-inteligente-de-portfolio-agente-assistido)
- [UC-P03 — Calculo Tecnico de Volumetria](#uc-p03--calculo-tecnico-de-volumetria)
- [UC-P04 — Configurar Base de Custos (ERP + Tributario)](#uc-p04--configurar-base-de-custos-erp--tributario)
- [UC-P05 — Montar Preco Base (Camada B)](#uc-p05--montar-preco-base-camada-b)
- [UC-P06 — Definir Valor de Referencia (Camada C)](#uc-p06--definir-valor-de-referencia-camada-c)
- [UC-P07 — Estruturar Lances (Camadas D e E)](#uc-p07--estruturar-lances-camadas-d-e-e)
- [UC-P08 — Definir Estrategia Competitiva](#uc-p08--definir-estrategia-competitiva)
- [UC-P09 — Consultar Historico de Precos (Camada F)](#uc-p09--consultar-historico-de-precos-camada-f)
- [UC-P10 — Gestao de Comodato](#uc-p10--gestao-de-comodato)
- [UC-P11 — Pipeline IA de Precificacao](#uc-p11--pipeline-ia-de-precificacao)
- [UC-P12 — Relatorio de Custos e Precos](#uc-p12--relatorio-de-custos-e-precos)
- [UC-R01 — Gerar Proposta Tecnica (Motor Automatico)](#uc-r01--gerar-proposta-tecnica-motor-automatico)
- [UC-R02 — Upload de Proposta Externa](#uc-r02--upload-de-proposta-externa)
- [UC-R03 — Personalizar Descricao Tecnica (A/B)](#uc-r03--personalizar-descricao-tecnica-ab)
- [UC-R04 — Auditoria ANVISA (Semaforo Regulatorio)](#uc-r04--auditoria-anvisa-semaforo-regulatorio)
- [UC-R05 — Auditoria Documental + Smart Split](#uc-r05--auditoria-documental--smart-split)
- [UC-R06 — Exportar Dossie Completo](#uc-r06--exportar-dossie-completo)
- [UC-R07 — Gerenciar Status e Submissao](#uc-r07--gerenciar-status-e-submissao)
- [Resumo de Verificacoes por UC](#resumo-de-verificacoes-por-uc)
- [O que reportar se algo falhar](#o-que-reportar-se-algo-falhar)

---

# FASE 1 — PRECIFICACAO (PrecificacaoPage /app/precificacao)

---

## [UC-P01] Organizar Edital por Lotes

> **O que este caso de uso faz:** Aqui voce vai organizar os itens de um edital em lotes logicos, agrupando produtos por especialidade. O sistema carrega os itens importados do PNCP na Sprint 2 e permite criar lotes, atribuir itens e definir parametros tecnicos de cada lote. E como organizar um pedido grande em caixas separadas por categoria — cada lote tera sua propria precificacao e proposta.

**Onde:** Menu lateral -> Precificacao (pagina `/app/precificacao`, aba "Lotes")
**Quanto tempo leva:** 8 a 12 minutos

---

### Antes de comecar

- O edital de "monitor multiparametrico" deve estar salvo no sistema (Sprint 2, UC-CV03)
- O edital deve ter decisao GO (Sprint 2, UC-CV08)
- Os itens do edital devem ter sido importados (Sprint 2, UC-CV09)

---

### Passo 1 — Selecionar o edital

**O que fazer:** No menu lateral, clique em "Precificacao". Na pagina, localize o card "Edital" com o seletor "Selecione o edital". Clique no seletor e escolha o edital de `monitor multiparametrico` salvo na Sprint 2.

**O que voce vai ver na tela:** A pagina de Precificacao com o cabecalho "Precificacao" e um card contendo um dropdown de selecao de editais. Apos selecionar, os dados do edital sao carregados.

---

### Passo 2 — Criar lotes a partir dos itens do edital

**O que fazer:** Clique no botao `Criar Lotes`. O sistema criara lotes automaticamente a partir dos itens importados do edital.

**O que voce vai ver na tela:** A aba "Lotes" sera preenchida com cards expandiveis, um para cada lote criado. Os itens do edital aparecem distribuidos nos lotes.

---

### Passo 3 — Configurar Lote 1 — Monitores Multiparametricos

**O que fazer:** Expanda o card do Lote 1 clicando no toggle de expansao. Preencha os campos de parametros tecnicos com os seguintes valores:

| Campo | Valor |
|---|---|
| Nome do Lote | `Lote 1 — Monitores Multiparametricos` |
| Especialidade | `Monitoracao` |
| Volume Exigido (testes/unidades) | `10` |
| Tipo de Amostra | `Unidade` |

**O que voce vai ver na tela:** Os campos de parametros tecnicos do lote preenchidos. Abaixo, a tabela de "Itens do Lote" mostra os itens atribuidos:

| # | Descricao | Qtd | Unid | Vlr Unit Est. |
|---|---|---|---|---|
| 1 | Monitor multiparametrico de 12 parametros, tela touch 12" | 10 | UN | R$ 18.500,00 |
| 3 | Cabo de ECG 5 vias para monitor multiparametrico | 10 | UN | R$ 350,00 |
| 4 | Sensor de SpO2 reutilizavel adulto | 15 | UN | R$ 280,00 |
| 5 | Suporte com rodizios para monitor multiparametrico | 10 | UN | R$ 950,00 |

Clique em `Atualizar Lote` para salvar.

---

### Passo 4 — Configurar Lote 2 — Oximetros

**O que fazer:** Expanda o card do Lote 2 e preencha os parametros tecnicos:

| Campo | Valor |
|---|---|
| Nome do Lote | `Lote 2 — Oximetros` |
| Especialidade | `Diagnostico` |
| Volume Exigido (testes/unidades) | `20` |
| Tipo de Amostra | `Unidade` |

**O que voce vai ver na tela:** A tabela de itens do Lote 2 mostra:

| # | Descricao | Qtd | Unid | Vlr Unit Est. |
|---|---|---|---|---|
| 2 | Oximetro de pulso portatil com sensor neonatal | 20 | UN | R$ 1.200,00 |

Clique em `Atualizar Lote` para salvar.

---

### Passo 5 — Mover item entre lotes

**O que fazer:** Mova o item 5 (Suporte com rodizios) do Lote 1 para o Lote 2. Verifique que o item aparece no Lote 2 e some do Lote 1. Em seguida, mova o item 5 de volta para o Lote 1.

**O que voce vai ver na tela:** Apos mover para o Lote 2, o item 5 deve aparecer na tabela do Lote 2 e desaparecer da tabela do Lote 1. Apos desfazer, o item 5 retorna ao Lote 1.

---

### Passo 6 — Criar e excluir lote vazio

**O que fazer:** Crie um novo lote chamado `Lote 3 — Reserva` sem adicionar itens. Verifique que o lote aparece na lista. Em seguida, exclua o Lote 3 e verifique que ele desaparece.

**O que voce vai ver na tela:** O Lote 3 aparece como card vazio na lista de lotes. Apos exclusao, somente Lote 1 e Lote 2 permanecem.

---

### Resultado Final

**O que o validador deve conferir:**
- Edital de "monitor multiparametrico" selecionado e carregado
- Lote 1 com 4 itens (Monitor, Cabo ECG, Sensor SpO2, Suporte) e especialidade `Monitoracao`
- Lote 2 com 1 item (Oximetro) e especialidade `Diagnostico`
- Movimentacao de item entre lotes funcional (mover e desfazer)
- Lote vazio criado e excluido com sucesso
- Toast de confirmacao exibido ao salvar cada lote

**Sinais de problema:**
- Botao "Criar Lotes" nao responde
- Itens nao aparecem na tabela apos selecionar edital
- Mover item entre lotes nao atualiza as tabelas
- Erro ao excluir lote vazio

---

## [UC-P02] Selecao Inteligente de Portfolio (Agente Assistido)

> **O que este caso de uso faz:** O sistema usa IA para vincular automaticamente os itens do edital aos produtos do portfolio da empresa. Quando o produto do portfolio corresponde ao item pedido no edital, a vinculacao e feita automaticamente. Itens sem correspondencia (acessorios, por exemplo) ficam como "sem match" e podem ser marcados manualmente. E como ter um assistente que compara sua lista de estoque com o pedido e diz "este produto atende aquele item".

**Onde:** Menu lateral -> Precificacao -> aba "Lotes" (acoes nos itens do lote)
**Quanto tempo leva:** 5 a 10 minutos (inclui tempo de processamento da IA)

---

### Antes de comecar

- UC-P01 concluido (lotes criados e salvos)
- Produtos do portfolio cadastrados na Sprint 1 (Monitor iMEC10 Plus e Ultrassonografo M7T)

---

### Passo 1 — Executar vinculacao automatica por IA

**O que fazer:** Selecione o `Lote 1 — Monitores Multiparametricos`. Clique no botao `Vincular Portfolio por IA`. Aguarde o processamento do agente (10 a 30 segundos).

**O que voce vai ver na tela:** Uma barra de progresso ou indicador de carregamento enquanto a IA processa. Apos concluir, a tabela de itens e atualizada com os resultados de vinculacao.

---

### Passo 2 — Verificar resultados da vinculacao automatica

**O que fazer:** Analise a tabela de itens do Lote 1 apos a IA processar. Verifique os resultados de match:

| Item do Edital | Produto Vinculado | Match (%) | Status |
|---|---|---|---|
| Monitor multiparametrico 12 parametros | Monitor Multiparametrico Mindray iMEC10 Plus | >= 80% | Vinculado automaticamente |
| Cabo de ECG 5 vias | (nenhum produto no portfolio) | < 20% | Nao vinculado |
| Sensor de SpO2 reutilizavel | (nenhum produto no portfolio) | < 20% | Nao vinculado |
| Suporte com rodizios | (nenhum produto no portfolio) | < 20% | Nao vinculado |

**O que voce vai ver na tela:** O item 1 (Monitor) deve ter um badge verde "Vinculado" com o nome do produto `Monitor Multiparametrico Mindray iMEC10 Plus`. Os itens 3, 4 e 5 devem ter badge cinza "Sem match".

---

### Passo 3 — Vinculacao manual dos acessorios

**O que fazer:** Para os itens nao vinculados automaticamente, marque-os como "Acessorio" — preco manual, sem produto vinculado:

| Item | Acao |
|---|---|
| Item 3 (Cabo ECG 5 vias) | Marcar como `Acessorio` — sem produto vinculado, preco manual |
| Item 4 (Sensor SpO2 reutilizavel) | Marcar como `Acessorio` — sem produto vinculado, preco manual |
| Item 5 (Suporte com rodizios) | Marcar como `Acessorio` — sem produto vinculado, preco manual |

**O que voce vai ver na tela:** Os itens marcados como acessorio devem ter um badge indicando o tipo. O botao "Desvincular" deve estar disponivel nos itens vinculados e o botao "Vincular Manual" nos itens nao vinculados.

---

### Resultado Final

**O que o validador deve conferir:**
- Item 1 (Monitor) vinculado automaticamente ao `Monitor Multiparametrico Mindray iMEC10 Plus` com match >= 80%
- Itens 3, 4 e 5 com badge cinza "Sem match" (sem produto no portfolio)
- Botao "Desvincular" visivel no item 1
- Botao "Vincular Manual" visivel nos itens 3, 4 e 5
- Itens 3, 4 e 5 marcados como "Acessorio" com sucesso

**Sinais de problema:**
- IA nao responde apos 60 segundos
- Item 1 nao e vinculado ao Monitor iMEC10 Plus
- Botoes de acao nao aparecem nos itens

---

## [UC-P03] Calculo Tecnico de Volumetria

> **O que este caso de uso faz:** O sistema calcula automaticamente o volume real de cada item do lote, considerando se e um equipamento (unidade), acessorio consumivel (reposicao anual) ou kit/reagente (testes por kit). Ele detecta o tipo do produto e aplica o fator de conversao adequado. E como calcular quantas caixas de material voce realmente vai precisar entregar, considerando o tipo de uso de cada item.

**Onde:** Menu lateral -> Precificacao -> aba "Custos e Precos" (secao Volumetria)
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de comecar

- UC-P01 e UC-P02 concluidos (lotes com itens vinculados/marcados)

---

### Passo 1 — Verificar volumetria do Monitor (equipamento, unidade)

**O que fazer:** Na aba "Custos e Precos", localize a secao de volumetria para o item `Monitor multiparametrico 12 parametros`. Verifique os dados calculados automaticamente:

| Campo | Valor |
|---|---|
| Item | `Monitor multiparametrico 12 parametros` |
| Tipo de produto | `Equipamento (unidade)` |
| Quantidade solicitada | `10` |
| Deteccao automatica | `Unidade (nao kit/reagente)` |
| Volume calculado | `10 unidades` |
| Fator de conversao | `1.0` |

**O que voce vai ver na tela:** O item deve ter um badge "Unidade" indicando o tipo detectado. O volume calculado deve ser `10 unidades` com fator `1.0`.

---

### Passo 2 — Verificar volumetria do Sensor SpO2 (acessorio consumivel)

**O que fazer:** Localize o item `Sensor de SpO2 reutilizavel adulto` e verifique os dados de volumetria:

| Campo | Valor |
|---|---|
| Item | `Sensor de SpO2 reutilizavel adulto` |
| Tipo de produto | `Acessorio consumivel` |
| Quantidade solicitada | `15` |
| Vida util estimada | `12 meses` |
| Reposicao anual | `1x` |
| Volume anualizado | `15 unidades/ano` |

**O que voce vai ver na tela:** O volume total exibido com unidade correta, badge indicando tipo "Acessorio consumivel".

---

### Passo 3 — Validar cenario kit/reagente (deteccao de tipo)

**O que fazer:** Se disponivel, verifique a deteccao automatica para o cenario simulado de kit/reagente:

| Campo | Valor |
|---|---|
| Descricao simulada | `Kit de reagentes para gasometria — 500 testes` |
| Tipo detectado | `Kit/Reagente` |
| Quantidade de kits | `5` |
| Testes por kit | `500` |
| Volume total (testes) | `2.500 testes` |
| Fator de conversao | `500 testes/kit` |

**O que voce vai ver na tela:** Badge "Kit/Reagente" no item, volume total exibido como `2.500 testes` com fator `500 testes/kit`.

---

### Passo 4 — Testar edicao manual do fator de conversao

**O que fazer:** Altere o fator de conversao de qualquer item para confirmar que o campo e editavel e o volume e recalculado ao alterar.

**O que voce vai ver na tela:** O campo de fator de conversao e editavel. Ao alterar o valor, o volume total e recalculado automaticamente.

---

### Resultado Final

**O que o validador deve conferir:**
- Deteccao automatica de tipo (badge "Unidade" ou "Kit/Reagente") por item
- Volume total exibido com unidade correta para cada item
- Campo de fator de conversao editavel e recalculo automatico
- Monitor: `10 unidades`, fator `1.0`
- Sensor SpO2: `15 unidades/ano`, vida util `12 meses`

**Sinais de problema:**
- Tipo de produto nao e detectado automaticamente
- Volume calculado incorreto
- Fator de conversao nao e editavel

---

## [UC-P04] Configurar Base de Custos (ERP + Tributario)

> **O que este caso de uso faz:** Aqui voce configura os custos reais de aquisicao dos produtos (Camada A). O sistema permite importar custos do ERP, aplicar tributos automaticamente por NCM e calcular o custo total com impostos e frete. E a base financeira sobre a qual todo o preco sera construido — como montar a planilha de custos de um projeto, com todos os impostos e taxas incluidos.

**Onde:** Menu lateral -> Precificacao -> aba "Custos e Precos" (secao Custos)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- UC-P01 a UC-P03 concluidos
- Produtos do portfolio com NCM cadastrado (`9018.19.90`)

---

### Passo 1 — Informar custos ERP do Monitor iMEC10 Plus

**O que fazer:** Na aba "Custos e Precos", localize a secao de custos para o produto vinculado. Preencha os custos ERP do `Monitor Multiparametrico Mindray iMEC10 Plus`:

| Campo | Valor |
|---|---|
| Produto | `Monitor Multiparametrico Mindray iMEC10 Plus` |
| SKU | `MD-IMEC10-PLUS-BR` |
| Custo unitario (ERP) | `R$ 14.200,00` |
| Moeda de origem | `BRL` |
| Data de referencia | `2026-03-01` |
| Fonte | `Importacao ERP manual` |

**O que voce vai ver na tela:** O valor de custo ERP exibido na coluna correspondente da tabela de itens. O campo deve aceitar o valor `14.200,00`.

---

### Passo 2 — Informar custos ERP dos acessorios

**O que fazer:** Para os itens sem produto vinculado (acessorios), informe os custos manualmente:

| Item | Custo unitario |
|---|---|
| Cabo de ECG 5 vias | `R$ 185,00` |
| Sensor de SpO2 reutilizavel adulto | `R$ 145,00` |
| Suporte com rodizios | `R$ 520,00` |

**O que voce vai ver na tela:** Os custos preenchidos nos campos de cada acessorio.

---

### Passo 3 — Verificar regras tributarias por NCM

**O que fazer:** Verifique que o sistema aplicou automaticamente os tributos com base no NCM `9018.19.90`:

| Tributo | Aliquota |
|---|---|
| ICMS | `12,0%` |
| IPI | `0,0%` (equipamentos medico-hospitalares NCM 9018, Dec. 7.660/2011) |
| PIS | `1,65%` |
| COFINS | `7,60%` |
| ISS | `0,0%` |
| Regime | `Lucro Real` |

**O que voce vai ver na tela:** Linha detalhada com ICMS, PIS, COFINS por NCM. O IPI deve ser `0,0%` para NCM 9018. O total com impostos deve ser calculado automaticamente.

---

### Passo 4 — Salvar custos

**O que fazer:** Clique no botao `Salvar Custos` para persistir a Camada A.

**O que voce vai ver na tela:** Toast de confirmacao "Custos salvos com sucesso" ou equivalente. Os valores permanecem na tela.

---

### Resultado Final

**O que o validador deve conferir:**
- Custo ERP do Monitor: `R$ 14.200,00` exibido e salvo
- Custos dos acessorios: Cabo ECG `R$ 185,00`, Sensor SpO2 `R$ 145,00`, Suporte `R$ 520,00`
- Tributos aplicados: ICMS `12%`, PIS `1,65%`, COFINS `7,60%`, IPI `0%`
- Total com impostos calculado automaticamente
- Campos editaveis para ajuste fino

**Sinais de problema:**
- Tributos nao sao calculados automaticamente pelo NCM
- Botao "Salvar Custos" nao responde
- Valores desaparecem apos salvar

---

## [UC-P05] Montar Preco Base (Camada B)

> **O que este caso de uso faz:** A partir dos custos configurados (Camada A), o sistema calcula o Preco Base aplicando markup, impostos e frete. E o preco de tabela da empresa — quanto ela precisa cobrar para cobrir custos e obter margem. O sistema oferece tres modos: calculo automatico (Custo + Markup), preco manual e upload de tabela de precos.

**Onde:** Menu lateral -> Precificacao -> aba "Custos e Precos" (secao Preco Base)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- UC-P04 concluido (custos ERP e tributos configurados)
- Markup padrao de `28%` configurado nos parametros comerciais (Sprint 1)
- Frete base de `R$ 350,00`

---

### Passo 1 — Calcular Preco Base do Monitor iMEC10 Plus (Custo + Markup)

**O que fazer:** Selecione o modo "Custo + Markup" (radio button). O sistema calcula automaticamente o Preco Base para o `Monitor Multiparametrico Mindray iMEC10 Plus`:

| Componente | Valor |
|---|---|
| Custo unitario (ERP) | `R$ 14.200,00` |
| ICMS (12%) | `R$ 1.704,00` |
| PIS (1,65%) | `R$ 234,30` |
| COFINS (7,60%) | `R$ 1.079,20` |
| Subtotal com impostos | `R$ 17.217,50` |
| Frete | `R$ 350,00` |
| Custo total | `R$ 17.567,50` |
| Markup (28%) | `R$ 4.918,90` |
| **Preco Base (Camada B)** | **`R$ 22.486,40`** |

**O que voce vai ver na tela:** O preco base calculado automaticamente: `R$ 22.486,40`. O detalhamento dos componentes (impostos, frete, markup) deve estar visivel.

---

### Passo 2 — Informar precos manuais dos acessorios

**O que fazer:** Para os itens sem produto vinculado, selecione o modo "Manual" e informe os precos base:

| Item | Preco Base Manual |
|---|---|
| Cabo de ECG 5 vias | `R$ 320,00` |
| Sensor de SpO2 reutilizavel | `R$ 255,00` |
| Suporte com rodizios | `R$ 890,00` |

**O que voce vai ver na tela:** Os precos manuais preenchidos nos campos correspondentes.

---

### Passo 3 — Salvar Preco Base

**O que fazer:** Clique no botao `Salvar Preco Base` para persistir a Camada B.

**O que voce vai ver na tela:** Toast de confirmacao. Os precos base permanecem na tela apos salvar.

---

### Passo 4 — Verificar edicao pos-calculo

**O que fazer:** Altere o campo de markup do Monitor de `28%` para outro valor (por exemplo `30%`) e observe que o Preco Base e recalculado. Retorne o markup para `28%`.

**O que voce vai ver na tela:** O Preco Base muda ao alterar o markup. Ao retornar para `28%`, volta para `R$ 22.486,40`.

---

### Resultado Final

**O que o validador deve conferir:**
- Monitor iMEC10 Plus: Preco Base calculado = `R$ 22.486,40` (Custo + Markup 28%)
- Cabo ECG: `R$ 320,00` (manual)
- Sensor SpO2: `R$ 255,00` (manual)
- Suporte: `R$ 890,00` (manual)
- Tres modos disponiveis: "Custo + Markup", "Manual", "Upload Tabela"
- Markup editavel por item (override do padrao 28%)
- Campo Preco Base editavel mesmo apos calculo automatico

**Sinais de problema:**
- Calculo automatico nao funciona
- Markup nao e editavel
- Preco Base nao persiste apos salvar

---

## [UC-P06] Definir Valor de Referencia (Camada C)

> **O que este caso de uso faz:** O Valor de Referencia e o preco que o orgao publico estima para cada item do edital. O sistema importa automaticamente esses valores do edital. Alternativamente, voce pode calcular o valor de referencia como um percentual sobre o preco base. Esse valor e usado como teto para os lances — e o "preco maximo aceitavel" definido pelo comprador.

**Onde:** Menu lateral -> Precificacao -> aba "Custos e Precos" (secao Valor de Referencia)
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de comecar

- UC-P05 concluido (precos base definidos)
- Edital com valores estimados por item importados na Sprint 2

---

### Passo 1 — Verificar importacao automatica dos valores do edital

**O que fazer:** Ao abrir a secao de Valor de Referencia, verifique que os valores foram importados automaticamente do edital:

| Item | Vlr Referencia Edital | Fonte |
|---|---|---|
| Monitor multiparametrico 12 parametros | `R$ 18.500,00` | Importado do edital (UC-CV09) |
| Cabo de ECG 5 vias | `R$ 350,00` | Importado do edital |
| Sensor de SpO2 reutilizavel | `R$ 280,00` | Importado do edital |
| Suporte com rodizios | `R$ 950,00` | Importado do edital |
| Oximetro de pulso portatil | `R$ 1.200,00` | Importado do edital |

**O que voce vai ver na tela:** Os valores de referencia preenchidos automaticamente. O campo deve exibir a fonte "Importado do edital".

---

### Passo 2 — Testar modo percentual sobre preco base

**O que fazer:** Ative o toggle "% sobre Base" para testar o modo alternativo. Verifique os valores calculados:

| Item | Preco Base (B) | Percentual | Vlr Referencia (C) |
|---|---|---|---|
| Monitor iMEC10 Plus | `R$ 22.486,40` | `-18%` | `R$ 18.438,85` |

**O que voce vai ver na tela:** O campo de percentual ativado. Ao informar `-18%`, o valor de referencia e recalculado para `R$ 18.438,85`.

---

### Passo 3 — Verificar indicador visual B vs C

**O que fazer:** Observe o indicador de comparacao entre Preco Base (B) e Valor de Referencia (C):

**O que voce vai ver na tela:** Indicador verde se C >= B, vermelho se C < B. Para o Monitor, C (`R$ 18.500,00`) < B (`R$ 22.486,40`), entao o indicador deve estar vermelho. Se a margem for negativa (Vlr Referencia < Custo Total), um alerta warning deve aparecer.

---

### Passo 4 — Salvar Valor de Referencia

**O que fazer:** Clique no botao `Salvar Target` para persistir a Camada C.

**O que voce vai ver na tela:** Toast de confirmacao. Os valores de referencia permanecem na tela.

---

### Resultado Final

**O que o validador deve conferir:**
- Valores importados automaticamente do edital: Monitor `R$ 18.500,00`, Cabo ECG `R$ 350,00`, Sensor SpO2 `R$ 280,00`, Suporte `R$ 950,00`, Oximetro `R$ 1.200,00`
- Toggle "% sobre Base" ativa campo de percentual
- Indicador visual vermelho quando C < B
- Alerta de margem negativa quando Vlr Referencia < Custo Total

**Sinais de problema:**
- Valores do edital nao sao importados automaticamente
- Modo percentual nao calcula corretamente
- Indicador de comparacao nao aparece

---

## [UC-P07] Estruturar Lances (Camadas D e E)

> **O que este caso de uso faz:** Aqui voce define os lances para o pregao eletronico. O Lance Inicial (Camada D) e o primeiro preco que voce vai ofertar. O Lance Minimo (Camada E) e o piso abaixo do qual voce nao esta disposto a vender. O sistema calcula automaticamente os descontos e margens, e alerta quando a margem esta muito baixa. E como definir sua estrategia de negociacao — o preco de abertura e o limite minimo.

**Onde:** Menu lateral -> Precificacao -> aba "Lances"
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- UC-P06 concluido (valores de referencia definidos)

---

### Passo 1 — Preencher Lance Inicial (Camada D)

**O que fazer:** Na aba "Lances", preencha os valores de Lance Inicial para cada item:

| Item | Vlr Referencia (C) | Lance Inicial (D) | Desconto s/ Ref (%) |
|---|---|---|---|
| Monitor iMEC10 Plus | `R$ 18.500,00` | `R$ 17.800,00` | `3,8%` |
| Cabo de ECG 5 vias | `R$ 350,00` | `R$ 338,00` | `3,4%` |
| Sensor de SpO2 | `R$ 280,00` | `R$ 270,00` | `3,6%` |
| Suporte com rodizios | `R$ 950,00` | `R$ 915,00` | `3,7%` |

**O que voce vai ver na tela:** Campos editaveis para o Lance Inicial de cada item. Ao preencher o valor, o desconto percentual sobre o Valor de Referencia e calculado automaticamente.

---

### Passo 2 — Preencher Lance Minimo (Camada E)

**O que fazer:** Preencha os valores de Lance Minimo para cada item:

| Item | Lance Inicial (D) | Lance Minimo (E) | Margem s/ Custo (%) |
|---|---|---|---|
| Monitor iMEC10 Plus | `R$ 17.800,00` | `R$ 16.500,00` | `17,5%` |
| Cabo de ECG 5 vias | `R$ 338,00` | `R$ 295,00` | `59,5%` |
| Sensor de SpO2 | `R$ 270,00` | `R$ 230,00` | `58,6%` |
| Suporte com rodizios | `R$ 915,00` | `R$ 780,00` | `50,0%` |

**O que voce vai ver na tela:** Campos editaveis para o Lance Minimo de cada item. A margem sobre o custo e calculada automaticamente.

---

### Passo 3 — Verificar validacoes de limites

**O que fazer:** Verifique que o sistema aplica as regras de validacao:

| Regra | Descricao |
|---|---|
| D <= C | Lance Inicial nao pode exceder Valor de Referencia |
| E <= D | Lance Minimo nao pode exceder Lance Inicial |
| E >= Custo | Lance Minimo nao pode ser inferior ao custo total (alerta) |
| Margem minima | Warning se margem sobre custo < 5% |

**O que voce vai ver na tela:** Alertas visuais caso alguma regra seja violada. Badge vermelho se E <= custo total. Barra horizontal mostrando faixas B-C-D-E por item.

---

### Passo 4 — Salvar Lances

**O que fazer:** Clique no botao `Salvar Lances` para persistir as Camadas D e E.

**O que voce vai ver na tela:** Toast de confirmacao. Os lances permanecem na tela.

---

### Resultado Final

**O que o validador deve conferir:**
- Lance Inicial (D): Monitor `R$ 17.800,00`, Cabo ECG `R$ 338,00`, Sensor SpO2 `R$ 270,00`, Suporte `R$ 915,00`
- Lance Minimo (E): Monitor `R$ 16.500,00`, Cabo ECG `R$ 295,00`, Sensor SpO2 `R$ 230,00`, Suporte `R$ 780,00`
- Calculo automatico de desconto (D vs C) e margem (E vs custo)
- Regras de validacao D <= C e E <= D aplicadas
- Resumo visual com barra horizontal de faixas B-C-D-E

**Sinais de problema:**
- Campos D e E nao sao editaveis
- Calculo de desconto/margem incorreto
- Validacoes nao disparam alertas visuais
- Botao "Salvar Lances" nao responde

---

## [UC-P08] Definir Estrategia Competitiva

> **O que este caso de uso faz:** O sistema permite definir a estrategia de lances para cada lote — se voce quer "ganhar" (ofertar preco agressivo) ou registrar que "nao ganhou" (para historico). Inclui um simulador de cenarios que mostra como diferentes niveis de desconto afetam sua margem e probabilidade de vitoria. E como planejar sua jogada antes de entrar no pregao.

**Onde:** Menu lateral -> Precificacao -> aba "Lances" (secao Estrategia Competitiva)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- UC-P07 concluido (lances D e E definidos)

---

### Passo 1 — Configurar perfil "Quero ganhar" para Lote 1

**O que fazer:** Na secao de Estrategia Competitiva, selecione o perfil `Quero ganhar` (radio button) para o `Lote 1 — Monitores Multiparametricos`. Configure os parametros:

| Campo | Valor |
|---|---|
| Perfil estrategico | `Quero ganhar` |
| Lote alvo | `Lote 1 — Monitores Multiparametricos` |
| Desconto agressivo (%) | `8,0` |
| Lance inicial sugerido | `R$ 17.020,00` (8% abaixo de C) |
| Lance minimo sugerido | `R$ 15.900,00` (margem de 13,2% sobre custo) |

**O que voce vai ver na tela:** Slider de desconto. Ao definir `8,0%`, o lance inicial sugerido e `R$ 17.020,00` e o lance minimo sugerido e `R$ 15.900,00`.

---

### Passo 2 — Configurar perfil "Nao ganhei" para Lote 2

**O que fazer:** Selecione o perfil `Nao ganhei` para o `Lote 2 — Oximetros`:

| Campo | Valor |
|---|---|
| Perfil estrategico | `Nao ganhei` |
| Lote alvo | `Lote 2 — Oximetros` |
| Acao pos-derrota | `Registrar preco vencedor para historico` |
| Preco vencedor observado | `R$ 980,00` |
| Diferenca vs lance minimo | `-18,3%` |
| Recomendacao IA | `"Revisar custo de aquisicao ou buscar fornecedor alternativo"` |

**O que voce vai ver na tela:** Campos para registrar o preco vencedor e a recomendacao da IA.

---

### Passo 3 — Executar simulacao de cenarios

**O que fazer:** Na secao de simulacao, verifique os 4 cenarios pre-calculados:

| Cenario | Desconto (%) | Lance (R$) | Margem (%) | Probabilidade estimada |
|---|---|---|---|---|
| Conservador | `3,0` | `R$ 17.945,00` | `24,2%` | Baixa |
| Moderado | `6,0` | `R$ 17.390,00` | `20,4%` | Media |
| Agressivo | `10,0` | `R$ 16.650,00` | `15,3%` | Alta |
| Limite | `14,0` | `R$ 15.910,00` | `10,1%` | Muito alta |

**O que voce vai ver na tela:** Tabela ou grafico de barras comparativo dos 4 cenarios. Slider de desconto com recalculo em tempo real.

---

### Passo 4 — Salvar estrategia

**O que fazer:** Clique no botao `Salvar Estrategia`.

**O que voce vai ver na tela:** Toast de confirmacao "Estrategia salva com sucesso" ou equivalente.

---

### Resultado Final

**O que o validador deve conferir:**
- Perfil "Quero ganhar" configurado para Lote 1 com desconto `8,0%`
- Perfil "Nao ganhei" configurado para Lote 2 com preco vencedor `R$ 980,00`
- Simulador com 4 cenarios (Conservador, Moderado, Agressivo, Limite)
- Slider de desconto com recalculo em tempo real
- Estrategia salva com sucesso

**Sinais de problema:**
- Selecao de perfil nao funciona
- Simulador nao recalcula ao mover o slider
- Cenarios nao sao exibidos
- Erro ao salvar estrategia

---

## [UC-P09] Consultar Historico de Precos (Camada F)

> **O que este caso de uso faz:** O sistema busca precos historicos de licitacoes anteriores, tanto na base local da empresa quanto no portal PNCP. Isso permite saber por quanto produtos similares foram vendidos anteriormente, quem ganhou e a que preco. E como pesquisar o mercado antes de definir seu preco — ver quanto os concorrentes cobraram em pregoes passados.

**Onde:** Menu lateral -> Precificacao -> aba "Historico"
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- UC-P07 concluido (lances definidos)
- Conexao com PNCP operacional (para busca de historico externo)

---

### Passo 1 — Buscar historico local

**O que fazer:** Na aba "Historico", selecione o produto `Monitor Multiparametrico Mindray iMEC10 Plus` e o periodo `Ultimos 24 meses`. Clique em `Filtrar`.

**O que voce vai ver na tela:** Tabela com precos de licitacoes anteriores (se houver dados locais). Caso nao haja historico local, a mensagem "Nenhum historico encontrado" deve aparecer.

---

### Passo 2 — Buscar historico PNCP — Lances vencedores

**O que fazer:** Execute a busca no PNCP com os parametros:

| Campo | Valor |
|---|---|
| Termo de busca | `monitor multiparametrico 12 parametros` |
| NCM | `9018.19.90` |
| Periodo | `Ultimos 12 meses` |

**O que voce vai ver na tela:** Tabela de historico com dados representativos como:

| Data | Orgao | UF | Vlr Estimado | Vlr Homologado | Vencedor |
|---|---|---|---|---|---|
| 2025-11-15 | Hospital Municipal de SP | SP | R$ 19.200,00 | R$ 16.800,00 | Medic Supply Ltda. |
| 2025-08-22 | HCFMUSP | SP | R$ 20.500,00 | R$ 17.350,00 | Equiphos Comercio |
| 2025-06-10 | Hospital Estadual RJ | RJ | R$ 18.900,00 | R$ 15.900,00 | CH Hospitalar |
| 2025-03-05 | Secretaria Saude MG | MG | R$ 21.000,00 | R$ 18.200,00 | BioMedica Brasil |
| 2024-12-18 | Hospital Universitario PR | PR | R$ 17.500,00 | R$ 14.950,00 | TechMed Equipamentos |

---

### Passo 3 — Verificar estatisticas de historico

**O que fazer:** Verifique os cards de estatisticas gerados a partir do historico:

| Indicador | Valor |
|---|---|
| Preco medio homologado | `R$ 16.640,00` |
| Preco mediano | `R$ 16.800,00` |
| Menor preco | `R$ 14.950,00` |
| Maior preco | `R$ 18.200,00` |
| Desconto medio s/ estimado | `14,2%` |

**O que voce vai ver na tela:** Cards com media, mediana, min e max. Grafico de tendencia (linha temporal de precos). Faixa sugerida para a Camada F baseada no historico.

---

### Passo 4 — Exportar historico em CSV

**O que fazer:** Clique no botao `CSV` para exportar os dados de historico.

**O que voce vai ver na tela:** Download de arquivo CSV com os dados do historico de precos.

---

### Resultado Final

**O que o validador deve conferir:**
- Busca PNCP executada com resultados (ou mensagem "Nenhum historico encontrado")
- Estatisticas: media `R$ 16.640,00`, mediana `R$ 16.800,00`, min `R$ 14.950,00`, max `R$ 18.200,00`
- Grafico de tendencia exibido
- Exportacao CSV funcional
- Sugestao de faixa de preco baseada no historico

**Sinais de problema:**
- Busca PNCP nao retorna resultados (verificar conexao)
- Estatisticas nao sao calculadas
- Grafico de tendencia nao aparece
- Exportacao CSV falha

---

## [UC-P10] Gestao de Comodato

> **O que este caso de uso faz:** Permite cadastrar equipamentos que serao cedidos em comodato (emprestimo de longo prazo vinculado a contrato de fornecimento de insumos). O sistema calcula a amortizacao mensal, seguro e manutencao, e gera uma tabela com o plano de amortizacao completo. E como gerenciar um ativo que voce empresta ao hospital — voce precisa saber quanto custa manter esse equipamento la.

**Onde:** Menu lateral -> Precificacao -> aba "Historico" (secao Comodato)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- Produto do portfolio cadastrado (Monitor iMEC10 Plus)
- Preco base definido (UC-P05)

---

### Passo 1 — Cadastrar equipamento em comodato

**O que fazer:** Na secao de Comodato, preencha os campos do formulario:

| Campo | Valor |
|---|---|
| Equipamento | `Monitor Multiparametrico Mindray iMEC10 Plus` |
| Numero de serie | `MR-IMEC10-2026-001` |
| Valor do equipamento | `R$ 22.486,40` |
| Prazo do comodato | `60 meses` |
| Orgao contratante | `Hospital Municipal de Sao Paulo` |
| Data de inicio | `2026-04-01` |
| Data de termino | `2031-03-31` |

Clique em `Salvar Comodato`.

**O que voce vai ver na tela:** Toast de confirmacao. Os dados do comodato preenchidos e salvos.

---

### Passo 2 — Verificar calculo de amortizacao mensal

**O que fazer:** Verifique os valores calculados automaticamente:

| Campo | Valor |
|---|---|
| Metodo | `Linear` |
| Valor mensal | `R$ 374,77` |
| Valor residual (60 meses) | `R$ 0,00` |
| Seguro mensal | `R$ 112,43` |
| Manutencao mensal | `R$ 224,86` |
| **Custo mensal total comodato** | **`R$ 712,06`** |

**O que voce vai ver na tela:** A tabela de amortizacao com os primeiros meses:

| Mes | Amortizacao | Seguro | Manutencao | Total Mes | Saldo Devedor |
|---|---|---|---|---|---|
| 1 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 22.111,63 |
| 2 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 21.736,86 |
| 3 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 21.362,09 |
| 4 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 20.987,32 |
| 5 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 20.612,55 |
| 6 | R$ 374,77 | R$ 112,43 | R$ 224,86 | R$ 712,06 | R$ 20.237,78 |

---

### Passo 3 — Editar comodato (alterar prazo)

**O que fazer:** Edite o comodato criado e altere o prazo de `60 meses` para `48 meses`. Salve e verifique que a amortizacao mensal e recalculada para `R$ 468,47/mes`.

**O que voce vai ver na tela:** O valor mensal de amortizacao atualizado para `R$ 468,47`. A tabela de amortizacao e recalculada automaticamente.

---

### Passo 4 — Excluir comodato

**O que fazer:** Exclua o comodato criado e verifique que ele e removido da lista de comodatos ativos.

**O que voce vai ver na tela:** O comodato desaparece da lista. Confirmacao de exclusao exibida.

---

### Resultado Final

**O que o validador deve conferir:**
- Comodato cadastrado com equipamento `Monitor iMEC10 Plus`, serie `MR-IMEC10-2026-001`, prazo `60 meses`
- Amortizacao mensal calculada: `R$ 374,77` + seguro `R$ 112,43` + manutencao `R$ 224,86` = **`R$ 712,06`**
- Tabela de amortizacao exibida com todos os meses
- Edicao de prazo para 48 meses recalcula para `R$ 468,47/mes`
- Exclusao remove o comodato da lista

**Sinais de problema:**
- Calculo de amortizacao incorreto
- Tabela de amortizacao nao e exibida
- Edicao nao recalcula valores
- Erro ao excluir comodato

---

## [UC-P11] Pipeline IA de Precificacao

> **O que este caso de uso faz:** O sistema executa um pipeline automatizado que combina busca no PNCP, extracao de vencedores, analise estatistica e sugestao de faixas de preco para cada camada (A-E). E como ter um analista de mercado automatizado que pesquisa, compara e sugere os melhores precos para voce competir no pregao.

**Onde:** Menu lateral -> Precificacao -> aba "Custos e Precos" (secao Pipeline IA)
**Quanto tempo leva:** 3 a 5 minutos (mais 30-120 segundos de processamento)

---

### Antes de comecar

- UC-P01 a UC-P07 concluidos (lotes, custos e lances configurados)
- Conexao com PNCP e servico de IA operacionais

---

### Passo 1 — Executar o pipeline IA

**O que fazer:** Selecione o `Lote 1 — Monitores Multiparametricos`. Clique no botao `Executar Pipeline IA de Precificacao`. Aguarde o processamento (30 a 120 segundos).

**O que voce vai ver na tela:** Barra de progresso com etapas sendo concluidas sequencialmente:

| Etapa | Descricao | Status esperado |
|---|---|---|
| 1. Busca PNCP automatica | Busca precos historicos por NCM e termo | Concluida |
| 2. Extracao de vencedores | Identifica vencedores e precos das atas | Concluida |
| 3. Analise estatistica | Calcula media, mediana, desvio padrao | Concluida |
| 4. Sugestao faixas A-E | Sugere valores para cada camada | Concluida |

---

### Passo 2 — Verificar sugestoes geradas

**O que fazer:** Analise as sugestoes geradas pelo pipeline para o `Monitor iMEC10 Plus`:

| Camada | Descricao | Valor Sugerido | Justificativa |
|---|---|---|---|
| A (Custo) | Custo total com impostos | `R$ 17.567,50` | Base ERP + tributos + frete |
| B (Preco Base) | Custo + markup | `R$ 22.486,40` | Markup 28% aplicado |
| C (Referencia) | Valor de referencia do edital | `R$ 18.500,00` | Importado do edital |
| D (Lance Inicial) | Primeiro lance sugerido | `R$ 17.200,00` | Mediana historica + 3% |
| E (Lance Minimo) | Piso competitivo | `R$ 15.500,00` | Proximo ao menor preco historico |

**O que voce vai ver na tela:** Tabela com sugestoes editaveis. Log de execucao com texto detalhado de cada etapa.

---

### Passo 3 — Aplicar ou descartar sugestoes

**O que fazer:** Clique em `Aplicar Sugestoes` para preencher as camadas B-E com os valores do pipeline. Alternativamente, clique em `Descartar` para manter os valores atuais.

**O que voce vai ver na tela:** Ao aplicar, os valores das camadas B-E sao atualizados com os valores sugeridos. Toast de confirmacao.

---

### Resultado Final

**O que o validador deve conferir:**
- Pipeline executado com barra de progresso e 4 etapas concluidas
- Sugestoes geradas para camadas A-E com valores coerentes
- Valores sugeridos editaveis antes de aplicar
- Botao "Aplicar Sugestoes" preenche camadas B-E
- Botao "Descartar" mantem valores anteriores
- Log de execucao visivel

**Sinais de problema:**
- Pipeline trava por mais de 120 segundos (timeout)
- Sugestoes nao sao geradas
- Botao "Aplicar Sugestoes" nao funciona
- Valores aplicados sao inconsistentes

---

## [UC-P12] Relatorio de Custos e Precos

> **O que este caso de uso faz:** O sistema gera um relatorio completo de custos e precos para o lote selecionado, incluindo resumo executivo, tabelas de custos e precos por camada, historico PNCP, analise de competitividade e recomendacoes da IA. O relatorio pode ser visualizado na tela em Markdown ou exportado em PDF. E o documento final que resume toda a analise de precificacao.

**Onde:** Menu lateral -> Precificacao -> aba "Custos e Precos" (botao "Relatorio de Custos e Precos")
**Quanto tempo leva:** 2 a 5 minutos

---

### Antes de comecar

- UC-P01 a UC-P11 concluidos (todas as camadas configuradas)

---

### Passo 1 — Gerar relatorio

**O que fazer:** Selecione o `Lote 1 — Monitores Multiparametricos`. Clique no botao `Gerar Relatorio de Custos e Precos`. Aguarde a geracao (10 a 30 segundos).

**O que voce vai ver na tela:** O relatorio gerado em formato Markdown exibido na tela, contendo:

| Secao | Conteudo |
|---|---|
| Cabecalho | Empresa (CH Hospitalar), edital, lote, data de geracao |
| Resumo executivo | Valor total do lote, margem media, estrategia |
| Tabela de custos | Custo ERP, impostos, frete por item |
| Tabela de precos | Camadas A-E por item |
| Historico PNCP | Precos de referencia do mercado |
| Analise de competitividade | Posicionamento vs concorrentes |
| Comodato (se aplicavel) | Resumo da amortizacao |
| Recomendacoes | Sugestoes da IA para otimizacao |

---

### Passo 2 — Exportar em PDF

**O que fazer:** Clique no botao `Baixar PDF` para exportar o relatorio.

**O que voce vai ver na tela:** Download de arquivo `.pdf` com o relatorio formatado. Nome do arquivo segue o padrao: `relatorio_custos_[edital]_[data].pdf`.

---

### Resultado Final

**O que o validador deve conferir:**
- Relatorio gerado e exibido na tela em Markdown
- Todas as secoes presentes (cabecalho, custos, precos, historico, recomendacoes)
- Valores consistentes com as camadas B-E configuradas
- Botao "Baixar PDF" funcional e download realizado
- Dados corretos: Custo ERP Monitor `R$ 14.200,00`, Preco Base `R$ 22.486,40`, Lance Inicial `R$ 17.800,00`

**Sinais de problema:**
- Relatorio nao e gerado
- Secoes faltando no relatorio
- Valores inconsistentes com os configurados
- Download de PDF falha

---

# FASE 2 — PROPOSTA (PropostaPage /app/proposta)

---

## [UC-R01] Gerar Proposta Tecnica (Motor Automatico)

> **O que este caso de uso faz:** O sistema gera automaticamente uma proposta tecnica cruzando os dados de precificacao com os requisitos do edital e as especificacoes dos produtos do portfolio. A proposta inclui tabela de itens com precos, especificacoes tecnicas detalhadas e identificacao de nao-conformidades. E como ter um redator tecnico automatizado que monta o documento de proposta completo.

**Onde:** Menu lateral -> Proposta (pagina `/app/proposta`, card "Gerar Nova Proposta")
**Quanto tempo leva:** 5 a 10 minutos (inclui 30-60 segundos de processamento)

---

### Antes de comecar

- Fase 1 concluida (UC-P01 a UC-P12 — precificacao completa)
- Produto `Monitor Multiparametrico Mindray iMEC10 Plus` com especificacoes cadastradas no portfolio

---

### Passo 1 — Selecionar edital e gerar proposta

**O que fazer:** No menu lateral, clique em "Proposta". No card "Gerar Nova Proposta", selecione o edital de `monitor multiparametrico` e o `Lote 1 — Monitores Multiparametricos`. Clique em `Gerar Proposta Tecnica`. Aguarde o processamento (30 a 60 segundos).

**O que voce vai ver na tela:** Indicador de carregamento enquanto o motor IA processa. Apos concluir, a proposta e exibida no card "Proposta Selecionada" em formato Markdown.

---

### Passo 2 — Verificar dados cruzados na proposta

**O que fazer:** Analise a proposta gerada e verifique os dados cruzados entre precificacao, edital e portfolio:

| Campo da Proposta | Origem | Valor |
|---|---|---|
| Item principal | Edital | `Monitor multiparametrico 12 parametros, tela touch 12"` |
| Produto ofertado | Portfolio | `Monitor Multiparametrico Mindray iMEC10 Plus` |
| Fabricante | Portfolio | `Mindray Bio-Medical Electronics` |
| Modelo | Portfolio | `iMEC10 Plus` |
| Preco unitario | Precificacao (D) | `R$ 17.800,00` |
| Quantidade | Edital | `10` |
| Valor total | Calculado | `R$ 178.000,00` |
| Prazo de entrega | Parametros | `30 dias` |
| Garantia | Edital/padrao | `12 meses` |
| Registro ANVISA | Portfolio | `80262090001` |

**O que voce vai ver na tela:** Tabela de itens com preco, quantidade e total. Dados do produto ofertado completos.

---

### Passo 3 — Verificar especificacoes tecnicas cruzadas

**O que fazer:** Analise a tabela de especificacoes tecnicas que cruza os requisitos do edital com o que o produto oferece:

| Requisito do Edital | Ofertado | Atende |
|---|---|---|
| 12 parametros simultaneos | 10 parametros | `Parcial` |
| Tela touch >= 12" | TFT Touch 12,1" | `Sim` |
| SpO2 integrado | Sim | `Sim` |
| ECG 12 derivacoes | Sim (12 derivacoes) | `Sim` |
| NIBP integrado | Sim | `Sim` |
| EtCO2 integrado | Sim | `Sim` |
| Bateria >= 4 horas | 6 horas | `Sim` |
| Peso <= 5 kg | 4,1 kg | `Sim` |
| Registro ANVISA vigente | 80262090001 | `Sim` |

**O que voce vai ver na tela:** Tabela comparativa com badges: verde (Sim), amarelo (Parcial). O item "12 parametros" deve ter badge amarelo indicando nao-conformidade parcial (10 parametros vs 12 exigidos).

---

### Resultado Final

**O que o validador deve conferir:**
- Proposta gerada em formato Markdown visivel na tela
- Tabela de itens com precos corretos: unitario `R$ 17.800,00`, total `R$ 178.000,00`
- Especificacoes cruzadas com badge amarelo em "12 parametros" (Parcial)
- Fabricante `Mindray Bio-Medical Electronics`, registro ANVISA `80262090001`
- Status da proposta: "Rascunho" apos geracao

**Sinais de problema:**
- Motor IA nao responde apos 60 segundos
- Proposta gerada sem dados de preco
- Especificacoes nao sao cruzadas
- Badge de nao-conformidade parcial nao aparece

---

## [UC-R02] Upload de Proposta Externa

> **O que este caso de uso faz:** Permite fazer upload de uma proposta tecnica elaborada externamente (em PDF), como alternativa ou complemento a proposta gerada pelo sistema. Util quando o setor comercial ja preparou um documento proprio. O arquivo pode ser visualizado, substituido ou removido.

**Onde:** Menu lateral -> Proposta -> card "Gerar Nova Proposta" (botao "Upload Proposta Externa")
**Quanto tempo leva:** 2 a 3 minutos

---

### Antes de comecar

- UC-R01 concluido (proposta gerada)
- Arquivo de teste disponivel em `tests/fixtures/teste_upload.pdf`

---

### Passo 1 — Fazer upload do documento

**O que fazer:** Clique no botao `Upload Proposta Externa`. Selecione o arquivo `tests/fixtures/teste_upload.pdf`. Preencha os campos:

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Tipo | `Proposta tecnica externa (PDF)` |
| Descricao | `Proposta alternativa elaborada pelo setor comercial` |
| Lote vinculado | `Lote 1 — Monitores Multiparametricos` |

**O que voce vai ver na tela:** Badge "Enviado" com o nome do arquivo. Botoes "Visualizar" e "Remover" disponiveis.

---

### Passo 2 — Verificar visualizacao e substituicao

**O que fazer:** Clique em `Visualizar` para abrir o PDF. Em seguida, faca upload de outro arquivo para verificar que a substituicao funciona. Por fim, clique em `Remover` para excluir o arquivo.

**O que voce vai ver na tela:** Ao visualizar, o PDF abre em nova aba ou modal. Ao substituir, o novo arquivo aparece no lugar do anterior. Ao remover, o badge "Enviado" desaparece.

---

### Resultado Final

**O que o validador deve conferir:**
- Upload concluido com badge "Enviado" e nome do arquivo
- Visualizacao do PDF funcional
- Substituicao de arquivo funcional
- Remocao do arquivo funcional

**Sinais de problema:**
- Upload falha ou nao aceita PDF
- Botao "Visualizar" nao abre o arquivo
- Substituicao nao atualiza o arquivo exibido
- Remocao nao limpa o badge

---

## [UC-R03] Personalizar Descricao Tecnica (A/B)

> **O que este caso de uso faz:** O sistema gera duas variacoes de descricao tecnica para cada produto: uma tecnica (objetiva, especificacoes puras) e uma comercial (persuasiva, com beneficios). Voce pode editar ambas e escolher qual vai na proposta final. E como ter duas versoes do mesmo texto — uma para o engenheiro e outra para o gestor.

**Onde:** Menu lateral -> Proposta -> card "Proposta Selecionada" (abas Variacao A / Variacao B)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- UC-R01 concluido (proposta gerada)

---

### Passo 1 — Visualizar Variacao A (Descricao Tecnica)

**O que fazer:** No card "Proposta Selecionada", localize a aba `Variacao A`. Verifique o texto tecnico:

| Campo | Valor |
|---|---|
| Estilo | `Tecnico` |
| Produto | `Monitor Multiparametrico Mindray iMEC10 Plus` |
| Descricao | `"Monitor multiparametrico para UTI e pronto-socorro, 10 parametros simultaneos, tela touch TFT colorida de 12,1 polegadas, monitoracao continua de ECG (12 derivacoes), SpO2, NIBP, temperatura, frequencia respiratoria e EtCO2. Bateria com autonomia de 6 horas. Peso de 4,1 kg. Alimentacao 100-240 VAC. Registro ANVISA 80262090001."` |

**O que voce vai ver na tela:** Texto tecnico objetivo com especificacoes detalhadas do produto.

---

### Passo 2 — Visualizar ou gerar Variacao B (Descricao Comercial)

**O que fazer:** Clique na aba `Variacao B`. Se nao houver texto, clique em `Gerar Variacao B por IA`. Verifique o texto comercial:

| Campo | Valor |
|---|---|
| Estilo | `Comercial` |
| Produto | `Monitor Multiparametrico Mindray iMEC10 Plus` |
| Descricao | `"Monitor de sinais vitais Mindray iMEC10 Plus — solucao completa de monitoracao a beira do leito com 10 parametros, tela sensivel ao toque de alta resolucao (12,1"), design compacto e leve (4,1 kg), ideal para UTI, centro cirurgico e pronto-socorro. Autonomia de bateria de ate 6 horas para transporte intra-hospitalar. Produto com registro ANVISA vigente (80262090001) e suporte tecnico nacional."` |

**O que voce vai ver na tela:** Texto comercial persuasivo com beneficios e diferenciais. Abas "Variacao A" e "Variacao B" visiveis lado a lado.

---

### Passo 3 — Selecionar variacao ativa

**O que fazer:** Use o radio button para selecionar qual variacao sera incluida na proposta final. Alterne entre A e B para verificar que a selecao funciona.

**O que voce vai ver na tela:** Radio button para escolher a variacao ativa. A variacao selecionada fica destacada.

---

### Resultado Final

**O que o validador deve conferir:**
- Duas variacoes visiveis: A (tecnica) e B (comercial)
- Ambas editaveis inline
- Radio button para selecionar qual vai na proposta
- Botao "Gerar Variacao B por IA" funcional
- Preview lado a lado das variacoes

**Sinais de problema:**
- Apenas uma variacao visivel
- Texto nao e editavel
- Radio de selecao nao funciona
- IA nao gera variacao B

---

## [UC-R04] Auditoria ANVISA (Semaforo Regulatorio)

> **O que este caso de uso faz:** O sistema consulta o registro ANVISA do produto ofertado e exibe um semaforo regulatorio com indicadores de status. Cada indicador mostra se o registro esta vigente, a classe de risco, a validade e o status da AFE da empresa. E como um checklist regulatorio automatizado — o semaforo verde indica que tudo esta em ordem para incluir o produto na proposta.

**Onde:** Menu lateral -> Proposta -> card "Auditoria ANVISA"
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de comecar

- UC-R01 concluido (proposta gerada com produto vinculado)
- Conexao com a base ANVISA operacional

---

### Passo 1 — Executar auditoria ANVISA

**O que fazer:** No card "Auditoria ANVISA", verifique que o produto `Monitor Multiparametrico Mindray iMEC10 Plus` esta selecionado com registro `80262090001`. Clique em `Verificar Registros`.

**O que voce vai ver na tela:** Indicador de carregamento durante a consulta. Apos concluir, o semaforo regulatorio e exibido.

---

### Passo 2 — Verificar resultado do semaforo

**O que fazer:** Analise os indicadores do semaforo:

| Indicador | Status | Cor | Descricao |
|---|---|---|---|
| Registro ANVISA | Vigente | `Verde` | Registro ativo e dentro da validade |
| Classe de risco | III | `Amarelo` | Produto classe III — requer cuidados adicionais |
| Vencimento do registro | > 12 meses | `Verde` | Registro vence em mais de 1 ano |
| AFE da empresa | Vigente | `Verde` | Autorizacao de funcionamento ativa |

**O que voce vai ver na tela:** Icones verde/amarelo/vermelho por indicador. Badge geral: "Atencao" (amarelo) devido a classe de risco III. Timestamp da ultima verificacao.

---

### Passo 3 — Verificar cenario de alerta (opcional)

**O que fazer:** Se disponivel, teste um produto sem registro ANVISA para verificar o cenario de bloqueio:

| Indicador | Status | Cor |
|---|---|---|
| Registro ANVISA | Nao encontrado | `Vermelho` |
| Recomendacao | "Nao incluir na proposta ate regularizacao" | — |

**O que voce vai ver na tela:** Semaforo vermelho com recomendacao de bloqueio.

---

### Resultado Final

**O que o validador deve conferir:**
- Semaforo com 4 indicadores (Registro, Classe de Risco, Vencimento, AFE)
- Registro ANVISA `80262090001`: verde (vigente)
- Classe de risco III: amarelo (atencao)
- Badge geral: "Atencao" (amarelo)
- Detalhes clicaveis nos indicadores
- Timestamp da ultima verificacao

**Sinais de problema:**
- Consulta ANVISA nao retorna resultado
- Semaforo nao e exibido
- Indicadores todos cinzas (sem dados)
- Erro de conexao com base ANVISA

---

## [UC-R05] Auditoria Documental + Smart Split

> **O que este caso de uso faz:** O sistema verifica se todos os documentos exigidos para a licitacao estao disponiveis e dentro da validade. Gera um checklist com status por documento (disponivel, pendente, vencido). Tambem oferece a funcionalidade Smart Split para dividir PDFs maiores que 25 MB em partes menores. E como um conferente que verifica se toda a documentacao da pasta esta em ordem antes de protocolar.

**Onde:** Menu lateral -> Proposta -> card "Auditoria Documental"
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- UC-R01 a UC-R04 concluidos
- Documentos da empresa cadastrados na Sprint 1 (certidoes, contrato social, etc.)

---

### Passo 1 — Verificar checklist documental

**O que fazer:** No card "Auditoria Documental", clique em `Verificar Documentos`. Analise a checklist gerada:

| # | Documento | Status | Origem |
|---|---|---|---|
| 1 | Proposta Tecnica (assinada) | `Gerada` | UC-R01 |
| 2 | Certidao Negativa de Debitos Federais | `Disponivel` | Sprint 1 (UC-F04) |
| 3 | Certidao de Regularidade FGTS | `Disponivel` | Sprint 1 (UC-F04) |
| 4 | Certidao Negativa de Debitos Trabalhistas | `Disponivel` | Sprint 1 (UC-F04) |
| 5 | Contrato Social | `Disponivel` | Sprint 1 (UC-F03) |
| 6 | Alvara de Funcionamento | `Disponivel` | Sprint 1 (UC-F03) |
| 7 | Atestado de Capacidade Tecnica | `Pendente` | (nao cadastrado) |
| 8 | Registro ANVISA do produto | `Vigente` | UC-R04 |
| 9 | AFE — Autorizacao de Funcionamento ANVISA | `Pendente` | (verificar cadastro) |
| 10 | Balanco Patrimonial | `Pendente` | (nao cadastrado) |

**O que voce vai ver na tela:** Checklist com badges coloridos: verde (Disponivel/Vigente/Gerada), amarelo (Pendente), vermelho (Vencido). Indicador de completude (%) da documentacao.

---

### Passo 2 — Upload de documento pendente

**O que fazer:** Para o item 7 (Atestado de Capacidade Tecnica), clique em "Upload" e envie o arquivo:

| Campo | Valor |
|---|---|
| Documento | `Atestado de Capacidade Tecnica` |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Validade | `2027-06-30` |

**O que voce vai ver na tela:** O status do documento muda de "Pendente" (amarelo) para "Disponivel" (verde). O percentual de completude aumenta.

---

### Passo 3 — Testar Smart Split (documento > 25 MB)

**O que fazer:** Se disponivel, teste a funcionalidade de divisao de PDF. Faça upload de um arquivo (ou simule com `tests/fixtures/teste_upload.pdf`):

| Campo | Valor |
|---|---|
| Arquivo simulado | `tests/fixtures/teste_upload.pdf` |
| Acao | Clicar em `Dividir PDF` (botao "Fracionar") |
| Partes geradas | `documento_parte1.pdf`, `documento_parte2.pdf` |

**O que voce vai ver na tela:** O botao "Dividir PDF" / "Fracionar" ativo quando arquivo > 25 MB. Partes geradas com nomeacao padrao.

---

### Resultado Final

**O que o validador deve conferir:**
- Checklist com 10 documentos listados
- Badges: Disponivel (verde), Pendente (amarelo), Vencido (vermelho)
- Upload de Atestado de Capacidade Tecnica atualiza status para "Disponivel"
- Indicador de completude (%) atualizado apos upload
- Smart Split funcional para PDFs > 25 MB

**Sinais de problema:**
- Checklist nao lista todos os documentos
- Upload nao atualiza o status
- Percentual de completude nao recalcula
- Botao "Fracionar" nao aparece

---

## [UC-R06] Exportar Dossie Completo

> **O que este caso de uso faz:** O sistema compila todos os documentos da proposta (proposta tecnica, planilha de precos, certidoes, registros ANVISA, atestados) em um dossie unico. Pode ser exportado em PDF consolidado, DOCX editavel ou ZIP com arquivos separados. E como montar o envelope final da licitacao — tudo organizado em um unico pacote pronto para protocolar.

**Onde:** Menu lateral -> Proposta -> card "Exportacao"
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de comecar

- UC-R01 a UC-R05 concluidos (proposta e documentos verificados)

---

### Passo 1 — Selecionar formato e exportar

**O que fazer:** No card "Exportacao", clique em `Exportar Dossie`. Na modal, selecione o formato desejado:

| Formato | Extensao | Verificacao |
|---|---|---|
| PDF consolidado | `.pdf` | Documento unico com todas as secoes |
| DOCX editavel | `.docx` | Documento Word editavel |
| ZIP com arquivos separados | `.zip` | Pasta com cada documento individual |

**O que voce vai ver na tela:** Modal com opcoes de formato (radio button). Ao selecionar e confirmar, o download e iniciado.

---

### Passo 2 — Verificar conteudo do dossie

**O que fazer:** Verifique que o dossie contem todas as secoes:

| Secao | Conteudo |
|---|---|
| Capa | Empresa (CH Hospitalar), edital, lote, data |
| Proposta Tecnica | Documento gerado no UC-R01 |
| Planilha de Precos | Itens com quantidades, precos unitarios e totais |
| Documentos de Habilitacao | PDFs de certidoes, contrato social |
| Registro ANVISA | Comprovante de consulta `80262090001` |
| Atestados Tecnicos | PDFs de atestados de capacidade |

**O que voce vai ver na tela:** Arquivo baixado com nome padrao: `dossie_[edital]_[data].ext`. Conteudo completo com todas as secoes.

---

### Passo 3 — Testar os tres formatos de exportacao

**O que fazer:** Repita a exportacao nos tres formatos (PDF, DOCX, ZIP) e verifique que todos funcionam.

**O que voce vai ver na tela:** Tres downloads realizados com as extensoes correspondentes.

---

### Resultado Final

**O que o validador deve conferir:**
- Botao "Exportar Dossie" abre modal com opcoes de formato
- Tres formatos disponiveis: PDF, DOCX, ZIP
- Download funcional em todos os formatos
- Conteudo PDF: todas as secoes presentes e formatadas
- Conteudo ZIP: arquivos individuais nomeados
- Nome do arquivo segue padrao: `dossie_[edital]_[data].ext`

**Sinais de problema:**
- Modal de exportacao nao abre
- Download falha ou arquivo vazio
- Secoes faltando no dossie
- Formato DOCX ou ZIP nao disponivel

---

## [UC-R07] Gerenciar Status e Submissao

> **O que este caso de uso faz:** Controla o workflow de status da proposta desde a criacao ate o envio ao portal de compras. As transicoes seguem ordem estrita: Rascunho -> Em Revisao -> Aprovada -> Enviada. Retrocesso e permitido ate "Aprovada", mas nao apos "Enviada". Inclui campos de protocolo de envio e historico de transicoes. E como o fluxo de aprovacao de um documento — cada etapa tem seu responsavel e seu carimbo.

**Onde:** Menu lateral -> Proposta -> card "Proposta Selecionada" (botoes de status) + Submissao (`/app/submissao`)
**Quanto tempo leva:** 5 a 8 minutos

---

### Antes de comecar

- UC-R01 a UC-R06 concluidos (proposta gerada, auditada e exportada)

---

### Passo 1 — Verificar status inicial (Rascunho)

**O que fazer:** No card "Proposta Selecionada", verifique o status atual da proposta.

**O que voce vai ver na tela:** Badge cinza `Rascunho` indicando que a proposta foi recem-criada.

---

### Passo 2 — Transicao para "Em Revisao"

**O que fazer:** Clique no botao `Enviar para Revisao`.

**O que voce vai ver na tela:** Modal de confirmacao. Apos confirmar, o badge muda para amarelo `Em Revisao`.

---

### Passo 3 — Transicao para "Aprovada"

**O que fazer:** Clique no botao `Aprovar Proposta`.

**O que voce vai ver na tela:** Modal de confirmacao. Apos confirmar, o badge muda para verde `Aprovada`.

---

### Passo 4 — Testar retrocesso permitido

**O que fazer:** Clique em `Devolver para Revisao` para retroceder de "Aprovada" para "Em Revisao". Verifique a transicao. Em seguida, re-aprove a proposta clicando em `Aprovar Proposta` novamente.

**O que voce vai ver na tela:** Badge muda de verde "Aprovada" para amarelo "Em Revisao" e de volta para verde "Aprovada".

---

### Passo 5 — Transicao para "Enviada" (Submissao)

**O que fazer:** Acesse a pagina de Submissao (`/app/submissao`). Na tabela "Propostas Prontas para Envio", localize a proposta aprovada. Clique em `Marcar como Enviada`. Preencha os dados de submissao:

| Campo | Valor |
|---|---|
| Protocolo de envio | `PROT-2026-04-001` |
| Data de envio | `2026-04-08` |
| Hora de envio | `14:30` |
| Canal de envio | `Portal de Compras (manual)` |
| Responsavel pelo envio | `Diego Ricardo Munoz` |
| Observacoes | `Proposta enviada via portal comprasnet, protocolo confirmado` |

**O que voce vai ver na tela:** Badge muda para azul `Enviada`. Dados de submissao salvos e visiveis.

---

### Passo 6 — Verificar transicoes bloqueadas

**O que fazer:** Tente retroceder a proposta de "Enviada" para qualquer status anterior.

**O que voce vai ver na tela:** Botoes de retrocesso desabilitados ou erro de validacao. Nao e possivel retroceder apos envio.

---

### Passo 7 — Verificar historico de transicoes

**O que fazer:** Localize a tabela de historico de transicoes da proposta.

**O que voce vai ver na tela:** Tabela com colunas: data, status anterior, novo status, usuario. Todas as transicoes realizadas devem estar registradas.

---

### Resultado Final

**O que o validador deve conferir:**
- Workflow completo: Rascunho -> Em Revisao -> Aprovada -> Enviada
- Badges com cores corretas: cinza (Rascunho), amarelo (Em Revisao), verde (Aprovada), azul (Enviada)
- Retrocesso: "Aprovada" -> "Em Revisao" funcional
- Bloqueio: nao permite retroceder de "Enviada"
- Dados de submissao: protocolo `PROT-2026-04-001`, data `2026-04-08`, responsavel `Diego Ricardo Munoz`
- Historico de transicoes com todas as mudancas registradas
- Proposta "Enviada" nao permite edicao

**Sinais de problema:**
- Transicao de status nao funciona
- Badge nao muda de cor
- Retrocesso de "Enviada" e permitido (deveria ser bloqueado)
- Historico de transicoes nao registra mudancas
- Proposta enviada ainda permite edicao

---

## Resumo de Verificacoes por UC

| UC | Verificacao | Status |
|---|---|---|
| UC-P01 | Lotes criados com itens distribuidos, especialidades salvas, movimentacao entre lotes funcional | |
| UC-P02 | Vinculacao IA do Monitor (match >= 80%), acessorios marcados manualmente, badges verde/cinza | |
| UC-P03 | Volumetria calculada: Monitor 10 unid (fator 1.0), Sensor SpO2 15 unid/ano, fator editavel | |
| UC-P04 | Custos ERP: Monitor R$ 14.200,00, tributos ICMS 12% PIS 1,65% COFINS 7,60% IPI 0%, total calculado | |
| UC-P05 | Preco Base: Monitor R$ 22.486,40 (Custo+Markup 28%), acessorios com preco manual | |
| UC-P06 | Valores de referencia importados do edital, modo percentual funcional, indicador B vs C | |
| UC-P07 | Lances D e E preenchidos, desconto e margem calculados, regras D<=C e E<=D aplicadas | |
| UC-P08 | Estrategia "Quero ganhar" Lote 1 desconto 8%, "Nao ganhei" Lote 2, simulador 4 cenarios | |
| UC-P09 | Historico PNCP buscado, estatisticas media/mediana/min/max, grafico de tendencia, CSV exportado | |
| UC-P10 | Comodato cadastrado serie MR-IMEC10-2026-001, amortizacao R$ 712,06/mes, edicao recalcula, exclusao funcional | |
| UC-P11 | Pipeline IA 4 etapas concluidas, sugestoes A-E geradas, "Aplicar Sugestoes" e "Descartar" funcionais | |
| UC-P12 | Relatorio gerado em Markdown com todas as secoes, PDF exportado, valores consistentes | |
| UC-R01 | Proposta gerada com cruzamento edital x portfolio, preco unitario R$ 17.800,00, total R$ 178.000,00, spec parcial (10 vs 12 parametros) | |
| UC-R02 | Upload de proposta externa PDF, visualizacao, substituicao e remocao funcionais | |
| UC-R03 | Variacoes A (tecnica) e B (comercial) visiveis, editaveis, selecionaveis por radio | |
| UC-R04 | Semaforo ANVISA: registro 80262090001 verde, classe III amarelo, badge geral "Atencao" | |
| UC-R05 | Checklist 10 documentos, upload Atestado Tecnico, Smart Split para PDF > 25 MB | |
| UC-R06 | Dossie exportado em PDF, DOCX e ZIP com todas as secoes, download funcional | |
| UC-R07 | Workflow Rascunho->Em Revisao->Aprovada->Enviada, retrocesso permitido, bloqueio apos envio, protocolo PROT-2026-04-001 | |

---

## O que reportar se algo falhar

Se durante a validacao voce encontrar algo diferente do esperado, relate com as seguintes informacoes para facilitar a correcao:

**1. Qual UC falhou?**
Exemplo: "UC-P05, Passo 1"

**2. O que voce esperava ver?**
Exemplo: "O Preco Base deveria ser R$ 22.486,40"

**3. O que apareceu em vez disso?**
Exemplo: "O calculo retornou R$ 0,00"

**4. Alguma mensagem de erro apareceu?**
Se sim, copie o texto exato da mensagem ou tire um print da tela.

**5. Em qual passo voce estava?**
Exemplo: "Acabei de selecionar o modo Custo + Markup e cliquei em Calcular"

**6. O problema aparece toda vez que voce tenta, ou so aconteceu uma vez?**
Se aconteceu so uma vez, tente repetir o passo para confirmar se e consistente.

---
