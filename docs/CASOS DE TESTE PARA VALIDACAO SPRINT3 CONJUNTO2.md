# CASOS DE TESTE PARA VALIDACAO — SPRINT 3 — CONJUNTO 2

**Data:** 2026-04-21
**Empresa:** RP3X Comercio e Representacoes Ltda.
**Dados:** tutorialsprint3-2.md / dadosprecprop-2.md
**UCs:** P01-P12, R01-R07 (19 casos de uso)
**Credenciais:** valida2@valida.com.br / 123456

---

## Convencoes

- **ID:** CT-P{UC}-{numero} ou CT-R{UC}-{numero}
- **Tipo:** Positivo (fluxo principal), Negativo (erro esperado), Limite (caso de borda), Alternativo (FA)
- Pre-requisitos globais: Empresa RP3X (valida2@valida.com.br), produtos Kit Hemograma Sysmex XN (SKU SX-XN-HC-BR, NCM 3822.19.90) e Kit Glicose Wiener BioGlic-100 (SKU WL-BG100-AUTO-BR, NCM 3822.19.90), markup 35%, custos fixos R$ 42.000, frete R$ 180. Edital de "reagente hematologia" salvo com decisao GO e itens importados.

---

# FASE 1 — PRECIFICACAO

---

## UC-P01 — Organizar Edital por Lotes

### CT-P01-01 — Navegar ate pagina de Precificacao
- **Descricao:** Verificar acesso a pagina de Precificacao via menu lateral.
- **Pre-condicoes:** Usuario logado como valida2@valida.com.br, empresa RP3X ativa.
- **Acoes do ator e dados de entrada:**
  1. No menu lateral, clicar em "Precificacao".
- **Saida esperada:** Pagina de Precificacao exibida com seletor de edital e painel de 4 abas (Lotes, Custos e Precos, Lances, Historico).
- **Tipo:** Positivo

### CT-P01-02 — Selecionar edital de reagente hematologia
- **Descricao:** Selecionar edital e carregar lotes/itens.
- **Pre-condicoes:** CT-P01-01 concluido. Edital de "reagente hematologia" salvo na Sprint 2 com decisao GO.
- **Acoes do ator e dados de entrada:**
  1. No seletor de edital, selecionar edital de `reagente hematologia`.
- **Saida esperada:** Edital carregado. Aba "Lotes" exibida com os itens do edital.
- **Tipo:** Positivo

### CT-P01-03 — Verificar ou criar lotes (2 lotes esperados)
- **Descricao:** Verificar que 2 lotes sao criados/carregados com itens corretos.
- **Pre-condicoes:** CT-P01-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Lotes", verificar se os lotes existem. Se nao, clicar em "Criar Lotes".
- **Saida esperada:** Lote 1 — Hematologia (5 itens: Reagente hemograma cx 500 testes, Diluente isotonico gal 20L, Lisante leucocitos fr 500mL, Calibrador hematologico kit 3 niveis, Controle hematologico kit 2 niveis). Lote 2 — Bioquimica (2 itens: Glicose enzimatica GOD-PAP kit 100 det, Colesterol total enzimatico kit 100 det).
- **Tipo:** Positivo

### CT-P01-04 — Preencher parametros tecnicos do Lote 1
- **Descricao:** Configurar especialidade e parametros do Lote 1.
- **Pre-condicoes:** CT-P01-03 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar Lote 1 e preencher:
     - Especialidade: `Hematologia`
     - Volume Exigido: `25000`
     - Tipo de Amostra: `Sangue total EDTA`
     - Equipamento Exigido: `Sysmex XN-1000 ou equivalente`
     - Descricao: `Reagentes compativeis com analisador hematologico automatizado 5-diff. Cadeia fria 2-8C obrigatoria. Validade minima 12 meses na entrega.`
  2. Clicar em `Atualizar Lote`.
- **Saida esperada:** Toast de confirmacao. Parametros salvos e exibidos.
- **Tipo:** Positivo

### CT-P01-05 — Preencher parametros tecnicos do Lote 2
- **Descricao:** Configurar especialidade e parametros do Lote 2.
- **Pre-condicoes:** CT-P01-04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar Lote 2 e preencher:
     - Especialidade: `Bioquimica Clinica`
     - Volume Exigido: `18000`
     - Tipo de Amostra: `Soro, plasma`
     - Equipamento Exigido: (em branco — reagente universal)
     - Descricao: `Kits para automacao em analisadores abertos. Metodo enzimatico colorimetrico. Conservacao refrigerada.`
  2. Clicar em `Atualizar Lote`.
- **Saida esperada:** Toast de confirmacao. Parametros salvos.
- **Tipo:** Positivo

### CT-P01-06 — Verificar distribuicao de itens entre lotes
- **Descricao:** Confirmar que os 7 itens estao distribuidos corretamente.
- **Pre-condicoes:** CT-P01-05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar tabela de itens de cada lote.
- **Saida esperada:** Lote 1: item 1 (Reagente hemograma, 50 CX, R$ 1.850), item 2 (Diluente, 30 GL, R$ 420), item 3 (Lisante, 40 FR, R$ 380), item 4 (Calibrador, 10 KIT, R$ 2.200), item 5 (Controle, 20 KIT, R$ 1.100). Lote 2: item 6 (Glicose, 100 KIT, R$ 45), item 7 (Colesterol, 80 KIT, R$ 52).
- **Tipo:** Positivo

---

## UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)

### CT-P02-01 — Vinculo manual — Item 1 (Hemograma)
- **Descricao:** Vincular manualmente item 1 ao Kit Hemograma Sysmex XN.
- **Pre-condicoes:** UC-P01 concluido. Kit Hemograma Sysmex XN cadastrado no portfolio.
- **Acoes do ator e dados de entrada:**
  1. Localizar item 1 no Lote 1 (Reagente hemograma). Badge "nao vinculado".
  2. Clicar no botao "Vincular".
  3. No modal "Selecao de Portfolio", selecionar `Kit de Reagentes para Hemograma Completo Sysmex XN`.
- **Saida esperada:** Modal fecha. Badge do item 1 muda para "vinculado".
- **Tipo:** Positivo

### CT-P02-02 — Vinculo por IA — Item 6 (Glicose)
- **Descricao:** Vincular item 6 automaticamente por IA.
- **Pre-condicoes:** CT-P02-01 concluido. Kit Glicose Wiener cadastrado no portfolio.
- **Acoes do ator e dados de entrada:**
  1. Localizar item 6 no Lote 2 (Glicose enzimatica). Badge "nao vinculado".
  2. Clicar no botao "IA".
  3. Aguardar processamento.
- **Saida esperada:** Sistema vincula ao `Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao`. Score de match e justificativa exibidos.
- **Tipo:** Positivo

### CT-P02-03 — Buscar na Web — Item 2 (Diluente)
- **Descricao:** Cadastrar produto via busca na web e vincular.
- **Pre-condicoes:** CT-P02-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Localizar item 2 (Diluente isotonico). Clicar em "Buscar na Web".
  2. No modal, preencher:
     - Nome do Produto: `Diluente Isotonico Sysmex CellPack DCL`
     - Fabricante: `Sysmex`
  3. Clicar em "Buscar via IA".
- **Saida esperada:** Produto cadastrado no portfolio e vinculado ao item 2. Badge muda para "vinculado".
- **Tipo:** Alternativo

### CT-P02-04 — Consulta ANVISA — Item 4 (Calibrador)
- **Descricao:** Vincular item 4 via consulta ANVISA.
- **Pre-condicoes:** CT-P02-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Localizar item 4 (Calibrador hematologico). Clicar em "ANVISA".
  2. No modal, preencher Numero de Registro: `10386890001`.
  3. Selecionar calibrador adequado dos resultados.
- **Saida esperada:** Registros de reagentes Sysmex retornados. Calibrador vinculado ao item 4.
- **Tipo:** Alternativo

### CT-P02-05 — Ignorar e reativar — Item 3 (Lisante)
- **Descricao:** Testar ciclo ignorar/reativar.
- **Pre-condicoes:** CT-P02-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Localizar item 3 (Lisante). Clicar em "Ignorar".
  2. Verificar badge "ignorado".
  3. Clicar em "Reativar".
- **Saida esperada:** Badge muda para "ignorado" ao ignorar. Badge volta para "nao vinculado" ao reativar.
- **Tipo:** Alternativo

### CT-P02-06 — Trocar vinculo — Item 1
- **Descricao:** Testar troca de vinculo em item ja vinculado.
- **Pre-condicoes:** CT-P02-01 concluido. Item 1 ja vinculado.
- **Acoes do ator e dados de entrada:**
  1. Localizar item 1 (vinculado). Clicar em "Trocar" ou "Desvincular".
  2. No modal, selecionar o mesmo ou outro produto.
- **Saida esperada:** Vinculo atualizado. Modal funciona corretamente para troca.
- **Tipo:** Alternativo

---

## UC-P03 — Calculo Tecnico de Volumetria

### CT-P03-01 — Volumetria do Item 1 (Kit Hemograma, cx 500 testes)
- **Descricao:** Calcular volumetria com repeticoes para reagente hematologico.
- **Pre-condicoes:** UC-P02 concluido. Item 1 vinculado ao Kit Hemograma.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Custos e Precos", selecionar vinculo Item 1.
  2. Marcar "Preciso de Volumetria".
  3. Preencher:
     - Quantidade do Edital: `25000`
     - Rendimento por Embalagem: `500`
     - Rep. Amostras: `200`
     - Rep. Calibradores: `50`
     - Rep. Controles: `100`
  4. Clicar em "Calcular e Salvar".
- **Saida esperada:** Volume real ajustado = 25000 + 200 + 50 + 100 = `25.350 testes`. Quantidade de kits (ceil) = ceil(25350/500) = `51 caixas`.
- **Tipo:** Positivo

### CT-P03-02 — Volumetria do Item 6 (Kit Glicose, 100 det)
- **Descricao:** Calcular volumetria para kit bioquimico.
- **Pre-condicoes:** UC-P02 concluido. Item 6 vinculado ao Kit Glicose.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 6.
  2. Marcar "Preciso de Volumetria".
  3. Preencher:
     - Quantidade do Edital: `18000`
     - Rendimento por Embalagem: `100`
     - Rep. Amostras: `150`
     - Rep. Calibradores: `30`
     - Rep. Controles: `60`
  4. Clicar em "Calcular e Salvar".
- **Saida esperada:** Volume real ajustado = 18000 + 150 + 30 + 60 = `18.240 determinacoes`. Quantidade de kits (ceil) = ceil(18240/100) = `183 kits`.
- **Tipo:** Positivo

### CT-P03-03 — Sem volumetria — Item 4 (Calibrador)
- **Descricao:** Verificar cenario sem calculo de volumetria.
- **Pre-condicoes:** UC-P02 concluido. Item 4 vinculado.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 4.
  2. Marcar "Nao Preciso".
- **Saida esperada:** Sistema usa quantidade do edital diretamente = `10 kits`. Sem calculo de volumetria.
- **Tipo:** Alternativo

### CT-P03-04 — Verificar arredondamento ceil
- **Descricao:** Confirmar que o arredondamento e sempre para cima (ceil).
- **Pre-condicoes:** CT-P03-01 e CT-P03-02 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Verificar que 25350/500 = 50.7 -> ceil = 51.
  2. Verificar que 18240/100 = 182.4 -> ceil = 183.
- **Saida esperada:** Item 1 = 51 caixas (nao 50). Item 6 = 183 kits (nao 182).
- **Tipo:** Limite

---

## UC-P04 — Configurar Base de Custos (ERP + Tributario)

### CT-P04-01 — Custos do Item 1 (Kit Hemograma) com isencao NCM 3822
- **Descricao:** Preencher custos e verificar isencao por NCM 3822.
- **Pre-condicoes:** UC-P03 concluido. Produto com NCM `3822.19.90`.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 1.
  2. Preencher Custo Unitario: `R$ 850,00`.
  3. Verificar NCM (readonly) = `3822.19.90`.
  4. Verificar ICMS = `0` com hint "ISENTO -- NCM 3822".
  5. Verificar IPI = `0`.
  6. Verificar PIS+COFINS = `9,25`.
  7. Clicar em `Salvar Custos`.
- **Saida esperada:** Toast de confirmacao. Custo salvo. Hint "ISENTO -- NCM 3822" visivel ao lado do ICMS.
- **Tipo:** Positivo

### CT-P04-02 — Custos do Item 6 (Kit Glicose) com isencao
- **Descricao:** Preencher custos do kit glicose e verificar mesma isencao.
- **Pre-condicoes:** CT-P04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 6.
  2. Preencher Custo Unitario: `R$ 22,00`.
  3. Verificar NCM = `3822.19.90`, ICMS = 0, IPI = 0, PIS+COFINS = 9,25.
  4. Salvar custos.
- **Saida esperada:** Toast. Custo R$ 22,00 salvo. Mesma isencao NCM 3822.
- **Tipo:** Positivo

### CT-P04-03 — Custos do Item 2 (Diluente)
- **Descricao:** Preencher custos do diluente.
- **Pre-condicoes:** CT-P04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 2.
  2. Preencher Custo Unitario: `R$ 180,00`.
  3. Verificar NCM = `3822.90.90`, ICMS = 0 (isento), IPI = 0, PIS+COFINS = 9,25.
  4. Salvar custos.
- **Saida esperada:** Toast. Custo R$ 180,00 salvo.
- **Tipo:** Positivo

### CT-P04-04 — Custos do Item 4 (Calibrador)
- **Descricao:** Preencher custos do calibrador.
- **Pre-condicoes:** CT-P04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 4.
  2. Preencher Custo Unitario: `R$ 1.100,00`.
  3. Verificar NCM = `3822.19.90`, ICMS = 0, IPI = 0, PIS+COFINS = 9,25.
  4. Salvar custos.
- **Saida esperada:** Toast. Custo R$ 1.100,00 salvo.
- **Tipo:** Positivo

### CT-P04-05 — Verificar hint ISENTO em todos os itens NCM 3822
- **Descricao:** Confirmar que todos os itens com NCM 3822 exibem hint de isencao.
- **Pre-condicoes:** CT-P04-01 a CT-P04-04 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Para cada item, verificar presenca do hint "ISENTO -- NCM 3822" ao lado do ICMS.
- **Saida esperada:** Hint visivel em todos os 4 itens. NCM readonly em todos.
- **Tipo:** Positivo

---

## UC-P05 — Montar Preco Base (Camada B)

### CT-P05-01 — Preco Base Item 1 (Kit Hemograma) — Custo + Markup 35%
- **Descricao:** Calcular preco base com markup padrao da empresa.
- **Pre-condicoes:** UC-P04 concluido. Custo R$ 850,00. Markup padrao 35%.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 1.
  2. Selecionar modo `Custo + Markup`.
  3. Preencher Markup: `35`.
  4. Flag Reutilizar: `Nao`.
  5. Clicar em `Salvar Preco Base`.
- **Saida esperada:** Preco Base = R$ 850,00 x 1,35 = `R$ 1.147,50`.
- **Tipo:** Positivo

### CT-P05-02 — Preco Base Item 6 (Kit Glicose) — Modo Manual
- **Descricao:** Informar preco base manual com flag reutilizar.
- **Pre-condicoes:** UC-P04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 6.
  2. Selecionar modo `Manual`.
  3. Preencher Preco Base: `R$ 30,00`.
  4. Flag Reutilizar: `Sim`.
  5. Salvar.
- **Saida esperada:** R$ 30,00 exibido. Flag "Reutilizar" ativado e persistido.
- **Tipo:** Positivo

### CT-P05-03 — Preco Base Item 2 (Diluente) — Custo + Markup 39%
- **Descricao:** Calcular preco base com markup personalizado.
- **Pre-condicoes:** UC-P04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 2.
  2. Modo `Custo + Markup`, Markup: `39`, Reutilizar: `Nao`.
  3. Salvar.
- **Saida esperada:** Preco Base = R$ 180,00 x 1,39 = `R$ 250,20`.
- **Tipo:** Positivo

### CT-P05-04 — Preco Base Item 4 (Calibrador) — Modo Manual
- **Descricao:** Informar preco base manual para calibrador.
- **Pre-condicoes:** UC-P04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 4.
  2. Modo `Manual`, Preco Base: `R$ 1.500,00`, Reutilizar: `Sim`.
  3. Salvar.
- **Saida esperada:** R$ 1.500,00 salvo. Flag "Reutilizar" ativado.
- **Tipo:** Positivo

### CT-P05-05 — Modos mistos no mesmo edital
- **Descricao:** Verificar que modos Custo+Markup e Manual funcionam simultaneamente.
- **Pre-condicoes:** CT-P05-01 a CT-P05-04 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Verificar que Item 1 usa Custo+Markup e Item 6 usa Manual.
- **Saida esperada:** Ambos os modos coexistem no mesmo edital sem conflito.
- **Tipo:** Alternativo

---

## UC-P06 — Definir Valor de Referencia (Camada C)

### CT-P06-01 — Referencia Item 1 — Valor absoluto R$ 1.200
- **Descricao:** Definir valor de referencia absoluto.
- **Pre-condicoes:** UC-P05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 1.
  2. Preencher Valor Referencia: `R$ 1.200,00`. Deixar "% sobre Preco Base" em branco.
  3. Salvar Target.
- **Saida esperada:** Valor R$ 1.200,00 salvo como referencia absoluta.
- **Tipo:** Positivo

### CT-P06-02 — Referencia Item 6 — Modo percentual 107%
- **Descricao:** Calcular valor de referencia como percentual do preco base.
- **Pre-condicoes:** UC-P05 concluido. Preco Base Item 6 = R$ 30,00.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 6.
  2. Deixar Valor Referencia em branco.
  3. Preencher "% sobre Preco Base": `107`.
  4. Salvar Target.
- **Saida esperada:** Valor calculado = R$ 30,00 x 1,07 = `R$ 32,10`.
- **Tipo:** Alternativo

### CT-P06-03 — Referencia Item 2 — Valor absoluto R$ 280
- **Descricao:** Definir referencia do diluente.
- **Pre-condicoes:** UC-P05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 2.
  2. Preencher Valor Referencia: `R$ 280,00`.
  3. Salvar.
- **Saida esperada:** Valor R$ 280,00 salvo.
- **Tipo:** Positivo

### CT-P06-04 — Referencia Item 4 — Valor absoluto R$ 1.600
- **Descricao:** Definir referencia do calibrador.
- **Pre-condicoes:** UC-P05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 4.
  2. Preencher Valor Referencia: `R$ 1.600,00`.
  3. Salvar.
- **Saida esperada:** Valor R$ 1.600,00 salvo.
- **Tipo:** Positivo

---

## UC-P07 — Estruturar Lances (Camadas D e E)

### CT-P07-01 — Lances Item 1 (Hemograma) — Valor Absoluto + % Desconto
- **Descricao:** Configurar lances com modos mistos.
- **Pre-condicoes:** UC-P06 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 1.
  2. Modo Lance Inicial: `Valor Absoluto`, Valor: `R$ 1.150,00`.
  3. Modo Lance Minimo: `% Desconto Maximo`, Desconto: `18`.
  4. Salvar Lances.
- **Saida esperada:** Valor Minimo = R$ 1.150,00 x (1-0,18) = `R$ 943,00`. Margem no minimo = (R$ 943 - R$ 850) / R$ 850 = `10,9%`.
- **Tipo:** Positivo

### CT-P07-02 — Lances Item 6 (Glicose) — % da Referencia + Valor Absoluto
- **Descricao:** Configurar lance inicial percentual e minimo absoluto.
- **Pre-condicoes:** UC-P06 concluido. Referencia Item 6 = R$ 32,10.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 6.
  2. Modo Lance Inicial: `% da Referencia`, %: `95`.
  3. Modo Lance Minimo: `Valor Absoluto`, Valor: `R$ 25,00`.
  4. Salvar Lances.
- **Saida esperada:** Valor Inicial = R$ 32,10 x 0,95 = `R$ 30,50`. Margem no minimo = (R$ 25 - R$ 22) / R$ 22 = `13,6%`.
- **Tipo:** Positivo

### CT-P07-03 — Lances Item 2 (Diluente) — Valor Absoluto ambos
- **Descricao:** Configurar ambos os lances em valor absoluto.
- **Pre-condicoes:** UC-P06 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 2.
  2. Modo Lance Inicial: `Valor Absoluto`, Valor: `R$ 250,00`.
  3. Modo Lance Minimo: `Valor Absoluto`, Valor: `R$ 210,00`.
  4. Salvar Lances.
- **Saida esperada:** Margem no minimo = (R$ 210 - R$ 180) / R$ 180 = `16,7%`.
- **Tipo:** Positivo

### CT-P07-04 — Lances Item 4 (Calibrador) — Margem estreita 6,4%
- **Descricao:** Configurar lances com margem apertada e verificar alerta.
- **Pre-condicoes:** UC-P06 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 4.
  2. Modo Lance Inicial: `Valor Absoluto`, Valor: `R$ 1.500,00`.
  3. Modo Lance Minimo: `% Desconto Maximo`, Desconto: `22`.
  4. Salvar Lances.
- **Saida esperada:** Valor Minimo = R$ 1.500 x (1-0,22) = `R$ 1.170,00`. Margem = (R$ 1.170 - R$ 1.100) / R$ 1.100 = `6,4%`. Alerta visual de margem estreita.
- **Tipo:** Limite

### CT-P07-05 — Verificar resumo de margens de todos os itens
- **Descricao:** Conferir tabela consolidada de margens.
- **Pre-condicoes:** CT-P07-01 a CT-P07-04 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Verificar tabela de margens.
- **Saida esperada:** Kit Hemograma: custo R$ 850, minimo R$ 943, margem 10,9%. Kit Glicose: custo R$ 22, minimo R$ 25, margem 13,6%. Diluente: custo R$ 180, minimo R$ 210, margem 16,7%. Calibrador: custo R$ 1.100, minimo R$ 1.170, margem 6,4% (alerta).
- **Tipo:** Positivo

---

## UC-P08 — Definir Estrategia Competitiva

### CT-P08-01 — Selecionar perfil "QUERO GANHAR"
- **Descricao:** Configurar perfil agressivo com justificativa.
- **Pre-condicoes:** UC-P07 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar perfil `QUERO GANHAR`.
  2. Preencher justificativa: `Mercado de reagentes e competitivo e sensivel a preco. Estrategia agressiva para ganhar volume e fidelizar com contrato de 12 meses.`
- **Saida esperada:** Perfil selecionado com destaque visual. Justificativa salva.
- **Tipo:** Positivo

### CT-P08-02 — Executar Analise de Lances
- **Descricao:** Gerar cenarios de simulacao.
- **Pre-condicoes:** CT-P08-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Analise de Lances".
- **Saida esperada:** Pelo menos 3 cenarios gerados com valor e margem. Se algum cenario com margem negativa, alerta vermelho.
- **Tipo:** Positivo

### CT-P08-03 — Executar Analise por IA
- **Descricao:** Gerar analise detalhada por IA.
- **Pre-condicoes:** CT-P08-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Analise por IA".
- **Saida esperada:** Analise Markdown renderizada com recomendacoes para reagentes. Botao "Relatorio MD/PDF" disponivel.
- **Tipo:** Positivo

### CT-P08-04 — Executar Simulador de Disputa
- **Descricao:** Simular pregao eletronico.
- **Pre-condicoes:** CT-P08-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Simulador de Disputa".
- **Saida esperada:** Simulacao renderizada com rodadas de lance. Botao "Relatorio MD/PDF" disponivel.
- **Tipo:** Positivo

---

## UC-P09 — Consultar Historico de Precos (Camada F)

### CT-P09-01 — Buscar historico de reagente hemograma
- **Descricao:** Buscar precos historicos no PNCP para reagente hemograma.
- **Pre-condicoes:** UC-P08 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Historico", preencher Produto/Termo: `reagente hemograma completo`.
  2. Clicar em `Filtrar`.
- **Saida esperada:** Card Estatisticas com Preco Medio, Minimo (verde), Maximo (vermelho). Faixa de referencia: R$ 1.100 - R$ 1.400.
- **Tipo:** Positivo

### CT-P09-02 — Buscar historico de kit glicose
- **Descricao:** Buscar precos historicos para glicose enzimatica.
- **Pre-condicoes:** CT-P09-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Limpar busca anterior.
  2. Preencher Produto/Termo: `reagente glicose enzimatica GOD-PAP`.
  3. Clicar em `Filtrar`.
- **Saida esperada:** Resultados com faixa: Glicose R$ 28-42, Diluente R$ 220-350, Calibrador R$ 1.300-1.800.
- **Tipo:** Positivo

### CT-P09-03 — Exportar CSV
- **Descricao:** Exportar resultados em CSV.
- **Pre-condicoes:** CT-P09-02 concluido. Resultados na tela.
- **Acoes do ator e dados de entrada:**
  1. Clicar no botao "CSV".
- **Saida esperada:** Arquivo CSV baixado com dados da consulta.
- **Tipo:** Positivo

---

## UC-P10 — Gestao de Comodato

### CT-P10-01 — Cadastrar Comodato 1 (Analisador Hematologico)
- **Descricao:** Cadastrar equipamento hematologico em comodato.
- **Pre-condicoes:** UC-P09 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Historico", secao Comodato, preencher:
     - Equipamento: `Analisador Hematologico Sysmex XN-1000`
     - Valor: `R$ 380.000,00`
     - Prazo: `48 meses`
  2. Clicar em `Salvar Comodato`.
- **Saida esperada:** Toast de sucesso. Amortizacao mensal = R$ 380.000 / 48 = `R$ 7.916,67`. Nova linha na tabela de comodatos.
- **Tipo:** Positivo

### CT-P10-02 — Cadastrar Comodato 2 (Analisador Bioquimico)
- **Descricao:** Cadastrar segundo equipamento em comodato.
- **Pre-condicoes:** CT-P10-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Preencher:
     - Equipamento: `Analisador Bioquimico Mindray BS-240`
     - Valor: `R$ 145.000,00`
     - Prazo: `36 meses`
  2. Salvar.
- **Saida esperada:** Amortizacao mensal = R$ 145.000 / 36 = `R$ 4.027,78`. 2 linhas na tabela.
- **Tipo:** Positivo

### CT-P10-03 — Verificar impacto consolidado no preco
- **Descricao:** Verificar metricas de impacto total dos comodatos.
- **Pre-condicoes:** CT-P10-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar secao "Impacto do Comodato no Preco".
- **Saida esperada:** Total equipamentos = 2. Valor total = R$ 525.000,00. Amortizacao mensal total = R$ 11.944,45. Impacto por item (7 itens) = R$ 11.944,45 / 7 = `R$ 1.706,35/mes`.
- **Tipo:** Positivo

### CT-P10-04 — Segundo comodato nao sobrescreve o primeiro
- **Descricao:** Verificar que multiplos comodatos coexistem.
- **Pre-condicoes:** CT-P10-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar que ambos os comodatos aparecem na tabela.
- **Saida esperada:** Comodato 1 (Sysmex) e Comodato 2 (Mindray) em linhas separadas. Nenhum dado sobrescrito.
- **Tipo:** Negativo

---

## UC-P11 — Pipeline IA de Precificacao

### CT-P11-01 — Pipeline IA para Item 1 (Kit Hemograma)
- **Descricao:** Executar pipeline e verificar recomendacoes.
- **Pre-condicoes:** UC-P04 a P07 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Na aba "Custos e Precos", selecionar vinculo Item 1 — Kit Hemograma.
  2. Verificar carregamento automatico do pipeline ou clicar no botao dedicado.
- **Saida esperada:** Banner Resumo com N registros, N atas, Min, Media, Max. Recomendacoes A-E dentro das faixas: A (R$ 800-900), B (R$ 1.100-1.200), C (R$ 1.150-1.300), D (R$ 1.100-1.250), E (R$ 900-1.050).
- **Tipo:** Positivo

### CT-P11-02 — Usar sugestao IA (botao "Usar ->")
- **Descricao:** Aplicar sugestao IA no campo de custo.
- **Pre-condicoes:** CT-P11-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. No Card Custo (A), clicar em "Usar ->".
- **Saida esperada:** Valor sugerido aplicado no campo Custo Unitario. Pre-preenchimento confirmado.
- **Tipo:** Positivo

### CT-P11-03 — Pipeline IA para Item 6 (Kit Glicose)
- **Descricao:** Executar pipeline para reagente bioquimico.
- **Pre-condicoes:** CT-P11-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 6 — Kit Glicose.
  2. Verificar Banner Resumo.
- **Saida esperada:** Recomendacoes A-E: A (R$ 18-25), B (R$ 28-35), C (R$ 30-40), D (R$ 30-38), E (R$ 24-30).
- **Tipo:** Positivo

### CT-P11-04 — Regenerar analise
- **Descricao:** Forcar nova busca de historico.
- **Pre-condicoes:** CT-P11-03 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Regenerar".
- **Saida esperada:** Banner Resumo atualizado com novos dados.
- **Tipo:** Alternativo

### CT-P11-05 — Verificar Concorrentes e Atas
- **Descricao:** Expandir e verificar secoes de detalhes.
- **Pre-condicoes:** CT-P11-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Expandir "Concorrentes principais".
  2. Expandir "Atas consultadas".
- **Saida esperada:** Tabela de Concorrentes com Empresa, Vitorias, Taxa, Preco Medio. Lista de Atas com Titulo, Orgao, UF, link PNCP.
- **Tipo:** Positivo

---

## UC-P12 — Relatorio de Custos e Precos

### CT-P12-01 — Gerar relatorio para Item 1 (Kit Hemograma)
- **Descricao:** Gerar relatorio completo e verificar secoes.
- **Pre-condicoes:** UC-P01 a P11 concluidos.
- **Acoes do ator e dados de entrada:**
  1. Selecionar vinculo Item 1. Clicar em "Relatorio de Custos e Precos".
- **Saida esperada:** Nova aba com relatorio Markdown. Secoes: Identificacao, Conversao (25.350 testes, 51 caixas), Analise Mercado, Sugestoes A-E, Explicacao (markup 35%, isencao NCM 3822), Concorrentes, Vencedores, Justificativa IA, Valores Definidos.
- **Tipo:** Positivo

### CT-P12-02 — Baixar relatorio em MD e PDF
- **Descricao:** Verificar downloads em ambos os formatos.
- **Pre-condicoes:** CT-P12-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Baixar MD".
  2. Clicar em "Baixar PDF".
- **Saida esperada:** Dois downloads realizados. Arquivo .md e .pdf com conteudo do relatorio.
- **Tipo:** Positivo

---

# FASE 2 — PROPOSTA

---

## UC-R01 — Gerar Proposta Tecnica (Motor Automatico)

### CT-R01-01 — Gerar Proposta 1 (Kit Hemograma, Lote 1)
- **Descricao:** Gerar proposta para o primeiro lote.
- **Pre-condicoes:** FASE 1 concluida.
- **Acoes do ator e dados de entrada:**
  1. No menu lateral, clicar em "Proposta".
  2. No card "Gerar Nova Proposta", preencher:
     - Edital: `reagente hematologia`
     - Produto: `Kit de Reagentes para Hemograma Completo Sysmex XN`
     - Preco Unitario: `1.150,00`
     - Quantidade: `51`
     - Lote: `Lote 1 — Hematologia`
  3. Clicar em `Gerar Proposta Tecnica`.
- **Saida esperada:** Proposta gerada. Nova linha na tabela "Minhas Propostas" com status "Rascunho". Valor total = R$ 1.150,00 x 51 = `R$ 58.650,00`.
- **Tipo:** Positivo

### CT-R01-02 — Verificar sugestao de preco IA (Lightbulb)
- **Descricao:** Verificar funcionamento do icone de sugestao de preco.
- **Pre-condicoes:** Pagina de Proposta aberta.
- **Acoes do ator e dados de entrada:**
  1. Clicar no icone de lampada (lightbulb) ao lado do campo de preco.
- **Saida esperada:** Hint "Sugerido: R$ X" exibido abaixo do campo de preco.
- **Tipo:** Alternativo

### CT-R01-03 — Gerar Proposta 2 (Kit Glicose, Lote 2)
- **Descricao:** Gerar proposta para segundo lote do mesmo edital.
- **Pre-condicoes:** CT-R01-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. No card "Gerar Nova Proposta", preencher:
     - Edital: `reagente hematologia` (mesmo edital)
     - Produto: `Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao`
     - Preco Unitario: `30,00`
     - Quantidade: `183`
     - Lote: `Lote 2 — Bioquimica`
  2. Clicar em `Gerar Proposta Tecnica`.
- **Saida esperada:** Segunda proposta gerada. 2 linhas na tabela. Valor total = R$ 30,00 x 183 = `R$ 5.490,00`. Ambas com status "Rascunho".
- **Tipo:** Positivo

### CT-R01-04 — Filtrar propostas por status "Rascunho"
- **Descricao:** Verificar filtro de status na tabela.
- **Pre-condicoes:** CT-R01-03 concluido.
- **Acoes do ator e dados de entrada:**
  1. No filtro de Status, selecionar "Rascunho".
- **Saida esperada:** Ambas as propostas (Hemograma R$ 58.650 e Glicose R$ 5.490) visiveis.
- **Tipo:** Positivo

---

## UC-R02 — Upload de Proposta Externa

### CT-R02-01 — Upload de proposta externa PDF
- **Descricao:** Importar proposta elaborada externamente.
- **Pre-condicoes:** UC-R01 concluido. Arquivo `tests/fixtures/teste_upload.pdf` disponivel.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Upload Proposta Externa" ou similar.
  2. Preencher:
     - Edital: `reagente hematologia`
     - Produto: `Kit de Reagentes para Hemograma Completo Sysmex XN`
     - Arquivo: `tests/fixtures/teste_upload.pdf`
     - Preco Unitario: `1.180,00`
     - Quantidade: `50`
  3. Clicar em "Importar".
- **Saida esperada:** Toast de sucesso. 3 propostas na tabela (2 geradas + 1 upload). Preco R$ 1.180,00 (diferente do R$ 1.150 da Proposta 1).
- **Tipo:** Positivo

---

## UC-R03 — Personalizar Descricao Tecnica (A/B)

### CT-R03-01 — Verificar modo padrao (edital, readonly)
- **Descricao:** Verificar que o modo padrao exibe texto do edital.
- **Pre-condicoes:** UC-R01 concluido. Proposta 1 selecionada.
- **Acoes do ator e dados de entrada:**
  1. Na proposta selecionada, verificar toggle de descricao tecnica.
- **Saida esperada:** Modo "edital" ativo por padrao. Texto do edital em readonly.
- **Tipo:** Positivo

### CT-R03-02 — Alternar para personalizado e informar descricao IVD
- **Descricao:** Personalizar descricao tecnica com dados de reagentes IVD.
- **Pre-condicoes:** CT-R03-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar no Toggle para "personalizado".
  2. Preencher descricao: `Kit de Reagentes para Hemograma Completo, compativel com analisador hematologico automatizado Sysmex XN-1000/XN-2000. Inclui reagentes para contagem celular diferencial 5-populacoes (WBC, RBC, PLT, HGB, HCT), reticulocitos e fluidos de limpeza. Rendimento: 500 testes por caixa. Armazenamento: 2-8C. Registro ANVISA: 10386890001. Validade minima: 12 meses na entrega.`
- **Saida esperada:** Badge "Personalizado" amarelo. Campo editavel com texto informado.
- **Tipo:** Positivo

### CT-R03-03 — Preservacao do texto ao alternar toggle
- **Descricao:** Verificar que texto nao se perde ao alternar entre modos.
- **Pre-condicoes:** CT-R03-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar no Toggle para voltar a "edital".
  2. Clicar no Toggle novamente para "personalizado".
- **Saida esperada:** Texto personalizado preservado integralmente ao voltar para modo personalizado.
- **Tipo:** Alternativo

---

## UC-R04 — Auditoria ANVISA (Semaforo Regulatorio)

### CT-R04-01 — Verificar registros ANVISA dos produtos
- **Descricao:** Executar auditoria ANVISA para reagentes.
- **Pre-condicoes:** UC-R03 concluido. Proposta selecionada.
- **Acoes do ator e dados de entrada:**
  1. No card "Auditoria ANVISA", clicar em "Verificar Registros".
- **Saida esperada:** Semaforo exibido. Kit Hemograma (registro 10386890001): Verde (valido) ou Amarelo (proximo vencimento). Kit Glicose: Verde (valido).
- **Tipo:** Positivo

### CT-R04-02 — Verificar cenario de registro vencido (bloqueante)
- **Descricao:** Verificar alerta bloqueante para registro vencido.
- **Pre-condicoes:** CT-R04-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Se algum registro estiver vencido, verificar alerta.
- **Saida esperada:** Badge "Vencido" vermelho. Alerta: "BLOQUEANTE: Existem registros ANVISA vencidos." Proposta nao pode ser enviada.
- **Tipo:** Negativo

---

## UC-R05 — Auditoria Documental + Smart Split

### CT-R05-01 — Verificar checklist documental de reagentes IVD
- **Descricao:** Executar auditoria e verificar documentos especificos de IVD.
- **Pre-condicoes:** UC-R04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Verificar Documentos".
- **Saida esperada:** Documentos: AFE ANVISA (Presente, verde), Alvara Sanitario (Presente, verde), ISO 13485 (Presente, verde), Certidao Estadual (Presente, verde), Atestado Capacidade Tecnica (Ausente, vermelho), Certificado Boas Praticas Distribuicao (Ausente, vermelho). Indicador: "4 de 6 documentos presentes" (laranja).
- **Tipo:** Positivo

### CT-R05-02 — Verificar Smart Split sem alerta (arquivos < 25MB)
- **Descricao:** Confirmar que Smart Split nao alerta para arquivos pequenos.
- **Pre-condicoes:** CT-R05-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Verificar presenca de alerta Smart Split.
- **Saida esperada:** Nenhum alerta Smart Split exibido (todos os arquivos < 25MB).
- **Tipo:** Negativo

---

## UC-R06 — Exportar Dossie Completo

### CT-R06-01 — Exportar em cada formato (PDF, DOCX, ZIP, Email)
- **Descricao:** Testar os 4 formatos de exportacao.
- **Pre-condicoes:** UC-R05 concluido. Proposta 1 selecionada.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Baixar PDF" — download.
  2. Clicar em "Baixar DOCX" — download.
  3. Clicar em "Baixar Dossie ZIP" — download.
  4. Clicar em "Enviar por Email" — prompt preparado.
- **Saida esperada:** 4 acoes funcionais. PDF, DOCX, ZIP baixados. Email prepara prompt de envio.
- **Tipo:** Positivo

### CT-R06-02 — Verificar conteudo do dossie ZIP
- **Descricao:** Verificar que o ZIP contem todos os documentos.
- **Pre-condicoes:** CT-R06-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Abrir arquivo ZIP e verificar conteudo.
- **Saida esperada:** Proposta tecnica (PDF), Documentos da empresa (AFE, Alvara, ISO, Certidao), Planilha de precos presentes.
- **Tipo:** Positivo

---

## UC-R07 — Gerenciar Status e Submissao

### CT-R07-01 — Selecionar proposta e verificar dados
- **Descricao:** Verificar card de proposta selecionada.
- **Pre-condicoes:** UC-R01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na tabela "Minhas Propostas", selecionar Proposta 1 — Kit Hemograma.
- **Saida esperada:** Card com: Edital, orgao, produto. Preco R$ 1.150,00, Quantidade 51, Total R$ 58.650,00. Badge "Rascunho".
- **Tipo:** Positivo

### CT-R07-02 — Editar conteudo Markdown e salvar
- **Descricao:** Usar editor Markdown com toolbar e salvar conteudo.
- **Pre-condicoes:** CT-R07-01 concluido.
- **Acoes do ator e dados de entrada:**
  1. Na area do editor, usar toolbar (Bold, H1, List).
  2. Adicionar texto: `Condicoes de Armazenamento: Cadeia fria 2-8C durante transporte e armazenamento`.
  3. Verificar indicador "Alteracoes nao salvas" (laranja).
  4. Clicar em "Salvar Conteudo".
- **Saida esperada:** Indicador aparece ao editar. Desaparece ao salvar. Conteudo persistido.
- **Tipo:** Positivo

### CT-R07-03 — Fluxo de status: Rascunho -> Em Revisao -> Aprovada
- **Descricao:** Avancar proposta pelos tres primeiros status.
- **Pre-condicoes:** CT-R07-02 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Salvar Rascunho" — status Rascunho.
  2. Clicar em "Enviar para Revisao" — status Em Revisao.
  3. Clicar em "Aprovar" — status Aprovada.
- **Saida esperada:** Badge muda a cada acao: cinza (Rascunho) -> amarelo (Em Revisao) -> verde (Aprovada).
- **Tipo:** Positivo

### CT-R07-04 — Verificar checklist de submissao
- **Descricao:** Verificar checklist na SubmissaoPage.
- **Pre-condicoes:** CT-R07-03 concluido (proposta Aprovada).
- **Acoes do ator e dados de entrada:**
  1. No menu lateral, clicar em "Submissao".
  2. Selecionar Proposta 1 (Aprovada).
- **Saida esperada:** Checklist: Proposta tecnica (marcado), Preco definido (marcado), Documentos anexados (4/6, parcial), Revisao final (marcado).
- **Tipo:** Positivo

### CT-R07-05 — Anexar documento faltante
- **Descricao:** Anexar certidao faltante na SubmissaoPage.
- **Pre-condicoes:** CT-R07-04 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Anexar Documento".
  2. Preencher:
     - Tipo: `Certidao`
     - Arquivo: `tests/fixtures/teste_upload.pdf`
     - Observacao: `Atestado de Capacidade Tecnica para fornecimento de reagentes hematologicos`
  3. Clicar em "Enviar".
- **Saida esperada:** Toast de sucesso. Documento anexado.
- **Tipo:** Positivo

### CT-R07-06 — Marcar como Enviada
- **Descricao:** Finalizar submissao marcando como enviada.
- **Pre-condicoes:** CT-R07-05 concluido.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Marcar como Enviada".
- **Saida esperada:** Status muda para "Enviada".
- **Tipo:** Positivo

### CT-R07-07 — Abrir Portal PNCP
- **Descricao:** Verificar abertura do portal externo.
- **Pre-condicoes:** SubmissaoPage aberta.
- **Acoes do ator e dados de entrada:**
  1. Clicar em "Abrir Portal PNCP".
- **Saida esperada:** Portal PNCP abre em nova aba do navegador.
- **Tipo:** Positivo

### CT-R07-08 — Verificar que proposta enviada nao permite edicao
- **Descricao:** Confirmar que proposta com status "Enviada" fica readonly.
- **Pre-condicoes:** CT-R07-06 concluido.
- **Acoes do ator e dados de entrada:**
  1. Tentar editar conteudo da proposta enviada.
- **Saida esperada:** Editor Markdown em readonly. Botoes de acao desabilitados (exceto visualizacao).
- **Tipo:** Negativo

---

# RESUMO DE CASOS DE TESTE

| UC | Quantidade | Positivos | Negativos | Alternativos | Limite |
|---|---|---|---|---|---|
| UC-P01 | 6 | 6 | 0 | 0 | 0 |
| UC-P02 | 6 | 2 | 0 | 4 | 0 |
| UC-P03 | 4 | 2 | 0 | 1 | 1 |
| UC-P04 | 5 | 5 | 0 | 0 | 0 |
| UC-P05 | 5 | 4 | 0 | 1 | 0 |
| UC-P06 | 4 | 3 | 0 | 1 | 0 |
| UC-P07 | 5 | 3 | 0 | 0 | 1 |
| UC-P08 | 4 | 3 | 0 | 0 | 0 |
| UC-P09 | 3 | 3 | 0 | 0 | 0 |
| UC-P10 | 4 | 3 | 1 | 0 | 0 |
| UC-P11 | 5 | 4 | 0 | 1 | 0 |
| UC-P12 | 2 | 2 | 0 | 0 | 0 |
| UC-R01 | 4 | 3 | 0 | 1 | 0 |
| UC-R02 | 1 | 1 | 0 | 0 | 0 |
| UC-R03 | 3 | 2 | 0 | 1 | 0 |
| UC-R04 | 2 | 1 | 1 | 0 | 0 |
| UC-R05 | 2 | 1 | 1 | 0 | 0 |
| UC-R06 | 2 | 2 | 0 | 0 | 0 |
| UC-R07 | 8 | 5 | 1 | 0 | 0 |
| **TOTAL** | **69** | **55** | **4** | **10** | **2** |

---

*Documento gerado em 21/04/2026. Dados extraidos exclusivamente do tutorialsprint3-2.md (Conjunto 2 — RP3X).*
