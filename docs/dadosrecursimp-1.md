# Conjunto de Dados 1 — Recursos e Impugnacoes
# Validacao Automatizada e pelo Dono do Produto

**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Perfil:** Fornecedora de equipamentos medico-hospitalares para cirurgia, UTI, emergencia e diagnostico por imagem, atuante em licitacoes publicas via PNCP. Atua em impugnacoes, recursos administrativos e acompanhamento pos-resultado de editais.
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

### Pre-requisito: Dados das Sprints 1, 2 e 3

Os dados de empresa, portfolio, parametrizacoes (Sprint 1), captacao e validacao (Sprint 2) e precificacao e proposta (Sprint 3) devem estar cadastrados antes de executar os testes da Sprint 4. Os editais e produtos relevantes sao:

| Produto | Fabricante | NCM | Area |
|---|---|---|---|
| Monitor Multiparametrico Mindray iMEC10 Plus | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |
| Ultrassonografo Portatil Mindray M7T | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |

**Edital de referencia:** edital salvo na Sprint 2 (UC-CV03) contendo "monitor multiparametrico" ou "equipamento hospitalar" no objeto, com status GO definido na Sprint 2 (UC-CV08).

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## UC-I01 — Validacao Legal do Edital

### Selecao do Edital

| Acao | Descricao |
|---|---|
| Acessar | ImpugnacaoPage (`/app/impugnacao`) via menu lateral "Impugnacao" |
| Clicar aba | "Validacao Legal" (primeira aba) |
| Selecionar edital | Edital de "monitor multiparametrico" salvo na Sprint 2 |
| Clicar | Botao "Analisar Edital" (icone Search) |
| Aguardar | Processamento da IA (analise clausula por clausula) |

### Inconsistencias Esperadas (tipicas de edital de equipamento medico)

| # | Trecho do Edital | Lei Violada | Gravidade | Sugestao |
|---|---|---|---|---|
| 1 | "O equipamento devera ser da marca X ou similar" | Art. 41, Lei 14.133/2021 — Vedacao a direcionamento por marca | ALTA | Impugnacao |
| 2 | "Exige-se experiencia minima de 10 anos no fornecimento" | Art. 67, SS 1o, Lei 14.133/2021 — Qualificacao tecnica proporcional | ALTA | Impugnacao |
| 3 | "Prazo de entrega de 5 dias corridos para todo o territorio nacional" | Art. 40, XI, Lei 14.133/2021 — Condicoes incompativeis com o objeto | MEDIA | Esclarecimento |
| 4 | "Amostra devera ser entregue no prazo de 24 horas apos convocacao" | Art. 17, SS 3o, Lei 14.133/2021 — Prazo exiguo para amostra | MEDIA | Esclarecimento |
| 5 | "Registro ANVISA Classe III obrigatorio para monitor de sinais vitais" | Resolucao RDC 185/2001 — Classificacao de risco adequada | BAIXA | Esclarecimento |
| 6 | "Pagamento em 90 dias apos o aceite definitivo" | Art. 141, III, Lei 14.133/2021 — Prazo de pagamento excessivo | MEDIA | Impugnacao |

### Verificacoes

| Elemento | Verificacao |
|---|---|
| Card "Resultado da Analise" | Exibido apos processamento |
| Tabela de Inconsistencias | Linhas com #, Trecho, Lei Violada, Gravidade, Sugestao |
| Badges de Gravidade | ALTA (vermelho), MEDIA (amarelo), BAIXA (verde) |
| Badges de Sugestao | "Impugnacao" (error), "Esclarecimento" (info) |

---

## UC-I02 — Sugerir Esclarecimento ou Impugnacao

### Classificacao por Inconsistencia

| Acao | Descricao |
|---|---|
| Pre-condicao | Analise do UC-I01 concluida com inconsistencias listadas |
| Verificar | Cada inconsistencia tem sugestao de tipo: Impugnacao ou Esclarecimento |

### Criterios de Classificacao

| Inconsistencia | Tipo Sugerido | Justificativa |
|---|---|---|
| Direcionamento por marca (item 1) | Impugnacao | Violacao direta de principio da competitividade |
| Experiencia de 10 anos (item 2) | Impugnacao | Restricao desproporcional ao objeto |
| Prazo de entrega 5 dias (item 3) | Esclarecimento | Pode haver justificativa tecnica |
| Amostra em 24h (item 4) | Esclarecimento | Solicitar adequacao do prazo |
| Classificacao ANVISA (item 5) | Esclarecimento | Verificar se a classificacao esta correta |
| Pagamento 90 dias (item 6) | Impugnacao | Prazo abusivo, viola lei |

### Acao do Usuario

| Acao | Descricao |
|---|---|
| Alterar tipo | Mudar inconsistencia 3 de "Esclarecimento" para "Impugnacao" |
| Verificar | Tipo atualizado na tabela |
| Selecionar inconsistencias | Marcar itens 1, 2 e 6 para gerar peticao de impugnacao |
| Clicar | "Gerar Peticao" — navega para aba Peticoes |

---

## UC-I03 — Gerar Peticao de Impugnacao

### Dados da Peticao

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo | Impugnacao |
| Inconsistencias selecionadas | Itens 1, 2 e 6 do UC-I01 |
| Impugnante | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| CNPJ Impugnante | 43.712.232/0001-85 |
| Representante Legal | Diego Ricardo Munoz — Socio-Administrador |

### Estrutura Esperada da Peticao Gerada

| Secao | Conteudo Esperado |
|---|---|
| Cabecalho | "AO PREGOEIRO DO [ORGAO]" ou "A COMISSAO DE LICITACAO DO [ORGAO]" |
| Qualificacao | Dados da empresa impugnante (razao social, CNPJ, endereco, representante) |
| Dos Fatos | Descricao do edital, numero, objeto, data de publicacao |
| Do Direito — Ponto 1 | Direcionamento por marca — Art. 41 da Lei 14.133/2021, principio da isonomia e competitividade |
| Do Direito — Ponto 2 | Experiencia desproporcional — Art. 67, SS 1o da Lei 14.133/2021, jurisprudencia TCU Acordao 1636/2020 |
| Do Direito — Ponto 3 | Prazo de pagamento abusivo — Art. 141, III da Lei 14.133/2021 |
| Do Pedido | Solicitar alteracao das clausulas impugnadas |
| Fechamento | Local, data, assinatura do representante legal |

### Artigos e Jurisprudencia de Referencia

| Base Legal | Descricao |
|---|---|
| Art. 5o, Lei 14.133/2021 | Principios da legalidade, impessoalidade, moralidade, igualdade, competitividade |
| Art. 41, Lei 14.133/2021 | Vedacao a preferencia de marca |
| Art. 67, SS 1o, Lei 14.133/2021 | Qualificacao tecnica proporcional ao objeto |
| Art. 141, III, Lei 14.133/2021 | Prazo de pagamento |
| Art. 164, Lei 14.133/2021 | Direito de impugnacao do edital |
| Art. 172, Lei 14.133/2021 | Prazo para impugnacao |
| Acordao TCU 1636/2020 | Vedacao a exigencia de experiencia desproporcional |
| Acordao TCU 2100/2019 | Vedacao a direcionamento por marca em licitacoes |
| Sumula TCU 272 | Necessidade de justificativa tecnica para exigencias restritivas |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Clicar | "Gerar Peticao" na aba Peticoes |
| Aguardar | IA gera peticao com base nas inconsistencias selecionadas |
| Verificar | Texto da peticao exibido em card com formatacao juridica |
| Editar | Opcionalmente alterar texto da peticao no editor |
| Download | Clicar "Baixar PDF" — salva peticao como PDF |

---

## UC-I04 — Upload de Peticao Externa

### Dados do Upload

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo de Peticao | Impugnacao |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Descricao | Peticao de impugnacao elaborada pelo departamento juridico externo |
| Data de Elaboracao | 2026-04-01 |
| Autor | Dr. Marcos Aurelio Pinto — OAB/SP 123.456 |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Acessar | Aba "Peticoes" na ImpugnacaoPage |
| Clicar | "Upload de Peticao" |
| Selecionar arquivo | `tests/fixtures/teste_upload.pdf` |
| Preencher descricao | "Peticao de impugnacao elaborada pelo departamento juridico externo" |
| Clicar | "Enviar" |
| Verificar | Arquivo aparece na lista de peticoes com badge "Externa" |
| Verificar | Botao "Visualizar" disponivel na linha da peticao |

---

## UC-I05 — Controle de Prazo

### Dados de Prazo

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Data de abertura do edital | 2026-04-15 (exemplo) |
| Prazo para impugnacao | Ate 3 dias uteis antes da abertura = 2026-04-10 |
| Data atual simulada | 2026-04-08 |
| Dias restantes | 2 dias uteis |

### Verificacoes

| Elemento | Verificacao |
|---|---|
| Aba "Prazos" | Exibe timeline visual do edital |
| Card "Prazo de Impugnacao" | Data limite: 2026-04-10 |
| Alerta de prazo | Badge "Urgente" (amarelo ou vermelho) quando faltam <= 3 dias uteis |
| Countdown | Contador regressivo exibido (dias, horas) |
| Status | "Dentro do prazo" (verde) ou "Prazo encerrado" (vermelho) |

### Cenario Prazo Encerrado

| Campo | Valor |
|---|---|
| Data de abertura | 2026-04-05 (data passada) |
| Prazo impugnacao | 2026-04-02 (expirado) |
| Status esperado | "Prazo encerrado" — badge vermelho |
| Acao bloqueada | Botao "Gerar Peticao" desabilitado com tooltip "Prazo de impugnacao encerrado" |

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## UC-RE01 — Monitorar Janela de Recurso

### Dados da Janela de Recurso

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Pagina | RecursosPage (`/app/recursos`) |
| Data de abertura da sessao | 2026-04-15 |
| Data do resultado (adjudicacao) | 2026-04-16 |
| Inicio da janela de recurso | 2026-04-16 (imediato apos resultado) |
| Prazo para intencao de recurso | 2026-04-17 (1 dia util — pregao eletronico) |
| Prazo para razoes de recurso | 2026-04-21 (3 dias uteis apos intencao) |
| Prazo para contra-razoes | 2026-04-24 (3 dias uteis apos razoes) |
| Decisao da autoridade | 2026-04-28 (5 dias uteis apos contra-razoes) |

### Timeline Visual Esperada

| Etapa | Data | Status |
|---|---|---|
| Resultado / Adjudicacao | 2026-04-16 | Concluido (verde) |
| Intencao de Recurso | 2026-04-17 | Em andamento (azul) ou Concluido |
| Razoes de Recurso | 2026-04-21 | Pendente (cinza) ou Em andamento |
| Contra-Razoes | 2026-04-24 | Pendente (cinza) |
| Decisao | 2026-04-28 | Pendente (cinza) |

### Verificacoes

| Elemento | Verificacao |
|---|---|
| Acessar | RecursosPage (`/app/recursos`) via menu lateral "Recursos" |
| Selecionar edital | Edital de "monitor multiparametrico" no select |
| Timeline | 5 etapas com datas e status visuais |
| Countdown | Contador regressivo para proxima etapa |
| Alerta | Badge de alerta quando prazo <= 1 dia util |

---

## UC-RE02 — Analisar Proposta Vencedora

### Dados do Concorrente Vencedor

| Campo | Valor |
|---|---|
| Empresa Vencedora | MedTech Solutions Equipamentos Ltda. |
| CNPJ Vencedora | 12.345.678/0001-90 |
| Item | Monitor Multiparametrico 12 parametros |
| Preco Vencedor (unitario) | R$ 16.800,00 |
| Preco Nossa Proposta (unitario) | R$ 18.200,00 |
| Diferenca | R$ 1.400,00 (7,7% acima) |

### Comparativo de Precos

| Item | Nossa Proposta | Proposta Vencedora | Diferenca |
|---|---|---|---|
| Monitor Multiparametrico 12 param. | R$ 18.200,00 | R$ 16.800,00 | +7,7% |
| Cabo ECG 5 vias | R$ 380,00 | R$ 310,00 | +22,6% |
| Sensor SpO2 adulto | R$ 290,00 | R$ 250,00 | +16,0% |
| Suporte com rodizios | R$ 980,00 | R$ 870,00 | +12,6% |
| **Valor Total (10 monitores + acessorios)** | **R$ 198.500,00** | **R$ 183.300,00** | **+8,3%** |

### Comparativo Tecnico

| Requisito do Edital | Nossa Proposta | Proposta Vencedora | Conformidade |
|---|---|---|---|
| Tela >= 12 polegadas | 12,1" TFT Touch | 10,4" LCD | Vencedora NAO atende |
| Minimo 10 parametros | 10 parametros | 8 parametros | Vencedora NAO atende |
| EtCO2 integrado | Sim | Nao (modulo opcional) | Vencedora NAO atende |
| Bateria >= 4 horas | 6 horas | 3 horas | Vencedora NAO atende |
| Registro ANVISA | 80262090001 | 80345120003 | Ambas atendem |
| SpO2 com curva | Sim | Sim | Ambas atendem |
| ECG 12 derivacoes | Sim | Sim (5 derivacoes) | Vencedora NAO atende |
| Peso <= 5 kg | 4,1 kg | 4,8 kg | Ambas atendem |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Acessar | RecursosPage, selecionar edital |
| Clicar | "Analisar Proposta Vencedora" |
| Verificar | Card com dados do concorrente vencedor |
| Verificar | Tabela comparativa de precos |
| Verificar | Tabela comparativa tecnica com badges "Atende" (verde) / "Nao Atende" (vermelho) |
| Resultado | IA identifica que proposta vencedora tem deficiencias tecnicas — recomenda recurso |

---

## UC-RE03 — Chatbox de Analise

### Perguntas de Teste

| Pergunta | Resposta Esperada |
|---|---|
| "O edital exige marca especifica?" | Resposta indicando se ha exigencia de marca e se viola Art. 41 da Lei 14.133/2021 |
| "Qual o prazo de entrega exigido?" | Resposta com prazo extraido do edital (ex: "30 dias corridos apos emissao da ordem de compra") |
| "A proposta vencedora atende todos os requisitos tecnicos?" | Resposta detalhando pontos de nao conformidade identificados no comparativo |
| "Quais artigos da Lei 14.133 fundamentam um recurso neste caso?" | Resposta citando Art. 165 (direito de recurso), Art. 59 (julgamento de propostas), Art. 41 (vedacao de marca) |
| "O preco da proposta vencedora e inexequivel?" | Analise de exequibilidade comparando com referencia de mercado |
| "Qual a jurisprudencia do TCU sobre proposta com especificacao tecnica inferior?" | Resposta com acordaos relevantes (ex: Acordao 2831/2019, Acordao 1216/2020) |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Acessar | Chatbox na RecursosPage |
| Digitar pergunta | "O edital exige marca especifica?" |
| Enviar | Clicar botao enviar ou pressionar Enter |
| Verificar | Resposta da IA exibida no chat com formatacao (markdown) |
| Continuar | Fazer segunda pergunta sem perder contexto da conversa |

---

## UC-RE04 — Gerar Laudo de Recurso

### Dados para Geracao do Laudo

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo de Laudo | Recurso Administrativo |
| Recorrente | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| CNPJ Recorrente | 43.712.232/0001-85 |
| Representante Legal | Diego Ricardo Munoz — Socio-Administrador |
| Motivo do Recurso | Proposta vencedora nao atende requisitos tecnicos minimos do edital |

### Fundamentos do Recurso

| Ponto | Fundamento | Base Legal |
|---|---|---|
| 1 | Tela do monitor vencedor (10,4") nao atende requisito minimo de 12" | Art. 59, SS 1o, Lei 14.133/2021 — Desclassificacao de proposta nao conforme |
| 2 | Monitor vencedor tem apenas 8 parametros, edital exige minimo de 10 | Art. 59, SS 1o, Lei 14.133/2021 |
| 3 | EtCO2 nao integrado na proposta vencedora, edital exige EtCO2 integrado | Acordao TCU 2831/2019 — Obrigatoriedade de atendimento integral |
| 4 | Bateria de 3 horas nao atende requisito de >= 4 horas | Art. 12, Lei 14.133/2021 — Especificacoes tecnicas do termo de referencia |
| 5 | ECG com 5 derivacoes nao atende requisito de 12 derivacoes | Art. 59, SS 1o, Lei 14.133/2021 |

### Estrutura Esperada do Laudo

| Secao | Conteudo |
|---|---|
| Cabecalho | "AO PREGOEIRO / A COMISSAO DE LICITACAO" |
| Qualificacao do Recorrente | Razao social, CNPJ, endereco, representante legal |
| Dos Fatos | Descricao da sessao, resultado, proposta vencedora |
| Da Analise Tecnica | Comparativo item a item mostrando nao conformidades |
| Do Direito | Artigos da Lei 14.133/2021 e jurisprudencia TCU |
| Do Pedido | Desclassificacao da proposta vencedora e reclassificacao |
| Fechamento | Local, data, assinatura |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Clicar | "Gerar Laudo de Recurso" na RecursosPage |
| Aguardar | IA gera laudo com base no comparativo e legislacao |
| Verificar | Laudo exibido em card com formatacao juridica |
| Editar | Opcionalmente ajustar texto do laudo |
| Download | Clicar "Baixar PDF" |

---

## UC-RE05 — Gerar Laudo de Contra-Razao

### Cenario: CH Hospitalar e a vencedora e precisa se defender de recurso

| Campo | Valor |
|---|---|
| Edital | Edital de "ultrassonografo portatil" (segundo edital salvo) |
| Tipo de Laudo | Contra-Razao de Recurso |
| Contra-Arrazoante | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| CNPJ | 43.712.232/0001-85 |
| Recorrente (adversario) | BioEquip Distribuidora de Equipamentos Medicos S.A. |
| Motivo do Recurso do Adversario | Alega que preco da CH Hospitalar e inexequivel |

### Argumentos de Defesa

| Ponto | Argumento | Base Legal |
|---|---|---|
| 1 | Preco ofertado e compativel com notas fiscais anteriores de vendas ao setor publico | Art. 59, SS 4o, Lei 14.133/2021 — Demonstracao de exequibilidade |
| 2 | Empresa possui contrato vigente com outro orgao pelo mesmo valor unitario | Acordao TCU 1442/2018 — Preco exequivel comprovado por historico |
| 3 | Planilha de composicao de custos demonstra margem de lucro positiva | Art. 59, SS 2o, Lei 14.133/2021 |
| 4 | Fabricante Mindray fornece nota de credito por volume que justifica desconto | Documentacao comprobatoria do fabricante |

### Estrutura Esperada do Laudo

| Secao | Conteudo |
|---|---|
| Cabecalho | "AO PREGOEIRO / A COMISSAO DE LICITACAO" |
| Qualificacao do Contra-Arrazoante | Razao social, CNPJ, endereco, representante legal |
| Dos Fatos | Descricao do recurso interposto pelo adversario |
| Da Defesa | Refutacao ponto a ponto dos argumentos do recorrente |
| Das Provas | Notas fiscais, contratos vigentes, planilha de custos |
| Do Pedido | Manutencao da adjudicacao em favor da CH Hospitalar |
| Fechamento | Local, data, assinatura |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "ultrassonografo portatil" |
| Clicar | "Gerar Laudo de Contra-Razao" na RecursosPage |
| Aguardar | IA gera contra-razao com base nos dados disponiveis |
| Verificar | Laudo exibido com secoes de defesa e provas |
| Download | Clicar "Baixar PDF" |

---

## UC-RE06 — Submissao Assistida no Portal

### Dados para Submissao

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo de Submissao | Recurso Administrativo |
| Arquivo do Laudo | Laudo gerado no UC-RE04 (ou `tests/fixtures/teste_upload.pdf`) |
| Portal de destino | ComprasNet / PNCP |

### Documentos Anexos

| # | Documento | Arquivo |
|---|---|---|
| 1 | Laudo de Recurso | PDF gerado no UC-RE04 |
| 2 | Procuracao do Representante Legal | `tests/fixtures/teste_upload.pdf` |
| 3 | Documentos comprobatorios | `tests/fixtures/teste_upload.pdf` |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Clicar | "Submissao Assistida" na RecursosPage |
| Selecionar tipo | "Recurso Administrativo" |
| Upload laudo | Selecionar arquivo do laudo (ou `tests/fixtures/teste_upload.pdf`) |
| Upload anexos | Adicionar procuracao e documentos comprobatorios |
| Verificar checklist | Lista de verificacao pre-submissao (prazo OK, documentos OK, assinatura OK) |
| Clicar | "Preparar Submissao" |
| Verificar | Instrucoes passo-a-passo para submissao no portal exibidas em card |

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## UC-FU01 — Registrar Resultado de Edital

### Cenario 1 — Edital Ganho

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" |
| Pagina | FollowupPage (`/app/followup`) |
| Resultado | Ganho |
| Valor Homologado | R$ 183.300,00 |
| Valor da Nossa Proposta | R$ 198.500,00 |
| Desconto Final | 7,7% |
| Motivo | Recurso acatado — proposta concorrente desclassificada por nao atender requisitos tecnicos |
| Licoes Aprendidas | "Analise tecnica detalhada da proposta concorrente foi decisiva. Manter banco de dados de especificacoes tecnicas dos concorrentes para futuras analises." |
| Data do Resultado | 2026-04-28 |

### Cenario 2 — Edital Perdido

| Campo | Valor |
|---|---|
| Edital | Edital de "ultrassonografo portatil" (segundo edital) |
| Resultado | Perdido |
| Valor da Proposta Vencedora | R$ 142.000,00 |
| Valor da Nossa Proposta | R$ 168.500,00 |
| Diferenca | 18,7% acima |
| Motivo | Preco nao competitivo — concorrente com contrato de distribuicao exclusiva obteve desconto de volume |
| Licoes Aprendidas | "Negociar condicoes de volume diretamente com o fabricante antes de cotar. Avaliar parcerias com distribuidores regionais para reduzir custo logistico." |
| Data do Resultado | 2026-04-25 |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Acessar | FollowupPage (`/app/followup`) via menu lateral "Followup" |
| Selecionar edital | Edital de "monitor multiparametrico" |
| Clicar | "Registrar Resultado" |
| Selecionar | Radio "Ganho" |
| Preencher | Valor homologado, motivo, licoes aprendidas |
| Salvar | Clicar "Salvar Resultado" |
| Verificar | Badge "Ganho" (verde) na linha do edital |
| Repetir | Para segundo edital com resultado "Perdido" |

---

## UC-FU02 — Configurar Alertas de Vencimento

### Alertas para Edital Ganho (Cenario 1 do UC-FU01)

| Tipo de Alerta | Data de Vencimento | Antecedencia 1 | Antecedencia 2 | Antecedencia 3 |
|---|---|---|---|---|
| Contrato | 2027-04-28 (1 ano) | 90 dias antes | 30 dias antes | 7 dias antes |
| Ata de Registro de Precos (ARP) | 2027-04-28 (1 ano) | 60 dias antes | 30 dias antes | 15 dias antes |
| Garantia Contratual | 2026-07-28 (3 meses) | 30 dias antes | 15 dias antes | 5 dias antes |
| Garantia do Equipamento | 2028-04-28 (2 anos) | 90 dias antes | 30 dias antes | 7 dias antes |
| Certificado ANVISA | 2027-12-31 | 60 dias antes | 30 dias antes | 15 dias antes |

### Canais de Notificacao

| Canal | Ativo |
|---|---|
| Email (licitacoes@chhospitalar.com.br) | Sim |
| Notificacao no sistema | Sim |
| SMS | Nao |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital ganho de "monitor multiparametrico" |
| Clicar | "Configurar Alertas" na FollowupPage |
| Preencher | Tipo: Contrato, Data: 2027-04-28, Antecedencias: 90, 30, 7 dias |
| Adicionar | Segundo alerta: ARP, 2027-04-28, antecedencias: 60, 30, 15 dias |
| Adicionar | Terceiro alerta: Garantia Contratual, 2026-07-28, antecedencias: 30, 15, 5 dias |
| Salvar | Clicar "Salvar Alertas" |
| Verificar | Lista de alertas configurados com datas e antecedencias |
| Verificar | Alertas proximos exibidos no Dashboard com badge de urgencia |

---

## UC-FU03 — Score Logistico

### Dados de Performance Historica

| Indicador | Valor | Peso |
|---|---|---|
| Entregas no prazo (ultimos 12 meses) | 92% (23 de 25 entregas) | 0.30 |
| Entregas com avaria | 4% (1 de 25 entregas) | 0.20 |
| Tempo medio de entrega (dias) | 18 dias (prazo contratual: 30 dias) | 0.20 |
| Devolucoes / Trocas | 8% (2 de 25 entregas) | 0.15 |
| Satisfacao do contratante (NPS) | 8.2 / 10 | 0.15 |

### Score Logistico Calculado

| Dimensao | Score | Classificacao |
|---|---|---|
| Pontualidade | 92% | Excelente (verde) |
| Integridade | 96% | Excelente (verde) |
| Eficiencia | 85% (18/30 dias = 40% de folga) | Bom (verde) |
| Qualidade | 92% | Excelente (verde) |
| Satisfacao | 82% | Bom (verde) |
| **Score Logistico Final** | **89%** | **Excelente** |

### Acoes do Usuario

| Acao | Descricao |
|---|---|
| Acessar | FollowupPage, selecionar edital ganho |
| Clicar | "Score Logistico" |
| Verificar | Card com indicadores historicos |
| Verificar | Grafico radar com 5 dimensoes |
| Verificar | Score final com classificacao (Excelente/Bom/Regular/Ruim) |
| Verificar | Recomendacoes da IA para melhoria logistica |

---

## Dados Auxiliares — Fixtures e Arquivos

### Arquivos de teste recomendados

| Uso | Caminho | Alternativa |
|---|---|---|
| Peticao de impugnacao (upload externo) | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Laudo de recurso (upload) | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Laudo de contra-razao (upload) | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Procuracao do representante legal | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Documentos comprobatorios | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |

### Rotas das Paginas

| Pagina | Rota | Menu Lateral |
|---|---|---|
| ImpugnacaoPage | `/app/impugnacao` | Impugnacao |
| RecursosPage | `/app/recursos` | Recursos |
| FollowupPage | `/app/followup` | Followup |

---

## Notas para Validacao

1. **Dependencia de Sprints anteriores:** os testes da Sprint 4 dependem de editais salvos (Sprint 2) e propostas geradas (Sprint 3). Executar Sprints 1-3 antes.
2. **Edital de referencia:** usar o edital de "monitor multiparametrico" salvo no UC-CV03 da Sprint 2. Se nao disponivel, salvar um novo edital com busca por "monitor multiparametrico" na CaptacaoPage.
3. **Analise legal (UC-I01):** os resultados da IA variam conforme o texto do edital. As inconsistencias listadas neste documento sao representativas do tipo esperado.
4. **Geracao de peticoes e laudos (UC-I03, UC-RE04, UC-RE05):** a IA gera textos juridicos com base no contexto. O validador deve verificar a presenca das secoes obrigatorias (cabecalho, qualificacao, fatos, direito, pedido, fechamento).
5. **Comparativo tecnico (UC-RE02):** os dados do concorrente sao simulados para fins de validacao. Em producao, a proposta vencedora sera carregada do portal de compras.
6. **Chatbox (UC-RE03):** o chat mantem contexto da conversa. Fazer perguntas em sequencia para validar a retencao de contexto.
7. **Prazos (UC-I05, UC-RE01):** as datas sao exemplos. O sistema deve calcular prazos com base na data de abertura real do edital.
8. **Score Logistico (UC-FU03):** os dados de performance sao simulados. Em producao, serao alimentados pelo historico real de entregas da empresa.
9. **Arquivo de teste para uploads:** usar `tests/fixtures/teste_upload.pdf` como substituto de qualquer PDF.
10. **Ordem de execucao recomendada:** UC-I01 a UC-I05 (Impugnacao), depois UC-RE01 a UC-RE06 (Recursos), depois UC-FU01 a UC-FU03 (Followup). A Fase 2 pode ser executada em paralelo com a Fase 1, mas a Fase 3 depende de resultados registrados.
