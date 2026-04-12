# Tutorial de Validacao Manual — Sprint 3 — Conjunto 2
# Empresa: RP3X Comercio e Representacoes Ltda.

**Data:** 08/04/2026
**Dados:** dadosprecprop-2.md
**Referencia:** CASOS DE USO PRECIFICACAO E PROPOSTA V2.md
**UCs:** P01-P12, R01-R07 (19 casos de uso)
**Publico:** Dono do Produto / Validador de Negocio (sem conhecimento tecnico necessario)

---

> **Como usar este tutorial**
>
> Siga cada passo na ordem indicada. Os dados a inserir estao destacados em `codigo`. As verificacoes ao final de cada UC dizem exatamente o que deve estar na tela para confirmar que o sistema funcionou corretamente. Quando algo nao esta como esperado, a secao "Sinais de problema" orienta o que reportar.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| Usuario (Conjunto 2) | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa alvo | RP3X Comercio e Representacoes Ltda. |

### Pre-requisito — Dados dos Sprints 1 e 2

Antes de iniciar a Sprint 3, os dados das Sprints 1 e 2 devem estar cadastrados:

- **Sprint 1:** Empresa RP3X criada, portfolio de produtos (Kit Hemograma Sysmex XN, Kit Glicose Wiener BioGlic-100), parametrizacao (Markup 35%, Custos Fixos R$ 42.000,00, Frete Base R$ 180,00).
- **Sprint 2:** Editais salvos — edital de "reagente hematologia" (UC-CV03 Cenario 1, status GO), editais de "kit diagnostico" (UC-CV03 Cenario 2), editais de "glicose enzimatica" (UC-CV03 Cenario 3).

### Fluxo de login
1. Acessar `http://pasteurjr.servehttp.com:5179`
2. Email: `valida2@valida.com.br` / Senha: `123456`
3. Tela de selecao de empresa — clicar "RP3X Comercio e Representacoes Ltda."
4. Dashboard carrega com RP3X como empresa ativa

### Produtos de referencia

| Produto | Fabricante | SKU | NCM |
|---|---|---|---|
| Kit de Reagentes para Hemograma Completo Sysmex XN | Sysmex | SX-XN-HC-BR | 3822.19.90 |
| Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao | Wiener Lab Group Argentina | WL-BG100-AUTO-BR | 3822.19.90 |

### Parametros comerciais (Sprint 1)

| Parametro | Valor |
|---|---|
| Markup Padrao | 35% |
| Custos Fixos Mensais | R$ 42.000,00 |
| Frete Base | R$ 180,00 |
| Area de Atuacao | Diagnostico in Vitro e Laboratorio |
| Regiao | Todo o Brasil |

---

## Indice

### FASE 1 — PRECIFICACAO
- [UC-P01 — Organizar Edital por Lotes](#uc-p01--organizar-edital-por-lotes)
- [UC-P02 — Selecao Inteligente de Portfolio](#uc-p02--selecao-inteligente-de-portfolio-agente-assistido)
- [UC-P03 — Calculo Tecnico de Volumetria](#uc-p03--calculo-tecnico-de-volumetria)
- [UC-P04 — Configurar Base de Custos](#uc-p04--configurar-base-de-custos-erp--tributario)
- [UC-P05 — Montar Preco Base](#uc-p05--montar-preco-base-camada-b)
- [UC-P06 — Definir Valor de Referencia](#uc-p06--definir-valor-de-referencia-camada-c)
- [UC-P07 — Estruturar Lances](#uc-p07--estruturar-lances-camadas-d-e-e)
- [UC-P08 — Definir Estrategia Competitiva](#uc-p08--definir-estrategia-competitiva)
- [UC-P09 — Consultar Historico de Precos](#uc-p09--consultar-historico-de-precos-camada-f)
- [UC-P10 — Gestao de Comodato](#uc-p10--gestao-de-comodato)
- [UC-P11 — Pipeline IA de Precificacao](#uc-p11--pipeline-ia-de-precificacao)
- [UC-P12 — Relatorio de Custos e Precos](#uc-p12--relatorio-de-custos-e-precos)

### FASE 2 — PROPOSTA
- [UC-R01 — Gerar Proposta Tecnica](#uc-r01--gerar-proposta-tecnica-motor-automatico)
- [UC-R02 — Upload de Proposta Externa](#uc-r02--upload-de-proposta-externa)
- [UC-R03 — Personalizar Descricao Tecnica](#uc-r03--personalizar-descricao-tecnica-ab)
- [UC-R04 — Auditoria ANVISA](#uc-r04--auditoria-anvisa-semaforo-regulatorio)
- [UC-R05 — Auditoria Documental + Smart Split](#uc-r05--auditoria-documental--smart-split)
- [UC-R06 — Exportar Dossie Completo](#uc-r06--exportar-dossie-completo)
- [UC-R07 — Gerenciar Status e Submissao](#uc-r07--gerenciar-status-e-submissao)

- [Resumo de Verificacoes por UC](#resumo-de-verificacoes-por-uc)
- [O que reportar se algo falhar](#o-que-reportar-se-algo-falhar)

---

# FASE 1 — PRECIFICACAO

---

## [UC-P01] Organizar Edital por Lotes

> **O que este caso de uso faz:** Antes de precificar, e preciso organizar os itens do edital em lotes logicos. O sistema carrega os itens do edital salvo na Sprint 2 e os agrupa em lotes por especialidade (Hematologia, Bioquimica). Se os lotes ja foram criados no UC-CV09 (Sprint 2), o sistema os carrega automaticamente. Caso contrario, voce pode criar novos lotes com um clique. Pense nisso como separar os itens de uma lista de compras por corredor do supermercado — cada lote agrupa itens que serao precificados e propostos juntos.

**Onde:** Menu lateral -> Precificacao
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- Certifique-se de estar logado com `valida2@valida.com.br` e com a empresa RP3X ativa.
- O edital de "reagente hematologia" deve estar salvo (Sprint 2, UC-CV03) com status GO.
- Se os lotes foram criados no UC-CV09 da Sprint 2, eles devem aparecer automaticamente.

---

### Passo 1 — Navegar ate a pagina de Precificacao

**O que fazer:** No menu lateral a esquerda, localize e clique na opcao "Precificacao". Isso vai abrir a tela de precificacao com um seletor de edital no topo.

**O que voce vai ver na tela:** Uma pagina com um seletor de edital (dropdown ou lista) e, abaixo, um painel com 4 abas: Lotes, Custos e Precos, Lances, Historico.

---

### Passo 2 — Selecionar o edital de "reagente hematologia"

**O que fazer:** No seletor de edital no topo da pagina, selecione o edital de "reagente hematologia" que foi salvo no UC-CV03 da Sprint 2.

**O que voce vai ver na tela:** O seletor de edital com uma lista dos editais salvos. O edital de "reagente hematologia" deve estar listado.

**O que acontece depois:** O edital e carregado e a aba "Lotes" e exibida com os itens do edital.

---

### Passo 3 — Verificar ou criar lotes

**O que fazer:** Na aba "Lotes", verifique se os lotes ja existem (criados no UC-CV09). Se a tela estiver vazia, clique em "Criar Lotes".

**O que voce vai ver na tela:** Os lotes esperados apos criacao ou carregamento:

| Lote | Especialidade | Itens |
|---|---|---|
| Lote 1 | Hematologia | Itens 1, 2, 3, 4, 5 (reagentes e controles hematologicos) |
| Lote 2 | Bioquimica | Itens 6, 7 (reagentes bioquimicos) |

### Passo 4 — Verificar parametros tecnicos do Lote 1

**O que fazer:** Selecione o Lote 1 e verifique os parametros tecnicos. Se nao estiverem preenchidos, preencha conforme abaixo:

| Campo | Valor |
|---|---|
| Especialidade | `Hematologia` |
| Volume Exigido (testes/unidades) | `25000` |
| Tipo de Amostra | `Sangue total EDTA` |
| Equipamento Exigido | `Sysmex XN-1000 ou equivalente` |
| Descricao / Observacoes Tecnicas | `Reagentes compativeis com analisador hematologico automatizado 5-diff. Cadeia fria 2-8C obrigatoria. Validade minima 12 meses na entrega.` |

---

### Passo 5 — Verificar parametros tecnicos do Lote 2

**O que fazer:** Selecione o Lote 2 e verifique os parametros tecnicos:

| Campo | Valor |
|---|---|
| Especialidade | `Bioquimica Clinica` |
| Volume Exigido (testes/unidades) | `18000` |
| Tipo de Amostra | `Soro, plasma` |
| Equipamento Exigido | (deixar em branco — reagente universal) |
| Descricao / Observacoes Tecnicas | `Kits para automacao em analisadores abertos. Metodo enzimatico colorimetrico. Conservacao refrigerada.` |

---

### Passo 6 — Verificar itens do edital

**O que fazer:** Confira se os itens do edital estao listados corretamente:

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

### Resultado Final

**O que o validador deve conferir:**
- 2 lotes criados ou carregados: Hematologia (5 itens) e Bioquimica (2 itens)
- Parametros tecnicos preenchidos para ambos os lotes
- 7 itens distribuidos corretamente entre os lotes

**Sinais de problema:**
- Lotes nao aparecem e o botao "Criar Lotes" gera erro
- Itens nao correspondem ao edital selecionado
- Parametros tecnicos nao podem ser preenchidos ou salvos

---

## [UC-P02] Selecao Inteligente de Portfolio (Agente Assistido)

> **O que este caso de uso faz:** Cada item do edital precisa ser vinculado a um produto do portfolio da empresa. O sistema oferece varios modos de vinculo: manual (voce escolhe), IA (o sistema sugere automaticamente), Buscar na Web (cadastra um produto novo a partir de busca web), e ANVISA (busca por registro sanitario). Tambem e possivel "ignorar" um item que a empresa nao vai ofertar. Pense nisso como associar cada produto da sua prateleira ao item correspondente na lista de compras do cliente.

**Onde:** Menu lateral -> Precificacao -> aba Lotes
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de comecar

- O UC-P01 deve estar concluido — 2 lotes com 7 itens carregados.
- Os produtos Kit Hemograma Sysmex XN e Kit Glicose Wiener BioGlic-100 devem estar cadastrados no portfolio (Sprint 1).

---

### Passo 1 — Vinculo manual — Item 1 (Hemograma)

**O que fazer:** Localize o item 1 no Lote 1 (Reagente para hemograma completo). O item deve ter um badge "nao vinculado". Clique no botao "Vincular" ao lado do item.

**O que voce vai ver na tela:** Um modal de "Selecao de Portfolio" abre com a lista de produtos cadastrados.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Selecionar produto | `Kit de Reagentes para Hemograma Completo Sysmex XN` |

**O que acontece depois:** O modal fecha e o badge do item 1 muda de "nao vinculado" para "vinculado".

---

### Passo 2 — Vinculo por IA — Item 6 (Glicose)

**O que fazer:** Localize o item 6 no Lote 2 (Reagente para glicose enzimatica GOD-PAP). O item deve ter um badge "nao vinculado". Clique no botao "IA" ao lado do item.

**O que voce vai ver na tela:** O sistema processa e vincula automaticamente o produto mais compativel.

**O que acontece depois:** O sistema vincula o item 6 ao produto `Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao`. Um score de match e uma justificativa sao exibidos.

---

### Passo 3 — Buscar na Web — Item 2 (Diluente)

**O que fazer:** Localize o item 2 no Lote 1 (Reagente diluente isotonico). Clique no botao "Buscar na Web".

**O que voce vai ver na tela:** Um modal de busca web abre com campos para Nome do Produto e Fabricante.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Nome do Produto | `Diluente Isotonico Sysmex CellPack DCL` |
| Fabricante | `Sysmex` |

**O que fazer em seguida:** Clique em "Buscar via IA". O sistema cadastra o produto e vincula ao item 2.

**O que acontece depois:** O item 2 recebe o badge "vinculado" e o produto Diluente Isotonico Sysmex CellPack DCL e cadastrado no portfolio.

---

### Passo 4 — Consulta ANVISA — Item 4 (Calibrador)

**O que fazer:** Localize o item 4 no Lote 1 (Calibrador hematologico multiparametrico). Clique no botao "ANVISA".

**O que voce vai ver na tela:** Um modal de consulta ANVISA com campo para numero de registro.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Numero de Registro | `10386890001` |

**O que acontece depois:** Registros de reagentes Sysmex sao retornados. Selecione o calibrador adequado para vincular ao item 4.

---

### Passo 5 — Ignorar item — Item 3 (Lisante)

**O que fazer:** Localize o item 3 no Lote 1 (Reagente lisante para leucocitos). Clique no botao "Ignorar".

**O que voce vai ver na tela:** O badge do item muda para "ignorado".

**O que fazer em seguida:** Clique em "Reativar" para reverter. O badge volta a "nao vinculado". Isso confirma que o ciclo ignorar/reativar funciona.

---

### Passo 6 — Trocar vinculo — Item 1

**O que fazer:** Localize o item 1 (ja vinculado ao Kit Hemograma). Clique em "Trocar" (ou "Desvincular").

**O que voce vai ver na tela:** O modal de selecao abre novamente. Selecione o mesmo produto ou outro para confirmar que a troca funciona.

**O que acontece depois:** O vinculo e atualizado.

---

### Resultado Final

**O que o validador deve conferir:**
- Item 1: vinculado manualmente ao Kit Hemograma Sysmex XN
- Item 2: vinculado via Buscar na Web ao Diluente Isotonico Sysmex CellPack DCL
- Item 4: vinculado via ANVISA (registro 10386890001)
- Item 6: vinculado via IA ao Kit Glicose Wiener BioGlic-100 Automacao (score de match exibido)
- Item 3: ciclo ignorar/reativar testado com sucesso
- Item 1: troca de vinculo testada com sucesso

**Sinais de problema:**
- Badges nao mudam apos vinculacao
- Modal de selecao nao carrega produtos do portfolio
- Busca na Web nao cadastra o produto
- Consulta ANVISA nao retorna resultados para registro 10386890001
- IA nao sugere vinculo para item 6

---

## [UC-P03] Calculo Tecnico de Volumetria

> **O que este caso de uso faz:** Em editais de reagentes, a quantidade solicitada e em testes ou determinacoes, nao em caixas ou kits. A volumetria converte a demanda do edital para a quantidade real de embalagens que a empresa precisa fornecer, considerando repeticoes de amostras, calibradores e controles. Por exemplo: se o edital pede 25.000 testes de hemograma e cada caixa faz 500 testes, voce precisa de 51 caixas (ja contando as repeticoes). Pense nisso como calcular quantas caixas de leite comprar sabendo que vai usar 3 litros por dia durante 30 dias.

**Onde:** Menu lateral -> Precificacao -> aba Custos e Precos
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- O UC-P02 deve estar concluido — itens 1 e 6 vinculados a produtos do portfolio.
- Navegue para a aba "Custos e Precos" na pagina de Precificacao.

---

### Passo 1 — Volumetria do Item 1 (Kit Hemograma, cx 500 testes)

**O que fazer:** Selecione o vinculo Item 1 — Kit Hemograma Sysmex XN. Marque a opcao "Preciso de Volumetria" e preencha os campos:

| Campo | Valor |
|---|---|
| Quantidade do Edital | `25000` |
| Rendimento por Embalagem | `500` |
| Rep. Amostras | `200` |
| Rep. Calibradores | `50` |
| Rep. Controles | `100` |

**O que voce vai ver na tela:** O sistema calcula automaticamente:

| Metrica | Valor |
|---|---|
| Volume real ajustado | 25000 + 200 + 50 + 100 = **25.350 testes** |
| Quantidade de kits (ceil) | ceil(25350 / 500) = **51 caixas** |

---

### Passo 2 — Volumetria do Item 6 (Kit Glicose, 100 det)

**O que fazer:** Selecione o vinculo Item 6 — Kit Glicose Wiener BioGlic-100. Marque "Preciso de Volumetria" e preencha:

| Campo | Valor |
|---|---|
| Quantidade do Edital | `18000` |
| Rendimento por Embalagem | `100` |
| Rep. Amostras | `150` |
| Rep. Calibradores | `30` |
| Rep. Controles | `60` |

**O que voce vai ver na tela:** O sistema calcula:

| Metrica | Valor |
|---|---|
| Volume real ajustado | 18000 + 150 + 30 + 60 = **18.240 determinacoes** |
| Quantidade de kits (ceil) | ceil(18240 / 100) = **183 kits** |

---

### Passo 3 — Sem volumetria — Item 4 (Calibrador)

**O que fazer:** Selecione o vinculo Item 4 — Calibrador hematologico. Marque a opcao "Nao Preciso".

**O que voce vai ver na tela:** O sistema usa a quantidade do edital diretamente (10 kits), sem calculo de volumetria.

---

### Resultado Final

**O que o validador deve conferir:**
- Item 1: Volume ajustado = 25.350, Quantidade = 51 caixas
- Item 6: Volume ajustado = 18.240, Quantidade = 183 kits
- Item 4: Sem volumetria, quantidade original do edital (10 kits)
- Os calculos usam ceil (arredondamento para cima)

**Sinais de problema:**
- Calculo nao considera as repeticoes (amostras, calibradores, controles)
- Arredondamento para baixo em vez de para cima (ceil)
- Campos de repeticao nao aceitam valores numericos
- Opcao "Preciso de Volumetria" / "Nao Preciso" nao funciona

---

## [UC-P04] Configurar Base de Custos (ERP + Tributario)

> **O que este caso de uso faz:** Aqui voce informa quanto cada produto custa para a empresa (custo de aquisicao) e quais impostos incidem. O sistema importa automaticamente o NCM do produto e sugere as aliquotas tributarias. Para reagentes com NCM 3822.xx.xx, ICMS e IPI sao ISENTOS — o sistema exibe a dica "ISENTO -- NCM 3822". Apenas PIS+COFINS (9,25%) incide. Pense nisso como montar a planilha de custos do seu produto: quanto voce paga ao fornecedor mais quanto paga de imposto.

**Onde:** Menu lateral -> Precificacao -> aba Custos e Precos
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- O UC-P03 deve estar concluido — volumetrias calculadas.
- Continue na aba "Custos e Precos".

---

### Passo 1 — Custos do Item 1 (Kit Hemograma)

**O que fazer:** Selecione o vinculo Item 1 — Kit Hemograma. Preencha os custos:

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | `850,00` |
| NCM | `3822.19.90` (readonly, importado do produto) |
| ICMS (%) | `0` (hint: "ISENTO -- NCM 3822") |
| IPI (%) | `0` |
| PIS+COFINS (%) | `9,25` |

**O que voce vai ver na tela:** O campo NCM ja esta preenchido e nao e editavel. Ao lado do ICMS, a dica "ISENTO -- NCM 3822" deve aparecer.

---

### Passo 2 — Custos do Item 6 (Kit Glicose)

**O que fazer:** Selecione o vinculo Item 6 — Kit Glicose. Preencha:

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | `22,00` |
| NCM | `3822.19.90` (readonly) |
| ICMS (%) | `0` (hint: "ISENTO -- NCM 3822") |
| IPI (%) | `0` |
| PIS+COFINS (%) | `9,25` |

---

### Passo 3 — Custos do Item 2 (Diluente)

**O que fazer:** Selecione o vinculo Item 2 — Diluente. Preencha:

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | `180,00` |
| NCM | `3822.90.90` (readonly) |
| ICMS (%) | `0` (hint: "ISENTO -- NCM 3822") |
| IPI (%) | `0` |
| PIS+COFINS (%) | `9,25` |

---

### Passo 4 — Custos do Item 4 (Calibrador)

**O que fazer:** Selecione o vinculo Item 4 — Calibrador. Preencha:

| Campo | Valor |
|---|---|
| Custo Unitario (R$) | `1.100,00` |
| NCM | `3822.19.90` (readonly) |
| ICMS (%) | `0` (isento) |
| IPI (%) | `0` |
| PIS+COFINS (%) | `9,25` |

---

### Resultado Final

**O que o validador deve conferir:**
- Hint "ISENTO -- NCM 3822" visivel em todos os itens ao lado do campo ICMS
- NCM readonly (importado do produto) em todos os itens
- Toast de sucesso ao salvar custos de cada item
- Custos salvos: Kit Hemograma R$ 850, Kit Glicose R$ 22, Diluente R$ 180, Calibrador R$ 1.100

**Sinais de problema:**
- Hint de isencao ICMS nao aparece para NCM 3822
- NCM editavel (deveria ser readonly)
- Toast de erro ao salvar custos
- Campos tributarios nao aceitam valor 0

---

## [UC-P05] Montar Preco Base (Camada B)

> **O que este caso de uso faz:** O preco base e quanto voce quer cobrar pelo produto antes de considerar concorrencia e estrategia. Existem dois modos: "Custo + Markup" (o sistema calcula automaticamente aplicando a margem sobre o custo) e "Manual" (voce digita o valor desejado). O flag "Reutilizar este preco" guarda o valor para uso futuro em outros editais. Pense nisso como definir o preco de tabela do produto — o preco antes de qualquer negociacao.

**Onde:** Menu lateral -> Precificacao -> aba Custos e Precos
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- O UC-P04 deve estar concluido — custos preenchidos para todos os itens.
- Continue na aba "Custos e Precos".

---

### Passo 1 — Preco Base do Item 1 (Kit Hemograma) — Modo Custo + Markup

**O que fazer:** Selecione o vinculo Item 1. Configure o preco base:

| Campo | Valor |
|---|---|
| Modo | `Custo + Markup` |
| Markup (%) | `35` |
| Reutilizar este preco | `Nao` |

**O que voce vai ver na tela:** O sistema calcula automaticamente:

| Calculo | Valor |
|---|---|
| Preco Base | R$ 850,00 x 1,35 = **R$ 1.147,50** |

---

### Passo 2 — Preco Base do Item 6 (Kit Glicose) — Modo Manual

**O que fazer:** Selecione o vinculo Item 6. Configure:

| Campo | Valor |
|---|---|
| Modo | `Manual` |
| Preco Base (R$) | `30,00` |
| Reutilizar este preco | `Sim` |

**O que voce vai ver na tela:** O valor R$ 30,00 e exibido como preco base. O flag "Reutilizar" fica ativado.

---

### Passo 3 — Preco Base do Item 2 (Diluente) — Modo Custo + Markup

**O que fazer:** Selecione o vinculo Item 2. Configure:

| Campo | Valor |
|---|---|
| Modo | `Custo + Markup` |
| Markup (%) | `39` |
| Reutilizar este preco | `Nao` |

**O que voce vai ver na tela:** O sistema calcula:

| Calculo | Valor |
|---|---|
| Preco Base | R$ 180,00 x 1,39 = **R$ 250,20** |

---

### Passo 4 — Preco Base do Item 4 (Calibrador) — Modo Manual

**O que fazer:** Selecione o vinculo Item 4. Configure:

| Campo | Valor |
|---|---|
| Modo | `Manual` |
| Preco Base (R$) | `1.500,00` |
| Reutilizar este preco | `Sim` |

---

### Resultado Final

**O que o validador deve conferir:**
- Item 1: Custo+Markup 35% -> R$ 1.147,50 (calculado automaticamente)
- Item 6: Manual -> R$ 30,00 com flag "Reutilizar" ativado
- Item 2: Custo+Markup 39% -> R$ 250,20 (calculado automaticamente)
- Item 4: Manual -> R$ 1.500,00 com flag "Reutilizar" ativado
- Modos mistos (Custo+Markup e Manual) funcionam no mesmo edital

**Sinais de problema:**
- Calculo do markup esta errado (ex: R$ 850 x 1,35 nao da R$ 1.147,50)
- Flag "Reutilizar" nao persiste apos salvar
- Nao e possivel alternar entre modos Custo+Markup e Manual
- Valores manuais nao sao aceitos

---

## [UC-P06] Definir Valor de Referencia (Camada C)

> **O que este caso de uso faz:** O valor de referencia e o "alvo" — quanto voce idealmente gostaria de receber pelo produto, levando em conta o mercado e os concorrentes. Pode ser definido como um valor absoluto em reais ou como uma porcentagem sobre o preco base. Por exemplo, 107% do preco base significa que voce quer 7% a mais que o preco base. Pense nisso como o preco alvo da negociacao — acima do custo, abaixo do limite maximo.

**Onde:** Menu lateral -> Precificacao -> aba Custos e Precos
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- O UC-P05 deve estar concluido — precos base definidos para todos os itens.

---

### Passo 1 — Referencia do Item 1 (Kit Hemograma) — Valor absoluto

**O que fazer:** Selecione o vinculo Item 1. Preencha:

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | `1.200,00` |
| % sobre Preco Base | (deixar em branco — usar valor absoluto) |

---

### Passo 2 — Referencia do Item 6 (Kit Glicose) — Percentual

**O que fazer:** Selecione o vinculo Item 6. Preencha:

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | (deixar em branco) |
| % sobre Preco Base | `107` |

**O que voce vai ver na tela:** O sistema calcula:

| Calculo | Valor |
|---|---|
| Valor calculado | R$ 30,00 x 1,07 = **R$ 32,10** |

---

### Passo 3 — Referencia do Item 2 (Diluente) — Valor absoluto

**O que fazer:** Selecione o vinculo Item 2. Preencha:

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | `280,00` |
| % sobre Preco Base | (deixar em branco) |

---

### Passo 4 — Referencia do Item 4 (Calibrador) — Valor absoluto

**O que fazer:** Selecione o vinculo Item 4. Preencha:

| Campo | Valor |
|---|---|
| Valor Referencia (R$) | `1.600,00` |
| % sobre Preco Base | (deixar em branco) |

---

### Resultado Final

**O que o validador deve conferir:**
- Item 1: Referencia R$ 1.200,00 (valor absoluto)
- Item 6: Referencia R$ 32,10 (107% de R$ 30,00 — modo percentual)
- Item 2: Referencia R$ 280,00 (valor absoluto)
- Item 4: Referencia R$ 1.600,00 (valor absoluto)
- Modo percentual (Item 6) calcula corretamente o valor

**Sinais de problema:**
- O campo "% sobre Preco Base" nao calcula o valor automaticamente
- Nao e possivel usar os dois modos (absoluto e percentual) no mesmo edital
- Valores de referencia nao sao salvos

---

## [UC-P07] Estruturar Lances (Camadas D e E)

> **O que este caso de uso faz:** Agora voce define os lances para o pregao eletronico — o lance inicial (com quanto vai abrir a disputa) e o lance minimo (o piso, abaixo do qual nao vale a pena participar). O lance inicial pode ser um valor absoluto ou uma porcentagem da referencia. O lance minimo pode ser um valor absoluto ou um percentual de desconto maximo sobre o lance inicial. O sistema calcula a margem de lucro em cada cenario. Pense nisso como definir o preco de entrada e o preco minimo em um leilao reverso.

**Onde:** Menu lateral -> Precificacao -> aba Lances
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- O UC-P06 deve estar concluido — valores de referencia definidos.
- Navegue para a aba "Lances" na pagina de Precificacao.

---

### Passo 1 — Lances do Item 1 (Kit Hemograma)

**O que fazer:** Selecione o vinculo Item 1. Configure os lances:

| Campo | Valor |
|---|---|
| Modo Lance Inicial | `Valor Absoluto` |
| Valor Inicial (R$) | `1.150,00` |
| Modo Lance Minimo | `% Desconto Maximo` |
| Desconto Maximo (%) | `18` |

**O que voce vai ver na tela:** O sistema calcula:

| Calculo | Valor |
|---|---|
| Valor Minimo | R$ 1.150,00 x (1 - 0,18) = **R$ 943,00** |
| Margem no minimo | (R$ 943 - R$ 850) / R$ 850 = **10,9%** |

---

### Passo 2 — Lances do Item 6 (Kit Glicose)

**O que fazer:** Selecione o vinculo Item 6. Configure:

| Campo | Valor |
|---|---|
| Modo Lance Inicial | `% da Referencia` |
| % da Referencia | `95` |
| Modo Lance Minimo | `Valor Absoluto` |
| Valor Minimo (R$) | `25,00` |

**O que voce vai ver na tela:** O sistema calcula:

| Calculo | Valor |
|---|---|
| Valor Inicial | R$ 32,10 x 0,95 = **R$ 30,50** |
| Margem no minimo | (R$ 25 - R$ 22) / R$ 22 = **13,6%** |

---

### Passo 3 — Lances do Item 2 (Diluente)

**O que fazer:** Selecione o vinculo Item 2. Configure:

| Campo | Valor |
|---|---|
| Modo Lance Inicial | `Valor Absoluto` |
| Valor Inicial (R$) | `250,00` |
| Modo Lance Minimo | `Valor Absoluto` |
| Valor Minimo (R$) | `210,00` |

**O que voce vai ver na tela:** Margem no minimo: (R$ 210 - R$ 180) / R$ 180 = **16,7%**

---

### Passo 4 — Lances do Item 4 (Calibrador)

**O que fazer:** Selecione o vinculo Item 4. Configure:

| Campo | Valor |
|---|---|
| Modo Lance Inicial | `Valor Absoluto` |
| Valor Inicial (R$) | `1.500,00` |
| Modo Lance Minimo | `% Desconto Maximo` |
| Desconto Maximo (%) | `22` |

**O que voce vai ver na tela:** O sistema calcula:

| Calculo | Valor |
|---|---|
| Valor Minimo | R$ 1.500,00 x (1 - 0,22) = **R$ 1.170,00** |
| Margem no minimo | (R$ 1.170 - R$ 1.100) / R$ 1.100 = **6,4%** |

---

### Passo 5 — Verificar resumo de margens

**O que fazer:** Confira a tabela de margens de todos os itens:

| Item | Custo | Lance Minimo | Margem no minimo |
|---|---|---|---|
| Kit Hemograma | R$ 850 | R$ 943 | 10,9% |
| Kit Glicose | R$ 22 | R$ 25 | 13,6% |
| Diluente | R$ 180 | R$ 210 | 16,7% |
| Calibrador | R$ 1.100 | R$ 1.170 | 6,4% |

**Atencao:** O Calibrador tem margem minima de apenas 6,4%. O sistema pode exibir um alerta visual (amarelo ou vermelho) para margens apertadas.

---

### Resultado Final

**O que o validador deve conferir:**
- Lances configurados para 4 itens com modos mistos (Valor Absoluto, % Desconto, % da Referencia)
- Calculos de lance minimo corretos para todos os itens
- Margem do Calibrador (6,4%) com alerta visual de margem estreita
- Item 6 usa modo "% da Referencia" no lance inicial (modo percentual testado)

**Sinais de problema:**
- Calculos de lance minimo incorretos
- Sistema nao alerta sobre margens estreitas (Calibrador 6,4%)
- Modo "% da Referencia" nao calcula valor automaticamente
- Margem negativa nao exibida quando lance minimo < custo

---

## [UC-P08] Definir Estrategia Competitiva

> **O que este caso de uso faz:** A estrategia competitiva define a postura da empresa no pregao — agressiva (quer ganhar a qualquer custo), conservadora (participa mas nao derruba margem), ou moderada. O sistema oferece perfis pre-definidos como "QUERO GANHAR" e "NAO GANHEI NO MINIMO", alem de ferramentas de simulacao: Analise de Lances (cenarios), Analise por IA (recomendacoes textuais) e Simulador de Disputa (pregao simulado). Pense nisso como escolher sua tatica antes de entrar em uma negociacao — vai ser firme ou flexivel?

**Onde:** Menu lateral -> Precificacao -> aba Lances
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de comecar

- O UC-P07 deve estar concluido — lances configurados para todos os itens.
- Continue na aba "Lances".

---

### Passo 1 — Selecionar perfil de estrategia

**O que fazer:** Localize a secao de estrategia competitiva. Selecione o perfil e preencha a justificativa:

| Campo | Valor |
|---|---|
| Perfil | `QUERO GANHAR` |
| Justificativa | `Mercado de reagentes e competitivo e sensivel a preco. Estrategia agressiva para ganhar volume e fidelizar com contrato de 12 meses.` |

**O que voce vai ver na tela:** O perfil "QUERO GANHAR" e selecionado com destaque visual.

---

### Passo 2 — Executar Analise de Lances

**O que fazer:** Clique no botao "Analise de Lances".

**O que voce vai ver na tela:** O sistema gera cenarios de simulacao com valores e margens para cada cenario.

**O que acontece depois:** Pelo menos 3 cenarios sao exibidos com valor e margem. Se algum cenario tem margem negativa, um alerta vermelho deve aparecer.

---

### Passo 3 — Executar Analise por IA

**O que fazer:** Clique no botao "Analise por IA".

**O que voce vai ver na tela:** Uma analise detalhada renderizada em Markdown com recomendacoes para a estrategia competitiva, levando em conta as margens estreitas dos reagentes.

**O que acontece depois:** Um botao "Relatorio MD/PDF" deve estar disponivel para download da analise.

---

### Passo 4 — Executar Simulador de Disputa

**O que fazer:** Clique no botao "Simulador de Disputa".

**O que voce vai ver na tela:** Uma simulacao de pregao eletronico renderizada com rodadas de lance, mostrando como a disputa poderia se desenrolar com as margens configuradas.

**O que acontece depois:** Um botao "Relatorio MD/PDF" deve estar disponivel para download da simulacao.

---

### Resultado Final

**O que o validador deve conferir:**
- Perfil "QUERO GANHAR" selecionado com justificativa salva
- Analise de Lances com pelo menos 3 cenarios (valor + margem)
- Analise por IA com recomendacoes renderizadas em Markdown
- Simulador de Disputa com rodadas de lance simuladas
- Botoes "Relatorio MD/PDF" disponiveis para Analise IA e Simulador

**Sinais de problema:**
- Perfil de estrategia nao salva ou justificativa se perde
- Analise de Lances nao gera cenarios
- Analise por IA trava ou gera texto generico sem mencionar reagentes
- Simulador de Disputa nao renderiza
- Botao de Relatorio nao funciona

---

## [UC-P09] Consultar Historico de Precos (Camada F)

> **O que este caso de uso faz:** Antes de fechar o preco, e importante saber por quanto reagentes similares foram vendidos em licitacoes anteriores. O historico de precos consulta o portal PNCP e traz estatisticas como preco medio, minimo e maximo praticados, alem de permitir exportar os dados em CSV. Pense nisso como pesquisar precos no mercado antes de colocar o seu produto a venda — voce quer saber a faixa de preco que os concorrentes praticam.

**Onde:** Menu lateral -> Precificacao -> aba Historico
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- O UC-P08 deve estar concluido.
- Navegue para a aba "Historico" na pagina de Precificacao.

---

### Passo 1 — Buscar historico de reagente hemograma

**O que fazer:** No campo de busca, digite o termo e clique em "Filtrar":

| Campo | Valor |
|---|---|
| Produto/Termo | `reagente hemograma completo` |

**O que voce vai ver na tela:** Card de Estatisticas com Preco Medio, Minimo (verde) e Maximo (vermelho). Tabela de Resultados com linhas contendo Produto, Preco e Data.

**Dados de referencia para comparacao:**

| Produto | Faixa de preco PNCP (estimada) |
|---|---|
| Reagente hemograma cx 500 | R$ 1.100 -- R$ 1.400 |

---

### Passo 2 — Buscar historico de kit glicose

**O que fazer:** Limpe a busca anterior. Digite o novo termo:

| Campo | Valor |
|---|---|
| Produto/Termo | `reagente glicose enzimatica GOD-PAP` |

**O que voce vai ver na tela:** Mesma estrutura — Card de Estatisticas e Tabela de Resultados.

**Dados de referencia:**

| Produto | Faixa de preco PNCP (estimada) |
|---|---|
| Reagente glicose 100 det | R$ 28 -- R$ 42 |
| Diluente 20L | R$ 220 -- R$ 350 |
| Calibrador 3 niveis | R$ 1.300 -- R$ 1.800 |

---

### Passo 3 — Exportar CSV

**O que fazer:** Com os resultados de qualquer busca na tela, clique no botao "CSV" para exportar os dados.

**O que acontece depois:** Um arquivo CSV e baixado com os dados da consulta.

---

### Resultado Final

**O que o validador deve conferir:**
- Card de Estatisticas exibido com Preco Medio, Minimo (verde), Maximo (vermelho)
- Tabela de Resultados com linhas de Produto, Preco e Data
- Busca por "reagente hemograma completo" retorna resultados relevantes
- Busca por "reagente glicose enzimatica GOD-PAP" retorna resultados relevantes
- Exportacao CSV funciona e arquivo e baixado

**Sinais de problema:**
- Card de Estatisticas nao exibe valores
- Tabela de Resultados vazia para ambas as buscas
- Exportacao CSV nao funciona ou arquivo esta vazio
- Precos exibidos estao fora das faixas de referencia de forma absurda

---

## [UC-P10] Gestao de Comodato

> **O que este caso de uso faz:** Em editais de reagentes hematologicos, e comum que o orgao comprador exija o fornecimento de um analisador (equipamento) em regime de comodato junto com os reagentes. Isso significa que a empresa empresta o equipamento por um prazo determinado (ex: 48 meses) e o custo e amortizado ao longo do contrato. O sistema calcula a amortizacao mensal e o impacto no preco de cada item do edital. Pense nisso como um aluguel do equipamento diluido no preco dos reagentes — o cliente nao compra o equipamento, mas voce precisa incluir o custo no preco dos reagentes.

**Onde:** Menu lateral -> Precificacao -> aba Historico
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de comecar

- O UC-P09 deve estar concluido.
- Continue na aba "Historico" na pagina de Precificacao.

---

### Passo 1 — Cadastrar Comodato 1 (Analisador Hematologico)

**O que fazer:** Localize a secao de Comodato na aba Historico. Preencha os dados do primeiro equipamento:

| Campo | Valor |
|---|---|
| Equipamento | `Analisador Hematologico Sysmex XN-1000` |
| Valor do Equipamento (R$) | `380.000,00` |
| Prazo (meses) | `48` |

**O que voce vai ver na tela:** O sistema calcula:

| Metrica | Valor |
|---|---|
| Amortizacao mensal | R$ 380.000 / 48 = **R$ 7.916,67** |

**O que acontece depois:** Toast de sucesso e nova linha na tabela de comodatos.

---

### Passo 2 — Cadastrar Comodato 2 (Analisador Bioquimico)

**O que fazer:** Adicione o segundo equipamento:

| Campo | Valor |
|---|---|
| Equipamento | `Analisador Bioquimico Mindray BS-240` |
| Valor do Equipamento (R$) | `145.000,00` |
| Prazo (meses) | `36` |

**O que voce vai ver na tela:** O sistema calcula:

| Metrica | Valor |
|---|---|
| Amortizacao mensal | R$ 145.000 / 36 = **R$ 4.027,78** |

---

### Passo 3 — Verificar impacto no preco

**O que fazer:** Na secao "Impacto", confira as metricas consolidadas:

| Metrica | Valor |
|---|---|
| Total equipamentos | 2 |
| Valor total equipamentos | R$ 525.000,00 |
| Amortizacao mensal total | R$ 11.944,45 |
| Impacto por item do lote (7 itens) | R$ 11.944,45 / 7 = **R$ 1.706,35/mes** |

---

### Resultado Final

**O que o validador deve conferir:**
- Comodato 1 (Sysmex XN-1000): amortizacao R$ 7.916,67/mes
- Comodato 2 (Mindray BS-240): amortizacao R$ 4.027,78/mes
- 2 linhas na tabela de comodatos
- Secao Impacto com metricas consolidadas calculadas corretamente
- Impacto por item = R$ 1.706,35/mes

**Sinais de problema:**
- Toast de erro ao salvar comodato
- Calculo de amortizacao incorreto
- Secao Impacto nao exibe metricas
- Segundo comodato sobrescreve o primeiro em vez de adicionar

---

## [UC-P11] Pipeline IA de Precificacao

> **O que este caso de uso faz:** O Pipeline IA e o assistente inteligente de precificacao. Ele busca automaticamente no PNCP o historico de precos e atas de registro para cada produto, analisa os dados e sugere valores para todas as camadas de preco (Custo, Preco Base, Referencia, Lance Inicial, Lance Minimo). Voce pode aceitar as sugestoes com um clique ("Usar ->") ou ignorar e manter seus valores. Tambem mostra os concorrentes principais e as atas consultadas. Pense nisso como ter um consultor de precos que pesquisou o mercado inteiro e te diz "para este produto, sugiro cobrar entre X e Y".

**Onde:** Menu lateral -> Precificacao -> aba Custos e Precos
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de comecar

- Os UCs P04 a P07 devem estar concluidos — custos, precos base, referencias e lances configurados.
- Navegue para a aba "Custos e Precos".

---

### Passo 1 — Pipeline IA para Item 1 (Kit Hemograma)

**O que fazer:** Selecione o vinculo Item 1 — Kit Hemograma Sysmex XN. O pipeline IA deve iniciar automaticamente ou via botao dedicado.

**O que voce vai ver na tela:** Um indicador de loading com a mensagem "Buscando historico de precos e atas no PNCP...". Apos o processamento, um Banner Resumo aparece com: N registros, N atas, Min, Media, Max, Ref. Edital.

**Recomendacoes IA esperadas — Item 1:**

| Camada | Descricao | Faixa esperada |
|---|---|---|
| Custo (A) | Custo sugerido pela IA | R$ 800 -- R$ 900 |
| Preco Base (B) | Preco base sugerido | R$ 1.100 -- R$ 1.200 |
| Referencia (C) | Target estrategico | R$ 1.150 -- R$ 1.300 |
| Lance Inicial (D) | Lance de abertura | R$ 1.100 -- R$ 1.250 |
| Lance Minimo (E) | Piso competitivo | R$ 900 -- R$ 1.050 |

---

### Passo 2 — Usar sugestao IA

**O que fazer:** No Card Custo (A), clique no botao "Usar ->" para aceitar a sugestao da IA.

**O que voce vai ver na tela:** O valor sugerido e aplicado automaticamente no campo Custo Unitario.

**O que acontece depois:** O valor pre-preenche o card de Base de Custos.

---

### Passo 3 — Pipeline IA para Item 6 (Kit Glicose)

**O que fazer:** Selecione o vinculo Item 6 — Kit Glicose Wiener BioGlic-100. Verifique o Banner Resumo (reagentes bioquimicos tem bastante historico no PNCP).

**Recomendacoes IA esperadas — Item 6:**

| Camada | Descricao | Faixa esperada |
|---|---|---|
| Custo (A) | Custo sugerido | R$ 18 -- R$ 25 |
| Preco Base (B) | Preco base | R$ 28 -- R$ 35 |
| Referencia (C) | Target | R$ 30 -- R$ 40 |
| Lance Inicial (D) | Lance abertura | R$ 30 -- R$ 38 |
| Lance Minimo (E) | Piso | R$ 24 -- R$ 30 |

---

### Passo 4 — Regenerar analise

**O que fazer:** Clique em "Regenerar" para forcar uma nova busca de historico e atas.

**O que voce vai ver na tela:** O Banner Resumo e atualizado com novos dados.

---

### Passo 5 — Verificar Concorrentes e Atas

**O que fazer:** Expanda a secao "Concorrentes principais". Verifique a tabela com Empresa, Vitorias, Taxa, Preco Medio.

**O que fazer em seguida:** Expanda a secao "Atas consultadas". Verifique a lista de atas com Titulo, Orgao, UF e link PNCP.

---

### Resultado Final

**O que o validador deve conferir:**
- Pipeline IA executado para Item 1 (Kit Hemograma) e Item 6 (Kit Glicose)
- Banner Resumo com metricas de historico (N registros, N atas, Min, Media, Max)
- Recomendacoes A-E dentro das faixas esperadas
- Botao "Usar ->" funciona e pre-preenche o campo de custo
- Botao "Regenerar" atualiza a analise
- Concorrentes principais exibidos (Labtest, Wama, Siemens, Beckman, Abbott)
- Atas consultadas com links para PNCP

**Sinais de problema:**
- Pipeline IA nao inicia ou trava indefinidamente
- Banner Resumo vazio ou com N=0 registros
- Recomendacoes com valores absurdos (ex: R$ 0 ou R$ 999.999)
- Botao "Usar ->" nao aplica o valor
- Secao de Concorrentes ou Atas vazia sem explicacao

---

## [UC-P12] Relatorio de Custos e Precos

> **O que este caso de uso faz:** O relatorio consolida toda a precificacao em um documento estruturado — identificacao do edital, conversao de volumetria, analise de mercado da IA, sugestoes por camada (A-E), explicacao dos calculos (markup, isencoes tributarias), lista de concorrentes, vencedores de licitacoes anteriores, justificativa da IA e valores finais definidos. Voce pode baixar o relatorio em Markdown ou PDF. Pense nisso como o dossie de precificacao — o documento que justifica cada centavo do seu preco.

**Onde:** Menu lateral -> Precificacao -> aba Custos e Precos
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- Os UCs P01 a P11 devem estar concluidos — toda a precificacao preenchida.

---

### Passo 1 — Gerar relatorio para Item 1 (Kit Hemograma)

**O que fazer:** Selecione o vinculo Item 1 — Kit Hemograma Sysmex XN. Clique em "Relatorio de Custos e Precos".

**O que voce vai ver na tela:** Uma nova aba abre com o relatorio renderizado em Markdown.

**Secoes esperadas no relatorio:**

| Secao | Conteudo esperado |
|---|---|
| Identificacao | Edital, orgao, item 1, Kit Hemograma Sysmex XN |
| Conversao de Quantidade | 25.350 testes, 51 caixas (volumetria) |
| Analise de Mercado IA | Historico de atas e contratos de reagentes |
| Sugestoes A-E | Valores por camada com justificativa |
| Explicacao dos Calculos | Markup 35%, isencao ICMS/IPI, PIS+COFINS 9,25% |
| Concorrentes | Labtest, Wama, Siemens, Beckman, Abbott |
| Vencedores Detalhados | Precos homologados em licitacoes anteriores |
| Justificativa IA | Texto analitico com recomendacao |
| Valores Definidos | Camadas A-E com valores finais |

---

### Passo 2 — Baixar relatorio

**O que fazer:** Clique em "Baixar MD" para o arquivo Markdown e "Baixar PDF" para o PDF.

**O que acontece depois:** Os arquivos sao baixados para o seu computador.

---

### Resultado Final

**O que o validador deve conferir:**
- Relatorio renderizado com todas as secoes listadas acima
- Secao de Volumetria presente (conversao det/kit — 25.350 testes -> 51 caixas)
- Secao de isencao tributaria NCM 3822 mencionada na explicacao dos calculos
- Concorrentes do segmento de reagentes listados
- Download MD e PDF funcionando

**Sinais de problema:**
- Relatorio nao abre ou abre em branco
- Secoes faltando (especialmente Volumetria e Explicacao dos Calculos)
- Valores no relatorio nao correspondem aos configurados nos UCs anteriores
- Download de MD ou PDF falha

---

# FASE 2 — PROPOSTA

---

## [UC-R01] Gerar Proposta Tecnica (Motor Automatico)

> **O que este caso de uso faz:** Agora que a precificacao esta pronta, e hora de gerar a proposta tecnica — o documento formal que sera enviado ao orgao comprador. O motor automatico da IA gera a proposta com base nos dados do edital, produto, preco e lote. Voce pode gerar varias propostas para o mesmo edital (uma por lote) e o sistema tambem sugere precos competitivos via um icone de lampada (lightbulb). Pense nisso como montar a carta comercial da empresa para o cliente, mas de forma automatizada.

**Onde:** Menu lateral -> Proposta
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de comecar

- Toda a FASE 1 (UCs P01-P12) deve estar concluida.
- Navegue para a pagina "Proposta" no menu lateral.

---

### Passo 1 — Gerar Proposta 1 (Kit Hemograma)

**O que fazer:** No card "Gerar Nova Proposta", preencha os campos:

| Campo | Valor |
|---|---|
| Edital | Edital de "reagente hematologia" |
| Produto | `Kit de Reagentes para Hemograma Completo Sysmex XN` |
| Preco Unitario | `1.150,00` |
| Quantidade | `51` |
| Lote | `Lote 1 — Hematologia` |
| Template | (selecionar template disponivel ou deixar padrao) |

---

### Passo 2 — Verificar sugestao de preco IA

**O que fazer:** Clique no icone de lampada (lightbulb) ao lado do campo de preco.

**O que voce vai ver na tela:** Uma dica "Sugerido: R$ X" exibida abaixo do campo de preco, onde X e o valor competitivo sugerido pela IA.

---

### Passo 3 — Gerar a proposta

**O que fazer:** Clique em "Gerar Proposta Tecnica".

**O que voce vai ver na tela:** O motor IA processa e gera a proposta. Uma nova linha aparece na tabela "Minhas Propostas" com status "Rascunho".

**O que acontece depois:** Valor total calculado: R$ 1.150,00 x 51 = **R$ 58.650,00**.

---

### Passo 4 — Gerar Proposta 2 (Kit Glicose)

**O que fazer:** No card "Gerar Nova Proposta", preencha para o segundo lote:

| Campo | Valor |
|---|---|
| Edital | Edital de "reagente hematologia" (mesmo edital, lote diferente) |
| Produto | `Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao` |
| Preco Unitario | `30,00` |
| Quantidade | `183` |
| Lote | `Lote 2 — Bioquimica` |
| Template | (selecionar template diferente do anterior, se disponivel) |

**O que fazer em seguida:** Clique em "Gerar Proposta Tecnica".

**O que acontece depois:** Valor total: R$ 30,00 x 183 = **R$ 5.490,00**. Segunda linha na tabela "Minhas Propostas" com status "Rascunho".

---

### Resultado Final

**O que o validador deve conferir:**
- 2 propostas na tabela "Minhas Propostas", ambas com status "Rascunho"
- Proposta 1: Kit Hemograma, R$ 1.150 x 51 = R$ 58.650, Lote 1
- Proposta 2: Kit Glicose, R$ 30 x 183 = R$ 5.490, Lote 2
- Sugestao de preco IA (icone lightbulb) funciona
- Filtrar por status "Rascunho" exibe ambas as propostas

**Sinais de problema:**
- Motor IA nao gera a proposta ou trava
- Valor total calculado incorretamente
- Segunda proposta sobrescreve a primeira
- Icone lightbulb nao funciona ou nao exibe sugestao
- Propostas nao aparecem na tabela "Minhas Propostas"

---

## [UC-R02] Upload de Proposta Externa

> **O que este caso de uso faz:** Nem sempre a proposta e gerada pelo sistema — as vezes a empresa ja tem uma proposta elaborada externamente (em Word, PDF, etc.). Este caso de uso permite importar esse documento para o sistema, associando-o ao edital e ao produto, com preco e quantidade proprios. Pense nisso como anexar um documento que voce ja preparou fora do sistema para manter tudo centralizado.

**Onde:** Menu lateral -> Proposta
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- O UC-R01 deve estar concluido — 2 propostas ja existem na tabela.

---

### Passo 1 — Fazer upload de proposta externa

**O que fazer:** Localize a opcao de upload/importacao de proposta. Preencha os campos:

| Campo | Valor |
|---|---|
| Edital | Edital de "reagente hematologia" |
| Produto | `Kit de Reagentes para Hemograma Completo Sysmex XN` |
| Arquivo | `tests/fixtures/teste_upload.pdf` (ou qualquer PDF < 2 MB) |
| Preco Unitario | `1.180,00` |
| Quantidade | `50` |

**O que fazer em seguida:** Clique em "Importar".

**O que acontece depois:** Toast de sucesso. Nova proposta na tabela "Minhas Propostas" com status "Rascunho".

---

### Resultado Final

**O que o validador deve conferir:**
- 3 propostas na tabela (2 geradas + 1 upload)
- Proposta importada com preco R$ 1.180,00 (diferente do R$ 1.150,00 da Proposta 1)
- Toast de sucesso apos importacao
- Arquivo PDF anexado a proposta

**Sinais de problema:**
- Upload falha ou arquivo nao e aceito
- Proposta importada nao aparece na tabela
- Preco ou quantidade nao sao registrados corretamente

---

## [UC-R03] Personalizar Descricao Tecnica (A/B)

> **O que este caso de uso faz:** Cada proposta tem uma descricao tecnica do produto. Por padrao, o sistema usa o texto do edital (modo "edital"), mas voce pode alternar para o modo "personalizado" e escrever sua propria descricao — mais detalhada, com especificacoes tecnicas, rendimento, armazenamento, registro ANVISA, etc. O toggle A/B permite alternar entre os dois modos sem perder nenhum dos textos. Pense nisso como ter duas versoes do mesmo paragrafo — a original e a sua versao melhorada — e poder trocar entre elas com um clique.

**Onde:** Menu lateral -> Proposta -> (selecionar proposta)
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- Os UCs R01 e R02 devem estar concluidos.
- Selecione a Proposta 1 (Kit Hemograma) na tabela "Minhas Propostas".

---

### Passo 1 — Verificar modo padrao

**O que fazer:** Na proposta selecionada, localize o toggle de descricao tecnica. Verifique que o modo padrao e "edital" — o texto do edital esta exibido em modo readonly.

---

### Passo 2 — Alternar para modo personalizado

**O que fazer:** Clique no Toggle para alternar de "edital" para "personalizado".

**O que voce vai ver na tela:** O badge muda para "Personalizado" (em amarelo) e o campo de texto torna-se editavel.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Descricao personalizada | `Kit de Reagentes para Hemograma Completo, compativel com analisador hematologico automatizado Sysmex XN-1000/XN-2000. Inclui reagentes para contagem celular diferencial 5-populacoes (WBC, RBC, PLT, HGB, HCT), reticulocitos e fluidos de limpeza. Rendimento: 500 testes por caixa. Armazenamento: 2-8C. Registro ANVISA: 10386890001. Validade minima: 12 meses na entrega.` |

---

### Passo 3 — Testar toggle A/B

**O que fazer:** Clique no Toggle novamente para voltar ao modo "edital".

**O que voce vai ver na tela:** Texto original do edital restaurado (readonly).

**O que fazer em seguida:** Clique no Toggle mais uma vez para voltar ao modo "personalizado".

**O que voce vai ver na tela:** A descricao personalizada que voce digitou esta preservada — nao se perdeu ao alternar.

---

### Resultado Final

**O que o validador deve conferir:**
- Toggle A/B funciona: alterna entre "edital" (readonly) e "personalizado" (editavel)
- Badge "Personalizado" em amarelo no modo personalizado
- Descricao personalizada preservada apos alternar A/B
- Texto personalizado inclui: rendimento (500 testes), armazenamento (2-8C), ANVISA (10386890001)

**Sinais de problema:**
- Toggle nao alterna ou fica travado
- Descricao personalizada se perde ao voltar para modo "edital" e retornar
- Badge nao muda de cor
- Campo nao se torna editavel no modo personalizado

---

## [UC-R04] Auditoria ANVISA (Semaforo Regulatorio)

> **O que este caso de uso faz:** Antes de enviar a proposta, o sistema verifica se os registros ANVISA dos produtos estao validos. Funciona como um semaforo: verde (registro valido), amarelo (proximo do vencimento), vermelho (vencido — bloqueante). Se algum registro esta vencido, a proposta nao pode ser enviada ate regularizacao. Pense nisso como verificar se a "carteira de motorista" dos seus produtos esta em dia antes de colocar o caminhao na estrada.

**Onde:** Menu lateral -> Proposta -> (selecionar proposta) -> Card "Auditoria ANVISA"
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- O UC-R03 deve estar concluido.
- Mantenha a Proposta 1 (Kit Hemograma) selecionada.

---

### Passo 1 — Verificar registros ANVISA

**O que fazer:** No card "Auditoria ANVISA", clique em "Verificar Registros".

**O que voce vai ver na tela:** O sistema consulta a ANVISA e exibe os resultados:

| Produto | Registro | Status esperado |
|---|---|---|
| Kit Hemograma Sysmex XN | 10386890001 | Valido (verde) ou Proximo Venc. (amarelo) |
| Kit Glicose Wiener BioGlic-100 | 10386890001 | Valido (verde) |

---

### Passo 2 — Verificar cenario de registro vencido (se aplicavel)

**O que fazer:** Se algum registro estiver vencido:

| Verificacao | Resultado esperado |
|---|---|
| Badge | "Vencido" em vermelho |
| Alerta | "BLOQUEANTE: Existem registros ANVISA vencidos" |
| Impacto | Proposta nao pode ser enviada ate regularizacao |

---

### Resultado Final

**O que o validador deve conferir:**
- Auditoria ANVISA executada com sucesso
- Semaforo exibido: verde (valido), amarelo (proximo venc.) ou vermelho (vencido)
- Se vencido: alerta bloqueante exibido
- Registro 10386890001 consultado para ambos os produtos

**Sinais de problema:**
- Consulta ANVISA falha ou trava
- Nenhum resultado retornado
- Semaforo nao exibe cores corretas
- Alerta bloqueante nao aparece para registro vencido

---

## [UC-R05] Auditoria Documental + Smart Split

> **O que este caso de uso faz:** O sistema verifica se todos os documentos exigidos pelo edital estao presentes no cadastro da empresa — AFE ANVISA, Alvara Sanitario, ISO 13485, Certidao Estadual, Atestado de Capacidade Tecnica, Certificado de Boas Praticas de Distribuicao. Exibe um indicador de completude (ex: "4 de 6 documentos presentes") e alerta sobre documentos faltantes. O Smart Split verifica se algum arquivo excede o limite de 25MB e sugere divisao. Pense nisso como um checklist de documentos antes de despachar uma encomenda — voce confere se tudo esta dentro da caixa antes de fechar.

**Onde:** Menu lateral -> Proposta -> (selecionar proposta) -> Card "Auditoria Documental"
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- O UC-R04 deve estar concluido.
- Mantenha a Proposta 1 (Kit Hemograma) selecionada.

---

### Passo 1 — Verificar documentos

**O que fazer:** No card "Auditoria Documental", clique em "Verificar Documentos".

**O que voce vai ver na tela:** O sistema audita os documentos e exibe o resultado:

| Documento | Tamanho estimado | Status esperado |
|---|---|---|
| AFE ANVISA | < 1 MB | Presente (verde) |
| Alvara Sanitario | < 1 MB | Presente (verde) |
| ISO 13485 | < 1 MB | Presente (verde) |
| Certidao Estadual | < 1 MB | Presente (verde) |
| Atestado Capacidade Tecnica | -- | Ausente (vermelho) |
| Certificado Boas Praticas Distribuicao | -- | Ausente (vermelho) |

---

### Passo 2 — Verificar indicador e Smart Split

**O que fazer:** Confira o indicador de completude e o alerta de Smart Split:

| Verificacao | Resultado esperado |
|---|---|
| Indicador | "4 de 6 documentos presentes" (laranja) |
| Alerta Smart Split | Nao deve aparecer (arquivos < 25MB) |

---

### Resultado Final

**O que o validador deve conferir:**
- 4 documentos presentes (verde): AFE, Alvara, ISO 13485, Certidao Estadual
- 2 documentos ausentes (vermelho): Atestado Capacidade Tecnica, Boas Praticas Distribuicao
- Indicador "4 de 6" em estado laranja (parcialmente completo)
- Alerta Smart Split ausente (arquivos pequenos)

**Sinais de problema:**
- Auditoria nao executa ou trava
- Todos os documentos marcados como ausentes (inclusive os que existem)
- Indicador nao reflete a contagem correta
- Smart Split alerta mesmo com arquivos pequenos

---

## [UC-R06] Exportar Dossie Completo

> **O que este caso de uso faz:** O dossie completo e o pacote final com tudo que sera enviado ao orgao comprador: proposta tecnica (PDF), documentos da empresa (AFE, Alvara, ISO, Certidao), planilha de precos. Voce pode exportar em PDF individual, DOCX, ZIP (pacote completo) ou preparar para envio por email. Pense nisso como montar o envelope final com todos os documentos — a proposta, os certificados e a planilha de precos — tudo organizado e pronto para despachar.

**Onde:** Menu lateral -> Proposta -> (selecionar proposta) -> Card "Exportacao"
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de comecar

- O UC-R05 deve estar concluido.
- Mantenha a Proposta 1 (Kit Hemograma) selecionada.

---

### Passo 1 — Exportar em cada formato

**O que fazer:** No card "Exportacao", execute cada exportacao:

| Formato | Acao | Verificacao |
|---|---|---|
| PDF | Clicar "Baixar PDF" | Download do arquivo .pdf |
| DOCX | Clicar "Baixar DOCX" | Download do arquivo .docx |
| ZIP | Clicar "Baixar Dossie ZIP" | Download do pacote completo |
| Email | Clicar "Enviar por Email" | Prompt de envio preparado |

---

### Passo 2 — Verificar conteudo do dossie ZIP

**O que fazer:** Abra o arquivo ZIP baixado e confira o conteudo:

| Item | Presente |
|---|---|
| Proposta tecnica (PDF) | Sim |
| Documentos da empresa | Sim (AFE, Alvara, ISO, Certidao) |
| Planilha de precos | Sim |

---

### Resultado Final

**O que o validador deve conferir:**
- 4 formatos de exportacao funcionando: PDF, DOCX, ZIP, Email
- Dossie ZIP contem proposta tecnica, documentos e planilha de precos
- Arquivos baixados abrem corretamente e nao estao corrompidos

**Sinais de problema:**
- Algum formato de exportacao falha ou gera arquivo corrompido
- ZIP incompleto (faltando documentos ou planilha)
- Prompt de email nao abre
- Download nao inicia

---

## [UC-R07] Gerenciar Status e Submissao

> **O que este caso de uso faz:** Este e o ultimo passo — gerenciar o ciclo de vida da proposta (Rascunho -> Em Revisao -> Aprovada -> Enviada) e submete-la ao orgao comprador. Inclui editar o conteudo Markdown da proposta, avanca-la pelos status, verificar o checklist de submissao, anexar documentos faltantes e finalmente marca-la como enviada. Tambem abre o portal PNCP para envio real. Pense nisso como o processo de revisao e aprovacao interna antes de enviar a proposta — como um fluxo de aprovacao em que o documento passa por varias etapas ate ser despachado.

**Onde:** Menu lateral -> Proposta (Parte A) e Menu lateral -> Submissao (Parte B)
**Quanto tempo leva:** 15 a 20 minutos

---

### Antes de comecar

- Os UCs R01 a R06 devem estar concluidos.
- A Proposta 1 (Kit Hemograma) deve estar com status "Rascunho".

---

### Parte A — PropostaPage (Gestao de Status)

---

#### Passo 1 — Selecionar e verificar proposta

**O que fazer:** Na tabela "Minhas Propostas", selecione a Proposta 1 — Kit Hemograma.

**O que voce vai ver na tela:** Card com detalhes da proposta:
- Edital, orgao, produto
- Preco: R$ 1.150,00
- Quantidade: 51
- Total: R$ 58.650,00
- Badge de status: "Rascunho"

---

#### Passo 2 — Editar conteudo Markdown

**O que fazer:** Na area do editor Markdown, use a toolbar (Bold, H1, List) para formatar o conteudo. Adicione a seguinte secao:

**Texto a adicionar:**
`Condicoes de Armazenamento: Cadeia fria 2-8C durante transporte e armazenamento`

**O que voce vai ver na tela:** Indicador "Alteracoes nao salvas" em laranja.

**O que fazer em seguida:** Clique em "Salvar Conteudo". O indicador desaparece.

---

#### Passo 3 — Avancar fluxo de status

**O que fazer:** Avance a proposta pelos status, um por um:

| Passo | Acao | Status resultante |
|---|---|---|
| 1 | Clicar "Salvar Rascunho" | Rascunho |
| 2 | Clicar "Enviar para Revisao" | Em Revisao |
| 3 | Clicar "Aprovar" | Aprovada |

**O que voce vai ver na tela:** O badge de status muda a cada acao, refletindo o novo estado da proposta.

---

### Parte B — SubmissaoPage (Checklist e Envio)

---

#### Passo 4 — Acessar pagina de Submissao

**O que fazer:** No menu lateral, clique em "Submissao" (ou navegue para `/app/submissao`).

**O que voce vai ver na tela:** Tabela com propostas prontas para envio. A Proposta 1 (Aprovada) deve estar visivel.

---

#### Passo 5 — Verificar checklist de submissao

**O que fazer:** Selecione a Proposta 1. O card "Checklist de Submissao" aparece com os seguintes itens:

| Item | Status esperado |
|---|---|
| Proposta tecnica gerada | Marcado |
| Preco definido | Marcado |
| Documentos anexados | 4/6 (parcial) |
| Revisao final | Marcado (se aprovada) |

---

#### Passo 6 — Anexar documento faltante

**O que fazer:** Clique em "Anexar Documento" (ou similar) e preencha:

| Campo | Valor |
|---|---|
| Tipo de Documento | `Certidao` |
| Arquivo | `tests/fixtures/teste_upload.pdf` (ou qualquer PDF < 2 MB) |
| Observacao | `Atestado de Capacidade Tecnica para fornecimento de reagentes hematologicos` |

**O que fazer em seguida:** Clique em "Enviar". Toast de sucesso.

---

#### Passo 7 — Finalizar submissao

**O que fazer:** Execute o fluxo de finalizacao:

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Clicar "Marcar como Enviada" | Status muda para "Enviada" |
| 2 | Clicar "Aprovar" | Status muda para "Aprovada" |
| 3 | Clicar "Abrir Portal PNCP" | Portal externo abre em nova aba |

---

### Resultado Final

**O que o validador deve conferir:**

**Parte A:**
- Proposta 1 selecionada com dados corretos (R$ 1.150 x 51 = R$ 58.650)
- Editor Markdown funciona com toolbar (Bold, H1, List)
- Indicador "Alteracoes nao salvas" aparece e desaparece apos salvar
- Fluxo de status: Rascunho -> Em Revisao -> Aprovada

**Parte B:**
- Proposta Aprovada visivel na SubmissaoPage
- Checklist exibido com 4 itens (parcialmente completo: 4/6 documentos)
- Documento anexado com sucesso (Certidao)
- Fluxo de finalizacao: Enviada -> Aprovada
- Portal PNCP abre em nova aba

**Sinais de problema:**
- Editor Markdown nao renderiza ou toolbar nao funciona
- Indicador de alteracoes nao aparece
- Fluxo de status trava em alguma transicao
- Proposta aprovada nao aparece na SubmissaoPage
- Upload de documento faltante falha
- Portal PNCP nao abre

---

## Resumo de Verificacoes por UC

| UC | O que verificar | Resultado esperado |
|---|---|---|
| UC-P01 | Organizar edital por lotes | 2 lotes (Hematologia 5 itens, Bioquimica 2 itens); parametros tecnicos preenchidos |
| UC-P02 | Selecao inteligente de portfolio | 4 modos testados (Manual, IA, Web, ANVISA); ciclo ignorar/reativar; troca de vinculo |
| UC-P03 | Calculo de volumetria | Item 1: 51 caixas (ceil 25350/500); Item 6: 183 kits (ceil 18240/100); Item 4: sem volumetria |
| UC-P04 | Base de custos e tributacao | Custos R$ 850 / R$ 22 / R$ 180 / R$ 1.100; hint "ISENTO -- NCM 3822"; PIS+COFINS 9,25% |
| UC-P05 | Preco base (Camada B) | Custo+Markup R$ 1.147,50 (35%) e R$ 250,20 (39%); Manual R$ 30 e R$ 1.500; flag Reutilizar |
| UC-P06 | Valor de referencia (Camada C) | Absoluto R$ 1.200 / R$ 280 / R$ 1.600; Percentual 107% = R$ 32,10 |
| UC-P07 | Lances (Camadas D e E) | 4 itens com modos mistos; margens 6,4%-16,7%; alerta margem estreita no Calibrador |
| UC-P08 | Estrategia competitiva | Perfil "QUERO GANHAR"; Analise de Lances (3+ cenarios); Analise IA; Simulador de Disputa |
| UC-P09 | Historico de precos (Camada F) | 2 buscas com resultados; Card Estatisticas; Exportacao CSV |
| UC-P10 | Gestao de comodato | 2 comodatos (Sysmex R$ 380k/48m + Mindray R$ 145k/36m); impacto R$ 1.706,35/item/mes |
| UC-P11 | Pipeline IA de precificacao | Recomendacoes A-E; "Usar ->"; Regenerar; Concorrentes e Atas |
| UC-P12 | Relatorio de custos e precos | Relatorio com 9 secoes; volumetria; isencao NCM 3822; download MD/PDF |
| UC-R01 | Gerar proposta tecnica | 2 propostas: Hemograma R$ 58.650 + Glicose R$ 5.490; sugestao IA (lightbulb) |
| UC-R02 | Upload de proposta externa | 3a proposta via upload; preco R$ 1.180; arquivo PDF anexado |
| UC-R03 | Descricao tecnica A/B | Toggle edital/personalizado; texto preservado apos alternar; specs IVD no texto |
| UC-R04 | Auditoria ANVISA | Semaforo verde/amarelo/vermelho; registro 10386890001; alerta bloqueante se vencido |
| UC-R05 | Auditoria documental | 4/6 documentos (laranja); Smart Split sem alerta; 2 docs faltantes identificados |
| UC-R06 | Exportar dossie | 4 formatos (PDF, DOCX, ZIP, Email); ZIP com proposta + docs + planilha |
| UC-R07 | Status e submissao | Fluxo Rascunho->Revisao->Aprovada; checklist 4/6; anexar doc; Enviada; Portal PNCP |

---

## O que reportar se algo falhar

Se durante a validacao voce encontrar algo diferente do esperado, relate com as seguintes informacoes para facilitar a correcao:

**1. Qual UC falhou?**
Exemplo: "UC-P04, Passo 2"

**2. O que voce esperava ver?**
Exemplo: "O hint 'ISENTO -- NCM 3822' deveria aparecer ao lado do campo ICMS"

**3. O que apareceu em vez disso?**
Exemplo: "O campo ICMS veio preenchido com 18% e nao tinha nenhuma dica de isencao"

**4. Alguma mensagem de erro apareceu?**
Se sim, copie o texto exato da mensagem ou tire um print da tela.

**5. Em qual passo voce estava?**
Exemplo: "Acabei de preencher o custo unitario R$ 850 e estava salvando os custos do Item 1"

**6. O problema aparece toda vez que voce tenta, ou so aconteceu uma vez?**
Se aconteceu so uma vez, tente repetir o passo para confirmar se e consistente.

---

> **Dica final:** Faca os UCs na ordem apresentada neste tutorial. A FASE 1 (Precificacao: P01-P12) deve ser feita antes da FASE 2 (Proposta: R01-R07), pois a proposta depende dos dados de precificacao. Dentro de cada fase, siga a ordem dos UCs — cada um depende dos dados do anterior. Se precisar recomecar, limpe os dados de precificacao e proposta da RP3X antes de comecar novamente.
