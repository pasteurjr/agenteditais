# Conjunto de Dados 2 — Recursos e Impugnacoes
# Validacao Automatizada e pelo Dono do Produto

**Empresa:** RP3X Comercio e Representacoes Ltda. (RP3X Cientifica)
**Perfil:** Distribuidora de reagentes e kits diagnosticos para laboratorios clinicos e hospitalares, atuante em licitacoes publicas via PNCP. Especializada em reagentes de hematologia, bioquimica e imunologia, com cadeia fria e logistica de entregas fracionadas.
**Uso:** Conjunto alternativo — dados distintos do Conjunto 1 para cobrir variacoes de fluxo, campos opcionais diferentes e cenarios de borda.

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

1. Acessar o sistema em `http://localhost:5175`
2. Preencher email: `valida2@valida.com.br`, senha: `123456`
3. Apos autenticacao, aparece **tela de selecao de empresa**
4. Clicar em "RP3X Comercio e Representacoes Ltda."
5. Sistema carrega o Dashboard com a empresa selecionada

### Pre-requisito: Dados das Sprints Anteriores

Os dados de empresa, portfolio e parametrizacoes do `dadosempportpar-2.md` e os editais salvos do `dadoscapval-2.md` devem estar cadastrados antes de executar os testes da Sprint 4. Os produtos e editais relevantes sao:

| Produto | Fabricante | NCM | Area |
|---|---|---|---|
| Kit de Reagentes para Hemograma Completo Sysmex XN | Sysmex | 3822.19.90 | Diagnostico in Vitro e Laboratorio |
| Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao | Wiener Lab Group | 3822.19.90 | Diagnostico in Vitro e Laboratorio |

Editais salvos na Sprint 2 (Captacao/Validacao) com status GO ou Em Avaliacao sao pre-requisito para as fases de Impugnacao e Recursos.

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## UC-I01 — Validacao Legal do Edital

### Edital alvo para analise

| Campo | Valor |
|---|---|
| Edital | Selecionar edital de "reagente hematologia" salvo na Sprint 2 |
| Pagina | ImpugnacaoPage (`/app/impugnacao`) |
| Aba | Validacao Legal |

### Acao

| Acao | Descricao |
|---|---|
| Selecionar edital | No [Select: "Selecione o Edital"], escolher edital de reagentes hematologicos |
| Clicar | "Analisar Edital" |
| Aguardar | Processamento da IA (indicador "Analisando...") |

### Inconsistencias esperadas (especificas de reagentes)

| # | Trecho do edital (exemplo) | Lei Violada | Gravidade | Sugestao |
|---|---|---|---|---|
| 1 | "Reagentes devem ser compativeis exclusivamente com analisador Sysmex XN-1000" | Art. 41 par.2 Lei 14.133/2021 — restricao indevida de marca/plataforma | ALTA | Impugnacao |
| 2 | "Exige-se AFE ANVISA categoria especial para distribuidora" | Art. 67 par.1 Lei 14.133/2021 — exigencia desproporcional de habilitacao | MEDIA | Esclarecimento |
| 3 | "Prazo de validade minimo de 24 meses na data da entrega" | Art. 75 Lei 14.133/2021 — restricao excessiva (shelf-life padrao do mercado e 18 meses) | ALTA | Impugnacao |
| 4 | "Fornecimento de equipamento em comodato vinculado aos reagentes" | Art. 40 par.5 Lei 14.133/2021 — vinculacao reagente-equipamento restringe competicao | ALTA | Impugnacao |
| 5 | "Amostras de todos os itens devem ser entregues em ate 3 dias uteis" | Art. 17 par.3 Lei 14.133/2021 — prazo insuficiente para logistica de cadeia fria (2-8C) | MEDIA | Esclarecimento |

> **Diferenca do Conjunto 1:** questoes legais especificas de reagentes — platform lock-in (comodato vinculado), shelf-life, cadeia fria, AFE especial. O Conjunto 1 trata de equipamentos medicos com questoes diferentes.

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Tabela de inconsistencias visivel | Sim, com pelo menos 3 itens |
| Badges de gravidade coloridos | ALTA (vermelho), MEDIA (amarelo), BAIXA (verde) |
| Badges de sugestao | "Impugnacao" (error) ou "Esclarecimento" (info) |

---

## UC-I02 — Sugerir Esclarecimento ou Impugnacao

### Cenario 1 — Criar peticao de Esclarecimento (AFE desproporcional)

| Campo | Valor |
|---|---|
| Pagina | ImpugnacaoPage (`/app/impugnacao`) |
| Aba | Peticoes |
| Acao | Clicar "Nova Peticao" |

### Modal "Nova Peticao" — Esclarecimento

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematologicos |
| Tipo | Esclarecimento |
| Template | Nenhum (em branco) |
| Conteudo | Solicitamos esclarecimento quanto a exigencia de AFE ANVISA em categoria especial para distribuidoras de reagentes de diagnostico in vitro. A legislacao vigente (RDC 16/2013) nao preve tal subcategoria para distribuidoras de produtos classe I e II. Rogamos informar a base normativa para tal requisito. |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Peticao na tabela | Tipo "Esclarecimento", Status "Rascunho" |
| Badge de tipo | "Esclarecimento" (info) |

### Cenario 2 — Criar peticao de Impugnacao (restricao de plataforma)

| Campo | Valor |
|---|---|
| Tipo | Impugnacao |
| Template | Nenhum (em branco) |
| Conteudo | A exigencia de compatibilidade exclusiva com analisador Sysmex XN-1000 configura direcionamento de marca vedado pelo Art. 41 par.2 da Lei 14.133/2021. Reagentes de diversos fabricantes (Wiener, Labtest, Abbott) atendem os mesmos parametros analiticos. A vinculacao reagente-equipamento em comodato restringe indevidamente a competicao. |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Peticao na tabela | Tipo "Impugnacao", Status "Rascunho" |
| Duas peticoes na tabela | Esclarecimento + Impugnacao |

> **Diferenca do Conjunto 1:** testa ambos os tipos na mesma sessao (Esclarecimento + Impugnacao). Conteudo juridico especifico sobre platform lock-in de reagentes.

---

## UC-I03 — Gerar Peticao de Impugnacao

### Peticao alvo

| Campo | Valor |
|---|---|
| Peticao | Impugnacao criada no UC-I02 (restricao de plataforma) |
| Acao | Clicar no icone Eye para abrir o editor |

### Gerar via IA

| Acao | Descricao |
|---|---|
| Clicar | "Gerar Peticao" (icone Lightbulb) |
| Aguardar | IA gera documento completo |

### Secoes esperadas na peticao gerada

| Secao | Conteudo esperado |
|---|---|
| Qualificacao | Dados da RP3X Comercio e Representacoes Ltda., CNPJ 68.218.593/0001-09, distribuidora de reagentes |
| Fatos | Descricao da clausula que exige Sysmex XN-1000 exclusivamente, comodato vinculado |
| Direito | Art. 41 par.2 Lei 14.133/2021, Art. 5 Lei 12.462/2011, principio da isonomia |
| Jurisprudencias | Acordao TCU sobre direcionamento de marca em reagentes laboratoriais |
| Pedido | Alteracao do edital para aceitar reagentes compativeis com multiplas plataformas de analise hematologica |

### Fluxo de edicao e revisao

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Editar texto no TextArea (rows 18) | Texto 100% editavel |
| 2 | Adicionar trecho sobre shelf-life de 18 meses como argumento complementar | Texto salvo |
| 3 | Clicar "Salvar Rascunho" | Toast de sucesso |
| 4 | Clicar "Enviar para Revisao" | Status muda para "Em Revisao" |
| 5 | Exportar como PDF | Download do arquivo PDF |

> **Diferenca do Conjunto 1:** peticao sobre platform lock-in (comodato reagente-equipamento) em vez de questao puramente documental. Exercita o cenario de restricao de marca em reagentes.

---

## UC-I04 — Upload de Peticao Externa

### Upload de peticao elaborada externamente

| Campo | Valor |
|---|---|
| Aba | Peticoes |
| Acao | Clicar "Upload Peticao" |

### Modal "Upload de Peticao"

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematologicos |
| Arquivo | `tests/fixtures/teste_upload.pdf` |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Peticao na tabela | Tipo "Impugnacao", Status "Rascunho" |
| Total de peticoes na tabela | 3 (2 criadas + 1 upload) |

> **Diferenca do Conjunto 1:** upload feito apos ja existirem 2 peticoes na tabela — testa a lista com 3 itens.

---

## UC-I05 — Controle de Prazo

### Verificar prazos de impugnacao

| Campo | Valor |
|---|---|
| Aba | Prazos |
| Acao | Visualizar tabela de prazos |

### Dados esperados na tabela de prazos

| Edital | Orgao (exemplo) | Data Abertura | Prazo Limite (3d uteis) | Status esperado |
|---|---|---|---|---|
| Edital de reagentes hematologicos | Hospital Estadual ou Secretaria de Saude | (data do edital) | (3 dias uteis antes) | OK, Atencao ou Urgente |
| Edital de kit diagnostico | Laboratorio Central (LACEN) | (data do edital) | (3 dias uteis antes) | OK, Atencao ou Urgente |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Tabela de prazos carregada | Sim, com editais salvos |
| Coluna "Dias Restantes" | Valor numerico ou badge "EXPIRADO" |
| Coluna "Status" | Badge colorido: Urgente (vermelho), Atencao (amarelo), OK (verde), Expirado (vermelho) |
| Calculo automatico | 3 dias uteis antes da abertura (Art. 164 Lei 14.133/2021) |

> **Diferenca do Conjunto 1:** verificar que editais de reagentes e de kits diagnosticos aparecem simultaneamente na tabela de prazos com urgencias potencialmente diferentes.

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## UC-RE01 — Monitorar Janela de Recurso

### Configuracao de monitoramento

| Campo | Valor |
|---|---|
| Pagina | RecursosPage (`/app/recursos`) |
| Aba | Monitoramento |
| Edital | Selecionar edital de reagentes hematologicos |

### Canais de notificacao

| Canal | Valor |
|---|---|
| WhatsApp | Sim (marcar checkbox) |
| Email | Sim (marcar checkbox) |
| Alerta no sistema | Nao (deixar desmarcado) |

### Fluxo de monitoramento

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Selecionar edital no Select | Edital carregado |
| 2 | Marcar WhatsApp e Email, desmarcar Alerta no sistema | Checkboxes configurados |
| 3 | Clicar "Ativar Monitoramento" | Status muda para "Aguardando" |
| 4 | Aguardar deteccao de janela | Status muda para "JANELA ABERTA" (se janela aberta) |
| 5 | Clicar "Registrar Intencao de Recurso" | Intencao registrada, status atualizado |

> **Diferenca do Conjunto 1:** canal "Alerta no sistema" desativado (Conjunto 1 ativa todos os canais). Testa o cenario com apenas 2 canais habilitados.

---

## UC-RE02 — Analisar Proposta Vencedora

### Proposta vencedora para analise

| Campo | Valor |
|---|---|
| Aba | Analise |
| Edital | Edital de reagentes hematologicos |

### Texto da proposta vencedora (colar no TextArea)

```
PROPOSTA COMERCIAL — Labtest Diagnostica S.A.
CNPJ: 16.517.200/0001-72
Pregao Eletronico — Reagentes de Hematologia

Item 1: Kit de Reagentes para Hemograma Completo — Labtest LabMax 300
  Qtd: 50 CX | Valor Unit: R$ 1.720,00 | Total: R$ 86.000,00
  Prazo de validade: 18 meses | Armazenamento: 2-8C
  Compativel com: Mindray BC-6800, Labtest LabMax

Item 2: Reagente Diluente Isotonico — Labtest CellPack
  Qtd: 30 GL | Valor Unit: R$ 390,00 | Total: R$ 11.700,00

Item 3: Reagente Lisante — Labtest StromaLyse
  Qtd: 40 FR | Valor Unit: R$ 350,00 | Total: R$ 14.000,00

Item 4: Controle Hematologico — Labtest ControlCheck 3N
  Qtd: 20 KIT | Valor Unit: R$ 980,00 | Total: R$ 19.600,00

TOTAL: R$ 131.300,00
Prazo de entrega: 20 dias corridos
Condicao: Equipamento Mindray BC-6800 em comodato vinculado
Validade da proposta: 90 dias
```

### Inconsistencias esperadas na proposta

| # | Item | Inconsistencia | Motivacao Recurso | Gravidade |
|---|---|---|---|---|
| 1 | Compatibilidade de plataforma | Proposta oferece Mindray BC-6800 mas edital especificava Sysmex XN-1000 | Descumprimento do termo de referencia — plataforma incompativel | ALTA |
| 2 | Prazo de validade | Proposta informa 18 meses, edital exige 24 meses | Nao atende requisito de shelf-life minimo exigido | ALTA |
| 3 | Prazo de entrega | 20 dias corridos pode exceder o prazo do edital (15 dias) | Descumprimento de prazo de entrega | MEDIA |
| 4 | Comodato nao solicitado | Proposta inclui comodato de Mindray BC-6800 sem previsao editalicia | Inclusao de condicao nao prevista no edital — pode configurar vantagem indevida | MEDIA |
| 5 | Registro ANVISA | Nao consta numero de registro ANVISA dos reagentes na proposta | Ausencia de comprovacao regulatoria obrigatoria | BAIXA |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Card "Inconsistencias Identificadas" visivel | Sim, com tabela |
| Card "Analise Detalhada" visivel | Sim, com texto juridico |
| Badges de gravidade | ALTA (vermelho), MEDIA (amarelo), BAIXA (verde) |

> **Diferenca do Conjunto 1:** proposta da Labtest Diagnostica (concorrente nacional de reagentes), com inconsistencias sobre shelf-life, plataforma incompativel e comodato nao previsto. O Conjunto 1 analisa proposta de equipamento.

---

## UC-RE03 — Chatbox de Analise

### Perguntas sobre a proposta vencedora

| # | Pergunta | Resposta esperada (resumo) |
|---|---|---|
| 1 | "Os reagentes da Labtest sao compativeis com o analisador Sysmex XN-1000 exigido no edital?" | Resposta sobre incompatibilidade de plataforma — reagentes Labtest sao para Mindray |
| 2 | "O prazo de validade de 18 meses pode ser aceito se o edital exige 24?" | Analise juridica sobre possibilidade de recurso por shelf-life insuficiente |
| 3 | "A inclusao de equipamento em comodato pela vencedora configura vantagem indevida?" | Analise sobre comodato nao previsto no edital e impacto na isonomia |
| 4 | "A RP3X tem AFE ANVISA vigente para comercializar esses reagentes?" | Verificacao do status regulatorio da empresa |
| 5 | "Qual o risco de a comissao de licitacao aceitar reagentes com shelf-life menor?" | Analise de risco e precedentes |

### Fluxo de chat

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Digitar pergunta 1 no TextInput | Texto digitado |
| 2 | Clicar "Enviar" | Mensagem aparece na area de chat (direita) |
| 3 | Aguardar resposta da IA | "Pensando..." exibido, depois resposta (esquerda) |
| 4 | Digitar pergunta 2 | Conversa cumulativa |
| 5 | Repetir para perguntas 3 a 5 | Historico completo visivel |

> **Diferenca do Conjunto 1:** perguntas especificas sobre reagentes — compatibilidade de plataforma, shelf-life, comodato, AFE ANVISA. O Conjunto 1 pergunta sobre equipamentos.

---

## UC-RE04 — Gerar Laudo de Recurso

### Cenario 1 — Recurso Tecnico (shelf-life e plataforma)

| Campo | Valor |
|---|---|
| Aba | Laudos |
| Acao | Clicar "Novo Laudo" |

### Modal "Novo Laudo" — Recurso Tecnico

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematologicos |
| Tipo | Recurso |
| Subtipo | Tecnico |
| Template | Nenhum (em branco) |
| Empresa Alvo | Labtest Diagnostica S.A. |
| Conteudo Inicial | Recurso tecnico contra a proposta da Labtest Diagnostica: (1) reagentes incompativeis com plataforma Sysmex XN-1000 exigida; (2) shelf-life de 18 meses nao atende o minimo de 24 meses; (3) inclusao de comodato Mindray BC-6800 nao previsto no TR. |

### Secoes obrigatorias do laudo

| Secao | Conteudo esperado |
|---|---|
| SECAO JURIDICA | Art. 41 par.2 Lei 14.133/2021 (especificacao tecnica), Art. 71 (habilitacao tecnica), Acordao TCU sobre reagentes incompativeis |
| SECAO TECNICA | Incompatibilidade reagente-analisador (Labtest para Mindray vs Sysmex exigido), shelf-life 18 vs 24 meses, ausencia de registro ANVISA na proposta |

### Fluxo

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Criar laudo no modal | Laudo na tabela, Status "Rascunho" |
| 2 | Abrir editor (icone Eye) | Card "Editando: ... Recurso (Tecnico)" |
| 3 | Editar texto no TextArea (rows 20) | Incluir SECAO JURIDICA e SECAO TECNICA |
| 4 | Clicar "Salvar Rascunho" | Toast de sucesso |
| 5 | Clicar "Enviar para Revisao" | Status muda para "Revisao" |

### Cenario 2 — Recurso Administrativo (shelf-life excessivo no edital)

| Campo | Valor |
|---|---|
| Tipo | Recurso |
| Subtipo | Administrativo |
| Template | Nenhum (em branco) |
| Empresa Alvo | (deixar em branco — recurso contra o edital, nao contra concorrente) |
| Conteudo Inicial | Recurso administrativo contra a exigencia de shelf-life minimo de 24 meses para reagentes de hematologia. O padrao de mercado para kits de hemograma e de 18 meses conforme bulas dos fabricantes Sysmex, Wiener, Labtest e Abbott. A exigencia de 24 meses restringe indevidamente a competicao (Art. 75 Lei 14.133/2021). |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| 2 laudos na tabela | Recurso Tecnico + Recurso Administrativo |
| Empresa Alvo | "Labtest Diagnostica S.A." no primeiro, vazio no segundo |
| Status | Ambos iniciam como "Rascunho" |

> **Diferenca do Conjunto 1:** dois recursos (Tecnico + Administrativo) em vez de um unico. Recurso Administrativo contra o edital (sem empresa alvo) e cenario de borda — campo "Empresa Alvo" em branco.

---

## UC-RE05 — Gerar Laudo de Contra-Razao

### Contra-razao contra recurso da Wama Diagnostica

| Campo | Valor |
|---|---|
| Acao | Clicar "Novo Laudo" |

### Modal "Novo Laudo" — Contra-Razao

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematologicos |
| Tipo | Contra-Razao |
| Subtipo | Tecnico |
| Template | Nenhum (em branco) |
| Empresa Alvo | Wama Diagnostica Ltda. |
| Conteudo Inicial | Contra-razoes ao recurso interposto pela Wama Diagnostica, que alega que os reagentes RP3X Cientifica/Sysmex nao possuem demonstracao de equivalencia analitica. Refutamos: os reagentes Sysmex XN possuem registro ANVISA (10069330285), validacao conforme ISO 15189 e certificado de calibracao rastreavel ao padrao internacional ISLH. |

### Secoes obrigatorias

| Secao | Conteudo esperado |
|---|---|
| SECAO JURIDICA | Art. 71 Lei 14.133/2021, RDC 36/2015 ANVISA (IVD), ISO 15189 (laboratorios clinicos) |
| SECAO TECNICA | Registro ANVISA vigente, equivalencia analitica comprovada, certificacao ISO 15189, calibracao rastreavel |
| DEFESA | Refutacao do argumento de falta de equivalencia — RP3X apresenta todas as certificacoes exigidas |
| ATAQUE | Wama Diagnostica nao apresentou registro ANVISA do produto proposto na licitacao; reagentes Wama nao possuem certificacao ISO 15189 publicada |

### Fluxo

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Criar laudo no modal | Laudo na tabela, Tipo "Contra-Razao", Status "Rascunho" |
| 2 | Abrir editor (icone Eye) | Card "Editando: ... Contra-Razao (Tecnico)" |
| 3 | Editar texto incluindo DEFESA e ATAQUE | Secoes obrigatorias presentes |
| 4 | Clicar "Salvar Rascunho" | Toast de sucesso |
| 5 | Exportar como DOCX | Download do arquivo DOCX |

### Verificacoes apos UC-RE04 e UC-RE05

| Verificacao | Resultado esperado |
|---|---|
| Total de laudos na tabela | 3 (2 Recursos + 1 Contra-Razao) |
| Tipos distintos | Recurso Tecnico, Recurso Administrativo, Contra-Razao |
| Empresa Alvo | Labtest, (vazio), Wama |

> **Diferenca do Conjunto 1:** contra-razao contra Wama Diagnostica (outro concorrente de reagentes). Argumento tecnico sobre equivalencia analitica e certificacao ISO 15189 — especifico do mercado de diagnostico in vitro.

---

## UC-RE06 — Submissao Assistida no Portal

### Submissao do Recurso Tecnico

| Campo | Valor |
|---|---|
| Laudo | Recurso Tecnico (contra Labtest Diagnostica) |
| Acao | Abrir editor do laudo, clicar "Submeter no Portal" |

### Modal "Submissao Assistida no Portal"

| Secao | Verificacao |
|---|---|
| Dados da Peticao | Badge "RECURSO", edital e subtipo "Tecnico" corretos |
| Validacao Pre-Envio | Todas as 6 validacoes devem passar (tamanho, formato, prazo, secao juridica, secao tecnica, assinatura) |
| Resultado da validacao | "Todas as validacoes passaram" |

### Fluxo de submissao

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Verificar checklist de validacao | 6 checkboxes marcados |
| 2 | Clicar "Exportar PDF" | Download do PDF |
| 3 | Clicar "Abrir Portal ComprasNet" | Nova aba abre com link do portal gov.br |
| 4 | (Upload manual no portal) | — |
| 5 | Preencher Protocolo: `PNCP-2026-RP3X-REC-001` | Protocolo preenchido |
| 6 | Clicar "Registrar Submissao" | Mensagem "SUBMETIDO COM SUCESSO" |
| 7 | Clicar "Fechar" | Modal fecha |

### Verificacoes pos-submissao

| Verificacao | Resultado esperado |
|---|---|
| Status do laudo na tabela | "Protocolado" (badge info) |
| Protocolo salvo | PNCP-2026-RP3X-REC-001 |

### Cenario 2 — Submissao da Contra-Razao

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Abrir editor da Contra-Razao (Wama) | Card "Editando: ... Contra-Razao (Tecnico)" |
| 2 | Clicar "Enviar para Revisao" | Status muda para "Revisao" |
| 3 | Clicar "Submeter no Portal" | Modal abre |
| 4 | Verificar Badge | "CONTRA-RAZAO" |
| 5 | Exportar DOCX | Download do arquivo |
| 6 | Preencher Protocolo: `PNCP-2026-RP3X-CRA-001` | Protocolo preenchido |
| 7 | Clicar "Registrar Submissao" | "SUBMETIDO COM SUCESSO" |

> **Diferenca do Conjunto 1:** duas submissoes na mesma sessao (Recurso + Contra-Razao) com protocolos diferentes. Testa o fluxo de submissao multipla.

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## UC-FU01 — Registrar Resultado de Edital

### Cenario 1 — Vitoria em edital de reagentes

| Campo | Valor |
|---|---|
| Pagina | FollowupPage (`/app/followup`) |
| Aba | Resultados |
| Edital | Edital de reagentes hematologicos |

### Modal "Registrar Resultado"

| Campo | Valor |
|---|---|
| Tipo | Vitoria |
| Valor Final (R$) | 142.500,00 |
| Observacoes | Recurso tecnico contra Labtest Diagnostica foi deferido pela comissao. Proposta RP3X/Sysmex XN aceita integralmente. Contrato de fornecimento com entregas mensais fracionadas por 12 meses. Cadeia fria garantida com transportadora especializada. |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Edital sai da tabela Pendentes | Sim |
| Edital aparece em Resultados Registrados | Badge "Vitoria" (verde) |
| Stat Cards atualizados | Vitorias incrementado, Taxa de Sucesso recalculada |

### Cenario 2 — Derrota em edital de kits diagnosticos

| Campo | Valor |
|---|---|
| Edital | Edital de kit diagnostico laboratorio (segundo edital salvo) |

### Modal "Registrar Resultado"

| Campo | Valor |
|---|---|
| Tipo | Derrota |
| Valor Final (R$) | 38.200,00 |
| Empresa Vencedora | Wama Diagnostica Ltda. |
| Motivo da Derrota | Preco |
| Observacoes | Proposta RP3X ficou 12% acima do preco da Wama. Reagentes de glicose possuem margem apertada no mercado. Wama ofertou kit sem controle de qualidade incluso, reduzindo preco unitario. Avaliar ajuste de markup para proximos certames de bioquimica. |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Edital em Resultados Registrados | Badge "Derrota" (vermelho) |
| Empresa Vencedora registrada | "Wama Diagnostica Ltda." |
| Motivo | "Preco" |
| Stat Cards | Derrotas incrementado, Taxa de Sucesso recalculada |

> **Diferenca do Conjunto 1:** testa simultaneamente Vitoria e Derrota na mesma sessao, com dados distintos — permite verificar os Stat Cards recalculados com ambos os resultados. Motivo "Preco" (mais comum em reagentes) em vez de "Tecnico".

---

## UC-FU02 — Configurar Alertas de Vencimento

### Verificar alertas de vencimento

| Campo | Valor |
|---|---|
| Aba | Alertas |

### Summary Cards esperados

| Card | Valor esperado |
|---|---|
| Total | >= 1 (depende de contratos/ARPs cadastrados) |
| Critico (<7d) | 0 ou mais |
| Urgente (7-15d) | 0 ou mais |
| Atencao (15-30d) | 0 ou mais |
| Normal (>30d) | >= 1 (contrato de reagentes recem-registrado) |

### Dados esperados na tabela de vencimentos (apos vitoria registrada)

| Tipo | Nome | Data | Urgencia esperada |
|---|---|---|---|
| contrato | Contrato de reagentes hematologicos — RP3X/Sysmex XN | (12 meses apos data do edital) | Normal (verde, >30d) |
| arp | ARP de reagentes bioquimicos (se existir) | (conforme registro) | Variavel |

### Regras de alerta

| Verificacao | Resultado esperado |
|---|---|
| Tabela de regras | Exibe regras com colunas 30d, 15d, 7d, 1d, Email, Push, Ativo |
| Se sem regras | Mensagem "Nenhuma regra configurada..." |
| Botao "Atualizar" | Recarrega dados da tabela |

### Cenario de borda — sem vencimentos

| Verificacao | Resultado esperado |
|---|---|
| Se nenhum vencimento cadastrado | Mensagem "Nenhum vencimento nos proximos 90 dias" |

> **Diferenca do Conjunto 1:** foco em alertas para contrato de reagentes com entregas fracionadas mensais. A cadeia fria (2-8C) torna o monitoramento de vencimento mais critico para reagentes.

---

## UC-FU03 — Score Logistico

### Verificar score logistico

| Campo | Valor |
|---|---|
| Pagina | FollowupPage (`/app/followup`) |
| Elemento | Card Stat "Score Logistico" |

### Componentes do score para reagentes

| Componente | Valor esperado | Justificativa |
|---|---|---|
| Distancia | Media-Alta | RP3X em Ribeirao Preto/SP — distancia media para orgaos estaduais/municipais de SP, maior para outros estados |
| Prazo de entrega | Alto | 15 dias de prazo maximo configurado, adequado para a maioria dos certames |
| Capacidade produtiva | Alto | Distribuidora com estoque de reagentes — nao fabrica, revende com estoque |

### Verificacoes

| Verificacao | Resultado esperado |
|---|---|
| Score numerico exibido | Valor entre 0 e 100 (ou "N/A" se sem dados) |
| Componentes visiveis | Distancia, prazo, capacidade |
| Score subsidia decisao | Complementa o GO/NO-GO da ValidacaoPage |

### Interpretacao do score para reagentes

| Faixa | Significado |
|---|---|
| 80-100 | Alta viabilidade — entrega facil, estoque disponivel, cadeia fria controlada |
| 60-79 | Viabilidade media — pode exigir transportadora terceirizada para cadeia fria |
| 40-59 | Viabilidade baixa — distancia grande, risco de ruptura de cadeia fria |
| < 40 | Inviavel — logistica de cadeia fria comprometida, custo de frete alto |

> **Diferenca do Conjunto 1:** interpretacao do score considera logistica de cadeia fria (2-8C) e entregas fracionadas mensais, que sao criticos para reagentes mas nao para equipamentos.

---

## Dados Auxiliares — Fixtures e Arquivos

### Arquivos de teste recomendados

| Uso | Caminho sugerido | Alternativa |
|---|---|---|
| PDF generico (upload peticao) | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| DOCX simulado (upload peticao) | `tests/fixtures/teste_upload.pdf` | qualquer DOCX < 2 MB |

### Empresas concorrentes de referencia (setor diagnostico in vitro)

| Empresa | CNPJ (referencia) | Perfil |
|---|---|---|
| Labtest Diagnostica S.A. | 16.517.200/0001-72 | Nacional, forte em bioquimica e hematologia |
| Wama Diagnostica Ltda. | 04.302.631/0001-42 | Nacional, hematologia e imunologia |
| Siemens Healthineers | — | Multinacional, plataforma integrada |
| Beckman Coulter | — | Multinacional, hematologia premium |
| Abbott Diagnostics | — | Multinacional, bioquimica e imunologia |

### Legislacao de referencia (argumentos juridicos)

| Artigo | Tema |
|---|---|
| Art. 41 par.2 Lei 14.133/2021 | Vedacao a restricao de marca/plataforma no termo de referencia |
| Art. 75 Lei 14.133/2021 | Dispensacao incorreta — exigencia excessiva restritiva da competicao |
| Art. 67 par.1 Lei 14.133/2021 | Exigencia desproporcional de habilitacao (AFE especial) |
| Art. 40 par.5 Lei 14.133/2021 | Vinculacao reagente-equipamento (comodato) restringe competicao |
| Art. 164 Lei 14.133/2021 | Prazo de impugnacao: 3 dias uteis antes da abertura |
| Art. 71 Lei 14.133/2021 | Qualificacao tecnica — exigencia de registro ANVISA |
| RDC 36/2015 ANVISA | Regulamento tecnico de produtos para diagnostico in vitro (IVD) |
| RDC 16/2013 ANVISA | Boas praticas de fabricacao e distribuicao de produtos para saude |
| ISO 15189 | Laboratorios clinicos — requisitos de qualidade e competencia |

---

## Cenarios de Borda Cobertos por Este Conjunto

| Cenario | UC | Detalhe |
|---|---|---|
| Platform lock-in (comodato reagente-equipamento) | I01, I03 | Inconsistencia sobre vinculacao reagente-analisador |
| Shelf-life insuficiente (18 vs 24 meses) | I01, RE02, RE04 | Edital exige prazo de validade acima do padrao de mercado |
| AFE ANVISA desproporcional | I01, I02 | Exigencia de categoria especial nao prevista em norma |
| Cadeia fria (2-8C) em logistica | I01, FU03 | Impacto no prazo de entrega e score logistico |
| Dois tipos de peticao na mesma sessao | I02 | Esclarecimento + Impugnacao criados sequencialmente |
| 3 peticoes na tabela (2 criadas + 1 upload) | I04 | Lista maior que no Conjunto 1 |
| Canal "Alerta no sistema" desativado | RE01 | Apenas WhatsApp e Email ativos |
| Proposta de concorrente nacional (Labtest) | RE02, RE04 | Analise de reagentes incompativeis com plataforma |
| Recurso Tecnico + Recurso Administrativo | RE04 | Dois tipos de recurso na mesma sessao |
| Campo "Empresa Alvo" em branco | RE04 | Recurso contra o edital, nao contra concorrente |
| Contra-razao contra Wama Diagnostica | RE05 | Argumento sobre equivalencia analitica e ISO 15189 |
| Duas submissoes (Recurso + Contra-Razao) | RE06 | Protocolos diferentes na mesma sessao |
| Vitoria + Derrota registradas juntas | FU01 | Stat Cards recalculados com ambos os resultados |
| Motivo de derrota "Preco" | FU01 | Mais comum em reagentes (vs "Tecnico") |
| Score logistico com cadeia fria | FU03 | Interpretacao diferente para reagentes (risco de ruptura) |

---

## Notas para o Dono do Produto

1. **Fluxo completo sugerido para inspecao manual:** UC-I01 (analisar edital) -> UC-I02 (criar esclarecimento e impugnacao) -> UC-I03 (gerar peticao via IA) -> UC-I04 (upload peticao) -> UC-I05 (verificar prazos) -> UC-RE01 (ativar monitoramento) -> UC-RE02 (analisar proposta Labtest) -> UC-RE03 (chatbox com 5 perguntas) -> UC-RE04 (dois recursos: Tecnico + Administrativo) -> UC-RE05 (contra-razao Wama) -> UC-RE06 (submeter Recurso + Contra-Razao) -> UC-FU01 (registrar Vitoria + Derrota) -> UC-FU02 (alertas de vencimento) -> UC-FU03 (score logistico).
2. **Pre-requisitos obrigatorios:** empresa RP3X cadastrada (dadosempportpar-2.md) e editais salvos com status GO/Em Avaliacao (dadoscapval-2.md). Sem editais salvos, os selects de edital estarao vazios.
3. **Proposta vencedora:** o texto da proposta da Labtest deve ser colado integralmente no TextArea do UC-RE02. O conteudo inclui itens com precos, prazos e condicao de comodato para analise pela IA.
4. **Artigos da Lei 14.133/2021:** os artigos citados (41, 67, 75, 40, 164, 71) sao especificos para os cenarios de reagentes. Confirmar que a base de legislacao do sistema contem esses artigos.
5. **Concorrentes reais:** Labtest Diagnostica e Wama Diagnostica sao fabricantes/distribuidores reais do setor de diagnostico in vitro. Os CNPJs sao de referencia para preenchimento de campos.
6. **Cadeia fria:** reagentes exigem armazenamento e transporte a 2-8C. Isso impacta diretamente o score logistico (UC-FU03) e os riscos (UC-I01). O sistema deve detectar esse requisito como fator critico.
7. **Shelf-life de reagentes:** o padrao de mercado para kits de hematologia e bioquimica e 18 meses. Editais que exigem 24 meses restringem indevidamente a competicao — cenario exercitado nos UC-I01, RE02 e RE04.
8. **Empresa real:** RP3X Comercio e Representacoes Ltda. — CNPJ 68.218.593/0001-09 — ATIVA na Receita Federal desde 04/08/1992 — Ribeirao Preto/SP.
