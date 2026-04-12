# Conjunto de Dados 2 — Precificacao e Proposta
# Validacao Automatizada e pelo Dono do Produto

**Empresa:** RP3X Comercio e Representacoes Ltda. (RP3X Cientifica)
**Perfil:** Distribuidora de reagentes, kits diagnosticos, filtros de laboratorio e equipamentos de purificacao de agua, atuante em licitacoes publicas estaduais e municipais via PNCP. Especializada em insumos para laboratorios clinicos e hospitalares com logistica de cadeia fria.
**Uso:** Conjunto alternativo — dados distintos do Conjunto 1 para cobrir variacoes de fluxo, campos opcionais diferentes e cenarios de borda. Foco em precificacao de reagentes (baixo valor unitario, alto volume) vs equipamentos (alto valor unitario, baixo volume).

---

## Contexto de Acesso — Usuarios e Empresas

### Usuario de Validacao (Conjunto 2)

| Campo | Valor |
|---|---|
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa alvo | RP3X Comercio e Representacoes Ltda. |

### Fluxo de Login (Superusuario)

1. Acessar `http://localhost:5175`
2. Email: `valida2@valida.com.br` / Senha: `123456`
3. Tela de selecao de empresa aparece — selecionar RP3X Comercio e Representacoes Ltda.
4. Dashboard carrega com RP3X como empresa ativa

### Pre-requisitos: Dados das Sprints 1 e 2

Os dados de empresa, portfolio e parametrizacoes do `dadosempportpar-2.md` e os editais salvos do `dadoscapval-2.md` devem estar cadastrados antes de executar os testes da Sprint 3. Os produtos e editais relevantes sao:

| Produto | Fabricante | SKU | NCM | Area |
|---|---|---|---|---|
| Kit de Reagentes para Hemograma Completo Sysmex XN | Sysmex | SX-XN-HC-BR | 3822.19.90 | Diagnostico in Vitro e Laboratorio |
| Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao | Wiener Lab Group Argentina | WL-BG100-AUTO-BR | 3822.19.90 | Diagnostico in Vitro e Laboratorio |

| Edital salvo (Sprint 2) | Origem | Status esperado |
|---|---|---|
| Edital de "reagente hematologia" | UC-CV03 Cenario 1 | Salvo, GO |
| Editais de "kit diagnostico" | UC-CV03 Cenario 2 | Salvos, Em Avaliacao |
| Editais de "glicose enzimatica" | UC-CV03 Cenario 3 | Salvos |

### Parametros comerciais relevantes (Sprint 1)

| Parametro | Valor |
|---|---|
| Markup Padrao | 35% |
| Custos Fixos Mensais | R$ 42.000,00 |
| Frete Base | R$ 180,00 |
| Area de Atuacao | Diagnostico in Vitro e Laboratorio |
| Regiao | Todo o Brasil |

---

## FASE 1 — PRECIFICACAO

---

## UC-P01 — Organizar Edital por Lotes

### Selecao do edital

| Campo | Valor |
|---|---|
| Edital | Selecionar edital de "reagente hematologia" (salvo no UC-CV03) |
| Acao | Clicar "Criar Lotes" |

### Lotes esperados apos criacao

| Lote | Especialidade | Itens |
|---|---|---|
| Lote 1 | Hematologia | Itens 1, 2, 3, 4, 5 (reagentes e controles hematologicos) |
| Lote 2 | Bioquimica | Itens 6, 7 (reagentes bioquimicos) |

> **Nota:** Os lotes foram reorganizados no UC-CV09 (Sprint 2). Se o edital ja tem lotes, o sistema deve carrega-los. Caso contrario, "Criar Lotes" gera novos.

### Parametros tecnicos — Lote 1 (Hematologia)

| Campo | Valor |
|---|---|
| Especialidade | Hematologia |
| Volume Exigido (testes/unidades) | 25000 |
| Tipo de Amostra | Sangue total EDTA |
| Equipamento Exigido | Sysmex XN-1000 ou equivalente |
| Descricao / Observacoes Tecnicas | Reagentes compativeis com analisador hematologico automatizado 5-diff. Cadeia fria 2-8C obrigatoria. Validade minima 12 meses na entrega. |

### Parametros tecnicos — Lote 2 (Bioquimica)

| Campo | Valor |
|---|---|
| Especialidade | Bioquimica Clinica |
| Volume Exigido (testes/unidades) | 18000 |
| Tipo de Amostra | Soro, plasma |
| Equipamento Exigido | (deixar em branco — reagente universal) |
| Descricao / Observacoes Tecnicas | Kits para automacao em analisadores abertos. Metodo enzimatico colorimetrico. Conservacao refrigerada. |

### Itens do edital (referencia UC-CV09)

| # | Descricao | Qtd | Unid | Vlr Unit Est. | Lote |
|---|---|---|---|---|---|
| 1 | Reagente para hemograma completo — cx 500 testes | 50 | CX | R$ 1.850,00 | 1 |
| 2 | Reagente diluente isotonico — gal 20L | 30 | GL | R$ 420,00 | 1 |
| 3 | Reagente lisante para leucocitos — fr 500mL | 40 | FR | R$ 380,00 | 1 |
| 4 | Calibrador hematologico multiparametrico — kit 3 niveis | 10 | KIT | R$ 2.200,00 | 1 |
| 5 | Controle hematologico normal e patologico — kit 2 niveis | 20 | KIT | R$ 1.100,00 | 1 |
| 6 | Reagente para glicose enzimatica GOD-PAP — kit 100 det. | 100 | KIT | R$ 45,00 | 2 |
| 7 | Reagente para colesterol total enzimatico — kit 100 det. | 80 | KIT | R$ 52,00 | 2 |

---

## UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido)

### Vinculo manual — Item 1 (Hemograma)

| Acao | Descricao |
|---|---|
| Localizar item 1 no Lote 1 | Badge "nao vinculado" |
| Clicar "Vincular" | Abre modal de Selecao de Portfolio |
| Selecionar | Kit de Reagentes para Hemograma Completo Sysmex XN |
| Verificar | Badge muda para "vinculado" |

### Vinculo por IA — Item 6 (Glicose)

| Acao | Descricao |
|---|---|
| Localizar item 6 no Lote 2 | Badge "nao vinculado" |
| Clicar "IA" | Sistema vincula automaticamente |
| Verificar match | Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao |
| Verificar Resposta IA | Score de match e justificativa exibidos |

### Buscar na Web — Item 2 (Diluente)

| Acao | Descricao |
|---|---|
| Localizar item 2 no Lote 1 | Badge "nao vinculado" |
| Clicar "Buscar na Web" | Abre modal de busca web |
| Nome do Produto | Diluente Isotonico Sysmex CellPack DCL |
| Fabricante | Sysmex |
| Clicar "Buscar via IA" | Sistema cadastra produto e vincula |

### Consulta ANVISA — Item 4 (Calibrador)

| Acao | Descricao |
|---|---|
| Localizar item 4 no Lote 1 | Badge "nao vinculado" |
| Clicar "ANVISA" | Abre modal de consulta ANVISA |
| Numero de Registro | 10386890001 |
| Verificar | Registros de reagentes Sysmex retornados |

### Ignorar item — Item 3 (Lisante)

| Acao | Descricao |
|---|---|
| Localizar item 3 no Lote 1 | Clicar "Ignorar" |
| Verificar | Badge muda para "ignorado" |
| Reativar | Clicar "Reativar" |
| Verificar | Badge volta a "nao vinculado" |

### Trocar vinculo — Item 1

| Acao | Descricao |
|---|---|
| Localizar item 1 (ja vinculado) | Clicar "Trocar" |
| No modal | Selecionar outro produto ou o mesmo |
| Alternativamente | Clicar "Desvincular" e revincular |

> **Diferenca do Conjunto 1:** testa todos os modos de vinculo (manual, IA, Buscar na Web, ANVISA) e o ciclo ignorar/reativar. No Conjunto 1 (equipamentos), o vinculo e mais direto pois ha menos itens por lote.

---

## UC-P03 — Calculo Tecnico de Volumetria

### Volumetria — Item 1 (Kit Hemograma, cx 500 testes)

| Campo | Valor |
|---|---|
| Vinculo Item-Produto | Item 1 — Kit Hemograma Sysmex XN |
| Opcao | Preciso de Volumetria |
| Quantidade do Edital | 25000 |
| Rendimento por Embalagem | 500 |
| Rep. Amostras | 200 |
| Rep. Calibradores | 50 |
| Rep. Controles | 100 |

### Calculo esperado — Item 1

| Metrica | Valor |
|---|---|
| Volume real ajustado | 25000 + 200 + 50 + 100 = 25350 testes |
| Quantidade de kits (ceil) | ceil(25350 / 500) = 51 caixas |

### Volumetria — Item 6 (Kit Glicose, 100 det)

| Campo | Valor |
|---|---|
| Vinculo Item-Produto | Item 6 — Kit Glicose Wiener BioGlic-100 |
| Opcao | Preciso de Volumetria |
| Quantidade do Edital | 18000 |
| Rendimento por Embalagem | 100 |
| Rep. Amostras | 150 |
| Rep. Calibradores | 30 |
| Rep. Controles | 60 |

### Calculo esperado — Item 6

| Metrica | Valor |
|---|---|
| Volume real ajustado | 18000 + 150 + 30 + 60 = 18240 determinacoes |
| Quantidade de kits (ceil) | ceil(18240 / 100) = 183 kits |

### Sem volumetria — Item 4 (Calibrador)

| Campo | Valor |
|---|---|
| Vinculo Item-Produto | Item 4 — Calibrador hematologico |
| Opcao | Nao Preciso |

> **Diferenca do Conjunto 1:** calculo baseado em determinacoes por kit (reagente) vs unidades simples (equipamento). Testa o campo "Rendimento por Embalagem" com valores tipicos de IVD (100, 500 det/kit).

---

## UC-P04 — Configurar Base de Custos (ERP + Tributario)

### Custos — Item 1 (Kit Hemograma)

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | 850,00 |
| NCM | 3822.19.90 (readonly, importado do produto) |
| ICMS (%) | 0 (hint: "ISENTO — NCM 3822") |
| IPI (%) | 0 |
| PIS+COFINS (%) | 9,25 |

### Custos — Item 6 (Kit Glicose)

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | 22,00 |
| NCM | 3822.19.90 (readonly) |
| ICMS (%) | 0 (hint: "ISENTO — NCM 3822") |
| IPI (%) | 0 |
| PIS+COFINS (%) | 9,25 |

### Custos — Item 2 (Diluente)

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | 180,00 |
| NCM | 3822.90.90 (readonly) |
| ICMS (%) | 0 (hint: "ISENTO — NCM 3822") |
| IPI (%) | 0 |
| PIS+COFINS (%) | 9,25 |

### Custos — Item 4 (Calibrador)

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | 1.100,00 |
| NCM | 3822.19.90 (readonly) |
| ICMS (%) | 0 (isento) |
| IPI (%) | 0 |
| PIS+COFINS (%) | 9,25 |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Hint ICMS para NCM 3822 | "ISENTO — NCM 3822" visivel em todos os itens |
| Salvar Custos | Toast de sucesso por item |

> **Diferenca do Conjunto 1:** todos os itens tem NCM 3822.xx.xx com isencao de ICMS e IPI. No Conjunto 1 (equipamentos NCM 9018.xx.xx), ICMS e IPI sao aplicaveis. Testa o cenario de isencao tributaria total.

---

## UC-P05 — Montar Preco Base (Camada B)

### Preco Base — Item 1 (Kit Hemograma) — Modo Custo + Markup

| Campo | Valor |
|---|---|
| Modo | Custo + Markup |
| Markup (%) | 35 |
| Preco Base calculado | R$ 850,00 x 1,35 = R$ 1.147,50 |
| Reutilizar este preco | Nao |

### Preco Base — Item 6 (Kit Glicose) — Modo Manual

| Campo | Valor |
|---|---|
| Modo | Manual |
| Preco Base (R$) | 30,00 |
| Reutilizar este preco | Sim |

### Preco Base — Item 2 (Diluente) — Modo Custo + Markup

| Campo | Valor |
|---|---|
| Modo | Custo + Markup |
| Markup (%) | 39 |
| Preco Base calculado | R$ 180,00 x 1,39 = R$ 250,20 |
| Reutilizar este preco | Nao |

### Preco Base — Item 4 (Calibrador) — Modo Manual

| Campo | Valor |
|---|---|
| Modo | Manual |
| Preco Base (R$) | 1.500,00 |
| Reutilizar este preco | Sim |

> **Diferenca do Conjunto 1:** mistura os modos Custo+Markup e Manual no mesmo edital. Item 6 (glicose) usa modo Manual com flag "Reutilizar" ativado — testa persistencia do flag. No Conjunto 1, todos usam o mesmo modo.

---

## UC-P06 — Definir Valor de Referencia (Camada C)

### Referencia — Item 1 (Kit Hemograma)

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | 1.200,00 |
| OU % sobre Preco Base | (deixar em branco — usar valor absoluto) |

### Referencia — Item 6 (Kit Glicose)

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | (deixar em branco) |
| OU % sobre Preco Base | 107 |
| Valor calculado | R$ 30,00 x 1,07 = R$ 32,10 |

### Referencia — Item 2 (Diluente)

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | 280,00 |
| OU % sobre Preco Base | (deixar em branco) |

### Referencia — Item 4 (Calibrador)

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | 1.600,00 |
| OU % sobre Preco Base | (deixar em branco) |

> **Diferenca do Conjunto 1:** Item 6 usa % sobre Preco Base (107%) em vez de valor absoluto. Testa o modo percentual de definicao de referencia.

---

## UC-P07 — Estruturar Lances (Camadas D e E)

### Lances — Item 1 (Kit Hemograma)

| Campo | Valor |
|---|---|
| Modo Lance Inicial | Valor Absoluto |
| Valor Inicial (R$) | 1.150,00 |
| Modo Lance Minimo | % Desconto Maximo |
| Desconto Maximo (%) | 18 |
| Valor Minimo calculado | R$ 1.150,00 x (1 - 0,18) = R$ 943,00 |

### Lances — Item 6 (Kit Glicose)

| Campo | Valor |
|---|---|
| Modo Lance Inicial | % da Referencia |
| % da Referencia | 95 |
| Valor Inicial calculado | R$ 32,10 x 0,95 = R$ 30,50 |
| Modo Lance Minimo | Valor Absoluto |
| Valor Minimo (R$) | 25,00 |

### Lances — Item 2 (Diluente)

| Campo | Valor |
|---|---|
| Modo Lance Inicial | Valor Absoluto |
| Valor Inicial (R$) | 250,00 |
| Modo Lance Minimo | Valor Absoluto |
| Valor Minimo (R$) | 210,00 |

### Lances — Item 4 (Calibrador)

| Campo | Valor |
|---|---|
| Modo Lance Inicial | Valor Absoluto |
| Valor Inicial (R$) | 1.500,00 |
| Modo Lance Minimo | % Desconto Maximo |
| Desconto Maximo (%) | 22 |
| Valor Minimo calculado | R$ 1.500,00 x (1 - 0,22) = R$ 1.170,00 |

### Verificacao de margem

| Item | Custo | Lance Minimo | Margem no minimo |
|---|---|---|---|
| Kit Hemograma | R$ 850 | R$ 943 | 10,9% |
| Kit Glicose | R$ 22 | R$ 25 | 13,6% |
| Diluente | R$ 180 | R$ 210 | 16,7% |
| Calibrador | R$ 1.100 | R$ 1.170 | 6,4% |

> **Diferenca do Conjunto 1:** margens mais apertadas (6-17%) vs equipamentos (30-50%). O calibrador tem margem minima de apenas 6,4% — testa o cenario de margem estreita. Item 6 usa modo "% da Referencia" no lance inicial — testa o modo percentual.

---

## UC-P08 — Definir Estrategia Competitiva

### Perfil de estrategia

| Campo | Valor |
|---|---|
| Perfil | QUERO GANHAR |
| Justificativa | Mercado de reagentes e competitivo e sensivel a preco. Estrategia agressiva para ganhar volume e fidelizar com contrato de 12 meses. |

### Analise de Lances

| Acao | Descricao |
|---|---|
| Clicar "Analise de Lances" | Gerar cenarios de simulacao |
| Verificar cenarios | Pelo menos 3 cenarios com valor e margem |
| Verificar alerta | Se algum cenario tem margem negativa, alerta vermelho deve aparecer |

### Analise por IA

| Acao | Descricao |
|---|---|
| Clicar "Analise por IA" | Gerar explicacao detalhada |
| Verificar markdown | Analise renderizada com recomendacoes |
| Verificar "Relatorio MD/PDF" | Botao disponivel para download |

### Simulador de Disputa

| Acao | Descricao |
|---|---|
| Clicar "Simulador de Disputa" | Simular pregao eletronico |
| Verificar | Simulacao renderizada com rodadas de lance |
| Verificar "Relatorio MD/PDF" | Botao disponivel para download |

> **Diferenca do Conjunto 1:** perfil "QUERO GANHAR" (vs "NAO GANHEI NO MINIMO" no Conj. 1). Reagentes permitem estrategia agressiva pois o volume compensa a margem estreita. Testa a simulacao de disputa no contexto de margens apertadas.

---

## UC-P09 — Consultar Historico de Precos (Camada F)

### Busca 1 — Reagente hematologia

| Campo | Valor |
|---|---|
| Produto/Termo | reagente hemograma completo |
| Acao | Clicar "Filtrar" |

### Busca 2 — Kit glicose

| Campo | Valor |
|---|---|
| Produto/Termo | reagente glicose enzimatica GOD-PAP |
| Acao | Clicar "Filtrar" |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Card Estatisticas | Preco Medio, Minimo (verde), Maximo (vermelho) exibidos |
| Tabela Resultados | Linhas com Produto, Preco e Data |
| Exportar CSV | Clicar "CSV" — arquivo baixado |

### Dados de referencia para comparacao

| Produto | Preco Medio PNCP (estimado) | Faixa |
|---|---|---|
| Reagente hemograma cx 500 | R$ 1.100 – R$ 1.400 | Medio |
| Reagente glicose 100 det | R$ 28 – R$ 42 | Medio |
| Diluente 20L | R$ 220 – R$ 350 | Medio |
| Calibrador 3 niveis | R$ 1.300 – R$ 1.800 | Medio |

> **Diferenca do Conjunto 1:** busca por termos de reagentes (vs equipamentos). Os precos historicos de reagentes tem faixa mais estreita e maior volume de registros no PNCP.

---

## UC-P10 — Gestao de Comodato

### Cenario: Comodato de analisador vinculado a reagentes

Embora reagentes nao exijam comodato obrigatoriamente, muitos editais de hematologia exigem fornecimento de analisador em comodato junto com os reagentes. Testar este cenario opcional.

### Comodato 1 — Analisador Hematologico

| Campo | Valor |
|---|---|
| Equipamento | Analisador Hematologico Sysmex XN-1000 |
| Valor do Equipamento (R$) | 380.000,00 |
| Prazo (meses) | 48 |

### Calculo esperado

| Metrica | Valor |
|---|---|
| Amortizacao mensal | R$ 380.000 / 48 = R$ 7.916,67 |

### Comodato 2 — Analisador Bioquimico (opcional)

| Campo | Valor |
|---|---|
| Equipamento | Analisador Bioquimico Mindray BS-240 |
| Valor do Equipamento (R$) | 145.000,00 |
| Prazo (meses) | 36 |

### Calculo esperado

| Metrica | Valor |
|---|---|
| Amortizacao mensal | R$ 145.000 / 36 = R$ 4.027,78 |

### Impacto no preco

| Metrica | Valor |
|---|---|
| Total equipamentos | 2 |
| Valor total equipamentos | R$ 525.000,00 |
| Amortizacao mensal total | R$ 11.944,45 |
| Impacto por item do lote (7 itens) | R$ 11.944,45 / 7 = R$ 1.706,35/mes |

### Verificacoes

| Acao | Verificacao |
|---|---|
| Salvar Comodato 1 | Toast de sucesso, linha na tabela |
| Salvar Comodato 2 | Segunda linha na tabela |
| Secao Impacto | Metricas calculadas e exibidas |

> **Diferenca do Conjunto 1:** no Conjunto 1 (equipamentos), comodato nao se aplica pois o proprio produto e o equipamento. Aqui o comodato e do analisador vinculado aos reagentes — cenario tipico de editais de hematologia onde o hospital exige "reagentes + equipamento em comodato". Testa o impacto do comodato diluido em 7 itens de reagente.

---

## UC-P11 — Pipeline IA de Precificacao

### Item 1 — Kit Hemograma

| Acao | Descricao |
|---|---|
| Selecionar vinculo | Item 1 — Kit Hemograma Sysmex XN |
| Verificar loading | "Buscando historico de precos e atas no PNCP..." |
| Banner Resumo | N registros, N atas, Min, Media, Max, Ref. Edital |

### Recomendacoes IA esperadas — Item 1

| Camada | Descricao | Faixa esperada |
|---|---|---|
| Custo (A) | Custo sugerido pela IA | R$ 800 – R$ 900 |
| Preco Base (B) | Preco base sugerido | R$ 1.100 – R$ 1.200 |
| Referencia (C) | Target estrategico | R$ 1.150 – R$ 1.300 |
| Lance Inicial (D) | Lance de abertura | R$ 1.100 – R$ 1.250 |
| Lance Minimo (E) | Piso competitivo | R$ 900 – R$ 1.050 |

### Usar sugestao IA

| Acao | Descricao |
|---|---|
| Clicar "Usar →" no Card Custo (A) | Pre-preenche campo Custo Unitario |
| Verificar | Valor aplicado no card Base de Custos |

### Item 6 — Kit Glicose

| Acao | Descricao |
|---|---|
| Selecionar vinculo | Item 6 — Kit Glicose Wiener BioGlic-100 |
| Banner Resumo | Verificar dados (reagentes bioquimicos tem muito historico no PNCP) |

### Recomendacoes IA esperadas — Item 6

| Camada | Descricao | Faixa esperada |
|---|---|---|
| Custo (A) | Custo sugerido | R$ 18 – R$ 25 |
| Preco Base (B) | Preco base | R$ 28 – R$ 35 |
| Referencia (C) | Target | R$ 30 – R$ 40 |
| Lance Inicial (D) | Lance abertura | R$ 30 – R$ 38 |
| Lance Minimo (E) | Piso | R$ 24 – R$ 30 |

### Regenerar analise

| Acao | Descricao |
|---|---|
| Clicar "Regenerar" | Nova busca de historico e atas |
| Verificar | Banner atualizado com novos dados |

### Concorrentes e Atas

| Acao | Descricao |
|---|---|
| Expandir "Concorrentes principais" | Tabela com Empresa, Vitorias, Taxa, Preco Medio |
| Expandir "Atas consultadas" | Lista de atas com Titulo, Orgao, UF, link PNCP |

> **Diferenca do Conjunto 1:** reagentes tem mais historico no PNCP (mercado ativo, muitas licitacoes). A IA deve retornar mais registros e atas. Testa o pipeline com alto volume de dados historicos vs equipamentos (poucos registros).

---

## UC-P12 — Relatorio de Custos e Precos

### Gerar relatorio

| Acao | Descricao |
|---|---|
| Vinculo selecionado | Item 1 — Kit Hemograma Sysmex XN |
| Clicar | "Relatorio de Custos e Precos" |
| Verificar | Nova aba abre com relatorio Markdown |

### Secoes esperadas no relatorio

| Secao | Conteudo esperado |
|---|---|
| Identificacao | Edital, orgao, item 1, Kit Hemograma Sysmex XN |
| Conversao de Quantidade | 25350 testes, 51 caixas (volumetria) |
| Analise de Mercado IA | Historico de atas e contratos de reagentes |
| Sugestoes A-E | Valores por camada com justificativa |
| Explicacao dos Calculos | Markup 35%, isencao ICMS/IPI, PIS+COFINS 9,25% |
| Concorrentes | Labtest, Wama, Siemens, Beckman, Abbott |
| Vencedores Detalhados | Precos homologados em licitacoes anteriores |
| Justificativa IA | Texto analitico com recomendacao |
| Valores Definidos | Camadas A-E com valores finais |

### Download

| Acao | Descricao |
|---|---|
| Clicar "Baixar MD" | Download do arquivo .md |
| Clicar "Baixar PDF" | Download do arquivo .pdf |

> **Diferenca do Conjunto 1:** relatorio inclui secao de volumetria (conversao det/kit) e mencao a isencao tributaria NCM 3822 — secoes que nao aparecem em relatorios de equipamentos.

---

## FASE 2 — PROPOSTA

---

## UC-R01 — Gerar Proposta Tecnica (Motor Automatico)

### Proposta 1 — Kit Hemograma

| Campo | Valor |
|---|---|
| Edital | Edital de "reagente hematologia" |
| Produto | Kit de Reagentes para Hemograma Completo Sysmex XN |
| Preco Unitario | 1.150,00 |
| Quantidade | 51 |
| Lote | Lote 1 — Hematologia |
| Template | (selecionar template disponivel ou deixar padrao) |

### Sugestao de preco IA

| Acao | Descricao |
|---|---|
| Clicar icone Lightbulb | Sistema sugere preco competitivo |
| Verificar hint | "Sugerido: R$ X" exibido abaixo do campo |

### Gerar proposta

| Acao | Descricao |
|---|---|
| Clicar "Gerar Proposta Tecnica" | Motor IA gera proposta |
| Verificar tabela | Nova linha em "Minhas Propostas" com status "Rascunho" |
| Verificar valor total | R$ 1.150,00 x 51 = R$ 58.650,00 |

### Proposta 2 — Kit Glicose

| Campo | Valor |
|---|---|
| Edital | Edital de "reagente hematologia" (mesmo edital, lote diferente) |
| Produto | Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao |
| Preco Unitario | 30,00 |
| Quantidade | 183 |
| Lote | Lote 2 — Bioquimica |
| Template | (selecionar template diferente do anterior, se disponivel) |

### Verificacoes

| Acao | Verificacao |
|---|---|
| Tabela "Minhas Propostas" | 2 propostas com status "Rascunho" |
| Valor total Proposta 2 | R$ 30,00 x 183 = R$ 5.490,00 |
| Filtrar por status "Rascunho" | Ambas aparecem |

> **Diferenca do Conjunto 1:** duas propostas para o mesmo edital em lotes diferentes. Testa a geracao de multiplas propostas por edital e a selecao de lote. Valores baixos (R$ 30/kit) vs equipamentos (R$ 85.000/unidade).

---

## UC-R02 — Upload de Proposta Externa

### Upload de proposta elaborada externamente

| Campo | Valor |
|---|---|
| Edital | Edital de "reagente hematologia" |
| Produto | Kit de Reagentes para Hemograma Completo Sysmex XN |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Preco Unitario | 1.180,00 |
| Quantidade | 50 |

### Verificacoes

| Acao | Verificacao |
|---|---|
| Clicar "Importar" | Toast de sucesso |
| Tabela "Minhas Propostas" | Nova proposta com status "Rascunho" |
| Total | 3 propostas na tabela (2 geradas + 1 upload) |

> **Diferenca do Conjunto 1:** upload com preco ligeiramente diferente (R$ 1.180 vs R$ 1.150) para o mesmo produto — testa coexistencia de propostas com precos distintos.

---

## UC-R03 — Personalizar Descricao Tecnica (A/B)

### Proposta alvo

| Campo | Valor |
|---|---|
| Proposta | Proposta 1 — Kit Hemograma (gerada no UC-R01) |

### Alternar modo

| Acao | Descricao |
|---|---|
| Verificar modo padrao | Toggle em "edital" — texto do edital exibido (readonly) |
| Clicar Toggle | Alternar para "personalizado" |
| Verificar badge | "Personalizado" em amarelo |

### Descricao personalizada

| Campo | Valor |
|---|---|
| Descricao personalizada | Kit de Reagentes para Hemograma Completo, compativel com analisador hematologico automatizado Sysmex XN-1000/XN-2000. Inclui reagentes para contagem celular diferencial 5-populacoes (WBC, RBC, PLT, HGB, HCT), reticulocitos e fluidos de limpeza. Rendimento: 500 testes por caixa. Armazenamento: 2-8C. Registro ANVISA: 10386890001. Validade minima: 12 meses na entrega. |

### Voltar ao original

| Acao | Descricao |
|---|---|
| Clicar Toggle novamente | Volta para modo "edital" |
| Verificar | Texto original do edital restaurado |
| Alternar novamente | Descricao personalizada preservada |

> **Diferenca do Conjunto 1:** descricao tecnica de reagente e mais detalhada (rendimento, armazenamento, compatibilidade). Testa a preservacao do texto personalizado apos toggle A/B.

---

## UC-R04 — Auditoria ANVISA (Semaforo Regulatorio)

### Verificar registros

| Acao | Descricao |
|---|---|
| Proposta selecionada | Proposta 1 — Kit Hemograma |
| Clicar "Verificar Registros" | Sistema consulta ANVISA |

### Resultados esperados

| Produto | Registro | Validade | Status esperado |
|---|---|---|---|
| Kit Hemograma Sysmex XN | 10386890001 | (depende da consulta) | Valido (verde) ou Proximo Venc. (amarelo) |
| Kit Glicose Wiener BioGlic-100 | 10386890001 | (depende da consulta) | Valido (verde) |

### Cenario de teste — Registro vencido

Se algum registro estiver vencido:

| Verificacao | Resultado esperado |
|---|---|
| Badge | "Vencido" em vermelho |
| Alerta | "BLOQUEANTE: Existem registros ANVISA vencidos" |
| Impacto | Proposta nao pode ser enviada ate regularizacao |

> **Diferenca do Conjunto 1:** mesmo registro ANVISA (10386890001) para reagentes de fabricantes diferentes. Testa se a auditoria diferencia registros por produto quando o numero e compartilhado no lote. No Conjunto 1, cada equipamento tem registro unico.

---

## UC-R05 — Auditoria Documental + Smart Split

### Verificar documentos

| Acao | Descricao |
|---|---|
| Proposta selecionada | Proposta 1 — Kit Hemograma |
| Clicar "Verificar Documentos" | Sistema audita documentos |

### Documentos esperados

| Documento | Tamanho estimado | Status esperado |
|---|---|---|
| AFE ANVISA | < 1 MB | Presente (verde) |
| Alvara Sanitario | < 1 MB | Presente (verde) |
| ISO 13485 | < 1 MB | Presente (verde) |
| Certidao Estadual | < 1 MB | Presente (verde) |
| Atestado Capacidade Tecnica | — | Ausente (vermelho) |
| Certificado Boas Praticas Distribuicao | — | Ausente (vermelho) |

### Checklist

| Verificacao | Resultado esperado |
|---|---|
| Indicador | "4 de 6 documentos presentes" (laranja) |
| Alerta Smart Split | Nao deve aparecer (arquivos < 25MB) |

> **Diferenca do Conjunto 1:** mais documentos exigidos para reagentes (AFE, Boas Praticas de Distribuicao) vs equipamentos. Resultado parcial (4/6) testa o indicador em estado laranja em vez de verde (todos presentes).

---

## UC-R06 — Exportar Dossie Completo

### Exportar proposta — Kit Hemograma

| Acao | Descricao |
|---|---|
| Proposta selecionada | Proposta 1 — Kit Hemograma |

### Exportacoes

| Formato | Acao | Verificacao |
|---|---|---|
| PDF | Clicar "Baixar PDF" | Download do arquivo .pdf |
| DOCX | Clicar "Baixar DOCX" | Download do arquivo .docx |
| ZIP | Clicar "Baixar Dossie ZIP" | Download do pacote completo |
| Email | Clicar "Enviar por Email" | Prompt de envio preparado |

### Verificar conteudo do dossie ZIP

| Item | Presente |
|---|---|
| Proposta tecnica (PDF) | Sim |
| Documentos da empresa | Sim (AFE, Alvara, ISO, Certidao) |
| Planilha de precos | Sim |

> **Diferenca do Conjunto 1:** dossie de reagentes inclui documentos sanitarios adicionais (AFE, Boas Praticas). Template de proposta para consumiveis vs equipamentos.

---

## UC-R07 — Gerenciar Status e Submissao

### Parte A — PropostaPage (Gestao de Status)

#### Selecionar e editar proposta

| Acao | Descricao |
|---|---|
| Selecionar | Proposta 1 — Kit Hemograma na tabela "Minhas Propostas" |
| Verificar Card | Edital, orgao, produto, preco R$ 1.150,00, qtd 51, total R$ 58.650,00 |
| Verificar status | Badge "Rascunho" |

#### Editar conteudo Markdown

| Acao | Descricao |
|---|---|
| Toolbar | Usar Bold, H1, List para formatar |
| Editar | Adicionar secao "Condicoes de Armazenamento: Cadeia fria 2-8C durante transporte e armazenamento" |
| Indicador | "Alteracoes nao salvas" em laranja |
| Clicar "Salvar Conteudo" | Indicador desaparece |

#### Fluxo de status

| Passo | Acao | Status resultante |
|---|---|---|
| 1 | Clicar "Salvar Rascunho" | Rascunho |
| 2 | Clicar "Enviar para Revisao" | Em Revisao |
| 3 | Clicar "Aprovar" | Aprovada |

### Parte B — SubmissaoPage (Checklist e Envio)

#### Visualizar propostas prontas

| Acao | Descricao |
|---|---|
| Acessar SubmissaoPage | `/app/submissao` |
| Verificar tabela | Proposta 1 (Aprovada) visivel |
| Selecionar proposta | Card "Checklist de Submissao" aparece |

#### Checklist de submissao

| Item | Status esperado |
|---|---|
| Proposta tecnica gerada | Marcado |
| Preco definido | Marcado |
| Documentos anexados | 4/6 (parcial) |
| Revisao final | Marcado (se aprovada) |

#### Anexar documento faltante

| Campo | Valor |
|---|---|
| Tipo de Documento | Certidao |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Observacao | Atestado de Capacidade Tecnica para fornecimento de reagentes hematologicos |
| Clicar "Enviar" | Toast de sucesso |

#### Finalizar submissao

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Clicar "Marcar como Enviada" | Status muda para "Enviada" |
| 2 | Clicar "Aprovar" | Status muda para "Aprovada" |
| 3 | Clicar "Abrir Portal PNCP" | Portal externo abre em nova aba |

> **Diferenca do Conjunto 1:** checklist com documentos parciais (4/6) em vez de completos. Testa o fluxo de anexar documento faltante antes de enviar. Observacao no anexo menciona especificidade de reagentes.

---

## Dados Auxiliares — Fixtures e Arquivos

### Arquivos de teste

| Uso | Caminho | Alternativa |
|---|---|---|
| PDF generico (upload proposta) | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Documento para anexar | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |

### Resumo de precos por item

| Item | Custo (A) | Preco Base (B) | Referencia (C) | Lance Inicial (D) | Lance Minimo (E) | Margem min |
|---|---|---|---|---|---|---|
| Kit Hemograma (cx 500) | R$ 850 | R$ 1.147,50 | R$ 1.200 | R$ 1.150 | R$ 943 | 10,9% |
| Kit Glicose (100 det) | R$ 22 | R$ 30 | R$ 32,10 | R$ 30,50 | R$ 25 | 13,6% |
| Diluente (gal 20L) | R$ 180 | R$ 250,20 | R$ 280 | R$ 250 | R$ 210 | 16,7% |
| Calibrador (kit 3 niveis) | R$ 1.100 | R$ 1.500 | R$ 1.600 | R$ 1.500 | R$ 1.170 | 6,4% |

---

## Cenarios de Borda Cobertos por Este Conjunto

| Cenario | UC | Detalhe |
|---|---|---|
| Reagente (baixo valor, alto volume) | P01-P12 | Precificacao de consumiveis vs equipamentos do Conj. 1 |
| Volumetria por determinacoes/kit | P03 | Calculo ceil(25350/500) = 51 caixas; ceil(18240/100) = 183 kits |
| Isencao ICMS e IPI (NCM 3822) | P04 | Todos os itens isentos — hint "ISENTO — NCM 3822" |
| Modos mistos de Preco Base | P05 | Custo+Markup e Manual no mesmo edital |
| Flag "Reutilizar preco" ativado | P05 | Testa persistencia do flag em itens diferentes |
| Referencia por % sobre Preco Base | P06 | Item 6 usa 107% em vez de valor absoluto |
| Lance inicial por % da Referencia | P07 | Item 6 usa modo percentual |
| Margem minima estreita (6,4%) | P07 | Calibrador com margem apertada — alerta esperado |
| Perfil "QUERO GANHAR" | P08 | Estrategia agressiva vs "NAO GANHEI" do Conj. 1 |
| Comodato de analisador com reagentes | P10 | Equipamento em comodato vinculado a consumiveis |
| 2 comodatos no mesmo edital | P10 | Impacto diluido em 7 itens |
| Alto volume historico PNCP | P11 | Reagentes tem mais registros que equipamentos |
| Relatorio com volumetria e isencao | P12 | Secoes especificas de IVD no relatorio |
| 2 propostas no mesmo edital | R01 | Lotes diferentes, valores diferentes |
| Preco baixo (R$ 30/kit) | R01 | Valor unitario minimo vs equipamento (R$ 85k) |
| Sugestao de preco IA (Lightbulb) | R01 | Testa o icone de sugestao |
| Upload com preco distinto | R02 | R$ 1.180 vs R$ 1.150 para mesmo produto |
| Descricao personalizada com specs IVD | R03 | Rendimento, cadeia fria, ANVISA no texto |
| Registro ANVISA compartilhado | R04 | Mesmo numero para produtos diferentes |
| Checklist parcial (4/6) | R05/R07 | Documentos faltantes para reagentes |
| Documento sanitario especifico | R07 | Anexar atestado para reagentes hematologicos |
| Cadeia fria no conteudo Markdown | R07 | Edicao de condicoes de armazenamento |

---

## Notas para o Dono do Produto

1. **Fluxo completo sugerido para inspecao manual:** P01 → P02 (todos os modos de vinculo) → P03 (volumetria com 2 itens + 1 sem) → P04 (verificar isencao ICMS) → P05 (modos mistos) → P06 (valor absoluto + percentual) → P07 (verificar margens estreitas) → P08 (QUERO GANHAR + simulacoes) → P09 (historico) → P10 (comodato opcional) → P11 (pipeline IA) → P12 (relatorio) → R01 (2 propostas) → R02 (upload) → R03 (descricao A/B) → R04 (ANVISA) → R05 (documental parcial) → R06 (exportar) → R07 (fluxo de status completo + submissao).

2. **Margens apertadas:** as margens de reagentes (6-17%) sao propositalmente mais estreitas que as de equipamentos (30-50% no Conj. 1). O calibrador com margem de 6,4% pode gerar alertas de margem negativa em cenarios de simulacao — isso e esperado e desejado para testar os indicadores visuais.

3. **Isencao tributaria NCM 3822:** todos os itens deste conjunto tem NCM da posicao 3822 (reagentes de diagnostico), que sao isentos de ICMS e IPI para licitacoes publicas. O sistema deve exibir o hint "ISENTO — NCM 3822" automaticamente. Confirmar que a isencao e aplicada corretamente no calculo.

4. **Comodato opcional:** no mercado de reagentes, o comodato de analisadores e muito comum mas nem sempre obrigatorio. O UC-P10 deste conjunto testa o cenario onde reagentes sao vendidos com equipamento em comodato. Se o edital nao exigir comodato, os dados do UC-P10 podem ser usados como teste funcional isolado.

5. **Volumetria por determinacoes:** o calculo de volumetria para reagentes usa "determinacoes por kit" como rendimento (100, 500 det/kit), diferente de equipamentos onde a quantidade e unitaria. Verificar que o campo "Rendimento por Embalagem" aceita valores tipicos de IVD.

6. **Cadeia fria:** reagentes hematologicos e bioquimicos exigem armazenamento e transporte entre 2-8C. Esse requisito deve aparecer nas observacoes tecnicas dos lotes e na descricao personalizada da proposta.

7. **Registro ANVISA 10386890001:** esse registro e usado como referencia para os reagentes. Na auditoria ANVISA (UC-R04), verificar se o sistema diferencia os produtos vinculados ao mesmo registro.

8. **Propostas multiplas por edital:** este conjunto gera 3 propostas para o mesmo edital (2 geradas + 1 upload), em lotes e precos diferentes. Verificar que a tabela "Minhas Propostas" exibe todas corretamente e que os filtros funcionam.

9. **Empresa real:** RP3X Comercio e Representacoes Ltda. — CNPJ 68.218.593/0001-09 — ATIVA na Receita Federal desde 04/08/1992 — Ribeirao Preto/SP.
