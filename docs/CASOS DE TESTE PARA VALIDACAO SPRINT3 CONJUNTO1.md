# CASOS DE TESTE PARA VALIDACAO — SPRINT 3 — CONJUNTO 1

**Data:** 2026-04-21
**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Dados:** tutorialsprint3-1.md / dadosprecprop-1.md
**UCs:** P01-P12, R01-R07 (19 casos de uso)
**Credenciais:** valida1@valida.com.br / 123456

---

## Convencoes

- **ID:** CT-P{UC}-{numero} (Precificacao) ou CT-R{UC}-{numero} (Proposta)
- **Tipo:** Positivo (fluxo principal), Negativo (erro esperado), Limite (caso de borda), Alternativo (FA)
- Pre-requisitos globais: Empresa CH Hospitalar (CNPJ 43.712.232/0001-85), produtos Monitor iMEC10 Plus (SKU MD-IMEC10-PLUS-BR) e Ultrassonografo M7T (SKU MD-M7T-BR-2024), markup 28%, custos fixos R$ 85.000, frete R$ 350. Edital de "monitor multiparametrico" salvo com decisao GO e itens importados.

---

# FASE 1 — PRECIFICACAO

---

## UC-P01 — Organizar Edital por Lotes

### CT-P01-01 — Selecionar edital e carregar dados
- **Descricao:** Verificar que ao selecionar o edital de "monitor multiparametrico", os dados sao carregados corretamente.
- **Pre-condicoes:** Usuario logado como valida1@valida.com.br, empresa CH Hospitalar ativa. Edital de "monitor multiparametrico" salvo na Sprint 2 com decisao GO.
- **Acoes do ator e dados de entrada:**
  1. No menu lateral, clicar em "Precificacao".
  2. No card "Edital", abrir o select "Selecione o edital".
  3. Selecionar o edital de `monitor multiparametrico`.
- **Saida esperada:** A pagina de Precificacao carrega com os dados do edital. As 4 abas (Lotes, Custos e Precos, Lances, Historico) ficam visiveis.
- **Tipo:** Positivo

### CT-P01-02 — Criar lotes a partir dos itens do edital
- **Descricao:** Verificar que o botao "Criar Lotes" gera lotes automaticamente a partir dos itens importados.
- **Pre-condicoes:** CT-P01-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar no botao `Criar Lotes`.
- **Saida esperada:** A aba "Lotes" e preenchida com cards expandiveis. Pelo menos 2 lotes sao criados. Os itens do edital aparecem distribuidos nos lotes.
- **Tipo:** Positivo

### CT-P01-03 — Configurar Lote 1 (Monitores Multiparametricos)
- **Descricao:** Preencher parametros tecnicos do Lote 1 e verificar salvamento.
- **Pre-condicoes:** CT-P01-02 concluido. Lotes criados.
- **Acoes do ator e dados de entrada:**
  1. Expandir o card do Lote 1.
  2. Preencher os campos:
     - Especialidade: `Monitoracao`
     - Volume Exigido: `10`
     - Tipo de Amostra: `Unidade`
  3. Clicar em `Atualizar Lote`.
- **Saida esperada:** Toast de confirmacao. A tabela "Itens do Lote" exibe 4 itens: Monitor multiparametrico (Qtd 10, R$ 18.500,00), Cabo de ECG 5 vias (Qtd 10, R$ 350,00), Sensor de SpO2 (Qtd 15, R$ 280,00), Suporte com rodizios (Qtd 10, R$ 950,00).
- **Tipo:** Positivo

### CT-P01-04 — Configurar Lote 2 (Oximetros)
- **Descricao:** Preencher parametros tecnicos do Lote 2 e verificar salvamento.
- **Pre-condicoes:** CT-P01-03 concluido.
- **Acoes do ator e dados de entrada:**
  1. Expandir o card do Lote 2.
  2. Preencher os campos:
     - Especialidade: `Diagnostico`
     - Volume Exigido: `20`
     - Tipo de Amostra: `Unidade`
  3. Clicar em `Atualizar Lote`.
- **Saida esperada:** Toast de confirmacao. A tabela exibe 1 item: Oximetro de pulso portatil (Qtd 20, R$ 1.200,00).
- **Tipo:** Positivo

### CT-P01-05 — Mover item entre lotes e desfazer
- **Descricao:** Verificar movimentacao de item entre lotes (ida e volta).
- **Pre-condicoes:** CT-P01-04 concluido. Lotes 1 e 2 configurados.
- **Acoes do ator e dados de entrada:**
  1. Mover o item 5 (Suporte com rodizios) do Lote 1 para o Lote 2.
  2. Verificar que o item aparece no Lote 2 e sumiu do Lote 1.
  3. Mover o item 5 de volta para o Lote 1.
- **Saida esperada:** Apos mover para Lote 2, item 5 aparece na tabela do Lote 2 e some da tabela do Lote 1. Apos desfazer, item 5 retorna ao Lote 1.
- **Tipo:** Alternativo

### CT-P01-06 — Criar e excluir lote vazio
- **Descricao:** Verificar criacao de lote vazio e sua exclusao.
- **Pre-condicoes:** CT-P01-04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Criar um novo lote chamado `Lote 3 — Reserva` sem adicionar itens.
  2. Verificar que o lote aparece na lista.
  3. Excluir o Lote 3.
- **Saida esperada:** Lote 3 aparece como card vazio. Apos exclusao, somente Lote 1 e Lote 2 permanecem.
- **Tipo:** Alternativo

---

## UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)

### CT-P02-01 — Vinculacao automatica por IA do Lote 1
- **Descricao:** Executar vinculacao automatica por IA e verificar resultados de match.
- **Pre-condicoes:** UC-P01 concluido. Produtos Monitor iMEC10 Plus e Ultrassonografo M7T cadastrados no portfolio.
- **Acoes do ator e dados de entrada:**
  1. Selecionar o `Lote 1 — Monitores Multiparametricos`.
  2. Clicar no botao `Vincular Portfolio por IA`.
  3. Aguardar processamento (10-30 segundos).
- **Saida esperada:** Item 1 (Monitor) vinculado automaticamente ao `Monitor Multiparametrico Mindray iMEC10 Plus` com match >= 80%, badge verde "Vinculado". Itens 3, 4, 5 com badge cinza "Sem match" (score < 20%).
- **Tipo:** Positivo

### CT-P02-02 — Vinculacao manual dos acessorios
- **Descricao:** Marcar itens sem match como acessorios com preco manual.
- **Pre-condicoes:** CT-P02-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Para o item 3 (Cabo ECG), clicar em marcar como `Acessorio`.
  2. Repetir para item 4 (Sensor SpO2) e item 5 (Suporte).
- **Saida esperada:** Itens 3, 4 e 5 com badge indicando tipo "Acessorio". Botao "Desvincular" visivel no item 1. Botao "Vincular Manual" visivel nos itens acessorios.
- **Tipo:** Alternativo

### CT-P02-03 — Timeout da IA na vinculacao (excecao)
- **Descricao:** Verificar comportamento quando a IA excede 60 segundos sem resposta.
- **Pre-condicoes:** UC-P01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar no botao "IA" para um item individual.
  2. Se a IA nao responder em 60 segundos, observar o comportamento.
- **Saida esperada:** Toast de erro indicando timeout. O item permanece "nao vinculado".
- **Tipo:** Negativo

---

## UC-P03 — Calculo Tecnico de Volumetria

### CT-P03-01 — Verificar volumetria do Monitor (equipamento unitario)
- **Descricao:** Verificar que o sistema detecta o Monitor como equipamento e aplica fator 1.0.
- **Pre-condicoes:** UC-P02 concluido. Item 1 vinculado ao Monitor iMEC10 Plus.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Custos e Precos", selecionar vinculo Item 1 — Monitor.
  2. Verificar deteccao automatica de tipo.
- **Saida esperada:** Badge "Unidade" no item. Volume calculado = `10 unidades`, fator de conversao = `1.0`.
- **Tipo:** Positivo

### CT-P03-02 — Verificar volumetria do Sensor SpO2 (acessorio consumivel)
- **Descricao:** Verificar calculo de volumetria para acessorio consumivel.
- **Pre-condicoes:** UC-P02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 4 — Sensor SpO2.
  2. Verificar deteccao de tipo.
- **Saida esperada:** Badge "Acessorio consumivel". Volume = `15 unidades/ano`, vida util estimada `12 meses`.
- **Tipo:** Positivo

### CT-P03-03 — Edicao manual do fator de conversao
- **Descricao:** Verificar que o fator de conversao e editavel e o volume recalcula.
- **Pre-condicoes:** CT-P03-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Alterar o fator de conversao de um item para outro valor.
  2. Verificar recalculo automatico do volume total.
- **Saida esperada:** O campo de fator e editavel. Ao alterar, o volume total e recalculado automaticamente.
- **Tipo:** Alternativo

---

## UC-P04 — Configurar Base de Custos (ERP + Tributario)

### CT-P04-01 — Informar custos ERP do Monitor iMEC10 Plus
- **Descricao:** Preencher custo ERP e verificar persistencia.
- **Pre-condicoes:** UC-P03 concluido. Produto com NCM `9018.19.90`.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Custos e Precos", selecionar vinculo do Monitor.
  2. Preencher Custo Unitario (R$): `14.200,00`.
  3. Clicar em `Salvar Custos`.
- **Saida esperada:** Toast de confirmacao. Valor `R$ 14.200,00` exibido e salvo.
- **Tipo:** Positivo

### CT-P04-02 — Informar custos ERP dos acessorios
- **Descricao:** Preencher custos manuais dos acessorios.
- **Pre-condicoes:** CT-P04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar item 3 (Cabo ECG) — preencher custo: `R$ 185,00`.
  2. Selecionar item 4 (Sensor SpO2) — preencher custo: `R$ 145,00`.
  3. Selecionar item 5 (Suporte) — preencher custo: `R$ 520,00`.
  4. Salvar custos de cada item.
- **Saida esperada:** Toast de confirmacao para cada item. Valores persistem na tela.
- **Tipo:** Positivo

### CT-P04-03 — Verificar regras tributarias por NCM 9018
- **Descricao:** Verificar que o sistema aplica tributos corretos para NCM 9018.19.90.
- **Pre-condicoes:** CT-P04-01 concluido. NCM do produto = `9018.19.90`.
- **Acoes do ator e dados de entrada:**
  1. Verificar campo NCM (readonly) = `9018.19.90`.
  2. Verificar aliquotas aplicadas automaticamente.
- **Saida esperada:** ICMS = `12,0%`, IPI = `0,0%` (isento — Dec. 7.660/2011), PIS = `1,65%`, COFINS = `7,60%`. Total com impostos calculado automaticamente.
- **Tipo:** Positivo

### CT-P04-04 — NCM readonly nao e editavel
- **Descricao:** Verificar que o campo NCM importado do produto nao pode ser alterado.
- **Pre-condicoes:** CT-P04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Tentar editar o campo NCM.
- **Saida esperada:** Campo NCM esta readonly (nao aceita digitacao).
- **Tipo:** Negativo

---

## UC-P05 — Montar Preco Base (Camada B)

### CT-P05-01 — Calcular Preco Base do Monitor (Custo + Markup 28%)
- **Descricao:** Verificar calculo automatico do preco base com markup.
- **Pre-condicoes:** UC-P04 concluido. Custo ERP R$ 14.200,00. Markup padrao 28%.
- **Acoes do ator e dados de entrada:**
  1. Selecionar modo "Custo + Markup".
  2. Verificar markup padrao = `28%`.
  3. Verificar calculo automatico.
- **Saida esperada:** Preco Base = `R$ 22.486,40` (Custo R$ 14.200 + ICMS R$ 1.704 + PIS R$ 234,30 + COFINS R$ 1.079,20 + Frete R$ 350 = R$ 17.567,50 + Markup 28% = R$ 22.486,40).
- **Tipo:** Positivo

### CT-P05-02 — Informar precos manuais dos acessorios
- **Descricao:** Preencher precos base manuais para acessorios.
- **Pre-condicoes:** UC-P04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Para Cabo ECG: modo "Manual", preco base `R$ 320,00`.
  2. Para Sensor SpO2: modo "Manual", preco base `R$ 255,00`.
  3. Para Suporte: modo "Manual", preco base `R$ 890,00`.
  4. Clicar `Salvar Preco Base` para cada item.
- **Saida esperada:** Toast de confirmacao para cada item. Precos salvos e exibidos na tela.
- **Tipo:** Positivo

### CT-P05-03 — Verificar edicao do markup pos-calculo
- **Descricao:** Alterar markup e verificar recalculo do preco base.
- **Pre-condicoes:** CT-P05-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Alterar markup de `28%` para `30%`.
  2. Observar recalculo do Preco Base.
  3. Retornar markup para `28%`.
- **Saida esperada:** Preco Base muda ao alterar markup. Ao retornar para 28%, volta para `R$ 22.486,40`.
- **Tipo:** Alternativo

### CT-P05-04 — Tres modos disponiveis (Custo+Markup, Manual, Upload)
- **Descricao:** Verificar que os tres modos de preco base estao disponiveis.
- **Pre-condicoes:** UC-P04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar select "Modo" com opcoes: "Custo + Markup", "Manual", "Upload".
- **Saida esperada:** Tres opcoes visiveis e selecionaveis no dropdown de modo.
- **Tipo:** Positivo

---

## UC-P06 — Definir Valor de Referencia (Camada C)

### CT-P06-01 — Verificar importacao automatica dos valores do edital
- **Descricao:** Verificar que os valores de referencia sao importados automaticamente do edital.
- **Pre-condicoes:** UC-P05 concluido. Edital com valores estimados por item.
- **Acoes do ator e dados de entrada:**
  1. Abrir a secao de Valor de Referencia.
  2. Verificar valores por item.
- **Saida esperada:** Monitor = `R$ 18.500,00`, Cabo ECG = `R$ 350,00`, Sensor SpO2 = `R$ 280,00`, Suporte = `R$ 950,00`, Oximetro = `R$ 1.200,00`. Fonte = "Importado do edital".
- **Tipo:** Positivo

### CT-P06-02 — Testar modo percentual sobre preco base
- **Descricao:** Verificar calculo por percentual sobre preco base.
- **Pre-condicoes:** CT-P06-01 concluido. Preco Base do Monitor = R$ 22.486,40.
- **Acoes do ator e dados de entrada:**
  1. Ativar toggle "% sobre Base".
  2. Preencher `-18%`.
- **Saida esperada:** Valor calculado = `R$ 18.438,85` (R$ 22.486,40 x 0,82).
- **Tipo:** Alternativo

### CT-P06-03 — Indicador visual B vs C (margem negativa)
- **Descricao:** Verificar indicador vermelho quando C < B.
- **Pre-condicoes:** CT-P06-01 concluido. C (R$ 18.500) < B (R$ 22.486,40).
- **Acoes do ator e dados de entrada:**
  1. Observar indicador de comparacao entre B e C para o Monitor.
- **Saida esperada:** Indicador vermelho pois C (R$ 18.500) < B (R$ 22.486,40). Alerta warning de margem negativa potencial.
- **Tipo:** Limite

---

## UC-P07 — Estruturar Lances (Camadas D e E)

### CT-P07-01 — Preencher Lance Inicial para todos os itens
- **Descricao:** Definir lance inicial para cada item do lote.
- **Pre-condicoes:** UC-P06 concluido.
- **Acoes do ator e dados de entrada:**
  1. Monitor: Lance Inicial = `R$ 17.800,00` (desconto 3,8% sobre C).
  2. Cabo ECG: Lance Inicial = `R$ 338,00` (desconto 3,4%).
  3. Sensor SpO2: Lance Inicial = `R$ 270,00` (desconto 3,6%).
  4. Suporte: Lance Inicial = `R$ 915,00` (desconto 3,7%).
- **Saida esperada:** Campos preenchidos. Desconto percentual calculado automaticamente.
- **Tipo:** Positivo

### CT-P07-02 — Preencher Lance Minimo para todos os itens
- **Descricao:** Definir lance minimo para cada item do lote.
- **Pre-condicoes:** CT-P07-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Monitor: Lance Minimo = `R$ 16.500,00` (margem 17,5% sobre custo).
  2. Cabo ECG: Lance Minimo = `R$ 295,00` (margem 59,5%).
  3. Sensor SpO2: Lance Minimo = `R$ 230,00` (margem 58,6%).
  4. Suporte: Lance Minimo = `R$ 780,00` (margem 50,0%).
- **Saida esperada:** Campos preenchidos. Margem sobre custo calculada automaticamente.
- **Tipo:** Positivo

### CT-P07-03 — Verificar validacoes D <= C e E <= D
- **Descricao:** Verificar que as regras de validacao de limites sao aplicadas.
- **Pre-condicoes:** CT-P07-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar que D <= C para todos os itens.
  2. Verificar que E <= D para todos os itens.
  3. Verificar alerta se E <= custo total.
- **Saida esperada:** Alertas visuais se regras violadas. Badge vermelho se E <= custo. Barra horizontal de faixas B-C-D-E por item.
- **Tipo:** Limite

### CT-P07-04 — Salvar Lances
- **Descricao:** Persistir camadas D e E.
- **Pre-condicoes:** CT-P07-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Salvar Lances`.
- **Saida esperada:** Toast de confirmacao. Lances permanecem na tela apos salvar.
- **Tipo:** Positivo

---

## UC-P08 — Definir Estrategia Competitiva

### CT-P08-01 — Configurar perfil "Quero ganhar" para Lote 1
- **Descricao:** Selecionar perfil agressivo e configurar parametros.
- **Pre-condicoes:** UC-P07 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar perfil `Quero ganhar` (radio button).
  2. Definir desconto agressivo: `8,0%`.
- **Saida esperada:** Lance inicial sugerido = `R$ 17.020,00` (8% abaixo de C). Lance minimo sugerido = `R$ 15.900,00`.
- **Tipo:** Positivo

### CT-P08-02 — Configurar perfil "Nao ganhei" para Lote 2
- **Descricao:** Selecionar perfil pos-derrota e registrar dados.
- **Pre-condicoes:** UC-P07 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar perfil `Nao ganhei` para Lote 2.
  2. Informar preco vencedor observado: `R$ 980,00`.
- **Saida esperada:** Diferenca vs lance minimo = `-18,3%`. Recomendacao IA exibida.
- **Tipo:** Alternativo

### CT-P08-03 — Simulacao de cenarios (4 cenarios)
- **Descricao:** Verificar geracao de cenarios de simulacao.
- **Pre-condicoes:** CT-P08-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar tabela de cenarios.
- **Saida esperada:** 4 cenarios: Conservador (3%, R$ 17.945, margem 24,2%), Moderado (6%, R$ 17.390, margem 20,4%), Agressivo (10%, R$ 16.650, margem 15,3%), Limite (14%, R$ 15.910, margem 10,1%).
- **Tipo:** Positivo

### CT-P08-04 — Salvar estrategia
- **Descricao:** Persistir a estrategia competitiva.
- **Pre-condicoes:** CT-P08-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Salvar Estrategia`.
- **Saida esperada:** Toast "Estrategia salva com sucesso".
- **Tipo:** Positivo

---

## UC-P09 — Consultar Historico de Precos (Camada F)

### CT-P09-01 — Buscar historico PNCP de monitor multiparametrico
- **Descricao:** Buscar historico de precos no PNCP.
- **Pre-condicoes:** UC-P07 concluido. Conexao PNCP operacional.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Historico", preencher Produto/Termo: `monitor multiparametrico 12 parametros`.
  2. Clicar em `Filtrar`.
- **Saida esperada:** Card Estatisticas com Preco Medio, Minimo (verde) e Maximo (vermelho). Tabela com resultados contendo Produto, Preco e Data. Dados representativos: media ~R$ 16.640, min ~R$ 14.950, max ~R$ 18.200.
- **Tipo:** Positivo

### CT-P09-02 — Exportar historico em CSV
- **Descricao:** Verificar exportacao CSV funcional.
- **Pre-condicoes:** CT-P09-01 concluido. Resultados na tela.
- **Acoes do ator e dados de entrada:**
  1. Clicar no botao `CSV`.
- **Saida esperada:** Arquivo CSV baixado com dados do historico.
- **Tipo:** Positivo

### CT-P09-03 — Busca sem resultados
- **Descricao:** Verificar comportamento quando nao ha historico.
- **Pre-condicoes:** Aba "Historico" aberta.
- **Acoes do ator e dados de entrada:**
  1. Preencher termo muito especifico/inexistente (ex: `xyzabc123`).
  2. Clicar em `Filtrar`.
- **Saida esperada:** Mensagem "Nenhum historico encontrado". Cards de estatisticas vazios ou ocultos.
- **Tipo:** Negativo

---

## UC-P10 — Gestao de Comodato

### CT-P10-01 — Cadastrar equipamento em comodato
- **Descricao:** Cadastrar comodato com dados completos.
- **Pre-condicoes:** UC-P09 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Historico", secao Comodato, preencher:
     - Equipamento: `Monitor Multiparametrico Mindray iMEC10 Plus`
     - Valor: `R$ 22.486,40`
     - Prazo: `60 meses`
  2. Clicar em `Salvar Comodato`.
- **Saida esperada:** Toast de confirmacao. Amortizacao mensal = `R$ 374,77`. Dados salvos na tabela de comodatos.
- **Tipo:** Positivo

### CT-P10-02 — Verificar calculo de amortizacao com seguro e manutencao
- **Descricao:** Verificar calculo completo de amortizacao.
- **Pre-condicoes:** CT-P10-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar tabela de amortizacao.
- **Saida esperada:** Amortizacao mensal R$ 374,77, Seguro R$ 112,43, Manutencao R$ 224,86, Custo mensal total = `R$ 712,06`.
- **Tipo:** Positivo

### CT-P10-03 — Editar prazo do comodato e verificar recalculo
- **Descricao:** Alterar prazo e verificar recalculo automatico.
- **Pre-condicoes:** CT-P10-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Editar comodato, alterar prazo de `60` para `48` meses.
  2. Salvar.
- **Saida esperada:** Amortizacao mensal recalculada para `R$ 468,47/mes`.
- **Tipo:** Alternativo

### CT-P10-04 — Excluir comodato
- **Descricao:** Excluir comodato e verificar remocao.
- **Pre-condicoes:** CT-P10-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Excluir o comodato criado.
- **Saida esperada:** Comodato desaparece da lista. Confirmacao de exclusao.
- **Tipo:** Alternativo

---

## UC-P11 — Pipeline IA de Precificacao

### CT-P11-01 — Executar pipeline IA para Lote 1
- **Descricao:** Executar pipeline completo e verificar resultados.
- **Pre-condicoes:** UC-P01 a P07 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Selecionar `Lote 1 — Monitores Multiparametricos`.
  2. Clicar em `Executar Pipeline IA de Precificacao`.
  3. Aguardar processamento (30-120 segundos).
- **Saida esperada:** Barra de progresso com 4 etapas concluidas (Busca PNCP, Extracao vencedores, Analise estatistica, Sugestao faixas A-E). Sugestoes geradas para camadas A-E.
- **Tipo:** Positivo

### CT-P11-02 — Verificar sugestoes geradas
- **Descricao:** Analisar sugestoes do pipeline.
- **Pre-condicoes:** CT-P11-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar valores sugeridos para Monitor iMEC10 Plus.
- **Saida esperada:** Sugestoes A-E: A (custo ~R$ 17.567,50), B (preco base ~R$ 22.486,40), C (referencia ~R$ 18.500), D (lance inicial ~R$ 17.200), E (lance minimo ~R$ 15.500). Valores editaveis.
- **Tipo:** Positivo

### CT-P11-03 — Aplicar e descartar sugestoes
- **Descricao:** Verificar botoes "Aplicar Sugestoes" e "Descartar".
- **Pre-condicoes:** CT-P11-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Aplicar Sugestoes`.
  2. Verificar que camadas B-E sao atualizadas.
- **Saida esperada:** Valores das camadas B-E atualizados com sugestoes da IA. Toast de confirmacao.
- **Tipo:** Positivo

---

## UC-P12 — Relatorio de Custos e Precos

### CT-P12-01 — Gerar relatorio para Lote 1
- **Descricao:** Gerar relatorio completo e verificar conteudo.
- **Pre-condicoes:** UC-P01 a P11 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Selecionar Lote 1. Clicar em `Gerar Relatorio de Custos e Precos`.
  2. Aguardar geracao (10-30 segundos).
- **Saida esperada:** Relatorio Markdown com secoes: Cabecalho (CH Hospitalar), Resumo executivo, Tabela de custos (ERP R$ 14.200, impostos, frete), Tabela de precos (Camadas A-E), Historico PNCP, Analise de competitividade, Comodato, Recomendacoes.
- **Tipo:** Positivo

### CT-P12-02 — Exportar relatorio em PDF
- **Descricao:** Verificar exportacao em PDF.
- **Pre-condicoes:** CT-P12-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Baixar PDF`.
- **Saida esperada:** Arquivo .pdf baixado com relatorio formatado. Nome segue padrao: `relatorio_custos_[edital]_[data].pdf`.
- **Tipo:** Positivo

---

# FASE 2 — PROPOSTA

---

## UC-R01 — Gerar Proposta Tecnica (Motor Automatico)

### CT-R01-01 — Gerar proposta para Lote 1
- **Descricao:** Gerar proposta tecnica via motor IA.
- **Pre-condicoes:** FASE 1 concluida. Produto Monitor iMEC10 Plus com specs cadastradas.
- **Acoes do ator e dados de entrada:**
  1. No menu lateral, clicar em "Proposta".
  2. No card "Gerar Nova Proposta":
     - Edital: `monitor multiparametrico`
     - Lote: `Lote 1 — Monitores Multiparametricos`
  3. Clicar em `Gerar Proposta Tecnica`.
  4. Aguardar processamento (30-60 segundos).
- **Saida esperada:** Proposta gerada em Markdown. Nova linha na tabela "Minhas Propostas" com status "Rascunho". Preco unitario R$ 17.800,00, Quantidade 10, Total R$ 178.000,00.
- **Tipo:** Positivo

### CT-R01-02 — Verificar dados cruzados na proposta
- **Descricao:** Verificar cruzamento de dados edital x portfolio x precificacao.
- **Pre-condicoes:** CT-R01-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Analisar proposta gerada.
- **Saida esperada:** Item: "Monitor multiparametrico 12 parametros, tela touch 12". Produto: "Monitor Multiparametrico Mindray iMEC10 Plus". Fabricante: "Mindray Bio-Medical Electronics". Preco unitario: R$ 17.800,00. Quantidade: 10. Total: R$ 178.000,00. ANVISA: 80262090001.
- **Tipo:** Positivo

### CT-R01-03 — Verificar cruzamento de especificacoes tecnicas
- **Descricao:** Verificar tabela de especificacoes cruzadas com badges de conformidade.
- **Pre-condicoes:** CT-R01-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar tabela de especificacoes na proposta.
- **Saida esperada:** Badge amarelo "Parcial" em "12 parametros" (ofertado: 10). Badge verde "Sim" em: tela touch 12,1", SpO2, ECG 12 derivacoes, NIBP, EtCO2, bateria 6h, peso 4,1 kg, ANVISA 80262090001.
- **Tipo:** Positivo

---

## UC-R02 — Upload de Proposta Externa

### CT-R02-01 — Upload de documento PDF externo
- **Descricao:** Fazer upload de proposta elaborada externamente.
- **Pre-condicoes:** UC-R01 concluido. Arquivo `tests/fixtures/teste_upload.pdf` disponivel.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Upload Proposta Externa`.
  2. Preencher:
     - Arquivo: `tests/fixtures/teste_upload.pdf`
     - Tipo: `Proposta tecnica externa (PDF)`
     - Descricao: `Proposta alternativa elaborada pelo setor comercial`
     - Lote: `Lote 1 — Monitores Multiparametricos`
- **Saida esperada:** Badge "Enviado" com nome do arquivo. Botoes "Visualizar" e "Remover" disponiveis.
- **Tipo:** Positivo

### CT-R02-02 — Visualizar e substituir arquivo
- **Descricao:** Verificar visualizacao e substituicao do arquivo importado.
- **Pre-condicoes:** CT-R02-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Visualizar` — PDF abre em nova aba.
  2. Fazer upload de outro arquivo (substituicao).
  3. Clicar em `Remover`.
- **Saida esperada:** Visualizacao funcional. Substituicao atualiza o arquivo. Remocao limpa o badge.
- **Tipo:** Alternativo

---

## UC-R03 — Personalizar Descricao Tecnica (A/B)

### CT-R03-01 — Visualizar Variacao A (tecnica)
- **Descricao:** Verificar texto tecnico da variacao A.
- **Pre-condicoes:** UC-R01 concluido. Proposta selecionada.
- **Acoes do ator e dados de entrada:**
  1. No card "Proposta Selecionada", localizar aba Variacao A.
- **Saida esperada:** Texto tecnico com especificacoes: "Monitor multiparametrico para UTI e pronto-socorro, 10 parametros simultaneos, tela touch TFT colorida de 12,1 polegadas...". ANVISA 80262090001.
- **Tipo:** Positivo

### CT-R03-02 — Gerar e verificar Variacao B (comercial)
- **Descricao:** Gerar variacao comercial por IA.
- **Pre-condicoes:** CT-R03-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar na aba `Variacao B`.
  2. Clicar em `Gerar Variacao B por IA`.
- **Saida esperada:** Texto comercial persuasivo: "Monitor de sinais vitais Mindray iMEC10 Plus — solucao completa...". Design compacto, 4,1 kg, bateria 6h, suporte tecnico nacional. ANVISA 80262090001.
- **Tipo:** Alternativo

### CT-R03-03 — Selecionar variacao ativa por radio button
- **Descricao:** Alternar entre variacoes A e B.
- **Pre-condicoes:** CT-R03-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar Variacao A (radio).
  2. Selecionar Variacao B (radio).
  3. Retornar para Variacao A.
- **Saida esperada:** Radio button funciona. Variacao selecionada fica destacada. Ambas editaveis.
- **Tipo:** Alternativo

---

## UC-R04 — Auditoria ANVISA (Semaforo Regulatorio)

### CT-R04-01 — Executar auditoria ANVISA
- **Descricao:** Verificar semaforo regulatorio para produto com ANVISA valido.
- **Pre-condicoes:** UC-R01 concluido. Monitor iMEC10 Plus com registro 80262090001.
- **Acoes do ator e dados de entrada:**
  1. No card "Auditoria ANVISA", clicar em `Verificar Registros`.
- **Saida esperada:** Semaforo com 4 indicadores: Registro ANVISA = Verde (vigente), Classe de Risco III = Amarelo, Vencimento > 12 meses = Verde, AFE = Verde. Badge geral "Atencao" (amarelo por classe III).
- **Tipo:** Positivo

### CT-R04-02 — Verificar cenario de bloqueio (registro vencido)
- **Descricao:** Verificar semaforo vermelho e alerta bloqueante.
- **Pre-condicoes:** CT-R04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Se disponivel, testar produto sem registro ANVISA.
- **Saida esperada:** Semaforo vermelho "Nao encontrado". Recomendacao: "Nao incluir na proposta ate regularizacao".
- **Tipo:** Negativo

---

## UC-R05 — Auditoria Documental + Smart Split

### CT-R05-01 — Verificar checklist documental
- **Descricao:** Executar auditoria e verificar status dos documentos.
- **Pre-condicoes:** UC-R04 concluido. Documentos da empresa cadastrados na Sprint 1.
- **Acoes do ator e dados de entrada:**
  1. No card "Auditoria Documental", clicar em `Verificar Documentos`.
- **Saida esperada:** 10 documentos listados: Proposta Tecnica (Gerada), Certidao Federal (Disponivel), FGTS (Disponivel), Trabalhista (Disponivel), Contrato Social (Disponivel), Alvara (Disponivel), Atestado Tecnico (Pendente), Registro ANVISA (Vigente), AFE ANVISA (Pendente), Balanco Patrimonial (Pendente). Indicador de completude.
- **Tipo:** Positivo

### CT-R05-02 — Upload de documento pendente
- **Descricao:** Fazer upload de Atestado de Capacidade Tecnica e verificar atualizacao de status.
- **Pre-condicoes:** CT-R05-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Para Atestado de Capacidade Tecnica, clicar em "Upload".
  2. Selecionar `tests/fixtures/teste_upload.pdf`.
  3. Informar validade: `2027-06-30`.
- **Saida esperada:** Status muda de "Pendente" (amarelo) para "Disponivel" (verde). Percentual de completude aumenta.
- **Tipo:** Alternativo

---

## UC-R06 — Exportar Dossie Completo

### CT-R06-01 — Exportar dossie nos tres formatos
- **Descricao:** Testar exportacao em PDF, DOCX e ZIP.
- **Pre-condicoes:** UC-R05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Baixar PDF` — download do PDF.
  2. Clicar em `Baixar DOCX` — download do DOCX.
  3. Clicar em `Baixar Dossie ZIP` — download do ZIP.
- **Saida esperada:** Tres downloads realizados. PDF: documento unico com secoes. DOCX: editavel. ZIP: pacote com proposta + certidoes + registros + atestados.
- **Tipo:** Positivo

### CT-R06-02 — Verificar conteudo do dossie
- **Descricao:** Verificar que o dossie contem todas as secoes.
- **Pre-condicoes:** CT-R06-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Abrir o arquivo ZIP e verificar conteudo.
- **Saida esperada:** Capa (CH Hospitalar, edital, lote, data), Proposta Tecnica (UC-R01), Planilha de Precos, Documentos de Habilitacao, Registro ANVISA 80262090001, Atestados.
- **Tipo:** Positivo

---

## UC-R07 — Gerenciar Status e Submissao

### CT-R07-01 — Verificar status inicial Rascunho
- **Descricao:** Verificar status inicial da proposta.
- **Pre-condicoes:** UC-R01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na tabela "Minhas Propostas", verificar status da proposta.
- **Saida esperada:** Badge cinza "Rascunho".
- **Tipo:** Positivo

### CT-R07-02 — Transicao Rascunho para Em Revisao
- **Descricao:** Avançar status para "Em Revisao".
- **Pre-condicoes:** CT-R07-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Enviar para Revisao`.
- **Saida esperada:** Badge muda para amarelo "Em Revisao".
- **Tipo:** Positivo

### CT-R07-03 — Transicao Em Revisao para Aprovada
- **Descricao:** Avançar status para "Aprovada".
- **Pre-condicoes:** CT-R07-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Aprovar Proposta`.
- **Saida esperada:** Badge muda para verde "Aprovada".
- **Tipo:** Positivo

### CT-R07-04 — Retrocesso Aprovada para Em Revisao
- **Descricao:** Verificar retrocesso de status permitido.
- **Pre-condicoes:** CT-R07-03 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Devolver para Revisao`.
  2. Verificar que badge muda para "Em Revisao".
  3. Re-aprovar clicando em `Aprovar Proposta`.
- **Saida esperada:** Badge alterna corretamente entre "Aprovada" e "Em Revisao".
- **Tipo:** Alternativo

### CT-R07-05 — Transicao para Enviada com dados de submissao
- **Descricao:** Marcar proposta como enviada na SubmissaoPage.
- **Pre-condicoes:** CT-R07-03 concluido (proposta Aprovada).
- **Acoes do ator e dados de entrada:**
  1. Acessar pagina de Submissao (`/app/submissao`).
  2. Selecionar proposta aprovada.
  3. Clicar em `Marcar como Enviada`.
  4. Preencher: Protocolo `PROT-2026-04-001`, Data `2026-04-08`, Hora `14:30`, Canal `Portal de Compras (manual)`, Responsavel `Diego Ricardo Munoz`, Observacoes `Proposta enviada via portal comprasnet, protocolo confirmado`.
- **Saida esperada:** Badge muda para azul "Enviada". Dados de submissao salvos.
- **Tipo:** Positivo

### CT-R07-06 — Bloqueio de retrocesso apos envio
- **Descricao:** Verificar que nao e possivel retroceder de "Enviada".
- **Pre-condicoes:** CT-R07-05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Tentar retroceder proposta de "Enviada" para qualquer status anterior.
- **Saida esperada:** Botoes de retrocesso desabilitados ou erro de validacao. Impossivel retroceder apos envio.
- **Tipo:** Negativo

### CT-R07-07 — Verificar checklist de submissao
- **Descricao:** Verificar exibicao do checklist na SubmissaoPage.
- **Pre-condicoes:** CT-R07-03 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na SubmissaoPage, selecionar proposta aprovada.
  2. Verificar 4 itens do checklist.
- **Saida esperada:** Proposta tecnica (marcado), Preco definido (marcado), Documentos anexados (N/M), Revisao final (marcado).
- **Tipo:** Positivo

### CT-R07-08 — Abrir Portal PNCP
- **Descricao:** Verificar que o portal PNCP abre em nova aba.
- **Pre-condicoes:** SubmissaoPage aberta.
- **Acoes do ator e dados de entrada:**
  1. Clicar em `Abrir Portal PNCP`.
- **Saida esperada:** Portal PNCP abre em nova aba do navegador.
- **Tipo:** Positivo

---

# RESUMO DE CASOS DE TESTE

| UC | Quantidade | Positivos | Negativos | Alternativos | Limite |
|---|---|---|---|---|---|
| UC-P01 | 6 | 4 | 0 | 2 | 0 |
| UC-P02 | 3 | 1 | 1 | 1 | 0 |
| UC-P03 | 3 | 2 | 0 | 1 | 0 |
| UC-P04 | 4 | 3 | 1 | 0 | 0 |
| UC-P05 | 4 | 2 | 0 | 1 | 0 |
| UC-P06 | 3 | 1 | 0 | 1 | 1 |
| UC-P07 | 4 | 2 | 0 | 0 | 1 |
| UC-P08 | 4 | 2 | 0 | 1 | 0 |
| UC-P09 | 3 | 2 | 1 | 0 | 0 |
| UC-P10 | 4 | 2 | 0 | 2 | 0 |
| UC-P11 | 3 | 3 | 0 | 0 | 0 |
| UC-P12 | 2 | 2 | 0 | 0 | 0 |
| UC-R01 | 3 | 3 | 0 | 0 | 0 |
| UC-R02 | 2 | 1 | 0 | 1 | 0 |
| UC-R03 | 3 | 1 | 0 | 2 | 0 |
| UC-R04 | 2 | 1 | 1 | 0 | 0 |
| UC-R05 | 2 | 1 | 0 | 1 | 0 |
| UC-R06 | 2 | 2 | 0 | 0 | 0 |
| UC-R07 | 8 | 5 | 1 | 1 | 0 |
| **TOTAL** | **59** | **40** | **5** | **12** | **2** |

---

*Documento gerado em 21/04/2026. Dados extraidos exclusivamente do tutorialsprint3-1.md (Conjunto 1 — CH Hospitalar).*
