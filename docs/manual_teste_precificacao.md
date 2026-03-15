# MANUAL DE TESTE — PRECIFICACAO (FASE 1)

**Data:** 14/03/2026
**Versao:** 1.0
**Base:** CASOS DE USO PRECIFICACAO E PROPOSTA.md (UC-P01 a UC-P10)
**Objetivo:** Validacao manual da interface de precificacao. Para cada caso de uso, lista os passos concretos que o Analista Comercial deve seguir para testar a interface, com dados de exemplo e resultado esperado.

---

## Pre-requisitos Gerais

Antes de iniciar os testes:

1. Estar logado no sistema com usuario valido
2. Ter pelo menos **1 edital salvo** com itens importados do PNCP (status "salvo")
3. Ter pelo menos **3 produtos cadastrados** no portfolio com especificacoes tecnicas e NCM preenchido
4. Pelo menos 1 produto deve ter NCM iniciando com "3822" (reagente diagnostico)
5. Backend rodando na porta 5007, frontend na porta 5175

### Dados de Referencia para os Testes

| Dado | Valor |
|---|---|
| Edital | PE 2024/001 — Hospital Universitario de Sao Paulo |
| Itens PNCP | >=10 itens importados |
| Produto 1 | Kit Hemograma XR200 (Hematologia, NCM 3822.00.90, rendimento 500 testes/kit) |
| Produto 2 | Controle Hematologico HM-500 (Hematologia) |
| Produto 3 | Reagente Bioquimico BQ-100 (Bioquimica, NCM 3822.00.10) |
| Equipamento Comodato | Analisador XYZ-3000 (valor R$ 250.000,00) |

---

## TC-P01: Organizar Edital por Lotes

**Caso de uso:** UC-P01 — Organizar Edital por Lotes
**RF relacionado:** RF-039-01
**Ator:** Analista Comercial

### Dados de teste
- Edital: PE 2024/001 (com >=10 itens importados do PNCP)

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Acessar menu **"Precificacao"** no sidebar | Menu lateral | Pagina PrecificacaoPage abre |
| 2 | Verificar que existem abas | Barra de abas | Abas visiveis: Lotes, Camadas, Lances, Historico |
| 3 | Clicar na aba **"Lotes"** | Aba | Conteudo da aba Lotes aparece |
| 4 | Selecionar edital | **[P01-F01]** SelectInput Edital | Selecionar "PE 2024/001 - Hospital Univ. SP" |
| 5 | Verificar tabela de lotes | **[P01-F04]** Tabela de Lotes | Tabela aparece (vazia se nenhum lote criado ainda) |
| 6 | Clicar **"Importar do PNCP"** | **[P01-F03]** ActionButton | Sistema agrupa itens por categoria e cria lotes-rascunho |
| 7 | Verificar lotes criados | **[P01-F04]** Tabela | Colunas: Lote, Especialidade, Itens, Valor Est., Status, Acoes |
| 8 | Verificar que ha pelo menos 2 lotes | **[P01-F04]** | Ex: Lote 01 Hematologia, Lote 02 Bioquimica |
| 9 | Clicar editar no Lote 01 | **[P01-F05]** IconButton (lapis) | Painel de detalhes do lote expande abaixo |
| 10 | Preencher especialidade | **[P01-F07]** TextInput | Digitar: "Hematologia" |
| 11 | Preencher volume exigido | **[P01-F12]** NumberInput | Digitar: 50000 |
| 12 | Preencher tipo de amostra | **[P01-F11]** TextInput | Digitar: "Sangue total" (opcional) |
| 13 | Verificar itens vinculados | **[P01-F09]** Tabela de Itens | Itens PNCP do lote aparecem com descricao, qtd, unid, valor |
| 14 | Clicar **"Salvar Lote"** | **[P01-F15]** ActionButton | Lote salvo com sucesso |
| 15 | Verificar status atualizado | **[P01-F04]** Tabela | Status do Lote 01 mudou para "Configurado" |
| 16 | Testar **"+ Novo Lote"** | **[P01-F02]** ActionButton | Lote vazio criado para preenchimento manual |
| 17 | Testar excluir lote | **[P01-F06]** IconButton (lixeira) | Confirmacao aparece → confirmar → lote removido |

### Resultado esperado
- Lotes criados automaticamente com itens do PNCP agrupados por especialidade
- Especialidade e volume exigido salvos corretamente
- Status atualizado na tabela apos salvar
- Lote manual pode ser criado e excluido

---

## TC-P02: Selecao Inteligente de Portfolio

**Caso de uso:** UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)
**RF relacionado:** RF-039-07
**Ator:** Analista Comercial + Agente IA

### Dados de teste
- Lote 01 configurado no TC-P01 (Hematologia)
- Portfolio com >=2 produtos de Hematologia cadastrados

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Na aba "Lotes", clicar no Lote 01 | Linha da tabela | Lote selecionado |
| 2 | Clicar **"Selecao Inteligente"** | Botao no card do lote | Modal abre |
| 3 | Verificar painel esquerdo | **[P02-F01]** Lista de Itens | Itens do edital com parametros tecnicos |
| 4 | Verificar painel direito | **[P02-F02]** Lista de Match | Produtos sugeridos pela IA |
| 5 | Verificar badge de match | **[P02-F03]** Badge | % de match colorido: Verde (>80%), Amarelo (60-80%), Vermelho (<60%) |
| 6 | Verificar parametros obrigatorios | **[P02-F04]** Lista de alertas | Faixa de medicao, tipo amostra, ANVISA destacados |
| 7 | Verificar alerta acao humana | **[P02-F05]** Banner warning | "Validacao obrigatoria: confirme cada match" |
| 8 | Selecionar produto sugerido | Radio button em **[P02-F02]** | Produto selecionado |
| 9 | Clicar **"Re-analisar com IA"** | **[P02-F07]** ActionButton | Nova analise executada — sugestoes podem mudar |
| 10 | Clicar **"Confirmar Selecao"** | **[P02-F06]** ActionButton | Modal fecha |
| 11 | Verificar status do lote | **[P01-F04]** Tabela | Lote 01 mostra status "Selecionado" |
| 12 | Testar **"Cancelar"** | **[P02-F08]** ActionButton | Modal fecha sem salvar |

### Resultado esperado
- IA sugere produtos com score de match percentual
- Parametros obrigatorios destacados com alertas visuais
- Alerta de acao humana visivel
- Match confirmado e salvo no banco
- Re-analise funciona sem perder selecoes anteriores

---

## TC-P03: Calculo Tecnico de Volumetria

**Caso de uso:** UC-P03 — Calculo Tecnico de Volumetria
**RF relacionado:** RF-039-02
**Ator:** Analista Comercial

### Dados de teste
- Lote 01 com produto Kit Hemograma XR200 selecionado (TC-P02)
- Rendimento do produto: 500 testes/kit
- Volume do edital: 50000 testes

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Clicar na aba **"Camadas"** | Aba | Conteudo da aba Camadas aparece |
| 2 | Selecionar lote | **[P03-F01]** SelectInput | Selecionar: "01 - Hematologia" |
| 3 | Selecionar item | **[P03-F02]** SelectInput | Selecionar: "Reagente hemograma — Kit XR200" |
| 4 | Verificar rendimento pre-preenchido | **[P03-F07]** NumberInput | Deve mostrar: 500 (do portfolio) |
| 5 | Verificar volume do edital | **[P03-F03]** NumberInput | Deve mostrar: 50000 (do lote) |
| 6 | Preencher repeticoes amostras | **[P03-F04]** NumberInput | Digitar: 2 |
| 7 | Preencher repeticoes calibradores | **[P03-F05]** NumberInput | Digitar: 3 |
| 8 | Preencher repeticoes controles | **[P03-F06]** NumberInput | Digitar: 2 |
| 9 | Clicar **"Calcular"** | **[P03-F08]** ActionButton | Calculo executado |
| 10 | Verificar volume ajustado | **[P03-F09]** Display | Deve mostrar: **50.007 testes** |
| 11 | Verificar kits necessarios | **[P03-F10]** Display | Deve mostrar: **101 kits** (arredondado para cima) |
| 12 | Verificar formula | **[P03-F11]** Display | Deve mostrar: "(50000 + 2 + 3 + 2) / 500 = 100,014 → 101" |
| 13 | Clicar **"Salvar Volumetria"** | **[P03-F12]** ActionButton | Dados salvos |
| 14 | **Teste com rendimento diferente:** alterar [P03-F07] para 100 | | Recalcular |
| 15 | Verificar novo resultado | **[P03-F10]** | Deve mostrar: 501 kits (50007/100 = 500,07 → 501) |

### Resultado esperado
- Calculo correto: Volume Ajustado = Volume + Repeticoes Amostras + Calibradores + Controles
- Kits = ceil(Ajustado / Rendimento)
- Formula visivel com valores utilizados
- Campos pre-preenchidos do portfolio e do lote
- Dados salvos no banco

### Verificacao matematica
```
Volume Ajustado = 50000 + 2 + 3 + 2 = 50.007
Kits = ceil(50007 / 500) = ceil(100,014) = 101

Teste alternativo: ceil(50007 / 100) = ceil(500,07) = 501
```

---

## TC-P04: Configurar Base de Custos (Camada A)

**Caso de uso:** UC-P04 — Configurar Base de Custos (ERP + Tributario)
**RF relacionado:** RF-039-03 + RF-039-04
**Ator:** Analista Comercial

### Dados de teste
- Item com volumetria calculada (TC-P03)
- Produto com NCM = "3822.00.90" (reagente diagnostico — isento ICMS)
- Custo ERP: R$ 85,00

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Na aba "Camadas", localizar secao | "Camada A — Base de Custos" | Secao visivel |
| 2 | Clicar **"Importar do ERP"** | **[P04-F01]** ActionButton | Tentativa de importacao |
| 3 | Se ERP indisponivel, preencher manualmente | **[P04-F09]** NumberInput | Digitar: 85,00 |
| 4 | Verificar NCM | **[P04-F03]** TextInput (readonly) | Deve mostrar: "3822.00.90" |
| 5 | Verificar deteccao de isencao | **[P04-F04]** Badge | Badge verde: "ISENCAO IDENTIFICADA — NCM 3822" |
| 6 | Verificar ICMS zerado | **[P04-F05]** NumberInput | Deve mostrar: 0,00 (isento automaticamente) |
| 7 | Verificar IPI | **[P04-F06]** NumberInput | Deve estar pre-preenchido (ex: 0,00) |
| 8 | Verificar PIS | **[P04-F07]** NumberInput | Deve estar pre-preenchido (ex: 1,65) |
| 9 | Verificar COFINS | **[P04-F08]** NumberInput | Deve estar pre-preenchido (ex: 7,60) |
| 10 | Ajustar custo base final | **[P04-F09]** NumberInput | Manter: R$ 85,00 |
| 11 | Clicar **"Salvar Base de Custos"** | **[P04-F10]** ActionButton | Salvo com sucesso |
| 12 | **Teste NCM nao isento:** trocar produto por NCM diferente (ex: "9018.XX") | | |
| 13 | Verificar que badge de isencao NAO aparece | **[P04-F04]** | Badge neutro ou ausente |
| 14 | Verificar que ICMS nao e zero | **[P04-F05]** | Ex: 18,00% |

### Resultado esperado
- NCM 3822 detecta isencao ICMS automaticamente
- Badge visual "ISENCAO IDENTIFICADA" aparece
- Aliquotas pre-preenchidas e editaveis
- Custo base final salvo
- NCM nao-3822 nao tem isencao

---

## TC-P05: Montar Preco Base (Camada B)

**Caso de uso:** UC-P05 — Montar Preco Base (Camada B)
**RF relacionado:** RF-039-08
**Ator:** Analista Comercial

### Dados de teste
- Custo base (Camada A) = R$ 85,00 (TC-P04)

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Na aba "Camadas", localizar secao | "Camada B — Preco Base" | Secao visivel abaixo de Camada A |
| 2 | Selecionar modo **"Custo + Markup"** | **[P05-F01]** RadioGroup | Terceira opcao selecionada |
| 3 | Verificar custo base readonly | Display | Mostra: "Custo Base (A): R$ 85,00" |
| 4 | Preencher markup | **[P05-F04]** NumberInput | Digitar: 76,47 |
| 5 | Verificar calculo | **[P05-F05]** Display | Deve mostrar: R$ 150,00 (85 x 1,7647) |
| 6 | Alternar para modo **"Manual"** | **[P05-F01]** RadioGroup | Primeira opcao |
| 7 | Preencher preco manual | **[P05-F02]** NumberInput | Digitar: 150,00 |
| 8 | Alternar para modo **"Upload Tabela"** | **[P05-F01]** RadioGroup | Segunda opcao |
| 9 | Selecionar arquivo CSV | **[P05-F03]** FileInput | Selecionar arquivo .csv de teste |
| 10 | Verificar preview | Preview | Tabela importada visivel com mapeamento de colunas |
| 11 | Voltar para **"Custo + Markup"** | **[P05-F01]** | |
| 12 | Marcar flag reutilizar | **[P05-F06]** Checkbox | Marcar: "Reutilizar este Preco Base em outros editais" |
| 13 | Clicar **"Salvar Preco Base"** | **[P05-F07]** ActionButton | Salvo com sucesso |

### Resultado esperado
- 3 modos de input funcionam (Manual, Upload, Custo+Markup)
- Calculo markup: Custo x (1 + markup/100) = correto
- Upload CSV parseia e mostra preview
- Flag de reutilizacao salva
- Preco base salvo no banco

### Verificacao matematica
```
Preco Base = Custo x (1 + Markup/100)
           = 85,00 x (1 + 76,47/100)
           = 85,00 x 1,7647
           = R$ 150,00
```

---

## TC-P06: Definir Valor de Referencia (Camada C)

**Caso de uso:** UC-P06 — Definir Valor de Referencia (Camada C)
**RF relacionado:** RF-039-09
**Ator:** Analista Comercial

### Dados de teste
- Preco base (Camada B) = R$ 150,00 (TC-P05)
- Custo (Camada A) = R$ 85,00 (TC-P04)
- Edital COM valor_referencia: R$ 145,00

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Na aba "Camadas", localizar secao | "Camada C — Valor de Referencia" | Secao visivel |
| 2 | Verificar badge de disponibilidade | **[P06-F01]** Badge | Verde: "Disponivel no edital" |
| 3 | Verificar valor importado | **[P06-F02]** Display | R$ 145,00 (do edital) |
| 4 | Verificar comparativo | **[P06-F05]** Display | Custo(A)=R$85 / Base(B)=R$150 / Target(C)=R$145 |
| 5 | Verificar margem sobre custo | **[P06-F06]** Display | (145-85)/85 x 100 = **70,6%** |
| 6 | Clicar **"Salvar Target"** | **[P06-F07]** ActionButton | Salvo |
| 7 | --- **TESTE ALTERNATIVO: edital SEM valor_referencia** --- | | |
| 8 | Verificar badge | **[P06-F01]** Badge | Amarelo: "Nao disponivel" |
| 9 | Preencher percentual | **[P06-F03]** NumberInput | Digitar: 95 |
| 10 | Verificar target calculado | **[P06-F04]** Display | R$ 142,50 (150 x 0,95) |
| 11 | Verificar margem atualizada | **[P06-F06]** | (142,50-85)/85 x 100 = 67,6% |

### Resultado esperado
- Valor referencia importado automaticamente quando disponivel no edital
- Calculo por percentual quando nao disponivel
- Comparativo visual das 3 camadas (A, B, C)
- Margem sobre custo calculada corretamente

### Verificacao matematica
```
Com valor do edital: Margem = (145 - 85) / 85 = 70,6%
Sem valor (95%):     Target = 150 x 0,95 = R$ 142,50
                     Margem = (142,50 - 85) / 85 = 67,6%
```

---

## TC-P07: Estruturar Lances (Camadas D e E)

**Caso de uso:** UC-P07 — Estruturar Lances (Camadas D e E)
**RF relacionado:** RF-039-10
**Ator:** Analista Comercial

### Dados de teste
- Camada A = R$ 85,00 / Camada B = R$ 150,00 / Camada C = R$ 145,00

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Clicar na aba **"Lances"** | Aba | Conteudo da aba Lances aparece |
| 2 | **--- CAMADA D: Valor Inicial ---** | | |
| 3 | Selecionar modo | **[P07-F01]** RadioGroup | "Valor Absoluto" |
| 4 | Preencher valor inicial | **[P07-F02]** NumberInput | Digitar: 145,00 |
| 5 | **--- CAMADA E: Valor Minimo ---** | | |
| 6 | Selecionar modo | **[P07-F04]** RadioGroup | "% Desconto Maximo" |
| 7 | Preencher % desconto | **[P07-F06]** NumberInput | Digitar: 36,67 |
| 8 | Verificar valor calculado | **[P07-F05]** NumberInput | Deve calcular: R$ 95,00 |
| 9 | Verificar barra visual | **[P07-F07]** Display grafico | Barra: Custo(85) → Minimo(95) → Target(145) → Inicial(145) |
| 10 | Verificar margem minima | **[P07-F08]** Display | (95-85)/85 x 100 = **11,8%** |
| 11 | Verificar faixa de disputa | **[P07-F09]** Display | "R$ 95,00 — R$ 145,00 (52,6% de amplitude)" |
| 12 | **--- TESTE VALIDACAO: Minimo > Inicial ---** | | |
| 13 | Alterar valor minimo | **[P07-F05]** | Digitar: 200,00 |
| 14 | Verificar erro | Mensagem de erro | "Valor minimo deve ser menor que inicial" |
| 15 | **--- TESTE VALIDACAO: Minimo < Custo ---** | | |
| 16 | Alterar valor minimo | **[P07-F05]** | Digitar: 80,00 |
| 17 | Verificar warning | Mensagem de warning | "Lance abaixo do custo!" |
| 18 | **--- RESTAURAR ---** | | |
| 19 | Restaurar valor minimo | **[P07-F05]** | Digitar: 95,00 |
| 20 | Clicar **"Salvar Estrutura de Lances"** | **[P07-F10]** ActionButton | Salvo com sucesso |

### Resultado esperado
- Modos absoluto e percentual funcionam com calculo reciproco automatico
- Barra visual atualiza em tempo real ao digitar
- Validacao: minimo >= inicial gera mensagem de erro
- Validacao: minimo < custo gera mensagem de warning
- Margem minima e faixa de disputa calculadas
- Estrutura de lances salva

### Verificacao matematica
```
Valor Minimo (via %): 150 x (1 - 36,67/100) = 150 x 0,6333 = R$ 95,00
Margem Minima:        (95 - 85) / 85 = 11,76% ≈ 11,8%
Faixa de Disputa:     (145 - 95) / 95 = 52,6%
```

---

## TC-P08: Definir Estrategia Competitiva

**Caso de uso:** UC-P08 — Definir Estrategia Competitiva
**RF relacionado:** RF-039-11
**Ator:** Analista Comercial

### Dados de teste
- Lances configurados (TC-P07)
- Camadas A-E preenchidas

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Na aba "Lances", rolar para secao | "Estrategia Competitiva" | Secao visivel abaixo dos lances |
| 2 | Verificar opcoes | **[P08-F01]** RadioCard | 2 cards: "QUERO GANHAR" e "NAO GANHEI NO MINIMO" |
| 3 | Selecionar **"QUERO GANHAR"** | **[P08-F01]** | Card selecionado com destaque visual |
| 4 | Verificar descricao | Card | "Lances agressivos automaticos ate atingir Valor Minimo (E)" |
| 5 | Clicar **"Simular Disputa"** | **[P08-F02]** ActionButton | Simulacao executada |
| 6 | Verificar cenarios | **[P08-F03]** Lista | 3 cenarios com margens calculadas |
| 7 | Verificar cenario 1 | | Ex: "Voce ganha no 3o lance (R$ 120,00) — Margem: 41%" |
| 8 | Verificar cenario 2 | | Ex: "Concorrente iguala no minimo — Reposiciona 2o lugar" |
| 9 | Verificar cenario 3 | | Ex: "Voce ganha no minimo (R$ 95,00) — Margem: 12%" |
| 10 | Alternar para **"NAO GANHEI NO MINIMO"** | **[P08-F01]** | Card alternativo selecionado |
| 11 | Clicar **"Simular"** novamente | **[P08-F02]** | Cenarios diferentes aparecem |
| 12 | Clicar **"Salvar Estrategia"** | **[P08-F04]** ActionButton | Salvo com sucesso |

### Resultado esperado
- 2 opcoes de estrategia com descricao visual clara
- Simulacao gera 3 cenarios com margens reais
- Cenarios mudam conforme estrategia selecionada
- Estrategia salva por edital no banco

---

## TC-P09: Consultar Historico de Precos (Camada F)

**Caso de uso:** UC-P09 — Consultar Historico de Precos (Camada F)
**RF relacionado:** RF-039-12
**Ator:** Analista Comercial

### Dados de teste
- Termo de busca: "reagente hematologia"

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Clicar na aba **"Historico"** | Aba | Conteudo da aba Historico aparece |
| 2 | Preencher termo de busca | **[P09-F01]** TextInput | Digitar: "reagente hematologia" |
| 3 | Clicar **"Filtrar"** | **[P09-F06]** ActionButton | Busca executada |
| 4 | Verificar grafico | **[P09-F08]** Chart SVG | Grafico de linha com area sombreada renderiza |
| 5 | Verificar eixos do grafico | **[P09-F08]** | Eixo X: Data / Eixo Y: Preco |
| 6 | Verificar tabela | **[P09-F09]** DataTable | Colunas: Data, Orgao, Produto, Valor, Vencedor, Nosso Preco, Resultado |
| 7 | Verificar badges de resultado | **[P09-F09]** | Icones: trofeu (vitoria) ou X (derrota) |
| 8 | Selecionar filtro orgao | **[P09-F02]** SelectInput | Selecionar um orgao especifico |
| 9 | Preencher data inicio | **[P09-F03]** DateInput | Ex: 01/01/2025 |
| 10 | Preencher data fim | **[P09-F04]** DateInput | Ex: 31/12/2025 |
| 11 | Clicar **"Filtrar"** novamente | **[P09-F06]** | Resultados filtrados |
| 12 | Verificar que resultados mudaram | Tabela e grafico | Menos registros, datas dentro do periodo |
| 13 | Clicar **"Exportar CSV"** | **[P09-F07]** ActionButton | Download de arquivo .csv inicia |
| 14 | Abrir CSV baixado | Arquivo | Dados da tabela presentes no CSV |

### Resultado esperado
- Busca retorna historico de precos do PNCP e base local
- Grafico SVG renderiza evolucao temporal corretamente
- Filtros por orgao, data e margem funcionam
- Tabela mostra resultado (vitoria/derrota) com icones
- CSV exportado contem dados corretos

---

## TC-P10: Gestao de Comodato

**Caso de uso:** UC-P10 — Gestao de Comodato
**RF relacionado:** RF-039-13
**Ator:** Analista Comercial

### Dados de teste
- Edital com modalidade comodato
- Equipamento: "Analisador XYZ-3000", valor R$ 250.000,00
- Prazo: 60 meses

### Passos

| # | Acao | Campo/Elemento | Valor/Verificacao |
|---|---|---|---|
| 1 | Verificar que secao/aba "Comodato" esta visivel | Aba ou secao | Visivel na PrecificacaoPage |
| 2 | Verificar badge | Badge informativo | "Processo manual — IA futura no roadmap" |
| 3 | Preencher equipamento | TextInput Equipamento | Digitar: "Analisador XYZ-3000" |
| 4 | Preencher valor do equipamento | NumberInput Valor | Digitar: 250000,00 |
| 5 | Preencher prazo contrato | NumberInput Prazo (meses) | Digitar: 60 |
| 6 | Verificar amortizacao calculada | Display Valor Mensal | Deve calcular: **R$ 4.166,67** (250000/60) |
| 7 | Preencher condicoes especiais | TextArea | Digitar: "Manutencao preventiva inclusa" |
| 8 | Clicar **"Salvar Comodato"** | ActionButton | Salvo com sucesso |
| 9 | **Teste com prazo diferente:** alterar prazo para 36 | NumberInput | |
| 10 | Verificar recalculo | Display Valor Mensal | R$ 6.944,44 (250000/36) |

### Resultado esperado
- Amortizacao calculada automaticamente (valor / prazo)
- Recalculo em tempo real ao mudar prazo
- Dados do comodato salvos
- Badge informativo sobre Fase 1 (manual)

### Verificacao matematica
```
Amortizacao 60 meses: 250.000 / 60 = R$ 4.166,67
Amortizacao 36 meses: 250.000 / 36 = R$ 6.944,44
```

---

---

# FLUXO COMPLETO END-TO-END

**Objetivo:** Validar o fluxo completo de precificacao, do lote ate a estrategia, percorrendo todos os 10 casos de teste em sequencia.

### Pre-condicoes
- Edital PE 2024/001 salvo com >=10 itens PNCP
- Portfolio com produtos de Hematologia cadastrados (NCM 3822)
- Backend e frontend rodando

### Sequencia

| Fase | Teste | Acao principal | Resultado chave |
|---|---|---|---|
| 1 | **TC-P01** | Organizar Lotes | Lotes criados e configurados |
| 2 | **TC-P02** | Selecao Portfolio | Produtos associados aos itens via IA |
| 3 | **TC-P03** | Volumetria | 101 kits calculados |
| 4 | **TC-P04** | Custos (Camada A) | R$ 85,00 + isencao ICMS detectada |
| 5 | **TC-P05** | Preco Base (Camada B) | R$ 150,00 via markup 76,47% |
| 6 | **TC-P06** | Referencia (Camada C) | R$ 145,00 do edital |
| 7 | **TC-P07** | Lances (Camadas D+E) | Inicial=R$145 / Minimo=R$95 |
| 8 | **TC-P08** | Estrategia | "Quero Ganhar" salvo com simulacao |
| 9 | **TC-P09** | Historico (Camada F) | Grafico + tabela renderizam |
| 10 | **TC-P10** | Comodato (se aplicavel) | Amortizacao R$ 4.166,67/mes |

### Verificacoes pos-fluxo

| # | Verificacao | Como testar | Resultado esperado |
|---|---|---|---|
| 1 | Persistencia das 6 camadas | Verificar banco: tabela `preco_camadas` | Todas as camadas A-F preenchidas para o item |
| 2 | Troca de aba | Ir para aba "Historico" e voltar para "Camadas" | Dados nao se perdem |
| 3 | Reload da pagina | Pressionar F5 | Dados carregam do banco corretamente |
| 4 | Console do navegador | Abrir DevTools > Console | Nenhum erro JavaScript |
| 5 | Log do backend | Verificar terminal do Flask | Nenhum erro 500 ou traceback |
| 6 | Trocar de edital | Selecionar outro edital no dropdown | Dados do novo edital carregam, anterior desaparece |
| 7 | Voltar ao edital anterior | Selecionar PE 2024/001 novamente | Dados salvos anteriormente reaparecem intactos |

---

# REGISTRO DE RESULTADOS

| Teste | Status | Data | Testador | Observacoes |
|---|---|---|---|---|
| TC-P01 Lotes | ☐ Passou / ☐ Falhou | | | |
| TC-P02 Portfolio | ☐ Passou / ☐ Falhou | | | |
| TC-P03 Volumetria | ☐ Passou / ☐ Falhou | | | |
| TC-P04 Custos (A) | ☐ Passou / ☐ Falhou | | | |
| TC-P05 Preco Base (B) | ☐ Passou / ☐ Falhou | | | |
| TC-P06 Referencia (C) | ☐ Passou / ☐ Falhou | | | |
| TC-P07 Lances (D+E) | ☐ Passou / ☐ Falhou | | | |
| TC-P08 Estrategia | ☐ Passou / ☐ Falhou | | | |
| TC-P09 Historico (F) | ☐ Passou / ☐ Falhou | | | |
| TC-P10 Comodato | ☐ Passou / ☐ Falhou | | | |
| End-to-End | ☐ Passou / ☐ Falhou | | | |
